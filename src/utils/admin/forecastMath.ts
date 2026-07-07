/**
 * Forecast Mathematics
 * Calculations for ADR, RevPAR, Occupancy, and revenue metrics
 */

const TOTAL_ROOMS = 80; // Property has 80 rooms

/**
 * Calculate ADR (Average Daily Rate)
 */
export function calculateADR(revenue, roomsSold) {
  if (roomsSold === 0) return 0;
  return Math.round(revenue / roomsSold);
}

/**
 * Calculate RevPAR (Revenue Per Available Room)
 */
export function calculateRevPAR(revenue, totalRooms = TOTAL_ROOMS) {
  return Math.round(revenue / totalRooms);
}

/**
 * Calculate Occupancy Percentage
 */
export function calculateOccupancy(roomsSold, totalRooms = TOTAL_ROOMS) {
  if (totalRooms === 0) return 0;
  return Math.round((roomsSold / totalRooms) * 100);
}

/**
 * Calculate Revenue from ADR and Occupancy
 */
export function calculateRevenue(adr, occupancyPercent, totalRooms = TOTAL_ROOMS) {
  const roomsSold = Math.round((occupancyPercent / 100) * totalRooms);
  return adr * roomsSold;
}

/**
 * Project revenue for multiple days
 */
export function projectRevenue(baseADR, baseOccupancy, days, growthRate = 0) {
  const projections = [];

  for (let i = 0; i < days; i++) {
    // Apply growth rate
    const adjustedADR = baseADR * Math.pow(1 + growthRate, i / 30);
    const adjustedOccupancy = Math.min(100, baseOccupancy * Math.pow(1 + growthRate * 0.5, i / 30));

    const revenue = calculateRevenue(adjustedADR, adjustedOccupancy);
    const revpar = calculateRevPAR(revenue);
    const roomsSold = Math.round((adjustedOccupancy / 100) * TOTAL_ROOMS);

    projections.push({
      day: i + 1,
      adr: Math.round(adjustedADR),
      occupancy: Math.round(adjustedOccupancy),
      revenue: Math.round(revenue),
      revpar,
      roomsSold
    });
  }

  return projections;
}

/**
 * Calculate confidence interval
 */
export function calculateConfidenceInterval(forecastValue, confidenceLevel = 0.9) {
  // Simple confidence interval: ±12% for 90% confidence
  const margin = forecastValue * (1 - confidenceLevel) * 1.2;

  return {
    lower: Math.round(forecastValue - margin),
    upper: Math.round(forecastValue + margin),
    forecast: Math.round(forecastValue)
  };
}

/**
 * Calculate best, base, worst case scenarios
 */
export function calculateScenarios(baseRevenue) {
  return {
    bestCase: Math.round(baseRevenue * 1.15), // +15%
    baseCase: Math.round(baseRevenue),
    worstCase: Math.round(baseRevenue * 0.88) // -12%
  };
}

/**
 * Aggregate metrics from array of daily data
 */
export function aggregateMetrics(dailyData) {
  if (dailyData.length === 0) {
    return {
      totalRevenue: 0,
      avgADR: 0,
      avgOccupancy: 0,
      avgRevPAR: 0,
      totalRooms: 0
    };
  }

  const totalRevenue = dailyData.reduce((sum, day) => sum + (day.revenue || 0), 0);
  const totalRooms = dailyData.reduce((sum, day) => sum + (day.rooms || day.roomsSold || 0), 0);
  const avgADR = Math.round(dailyData.reduce((sum, day) => sum + (day.adr || 0), 0) / dailyData.length);
  const avgOccupancy = Math.round(dailyData.reduce((sum, day) => sum + (day.occupancy || 0), 0) / dailyData.length);
  const avgRevPAR = Math.round(dailyData.reduce((sum, day) => sum + (day.revpar || 0), 0) / dailyData.length);

  return {
    totalRevenue,
    avgADR,
    avgOccupancy,
    avgRevPAR,
    totalRooms
  };
}

/**
 * Calculate year-over-year growth
 */
export function calculateYoYGrowth(currentValue, previousValue) {
  if (previousValue === 0) return 0;
  return ((currentValue - previousValue) / previousValue) * 100;
}

/**
 * Calculate demand index based on occupancy and trend
 */
export function calculateDemandIndex(occupancy, trend = 0, eventBoost = 0) {
  // Base demand from occupancy
  let demand = occupancy;

  // Add trend factor (-10 to +10)
  demand += trend;

  // Add event boost (0 to +20)
  demand += eventBoost;

  // Clamp between 0 and 100
  return Math.max(0, Math.min(100, Math.round(demand)));
}
