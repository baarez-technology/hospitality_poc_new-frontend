/**
 * Guest AI Assistant - Booking Assistant (Baarez AI)
 * This component is specifically for the AGI booking assistant
 * For general guest chat, use GuestChatWidget instead
 *
 * Key differences:
 * - GuestChatWidget: General inquiries, housekeeping, maintenance, FAQs
 * - GuestAIAssistant (this): Booking creation, availability checks
 */

import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Send, Trash2, Loader2, Calendar, Users, BedDouble } from 'lucide-react';
import { useGuestAI } from '@/hooks/guest/useGuestAI';
import { useState, useRef, useEffect } from 'react';

interface GuestAIAssistantProps {
  isOpen: boolean;
  onClose: () => void;
}

export function GuestAIAssistant({ isOpen, onClose }: GuestAIAssistantProps) {
  const {
    messages,
    isTyping,
    sendMessage,
    clearConversation,
    conversationEndRef,
  } = useGuestAI();

  const [input, setInput] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSend = () => {
    if (input.trim() && !isTyping) {
      sendMessage(input.trim());
      setInput('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-neutral-200 bg-gradient-to-r from-accent-600 to-accent-700">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-white font-semibold text-lg">Baarez AI</h3>
                  <p className="text-white/80 text-xs">Your booking assistant</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={clearConversation}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                  title="Clear conversation"
                >
                  <Trash2 className="w-4 h-4 text-white" />
                </button>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-neutral-50">
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                      message.type === 'user'
                        ? 'bg-accent-600 text-white rounded-br-md'
                        : 'bg-white text-neutral-900 rounded-bl-md shadow-sm border border-neutral-100'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{message.text}</p>

                    {/* Booking State Display */}
                    {message.bookingState?.booking_ready && (
                      <div className="mt-3 pt-3 border-t border-neutral-200">
                        <p className="text-xs font-medium text-accent-700 mb-2 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          Booking Ready
                        </p>
                        <div className="text-xs space-y-1.5 bg-accent-50 p-2 rounded-lg">
                          {message.bookingState.check_in_date && (
                            <div className="flex items-center gap-2">
                              <span className="text-neutral-500">Check-in:</span>
                              <span className="font-medium">{message.bookingState.check_in_date}</span>
                            </div>
                          )}
                          {message.bookingState.check_out_date && (
                            <div className="flex items-center gap-2">
                              <span className="text-neutral-500">Check-out:</span>
                              <span className="font-medium">{message.bookingState.check_out_date}</span>
                            </div>
                          )}
                          {message.bookingState.room_type && (
                            <div className="flex items-center gap-2">
                              <BedDouble className="w-3 h-3 text-neutral-500" />
                              <span className="font-medium">{message.bookingState.room_type}</span>
                            </div>
                          )}
                          {(message.bookingState.adults || message.bookingState.children) && (
                            <div className="flex items-center gap-2">
                              <Users className="w-3 h-3 text-neutral-500" />
                              <span className="font-medium">
                                {message.bookingState.adults || 1} Adult{(message.bookingState.adults || 1) > 1 ? 's' : ''}
                                {message.bookingState.children > 0 && `, ${message.bookingState.children} Child${message.bookingState.children > 1 ? 'ren' : ''}`}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}

              {/* Typing Indicator */}
              {isTyping && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-start"
                >
                  <div className="bg-white rounded-2xl px-4 py-3 shadow-sm border border-neutral-100 rounded-bl-md">
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin text-accent-600" />
                      <span className="text-sm text-neutral-600">Baarez is thinking...</span>
                    </div>
                  </div>
                </motion.div>
              )}

              <div ref={conversationEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-neutral-200 bg-white">
              <div className="flex items-center gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your message..."
                  disabled={isTyping}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || isTyping}
                  className="p-2.5 bg-accent-600 text-white rounded-xl hover:bg-accent-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
              <div className="flex flex-wrap gap-2 mt-3">
                <button
                  onClick={() => sendMessage("I'd like to make a booking")}
                  className="text-xs px-3 py-1.5 bg-accent-50 text-accent-700 rounded-full hover:bg-accent-100 transition-colors"
                >
                  Make a booking
                </button>
                <button
                  onClick={() => sendMessage("What rooms do you have available?")}
                  className="text-xs px-3 py-1.5 bg-neutral-100 text-neutral-700 rounded-full hover:bg-neutral-200 transition-colors"
                >
                  Check availability
                </button>
                <button
                  onClick={() => sendMessage("What are your room rates?")}
                  className="text-xs px-3 py-1.5 bg-neutral-100 text-neutral-700 rounded-full hover:bg-neutral-200 transition-colors"
                >
                  View rates
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export default GuestAIAssistant;
