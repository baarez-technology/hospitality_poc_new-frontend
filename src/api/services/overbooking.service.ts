import { apiClient } from '../client';

// ============== TYPES ==============

export interface OverbookingStatus {
  room_type_id: number;
  room_type_name: string;
  date: string;
  total_rooms: number;
  available_rooms: number;
  booked_count: number;
  overbooking_count: number;
  overbooking_percent: number;
  overbooking_limit_percent: number;
  overbooking_enabled: boolean;
  is_overbooked: boolean;
  remaining_overbooking_capacity: number;
}

export interface OverbookingCheckResult {
  can_book: boolean;
  would_cause_overbooking: boolean;
  current_overbooking_percent: number;
  resulting_overbooking_percent: number;
  overbooking_limit_percent: number;
  alert_severity?: string;
  message: string;
}

export interface OverbookingAlert {
  id: number;
  room_type_id: number;
  room_type_name?: string;
  alert_date: string;
  total_rooms: number;
  booked_count: number;
  overbooking_count: number;
  overbooking_percent: number;
  configured_limit_percent: number;
  exceeded_by_percent: number;
  severity: 'warning' | 'critical';
  alert_type: string;
  message: string;
  triggering_booking_id?: number;
  affected_bookings?: any[];
  status: 'active' | 'acknowledged' | 'resolved' | 'auto_resolved';
  resolved_at?: string;
  resolved_by?: number;
  resolution_method?: string;
  resolution_notes?: string;
  notification_sent: boolean;
  created_at: string;
}

export interface OverbookingConfig {
  id: number;
  overbooking_enabled: boolean;
  default_limit_percent: number;
  max_limit_percent: number;
  dynamic_overbooking_enabled: boolean;
  historical_lookback_days: number;
  warning_threshold_percent: number;
  critical_threshold_percent: number;
  auto_decline_above_critical: boolean;
  notification_emails?: string;
  notify_on_warning: boolean;
  notify_on_critical: boolean;
  auto_waitlist_when_overbooked: boolean;
  compensation_policy?: string;
  updated_at: string;
}

export interface RoomTypeOverbookingSettings {
  id: number;
  name: string;
  total_rooms: number;
  overbooking_enabled: boolean;
  overbooking_limit_percent: number;
  overbooking_limit_absolute?: number;
  dynamic_overbooking: boolean;
  no_show_rate: number;
  cancellation_rate: number;
}

export interface OverbookingReport {
  start_date: string;
  end_date: string;
  total_overbooked_days: number;
  average_overbooking_percent: number;
  max_overbooking_percent: number;
  alerts_generated: number;
  alerts_resolved: number;
  room_types: Array<{
    room_type_id: number;
    room_type_name: string;
    overbooked_days: number;
    average_percent: number;
    max_percent: number;
  }>;
  daily_data: Array<{
    date: string;
    total_overbooking_percent: number;
    room_type_breakdown: Record<string, number>;
  }>;
}

export interface OverbookingDashboard {
  current_status: {
    total_room_types: number;
    overbooked_room_types: number;
    total_overbooking_percent: number;
  };
  alerts_summary: {
    active_alerts: number;
    warning_alerts: number;
    critical_alerts: number;
  };
  recent_alerts: OverbookingAlert[];
  room_type_summary: Array<{
    room_type_id: number;
    room_type_name: string;
    current_overbooking_percent: number;
    limit_percent: number;
    status: 'ok' | 'warning' | 'critical';
  }>;
}

// ============== HELPER ==============

const extractData = <T>(responseData: any): T => {
  if (responseData && typeof responseData === 'object' && 'data' in responseData) {
    return responseData.data;
  }
  return responseData;
};

// ============== SERVICE ==============

