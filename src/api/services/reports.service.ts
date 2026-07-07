import { apiClient } from '../client';

// ==================== TYPES ====================

export interface AIInsight {
  type: 'warning' | 'opportunity' | 'info';
  priority: 'high' | 'medium' | 'low';
  title: string;
  message: string;
  action: string;
}

export interface DailyOccupancy {
  date: string;
  occupancy: number;
  adr: number;
  revpar: number;
  revenue: number;
}

export interface DailyBookings {
  date: string;
  direct: number;
  ota: number;
  corporate: number;
  walkin: number;
  total: number;
}

export interface BookingSource {
  name: string;
  value: number;
  color: string;
}

export interface RoomTypePerformance {
  name: string;
  bookings: number;
  revenue: number;
  occupancy: number;
}

export interface BookingsOccupancyReport {
  report_period: {
    start_date: string;
    end_date: string;
    days: number;
  };
  summary: {
    total_bookings: number;
    total_revenue: number;
    avg_occupancy: number;
    avg_adr: number;
    avg_revpar: number;
    direct_percent: number;
  };
  comparisons: {
    bookings_change: number;
    occupancy_change: number;
    adr_change: number;
    revenue_change: number;
    revpar_change: number;
    direct_change: number;
  };
  daily_occupancy: DailyOccupancy[];
  daily_bookings: DailyBookings[];
  booking_sources: BookingSource[];
  room_type_performance: RoomTypePerformance[];
  ai_insights: AIInsight[];
  generated_at: string;
}

export interface RevenueBySource {
  name: string;
  value: number;
  color: string;
}

export interface RevenueByRoomType {
  name: string;
  revenue: number;
  rooms: number;
  adr: number;
}

export interface WeeklySummary {
  week: string;
  revenue: number;
  occupancy: number;
  adr: number;
}

export interface RevenueSnapshotReport {
  report_period: {
    start_date: string;
    end_date: string;
    days: number;
  };
  summary: {
    total_revenue: number;
    avg_adr: number;
    avg_revpar: number;
    avg_occupancy: number;
    peak_revenue: number;
    target_progress: number;
  };
  comparisons: {
    revenue_change: number;
    adr_change: number;
    revpar_change: number;
    occupancy_change: number;
  };
  daily_data: DailyOccupancy[];
  revenue_by_source: RevenueBySource[];
  revenue_by_payment_mode?: RevenueBySource[];
  revenue_by_room_type: RevenueByRoomType[];
  weekly_summary: WeeklySummary[];
  ai_insights: AIInsight[];
  generated_at: string;
}

export interface RoomStatusDistribution {
  name: string;
  value: number;
  color: string;
}

export interface TurnoverByFloor {
  floor: string;
  turnover_time: number;
  rooms_cleaned: number;
}

export interface RoomDetail {
  room_number: string;
  room_type: string;
  floor: number;
  status: string;
  last_cleaned: string;
  assigned_to: string;
}

export interface ActiveIssue {
  room: string;
  issue: string;
  priority: string;
  reported: string;
  status: string;
}

export interface HousekeepingRoomsReport {
  summary: {
    total_rooms: number;
    clean_rooms: number;
    dirty_rooms: number;
    inspecting_rooms: number;
    maintenance_rooms: number;
    avg_turnover_time: number;
    inspection_score: number;
  };
  room_status_distribution: RoomStatusDistribution[];
  turnover_by_floor: TurnoverByFloor[];
  room_details: RoomDetail[];
  active_issues: ActiveIssue[];
  ai_insights: AIInsight[];
  generated_at: string;
}

export interface SentimentTrend {
  date: string;
  sentiment: number;
  reviews: number;
}

export interface RatingsByPlatform {
  platform: string;
  rating: number;
  reviews: number;
}

export interface ReviewsBySource {
  name: string;
  value: number;
  color: string;
}

export interface SentimentDistribution {
  name: string;
  value: number;
  color: string;
}

export interface Review {
  id: number;
  guest_name: string;
  date: string;
  platform: string;
  rating: number;
  sentiment: string;
  comment: string;
  responded: boolean;
}

export interface GuestExperienceReport {
  report_period: {
    start_date: string;
    end_date: string;
    days: number;
  };
  summary: {
    total_reviews: number;
    avg_rating: number;
    avg_sentiment: number;
    positive_reviews: number;
    negative_reviews: number;
    neutral_reviews: number;
    response_rate: number;
  };
  comparisons: {
    reviews_change: number;
    rating_change: number;
    sentiment_change: number;
    response_rate_change: number;
  };
  sentiment_trend: SentimentTrend[];
  ratings_by_platform: RatingsByPlatform[];
  reviews_by_source: ReviewsBySource[];
  sentiment_distribution: SentimentDistribution[];
  recent_reviews: Review[];
  platform_summary: RatingsByPlatform[];
  ai_insights: AIInsight[];
  generated_at: string;
}

