import React, { useState, useRef, useEffect } from 'react'
import { Info } from 'lucide-react'
import { cn } from '@/lib/utils'

const Tooltip = React.forwardRef(({
  children,
  content,
  side = 'top',
  delayMs = 200,
  className = '',
  contentClassName = '',
}, ref) => {
  const [isVisible, setIsVisible] = useState(false)
  const [position, setPosition] = useState({ top: 0, left: 0 })
  const triggerRef = useRef(null)
  const tooltipRef = useRef(null)
  const timeoutRef = useRef(null)

  const handleMouseEnter = () => {
    timeoutRef.current = setTimeout(() => {
      if (triggerRef.current && tooltipRef.current) {
        const triggerRect = triggerRef.current.getBoundingClientRect()
        const tooltipRect = tooltipRef.current.getBoundingClientRect()

        let top = 0
        let left = 0

        switch (side) {
          case 'top':
            top = triggerRect.top - tooltipRect.height - 8
            left = triggerRect.left + (triggerRect.width - tooltipRect.width) / 2
            break
          case 'bottom':
            top = triggerRect.bottom + 8
            left = triggerRect.left + (triggerRect.width - tooltipRect.width) / 2
            break
          case 'left':
            top = triggerRect.top + (triggerRect.height - tooltipRect.height) / 2
            left = triggerRect.left - tooltipRect.width - 8
            break
          case 'right':
            top = triggerRect.top + (triggerRect.height - tooltipRect.height) / 2
            left = triggerRect.right + 8
            break
          default:
            break
        }

        setPosition({ top, left })
      }
      setIsVisible(true)
    }, delayMs)
  }

  const handleMouseLeave = () => {
    clearTimeout(timeoutRef.current)
    setIsVisible(false)
  }

  useEffect(() => {
    return () => clearTimeout(timeoutRef.current)
  }, [])

  return (
    <div ref={ref} className={cn('relative inline-block', className)}>
      <div
        ref={triggerRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {children}
      </div>

      {isVisible && (
        <div
          ref={tooltipRef}
          className={cn(
            'fixed z-50 px-3 py-2 bg-neutral-900 text-white text-xs rounded-lg shadow-lg whitespace-nowrap pointer-events-none',
            contentClassName
          )}
          style={{
            top: `${position.top}px`,
            left: `${position.left}px`,
          }}
        >
          {content}
        </div>
      )}
    </div>
  )
})

Tooltip.displayName = 'Tooltip'

/**
 * InfoTooltip - A tooltip with an info icon
 */
export const InfoTooltip = React.forwardRef(({
  content,
  side = 'top',
  className = '',
  iconClassName = '',
}, ref) => (
  <Tooltip ref={ref} content={content} side={side} className={className}>
    <Info className={cn('w-4 h-4 text-neutral-400 cursor-help', iconClassName)} />
  </Tooltip>
))

InfoTooltip.displayName = 'InfoTooltip'

export default Tooltip
