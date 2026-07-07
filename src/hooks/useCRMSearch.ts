import { useState, useMemo, useCallback } from 'react';
import { searchGuests, getSearchSuggestions } from '../utils/crmSearchMath';

/**
 * CRM Search Hook
 * Handles fuzzy search across guest data
 */
export function useCRMSearch(guests) {
  const [searchQuery, setSearchQuery] = useState('');

  // Perform search
  const searchResults = useMemo(() => {
    if (!searchQuery || searchQuery.trim().length === 0) {
      return guests;
    }

    return searchGuests(guests, searchQuery);
  }, [guests, searchQuery]);

  // Get search suggestions
  const suggestions = useMemo(() => {
    if (!searchQuery || searchQuery.trim().length < 2) {
      return [];
    }

    return getSearchSuggestions(guests, searchQuery, 5);
  }, [guests, searchQuery]);

  // Update search query
  const updateSearch = useCallback((query) => {
    setSearchQuery(query);
  }, []);

  // Clear search
  const clearSearch = useCallback(() => {
    setSearchQuery('');
  }, []);

  // Check if search is active
  const isSearching = useMemo(() => {
    return searchQuery && searchQuery.trim().length > 0;
  }, [searchQuery]);

  return {
    searchQuery,
    searchResults,
    suggestions,
    updateSearch,
    clearSearch,
    isSearching,
    resultCount: searchResults.length
  };
}
