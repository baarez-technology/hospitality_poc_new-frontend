import { apiClient } from '../client';
import type { ApiResponse } from '../types/common.types';

export interface RoomStatus {
  id: number;
  number: string;
  room_type: string;
  status: string;
  floor?: number;
  capacity: number;
  max_occupancy: number;
  bed_type?: string;
  view_type?: string;
}

export interface RoomStatusUpdate {
  status: string;
  notes?: string;
}

export interface TaskCreate {
  room_id: number;
  task_type: string;
  priority: string;
  scheduled_for?: string;
  estimated_duration?: number;
  notes?: string;
}

export interface TaskUpdate {
  status?: string;
  assigned_to?: number;
  started_at?: string;
  completed_at?: string;
  actual_duration?: number;
  notes?: string;
}

export interface TaskAssignData {
  staff_id: number;
  priority?: string;
  notes?: string;
}

export interface TaskCompleteData {
  notes?: string;
  quality_score?: number;
  issues_found?: string[];
  checklist?: Array<{ id: string; task: string; completed: boolean }>;
}

export interface RoomInspectionData {
  passed: boolean;
  notes?: string;
  issues?: string[];
}

export interface HousekeepingTask {
  id: number;
  room_id: number;
  room_number?: string;
  task_type: string;
  status: string;
  priority: string;
  assigned_to?: number;
  assigned_staff_name?: string;
  assigned_to_name?: string;
  scheduled_for?: string;
  started_at?: string;
  completed_at?: string;
  estimated_duration?: number;
  actual_duration?: number;
  notes?: string;
  created_at?: string;
}

export interface HousekeepingDashboard {
  room_status: {
    clean: number;
    dirty: number;
    in_progress: number;
    occupied: number;
    out_of_order: number;
  };
  tasks: {
    pending: number;
    in_progress: number;
    completed_today: number;
    avg_cleaning_time: number;
  };
  staff: {
    on_shift: number;
    list: Array<{
      id: number;
      name: string;
      status: string;
      current_room?: string | null;
    }>;
  };
  priority_rooms: Array<{
    room_id: number;
    priority: string;
    task_type: string;
  }>;
}

export interface MaintenanceRequestCreate {
  room_id?: number;
  issue: string;
  description?: string;
  severity: string;
  estimated_cost?: number;
  notes?: string;
}

export interface LostFoundCreate {
  item_description: string;
  location_found?: string;
  room_id?: number;
  found_date?: string;
  storage_location?: string;
  notes?: string;
}

