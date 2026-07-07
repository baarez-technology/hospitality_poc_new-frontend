import { useState, useMemo } from 'react';
import { sortRooms } from '@/utils/admin/housekeepingSort';

/**
 * Hook for managing housekeeping sorting
 */
export function useHKSorting(rooms) {
  const [sortField, setSortField] = useState('roomNumber');
  const [sortDirection, setSortDirection] = useState('asc');

  const sortedRooms = useMemo(() => {
    return sortRooms(rooms, sortField, sortDirection);
  }, [rooms, sortField, sortDirection]);

  const handleSort = (field) => {
    if (sortField === field) {
      // Toggle direction if same field
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      // New field, default to ascending
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const clearSort = () => {
    setSortField('roomNumber');
    setSortDirection('asc');
  };

  return {
    sortField,
    sortDirection,
    sortedRooms,
    handleSort,
    clearSort
  };
}
