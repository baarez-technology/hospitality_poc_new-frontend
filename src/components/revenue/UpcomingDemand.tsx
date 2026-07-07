import { useState, useMemo, useEffect } from 'react';
import { TrendingUp, TrendingDown, Minus, Sparkles, AlertCircle, RefreshCw, Calendar } from 'lucide-react';
import { ForecastItem } from '../../api/services/revenue-intelligence.service';
import { useForecast } from '../../contexts/RevenueDataContext';

type DemandLevel = 'critical' | 'high' | 'moderate' | 'low' | 'very_low';

interface DemandDay {
  date: string;
  demand: number;
  demandLevel: DemandLevel;
  hasEvent?: boolean;
  eventName?: string;
}

const getDemandColor = (demand: number) => {
  if (demand >= 0.8) return { bg: 'bg-rose-100', text: 'text-rose-800', label: 'High', borderColor: 'border-rose-200' };
  if (demand >= 0.5) return { bg: 'bg-gold-50', text: 'text-gold-800', label: 'Medium', borderColor: 'border-gold-200' };
  return { bg: 'bg-neutral-100', text: 'text-neutral-600', label: 'Low', borderColor: 'border-neutral-200' };
};

const getDemandIcon = (demand: number) => {
  if (demand >= 0.8) return TrendingUp;
  if (demand >= 0.5) return Minus;
  return TrendingDown;
};

// Skeleton loader component
const SkeletonLoader = () => (
  <div className="p-6 animate-pulse">
    <div className="flex items-center justify-between mb-6">
      <div>
        <div className="h-4 bg-neutral-200 rounded w-32 mb-2" />
        <div className="h-3 bg-neutral-200 rounded w-24" />
      </div>
      <div className="flex items-center gap-4">
        <div className="text-right">
          <div className="h-3 bg-neutral-200 rounded w-16 mb-1" />
          <div className="h-5 bg-neutral-200 rounded w-12" />
        </div>
        <div className="text-right">
          <div className="h-3 bg-neutral-200 rounded w-16 mb-1" />
          <div className="h-5 bg-neutral-200 rounded w-8" />
        </div>
      </div>
    </div>
    <div className="grid grid-cols-7 gap-2">
      {[1, 2, 3, 4, 5, 6, 7].map((i) => (
        <div key={i} className="rounded-lg p-3 bg-neutral-100 h-24" />
      ))}
    </div>
    <div className="mt-4 p-4 rounded-lg bg-neutral-100 h-16" />
  </div>
);

// Error component
const ErrorDisplay = ({ error, onRetry }: { error: string; onRetry: () => void }) => (
  <div className="p-6">
    <div className="flex flex-col items-center justify-center py-8">
      <div className="w-12 h-12 rounded-full bg-rose-100 flex items-center justify-center mb-4">
        <AlertCircle className="w-6 h-6 text-rose-500" />
      </div>
      <p className="text-sm font-medium text-neutral-900 mb-1">Failed to load demand forecast</p>
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

// Empty fallback — no demo demand values. 7 flat-zero days when API has no data.
const generateFallbackDemandData = (): DemandDay[] => {
  const today = new Date();
  const fallbackData: DemandDay[] = [];
  for (let i = 0; i < 7; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() + i);
    fallbackData.push({
      date: date.toISOString().split('T')[0],
      demand: 0,
      demandLevel: 'low',
    });
  }
  return fallbackData;
};

