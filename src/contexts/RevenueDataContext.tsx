/**
 * Revenue Data Context - Optimized Version
 *
 * Features:
 * - Section-by-section loading (progressive UI updates)
 * - localStorage caching with TTL (instant load on return)
 * - Background refresh (show cached data, fetch in background)
 * - Request throttling/queuing (prevents system crashes)
 */

import React, { createContext, useContext, useState, useEffect, useCallback, useRef, ReactNode } from 'react';
import {
  revenueIntelligenceService,
  invalidateRevenueCache,
  KPISummary,
  ForecastResponse,
  ChannelAnalysisResponse,
  SegmentPerformance,
  Competitor,
  PricingRecommendationsResponse,
  PickupMetricsResponse,
} from '../api/services/revenue-intelligence.service';
import { useBookingsSSE } from '../hooks/useBookingsSSE';

// ============================================================================
// TYPES
// ============================================================================

interface RevenueData {
  kpiSummary: KPISummary | null;
  forecast: ForecastResponse | null;
  channels: ChannelAnalysisResponse | null;
  segments: SegmentPerformance[] | null;
  competitors: Competitor[] | null;
  recommendations: PricingRecommendationsResponse | null;
  pickupMetrics: PickupMetricsResponse | null;
}

type SectionKey = keyof RevenueData;

interface SectionState {
  loading: boolean;
  error: string | null;
  lastUpdated: number | null;
}

interface SectionStates {
  kpiSummary: SectionState;
  forecast: SectionState;
  channels: SectionState;
  segments: SectionState;
  competitors: SectionState;
  recommendations: SectionState;
  pickupMetrics: SectionState;
}

interface RevenueDataContextValue {
  data: RevenueData;
  sectionStates: SectionStates;
  loading: boolean; // True only if ALL sections are loading
  error: string | null;
  lastUpdated: Date | null;
  refresh: () => Promise<void>; // Triggers refresh of all sections; resolves when complete
  refreshSection: (section: SectionKey) => void;
  isBackgroundRefreshing: boolean;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const CACHE_KEY_PREFIX = 'glimmora_revenue_';
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes TTL
const MAX_CONCURRENT_REQUESTS = 2; // Max parallel API calls
const REQUEST_DELAY = 200; // Delay between batches (ms)

const defaultSectionState: SectionState = {
  loading: false,
  error: null,
  lastUpdated: null,
};

const defaultData: RevenueData = {
  kpiSummary: null,
  forecast: null,
  channels: null,
  segments: null,
  competitors: null,
  recommendations: null,
  pickupMetrics: null,
};

const defaultSectionStates: SectionStates = {
  kpiSummary: { ...defaultSectionState },
  forecast: { ...defaultSectionState },
  channels: { ...defaultSectionState },
  segments: { ...defaultSectionState },
  competitors: { ...defaultSectionState },
  recommendations: { ...defaultSectionState },
  pickupMetrics: { ...defaultSectionState },
};

// Section fetch order (priority order)
const SECTION_ORDER: SectionKey[] = [
  'kpiSummary',      // Most important - shows KPIs first
  'forecast',        // Second - main chart
  'recommendations', // Third - actionable items
  'channels',        // Fourth - channel data
  'segments',        // Fifth - segment data
  'competitors',     // Sixth - competitor rates
  'pickupMetrics',   // Last - detailed metrics
];

// ============================================================================
// CACHE UTILITIES
// ============================================================================

interface CachedData<T> {
  data: T;
  timestamp: number;
}

function getCachedData<T>(key: SectionKey): T | null {
  try {
    const cached = localStorage.getItem(`${CACHE_KEY_PREFIX}${key}`);
    if (!cached) return null;

    const parsed: CachedData<T> = JSON.parse(cached);
    const isExpired = Date.now() - parsed.timestamp > CACHE_TTL;

    // Return data even if expired (we'll refresh in background)
    return parsed.data;
  } catch {
    return null;
  }
}

function setCachedData<T>(key: SectionKey, data: T): void {
  try {
    const cacheEntry: CachedData<T> = {
      data,
      timestamp: Date.now(),
    };
    localStorage.setItem(`${CACHE_KEY_PREFIX}${key}`, JSON.stringify(cacheEntry));
  } catch (err) {
    // localStorage might be full or disabled
    console.warn('Failed to cache revenue data:', err);
  }
}

function getCacheTimestamp(key: SectionKey): number | null {
  try {
    const cached = localStorage.getItem(`${CACHE_KEY_PREFIX}${key}`);
    if (!cached) return null;
    const parsed: CachedData<unknown> = JSON.parse(cached);
    return parsed.timestamp;
  } catch {
    return null;
  }
}

function isCacheStale(key: SectionKey): boolean {
  const timestamp = getCacheTimestamp(key);
  if (!timestamp) return true;
  return Date.now() - timestamp > CACHE_TTL;
}

// ============================================================================
// REQUEST QUEUE
// ============================================================================

type QueuedRequest = () => Promise<void>;

class RequestQueue {
  private queue: QueuedRequest[] = [];
  private running = 0;
  private maxConcurrent: number;

