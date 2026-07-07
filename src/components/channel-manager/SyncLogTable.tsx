/**
 * SyncLogTable Component
 * Table displaying sync activity logs with luxury styling
 */

import { useState, useMemo } from 'react';
import {
  CheckCircle, XCircle, AlertTriangle, Clock,
  ChevronDown, ChevronUp, DollarSign, Calendar,
  Ban, Gift, Download, Wifi, RefreshCw, Activity,
  ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight
} from 'lucide-react';
import { actionTypes, statusTypes } from '../../data/channel-manager/sampleSyncLogs';

const actionIcons = {
  rate_update: DollarSign,
  availability_update: Calendar,
  restriction_update: Ban,
  promotion_sync: Gift,
  booking_import: Download,
  connection: Wifi,
  bulk_sync: RefreshCw
};

const ITEMS_PER_PAGE = 10;

export default function SyncLogTable({ logs, otas, isDark = false }) {
  const [expandedLog, setExpandedLog] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  // Pagination logic
  const totalPages = Math.ceil(logs.length / ITEMS_PER_PAGE);

  const paginatedLogs = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return logs.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [logs, currentPage]);

  // Reset to page 1 when logs change
  useMemo(() => {
    if (currentPage > Math.ceil(logs.length / ITEMS_PER_PAGE)) {
      setCurrentPage(1);
    }
  }, [logs.length]);

  const goToPage = (page) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
    setExpandedLog(null);
  };

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

  const formatLogDate = (log) => {
    if (log?.date) return log.date;
    if (log?.timestamp) return new Date(log.timestamp).toISOString().split('T')[0];
    return '—';
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success': return CheckCircle;
      case 'error': return XCircle;
      case 'warning': return AlertTriangle;
      case 'pending': return Clock;
      default: return Clock;
    }
  };

  const getStatusStyles = (status) => {
    const styles = {
      success: {
        bg: isDark ? 'bg-emerald-500/20' : 'bg-gradient-to-r from-emerald-500/15 to-emerald-500/5',
        text: isDark ? 'text-emerald-400' : 'text-emerald-600',
        iconBg: isDark ? 'bg-emerald-500/20' : 'bg-emerald-100',
      },
      error: {
        bg: isDark ? 'bg-rose-500/20' : 'bg-gradient-to-r from-rose-500/15 to-rose-500/5',
        text: isDark ? 'text-rose-400' : 'text-rose-600',
        iconBg: isDark ? 'bg-rose-500/20' : 'bg-rose-100',
      },
      warning: {
        bg: isDark ? 'bg-amber-500/20' : 'bg-gradient-to-r from-amber-500/15 to-amber-500/5',
        text: isDark ? 'text-amber-400' : 'text-amber-600',
        iconBg: isDark ? 'bg-amber-500/20' : 'bg-amber-100',
      },
      pending: {
        bg: isDark ? 'bg-blue-500/20' : 'bg-gradient-to-r from-blue-500/15 to-blue-500/5',
        text: isDark ? 'text-blue-400' : 'text-blue-600',
        iconBg: isDark ? 'bg-blue-500/20' : 'bg-blue-100',
      },
    };
    return styles[status] || styles.pending;
  };

  const getOTAInfo = (otaCode) => {
    if (otaCode === 'ALL') {
      return { name: 'All OTAs', color: '#A57865' };
    }
    const ota = otas.find(o => o.code === otaCode);
    return ota || { name: otaCode, color: '#6B7280' };
  };

  // Card background class based on theme
  const cardBg = isDark
    ? 'bg-white/[0.03] border border-white/[0.08] backdrop-blur-sm'
    : 'luxury-glass';

  return (
    <div className={`${cardBg} rounded-3xl overflow-hidden`}>
      <div className="overflow-x-auto custom-scrollbar">
        <table className="w-full">
          <thead>
            <tr className={`border-b ${isDark ? 'border-white/10 bg-white/[0.02]' : 'border-neutral-100 bg-neutral-50/50'}`}>
              <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-white/50' : 'text-neutral-500'}`}>
                Date
              </th>
              <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-white/50' : 'text-neutral-500'}`}>
                Time
              </th>
              <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-white/50' : 'text-neutral-500'}`}>
                OTA
              </th>
              <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-white/50' : 'text-neutral-500'}`}>
                Action
              </th>
              <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-white/50' : 'text-neutral-500'}`}>
                Message
              </th>
              <th className={`px-6 py-4 text-center text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-white/50' : 'text-neutral-500'}`}>
                Status
              </th>
              <th className={`px-6 py-4 text-center text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-white/50' : 'text-neutral-500'} w-12`}>
              </th>
            </tr>
          </thead>
          <tbody>
            {paginatedLogs.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-16 text-center">
                  <div className="flex flex-col items-center justify-center">
                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 ${isDark ? 'bg-white/10' : 'bg-neutral-100'}`}>
                      <Activity className={`w-8 h-8 ${isDark ? 'text-white/30' : 'text-neutral-300'}`} />
                    </div>
                    <h3 className={`text-lg font-semibold mb-2 ${isDark ? 'text-white' : 'text-neutral-900'}`}>No sync logs found</h3>
                    <p className={`text-sm ${isDark ? 'text-white/50' : 'text-neutral-500'}`}>
                      Sync activity will appear here when OTAs are connected and syncing
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              paginatedLogs.map((log, index) => {
                const StatusIcon = getStatusIcon(log.status);
                const ActionIcon = actionIcons[log.action] || RefreshCw;
                const actionConfig = actionTypes[log.action] || { label: log.action, color: 'text-neutral-600' };
                const statusConfig = statusTypes[log.status] || statusTypes.pending;
                const statusStyles = getStatusStyles(log.status);
                const otaInfo = getOTAInfo(log.otaCode);
                const isExpanded = expandedLog === log.id;

                return (
                  <>
                    <tr
                      key={log.id}
                      className={`group border-b last:border-b-0 transition-all duration-300 cursor-pointer ${
                        isDark
                          ? `border-white/5 ${isExpanded ? 'bg-white/[0.05]' : 'hover:bg-white/[0.03]'}`
                          : `border-neutral-50 ${isExpanded ? 'bg-[#FAF7F4]' : 'hover:bg-[#FAF7F4]/50'}`
                      }`}
                      onClick={() => setExpandedLog(isExpanded ? null : log.id)}
                    >
                      <td className="px-6 py-4">
                        <span className={`text-sm ${isDark ? 'text-white/70' : 'text-neutral-600'}`}>
                          {formatLogDate(log)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-sm ${isDark ? 'text-white/70' : 'text-neutral-600'}`}>
                          {formatTime(log.timestamp)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold transition-transform group-hover:scale-105"
                            style={{ backgroundColor: otaInfo.color }}
                          >
                            {otaInfo.name.substring(0, 1)}
                          </div>
                          <span className={`text-sm font-medium group-hover:text-[#A57865] transition-colors ${isDark ? 'text-white' : 'text-neutral-900'}`}>
                            {otaInfo.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${isDark ? 'bg-white/[0.05]' : 'bg-neutral-100'}`}>
                            <ActionIcon className={`w-3.5 h-3.5 ${isDark ? 'text-white/60' : actionConfig.color}`} />
                          </div>
                          <span className={`text-sm ${isDark ? 'text-white/70' : 'text-neutral-700'}`}>
                            {actionConfig.label}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className={`text-sm truncate max-w-[300px] ${isDark ? 'text-white/60' : 'text-neutral-600'}`}>
                          {log.message}
                        </p>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full ${statusStyles.bg} ${statusStyles.text}`}>
                          <StatusIcon className="w-3 h-3" />
                          {statusConfig.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        {log.details && (
                          <button className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-white/10' : 'hover:bg-neutral-100'}`}>
                            {isExpanded ? (
                              <ChevronUp className={`w-4 h-4 ${isDark ? 'text-white/50' : 'text-neutral-400'}`} />
                            ) : (
                              <ChevronDown className={`w-4 h-4 ${isDark ? 'text-white/50' : 'text-neutral-400'}`} />
                            )}
                          </button>
                        )}
                      </td>
                    </tr>
                    {isExpanded && log.details && (
                      <tr key={`${log.id}-details`} className={isDark ? 'bg-white/[0.02]' : 'bg-[#FAF7F4]'}>
                        <td colSpan={7} className="px-6 py-5">
                          <div className={`ml-4 pl-5 border-l-2 ${isDark ? 'border-[#A57865]/30' : 'border-[#A57865]/20'}`}>
                            <div className="flex items-center gap-2 mb-4">
                              <div className={`w-6 h-6 rounded-md flex items-center justify-center ${isDark ? 'bg-[#A57865]/20' : 'bg-[#A57865]/10'}`}>
                                <Activity className="w-3 h-3 text-[#A57865]" />
                              </div>
                              <h4 className={`text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-white/50' : 'text-neutral-500'}`}>
                                Details
                              </h4>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                              {Object.entries(log.details).map(([key, value]) => (
                                <div
                                  key={key}
                                  className={`p-3 rounded-xl ${isDark ? 'bg-white/[0.03] border border-white/5' : 'bg-white/70 border border-white/50'}`}
                                >
                                  <p className={`text-[10px] uppercase tracking-wider font-semibold mb-1 ${isDark ? 'text-white/40' : 'text-neutral-400'}`}>
                                    {key.replace(/([A-Z])/g, ' $1').trim()}
                                  </p>
                                  <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-neutral-900'}`}>
                                    {Array.isArray(value) ? value.join(', ') : String(value)}
                                  </p>
                                </div>
                              ))}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {logs.length > ITEMS_PER_PAGE && (
        <div className={`flex items-center justify-between px-6 py-4 border-t ${isDark ? 'border-white/10' : 'border-neutral-100'}`}>
          <div className={`text-sm ${isDark ? 'text-white/50' : 'text-neutral-500'}`}>
            Showing <span className={`font-medium ${isDark ? 'text-white' : 'text-neutral-900'}`}>{((currentPage - 1) * ITEMS_PER_PAGE) + 1}</span> to <span className={`font-medium ${isDark ? 'text-white' : 'text-neutral-900'}`}>{Math.min(currentPage * ITEMS_PER_PAGE, logs.length)}</span> of <span className={`font-medium ${isDark ? 'text-white' : 'text-neutral-900'}`}>{logs.length}</span> logs
          </div>

          <div className="flex items-center gap-1">
            {/* First Page */}
            <button
              onClick={() => goToPage(1)}
              disabled={currentPage === 1}
              className={`p-2 rounded-lg transition-colors ${
                currentPage === 1
                  ? (isDark ? 'text-white/20 cursor-not-allowed' : 'text-neutral-300 cursor-not-allowed')
                  : (isDark ? 'text-white/60 hover:text-white hover:bg-white/10' : 'text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100')
              }`}
            >
              <ChevronsLeft className="w-4 h-4" />
            </button>

            {/* Previous Page */}
            <button
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
              className={`p-2 rounded-lg transition-colors ${
                currentPage === 1
                  ? (isDark ? 'text-white/20 cursor-not-allowed' : 'text-neutral-300 cursor-not-allowed')
                  : (isDark ? 'text-white/60 hover:text-white hover:bg-white/10' : 'text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100')
              }`}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {/* Page Numbers */}
            <div className="flex items-center gap-1 mx-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(page => {
                  if (totalPages <= 5) return true;
                  if (page === 1 || page === totalPages) return true;
                  if (Math.abs(page - currentPage) <= 1) return true;
                  return false;
                })
                .map((page, index, arr) => {
                  const showEllipsis = index > 0 && page - arr[index - 1] > 1;
                  return (
                    <div key={page} className="flex items-center">
                      {showEllipsis && (
                        <span className={`px-2 ${isDark ? 'text-white/30' : 'text-neutral-400'}`}>...</span>
                      )}
                      <button
                        onClick={() => goToPage(page)}
                        className={`min-w-[36px] h-9 px-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                          currentPage === page
                            ? 'bg-[#A57865] text-white shadow-md'
                            : (isDark ? 'text-white/60 hover:text-white hover:bg-white/10' : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100')
                        }`}
                      >
                        {page}
                      </button>
                    </div>
                  );
                })}
            </div>

            {/* Next Page */}
            <button
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`p-2 rounded-lg transition-colors ${
                currentPage === totalPages
                  ? (isDark ? 'text-white/20 cursor-not-allowed' : 'text-neutral-300 cursor-not-allowed')
                  : (isDark ? 'text-white/60 hover:text-white hover:bg-white/10' : 'text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100')
              }`}
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            {/* Last Page */}
            <button
              onClick={() => goToPage(totalPages)}
              disabled={currentPage === totalPages}
              className={`p-2 rounded-lg transition-colors ${
                currentPage === totalPages
                  ? (isDark ? 'text-white/20 cursor-not-allowed' : 'text-neutral-300 cursor-not-allowed')
                  : (isDark ? 'text-white/60 hover:text-white hover:bg-white/10' : 'text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100')
              }`}
            >
              <ChevronsRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
