import { useState, useCallback, useEffect } from 'react';
import { ArrowLeft, Download, RefreshCw, ChevronDown, Star, AlertTriangle, Lightbulb, Info, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
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
  ResponsiveContainer
} from 'recharts';
import { reportsService, GuestExperienceReport as GuestExperienceReportType, AIInsight, ExportFormat } from '../../api/services/reports.service';
import { useToast } from '@/contexts/ToastContext';

const SENTIMENT_COLORS: Record<string, string> = {
  Positive: '#4E5840',
  Neutral: '#5C9BA4',
  Negative: '#CDB261',
  positive: '#4E5840',
  neutral: '#5C9BA4',
  negative: '#CDB261'
};

const SOURCE_COLORS = ['#A57865', '#5C9BA4', '#4E5840', '#CDB261', '#C8B29D'];

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

export default function GuestExperienceReport() {
  const navigate = useNavigate();
  const [dateRange, setDateRange] = useState('last_30_days');
  const [dateDropdownOpen, setDateDropdownOpen] = useState(false);
  const [exportDropdownOpen, setExportDropdownOpen] = useState(false);
  const [reportData, setReportData] = useState<GuestExperienceReportType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchReport = useCallback(async () => {
    try {
      setError(null);
      const data = await reportsService.getGuestExperienceReport(dateRange);
      setReportData(data);
    } catch (err) {
      console.error('Failed to fetch guest experience report:', err);
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
      await reportsService.getGuestExperienceReport(dateRange, format);
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
          <p className="text-neutral-600">Loading guest experience report...</p>
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

  const { summary, comparisons, sentiment_trend, ratings_by_platform, reviews_by_source, sentiment_distribution, recent_reviews, platform_summary, ai_insights } = reportData;

  const totalSourceReviews = reviews_by_source.reduce((sum, s) => sum + s.value, 0);
  const totalSentiment = sentiment_distribution.reduce((sum, s) => sum + s.value, 0);

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
              <h1 className="text-lg sm:text-xl font-semibold text-neutral-900">Guest Experience</h1>
              <p className="text-[12px] sm:text-[13px] text-neutral-500">Reviews, ratings, and sentiment analysis</p>
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
            <p className="text-[10px] sm:text-[11px] font-medium text-neutral-400 uppercase tracking-wider mb-1">Total Reviews</p>
            <p className="text-xl sm:text-2xl font-semibold text-neutral-900">{summary.total_reviews}</p>
            <p className={`text-[10px] sm:text-[11px] font-medium mt-1 ${comparisons.reviews_change >= 0 ? 'text-sage-600' : 'text-red-500'}`}>
              {comparisons.reviews_change >= 0 ? '+' : ''}{comparisons.reviews_change.toFixed(1)}% vs last period
            </p>
          </div>
          <div className="bg-white rounded-xl p-4 sm:p-5">
            <p className="text-[10px] sm:text-[11px] font-medium text-neutral-400 uppercase tracking-wider mb-1">Avg Rating</p>
            <p className="text-xl sm:text-2xl font-semibold text-neutral-900 flex items-center gap-1">
              {summary.avg_rating.toFixed(1)}
              <Star className="w-4 h-4 sm:w-5 sm:h-5 fill-gold-400 text-gold-400" />
            </p>
            <p className={`text-[10px] sm:text-[11px] font-medium mt-1 ${comparisons.rating_change >= 0 ? 'text-sage-600' : 'text-red-500'}`}>
              {comparisons.rating_change >= 0 ? '+' : ''}{comparisons.rating_change.toFixed(1)} vs last period
            </p>
          </div>
          <div className="bg-white rounded-xl p-4 sm:p-5">
            <p className="text-[10px] sm:text-[11px] font-medium text-neutral-400 uppercase tracking-wider mb-1">Avg Sentiment</p>
            <p className="text-xl sm:text-2xl font-semibold text-neutral-900">{summary.avg_sentiment}%</p>
            <p className={`text-[10px] sm:text-[11px] font-medium mt-1 ${comparisons.sentiment_change >= 0 ? 'text-sage-600' : 'text-red-500'}`}>
              {comparisons.sentiment_change >= 0 ? '+' : ''}{comparisons.sentiment_change.toFixed(1)}% vs last period
            </p>
          </div>
          <div className="bg-white rounded-xl p-4 sm:p-5">
            <p className="text-[10px] sm:text-[11px] font-medium text-neutral-400 uppercase tracking-wider mb-1">Positive Reviews</p>
            <p className="text-xl sm:text-2xl font-semibold text-neutral-900">{summary.positive_reviews}</p>
            <p className="text-[10px] sm:text-[11px] text-sage-600 font-medium mt-1">
              {summary.total_reviews > 0 ? ((summary.positive_reviews / summary.total_reviews) * 100).toFixed(0) : 0}% of total
            </p>
          </div>
          <div className="bg-white rounded-xl p-4 sm:p-5">
            <p className="text-[10px] sm:text-[11px] font-medium text-neutral-400 uppercase tracking-wider mb-1">Negative Reviews</p>
            <p className="text-xl sm:text-2xl font-semibold text-neutral-900">{summary.negative_reviews}</p>
            <p className="text-[10px] sm:text-[11px] text-amber-500 font-medium mt-1">
              {summary.total_reviews > 0 ? ((summary.negative_reviews / summary.total_reviews) * 100).toFixed(0) : 0}% of total
            </p>
          </div>
          <div className="bg-white rounded-xl p-4 sm:p-5">
            <p className="text-[10px] sm:text-[11px] font-medium text-neutral-400 uppercase tracking-wider mb-1">Response Rate</p>
            <p className="text-xl sm:text-2xl font-semibold text-neutral-900">{summary.response_rate}%</p>
            <p className={`text-[10px] sm:text-[11px] font-medium mt-1 ${comparisons.response_rate_change >= 0 ? 'text-sage-600' : 'text-red-500'}`}>
              {comparisons.response_rate_change >= 0 ? '+' : ''}{comparisons.response_rate_change.toFixed(1)}% vs last period
            </p>
          </div>
        </section>

        {/* Charts Row 1 */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {/* Sentiment Trend */}
          <div className="bg-white rounded-xl p-4 sm:p-6">
            <h3 className="text-sm font-semibold text-neutral-900 mb-1">Sentiment Trend</h3>
            <p className="text-[12px] text-neutral-500 mb-4">Average sentiment over time</p>

            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={sentiment_trend} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
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
                    domain={[0, 100]}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-neutral-900 text-white text-[12px] px-3 py-2 rounded-lg">
                            <p className="font-medium">{payload[0].payload.date}</p>
                            <p>Sentiment: {payload[0].value}%</p>
                            <p className="text-neutral-400">{payload[0].payload.reviews} reviews</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="sentiment"
                    stroke="#4E5840"
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 4, fill: '#4E5840' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Ratings by Platform */}
          <div className="bg-white rounded-xl p-4 sm:p-6">
            <h3 className="text-sm font-semibold text-neutral-900 mb-1">Ratings by Platform</h3>
            <p className="text-[12px] text-neutral-500 mb-4">Average rating per channel</p>

            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={ratings_by_platform} layout="vertical" margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
                  <XAxis
                    type="number"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 11, fill: '#737373' }}
                    domain={[0, 5]}
                  />
                  <YAxis
                    type="category"
                    dataKey="platform"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 11, fill: '#737373' }}
                    width={80}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-neutral-900 text-white text-[12px] px-3 py-2 rounded-lg">
                            <p className="font-medium">{payload[0].payload.platform}</p>
                            <p>Rating: {payload[0].value} / 5</p>
                            <p>{payload[0].payload.reviews} reviews</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="rating" fill="#CDB261" radius={[0, 4, 4, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </section>

        {/* Charts Row 2 - Pie Charts */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {/* Reviews by Source */}
          <div className="bg-white rounded-xl p-4 sm:p-6">
            <h3 className="text-sm font-semibold text-neutral-900 mb-1">Reviews by Source</h3>
            <p className="text-[12px] text-neutral-500 mb-4">Distribution by platform</p>

            <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
              <div className="w-32 h-32 sm:w-40 sm:h-40 flex-shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={reviews_by_source}
                      cx="50%"
                      cy="50%"
                      innerRadius={35}
                      outerRadius={55}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {reviews_by_source.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color || SOURCE_COLORS[index % SOURCE_COLORS.length]} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="flex-1 space-y-2 sm:space-y-2.5 w-full">
                {reviews_by_source.map((item, index) => (
                  <div key={item.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: item.color || SOURCE_COLORS[index % SOURCE_COLORS.length] }} />
                      <span className="text-[11px] sm:text-[12px] text-neutral-600">{item.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] sm:text-[12px] font-medium text-neutral-900">{item.value}</span>
                      <span className="text-[10px] text-neutral-400 w-8 text-right">
                        {totalSourceReviews > 0 ? ((item.value / totalSourceReviews) * 100).toFixed(0) : 0}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sentiment Distribution */}
          <div className="bg-white rounded-xl p-4 sm:p-6">
            <h3 className="text-sm font-semibold text-neutral-900 mb-1">Sentiment Distribution</h3>
            <p className="text-[12px] text-neutral-500 mb-4">Positive vs Neutral vs Negative</p>

            <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
              <div className="w-32 h-32 sm:w-40 sm:h-40 flex-shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={sentiment_distribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={35}
                      outerRadius={55}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {sentiment_distribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color || SENTIMENT_COLORS[entry.name] || SOURCE_COLORS[index % SOURCE_COLORS.length]} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="flex-1 space-y-2 sm:space-y-3 w-full">
                {sentiment_distribution.map((item) => (
                  <div key={item.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: item.color || SENTIMENT_COLORS[item.name] || '#CDB261' }} />
                      <span className="text-[12px] sm:text-[13px] text-neutral-600">{item.name}</span>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-3">
                      <span className="text-[12px] sm:text-[13px] font-medium text-neutral-900">{item.value}</span>
                      <span className="text-[10px] sm:text-[11px] text-neutral-400 w-8 sm:w-10 text-right">
                        {totalSentiment > 0 ? ((item.value / totalSentiment) * 100).toFixed(0) : 0}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Tables Row */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Recent Reviews */}
          <div className="lg:col-span-2 bg-white rounded-xl p-4 sm:p-6">
            <h3 className="text-sm font-semibold text-neutral-900 mb-1">Recent Reviews</h3>
            <p className="text-[12px] text-neutral-500 mb-3 sm:mb-4">Latest guest feedback</p>

            <div className="overflow-x-auto max-h-80">
              <table className="w-full">
                <thead className="sticky top-0 bg-white">
                  <tr className="border-b border-neutral-100">
                    <th className="text-left text-[11px] font-medium text-neutral-400 uppercase tracking-wider pb-3">Date</th>
                    <th className="text-left text-[11px] font-medium text-neutral-400 uppercase tracking-wider pb-3">Platform</th>
                    <th className="text-left text-[11px] font-medium text-neutral-400 uppercase tracking-wider pb-3">Guest</th>
                    <th className="text-center text-[11px] font-medium text-neutral-400 uppercase tracking-wider pb-3">Rating</th>
                    <th className="text-right text-[11px] font-medium text-neutral-400 uppercase tracking-wider pb-3">Sentiment</th>
                  </tr>
                </thead>
                <tbody>
                  {recent_reviews.slice(0, 10).map((review, index) => (
                    <tr key={index} className="border-b border-neutral-50 last:border-0">
                      <td className="py-3 text-[13px] text-neutral-600">{review.date}</td>
                      <td className="py-3 text-[13px] text-neutral-600">{review.platform}</td>
                      <td className="py-3 text-[13px] font-medium text-neutral-900">{review.guest_name}</td>
                      <td className="py-3 text-center">
                        <span className="inline-flex items-center gap-1 text-[13px] text-neutral-900">
                          <Star className="w-3.5 h-3.5 fill-gold-400 text-gold-400" />
                          {review.rating}
                        </span>
                      </td>
                      <td className="py-3 text-right">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[11px] font-medium ${
                            review.sentiment === 'positive' || review.sentiment === 'Positive'
                              ? 'bg-sage-50 text-sage-700'
                              : review.sentiment === 'neutral' || review.sentiment === 'Neutral'
                              ? 'bg-ocean-50 text-ocean-700'
                              : 'bg-gold-50 text-gold-700'
                          }`}
                        >
                          {review.sentiment.charAt(0).toUpperCase() + review.sentiment.slice(1)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Platform Summary */}
          <div className="bg-white rounded-xl p-4 sm:p-6">
            <h3 className="text-sm font-semibold text-neutral-900 mb-1">Platform Summary</h3>
            <p className="text-[12px] text-neutral-500 mb-3 sm:mb-4">Performance by channel</p>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-neutral-100">
                    <th className="text-left text-[11px] font-medium text-neutral-400 uppercase tracking-wider pb-3">Platform</th>
                    <th className="text-right text-[11px] font-medium text-neutral-400 uppercase tracking-wider pb-3">Reviews</th>
                    <th className="text-right text-[11px] font-medium text-neutral-400 uppercase tracking-wider pb-3">Rating</th>
                  </tr>
                </thead>
                <tbody>
                  {platform_summary.map((platform, index) => (
                    <tr key={index} className="border-b border-neutral-50 last:border-0">
                      <td className="py-3 text-[13px] font-medium text-neutral-900">{platform.platform}</td>
                      <td className="py-3 text-[13px] text-neutral-600 text-right">{platform.reviews}</td>
                      <td className="py-3 text-right">
                        <span className="inline-flex items-center gap-1 text-[13px] text-neutral-900">
                          <Star className="w-3.5 h-3.5 fill-gold-400 text-gold-400" />
                          {platform.rating.toFixed(1)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* AI Insights Section */}
        {ai_insights && ai_insights.length > 0 && (
          <section className="bg-white rounded-xl p-4 sm:p-6">
            <h3 className="text-sm font-semibold text-neutral-900 mb-1">AI Insights</h3>
            <p className="text-[12px] text-neutral-500 mb-4">Intelligent recommendations to improve guest experience</p>

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
