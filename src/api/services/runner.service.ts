import { apiClient } from '../client';

// ============== TYPES ==============

export interface PickupRequest {
  id: number;
  request_number: string;
  room_id: number;
  room_number: string;
  guest_id?: number;
  guest_name: string;
  pickup_type: string;
  items_description: string;
  item_count: number;
  pickup_location: string;
  destination: string;
  scheduled_time?: string;
  priority: string;
  status: string;
  requested_by?: string;
  requested_at: string;
  assigned_to?: number;
  assigned_to_name?: string;
  accepted_at?: string;
  completed_at?: string;
  duration_minutes?: number;
  notes?: string;
  special_instructions?: string;
  signature_required: boolean;
}

export interface PickupRequestCreate {
  room_number: string;
  guest_name: string;
  pickup_type: string;
  items_description: string;
  item_count?: number;
  pickup_location: string;
  destination: string;
  priority?: string;
  scheduled_time?: string;
  special_instructions?: string;
  signature_required?: boolean;
}

export interface PickupRequestUpdate {
  status?: string;
  assigned_to?: number;
  notes?: string;
  special_instructions?: string;
  priority?: string;
}

export interface Delivery {
  id: number;
  delivery_number: string;
  delivery_type: string;
  room_id: number;
  room_number: string;
  guest_id?: number;
  guest_name: string;
  items_description: string;
  item_count: number;
  origin_location: string;
  destination_location: string;
  priority: string;
  status: string;
  ordered_at: string;
  assigned_to?: number;
  assigned_to_name?: string;
  accepted_at?: string;
  picked_up_at?: string;
  delivered_at?: string;
  estimated_delivery_time?: string;
  duration_minutes?: number;
  special_instructions?: string;
  notes?: string;
  signature_required: boolean;
  temperature_sensitive: boolean;
  fragile: boolean;
}

export interface DeliveryCreate {
  delivery_type: string;
  room_number: string;
  guest_name: string;
  items_description: string;
  item_count?: number;
  origin_location: string;
  destination_location: string;
  priority?: string;
  estimated_delivery_time?: string;
  special_instructions?: string;
  signature_required?: boolean;
  temperature_sensitive?: boolean;
  fragile?: boolean;
}

export interface DeliveryUpdate {
  status?: string;
  assigned_to?: number;
  notes?: string;
  special_instructions?: string;
  priority?: string;
}

export interface RunnerDashboard {
  active_pickups: number;
  active_deliveries: number;
  completed_today: number;
  pending_count: number;
  avg_completion_time?: number;
  on_time_percentage?: number;
}

export interface RunnerPerformance {
  staff_id: number;
  staff_name: string;
  date: string;
  total_pickups: number;
  total_deliveries: number;
  completed_pickups: number;
  completed_deliveries: number;
  avg_pickup_time?: number;
  avg_delivery_time?: number;
  on_time_percentage?: number;
  performance_rating?: number;
}

// ============== HELPER ==============

// Helper to extract data from wrapped API responses
// API may return { success: true, data: [...] } or just [...]
const extractData = <T>(responseData: any): T => {
  if (responseData && typeof responseData === 'object' && 'data' in responseData) {
    return responseData.data;
  }
  return responseData;
};

// ============== SERVICE ==============

