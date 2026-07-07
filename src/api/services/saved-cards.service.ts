/**
 * Saved Cards Service
 * API calls for managing saved payment cards.
 */

import { apiClient } from '../client';
import type {
  SavedCard,
  SavedCardList,
  SaveCardFromPaymentRequest,
  SaveCardDirectRequest,
} from '../../types/saved-card.types';

const BASE_URL = '/api/v1/saved-cards';

// Card verification order response
export interface CardVerificationOrderResponse {
  order_id: string;
  amount: number;
  currency: string;
  key_id: string;
  description: string;
}

export const savedCardsService = {
  /**
   * Get all saved cards for the current user
   */
  async getCards(): Promise<SavedCardList> {
    const response = await apiClient.get<SavedCardList | SavedCard[]>(BASE_URL);
    const data = response.data;

    // Handle different response formats
    if (Array.isArray(data)) {
      return { cards: data, count: data.length };
    }
    if (data && 'cards' in data) {
      return data as SavedCardList;
    }
    // Fallback for wrapped responses
    const anyData = data as any;
    if (anyData?.data?.cards) {
      return anyData.data as SavedCardList;
    }

    return { cards: [], count: 0 };
  },

  /**
   * Save a card directly (without payment)
   */
  async saveCard(data: SaveCardDirectRequest): Promise<SavedCard> {
    const response = await apiClient.post<SavedCard>(BASE_URL, data);
    return response.data;
  },

  /**
   * Save a card from a successful payment
   * @param data Payment details with optional auto_refund flag
   */
  async saveCardFromPayment(data: SaveCardFromPaymentRequest): Promise<SavedCard> {
    const response = await apiClient.post<SavedCard>(`${BASE_URL}/from-payment`, data);
    return response.data;
  },

  /**
   * Create a verification order for card tokenization
   * Returns order details to use with Razorpay Checkout
   */
  async createVerificationOrder(): Promise<CardVerificationOrderResponse> {
    const response = await apiClient.post<CardVerificationOrderResponse | { data: CardVerificationOrderResponse }>(`${BASE_URL}/verify-order`);
    const data = response.data;

    // Handle wrapped response
    if ('data' in data && (data as any).data?.order_id) {
      return (data as any).data;
    }
    return data as CardVerificationOrderResponse;
  },

  /**
   * Set a card as the default payment method
   */
  async setDefaultCard(cardId: number): Promise<SavedCard> {
    const response = await apiClient.post<SavedCard>(`${BASE_URL}/${cardId}/set-default`);
    return response.data;
  },

  /**
   * Delete a saved card
   */
  async deleteCard(cardId: number): Promise<void> {
    await apiClient.delete(`${BASE_URL}/${cardId}`);
  },
};

export default savedCardsService;
