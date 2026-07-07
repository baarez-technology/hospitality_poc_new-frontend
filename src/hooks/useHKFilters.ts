import { useState, useMemo } from 'react';
import { applyFilters } from '../utils/housekeepingFilters';

/**
 * Hook for managing housekeeping filters
 */
export function useHKFilters(rooms) {
  const [filters, setFilters] = useState({
    floor: 'all',
    status: 'all',
    cleaningStatus: 'all',
    type: 'all',
    staff: 'all',
    priority: 'all'
  });

  const filteredRooms = useMemo(() => {
    return applyFilters(rooms, filters);
  }, [rooms, filters]);

  const updateFilter = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      floor: 'all',
      status: 'all',
      cleaningStatus: 'all',
      type: 'all',
      staff: 'all',
      priority: 'all'
    });
  };

  const hasActiveFilters = useMemo(() => {
    return Object.values(filters).some(value => value !== 'all');
  }, [filters]);

  return {
    filters,
    setFilters,
    filteredRooms,
    updateFilter,
    clearFilters,
    hasActiveFilters
  };
}
