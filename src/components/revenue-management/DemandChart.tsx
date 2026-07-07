import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ComposedChart,
  Bar,
  Line,
  ReferenceLine,
  ReferenceArea,
} from 'recharts';
import { TrendingUp, TrendingDown, Flame, Snowflake, Calendar, RefreshCw, AlertCircle } from 'lucide-react';
import { revenueIntelligenceService, ForecastItem, Event } from '../../api/services/revenue-intelligence.service';
import { useToast } from '../../contexts/ToastContext';

interface DemandChartProps {
  dateRange?: number;
  showRevenue?: boolean;
  showConfidenceBands?: boolean;
  showEventMarkers?: boolean;
}

interface ChartDataPoint {
  date: string;
  displayDate: string;
  dayName: string;
  occupancy: number;
  adr: number;
  revPAR: number;
  revenue: number;
  demandIndex: number;
  demandLevel: string;
  event?: Event | null;
  confidence: number;
  confidenceUpper?: number;
  confidenceLower?: number;
}

const DemandChart = ({
  dateRange = 30,
  showRevenue = true,
  showConfidenceBands = true,
  showEventMarkers = true,
}: DemandChartProps) => {
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [forecastData, setForecastData] = useState<ForecastItem[]>([]);
  const [events, setEvents] = useState<Event[]>([]);

  // Fetch forecast data from API
  const fetchData = useCallback(async () => {
    try {
      setError(null);
      const today = new Date();
      const endDate = new Date(today);
      endDate.setDate(today.getDate() + dateRange);

      const [forecastResponse, eventsResponse] = await Promise.all([
        revenueIntelligenceService.getForecast({
          start_date: today.toISOString().split('T')[0],
          end_date: endDate.toISOString().split('T')[0],
        }),
        revenueIntelligenceService.getEvents(
          today.toISOString().split('T')[0],
          endDate.toISOString().split('T')[0]
        ),
      ]);

      setForecastData(forecastResponse.forecasts || []);
      // Ensure events is always an array
      setEvents(Array.isArray(eventsResponse) ? eventsResponse : []);
    } catch (err) {
      console.error('Failed to fetch demand forecast:', err);
      setError('Failed to load demand forecast data');
      showToast('Failed to load demand forecast', 'error');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [dateRange, showToast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchData();
    showToast('Demand forecast refreshed', 'success');
  };

  // Transform API data to chart format
  const chartData = useMemo(() => {
    // Ensure events is an array before using it
    const eventsArray = Array.isArray(events) ? events : [];
    
    return forecastData.map((item) => {
      const date = new Date(item.date);
      const event = eventsArray.find(
        (e) => item.date >= e.startDate && item.date <= e.endDate
      );

      // Calculate confidence bands (upper and lower bounds based on confidence level)
      const confidenceMargin = (100 - item.confidence_level) / 100;
      const occupancyVariance = item.forecasted_occupancy * confidenceMargin * 0.5;

      return {
        date: item.date,
        displayDate: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        dayName: date.toLocaleDateString('en-US', { weekday: 'short' }),
        occupancy: item.forecasted_occupancy,
        adr: Math.round(item.forecasted_demand * 2.5), // Estimated ADR based on demand
        revPAR: Math.round(item.forecasted_occupancy * item.forecasted_demand * 0.025),
        revenue: Math.round(item.forecasted_occupancy * item.forecasted_demand * 0.25 * 70), // 70 rooms estimate
        demandIndex: Math.round(item.forecasted_demand),
        demandLevel: item.demand_level,
        event: event || null,
        confidence: item.confidence_level,
        confidenceUpper: Math.min(100, item.forecasted_occupancy + occupancyVariance),
        confidenceLower: Math.max(0, item.forecasted_occupancy - occupancyVariance),
      };
    });
  }, [forecastData, events]);

  const getDemandLevelColor = (level: string) => {
    switch (level) {
      case 'critical':
      case 'compression':
        return '#DC2626';
      case 'high':
        return '#4E5840';
      case 'moderate':
      case 'normal':
        return '#5C9BA4';
      case 'low':
        return '#CDB261';
      case 'very_low':
        return '#9CA3AF';
      default:
        return '#6B7280';
    }
  };

  const getDemandLevelIcon = (level: string) => {
    switch (level) {
      case 'critical':
      case 'compression':
        return <Flame className="w-4 h-4 text-rose-500" />;
      case 'high':
        return <TrendingUp className="w-4 h-4 text-sage-600" />;
      case 'moderate':
      case 'normal':
        return null;
      case 'low':
        return <TrendingDown className="w-4 h-4 text-gold-500" />;
      case 'very_low':
        return <Snowflake className="w-4 h-4 text-ocean-400" />;
      default:
        return null;
    }
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload as ChartDataPoint;
      return (
        <div className="bg-white p-4 rounded-xl shadow-xl border border-[#E5E4E0] min-w-[220px]">
          <div className="flex items-center justify-between mb-2">
            <p className="font-semibold text-neutral-800">
              {data.dayName}, {data.displayDate}
            </p>
            {data.event && (
              <span className="text-xs px-2 py-0.5 bg-[#4E5840]/10 text-[#4E5840] rounded-full">
                {data.event.name}
              </span>
            )}
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-neutral-500">Occupancy:</span>
              <span className="font-bold text-neutral-800">{data.occupancy}%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-neutral-500">ADR:</span>
              <span className="font-bold text-neutral-800">₹{data.adr}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-neutral-500">RevPAR:</span>
              <span className="font-bold text-neutral-800">₹{data.revPAR}</span>
            </div>
            {showRevenue && (
              <div className="flex items-center justify-between">
                <span className="text-neutral-500">Revenue:</span>
                <span className="font-bold text-sage-600">₹{data.revenue.toLocaleString()}</span>
              </div>
            )}
            <div className="flex items-center justify-between pt-2 border-t">
              <span className="text-neutral-500">Demand Level:</span>
              <div className="flex items-center gap-1">
                {getDemandLevelIcon(data.demandLevel)}
                <span
                  className="font-medium capitalize"
                  style={{ color: getDemandLevelColor(data.demandLevel) }}
                >
                  {data.demandLevel?.replace('_', ' ')}
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between text-xs text-neutral-400">
              <span>Confidence:</span>
              <span>{data.confidence}%</span>
            </div>
            {showConfidenceBands && (
              <div className="flex items-center justify-between text-xs text-neutral-400">
                <span>Confidence Range:</span>
                <span>
                  {data.confidenceLower?.toFixed(0)}% - {data.confidenceUpper?.toFixed(0)}%
                </span>
              </div>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  // Custom bar for demand index with color based on level
  const CustomDemandBar = (props: any) => {
    const { x, y, width, height, payload } = props;
    const color = getDemandLevelColor(payload.demandLevel);
    return (
      <rect x={x} y={y} width={width} height={height} fill={color} rx={2} opacity={0.8} />
    );
  };

  // Get event dates for reference lines
  const eventDates = useMemo(() => {
    const eventsArray = Array.isArray(events) ? events : [];
    return eventsArray.map((event) => ({
      date: event.startDate,
      name: event.name,
      type: event.type,
    }));
  }, [events]);

  if (isLoading) {
    return (
      <div className="h-64 sm:h-80 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="w-6 h-6 sm:w-8 sm:h-8 text-terra-500 animate-spin" />
          <p className="text-xs sm:text-sm text-neutral-500">Loading demand forecast...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-64 sm:h-80 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <AlertCircle className="w-6 h-6 sm:w-8 sm:h-8 text-rose-500" />
          <p className="text-xs sm:text-sm text-neutral-500">{error}</p>
          <button
            onClick={handleRefresh}
            className="px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium text-terra-600 hover:bg-terra-50 rounded-lg transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Refresh button */}
      <button
        onClick={handleRefresh}
        disabled={isRefreshing}
        className="absolute top-0 right-0 p-1.5 sm:p-2 text-neutral-400 hover:text-neutral-600 transition-colors z-10"
        title="Refresh forecast"
      >
        <RefreshCw className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
      </button>

      <div className="h-64 sm:h-80">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData} margin={{ top: 10, right: 5, left: -15, bottom: 0 }}>
            <defs>
              <linearGradient id="colorOccupancy" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#A57865" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#A57865" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorConfidence" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#5C9BA4" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#5C9BA4" stopOpacity={0.05} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E4E0" />
            <XAxis
              dataKey="displayDate"
              tick={{ fontSize: 9, fill: '#6A6A6A' }}
              axisLine={{ stroke: '#E5E4E0' }}
              tickLine={false}
              interval={Math.floor(dateRange / 7)}
            />
            <YAxis
              yAxisId="left"
              tick={{ fontSize: 9, fill: '#6A6A6A' }}
              axisLine={false}
              tickLine={false}
              domain={[0, 100]}
              tickFormatter={(value) => `${value}%`}
              width={35}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              tick={{ fontSize: 9, fill: '#6A6A6A' }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(value) => `₹${value}`}
              width={35}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />

            {/* Confidence bands */}
            {showConfidenceBands && (
              <Area
                yAxisId="left"
                type="monotone"
                dataKey="confidenceUpper"
                stroke="none"
                fill="url(#colorConfidence)"
                name="Confidence Band"
              />
            )}

            {/* Event markers as reference lines */}
            {showEventMarkers &&
              eventDates.map((event, idx) => {
                const dataPoint = chartData.find((d) => d.date === event.date);
                if (!dataPoint) return null;
                return (
                  <ReferenceLine
                    key={idx}
                    x={dataPoint.displayDate}
                    yAxisId="left"
                    stroke="#4E5840"
                    strokeDasharray="3 3"
                    label={{
                      value: event.name,
                      position: 'top',
                      fill: '#4E5840',
                      fontSize: 9,
                    }}
                  />
                );
              })}

            <Area
              yAxisId="left"
              type="monotone"
              dataKey="occupancy"
              name="Occupancy %"
              stroke="#A57865"
              strokeWidth={2}
              fill="url(#colorOccupancy)"
            />
            <Bar
              yAxisId="left"
              dataKey="demandIndex"
              name="Demand Index"
              shape={<CustomDemandBar />}
              barSize={8}
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="adr"
              name="ADR"
              stroke="#5C9BA4"
              strokeWidth={2}
              dot={false}
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="revPAR"
              name="RevPAR"
              stroke="#CDB261"
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

// Demand Level Badge Component (Accessible with patterns + icons + text)
interface DemandLevelBadgeProps {
  level: string;
}

export const DemandLevelBadge = ({ level }: DemandLevelBadgeProps) => {
  const getStyles = () => {
    switch (level) {
      case 'critical':
      case 'compression':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'high':
        return 'bg-sage-50 text-sage-700 border-sage-200';
      case 'moderate':
      case 'normal':
        return 'bg-ocean-50 text-ocean-700 border-ocean-200';
      case 'low':
        return 'bg-gold-50 text-gold-700 border-gold-200';
      case 'very_low':
        return 'bg-neutral-100 text-neutral-600 border-neutral-200';
      default:
        return 'bg-neutral-100 text-neutral-600 border-neutral-200';
    }
  };

  const getIcon = () => {
    switch (level) {
      case 'critical':
      case 'compression':
        return <Flame className="w-3 h-3" aria-hidden="true" />;
      case 'high':
        return <TrendingUp className="w-3 h-3" aria-hidden="true" />;
      case 'low':
        return <TrendingDown className="w-3 h-3" aria-hidden="true" />;
      case 'very_low':
        return <Snowflake className="w-3 h-3" aria-hidden="true" />;
      default:
        return null;
    }
  };

  const levelText = level?.replace('_', ' ');

  return (
    <span
      className={`inline-flex items-center justify-center gap-1 px-2 py-0.5 text-[11px] font-semibold rounded-md border ${getStyles()}`}
      role="status"
      aria-label={`Demand level: ${levelText}`}
    >
      {getIcon()}
      <span className="capitalize">{levelText}</span>
    </span>
  );
};

// Forecast Summary Cards - Connected to API
interface ForecastSummaryCardsProps {
  className?: string;
}

export const ForecastSummaryCards = ({ className }: ForecastSummaryCardsProps) => {
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [summaryData, setSummaryData] = useState<{
    next7Days: { avgOccupancy: number; avgADR: number; avgRevPAR: number; totalRevenue: number; compressionDays: number; lowDemandDays: number } | null;
    next14Days: { avgOccupancy: number; avgADR: number; avgRevPAR: number; totalRevenue: number; compressionDays: number; lowDemandDays: number } | null;
    next30Days: { avgOccupancy: number; avgADR: number; avgRevPAR: number; totalRevenue: number; compressionDays: number; lowDemandDays: number } | null;
  }>({
    next7Days: null,
    next14Days: null,
    next30Days: null,
  });

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const today = new Date();
        const end7 = new Date(today);
        end7.setDate(today.getDate() + 7);
        const end14 = new Date(today);
        end14.setDate(today.getDate() + 14);
        const end30 = new Date(today);
        end30.setDate(today.getDate() + 30);

        const [forecast7, forecast14, forecast30] = await Promise.all([
          revenueIntelligenceService.getForecast({
            start_date: today.toISOString().split('T')[0],
            end_date: end7.toISOString().split('T')[0],
          }),
          revenueIntelligenceService.getForecast({
            start_date: today.toISOString().split('T')[0],
            end_date: end14.toISOString().split('T')[0],
          }),
          revenueIntelligenceService.getForecast({
            start_date: today.toISOString().split('T')[0],
            end_date: end30.toISOString().split('T')[0],
          }),
        ]);

        const calculateSummary = (forecasts: ForecastItem[]) => {
          if (!forecasts.length) return null;
          const avgOccupancy = Math.round(
            forecasts.reduce((sum, f) => sum + f.forecasted_occupancy, 0) / forecasts.length
          );
          const avgADR = Math.round(
            forecasts.reduce((sum, f) => sum + f.forecasted_demand * 2.5, 0) / forecasts.length
          );
          const avgRevPAR = Math.round(avgOccupancy * avgADR / 100);
          const totalRevenue = Math.round(
            forecasts.reduce((sum, f) => sum + f.forecasted_occupancy * f.forecasted_demand * 0.25 * 70, 0)
          );
          const compressionDays = forecasts.filter(f => f.demand_level === 'critical' || f.demand_level === 'high').length;
          const lowDemandDays = forecasts.filter(f => f.demand_level === 'low' || f.demand_level === 'very_low').length;
          return { avgOccupancy, avgADR, avgRevPAR, totalRevenue, compressionDays, lowDemandDays };
        };

        setSummaryData({
          next7Days: calculateSummary(forecast7.forecasts || []),
          next14Days: calculateSummary(forecast14.forecasts || []),
          next30Days: calculateSummary(forecast30.forecasts || []),
        });
      } catch (err) {
        console.error('Failed to fetch forecast summary:', err);
        showToast('Failed to load forecast summary', 'error');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSummary();
  }, [showToast]);

  const periods = [
    { key: 'next7Days' as const, label: 'Next 7 Days' },
    { key: 'next14Days' as const, label: 'Next 14 Days' },
    { key: 'next30Days' as const, label: 'Next 30 Days' },
  ];

  if (isLoading) {
    return (
      <>
        {periods.map(({ key }) => (
          <div key={key} className="rounded-[10px] bg-white p-3 sm:p-5 animate-pulse">
            <div className="h-4 bg-neutral-100 rounded w-24 mb-4" />
            <div className="h-8 bg-neutral-100 rounded w-16 mb-2" />
            <div className="h-4 bg-neutral-100 rounded w-20" />
          </div>
        ))}
      </>
    );
  }

  return (
    <>
      {periods.map(({ key, label }) => {
        const data = summaryData[key];
        if (!data) return null;

        return (
          <div key={key} className={`rounded-[10px] bg-white p-3 sm:p-5 ${className || ''}`}>
            <div className="flex items-start justify-between mb-3 sm:mb-4">
              <p className="text-[9px] sm:text-[10px] font-semibold text-neutral-400 uppercase tracking-widest">
                {label}
              </p>
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-terra-50 flex items-center justify-center flex-shrink-0">
                <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-terra-500" />
              </div>
            </div>

            <div className="space-y-2 sm:space-y-3 mb-3 sm:mb-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] sm:text-[11px] font-medium text-neutral-500">Avg Occupancy</span>
                <span className="text-lg sm:text-xl font-bold text-neutral-900">{data.avgOccupancy}%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] sm:text-[11px] font-medium text-neutral-500">Avg ADR</span>
                <span className="text-lg sm:text-xl font-bold text-neutral-900">₹{data.avgADR}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] sm:text-[11px] font-medium text-neutral-500">Avg RevPAR</span>
                <span className="text-lg sm:text-xl font-bold text-terra-600">₹{data.avgRevPAR}</span>
              </div>
            </div>

            <div className="pt-3 sm:pt-4 border-t border-neutral-100 mb-2 sm:mb-3">
              <div className="flex items-center justify-between">
                <span className="text-[9px] sm:text-[10px] font-semibold text-neutral-400 uppercase tracking-widest">
                  Total Revenue
                </span>
                <span className="text-base sm:text-lg font-bold text-sage-600">
                  ₹{data.totalRevenue.toLocaleString()}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-3 text-[10px] sm:text-[11px]">
              <span className="flex items-center gap-1">
                <Flame className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-rose-500" />
                <span className="font-medium text-neutral-600">
                  {data.compressionDays} compression
                </span>
              </span>
              <span className="flex items-center gap-1">
                <Snowflake className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-ocean-400" />
                <span className="font-medium text-neutral-600">{data.lowDemandDays} low</span>
              </span>
            </div>
          </div>
        );
      })}
    </>
  );
};

export default DemandChart;
