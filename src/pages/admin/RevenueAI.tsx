import { useState, useEffect, useCallback, Component, ReactNode } from 'react';
import { Download, RefreshCw, Sparkles, Target, CheckCircle, Cpu, Calculator, Building2, CalendarDays, AlertTriangle, Loader2 } from 'lucide-react';
import { Button } from '../../components/ui2/Button';

// Import revenue components
import KPICards from '../../components/revenue/KPICards';
import ForecastChart from '../../components/revenue/ForecastChart';
import ADROccupancyChart from '../../components/revenue/ADROccupancyChart';
import RevenueBySegment from '../../components/revenue/RevenueBySegment';
import UpcomingDemand from '../../components/revenue/UpcomingDemand';
import CompetitorTable from '../../components/revenue/CompetitorTable';
import RateRecommendations from '../../components/revenue/RateRecommendations';
import ControlsBar from '../../components/revenue/ControlsBar';
import ChannelPerformanceTable from '../../components/revenue/ChannelPerformanceTable';
import MarketSegmentChart from '../../components/revenue/MarketSegmentChart';
import PickupAnalysis from '../../components/revenue/PickupAnalysis';
import OccupancyForecastChart from '../../components/revenue/OccupancyForecastChart';

// Import modals
import ScenarioSimulationModal from '../../components/revenue/ScenarioSimulationModal';
import AddCompetitorModal from '../../components/revenue/AddCompetitorModal';
import EventModal from '../../components/revenue/EventModal';

// Import centralized data provider
import { RevenueDataProvider, useRevenueData } from '../../contexts/RevenueDataContext';

// Import API service
import { revenueIntelligenceService, invalidateRevenueCache } from '../../api/services/revenue-intelligence.service';

const STORAGE_KEY = 'glimmora_revenue_settings';

// Error Boundary Component
interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Revenue AI Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="min-h-[300px] sm:min-h-[400px] flex items-center justify-center px-4">
          <div className="text-center p-6 sm:p-8 bg-white rounded-xl border border-neutral-200 max-w-md w-full">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-rose-100 flex items-center justify-center mx-auto mb-3 sm:mb-4">
              <AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6 text-rose-600" />
            </div>
            <h3 className="text-base sm:text-lg font-semibold text-neutral-900 mb-2">Something went wrong</h3>
            <p className="text-[13px] sm:text-sm text-neutral-600 mb-4">
              {this.state.error?.message || 'An unexpected error occurred'}
            </p>
            <Button
              variant="outline"
              onClick={() => window.location.reload()}
            >
              Reload Page
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Component Error Fallback
function ComponentErrorFallback({ componentName, onRetry }: { componentName: string; onRetry?: () => void }) {
  return (
    <div className="p-4 sm:p-6 bg-white rounded-xl border border-neutral-200">
      <div className="flex items-center gap-2 sm:gap-3 text-amber-600 mb-2 sm:mb-3">
        <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5" />
        <p className="text-[13px] sm:text-sm font-medium">Failed to load {componentName}</p>
      </div>
      <p className="text-[12px] sm:text-sm text-neutral-600 mb-3 sm:mb-4">
        There was an error loading this component. Please try again.
      </p>
      {onRetry && (
        <Button variant="outline" size="sm" icon={RefreshCw} onClick={onRetry}>
          Retry
        </Button>
      )}
    </div>
  );
}

