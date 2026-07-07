import { useState, useMemo } from 'react';
import { sortData, toggleSortDirection } from '@/utils/admin/sortUtils';

/**
 * Custom hook for sorting data
 * @param {Array} data - Data to sort
 * @param {string} defaultField - Default field to sort by
 * @param {string} defaultDirection - Default sort direction ('asc' or 'desc')
 * @returns {Object} Sorted data and sort controls
 */
export function useSort(data, defaultField = null, defaultDirection = 'asc') {
  const [sortConfig, setSortConfig] = useState({
    field: defaultField,
    direction: defaultDirection,
  });

  // Handle sort column click
  const handleSort = (field) => {
    setSortConfig((prev) => {
      // If clicking the same field, toggle direction
      if (prev.field === field) {
        return {
          field,
          direction: toggleSortDirection(prev.direction),
        };
      }
      // If clicking a new field, sort ascending
      return {
        field,
        direction: 'asc',
      };
    });
  };

  // Clear sort
  const clearSort = () => {
    setSortConfig({
      field: null,
      direction: 'asc',
    });
  };

  // Memoized sorted data
  const sortedData = useMemo(() => {
    if (!sortConfig.field) return data;
    return sortData(data, sortConfig.field, sortConfig.direction);
  }, [data, sortConfig.field, sortConfig.direction]);

  return {
    sortedData,
    sortConfig,
    handleSort,
    clearSort,
  };
}
