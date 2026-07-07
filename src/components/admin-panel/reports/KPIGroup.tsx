import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { useCurrency } from '@/hooks/useCurrency';

const formatValue = (value, format, currencySymbol = '₹') => {
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
    if (trend > 0) return 'text-[#CDB261]';
    if (trend < 0) return 'text-[#4E5840]';
  }
  if (trend > 0) return 'text-[#4E5840]';
  if (trend < 0) return 'text-[#CDB261]';
  return 'text-neutral-500';
};

export default function KPIGroup({ kpis }) {
  const { symbol } = useCurrency();
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
      {kpis.map((kpi, index) => {
        const TrendIcon = getTrendIcon(kpi.trend);
        const trendColor = getTrendColor(kpi.trend, kpi.inverseTrend);

        return (
          <div
            key={index}
            className="bg-white border border-[#E5E5E5] rounded-xl p-4 shadow-sm"
          >
            <div className="flex items-center gap-2 mb-2">
              {kpi.icon && (
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: `${kpi.color || '#A57865'}15` }}
                >
                  <kpi.icon className="w-4 h-4" style={{ color: kpi.color || '#A57865' }} />
                </div>
              )}
            </div>
            <div>
              <p className="text-2xl font-bold text-neutral-900">
                {formatValue(kpi.value, kpi.format, symbol)}
              </p>
              <p className="text-xs text-neutral-500 mt-1">{kpi.label}</p>
              {kpi.trend !== undefined && (
                <div className={`flex items-center gap-1 mt-2 ${trendColor}`}>
                  <TrendIcon className="w-3 h-3" />
                  <span className="text-xs font-medium">
                    {kpi.trend > 0 ? '+' : ''}{kpi.trend}%
                  </span>
                  {kpi.trendLabel && (
                    <span className="text-xs text-neutral-400">{kpi.trendLabel}</span>
                  )}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
