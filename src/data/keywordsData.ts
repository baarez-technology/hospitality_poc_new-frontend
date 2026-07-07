import { reviewsData } from './reviewsData';

/**
 * Keywords & Themes Data
 * Most mentioned words and phrases in reviews
 */

// Extract all keywords from reviews
const extractKeywords = () => {
  const keywordCounts = {};

  reviewsData.forEach(review => {
    review.keywords.forEach(keyword => {
      if (!keywordCounts[keyword]) {
        keywordCounts[keyword] = {
          word: keyword,
          count: 0,
          positive: 0,
          negative: 0,
          neutral: 0
        };
      }
      keywordCounts[keyword].count++;
      keywordCounts[keyword][review.sentiment.toLowerCase()]++;
    });
  });

  return Object.values(keywordCounts);
};

const allKeywords = extractKeywords();

// Top keywords overall
export const topKeywords = allKeywords
  .sort((a, b) => b.count - a.count)
  .slice(0, 30)
  .map((kw, index) => ({
    ...kw,
    size: Math.max(12, Math.min(48, 12 + (kw.count / 2))),
    sentiment: kw.positive > kw.negative ? 'positive' : kw.negative > kw.positive ? 'negative' : 'neutral',
    color: kw.positive > kw.negative ? '#10b981' : kw.negative > kw.positive ? '#ef4444' : '#f59e0b'
  }));

// Positive keywords
export const positiveKeywords = allKeywords
  .filter(kw => kw.positive > kw.negative + kw.neutral)
  .sort((a, b) => b.positive - a.positive)
  .slice(0, 15);

// Negative keywords
export const negativeKeywords = allKeywords
  .filter(kw => kw.negative > kw.positive + kw.neutral)
  .sort((a, b) => b.negative - a.negative)
  .slice(0, 15);

// Trending keywords (keywords with increasing mentions)
export const trendingKeywords = [
  { word: 'spa', count: 28, trend: '+45%', sentiment: 'positive' },
  { word: 'rooftop', count: 24, trend: '+38%', sentiment: 'positive' },
  { word: 'view', count: 42, trend: '+32%', sentiment: 'positive' },
  { word: 'breakfast', count: 38, trend: '+28%', sentiment: 'positive' },
  { word: 'staff', count: 68, trend: '+22%', sentiment: 'positive' },
  { word: 'parking', count: 22, trend: '+18%', sentiment: 'negative' },
  { word: 'price', count: 35, trend: '+15%', sentiment: 'negative' }
];

// Keyword clusters (related keywords)
export const keywordClusters = [
  {
    cluster: 'Service Quality',
    keywords: ['staff', 'service', 'helpful', 'friendly', 'attentive', 'professional'],
    totalMentions: 245,
    sentiment: 'positive',
    avgRating: 4.6
  },
  {
    cluster: 'Room Quality',
    keywords: ['room', 'clean', 'comfortable', 'spacious', 'bed', 'bathroom'],
    totalMentions: 198,
    sentiment: 'positive',
    avgRating: 4.4
  },
  {
    cluster: 'Location & Access',
    keywords: ['location', 'downtown', 'convenient', 'walking', 'nearby'],
    totalMentions: 156,
    sentiment: 'positive',
    avgRating: 4.5
  },
  {
    cluster: 'Value & Pricing',
    keywords: ['price', 'expensive', 'worth', 'value', 'overpriced'],
    totalMentions: 134,
    sentiment: 'neutral',
    avgRating: 3.8
  },
  {
    cluster: 'Amenities',
    keywords: ['pool', 'gym', 'spa', 'breakfast', 'wifi', 'parking'],
    totalMentions: 178,
    sentiment: 'positive',
    avgRating: 4.2
  }
];

// Seasonal keyword trends
export const seasonalKeywords = {
  summer: ['pool', 'air conditioning', 'rooftop', 'view', 'heat'],
  winter: ['heating', 'comfort', 'cozy', 'warm', 'fireplace'],
  business: ['wifi', 'desk', 'conference', 'business', 'location'],
  leisure: ['spa', 'pool', 'relax', 'vacation', 'beautiful']
};

// Comparison phrases
export const comparisonPhrases = [
  { phrase: 'best hotel', count: 18, sentiment: 'positive' },
  { phrase: 'better than expected', count: 24, sentiment: 'positive' },
  { phrase: 'worth the price', count: 15, sentiment: 'positive' },
  { phrase: 'not worth it', count: 8, sentiment: 'negative' },
  { phrase: 'disappointed', count: 12, sentiment: 'negative' },
  { phrase: 'exceeded expectations', count: 22, sentiment: 'positive' }
];
