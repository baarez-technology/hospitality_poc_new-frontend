import { useState, useMemo, useCallback } from 'react';

/**
 * CRM Filters Hook
 * Manages filtering of guests by multiple criteria
 */
export function useCRMFilters(guests) {
  const [filters, setFilters] = useState({
    dateRange: 'all', // 'all', '30d', '90d', '6m', '1y'
    segments: [], // ['vip', 'at-risk', 'new', etc.]
    loyaltyTiers: [], // ['Platinum', 'Gold', 'Silver', etc.]
    sources: [], // ['direct', 'booking.com', 'corporate', etc.]
    sentimentRange: null, // { min: 0, max: 1 }
    ltvRange: null, // { min: 0, max: 10000 }
    visitFrequency: null, // { min: 0, max: 10 }
    bookingChannel: null, // 'website', 'ota', 'corporate-portal'
    hasUpcomingBooking: null, // true/false/null
    hasComplaints: null, // true/false/null
    isActive: null // true/false/null (visited in last 180 days)
  });

  // Apply filters to guests
  const filteredGuests = useMemo(() => {
    if (!guests || guests.length === 0) return [];

    let result = [...guests];

    // Date range filter
    if (filters.dateRange !== 'all') {
      const now = new Date();
      let daysBack = 365; // default 1 year

      switch (filters.dateRange) {
        case '30d':
          daysBack = 30;
          break;
        case '90d':
          daysBack = 90;
          break;
        case '6m':
          daysBack = 180;
          break;
        case '1y':
          daysBack = 365;
          break;
        default:
          daysBack = 365;
      }

      result = result.filter(g => g.daysSinceLastVisit <= daysBack);
    }

    // Segment filters
    if (filters.segments.length > 0) {
      result = result.filter(g => {
        const averageLTV = guests.reduce((sum, guest) => sum + guest.totalSpend, 0) / guests.length;

        return filters.segments.some(segment => {
          switch (segment) {
            case 'vip':
              return g.totalSpend > 2000 || g.totalStays > 8 || g.sentimentScore > 0.85;
            case 'at-risk':
              return g.sentimentScore < 0.4 || g.daysSinceLastVisit > 180 || g.negativeReviews > 1;
            case 'high-spenders':
              return g.totalSpend > averageLTV * 1.2;
            case 'returning':
              return g.totalStays > 1;
            case 'new':
              return g.totalStays === 1;
            case 'corporate':
              return g.source === 'corporate';
            case 'ota':
              return ['booking.com', 'expedia', 'agoda', 'airbnb'].includes(g.source);
            case 'loyal':
              return g.totalStays > 5 && g.sentimentScore > 0.6;
            default:
              return false;
          }
        });
      });
    }

    // Loyalty tier filter
    if (filters.loyaltyTiers.length > 0) {
      result = result.filter(g => filters.loyaltyTiers.includes(g.loyaltyTier));
    }

    // Source filter
    if (filters.sources.length > 0) {
      result = result.filter(g => filters.sources.includes(g.source));
    }

    // Sentiment range filter
    if (filters.sentimentRange) {
      result = result.filter(g =>
        g.sentimentScore >= filters.sentimentRange.min &&
        g.sentimentScore <= filters.sentimentRange.max
      );
    }

    // LTV range filter
    if (filters.ltvRange) {
      result = result.filter(g =>
        g.totalSpend >= filters.ltvRange.min &&
        g.totalSpend <= filters.ltvRange.max
      );
    }

    // Visit frequency filter
    if (filters.visitFrequency) {
      result = result.filter(g => {
        const frequency = g.visitFrequency || (g.totalStays / (g.lifespanDays / 365));
        return frequency >= filters.visitFrequency.min &&
               frequency <= filters.visitFrequency.max;
      });
    }

    // Booking channel filter
    if (filters.bookingChannel) {
      result = result.filter(g => g.bookingChannel === filters.bookingChannel);
    }

    // Has upcoming booking filter
    if (filters.hasUpcomingBooking !== null) {
      result = result.filter(g => {
        const hasBooking = g.upcomingBookings && g.upcomingBookings.length > 0;
        return hasBooking === filters.hasUpcomingBooking;
      });
    }

    // Has complaints filter
    if (filters.hasComplaints !== null) {
      result = result.filter(g => g.hasComplaints === filters.hasComplaints);
    }

    // Is active filter
    if (filters.isActive !== null) {
      result = result.filter(g => {
        const isActive = g.daysSinceLastVisit < 180;
        return isActive === filters.isActive;
      });
    }

    return result;
  }, [guests, filters]);

  // Update a single filter
  const updateFilter = useCallback((key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  }, []);

  // Update multiple filters at once
  const updateFilters = useCallback((newFilters) => {
    setFilters(prev => ({
      ...prev,
      ...newFilters
    }));
  }, []);

  // Clear all filters
  const clearFilters = useCallback(() => {
    setFilters({
      dateRange: 'all',
      segments: [],
      loyaltyTiers: [],
      sources: [],
      sentimentRange: null,
      ltvRange: null,
      visitFrequency: null,
      bookingChannel: null,
      hasUpcomingBooking: null,
      hasComplaints: null,
      isActive: null
    });
  }, []);

  // Check if any filters are active
  const hasActiveFilters = useMemo(() => {
    return filters.dateRange !== 'all' ||
           filters.segments.length > 0 ||
           filters.loyaltyTiers.length > 0 ||
           filters.sources.length > 0 ||
           filters.sentimentRange !== null ||
           filters.ltvRange !== null ||
           filters.visitFrequency !== null ||
           filters.bookingChannel !== null ||
           filters.hasUpcomingBooking !== null ||
           filters.hasComplaints !== null ||
           filters.isActive !== null;
  }, [filters]);

  // Count active filters
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.dateRange !== 'all') count++;
    if (filters.segments.length > 0) count += filters.segments.length;
    if (filters.loyaltyTiers.length > 0) count++;
    if (filters.sources.length > 0) count++;
    if (filters.sentimentRange !== null) count++;
    if (filters.ltvRange !== null) count++;
    if (filters.visitFrequency !== null) count++;
    if (filters.bookingChannel !== null) count++;
    if (filters.hasUpcomingBooking !== null) count++;
    if (filters.hasComplaints !== null) count++;
    if (filters.isActive !== null) count++;
    return count;
  }, [filters]);

  return {
    filters,
    filteredGuests,
    updateFilter,
    updateFilters,
    clearFilters,
    hasActiveFilters,
    activeFilterCount,
    totalGuests: guests?.length || 0,
    filteredCount: filteredGuests.length
  };
}
