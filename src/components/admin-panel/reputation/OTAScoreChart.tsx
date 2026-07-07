import { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';
import { Globe, TrendingUp, TrendingDown, Minus } from 'lucide-react';

const OTA_COLORS = {
  Google: '#4285F4',
  Booking: '#003580',
  Expedia: '#FFCC00',
  Tripadvisor: '#34E0A1',
  Agoda: '#5C2D91'
};

const OTA_DISPLAY_NAMES = {
  google: 'Google',
  booking: 'Booking.com',
  expedia: 'Expedia',
  tripadvisor: 'Tripadvisor',
  agoda: 'Agoda'
};

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white border border-[#E5E5E5] rounded-xl p-3 shadow-lg">
        <p className="text-sm font-semibold text-neutral-900 mb-1">{data.name}</p>
        <p className="text-lg font-bold" style={{ color: data.color }}>
          {data.rating.toFixed(1)} / 5.0
        </p>
        <p className="text-xs text-neutral-500 mt-1">
          {data.reviews.toLocaleString()} reviews
        </p>
        <div className="flex items-center gap-1 mt-1">
          {data.trend > 0 ? (
            <TrendingUp className="w-3 h-3 text-[#4E5840]" />
          ) : data.trend < 0 ? (
            <TrendingDown className="w-3 h-3 text-[#CDB261]" />
          ) : (
            <Minus className="w-3 h-3 text-[#C8B29D]" />
          )}
          <span className={`text-xs font-medium ${
            data.trend > 0 ? 'text-[#4E5840]' : data.trend < 0 ? 'text-[#CDB261]' : 'text-[#C8B29D]'
          }`}>
            {data.trend > 0 ? '+' : ''}{data.trend.toFixed(1)} vs last month
          </span>
        </div>
      </div>
    );
  }
  return null;
};

export default function OTAScoreChart({ data }) {
  const chartData = useMemo(() => {
    return Object.entries(data).map(([key, value]) => ({
      id: key,
      name: OTA_DISPLAY_NAMES[key] || key,
      rating: value.rating,
      reviews: value.reviews,
      trend: value.trend,
      color: OTA_COLORS[OTA_DISPLAY_NAMES[key]] || '#A57865'
    })).sort((a, b) => b.rating - a.rating);
  }, [data]);

  const avgRating = useMemo(() => {
    const total = chartData.reduce((sum, item) => sum + item.rating, 0);
    return (total / chartData.length).toFixed(1);
  }, [chartData]);

  const totalReviews = useMemo(() => {
    return chartData.reduce((sum, item) => sum + item.reviews, 0);
  }, [chartData]);

  return (
    <div className="bg-white rounded-xl border border-[#E5E5E5] p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#A57865]/10 flex items-center justify-center">
            <Globe className="w-5 h-5 text-[#A57865]" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-neutral-900">OTA Score Analytics</h3>
            <p className="text-sm text-neutral-500">Platform ratings overview</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-xs text-neutral-500">Avg Rating</p>
            <p className="text-lg font-bold text-[#A57865]">{avgRating}/5</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-neutral-500">Total Reviews</p>
            <p className="text-lg font-bold text-neutral-900">{totalReviews.toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="h-[250px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 10, right: 30, left: 80, bottom: 10 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E5E5" horizontal={true} vertical={false} />
            <XAxis
              type="number"
              domain={[0, 5]}
              tick={{ fontSize: 11, fill: '#6B7280' }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(value) => value.toFixed(1)}
            />
            <YAxis
              type="category"
              dataKey="name"
              tick={{ fontSize: 12, fill: '#1A1A1A', fontWeight: 500 }}
              axisLine={false}
              tickLine={false}
              width={75}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: '#FAF7F4' }} />
            <Bar
              dataKey="rating"
              radius={[0, 4, 4, 0]}
              barSize={24}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Platform Details */}
      <div className="grid grid-cols-5 gap-3 mt-4 pt-4 border-t border-neutral-100">
        {chartData.map((platform) => (
          <div key={platform.id} className="text-center">
            <div
              className="w-8 h-8 rounded-lg mx-auto mb-2 flex items-center justify-center text-white text-xs font-bold"
              style={{ backgroundColor: platform.color }}
            >
              {platform.name.charAt(0)}
            </div>
            <p className="text-xs text-neutral-600 truncate">{platform.name}</p>
            <div className="flex items-center justify-center gap-1 mt-1">
              {platform.trend > 0 ? (
                <TrendingUp className="w-3 h-3 text-[#4E5840]" />
              ) : platform.trend < 0 ? (
                <TrendingDown className="w-3 h-3 text-[#CDB261]" />
              ) : (
                <Minus className="w-3 h-3 text-[#C8B29D]" />
              )}
              <span className={`text-xs font-medium ${
                platform.trend > 0 ? 'text-[#4E5840]' : platform.trend < 0 ? 'text-[#CDB261]' : 'text-[#C8B29D]'
              }`}>
                {platform.trend > 0 ? '+' : ''}{platform.trend.toFixed(1)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