export const overbookingService = {
  // ===== STATUS =====

  getOverbookingStatus: async (
    roomTypeId: number,
    date?: string
  ): Promise<OverbookingStatus> => {
    const params = date ? { date } : undefined;
    const response = await apiClient.get(
      `/api/v1/overbooking/status/${roomTypeId}`,
      { params }
    );
    return extractData<OverbookingStatus>(response.data);
  },

  getAllOverbookingStatus: async (
    date?: string
  ): Promise<OverbookingStatus[]> => {
    const params = date ? { date } : undefined;
    const response = await apiClient.get('/api/v1/overbooking/status-all', {
      params,
    });
    return extractData<OverbookingStatus[]>(response.data);
  },

  checkOverbooking: async (
    roomTypeId: number,
    arrivalDate: string,
    departureDate: string
  ): Promise<OverbookingCheckResult> => {
    const response = await apiClient.post('/api/v1/overbooking/check', {
      room_type_id: roomTypeId,
      arrival_date: arrivalDate,
      departure_date: departureDate,
    });
    return extractData<OverbookingCheckResult>(response.data);
  },

  // ===== CONFIG =====

  getGlobalConfig: async (): Promise<OverbookingConfig> => {
    const response = await apiClient.get('/api/v1/overbooking/config');
    return extractData<OverbookingConfig>(response.data);
  },

  updateGlobalConfig: async (
    data: Partial<OverbookingConfig>
  ): Promise<OverbookingConfig> => {
    const response = await apiClient.patch('/api/v1/overbooking/config', data);
    return extractData<OverbookingConfig>(response.data);
  },

  // ===== ROOM TYPE SETTINGS =====

  getRoomTypeSettings: async (
    roomTypeId: number
  ): Promise<RoomTypeOverbookingSettings> => {
    const response = await apiClient.get(
      `/api/v1/overbooking/room-type/${roomTypeId}/settings`
    );
    return extractData<RoomTypeOverbookingSettings>(response.data);
  },

  updateRoomTypeSettings: async (
    roomTypeId: number,
    data: Partial<RoomTypeOverbookingSettings>
  ): Promise<RoomTypeOverbookingSettings> => {
    const response = await apiClient.patch(
      `/api/v1/overbooking/room-type/${roomTypeId}/settings`,
      data
    );
    return extractData<RoomTypeOverbookingSettings>(response.data);
  },

  getAllRoomTypeSettings: async (): Promise<RoomTypeOverbookingSettings[]> => {
    const response = await apiClient.get('/api/v1/overbooking/room-types/settings');
    return extractData<RoomTypeOverbookingSettings[]>(response.data);
  },

  // ===== ALERTS =====

  getAlerts: async (filters?: {
    status?: string;
    severity?: string;
    room_type_id?: number;
    date_from?: string;
    date_to?: string;
    limit?: number;
  }): Promise<OverbookingAlert[]> => {
    const response = await apiClient.get('/api/v1/overbooking/alerts', {
      params: filters,
    });
    return extractData<OverbookingAlert[]>(response.data);
  },

  acknowledgeAlert: async (
    alertId: number
  ): Promise<OverbookingAlert> => {
    const response = await apiClient.post(
      `/api/v1/overbooking/alerts/${alertId}/acknowledge`
    );
    return extractData<OverbookingAlert>(response.data);
  },

  resolveAlert: async (
    alertId: number,
    data: {
      resolution_method: string;
      resolution_notes?: string;
    }
  ): Promise<OverbookingAlert> => {
    const response = await apiClient.post(
      `/api/v1/overbooking/alerts/${alertId}/resolve`,
      data
    );
    return extractData<OverbookingAlert>(response.data);
  },

  // ===== REPORTS & DASHBOARD =====

  getReport: async (
    startDate: string,
    endDate: string,
    roomTypeId?: number
  ): Promise<OverbookingReport> => {
    const params: any = { start_date: startDate, end_date: endDate };
    if (roomTypeId) params.room_type_id = roomTypeId;
    const response = await apiClient.get('/api/v1/overbooking/report', {
      params,
    });
    return extractData<OverbookingReport>(response.data);
  },

  getDashboard: async (): Promise<OverbookingDashboard> => {
    const response = await apiClient.get('/api/v1/overbooking/dashboard');
    return extractData<OverbookingDashboard>(response.data);
  },
};
