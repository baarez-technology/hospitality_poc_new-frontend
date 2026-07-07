import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Mic, MicOff, Sparkles, Loader2, AlertCircle, Zap, Radio } from 'lucide-react';
import { useAdvancedVoice } from '@/hooks/admin/useAdvancedVoice';

/**
 * AI Prompt Bar Component with Real-Time Voice Support
 * Features:
 * - Real-time speech recognition (like Siri/Google Assistant)
 * - Whisper fallback for noisy environments
 * - Visual feedback during voice input
 * - Noise level indicator
 * - Auto-send when speech ends
 */

interface AIPromptBarProps {
  onSendMessage: (message: string, isVoice?: boolean) => void;
  isDisabled?: boolean;
  hasMessages?: boolean;
}

// Noise Level Indicator Component
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
                ? 'bg-amber-400'
                : 'bg-emerald-400'
              : 'bg-neutral-300'
          }`}
          style={{ height: `${8 + i * 3}px` }}
          animate={{ opacity: i < activeBars ? 1 : 0.3 }}
        />
      ))}
      {isWhisperMode && (
        <span className="ml-1 text-xs text-[#A57865] font-medium">Whisper</span>
      )}
    </div>
  );
}

// Live Transcript Display Component
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
      className="px-5 py-3 bg-gradient-to-r from-[#A57865]/10 to-[#CDB261]/10 border-b border-[#A57865]/20"
    >
      <div className="flex items-center gap-2 text-sm">
        <motion.div
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 0.5, repeat: Infinity }}
          className="w-2 h-2 rounded-full bg-rose-500"
        />
        <span className="text-neutral-700">
          {transcript}
          <span className="text-neutral-400 italic">{interimTranscript}</span>
          {!transcript && !interimTranscript && (
            <span className="text-neutral-400 italic">Listening...</span>
          )}
        </span>
      </div>
    </motion.div>
  );
}

// Advanced Voice Button with Visual Feedback
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
          className={`p-2 rounded-lg transition-all ${
            isWhisperMode
              ? 'bg-[#A57865]/20 text-[#A57865]'
              : 'bg-neutral-100 text-neutral-500 hover:bg-neutral-200'
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
        className={`group relative flex-shrink-0 p-3.5 rounded-xl transition-all duration-300 shadow-sm hover:shadow-md ${
          isListening
            ? 'bg-gradient-to-br from-rose-500 to-rose-600 text-white scale-105 shadow-lg'
            : isProcessing
            ? 'bg-gradient-to-br from-amber-500 to-amber-600 text-white'
            : 'bg-white hover:bg-gradient-to-br hover:from-[#A57865]/10 hover:to-[#CDB261]/10 text-neutral-600 hover:text-[#A57865] border border-neutral-200 hover:border-[#A57865]/40'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        animate={isListening ? { scale: [1, 1.05, 1] } : {}}
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
            className="absolute inset-0 rounded-xl bg-rose-400"
            animate={{ scale: [1, 1.5], opacity: [0.5, 0] }}
            transition={{ duration: 1, repeat: Infinity }}
          />
        )}

        {isProcessing ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : isListening ? (
          <MicOff className="w-5 h-5 relative z-10" />
        ) : (
          <Mic className={`w-5 h-5 transition-transform ${!disabled && 'group-hover:scale-110'}`} />
        )}
      </motion.button>

      {/* Noise level indicator when listening */}
      {isListening && (
        <NoiseLevelIndicator level={noiseLevel} isWhisperMode={isWhisperMode} />
      )}
    </div>
  );
}

export default function AIPromptBar({ onSendMessage, isDisabled = false, hasMessages = false }: AIPromptBarProps) {
  const [input, setInput] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Use advanced voice hook with auto-send
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

  // Handle send
  const handleSend = () => {
    if (input.trim().length === 0) return;

    onSendMessage(input, false);
    setInput('');

    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  // Handle key down
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Auto-resize textarea
  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);

    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  };

  // Focus input when component mounts or when conversation starts
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  }, []);

  const isInputDisabled = isDisabled || voiceState.isListening || voiceState.isProcessing;

  return (
    <div className="flex-shrink-0 border-t border-[#A57865]/20 bg-gradient-to-br from-white via-[#FAF8F6] to-white rounded-b-3xl overflow-hidden">
      {/* Error message */}
      <AnimatePresence>
        {voiceState.error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="px-5 py-2 bg-red-50 border-b border-red-100 flex items-center gap-2"
          >
            <AlertCircle className="w-4 h-4 text-red-500" />
            <span className="text-sm text-red-600">{voiceState.error}</span>
            <button
              onClick={() => voiceActions.cancelListening()}
              className="ml-auto text-xs text-red-600 hover:text-red-800 font-medium"
            >
              Dismiss
            </button>
          </motion.div>
        )}
      </AnimatePresence>

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

      <div className="p-5">
        <div className="flex items-end gap-3">
          {/* Voice button with advanced features */}
          <VoiceButton
            isListening={voiceState.isListening}
            isProcessing={voiceState.isProcessing}
            noiseLevel={voiceState.noiseLevel}
            isWhisperMode={voiceState.useWhisper}
            isSpeechSupported={voiceState.isSpeechSupported}
            onClick={voiceActions.toggleListening}
            onWhisperToggle={() => voiceActions.setUseWhisper(!voiceState.useWhisper)}
            disabled={isDisabled}
          />

          {/* Input field wrapper */}
          <div className="flex-1 relative">
            <div className="relative">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={handleInput}
                onKeyDown={handleKeyDown}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                placeholder={
                  voiceState.isListening
                    ? voiceState.useWhisper
                      ? 'Recording... tap mic to send'
                      : 'Listening... speak naturally'
                    : voiceState.isProcessing
                    ? 'Processing voice...'
                    : 'Ask Glimmora anything about your hotel...'
                }
                disabled={isInputDisabled}
                rows={1}
                className={`w-full px-5 py-4 pr-14 bg-gradient-to-r from-white to-[#FAF8F6] rounded-xl resize-none focus:outline-none text-sm text-neutral-800 placeholder:text-neutral-400 transition-all duration-300 disabled:bg-neutral-50 disabled:cursor-not-allowed ${
                  isFocused
                    ? 'ring-2 ring-[#A57865]/50 shadow-lg'
                    : 'ring-1 ring-neutral-200 hover:ring-[#A57865]/30 shadow-sm hover:shadow'
                }`}
                style={{ maxHeight: '120px', overflowY: 'auto' }}
              />

              {/* AI Icon indicator */}
              <div className={`absolute right-4 top-4 transition-all duration-300 ${
                isFocused ? 'scale-110 rotate-12' : ''
              }`}>
                <Sparkles className={`w-5 h-5 transition-colors ${
                  isFocused ? 'text-[#A57865]' : 'text-[#A57865]/60'
                }`} />
              </div>
            </div>
          </div>

          {/* Send button */}
          <button
            onClick={handleSend}
            disabled={isInputDisabled || input.trim().length === 0}
            className={`group relative flex-shrink-0 p-3.5 rounded-xl transition-all duration-300 shadow-sm hover:shadow-lg ${
              input.trim().length > 0 && !isInputDisabled
                ? 'bg-gradient-to-br from-[#A57865] via-[#8E6554] to-[#A57865] text-white hover:scale-105 hover:-translate-y-0.5 cursor-pointer'
                : 'bg-neutral-100 text-neutral-300 cursor-not-allowed border border-neutral-200'
            }`}
            title="Send message"
          >
            {isDisabled ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className={`w-5 h-5 transition-transform ${
                input.trim().length > 0 && !isInputDisabled ? 'group-hover:translate-x-0.5 group-hover:-translate-y-0.5' : ''
              }`} />
            )}

            {/* Shine effect on hover */}
            {input.trim().length > 0 && !isInputDisabled && (
              <div className="absolute inset-0 rounded-xl overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="absolute top-0 left-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 translate-x-[-200%] group-hover:translate-x-[400%] transition-transform duration-700"></div>
                </div>
              </div>
            )}
          </button>
        </div>

        {/* Enhanced hint text */}
        <div className="flex items-center justify-between mt-3 px-1">
          <div className="text-xs text-neutral-500 flex items-center gap-2 flex-wrap">
            <span className="flex items-center gap-1">
              <kbd className="px-2 py-1 bg-white border border-neutral-200 rounded-md text-[10px] font-semibold text-neutral-600 shadow-sm">Enter</kbd>
              <span>to send</span>
            </span>
            <span className="text-neutral-300">•</span>
            <span className="flex items-center gap-1">
              <kbd className="px-2 py-1 bg-white border border-neutral-200 rounded-md text-[10px] font-semibold text-neutral-600 shadow-sm">Shift + Enter</kbd>
              <span>for new line</span>
            </span>
            {/* Voice mode hint */}
            {!voiceState.isListening && !voiceState.isProcessing && (
              <>
                <span className="text-neutral-300">•</span>
                <span className="text-[#A57865]">
                  {voiceState.useWhisper
                    ? 'Whisper mode'
                    : voiceState.isSpeechSupported
                    ? 'Real-time voice'
                    : 'Voice recording'}
                </span>
              </>
            )}
          </div>

          {/* Character count when typing */}
          {input.length > 0 && (
            <span className={`text-xs font-medium transition-colors ${
              input.length > 500 ? 'text-orange-500' : 'text-neutral-400'
            }`}>
              {input.length}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
