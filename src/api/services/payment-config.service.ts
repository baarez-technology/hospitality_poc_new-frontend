/**
 * Payment Configuration Service
 * API calls for managing per-hotel payment gateway settings.
 */

import { apiClient } from '../client';
import type {
  PaymentConfigInput,
  PaymentConfigResponse,
  PaymentConfigStatus,
  ValidationResponse,
  PaymentConfigToggle,
} from '../../types/payment-config.types';

const BASE_URL = '/api/v1/admin/payment-config';

/**
 * Helper to unwrap API response.
 * The apiClient wraps responses in { success: true, data: {...} } format.
 */
function unwrapResponse<T>(response: any): T {
  // If response has data property with actual data, unwrap it
  if (response && typeof response === 'object') {
    if ('data' in response && response.data !== undefined) {
      // Check if it's double wrapped
      if ('data' in response.data) {
        return response.data.data as T;
      }
      return response.data as T;
    }
  }
  return response as T;
}

export const paymentConfigService = {
  /**
   * Get current payment configuration.
   * Returns masked secrets for display.
   */
  getConfig: async (): Promise<PaymentConfigResponse> => {
    const response = await apiClient.get<PaymentConfigResponse>(BASE_URL);
    return unwrapResponse<PaymentConfigResponse>(response.data);
  },

  /**
   * Get payment configuration status.
   * Lightweight endpoint for status checks.
   */
  getStatus: async (): Promise<PaymentConfigStatus> => {
    const response = await apiClient.get<PaymentConfigStatus>(`${BASE_URL}/status`);
    return unwrapResponse<PaymentConfigStatus>(response.data);
  },

  /**
   * Save payment configuration.
   * Creates new config or updates existing.
   * Secrets will be encrypted server-side.
   */
  saveConfig: async (config: PaymentConfigInput): Promise<PaymentConfigResponse> => {
    const response = await apiClient.post<PaymentConfigResponse>(BASE_URL, config);
    return unwrapResponse<PaymentConfigResponse>(response.data);
  },

  /**
   * Validate credentials with Razorpay.
   * Creates a test order to verify credentials work.
   */
  validateConfig: async (): Promise<ValidationResponse> => {
    const response = await apiClient.post<ValidationResponse>(`${BASE_URL}/validate`);
    return unwrapResponse<ValidationResponse>(response.data);
  },

  /**
   * Enable or disable payment configuration.
   * Requires validation before enabling.
   */
  toggleConfig: async (enabled: boolean): Promise<PaymentConfigResponse> => {
    const data: PaymentConfigToggle = { enabled };
    const response = await apiClient.post<PaymentConfigResponse>(`${BASE_URL}/toggle`, data);
    return unwrapResponse<PaymentConfigResponse>(response.data);
  },
};

export default paymentConfigService;
