import { apiClient } from '../client';
import type { ApiResponse } from '../types/common.types';

export interface CheckInRequest {
  room_id?: number;
  id_verified: boolean;
  id_type?: string;
  id_number?: string;
  notes?: string;
}

export interface CheckOutRequest {
  final_balance?: number;
  notes?: string;
}

export interface PaymentCreate {
  amount: number;
  method: string;
  payment_type: string;
  transaction_id?: string;
  card_last4?: string;
  card_brand?: string;
  notes?: string;
}

export interface FolioLineItemCreate {
  item_type: string;
  description: string;
  quantity: number;
  unit_price: number;
  amount: number;
  notes?: string;
}

export interface Arrival {
  confirmation_code: string;
  guest_name: string;
  arrival_date: string;
  room_id?: number;
}

export interface Departure {
  confirmation_code: string;
  guest_name: string;
  departure_date: string;
  room_id?: number;
}

export const frontdeskService = {
  checkIn: async (reservationId: number, data: CheckInRequest) => {
    const response = await apiClient.post(
      `/api/v1/frontdesk/checkin/${reservationId}`,
      data
    );
    return response.data.data || response.data;
  },

  checkOut: async (reservationId: number, data: CheckOutRequest) => {
    const response = await apiClient.post(
      `/api/v1/frontdesk/checkout/${reservationId}`,
      data
    );
    return response.data.data || response.data;
  },

  getFolio: async (reservationId: number) => {
    const response = await apiClient.get(
      `/api/v1/frontdesk/folio/${reservationId}`
    );
    return response.data.data || response.data;
  },

  addFolioLineItem: async (reservationId: number, data: FolioLineItemCreate) => {
    const response = await apiClient.post(
      `/api/v1/frontdesk/folio/${reservationId}/line-items`,
      data
    );
    return response.data.data || response.data;
  },

  addPayment: async (reservationId: number, data: PaymentCreate) => {
    const response = await apiClient.post(
      `/api/v1/frontdesk/folio/${reservationId}/payments`,
      data
    );
    return response.data.data || response.data;
  },

  createKeyCard: async (reservationId: number) => {
    const response = await apiClient.post(
      `/api/v1/frontdesk/keycard/${reservationId}`
    );
    return response.data.data || response.data;
  },

  getArrivals: async (date?: string) => {
    const params = date ? { date } : {};
    const response = await apiClient.get<ApiResponse<Arrival[]>>(
      '/api/v1/frontdesk/arrivals',
      { params }
    );
    return response.data.data || response.data;
  },

  getDepartures: async (date?: string) => {
    const params = date ? { date } : {};
    const response = await apiClient.get<ApiResponse<Departure[]>>(
      '/api/v1/frontdesk/departures',
      { params }
    );
    return response.data.data || response.data;
  },

  runNightAudit: async () => {
    const response = await apiClient.post('/api/v1/frontdesk/night-audit');
    return response.data.data || response.data;
  },

  getBusinessDate: async () => {
    const response = await apiClient.get('/api/v1/config/business-date');
    return response.data.data || response.data;
  },

  getHotelConfig: async () => {
    const response = await apiClient.get('/api/v1/config');
    return response.data.data || response.data;
  },

  getGuestBill: async (bookingId: number) => {
    const response = await apiClient.get(`/api/v1/frontdesk/guest-bill/${bookingId}`);
    // Frontdesk endpoints now return data directly without wrapping
    // But handle legacy cases where data might still be wrapped
    let data = response.data;

    // Check if we got the actual bill data (has booking_id or summary)
    if (data && typeof data === 'object') {
      // If wrapped in { success, data }, unwrap it
      if ('success' in data && 'data' in data && !('booking_id' in data)) {
        data = data.data;
      }
      // If wrapped in just { data }, unwrap it
      if ('data' in data && !('booking_id' in data) && !('summary' in data)) {
        data = data.data;
      }
    }

    console.log('[frontdeskService.getGuestBill] Final data:', data);
    return data;
  },

  getNightAuditReport: async (date: string) => {
    const response = await apiClient.get(`/api/v1/frontdesk/night-audit/${date}/report`);
    return response.data.data || response.data;
  },
};

