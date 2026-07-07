// CRM Trend Modeling
// Calculate growth trends, moving averages, and time-series analysis

/**
 * Calculate monthly guest growth trend
 */
export function calculateGuestGrowthTrend(guests, months = 12) {
  const now = new Date();
  const trends = [];

  for (let i = months - 1; i >= 0; i--) {
    const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);

    // Guests who had their first visit in this month
    const newGuestsThisMonth = guests.filter(g => {
      const firstVisit = new Date(g.firstVisit);
      return firstVisit >= monthStart && firstVisit <= monthEnd;
    });

    // Guests who visited in this month (not necessarily first visit)
    const activeGuestsThisMonth = guests.filter(g => {
      const lastVisit = new Date(g.lastVisit);
      const firstVisit = new Date(g.firstVisit);
      return (lastVisit >= monthStart && lastVisit <= monthEnd) ||
             (firstVisit >= monthStart && firstVisit <= monthEnd);
    });

    // Total guests up to this month
    const totalGuestsUpToMonth = guests.filter(g => {
      const firstVisit = new Date(g.firstVisit);
      return firstVisit <= monthEnd;
    }).length;

    trends.push({
      month: monthStart.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      monthKey: `${monthStart.getFullYear()}-${String(monthStart.getMonth() + 1).padStart(2, '0')}`,
      newGuests: newGuestsThisMonth.length,
      activeGuests: activeGuestsThisMonth.length,
      totalGuests: totalGuestsUpToMonth
    });
  }

  // Calculate growth rates
  for (let i = 1; i < trends.length; i++) {
    const current = trends[i].totalGuests;
    const previous = trends[i - 1].totalGuests;
    trends[i].growthRate = previous > 0 ? ((current - previous) / previous * 100).toFixed(1) : '0.0';
    trends[i].growthDirection = current > previous ? 'up' : current < previous ? 'down' : 'stable';
  }

  return trends;
}

/**
 * Calculate monthly LTV trend
 */
export function calculateLTVTrend(guests, months = 12) {
  const now = new Date();
  const trends = [];

  for (let i = months - 1; i >= 0; i--) {
    const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);

    // Calculate average LTV for guests who were active this month
    const activeGuests = guests.filter(g => {
      const firstVisit = new Date(g.firstVisit);
      return firstVisit <= monthEnd;
    });

    const totalLTV = activeGuests.reduce((sum, g) => sum + g.totalSpend, 0);
    const avgLTV = activeGuests.length > 0 ? totalLTV / activeGuests.length : 0;

    // Calculate LTV by segment
    const vipGuests = activeGuests.filter(g => g.totalSpend > 2000 || g.totalStays > 8);
    const vipLTV = vipGuests.length > 0 ? vipGuests.reduce((sum, g) => sum + g.totalSpend, 0) / vipGuests.length : 0;

    const frequentGuests = activeGuests.filter(g => g.totalStays > 3 && g.totalStays <= 8);
    const frequentLTV = frequentGuests.length > 0 ? frequentGuests.reduce((sum, g) => sum + g.totalSpend, 0) / frequentGuests.length : 0;

    const occasionalGuests = activeGuests.filter(g => g.totalStays <= 3);
    const occasionalLTV = occasionalGuests.length > 0 ? occasionalGuests.reduce((sum, g) => sum + g.totalSpend, 0) / occasionalGuests.length : 0;

    trends.push({
      month: monthStart.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      monthKey: `${monthStart.getFullYear()}-${String(monthStart.getMonth() + 1).padStart(2, '0')}`,
      avgLTV: Math.round(avgLTV),
      vipLTV: Math.round(vipLTV),
      frequentLTV: Math.round(frequentLTV),
      occasionalLTV: Math.round(occasionalLTV),
      totalRevenue: Math.round(totalLTV)
    });
  }

  // Calculate growth rates
  for (let i = 1; i < trends.length; i++) {
    const current = trends[i].avgLTV;
    const previous = trends[i - 1].avgLTV;
    trends[i].growthRate = previous > 0 ? ((current - previous) / previous * 100).toFixed(1) : '0.0';
    trends[i].growthDirection = current > previous ? 'up' : current < previous ? 'down' : 'stable';
  }

  return trends;
}

