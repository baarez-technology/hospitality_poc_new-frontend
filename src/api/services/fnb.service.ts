/**
 * F&B Service — Outlets, Menu, Tables, Orders
 */
import { apiClient } from '../client';

const BASE = '/api/v1/fnb';

// ── Types ───────────────────────────────────────────────────────────────────

export interface Outlet {
  id: number;
  name: string;
  type: 'restaurant' | 'bar' | 'pool_cafe' | 'room_service';
  location: string;
  capacity: number;
  operating_hours: string;
  status: 'active' | 'inactive';
}

export interface MenuCategory {
  id: number;
  name: string;
  sort_order: number;
  outlet_id: number;
  item_count?: number;
}

export interface Modifier {
  id: number;
  name: string;
  price: number;
}

export interface ModifierGroup {
  id: number;
  name: string;
  modifiers: Modifier[];
  required: boolean;
  max_select: number;
}

export interface MenuItem {
  id: number;
  name: string;
  description?: string;
  price: number;
  category_id: number;
  category_name?: string;
  is_veg: boolean;
  is_available: boolean;
  prep_time_minutes: number;
  image_url?: string;
  modifier_groups?: ModifierGroup[];
  outlet_id: number;
}

export interface Table {
  id: number;
  number: string;
  capacity: number;
  shape: 'round' | 'square' | 'rectangle';
  x: number;
  y: number;
  status: 'available' | 'occupied' | 'reserved' | 'cleaning';
  outlet_id: number;
  current_order_id?: number;
}

export interface OrderItem {
  id?: number;
  menu_item_id: number;
  name: string;
  quantity: number;
  price: number;
  notes?: string;
  modifiers?: { name: string; price: number }[];
  status?: 'pending' | 'preparing' | 'ready' | 'served' | 'cancelled';
}

export interface Order {
  id: number;
  order_number: string;
  table_id: number;
  table_number: string;
  outlet_id: number;
  outlet_name?: string;
  items: OrderItem[];
  status: 'new' | 'preparing' | 'ready' | 'served' | 'billed' | 'cancelled';
  subtotal: number;
  gst: number;
  total: number;
  server_id?: number;
  server_name?: string;
  created_at: string;
  updated_at?: string;
  notes?: string;
  payment_method?: string;
  payment_status?: 'pending' | 'paid' | 'partial';
}

export interface CreateOrderPayload {
  table_id: number;
  outlet_id: number;
  items: {
    menu_item_id: number;
    quantity: number;
    notes?: string;
    modifiers?: { name: string; price: number }[];
  }[];
  notes?: string;
}

export interface PaymentPayload {
  order_id: number;
  payment_method: 'cash' | 'card' | 'upi' | 'room_charge';
  amount: number;
  room_number?: string;
  split?: { method: string; amount: number }[];
}

// ── Service ─────────────────────────────────────────────────────────────────

