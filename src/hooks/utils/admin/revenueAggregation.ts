/**
 * Revenue Aggregation Utilities
 * Sum, average, and aggregate revenue metrics
 */

/**
 * Sum array of values
 */
export function sum(array, key = null) {
  if (!array || array.length === 0) return 0;

  if (key) {
    return array.reduce((total, item) => total + (item[key] || 0), 0);
  }

  return array.reduce((total, value) => total + value, 0);
}

/**
 * Calculate average
 */
export function average(array, key = null) {
  if (!array || array.length === 0) return 0;

  const total = sum(array, key);
  return total / array.length;
}

/**
 * Aggregate revenue by segment
 */
export function aggregateBySegment(data, segmentKey = 'segment') {
  const aggregated = {};

  data.forEach(item => {
    const segment = item[segmentKey];

    if (!aggregated[segment]) {
      aggregated[segment] = {
        revenue: 0,
        rooms: 0,
        count: 0
      };
    }

    aggregated[segment].revenue += item.revenue || 0;
    aggregated[segment].rooms += item.rooms || 0;
    aggregated[segment].count += 1;
  });

  // Calculate ADR for each segment
  Object.keys(aggregated).forEach(segment => {
    const data = aggregated[segment];
    data.adr = data.rooms > 0 ? Math.round(data.revenue / data.rooms) : 0;
    data.avgRevenue = Math.round(data.revenue / data.count);
  });

  return aggregated;
}

/**
 * Aggregate revenue by channel
 */
export function aggregateByChannel(data, channelKey = 'channel') {
  return aggregateBySegment(data, channelKey);
}

/**
 * Aggregate revenue by date range
 */
export function aggregateByDateRange(data, startDate, endDate) {
  const start = new Date(startDate);
  const end = new Date(endDate);

  const filtered = data.filter(item => {
    const itemDate = new Date(item.date);
    return itemDate >= start && itemDate <= end;
  });

  return {
    totalRevenue: sum(filtered, 'revenue'),
    totalRooms: sum(filtered, 'rooms'),
    avgADR: Math.round(average(filtered, 'adr')),
    avgOccupancy: Math.round(average(filtered, 'occupancy')),
    avgRevPAR: Math.round(average(filtered, 'revpar')),
    count: filtered.length,
    data: filtered
  };
}

/**
 * Group data by time period (day, week, month)
 */
export function groupByPeriod(data, period = 'day') {
  const grouped = {};

  data.forEach(item => {
    const date = new Date(item.date);
    let key;

    switch (period) {
      case 'day':
        key = item.date;
        break;
      case 'week':
        // Get week number
        const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
        const pastDaysOfYear = (date - firstDayOfYear) / 86400000;
        key = `Week ${Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7)}`;
        break;
      case 'month':
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        break;
      default:
        key = item.date;
    }

    if (!grouped[key]) {
      grouped[key] = [];
    }

    grouped[key].push(item);
  });

  // Aggregate each group
  const aggregated = {};
  Object.keys(grouped).forEach(key => {
    const items = grouped[key];
    aggregated[key] = {
      period: key,
      totalRevenue: sum(items, 'revenue'),
      totalRooms: sum(items, 'rooms'),
      avgADR: Math.round(average(items, 'adr')),
      avgOccupancy: Math.round(average(items, 'occupancy')),
      days: items.length,
      data: items
    };
  });

  return aggregated;
}

/**
 * Calculate growth rate between two periods
 */
export function calculateGrowth(currentValue, previousValue) {
  if (previousValue === 0) return 0;
  return ((currentValue - previousValue) / previousValue) * 100;
}

/**
 * Compare two time periods
 */
export function comparePeriods(currentData, previousData) {
  const currentMetrics = {
    revenue: sum(currentData, 'revenue'),
    rooms: sum(currentData, 'rooms'),
    adr: Math.round(average(currentData, 'adr')),
    occupancy: Math.round(average(currentData, 'occupancy'))
  };

  const previousMetrics = {
    revenue: sum(previousData, 'revenue'),
    rooms: sum(previousData, 'rooms'),
    adr: Math.round(average(previousData, 'adr')),
    occupancy: Math.round(average(previousData, 'occupancy'))
  };

  return {
    current: currentMetrics,
    previous: previousMetrics,
    growth: {
      revenue: calculateGrowth(currentMetrics.revenue, previousMetrics.revenue),
      rooms: calculateGrowth(currentMetrics.rooms, previousMetrics.rooms),
      adr: calculateGrowth(currentMetrics.adr, previousMetrics.adr),
      occupancy: calculateGrowth(currentMetrics.occupancy, previousMetrics.occupancy)
    }
  };
}

/**
 * Calculate percentile
 */
export function percentile(array, p, key = null) {
  if (!array || array.length === 0) return 0;

  const values = key
    ? array.map(item => item[key]).sort((a, b) => a - b)
    : [...array].sort((a, b) => a - b);

  const index = Math.ceil((p / 100) * values.length) - 1;
  return values[Math.max(0, index)];
}

/**
 * Get top performers
 */
export function getTopPerformers(data, metric = 'revenue', limit = 5) {
  return [...data]
    .sort((a, b) => (b[metric] || 0) - (a[metric] || 0))
    .slice(0, limit);
}

/**
 * Calculate contribution percentage
 */
export function calculateContribution(partValue, totalValue) {
  if (totalValue === 0) return 0;
  return (partValue / totalValue) * 100;
}
