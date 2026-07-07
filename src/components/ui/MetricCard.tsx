import React, { useEffect, useState, useRef } from 'react'
import { cn } from '@/lib/utils'
import { useTheme } from '../../contexts/ThemeContext'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

/**
 * MetricCard - Warm Boutique Design System
 * Premium KPI/Metric card with animated counters, sparklines, and trend indicators.
 *
 * @param {object} props
 * @param {string} props.label - Metric label
 * @param {number|string} props.value - Metric value
 * @param {string} props.prefix - Value prefix (e.g., '$')
 * @param {string} props.suffix - Value suffix (e.g., '%')
 * @param {number} props.change - Percentage change
 * @param {'up'|'down'|'neutral'} props.changeType - Direction of change
 * @param {React.ComponentType} props.icon - Icon component
 * @param {'terra'|'gold'|'sage'|'ocean'|'rose'|'neutral'} props.accentColor - Icon accent color
 * @param {number[]} props.sparkData - Data points for sparkline
 * @param {string} props.description - Optional description text
 * @param {boolean} props.animate - Enable counter animation
 * @param {string} props.className - Additional classes
 */
export default function MetricCard({
  label,
  value,
  prefix = '',
  suffix = '',
  change,
  changeType = 'neutral',
  icon: Icon,
  accentColor = 'terra',
  sparkData,
  description,
  animate = true,
  className = '',
  onClick,
}) {
  const { isDark } = useTheme()
  const [displayValue, setDisplayValue] = useState(animate ? 0 : value)
  const hasAnimated = useRef(false)

  // Accent color classes
  const accentClasses = {
    terra: isDark ? 'bg-terra-900/50 text-terra-400' : 'bg-terra-50 text-terra-500',
    gold: isDark ? 'bg-gold-900/50 text-gold-400' : 'bg-gold-50 text-gold-600',
    sage: isDark ? 'bg-sage-900/50 text-sage-400' : 'bg-sage-50 text-sage-500',
    ocean: isDark ? 'bg-ocean-900/50 text-ocean-400' : 'bg-ocean-50 text-ocean-500',
    rose: isDark ? 'bg-rose-900/50 text-rose-400' : 'bg-rose-50 text-rose-500',
    neutral: isDark ? 'bg-neutral-800 text-neutral-400' : 'bg-neutral-100 text-neutral-500',
  }

  // Trend color classes
  const trendClasses = {
    up: 'text-sage-500',
    down: 'text-rose-500',
    neutral: 'text-neutral-400',
  }

  // Sparkline color
  const sparkColors = {
    terra: '#A57865',
    gold: '#CDB261',
    sage: '#4E5840',
    ocean: '#5C9BA4',
    rose: '#C25B5B',
    neutral: '#78716C',
  }

  // Animate counter
  useEffect(() => {
    if (!animate || hasAnimated.current || typeof value !== 'number') {
      setDisplayValue(value)
      return
    }

    hasAnimated.current = true
    const duration = 1000
    const startTime = Date.now()
    const startValue = 0
    const endValue = value

    const animateValue = () => {
      const now = Date.now()
      const elapsed = now - startTime
      const progress = Math.min(elapsed / duration, 1)

      // Easing function (ease-out-cubic)
      const easeOut = 1 - Math.pow(1 - progress, 3)
      const current = startValue + (endValue - startValue) * easeOut

      setDisplayValue(current)

      if (progress < 1) {
        requestAnimationFrame(animateValue)
      } else {
        setDisplayValue(endValue)
      }
    }

    requestAnimationFrame(animateValue)
  }, [value, animate])

  // Format display value
  const formatValue = (val) => {
    if (typeof val !== 'number') return val
    if (suffix === '%') return val.toFixed(1)
    if (prefix === '₹' || prefix === '$') return val.toLocaleString('en-US', { maximumFractionDigits: 0 })
    return val.toLocaleString('en-US', { maximumFractionDigits: 0 })
  }

  // Render mini sparkline
  const renderSparkline = () => {
    if (!sparkData || sparkData.length < 2) return null

    const width = 64
    const height = 24
    const max = Math.max(...sparkData)
    const min = Math.min(...sparkData)
    const range = max - min || 1

    const points = sparkData
      .map((val, i) => {
        const x = (i / (sparkData.length - 1)) * width
        const y = height - ((val - min) / range) * height
        return `${x},${y}`
      })
      .join(' ')

    return (
      <svg width={width} height={height} className="opacity-60">
        <polyline
          fill="none"
          stroke={sparkColors[accentColor]}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={points}
        />
      </svg>
    )
  }

  // Trend icon
  const TrendIcon = changeType === 'up' ? TrendingUp : changeType === 'down' ? TrendingDown : Minus

  return (
    <div
      className={cn(
        'boutique-metric group',
        onClick && 'cursor-pointer',
        className
      )}
      onClick={onClick}
    >
      <div className="flex items-start justify-between gap-4">
        {/* Icon */}
        {Icon && (
          <div
            className={cn(
              'w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-105',
              accentClasses[accentColor]
            )}
          >
            <Icon className="w-5 h-5" />
          </div>
        )}

        {/* Sparkline */}
        {sparkData && (
          <div className="flex-shrink-0">{renderSparkline()}</div>
        )}
      </div>

      {/* Value */}
      <div className="mt-4">
        <div
          className={cn(
            'text-2xl font-semibold tracking-tight',
            isDark ? 'text-neutral-100' : 'text-neutral-800'
          )}
        >
          {prefix}
          {formatValue(displayValue)}
          {suffix}
        </div>

        {/* Label */}
        <div
          className={cn(
            'text-sm mt-0.5',
            isDark ? 'text-neutral-400' : 'text-neutral-500'
          )}
        >
          {label}
        </div>
      </div>

      {/* Trend / Description */}
      {(change !== undefined || description) && (
        <div className="mt-3 flex items-center gap-2">
          {change !== undefined && (
            <span
              className={cn(
                'inline-flex items-center gap-1 text-xs font-medium',
                trendClasses[changeType]
              )}
            >
              <TrendIcon className="w-3.5 h-3.5" />
              {Math.abs(change)}%
            </span>
          )}
          {description && (
            <span
              className={cn(
                'text-xs',
                isDark ? 'text-neutral-500' : 'text-neutral-400'
              )}
            >
              {description}
            </span>
          )}
        </div>
      )}
    </div>
  )
}

