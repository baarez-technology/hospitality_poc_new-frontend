import { motion } from 'framer-motion';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, CheckCircle, ArrowLeft } from 'lucide-react';
import { authService } from '@/api/services/auth.service';
import toast from 'react-hot-toast';
import logo from '@/assets/logo.png';

const emailSchema = z.object({
  email: z.string().email('Valid email required'),
});

type EmailFormData = z.infer<typeof emailSchema>;

export function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<EmailFormData>({
    resolver: zodResolver(emailSchema),
  });

  const onSubmit = async (data: EmailFormData) => {
    setIsLoading(true);
    try {
      await authService.forgotPassword(data.email);
      setSubmittedEmail(data.email);
      setEmailSent(true);
      toast.success('Password reset email sent!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to send reset email. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    setIsLoading(true);
    try {
      await authService.forgotPassword(submittedEmail);
      toast.success('Reset email sent again!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to resend email. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {!emailSent ? (
          <>
            {/* Logo/Header */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-8"
            >
              <Link to="/" className="inline-flex items-center mb-4">
                <img
                  src={logo}
                  alt="Glimmora"
                  className="h-8 w-auto"
                />
              </Link>
              <h1 className="text-3xl font-bold text-neutral-900 mb-2">Forgot Password?</h1>
              <p className="text-neutral-600">
                No worries! Enter your email and we'll send you reset instructions
              </p>
            </motion.div>

            {/* Email Form */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl shadow-xl p-8"
            >
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Email */}
                <div>
                  <label className="block text-sm font-semibold text-neutral-700 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                    <input
                      type="email"
                      {...register('email')}
                      placeholder="john@example.com"
                      className={`w-full pl-12 pr-4 py-3 border-2 rounded-xl focus:outline-none transition-all ${
                        errors.email
                          ? 'border-red-300 focus:border-red-500'
                          : 'border-neutral-300 focus:border-primary-500'
                      }`}
                    />
                  </div>
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                  )}
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Sending...
                    </>
                  ) : (
                    'Reset Password'
                  )}
                </button>
              </form>

              {/* Back to Login */}
              <div className="mt-6 text-center">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 text-sm text-primary-600 hover:text-primary-700 font-medium"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to Login
                </Link>
              </div>
            </motion.div>
          </>
        ) : (
          <>
            {/* Success State */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center"
            >
              {/* Success Icon */}
              <div className="mb-6 flex justify-center">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-12 h-12 text-green-600" />
                </div>
              </div>

              {/* Success Message */}
              <h1 className="text-3xl font-bold text-neutral-900 mb-2">Check Your Email</h1>
              <p className="text-neutral-600 mb-2">
                We've sent password reset instructions to:
              </p>
              <p className="text-lg font-semibold text-primary-600 mb-8">
                {submittedEmail}
              </p>

              {/* Instructions */}
              <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
                <div className="space-y-4 text-left">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center font-semibold text-sm flex-shrink-0 mt-0.5">
                      1
                    </div>
                    <p className="text-neutral-700">
                      Check your inbox for an email from Glimmora
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center font-semibold text-sm flex-shrink-0 mt-0.5">
                      2
                    </div>
                    <p className="text-neutral-700">
                      Click the reset password link in the email
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center font-semibold text-sm flex-shrink-0 mt-0.5">
                      3
                    </div>
                    <p className="text-neutral-700">
                      Create a new password for your account
                    </p>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-neutral-200">
                  <p className="text-sm text-neutral-600 mb-4">
                    Didn't receive the email? Check your spam folder or:
                  </p>
                  <button
                    onClick={handleResend}
                    disabled={isLoading}
                    className="w-full py-2 bg-neutral-100 hover:bg-neutral-200 disabled:bg-neutral-50 text-neutral-900 font-medium rounded-lg transition-all"
                  >
                    {isLoading ? 'Sending...' : 'Resend Email'}
                  </button>
                </div>
              </div>

              {/* Back to Login */}
              <Link
                to="/login"
                className="inline-flex items-center justify-center gap-2 w-full py-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-xl transition-all"
              >
                Back to Login
              </Link>
            </motion.div>
          </>
        )}

        {/* Back to Home (only on email form) */}
        {!emailSent && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-center mt-6"
          >
            <Link to="/" className="text-sm text-neutral-600 hover:text-neutral-900">
              ← Back to Home
            </Link>
          </motion.div>
        )}
      </div>
    </div>
  );
}