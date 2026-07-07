import { apiClient } from '../client';

// ── Types ──

export interface AttendanceSummary {
  present: number;
  absent: number;
  late: number;
  early_leave: number;
  overtime: number;
  total_scheduled: number;
}

export interface AttendanceEntry {
  id: number;
  staff_id: number;
  staff_name: string;
  staff_role: string;
  department: string;
  shift_type: 'morning' | 'evening' | 'night';
  date: string;
  clock_in: string | null;
  clock_out: string | null;
  status: 'present' | 'absent' | 'late' | 'overtime' | 'early_leave' | 'on_leave' | 'sick';
  total_hours: number | null;
  notes?: string;
}

export interface AttendanceListParams {
  date?: string;
  start_date?: string;
  end_date?: string;
  department?: string;
  status?: string;
  shift_type?: string;
  search?: string;
  page?: number;
  per_page?: number;
}

// Helper to extract data from wrapped API responses
const extractData = <T>(responseData: any): T => {
  if (responseData && typeof responseData === 'object' && 'data' in responseData) {
    return responseData.data;
  }
  return responseData;
};

export const attendanceService = {
  // Get attendance summary for a date
  getSummary: async (date: string): Promise<AttendanceSummary> => {
    const response = await apiClient.get('/api/v1/attendance/summary', {
      params: { date },
    });
    return extractData<AttendanceSummary>(response.data);
  },

  // List all attendance records with filters
  list: async (params?: AttendanceListParams): Promise<AttendanceEntry[]> => {
    const response = await apiClient.get('/api/v1/attendance', { params });
    return extractData<AttendanceEntry[]>(response.data);
  },

  // Export attendance as CSV
  exportCSV: async (params?: AttendanceListParams): Promise<Blob> => {
    const response = await apiClient.get('/api/v1/attendance/export', {
      params,
      responseType: 'blob',
    });
    return response.data;
  },
};
