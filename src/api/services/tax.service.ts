import { apiClient } from '../client';

export interface TaxCategory {
  id: number;
  name: string;
  display_name: string;
  description: string | null;
  is_active: boolean;
}

export interface TaxSlab {
  id: number;
  tax_category_id: number;
  country: string;
  min_amount: number;
  max_amount: number | null;
  rate_pct: number;
  component_1_name: string | null;
  component_1_pct: number | null;
  component_2_name: string | null;
  component_2_pct: number | null;
  effective_from: string;
  effective_to: string | null;
  is_active: boolean;
}

export interface TaxCalculationResult {
  base_amount: number;
  tax_rate_pct: number;
  tax_amount: number;
  total_with_tax: number;
  components: Array<{
    name: string;
    rate_pct: number;
    amount: number;
  }>;
}

export interface CreateCategoryData {
  name: string;
  display_name: string;
  description?: string;
}

export interface CreateSlabData {
  tax_category_id: number;
  country: string;
  min_amount: number;
  max_amount?: number | null;
  rate_pct: number;
  component_1_name?: string;
  component_1_pct?: number;
  component_2_name?: string;
  component_2_pct?: number;
  effective_from: string;
  effective_to?: string | null;
}

export interface CalculateTaxData {
  category_name: string;
  base_amount: number;
  country?: string;
}

const extract = (res: any) => res.data?.data ?? res.data;

export const taxService = {
  // ── Categories ──────────────────────────────────────────────
  listCategories: async (): Promise<TaxCategory[]> => {
    const res = await apiClient.get('/api/v1/tax/categories');
    return extract(res);
  },

  createCategory: async (data: CreateCategoryData): Promise<TaxCategory> => {
    const res = await apiClient.post('/api/v1/tax/categories', data);
    return extract(res);
  },

  deleteCategory: async (id: number): Promise<void> => {
    await apiClient.delete(`/api/v1/tax/categories/${id}`);
  },

  // ── Slabs ───────────────────────────────────────────────────
  listSlabs: async (params?: { country?: string; category_id?: number }): Promise<TaxSlab[]> => {
    const res = await apiClient.get('/api/v1/tax/slabs', { params });
    return extract(res);
  },

  createSlab: async (data: CreateSlabData): Promise<TaxSlab> => {
    const res = await apiClient.post('/api/v1/tax/slabs', data);
    return extract(res);
  },

  updateSlab: async (id: number, data: CreateSlabData): Promise<TaxSlab> => {
    const res = await apiClient.put(`/api/v1/tax/slabs/${id}`, data);
    return extract(res);
  },

  deleteSlab: async (id: number): Promise<void> => {
    await apiClient.delete(`/api/v1/tax/slabs/${id}`);
  },

  // ── Calculator ──────────────────────────────────────────────
  calculateTax: async (data: CalculateTaxData): Promise<TaxCalculationResult> => {
    const res = await apiClient.post('/api/v1/tax/calculate', data);
    return extract(res);
  },

  // ── Seed ────────────────────────────────────────────────────
  seedIndiaGST: async (): Promise<any> => {
    const res = await apiClient.post('/api/v1/tax/seed-india-gst');
    return extract(res);
  },
};
