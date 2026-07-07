/**
 * Kitchen Layout — Light mode for bright kitchen environments.
 * Clean header, live clock with seconds, outlet name, profile dropdown.
 * Matches admin design language (warm white, neutral borders).
 */
import { type ReactNode, useState, useEffect, useRef } from 'react';
import { ChefHat, LogOut, Wifi, Clock, ChevronDown, LayoutDashboard, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks';
import { useFnB } from '../../contexts/FnBContext';

export default function KitchenLayout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const { selectedOutlet } = useFnB();
  const navigate = useNavigate();
  const [time, setTime] = useState(new Date());
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setProfileOpen(false);
    };
    if (profileOpen) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [profileOpen]);

  const timeStr = time.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const isAdmin = user?.role && ['admin', 'manager', 'general_manager', 'front_office_manager', 'duty_manager'].includes(user.role.toLowerCase());
  const initials = (user?.fullName || 'K').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <div className="h-[100dvh] flex flex-col bg-[#f5f3f0] overflow-hidden">
      {/* Header — light, minimal */}
      <header className="flex-shrink-0 h-12 bg-white border-b border-neutral-200 px-4 sm:px-6 flex items-center justify-between gap-3">
        {/* Left: Logo + Kitchen label */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-orange-500 flex items-center justify-center flex-shrink-0">
            <ChefHat className="w-4 h-4 text-white" />
          </div>
          <div className="min-w-0">
            <p className="text-[13px] font-semibold text-neutral-900 truncate">
              Kitchen Display
            </p>
            {selectedOutlet && (
              <p className="text-[10px] text-neutral-400 truncate">{selectedOutlet.name}</p>
            )}
          </div>
        </div>

        {/* Center: Status */}
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 text-[11px] text-emerald-600 font-medium">
            <Wifi className="w-3 h-3" /> Live
          </span>
        </div>

        {/* Right: Clock + profile */}
        <div className="flex items-center gap-3 sm:gap-4 flex-shrink-0">
          <div className="flex items-center gap-1.5 text-neutral-500">
            <Clock className="w-3.5 h-3.5" />
            <span className="text-[14px] font-semibold tabular-nums text-neutral-700">{timeStr}</span>
          </div>

          {/* Profile dropdown */}
          <div ref={profileRef} className="relative">
            <button onClick={() => setProfileOpen(!profileOpen)}
              className="flex items-center gap-1.5 h-8 pl-1 pr-2 rounded-lg hover:bg-neutral-50 transition-colors">
              <div className="w-6 h-6 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
                <span className="text-[9px] font-bold text-orange-700">{initials}</span>
              </div>
              <ChevronDown className={`w-3 h-3 text-neutral-400 transition-transform ${profileOpen ? 'rotate-180' : ''}`} />
            </button>

            {profileOpen && (
              <div className="absolute right-0 top-full mt-1 w-52 bg-white rounded-xl border border-neutral-200 shadow-lg z-50 overflow-hidden">
                <div className="px-4 py-3 border-b border-neutral-100">
                  <p className="text-[12px] font-semibold text-neutral-900">{user?.fullName || 'Kitchen Staff'}</p>
                  <p className="text-[10px] text-neutral-400 capitalize mt-0.5">{user?.role?.replace('_', ' ')}</p>
                </div>
                <div className="py-1 border-b border-neutral-100">
                  {isAdmin && (
                    <button onClick={() => { setProfileOpen(false); navigate('/admin'); }}
                      className="w-full text-left px-4 py-2 text-[12px] text-neutral-700 hover:bg-neutral-50 flex items-center gap-2">
                      <LayoutDashboard className="w-3.5 h-3.5 text-neutral-400" /> Admin Dashboard
                    </button>
                  )}
                  <button onClick={() => { setProfileOpen(false); navigate('/pos'); }}
                    className="w-full text-left px-4 py-2 text-[12px] text-neutral-700 hover:bg-neutral-50 flex items-center gap-2">
                    <ArrowLeft className="w-3.5 h-3.5 text-neutral-400" /> POS
                  </button>
                </div>
                <div className="py-1">
                  <button onClick={() => { setProfileOpen(false); logout(); }}
                    className="w-full text-left px-4 py-2 text-[12px] text-red-600 hover:bg-red-50 flex items-center gap-2">
                    <LogOut className="w-3.5 h-3.5" /> Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 overflow-hidden min-h-0">{children}</main>
    </div>
  );
}
