import { apiClient } from '../client';

// ============== TYPES ==============

export interface WorkOrder {
  id: number;
  work_order_number?: string;
  title: string;
  description: string;
  location: string;
  room_id?: number;
  room_number?: string;
  issue_type: string;
  priority: string;
  status: string;
  reported_by?: number;
  reported_by_name?: string;
  reported_at: string;
  assigned_to?: number;
  assigned_to_name?: string;
  accepted_at?: string;
  started_at?: string;
  completed_at?: string;
  scheduled_date?: string;
  estimated_hours?: number;
  actual_hours?: number;
  estimated_cost?: number;
  actual_cost?: number;
  resolution_notes?: string;
  notes?: string;
  parts_used?: Array<{ name: string; quantity: number; cost?: number }>;
  is_out_of_order?: boolean;
  ooo_category?: string;
  estimated_completion?: string;
  updated_at?: string;
}

export interface WorkOrderCreate {
  title: string;
  description: string;
  location: string;
  room_id?: number;
  room_number?: string;
  issue_type: string;
  priority?: string;
  scheduled_date?: string;
  estimated_hours?: number;
  notes?: string;
  assigned_to?: number;
}

export interface WorkOrderUpdate {
  title?: string;
  description?: string;
  status?: string;
  priority?: string;
  assigned_to?: number;
  scheduled_date?: string;
  estimated_hours?: number;
  actual_hours?: number;
  resolution_notes?: string;
  notes?: string;
}

export interface EquipmentIssue {
  id: number;
  issue_number: string;
  equipment_name: string;
  equipment_id?: string;
  equipment_category?: string;
  location: string;
  room_id?: number;
  issue_type: string;
  issue_description: string;
  severity: string;
  status: string;
  reported_by: number;
  reported_by_name?: string;
  reported_at: string;
  assigned_to?: number;
  assigned_to_name?: string;
  accepted_at?: string;
  resolved_at?: string;
  resolution_notes?: string;
  manufacturer?: string;
  model_number?: string;
  warranty_status?: string;
  warranty_expiry_date?: string;
  estimated_repair_cost?: number;
  actual_repair_cost?: number;
  affects_operations: boolean;
}

export interface EquipmentIssueCreate {
  equipment_name: string;
  equipment_id?: string;
  equipment_category?: string;
  location: string;
  room_id?: number;
  issue_type: string;
  issue_description: string;
  severity: string;
  affects_operations?: boolean;
  manufacturer?: string;
  model_number?: string;
  serial_number?: string;
}

export interface EquipmentIssueUpdate {
  status?: string;
  assigned_to?: number;
  severity?: string;
  resolution_notes?: string;
  estimated_repair_cost?: number;
  actual_repair_cost?: number;
  downtime_hours?: number;
}

