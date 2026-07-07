/**
 * Review Aggregation & KPI Calculation
 * Compute all dashboard metrics
 */

/**
 * Calculate overall score
 */
export function calculateOverallScore(reviews) {
  if (!reviews || reviews.length === 0) return 0;

  const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
  return (totalRating / reviews.length).toFixed(1);
}

/**
 * Calculate sentiment score (0-100)
 */
export function calculateSentimentScore(reviews) {
  if (!reviews || reviews.length === 0) return 0;

  const positiveCount = reviews.filter(r => {
    const sentiment = r.computedSentiment?.label || r.sentiment;
    return sentiment === 'Positive' || sentiment === 'positive';
  }).length;

  return Math.round((positiveCount / reviews.length) * 100);
}

/**
 * Calculate response rate
 */
export function calculateResponseRate(reviews) {
  if (!reviews || reviews.length === 0) return 0;

  const respondedCount = reviews.filter(r => r.hasReply || r.reply).length;
  return Math.round((respondedCount / reviews.length) * 100);
}

/**
 * Calculate average response time (in hours)
 */
export function calculateAvgResponseTime(reviews) {
  const respondedReviews = reviews.filter(r => r.hasReply && r.reply);

  if (respondedReviews.length === 0) return 0;

  const totalHours = respondedReviews.reduce((sum, review) => {
    const reviewDate = new Date(review.date);
    const replyDate = new Date(review.reply.date);
    const diffHours = (replyDate - reviewDate) / (1000 * 60 * 60);
    return sum + diffHours;
  }, 0);

  return Math.round(totalHours / respondedReviews.length);
}

/**
 * Get star rating distribution
 */
export function getStarDistribution(reviews) {
  const distribution = {
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    5: 0
  };

  reviews.forEach(review => {
    if (review.rating >= 1 && review.rating <= 5) {
      distribution[review.rating]++;
    }
  });

  const total = reviews.length;

  return {
    counts: distribution,
    percentages: {
      1: total > 0 ? Math.round((distribution[1] / total) * 100) : 0,
      2: total > 0 ? Math.round((distribution[2] / total) * 100) : 0,
      3: total > 0 ? Math.round((distribution[3] / total) * 100) : 0,
      4: total > 0 ? Math.round((distribution[4] / total) * 100) : 0,
      5: total > 0 ? Math.round((distribution[5] / total) * 100) : 0
    }
  };
}

/**
 * Aggregate reviews by platform
 */
export function aggregateByPlatform(reviews) {
  const platforms = {};

  reviews.forEach(review => {
    if (!platforms[review.platform]) {
      platforms[review.platform] = {
        platform: review.platform,
        count: 0,
        totalRating: 0,
        positive: 0,
        negative: 0,
        neutral: 0,
        responded: 0
      };
    }

    const p = platforms[review.platform];
    p.count++;
    p.totalRating += review.rating;

    const sentiment = review.computedSentiment?.label || review.sentiment;
    if (sentiment === 'Positive' || sentiment === 'positive') p.positive++;
    else if (sentiment === 'Negative' || sentiment === 'negative') p.negative++;
    else p.neutral++;

    if (review.hasReply || review.reply) p.responded++;
  });

  return Object.values(platforms).map(p => ({
    ...p,
    avgRating: (p.totalRating / p.count).toFixed(1),
    positivePercent: Math.round((p.positive / p.count) * 100),
    responseRate: Math.round((p.responded / p.count) * 100)
  }));
}

/**
 * Calculate daily trends
 */
export function calculateDailyTrends(reviews, days = 30) {
  const trends = [];
  const today = new Date();

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];

    const dayReviews = reviews.filter(r => r.date === dateStr);

    const positive = dayReviews.filter(r => {
      const sentiment = r.computedSentiment?.label || r.sentiment;
      return sentiment === 'Positive' || sentiment === 'positive';
    }).length;

    const negative = dayReviews.filter(r => {
      const sentiment = r.computedSentiment?.label || r.sentiment;
      return sentiment === 'Negative' || sentiment === 'negative';
    }).length;

    const avgRating = dayReviews.length > 0
      ? dayReviews.reduce((sum, r) => sum + r.rating, 0) / dayReviews.length
      : 0;

    trends.push({
      date: dateStr,
      count: dayReviews.length,
      avgRating: avgRating.toFixed(1),
      positive,
      negative,
      neutral: dayReviews.length - positive - negative
    });
  }

  return trends;
}

