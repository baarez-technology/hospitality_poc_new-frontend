/**
 * AGI Chat Context
 * Advanced context for the AGI Guest Assistant with robust session management
 *
 * Features:
 * - Authentication required
 * - Server-side session persistence
 * - Conversation history sync
 * - Hotel configuration integration
 * - Voice support
 */

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useRef,
  useCallback,
} from 'react';
import { useAuth } from '@/hooks/useAuth';
import {
  guestChatService,
  HotelInfoResponse,
  ChatAction,
  RoomTypeOption,
  BookingSummary,
  GuestInfo,
  PrecheckinRoom,
} from '@/api/services/guest-chat.service';
import { agiAssistantService, QuickAction } from '@/api/services/agi-assistant.service';

// ============== Types ==============

export interface AGIMessage {
  id: string;
  type: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  intent?: string;
  confidence?: number;
  quickActions?: QuickAction[];
  taskInfo?: {
    taskId: number;
    taskType: string;
    status?: string;
  };
  actionResult?: Record<string, unknown>;
  isVoice?: boolean;
  isError?: boolean;
  requiresOtp?: boolean;
  otpEmail?: string;
  showLoginPrompt?: boolean;
  bookingCreated?: number;
  conversationId?: string;
  // Action-based UI rendering
  action?: ChatAction;
}

export interface GuestContext {
  sessionId: string;
  guestName?: string;
  roomNumber?: string;
  confirmationCode?: string;
  isCheckedIn?: boolean;
  checkOutDate?: string;
  loyaltyTier?: string;
  loyaltyPoints?: number;
  emotion?: string;
  guestStatus?: 'anonymous' | 'registered' | 'booked' | 'checked_in' | 'checked_out';
}

interface AGIChatContextType {
  messages: AGIMessage[];
  isOpen: boolean;
  isTyping: boolean;
  isRecording: boolean;
  isPlayingAudio: boolean;
  unreadCount: number;
  sessionId: string | null;
  guestContext: GuestContext | null;
  voiceEnabled: boolean;
  hotelInfo: HotelInfoResponse | null;
  isAuthenticated: boolean;
  sendMessage: (content: string) => Promise<void>;
  sendVoiceMessage: (audioBlob: Blob) => Promise<void>;
  toggleChat: () => void;
  openChat: () => void;
  closeChat: () => void;
  clearHistory: () => void;
  setGuestContext: (context: Partial<GuestContext>) => void;
  handleQuickAction: (action: string) => void;
  setVoiceEnabled: (enabled: boolean) => void;
  playResponse: (text: string) => Promise<void>;
  stopAudio: () => void;
  // Action handlers for interactive UI components
  handleActionSelection: (actionType: string, selection: Record<string, unknown>) => Promise<void>;
}

const AGIChatContext = createContext<AGIChatContextType | undefined>(undefined);

export const useAGIChat = () => {
  const context = useContext(AGIChatContext);
  if (!context) {
    throw new Error('useAGIChat must be used within an AGIChatProvider');
  }
  return context;
};

// ============== Constants ==============

const VOICE_ENABLED_KEY = 'glimmora_agi_voice_enabled';
const LOCAL_MESSAGES_KEY = 'glimmora_chat_messages';

// ============== Provider ==============

interface AGIChatProviderProps {
  children: ReactNode;
}

