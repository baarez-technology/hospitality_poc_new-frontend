/**
 * Admin AI Service
 * Frontend service for communicating with the Admin AI Assistant API
 * Includes voice transcription via Whisper
 */

import { apiClient as api } from '../client';

// Voice transcription types
export interface VoiceTranscriptionRequest {
  audio_base64: string;
  audio_format: string;
  language?: string;
}

export interface VoiceTranscriptionResponse {
  success: boolean;
  text?: string;
  language?: string;
  confidence?: number;
  duration?: number;
  error?: string;
  message?: string;
}

// Types
export interface AdminAIChatRequest {
  message: string;
  session_id?: string;
  context?: {
    currentPage?: string;
    currentModule?: string;
    selectedBookingId?: number;
    selectedGuestId?: number;
    selectedRoomId?: number;
    selectedStaffId?: number;
    activeFilters?: Record<string, unknown>;
    userRole?: string;
    businessDate?: string;
    selectedItems?: string[];
    previousMessages?: Array<{ role: string; content: string }>;
    pendingAction?: {
      action_id: string;
      action_type: string;
      description: string;
      params: Record<string, unknown>;
    };
  };
}

export interface PendingAction {
  action_id: string;
  action_type: string;
  description: string;
  params: Record<string, unknown>;
}

export interface ActionResult {
  action_id: string;
  success: boolean;
  message: string;
  data?: Record<string, unknown>;
}

export interface QueryMetadata {
  total_count?: number;
  truncated?: boolean;
  query?: string;
  filter?: string;
}

export interface ChartDataSet {
  label: string;
  data: number[];
}

export interface ChartData {
  chart_type: 'line' | 'bar' | 'pie' | 'doughnut';
  title: string;
  labels: string[];
  datasets: ChartDataSet[];
}

export interface AdminAIChatResponse {
  message: string;
  intent: string;
  confidence: number;
  session_id: string;
  query_results?: Array<Record<string, unknown>>;
  query_metadata?: QueryMetadata;
  pending_action?: PendingAction;
  action_result?: ActionResult;
  suggestions?: string[];
  audit_id?: number;
  error?: string;
  chart_data?: ChartData;
  // Multi-agent architecture fields
  intents_detected?: string[];
  auto_filled_params?: string[];
  context_entities?: Record<string, unknown>;
}

export interface AdminAIExecuteRequest {
  action_id: string;
}

export interface AuditLogEntry {
  id: number;
  session_id: string;
  user_id: number;
  action_type: string;
  input_message: string;
  detected_intent: string;
  confidence: number;
  success: boolean;
  error_message?: string;
  execution_time_ms: number;
  injection_detected: boolean;
  blocked: boolean;
  created_at: string;
}

export interface AuditLogResponse {
  entries: AuditLogEntry[];
  total_count: number;
  page: number;
  page_size: number;
}

export interface CapabilityItem {
  name: string;
  examples: string[];
}

export interface CapabilityCategory {
  category: string;
  items: CapabilityItem[];
}

export interface CapabilitiesResponse {
  version: string;
  capabilities: CapabilityCategory[];
  intents: string[];
}

export interface ConversationMessage {
  id: number;
  session_id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  intent?: string;
  has_query_results: boolean;
  has_pending_action: boolean;
  action_id?: string;
  created_at: string;
}

export interface ConversationHistoryResponse {
  messages: ConversationMessage[];
  session_id: string;
  error?: string;
}

// Admin AI Service
class AdminAIService {
  private baseUrl = '/api/v1/admin-ai';

  /**
   * Send a message to the Admin AI
   */
  async chat(request: AdminAIChatRequest): Promise<AdminAIChatResponse> {
    try {
      const response = await api.post<AdminAIChatResponse>(
        `${this.baseUrl}/chat`,
        request
      );
      return response.data;
    } catch (error: any) {
      console.error('Admin AI chat error:', error);

      // Provide more helpful error messages
      let errorMessage = 'Failed to communicate with AI assistant';
      const status = error.response?.status;
      const detail = error.response?.data?.detail;

      if (status === 401 || status === 403) {
        errorMessage = 'Please log in again to use the AI assistant.';
      } else if (status === 404) {
        errorMessage = 'AI service is not available. Please check the server.';
      } else if (detail) {
        errorMessage = detail;
      } else if (error.message === 'Network Error') {
        errorMessage = 'Network error. Please check your connection.';
      }

      return {
        message: errorMessage,
        intent: 'error',
        confidence: 0,
        session_id: request.session_id || '',
        error: error.message,
      };
    }
  }