  constructor(maxConcurrent: number) {
    this.maxConcurrent = maxConcurrent;
  }

  add(request: QueuedRequest): void {
    this.queue.push(request);
    this.processQueue();
  }

  private async processQueue(): Promise<void> {
    while (this.queue.length > 0 && this.running < this.maxConcurrent) {
      const request = this.queue.shift();
      if (request) {
        this.running++;
        try {
          await request();
        } finally {
          this.running--;
          // Small delay between requests to prevent overwhelming the server
          await new Promise(resolve => setTimeout(resolve, REQUEST_DELAY));
          this.processQueue();
        }
      }
    }
  }

  clear(): void {
    this.queue = [];
  }

  get pendingCount(): number {
    return this.queue.length + this.running;
  }
}

// ============================================================================
// SECTION FETCHERS
// ============================================================================

const sectionFetchers: Record<SectionKey, () => Promise<unknown>> = {
  kpiSummary: () => revenueIntelligenceService.getKPISummary(),
  forecast: () => revenueIntelligenceService.getForecast(),
  channels: () => revenueIntelligenceService.getChannelAnalysis(),
  segments: () => revenueIntelligenceService.getSegmentPerformance(),
  competitors: () => revenueIntelligenceService.getCompetitors(),
  recommendations: () => revenueIntelligenceService.getPricingRecommendations(),
  pickupMetrics: () => revenueIntelligenceService.getPickupMetrics(14),
};

// ============================================================================
// CONTEXT
// ============================================================================

const RevenueDataContext = createContext<RevenueDataContextValue | undefined>(undefined);

export function RevenueDataProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<RevenueData>(() => {
    // Initialize with cached data for instant display
    return {
      kpiSummary: getCachedData<KPISummary>('kpiSummary'),
      forecast: getCachedData<ForecastResponse>('forecast'),
      channels: getCachedData<ChannelAnalysisResponse>('channels'),
      segments: getCachedData<SegmentPerformance[]>('segments'),
      competitors: getCachedData<Competitor[]>('competitors'),
      recommendations: getCachedData<PricingRecommendationsResponse>('recommendations'),
      pickupMetrics: getCachedData<PickupMetricsResponse>('pickupMetrics'),
    };
  });

  const [sectionStates, setSectionStates] = useState<SectionStates>(() => {
    // Check cache timestamps to set initial states
    const states = { ...defaultSectionStates };
    for (const key of SECTION_ORDER) {
      const timestamp = getCacheTimestamp(key);
      if (timestamp) {
        states[key] = {
          loading: false,
          error: null,
          lastUpdated: timestamp,
        };
      }
    }
    return states;
  });

  const [isBackgroundRefreshing, setIsBackgroundRefreshing] = useState(false);
  const [lastRefreshCompletedAt, setLastRefreshCompletedAt] = useState<number | null>(null);
  const requestQueueRef = useRef(new RequestQueue(MAX_CONCURRENT_REQUESTS));
  const mountedRef = useRef(true);
  const initialLoadDoneRef = useRef(false);

  // Update section state helper
  const updateSectionState = useCallback((section: SectionKey, update: Partial<SectionState>) => {
    if (!mountedRef.current) return;
    setSectionStates(prev => ({
      ...prev,
      [section]: { ...prev[section], ...update },
    }));
  }, []);

  // Update section data helper
  const updateSectionData = useCallback((section: SectionKey, newData: unknown) => {
    if (!mountedRef.current) return;
    setData(prev => ({ ...prev, [section]: newData }));
    // Cache the new data
    if (newData !== null) {
      setCachedData(section, newData);
    }
  }, []);

