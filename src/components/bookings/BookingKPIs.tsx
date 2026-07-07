import { useMemo } from 'react';
import {
  CalendarCheck, Clock, XCircle,
  TrendingUp, Users, ArrowUpRight, ArrowDownRight,
  Sparkles
} from 'lucide-react';
import { useCurrency } from '@/hooks/useCurrency';

/**
 * Premium Booking KPI Dashboard
 * Elegant stat cards with key booking metrics
 */
export default function BookingKPIs({ bookings = [] }) {
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
    const vipCount = bookings.filter(b => b.vip).length;
    const occupiedRooms = bookings.filter(b => ['checked-in', 'confirmed'].includes(b.status?.toLowerCase())).length;

    return {
      total,
      confirmed,
      pending,
      checkedIn,
      cancelled,
      totalRevenue,
      avgADR,
      vipCount,
      occupiedRooms
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
      color: 'terra',
      description: 'All reservations'
    },
    {
      id: 'confirmed',
      label: 'Confirmed',
      value: stats.confirmed,
      icon: Sparkles,
      trend: '+8%',
      trendUp: true,
      color: 'ocean',
      description: 'Ready to check-in'
    },
    {
      id: 'pending',
      label: 'Pending',
      value: stats.pending,
      icon: Clock,
      trend: '-3%',
      trendUp: false,
      color: 'gold',
      description: 'Awaiting confirmation'
    },
    {
      id: 'cancelled',
      label: 'Cancellations',
      value: stats.cancelled,
      icon: XCircle,
      trend: '-15%',
      trendUp: true,
      color: 'rose',
      description: 'This period'
    },
    {
      id: 'revenue',
      label: 'Revenue',
      value: formatCurrency(stats.totalRevenue),
      icon: () => <span className="text-lg font-bold">{symbol}</span>,
      trend: '+24%',
      trendUp: true,
      color: 'sage',
      description: 'Gross bookings'
    },
    {
      id: 'adr',
      label: 'Avg. ADR',
      value: formatCurrency(stats.avgADR),
      icon: TrendingUp,
      trend: '+5%',
      trendUp: true,
      color: 'copper',
      description: 'Per room night'
    }
  ];

  const colorStyles = {
    terra: {
      bg: 'bg-gradient-to-br from-terra-50 to-terra-100/50',
      iconBg: 'bg-terra-500',
      iconColor: 'text-white',
      valueColor: 'text-terra-700',
      border: 'border-terra-200/60',
      glow: 'shadow-terra-200/20'
    },
    ocean: {
      bg: 'bg-gradient-to-br from-ocean-50 to-ocean-100/50',
      iconBg: 'bg-ocean-500',
      iconColor: 'text-white',
      valueColor: 'text-ocean-700',
      border: 'border-ocean-200/60',
      glow: 'shadow-ocean-200/20'
    },
    gold: {
      bg: 'bg-gradient-to-br from-gold-50 to-gold-100/50',
      iconBg: 'bg-gold-500',
      iconColor: 'text-white',
      valueColor: 'text-gold-700',
      border: 'border-gold-200/60',
      glow: 'shadow-gold-200/20'
    },
    rose: {
      bg: 'bg-gradient-to-br from-rose-50 to-rose-100/50',
      iconBg: 'bg-rose-500',
      iconColor: 'text-white',
      valueColor: 'text-rose-700',
      border: 'border-rose-200/60',
      glow: 'shadow-rose-200/20'
    },
    sage: {
      bg: 'bg-gradient-to-br from-sage-50 to-sage-100/50',
      iconBg: 'bg-sage-500',
      iconColor: 'text-white',
      valueColor: 'text-sage-700',
      border: 'border-sage-200/60',
      glow: 'shadow-sage-200/20'
    },
    copper: {
      bg: 'bg-gradient-to-br from-copper-50 to-copper-100/50',
      iconBg: 'bg-copper-500',
      iconColor: 'text-white',
      valueColor: 'text-copper-700',
      border: 'border-copper-200/60',
      glow: 'shadow-copper-200/20'
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
              group relative overflow-hidden rounded-2xl border p-5
              ${style.bg} ${style.border}
              shadow-sm hover:shadow-lg ${style.glow}
              transition-all duration-300 ease-out
              hover:-translate-y-0.5
            `}
            style={{
              animationDelay: `${index * 50}ms`
            }}
          >
            {/* Subtle gradient overlay on hover */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/0 to-white/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            {/* Icon */}
            <div className={`
              relative w-10 h-10 rounded-xl ${style.iconBg}
              flex items-center justify-center mb-4
              shadow-sm group-hover:scale-105 transition-transform duration-300
            `}>
              <Icon className={`w-5 h-5 ${style.iconColor}`} strokeWidth={2} />
            </div>

            {/* Value */}
            <div className="relative">
              <p className={`text-2xl font-bold ${style.valueColor} tracking-tight mb-1`}>
                {kpi.value}
              </p>
              <p className="text-xs font-semibold text-neutral-600 uppercase tracking-wider mb-2">
                {kpi.label}
              </p>
            </div>

            {/* Trend & Description */}
            <div className="relative flex items-center justify-between">
              <span className="text-[11px] text-neutral-500">{kpi.description}</span>
              <span className={`
                inline-flex items-center gap-0.5 text-[11px] font-semibold
                ${kpi.trendUp ? 'text-sage-600' : 'text-rose-600'}
              `}>
                <TrendIcon className="w-3 h-3" />
                {kpi.trend}
              </span>
            </div>

            {/* Decorative corner accent */}
            <div className={`
              absolute -top-6 -right-6 w-16 h-16 rounded-full
              ${style.iconBg} opacity-[0.04]
              group-hover:scale-150 transition-transform duration-500
            `} />
          </div>
        );
      })}
    </div>
  );
}
