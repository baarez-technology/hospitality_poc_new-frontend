import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { TrendingUp } from 'lucide-react';
import { useCurrency } from '@/hooks/useCurrency';

export default function OccupancyRevenueChart({ data, dateRange = '7d', onRangeChange }) {
  const { symbol } = useCurrency();

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white px-4 py-3 rounded-xl shadow-lg border border-neutral-200/80">
          <p className="text-xs font-bold text-neutral-900 mb-2.5">{label}</p>
          {payload.map((entry, index) => (
            <div key={index} className="flex items-center justify-between gap-4 mb-1 last:mb-0">
              <div className="flex items-center gap-2">
                <div
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: entry.color }}
                />
                <span className="text-xs text-neutral-600 font-medium">
                  {entry.name}
                </span>
              </div>
              <span className="text-xs font-bold text-neutral-900">
                {entry.name === 'Revenue'
                  ? `${symbol}${entry.value.toLocaleString()}`
                  : `${entry.value}%`}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };
  const rangeLabels = {
    '7d': 'Last 7 days',
    '14d': 'Last 14 days',
    '30d': 'Last 30 days',
    '90d': 'Last 90 days',
  };

  return (
    <div className="bg-white rounded-2xl p-6 border border-neutral-200/60 hover:border-[#A57865]/30 transition-all duration-300 ease-out group">
      {/* Header */}
      <div className="mb-6 flex items-start justify-between">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-[#A57865]/10 rounded-lg group-hover:scale-105 transition-transform duration-200">
            <TrendingUp className="w-4 h-4 text-[#A57865]" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-neutral-900 mb-1">
              Occupancy & Revenue Trends
            </h3>
            <p className="text-xs text-neutral-600 font-medium">{rangeLabels[dateRange]} performance overview</p>
          </div>
        </div>
        {onRangeChange && (
          <select
            value={dateRange}
            onChange={(e) => onRangeChange(e.target.value)}
            className="appearance-none px-4 py-2 pr-10 bg-white border border-neutral-200/60 rounded-lg text-xs font-semibold text-neutral-700 hover:bg-neutral-50 hover:border-[#A57865]/30 focus:outline-none focus:ring-2 focus:ring-[#A57865]/30 focus:border-[#A57865] transition-all duration-200 cursor-pointer bg-[url('data:image/svg+xml;charset=UTF-8,%3csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 24 24%27 fill=%27none%27 stroke=%27%23525252%27 stroke-width=%272%27 stroke-linecap=%27round%27 stroke-linejoin=%27round%27%3e%3cpolyline points=%276 9 12 15 18 9%27%3e%3c/polyline%3e%3c/svg%3e')] bg-[length:18px_18px] bg-[right_0.5rem_center] bg-no-repeat"
          >
            <option value="7d">7 Days</option>
            <option value="14d">14 Days</option>
            <option value="30d">30 Days</option>
            <option value="90d">90 Days</option>
          </select>
        )}
      </div>

      {/* Chart */}
      <div className="h-[360px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
            <XAxis
              dataKey="date"
              stroke="#9CA3AF"
              style={{ fontSize: '11px', fontFamily: 'Inter', fontWeight: 500 }}
              tickLine={false}
              axisLine={{ stroke: '#E5E7EB' }}
            />
            <YAxis
              stroke="#9CA3AF"
              style={{ fontSize: '11px', fontFamily: 'Inter', fontWeight: 500 }}
              yAxisId="left"
              tickLine={false}
              axisLine={{ stroke: '#E5E7EB' }}
            />
            <YAxis
              stroke="#9CA3AF"
              style={{ fontSize: '11px', fontFamily: 'Inter', fontWeight: 500 }}
              yAxisId="right"
              orientation="right"
              tickLine={false}
              axisLine={{ stroke: '#E5E7EB' }}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#A57865', strokeWidth: 1, strokeDasharray: '3 3' }} />
            <Legend
              wrapperStyle={{ fontSize: '11px', fontFamily: 'Inter', fontWeight: 600 }}
              iconType="circle"
              iconSize={8}
            />
            <Area
              yAxisId="left"
              type="monotone"
              dataKey="occupancy"
              stroke="#4E5840"
              strokeWidth={2.5}
              fill="#4E5840"
              fillOpacity={0.08}
              name="Occupancy"
            />
            <Area
              yAxisId="right"
              type="monotone"
              dataKey="revenue"
              stroke="#A57865"
              strokeWidth={2.5}
              fill="#A57865"
              fillOpacity={0.08}
              name="Revenue"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