// Inner component that uses the context
function RevenueAIContent() {
  // Get data from centralized context
  const { data, loading: globalLoading, lastUpdated, refresh } = useRevenueData();
  const globalKpiSummary = data.kpiSummary;

  // Room-type / channel filters for the KPI cards. Lifted from ControlsBar so
  // the dropdowns actually filter revenue. When any filter is active we fetch
  // a dedicated KPI summary; otherwise we reuse the shared context payload so
  // we don't hit the API unnecessarily.
  const [roomCategory, setRoomCategory] = useState<string>('all');
  const [roomTypeDbId, setRoomTypeDbId] = useState<number | null>(null);
  const [channel, setChannelState] = useState<string>('all');
  const [filteredKpiSummary, setFilteredKpiSummary] = useState<any>(null);
  const [filteredKpiLoading, setFilteredKpiLoading] = useState(false);

  const hasActiveFilter = roomTypeDbId != null || (channel && channel !== 'all');

  useEffect(() => {
    // With no active filter we fall back to the shared context summary.
    if (!hasActiveFilter) {
      setFilteredKpiSummary(null);
      return;
    }
    let cancelled = false;
    setFilteredKpiLoading(true);
    // Drop any stale cached kpi-summary entries so switching the filter always
    // forces a fresh request, even if the user toggled back-and-forth or the
    // shared context just refreshed (SSE).
    invalidateRevenueCache('kpi-summary');
    console.log('[RevenueAI] Fetching KPI summary for', { room_type_id: roomTypeDbId, channel });
    revenueIntelligenceService
      .getKPISummary(roomTypeDbId, channel === 'all' ? null : channel)
      .then((res) => {
        if (cancelled) return;
        console.log('[RevenueAI] Filtered KPI summary received:', res);
        setFilteredKpiSummary(res);
      })
      .catch((err) => {
        if (cancelled) return;
        console.error('[RevenueAI] Filtered KPI summary failed:', err);
        setFilteredKpiSummary(null);
      })
      .finally(() => {
        if (!cancelled) setFilteredKpiLoading(false);
      });
    return () => {
      cancelled = true;
    };
    // Re-run when the filters change, or when the shared context refreshes.
    // IMPORTANT: depend on the numeric timestamp — `lastUpdated` itself is a
    // new Date object on every render (same time, different reference) which
    // would otherwise cause an infinite fetch loop while a filter is active.
  }, [roomTypeDbId, channel, hasActiveFilter, lastUpdated?.getTime()]);

  const handleRoomCategoryChange = useCallback((id: string, dbId: number | null) => {
    setRoomCategory(id);
    setRoomTypeDbId(dbId);
  }, []);

  const handleChannelChange = useCallback((val: string) => {
    setChannelState(val);
  }, []);

  const kpiSummary = filteredKpiSummary || globalKpiSummary;

  // Settings state with localStorage persistence
  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return {
          autoRate: true,
          competitorScan: true,
          demandPricing: false
        };
      }
    }
    return {
      autoRate: true,
      competitorScan: true,
      demandPricing: false
    };
  });

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSyncingSettings, setIsSyncingSettings] = useState(false);

  // Date-range filter for the KPI cards — lifted from ControlsBar so the
  // dropdown actually affects what's displayed.
  const [dateRange, setDateRange] = useState<'today' | '7days' | '14days' | '30days'>('today');
  const kpiForRange = (() => {
    if (!kpiSummary) return null;
    switch (dateRange) {
      case '7days':
        return kpiSummary.next_7_days || kpiSummary.week || kpiSummary.today;
      case '14days':
        // No dedicated 14-day bucket — approximate via next_30_days split.
        return kpiSummary.next_14_days || kpiSummary.next_30_days || kpiSummary.next_7_days || kpiSummary.today;
      case '30days':
        return kpiSummary.next_30_days || kpiSummary.month || kpiSummary.today;
      case 'today':
      default:
        return kpiSummary.today;
    }
  })();

  // Modal states
  const [scenarioModalOpen, setScenarioModalOpen] = useState(false);
  const [competitorModalOpen, setCompetitorModalOpen] = useState(false);
  const [eventModalOpen, setEventModalOpen] = useState(false);

  // Persist settings to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  }, [settings]);

  // Sync settings with backend
  const syncSettingsWithBackend = useCallback(async (newSettings: typeof settings, changedKey?: string) => {
    setIsSyncingSettings(true);
    try {
      // Sync based on which setting changed
      if (!changedKey || changedKey === 'autoRate') {
        await revenueIntelligenceService.toggleAutoPricing(newSettings.autoRate);
      }
      if (!changedKey || changedKey === 'competitorScan') {
        await revenueIntelligenceService.toggleCompetitorScan(newSettings.competitorScan);
      }
      if (!changedKey || changedKey === 'demandPricing') {
        await revenueIntelligenceService.toggleDemandPricing(newSettings.demandPricing);
      }
      console.log('Revenue AI settings synced with backend');
    } catch (error) {
      console.error('Failed to sync Revenue AI settings with backend:', error);
    } finally {
      setIsSyncingSettings(false);
    }
  }, []);

  const handleSettingsChange = useCallback((newSettings: typeof settings) => {
    // Find which key changed
    const changedKey = Object.keys(newSettings).find(
      key => newSettings[key as keyof typeof newSettings] !== settings[key as keyof typeof settings]
    );

    setSettings(newSettings);

    // Sync with backend
    syncSettingsWithBackend(newSettings, changedKey);
  }, [settings, syncSettingsWithBackend]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refresh();
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleExportReport = async () => {
    // Generate CSV data from context data
    const kpiData = kpiSummary?.today;
    const competitors = data.competitors || [];

    const csvRows = [
      ['Revenue AI Report', new Date().toLocaleDateString()],
      [],
      ['KPI Metrics'],
      ['Today\'s Revenue', kpiData?.total_revenue ? `₹${kpiData.total_revenue.toLocaleString()}` : 'N/A'],
      ['ADR', kpiData?.adr ? `₹${kpiData.adr.toLocaleString()}` : 'N/A'],
      ['RevPAR', kpiData?.revpar ? `₹${kpiData.revpar.toLocaleString()}` : 'N/A'],
      ['Occupancy', kpiData?.occupancy ? `${kpiData.occupancy}%` : 'N/A'],
      [],
      ['Competitor Analysis'],
      ['Hotel', 'Today Rate', '7-Day Avg', 'Rating', 'Distance'],
      ...competitors.map((c) => [c.name, c.todayRate, c.avgRate7Day, c.rating, c.distance]),
      [],
      ['Generated by Glimmora Revenue AI'],
      ['Report Date', new Date().toISOString()],
    ];

    const csvContent = csvRows.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `revenue-report-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  // Format last updated time (show "Loading..." only when actually loading; otherwise "--" so we don't look stuck)
  const getLastUpdatedText = () => {
    if (!lastUpdated) return globalLoading ? 'Loading...' : '--';
    const now = new Date();
    const diffMs = now.getTime() - lastUpdated.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    const diffHours = Math.floor(diffMins / 60);
    return `${diffHours}h ago`;
  };

  return (
    <ErrorBoundary>
      <div className="min-h-screen w-full min-w-0 flex flex-col" style={{ backgroundColor: '#F9F7F7' }}>
        <main className="flex-1 w-full min-w-0 px-4 sm:px-6 lg:px-10 py-4 sm:py-6 space-y-4 sm:space-y-6">
          {/* Header */}
          <header className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-neutral-900 whitespace-nowrap">
                Revenue AI
              </h1>
              <span className="px-1.5 sm:px-2 py-0.5 rounded-md text-[9px] sm:text-[10px] font-bold uppercase tracking-wider bg-sage-100 text-sage-700">
                Smart
              </span>
              {(globalLoading || filteredKpiLoading) && (
                <span className="px-1.5 sm:px-2 py-0.5 rounded-md text-[9px] sm:text-[10px] font-medium bg-ocean-100 text-ocean-700 animate-pulse whitespace-nowrap">
                  Loading...
                </span>
              )}
            </div>

            {/* Actions - all in one row */}
            <div className="flex items-center gap-2 shrink-0">
              <Button
                variant="outline"
                size="sm"
                icon={Calculator}
                onClick={() => setScenarioModalOpen(true)}
                className="text-xs sm:text-sm"
              >
                Simulate
              </Button>
              <Button
                variant="outline"
                size="sm"
                icon={Building2}
                onClick={() => setCompetitorModalOpen(true)}
                className="text-xs sm:text-sm"
              >
                <span className="hidden lg:inline">Add Competitor</span>
                <span className="lg:hidden">Competitor</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                icon={CalendarDays}
                onClick={() => setEventModalOpen(true)}
                className="text-xs sm:text-sm"
              >
                <span className="hidden lg:inline">Add Event</span>
                <span className="lg:hidden">Event</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                icon={RefreshCw}
                onClick={handleRefresh}
                disabled={isRefreshing}
                loading={isRefreshing}
                className="text-xs sm:text-sm"
              >
                Refresh
              </Button>
              <Button
                variant="primary"
                size="sm"
                icon={Download}
                onClick={handleExportReport}
                className="text-xs sm:text-sm"
              >
                Export Report
              </Button>
            </div>
          </header>
          <p className="text-[11px] sm:text-[13px] text-neutral-500 -mt-2 flex items-center gap-2">
            <span>AI-powered revenue management & forecasting • Updated {getLastUpdatedText()}</span>
            {isSyncingSettings && (
              <span className="flex items-center gap-1 text-ocean-600">
                <Loader2 className="w-3 h-3 animate-spin" />
                <span className="text-[10px] sm:text-[11px]">Syncing...</span>
              </span>
            )}
          </p>

          {/* Controls Bar */}
          <section className="rounded-[10px] bg-white p-3 sm:p-4">
            <ControlsBar
              settings={settings}
              onSettingsChange={handleSettingsChange}
              dateRange={dateRange}
              onDateRangeChange={setDateRange}
              roomCategory={roomCategory}
              onRoomCategoryChange={handleRoomCategoryChange}
              channel={channel}
              onChannelChange={handleChannelChange}
            />
          </section>

          {/* KPI Cards — reflect the selected date range, room-type and channel filters */}
          <section>
            {hasActiveFilter && (
              <div className="mb-2 flex items-center justify-between text-[11px] sm:text-[12px] text-neutral-600">
                <span>
                  Showing metrics for{' '}
                  {roomTypeDbId != null && (
                    <span className="font-semibold text-terra-700">room: {roomCategory}</span>
                  )}
                  {roomTypeDbId != null && channel !== 'all' && <span> · </span>}
                  {channel !== 'all' && (
                    <span className="font-semibold text-terra-700">channel: {channel}</span>
                  )}
                  {filteredKpiLoading && <span className="ml-2 text-ocean-600">· Loading…</span>}
                  {!filteredKpiLoading && filteredKpiSummary && (
                    <span className="ml-2 text-neutral-500">
                      · today.total_revenue ={' '}
                      {String(filteredKpiSummary?.today?.total_revenue ?? '?')}
                      {filteredKpiSummary?._applied_filters ? (
                        <span className="ml-2 text-sage-600">
                          · server echo: channel=
                          {String(filteredKpiSummary._applied_filters.channel ?? 'null')}, room=
                          {String(filteredKpiSummary._applied_filters.room_type_id ?? 'null')}
                        </span>
                      ) : (
                        <span className="ml-2 text-rose-600">
                          · server is running OLD code (no _applied_filters in response) — restart backend
                        </span>
                      )}
                    </span>
                  )}
                  {!filteredKpiLoading && !filteredKpiSummary && hasActiveFilter && (
                    <span className="ml-2 text-rose-500">
                      · filter request failed, falling back to global data
                    </span>
                  )}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    handleRoomCategoryChange('all', null);
                    handleChannelChange('all');
                  }}
                  className="text-ocean-600 hover:underline"
                >
                  Clear filters
                </button>
              </div>
            )}
            <ErrorBoundary fallback={<ComponentErrorFallback componentName="KPI Cards" onRetry={handleRefresh} />}>
              <KPICards data={kpiForRange} />
            </ErrorBoundary>
          </section>

          {/* Revenue Forecast Chart */}
          <section className="rounded-[10px] bg-white overflow-hidden">
            <ErrorBoundary fallback={<ComponentErrorFallback componentName="Forecast Chart" onRetry={handleRefresh} />}>
              <ForecastChart />
            </ErrorBoundary>
          </section>

          {/* Occupancy Forecast Chart */}
          <section className="rounded-[10px] bg-white overflow-hidden">
            <ErrorBoundary fallback={<ComponentErrorFallback componentName="Occupancy Forecast" onRetry={handleRefresh} />}>
              <OccupancyForecastChart />
            </ErrorBoundary>
          </section>

          {/* ADR + Occupancy Chart */}
          <section className="rounded-[10px] bg-white overflow-hidden">
            <ErrorBoundary fallback={<ComponentErrorFallback componentName="ADR Chart" onRetry={handleRefresh} />}>
              <ADROccupancyChart />
            </ErrorBoundary>
          </section>

          {/* Revenue By Segment + Upcoming Demand */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <section className="rounded-[10px] overflow-hidden">
              <ErrorBoundary fallback={<ComponentErrorFallback componentName="Revenue by Segment" onRetry={handleRefresh} />}>
                <RevenueBySegment />
              </ErrorBoundary>
            </section>

            <section className="rounded-[10px] overflow-hidden">
              <ErrorBoundary fallback={<ComponentErrorFallback componentName="Upcoming Demand" onRetry={handleRefresh} />}>
                <UpcomingDemand />
              </ErrorBoundary>
            </section>
          </div>

          {/* Market Segment Chart */}
          <section className="rounded-[10px] overflow-hidden">
            <ErrorBoundary fallback={<ComponentErrorFallback componentName="Market Segments" onRetry={handleRefresh} />}>
              <MarketSegmentChart />
            </ErrorBoundary>
          </section>

          {/* Pickup Analysis */}
          <section className="rounded-[10px] overflow-hidden">
            <ErrorBoundary fallback={<ComponentErrorFallback componentName="Pickup Analysis" onRetry={handleRefresh} />}>
              <PickupAnalysis />
            </ErrorBoundary>
          </section>

          {/* Channel Performance Table */}
          <section className="rounded-[10px] overflow-hidden">
            <ErrorBoundary fallback={<ComponentErrorFallback componentName="Channel Performance" onRetry={handleRefresh} />}>
              <ChannelPerformanceTable />
            </ErrorBoundary>
          </section>

          {/* Competitor Analysis & AI Recommendations */}
          <div className="space-y-4">
            {/* Competitor Rates — hidden for now (set SHOW_COMPETITOR_TABLE = true to restore) */}
            {false && (
              <section className="rounded-[10px] bg-white overflow-hidden">
                <ErrorBoundary fallback={<ComponentErrorFallback componentName="Competitor Table" onRetry={handleRefresh} />}>
                  <CompetitorTable yourRate={kpiSummary?.today?.adr || 150} />
                </ErrorBoundary>
              </section>
            )}

            <section className="rounded-[10px] bg-white overflow-hidden">
              <ErrorBoundary fallback={<ComponentErrorFallback componentName="Rate Recommendations" onRetry={handleRefresh} />}>
                <RateRecommendations
                  settings={settings}
                  onRefreshCalendar={handleRefresh}
                />
              </ErrorBoundary>
            </section>
          </div>

          {/* AI Engine Status Footer */}
          <section className="rounded-[10px] bg-white overflow-hidden">
            <div className="px-4 sm:px-6 py-4 sm:py-5 flex items-center justify-between">
              <div>
                <h3 className="text-[13px] sm:text-sm font-semibold text-neutral-800">AI Engine Status</h3>
                <p className="text-[10px] sm:text-[11px] text-neutral-400 font-medium mt-0.5">Real-time optimization metrics</p>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg bg-sage-50">
                <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-sage-500 animate-pulse" />
                <span className="text-[10px] sm:text-[11px] font-semibold text-sage-700">Active</span>
              </div>
            </div>
            <div className="px-4 sm:px-6 pb-4 sm:pb-6">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                <div className="p-3 sm:p-4 rounded-lg bg-neutral-50">
                  <div className="flex items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
                    <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-md bg-sage-100 flex items-center justify-center">
                      <Cpu className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-sage-600" />
                    </div>
                    <p className="text-[9px] sm:text-[10px] font-semibold uppercase tracking-widest text-neutral-400">Engine</p>
                  </div>
                  <p className="text-base sm:text-lg font-bold text-sage-600">Active</p>
                  <p className="text-[10px] sm:text-[11px] text-neutral-400 mt-0.5">v2.4.1</p>
                </div>
                <div className="p-3 sm:p-4 rounded-lg bg-neutral-50">
                  <div className="flex items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
                    <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-md bg-ocean-100 flex items-center justify-center">
                      <Target className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-ocean-600" />
                    </div>
                    <p className="text-[9px] sm:text-[10px] font-semibold uppercase tracking-widest text-neutral-400">Accuracy</p>
                  </div>
                  <p className="text-base sm:text-lg font-bold text-ocean-600">94.2%</p>
                  <p className="text-[10px] sm:text-[11px] text-neutral-400 mt-0.5">Forecast precision</p>
                </div>
                <div className="p-3 sm:p-4 rounded-lg bg-neutral-50">
                  <div className="flex items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
                    <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-md bg-terra-100 flex items-center justify-center">
                      <CheckCircle className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-terra-600" />
                    </div>
                    <p className="text-[9px] sm:text-[10px] font-semibold uppercase tracking-widest text-neutral-400">Applied</p>
                  </div>
                  <p className="text-base sm:text-lg font-bold text-terra-600">12</p>
                  <p className="text-[10px] sm:text-[11px] text-neutral-400 mt-0.5">Recommendations today</p>
                </div>
                <div className="p-3 sm:p-4 rounded-lg bg-neutral-50">
                  <div className="flex items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
                    <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-md bg-gold-100 flex items-center justify-center">
                      <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-gold-600" />
                    </div>
                    <p className="text-[9px] sm:text-[10px] font-semibold uppercase tracking-widest text-neutral-400">Powered by</p>
                  </div>
                  <p className="text-base sm:text-lg font-bold text-neutral-900">Glimmora AI</p>
                  <p className="text-[10px] sm:text-[11px] text-neutral-400 mt-0.5">ML-driven insights</p>
                </div>
              </div>
            </div>
          </section>
        </main>

        {/* Modals */}
        <ScenarioSimulationModal
          open={scenarioModalOpen}
          onClose={() => setScenarioModalOpen(false)}
        />
        <AddCompetitorModal
          open={competitorModalOpen}
          onClose={() => setCompetitorModalOpen(false)}
          onSuccess={(competitor) => {
            console.log('Competitor added:', competitor);
            // Could trigger a refresh of competitor data here
          }}
        />
        <EventModal
          open={eventModalOpen}
          onClose={() => setEventModalOpen(false)}
          onSuccess={(event) => {
            console.log('Event added:', event);
            // Could trigger a refresh of event/forecast data here
          }}
        />
      </div>
    </ErrorBoundary>
  );
}

// Main export wraps content with the data provider
export default function RevenueAI() {
  return (
    <RevenueDataProvider>
      <RevenueAIContent />
    </RevenueDataProvider>
  );
}
