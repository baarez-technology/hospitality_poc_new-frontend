/**
 * AGI Chat Widget
 * Advanced AI-powered chat widget with real-time voice support
 * Features:
 * - Real-time speech recognition (like Siri/Google Assistant)
 * - Whisper fallback for noisy environments
 * - Visual feedback during voice input
 * - Noise level indicator
 */

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import {
  MessageCircle,
  X,
  Trash2,
  Minimize2,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Send,
  Square,
  Loader2,
  Sparkles,
  Waves,
  AlertCircle,
  Zap,
  Radio,
  Mail,
  LogIn,
  CheckCircle,
  Gift,
} from 'lucide-react';
import { useAGIChat, AGIMessage } from '@/contexts/AGIChatContext';
import { useAdvancedVoice } from '@/hooks/useAdvancedVoice';
import { ChatActionRenderer } from './ChatActionRenderer';

// OTP Input Component
function OTPInput({ email, onSubmit }: { email: string; onSubmit: (code: string) => void }) {
  const [code, setCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length === 6) {
      setIsSubmitting(true);
      await onSubmit(code);
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="mt-3 p-3 bg-blue-50 rounded-xl border border-blue-200"
    >
      <div className="flex items-center gap-2 mb-2">
        <Mail className="w-4 h-4 text-blue-600" />
        <span className="text-sm font-medium text-blue-800">Verification Code Sent</span>
      </div>
      <p className="text-xs text-blue-700 mb-3">
        We've sent a 6-digit code to <strong>{email}</strong>
      </p>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
          placeholder="Enter 6-digit code"
          className="flex-1 px-3 py-2 text-sm rounded-lg border border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-400 text-center font-mono tracking-widest"
          maxLength={6}
          autoFocus
        />
        <button
          type="submit"
          disabled={code.length !== 6 || isSubmitting}
          className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
        >
          {isSubmitting ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <CheckCircle className="w-4 h-4" />
          )}
          Verify
        </button>
      </form>
    </motion.div>
  );
}

// Login Prompt Component
function LoginPrompt({ onLogin }: { onLogin: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="mt-3 p-3 bg-amber-50 rounded-xl border border-amber-200"
    >
      <div className="flex items-center gap-2 mb-2">
        <LogIn className="w-4 h-4 text-amber-600" />
        <span className="text-sm font-medium text-amber-800">Login for More Features</span>
      </div>
      <p className="text-xs text-amber-700 mb-3">
        Sign in to view your bookings, earn loyalty points, and unlock personalized services.
      </p>
      <button
        onClick={onLogin}
        className="w-full px-4 py-2 bg-amber-600 text-white text-sm font-medium rounded-lg hover:bg-amber-700 flex items-center justify-center gap-2"
      >
        <LogIn className="w-4 h-4" />
        Sign In / Register
      </button>
    </motion.div>
  );
}

// Booking Confirmation Badge
function BookingConfirmationBadge({ bookingId }: { bookingId: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="mt-3 p-3 bg-green-50 rounded-xl border border-green-200"
    >
      <div className="flex items-center gap-2">
        <CheckCircle className="w-5 h-5 text-green-600" />
        <div>
          <span className="text-sm font-medium text-green-800">Booking Confirmed!</span>
          <p className="text-xs text-green-600">Confirmation #GLIM-{bookingId.toString().padStart(6, '0')}</p>
        </div>
      </div>
    </motion.div>
  );
}

