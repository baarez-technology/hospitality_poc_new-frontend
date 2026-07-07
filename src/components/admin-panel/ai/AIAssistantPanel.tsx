import React from 'react';
import { X, Sparkles, Trash2 } from 'lucide-react';
import AIConversation from './AIConversation';
import AIPromptBar from './AIPromptBar';
import AIQuickActions from './AIQuickActions';

interface PendingAction {
  action_id: string;
  action_type: string;
  description: string;
  params: Record<string, unknown>;
}

interface AIAssistantPanelProps {
  isOpen: boolean;
  onClose: () => void;
  messages: Array<{
    id: string;
    type: 'user' | 'ai';
    text: string;
    timestamp: string;
    data?: Record<string, unknown> | null;
    intent?: string;
    confidence?: number;
    queryResults?: Array<Record<string, unknown>>;
    queryMetadata?: Record<string, unknown>;
    pendingAction?: PendingAction;
    actionResult?: Record<string, unknown>;
    suggestions?: string[];
    chartData?: {
      chart_type: 'line' | 'bar' | 'pie' | 'doughnut';
      title: string;
      labels: string[];
      datasets: Array<{ label: string; data: number[] }>;
    };
  }>;
  isTyping: boolean;
  conversationEndRef: React.RefObject<HTMLDivElement>;
  onSendMessage: (message: string) => void;
  onQuickActionClick: (action: string) => void;
  onClearConversation: () => void;
  hasMessages: boolean;
  onConfirmAction?: () => void;
  onCancelAction?: () => void;
  onSuggestionClick?: (suggestion: string) => void;
  isExecutingAction?: boolean;
}

/**
 * AI Assistant Panel Component
 * Main right-side panel that orchestrates all AI components
 */
export default function AIAssistantPanel({
  isOpen,
  onClose,
  messages,
  isTyping,
  conversationEndRef,
  onSendMessage,
  onQuickActionClick,
  onClearConversation,
  hasMessages,
  onConfirmAction,
  onCancelAction,
  onSuggestionClick,
  isExecutingAction = false
}: AIAssistantPanelProps) {
  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Center Modal */}
      <div
        className={`fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-3xl h-[90vh] bg-gradient-to-br from-white via-[#FAF8F6] to-white shadow-2xl z-50 transform transition-all duration-300 ease-out flex flex-col rounded-3xl border-2 border-[#A57865]/20 ${
          isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0 pointer-events-none'
        }`}
      >
        {/* Header */}
        <div className="flex-shrink-0 flex items-center justify-between p-6 border-b border-[#A57865]/20 bg-gradient-to-r from-[#A57865]/10 via-[#CDB261]/10 to-[#5C9BA4]/10 backdrop-blur-sm rounded-t-3xl">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#A57865] via-[#8E6554] to-[#A57865] flex items-center justify-center shadow-lg ring-4 ring-white/50 animate-pulse-slow">
              <Sparkles className="w-7 h-7 text-white drop-shadow-lg" />
            </div>
            <div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-[#A57865] via-[#8E6554] to-[#4E5840] bg-clip-text text-transparent">
                Glimmora AI
              </h2>
              <p className="text-sm text-neutral-600 font-medium">
                ✨ Your Intelligent Hotel Assistant
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Clear conversation button */}
            {hasMessages && (
              <button
                onClick={onClearConversation}
                className="p-2.5 rounded-xl bg-white/80 hover:bg-rose-50 border border-neutral-200 hover:border-rose-300 transition-all duration-200 group shadow-sm hover:shadow"
                title="Clear conversation"
              >
                <Trash2 className="w-4 h-4 text-neutral-600 group-hover:text-rose-600 transition-colors" />
              </button>
            )}

            {/* Close button */}
            <button
              onClick={onClose}
              className="p-2.5 rounded-xl bg-white/80 hover:bg-neutral-100 border border-neutral-200 hover:border-neutral-300 transition-all duration-200 shadow-sm hover:shadow"
              title="Close"
            >
              <X className="w-5 h-5 text-neutral-600" />
            </button>
          </div>
        </div>

        {/* Conversation area */}
        <AIConversation
          messages={messages}
          isTyping={isTyping}
          conversationEndRef={conversationEndRef}
          onSendMessage={onSendMessage}
          onConfirmAction={onConfirmAction}
          onCancelAction={onCancelAction}
          onSuggestionClick={onSuggestionClick}
          isExecutingAction={isExecutingAction}
        />

        {/* Quick actions (show only when there are messages) */}
        {hasMessages && (
          <AIQuickActions onActionClick={onQuickActionClick} />
        )}

        {/* Prompt bar with inline real-time voice */}
        <AIPromptBar
          onSendMessage={onSendMessage}
          isDisabled={isTyping || isExecutingAction}
          hasMessages={hasMessages}
        />
      </div>
    </>
  );
}