export const runnerService = {
  // ===== PICKUPS =====

  getPickups: async (filters?: {
    status?: string;
    priority?: string;
    pickup_type?: string;
    assigned_to?: number;
    room_number?: string;
    date_from?: string;
    date_to?: string;
  }): Promise<PickupRequest[]> => {
    const response = await apiClient.get('/api/v1/runner/pickups', { params: filters });
    return extractData<PickupRequest[]>(response.data);
  },

  getMyPickups: async (status?: string): Promise<PickupRequest[]> => {
    const params = status ? { status } : undefined;
    const response = await apiClient.get('/api/v1/runner/pickups/my-tasks', { params });
    return extractData<PickupRequest[]>(response.data);
  },

  getPickup: async (pickupId: number): Promise<PickupRequest> => {
    const response = await apiClient.get(`/api/v1/runner/pickups/${pickupId}`);
    return extractData<PickupRequest>(response.data);
  },

  createPickup: async (data: PickupRequestCreate): Promise<PickupRequest> => {
    const response = await apiClient.post('/api/v1/runner/pickups', data);
    return extractData<PickupRequest>(response.data);
  },

  updatePickup: async (pickupId: number, data: PickupRequestUpdate): Promise<PickupRequest> => {
    const response = await apiClient.patch(`/api/v1/runner/pickups/${pickupId}`, data);
    return extractData<PickupRequest>(response.data);
  },

  acceptPickup: async (pickupId: number): Promise<PickupRequest> => {
    const response = await apiClient.post(`/api/v1/runner/pickups/${pickupId}/accept`);
    return extractData<PickupRequest>(response.data);
  },

  completePickup: async (pickupId: number, notes?: string): Promise<PickupRequest> => {
    const response = await apiClient.post(`/api/v1/runner/pickups/${pickupId}/complete`, null, {
      params: notes ? { notes } : undefined
    });
    return extractData<PickupRequest>(response.data);
  },

  // ===== DELIVERIES =====

  getDeliveries: async (filters?: {
    status?: string;
    priority?: string;
    delivery_type?: string;
    assigned_to?: number;
    room_number?: string;
    date_from?: string;
    date_to?: string;
  }): Promise<Delivery[]> => {
    const response = await apiClient.get('/api/v1/runner/deliveries', { params: filters });
    return extractData<Delivery[]>(response.data);
  },

  getMyDeliveries: async (status?: string): Promise<Delivery[]> => {
    const params = status ? { status } : undefined;
    const response = await apiClient.get('/api/v1/runner/deliveries/my-tasks', { params });
    return extractData<Delivery[]>(response.data);
  },

  getDelivery: async (deliveryId: number): Promise<Delivery> => {
    const response = await apiClient.get(`/api/v1/runner/deliveries/${deliveryId}`);
    return extractData<Delivery>(response.data);
  },

  createDelivery: async (data: DeliveryCreate): Promise<Delivery> => {
    const response = await apiClient.post('/api/v1/runner/deliveries', data);
    return extractData<Delivery>(response.data);
  },

  updateDelivery: async (deliveryId: number, data: DeliveryUpdate): Promise<Delivery> => {
    const response = await apiClient.patch(`/api/v1/runner/deliveries/${deliveryId}`, data);
    return extractData<Delivery>(response.data);
  },

  acceptDelivery: async (deliveryId: number): Promise<Delivery> => {
    const response = await apiClient.post(`/api/v1/runner/deliveries/${deliveryId}/accept`);
    return extractData<Delivery>(response.data);
  },

  completeDelivery: async (deliveryId: number, notes?: string): Promise<Delivery> => {
    const response = await apiClient.post(`/api/v1/runner/deliveries/${deliveryId}/complete`, null, {
      params: notes ? { notes } : undefined
    });
    return extractData<Delivery>(response.data);
  },

  // ===== DASHBOARD =====

  getDashboard: async (): Promise<RunnerDashboard> => {
    const response = await apiClient.get('/api/v1/runner/dashboard');
    return extractData<RunnerDashboard>(response.data);
  },

  getMyDashboard: async (): Promise<RunnerDashboard> => {
    const response = await apiClient.get('/api/v1/runner/my-dashboard');
    return extractData<RunnerDashboard>(response.data);
  },

  // ===== PERFORMANCE =====

  getPerformance: async (staffId: number, date?: string): Promise<RunnerPerformance> => {
    const params = date ? { target_date: date } : undefined;
    const response = await apiClient.get(`/api/v1/runner/performance/${staffId}`, { params });
    return extractData<RunnerPerformance>(response.data);
  },
};
