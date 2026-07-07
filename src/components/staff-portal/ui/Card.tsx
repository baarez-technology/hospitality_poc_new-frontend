import { forwardRef, ReactNode, useState, useEffect, useRef } from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  padding?: 'none' | 'sm' | 'default' | 'lg';
  hover?: boolean;
  children: ReactNode;
  className?: string;
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ children, className = '', padding = 'default', hover = false, onClick, ...props }, ref) => {
    const paddingStyles = {
      none: '',
      sm: 'p-3',
      default: 'p-5',
      lg: 'p-6'
    };

    return (
      <div
        ref={ref}
        className={`
          bg-white rounded-[var(--brand-radius-card)] shadow-sm border border-neutral-300
          ${paddingStyles[padding]}
          ${hover ? 'transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 cursor-pointer' : ''}
          ${onClick ? 'cursor-pointer' : ''}
          ${className}
        `}
        onClick={onClick}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

export function CardHeader({ children, className = '', ...props }: { children: ReactNode; className?: string } & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`mb-4 ${className}`} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({ children, className = '', ...props }: { children: ReactNode; className?: string } & React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3 className={`text-lg font-semibold text-neutral-900 ${className}`} {...props}>
      {children}
    </h3>
  );
}

export function CardDescription({ children, className = '', ...props }: { children: ReactNode; className?: string } & React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={`text-sm text-neutral-600 mt-1 ${className}`} {...props}>
      {children}
    </p>
  );
}

export function CardContent({ children, className = '', ...props }: { children: ReactNode; className?: string } & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={className} {...props}>
      {children}
    </div>
  );
}

export function CardFooter({ children, className = '', ...props }: { children: ReactNode; className?: string } & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`mt-4 pt-4 border-t border-neutral-300 ${className}`} {...props}>
      {children}
    </div>
  );
}

// Animated Number component for smooth transitions
function AnimatedNumber({ value, prefix = '', suffix = '' }: { value: number | string; prefix?: string; suffix?: string }) {
  const [display, setDisplay] = useState(0);
  const animationRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);

  useEffect(() => {
    const target = typeof value === 'string' ? parseFloat(value.replace(/[^0-9.-]/g, '')) : value;
    if (isNaN(target)) {
      return;
    }
    const duration = 1200;

    const animate = (timestamp: number) => {
      if (!startTimeRef.current) startTimeRef.current = timestamp;
      const progress = Math.min((timestamp - startTimeRef.current) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 4);
      setDisplay(eased * target);

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        setDisplay(target);
      }
    };

    startTimeRef.current = null;
    animationRef.current = requestAnimationFrame(animate);
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [value]);

  return (
    <span className="tabular-nums">
      {prefix}
      {Math.round(display).toLocaleString()}
      {suffix}
    </span>
  );
}

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ComponentType<{ className?: string }>;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  color?: 'terra' | 'sage' | 'gold' | 'ocean' | 'primary' | 'green' | 'teal' | 'danger' | 'warning';
  className?: string;
  isActive?: boolean;
  onClick?: () => void;
}

export function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  trendValue,
  color = 'terra',
  className = '',
  isActive = false,
  onClick
}: StatCardProps) {
  // Icon container background colors matching admin LuxuryKPICard
  const iconBgStyles: Record<string, string> = {
    terra: 'bg-terra-50',
    sage: 'bg-sage-50',
    gold: 'bg-gold-50',
    ocean: 'bg-ocean-50',
    primary: 'bg-terra-50',
    green: 'bg-sage-50',
    teal: 'bg-ocean-50',
    danger: 'bg-rose-50',
    warning: 'bg-gold-50'
  };

  // Icon color styles matching admin LuxuryKPICard
  const iconColorStyles: Record<string, string> = {
    terra: 'text-terra-600',
    sage: 'text-sage-600',
    gold: 'text-gold-600',
    ocean: 'text-ocean-600',
    primary: 'text-terra-600',
    green: 'text-sage-600',
    teal: 'text-ocean-600',
    danger: 'text-rose-600',
    warning: 'text-gold-600'
  };

  const isPositive = trend === 'up';
  const hasLetters = typeof value === 'string' && /[a-zA-Z]/.test(value);
  const numericValue = typeof value === 'string' ? parseFloat(value.replace(/[^0-9.-]/g, '')) : value;
  const isAnimatable = !isNaN(numericValue) && !hasLetters;

  return (
    <div
      className={`
        relative overflow-hidden rounded-[var(--brand-radius-card)] bg-white p-4 sm:p-6 transition-all
        ${onClick ? 'cursor-pointer' : ''}
        ${className}
      `}
      onClick={onClick}
    >
      <div className="relative">
        {/* Header with Icon and Title - matching admin LuxuryKPICard */}
        <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
          {Icon && (
            <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${iconBgStyles[color]}`}>
              <Icon className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${iconColorStyles[color]}`} />
            </div>
          )}
          <p className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-wide sm:tracking-widest text-neutral-400 leading-tight">
            {title}
          </p>
        </div>

        {/* Value - matching admin text-[28px] font-semibold */}
        <p className="text-[22px] sm:text-[28px] font-semibold tracking-tight text-neutral-900 mb-1.5 sm:mb-2">
          {isAnimatable ? <AnimatedNumber value={numericValue} /> : value}
        </p>

        {/* Comparison row - matching admin layout */}
        <div className="flex items-center justify-between">
          {subtitle && (
            <p className="text-[10px] sm:text-[11px] text-neutral-400 font-medium">{subtitle}</p>
          )}
          {trend && trendValue && (
            <div className={`flex items-center gap-1 text-[10px] sm:text-[11px] font-semibold ${
              isPositive ? 'text-sage-600' : 'text-rose-600'
            }`}>
              {isPositive ? <ArrowUpRight className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> : <ArrowDownRight className="w-3 h-3 sm:w-3.5 sm:h-3.5" />}
              {trendValue}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Card;




