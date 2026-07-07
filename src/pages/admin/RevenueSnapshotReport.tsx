import { useState, useCallback, useEffect } from 'react';
import { ArrowLeft, Download, RefreshCw, ChevronDown, AlertTriangle, Lightbulb, Info, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button, IconButton } from '@/components/ui2/Button';
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
import { reportsService, RevenueSnapshotReport as RevenueSnapshotReportType, AIInsight, ExportFormat } from '../../api/services/reports.service';
import { useCurrency } from '@/hooks/useCurrency';
import { useToast } from '@/contexts/ToastContext';

const formatCurrencyAbbr = (value: number, sym: string) => {
  if (value >= 1000000) {
    return `${sym}${(value / 1000000).toFixed(1)}M`;
  }
  if (value >= 1000) {
    return `${sym}${(value / 1000).toFixed(1)}K`;
  }
  return `${sym}${value.toLocaleString()}`;
};

const SOURCE_COLORS = ['#4E5840', '#A57865', '#5C9BA4', '#CDB261', '#C8B29D'];

const DATE_RANGES = [
  { value: 'today', label: 'Today', shortLabel: 'Today' },
  { value: 'yesterday', label: 'Yesterday', shortLabel: 'Yest.' },
  { value: 'this_week', label: 'This Week', shortLabel: 'Week' },
  { value: 'last_week', label: 'Last Week', shortLabel: 'Last Wk' },
  { value: 'this_month', label: 'This Month', shortLabel: 'Month' },
  { value: 'last_month', label: 'Last Month', shortLabel: 'Last Mo' },
  { value: 'last_30_days', label: 'Last 30 Days', shortLabel: '30 Days' },
  { value: 'ytd', label: 'Year to Date', shortLabel: 'YTD' }
];

const getInsightIcon = (type: AIInsight['type']) => {
  switch (type) {
    case 'warning':
      return <AlertTriangle className="w-4 h-4 text-amber-500" />;
    case 'opportunity':
      return <Lightbulb className="w-4 h-4 text-green-500" />;
    default:
      return <Info className="w-4 h-4 text-blue-500" />;
  }
};

const getInsightBgColor = (type: AIInsight['type']) => {
  switch (type) {
    case 'warning':
      return 'bg-amber-50 border-amber-200';
    case 'opportunity':
      return 'bg-green-50 border-green-200';
    default:
      return 'bg-blue-50 border-blue-200';
  }
};

const EXPORT_OPTIONS: { value: ExportFormat; label: string; icon: string }[] = [
  { value: 'csv', label: 'CSV Spreadsheet', icon: '📄' },
  { value: 'excel', label: 'Excel Workbook', icon: '📊' },
  { value: 'pdf', label: 'PDF Document', icon: '📑' },
];

