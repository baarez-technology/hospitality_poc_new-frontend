/**
 * ChannelDashboard Page
 * Overview dashboard for Channel Manager - Glimmora Design System v5.0
 * Enhanced with consistent styling matching CMS section
 */

import { useState, useEffect, useCallback } from 'react';
import {
  Wifi, WifiOff, AlertTriangle, RefreshCw,
  DollarSign, Calendar, Star, Clock,
  CheckCircle, XCircle, ChevronRight, TrendingUp,
  ChevronUp, ChevronDown, Layers, Activity, Loader2,
  User, Mail, Phone, Building2
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '../../../components/ui2/Button';
import { useChannelManager } from '../../../context/ChannelManagerContext';
import { useChannelManagerSSEEvents } from '../../../hooks/useChannelManagerSSEEvents';
import { Drawer } from '../../../components/ui2/Drawer';
import { apiClient } from '../../../api/client';
import { getBookingSourceForOTA } from '../../../utils/channel-manager/otaSourceMapping';
import { useCurrency } from '../../../hooks/useCurrency';

export default function ChannelDashboard() {
  const [isInsightsExpanded, setIsInsightsExpanded] = useState(false);
  const [selectedOTA, setSelectedOTA] = useState(null);
  const [otaBookings, setOtaBookings] = useState([]);
  const [loadingBookings, setLoadingBookings] = useState(false);
  const {
    otas,
    syncLogs,
    isLoading: contextLoading,
    getChannelStats,
    triggerManualSync,
    syncingOTAs,
    getAIInsights,
    fetchChannelStats,
    fetchAIInsights,
    fetchSyncLogs,
    fetchOTAs,
  } = useChannelManager();

  const stats = getChannelStats();
  const insights = getAIInsights();
  const { symbol: currencySymbol } = useCurrency();

  const connectedOTAs = otas.filter(o => o.status === 'connected');
  const errorOTAs = otas.filter(o => o.status === 'error');

  // Recent activity - deduplicate logs
  const recentLogs = syncLogs.reduce((acc, log) => {
    const key = `${log.otaCode}-${log.message}`;
    if (!acc.seen.has(key)) {
      acc.seen.add(key);
      acc.logs.push(log);
    }
    return acc;
  }, { seen: new Set(), logs: [] }).logs.slice(0, 4);

  const formatTime = (isoString) => {
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  // Refetch data function for SSE
  const refetchData = useCallback(async () => {
    await Promise.all([
      fetchChannelStats(),
      fetchAIInsights(),
      fetchSyncLogs({ pageSize: 5 }),
      fetchOTAs(),
    ]);
  }, [fetchChannelStats, fetchAIInsights, fetchSyncLogs, fetchOTAs]);

  // Register SSE event handlers for real-time updates
  useChannelManagerSSEEvents({
    onRatesUpdated: refetchData,
    onAvailabilityUpdated: refetchData,
    onRestrictionsUpdated: refetchData,
    onSyncStatus: refetchData,
    refetchData,
  });

  const handleSyncAll = () => {
    triggerManualSync('ALL');
  };

  // KPI cards configuration
  const kpiCards = [
    {
      icon: Wifi,
      title: 'Connected OTAs',
      value: connectedOTAs.length,
      subtitle: errorOTAs.length > 0
        ? `${errorOTAs.length} with issues: ${errorOTAs.map(o => o.name).join(', ')}`
        : 'All channels healthy',
      badge: errorOTAs.length > 0 ? { text: 'Error', type: 'error' } : { text: 'Live', type: 'success' },
      accent: 'sage',
      errorOTAs: errorOTAs
    },
    {
      icon: DollarSign,
      title: 'OTA Revenue (MTD)',
      value: `${currencySymbol}${stats.totalRevenue.toLocaleString()}`,
      subtitle: `${stats.revenueGrowth} from last month`,
      accent: 'gold'
    },
    {
      icon: Calendar,
      title: 'OTA Bookings',
      value: stats.totalBookings,
      subtitle: `${stats.bookingsGrowth} this month`,
      accent: 'terra'
    },
    {
      icon: TrendingUp,
      title: 'Avg Conversion Rate',
      value: `${stats.avgConversionRate}%`,
      subtitle: `Avg commission: ${stats.avgCommission}%`,
      accent: 'sage'
    }
  ];

  const accentColors = {
    terra: { bg: 'bg-terra-50', icon: 'bg-terra-100 text-terra-600' },
    sage: { bg: 'bg-sage-50', icon: 'bg-sage-100 text-sage-600' },
    gold: { bg: 'bg-gold-50', icon: 'bg-gold-100 text-gold-700' }
  };

  if (contextLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#F9F7F7' }}>
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-terra-600 mx-auto mb-4" />
          <p className="text-neutral-600">Loading channel manager data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F9F7F7' }}>
      <div className="px-4 sm:px-6 lg:px-10 py-4 sm:py-6 space-y-4 sm:space-y-6">

        {/* Page Header */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-neutral-900">
              Channel Manager
            </h1>
            <p className="text-xs sm:text-[13px] text-neutral-500 mt-0.5 sm:mt-1">
              <span className="hidden sm:inline">Manage your OTA distribution channels</span>
              <span className="sm:hidden">Manage OTA channels</span>
            </p>
          </div>
          <Button
            variant="primary"
            icon={RefreshCw}
            onClick={handleSyncAll}
            disabled={syncingOTAs.length > 0}
            loading={syncingOTAs.length > 0}
            className="text-xs sm:text-sm"
          >
            <span className="hidden sm:inline">Sync All Channels</span>
            <span className="sm:hidden">Sync All</span>
          </Button>
        </header>

        {/* KPI Cards */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
          {kpiCards.map((kpi, index) => {
            const colors = accentColors[kpi.accent];
            return (
              <div key={index} className="rounded-[10px] bg-white p-4 sm:p-6">
                {/* Header with Icon */}
                <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                  <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center ${colors.icon}`}>
                    <kpi.icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </div>
                  <p className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-widest text-neutral-400 truncate">
                    {kpi.title}
                  </p>
                </div>

                {/* Value */}
                <p className="text-xl sm:text-[28px] font-semibold tracking-tight text-neutral-900 mb-1 sm:mb-2">
                  {kpi.value}
                </p>

                {/* Subtitle & Badge */}
                <div className="flex items-center justify-between gap-2">
                  <p className="text-[10px] sm:text-[11px] text-neutral-400 font-medium truncate">{kpi.subtitle}</p>
                  {kpi.badge && (
                    <span className={`inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-semibold flex-shrink-0 ${
                      kpi.badge.type === 'success' ? 'text-sage-600' :
                      kpi.badge.type === 'error' ? 'text-rose-600' : 'text-neutral-500'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        kpi.badge.type === 'success' ? 'bg-sage-500' :
                        kpi.badge.type === 'error' ? 'bg-rose-500' : 'bg-neutral-400'
                      }`} />
                      <span className="hidden sm:inline">{kpi.badge.text}</span>
                    </span>
        )}
      </div>
    </div>
  );
})}
        </section>

        {/* Error OTAs Alert Banner */}
        {errorOTAs.length > 0 && (
          <section className="rounded-[10px] bg-rose-50 border border-rose-200 p-4 sm:p-5">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-rose-100 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-rose-600" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-xs sm:text-sm font-semibold text-rose-800 mb-2">
                  {errorOTAs.length} OTA{errorOTAs.length > 1 ? 's' : ''} with Connection Errors
                </h3>
                <div className="space-y-2">
                  {errorOTAs.map((ota) => (
                    <div key={ota.id} className="flex items-center justify-between gap-3 p-2.5 sm:p-3 bg-white rounded-lg border border-rose-100">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div
                          className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center text-white font-bold text-[10px] sm:text-xs flex-shrink-0"
                          style={{ backgroundColor: ota.color || '#A57865' }}
                        >
                          {ota.name.substring(0, 2).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs sm:text-[13px] font-semibold text-neutral-900">{ota.name}</p>
                          <p className="text-[10px] sm:text-[11px] text-rose-600 truncate">
                            {ota.errorMessage || 'Connection error - please check credentials'}
                          </p>
                        </div>
                      </div>
                      <Link to="/admin/channel-manager/ota">
                        <Button variant="outline" size="sm" className="text-[10px] sm:text-xs flex-shrink-0">
                          Fix
                        </Button>
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* AI Insights */}
        {insights.length > 0 && (
          <section className="rounded-[10px] bg-white overflow-hidden">
            <button
              onClick={() => setIsInsightsExpanded(!isInsightsExpanded)}
              className="w-full px-4 sm:px-6 py-4 sm:py-5 flex items-center justify-between transition-colors hover:bg-neutral-50/50"
            >
              <div className="text-left">
                <div className="flex items-center gap-2">
                  <h3 className="text-xs sm:text-sm font-semibold text-neutral-800">
                    AI Channel Insights
                  </h3>
                  <span className="px-1.5 py-0.5 rounded text-[8px] sm:text-[9px] font-semibold uppercase tracking-wider bg-gold-100 text-gold-700">
                    Smart
                  </span>
                </div>
                <p className="text-[10px] sm:text-[11px] text-neutral-400 font-medium mt-0.5">
                  {insights.length} recommendation{insights.length !== 1 ? 's' : ''}
                </p>
              </div>
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center bg-neutral-50 hover:bg-neutral-100 transition-colors flex-shrink-0">
                {isInsightsExpanded ? (
                  <ChevronUp className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-neutral-400" />
                ) : (
                  <ChevronDown className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-neutral-400" />
                )}
              </div>
            </button>

            <div className={`transition-all duration-300 ease-out overflow-hidden ${
              isInsightsExpanded ? 'max-h-[400px] opacity-100' : 'max-h-0 opacity-0'
            }`}>
              <div className="px-4 sm:px-6 pb-4 sm:pb-6 pt-2 space-y-2 sm:space-y-3 border-t border-neutral-100">
                {insights.slice(0, 3).map((insight, index) => {
                  const typeColors = {
                    error: { bg: 'bg-rose-50/50', dot: 'bg-rose-500', text: 'text-rose-700' },
                    warning: { bg: 'bg-gold-50/50', dot: 'bg-gold-500', text: 'text-gold-700' },
                    info: { bg: 'bg-sage-50/50', dot: 'bg-sage-500', text: 'text-sage-700' },
                    success: { bg: 'bg-sage-50/50', dot: 'bg-sage-500', text: 'text-sage-700' }
                  };
                  const colors = typeColors[insight.type] || typeColors.info;

                  return (
                    <div key={index} className={`flex items-start gap-2 sm:gap-3 p-3 sm:p-4 rounded-lg ${colors.bg}`}>
                      <div className={`w-2 h-2 rounded-full ${colors.dot} mt-1 sm:mt-1.5 flex-shrink-0`} />
                      <div>
                        <p className={`text-xs sm:text-[13px] font-semibold ${colors.text}`}>{insight.title}</p>
                        <p className="text-[10px] sm:text-[11px] mt-0.5 text-neutral-500 font-medium">
                          {insight.message}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {/* OTA Performance Table */}
        <section className="rounded-[10px] bg-white overflow-hidden">
          <div className="px-4 sm:px-6 py-4 sm:py-5 flex items-center justify-between">
            <div>
              <h3 className="text-xs sm:text-sm font-semibold text-neutral-800">
                OTA Performance
              </h3>
              <p className="text-[10px] sm:text-[11px] text-neutral-400 font-medium mt-0.5">Channel analytics</p>
            </div>
            <Link to="/admin/channel-manager/ota">
              <Button variant="ghost" size="sm" className="text-xs sm:text-sm">
                <span className="hidden sm:inline">View All</span>
                <span className="sm:hidden">All</span>
                <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 ml-1" />
              </Button>
            </Link>
          </div>

          {/* BUG-001 FIX: Show both connected and error OTAs in performance table */}
          {connectedOTAs.length === 0 && errorOTAs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 sm:py-12">
              <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-lg mx-auto mb-4 sm:mb-5 flex items-center justify-center bg-neutral-50">
                <WifiOff className="w-6 h-6 sm:w-8 sm:h-8 text-neutral-300" />
              </div>
              <p className="text-xs sm:text-[13px] font-medium text-neutral-500">No OTAs connected yet</p>
              <Link
                to="/admin/channel-manager/ota"
                className="mt-3 text-xs sm:text-[13px] font-semibold text-terra-600 hover:text-terra-700"
              >
                Connect your first OTA →
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[500px]">
                <thead>
                  <tr className="border-b border-neutral-100">
                    <th className="text-left py-3 sm:py-4 px-4 sm:px-6 text-[9px] sm:text-[10px] font-semibold uppercase tracking-widest text-neutral-400">Channel</th>
                    <th className="text-right py-3 sm:py-4 px-4 sm:px-6 text-[9px] sm:text-[10px] font-semibold uppercase tracking-widest text-neutral-400">Bookings</th>
                    <th className="text-right py-3 sm:py-4 px-4 sm:px-6 text-[9px] sm:text-[10px] font-semibold uppercase tracking-widest text-neutral-400">Revenue</th>
                    <th className="text-right py-3 sm:py-4 px-4 sm:px-6 text-[9px] sm:text-[10px] font-semibold uppercase tracking-widest text-neutral-400 hidden sm:table-cell">Rating</th>
                    <th className="text-right py-3 sm:py-4 px-4 sm:px-6 text-[9px] sm:text-[10px] font-semibold uppercase tracking-widest text-neutral-400 hidden sm:table-cell">Last Sync</th>
                  </tr>
                </thead>
                <tbody>
                  {[...connectedOTAs, ...errorOTAs].slice(0, 7).map((ota) => (
                    <tr
                      key={ota.id}
                      className={`border-b border-neutral-50 last:border-b-0 hover:bg-neutral-50/50 transition-colors cursor-pointer ${
                        ota.status === 'error' ? 'bg-rose-50/40' : ''
                      }`}
                      onClick={async () => {
                        setSelectedOTA(ota);
                        setLoadingBookings(true);
                        try {
                          // Fetch bookings for this OTA using correct source mapping
                          const bookingSource = getBookingSourceForOTA(ota);
                          console.log(`[ChannelDashboard] Fetching bookings for OTA: ${ota.name} (code: ${ota.code}) with source: ${bookingSource}`);
                          const response = await apiClient.get('/api/v1/bookings', {
                            params: { source: bookingSource, limit: 50 }
                          });
                          setOtaBookings(response.data?.data?.items || response.data?.items || []);
                        } catch (error) {
                          console.error('Failed to fetch bookings:', error);
                          setOtaBookings([]);
                        } finally {
                          setLoadingBookings(false);
                        }
                      }}
                    >
                      <td className="py-3 sm:py-4 px-4 sm:px-6">
                        <div className="flex items-center gap-2 sm:gap-3">
                          <div className="relative">
                            <div
                              className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center text-white font-bold text-xs sm:text-sm"
                              style={{ backgroundColor: ota.color }}
                            >
                              {ota.name.substring(0, 2).toUpperCase()}
                            </div>
                            <span className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full border-2 border-white ${
                              ota.status === 'connected' ? 'bg-sage-500' : 'bg-rose-500'
                            }`} />
                          </div>
                          <div className="min-w-0">
                            <span className="text-xs sm:text-[13px] font-semibold text-neutral-800">{ota.name}</span>
                            {ota.status === 'error' && (
                              <div className="flex items-center gap-1 mt-0.5">
                                <AlertTriangle className="w-3 h-3 text-rose-500 flex-shrink-0" />
                                <span className="text-[9px] sm:text-[10px] text-rose-600 font-medium truncate">
                                  {ota.errorMessage || 'Connection error'}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-3 sm:py-4 px-4 sm:px-6 text-right text-xs sm:text-[13px] font-semibold text-neutral-800">
                        {ota.status === 'error' ? (
                          <span className="text-rose-500">—</span>
                        ) : (ota.stats?.totalBookings || 0)}
                      </td>
                      <td className="py-3 sm:py-4 px-4 sm:px-6 text-right">
                        {ota.status === 'error' ? (
                          <span className="text-xs sm:text-[13px] text-rose-500">—</span>
                        ) : (
                          <span className="text-xs sm:text-[13px] font-bold text-terra-600">
                            {currencySymbol}{(ota.stats?.revenue || 0).toLocaleString()}
                          </span>
                        )}
                      </td>
                      <td className="py-3 sm:py-4 px-4 sm:px-6 text-right hidden sm:table-cell">
                        {ota.status === 'error' ? (
                          <span className="px-2 py-0.5 text-[10px] font-semibold rounded bg-rose-100 text-rose-600">ERROR</span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[13px] font-semibold text-gold-600">
                            {ota.stats?.avgRating || 0}
                            <Star className="w-3.5 h-3.5 fill-current" />
                          </span>
                        )}
                      </td>
                      <td className="py-3 sm:py-4 px-4 sm:px-6 text-right text-[13px] text-neutral-500 hidden sm:table-cell">
                        {formatTime(ota.lastSync)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Analytics Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 lg:gap-6">
          {/* Revenue by Channel */}
          <section className="rounded-[10px] bg-white overflow-hidden">
            <div className="px-4 sm:px-6 py-4 sm:py-5 flex items-center justify-between">
              <div>
                <h3 className="text-xs sm:text-sm font-semibold text-neutral-800">
                  Revenue by Channel
                </h3>
                <p className="text-[10px] sm:text-[11px] text-neutral-400 font-medium mt-0.5">Distribution breakdown</p>
              </div>
              <Link to="/admin/channel-manager/ota">
                <Button variant="ghost" size="sm" className="text-xs sm:text-sm">
                  <span className="hidden sm:inline">View All</span>
                  <span className="sm:hidden">All</span>
                  <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 ml-1" />
                </Button>
              </Link>
            </div>

            <div className="p-4 sm:p-6">
              {stats.channelPerformance.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-6 sm:py-8">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center bg-neutral-50 mb-3">
                    <DollarSign className="w-5 h-5 sm:w-6 sm:h-6 text-neutral-300" />
                  </div>
                  <p className="text-xs sm:text-[13px] text-neutral-500">No channel data yet</p>
                </div>
              ) : (
                <div className="space-y-3 sm:space-y-4">
                  {stats.channelPerformance.slice(0, 5).map((channel) => {
                    const maxRevenue = Math.max(...stats.channelPerformance.map(c => c.revenue));
                    const percentage = maxRevenue > 0 ? (channel.revenue / maxRevenue) * 100 : 0;
                    return (
                      <div key={channel.code}>
                        <div className="flex items-center justify-between mb-1.5 sm:mb-2">
                          <div className="flex items-center gap-2">
                            <div
                              className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full"
                              style={{ backgroundColor: channel.color }}
                            />
                            <span className="text-xs sm:text-[13px] font-medium text-neutral-800">
                              {channel.name}
                            </span>
                          </div>
                          <span className="text-xs sm:text-[13px] font-bold text-terra-600">
                            {currencySymbol}{channel.revenue.toLocaleString()}
                          </span>
                        </div>
                        <div className="h-1.5 sm:h-2 rounded-full overflow-hidden bg-neutral-100">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{
                              width: `${percentage}%`,
                              backgroundColor: channel.color,
                              opacity: 0.8
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </section>

          {/* Recent Sync Activity */}
          <section className="rounded-[10px] bg-white overflow-hidden">
            <div className="px-4 sm:px-6 py-4 sm:py-5 flex items-center justify-between">
              <div>
                <h3 className="text-xs sm:text-sm font-semibold text-neutral-800">
                  Recent Sync Activity
                </h3>
                <p className="text-[10px] sm:text-[11px] text-neutral-400 font-medium mt-0.5">Latest synchronizations</p>
              </div>
              <Link to="/admin/channel-manager/logs">
                <Button variant="ghost" size="sm" className="text-xs sm:text-sm">
                  <span className="hidden sm:inline">View All</span>
                  <span className="sm:hidden">All</span>
                  <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 ml-1" />
                </Button>
              </Link>
            </div>

            <div className="p-4 sm:p-6">
              {recentLogs.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-6 sm:py-8">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center bg-neutral-50 mb-3">
                    <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-neutral-300" />
                  </div>
                  <p className="text-xs sm:text-[13px] text-neutral-500">No sync activity yet</p>
                </div>
              ) : (
                <div className="space-y-2 sm:space-y-3">
                  {recentLogs.map((log) => (
                    <div
                      key={log.id}
                      className="flex items-center justify-between p-2.5 sm:p-3 rounded-lg bg-neutral-50"
                    >
                      <div className="flex items-center gap-2 sm:gap-3">
                        <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                          log.status === 'success' ? 'bg-sage-100' :
                          log.status === 'error' ? 'bg-rose-100' : 'bg-gold-100'
                        }`}>
                          {log.status === 'success' ? (
                            <CheckCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-sage-600" />
                          ) : log.status === 'error' ? (
                            <XCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-rose-600" />
                          ) : (
                            <AlertTriangle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gold-600" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs sm:text-[13px] font-medium text-neutral-800 truncate">{log.otaName}</p>
                          <p className="text-[10px] sm:text-[11px] text-neutral-500 truncate">{log.message}</p>
                        </div>
                      </div>
                      <span className="text-[10px] sm:text-[11px] text-neutral-400 flex-shrink-0 ml-2">{formatTime(log.timestamp)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        </div>

      </div>

      {/* OTA Performance Details Drawer - BUG-008 FIX: Moved outside KPI cards grid */}
      <Drawer
        isOpen={!!selectedOTA}
        onClose={() => {
          setSelectedOTA(null);
          setOtaBookings([]);
        }}
        title={selectedOTA ? `${selectedOTA.name} Performance Details` : ''}
        subtitle={`${selectedOTA?.stats?.totalBookings || 0} bookings • ${currencySymbol}${(selectedOTA?.stats?.revenue || 0).toLocaleString()} revenue`}
        maxWidth="max-w-3xl"
      >
        {loadingBookings ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-terra-600" />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Stats Summary */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-4 rounded-lg bg-neutral-50">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-neutral-400 mb-1">Total Bookings</p>
                <p className="text-2xl font-bold text-terra-600">{selectedOTA?.stats?.totalBookings || 0}</p>
              </div>
              <div className="p-4 rounded-lg bg-neutral-50">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-neutral-400 mb-1">Revenue</p>
                <p className="text-2xl font-bold text-sage-600">{currencySymbol}{(selectedOTA?.stats?.revenue || 0).toLocaleString()}</p>
              </div>
              <div className="p-4 rounded-lg bg-neutral-50">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-neutral-400 mb-1">Avg Rating</p>
                <p className="text-2xl font-bold text-gold-600 flex items-center gap-1">
                  {selectedOTA?.stats?.avgRating || 0}
                  <Star className="w-5 h-5 fill-current" />
                </p>
              </div>
              <div className="p-4 rounded-lg bg-neutral-50">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-neutral-400 mb-1">Commission</p>
                <p className="text-2xl font-bold text-neutral-700">{selectedOTA?.stats?.commission || 0}%</p>
              </div>
            </div>

            {/* Bookings List */}
            <div>
              <h4 className="text-[11px] font-semibold uppercase tracking-widest text-neutral-900 mb-4">
                Recent Bookings ({otaBookings.length})
              </h4>
              {otaBookings.length === 0 ? (
                <div className="text-center py-8">
                  <Building2 className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
                  <p className="text-[13px] font-medium text-neutral-600 mb-1">No bookings found</p>
                  <p className="text-[11px] text-neutral-400">Bookings from this channel will appear here</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {otaBookings.slice(0, 20).map((booking) => (
                    <div key={booking.id} className="p-4 border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <p className="text-[13px] font-semibold text-neutral-900 mb-1">
                            {booking.guest || booking.guestName || 'Guest'}
                          </p>
                          <p className="text-[11px] text-neutral-500 font-mono">{booking.id || booking.bookingNumber}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[13px] font-bold text-terra-600">{currencySymbol}{(booking.totalPrice || booking.amount || booking.total || 0).toLocaleString()}</p>
                          <p className="text-[10px] text-neutral-400 mt-0.5">
                            {booking.checkIn ? new Date(booking.checkIn).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—'} - {booking.checkOut ? new Date(booking.checkOut).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-[11px] text-neutral-500">
                        {booking.email && (
                          <div className="flex items-center gap-1.5">
                            <Mail className="w-3 h-3" />
                            <span className="truncate max-w-[200px]">{booking.email}</span>
                          </div>
                        )}
                        {booking.phone && (
                          <div className="flex items-center gap-1.5">
                            <Phone className="w-3 h-3" />
                            <span>{booking.phone}</span>
                          </div>
                        )}
                        {booking.roomType && (
                          <div className="flex items-center gap-1.5">
                            <Building2 className="w-3 h-3" />
                            <span>{booking.roomType}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
}