export default function UpcomingDemand() {
  const { data: forecastResponse, loading, error, refresh } = useForecast();
  const [aiInsight, setAiInsight] = useState<string>('');

  // Transform API response to component format
  const data = useMemo(() => {
    if (!forecastResponse?.forecasts || forecastResponse.forecasts.length === 0) {
      return generateFallbackDemandData();
    }

    return forecastResponse.forecasts.slice(0, 7).map((item: ForecastItem) => ({
      date: item.date,
      demand: item.forecasted_occupancy / 100,
      demandLevel: item.demand_level,
      hasEvent: false,
      eventName: undefined
    }));
  }, [forecastResponse]);

  // Generate AI insight based on data
  useEffect(() => {
    const highDays = data.filter(d => d.demand >= 0.8).length;
    if (highDays >= 4) {
      setAiInsight('Strong demand expected this week. Consider increasing rates by 10-15% for peak days to maximize revenue.');
    } else if (highDays >= 2) {
      setAiInsight('Moderate demand expected. Maintain current rates and monitor competitor pricing for optimization opportunities.');
    } else {
      setAiInsight('Lower demand period. Consider promotional rates or package deals to boost occupancy and capture market share.');
    }
  }, [data]);

  const next7Days = useMemo(() => {
    return data.slice(0, 7);
  }, [data]);

  const avgDemand = useMemo(() => {
    if (next7Days.length === 0) return 0;
    return next7Days.reduce((sum, day) => sum + day.demand, 0) / next7Days.length;
  }, [next7Days]);

  const highDemandDays = useMemo(() => {
    return next7Days.filter(d => d.demand >= 0.8).length;
  }, [next7Days]);

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
          <h3 className="text-sm font-semibold text-neutral-800">Upcoming Demand</h3>
          <p className="text-[11px] text-neutral-400 font-medium mt-0.5">Next 7 days forecast</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-[11px] text-neutral-400 font-medium">Avg Demand</p>
            <p className="text-lg font-bold text-neutral-900">{Math.round(avgDemand * 100)}%</p>
          </div>
          <div className="text-right">
            <p className="text-[11px] text-neutral-400 font-medium">High Days</p>
            <p className="text-lg font-bold text-rose-600">{highDemandDays}</p>
          </div>
        </div>
      </div>

      {/* Demand Heatmap */}
      <div className="grid grid-cols-7 gap-2">
        {next7Days.map((day, index) => {
          const { bg, text, label, borderColor } = getDemandColor(day.demand);
          const Icon = getDemandIcon(day.demand);
          const date = new Date(day.date);
          const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
          const dayNum = date.getDate();

          return (
            <div
              key={index}
              className={`rounded-lg p-3 text-center transition-all hover:scale-[1.02] cursor-default border ${bg} ${borderColor} relative`}
            >
              {/* Event indicator */}
              {day.hasEvent && (
                <div className="absolute top-1 right-1">
                  <Calendar className="w-3 h-3 text-terra-600" />
                </div>
              )}
              <p className={`text-[10px] font-medium ${text} opacity-75`}>
                {dayName}
              </p>
              <p className={`text-xl font-bold my-0.5 ${text}`}>
                {dayNum}
              </p>
              <div className="flex items-center justify-center gap-1 mb-1">
                <Icon className={`w-3 h-3 ${text}`} />
                <p className={`text-[13px] font-semibold ${text}`}>
                  {Math.round(day.demand * 100)}%
                </p>
              </div>
              <p className={`text-[10px] font-medium ${text}`}>
                {label}
              </p>
              {day.eventName && (
                <p className="text-[9px] text-terra-600 mt-1 truncate" title={day.eventName}>
                  {day.eventName}
                </p>
              )}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 mt-4 pt-4 border-t border-neutral-100">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-rose-200" />
          <span className="text-[11px] text-neutral-600 font-medium">High ({'>'}80%)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-gold-200" />
          <span className="text-[11px] text-neutral-600 font-medium">Medium (50-80%)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-neutral-200" />
          <span className="text-[11px] text-neutral-600 font-medium">Low ({'<'}50%)</span>
        </div>
      </div>

      {/* AI Insight */}
      <div className="mt-4 p-4 rounded-lg bg-terra-50 border border-terra-100">
        <div className="flex items-start gap-3">
          <div className="w-6 h-6 rounded bg-terra-100 flex items-center justify-center flex-shrink-0 mt-0.5">
            <Sparkles className="w-3.5 h-3.5 text-terra-600" />
          </div>
          <p className="text-[13px] text-terra-800 leading-relaxed">
            <span className="font-semibold">AI Insight:</span>
            {' '}
            {aiInsight}
          </p>
        </div>
      </div>
    </div>
  );
}