export const fnbService = {
  // Outlets
  getOutlets: async (): Promise<Outlet[]> => {
    const res = await apiClient.get(`${BASE}/outlets`);
    return res.data?.data || res.data || [];
  },
  getOutlet: async (id: number): Promise<Outlet> => {
    const res = await apiClient.get(`${BASE}/outlets/${id}`);
    return res.data?.data || res.data;
  },
  createOutlet: async (data: Partial<Outlet>): Promise<Outlet> => {
    const res = await apiClient.post(`${BASE}/outlets`, data);
    return res.data?.data || res.data;
  },
  updateOutlet: async (id: number, data: Partial<Outlet>): Promise<Outlet> => {
    const res = await apiClient.patch(`${BASE}/outlets/${id}`, data);
    return res.data?.data || res.data;
  },

  // Categories
  getCategories: async (outletId: number): Promise<MenuCategory[]> => {
    const res = await apiClient.get(`${BASE}/outlets/${outletId}/categories`);
    return res.data?.data || res.data || [];
  },
  createCategory: async (outletId: number, data: Partial<MenuCategory>): Promise<MenuCategory> => {
    const res = await apiClient.post(`${BASE}/outlets/${outletId}/categories`, data);
    return res.data?.data || res.data;
  },
  updateCategory: async (id: number, data: Partial<MenuCategory>): Promise<MenuCategory> => {
    const res = await apiClient.patch(`${BASE}/categories/${id}`, data);
    return res.data?.data || res.data;
  },
  reorderCategories: async (outletId: number, order: number[]): Promise<void> => {
    await apiClient.post(`${BASE}/outlets/${outletId}/categories/reorder`, { order });
  },

  // Menu Items
  getMenuItems: async (outletId: number, categoryId?: number): Promise<MenuItem[]> => {
    const params: any = {};
    if (categoryId) params.category_id = categoryId;
    const res = await apiClient.get(`${BASE}/outlets/${outletId}/menu-items`, { params });
    return res.data?.data || res.data || [];
  },
  createMenuItem: async (data: Partial<MenuItem>): Promise<MenuItem> => {
    const res = await apiClient.post(`${BASE}/menu-items`, data);
    return res.data?.data || res.data;
  },
  updateMenuItem: async (id: number, data: Partial<MenuItem>): Promise<MenuItem> => {
    const res = await apiClient.patch(`${BASE}/menu-items/${id}`, data);
    return res.data?.data || res.data;
  },
  toggleAvailability: async (id: number): Promise<MenuItem> => {
    const res = await apiClient.post(`${BASE}/menu-items/${id}/toggle-availability`);
    return res.data?.data || res.data;
  },

  // Tables
  getTables: async (outletId: number): Promise<Table[]> => {
    const res = await apiClient.get(`${BASE}/outlets/${outletId}/tables`);
    return res.data?.data || res.data || [];
  },
  createTable: async (data: Partial<Table>): Promise<Table> => {
    const res = await apiClient.post(`${BASE}/tables`, data);
    return res.data?.data || res.data;
  },
  updateTable: async (id: number, data: Partial<Table>): Promise<Table> => {
    const res = await apiClient.patch(`${BASE}/tables/${id}`, data);
    return res.data?.data || res.data;
  },
  updateTablePosition: async (id: number, x: number, y: number): Promise<void> => {
    await apiClient.patch(`${BASE}/tables/${id}/position`, { x, y });
  },

  // Orders
  getOrders: async (outletId?: number, status?: string): Promise<Order[]> => {
    const params: any = {};
    if (outletId) params.outlet_id = outletId;
    if (status) params.status = status;
    const res = await apiClient.get(`${BASE}/orders`, { params });
    return res.data?.data || res.data || [];
  },
  getOrder: async (id: number): Promise<Order> => {
    const res = await apiClient.get(`${BASE}/orders/${id}`);
    return res.data?.data || res.data;
  },
  getActiveOrderForTable: async (tableId: number): Promise<Order | null> => {
    try {
      const res = await apiClient.get(`${BASE}/tables/${tableId}/active-order`);
      return res.data?.data || res.data || null;
    } catch {
      return null;
    }
  },
  createOrder: async (data: CreateOrderPayload): Promise<Order> => {
    const res = await apiClient.post(`${BASE}/orders`, data);
    return res.data?.data || res.data;
  },
  addItemsToOrder: async (orderId: number, items: CreateOrderPayload['items']): Promise<Order> => {
    const res = await apiClient.post(`${BASE}/orders/${orderId}/items`, { items });
    return res.data?.data || res.data;
  },
  updateOrderItemStatus: async (orderId: number, itemId: number, status: string): Promise<void> => {
    await apiClient.patch(`${BASE}/orders/${orderId}/items/${itemId}`, { status });
  },
  updateOrderStatus: async (orderId: number, status: string): Promise<Order> => {
    const res = await apiClient.patch(`${BASE}/orders/${orderId}/status`, { status });
    return res.data?.data || res.data;
  },
  cancelOrder: async (orderId: number, reason?: string): Promise<void> => {
    await apiClient.post(`${BASE}/orders/${orderId}/cancel`, { reason });
  },

  // Billing
  generateBill: async (orderId: number): Promise<Order> => {
    const res = await apiClient.post(`${BASE}/orders/${orderId}/bill`);
    return res.data?.data || res.data;
  },
  processPayment: async (data: PaymentPayload): Promise<{ success: boolean; receipt_id?: string }> => {
    const res = await apiClient.post(`${BASE}/payments`, data);
    return res.data?.data || res.data;
  },

  // Room charge — lookup booking by room number and post to folio
  chargeToRoom: async (orderId: number, roomNumber: string, amount: number): Promise<{ success: boolean; booking_id?: number; folio_id?: number; message?: string }> => {
    try {
      // Step 1: Find checked-in booking for this room
      const bookingsRes = await apiClient.get('/api/v1/bookings', { params: { status: 'checked_in' } });
      const bookings = bookingsRes.data?.items || bookingsRes.data?.data?.items || bookingsRes.data || [];
      const booking = bookings.find((b: any) =>
        b.room_number === roomNumber || b.room?.number === roomNumber || String(b.room_id) === roomNumber
      );

      if (!booking) {
        return { success: false, message: `No checked-in guest found in Room ${roomNumber}` };
      }

      // Step 2: Get or create folio
      const foliosRes = await apiClient.get(`/api/v1/bookings/${booking.id}/folios`);
      const folios = foliosRes.data?.data || foliosRes.data || [];
      let folioId = folios[0]?.id;

      if (!folioId) {
        const newFolio = await apiClient.post(`/api/v1/bookings/${booking.id}/folios/auto-create`);
        folioId = newFolio.data?.data?.id || newFolio.data?.id;
      }

      // Step 3: Post F&B charge to folio
      await apiClient.post(`/api/v1/bookings/${booking.id}/folios/${folioId}/charges`, {
        description: `F&B Order #${orderId} - Room Service`,
        amount,
        charge_type: 'fnb',
        transaction_code: 'FB',
      });

      return { success: true, booking_id: booking.id, folio_id: folioId };
    } catch (err: any) {
      return { success: false, message: err.message || 'Failed to charge to room' };
    }
  },

  // Cancel order
  voidOrder: async (orderId: number, reason?: string): Promise<void> => {
    try {
      await apiClient.post(`${BASE}/orders/${orderId}/cancel`, { reason });
    } catch {
      // Will be handled locally in demo mode
    }
  },

  // Reports
  getReportSummary: async (params: { start_date?: string; end_date?: string; outlet_id?: number }): Promise<any> => {
    const res = await apiClient.get(`${BASE}/reports/summary`, { params });
    return res.data?.data || res.data;
  },
};