  /**
   * Execute a confirmed action
   */
  async executeAction(actionId: string): Promise<AdminAIChatResponse> {
    try {
      const response = await api.post<AdminAIChatResponse>(
        `${this.baseUrl}/execute`,
        { action_id: actionId }
      );
      return response.data;
    } catch (error: any) {
      console.error('Admin AI execute error:', error);
      return {
        message: error.response?.data?.detail || 'Failed to execute action',
        intent: 'error',
        confidence: 0,
        session_id: '',
        error: error.message,
      };
    }
  }

  /**
   * Get conversation history for a session
   */
  async getHistory(sessionId: string, limit: number = 50): Promise<ConversationHistoryResponse> {
    try {
      const response = await api.get<ConversationHistoryResponse>(
        `${this.baseUrl}/history/${sessionId}`,
        { params: { limit } }
      );
      return response.data;
    } catch (error: any) {
      console.error('Admin AI history error:', error);
      return {
        messages: [],
        session_id: sessionId,
        error: error.message,
      };
    }
  }

  /**
   * Get audit log
   */
  async getAuditLog(options: {
    page?: number;
    pageSize?: number;
    userId?: number;
    actionType?: string;
    successOnly?: boolean;
    blockedOnly?: boolean;
  } = {}): Promise<AuditLogResponse> {
    try {
      const response = await api.get<AuditLogResponse>(
        `${this.baseUrl}/audit`,
        {
          params: {
            page: options.page || 1,
            page_size: options.pageSize || 50,
            user_id: options.userId,
            action_type: options.actionType,
            success_only: options.successOnly,
            blocked_only: options.blockedOnly,
          },
        }
      );
      return response.data;
    } catch (error: any) {
      console.error('Admin AI audit error:', error);
      return {
        entries: [],
        total_count: 0,
        page: 1,
        page_size: 50,
      };
    }
  }

  /**
   * Get AI capabilities
   */
  async getCapabilities(): Promise<CapabilitiesResponse> {
    try {
      const response = await api.get<CapabilitiesResponse>(
        `${this.baseUrl}/capabilities`
      );
      return response.data;
    } catch (error: any) {
      console.error('Admin AI capabilities error:', error);
      return {
        version: '1.0',
        capabilities: [],
        intents: [],
      };
    }
  }

  /**
   * Submit feedback for an AI response
   */
  async submitFeedback(
    sessionId: string,
    rating: number,
    feedback?: string,
    messageId?: number
  ): Promise<{ success: boolean; message: string }> {
    try {
      const response = await api.post<{ success: boolean; message: string }>(
        `${this.baseUrl}/feedback`,
        null,
        {
          params: {
            session_id: sessionId,
            rating,
            feedback,
            message_id: messageId,
          },
        }
      );
      return response.data;
    } catch (error: any) {
      console.error('Admin AI feedback error:', error);
      return {
        success: false,
        message: error.message,
      };
    }
  }

  /**
   * Generate a new session ID
   */
  generateSessionId(): string {
    return `admin_ai_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Transcribe audio to text using Whisper via AGI endpoint
   */
  async transcribeAudio(request: VoiceTranscriptionRequest): Promise<VoiceTranscriptionResponse> {
    try {
      const response = await api.post<VoiceTranscriptionResponse>(
        '/api/v1/agi/voice/transcribe',
        {
          audio_base64: request.audio_base64,
          audio_format: request.audio_format,
          language: request.language
        }
      );
      return response.data;
    } catch (error: any) {
      console.error('Voice transcription error:', error);
      return {
        success: false,
        error: error.message,
        message: 'Failed to transcribe audio. Please try again or type your message.'
      };
    }
  }

  /**
   * Helper: Convert Blob to Base64
   */
  async blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        // Remove data URL prefix if present
        const base64Data = base64.includes(',') ? base64.split(',')[1] : base64;
        resolve(base64Data);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  /**
   * Chat with voice input - transcribe and send to AI
   */
  async chatWithVoice(
    audioBlob: Blob,
    audioFormat: string = 'webm',
    sessionId?: string,
    context?: AdminAIChatRequest['context']
  ): Promise<{ transcription: VoiceTranscriptionResponse; aiResponse?: AdminAIChatResponse }> {
    try {
      // First, transcribe the audio
      const base64Audio = await this.blobToBase64(audioBlob);
      const transcription = await this.transcribeAudio({
        audio_base64: base64Audio,
        audio_format: audioFormat
      });

      if (!transcription.success || !transcription.text) {
        return { transcription };
      }

      // Then send the transcribed text to the AI
      const aiResponse = await this.chat({
        message: transcription.text,
        session_id: sessionId,
        context
      });

      return { transcription, aiResponse };
    } catch (error: any) {
      console.error('Voice chat error:', error);
      return {
        transcription: {
          success: false,
          error: error.message,
          message: 'Failed to process voice input.'
        }
      };
    }
  }
}

export const adminAIService = new AdminAIService();
export default adminAIService;
