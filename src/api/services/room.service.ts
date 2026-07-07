import { apiClient } from '../client';
import { API_ENDPOINTS } from '@/config/constants';
import type { Room, RoomFilters } from '../types/room.types';
import type { ApiResponse, PaginatedResponse } from '../types/common.types';

export const roomService = {
  getRooms: async (filters?: RoomFilters) => {
    const params: Record<string, string> = {};
    if (filters?.checkIn) params.checkIn = filters.checkIn;
    if (filters?.checkOut) params.checkOut = filters.checkOut;
    if (filters?.guests) params.guests = String(filters.guests);
    if (filters?.minPrice) params.minPrice = String(filters.minPrice);
    if (filters?.maxPrice) params.maxPrice = String(filters.maxPrice);
    if (filters?.type) params.type = filters.type;
    
    const response = await apiClient.get<ApiResponse<PaginatedResponse<Room>>>(
      API_ENDPOINTS.ROOMS.LIST,
      { params }
    );
    return response.data.data || response.data;
  },

  getRoomById: async (id: string) => {
    const response = await apiClient.get<ApiResponse<Room>>(
      API_ENDPOINTS.ROOMS.DETAIL(id)
    );
    return response.data.data || response.data;
  },

  checkAvailability: async (roomId: string, checkIn: string, checkOut: string) => {
    const response = await apiClient.get<ApiResponse<{ available: boolean }>>(
      API_ENDPOINTS.ROOMS.AVAILABILITY(roomId),
      { params: { checkIn, checkOut } }
    );
    return response.data.data || response.data;
  },
};
