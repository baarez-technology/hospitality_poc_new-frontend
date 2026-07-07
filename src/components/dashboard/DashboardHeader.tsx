import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, RefreshCw, Bell, ChevronDown } from 'lucide-react';
import { cn } from '../../lib/utils';

/**
 * DashboardHeader - Luxury header with warm gradient accent
 * Features: Live indicator, date display, period selector, actions
 */
export default function DashboardHeader({ selectedPeriod, onPeriodChange, onRefresh }) {
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const greeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <header className="relative overflow-hidden">
      {/* Luxury gradient background */}
      <div className="absolute inset-0 bg-gradient-to-r from-terra-50 via-white to-gold-50/30" />

      {/* Subtle pattern overlay */}
      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23A57865' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      <div className="relative px-8 py-6">
        <div className="flex items-start justify-between">
          {/* Left: Title & Time */}
          <div>
            <div className="flex items-center gap-4 mb-2">
              <h1 className="text-2xl font-semibold text-neutral-900 tracking-tight">
                {greeting()}
              </h1>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/80 backdrop-blur-sm border border-terra-200/50 shadow-sm">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-terra-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-terra-500" />
                </span>
                <span className="text-[11px] font-semibold uppercase tracking-widest text-terra-700">
                  Live
                </span>
              </div>
            </div>

            <p className="text-sm text-neutral-500">
              {currentTime.toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
                year: 'numeric'
              })}
              <span className="mx-2 text-neutral-300">·</span>
              <span className="text-neutral-700 font-medium">
                {currentTime.toLocaleTimeString('en-US', {
                  hour: '2-digit',
                  minute: '2-digit',
                  hour12: true
                })}
              </span>
            </p>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-3">
            {/* Period Selector */}
            <div className="relative">
              <select
                value={selectedPeriod}
                onChange={(e) => onPeriodChange(e.target.value)}
                className={cn(
                  "appearance-none pl-4 pr-10 py-2.5 text-sm font-medium",
                  "rounded-xl bg-white/80 backdrop-blur-sm",
                  "border border-neutral-200/80 text-neutral-700",
                  "focus:outline-none focus:ring-2 focus:ring-terra-500/20 focus:border-terra-300",
                  "transition-all cursor-pointer hover:bg-white hover:shadow-sm"
                )}
              >
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="quarter">This Quarter</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
            </div>

            {/* Refresh */}
            <button
              onClick={onRefresh}
              className={cn(
                "p-2.5 rounded-xl bg-white/80 backdrop-blur-sm",
                "border border-neutral-200/80",
                "text-neutral-500 hover:text-neutral-700",
                "hover:bg-white hover:shadow-sm",
                "transition-all active:scale-95"
              )}
            >
              <RefreshCw className="w-4 h-4" />
            </button>

            {/* Notifications */}
            <button
              className={cn(
                "relative p-2.5 rounded-xl bg-white/80 backdrop-blur-sm",
                "border border-neutral-200/80",
                "text-neutral-500 hover:text-neutral-700",
                "hover:bg-white hover:shadow-sm",
                "transition-all active:scale-95"
              )}
            >
              <Bell className="w-4 h-4" />
              <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-terra-500 rounded-full border-2 border-white" />
            </button>

            {/* New Booking CTA */}
            <button
              onClick={() => navigate('/admin/cms/bookings')}
              className={cn(
                "flex items-center gap-2 px-5 py-2.5",
                "text-sm font-semibold text-white",
                "rounded-xl transition-all duration-300",
                "bg-gradient-to-r from-terra-500 to-terra-600",
                "hover:from-terra-600 hover:to-terra-700",
                "shadow-lg shadow-terra-500/25",
                "hover:shadow-xl hover:shadow-terra-500/30",
                "hover:-translate-y-0.5 active:translate-y-0"
              )}
            >
              <Plus className="w-4 h-4" />
              <span>New Booking</span>
            </button>
          </div>
        </div>
      </div>

      {/* Bottom accent line */}
      <div className="h-px bg-gradient-to-r from-transparent via-terra-200 to-transparent" />
    </header>
  );
}
