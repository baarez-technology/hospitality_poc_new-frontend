import { useState } from 'react';

/**
 * Custom hook for managing filter state
 */
export function useFilters() {
  const [filters, setFilters] = useState({
    country: 'all',
    emotion: 'all',
    status: 'all',
    lastStayFrom: '',
    lastStayTo: ''
  });

  const updateFilter = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      country: 'all',
      emotion: 'all',
      status: 'all',
      lastStayFrom: '',
      lastStayTo: ''
    });
  };

  const hasActiveFilters = () => {
    return filters.country !== 'all'
      || filters.emotion !== 'all'
      || filters.status !== 'all'
      || filters.lastStayFrom !== ''
      || filters.lastStayTo !== '';
  };

  return {
    filters,
    updateFilter,
    clearFilters,
    hasActiveFilters: hasActiveFilters()
  };
}
