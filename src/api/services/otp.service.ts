import { apiClient } from '../client';
import { API_ENDPOINTS } from '@/config/constants';
import type { ApiResponse } from '../types/common.types';

export interface SendOTPRequest {
  email: string;
  purpose?: string;
  booking_id?: number;
}

export interface VerifyOTPRequest {
  email: string;
  otp_code: string;
  purpose?: string;
  booking_id?: number;
}

export const otpService = {
  sendOTP: async (payload: SendOTPRequest) => {
    const response = await apiClient.post<ApiResponse<{ message: string; expires_in_minutes: number }>>(
      API_ENDPOINTS.OTP.SEND,
      payload
    );
    return response.data.data || response.data;
  },

  verifyOTP: async (payload: VerifyOTPRequest) => {
    const response = await apiClient.post<ApiResponse<{ message: string; verified: boolean }>>(
      API_ENDPOINTS.OTP.VERIFY,
      payload
    );
    return response.data.data || response.data;
  },
};

