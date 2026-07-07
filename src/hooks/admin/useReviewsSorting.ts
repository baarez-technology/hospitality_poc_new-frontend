import { useState, useMemo } from 'react';

/**
 * Reviews Sorting Hook
 * Sort reviews by various criteria
 */
export function useReviewsSorting(reviews) {
  const [sortOption, setSortOption] = useState('recent'); // recent, oldest, highest, lowest, sentiment, length

  const sortedReviews = useMemo(() => {
    const sorted = [...reviews];

    switch (sortOption) {
      case 'recent':
        return sorted.sort((a, b) => new Date(b.date) - new Date(a.date));

      case 'oldest':
        return sorted.sort((a, b) => new Date(a.date) - new Date(b.date));

      case 'highest':
        return sorted.sort((a, b) => b.rating - a.rating || new Date(b.date) - new Date(a.date));

      case 'lowest':
        return sorted.sort((a, b) => a.rating - b.rating || new Date(b.date) - new Date(a.date));

      case 'sentiment':
        return sorted.sort((a, b) => {
          const sentimentOrder = { positive: 0, neutral: 1, negative: 2 };
          const aSentiment = (a.computedSentiment?.label || a.sentiment || 'neutral').toLowerCase();
          const bSentiment = (b.computedSentiment?.label || b.sentiment || 'neutral').toLowerCase();

          const orderDiff = sentimentOrder[aSentiment] - sentimentOrder[bSentiment];
          if (orderDiff !== 0) return orderDiff;

          return new Date(b.date) - new Date(a.date);
        });

      case 'length':
        return sorted.sort((a, b) => {
          const lengthDiff = b.reviewText.length - a.reviewText.length;
          if (lengthDiff !== 0) return lengthDiff;

          return new Date(b.date) - new Date(a.date);
        });

      case 'platform':
        return sorted.sort((a, b) => {
          const platformCompare = a.platform.localeCompare(b.platform);
          if (platformCompare !== 0) return platformCompare;

          return new Date(b.date) - new Date(a.date);
        });

      case 'helpful':
        return sorted.sort((a, b) => {
          const helpfulDiff = (b.helpful || 0) - (a.helpful || 0);
          if (helpfulDiff !== 0) return helpfulDiff;

          return new Date(b.date) - new Date(a.date);
        });

      default:
        return sorted;
    }
  }, [reviews, sortOption]);

  // Sort options for dropdown
  const sortOptions = [
    { value: 'recent', label: 'Most Recent' },
    { value: 'oldest', label: 'Oldest First' },
    { value: 'highest', label: 'Highest Rating' },
    { value: 'lowest', label: 'Lowest Rating' },
    { value: 'sentiment', label: 'By Sentiment' },
    { value: 'length', label: 'By Length' },
    { value: 'platform', label: 'By Platform' },
    { value: 'helpful', label: 'Most Helpful' }
  ];

  return {
    sortOption,
    setSortOption,
    sortedReviews,
    sortOptions
  };
}
