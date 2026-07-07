/**
 * OTAConnectionCard Component
 * Individual OTA connection card with status and actions - Glimmora Design System v5.0
 * Redesigned for optimal UX with clear visual hierarchy
 */

import { useState } from 'react';
import {
  Wifi, WifiOff, AlertTriangle, RefreshCw, Settings,
  FileText, Clock, Star, ChevronDown, ChevronUp,
  Zap, CheckCircle, Timer, BarChart3, Percent, Key, User, Building2
} from 'lucide-react';
import { otaStatusConfig } from '../../data/channel-manager/sampleOTAs';
import { Button, IconButton } from '../ui2/Button';
import { useCurrency } from '@/hooks/useCurrency';

export default function OTAConnectionCard({
  ota,
  onReconnect,
  onDisconnect,
  onEditCredentials,
  onViewLogs,
  onSync,
  isSyncing
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { formatCurrency } = useCurrency();

  const status = otaStatusConfig[ota.status] || otaStatusConfig.disconnected;

  const formatTime = (isoString) => {
    if (!isoString) return 'Never';
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className={`rounded-[10px] bg-white overflow-hidden border-2 ${
      ota.status === 'error'
        ? 'border-rose-200'
        : 'border-neutral-100'
    }`}>
      {/* Header - Always Visible */}
      <div className="p-3 sm:p-5">
        <div className="flex items-start justify-between gap-3 sm:gap-4">
          {/* Left: Identity */}
          <div className="flex items-start gap-3 sm:gap-4 flex-1 min-w-0">
            {/* OTA Logo */}
            <div className="relative flex-shrink-0">
              <div
                className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center text-white font-bold text-xs sm:text-sm"
                style={{ backgroundColor: ota.color || '#A57865' }}
              >
                {ota.name.substring(0, 2).toUpperCase()}
              </div>
              {/* Status indicator dot */}
              <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-full border-2 border-white ${
                ota.status === 'connected' ? 'bg-sage-500' :
                ota.status === 'error' ? 'bg-rose-500' : 'bg-neutral-400'
              }`} />
            </div>

            {/* Name & Status */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2 mb-1">
                <h3 className="text-xs sm:text-[13px] font-semibold text-neutral-900 truncate">
                  {ota.name}
                </h3>
                <span className={`px-1.5 sm:px-2 py-0.5 sm:py-1 text-[9px] sm:text-[10px] font-semibold uppercase tracking-wider rounded flex-shrink-0 ${status.bg} ${status.color}`}>
                  {status.label}
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-neutral-500 font-medium flex items-center gap-1.5">
                <Clock className="w-3 h-3" />
                Last sync: {formatTime(ota.lastSync)}
                {ota.status === 'connected' && ota.nextSync && (
                  <>
                    <span className="mx-1.5">·</span>
                    Next: {formatTime(ota.nextSync)}
                  </>
                )}
              </p>
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {ota.status === 'connected' && (
              <Button
                onClick={() => onSync(ota.code)}
                disabled={isSyncing}
                variant="outline"
                size="sm"
                icon={RefreshCw}
                loading={isSyncing}
              >
                {isSyncing ? 'Syncing...' : 'Sync Now'}
              </Button>
            )}

            {ota.status === 'disconnected' && (
              <Button
                onClick={() => onReconnect(ota.id)}
                variant="primary"
                size="sm"
                icon={Wifi}
              >
                Connect
              </Button>
            )}

            {ota.status === 'error' && (
              <Button
                onClick={() => onReconnect(ota.id)}
                variant="outline"
                size="sm"
                icon={RefreshCw}
              >
                Retry
              </Button>
            )}

            <IconButton
              onClick={() => setIsExpanded(!isExpanded)}
              icon={isExpanded ? ChevronUp : ChevronDown}
              variant="ghost"
              size="sm"
              label={isExpanded ? 'Collapse details' : 'Expand details'}
            />
          </div>
        </div>

        {/* Error Message */}
        {ota.status === 'error' && ota.errorMessage && (
          <div className="mt-3 sm:mt-4 flex items-start gap-3 p-3 sm:p-4 bg-rose-50 rounded-lg border border-rose-200">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-rose-100 flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-rose-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-widest text-rose-600 mb-0.5">Connection Error</p>
              <p className="text-xs sm:text-[13px] text-rose-700">{ota.errorMessage}</p>
            </div>
            <Button
              onClick={() => onEditCredentials(ota)}
              variant="outline"
              size="sm"
            >
              Fix Issue
            </Button>
          </div>
        )}

        {/* Quick Stats - Connected State */}
        {ota.status === 'connected' && (
          <div className="mt-4 sm:mt-5 pt-4 sm:pt-5 border-t border-neutral-100">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3">
              <div className="p-2.5 sm:p-3 rounded-lg bg-neutral-50 text-center">
                <p className="text-[9px] sm:text-[10px] font-semibold uppercase tracking-widest text-neutral-400 mb-1">Bookings</p>
                <p className="text-base sm:text-lg font-bold tracking-tight text-terra-600">{ota.stats?.totalBookings || 0}</p>
              </div>
              <div className="p-2.5 sm:p-3 rounded-lg bg-neutral-50 text-center">
                <p className="text-[9px] sm:text-[10px] font-semibold uppercase tracking-widest text-neutral-400 mb-1">Revenue</p>
                <p className="text-base sm:text-lg font-bold tracking-tight text-sage-600">{formatCurrency(ota.stats?.revenue || 0)}</p>
              </div>
              <div className="p-2.5 sm:p-3 rounded-lg bg-neutral-50 text-center">
                <p className="text-[9px] sm:text-[10px] font-semibold uppercase tracking-widest text-neutral-400 mb-1">Rating</p>
                <p className="text-base sm:text-lg font-bold tracking-tight text-gold-600 flex items-center justify-center gap-1">
                  {ota.stats?.avgRating || 0}
                  <Star className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-current" />
                </p>
              </div>
              <div className="p-2.5 sm:p-3 rounded-lg bg-neutral-50 text-center">
                <p className="text-[9px] sm:text-[10px] font-semibold uppercase tracking-widest text-neutral-400 mb-1">Commission</p>
                <p className="text-base sm:text-lg font-bold tracking-tight text-neutral-700">{ota.stats?.commission || 0}%</p>
              </div>
            </div>
          </div>
        )}

        {/* Disconnected State */}
        {ota.status === 'disconnected' && (
          <div className="mt-3 sm:mt-4 flex items-center gap-3 p-3 sm:p-4 bg-neutral-50 border border-neutral-200 rounded-lg">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-neutral-100 flex items-center justify-center flex-shrink-0">
              <WifiOff className="w-4 h-4 sm:w-5 sm:h-5 text-neutral-600" />
            </div>
            <div className="flex-1">
              <p className="text-xs sm:text-[13px] font-semibold text-neutral-900">Channel Disconnected</p>
              <p className="text-[10px] sm:text-[11px] text-neutral-600 mt-0.5">This OTA is currently offline. Click the Connect button above to reactivate it.</p>
            </div>
          </div>
        )}
      </div>

      {/* Expanded Details */}
      {isExpanded && (
        <div className="border-t border-neutral-100">
          {/* Sync Configuration - Key Details Grid */}
          <div className="px-3 sm:px-5 py-4 sm:py-5">
            <h4 className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-widest text-neutral-900 mb-3 sm:mb-4">
              Sync Configuration
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
              {/* Auto Sync */}
              <div className="flex items-start gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  ota.syncSettings?.autoSync ? 'bg-sage-100' : 'bg-neutral-100'
                }`}>
                  <RefreshCw className={`w-4 h-4 ${ota.syncSettings?.autoSync ? 'text-sage-600' : 'text-neutral-500'}`} />
                </div>
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-neutral-400 mb-1">Auto Sync</p>
                  <p className={`text-[13px] font-semibold ${ota.syncSettings?.autoSync ? 'text-sage-600' : 'text-neutral-500'}`}>
                    {ota.syncSettings?.autoSync ? 'Enabled' : 'Disabled'}
                  </p>
                </div>
              </div>

              {/* Interval */}
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-neutral-100 flex items-center justify-center flex-shrink-0">
                  <Timer className="w-4 h-4 text-neutral-600" />
                </div>
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-neutral-400 mb-1">Interval</p>
                  <p className="text-[13px] font-semibold text-neutral-800">
                    {ota.syncSettings?.syncInterval || 5} minutes
                  </p>
                </div>
              </div>

              {/* Rates */}
              <div className="flex items-start gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  ota.syncSettings?.syncRates ? 'bg-sage-100' : 'bg-neutral-100'
                }`}>
                  <BarChart3 className={`w-4 h-4 ${ota.syncSettings?.syncRates ? 'text-sage-600' : 'text-neutral-500'}`} />
                </div>
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-neutral-400 mb-1">Sync Rates</p>
                  <p className={`text-[13px] font-semibold ${ota.syncSettings?.syncRates ? 'text-sage-600' : 'text-neutral-500'}`}>
                    {ota.syncSettings?.syncRates ? 'Enabled' : 'Disabled'}
                  </p>
                </div>
              </div>

              {/* Availability */}
              <div className="flex items-start gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  ota.syncSettings?.syncAvailability ? 'bg-sage-100' : 'bg-neutral-100'
                }`}>
                  <CheckCircle className={`w-4 h-4 ${ota.syncSettings?.syncAvailability ? 'text-sage-600' : 'text-neutral-500'}`} />
                </div>
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-neutral-400 mb-1">Availability</p>
                  <p className={`text-[13px] font-semibold ${ota.syncSettings?.syncAvailability ? 'text-sage-600' : 'text-neutral-500'}`}>
                    {ota.syncSettings?.syncAvailability ? 'Enabled' : 'Disabled'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Connection Details */}
          <div className="px-3 sm:px-5 py-4 sm:py-5 border-t border-neutral-100">
            <h4 className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-widest text-neutral-900 mb-3 sm:mb-4">
              Connection Details
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
              {/* Hotel ID */}
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-neutral-100 flex items-center justify-center flex-shrink-0">
                  <Building2 className="w-4 h-4 text-neutral-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-neutral-400 mb-1">Hotel ID</p>
                  <p className="text-[13px] font-mono font-semibold text-neutral-800 truncate">
                    {ota.credentials?.hotelId || '—'}
                  </p>
                </div>
              </div>

              {/* Username */}
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-neutral-100 flex items-center justify-center flex-shrink-0">
                  <User className="w-4 h-4 text-neutral-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-neutral-400 mb-1">Username</p>
                  <p className="text-[13px] font-mono font-semibold text-neutral-800 truncate">
                    {ota.credentials?.username || '—'}
                  </p>
                </div>
              </div>

              {/* API Key */}
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-neutral-100 flex items-center justify-center flex-shrink-0">
                  <Key className="w-4 h-4 text-neutral-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-neutral-400 mb-1">API Key</p>
                  <p className="text-[13px] font-mono text-neutral-400 truncate">
                    {ota.credentials?.apiKey ? '••••••••••••••••' : '—'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="px-3 sm:px-5 py-3 sm:py-4 border-t border-neutral-100 bg-neutral-50/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
            <p className="text-[10px] sm:text-[11px] text-neutral-500 font-medium">
              {ota.status === 'connected' ? `Connected since ${ota.connectedSince || 'Unknown'}` : `Last active ${formatTime(ota.lastSync)}`}
            </p>
            <div className="flex items-center gap-2 flex-wrap">
              <Button
                onClick={() => onViewLogs(ota.code)}
                variant="outline"
                size="sm"
                icon={FileText}
              >
                View Logs
              </Button>
              {ota.status === 'disconnected' && (
                <Button
                  onClick={() => onReconnect(ota.id)}
                  variant="primary"
                  size="sm"
                  icon={Wifi}
                >
                  Connect
                </Button>
              )}
              {ota.status !== 'disconnected' && (
                <Button
                  onClick={() => onEditCredentials(ota)}
                  variant="outline"
                  size="sm"
                  icon={Settings}
                >
                  Edit Credentials
                </Button>
              )}
              {ota.status === 'connected' && (
                <Button
                  onClick={() => onDisconnect(ota.id)}
                  variant="danger"
                  size="sm"
                  icon={WifiOff}
                >
                  Disconnect
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
