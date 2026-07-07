/**
 * AGI Assistant Service
 * Frontend service for communicating with the AGI Guest Assistant API
 */

import { apiClient as api } from '../client';

// Types
export interface QuickAction {
  label: string;
  action: string;
}

export interface AGIChatRequest {
  message: string;
  session_id?: string;
  room_number?: string;
  booking_number?: string;
  voice_input?: boolean;
}

export interface AGIChatResponse {
  message: string;
  intent: string;
  confidence: number;
  session_id: string;
  action_taken: boolean;
  action_result?: Record<string, unknown>;
  task_id?: number;
  task_type?: string;
  quick_actions?: QuickAction[];
  guest_context?: Record<string, unknown>;
  voice_response_available: boolean;
  follow_up_needed: boolean;
  // V2 AGI fields
  requires_otp?: boolean;
  otp_email?: string;
  show_login_prompt?: boolean;
  booking_created?: number;
  guest_status?: 'anonymous' | 'registered' | 'booked' | 'checked_in' | 'checked_out';
  loyalty_points?: number;
  loyalty_tier?: string;
}

export interface VoiceRequest {
  audio_base64: string;
  audio_format: string;
  session_id?: string;
  room_number?: string;
  booking_number?: string;
}

export interface TranscriptionResponse {
  success: boolean;
  text?: string;
  language?: string;
  confidence: number;
  error?: string;
}

export interface TTSRequest {
  text: string;
  voice?: string;
  speed?: number;
}

export interface TTSResponse {
  text: string;
  audio_base64?: string;
  audio_format: string;
  content_type: string;
}

export interface VoiceInfo {
  name: string;
  description: string;
  gender: string;
}

export interface VoicesResponse {
  success: boolean;
  voices: Record<string, VoiceInfo>;
  default: string;
  recommended_for_hotel: string;
}

export interface ContextResponse {
  success: boolean;
  context: Record<string, unknown>;
}

export interface Capability {
  name: string;
  description: string;
  examples: string[];
}

export interface CapabilitiesResponse {
  capabilities: Capability[];
  voice_enabled: boolean;
  supported_languages: string[];
  availability: string;
}

/**
 * AGI Assistant Service
 */
class AGIAssistantService {
  private baseUrl = '/api/v1/agi';

  /**
   * Send a chat message to the AGI assistant
   */
  async chat(request: AGIChatRequest): Promise<AGIChatResponse> {
    const response = await api.post<AGIChatResponse>(`${this.baseUrl}/chat`, request);
    return response.data;
  }

  /**
   * Transcribe audio to text
   */
  async transcribeAudio(request: VoiceRequest): Promise<TranscriptionResponse> {
    const response = await api.post<TranscriptionResponse>(
      `${this.baseUrl}/voice/transcribe`,
      request
    );
    return response.data;
  }

  /**
   * Send voice input and get AGI response
   */
  async voiceChat(request: VoiceRequest): Promise<AGIChatResponse> {
    const response = await api.post<AGIChatResponse>(`${this.baseUrl}/voice/chat`, request);
    return response.data;
  }

  /**
   * Convert text to speech
   */
  async textToSpeech(request: TTSRequest): Promise<TTSResponse> {
    const response = await api.post<TTSResponse>(`${this.baseUrl}/voice/tts`, request);
    return response.data;
  }

  /**
   * Get available TTS voices
   */
  async getVoices(): Promise<VoicesResponse> {
    const response = await api.get<VoicesResponse>(`${this.baseUrl}/voice/voices`);
    return response.data;
  }

  /**
   * Get supported audio formats
   */
  async getFormats(): Promise<Record<string, unknown>> {
    const response = await api.get<Record<string, unknown>>(`${this.baseUrl}/voice/formats`);
    return response.data;
  }

  /**
   * Get session context
   */
  async getContext(sessionId: string): Promise<ContextResponse> {
    const response = await api.get<ContextResponse>(`${this.baseUrl}/context/${sessionId}`);
    return response.data;
  }

  /**
   * Clear session context
   */
  async clearContext(sessionId: string): Promise<{ success: boolean; message: string }> {
    const response = await api.post<{ success: boolean; message: string }>(
      `${this.baseUrl}/context/${sessionId}/clear`
    );
    return response.data;
  }

  /**
   * Submit feedback about AGI interaction
   */
  async submitFeedback(
    sessionId: string,
    rating: number,
    feedback?: string
  ): Promise<{ success: boolean; message: string }> {
    const response = await api.post<{ success: boolean; message: string }>(
      `${this.baseUrl}/feedback`,
      null,
      { params: { session_id: sessionId, rating, feedback } }
    );
    return response.data;
  }

  /**
   * Get AGI capabilities
   */
  async getCapabilities(): Promise<CapabilitiesResponse> {
    const response = await api.get<CapabilitiesResponse>(`${this.baseUrl}/capabilities`);
    return response.data;
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
   * Helper: Play audio from base64
   */
  playAudioFromBase64(base64Audio: string, format: string = 'mp3'): Promise<void> {
    return new Promise((resolve, reject) => {
      const audio = new Audio(`data:audio/${format};base64,${base64Audio}`);
      audio.onended = () => resolve();
      audio.onerror = (e) => reject(e);
      audio.play().catch(reject);
    });
  }
}

// Export singleton instance
export const agiAssistantService = new AGIAssistantService();
export default agiAssistantService;
