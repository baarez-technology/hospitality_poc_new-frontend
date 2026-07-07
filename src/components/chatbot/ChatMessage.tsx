import { motion } from 'framer-motion';
import { Message } from '@/contexts/ChatContext';
import { User } from 'lucide-react';

interface ChatMessageProps {
  message: Message;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.type === 'user';

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.3 }}
      className={`flex gap-3 mb-4 ${isUser ? 'flex-row-reverse' : ''}`}
    >
      {/* Avatar */}
      <div
        className={`flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center shadow-md ${
          isUser ? 'bg-neutral-400' : 'bg-primary-500'
        }`}
      >
        {isUser ? (
          <User className="w-5 h-5 text-white" />
        ) : (
          <span className="text-white text-sm font-bold">AI</span>
        )}
      </div>

      {/* Message Bubble */}
      <div className={`flex-1 max-w-[75%] ${isUser ? 'flex flex-col items-end' : ''}`}>
        <div
          className={`rounded-2xl px-5 py-3.5 shadow-md ${
            isUser
              ? 'bg-primary-600 text-white rounded-tr-none'
              : 'bg-neutral-100 text-neutral-900 rounded-tl-none'
          }`}
        >
          <p className="leading-relaxed whitespace-pre-wrap break-words">{message.content}</p>
        </div>

        {/* Timestamp */}
        <p className="text-xs text-neutral-500 mt-1.5 px-2">
          {formatTime(message.timestamp)}
        </p>

        {/* Quick Actions */}
        {message.quickActions && message.quickActions.length > 0 && (
          <div className="mt-3 grid grid-cols-2 gap-2">
            {message.quickActions.map((action, index) => (
              <motion.button
                key={index}
                onClick={action.action}
                className="px-4 py-2.5 text-sm font-semibold text-primary-600 bg-white border-2 border-primary-300 rounded-xl hover:bg-primary-50 transition-all shadow-sm"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {action.label}
              </motion.button>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