  // Fetch a single section, with a hard timeout so loading state can't get
  // stuck if the backend hangs or the endpoint is unreachable.
  const fetchSection = useCallback(async (section: SectionKey, isBackground = false) => {
    if (!isBackground) {
      updateSectionState(section, { loading: true, error: null });
    }

    const FETCH_TIMEOUT_MS = 8000;
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error(`Timeout fetching ${section}`)), FETCH_TIMEOUT_MS)
    );

    try {
      const fetcher = sectionFetchers[section];
      const result = await Promise.race([fetcher(), timeoutPromise]);

      if (mountedRef.current) {
        updateSectionData(section, result);
        updateSectionState(section, {
          loading: false,
          error: null,
          lastUpdated: Date.now(),
        });
      }
    } catch (err) {
      console.error(`Failed to fetch ${section}:`, err);
      if (mountedRef.current) {
        updateSectionState(section, {
          loading: false,
          error: err instanceof Error ? err.message : 'Failed to load',
        });
      }
    }
  }, [updateSectionData, updateSectionState]);

  // Queue section fetch
  const queueSectionFetch = useCallback((section: SectionKey, isBackground = false) => {
    requestQueueRef.current.add(() => fetchSection(section, isBackground));
  }, [fetchSection]);

  // Refresh a single section (public API)
  const refreshSection = useCallback((section: SectionKey) => {
    queueSectionFetch(section, false);
  }, [queueSectionFetch]);

  // Refresh all sections: invalidate API cache, clear stale localStorage timestamps,
  // and fetch all sections. Resolves when all fetches settle (success OR failure).
  const refresh = useCallback(async (): Promise<void> => {
    setIsBackgroundRefreshing(true);
    invalidateRevenueCache(); // Force fresh API data instead of cached
    // Clear stale localStorage timestamps so old "Updated X ago" doesn't stick
    for (const section of SECTION_ORDER) {
      try {
        localStorage.removeItem(`${CACHE_KEY_PREFIX}${section}`);
      } catch {}
    }
    requestQueueRef.current.clear();

    // Fetch all sections in parallel; Promise.allSettled guarantees resolution.
    await Promise.allSettled(
      SECTION_ORDER.map(section => fetchSection(section, true))
    );

    if (mountedRef.current) {
      setLastRefreshCompletedAt(Date.now());
      setIsBackgroundRefreshing(false);
    }
  }, [fetchSection]);

  // Initial load - section by section, with priority
  useEffect(() => {
    if (initialLoadDoneRef.current) return;
    initialLoadDoneRef.current = true;

    // Determine which sections need fetching
    const sectionsToFetch: SectionKey[] = [];
    const sectionsToBackgroundRefresh: SectionKey[] = [];

    for (const section of SECTION_ORDER) {
      const hasCache = data[section] !== null;
      const isStale = isCacheStale(section);

      if (!hasCache) {
        // No cache - need to fetch with loading state
        sectionsToFetch.push(section);
      } else if (isStale) {
        // Have cache but stale - background refresh
        sectionsToBackgroundRefresh.push(section);
      }
    }

    // Set loading state for sections that need fetching
    if (sectionsToFetch.length > 0) {
      setSectionStates(prev => {
        const newStates = { ...prev };
        for (const section of sectionsToFetch) {
          newStates[section] = { ...newStates[section], loading: true };
        }
        return newStates;
      });
    }

    // Run fetches in parallel so a single slow/hanging endpoint can't stall
    // the others. Each fetchSection enforces its own timeout internally.
    if (sectionsToFetch.length > 0) {
      Promise.allSettled(
        sectionsToFetch.map(section => fetchSection(section, false))
      );
    }

    if (sectionsToBackgroundRefresh.length > 0) {
      setIsBackgroundRefreshing(true);
      Promise.allSettled(
        sectionsToBackgroundRefresh.map(section => fetchSection(section, true))
      ).finally(() => {
        if (mountedRef.current) {
          setIsBackgroundRefreshing(false);
        }
      });
    }
  }, [data, fetchSection]);

  // Cleanup on unmount. React 18 Strict Mode runs effects twice in dev, so we
  // must reset mountedRef to true on mount — otherwise the first cleanup leaves
  // it false and every subsequent state update is silently skipped.
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      requestQueueRef.current.clear();
    };
  }, []);

  // Real-time refresh: when a booking is created / cancelled / modified,
  // invalidate the revenue cache and re-fetch so KPI / forecast / segments /
  // pickup widgets all reflect the new state without waiting for the 5-minute
  // cache TTL or a manual page reload.
  useBookingsSSE({
    onBookingCreated: () => {
      console.log('[RevenueDataContext] Booking created via SSE → refreshing revenue data');
      refresh();
    },
    onBookingCancelled: () => {
      console.log('[RevenueDataContext] Booking cancelled via SSE → refreshing revenue data');
      refresh();
    },
    refetchBookings: () => {
      refresh();
    },
  });

  // Timeout: if still loading after 20s (e.g. API hung), clear loading so UI can show content/errors and user can retry
  const LOADING_TIMEOUT_MS = 20000;
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!mountedRef.current) return;
      setSectionStates(prev => {
        const anyStillLoading = Object.values(prev).some(s => s.loading);
        if (!anyStillLoading) return prev;
        const next = { ...prev };
        for (const key of SECTION_ORDER) {
          if (next[key].loading) {
            next[key] = {
              ...next[key],
              loading: false,
              error: next[key].error || 'Request timed out',
            };
          }
        }
        return next;
      });
    }, LOADING_TIMEOUT_MS);
    return () => clearTimeout(timer);
  }, []);

  // Computed: overall loading (true only if ALL sections are loading)
  const loading = Object.values(sectionStates).every(s => s.loading);

  // Computed: first error found
  const error = Object.values(sectionStates).find(s => s.error)?.error || null;

  // Computed: most recent update (use lastRefreshCompletedAt when set so "Updated" time changes after Refresh)
  const lastUpdated = (() => {
    const timestamps = Object.values(sectionStates)
      .map(s => s.lastUpdated)
      .filter((t): t is number => t !== null);
    const fromSections = timestamps.length > 0 ? Math.max(...timestamps) : 0;
    const fromRefresh = lastRefreshCompletedAt ?? 0;
    const latest = Math.max(fromSections, fromRefresh);
    return latest > 0 ? new Date(latest) : null;
  })();

  const value: RevenueDataContextValue = {
    data,
    sectionStates,
    loading,
    error,
    lastUpdated,
    refresh,
    refreshSection,
    isBackgroundRefreshing,
  };

  return (
    <RevenueDataContext.Provider value={value}>
      {children}
    </RevenueDataContext.Provider>
  );
}

