import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { useState, useEffect } from 'react';
import { Send, Bot, User as UserIcon } from 'lucide-react';

const demoMessages = [
  { type: 'user', text: 'I need a room with a great view for my anniversary' },
  { type: 'ai', text: "Congratulations on your anniversary! 🎉 I'd recommend our Ocean View Suite on the 12th floor. It features floor-to-ceiling windows with stunning sunset views, a private balcony, and complimentary champagne. Would you like me to check availability?" },
  { type: 'user', text: 'Perfect! What amenities are included?' },
  { type: 'ai', text: "The Ocean View Suite includes: ✨ King-size bed with luxury linens, 🛁 Spa-inspired bathroom with soaking tub, 🍾 Mini bar with premium selections, 📺 55\" Smart TV, 💼 Work desk with ergonomic chair, 🌡️ Climate control, and ☕ Nespresso machine. Plus, you'll get complimentary breakfast for two and late checkout!" },
];

export function AIAssistantShowcase() {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });
  const [messages, setMessages] = useState<typeof demoMessages>([]);
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);

  useEffect(() => {
    if (inView && currentMessageIndex < demoMessages.length) {
      const timer = setTimeout(() => {
        setMessages((prev) => [...prev, demoMessages[currentMessageIndex]]);
        setCurrentMessageIndex((prev) => prev + 1);
      }, currentMessageIndex === 0 ? 500 : 2000);

      return () => clearTimeout(timer);
    }
  }, [inView, currentMessageIndex]);

  return (
    <section ref={ref} className="py-28 sm:py-36 bg-gradient-to-b from-white via-neutral-50/30 to-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-20 items-center">
          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: -60 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.9, ease: "easeOut" }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={inView ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="inline-flex items-center gap-2.5 px-6 py-3 rounded-full bg-gradient-to-r from-primary-50 to-primary-100/70 border border-primary-200/50 mb-10 shadow-sm"
            >
              <Bot className="w-5 h-5 text-primary-600" />
              <span className="text-primary-700 text-sm font-semibold tracking-wide">AI Concierge</span>
            </motion.div>

            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-neutral-900 mb-9 leading-[1.1]">
              Your Personal
              <br />
              <span className="bg-gradient-to-r from-primary-600 via-primary-500 to-primary-400 bg-clip-text text-transparent">
                AI Assistant
              </span>
            </h2>

            <p className="text-lg sm:text-xl text-neutral-600 mb-12 leading-relaxed font-light">
              Get instant, personalized recommendations 24/7. Our AI understands your preferences
              and helps you make the most of your stay.
            </p>

            <div className="space-y-5">
              {[
                { icon: '🎯', title: 'Personalized Suggestions', desc: 'Room recommendations based on your needs' },
                { icon: '⚡', title: 'Instant Responses', desc: 'Get answers in seconds, any time of day' },
                { icon: '🧠', title: 'Smart Learning', desc: 'Improves with every interaction' },
              ].map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -40 }}
                  animate={inView ? { opacity: 1, x: 0 } : {}}
                  transition={{ type: "spring", stiffness: 120, damping: 22, delay: 0.4 + index * 0.12 }}
                  whileHover={{ x: 8, transition: { type: "spring", stiffness: 400, damping: 25 } }}
                  className="flex gap-5 p-6 rounded-[1.25rem] hover:bg-gradient-to-r hover:from-primary-50/70 hover:to-primary-50/40 transition-all duration-400 border border-transparent hover:border-primary-100/50 hover:shadow-lg"
                >
                  <div className="flex-shrink-0 w-16 h-16 rounded-[1rem] bg-gradient-to-br from-primary-50 to-primary-100/80 flex items-center justify-center text-2xl shadow-md">
                    {feature.icon}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-neutral-900 mb-2.5">{feature.title}</h3>
                    <p className="text-neutral-600 leading-relaxed font-light">{feature.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Chat Interface Mockup */}
          <motion.div
            initial={{ opacity: 0, x: 60 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.9, delay: 0.2, ease: "easeOut" }}
          >
            <div className="relative">
              {/* Chat Window */}
              <div className="bg-white rounded-[2rem] shadow-[0_24px_80px_rgba(0,0,0,0.12)] overflow-hidden border border-neutral-200/80">
                {/* Header */}
                <div className="bg-gradient-to-r from-primary-500 to-primary-600 px-7 py-6 flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-xl">
                    <Bot className="w-8 h-8 text-white" strokeWidth={2} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-white font-bold text-xl mb-1">TERRA AI Concierge</h3>
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-green-400 animate-pulse shadow-lg" />
                      <span className="text-white/95 text-sm font-medium">Online</span>
                    </div>
                  </div>
                </div>

                {/* Messages */}
                <div className="p-7 space-y-5 h-[28rem] overflow-y-auto bg-gradient-to-b from-neutral-50/50 to-neutral-50">
                  {/* Welcome Message */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex gap-3.5"
                  >
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center shadow-lg">
                      <Bot className="w-5 h-5 text-white" strokeWidth={2} />
                    </div>
                    <div className="flex-1 bg-white rounded-[1.25rem] rounded-tl-sm px-5 py-4 shadow-md border border-neutral-100">
                      <p className="text-neutral-700 leading-relaxed">
                        Hi! I'm your AI concierge. How can I help you today? ✨
                      </p>
                    </div>
                  </motion.div>

                  {/* Demo Messages */}
                  {messages.map((message, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ duration: 0.5, ease: "easeOut" }}
                      className={`flex gap-3.5 ${message.type === 'user' ? 'flex-row-reverse' : ''}`}
                    >
                      <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center shadow-lg ${
                        message.type === 'ai' ? 'bg-gradient-to-br from-primary-500 to-primary-600' : 'bg-gradient-to-br from-neutral-400 to-neutral-500'
                      }`}>
                        {message.type === 'ai' ? (
                          <Bot className="w-5 h-5 text-white" strokeWidth={2} />
                        ) : (
                          <UserIcon className="w-5 h-5 text-white" strokeWidth={2} />
                        )}
                      </div>
                      <div className={`flex-1 rounded-[1.25rem] px-5 py-4 shadow-md max-w-[85%] ${
                        message.type === 'ai'
                          ? 'bg-white rounded-tl-sm border border-neutral-100'
                          : 'bg-gradient-to-br from-primary-500 to-primary-600 text-white rounded-tr-sm'
                      }`}>
                        <p className={`leading-relaxed ${message.type === 'ai' ? 'text-neutral-700' : ''}`}>
                          {message.text}
                        </p>
                      </div>
                    </motion.div>
                  ))}

                  {/* Typing Indicator */}
                  {currentMessageIndex < demoMessages.length && messages.length > 0 && messages.length % 2 !== 0 && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex gap-3"
                    >
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary-500 flex items-center justify-center">
                        <Bot className="w-4 h-4 text-white" />
                      </div>
                      <div className="bg-white rounded-2xl rounded-tl-none px-4 py-3 shadow-sm">
                        <div className="flex gap-1">
                          <div className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                          <div className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                          <div className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>

                {/* Input */}
                <div className="p-6 bg-white border-t border-neutral-200/80">
                  <div className="flex gap-4">
                    <input
                      type="text"
                      placeholder="Ask me anything..."
                      className="flex-1 px-6 py-4 bg-neutral-50/80 border border-neutral-200 rounded-[1.25rem] focus:outline-none focus:border-primary-400 focus:bg-white transition-all duration-300 shadow-sm focus:shadow-md font-light"
                      disabled
                    />
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 rounded-[1.25rem] flex items-center justify-center text-white transition-all duration-300 shadow-lg hover:shadow-xl"
                    >
                      <Send className="w-6 h-6" strokeWidth={2} />
                    </motion.button>
                  </div>
                </div>
              </div>

              {/* Decorative Glow */}
              <div className="absolute -inset-1 bg-gradient-to-r from-primary-400/40 to-primary-600/40 rounded-[2rem] blur-3xl -z-10 opacity-60" />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
