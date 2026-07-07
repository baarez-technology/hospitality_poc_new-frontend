import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { ROUTES } from '@/config/constants';
import { apiClient } from '@/api/client';
import toast from 'react-hot-toast';
import logo from '@/assets/logo.png';

export const VerifyEmail = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const verifyEmail = async () => {
      if (!token) {
        setStatus('error');
        setMessage('Invalid verification link');
        return;
      }

      try {
        await apiClient.post('/auth/verify-email', { token });
        setStatus('success');
        setMessage('Email verified successfully!');
        toast.success('Email verified! You can now log in.');
        setTimeout(() => navigate(ROUTES.LOGIN), 3000);
      } catch (error: any) {
        setStatus('error');
        setMessage(
          error.response?.data?.message ||
            'Verification failed. The link may be invalid or expired.'
        );
        toast.error('Email verification failed');
      }
    };

    verifyEmail();
  }, [token, navigate]);

  return (
    <Card padding="lg">
      <div className="text-center">
        {status === 'loading' && (
          <>
            <Loader2 className="w-16 h-16 text-primary-600 animate-spin mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-neutral-900 mb-2">
              Verifying Your Email
            </h1>
            <p className="text-neutral-600">
              Please wait while we verify your email address...
            </p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-neutral-900 mb-2">
              Email Verified!
            </h1>
            <p className="text-neutral-600 mb-6">{message}</p>
            <p className="text-sm text-neutral-500 mb-6">
              Redirecting to login...
            </p>
            <Link to={ROUTES.LOGIN}>
              <Button fullWidth>Go to Login</Button>
            </Link>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <XCircle className="w-8 h-8 text-red-600" />
            </div>
            <h1 className="text-2xl font-bold text-neutral-900 mb-2">
              Verification Failed
            </h1>
            <p className="text-neutral-600 mb-6">{message}</p>
            <div className="space-y-3">
              <Link to={ROUTES.SIGNUP}>
                <Button fullWidth>Create New Account</Button>
              </Link>
              <Link to={ROUTES.LOGIN}>
                <Button variant="ghost" fullWidth>
                  Back to Login
                </Button>
              </Link>
            </div>
          </>
        )}
      </div>
    </Card>
  );
};