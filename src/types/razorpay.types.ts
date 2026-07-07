/**
 * Razorpay TypeScript Type Definitions
 * Types for Standard Checkout integration
 */

// API Request/Response Types

export interface CreateOrderRequest {
  amount: number; // In rupees
  currency?: string;
  receipt?: string;
  booking_id?: number;
  folio_id?: number;
  notes?: Record<string, string>;
}

export interface OrderResponse {
  order_id: string;
  amount: number; // In paise
  amount_display: number; // In rupees
  currency: string;
  receipt?: string;
  status: string;
  created_at: string;
  key_id: string;
  notes?: Record<string, string>;
}

export interface VerifyPaymentRequest {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
  booking_id?: number;
  folio_id?: number;
}

export interface PaymentVerificationResponse {
  success: boolean;
  payment_id: string;
  order_id: string;
  amount: number;
  currency: string;
  method?: string;
  status: string;
  captured: boolean;
  message: string;
}

export interface PaymentDetailsResponse {
  id: string;
  order_id?: string;
  amount: number;
  currency: string;
  status: string;
  method?: string;
  captured: boolean;
  description?: string;
  card_id?: string;
  bank?: string;
  wallet?: string;
  vpa?: string;
  email?: string;
  contact?: string;
  fee?: number;
  tax?: number;
  error_code?: string;
  error_description?: string;
  created_at: string;
}

export interface CreateRefundRequest {
  payment_id: string;
  amount?: number; // In rupees, null = full refund
  reason: string;
  speed?: 'normal' | 'optimum';
  notes?: Record<string, string>;
}

export interface RefundResponse {
  id: string;
  payment_id: string;
  amount: number;
  currency: string;
  status: string;
  speed_requested: string;
  speed_processed?: string;
  created_at: string;
  notes?: Record<string, string>;
}

export interface PaymentGatewayConfig {
  razorpay_enabled: boolean;
  razorpay_key_id?: string;
  stripe_enabled: boolean;
  stripe_publishable_key?: string;
  pay_at_hotel_enabled: boolean;
  default_currency: string;
  supported_methods: string[];
  card_enabled: boolean;
  upi_enabled: boolean;
  cash_enabled: boolean;
}

export interface CreatePaymentLinkRequest {
  amount: number;
  description?: string;
  customer_name?: string;
  customer_email?: string;
  customer_phone?: string;
  booking_id?: number;
  notify_sms?: boolean;
  notify_email?: boolean;
  callback_url?: string;
}

export interface PaymentLinkResponse {
  id: string;
  amount: number;
  currency: string;
  status: string;
  short_url: string;
  description?: string;
  created_at: string;
  expire_by?: string;
}

// S2S Payment Types

export interface SavedCardPaymentRequest {
  order_id: string;
  saved_card_id: number;
  cvv: string;
  email: string;
  contact: string;
}

export interface DirectPaymentResponse {
  success: boolean;
  pending?: boolean;
  payment_id?: string;
  order_id?: string;
  error?: string;
  error_code?: string;
  razorpay_payment_id?: string;
  razorpay_order_id?: string;
  razorpay_signature?: string;
}

// Payment Method Types
export type PaymentMethod = 'card' | 'upi' | 'netbanking' | 'wallet' | 'cash' | 'bank_transfer';

// Payment Status Types
export type PaymentStatus = 'pending' | 'authorized' | 'captured' | 'failed' | 'refunded' | 'partially_refunded';
