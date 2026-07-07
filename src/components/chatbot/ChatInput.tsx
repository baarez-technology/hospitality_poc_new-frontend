import { useState, KeyboardEvent } from 'react';
import { Send } from 'lucide-react';
import { motion } from 'framer-motion';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  disabled?: boolean;
}

export function ChatInput({ onSendMessage, disabled }: ChatInputProps) {
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (input.trim() && !disabled) {
      onSendMessage(input);
      setInput('');
    }
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="border-t border-neutral-200 bg-white p-4 rounded-b-2xl">
      <div className="flex gap-3">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type your message..."
          disabled={disabled}
          className="flex-1 px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:border-primary-400 focus:bg-white transition-all disabled:opacity-50 disabled:cursor-not-allowed text-neutral-900 placeholder-neutral-400"
        />
        <motion.button
          onClick={handleSend}
          disabled={!input.trim() || disabled}
          className="p-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
          whileHover={{ scale: input.trim() && !disabled ? 1.05 : 1 }}
          whileTap={{ scale: input.trim() && !disabled ? 0.95 : 1 }}
        >
          <Send className="w-5 h-5" />
        </motion.button>
      </div>
    </div>
  );
}
