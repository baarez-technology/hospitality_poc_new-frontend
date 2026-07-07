import { useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Package,
  Truck,
  Clock,
  CheckCircle,
  ChevronRight,
  MapPin,
  User,
  AlertTriangle,
  Loader2
} from 'lucide-react';
import { DashboardHeader } from '../../../layouts/staff-portal/PageHeader';
import { StatCard } from '../../../components/staff-portal/ui/Card';
import { StatusBadge, PriorityBadge } from '../../../components/staff-portal/ui/Badge';
import Button from '../../../components/staff-portal/ui/Button';
import { useProfile } from '@/hooks/staff-portal/useStaffPortal';
import {
  useStaffProfile,
  useMyRunnerDashboard,
  usePickupRequests,
  useDeliveries,
  useNotifications,
  useRunnerActions
} from '@/hooks/staff-portal/useStaffApi';

/**
 * Glimmora Design System v5.0 - Runner Dashboard
 * Matching admin dashboard styling patterns with improved responsiveness
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
          <div className="min-w-0">
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
              className="flex items-center gap-1 text-[11px] font-semibold text-terra-600 px-3 py-1.5 rounded-lg hover:bg-terra-50 transition-colors flex-shrink-0"
            >
              <span className="hidden xs:inline">{actionLabel}</span>
              <span className="xs:hidden">View</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          )}
        </div>
      )}
      <div className={noPadding ? '' : 'px-4 sm:px-6 pb-4 sm:pb-6'}>{children}</div>
    </div>
  );
}

const RunnerDashboard = () => {
  const navigate = useNavigate();
  const { profile: contextProfile } = useProfile();
  const { data: profile } = useStaffProfile();

  // API hooks for real data
  const { data: dashboardData, loading: dashboardLoading, refetch: refetchDashboard } = useMyRunnerDashboard();
  const { data: pickupRequests, loading: pickupsLoading, refetch: refetchPickups } = usePickupRequests({ status: 'pending' });
  const { data: inProgressPickups, refetch: refetchInProgressPickups } = usePickupRequests({ status: 'in_progress' });
  const { data: deliveriesData, loading: deliveriesLoading, refetch: refetchDeliveries } = useDeliveries({ status: 'pending' });
  const { data: inTransitDeliveries, refetch: refetchInTransitDeliveries } = useDeliveries({ status: 'in_transit' });
  const { data: notifications } = useNotifications({ is_read: false, limit: 10 });
  const { acceptPickup, completePickup, acceptDelivery, completeDelivery, loading: actionLoading } = useRunnerActions();

  // Combine pickups and deliveries
  const allPickups = useMemo(() => {
    return [...(pickupRequests || []), ...(inProgressPickups || [])];
  }, [pickupRequests, inProgressPickups]);

  const allDeliveries = useMemo(() => {
    return [...(deliveriesData || []), ...(inTransitDeliveries || [])];
  }, [deliveriesData, inTransitDeliveries]);

  // Stats from dashboard API
  const stats = useMemo(() => ({
    pendingPickups: dashboardData?.active_pickups || 0,
    inProgressPickups: inProgressPickups?.length || 0,
    urgentPickups: allPickups.filter(p => p.priority === 'urgent').length,
    pendingDeliveries: dashboardData?.active_deliveries || 0,
    inTransitDeliveries: inTransitDeliveries?.length || 0,
    completedPickups: dashboardData?.completed_today || 0,
    deliveredDeliveries: dashboardData?.completed_deliveries_today || 0,
    totalPickups: allPickups.length,
    totalDeliveries: allDeliveries.length
  }), [dashboardData, allPickups, allDeliveries, inProgressPickups, inTransitDeliveries]);

  const averageCompletionTime = useMemo(() => {
    if (dashboardData?.avg_completion_time) {
      return `${dashboardData.avg_completion_time}m`;
    }
    return '0m';
  }, [dashboardData]);

  // Prefer context clockedIn (updated instantly on clock actions) over stale API data.
  // Use ?? (not ||) so that an explicit `false` from context is respected.
  const isClockedIn = contextProfile?.clockedIn ?? profile?.clocked_in ?? false;
  const shiftStartTime = profile?.shift_start || contextProfile?.shiftStart;
  const shiftEndTime = profile?.shift_end || contextProfile?.shiftEnd;

  // Tick every 60s so shift hours left & hours worked update while clocked in
  const [minuteTick, setMinuteTick] = useState(0);
  useEffect(() => {
    if (!isClockedIn) return;
    const id = setInterval(() => setMinuteTick(t => t + 1), 60_000);
    return () => clearInterval(id);
  }, [isClockedIn]);

  const shiftHoursLeft = useMemo(() => {
    if (!shiftEndTime) return null;

    if (isClockedIn) {
      // Show remaining hours when clocked in
      const [endHour, endMin] = shiftEndTime.split(':').map(Number);
      const now = new Date();
      const shiftEnd = new Date();
      shiftEnd.setHours(endHour, endMin, 0);

      const diffMs = shiftEnd.getTime() - now.getTime();
      if (diffMs <= 0) return '0h 0m';

      const hours = Math.floor(diffMs / 3600000);
      const minutes = Math.floor((diffMs % 3600000) / 60000);
      return `${hours}h ${minutes}m`;
    }

    // Show total shift duration when not clocked in
    if (shiftStartTime) {
      const [sh, sm] = shiftStartTime.split(':').map(Number);
      const [eh, em] = shiftEndTime.split(':').map(Number);
      let diff = (eh * 60 + em) - (sh * 60 + sm);
      if (diff < 0) diff += 24 * 60;
      const hours = Math.floor(diff / 60);
      const mins = diff % 60;
      return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
    }

    return null;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shiftStartTime, shiftEndTime, isClockedIn, minuteTick]);

  // Calculate cumulative hours worked today from clock history
  const hoursWorkedToday = useMemo(() => {
    const history = contextProfile?.clockHistory || [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayEntries = history
      .filter((e: any) => new Date(e.timestamp) >= today)
      .sort((a: any, b: any) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    let totalMs = 0;
    let lastClockIn: Date | null = null;

    for (const entry of todayEntries) {
      const time = new Date(entry.timestamp);
      if (entry.action === 'clock_in') {
        lastClockIn = time;
      } else if (entry.action === 'clock_out' && lastClockIn) {
        totalMs += time.getTime() - lastClockIn.getTime();
        lastClockIn = null;
      }
    }

    if (lastClockIn && isClockedIn) {
      totalMs += Date.now() - lastClockIn.getTime();
    }

    if (totalMs <= 0) return null;
    const hours = Math.floor(totalMs / 3600000);
    const minutes = Math.floor((totalMs % 3600000) / 60000);
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contextProfile?.clockHistory, isClockedIn, minuteTick]);

  // Calculate if staff clocked in late (first clock-in today vs scheduled shift start)
  const lateBy = useMemo(() => {
    if (!shiftStartTime || !isClockedIn) return null;
    const history = contextProfile?.clockHistory || [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayClockIns = history
      .filter((e: any) => e.action === 'clock_in' && new Date(e.timestamp) >= today)
      .sort((a: any, b: any) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

    if (todayClockIns.length === 0) return null;

    const firstClockIn = new Date(todayClockIns[0].timestamp);
    const [sh, sm] = shiftStartTime.split(':').map(Number);
    const scheduledStart = new Date();
    scheduledStart.setHours(sh, sm, 0, 0);

    const diffMs = firstClockIn.getTime() - scheduledStart.getTime();
    if (diffMs <= 60000) return null; // Grace period: 1 minute

    const mins = Math.floor(diffMs / 60000);
    return mins >= 60 ? `${Math.floor(mins / 60)}h ${mins % 60}m` : `${mins}m`;
  }, [shiftStartTime, isClockedIn, contextProfile?.clockHistory]);

  const activePickups = useMemo(() => {
    return allPickups
      .sort((a, b) => {
        const priorityOrder: Record<string, number> = { urgent: 0, high: 1, normal: 2, low: 3 };
        return (priorityOrder[a.priority] || 2) - (priorityOrder[b.priority] || 2);
      })
      .slice(0, 4);
  }, [allPickups]);

  const activeDeliveries = useMemo(() => {
    return allDeliveries
      .sort((a, b) => {
        const priorityOrder: Record<string, number> = { urgent: 0, high: 1, normal: 2, low: 3 };
        return (priorityOrder[a.priority] || 2) - (priorityOrder[b.priority] || 2);
      })
      .slice(0, 4);
  }, [allDeliveries]);

  const urgentNotifications = useMemo(() => {
    if (!notifications) return [];
    return notifications
      .filter(n => n.notification_type === 'alert' || n.notification_type === 'task_assigned')
      .slice(0, 3);
  }, [notifications]);

  // Refetch data after actions
  const refetchAll = async () => {
    await Promise.all([
      refetchDashboard(),
      refetchPickups(),
      refetchInProgressPickups(),
      refetchDeliveries(),
      refetchInTransitDeliveries()
    ]);
  };

  const formatTime = (timestamp: string) => {
    if (!timestamp) return 'N/A';
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  // Track which specific item is loading
  const [loadingItemId, setLoadingItemId] = useState<number | null>(null);

  const handleAcceptPickup = async (pickup: any, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setLoadingItemId(pickup.id);
    try {
      const success = await acceptPickup(pickup.id);
      if (success) refetchAll();
    } catch (err) {
      console.error('Failed to accept pickup:', err);
    } finally {
      setLoadingItemId(null);
    }
  };

  const handleCompletePickup = async (pickup: any, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setLoadingItemId(pickup.id);
    try {
      const success = await completePickup(pickup.id);
      if (success) refetchAll();
    } catch (err) {
      console.error('Failed to complete pickup:', err);
    } finally {
      setLoadingItemId(null);
    }
  };

  const handleAcceptDelivery = async (delivery: any, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setLoadingItemId(delivery.id);
    try {
      const success = await acceptDelivery(delivery.id);
      if (success) refetchAll();
    } catch (err) {
      console.error('Failed to accept delivery:', err);
    } finally {
      setLoadingItemId(null);
    }
  };

  const handleCompleteDelivery = async (delivery: any, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setLoadingItemId(delivery.id);
    try {
      const success = await completeDelivery(delivery.id);
      if (success) refetchAll();
    } catch (err) {
      console.error('Failed to complete delivery:', err);
    } finally {
      setLoadingItemId(null);
    }
  };

  // Show loading state
  const isLoading = dashboardLoading || pickupsLoading || deliveriesLoading;

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'luggage':
        return <Package className="w-4.5 h-4.5 text-terra-600" />;
      case 'laundry':
        return <Package className="w-4.5 h-4.5 text-ocean-600" />;
      case 'amenity_request':
        return <Package className="w-4.5 h-4.5 text-gold-600" />;
      case 'room_service':
        return <Package className="w-4.5 h-4.5 text-sage-600" />;
      case 'package':
        return <Package className="w-4.5 h-4.5 text-neutral-600" />;
      default:
        return <Package className="w-4.5 h-4.5 text-neutral-500" />;
    }
  };

  const getTypeBgClass = (type: string) => {
    switch (type) {
      case 'luggage':
        return 'bg-terra-50';
      case 'laundry':
        return 'bg-ocean-50';
      case 'amenity_request':
        return 'bg-gold-50';
      case 'room_service':
        return 'bg-sage-50';
      default:
        return 'bg-neutral-100';
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <div className="w-14 h-14 rounded-2xl bg-terra-50 flex items-center justify-center">
          <Loader2 className="w-7 h-7 animate-spin text-terra-600" />
        </div>
        <span className="text-[13px] text-neutral-500 font-medium">Loading dashboard...</span>
      </div>
    );
  }

  return (
    <div>
      <DashboardHeader name={profile?.name} />

      {/* KPI Cards - 12 Column Grid matching admin dashboard */}
      <div className="grid grid-cols-12 gap-6 mb-6">
        <div className="col-span-12 sm:col-span-6 xl:col-span-3">
          <StatCard
            title="Active Pickups"
            value={stats.pendingPickups + stats.inProgressPickups}
            subtitle={`${stats.urgentPickups} urgent`}
            icon={Package}
            color="terra"
          />
        </div>
        <div className="col-span-12 sm:col-span-6 xl:col-span-3">
          <StatCard
            title="Active Deliveries"
            value={stats.pendingDeliveries + stats.inTransitDeliveries}
            subtitle={`${stats.inTransitDeliveries} in transit`}
            icon={Truck}
            color="ocean"
          />
        </div>
        <div className="col-span-12 sm:col-span-6 xl:col-span-3">
          <StatCard
            title="Avg Completion"
            value={averageCompletionTime}
            subtitle="Per delivery"
            icon={Clock}
            color="gold"
          />
        </div>
        <div className="col-span-12 sm:col-span-6 xl:col-span-3">
          <StatCard
            title={isClockedIn ? 'Shift Hours Left' : 'Shift Duration'}
            value={shiftHoursLeft || '--'}
            subtitle={isClockedIn ? (hoursWorkedToday ? `${hoursWorkedToday} worked today${lateBy ? ` · Late ${lateBy}` : ''}` : (lateBy ? `Late by ${lateBy}` : 'Just clocked in')) : 'Not clocked in'}
            icon={Clock}
            color="sage"
          />
        </div>
      </div>

      {/* Main Content - 12 Column Grid */}
      <div className="grid grid-cols-12 gap-6 mb-6">
        {/* Active Pickups - 8 columns */}
        <div className="col-span-12 xl:col-span-8">
          <SectionCard
            title="Active Pickups"
            subtitle={`${activePickups.length} pickup${activePickups.length !== 1 ? 's' : ''} pending`}
            action={() => navigate('/staff/runner/pickups')}
            actionLabel="View All"
            className="h-full"
          >
            {activePickups.length === 0 ? (
              <div className="text-center py-8 sm:py-12">
                <Package className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
                <p className="text-[13px] font-medium text-neutral-600 mb-1">No active pickups</p>
                <p className="text-[11px] text-neutral-400">New pickup requests will appear here</p>
              </div>
            ) : (
              <div className="space-y-3 pt-4">
                {activePickups.map((pickup) => (
                  <div
                    key={pickup.id}
                    onClick={() => navigate('/staff/runner/pickups')}
                    className={`
                      flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-lg transition-colors cursor-pointer
                      ${pickup.priority === 'urgent' ? 'bg-rose-50/50 border-l-4 border-l-rose-500' :
                        pickup.status === 'in_progress' ? 'bg-gold-50/50' :
                        'bg-neutral-50/50 hover:bg-neutral-50'}
                    `}
                  >
                    {/* Top row on mobile: Icon + Content */}
                    <div className="flex items-start gap-3 sm:gap-4 flex-1 min-w-0">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${getTypeBgClass(pickup.pickup_type)}`}>
                        {getTypeIcon(pickup.pickup_type)}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-0.5">
                          <span className="text-[13px] font-semibold text-neutral-800">Room {pickup.room_number}</span>
                          <StatusBadge status={pickup.status} />
                          {pickup.priority !== 'normal' && <PriorityBadge priority={pickup.priority} />}
                        </div>
                        <p className="text-[11px] sm:text-[12px] text-neutral-600 truncate mb-1">{pickup.items_description}</p>
                        <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-[11px] text-neutral-500">
                          <div className="flex items-center gap-1">
                            <User className="w-3 h-3 text-neutral-400" />
                            <span className="font-medium truncate max-w-[100px] sm:max-w-none">{pickup.guest_name}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-neutral-400" />
                            <span>{formatTime(pickup.scheduled_time || '')}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Bottom row on mobile: Actions */}
                    <div className="flex items-center justify-end gap-2 sm:flex-shrink-0 pl-13 sm:pl-0">
                      {pickup.status === 'pending' && (
                        <Button
                          size="sm"
                          onClick={(e) => handleAcceptPickup(pickup, e)}
                          disabled={loadingItemId === pickup.id}
                          isLoading={loadingItemId === pickup.id}
                        >
                          Accept
                        </Button>
                      )}
                      {pickup.status === 'in_progress' && (
                        <Button
                          size="sm"
                          variant="success"
                          onClick={(e) => handleCompletePickup(pickup, e)}
                          disabled={loadingItemId === pickup.id}
                          isLoading={loadingItemId === pickup.id}
                        >
                          Complete
                        </Button>
                      )}
                      <ChevronRight className="w-3.5 h-3.5 text-neutral-300 hidden sm:block" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </SectionCard>
        </div>

        {/* Quick Actions - 4 columns on desktop, full width on mobile */}
        <div className="col-span-12 xl:col-span-4">
          <SectionCard
            title="Quick Actions"
            subtitle="Common tasks"
            className="h-full"
          >
            <div className="grid grid-cols-1 sm:grid-cols-3 xl:grid-cols-1 gap-3 pt-4">
              <button
                onClick={() => navigate('/staff/runner/pickups')}
                className="w-full flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-lg bg-terra-50 text-left hover:bg-terra-100 transition-all group"
              >
                <div className="w-10 h-10 rounded-lg bg-terra-100 flex items-center justify-center flex-shrink-0">
                  <Package className="w-4.5 h-4.5 text-terra-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-semibold text-neutral-800 mb-0.5">View All Pickups</p>
                  <p className="text-[11px] text-neutral-400 font-medium">{stats.totalPickups} total</p>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-neutral-300 group-hover:text-terra-600 group-hover:translate-x-0.5 transition-all flex-shrink-0" />
              </button>

              <button
                onClick={() => navigate('/staff/runner/deliveries')}
                className="w-full flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-lg bg-ocean-50/50 text-left hover:bg-ocean-50 transition-all group"
              >
                <div className="w-10 h-10 rounded-lg bg-ocean-100 flex items-center justify-center flex-shrink-0">
                  <Truck className="w-4.5 h-4.5 text-ocean-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-semibold text-neutral-800 mb-0.5">View All Deliveries</p>
                  <p className="text-[11px] text-neutral-400 font-medium">{stats.totalDeliveries} total</p>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-neutral-300 group-hover:text-ocean-600 group-hover:translate-x-0.5 transition-all flex-shrink-0" />
              </button>

              <button
                onClick={() => navigate('/staff/notifications')}
                className="w-full flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-lg bg-gold-50/50 text-left hover:bg-gold-50 transition-all group"
              >
                <div className="w-10 h-10 rounded-lg bg-gold-100 flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="w-4.5 h-4.5 text-gold-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-semibold text-neutral-800 mb-0.5">Notifications</p>
                  <p className="text-[11px] text-neutral-400 font-medium">{urgentNotifications.length} alerts</p>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-neutral-300 group-hover:text-gold-600 group-hover:translate-x-0.5 transition-all flex-shrink-0" />
              </button>
            </div>
          </SectionCard>
        </div>
      </div>

      {/* Active Deliveries & Today's Summary - 8 + 4 = 12 columns */}
      <div className="grid grid-cols-12 gap-6">
        {/* Active Deliveries - 8 columns */}
        <div className="col-span-12 xl:col-span-8">
          <SectionCard
            title="Active Deliveries"
            subtitle={`${activeDeliveries.length} deliver${activeDeliveries.length !== 1 ? 'ies' : 'y'} pending`}
            action={() => navigate('/staff/runner/deliveries')}
            actionLabel="View All"
            className="h-full"
          >
            {activeDeliveries.length === 0 ? (
              <div className="text-center py-8 sm:py-12">
                <Truck className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
                <p className="text-[13px] font-medium text-neutral-600 mb-1">No active deliveries</p>
                <p className="text-[11px] text-neutral-400">New delivery requests will appear here</p>
              </div>
            ) : (
              <div className="space-y-3 pt-4">
                {activeDeliveries.map((delivery) => (
                  <div
                    key={delivery.id}
                    onClick={() => navigate('/staff/runner/deliveries')}
                    className={`
                      flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-lg transition-colors cursor-pointer
                      ${delivery.status === 'in_transit' ? 'bg-ocean-50/50 border-l-4 border-l-ocean-500' :
                        'bg-neutral-50/50 hover:bg-neutral-50'}
                    `}
                  >
                    {/* Top row on mobile: Icon + Content */}
                    <div className="flex items-start gap-3 sm:gap-4 flex-1 min-w-0">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${getTypeBgClass(delivery.delivery_type)}`}>
                        {getTypeIcon(delivery.delivery_type)}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-0.5">
                          <span className="text-[13px] font-semibold text-neutral-800">Room {delivery.room_number}</span>
                          <StatusBadge status={delivery.status} />
                          {delivery.priority !== 'normal' && <PriorityBadge priority={delivery.priority} />}
                        </div>
                        <p className="text-[11px] sm:text-[12px] text-neutral-600 truncate mb-1">{delivery.items_description}</p>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 text-[11px] text-neutral-500">
                          <div className="flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-neutral-400 flex-shrink-0" />
                            <span className="font-medium truncate">{delivery.origin_location} → {delivery.destination_location}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-neutral-400 flex-shrink-0" />
                            <span>ETA: {formatTime(delivery.estimated_delivery_time || '')}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Bottom row on mobile: Actions */}
                    <div className="flex items-center justify-end gap-2 sm:flex-shrink-0 pl-13 sm:pl-0">
                      {delivery.status === 'pending' && (
                        <Button
                          size="sm"
                          onClick={(e) => handleAcceptDelivery(delivery, e)}
                          disabled={loadingItemId === delivery.id}
                          isLoading={loadingItemId === delivery.id}
                        >
                          Accept
                        </Button>
                      )}
                      {delivery.status === 'in_transit' && (
                        <Button
                          size="sm"
                          variant="success"
                          onClick={(e) => handleCompleteDelivery(delivery, e)}
                          disabled={loadingItemId === delivery.id}
                          isLoading={loadingItemId === delivery.id}
                        >
                          Delivered
                        </Button>
                      )}
                      <ChevronRight className="w-3.5 h-3.5 text-neutral-300 hidden sm:block" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </SectionCard>
        </div>

        {/* Today's Summary - 4 columns on desktop */}
        <div className="col-span-12 xl:col-span-4">
          <SectionCard
            title="Today's Summary"
            subtitle="Performance overview"
            className="h-full"
          >
            <div className="grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-1 gap-3 pt-4">
              <div className="flex items-center justify-between p-3 rounded-lg bg-neutral-50/50">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-terra-50 flex items-center justify-center flex-shrink-0">
                    <Package className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-terra-600" />
                  </div>
                  <span className="text-[12px] sm:text-[13px] text-neutral-600 font-medium">Pickups</span>
                </div>
                <span className="text-[14px] sm:text-[15px] font-bold text-neutral-900 tabular-nums">{stats.totalPickups}</span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-neutral-50/50">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-ocean-50 flex items-center justify-center flex-shrink-0">
                    <Truck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-ocean-600" />
                  </div>
                  <span className="text-[12px] sm:text-[13px] text-neutral-600 font-medium">Deliveries</span>
                </div>
                <span className="text-[14px] sm:text-[15px] font-bold text-neutral-900 tabular-nums">{stats.totalDeliveries}</span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-neutral-50/50">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-sage-50 flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-sage-600" />
                  </div>
                  <span className="text-[12px] sm:text-[13px] text-neutral-600 font-medium">Completed</span>
                </div>
                <span className="text-[14px] sm:text-[15px] font-bold text-neutral-900 tabular-nums">
                  {stats.completedPickups + stats.deliveredDeliveries}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-neutral-50/50">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-gold-50 flex items-center justify-center flex-shrink-0">
                    <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gold-600" />
                  </div>
                  <span className="text-[12px] sm:text-[13px] text-neutral-600 font-medium">In Progress</span>
                </div>
                <span className="text-[14px] sm:text-[15px] font-bold text-neutral-900 tabular-nums">
                  {stats.inProgressPickups + stats.inTransitDeliveries}
                </span>
              </div>
            </div>

            {/* Urgent Alerts */}
            {urgentNotifications.length > 0 && (
              <div className="mt-5 sm:mt-6 pt-5 sm:pt-6 border-t border-neutral-100">
                <div className="flex items-center gap-2 mb-3 sm:mb-4">
                  <AlertTriangle className="w-4 h-4 text-rose-600" />
                  <h4 className="text-sm font-semibold text-neutral-800">Urgent Alerts</h4>
                </div>
                <div className="space-y-2">
                  {urgentNotifications.map((notif) => (
                    <div
                      key={notif.id}
                      className="p-3 rounded-lg bg-rose-50/50 border-l-4 border-l-rose-500"
                    >
                      <p className="text-[13px] font-semibold text-neutral-800">{notif.title}</p>
                      <p className="text-[11px] text-neutral-500 mt-0.5 line-clamp-2">{notif.message}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </SectionCard>
        </div>
      </div>
    </div>
  );
};

export default RunnerDashboard;
