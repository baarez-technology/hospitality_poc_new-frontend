import React from 'react';
import { cn } from '../../lib/utils';

export function Divider({ className, ...props }) {
  return <div className={cn('h-px w-full bg-gradient-to-r from-transparent via-neutral-200 to-transparent', className)} {...props} />;
}







