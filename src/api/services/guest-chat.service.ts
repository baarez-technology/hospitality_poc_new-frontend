/**
 * Guest Chat Service
 * Frontend service for the new robust Guest AI Chat API
 *
 * This service provides:
 * - Authentication-required chat endpoints
 * - Session persistence
 * - Conversation history
 * - Hotel info retrieval
 */

import { apiClient as api } from '../client';

// Types
export interface QuickAction {
  label: string;
  action: string;
}

export interface ChatMessageRequest {
  message: string;
  session_id?: string;
}

/**
 * Action data returned by the AI for frontend UI rendering
 */
export interface ChatAction {
  type:
    | 'show_room_selection'
    | 'show_room_types_info'
    | 'show_available_rooms'
    | 'show_payment'
    | 'show_booking_details'
    | 'show_bookings_list'
    | 'show_modification_success'
    | 'show_cancellation_success'
    | 'show_precheckin_preferences'
    | 'show_precheckin_rooms'
    | 'show_room_selected'
    | 'show_digital_key'
    | 'show_profile'
    | 'show_profile_updated'
    | 'show_service_request_created'
    | 'show_error';
  data: Record<string, unknown>;
  await_selection?: boolean;
  await_completion?: boolean;
}

export interface RoomTypeOption {
  id: number;
  name: string;
  description?: string;
  base_price: number;
  max_occupancy?: number;
  image_url?: string;
  amenities?: string[];
  available_count?: number;
}

export interface BookingSummary {
  confirmation_code?: string;
  room_type_id?: number;
  room_type_name?: string;
  room_type_image?: string;
  check_in: string;
  check_out: string;
  nights: number;
  adults: number;
  children: number;
  status?: string;
  special_requests?: string;
  total_amount?: number;
  pricing?: {
    nightly_rate: number;
    subtotal: number;
    tax: number;
    total: number;
  };
}

export interface GuestInfo {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  country?: string;
}

export interface PrecheckinRoom {
  id: number;
  number: string;
  floor: number;
  view?: string;
  bed_type?: string;
  ai_score?: number;
  ai_reasoning?: string[];
}

export interface ChatMessageResponse {
  response: string;
  session_id: string;
  conversation_id?: string;
  intent?: string;
  requires_staff_action: boolean;
  action?: ChatAction;
  error?: string;
}

export interface SessionInfoResponse {
  session_id: string;
  status: string;
  created_at: string;
  last_activity: string;
  conversation_count: number;
}

export interface ConversationMessage {
  type: 'user' | 'ai';
  content: string;
  timestamp: string;
  conversation_id: string;
  classification?: string;
}

export interface ConversationHistoryResponse {
  session_id: string;
  messages: ConversationMessage[];
}

export interface HotelInfoResponse {
  hotel_name: string;
  ai_assistant_name: string;
  greeting: string;
  support_phone: string;
  support_email: string;
}

// Admin types
export interface AdminSession {
  session_id: string;
  user_id: number;
  user_name?: string;
  user_email?: string;
  booking_id?: number;
  status: string;
  conversation_count: number;
  created_at: string;
  last_activity: string;
}

export interface AdminSessionsResponse {
  sessions: AdminSession[];
  total: number;
  limit: number;
  offset: number;
}

export interface AdminConversation {
  conversation_id: string;
  user_query: string;
  bot_response: string;
  classification: string;
  requires_staff_action: boolean;
  staff_task_id?: number;
  extra_data?: Record<string, unknown>;
  created_at: string;
}

export interface AdminSessionDetailResponse {
  session: {
    session_id: string;
    user_id: number;
    user_name?: string;
    user_email?: string;
    booking_id?: number;
    status: string;
    created_at: string;
    last_activity: string;
    conversations: AdminConversation[];
  };
}

export interface PendingAction {
  conversation_id: string;
  session_id: string;
  user_name?: string;
  user_email?: string;
  user_query: string;
  bot_response: string;
  classification: string;
  staff_task_id?: number;
  created_at: string;
}

/**
 * Guest Chat Service
 *
 * Uses the new /api/v1/guest-chat endpoints with proper
 * session management and authentication.
 */
class GuestChatService {
  private baseUrl = '/api/v1/guest-chat';

  /**
   * Send a chat message to the Guest AI Assistant
   * Requires authentication
   */
  async chat(request: ChatMessageRequest): Promise<ChatMessageResponse> {
    const response = await api.post<ChatMessageResponse>(`${this.baseUrl}/chat`, request);
    return response.data;
  }

  /**
   * Get current session info
   * Requires authentication
   */
  async getSession(): Promise<SessionInfoResponse> {
    const response = await api.get<SessionInfoResponse>(`${this.baseUrl}/session`);
    return response.data;
  }

  /**
   * Get conversation history for a session
   * Requires authentication
   */
  async getHistory(sessionId?: string, limit: number = 20): Promise<ConversationHistoryResponse> {
    const params = new URLSearchParams();
    if (sessionId) params.append('session_id', sessionId);
    params.append('limit', limit.toString());

    const response = await api.get<ConversationHistoryResponse>(
      `${this.baseUrl}/history?${params.toString()}`
    );
    return response.data;
  }

  /**
   * Close the current chat session
   * Requires authentication
   */
  async closeSession(): Promise<{ message: string; session_id: string }> {
    const response = await api.post<{ message: string; session_id: string }>(
      `${this.baseUrl}/session/close`
    );
    return response.data;
  }

  /**
   * Get public hotel info for the chat interface
   * Does not require authentication
   */
  async getHotelInfo(): Promise<HotelInfoResponse> {
    const response = await api.get<HotelInfoResponse>(`${this.baseUrl}/info`);
    return response.data;
  }

  // ============================================================================
  // Admin Endpoints
  // ============================================================================

  /**
   * Get all chat sessions (Admin only)
   */
  async adminGetSessions(
    status?: string,
    limit: number = 50,
    offset: number = 0
  ): Promise<AdminSessionsResponse> {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    params.append('limit', limit.toString());
    params.append('offset', offset.toString());

    const response = await api.get<AdminSessionsResponse>(
      `${this.baseUrl}/admin/sessions?${params.toString()}`
    );
    return response.data;
  }

  /**
   * Get full conversation for a session (Admin only)
   */
  async adminGetSessionConversation(sessionId: string): Promise<AdminSessionDetailResponse> {
    const response = await api.get<AdminSessionDetailResponse>(
      `${this.baseUrl}/admin/sessions/${sessionId}`
    );
    return response.data;
  }

  /**
   * Get conversations requiring staff action (Admin only)
   */
  async adminGetPendingActions(limit: number = 50): Promise<{ conversations: PendingAction[]; count: number }> {
    const params = new URLSearchParams();
    params.append('limit', limit.toString());

    const response = await api.get<{ conversations: PendingAction[]; count: number }>(
      `${this.baseUrl}/admin/pending-actions?${params.toString()}`
    );
    return response.data;
  }
}

// Export singleton instance
export const guestChatService = new GuestChatService();
export default guestChatService;