// Legacy types
export interface OccupancyReport {
  start_date: string;
  end_date: string;
  total_rooms: number;
  occupied_room_nights: number;
  total_room_nights: number;
  occupancy_rate: number;
}

export interface RevenueReport {
  start_date: string;
  end_date: string;
  total_revenue: number;
  total_charges: number;
  revenue_by_method: Record<string, number>;
  transaction_count: number;
}

export interface ArrivalsDeparturesReport {
  date: string;
  arrivals: Array<{
    confirmation_code: string;
    guest_name: string;
    arrival_date: string;
    room_id?: number;
  }>;
  departures: Array<{
    confirmation_code: string;
    guest_name: string;
    departure_date: string;
    room_id?: number;
  }>;
  arrivals_count: number;
  departures_count: number;
}

export interface DailyFlashReport {
  date: string;
  occupancy_rate: number;
  revenue: number;
  arrivals: number;
  departures: number;
  in_house: number;
  no_shows: number;
  walk_ins: number;
}

// ==================== SERVICE ====================

export type ExportFormat = 'csv' | 'json' | 'pdf' | 'excel' | 'xlsx';

const MIME_TYPES: Record<string, string> = {
  csv: 'text/csv',
  pdf: 'application/pdf',
  excel: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
};

const FILE_EXTENSIONS: Record<string, string> = {
  csv: 'csv',
  pdf: 'pdf',
  excel: 'xlsx',
  xlsx: 'xlsx'
};

