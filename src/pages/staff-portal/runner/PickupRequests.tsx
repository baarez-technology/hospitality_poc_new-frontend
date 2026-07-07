import { useState, useMemo } from 'react';
import {
  Package,
  Clock,
  CheckCircle,
  User,
  MapPin,
  MessageSquare,
  Loader2,
  Search,
  ChevronRight,
  ChevronDown,
  X
} from 'lucide-react';
import PageHeader from '../../../layouts/staff-portal/PageHeader';
import { StatCard } from '../../../components/staff-portal/ui/Card';
import { StatusBadge, PriorityBadge } from '../../../components/staff-portal/ui/Badge';
import Button from '../../../components/staff-portal/ui/Button';
import { usePickupRequests, useRunnerActions } from '@/hooks/staff-portal/useStaffApi';

/**
 * Glimmora Design System v5.0 - Runner Pickup Requests
 * Matching admin dashboard styling patterns
 */

// Section Card matching admin LuxurySectionCard
function SectionCard({
  title,
  subtitle,
  action,
  actionLabel,
  children,
  className = '',
  noPadding = false
}: {
  title?: string;
  subtitle?: string;
  action?: () => void;
  actionLabel?: string;
  children: React.ReactNode;
  className?: string;
  noPadding?: boolean;
}) {
  return (
    <div className={`rounded-[10px] bg-white overflow-hidden ${className}`}>
      {(title || action) && (
        <div className="flex items-center justify-between px-4 sm:px-6 py-4 sm:py-5 border-b border-neutral-100 flex-shrink-0">
          <div>
            {title && (
              <h3 className="text-sm font-semibold text-neutral-800">
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="text-[11px] text-neutral-400 font-medium mt-0.5">{subtitle}</p>
            )}
          </div>
          {action && (
            <button
              onClick={action}
              className="flex items-center gap-1 text-[11px] font-semibold text-terra-600 px-3 py-1.5 rounded-lg hover:bg-terra-50 transition-colors"
            >
              {actionLabel} <ChevronRight className="w-3 h-3" />
            </button>
          )}
        </div>
      )}
      <div className={noPadding ? '' : 'px-4 sm:px-6 pb-4 sm:pb-6'}>{children}</div>
    </div>
  );
}

