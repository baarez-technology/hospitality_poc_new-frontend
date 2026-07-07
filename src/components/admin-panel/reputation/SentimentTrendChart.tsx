import { useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { TrendingUp } from 'lucide-react';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-[#E5E5E5] rounded-xl p-3 shadow-lg">
        <p className="text-xs text-neutral-500 mb-2">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} className="text-sm font-semibold" style={{ color: entry.color }}>
            {entry.name}: {entry.value}%
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function SentimentTrendChart({ data }) {
  const chartData = useMemo(() => {
    return data.map((item) => ({
      ...item,
      date: new Date(item.date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      })
    }));
  }, [data]);

  const avgSentiment = useMemo(() => {
    return Math.round(data.reduce((sum, d) => sum + d.score, 0) / data.length);
  }, [data]);

  const trend = useMemo(() => {
    if (data.length < 7) return 0;
    const recent = data.slice(-7).reduce((sum, d) => sum + d.score, 0) / 7;
    const previous = data.slice(-14, -7).reduce((sum, d) => sum + d.score, 0) / 7;
    return Math.round(recent - previous);
  }, [data]);

  return (
    <div className="bg-white rounded-xl border border-[#E5E5E5] p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#4E5840]/10 flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-[#4E5840]" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-neutral-900">Sentiment Trend</h3>
            <p className="text-sm text-neutral-500">Last 30 days analysis</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-xs text-neutral-500">Avg Sentiment</p>
            <p className="text-lg font-bold text-neutral-900">{avgSentiment}%</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-neutral-500">7-Day Change</p>
            <p className={`text-lg font-bold ${trend >= 0 ? 'text-[#4E5840]' : 'text-[#CDB261]'}`}>
              {trend >= 0 ? '+' : ''}{trend}%
            </p>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E5E5" vertical={false} />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 11, fill: '#6B7280' }}
              axisLine={{ stroke: '#E5E5E5' }}
              tickLine={false}
              interval="preserveStartEnd"
            />
            <YAxis
              tick={{ fontSize: 11, fill: '#6B7280' }}
              axisLine={false}
              tickLine={false}
              domain={[0, 100]}
              tickFormatter={(value) => `${value}%`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              verticalAlign="bottom"
              height={36}
              formatter={(value) => (
                <span className="text-xs text-neutral-600">{value}</span>
              )}
            />
            <Line
              type="monotone"
              dataKey="positive"
              name="Positive"
              stroke="#4E5840"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 5, fill: '#4E5840', stroke: '#fff', strokeWidth: 2 }}
            />
            <Line
              type="monotone"
              dataKey="negative"
              name="Negative"
              stroke="#CDB261"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 5, fill: '#CDB261', stroke: '#fff', strokeWidth: 2 }}
            />
            <Line
              type="monotone"
              dataKey="neutral"
              name="Neutral"
              stroke="#C8B29D"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 5, fill: '#C8B29D', stroke: '#fff', strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Legend Summary */}
      <div className="flex items-center justify-center gap-6 mt-4 pt-4 border-t border-neutral-100">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-[#4E5840]" />
          <span className="text-xs text-neutral-600">Positive Reviews</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-[#CDB261]" />
          <span className="text-xs text-neutral-600">Negative Reviews</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-[#C8B29D]" />
          <span className="text-xs text-neutral-600">Neutral Reviews</span>
        </div>
      </div>
    </div>
  );
}
