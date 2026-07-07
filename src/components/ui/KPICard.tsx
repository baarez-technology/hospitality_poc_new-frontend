import React from 'react'
import { cn } from '@/lib/utils'
import { TrendingUp, TrendingDown } from 'lucide-react'

/**
 * KPI Card - Glimmora V2 Design System
 * Basic KPI card with value and optional trend
 */
export const KPICard = ({
  title,
  value,
  subtitle,
  trend,
  trendLabel = 'vs last month',
  icon: Icon,
  variant = 'default',
  className = '',
}) => {
  const isPositiveTrend = trend && !trend.startsWith('-')
  const isNegativeTrend = trend && trend.startsWith('-')

  return (
    <div className={cn('glass-card rounded-2xl p-5', className)}>
      {/* Header with icon */}
      {Icon && (
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 bg-terra-500/10 rounded-lg flex items-center justify-center">
            <Icon className="w-4 h-4 text-terra-600" />
          </div>
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{title}</span>
        </div>
      )}
      {!Icon && (
        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">{title}</div>
      )}

      {/* Value */}
      <div className="text-3xl font-bold text-gray-900">{value}</div>

      {/* Subtitle */}
      {subtitle && (
        <div className="text-xs text-gray-500 mt-1">{subtitle}</div>
      )}

      {/* Trend */}
      {trend && (
        <div className="flex items-center gap-1 mt-2">
          {isPositiveTrend && <TrendingUp className="w-4 h-4 text-deepGreen-500" />}
          {isNegativeTrend && <TrendingDown className="w-4 h-4 text-red-500" />}
          <span className={cn(
            'text-xs font-semibold',
            isPositiveTrend && 'text-deepGreen-500',
            isNegativeTrend && 'text-red-500'
          )}>
            {trend}
          </span>
          <span className="text-xs text-gray-500">{trendLabel}</span>
        </div>
      )}
    </div>
  )
}

/**
 * KPI Card with Sparkline Bars
 */
export const KPICardWithSparkline = ({
  title,
  value,
  trend,
  trendLabel = 'vs last month',
  icon: Icon,
  data = [40, 55, 45, 60, 70, 65, 90], // 7 bars by default
  color = 'terra',
  className = '',
}) => {
  const colorClasses = {
    terra: { bg: 'bg-terra-200', active: 'bg-terra-500' },
    aurora: { bg: 'bg-aurora-200', active: 'bg-aurora-500' },
    gold: { bg: 'bg-gold-200', active: 'bg-gold-500' },
    deepGreen: { bg: 'bg-deepGreen-200', active: 'bg-deepGreen-500' },
  }
  const colors = colorClasses[color] || colorClasses.terra
  const maxValue = Math.max(...data)

  return (
    <div className={cn('glass-card rounded-2xl p-5', className)}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {Icon && (
            <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center', `bg-${color}-500/10`)}>
              <Icon className={cn('w-4 h-4', `text-${color}-600`)} />
            </div>
          )}
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{title}</span>
        </div>
        {trend && (
          <span className={cn(
            'text-xs font-semibold',
            trend.startsWith('-') ? 'text-red-500' : 'text-deepGreen-500'
          )}>
            {trend.startsWith('-') ? '' : '↑ '}{trend}
          </span>
        )}
      </div>
      <div className="text-3xl font-bold text-gray-900 mb-3">{value}</div>

      {/* Sparkline bars */}
      <div className="h-10 flex items-end gap-1">
        {data.map((val, idx) => {
          const isLast = idx === data.length - 1
          return (
            <div
              key={idx}
              className={cn(
                'flex-1 rounded-t transition-all duration-300',
                isLast ? colors.active : colors.bg,
                isLast && 'shadow-sm'
              )}
              style={{ height: `${(val / maxValue) * 100}%` }}
            />
          )
        })}
      </div>
    </div>
  )
}

/**
 * Hero KPI Card - Large display with progress ring
 */
