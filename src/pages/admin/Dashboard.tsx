import { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAGIChat } from '@/contexts/AGIChatContext';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  Plus,
  TrendingUp,
  TrendingDown,
  Users,
  Calendar,
  Home,
  ArrowUpRight,
  ArrowDownRight,
  Target,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  LogIn,
  LogOut,
  Sparkles,
  Hotel,
  BedDouble,
  Star,
  Layers,
  ArrowRight,
  Clock,
  Filter,
  MoreHorizontal,
  RefreshCw,
  ExternalLink,
  Sun,
  Moon,
  Activity,
  Zap,
  Crown,
  Award,
  TrendingUp as TrendUp,
  FileText,
  MessageSquare,
  Bell,
  DollarSign,
} from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { reviewsData, reviewsSummary } from '../../data/reviewsData';
import { formatCurrency } from '../../utils/dashboardUtils';
import { useCurrency } from '@/hooks/useCurrency';
import { cn } from '../../lib/utils';
import { dashboardsService, AdminDashboard } from '../../api/services/dashboards.service';
import { Button, IconButton } from '../../components/ui2/Button';
import { Card } from '../../components/ui2/Card';
import { StatusBadge } from '../../components/ui2/Badge';

/**
 * Glimmora Luxury Hotel Management Dashboard
 * Premium hospitality design - Elegant, sophisticated, refined
 * Warm terra tones, gold accents, generous spacing, premium materials
 */

// ═══════════════════════════════════════════════════════════════════════════════
// ANIMATED COUNTER - Smooth number transitions
// ═══════════════════════════════════════════════════════════════════════════════

