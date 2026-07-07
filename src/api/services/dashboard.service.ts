import { apiClient } from '../client';
import { API_ENDPOINTS } from '@/config/constants';
import type { ApiResponse } from '../types/common.types';

export interface GuestDashboardStats {
  total_bookings: number;
  nights_stayed: number;
  loyalty_points: number;
  member_since: string | null;
  upcoming_booking: {
    id: string;
    bookingNumber: string;
    roomType: string;
    checkIn: string;
    checkOut: string;
    guests: number;
    nights: number;
    status: string;
  } | null;
  recent_activity: Array<{
    date: string;
    action: string;
    details: string;
  }>;
}

export interface AdminDashboardKPIs {
  occupancy_rate: number;
  adr: number;
  revpar: number;
  total_rooms: number;
  occupied_rooms: number;
  available_rooms: number;
  dirty_rooms: number;
  out_of_order: number;
  checkins_today: number;
  checkouts_today: number;
  bookings_this_week: number;
  revenue_week: number;
  total_guests: number;
  vip_guests: number;
}

export interface RecentBooking {
  id: number;
  guest: string;
  room: string;
  roomType: string;
  checkIn: string;
  checkOut: string;
  status: string;
  source: string;
  totalAmount: number;
}

export interface AdminDashboardData {
  kpis: AdminDashboardKPIs;
  housekeeping: {
    pending_tasks: number;
    in_progress_tasks?: number;
    completed_today: number;
    dirty_rooms: number;
    staff_on_shift: number;
  };
  maintenance: {
    open_requests: number;
    high_priority: number;
  };
  staff: {
    active_count: number;
    on_shift: number;
  };
  trends: {
    occupancy: number;
    adr: number;
    revpar: number;
    bookings: number;
    checkins: number;
    checkouts: number;
    available_rooms: number;
  };
  recent_bookings?: RecentBooking[];
  timestamp: string;
}

export interface HousekeepingDashboardData {
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

export interface FrontDeskDashboardData {
  room_overview: {
    total: number;
    available: number;
    occupied: number;
    dirty: number;
    out_of_order: number;
  };
  today: {
    arrivals: number;
    departures: number;
    arrivals_list: Array<{
      booking_id: number;
      booking_number: string;
      guest_name: string;
      room_type_id: number;
      room_id?: number;
      arrival_date: string;
      nights: number;
      status: string;
    }>;
    departures_list: Array<{
      booking_id: number;
      booking_number: string;
      guest_name: string;
      room_id: number;
      departure_date: string;
      status: string;
    }>;
  };
  tomorrow: {
    arrivals: number;
  };
  available_rooms: Array<{
    id: number;
    number: string;
    room_type: string;
    floor: number;
    status: string;
  }>;
}

export interface RevenueDashboardData {
  period: string;
  total_revenue: number;
  paid_revenue: number;
  pending_revenue: number;
  adr: number;
  channel_breakdown: Record<string, number>;
  daily_trend: Array<{
    date: string;
    revenue: number;
  }>;
}

export interface OccupancyForecast {
  total_rooms: number;
  forecast: Array<{
    date: string;
    day: string;
    occupied: number;
    available: number;
    occupancy_percent: number;
  }>;
}

export const dashboardService = {
  // Guest Dashboard
  getGuestDashboard: async (): Promise<GuestDashboardStats> => {
    try {
      const response = await apiClient.get<GuestDashboardStats>(
        API_ENDPOINTS.DASHBOARDS.GUEST
      );
      console.log('[dashboardService.getGuestDashboard] Raw response:', response.data);
      // Handle wrapped response from axios interceptor
      const data = response.data?.data || response.data;
      console.log('[dashboardService.getGuestDashboard] Unwrapped data:', data);
      return data;
    } catch (error: any) {
      console.error('[dashboardService.getGuestDashboard] Error:', error);
      throw error;
    }
  },

  // Admin Dashboard
  getAdminDashboard: async (): Promise<AdminDashboardData> => {
    const response = await apiClient.get<AdminDashboardData>('/api/v1/dashboards/admin');
    return response.data;
  },

  getAdminSummary: async () => {
    const response = await apiClient.get('/api/v1/dashboards/admin/summary');
    return response.data;
  },

  // Housekeeping Dashboard
  getHousekeepingDashboard: async (): Promise<HousekeepingDashboardData> => {
    const response = await apiClient.get<HousekeepingDashboardData>(
      '/api/v1/dashboards/housekeeping'
    );
    return response.data;
  },

  // Front Desk Dashboard
  getFrontDeskDashboard: async (): Promise<FrontDeskDashboardData> => {
    const response = await apiClient.get<FrontDeskDashboardData>(
      '/api/v1/dashboards/frontdesk'
    );
    return response.data;
  },

  // Revenue Dashboard
  getRevenueDashboard: async (
    period: 'day' | 'week' | 'month' | 'year' = 'week'
  ): Promise<RevenueDashboardData> => {
    const response = await apiClient.get<RevenueDashboardData>(
      '/api/v1/dashboards/revenue',
      { params: { period } }
    );
    return response.data;
  },

  // Occupancy Forecast
  getOccupancyForecast: async (days: number = 7): Promise<OccupancyForecast> => {
    const response = await apiClient.get<OccupancyForecast>(
      '/api/v1/dashboards/occupancy-forecast',
      { params: { days } }
    );
    return response.data;
  },

  // Operations Dashboard (existing)
  getOperationsDashboard: async () => {
    const response = await apiClient.get('/api/v1/dashboards/operations');
    return response.data;
  },

  // Finance Dashboard (existing)
  getFinanceDashboard: async (startDate?: string, endDate?: string) => {
    const params: Record<string, string> = {};
    if (startDate) params.start_date = startDate;
    if (endDate) params.end_date = endDate;
    const response = await apiClient.get('/api/v1/dashboards/finance', { params });
    return response.data;
  },

  // Management Dashboard (existing)
  getManagementDashboard: async () => {
    const response = await apiClient.get('/api/v1/dashboards/management');
    return response.data;
  },

  // Billing History for Guest Dashboard
  getBillingHistory: async (page = 1, pageSize = 10): Promise<BillingHistoryResponse> => {
    const response = await apiClient.get<BillingHistoryResponse>(
      '/api/v1/dashboards/guest/billing',
      { params: { page, pageSize } }
    );
    return response.data;
  },
};

// Billing History Types
export interface BillingItem {
  id: number;
  booking_number: string;
  date: string;
  description: string;
  room_type: string;
  check_in: string;
  check_out: string;
  nights: number;
  base_price: number;
  taxes: number;
  service_fee: number;
  amount: number;
  status: 'paid' | 'pending' | 'refunded';
  payment_method: string;
  booking_status: string;
}

export interface BillingHistoryResponse {
  items: BillingItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  summary: {
    total_spent: number;
    total_bookings: number;
    pending_amount: number;
  };
}
