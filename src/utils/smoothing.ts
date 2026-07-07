/**
 * Smoothing Utilities
 * Moving averages and data smoothing functions
 */

/**
 * Simple Moving Average
 */
export function simpleMovingAverage(data, windowSize = 7, valueKey = 'value') {
  if (data.length < windowSize) return data;

  const smoothed = [];

  for (let i = 0; i < data.length; i++) {
    if (i < windowSize - 1) {
      // Not enough data points yet, use actual value
      smoothed.push({
        ...data[i],
        smoothed: data[i][valueKey]
      });
    } else {
      // Calculate average of last windowSize points
      let sum = 0;
      for (let j = 0; j < windowSize; j++) {
        sum += data[i - j][valueKey];
      }
      const average = sum / windowSize;

      smoothed.push({
        ...data[i],
        smoothed: average
      });
    }
  }

  return smoothed;
}

/**
 * Exponential Moving Average
 */
export function exponentialMovingAverage(data, alpha = 0.3, valueKey = 'value') {
  if (data.length === 0) return data;

  const smoothed = [];
  let ema = data[0][valueKey]; // Initialize with first value

  for (let i = 0; i < data.length; i++) {
    const currentValue = data[i][valueKey];

    if (i === 0) {
      ema = currentValue;
    } else {
      ema = alpha * currentValue + (1 - alpha) * ema;
    }

    smoothed.push({
      ...data[i],
      smoothed: ema
    });
  }

  return smoothed;
}

/**
 * Apply seasonality adjustment
 */
export function applySeasonality(value, dayOfWeek, seasonalityFactors = null) {
  // Default seasonality: weekends are higher
  const defaultFactors = {
    0: 0.95, // Sunday
    1: 0.90, // Monday
    2: 0.92, // Tuesday
    3: 0.94, // Wednesday
    4: 1.00, // Thursday
    5: 1.10, // Friday
    6: 1.15  // Saturday
  };

  const factors = seasonalityFactors || defaultFactors;
  const factor = factors[dayOfWeek] || 1.0;

  return value * factor;
}

/**
 * Remove outliers using IQR method
 */
export function removeOutliers(data, valueKey = 'value') {
  if (data.length < 4) return data;

  const values = data.map(d => d[valueKey]).sort((a, b) => a - b);
  const q1Index = Math.floor(values.length * 0.25);
  const q3Index = Math.floor(values.length * 0.75);

  const q1 = values[q1Index];
  const q3 = values[q3Index];
  const iqr = q3 - q1;

  const lowerBound = q1 - 1.5 * iqr;
  const upperBound = q3 + 1.5 * iqr;

  return data.filter(d => {
    const value = d[valueKey];
    return value >= lowerBound && value <= upperBound;
  });
}

/**
 * Smooth and forecast combined
 */
export function smoothAndProject(historicalData, daysAhead, valueKey = 'revenue') {
  // Apply 7-day moving average
  const smoothed = simpleMovingAverage(historicalData, 7, valueKey);

  // Get the smoothed trend
  const recentSmoothed = smoothed.slice(-14).map(d => d.smoothed);
  const avgRecent = recentSmoothed.reduce((sum, v) => sum + v, 0) / recentSmoothed.length;

  // Calculate growth rate from smoothed data
  const firstHalf = recentSmoothed.slice(0, 7);
  const secondHalf = recentSmoothed.slice(7);

  const avgFirst = firstHalf.reduce((sum, v) => sum + v, 0) / firstHalf.length;
  const avgSecond = secondHalf.reduce((sum, v) => sum + v, 0) / secondHalf.length;

  const growthRate = (avgSecond - avgFirst) / avgFirst;

  // Project forward
  const projections = [];
  for (let i = 1; i <= daysAhead; i++) {
    const projected = avgRecent * Math.pow(1 + growthRate, i / 7);
    projections.push(Math.max(0, projected));
  }

  return {
    smoothedData: smoothed,
    projections,
    growthRate: growthRate * 100, // as percentage
    avgRecent
  };
}
