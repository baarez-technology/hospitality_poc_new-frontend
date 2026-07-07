import React from 'react'
import { cn } from '@/lib/utils'
import { useTheme } from '../../contexts/ThemeContext'
import Breadcrumb from './Breadcrumb'

/**
 * PageHeader
 * Consistent header block for CMS/Admin pages:
 * - breadcrumb
 * - icon + title + subtitle
 * - right-aligned actions
 */
export default function PageHeader({
  title,
  subtitle,
  icon: Icon,
  actions,
  breadcrumbItems,
  variant = 'card', // 'card' | 'plain'
  className = '',
  titleClassName = '',
  subtitleClassName = '',
}) {
  const { isDark } = useTheme()

  const containerClass =
    variant === 'plain'
      ? 'bg-transparent border-0 shadow-none p-0'
      : cn(
          'rounded-2xl p-6 transition-all duration-300',
          isDark ? 'bg-neutral-900/50 border border-neutral-800' : 'bg-white border border-neutral-200 shadow-sm'
        )

  return (
    <div
      className={cn(
        containerClass,
        className
      )}
    >
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <Breadcrumb items={breadcrumbItems || []} className="mb-3" />

          <div className="flex items-center gap-4 min-w-0">
            {Icon && (
              <div
                className={cn(
                  'w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0',
                  isDark ? 'bg-gradient-to-br from-primary/20 to-primary/5' : 'bg-gradient-to-br from-primary/15 to-primary/5'
                )}
              >
                <Icon className="w-7 h-7 text-primary" />
              </div>
            )}

            <div className="min-w-0">
              <h1
                className={cn(
                  'tracking-tight truncate',
                  variant === 'plain' ? 'text-4xl font-sans font-semibold' : 'text-2xl font-bold',
                  isDark ? 'text-neutral-100' : 'text-neutral-900',
                  titleClassName
                )}
              >
                {title}
              </h1>
              {subtitle && (
                <p
                  className={cn(
                    variant === 'plain' ? 'text-base mt-2' : 'text-sm mt-0.5',
                    isDark ? 'text-neutral-500' : 'text-neutral-500',
                    subtitleClassName
                  )}
                >
                  {subtitle}
                </p>
              )}
            </div>
          </div>
        </div>

        {actions && (
          <div className="flex items-center gap-3 flex-wrap justify-end">
            {actions}
          </div>
        )}
      </div>
    </div>
  )
}