const downloadBlob = (data: Blob, filename: string) => {
  const url = window.URL.createObjectURL(data);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

export const reportsService = {
  // Comprehensive Reports

  getBookingsOccupancyReport: async (
    dateRange: string = 'last_30_days',
    exportFormat?: ExportFormat,
    customRange?: { startDate: string; endDate: string }
  ): Promise<BookingsOccupancyReport> => {
    const params: Record<string, string> = { date_range: dateRange };
    if (dateRange === 'custom' && customRange) {
      params.start_date = customRange.startDate;
      params.end_date = customRange.endDate;
    }
    if (exportFormat) params.export_format = exportFormat;

    if (exportFormat && exportFormat !== 'json') {
      const response = await apiClient.get('/api/v1/reports/bookings-occupancy', {
        params,
        responseType: 'blob'
      });
      const mimeType = MIME_TYPES[exportFormat] || 'application/octet-stream';
      const ext = FILE_EXTENSIONS[exportFormat] || exportFormat;
      const blob = new Blob([response.data], { type: mimeType });
      downloadBlob(blob, `bookings_occupancy_report_${new Date().toISOString().split('T')[0]}.${ext}`);
      return {} as BookingsOccupancyReport;
    }

    const response = await apiClient.get<BookingsOccupancyReport>('/api/v1/reports/bookings-occupancy', { params });
    return response.data;
  },

  getRevenueSnapshotReport: async (
    dateRange: string = 'last_30_days',
    exportFormat?: ExportFormat,
    customRange?: { startDate: string; endDate: string }
  ): Promise<RevenueSnapshotReport> => {
    const params: Record<string, string> = { date_range: dateRange };
    if (dateRange === 'custom' && customRange) {
      params.start_date = customRange.startDate;
      params.end_date = customRange.endDate;
    }
    if (exportFormat) params.export_format = exportFormat;

    if (exportFormat && exportFormat !== 'json') {
      const response = await apiClient.get('/api/v1/reports/revenue-snapshot', {
        params,
        responseType: 'blob'
      });
      const mimeType = MIME_TYPES[exportFormat] || 'application/octet-stream';
      const ext = FILE_EXTENSIONS[exportFormat] || exportFormat;
      const blob = new Blob([response.data], { type: mimeType });
      downloadBlob(blob, `revenue_snapshot_report_${new Date().toISOString().split('T')[0]}.${ext}`);
      return {} as RevenueSnapshotReport;
    }

    const response = await apiClient.get<RevenueSnapshotReport>('/api/v1/reports/revenue-snapshot', { params });
    return response.data;
  },

  getHousekeepingRoomsReport: async (
    exportFormat?: ExportFormat
  ): Promise<HousekeepingRoomsReport> => {
    const params: Record<string, string> = {};
    if (exportFormat) params.export_format = exportFormat;

    if (exportFormat && exportFormat !== 'json') {
      const response = await apiClient.get('/api/v1/reports/housekeeping-rooms', {
        params,
        responseType: 'blob'
      });
      const mimeType = MIME_TYPES[exportFormat] || 'application/octet-stream';
      const ext = FILE_EXTENSIONS[exportFormat] || exportFormat;
      const blob = new Blob([response.data], { type: mimeType });
      downloadBlob(blob, `housekeeping_rooms_report_${new Date().toISOString().split('T')[0]}.${ext}`);
      return {} as HousekeepingRoomsReport;
    }

    const response = await apiClient.get<HousekeepingRoomsReport>('/api/v1/reports/housekeeping-rooms', { params });
    return response.data;
  },

  getGuestExperienceReport: async (
    dateRange: string = 'last_30_days',
    exportFormat?: ExportFormat,
    customRange?: { startDate: string; endDate: string }
  ): Promise<GuestExperienceReport> => {
    const params: Record<string, string> = { date_range: dateRange };
    if (dateRange === 'custom' && customRange) {
      params.start_date = customRange.startDate;
      params.end_date = customRange.endDate;
    }
    if (exportFormat) params.export_format = exportFormat;

    if (exportFormat && exportFormat !== 'json') {
      const response = await apiClient.get('/api/v1/reports/guest-experience', {
        params,
        responseType: 'blob'
      });
      const mimeType = MIME_TYPES[exportFormat] || 'application/octet-stream';
      const ext = FILE_EXTENSIONS[exportFormat] || exportFormat;
      const blob = new Blob([response.data], { type: mimeType });
      downloadBlob(blob, `guest_experience_report_${new Date().toISOString().split('T')[0]}.${ext}`);
      return {} as GuestExperienceReport;
    }

    const response = await apiClient.get<GuestExperienceReport>('/api/v1/reports/guest-experience', { params });
    return response.data;
  },

  // Legacy endpoints

  getOccupancyReport: async (
    startDate: string,
    endDate: string,
    exportFormat?: 'csv' | 'json'
  ) => {
    const params: Record<string, string> = {
      start_date: startDate,
      end_date: endDate,
    };
    if (exportFormat) params.export_format = exportFormat;

    const response = await apiClient.get<OccupancyReport>(
      '/api/v1/reports/occupancy',
      { params, responseType: exportFormat === 'csv' ? 'blob' : 'json' }
    );

    if (exportFormat === 'csv') {
      const blob = new Blob([response.data as any], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `occupancy_report_${startDate}_${endDate}.csv`;
      link.click();
      window.URL.revokeObjectURL(url);
      return null;
    }

    return response.data;
  },

  getRevenueReport: async (
    startDate: string,
    endDate: string,
    exportFormat?: 'csv' | 'json'
  ) => {
    const params: Record<string, string> = {
      start_date: startDate,
      end_date: endDate,
    };
    if (exportFormat) params.export_format = exportFormat;

    const response = await apiClient.get<RevenueReport>(
      '/api/v1/reports/revenue',
      { params, responseType: exportFormat === 'csv' ? 'blob' : 'json' }
    );

    if (exportFormat === 'csv') {
      const blob = new Blob([response.data as any], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `revenue_report_${startDate}_${endDate}.csv`;
      link.click();
      window.URL.revokeObjectURL(url);
      return null;
    }

    return response.data;
  },

  getArrivalsDeparturesReport: async (
    targetDate?: string,
    exportFormat?: 'csv' | 'json'
  ) => {
    const params: Record<string, string> = {};
    if (targetDate) params.target_date = targetDate;
    if (exportFormat) params.export_format = exportFormat;

    const response = await apiClient.get<ArrivalsDeparturesReport>(
      '/api/v1/reports/arrivals-departures',
      { params, responseType: exportFormat === 'csv' ? 'blob' : 'json' }
    );

    if (exportFormat === 'csv') {
      const blob = new Blob([response.data as any], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `arrivals_departures_${targetDate || 'today'}.csv`;
      link.click();
      window.URL.revokeObjectURL(url);
      return null;
    }

    return response.data;
  },

  getDailyFlashReport: async (targetDate?: string): Promise<DailyFlashReport> => {
    const params = targetDate ? { target_date: targetDate } : {};
    const response = await apiClient.get<DailyFlashReport>(
      '/api/v1/reports/daily-flash',
      { params }
    );
    return response.data;
  },
};
