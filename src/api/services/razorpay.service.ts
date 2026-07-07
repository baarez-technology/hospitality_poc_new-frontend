/**
 * Razorpay Payment Service
 * API calls for Razorpay payment operations using Standard Checkout
 */

import { apiClient } from '../client';
import type {
  CreateOrderRequest,
  OrderResponse,
  VerifyPaymentRequest,
  PaymentVerificationResponse,
  PaymentDetailsResponse,
  CreateRefundRequest,
  RefundResponse,
  PaymentGatewayConfig,
  CreatePaymentLinkRequest,
  PaymentLinkResponse,
  SavedCardPaymentRequest,
  DirectPaymentResponse,
} from '../../types/razorpay.types';

const BASE_URL = '/api/v1/payments';

// Payment status response
export interface PaymentStatusResponse {
  payment_id: string;
  status: 'created' | 'authorized' | 'captured' | 'failed' | 'refunded';
  method?: string;
  amount: number;
  currency: string;
}

/**
 * Helper to unwrap API response.
 * The apiClient wraps responses in { success: true, data: {...} } format.
 */
function unwrapResponse<T>(response: any): T {
  if (response && typeof response === 'object') {
    // Check for double wrapped: { data: { data: {...} } }
    if ('data' in response && response.data !== undefined) {
      if (typeof response.data === 'object' && 'data' in response.data) {
        return response.data.data as T;
      }
      // Check if it's wrapped: { success: true, data: {...} }
      if ('success' in response && response.data !== undefined) {
        return response.data as T;
      }
      return response.data as T;
    }
  }
  return response as T;
}

export const razorpayService = {
  /**
   * Get payment gateway configuration
   * Returns enabled gateways and public keys
   */
  async getConfig(): Promise<PaymentGatewayConfig> {
    const response = await apiClient.get<PaymentGatewayConfig>(`${BASE_URL}/config`);
    const config = unwrapResponse<PaymentGatewayConfig>(response.data);
    console.log('Razorpay config loaded:', config);
    return config;
  },

  /**
   * Create a Razorpay order for payment
   * @param data Order details including amount
   * @returns Order response with order_id for checkout
   */
  async createOrder(data: CreateOrderRequest): Promise<OrderResponse> {
    const response = await apiClient.post<OrderResponse>(`${BASE_URL}/razorpay/order`, data);
    return unwrapResponse<OrderResponse>(response.data);
  },

  /**
   * Verify payment after successful checkout
   * CRITICAL: Always verify payment server-side before confirming booking
   * @param data Payment verification data from Razorpay
   * @returns Verification response
   */
  async verifyPayment(data: VerifyPaymentRequest): Promise<PaymentVerificationResponse> {
    const response = await apiClient.post<PaymentVerificationResponse>(
      `${BASE_URL}/razorpay/verify`,
      data
    );
    return unwrapResponse<PaymentVerificationResponse>(response.data);
  },

  /**
   * Get payment details from Razorpay
   * @param paymentId Razorpay payment ID
   * @returns Payment details
   */
  async getPaymentDetails(paymentId: string): Promise<PaymentDetailsResponse> {
    const response = await apiClient.get<PaymentDetailsResponse>(
      `${BASE_URL}/razorpay/payment/${paymentId}`
    );
    return unwrapResponse<PaymentDetailsResponse>(response.data);
  },

  /**
   * Check payment status
   * @param paymentId Razorpay payment ID
   * @returns Payment status
   */
  async checkPaymentStatus(paymentId: string): Promise<PaymentStatusResponse> {
    const response = await apiClient.get<PaymentStatusResponse>(
      `${BASE_URL}/razorpay/payment/${paymentId}/status`
    );
    return unwrapResponse<PaymentStatusResponse>(response.data);
  },

  /**
   * Create a refund for a payment
   * @param data Refund request details
   * @returns Refund response
   */
  async createRefund(data: CreateRefundRequest): Promise<RefundResponse> {
    const response = await apiClient.post<RefundResponse>(`${BASE_URL}/razorpay/refund`, data);
    return unwrapResponse<RefundResponse>(response.data);
  },

  /**
   * Create a shareable payment link
   * @param data Payment link details
   * @returns Payment link with short URL
   */
  async createPaymentLink(data: CreatePaymentLinkRequest): Promise<PaymentLinkResponse> {
    const response = await apiClient.post<PaymentLinkResponse>(
      `${BASE_URL}/razorpay/payment-link`,
      data
    );
    return unwrapResponse<PaymentLinkResponse>(response.data);
  },

  /**
   * Pay using a saved card (S2S payment - no modal)
   * @param data Saved card payment request with CVV
   * @returns Direct payment response
   */
  async payWithSavedCard(data: SavedCardPaymentRequest): Promise<DirectPaymentResponse> {
    const response = await apiClient.post<DirectPaymentResponse>(
      `${BASE_URL}/razorpay/pay/saved-card`,
      data
    );
    return unwrapResponse<DirectPaymentResponse>(response.data);
  },
};

export default razorpayService;
