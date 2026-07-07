import { apiClient, extractData } from '../client';

export interface PaymasterAccount {
  id: number;
  account_name: string;
  account_code: string | null;
  status: string;
  total_charges: number;
  total_transferred: number;
  current_balance: number;
  notes: string | null;
  created_at: string;
}

export interface PaymasterPosting {
  id: number;
  paymaster_account_id: number;
  posting_type: string;
  amount: number;
  balance_after: number;
  description: string;
  source_booking_id: number | null;
  source_folio_id: number | null;
  target_booking_id: number | null;
  target_folio_id: number | null;
  posted_by: number | null;
  posted_at: string;
  notes: string | null;
}

export const paymasterService = {
  listAccounts: async (params?: { status?: string; limit?: number }) => {
    const res = await apiClient.get('/api/v1/paymaster/accounts', { params });
    return extractData(res)?.items || [];
  },

  createAccount: async (data: {
    account_name?: string;
    account_code?: string;
    notes?: string;
  }): Promise<PaymasterAccount> => {
    const res = await apiClient.post('/api/v1/paymaster/accounts', data);
    return extractData(res);
  },

  getAccount: async (id: number): Promise<PaymasterAccount> => {
    const res = await apiClient.get(`/api/v1/paymaster/accounts/${id}`);
    return extractData(res);
  },

  updateAccount: async (id: number, data: {
    account_name?: string;
    status?: string;
    notes?: string;
  }): Promise<PaymasterAccount> => {
    const res = await apiClient.put(`/api/v1/paymaster/accounts/${id}`, data);
    return extractData(res);
  },

  getPostings: async (id: number, params?: {
    posting_type?: string;
    limit?: number;
    offset?: number;
  }) => {
    const res = await apiClient.get(`/api/v1/paymaster/accounts/${id}/postings`, { params });
    return extractData(res);
  },

  transferToBooking: async (accountId: number, data: {
    posting_ids: number[];
    target_booking_id: number;
    target_folio_id?: number;
    notes?: string;
  }) => {
    const res = await apiClient.post(`/api/v1/paymaster/accounts/${accountId}/transfer-to-booking`, data);
    return extractData(res);
  },

  writeOff: async (accountId: number, amount: number, reason: string) => {
    const res = await apiClient.post(`/api/v1/paymaster/accounts/${accountId}/write-off`, null, {
      params: { amount, reason },
    });
    return extractData(res);
  },
};
