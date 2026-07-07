import { useMemo } from 'react';
import { useSentimentEngine } from './useSentimentEngine';
import { useKeywordExtractor } from './useKeywordExtractor';
import { useReviewsFilters } from './useReviewsFilters';
import { useReviewsSorting } from './useReviewsSorting';
import { useAIReply } from './useAIReply';
import {
  calculateOverallScore,
  calculateSentimentScore,
  calculateResponseRate,
  calculateAvgResponseTime,
  getStarDistribution,
  aggregateByPlatform,
  calculateDailyTrends,
  calculateWeeklyAggregates,
  calculateMonthlyAggregates,
  calculateVerificationRate
} from '../utils/reviewAggregation';
import { getAllPlatformStats, getPlatformInsights } from '../utils/platformAnalytics';
import { getCompetitiveInsights, calculateMarketPosition } from '../utils/competitorModel';

/**
 * Master Reputation Hook
 * Orchestrates all reputation dashboard functionality
 */
export function useReputation(baseReviews, competitorsData) {
  // Sentiment Analysis
  const sentimentEngine = useSentimentEngine(baseReviews);
  const { analyzedReviews, sentimentData, sentimentScore } = sentimentEngine;

  // Filters
  const {
    filters,
    filteredReviews: preFilteredReviews,
    updateFilter,
    updateFilters,
    clearFilters,
    hasActiveFilters,
    activeFilterCount
  } = useReviewsFilters(analyzedReviews);

  // Sorting
  const {
    sortOption,
    setSortOption,
    sortedReviews,
    sortOptions
  } = useReviewsSorting(preFilteredReviews);

  // Final reviews (filtered + sorted)
  const reviews = sortedReviews;

  // Keyword Extraction
  const keywordEngine = useKeywordExtractor(reviews);
  const { topKeywords, trendingKeywords, topIssues, topStrengths } = keywordEngine;

  // AI Reply
  const { generateReply, generateQuickReply } = useAIReply();

  // Calculate KPIs
  const kpis = useMemo(() => {
    return {
      overallScore: calculateOverallScore(reviews),
      sentimentScore,
      totalReviews: reviews.length,
      responseRate: calculateResponseRate(reviews),
      avgResponseTime: calculateAvgResponseTime(reviews),
      verificationRate: calculateVerificationRate(reviews),
      positivePercent: sentimentEngine.distribution.positivePercent,
      negativePercent: sentimentEngine.distribution.negativePercent,
      neutralPercent: sentimentEngine.distribution.neutralPercent
    };
  }, [reviews, sentimentScore, sentimentEngine.distribution]);

  // Star Distribution
  const starDistribution = useMemo(() => {
    return getStarDistribution(reviews);
  }, [reviews]);

  // Platform Analytics
  const platformStats = useMemo(() => {
    return getAllPlatformStats(reviews);
  }, [reviews]);

  const platformInsights = useMemo(() => {
    return getPlatformInsights(platformStats);
  }, [platformStats]);

  // Platform aggregation
  const platformAggregation = useMemo(() => {
    return aggregateByPlatform(reviews);
  }, [reviews]);

  // Trends
  const dailyTrends = useMemo(() => {
    return calculateDailyTrends(reviews, 30);
  }, [reviews]);

  const weeklyTrends = useMemo(() => {
    return calculateWeeklyAggregates(reviews);
  }, [reviews]);

  const monthlyTrends = useMemo(() => {
    return calculateMonthlyAggregates(reviews);
  }, [reviews]);

  // Competitor Analysis
  const competitorAnalysis = useMemo(() => {
    if (!competitorsData || competitorsData.length === 0) {
      return {
        insights: [],
        position: { position: 'Unknown', overallScore: 0 },
        yourData: {}
      };
    }

    const yourData = {
      rating: parseFloat(kpis.overallScore),
      reviewCount: kpis.totalReviews,
      responseRate: kpis.responseRate
    };

    const insights = getCompetitiveInsights(yourData, competitorsData);
    const position = calculateMarketPosition(yourData, competitorsData);

    return {
      insights,
      position,
      yourData
    };
  }, [competitorsData, kpis]);

  // AI Insights Generator
  const aiInsights = useMemo(() => {
    const insights = [];

    // Response rate insight
    if (kpis.responseRate < 75) {
      insights.push({
        type: 'opportunity',
        title: 'Increase Response Rate',
        message: `Your response rate is ${kpis.responseRate}%. Responding to more reviews can improve guest engagement and sentiment. Aim for 85%+.`,
        metric: `${kpis.responseRate}%`,
        impact: 'High',
        actionRequired: true
      });
    }

    // Negative sentiment spike
    if (kpis.negativePercent > 25) {
      const topIssue = topIssues[0];
      insights.push({
        type: 'alert',
        title: 'Negative Sentiment Alert',
        message: `${kpis.negativePercent.toFixed(0)}% of reviews are negative. Top issue: "${topIssue?.issue || 'various concerns'}". Address immediately.`,
        metric: `${kpis.negativePercent.toFixed(0)}%`,
        impact: 'High',
        actionRequired: true
      });
    }

    // Trending keyword insight
    if (trendingKeywords.length > 0) {
      const topTrending = trendingKeywords[0];
      insights.push({
        type: 'recommendation',
        title: 'Trending Topic Detected',
        message: `"${topTrending.word}" mentions increased ${topTrending.trend}. ${topTrending.sentiment === 'positive' ? 'Leverage this strength in marketing' : 'Investigate and address concerns'}.`,
        metric: topTrending.trend,
        impact: 'Medium',
        actionRequired: topTrending.sentiment === 'negative'
      });
    }

    // Strength highlight
    if (topStrengths.length > 0) {
      const topStrength = topStrengths[0];
      insights.push({
        type: 'strength',
        title: 'Key Strength Identified',
        message: `"${topStrength.strength}" is your top-mentioned positive attribute with ${topStrength.mentions} mentions. Highlight this in your marketing.`,
        metric: `${topStrength.mentions} mentions`,
        impact: 'Positive',
        actionRequired: false
      });
    }

    // Platform-specific insights
    platformInsights.forEach(insight => {
      if (insight.severity === 'high' || insight.severity === 'medium') {
        insights.push({
          type: insight.type,
          title: `${insight.platform} Performance`,
          message: insight.message,
          metric: insight.metric,
          impact: insight.severity === 'high' ? 'High' : 'Medium',
          actionRequired: insight.severity === 'high'
        });
      }
    });

    // Competitor insights
    if (competitorAnalysis.insights.length > 0) {
      competitorAnalysis.insights.slice(0, 2).forEach(insight => {
        insights.push({
          type: insight.type,
          title: 'Competitive Position',
          message: insight.message,
          metric: '',
          impact: insight.confidence === 'high' ? 'High' : 'Medium',
          actionRequired: insight.actionRequired || false
        });
      });
    }

    return insights.slice(0, 8); // Limit to 8 insights
  }, [kpis, topIssues, topStrengths, trendingKeywords, platformInsights, competitorAnalysis]);

  return {
    // Reviews
    reviews,
    analyzedReviews,
    totalReviews: baseReviews.length,
    filteredCount: reviews.length,

    // Filters & Sorting
    filters,
    updateFilter,
    updateFilters,
    clearFilters,
    hasActiveFilters,
    activeFilterCount,
    sortOption,
    setSortOption,
    sortOptions,

    // KPIs
    kpis,
    starDistribution,

    // Sentiment
    sentimentData,
    sentimentScore,
    sentimentDistribution: sentimentEngine.distribution,
    weeklyTrend: sentimentEngine.weeklyTrend,
    monthlyTrend: sentimentEngine.monthlyTrend,

    // Keywords
    keywords: topKeywords,
    trendingKeywords,
    topIssues,
    topStrengths,

    // Platforms
    platformStats,
    platformAggregation,
    platformInsights,

    // Trends
    dailyTrends,
    weeklyTrends,
    monthlyTrends,

    // Competitors
    competitorAnalysis,

    // AI Features
    aiInsights,
    generateReply,
    generateQuickReply
  };
}
