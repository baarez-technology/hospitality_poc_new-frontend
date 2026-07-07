import { useMemo } from 'react';
import {
  analyzeSentiment,
  analyzeBatchSentiment,
  calculateSentimentTrend,
  getSentimentDistribution
} from '@/utils/admin/sentimentMath';

/**
 * Sentiment Analysis Hook
 * Analyze sentiment across all reviews
 */
export function useSentimentEngine(reviews) {
  // Analyze all reviews
  const analyzedReviews = useMemo(() => {
    return analyzeBatchSentiment(reviews);
  }, [reviews]);

  // Get sentiment distribution
  const distribution = useMemo(() => {
    return getSentimentDistribution(analyzedReviews);
  }, [analyzedReviews]);

  // Calculate 7-day trend
  const weeklyTrend = useMemo(() => {
    return calculateSentimentTrend(analyzedReviews, 7);
  }, [analyzedReviews]);

  // Calculate 30-day trend
  const monthlyTrend = useMemo(() => {
    return calculateSentimentTrend(analyzedReviews, 30);
  }, [analyzedReviews]);

  // Sentiment breakdown for charts
  const sentimentData = useMemo(() => {
    return [
      {
        sentiment: 'Positive',
        count: distribution.positive,
        percentage: distribution.positivePercent.toFixed(1),
        color: '#10b981',
        trend: '+3.2%'
      },
      {
        sentiment: 'Neutral',
        count: distribution.neutral,
        percentage: distribution.neutralPercent.toFixed(1),
        color: '#f59e0b',
        trend: '-1.5%'
      },
      {
        sentiment: 'Negative',
        count: distribution.negative,
        percentage: distribution.negativePercent.toFixed(1),
        color: '#ef4444',
        trend: '-1.8%'
      }
    ];
  }, [distribution]);

  // Overall sentiment score (0-100)
  const sentimentScore = useMemo(() => {
    if (analyzedReviews.length === 0) return 0;

    const avgScore = analyzedReviews.reduce((sum, review) => {
      return sum + (review.computedSentiment?.score || 0.5);
    }, 0) / analyzedReviews.length;

    return Math.round(avgScore * 100);
  }, [analyzedReviews]);

  return {
    analyzedReviews,
    distribution,
    sentimentData,
    sentimentScore,
    weeklyTrend,
    monthlyTrend,
    analyzeSentiment: (text, rating) => analyzeSentiment(text, rating)
  };
}
