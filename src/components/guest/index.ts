// Guest Components
export { GuestChatWidget } from './GuestChatWidget';
export { GuestAIAssistant } from './GuestAIAssistant';

// Re-export chat context
export { ChatProvider, useChat } from '@/contexts/ChatContext';
export type { Message, BookingContext } from '@/contexts/ChatContext';
