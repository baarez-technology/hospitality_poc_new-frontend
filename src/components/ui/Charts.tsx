/**
 * Charts & KPIs Component Library
 * Glimmora Design System v2
 */

import React from 'react'
import { cn } from '@/lib/utils'
import { TrendingUp, TrendingDown } from 'lucide-react'

// Glimmora color palette
const colors = {
  terra: { 500: '#A57B65', 600: '#8B6450', 400: '#BFA793', 200: '#EBDED2' },
  aurora: { 500: '#5C8BA4', 600: '#4A7A93', 400: '#8FC4D6', 200: '#C3DFE9' },
  gold: { 500: '#C0B261', 600: '#A99D4E', 400: '#D6C87A', 200: '#F5F0CC' },
  deepGreen: { 500: '#4E5840', 600: '#3F4734', 400: '#7A8A66', 200: '#D3D7CC' },
}

/**
 * Basic KPI Card
 */
export const KPICard = ({
  label,
  value,
  subtitle,
  trend,
  trendDirection = 'up',
  trendText = 'vs last month',
  icon,
  className = '',
}) => {
  const isPositive = trendDirection === 'up'

  return (
    <div className={cn('glass-card rounded-2xl p-5', className)}>
      {icon && (
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 bg-[#A57B65]/10 rounded-lg flex items-center justify-center">
            {icon}
          </div>
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{label}</span>
        </div>
      )}
      {!icon && (
        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">{label}</div>
      )}
      <div className="text-3xl font-bold text-gray-900">{value}</div>
      {subtitle && (
        <div className="text-xs text-gray-500 mt-1">{subtitle}</div>
      )}
      {trend && (
        <div className="flex items-center gap-1 mt-2">
          {isPositive ? (
            <TrendingUp className="w-4 h-4 text-[#4E5840]" />
          ) : (
            <TrendingDown className="w-4 h-4 text-red-500" />
          )}
          <span className={cn('text-xs font-semibold', isPositive ? 'text-[#4E5840]' : 'text-red-500')}>
            {trend}
          </span>
          <span className="text-xs text-gray-500">{trendText}</span>
        </div>
      )}
    </div>
  )
}

/**
 * KPI Card with Sparkline Bar
 */
export const KPICardSparklineBar = ({
  label,
  value,
  trend,
  trendDirection = 'up',
  icon,
  data = [40, 55, 45, 60, 70, 65, 90],
  color = 'terra',
  className = '',
}) => {
  const colorSet = colors[color] || colors.terra
  const isPositive = trendDirection === 'up'
  const maxVal = Math.max(...data)

  return (
    <div className={cn('glass-card rounded-2xl p-5', className)}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {icon && (
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${colorSet[500]}15` }}>
              {icon}
            </div>
          )}
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{label}</span>
        </div>
        {trend && (
          <span className={cn('text-xs font-semibold', isPositive ? 'text-[#4E5840]' : 'text-red-500')}>
            {isPositive ? '↑' : '↓'} {trend}
          </span>
        )}
      </div>
      <div className="text-3xl font-bold text-gray-900 mb-3">{value}</div>
      <div className="h-10 flex items-end gap-1">
        {data.map((val, i) => {
          const height = (val / maxVal) * 100
          const isLast = i === data.length - 1
          return (
            <div
              key={i}
              className="flex-1 rounded-t transition-all duration-300"
              style={{
                height: `${height}%`,
                backgroundColor: isLast ? colorSet[500] : colorSet[200],
                boxShadow: isLast ? '0 2px 4px rgba(0,0,0,0.1)' : 'none',
              }}
            />
          )
        })}
      </div>
    </div>
  )
}

/**
 * KPI Card with Sparkline Line
 */
export const KPICardSparklineLine = ({
  label,
  value,
  trend,
  trendDirection = 'up',
  icon,
  data = [35, 28, 32, 22, 25, 15, 18, 8],
  color = 'aurora',
  className = '',
}) => {
  const colorSet = colors[color] || colors.aurora
  const isPositive = trendDirection === 'up'

  // Generate SVG path from data
  const maxVal = Math.max(...data)
  const minVal = Math.min(...data)
  const range = maxVal - minVal || 1
  const points = data.map((val, i) => {
    const x = (i / (data.length - 1)) * 100
    const y = 40 - ((val - minVal) / range) * 32
    return `${x},${y}`
  }).join(' L')

  const lastX = 100
  const lastY = 40 - ((data[data.length - 1] - minVal) / range) * 32

  return (
    <div className={cn('glass-card rounded-2xl p-5', className)}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {icon && (
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${colorSet[500]}15` }}>
              {icon}
            </div>
          )}
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{label}</span>
        </div>
        {trend && (
          <span className={cn('text-xs font-semibold', isPositive ? 'text-[#4E5840]' : 'text-red-500')}>
            {isPositive ? '↑' : '↓'} {trend}
          </span>
        )}
      </div>
      <div className="text-3xl font-bold text-gray-900 mb-3">{value}</div>
      <div className="h-10">
        <svg viewBox="0 0 100 40" className="w-full h-full">
          <defs>
            <linearGradient id={`lineGrad-${color}`} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={colorSet[500]} stopOpacity="0.3" />
              <stop offset="100%" stopColor={colorSet[500]} stopOpacity="0" />
            </linearGradient>
          </defs>
          <path
            d={`M${points} L100,40 L0,40 Z`}
            fill={`url(#lineGrad-${color})`}
          />
          <path
            d={`M${points}`}
            fill="none"
            stroke={colorSet[500]}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx={lastX} cy={lastY} r="3" fill={colorSet[500]} />
        </svg>
      </div>
    </div>
  )
}

