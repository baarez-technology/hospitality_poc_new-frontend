import { forwardRef, ReactNode } from 'react';
import { Loader2 } from 'lucide-react';

/**
 * Staff Portal Button - Matching admin dashboard ui2/Button.tsx
 * Glimmora Design System v4.0
 */

const VARIANT: Record<string, string> = {
  // Primary - uses brand primary color
  primary: 'text-white font-semibold bg-[var(--brand-primary)] hover:bg-[var(--brand-primary-hover)] active:brightness-90',
  // Secondary - uses brand accent color
  secondary: 'text-white font-semibold bg-[var(--brand-accent)] hover:bg-[var(--brand-accent-hover)] active:brightness-90',
  // Outline variants - white background with colored border/text
  outline: 'text-[var(--brand-primary)] font-semibold bg-white border border-[var(--brand-primary)]/30 hover:bg-[var(--brand-primary-50)] hover:border-[var(--brand-primary)]/60 active:bg-[var(--brand-primary-light)]',
  'outline-secondary': 'text-[var(--brand-accent)] font-semibold bg-white border border-[var(--brand-accent)]/30 hover:bg-[var(--brand-accent-50)] hover:border-[var(--brand-accent)]/60 active:bg-[var(--brand-accent-light)]',
  'outline-neutral': 'text-neutral-600 font-semibold bg-white border border-neutral-200 hover:bg-neutral-50 hover:border-neutral-300 active:bg-neutral-100',
  'outline-danger': 'text-rose-600 font-semibold bg-white border border-rose-200 hover:bg-rose-50 hover:border-rose-300 active:bg-rose-100',
  'outline-success': 'text-sage-600 font-semibold bg-white border border-sage-200 hover:bg-sage-50 hover:border-sage-300 active:bg-sage-100',
  'outline-warning': 'text-gold-700 font-semibold bg-white border border-gold-200 hover:bg-gold-50 hover:border-gold-300 active:bg-gold-100',
  // Ghost and subtle variants
  ghost: 'text-neutral-600 font-medium bg-transparent hover:bg-neutral-100 hover:text-neutral-900 active:bg-neutral-200',
  subtle: 'text-neutral-700 font-medium bg-neutral-100 hover:bg-neutral-200 hover:text-neutral-900 active:bg-neutral-300',
  // Solid semantic variants
  danger: 'text-white font-semibold bg-rose-500 hover:bg-rose-600 active:bg-rose-700',
  success: 'text-white font-semibold bg-sage-500 hover:bg-sage-600 active:bg-sage-700',
  warning: 'text-gold-900 font-semibold bg-gold-400 hover:bg-gold-500 active:bg-gold-600',
  link: 'text-[var(--brand-primary)] font-medium bg-transparent hover:text-[var(--brand-primary-hover)] underline-offset-4 hover:underline',
};

const SIZE: Record<string, string> = {
  sm: 'h-8 px-3 text-xs gap-1.5 rounded-[var(--brand-radius-sm)]',
  default: 'h-9 px-4 text-[13px] gap-2 rounded-[var(--brand-radius-md)]',
  lg: 'h-10 px-5 text-sm gap-2 rounded-[var(--brand-radius-lg)]',
  icon: 'h-9 w-9 rounded-[var(--brand-radius-md)]',
};

const ICON_SIZE: Record<string, string> = {
  sm: 'w-3.5 h-3.5',
  default: 'w-4 h-4',
  lg: 'w-4 h-4',
  icon: 'w-4 h-4',
};

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'outline-neutral' | 'ghost' | 'subtle' | 'danger' | 'success' | 'warning' | 'link';
  size?: 'sm' | 'default' | 'lg' | 'icon';
  icon?: React.ComponentType<{ className?: string }>;
  iconPosition?: 'left' | 'right';
  isLoading?: boolean;
  children?: ReactNode;
  className?: string;
  fullWidth?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({
    children,
    variant = 'primary',
    size = 'default',
    icon: Icon,
    iconPosition = 'left',
    isLoading = false,
    disabled = false,
    className = '',
    type = 'button',
    fullWidth = false,
    ...props
  }, ref) => {
    const isDisabled = disabled || isLoading;

    return (
      <button
        ref={ref}
        type={type}
        disabled={isDisabled}
        className={`
          inline-flex items-center justify-center whitespace-nowrap
          transition-all duration-150 ease-out
          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-primary)]/40 focus-visible:ring-offset-2
          disabled:opacity-50 disabled:pointer-events-none
          active:scale-[0.98]
          ${VARIANT[variant] || VARIANT.primary}
          ${SIZE[size] || SIZE.default}
          ${fullWidth ? 'w-full' : ''}
          ${className}
        `}
        {...props}
      >
        {isLoading ? (
          <>
            <Loader2 className={`${ICON_SIZE[size]} animate-spin`} />
            {size !== 'icon' && <span>Loading...</span>}
          </>
        ) : (
          <>
            {Icon && iconPosition === 'left' && <Icon className={ICON_SIZE[size]} />}
            {children}
            {Icon && iconPosition === 'right' && <Icon className={ICON_SIZE[size]} />}
          </>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';

export function IconButton({
  icon: Icon,
  variant = 'ghost',
  size = 'default',
  className = '',
  label,
  ...props
}: {
  icon: React.ComponentType<{ className?: string }>;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'default' | 'lg';
  className?: string;
  label?: string;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const ICON_BUTTON_SIZE: Record<string, string> = {
    sm: 'w-8 h-8',
    default: 'w-9 h-9',
    lg: 'w-10 h-10',
  };

  const ICON_SIZES: Record<string, string> = {
    sm: 'w-3.5 h-3.5',
    default: 'w-4 h-4',
    lg: 'w-4 h-4',
  };

  return (
    <button
      type="button"
      aria-label={label}
      className={`
        inline-flex items-center justify-center rounded-[var(--brand-radius-md)]
        transition-all duration-150 ease-out
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-primary)]/40 focus-visible:ring-offset-2
        disabled:opacity-50 disabled:pointer-events-none
        active:scale-[0.95]
        ${VARIANT[variant] || VARIANT.ghost}
        ${ICON_BUTTON_SIZE[size]}
        ${className}
      `}
      {...props}
    >
      <Icon className={ICON_SIZES[size]} />
    </button>
  );
}

export function ButtonGroup({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`
      inline-flex items-center
      [&>button]:rounded-none
      [&>button:first-child]:rounded-l-lg
      [&>button:last-child]:rounded-r-lg
      [&>button:not(:last-child)]:border-r-0
      ${className}
    `}>
      {children}
    </div>
  );
}

export function ButtonGroupItem({
  children,
  isActive = false,
  className = '',
  ...props
}: {
  children: ReactNode;
  isActive?: boolean;
  className?: string;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      className={`
        px-4 py-2 text-[13px] font-medium transition-colors
        border-r border-neutral-200 last:border-r-0
        ${isActive
          ? 'bg-[var(--brand-primary)] text-white'
          : 'bg-white text-neutral-700 hover:bg-neutral-50'
        }
        ${className}
      `}
      {...props}
    >
      {children}
    </button>
  );
}

export default Button;




