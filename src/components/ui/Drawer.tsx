import React, { useEffect } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

const Drawer = React.forwardRef(({
  isOpen,
  onClose,
  title,
  description,
  children,
  side = 'right',
  width = 'max-w-2xl',
  className = '',
}, ref) => {
  // Prevent body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  // Handle escape key
  useEffect(() => {
    if (!isOpen) return

    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose])

  if (!isOpen) return null

  const sideClasses = {
    left: 'left-0 slide-in-from-left',
    right: 'right-0 slide-in-from-right',
    top: 'top-0 slide-in-from-top',
    bottom: 'bottom-0 slide-in-from-bottom',
  }

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        ref={ref}
        className={cn(
          'fixed inset-y-0 z-50 w-full bg-white border-l border-neutral-200 overflow-y-auto',
          side === 'right' || side === 'left' ? `inset-y-0 ${side === 'right' ? 'right-0' : 'left-0'} max-w-${width} h-screen` : '',
          side === 'top' || side === 'bottom' ? `inset-x-0 ${side === 'top' ? 'top-0' : 'bottom-0'}` : '',
          className
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        {(title || description) && (
          <div className="sticky top-0 bg-white border-b border-neutral-200 px-6 py-4 flex items-center justify-between z-10">
            <div className="flex-1">
              {title && (
                <h2 className="text-xl font-semibold text-neutral-900">
                  {title}
                </h2>
              )}
              {description && (
                <p className="text-sm text-neutral-500 mt-1">
                  {description}
                </p>
              )}
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-neutral-100 rounded-lg transition-colors flex-shrink-0"
              aria-label="Close drawer"
            >
              <X className="w-5 h-5 text-neutral-500" />
            </button>
          </div>
        )}

        {/* Content */}
        <div className="flex-1">
          {children}
        </div>
      </div>
    </div>
  )
})

Drawer.displayName = 'Drawer'

export default Drawer