/**
 * Calculate weekly aggregates
 */
export function calculateWeeklyAggregates(reviews) {
  const weeks = {};

  reviews.forEach(review => {
    const date = new Date(review.date);
    const weekStart = new Date(date);
    weekStart.setDate(date.getDate() - date.getDay()); // Start of week (Sunday)
    const weekKey = weekStart.toISOString().split('T')[0];

    if (!weeks[weekKey]) {
      weeks[weekKey] = {
        week: weekKey,
        count: 0,
        totalRating: 0,
        positive: 0,
        negative: 0,
        neutral: 0
      };
    }

    const w = weeks[weekKey];
    w.count++;
    w.totalRating += review.rating;

    const sentiment = review.computedSentiment?.label || review.sentiment;
    if (sentiment === 'Positive' || sentiment === 'positive') w.positive++;
    else if (sentiment === 'Negative' || sentiment === 'negative') w.negative++;
    else w.neutral++;
  });

  return Object.values(weeks)
    .map(w => ({
      ...w,
      avgRating: (w.totalRating / w.count).toFixed(1)
    }))
    .sort((a, b) => new Date(a.week) - new Date(b.week));
}

/**
 * Calculate monthly aggregates
 */
export function calculateMonthlyAggregates(reviews) {
  const months = {};

  reviews.forEach(review => {
    const date = new Date(review.date);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

    if (!months[monthKey]) {
      months[monthKey] = {
        month: monthKey,
        count: 0,
        totalRating: 0,
        positive: 0,
        negative: 0,
        neutral: 0
      };
    }

    const m = months[monthKey];
    m.count++;
    m.totalRating += review.rating;

    const sentiment = review.computedSentiment?.label || review.sentiment;
    if (sentiment === 'Positive' || sentiment === 'positive') m.positive++;
    else if (sentiment === 'Negative' || sentiment === 'negative') m.negative++;
    else m.neutral++;
  });

  return Object.values(months)
    .map(m => ({
      ...m,
      avgRating: (m.totalRating / m.count).toFixed(1)
    }))
    .sort((a, b) => a.month.localeCompare(b.month));
}

/**
 * Calculate growth vs previous period
 */
export function calculateGrowth(currentReviews, previousReviews) {
  const currentCount = currentReviews.length;
  const previousCount = previousReviews.length;

  const currentRating = currentCount > 0
    ? currentReviews.reduce((sum, r) => sum + r.rating, 0) / currentCount
    : 0;

  const previousRating = previousCount > 0
    ? previousReviews.reduce((sum, r) => sum + r.rating, 0) / previousCount
    : 0;

  const countGrowth = previousCount > 0
    ? ((currentCount - previousCount) / previousCount) * 100
    : 0;

  const ratingGrowth = previousRating > 0
    ? ((currentRating - previousRating) / previousRating) * 100
    : 0;

  return {
    countGrowth: Math.round(countGrowth * 10) / 10,
    ratingGrowth: Math.round(ratingGrowth * 10) / 10,
    trend: countGrowth > 5 ? 'up' : countGrowth < -5 ? 'down' : 'stable'
  };
}

/**
 * Get top reviewers
 */
export function getTopReviewers(reviews, limit = 10) {
  const reviewers = {};

  reviews.forEach(review => {
    if (!reviewers[review.guestName]) {
      reviewers[review.guestName] = {
        name: review.guestName,
        count: 0,
        avgRating: 0,
        totalRating: 0
      };
    }

    const r = reviewers[review.guestName];
    r.count++;
    r.totalRating += review.rating;
  });

  return Object.values(reviewers)
    .map(r => ({
      ...r,
      avgRating: (r.totalRating / r.count).toFixed(1)
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

/**
 * Calculate verification rate
 */
export function calculateVerificationRate(reviews) {
  if (!reviews || reviews.length === 0) return 0;

  const verifiedCount = reviews.filter(r => r.verified).length;
  return Math.round((verifiedCount / reviews.length) * 100);
}
