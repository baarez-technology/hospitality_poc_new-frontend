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
  LineChart,
  Line,
  BarChart,
  Bar,
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  AlertCircle,
  CheckCircle,
  Calendar,
  Users,
  Target,
  RefreshCw,
} from 'lucide-react';
import { revenueIntelligenceService, PickupData, PickupMetricsResponse } from '../../api/services/revenue-intelligence.service';
import { useToast } from '../../contexts/ToastContext';

interface PickupChartProps {
  dateRange?: number;
  chartType?: 'area' | 'bar';
  showYoYComparison?: boolean;
  refreshKey?: number;
}

interface ChartDataPoint {
  date: string;
  displayDate: string;
  dayName: string;
  current: number;
  expected: number;
  predicted: number;
  lastYear: number;
  progress: number;
  paceStatus: string;
  remaining: number;
  daysOut: number;
  yoyChange?: number;
}

const PickupChart = ({ dateRange = 14, chartType = 'area', showYoYComparison = true, refreshKey = 0 }: PickupChartProps) => {
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pickupData, setPickupData] = useState<PickupData[]>([]);
  const [summary, setSummary] = useState<PickupMetricsResponse['summary'] | null>(null);

  // Fetch pickup data from API
  const fetchData = useCallback(async () => {
    try {
      setError(null);
      const response = await revenueIntelligenceService.getPickupMetrics(dateRange);
      setPickupData(response.pickup_data || []);
      setSummary(response.summary || null);
    } catch (err) {
      console.error('Failed to fetch pickup metrics:', err);
      setError('Failed to load pickup data');
      showToast('Failed to load pickup metrics', 'error');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [dateRange, showToast, refreshKey]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchData();
    showToast('Pickup data refreshed', 'success');
  };

  // Transform API data to chart format
  const chartData = useMemo(() => {
    return pickupData.map((item) => {
      const date = new Date(item.date);
      // Simulate last year data (in real scenario this would come from API)
      const lastYearBookings = Math.round(item.booked * (0.85 + Math.random() * 0.3));
      const yoyChange = item.booked > 0 ? Math.round(((item.booked - lastYearBookings) / lastYearBookings) * 100) : 0;

      return {
        date: item.date,
        displayDate: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        dayName: date.toLocaleDateString('en-US', { weekday: 'short' }),
        current: item.booked,
        expected: Math.round(item.expected_occupancy * 0.7), // Expected based on target occupancy
        predicted: Math.round(item.occupancy * 0.7), // Predicted final
        lastYear: lastYearBookings,
        progress: Math.round((item.occupancy / item.expected_occupancy) * 100),
        paceStatus: item.pace,
        remaining: item.remaining,
        daysOut: item.days_to_arrival,
        yoyChange,
      };
    });
  }, [pickupData]);

  const getPaceStatusColor = (status: string) => {
    switch (status) {
      case 'strong':
        return '#4E5840';
      case 'on_pace':
      case 'on-pace':
        return '#5C9BA4';
      case 'slow':
        return '#CDB261';
      case 'critical':
        return '#DC2626';
      default:
        return '#6B7280';
    }
  };

  const getPaceStatusIcon = (status: string) => {
    switch (status) {
      case 'strong':
        return <TrendingUp className="w-4 h-4 text-sage-600" />;
      case 'on_pace':
      case 'on-pace':
        return <CheckCircle className="w-4 h-4 text-ocean-600" />;
      case 'slow':
        return <TrendingDown className="w-4 h-4 text-gold-600" />;
      case 'critical':
        return <AlertCircle className="w-4 h-4 text-rose-600" />;
      default:
        return null;
    }
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload as ChartDataPoint;
      return (
        <div className="bg-white p-4 rounded-xl shadow-xl border border-[#E5E4E0]">
          <p className="font-semibold text-neutral-800 mb-2">
            {data.dayName}, {data.displayDate}
          </p>
          <div className="space-y-1.5 text-sm">
            <div className="flex items-center justify-between gap-4">
              <span className="text-neutral-500">Current Bookings:</span>
              <span className="font-bold text-neutral-800">{data.current}</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-neutral-500">Expected Total:</span>
              <span className="font-medium text-neutral-600">{data.expected}</span>
            </div>
            {showYoYComparison && (
              <div className="flex items-center justify-between gap-4">
                <span className="text-neutral-500">Last Year:</span>
                <span className="font-medium text-neutral-600">{data.lastYear}</span>
              </div>
            )}
            <div className="flex items-center justify-between gap-4">
              <span className="text-neutral-500">Progress:</span>
              <span
                className="font-bold"
                style={{ color: getPaceStatusColor(data.paceStatus) }}
              >
                {data.progress}%
              </span>
            </div>
            {showYoYComparison && (
              <div className="flex items-center justify-between gap-4">
                <span className="text-neutral-500">YoY Change:</span>
                <span
                  className={`font-bold ${data.yoyChange && data.yoyChange >= 0 ? 'text-sage-600' : 'text-rose-600'}`}
                >
                  {data.yoyChange && data.yoyChange >= 0 ? '+' : ''}
                  {data.yoyChange}%
                </span>
              </div>
            )}
            <div className="flex items-center justify-between gap-4 pt-1 border-t">
              <span className="text-neutral-500">Pace Status:</span>
              <div className="flex items-center gap-1">
                {getPaceStatusIcon(data.paceStatus)}
                <span
                  className="font-medium capitalize"
                  style={{ color: getPaceStatusColor(data.paceStatus) }}
                >
                  {data.paceStatus?.replace('_', ' ').replace('-', ' ')}
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between gap-4 text-xs text-neutral-400">
              <span>Days Out:</span>
              <span>{data.daysOut}</span>
            </div>
            <div className="flex items-center justify-between gap-4 text-xs text-neutral-400">
              <span>Remaining to Sell:</span>
              <span>{data.remaining}</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  if (isLoading) {
    return (
      <div className="h-64 sm:h-96 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="w-6 h-6 sm:w-8 sm:h-8 text-terra-500 animate-spin" />
          <p className="text-xs sm:text-sm text-neutral-500">Loading pickup data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-64 sm:h-96 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <AlertCircle className="w-6 h-6 sm:w-8 sm:h-8 text-rose-500" />
          <p className="text-xs sm:text-sm text-neutral-500">{error}</p>
          <button
            onClick={handleRefresh}
            className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-terra-600 hover:bg-terra-50 rounded-lg transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (chartType === 'bar') {
    return (
      <div className="relative">
        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="absolute top-0 right-0 p-1.5 sm:p-2 text-neutral-400 hover:text-neutral-600 transition-colors z-10"
          title="Refresh data"
        >
          <RefreshCw className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
        </button>

        <div className="h-64 sm:h-96 px-0 sm:px-4 py-4 sm:py-6">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 10 }}>
              <defs>
                <linearGradient id="barGradientCurrent" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#A57865" stopOpacity={1} />
                  <stop offset="100%" stopColor="#8E6554" stopOpacity={0.9} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#9CA3AF"
                strokeOpacity={0.6}
                vertical={false}
              />
              <XAxis
                dataKey="displayDate"
                tick={{ fontSize: 12, fill: '#6B7280', fontWeight: 500 }}
                axisLine={{ stroke: '#E5E4E0', strokeWidth: 1 }}
                tickLine={false}
                tickMargin={12}
              />
              <YAxis
                tick={{ fontSize: 12, fill: '#6B7280', fontWeight: 500 }}
                axisLine={false}
                tickLine={false}
                tickMargin={10}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: '#A57865', opacity: 0.05 }} />
              <Legend
                wrapperStyle={{ paddingTop: '20px' }}
                iconType="circle"
                formatter={(value) => (
                  <span style={{ color: '#6B7280', fontSize: '13px', fontWeight: 600 }}>{value}</span>
                )}
              />
              <Bar
                dataKey="current"
                name="Current Bookings"
                fill="url(#barGradientCurrent)"
                radius={[8, 8, 0, 0]}
                maxBarSize={60}
              />
              <Bar
                dataKey="remaining"
                name="Remaining to Sell"
                fill="#E5E4E0"
                radius={[8, 8, 0, 0]}
                maxBarSize={60}
              />
              {showYoYComparison && (
                <Bar
                  dataKey="lastYear"
                  name="Last Year"
                  fill="#CDB261"
                  fillOpacity={0.6}
                  radius={[8, 8, 0, 0]}
                  maxBarSize={60}
                />
              )}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={handleRefresh}
        disabled={isRefreshing}
        className="absolute top-0 right-0 p-1.5 sm:p-2 text-neutral-400 hover:text-neutral-600 transition-colors z-10"
        title="Refresh data"
      >
        <RefreshCw className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
      </button>

      <div className="h-64 sm:h-96 px-0 sm:px-4 py-4 sm:py-6">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 10 }}>
            <defs>
              <linearGradient id="colorCurrent" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#A57865" stopOpacity={0.6} />
                <stop offset="50%" stopColor="#A57865" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#A57865" stopOpacity={0.1} />
              </linearGradient>
              <linearGradient id="colorExpected" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#5C9BA4" stopOpacity={0.5} />
                <stop offset="50%" stopColor="#5C9BA4" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#5C9BA4" stopOpacity={0.05} />
              </linearGradient>
              <filter id="shadow" height="200%">
                <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#A57865" floodOpacity="0.2" />
              </filter>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#9CA3AF"
              strokeOpacity={0.6}
              vertical={false}
            />
            <XAxis
              dataKey="displayDate"
              tick={{ fontSize: 12, fill: '#6B7280', fontWeight: 500 }}
              axisLine={{ stroke: '#D1D5DB', strokeWidth: 1 }}
              tickLine={false}
              tickMargin={12}
            />
            <YAxis
              tick={{ fontSize: 12, fill: '#6B7280', fontWeight: 500 }}
              axisLine={false}
              tickLine={false}
              tickMargin={10}
            />
            <Tooltip
              content={<CustomTooltip />}
              cursor={{ stroke: '#A57865', strokeWidth: 1, strokeDasharray: '4 4', strokeOpacity: 0.3 }}
            />
            <Legend
              wrapperStyle={{ paddingTop: '20px' }}
              iconType="circle"
              formatter={(value) => (
                <span style={{ color: '#6B7280', fontSize: '13px', fontWeight: 600 }}>{value}</span>
              )}
            />
            <Area
              type="monotone"
              dataKey="expected"
              name="Expected Total"
              stroke="#3B8A94"
              strokeWidth={3}
              strokeDasharray="5 5"
              fill="url(#colorExpected)"
              dot={false}
              activeDot={{ r: 6, fill: '#3B8A94', stroke: '#fff', strokeWidth: 2 }}
            />
            <Area
              type="monotone"
              dataKey="current"
              name="Current Bookings"
              stroke="#8E6554"
              strokeWidth={3.5}
              fill="url(#colorCurrent)"
              dot={false}
              activeDot={{ r: 7, fill: '#8E6554', stroke: '#fff', strokeWidth: 2 }}
            />
            {showYoYComparison && (
              <Line
                type="monotone"
                dataKey="lastYear"
                name="Last Year"
                stroke="#B8A055"
                strokeWidth={2.5}
                strokeDasharray="4 4"
                dot={false}
                activeDot={{ r: 5, fill: '#B8A055', stroke: '#fff', strokeWidth: 2 }}
              />
            )}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

// Pickup Summary Card Component - Connected to API
interface PickupSummaryCardProps {
  period?: 'next7Days' | 'next14Days' | 'next30Days';
  refreshKey?: number;
}

export const PickupSummaryCard = ({ period = 'next7Days', refreshKey = 0 }: PickupSummaryCardProps) => {
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [metrics, setMetrics] = useState<{
    avgBookings: number;
    avgProgress: number;
    strongDays: number;
    criticalDays: number;
    totalRemaining: number;
  } | null>(null);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const days = period === 'next7Days' ? 7 : period === 'next14Days' ? 14 : 30;
        const response = await revenueIntelligenceService.getPickupMetrics(days);

        const pickupData = response.pickup_data || [];
        const avgBookings = pickupData.length > 0
          ? Math.round(pickupData.reduce((sum, d) => sum + d.booked, 0) / pickupData.length)
          : 0;
        const avgProgress = pickupData.length > 0
          ? Math.round(pickupData.reduce((sum, d) => sum + (d.occupancy / d.expected_occupancy) * 100, 0) / pickupData.length)
          : 0;
        const strongDays = pickupData.filter(d => d.pace === 'strong').length;
        const criticalDays = pickupData.filter(d => d.pace === 'critical').length;
        const totalRemaining = pickupData.reduce((sum, d) => sum + d.remaining, 0);

        setMetrics({ avgBookings, avgProgress, strongDays, criticalDays, totalRemaining });
      } catch (err) {
        console.error('Failed to fetch pickup metrics:', err);
        showToast('Failed to load pickup metrics', 'error');
      } finally {
        setIsLoading(false);
      }
    };

    fetchMetrics();
  }, [period, showToast, refreshKey]);

  const accentColors = {
    next7Days: { bg: 'bg-terra-50', icon: 'text-terra-600' },
    next14Days: { bg: 'bg-ocean-50', icon: 'text-ocean-600' },
    next30Days: { bg: 'bg-sage-50', icon: 'text-sage-600' },
  };

  const style = accentColors[period] || accentColors.next7Days;

  if (isLoading) {
    return (
      <div className="relative overflow-hidden rounded-[10px] bg-white p-4 sm:p-6 animate-pulse">
        <div className="h-6 sm:h-8 bg-neutral-100 rounded w-20 sm:w-24 mb-3 sm:mb-4" />
        <div className="h-8 sm:h-10 bg-neutral-100 rounded w-16 sm:w-20 mb-2" />
        <div className="h-5 sm:h-6 bg-neutral-100 rounded w-14 sm:w-16" />
      </div>
    );
  }

  if (!metrics) return null;

  return (
    <div className="relative overflow-hidden rounded-[10px] bg-white p-4 sm:p-6">
      {/* Header with Icon and Title */}
      <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
        <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center ${style.bg}`}>
          <Calendar className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${style.icon}`} />
        </div>
        <p className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-widest text-neutral-400">
          {period === 'next7Days'
            ? 'Next 7 Days'
            : period === 'next14Days'
              ? 'Next 14 Days'
              : 'Next 30 Days'}
        </p>
      </div>

      {/* Main Value */}
      <p className="text-xl sm:text-[28px] font-semibold tracking-tight text-neutral-900 mb-1.5 sm:mb-2">
        {metrics.avgBookings}{' '}
        <span className="text-[13px] sm:text-[15px] font-medium text-neutral-400">avg bookings</span>
      </p>

      {/* Progress */}
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <p className="text-[10px] sm:text-[11px] text-neutral-400 font-medium">Avg Progress</p>
        <p className="text-[13px] sm:text-[15px] font-semibold text-neutral-800">{metrics.avgProgress}%</p>
      </div>

      {/* Pace Indicators */}
      <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4 flex-wrap">
        <div className="flex items-center gap-1 sm:gap-1.5 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full bg-sage-50">
          <TrendingUp className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-sage-600" />
          <span className="text-[10px] sm:text-[11px] font-semibold text-sage-600">{metrics.strongDays} strong</span>
        </div>
        <div className="flex items-center gap-1 sm:gap-1.5 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full bg-rose-50">
          <AlertCircle className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-rose-600" />
          <span className="text-[10px] sm:text-[11px] font-semibold text-rose-600">{metrics.criticalDays} critical</span>
        </div>
      </div>

      {/* Footer */}
      <div className="pt-2 sm:pt-3 border-t border-neutral-100">
        <div className="flex items-center justify-between">
          <span className="text-[10px] sm:text-[11px] text-neutral-400 font-medium">Rooms to Sell</span>
          <span className="text-[13px] sm:text-[15px] font-semibold text-terra-600">{metrics.totalRemaining}</span>
        </div>
      </div>
    </div>
  );
};

