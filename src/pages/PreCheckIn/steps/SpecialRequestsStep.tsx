import { motion } from 'framer-motion';
import { MessageSquare, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { usePreCheckIn } from '@/contexts/PreCheckInContext';
import logo from '@/assets/logo.png';

interface SpecialRequestsStepProps {
  onNext: () => void;
  onPrevious?: () => void;
}

export function SpecialRequestsStep({ onNext, onPrevious }: SpecialRequestsStepProps) {
  const navigate = useNavigate();
  const { preCheckInData, updatePreCheckInData } = usePreCheckIn();

  const handleLogoClick = () => {
    const confirmed = window.confirm('Are you sure you want to cancel the pre-check-in? Your progress will be lost.');
    if (confirmed) {
      navigate('/');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNext();
  };

  const steps = [
    { number: 1, label: 'Welcome', active: false },
    { number: 2, label: 'Guest Details', active: false },
    { number: 3, label: 'Room Type', active: false },
    { number: 4, label: 'Travel Details', active: false },
    { number: 5, label: 'Documents', active: false },
    { number: 6, label: 'Preferences', active: false },
    { number: 7, label: 'Special Requests', active: true },
    { number: 8, label: 'Review', active: false },
    { number: 9, label: 'Confirmation', active: false },
  ];

  const currentStepIndex = steps.findIndex(s => s.active);

  return (
    <div className="flex min-h-screen bg-white">
      {/* LEFT COLUMN - Vertical Stepper */}
      <div className="hidden lg:block w-[410px] min-h-screen px-12 py-12 border-r border-neutral-200 bg-white">
        <div className="sticky top-12">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-20"
          >
            <img
              src={logo}
              alt="Glimmora"
              className="h-10 w-auto cursor-pointer"
              onClick={handleLogoClick}
            />
          </motion.div>

          {/* Vertical Stepper */}
          <div className="space-y-0">
            {steps.map((step, index) => (
              <div key={step.number} className="flex items-start gap-4">
                {/* Step Indicator Column */}
                <div className="flex flex-col items-center">
                  {/* Circle */}
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: index * 0.05 }}
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium transition-all ${
                      step.active
                        ? 'bg-terra-500 text-white'
                        : 'bg-transparent text-neutral-400 border border-neutral-300'
                    }`}
                  >
                    {step.active ? <div className="w-2 h-2 bg-white rounded-full" /> : step.number}
                  </motion.div>

                  {/* Connector Line */}
                  {index < steps.length - 1 && (
                    <div className="w-px h-10 bg-neutral-200 mt-1.5" />
                  )}
                </div>

                {/* Step Label */}
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 + 0.1 }}
                  className="pt-1 pb-8"
                >
                  <div
                    className={`text-sm font-medium mb-1 ${
                      step.active ? 'text-neutral-800' : 'text-neutral-500'
                    }`}
                  >
                    {step.label}
                  </div>
                  {step.active && (
                    <div className="text-[11px] text-neutral-400">
                      Let us know your special requests
                    </div>
                  )}
                </motion.div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN - Content Area */}
      <div className="flex-1 min-h-screen bg-neutral-50">
        {/* Mobile Header */}
        <div className="lg:hidden bg-white border-b border-neutral-200 px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <img
              src={logo}
              alt="Glimmora"
              className="h-8 w-auto cursor-pointer"
              onClick={handleLogoClick}
            />
            <span className="text-[13px] text-neutral-500">Step {currentStepIndex + 1} of {steps.length}</span>
          </div>
          {/* Mobile Progress Bar */}
          <div className="w-full bg-neutral-200 rounded-full h-1">
            <div
              className="bg-terra-500 h-1 rounded-full transition-all duration-300"
              style={{ width: `${((currentStepIndex + 1) / steps.length) * 100}%` }}
            />
          </div>
        </div>

        <div className="px-4 py-6 lg:px-10 lg:py-8">
          {/* Previous Button */}
          <motion.button
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={onPrevious}
            className="flex items-center gap-2 text-[13px] text-neutral-600 hover:text-neutral-800 transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Previous</span>
          </motion.button>

          {/* Content Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-6 lg:p-8 rounded-[10px] shadow-sm"
          >
            {/* Header */}
            <div className="mb-6 lg:mb-8">
              <h1 className="text-lg font-semibold text-neutral-800 mb-2">
                Special Requests
              </h1>
              <p className="text-[13px] text-neutral-500">
                Let us know how we can make your stay perfect
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Special Requests Textarea */}
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-widest text-neutral-400 mb-2">
                  Additional Requests <span className="text-neutral-300 normal-case">(Optional)</span>
                </label>
                <div className="relative">
                  <MessageSquare className="absolute left-3.5 top-3.5 w-4 h-4 text-neutral-400" />
                  <textarea
                    value={preCheckInData.specialRequests.requests}
                    onChange={(e) => updatePreCheckInData({
                      specialRequests: { ...preCheckInData.specialRequests, requests: e.target.value }
                    })}
                    rows={5}
                    placeholder="E.g., High floor, quiet location, extra towels..."
                    className="w-full pl-10 pr-4 py-3 border border-neutral-200 rounded-[10px] focus:outline-none focus:ring-2 focus:ring-terra-500/20 focus:border-terra-500 transition-all resize-none text-[13px] bg-white"
                  />
                </div>
              </div>

              {/* Early Check-in */}
              <div>
                <label className={`flex items-start gap-3 p-4 border rounded-lg cursor-pointer transition-all ${
                  preCheckInData.specialRequests.earlyCheckIn
                    ? 'border-terra-500 bg-terra-50'
                    : 'border-neutral-200 hover:border-neutral-300'
                }`}>
                  <input
                    type="checkbox"
                    checked={preCheckInData.specialRequests.earlyCheckIn}
                    onChange={(e) => updatePreCheckInData({
                      specialRequests: { ...preCheckInData.specialRequests, earlyCheckIn: e.target.checked }
                    })}
                    className="mt-0.5 w-4 h-4 rounded border-neutral-300 text-terra-500 focus:ring-terra-500/20 cursor-pointer"
                  />
                  <div className="flex-1">
                    <div className="text-[13px] font-medium text-neutral-800 mb-0.5">
                      Early Check-in Request
                    </div>
                    <p className="text-[11px] text-neutral-500">
                      Standard check-in is 3:00 PM (subject to availability)
                    </p>
                  </div>
                </label>
              </div>

              {/* Late Check-out */}
              <div>
                <label className={`flex items-start gap-3 p-4 border rounded-lg cursor-pointer transition-all ${
                  preCheckInData.specialRequests.lateCheckOut
                    ? 'border-terra-500 bg-terra-50'
                    : 'border-neutral-200 hover:border-neutral-300'
                }`}>
                  <input
                    type="checkbox"
                    checked={preCheckInData.specialRequests.lateCheckOut}
                    onChange={(e) => updatePreCheckInData({
                      specialRequests: { ...preCheckInData.specialRequests, lateCheckOut: e.target.checked }
                    })}
                    className="mt-0.5 w-4 h-4 rounded border-neutral-300 text-terra-500 focus:ring-terra-500/20 cursor-pointer"
                  />
                  <div className="flex-1">
                    <div className="text-[13px] font-medium text-neutral-800 mb-0.5">
                      Late Check-out Request
                    </div>
                    <p className="text-[11px] text-neutral-500">
                      Standard check-out is 11:00 AM (subject to availability)
                    </p>
                  </div>
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full h-10 text-white font-semibold rounded-lg transition-all text-[13px] mt-6 bg-terra-500 hover:bg-terra-600 active:scale-[0.98]"
              >
                Next
              </button>
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
