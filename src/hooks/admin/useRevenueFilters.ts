import { useState, useMemo, useCallback } from 'react';
import { aggregateByDateRange } from '@/utils/admin/revenueAggregation';

/**
 * Revenue Filters Hook
 * Manages multi-filter state and applies filters to revenue data
 */
export function useRevenueFilters(rawData) {
  const [filters, setFilters] = useState({
    dateRange: '30d',
    startDate: null,
    endDate: null,
    segment: 'all',
    channel: 'all',
    roomType: 'all',
    minADR: null,
    maxADR: null
  });

  // Apply all filters to data
  const filteredData = useMemo(() => {
    if (!rawData || rawData.length === 0) return [];

    let filtered = [...rawData];

    // Date range filter
    if (filters.startDate && filters.endDate) {
      const result = aggregateByDateRange(filtered, filters.startDate, filters.endDate);
      filtered = result.data;
    } else if (filters.dateRange !== 'all') {
      const days = parseInt(filters.dateRange.replace('d', ''));
      const today = new Date();
      const startDate = new Date(today);
      startDate.setDate(today.getDate() - days);

      filtered = filtered.filter(d => {
        const itemDate = new Date(d.date);
        return itemDate >= startDate && itemDate <= today;
      });
    }

    // Segment filter
    if (filters.segment !== 'all') {
      filtered = filtered.filter(d => d.segment === filters.segment);
    }

    // Channel filter
    if (filters.channel !== 'all') {
      filtered = filtered.filter(d => d.channel === filters.channel);
    }

    // Room type filter
    if (filters.roomType !== 'all') {
      filtered = filtered.filter(d => d.roomType === filters.roomType);
    }

    // ADR range filter
    if (filters.minADR !== null) {
      filtered = filtered.filter(d => d.adr >= filters.minADR);
    }
    if (filters.maxADR !== null) {
      filtered = filtered.filter(d => d.adr <= filters.maxADR);
    }

    return filtered;
  }, [rawData, filters]);

  // Update a single filter
  const updateFilter = useCallback((key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  // Update multiple filters at once
  const updateFilters = useCallback((newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  // Clear all filters
  const clearFilters = useCallback(() => {
    setFilters({
      dateRange: '30d',
      startDate: null,
      endDate: null,
      segment: 'all',
      channel: 'all',
      roomType: 'all',
      minADR: null,
      maxADR: null
    });
  }, []);

  // Check if any filters are active
  const hasActiveFilters = useMemo(() => {
    return (
      filters.segment !== 'all' ||
      filters.channel !== 'all' ||
      filters.roomType !== 'all' ||
      filters.minADR !== null ||
      filters.maxADR !== null ||
      (filters.startDate && filters.endDate)
    );
  }, [filters]);

  return {
    filters,
    filteredData,
    updateFilter,
    updateFilters,
    clearFilters,
    hasActiveFilters
  };
}
