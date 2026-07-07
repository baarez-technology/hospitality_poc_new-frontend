import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import Card from '@/components/ui/Card';
import { FormError } from '@/components/forms/FormError';
import { forgotPasswordSchema, ForgotPasswordFormData } from '@/utils/validation';
import { ROUTES } from '@/config/constants';
import { authService } from '@/api/services/auth.service';

export const ForgotPassword = () => {
  const [apiError, setApiError] = useState<string | undefined>(undefined);
  const [emailSent, setEmailSent] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    getValues,
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    try {
      setApiError(undefined);
      await authService.forgotPassword(data.email);
      setEmailSent(true);
      toast.success('Password reset email sent!');
    } catch (error: any) {
      const message =
        error.response?.data?.detail ||
        error.response?.data?.message ||
        error.message ||
        'Failed to send reset email. Please try again.';
      setApiError(message);
      toast.error(message);
    }
  };

  if (emailSent) {
    return (
      <Card padding="lg">
        <div className="text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-neutral-900 mb-2">
            Check Your Email
          </h1>
          <p className="text-neutral-600 mb-6">
            We've sent a password reset link to{' '}
            <span className="font-medium">{getValues('email')}</span>
          </p>
          <p className="text-sm text-neutral-500 mb-6">
            Didn't receive the email? Check your spam folder or try again.
          </p>
          <div className="space-y-3">
            <Button
              onClick={() => setEmailSent(false)}
              variant="secondary"
              fullWidth
            >
              Try Another Email
            </Button>
            <Link to={ROUTES.LOGIN}>
              <Button variant="ghost" fullWidth leftIcon={<ArrowLeft size={18} />}>
                Back to Login
              </Button>
            </Link>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card padding="lg">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-neutral-900 mb-2">
          Forgot Password?
        </h1>
        <p className="text-neutral-600">
          Enter your email and we'll send you a reset link
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <FormError message={apiError} />

        <Input
          label="Email Address"
          type="email"
          placeholder="Enter your email"
          leftIcon={<Mail size={18} />}
          error={errors.email?.message}
          {...register('email')}
          fullWidth
          required
        />

        <Button type="submit" fullWidth isLoading={isSubmitting}>
          Send Reset Link
        </Button>

        <Link to={ROUTES.LOGIN}>
          <Button
            variant="ghost"
            fullWidth
            leftIcon={<ArrowLeft size={18} />}
          >
            Back to Login
          </Button>
        </Link>
      </form>
    </Card>
  );
};
