import { useMemo } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip
} from 'recharts';
import { TrendingUp, Users, AlertCircle, RefreshCw } from 'lucide-react';
import { useSegments } from '../../contexts/RevenueDataContext';
import { useCurrency } from '@/hooks/useCurrency';

// Segment colors mapping
const SEGMENT_COLORS: Record<string, string> = {
  'Corporate': '#A57865',
  'OTA': '#5C9BA4',
  'Direct Web': '#4E5840',
  'Travel Agent': '#CDB261',
  'VIP': '#C8B29D',
  'Walk-in': '#9E9891',
  'Leisure': '#7B9E87',
  'Group': '#8B7355',
  'Government': '#6B7B8C',
  'default': '#A57865'
};

interface SegmentData {
  segment: string;
  value: number;
  bookings: number;
  avgRate: number;
  color: string;
  percentage?: number;
}

interface SegmentPerformance {
  segment_name: string;
  total_revenue: number;
  booking_count: number;
  avg_rate: number;
  revenue_share: number;
}

interface SegmentApiResponse {
  segments: SegmentPerformance[];
  period: {
    start: string;
    end: string;
  };
  totals: {
    revenue: number;
    bookings: number;
  };
}

interface TooltipPayload {
  payload: SegmentData;
}

const CustomTooltip = ({ active, payload, symbol = '₹' }: { active?: boolean; payload?: TooltipPayload[]; symbol?: string }) => {
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
      <div className="bg-white border border-neutral-200 rounded-[10px] p-4 shadow-lg">
        <div className="flex items-center gap-2 mb-2">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: data.color }}
          />
          <p className="text-[13px] font-semibold text-neutral-900">{data.segment}</p>
        </div>
        <p className="text-lg font-bold mb-2" style={{ color: data.color }}>
          {formatCurrencyValue(data.value)}
        </p>
        <div className="space-y-1 text-[11px] text-neutral-500">
          <p>{data.bookings} bookings</p>
          <p>Avg Rate: {symbol}{data.avgRate.toLocaleString()}</p>
        </div>
      </div>
    );
  }
  return null;
};

// Skeleton loader component
const SkeletonLoader = () => (
  <div className="p-6 animate-pulse">
    <div className="mb-6">
      <div className="h-4 bg-neutral-200 rounded w-32 mb-2" />
      <div className="h-3 bg-neutral-200 rounded w-24" />
    </div>
    <div className="flex items-start gap-6">
      <div className="w-[160px] h-[160px] bg-neutral-200 rounded-full" />
      <div className="flex-1 space-y-3 pt-1">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex items-center justify-between py-1.5">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-neutral-200" />
              <div className="h-3 bg-neutral-200 rounded w-20" />
            </div>
            <div className="h-3 bg-neutral-200 rounded w-16" />
          </div>
        ))}
      </div>
    </div>
    <div className="grid grid-cols-3 gap-3 mt-5 pt-4 border-t border-neutral-100">
      {[1, 2, 3].map((i) => (
        <div key={i} className="p-3 rounded-lg bg-neutral-100">
          <div className="h-3 bg-neutral-200 rounded w-16 mb-2" />
          <div className="h-4 bg-neutral-200 rounded w-20" />
        </div>
      ))}
    </div>
  </div>
);

