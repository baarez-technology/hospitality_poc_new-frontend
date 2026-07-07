import { apiClient, extractData } from '../client';

export interface CatalogItem {
  id: number;
  name: string;
  sku: string | null;
  category: string;
  unit_price: number;
  unit: string | null;
  tax_category_id: number | null;
  is_active: boolean;
  sort_order: number;
}

export const catalogItemsService = {
  list: async (params?: { category?: string; search?: string; active_only?: boolean }): Promise<CatalogItem[]> => {
    const res = await apiClient.get('/api/v1/catalog-items', { params });
    return extractData(res)?.items || [];
  },

  create: async (data: Partial<CatalogItem>): Promise<CatalogItem> => {
    const res = await apiClient.post('/api/v1/catalog-items', data);
    return extractData(res);
  },

  update: async (id: number, data: Partial<CatalogItem>): Promise<CatalogItem> => {
    const res = await apiClient.put(`/api/v1/catalog-items/${id}`, data);
    return extractData(res);
  },

  delete: async (id: number) => {
    const res = await apiClient.delete(`/api/v1/catalog-items/${id}`);
    return extractData(res);
  },

  seed: async () => {
    const res = await apiClient.post('/api/v1/catalog-items/seed');
    return extractData(res);
  },
};
