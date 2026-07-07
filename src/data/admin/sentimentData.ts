import { reviewsData } from './reviewsData';

/**
 * Sentiment Analysis Data
 * Aggregated sentiment metrics and trends
 */

// Overall sentiment breakdown
export const sentimentBreakdown = [
  {
    sentiment: 'Positive',
    count: reviewsData.filter(r => r.sentiment === 'Positive').length,
    percentage: ((reviewsData.filter(r => r.sentiment === 'Positive').length / reviewsData.length) * 100).toFixed(1),
    color: '#10b981',
    trend: '+3.2%'
  },
  {
    sentiment: 'Neutral',
    count: reviewsData.filter(r => r.sentiment === 'Neutral').length,
    percentage: ((reviewsData.filter(r => r.sentiment === 'Neutral').length / reviewsData.length) * 100).toFixed(1),
    color: '#f59e0b',
    trend: '-1.5%'
  },
  {
    sentiment: 'Negative',
    count: reviewsData.filter(r => r.sentiment === 'Negative').length,
    percentage: ((reviewsData.filter(r => r.sentiment === 'Negative').length / reviewsData.length) * 100).toFixed(1),
    color: '#ef4444',
    trend: '-1.8%'
  }
];

// Sentiment trend over time (last 12 weeks)
const generateSentimentTrend = () => {
  const weeks = [];
  const today = new Date();

  for (let i = 11; i >= 0; i--) {
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - (i * 7));

    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);

    const weekReviews = reviewsData.filter(r => {
      const reviewDate = new Date(r.date);
      return reviewDate >= weekStart && reviewDate <= weekEnd;
    });

    const positive = weekReviews.filter(r => r.sentiment === 'Positive').length;
    const negative = weekReviews.filter(r => r.sentiment === 'Negative').length;
    const neutral = weekReviews.filter(r => r.sentiment === 'Neutral').length;

    weeks.push({
      week: `Week ${12 - i}`,
      date: weekStart.toISOString().split('T')[0],
      positive,
      negative,
      neutral,
      total: weekReviews.length,
      averageRating: weekReviews.length > 0
        ? (weekReviews.reduce((sum, r) => sum + r.rating, 0) / weekReviews.length).toFixed(1)
        : 0
    });
  }

  return weeks;
};

export const sentimentTrend = generateSentimentTrend();

// Sentiment by category/aspect
export const sentimentByCategory = [
  {
    category: 'Cleanliness',
    positive: 85,
    negative: 8,
    neutral: 7,
    score: 4.6,
    mentions: 142
  },
  {
    category: 'Staff & Service',
    positive: 78,
    negative: 12,
    neutral: 10,
    score: 4.4,
    mentions: 189
  },
  {
    category: 'Location',
    positive: 82,
    negative: 5,
    neutral: 13,
    score: 4.5,
    mentions: 156
  },
  {
    category: 'Value for Money',
    positive: 65,
    negative: 22,
    neutral: 13,
    score: 3.9,
    mentions: 134
  },
  {
    category: 'Amenities',
    positive: 72,
    negative: 15,
    neutral: 13,
    score: 4.2,
    mentions: 128
  },
  {
    category: 'Comfort',
    positive: 80,
    negative: 10,
    neutral: 10,
    score: 4.5,
    mentions: 167
  }
];

// Top positive themes
export const positiveThemes = [
  { theme: 'Friendly Staff', mentions: 98, percentage: 65 },
  { theme: 'Clean Rooms', mentions: 87, percentage: 58 },
  { theme: 'Great Location', mentions: 76, percentage: 51 },
  { theme: 'Comfortable Beds', mentions: 72, percentage: 48 },
  { theme: 'Beautiful Views', mentions: 65, percentage: 43 },
  { theme: 'Excellent Breakfast', mentions: 58, percentage: 39 }
];

// Top negative themes
export const negativeThemes = [
  { theme: 'Price Too High', mentions: 18, percentage: 36 },
  { theme: 'Noise Issues', mentions: 12, percentage: 24 },
  { theme: 'Small Rooms', mentions: 10, percentage: 20 },
  { theme: 'Parking Expensive', mentions: 8, percentage: 16 },
  { theme: 'Slow Check-in', mentions: 7, percentage: 14 },
  { theme: 'Wifi Problems', mentions: 5, percentage: 10 }
];

// Sentiment score history (last 6 months)
export const sentimentScoreHistory = [
  { month: 'Jun', score: 4.1, reviews: 38 },
  { month: 'Jul', score: 4.2, reviews: 42 },
  { month: 'Aug', score: 4.3, reviews: 45 },
  { month: 'Sep', score: 4.4, reviews: 48 },
  { month: 'Oct', score: 4.3, reviews: 41 },
  { month: 'Nov', score: 4.5, reviews: 36 }
];
