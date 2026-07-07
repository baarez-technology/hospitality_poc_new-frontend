import { forwardRef } from 'react';
import { Loader2 } from 'lucide-react';

/**
 * Button Component
 * Clean, professional button with multiple variants
 */
const Button = forwardRef(({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  icon: Icon,
  iconPosition = 'left',
  fullWidth = false,
  className = '',
  type = 'button',
  ...props
}, ref) => {

  const baseStyles = `
    inline-flex items-center justify-center gap-2
    font-medium transition-all duration-200
    focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2
    disabled:opacity-50 disabled:cursor-not-allowed
    active:scale-[0.98]
  `;

  const variants = {
    primary: `
      bg-primary-500 text-white
      hover:bg-primary-600
      focus-visible:ring-primary-500
    `,
    secondary: `
      bg-white text-neutral-700 border border-neutral-300
      hover:bg-neutral-50 hover:border-neutral-400
      focus-visible:ring-neutral-400
    `,
    ghost: `
      bg-transparent text-neutral-600
      hover:bg-neutral-100 hover:text-neutral-900
      focus-visible:ring-neutral-400
    `,
    destructive: `
      bg-error-500 text-white
      hover:bg-error-600
      focus-visible:ring-error-500
    `,
    outline: `
      bg-transparent text-primary-600 border border-primary-300
      hover:bg-primary-50
      focus-visible:ring-primary-500
    `,
    link: `
      bg-transparent text-primary-600 underline-offset-4
      hover:underline
      focus-visible:ring-primary-500
      p-0 h-auto
    `,
  };

  const sizes = {
    sm: 'h-8 px-3 text-[13px] rounded-md',
    md: 'h-10 px-4 text-[14px] rounded-lg',
    lg: 'h-11 px-5 text-[15px] rounded-lg',
    icon: {
      sm: 'h-8 w-8 rounded-md',
      md: 'h-10 w-10 rounded-lg',
      lg: 'h-11 w-11 rounded-lg',
    },
  };

  const isIconOnly = !children && Icon;
  const sizeClass = isIconOnly ? sizes.icon[size] : sizes[size];

  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || loading}
      className={`
        ${baseStyles}
        ${variants[variant]}
        ${sizeClass}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
      {...props}
    >
      {loading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          {children && <span>Loading...</span>}
        </>
      ) : (
        <>
          {Icon && iconPosition === 'left' && (
            <Icon className={`${size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4'} ${!isIconOnly ? '-ml-0.5' : ''}`} />
          )}
          {children}
          {Icon && iconPosition === 'right' && (
            <Icon className={`${size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4'} ${!isIconOnly ? '-mr-0.5' : ''}`} />
          )}
        </>
      )}
    </button>
  );
});

Button.displayName = 'Button';

export default Button;
