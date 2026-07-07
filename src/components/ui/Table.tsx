import React from 'react'
import { useTheme } from '../../contexts/ThemeContext'
import { cn } from '@/lib/utils'

/**
 * Table Component - Glimmora Design System v2
 * Clean, modern table with neutral header styling
 */
export const Table = React.forwardRef(({ children, className = '' }, ref) => {
  const { isDark } = useTheme()

  return (
    <div className="overflow-x-auto">
      <table
        ref={ref}
        className={cn(
          'w-full text-sm',
          isDark ? 'text-white/90' : 'text-gray-900',
          className
        )}
      >
        {children}
      </table>
    </div>
  )
})

Table.displayName = 'Table'

export const TableHeader = React.forwardRef(({ children, className = '' }, ref) => {
  const { isDark } = useTheme()

  return (
    <thead
      ref={ref}
      className={cn(
        'border-b',
        isDark ? 'bg-white/[0.03] border-white/[0.06]' : 'bg-gray-50/50 border-gray-200/30',
        className
      )}
    >
      {children}
    </thead>
  )
})

TableHeader.displayName = 'TableHeader'

export const TableBody = React.forwardRef(({ children, className = '' }, ref) => (
  <tbody ref={ref} className={className}>
    {children}
  </tbody>
))

TableBody.displayName = 'TableBody'

export const TableRow = React.forwardRef(({ children, className = '', ...props }, ref) => {
  const { isDark } = useTheme()

  return (
    <tr
      ref={ref}
      className={cn(
        'border-b transition-colors group',
        isDark ? 'border-white/[0.06] hover:bg-white/[0.02]' : 'border-gray-200/20 hover:bg-white/50',
        className
      )}
      {...props}
    >
      {children}
    </tr>
  )
})

TableRow.displayName = 'TableRow'

export const TableHead = React.forwardRef(({ children, className = '', ...props }, ref) => {
  const { isDark } = useTheme()

  return (
    <th
      ref={ref}
      className={cn(
        'px-5 py-4 text-left text-[11px] font-semibold uppercase tracking-wider whitespace-nowrap',
        isDark ? 'text-white/50' : 'text-gray-500',
        className
      )}
      {...props}
    >
      {children}
    </th>
  )
})

TableHead.displayName = 'TableHead'

export const TableCell = React.forwardRef(({ children, className = '', ...props }, ref) => (
  <td
    ref={ref}
    className={cn(
      'px-5 py-4 whitespace-nowrap',
      className
    )}
    {...props}
  >
    {children}
  </td>
))

TableCell.displayName = 'TableCell'

export const TableCaption = React.forwardRef(({ children, className = '' }, ref) => {
  const { isDark } = useTheme()

  return (
    <caption
      ref={ref}
      className={cn(
        'text-sm mt-4',
        isDark ? 'text-white/60' : 'text-gray-500',
        className
      )}
    >
      {children}
    </caption>
  )
})

TableCaption.displayName = 'TableCaption'

export const TableFooter = React.forwardRef(({ children, className = '' }, ref) => {
  const { isDark } = useTheme()

  return (
    <tfoot
      ref={ref}
      className={cn(
        'border-t font-semibold',
        isDark ? 'border-white/[0.08] bg-white/[0.02]' : 'border-gray-200/50 bg-gray-50/50',
        className
      )}
    >
      {children}
    </tfoot>
  )
})

TableFooter.displayName = 'TableFooter'

export default Table
