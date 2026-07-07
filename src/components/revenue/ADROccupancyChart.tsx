import { useMemo } from 'react';
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { RefreshCw } from 'lucide-react';
import { useForecast, useKPISummary } from '../../contexts/RevenueDataContext';
import { useCurrency } from '@/hooks/useCurrency';

interface ChartDataItem {
  date: string;
  adr: number;
  occupancy: number;
}

export default function ADROccupancyChart() {
  const { symbol } = useCurrency();

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white border border-neutral-200 rounded-[10px] p-3 shadow-lg">
          <p className="text-[11px] text-neutral-500 font-medium mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm font-semibold" style={{ color: entry.color }}>
              {entry.name}: {entry.name === 'ADR' ? `${symbol}${entry.value.toLocaleString()}` : `${entry.value}%`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };
  const { data: forecastResponse, loading: forecastLoading, error: forecastError, refresh } = useForecast();
  const { data: kpiSummary, loading: kpiLoading } = useKPISummary();

  const isLoading = forecastLoading || kpiLoading;
  const error = forecastError;

  // Transform API data to chart format
  const data = useMemo(() => {
    if (!forecastResponse?.forecasts) return [];

    // Use the real today ADR from KPI summary. No hardcoded fallback — when
    // there's no actual booking data the chart should show ₹0 / 0%, not an
    // invented 150 baseline multiplied by demand factors.
    const baseADR = kpiSummary?.today?.adr ?? 0;

    const demandMultipliers: Record<string, number> = {
      critical: 1.3,
      high: 1.15,
      moderate: 1.0,
      low: 0.9,
      very_low: 0.8,
      none: 0,
    };

    return forecastResponse.forecasts.map((item) => ({
      date: item.date,
      adr: baseADR > 0
        ? Math.round(baseADR * (demandMultipliers[item.demand_level] ?? 1.0))
        : 0,
      occupancy: Math.round(item.forecasted_occupancy),
    }));
  }, [forecastResponse, kpiSummary]);

  const chartData = useMemo(() => {
    return data.map((item) => ({
      ...item,
      date: new Date(item.date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      })
    }));
  }, [data]);

  const avgADR = useMemo(() => {
    if (data.length === 0) return 0;
    return Math.round(data.reduce((sum, item) => sum + item.adr, 0) / data.length);
  }, [data]);

  const avgOccupancy = useMemo(() => {
    if (data.length === 0) return 0;
    return Math.round(data.reduce((sum, item) => sum + item.occupancy, 0) / data.length);
  }, [data]);

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="h-4 w-32 bg-neutral-200 rounded animate-pulse" />
            <div className="h-3 w-40 bg-neutral-100 rounded animate-pulse mt-2" />
          </div>
          <div className="flex items-center gap-4">
            <div className="h-10 w-20 bg-neutral-100 rounded animate-pulse" />
            <div className="h-10 w-20 bg-neutral-100 rounded animate-pulse" />
          </div>
        </div>
        <div className="h-[260px] bg-neutral-100 rounded-lg animate-pulse" />
      </div>
    );
  }

  // Error state
  if (error && data.length === 0) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-sm font-semibold text-neutral-800">ADR & Occupancy</h3>
            <p className="text-[11px] text-neutral-400 font-medium mt-0.5">Rate vs occupancy performance</p>
          </div>
        </div>
        <div className="h-[260px] flex items-center justify-center">
          <div className="text-center">
            <p className="text-sm text-neutral-500 mb-4">{error}</p>
            <button
              onClick={refresh}
              className="inline-flex items-center gap-2 px-4 py-2 bg-neutral-100 text-neutral-700 rounded-lg hover:bg-neutral-200 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Empty state
  if (data.length === 0) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-sm font-semibold text-neutral-800">ADR & Occupancy</h3>
            <p className="text-[11px] text-neutral-400 font-medium mt-0.5">Rate vs occupancy performance</p>
          </div>
        </div>
        <div className="h-[260px] flex items-center justify-center">
          <p className="text-sm text-neutral-500">No forecast data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-sm font-semibold text-neutral-800">ADR & Occupancy</h3>
          <p className="text-[11px] text-neutral-400 font-medium mt-0.5">Rate vs occupancy performance</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-[11px] text-neutral-400 font-medium">Avg ADR</p>
            <p className="text-lg font-bold text-ocean-600">{symbol}{avgADR.toLocaleString()}</p>
          </div>
          <div className="text-right">
            <p className="text-[11px] text-neutral-400 font-medium">Avg Occupancy</p>
            <p className="text-lg font-bold text-terra-600">{avgOccupancy}%</p>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="h-[260px]">
        <ResponsiveContainer width="100%" height="100%" minHeight={260}>
          <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E4E0" vertical={false} />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 11, fill: '#9ca3af' }}
              axisLine={{ stroke: '#E5E4E0' }}
              tickLine={false}
              dy={10}
            />
            <YAxis
              yAxisId="left"
              orientation="left"
              tick={{ fontSize: 11, fill: '#9ca3af' }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(value) => `${symbol}${(value / 1000).toFixed(0)}K`}
              domain={['dataMin - 1000', 'dataMax + 1000']}
              dx={-5}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              tick={{ fontSize: 11, fill: '#9ca3af' }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(value) => `${value}%`}
              domain={[0, 100]}
              dx={5}
            />
            <Tooltip content={<CustomTooltip />} />

            <Bar
              yAxisId="left"
              dataKey="adr"
              name="ADR"
              fill="#5C9BA4"
              radius={[4, 4, 0, 0]}
              barSize={18}
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="occupancy"
              name="Occupancy"
              stroke="#A57865"
              strokeWidth={2.5}
              dot={false}
              activeDot={{ r: 5, fill: '#A57865', stroke: '#fff', strokeWidth: 2 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-4 gap-3 mt-4 pt-4 border-t border-neutral-100">
        <div className="p-3 rounded-lg bg-neutral-50 text-center">
          <p className="text-[10px] text-neutral-400 font-medium uppercase tracking-wider">Peak ADR</p>
          <p className="text-[15px] font-bold text-ocean-600 mt-1">
            {symbol}{Math.max(...data.map(d => d.adr)).toLocaleString()}
          </p>
        </div>
        <div className="p-3 rounded-lg bg-neutral-50 text-center">
          <p className="text-[10px] text-neutral-400 font-medium uppercase tracking-wider">Low ADR</p>
          <p className="text-[15px] font-bold text-neutral-600 mt-1">
            {symbol}{Math.min(...data.map(d => d.adr)).toLocaleString()}
          </p>
        </div>
        <div className="p-3 rounded-lg bg-neutral-50 text-center">
          <p className="text-[10px] text-neutral-400 font-medium uppercase tracking-wider">Peak Occ</p>
          <p className="text-[15px] font-bold text-terra-600 mt-1">
            {Math.max(...data.map(d => d.occupancy))}%
          </p>
        </div>
        <div className="p-3 rounded-lg bg-neutral-50 text-center">
          <p className="text-[10px] text-neutral-400 font-medium uppercase tracking-wider">Low Occ</p>
          <p className="text-[15px] font-bold text-neutral-600 mt-1">
            {Math.min(...data.map(d => d.occupancy))}%
          </p>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 mt-4">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-sm bg-ocean-500" />
          <span className="text-[11px] text-neutral-600 font-medium">ADR</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-0.5 bg-terra-500" style={{ borderStyle: 'solid', borderWidth: '1.5px', borderColor: '#A57865' }} />
          <span className="text-[11px] text-neutral-600 font-medium">Occupancy</span>
        </div>
      </div>
    </div>
  );
}
