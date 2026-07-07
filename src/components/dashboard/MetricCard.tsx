import { useState, useEffect, useRef } from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { cn } from '../../lib/utils';

/**
 * MetricCard - Luxury KPI display with animated counter
 * Features: Gradient accent, animated number, trend indicator, sparkline
 */

// Animated counter hook
function useAnimatedNumber(target, duration = 1200) {
  const [value, setValue] = useState(0);
  const startTime = useRef(null);
  const rafRef = useRef(null);

  useEffect(() => {
    startTime.current = null;

    const animate = (timestamp) => {
      if (!startTime.current) startTime.current = timestamp;
      const progress = Math.min((timestamp - startTime.current) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 4);
      setValue(eased * target);

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate);
      } else {
        setValue(target);
      }
    };

    rafRef.current = requestAnimationFrame(animate);
    return () => rafRef.current && cancelAnimationFrame(rafRef.current);
  }, [target, duration]);

  return value;
}

// Mini sparkline component
function Sparkline({ data, color, className }) {
  const width = 80;
  const height = 32;
  const padding = 2;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  const points = data.map((val, i) => {
    const x = padding + (i / (data.length - 1)) * (width - padding * 2);
    const y = height - padding - ((val - min) / range) * (height - padding * 2);
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg width={width} height={height} className={className}>
      <defs>
        <linearGradient id={`spark-${color}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon
        points={`${padding},${height - padding} ${points} ${width - padding},${height - padding}`}
        fill={`url(#spark-${color})`}
      />
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function MetricCard({
  label,
  value,
  prefix = '',
  suffix = '',
  change,
  changeType = 'positive',
  icon: Icon,
  accentColor = 'terra',
  sparkData,
  delay = 0,
}) {
  const [isVisible, setIsVisible] = useState(false);
  const animatedValue = useAnimatedNumber(isVisible ? value : 0);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  const isPositive = changeType === 'positive';

  const colorConfig = {
    terra: {
      bg: 'bg-terra-50',
      text: 'text-terra-600',
      accent: '#A57865',
      gradient: 'from-terra-500 to-terra-600',
    },
    sage: {
      bg: 'bg-sage-50',
      text: 'text-sage-600',
      accent: '#4E5840',
      gradient: 'from-sage-500 to-sage-600',
    },
    gold: {
      bg: 'bg-gold-50',
      text: 'text-gold-600',
      accent: '#CDB261',
      gradient: 'from-gold-500 to-gold-600',
    },
    ocean: {
      bg: 'bg-ocean-50',
      text: 'text-ocean-600',
      accent: '#5C9BA4',
      gradient: 'from-ocean-500 to-ocean-600',
    },
  };

  const colors = colorConfig[accentColor] || colorConfig.terra;

  return (
    <div
      className={cn(
        "group relative overflow-hidden",
        "bg-white rounded-2xl",
        "border border-neutral-100",
        "shadow-sm hover:shadow-lg",
        "transition-all duration-500 ease-out",
        "hover:-translate-y-1",
        !isVisible && "opacity-0 translate-y-4",
        isVisible && "opacity-100 translate-y-0"
      )}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {/* Top gradient accent */}
      <div className={cn(
        "absolute top-0 left-0 right-0 h-1",
        "bg-gradient-to-r",
        colors.gradient,
        "opacity-80 group-hover:opacity-100 transition-opacity"
      )} />

      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={cn(
              "w-10 h-10 rounded-xl flex items-center justify-center",
              "transition-transform duration-300 group-hover:scale-110",
              colors.bg
            )}>
              <Icon className={cn("w-5 h-5", colors.text)} />
            </div>
            <span className="text-xs font-semibold uppercase tracking-widest text-neutral-400">
              {label}
            </span>
          </div>

          {/* Sparkline */}
          {sparkData && (
            <div className="opacity-50 group-hover:opacity-80 transition-opacity">
              <Sparkline data={sparkData} color={colors.accent} />
            </div>
          )}
        </div>

        {/* Value */}
        <div className="mb-3">
          <span className="text-4xl font-semibold tracking-tight text-neutral-900 tabular-nums">
            {prefix}
            {Math.round(animatedValue).toLocaleString()}
          </span>
          {suffix && (
            <span className="text-2xl font-medium text-neutral-300 ml-1">
              {suffix}
            </span>
          )}
        </div>

        {/* Change indicator */}
        <div className="flex items-center gap-2">
          <div className={cn(
            "flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold",
            isPositive
              ? "bg-emerald-50 text-emerald-600"
              : "bg-rose-50 text-rose-600"
          )}>
            {isPositive ? (
              <ArrowUpRight className="w-3.5 h-3.5" />
            ) : (
              <ArrowDownRight className="w-3.5 h-3.5" />
            )}
            {change}
          </div>
          <span className="text-xs text-neutral-400">vs last month</span>
        </div>
      </div>

      {/* Hover glow effect */}
      <div
        className={cn(
          "absolute -bottom-20 -right-20 w-40 h-40 rounded-full",
          "opacity-0 group-hover:opacity-10 transition-opacity duration-500",
          "blur-3xl"
        )}
        style={{ backgroundColor: colors.accent }}
      />
    </div>
  );
}
