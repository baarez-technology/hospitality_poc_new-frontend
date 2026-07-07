import { useMemo } from 'react';
import {
  extractKeywordsFromReviews,
  getKeywordsBySentiment,
  getTrendingKeywords,
  getCommonPhrases
} from '../utils/keywordMath';

/**
 * Keyword Extraction Hook
 * Extract and analyze keywords from reviews
 */
export function useKeywordExtractor(reviews) {
  // Extract all keywords
  const allKeywords = useMemo(() => {
    return extractKeywordsFromReviews(reviews, 2);
  }, [reviews]);

  // Get top keywords (with size for word cloud)
  const topKeywords = useMemo(() => {
    return allKeywords.slice(0, 50).map((kw, index) => ({
      ...kw,
      size: Math.max(12, Math.min(48, 12 + (kw.count / 2))),
      color: kw.sentiment === 'positive' ? '#10b981' : kw.sentiment === 'negative' ? '#ef4444' : '#f59e0b'
    }));
  }, [allKeywords]);

  // Get positive keywords
  const positiveKeywords = useMemo(() => {
    return getKeywordsBySentiment(allKeywords, 'positive', 15);
  }, [allKeywords]);

  // Get negative keywords
  const negativeKeywords = useMemo(() => {
    return getKeywordsBySentiment(allKeywords, 'negative', 15);
  }, [allKeywords]);

  // Get trending keywords
  const trendingKeywords = useMemo(() => {
    const trending = getTrendingKeywords(reviews, 7);
    return trending.slice(0, 10).map(kw => ({
      word: kw.word,
      count: kw.count,
      trend: `+${kw.trend}%`,
      sentiment: kw.sentiment
    }));
  }, [reviews]);

  // Get common phrases
  const commonPhrases = useMemo(() => {
    return getCommonPhrases(reviews, 3).slice(0, 10);
  }, [reviews]);

  // Top mentioned issues (negative keywords)
  const topIssues = useMemo(() => {
    return negativeKeywords.slice(0, 5).map(kw => ({
      issue: kw.word,
      mentions: kw.count,
      reviewIds: kw.reviews
    }));
  }, [negativeKeywords]);

  // Top strengths (positive keywords)
  const topStrengths = useMemo(() => {
    return positiveKeywords.slice(0, 5).map(kw => ({
      strength: kw.word,
      mentions: kw.count,
      reviewIds: kw.reviews
    }));
  }, [positiveKeywords]);

  return {
    allKeywords,
    topKeywords,
    positiveKeywords,
    negativeKeywords,
    trendingKeywords,
    commonPhrases,
    topIssues,
    topStrengths
  };
}
