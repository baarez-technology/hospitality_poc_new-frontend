import { apiClient } from '../client';
import { API_ENDPOINTS } from '@/config/constants';
import type { Room } from '../types/booking.types';
import type { ApiResponse, PaginatedResponse } from '../types/common.types';

export interface RoomsSearchParams {
  checkIn?: string;
  checkOut?: string;
  guests?: number;
  minPrice?: number;
  maxPrice?: number;
  type?: string;
  page?: number;
  pageSize?: number;
}

export const roomsService = {
  /**
   * Get list of rooms with optional filters
   */
  getRooms: async (params?: RoomsSearchParams): Promise<Room[]> => {
    try {
      const response = await apiClient.get<ApiResponse<PaginatedResponse<Room>>>(
        API_ENDPOINTS.ROOMS.LIST,
        { params }
      );
      console.log('[roomsService.getRooms] Raw response:', response.data);

      // Handle various response formats due to axios interceptor wrapping
      const responseData = response.data;

      // Case 1: { success: true, data: { items: [...] } } - wrapped paginated
      if (responseData?.data?.items) {
        console.log('[roomsService.getRooms] Found data.items');
        return responseData.data.items;
      }

      // Case 2: { items: [...] } - direct paginated
      if (responseData?.items) {
        console.log('[roomsService.getRooms] Found items');
        return responseData.items;
      }

      // Case 3: { success: true, data: [...] } - wrapped array
      if (Array.isArray(responseData?.data)) {
        console.log('[roomsService.getRooms] Found data array');
        return responseData.data;
      }

      // Case 4: [...] - direct array
      if (Array.isArray(responseData)) {
        console.log('[roomsService.getRooms] Found direct array');
        return responseData;
      }

      console.warn('[roomsService.getRooms] Unexpected response format:', responseData);
      return [];
    } catch (error) {
      console.error('[roomsService.getRooms] Error fetching rooms:', error);
      return [];
    }
  },

  /**
   * Get room details by ID or slug
   */
  getRoomById: async (id: string): Promise<Room> => {
    const response = await apiClient.get<ApiResponse<Room>>(
      API_ENDPOINTS.ROOMS.DETAIL(id)
    );
    return response.data.data || response.data;
  },

  /**
   * Get room by slug (for room detail pages)
   */
  getRoomBySlug: async (slug: string): Promise<Room> => {
    return roomsService.getRoomById(slug);
  },

  /**
   * Check if a room is available for specific dates
   */
  checkAvailability: async (
    roomId: string,
    checkIn: string,
    checkOut: string
  ): Promise<{ available: boolean }> => {
    const response = await apiClient.get<ApiResponse<{ available: boolean }>>(
      `${API_ENDPOINTS.ROOMS.DETAIL(roomId)}/availability`,
      { params: { checkIn, checkOut } }
    );
    return response.data.data || response.data;
  },

  /**
   * Update room status (housekeeping endpoint)
   */
  updateRoomStatus: async (roomId: number | string, status: string): Promise<any> => {
    const response = await apiClient.patch(
      `/api/v1/housekeeping/rooms/${roomId}/status`,
      { status }
    );
    return response.data.data || response.data;
  },

  /**
   * Update room details
   */
  updateRoom: async (roomId: number | string, data: {
    status?: string;
    bed_type?: string;
    view_type?: string;
    floor?: number;
    amenities?: string;
    description?: string;
  }): Promise<any> => {
    const response = await apiClient.patch(
      API_ENDPOINTS.ROOMS.DETAIL(String(roomId)),
      data
    );
    return response.data.data || response.data;
  },

  /**
   * Block a room — Out of Service (OOS)
   */
  blockRoom: async (roomId: number | string, reason: string): Promise<any> => {
    const response = await apiClient.patch(
      `/api/v1/housekeeping/rooms/${roomId}/status`,
      { status: 'out_of_service', notes: reason }
    );
    return response.data.data || response.data;
  },

  /**
   * Block a room — Out of Order (OOO)
   */
  blockRoomOOO: async (roomId: number | string, reason: string): Promise<any> => {
    const response = await apiClient.patch(
      `/api/v1/housekeeping/rooms/${roomId}/status`,
      { status: 'out_of_order', notes: reason }
    );
    return response.data.data || response.data;
  },

  /**
   * Unblock a room (set back to available)
   */
  unblockRoom: async (roomId: number | string): Promise<any> => {
    const response = await apiClient.patch(
      `/api/v1/housekeeping/rooms/${roomId}/status`,
      { status: 'available' }
    );
    return response.data.data || response.data;
  },

  /**
   * Mark room as clean
   */
  markClean: async (roomId: number | string): Promise<any> => {
    const response = await apiClient.patch(
      `/api/v1/housekeeping/rooms/${roomId}/status`,
      { status: 'clean' }
    );
    return response.data.data || response.data;
  },

  /**
   * Mark room as dirty
   */
  markDirty: async (roomId: number | string): Promise<any> => {
    const response = await apiClient.patch(
      `/api/v1/housekeeping/rooms/${roomId}/status`,
      { status: 'dirty' }
    );
    return response.data.data || response.data;
  },

  /**
   * Inspect room (mark as inspected/clean)
   */
  inspectRoom: async (roomId: number | string, passed: boolean, notes?: string): Promise<any> => {
    const response = await apiClient.post(
      `/api/v1/housekeeping/rooms/${roomId}/inspect`,
      { passed, notes }
    );
    return response.data.data || response.data;
  },


  /**
   * Add a note to a room (persisted to Room.notes in the database)
   */
  addRoomNote: async (roomId: number | string, note: string): Promise<any> => {
    const response = await apiClient.post(
      `/api/v1/rooms/${roomId}/notes`,
      { note }
    );
    return response.data;
  },

  /**
   * Create a new room
   */
  createRoom: async (data: {
    number: string;
    room_type: string;
    floor?: number;
    status?: string;
    capacity?: number;
    max_occupancy?: number;
    bed_type?: string;
    view_type?: string;
    amenities?: string;
    description?: string;
  }): Promise<any> => {
    const response = await apiClient.post(API_ENDPOINTS.ROOMS.LIST, data);
    return response.data.data || response.data;
  },

  /**
   * Delete a room
   */
  deleteRoom: async (roomId: number | string): Promise<void> => {
    await apiClient.delete(API_ENDPOINTS.ROOMS.DETAIL(String(roomId)));
  },
};