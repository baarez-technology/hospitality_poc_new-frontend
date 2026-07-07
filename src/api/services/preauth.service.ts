/**
 * Pre-Authorization Holds service
 * Maps to /api/v1/preauth/holds endpoints
 */
import { apiClient } from '../client';

export interface AuthorizationHold {
  id: number;
  booking_id: number;
  folio_id: number | null;
  hold_amount: number;
  card_last4: string | null;
  card_brand: string | null;
  authorization_code: string | null;
  status: 'authorized' | 'captured' | 'released' | 'expired';
  authorized_at: string;
  authorized_by: number | null;
  released_at: string | null;
  released_by: number | null;
  release_reason: string | null;
  expires_at: string | null;
  notes: string | null;
  created_at: string;
}

export const preauthService = {
  list: async (params?: { booking_id?: number; hold_status?: string }) => {
    const res = await apiClient.get('/api/v1/preauth/holds', { params });
    return res.data.holds || res.data.data || [];
  },

  get: async (holdId: number) => {
    const res = await apiClient.get(`/api/v1/preauth/holds/${holdId}`);
    return res.data.hold || res.data.data || res.data;
  },

  create: async (data: {
    booking_id: number;
    hold_amount?: number;
    card_last4?: string;
    card_brand?: string;
    notes?: string;
  }) => {
    const res = await apiClient.post('/api/v1/preauth/holds', data);
    return res.data.hold || res.data.data || res.data;
  },

  release: async (holdId: number, release_reason: string = 'manual') => {
    const res = await apiClient.post(`/api/v1/preauth/holds/${holdId}/release`, { release_reason });
    return res.data.hold || res.data.data || res.data;
  },

  capture: async (holdId: number, data?: { capture_amount?: number; notes?: string }) => {
    const res = await apiClient.post(`/api/v1/preauth/holds/${holdId}/capture`, data || {});
    return res.data;
  },
};
