import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

export default function SegmentChart({ segments }) {
  // Safety check for empty or undefined segments
  if (!segments || segments.length === 0) {
    return (
      <div className="bg-white rounded-xl p-6 border border-neutral-200">
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-neutral-900 mb-1">Guest Segmentation</h3>
          <p className="text-sm text-neutral-600">Distribution by guest category</p>
        </div>
        <div className="flex items-center justify-center h-[300px] text-neutral-500">
          Loading segment data...
        </div>
      </div>
    );
  }

  const chartData = segments.map(segment => ({
    name: segment.name,
    value: segment.value,
    percentage: segment.percentage,
    color: segment.color
  }));

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white px-4 py-3 rounded-xl shadow-lg border border-neutral-200">
          <p className="font-semibold text-neutral-900 mb-1">{data.name}</p>
          <p className="text-sm text-neutral-600">
            {data.value} guests ({data.percentage}%)
          </p>
        </div>
      );
    }
    return null;
  };

  const CustomLegend = ({ payload }) => {
    return (
      <div className="grid grid-cols-2 gap-3 mt-4">
        {payload.map((entry, index) => {
          const segment = segments.find(s => s.name === entry.value);
          return (
            <div key={index} className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              <div className="flex-1">
                <p className="text-sm font-medium text-neutral-900">{entry.value}</p>
                <p className="text-xs text-neutral-600">
                  {segment?.value} ({segment?.percentage}%)
                </p>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-xl p-6 border border-neutral-200">
      {/* Header */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-neutral-900 mb-1">Guest Segmentation</h3>
        <p className="text-sm text-neutral-600">Distribution by guest category</p>
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ percentage }) => `${percentage}%`}
            outerRadius={100}
            fill="#8884d8"
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend content={<CustomLegend />} />
        </PieChart>
      </ResponsiveContainer>

      {/* Segment Details */}
      <div className="mt-6 pt-6 border-t border-neutral-200 space-y-3">
        {segments.map((segment, index) => (
          <div key={index} className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: segment.color }}
              />
              <div>
                <p className="text-sm font-medium text-neutral-900">{segment.name}</p>
                <p className="text-xs text-neutral-600">{segment.description}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold text-neutral-900">
                ₹{segment.avgLTV ? segment.avgLTV.toLocaleString() : '0'}
              </p>
              <p className="text-xs text-neutral-600">Avg LTV</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
