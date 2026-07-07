import { useState, useMemo, useEffect } from 'react';
import { AlertCircle, RefreshCw, Calendar, TrendingUp, Lightbulb, Target, Sparkles } from 'lucide-react';
import { useRMS } from '../../../context/RMSContext';
import PickupChart, { PickupSummaryCard } from '../../../components/revenue-management/PickupChart';
import { Button } from '../../../components/ui2/Button';
// Table components replaced with native table for better responsive control
import { StatusBadge } from '../../../components/ui2/Badge';
import { TableSearchBar } from '../../../components/ui2/DataTableView';
import {
  revenueIntelligenceService,
  PickupAIInsight,
  invalidateRevenueCache,
} from '../../../api/services/revenue-intelligence.service';
import { useToast } from '../../../contexts/ToastContext';
import { Drawer } from '../../../components/ui2/Drawer';

const PickupAnalysis = () => {
  const { pickup, pickupMetrics, refreshPickup, compareToHistorical, predictPickup, isLoading } = useRMS();
  const toast = useToast() as any;

  const [dateRange, setDateRange] = useState(14);
  const [chartType, setChartType] = useState('area');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [aiInsights, setAiInsights] = useState<PickupAIInsight[]>([]);
  const [insightsLoading, setInsightsLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const [showAlertDetails, setShowAlertDetails] = useState(false);
  const [showAlertsDrawer, setShowAlertsDrawer] = useState(false);
  // Fallback: stop showing full-page loading after this time so UI is never stuck
  const [loadingTimedOut, setLoadingTimedOut] = useState(false);
  const LOADING_TIMEOUT_MS = 12000;

  useEffect(() => {
    if (!isLoading || Object.keys(pickup).length > 0) return;
    const t = setTimeout(() => setLoadingTimedOut(true), LOADING_TIMEOUT_MS);
    return () => clearTimeout(t);
  }, [isLoading, pickup]);

  // Fetch AI insights from API
  useEffect(() => {
    const fetchInsights = async () => {
      setInsightsLoading(true);
      try {
        const response = await revenueIntelligenceService.getPickupMetrics(dateRange);
        setAiInsights(response.ai_insights || []);
      } catch (err) {
        console.error('Failed to fetch AI insights:', err);
        setAiInsights([]);
      } finally {
        setInsightsLoading(false);
      }
    };
    fetchInsights();
  }, [dateRange]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      invalidateRevenueCache('pickup-metrics');
      // Force a fresh backend call (bypass cache) so refresh always hits the API
      await refreshPickup(true);
      // Re-fetch AI insights after refresh (bypass cache for fresh data)
      const response = await revenueIntelligenceService.getPickupMetrics(dateRange, { bypassCache: true });
      setAiInsights(response.ai_insights || []);
      // Bump key so child components (summary cards, chart) re-fetch
      setRefreshKey(prev => prev + 1);
      toast.success('Pickup data refreshed successfully');
    } catch (err) {
      console.error('Failed to refresh pickup data:', err);
      toast.error('Failed to refresh pickup data');
    } finally {
      setIsRefreshing(false);
    }
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

  // Get pickup alerts with date for each alert
  const allAlertsWithDates = useMemo(() => {
    return Object.entries(pickup)
      .flatMap(([date, p]) =>
        (p.alerts || [])
          .filter((a: { severity?: string }) => a.severity === 'critical' || a.severity === 'high')
          .map((a: { type?: string; severity?: string; message?: string }) => ({ ...a, date }))
      )
      .slice(0, 20);
  }, [pickup]);

  const allAlerts = allAlertsWithDates;

  // Get dates for the table with search filtering
  const tableDates = useMemo(() => {
    const today = new Date();
    const dates = [];
    for (let i = 0; i < dateRange; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];
      if (pickup[dateStr]) {
        dates.push({ date: dateStr, data: pickup[dateStr] });
      }
    }

    if (!searchQuery.trim()) return dates;

    const query = searchQuery.toLowerCase();
    return dates.filter(({ date, data }) => {
      const formattedDate = new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', weekday: 'short' });
      return (
        formattedDate.toLowerCase().includes(query) ||
        data.paceStatus?.toLowerCase().includes(query) ||
        data.currentBookings?.toString().includes(query) ||
        data.expectedTotal?.toString().includes(query)
      );
    });
  }, [pickup, dateRange, searchQuery]);

  // Show loading state only while initial data is loading and we haven't timed out
  const showFullPageLoading = isLoading && Object.keys(pickup).length === 0 && !loadingTimedOut;
  if (showFullPageLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#F9F7F7' }}>
        <div className="flex flex-col items-center gap-4">
          <RefreshCw className="w-10 h-10 text-terra-500 animate-spin" />
          <p className="text-neutral-500 font-medium">Loading pickup analysis...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F9F7F7' }}>
      <main className="px-4 sm:px-6 lg:px-10 py-4 sm:py-6 space-y-4 sm:space-y-6">
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-neutral-900">
            Pickup Analysis
          </h1>
          <p className="text-xs sm:text-[13px] text-neutral-500 mt-1">
            Monitor booking pace and compare to historical trends
          </p>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="flex items-center gap-1 p-1 rounded-lg bg-neutral-100">
            {[7, 14, 30].map((days) => (
              <button
                key={days}
                onClick={() => setDateRange(days)}
                className={`px-2 sm:px-4 py-1.5 rounded-lg text-xs sm:text-[13px] font-semibold transition-all duration-200 ${
                  dateRange === days
                    ? 'bg-white text-neutral-900 shadow-sm'
                    : 'text-neutral-500 hover:text-neutral-900 hover:bg-white/50'
                }`}
              >
                {days}d
              </button>
            ))}
          </div>
          <Button
            onClick={handleRefresh}
            loading={isRefreshing}
            icon={RefreshCw}
            variant="primary"
          >
            <span className="hidden sm:inline">Refresh</span>
          </Button>
        </div>
      </header>

      {loadingTimedOut && Object.keys(pickup).length === 0 && (
        <div className="rounded-lg bg-amber-50 border border-amber-200 px-4 py-3 flex items-center justify-between gap-3">
          <p className="text-sm text-amber-800">Pickup data is taking longer than usual. You can try refreshing.</p>
          <Button variant="outline" size="sm" onClick={handleRefresh} loading={isRefreshing} icon={RefreshCw}>
            Refresh
          </Button>
        </div>
      )}

      {/* Summary Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        <PickupSummaryCard period="next7Days" refreshKey={refreshKey} />
        <PickupSummaryCard period="next14Days" refreshKey={refreshKey} />
        <PickupSummaryCard period="next30Days" refreshKey={refreshKey} />
      </section>

      {/* AI Insights Section */}
      {aiInsights.length > 0 && (
        <section className="rounded-[10px] bg-white overflow-hidden">
          <div className="px-4 sm:px-6 py-4 sm:py-5 flex items-center gap-2 sm:gap-3 border-b border-neutral-100">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center bg-purple-100 flex-shrink-0">
              <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-purple-600" />
            </div>
            <div>
              <h3 className="text-[13px] sm:text-sm font-semibold text-neutral-800">AI-Powered Insights</h3>
              <p className="text-[10px] sm:text-[11px] text-neutral-400 font-medium mt-0.5">
                Intelligent recommendations based on booking patterns
              </p>
            </div>
          </div>
          <div className="p-4 sm:p-6 space-y-3 sm:space-y-4">
            {insightsLoading ? (
              <div className="flex items-center justify-center py-6 sm:py-8">
                <RefreshCw className="w-4 h-4 sm:w-5 sm:h-5 text-terra-500 animate-spin" />
                <span className="ml-2 text-xs sm:text-sm text-neutral-500">Analyzing data...</span>
              </div>
            ) : (
              aiInsights.map((insight, idx) => {
                const style = getInsightStyle(insight.type);
                const { Icon } = style;
                return (
                  <div
                    key={idx}
                    className={`rounded-lg border p-3 sm:p-4 ${style.bg} ${style.border}`}
                  >
                    <div className="flex items-start gap-2 sm:gap-3">
                      <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${style.iconBg}`}>
                        <Icon className={`w-4 h-4 sm:w-5 sm:h-5 ${style.iconColor}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-1 sm:gap-2 mb-1">
                          <h4 className={`text-[12px] sm:text-[13px] font-semibold ${style.titleColor}`}>
                            {insight.title}
                          </h4>
                          <span className={`text-[9px] sm:text-[10px] font-medium px-1.5 sm:px-2 py-0.5 rounded-full ${
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
                        <div className="flex items-center gap-1.5 sm:gap-2">
                          <Target className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-neutral-400 flex-shrink-0" />
                          <span className="text-[10px] sm:text-[11px] font-medium text-neutral-500">
                            Recommended Action: {insight.action}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>
      )}

      {/* Alerts Banner */}
      {allAlerts.length > 0 && (
        <>
        <div className="rounded-[10px] p-3 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-gold-50">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center bg-gold-100 flex-shrink-0">
              <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-gold-600" />
            </div>
            <div>
              <p className="text-xs sm:text-[13px] font-semibold text-gold-800">
                {allAlerts.length} Pickup Alert{allAlerts.length !== 1 ? 's' : ''} Detected
              </p>
              <p className="text-[10px] sm:text-[11px] text-neutral-500 font-medium">
                {allAlerts.filter(a => a.severity === 'critical').length > 0 &&
                  `${allAlerts.filter(a => a.severity === 'critical').length} critical`}
                {allAlerts.filter(a => a.severity === 'critical').length > 0 &&
                 allAlerts.filter(a => a.severity === 'high').length > 0 && ', '}
                {allAlerts.filter(a => a.severity === 'high').length > 0 &&
                  `${allAlerts.filter(a => a.severity === 'high').length} high priority`}
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="w-full sm:w-auto"
            onClick={() => setShowAlertDetails(prev => !prev)}
          >
            {showAlertDetails ? 'Hide Details' : 'View Details'}
          </Button>
        </div>

        {/* Expanded Alert Details */}
        {showAlertDetails && (
          <div className="mt-3 space-y-2">
            {allAlerts.map((alert, idx) => (
              <div
                key={idx}
                className={`flex items-start gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg border ${
                  alert.severity === 'critical'
                    ? 'bg-rose-50 border-rose-200'
                    : 'bg-gold-50 border-gold-200'
                }`}
              >
                <AlertCircle className={`w-4 h-4 flex-shrink-0 mt-0.5 ${
                  alert.severity === 'critical' ? 'text-rose-600' : 'text-gold-600'
                }`} />
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-0.5">
                    <span className={`text-[9px] sm:text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded ${
                      alert.severity === 'critical'
                        ? 'bg-rose-100 text-rose-700'
                        : 'bg-gold-100 text-gold-700'
                    }`}>
                      {alert.severity}
                    </span>
                    <span className="text-[10px] sm:text-[11px] font-medium text-neutral-500 capitalize">
                      {alert.type}
                    </span>
                  </div>
                  <p className="text-[12px] sm:text-[13px] text-neutral-800 font-medium">{alert.message}</p>
                </div>
              </div>
            ))}
          </div>
        )}
        </>
      )}

      {/* Pickup Alerts Details Drawer */}
      <Drawer
        isOpen={showAlertsDrawer}
        onClose={() => setShowAlertsDrawer(false)}
        title="Pickup Alert Details"
        subtitle={`${allAlerts.length} critical and high priority alert${allAlerts.length !== 1 ? 's' : ''}`}
      >
        <div className="space-y-3">
          {allAlerts.map((alert, idx) => (
            <div
              key={idx}
              className={`rounded-lg border p-3 sm:p-4 ${
                alert.severity === 'critical'
                  ? 'bg-rose-50 border-rose-200'
                  : 'bg-gold-50 border-gold-200'
              }`}
            >
              <div className="flex items-start gap-2 sm:gap-3">
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    alert.severity === 'critical' ? 'bg-rose-100' : 'bg-gold-100'
                  }`}
                >
                  <AlertCircle
                    className={`w-4 h-4 ${
                      alert.severity === 'critical' ? 'text-rose-600' : 'text-gold-600'
                    }`}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] sm:text-[11px] font-medium text-neutral-500 mb-0.5">
                    {new Date(alert.date).toLocaleDateString('en-US', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </p>
                  <span
                    className={`text-[9px] sm:text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${
                      alert.severity === 'critical'
                        ? 'bg-rose-100 text-rose-700'
                        : 'bg-gold-100 text-gold-700'
                    }`}
                  >
                    {alert.severity}
                  </span>
                  <p className="text-[12px] sm:text-[13px] text-neutral-800 mt-2">{alert.message}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Drawer>

      {/* Chart Section */}
      <section className="rounded-[10px] bg-white overflow-hidden">
        <div className="px-4 sm:px-6 py-4 sm:py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-[13px] sm:text-sm font-semibold text-neutral-800">Booking Pace Chart</h3>
            <p className="text-[10px] sm:text-[11px] text-neutral-400 font-medium mt-0.5">
              Visual trends of current vs expected bookings
            </p>
          </div>
          <div className="flex items-center gap-1 p-1 rounded-lg bg-neutral-100">
            <button
              onClick={() => setChartType('area')}
              className={`px-3 sm:px-4 py-1.5 text-xs sm:text-[13px] font-semibold rounded-lg transition-all duration-200 ${
                chartType === 'area'
                  ? 'bg-white text-neutral-900 shadow-sm'
                  : 'text-neutral-500 hover:text-neutral-900 hover:bg-white/50'
              }`}
            >
              Area
            </button>
            <button
              onClick={() => setChartType('bar')}
              className={`px-3 sm:px-4 py-1.5 text-xs sm:text-[13px] font-semibold rounded-lg transition-all duration-200 ${
                chartType === 'bar'
                  ? 'bg-white text-neutral-900 shadow-sm'
                  : 'text-neutral-500 hover:text-neutral-900 hover:bg-white/50'
              }`}
            >
              Bar
            </button>
          </div>
        </div>
        <div className="px-2 sm:px-6 pb-4 sm:pb-6">
          <PickupChart dateRange={dateRange} chartType={chartType} refreshKey={refreshKey} />
        </div>
      </section>

      {/* Detailed Table */}
      <section className="rounded-[10px] bg-white overflow-hidden">
        <div className="px-4 sm:px-6 py-4 sm:py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-[13px] sm:text-sm font-semibold text-neutral-800">Detailed Pickup Data</h3>
            <p className="text-[10px] sm:text-[11px] text-neutral-400 font-medium mt-0.5">
              Day-by-day breakdown with pace indicators and historical comparisons
            </p>
          </div>
          <TableSearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search by date, pace status..."
          />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px]">
            <thead>
              <tr className="bg-neutral-50/30 border-b border-neutral-100">
                <th className="text-left px-3 sm:px-6 py-3 sm:py-4 text-[9px] sm:text-[10px] font-semibold text-neutral-400 uppercase tracking-widest">
                  Date
                </th>
                <th className="text-right px-3 sm:px-6 py-3 sm:py-4 text-[9px] sm:text-[10px] font-semibold text-neutral-400 uppercase tracking-widest">
                  Current
                </th>
                <th className="text-right px-3 sm:px-6 py-3 sm:py-4 text-[9px] sm:text-[10px] font-semibold text-neutral-400 uppercase tracking-widest">
                  Expected
                </th>
                <th className="text-right px-3 sm:px-6 py-3 sm:py-4 text-[9px] sm:text-[10px] font-semibold text-neutral-400 uppercase tracking-widest">
                  Progress
                </th>
                <th className="text-center px-3 sm:px-6 py-3 sm:py-4 text-[9px] sm:text-[10px] font-semibold text-neutral-400 uppercase tracking-widest">
                  Pace
                </th>
                <th className="text-right px-3 sm:px-6 py-3 sm:py-4 text-[9px] sm:text-[10px] font-semibold text-neutral-400 uppercase tracking-widest">
                  vs Last Year
                </th>
                <th className="text-right px-3 sm:px-6 py-3 sm:py-4 text-[9px] sm:text-[10px] font-semibold text-neutral-400 uppercase tracking-widest">
                  Remaining
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {tableDates.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 sm:px-6 py-8 sm:py-12 text-center">
                    <div className="flex flex-col items-center">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-terra-50 flex items-center justify-center mb-3 sm:mb-4">
                        <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-terra-500" />
                      </div>
                      <p className="text-xs sm:text-[13px] font-semibold text-neutral-800 mb-1">
                        No dates found
                      </p>
                      <p className="text-[10px] sm:text-[11px] text-neutral-500 font-medium">
                        {searchQuery ? "No pickup data matches your search" : "No pickup data available for this period"}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                tableDates.map(({ date, data }) => (
                  <tr key={date} className="hover:bg-neutral-50/50 transition-colors">
                    <td className="px-3 sm:px-6 py-3 sm:py-4">
                      <div>
                        <p className="text-xs sm:text-[13px] font-medium text-neutral-900 whitespace-nowrap">
                          {new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </p>
                        <p className="text-[10px] sm:text-[11px] text-neutral-400 whitespace-nowrap">
                          {new Date(date).toLocaleDateString('en-US', { weekday: 'short' })} • {data.daysOut}d out
                        </p>
                      </div>
                    </td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4 text-right">
                      <span className="text-sm sm:text-[15px] font-semibold text-neutral-900 tabular-nums">
                        {data.currentBookings ?? 0}
                      </span>
                    </td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4 text-right">
                      <span className="text-xs sm:text-[13px] text-neutral-600 tabular-nums">
                        {data.expectedTotal ?? 0}
                      </span>
                    </td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <div className="w-16 sm:w-20 h-1.5 rounded-full overflow-hidden bg-neutral-200">
                          <div
                            className="h-full rounded-full bg-terra-500"
                            style={{ width: `${Math.min(100, data.bookingProgress ?? 0)}%` }}
                          />
                        </div>
                        <span className="text-xs sm:text-[13px] font-medium text-neutral-700 tabular-nums min-w-[36px] text-right">
                          {data.bookingProgress ?? 0}%
                        </span>
                      </div>
                    </td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4 text-center">
                      <StatusBadge status={data.paceStatus} />
                    </td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4 text-right">
                      {data.comparisons?.lastYear?.variance !== undefined ? (
                        <span className={`font-semibold text-xs sm:text-[13px] tabular-nums ${
                          data.comparisons.lastYear.variance > 0
                            ? 'text-sage-600'
                            : data.comparisons.lastYear.variance < 0
                              ? 'text-rose-600'
                              : 'text-neutral-500'
                        }`}>
                          {data.comparisons.lastYear.variance > 0 ? '+' : ''}{data.comparisons.lastYear.variance}%
                        </span>
                      ) : (
                        <span className="text-xs sm:text-[13px] text-neutral-400">—</span>
                      )}
                    </td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4 text-right">
                      <span className="text-sm sm:text-[15px] font-semibold text-neutral-900 tabular-nums">
                        {data.remainingToSell ?? 0}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
      </main>
    </div>
  );
};

export default PickupAnalysis;
