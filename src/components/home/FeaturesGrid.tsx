import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import {
  Sparkles,
  Shield,
  Leaf,
  Clock,
  Award,
  Wifi
} from 'lucide-react';

const features = [
  {
    icon: Sparkles,
    title: 'AI Room Selection',
    description: 'Intelligent recommendations powered by machine learning to find your perfect suite',
    color: 'from-purple-500 to-pink-500',
  },
  {
    icon: Shield,
    title: 'Secure Booking',
    description: 'Bank-level encryption and secure payment processing for peace of mind',
    color: 'from-blue-500 to-cyan-500',
  },
  {
    icon: Leaf,
    title: 'Eco-Friendly',
    description: 'Sustainable luxury with natural materials and carbon-neutral operations',
    color: 'from-green-500 to-emerald-500',
  },
  {
    icon: Clock,
    title: '24/7 Concierge',
    description: 'Round-the-clock AI-assisted service for all your needs',
    color: 'from-orange-500 to-red-500',
  },
  {
    icon: Award,
    title: 'Award Winning',
    description: 'Recognized for excellence in hospitality and innovative technology',
    color: 'from-yellow-500 to-orange-500',
  },
  {
    icon: Wifi,
    title: 'Smart Rooms',
    description: 'IoT-enabled suites with voice control and personalized settings',
    color: 'from-indigo-500 to-purple-500',
  },
];

export function FeaturesGrid() {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });

  return (
    <section ref={ref} className="pt-[100px] pb-28 sm:pb-36 bg-gradient-to-b from-white via-neutral-50/50 to-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="text-center mb-24"
        >
          <motion.span
            initial={{ opacity: 0, scale: 0.8 }}
            animate={inView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="inline-block px-5 py-2.5 rounded-full bg-gradient-to-r from-primary-50 to-primary-100/80 text-primary-700 font-semibold text-sm uppercase tracking-wider mb-8 shadow-sm"
          >
            Why Choose Us
          </motion.span>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-neutral-900 mb-7 leading-[1.1]">
            Experience the Future of
            <br />
            <span className="bg-gradient-to-r from-primary-600 via-primary-500 to-primary-400 bg-clip-text text-transparent">
              Hospitality
            </span>
          </h2>
          <p className="text-lg sm:text-xl text-neutral-600 max-w-2xl mx-auto leading-relaxed font-light">
            Cutting-edge technology meets timeless luxury in every aspect of your stay
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 60 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ type: "spring", stiffness: 120, damping: 22, delay: index * 0.12 }}
                whileHover={{ y: -16, transition: { type: "spring", stiffness: 350, damping: 25 } }}
                className="group"
              >
                <div className="relative bg-white rounded-[2rem] p-10 shadow-[0_10px_40px_rgba(0,0,0,0.06)] hover:shadow-[0_24px_80px_rgba(0,0,0,0.12)] transition-all duration-500 border border-neutral-100/80 hover:border-neutral-200 overflow-hidden h-full">
                  {/* Gradient Background on Hover */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-[0.04] transition-opacity duration-500`} />

                  {/* Icon */}
                  <div className={`relative w-20 h-20 rounded-[1.25rem] bg-gradient-to-br ${feature.color} p-4 mb-8 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-[0_8px_24px_rgba(0,0,0,0.15)]`}>
                    <Icon className="w-full h-full text-white" strokeWidth={1.5} />
                  </div>

                  {/* Content */}
                  <h3 className="text-2xl font-bold text-neutral-900 mb-4 group-hover:text-primary-600 transition-colors duration-300">
                    {feature.title}
                  </h3>
                  <p className="text-neutral-600 leading-relaxed text-base font-light">
                    {feature.description}
                  </p>

                  {/* Decorative Element */}
                  <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-primary-100/20 to-transparent rounded-full -mr-20 -mt-20 group-hover:scale-[1.8] transition-transform duration-700" />
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
