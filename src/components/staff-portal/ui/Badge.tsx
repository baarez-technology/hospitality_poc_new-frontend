import { ReactNode } from 'react';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'green' | 'teal' | 'gold' | 'beige' | 'outline' | 'ghost';
  size?: 'sm' | 'default' | 'lg';
  dot?: boolean;
  children: ReactNode;
  className?: string;
}

export function Badge({
  children,
  variant = 'default',
  size = 'default',
  className = '',
  dot = false,
  ...props
}: BadgeProps) {
  const variantStyles = {
    default: 'bg-neutral-100 text-neutral-900',
    primary: 'bg-primary-500/10 text-primary-600',
    success: 'bg-green-50 text-green-600',
    warning: 'bg-amber-50 text-amber-600',
    danger: 'bg-red-50 text-red-600',
    info: 'bg-blue-50 text-blue-600',
    green: 'bg-deepGreen/10 text-deepGreen',
    teal: 'bg-teal/10 text-teal',
    gold: 'bg-gold/10 text-gold',
    beige: 'bg-beige/20 text-neutral-900',
    outline: 'bg-transparent border border-neutral-300 text-neutral-900',
    ghost: 'bg-transparent text-neutral-600'
  };

  const sizeStyles = {
    sm: 'text-xs px-2 py-0.5',
    default: 'text-xs px-2.5 py-1',
    lg: 'text-sm px-3 py-1.5'
  };

  return (
    <span
      className={`
        inline-flex items-center gap-1.5 font-medium rounded-full
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${className}
      `}
      {...props}
    >
      {dot && (
        <span className={`w-1.5 h-1.5 rounded-full ${
          variant === 'success' ? 'bg-green-600' :
          variant === 'warning' ? 'bg-amber-600' :
          variant === 'danger' ? 'bg-red-600' :
          variant === 'info' ? 'bg-blue-600' :
          variant === 'primary' ? 'bg-primary-600' :
          variant === 'green' ? 'bg-deepGreen' :
          variant === 'teal' ? 'bg-teal' :
          variant === 'gold' ? 'bg-gold' :
          'bg-neutral-500'
        }`} />
      )}
      {children}
    </span>
  );
}

export function StatusBadge({ status, className = '' }: { status: string; className?: string }) {
  const statusConfig: Record<string, { label: string; variant: BadgeProps['variant'] }> = {
    dirty: { label: 'Dirty', variant: 'danger' },
    in_progress: { label: 'In Progress', variant: 'warning' },
    clean: { label: 'Clean', variant: 'success' },
    inspected: { label: 'Inspected', variant: 'teal' },
    todo: { label: 'To Do', variant: 'default' },
    completed: { label: 'Completed', variant: 'success' },
    pending: { label: 'Pending', variant: 'warning' },
    in_transit: { label: 'In Transit', variant: 'info' },
    delivered: { label: 'Delivered', variant: 'success' },
    urgent: { label: 'Urgent', variant: 'danger' },
    high: { label: 'High', variant: 'warning' },
    normal: { label: 'Normal', variant: 'default' },
    low: { label: 'Low', variant: 'info' }
  };

  const config = statusConfig[status] || { label: status, variant: 'default' as BadgeProps['variant'] };

  return (
    <Badge variant={config.variant} dot className={className}>
      {config.label}
    </Badge>
  );
}

export function PriorityBadge({ priority, className = '' }: { priority: string; className?: string }) {
  const priorityConfig: Record<string, { label: string; variant: BadgeProps['variant'] }> = {
    urgent: { label: 'Urgent', variant: 'danger' },
    high: { label: 'High', variant: 'warning' },
    normal: { label: 'Normal', variant: 'default' },
    low: { label: 'Low', variant: 'info' },
    critical: { label: 'Critical', variant: 'danger' },
    medium: { label: 'Medium', variant: 'gold' }
  };

  const config = priorityConfig[priority] || { label: priority, variant: 'default' as BadgeProps['variant'] };

  return (
    <Badge variant={config.variant} className={className}>
      {config.label}
    </Badge>
  );
}

export function SeverityBadge({ severity, className = '' }: { severity: string; className?: string }) {
  const severityConfig: Record<string, { label: string; variant: BadgeProps['variant'] }> = {
    critical: { label: 'Critical', variant: 'danger' },
    high: { label: 'High', variant: 'warning' },
    medium: { label: 'Medium', variant: 'gold' },
    low: { label: 'Low', variant: 'info' }
  };

  const config = severityConfig[severity] || { label: severity, variant: 'default' as BadgeProps['variant'] };

  return (
    <Badge variant={config.variant} dot className={className}>
      {config.label}
    </Badge>
  );
}

export default Badge;




