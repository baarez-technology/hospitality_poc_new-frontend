import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { ThumbsUp, Minus, ThumbsDown } from 'lucide-react';

// Default colors for sentiment types
const DEFAULT_COLORS = {
  Positive: '#4E5840',
  Negative: '#DC2626',
  Neutral: '#D97706',
};

const DEFAULT_SENTIMENT_DATA = [
  { sentiment: 'Positive', count: 0, percentage: 0, trend: '+0%', color: DEFAULT_COLORS.Positive },
  { sentiment: 'Neutral', count: 0, percentage: 0, trend: '+0%', color: DEFAULT_COLORS.Neutral },
  { sentiment: 'Negative', count: 0, percentage: 0, trend: '+0%', color: DEFAULT_COLORS.Negative },
];

export default function SentimentChart({ sentimentData: rawData }) {
  // Ensure data is valid and has colors
  const sentimentData = (rawData && rawData.length > 0 ? rawData : DEFAULT_SENTIMENT_DATA).map(item => ({
    ...item,
    color: item.color || DEFAULT_COLORS[item.sentiment] || '#6B7280',
    trend: item.trend || '+0%',
  }));
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;

      return (
        <div className="bg-white p-4 rounded-xl shadow-lg border border-neutral-200">
          <p className="font-semibold text-neutral-900 mb-2">{data.sentiment}</p>
          <div className="space-y-1">
            <p className="text-sm text-neutral-700">
              <span className="font-medium">Count:</span> {data.count} reviews
            </p>
            <p className="text-sm text-neutral-700">
              <span className="font-medium">Percentage:</span> {data.percentage}%
            </p>
            <p className="text-sm text-neutral-600">
              <span className="font-medium">Trend:</span> {data.trend}
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percentage }) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? 'start' : 'end'}
        dominantBaseline="central"
        className="font-bold text-sm"
      >
        {`${percentage}%`}
      </text>
    );
  };

  const getIcon = (sentiment) => {
    switch (sentiment) {
      case 'Positive':
        return <ThumbsUp className="w-4 h-4" />;
      case 'Negative':
        return <ThumbsDown className="w-4 h-4" />;
      default:
        return <Minus className="w-4 h-4" />;
    }
  };

  return (
    <div className="bg-white rounded-xl p-6 border border-neutral-200">
      <div className="mb-6">
        <h3 className="text-xl font-serif font-semibold text-neutral-900 mb-1">
          Sentiment Analysis
        </h3>
        <p className="text-sm text-neutral-600">
          Overall sentiment distribution across all reviews
        </p>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={sentimentData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={renderCustomLabel}
            outerRadius={120}
            dataKey="count"
          >
            {sentimentData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>

      {/* Legend */}
      <div className="grid grid-cols-3 gap-3 mt-6">
        {sentimentData.map((item, index) => (
          <div
            key={index}
            className="p-3 rounded-xl border-2"
            style={{ borderColor: item.color, backgroundColor: `${item.color}15` }}
          >
            <div className="flex items-center gap-2 mb-2" style={{ color: item.color }}>
              {getIcon(item.sentiment)}
              <span className="text-xs font-semibold uppercase">{item.sentiment}</span>
            </div>
            <p className="text-2xl font-bold text-neutral-900 mb-1">{item.count}</p>
            <div className="flex items-center justify-between">
              <span className="text-sm text-neutral-600">{item.percentage}%</span>
              <span className={`text-xs font-semibold ${
                item.trend.startsWith('+') ? 'text-[#4E5840]' : 'text-red-600'
              }`}>
                {item.trend}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
