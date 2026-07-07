import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User,
  LogOut,
  ChevronDown,
  Clock
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/staff-portal/useStaffPortal';

interface ProfileMenuProps {
  collapsed?: boolean;
}

export default function ProfileMenu({ collapsed = false }: ProfileMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { profile, clockIn, clockOut } = useProfile();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getInitials = (name?: string) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getRoleLabel = (role?: string) => {
    const labels: Record<string, string> = {
      housekeeping: 'Housekeeping',
      maintenance: 'Maintenance',
      runner: 'Runner'
    };
    return labels[role || ''] || role || '';
  };

  const formatClockInTime = () => {
    if (!profile?.clockInTime) return null;
    const time = new Date(profile.clockInTime);
    return time.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  // Format HH:MM (24h) to readable 12h format
  const formatShiftTime = (time?: string) => {
    if (!time) return null;
    const [h, m] = time.split(':').map(Number);
    const period = h >= 12 ? 'PM' : 'AM';
    const hour = h === 0 ? 12 : h > 12 ? h - 12 : h;
    return `${hour}:${String(m).padStart(2, '0')} ${period}`;
  };

  // Calculate shift duration in hours
  const getShiftDuration = (start?: string, end?: string) => {
    if (!start || !end) return null;
    const [sh, sm] = start.split(':').map(Number);
    const [eh, em] = end.split(':').map(Number);
    let diff = (eh * 60 + em) - (sh * 60 + sm);
    if (diff < 0) diff += 24 * 60; // overnight shift
    const hours = Math.floor(diff / 60);
    const mins = diff % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours} hrs`;
  };

  const displayData = user || profile;

  const shiftStart = profile?.shiftStart || (displayData as any)?.shiftStart;
  const shiftEnd = profile?.shiftEnd || (displayData as any)?.shiftEnd;
  const shiftStartFormatted = formatShiftTime(shiftStart);
  const shiftEndFormatted = formatShiftTime(shiftEnd);
  const shiftDuration = getShiftDuration(shiftStart, shiftEnd);

  const handleLogout = () => {
    setIsOpen(false);
    logout();
    navigate('/staff/login', { replace: true });
  };

  if (!displayData) return null;

  // user object has fullName, profile has name — resolve to a single display name
  const displayName = displayData.name || displayData.firstName || displayData.fullName || '';

  // Collapsed mode - vertical icon buttons inline (no popup)
  if (collapsed) {
    return (
      <div className="flex flex-col items-center gap-1">
        {/* Avatar */}
        <div className="relative group/item mb-1">
          <button
            onClick={() => navigate('/staff/profile')}
            className="w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br from-terra-500 to-terra-600 text-white text-xs font-medium hover:shadow-md transition-all duration-150"
          >
            {getInitials(displayName)}
          </button>
          {/* Tooltip */}
          <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 px-2.5 py-1.5 rounded-md bg-neutral-800 text-white text-xs font-medium opacity-0 invisible group-hover/item:opacity-100 group-hover/item:visible transition-all duration-150 whitespace-nowrap z-50">
            {displayName}
            <span className="block text-[10px] text-neutral-400 font-normal">{getRoleLabel(displayData.role)}</span>
          </div>
        </div>

        {/* Clock In/Out */}
        <div className="relative group/item">
          {profile?.clockedIn ? (
            <button
              onClick={() => clockOut()}
              className="flex items-center justify-center p-3 rounded-xl text-red-500 hover:bg-red-50 transition-all duration-150"
            >
              <Clock className="w-[18px] h-[18px]" strokeWidth={1.75} />
            </button>
          ) : (
            <button
              onClick={() => clockIn()}
              className="flex items-center justify-center p-3 rounded-xl text-green-600 hover:bg-green-50 transition-all duration-150"
            >
              <Clock className="w-[18px] h-[18px]" strokeWidth={1.75} />
            </button>
          )}
          {/* Tooltip */}
          <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 px-2.5 py-1.5 rounded-md bg-neutral-800 text-white text-xs font-medium opacity-0 invisible group-hover/item:opacity-100 group-hover/item:visible transition-all duration-150 whitespace-nowrap z-50">
            {profile?.clockedIn ? 'Clock Out' : 'Clock In'}
          </div>
        </div>

        {/* Sign Out */}
        <div className="relative group/item">
          <button
            onClick={handleLogout}
            className="flex items-center justify-center p-3 rounded-xl text-neutral-400 hover:bg-red-50 hover:text-red-500 transition-all duration-150"
          >
            <LogOut className="w-[18px] h-[18px]" strokeWidth={1.75} />
          </button>
          {/* Tooltip */}
          <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 px-2.5 py-1.5 rounded-md bg-neutral-800 text-white text-xs font-medium opacity-0 invisible group-hover/item:opacity-100 group-hover/item:visible transition-all duration-150 whitespace-nowrap z-50">
            Sign Out
          </div>
        </div>
      </div>
    );
  }

  // Expanded mode - full profile card
  return (
    <div ref={menuRef} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center gap-3 p-2.5 rounded-lg border transition-all duration-150 ${
          isOpen
            ? 'bg-neutral-50 border-neutral-200'
            : 'bg-white border-neutral-100 hover:bg-neutral-50 hover:border-neutral-200'
        }`}
      >
        {/* Avatar */}
        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-terra-500 to-terra-600 text-white flex items-center justify-center text-xs font-medium flex-shrink-0">
          {getInitials(displayName)}
        </div>

        {/* User Info */}
        <div className="flex-1 min-w-0 text-left">
          <p className="text-sm font-medium text-neutral-800 truncate">
            {displayName}
          </p>
          <div className="flex items-center gap-1.5">
            {profile?.clockedIn && (
              <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            )}
            <p className="text-[11px] text-neutral-500">{getRoleLabel(displayData.role)}</p>
          </div>
        </div>

        {/* Chevron */}
        <ChevronDown className={`w-4 h-4 text-neutral-400 transition-transform duration-150 ${
          isOpen ? 'rotate-180' : ''
        }`} />
      </button>

      {/* Expanded Dropdown Menu */}
      {isOpen && (
        <div className="absolute bottom-full left-0 right-0 mb-2 bg-white rounded-lg shadow-lg border border-neutral-200 overflow-hidden z-50">
          {/* Shift Info Header */}
          <div className="p-3 border-b border-neutral-100 bg-neutral-50">
            <div className="flex items-center justify-between text-[11px]">
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-terra-500" />
                <span className="text-neutral-600 font-medium">
                  {shiftStartFormatted && shiftEndFormatted
                    ? `${shiftStartFormatted} – ${shiftEndFormatted}`
                    : 'No shift assigned'}
                </span>
              </div>
              {shiftDuration && (
                <span className="px-1.5 py-0.5 rounded bg-terra-50 text-terra-600 font-semibold text-[10px]">
                  {shiftDuration}
                </span>
              )}
            </div>
            {profile?.clockedIn && (
              <div className="flex items-center gap-1.5 mt-1.5 text-[11px]">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                <span className="text-green-600 font-medium">
                  Clocked in since {formatClockInTime()}
                </span>
              </div>
            )}
          </div>

          {/* Menu Items */}
          <div className="p-1.5">
            

            <div className="h-px bg-neutral-100 my-1.5" />

            {profile?.clockedIn ? (
              <button
                onClick={() => { clockOut(); setIsOpen(false); }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-[13px] text-red-600 hover:bg-red-50 rounded-md transition-colors"
              >
                <Clock className="w-4 h-4" />
                <span>Clock Out</span>
              </button>
            ) : (
              <button
                onClick={() => { clockIn(); setIsOpen(false); }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-[13px] text-green-600 hover:bg-green-50 rounded-md transition-colors"
              >
                <Clock className="w-4 h-4" />
                <span>Clock In</span>
              </button>
            )}

            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-[13px] text-red-600 hover:bg-red-50 rounded-md transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