const PickupRequests = () => {
  // API hooks for real data
  const { data: pendingPickups, loading: pendingLoading, refetch: refetchPending } = usePickupRequests({ status: 'pending' });
  const { data: inProgressPickups, loading: inProgressLoading, refetch: refetchInProgress } = usePickupRequests({ status: 'in_progress' });
  const { data: completedPickups, loading: completedLoading, refetch: refetchCompleted } = usePickupRequests({ status: 'completed' });
  const { acceptPickup, completePickup, loading: actionLoading } = useRunnerActions();

  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Combine all pickups
  const allPickups = useMemo(() => {
    return [...(pendingPickups || []), ...(inProgressPickups || []), ...(completedPickups || [])];
  }, [pendingPickups, inProgressPickups, completedPickups]);

  // Stats
  const stats = useMemo(() => ({
    all: allPickups.length,
    pending: pendingPickups?.length || 0,
    in_progress: inProgressPickups?.length || 0,
    completed: completedPickups?.length || 0
  }), [allPickups, pendingPickups, inProgressPickups, completedPickups]);

  const filteredPickups = useMemo(() => {
    return allPickups.filter(pickup => {
      const matchesSearch =
        pickup.room_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        pickup.guest_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        pickup.items_description?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = statusFilter === 'all' || pickup.status === statusFilter;

      return matchesSearch && matchesStatus;
    }).sort((a, b) => {
      const priorityOrder: Record<string, number> = { urgent: 0, high: 1, normal: 2, low: 3 };
      const statusOrder: Record<string, number> = { pending: 0, in_progress: 1, completed: 2 };

      if (statusOrder[a.status] !== statusOrder[b.status]) {
        return statusOrder[a.status] - statusOrder[b.status];
      }
      return (priorityOrder[a.priority] || 2) - (priorityOrder[b.priority] || 2);
    });
  }, [allPickups, searchQuery, statusFilter]);

  const refetchAll = async () => {
    await Promise.all([refetchPending(), refetchInProgress(), refetchCompleted()]);
  };

  const isLoading = pendingLoading || inProgressLoading || completedLoading;

  const formatTime = (timestamp: string) => {
    if (!timestamp) return 'N/A';
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatDate = (timestamp: string) => {
    if (!timestamp) return 'N/A';
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      luggage: 'Luggage',
      laundry: 'Laundry',
      amenity_request: 'Amenity',
      package: 'Package',
      other: 'Other'
    };
    return labels[type] || type;
  };

  const getTypeIcon = (type: string) => {
    return <Package className="w-4.5 h-4.5" />;
  };

  const getTypeBgClass = (type: string) => {
    switch (type) {
      case 'luggage':
        return 'bg-terra-50 text-terra-600';
      case 'laundry':
        return 'bg-ocean-50 text-ocean-600';
      case 'amenity_request':
        return 'bg-gold-50 text-gold-600';
      case 'package':
        return 'bg-sage-50 text-sage-600';
      default:
        return 'bg-neutral-100 text-neutral-600';
    }
  };

  const handleAccept = async (pickup: any, e?: React.MouseEvent) => {
    e?.stopPropagation();
    const success = await acceptPickup(pickup.id);
    if (success) refetchAll();
  };

  const handleComplete = async (pickup: any, e?: React.MouseEvent) => {
    e?.stopPropagation();
    const success = await completePickup(pickup.id);
    if (success) refetchAll();
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <div className="w-14 h-14 rounded-2xl bg-terra-50 flex items-center justify-center">
          <Loader2 className="w-7 h-7 animate-spin text-terra-600" />
        </div>
        <span className="text-[13px] text-neutral-500 font-medium">Loading pickup requests...</span>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Pickup Requests"
        subtitle={`${stats.pending + stats.in_progress} active requests`}
      />

      {/* KPI Cards - 12 Column Grid matching admin dashboard */}
      <div className="grid grid-cols-12 gap-4 sm:gap-6 mb-4 sm:mb-6">
        <div className="col-span-12 sm:col-span-6 xl:col-span-4">
          <StatCard
            title="Pending"
            value={stats.pending}
            subtitle="Awaiting pickup"
            icon={Clock}
            color="gold"
            onClick={() => setStatusFilter(statusFilter === 'pending' ? 'all' : 'pending')}
          />
        </div>
        <div className="col-span-12 sm:col-span-6 xl:col-span-4">
          <StatCard
            title="In Progress"
            value={stats.in_progress}
            subtitle="Currently handling"
            icon={Package}
            color="terra"
            onClick={() => setStatusFilter(statusFilter === 'in_progress' ? 'all' : 'in_progress')}
          />
        </div>
        <div className="col-span-12 sm:col-span-6 xl:col-span-4">
          <StatCard
            title="Completed"
            value={stats.completed}
            subtitle="Successfully delivered"
            icon={CheckCircle}
            color="sage"
            onClick={() => setStatusFilter(statusFilter === 'completed' ? 'all' : 'completed')}
          />
        </div>
      </div>

      {/* Search & Filters - matching admin OTA Connections style */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
        {/* Search */}
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input
            type="text"
            placeholder="Search by room, guest, or items..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-11 pl-11 pr-10 rounded-lg text-[13px] bg-white border border-neutral-200 text-neutral-700 placeholder:text-neutral-400 hover:border-neutral-300 focus:outline-none focus:ring-2 focus:ring-terra-500/20 focus:border-terra-500 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 transition-all"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Filter Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className="h-11 w-full sm:w-[180px] px-4 pr-10 rounded-lg text-[13px] bg-white border border-neutral-200 text-neutral-600 hover:border-neutral-300 focus:outline-none focus:ring-2 focus:ring-terra-500/20 focus:border-terra-500 transition-all flex items-center justify-between"
          >
            <span>
              {statusFilter === 'all' && `All (${stats.all})`}
              {statusFilter === 'pending' && `Pending (${stats.pending})`}
              {statusFilter === 'in_progress' && `In Progress (${stats.in_progress})`}
              {statusFilter === 'completed' && `Completed (${stats.completed})`}
            </span>
            <ChevronDown className={`w-4 h-4 text-neutral-400 transition-transform ${isFilterOpen ? 'rotate-180' : ''}`} />
          </button>

          {isFilterOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setIsFilterOpen(false)} />
              <div className="absolute right-0 mt-2 w-[180px] bg-white rounded-lg border border-neutral-200 shadow-lg z-20 py-1 overflow-hidden">
                {[
                  { value: 'all', label: 'All', count: stats.all },
                  { value: 'pending', label: 'Pending', count: stats.pending },
                  { value: 'in_progress', label: 'In Progress', count: stats.in_progress },
                  { value: 'completed', label: 'Completed', count: stats.completed }
                ].map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => {
                      setStatusFilter(option.value);
                      setIsFilterOpen(false);
                    }}
                    className={`w-full px-4 py-2.5 text-[13px] text-left transition-colors flex items-center justify-between ${
                      statusFilter === option.value
                        ? 'bg-terra-50 text-terra-600 font-medium'
                        : 'text-neutral-600 hover:bg-neutral-50'
                    }`}
                  >
                    <span>{option.label}</span>
                    <span className={`text-[11px] tabular-nums ${
                      statusFilter === option.value ? 'text-terra-500' : 'text-neutral-400'
                    }`}>
                      {option.count}
                    </span>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Pickup Requests List */}
      <div className="grid grid-cols-12 gap-4 sm:gap-6">
        <div className="col-span-12">
          <SectionCard
            title="All Pickup Requests"
            subtitle={`${filteredPickups.length} request${filteredPickups.length !== 1 ? 's' : ''}`}
            noPadding
          >
            {filteredPickups.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 sm:py-16 px-4 sm:px-6">
                <div className="w-16 h-16 rounded-2xl bg-neutral-100 flex items-center justify-center mb-4">
                  <Package className="w-8 h-8 text-neutral-400" />
                </div>
                <h3 className="text-[13px] font-semibold text-neutral-800 mb-1">No pickup requests found</h3>
                <p className="text-[11px] text-neutral-500 text-center max-w-xs">
                  {searchQuery ? `No requests match "${searchQuery}".` : 'New requests will appear here.'}
                </p>
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="mt-4 px-4 py-2 text-[13px] font-medium text-terra-600 bg-terra-50 hover:bg-terra-100 rounded-lg transition-colors"
                  >
                    Clear search
                  </button>
                )}
              </div>
            ) : (
              <div className="px-4 sm:px-6 pb-4 sm:pb-6 space-y-3">
                {filteredPickups.map((pickup) => (
                  <div
                    key={pickup.id}
                    className={`
                      relative p-3 sm:p-4 rounded-lg transition-colors
                      ${pickup.priority === 'urgent' ? 'bg-rose-50/50 border-l-4 border-l-rose-500' :
                        pickup.status === 'in_progress' ? 'bg-terra-50/30' :
                        pickup.status === 'completed' ? 'bg-sage-50/30' :
                        'bg-neutral-50/50 hover:bg-neutral-50'}
                    `}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-4">
                      {/* Type Icon - hidden on mobile, shows inline badge instead */}
                      <div className={`hidden sm:flex w-10 h-10 rounded-lg items-center justify-center flex-shrink-0 ${getTypeBgClass(pickup.pickup_type)}`}>
                        {getTypeIcon(pickup.pickup_type)}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-4">
                          <div>
                            <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                              <span className="text-[13px] font-semibold text-neutral-800">Room {pickup.room_number}</span>
                              <span className={`text-[11px] font-medium px-2 py-0.5 rounded ${getTypeBgClass(pickup.pickup_type)}`}>
                                {getTypeLabel(pickup.pickup_type)}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 mt-1 flex-wrap">
                              <StatusBadge status={pickup.status} />
                              {pickup.priority !== 'normal' && <PriorityBadge priority={pickup.priority} />}
                            </div>
                          </div>

                          <div className="flex gap-2 flex-shrink-0 mt-2 sm:mt-0">
                            {pickup.status === 'pending' && (
                              <Button
                                size="sm"
                                onClick={(e) => handleAccept(pickup, e)}
                                disabled={actionLoading}
                                className="flex-1 sm:flex-none"
                              >
                                Accept
                              </Button>
                            )}
                            {pickup.status === 'in_progress' && (
                              <Button
                                size="sm"
                                variant="success"
                                onClick={(e) => handleComplete(pickup, e)}
                                disabled={actionLoading}
                                className="flex-1 sm:flex-none"
                              >
                                Complete
                              </Button>
                            )}
                            {pickup.status === 'completed' && (
                              <div className="flex items-center gap-1.5 text-sage-600">
                                <CheckCircle className="w-4 h-4" />
                                <span className="text-[12px] font-semibold">Completed</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Items Description */}
                        <div className="mt-3 p-2.5 sm:p-3 bg-white rounded-lg border border-neutral-100">
                          <p className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wide mb-1">Items</p>
                          <p className="text-[12px] sm:text-[13px] text-neutral-700">{pickup.items_description}</p>
                        </div>

                        {/* Details Grid */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mt-3 sm:mt-4">
                          <div>
                            <div className="flex items-center gap-1.5 mb-1">
                              <User className="w-3 h-3 text-neutral-400" />
                              <span className="text-[10px] font-medium text-neutral-400 uppercase tracking-wide">Guest</span>
                            </div>
                            <p className="text-[11px] sm:text-[12px] font-semibold text-neutral-700 truncate">{pickup.guest_name}</p>
                          </div>

                          <div>
                            <div className="flex items-center gap-1.5 mb-1">
                              <MapPin className="w-3 h-3 text-neutral-400" />
                              <span className="text-[10px] font-medium text-neutral-400 uppercase tracking-wide">Pickup</span>
                            </div>
                            <p className="text-[11px] sm:text-[12px] font-semibold text-neutral-700 truncate">{pickup.pickup_location || 'Room'}</p>
                          </div>

                          <div>
                            <div className="flex items-center gap-1.5 mb-1">
                              <MapPin className="w-3 h-3 text-neutral-400" />
                              <span className="text-[10px] font-medium text-neutral-400 uppercase tracking-wide">Destination</span>
                            </div>
                            <p className="text-[11px] sm:text-[12px] font-semibold text-neutral-700 truncate">{pickup.destination || 'N/A'}</p>
                          </div>

                          <div>
                            <div className="flex items-center gap-1.5 mb-1">
                              <Clock className="w-3 h-3 text-neutral-400" />
                              <span className="text-[10px] font-medium text-neutral-400 uppercase tracking-wide">Scheduled</span>
                            </div>
                            <p className="text-[11px] sm:text-[12px] font-semibold text-neutral-700">{formatTime(pickup.scheduled_time || '')}</p>
                          </div>
                        </div>

                        {/* Notes */}
                        {pickup.notes && (
                          <div className="mt-3 sm:mt-4 p-2.5 sm:p-3 bg-gold-50/50 rounded-lg border border-gold-100">
                            <div className="flex items-center gap-1.5 mb-1">
                              <MessageSquare className="w-3 h-3 text-gold-600" />
                              <span className="text-[10px] font-semibold text-gold-600 uppercase tracking-wide">Notes</span>
                            </div>
                            <p className="text-[11px] sm:text-[12px] text-neutral-700">{pickup.notes}</p>
                          </div>
                        )}

                        {/* Footer */}
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3 mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-neutral-100 text-[10px] sm:text-[11px] text-neutral-500">
                          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                            <span>Requested: {formatDate(pickup.requested_at || '')}</span>
                            {pickup.assigned_to_name && (
                              <span>Assigned to: <span className="font-semibold text-neutral-700">{pickup.assigned_to_name}</span></span>
                            )}
                          </div>
                          {pickup.completed_at && (
                            <span className="text-sage-600 font-medium">Completed: {formatDate(pickup.completed_at)}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </SectionCard>
        </div>
      </div>
    </div>
  );
};

export default PickupRequests;
