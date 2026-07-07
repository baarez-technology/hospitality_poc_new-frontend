import { useState, useEffect } from 'react';
import {
  User,
  Mail,
  Phone,
  Lock,
  Check,
  Camera,
  Shield,
  Calendar,
  Clock,
  Bell,
  Sun,
  Moon,
  Monitor
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui2/Button';
import { Input, PasswordInput, FormField, Checkbox } from '@/components/ui2/Input';
import { Modal, ModalHeader, ModalTitle, ModalDescription, ModalContent, ModalFooter } from '@/components/ui2/Modal';
import { cn } from '@/lib/utils';

/**
 * Glimmora Design System v4.0 - Profile Page
 * User profile management with personal info, security, and preferences
 */

export default function Profile() {
  const { user, updateUser } = useAuth();
  const { theme, setTheme, isDark } = useTheme();

  // Form state
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: ''
  });

  // UI state
  const [saved, setSaved] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    sms: false
  });

  // Password form state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordErrors, setPasswordErrors] = useState<Record<string, string>>({});
  const [passwordSaving, setPasswordSaving] = useState(false);

  // Load user data
  useEffect(() => {
    if (user) {
      setForm({
        fullName: user.fullName || '',
        email: user.email || '',
        phone: user.phone || ''
      });
    }
  }, [user]);

  // Handle form field changes
  const handleChange = (field: string, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: '' }));
    setSaved(false);
  };

  // Validate form
  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!form.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    } else if (form.fullName.trim().length < 2) {
      newErrors.fullName = 'Name must be at least 2 characters';
    }

    if (form.phone && !/^[\d\s\-\+\(\)]{10,}$/.test(form.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Save profile
  const handleSave = () => {
    if (!validate()) return;

    updateUser({
      fullName: form.fullName,
      phone: form.phone
    });

    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  // Validate password
  const validatePassword = () => {
    const newErrors: Record<string, string> = {};

    if (!passwordForm.currentPassword) {
      newErrors.currentPassword = 'Current password is required';
    }

    if (!passwordForm.newPassword) {
      newErrors.newPassword = 'New password is required';
    } else if (passwordForm.newPassword.length < 8) {
      newErrors.newPassword = 'Password must be at least 8 characters';
    } else if (!/(?=.*[0-9])(?=.*[!@#$%^&*])/.test(passwordForm.newPassword)) {
      newErrors.newPassword = 'Password must include a number and special character';
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setPasswordErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Change password
  const handleChangePassword = async () => {
    if (!validatePassword()) return;

    setPasswordSaving(true);
    // TODO: Call API to change password
    await new Promise(resolve => setTimeout(resolve, 1000));
    setPasswordSaving(false);
    setShowPasswordModal(false);
    setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  // Get user initials
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Format date
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className={cn(
      'min-h-screen px-10 py-8',
      isDark ? 'bg-neutral-950' : 'bg-[#F9F7F7]'
    )}>
      {/* Page Header */}
      <header className="mb-8">
        <h1 className={cn(
          'text-xl font-semibold tracking-tight',
          isDark ? 'text-neutral-100' : 'text-neutral-900'
        )}>
          My Profile
        </h1>
        <p className={cn(
          'text-[13px] mt-1',
          isDark ? 'text-neutral-500' : 'text-neutral-500'
        )}>
          Manage your account settings and preferences
        </p>
      </header>

      <div className="max-w-3xl space-y-6">
        {/* Profile Card */}
        <div className={cn(
          'rounded-2xl p-6',
          isDark ? 'bg-neutral-900 border border-neutral-800' : 'bg-white border border-neutral-100'
        )}>
          {/* Profile Header */}
          <div className="flex items-start gap-5 pb-6 border-b border-neutral-100 dark:border-neutral-800">
            {/* Avatar */}
            <div className="relative group">
              <div className={cn(
                'w-20 h-20 rounded-2xl flex items-center justify-center text-3xl font-bold flex-shrink-0',
                isDark
                  ? 'bg-terra-500/20 text-terra-400'
                  : 'bg-terra-100 text-terra-600'
              )}>
                {user?.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.fullName}
                    className="w-full h-full object-cover rounded-2xl"
                  />
                ) : (
                  getInitials(user?.fullName || 'User')
                )}
              </div>
              <button className={cn(
                'absolute inset-0 rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity',
                isDark ? 'bg-neutral-900/80' : 'bg-white/80'
              )}>
                <Camera className={cn(
                  'w-6 h-6',
                  isDark ? 'text-neutral-300' : 'text-neutral-600'
                )} />
              </button>
            </div>

            {/* User Info */}
            <div className="flex-1 min-w-0">
              <h2 className={cn(
                'text-lg font-semibold',
                isDark ? 'text-neutral-100' : 'text-neutral-900'
              )}>
                {user?.fullName || 'User'}
              </h2>
              <p className={cn(
                'text-[13px] mt-0.5',
                isDark ? 'text-neutral-500' : 'text-neutral-500'
              )}>
                {user?.email}
              </p>
              <div className="flex items-center gap-3 mt-3">
                <span className={cn(
                  'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold',
                  isDark
                    ? 'bg-sage-500/20 text-sage-400'
                    : 'bg-sage-50 text-sage-700 border border-sage-200'
                )}>
                  <span className="w-1.5 h-1.5 rounded-full bg-sage-500"></span>
                  Active
                </span>
                <span className={cn(
                  'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium',
                  isDark
                    ? 'bg-neutral-800 text-neutral-400'
                    : 'bg-neutral-100 text-neutral-600'
                )}>
                  <Shield className="w-3 h-3" />
                  {user?.role || 'Administrator'}
                </span>
              </div>
            </div>

            {/* Save Button */}
            <div className="flex items-center gap-3 flex-shrink-0">
              {saved && (
                <span className="flex items-center gap-1.5 text-[13px] font-medium text-sage-600">
                  <Check className="w-4 h-4" />
                  Saved
                </span>
              )}
              <Button variant="primary" size="md" onClick={handleSave}>
                Save Changes
              </Button>
            </div>
          </div>

          {/* Personal Information */}
          <div className="pt-6 space-y-6">
            <div>
              <h3 className={cn(
                'text-sm font-semibold mb-4',
                isDark ? 'text-neutral-200' : 'text-neutral-800'
              )}>
                Personal Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <FormField label="Full Name" required error={errors.fullName}>
                  <Input
                    value={form.fullName}
                    onChange={(e) => handleChange('fullName', e.target.value)}
                    placeholder="Enter your full name"
                    icon={User}
                    size="lg"
                    error={errors.fullName}
                  />
                </FormField>
                <FormField label="Email Address" description="Email cannot be changed">
                  <Input
                    type="email"
                    value={form.email}
                    icon={Mail}
                    size="lg"
                    disabled
                  />
                </FormField>
                <FormField label="Phone Number" error={errors.phone}>
                  <Input
                    value={form.phone}
                    onChange={(e) => handleChange('phone', e.target.value)}
                    placeholder="Enter your phone number"
                    icon={Phone}
                    size="lg"
                    error={errors.phone}
                  />
                </FormField>
              </div>
            </div>
          </div>
        </div>

        {/* Account Information Card */}
        <div className={cn(
          'rounded-2xl p-6',
          isDark ? 'bg-neutral-900 border border-neutral-800' : 'bg-white border border-neutral-100'
        )}>
          <h3 className={cn(
            'text-sm font-semibold mb-4',
            isDark ? 'text-neutral-200' : 'text-neutral-800'
          )}>
            Account Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InfoRow
              icon={Shield}
              label="Account Status"
              value="Active"
              isDark={isDark}
              valueClassName="text-sage-600"
            />
            <InfoRow
              icon={User}
              label="Role"
              value={user?.role || 'Administrator'}
              isDark={isDark}
            />
            <InfoRow
              icon={Calendar}
              label="Member Since"
              value={formatDate(user?.createdAt)}
              isDark={isDark}
            />
            <InfoRow
              icon={Mail}
              label="Email Verified"
              value={user?.emailVerified ? 'Yes' : 'No'}
              isDark={isDark}
              valueClassName={user?.emailVerified ? 'text-sage-600' : 'text-amber-600'}
            />
          </div>
        </div>

        {/* Security Card */}
        <div className={cn(
          'rounded-2xl p-6',
          isDark ? 'bg-neutral-900 border border-neutral-800' : 'bg-white border border-neutral-100'
        )}>
          <h3 className={cn(
            'text-sm font-semibold mb-4',
            isDark ? 'text-neutral-200' : 'text-neutral-800'
          )}>
            Security
          </h3>
          <div className="flex items-center justify-between">
            <div>
              <p className={cn(
                'text-[13px] font-medium',
                isDark ? 'text-neutral-300' : 'text-neutral-700'
              )}>
                Password
              </p>
              <p className={cn(
                'text-[12px] mt-0.5',
                isDark ? 'text-neutral-500' : 'text-neutral-500'
              )}>
                Last changed: Never
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              icon={Lock}
              onClick={() => setShowPasswordModal(true)}
            >
              Change Password
            </Button>
          </div>
        </div>

        {/* Preferences Card */}
        <div className={cn(
          'rounded-2xl p-6',
          isDark ? 'bg-neutral-900 border border-neutral-800' : 'bg-white border border-neutral-100'
        )}>
          <h3 className={cn(
            'text-sm font-semibold mb-4',
            isDark ? 'text-neutral-200' : 'text-neutral-800'
          )}>
            Preferences
          </h3>

          {/* Theme Selection */}
          <div className="mb-6">
            <p className={cn(
              'text-[13px] font-medium mb-3',
              isDark ? 'text-neutral-300' : 'text-neutral-700'
            )}>
              Theme
            </p>
            <div className="flex gap-2">
              <ThemeButton
                icon={Sun}
                label="Light"
                active={theme === 'light'}
                onClick={() => setTheme('light')}
                isDark={isDark}
              />
              <ThemeButton
                icon={Moon}
                label="Dark"
                active={theme === 'dark'}
                onClick={() => setTheme('dark')}
                isDark={isDark}
              />
              <ThemeButton
                icon={Monitor}
                label="System"
                active={theme === 'system'}
                onClick={() => setTheme('system')}
                isDark={isDark}
              />
            </div>
          </div>

          {/* Notification Preferences */}
          <div>
            <p className={cn(
              'text-[13px] font-medium mb-3',
              isDark ? 'text-neutral-300' : 'text-neutral-700'
            )}>
              Notifications
            </p>
            <div className="space-y-3">
              <Checkbox
                label="Email notifications"
                description="Receive updates and alerts via email"
                checked={notifications.email}
                onChange={(e) => setNotifications(prev => ({ ...prev, email: e.target.checked }))}
              />
              <Checkbox
                label="Push notifications"
                description="Receive browser push notifications"
                checked={notifications.push}
                onChange={(e) => setNotifications(prev => ({ ...prev, push: e.target.checked }))}
              />
              <Checkbox
                label="SMS notifications"
                description="Receive text messages for urgent alerts"
                checked={notifications.sms}
                onChange={(e) => setNotifications(prev => ({ ...prev, sms: e.target.checked }))}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Change Password Modal */}
      <Modal
        open={showPasswordModal}
        onClose={() => {
          setShowPasswordModal(false);
          setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
          setPasswordErrors({});
        }}
        size="sm"
      >
        <ModalHeader icon={Lock}>
          <ModalTitle>Change Password</ModalTitle>
          <ModalDescription>Enter your current password and choose a new one</ModalDescription>
        </ModalHeader>
        <ModalContent>
          <div className="space-y-4">
            <FormField label="Current Password" required error={passwordErrors.currentPassword}>
              <PasswordInput
                value={passwordForm.currentPassword}
                onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                placeholder="Enter current password"
                size="lg"
                error={passwordErrors.currentPassword}
              />
            </FormField>
            <FormField label="New Password" required error={passwordErrors.newPassword}>
              <PasswordInput
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                placeholder="Enter new password"
                size="lg"
                error={passwordErrors.newPassword}
              />
            </FormField>
            <FormField label="Confirm Password" required error={passwordErrors.confirmPassword}>
              <PasswordInput
                value={passwordForm.confirmPassword}
                onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                placeholder="Confirm new password"
                size="lg"
                error={passwordErrors.confirmPassword}
              />
            </FormField>
            <p className="text-[11px] text-neutral-500">
              Password must be at least 8 characters and include a number and special character.
            </p>
          </div>
        </ModalContent>
        <ModalFooter>
          <Button
            variant="outline"
            onClick={() => {
              setShowPasswordModal(false);
              setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
              setPasswordErrors({});
            }}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleChangePassword}
            loading={passwordSaving}
          >
            Update Password
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}

// Info Row Component
function InfoRow({
  icon: Icon,
  label,
  value,
  isDark,
  valueClassName
}: {
  icon: any;
  label: string;
  value: string;
  isDark: boolean;
  valueClassName?: string;
}) {
  return (
    <div className={cn(
      'flex items-center gap-3 p-3 rounded-xl',
      isDark ? 'bg-neutral-800/50' : 'bg-neutral-50'
    )}>
      <div className={cn(
        'w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0',
        isDark ? 'bg-neutral-700' : 'bg-white border border-neutral-200'
      )}>
        <Icon className={cn(
          'w-4 h-4',
          isDark ? 'text-neutral-400' : 'text-neutral-500'
        )} />
      </div>
      <div className="flex-1 min-w-0">
        <p className={cn(
          'text-[11px] font-medium uppercase tracking-wide',
          isDark ? 'text-neutral-500' : 'text-neutral-400'
        )}>
          {label}
        </p>
        <p className={cn(
          'text-[13px] font-semibold truncate',
          valueClassName || (isDark ? 'text-neutral-200' : 'text-neutral-800')
        )}>
          {value}
        </p>
      </div>
    </div>
  );
}

// Theme Button Component
function ThemeButton({
  icon: Icon,
  label,
  active,
  onClick,
  isDark
}: {
  icon: any;
  label: string;
  active: boolean;
  onClick: () => void;
  isDark: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex items-center gap-2 px-4 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-200',
        active
          ? (isDark
              ? 'bg-terra-500/20 text-terra-400 border border-terra-500/30'
              : 'bg-terra-50 text-terra-700 border border-terra-200')
          : (isDark
              ? 'bg-neutral-800 text-neutral-400 border border-neutral-700 hover:border-neutral-600'
              : 'bg-white text-neutral-600 border border-neutral-200 hover:border-neutral-300')
      )}
    >
      <Icon className="w-4 h-4" />
      {label}
    </button>
  );
}
