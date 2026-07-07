/**
 * Platform Analytics Engine
 * Calculate platform-level performance metrics
 */

/**
 * Calculate platform statistics
 */
export function calculatePlatformStats(reviews, platform) {
  const platformReviews = reviews.filter(r => r.platform === platform);

  if (platformReviews.length === 0) {
    return {
      platform,
      reviewCount: 0,
      averageRating: 0,
      positivePercent: 0,
      negativePercent: 0,
      neutralPercent: 0,
      responseRate: 0,
      verifiedRate: 0,
      trend: 'stable'
    };
  }

  const total = platformReviews.length;
  const totalRating = platformReviews.reduce((sum, r) => sum + r.rating, 0);
  const averageRating = totalRating / total;

  const positive = platformReviews.filter(r => {
    const sentiment = r.computedSentiment?.label || r.sentiment;
    return sentiment === 'Positive' || sentiment === 'positive';
  }).length;

  const negative = platformReviews.filter(r => {
    const sentiment = r.computedSentiment?.label || r.sentiment;
    return sentiment === 'Negative' || sentiment === 'negative';
  }).length;

  const neutral = total - positive - negative;

  const responded = platformReviews.filter(r => r.hasReply || r.reply).length;
  const verified = platformReviews.filter(r => r.verified).length;

  // Calculate trend (compare recent vs older)
  const midpoint = Math.floor(platformReviews.length / 2);
  const recentReviews = platformReviews.slice(0, midpoint);
  const olderReviews = platformReviews.slice(midpoint);

  const recentAvg = recentReviews.length > 0
    ? recentReviews.reduce((sum, r) => sum + r.rating, 0) / recentReviews.length
    : 0;

  const olderAvg = olderReviews.length > 0
    ? olderReviews.reduce((sum, r) => sum + r.rating, 0) / olderReviews.length
    : 0;

  let trend = 'stable';
  if (recentAvg > olderAvg + 0.2) trend = 'up';
  else if (recentAvg < olderAvg - 0.2) trend = 'down';

  return {
    platform,
    reviewCount: total,
    averageRating: averageRating.toFixed(1),
    positivePercent: Math.round((positive / total) * 100),
    negativePercent: Math.round((negative / total) * 100),
    neutralPercent: Math.round((neutral / total) * 100),
    responseRate: Math.round((responded / total) * 100),
    verifiedRate: Math.round((verified / total) * 100),
    trend,
    trendValue: recentAvg - olderAvg
  };
}

/**
 * Get all platform statistics
 */
export function getAllPlatformStats(reviews) {
  const platforms = [...new Set(reviews.map(r => r.platform))];

  return platforms.map(platform => calculatePlatformStats(reviews, platform));
}

/**
 * Calculate platform growth
 */
export function calculatePlatformGrowth(reviews, platform, periodDays = 30) {
  const platformReviews = reviews.filter(r => r.platform === platform);

  const today = new Date();
  const periodStart = new Date(today);
  periodStart.setDate(today.getDate() - periodDays);

  const previousPeriodStart = new Date(periodStart);
  previousPeriodStart.setDate(periodStart.getDate() - periodDays);

  const currentPeriod = platformReviews.filter(r => {
    const date = new Date(r.date);
    return date >= periodStart && date <= today;
  });

  const previousPeriod = platformReviews.filter(r => {
    const date = new Date(r.date);
    return date >= previousPeriodStart && date < periodStart;
  });

  const currentCount = currentPeriod.length;
  const previousCount = previousPeriod.length;

  const growth = previousCount > 0
    ? ((currentCount - previousCount) / previousCount) * 100
    : currentCount > 0 ? 100 : 0;

  const currentAvgRating = currentCount > 0
    ? currentPeriod.reduce((sum, r) => sum + r.rating, 0) / currentCount
    : 0;

  const previousAvgRating = previousCount > 0
    ? previousPeriod.reduce((sum, r) => sum + r.rating, 0) / previousCount
    : 0;

  const ratingChange = currentAvgRating - previousAvgRating;

  return {
    platform,
    growth: growth.toFixed(1),
    currentCount,
    previousCount,
    ratingChange: ratingChange.toFixed(2),
    trend: growth > 5 ? 'up' : growth < -5 ? 'down' : 'stable'
  };
}

