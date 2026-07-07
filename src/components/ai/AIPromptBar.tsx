import React, { useState, useRef, useEffect } from 'react';
import { Send, Mic } from 'lucide-react';

/**
 * AI Prompt Bar Component
 * Glimmora Design System v5.0 - Clean, no gradients
 */
export default function AIPromptBar({ onSendMessage, onVoiceClick, isListening }) {
  const [input, setInput] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const textareaRef = useRef(null);

  // Handle send
  const handleSend = () => {
    if (input.trim().length === 0) return;

    onSendMessage(input);
    setInput('');

    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  // Handle key down
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Auto-resize textarea
  const handleInput = (e) => {
    setInput(e.target.value);

    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  };

  // Focus input when component mounts
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  }, []);

  return (
    <div className="flex-shrink-0 border-t border-neutral-100 bg-white p-3 sm:p-4 sm:rounded-b-2xl">
      <div className="flex items-end gap-2 sm:gap-3">
        {/* Voice button */}
        <button
          onClick={onVoiceClick}
          className={`flex-shrink-0 w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center transition-all ${
            isListening
              ? 'bg-rose-500 text-white'
              : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
          }`}
          title={isListening ? 'Stop recording' : 'Voice input'}
        >
          <Mic className={`w-4 h-4 sm:w-[18px] sm:h-[18px] ${isListening ? 'animate-pulse' : ''}`} />
        </button>

        {/* Input field */}
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder="Ask Glimmora anything..."
            rows={1}
            className={`w-full px-3 sm:px-4 py-2 sm:py-2.5 bg-white rounded-xl resize-none focus:outline-none text-[12px] sm:text-[13px] text-neutral-900 placeholder:text-neutral-400 transition-all border ${
              isFocused
                ? 'border-terra-400 ring-2 ring-terra-500/10'
                : 'border-neutral-200 hover:border-neutral-300'
            }`}
            style={{ maxHeight: '120px', overflowY: 'auto' }}
          />
        </div>

        {/* Send button */}
        <button
          onClick={handleSend}
          disabled={input.trim().length === 0}
          className={`flex-shrink-0 w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center transition-all ${
            input.trim().length > 0
              ? 'bg-terra-500 text-white hover:bg-terra-600'
              : 'bg-neutral-100 text-neutral-300 cursor-not-allowed'
          }`}
          title="Send message"
        >
          <Send className="w-4 h-4 sm:w-[18px] sm:h-[18px]" />
        </button>
      </div>

      {/* Hint text - hidden on mobile */}
      <div className="hidden sm:flex items-center gap-3 mt-2.5 px-1">
        <p className="text-[10px] text-neutral-400 flex items-center gap-2">
          <span className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 bg-neutral-100 border border-neutral-200 rounded text-[9px] font-medium text-neutral-500">Enter</kbd>
            <span>to send</span>
          </span>
          <span className="text-neutral-300">·</span>
          <span className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 bg-neutral-100 border border-neutral-200 rounded text-[9px] font-medium text-neutral-500">Shift + Enter</kbd>
            <span>for new line</span>
          </span>
        </p>
      </div>
    </div>
  );
}
