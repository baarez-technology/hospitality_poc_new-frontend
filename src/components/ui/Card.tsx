import * as React from 'react'
import { useTheme } from '../../contexts/ThemeContext'
import { cn } from '@/lib/utils'
import { ChevronRight } from 'lucide-react'

/**
 * Card Variants - Glimmora Design System v2 (Clean & Minimal)
 */
const cardVariants = {
  default: 'bg-white border border-neutral-200',
  bordered: 'bg-white border border-neutral-200',
  subtle: 'bg-neutral-50 border border-neutral-100',
}

const Card = React.forwardRef(({
  children,
  title,
  subtitle,
  header,
  footer,
  padding = 'default',
  variant = 'default',
  hover = false,
  className = '',
  headerClassName = '',
  bodyClassName = '',
  footerClassName = '',
  onClick,
  ...props
}, ref) => {
  const { isDark } = useTheme()

  // Padding classes
  const paddingClasses = {
    none: '',
    compact: 'px-4 py-4',
    default: 'px-6 py-6',
    large: 'px-8 py-8',
  }

  const hasHeader = title || subtitle || header

  return (
    <div
      ref={ref}
      className={cn(
        'rounded-xl transition-colors duration-200',
        isDark
          ? 'bg-neutral-900 border border-neutral-800'
          : cardVariants[variant] || cardVariants.default,
        hover && 'hover:bg-neutral-50',
        onClick && 'cursor-pointer',
        className
      )}
      onClick={onClick}
      {...props}
    >
      {/* Card Header */}
      {hasHeader && (
        <div
          className={cn(
            paddingClasses[padding],
            'border-b',
            isDark ? 'border-white/[0.08]' : 'border-neutral-100',
            headerClassName
          )}
        >
          {header ? (
            header
          ) : (
            <>
              {title && (
                <h3 className={cn(
                  'text-lg font-semibold',
                  isDark ? 'text-white' : 'text-neutral-900'
                )}>
                  {title}
                </h3>
              )}
              {subtitle && (
                <p className={cn(
                  'text-sm mt-1',
                  isDark ? 'text-white/60' : 'text-neutral-600'
                )}>
                  {subtitle}
                </p>
              )}
            </>
          )}
        </div>
      )}

      {/* Card Body */}
      <div className={cn(paddingClasses[padding], bodyClassName)}>
        {children}
      </div>

      {/* Card Footer */}
      {footer && (
        <div
          className={cn(
            paddingClasses[padding],
            'border-t',
            isDark ? 'border-white/[0.08]' : 'border-neutral-100',
            footerClassName
          )}
        >
          {footer}
        </div>
      )}
    </div>
  )
})

Card.displayName = 'Card'

/**
 * KPI Card - Specialized card for displaying key performance indicators
 */
