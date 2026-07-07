import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { ForecastItem } from '../../api/services/revenue-intelligence.service';
import { useForecast } from '../../contexts/RevenueDataContext';

interface OccupancyData {
  date: string;
  dateLabel: string;
  occupancy: number;
  rooms: number;
  confidence: number;
}

interface TooltipPayload {
  payload: OccupancyData;
}

// Skeleton loader component
const SkeletonLoader = () => (
  <div className="bg-white rounded-xl p-6 border border-neutral-200 animate-pulse">
    <div className="mb-6">
      <div className="h-6 bg-neutral-200 rounded w-40 mb-2" />
      <div className="h-4 bg-neutral-200 rounded w-64" />
    </div>
    <div className="h-[350px] bg-neutral-100 rounded-lg" />
    <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-neutral-200">
      {[1, 2, 3].map((i) => (
        <div key={i} className="text-center">
          <div className="h-8 bg-neutral-200 rounded w-16 mx-auto mb-1" />
          <div className="h-3 bg-neutral-200 rounded w-20 mx-auto" />
        </div>
      ))}
    </div>
  </div>
);

// Error component
const ErrorDisplay = ({ error, onRetry }: { error: string; onRetry: () => void }) => (
  <div className="bg-white rounded-xl p-6 border border-neutral-200">
    <div className="mb-6">
      <h3 className="text-xl font-sans font-semibold text-neutral-900 mb-1">
        Occupancy Forecast
      </h3>
      <p className="text-sm text-neutral-600">
        Projected room occupancy for the next 14 days
      </p>
    </div>
    <div className="flex flex-col items-center justify-center py-16">
      <div className="w-12 h-12 rounded-full bg-rose-100 flex items-center justify-center mb-4">
        <AlertCircle className="w-6 h-6 text-rose-500" />
      </div>
      <p className="text-sm font-medium text-neutral-900 mb-1">Failed to load occupancy forecast</p>
      <p className="text-xs text-neutral-500 mb-4">{error}</p>
      <button
        onClick={onRetry}
        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-terra-600 bg-terra-50 rounded-lg hover:bg-terra-100 transition-colors"
      >
        <RefreshCw className="w-4 h-4" />
        Retry
      </button>
    </div>
  </div>
);

// Fallback returns an empty 14-day series (no demo values). When the API has
// no forecast data the chart renders flat zeros instead of fake occupancy.
const generateFallbackData = (): OccupancyData[] => {
  const today = new Date();
  const fallbackData: OccupancyData[] = [];
  for (let i = 0; i < 14; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() + i);
    fallbackData.push({
      date: date.toISOString().split('T')[0],
      dateLabel: date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
      occupancy: 0,
      rooms: 0,
      confidence: 0,
    });
  }
  return fallbackData;
};

export default function OccupancyForecastChart() {
  const { data: forecastResponse, loading, error, refresh } = useForecast();

  // Transform API response to component format
  const forecastData = useMemo(() => {
    if (!forecastResponse?.forecasts || forecastResponse.forecasts.length === 0) {
      return generateFallbackData();
    }

    return forecastResponse.forecasts.slice(0, 14).map((item: ForecastItem) => {
      const date = new Date(item.date);
      return {
        date: item.date,
        dateLabel: date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
        occupancy: item.forecasted_occupancy,
        rooms: Math.round(item.forecasted_demand * 0.5),
        confidence: item.confidence_level
      };
    });
  }, [forecastResponse]);

  const data = useMemo(() => {
    return forecastData.map(d => ({
      date: d.dateLabel,
      occupancy: d.occupancy,
      rooms: d.rooms,
      confidence: d.confidence
    }));
  }, [forecastData]);

  const avgOccupancy = useMemo(() => {
    if (data.length === 0) return 0;
    return Math.round(data.reduce((sum, d) => sum + d.occupancy, 0) / data.length);
  }, [data]);

  const peakOccupancy = useMemo(() => {
    if (data.length === 0) return 0;
    return Math.max(...data.map(d => d.occupancy));
  }, [data]);

  const avgRooms = useMemo(() => {
    if (data.length === 0) return 0;
    return Math.round(data.reduce((sum, d) => sum + d.rooms, 0) / data.length);
  }, [data]);

  const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: TooltipPayload[] }) => {
    if (active && payload && payload.length) {
      const chartData = payload[0].payload;

      return (
        <div className="bg-white p-4 rounded-xl shadow-lg border border-neutral-200">
          <p className="font-semibold text-neutral-900 mb-2">{chartData.date}</p>
          <div className="space-y-1">
            <p className="text-sm text-neutral-700">
              <span className="font-medium">Occupancy:</span> {chartData.occupancy}%
            </p>
            <p className="text-sm text-neutral-700">
              <span className="font-medium">Rooms:</span> {chartData.rooms}
            </p>
            <p className="text-sm text-neutral-500">
              <span className="font-medium">Confidence:</span> {chartData.confidence}%
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return <SkeletonLoader />;
  }

  if (error && forecastData.length === 0) {
    return <ErrorDisplay error={error} onRetry={refresh} />;
  }

  // Empty state
  if (!forecastData || forecastData.length === 0) {
    return (
      <div className="bg-white rounded-xl p-6 border border-neutral-200">
        <div className="mb-6">
          <h3 className="text-xl font-sans font-semibold text-neutral-900 mb-1">
            Occupancy Forecast
          </h3>
          <p className="text-sm text-neutral-600">
            Projected room occupancy for the next 14 days
          </p>
        </div>
        <div className="flex items-center justify-center h-[350px] text-neutral-500">
          No forecast data available
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl p-6 border border-neutral-200">
      <div className="mb-6">
        <h3 className="text-xl font-sans font-semibold text-neutral-900 mb-1">
          Occupancy Forecast
        </h3>
        <p className="text-sm text-neutral-600">
          Projected room occupancy for the next 14 days
        </p>
      </div>

      <ResponsiveContainer width="100%" height={350}>
        <BarChart data={data}>
          <defs>
            <linearGradient id="colorOccupancy" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#10b981" stopOpacity={0.4}/>
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
            domain={[0, 100]}
            tickFormatter={(value) => `${value}%`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ paddingTop: '20px' }} />
          <ReferenceLine y={80} stroke="#f59e0b" strokeDasharray="3 3" label={{ value: 'Target 80%', fill: '#f59e0b', fontSize: 12 }} />
          <Bar
            dataKey="occupancy"
            fill="url(#colorOccupancy)"
            radius={[8, 8, 0, 0]}
            name="Occupancy %"
          />
        </BarChart>
      </ResponsiveContainer>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-neutral-200">
        <div className="text-center">
          <p className="text-2xl font-bold text-[#4E5840]">
            {avgOccupancy}%
          </p>
          <p className="text-xs text-neutral-600 mt-1">Avg Occupancy</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-[#A57865]">
            {peakOccupancy}%
          </p>
          <p className="text-xs text-neutral-600 mt-1">Peak Day</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-neutral-700">
            {avgRooms}
          </p>
          <p className="text-xs text-neutral-600 mt-1">Avg Rooms/Day</p>
        </div>
      </div>
    </div>
  );
}
