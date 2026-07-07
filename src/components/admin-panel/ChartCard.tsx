import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useCurrency } from '@/hooks/useCurrency';

const ChartCard = ({ title, subtitle, data, type = 'line' }) => {
  const { symbol } = useCurrency();
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white px-4 py-3 rounded-xl shadow-lg border border-neutral-200">
          <p className="text-sm font-semibold text-neutral-900 mb-2">{label}</p>
          {payload.map((entry, index) => (
            <div key={index} className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-xs text-neutral-600 capitalize">
                {entry.name}:
              </span>
              <span className="text-xs font-semibold text-neutral-900">
                {entry.name === 'revenue'
                  ? `${symbol}${entry.value.toLocaleString()}`
                  : entry.name === 'occupancy'
                  ? `${entry.value}%`
                  : entry.value}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-neutral-200">
      <div className="mb-6">
        <h3 className="text-lg font-serif font-bold text-neutral-900">
          {title}
        </h3>
        {subtitle && (
          <p className="text-sm text-neutral-500 mt-1">{subtitle}</p>
        )}
      </div>

      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          {type === 'area' ? (
            <AreaChart data={data}>
              <defs>
                <linearGradient id="colorOccupancy" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#60adff" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#60adff" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ff6742" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#ff6742" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#E8E4E0" />
              <XAxis
                dataKey="date"
                stroke="#9E9891"
                style={{ fontSize: '12px' }}
              />
              <YAxis
                stroke="#9E9891"
                style={{ fontSize: '12px' }}
                yAxisId="left"
              />
              <YAxis
                stroke="#9E9891"
                style={{ fontSize: '12px' }}
                yAxisId="right"
                orientation="right"
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                wrapperStyle={{ fontSize: '12px' }}
                iconType="circle"
              />
              <Area
                yAxisId="left"
                type="monotone"
                dataKey="occupancy"
                stroke="#60adff"
                strokeWidth={2}
                fill="url(#colorOccupancy)"
                name="Occupancy (%)"
              />
              <Area
                yAxisId="right"
                type="monotone"
                dataKey="revenue"
                stroke="#ff6742"
                strokeWidth={2}
                fill="url(#colorRevenue)"
                name="Revenue ($)"
              />
            </AreaChart>
          ) : (
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E8E4E0" />
              <XAxis
                dataKey="date"
                stroke="#9E9891"
                style={{ fontSize: '12px' }}
              />
              <YAxis stroke="#9E9891" style={{ fontSize: '12px' }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                wrapperStyle={{ fontSize: '12px' }}
                iconType="circle"
              />
              <Line
                type="monotone"
                dataKey="occupancy"
                stroke="#60adff"
                strokeWidth={3}
                dot={{ fill: '#60adff', r: 4 }}
                activeDot={{ r: 6 }}
                name="Occupancy (%)"
              />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#ff6742"
                strokeWidth={3}
                dot={{ fill: '#ff6742', r: 4 }}
                activeDot={{ r: 6 }}
                name="Revenue ($)"
              />
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ChartCard;
