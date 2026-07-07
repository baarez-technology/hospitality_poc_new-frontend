import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

interface GuestAIFloatingButtonProps {
  onClick: () => void;
}

export function GuestAIFloatingButton({ onClick }: GuestAIFloatingButtonProps) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-full shadow-lg hover:shadow-xl transition-shadow flex items-center justify-center z-50"
      aria-label="Open AI Assistant"
    >
      <Sparkles className="w-6 h-6" />
      <motion.div
        className="absolute inset-0 rounded-full bg-primary-400"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.5, 0, 0.5],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
        }}
      />
    </motion.button>
  );
}

