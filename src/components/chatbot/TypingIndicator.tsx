import { motion } from 'framer-motion';

export function TypingIndicator() {
  return (
    <div className="flex gap-3 mb-4">
      <div className="flex-shrink-0 w-9 h-9 rounded-full bg-primary-500 flex items-center justify-center shadow-md">
        <span className="text-white text-sm font-bold">AI</span>
      </div>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-neutral-100 rounded-2xl rounded-tl-none px-5 py-4 shadow-md"
      >
        <div className="flex gap-1.5">
          <motion.div
            className="w-2.5 h-2.5 bg-neutral-400 rounded-full"
            animate={{
              y: [0, -8, 0],
            }}
            transition={{
              duration: 0.6,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: 0,
            }}
          />
          <motion.div
            className="w-2.5 h-2.5 bg-neutral-400 rounded-full"
            animate={{
              y: [0, -8, 0],
            }}
            transition={{
              duration: 0.6,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: 0.15,
            }}
          />
          <motion.div
            className="w-2.5 h-2.5 bg-neutral-400 rounded-full"
            animate={{
              y: [0, -8, 0],
            }}
            transition={{
              duration: 0.6,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: 0.3,
            }}
          />
        </div>
      </motion.div>
    </div>
  );
}
