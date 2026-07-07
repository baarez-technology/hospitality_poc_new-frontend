// Sample Pricing Rules Data
// Rules engine configuration for dynamic pricing

export const conditionTypes = [
  { id: 'occupancy_above', label: 'Occupancy Above', unit: '%', type: 'number' },
  { id: 'occupancy_below', label: 'Occupancy Below', unit: '%', type: 'number' },
  { id: 'pickup_above', label: 'Pickup Pace Above', unit: '%', type: 'number' },
  { id: 'pickup_below', label: 'Pickup Pace Below', unit: '%', type: 'number' },
  { id: 'competitor_higher', label: 'Competitor Avg Higher By', unit: '%', type: 'number' },
  { id: 'competitor_lower', label: 'Competitor Avg Lower By', unit: '%', type: 'number' },
  { id: 'days_to_arrival', label: 'Days to Arrival', unit: 'days', type: 'range' },
  { id: 'day_of_week', label: 'Day of Week', unit: '', type: 'select', options: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] },
  { id: 'demand_level', label: 'Demand Level', unit: '', type: 'select', options: ['compression', 'high', 'normal', 'low', 'very_low'] },
  { id: 'segment', label: 'Segment', unit: '', type: 'select', options: ['corporate', 'ota', 'direct', 'longstay', 'repeat', 'groups'] },
  { id: 'event_active', label: 'Event Active', unit: '', type: 'boolean' },
  { id: 'room_type', label: 'Room Type', unit: '', type: 'select', options: ['STD', 'DLX', 'SUP', 'EXE', 'PRS', 'ALL'] },
];

export const actionTypes = [
  { id: 'increase_percent', label: 'Increase Rate By', unit: '%', type: 'number' },
  { id: 'decrease_percent', label: 'Decrease Rate By', unit: '%', type: 'number' },
  { id: 'set_rate', label: 'Set Rate To', unit: '₹', type: 'number' },
  { id: 'set_min_rate', label: 'Set Minimum Rate', unit: '₹', type: 'number' },
  { id: 'set_max_rate', label: 'Set Maximum Rate', unit: '₹', type: 'number' },
  { id: 'apply_min_stay', label: 'Apply Min Stay', unit: 'nights', type: 'number' },
  { id: 'apply_cta', label: 'Close to Arrival', unit: '', type: 'boolean' },
  { id: 'apply_ctd', label: 'Close to Departure', unit: '', type: 'boolean' },
  { id: 'apply_stop_sell', label: 'Stop Sell', unit: '', type: 'boolean' },
];

// Pricing rules — hardcoded samples removed; data now comes from API.
export const sampleRules: any[] = [];

// Rule evaluation functions
export function evaluateCondition(condition, context) {
  const { type, value } = condition;

  switch (type) {
    case 'occupancy_above':
      return context.occupancy > value;
    case 'occupancy_below':
      return context.occupancy < value;
    case 'pickup_above':
      return context.pickupPace > value;
    case 'pickup_below':
      return context.pickupPace < value;
    case 'competitor_higher':
      return context.competitorGap > value;
    case 'competitor_lower':
      return context.competitorGap < -value;
    case 'days_to_arrival':
      return context.daysOut >= value.min && context.daysOut <= value.max;
    case 'day_of_week':
      const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      return value.includes(dayNames[context.dayOfWeek]);
    case 'demand_level':
      return context.demandLevel === value;
    case 'segment':
      return context.segment === value;
    case 'event_active':
      return context.hasEvent === value;
    case 'room_type':
      return value === 'ALL' || context.roomType === value;
    default:
      return false;
  }
}

export function evaluateRule(rule, context) {
  // Check if rule applies to this room type (empty/missing roomTypes = apply to ALL)
  const roomTypes = rule.roomTypes;
  const appliesToRoom =
    !Array.isArray(roomTypes) ||
    roomTypes.length === 0 ||
    roomTypes.includes('ALL') ||
    roomTypes.includes(context.roomType);
  if (!appliesToRoom) {
    return { applies: false, rule };
  }

  // Evaluate all conditions (AND logic)
  const allConditionsMet = rule.conditions.every(cond =>
    evaluateCondition(cond, context)
  );

  return {
    applies: allConditionsMet,
    rule,
    priority: rule.priority,
  };
}

