import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function GuestGrowthChart({ data }) {
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
                {entry.value.toLocaleString()}
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
        <h3 className="text-lg font-semibold text-neutral-900 mb-1">Guest Growth Trend</h3>
        <p className="text-sm text-neutral-600">Total, new, and active guests over time</p>
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={350}>
        <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
          <XAxis
            dataKey="month"
            stroke="#9CA3AF"
            style={{ fontSize: '12px' }}
          />
          <YAxis
            stroke="#9CA3AF"
            style={{ fontSize: '12px' }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{ fontSize: '14px', paddingTop: '20px' }}
            iconType="circle"
          />
          <Line
            type="monotone"
            dataKey="totalGuests"
            name="Total Guests"
            stroke="#8B5CF6"
            strokeWidth={3}
            dot={{ fill: '#8B5CF6', r: 4 }}
            activeDot={{ r: 6 }}
          />
          <Line
            type="monotone"
            dataKey="activeGuests"
            name="Active Guests"
            stroke="#3B82F6"
            strokeWidth={2}
            dot={{ fill: '#3B82F6', r: 3 }}
          />
          <Line
            type="monotone"
            dataKey="newGuests"
            name="New Guests"
            stroke="#10B981"
            strokeWidth={2}
            dot={{ fill: '#10B981', r: 3 }}
          />
        </LineChart>
      </ResponsiveContainer>

      {/* Quick Stats */}
      <div className="mt-6 pt-6 border-t border-neutral-200 grid grid-cols-3 gap-4">
        <div className="text-center">
          <p className="text-2xl font-bold text-[#A57865]">
            {data[data.length - 2]?.totalGuests.toLocaleString()}
          </p>
          <p className="text-xs text-neutral-600 mt-1">Total Guests</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-[#4E5840]">
            {data[data.length - 2]?.newGuests.toLocaleString()}
          </p>
          <p className="text-xs text-neutral-600 mt-1">New This Month</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-blue-600">
            {data[data.length - 2]?.activeGuests.toLocaleString()}
          </p>
          <p className="text-xs text-neutral-600 mt-1">Active Guests</p>
        </div>
      </div>
    </div>
  );
}