// Pickup Pace Indicator - Connected to API
interface PickupPaceIndicatorProps {
  date: string | Date;
}

export const PickupPaceIndicator = ({ date }: PickupPaceIndicatorProps) => {
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<{
    paceStatus: string;
    bookingProgress: number;
  } | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const dateStr = typeof date === 'string' ? date : date.toISOString().split('T')[0];
        const response = await revenueIntelligenceService.getPickupMetrics(30);
        const dayData = response.pickup_data?.find(d => d.date === dateStr);

        if (dayData) {
          setData({
            paceStatus: dayData.pace,
            bookingProgress: Math.round((dayData.occupancy / dayData.expected_occupancy) * 100),
          });
        }
      } catch (err) {
        console.error('Failed to fetch pickup pace:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [date]);

  const getStatusStyles = (status: string) => {
    switch (status) {
      case 'strong':
        return 'bg-sage-50 border-sage-200 text-sage-700';
      case 'on_pace':
      case 'on-pace':
        return 'bg-ocean-50 border-ocean-200 text-ocean-700';
      case 'slow':
        return 'bg-gold-50 border-gold-200 text-gold-700';
      case 'critical':
        return 'bg-rose-50 border-rose-200 text-rose-700';
      default:
        return 'bg-neutral-50 border-neutral-200 text-neutral-700';
    }
  };

  const getPaceStatusIcon = (status: string) => {
    switch (status) {
      case 'strong':
        return <TrendingUp className="w-4 h-4" />;
      case 'on_pace':
      case 'on-pace':
        return <CheckCircle className="w-4 h-4" />;
      case 'slow':
        return <TrendingDown className="w-4 h-4" />;
      case 'critical':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border bg-neutral-50 border-neutral-200 animate-pulse">
        <div className="w-4 h-4 bg-neutral-200 rounded" />
        <div className="w-16 h-4 bg-neutral-200 rounded" />
      </div>
    );
  }

  if (!data) return null;

  return (
    <div
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border ${getStatusStyles(data.paceStatus)}`}
    >
      {getPaceStatusIcon(data.paceStatus)}
      <span className="text-sm font-medium capitalize">
        {data.paceStatus?.replace('_', ' ').replace('-', ' ')}
      </span>
      <span className="text-sm opacity-75">&#8226; {data.bookingProgress}%</span>
    </div>
  );
};

export default PickupChart;