/**
 * Calculate moving average
 */
export function calculateMovingAverage(data, window = 3) {
  const result = [];

  for (let i = 0; i < data.length; i++) {
    if (i < window - 1) {
      result.push(null);
    } else {
      const sum = data.slice(i - window + 1, i + 1).reduce((a, b) => a + b, 0);
      result.push(sum / window);
    }
  }

  return result;
}

/**
 * Calculate daily activity trend
 */
export function calculateDailyTrend(guests, days = 30) {
  const now = new Date();
  const trends = [];

  for (let i = days - 1; i >= 0; i--) {
    const dayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i, 0, 0, 0);
    const dayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i, 23, 59, 59);

    const activeThisDay = guests.filter(g => {
      const lastVisit = new Date(g.lastVisit);
      return lastVisit >= dayStart && lastVisit <= dayEnd;
    });

    trends.push({
      date: dayStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      dateKey: dayStart.toISOString().split('T')[0],
      activeGuests: activeThisDay.length,
      revenue: activeThisDay.reduce((sum, g) => sum + g.averageSpend, 0)
    });
  }

  return trends;
}

/**
 * Calculate retention trend over time
 */
export function calculateRetentionTrend(guests, months = 12) {
  const now = new Date();
  const trends = [];

  for (let i = months - 1; i >= 0; i--) {
    const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);

    // Guests who had first visit before this month
    const existingGuests = guests.filter(g => {
      const firstVisit = new Date(g.firstVisit);
      return firstVisit < monthStart;
    });

    // Of those, how many returned this month?
    const returnedGuests = existingGuests.filter(g => {
      const lastVisit = new Date(g.lastVisit);
      return lastVisit >= monthStart && lastVisit <= monthEnd;
    });

    const retentionRate = existingGuests.length > 0 ? (returnedGuests.length / existingGuests.length * 100).toFixed(1) : '0.0';

    trends.push({
      month: monthStart.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      monthKey: `${monthStart.getFullYear()}-${String(monthStart.getMonth() + 1).padStart(2, '0')}`,
      existingGuests: existingGuests.length,
      returnedGuests: returnedGuests.length,
      retentionRate: parseFloat(retentionRate)
    });
  }

  return trends;
}

/**
 * Calculate source/channel breakdown trend
 */
export function calculateSourceTrend(guests, months = 12) {
  const now = new Date();
  const trends = [];

  for (let i = months - 1; i >= 0; i--) {
    const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);

    const newGuestsThisMonth = guests.filter(g => {
      const firstVisit = new Date(g.firstVisit);
      return firstVisit >= monthStart && firstVisit <= monthEnd;
    });

    const breakdown = {
      month: monthStart.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      direct: newGuestsThisMonth.filter(g => g.source === 'direct').length,
      ota: newGuestsThisMonth.filter(g => ['booking.com', 'expedia', 'agoda', 'airbnb'].includes(g.source)).length,
      corporate: newGuestsThisMonth.filter(g => g.source === 'corporate').length,
      walkIn: newGuestsThisMonth.filter(g => g.source === 'walk-in').length,
      total: newGuestsThisMonth.length
    };

    trends.push(breakdown);
  }

  return trends;
}

/**
 * Detect trend direction and strength
 */
export function detectTrendDirection(data, key = 'value') {
  if (!data || data.length < 2) return { direction: 'stable', strength: 0 };

  const values = data.map(d => typeof d === 'object' ? d[key] : d).filter(v => v != null);

  if (values.length < 2) return { direction: 'stable', strength: 0 };

  // Calculate linear regression slope
  const n = values.length;
  const sumX = values.reduce((sum, _, i) => sum + i, 0);
  const sumY = values.reduce((sum, v) => sum + v, 0);
  const sumXY = values.reduce((sum, v, i) => sum + i * v, 0);
  const sumX2 = values.reduce((sum, _, i) => sum + i * i, 0);

  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);

  const avgValue = sumY / n;
  const strength = Math.abs(slope / avgValue) * 100; // Percentage change

  return {
    direction: slope > 0.01 ? 'up' : slope < -0.01 ? 'down' : 'stable',
    strength: Math.round(strength * 10) / 10,
    slope
  };
}
