import { forwardRef } from 'react';

/**
 * Card Component
 * Clean card with subtle border, no shadows
 */
const Card = forwardRef(({
  children,
  padding = 'default',
  hover = false,
  className = '',
  ...props
}, ref) => {

  const paddingStyles = {
    none: '',
    compact: 'p-4',
    default: 'p-5',
    large: 'p-6',
  };

  return (
    <div
      ref={ref}
      className={`
        bg-white rounded-xl border border-neutral-200
        ${paddingStyles[padding]}
        ${hover ? 'transition-colors duration-200 hover:border-neutral-300 cursor-pointer' : ''}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
});

Card.displayName = 'Card';

// Card Header
const CardHeader = forwardRef(({ children, className = '', ...props }, ref) => (
  <div
    ref={ref}
    className={`flex items-center justify-between pb-4 border-b border-neutral-100 mb-4 ${className}`}
    {...props}
  >
    {children}
  </div>
));

CardHeader.displayName = 'CardHeader';

// Card Title
const CardTitle = forwardRef(({ children, className = '', ...props }, ref) => (
  <h3
    ref={ref}
    className={`text-[15px] font-semibold text-neutral-900 ${className}`}
    {...props}
  >
    {children}
  </h3>
));

CardTitle.displayName = 'CardTitle';

// Card Description
const CardDescription = forwardRef(({ children, className = '', ...props }, ref) => (
  <p
    ref={ref}
    className={`text-[13px] text-neutral-500 mt-1 ${className}`}
    {...props}
  >
    {children}
  </p>
));

CardDescription.displayName = 'CardDescription';

// Card Content
const CardContent = forwardRef(({ children, className = '', ...props }, ref) => (
  <div ref={ref} className={className} {...props}>
    {children}
  </div>
));

CardContent.displayName = 'CardContent';

// Card Footer
const CardFooter = forwardRef(({ children, className = '', ...props }, ref) => (
  <div
    ref={ref}
    className={`flex items-center gap-3 pt-4 mt-4 border-t border-neutral-100 ${className}`}
    {...props}
  >
    {children}
  </div>
));

CardFooter.displayName = 'CardFooter';

export {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
};

export default Card;
