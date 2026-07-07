/**
 * Competitor Comparison Logic
 * Analyze and compare with competitors
 */

/**
 * Compare ratings
 */
export function compareRatings(yourRating, competitors) {
  const allRatings = [yourRating, ...competitors.map(c => c.overallRating)];
  const avgCompetitorRating = competitors.reduce((sum, c) => sum + c.overallRating, 0) / competitors.length;

  const sorted = [...allRatings].sort((a, b) => b - a);
  const yourRank = sorted.indexOf(yourRating) + 1;
  const leaderRating = sorted[0];

  return {
    yourRating,
    avgCompetitorRating: avgCompetitorRating.toFixed(1),
    gapToLeader: (yourRating - leaderRating).toFixed(1),
    gapToAverage: (yourRating - avgCompetitorRating).toFixed(1),
    yourRank,
    totalCompetitors: allRatings.length,
    percentile: Math.round(((allRatings.length - yourRank + 1) / allRatings.length) * 100)
  };
}

/**
 * Compare review volumes
 */
export function compareReviewVolumes(yourCount, competitors) {
  const allCounts = [yourCount, ...competitors.map(c => c.totalReviews)];
  const avgCompetitorCount = competitors.reduce((sum, c) => sum + c.totalReviews, 0) / competitors.length;

  const sorted = [...allCounts].sort((a, b) => b - a);
  const yourRank = sorted.indexOf(yourCount) + 1;

  return {
    yourCount,
    avgCompetitorCount: Math.round(avgCompetitorCount),
    marketShare: ((yourCount / allCounts.reduce((sum, c) => sum + c, 0)) * 100).toFixed(1),
    yourRank,
    gapToLeader: yourCount - sorted[0]
  };
}

/**
 * Compare response rates
 */
export function compareResponseRates(yourRate, competitors) {
  const allRates = [yourRate, ...competitors.map(c => c.responseRate)];
  const avgCompetitorRate = competitors.reduce((sum, c) => sum + c.responseRate, 0) / competitors.length;

  const sorted = [...allRates].sort((a, b) => b - a);
  const yourRank = sorted.indexOf(yourRate) + 1;

  return {
    yourRate,
    avgCompetitorRate: Math.round(avgCompetitorRate),
    gapToAverage: Math.round(yourRate - avgCompetitorRate),
    yourRank,
    percentile: Math.round(((allRates.length - yourRank + 1) / allRates.length) * 100)
  };
}

/**
 * Identify strengths vs competitors
 */
export function identifyStrengths(yourMetrics, competitors) {
  const strengths = [];
  const weaknesses = [];

  // Rating comparison
  const avgRating = competitors.reduce((sum, c) => sum + c.overallRating, 0) / competitors.length;
  if (yourMetrics.rating > avgRating) {
    strengths.push({
      area: 'Overall Rating',
      value: yourMetrics.rating,
      advantage: (yourMetrics.rating - avgRating).toFixed(1)
    });
  } else {
    weaknesses.push({
      area: 'Overall Rating',
      value: yourMetrics.rating,
      gap: (avgRating - yourMetrics.rating).toFixed(1)
    });
  }

  // Response rate comparison
  const avgResponseRate = competitors.reduce((sum, c) => sum + c.responseRate, 0) / competitors.length;
  if (yourMetrics.responseRate > avgResponseRate) {
    strengths.push({
      area: 'Response Rate',
      value: `${yourMetrics.responseRate}%`,
      advantage: `${Math.round(yourMetrics.responseRate - avgResponseRate)}%`
    });
  } else {
    weaknesses.push({
      area: 'Response Rate',
      value: `${yourMetrics.responseRate}%`,
      gap: `${Math.round(avgResponseRate - yourMetrics.responseRate)}%`
    });
  }

  return { strengths, weaknesses };
}

/**
 * Calculate market position
 */
