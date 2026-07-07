import { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, Download, RefreshCw, ChevronDown, Sparkles, AlertCircle, TrendingUp, Lightbulb, Target } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/contexts/ToastContext';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { reportsService, BookingsOccupancyReport as ReportData, AIInsight, ExportFormat } from '../../api/services/reports.service';

const formatCurrency = (value: number) => {
  if (value >= 1000000) {
    return `₹${(value / 1000000).toFixed(1)}M`;
  }
  if (value >= 1000) {
    return `₹${(value / 1000).toFixed(1)}K`;
  }
  return `₹${value.toLocaleString()}`;
};

const DATE_RANGES = [
  { value: 'today', label: 'Today', shortLabel: 'Today' },
  { value: 'yesterday', label: 'Yesterday', shortLabel: 'Yest.' },
  { value: 'this_week', label: 'This Week', shortLabel: 'Week' },
  { value: 'last_week', label: 'Last Week', shortLabel: 'Last Wk' },
  { value: 'this_month', label: 'This Month', shortLabel: 'Month' },
  { value: 'last_month', label: 'Last Month', shortLabel: 'Last Mo' },
  { value: 'last_30_days', label: 'Last 30 Days', shortLabel: '30 Days' },
  { value: 'ytd', label: 'Year to Date', shortLabel: 'YTD' },
  { value: 'custom', label: 'Custom Range', shortLabel: 'Custom' }
];

const todayISO = () => new Date().toISOString().split('T')[0];

const formatRangeLabel = (start: string, end: string) => {
  if (!start || !end) return 'Custom Range';
  const fmt = (d: string) =>
    new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
  return `${fmt(start)} – ${fmt(end)}`;
};

// Helper to get icon and colors for AI insight type
const getInsightStyle = (type: string) => {
  switch (type) {
    case 'warning':
      return {
        bg: 'bg-rose-50',
        border: 'border-rose-200',
        iconBg: 'bg-rose-100',
        iconColor: 'text-rose-600',
        titleColor: 'text-rose-800',
        Icon: AlertCircle,
      };
    case 'opportunity':
      return {
        bg: 'bg-sage-50',
        border: 'border-sage-200',
        iconBg: 'bg-sage-100',
        iconColor: 'text-sage-600',
        titleColor: 'text-sage-800',
        Icon: TrendingUp,
      };
    default:
      return {
        bg: 'bg-ocean-50',
        border: 'border-ocean-200',
        iconBg: 'bg-ocean-100',
        iconColor: 'text-ocean-600',
        titleColor: 'text-ocean-800',
        Icon: Lightbulb,
      };
  }
};

const EXPORT_OPTIONS: { value: ExportFormat; label: string; icon: string }[] = [
  { value: 'csv', label: 'CSV Spreadsheet', icon: '📄' },
  { value: 'excel', label: 'Excel Workbook', icon: '📊' },
  { value: 'pdf', label: 'PDF Document', icon: '📑' },
];

