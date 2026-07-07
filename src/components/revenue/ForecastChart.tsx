import { useState, useMemo } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { ForecastItem } from '../../api/services/revenue-intelligence.service';
import { useForecast, useRevenueData } from '../../contexts/RevenueDataContext';
import { useCurrency } from '@/hooks/useCurrency';

interface ChartDataItem {
  date: string;
  revenue: number;
  demand: number;
  occupancy: number;
  confidence: number;
  confidenceUpper?: number;
  confidenceLower?: number;
}

interface TooltipPayload {
  value: number;
  payload: ChartDataItem;
}

const CustomTooltip = ({ active, payload, label, symbol = '₹' }: { active?: boolean; payload?: TooltipPayload[]; label?: string; symbol?: string }) => {
  const formatCurrencyValue = (value: number) => {
    if (value >= 1000000) {
      return `${symbol}${(value / 1000000).toFixed(1)}M`;
    }
    if (value >= 1000) {
      return `${symbol}${(value / 1000).toFixed(0)}K`;
    }
    return `${symbol}${value.toLocaleString()}`;
  };

  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white border border-neutral-200 rounded-[10px] p-3 shadow-lg">
        <p className="text-[11px] text-neutral-500 font-medium mb-1">{label}</p>
        <p className="text-sm font-bold text-terra-600">
          {formatCurrencyValue(payload[0].value)}
        </p>
        {data.demand !== undefined && (
          <p className="text-[11px] text-neutral-400 mt-1">
            Demand: {Math.round(data.demand * 100)}%
          </p>
        )}
        {data.occupancy !== undefined && (
          <p className="text-[11px] text-neutral-400">
            Occupancy: {data.occupancy}%
          </p>
        )}
        {data.confidence !== undefined && (
          <p className="text-[11px] text-ocean-500">
            Confidence: {data.confidence}%
          </p>
        )}
      </div>
    );
  }
  return null;
};

// Skeleton loader component
const SkeletonLoader = () => (
  <div className="p-6 animate-pulse">
    <div className="flex items-center justify-between mb-6">
      <div>
        <div className="h-4 bg-neutral-200 rounded w-32 mb-2" />
        <div className="h-3 bg-neutral-200 rounded w-40" />
      </div>
      <div className="text-right">
        <div className="h-3 bg-neutral-200 rounded w-20 mb-1" />
        <div className="h-6 bg-neutral-200 rounded w-24" />
      </div>
    </div>
    <div className="h-[260px] bg-neutral-100 rounded-lg" />
    <div className="flex items-center justify-center gap-6 mt-4 pt-4 border-t border-neutral-100">
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex items-center gap-2">
          <div className="w-3 h-3 bg-neutral-200 rounded" />
          <div className="h-3 bg-neutral-200 rounded w-24" />
        </div>
      ))}
    </div>
  </div>
);

// Error component
const ErrorDisplay = ({ error, onRetry }: { error: string; onRetry: () => void }) => (
  <div className="p-6">
    <div className="flex flex-col items-center justify-center py-16">
      <div className="w-12 h-12 rounded-full bg-rose-100 flex items-center justify-center mb-4">
        <AlertCircle className="w-6 h-6 text-rose-500" />
      </div>
      <p className="text-sm font-medium text-neutral-900 mb-1">Failed to load forecast data</p>
      <p className="text-xs text-neutral-500 mb-4">{error}</p>
      <button
        onClick={onRetry}
        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-terra-600 bg-terra-50 rounded-lg hover:bg-terra-100 transition-colors"
      >
        <RefreshCw className="w-4 h-4" />
        Retry
      </button>
    </div>
  </div>
);

// Fallback data — returns an empty 14-day series (no hardcoded demo numbers).
const generateFallbackData = (): ChartDataItem[] => {
  const today = new Date();
  const fallbackData: ChartDataItem[] = [];
  for (let i = 0; i < 14; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() + i);
    fallbackData.push({
      date: date.toISOString().split('T')[0],
      revenue: 0,
      demand: 0,
      occupancy: 0,
      confidence: 0,
      confidenceUpper: 0,
      confidenceLower: 0,
    });
  }
  return fallbackData;
};

