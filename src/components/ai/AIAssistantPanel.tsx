import React from 'react';
import { X, Zap, Trash2 } from 'lucide-react';
import AIConversation from './AIConversation';
import AIPromptBar from './AIPromptBar';
import AIQuickActions from './AIQuickActions';
import VoiceRecorderModal from './VoiceRecorderModal';

/**
 * AI Assistant Panel Component
 * Glimmora Design System v5.0 - Clean, no gradients
 */
export default function AIAssistantPanel({
  isOpen,
  onClose,
  messages,
  isTyping,
  isListening,
  voiceModalOpen,
  conversationEndRef,
  onSendMessage,
  onQuickActionClick,
  onVoiceClick,
  onVoiceTranscriptReady,
  onClearConversation,
  hasMessages
}) {
  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Center Modal - Full screen on mobile, centered modal on desktop */}
      <div
        className={`fixed inset-0 sm:inset-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 w-full sm:max-w-2xl h-full sm:h-[85vh] bg-white shadow-2xl z-50 transform transition-all duration-300 ease-out flex flex-col sm:rounded-2xl sm:border sm:border-neutral-200 ${
          isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0 pointer-events-none'
        }`}
      >
        {/* Header */}
        <div className="flex-shrink-0 flex items-center justify-between px-4 sm:px-6 py-4 sm:py-5 border-b border-neutral-100">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-terra-500 flex items-center justify-center flex-shrink-0">
              <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-semibold text-neutral-900 tracking-tight">
                Glimmora AI
              </h2>
              <p className="text-[10px] sm:text-[11px] text-neutral-400 font-medium">
                Your Intelligent Hotel Assistant
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 sm:gap-2">
            {/* Clear conversation button */}
            {hasMessages && (
              <button
                onClick={onClearConversation}
                className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center text-neutral-400 hover:text-rose-600 hover:bg-rose-50 transition-all"
                title="Clear conversation"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}

            {/* Close button */}
            <button
              onClick={onClose}
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 transition-all"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Status bar */}
        {isListening && (
          <div className="flex-shrink-0 px-4 sm:px-6 py-2 sm:py-3 bg-rose-50 border-b border-rose-100">
            <div className="flex items-center justify-center gap-2">
              <div className="relative">
                <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 bg-rose-500 rounded-full animate-pulse"></div>
              </div>
              <span className="text-[10px] sm:text-[11px] font-semibold text-rose-600">Recording voice input...</span>
            </div>
          </div>
        )}

        {/* Conversation area */}
        <AIConversation
          messages={messages}
          isTyping={isTyping}
          conversationEndRef={conversationEndRef}
          onSendMessage={onSendMessage}
        />

        {/* Quick actions (show only when there are messages) */}
        {hasMessages && (
          <AIQuickActions onActionClick={onQuickActionClick} />
        )}

        {/* Prompt bar */}
        <AIPromptBar
          onSendMessage={onSendMessage}
          onVoiceClick={onVoiceClick}
          isListening={isListening}
          hasMessages={hasMessages}
        />
      </div>

      {/* Voice recorder modal */}
      <VoiceRecorderModal
        isOpen={voiceModalOpen}
        onClose={onVoiceClick}
        onTranscriptReady={onVoiceTranscriptReady}
      />
    </>
  );
}
