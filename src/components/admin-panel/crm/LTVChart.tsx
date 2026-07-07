import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useCurrency } from '@/hooks/useCurrency';

export default function LTVChart({ data: rawData }) {
  const { symbol } = useCurrency();
  // Ensure data is valid
  const data = rawData && rawData.length > 0 ? rawData : [
    { month: 'N/A', avgLTV: 0, vipLTV: 0, frequentLTV: 0, occasionalLTV: 0 }
  ];
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white px-4 py-3 rounded-xl shadow-lg border border-neutral-200">
          <p className="font-semibold text-neutral-900 mb-2">{label}</p>
          {payload.map((entry, index) => (
            <div key={index} className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: entry.color }}
                />
                <span className="text-sm text-neutral-600">{entry.name}:</span>
              </div>
              <span className="text-sm font-semibold text-neutral-900">
                {symbol}{entry.value.toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-xl p-6 border border-neutral-200">
      {/* Header */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-neutral-900 mb-1">Lifetime Value Trends</h3>
        <p className="text-sm text-neutral-600">Average LTV by segment over time</p>
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={350}>
        <BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
          <XAxis
            dataKey="month"
            stroke="#9CA3AF"
            style={{ fontSize: '12px' }}
          />
          <YAxis
            stroke="#9CA3AF"
            style={{ fontSize: '12px' }}
            tickFormatter={(value) => `${symbol}${value}`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{ fontSize: '14px', paddingTop: '20px' }}
            iconType="circle"
          />
          <Bar
            dataKey="avgLTV"
            name="Avg LTV"
            fill="#8B5CF6"
            radius={[8, 8, 0, 0]}
          />
          <Bar
            dataKey="vipLTV"
            name="VIP LTV"
            fill="#EC4899"
            radius={[8, 8, 0, 0]}
          />
          <Bar
            dataKey="frequentLTV"
            name="Frequent LTV"
            fill="#3B82F6"
            radius={[8, 8, 0, 0]}
          />
          <Bar
            dataKey="occasionalLTV"
            name="Occasional LTV"
            fill="#10B981"
            radius={[8, 8, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>

      {/* LTV Breakdown */}
      <div className="mt-6 pt-6 border-t border-neutral-200 grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="text-center">
          <p className="text-2xl font-bold text-[#A57865]">
            {symbol}{(data[data.length - 2]?.avgLTV || data[0]?.avgLTV || 0).toLocaleString()}
          </p>
          <p className="text-xs text-neutral-600 mt-1">Average LTV</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-pink-600">
            {symbol}{(data[data.length - 2]?.vipLTV || data[0]?.vipLTV || 0).toLocaleString()}
          </p>
          <p className="text-xs text-neutral-600 mt-1">VIP Segment</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-blue-600">
            {symbol}{(data[data.length - 2]?.frequentLTV || data[0]?.frequentLTV || 0).toLocaleString()}
          </p>
          <p className="text-xs text-neutral-600 mt-1">Frequent Segment</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-[#4E5840]">
            {symbol}{(data[data.length - 2]?.occasionalLTV || data[0]?.occasionalLTV || 0).toLocaleString()}
          </p>
          <p className="text-xs text-neutral-600 mt-1">Occasional Segment</p>
        </div>
      </div>
    </div>
  );
}