/**
 * Get best performing platform
 */
export function getBestPlatform(platformStats) {
  return platformStats.reduce((best, current) => {
    if (!best) return current;

    const currentScore = parseFloat(current.averageRating) * 0.6 + (current.positivePercent / 100) * 0.4;
    const bestScore = parseFloat(best.averageRating) * 0.6 + (best.positivePercent / 100) * 0.4;

    return currentScore > bestScore ? current : best;
  }, null);
}

/**
 * Get worst performing platform
 */
export function getWorstPlatform(platformStats) {
  return platformStats.reduce((worst, current) => {
    if (!worst) return current;

    const currentScore = parseFloat(current.averageRating) * 0.6 + (current.positivePercent / 100) * 0.4;
    const worstScore = parseFloat(worst.averageRating) * 0.6 + (worst.positivePercent / 100) * 0.4;

    return currentScore < worstScore ? current : worst;
  }, null);
}

/**
 * Calculate platform response time
 */
export function calculatePlatformResponseTime(reviews, platform) {
  const platformReviews = reviews.filter(r => r.platform === platform && r.hasReply && r.reply);

  if (platformReviews.length === 0) return 0;

  const totalHours = platformReviews.reduce((sum, review) => {
    const reviewDate = new Date(review.date);
    const replyDate = new Date(review.reply.date);
    const diffHours = (replyDate - reviewDate) / (1000 * 60 * 60);
    return sum + diffHours;
  }, 0);

  return Math.round(totalHours / platformReviews.length);
}

/**
 * Platform performance comparison
 */
export function comparePlatforms(platformStats) {
  const sorted = [...platformStats].sort((a, b) => parseFloat(b.averageRating) - parseFloat(a.averageRating));

  return sorted.map((platform, index) => ({
    ...platform,
    rank: index + 1,
    topRated: index === 0,
    needsAttention: parseFloat(platform.averageRating) < 4.0 || platform.negativePercent > 25
  }));
}

/**
 * Get platform insights
 */
export function getPlatformInsights(platformStats) {
  const insights = [];

  platformStats.forEach(platform => {
    // Low response rate
    if (platform.responseRate < 50) {
      insights.push({
        type: 'opportunity',
        platform: platform.platform,
        message: `Response rate on ${platform.platform} is only ${platform.responseRate}%. Increase responses to improve engagement`,
        metric: `${platform.responseRate}%`,
        severity: 'medium'
      });
    }

    // High negative sentiment
    if (platform.negativePercent > 30) {
      insights.push({
        type: 'alert',
        platform: platform.platform,
        message: `${platform.platform} shows ${platform.negativePercent}% negative reviews. Investigate common complaints on this platform`,
        metric: `${platform.negativePercent}%`,
        severity: 'high'
      });
    }

    // Strong performance
    if (parseFloat(platform.averageRating) >= 4.5 && platform.positivePercent >= 70) {
      insights.push({
        type: 'strength',
        platform: platform.platform,
        message: `${platform.platform} is performing exceptionally well with ${platform.averageRating} average rating and ${platform.positivePercent}% positive reviews`,
        metric: `${platform.averageRating}★`,
        severity: 'low'
      });
    }

    // Trending down
    if (platform.trend === 'down') {
      insights.push({
        type: 'warning',
        platform: platform.platform,
        message: `Recent reviews on ${platform.platform} show a declining trend. Monitor closely and address issues`,
        metric: 'Declining',
        severity: 'medium'
      });
    }
  });

  return insights.sort((a, b) => {
    const severityOrder = { high: 0, medium: 1, low: 2 };
    return severityOrder[a.severity] - severityOrder[b.severity];
  });
}

/**
 * Calculate platform market share
 */
export function calculatePlatformMarketShare(platformStats) {
  const total = platformStats.reduce((sum, p) => sum + p.reviewCount, 0);

  return platformStats.map(platform => ({
    platform: platform.platform,
    reviews: platform.reviewCount,
    marketShare: total > 0 ? ((platform.reviewCount / total) * 100).toFixed(1) : 0
  }));
}
