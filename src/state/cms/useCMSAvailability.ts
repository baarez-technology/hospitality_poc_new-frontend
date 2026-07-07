/**
 * useCMSAvailability Hook
 * Manages room availability data for the CMS Availability page using real backend APIs
 * NO FALLBACK DATA - shows errors when API fails to ensure real issues are visible
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import {
  getAvailabilityGrid,
  bulkUpdateAvailability,
  getRoomBlocks,
  createRoomBlock,
  updateRoomBlock,
  deleteRoomBlock,
  getTodayStats,
  getAIInsights,
  updateRoomTypePrice,
  type RoomBlock,
  type RoomBlockCreate,
  type RoomBlockUpdate,
  type DailyAvailabilityData,
  type RoomTypeData,
  type BulkAvailabilityUpdate,
  type AIInsightsResponse
} from '../../api/services/availability.service';
import { invalidateRevenueCache } from '../../api/services/revenue-intelligence.service';

interface DayAvailability {
  totalRooms: number;
  sold: number;  // Only checked_in guests
  reserved: number;  // Confirmed/booked but not checked in
  blocked: number;
  remaining: number;
  isClosed: boolean;
  restrictions: {
    minStay?: number;
    maxStay?: number;
    CTA?: boolean;
    CTD?: boolean;
  };
  baseRate?: number;
}

interface AvailabilityData {
  [date: string]: {
    [roomType: string]: DayAvailability;
  };
}

interface RoomTypeConfig {
  [key: string]: { code: string; totalRooms: number; baseRate: number };
}


// Helper to convert backend format to UI format
function transformBackendData(
  availability: DailyAvailabilityData[],
  roomTypes: RoomTypeData[]
): { data: AvailabilityData; config: RoomTypeConfig } {
  const data: AvailabilityData = {};
  const config: RoomTypeConfig = {};

  // Build room type config
  roomTypes.forEach(rt => {
    config[rt.name] = {
      code: rt.slug.toUpperCase().substring(0, 5),
      totalRooms: rt.total_rooms,
      baseRate: rt.base_price
    };
  });

  // Transform availability data
  availability.forEach(avail => {
    if (!data[avail.date]) {
      data[avail.date] = {};
    }

    data[avail.date][avail.room_type_name] = {
      totalRooms: avail.total_rooms,
      sold: avail.sold,  // Only checked_in guests
      reserved: avail.reserved,  // Confirmed/booked but not checked in
      blocked: avail.blocked,
      remaining: avail.available,
      isClosed: avail.is_closed,
      restrictions: {
        minStay: avail.min_stay,
        maxStay: avail.max_stay,
        CTA: avail.closed_to_arrival,
        CTD: avail.closed_to_departure
      },
      baseRate: avail.base_rate
    };
  });

  return { data, config };
}

export default function useCMSAvailability() {
  const [roomTypeConfig, setRoomTypeConfig] = useState<RoomTypeConfig>({});
  const [roomTypes, setRoomTypes] = useState<RoomTypeData[]>([]);
  const [availabilityData, setAvailabilityData] = useState<AvailabilityData>({});
  const [roomBlocks, setRoomBlocks] = useState<RoomBlock[]>([]);
  const [aiInsights, setAiInsights] = useState<AIInsightsResponse | null>(null);
  const [todayStats, setTodayStats] = useState<{ arrivals: number; departures: number; in_house: number } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Date range for availability grid (14 days from today to prevent timeout)
  const [dateRange, setDateRange] = useState(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const endDate = new Date(today);
    endDate.setDate(endDate.getDate() + 14);

    return {
      startDate: today.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0]
    };
  });

  // Use ref to track if component is mounted
  const isMounted = useRef(true);

  // Request counter to ensure only the latest request updates state
  // This handles race conditions from React Strict Mode, rapid re-renders, etc.
  const requestCounterRef = useRef(0);

  useEffect(() => {
    // Reset isMounted to true on each mount (important for React Strict Mode)
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  // Fetch availability grid from API - NO FALLBACK, data must come from database
  const fetchAvailabilityData = useCallback(async () => {
    // Increment counter and capture this request's ID
    const thisRequestId = ++requestCounterRef.current;

    setIsLoading(true);
    setError(null);

    try {
      console.log('[useCMSAvailability] Fetching from API:', dateRange.startDate, 'to', dateRange.endDate, 'requestId:', thisRequestId);

      const gridData = await getAvailabilityGrid(
        dateRange.startDate,
        dateRange.endDate
      );

      // Check if this request is still the latest (ignore stale requests)
      if (thisRequestId !== requestCounterRef.current) {
        console.log('[useCMSAvailability] Ignoring stale request:', thisRequestId, 'current:', requestCounterRef.current);
        return;
      }

      console.log('[useCMSAvailability] API Response:', {
        room_types_count: gridData.room_types?.length || 0,
        availability_count: gridData.availability?.length || 0,
        room_types: gridData.room_types,
      });

      if (!isMounted.current) return;

      // Check if we got valid data from the API
      if (gridData.room_types && gridData.room_types.length > 0 && gridData.availability && gridData.availability.length > 0) {
        const { data, config } = transformBackendData(
          gridData.availability,
          gridData.room_types
        );

        setAvailabilityData(data);
        setRoomTypeConfig(config);
        setRoomTypes(gridData.room_types);
        setError(null);
        console.log('[useCMSAvailability] Successfully loaded data from database API');
      } else {
        // API returned empty data - this is an error, not a fallback situation
        console.error('[useCMSAvailability] API returned empty data - check database connection');
        setError('No room types found in database. Please check if the database is seeded correctly.');
        setAvailabilityData({});
        setRoomTypeConfig({});
        setRoomTypes([]);
      }
    } catch (err: any) {
      // Check if this request is still the latest (ignore stale errors)
      if (thisRequestId !== requestCounterRef.current) {
        console.log('[useCMSAvailability] Ignoring stale error for request:', thisRequestId);
        return;
      }

      console.error('[useCMSAvailability] API Error:', err);
      if (!isMounted.current) return;

      const errorMessage = err.response?.data?.detail || err.message || 'Failed to fetch availability data';
      setError(`API Error: ${errorMessage}. Check if backend server is running.`);
      setAvailabilityData({});
      setRoomTypeConfig({});
      setRoomTypes([]);
    } finally {
      // Only set loading to false if this is still the current request
      if (thisRequestId === requestCounterRef.current) {
        setIsLoading(false);
      }
    }
  }, [dateRange.startDate, dateRange.endDate]);

  // Fetch room blocks
  const fetchRoomBlocks = useCallback(async () => {
    try {
      const blocks = await getRoomBlocks({
        start_date: dateRange.startDate,
        end_date: dateRange.endDate,
        status: 'active'
      });
      if (isMounted.current) {
        setRoomBlocks(blocks);
      }
    } catch (err) {
      console.error('Error fetching room blocks:', err);
    }
  }, [dateRange.startDate, dateRange.endDate]);

  // Fetch today's stats - NO FALLBACK, shows real data only
  const fetchTodayStats = useCallback(async () => {
    try {
      const stats = await getTodayStats();
      if (isMounted.current) {
        setTodayStats({
          arrivals: stats.arrivals,
          departures: stats.departures,
          in_house: stats.in_house
        });
      }
    } catch (err) {
      console.error('Error fetching today stats:', err);
      // No fallback - set to null so UI knows there's no data
      if (isMounted.current) {
        setTodayStats(null);
      }
    }
  }, []);

  // Fetch AI insights - NO FALLBACK, shows real data only
  const fetchAIInsights = useCallback(async () => {
    try {
      const insights = await getAIInsights(90);
      if (isMounted.current) {
        setAiInsights(insights);
      }
    } catch (err) {
      console.error('Error fetching AI insights:', err);
      // No fallback - set to null so UI knows there's no data
      if (isMounted.current) {
        setAiInsights(null);
      }
    }
  }, []);

  // Initial data fetch
  useEffect(() => {
    let mounted = true;

    const loadData = async () => {
      if (!mounted) return;

      try {
        await fetchAvailabilityData();
      } catch (err) {
        console.error('Failed to load availability data:', err);
      }

      if (!mounted) return;

      try {
        await fetchRoomBlocks();
      } catch (err) {
        console.error('Failed to load room blocks:', err);
      }

      if (!mounted) return;

      try {
        await fetchTodayStats();
      } catch (err) {
        console.error('Failed to load today stats:', err);
      }

      if (!mounted) return;

      // Load AI insights in background - don't block calendar; insights panel shows empty if it fails
      fetchAIInsights().catch((err) => {
        console.error('Failed to load AI insights:', err);
      });
    };

    loadData();

    return () => {
      mounted = false;
    };
  }, [dateRange.startDate, dateRange.endDate]); // Only depend on date range

  // Get availability for a specific room type and date
  const getAvailability = useCallback((roomType: string, date: string): DayAvailability | null => {
    return availabilityData[date]?.[roomType] || null;
  }, [availabilityData]);

  // Update availability for a specific date and room type
  const updateAvailability = useCallback(async (
    date: string,
    roomType: string,
    updates: Partial<DayAvailability>
  ) => {
    // Get room type ID from roomTypes array
    const roomTypeData = roomTypes.find(rt => rt.name === roomType);
    if (!roomTypeData) {
      console.error('Room type not found:', roomType);
      return;
    }

    // Optimistic update
    setAvailabilityData(prev => ({
      ...prev,
      [date]: {
        ...prev[date],
        [roomType]: {
          ...prev[date]?.[roomType],
          ...updates,
          restrictions: {
            ...prev[date]?.[roomType]?.restrictions,
            ...updates.restrictions
          }
        }
      }
    }));

    // Build API payload and persist to backend
    try {
      // Build flat API payload (BulkAvailabilityUpdate expects flat structure, not nested)
      const apiUpdate: BulkAvailabilityUpdate = {
        room_type_id: roomTypeData.id,
        start_date: date,
        end_date: date
      };

      // Map frontend fields to backend fields - directly on apiUpdate (not nested)
      let hasUpdates = false;
      if (updates.isClosed !== undefined) {
        apiUpdate.is_closed = updates.isClosed;
        hasUpdates = true;
      }
      if (updates.restrictions?.minStay !== undefined) {
        apiUpdate.min_stay = updates.restrictions.minStay;
        hasUpdates = true;
      }
      if (updates.restrictions?.maxStay !== undefined) {
        apiUpdate.max_stay = updates.restrictions.maxStay;
        hasUpdates = true;
      }
      if (updates.restrictions?.CTA !== undefined) {
        apiUpdate.closed_to_arrival = updates.restrictions.CTA;
        hasUpdates = true;
      }
      if (updates.restrictions?.CTD !== undefined) {
        apiUpdate.closed_to_departure = updates.restrictions.CTD;
        hasUpdates = true;
      }
      if (updates.baseRate !== undefined) {
        apiUpdate.base_rate = updates.baseRate;
        hasUpdates = true;
      }

      // Only call API if there are actual updates to persist
      if (hasUpdates) {
        await bulkUpdateAvailability([apiUpdate]);
        console.log('[useCMSAvailability] Availability updated via API');
      }

      // Invalidate rate calendar cache so Rate Calendar and Rate Sync show the updated price
      if (updates.baseRate !== undefined) {
        invalidateRevenueCache('rate-calendar');
      }

      // Refetch to get accurate data
      await fetchAvailabilityData();
    } catch (err) {
      console.error('Error updating availability:', err);
      // Refetch to revert optimistic update on error
      await fetchAvailabilityData();
    }
  }, [fetchAvailabilityData, roomTypes]);

  // Batch update multiple availability records in a single API call (no per-item refetch)
  const batchUpdate = useCallback(async (updates: BulkAvailabilityUpdate[]) => {
    if (updates.length === 0) return;
    const hadRateUpdate = updates.some(u => u.base_rate != null);
    try {
      await bulkUpdateAvailability(updates);
      console.log(`[useCMSAvailability] Batch updated ${updates.length} records`);
      if (hadRateUpdate) invalidateRevenueCache('rate-calendar');
      await fetchAvailabilityData();
    } catch (err) {
      console.error('Error in batch update:', err);
      await fetchAvailabilityData();
      throw err;
    }
  }, [fetchAvailabilityData]);

  // Close a room type for a specific date
  const closeRoomType = useCallback(async (date: string, roomType: string) => {
    await updateAvailability(date, roomType, { isClosed: true, remaining: 0 });
  }, [updateAvailability]);

  // Open a room type for a specific date
  const openRoomType = useCallback(async (date: string, roomType: string) => {
    const current = availabilityData[date]?.[roomType];
    if (!current) return;

    // Calculate remaining: total - sold - reserved - blocked
    const reserved = current.reserved || 0;
    const remaining = current.totalRooms - current.sold - reserved - current.blocked;

    await updateAvailability(date, roomType, {
      isClosed: false,
      remaining: Math.max(0, remaining)  // Ensure non-negative
    });
  }, [availabilityData, updateAvailability]);

  // Update restrictions for a specific date and room type
  const updateRestrictions = useCallback(async (
    date: string,
    roomType: string,
    restrictions: Partial<DayAvailability['restrictions']>
  ) => {
    await updateAvailability(date, roomType, { restrictions });
  }, [updateAvailability]);

  // Create a new room block
  const addRoomBlock = useCallback(async (blockData: RoomBlockCreate) => {
    try {
      const newBlock = await createRoomBlock(blockData);
      if (isMounted.current) {
        setRoomBlocks(prev => [...prev, newBlock]);
      }
      // Refetch availability to reflect the block
      await fetchAvailabilityData();
      return newBlock;
    } catch (err) {
      console.error('Error creating room block:', err);
      throw err;
    }
  }, [fetchAvailabilityData]);

  // Update an existing room block
  const editRoomBlock = useCallback(async (blockId: number, updates: RoomBlockUpdate) => {
    try {
      const updatedBlock = await updateRoomBlock(blockId, updates);
      if (isMounted.current) {
        setRoomBlocks(prev => prev.map(b => b.id === blockId ? updatedBlock : b));
      }
      // Refetch availability to reflect the change
      await fetchAvailabilityData();
      return updatedBlock;
    } catch (err) {
      console.error('Error updating room block:', err);
      throw err;
    }
  }, [fetchAvailabilityData]);

  // Delete a room block
  const removeRoomBlock = useCallback(async (blockId: number) => {
    try {
      await deleteRoomBlock(blockId);
      if (isMounted.current) {
        setRoomBlocks(prev => prev.filter(b => b.id !== blockId));
      }
      // Refetch availability to reflect the change
      await fetchAvailabilityData();
    } catch (err) {
      console.error('Error deleting room block:', err);
      throw err;
    }
  }, [fetchAvailabilityData]);

  // Reset all availability data (refetch from API)
  const resetAvailability = useCallback(() => {
    fetchAvailabilityData();
    fetchRoomBlocks();
  }, [fetchAvailabilityData, fetchRoomBlocks]);

  // Get room type configuration
  const getRoomTypeConfig = useCallback(() => roomTypeConfig, [roomTypeConfig]);

  // Refresh AI insights
  const refreshAIInsights = useCallback(async () => {
    await fetchAIInsights();
  }, [fetchAIInsights]);

  return {
    availabilityData,
    roomTypeConfig,
    roomTypes,
    roomBlocks,
    aiInsights,
    todayStats,
    isLoading,
    error,
    getAvailability,
    updateAvailability,
    closeRoomType,
    openRoomType,
    updateRestrictions,
    resetAvailability,
    getRoomTypeConfig,
    refetch: fetchAvailabilityData,
    batchUpdate,
    // Room blocks
    addRoomBlock,
    editRoomBlock,
    removeRoomBlock,
    fetchRoomBlocks,
    // AI Insights
    refreshAIInsights,
    // Date range
    dateRange,
    setDateRange
  };
}
