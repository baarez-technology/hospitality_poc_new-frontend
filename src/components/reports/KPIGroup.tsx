import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { useCurrency } from '@/hooks/useCurrency';

const formatValue = (value, format, currencySymbol = '$') => {
  if (format === 'currency') {
    if (value >= 1000000) {
      return `${currencySymbol}${(value / 1000000).toFixed(1)}M`;
    }
    if (value >= 1000) {
      return `${currencySymbol}${(value / 1000).toFixed(1)}K`;
    }
    return `${currencySymbol}${value.toLocaleString()}`;
  }
  if (format === 'percent') {
    return `${value}%`;
  }
  if (format === 'number') {
    return value.toLocaleString();
  }
  return value;
};

const getTrendIcon = (trend) => {
  if (trend > 0) return TrendingUp;
  if (trend < 0) return TrendingDown;
  return Minus;
};

const getTrendColor = (trend, inverse = false) => {
  if (inverse) {
    if (trend > 0) return 'text-gold-600';
    if (trend < 0) return 'text-sage-600';
  }
  if (trend > 0) return 'text-sage-600';
  if (trend < 0) return 'text-gold-600';
  return 'text-neutral-500';
};

const accentColors = {
  terra: { bg: 'bg-terra-50', icon: 'text-terra-600' },
  ocean: { bg: 'bg-ocean-50', icon: 'text-ocean-600' },
  sage: { bg: 'bg-sage-50', icon: 'text-sage-600' },
  gold: { bg: 'bg-gold-50', icon: 'text-gold-700' },
  neutral: { bg: 'bg-neutral-50', icon: 'text-neutral-500' }
};

export default function KPIGroup({ kpis }) {
  const { symbol } = useCurrency();
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6">
      {kpis.map((kpi, index) => {
        const TrendIcon = getTrendIcon(kpi.trend);
        const trendColor = getTrendColor(kpi.trend, kpi.inverseTrend);
        const accent = kpi.accent || 'terra';
        const colors = accentColors[accent] || accentColors.terra;

        return (
          <div
            key={index}
            className="rounded-[10px] bg-white p-6"
          >
            {/* Header with Icon */}
            <div className="flex items-center gap-3 mb-4">
              {kpi.icon && (
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${colors.bg}`}>
                  <kpi.icon className={`w-4 h-4 ${colors.icon}`} />
                </div>
              )}
              <p className="text-[11px] font-semibold uppercase tracking-widest text-neutral-400">
                {kpi.label}
              </p>
            </div>

            {/* Value */}
            <p className="text-[28px] font-semibold tracking-tight text-neutral-900 mb-2">
              {formatValue(kpi.value, kpi.format, symbol)}
            </p>

            {/* Trend */}
            {kpi.trend !== undefined && (
              <div className={`flex items-center gap-1 ${trendColor}`}>
                <TrendIcon className="w-3.5 h-3.5" />
                <span className="text-[11px] font-semibold">
                  {kpi.trend > 0 ? '+' : ''}{kpi.trend}%
                </span>
                {kpi.trendLabel && (
                  <span className="text-[11px] text-neutral-400 font-medium">{kpi.trendLabel}</span>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
