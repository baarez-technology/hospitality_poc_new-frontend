// CRM LTV Forecasting & Calculations
// Predict future lifetime value, retention, and booking behavior

/**
 * Calculate current LTV
 */
export function calculateLTV(guest) {
  return guest.totalSpend;
}

/**
 * Calculate average spend per visit
 */
export function calculateAverageSpend(guest) {
  if (guest.totalStays === 0) return 0;
  return guest.totalSpend / guest.totalStays;
}

/**
 * Calculate visit frequency (visits per year)
 */
export function calculateVisitFrequency(guest) {
  if (!guest.lifespanDays || guest.lifespanDays === 0) return 0;
  const years = guest.lifespanDays / 365;
  return guest.totalStays / years;
}

/**
 * Predict future visits using linear regression
 * Based on past visit frequency and sentiment
 */
export function predictFutureVisits(guest, timeframeMonths = 12) {
  const visitFrequency = calculateVisitFrequency(guest);
  const years = timeframeMonths / 12;

  // Base prediction on historical frequency
  let predictedVisits = visitFrequency * years;

  // Adjust based on sentiment
  const sentimentAdjustment = guest.sentimentScore > 0.7 ? 1.15 :
                              guest.sentimentScore > 0.5 ? 1.0 :
                              guest.sentimentScore > 0.3 ? 0.85 : 0.6;

  predictedVisits *= sentimentAdjustment;

  // Adjust based on recency
  if (guest.daysSinceLastVisit > 365) {
    predictedVisits *= 0.3; // Very inactive
  } else if (guest.daysSinceLastVisit > 180) {
    predictedVisits *= 0.6; // Dormant
  }

  return Math.max(0, Math.round(predictedVisits * 10) / 10);
}

/**
 * Calculate retention probability using logistic function
 * Based on sentiment, recency, and engagement
 */
export function calculateRetentionProbability(guest) {
  // Factors
  const sentimentFactor = guest.sentimentScore; // 0-1
  const recencyFactor = guest.daysSinceLastVisit < 60 ? 1.0 :
                        guest.daysSinceLastVisit < 120 ? 0.8 :
                        guest.daysSinceLastVisit < 180 ? 0.6 :
                        guest.daysSinceLastVisit < 365 ? 0.4 : 0.2;

  const loyaltyFactor = guest.totalStays > 10 ? 1.0 :
                        guest.totalStays > 5 ? 0.9 :
                        guest.totalStays > 2 ? 0.7 : 0.5;

  // Weighted average
  const retentionScore = (sentimentFactor * 0.4) + (recencyFactor * 0.35) + (loyaltyFactor * 0.25);

  // Convert to percentage
  return Math.round(retentionScore * 100);
}

/**
 * Forecast future LTV
 * Formula: currentLTV + (avgSpend * predictedVisits)
 */
export function forecastLTV(guest, timeframeMonths = 12) {
  const currentLTV = calculateLTV(guest);
  const avgSpend = calculateAverageSpend(guest);
  const predictedVisits = predictFutureVisits(guest, timeframeMonths);

  const forecastedAdditionalSpend = avgSpend * predictedVisits;
  const forecastedTotalLTV = currentLTV + forecastedAdditionalSpend;

  return {
    currentLTV,
    forecastedLTV: Math.round(forecastedTotalLTV),
    forecastedAdditionalSpend: Math.round(forecastedAdditionalSpend),
    predictedVisits,
    confidence: calculateRetentionProbability(guest)
  };
}

/**
 * Predict next booking date
 * Based on average days between visits
 */
export function predictNextBooking(guest) {
  if (guest.totalStays < 2) {
    return {
      predictedDate: null,
      confidence: 'low',
      confidenceScore: 30
    };
  }

  const avgDaysBetweenVisits = guest.lifespanDays / guest.totalStays;
  const daysSinceLastVisit = guest.daysSinceLastVisit;

  // If already has upcoming booking
  if (guest.nextBookingDate) {
    return {
      predictedDate: guest.nextBookingDate,
      confidence: 'confirmed',
      confidenceScore: 100
    };
  }

  // Predict based on pattern
  const daysUntilNextBooking = avgDaysBetweenVisits - daysSinceLastVisit;

  if (daysUntilNextBooking < 0) {
    // Overdue
    return {
      predictedDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // Assume 30 days
      confidence: 'low',
      confidenceScore: 25
    };
  }

  const predictedDate = new Date(Date.now() + daysUntilNextBooking * 24 * 60 * 60 * 1000);

  // Confidence based on pattern consistency and sentiment
  const patternConfidence = guest.totalStays > 5 ? 70 : guest.totalStays > 2 ? 50 : 30;
  const sentimentBonus = guest.sentimentScore > 0.7 ? 15 : guest.sentimentScore > 0.5 ? 5 : -10;
  const confidenceScore = Math.min(95, Math.max(10, patternConfidence + sentimentBonus));

  return {
    predictedDate,
    confidence: confidenceScore > 70 ? 'high' : confidenceScore > 50 ? 'medium' : 'low',
    confidenceScore
  };
}

/**
 * Calculate revenue per guest projection
 */
export function projectRevenuePerGuest(guest, timeframeMonths = 12) {
  const forecast = forecastLTV(guest, timeframeMonths);
  return forecast.forecastedAdditionalSpend;
}

/**
 * Batch forecast for all guests
 */
export function batchForecastLTV(guests, timeframeMonths = 12) {
  const forecasts = guests.map(guest => ({
    guestId: guest.id,
    guestName: guest.name,
    ...forecastLTV(guest, timeframeMonths)
  }));

  const totalCurrentLTV = forecasts.reduce((sum, f) => sum + f.currentLTV, 0);
  const totalForecastedLTV = forecasts.reduce((sum, f) => sum + f.forecastedLTV, 0);
  const totalProjectedRevenue = totalForecastedLTV - totalCurrentLTV;

  return {
    forecasts,
    summary: {
      totalCurrentLTV,
      totalForecastedLTV,
      totalProjectedRevenue,
      averageProjectedRevenue: Math.round(totalProjectedRevenue / guests.length),
      growthRate: ((totalForecastedLTV - totalCurrentLTV) / totalCurrentLTV * 100).toFixed(1)
    }
  };
}

/**
 * Calculate guest growth projection
 * Predict how many new guests to expect
 */
export function projectGuestGrowth(guests, timeframeMonths = 12) {
  // Calculate current growth rate
  const now = new Date();
  const threeMonthsAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);

  const recentNewGuests = guests.filter(g => {
    const firstVisit = new Date(g.firstVisit);
    return firstVisit >= threeMonthsAgo;
  }).length;

  const monthlyGrowthRate = recentNewGuests / 3; // per month
  const projectedNewGuests = Math.round(monthlyGrowthRate * timeframeMonths);

  return {
    currentTotal: guests.length,
    projectedTotal: guests.length + projectedNewGuests,
    projectedNewGuests,
    monthlyGrowthRate: monthlyGrowthRate.toFixed(1),
    growthPercentage: ((projectedNewGuests / guests.length) * 100).toFixed(1)
  };
}
