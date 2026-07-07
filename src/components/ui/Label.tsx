import React from 'react'
import { cn } from '@/lib/utils'

const Label = React.forwardRef(({
  children,
  className = '',
  required = false,
  ...props
}, ref) => (
  <label
    ref={ref}
    className={cn(
      'block text-sm font-medium text-neutral-700 mb-1',
      required && "after:content-['*'] after:ml-0.5 after:text-rose-500",
      className
    )}
    {...props}
  >
    {children}
  </label>
))

Label.displayName = 'Label'

export { Label }
export default Label
