import React from 'react';
import { cn } from '../../lib/utils';

const SIZE = {
  sm: 'h-9 w-9 rounded-lg',
  md: 'h-10 w-10 rounded-xl',
  lg: 'h-11 w-11 rounded-xl',
};

export const IconButton = React.forwardRef(function IconButton(
  { className, size = 'md', variant = 'ghost', 'aria-label': ariaLabel, ...props },
  ref
) {
  return (
    <button
      ref={ref}
      aria-label={ariaLabel}
      className={cn(
        'inline-flex items-center justify-center',
        'transition-colors duration-200',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/25 focus-visible:ring-offset-2 focus-visible:ring-offset-background',
        'disabled:opacity-60 disabled:pointer-events-none',
        'active:translate-y-[0.5px]',
        SIZE[size] ?? SIZE.md,
        variant === 'outline'
          ? 'border border-neutral-300/70 bg-transparent hover:bg-neutral-50'
          : variant === 'subtle'
            ? 'border border-neutral-200/70 bg-neutral-100/70 hover:bg-neutral-100'
            : 'border border-transparent bg-transparent hover:bg-neutral-100/70',
        className
      )}
      {...props}
    />
  );
});







