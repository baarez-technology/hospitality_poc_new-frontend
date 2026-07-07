import { apiClient } from '../client';
import type { ApiResponse } from '../types/common.types';

// ============== BOOKING VERIFICATION ==============

export interface VerifyBookingRequest {
  booking_number: string;
  guest_name: string;
}

export interface VerifyBookingResponse {
  valid: boolean;
  reservation_id?: number;
  guest_name?: string;
  room_type?: string;
  check_in?: string;
  check_out?: string;
  nights?: number;
  status?: string;
  error?: string;
  guest_email?: string;
  guest_phone?: string;
}

// ============== DOCUMENT VERIFICATION ==============

export interface DocumentVerifyRequest {
  precheckin_id?: number;
  image_url: string;
  expected_name: string;
  id_type?: string;
}

export interface DocumentVerifyResponse {
  verified: boolean;
  confidence: number;
  extracted_name?: string;
  id_type_detected?: string;
  id_number?: string;
  expiry_date?: string;
  message: string;
  details?: Record<string, any>;
}

export interface PreCheckInData {
  reservation_id: number;
  email: string;
  phone: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  country?: string;
  floor_preference?: string;
  view_preference?: string;
  bed_type_preference?: string;
  quietness_preference?: string;
  /** ETA: pre-check-in Expected Arrival (from arrival_time). */
  arrival_time?: string;
  /** ETD: pre-check-in Expected Departure (from departure_time). */
  departure_time?: string;
  flight_number?: string;
  purpose?: string;
  transportation_needed?: boolean;
  pillow_type?: string;
  temperature?: number;
  minibar_preferences?: string;
  dietary_restrictions?: string;
  special_requests?: string;
  early_check_in?: boolean;
  late_check_out?: boolean;
}

export interface PreCheckInResponse {
  id: number;
  reservation_id: number;
  guest_id: number;
  email: string;
  phone: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  country?: string;
  floor_preference?: string;
  view_preference?: string;
  bed_type_preference?: string;
  quietness_preference?: string;
  selected_room_id?: number;
  ai_score?: number;
  ai_reasoning?: string;
  /** ETA: pre-check-in Expected Arrival (from arrival_time). */
  arrival_time?: string;
  /** ETD: pre-check-in Expected Departure (from departure_time). */
  departure_time?: string;
  flight_number?: string;
  purpose?: string;
  transportation_needed: boolean;
  id_front_url?: string;
  id_back_url?: string;
  id_type?: string;
  id_verified: boolean;
  pillow_type?: string;
  temperature?: number;
  minibar_preferences?: string;
  dietary_restrictions?: string;
  special_requests?: string;
  early_check_in: boolean;
  late_check_out: boolean;
  digital_key_id?: string;
  digital_key_activated: boolean;
  qr_code?: string;
  status: string;
  completed_at?: string;
  created_at: string;
  updated_at: string;
}

// Alias for backward compatibility with context
export type PreCheckInRead = PreCheckInResponse;

export interface RoomRecommendation {
  room_id: number;
  room_number: string;
  room_type: string;
  floor: number;
  view: string;
  bed_type: string;
  score: number;
  reasoning: string[];
}

