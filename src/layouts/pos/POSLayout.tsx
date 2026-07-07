/**
 * POS Layout — Clean header with profile dropdown (like admin panel).
 */
import { type ReactNode, useState, useEffect, useRef } from 'react';
import { LogOut, Clock, UtensilsCrossed, ChevronDown, LayoutDashboard, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks';
import { useFnB } from '../../contexts/FnBContext';

export default function POSLayout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const { selectedOutlet } = useFnB();
  const navigate = useNavigate();

  // Check if user has admin access (show dashboard link)
  const isAdmin = user?.role && ['admin', 'manager', 'general_manager', 'front_office_manager', 'duty_manager', 'accounts_manager', 'revenue_manager', 'reservation_manager', 'housekeeping_manager'].includes(user.role.toLowerCase());
  const [timeStr, setTimeStr] = useState(() =>
    new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
  );
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const tick = () => setTimeStr(new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }));
    tick();
    const id = setInterval(tick, 30000);
    return () => clearInterval(id);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    };
    if (profileOpen) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [profileOpen]);

  const initials = (user?.fullName || 'U')
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="h-[100dvh] flex flex-col bg-[#f8f7f5] overflow-hidden">
      {/* Header */}
      <header className="flex-shrink-0 h-14 bg-white border-b border-neutral-200 px-4 sm:px-6 flex items-center justify-between gap-3">
        {/* Left: Logo + outlet name */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-9 h-9 rounded-[8px] bg-terra-600 flex items-center justify-center flex-shrink-0">
            <UtensilsCrossed className="w-[18px] h-[18px] text-white" />
          </div>
          <div className="min-w-0">
            <p className="text-[14px] font-semibold text-neutral-900 truncate">
              {selectedOutlet?.name || 'Glimmora POS'}
            </p>
            {selectedOutlet && (
              <p className="text-[11px] text-neutral-400 capitalize">{selectedOutlet.type.replace('_', ' ')}</p>
            )}
          </div>
        </div>

        {/* Right: Clock + profile dropdown */}
        <div className="flex items-center gap-3 sm:gap-4 flex-shrink-0">
          <div className="flex items-center gap-1.5 text-neutral-400">
            <Clock className="w-3.5 h-3.5" />
            <span className="text-[12px] font-medium tabular-nums">{timeStr}</span>
          </div>

          {/* Profile dropdown */}
          <div ref={profileRef} className="relative">
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              className="flex items-center gap-2 h-9 pl-1 pr-2.5 rounded-[8px] hover:bg-neutral-50 transition-colors"
            >
              {/* Avatar */}
              <div className="w-7 h-7 rounded-full bg-terra-100 flex items-center justify-center flex-shrink-0">
                <span className="text-[10px] font-bold text-terra-700">{initials}</span>
              </div>
              <span className="hidden sm:block text-[12px] font-medium text-neutral-700 max-w-[100px] truncate">
                {user?.fullName || 'Server'}
              </span>
              <ChevronDown className={`w-3.5 h-3.5 text-neutral-400 transition-transform ${profileOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown */}
            {profileOpen && (
              <div className="absolute right-0 top-full mt-1.5 w-56 bg-white rounded-[10px] border border-neutral-200 shadow-lg shadow-neutral-200/50 z-50 overflow-hidden">
                {/* User info */}
                <div className="px-4 py-3 border-b border-neutral-100">
                  <p className="text-[13px] font-semibold text-neutral-900">{user?.fullName || 'Server'}</p>
                  <p className="text-[11px] text-neutral-400 mt-0.5">{user?.email || ''}</p>
                  <p className="text-[10px] text-neutral-400 capitalize mt-0.5">{user?.role?.replace('_', ' ')}</p>
                </div>

                {/* Navigation */}
                <div className="py-1 border-b border-neutral-100">
                  {isAdmin && (
                    <button
                      onClick={() => { setProfileOpen(false); navigate('/admin'); }}
                      className="w-full text-left px-4 py-2.5 text-[13px] text-neutral-700 hover:bg-neutral-50 flex items-center gap-2.5 transition-colors"
                    >
                      <LayoutDashboard className="w-4 h-4 text-neutral-400" />
                      Admin Dashboard
                    </button>
                  )}
                  <button
                    onClick={() => { setProfileOpen(false); navigate('/pos'); }}
                    className="w-full text-left px-4 py-2.5 text-[13px] text-neutral-700 hover:bg-neutral-50 flex items-center gap-2.5 transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4 text-neutral-400" />
                    Switch Outlet
                  </button>
                </div>

                {/* Sign out */}
                <div className="py-1">
                  <button
                    onClick={() => { setProfileOpen(false); logout(); }}
                    className="w-full text-left px-4 py-2.5 text-[13px] text-red-600 hover:bg-red-50 flex items-center gap-2.5 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 overflow-hidden min-h-0 flex flex-col">{children}</main>
    </div>
  );
}