export interface MaintenanceDashboard {
  open_work_orders: number;
  critical_issues: number;
  completed_today: number;
  pending_parts: number;
  avg_completion_time?: number;
  overdue_count: number;
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

export const maintenanceService = {
  // ===== WORK ORDERS =====

  getWorkOrders: async (filters?: {
    status?: string;
    priority?: string;
    issue_type?: string;
    assigned_to?: number;
    room_number?: string;
    date_from?: string;
    date_to?: string;
  }): Promise<WorkOrder[]> => {
    const response = await apiClient.get('/api/v1/maintenance/work-orders', { params: filters });
    return extractData<WorkOrder[]>(response.data);
  },

  getOosOooRooms: async (): Promise<any[]> => {
    const response = await apiClient.get('/api/v1/maintenance/rooms/oos-ooo');
    const data = response.data?.data || response.data;
    return Array.isArray(data) ? data : [];
  },

  getMyWorkOrders: async (status?: string): Promise<WorkOrder[]> => {
    const params = status ? { status } : undefined;
    const response = await apiClient.get('/api/v1/maintenance/work-orders/my-tasks', { params });
    return extractData<WorkOrder[]>(response.data);
  },

  getWorkOrder: async (workOrderId: number): Promise<WorkOrder> => {
    const response = await apiClient.get(`/api/v1/maintenance/work-orders/${workOrderId}`);
    return extractData<WorkOrder>(response.data);
  },

  createWorkOrder: async (data: WorkOrderCreate): Promise<WorkOrder> => {
    const response = await apiClient.post('/api/v1/maintenance/work-orders', data);
    return extractData<WorkOrder>(response.data);
  },

  updateWorkOrder: async (workOrderId: number, data: WorkOrderUpdate): Promise<WorkOrder> => {
    const response = await apiClient.patch(`/api/v1/maintenance/work-orders/${workOrderId}`, data);
    return extractData<WorkOrder>(response.data);
  },

  acceptWorkOrder: async (workOrderId: number): Promise<WorkOrder> => {
    const response = await apiClient.post(`/api/v1/maintenance/work-orders/${workOrderId}/accept`);
    return extractData<WorkOrder>(response.data);
  },

  completeWorkOrder: async (
    workOrderId: number,
    resolutionNotes?: string,
    actualHours?: number
  ): Promise<WorkOrder> => {
    const response = await apiClient.post(
      `/api/v1/maintenance/work-orders/${workOrderId}/complete`,
      null,
      { params: { resolution_notes: resolutionNotes, actual_hours: actualHours } }
    );
    return extractData<WorkOrder>(response.data);
  },

  // ===== EQUIPMENT ISSUES =====

  getEquipmentIssues: async (filters?: {
    status?: string;
    severity?: string;
    category?: string;
    assigned_to?: number;
  }): Promise<EquipmentIssue[]> => {
    const response = await apiClient.get('/api/v1/maintenance/equipment-issues', { params: filters });
    return extractData<EquipmentIssue[]>(response.data);
  },

  getEquipmentIssue: async (issueId: number): Promise<EquipmentIssue> => {
    const response = await apiClient.get(`/api/v1/maintenance/equipment-issues/${issueId}`);
    return extractData<EquipmentIssue>(response.data);
  },

  createEquipmentIssue: async (data: EquipmentIssueCreate): Promise<EquipmentIssue> => {
    const response = await apiClient.post('/api/v1/maintenance/equipment-issues', data);
    return extractData<EquipmentIssue>(response.data);
  },

  updateEquipmentIssue: async (issueId: number, data: EquipmentIssueUpdate): Promise<EquipmentIssue> => {
    const response = await apiClient.patch(`/api/v1/maintenance/equipment-issues/${issueId}`, data);
    return extractData<EquipmentIssue>(response.data);
  },

  acceptEquipmentIssue: async (issueId: number): Promise<EquipmentIssue> => {
    const response = await apiClient.post(`/api/v1/maintenance/equipment-issues/${issueId}/accept`);
    return extractData<EquipmentIssue>(response.data);
  },

  resolveEquipmentIssue: async (
    issueId: number,
    resolutionNotes?: string,
    actualRepairCost?: number
  ): Promise<EquipmentIssue> => {
    const response = await apiClient.post(
      `/api/v1/maintenance/equipment-issues/${issueId}/resolve`,
      null,
      { params: { resolution_notes: resolutionNotes, actual_repair_cost: actualRepairCost } }
    );
    return extractData<EquipmentIssue>(response.data);
  },

  // ===== PREVENTIVE MAINTENANCE =====

  getPreventiveSchedules: async (filters?: {
    active_only?: boolean;
    maintenance_type?: string;
  }): Promise<any[]> => {
    const response = await apiClient.get('/api/v1/maintenance/preventive-schedules', { params: filters });
    return extractData<any[]>(response.data);
  },

  createPreventiveSchedule: async (data: {
    name: string;
    description?: string;
    location?: string;
    maintenance_type?: string;
    frequency?: string;
    estimated_duration?: number;
    assigned_to?: number;
    priority?: string;
    next_due_date?: string;
  }): Promise<any> => {
    const response = await apiClient.post('/api/v1/maintenance/preventive-schedules', data);
    return extractData<any>(response.data);
  },

  updatePreventiveSchedule: async (pmId: number, data: {
    name?: string;
    description?: string;
    location?: string;
    maintenance_type?: string;
    frequency?: string;
    estimated_duration?: number;
    assigned_to?: number;
    priority?: string;
    active?: boolean;
    next_due_date?: string;
    last_performed?: string;
  }): Promise<any> => {
    const response = await apiClient.patch(`/api/v1/maintenance/preventive-schedules/${pmId}`, data);
    return extractData<any>(response.data);
  },

  completePreventiveSchedule: async (pmId: number): Promise<any> => {
    const response = await apiClient.post(`/api/v1/maintenance/preventive-schedules/${pmId}/complete`);
    return extractData<any>(response.data);
  },

  deletePreventiveSchedule: async (pmId: number): Promise<any> => {
    const response = await apiClient.delete(`/api/v1/maintenance/preventive-schedules/${pmId}`);
    return extractData<any>(response.data);
  },

  // ===== DASHBOARD =====

  getDashboard: async (): Promise<MaintenanceDashboard> => {
    const response = await apiClient.get('/api/v1/maintenance/dashboard');
    return extractData<MaintenanceDashboard>(response.data);
  },

  getMyDashboard: async (): Promise<MaintenanceDashboard> => {
    const response = await apiClient.get('/api/v1/maintenance/my-dashboard');
    return extractData<MaintenanceDashboard>(response.data);
  },

  // ===== MAINTENANCE INVENTORY =====

  getInventory: async (category?: string): Promise<any[]> => {
    const params = category ? { category } : undefined;
    const response = await apiClient.get('/api/v1/maintenance/inventory', { params });
    return extractData<any[]>(response.data);
  },

  createInventoryItem: async (data: {
    name: string;
    category?: string;
    stock_level?: number;
    min_stock?: number;
    unit_cost?: number;
    location?: string;
  }): Promise<any> => {
    const response = await apiClient.post('/api/v1/maintenance/inventory', data);
    return extractData<any>(response.data);
  },

  updateInventoryItem: async (itemId: number, data: {
    name?: string;
    category?: string;
    stock_level?: number;
    min_stock?: number;
    unit_cost?: number;
    location?: string;
  }): Promise<any> => {
    const response = await apiClient.patch(`/api/v1/maintenance/inventory/${itemId}`, data);
    return extractData<any>(response.data);
  },

  adjustInventoryStock: async (itemId: number, quantity: number, isAddition: boolean): Promise<any> => {
    const response = await apiClient.post(
      `/api/v1/maintenance/inventory/${itemId}/adjust-stock`,
      null,
      { params: { quantity, is_addition: isAddition } }
    );
    return extractData<any>(response.data);
  },

  deleteInventoryItem: async (itemId: number): Promise<any> => {
    const response = await apiClient.delete(`/api/v1/maintenance/inventory/${itemId}`);
    return extractData<any>(response.data);
  },

  // ===== OUT OF ORDER (OOO) MANAGEMENT =====

  markWorkOrderOOO: async (
    workOrderId: number,
    data: {
      is_out_of_order: boolean;
      estimated_completion?: string;
      ooo_category?: string;
      notes?: string;
    }
  ): Promise<OOOBlockResponse> => {
    const response = await apiClient.post(
      `/api/v1/maintenance/work-orders/${workOrderId}/mark-ooo`,
      data
    );
    return extractData<OOOBlockResponse>(response.data);
  },

  extendWorkOrderOOO: async (
    workOrderId: number,
    newEstimatedCompletion: string,
    notes?: string
  ): Promise<OOOBlockResponse> => {
    const response = await apiClient.post(
      `/api/v1/maintenance/work-orders/${workOrderId}/extend-ooo`,
      { new_estimated_completion: newEstimatedCompletion, notes }
    );
    return extractData<OOOBlockResponse>(response.data);
  },

  completeAndReleaseOOO: async (
    workOrderId: number,
    resolutionNotes?: string
  ): Promise<OOOBlockResponse> => {
    const response = await apiClient.post(
      `/api/v1/maintenance/work-orders/${workOrderId}/complete-and-release`,
      { resolution_notes: resolutionNotes }
    );
    return extractData<OOOBlockResponse>(response.data);
  },

  getMaintenanceRoomBlocks: async (filters?: {
    status?: string;
    room_id?: number;
  }): Promise<MaintenanceRoomBlock[]> => {
    const response = await apiClient.get('/api/v1/maintenance/room-blocks', {
      params: filters,
    });
    return extractData<MaintenanceRoomBlock[]>(response.data);
  },

  getWorkOrderOOOStatus: async (
    workOrderId: number
  ): Promise<OOOStatusResponse> => {
    const response = await apiClient.get(
      `/api/v1/maintenance/work-orders/${workOrderId}/ooo-status`
    );
    return extractData<OOOStatusResponse>(response.data);
  },
};

// ===== OOO TYPES =====

export interface OOOBlockResponse {
  success: boolean;
  room_block_id?: number;
  maintenance_request_id: number;
  action_taken: string;
  message: string;
  affected_bookings_count: number;
  affected_bookings?: AffectedBooking[];
}

export interface AffectedBooking {
  booking_id: number;
  confirmation_code: string;
  guest_name: string;
  arrival_date: string;
  departure_date: string;
  room_type: string;
  status: string;
}

export interface MaintenanceRoomBlock {
  id: number;
  room_id: number;
  room_number: string;
  block_type: string;
  reason: string;
  start_date: string;
  end_date: string;
  maintenance_request_id?: number;
  work_order_number?: string;
  auto_created: boolean;
  auto_released: boolean;
  status: string;
  created_at: string;
}

export interface OOOStatusResponse {
  work_order_id: number;
  is_ooo: boolean;
  room_block_id?: number;
  block_start_date?: string;
  block_end_date?: string;
  estimated_completion?: string;
  ooo_category?: string;
  affected_bookings_count: number;
}