// Message Component
function AGIChatMessage({ message }: { message: AGIMessage }) {
  const { handleQuickAction, playResponse, voiceEnabled, sendMessage, handleActionSelection } = useAGIChat();
  const isUser = message.type === 'user';
  const isSystem = message.type === 'system';

  const handleOTPSubmit = (code: string) => {
    sendMessage(`My OTP code is ${code}`);
  };

  const handleLogin = () => {
    // Navigate to login - could use router or window.location
    window.location.href = '/login?redirect=' + encodeURIComponent(window.location.pathname);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-3`}
    >
      <div
        className={`max-w-[85%] rounded-2xl px-4 py-3 ${
          isUser
            ? 'bg-primary-600 text-white rounded-br-md'
            : isSystem
            ? 'bg-amber-100 text-amber-800 rounded-bl-md border border-amber-200'
            : 'bg-white text-gray-800 rounded-bl-md shadow-md border border-gray-100'
        }`}
      >
        {/* Voice indicator */}
        {message.isVoice && (
          <div className="flex items-center gap-1 text-xs opacity-70 mb-1">
            <Mic className="w-3 h-3" />
            <span>Voice message</span>
          </div>
        )}

        {/* Message content - with Markdown rendering */}
        <div className={`text-sm leading-relaxed prose prose-sm max-w-none ${
          isUser
            ? 'prose-invert prose-p:text-white prose-strong:text-white prose-li:text-white prose-headings:text-white'
            : 'prose-gray prose-p:text-gray-800 prose-strong:text-gray-900 prose-li:text-gray-700 prose-headings:text-gray-900'
        }`}>
          <ReactMarkdown
            components={{
              // Override paragraph to remove extra margins
              p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
              // Style lists nicely
              ul: ({ children }) => <ul className="my-2 ml-4 list-disc space-y-1">{children}</ul>,
              ol: ({ children }) => <ol className="my-2 ml-4 list-decimal space-y-1">{children}</ol>,
              li: ({ children }) => <li className="ml-1">{children}</li>,
              // Style bold text
              strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
              // Style inline code
              code: ({ children }) => (
                <code className={`px-1.5 py-0.5 rounded text-xs font-mono ${
                  isUser ? 'bg-white/20' : 'bg-gray-100 text-gray-800'
                }`}>{children}</code>
              ),
              // Style code blocks
              pre: ({ children }) => (
                <pre className={`p-3 rounded-lg my-2 overflow-x-auto text-xs ${
                  isUser ? 'bg-white/10' : 'bg-gray-50 border border-gray-200'
                }`}>{children}</pre>
              ),
              // Style headings
              h1: ({ children }) => <h1 className="text-base font-bold mt-3 mb-2">{children}</h1>,
              h2: ({ children }) => <h2 className="text-sm font-bold mt-2 mb-1">{children}</h2>,
              h3: ({ children }) => <h3 className="text-sm font-semibold mt-2 mb-1">{children}</h3>,
              // Style blockquotes
              blockquote: ({ children }) => (
                <blockquote className={`border-l-3 pl-3 my-2 italic ${
                  isUser ? 'border-white/50 text-white/90' : 'border-primary-400 text-gray-600'
                }`}>{children}</blockquote>
              ),
              // Style horizontal rules
              hr: () => <hr className={`my-3 ${isUser ? 'border-white/30' : 'border-gray-200'}`} />,
              // Style links
              a: ({ href, children }) => (
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`underline hover:no-underline ${
                    isUser ? 'text-white/90' : 'text-primary-600 hover:text-primary-700'
                  }`}
                >{children}</a>
              ),
            }}
          >
            {message.content}
          </ReactMarkdown>
        </div>

        {/* Action UI - rendered when AI returns structured actions */}
        {message.action && (
          <ChatActionRenderer
            action={message.action}
            onSelection={handleActionSelection}
          />
        )}

        {/* Booking confirmation badge */}
        {message.bookingCreated && (
          <BookingConfirmationBadge bookingId={message.bookingCreated} />
        )}

        {/* OTP Input */}
        {message.requiresOtp && message.otpEmail && (
          <OTPInput email={message.otpEmail} onSubmit={handleOTPSubmit} />
        )}

        {/* Login Prompt */}
        {message.showLoginPrompt && (
          <LoginPrompt onLogin={handleLogin} />
        )}

        {/* Task info badge */}
        {message.taskInfo && (
          <div className="mt-2 flex items-center gap-2">
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
              <Sparkles className="w-3 h-3 mr-1" />
              Request #{message.taskInfo.taskId} created
            </span>
          </div>
        )}

        {/* Intent badge - only show in dev */}
        {process.env.NODE_ENV === 'development' && message.intent && !isUser && message.confidence && message.confidence > 0.5 && (
          <div className="mt-2 text-xs text-gray-400">
            Intent: {message.intent} ({Math.round(message.confidence * 100)}%)
          </div>
        )}

        {/* Quick actions */}
        {message.quickActions && message.quickActions.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {message.quickActions.map((action, idx) => (
              <button
                key={idx}
                onClick={() => handleQuickAction(action.action)}
                className="px-3 py-1.5 text-xs font-medium rounded-full bg-primary-50 text-primary-700 hover:bg-primary-100 transition-colors border border-primary-200"
              >
                {action.label}
              </button>
            ))}
          </div>
        )}

        {/* Play response button */}
        {!isUser && voiceEnabled && message.content.length < 500 && (
          <button
            onClick={() => playResponse(message.content)}
            className="mt-2 text-xs text-gray-400 hover:text-primary-600 flex items-center gap-1"
          >
            <Volume2 className="w-3 h-3" />
            Play
          </button>
        )}

        {/* Timestamp */}
        <div
          className={`text-xs mt-2 ${isUser ? 'text-white/70' : 'text-gray-400'}`}
        >
          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
    </motion.div>
  );
}

// Typing Indicator
function TypingIndicator({ aiName = 'Aria' }: { aiName?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex justify-start mb-3"
    >
      <div className="bg-white rounded-2xl rounded-bl-md px-4 py-3 shadow-md border border-gray-100">
        <div className="flex items-center gap-1">
          <div className="flex gap-1">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-2 h-2 rounded-full bg-primary-400"
                animate={{ y: [0, -4, 0] }}
                transition={{
                  duration: 0.6,
                  repeat: Infinity,
                  delay: i * 0.1,
                }}
              />
            ))}
          </div>
          <span className="text-sm text-gray-500 ml-2">{aiName} is thinking...</span>
        </div>
      </div>
    </motion.div>
  );
}

// Noise Level Indicator
function NoiseLevelIndicator({ level, isWhisperMode }: { level: number; isWhisperMode: boolean }) {
  const bars = 5;
  const activeBars = Math.round(level * bars);

  return (
    <div className="flex items-center gap-1">
      {[...Array(bars)].map((_, i) => (
        <motion.div
          key={i}
          className={`w-1 rounded-full ${
            i < activeBars
              ? level > 0.7
                ? 'bg-red-400'
                : level > 0.4
                ? 'bg-yellow-400'
                : 'bg-green-400'
              : 'bg-gray-300'
          }`}
          style={{ height: `${8 + i * 3}px` }}
          animate={{ opacity: i < activeBars ? 1 : 0.3 }}
        />
      ))}
      {isWhisperMode && (
        <span className="ml-1 text-xs text-primary-600 font-medium">Whisper</span>
      )}
    </div>
  );
}

// Live Transcript Display
function LiveTranscript({
  transcript,
  interimTranscript,
  isListening
}: {
  transcript: string;
  interimTranscript: string;
  isListening: boolean;
}) {
  if (!isListening && !transcript && !interimTranscript) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      className="px-4 py-2 bg-primary-50 border-t border-primary-100"
    >
      <div className="flex items-center gap-2 text-sm">
        <motion.div
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 0.5, repeat: Infinity }}
          className="w-2 h-2 rounded-full bg-red-500"
        />
        <span className="text-gray-700">
          {transcript}
          <span className="text-gray-400 italic">{interimTranscript}</span>
        </span>
      </div>
    </motion.div>
  );
}

// Advanced Voice Button with visual feedback
function VoiceButton({
  isListening,
  isProcessing,
  noiseLevel,
  isWhisperMode,
  isSpeechSupported,
  onClick,
  onWhisperToggle,
  disabled,
}: {
  isListening: boolean;
  isProcessing: boolean;
  noiseLevel: number;
  isWhisperMode: boolean;
  isSpeechSupported: boolean;
  onClick: () => void;
  onWhisperToggle: () => void;
  disabled: boolean;
}) {
  return (
    <div className="flex items-center gap-2">
      {/* Whisper mode toggle */}
      {isSpeechSupported && (
        <button
          type="button"
          onClick={onWhisperToggle}
          className={`p-2 rounded-full transition-all ${
            isWhisperMode
              ? 'bg-purple-100 text-purple-600'
              : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
          }`}
          title={isWhisperMode ? 'Using Whisper (better for noisy environments)' : 'Using live transcription'}
        >
          {isWhisperMode ? <Zap className="w-4 h-4" /> : <Radio className="w-4 h-4" />}
        </button>
      )}

      {/* Main voice button */}
      <motion.button
        type="button"
        onClick={onClick}
        disabled={disabled || isProcessing}
        className={`relative p-3 rounded-full transition-all ${
          isListening
            ? 'bg-red-500 text-white'
            : isProcessing
            ? 'bg-amber-500 text-white'
            : 'bg-gradient-to-r from-primary-500 to-primary-600 text-white hover:from-primary-600 hover:to-primary-700 shadow-md'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        animate={isListening ? { scale: [1, 1.1, 1] } : {}}
        transition={{ duration: 0.5, repeat: isListening ? Infinity : 0 }}
        title={
          isProcessing
            ? 'Processing...'
            : isListening
            ? 'Tap to stop (auto-sends when you pause)'
            : isWhisperMode
            ? 'Tap to record voice message'
            : 'Tap to speak (real-time transcription)'
        }
      >
        {/* Pulse animation when listening */}
        {isListening && (
          <motion.div
            className="absolute inset-0 rounded-full bg-red-400"
            animate={{ scale: [1, 1.5], opacity: [0.5, 0] }}
            transition={{ duration: 1, repeat: Infinity }}
          />
        )}

        {isProcessing ? (
          <Loader2 className="w-6 h-6 animate-spin" />
        ) : isListening ? (
          <MicOff className="w-6 h-6 relative z-10" />
        ) : (
          <Mic className="w-6 h-6" />
        )}
      </motion.button>

      {/* Noise level indicator when listening */}
      {isListening && (
        <NoiseLevelIndicator level={noiseLevel} isWhisperMode={isWhisperMode} />
      )}
    </div>
  );
}

// Main Chat Input with Advanced Voice
function AGIChatInput({
  onSendMessage,
  disabled,
  voiceEnabled,
}: {
  onSendMessage: (msg: string, isVoice?: boolean) => void;
  disabled: boolean;
  voiceEnabled: boolean;
}) {
  const [input, setInput] = useState('');

  // Use advanced voice hook
  const [voiceState, voiceActions] = useAdvancedVoice({
    autoSend: true,
    silenceTimeout: 2000, // 2 seconds of silence before auto-sending
    continuous: false,
    onSpeechEnd: async (text) => {
      if (text.trim()) {
        onSendMessage(text.trim(), true);
      }
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !disabled) {
      onSendMessage(input.trim(), false);
      setInput('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const isInputDisabled = disabled || voiceState.isListening || voiceState.isProcessing;

  return (
    <div className="border-t border-gray-100">
      {/* Error message */}
      {voiceState.error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="px-4 py-2 bg-red-50 border-t border-red-100 flex items-center gap-2"
        >
          <AlertCircle className="w-4 h-4 text-red-500" />
          <span className="text-sm text-red-600">{voiceState.error}</span>
          <button
            onClick={() => voiceActions.cancelListening()}
            className="ml-auto text-xs text-red-600 hover:text-red-800"
          >
            Dismiss
          </button>
        </motion.div>
      )}

      {/* Live transcript */}
      <AnimatePresence>
        {(voiceState.isListening || voiceState.transcript || voiceState.interimTranscript) && (
          <LiveTranscript
            transcript={voiceState.transcript}
            interimTranscript={voiceState.interimTranscript}
            isListening={voiceState.isListening}
          />
        )}
      </AnimatePresence>

      {/* Input form */}
      <form onSubmit={handleSubmit} className="p-3 flex items-center gap-2">
        {/* Voice controls */}
        {voiceEnabled && (
          <VoiceButton
            isListening={voiceState.isListening}
            isProcessing={voiceState.isProcessing}
            noiseLevel={voiceState.noiseLevel}
            isWhisperMode={voiceState.useWhisper}
            isSpeechSupported={voiceState.isSpeechSupported}
            onClick={voiceActions.toggleListening}
            onWhisperToggle={() => voiceActions.setUseWhisper(!voiceState.useWhisper)}
            disabled={disabled}
          />
        )}

        {/* Text input */}
        <div className="flex-1 relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              voiceState.isListening
                ? voiceState.useWhisper
                  ? 'Recording... tap mic to send'
                  : 'Listening... speak naturally'
                : voiceState.isProcessing
                ? 'Processing voice...'
                : voiceEnabled
                ? 'Type or tap mic to speak...'
                : 'Type a message...'
            }
            disabled={isInputDisabled}
            className="w-full px-4 py-2.5 rounded-full border border-gray-200 focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100 text-sm disabled:bg-gray-50 disabled:cursor-not-allowed"
          />
        </div>

        {/* Send button */}
        <button
          type="submit"
          disabled={isInputDisabled || !input.trim()}
          className="p-2.5 rounded-full bg-primary-600 text-white hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {disabled ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Send className="w-5 h-5" />
          )}
        </button>
      </form>

      {/* Voice hints */}
      {voiceEnabled && !voiceState.isListening && !voiceState.isProcessing && !disabled && (
        <div className="px-4 pb-2 text-center">
          <span className="text-xs text-gray-400">
            {voiceState.useWhisper
              ? '🎤 Whisper mode: Better for noisy environments'
              : voiceState.isSpeechSupported
              ? '🎤 Real-time mode: Speak naturally, auto-sends when you pause'
              : '🎤 Tap mic to record voice message'}
          </span>
        </div>
      )}
    </div>
  );
}

// Main Widget Component
export function AGIChatWidget() {
  const {
    messages,
    isOpen,
    isTyping,
    isPlayingAudio,
    unreadCount,
    voiceEnabled,
    hotelInfo,
    sendMessage,
    toggleChat,
    clearHistory,
    setVoiceEnabled,
    stopAudio,
  } = useAGIChat();

  // Get AI name from hotel config or default
  const aiName = hotelInfo?.ai_assistant_name || 'Aria';

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping]);

  // Handle message sending (supports voice flag)
  const handleSendMessage = (text: string, isVoice?: boolean) => {
    sendMessage(text);
  };

  return (
    <>
      {/* Floating Chat Button */}
      <motion.button
        onClick={toggleChat}
        className="fixed bottom-6 right-6 z-50 w-16 h-16 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white rounded-full shadow-2xl flex items-center justify-center transition-all"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 260, damping: 20 }}
      >
        {isOpen ? (
          <X className="w-7 h-7" />
        ) : (
          <>
            <div className="relative">
              <Sparkles className="w-7 h-7" />
              {unreadCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-3 -right-3 w-6 h-6 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center shadow-lg"
                >
                  {unreadCount > 9 ? '9+' : unreadCount}
                </motion.span>
              )}
            </div>
          </>
        )}
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed bottom-24 right-6 z-50 w-[420px] max-w-[calc(100vw-3rem)] h-[650px] max-h-[calc(100vh-8rem)] bg-white rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.3)] flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-primary-600 via-primary-600 to-primary-700 px-5 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-white/20 flex items-center justify-center shadow-lg backdrop-blur-sm">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-white font-bold text-lg">{aiName}</h3>
                  <p className="text-white/80 text-xs">AI Concierge • Always here to help</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                {/* Voice toggle */}
                <motion.button
                  onClick={() => setVoiceEnabled(!voiceEnabled)}
                  className={`p-2 rounded-lg transition-all ${
                    voiceEnabled ? 'bg-white/20 text-white' : 'hover:bg-white/10 text-white/60'
                  }`}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  title={voiceEnabled ? 'Disable voice' : 'Enable voice'}
                >
                  {voiceEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
                </motion.button>

                {/* Stop audio button (when playing) */}
                {isPlayingAudio && (
                  <motion.button
                    onClick={stopAudio}
                    className="p-2 bg-white/20 rounded-lg text-white"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    title="Stop audio"
                  >
                    <Square className="w-5 h-5" />
                  </motion.button>
                )}

                {/* Clear history */}
                <motion.button
                  onClick={clearHistory}
                  className="p-2 hover:bg-white/10 rounded-lg transition-all text-white/80 hover:text-white"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  title="Clear chat history"
                >
                  <Trash2 className="w-5 h-5" />
                </motion.button>

                {/* Minimize */}
                <motion.button
                  onClick={toggleChat}
                  className="p-2 hover:bg-white/10 rounded-lg transition-all text-white/80 hover:text-white"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  title="Minimize"
                >
                  <Minimize2 className="w-5 h-5" />
                </motion.button>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 bg-gradient-to-b from-gray-50 to-white">
              {messages.map((message) => (
                <AGIChatMessage key={message.id} message={message} />
              ))}
              {isTyping && <TypingIndicator aiName={aiName} />}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <AGIChatInput
              onSendMessage={handleSendMessage}
              disabled={isTyping}
              voiceEnabled={voiceEnabled}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default AGIChatWidget;
