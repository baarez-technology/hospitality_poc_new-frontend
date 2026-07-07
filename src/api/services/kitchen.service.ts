/**
 * Kitchen Display Service — KDS queue and order status transitions
 */
import { apiClient } from '../client';
import type { Order } from './fnb.service';

const BASE = '/api/v1/fnb/kitchen';

export const kitchenService = {
  getQueue: async (outletId?: number): Promise<Order[]> => {
    const params: any = {};
    if (outletId) params.outlet_id = outletId;
    const res = await apiClient.get(`${BASE}/queue`, { params });
    return res.data?.data || res.data || [];
  },

  advanceOrder: async (orderId: number): Promise<Order> => {
    const res = await apiClient.post(`${BASE}/orders/${orderId}/advance`);
    return res.data?.data || res.data;
  },

  markItemReady: async (orderId: number, itemId: number): Promise<void> => {
    await apiClient.post(`${BASE}/orders/${orderId}/items/${itemId}/ready`);
  },
};
