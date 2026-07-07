import { apiClient } from '../client';
import { API_ENDPOINTS } from '@/config/constants';
import type { ApiResponse } from '../types/common.types';

export interface ChatMessage {
  message: string;
  conversation_id?: string;
}

export interface ChatResponse {
  response: string;
  state: {
    check_in_date?: string;
    check_out_date?: string;
    room_type?: string;
    adults?: number;
    children?: number;
    special_requests?: string;
    guest_name?: string;
    guest_email?: string;
    guest_phone?: string;
    booking_ready?: boolean;
    missing_fields?: string[];
  };
  booking_ready: boolean;
  error?: string;
}

export interface CreateBookingRequest {
  state: {
    check_in_date: string;
    check_out_date: string;
    room_type: string;
    adults: number;
    children?: number;
    special_requests?: string;
    guest_name: string;
    guest_email: string;
    guest_phone: string;
  };
}

export const guestAIService = {
  chat: async (payload: ChatMessage) => {
    const response = await apiClient.post<ApiResponse<ChatResponse>>(
      API_ENDPOINTS.GUEST_AI.CHAT,
      payload
    );
    return response.data.data || response.data;
  },

  createBooking: async (payload: CreateBookingRequest) => {
    const response = await apiClient.post<ApiResponse<any>>(
      API_ENDPOINTS.GUEST_AI.CREATE_BOOKING,
      payload
    );
    return response.data.data || response.data;
  },
};

