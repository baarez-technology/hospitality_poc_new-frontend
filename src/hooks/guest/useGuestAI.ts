import { useState, useCallback, useRef } from 'react';
import { guestAIService } from '@/api/services/guest-ai.service';
import toast from 'react-hot-toast';

export interface Message {
  id: string;
  type: 'user' | 'ai';
  text: string;
  timestamp: string;
  bookingState?: any;
}

export function useGuestAI() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      type: 'ai',
      text: "Hello! I'm Baarez, your AI assistant. I can help you make a booking, check availability, or answer questions. How can I assist you today?",
      timestamp: new Date().toISOString(),
    },
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const conversationEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    conversationEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: `msg-${Date.now()}-user`,
      type: 'user',
      text: text.trim(),
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsTyping(true);

    try {
      const response = await guestAIService.chat({
        message: text.trim(),
        conversation_id: conversationId || undefined,
      });

      const aiMessage: Message = {
        id: `msg-${Date.now()}-ai`,
        type: 'ai',
        text: response.response,
        timestamp: new Date().toISOString(),
        bookingState: response.state,
      };

      setMessages((prev) => [...prev, aiMessage]);

      // If booking is ready, show option to create it
      if (response.booking_ready && response.state) {
        // The AI will handle the booking creation flow
      }
    } catch (error: any) {
      console.error('Error sending message:', error);
      toast.error(error.response?.data?.detail || 'Failed to send message');

      const errorMessage: Message = {
        id: `msg-${Date.now()}-error`,
        type: 'ai',
        text: "I apologize, but I encountered an error. Please try again or contact our support team.",
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
      setTimeout(scrollToBottom, 100);
    }
  }, [conversationId, scrollToBottom]);

  const createBooking = useCallback(async (state: any) => {
    try {
      setIsTyping(true);
      const response = await guestAIService.createBooking({ state });

      const successMessage: Message = {
        id: `msg-${Date.now()}-success`,
        type: 'ai',
        text: response.message || 'Booking created successfully!',
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, successMessage]);
      toast.success('Booking created successfully!');
      
      return response;
    } catch (error: any) {
      console.error('Error creating booking:', error);
      toast.error(error.response?.data?.detail || 'Failed to create booking');

      const errorMessage: Message = {
        id: `msg-${Date.now()}-error`,
        type: 'ai',
        text: `I couldn't create your booking: ${error.response?.data?.detail || 'Unknown error'}. Please try again.`,
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, errorMessage]);
      throw error;
    } finally {
      setIsTyping(false);
    }
  }, []);

  const clearConversation = useCallback(() => {
    setMessages([
      {
        id: 'welcome',
        type: 'ai',
        text: "Hello! I'm Baarez, your AI assistant. I can help you make a booking, check availability, or answer questions. How can I assist you today?",
        timestamp: new Date().toISOString(),
      },
    ]);
    setConversationId(null);
  }, []);

  return {
    messages,
    isTyping,
    isPanelOpen,
    setIsPanelOpen,
    sendMessage,
    createBooking,
    clearConversation,
    conversationEndRef,
  };
}

