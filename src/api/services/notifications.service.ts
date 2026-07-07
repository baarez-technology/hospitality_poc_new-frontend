import { apiClient } from '../client';

// ============== TYPES ==============

export interface StaffNotification {
  id: number;
  staff_id: number;
  task_id?: number;
  notification_type: string;
  title: string;
  message: string;
  is_read: boolean;
  read_at?: string;
  created_at: string;
  /** Guest ID for guest-related notifications (check-in, check-out, etc.) */
  guest_id?: number | string;
  /** Booking ID for booking-related notifications */
  booking_id?: number | string;
  task?: {
    id: number;
    task_type: string;
    title: string;
    status: string;
    priority: string;
    room_number?: string;
  };
}

export interface NotificationCreate {
  staff_id: number;
  task_id?: number;
  notification_type?: string;
  title: string;
  message: string;
}

export interface NotificationStats {
  total: number;
  unread: number;
  by_type: Record<string, number>;
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

export const notificationsService = {
  // Get all notifications for current user
  getNotifications: async (filters?: {
    is_read?: boolean;
    notification_type?: string;
    limit?: number;
    offset?: number;
  }): Promise<StaffNotification[]> => {
    const response = await apiClient.get('/api/v1/notifications', { params: filters });
    return extractData<StaffNotification[]>(response.data);
  },

  // Get unread count
  getUnreadCount: async (): Promise<{ unread_count: number }> => {
    const response = await apiClient.get('/api/v1/notifications/unread-count');
    return extractData<{ unread_count: number }>(response.data);
  },

  // Get notification statistics
  getStats: async (): Promise<NotificationStats> => {
    const response = await apiClient.get('/api/v1/notifications/stats');
    return extractData<NotificationStats>(response.data);
  },

  // Get single notification
  getNotification: async (notificationId: number): Promise<StaffNotification> => {
    const response = await apiClient.get(`/api/v1/notifications/${notificationId}`);
    return extractData<StaffNotification>(response.data);
  },

  // Create notification (admin use)
  createNotification: async (data: NotificationCreate): Promise<StaffNotification> => {
    const response = await apiClient.post('/api/v1/notifications', data);
    return extractData<StaffNotification>(response.data);
  },

  // Update notification (mark read/unread)
  updateNotification: async (
    notificationId: number,
    data: { is_read?: boolean }
  ): Promise<StaffNotification> => {
    const response = await apiClient.patch(`/api/v1/notifications/${notificationId}`, data);
    return extractData<StaffNotification>(response.data);
  },

  // Mark single notification as read
  markAsRead: async (notificationId: number): Promise<StaffNotification> => {
    const response = await apiClient.post(`/api/v1/notifications/${notificationId}/read`);
    return extractData<StaffNotification>(response.data);
  },

  // Mark all notifications as read
  markAllAsRead: async (): Promise<{ message: string }> => {
    const response = await apiClient.post('/api/v1/notifications/mark-all-read');
    return extractData<{ message: string }>(response.data);
  },

  // Delete single notification
  deleteNotification: async (notificationId: number): Promise<{ message: string }> => {
    const response = await apiClient.delete(`/api/v1/notifications/${notificationId}`);
    return extractData<{ message: string }>(response.data);
  },

  // Delete all notifications
  deleteAllNotifications: async (onlyRead?: boolean): Promise<{ message: string }> => {
    const response = await apiClient.delete('/api/v1/notifications', {
      params: onlyRead ? { only_read: true } : undefined
    });
    return extractData<{ message: string }>(response.data);
  },
};
