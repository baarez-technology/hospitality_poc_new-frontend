import { useMemo } from 'react';
import { Globe, Building2, TrendingUp, Activity } from 'lucide-react';

/**
 * Enhanced Booking Widgets - Midnight Editorial Style
 * Channel Mix, Occupancy, and Booking Pace visualizations
 */
export default function EnhancedBookingWidgets({ bookings = [] }) {
  // Channel Mix data
  const channelData = useMemo(() => {
    const channels = bookings.reduce((acc, booking) => {
      const source = booking.source || 'Other';
      acc[source] = (acc[source] || 0) + 1;
      return acc;
    }, {});

    const total = bookings.length || 1;
    const channelArray = Object.entries(channels).map(([name, count]) => ({
      name,
      count,
      percentage: Math.round((count / total) * 100)
    }));

    return channelArray.sort((a, b) => b.count - a.count);
  }, [bookings]);

  // Occupancy data
  const occupancyData = useMemo(() => {
    const totalRooms = 50; // You can pass this as a prop
    const occupied = bookings.filter(b =>
      ['CHECKED-IN', 'CONFIRMED'].includes(b.status)
    ).length;
    const reserved = bookings.filter(b => b.status === 'CONFIRMED').length;
    const available = totalRooms - occupied;

    return {
      occupied,
      reserved,
      available,
      total: totalRooms,
      percentage: Math.round((occupied / totalRooms) * 100)
    };
  }, [bookings]);

  // Booking Pace data (last 7 days)
  const bookingPaceData = useMemo(() => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const data = days.map((day, index) => ({
      day,
      value: Math.floor(Math.random() * 20) + 5 // Mock data - replace with real data
    }));

    const maxValue = Math.max(...data.map(d => d.value));
    return { days: data, max: maxValue };
  }, [bookings]);

  const channelColors = {
    'Website': { bg: 'bg-emerald-500', text: 'text-emerald-400', glow: 'shadow-emerald-500/50' },
    'Booking.com': { bg: 'bg-blue-500', text: 'text-blue-400', glow: 'shadow-blue-500/50' },
    'Expedia': { bg: 'bg-amber-500', text: 'text-amber-400', glow: 'shadow-amber-500/50' },
    'Walk-in': { bg: 'bg-violet-500', text: 'text-violet-400', glow: 'shadow-violet-500/50' },
    'Other': { bg: 'bg-neutral-500', text: 'text-neutral-400', glow: 'shadow-neutral-500/50' }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Channel Mix Widget */}
      <div
        className="group relative overflow-hidden rounded-2xl border border-emerald-500/30 backdrop-blur-sm bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 shadow-lg hover:shadow-emerald-500/30 transition-all duration-500 animate-in fade-in slide-in-from-bottom-4"
        style={{ animationDelay: '0ms', animationDuration: '600ms', animationFillMode: 'both' }}
      >
        {/* Noise texture */}
        <div
          className="absolute inset-0 opacity-[0.015] mix-blend-overlay pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' /%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' /%3E%3C/svg%3E")`
          }}
        />

        <div className="relative p-6">
          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg">
              <Globe className="w-5 h-5 text-white" strokeWidth={2.5} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-emerald-400 font-sans">Channel Mix</h3>
              <p className="text-xs text-neutral-400">{bookings.length} bookings</p>
            </div>
          </div>

          {/* Channel List */}
          <div className="space-y-4">
            {channelData.map((channel, index) => {
              const colors = channelColors[channel.name] || channelColors['Other'];
              return (
                <div
                  key={channel.name}
                  className="relative"
                  style={{
                    animation: 'slideIn 500ms ease-out',
                    animationDelay: `${index * 100 + 200}ms`,
                    animationFillMode: 'both'
                  }}
                >
                  {/* Channel Info */}
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-neutral-200">{channel.name}</span>
                    <span className={`text-sm font-bold ${colors.text}`}>{channel.percentage}%</span>
                  </div>

                  {/* Progress Bar */}
                  <div className="relative h-2 bg-white/5 rounded-full overflow-hidden">
                    <div
                      className={`absolute top-0 left-0 h-full ${colors.bg} rounded-full transition-all duration-1000 ease-out`}
                      style={{
                        width: `${channel.percentage}%`,
                        animationDelay: `${index * 100 + 400}ms`
                      }}
                    >
                      {/* Shine effect */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Decorative elements */}
          <div className="absolute -bottom-4 -right-4 w-24 h-24 rounded-full bg-emerald-500/10 opacity-50 blur-2xl" />
        </div>
      </div>

      {/* Occupancy Widget */}
      <div
        className="group relative overflow-hidden rounded-2xl border border-blue-500/30 backdrop-blur-sm bg-gradient-to-br from-blue-500/20 to-blue-600/10 shadow-lg hover:shadow-blue-500/30 transition-all duration-500 animate-in fade-in slide-in-from-bottom-4"
        style={{ animationDelay: '100ms', animationDuration: '600ms', animationFillMode: 'both' }}
      >
        {/* Noise texture */}
        <div
          className="absolute inset-0 opacity-[0.015] mix-blend-overlay pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' /%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' /%3E%3C/svg%3E")`
          }}
        />

        <div className="relative p-6">
          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center shadow-lg">
              <Building2 className="w-5 h-5 text-white" strokeWidth={2.5} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-blue-400 font-sans">Occupancy</h3>
              <p className="text-xs text-neutral-400">Current status</p>
            </div>
          </div>

          {/* Circular Progress */}
          <div className="flex items-center justify-center mb-6">
            <div className="relative w-32 h-32">
              {/* Background circle */}
              <svg className="w-32 h-32 -rotate-90">
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  stroke="currentColor"
                  strokeWidth="12"
                  fill="none"
                  className="text-white/5"
                />
                {/* Progress circle */}
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  stroke="url(#blueGradient)"
                  strokeWidth="12"
                  fill="none"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 56}`}
                  strokeDashoffset={`${2 * Math.PI * 56 * (1 - occupancyData.percentage / 100)}`}
                  className="transition-all duration-1000 ease-out"
                  style={{ filter: 'drop-shadow(0 0 8px rgba(59, 130, 246, 0.6))' }}
                />
                <defs>
                  <linearGradient id="blueGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#60a5fa" />
                    <stop offset="100%" stopColor="#3b82f6" />
                  </linearGradient>
                </defs>
              </svg>

              {/* Center text */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-bold text-blue-400 font-sans">{occupancyData.percentage}%</span>
                <span className="text-xs text-neutral-400 uppercase tracking-wider mt-1">Occupied</span>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center p-3 rounded-xl bg-white/5 border border-white/10">
              <div className="text-lg font-bold text-blue-400">{occupancyData.occupied}</div>
              <div className="text-[10px] text-neutral-400 uppercase tracking-wide">In-house</div>
            </div>
            <div className="text-center p-3 rounded-xl bg-white/5 border border-white/10">
              <div className="text-lg font-bold text-emerald-400">{occupancyData.reserved}</div>
              <div className="text-[10px] text-neutral-400 uppercase tracking-wide">Reserved</div>
            </div>
            <div className="text-center p-3 rounded-xl bg-white/5 border border-white/10">
              <div className="text-lg font-bold text-neutral-400">{occupancyData.available}</div>
              <div className="text-[10px] text-neutral-400 uppercase tracking-wide">Available</div>
            </div>
          </div>
        </div>
      </div>

      {/* Booking Pace Widget */}
      <div
        className="group relative overflow-hidden rounded-2xl border border-violet-500/30 backdrop-blur-sm bg-gradient-to-br from-violet-500/20 to-violet-600/10 shadow-lg hover:shadow-violet-500/30 transition-all duration-500 animate-in fade-in slide-in-from-bottom-4"
        style={{ animationDelay: '200ms', animationDuration: '600ms', animationFillMode: 'both' }}
      >
        {/* Noise texture */}
        <div
          className="absolute inset-0 opacity-[0.015] mix-blend-overlay pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' /%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' /%3E%3C/svg%3E")`
          }}
        />

        <div className="relative p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-400 to-violet-600 flex items-center justify-center shadow-lg">
                <TrendingUp className="w-5 h-5 text-white" strokeWidth={2.5} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-violet-400 font-sans">Booking Pace</h3>
                <p className="text-xs text-neutral-400">Last 7 days</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm font-bold text-emerald-400">+18%</div>
              <div className="text-[10px] text-neutral-400">vs last week</div>
            </div>
          </div>

          {/* Bar Chart */}
          <div className="flex items-end justify-between gap-2 h-32 mb-4">
            {bookingPaceData.days.map((day, index) => {
              const height = (day.value / bookingPaceData.max) * 100;
              const isToday = index === 6; // Last day is today

              return (
                <div key={day.day} className="flex-1 flex flex-col items-center gap-2">
                  {/* Bar */}
                  <div className="relative w-full flex items-end" style={{ height: '100%' }}>
                    <div
                      className={`
                        w-full rounded-t-lg transition-all duration-1000 ease-out
                        ${isToday
                          ? 'bg-gradient-to-t from-violet-500 to-violet-400 shadow-lg shadow-violet-500/50'
                          : 'bg-gradient-to-t from-violet-500/40 to-violet-400/30 hover:from-violet-500/60 hover:to-violet-400/50'
                        }
                      `}
                      style={{
                        height: `${height}%`,
                        animationDelay: `${index * 100 + 400}ms`
                      }}
                    >
                      {/* Value on hover */}
                      <div className={`
                        absolute -top-8 left-1/2 -translate-x-1/2
                        px-2 py-1 rounded bg-neutral-900 border border-violet-500/50
                        text-[10px] font-bold text-violet-400
                        opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap
                      `}>
                        {day.value}
                      </div>
                    </div>
                  </div>

                  {/* Day label */}
                  <span className={`text-[10px] font-semibold uppercase tracking-wide ${
                    isToday ? 'text-violet-400' : 'text-neutral-400'
                  }`}>
                    {day.day}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Daily Average */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10">
            <span className="text-xs text-neutral-400">Daily average</span>
            <span className="text-sm font-bold text-violet-400">
              {Math.round(bookingPaceData.days.reduce((sum, d) => sum + d.value, 0) / 7)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