export const AGIChatProvider = ({ children }: AGIChatProviderProps) => {
  const { isAuthenticated, user } = useAuth();
  const [messages, setMessages] = useState<AGIMessage[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [guestContext, setGuestContextState] = useState<GuestContext | null>(null);
  const [voiceEnabled, setVoiceEnabledState] = useState(false);
  const [hotelInfo, setHotelInfo] = useState<HotelInfoResponse | null>(null);
  const sessionIdRef = useRef<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const initializedRef = useRef(false);

  // Load hotel info on mount
  useEffect(() => {
    const loadHotelInfo = async () => {
      try {
        const info = await guestChatService.getHotelInfo();
        setHotelInfo(info);
      } catch (e) {
        console.error('Failed to load hotel info:', e);
      }
    };
    loadHotelInfo();
  }, []);

  // Load voice preference
  useEffect(() => {
    const voicePref = localStorage.getItem(VOICE_ENABLED_KEY);
    if (voicePref) {
      setVoiceEnabledState(voicePref === 'true');
    }
  }, []);

  // Track previous auth state to detect login/logout
  const wasAuthenticatedRef = useRef<boolean | null>(null);

  // Initialize when authentication state changes
  useEffect(() => {
    const initialize = async () => {
      // Detect auth state change (login/logout)
      const authStateChanged = wasAuthenticatedRef.current !== null &&
                               wasAuthenticatedRef.current !== isAuthenticated;

      // If auth state changed, reset initialization
      if (authStateChanged) {
        initializedRef.current = false;
        sessionIdRef.current = null;
      }

      wasAuthenticatedRef.current = isAuthenticated;

      // Skip if already initialized with messages
      if (initializedRef.current && messages.length > 0 && !authStateChanged) return;

      if (isAuthenticated) {
        // Load session from server
        try {
          const sessionInfo = await guestChatService.getSession();
          sessionIdRef.current = sessionInfo.session_id;

          // Load conversation history
          const history = await guestChatService.getHistory(sessionInfo.session_id, 20);

          if (history.messages && history.messages.length > 0) {
            const loadedMessages: AGIMessage[] = history.messages.map((msg, idx) => ({
              id: `${msg.type}_${idx}_${Date.now()}`,
              type: msg.type === 'user' ? 'user' : 'assistant',
              content: msg.content,
              timestamp: new Date(msg.timestamp),
              conversationId: msg.conversation_id,
              intent: msg.classification,
            }));
            setMessages(loadedMessages);
          } else {
            showWelcomeMessage();
          }

          initializedRef.current = true;
        } catch (e) {
          console.error('Failed to load session:', e);
          showWelcomeMessage();
          initializedRef.current = true;
        }
      } else {
        // Not authenticated - show login prompt
        showLoginRequiredMessage();
        initializedRef.current = true;
      }
    };

    initialize();
  }, [isAuthenticated]);

  // Unread count management
  useEffect(() => {
    if (!isOpen && messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.type === 'assistant') {
        setUnreadCount((prev) => prev + 1);
      }
    }
  }, [messages, isOpen]);

  useEffect(() => {
    if (isOpen) {
      setUnreadCount(0);
    }
  }, [isOpen]);

  const showLoginRequiredMessage = () => {
    const aiName = hotelInfo?.ai_assistant_name || 'Aria';
    const hotelName = hotelInfo?.hotel_name || 'J Park Inn';

    const welcomeMessage: AGIMessage = {
      id: `welcome_${Date.now()}`,
      type: 'assistant',
      content: `Hello! I'm ${aiName}, your AI concierge at ${hotelName}.\n\nTo provide you with personalized assistance, please sign in to your account.\n\nOnce logged in, I can help you with:\n• 📅 View and manage your bookings\n• ✈️ Pre-check-in & room selection\n• 🛎️ Service requests (housekeeping, maintenance)\n• ❓ Hotel information & FAQs\n\nPlease log in to continue.`,
      timestamp: new Date(),
      showLoginPrompt: true,
      quickActions: [
        { label: 'Sign In', action: 'login' },
        { label: 'Hotel Info', action: 'What amenities do you offer?' },
      ],
    };
    setMessages([welcomeMessage]);
  };

  const showWelcomeMessage = () => {
    const guestName = user?.first_name || guestContext?.guestName || 'there';
    const aiName = hotelInfo?.ai_assistant_name || 'Aria';
    const hotelName = hotelInfo?.hotel_name || 'J Park Inn';

    let content = `Hello ${guestName}! I'm ${aiName}, your AI concierge at ${hotelName}.\n\n`;
    content += `I can help you with:\n`;
    content += `• 📅 View & manage your bookings\n`;
    content += `• ✈️ Pre-check-in & room selection\n`;
    content += `• 🛎️ Housekeeping & room service\n`;
    content += `• 🔧 Maintenance requests\n`;
    content += `• ❓ Hotel information & FAQs\n\n`;
    content += `How may I assist you today?`;

    const quickActions: QuickAction[] = [
      { label: 'My Bookings', action: 'Show my bookings' },
      { label: 'Pre-Check-in', action: 'I want to do pre-check-in' },
      { label: 'Hotel Info', action: 'What amenities do you offer?' },
    ];

    const welcomeMessage: AGIMessage = {
      id: `welcome_${Date.now()}`,
      type: 'assistant',
      content,
      timestamp: new Date(),
      quickActions,
    };
    setMessages([welcomeMessage]);
  };

  const addMessage = useCallback((message: Omit<AGIMessage, 'id' | 'timestamp'>) => {
    const newMessage: AGIMessage = {
      ...message,
      id: `${message.type}_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, newMessage]);
    return newMessage;
  }, []);

  const sendMessage = async (content: string) => {
    if (!content.trim()) return;

    // Check if user needs to login
    if (!isAuthenticated) {
      if (content.toLowerCase() === 'login') {
        window.location.href = '/login?redirect=' + encodeURIComponent(window.location.pathname);
        return;
      }

      // Allow some basic queries without login
      const publicQueries = ['amenities', 'hours', 'location', 'contact', 'check-in time', 'checkout time'];
      const isPublicQuery = publicQueries.some((q) => content.toLowerCase().includes(q));

      if (!isPublicQuery) {
        addMessage({ type: 'user', content: content.trim() });
        addMessage({
          type: 'assistant',
          content: 'To help you with that request, please sign in to your account first.',
          showLoginPrompt: true,
          quickActions: [{ label: 'Sign In', action: 'login' }],
        });
        return;
      }
    }

    // Add user message
    addMessage({ type: 'user', content: content.trim() });
    setIsTyping(true);

    try {
      const response = await guestChatService.chat({
        message: content.trim(),
        session_id: sessionIdRef.current || undefined,
      });

      // Update session ID
      if (response.session_id && response.session_id !== sessionIdRef.current) {
        sessionIdRef.current = response.session_id;
      }

      // Build assistant message
      const assistantMessage: Omit<AGIMessage, 'id' | 'timestamp'> = {
        type: 'assistant',
        content: response.response,
        intent: response.intent,
        conversationId: response.conversation_id,
        action: response.action, // Include action for UI rendering
      };

      // Add quick actions based on intent (if no action UI is shown)
      if (!response.action) {
        const quickActions = buildQuickActions(response.intent);
        if (quickActions.length > 0) {
          assistantMessage.quickActions = quickActions;
        }
      }

      addMessage(assistantMessage);

      // Auto-play voice response if enabled
      if (voiceEnabled && response.response.length < 500) {
        playResponse(response.response);
      }
    } catch (error: any) {
      console.error('Error sending message:', error);

      // Check for auth error
      if (error.response?.status === 401) {
        addMessage({
          type: 'assistant',
          content: 'Your session has expired. Please sign in again to continue.',
          showLoginPrompt: true,
          isError: true,
        });
      } else {
        const supportPhone = hotelInfo?.support_phone || '+1 (310) 555-2847';
        addMessage({
          type: 'assistant',
          content: `I apologize, but I'm experiencing technical difficulties. Please try again or contact our front desk at ${supportPhone}.`,
          isError: true,
          quickActions: [
            { label: 'Try Again', action: 'retry' },
            { label: 'Contact Front Desk', action: 'front_desk' },
          ],
        });
      }
    } finally {
      setIsTyping(false);
    }
  };

  const buildQuickActions = (intent?: string): QuickAction[] => {
    if (!intent) return [];

    switch (intent) {
      case 'check_bookings':
        return [
          { label: 'Pre-Check-in', action: 'I want to do pre-check-in' },
          { label: 'Modify Booking', action: 'I want to modify my booking' },
        ];
      case 'booking_lookup':
        return [
          { label: 'Pre-Check-in', action: 'I want to do pre-check-in for this booking' },
          { label: 'Cancel Booking', action: 'I want to cancel this booking' },
        ];
      case 'pre_checkin':
        return [{ label: 'My Bookings', action: 'Show my bookings' }];
      case 'make_request':
        return [
          { label: 'More Requests', action: 'I have another request' },
          { label: 'My Bookings', action: 'Show my bookings' },
        ];
      default:
        return [];
    }
  };

  const sendVoiceMessage = async (audioBlob: Blob) => {
    setIsRecording(false);
    setIsTyping(true);

    try {
      // Convert blob to base64
      const base64Audio = await agiAssistantService.blobToBase64(audioBlob);

      // Get audio format from blob type
      const format = audioBlob.type.includes('webm')
        ? 'webm'
        : audioBlob.type.includes('ogg')
        ? 'ogg'
        : 'webm';

      // Add placeholder for voice message
      addMessage({
        type: 'user',
        content: '🎤 Voice message...',
        isVoice: true,
      });

      // First transcribe
      const transcription = await agiAssistantService.transcribeAudio({
        audio_base64: base64Audio,
        audio_format: format,
        session_id: sessionIdRef.current || undefined,
      });

      if (transcription.success && transcription.text) {
        // Update user message with transcription
        setMessages((prev) => {
          const updated = [...prev];
          const lastUserMsg = updated.findIndex(
            (m) => m.type === 'user' && m.content === '🎤 Voice message...'
          );
          if (lastUserMsg >= 0) {
            updated[lastUserMsg] = {
              ...updated[lastUserMsg],
              content: transcription.text!,
            };
          }
          return updated;
        });

        // Send transcribed text through chat
        const response = await guestChatService.chat({
          message: transcription.text,
          session_id: sessionIdRef.current || undefined,
        });

        if (response.session_id) {
          sessionIdRef.current = response.session_id;
        }

        addMessage({
          type: 'assistant',
          content: response.response,
          intent: response.intent,
          conversationId: response.conversation_id,
        });

        // Auto-play response
        if (voiceEnabled) {
          playResponse(response.response);
        }
      } else {
        addMessage({
          type: 'assistant',
          content: "I couldn't understand your voice message. Please try again or type your request.",
          isError: true,
        });
      }
    } catch (error) {
      console.error('Error processing voice message:', error);
      addMessage({
        type: 'assistant',
        content: "I couldn't process your voice message. Please try again or type your request.",
        isError: true,
      });
    } finally {
      setIsTyping(false);
    }
  };

  const playResponse = async (text: string) => {
    if (!voiceEnabled) return;

    // Stop any currently playing audio before starting new
    stopAudio();

    try {
      setIsPlayingAudio(true);

      const response = await agiAssistantService.textToSpeech({
        text,
        voice: 'nova',
        speed: 1.0,
      });

      if (response.audio_base64) {
        // Create and manage Audio element directly so stopAudio can control it
        const audio = new Audio(
          `data:audio/${response.audio_format || 'mp3'};base64,${response.audio_base64}`
        );
        audioRef.current = audio;

        await new Promise<void>((resolve, reject) => {
          audio.onended = () => resolve();
          audio.onerror = (e) => reject(e);
          audio.play().catch(reject);
        });
      }
    } catch (error) {
      console.error('Error playing audio response:', error);
    } finally {
      audioRef.current = null;
      setIsPlayingAudio(false);
    }
  };

  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }
    // Also cancel any browser speech synthesis
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setIsPlayingAudio(false);
  };

  const handleQuickAction = useCallback(
    (action: string) => {
      switch (action) {
        case 'login':
          window.location.href = '/login?redirect=' + encodeURIComponent(window.location.pathname);
          break;
        case 'retry':
          const lastUserMessage = [...messages].reverse().find((m) => m.type === 'user');
          if (lastUserMessage) {
            sendMessage(lastUserMessage.content);
          }
          break;
        case 'front_desk':
          const phone = hotelInfo?.support_phone || '+1 (310) 555-2847';
          const email = hotelInfo?.support_email || 'support@glimmora.com';
          addMessage({
            type: 'assistant',
            content: `You can reach our front desk at:\n\n• **Phone**: ${phone}\n• **Email**: ${email}\n• Available 24/7\n\nWould you like me to help with anything else?`,
          });
          break;
        default:
          sendMessage(action);
      }
    },
    [messages, sendMessage, addMessage, hotelInfo]
  );

  const toggleChat = () => setIsOpen((prev) => !prev);
  const openChat = () => setIsOpen(true);
  const closeChat = () => setIsOpen(false);

  const clearHistory = async () => {
    stopAudio();

    // Close session on server
    if (isAuthenticated && sessionIdRef.current) {
      try {
        await guestChatService.closeSession();
      } catch (e) {
        console.error('Error closing session:', e);
      }
    }

    // Clear local state
    setMessages([]);
    setGuestContextState(null);
    sessionIdRef.current = null;
    initializedRef.current = false;

    // Show appropriate message
    if (isAuthenticated) {
      showWelcomeMessage();
    } else {
      showLoginRequiredMessage();
    }
  };

  const setGuestContext = (context: Partial<GuestContext>) => {
    setGuestContextState((prev) => ({
      sessionId: sessionIdRef.current || '',
      ...prev,
      ...context,
    }));
  };

  const setVoiceEnabled = (enabled: boolean) => {
    setVoiceEnabledState(enabled);
    localStorage.setItem(VOICE_ENABLED_KEY, String(enabled));
  };

  /**
   * Handle user interaction with action UI components
   * This sends the selection back to the AI as a structured message
   */
  const handleActionSelection = useCallback(
    async (actionType: string, selection: Record<string, unknown>) => {
      // Build a message that tells the AI what the user selected
      let message = '';

      switch (actionType) {
        case 'select_room_type':
          // User selected a room type from booking flow
          message = `I'd like to book the ${selection.room_type_name || 'selected room'}. Room type ID: ${selection.room_type_id}`;
          break;

        case 'select_precheckin_room':
          // User selected a room during pre-check-in
          message = `I'll take room ${selection.room_number}. Room ID: ${selection.room_id}`;
          break;

        case 'submit_preferences':
          // User submitted pre-check-in preferences
          const prefs = selection as Record<string, string | boolean>;
          message = `My preferences are: floor ${prefs.floor_preference || 'any'}, view ${prefs.view_preference || 'any'}, bed ${prefs.bed_type_preference || 'any'}`;
          if (prefs.arrival_time) message += `, arriving around ${prefs.arrival_time}`;
          break;

        case 'complete_precheckin':
          message = `Please complete my pre-check-in for precheckin ID ${selection.precheckin_id}`;
          break;

        case 'payment_complete':
          // Payment was completed - this triggers when "Reserve Now, Pay at Hotel" is clicked
          // Include all booking details so the AI can create the booking
          message = `Please create my booking with pay-at-hotel option. Room type ID: ${selection.room_type_id}, check-in: ${selection.check_in}, check-out: ${selection.check_out}, adults: ${selection.adults || 1}, children: ${selection.children || 0}`;
          if (selection.special_requests) {
            message += `, special requests: ${selection.special_requests}`;
          }
          break;

        case 'confirm_modification':
          message = `Yes, please proceed with the modification.`;
          break;

        case 'confirm_cancellation':
          message = `Yes, please cancel the booking. Reason: ${selection.reason || 'Change of plans'}`;
          break;

        case 'start_booking_with_room':
          message = `I'd like to book the ${selection.room_type_name}. Room type ID: ${selection.room_type_id}`;
          break;

        case 'view_booking':
          message = `Show me details for booking ${selection.confirmation_code}`;
          break;

        case 'start_precheckin':
          message = `I want to start pre-check-in for booking ${selection.confirmation_code}`;
          break;

        case 'modify_booking':
          message = `I want to modify booking ${selection.confirmation_code}`;
          break;

        default:
          // Generic selection
          message = JSON.stringify(selection);
      }

      // Send the message through normal flow
      await sendMessage(message);
    },
    [sendMessage]
  );

  return (
    <AGIChatContext.Provider
      value={{
        messages,
        isOpen,
        isTyping,
        isRecording,
        isPlayingAudio,
        unreadCount,
        sessionId: sessionIdRef.current,
        guestContext,
        voiceEnabled,
        hotelInfo,
        isAuthenticated,
        sendMessage,
        sendVoiceMessage,
        toggleChat,
        openChat,
        closeChat,
        clearHistory,
        setGuestContext,
        handleQuickAction,
        setVoiceEnabled,
        playResponse,
        stopAudio,
        handleActionSelection,
      }}
    >
      {children}
    </AGIChatContext.Provider>
  );
};