/**
 * MetricCard.Grid - Grid container for metric cards
 */
MetricCard.Grid = function MetricCardGrid({
  children,
  columns = 4,
  className = '',
}) {
  const colClasses = {
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
    5: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-5',
    6: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6',
  }

  return (
    <div className={cn('grid gap-4', colClasses[columns] || colClasses[4], className)}>
      {React.Children.map(children, (child, index) =>
        React.cloneElement(child, {
          style: { animationDelay: `${index * 50}ms` },
          className: cn(child.props.className, 'animate-fade-in-up'),
        })
      )}
    </div>
  )
}

/**
 * MetricCard.Compact - Smaller variant for inline metrics
 */
MetricCard.Compact = function MetricCardCompact({
  label,
  value,
  prefix = '',
  suffix = '',
  icon: Icon,
  accentColor = 'terra',
  className = '',
}) {
  const { isDark } = useTheme()

  const accentClasses = {
    terra: isDark ? 'bg-terra-900/50 text-terra-400' : 'bg-terra-50 text-terra-500',
    gold: isDark ? 'bg-gold-900/50 text-gold-400' : 'bg-gold-50 text-gold-600',
    sage: isDark ? 'bg-sage-900/50 text-sage-400' : 'bg-sage-50 text-sage-500',
    ocean: isDark ? 'bg-ocean-900/50 text-ocean-400' : 'bg-ocean-50 text-ocean-500',
    rose: isDark ? 'bg-rose-900/50 text-rose-400' : 'bg-rose-50 text-rose-500',
    neutral: isDark ? 'bg-neutral-800 text-neutral-400' : 'bg-neutral-100 text-neutral-500',
  }

  return (
    <div
      className={cn(
        'inline-flex items-center gap-3 px-4 py-2.5 rounded-xl',
        isDark
          ? 'bg-neutral-900/50 border border-neutral-800'
          : 'bg-white border border-neutral-200/60 shadow-boutique-xs',
        className
      )}
    >
      {Icon && (
        <div
          className={cn(
            'w-8 h-8 rounded-lg flex items-center justify-center',
            accentClasses[accentColor]
          )}
        >
          <Icon className="w-4 h-4" />
        </div>
      )}
      <div>
        <div
          className={cn(
            'text-xs',
            isDark ? 'text-neutral-400' : 'text-neutral-500'
          )}
        >
          {label}
        </div>
        <div
          className={cn(
            'text-sm font-semibold',
            isDark ? 'text-neutral-100' : 'text-neutral-800'
          )}
        >
          {prefix}{value}{suffix}
        </div>
      </div>
    </div>
  )
}
