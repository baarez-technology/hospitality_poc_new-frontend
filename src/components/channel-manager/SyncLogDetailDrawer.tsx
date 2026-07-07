/**
 * SyncLogDetailDrawer Component
 * Drawer to display sync log details - Glimmora Design System v5.0
 */

import {
  CheckCircle, XCircle, AlertTriangle, Clock,
  DollarSign, Calendar, Ban, Gift, Download, Wifi, RefreshCw
} from 'lucide-react';
import { Drawer } from '../ui2/Drawer';
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

export default function SyncLogDetailDrawer({ log, otas, onClose }) {
  if (!log) return null;

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

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success': return CheckCircle;
      case 'error': return XCircle;
      case 'warning': return AlertTriangle;
      case 'pending': return Clock;
      default: return Clock;
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

  const StatusIcon = getStatusIcon(log.status);
  const ActionIcon = actionIcons[log.action] || RefreshCw;
  const otaInfo = getOTAInfo(log.otaCode);

  return (
    <Drawer
      isOpen={!!log}
      onClose={onClose}
      title="Sync Log Details"
      maxWidth="max-w-2xl"
    >
      <div className="space-y-6">
        {/* Log Summary */}
        <div className="p-4 rounded-lg bg-neutral-50 border border-neutral-100">
          <div className="flex items-center gap-3 mb-3">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center text-white text-sm font-bold"
              style={{ backgroundColor: otaInfo.color }}
            >
              {otaInfo.name.substring(0, 1)}
            </div>
            <div>
              <p className="text-[14px] font-semibold text-neutral-900">
                {otaInfo.name}
              </p>
              <p className="text-[12px] text-neutral-500">
                {formatTime(log.timestamp)}
              </p>
            </div>
          </div>
          <p className="text-[13px] text-neutral-600">{log.message}</p>
        </div>

        {/* Status & Action */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-neutral-400 mb-2">
              Status
            </p>
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-medium ${getStatusBadgeClasses(log.status)}`}>
              <StatusIcon className="w-3 h-3" />
              {statusTypes[log.status]?.label || log.status}
            </span>
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-neutral-400 mb-2">
              Action
            </p>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-neutral-100">
                <ActionIcon className="w-3.5 h-3.5 text-neutral-500" />
              </div>
              <span className="text-[13px] text-neutral-700">
                {actionTypes[log.action]?.label || log.action}
              </span>
            </div>
          </div>
        </div>

        {/* Details */}
        {log.details && Object.keys(log.details).length > 0 && (
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-neutral-400 mb-3">
              Details
            </p>
            <div className="space-y-3">
              {Object.entries(log.details).map(([key, value]) => (
                <div
                  key={key}
                  className="p-3 rounded-lg bg-neutral-50 border border-neutral-100"
                >
                  <p className="text-[10px] uppercase tracking-widest font-semibold text-neutral-400 mb-1">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </p>
                  <p className="text-[13px] font-semibold text-neutral-900">
                    {Array.isArray(value) ? value.join(', ') : String(value)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Drawer>
  );
}
