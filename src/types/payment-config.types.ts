/**
 * Payment Configuration Types
 * Types for per-hotel payment gateway configuration.
 */

export type ValidationStatus = 'pending' | 'valid' | 'invalid';

/**
 * Input data for creating/updating payment configuration.
 */
export interface PaymentConfigInput {
  razorpay_key_id?: string;
  razorpay_key_secret?: string;
  razorpay_webhook_secret?: string;
  is_test_mode: boolean;
  currency: string;
  auto_capture: boolean;
  card_enabled?: boolean;
  upi_enabled?: boolean;
  cash_enabled?: boolean;
}

/**
 * Payment configuration response from API.
 * Contains masked secrets for security.
 */
export interface PaymentConfigResponse {
  id: number;
  hotel_code: string | null;
  gateway: string;
  razorpay_key_id: string | null;
  razorpay_key_secret_masked: string | null;
  razorpay_webhook_secret_masked: string | null;
  is_test_mode: boolean;
  webhook_url: string | null;
  currency: string;
  auto_capture: boolean;
  card_enabled: boolean;
  upi_enabled: boolean;
  cash_enabled: boolean;
  is_enabled: boolean;
  validation_status: ValidationStatus;
  created_at: string;
  updated_at: string;
}

/**
 * Payment configuration status response.
 * Used to determine UI state.
 */
export interface PaymentConfigStatus {
  is_configured: boolean;
  is_enabled: boolean;
  is_validated: boolean;
  validation_status: ValidationStatus;
  gateway: string;
  is_test_mode: boolean;
  currency: string;
  razorpay_key_id: string | null;
  card_enabled: boolean;
  upi_enabled: boolean;
  cash_enabled: boolean;
}

/**
 * Credential validation response.
 */
export interface ValidationResponse {
  valid: boolean;
  message: string;
  test_order_id: string | null;
  error_code: string | null;
}

/**
 * Toggle enable/disable request.
 */
export interface PaymentConfigToggle {
  enabled: boolean;
}

/**
 * Supported currencies for payment.
 */
export const SUPPORTED_CURRENCIES = ['INR', 'USD', 'EUR', 'GBP', 'SGD', 'AED'] as const;
export type SupportedCurrency = typeof SUPPORTED_CURRENCIES[number];