export const KPICard = React.forwardRef(({
  label,
  value,
  change,
  changeType = 'neutral',
  icon,
  trend,
  className = '',
  ...props
}, ref) => {
  const { isDark } = useTheme()

  const changeColors = {
    positive: isDark ? 'text-sage-400' : 'text-sage-600',
    negative: isDark ? 'text-rose-400' : 'text-rose-600',
    neutral: isDark ? 'text-neutral-400' : 'text-neutral-600',
  }

  return (
    <Card ref={ref} padding="default" className={className} {...props}>
      <div className="flex items-start gap-4">
        {/* Icon */}
        {icon && (
          <div className={cn(
            'w-12 h-12 flex-shrink-0 rounded-xl flex items-center justify-center',
            isDark ? 'bg-terra-500/20' : 'bg-terra-100'
          )}>
            <div className={isDark ? 'text-terra-400' : 'text-terra-600'}>{icon}</div>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className={cn(
            'text-xs font-medium uppercase tracking-wider mb-2',
            isDark ? 'text-white/50' : 'text-neutral-500'
          )}>
            {label}
          </p>
          <p className={cn(
            'text-2xl font-bold mb-1',
            isDark ? 'text-white' : 'text-neutral-900'
          )}>
            {value}
          </p>
          {change && (
            <div className={cn('text-xs font-medium', changeColors[changeType])}>
              {change}
            </div>
          )}
        </div>

        {/* Trend (optional mini chart or indicator) */}
        {trend && <div className="flex-shrink-0">{trend}</div>}
      </div>
    </Card>
  )
})

KPICard.displayName = 'KPICard'

/**
 * Stat Card - Simple card for displaying statistics
 */
export const StatCard = React.forwardRef(({
  title,
  value,
  description,
  icon,
  className = '',
  ...props
}, ref) => {
  const { isDark } = useTheme()

  return (
    <Card ref={ref} padding="default" className={className} {...props}>
      <div className="flex items-center justify-between">
        <div>
          <p className={cn(
            'text-sm mb-1',
            isDark ? 'text-white/60' : 'text-neutral-600'
          )}>
            {title}
          </p>
          <p className={cn(
            'text-2xl font-semibold mb-1',
            isDark ? 'text-white' : 'text-neutral-900'
          )}>
            {value}
          </p>
          {description && (
            <p className={cn(
              'text-xs',
              isDark ? 'text-white/50' : 'text-neutral-500'
            )}>
              {description}
            </p>
          )}
        </div>
        {icon && (
          <div className={cn(
            'w-12 h-12 rounded-xl flex items-center justify-center',
            isDark ? 'bg-white/[0.08]' : 'bg-neutral-100'
          )}>
            <div className={isDark ? 'text-white/60' : 'text-neutral-600'}>{icon}</div>
          </div>
        )}
      </div>
    </Card>
  )
})

StatCard.displayName = 'StatCard'

/**
 * Simple Card - Clean minimal card for Glimmora Design System v2
 */
export const SimpleCard = React.forwardRef(({
  children,
  className = '',
  ...props
}, ref) => {
  const { isDark } = useTheme()

  return (
    <div
      ref={ref}
      className={cn(
        'rounded-xl p-5',
        isDark ? 'bg-neutral-900 border border-neutral-800' : 'bg-white border border-neutral-200',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
})

SimpleCard.displayName = 'SimpleCard'

/**
 * Action Card - Primary action cards with gradient backgrounds
 */
export const ActionCard = React.forwardRef(({
  title,
  subtitle,
  icon,
  variant = 'primary',
  onClick,
  className = '',
  ...props
}, ref) => {
  const variants = {
    primary: 'bg-gradient-to-r from-terra-500 to-terra-600 text-white',
    success: 'bg-gradient-to-r from-sage-500 to-sage-600 text-white',
    info: 'bg-gradient-to-r from-ocean-500 to-ocean-600 text-white',
    warning: 'bg-gradient-to-r from-gold-500 to-gold-600 text-white',
  }

  return (
    <div
      ref={ref}
      className={cn(
        'rounded-xl p-5 cursor-pointer transition-colors duration-200',
        variants[variant],
        className
      )}
      onClick={onClick}
      {...props}
    >
      <div className="flex items-center justify-between mb-4">
        {icon && (
          <div className="w-11 h-11 bg-white/20 rounded-lg flex items-center justify-center">
            {icon}
          </div>
        )}
        <ChevronRight className="w-5 h-5 opacity-60" />
      </div>
      {title && <h4 className="font-semibold text-lg mb-1">{title}</h4>}
      {subtitle && <p className="text-sm opacity-80">{subtitle}</p>}
    </div>
  )
})

ActionCard.displayName = 'ActionCard'

/**
 * Metric Card - Display metrics with optional trend and sparkline
 */
export const MetricCard = React.forwardRef(({
  label,
  value,
  change,
  changeType = 'positive',
  icon,
  sparkline,
  className = '',
  ...props
}, ref) => {
  const { isDark } = useTheme()

  const changeColors = {
    positive: isDark ? 'text-sage-400' : 'text-sage-600',
    negative: isDark ? 'text-rose-400' : 'text-rose-600',
    neutral: isDark ? 'text-neutral-400' : 'text-neutral-500',
  }

  return (
    <div
      ref={ref}
      className={cn(
        'rounded-xl p-5',
        isDark ? 'bg-neutral-900 border border-neutral-800' : 'bg-white border border-neutral-200',
        className
      )}
      {...props}
    >
      <div className="flex items-center gap-2 mb-3">
        {icon && (
          <div className={cn(
            'w-8 h-8 rounded-lg flex items-center justify-center',
            isDark ? 'bg-terra-500/20' : 'bg-terra-100'
          )}>
            <div className={isDark ? 'text-terra-400' : 'text-terra-600'}>{icon}</div>
          </div>
        )}
        <span className={cn(
          'text-xs font-semibold uppercase tracking-wide',
          isDark ? 'text-neutral-400' : 'text-neutral-500'
        )}>
          {label}
        </span>
      </div>
      <div className={cn(
        'text-3xl font-bold mb-1',
        isDark ? 'text-white' : 'text-neutral-900'
      )}>
        {value}
      </div>
      {change && (
        <div className="flex items-center gap-2">
          <span className={cn('text-xs font-semibold', changeColors[changeType])}>
            {changeType === 'positive' ? '↑' : changeType === 'negative' ? '↓' : ''} {change}
          </span>
          <span className={cn('text-xs', isDark ? 'text-neutral-500' : 'text-neutral-400')}>vs last month</span>
        </div>
      )}
      {sparkline && (
        <div className="h-8 flex items-end gap-0.5 mt-3">
          {sparkline}
        </div>
      )}
    </div>
  )
})

MetricCard.displayName = 'MetricCard'

export default Card
