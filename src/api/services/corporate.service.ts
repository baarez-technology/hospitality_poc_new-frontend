import { apiClient } from '../client';

export interface CorporateAccount {
  id: number;
  account_code: string;
  company_name: string;
  contact_name: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  billing_address: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  zip_code: string | null;
  tax_id: string | null;
  discount_percentage: number | null;
  credit_limit: number | null;
  payment_terms: string | null;
  contract_start_date: string | null;
  contract_end_date: string | null;
  rate_plan_id: number | null;
  total_bookings: number;
  total_revenue: number;
  ar_balance: number;
  status: string;
  notes: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface CorporateAccountCreate {
  company_name: string;
  account_code?: string;
  contact_name?: string;
  contact_email?: string;
  contact_phone?: string;
  billing_address?: string;
  city?: string;
  state?: string;
  country?: string;
  zip_code?: string;
  tax_id?: string;
  discount_percentage?: number;
  credit_limit?: number;
  payment_terms?: string;
  contract_start_date?: string;
  contract_end_date?: string;
  rate_plan_id?: number;
  notes?: string;
}

export interface CorporateAccountUpdate extends Partial<CorporateAccountCreate> {
  status?: string;
}

const BASE = '/api/v1/corporate';

export const corporateService = {
  listAccounts: async (params?: { status?: string; search?: string }) => {
    const res = await apiClient.get(`${BASE}/accounts`, { params });
    return res.data;
  },

  createAccount: async (data: CorporateAccountCreate) => {
    const res = await apiClient.post(`${BASE}/accounts`, data);
    return res.data;
  },

  getAccount: async (id: number) => {
    const res = await apiClient.get(`${BASE}/accounts/${id}`);
    return res.data;
  },

  updateAccount: async (id: number, data: CorporateAccountUpdate) => {
    const res = await apiClient.put(`${BASE}/accounts/${id}`, data);
    return res.data;
  },

  deleteAccount: async (id: number) => {
    const res = await apiClient.delete(`${BASE}/accounts/${id}`);
    return res.data;
  },

  getBookings: async (id: number) => {
    const res = await apiClient.get(`${BASE}/accounts/${id}/bookings`);
    return res.data;
  },

  linkBooking: async (accountId: number, bookingId: number) => {
    const res = await apiClient.post(`${BASE}/accounts/${accountId}/link-booking/${bookingId}`);
    return res.data;
  },
};