// Error component
const ErrorDisplay = ({ error, onRetry }: { error: string; onRetry: () => void }) => (
  <div className="p-6">
    <div className="flex flex-col items-center justify-center py-8">
      <div className="w-12 h-12 rounded-full bg-rose-100 flex items-center justify-center mb-4">
        <AlertCircle className="w-6 h-6 text-rose-500" />
      </div>
      <p className="text-sm font-medium text-neutral-900 mb-1">Failed to load segment data</p>
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

// No hardcoded fallback — segment data comes exclusively from the backend.
const FALLBACK_SEGMENT_DATA: SegmentData[] = [];

export default function RevenueBySegment() {
  const { data: segmentsResponse, loading, error, refresh } = useSegments();
  const { symbol } = useCurrency();

  const formatCurrencyValue = (value: number) => {
    if (value >= 1000000) {
      return `${symbol}${(value / 1000000).toFixed(1)}M`;
    }
    if (value >= 1000) {
      return `${symbol}${(value / 1000).toFixed(0)}K`;
    }
    return `${symbol}${value.toLocaleString()}`;
  };

  // Transform API response to component format. The service now returns a
  // normalised SegmentPerformance[] (camelCase), so map from those fields.
  const data = useMemo(() => {
    const segments = Array.isArray(segmentsResponse) ? segmentsResponse : [];
    if (segments.length === 0) return FALLBACK_SEGMENT_DATA;

    return segments.map((segment: any): SegmentData => ({
      segment: segment.segmentName || segment.segment_name || 'Unknown',
      value: Number(segment.revenue ?? segment.total_revenue ?? 0),
      bookings: Number(segment.bookings ?? segment.booking_count ?? 0),
      avgRate: Number(segment.adr ?? segment.avg_rate ?? 0),
      color:
        SEGMENT_COLORS[segment.segmentName || segment.segment_name] ||
        SEGMENT_COLORS.default,
      percentage: Number(
        segment.revenueContribution ?? segment.revenue_contribution_pct ?? segment.revenue_share ?? 0
      ),
    }));
  }, [segmentsResponse]);

  const totalRevenue = useMemo(() => {
    return data.reduce((sum, segment) => sum + segment.value, 0);
  }, [data]);

  const totalBookings = useMemo(() => {
    return data.reduce((sum, segment) => sum + segment.bookings, 0);
  }, [data]);

  const sortedByValue = useMemo(() => {
    return [...data].sort((a, b) => b.value - a.value);
  }, [data]);

  const sortedByBookings = useMemo(() => {
    return [...data].sort((a, b) => b.bookings - a.bookings);
  }, [data]);

  const highestAvgRate = useMemo(() => {
    if (data.length === 0) return 0;
    return Math.max(...data.map(d => d.avgRate));
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
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-neutral-800">Revenue by Segment</h3>
        <p className="text-[11px] text-neutral-400 font-medium mt-0.5">{totalBookings.toLocaleString()} total bookings</p>
      </div>

      <div className="flex items-start gap-6">
        {/* Chart */}
        <div className="relative w-[160px] h-[160px] flex-shrink-0">
          <ResponsiveContainer width="100%" height="100%" minWidth={160} minHeight={160}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={75}
                paddingAngle={2}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip symbol={symbol} />} />
            </PieChart>
          </ResponsiveContainer>

          {/* Center Value */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <p className="text-[10px] font-medium text-neutral-400 uppercase tracking-wider">Total</p>
            <p className="text-lg font-bold text-neutral-900">{formatCurrencyValue(totalRevenue)}</p>
          </div>
        </div>

        {/* Legend */}
        <div className="flex-1 space-y-1.5 pt-1">
          {data.map((segment, index) => {
            const percentage = totalRevenue > 0
              ? Math.round((segment.value / totalRevenue) * 100)
              : 0;
            return (
              <div
                key={index}
                className="flex items-center justify-between py-1.5 px-2 rounded-lg hover:bg-neutral-50 transition-colors -mx-2"
              >
                <div className="flex items-center gap-2">
                  <div
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ backgroundColor: segment.color }}
                  />
                  <span className="text-[13px] font-medium text-neutral-700">{segment.segment}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[13px] font-semibold text-neutral-900">
                    {formatCurrencyValue(segment.value)}
                  </span>
                  <span className="text-[10px] font-semibold text-neutral-400 bg-neutral-100 px-1.5 py-0.5 rounded min-w-[32px] text-center">
                    {percentage}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom Stats */}
      <div className="grid grid-cols-3 gap-3 mt-5 pt-4 border-t border-neutral-100">
        <div className="p-3 rounded-lg bg-neutral-50">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-5 h-5 rounded bg-terra-100 flex items-center justify-center">
              <TrendingUp className="w-3 h-3 text-terra-600" />
            </div>
            <p className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider">Top Segment</p>
          </div>
          <p className="text-[13px] font-bold" style={{ color: sortedByValue[0]?.color }}>
            {sortedByValue[0]?.segment || '-'}
          </p>
        </div>

        <div className="p-3 rounded-lg bg-neutral-50">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-5 h-5 rounded bg-ocean-100 flex items-center justify-center">
              <span className="text-xs font-bold text-ocean-600">{symbol}</span>
            </div>
            <p className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider">Peak Rate</p>
          </div>
          <p className="text-[13px] font-bold text-neutral-900">
            {symbol}{highestAvgRate.toLocaleString()}
          </p>
        </div>

        <div className="p-3 rounded-lg bg-neutral-50">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-5 h-5 rounded bg-gold-100 flex items-center justify-center">
              <Users className="w-3 h-3 text-gold-600" />
            </div>
            <p className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider">Most Bookings</p>
          </div>
          <p className="text-[13px] font-bold text-neutral-900">
            {sortedByBookings[0]?.segment || '-'}
          </p>
        </div>
      </div>
    </div>
  );
}
