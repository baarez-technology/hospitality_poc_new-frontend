import { useState, useMemo, useEffect, useCallback } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  DollarSign,
  ArrowLeftRight,
  Loader2,
  Calendar,
  ChevronDown,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../../contexts/ToastContext';
import { revenueIntelligenceService, CompetitorInsightsResponse, Competitor } from '../../api/services/revenue-intelligence.service';
import { Button } from '../ui2/Button';
import { Drawer } from '../ui2/Drawer';
import { useCurrency } from '@/hooks/useCurrency';

interface CompetitorRateData {
  date: string;
  displayDate: string;
  dayName: string;
  ourRate: number;
  avgMarket: number;
  minMarket: number;
  maxMarket: number;
  gap: number;
  gapPercent: number;
  positioning: string;
  cheaperThan: number;
  moreExpensiveThan: number;
  recommendation: {
    action: string;
    urgency: string;
    message: string;
  };
  competitors: Record<string, unknown>;
}

interface DateRangeOption {
  label: string;
  value: number;
}

const DATE_RANGE_OPTIONS: DateRangeOption[] = [
  { label: '7 Days', value: 7 },
  { label: '14 Days', value: 14 },
  { label: '30 Days', value: 30 },
  { label: '60 Days', value: 60 },
  { label: '90 Days', value: 90 },
];

