import { useMemo } from 'react';
import {
  CalendarCheck, Clock, XCircle,
  TrendingUp, Users, ArrowUpRight, ArrowDownRight,
  Sparkles
} from 'lucide-react';
import { useCurrency } from '@/hooks/useCurrency';

/**
 * Enhanced Booking KPIs - Midnight Editorial Style
 * Dramatic dark theme with jewel tones and sophisticated typography
 */
export default function EnhancedBookingKPIs({ bookings = [] }) {
  const { formatCurrency, symbol } = useCurrency();
  const stats = useMemo(() => {
    const total = bookings.length;
    // Use case-insensitive comparison (API returns lowercase, e.g. 'confirmed', 'checked-in')
    const confirmed = bookings.filter(b => b.status?.toLowerCase() === 'confirmed').length;
    const pending = bookings.filter(b => b.status?.toLowerCase() === 'pending').length;
    const checkedIn = bookings.filter(b => b.status?.toLowerCase() === 'checked-in').length;
    const cancelled = bookings.filter(b => b.status?.toLowerCase() === 'cancelled').length;
    const totalRevenue = bookings.reduce((sum, b) => sum + (b.amount || 0), 0);
    const avgADR = total > 0 ? Math.round(totalRevenue / bookings.reduce((sum, b) => sum + (b.nights || 1), 0)) : 0;

    return {
      total,
      confirmed,
      pending,
      checkedIn,
      cancelled,
      totalRevenue,
      avgADR
    };
  }, [bookings]);

  const kpiCards = [
    {
      id: 'total',
      label: 'Total Bookings',
      value: stats.total,
      icon: CalendarCheck,
      trend: '+12%',
      trendUp: true,
      color: 'emerald',
      description: 'All reservations',
      glow: 'emerald'
    },
    {
      id: 'confirmed',
      label: 'Confirmed',
      value: stats.confirmed,
      icon: Sparkles,
      trend: '+8%',
      trendUp: true,
      color: 'sapphire',
      description: 'Ready to check-in',
      glow: 'sapphire'
    },
    {
      id: 'pending',
      label: 'Pending',
      value: stats.pending,
      icon: Clock,
      trend: '-3%',
      trendUp: false,
      color: 'amber',
      description: 'Awaiting confirmation',
      glow: 'amber'
    },
    {
      id: 'cancelled',
      label: 'Cancellations',
      value: stats.cancelled,
      icon: XCircle,
      trend: '-15%',
      trendUp: true,
      color: 'ruby',
      description: 'This period',
      glow: 'ruby'
    },
    {
      id: 'revenue',
      label: 'Revenue',
      value: formatCurrency(stats.totalRevenue),
      icon: () => <span className="text-lg font-bold">{symbol}</span>,
      trend: '+24%',
      trendUp: true,
      color: 'gold',
      description: 'Gross bookings',
      glow: 'gold'
    },
    {
      id: 'adr',
      label: 'Avg. ADR',
      value: formatCurrency(stats.avgADR),
      icon: TrendingUp,
      trend: '+5%',
      trendUp: true,
      color: 'violet',
      description: 'Per room night',
      glow: 'violet'
    }
  ];

  const colorStyles = {
    emerald: {
      bg: 'from-emerald-500/20 to-emerald-600/10',
      iconBg: 'bg-gradient-to-br from-emerald-400 to-emerald-600',
      valueColor: 'text-emerald-400',
      labelColor: 'text-emerald-300/80',
      border: 'border-emerald-500/30',
      glow: 'hover:shadow-emerald-500/30',
      accent: 'bg-emerald-500/10'
    },
    sapphire: {
      bg: 'from-blue-500/20 to-blue-600/10',
      iconBg: 'bg-gradient-to-br from-blue-400 to-blue-600',
      valueColor: 'text-blue-400',
      labelColor: 'text-blue-300/80',
      border: 'border-blue-500/30',
      glow: 'hover:shadow-blue-500/30',
      accent: 'bg-blue-500/10'
    },
    amber: {
      bg: 'from-amber-500/20 to-amber-600/10',
      iconBg: 'bg-gradient-to-br from-amber-400 to-amber-600',
      valueColor: 'text-amber-400',
      labelColor: 'text-amber-300/80',
      border: 'border-amber-500/30',
      glow: 'hover:shadow-amber-500/30',
      accent: 'bg-amber-500/10'
    },
    ruby: {
      bg: 'from-red-500/20 to-red-600/10',
      iconBg: 'bg-gradient-to-br from-red-400 to-red-600',
      valueColor: 'text-red-400',
      labelColor: 'text-red-300/80',
      border: 'border-red-500/30',
      glow: 'hover:shadow-red-500/30',
      accent: 'bg-red-500/10'
    },
    gold: {
      bg: 'from-yellow-500/20 to-yellow-600/10',
      iconBg: 'bg-gradient-to-br from-yellow-400 to-yellow-600',
      valueColor: 'text-yellow-400',
      labelColor: 'text-yellow-300/80',
      border: 'border-yellow-500/30',
      glow: 'hover:shadow-yellow-500/30',
      accent: 'bg-yellow-500/10'
    },
    violet: {
      bg: 'from-violet-500/20 to-violet-600/10',
      iconBg: 'bg-gradient-to-br from-violet-400 to-violet-600',
      valueColor: 'text-violet-400',
      labelColor: 'text-violet-300/80',
      border: 'border-violet-500/30',
      glow: 'hover:shadow-violet-500/30',
      accent: 'bg-violet-500/10'
    }
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {kpiCards.map((kpi, index) => {
        const Icon = kpi.icon;
        const style = colorStyles[kpi.color];
        const TrendIcon = kpi.trendUp ? ArrowUpRight : ArrowDownRight;

        return (
          <div
            key={kpi.id}
            className={`
              group relative overflow-hidden rounded-2xl border backdrop-blur-sm
              bg-gradient-to-br ${style.bg}
              ${style.border}
              shadow-lg ${style.glow}
              transition-all duration-500 ease-out
              hover:-translate-y-1 hover:scale-[1.02]
              animate-in fade-in slide-in-from-bottom-4
            `}
            style={{
              animationDelay: `${index * 80}ms`,
              animationDuration: '600ms',
              animationFillMode: 'both'
            }}
          >
            {/* Noise texture overlay */}
            <div
              className="absolute inset-0 opacity-[0.015] mix-blend-overlay pointer-events-none"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' /%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' /%3E%3C/svg%3E")`
              }}
            />

            {/* Gradient overlay on hover */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/0 via-white/5 to-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            {/* Content */}
            <div className="relative p-6">
              {/* Icon */}
              <div className={`
                relative w-12 h-12 rounded-xl ${style.iconBg}
                flex items-center justify-center mb-4
                shadow-lg group-hover:scale-110 group-hover:rotate-3
                transition-all duration-500
              `}>
                <Icon className="w-6 h-6 text-white" strokeWidth={2.5} />
                {/* Icon glow */}
                <div className={`absolute inset-0 rounded-xl ${style.iconBg} blur-lg opacity-50 group-hover:opacity-70 transition-opacity`} />
              </div>

              {/* Value */}
              <div className="relative mb-3">
                <p className={`text-3xl font-bold ${style.valueColor} tracking-tight mb-1 font-sans`}>
                  {kpi.value}
                </p>
                <p className={`text-[10px] font-bold ${style.labelColor} uppercase tracking-widest`}>
                  {kpi.label}
                </p>
              </div>

              {/* Trend & Description */}
              <div className="relative flex items-center justify-between mt-4 pt-3 border-t border-white/10">
                <span className="text-[10px] text-neutral-400 uppercase tracking-wide">{kpi.description}</span>
                <span className={`
                  inline-flex items-center gap-0.5 text-xs font-bold
                  ${kpi.trendUp ? 'text-emerald-400' : 'text-red-400'}
                `}>
                  <TrendIcon className="w-3.5 h-3.5" strokeWidth={3} />
                  {kpi.trend}
                </span>
              </div>

              {/* Decorative corner accent */}
              <div className={`
                absolute -top-8 -right-8 w-20 h-20 rounded-full
                ${style.accent} opacity-20
                group-hover:scale-150 group-hover:opacity-30
                transition-all duration-700
              `} />

              {/* Geometric accent line */}
              <div className={`
                absolute bottom-0 left-0 right-0 h-0.5
                ${style.iconBg} opacity-0 group-hover:opacity-100
                transition-opacity duration-500
              `} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
