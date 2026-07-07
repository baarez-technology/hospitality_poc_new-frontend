import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Globe, RefreshCw, AlertTriangle, CheckCircle, Users, Calendar, WifiOff, CalendarDays, Trash2, Building2, Pencil } from 'lucide-react';
import { useRMS } from '../../../context/RMSContext';
import { useToast } from '../../../contexts/ToastContext';
import CompetitorRateTable from '../../../components/revenue-management/CompetitorRateTable';
import EventModal from '../../../components/revenue/EventModal';
import AddCompetitorModal from '../../../components/revenue/AddCompetitorModal';
import { Button } from '../../../components/ui2/Button';
import { ConfirmModal } from '../../../components/ui2/Modal';
import { revenueIntelligenceService } from '../../../api/services/revenue-intelligence.service';

const CompetitorRates = () => {
  const { success, error: showError } = useToast();
  const {
    competitors,
    competitorInsights,
    competitorsList,
    events,
    parityIssues,
    updateCompetitorRates,
    refreshCompetitors,
    refreshEvents,
    detectUnderpricing,
    detectOverpricing,
  } = useRMS();

  const [dateRange, setDateRange] = useState(14);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [isCompetitorModalOpen, setIsCompetitorModalOpen] = useState(false);
  const [deletingEventId, setDeletingEventId] = useState<number | null>(null);
  const [deletingCompetitorId, setDeletingCompetitorId] = useState<number | null>(null);
  const [competitorToDelete, setCompetitorToDelete] = useState<{ id: number; name: string } | null>(null);
  const [editingCompetitor, setEditingCompetitor] = useState<any>(null);
  const [editingEvent, setEditingEvent] = useState<any>(null);
  const [togglingStatusId, setTogglingStatusId] = useState<number | null>(null);

  // Wait for actual data to load (competitors come from RMS context)
  useEffect(() => {
    if (competitorsList !== undefined) {
      setIsInitialLoading(false);
    }
  }, [competitorsList]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    setHasError(false);
    try {
      await refreshCompetitors();
      success('Competitor rates refreshed successfully');
    } catch (error) {
      console.error('Failed to refresh rates:', error);
      setHasError(true);
      showError('Failed to refresh competitor rates. Please try again.');
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleDeleteEvent = async (eventId: number) => {
    setDeletingEventId(eventId);
    try {
      await revenueIntelligenceService.deleteEvent(eventId);
      await refreshEvents();
      success('Event deleted successfully');
    } catch (err) {
      console.error('Failed to delete event:', err);
      showError('Failed to delete event. Please try again.');
    } finally {
      setDeletingEventId(null);
    }
  };

  const handleDeleteCompetitor = async (comp: any) => {
    setCompetitorToDelete({ id: comp.id, name: comp.name });
  };

  const confirmDeleteCompetitor = async () => {
    if (!competitorToDelete) return;
    setDeletingCompetitorId(competitorToDelete.id);
    try {
      await revenueIntelligenceService.deleteCompetitor(competitorToDelete.id);
      await refreshCompetitors();
      success('Competitor removed successfully');
      setCompetitorToDelete(null);
    } catch (err) {
      console.error('Failed to delete competitor:', err);
      showError('Failed to delete competitor. Please try again.');
    } finally {
      setDeletingCompetitorId(null);
    }
  };

  const handleToggleStatus = async (comp: { id: number; isActive?: boolean }) => {
    setTogglingStatusId(comp.id);
    try {
      await revenueIntelligenceService.updateCompetitor(comp.id, { isActive: !comp.isActive });
      await refreshCompetitors();
      success(comp.isActive ? 'Competitor set to Inactive' : 'Competitor set to Active');
    } catch (err) {
      console.error('Failed to update competitor status:', err);
      showError('Failed to update status. Please try again.');
    } finally {
      setTogglingStatusId(null);
    }
  };

  const underpricedDays = detectUnderpricing();
  const overpricedDays = detectOverpricing();

  // Empty State Component
  const EmptyState = ({ icon: Icon, title, description, action }) => (
    <div className="bg-white rounded-[10px] p-8 sm:p-12 text-center">
      <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto rounded-lg flex items-center justify-center mb-3 sm:mb-4 bg-terra-50">
        <Icon className="w-6 h-6 sm:w-8 sm:h-8 text-terra-500" />
      </div>
      <h3 className="text-sm sm:text-[15px] font-semibold text-neutral-900 mb-1">{title}</h3>
      <p className="text-xs sm:text-[13px] text-neutral-500 mb-4 sm:mb-6">{description}</p>
      {action}
    </div>
  );

  // Error State Component
  const ErrorState = () => (
    <EmptyState
      icon={WifiOff}
      title="Unable to Load Competitor Data"
      description="We couldn't fetch the latest competitor rates. Please check your connection and try again."
      action={
        <Button onClick={handleRefresh} loading={isRefreshing} variant="primary">
          {isRefreshing ? 'Retrying...' : 'Retry'}
        </Button>
      }
    />
  );

  // Check for empty data
  const hasCompetitorData = competitorsList && competitorsList.length > 0;

  // Skeleton Loader for KPI Cards
  const SkeletonKPICard = ({ index = 0 }) => (
    <div
      className="bg-white rounded-[10px] p-3 sm:p-5 animate-pulse"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <div className="mb-2 sm:mb-3">
        <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-lg bg-neutral-100" />
      </div>
      <div className="h-2.5 w-14 sm:w-20 rounded bg-neutral-100 mb-1.5 sm:mb-2" />
      <div className="h-5 sm:h-7 w-12 sm:w-16 rounded bg-neutral-100" />
    </div>
  );

  // KPI Card Component - Consistent with Design System
  const KPICard = ({ title, value, icon: Icon, accentColor = 'terra', index = 0, subtitle }) => {
    const accentStyles = {
      terra: { bg: 'bg-terra-50', icon: 'text-terra-600' },
      sage: { bg: 'bg-sage-50', icon: 'text-sage-600' },
      gold: { bg: 'bg-gold-50', icon: 'text-gold-600' },
      ocean: { bg: 'bg-ocean-50', icon: 'text-ocean-600' },
      rose: { bg: 'bg-rose-50', icon: 'text-rose-600' },
    };

    const style = accentStyles[accentColor] || accentStyles.terra;

    return (
      <div
        className="rounded-[10px] bg-white p-3 sm:p-5"
        style={{ animationDelay: `${index * 100}ms` }}
      >
        <div className="flex items-start justify-between mb-2 sm:mb-3">
          <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${style.bg}`}>
            <Icon className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${style.icon}`} />
          </div>
        </div>
        <p className="text-[8px] sm:text-[10px] font-semibold uppercase tracking-wider text-neutral-400 mb-1 truncate">
          {title}
        </p>
        <p className="text-lg sm:text-[28px] font-semibold tracking-tight text-neutral-900">
          {value}
        </p>

        {subtitle && (
          <p className="text-[10px] sm:text-[11px] text-neutral-400 font-medium mt-1">{subtitle}</p>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F9F7F7' }}>
      <main className="px-4 sm:px-6 lg:px-10 py-4 sm:py-6 space-y-4 sm:space-y-6">
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-neutral-900">
            Competitor Rate Shopper
          </h1>
          <p className="text-xs sm:text-[13px] text-neutral-500 mt-1">
            Monitor competitor pricing and optimize your rate positioning
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
                <span className="sm:hidden">{days}d</span>
                <span className="hidden sm:inline">{days} Days</span>
              </button>
            ))}
          </div>
          <Button
            onClick={() => { setEditingCompetitor(null); setIsCompetitorModalOpen(true); }}
            icon={Building2}
            variant="outline"
          >
            <span className="hidden sm:inline">Add Competitor</span>
          </Button>
          <Button
            onClick={() => { setEditingEvent(null); setIsEventModalOpen(true); }}
            icon={CalendarDays}
            variant="outline"
          >
            <span className="hidden sm:inline">Add Event</span>
          </Button>
          <Button
            onClick={handleRefresh}
            loading={isRefreshing}
            icon={RefreshCw}
            variant="primary"
          >
            <span className="hidden sm:inline">Refresh Rates</span>
          </Button>
        </div>
      </header>

      {/* Summary Stats */}
      <section className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        {isInitialLoading ? (
          <>
            {[0, 1, 2, 3, 4].map((i) => (
              <SkeletonKPICard key={i} index={i} />
            ))}
          </>
        ) : competitorInsights ? (
          <>
            <KPICard
              title="Avg Gap vs Market"
              value={`${(competitorInsights?.avgGapPercent || 0) > 0 ? '+' : ''}${competitorInsights?.avgGapPercent || 0}%`}
              icon={(competitorInsights?.avgGapPercent || 0) < 0 ? TrendingDown : (competitorInsights?.avgGapPercent || 0) > 0 ? TrendingUp : Globe}
              accentColor={(competitorInsights?.avgGapPercent || 0) < 0 ? 'sage' : (competitorInsights?.avgGapPercent || 0) > 0 ? 'rose' : 'terra'}
              index={0}
            />
            <KPICard
              title="Days at Market"
              value={competitorInsights?.atMarketDays || 0}
              icon={CheckCircle}
              accentColor="sage"
              index={1}
            />
            <KPICard
              title="Days Underpriced"
              value={competitorInsights?.underpricedDays || 0}
              icon={TrendingDown}
              accentColor="sage"
              index={2}
            />
            <KPICard
              title="Days Overpriced"
              value={competitorInsights?.overpricedDays || 0}
              icon={TrendingUp}
              accentColor="rose"
              index={3}
            />
            <KPICard
              title="Revenue Opportunity"
              value={`₹${(competitorInsights?.potentialRevenueLoss || 0).toLocaleString()}`}
              icon={AlertTriangle}
              accentColor="gold"
              index={4}
            />
          </>
        ) : null}
      </section>

      {/* Recommendations */}
      {competitorInsights?.recommendations && Array.isArray(competitorInsights.recommendations) && competitorInsights.recommendations.length > 0 && (
        <section className="p-3 sm:p-5 rounded-[10px] bg-gold-50 border border-gold-200">
          <div className="flex items-start gap-3 sm:gap-4">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center flex-shrink-0 bg-gold-100">
              <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-gold-600" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-xs sm:text-sm font-semibold text-gold-800 mb-2">
                Rate Strategy Recommendations
              </h3>
              <ul className="space-y-2">
                {competitorInsights.recommendations.map((rec: string, index: number) => (
                  <li key={index} className="text-[11px] sm:text-[13px] flex items-start gap-2 text-gold-700">
                    <span className="w-1.5 h-1.5 rounded-full bg-gold-500 mt-1.5 flex-shrink-0" />
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      )}

      {/* Main Rate Table */}
      {hasError ? (
        <section>
          <ErrorState />
        </section>
      ) : (
        <section>
          <CompetitorRateTable dateRange={dateRange} />
        </section>
      )}

      {/* Competitors table - always visible */}
      <section className="rounded-[10px] bg-white overflow-hidden">
        <div className="px-4 sm:px-6 py-4 sm:py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-100">
          <div>
            <h3 className="text-xs sm:text-sm font-semibold text-neutral-800">Competitors</h3>
            <p className="text-[10px] sm:text-[11px] text-neutral-400 font-medium mt-0.5">
              {hasCompetitorData ? `Compare rates across ${competitorsList.length} competitor hotels` : 'Add competitor hotels to track their rates'}
            </p>
          </div>
          <Button
            onClick={() => { setEditingCompetitor(null); setIsCompetitorModalOpen(true); }}
            icon={Building2}
            variant="outline"
            size="sm"
          >
            Add Competitor
          </Button>
        </div>
        {!hasCompetitorData ? (
          <div className="px-4 sm:px-6 py-8 sm:py-12 text-center">
            <div className="w-12 h-12 sm:w-14 sm:h-14 mx-auto rounded-lg flex items-center justify-center mb-3 bg-terra-50">
              <Users className="w-6 h-6 sm:w-7 sm:h-7 text-terra-500" />
            </div>
            <h3 className="text-sm sm:text-[15px] font-semibold text-neutral-900 mb-1">No competitors yet</h3>
            <p className="text-xs sm:text-[13px] text-neutral-500 mb-4">Add competitor hotels to start tracking their rates and market positioning.</p>
          <Button onClick={() => { setEditingCompetitor(null); setIsCompetitorModalOpen(true); }} icon={Building2} variant="primary" size="sm">
            Add Competitor
          </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[500px]">
              <thead>
                <tr className="border-b border-neutral-100 bg-neutral-50/50">
                  <th className="text-left px-4 sm:px-6 py-3 text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-neutral-500">Hotel</th>
                  <th className="text-left px-4 sm:px-6 py-3 text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-neutral-500">Rating</th>
                  <th className="text-left px-4 sm:px-6 py-3 text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-neutral-500">Distance</th>
                  <th className="text-right px-4 sm:px-6 py-3 text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-neutral-500">Today</th>
                  <th className="text-right px-4 sm:px-6 py-3 text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-neutral-500">7d Avg</th>
                  <th className="text-right px-4 sm:px-6 py-3 text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-neutral-500">30d Avg</th>
                  <th className="text-left px-4 sm:px-6 py-3 text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-neutral-500">Status</th>
                  <th className="text-right px-4 sm:px-6 py-3 text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-neutral-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {competitorsList.map((comp) => (
                  <tr
                    key={comp.id}
                    className={`hover:bg-neutral-50/50 transition-opacity ${!comp.isActive ? 'opacity-60' : ''}`}
                  >
                    <td className="px-4 sm:px-6 py-3 text-xs sm:text-[13px] font-medium text-neutral-900">{comp.name}</td>
                    <td className="px-4 sm:px-6 py-3 text-xs sm:text-[13px] text-neutral-600">{comp.rating ?? '—'}</td>
                    <td className="px-4 sm:px-6 py-3 text-xs sm:text-[13px] text-neutral-600">{comp.distance ?? '—'}</td>
                        <td className="px-4 sm:px-6 py-3 text-xs sm:text-[13px] font-semibold text-neutral-900 text-right">
                          {(comp as any).todayRate != null && Number((comp as any).todayRate) > 0 ? `₹${Number((comp as any).todayRate).toLocaleString()}` : '—'}
                        </td>
                        <td className="px-4 sm:px-6 py-3 text-xs sm:text-[13px] text-neutral-600 text-right">
                          {(comp as any).avgRate7Day != null && Number((comp as any).avgRate7Day) > 0 ? `₹${Number((comp as any).avgRate7Day).toLocaleString()}` : '—'}
                        </td>
                        <td className="px-4 sm:px-6 py-3 text-xs sm:text-[13px] text-neutral-600 text-right">
                          {(comp as any).avgRate30Day != null && Number((comp as any).avgRate30Day) > 0 ? `₹${Number((comp as any).avgRate30Day).toLocaleString()}` : '—'}
                        </td>
                    <td className="px-4 sm:px-6 py-3">
                      <button
                        type="button"
                        onClick={() => handleToggleStatus(comp)}
                        disabled={togglingStatusId === comp.id}
                        title={comp.isActive ? 'Click to set Inactive' : 'Click to set Active'}
                        className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-terra-500/30 disabled:opacity-50 cursor-pointer ${comp.isActive ? 'bg-sage-50 text-sage-700 hover:bg-sage-100' : 'bg-neutral-100 text-neutral-500 hover:bg-neutral-200'}`}
                      >
                        {togglingStatusId === comp.id ? '…' : comp.isActive ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td className="px-4 sm:px-6 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => { setEditingCompetitor(comp); setIsCompetitorModalOpen(true); }}
                          className="p-1.5 rounded-lg text-neutral-400 hover:text-ocean-600 hover:bg-ocean-50 transition-colors"
                          title="Edit competitor"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteCompetitor(comp)}
                          disabled={deletingCompetitorId === comp.id}
                          className="p-1.5 rounded-lg text-neutral-400 hover:text-rose-600 hover:bg-rose-50 transition-colors disabled:opacity-50"
                          title="Delete competitor"
                        >
                          <Trash2 className={`w-3.5 h-3.5 ${deletingCompetitorId === comp.id ? 'animate-pulse' : ''}`} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Events table - always visible */}
      <section className="rounded-[10px] bg-white overflow-hidden">
        <div className="px-4 sm:px-6 py-4 sm:py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-100">
          <div>
            <h3 className="text-xs sm:text-sm font-semibold text-neutral-800">Events</h3>
            <p className="text-[10px] sm:text-[11px] text-neutral-400 font-medium mt-0.5">
              {events && events.length > 0 ? `${events.length} upcoming event(s)` : 'Add events that may affect demand (conferences, holidays, etc.)'}
            </p>
          </div>
          <Button
            onClick={() => { setEditingEvent(null); setIsEventModalOpen(true); }}
            icon={CalendarDays}
            variant="outline"
            size="sm"
          >
            Add Event
          </Button>
        </div>
        {(!events || events.length === 0) ? (
          <div className="px-4 sm:px-6 py-8 sm:py-12 text-center">
            <div className="w-12 h-12 sm:w-14 sm:h-14 mx-auto rounded-lg flex items-center justify-center mb-3 bg-gold-50">
              <CalendarDays className="w-6 h-6 sm:w-7 sm:h-7 text-gold-500" />
            </div>
            <h3 className="text-sm sm:text-[15px] font-semibold text-neutral-900 mb-1">No events yet</h3>
            <p className="text-xs sm:text-[13px] text-neutral-500 mb-4">Add events like conferences or holidays to improve demand forecasts.</p>
            <Button onClick={() => { setEditingEvent(null); setIsEventModalOpen(true); }} icon={CalendarDays} variant="primary" size="sm">
              Add Event
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[400px]">
              <thead>
                <tr className="border-b border-neutral-100 bg-neutral-50/50">
                  <th className="text-left px-4 sm:px-6 py-3 text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-neutral-500">Event</th>
                  <th className="text-left px-4 sm:px-6 py-3 text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-neutral-500">Date range</th>
                  <th className="text-left px-4 sm:px-6 py-3 text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-neutral-500">Type</th>
                  <th className="text-left px-4 sm:px-6 py-3 text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-neutral-500">Impact</th>
                  <th className="text-right px-4 sm:px-6 py-3 text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-neutral-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {events.map((evt: any) => (
                  <tr key={evt.id} className="hover:bg-neutral-50/50">
                    <td className="px-4 sm:px-6 py-3 text-xs sm:text-[13px] font-medium text-neutral-900">{evt.name || evt.event_name}</td>
                    <td className="px-4 sm:px-6 py-3 text-xs sm:text-[13px] text-neutral-600">
                      {evt.start_date || evt.startDate} → {evt.end_date || evt.endDate}
                    </td>
                    <td className="px-4 sm:px-6 py-3 text-xs sm:text-[13px] text-neutral-600 capitalize">{evt.event_type || '—'}</td>
                    <td className="px-4 sm:px-6 py-3">
                      <span className={`text-[10px] font-semibold px-2 py-1 rounded-full ${
                        (evt.impact_multiplier || 0) >= 1.4 || evt.expectedImpact === 'high'
                          ? 'bg-rose-50 text-rose-600'
                          : (evt.impact_multiplier || 0) >= 1.2 || evt.expectedImpact === 'medium'
                            ? 'bg-gold-50 text-gold-600'
                            : 'bg-neutral-100 text-neutral-600'
                      }`}>
                        {evt.expectedImpact || (evt.impact_multiplier >= 1.4 ? 'High' : evt.impact_multiplier >= 1.2 ? 'Medium' : 'Low')} Impact
                      </span>
                    </td>
                    <td className="px-4 sm:px-6 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => { setEditingEvent(evt); setIsEventModalOpen(true); }}
                          className="p-1.5 rounded-lg text-neutral-400 hover:text-ocean-600 hover:bg-ocean-50 transition-colors"
                          title="Edit event"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteEvent(evt.id)}
                          disabled={deletingEventId === evt.id}
                          className="p-1.5 rounded-lg text-neutral-400 hover:text-rose-600 hover:bg-rose-50 transition-colors disabled:opacity-50"
                          title="Delete event"
                        >
                          <Trash2 className={`w-3.5 h-3.5 ${deletingEventId === evt.id ? 'animate-pulse' : ''}`} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
      </main>

      {/* Event Modal */}
      <EventModal
        open={isEventModalOpen}
        onClose={() => { setIsEventModalOpen(false); setEditingEvent(null); }}
        onSuccess={() => {
          refreshEvents();
          setEditingEvent(null);
          success(editingEvent ? 'Event updated successfully' : 'Event added successfully');
        }}
        initialEvent={editingEvent}
      />
      {/* Competitor Modal */}
      <AddCompetitorModal
        open={isCompetitorModalOpen}
        onClose={() => { setIsCompetitorModalOpen(false); setEditingCompetitor(null); }}
        onSuccess={() => {
          refreshCompetitors();
          setEditingCompetitor(null);
          success(editingCompetitor ? 'Competitor updated successfully' : 'Competitor added successfully');
        }}
        initialCompetitor={editingCompetitor}
      />
      {/* Delete competitor confirmation - in-app modal instead of browser popup */}
      <ConfirmModal
        open={!!competitorToDelete}
        onClose={() => setCompetitorToDelete(null)}
        onConfirm={confirmDeleteCompetitor}
        title="Remove competitor?"
        description={competitorToDelete ? `Remove "${competitorToDelete.name}" from competitors? This cannot be undone.` : ''}
        confirmText={deletingCompetitorId === competitorToDelete?.id ? 'Removing...' : 'Remove'}
        cancelText="Cancel"
        variant="danger"
        loading={deletingCompetitorId === competitorToDelete?.id}
      />
    </div>
  );
};

export default CompetitorRates;
