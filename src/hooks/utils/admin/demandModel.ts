/**
 * Demand Model
 * AI-simulated demand forecasting based on multiple factors
 */

/**
 * Calculate demand score (0-100)
 */
export function calculateDemandScore(factors) {
  const {
    occupancy = 50,
    bookingPace = 0,
    searchTrend = 0,
    seasonality = 1.0,
    eventImpact = 0,
    marketSegmentMix = {}
  } = factors;

  // Base demand from occupancy (0-50 points)
  let demandScore = occupancy * 0.5;

  // Booking pace contribution (0-20 points)
  demandScore += Math.max(-10, Math.min(10, bookingPace)) + 10;

  // Search trend contribution (0-15 points)
  demandScore += Math.max(0, Math.min(15, searchTrend * 15));

  // Seasonality adjustment (-10 to +10 points)
  demandScore += (seasonality - 1.0) * 10;

  // Event impact (0-15 points)
  demandScore += Math.max(0, Math.min(15, eventImpact));

  // Corporate segment boost (0-10 points)
  if (marketSegmentMix.corporate > 0.3) {
    demandScore += 5;
  }

  // Clamp between 0 and 100
  return Math.max(0, Math.min(100, Math.round(demandScore)));
}

/**
 * Get demand level classification
 */
export function getDemandLevel(demandScore) {
  if (demandScore >= 85) return { level: 'Very High', color: 'red' };
  if (demandScore >= 70) return { level: 'High', color: 'orange' };
  if (demandScore >= 50) return { level: 'Medium', color: 'amber' };
  if (demandScore >= 30) return { level: 'Low', color: 'yellow' };
  return { level: 'Very Low', color: 'gray' };
}

/**
 * Calculate price elasticity factor
 */
export function calculatePriceElasticity(demandScore) {
  // High demand = low elasticity (can increase prices more)
  // Low demand = high elasticity (need to be careful with pricing)

  if (demandScore >= 80) return 0.3; // Low elasticity
  if (demandScore >= 60) return 0.5;
  if (demandScore >= 40) return 0.7;
  return 0.9; // High elasticity
}

/**
 * Generate demand forecast for multiple days
 */
export function forecastDemand(historicalOccupancy, daysAhead) {
  const forecasts = [];
  const baseOccupancy = historicalOccupancy[historicalOccupancy.length - 1] || 65;

  for (let i = 0; i < daysAhead; i++) {
    // Calculate day of week
    const today = new Date();
    const futureDate = new Date(today);
    futureDate.setDate(today.getDate() + i);
    const dayOfWeek = futureDate.getDay();

    // Seasonality by day of week
    const seasonalityFactors = {
      0: 0.95, // Sunday
      1: 0.88, // Monday
      2: 0.90, // Tuesday
      3: 0.92, // Wednesday
      4: 0.98, // Thursday
      5: 1.08, // Friday
      6: 1.12  // Saturday
    };

    const seasonality = seasonalityFactors[dayOfWeek];

    // Add trend and randomness
    const trendFactor = 1 + (i * 0.002); // Slight upward trend
    const randomFactor = 0.95 + (Math.random() * 0.10); // ±5% variance

    const projectedOccupancy = Math.min(100, baseOccupancy * seasonality * trendFactor * randomFactor);

    // Mock booking pace (simulated)
    const bookingPace = -5 + (Math.random() * 15); // -5% to +10%

    // Mock search trend
    const searchTrend = Math.random() * 0.8; // 0 to 0.8

    // Calculate demand score
    const demandScore = calculateDemandScore({
      occupancy: projectedOccupancy,
      bookingPace,
      searchTrend,
      seasonality,
      eventImpact: i > 20 ? 10 : 0 // Mock event in future
    });

    const demandLevel = getDemandLevel(demandScore);

    forecasts.push({
      day: i + 1,
      date: futureDate.toISOString().split('T')[0],
      occupancy: Math.round(projectedOccupancy),
      demandScore: Math.round(demandScore),
      demandLevel: demandLevel.level,
      demandColor: demandLevel.color,
      seasonality,
      bookingPace: bookingPace.toFixed(1),
      confidence: Math.round(88 + Math.random() * 10) // 88-98%
    });
  }

  return forecasts;
}

/**
 * Detect demand anomalies
 */
export function detectAnomalies(demandForecasts) {
  const anomalies = [];

  demandForecasts.forEach((forecast, index) => {
    // Very high demand
    if (forecast.demandScore > 85) {
      anomalies.push({
        day: forecast.day,
        date: forecast.date,
        type: 'high_demand',
        message: `Exceptionally high demand detected (${forecast.demandScore}/100)`,
        action: 'Consider premium pricing',
        severity: 'opportunity'
      });
    }

    // Sudden demand drop
    if (index > 0) {
      const prevDemand = demandForecasts[index - 1].demandScore;
      const change = forecast.demandScore - prevDemand;

      if (change < -15) {
        anomalies.push({
          day: forecast.day,
          date: forecast.date,
          type: 'demand_drop',
          message: `Sudden demand drop detected (-${Math.abs(change)} points)`,
          action: 'Review pricing strategy',
          severity: 'warning'
        });
      }
    }
  });

  return anomalies;
}

/**
 * Calculate optimal pricing adjustment based on demand
 */
export function getOptimalPriceAdjustment(demandScore, currentOccupancy) {
  // High demand + low availability = increase prices
  if (demandScore > 75 && currentOccupancy > 80) {
    return {
      adjustment: 15,
      reason: 'High demand and high occupancy'
    };
  }

  if (demandScore > 70) {
    return {
      adjustment: 10,
      reason: 'Strong demand detected'
    };
  }

  if (demandScore > 55) {
    return {
      adjustment: 5,
      reason: 'Moderate demand'
    };
  }

  // Low demand = decrease prices to attract bookings
  if (demandScore < 30) {
    return {
      adjustment: -10,
      reason: 'Low demand - attract bookings'
    };
  }

  if (demandScore < 45) {
    return {
      adjustment: -5,
      reason: 'Softer demand'
    };
  }

  return {
    adjustment: 0,
    reason: 'Maintain current pricing'
  };
}
