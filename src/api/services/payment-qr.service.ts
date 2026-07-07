/**
 * Payment QR Code Settings Service
 * Manages QR code image for payment verification
 */

import { apiClient } from '../client';

export interface QRSettingsResponse {
  qr_code_enabled: boolean;
  qr_code_image: string | null;
  qr_code_instructions: string | null;
  updated_at: string | null;
}

export interface QRSettingsUpdate {
  qr_code_enabled?: boolean;
  qr_code_image?: string;
  qr_code_instructions?: string;
}

const BASE_URL = '/api/v1/payment';

/**
 * Helper to unwrap API response
 */
function unwrap<T>(response: any): T {
  if (response?.data?.data !== undefined) {
    return response.data.data;
  }
  return response?.data ?? response;
}

export const paymentQRService = {
  /**
   * Get QR code settings (admin)
   */
  async getSettings(): Promise<QRSettingsResponse> {
    const response = await apiClient.get(`${BASE_URL}/qr-settings`);
    return unwrap(response);
  },

  /**
   * Get QR code settings (public - for booking page)
   */
  async getPublicSettings(): Promise<QRSettingsResponse> {
    const response = await apiClient.get(`${BASE_URL}/qr-settings/public`);
    return unwrap(response);
  },

  /**
   * Update QR code settings
   */
  async updateSettings(data: QRSettingsUpdate): Promise<QRSettingsResponse> {
    const response = await apiClient.put(`${BASE_URL}/qr-settings`, data);
    return unwrap(response);
  },

  /**
   * Convert file to base64
   */
  async fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  },
};
