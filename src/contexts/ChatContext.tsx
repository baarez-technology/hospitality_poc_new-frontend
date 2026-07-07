import { createContext, useContext, useState, useEffect, ReactNode, useRef, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { guestChatService, QuickAction } from '@/api/services/guest-chat.service';
import { guestAssistantService, BookingLookupResponse } from '@/api/services/guest-assistant.service';

// ============== Types ==============

// Flow state for multi-step conversations
export interface FlowState {
  flowType?: string;
  currentStep: number;
  totalSteps: number;
  stepLabel: string;
  progress: number;
  canGoBack: boolean;
  canCancel: boolean;
}

// Room search result
export interface RoomSearchResult {
  id: number;
  name: string;
  slug: string;
  price_per_night: number;
  available_count: number;
  max_occupancy: number;
  description?: string;
}

// Profile info
export interface ProfileInfo {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  country?: string;
  loyalty_tier?: string;
  loyalty_points?: number;
  total_stays?: number;
}

// Booking list item
export interface BookingListItem {
  id: number;
  confirmation_code: string;
  arrival_date: string;
  departure_date: string;
  status: string;
  room_type_name?: string;
  total_price?: number;
}

// Pre-checkin info
export interface PrecheckinInfo {
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

export interface Message {
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
    assignedStaffName?: string;
    estimatedTime?: number;
    status?: string;
    // Enhanced task details
    priority?: 'critical' | 'high' | 'medium' | 'low';
    title?: string;
    description?: string;
    category?: string;
    detectedIssue?: string;
    requiredSkills?: string[];
    assignedStaffRole?: string;
  };
  bookingInfo?: {
    confirmationCode: string;
    roomNumber?: string;
    guestName?: string;
    checkout?: string;
    status?: string;
  };
  isError?: boolean;
  // New comprehensive AGI fields
  roomSearchResults?: RoomSearchResult[];
  profileInfo?: ProfileInfo;
  bookingsList?: BookingListItem[];
  precheckinInfo?: PrecheckinInfo;
  flowState?: FlowState;
  requiresAuth?: boolean;
  authError?: string;
}

export interface BookingContext {
  bookingNumber?: string;
  roomNumber?: string;
  guestName?: string;
  isCheckedIn?: boolean;
}

interface ChatContextType {
  messages: Message[];
  isOpen: boolean;
  isTyping: boolean;
  unreadCount: number;
  sessionId: string | null;
  bookingContext: BookingContext | null;
  sendMessage: (content: string) => Promise<void>;
  toggleChat: () => void;
  openChat: () => void;
  closeChat: () => void;
  clearHistory: () => void;
  setBookingContext: (context: BookingContext) => void;
  lookupBooking: (bookingNumber: string) => Promise<boolean>;
  handleQuickAction: (action: string) => void;
  pollTaskStatus: (taskId: number) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};

// ============== Constants ==============

const CHAT_STORAGE_KEY = 'glimmora_chat_history';
const SESSION_ID_KEY = 'glimmora_chat_session_id';
const BOOKING_CONTEXT_KEY = 'glimmora_booking_context';

// ============== Provider ==============

interface ChatProviderProps {
  children: ReactNode;
}

export const ChatProvider = ({ children }: ChatProviderProps) => {
  const { isAuthenticated, user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [bookingContext, setBookingContextState] = useState<BookingContext | null>(null);
  const sessionIdRef = useRef<string | null>(null);
  const taskPollIntervals = useRef<Map<number, NodeJS.Timeout>>(new Map());

  // Initialize session ID
  useEffect(() => {
    const savedSessionId = localStorage.getItem(SESSION_ID_KEY);
    if (savedSessionId) {
      sessionIdRef.current = savedSessionId;
    } else {
      const newSessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      sessionIdRef.current = newSessionId;
      localStorage.setItem(SESSION_ID_KEY, newSessionId);
    }
  }, []);

  // Load saved state
  useEffect(() => {
    // Load booking context
    const savedBookingContext = localStorage.getItem(BOOKING_CONTEXT_KEY);
    if (savedBookingContext) {
      try {
        setBookingContextState(JSON.parse(savedBookingContext));
      } catch (e) {
        console.error('Error parsing saved booking context:', e);
      }
    }

    // Load messages
    const loadMessages = async () => {
      // Try backend first if authenticated
      if (isAuthenticated && sessionIdRef.current) {
        try {
          const history = await guestChatService.getHistory(undefined, 50);
          if (history.messages && history.messages.length > 0) {
            const loadedMessages: Message[] = history.messages.map((msg, idx) => ({
              id: `${msg.type}_${idx}_${Date.now()}`,
              type: msg.type === 'user' ? 'user' as const : 'assistant' as const,
              content: msg.content,
              timestamp: new Date(msg.timestamp),
              intent: msg.classification,
            }));
            // Update session ID from server
            if (history.session_id) {
              sessionIdRef.current = history.session_id;
              localStorage.setItem(SESSION_ID_KEY, history.session_id);
            }
            setMessages(loadedMessages);
            return;
          }
        } catch (error: unknown) {
          // 404 or 401 is expected for new sessions or unauthenticated users
          const isExpected = error instanceof Error &&
            'response' in error &&
            [401, 404].includes((error as { response?: { status?: number } }).response?.status || 0);
          if (!isExpected) {
            console.error('Error loading chat history from backend:', error);
          }
        }
      }

      // Fallback to localStorage
      const savedMessages = localStorage.getItem(CHAT_STORAGE_KEY);
      if (savedMessages) {
        try {
          const parsed = JSON.parse(savedMessages);
          setMessages(parsed.map((msg: Message) => ({
            ...msg,
            timestamp: new Date(msg.timestamp),
          })));
        } catch (e) {
          console.error('Error parsing saved messages:', e);
          showWelcomeMessage();
        }
      } else {
        showWelcomeMessage();
      }
    };

    loadMessages();
  }, [isAuthenticated]);

  // Save messages to localStorage
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(messages));
    }
  }, [messages]);

  // Save booking context
  useEffect(() => {
    if (bookingContext) {
      localStorage.setItem(BOOKING_CONTEXT_KEY, JSON.stringify(bookingContext));
    }
  }, [bookingContext]);

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

  // Cleanup task polling on unmount
  useEffect(() => {
    return () => {
      taskPollIntervals.current.forEach((interval) => clearInterval(interval));
    };
  }, []);

  const showWelcomeMessage = () => {
    const guestName = user?.first_name || 'there';
    const welcomeMessage: Message = {
      id: `welcome_${Date.now()}`,
      type: 'assistant',
      content: `Hello ${guestName}! Welcome to J Park Inn Hotel. I'm your virtual assistant and I'm here to help with:\n\n• Housekeeping requests\n• Maintenance issues\n• Room service orders\n• Hotel information & FAQs\n• And much more!\n\nHow can I assist you today?`,
      timestamp: new Date(),
      quickActions: [
        { label: 'Housekeeping', action: 'housekeeping' },
        { label: 'Room Service', action: 'room_service' },
        { label: 'Hotel Info', action: 'faq' },
      ],
    };
    setMessages([welcomeMessage]);
  };

  const addMessage = useCallback((message: Omit<Message, 'id' | 'timestamp'>) => {
    const newMessage: Message = {
      ...message,
      id: `${message.type}_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, newMessage]);
    return newMessage;
  }, []);

  // Build quick actions based on detected intent
  const buildQuickActionsForIntent = (intent?: string): QuickAction[] => {
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
      case 'escalate':
        return [{ label: 'Contact Info', action: 'Give me contact information' }];
      default:
        return [];
    }
  };

  const sendMessage = async (content: string) => {
    if (!content.trim()) return;

    // Add user message
    addMessage({
      type: 'user',
      content: content.trim(),
    });

    setIsTyping(true);

    try {
      const response = await guestChatService.chat({
        message: content.trim(),
        session_id: sessionIdRef.current || undefined,
      });

      // Update session ID if returned
      if (response.session_id && response.session_id !== sessionIdRef.current) {
        sessionIdRef.current = response.session_id;
        localStorage.setItem(SESSION_ID_KEY, response.session_id);
      }

      // Build assistant message
      const assistantMessage: Omit<Message, 'id' | 'timestamp'> = {
        type: 'assistant',
        content: response.response,
        intent: response.intent,
      };

      // Add quick actions based on intent
      const quickActions = buildQuickActionsForIntent(response.intent);
      if (quickActions.length > 0) {
        assistantMessage.quickActions = quickActions;
      }

      // If staff action is required, note it
      if (response.requires_staff_action) {
        assistantMessage.taskInfo = {
          taskId: 0, // Task created on server
          taskType: response.intent || 'service',
          status: 'pending',
        };
      }

      addMessage(assistantMessage);

    } catch (error) {
      console.error('Error sending message:', error);
      addMessage({
        type: 'assistant',
        content: "I apologize, but I'm experiencing technical difficulties. Please try again or contact our front desk for immediate assistance.",
        isError: true,
        quickActions: [
          { label: 'Try Again', action: 'retry' },
          { label: 'Contact Front Desk', action: 'front_desk' },
        ],
      });
    } finally {
      setIsTyping(false);
    }
  };

  const lookupBooking = async (bookingNumber: string): Promise<boolean> => {
    setIsTyping(true);

    try {
      const response = await guestAssistantService.lookupBooking(bookingNumber);

      if (response.found && response.booking_info) {
        setBookingContextState({
          bookingNumber: response.booking_info.confirmation_code,
          roomNumber: response.booking_info.room_number,
          guestName: response.booking_info.guest_name,
          isCheckedIn: response.booking_info.is_checked_in,
        });

        addMessage({
          type: 'assistant',
          content: `I found your booking:\n\n• Confirmation: ${response.booking_info.confirmation_code}\n• Guest: ${response.booking_info.guest_name}\n• Room: ${response.booking_info.room_number || 'Not yet assigned'}\n• Status: ${response.booking_info.status}\n\nHow can I assist you today?`,
          bookingInfo: {
            confirmationCode: response.booking_info.confirmation_code,
            roomNumber: response.booking_info.room_number,
            guestName: response.booking_info.guest_name,
            status: response.booking_info.status,
          },
          quickActions: [
            { label: 'Housekeeping', action: 'housekeeping' },
            { label: 'Maintenance', action: 'maintenance' },
            { label: 'Room Service', action: 'room_service' },
          ],
        });

        return true;
      } else {
        addMessage({
          type: 'assistant',
          content: response.message,
          quickActions: [
            { label: 'Try Again', action: 'enter_booking' },
            { label: 'Contact Front Desk', action: 'front_desk' },
          ],
        });
        return false;
      }
    } catch (error) {
      console.error('Error looking up booking:', error);
      addMessage({
        type: 'assistant',
        content: "I couldn't look up your booking. Please try again or contact the front desk.",
        isError: true,
      });
      return false;
    } finally {
      setIsTyping(false);
    }
  };

  const pollTaskStatus = useCallback((taskId: number) => {
    // Clear any existing poll for this task
    if (taskPollIntervals.current.has(taskId)) {
      clearInterval(taskPollIntervals.current.get(taskId)!);
    }

    let pollCount = 0;
    const maxPolls = 60; // Poll for max 30 minutes (30 second intervals)

    const poll = async () => {
      pollCount++;
      if (pollCount > maxPolls) {
        clearInterval(taskPollIntervals.current.get(taskId)!);
        taskPollIntervals.current.delete(taskId);
        return;
      }

      try {
        const status = await guestAssistantService.getTaskStatus(taskId);

        if (status.status === 'completed') {
          clearInterval(taskPollIntervals.current.get(taskId)!);
          taskPollIntervals.current.delete(taskId);

          // Notify user
          addMessage({
            type: 'system',
            content: `Your ${status.task_type.replace('_', ' ')} request has been completed! We hope everything is to your satisfaction.`,
            taskInfo: {
              taskId: status.id,
              taskType: status.task_type,
              assignedStaffName: status.assigned_staff_name,
              status: 'completed',
            },
          });
        } else if (status.status === 'in_progress') {
          // Update the message with in-progress status
          setMessages((prev) =>
            prev.map((msg) => {
              if (msg.taskInfo?.taskId === taskId) {
                return {
                  ...msg,
                  taskInfo: {
                    ...msg.taskInfo,
                    status: 'in_progress',
                  },
                };
              }
              return msg;
            })
          );
        }
      } catch (error) {
        console.error('Error polling task status:', error);
      }
    };

    // Poll every 30 seconds
    const intervalId = setInterval(poll, 30000);
    taskPollIntervals.current.set(taskId, intervalId);

    // Initial poll after 10 seconds
    setTimeout(poll, 10000);
  }, [addMessage]);

  const handleQuickAction = useCallback((action: string) => {
    switch (action) {
      case 'housekeeping':
        sendMessage('I need housekeeping service');
        break;
      case 'maintenance':
        sendMessage('I have a maintenance issue');
        break;
      case 'room_service':
        sendMessage('I would like to order room service');
        break;
      case 'faq':
        sendMessage('What amenities does the hotel offer?');
        break;
      case 'front_desk':
        addMessage({
          type: 'assistant',
          content: 'You can reach our front desk at:\n\n• Phone: Extension 0 from your room\n• Direct Line: +971 501371105\n• India: +91-6300275340\n• Available 24/7\n\nWould you like me to help with anything else?',
        });
        break;
      case 'enter_booking':
        addMessage({
          type: 'assistant',
          content: 'Please enter your booking confirmation number (you can find this in your confirmation email):',
        });
        break;
      case 'retry':
        // Re-send the last user message
        const lastUserMessage = [...messages].reverse().find(m => m.type === 'user');
        if (lastUserMessage) {
          sendMessage(lastUserMessage.content);
        }
        break;
      // New AGI quick actions
      case 'room_search':
      case 'find_rooms':
        sendMessage('Show me available rooms');
        break;
      case 'my_bookings':
      case 'view_bookings':
        sendMessage('Show my bookings');
        break;
      case 'precheckin':
      case 'start_precheckin':
        sendMessage('Start pre-checkin');
        break;
      case 'view_profile':
      case 'my_profile':
        sendMessage('Show my profile');
        break;
      case 'update_profile':
        sendMessage('Update my profile');
        break;
      case 'cancel_booking':
        sendMessage('Cancel my booking');
        break;
      case 'modify_booking':
        sendMessage('Modify my booking');
        break;
      case 'make_booking':
      case 'book_room':
        sendMessage('I want to book a room');
        break;
      case 'cancel_flow':
        sendMessage('Cancel');
        break;
      case 'go_back':
        sendMessage('Go back');
        break;
      // Staff assistance actions
      case 'staff_help':
      case 'talk_to_staff':
        sendMessage('I need to speak with someone');
        break;
      case 'concierge':
        sendMessage('I need concierge assistance');
        break;
      // Info and capabilities
      case 'capabilities':
      case 'what_can_you_do':
        sendMessage('What can you do?');
        break;
      case 'spa_wellness':
        sendMessage('Tell me about spa services');
        break;
      case 'turndown':
        sendMessage('I would like turndown service');
        break;
      case 'breakfast_info':
        sendMessage('What time is breakfast?');
        break;
      case 'booking_inquiry':
        sendMessage('I have a question about my booking');
        break;
      default:
        // Handle dynamic book room actions (e.g., book_room_123)
        if (action.startsWith('book_room_')) {
          const roomTypeId = action.replace('book_room_', '');
          sendMessage(`I want to book room type ${roomTypeId}`);
        } else if (action.startsWith('view_booking_')) {
          const bookingId = action.replace('view_booking_', '');
          sendMessage(`Show me booking details for ${bookingId}`);
        } else {
          sendMessage(action);
        }
    }
  }, [messages, sendMessage, addMessage]);

  const toggleChat = () => setIsOpen((prev) => !prev);
  const openChat = () => setIsOpen(true);
  const closeChat = () => setIsOpen(false);

  const clearHistory = () => {
    // Stop all task polling
    taskPollIntervals.current.forEach((interval) => clearInterval(interval));
    taskPollIntervals.current.clear();

    // Clear state
    setMessages([]);
    setBookingContextState(null);

    // Clear localStorage
    localStorage.removeItem(CHAT_STORAGE_KEY);
    localStorage.removeItem(BOOKING_CONTEXT_KEY);

    // Generate new session
    const newSessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    sessionIdRef.current = newSessionId;
    localStorage.setItem(SESSION_ID_KEY, newSessionId);

    // Show welcome message
    showWelcomeMessage();
  };

  const setBookingContext = (context: BookingContext) => {
    setBookingContextState(context);
  };

  return (
    <ChatContext.Provider
      value={{
        messages,
        isOpen,
        isTyping,
        unreadCount,
        sessionId: sessionIdRef.current,
        bookingContext,
        sendMessage,
        toggleChat,
        openChat,
        closeChat,
        clearHistory,
        setBookingContext,
        lookupBooking,
        handleQuickAction,
        pollTaskStatus,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};
