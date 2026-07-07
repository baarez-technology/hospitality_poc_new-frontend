import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { useState } from 'react';
import {
  Calendar,
  User,
  Sparkles,
  FileText,
  CheckCircle,
  ArrowRight,
  Monitor
} from 'lucide-react';

const steps = [
  {
    number: 1,
    title: 'Access Pre-Check-In',
    description: 'Receive a link 24 hours before arrival to start your seamless check-in process',
    icon: Calendar,
    mockup: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80',
    highlight: 'Email or SMS notification',
  },
  {
    number: 2,
    title: 'Personal Information',
    description: 'Securely provide your details with our encrypted form system',
    icon: User,
    mockup: 'https://images.unsplash.com/photo-1551650975-87deedd944c3?w=800&q=80',
    highlight: 'Auto-fill from profile',
  },
  {
    number: 3,
    title: 'AI Room Selection',
    description: 'Our AI analyzes your preferences to recommend the perfect suite for you',
    icon: Sparkles,
    mockup: 'https://images.unsplash.com/photo-1487058792275-0ad4aaf24ca7?w=800&q=80',
    highlight: 'Personalized recommendations',
  },
  {
    number: 4,
    title: 'Upload Documents',
    description: 'Securely upload ID and payment information for express check-in',
    icon: FileText,
    mockup: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800&q=80',
    highlight: 'Drag & drop upload',
  },
  {
    number: 5,
    title: 'Ready to Arrive',
    description: 'Walk straight to your room - your digital key is already active',
    icon: CheckCircle,
    mockup: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&q=80',
    highlight: 'Skip the front desk',
  },
];