export const housekeepingService = {
  getRooms: async (status?: string, roomType?: string) => {
    const params: Record<string, string> = {};
    if (status) params.status = status;
    if (roomType) params.room_type = roomType;

    const response = await apiClient.get<ApiResponse<RoomStatus[]>>(
      '/api/v1/housekeeping/rooms',
      { params }
    );
    return response.data.data || response.data;
  },

  getMyRooms: async (status?: string) => {
    const params: Record<string, string> = {};
    if (status) params.status = status;

    const response = await apiClient.get<ApiResponse<RoomStatus[]>>(
      '/api/v1/housekeeping/rooms/my-rooms',
      { params }
    );
    return response.data.data || response.data;
  },

  updateRoomStatus: async (roomId: number, data: RoomStatusUpdate) => {
    const response = await apiClient.patch(
      `/api/v1/housekeeping/rooms/${roomId}/status`,
      data
    );
    return response.data.data || response.data;
  },

  getTasks: async (status?: string, assignedTo?: number) => {
    const params: Record<string, string> = {};
    if (status) params.status = status;
    if (assignedTo) params.assigned_to = String(assignedTo);

    const response = await apiClient.get('/api/v1/housekeeping/tasks', { params });
    return response.data.data || response.data;
  },

  getMyTasks: async (status?: string): Promise<HousekeepingTask[]> => {
    const params: Record<string, string> = {};
    if (status) params.status = status;
    const response = await apiClient.get('/api/v1/housekeeping/tasks/my-tasks', { params });
    return Array.isArray(response.data) ? response.data : (response.data as any).data || [];
  },

  createTask: async (data: TaskCreate) => {
    const response = await apiClient.post<ApiResponse<any>>('/api/v1/housekeeping/tasks', data);
    const result = response.data.data || response.data;
    // Backend returns {"id": task.id, "status": "created"}, extract id
    return { id: result.id || result.task_id, ...result };
  },

  updateTask: async (taskId: number, data: TaskUpdate) => {
    const response = await apiClient.patch(
      `/api/v1/housekeeping/tasks/${taskId}`,
      data
    );
    return response.data.data || response.data;
  },

  getMaintenance: async () => {
    const response = await apiClient.get('/api/v1/housekeeping/maintenance');
    return response.data.data || response.data;
  },

  createMaintenanceRequest: async (data: MaintenanceRequestCreate) => {
    const response = await apiClient.post('/api/v1/housekeeping/maintenance', data);
    return response.data.data || response.data;
  },

  getLostFound: async () => {
    const response = await apiClient.get('/api/v1/housekeeping/lost-found');
    return response.data.data || response.data;
  },

  createLostFound: async (data: LostFoundCreate) => {
    const response = await apiClient.post('/api/v1/housekeeping/lost-found', data);
    return response.data.data || response.data;
  },

  getLinenInventory: async () => {
    const response = await apiClient.get('/api/v1/housekeeping/linen-inventory');
    return response.data.data || response.data;
  },

  updateLinenInventory: async (data: any) => {
    const response = await apiClient.post('/api/v1/housekeeping/linen-inventory', data);
    return response.data.data || response.data;
  },

  // Cancel (soft-delete) a task by setting status to cancelled
  cancelTask: async (taskId: number) => {
    const response = await apiClient.patch(
      `/api/v1/housekeeping/tasks/${taskId}`,
      { status: 'cancelled' }
    );
    return response.data.data || response.data;
  },

  // Task assignment operations
  assignTask: async (taskId: number, data: TaskAssignData) => {
    const response = await apiClient.post(
      `/api/v1/housekeeping/tasks/${taskId}/assign`,
      data
    );
    return response.data.data || response.data;
  },

  startTask: async (taskId: number) => {
    const response = await apiClient.post(
      `/api/v1/housekeeping/tasks/${taskId}/start`
    );
    return response.data.data || response.data;
  },

  completeTask: async (taskId: number, data?: TaskCompleteData) => {
    const response = await apiClient.post(
      `/api/v1/housekeeping/tasks/${taskId}/complete`,
      data || {}
    );
    return response.data.data || response.data;
  },

  // Room inspection
  inspectRoom: async (roomId: number, data: RoomInspectionData) => {
    const response = await apiClient.post(
      `/api/v1/housekeeping/rooms/${roomId}/inspect`,
      data
    );
    return response.data.data || response.data;
  },

  // Dashboard
  getDashboard: async (): Promise<HousekeepingDashboard> => {
    const response = await apiClient.get<HousekeepingDashboard>(
      '/api/v1/housekeeping/dashboard'
    );
    return response.data;
  },

  // Get tasks for a specific staff member
  getStaffTasks: async (staffId: number, status?: string): Promise<HousekeepingTask[]> => {
    const params: Record<string, string> = { assigned_to: String(staffId) };
    if (status) params.status = status;
    const response = await apiClient.get('/api/v1/housekeeping/tasks', { params });
    return Array.isArray(response.data) ? response.data : (response.data as any).data || [];
  },

  // Get pending tasks
  getPendingTasks: async (): Promise<HousekeepingTask[]> => {
    const response = await apiClient.get('/api/v1/housekeeping/tasks', {
      params: { status: 'pending' }
    });
    return Array.isArray(response.data) ? response.data : (response.data as any).data || [];
  },

  // Get dirty rooms that need cleaning
  getDirtyRooms: async () => {
    const response = await apiClient.get('/api/v1/housekeeping/rooms', {
      params: { status: 'dirty' }
    });
    return Array.isArray(response.data) ? response.data : (response.data as any).data || [];
  },

  // Auto-assign a single task to best available staff using multi-factor scoring
  autoAssignTask: async (taskId: number): Promise<{
    task_id: number;
    assigned_to: number;
    assigned_to_name: string;
    score: number;
    success: boolean;
    message: string;
  }> => {
    const response = await apiClient.post(`/api/v1/housekeeping/tasks/${taskId}/auto-assign`);
    return response.data.data || response.data;
  },

  // Auto-assign all pending tasks to available staff
  autoAssignAllTasks: async (priority?: string, maxTasks: number = 50): Promise<{
    total_assigned: number;
    total_failed: number;
    results: Array<{
      task_id: number;
      assigned_to: number;
      assigned_to_name: string;
      score: number;
      success: boolean;
      message: string;
    }>;
  }> => {
    const params: Record<string, string | number> = { max_tasks: maxTasks };
    if (priority) params.priority = priority;
    const response = await apiClient.post('/api/v1/housekeeping/tasks/auto-assign-all', null, { params });
    return response.data.data || response.data;
  },
};

