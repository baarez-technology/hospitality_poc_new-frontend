import React from 'react';
import { BarChart3, Building2, Star, TrendingUp } from 'lucide-react';
import AIMessage from './AIMessage';

interface PendingAction {
  action_id: string;
  action_type: string;
  description: string;
  params: Record<string, unknown>;
}

interface AIConversationProps {
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
  onConfirmAction?: () => void;
  onCancelAction?: () => void;
  onSuggestionClick?: (suggestion: string) => void;
  isExecutingAction?: boolean;
}

/**
 * AI Conversation Component
 * Displays the conversation thread with messages and typing indicator
 */
export default function AIConversation({
  messages,
  isTyping,
  conversationEndRef,
  onSendMessage,
  onConfirmAction,
  onCancelAction,
  onSuggestionClick,
  isExecutingAction = false
}: AIConversationProps) {
  return (
    <div className="flex-1 overflow-y-auto px-6 py-6 custom-scrollbar">
      {/* Welcome message when no messages */}
      {messages.length === 0 && (
        <div className="flex flex-col items-center justify-start h-full text-center px-4 pt-12">
          <div className="relative mb-6 animate-pulse-slow">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-[#A57865] via-[#8E6554] to-[#A57865] flex items-center justify-center shadow-2xl ring-4 ring-[#A57865]/20">
              <svg className="w-10 h-10 text-white drop-shadow-lg" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white animate-pulse"></div>
          </div>
          <h3 className="text-3xl font-bold bg-gradient-to-r from-[#A57865] via-[#8E6554] to-[#4E5840] bg-clip-text text-transparent mb-3">
            Welcome to Glimmora AI
          </h3>
          <p className="text-base text-neutral-600 max-w-md mb-8 leading-relaxed">
            Your intelligent assistant for hotel management. Ask me anything about revenue, guests, operations, or analytics.
          </p>
          <div className="w-full max-w-2xl space-y-4">
            {/* Try Asking Section */}
            <div className="bg-gradient-to-br from-[#A57865]/5 via-[#CDB261]/5 to-[#5C9BA4]/5 rounded-2xl p-6 border border-[#A57865]/20">
              <p className="text-sm font-bold text-neutral-800 mb-4 flex items-center gap-2">
                <span className="text-lg">💡</span>
                Try asking:
              </p>
              <div className="space-y-3">
                {/* Example 1: Revenue */}
                <div className="group">
                  <button
                    onClick={() => onSendMessage("Show me today's revenue breakdown")}
                    className="w-full flex items-start gap-3 p-3 bg-white/60 rounded-xl hover:bg-white transition-all duration-200 hover:shadow-md cursor-pointer border border-transparent hover:border-[#A57865]/30 text-left"
                  >
                    <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-gradient-to-br from-[#A57865]/20 to-[#A57865]/10 flex items-center justify-center">
                      <BarChart3 className="w-5 h-5 text-[#A57865]" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-neutral-800">"Show me today's revenue breakdown"</p>
                      <div className="mt-2 text-xs text-neutral-600 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <span className="font-medium text-[#A57865]">Click to ask →</span> Revenue by booking source, room categories, payment methods, and hourly trends
                      </div>
                    </div>
                  </button>
                </div>

                {/* Example 2: Occupancy */}
                <div className="group">
                  <button
                    onClick={() => onSendMessage("What's our current occupancy?")}
                    className="w-full flex items-start gap-3 p-3 bg-white/60 rounded-xl hover:bg-white transition-all duration-200 hover:shadow-md cursor-pointer border border-transparent hover:border-[#4E5840]/30 text-left"
                  >
                    <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-gradient-to-br from-[#4E5840]/20 to-[#4E5840]/10 flex items-center justify-center">
                      <Building2 className="w-5 h-5 text-[#4E5840]" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-neutral-800">"What's our current occupancy?"</p>
                      <div className="mt-2 text-xs text-neutral-600 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <span className="font-medium text-[#4E5840]">Click to ask →</span> Real-time occupancy rate, available rooms by type, and upcoming check-ins/outs
                      </div>
                    </div>
                  </button>
                </div>

                {/* Example 3: Reviews */}
                <div className="group">
                  <button
                    onClick={() => onSendMessage("How are our guest reviews?")}
                    className="w-full flex items-start gap-3 p-3 bg-white/60 rounded-xl hover:bg-white transition-all duration-200 hover:shadow-md cursor-pointer border border-transparent hover:border-[#5C9BA4]/30 text-left"
                  >
                    <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-gradient-to-br from-[#5C9BA4]/20 to-[#5C9BA4]/10 flex items-center justify-center">
                      <Star className="w-5 h-5 text-[#5C9BA4]" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-neutral-800">"How are our guest reviews?"</p>
                      <div className="mt-2 text-xs text-neutral-600 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <span className="font-medium text-[#5C9BA4]">Click to ask →</span> Average rating, sentiment analysis, key themes, and platform comparisons
                      </div>
                    </div>
                  </button>
                </div>

                {/* Example 4: Performance */}
                <div className="group">
                  <button
                    onClick={() => onSendMessage("Generate a performance report")}
                    className="w-full flex items-start gap-3 p-3 bg-white/60 rounded-xl hover:bg-white transition-all duration-200 hover:shadow-md cursor-pointer border border-transparent hover:border-[#CDB261]/30 text-left"
                  >
                    <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-gradient-to-br from-[#CDB261]/20 to-[#CDB261]/10 flex items-center justify-center">
                      <TrendingUp className="w-5 h-5 text-[#CDB261]" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-neutral-800">"Generate a performance report"</p>
                      <div className="mt-2 text-xs text-neutral-600 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <span className="font-medium text-[#CDB261]">Click to ask →</span> Comprehensive metrics, trends, comparisons, and actionable insights
                      </div>
                    </div>
                  </button>
                </div>
              </div>
            </div>

            {/* Capabilities Badge */}
            <div className="flex items-center justify-center gap-2 text-xs text-neutral-500">
              <span className="px-3 py-1.5 bg-white/60 rounded-full border border-neutral-200">🔍 Smart Search</span>
              <span className="px-3 py-1.5 bg-white/60 rounded-full border border-neutral-200">📊 Data Analysis</span>
              <span className="px-3 py-1.5 bg-white/60 rounded-full border border-neutral-200">💡 Insights</span>
            </div>
          </div>
        </div>
      )}

      {/* Messages */}
      {messages.map((message, index) => (
        <AIMessage
          key={message.id}
          message={message}
          onConfirmAction={
            // Only show confirm/cancel for the last message with a pending action
            message.pendingAction && index === messages.length - 1
              ? onConfirmAction
              : undefined
          }
          onCancelAction={
            message.pendingAction && index === messages.length - 1
              ? onCancelAction
              : undefined
          }
          onSuggestionClick={onSuggestionClick}
          isExecutingAction={isExecutingAction}
        />
      ))}

      {/* Typing indicator */}
      {isTyping && (
        <div className="flex gap-3 mb-4">
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#A57865] flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div className="flex flex-col max-w-[80%]">
            <div className="flex items-center gap-2 mb-1 px-1">
              <span className="text-xs font-medium text-[#A57865]">Glimmora AI</span>
            </div>
            <div className="px-4 py-3 rounded-xl bg-white border border-neutral-200 shadow-sm">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Invisible div for auto-scroll */}
      <div ref={conversationEndRef} />
    </div>
  );
}
