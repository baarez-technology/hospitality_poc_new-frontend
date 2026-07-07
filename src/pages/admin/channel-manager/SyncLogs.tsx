/**
 * SyncLogs Page
 * View and filter sync activity logs - Glimmora Design System v5.0
 * Redesigned to match CBS BookingList UI patterns
 */

import { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useSearchParams } from 'react-router-dom';
import {
  Download, RefreshCw, CheckCircle, XCircle, AlertTriangle,
  Calendar, Activity, Eye, ChevronDown, Check,
  ChevronLeft, ChevronRight, Loader2, FileText, FileSpreadsheet, X, Clock
} from 'lucide-react';
import { useChannelManager } from '../../../context/ChannelManagerContext';
import { useChannelManagerSSEEvents } from '../../../hooks/useChannelManagerSSEEvents';
import { channelManagerService } from '../../../api/services/channel-manager.service';
import { actionTypes } from '../../../data/channel-manager/sampleSyncLogs';
import { Button, IconButton } from '../../../components/ui2/Button';
import { SearchBar } from '../../../components/ui2/SearchBar';
import SyncLogDetailDrawer from '../../../components/channel-manager/SyncLogDetailDrawer';
import { DropdownMenu, DropdownMenuItem } from '../../../components/ui2/DropdownMenu';
import { useToast } from '../../../contexts/ToastContext';