function AnimatedNumber({ value, prefix = '', suffix = '', decimals = 0 }) {
  const [display, setDisplay] = useState(0);
  const ref = useRef(null);
  const startTime = useRef(null);

  useEffect(() => {
    const target = typeof value === 'string' ? parseFloat(value.replace(/[^0-9.-]/g, '')) : value;
    const duration = 1200;

    const animate = (timestamp) => {
      if (!startTime.current) startTime.current = timestamp;
      const progress = Math.min((timestamp - startTime.current) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 4);
      setDisplay(eased * target);

      if (progress < 1) {
        ref.current = requestAnimationFrame(animate);
      } else {
        setDisplay(target);
      }
    };

    ref.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(ref.current);
  }, [value]);

  return (
    <span className="tabular-nums">
      {prefix}
      {decimals > 0 ? display.toFixed(decimals) : Math.round(display).toLocaleString()}
      {suffix}
    </span>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// LUXURY KPI CARD - Premium metric display with elegant styling
// ═══════════════════════════════════════════════════════════════════════════════

function LuxuryKPICard({
  label,
  value,
  prefix = '',
  suffix = '',
  change,
  changeType,
  icon: Icon,
  accentColor,
  accentColorClass,
  sparkData,
  delay = 0
}) {
  const isPositive = changeType === 'positive';
  const isIconFunction = typeof Icon === 'function' && !Icon.displayName && !Icon.$$typeof;

  return (
    <div
      className="relative overflow-hidden rounded-[10px] bg-white p-4 sm:p-6"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="relative">
        {/* Header with Icon and Title */}
        <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
          <div className={cn(
            "w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center flex-shrink-0",
            accentColorClass === 'terra' && 'bg-terra-50',
            accentColorClass === 'sage' && 'bg-sage-50',
            accentColorClass === 'gold' && 'bg-gold-50',
            accentColorClass === 'ocean' && 'bg-ocean-50'
          )}>
            <Icon className={cn(
              "w-3.5 h-3.5 sm:w-4 sm:h-4",
              accentColorClass === 'terra' && 'text-terra-600',
              accentColorClass === 'sage' && 'text-sage-600',
              accentColorClass === 'gold' && 'text-gold-600',
              accentColorClass === 'ocean' && 'text-ocean-600'
            )} />
          </div>
          <p className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-widest text-neutral-400 truncate">
            {label}
          </p>
        </div>

        {/* Value */}
        <p className="text-xl sm:text-[28px] font-semibold tracking-tight text-neutral-900 mb-1 sm:mb-2">
          <AnimatedNumber value={value} prefix={prefix} suffix={suffix} />
        </p>

        {/* Comparison */}
        <div className="flex items-center justify-between gap-2">
          <p className="text-[10px] sm:text-[11px] text-neutral-400 font-medium">vs Last Month</p>
          {change && (
            <div className={cn(
              'flex items-center gap-0.5 sm:gap-1 text-[10px] sm:text-[11px] font-semibold',
              isPositive
                ? 'text-sage-600'
                : 'text-rose-600'
            )}>
              {isPositive ? <ArrowUpRight className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> : <ArrowDownRight className="w-3 h-3 sm:w-3.5 sm:h-3.5" />}
              {change}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// LUXURY STATUS INDICATOR - Refined status badges
// ═══════════════════════════════════════════════════════════════════════════════

function LuxuryStatusIndicator({ label, value, colorClass, trend, icon: Icon }) {
  const colorMap = {
    'sage': { bg: 'bg-sage-50', icon: 'text-sage-600', dot: 'bg-sage-500', border: 'border-sage-200' },
    'ocean': { bg: 'bg-ocean-50', icon: 'text-ocean-600', dot: 'bg-ocean-500', border: 'border-ocean-200' },
    'terra': { bg: 'bg-terra-50', icon: 'text-terra-600', dot: 'bg-terra-500', border: 'border-terra-200' },
    'copper': { bg: 'bg-copper-50', icon: 'text-copper-600', dot: 'bg-copper-500', border: 'border-copper-200' },
    'rose': { bg: 'bg-rose-50', icon: 'text-rose-600', dot: 'bg-rose-500', border: 'border-rose-200' },
    'gold': { bg: 'bg-gold-50', icon: 'text-gold-600', dot: 'bg-gold-500', border: 'border-gold-200' },
  };
  const colors = colorMap[colorClass] || colorMap.terra;

  return (
    <div className={cn("flex items-center gap-4 px-5 py-4 rounded-[10px] bg-white border", colors.border)}>
      <div className={cn("w-12 h-12 rounded-lg flex items-center justify-center", colors.bg)}>
        <Icon className={cn("w-5 h-5", colors.icon)} />
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold uppercase tracking-[0.1em] text-neutral-500 mb-1">
          {label}
        </p>
        <p className="text-2xl font-light text-neutral-900 tracking-tight">
          {value}
        </p>
      </div>

      {trend !== undefined && (
        <div className={cn(
          'flex items-center gap-1 px-3 py-1.5 rounded text-xs font-semibold',
          trend >= 0 ? 'bg-sage-50 text-sage-700 border border-sage-200' : 'bg-rose-50 text-rose-700 border border-rose-200'
        )}>
          {trend >= 0 ? <TrendUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
          {trend >= 0 ? '+' : ''}{trend}%
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// OCCUPANCY GAUGE - Elegant radial visualization
// ═══════════════════════════════════════════════════════════════════════════════

function OccupancyGauge({ value, occupied, total }) {
  const radius = 80;
  const strokeWidth = 12;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div className="flex flex-col items-center py-2 sm:py-3">
      <div className="relative w-36 h-36 sm:w-[180px] sm:h-[180px]">
        <svg viewBox="0 0 180 180" className="w-full h-full transform -rotate-90">
          <defs>
            <linearGradient id="occupancyGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#A57865" />
              <stop offset="100%" stopColor="#BFA793" />
            </linearGradient>
          </defs>

          {/* Background track */}
          <circle
            cx="90"
            cy="90"
            r={radius}
            fill="none"
            stroke="#F5F5F4"
            strokeWidth={strokeWidth}
            opacity={0.5}
          />

          {/* Progress arc with gradient */}
          <circle
            cx="90"
            cy="90"
            r={radius}
            fill="none"
            stroke="url(#occupancyGradient)"
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />

          {/* Decorative inner ring */}
          <circle
            cx="90"
            cy="90"
            r={radius - 20}
            fill="none"
            stroke="#E7E5E4"
            strokeWidth={1}
            strokeDasharray="3 3"
            opacity={0.3}
          />
        </svg>

        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl sm:text-[32px] font-semibold text-neutral-900 tracking-tight">
            <AnimatedNumber value={value} suffix="%" />
          </span>
          <span className="text-[9px] sm:text-[10px] font-semibold uppercase tracking-widest text-neutral-400 mt-0.5 sm:mt-1">
            Occupied
          </span>
        </div>
      </div>

      {/* Stats below */}
      <div className="flex items-center gap-4 sm:gap-6 mt-4 sm:mt-5 pt-4 sm:pt-5 border-t border-neutral-100 w-full">
        <div className="flex-1 text-center">
          <div className="flex items-center justify-center gap-1.5 sm:gap-2 mb-0.5 sm:mb-1">
            <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-terra-500"></div>
            <p className="text-lg sm:text-2xl font-semibold text-neutral-900">
              <AnimatedNumber value={occupied} />
            </p>
          </div>
          <p className="text-[9px] sm:text-[10px] font-semibold uppercase tracking-widest text-neutral-400">Occupied</p>
        </div>
        <div className="w-px h-8 sm:h-10 bg-neutral-100" />
        <div className="flex-1 text-center">
          <div className="flex items-center justify-center gap-1.5 sm:gap-2 mb-0.5 sm:mb-1">
            <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-sage-400"></div>
            <p className="text-lg sm:text-2xl font-semibold text-neutral-900">
              <AnimatedNumber value={total - occupied} />
            </p>
          </div>
          <p className="text-[9px] sm:text-[10px] font-semibold uppercase tracking-widest text-neutral-400">Available</p>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// AI INSIGHT CARD - Elegant notification style
// ═══════════════════════════════════════════════════════════════════════════════

function InsightCard({ insight, index, onAction }: { insight: any; index: number; onAction?: (route: string) => void }) {
  const configs = {
    success: {
      icon: CheckCircle2,
      accentBar: 'bg-sage-500',
      iconBg: 'bg-sage-50',
      iconColor: 'text-sage-600',
      bg: 'bg-gradient-to-br from-sage-50/60 to-white'
    },
    warning: {
      icon: AlertCircle,
      accentBar: 'bg-gold-500',
      iconBg: 'bg-gold-50',
      iconColor: 'text-gold-600',
      bg: 'bg-gradient-to-br from-gold-50/60 to-white'
    },
    info: {
      icon: Sparkles,
      accentBar: 'bg-ocean-500',
      iconBg: 'bg-ocean-50',
      iconColor: 'text-ocean-600',
      bg: 'bg-gradient-to-br from-ocean-50/60 to-white'
    },
  };

  const config = configs[insight.type] || configs.info;
  const IconComponent = config.icon;

  return (
    <div
      className={cn(
        'relative rounded-lg p-3 sm:p-4 overflow-hidden hover:shadow-sm transition-all',
        config.bg
      )}
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <div className="flex items-start gap-3 sm:gap-4">
        <div className={cn("w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center flex-shrink-0", config.iconBg)}>
          <IconComponent className={cn("w-4 h-4 sm:w-5 sm:h-5", config.iconColor)} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 sm:gap-2 mb-1 sm:mb-1.5">
            <span className="text-[9px] sm:text-[10px] font-semibold uppercase tracking-widest text-neutral-500">
              {insight.category}
            </span>
            <span className="text-[9px] sm:text-[10px] text-neutral-300 hidden sm:inline">•</span>
            <span className="text-[9px] sm:text-[10px] font-medium text-neutral-400 hidden sm:inline">
              {insight.timeAgo}
            </span>
          </div>

          <p className="text-xs sm:text-[13px] font-semibold text-neutral-800 mb-0.5 sm:mb-1 leading-snug">
            {insight.title}
          </p>

          <p className="text-[10px] sm:text-[11px] text-neutral-500 leading-relaxed line-clamp-2 mb-2 sm:mb-3">
            {insight.message}
          </p>

          {/* Confidence bar */}
          <div className="flex items-center gap-2">
            <div className="flex-1 h-1 sm:h-1.5 rounded-full bg-neutral-100 overflow-hidden">
              <div
                className={cn(
                  "h-full rounded-full transition-all duration-1000",
                  insight.type === 'success' && 'bg-sage-500',
                  insight.type === 'warning' && 'bg-gold-500',
                  insight.type === 'info' && 'bg-ocean-500'
                )}
                style={{
                  width: `${insight.confidence}%`
                }}
              />
            </div>
            <span className="text-[9px] sm:text-[10px] font-semibold text-neutral-600 min-w-[28px] sm:min-w-[32px]">
              {insight.confidence}%
            </span>
          </div>

          {/* Action button */}
          {insight.actionLabel && onAction && (
            <button
              onClick={() => onAction(insight.actionRoute)}
              className={cn(
                "mt-2 sm:mt-3 inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-semibold transition-colors cursor-pointer",
                insight.type === 'success' && 'text-sage-600 hover:text-sage-700',
                insight.type === 'warning' && 'text-gold-600 hover:text-gold-700',
                insight.type === 'info' && 'text-ocean-600 hover:text-ocean-700'
              )}
            >
              {insight.actionLabel}
              <ChevronRight className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// HOUSEKEEPING GRID - Visual room status map
// ═══════════════════════════════════════════════════════════════════════════════

function HousekeepingChart({ summary }) {
  const total = summary.dirty + summary.inProgress + summary.clean;
  const cleanPercentage = total > 0 ? Math.round((summary.clean / total) * 100) : 0;

  // Using Glimmora terra/copper palette (same as Booking Channels)
  const chartData = [
    { name: 'Clean', value: summary.clean, colorClass: 'bg-terra-500', chartColor: '#A57865' },
    { name: 'Cleaning', value: summary.inProgress, colorClass: 'bg-terra-400', chartColor: '#BFA793' },
    { name: 'Dirty', value: summary.dirty, colorClass: 'bg-terra-600', chartColor: '#8B6450' },
  ];

  return (
    <div className="h-full flex flex-col">
      {/* Donut Chart */}
      <div className="flex-1 flex flex-col items-center justify-center py-2">
        <div className="relative w-32 h-32 sm:w-40 sm:h-40">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius="60%"
                outerRadius="90%"
                paddingAngle={3}
                dataKey="value"
                strokeWidth={0}
              >
                {chartData.map((entry, index) => (
                  <Cell key={index} fill={entry.chartColor} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-base sm:text-xl font-semibold text-neutral-900 tracking-tight">
              {cleanPercentage}%
            </span>
            <span className="text-[8px] sm:text-[9px] font-semibold uppercase tracking-widest text-neutral-400 mt-0.5">
              Clean
            </span>
          </div>
        </div>

        {/* Legend */}
        <div className="w-full flex flex-col gap-1.5 sm:gap-2 mt-3 sm:mt-4">
          {chartData.map((item) => (
            <div
              key={item.name}
              className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg bg-neutral-50/50 hover:bg-neutral-50 transition-colors"
            >
              <div className={cn("w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full flex-shrink-0", item.colorClass)} />
              <span className="text-xs sm:text-[13px] font-medium text-neutral-600 flex-1">{item.name}</span>
              <span className="text-xs sm:text-[13px] font-semibold text-neutral-900">{item.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 pt-3 sm:pt-4 mt-2 border-t border-neutral-100">
        <div className="text-center">
          <p className="text-base sm:text-xl font-semibold text-neutral-900 mb-0.5">
            {summary.avgCleaningTime > 0 ? summary.avgCleaningTime : '--'}<span className="text-xs sm:text-sm text-neutral-400 font-medium ml-0.5">{summary.avgCleaningTime > 0 ? 'm' : ''}</span>
          </p>
          <p className="text-[9px] sm:text-[10px] font-semibold uppercase tracking-widest text-neutral-400">
            Avg Clean Time
          </p>
        </div>
        <div className="text-center">
          <p className="text-base sm:text-xl font-semibold text-neutral-900 mb-0.5">
            {summary.staffOnShift}
          </p>
          <p className="text-[9px] sm:text-[10px] font-semibold uppercase tracking-widest text-neutral-400">
            Staff on Duty
          </p>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// CHANNEL DISTRIBUTION - Elegant donut chart
// ═══════════════════════════════════════════════════════════════════════════════

function normalizeChannelName(name: string): string {
  const map: Record<string, string> = {
    'direct': 'Direct',
    'booking.com': 'Booking.com',
    'bookingcom': 'Booking.com',
    'booking_com': 'Booking.com',
    'booking.Com': 'Booking.com',
    'Booking.Com': 'Booking.com',
    'expedia': 'Expedia',
    'airbnb': 'Airbnb',
    'walk-in': 'Walk-in',
    'walkin': 'Walk-in',
    'walk_in': 'Walk-in',
    'ota': 'OTA',
    'corporate': 'Corporate',
    'online': 'Online',
    'tripadvisor': 'TripAdvisor',
    'trip_advisor': 'TripAdvisor',
  };
  return map[name.toLowerCase()] ?? map[name] ?? name;
}

function ChannelDistribution({ data }) {
  const COLORS = ['#A57865', '#BFA793', '#8B6450', '#D4C4B4', '#B49A82'];

  // Find the top channel for the center label
  const topChannel = data.reduce((max, ch) => (ch.value > max.value ? ch : max), data[0] || { name: 'N/A', value: 0 });

  return (
    <div className="h-full flex flex-col">
      {/* Donut Chart */}
      <div className="flex-1 flex flex-col items-center justify-center py-2">
        <div className="relative w-32 h-32 sm:w-40 sm:h-40">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius="60%"
                outerRadius="90%"
                paddingAngle={3}
                dataKey="value"
                strokeWidth={0}
              >
                {data.map((entry, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-base sm:text-xl font-semibold text-neutral-900 tracking-tight">
              {topChannel.value}%
            </span>
            <span className="text-[8px] sm:text-[9px] font-semibold uppercase tracking-widest text-neutral-400 mt-0.5">
              {normalizeChannelName(topChannel.name)}
            </span>
          </div>
        </div>

        {/* Legend */}
        <div className="w-full flex flex-col gap-1.5 sm:gap-2 mt-3 sm:mt-4">
          {data.slice(0, 4).map((channel, i) => (
            <div
              key={i}
              className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg bg-neutral-50/50 hover:bg-neutral-50 transition-colors"
            >
              <div
                className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full flex-shrink-0"
                style={{ backgroundColor: COLORS[i] }}
              />
              <span className="text-xs sm:text-[13px] font-medium text-neutral-600 flex-1">{normalizeChannelName(channel.name)}</span>
              <span className="text-xs sm:text-[13px] font-semibold text-neutral-900">{channel.value}%</span>
            </div>
          ))}
        </div>
      </div>

      {/* Stats — mirrors Housekeeping bottom row */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 pt-3 sm:pt-4 mt-2 border-t border-neutral-100">
        <div className="text-center">
          <p className="text-base sm:text-xl font-semibold text-neutral-900 mb-0.5">
            {data.length}
          </p>
          <p className="text-[9px] sm:text-[10px] font-semibold uppercase tracking-widest text-neutral-400">
            Channels
          </p>
        </div>
        <div className="text-center">
          <p className="text-base sm:text-xl font-semibold text-neutral-900 mb-0.5">
            {topChannel.value}<span className="text-xs sm:text-sm text-neutral-400 font-medium ml-0.5">%</span>
          </p>
          <p className="text-[9px] sm:text-[10px] font-semibold uppercase tracking-widest text-neutral-400">
            Top Channel
          </p>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// QUICK ACTION - Refined button style
// ═══════════════════════════════════════════════════════════════════════════════

function QuickAction({ icon: Icon, label, sublabel, color, onClick }) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-2 sm:gap-4 p-3 sm:p-4 rounded-lg bg-neutral-50/50 text-left hover:bg-neutral-50 transition-all group"
    >
      <div
        className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center flex-shrink-0"
        style={{ backgroundColor: `${color}15` }}
      >
        <Icon className="w-4 h-4 sm:w-4.5 sm:h-4.5" style={{ color }} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs sm:text-[13px] font-semibold text-neutral-800 mb-0.5 leading-tight truncate">{label}</p>
        <p className="text-[10px] sm:text-[11px] text-neutral-400 font-medium hidden sm:block">{sublabel}</p>
      </div>
      <ChevronRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-neutral-300 group-hover:text-terra-600 group-hover:translate-x-0.5 transition-all flex-shrink-0" />
    </button>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// AMENITY BAR - Progress indicator
// ═══════════════════════════════════════════════════════════════════════════════

function AmenityUsage({ icon: Icon, name, usage, color }) {
  return (
    <div className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-lg bg-neutral-50/50 hover:bg-neutral-50 transition-colors">
      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-white flex items-center justify-center flex-shrink-0">
        <Icon className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-neutral-600" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1.5 sm:mb-2">
          <span className="text-xs sm:text-[13px] font-semibold text-neutral-800">{name}</span>
          <span className="text-xs sm:text-[13px] font-semibold text-neutral-900">{usage}%</span>
        </div>
        <div className="h-1 sm:h-1.5 rounded-full bg-neutral-200/60 overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-1000"
            style={{
              width: `${usage}%`,
              backgroundColor: color
            }}
          />
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// BOOKING STATUS BADGE
// ═══════════════════════════════════════════════════════════════════════════════

function BookingStatus({ status, checkOut }: { status?: string; checkOut?: string }) {
  // Display override: in-house bookings whose checkout date has strictly passed
  // render as "Checked Out". Underlying booking record is unchanged.
  const todayStr = new Date().toISOString().split('T')[0];
  const norm = String(status || '').toUpperCase().replace(/[\s_]/g, '-');
  const isInHouse = norm === 'IN-HOUSE' || norm === 'IN_HOUSE' || norm === 'CHECKED-IN';
  const effective = (isInHouse && checkOut && checkOut < todayStr) ? 'checked-out' : status?.toLowerCase().replace('_', '-');
  return <StatusBadge status={effective} />;
}

// ═══════════════════════════════════════════════════════════════════════════════
// PAYMENT STATUS BADGE
// ═══════════════════════════════════════════════════════════════════════════════

function PaymentStatusBadge({ status }: { status?: string }) {
  const statusConfig = {
    paid: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', label: 'Paid', icon: '✓' },
    pending: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', label: 'Pending', icon: '○' },
    partial: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', label: 'Partial', icon: '◐' },
    failed: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', label: 'Failed', icon: '✗' },
    refunded: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200', label: 'Refunded', icon: '↺' },
  };

  const normalizedStatus = status?.toLowerCase() || 'pending';
  const config = statusConfig[normalizedStatus] || statusConfig.pending;

  return (
    <span className={cn(
      'inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-semibold border',
      config.bg, config.text, config.border
    )}>
      <span>{config.icon}</span>
      {config.label}
    </span>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// LUXURY SECTION CARD - Premium card wrapper
// ═══════════════════════════════════════════════════════════════════════════════

function LuxurySectionCard({ title, subtitle, action, actionLabel, children, className, noPadding, icon: Icon, legend }: {
  title?: string;
  subtitle?: string;
  action?: () => void;
  actionLabel?: string;
  children: React.ReactNode;
  className?: string;
  noPadding?: boolean;
  icon?: React.ElementType;
  legend?: React.ReactNode;
}) {
  const hasFlex = className?.includes('flex');
  return (
    <div className={cn('rounded-[10px] bg-white overflow-hidden', className)}>
      {(title || action || legend) && (
        <div className="flex flex-wrap items-center justify-between gap-2 px-4 sm:px-6 py-4 sm:py-5 flex-shrink-0">
          <div className="flex items-center gap-3">
            {Icon && (
              <div className="w-10 h-10 rounded-lg bg-terra-50 flex items-center justify-center flex-shrink-0">
                <Icon className="w-5 h-5 text-terra-600" />
              </div>
            )}
            <div>
              {title && (
                <h3 className="text-sm font-semibold text-neutral-800">
                  {title}
                </h3>
              )}
              {subtitle && (
                <p className="text-[11px] text-neutral-400 font-medium mt-0.5 hidden sm:block">{subtitle}</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3 sm:gap-4">
            {legend && (
              <div className="flex items-center gap-3 sm:gap-4">
                {legend}
              </div>
            )}
            {action && (
              <button
                onClick={action}
                className="flex items-center gap-1 text-[11px] font-semibold text-terra-600 px-2 sm:px-3 py-1.5 rounded-lg hover:bg-terra-50 transition-colors"
              >
                {actionLabel} <ChevronRight className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>
      )}
      <div className={cn(noPadding ? '' : 'px-4 sm:px-6 pb-4 sm:pb-6', hasFlex && 'flex-1')}>{children}</div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN DASHBOARD
// ═══════════════════════════════════════════════════════════════════════════════

export default function Dashboard() {
  const [isLoading, setIsLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<AdminDashboard | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const { openChat } = useAGIChat();
  const { symbol, formatCurrency: formatCurrencyDynamic } = useCurrency();

  // Live time
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  // Fetch real dashboard data from API
  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setIsLoading(true);
        const data = await dashboardsService.getAdminDashboard();
        setDashboardData(data);
        setError(null);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
        setError('Failed to load dashboard data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboard();
    // Refresh every 5 minutes
    const interval = setInterval(fetchDashboard, 300000);
    return () => clearInterval(interval);
  }, []);

  // Extract metrics from dashboard data
  const occupancyRate = dashboardData?.kpis.occupancy_rate || 0;
  const avgOccupancy30d = dashboardData?.kpis.avg_occupancy_30d || 0;
  const adr = dashboardData?.kpis.adr || 0;
  const revpar = dashboardData?.kpis.revpar || 0;
  const occupiedRooms = dashboardData?.kpis.occupied_rooms || 0;
  const totalRooms = dashboardData?.kpis.total_rooms || 0;
  const todayRevenue = dashboardData?.kpis.revenue_today || 0;
  const mtdRevenue = dashboardData?.kpis.revenue_mtd || 0;
  const ytdRevenue = dashboardData?.kpis.revenue_ytd || 0;
  const arrivals = dashboardData?.kpis.checkins_today || 0;
  const departures = dashboardData?.kpis.checkouts_today || 0;
  const totalCompletedBookings = dashboardData?.kpis.total_completed_bookings || 0;
  const recentBookings = dashboardData?.recent_bookings || [];

  // Use MTD revenue when today's revenue is 0 (no current guests)
  const displayRevenue = todayRevenue > 0 ? todayRevenue : mtdRevenue;
  const revenueLabel = todayRevenue > 0 ? "Today's Revenue" : "MTD Revenue";
  // Use average occupancy when current is 0
  const displayOccupancy = occupancyRate > 0 ? occupancyRate : avgOccupancy30d;
  const occupancyLabel = occupancyRate > 0 ? "Occupancy Rate" : "Avg Occupancy (30d)";

  // Housekeeping data — use room-level counts from backend for accuracy
  const hk = dashboardData?.housekeeping;
  const housekeepingSummary = {
    clean: hk?.clean_rooms ?? (totalRooms - (hk?.dirty_rooms || 0) - (hk?.in_progress_rooms || hk?.in_progress_tasks || 0)),
    inProgress: hk?.in_progress_rooms ?? hk?.in_progress_tasks ?? 0,
    dirty: hk?.dirty_rooms || 0,
    avgCleaningTime: hk?.completed_today
      ? Math.round((8 * 60) / Math.max(hk.completed_today, 1))
      : 0,
    staffOnShift: hk?.staff_on_shift || 1,
  };

  // Channel mix from real data
  const channelMix = dashboardData?.channel_distribution || [
    { name: 'Direct', value: 100 },
  ];

  // AI Insights - hardcoded for now, will be generated by backend later
  const aiInsights = [
    {
      id: 1,
      type: occupancyRate < 60 ? 'warning' : 'success',
      category: 'Occupancy',
      title: occupancyRate < 60 ? 'Low Occupancy Warning' : 'Healthy Occupancy',
      message: occupancyRate < 60 ? `Occupancy below 60% - consider promotional pricing` : `Occupancy is healthy at ${occupancyRate.toFixed(1)}%`,
      timeAgo: '5 min ago',
      confidence: 87,
      actionLabel: 'View Pricing Rules',
      actionRoute: '/admin/revenue/pricing',
    },
    {
      id: 2,
      type: 'info',
      category: 'Revenue',
      title: 'Pricing Opportunity',
      message: `ADR optimization opportunity detected - current ADR: ₹${adr.toFixed(0)}`,
      timeAgo: '15 min ago',
      confidence: 78,
      actionLabel: 'View Revenue AI',
      actionRoute: '/admin/revenue/ai',
    },
    {
      id: 3,
      type: dashboardData?.maintenance.high_priority ? 'warning' : 'success',
      category: 'Maintenance',
      title: dashboardData?.maintenance.high_priority ? 'High Priority Maintenance' : 'All Systems Normal',
      message: dashboardData?.maintenance.high_priority
        ? `${dashboardData.maintenance.high_priority} high priority maintenance requests need attention`
        : 'No critical maintenance issues',
      timeAgo: '30 min ago',
      confidence: 82,
      actionLabel: 'View Maintenance',
      actionRoute: '/admin/maintenance',
    },
    {
      id: 4,
      type: 'success',
      category: 'Revenue',
      title: 'Revenue Projection',
      message: `Weekend revenue projected to exceed target by 18%`,
      timeAgo: '45 min ago',
      confidence: 89,
      actionLabel: 'View Reports',
      actionRoute: '/admin/reports/revenue-snapshot',
    },
  ];

  // Get upcoming arrivals - today's check-ins from backend (real data)
  const upcomingArrivals = (dashboardData?.upcoming_arrivals || []).map((b: any) => ({
    ...b,
    isVIP: b.isVIP || false,
    specialRequests: typeof b.specialRequests === 'string' && b.specialRequests
      ? b.specialRequests.split(',').map((s: string) => s.trim()).filter(Boolean)
      : Array.isArray(b.specialRequests) ? b.specialRequests : [],
  }));

  // Get recent reviews from real data
  const recentReviews = (dashboardData?.recent_reviews || []).slice(0, 3).map(r => ({
    id: r.id,
    guestName: r.guestName,
    rating: r.rating,
    review: r.reviewText,
    date: r.date,
    platform: r.platform,
    platformIcon: r.platform === 'Google' ? 'G' : r.platform === 'Booking.Com' ? 'B' : r.platform[0],
    sentiment: r.sentiment,
    hasReply: r.hasReply,
  }));

  // Calculate performance metrics using trends from backend
  // Helper to safely calculate last week value from trend percentage
  const calcLastWeek = (current: number, trendPercent: number | undefined): number => {
    if (!trendPercent || trendPercent === 0) return current;
    const divisor = 1 + (trendPercent / 100);
    // Avoid division by zero (happens when trend is exactly -100%)
    if (Math.abs(divisor) < 0.001) return 0;
    const result = current / divisor;
    return isNaN(result) || !isFinite(result) ? 0 : result;
  };

  // Use MTD data for Performance Summary when week data shows 0
  const weekRevenue = dashboardData?.kpis.revenue_week || 0;
  const performanceMetrics = {
    revenue: {
      thisWeek: weekRevenue > 0 ? weekRevenue : mtdRevenue,
      lastWeek: weekRevenue > 0
        ? calcLastWeek(weekRevenue, dashboardData?.trends.adr)
        : (dashboardData?.kpis.revenue_last_month || 0),
      change: weekRevenue > 0 ? (dashboardData?.trends.adr || 0) : (dashboardData?.trends.revenue_mtd || 0),
      label: weekRevenue > 0 ? 'Revenue' : 'MTD Revenue'
    },
    occupancy: {
      thisWeek: displayOccupancy,
      lastWeek: calcLastWeek(displayOccupancy, dashboardData?.trends.occupancy),
      change: dashboardData?.trends.occupancy || 0,
      label: occupancyRate > 0 ? 'Occupancy' : 'Avg Occupancy'
    },
    adr: {
      thisWeek: adr,
      lastWeek: calcLastWeek(adr, dashboardData?.trends.adr),
      change: dashboardData?.trends.adr || 0,
      label: 'ADR'
    }
  };

  // Chart data
  const generateSparkData = (base, variance) =>
    Array.from({ length: 7 }, () => ({ value: base + (Math.random() - 0.5) * variance }));

  // Revenue chart data from backend
  const revenueChartData = useMemo(() => {
    const days = ['Thu', 'Fri', 'Sat', 'Sun', 'Mon', 'Tue', 'Wed'];

    // Check if backend data exists and has non-zero revenue
    if (dashboardData?.revenue_chart && dashboardData.revenue_chart.length > 0) {
      const totalChartRevenue = dashboardData.revenue_chart.reduce((sum, item) => sum + (item.revenue || 0), 0);

      // Only use backend data if it has actual revenue values
      if (totalChartRevenue > 0) {
        return dashboardData.revenue_chart.map(item => ({
          day: item.day,
          revenue: Math.max(0, item.revenue),
          lastWeek: Math.max(0, item.revenue * (1 - Math.abs(dashboardData.trends.adr || 8) / 100)),
        }));
      }
    }

    // Fallback: distribute MTD revenue across days if we have revenue but no daily breakdown
    if (mtdRevenue > 0) {
      const dailyAvg = mtdRevenue / 30; // Approximate daily average from MTD
      const weeklyTotal = dailyAvg * 7;
      // Create realistic distribution (weekends higher)
      const distribution = [0.12, 0.14, 0.18, 0.16, 0.13, 0.14, 0.13]; // Thu-Wed
      return days.map((day, i) => ({
        day,
        revenue: Math.round(weeklyTotal * distribution[i]),
        lastWeek: Math.round(weeklyTotal * distribution[i] * 0.92), // ~8% less last week
      }));
    }

    // Final fallback to mock data if no revenue at all
    return days.map(day => ({
      day,
      revenue: 18000 + Math.random() * 12000,
      lastWeek: 15000 + Math.random() * 8000,
    }));
  }, [dashboardData, mtdRevenue]);

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-copper-50/30 to-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-20 h-20 mx-auto mb-8">
            <div className="absolute inset-0 rounded-full border-2 border-neutral-200" />
            <div className="absolute inset-0 rounded-full border-2 border-terra-500 border-t-transparent animate-spin" />
          </div>
          <p className="text-lg text-neutral-600 animate-pulse font-light">
            Loading dashboard...
          </p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-copper-50/30 to-neutral-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertCircle className="w-16 h-16 text-rose-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-neutral-900 mb-2">Failed to Load Dashboard</h2>
          <p className="text-neutral-600 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-terra-600 text-white rounded-lg hover:bg-terra-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F9F7F7' }}>
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* MAIN CONTENT - 12 Column Grid System */}
      {/* Grid: 12 columns, 24px gutters, 40px margins */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      <main className="px-4 sm:px-6 lg:px-10 py-4 sm:py-6">
        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* OCCUPANCY SECTION */}
        {/* ═══════════════════════════════════════════════════════════════════ */}

        <div className="grid grid-cols-12 gap-4 sm:gap-6 mb-4 sm:mb-6">
          {/* Occupancy Gauge */}
          <div className="col-span-12 md:col-span-6">
            <LuxurySectionCard
              title={occupancyRate > 0 ? "Live Occupancy" : "Avg Occupancy (30d)"}
              subtitle={occupancyRate > 0 ? `${totalRooms} total rooms` : `${totalCompletedBookings} bookings completed`}
              className="h-full"
            >
              <OccupancyGauge
                value={Math.round(displayOccupancy)}
                occupied={occupancyRate > 0 ? occupiedRooms : Math.round((displayOccupancy / 100) * totalRooms)}
                total={totalRooms}
              />
            </LuxurySectionCard>
          </div>

          {/* Housekeeping — 6 cols */}
          <div className="col-span-12 md:col-span-6">
            <LuxurySectionCard
              title="Housekeeping Status"
              subtitle="Room cleaning overview"
              action={() => navigate('/admin/housekeeping')}
              actionLabel="Manage"
              className="h-full flex flex-col"
            >
              <div className="flex-1 flex flex-col justify-between">
                <HousekeepingChart summary={housekeepingSummary} />
              </div>
            </LuxurySectionCard>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* QUICK ACTIONS & AMENITIES - 6 + 6 = 12 columns */}
        {/* ═══════════════════════════════════════════════════════════════════ */}

        <div className="grid grid-cols-12 gap-4 sm:gap-6 mb-4 sm:mb-6">
          {/* Quick Actions - 6 columns on lg+ (iPad Pro and up) */}
          <div className="col-span-12 lg:col-span-6">
            <LuxurySectionCard title="Quick Actions" subtitle="Common tasks" className="h-full">
              <div className="grid grid-cols-2 gap-3 -mt-1">
                <QuickAction
                  icon={LogIn}
                  label="Check-in Guest"
                  sublabel="Process arrival"
                  color="#4E5840"
                  onClick={() => navigate('/admin/bookings', { state: { tab: 'arrivals' } })}
                />
                <QuickAction
                  icon={LogOut}
                  label="Check-out"
                  sublabel="Process departure"
                  color="#5C9BA4"
                  onClick={() => navigate('/admin/bookings', { state: { tab: 'departures' } })}
                />
                <QuickAction
                  icon={Calendar}
                  label="Room Service"
                  sublabel="New request"
                  color="#CDB261"
                  onClick={() => navigate('/admin/housekeeping')}
                />
                <QuickAction
                  icon={Sparkles}
                  label="AI Assistant"
                  sublabel="Get insights"
                  color="#5C9BA4"
                  onClick={() => openChat()}
                />
                <QuickAction
                  icon={FileText}
                  label="Generate Report"
                  sublabel="Quick export"
                  color="#A57865"
                  onClick={() => navigate('/admin/reports')}
                />
                <QuickAction
                  icon={Bell}
                  label="Notifications"
                  sublabel="View alerts"
                  color="#CDB261"
                  onClick={() => window.dispatchEvent(new CustomEvent('glimmora:open-notifications'))}
                />
              </div>
            </LuxurySectionCard>
          </div>

          {/* Room Utilization - 6 columns */}
          <div className="col-span-12 lg:col-span-6">
            <LuxurySectionCard title="Room Utilization" subtitle="Current room allocation" className="h-full">
              <div className="space-y-3 -mt-1">
                <AmenityUsage icon={BedDouble} name="Occupied" usage={totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0} color="#5C9BA4" />
                <AmenityUsage icon={Home} name="Available" usage={totalRooms > 0 ? Math.round(((dashboardData?.kpis.available_rooms || 0) / totalRooms) * 100) : 0} color="#4E5840" />
                <AmenityUsage icon={Layers} name="Dirty" usage={totalRooms > 0 ? Math.round(((dashboardData?.kpis.dirty_rooms || 0) / totalRooms) * 100) : 0} color="#CDB261" />
                <AmenityUsage icon={AlertCircle} name="Out of Order" usage={totalRooms > 0 ? Math.round(((dashboardData?.kpis.out_of_order || 0) / totalRooms) * 100) : 0} color="#A57865" />
              </div>
            </LuxurySectionCard>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* UPCOMING ARRIVALS */}
        {/* ═══════════════════════════════════════════════════════════════════ */}

        <div className="grid grid-cols-12 gap-4 sm:gap-6 mb-4 sm:mb-6">
          {/* Upcoming Arrivals - full width */}
          <div className="col-span-12">
            <LuxurySectionCard
              title="Upcoming Arrivals"
              subtitle="Upcoming check-ins"
              action={() => navigate('/admin/cms/bookings')}
              actionLabel="View All"
              className="h-full"
            >
            <div className="space-y-2 sm:space-y-3">
              {upcomingArrivals.length > 0 ? (
                upcomingArrivals.map((arrival, idx) => {
                  // Show expected arrival time (e.g. "14:00") or formatted date
                  const checkInTime = arrival.expectedArrivalTime
                    ? arrival.expectedArrivalTime
                    : arrival.checkIn
                      ? new Date(arrival.checkIn + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                      : 'N/A';
                  return (
                    <div
                      key={arrival.id}
                      onClick={() => navigate('/admin/bookings', { state: { tab: 'arrivals' } })}
                      className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-lg bg-neutral-50/50 hover:bg-neutral-50 transition-colors cursor-pointer"
                    >
                      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-white flex items-center justify-center flex-shrink-0">
                        <Clock className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-neutral-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 sm:gap-2 mb-0.5">
                          <p className="text-xs sm:text-[13px] font-semibold text-neutral-800 truncate">{arrival.guest}</p>
                          {arrival.isVIP && (
                            <div className="flex items-center gap-0.5 sm:gap-1 px-1 sm:px-1.5 py-0.5 rounded-full bg-gold-50 flex-shrink-0">
                              <Crown className="w-2 h-2 sm:w-2.5 sm:h-2.5 text-gold-600" />
                              <span className="text-[8px] sm:text-[9px] font-semibold text-gold-700 uppercase tracking-wider">VIP</span>
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-[11px] text-neutral-500">
                          <span className="font-medium">Room {arrival.room}</span>
                          <span className="text-neutral-300">•</span>
                          <span>{checkInTime}</span>
                          {arrival.specialRequests && arrival.specialRequests.length > 0 && (
                            <>
                              <span className="text-neutral-300 hidden sm:inline">•</span>
                              <span className="text-terra-600 font-medium hidden sm:inline">{arrival.specialRequests.length} requests</span>
                            </>
                          )}
                        </div>
                      </div>
                      <ChevronRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-neutral-300 flex-shrink-0" />
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-6 sm:py-8 text-[10px] sm:text-[11px] text-neutral-400 font-medium">
                  No upcoming arrivals scheduled
                </div>
              )}
            </div>
            </LuxurySectionCard>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* RECENT BOOKINGS - 12 columns full width */}
        {/* ═══════════════════════════════════════════════════════════════════ */}

        <div className="grid grid-cols-12 gap-4 sm:gap-6">
          <div className="col-span-12">
            <LuxurySectionCard
              title="Recent Bookings"
              subtitle="Latest reservations and check-ins"
              action={() => navigate('/admin/cms/bookings')}
              actionLabel="View All"
              noPadding
            >
          {/* Mobile Card View */}
          <div className="sm:hidden px-4 pb-4 space-y-3">
            {recentBookings.map((booking, idx) => {
              const initials = booking.guest?.split(' ').filter(n => n).map(n => n[0]).join('') || 'G';
              const avatarColors = ['#A57865', '#CDB261', '#4E5840', '#5C9BA4', '#B49A82'];

              return (
                <div key={booking.id} className="p-3 rounded-lg bg-neutral-50/50">
                  <div className="flex items-center gap-3 mb-2">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-[10px] font-semibold flex-shrink-0"
                      style={{ backgroundColor: avatarColors[idx % avatarColors.length] }}
                    >
                      {initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p
                        className="text-xs font-semibold text-neutral-800 truncate hover:text-terra-600 cursor-pointer transition-colors"
                        onClick={() => navigate('/admin/cms/bookings', { state: { openBookingId: booking.id } })}
                      >
                        {booking.guest}
                      </p>
                      <p className="text-[10px] text-neutral-400">{booking.room} • {booking.roomType}</p>
                    </div>
                    <BookingStatus status={booking.status} checkOut={booking.checkOut} />
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-neutral-500">
                    <span>{new Date(booking.checkIn).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {new Date(booking.checkOut).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                    <span className="font-semibold text-neutral-900">{formatCurrency(booking.totalPrice || booking.totalAmount || booking.amount || 324)}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Desktop Table View */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-neutral-50/30">
                  {['Guest', 'Room', 'Check-in', 'Check-out', 'Source', 'Amount', 'Payment', 'Status'].map((header, i) => (
                    <th
                      key={header}
                      className={cn(
                        'py-3 sm:py-4 px-4 sm:px-6 text-[9px] sm:text-[10px] font-semibold uppercase tracking-widest text-neutral-400',
                        i === 5 ? 'text-right' : 'text-left'
                      )}
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {recentBookings.map((booking, idx) => {
                  const initials = booking.guest?.split(' ').filter(n => n).map(n => n[0]).join('') || 'G';
                  const avatarColors = ['#A57865', '#CDB261', '#4E5840', '#5C9BA4', '#B49A82'];

                  return (
                    <tr key={booking.id} className="bg-white hover:bg-neutral-50/30 transition-colors">
                      <td className="py-3 sm:py-4 px-4 sm:px-6">
                        <div className="flex items-center gap-3 sm:gap-4">
                          <div
                            className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center text-white text-[10px] sm:text-[11px] font-semibold flex-shrink-0"
                            style={{ backgroundColor: avatarColors[idx % avatarColors.length] }}
                          >
                            {initials}
                          </div>
                          <div>
                            <p
                              className="text-xs sm:text-[13px] font-semibold text-neutral-800 hover:text-terra-600 cursor-pointer transition-colors"
                              onClick={() => navigate('/admin/cms/bookings', { state: { openBookingId: booking.id } })}
                            >
                              {booking.guest}
                            </p>
                            <p className="text-[9px] sm:text-[10px] text-neutral-400 font-medium">{booking.id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 sm:py-4 px-4 sm:px-6">
                        <p className="text-xs sm:text-[13px] font-medium text-neutral-800">{booking.room}</p>
                        <p className="text-[9px] sm:text-[10px] text-neutral-400 font-medium">{booking.roomType}</p>
                      </td>
                      <td className="py-3 sm:py-4 px-4 sm:px-6 text-xs sm:text-[13px] text-neutral-600 font-medium">
                        {new Date(booking.checkIn).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </td>
                      <td className="py-3 sm:py-4 px-4 sm:px-6 text-xs sm:text-[13px] text-neutral-600 font-medium">
                        {new Date(booking.checkOut).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </td>
                      <td className="py-3 sm:py-4 px-4 sm:px-6 text-xs sm:text-[13px] text-neutral-500 font-medium">
                        {booking.source || 'Direct'}
                      </td>
                      <td className="py-3 sm:py-4 px-4 sm:px-6 text-right">
                        <span className="text-xs sm:text-[13px] font-semibold text-neutral-900">
                          {formatCurrency(booking.totalPrice || booking.totalAmount || booking.amount || 324)}
                        </span>
                      </td>
                      <td className="py-3 sm:py-4 px-4 sm:px-6">
                        <PaymentStatusBadge status={booking.paymentStatus} />
                      </td>
                      <td className="py-3 sm:py-4 px-4 sm:px-6">
                        <BookingStatus status={booking.status} checkOut={booking.checkOut} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              </table>
            </div>
            </LuxurySectionCard>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* RECENT REVIEWS - 12 columns full width */}
        {/* ═══════════════════════════════════════════════════════════════════ */}

        <div className="grid grid-cols-12 gap-4 sm:gap-6 mt-6">
          <div className="col-span-12">
            <LuxurySectionCard
              title="Recent Reviews"
              subtitle="Latest guest feedback"
              action={() => navigate('/admin/reputation')}
              actionLabel="View All"
            >
              {recentReviews.length > 0 ? (
                <div className="space-y-4">
                  {recentReviews.map((review) => (
                    <div key={review.id} className="p-4 rounded-xl bg-neutral-50/50 border border-neutral-100">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-terra-100 flex items-center justify-center text-terra-700 font-semibold text-sm">
                            {review.platformIcon}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-neutral-800">{review.guestName}</p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-[10px] text-neutral-400 font-medium">{review.platform}</span>
                              <span className="text-neutral-300">•</span>
                              <span className="text-[10px] text-neutral-400">
                                {new Date(review.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-0.5">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <svg
                                key={star}
                                className={`w-3.5 h-3.5 ${star <= review.rating ? 'text-amber-400' : 'text-neutral-200'}`}
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                            ))}
                          </div>
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                            review.sentiment === 'positive' ? 'bg-emerald-100 text-emerald-700' :
                            review.sentiment === 'negative' ? 'bg-red-100 text-red-700' :
                            'bg-amber-100 text-amber-700'
                          }`}>
                            {review.sentiment}
                          </span>
                        </div>
                      </div>
                      <p className="mt-3 text-[13px] text-neutral-600 leading-relaxed line-clamp-2">
                        "{review.review}"
                      </p>
                      {review.hasReply && (
                        <div className="mt-2 flex items-center gap-1.5 text-[10px] text-emerald-600 font-medium">
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Replied
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 px-4 rounded-xl bg-neutral-50/30 border border-dashed border-neutral-200">
                  <div className="w-12 h-12 rounded-full bg-neutral-50 flex items-center justify-center mb-3">
                    <svg className="w-6 h-6 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                  <p className="text-sm font-medium text-neutral-500">No reviews received yet</p>
                  <p className="text-xs text-neutral-400 mt-1">Feedback from guests will appear here once submitted.</p>
                </div>
              )}
            </LuxurySectionCard>
          </div>
        </div>
      </main>

      <style>{`
        .tabular-nums {
          font-variant-numeric: tabular-nums;
        }
      `}</style>
    </div>
  );
}
