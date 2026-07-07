// CRM Segmentation Engine
// Classifies guests into segments based on behavior, spend, and engagement

/**
 * Calculate if guest is VIP
 * Rules: LTV > $2000 OR totalStays > 8 OR sentimentScore > 0.85
 */
export function isVIPGuest(guest) {
  return guest.totalSpend > 2000 || guest.totalStays > 8 || guest.sentimentScore > 0.85;
}

/**
 * Calculate if guest is at risk
 * Rules: sentimentScore < 0.4 OR lastVisit > 180 days OR negativeReviews > 1
 */
export function isAtRiskGuest(guest) {
  return guest.sentimentScore < 0.4 || guest.daysSinceLastVisit > 180 || guest.negativeReviews > 1;
}

/**
 * Calculate if guest is high spender
 * Rule: LTV > averageLTV + 20%
 */
export function isHighSpender(guest, averageLTV) {
  return guest.totalSpend > averageLTV * 1.2;
}

/**
 * Calculate if guest is returning
 */
export function isReturningGuest(guest) {
  return guest.totalStays > 1;
}

/**
 * Calculate if guest is new
 */
export function isNewGuest(guest) {
  return guest.totalStays === 1;
}

/**
 * Calculate if guest is corporate
 */
export function isCorporateGuest(guest) {
  return guest.source === 'corporate';
}

/**
 * Calculate if guest is from OTA
 */
export function isOTAGuest(guest) {
  return ['booking.com', 'expedia', 'agoda', 'airbnb'].includes(guest.source);
}

/**
 * Calculate if guest is walk-in
 */
export function isWalkInGuest(guest) {
  return guest.source === 'walk-in';
}

/**
 * Calculate if guest is active
 * Active = visited within last 180 days
 */
export function isActiveGuest(guest) {
  return guest.daysSinceLastVisit < 180;
}

/**
 * Calculate if guest is dormant
 * Dormant = no visit in 180-365 days
 */
export function isDormantGuest(guest) {
  return guest.daysSinceLastVisit >= 180 && guest.daysSinceLastVisit < 365;
}

/**
 * Calculate if guest is loyal
 * Loyal = totalStays > 5 AND sentimentScore > 0.6
 */
export function isLoyalGuest(guest) {
  return guest.totalStays > 5 && guest.sentimentScore > 0.6;
}

/**
 * Main segmentation function
 * Returns all segment classifications for a guest
 */
export function classifyGuest(guest, averageLTV) {
  return {
    isVIP: isVIPGuest(guest),
    isAtRisk: isAtRiskGuest(guest),
    isHighSpender: isHighSpender(guest, averageLTV),
    isReturning: isReturningGuest(guest),
    isNew: isNewGuest(guest),
    isCorporate: isCorporateGuest(guest),
    isOTA: isOTAGuest(guest),
    isWalkIn: isWalkInGuest(guest),
    isActive: isActiveGuest(guest),
    isDormant: isDormantGuest(guest),
    isLoyal: isLoyalGuest(guest)
  };
}

/**
 * Segment all guests
 * Returns categorized lists and statistics
 */
export function segmentGuests(guests) {
  if (!guests || guests.length === 0) {
    return {
      vip: [],
      atRisk: [],
      highSpenders: [],
      returning: [],
      new: [],
      corporate: [],
      ota: [],
      walkIn: [],
      active: [],
      dormant: [],
      loyal: [],
      breakdown: {}
    };
  }

  const averageLTV = guests.reduce((sum, g) => sum + g.totalSpend, 0) / guests.length;

  const segments = {
    vip: [],
    atRisk: [],
    highSpenders: [],
    returning: [],
    new: [],
    corporate: [],
    ota: [],
    walkIn: [],
    active: [],
    dormant: [],
    loyal: []
  };

  guests.forEach(guest => {
    const classification = classifyGuest(guest, averageLTV);

    if (classification.isVIP) segments.vip.push(guest);
    if (classification.isAtRisk) segments.atRisk.push(guest);
    if (classification.isHighSpender) segments.highSpenders.push(guest);
    if (classification.isReturning) segments.returning.push(guest);
    if (classification.isNew) segments.new.push(guest);
    if (classification.isCorporate) segments.corporate.push(guest);
    if (classification.isOTA) segments.ota.push(guest);
    if (classification.isWalkIn) segments.walkIn.push(guest);
    if (classification.isActive) segments.active.push(guest);
    if (classification.isDormant) segments.dormant.push(guest);
    if (classification.isLoyal) segments.loyal.push(guest);
  });

  // Calculate percentages
  const total = guests.length;
  const breakdown = {
    vip: { count: segments.vip.length, percentage: (segments.vip.length / total * 100).toFixed(1) },
    atRisk: { count: segments.atRisk.length, percentage: (segments.atRisk.length / total * 100).toFixed(1) },
    highSpenders: { count: segments.highSpenders.length, percentage: (segments.highSpenders.length / total * 100).toFixed(1) },
    returning: { count: segments.returning.length, percentage: (segments.returning.length / total * 100).toFixed(1) },
    new: { count: segments.new.length, percentage: (segments.new.length / total * 100).toFixed(1) },
    corporate: { count: segments.corporate.length, percentage: (segments.corporate.length / total * 100).toFixed(1) },
    ota: { count: segments.ota.length, percentage: (segments.ota.length / total * 100).toFixed(1) },
    walkIn: { count: segments.walkIn.length, percentage: (segments.walkIn.length / total * 100).toFixed(1) },
    active: { count: segments.active.length, percentage: (segments.active.length / total * 100).toFixed(1) },
    dormant: { count: segments.dormant.length, percentage: (segments.dormant.length / total * 100).toFixed(1) },
    loyal: { count: segments.loyal.length, percentage: (segments.loyal.length / total * 100).toFixed(1) }
  };

  return {
    ...segments,
    breakdown,
    averageLTV
  };
}

/**
 * Get primary segment for a guest (most important classification)
 */
export function getPrimarySegment(guest, averageLTV) {
  const classification = classifyGuest(guest, averageLTV);

  if (classification.isVIP) return 'VIP';
  if (classification.isAtRisk) return 'At Risk';
  if (classification.isHighSpender) return 'High Spender';
  if (classification.isLoyal) return 'Loyal';
  if (classification.isCorporate) return 'Corporate';
  if (classification.isReturning) return 'Returning';
  if (classification.isNew) return 'New';
  return 'Standard';
}
