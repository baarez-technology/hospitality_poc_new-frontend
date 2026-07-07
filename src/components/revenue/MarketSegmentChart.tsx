import { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { RefreshCw, AlertCircle } from 'lucide-react';
import { Button } from '../ui2/Button';
import { SegmentPerformance } from '../../api/services/revenue-intelligence.service';
import { useSegments } from '../../contexts/RevenueDataContext';

// Segment color palette
const SEGMENT_COLORS = [
  '#A57865', // terra
  '#4E5840', // sage
  '#5C9BA4', // ocean
  '#CDB261', // gold
  '#8B5CF6', // violet
  '#F43F5E', // rose
  '#10B981', // emerald
  '#F59E0B', // amber
];

// No hardcoded fallback segments — the chart now relies entirely on API data
// and shows an empty state when the backend returns no segments.
const FALLBACK_SEGMENTS: SegmentData[] = [];

interface SegmentData {
  id: string;
  name: string;
  revenue: number;
  rooms: number;
  adr: number;
  percentage: number;
  color: string;
  trend: number;
}

// Skeleton loader component
function SkeletonLoader() {
  return (
    <div className="bg-white rounded-xl p-6 border border-neutral-200 animate-pulse">
      <div className="mb-6">
        <div className="h-6 w-40 bg-neutral-200 rounded mb-2" />
        <div className="h-4 w-64 bg-neutral-100 rounded" />
      </div>
      <div className="flex justify-center">
        <div className="w-60 h-60 bg-neutral-100 rounded-full" />
      </div>
      <div className="grid grid-cols-2 gap-4 mt-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="p-4 bg-neutral-50 rounded-xl">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-3 h-3 bg-neutral-200 rounded-full" />
              <div className="h-4 w-20 bg-neutral-200 rounded" />
            </div>
            <div className="h-6 w-16 bg-neutral-200 rounded mb-1" />
            <div className="flex justify-between">
              <div className="h-3 w-12 bg-neutral-100 rounded" />
              <div className="h-3 w-16 bg-neutral-100 rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Error display component
function ErrorDisplay({ error, onRetry }: { error: string; onRetry: () => void }) {
  return (
    <div className="bg-white rounded-xl p-6 border border-neutral-200">
      <div className="mb-6">
        <h3 className="text-xl font-sans font-semibold text-neutral-900 mb-1">
          Market Segments
        </h3>
        <p className="text-sm text-neutral-600">
          Revenue distribution by customer segment
        </p>
      </div>
      <div className="py-12 flex flex-col items-center justify-center">
        <AlertCircle className="w-12 h-12 text-rose-400 mb-4" />
        <p className="text-neutral-600 mb-4 text-center">{error}</p>
        <Button variant="outline" icon={RefreshCw} onClick={onRetry}>
          Try Again
        </Button>
      </div>
    </div>
  );
}

export default function MarketSegmentChart() {
  const { data: apiSegments, loading, error, refresh } = useSegments();

  // Transform API data to chart format (normalize: API may return array or { segments: [] })
  const segmentsData: SegmentData[] = useMemo(() => {
    const list = Array.isArray(apiSegments)
      ? apiSegments
      : (apiSegments && typeof apiSegments === 'object' && Array.isArray((apiSegments as { segments?: unknown }).segments))
        ? (apiSegments as { segments: SegmentPerformance[] }).segments
        : [];
    if (list.length === 0) {
      return FALLBACK_SEGMENTS;
    }

    const totalRevenue = list.reduce((sum, s) => sum + (s?.revenue ?? 0), 0);

    return list.map((segment, index) => ({
      id: segment?.segmentId ?? `seg-${index}`,
      name: segment?.segmentName ?? 'Unknown',
      revenue: segment?.revenue ?? 0,
      rooms: segment?.bookings ?? 0,
      adr: segment?.adr ?? 0,
      percentage: totalRevenue > 0 ? parseFloat((((segment?.revenue ?? 0) / totalRevenue) * 100).toFixed(1)) : 0,
      color: SEGMENT_COLORS[index % SEGMENT_COLORS.length],
      trend: segment?.trend ?? 0,
    }));
  }, [apiSegments]);

  const totalRevenue = useMemo(() => {
    return segmentsData.reduce((sum, segment) => sum + segment.revenue, 0);
  }, [segmentsData]);

  const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ payload: SegmentData }> }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;

      return (
        <div className="bg-white p-4 rounded-xl shadow-lg border border-neutral-200">
          <p className="font-semibold text-neutral-900 mb-2">{data.name}</p>
          <div className="space-y-1">
            <p className="text-sm text-neutral-700">
              <span className="font-medium">Revenue:</span> ₹{data.revenue.toLocaleString()}
            </p>
            <p className="text-sm text-neutral-700">
              <span className="font-medium">Rooms:</span> {data.rooms.toLocaleString()}
            </p>
            <p className="text-sm text-neutral-700">
              <span className="font-medium">ADR:</span> ₹{data.adr}
            </p>
            <p className={`text-sm font-semibold mt-2 ${data.trend >= 0 ? 'text-[#4E5840]' : 'text-rose-600'}`}>
              {data.trend >= 0 ? '+' : ''}{data.trend.toFixed(1)}% trend
            </p>
            <p className="text-sm font-semibold text-[#A57865] mt-1">
              {data.percentage}% of total
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percentage }: {
    cx: number;
    cy: number;
    midAngle: number;
    innerRadius: number;
    outerRadius: number;
    percentage: number;
  }) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    // Only show label if percentage is large enough
    if (percentage < 8) return null;

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor="middle"
        dominantBaseline="central"
        className="text-sm font-bold"
      >
        {`${percentage}%`}
      </text>
    );
  };

  if (loading) {
    return <SkeletonLoader />;
  }

  if (error && !apiSegments) {
    return <ErrorDisplay error={error} onRetry={refresh} />;
  }

  return (
    <div className="bg-white rounded-xl p-6 border border-neutral-200">
      <div className="mb-6">
        <h3 className="text-xl font-sans font-semibold text-neutral-900 mb-1">
          Market Segments
        </h3>
        <p className="text-sm text-neutral-600">
          Revenue distribution by customer segment
        </p>
        {error && (
          <p className="text-xs text-amber-600 mt-1 flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            {error}
          </p>
        )}
      </div>

      <ResponsiveContainer width="100%" height={350}>
        <PieChart>
          <Pie
            data={segmentsData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={renderCustomLabel}
            outerRadius={120}
            fill="#8884d8"
            dataKey="revenue"
          >
            {segmentsData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>

      {/* Legend with details */}
      <div className="grid grid-cols-2 gap-4 mt-6">
        {segmentsData.map((segment) => (
          <div key={segment.id} className="p-4 bg-[#FAF8F6] rounded-xl">
            <div className="flex items-center gap-2 mb-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: segment.color }}
              />
              <span className="text-sm font-semibold text-neutral-900">{segment.name}</span>
              <span className={`text-xs font-medium ml-auto ${segment.trend >= 0 ? 'text-[#4E5840]' : 'text-rose-600'}`}>
                {segment.trend >= 0 ? '+' : ''}{segment.trend.toFixed(1)}%
              </span>
            </div>
            <p className="text-xl font-bold text-neutral-900 mb-1">
              ₹{(segment.revenue / 1000).toFixed(0)}K
            </p>
            <div className="flex items-center justify-between text-xs text-neutral-600">
              <span>{segment.rooms} rooms</span>
              <span>ADR ₹{segment.adr}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Total */}
      <div className="mt-6 pt-6 border-t border-neutral-200 text-center">
        <p className="text-sm text-neutral-600 mb-1">Total Revenue</p>
        <p className="text-3xl font-bold text-[#A57865]">
          ₹{(totalRevenue / 1000).toFixed(0)}K
        </p>
      </div>
    </div>
  );
}
