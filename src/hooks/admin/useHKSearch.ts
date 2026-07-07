import { useState, useMemo } from 'react';
import { searchRooms } from '@/utils/admin/housekeepingSearch';

/**
 * Hook for managing housekeeping search functionality
 */
export function useHKSearch(rooms) {
  const [searchQuery, setSearchQuery] = useState('');

  const searchedRooms = useMemo(() => {
    return searchRooms(rooms, searchQuery);
  }, [rooms, searchQuery]);

  const clearSearch = () => {
    setSearchQuery('');
  };

  return {
    searchQuery,
    setSearchQuery,
    searchedRooms,
    clearSearch,
    hasSearch: searchQuery.trim() !== ''
  };
}
