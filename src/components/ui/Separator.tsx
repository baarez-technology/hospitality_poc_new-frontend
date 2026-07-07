import React from 'react'
import { cn } from '@/lib/utils'

const Separator = React.forwardRef(({
  orientation = 'horizontal',
  className = '',
  decorative = true,
  ...props
}, ref) => {
  const isHorizontal = orientation === 'horizontal'

  return (
    <div
      ref={ref}
      role={decorative ? 'none' : 'separator'}
      className={cn(
        isHorizontal
          ? 'h-px w-full bg-neutral-200'
          : 'h-full w-px bg-neutral-200',
        className
      )}
      {...props}
    />
  )
})

Separator.displayName = 'Separator'

export default Separator
