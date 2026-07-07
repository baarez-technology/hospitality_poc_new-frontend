import { apiClient, extractData } from '../client';

export interface TransactionCode {
  id: number;
  code: string;
  name: string;
  category: string;
  code_type: 'charge' | 'payment' | 'adjustment' | 'tax';
  adjustment_code: string | null;
  department: string | null;
  is_active: boolean;
  sort_order: number;
}

export const transactionCodesService = {
  list: async (params?: { code_type?: string; category?: string; active_only?: boolean }) => {
    const res = await apiClient.get('/api/v1/transaction-codes', { params });
    return extractData(res)?.items || [];
  },

  create: async (data: Partial<TransactionCode>) => {
    const res = await apiClient.post('/api/v1/transaction-codes', data);
    return extractData(res);
  },

  update: async (id: number, data: Partial<TransactionCode>) => {
    const res = await apiClient.put(`/api/v1/transaction-codes/${id}`, data);
    return extractData(res);
  },

  delete: async (id: number) => {
    const res = await apiClient.delete(`/api/v1/transaction-codes/${id}`);
    return extractData(res);
  },

  seed: async () => {
    const res = await apiClient.post('/api/v1/transaction-codes/seed');
    return extractData(res);
  },

  lookupByCategory: async (category: string) => {
    const res = await apiClient.get(`/api/v1/transaction-codes/lookup/${category}`);
    return extractData(res);
  },
};