/**
 * Hero KPI Card - Large with giant number
 */
export const KPICardHero = ({
  title,
  subtitle,
  value,
  unit = '',
  trend,
  trendDirection = 'up',
  stats = [],
  isLive = false,
  className = '',
}) => {
  const isPositive = trendDirection === 'up'

  return (
    <div className={cn('glass-card rounded-3xl p-8', className)}>
      <div className="flex items-start justify-between mb-6">
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-1">{title}</h3>
          {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
        </div>
        {isLive && (
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
            isPositive ? 'bg-[#4E5840]/10' : 'bg-red-500/10'
          )}>
            {isPositive ? (
              <TrendingUp className="w-4 h-4 text-[#4E5840]" />
            ) : (
              <TrendingDown className="w-4 h-4 text-red-500" />
            )}
            <span className={cn('text-sm font-semibold', isPositive ? 'text-[#4E5840]' : 'text-red-500')}>
              {trend}
            </span>
          </div>
        )}
      </div>
      {stats.length > 0 && (
        <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-200/50">
          {stats.map((stat, i) => (
            <div key={i}>
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
 * Progress Ring Component
 */
export const ProgressRing = ({
  value = 75,
  size = 128,
  strokeWidth = 8,
  label = 'Complete',
  className = '',
}) => {
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (value / 100) * circumference

  return (
    <div className={cn('relative', className)} style={{ width: size, height: size }}>
      <svg viewBox={`0 0 ${size} ${size}`} className="w-full h-full -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#E5E7EB"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="url(#progressGradient)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-1000 ease-out"
        />
        <defs>
          <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#A57B65" />
            <stop offset="100%" stopColor="#C0B261" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900">{value}%</div>
          <div className="text-[10px] text-gray-500">{label}</div>
        </div>
      </div>
    </div>
  )
}

/**
 * Horizontal Progress Bar
 */
export const ProgressBar = ({
  label,
  value,
  maxValue,
  percentage,
  color = 'terra',
  showPercentage = true,
  className = '',
}) => {
  const colorSet = colors[color] || colors.terra
  const pct = percentage || (maxValue ? (value / maxValue) * 100 : value)

  return (
    <div className={className}>
      <div className="flex justify-between text-xs mb-1.5">
        <span className="text-gray-600">{label}</span>
        <span className="font-semibold text-gray-900">{value}</span>
      </div>
      <div className="h-6 bg-gray-100 rounded-lg overflow-hidden">
        <div
          className="h-full rounded-lg flex items-center justify-end pr-2 transition-all duration-500"
          style={{
            width: `${pct}%`,
            background: `linear-gradient(to right, ${colorSet[500]}, ${colorSet[400]})`,
          }}
        >
          {showPercentage && pct > 15 && (
            <span className="text-[10px] text-white font-semibold">{Math.round(pct)}%</span>
          )}
        </div>
      </div>
    </div>
  )
}

/**
 * Gradient KPI Card (Action style)
 */
export const KPICardGradient = ({
  label,
  value,
  subtitle,
  trend,
  trendText = 'vs yesterday',
  icon,
  color = 'terra',
  badge,
  className = '',
}) => {
  const colorSet = colors[color] || colors.terra

  return (
    <div
      className={cn('rounded-2xl p-5 text-white', className)}
      style={{ background: `linear-gradient(to bottom right, ${colorSet[500]}, ${colorSet[600]})` }}
    >
      <div className="flex items-center justify-between mb-3">
        {icon && (
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
            {icon}
          </div>
        )}
        {badge && (
          <span className="px-2 py-0.5 bg-white/20 rounded-full text-xs font-semibold">{badge}</span>
        )}
      </div>
      <div className="text-3xl font-bold mb-1">{value}</div>
      <div className="text-sm opacity-80 mb-3">{label}</div>
      {trend && (
        <div className="flex items-center gap-1 text-sm">
          <TrendingUp className="w-4 h-4" />
          <span className="font-semibold">{trend}</span>
          <span className="opacity-70">{trendText}</span>
        </div>
      )}
    </div>
  )
}

/**
 * Dark KPI Card
 */
export const KPICardDark = ({
  label,
  value,
  icon,
  stats = [],
  isLive = false,
  className = '',
}) => {
  return (
    <div className={cn('bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-5 text-white', className)}>
      <div className="flex items-center justify-between mb-3">
        {icon && (
          <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
            {icon}
          </div>
        )}
        {isLive && (
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-green-400 rounded-full pulse-dot" />
            <span className="text-xs text-gray-400">Live</span>
          </div>
        )}
      </div>
      <div className="text-3xl font-bold mb-1">{value}</div>
      <div className="text-sm text-gray-400 mb-3">{label}</div>
      {stats.length > 0 && (
        <div className="flex items-center gap-4 text-xs">
          {stats.map((stat, i) => (
            <div key={i}>
              <span className="font-semibold" style={{ color: stat.color || '#fff' }}>{stat.value}</span>
              <span className="text-gray-500 ml-1">{stat.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

/**
 * Split KPI Card (comparison)
 */
export const KPICardSplit = ({
  label,
  leftValue,
  leftLabel,
  leftColor = 'terra',
  rightValue,
  rightLabel,
  className = '',
}) => {
  const leftColorSet = colors[leftColor] || colors.terra
  const leftPct = parseFloat(leftValue)
  const rightPct = 100 - leftPct

  return (
    <div className={cn('glass-card rounded-2xl overflow-hidden', className)}>
      <div className="p-5">
        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">{label}</div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold" style={{ color: leftColorSet[600] }}>{leftValue}</span>
          <span className="text-lg text-gray-400">/</span>
          <span className="text-2xl font-bold text-gray-400">{rightValue}</span>
        </div>
      </div>
      <div className="flex h-2">
        <div style={{ width: `${leftPct}%`, backgroundColor: leftColorSet[500] }} />
        <div style={{ width: `${rightPct}%`, backgroundColor: '#D1D5DB' }} />
      </div>
      <div className="p-4 bg-gray-50/50 flex justify-between text-xs">
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: leftColorSet[500] }} />
          <span className="text-gray-600">{leftLabel}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 bg-gray-300 rounded-full" />
          <span className="text-gray-600">{rightLabel}</span>
        </div>
      </div>
    </div>
  )
}

/**
 * Activity Stats Card
 */
export const ActivityStatsCard = ({
  title,
  items = [],
  className = '',
}) => {
  return (
    <div className={cn('glass-card rounded-2xl p-5', className)}>
      <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-4">{title}</div>
      <div className="space-y-3">
        {items.map((item, i) => (
          <div key={i} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: `${item.color}20` }}
              >
                {item.icon}
              </div>
              <span className="text-sm text-gray-600">{item.label}</span>
            </div>
            <span className="text-xl font-bold" style={{ color: item.color }}>{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

/**
 * Mini Stat Row
 */
export const MiniStat = ({
  label,
  value,
  trend,
  trendDirection = 'up',
  className = '',
}) => {
  const isPositive = trendDirection === 'up'

  return (
    <div className={cn('flex items-center justify-between', className)}>
      <span className="text-sm text-gray-600">{label}</span>
      <div className="flex items-center gap-2">
        <span className="text-sm font-semibold text-gray-900">{value}</span>
        {trend && (
          <span className={cn('text-xs font-semibold', isPositive ? 'text-[#4E5840]' : 'text-red-500')}>
            {isPositive ? '↑' : '↓'}{trend}
          </span>
        )}
      </div>
    </div>
  )
}

export default {
  KPICard,
  KPICardSparklineBar,
  KPICardSparklineLine,
  KPICardHero,
  ProgressRing,
  ProgressBar,
  KPICardGradient,
  KPICardDark,
  KPICardSplit,
  ActivityStatsCard,
  MiniStat,
}
