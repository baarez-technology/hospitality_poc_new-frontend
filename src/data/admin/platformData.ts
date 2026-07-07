import { reviewsData } from './reviewsData';

/**
 * Platform Performance Data
 * Metrics by review platform
 */

const platforms = ["Google", "Booking.com", "TripAdvisor", "Expedia", "Yelp"];

const calculatePlatformMetrics = () => {
  return platforms.map((platform, index) => {
    const platformReviews = reviewsData.filter(r => r.platform === platform);
    const totalReviews = platformReviews.length;
    const avgRating = totalReviews > 0
      ? (platformReviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews).toFixed(1)
      : 0;

    const positiveCount = platformReviews.filter(r => r.sentiment === 'Positive').length;
    const responseCount = platformReviews.filter(r => r.hasReply).length;
    const responseRate = totalReviews > 0 ? ((responseCount / totalReviews) * 100).toFixed(0) : 0;

    // Growth vs last period (simulated)
    const growthValues = ['+12%', '+8%', '+5%', '+15%', '+3%'];

    return {
      id: index + 1,
      platform,
      totalReviews,
      avgRating: parseFloat(avgRating),
      positivePercentage: totalReviews > 0 ? Math.round((positiveCount / totalReviews) * 100) : 0,
      responseRate: parseInt(responseRate),
      growth: growthValues[index],
      trend: index % 3 === 0 ? 'up' : index % 3 === 1 ? 'stable' : 'down',
      lastReview: platformReviews.length > 0 ? platformReviews[0].date : null,
      verified: totalReviews > 0 ? Math.round((platformReviews.filter(r => r.verified).length / totalReviews) * 100) : 0
    };
  });
};

export const platformData = calculatePlatformMetrics();

// Platform summary
export const platformSummary = {
  totalPlatforms: platformData.length,
  avgRatingAcross: (platformData.reduce((sum, p) => sum + p.avgRating, 0) / platformData.length).toFixed(1),
  totalReviewsAcross: platformData.reduce((sum, p) => sum + p.totalReviews, 0),
  avgResponseRate: Math.round(platformData.reduce((sum, p) => sum + p.responseRate, 0) / platformData.length),
  topPlatform: platformData.reduce((max, p) => p.totalReviews > max.totalReviews ? p : max, platformData[0]).platform
};

// Platform distribution (for pie chart)
export const platformDistribution = platformData.map((p, index) => ({
  name: p.platform,
  value: p.totalReviews,
  percentage: ((p.totalReviews / platformSummary.totalReviewsAcross) * 100).toFixed(1),
  color: ['#2563eb', '#7c3aed', '#db2777', '#ea580c', '#16a34a'][index]
}));

// Rating distribution by platform
export const ratingByPlatform = platforms.map(platform => {
  const platformReviews = reviewsData.filter(r => r.platform === platform);

  return {
    platform,
    5: platformReviews.filter(r => r.rating === 5).length,
    4: platformReviews.filter(r => r.rating === 4).length,
    3: platformReviews.filter(r => r.rating === 3).length,
    2: platformReviews.filter(r => r.rating === 2).length,
    1: platformReviews.filter(r => r.rating === 1).length
  };
});

// Response time by platform (in hours)
export const responseTimeByPlatform = [
  { platform: 'Google', avgResponseTime: 12, median: 8, target: 24 },
  { platform: 'Booking.com', avgResponseTime: 18, median: 14, target: 24 },
  { platform: 'TripAdvisor', avgResponseTime: 15, median: 10, target: 24 },
  { platform: 'Expedia', avgResponseTime: 22, median: 18, target: 24 },
  { platform: 'Yelp', avgResponseTime: 16, median: 12, target: 24 }
];
