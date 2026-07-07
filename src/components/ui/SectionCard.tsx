import React from 'react'
import { cn } from '@/lib/utils'
import { useTheme } from '../../contexts/ThemeContext'
import { ChevronRight } from 'lucide-react'

/**
 * SectionCard - Warm Boutique Design System
 * Premium section container with header, body, and optional footer.
 * Used for grouping related content within pages.
 *
 * @param {object} props
 * @param {string} props.title - Section title
 * @param {string} props.subtitle - Optional subtitle
 * @param {React.ReactNode} props.action - Action element (button, link, etc.)
 * @param {string} props.actionLabel - Text for built-in action link
 * @param {function} props.onAction - Handler for built-in action
 * @param {React.ReactNode} props.children - Section content
 * @param {React.ReactNode} props.footer - Optional footer content
 * @param {'default'|'compact'|'flush'} props.padding - Body padding variant
 * @param {string} props.className - Additional classes
 * @param {boolean} props.collapsible - Enable collapse functionality
 * @param {boolean} props.defaultCollapsed - Initial collapsed state
 */
export default function SectionCard({
  title,
  subtitle,
  action,
  actionLabel,
  onAction,
  children,
  footer,
  padding = 'default',
  className = '',
  headerClassName = '',
  bodyClassName = '',
  footerClassName = '',
  noBorder = false,
  icon: Icon,
  accentColor = 'terra',
}) {
  const { isDark } = useTheme()

  // Accent color classes for icon
  const accentClasses = {
    terra: isDark ? 'text-terra-400' : 'text-terra-500',
    gold: isDark ? 'text-gold-400' : 'text-gold-600',
    sage: isDark ? 'text-sage-400' : 'text-sage-500',
    ocean: isDark ? 'text-ocean-400' : 'text-ocean-500',
    rose: isDark ? 'text-rose-400' : 'text-rose-500',
  }

  // Body padding variants
  const paddingClasses = {
    default: 'p-6',
    compact: 'p-4',
    flush: 'p-0',
  }

  // Render action
  const renderAction = () => {
    if (action) return action

    if (actionLabel && onAction) {
      return (
        <button
          onClick={onAction}
          className={cn(
            'inline-flex items-center gap-1 text-sm font-medium transition-colors',
            isDark
              ? 'text-terra-400 hover:text-terra-300'
              : 'text-terra-500 hover:text-terra-600'
          )}
        >
          {actionLabel}
          <ChevronRight className="w-4 h-4" />
        </button>
      )
    }

    return null
  }

  const hasHeader = title || subtitle || action || actionLabel

  return (
    <div
      className={cn(
        'boutique-section',
        noBorder && 'border-0 shadow-none',
        className
      )}
    >
      {/* Header */}
      {hasHeader && (
        <div
          className={cn(
            'boutique-section-header',
            headerClassName
          )}
        >
          <div className="flex items-center gap-3 min-w-0">
            {Icon && (
              <Icon className={cn('w-5 h-5 flex-shrink-0', accentClasses[accentColor])} />
            )}
            <div className="min-w-0">
              {title && (
                <h3
                  className={cn(
                    'text-base font-semibold truncate',
                    isDark ? 'text-neutral-100' : 'text-neutral-800'
                  )}
                >
                  {title}
                </h3>
              )}
              {subtitle && (
                <p
                  className={cn(
                    'text-sm mt-0.5 truncate',
                    isDark ? 'text-neutral-400' : 'text-neutral-500'
                  )}
                >
                  {subtitle}
                </p>
              )}
            </div>
          </div>

          {renderAction()}
        </div>
      )}

      {/* Body */}
      <div className={cn(paddingClasses[padding], bodyClassName)}>
        {children}
      </div>

      {/* Footer */}
      {footer && (
        <div
          className={cn(
            'px-6 py-4 border-t',
            isDark
              ? 'border-neutral-800 bg-neutral-900/50'
              : 'border-neutral-100 bg-neutral-50/50',
            footerClassName
          )}
        >
          {footer}
        </div>
      )}
    </div>
  )
}

/**
 * SectionCard.Header - Standalone header for custom layouts
 */
SectionCard.Header = function SectionCardHeader({
  children,
  title,
  subtitle,
  action,
  className = '',
}) {
  const { isDark } = useTheme()

  return (
    <div
      className={cn(
        'px-6 py-4 border-b flex items-center justify-between',
        isDark ? 'border-neutral-800' : 'border-neutral-100',
        className
      )}
    >
      {children || (
        <>
          <div>
            {title && (
              <h3
                className={cn(
                  'text-base font-semibold',
                  isDark ? 'text-neutral-100' : 'text-neutral-800'
                )}
              >
                {title}
              </h3>
            )}
            {subtitle && (
              <p
                className={cn(
                  'text-sm mt-0.5',
                  isDark ? 'text-neutral-400' : 'text-neutral-500'
                )}
              >
                {subtitle}
              </p>
            )}
          </div>
          {action}
        </>
      )}
    </div>
  )
}

/**
 * SectionCard.Body - Standalone body container
 */
SectionCard.Body = function SectionCardBody({
  children,
  padding = 'default',
  className = '',
}) {
  const paddingClasses = {
    default: 'p-6',
    compact: 'p-4',
    flush: 'p-0',
  }

  return (
    <div className={cn(paddingClasses[padding], className)}>
      {children}
    </div>
  )
}

/**
 * SectionCard.Footer - Standalone footer container
 */
SectionCard.Footer = function SectionCardFooter({
  children,
  className = '',
}) {
  const { isDark } = useTheme()

  return (
    <div
      className={cn(
        'px-6 py-4 border-t',
        isDark
          ? 'border-neutral-800 bg-neutral-900/50'
          : 'border-neutral-100 bg-neutral-50/50',
        className
      )}
    >
      {children}
    </div>
  )
}

/**
 * SectionCard.Empty - Empty state placeholder
 */
SectionCard.Empty = function SectionCardEmpty({
  icon: Icon,
  title,
  description,
  action,
  className = '',
}) {
  const { isDark } = useTheme()

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center py-12 px-6 text-center',
        className
      )}
    >
      {Icon && (
        <div
          className={cn(
            'w-12 h-12 rounded-xl flex items-center justify-center mb-4',
            isDark ? 'bg-neutral-800 text-neutral-500' : 'bg-neutral-100 text-neutral-400'
          )}
        >
          <Icon className="w-6 h-6" />
        </div>
      )}
      {title && (
        <h4
          className={cn(
            'text-sm font-medium',
            isDark ? 'text-neutral-300' : 'text-neutral-600'
          )}
        >
          {title}
        </h4>
      )}
      {description && (
        <p
          className={cn(
            'text-sm mt-1 max-w-sm',
            isDark ? 'text-neutral-500' : 'text-neutral-400'
          )}
        >
          {description}
        </p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}

/**
 * SectionCard.Grid - Grid layout for section cards
 */
SectionCard.Grid = function SectionCardGrid({
  children,
  columns = 2,
  className = '',
}) {
  const colClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 lg:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
  }

  return (
    <div className={cn('grid gap-6', colClasses[columns] || colClasses[2], className)}>
      {children}
    </div>
  )
}
