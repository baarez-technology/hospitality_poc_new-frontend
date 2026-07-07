import { apiClient } from '../client';
import { API_ENDPOINTS } from '@/config/constants';
import type { ApiResponse } from '../types/common.types';

export interface ReservationUpdate {
  arrival_date?: string;
  departure_date?: string;
  adults?: number;
  children?: number;
  special_requests?: string;
  room_id?: number;
  rate_plan_id?: number;
}

export interface ReservationNote {
  note: string;
  note_type?: string;
  is_internal?: boolean;
}

export const reservationsService = {
  updateReservation: async (reservationId: string, updates: ReservationUpdate) => {
    const response = await apiClient.patch<ApiResponse<any>>(
      `/api/v1/reservations/${reservationId}`,
      updates
    );
    return response.data.data || response.data;
  },

  assignRoom: async (reservationId: string, roomId?: number, autoAssign: boolean = true) => {
    const params = autoAssign ? { auto_assign: true } : { room_id: roomId, auto_assign: false };
    const response = await apiClient.post<ApiResponse<any>>(
      `/api/v1/reservations/${reservationId}/assign-room`,
      {},
      { params }
    );
    return response.data.data || response.data;
  },

  addNote: async (reservationId: string, note: ReservationNote) => {
    const response = await apiClient.post<ApiResponse<any>>(
      `/api/v1/reservations/${reservationId}/notes`,
      note
    );
    return response.data.data || response.data;
  },

  getHistory: async (reservationId: string) => {
    const response = await apiClient.get<ApiResponse<any[]>>(
      `/api/v1/reservations/${reservationId}/history`
    );
    return response.data.data || response.data;
  },

  searchByConfirmationCode: async (confirmationCode: string) => {
    const response = await apiClient.get<ApiResponse<any[]>>(
      '/api/v1/reservations',
      { params: { confirmation_code: confirmationCode.toUpperCase() } }
    );
    const data = response.data.data || response.data;
    // Return the first matching reservation
    return Array.isArray(data) && data.length > 0 ? data[0] : null;
  },
};