export const precheckinService = {
  /**
   * Create or update pre-check-in
   */
  create: async (data: PreCheckInData): Promise<PreCheckInResponse> => {
    const response = await apiClient.post<ApiResponse<PreCheckInResponse>>(
      '/api/v1/precheckin',
      data
    );
    return response.data.data || response.data;
  },

  /**
   * Get pre-check-in by ID
   */
  getById: async (id: number): Promise<PreCheckInResponse> => {
    const response = await apiClient.get<ApiResponse<PreCheckInResponse>>(
      `/api/v1/precheckin/${id}`
    );
    return response.data.data || response.data;
  },

  /**
   * Get pre-check-in by reservation ID
   * Returns null if no pre-check-in exists for the reservation (404).
   */
  getByReservation: async (reservationId: number): Promise<PreCheckInResponse | null> => {
    try {
      const response = await apiClient.get<ApiResponse<PreCheckInResponse | null>>(
        `/api/v1/precheckin/reservation/${reservationId}`
      );
      // Handle ApiResponse wrapper - extract data field if it exists
      if (response.data && typeof response.data === 'object' && 'data' in response.data) {
        return (response.data as ApiResponse<PreCheckInResponse | null>).data;
      }
      return response.data as PreCheckInResponse | null;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  },

  /**
   * Update pre-check-in
   */
  update: async (id: number, data: Partial<PreCheckInData>): Promise<PreCheckInResponse> => {
    const response = await apiClient.patch<ApiResponse<PreCheckInResponse>>(
      `/api/v1/precheckin/${id}`,
      data
    );
    return response.data.data || response.data;
  },

  /**
   * Get AI room recommendations based on preferences
   */
  recommendRooms: async (id: number): Promise<{ recommended_rooms: RoomRecommendation[] }> => {
    const response = await apiClient.post<ApiResponse<{ recommended_rooms: RoomRecommendation[] }>>(
      `/api/v1/precheckin/${id}/recommend-rooms`
    );
    return response.data.data || response.data;
  },

  /**
   * List all pre-check-ins (admin)
   */
  list: async (params?: { reservation_id?: number; status?: string }): Promise<PreCheckInResponse[]> => {
    const response = await apiClient.get<ApiResponse<PreCheckInResponse[]>>(
      '/api/v1/precheckin',
      { params }
    );
    return response.data.data || response.data;
  },

  /**
   * Verify booking number and guest name
   */
  verifyBooking: async (data: VerifyBookingRequest): Promise<VerifyBookingResponse> => {
    try {
      const response = await apiClient.post<VerifyBookingResponse>(
        '/api/v1/precheckin/verify-booking',
        data
      );
      // Handle wrapped response
      const result = response.data?.data || response.data;
      console.log('[precheckinService.verifyBooking] Response:', result);
      return result;
    } catch (error: any) {
      console.error('[precheckinService.verifyBooking] Error:', error);
      // Return error response format
      return {
        valid: false,
        error: error.response?.data?.detail || error.message || 'Failed to verify booking'
      };
    }
  },

  /**
   * Verify ID document using AI
   */
  verifyDocument: async (data: Omit<DocumentVerifyRequest, 'precheckin_id'> & { precheckin_id?: number }): Promise<DocumentVerifyResponse> => {
    try {
      const response = await apiClient.post<DocumentVerifyResponse>(
        '/api/v1/precheckin/verify-document',
        data
      );
      // Handle wrapped response from axios interceptor
      const result = response.data?.data || response.data;
      return result;
    } catch (error: any) {
      console.error('[precheckinService.verifyDocument] Error:', error);
      return {
        verified: false,
        confidence: 0,
        message: error.response?.data?.detail || error.message || 'Failed to verify document'
      };
    }
  },

  /**
   * Upload document for verification
   */
  uploadDocument: async (precheckinId: number, documentType: 'front' | 'back', file: File): Promise<any> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await apiClient.post(
      `/api/v1/precheckin/${precheckinId}/upload-document?document_type=${documentType}`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  },

  /**
   * Browse all available rooms for a reservation
   */
  browseRooms: async (reservationId: number): Promise<any> => {
    const response = await apiClient.get(
      `/api/v1/precheckin/rooms/browse?reservation_id=${reservationId}`
    );
    return response.data;
  },

  /**
   * Complete pre-checkin with room selection and generate digital key
   */
  completePrecheckin: async (precheckinId: number, data: {
    selected_room_id?: number;
    room_type_slug?: string;
    ai_score?: number;
    ai_reasoning?: string[];
  }): Promise<any> => {
    const response = await apiClient.post(
      `/api/v1/precheckin/${precheckinId}/complete`,
      data
    );
    return response.data;
  },
};
