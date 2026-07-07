import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Lock, CheckCircle2, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import Card from '@/components/ui/Card';
import { FormError } from '@/components/forms/FormError';
import { resetPasswordSchema, ResetPasswordFormData } from '@/utils/validation';
import { ROUTES } from '@/config/constants';
import { authService } from '@/api/services/auth.service';

export const ResetPassword = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [apiError, setApiError] = useState<string | undefined>(undefined);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [isValidatingToken, setIsValidatingToken] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
  });

  // Verify token on mount
  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setIsValidatingToken(false);
        return;
      }

      try {
        await authService.verifyResetToken(token);
        setIsValidatingToken(false);
      } catch (error: any) {
        setApiError('Invalid or expired reset token');
        setIsValidatingToken(false);
      }
    };

    verifyToken();
  }, [token]);

  const onSubmit = async (data: ResetPasswordFormData) => {
    if (!token) {
      setApiError('Invalid or missing reset token');
      return;
    }

    try {
      setApiError(undefined);
      await authService.resetPassword(token, data.password);
      setResetSuccess(true);
      toast.success('Password reset successful!');
      setTimeout(() => navigate(ROUTES.LOGIN), 3000);
    } catch (error: any) {
      const message =
        error.response?.data?.detail ||
        error.response?.data?.message ||
        error.message ||
        'Failed to reset password. Please try again.';
      setApiError(message);
      toast.error(message);
    }
  };

  if (isValidatingToken) {
    return (
      <Card padding="lg">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-neutral-600">Verifying reset token...</p>
        </div>
      </Card>
    );
  }

  if (!token || apiError) {
    return (
      <Card padding="lg">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-neutral-900 mb-2">
            Invalid Reset Link
          </h1>
          <p className="text-neutral-600 mb-6">
            {apiError || 'This password reset link is invalid or has expired.'}
          </p>
          <Link to={ROUTES.FORGOT_PASSWORD}>
            <Button fullWidth>Request New Reset Link</Button>
          </Link>
        </div>
      </Card>
    );
  }

  if (resetSuccess) {
    return (
      <Card padding="lg">
        <div className="text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-neutral-900 mb-2">
            Password Reset Successfully!
          </h1>
          <p className="text-neutral-600 mb-6">
            Your password has been reset. Redirecting to login...
          </p>
          <Link to={ROUTES.LOGIN}>
            <Button fullWidth>Go to Login</Button>
          </Link>
        </div>
      </Card>
    );
  }

  return (
    <Card padding="lg">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-neutral-900 mb-2">
          Reset Your Password
        </h1>
        <p className="text-neutral-600">
          Enter your new password below
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <FormError message={apiError} />

        <div>
          <label className="block text-sm font-semibold text-neutral-700 mb-2">
            New Password
          </label>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter new password"
              {...register('password')}
              className={`w-full pl-12 pr-12 py-3 border-2 rounded-xl focus:outline-none transition-all ${
                errors.password
                  ? 'border-red-300 focus:border-red-500'
                  : 'border-neutral-300 focus:border-primary-500'
              }`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          {errors.password && (
            <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
          )}
          <p className="mt-1 text-sm text-neutral-500">At least 8 characters</p>
        </div>

        <div>
          <label className="block text-sm font-semibold text-neutral-700 mb-2">
            Confirm Password
          </label>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="Confirm new password"
              {...register('confirmPassword')}
              className={`w-full pl-12 pr-12 py-3 border-2 rounded-xl focus:outline-none transition-all ${
                errors.confirmPassword
                  ? 'border-red-300 focus:border-red-500'
                  : 'border-neutral-300 focus:border-primary-500'
              }`}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
            >
              {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>
          )}
        </div>

        <Button type="submit" fullWidth isLoading={isSubmitting}>
          Reset Password
        </Button>
      </form>
    </Card>
  );
};
