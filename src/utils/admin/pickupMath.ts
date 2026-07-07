/**
 * Pickup Mathematics
 * Booking pace and pickup trend calculations
 */

/**
 * Calculate daily pickup rate
 */
export function calculateDailyPickup(bookings, previousBookings) {
  return bookings - previousBookings;
}

/**
 * Calculate pickup variance vs last year
 */
export function calculatePickupVariance(currentPickup, lastYearPickup) {
  if (lastYearPickup === 0) return 0;
  return ((currentPickup - lastYearPickup) / lastYearPickup) * 100;
}

/**
 * Analyze pickup trend over time
 */
export function analyzePickupTrend(pickupData) {
  if (pickupData.length < 2) {
    return { trend: 'stable', strength: 0 };
  }

  // Calculate average of first half vs second half
  const midpoint = Math.floor(pickupData.length / 2);
  const firstHalf = pickupData.slice(0, midpoint);
  const secondHalf = pickupData.slice(midpoint);

  const avgFirst = firstHalf.reduce((sum, p) => sum + p, 0) / firstHalf.length;
  const avgSecond = secondHalf.reduce((sum, p) => sum + p, 0) / secondHalf.length;

  const change = avgSecond - avgFirst;
  const percentChange = (change / avgFirst) * 100;

  let trend = 'stable';
  if (percentChange > 5) trend = 'accelerating';
  else if (percentChange < -5) trend = 'decelerating';

  return {
    trend,
    strength: Math.abs(percentChange),
    direction: change > 0 ? 'up' : change < 0 ? 'down' : 'flat'
  };
}

/**
 * Calculate pickup by booking window
 */
export function calculatePickupByWindow(bookings, windows = [7, 14, 30, 60, 90]) {
  const pickupByWindow = {};

  windows.forEach(window => {
    const bookingsInWindow = bookings.filter(b => b.daysOut <= window);
    pickupByWindow[`${window}d`] = bookingsInWindow.length;
  });

  return pickupByWindow;
}

/**
 * Project future pickup based on historical trend
 */
export function projectPickup(historicalPickup, daysAhead) {
  const trend = analyzePickupTrend(historicalPickup);
  const avgPickup = historicalPickup.reduce((sum, p) => sum + p, 0) / historicalPickup.length;

  const projections = [];

  for (let i = 0; i < daysAhead; i++) {
    // Apply trend
    let projection = avgPickup;

    if (trend.trend === 'accelerating') {
      projection *= (1 + (trend.strength / 100) * (i / daysAhead));
    } else if (trend.trend === 'decelerating') {
      projection *= (1 - (trend.strength / 100) * (i / daysAhead));
    }

    // Add variance
    const variance = projection * 0.1 * (Math.random() - 0.5) * 2;
    projections.push(Math.max(0, Math.round(projection + variance)));
  }

  return {
    projections,
    trend: trend.trend,
    avgPickup: Math.round(avgPickup)
  };
}

/**
 * Calculate pace indicator (ahead/behind/on-pace)
 */
export function calculatePaceIndicator(currentBookings, lastYearBookings, threshold = 5) {
  const variance = calculatePickupVariance(currentBookings, lastYearBookings);

  if (variance > threshold) {
    return {
      status: 'ahead',
      variance: variance.toFixed(1),
      message: `${variance.toFixed(1)}% ahead of last year`
    };
  } else if (variance < -threshold) {
    return {
      status: 'behind',
      variance: variance.toFixed(1),
      message: `${Math.abs(variance).toFixed(1)}% behind last year`
    };
  } else {
    return {
      status: 'on-pace',
      variance: variance.toFixed(1),
      message: 'On pace with last year'
    };
  }
}

/**
 * Detect pickup anomalies
 */
export function detectPickupAnomalies(dailyPickup, threshold = 2) {
  const anomalies = [];

  // Calculate mean and standard deviation
  const mean = dailyPickup.reduce((sum, p) => sum + p, 0) / dailyPickup.length;
  const squaredDiffs = dailyPickup.map(p => Math.pow(p - mean, 2));
  const variance = squaredDiffs.reduce((sum, sd) => sum + sd, 0) / dailyPickup.length;
  const stdDev = Math.sqrt(variance);

  dailyPickup.forEach((pickup, index) => {
    const zScore = (pickup - mean) / stdDev;

    if (Math.abs(zScore) > threshold) {
      anomalies.push({
        day: index + 1,
        pickup,
        zScore: zScore.toFixed(2),
        type: zScore > 0 ? 'spike' : 'drop',
        severity: Math.abs(zScore) > 3 ? 'high' : 'medium'
      });
    }
  });

  return anomalies;
}

/**
 * Calculate on-the-books metrics
 */
export function calculateOnTheBooks(futureBookings, totalRooms = 80) {
  const periods = {
    next7Days: futureBookings.filter(b => b.daysOut <= 7),
    next14Days: futureBookings.filter(b => b.daysOut <= 14),
    next30Days: futureBookings.filter(b => b.daysOut <= 30)
  };

  const metrics = {};

  Object.keys(periods).forEach(period => {
    const bookings = periods[period];
    const rooms = bookings.length;
    const revenue = bookings.reduce((sum, b) => sum + b.revenue, 0);
    const occupancy = (rooms / (totalRooms * parseInt(period.replace(/[^0-9]/g, '')))) * 100;
    const adr = rooms > 0 ? revenue / rooms : 0;

    metrics[period] = {
      rooms,
      revenue: Math.round(revenue),
      occupancy: Math.round(occupancy),
      adr: Math.round(adr)
    };
  });

  return metrics;
}
