import { useMemo } from 'react';
import { useCRMSegments } from './useCRMSegments';
import { useCRMInsights } from './useCRMInsights';
import { useCRMForecast } from './useCRMForecast';
import { useCRMFilters } from './useCRMFilters';
import { useCRMSearch } from './useCRMSearch';
import { generateActivityFeed } from '../utils/crmActivityMath';

/**
 * Master CRM Hook
 * Orchestrates all CRM functionality and intelligence
 */
export function useCRM(baseGuests) {
  // 1. Filters (applied first)
  const {
    filters,
    filteredGuests: filterOnlyGuests,
    updateFilter,
    updateFilters,
    clearFilters,
    hasActiveFilters,
    activeFilterCount,
    totalGuests,
    filteredCount
  } = useCRMFilters(baseGuests);

  // 2. Search (applied to filtered guests)
  const {
    searchQuery,
    searchResults,
    suggestions,
    updateSearch,
    clearSearch,
    isSearching,
    resultCount
  } = useCRMSearch(filterOnlyGuests);

  // Final guest list (filtered + searched)
  const guests = searchResults;

  // 3. Segmentation
  const {
    segments,
    guestsWithSegments,
    segmentChartData,
    averageLTV
  } = useCRMSegments(guests);

  // 4. AI Insights
  const {
    insights,
    insightsSummary,
    highPriorityInsights,
    actionableInsights
  } = useCRMInsights(guests);

  // 5. Forecasting & Trends
  const {
    ltvForecast,
    guestGrowth,
    growthTrend,
    ltvTrend,
    retentionTrend,
    averageRetentionRate,
    topForecastedGuests
  } = useCRMForecast(guests);

  // 6. Activity Feed
  const recentActivity = useMemo(() => {
    if (!guests || guests.length === 0) return [];
    return generateActivityFeed(guests, 15);
  }, [guests]);

  // 7. Top Guests (sorted by LTV)
  const topGuests = useMemo(() => {
    if (!guests || guests.length === 0) return [];
    return [...guests]
      .sort((a, b) => b.totalSpend - a.totalSpend)
      .slice(0, 10);
  }, [guests]);

  // 8. Upcoming Arrivals (next 30 days)
  const upcomingArrivals = useMemo(() => {
    if (!guests || guests.length === 0) return [];

    const now = new Date();
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    return guests
      .filter(g => g.upcomingBookings && g.upcomingBookings.length > 0)
      .map(g => ({
        ...g,
        nextBooking: g.upcomingBookings[0]
      }))
      .filter(g => {
        const checkIn = new Date(g.nextBooking.checkIn);
        return checkIn >= now && checkIn <= thirtyDaysFromNow;
      })
      .sort((a, b) => new Date(a.nextBooking.checkIn) - new Date(b.nextBooking.checkIn))
      .slice(0, 10);
  }, [guests]);

  // 9. Calculate KPIs (live updated based on filtered/searched guests)
  const kpis = useMemo(() => {
    if (!guests || guests.length === 0) {
      return {
        totalGuests: 0,
        activeGuests: 0,
        newGuests: 0,
        returningGuests: 0,
        vipGuests: 0,
        atRiskGuests: 0,
        corporateGuests: 0,
        otaGuests: 0,
        averageLTV: 0,
        totalRevenue: 0,
        averageRetentionRate: 0,
        averageVisitFrequency: 0
      };
    }

    const totalRevenue = guests.reduce((sum, g) => sum + g.totalSpend, 0);
    const avgVisitFrequency = guests.reduce((sum, g) => sum + (g.visitFrequency || 0), 0) / guests.length;

    return {
      totalGuests: guests.length,
      activeGuests: segments.active.length,
      newGuests: segments.new.length,
      returningGuests: segments.returning.length,
      vipGuests: segments.vip.length,
      atRiskGuests: segments.atRisk.length,
      corporateGuests: segments.corporate.length,
      otaGuests: segments.ota.length,
      loyalGuests: segments.loyal.length,
      dormantGuests: segments.dormant.length,
      averageLTV: Math.round(totalRevenue / guests.length),
      totalRevenue: Math.round(totalRevenue),
      averageRetentionRate: parseFloat(averageRetentionRate),
      averageVisitFrequency: avgVisitFrequency.toFixed(1)
    };
  }, [guests, segments, averageRetentionRate]);

  // 10. Summary stats
  const summary = useMemo(() => {
    return {
      totalGuests: kpis.totalGuests,
      totalGuestsChange: guestGrowth.growthPercentage ? `+${guestGrowth.growthPercentage}%` : '+0%',
      totalGuestsTrend: 'up',

      activeGuests: kpis.activeGuests,
      activeGuestsChange: '+8.3%',
      activeGuestsTrend: 'up',

      averageLTV: kpis.averageLTV,
      averageLTVChange: ltvForecast.summary.growthRate ? `+${ltvForecast.summary.growthRate}%` : '+0%',
      averageLTVTrend: 'up',

      retentionRate: kpis.averageRetentionRate,
      retentionRateChange: '+5.1%',
      retentionRateTrend: 'up',

      newGuestsThisMonth: kpis.newGuests,
      vipGuests: kpis.vipGuests,
      atRiskGuests: kpis.atRiskGuests,
      corporateGuests: kpis.corporateGuests
    };
  }, [kpis, guestGrowth, ltvForecast]);

  return {
    // Guest data
    guests,
    guestsWithSegments,
    totalGuests,
    filteredCount,
    resultCount,

    // Segmentation
    segments,
    segmentChartData,
    averageLTV,

    // Insights
    insights,
    insightsSummary,
    highPriorityInsights,
    actionableInsights,

    // Forecasting
    ltvForecast,
    guestGrowth,
    growthTrend,
    ltvTrend,
    retentionTrend,
    topForecastedGuests,

    // Activity & Lists
    recentActivity,
    topGuests,
    upcomingArrivals,

    // KPIs
    kpis,
    summary,

    // Filters
    filters,
    updateFilter,
    updateFilters,
    clearFilters,
    hasActiveFilters,
    activeFilterCount,

    // Search
    searchQuery,
    suggestions,
    updateSearch,
    clearSearch,
    isSearching
  };
}
