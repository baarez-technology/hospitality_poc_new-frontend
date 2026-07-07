import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useEffect, useState } from 'react';
import { User, Mail, Phone, MessageSquare, Shield, CheckCircle, ArrowRight } from 'lucide-react';
import { useBooking } from '@/contexts/BookingContext';
import { useAuth } from '@/hooks/useAuth';
import { userService } from '@/api/services/user.service';
import { apiClient } from '@/api/client';

const guestInfoSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string()
    .regex(/^\d{10}$/, 'Phone number must be exactly 10 digits')
    .refine((val) => val.length === 10, 'Phone number must be exactly 10 digits'),
  specialRequests: z.string().optional(),
});

interface GuestInfoStepProps {
  onNext: () => void;
}

export function GuestInfoStep({ onNext }: GuestInfoStepProps) {
  const { bookingData, updateBookingData } = useBooking();
  const { user } = useAuth();
  const [emailRegisteredHint, setEmailRegisteredHint] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    reset,
  } = useForm({
    resolver: zodResolver(guestInfoSchema),
    defaultValues: bookingData.guestInfo,
  });

  // Autofill from user profile when logged in
  useEffect(() => {
    const autofillUserInfo = async () => {
      if (user && (!bookingData.guestInfo?.firstName || !bookingData.guestInfo?.email)) {
        try {
          const profile = await userService.getProfile();
          const nameParts = (profile.fullName || '').split(' ');
          const firstName = nameParts[0] || '';
          const lastName = nameParts.slice(1).join(' ') || '';
          
          const autofilledData = {
            firstName: firstName || bookingData.guestInfo?.firstName || '',
            lastName: lastName || bookingData.guestInfo?.lastName || '',
            email: profile.email || bookingData.guestInfo?.email || '',
            phone: profile.phone || bookingData.guestInfo?.phone || '',
            specialRequests: bookingData.guestInfo?.specialRequests || '',
          };
          
          reset(autofilledData);
          updateBookingData({ guestInfo: autofilledData });
        } catch (error) {
          console.error('Failed to load user profile:', error);
        }
      }
    };

    autofillUserInfo();
  }, [user]);

  const firstName = watch('firstName');
  const lastName = watch('lastName');
  const email = watch('email');
  const phone = watch('phone');

  // Warn when email already exists on a guest profile (no names returned)
  useEffect(() => {
    const t = window.setTimeout(async () => {
      const raw = email?.trim() || '';
      if (!raw.includes('@') || raw.length < 5) {
        setEmailRegisteredHint(null);
        return;
      }
      try {
        const res = await apiClient.get<{ message?: string | null; profileCount?: number }>(
          '/api/v1/bookings/guest-email-hint',
          { params: { email: raw } }
        );
        const body = (res.data as { data?: { message?: string | null } })?.data ?? res.data;
        const msg = typeof body === 'object' && body && 'message' in body ? (body as { message?: string | null }).message : null;
        setEmailRegisteredHint(msg || null);
      } catch {
        setEmailRegisteredHint(null);
      }
    }, 450);
    return () => window.clearTimeout(t);
  }, [email]);

  const onSubmit = (data: any) => {
    updateBookingData({ guestInfo: data });
    onNext();
  };

  const isFieldValid = (fieldName: string, value: any) => {
    return value && value.length > 0 && !errors[fieldName as keyof typeof errors];
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl p-8 sm:p-10 border border-neutral-200 shadow-lg"
    >
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-lg bg-primary-600 flex items-center justify-center shadow-md">
            <User className="w-6 h-6 text-white" strokeWidth={2.5} />
          </div>
          <div>
            <h2 className="text-3xl sm:text-4xl font-bold text-neutral-900">Your Information</h2>
          </div>
        </div>
        <p className="text-base text-neutral-600 font-medium">
          We'll use this information for your booking confirmation and to contact you if needed
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Name Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* First Name */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <label className="block text-sm font-semibold text-neutral-900 mb-2">
              First Name <span className="text-red-500">*</span>
            </label>
            <div className="relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                <User className={`w-5 h-5 transition-colors ${
                  isFieldValid('firstName', firstName)
                    ? 'text-green-500'
                    : errors.firstName
                      ? 'text-red-500'
                      : 'text-neutral-400 group-focus-within:text-primary-600'
                }`} strokeWidth={2} />
              </div>
              <input
                type="text"
                {...register('firstName')}
                placeholder="John"
                className={`w-full pl-12 pr-12 py-4 border rounded-lg focus:outline-none focus:ring-2 transition-all font-medium ${
                  errors.firstName
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20 bg-red-50'
                    : isFieldValid('firstName', firstName)
                      ? 'border-green-300 focus:border-green-500 focus:ring-green-500/20 bg-green-50'
                      : 'border-neutral-200 focus:border-primary-500 focus:ring-primary-500/20 bg-neutral-50'
                }`}
              />
              {isFieldValid('firstName', firstName) && (
                <CheckCircle className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-green-500" strokeWidth={2} />
              )}
            </div>
            <AnimatePresence>
              {errors.firstName && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mt-2 text-sm text-red-600 font-medium"
                >
                  {errors.firstName.message}
                </motion.p>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Last Name */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15 }}
          >
            <label className="block text-sm font-semibold text-neutral-900 mb-2">
              Last Name <span className="text-red-500">*</span>
            </label>
            <div className="relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                <User className={`w-5 h-5 transition-colors ${
                  isFieldValid('lastName', lastName)
                    ? 'text-green-500'
                    : errors.lastName
                      ? 'text-red-500'
                      : 'text-neutral-400 group-focus-within:text-primary-600'
                }`} strokeWidth={2} />
              </div>
              <input
                type="text"
                {...register('lastName')}
                placeholder="Doe"
                className={`w-full pl-12 pr-12 py-4 border rounded-lg focus:outline-none focus:ring-2 transition-all font-medium ${
                  errors.lastName
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20 bg-red-50'
                    : isFieldValid('lastName', lastName)
                      ? 'border-green-300 focus:border-green-500 focus:ring-green-500/20 bg-green-50'
                      : 'border-neutral-200 focus:border-primary-500 focus:ring-primary-500/20 bg-neutral-50'
                }`}
              />
              {isFieldValid('lastName', lastName) && (
                <CheckCircle className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-green-500" strokeWidth={2} />
              )}
            </div>
            <AnimatePresence>
              {errors.lastName && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mt-2 text-sm text-red-600 font-medium"
                >
                  {errors.lastName.message}
                </motion.p>
              )}
            </AnimatePresence>
          </motion.div>
        </div>

        {/* Email */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <label className="block text-sm font-semibold text-neutral-900 mb-2">
            Email Address <span className="text-red-500">*</span>
          </label>
          <div className="relative group">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
              <Mail className={`w-5 h-5 transition-colors ${
                isFieldValid('email', email)
                  ? 'text-green-500'
                  : errors.email
                    ? 'text-red-500'
                    : 'text-neutral-400 group-focus-within:text-primary-600'
              }`} strokeWidth={2} />
            </div>
            <input
              type="email"
              {...register('email')}
              placeholder="john.doe@example.com"
              className={`w-full pl-12 pr-12 py-4 border rounded-lg focus:outline-none focus:ring-2 transition-all font-medium ${
                errors.email
                  ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20 bg-red-50'
                  : isFieldValid('email', email)
                    ? 'border-green-300 focus:border-green-500 focus:ring-green-500/20 bg-green-50'
                    : 'border-neutral-200 focus:border-primary-500 focus:ring-primary-500/20 bg-neutral-50'
              }`}
            />
            {isFieldValid('email', email) && (
              <CheckCircle className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-green-500" strokeWidth={2} />
            )}
          </div>
          {emailRegisteredHint && !errors.email && (
            <p className="mt-2 text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 font-medium">
              {emailRegisteredHint}
            </p>
          )}
          <AnimatePresence>
            {errors.email ? (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mt-2 text-sm text-red-600 font-medium"
              >
                {errors.email.message}
              </motion.p>
            ) : (
              <p className="mt-2 text-sm text-neutral-600 font-medium">
                Confirmation will be sent to this email address
              </p>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Phone */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          <label className="block text-sm font-semibold text-neutral-900 mb-2">
            Phone Number <span className="text-red-500">*</span>
          </label>
          <div className="relative group">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
              <Phone className={`w-5 h-5 transition-colors ${
                isFieldValid('phone', phone)
                  ? 'text-green-500'
                  : errors.phone
                    ? 'text-red-500'
                    : 'text-neutral-400 group-focus-within:text-primary-600'
              }`} strokeWidth={2} />
            </div>
            <input
              type="tel"
              {...register('phone', {
                onChange: (e) => {
                  // Only allow digits and limit to 10 characters
                  e.target.value = e.target.value.replace(/\D/g, '').slice(0, 10);
                }
              })}
              placeholder="9876543210"
              className={`w-full pl-12 pr-12 py-4 border rounded-lg focus:outline-none focus:ring-2 transition-all font-medium ${
                errors.phone
                  ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20 bg-red-50'
                  : isFieldValid('phone', phone)
                    ? 'border-green-300 focus:border-green-500 focus:ring-green-500/20 bg-green-50'
                    : 'border-neutral-200 focus:border-primary-500 focus:ring-primary-500/20 bg-neutral-50'
              }`}
            />
            {isFieldValid('phone', phone) && (
              <CheckCircle className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-green-500" strokeWidth={2} />
            )}
          </div>
          <AnimatePresence>
            {errors.phone ? (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mt-2 text-sm text-red-600 font-medium"
              >
                {errors.phone.message}
              </motion.p>
            ) : (
              <p className="mt-2 text-sm text-neutral-600 font-medium">
                We'll contact you on this number if needed
              </p>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Special Requests */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <label className="block text-sm font-semibold text-neutral-900 mb-2">
            Special Requests <span className="text-neutral-500 font-normal">(Optional)</span>
          </label>
          <div className="relative group">
            <div className="absolute left-4 top-4 pointer-events-none">
              <MessageSquare className="w-5 h-5 text-neutral-400 group-focus-within:text-primary-600 transition-colors" strokeWidth={2} />
            </div>
            <textarea
              {...register('specialRequests')}
              rows={4}
              placeholder="Any special requests? (e.g., early check-in, high floor, dietary requirements)"
              className="w-full pl-12 pr-4 py-4 border border-neutral-200 rounded-lg focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all resize-none bg-neutral-50 font-medium"
            />
          </div>
          <p className="mt-2 text-sm text-neutral-600 font-medium">
            We'll do our best to accommodate your requests
          </p>
        </motion.div>

        {/* Privacy Notice */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="p-4 bg-primary-50 border border-primary-200 rounded-lg flex items-start gap-3"
        >
          <Shield className="w-5 h-5 text-primary-600 flex-shrink-0 mt-0.5" strokeWidth={2} />
          <div className="flex-1">
            <p className="text-sm font-semibold text-primary-900 mb-1">Your information is secure</p>
            <p className="text-xs text-primary-700 leading-relaxed">
              We use industry-standard encryption to protect your personal data. Your information will only be used for this booking.
            </p>
          </div>
        </motion.div>

        {/* Continue Button */}
        <motion.button
          type="submit"
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="w-full py-5 bg-primary-600 hover:bg-primary-700 text-white font-bold text-lg rounded-lg transition-all shadow-lg flex items-center justify-center gap-3 group"
        >
          <span>Continue to Payment</span>
          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" strokeWidth={2.5} />
        </motion.button>
      </form>
    </motion.div>
  );
}