/**
 * OTAConnections Page
 * Manage OTA platform connections - Glimmora Design System v5.0
 * Enhanced with consistent styling matching CMS section
 */

import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus, RefreshCw, Search, Wifi, WifiOff, AlertTriangle, ChevronDown, Loader2
} from 'lucide-react';
import { useChannelManager } from '../../../context/ChannelManagerContext';
import { useChannelManagerSSEEvents } from '../../../hooks/useChannelManagerSSEEvents';
import OTAConnectionCard from '../../../components/channel-manager/OTAConnectionCard';
import AddConnectionModal from '../../../components/channel-manager/AddConnectionModal';
import EditCredentialsModal from '../../../components/channel-manager/EditCredentialsModal';
import DisconnectOTAModal from '../../../components/channel-manager/DisconnectOTAModal';
import { Button } from '../../../components/ui2/Button';
import { DropdownMenu, DropdownMenuItem } from '../../../components/ui2/DropdownMenu';

export default function OTAConnections() {
  const navigate = useNavigate();
  const {
    otas,
    isLoading: contextLoading,
    syncingOTAs,
    connectOTA,
    disconnectOTA,
    reconnectOTA,
    updateOTACredentials,
    triggerManualSync,
    fetchOTAs,
  } = useChannelManager();

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDisconnectModal, setShowDisconnectModal] = useState(false);
  const [selectedOTA, setSelectedOTA] = useState(null);
  const [otaToDisconnect, setOtaToDisconnect] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Refetch data function for SSE
  const refetchData = useCallback(async () => {
    await fetchOTAs();
  }, [fetchOTAs]);

  // Register SSE event handlers for real-time updates
  useChannelManagerSSEEvents({
    onSyncStatus: refetchData,
    refetchData,
  });

  // Filter OTAs
  const filteredOTAs = otas.filter(ota => {
    const matchesSearch = ota.name?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false;
    const matchesStatus = statusFilter === 'all' || ota.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Status counts
  const statusCounts = {
    all: otas.length,
    connected: otas.filter(o => o.status === 'connected').length,
    disconnected: otas.filter(o => o.status === 'disconnected').length,
    error: otas.filter(o => o.status === 'error').length
  };

  const handleConnect = async (otaData) => {
    try {
      await connectOTA(otaData);
      setShowAddModal(false);
      await refetchData();
    } catch (err) {
      // Error already handled in context
    }
  };

  const handleDisconnect = (otaId) => {
    const ota = otas.find(o => o.id === otaId);
    setOtaToDisconnect(ota);
    setShowDisconnectModal(true);
  };

  const handleConfirmDisconnect = async (otaId) => {
    try {
      await disconnectOTA(otaId);
      setShowDisconnectModal(false);
      setOtaToDisconnect(null);
    } catch (err) {
      // On error, refetch to restore correct state
      await refetchData();
    }
  };

  const handleReconnect = async (otaId) => {
    try {
      await reconnectOTA(otaId);
      // Don't refetch immediately — reconnectOTA already updates state optimistically
    } catch (err) {
      // On error, refetch to restore correct state
      await refetchData();
    }
  };

  const handleEditCredentials = (ota) => {
    setSelectedOTA(ota);
    setShowEditModal(true);
  };

  const handleSaveCredentials = async (otaId, credentials) => {
    try {
      await updateOTACredentials(otaId, credentials);
      setShowEditModal(false);
      await refetchData();
    } catch (err) {
      // Error already handled in context
    }
  };

  const handleViewLogs = (otaCode) => {
    navigate(`/admin/channel-manager/logs?ota=${otaCode}`);
  };

  const handleSync = (otaCode) => {
    triggerManualSync(otaCode);
  };

  const handleSyncAll = () => {
    triggerManualSync('ALL');
  };

  // KPI cards configuration
  const kpiCards = [
    {
      icon: Wifi,
      title: 'Total OTAs',
      value: statusCounts.all,
      accent: 'terra'
    },
    {
      icon: Wifi,
      title: 'Connected',
      value: statusCounts.connected,
      accent: 'sage'
    },
    {
      icon: WifiOff,
      title: 'Disconnected',
      value: statusCounts.disconnected,
      accent: 'ocean'
    },
    {
      icon: AlertTriangle,
      title: 'Errors',
      value: statusCounts.error,
      accent: 'rose'
    }
  ];

  const accentStyles = {
    terra: { bg: 'bg-terra-50', icon: 'text-terra-600' },
    sage: { bg: 'bg-sage-50', icon: 'text-sage-600' },
    ocean: { bg: 'bg-ocean-50', icon: 'text-ocean-600' },
    rose: { bg: 'bg-rose-50', icon: 'text-rose-600' },
  };

  const getStatusFilterLabel = () => {
    switch (statusFilter) {
      case 'connected': return `Active (${statusCounts.connected})`;
      case 'disconnected': return `Offline (${statusCounts.disconnected})`;
      case 'error': return `Issues (${statusCounts.error})`;
      default: return `All (${statusCounts.all})`;
    }
  };

  if (contextLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#F9F7F7' }}>
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-terra-600 mx-auto mb-4" />
          <p className="text-neutral-600">Loading OTA connections...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F9F7F7' }}>
      <main className="px-4 sm:px-6 lg:px-10 py-4 sm:py-6 space-y-4 sm:space-y-6">

        {/* Page Header */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-neutral-900">
              OTA Connections
            </h1>
            <p className="text-xs sm:text-[13px] text-neutral-500 mt-0.5 sm:mt-1">
              <span className="hidden sm:inline">Manage your channel distribution partners</span>
              <span className="sm:hidden">Manage distribution partners</span>
            </p>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <Button
              variant="outline"
              icon={RefreshCw}
              onClick={handleSyncAll}
              disabled={syncingOTAs.length > 0}
              loading={syncingOTAs.length > 0}
              className="text-xs sm:text-sm"
            >
              <span className="hidden sm:inline">Sync All</span>
              <span className="sm:hidden">Sync</span>
            </Button>
            <Button
              variant="primary"
              icon={Plus}
              onClick={() => setShowAddModal(true)}
              className="text-xs sm:text-sm"
            >
              <span className="hidden sm:inline">Add Connection</span>
              <span className="sm:hidden">Add</span>
            </Button>
          </div>
        </header>

        {/* KPI Cards */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
          {kpiCards.map((kpi, index) => {
            const style = accentStyles[kpi.accent] || accentStyles.terra;
            return (
              <div key={index} className="rounded-[10px] bg-white p-4 sm:p-6">
                {/* Header with Icon */}
                <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                  <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center ${style.bg}`}>
                    <kpi.icon className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${style.icon}`} />
                  </div>
                  <p className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-widest text-neutral-400 truncate">
                    {kpi.title}
                  </p>
                </div>

                {/* Value */}
                <p className="text-xl sm:text-[28px] font-semibold tracking-tight text-neutral-900">
                  {contextLoading ? '-' : kpi.value}
                </p>
              </div>
            );
          })}
        </section>

        {/* Search & Filters */}
        <section className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 sm:w-4 sm:h-4 text-neutral-400" />
            <input
              type="text"
              placeholder="Search OTAs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-9 sm:h-10 pl-8 sm:pl-10 pr-3 sm:pr-4 rounded-lg text-xs sm:text-[13px] bg-white border border-neutral-200 text-neutral-700 placeholder:text-neutral-400 hover:border-neutral-300 focus:outline-none focus:ring-2 focus:ring-terra-500/20 focus:border-terra-500 transition-all"
            />
          </div>

          {/* Filter Dropdown */}
          <DropdownMenu
            align="end"
            trigger={
              <button className="h-9 sm:h-10 w-full sm:w-[140px] px-3 sm:px-4 pr-2.5 sm:pr-3 rounded-lg text-xs sm:text-[13px] bg-white border border-neutral-200 text-neutral-600 hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-terra-500/20 focus:border-terra-500 transition-all flex items-center justify-between">
                <span>{getStatusFilterLabel()}</span>
                <ChevronDown className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-neutral-400" />
              </button>
            }
          >
            <DropdownMenuItem onSelect={() => setStatusFilter('all')}>
              All ({statusCounts.all})
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => setStatusFilter('connected')}>
              Connected ({statusCounts.connected})
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => setStatusFilter('disconnected')}>
              Disconnected ({statusCounts.disconnected})
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => setStatusFilter('error')}>
              Error ({statusCounts.error})
            </DropdownMenuItem>
          </DropdownMenu>
        </section>

        {/* OTA Cards */}
        <section className="space-y-3 sm:space-y-4">
          {contextLoading ? (
            <div className="space-y-3 sm:space-y-4">
              {[0, 1, 2].map(i => (
                <div
                  key={i}
                  className="rounded-[10px] bg-white p-4 sm:p-6 animate-pulse"
                  style={{ animationDelay: `${i * 100}ms` }}
                >
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-xl bg-neutral-100" />
                    <div className="flex-1">
                      <div className="h-4 sm:h-5 w-24 sm:w-32 bg-neutral-100 rounded mb-2" />
                      <div className="h-3 sm:h-4 w-36 sm:w-48 bg-neutral-100 rounded" />
                    </div>
                    <div className="h-8 sm:h-10 w-16 sm:w-24 bg-neutral-100 rounded-lg" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredOTAs.length === 0 ? (
            <div className="rounded-[10px] bg-white p-8 sm:p-16 text-center">
              <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-lg flex items-center justify-center mx-auto mb-4 sm:mb-5 bg-terra-50">
                <WifiOff className="w-6 h-6 sm:w-8 sm:h-8 text-terra-500" />
              </div>
              <h3 className="text-base sm:text-lg font-semibold text-neutral-900 mb-2">No OTAs found</h3>
              <p className="text-xs sm:text-[13px] text-neutral-500 mb-4 sm:mb-6">
                {searchQuery || statusFilter !== 'all'
                  ? 'Try adjusting your search or filter'
                  : 'Get started by adding your first OTA connection'}
              </p>
              {!searchQuery && statusFilter === 'all' && (
                <Button
                  variant="primary"
                  icon={Plus}
                  onClick={() => setShowAddModal(true)}
                  className="text-xs sm:text-sm"
                >
                  <span className="hidden sm:inline">Add Connection</span>
                  <span className="sm:hidden">Add</span>
                </Button>
              )}
            </div>
          ) : (
            filteredOTAs.map(ota => (
              <OTAConnectionCard
                key={ota.id}
                ota={ota}
                onReconnect={handleReconnect}
                onDisconnect={handleDisconnect}
                onEditCredentials={handleEditCredentials}
                onViewLogs={handleViewLogs}
                onSync={handleSync}
                isSyncing={syncingOTAs.includes(ota.code)}
              />
            ))
          )}
        </section>
      </main>

      {/* Add Connection Modal */}
      <AddConnectionModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onConnect={handleConnect}
        existingConnections={otas}
      />

      {/* Edit Credentials Modal */}
      <EditCredentialsModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedOTA(null);
        }}
        ota={selectedOTA}
        onSave={handleSaveCredentials}
      />

      {/* Disconnect OTA Modal */}
      <DisconnectOTAModal
        isOpen={showDisconnectModal}
        onClose={() => {
          setShowDisconnectModal(false);
          setOtaToDisconnect(null);
        }}
        ota={otaToDisconnect}
        onConfirm={handleConfirmDisconnect}
      />
    </div>
  );
}
