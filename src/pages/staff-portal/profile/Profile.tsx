import { useState, useEffect, useMemo } from 'react';
import {
  User,
  Mail,
  Phone,
  Calendar,
  Loader2,
  Check,
  Shield,
  Lock,
  Sun,
  Moon,
  Monitor,
  Camera,
  Clock,
  LogIn,
  LogOut
} from 'lucide-react';
import Button from '../../../components/staff-portal/ui/Button';
import { FormModal } from '../../../components/staff-portal/ui/Modal';
import { useAuth } from '@/hooks/useAuth';
import { useStaffProfile } from '@/hooks/staff-portal/useStaffApi';
import { useProfile } from '@/hooks/staff-portal/useStaffPortal';
import { userService } from '@/api/services/user.service';

/**
 * Glimmora Design System v4.0 - Staff Portal Profile Page
 * Matching admin dashboard styling patterns
 */

const Profile = () => {
  const { user, updateUser } = useAuth();
  const { data: profile, loading } = useStaffProfile();
  const { profile: contextProfile } = useProfile();

  // Form states
  const [isSaving, setIsSaving] = useState(false);
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);

  // Password modal states
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Edit form state
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    phone: ''
  });
  const [originalForm, setOriginalForm] = useState({
    name: '',
    email: '',
    phone: ''
  });

  // Preferences state - persist to localStorage
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>(() => {
    return (localStorage.getItem('glimmora_theme') as 'light' | 'dark' | 'system') || 'light';
  });
  const [notifications, setNotifications] = useState(() => {
    try {
      const saved = localStorage.getItem('glimmora_notification_prefs');
      if (saved) return JSON.parse(saved);
    } catch {}
    return { email: true, push: true, sms: false };
  });

  // Initialize form - use profile.name (API), then user.fullName (auth), then context
  useEffect(() => {
    if (user || profile) {
      const displayName = profile?.name || (user as any)?.fullName || contextProfile?.name || '';
      const initialForm = {
        name: displayName,
        email: (user as any)?.email || profile?.email || '',
        phone: (user as any)?.phone || profile?.phone || ''
      };
      setEditForm(initialForm);
      setOriginalForm(initialForm);
    }
  }, [user, profile, contextProfile]);

  // Auto-dismiss toast
  useEffect(() => {
    if (showSaveSuccess) {
      const timer = setTimeout(() => setShowSaveSuccess(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [showSaveSuccess]);

  // Prefer context clockedIn (updated instantly on clock actions) over stale API data.
  const isClockedIn = contextProfile?.clockedIn ?? profile?.clocked_in ?? false;

  // Calculate cumulative hours worked today from clock history
  const hoursWorkedToday = useMemo(() => {
    const history = contextProfile?.clockHistory || [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayEntries = history
      .filter((e: any) => new Date(e.timestamp) >= today)
      .sort((a: any, b: any) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    let totalMs = 0;
    let lastClockIn: Date | null = null;

    for (const entry of todayEntries) {
      const time = new Date(entry.timestamp);
      if (entry.action === 'clock_in') {
        lastClockIn = time;
      } else if (entry.action === 'clock_out' && lastClockIn) {
        totalMs += time.getTime() - lastClockIn.getTime();
        lastClockIn = null;
      }
    }

    if (lastClockIn && isClockedIn) {
      totalMs += Date.now() - lastClockIn.getTime();
    }

    if (totalMs <= 0) return null;
    const hours = Math.floor(totalMs / 3600000);
    const minutes = Math.floor((totalMs % 3600000) / 60000);
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
  }, [contextProfile?.clockHistory, isClockedIn]);

  // Calculate if staff clocked in late (first clock-in today vs scheduled shift start)
  const lateBy = useMemo(() => {
    const shiftStart = profile?.shift_start || contextProfile?.shiftStart;
    if (!shiftStart || !isClockedIn) return null;
    const history = contextProfile?.clockHistory || [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayClockIns = history
      .filter((e: any) => e.action === 'clock_in' && new Date(e.timestamp) >= today)
      .sort((a: any, b: any) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

    if (todayClockIns.length === 0) return null;

    const firstClockIn = new Date(todayClockIns[0].timestamp);
    const [sh, sm] = shiftStart.split(':').map(Number);
    const scheduledStart = new Date();
    scheduledStart.setHours(sh, sm, 0, 0);

    const diffMs = firstClockIn.getTime() - scheduledStart.getTime();
    if (diffMs <= 60000) return null; // Grace period: 1 minute

    const mins = Math.floor(diffMs / 60000);
    return mins >= 60 ? `${Math.floor(mins / 60)}h ${mins % 60}m` : `${mins}m`;
  }, [profile?.shift_start, contextProfile?.shiftStart, isClockedIn, contextProfile?.clockHistory]);

  // Helpers
  const getRoleLabel = (role: string) => {
    const labels: Record<string, string> = {
      housekeeping: 'Housekeeping Staff',
      maintenance: 'Maintenance Technician',
      runner: 'Runner / Bell Staff',
      admin: 'Administrator'
    };
    return labels[role] || role;
  };

  const getInitials = (name: string) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const hasFormChanges = () => {
    return (
      editForm.name !== originalForm.name ||
      editForm.email !== originalForm.email ||
      editForm.phone !== originalForm.phone
    );
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Handlers
  const handleSaveChanges = async () => {
    setIsSaving(true);
    try {
      await userService.updateProfile({
        fullName: editForm.name,
        phone: editForm.phone,
      });
      updateUser(editForm);
      setOriginalForm(editForm);
      setShowSaveSuccess(true);
    } catch (err: any) {
      console.error('Failed to save profile:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handlePasswordSubmit = async () => {
    setPasswordError(null);
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      return;
    }
    setIsChangingPassword(true);
    try {
      await userService.changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setShowPasswordModal(false);
      setShowSaveSuccess(true);
    } catch (err: any) {
      const errorMsg = err?.response?.data?.detail || err?.message || 'Failed to change password';
      setPasswordError(errorMsg);
    } finally {
      setIsChangingPassword(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <div className="w-14 h-14 rounded-2xl bg-terra-50 flex items-center justify-center">
          <Loader2 className="w-7 h-7 animate-spin text-terra-600" />
        </div>
        <span className="text-[13px] text-neutral-500 font-medium">Loading profile...</span>
      </div>
    );
  }

  if (!user) return null;

  const displayName = profile?.name || contextProfile?.name || (user as any)?.fullName || '';
  const displayData = { ...profile, ...user, name: displayName };

  return (
    <div className="space-y-6 max-w-full overflow-x-hidden">
      {/* Page Header - matching admin dashboard */}
      <header className="px-1 sm:px-0">
        <h1 className="text-xl sm:text-2xl font-semibold text-neutral-800">
          My Profile
        </h1>
        <p className="text-sm text-neutral-600 mt-1">
          Manage your account settings and preferences
        </p>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 sm:gap-6">
        {/* Profile Card - matching admin dashboard */}
        <div className="col-span-1 xl:col-span-8 rounded-[10px] p-4 sm:p-6 bg-white">
          {/* Profile Header */}
          <div className="flex flex-col sm:flex-row sm:items-start gap-4 sm:gap-5 pb-6 border-b border-neutral-100 dark:border-neutral-800">
            {/* Avatar and User Info Container for Mobile */}
            <div className="flex items-start gap-4 sm:gap-5 flex-1 min-w-0">
              {/* Avatar */}
              <div className="relative group flex-shrink-0">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center text-2xl sm:text-3xl font-bold bg-terra-100 text-terra-600">
                  {getInitials(displayData.name || '')}
                </div>
                <label className="absolute inset-0 rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-white/80 cursor-pointer">
                  <Camera className="w-5 h-5 sm:w-6 sm:h-6 text-neutral-600" />
                  <input
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      try {
                        const formData = new FormData();
                        formData.append('avatar', file);
                        await userService.updateProfile({ avatar: file.name } as any);
                        setShowSaveSuccess(true);
                      } catch (err) {
                        console.error('Avatar upload not yet supported:', err);
                      }
                    }}
                  />
                </label>
              </div>

              {/* User Info */}
              <div className="flex-1 min-w-0">
                <h2 className="text-base sm:text-lg font-semibold text-neutral-900 truncate">
                  {displayData.name || 'User'}
                </h2>
                <p className="text-[13px] text-neutral-500 mt-0.5 truncate">
                  {displayData.email}
                </p>
                <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-3">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-sage-50 text-sage-700 border border-sage-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-sage-500"></span>
                    Active
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-neutral-100 text-neutral-600">
                    <Shield className="w-3 h-3" />
                    {getRoleLabel(displayData.role || '')}
                  </span>
                </div>
              </div>
            </div>

            {/* Save Button - Full width on mobile */}
            <div className="flex items-center gap-3 w-full sm:w-auto sm:flex-shrink-0">
              {showSaveSuccess && (
                <span className="flex items-center gap-1.5 text-[13px] font-medium text-sage-600">
                  <Check className="w-4 h-4" />
                  Saved
                </span>
              )}
              <Button
                variant="primary"
                onClick={handleSaveChanges}
                disabled={!hasFormChanges() || isSaving}
                isLoading={isSaving}
                className="w-full sm:w-auto min-h-[44px] sm:min-h-0"
              >
                Save Changes
              </Button>
            </div>
          </div>

          {/* Personal Information */}
          <div className="pt-6 space-y-6">
            <div>
              <h3 className="text-sm font-semibold text-neutral-800 mb-4 sm:mb-5">
                Personal Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
                {/* Full Name */}
                <div>
                  <label className="block text-[11px] font-medium text-neutral-500 mb-1.5">
                    Full Name <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400">
                      <User className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      value={editForm.name}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      placeholder="Enter your full name"
                      className="w-full h-11 sm:h-10 pl-10 pr-3.5 rounded-lg text-[13px] bg-white border border-neutral-200 text-neutral-900 placeholder:text-neutral-400 hover:border-neutral-300 focus:border-terra-400 focus:ring-2 focus:ring-terra-500/10 focus:outline-none transition-all"
                    />
                  </div>
                </div>

                {/* Email Address */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-[11px] font-medium text-neutral-500">
                      Email Address
                    </label>
                    <span className="text-[10px] text-neutral-400">Cannot be changed</span>
                  </div>
                  <div className="relative">
                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      type="email"
                      value={editForm.email}
                      disabled
                      className="w-full h-11 sm:h-10 pl-10 pr-3.5 rounded-lg text-[13px] bg-neutral-50 border border-neutral-200 text-neutral-500 cursor-not-allowed"
                    />
                  </div>
                </div>

                {/* Phone Number */}
                <div>
                  <label className="block text-[11px] font-medium text-neutral-500 mb-1.5">
                    Phone Number
                  </label>
                  <div className="relative">
                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400">
                      <Phone className="w-4 h-4" />
                    </div>
                    <input
                      type="tel"
                      value={editForm.phone}
                      onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                      placeholder="Enter your phone number"
                      className="w-full h-11 sm:h-10 pl-10 pr-3.5 rounded-lg text-[13px] bg-white border border-neutral-200 text-neutral-900 placeholder:text-neutral-400 hover:border-neutral-300 focus:border-terra-400 focus:ring-2 focus:ring-terra-500/10 focus:outline-none transition-all"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Account Information Card */}
        <div className="col-span-1 xl:col-span-4 rounded-[10px] p-4 sm:p-6 bg-white">
          <h3 className="text-sm font-semibold text-neutral-800 mb-4 sm:mb-5">
            Account Information
          </h3>
          <div className="space-y-3">
            <InfoRow
              icon={Shield}
              label="Account Status"
              value={profile?.status ? profile.status.charAt(0).toUpperCase() + profile.status.slice(1) : 'Active'}
              valueClassName={profile?.status === 'active' || !profile?.status ? 'text-sage-600' : 'text-neutral-600'}
            />
            <InfoRow
              icon={User}
              label="Role"
              value={getRoleLabel(displayData.role || '')}
            />
            <InfoRow
              icon={Calendar}
              label="Member Since"
              value={formatDate(displayData.hire_date || (displayData as any).hireDate || (displayData as any).createdAt)}
            />
            <InfoRow
              icon={Mail}
              label="Email Verified"
              value={profile?.email_verified === false ? 'No' : 'Yes'}
              valueClassName={profile?.email_verified === false ? 'text-rose-600' : 'text-sage-600'}
            />
          </div>
        </div>

        {/* Shift & Attendance Card */}
        <div className="col-span-1 xl:col-span-12 rounded-[10px] p-4 sm:p-6 bg-white">
          <h3 className="text-sm font-semibold text-neutral-800 mb-4 sm:mb-5">
            Shift & Attendance
          </h3>

          {/* Shift Info Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 mb-5">
            <InfoRow
              icon={Clock}
              label="Shift Hours"
              value={(() => {
                const start = profile?.shift_start || contextProfile?.shiftStart;
                const end = profile?.shift_end || contextProfile?.shiftEnd;
                if (!start || !end) return 'Not assigned';
                const fmt = (t: string) => {
                  const [h, m] = t.split(':').map(Number);
                  const p = h >= 12 ? 'PM' : 'AM';
                  const hr = h === 0 ? 12 : h > 12 ? h - 12 : h;
                  return `${hr}:${String(m).padStart(2, '0')} ${p}`;
                };
                const [sh, sm] = start.split(':').map(Number);
                const [eh, em] = end.split(':').map(Number);
                let diff = (eh * 60 + em) - (sh * 60 + sm);
                if (diff < 0) diff += 24 * 60;
                const hrs = Math.floor(diff / 60);
                return `${fmt(start)} – ${fmt(end)} · ${hrs} hrs`;
              })()}
            />
            <InfoRow
              icon={Shield}
              label="Clock Status"
              value={isClockedIn ? (lateBy ? `Clocked In · Late ${lateBy}` : 'Clocked In · On Time') : 'Clocked Out'}
              valueClassName={isClockedIn ? (lateBy ? 'text-rose-600' : 'text-sage-600') : 'text-neutral-500'}
            />
            <InfoRow
              icon={Clock}
              label="Hours Worked Today"
              value={hoursWorkedToday || '0m'}
              valueClassName={hoursWorkedToday ? 'text-terra-600' : 'text-neutral-500'}
            />
            <InfoRow
              icon={Calendar}
              label="Today's Date"
              value={new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
            />
          </div>

          {/* Clock In/Out History */}
          <div>
            <h4 className="text-[12px] font-semibold text-neutral-500 uppercase tracking-wide mb-3">
              Clock History
            </h4>
            <div className="max-h-[240px] overflow-y-auto rounded-lg border border-neutral-100">
              {contextProfile?.clockHistory && contextProfile.clockHistory.length > 0 ? (
                <div className="divide-y divide-neutral-100">
                  {contextProfile.clockHistory.map((entry: any, idx: number) => {
                    const isIn = entry.action === 'clock_in';
                    const time = new Date(entry.timestamp);
                    return (
                      <div key={idx} className="flex items-center gap-3 px-3 sm:px-4 py-2.5 hover:bg-neutral-50/50 transition-colors">
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${
                          isIn ? 'bg-sage-50' : 'bg-rose-50'
                        }`}>
                          {isIn
                            ? <LogIn className="w-3.5 h-3.5 text-sage-600" />
                            : <LogOut className="w-3.5 h-3.5 text-rose-500" />
                          }
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-[12px] font-semibold ${isIn ? 'text-sage-700' : 'text-rose-600'}`}>
                            {isIn ? 'Clocked In' : 'Clocked Out'}
                          </p>
                          <p className="text-[11px] text-neutral-400">
                            {time.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </p>
                        </div>
                        <span className="text-[12px] font-medium text-neutral-700 tabular-nums">
                          {time.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', second: '2-digit', hour12: true })}
                        </span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Clock className="w-8 h-8 text-neutral-200 mx-auto mb-2" />
                  <p className="text-[12px] text-neutral-400">No clock history yet</p>
                  <p className="text-[11px] text-neutral-300 mt-0.5">Clock in from the sidebar to start tracking</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Security Card */}
        <div className="col-span-1 xl:col-span-6 rounded-[10px] p-4 sm:p-6 bg-white">
          <h3 className="text-sm font-semibold text-neutral-800 mb-4 sm:mb-5">
            Security
          </h3>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <p className="text-[13px] font-medium text-neutral-700">
                Password
              </p>
              <p className="text-[12px] text-neutral-500 mt-0.5">
                Last changed: {profile?.password_last_changed ? formatDate(profile.password_last_changed) : 'Never'}
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              icon={Lock}
              onClick={() => setShowPasswordModal(true)}
              className="w-full sm:w-auto min-h-[44px] sm:min-h-0"
            >
              Change Password
            </Button>
          </div>
        </div>

        {/* Preferences Card */}
        <div className="col-span-1 xl:col-span-6 rounded-[10px] p-4 sm:p-6 bg-white">
          <h3 className="text-sm font-semibold text-neutral-800 mb-4 sm:mb-5">
            Preferences
          </h3>

          {/* Theme Selection */}
          <div className="mb-6">
            <p className="text-[13px] font-medium text-neutral-700 mb-3">
              Theme
            </p>
            <div className="grid grid-cols-3 gap-2 sm:flex sm:flex-wrap">
              <ThemeButton
                icon={Sun}
                label="Light"
                active={theme === 'light'}
                onClick={() => { setTheme('light'); localStorage.setItem('glimmora_theme', 'light'); }}
              />
              <ThemeButton
                icon={Moon}
                label="Dark"
                active={theme === 'dark'}
                onClick={() => { setTheme('dark'); localStorage.setItem('glimmora_theme', 'dark'); }}
              />
              <ThemeButton
                icon={Monitor}
                label="System"
                active={theme === 'system'}
                onClick={() => { setTheme('system'); localStorage.setItem('glimmora_theme', 'system'); }}
              />
            </div>
          </div>

          {/* Notification Preferences */}
          <div>
            <p className="text-[13px] font-medium text-neutral-700 mb-3">
              Notifications
            </p>
            <div className="space-y-1 sm:space-y-3">
              <CheckboxItem
                label="Email notifications"
                description="Receive updates and alerts via email"
                checked={notifications.email}
                onChange={(checked) => { const next = { ...notifications, email: checked }; setNotifications(next); localStorage.setItem('glimmora_notification_prefs', JSON.stringify(next)); }}
              />
              <CheckboxItem
                label="Push notifications"
                description="Receive browser push notifications"
                checked={notifications.push}
                onChange={(checked) => { const next = { ...notifications, push: checked }; setNotifications(next); localStorage.setItem('glimmora_notification_prefs', JSON.stringify(next)); }}
              />
              <CheckboxItem
                label="SMS notifications"
                description="Receive text messages for urgent alerts"
                checked={notifications.sms}
                onChange={(checked) => { const next = { ...notifications, sms: checked }; setNotifications(next); localStorage.setItem('glimmora_notification_prefs', JSON.stringify(next)); }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Change Password Modal */}
      <FormModal
        isOpen={showPasswordModal}
        onClose={() => {
          setShowPasswordModal(false);
          setPasswordError(null);
          setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
        }}
        onSubmit={handlePasswordSubmit}
        title="Change Password"
        subtitle="Enter your current password and choose a new one"
        submitText={isChangingPassword ? "Updating..." : "Update Password"}
        isLoading={isChangingPassword}
      >
        <div className="space-y-4">
          {passwordError && (
            <div className="p-3 bg-rose-50 text-rose-600 rounded-lg text-[13px] border border-rose-200">
              {passwordError}
            </div>
          )}

          <div>
            <label className="block text-[11px] font-medium text-neutral-500 mb-1.5">
              Current Password <span className="text-rose-500">*</span>
            </label>
            <input
              type="password"
              value={passwordForm.currentPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
              placeholder="Enter current password"
              disabled={isChangingPassword}
              className="w-full h-11 sm:h-10 px-3.5 rounded-lg text-[13px] bg-white border border-neutral-200 text-neutral-900 placeholder:text-neutral-400 hover:border-neutral-300 focus:border-terra-400 focus:ring-2 focus:ring-terra-500/10 focus:outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-[11px] font-medium text-neutral-500 mb-1.5">
              New Password <span className="text-rose-500">*</span>
            </label>
            <input
              type="password"
              value={passwordForm.newPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
              placeholder="Enter new password"
              disabled={isChangingPassword}
              className="w-full h-11 sm:h-10 px-3.5 rounded-lg text-[13px] bg-white border border-neutral-200 text-neutral-900 placeholder:text-neutral-400 hover:border-neutral-300 focus:border-terra-400 focus:ring-2 focus:ring-terra-500/10 focus:outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-[11px] font-medium text-neutral-500 mb-1.5">
              Confirm Password <span className="text-rose-500">*</span>
            </label>
            <input
              type="password"
              value={passwordForm.confirmPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
              placeholder="Confirm new password"
              disabled={isChangingPassword}
              className="w-full h-11 sm:h-10 px-3.5 rounded-lg text-[13px] bg-white border border-neutral-200 text-neutral-900 placeholder:text-neutral-400 hover:border-neutral-300 focus:border-terra-400 focus:ring-2 focus:ring-terra-500/10 focus:outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            />
            {passwordForm.confirmPassword && passwordForm.newPassword !== passwordForm.confirmPassword && (
              <p className="text-[11px] text-rose-500 mt-1">Passwords do not match</p>
            )}
          </div>

          <p className="text-[11px] text-neutral-500">
            Password must be at least 6 characters.
          </p>
        </div>
      </FormModal>
    </div>
  );
};

// Info Row Component - matching admin dashboard
function InfoRow({
  icon: Icon,
  label,
  value,
  valueClassName
}: {
  icon: any;
  label: string;
  value: string;
  valueClassName?: string;
}) {
  return (
    <div className="flex items-center gap-3 p-3 sm:p-3 rounded-xl bg-neutral-50 min-h-[56px] sm:min-h-0">
      <div className="w-10 h-10 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center flex-shrink-0 bg-white border border-neutral-200">
        <Icon className="w-4 h-4 text-neutral-500" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[11px] font-medium uppercase tracking-wide text-neutral-400">
          {label}
        </p>
        <p className={`text-[13px] font-semibold truncate ${valueClassName || 'text-neutral-800'}`}>
          {value}
        </p>
      </div>
    </div>
  );
}

// Theme Button Component - matching admin dashboard
function ThemeButton({
  icon: Icon,
  label,
  active,
  onClick
}: {
  icon: any;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 px-2 sm:px-4 py-2.5 min-h-[48px] sm:min-h-0 rounded-xl text-[12px] sm:text-[13px] font-medium transition-all duration-200 ${active
          ? 'bg-terra-50 text-terra-700 border border-terra-200'
          : 'bg-white text-neutral-600 border border-neutral-200 hover:border-neutral-300 active:bg-neutral-50'
        }`}
    >
      <Icon className="w-4 h-4" />
      <span>{label}</span>
    </button>
  );
}

// Checkbox Item Component - matching admin dashboard
function CheckboxItem({
  label,
  description,
  checked,
  onChange
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex items-start gap-3 cursor-pointer p-2 -mx-2 rounded-lg hover:bg-neutral-50 active:bg-neutral-100 transition-colors min-h-[48px] sm:min-h-0 sm:p-0 sm:mx-0 sm:hover:bg-transparent">
      <div className="relative mt-0.5 flex-shrink-0">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="sr-only peer"
        />
        <div className={`w-5 h-5 sm:w-4 sm:h-4 rounded border transition-all ${checked
            ? 'bg-terra-500 border-terra-500'
            : 'bg-white border-neutral-300 hover:border-neutral-400'
          }`}>
          {checked && (
            <Check className="w-3.5 h-3.5 sm:w-3 sm:h-3 text-white absolute top-0.5 left-0.5 sm:top-0.5 sm:left-0.5" />
          )}
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-medium text-neutral-900">{label}</p>
        <p className="text-[11px] text-neutral-500 leading-relaxed">{description}</p>
      </div>
    </label>
  );
}

export default Profile;
