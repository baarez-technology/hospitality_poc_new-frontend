import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useCurrency } from '@/hooks/useCurrency';

export default function ADRRevPARChart({ historicalData }) {
  const { symbol } = useCurrency();
  // Safety check for empty or undefined data
  if (!historicalData || historicalData.length === 0) {
    return (
      <div className="bg-white rounded-xl p-6 border border-neutral-200">
        <div className="mb-6">
          <h3 className="text-xl font-serif font-semibold text-neutral-900 mb-1">
            ADR & RevPAR Trends
          </h3>
          <p className="text-sm text-neutral-600">
            Average Daily Rate and Revenue Per Available Room
          </p>
        </div>
        <div className="flex items-center justify-center h-[350px] text-neutral-500">
          Loading chart data...
        </div>
      </div>
    );
  }

  const data = historicalData.slice(-30).map(d => ({
    date: d.dateLabel,
    adr: d.adr,
    revpar: d.revpar
  }));

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;

      return (
        <div className="bg-white p-4 rounded-xl shadow-lg border border-neutral-200">
          <p className="font-semibold text-neutral-900 mb-2">{data.date}</p>
          <div className="space-y-1">
            <p className="text-sm text-[#A57865]">
              <span className="font-medium">ADR:</span> {symbol}{data.adr}
            </p>
            <p className="text-sm text-[#CDB261]">
              <span className="font-medium">RevPAR:</span> {symbol}{data.revpar}
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  const avgADR = Math.round(data.reduce((sum, d) => sum + d.adr, 0) / data.length);
  const avgRevPAR = Math.round(data.reduce((sum, d) => sum + d.revpar, 0) / data.length);

  return (
    <div className="bg-white rounded-xl p-6 border border-neutral-200">
      <div className="mb-6">
        <h3 className="text-xl font-serif font-semibold text-neutral-900 mb-1">
          ADR & RevPAR Trends
        </h3>
        <p className="text-sm text-neutral-600">
          Average Daily Rate and Revenue Per Available Room over 30 days
        </p>
      </div>

      <ResponsiveContainer width="100%" height={350}>
        <LineChart data={data}>
          <defs>
            <linearGradient id="colorADR" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#2563eb" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="colorRevPAR" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey="date"
            tick={{ fill: '#6b7280', fontSize: 12 }}
            tickLine={{ stroke: '#e5e7eb' }}
          />
          <YAxis
            tick={{ fill: '#6b7280', fontSize: 12 }}
            tickLine={{ stroke: '#e5e7eb' }}
            tickFormatter={(value) => `${symbol}${value}`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ paddingTop: '20px' }} />
          <Line
            type="monotone"
            dataKey="adr"
            stroke="#2563eb"
            strokeWidth={3}
            dot={false}
            name="ADR (Average Daily Rate)"
            activeDot={{ r: 6 }}
          />
          <Line
            type="monotone"
            dataKey="revpar"
            stroke="#f59e0b"
            strokeWidth={3}
            dot={false}
            name="RevPAR (Revenue Per Available Room)"
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 gap-6 mt-6 pt-6 border-t border-neutral-200">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-3 h-3 rounded-full bg-[#8E6554]" />
            <span className="text-sm font-medium text-neutral-700">Average ADR</span>
          </div>
          <p className="text-3xl font-bold text-[#A57865]">{symbol}{avgADR}</p>
          <p className="text-xs text-neutral-500 mt-1">Average daily rate over 30 days</p>
        </div>
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-3 h-3 rounded-full bg-[#B89D4E]" />
            <span className="text-sm font-medium text-neutral-700">Average RevPAR</span>
          </div>
          <p className="text-3xl font-bold text-[#CDB261]">{symbol}{avgRevPAR}</p>
          <p className="text-xs text-neutral-500 mt-1">Revenue per available room</p>
        </div>
      </div>
    </div>
  );
}
