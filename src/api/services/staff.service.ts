import { apiClient } from '../client';
import type { ApiResponse } from '../types/common.types';

export interface Staff {
  id: number;
  user_id?: number;
  employee_id?: string;
  name: string;
  role: string;
  department?: string;
  email: string;
  personal_email?: string;
  phone?: string;
  status: string;
  shift?: string;
  hire_date: string;
  avatar?: string;
  performance_rating?: number;
  clocked_in?: boolean;
  permissions?: Record<string, { view: boolean; edit: boolean; delete: boolean }>;
}

export interface StaffFullProfile extends Staff {
  specialty?: string;
  shift_start?: string;
  shift_end?: string;
  clock_in_time?: string;
  supervisor_id?: number;
  supervisor_name?: string;
  floor_assignment?: string[];
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  emergency_contact_relationship?: string;
  address?: string;
  salary?: number;
  hourly_rate?: number;
  certifications?: string[];
  skills?: string[];
  languages_spoken?: string[];
  schedule?: ScheduleEntry[];
  attendance_stats?: AttendanceStats;
}

export interface ScheduleEntry {
  date: string;
  shift_type: string;
  start_time: string;
  end_time: string;
  status: string;
}

export interface AttendanceStats {
  days_present: number;
  days_absent: number;
  days_late: number;
  total_hours: number;
  overtime_hours: number;
}

export interface StaffCreateResponse extends Staff {
  temp_password?: string;
  must_reset_password?: boolean;
  email_sent?: boolean;
}

export interface StaffCreate {
  email: string;
  personal_email?: string;
  full_name: string;
  phone?: string;
  role: string;
  department?: string;
  password?: string;
  specialty?: string;
  shift?: string;
  hourly_rate?: number;
  permissions?: Record<string, { view: boolean; edit: boolean; delete: boolean }>;
}

export interface StaffUpdate {
  full_name?: string;
  role?: string;
  department?: string;
  phone?: string;
  is_active?: boolean;
  status?: string;
  shift?: string;
  specialty?: string;
  supervisor_id?: number;
  floor_assignment?: string[];
  address?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  emergency_contact_relationship?: string;
  hourly_rate?: number;
  avatar?: string;
  skills?: string[];
  languages_spoken?: string[];
}

export interface ShiftAssignment {
  schedule_date: string;
  shift_type: string;
  start_time: string;
  end_time: string;
  department?: string;
  location?: string;
  notes?: string;
}

export interface AttendanceRecord {
  action: 'clock_in' | 'clock_out';
  location?: string;
  notes?: string;
}

export interface LeaveRequest {
  leave_type: string;
  start_date: string;
  end_date: string;
  reason?: string;
}

export interface MessageRequest {
  subject: string;
  message: string;
  priority?: 'low' | 'normal' | 'high' | 'urgent';
}

export interface Task {
  id: number;
  room_id: number;
  task_type: string;
  status: string;
  priority: string;
  scheduled_for?: string;
  estimated_duration?: number;
  notes?: string;
  created_at?: string;
}

export interface PerformanceMetrics {
  staff_id: number;
  staff_name: string;
  period: string;
  tasks_assigned: number;
  tasks_completed: number;
  completion_rate: number;
  avg_completion_time: number;
  quality_score: number;
  efficiency_score: number;
  performance_rating?: number;
}

// Helper to extract data from wrapped API responses
// API may return { success: true, data: [...] } or just [...]
const extractData = <T>(responseData: any): T => {
  if (responseData && typeof responseData === 'object' && 'data' in responseData) {
    return responseData.data;
  }
  return responseData;
};

export const staffService = {
  // Get current user's staff profile
  getMyProfile: async (): Promise<StaffFullProfile> => {
    const response = await apiClient.get<StaffFullProfile>('/api/v1/staff/me');
    return extractData<StaffFullProfile>(response.data);
  },

  // Basic CRUD
  list: async (params?: {
    role?: string;
    department?: string;
    status?: string;
    search?: string;
  }) => {
    const response = await apiClient.get<Staff[]>('/api/v1/staff', { params });
    return extractData<Staff[]>(response.data);
  },

  get: async (staffId: number | string): Promise<StaffFullProfile> => {
    const response = await apiClient.get<StaffFullProfile>(`/api/v1/staff/${staffId}`);
    return extractData<StaffFullProfile>(response.data);
  },

  create: async (data: StaffCreate): Promise<StaffCreateResponse> => {
    const response = await apiClient.post<StaffCreateResponse>('/api/v1/staff', data);
    return extractData<StaffCreateResponse>(response.data);
  },

  update: async (staffId: number | string, data: StaffUpdate): Promise<Staff> => {
    const response = await apiClient.patch<Staff>(`/api/v1/staff/${staffId}`, data);
    return extractData<Staff>(response.data);
  },

  delete: async (staffId: number | string): Promise<{ message: string; id: number }> => {
    const response = await apiClient.delete(`/api/v1/staff/${staffId}`);
    return extractData<{ message: string; id: number }>(response.data);
  },

  // Shift Management
  assignShift: async (staffId: number | string, data: ShiftAssignment) => {
    const response = await apiClient.post(`/api/v1/staff/${staffId}/assign-shift`, data);
    return extractData<any>(response.data);
  },

  getSchedule: async (staffId: number | string, startDate?: string, endDate?: string) => {
    const params: Record<string, string> = {};
    if (startDate) params.start_date = startDate;
    if (endDate) params.end_date = endDate;
    const response = await apiClient.get(`/api/v1/staff/${staffId}/schedule`, { params });
    return extractData<any>(response.data);
  },

  // Attendance
  clockInOut: async (staffId: number | string, data: AttendanceRecord) => {
    const response = await apiClient.post(`/api/v1/staff/${staffId}/clock`, data);
    return extractData<any>(response.data);
  },

  // Leave Management
  requestLeave: async (staffId: number | string, data: LeaveRequest) => {
    const response = await apiClient.post(`/api/v1/staff/${staffId}/leave`, data);
    return extractData<any>(response.data);
  },

  updateLeaveStatus: async (
    staffId: number | string,
    leaveId: number | string,
    action: 'approve' | 'reject',
    rejectionReason?: string
  ) => {
    const params: Record<string, string> = { action };
    if (rejectionReason) params.rejection_reason = rejectionReason;
    const response = await apiClient.patch(
      `/api/v1/staff/${staffId}/leave/${leaveId}`,
      null,
      { params }
    );
    return extractData<any>(response.data);
  },

  // Tasks
  getTasks: async (staffId: number | string, status?: string): Promise<Task[]> => {
    const params: Record<string, string> = {};
    if (status) params.status = status;
    const response = await apiClient.get(`/api/v1/staff/${staffId}/tasks`, { params });
    return extractData<Task[]>(response.data);
  },

  // Performance
  getPerformance: async (
    staffId: number | string,
    period: 'week' | 'month' | 'quarter' | 'year' = 'month'
  ): Promise<PerformanceMetrics> => {
    const response = await apiClient.get(`/api/v1/staff/${staffId}/performance`, {
      params: { period },
    });
    return extractData<PerformanceMetrics>(response.data);
  },

  // Messaging
  sendMessage: async (staffId: number | string, data: MessageRequest) => {
    const response = await apiClient.post(`/api/v1/staff/${staffId}/message`, data);
    return extractData<any>(response.data);
  },
};
