import React from 'react'
import { cn } from '@/lib/utils'
import { CheckCircle, AlertTriangle, XCircle, Info, X } from 'lucide-react'

/**
 * Alert Component - Glimmora Design System v2
 */
const Alert = React.forwardRef(({
  children,
  title,
  variant = 'info',
  icon,
  onClose,
  className = '',
  ...props
}, ref) => {
  // Variant styles
  const variantStyles = {
    success: {
      container: 'bg-deepGreen-50 border border-deepGreen-200',
      icon: 'bg-deepGreen-500',
      title: 'text-deepGreen-700',
      content: 'text-deepGreen-600',
      close: 'text-deepGreen-500 hover:text-deepGreen-700',
      defaultIcon: <CheckCircle className="w-4 h-4" />,
    },
    warning: {
      container: 'bg-gold-50 border border-gold-200',
      icon: 'bg-gold-500',
      title: 'text-gold-700',
      content: 'text-gold-600',
      close: 'text-gold-500 hover:text-gold-700',
      defaultIcon: <AlertTriangle className="w-4 h-4" />,
    },
    error: {
      container: 'bg-red-50 border border-red-200',
      icon: 'bg-red-500',
      title: 'text-red-700',
      content: 'text-red-600',
      close: 'text-red-500 hover:text-red-700',
      defaultIcon: <XCircle className="w-4 h-4" />,
    },
    info: {
      container: 'bg-aurora-50 border border-aurora-200',
      icon: 'bg-aurora-500',
      title: 'text-aurora-700',
      content: 'text-aurora-600',
      close: 'text-aurora-500 hover:text-aurora-700',
      defaultIcon: <Info className="w-4 h-4" />,
    },
  }

  const styles = variantStyles[variant] || variantStyles.info

  return (
    <div
      ref={ref}
      className={cn(
        'flex items-start gap-3 p-4 rounded-xl',
        styles.container,
        className
      )}
      role="alert"
      {...props}
    >
      {/* Icon */}
      <div
        className={cn(
          'w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-white',
          styles.icon
        )}
      >
        {icon || styles.defaultIcon}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {title && (
          <h4 className={cn('text-sm font-semibold', styles.title)}>
            {title}
          </h4>
        )}
        {children && (
          <p className={cn('text-sm mt-0.5', styles.content)}>
            {children}
          </p>
        )}
      </div>

      {/* Close Button */}
      {onClose && (
        <button
          onClick={onClose}
          className={cn(
            'flex-shrink-0 p-1 rounded-lg transition-colors',
            styles.close
          )}
        >
          <X className="w-5 h-5" />
        </button>
      )}
    </div>
  )
})

Alert.displayName = 'Alert'

/**
 * Toast Alert - Floating notification style
 */
export const ToastAlert = React.forwardRef(({
  children,
  title,
  variant = 'info',
  icon,
  onClose,
  className = '',
  ...props
}, ref) => {
  const variantStyles = {
    success: {
      bg: 'bg-white border border-deepGreen-200 shadow-lg',
      icon: 'text-deepGreen-500',
      title: 'text-gray-900',
      content: 'text-gray-600',
      defaultIcon: <CheckCircle className="w-5 h-5" />,
    },
    warning: {
      bg: 'bg-white border border-gold-200 shadow-lg',
      icon: 'text-gold-500',
      title: 'text-gray-900',
      content: 'text-gray-600',
      defaultIcon: <AlertTriangle className="w-5 h-5" />,
    },
    error: {
      bg: 'bg-white border border-red-200 shadow-lg',
      icon: 'text-red-500',
      title: 'text-gray-900',
      content: 'text-gray-600',
      defaultIcon: <XCircle className="w-5 h-5" />,
    },
    info: {
      bg: 'bg-white border border-aurora-200 shadow-lg',
      icon: 'text-aurora-500',
      title: 'text-gray-900',
      content: 'text-gray-600',
      defaultIcon: <Info className="w-5 h-5" />,
    },
  }

  const styles = variantStyles[variant] || variantStyles.info

  return (
    <div
      ref={ref}
      className={cn(
        'flex items-start gap-3 p-4 rounded-xl min-w-[300px] max-w-md',
        styles.bg,
        className
      )}
      role="alert"
      {...props}
    >
      {/* Icon */}
      <div className={cn('flex-shrink-0', styles.icon)}>
        {icon || styles.defaultIcon}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {title && (
          <h4 className={cn('text-sm font-semibold', styles.title)}>
            {title}
          </h4>
        )}
        {children && (
          <p className={cn('text-sm mt-0.5', styles.content)}>
            {children}
          </p>
        )}
      </div>

      {/* Close Button */}
      {onClose && (
        <button
          onClick={onClose}
          className="flex-shrink-0 p-1 text-gray-400 hover:text-gray-600 rounded-lg transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  )
})

ToastAlert.displayName = 'ToastAlert'

export default Alert
