import React from 'react';
import { cn } from '../../lib/utils';
import { TrendingUp, TrendingDown, Minus, LucideIcon } from 'lucide-react';

/**
 * Glimmora Design System v5.0 - Card Components
 * Information-dense cards with dynamic branding
 */

// Type Definitions
type AccentColor = 'terra' | 'ocean' | 'gold' | 'sage' | 'rose' | 'neutral';
type ChangeType = 'positive' | 'negative' | 'neutral';
type SizeType = 'sm' | 'md' | 'lg';
type VariantType = 'terra' | 'ocean' | 'sage' | 'gold' | 'dark';

interface BaseCardProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  hover?: boolean;
  padding?: boolean;
}

interface AccentCardProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  accent?: AccentColor;
  children?: React.ReactNode;
}

interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

interface CardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  className?: string;
}

interface CardDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {
  className?: string;
}

interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

interface MetricCardProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  title: string;
  value: string | number;
  change?: string;
  changeType?: ChangeType;
  subtitle?: string;
  icon?: LucideIcon;
  iconBg?: AccentColor;
  size?: SizeType;
  loading?: boolean;
}

interface StatWidgetProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  label: string;
  value: string | number;
  icon?: LucideIcon;
  trend?: number;
  color?: Exclude<AccentColor, 'neutral'>;
}

interface ActionCardProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  className?: string;
  title: string;
  description?: string;
  icon?: LucideIcon;
  variant?: VariantType;
}

interface DataCardProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  children?: React.ReactNode;
}

interface DataCardRowProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  label: string;
  value: string | number;
  icon?: LucideIcon;
}

// Base Card
export function Card({ className, hover = false, padding = true, ...props }: BaseCardProps) {
  return (
    <div
      className={cn(
        'rounded-[var(--brand-radius-card)] bg-white border border-neutral-200/40',
        'transition-all duration-200',
        hover && 'hover:bg-neutral-50/30 cursor-pointer',
        padding && 'p-5',
        className
      )}
      {...props}
    />
  );
}

