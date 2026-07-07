import { apiClient } from '../client';

export interface ARAccount {
  id: number;
  corporate_account_id: number;
  account_name: string;
  account_number: string;
  credit_limit: number;
  current_balance: number;
  available_credit: number;
  payment_terms_days: number;
  status: string;
  contact_name: string | null;
  contact_email: string | null;
  notes: string | null;
  created_at: string | null;
  updated_at: string | null;
  summary?: {
    total_charges: number;
    total_payments: number;
    total_credits: number;
    posting_count: number;
    pending_count: number;
  };
}

export interface ARPosting {
  id: number;
  ar_account_id: number;
  booking_id: number | null;
  folio_id: number | null;
  posting_type: string;
  amount: number;
  balance_after: number;
  description: string;
  reference_number: string | null;
  posted_by: number | null;
  posted_at: string | null;
  due_date: string | null;
  paid_at: string | null;
  status: string;
}

export interface AgingBucket {
  account_id: number;
  account_name: string;
  account_number: string;
  total_outstanding: number;
  credit_limit: number;
  current: number;
  days_30: number;
  days_60: number;
  days_90: number;
  days_90_plus: number;
}

const BASE = '/api/v1/ar';

export const arService = {
  listAccounts: async (params?: { status?: string; corporate_account_id?: number }) => {
    const res = await apiClient.get(`${BASE}/accounts`, { params });
    return res.data;
  },

  getAccount: async (id: number) => {
    const res = await apiClient.get(`${BASE}/accounts/${id}`);
    return res.data;
  },

  updateAccount: async (id: number, data: Partial<ARAccount>) => {
    const res = await apiClient.put(`${BASE}/accounts/${id}`, data);
    return res.data;
  },

  getLedger: async (id: number, params?: { start_date?: string; end_date?: string; posting_type?: string; limit?: number; offset?: number }) => {
    const res = await apiClient.get(`${BASE}/accounts/${id}/ledger`, { params });
    return res.data;
  },

  postPayment: async (id: number, data: { amount: number; payment_method?: string; reference_number?: string; notes?: string }) => {
    const res = await apiClient.post(`${BASE}/accounts/${id}/post-payment`, data);
    return res.data;
  },

  creditNote: async (id: number, data: { amount: number; description: string; reference_number?: string }) => {
    const res = await apiClient.post(`${BASE}/accounts/${id}/credit-note`, data);
    return res.data;
  },

  getStatement: async (id: number, params?: { start_date?: string; end_date?: string }) => {
    const res = await apiClient.get(`${BASE}/accounts/${id}/statement`, { params });
    return res.data;
  },

  getAgingReport: async () => {
    const res = await apiClient.get(`${BASE}/aging-report`);
    return res.data;
  },
};
