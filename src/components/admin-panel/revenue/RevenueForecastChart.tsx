import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useCurrency } from '@/hooks/useCurrency';

export default function RevenueForecastChart({ historicalData, forecastData }) {
  const { symbol } = useCurrency();
  // Safety check for empty or undefined data
  if (!historicalData || historicalData.length === 0 || !forecastData || forecastData.length === 0) {
    return (
      <div className="bg-white rounded-xl p-6 border border-neutral-200">
        <div className="mb-6">
          <h3 className="text-xl font-serif font-semibold text-neutral-900 mb-1">
            Revenue Forecast
          </h3>
          <p className="text-sm text-neutral-600">
            Historical performance and AI-predicted revenue with confidence intervals
          </p>
        </div>
        <div className="flex items-center justify-center h-[400px] text-neutral-500">
          Loading forecast data...
        </div>
      </div>
    );
  }

  // Combine historical and forecast data
  const combinedData = [
    ...historicalData.slice(-14).map(d => ({
      ...d,
      type: 'historical'
    })),
    ...forecastData.slice(0, 14).map(d => ({
      dateLabel: d.dateLabel,
      revenue: d.forecastRevenue,
      lowerBound: d.lowerBound,
      upperBound: d.upperBound,
      type: 'forecast'
    }))
  ];

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const isForecast = data.type === 'forecast';

      return (
        <div className="bg-white p-4 rounded-xl shadow-lg border border-neutral-200">
          <p className="font-semibold text-neutral-900 mb-2">{data.dateLabel}</p>
          <div className="space-y-1">
            <p className="text-sm text-neutral-700">
              <span className="font-medium">Revenue:</span> {symbol}{data.revenue?.toLocaleString()}
            </p>
            {isForecast && (
              <>
                <p className="text-sm text-neutral-500">
                  Range: {symbol}{data.lowerBound?.toLocaleString()} - {symbol}{data.upperBound?.toLocaleString()}
                </p>
                <p className="text-xs text-[#A57865] font-medium mt-2">AI Forecast</p>
              </>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-xl p-6 border border-neutral-200">
      <div className="mb-6">
        <h3 className="text-xl font-serif font-semibold text-neutral-900 mb-1">
          Revenue Forecast
        </h3>
        <p className="text-sm text-neutral-600">
          Historical performance and AI-predicted revenue with confidence intervals
        </p>
      </div>

      <ResponsiveContainer width="100%" height={400}>
        <AreaChart data={combinedData}>
          <defs>
            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#2563eb" stopOpacity={0.1}/>
              <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="colorForecast" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.1}/>
              <stop offset="95%" stopColor="#7c3aed" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey="dateLabel"
            tick={{ fill: '#6b7280', fontSize: 12 }}
            tickLine={{ stroke: '#e5e7eb' }}
          />
          <YAxis
            tick={{ fill: '#6b7280', fontSize: 12 }}
            tickLine={{ stroke: '#e5e7eb' }}
            tickFormatter={(value) => `${symbol}${(value / 1000).toFixed(0)}K`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{ paddingTop: '20px' }}
            iconType="circle"
          />

          {/* Confidence interval area */}
          <Area
            type="monotone"
            dataKey="upperBound"
            stackId="1"
            stroke="none"
            fill="#ddd6fe"
            fillOpacity={0.3}
            name="Upper Bound"
          />
          <Area
            type="monotone"
            dataKey="lowerBound"
            stackId="1"
            stroke="none"
            fill="#ddd6fe"
            fillOpacity={0.3}
            name="Lower Bound"
          />

          {/* Revenue line */}
          <Line
            type="monotone"
            dataKey="revenue"
            stroke="#2563eb"
            strokeWidth={2}
            dot={false}
            name="Revenue"
            connectNulls
          />
        </AreaChart>
      </ResponsiveContainer>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 mt-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-[#8E6554]" />
          <span className="text-neutral-700">Actual Revenue</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-[#4A7C84]" />
          <span className="text-neutral-700">Forecast</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-8 h-2 bg-aurora-200 rounded" />
          <span className="text-neutral-700">Confidence Range</span>
        </div>
      </div>
    </div>
  );
}
