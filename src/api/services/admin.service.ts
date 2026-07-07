import { apiClient } from '../client';
import { API_ENDPOINTS } from '@/config/constants';
import type { ApiResponse } from '../types/common.types';

export interface AdminPaymentMethod {
  id: number;
  user_id: number;
  user_email: string;
  user_name?: string;
  card_type: string;
  last4: string;
  expiry_month: number;
  expiry_year: number;
  cardholder_name?: string;
  is_default: boolean;
  is_active: boolean;
  created_at: string;
}

export interface AdminUserPreferences {
  user_id: number;
  email: string;
  full_name?: string;
  preferences?: {
    floor?: string;
    view?: string;
    bedType?: string;
    quietness?: string;
    temperature?: number;
    pillowType?: string[];
    minibar?: string[];
    dietary?: string[];
  };
  created_at: string;
  updated_at: string;
}

export interface AdminPreCheckIn {
  id: number;
  reservation_id: number;
  guest_id: number;
  guest_name?: string;
  guest_email: string;
  status: string;
  floor_preference?: string;
  view_preference?: string;
  bed_type_preference?: string;
  quietness_preference?: string;
  arrival_time?: string;
  flight_number?: string;
  purpose?: string;
  transportation_needed: boolean;
  pillow_type?: string;
  temperature?: number;
  minibar_preferences?: string;
  dietary_restrictions?: string;
  special_requests?: string;
  early_check_in: boolean;
  late_check_out: boolean;
  created_at: string;
  updated_at: string;
}

export const adminService = {
  getPaymentMethods: async (userId?: number): Promise<AdminPaymentMethod[]> => {
    const params = userId ? { user_id: userId } : {};
    const response = await apiClient.get<ApiResponse<AdminPaymentMethod[]>>(
      API_ENDPOINTS.ADMIN.PAYMENT_METHODS,
      { params }
    );
    return response.data.data || response.data;
  },

  getUserPreferences: async (userId?: number): Promise<AdminUserPreferences[]> => {
    const params = userId ? { user_id: userId } : {};
    const response = await apiClient.get<ApiResponse<AdminUserPreferences[]>>(
      API_ENDPOINTS.ADMIN.USER_PREFERENCES,
      { params }
    );
    return response.data.data || response.data;
  },

  getPreCheckIns: async (status?: string, reservationId?: number): Promise<AdminPreCheckIn[]> => {
    const params: any = {};
    if (status) params.status = status;
    if (reservationId) params.reservation_id = reservationId;
    
    const response = await apiClient.get<ApiResponse<AdminPreCheckIn[]>>(
      API_ENDPOINTS.ADMIN.PRECHECKINS,
      { params }
    );
    return response.data.data || response.data;
  },

  getAllBookings: async (status?: string, fromDate?: string, toDate?: string): Promise<any[]> => {
    const params: any = {};
    if (status) params.status = status;
    if (fromDate) params.from_date = fromDate;
    if (toDate) params.to_date = toDate;
    
    const response = await apiClient.get<ApiResponse<any[]>>(
      API_ENDPOINTS.ADMIN.BOOKINGS,
      { params }
    );
    return response.data.data || response.data;
  },
};

