/**
 * Availability Service
 * Handles all availability, room blocking, and restriction management
 */

import { apiClient, clearApiCache } from '../client';

// ============================================
// TYPES
// ============================================

export interface RoomBlockCreate {
  room_type_id?: number;
  room_id?: number;
  start_date: string; // ISO date string
  end_date: string;
  block_type: string;
  reason: string;
  notes?: string;
  quantity: number;
}

export interface RoomBlockUpdate {
  start_date?: string;
  end_date?: string;
  reason?: string;
  notes?: string;
  status?: string;
}

export interface RoomBlock {
  id: number;
  room_type_id?: number;
  room_type_name?: string;
  room_id?: number;
  room_number?: string;
  start_date: string;
  end_date: string;
  block_type: string;
  reason: string;
  notes?: string;
  quantity: number;
  status: string;
  created_at: string;
}

export interface DailyAvailabilityData {
  date: string;
  room_type_id: number;
  room_type_name: string;
  total_rooms: number;
  sold: number;  // Only checked_in guests
  reserved: number;  // Confirmed/booked but not checked in
  blocked: number;
  available: number;
  is_closed: boolean;
  min_stay: number;
  max_stay?: number;
  closed_to_arrival: boolean;
  closed_to_departure: boolean;
  base_rate?: number;
}

export interface RoomTypeData {
  id: number;
  name: string;
  slug: string;
  base_price: number;
  total_rooms: number;
}

export interface AvailabilityGridResponse {
  start_date: string;
  end_date: string;
  room_types: RoomTypeData[];
  availability: DailyAvailabilityData[];
}

export interface BulkAvailabilityUpdate {
  room_type_id: number;
  start_date: string;
  end_date: string;
  is_closed?: boolean;
  min_stay?: number;
  max_stay?: number;
  closed_to_arrival?: boolean;
  closed_to_departure?: boolean;
  base_rate?: number;  // Daily rate override
}

export interface RoomTypePriceUpdate {
  room_type_id: number;
  base_price: number;
}

export interface AIInsightsResponse {
  recommendations: Array<{
    type: string;
    priority: string;
    title: string;
    description: string;
    action: string;
    impact: string;
  }>;
  demand_forecast: Array<{
    date: string;
    occupancy_forecast: number;
    demand_level: string;
  }>;
  pricing_suggestions: Array<{
    room_type_id: number;
    room_type_name: string;
    current_rate: number;
    suggested_rate: number;
    adjustment_percentage: number;
    reason: string;
  }>;
  occupancy_trends: {
    average_occupancy: number;
    high_demand_days: number;
    low_demand_days: number;
    peak_occupancy_date: string | null;
    lowest_occupancy_date: string | null;
  };
  generated_at: string;
}

// ============================================
// API FUNCTIONS
// ============================================

/**
 * Get availability grid for date range
 */
export const getAvailabilityGrid = async (
  startDate: string,
  endDate: string,
  roomTypeIds?: string
): Promise<AvailabilityGridResponse> => {
  const params: any = {
    start_date: startDate,
    end_date: endDate
  };

  if (roomTypeIds) {
    params.room_type_ids = roomTypeIds;
  }

  const response = await apiClient.get('/api/v1/availability/grid', { params });
  return response.data;
};

/**
 * Bulk update availability restrictions
 */
export const bulkUpdateAvailability = async (
  updates: BulkAvailabilityUpdate[]
): Promise<{ success: boolean; updated_records: number; message: string }> => {
  const response = await apiClient.post('/api/v1/availability/bulk-update', updates);
  return response.data;
};

/**
 * Get room blocks with optional filtering
 */
export const getRoomBlocks = async (params?: {
  start_date?: string;
  end_date?: string;
  room_type_id?: number;
  status?: string;
}): Promise<RoomBlock[]> => {
  const response = await apiClient.get('/api/v1/availability/blocks', { params });
  return response.data;
};

/**
 * Create a new room block
 */
export const createRoomBlock = async (blockData: RoomBlockCreate): Promise<RoomBlock> => {
  const response = await apiClient.post('/api/v1/availability/blocks', blockData);
  return response.data;
};

/**
 * Update an existing room block
 */
export const updateRoomBlock = async (
  blockId: number,
  blockData: RoomBlockUpdate
): Promise<RoomBlock> => {
  const response = await apiClient.put(`/api/v1/availability/blocks/${blockId}`, blockData);
  return response.data;
};

/**
 * Delete (cancel) a room block
 */
export const deleteRoomBlock = async (blockId: number): Promise<{ success: boolean; message: string }> => {
  const response = await apiClient.delete(`/api/v1/availability/blocks/${blockId}`);
  return response.data;
};

/**
 * Get today's activity statistics
 */
export const getTodayStats = async (): Promise<{
  date: string;
  arrivals: number;
  departures: number;
  in_house: number;
}> => {
  const response = await apiClient.get('/api/v1/availability/today-stats');
  return response.data;
};

/** Timeout for AI insights (60s) - backend may be slow generating insights */
const AI_INSIGHTS_TIMEOUT_MS = 60000;

/**
 * Get AI insights for availability patterns
 */
export const getAIInsights = async (daysAhead: number = 30): Promise<AIInsightsResponse> => {
  const response = await apiClient.get('/api/v1/availability/insights', {
    params: { days_ahead: daysAhead },
    timeout: AI_INSIGHTS_TIMEOUT_MS
  });
  return response.data;
};

/**
 * Helper: Update a single date/room type restriction
 */
export const updateSingleDayAvailability = async (
  roomTypeId: number,
  date: string,
  updates: {
    is_closed?: boolean;
    min_stay?: number;
    max_stay?: number;
    closed_to_arrival?: boolean;
    closed_to_departure?: boolean;
  }
): Promise<{ success: boolean; updated_records: number; message: string }> => {
  return bulkUpdateAvailability([
    {
      room_type_id: roomTypeId,
      start_date: date,
      end_date: date,
      ...updates
    }
  ]);
};

/**
 * Update a single room type's base price
 */
export const updateRoomTypePrice = async (
  roomTypeId: number,
  basePrice: number
): Promise<{ success: boolean; message: string }> => {
  const response = await apiClient.put(`/api/v1/availability/room-types/${roomTypeId}/price`, {
    base_price: basePrice
  });
  // Clear room-types cache so RoomsPage shows updated prices
  clearApiCache('room-types');
  return response.data;
};

/**
 * Bulk update room type prices
 */
export const bulkUpdateRoomTypePrices = async (
  updates: RoomTypePriceUpdate[]
): Promise<{ success: boolean; updated_count: number; message: string }> => {
  const response = await apiClient.put('/api/v1/availability/room-types/bulk-price', updates);
  // Clear room-types cache so RoomsPage shows updated prices
  clearApiCache('room-types');
  return response.data;
};

export default {
  getAvailabilityGrid,
  bulkUpdateAvailability,
  getRoomBlocks,
  createRoomBlock,
  updateRoomBlock,
  deleteRoomBlock,
  getTodayStats,
  getAIInsights,
  updateSingleDayAvailability,
  updateRoomTypePrice,
  bulkUpdateRoomTypePrices
};