export default function ForecastChart() {
  const { data: forecastData, loading } = useForecast();
  const { refresh, error } = useRevenueData();
  const { symbol } = useCurrency();
  const [showConfidenceBands, setShowConfidenceBands] = useState(true);

  const formatCurrencyValue = (value: number) => {
    if (value >= 1000000) {
      return `${symbol}${(value / 1000000).toFixed(1)}M`;
    }
    if (value >= 1000) {
      return `${symbol}${(value / 1000).toFixed(0)}K`;
    }
    return `${symbol}${value.toLocaleString()}`;
  };

  // Transform API response to chart format
  const data = useMemo(() => {
    if (!forecastData?.forecasts || forecastData.forecasts.length === 0) {
      return generateFallbackData();
    }

    return forecastData.forecasts.map((item: ForecastItem) => {
      const baseRevenue = item.forecasted_demand * 8000;
      const confidenceVariance = (100 - item.confidence_level) / 100 * baseRevenue * 0.2;

      return {
        date: item.date,
        revenue: baseRevenue,
        demand: item.forecasted_occupancy / 100,
        occupancy: item.forecasted_occupancy,
        confidence: item.confidence_level,
        confidenceUpper: baseRevenue + confidenceVariance,
        confidenceLower: Math.max(0, baseRevenue - confidenceVariance)
      };
    });
  }, [forecastData]);

  const chartData = useMemo(() => {
    return data.map((item) => ({
      ...item,
      date: new Date(item.date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      })
    }));
  }, [data]);

  const todayIndex = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return data.findIndex(item => item.date === today);
  }, [data]);

  const totalForecast = useMemo(() => {
    return data.slice(0, 7).reduce((sum, item) => sum + item.revenue, 0);
  }, [data]);

  const avgRevenue = useMemo(() => {
    if (data.length === 0) return 0;
    return Math.round(data.reduce((sum, item) => sum + item.revenue, 0) / data.length);
  }, [data]);

  const avgConfidence = useMemo(() => {
    if (data.length === 0) return 0;
    return Math.round(data.reduce((sum, item) => sum + item.confidence, 0) / data.length);
  }, [data]);

  if (loading) {
    return <SkeletonLoader />;
  }

  if (error && data.length === 0) {
    return <ErrorDisplay error={error} onRetry={refresh} />;
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-sm font-semibold text-neutral-800">Revenue Forecast</h3>
          <p className="text-[11px] text-neutral-400 font-medium mt-0.5">
            Next 14 days projection ({avgConfidence}% avg confidence)
          </p>
        </div>
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={showConfidenceBands}
              onChange={(e) => setShowConfidenceBands(e.target.checked)}
              className="w-4 h-4 rounded border-neutral-300 text-terra-500 focus:ring-terra-500/20"
            />
            <span className="text-[11px] text-neutral-500 font-medium">Show confidence</span>
          </label>
          <div className="text-right">
            <p className="text-[11px] text-neutral-400 font-medium">7-Day Forecast</p>
            <p className="text-xl font-bold text-terra-600">{formatCurrencyValue(totalForecast)}</p>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="h-[260px]">
        <ResponsiveContainer width="100%" height="100%" minHeight={260}>
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorRevenueForecast" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#A57865" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#A57865" stopOpacity={0.02} />
              </linearGradient>
              <linearGradient id="colorConfidenceBand" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#5C9BA4" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#5C9BA4" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E4E0" vertical={false} />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 11, fill: '#9ca3af' }}
              axisLine={{ stroke: '#E5E4E0' }}
              tickLine={false}
              dy={10}
            />
            <YAxis
              tick={{ fontSize: 11, fill: '#9ca3af' }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(value) => `${symbol}${(value / 1000).toFixed(0)}K`}
              dx={-5}
            />
            <Tooltip content={<CustomTooltip symbol={symbol} />} />

            {/* Average Reference Line */}
            <ReferenceLine
              y={avgRevenue}
              stroke="#CDB261"
              strokeDasharray="5 5"
              label={{
                value: 'Avg',
                position: 'right',
                fill: '#CDB261',
                fontSize: 10
              }}
            />

            {/* Today Marker */}
            {todayIndex >= 0 && (
              <ReferenceLine
                x={chartData[todayIndex]?.date}
                stroke="#4E5840"
                strokeWidth={2}
                label={{
                  value: 'Today',
                  position: 'top',
                  fill: '#4E5840',
                  fontSize: 10
                }}
              />
            )}

            {/* Confidence Band */}
            {showConfidenceBands && (
              <Area
                type="monotone"
                dataKey="confidenceUpper"
                stroke="transparent"
                fill="url(#colorConfidenceBand)"
                dot={false}
              />
            )}

            {/* Main Revenue Area */}
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="#A57865"
              strokeWidth={2.5}
              fill="url(#colorRevenueForecast)"
              dot={false}
              activeDot={{ r: 5, fill: '#A57865', stroke: '#fff', strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 mt-4 pt-4 border-t border-neutral-100">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-sm bg-terra-500" />
          <span className="text-[11px] text-neutral-600 font-medium">Forecasted Revenue</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-0 border-t-2 border-dashed border-gold-500" />
          <span className="text-[11px] text-neutral-600 font-medium">Average ({formatCurrencyValue(avgRevenue)})</span>
        </div>
        {showConfidenceBands && (
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-sm bg-ocean-200" />
            <span className="text-[11px] text-neutral-600 font-medium">Confidence Band</span>
          </div>
        )}
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-sage-500" />
          <span className="text-[11px] text-neutral-600 font-medium">Today</span>
        </div>
      </div>
    </div>
  );
}
