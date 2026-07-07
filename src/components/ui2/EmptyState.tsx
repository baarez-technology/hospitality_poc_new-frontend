import React from 'react';
import { cn } from '../../lib/utils';
import {
  Inbox,
  Search,
  FileX,
  AlertCircle,
  FolderOpen,
  Calendar,
  Users,
  BedDouble,
  BookOpen
} from 'lucide-react';
import { Button } from './Button';

/**
 * Glimmora Design System v4.0 - Empty State
 * Placeholder states for empty data scenarios
 */

const presets = {
  noData: {
    icon: Inbox,
    title: 'No data yet',
    description: 'Get started by adding your first item.',
  },
  noResults: {
    icon: Search,
    title: 'No results found',
    description: 'Try adjusting your search or filter to find what you\'re looking for.',
  },
  error: {
    icon: AlertCircle,
    title: 'Something went wrong',
    description: 'We couldn\'t load this content. Please try again.',
  },
  noBookings: {
    icon: BookOpen,
    title: 'No bookings',
    description: 'There are no bookings matching your criteria.',
  },
  noGuests: {
    icon: Users,
    title: 'No guests',
    description: 'Guest records will appear here once added.',
  },
  noRooms: {
    icon: BedDouble,
    title: 'No rooms',
    description: 'Add rooms to start managing your property.',
  },
  noEvents: {
    icon: Calendar,
    title: 'No events',
    description: 'There are no events scheduled for this period.',
  },
  empty: {
    icon: FolderOpen,
    title: 'Nothing here',
    description: 'This section is empty.',
  },
};

export function EmptyState({
  preset,
  icon: CustomIcon,
  title,
  description,
  action,
  actionLabel,
  onAction,
  secondaryAction,
  secondaryActionLabel,
  onSecondaryAction,
  size = 'md', // sm, md, lg
  className,
}) {
  const presetConfig = preset ? presets[preset] : null;
  const Icon = CustomIcon || presetConfig?.icon || Inbox;
  const displayTitle = title || presetConfig?.title || 'No data';
  const displayDescription = description || presetConfig?.description;

  const sizes = {
    sm: {
      wrapper: 'py-8',
      iconWrapper: 'w-10 h-10',
      icon: 'w-5 h-5',
      title: 'text-sm',
      description: 'text-xs',
    },
    md: {
      wrapper: 'py-12',
      iconWrapper: 'w-14 h-14',
      icon: 'w-7 h-7',
      title: 'text-base',
      description: 'text-sm',
    },
    lg: {
      wrapper: 'py-16',
      iconWrapper: 'w-16 h-16',
      icon: 'w-8 h-8',
      title: 'text-lg',
      description: 'text-sm',
    },
  };

  const s = sizes[size];

  return (
    <div className={cn('flex flex-col items-center justify-center text-center', s.wrapper, className)}>
      {/* Icon */}
      <div className={cn(
        'rounded-full bg-neutral-100 flex items-center justify-center mb-4',
        s.iconWrapper
      )}>
        <Icon className={cn('text-neutral-400', s.icon)} />
      </div>

      {/* Title */}
      <h3 className={cn('font-semibold text-neutral-900 mb-1', s.title)}>
        {displayTitle}
      </h3>

      {/* Description */}
      {displayDescription && (
        <p className={cn('text-neutral-500 max-w-sm mb-4', s.description)}>
          {displayDescription}
        </p>
      )}

      {/* Actions */}
      {(action || onAction) && (
        <div className="flex items-center gap-3 mt-2">
          {(action || onAction) && (
            <Button variant="primary" size="sm" onClick={onAction}>
              {actionLabel || 'Add New'}
            </Button>
          )}
          {(secondaryAction || onSecondaryAction) && (
            <Button variant="ghost" size="sm" onClick={onSecondaryAction}>
              {secondaryActionLabel || 'Learn More'}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

// Inline Empty State - Compact version for tables/lists
export function InlineEmptyState({
  icon: Icon = Inbox,
  message = 'No items',
  className,
}) {
  return (
    <div className={cn('flex items-center justify-center gap-2 py-8 text-neutral-400', className)}>
      <Icon className="w-4 h-4" />
      <span className="text-sm">{message}</span>
    </div>
  );
}

// Loading State
export function LoadingState({
  message = 'Loading...',
  size = 'md',
  className,
}) {
  const sizes = {
    sm: { spinner: 'w-6 h-6', text: 'text-xs' },
    md: { spinner: 'w-8 h-8', text: 'text-sm' },
    lg: { spinner: 'w-10 h-10', text: 'text-base' },
  };

  const s = sizes[size];

  return (
    <div className={cn('flex flex-col items-center justify-center py-12', className)}>
      <div className={cn('relative', s.spinner)}>
        <div className="absolute inset-0 rounded-full border-2 border-neutral-200" />
        <div className="absolute inset-0 rounded-full border-2 border-terra-500 border-t-transparent animate-spin" />
      </div>
      <p className={cn('text-neutral-500 mt-3', s.text)}>{message}</p>
    </div>
  );
}

// Skeleton Loader
export function Skeleton({ className, variant = 'rect' }) {
  const variants = {
    rect: 'rounded',
    circle: 'rounded-full',
    text: 'rounded h-4',
  };

  return (
    <div className={cn(
      'bg-neutral-200 animate-pulse',
      variants[variant],
      className
    )} />
  );
}

// Card Skeleton
export function CardSkeleton({ className }) {
  return (
    <div className={cn('rounded-xl border border-neutral-200 p-5 space-y-4', className)}>
      <div className="flex items-center gap-3">
        <Skeleton className="w-10 h-10 rounded-lg" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-3 w-16" />
        </div>
      </div>
      <Skeleton className="h-20" />
      <div className="flex gap-2">
        <Skeleton className="h-8 w-20" />
        <Skeleton className="h-8 w-20" />
      </div>
    </div>
  );
}

// Table Row Skeleton
export function TableRowSkeleton({ columns = 5, className }) {
  return (
    <tr className={cn('border-b border-neutral-100', className)}>
      {[...Array(columns)].map((_, i) => (
        <td key={i} className="px-4 py-3">
          <Skeleton className="h-4" style={{ width: `${Math.random() * 40 + 40}%` }} />
        </td>
      ))}
    </tr>
  );
}