// Card with colored left accent border
export function AccentCard({ className, accent = 'terra', children, ...props }: AccentCardProps) {
  const accents: Record<AccentColor, string> = {
    terra: 'border-l-terra-500',
    ocean: 'border-l-ocean-500',
    gold: 'border-l-gold-500',
    sage: 'border-l-sage-500',
    rose: 'border-l-rose-500',
    neutral: 'border-l-neutral-400',
  };

  return (
    <div
      className={cn(
        'rounded-[var(--brand-radius-card)] bg-white border border-neutral-200/40',
        'border-l-[3px]',
        accents[accent],
        'p-5 transition-all duration-200',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

// Card Header
export function CardHeader({ className, ...props }: CardHeaderProps) {
  return (
    <div
      className={cn(
        'flex items-start justify-between gap-4 pb-4 mb-4',
        'border-b border-neutral-200/40',
        className
      )}
      {...props}
    />
  );
}

// Card Title
export function CardTitle({ className, ...props }: CardTitleProps) {
  return (
    <h3
      className={cn(
        'text-sm font-semibold text-neutral-900 tracking-tight',
        className
      )}
      {...props}
    />
  );
}

// Card Description
export function CardDescription({ className, ...props }: CardDescriptionProps) {
  return (
    <p className={cn('text-xs text-neutral-500 mt-0.5', className)} {...props} />
  );
}

// Card Content
export function CardContent({ className, ...props }: CardContentProps) {
  return <div className={cn('', className)} {...props} />;
}

// Card Footer
export function CardFooter({ className, ...props }: CardFooterProps) {
  return (
    <div
      className={cn(
        'flex items-center justify-between gap-4 pt-4 mt-4',
        'border-t border-neutral-200/40',
        className
      )}
      {...props}
    />
  );
}

// Metric Card - For KPIs and statistics
export function MetricCard({
  className,
  title,
  value,
  change,
  changeType = 'neutral',
  subtitle,
  icon: Icon,
  iconBg = 'terra',
  size = 'md',
  loading = false,
  ...props
}: MetricCardProps) {
  const iconBgColors: Record<AccentColor, string> = {
    terra: 'bg-terra-100 text-terra-600',
    ocean: 'bg-ocean-100 text-ocean-600',
    gold: 'bg-gold-100 text-gold-600',
    sage: 'bg-sage-100 text-sage-600',
    rose: 'bg-rose-100 text-rose-600',
    neutral: 'bg-neutral-100 text-neutral-600',
  };

  const changeColors: Record<ChangeType, string> = {
    positive: 'text-sage-600 bg-sage-50',
    negative: 'text-rose-600 bg-rose-50',
    neutral: 'text-neutral-500 bg-neutral-100',
  };

  const TrendIcon = changeType === 'positive' ? TrendingUp : changeType === 'negative' ? TrendingDown : Minus;

  const sizes: Record<SizeType, { wrapper: string; title: string; value: string; icon: string; iconInner: string }> = {
    sm: {
      wrapper: 'p-4',
      title: 'text-xs',
      value: 'text-xl',
      icon: 'w-8 h-8',
      iconInner: 'w-4 h-4',
    },
    md: {
      wrapper: 'p-5',
      title: 'text-xs',
      value: 'text-2xl',
      icon: 'w-10 h-10',
      iconInner: 'w-5 h-5',
    },
    lg: {
      wrapper: 'p-6',
      title: 'text-sm',
      value: 'text-3xl',
      icon: 'w-12 h-12',
      iconInner: 'w-6 h-6',
    },
  };

  const s = sizes[size];

  if (loading) {
    return (
      <div className={cn('rounded-[var(--brand-radius-card)] bg-white border border-neutral-200/40', s.wrapper, className)}>
        <div className="animate-pulse">
          <div className="flex items-start justify-between mb-3">
            <div className={cn('rounded-lg bg-neutral-200', s.icon)} />
            <div className="w-16 h-5 bg-neutral-200 rounded-full" />
          </div>
          <div className="w-20 h-3 bg-neutral-200 rounded mb-2" />
          <div className="w-24 h-8 bg-neutral-200 rounded" />
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'rounded-[var(--brand-radius-card)] bg-white border border-neutral-200/40',
        'transition-all duration-200',
        s.wrapper,
        className
      )}
      {...props}
    >
      <div className="flex items-start justify-between mb-3">
        {Icon && (
          <div className={cn('rounded-lg flex items-center justify-center', iconBgColors[iconBg], s.icon)}>
            <Icon className={s.iconInner} />
          </div>
        )}
        {change && (
          <div className={cn('flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold', changeColors[changeType])}>
            <TrendIcon className="w-3 h-3" />
            {change}
          </div>
        )}
      </div>
      <p className={cn('font-medium text-neutral-500 uppercase tracking-wider mb-1', s.title)}>
        {title}
      </p>
      <p className={cn('font-semibold text-neutral-900 tracking-tight', s.value)}>
        {value}
      </p>
      {subtitle && (
        <p className="text-xs text-neutral-500 mt-1">{subtitle}</p>
      )}
    </div>
  );
}

// Stat Widget - Compact inline stat
export function StatWidget({
  className,
  label,
  value,
  icon: Icon,
  trend,
  color = 'terra',
  ...props
}: StatWidgetProps) {
  const colors: Record<Exclude<AccentColor, 'neutral'>, string> = {
    terra: 'border-l-terra-500 bg-terra-50/50',
    ocean: 'border-l-ocean-500 bg-ocean-50/50',
    gold: 'border-l-gold-500 bg-gold-50/50',
    sage: 'border-l-sage-500 bg-sage-50/50',
    rose: 'border-l-rose-500 bg-rose-50/50',
  };

  return (
    <div
      className={cn(
        'flex items-center gap-3 px-4 py-3 rounded-lg',
        'border border-neutral-200/40 border-l-[3px]',
        colors[color],
        className
      )}
      {...props}
    >
      {Icon && <Icon className="w-4 h-4 text-neutral-500" />}
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-neutral-500 truncate">{label}</p>
        <p className="text-lg font-semibold text-neutral-900">{value}</p>
      </div>
      {trend !== undefined && (
        <span className={cn(
          'text-xs font-semibold',
          trend >= 0 ? 'text-sage-600' : 'text-rose-600'
        )}>
          {trend >= 0 ? '+' : ''}{trend}%
        </span>
      )}
    </div>
  );
}

// Action Card - For quick actions with gradient background
export function ActionCard({
  className,
  title,
  description,
  icon: Icon,
  variant = 'terra',
  onClick,
  ...props
}: ActionCardProps) {
  const variants: Record<VariantType, string> = {
    terra: 'bg-gradient-to-br from-terra-500 to-terra-600 hover:from-terra-600 hover:to-terra-700',
    ocean: 'bg-gradient-to-br from-ocean-500 to-ocean-600 hover:from-ocean-600 hover:to-ocean-700',
    sage: 'bg-gradient-to-br from-sage-500 to-sage-600 hover:from-sage-600 hover:to-sage-700',
    gold: 'bg-gradient-to-br from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700',
    dark: 'bg-gradient-to-br from-neutral-800 to-neutral-900 hover:from-neutral-700 hover:to-neutral-800',
  };

  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full flex items-center gap-4 p-4 rounded-[var(--brand-radius-card)] text-white text-left',
        'transition-all duration-200 active:scale-[0.98]',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:ring-offset-2',
        variants[variant],
        className
      )}
      {...props}
    >
      {Icon && (
        <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center flex-shrink-0">
          <Icon className="w-5 h-5" />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm">{title}</p>
        {description && <p className="text-xs text-white/70 truncate">{description}</p>}
      </div>
    </button>
  );
}

// Data Card - For displaying data rows
export function DataCard({ className, children, ...props }: DataCardProps) {
  return (
    <div
      className={cn(
        'rounded-[var(--brand-radius-card)] bg-white border border-neutral-200/40 overflow-hidden',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

// Data Card Row
export function DataCardRow({ className, label, value, icon: Icon, ...props }: DataCardRowProps) {
  return (
    <div
      className={cn(
        'flex items-center justify-between px-4 py-3',
        'border-b border-neutral-100 last:border-b-0',
        className
      )}
      {...props}
    >
      <div className="flex items-center gap-2">
        {Icon && <Icon className="w-4 h-4 text-neutral-400" />}
        <span className="text-sm text-neutral-600">{label}</span>
      </div>
      <span className="text-sm font-medium text-neutral-900">{value}</span>
    </div>
  );
}

