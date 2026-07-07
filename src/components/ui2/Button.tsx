import { forwardRef } from 'react';
import type { ButtonHTMLAttributes, ComponentType } from 'react';
import { cn } from '../../lib/utils';
import { Loader2 } from 'lucide-react';

/**
 * Glimmora Design System v5.0 - Button
 * Warm enterprise aesthetic with dynamic branding support
 */

const VARIANT = {
  // Primary - uses brand primary color
  primary: `
    text-white font-semibold
    bg-[var(--brand-primary)]
    hover:bg-[var(--brand-primary-hover)]
    active:brightness-90
  `,
  // Secondary - uses brand accent color
  secondary: `
    text-white font-semibold
    bg-[var(--brand-accent)]
    hover:bg-[var(--brand-accent-hover)]
    active:brightness-90
  `,
  // Outline variants - white background with colored border/text
  outline: `
    text-[var(--brand-primary)] font-semibold
    bg-white
    border border-[var(--brand-primary)]/30
    hover:bg-[var(--brand-primary-45)] hover:border-[var(--brand-primary)]/60
    active:bg-[var(--brand-primary-light)]
  `,
  'outline-secondary': `
    text-[var(--brand-accent)] font-semibold
    bg-white
    border border-[var(--brand-accent)]/30
    hover:bg-[var(--brand-accent-50)] hover:border-[var(--brand-accent)]/60
    active:bg-[var(--brand-accent-light)]
  `,
  'outline-neutral': `
    text-neutral-600 font-semibold
    bg-white
    border border-neutral-200
    hover:bg-neutral-50 hover:border-neutral-300
    active:bg-neutral-100
  `,
  'outline-danger': `
    text-rose-600 font-semibold
    bg-white
    border border-rose-200
    hover:bg-rose-50 hover:border-rose-300
    active:bg-rose-100
  `,
  'outline-success': `
    text-sage-600 font-semibold
    bg-white
    border border-sage-200
    hover:bg-sage-50 hover:border-sage-300
    active:bg-sage-100
  `,
  'outline-warning': `
    text-gold-700 font-semibold
    bg-white
    border border-gold-200
    hover:bg-gold-50 hover:border-gold-300
    active:bg-gold-100
  `,
  // Ghost and subtle variants
  ghost: `
    text-neutral-600 font-medium
    bg-transparent
    hover:bg-neutral-100 hover:text-neutral-900
    active:bg-neutral-200
  `,
  subtle: `
    text-neutral-700 font-medium
    bg-neutral-100
    hover:bg-neutral-200 hover:text-neutral-900
    active:bg-neutral-300
  `,
  // Solid semantic variants
  danger: `
    text-white font-semibold
    bg-rose-500
    hover:bg-rose-600
    active:bg-rose-700
  `,
  success: `
    text-white font-semibold
    bg-sage-500
    hover:bg-sage-600
    active:bg-sage-700
  `,
  warning: `
    text-gold-900 font-semibold
    bg-gold-400
    hover:bg-gold-500
    active:bg-gold-600
  `,
  dark: `
    text-white font-semibold
    bg-neutral-800
    hover:bg-neutral-700
    active:bg-neutral-900
  `,
};

const SIZE = {
  xs: 'h-7 px-2.5 text-xs gap-1.5 rounded-[var(--brand-radius-sm)]',
  sm: 'h-8 px-3 text-xs gap-1.5 rounded-[var(--brand-radius-sm)]',
  md: 'h-9 px-4 text-sm gap-2 rounded-[var(--brand-radius-md)]',
  lg: 'h-10 px-5 text-sm gap-2 rounded-[var(--brand-radius-lg)]',
  xl: 'h-12 px-6 text-base gap-2.5 rounded-[var(--brand-radius-xl)]',
};

const ICON_SIZE = {
  xs: 'w-3 h-3',
  sm: 'w-3.5 h-3.5',
  md: 'w-4 h-4',
  lg: 'w-4 h-4',
  xl: 'w-5 h-5',
};

export type ButtonVariant = keyof typeof VARIANT;
export type ButtonSize = keyof typeof SIZE;
type IconType = ComponentType<{ className?: string }>;

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  className?: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: IconType;
  iconRight?: IconType;
  loading?: boolean;
  fullWidth?: boolean;
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    className,
    variant = 'primary',
    size = 'md',
    icon: Icon,
    iconRight: IconRight,
    loading = false,
    disabled = false,
    fullWidth = false,
    children,
    ...props
  },
  ref
) {
  const isDisabled = disabled || loading;

  return (
    <button
      ref={ref}
      type={props.type ?? 'button'}
      disabled={isDisabled}
      className={cn(
        'inline-flex items-center justify-center whitespace-nowrap',
        'transition-all duration-150 ease-out',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-primary)]/40 focus-visible:ring-offset-2',
        'disabled:opacity-50 disabled:pointer-events-none',
        'active:scale-[0.98]',
        VARIANT[variant] ?? VARIANT.primary,
        SIZE[size] ?? SIZE.md,
        fullWidth && 'w-full',
        className
      )}
      {...props}
    >
      {loading ? (
        <Loader2 className={cn(ICON_SIZE[size], 'animate-spin')} />
      ) : Icon ? (
        <Icon className={ICON_SIZE[size]} />
      ) : null}
      {children}
      {IconRight && !loading && <IconRight className={ICON_SIZE[size]} />}
    </button>
  );
});

// Icon-only button
export type IconButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  className?: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon: IconType;
  label: string;
  loading?: boolean;
};

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(function IconButton(
  {
    className,
    variant = 'ghost',
    size = 'md',
    icon: Icon,
    label,
    loading = false,
    ...props
  },
  ref
) {
  const ICON_BUTTON_SIZE = {
    xs: 'w-7 h-7',
    sm: 'w-8 h-8',
    md: 'w-9 h-9',
    lg: 'w-10 h-10',
    xl: 'w-12 h-12',
  };

  return (
    <button
      ref={ref}
      type={props.type ?? 'button'}
      aria-label={label}
      className={cn(
        'inline-flex items-center justify-center rounded-[var(--brand-radius-md)]',
        'transition-all duration-150 ease-out',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-primary)]/40 focus-visible:ring-offset-2',
        'disabled:opacity-50 disabled:pointer-events-none',
        'active:scale-[0.95]',
        VARIANT[variant] ?? VARIANT.ghost,
        ICON_BUTTON_SIZE[size],
        className
      )}
      {...props}
    >
      {loading ? (
        <Loader2 className={cn(ICON_SIZE[size], 'animate-spin')} />
      ) : (
        <Icon className={ICON_SIZE[size]} />
      )}
    </button>
  );
});

// Button group for segmented controls
export const ButtonGroup = ({ children, className }) => (
  <div
    className={cn(
      'inline-flex items-center',
      '[&>button]:rounded-none',
      '[&>button:first-child]:rounded-l-lg',
      '[&>button:last-child]:rounded-r-lg',
      '[&>button:not(:last-child)]:border-r-0',
      className
    )}
  >
    {children}
  </div>
);