// ============================================================================
// HOOKS
// ============================================================================

export function useRevenueData() {
  const context = useContext(RevenueDataContext);
  if (context === undefined) {
    throw new Error('useRevenueData must be used within a RevenueDataProvider');
  }
  return context;
}

// Convenience hooks for specific data with section-level loading state
export function useKPISummary() {
  const { data, sectionStates, refreshSection } = useRevenueData();
  return {
    data: data.kpiSummary,
    loading: sectionStates.kpiSummary.loading,
    error: sectionStates.kpiSummary.error,
    refresh: () => refreshSection('kpiSummary'),
  };
}

export function useForecast() {
  const { data, sectionStates, refreshSection } = useRevenueData();
  return {
    data: data.forecast,
    loading: sectionStates.forecast.loading,
    error: sectionStates.forecast.error,
    refresh: () => refreshSection('forecast'),
  };
}

export function useChannels() {
  const { data, sectionStates, refreshSection } = useRevenueData();
  return {
    data: data.channels,
    loading: sectionStates.channels.loading,
    error: sectionStates.channels.error,
    refresh: () => refreshSection('channels'),
  };
}

export function useSegments() {
  const { data, sectionStates, refreshSection } = useRevenueData();
  return {
    data: data.segments,
    loading: sectionStates.segments.loading,
    error: sectionStates.segments.error,
    refresh: () => refreshSection('segments'),
  };
}

export function useCompetitors() {
  const { data, sectionStates, refreshSection } = useRevenueData();
  return {
    data: data.competitors,
    loading: sectionStates.competitors.loading,
    error: sectionStates.competitors.error,
    refresh: () => refreshSection('competitors'),
  };
}

export function useRecommendations() {
  const { data, sectionStates, refreshSection } = useRevenueData();
  return {
    data: data.recommendations,
    loading: sectionStates.recommendations.loading,
    error: sectionStates.recommendations.error,
    refresh: () => refreshSection('recommendations'),
  };
}

export function usePickupMetrics() {
  const { data, sectionStates, refreshSection } = useRevenueData();
  return {
    data: data.pickupMetrics,
    loading: sectionStates.pickupMetrics.loading,
    error: sectionStates.pickupMetrics.error,
    refresh: () => refreshSection('pickupMetrics'),
  };
}