export const KPICardHero = ({
  title,
  subtitle,
  value,
  unit = '',
  trend,
  stats = [],
  live = false,
  className = '',
}) => {
  return (
    <div className={cn('glass-card rounded-3xl p-8', className)}>
      <div className="flex items-start justify-between mb-6">
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-1">{title}</h3>
          {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
        </div>
        {live && (
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 bg-green-500 rounded-full pulse-dot" />
            <span className="text-xs text-gray-500">Live</span>
          </div>
        )}
      </div>

      <div className="flex items-baseline gap-3 mb-6">
        <div className="text-[72px] font-light text-gray-900 leading-none tracking-tight">
          {value}<span className="text-3xl">{unit}</span>
        </div>
        {trend && (
          <div className={cn(
            'flex items-center gap-1 px-2.5 py-1 rounded-lg',
            trend.startsWith('-') ? 'bg-red-500/10' : 'bg-deepGreen-500/10'
          )}>
            {!trend.startsWith('-') && <TrendingUp className="w-4 h-4 text-deepGreen-500" />}
            {trend.startsWith('-') && <TrendingDown className="w-4 h-4 text-red-500" />}
            <span className={cn(
              'text-sm font-semibold',
              trend.startsWith('-') ? 'text-red-500' : 'text-deepGreen-500'
            )}>
              {trend}
            </span>
          </div>
        )}
      </div>

      {stats.length > 0 && (
        <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-200/50">
          {stats.map((stat, idx) => (
            <div key={idx}>
              <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">{stat.label}</div>
              <div className="text-xl font-semibold text-gray-900">{stat.value}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

/**
 * KPI Card with Progress Ring
 */
export const KPICardProgress = ({
  title,
  subtitle,
  current,
  target,
  label = 'Complete',
  badgeText,
  className = '',
}) => {
  const percentage = Math.round((current / target) * 100)
  const circumference = 2 * Math.PI * 42
  const offset = circumference - (percentage / 100) * circumference

  return (
    <div className={cn('glass-card rounded-3xl p-8', className)}>
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-1">{title}</h3>
          {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
        </div>
        {badgeText && (
          <span className="px-2.5 py-1 bg-gold-100 text-gold-700 text-xs font-semibold rounded-full">
            {badgeText}
          </span>
        )}
      </div>

      <div className="flex items-center gap-6">
        <div className="relative w-32 h-32">
          <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
            <circle cx="50" cy="50" r="42" fill="none" stroke="#E5E7EB" strokeWidth="8" />
            <circle
              cx="50"
              cy="50"
              r="42"
              fill="none"
              stroke="url(#progressGrad)"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              className="gauge-fill"
            />
            <defs>
              <linearGradient id="progressGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#A57B65" />
                <stop offset="100%" stopColor="#C0B261" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{percentage}%</div>
              <div className="text-[10px] text-gray-500">{label}</div>
            </div>
          </div>
        </div>

        <div className="flex-1">
          <div className="mb-3">
            <div className="text-xs text-gray-500 mb-1">Current</div>
            <div className="text-2xl font-bold text-gray-900">{current}</div>
          </div>
          <div>
            <div className="text-xs text-gray-500 mb-1">Target</div>
            <div className="text-lg font-semibold text-gray-600">{target}</div>
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * Gradient KPI Card - Colored background variant
 */
export const KPICardGradient = ({
  title,
  value,
  subtitle,
  trend,
  trendLabel = 'vs yesterday',
  icon: Icon,
  variant = 'terra', // terra, dark, success, info
  badgeText,
  className = '',
}) => {
  const variantClasses = {
    terra: 'bg-gradient-to-br from-terra-500 to-terra-600 text-white',
    dark: 'bg-gradient-to-br from-gray-800 to-gray-900 text-white',
    success: 'bg-gradient-to-br from-deepGreen-500 to-deepGreen-600 text-white',
    info: 'bg-gradient-to-br from-aurora-500 to-aurora-600 text-white',
  }

  return (
    <div className={cn('rounded-2xl p-5', variantClasses[variant], className)}>
      <div className="flex items-center justify-between mb-3">
        {Icon && (
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
            <Icon className="w-5 h-5" />
          </div>
        )}
        {badgeText && (
          <span className="px-2 py-0.5 bg-white/20 rounded-full text-xs font-semibold">
            {badgeText}
          </span>
        )}
      </div>
      <div className="text-3xl font-bold mb-1">{value}</div>
      <div className="text-sm opacity-80 mb-3">{title}</div>
      {trend && (
        <div className="flex items-center gap-1 text-sm">
          {!trend.startsWith('-') && <TrendingUp className="w-4 h-4" />}
          {trend.startsWith('-') && <TrendingDown className="w-4 h-4" />}
          <span className="font-semibold">{trend}</span>
          <span className="opacity-70">{trendLabel}</span>
        </div>
      )}
    </div>
  )
}

/**
 * Multi-stat KPI Card
 */
export const KPICardMultiStat = ({
  title,
  stats = [],
  className = '',
}) => {
  return (
    <div className={cn('glass-card rounded-2xl p-5', className)}>
      <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-4">{title}</div>
      <div className="space-y-3">
        {stats.map((stat, idx) => (
          <div key={idx} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {stat.icon && (
                <div className={cn(
                  'w-8 h-8 rounded-lg flex items-center justify-center',
                  stat.iconBg || 'bg-gray-100'
                )}>
                  <stat.icon className={cn('w-4 h-4', stat.iconColor || 'text-gray-500')} />
                </div>
              )}
              <span className="text-sm text-gray-600">{stat.label}</span>
            </div>
            <span className={cn('text-xl font-bold', stat.valueColor || 'text-gray-900')}>
              {stat.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default KPICard
