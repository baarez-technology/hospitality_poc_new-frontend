import { apiClient, clearApiCache } from '../client';
import { API_ENDPOINTS } from '@/config/constants';
import type { Room, RoomFilters } from '../types/room.types';
import type { ApiResponse, PaginatedResponse } from '../types/common.types';

export interface RoomTypeCreate {
  name: string;
  description?: string;
  short_description?: string;
  base_price: number;
  max_guests: number;
  amenities?: string[];
  features?: string[];
  bed_type?: string;
  size_sqft?: number;
  view_type?: string;
  category?: string;
  images?: string[];
}

export interface RoomTypeUpdate {
  name?: string;
  description?: string;
  short_description?: string;
  base_price?: number;
  max_guests?: number;
  amenities?: string[];
  features?: string[];
  bed_type?: string;
  size_sqft?: number;
  view_type?: string;
  category?: string;
  images?: string[];
  is_active?: boolean;
}

export const roomTypesService = {
  getRoomTypes: async (filters?: RoomFilters) => {
    const params: Record<string, string> = {};
    if (filters?.checkIn) params.checkIn = filters.checkIn;
    if (filters?.checkOut) params.checkOut = filters.checkOut;
    if (filters?.guests) params.guests = String(filters.guests);
    if (filters?.minPrice) params.minPrice = String(filters.minPrice);
    if (filters?.maxPrice) params.maxPrice = String(filters.maxPrice);
    if (filters?.type) params.category = filters.type;

    const response = await apiClient.get<ApiResponse<PaginatedResponse<Room>>>(
      API_ENDPOINTS.ROOM_TYPES.LIST,
      { params }
    );
    // API returns { items: Room[], total, page, pageSize, totalPages }
    // Extract the items array from the paginated response
    const data = response.data.data || response.data;
    if (data && 'items' in data && Array.isArray((data as any).items)) {
      return (data as any).items;
    }
    return Array.isArray(data) ? data : [];
  },

  createRoomType: async (data: RoomTypeCreate): Promise<Room> => {
    const response = await apiClient.post<ApiResponse<Room>>(
      API_ENDPOINTS.ROOM_TYPES.CREATE,
      data
    );
    // Clear the room-types cache so all pages reflect the new room type
    clearApiCache('room-types');
    return response.data.data || response.data;
  },

  getRoomTypeBySlug: async (slug: string, filters?: { checkIn?: string; checkOut?: string; guests?: number }) => {
    const params: Record<string, string> = {};
    if (filters?.checkIn) params.checkIn = filters.checkIn;
    if (filters?.checkOut) params.checkOut = filters.checkOut;
    if (filters?.guests) params.guests = String(filters.guests);

    const response = await apiClient.get<ApiResponse<Room>>(
      API_ENDPOINTS.ROOM_TYPES.DETAIL(slug),
      { params }
    );
    return response.data.data || response.data;
  },

  updateRoomType: async (slug: string, updates: RoomTypeUpdate): Promise<Room> => {
    const response = await apiClient.put<ApiResponse<Room>>(
      API_ENDPOINTS.ROOM_TYPES.UPDATE(slug),
      updates
    );
    clearApiCache('room-types');
    return response.data.data || response.data;
  },

  deleteRoomType: async (slug: string): Promise<void> => {
    await apiClient.delete(API_ENDPOINTS.ROOM_TYPES.DELETE(slug));
    clearApiCache('room-types');
  },
};

