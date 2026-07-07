import { forwardRef } from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

/**
 * MetricCard Component
 * KPI card with icon, value, and trend
 */
const MetricCard = forwardRef(({
  title,
  value,
  change,
  changeLabel,
  icon: Icon,
  iconColor = 'primary',
  trend,
  sparkline,
  className = '',
  ...props
}, ref) => {

  const iconColors = {
    primary: 'bg-primary-100 text-primary-600',
    success: 'bg-success-100 text-success-600',
    warning: 'bg-warning-100 text-warning-600',
    error: 'bg-error-100 text-error-600',
    info: 'bg-info-100 text-info-600',
    neutral: 'bg-neutral-100 text-neutral-600',
  };

  const trendColors = {
    up: 'text-success-600',
    down: 'text-error-600',
    neutral: 'text-neutral-500',
  };

  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;

  return (
    <div
      ref={ref}
      className={`
        bg-white rounded-xl border border-neutral-200 p-5
        ${className}
      `}
      {...props}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          {/* Title */}
          <p className="text-[12px] font-medium text-neutral-500 uppercase tracking-wider">
            {title}
          </p>

          {/* Value */}
          <p className="text-[28px] font-semibold text-neutral-900 mt-2 tracking-tight">
            {value}
          </p>

          {/* Change */}
          {(change !== undefined || changeLabel) && (
            <div className="flex items-center gap-1.5 mt-2">
              {change !== undefined && (
                <span className={`flex items-center gap-0.5 text-[13px] font-medium ${trendColors[trend || 'neutral']}`}>
                  <TrendIcon className="w-3.5 h-3.5" />
                  {change}
                </span>
              )}
              {changeLabel && (
                <span className="text-[12px] text-neutral-500">
                  {changeLabel}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Icon */}
        {Icon && (
          <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${iconColors[iconColor]}`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      {/* Sparkline */}
      {sparkline && (
        <div className="mt-4 pt-4 border-t border-neutral-100">
          {sparkline}
        </div>
      )}
    </div>
  );
});

MetricCard.displayName = 'MetricCard';

/**
 * LiveStatPill
 * Compact live stat indicator
 */
const LiveStatPill = forwardRef(({
  label,
  value,
  icon: Icon,
  variant = 'default',
  pulse = false,
  className = '',
  ...props
}, ref) => {

  const variants = {
    default: 'bg-neutral-100 text-neutral-700',
    primary: 'bg-primary-100 text-primary-700',
    success: 'bg-success-100 text-success-700',
    warning: 'bg-warning-100 text-warning-700',
    error: 'bg-error-100 text-error-700',
    info: 'bg-info-100 text-info-700',
  };

  return (
    <div
      ref={ref}
      className={`
        inline-flex items-center gap-2 px-3 py-2 rounded-lg
        ${variants[variant]}
        ${className}
      `}
      {...props}
    >
      {Icon && <Icon className="w-4 h-4" />}
      <span className="text-[13px] font-medium">{label}</span>
      <span className="text-[14px] font-semibold">{value}</span>
      {pulse && (
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-current opacity-50"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-current"></span>
        </span>
      )}
    </div>
  );
});

LiveStatPill.displayName = 'LiveStatPill';

export { MetricCard, LiveStatPill };
export default MetricCard;