export function applyRuleActions(actions, baseRate) {
  let finalRate = baseRate;
  let restrictions = {};
  let minRate = null;
  let maxRate = null;

  actions.forEach(action => {
    switch (action.type) {
      case 'increase_percent':
        finalRate = Math.round(finalRate * (1 + action.value / 100));
        break;
      case 'decrease_percent':
        finalRate = Math.round(finalRate * (1 - action.value / 100));
        break;
      case 'set_rate':
        finalRate = action.value;
        break;
      case 'set_min_rate':
        minRate = action.value;
        break;
      case 'set_max_rate':
        maxRate = action.value;
        break;
      case 'apply_min_stay':
        restrictions.minStay = action.value;
        break;
      case 'apply_cta':
        restrictions.CTA = action.value;
        break;
      case 'apply_ctd':
        restrictions.CTD = action.value;
        break;
      case 'apply_stop_sell':
        restrictions.stopSell = action.value;
        break;
    }
  });

  // Apply min/max constraints
  if (minRate !== null) finalRate = Math.max(finalRate, minRate);
  if (maxRate !== null) finalRate = Math.min(finalRate, maxRate);

  return { finalRate, restrictions };
}

// Get rules that would apply for a given context
export function getApplicableRules(rules, context) {
  // Safety check - ensure rules is an array
  if (!Array.isArray(rules)) {
    return [];
  }
  return rules
    .filter(rule => rule.isActive)
    .map(rule => evaluateRule(rule, context))
    .filter(result => result.applies)
    .sort((a, b) => a.priority - b.priority);
}

// Calculate final rate after applying all rules
export function calculateRuleBasedRate(rules, baseRate, context) {
  const applicableRules = getApplicableRules(rules, context);

  if (applicableRules.length === 0) {
    return { rate: baseRate, appliedRules: [], restrictions: {} };
  }

  let currentRate = baseRate;
  let allRestrictions = {};
  const appliedRules = [];

  // Apply rules in priority order
  applicableRules.forEach(result => {
    const { finalRate, restrictions } = applyRuleActions(result.rule.actions, currentRate);
    currentRate = finalRate;
    allRestrictions = { ...allRestrictions, ...restrictions };
    appliedRules.push({
      ruleId: result.rule.id,
      ruleName: result.rule.name,
      adjustment: finalRate - baseRate,
    });
  });

  return {
    rate: currentRate,
    appliedRules,
    restrictions: allRestrictions,
    originalRate: baseRate,
    totalAdjustment: currentRate - baseRate,
    adjustmentPercent: Math.round(((currentRate - baseRate) / baseRate) * 100),
  };
}

// Rule performance analytics
export function getRuleAnalytics(rules) {
  // Safety check - ensure rules is an array
  if (!Array.isArray(rules) || rules.length === 0) {
    return {
      totalRules: 0,
      activeRules: 0,
      inactiveRules: 0,
      totalTriggers: 0,
      avgTriggersPerRule: 0,
      mostTriggered: [],
      leastTriggered: [],
      byPriority: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
    };
  }

  const activeRules = rules.filter(r => r.isActive);
  const totalTriggers = rules.reduce((sum, r) => sum + (r.timesTriggered || 0), 0);

  return {
    totalRules: rules.length,
    activeRules: activeRules.length,
    inactiveRules: rules.length - activeRules.length,
    totalTriggers,
    avgTriggersPerRule: Math.round(totalTriggers / rules.length),
    mostTriggered: [...rules].sort((a, b) => (b.timesTriggered || 0) - (a.timesTriggered || 0)).slice(0, 5),
    leastTriggered: [...rules].sort((a, b) => (a.timesTriggered || 0) - (b.timesTriggered || 0)).slice(0, 5),
    byPriority: {
      1: rules.filter(r => r.priority === 1).length,
      2: rules.filter(r => r.priority === 2).length,
      3: rules.filter(r => r.priority === 3).length,
      4: rules.filter(r => r.priority === 4).length,
      5: rules.filter(r => r.priority === 5).length,
    },
  };
}

export const ruleAnalytics = getRuleAnalytics(sampleRules);

export default sampleRules;
