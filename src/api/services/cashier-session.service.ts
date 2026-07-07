import { apiClient, extractData } from '../client';

export interface CashierSession {
  id: number;
  staff_id: number;
  workstation_id: string | null;
  session_date: string;
  status: string;
  opening_balance: number;
  closing_balance: number | null;
  expected_balance: number | null;
  cash_received: number;
  cash_paid_out: number;
  variance: number | null;
  transaction_count: number;
  opened_at: string;
  closed_at: string | null;
  notes: string | null;
}

export const cashierSessionService = {
  list: async (params?: {
    status?: string;
    staff_id?: number;
    session_date?: string;
    limit?: number;
  }) => {
    const res = await apiClient.get('/api/v1/cashier-sessions', { params });
    return extractData(res)?.items || [];
  },

  getMySession: async (): Promise<CashierSession | null> => {
    const res = await apiClient.get('/api/v1/cashier-sessions/my-session');
    return extractData(res)?.session || null;
  },

  get: async (id: number): Promise<CashierSession> => {
    const res = await apiClient.get(`/api/v1/cashier-sessions/${id}`);
    return extractData(res);
  },

  open: async (data: {
    opening_balance?: number;
    workstation_id?: string;
    notes?: string;
  }): Promise<CashierSession> => {
    const res = await apiClient.post('/api/v1/cashier-sessions', data);
    return extractData(res);
  },

  close: async (id: number, data: {
    closing_balance: number;
    notes?: string;
  }): Promise<CashierSession> => {
    const res = await apiClient.post(`/api/v1/cashier-sessions/${id}/close`, data);
    return extractData(res);
  },

  recordCash: async (id: number, amount: number) => {
    const res = await apiClient.post(`/api/v1/cashier-sessions/${id}/record-cash`, null, {
      params: { amount },
    });
    return extractData(res);
  },

  checkOpenSessions: async () => {
    const res = await apiClient.get('/api/v1/cashier-sessions/open-sessions/check');
    return extractData(res);
  },
};
