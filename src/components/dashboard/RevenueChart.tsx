import { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { TrendingUp } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useCurrency } from '@/hooks/useCurrency';

/**
 * RevenueChart - Premium bar chart with gradient fills
 * Features: Dual bars, custom tooltip, legend, gradient fills
 */

const CustomTooltip = ({ active, payload, label, symbol = '₹' }) => {
  if (!active || !payload?.length) return null;

  return (
    <div className={cn(
      "bg-white/95 backdrop-blur-sm rounded-xl px-4 py-3",
      "border border-neutral-100",
      "shadow-xl shadow-neutral-900/10"
    )}>
      <p className="text-sm font-semibold text-neutral-900 mb-2">{label}</p>
      <div className="space-y-1">
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: entry.fill === 'url(#revenueGradient)' ? '#A57865' : '#E7E5E4' }}
              />
              <span className="text-xs text-neutral-500">
                {entry.dataKey === 'revenue' ? 'This Week' : 'Last Week'}
              </span>
            </div>
            <span className="text-xs font-semibold text-neutral-900">
              {symbol}{entry.value?.toLocaleString()}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default function RevenueChart({ data, className }) {
  const { symbol } = useCurrency();
  const totalRevenue = useMemo(() => {
    return data?.reduce((sum, item) => sum + (item.revenue || 0), 0) || 0;
  }, [data]);

  const avgRevenue = useMemo(() => {
    return data?.length ? Math.round(totalRevenue / data.length) : 0;
  }, [data, totalRevenue]);

  return (
    <div className={cn(
      "bg-white rounded-2xl border border-neutral-100",
      "shadow-sm hover:shadow-lg transition-all duration-300",
      "overflow-hidden",
      className
    )}>
      {/* Header */}
      <div className="px-6 py-4 border-b border-neutral-100">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-sm font-semibold text-neutral-900">Revenue Analytics</h3>
            <p className="text-xs text-neutral-400 mt-0.5">Weekly performance comparison</p>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-1 text-emerald-600">
              <TrendingUp className="w-4 h-4" />
              <span className="text-sm font-semibold">+12.5%</span>
            </div>
            <p className="text-xs text-neutral-400 mt-0.5">vs last week</p>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-6 mt-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-gradient-to-b from-terra-400 to-terra-600" />
            <span className="text-xs text-neutral-500">This Week</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-neutral-200" />
            <span className="text-xs text-neutral-500">Last Week</span>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="p-6">
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} barGap={6} margin={{ top: 10, right: 10, bottom: 0, left: -10 }}>
              <defs>
                <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#A57865" stopOpacity={1} />
                  <stop offset="100%" stopColor="#8B6450" stopOpacity={1} />
                </linearGradient>
                <linearGradient id="lastWeekGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#E7E5E4" stopOpacity={1} />
                  <stop offset="100%" stopColor="#D6D3D1" stopOpacity={1} />
                </linearGradient>
              </defs>

              <XAxis
                dataKey="day"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: '#78716C', fontWeight: 500 }}
                dy={10}
              />

              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fill: '#A8A29E' }}
                tickFormatter={(value) => `${symbol}${(value / 1000).toFixed(0)}k`}
                width={45}
              />

              <Tooltip
                content={<CustomTooltip symbol={symbol} />}
                cursor={{ fill: 'rgba(165, 120, 101, 0.05)', radius: 8 }}
              />

              <Bar
                dataKey="lastWeek"
                fill="url(#lastWeekGradient)"
                radius={[6, 6, 0, 0]}
                maxBarSize={32}
              />

              <Bar
                dataKey="revenue"
                fill="url(#revenueGradient)"
                radius={[6, 6, 0, 0]}
                maxBarSize={32}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Summary stats */}
        <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-neutral-100">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-neutral-400 mb-1">
              Total Revenue
            </p>
            <p className="text-xl font-semibold text-neutral-900">
              ${totalRevenue.toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-neutral-400 mb-1">
              Daily Average
            </p>
            <p className="text-xl font-semibold text-neutral-900">
              ${avgRevenue.toLocaleString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
