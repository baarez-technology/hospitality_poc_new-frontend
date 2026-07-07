import React from 'react'
import { useTheme } from '../../contexts/ThemeContext'
import { cn } from '@/lib/utils'

/**
 * PageShell
 * Shared outer layout for CMS/Admin pages.
 * Keeps spacing + max-width consistent page-to-page.
 */
export default function PageShell({ children, className = '' }) {
  const { isDark } = useTheme()

  return (
    <div
      className={cn(
        'min-h-screen transition-colors duration-500 relative',
        isDark ? 'bg-[#0a0a0a]' : 'bg-gradient-to-br from-neutral-50 via-[#F8F6F4] to-neutral-100',
        className
      )}
    >
      <div className="max-w-[1600px] mx-auto px-6 lg:px-10 py-8 space-y-6">
        {children}
      </div>
    </div>
  )
}


