import { useState, useMemo } from 'react';
import { filterByPreset, filterByDateRange } from '@/utils/admin/reviewDateFilter';
import { searchReviews } from '@/utils/admin/reviewSearch';

/**
 * Reviews Filtering Hook
 * Manage all review filters
 */
export function useReviewsFilters(reviews) {
  const [filters, setFilters] = useState({
    rating: null, // 1-5 or null for all
    sentiment: null, // 'positive', 'neutral', 'negative', or null
    platform: null, // platform name or null
    dateRange: '30d', // '7d', '30d', '90d', 'ytd', 'all'
    startDate: null,
    endDate: null,
    hasReply: null, // true, false, or null
    verified: null, // true, false, or null
    searchQuery: ''
  });

  // Apply all filters
  const filteredReviews = useMemo(() => {
    let filtered = [...reviews];

    // Date range filter
    if (filters.dateRange && filters.dateRange !== 'all') {
      filtered = filterByPreset(filtered, filters.dateRange);
    } else if (filters.startDate || filters.endDate) {
      filtered = filterByDateRange(filtered, filters.startDate, filters.endDate);
    }

    // Rating filter
    if (filters.rating !== null) {
      filtered = filtered.filter(r => r.rating === filters.rating);
    }

    // Sentiment filter
    if (filters.sentiment) {
      filtered = filtered.filter(r => {
        const sentiment = r.computedSentiment?.label || r.sentiment;
        return sentiment?.toLowerCase() === filters.sentiment.toLowerCase();
      });
    }

    // Platform filter
    if (filters.platform) {
      filtered = filtered.filter(r => r.platform === filters.platform);
    }

    // Has reply filter
    if (filters.hasReply !== null) {
      filtered = filtered.filter(r => (r.hasReply || !!r.reply) === filters.hasReply);
    }

    // Verified filter
    if (filters.verified !== null) {
      filtered = filtered.filter(r => r.verified === filters.verified);
    }

    // Search query
    if (filters.searchQuery && filters.searchQuery.trim()) {
      filtered = searchReviews(filtered, filters.searchQuery);
    }

    return filtered;
  }, [reviews, filters]);

  // Update single filter
  const updateFilter = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // Update multiple filters
  const updateFilters = (newFilters) => {
    setFilters(prev => ({
      ...prev,
      ...newFilters
    }));
  };

  // Clear all filters
  const clearFilters = () => {
    setFilters({
      rating: null,
      sentiment: null,
      platform: null,
      dateRange: '30d',
      startDate: null,
      endDate: null,
      hasReply: null,
      verified: null,
      searchQuery: ''
    });
  };

  // Check if any filters are active
  const hasActiveFilters = useMemo(() => {
    return (
      filters.rating !== null ||
      filters.sentiment !== null ||
      filters.platform !== null ||
      (filters.dateRange !== '30d' && filters.dateRange !== 'all') ||
      filters.startDate !== null ||
      filters.endDate !== null ||
      filters.hasReply !== null ||
      filters.verified !== null ||
      (filters.searchQuery && filters.searchQuery.trim() !== '')
    );
  }, [filters]);

  // Get active filter count
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.rating !== null) count++;
    if (filters.sentiment !== null) count++;
    if (filters.platform !== null) count++;
    if (filters.dateRange !== '30d' && filters.dateRange !== 'all') count++;
    if (filters.hasReply !== null) count++;
    if (filters.verified !== null) count++;
    if (filters.searchQuery && filters.searchQuery.trim() !== '') count++;
    return count;
  }, [filters]);

  return {
    filters,
    filteredReviews,
    updateFilter,
    updateFilters,
    clearFilters,
    hasActiveFilters,
    activeFilterCount
  };
}