export default function BookingsOccupancyReport() {
  const navigate = useNavigate();
  const [dateRange, setDateRange] = useState('last_30_days');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');
  const [dateDropdownOpen, setDateDropdownOpen] = useState(false);
  const [exportDropdownOpen, setExportDropdownOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const customRange =
    dateRange === 'custom' && customStart && customEnd
      ? { startDate: customStart, endDate: customEnd }
      : undefined;

  // Fetch report data
  const fetchReport = useCallback(async () => {
    // Wait for both dates before fetching a custom range
    if (dateRange === 'custom' && (!customStart || !customEnd)) return;
    try {
      setError(null);
      const data = await reportsService.getBookingsOccupancyReport(
        dateRange,
        undefined,
        dateRange === 'custom' ? { startDate: customStart, endDate: customEnd } : undefined
      );
      setReportData(data);
    } catch (err) {
      console.error('Failed to fetch report:', err);
      setError('Failed to load report data. Please try again.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [dateRange, customStart, customEnd]);

  useEffect(() => {
    setIsLoading(true);
    fetchReport();
  }, [fetchReport]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchReport();
  };

  const { success, error: showError } = useToast();

  const handleExport = async (format: ExportFormat) => {
    try {
      setIsExporting(true);
      setExportDropdownOpen(false);
      await reportsService.getBookingsOccupancyReport(dateRange, format, customRange);
      success(`Report exported as ${format.toUpperCase()}`);
    } catch (err) {
      console.error('Failed to export report:', err);
      showError('Export failed. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#F9F7F7' }}>
        <div className="flex flex-col items-center gap-4">
          <RefreshCw className="w-10 h-10 text-terra-500 animate-spin" />
          <p className="text-neutral-500 font-medium">Loading report...</p>
        </div>
      </div>
    );
  }

  if (error || !reportData) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#F9F7F7' }}>
        <div className="flex flex-col items-center gap-4 text-center">
          <AlertCircle className="w-10 h-10 text-rose-500" />
          <p className="text-neutral-700 font-medium">{error || 'Failed to load report'}</p>
          <button
            onClick={handleRefresh}
            className="px-4 py-2 bg-terra-500 text-white rounded-lg text-sm font-medium"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const { summary, comparisons, daily_occupancy, daily_bookings, booking_sources, room_type_performance, ai_insights } = reportData;
  const totalSourceBookings = booking_sources.reduce((sum, s) => sum + s.value, 0);

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F9F7F7' }}>
      <div className="px-4 sm:px-6 lg:px-10 py-4 sm:py-6 lg:py-8 space-y-4 sm:space-y-6 lg:space-y-8">
        {/* Header */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3 sm:gap-4">
            <button
              onClick={() => navigate('/admin/reports')}
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center bg-white border border-neutral-200 flex-shrink-0"
            >
              <ArrowLeft className="w-4 h-4 text-neutral-600" />
            </button>
            <div>
              <h1 className="text-lg sm:text-xl font-semibold text-neutral-900">Bookings & Occupancy</h1>
              <p className="text-[12px] sm:text-[13px] text-neutral-500">Booking trends and occupancy analytics</p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <div className="relative">
              <button
                onClick={() => setDateDropdownOpen(!dateDropdownOpen)}
                className="h-8 sm:h-9 min-w-[70px] sm:min-w-[120px] px-3 sm:px-4 pr-8 sm:pr-9 rounded-lg bg-white border border-neutral-200 text-[12px] sm:text-[13px] font-medium text-neutral-700 cursor-pointer flex items-center hover:border-neutral-300 transition-colors"
              >
                <span className="hidden sm:inline truncate">
                  {dateRange === 'custom' && customStart && customEnd
                    ? formatRangeLabel(customStart, customEnd)
                    : DATE_RANGES.find(r => r.value === dateRange)?.label}
                </span>
                <span className="sm:hidden truncate">{DATE_RANGES.find(r => r.value === dateRange)?.shortLabel}</span>
                <ChevronDown className={`w-4 h-4 text-neutral-400 absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 transition-transform flex-shrink-0 ${dateDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              {dateDropdownOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setDateDropdownOpen(false)} />
                  <div className="absolute left-0 sm:left-auto sm:right-0 top-full mt-1 w-56 bg-white border border-neutral-200 rounded-lg shadow-lg py-1 z-50">
                    {DATE_RANGES.filter(r => r.value !== 'custom').map(range => (
                      <button
                        key={range.value}
                        onClick={() => {
                          setDateRange(range.value);
                          setDateDropdownOpen(false);
                        }}
                        className={`w-full px-3 py-2 text-left text-[13px] font-medium transition-colors ${
                          dateRange === range.value
                            ? 'bg-terra-50 text-terra-600'
                            : 'text-neutral-700 hover:bg-neutral-50'
                        }`}
                      >
                        {range.label}
                      </button>
                    ))}

                    {/* Custom range picker */}
                    <div className="mt-1 pt-2 border-t border-neutral-100 px-3 pb-1">
                      <p className={`text-[11px] font-semibold uppercase tracking-wider mb-2 ${dateRange === 'custom' ? 'text-terra-600' : 'text-neutral-400'}`}>
                        Custom Range
                      </p>
                      <label className="block text-[11px] font-medium text-neutral-500 mb-1">From</label>
                      <input
                        type="date"
                        value={customStart}
                        max={customEnd || todayISO()}
                        onChange={(e) => setCustomStart(e.target.value)}
                        className="w-full mb-2 px-2 py-1.5 rounded-md border border-neutral-200 text-[13px] text-neutral-700 focus:outline-none focus:border-terra-400"
                      />
                      <label className="block text-[11px] font-medium text-neutral-500 mb-1">To</label>
                      <input
                        type="date"
                        value={customEnd}
                        min={customStart || undefined}
                        max={todayISO()}
                        onChange={(e) => setCustomEnd(e.target.value)}
                        className="w-full mb-2 px-2 py-1.5 rounded-md border border-neutral-200 text-[13px] text-neutral-700 focus:outline-none focus:border-terra-400"
                      />
                      <button
                        onClick={() => {
                          if (!customStart || !customEnd) return;
                          setDateRange('custom');
                          setDateDropdownOpen(false);
                        }}
                        disabled={!customStart || !customEnd}
                        className="w-full py-1.5 rounded-md bg-terra-500 text-white text-[13px] font-medium hover:bg-terra-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Apply
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center bg-white border border-neutral-200 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 text-neutral-500 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>
            <div className="relative">
              <button
                onClick={() => setExportDropdownOpen(!exportDropdownOpen)}
                disabled={isExporting}
                className="h-8 sm:h-9 px-3 sm:px-4 pr-8 sm:pr-9 rounded-lg bg-terra-500 text-white text-[12px] sm:text-[13px] font-medium flex items-center gap-2 hover:bg-terra-600 transition-colors disabled:opacity-50"
              >
                <Download className={`w-4 h-4 ${isExporting ? 'animate-pulse' : ''}`} />
                <span className="hidden sm:inline">{isExporting ? 'Exporting...' : 'Export'}</span>
                <ChevronDown className={`w-4 h-4 absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 transition-transform ${exportDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              {exportDropdownOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setExportDropdownOpen(false)} />
                  <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-neutral-200 rounded-lg shadow-lg py-1 z-50">
                    {EXPORT_OPTIONS.map(option => (
                      <button
                        key={option.value}
                        onClick={() => handleExport(option.value)}
                        className="w-full px-3 py-2 text-left text-[13px] font-medium text-neutral-700 hover:bg-neutral-50 flex items-center gap-2"
                      >
                        <span>{option.icon}</span>
                        {option.label}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Stats Grid */}
        <section className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          <div className="bg-white rounded-xl p-4 sm:p-5">
            <p className="text-[10px] sm:text-[11px] font-medium text-neutral-400 uppercase tracking-wider mb-1">Total Bookings</p>
            <p className="text-xl sm:text-2xl font-semibold text-neutral-900">{summary.total_bookings.toLocaleString()}</p>
            <p className={`text-[10px] sm:text-[11px] font-medium mt-1 ${comparisons.bookings_change >= 0 ? 'text-sage-600' : 'text-rose-600'}`}>
              {comparisons.bookings_change >= 0 ? '+' : ''}{comparisons.bookings_change}% vs last period
            </p>
          </div>
          <div className="bg-white rounded-xl p-4 sm:p-5">
            <p className="text-[10px] sm:text-[11px] font-medium text-neutral-400 uppercase tracking-wider mb-1">Avg Occupancy</p>
            <p className="text-xl sm:text-2xl font-semibold text-neutral-900">{summary.avg_occupancy}%</p>
            <p className={`text-[10px] sm:text-[11px] font-medium mt-1 ${comparisons.occupancy_change >= 0 ? 'text-sage-600' : 'text-rose-600'}`}>
              {comparisons.occupancy_change >= 0 ? '+' : ''}{comparisons.occupancy_change}% vs last period
            </p>
          </div>
          <div className="bg-white rounded-xl p-4 sm:p-5">
            <p className="text-[10px] sm:text-[11px] font-medium text-neutral-400 uppercase tracking-wider mb-1">Avg ADR</p>
            <p className="text-xl sm:text-2xl font-semibold text-neutral-900">₹{summary.avg_adr.toLocaleString()}</p>
            <p className={`text-[10px] sm:text-[11px] font-medium mt-1 ${comparisons.adr_change >= 0 ? 'text-sage-600' : 'text-rose-600'}`}>
              {comparisons.adr_change >= 0 ? '+' : ''}{comparisons.adr_change}% vs last period
            </p>
          </div>
          <div className="bg-white rounded-xl p-4 sm:p-5">
            <p className="text-[10px] sm:text-[11px] font-medium text-neutral-400 uppercase tracking-wider mb-1">Avg RevPAR</p>
            <p className="text-xl sm:text-2xl font-semibold text-neutral-900">₹{summary.avg_revpar.toLocaleString()}</p>
            <p className={`text-[10px] sm:text-[11px] font-medium mt-1 ${comparisons.revpar_change >= 0 ? 'text-sage-600' : 'text-rose-600'}`}>
              {comparisons.revpar_change >= 0 ? '+' : ''}{comparisons.revpar_change}% vs last period
            </p>
          </div>
          <div className="bg-white rounded-xl p-4 sm:p-5">
            <p className="text-[10px] sm:text-[11px] font-medium text-neutral-400 uppercase tracking-wider mb-1">Total Revenue</p>
            <p className="text-xl sm:text-2xl font-semibold text-neutral-900">{formatCurrency(summary.total_revenue)}</p>
            <p className={`text-[10px] sm:text-[11px] font-medium mt-1 ${comparisons.revenue_change >= 0 ? 'text-sage-600' : 'text-rose-600'}`}>
              {comparisons.revenue_change >= 0 ? '+' : ''}{comparisons.revenue_change}% vs last period
            </p>
          </div>
          <div className="bg-white rounded-xl p-4 sm:p-5">
            <p className="text-[10px] sm:text-[11px] font-medium text-neutral-400 uppercase tracking-wider mb-1">Direct Bookings</p>
            <p className="text-xl sm:text-2xl font-semibold text-neutral-900">{summary.direct_percent}%</p>
            <p className={`text-[10px] sm:text-[11px] font-medium mt-1 ${comparisons.direct_change >= 0 ? 'text-sage-600' : 'text-rose-600'}`}>
              {comparisons.direct_change >= 0 ? '+' : ''}{comparisons.direct_change}% vs last period
            </p>
          </div>
        </section>

        {/* AI Insights Section */}
        {ai_insights && ai_insights.length > 0 && (
          <section className="rounded-[10px] bg-white overflow-hidden">
            <div className="px-4 sm:px-6 py-4 sm:py-5 flex items-center gap-3 border-b border-neutral-100">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-purple-100">
                <Sparkles className="w-4 h-4 text-purple-600" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-neutral-800">AI-Powered Insights</h3>
                <p className="text-[11px] text-neutral-400 font-medium mt-0.5">
                  Intelligent recommendations based on booking patterns
                </p>
              </div>
            </div>
            <div className="p-4 sm:p-6 space-y-3 sm:space-y-4">
              {ai_insights.map((insight: AIInsight, idx: number) => {
                const style = getInsightStyle(insight.type);
                const { Icon } = style;
                return (
                  <div
                    key={idx}
                    className={`rounded-lg border p-3 sm:p-4 ${style.bg} ${style.border}`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${style.iconBg}`}>
                        <Icon className={`w-4 h-4 sm:w-5 sm:h-5 ${style.iconColor}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <h4 className={`text-[12px] sm:text-[13px] font-semibold ${style.titleColor}`}>
                            {insight.title}
                          </h4>
                          <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                            insight.priority === 'high'
                              ? 'bg-rose-100 text-rose-700'
                              : insight.priority === 'medium'
                                ? 'bg-gold-100 text-gold-700'
                                : 'bg-neutral-100 text-neutral-600'
                          }`}>
                            {insight.priority} priority
                          </span>
                        </div>
                        <p className="text-[11px] sm:text-[12px] text-neutral-600 mb-2">{insight.message}</p>
                        <div className="flex items-center gap-2">
                          <Target className="w-3.5 h-3.5 text-neutral-400 flex-shrink-0" />
                          <span className="text-[10px] sm:text-[11px] font-medium text-neutral-500">
                            Recommended Action: {insight.action}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Charts Row 1 - Line Charts */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {/* Occupancy Trend */}
          <div className="bg-white rounded-xl p-4 sm:p-6">
            <h3 className="text-sm font-semibold text-neutral-900 mb-1">Occupancy Trend</h3>
            <p className="text-[12px] text-neutral-500 mb-4">Daily occupancy rate over time</p>

            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={daily_occupancy} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                  <XAxis
                    dataKey="date"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 11, fill: '#737373' }}
                    tickFormatter={(value) => {
                      const date = new Date(value);
                      return `${date.getDate()}/${date.getMonth() + 1}`;
                    }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 11, fill: '#737373' }}
                    width={40}
                    tickFormatter={(v) => `${v}%`}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-neutral-900 text-white text-[12px] px-3 py-2 rounded-lg">
                            <p className="font-medium">{payload[0].payload.date}</p>
                            <p>Occupancy: {payload[0].value}%</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="occupancy"
                    stroke="#5C9BA4"
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 4, fill: '#5C9BA4' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* ADR & RevPAR Trend */}
          <div className="bg-white rounded-xl p-4 sm:p-6">
            <h3 className="text-sm font-semibold text-neutral-900 mb-1">ADR & RevPAR Trend</h3>
            <p className="text-[12px] text-neutral-500 mb-4">Average daily rate and revenue per available room</p>

            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={daily_occupancy} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                  <XAxis
                    dataKey="date"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 11, fill: '#737373' }}
                    tickFormatter={(value) => {
                      const date = new Date(value);
                      return `${date.getDate()}/${date.getMonth() + 1}`;
                    }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 11, fill: '#737373' }}
                    width={45}
                    tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-neutral-900 text-white text-[12px] px-3 py-2 rounded-lg">
                            <p className="font-medium mb-1">{payload[0].payload.date}</p>
                            <p>ADR: ₹{payload[0].payload.adr?.toLocaleString()}</p>
                            <p>RevPAR: ₹{payload[0].payload.revpar?.toLocaleString()}</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Line type="monotone" dataKey="adr" stroke="#4E5840" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="revpar" stroke="#CDB261" strokeWidth={2} dot={false} />
                  <Legend
                    verticalAlign="bottom"
                    height={36}
                    formatter={(value) => <span className="text-[12px] text-neutral-600">{value === 'adr' ? 'ADR' : 'RevPAR'}</span>}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </section>

        {/* Charts Row 2 */}
        <section className="grid grid-cols-1 lg:grid-cols-5 gap-4 sm:gap-6">
          {/* Booking Sources Pie Chart */}
          <div className="lg:col-span-2 bg-white rounded-xl p-4 sm:p-6">
            <h3 className="text-sm font-semibold text-neutral-900 mb-1">Booking Sources</h3>
            <p className="text-[12px] text-neutral-500 mb-4">Distribution by channel</p>

            <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
              <div className="w-32 h-32 sm:w-40 sm:h-40 flex-shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={booking_sources}
                      cx="50%"
                      cy="50%"
                      innerRadius={35}
                      outerRadius={55}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {booking_sources.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="flex-1 space-y-2 sm:space-y-3 w-full">
                {booking_sources.map((item) => (
                  <div key={item.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                      <span className="text-[12px] sm:text-[13px] text-neutral-600">{item.name}</span>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-3">
                      <span className="text-[12px] sm:text-[13px] font-medium text-neutral-900">{item.value}</span>
                      <span className="text-[10px] sm:text-[11px] text-neutral-400 w-8 sm:w-10 text-right">
                        {totalSourceBookings > 0 ? ((item.value / totalSourceBookings) * 100).toFixed(0) : 0}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Daily Bookings Bar Chart */}
          <div className="xl:col-span-3 bg-white rounded-xl p-4 sm:p-6">
            <h3 className="text-sm font-semibold text-neutral-900 mb-1">Daily Bookings</h3>
            <p className="text-[12px] text-neutral-500 mb-4">New bookings per day</p>

            <div className="h-44 sm:h-52">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={daily_bookings} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                  <XAxis
                    dataKey="date"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 11, fill: '#737373' }}
                    tickFormatter={(value) => {
                      const date = new Date(value);
                      return `${date.getDate()}/${date.getMonth() + 1}`;
                    }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 11, fill: '#737373' }}
                    width={30}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-neutral-900 text-white text-[12px] px-3 py-2 rounded-lg">
                            <p className="font-medium">{payload[0].payload.date}</p>
                            <p>{payload[0].value} bookings</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="total" fill="#4E5840" radius={[3, 3, 0, 0]} maxBarSize={24} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </section>

        {/* Room Type Performance Table */}
        <section className="bg-white rounded-xl p-4 sm:p-6">
          <h3 className="text-sm font-semibold text-neutral-900 mb-1">Room Type Performance</h3>
          <p className="text-[12px] text-neutral-500 mb-3 sm:mb-4">Bookings and revenue by room category</p>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-neutral-100">
                  <th className="text-left text-[11px] font-medium text-neutral-400 uppercase tracking-wider pb-3">Room Type</th>
                  <th className="text-right text-[11px] font-medium text-neutral-400 uppercase tracking-wider pb-3">Bookings</th>
                  <th className="text-right text-[11px] font-medium text-neutral-400 uppercase tracking-wider pb-3">Revenue</th>
                  <th className="text-right text-[11px] font-medium text-neutral-400 uppercase tracking-wider pb-3">Occupancy</th>
                </tr>
              </thead>
              <tbody>
                {room_type_performance.map((room, index) => (
                  <tr key={index} className="border-b border-neutral-50 last:border-0">
                    <td className="py-3 text-[13px] font-medium text-neutral-900">{room.name}</td>
                    <td className="py-3 text-[13px] text-neutral-600 text-right">{room.bookings}</td>
                    <td className="py-3 text-[13px] text-neutral-600 text-right">{formatCurrency(room.revenue)}</td>
                    <td className="py-3 text-right">
                      <span className="inline-block px-2 py-0.5 rounded text-[11px] font-medium bg-sage-50 text-sage-700">
                        {room.occupancy}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}
