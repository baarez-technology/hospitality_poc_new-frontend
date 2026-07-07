/**
 * useDynamicPricing Hook
 * Fetches effective/dynamic rates from the availability grid API
 * so that all pages show pricing-rule-adjusted rates instead of static base prices.
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { getAvailabilityGrid, type DailyAvailabilityData } from '@/api/services/availability.service';

export interface DynamicRate {
  roomTypeId: number;
  roomTypeName: string;
  date: string;
  effectiveRate: number;
}

export interface DynamicPricingResult {
  /** Map of "roomTypeId" or "roomTypeName" → effective rate (average across dates) */
  ratesByRoomType: Record<string, number>;
  /** Map of "roomTypeId:date" → effective rate for that specific date */
  ratesByDate: Record<string, number>;
  /** All individual rate entries */
  rates: DynamicRate[];
  isLoading: boolean;
  error: string | null;
  refresh: () => void;
}

/**
 * Fetches dynamic/effective rates for a date range.
 * Returns rates keyed by room type name AND room type ID for flexible lookup.
 * If multiple dates are given, returns the average rate per room type.
 */
export function useDynamicPricing(
  checkInDate?: string,
  checkOutDate?: string,
  enabled = true
): DynamicPricingResult {
  const [rates, setRates] = useState<DynamicRate[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const refresh = useCallback(() => setRefreshKey((k) => k + 1), []);

  useEffect(() => {
    if (!enabled || !checkInDate) return;

    // Default to 1 night if no checkout
    const endDate = checkOutDate || (() => {
      const d = new Date(checkInDate);
      d.setDate(d.getDate() + 1);
      return d.toISOString().split('T')[0];
    })();

    let cancelled = false;
    const fetchRates = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const grid = await getAvailabilityGrid(checkInDate, endDate);
        if (cancelled) return;

        const dynamicRates: DynamicRate[] = grid.availability
          .filter((a: DailyAvailabilityData) => a.base_rate != null)
          .map((a: DailyAvailabilityData) => ({
            roomTypeId: a.room_type_id,
            roomTypeName: a.room_type_name,
            date: a.date,
            effectiveRate: a.base_rate!,
          }));

        setRates(dynamicRates);
      } catch (err) {
        if (!cancelled) {
          console.error('Failed to fetch dynamic rates:', err);
          setError('Failed to load dynamic pricing');
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    fetchRates();
    return () => { cancelled = true; };
  }, [checkInDate, checkOutDate, enabled, refreshKey]);

  // Compute averages per room type - memoized to prevent infinite re-renders
  const { ratesByRoomType, ratesByDate } = useMemo(() => {
    const byRoomType: Record<string, number> = {};
    const byDate: Record<string, number> = {};
    const groupById: Record<number, { sum: number; count: number; name: string }> = {};

    for (const r of rates) {
      if (!groupById[r.roomTypeId]) {
        groupById[r.roomTypeId] = { sum: 0, count: 0, name: r.roomTypeName };
      }
      groupById[r.roomTypeId].sum += r.effectiveRate;
      groupById[r.roomTypeId].count += 1;
      byDate[`${r.roomTypeId}:${r.date}`] = r.effectiveRate;
    }

    for (const [id, g] of Object.entries(groupById)) {
      const avg = Math.round(g.sum / g.count);
      byRoomType[id] = avg;
      byRoomType[g.name] = avg;
    }

    return { ratesByRoomType: byRoomType, ratesByDate: byDate };
  }, [rates]);

  return { ratesByRoomType, ratesByDate, rates, isLoading, error, refresh };
}

/**
 * Standalone function (non-hook) to fetch effective rate for a room type on a date.
 * Useful for one-off lookups outside React components.
 */
export async function fetchDynamicRate(
  roomTypeId: number | string,
  date: string
): Promise<number | null> {
  try {
    const endDate = (() => {
      const d = new Date(date);
      d.setDate(d.getDate() + 1);
      return d.toISOString().split('T')[0];
    })();
    const grid = await getAvailabilityGrid(date, endDate);
    const match = grid.availability.find(
      (a: DailyAvailabilityData) =>
        (String(a.room_type_id) === String(roomTypeId) || a.room_type_name === roomTypeId) &&
        a.base_rate != null
    );
    return match?.base_rate ?? null;
  } catch {
    return null;
  }
}