export function calculateMarketPosition(yourData, competitors) {
  const ratings = compareRatings(yourData.rating, competitors);
  const volumes = compareReviewVolumes(yourData.reviewCount, competitors);
  const responses = compareResponseRates(yourData.responseRate, competitors);

  let position = 'Average';

  if (ratings.yourRank === 1 && volumes.yourRank <= 2) {
    position = 'Market Leader';
  } else if (ratings.yourRank <= 2) {
    position = 'Strong';
  } else if (ratings.yourRank > competitors.length * 0.7) {
    position = 'Below Average';
  }

  return {
    position,
    ratingRank: ratings.yourRank,
    volumeRank: volumes.yourRank,
    responseRank: responses.yourRank,
    overallScore: Math.round((ratings.percentile + responses.percentile) / 2)
  };
}

/**
 * Calculate growth vs competitors
 */
export function compareGrowth(yourGrowth, competitors) {
  const competitorGrowths = competitors.map(c => {
    // Extract growth from trend string (e.g., "+12%" -> 12)
    const match = c.growth?.match(/([+-]?\d+)/);
    return match ? parseFloat(match[1]) : 0;
  });

  const avgGrowth = competitorGrowths.reduce((sum, g) => sum + g, 0) / competitorGrowths.length;

  return {
    yourGrowth,
    avgCompetitorGrowth: avgGrowth.toFixed(1),
    outperforming: yourGrowth > avgGrowth,
    gap: (yourGrowth - avgGrowth).toFixed(1)
  };
}

/**
 * Get competitive insights
 */
export function getCompetitiveInsights(yourData, competitors) {
  const insights = [];

  const ratings = compareRatings(yourData.rating, competitors);
  const { strengths, weaknesses } = identifyStrengths(yourData, competitors);
  const position = calculateMarketPosition(yourData, competitors);

  // Ranking insight
  if (ratings.yourRank === 1) {
    insights.push({
      type: 'strength',
      message: `You are the #1 rated property in your competitive set with ${yourData.rating} stars`,
      confidence: 'high'
    });
  } else if (ratings.yourRank === 2) {
    insights.push({
      type: 'opportunity',
      message: `You are ${Math.abs(parseFloat(ratings.gapToLeader))} points away from becoming the market leader`,
      confidence: 'high',
      actionRequired: true
    });
  } else if (ratings.yourRank > 3) {
    insights.push({
      type: 'alert',
      message: `Your rating ranks #${ratings.yourRank} among competitors. Focus on improving guest satisfaction`,
      confidence: 'high',
      actionRequired: true
    });
  }

  // Response rate insight
  const avgResponseRate = competitors.reduce((sum, c) => sum + c.responseRate, 0) / competitors.length;
  if (yourData.responseRate < avgResponseRate - 10) {
    insights.push({
      type: 'opportunity',
      message: `Your response rate (${yourData.responseRate}%) is below the competitive average (${Math.round(avgResponseRate)}%). Increase responses to improve engagement`,
      confidence: 'medium',
      actionRequired: true
    });
  }

  // Volume insight
  const volumes = compareReviewVolumes(yourData.reviewCount, competitors);
  if (volumes.yourRank > 3) {
    insights.push({
      type: 'recommendation',
      message: `Consider implementing review generation campaigns. You have ${yourData.reviewCount} reviews vs competitor average of ${volumes.avgCompetitorCount}`,
      confidence: 'medium'
    });
  }

  return insights;
}

/**
 * Compare by price segment
 */
export function compareByPriceSegment(yourPriceRange, competitors) {
  const samePriceSegment = competitors.filter(c => c.priceRange === yourPriceRange);

  if (samePriceSegment.length === 0) {
    return {
      peers: [],
      avgRating: 0,
      comparison: 'No direct competitors in same price range'
    };
  }

  const avgRating = samePriceSegment.reduce((sum, c) => sum + c.overallRating, 0) / samePriceSegment.length;

  return {
    peers: samePriceSegment,
    avgRating: avgRating.toFixed(1),
    count: samePriceSegment.length
  };
}
