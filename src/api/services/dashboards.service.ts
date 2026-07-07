import { apiClient, cachedGet } from '../client';
import type { ApiResponse } from '../types/common.types';

export interface AdminDashboardKPIs {
  occupancy_rate: number;
  avg_occupancy_30d: number;
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
  total_completed_bookings: number;
  revenue_week: number;
  revenue_today: number;
  revenue_mtd: number;
  revenue_ytd: number;
  revenue_last_month: number;
  total_guests: number;
  vip_guests: number;
}

export interface AdminDashboardHousekeeping {
  pending_tasks: number;
  in_progress_tasks: number;
  completed_today: number;
  dirty_rooms: number;
  staff_on_shift: number;
}

export interface AdminDashboardMaintenance {
  open_requests: number;
  high_priority: number;
}

export interface AdminDashboardStaff {
  active_count: number;
  on_shift: number;
}

export interface AdminDashboardTrends {
  occupancy: number;
  adr: number;
  revpar: number;
  bookings: number;
  revenue_mtd: number;
  checkins: number;
  checkouts: number;
  available_rooms: number;
}

export interface RecentBooking {
  id: string | number;
  guest: string;
  room: string;
  roomType: string;
  checkIn: string;
  checkOut: string;
  status: string;
  source: string;
  totalAmount: number;
  paymentStatus?: string;
  amountPaid?: number;
  paymentMethod?: string;
  isVIP?: boolean;
  specialRequests?: string | string[];
}

export interface RecentReview {
  id: number;
  guestName: string;
  rating: number;
  sentiment: string;
  reviewText: string;
  date: string;
  platform: string;
  hasReply: boolean;
}

export interface ChannelDistribution {
  name: string;
  value: number;
}

export interface RevenueChartData {
  day: string;
  revenue: number;
}

export interface AdminDashboard {
  kpis: AdminDashboardKPIs;
  housekeeping: AdminDashboardHousekeeping;
  maintenance: AdminDashboardMaintenance;
  staff: AdminDashboardStaff;
  trends: AdminDashboardTrends;
  recent_bookings: RecentBooking[];
  upcoming_arrivals: RecentBooking[];
  channel_distribution: ChannelDistribution[];
  recent_reviews: RecentReview[];
  revenue_chart: RevenueChartData[];
  timestamp: string;
}

export interface FinanceDashboard {
  total_revenue: number;
  outstanding_balance: number;
  payment_methods: Record<string, number>;
  top_rate_plans: any[];
}

export interface OperationsDashboard {
  room_status_summary: Record<string, number>;
  housekeeping_tasks: {
    pending: number;
    in_progress: number;
    completed: number;
  };
  maintenance_requests: {
    open: number;
    in_progress: number;
    resolved: number;
  };
  staff_assignments: any[];
}

export interface FrontDeskDashboard {
  arrivals_today: number;
  departures_today: number;
  in_house: number;
  pending_checkins: number;
  pending_checkouts: number;
  tasks: any[];
}

export const dashboardsService = {
  // All dashboard endpoints use cached GET to prevent duplicate calls
  getAdminDashboard: async () => {
    const response = await cachedGet<ApiResponse<AdminDashboard>>(
      '/api/v1/dashboards/admin'
    );
    return response.data.data || response.data;
  },

  getFinanceDashboard: async (startDate?: string, endDate?: string) => {
    const params: Record<string, string> = {};
    if (startDate) params.start_date = startDate;
    if (endDate) params.end_date = endDate;

    const response = await cachedGet<ApiResponse<FinanceDashboard>>(
      '/api/v1/dashboards/finance',
      { params }
    );
    return response.data.data || response.data;
  },

  /**
   * Per-day payment-by-method breakdown from actual captured payments.
   * Used by Payment Analytics Revenue Trend chart so the bars reflect
   * money actually received (UPI / Cash / Bank Transfer / etc.) rather
   * than a booking's intended payment_method field.
   */
  getFinancePaymentTrend: async (startDate?: string, endDate?: string) => {
    const params: Record<string, string> = {};
    if (startDate) params.start_date = startDate;
    if (endDate) params.end_date = endDate;
    const response = await cachedGet<ApiResponse<{
      period: { start: string; end: string };
      methods: string[];
      days: Array<Record<string, string | number>>;
    }>>('/api/v1/dashboards/finance/payment-trend', { params });
    return response.data.data || response.data;
  },

  getOperationsDashboard: async () => {
    const response = await cachedGet<ApiResponse<OperationsDashboard>>(
      '/api/v1/dashboards/operations'
    );
    return response.data.data || response.data;
  },

  getFrontDeskDashboard: async () => {
    const response = await cachedGet<ApiResponse<FrontDeskDashboard>>(
      '/api/v1/dashboards/frontdesk'
    );
    return response.data.data || response.data;
  },

  getManagementDashboard: async () => {
    const response = await cachedGet('/api/v1/dashboards/management');
    return response.data.data || response.data;
  },
};