export function PreCheckInShowcase() {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });
  const [activeStep, setActiveStep] = useState(0);

  return (
    <section ref={ref} className="py-28 sm:py-36 bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900 text-white overflow-hidden relative">
      {/* Decorative Background Elements */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary-500/30 rounded-full blur-[120px]" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary-600/20 rounded-full blur-[140px]" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="text-center mb-24"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={inView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="inline-flex items-center gap-2.5 px-6 py-3 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 mb-10 shadow-[0_8px_32px_rgba(0,0,0,0.3)]"
          >
            <Monitor className="w-5 h-5 text-primary-400" />
            <span className="text-white text-sm font-semibold tracking-wide">Pre-Check-In Experience</span>
          </motion.div>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-8 leading-[1.1]">
            Skip the Line,
            <br />
            <span className="bg-gradient-to-r from-primary-300 via-primary-200 to-primary-100 bg-clip-text text-transparent">
              Start Relaxing Sooner
            </span>
          </h2>
          <p className="text-lg sm:text-xl text-white/85 max-w-2xl mx-auto leading-relaxed font-light">
            Complete your check-in online before you arrive and walk straight to your room
          </p>
        </motion.div>

        {/* Interactive Steps */}
        <div className="max-w-7xl mx-auto">
          {/* Desktop Mockup Display */}
          <motion.div
            initial={{ opacity: 0, y: 60 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.9, ease: "easeOut" }}
            className="mb-20"
          >
            <div className="relative">
              {/* Browser Window Frame */}
              <div className="bg-neutral-800/90 backdrop-blur-sm rounded-t-[1.75rem] px-7 py-5 flex items-center gap-2.5 border-b border-neutral-700/50">
                <div className="flex gap-2.5">
                  <div className="w-3.5 h-3.5 rounded-full bg-red-500 shadow-lg" />
                  <div className="w-3.5 h-3.5 rounded-full bg-yellow-500 shadow-lg" />
                  <div className="w-3.5 h-3.5 rounded-full bg-green-500 shadow-lg" />
                </div>
                <div className="flex-1 ml-6 bg-neutral-700/80 rounded-[0.875rem] px-5 py-3 text-sm text-white/70 font-medium">
                  terrasuites.com/pre-checkin
                </div>
              </div>

              {/* Mockup Content */}
              <div className="relative bg-white rounded-b-[1.75rem] overflow-hidden aspect-video shadow-[0_32px_96px_rgba(0,0,0,0.5)]">
                <motion.img
                  key={activeStep}
                  src={steps[activeStep].mockup}
                  alt={steps[activeStep].title}
                  className="w-full h-full object-cover"
                  initial={{ opacity: 0, scale: 1.05 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                />

                {/* Overlay Info */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/85 via-black/60 to-transparent p-10">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-14 h-14 rounded-[1rem] bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center shadow-[0_8px_24px_rgba(0,0,0,0.3)]">
                      {(() => {
                        const Icon = steps[activeStep].icon;
                        return <Icon className="w-7 h-7 text-white" strokeWidth={2} />;
                      })()}
                    </div>
                    <div>
                      <div className="text-sm text-white/70 font-medium mb-1">Step {steps[activeStep].number} of 5</div>
                      <h3 className="text-2xl font-bold text-white">{steps[activeStep].title}</h3>
                    </div>
                  </div>
                  <p className="text-white/85 text-lg mb-3 font-light">{steps[activeStep].description}</p>
                  <div className="inline-flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-primary-500/25 border border-primary-400/40 shadow-lg">
                    <Sparkles className="w-4 h-4 text-primary-300" />
                    <span className="text-sm text-primary-200 font-medium">{steps[activeStep].highlight}</span>
                  </div>
                </div>
              </div>

              {/* Decorative Glow */}
              <div className="absolute -inset-2 bg-gradient-to-r from-primary-500/50 to-primary-600/50 rounded-[2rem] blur-3xl -z-10 opacity-70" />
            </div>
          </motion.div>

          {/* Step Navigation */}
          <div className="grid grid-cols-5 gap-5">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = activeStep === index;

              return (
                <motion.button
                  key={index}
                  onClick={() => setActiveStep(index)}
                  initial={{ opacity: 0, y: 40 }}
                  animate={inView ? { opacity: 1, y: 0 } : {}}
                  transition={{ type: "spring", stiffness: 120, damping: 18, delay: index * 0.12 }}
                  whileHover={{ y: -10, scale: 1.02, transition: { type: "spring", stiffness: 450, damping: 25 } }}
                  whileTap={{ scale: 0.98 }}
                  className={`relative p-7 rounded-[1.5rem] transition-all duration-400 ${
                    isActive
                      ? 'bg-gradient-to-br from-primary-500 to-primary-600 shadow-[0_24px_48px_rgba(99,102,241,0.5)]'
                      : 'bg-white/5 hover:bg-white/10 backdrop-blur-md border border-white/10 hover:border-white/25 shadow-lg hover:shadow-xl'
                  }`}
                >
                  {/* Step Number Badge */}
                  <div className={`absolute -top-3 -right-3 w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm shadow-lg ${
                    isActive ? 'bg-white text-primary-600' : 'bg-gradient-to-br from-primary-500 to-primary-600 text-white'
                  }`}>
                    {step.number}
                  </div>

                  {/* Icon */}
                  <div className={`w-14 h-14 rounded-[1rem] flex items-center justify-center mb-5 mx-auto transition-all duration-300 ${
                    isActive ? 'bg-white/20' : 'bg-white/10'
                  }`}>
                    <Icon className={`w-7 h-7 ${isActive ? 'text-white' : 'text-white/70'}`} strokeWidth={1.5} />
                  </div>

                  {/* Title */}
                  <h4 className={`text-sm font-semibold text-center transition-colors duration-300 ${
                    isActive ? 'text-white' : 'text-white/75'
                  }`}>
                    {step.title}
                  </h4>

                  {/* Active Indicator */}
                  {isActive && (
                    <motion.div
                      layoutId="activeIndicator"
                      className="absolute bottom-0 left-1/2 -translate-x-1/2 w-16 h-1.5 bg-white rounded-full shadow-lg"
                      transition={{ type: 'spring', stiffness: 350, damping: 35 }}
                    />
                  )}
                </motion.button>
              );
            })}
          </div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.9 }}
            className="text-center mt-24"
          >
            <motion.button
              className="inline-flex items-center gap-3 px-12 py-6 bg-gradient-to-r from-white to-neutral-50 hover:from-neutral-50 hover:to-white text-neutral-900 font-bold text-lg rounded-[1.25rem] transition-all group shadow-[0_24px_64px_rgba(0,0,0,0.4)] hover:shadow-[0_32px_80px_rgba(0,0,0,0.5)] border border-white/30"
              whileHover={{ scale: 1.06, y: -3 }}
              whileTap={{ scale: 0.96 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
            >
              Try Pre-Check-In Demo
              <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform duration-300" />
            </motion.button>
            <p className="text-white/75 text-sm mt-6 font-light">No booking required • Takes 2 minutes</p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
