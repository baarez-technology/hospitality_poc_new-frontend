import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Eye, EyeOff, CheckCircle2, Shield } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '@/hooks/useAuth';
import { apiClient } from '@/api/client';

interface PasswordRequirement {
  label: string;
  test: (v: string) => boolean;
}

const requirements: PasswordRequirement[] = [
  { label: 'Minimum 8 characters', test: (v) => v.length >= 8 },
  { label: 'At least one uppercase letter', test: (v) => /[A-Z]/.test(v) },
  { label: 'At least one number', test: (v) => /\d/.test(v) },
  { label: 'At least one special character', test: (v) => /[!@#$%^&*()_+\-=[\]{}|;:,.<>?]/.test(v) },
];

export default function SetFirstPassword() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const allMet = requirements.every((r) => r.test(password));
  const passwordsMatch = password === confirmPassword && password.length > 0;
  const canSubmit = allMet && passwordsMatch && !isSubmitting;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    setIsSubmitting(true);
    try {
      await apiClient.post('/api/v1/auth/set-first-password', {
        new_password: password,
      });
      setSuccess(true);
      toast.success('Password set successfully!');

      // Update stored user to clear mustResetPassword flag
      const storedUser = localStorage.getItem('glimmora_user');
      if (storedUser) {
        const parsed = JSON.parse(storedUser);
        parsed.mustResetPassword = false;
        parsed.firstLogin = false;
        localStorage.setItem('glimmora_user', JSON.stringify(parsed));
      }

      // Navigate to admin dashboard after a brief delay
      setTimeout(() => {
        navigate('/admin');
      }, 1500);
    } catch (err: any) {
      const msg = err.response?.data?.detail || 'Failed to set password';
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-stone-50 to-neutral-100 px-4">
        <div className="bg-white rounded-2xl shadow-lg border border-neutral-200 p-10 max-w-md w-full text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-emerald-100 flex items-center justify-center">
            <CheckCircle2 className="w-8 h-8 text-emerald-600" />
          </div>
          <h2 className="text-2xl font-serif font-bold text-neutral-900 mb-2">Password Set!</h2>
          <p className="text-neutral-600 text-sm">Redirecting you to the dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-stone-50 to-neutral-100 px-4">
      <div className="bg-white rounded-2xl shadow-lg border border-neutral-200 max-w-md w-full overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#A57865] to-[#8E6554] p-6 text-center">
          <Shield className="w-10 h-10 text-white/90 mx-auto mb-2" />
          <h1 className="text-2xl font-serif font-bold text-white">Set Your Password</h1>
          <p className="text-white/70 text-sm mt-1">
            Welcome{user?.fullName ? `, ${user.fullName}` : ''}! Create a secure password to activate your account.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* New Password */}
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-neutral-700 mb-2">
              <Lock className="w-4 h-4 text-[#A57865]" />
              New Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter new password"
                autoFocus
                className="w-full px-4 py-2.5 pr-10 bg-[#FAF8F6] border border-neutral-200 rounded-xl text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#A57865] focus:border-[#A57865] transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-neutral-700 mb-2">
              <Lock className="w-4 h-4 text-[#A57865]" />
              Confirm Password
            </label>
            <div className="relative">
              <input
                type={showConfirm ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter new password"
                className="w-full px-4 py-2.5 pr-10 bg-[#FAF8F6] border border-neutral-200 rounded-xl text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#A57865] focus:border-[#A57865] transition-all"
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
              >
                {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {confirmPassword && !passwordsMatch && (
              <p className="text-xs text-red-500 mt-1">Passwords do not match</p>
            )}
          </div>

          {/* Requirements checklist */}
          <div className="bg-[#FAF8F6] rounded-xl border border-neutral-100 p-4">
            <p className="text-xs font-semibold text-neutral-600 mb-2.5">Password Requirements</p>
            <div className="space-y-1.5">
              {requirements.map((req) => {
                const met = req.test(password);
                return (
                  <div key={req.label} className="flex items-center gap-2">
                    <div className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${
                      met ? 'bg-emerald-100 text-emerald-600' : 'bg-neutral-100 text-neutral-300'
                    }`}>
                      <CheckCircle2 className="w-3 h-3" />
                    </div>
                    <span className={`text-xs transition-colors ${met ? 'text-emerald-700' : 'text-neutral-500'}`}>
                      {req.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <button
            type="submit"
            disabled={!canSubmit}
            className={`w-full py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
              canSubmit
                ? 'bg-[#A57865] text-white hover:bg-[#8E6554] active:scale-[0.98]'
                : 'bg-neutral-200 text-neutral-400 cursor-not-allowed'
            }`}
          >
            {isSubmitting ? 'Setting Password...' : 'Set Password & Continue'}
          </button>

          <button
            type="button"
            onClick={() => { logout(); navigate('/login'); }}
            className="w-full text-center text-xs text-neutral-400 hover:text-neutral-600 transition-colors"
          >
            Sign out and use a different account
          </button>
        </form>
      </div>
    </div>
  );
}
