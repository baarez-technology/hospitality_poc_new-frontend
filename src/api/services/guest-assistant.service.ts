import { apiClient } from '../client';

// ============== Types ==============

export interface QuickAction {
  label: string;
  action: string;
}

// Flow state for multi-step conversations
export interface FlowStateResponse {
  flow_type?: string;
  current_step: number;
  total_steps: number;
  step_label: string;
  progress: number;
  can_go_back: boolean;
  can_cancel: boolean;
}

// Room search result from API
export interface RoomSearchResultResponse {
  id: number;
  name: string;
  slug: string;
  price_per_night: number;
  available_count: number;
  max_occupancy: number;
  description?: string;
}

// Profile info from API
export interface ProfileInfoResponse {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  country?: string;
  loyalty_tier?: string;
  loyalty_points?: number;
  total_stays?: number;
}

// Booking list item from API
export interface BookingListItemResponse {
  id: number;
  confirmation_code: string;
  arrival_date: string;
  departure_date: string;
  status: string;
  room_type_name?: string;
  total_price?: number;
}

// Pre-checkin info from API
export interface PrecheckinInfoResponse {
  status: string;
  room_number?: string;
  step?: string;
  progress?: number;
  recommended_rooms?: Array<{
    id: number;
    room_number: string;
    score: number;
  }>;
}

export interface ChatMessageRequest {
  message: string;
  session_id?: string;
  room_number?: string;
  booking_number?: string;
}

export interface ChatMessageResponse {
  response: string;
  intent: string;
  confidence: number;
  requires_staff_action: boolean;
  session_id: string;
  faq_id?: string;
  staff_task_id?: number;
  task_type?: string;
  assigned_staff_name?: string;
  estimated_response_time?: number;
  // Enhanced task details
  task_priority?: 'critical' | 'high' | 'medium' | 'low';
  task_title?: string;
  task_description?: string;
  task_category?: string;
  detected_issue?: string;
  required_skills?: string[];
  assigned_staff_role?: string;
  booking_info?: {
    confirmation_code: string;
    room_number?: string;
    guest_name?: string;
    checkout?: string;
    status?: string;
  };
  quick_actions?: QuickAction[];
  needs_booking?: boolean;
  // New comprehensive AGI fields
  room_search_results?: RoomSearchResultResponse[];
  profile_info?: ProfileInfoResponse;
  bookings_list?: BookingListItemResponse[];
  precheckin_info?: PrecheckinInfoResponse;
  flow_state?: FlowStateResponse;
  requires_auth?: boolean;
  auth_error?: string;
  action_result?: Record<string, unknown>;
}

export interface BookingLookupRequest {
  booking_number: string;
}

export interface BookingLookupResponse {
  found: boolean;
  booking_info?: {
    id: number;
    confirmation_code: string;
    booking_number: string;
    guest_name: string;
    guest_id: number;
    room_number?: string;
    room_id?: number;
    arrival_date: string;
    departure_date: string;
    status: string;
    is_checked_in: boolean;
  };
  message: string;
}

export interface ConversationHistoryItem {
  id: number;
  conversation_id: string;
  user_query: string;
  bot_response: string;
  classification: string;
  room_number?: string;
  created_at: string;
}

export interface ConversationHistoryResponse {
  conversations: ConversationHistoryItem[];
  total: number;
}

export interface TaskStatusResponse {
  id: number;
  task_type: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  room_number?: string;
  assigned_to?: number;
  assigned_staff_name?: string;
  scheduled_for?: string;
  started_at?: string;
  completed_at?: string;
  estimated_duration?: number;
  created_at: string;
}

export interface ChatSession {
  session_id: string;
  room_number?: string;
  status: string;
  created_at: string;
  last_activity: string;
}

// ============== Service ==============

export const guestAssistantService = {
  /**
   * Send a message to the guest assistant chatbot
   */
  async sendMessage(payload: ChatMessageRequest): Promise<ChatMessageResponse> {
    const response = await apiClient.post<ChatMessageResponse>(
      '/api/v1/guest-assistant/chat',
      payload
    );
    return response.data;
  },

  /**
   * Look up a booking by confirmation number
   */
  async lookupBooking(bookingNumber: string): Promise<BookingLookupResponse> {
    const response = await apiClient.post<BookingLookupResponse>(
      '/api/v1/guest-assistant/lookup-booking',
      { booking_number: bookingNumber }
    );
    return response.data;
  },

  /**
   * Get conversation history for a session
   */
  async getHistory(sessionId: string, limit: number = 50): Promise<ConversationHistoryResponse> {
    const response = await apiClient.get<ConversationHistoryResponse>(
      `/api/v1/guest-assistant/history/${sessionId}`,
      { params: { limit } }
    );
    return response.data;
  },

  /**
   * Get all chat sessions for current user
   */
  async getSessions(): Promise<ChatSession[]> {
    const response = await apiClient.get<ChatSession[]>('/api/v1/guest-assistant/sessions');
    return response.data;
  },

  /**
   * Get status of a staff task
   */
  async getTaskStatus(taskId: number): Promise<TaskStatusResponse> {
    const response = await apiClient.get<TaskStatusResponse>(
      `/api/v1/guest-assistant/tasks/${taskId}`
    );
    return response.data;
  },

  /**
   * Update task status (for staff)
   */
  async updateTaskStatus(
    taskId: number,
    newStatus: string,
    notes?: string
  ): Promise<{ success: boolean; task_id: number; old_status: string; new_status: string; updated_at: string }> {
    const response = await apiClient.patch(
      `/api/v1/guest-assistant/tasks/${taskId}/status`,
      null,
      { params: { new_status: newStatus, notes } }
    );
    return response.data;
  },

  /**
   * Get pending tasks (for staff)
   */
  async getPendingTasks(
    department?: string,
    priority?: string,
    limit: number = 20
  ): Promise<Array<{
    id: number;
    task_type: string;
    title: string;
    status: string;
    priority: string;
    room_number?: string;
    assigned_to?: number;
    scheduled_for?: string;
    created_at: string;
  }>> {
    const response = await apiClient.get('/api/v1/guest-assistant/pending-tasks', {
      params: { department, priority, limit }
    });
    return response.data;
  },
};
