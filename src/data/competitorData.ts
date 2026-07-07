/**
 * Competitor Comparison Data
 * Benchmarking against local competitors
 */

export const competitorData = [
  {
    id: 1,
    name: 'Terra Suites (You)',
    isYou: true,
    overallRating: 4.5,
    totalReviews: 250,
    googleRating: 4.6,
    bookingRating: 4.5,
    tripadvisorRating: 4.4,
    responseRate: 75,
    averageResponseTime: 15, // hours
    priceRange: '$$$',
    rank: 2,
    sentiment: {
      positive: 60,
      neutral: 20,
      negative: 20
    },
    strengths: ['Staff Service', 'Location', 'Cleanliness'],
    weaknesses: ['Price', 'Parking']
  },
  {
    id: 2,
    name: 'Grand Luxe Hotel',
    isYou: false,
    overallRating: 4.7,
    totalReviews: 412,
    googleRating: 4.8,
    bookingRating: 4.7,
    tripadvisorRating: 4.6,
    responseRate: 85,
    averageResponseTime: 10,
    priceRange: '$$$$',
    rank: 1,
    sentiment: {
      positive: 68,
      neutral: 18,
      negative: 14
    },
    strengths: ['Luxury Amenities', 'Spa', 'Fine Dining'],
    weaknesses: ['Very Expensive', 'Formal Atmosphere']
  },
  {
    id: 3,
    name: 'City Center Inn',
    isYou: false,
    overallRating: 4.2,
    totalReviews: 298,
    googleRating: 4.3,
    bookingRating: 4.2,
    tripadvisorRating: 4.1,
    responseRate: 52,
    averageResponseTime: 28,
    priceRange: '$$',
    rank: 4,
    sentiment: {
      positive: 52,
      neutral: 25,
      negative: 23
    },
    strengths: ['Value', 'Central Location', 'Breakfast'],
    weaknesses: ['Room Size', 'Dated Decor']
  },
  {
    id: 4,
    name: 'Riverside Resort',
    isYou: false,
    overallRating: 4.4,
    totalReviews: 356,
    googleRating: 4.5,
    bookingRating: 4.4,
    tripadvisorRating: 4.3,
    responseRate: 68,
    averageResponseTime: 18,
    priceRange: '$$$',
    rank: 3,
    sentiment: {
      positive: 58,
      neutral: 22,
      negative: 20
    },
    strengths: ['Pool', 'River Views', 'Family Friendly'],
    weaknesses: ['Distance from Downtown', 'Restaurant Quality']
  },
  {
    id: 5,
    name: 'Budget Stay Express',
    isYou: false,
    overallRating: 3.8,
    totalReviews: 187,
    googleRating: 3.9,
    bookingRating: 3.7,
    tripadvisorRating: 3.8,
    responseRate: 35,
    averageResponseTime: 48,
    priceRange: '$',
    rank: 5,
    sentiment: {
      positive: 42,
      neutral: 28,
      negative: 30
    },
    strengths: ['Low Price', 'Free Parking', 'Pet Friendly'],
    weaknesses: ['Basic Amenities', 'Cleanliness Issues']
  }
];

// Competitor comparison summary
export const competitorSummary = {
  yourRank: 2,
  totalCompetitors: 5,
  marketPosition: 'Strong',
  ratingGap: {
    toLeader: -0.2,
    toAverage: +0.3
  },
  strengths: ['Better than 60% of competitors', 'Response rate above average'],
  opportunities: ['Improve response time', 'Increase review volume']
};

// Rating trends comparison (last 6 months)
export const competitorRatingTrends = [
  {
    month: 'Jun',
    'Terra Suites': 4.3,
    'Grand Luxe': 4.6,
    'City Center': 4.1,
    'Riverside': 4.3,
    'Budget Stay': 3.7
  },
  {
    month: 'Jul',
    'Terra Suites': 4.4,
    'Grand Luxe': 4.6,
    'City Center': 4.2,
    'Riverside': 4.4,
    'Budget Stay': 3.8
  },
  {
    month: 'Aug',
    'Terra Suites': 4.4,
    'Grand Luxe': 4.7,
    'City Center': 4.2,
    'Riverside': 4.4,
    'Budget Stay': 3.8
  },
  {
    month: 'Sep',
    'Terra Suites': 4.5,
    'Grand Luxe': 4.7,
    'City Center': 4.2,
    'Riverside': 4.4,
    'Budget Stay': 3.7
  },
  {
    month: 'Oct',
    'Terra Suites': 4.5,
    'Grand Luxe': 4.7,
    'City Center': 4.2,
    'Riverside': 4.3,
    'Budget Stay': 3.8
  },
  {
    month: 'Nov',
    'Terra Suites': 4.5,
    'Grand Luxe': 4.7,
    'City Center': 4.2,
    'Riverside': 4.4,
    'Budget Stay': 3.8
  }
];

// Market share by review volume
export const marketShare = competitorData.map(comp => ({
  name: comp.name,
  reviews: comp.totalReviews,
  percentage: ((comp.totalReviews / competitorData.reduce((sum, c) => sum + c.totalReviews, 0)) * 100).toFixed(1)
}));