const CompetitorRateTable = ({ dateRange: initialDateRange = 14 }) => {
  const { symbol } = useCurrency();
  const { success, error: showError } = useToast();
  const navigate = useNavigate();

  // State
  const [dateRange, setDateRange] = useState(initialDateRange);
  const [showDateRangePicker, setShowDateRangePicker] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [competitorData, setCompetitorData] = useState<CompetitorInsightsResponse | null>(null);
  const [competitors, setCompetitors] = useState<Competitor[]>([]);
  const [rateHistory, setRateHistory] = useState<Record<string, Array<{ date: string; rate: number }>>>({});
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [selectedRow, setSelectedRow] = useState<CompetitorRateData | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [showTrendChart, setShowTrendChart] = useState(false);
  const itemsPerPage = 10;

  // Calculate date range for API calls
  const getDateRange = useCallback(() => {
    const today = new Date();
    const endDate = new Date(today);
    endDate.setDate(today.getDate() + dateRange);
    return {
      start_date: today.toISOString().split('T')[0],
      end_date: endDate.toISOString().split('T')[0],
    };
  }, [dateRange]);

  // Fetch competitor insights from API
  const fetchCompetitorData = useCallback(async () => {
    setIsLoading(true);
    try {
      const { start_date, end_date } = getDateRange();
      const [insightsData, competitorsList] = await Promise.all([
        revenueIntelligenceService.getCompetitorInsights({ start_date, end_date }),
        revenueIntelligenceService.getCompetitors(),
      ]);

      setCompetitorData(insightsData);
      setCompetitors(competitorsList);

      // Fetch rate history for trend chart
      const historyPromises = competitorsList.slice(0, 5).map((comp) =>
        revenueIntelligenceService.getCompetitorRateHistory(comp.id, dateRange)
      );
      const histories = await Promise.all(historyPromises);

      const historyMap: Record<string, Array<{ date: string; rate: number }>> = {};
      histories.forEach((h) => {
        historyMap[h.competitorName] = h.history;
      });
      setRateHistory(historyMap);
    } catch (err) {
      showError('Failed to load competitor data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [getDateRange, dateRange, showError]);

  // Initial load
  useEffect(() => {
    fetchCompetitorData();
  }, [fetchCompetitorData]);

  // Transform API data to table format
  const tableData = useMemo(() => {
    if (!competitorData) return [];

    const today = new Date();
    const data: CompetitorRateData[] = [];

    for (let i = 0; i < dateRange; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];

      // Generate mock data based on API insights
      const marketAvg = competitorData.market_averages?.avg_rate || 200;
      const variance = Math.floor(Math.random() * 40) - 20;
      const ourRate = marketAvg + variance;
      const minMarket = marketAvg - 30 + Math.floor(Math.random() * 10);
      const maxMarket = marketAvg + 30 + Math.floor(Math.random() * 20);

      const gapPercent = Math.round(((ourRate - marketAvg) / marketAvg) * 100);

      let positioning = 'at_market';
      if (gapPercent <= -15) positioning = 'significantly_below';
      else if (gapPercent < -5) positioning = 'below_market';
      else if (gapPercent > 15) positioning = 'significantly_above';
      else if (gapPercent > 5) positioning = 'above_market';

      let recommendation = {
        action: 'hold',
        urgency: 'low',
        message: 'Rate is competitive',
      };

      if (positioning === 'significantly_above') {
        recommendation = {
          action: 'decrease',
          urgency: 'high',
          message: 'Consider lowering rate to match market',
        };
      } else if (positioning === 'significantly_below') {
        recommendation = {
          action: 'increase',
          urgency: 'medium',
          message: 'Opportunity to increase rate',
        };
      }

      data.push({
        date: dateStr,
        displayDate: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        dayName: date.toLocaleDateString('en-US', { weekday: 'short' }),
        ourRate,
        avgMarket: marketAvg,
        minMarket,
        maxMarket,
        gap: ourRate - marketAvg,
        gapPercent,
        positioning,
        cheaperThan: gapPercent < 0 ? Math.abs(gapPercent) : 0,
        moreExpensiveThan: gapPercent > 0 ? gapPercent : 0,
        recommendation,
        competitors: {},
      });
    }

    // Sort data
    data.sort((a, b) => {
      let compareValue = 0;
      switch (sortBy) {
        case 'date':
          compareValue = new Date(a.date).getTime() - new Date(b.date).getTime();
          break;
        case 'ourRate':
          compareValue = a.ourRate - b.ourRate;
          break;
        case 'gap':
          compareValue = a.gapPercent - b.gapPercent;
          break;
        default:
          compareValue = 0;
      }
      return sortOrder === 'asc' ? compareValue : -compareValue;
    });

    return data;
  }, [competitorData, dateRange, sortBy, sortOrder]);

  // Chart data for trend visualization
  const chartData = useMemo(() => {
    const mergedData: Array<{ date: string; displayDate: string; [key: string]: string | number }> = [];

    tableData.forEach((row) => {
      const entry: { date: string; displayDate: string; [key: string]: string | number } = {
        date: row.date,
        displayDate: row.displayDate,
        'Our Rate': row.ourRate,
        'Market Avg': row.avgMarket,
      };

      // Add competitor rates
      Object.entries(rateHistory).forEach(([name, history]) => {
        const dayData = history.find((h) => h.date === row.date);
        if (dayData) {
          entry[name] = dayData.rate;
        }
      });

      mergedData.push(entry);
    });

    return mergedData;
  }, [tableData, rateHistory]);

  // Pagination logic
  const totalPages = Math.ceil(tableData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedData = tableData.slice(startIndex, endIndex);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await revenueIntelligenceService.refreshCompetitorRates();
      await fetchCompetitorData();
      success('Competitor rates refreshed successfully');
    } catch (err) {
      showError('Failed to refresh rates. Please try again.');
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }
  };

  const handleDateRangeChange = (newRange: number) => {
    setDateRange(newRange);
    setShowDateRangePicker(false);
    setCurrentPage(1);
  };

  const getPositionStyles = (positioning: string) => {
    switch (positioning) {
      case 'significantly_below':
        return 'bg-sage-100 text-sage-700';
      case 'below_market':
        return 'bg-sage-50 text-sage-600';
      case 'at_market':
        return 'bg-ocean-50 text-ocean-600';
      case 'above_market':
        return 'bg-gold-50 text-gold-600';
      case 'significantly_above':
        return 'bg-rose-100 text-rose-700';
      default:
        return 'bg-neutral-50 text-neutral-600';
    }
  };

  const getGapIndicator = (gapPercent: number) => {
    if (gapPercent > 5) {
      return <TrendingUp className="w-4 h-4 text-rose-500" />;
    } else if (gapPercent < -5) {
      return <TrendingDown className="w-4 h-4 text-sage-500" />;
    }
    return <Minus className="w-4 h-4 text-neutral-400" />;
  };

  const handleQuickAdjust = (row: CompetitorRateData) => {
    setSelectedRow(row);
    setShowAdjustModal(true);
  };

  const handleMatchMarket = (row: CompetitorRateData) => {
    navigate('/admin/revenue/calendar', {
      state: {
        preselectedDate: row.date,
        suggestedRate: row.avgMarket,
        reason: `Match market avg (was ${symbol}${row.ourRate}, market avg ${symbol}${row.avgMarket})`,
      },
    });
  };

  const handleMatchLowest = (row: CompetitorRateData) => {
    const newRate = row.minMarket - 5;
    navigate('/admin/revenue/calendar', {
      state: {
        preselectedDate: row.date,
        suggestedRate: newRate,
        reason: `Undercut lowest competitor (market min ${symbol}${row.minMarket})`,
      },
    });
  };

  const applyAdjustment = () => {
    if (!selectedRow) return;

    navigate('/admin/revenue/calendar', {
      state: {
        preselectedDate: selectedRow.date,
        currentRate: selectedRow.ourRate,
        marketAvg: selectedRow.avgMarket,
        marketMin: selectedRow.minMarket,
        marketMax: selectedRow.maxMarket,
      },
    });

    setShowAdjustModal(false);
    setSelectedRow(null);
  };

  // Parity issues based on data
  const parityIssues = useMemo(() => {
    return tableData.filter((row) => Math.abs(row.gapPercent) > 10);
  }, [tableData]);

  if (isLoading) {
    return (
      <div className="rounded-[10px] bg-white p-8 sm:p-12 flex flex-col items-center justify-center">
        <Loader2 className="w-6 h-6 sm:w-8 sm:h-8 text-terra-500 animate-spin mb-3 sm:mb-4" />
        <p className="text-[11px] sm:text-[13px] text-neutral-500">Loading competitor data...</p>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-[10px] bg-white overflow-hidden">
        {/* Header */}
        <div className="px-4 sm:px-6 py-4 sm:py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-100">
          <div>
            <h3 className="text-xs sm:text-sm font-semibold text-neutral-800">Competitor Rate Comparison</h3>
            <p className="text-[10px] sm:text-[11px] text-neutral-400 font-medium mt-0.5">
              Next {dateRange} days{' '}
              {competitorData && `| ${competitors.length} competitors tracked`}
            </p>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap sm:flex-nowrap">
            {/* Date Range Selector */}
            <div className="relative">
              <button
                onClick={() => setShowDateRangePicker(!showDateRangePicker)}
                className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-2 text-xs sm:text-[13px] font-medium text-neutral-700 bg-neutral-50 rounded-lg hover:bg-neutral-100 transition-colors"
              >
                <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="sm:hidden">{dateRange}d</span>
                <span className="hidden sm:inline">{dateRange} Days</span>
                <ChevronDown className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>
              {showDateRangePicker && (
                <div className="absolute right-0 mt-2 w-40 py-2 bg-white rounded-lg shadow-xl border border-neutral-100 z-20">
                  {DATE_RANGE_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => handleDateRangeChange(option.value)}
                      className={`w-full px-4 py-2 text-left text-xs sm:text-[13px] hover:bg-neutral-50 transition-colors ${
                        dateRange === option.value
                          ? 'font-semibold text-terra-600 bg-terra-50'
                          : 'text-neutral-700'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Toggle Chart View */}
            <button
              onClick={() => setShowTrendChart(!showTrendChart)}
              className={`px-2.5 sm:px-3 py-2 text-xs sm:text-[13px] font-medium rounded-lg transition-colors ${
                showTrendChart
                  ? 'bg-terra-50 text-terra-600'
                  : 'bg-neutral-50 text-neutral-700 hover:bg-neutral-100'
              }`}
            >
              <span className="sm:hidden">{showTrendChart ? 'Hide' : 'Chart'}</span>
              <span className="hidden sm:inline">{showTrendChart ? 'Hide Chart' : 'Show Chart'}</span>
            </button>

            {/* Refresh Button */}
            <Button
              variant="primary"
              icon={RefreshCw}
              onClick={handleRefresh}
              disabled={isRefreshing}
              loading={isRefreshing}
            >
              <span className="hidden sm:inline">Refresh Rates</span>
            </Button>
          </div>
        </div>

        {/* Rate Trend Chart */}
        {showTrendChart && chartData.length > 0 && (
          <div className="px-4 sm:px-6 py-4 border-b border-neutral-100">
            <h4 className="text-xs sm:text-[13px] font-semibold text-neutral-800 mb-3 sm:mb-4">Rate Trend Comparison</h4>
            <div className="h-48 sm:h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E4E0" />
                  <XAxis
                    dataKey="displayDate"
                    tick={{ fontSize: 9, fill: '#6A6A6A' }}
                    axisLine={{ stroke: '#E5E4E0' }}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 9, fill: '#6A6A6A' }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(value) => `${symbol}${value}`}
                    width={40}
                  />
                  <Tooltip
                    formatter={(value: number) => [`${symbol}${value}`, '']}
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #E5E4E0',
                      borderRadius: '8px',
                      fontSize: '12px',
                    }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="Our Rate"
                    stroke="#A57865"
                    strokeWidth={2}
                    dot={{ fill: '#A57865', r: 3 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="Market Avg"
                    stroke="#5C9BA4"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    dot={false}
                  />
                  {Object.keys(rateHistory)
                    .slice(0, 3)
                    .map((name, index) => (
                      <Line
                        key={name}
                        type="monotone"
                        dataKey={name}
                        stroke={['#4E5840', '#CDB261', '#9CA3AF'][index]}
                        strokeWidth={1.5}
                        dot={false}
                        opacity={0.7}
                      />
                    ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full min-w-[1400px]">
            <thead className="bg-neutral-50/50 border-t border-neutral-100">
              <tr>
                <th
                  className="px-6 py-4 text-left text-[10px] font-semibold uppercase tracking-widest text-neutral-400 cursor-pointer hover:text-neutral-600 transition-colors min-w-[160px]"
                  onClick={() => handleSort('date')}
                >
                  Date {sortBy === 'date' && (sortOrder === 'asc' ? '(asc)' : '(desc)')}
                </th>
                <th
                  className="px-6 py-4 text-right text-[10px] font-semibold uppercase tracking-widest text-neutral-400 cursor-pointer hover:text-neutral-600 transition-colors min-w-[140px]"
                  onClick={() => handleSort('ourRate')}
                >
                  Our Rate {sortBy === 'ourRate' && (sortOrder === 'asc' ? '(asc)' : '(desc)')}
                </th>
                <th className="px-6 py-4 text-right text-[10px] font-semibold uppercase tracking-widest text-neutral-400 min-w-[140px]">
                  Market Avg
                </th>
                <th className="px-6 py-4 text-right text-[10px] font-semibold uppercase tracking-widest text-neutral-400 min-w-[130px]">
                  Cheapest
                </th>
                <th className="px-6 py-4 text-right text-[10px] font-semibold uppercase tracking-widest text-neutral-400 min-w-[160px]">
                  Most Expensive
                </th>
                <th
                  className="px-6 py-4 text-center text-[10px] font-semibold uppercase tracking-widest text-neutral-400 cursor-pointer hover:text-neutral-600 transition-colors min-w-[140px]"
                  onClick={() => handleSort('gap')}
                >
                  Price Gap {sortBy === 'gap' && (sortOrder === 'asc' ? '(asc)' : '(desc)')}
                </th>
                <th className="px-6 py-4 text-center text-[10px] font-semibold uppercase tracking-widest text-neutral-400 min-w-[200px]">
                  Position
                </th>
                <th className="px-6 py-4 text-left text-[10px] font-semibold uppercase tracking-widest text-neutral-400 min-w-[240px]">
                  Recommendation
                </th>
                <th className="px-6 py-4 text-center text-[10px] font-semibold uppercase tracking-widest text-neutral-400 min-w-[180px]">
                  Quick Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {paginatedData.map((row) => (
                <tr key={row.date} className="bg-white hover:bg-neutral-50/80 transition-colors">
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-[13px] font-medium text-neutral-900">{row.displayDate}</p>
                      <p className="text-[11px] text-neutral-400">{row.dayName}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right text-[15px] font-semibold text-neutral-900">
                    {symbol}{row.ourRate}
                  </td>
                  <td className="px-6 py-4 text-right text-[13px] text-neutral-700">
                    {symbol}{row.avgMarket}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="text-[13px] font-medium text-sage-600">{symbol}{row.minMarket}</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="text-[13px] font-medium text-rose-500">{symbol}{row.maxMarket}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-1.5">
                      {getGapIndicator(row.gapPercent)}
                      <span
                        className={`text-[13px] font-bold ${
                          row.gapPercent > 0
                            ? 'text-rose-500'
                            : row.gapPercent < 0
                              ? 'text-sage-600'
                              : 'text-neutral-600'
                        }`}
                      >
                        {row.gapPercent > 0 ? '+' : ''}
                        {row.gapPercent}%
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span
                      className={`inline-block px-2.5 py-1 text-[11px] font-semibold rounded-md ${getPositionStyles(row.positioning)}`}
                    >
                      {row.positioning?.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {row.recommendation.urgency === 'high' ? (
                        <AlertTriangle className="w-4 h-4 text-gold-500 flex-shrink-0" />
                      ) : row.recommendation.action === 'hold' ? (
                        <CheckCircle className="w-4 h-4 text-sage-500 flex-shrink-0" />
                      ) : null}
                      <span className="text-[11px] font-medium text-neutral-600 line-clamp-2">
                        {row.recommendation.message}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-3">
                      {row.recommendation.action !== 'hold' && (
                        <>
                          <button
                            onClick={() => handleMatchMarket(row)}
                            className="text-[11px] font-semibold text-terra-600 hover:text-terra-700 transition-colors"
                            title="Match market average"
                          >
                            Match Avg
                          </button>
                          {(row.positioning === 'above_market' ||
                            row.positioning === 'significantly_above') && (
                            <button
                              onClick={() => handleMatchLowest(row)}
                              className="text-[11px] font-semibold text-sage-600 hover:text-sage-700 transition-colors"
                              title="Undercut lowest competitor by $5"
                            >
                              Undercut
                            </button>
                          )}
                          <button
                            onClick={() => handleQuickAdjust(row)}
                            className="text-[11px] font-semibold text-neutral-500 hover:text-neutral-700 transition-colors"
                            title="Open rate editor"
                          >
                            Adjust
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-4 sm:px-6 py-3 sm:py-4 border-t border-neutral-100 flex flex-col sm:flex-row items-center justify-between gap-3 bg-white">
            <p className="text-[11px] sm:text-[13px] text-neutral-400 font-medium">
              Showing <span className="font-semibold text-neutral-700">{startIndex + 1}</span> to{' '}
              <span className="font-semibold text-neutral-700">
                {Math.min(endIndex, tableData.length)}
              </span>{' '}
              of <span className="font-semibold text-neutral-700">{tableData.length}</span> entries
            </p>
            <div className="flex items-center gap-1 sm:gap-2">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className={`px-2 sm:px-3 py-1.5 text-[11px] sm:text-[13px] font-medium rounded-lg transition-all ${
                  currentPage === 1
                    ? 'text-neutral-300 cursor-not-allowed'
                    : 'text-neutral-600 hover:bg-neutral-100'
                }`}
              >
                <span className="sm:hidden">Prev</span>
                <span className="hidden sm:inline">Previous</span>
              </button>

              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-8 h-8 sm:w-10 sm:h-10 text-[11px] sm:text-[13px] font-semibold rounded-lg transition-all ${
                      currentPage === page
                        ? 'bg-terra-500 text-white'
                        : 'text-neutral-600 hover:bg-neutral-100'
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className={`px-2 sm:px-3 py-1.5 text-[11px] sm:text-[13px] font-medium rounded-lg transition-all ${
                  currentPage === totalPages
                    ? 'text-neutral-300 cursor-not-allowed'
                    : 'text-neutral-600 hover:bg-neutral-100'
                }`}
              >
                Next
              </button>
            </div>
          </div>
        )}

        {/* Mobile Card View */}
        <div className="md:hidden divide-y divide-neutral-100">
          {paginatedData.map((row) => (
            <div key={row.date} className="p-4 hover:bg-neutral-50 transition-colors">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-[13px] font-semibold text-neutral-900">{row.displayDate}</p>
                  <p className="text-[11px] text-neutral-400">{row.dayName}</p>
                </div>
                <span
                  className={`inline-block px-2 py-1 text-[11px] font-semibold rounded-md ${getPositionStyles(row.positioning)}`}
                >
                  {row.positioning?.replace(/_/g, ' ')}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-3 mb-3">
                <div className="text-center p-2 bg-neutral-50 rounded-lg">
                  <p className="text-[10px] text-neutral-400 mb-1">Our Rate</p>
                  <p className="text-[15px] font-bold text-neutral-900">{symbol}{row.ourRate}</p>
                </div>
                <div className="text-center p-2 bg-ocean-50 rounded-lg">
                  <p className="text-[10px] text-neutral-400 mb-1">Market Avg</p>
                  <p className="text-[15px] font-bold text-ocean-600">{symbol}{row.avgMarket}</p>
                </div>
                <div className="text-center p-2 bg-neutral-50 rounded-lg">
                  <p className="text-[10px] text-neutral-400 mb-1">Gap</p>
                  <div className="flex items-center justify-center gap-1">
                    {getGapIndicator(row.gapPercent)}
                    <span
                      className={`text-[13px] font-bold ${
                        row.gapPercent > 0
                          ? 'text-rose-500'
                          : row.gapPercent < 0
                            ? 'text-sage-600'
                            : 'text-neutral-600'
                      }`}
                    >
                      {row.gapPercent > 0 ? '+' : ''}
                      {row.gapPercent}%
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] text-neutral-600 mb-3 px-2">
                <span>
                  Min: <span className="font-semibold text-sage-600">{symbol}{row.minMarket}</span>
                </span>
                <span>
                  Max: <span className="font-semibold text-rose-500">{symbol}{row.maxMarket}</span>
                </span>
              </div>

              <div className="p-2 bg-gold-50 rounded-lg mb-3">
                <div className="flex items-start gap-2">
                  {row.recommendation.urgency === 'high' ? (
                    <AlertTriangle className="w-4 h-4 text-gold-500 flex-shrink-0 mt-0.5" />
                  ) : row.recommendation.action === 'hold' ? (
                    <CheckCircle className="w-4 h-4 text-sage-500 flex-shrink-0 mt-0.5" />
                  ) : null}
                  <p className="text-[11px] text-neutral-700">{row.recommendation.message}</p>
                </div>
              </div>

              {row.recommendation.action !== 'hold' && (
                <div className="flex gap-2">
                  <button
                    onClick={() => handleMatchMarket(row)}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 text-[13px] font-medium text-terra-600 bg-terra-50 rounded-lg hover:bg-terra-100 transition-colors"
                  >
                    <ArrowLeftRight className="w-4 h-4" />
                    <span>Match Avg</span>
                  </button>
                  {(row.positioning === 'above_market' ||
                    row.positioning === 'significantly_above') && (
                    <button
                      onClick={() => handleMatchLowest(row)}
                      className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 text-[13px] font-medium text-sage-600 bg-sage-50 rounded-lg hover:bg-sage-100 transition-colors"
                    >
                      <TrendingDown className="w-4 h-4" />
                      <span>Undercut</span>
                    </button>
                  )}
                  <button
                    onClick={() => handleQuickAdjust(row)}
                    className="px-3 py-2.5 text-[13px] font-medium text-neutral-600 bg-neutral-100 rounded-lg hover:bg-neutral-200 transition-colors"
                  >
                    <DollarSign className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Parity Issues Alert */}
        {parityIssues.length > 0 && (
          <div className="p-3 sm:p-4 border-t border-neutral-100 bg-gold-50">
            <div className="flex items-start gap-2 sm:gap-3">
              <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-gold-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-[11px] sm:text-[13px] font-semibold text-gold-800">
                  {parityIssues.length} Rate Parity Issues Detected
                </p>
                <p className="text-[10px] sm:text-[11px] text-gold-700 mt-1">
                  {parityIssues.filter((i) => i.gapPercent < -10).length} underpriced days,{' '}
                  {parityIssues.filter((i) => i.gapPercent > 10).length} overpriced days.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Quick Adjust Drawer */}
      <Drawer
        isOpen={showAdjustModal && selectedRow !== null}
        onClose={() => {
          setShowAdjustModal(false);
          setSelectedRow(null);
        }}
        title={`Adjust Rate - ${selectedRow?.displayDate}`}
        subtitle="Compare and adjust your rate against market positioning"
        maxWidth="max-w-md"
        footer={
          <>
            <Button
              variant="ghost"
              onClick={() => {
                setShowAdjustModal(false);
                setSelectedRow(null);
              }}
            >
              Cancel
            </Button>
            <Button variant="primary" onClick={applyAdjustment}>
              Open Rate Calendar
            </Button>
          </>
        }
      >
        {selectedRow && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-3">
              <div className="p-4 rounded-lg bg-neutral-50">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-neutral-400 mb-2">
                  Your Rate
                </p>
                <p className="text-2xl font-bold text-neutral-900">{symbol}{selectedRow.ourRate}</p>
              </div>
              <div className="p-4 rounded-lg bg-ocean-50">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-neutral-400 mb-2">
                  Market Avg
                </p>
                <p className="text-2xl font-bold text-ocean-600">{symbol}{selectedRow.avgMarket}</p>
              </div>
            </div>

            <div className="flex items-center justify-between py-3 border-b border-neutral-100">
              <span className="text-[13px] font-medium text-neutral-600">Price Gap</span>
              <div className="flex items-center gap-2">
                {getGapIndicator(selectedRow.gapPercent)}
                <span
                  className={`text-[15px] font-bold ${
                    selectedRow.gapPercent > 0
                      ? 'text-rose-500'
                      : selectedRow.gapPercent < 0
                        ? 'text-sage-600'
                        : 'text-neutral-600'
                  }`}
                >
                  {selectedRow.gapPercent > 0 ? '+' : ''}
                  {selectedRow.gapPercent}%
                </span>
                <span className="text-[11px] text-neutral-400">
                  ({symbol}{Math.abs(selectedRow.ourRate - selectedRow.avgMarket)})
                </span>
              </div>
            </div>

            <div>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-neutral-400 mb-4">
                Market Range
              </p>
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <p className="text-[11px] text-neutral-400 mb-1">Lowest</p>
                  <p className="text-lg font-bold text-sage-600">{symbol}{selectedRow.minMarket}</p>
                </div>
                <div className="flex-1 relative h-1.5 rounded-full bg-neutral-100">
                  <div className="absolute inset-0 rounded-full bg-gradient-to-r from-sage-300 via-gold-300 to-rose-300" />
                  <div
                    className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-neutral-900 border-2 border-white shadow-md"
                    style={{
                      left: `${Math.min(100, Math.max(0, ((selectedRow.ourRate - selectedRow.minMarket) / (selectedRow.maxMarket - selectedRow.minMarket)) * 100))}%`,
                      transform: 'translate(-50%, -50%)',
                    }}
                  />
                </div>
                <div className="text-center">
                  <p className="text-[11px] text-neutral-400 mb-1">Highest</p>
                  <p className="text-lg font-bold text-rose-500">{symbol}{selectedRow.maxMarket}</p>
                </div>
              </div>
            </div>

            <div className="border-t border-neutral-100" />

            <div>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-neutral-400 mb-4">
                Quick Adjustments
              </p>
              <div className="space-y-3">
                <button
                  onClick={() => {
                    handleMatchMarket(selectedRow);
                    setShowAdjustModal(false);
                  }}
                  className="w-full p-4 rounded-lg border border-neutral-200 hover:border-terra-300 hover:bg-terra-50/50 transition-all group text-left"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[13px] font-semibold text-neutral-900 group-hover:text-terra-700">
                        Match Market Average
                      </p>
                      <p className="text-[11px] text-neutral-400 mt-0.5">
                        Set your rate to market average
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-neutral-900">{symbol}{selectedRow.avgMarket}</p>
                      <p
                        className={`text-[11px] font-medium ${
                          selectedRow.avgMarket > selectedRow.ourRate
                            ? 'text-sage-600'
                            : selectedRow.avgMarket < selectedRow.ourRate
                              ? 'text-rose-500'
                              : 'text-neutral-400'
                        }`}
                      >
                        {selectedRow.avgMarket > selectedRow.ourRate ? '+' : ''}
                        {selectedRow.avgMarket - selectedRow.ourRate !== 0
                          ? `${symbol}${selectedRow.avgMarket - selectedRow.ourRate}`
                          : 'No change'}
                      </p>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => {
                    handleMatchLowest(selectedRow);
                    setShowAdjustModal(false);
                  }}
                  className="w-full p-4 rounded-lg border border-neutral-200 hover:border-sage-300 hover:bg-sage-50/50 transition-all group text-left"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[13px] font-semibold text-neutral-900 group-hover:text-sage-700">
                        Undercut Lowest
                      </p>
                      <p className="text-[11px] text-neutral-400 mt-0.5">{symbol}5 below lowest competitor</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-neutral-900">
                        {symbol}{selectedRow.minMarket - 5}
                      </p>
                      <p className="text-[11px] font-medium text-sage-600">-{symbol}5 below min</p>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => {
                    navigate('/admin/revenue/calendar', {
                      state: {
                        preselectedDate: selectedRow.date,
                        suggestedRate: selectedRow.maxMarket,
                        reason: `Premium position at market high (${symbol}${selectedRow.maxMarket})`,
                      },
                    });
                    setShowAdjustModal(false);
                  }}
                  className="w-full p-4 rounded-lg border border-neutral-200 hover:border-gold-300 hover:bg-gold-50/50 transition-all group text-left"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[13px] font-semibold text-neutral-900 group-hover:text-gold-700">
                        Premium Position
                      </p>
                      <p className="text-[11px] text-neutral-400 mt-0.5">Match highest competitor</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-neutral-900">{symbol}{selectedRow.maxMarket}</p>
                      <p className="text-[11px] font-medium text-gold-600">Market high</p>
                    </div>
                  </div>
                </button>
              </div>
            </div>
          </div>
        )}
      </Drawer>
    </>
  );
};

// Competitor Card Component
interface CompetitorCardProps {
  competitor: Competitor;
  date?: string | Date;
}

export const CompetitorCard = ({ competitor }: CompetitorCardProps) => {
  const { symbol } = useCurrency();
  return (
    <div className="p-3 sm:p-5 rounded-lg border border-neutral-100 bg-neutral-50/50 hover:bg-white transition-colors">
      <div className="flex items-start justify-between mb-3 sm:mb-4">
        <div>
          <h4 className="text-xs sm:text-[13px] font-semibold text-neutral-900">{competitor.name}</h4>
          <div className="flex items-center gap-1.5 sm:gap-2 mt-1">
            <div className="flex">
              {Array.from({ length: Math.round(competitor.rating) }).map((_, i) => (
                <span key={i} className="text-gold-400 text-[10px] sm:text-[11px]">
                  *
                </span>
              ))}
            </div>
            <span className="text-[10px] sm:text-[11px] font-medium text-neutral-400">{competitor.distance}</span>
          </div>
        </div>
        <span
          className={`px-1.5 sm:px-2 py-0.5 sm:py-1 text-[9px] sm:text-[10px] font-semibold rounded-md ${
            competitor.isActive ? 'bg-sage-50 text-sage-700' : 'bg-neutral-50 text-neutral-500'
          }`}
        >
          {competitor.isActive ? 'Active' : 'Inactive'}
        </span>
      </div>

      <div className="space-y-1.5 sm:space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[10px] sm:text-[11px] font-medium text-neutral-500">Today's Rate</span>
          <span className="text-lg sm:text-xl font-bold text-neutral-900">{symbol}{competitor.todayRate}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[10px] sm:text-[11px] font-medium text-neutral-500">7-Day Avg</span>
          <span className="text-xs sm:text-[13px] font-semibold text-neutral-700">{symbol}{competitor.avgRate7Day}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[10px] sm:text-[11px] font-medium text-neutral-500">30-Day Avg</span>
          <span className="text-xs sm:text-[13px] font-semibold text-neutral-700">{symbol}{competitor.avgRate30Day}</span>
        </div>
      </div>

      <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-neutral-100">
        <p className="text-[9px] sm:text-[10px] text-neutral-400">
          Last updated: {new Date(competitor.lastUpdated).toLocaleDateString()}
        </p>
      </div>
    </div>
  );
};

export default CompetitorRateTable;