// Custom Select Dropdown Component - Glimmora Design System v5.0
function SelectDropdown({ value, onChange, options, placeholder = 'Select...', className = '' }) {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState(null);
  const triggerRef = useRef(null);
  const menuRef = useRef(null);

  const selectedOption = options.find(opt => opt.value === value);

  const calculatePosition = () => {
    if (!triggerRef.current) return null;
    const rect = triggerRef.current.getBoundingClientRect();
    return {
      top: rect.bottom + 4,
      left: rect.left,
      width: rect.width
    };
  };

  const handleToggle = () => {
    if (isOpen) {
      setIsOpen(false);
      setPosition(null);
    } else {
      setPosition(calculatePosition());
      setIsOpen(true);
    }
  };

  const handleSelect = (optionValue) => {
    onChange(optionValue);
    setIsOpen(false);
    setPosition(null);
  };

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e) => {
      if (!triggerRef.current?.contains(e.target) && !menuRef.current?.contains(e.target)) {
        setIsOpen(false);
        setPosition(null);
      }
    };

    const handleEsc = (e) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
        setPosition(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEsc);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEsc);
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const updatePosition = () => {
      setPosition(calculatePosition());
    };

    window.addEventListener('scroll', updatePosition, true);
    window.addEventListener('resize', updatePosition);
    return () => {
      window.removeEventListener('scroll', updatePosition, true);
      window.removeEventListener('resize', updatePosition);
    };
  }, [isOpen]);

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={handleToggle}
        className={`h-9 sm:h-10 px-3 sm:px-3.5 rounded-lg text-xs sm:text-[13px] bg-white border text-left flex items-center justify-between gap-2 transition-all ${
          isOpen
            ? 'border-terra-400 ring-2 ring-terra-500/10'
            : 'border-neutral-200 hover:border-neutral-300'
        } ${className}`}
      >
        <span className={`truncate ${selectedOption ? 'text-neutral-700' : 'text-neutral-400'}`}>
          {selectedOption?.label || placeholder}
        </span>
        <ChevronDown className={`w-3.5 h-3.5 sm:w-4 sm:h-4 text-neutral-400 transition-transform flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && position && createPortal(
        <div
          ref={menuRef}
          style={{
            position: 'fixed',
            top: `${position.top}px`,
            left: `${position.left}px`,
            width: `${position.width}px`,
            zIndex: 9999
          }}
          className="bg-white rounded-lg border border-neutral-200 shadow-lg shadow-neutral-900/10 overflow-hidden animate-in fade-in-0 zoom-in-95 duration-100"
        >
          <div className="py-1 max-h-60 overflow-y-auto">
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => handleSelect(option.value)}
                className={`w-full px-3 py-2 sm:py-2.5 text-left text-xs sm:text-[13px] flex items-center justify-between transition-colors ${
                  value === option.value
                    ? 'bg-terra-50 text-terra-700 font-medium'
                    : 'text-neutral-700 hover:bg-neutral-50'
                }`}
              >
                <span className="truncate">{option.label}</span>
                {value === option.value && <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-terra-500 flex-shrink-0" />}
              </button>
            ))}
          </div>
        </div>,
        document.body
      )}
    </>
  );
}

// Icons for action types
const actionIcons = {
  rate_update: () => <span className="text-xs">₹</span>,
  availability_update: () => <Calendar className="w-3.5 h-3.5" />,
  restriction_update: () => <span className="text-xs">⊘</span>,
  promotion_sync: () => <span className="text-xs">🎁</span>,
  booking_import: () => <Download className="w-3.5 h-3.5" />,
  connection: () => <span className="text-xs">📶</span>,
  bulk_sync: () => <RefreshCw className="w-3.5 h-3.5" />
};

const ITEMS_PER_PAGE = 10;

export default function SyncLogs() {
  const [searchParams, setSearchParams] = useSearchParams();
  const {
    syncLogs,
    otas,
    isLoading: contextLoading,
    triggerManualSync,
    syncingOTAs,
    fetchSyncLogs,
    clearLogs,
  } = useChannelManager();

  // Get initial OTA filter from URL parameter
  const urlOtaParam = searchParams.get('ota');

  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [selectedLog, setSelectedLog] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [exportLoading, setExportLoading] = useState(false);

  // Cached stats that persist across tab changes
  const [cachedStats, setCachedStats] = useState({
    total: 0,
    success: 0,
    error: 0,
    warning: 0,
    pending: 0
  });

  // Filter states - single select dropdowns (initialize from URL if present)
  const [otaFilter, setOTAFilter] = useState(urlOtaParam || 'all');
  const [actionFilter, setActionFilter] = useState('all');
  // Date range filters (YYYY-MM-DD) - same param names as backend (dateFrom, dateTo)
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const toast = useToast();

  const connectedOTAs = otas.filter(o => o.status === 'connected');

  // Update URL when otaFilter changes (but only if it's not from URL initially)
  useEffect(() => {
    if (otaFilter !== 'all') {
      setSearchParams({ ota: otaFilter }, { replace: true });
    } else {
      setSearchParams({}, { replace: true });
    }
  }, [otaFilter, setSearchParams]);

  // Fetch stats counts for all statuses (independent of current tab filter)
  const fetchStats = useCallback(async () => {
    try {
      const baseFilters: any = { page: 1, pageSize: 1 }; // Only need counts, not data
      if (otaFilter !== 'all') baseFilters.otaCode = otaFilter;
      if (actionFilter !== 'all') baseFilters.action = actionFilter;
      if (dateFrom) baseFilters.dateFrom = dateFrom;
      if (dateTo) baseFilters.dateTo = dateTo;

      // Fetch counts for each status in parallel
      const [allRes, successRes, errorRes, warningRes, pendingRes] = await Promise.all([
        fetchSyncLogs({ ...baseFilters, page: 1 }),
        fetchSyncLogs({ ...baseFilters, page: 1, status: 'success' }),
        fetchSyncLogs({ ...baseFilters, page: 1, status: 'error' }),
        fetchSyncLogs({ ...baseFilters, page: 1, status: 'warning' }),
        fetchSyncLogs({ ...baseFilters, page: 1, status: 'pending' }),
      ]);

      setCachedStats({
        total: allRes.total || 0,
        success: successRes.total || 0,
        error: errorRes.total || 0,
        warning: warningRes.total || 0,
        pending: pendingRes.total || 0,
      });
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  }, [otaFilter, actionFilter, dateFrom, dateTo, fetchSyncLogs]);

  // Refetch data function for SSE (backend expects camelCase: pageSize, action, status, dateFrom, dateTo)
  const refetchData = useCallback(async () => {
    const filters: any = {
      page: currentPage,
      pageSize: ITEMS_PER_PAGE,
    };
    if (activeTab !== 'all') {
      filters.status = activeTab;
    }
    if (otaFilter !== 'all') {
      filters.otaCode = otaFilter;
    }
    if (actionFilter !== 'all') {
      filters.action = actionFilter;
    }
    if (dateFrom) filters.dateFrom = dateFrom;
    if (dateTo) filters.dateTo = dateTo;
    const response = await fetchSyncLogs(filters);
    setTotalPages(response.totalPages || 1);
    setTotalCount(response.total || 0);

    // Update the current tab's count in cachedStats
    if (activeTab === 'all') {
      setCachedStats(prev => ({ ...prev, total: response.total || 0 }));
    } else {
      setCachedStats(prev => ({ ...prev, [activeTab]: response.total || 0 }));
    }
  }, [currentPage, activeTab, otaFilter, actionFilter, dateFrom, dateTo, fetchSyncLogs]);

  // Register SSE event handlers for real-time updates
  useChannelManagerSSEEvents({
    onSyncStatus: () => {
      refetchData();
      fetchStats();
    },
    refetchData,
  });

  // Fetch logs when filters change
  useEffect(() => {
    refetchData();
  }, [refetchData]);

  // Fetch stats on mount and when OTA/action filters change (not on tab change)
  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // Get the filtered OTA name for display
  const filteredOTAName = useMemo(() => {
    if (otaFilter === 'all') return null;
    const ota = otas.find(o => o.code === otaFilter);
    return ota?.name || otaFilter;
  }, [otaFilter, otas]);

  // Clear OTA filter and URL param
  const clearOTAFilter = () => {
    setOTAFilter('all');
    setSearchParams({});
    setCurrentPage(1);
  };

  // Check if any filters are active
  const hasActiveFilters = otaFilter !== 'all' || actionFilter !== 'all' || !!dateFrom || !!dateTo;

  // Clear all filters
  const clearFilters = () => {
    setOTAFilter('all');
    setActionFilter('all');
    setDateFrom('');
    setDateTo('');
    setSearchParams({});
    setCurrentPage(1);
  };

  // Filter logs (client-side filtering for search only, pagination handled by API)
  const filteredLogs = useMemo(() => {
    if (!searchQuery) return syncLogs;
    const searchLower = searchQuery.toLowerCase();
    return syncLogs.filter(log => {
      // Get action label for search
      const actionConfig = actionTypes[log.action] || { label: log.action };
      const actionLabel = actionConfig.label?.toLowerCase() || '';
      
      // Search across message, OTA name, and action label
      const matchesSearch = 
        log.message?.toLowerCase().includes(searchLower) ||
        log.otaName?.toLowerCase().includes(searchLower) ||
        actionLabel.includes(searchLower) ||
        log.action?.toLowerCase().includes(searchLower);
      
      return matchesSearch;
    });
  }, [syncLogs, searchQuery]);

  // Paginated logs (already paginated by API, but apply search filter)
  const paginatedLogs = filteredLogs;

  // Use cached stats (fetched independently of tab filter)
  const stats = cachedStats;

  const handleRefresh = () => {
    if (syncingOTAs.length > 0) return; // Prevent multiple clicks
    triggerManualSync('ALL');
  };

  // Client-side CSV export fallback (includes Date to match backend export)
  const generateClientSideCSV = (logs: typeof syncLogs) => {
    const headers = ['Date', 'Timestamp', 'Channel', 'Channel Code', 'Action', 'Status', 'Message'];
    const rows = logs.map(log => {
      const otaInfo = getOTAInfo(log.otaCode);
      const actionConfig = actionTypes[log.action] || { label: log.action };
      const dateStr = log?.date || (log?.timestamp ? new Date(log.timestamp).toISOString().split('T')[0] : '');
      return [
        dateStr,
        log.timestamp ? new Date(log.timestamp).toISOString() : '',
        otaInfo.name,
        log.otaCode,
        actionConfig.label,
        log.status,
        `"${(log.message || '').replace(/"/g, '""')}"`
      ].join(',');
    });
    return [headers.join(','), ...rows].join('\n');
  };

  const handleExport = async (format: 'csv' | 'excel' | 'pdf' = 'csv') => {
    if (exportLoading) return; // Prevent multiple clicks

    setExportLoading(true);
    try {
      // Same filter param names as list API so exported file matches filtered list
      const filters: any = { format };
      if (activeTab !== 'all') filters.status = activeTab;
      if (otaFilter !== 'all') filters.otaCode = otaFilter;
      if (actionFilter !== 'all') filters.action = actionFilter;
      if (dateFrom) filters.dateFrom = dateFrom;
      if (dateTo) filters.dateTo = dateTo;

      let blob: Blob;
      let useClientSide = false;

      try {
        blob = await channelManagerService.exportSyncLogs(filters);

        // Validate blob response
        if (!blob || blob.size === 0) {
          throw new Error('Empty response');
        }
      } catch (apiError) {
        // Fallback to client-side CSV export if API fails
        console.warn('API export failed, using client-side fallback:', apiError);
        useClientSide = true;

        if (format !== 'csv') {
          toast.warning(`${format.toUpperCase()} export requires server. Exporting as CSV instead.`);
        }

        const csvContent = generateClientSideCSV(filteredLogs);
        blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      }

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;

      // Set appropriate file extension based on format (use csv for client-side fallback)
      const extension = useClientSide ? 'csv' : (format === 'pdf' ? 'pdf' : format === 'excel' ? 'xlsx' : 'csv');

      a.download = `sync-logs-${new Date().toISOString().split('T')[0]}.${extension}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success(`Sync logs exported successfully as ${extension.toUpperCase()}`);
    } catch (err: any) {
      console.error('Error exporting logs:', err);
      const errorMessage = err?.response?.data?.message || err?.message || 'Failed to export sync logs. Please try again.';
      toast.error(errorMessage);
    } finally {
      setExportLoading(false);
    }
  };

  // Tab configuration matching BookingList style
  const tabs = [
    { id: 'all', label: 'All Logs', icon: Calendar, count: stats.total },
    { id: 'pending', label: 'Pending', icon: Clock, count: stats.pending },
    { id: 'success', label: 'Success', icon: CheckCircle, count: stats.success },
    { id: 'error', label: 'Errors', icon: XCircle, count: stats.error },
    { id: 'warning', label: 'Warnings', icon: AlertTriangle, count: stats.warning }
  ];

  // Helper functions
  const formatTime = (isoString) => {
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  /** Display date from backend date (YYYY-MM-DD) or derived from timestamp */
  const formatLogDate = (log) => {
    if (log?.date) return log.date;
    if (log?.timestamp) return new Date(log.timestamp).toISOString().split('T')[0];
    return '—';
  };

  /** Full date/time for tooltip/secondary display */
  const formatLogDateTime = (log) => {
    if (!log?.timestamp) return '—';
    const d = new Date(log.timestamp);
    return d.toLocaleString('en-US', { dateStyle: 'short', timeStyle: 'short' });
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success': return CheckCircle;
      case 'error': return XCircle;
      case 'warning': return AlertTriangle;
      case 'pending': return Clock;
      default: return Calendar;
    }
  };

  const getStatusBadgeClasses = (status) => {
    const colorMap = {
      success: 'bg-sage-50 text-sage-600',
      error: 'bg-rose-50 text-rose-600',
      warning: 'bg-gold-50 text-gold-600',
      pending: 'bg-neutral-100 text-neutral-600',
    };
    return colorMap[status] || 'bg-neutral-100 text-neutral-600';
  };

  const getOTAInfo = (otaCode) => {
    if (otaCode === 'ALL') {
      return { name: 'All OTAs', color: '#A57865' };
    }
    const ota = otas.find(o => o.code === otaCode);
    return ota || { name: otaCode, color: '#6B7280' };
  };

  // Filter options for dropdowns
  const channelOptions = [
    { value: 'all', label: 'All Channels' },
    ...connectedOTAs.map(ota => ({ value: ota.code, label: ota.name }))
  ];

  const actionOptions = [
    { value: 'all', label: 'All Action Types' },
    ...Object.entries(actionTypes).map(([key, config]) => ({ value: key, label: config.label }))
  ];

  if (contextLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#F9F7F7' }}>
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-terra-600 mx-auto mb-4" />
          <p className="text-neutral-600">Loading sync logs...</p>
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
            <div className="flex items-baseline gap-2 sm:gap-3 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-neutral-900">
                Sync Logs
              </h1>
              {filteredOTAName && (
                <span className="inline-flex items-center gap-1.5 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-md text-[11px] sm:text-xs font-semibold bg-terra-50 text-terra-700 border border-terra-200 translate-y-[-1px]">
                  {filteredOTAName}
                  <button
                    onClick={clearOTAFilter}
                    className="p-0.5 hover:bg-terra-100 rounded transition-colors -mr-0.5"
                    title="Clear filter"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
            </div>
            <p className="text-xs sm:text-[13px] text-neutral-500 mt-0.5 sm:mt-1">
              {filteredOTAName ? (
                <>
                  <span className="hidden sm:inline">Showing sync activity for {filteredOTAName}</span>
                  <span className="sm:hidden">{filteredOTAName} sync activity</span>
                </>
              ) : (
                <>
                  <span className="hidden sm:inline">Monitor channel synchronization activity</span>
                  <span className="sm:hidden">Channel sync activity</span>
                </>
              )}
            </p>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            {exportLoading ? (
              <Button
                variant="outline"
                icon={Download}
                disabled
                loading
                className="text-xs sm:text-sm pointer-events-none"
              >
                <span className="hidden sm:inline">Exporting...</span>
                <span className="sm:hidden">...</span>
              </Button>
            ) : (
              <DropdownMenu
                trigger={
                  <Button
                    variant="outline"
                    icon={Download}
                    className="text-xs sm:text-sm"
                  >
                    <span className="hidden sm:inline">Export</span>
                    <span className="sm:hidden">Export</span>
                  </Button>
                }
                align="end"
              >
                <DropdownMenuItem
                  icon={FileText}
                  onSelect={() => handleExport('pdf')}
                >
                  Export as PDF
                </DropdownMenuItem>
                <DropdownMenuItem
                  icon={FileSpreadsheet}
                  onSelect={() => handleExport('excel')}
                >
                  Export as Excel
                </DropdownMenuItem>
                <DropdownMenuItem
                  icon={Download}
                  onSelect={() => handleExport('csv')}
                >
                  Export as CSV
                </DropdownMenuItem>
              </DropdownMenu>
            )}
            <Button
              variant="primary"
              icon={RefreshCw}
              onClick={handleRefresh}
              disabled={syncingOTAs.length > 0}
              loading={syncingOTAs.length > 0}
              className="text-xs sm:text-sm"
            >
              <span className="hidden sm:inline">Sync Now</span>
              <span className="sm:hidden">Sync</span>
            </Button>
          </div>
        </header>

        {/* Main Content Container - Matching BookingList structure */}
        <div className="bg-white rounded-[10px] overflow-hidden">
          {/* Header Section */}
          <div className="border-b border-neutral-100">
            {/* Tab Navigation - Underline style matching BookingList */}
            <div className="px-3 sm:px-6 pt-3 sm:pt-4 flex items-center justify-between overflow-x-auto">
              <div className="flex items-center gap-0.5">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => { setActiveTab(tab.id); setCurrentPage(1); }}
                    className={`relative px-2.5 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-[13px] font-semibold transition-all duration-150 whitespace-nowrap ${
                      activeTab === tab.id
                        ? 'text-neutral-900'
                        : 'text-neutral-500 hover:text-neutral-700'
                    }`}
                  >
                    <span className="flex items-center gap-1.5 sm:gap-2">
                      <tab.icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      <span className="hidden sm:inline">{tab.label}</span>
                      <span className="sm:hidden">{tab.id === 'all' ? 'All' : tab.label.substring(0, 4)}</span>
                      <span className={`px-1 sm:px-1.5 py-0.5 rounded text-[9px] sm:text-[11px] font-semibold tabular-nums ${
                        activeTab === tab.id
                          ? 'bg-terra-500 text-white'
                          : 'bg-neutral-100 text-neutral-500'
                      }`}>
                        {tab.count}
                      </span>
                    </span>
                    {/* Active indicator */}
                    {activeTab === tab.id && (
                      <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-terra-500 rounded-t-full" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Search & Filters Bar */}
          <div className="px-3 sm:px-6 py-3 sm:py-4 bg-neutral-50/30 border-b border-neutral-100">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
              {/* Search */}
              <div className="flex-1 sm:max-w-md">
                <SearchBar
                  value={searchQuery}
                  onChange={(val) => { setSearchQuery(val); setCurrentPage(1); }}
                  onClear={() => setSearchQuery('')}
                  placeholder="Search logs..."
                  size="md"
                />
              </div>

              {/* Spacer to push filters to right - hidden on mobile */}
              <div className="hidden sm:block flex-1" />

              {/* Filter Dropdowns and date range - row on all sizes */}
              <div className="flex flex-wrap items-center gap-2">
                {/* Channel Filter Dropdown */}
                <SelectDropdown
                  value={otaFilter}
                  onChange={(val) => {
                    setOTAFilter(val);
                    setCurrentPage(1);
                    if (val === 'all') setSearchParams({});
                    else setSearchParams({ ota: val });
                  }}
                  options={channelOptions}
                  placeholder="Channels"
                  className="flex-1 sm:flex-none sm:min-w-[140px] lg:min-w-[160px]"
                />

                {/* Action Type Filter Dropdown - values: rate_update | availability_update | ... */}
                <SelectDropdown
                  value={actionFilter}
                  onChange={(val) => { setActionFilter(val); setCurrentPage(1); }}
                  options={actionOptions}
                  placeholder="Actions"
                  className="flex-1 sm:flex-none sm:min-w-[140px] lg:min-w-[180px]"
                />

                {/* Date range (YYYY-MM-DD) - backend params dateFrom, dateTo */}
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => { setDateFrom(e.target.value); setCurrentPage(1); }}
                  className="h-9 sm:h-10 px-3 rounded-lg text-xs sm:text-[13px] bg-white border border-neutral-200 hover:border-neutral-300 min-w-0 sm:min-w-[120px]"
                  title="From date"
                />
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => { setDateTo(e.target.value); setCurrentPage(1); }}
                  className="h-9 sm:h-10 px-3 rounded-lg text-xs sm:text-[13px] bg-white border border-neutral-200 hover:border-neutral-300 min-w-0 sm:min-w-[120px]"
                  title="To date"
                />
              </div>
            </div>
          </div>

          {/* Table */}
          {filteredLogs.length === 0 ? (
            <div className="px-4 sm:px-6 py-8 sm:py-16 text-center">
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-terra-50 flex items-center justify-center mb-3 sm:mb-4">
                  <Activity className="w-4 h-4 sm:w-5 sm:h-5 text-terra-500" />
                </div>
                <p className="text-xs sm:text-[13px] font-semibold text-neutral-800 mb-1">
                  No sync logs found
                </p>
                <p className="text-[10px] sm:text-[11px] text-neutral-500 font-medium">
                  <span className="hidden sm:inline">Sync activity will appear here when OTAs are connected and syncing</span>
                  <span className="sm:hidden">Sync activity will appear when OTAs are syncing</span>
                </p>
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="mt-3 sm:mt-4 px-3 py-1.5 text-[11px] sm:text-[12px] font-semibold text-terra-600 hover:text-terra-700 hover:bg-terra-50 rounded-lg transition-colors"
                  >
                    Clear all filters
                  </button>
                )}
              </div>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-neutral-50/30 border-b border-neutral-100">
                      <th className="text-left px-3 sm:px-4 py-3 sm:py-4 text-[9px] sm:text-[10px] font-semibold text-neutral-400 uppercase tracking-widest whitespace-nowrap">
                        Date
                      </th>
                      <th className="text-left px-3 sm:px-4 py-3 sm:py-4 text-[9px] sm:text-[10px] font-semibold text-neutral-400 uppercase tracking-widest whitespace-nowrap">
                        Time
                      </th>
                      <th className="text-left px-3 sm:px-4 py-3 sm:py-4 text-[9px] sm:text-[10px] font-semibold text-neutral-400 uppercase tracking-widest whitespace-nowrap">
                        Channel
                      </th>
                      <th className="text-left px-3 sm:px-4 py-3 sm:py-4 text-[9px] sm:text-[10px] font-semibold text-neutral-400 uppercase tracking-widest whitespace-nowrap">
                        Action
                      </th>
                      <th className="text-left px-3 sm:px-4 py-3 sm:py-4 text-[9px] sm:text-[10px] font-semibold text-neutral-400 uppercase tracking-widest">
                        Message
                      </th>
                      <th className="text-left px-3 sm:px-4 py-3 sm:py-4 text-[9px] sm:text-[10px] font-semibold text-neutral-400 uppercase tracking-widest whitespace-nowrap">
                        Status
                      </th>
                      <th className="px-2 py-3 sm:py-4 w-10"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedLogs.map((log, index) => {
                      const StatusIcon = getStatusIcon(log.status);
                      const ActionIcon = actionIcons[log.action] || (() => <RefreshCw className="w-3.5 h-3.5" />);
                      const actionConfig = actionTypes[log.action] || { label: log.action };
                      const otaInfo = getOTAInfo(log.otaCode);

                      return (
                        <tr
                          key={log.id}
                          style={{ animationDelay: `${index * 30}ms` }}
                          className="bg-white hover:bg-neutral-50/50 transition-colors animate-in fade-in slide-in-from-left-2 border-b border-neutral-100 last:border-b-0"
                        >
                          {/* Date (backend date YYYY-MM-DD or from timestamp) */}
                          <td className="py-3 sm:py-4 px-3 sm:px-4 whitespace-nowrap" title={formatLogDateTime(log)}>
                            <span className="text-xs sm:text-[13px] text-neutral-600 font-medium">
                              {formatLogDate(log)}
                            </span>
                          </td>
                          {/* Time */}
                          <td className="py-3 sm:py-4 px-3 sm:px-4 whitespace-nowrap">
                            <span className="text-xs sm:text-[13px] text-neutral-600 font-medium">
                              {formatTime(log.timestamp)}
                            </span>
                          </td>

                          {/* Channel/OTA */}
                          <td className="py-3 sm:py-4 px-3 sm:px-4 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <div
                                className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center text-white text-[9px] sm:text-[10px] font-bold flex-shrink-0"
                                style={{ backgroundColor: otaInfo.color }}
                              >
                                {otaInfo.name.substring(0, 2).toUpperCase()}
                              </div>
                              <div className="min-w-0">
                                <p className="text-xs sm:text-[13px] font-semibold text-neutral-800">
                                  {otaInfo.name}
                                </p>
                                <p className="text-[9px] sm:text-[10px] text-neutral-400 font-medium">
                                  {log.otaCode}
                                </p>
                              </div>
                            </div>
                          </td>

                          {/* Action */}
                          <td className="py-3 sm:py-4 px-3 sm:px-4 whitespace-nowrap">
                            <p className="text-xs sm:text-[13px] font-medium text-neutral-800">
                              {actionConfig.label}
                            </p>
                          </td>

                          {/* Message */}
                          <td className="py-3 sm:py-4 px-3 sm:px-4">
                            <p className="text-xs sm:text-[13px] text-neutral-500 max-w-xs lg:max-w-md truncate" title={log.message}>
                              {log.message}
                            </p>
                          </td>

                          {/* Status */}
                          <td className="py-3 sm:py-4 px-3 sm:px-4 whitespace-nowrap">
                            <span className={`inline-flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-lg text-[10px] sm:text-[11px] font-medium ${getStatusBadgeClasses(log.status)}`}>
                              <StatusIcon className="w-2.5 h-2.5 sm:w-3 sm:h-3 flex-shrink-0" />
                              <span>{log.status.charAt(0).toUpperCase() + log.status.slice(1)}</span>
                            </span>
                          </td>

                          {/* Actions - Always visible */}
                          <td className="py-3 sm:py-4 px-2 text-center w-10">
                            <IconButton
                              icon={Eye}
                              variant="ghost"
                              size="sm"
                              label="View details"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedLog(log);
                              }}
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Pagination - Matching BookingList exactly */}
              {totalPages > 1 && (
                <div className="px-3 sm:px-6 py-3 sm:py-4 border-t border-neutral-100 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-0 bg-neutral-50/30">
                  <p className="text-[11px] sm:text-[13px] text-neutral-500 order-2 sm:order-1">
                    <span className="hidden sm:inline">Showing </span>
                    <span className="font-semibold text-neutral-700">{(currentPage - 1) * ITEMS_PER_PAGE + 1}</span>
                    {' '}-{' '}
                    <span className="font-semibold text-neutral-700">{Math.min(currentPage * ITEMS_PER_PAGE, totalCount)}</span>
                    {' '}of{' '}
                    <span className="font-semibold text-neutral-700">{totalCount}</span>
                    <span className="hidden sm:inline"> logs</span>
                  </p>

                  <div className="flex items-center gap-0.5 sm:gap-1 order-1 sm:order-2">
                    <button
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className={`flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-lg transition-colors ${
                        currentPage === 1
                          ? 'text-neutral-300 cursor-not-allowed'
                          : 'text-neutral-500 hover:bg-neutral-100 hover:text-neutral-700'
                      }`}
                    >
                      <ChevronLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </button>

                    <div className="flex items-center gap-0.5 mx-0.5 sm:mx-1">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let page;
                        if (totalPages <= 5) {
                          page = i + 1;
                        } else if (currentPage <= 3) {
                          page = i + 1;
                        } else if (currentPage >= totalPages - 2) {
                          page = totalPages - 4 + i;
                        } else {
                          page = currentPage - 2 + i;
                        }
                        return (
                          <button
                            key={page}
                            onClick={() => setCurrentPage(page)}
                            className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg text-xs sm:text-[13px] font-semibold transition-colors ${
                              currentPage === page
                                ? 'bg-terra-500 text-white'
                                : 'text-neutral-600 hover:bg-neutral-100'
                            }`}
                          >
                            {page}
                          </button>
                        );
                      })}
                    </div>

                    <button
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className={`flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-lg transition-colors ${
                        currentPage === totalPages
                          ? 'text-neutral-300 cursor-not-allowed'
                          : 'text-neutral-500 hover:bg-neutral-100 hover:text-neutral-700'
                      }`}
                    >
                      <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Log Details Drawer */}
      <SyncLogDetailDrawer
        log={selectedLog}
        otas={otas}
        onClose={() => setSelectedLog(null)}
      />
    </div>
  );
}
