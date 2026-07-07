import { useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { TrendingUp, TrendingDown, Minus, ThumbsUp, ThumbsDown, Meh } from 'lucide-react';

const SENTIMENT_COLORS = {
  positive: '#4E5840',
  negative: '#CDB261',
  neutral: '#C8B29D'
};

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-neutral-200 rounded-[8px] p-3 shadow-lg">
        <p className="text-[11px] font-semibold text-neutral-500 mb-2">{label}</p>
        <div className="space-y-1.5">
          {payload.map((entry, index) => (
            <div key={index} className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-1.5">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: entry.color }}
                />
                <span className="text-[12px] text-neutral-600">{entry.name}</span>
              </div>
              <span className="text-[12px] font-semibold text-neutral-900">{entry.value}%</span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

export default function SentimentTrendChart({ data }) {
  const chartData = useMemo(() => {
    if (!data || data.length === 0) return [];
    return data.map((item) => ({
      ...item,
      date: new Date(item.date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      })
    }));
  }, [data]);

  const avgSentiment = useMemo(() => {
    if (!data || data.length === 0) return 0;
    const total = data.reduce((sum, d) => sum + (d.score || 0), 0);
    return Math.round(total / data.length);
  }, [data]);

  const trend = useMemo(() => {
    if (!data || data.length < 7) return 0;
    const recent = data.slice(-7).reduce((sum, d) => sum + (d.score || 0), 0) / 7;
    const prevSlice = data.slice(-14, -7);
    if (prevSlice.length === 0) return 0;
    const previous = prevSlice.reduce((sum, d) => sum + (d.score || 0), 0) / prevSlice.length;
    return Math.round(recent - previous);
  }, [data]);

  const latestData = useMemo(() => {
    if (!data || data.length === 0) return { positive: 0, negative: 0, neutral: 0 };
    const last = data[data.length - 1];
    if (!last) return { positive: 0, negative: 0, neutral: 0 };
    // Convert raw counts to percentages if needed
    const positive = last.positive || 0;
    const neutral = last.neutral || 0;
    const negative = last.negative || 0;
    const total = positive + neutral + negative;
    if (total === 0) return { positive: 0, negative: 0, neutral: 0 };
    // If values are already percentages (sum ~100), return with guaranteed properties
    if (total >= 90 && total <= 110) {
      return { positive, neutral, negative };
    }
    // Otherwise convert to percentages
    return {
      positive: Math.round(positive / total * 100),
      neutral: Math.round(neutral / total * 100),
      negative: Math.round(negative / total * 100)
    };
  }, [data]);

  const sentimentLabel = avgSentiment >= 70 ? 'Positive' : avgSentiment >= 40 ? 'Neutral' : 'Negative';
  const sentimentColor = avgSentiment >= 70 ? 'text-sage-600' : avgSentiment >= 40 ? 'text-neutral-500' : 'text-gold-600';

  return (
    <div className="bg-white rounded-[10px] overflow-hidden">
      {/* Header */}
      <div className="px-6 py-5 border-b border-neutral-100">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-[15px] font-semibold text-neutral-900">Sentiment Trend</h3>
            <p className="text-[13px] text-neutral-500 mt-0.5">Last 30 days analysis</p>
          </div>
          <div className="flex items-center gap-2">
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg ${
              avgSentiment >= 70 ? 'bg-sage-50' : avgSentiment >= 40 ? 'bg-neutral-100' : 'bg-gold-50'
            }`}>
              <span className={`text-[13px] font-bold ${sentimentColor}`}>{avgSentiment}%</span>
              <span className={`text-[11px] ${sentimentColor}`}>{sentimentLabel}</span>
            </div>
            {trend !== 0 && (
              <div className={`flex items-center gap-1 px-2 py-1.5 rounded-lg ${
                trend > 0 ? 'bg-sage-50' : 'bg-rose-50'
              }`}>
                {trend > 0 ? (
                  <TrendingUp className="w-3.5 h-3.5 text-sage-600" />
                ) : (
                  <TrendingDown className="w-3.5 h-3.5 text-rose-500" />
                )}
                <span className={`text-[11px] font-semibold ${trend > 0 ? 'text-sage-600' : 'text-rose-500'}`}>
                  {trend > 0 ? '+' : ''}{trend}%
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Current Breakdown */}
      <div className="grid grid-cols-3 divide-x divide-neutral-100 border-b border-neutral-100">
        <div className="px-5 py-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-1">
            <ThumbsUp className="w-4 h-4 text-sage-600" />
            <span className="text-[10px] font-semibold uppercase tracking-widest text-neutral-400">Positive</span>
          </div>
          <p className="text-[22px] font-semibold text-sage-600 tracking-tight">{latestData.positive}%</p>
        </div>
        <div className="px-5 py-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-1">
            <Meh className="w-4 h-4 text-neutral-400" />
            <span className="text-[10px] font-semibold uppercase tracking-widest text-neutral-400">Neutral</span>
          </div>
          <p className="text-[22px] font-semibold text-neutral-500 tracking-tight">{latestData.neutral}%</p>
        </div>
        <div className="px-5 py-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-1">
            <ThumbsDown className="w-4 h-4 text-gold-600" />
            <span className="text-[10px] font-semibold uppercase tracking-widest text-neutral-400">Negative</span>
          </div>
          <p className="text-[22px] font-semibold text-gold-600 tracking-tight">{latestData.negative}%</p>
        </div>
      </div>

      {/* Chart */}
      <div className="p-5">
        <div className="h-[220px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 10, fill: '#9CA3AF' }}
                axisLine={false}
                tickLine={false}
                interval="preserveStartEnd"
              />
              <YAxis
                tick={{ fontSize: 10, fill: '#9CA3AF' }}
                axisLine={false}
                tickLine={false}
                domain={[0, 100]}
                tickFormatter={(value) => `${value}%`}
                width={35}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="positive"
                name="Positive"
                stroke={SENTIMENT_COLORS.positive}
                strokeWidth={2.5}
                dot={false}
                activeDot={{ r: 5, fill: SENTIMENT_COLORS.positive, stroke: '#fff', strokeWidth: 2 }}
              />
              <Line
                type="monotone"
                dataKey="neutral"
                name="Neutral"
                stroke={SENTIMENT_COLORS.neutral}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, fill: SENTIMENT_COLORS.neutral, stroke: '#fff', strokeWidth: 2 }}
              />
              <Line
                type="monotone"
                dataKey="negative"
                name="Negative"
                stroke={SENTIMENT_COLORS.negative}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, fill: SENTIMENT_COLORS.negative, stroke: '#fff', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center gap-6 mt-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-1 rounded-full" style={{ backgroundColor: SENTIMENT_COLORS.positive }} />
            <span className="text-[11px] font-medium text-neutral-500">Positive</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-1 rounded-full" style={{ backgroundColor: SENTIMENT_COLORS.neutral }} />
            <span className="text-[11px] font-medium text-neutral-500">Neutral</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-1 rounded-full" style={{ backgroundColor: SENTIMENT_COLORS.negative }} />
            <span className="text-[11px] font-medium text-neutral-500">Negative</span>
          </div>
        </div>
      </div>
    </div>
  );
}