export default function RevenueSnapshotReport() {
  const navigate = useNavigate();
  const { symbol } = useCurrency();
  const formatCurrency = (value: number) => formatCurrencyAbbr(value, symbol);
  const [dateRange, setDateRange] = useState('last_30_days');
  const [dateDropdownOpen, setDateDropdownOpen] = useState(false);
  const [exportDropdownOpen, setExportDropdownOpen] = useState(false);
  const [reportData, setReportData] = useState<RevenueSnapshotReportType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchReport = useCallback(async () => {
    try {
      setError(null);
      const data = await reportsService.getRevenueSnapshotReport(dateRange);
      setReportData(data);
    } catch (err) {
      console.error('Failed to fetch revenue report:', err);
      setError('Failed to load report data. Please try again.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [dateRange]);

  useEffect(() => {
    setIsLoading(true);
    fetchReport();
  }, [fetchReport]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchReport();
  };

  const { success, error: showError } = useToast();

  const handleExport = useCallback(async (format: ExportFormat) => {
    try {
      setIsExporting(true);
      setExportDropdownOpen(false);
      await reportsService.getRevenueSnapshotReport(dateRange, format);
      success(`Report exported as ${format.toUpperCase()}`);
    } catch (err) {
      console.error('Export failed:', err);
      showError('Export failed. Please try again.');
    } finally {
      setIsExporting(false);
    }
  }, [dateRange]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#F9F7F7' }}>
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-terra-500" />
          <p className="text-neutral-600">Loading revenue report...</p>
        </div>
      </div>
    );
  }

  if (error || !reportData) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#F9F7F7' }}>
        <div className="flex flex-col items-center gap-4 text-center">
          <AlertTriangle className="w-12 h-12 text-amber-500" />
          <p className="text-neutral-600">{error || 'Failed to load report'}</p>
          <Button variant="primary" onClick={handleRefresh}>
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  const { summary, comparisons, daily_data, revenue_by_source, revenue_by_room_type, weekly_summary, ai_insights } = reportData;

  // Calculate total for pie chart percentages
  const totalSourceRevenue = revenue_by_source.reduce((sum, s) => sum + s.value, 0);

  // Get last 14 days for daily bar chart
  const dailyRevenueData = daily_data.slice(-14);

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F9F7F7' }}>
      <div className="px-4 sm:px-6 lg:px-10 py-4 sm:py-6 lg:py-8 space-y-4 sm:space-y-6 lg:space-y-8">
        {/* Header */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3 sm:gap-4">
            <IconButton
              icon={ArrowLeft}
              variant="outline"
              size="sm"
              label="Back to Reports"
              onClick={() => navigate('/admin/reports')}
            />
            <div>
              <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-neutral-900">Revenue Snapshot</h1>
              <p className="text-[12px] sm:text-[13px] text-neutral-500">Comprehensive revenue analysis and forecasting</p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <div className="relative">
              <button
                onClick={() => setDateDropdownOpen(!dateDropdownOpen)}
                className="h-8 sm:h-9 min-w-[70px] sm:min-w-[120px] px-3 sm:px-4 pr-8 sm:pr-9 rounded-lg bg-white border border-neutral-200 text-[12px] sm:text-[13px] font-medium text-neutral-700 cursor-pointer flex items-center hover:border-neutral-300 transition-colors"
              >
                <span className="hidden sm:inline truncate">{DATE_RANGES.find(r => r.value === dateRange)?.label}</span>
                <span className="sm:hidden truncate">{DATE_RANGES.find(r => r.value === dateRange)?.shortLabel}</span>
                <ChevronDown className={`w-4 h-4 text-neutral-400 absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 transition-transform flex-shrink-0 ${dateDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              {dateDropdownOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setDateDropdownOpen(false)} />
                  <div className="absolute left-0 sm:left-auto sm:right-0 top-full mt-1 w-44 bg-white border border-neutral-200 rounded-lg shadow-lg py-1 z-50">
                    {DATE_RANGES.map(range => (
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
                  </div>
                </>
              )}
            </div>
            <IconButton
              icon={RefreshCw}
              variant="outline"
              size="sm"
              label="Refresh"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className={isRefreshing ? '[&_svg]:animate-spin' : ''}
            />
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
          <div className="bg-white rounded-[10px] border border-neutral-100 p-4 sm:p-5">
            <p className="text-[10px] sm:text-[11px] font-medium text-neutral-400 uppercase tracking-wider mb-1">Total Revenue</p>
            <p className="text-xl sm:text-2xl font-semibold text-neutral-900">{formatCurrency(summary.total_revenue)}</p>
            <p className={`text-[10px] sm:text-[11px] font-medium mt-1 ${comparisons.revenue_change >= 0 ? 'text-sage-600' : 'text-red-500'}`}>
              {comparisons.revenue_change >= 0 ? '+' : ''}{comparisons.revenue_change.toFixed(1)}% vs last period
            </p>
          </div>
          <div className="bg-white rounded-[10px] border border-neutral-100 p-4 sm:p-5">
            <p className="text-[10px] sm:text-[11px] font-medium text-neutral-400 uppercase tracking-wider mb-1">Avg ADR</p>
            <p className="text-xl sm:text-2xl font-semibold text-neutral-900">{symbol}{summary.avg_adr.toLocaleString()}</p>
            <p className={`text-[10px] sm:text-[11px] font-medium mt-1 ${comparisons.adr_change >= 0 ? 'text-sage-600' : 'text-red-500'}`}>
              {comparisons.adr_change >= 0 ? '+' : ''}{comparisons.adr_change.toFixed(1)}% vs last period
            </p>
          </div>
          <div className="bg-white rounded-[10px] border border-neutral-100 p-4 sm:p-5">
            <p className="text-[10px] sm:text-[11px] font-medium text-neutral-400 uppercase tracking-wider mb-1">Avg RevPAR</p>
            <p className="text-xl sm:text-2xl font-semibold text-neutral-900">{symbol}{summary.avg_revpar.toLocaleString()}</p>
            <p className={`text-[10px] sm:text-[11px] font-medium mt-1 ${comparisons.revpar_change >= 0 ? 'text-sage-600' : 'text-red-500'}`}>
              {comparisons.revpar_change >= 0 ? '+' : ''}{comparisons.revpar_change.toFixed(1)}% vs last period
            </p>
          </div>
          <div className="bg-white rounded-[10px] border border-neutral-100 p-4 sm:p-5">
            <p className="text-[10px] sm:text-[11px] font-medium text-neutral-400 uppercase tracking-wider mb-1">Avg Occupancy</p>
            <p className="text-xl sm:text-2xl font-semibold text-neutral-900">{summary.avg_occupancy}%</p>
            <p className={`text-[10px] sm:text-[11px] font-medium mt-1 ${comparisons.occupancy_change >= 0 ? 'text-sage-600' : 'text-red-500'}`}>
              {comparisons.occupancy_change >= 0 ? '+' : ''}{comparisons.occupancy_change.toFixed(1)}% vs last period
            </p>
          </div>
          <div className="bg-white rounded-[10px] border border-neutral-100 p-4 sm:p-5">
            <p className="text-[10px] sm:text-[11px] font-medium text-neutral-400 uppercase tracking-wider mb-1">Peak Day Revenue</p>
            <p className="text-xl sm:text-2xl font-semibold text-neutral-900">{formatCurrency(summary.peak_revenue)}</p>
            <p className="text-[10px] sm:text-[11px] text-neutral-500 font-medium mt-1">Best performing day</p>
          </div>
          <div className="bg-white rounded-[10px] border border-neutral-100 p-4 sm:p-5">
            <p className="text-[10px] sm:text-[11px] font-medium text-neutral-400 uppercase tracking-wider mb-1">Target Progress</p>
            <p className="text-xl sm:text-2xl font-semibold text-neutral-900">{summary.target_progress}%</p>
            <p className={`text-[10px] sm:text-[11px] font-medium mt-1 ${summary.target_progress >= 80 ? 'text-sage-600' : 'text-amber-500'}`}>
              {summary.target_progress >= 80 ? 'On track' : 'Needs attention'}
            </p>
          </div>
        </section>

        {/* Charts Row 1 - Line Charts */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {/* Revenue Trend */}
          <div className="bg-white rounded-[10px] border border-neutral-100 p-4 sm:p-6">
            <h3 className="text-sm font-semibold text-neutral-900 mb-1">Revenue Trend</h3>
            <p className="text-[12px] text-neutral-500 mb-4">Daily revenue over time</p>

            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={daily_data} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
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
                    tickFormatter={(v) => `${symbol}${(v / 1000).toFixed(0)}k`}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-neutral-900 text-white text-[12px] px-3 py-2 rounded-lg">
                            <p className="font-medium">{payload[0].payload.date}</p>
                            <p>Revenue: {formatCurrency(payload[0].value as number)}</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="#4E5840"
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 4, fill: '#4E5840' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* ADR vs RevPAR */}
          <div className="bg-white rounded-[10px] border border-neutral-100 p-4 sm:p-6">
            <h3 className="text-sm font-semibold text-neutral-900 mb-1">ADR vs RevPAR</h3>
            <p className="text-[12px] text-neutral-500 mb-4">Rate performance metrics</p>

            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={daily_data} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
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
                    tickFormatter={(v) => `${symbol}${v}`}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-neutral-900 text-white text-[12px] px-3 py-2 rounded-lg">
                            <p className="font-medium mb-1">{payload[0].payload.date}</p>
                            <p>ADR: {symbol}{payload[0].payload.adr?.toLocaleString()}</p>
                            <p>RevPAR: {symbol}{payload[0].payload.revpar?.toLocaleString()}</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Line type="monotone" dataKey="adr" stroke="#A57865" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="revpar" stroke="#5C9BA4" strokeWidth={2} dot={false} />
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
        <section className="grid grid-cols-1 xl:grid-cols-5 gap-4 sm:gap-6">
          {/* Revenue by Source Pie Chart */}
          <div className="xl:col-span-2 bg-white rounded-[10px] border border-neutral-100 p-4 sm:p-6">
            <h3 className="text-sm font-semibold text-neutral-900 mb-1">Revenue by Source</h3>
            <p className="text-[12px] text-neutral-500 mb-4">Revenue distribution</p>

            <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
              <div className="w-32 h-32 sm:w-40 sm:h-40 flex-shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={revenue_by_source}
                      cx="50%"
                      cy="50%"
                      innerRadius={35}
                      outerRadius={55}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {revenue_by_source.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color || SOURCE_COLORS[index % SOURCE_COLORS.length]} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="flex-1 space-y-2 sm:space-y-2.5 w-full">
                {revenue_by_source.map((item, index) => (
                  <div key={item.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: item.color || SOURCE_COLORS[index % SOURCE_COLORS.length] }} />
                      <span className="text-[11px] sm:text-[12px] text-neutral-600">{item.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] sm:text-[12px] font-medium text-neutral-900">{formatCurrency(item.value)}</span>
                      <span className="text-[10px] text-neutral-400 w-8 text-right">
                        {totalSourceRevenue > 0 ? ((item.value / totalSourceRevenue) * 100).toFixed(0) : 0}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Daily Revenue Bar Chart */}
          <div className="xl:col-span-3 bg-white rounded-[10px] border border-neutral-100 p-4 sm:p-6">
            <h3 className="text-sm font-semibold text-neutral-900 mb-1">Daily Revenue (Last 14 Days)</h3>
            <p className="text-[12px] text-neutral-500 mb-4">Revenue performance</p>

            <div className="h-44 sm:h-52">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dailyRevenueData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
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
                    tickFormatter={(v) => `${symbol}${(v / 1000).toFixed(0)}k`}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-neutral-900 text-white text-[12px] px-3 py-2 rounded-lg">
                            <p className="font-medium">{payload[0].payload.date}</p>
                            <p>{formatCurrency(payload[0].value as number)}</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="revenue" fill="#4E5840" radius={[3, 3, 0, 0]} maxBarSize={24} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </section>

        {/* Tables Row */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {/* Revenue by Room Type */}
          <div className="bg-white rounded-[10px] border border-neutral-100 p-4 sm:p-6">
            <h3 className="text-sm font-semibold text-neutral-900 mb-1">Revenue by Room Type</h3>
            <p className="text-[12px] text-neutral-500 mb-3 sm:mb-4">Performance by category</p>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-neutral-100">
                    <th className="text-left text-[11px] font-medium text-neutral-400 uppercase tracking-wider pb-3">Room Type</th>
                    <th className="text-right text-[11px] font-medium text-neutral-400 uppercase tracking-wider pb-3">Rooms</th>
                    <th className="text-right text-[11px] font-medium text-neutral-400 uppercase tracking-wider pb-3">Revenue</th>
                    <th className="text-right text-[11px] font-medium text-neutral-400 uppercase tracking-wider pb-3">ADR</th>
                  </tr>
                </thead>
                <tbody>
                  {revenue_by_room_type.map((room, index) => (
                    <tr key={index} className="border-b border-neutral-50 last:border-0">
                      <td className="py-3 text-[13px] font-medium text-neutral-900">{room.name}</td>
                      <td className="py-3 text-[13px] text-neutral-600 text-right">{room.rooms}</td>
                      <td className="py-3 text-[13px] text-neutral-600 text-right">{formatCurrency(room.revenue)}</td>
                      <td className="py-3 text-[13px] text-neutral-600 text-right">{symbol}{room.adr.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Weekly Summary */}
          <div className="bg-white rounded-[10px] border border-neutral-100 p-4 sm:p-6">
            <h3 className="text-sm font-semibold text-neutral-900 mb-1">Weekly Summary</h3>
            <p className="text-[12px] text-neutral-500 mb-3 sm:mb-4">Week-over-week performance</p>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-neutral-100">
                    <th className="text-left text-[11px] font-medium text-neutral-400 uppercase tracking-wider pb-3">Period</th>
                    <th className="text-right text-[11px] font-medium text-neutral-400 uppercase tracking-wider pb-3">Revenue</th>
                    <th className="text-right text-[11px] font-medium text-neutral-400 uppercase tracking-wider pb-3">Occupancy</th>
                    <th className="text-right text-[11px] font-medium text-neutral-400 uppercase tracking-wider pb-3">ADR</th>
                  </tr>
                </thead>
                <tbody>
                  {weekly_summary.map((week, index) => (
                    <tr key={index} className="border-b border-neutral-50 last:border-0">
                      <td className="py-3 text-[13px] font-medium text-neutral-900">{week.week}</td>
                      <td className="py-3 text-[13px] text-neutral-600 text-right">{formatCurrency(week.revenue)}</td>
                      <td className="py-3 text-right">
                        <span className="inline-block px-2 py-0.5 rounded text-[11px] font-medium bg-sage-50 text-sage-700">
                          {week.occupancy}%
                        </span>
                      </td>
                      <td className="py-3 text-[13px] text-neutral-600 text-right">{symbol}{week.adr.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* AI Insights Section */}
        {ai_insights && ai_insights.length > 0 && (
          <section className="bg-white rounded-[10px] border border-neutral-100 p-4 sm:p-6">
            <h3 className="text-sm font-semibold text-neutral-900 mb-1">AI Insights</h3>
            <p className="text-[12px] text-neutral-500 mb-4">Intelligent recommendations based on your revenue data</p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {ai_insights.map((insight, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg border ${getInsightBgColor(insight.type)}`}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5">{getInsightIcon(insight.type)}</div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="text-[13px] font-semibold text-neutral-900">{insight.title}</h4>
                        <span className={`text-[10px] uppercase font-medium px-1.5 py-0.5 rounded ${
                          insight.priority === 'high' ? 'bg-red-100 text-red-700' :
                          insight.priority === 'medium' ? 'bg-amber-100 text-amber-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {insight.priority}
                        </span>
                      </div>
                      <p className="text-[12px] text-neutral-600 mb-2">{insight.message}</p>
                      <p className="text-[11px] text-neutral-500 italic">{insight.action}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
