import { useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Wrench,
  ClipboardList,
  AlertTriangle,
  CheckCircle,
  Clock,
  ChevronRight,
  Play,
  AlertCircle,
  Loader2,
  Settings
} from 'lucide-react';
import { DashboardHeader } from '../../../layouts/staff-portal/PageHeader';
import { StatCard } from '../../../components/staff-portal/ui/Card';
import { StatusBadge, SeverityBadge } from '../../../components/staff-portal/ui/Badge';
import Button from '../../../components/staff-portal/ui/Button';
import { useStaffProfile, useMyMaintenanceDashboard, useWorkOrders, useEquipmentIssues, useNotifications, useMaintenanceActions } from '@/hooks/staff-portal/useStaffApi';
import { useProfile } from '@/hooks/staff-portal/useStaffPortal';
import { normalizeUTCDate } from '@/utils/maintenance';

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
      <div className={noPadding ? '' : 'px-4 sm:px-6 py-4 sm:pb-6'}>{children}</div>
    </div>
  );
}

const MaintenanceDashboard = () => {
  const navigate = useNavigate();
  const { data: profile } = useStaffProfile();
  const { profile: contextProfile } = useProfile();
  const { loading: dashboardLoading } = useMyMaintenanceDashboard();
  const { data: pendingWorkOrders, loading: pendingLoading, refetch: refetchPending } = useWorkOrders({ status: 'pending' });
  const { data: inProgressWorkOrders, loading: inProgressLoading, refetch: refetchInProgress } = useWorkOrders({ status: 'in_progress' });
  const { data: completedWorkOrders } = useWorkOrders({ status: 'completed' });
  const { data: equipmentIssues } = useEquipmentIssues();
  const { data: notifications } = useNotifications();
  const { acceptWorkOrder } = useMaintenanceActions();

  // Combine all work orders
  const workOrders = useMemo(() => {
    return [...(pendingWorkOrders || []), ...(inProgressWorkOrders || []), ...(completedWorkOrders || [])];
  }, [pendingWorkOrders, inProgressWorkOrders, completedWorkOrders]);

  const refetchAll = async () => {
    await Promise.all([refetchPending(), refetchInProgress()]);
  };

  const isLoading = dashboardLoading || pendingLoading || inProgressLoading;

  // Calculate stats from data
  const stats = useMemo(() => ({
    pendingWorkOrders: pendingWorkOrders?.length || 0,
    inProgressWorkOrders: inProgressWorkOrders?.length || 0,
    completedWorkOrders: completedWorkOrders?.length || 0,
    criticalWorkOrders: workOrders.filter(wo => wo.priority === 'critical' && wo.status !== 'completed').length,
    pendingTasks: workOrders.filter(wo => wo.status === 'pending').length,
    inProgressTasks: workOrders.filter(wo => wo.status === 'in_progress').length,
    completedTasks: completedWorkOrders?.length || 0,
    pendingIssues: equipmentIssues?.filter(i => i.status === 'pending').length || 0
  }), [pendingWorkOrders, inProgressWorkOrders, completedWorkOrders, workOrders, equipmentIssues]);

  // Prefer context clockedIn (updated instantly on clock actions) over stale API data.
  // Use ?? (not ||) so that an explicit `false` from context is respected.
  const isClockedIn = contextProfile?.clockedIn ?? profile?.clocked_in ?? false;
  const shiftStart = profile?.shift_start || contextProfile?.shiftStart;
  const shiftEnd = profile?.shift_end || contextProfile?.shiftEnd;

  // Tick every 60s so shift hours left & hours worked update while clocked in
  const [minuteTick, setMinuteTick] = useState(0);
  useEffect(() => {
    if (!isClockedIn) return;
    const id = setInterval(() => setMinuteTick(t => t + 1), 60_000);
    return () => clearInterval(id);
  }, [isClockedIn]);

  const shiftHoursLeft = useMemo(() => {
    if (!shiftEnd) return null;

    if (isClockedIn) {
      // Show remaining hours when clocked in
      const [endHour, endMin] = shiftEnd.split(':').map(Number);
      const now = new Date();
      const shiftEndTime = new Date();
      shiftEndTime.setHours(endHour, endMin, 0);

      const diffMs = shiftEndTime.getTime() - now.getTime();
      if (diffMs <= 0) return '0h 0m';

      const hours = Math.floor(diffMs / 3600000);
      const minutes = Math.floor((diffMs % 3600000) / 60000);
      return `${hours}h ${minutes}m`;
    }

    // Show total shift duration when not clocked in
    if (shiftStart) {
      const [sh, sm] = shiftStart.split(':').map(Number);
      const [eh, em] = shiftEnd.split(':').map(Number);
      let diff = (eh * 60 + em) - (sh * 60 + sm);
      if (diff < 0) diff += 24 * 60;
      const hours = Math.floor(diff / 60);
      const mins = diff % 60;
      return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
    }

    return null;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shiftStart, shiftEnd, isClockedIn, minuteTick]);

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
    if (!shiftStart || !isClockedIn) return null;
    const history = contextProfile?.clockHistory || [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayClockIns = history
      .filter((e: any) => e.action === 'clock_in' && new Date(e.timestamp) >= today)
      .sort((a: any, b: any) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

    if (todayClockIns.length === 0) return null;

    const firstClockIn = new Date(todayClockIns[0].timestamp);
    const [sh, sm] = shiftStart.split(':').map(Number);
    const scheduledStart = new Date();
    scheduledStart.setHours(sh, sm, 0, 0);

    const diffMs = firstClockIn.getTime() - scheduledStart.getTime();
    if (diffMs <= 60000) return null; // Grace period: 1 minute

    const mins = Math.floor(diffMs / 60000);
    return mins >= 60 ? `${Math.floor(mins / 60)}h ${mins % 60}m` : `${mins}m`;
  }, [shiftStart, isClockedIn, contextProfile?.clockHistory]);

  const recentWorkOrders = useMemo(() => {
    return workOrders
      .filter(wo => wo.status !== 'completed')
      .sort((a, b) => {
        const severityOrder: Record<string, number> = { critical: 0, high: 1, medium: 2, low: 3 };
        return (severityOrder[a.priority] || 2) - (severityOrder[b.priority] || 2);
      })
      .slice(0, 4);
  }, [workOrders]);

  const recentActivity = useMemo(() => {
    const activities = workOrders.map(wo => ({
      id: wo.id,
      type: 'work_order',
      title: wo.title,
      status: wo.status,
      timestamp: wo.completed_at || wo.started_at || wo.reported_at,
      priority: wo.priority
    }));

    return activities
      .sort((a, b) => (normalizeUTCDate(b.timestamp)?.getTime() || 0) - (normalizeUTCDate(a.timestamp)?.getTime() || 0))
      .slice(0, 5);
  }, [workOrders]);

  const urgentNotifications = useMemo(() => {
    const notificationsList = notifications || [];
    return notificationsList
      .filter((n: any) => !n.is_read && (n.priority === 'urgent' || n.priority === 'high' || n.task?.priority === 'urgent' || n.task?.priority === 'high'))
      .slice(0, 3);
  }, [notifications]);

  const formatTimestamp = (timestamp: string) => {
    if (!timestamp) return 'N/A';
    const date = normalizeUTCDate(timestamp);
    if (!date || isNaN(date.getTime())) return 'N/A';
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / 3600000);

    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const handleStartWorkOrder = async (workOrder: any) => {
    try {
      const success = await acceptWorkOrder(workOrder.id);
      if (success) refetchAll();
    } catch (err) {
      console.error('Failed to start work order:', err);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <span className="ml-2 text-text-light">Loading dashboard...</span>
      </div>
    );
  }

  return (
    <div>
      <DashboardHeader name={profile?.name} />

      {/* KPI Cards - 12 Column Grid matching admin dashboard */}
      <div className="grid grid-cols-12 gap-4 sm:gap-6 mb-4 sm:mb-6">
        <div className="col-span-12 sm:col-span-6 xl:col-span-3">
          <StatCard
            title="Open Work Orders"
            value={stats.pendingWorkOrders + stats.inProgressWorkOrders}
            subtitle={`${stats.pendingWorkOrders} pending`}
            icon={Wrench}
            color="terra"
          />
        </div>
        <div className="col-span-12 sm:col-span-6 xl:col-span-3">
          <StatCard
            title="Critical Issues"
            value={stats.criticalWorkOrders}
            subtitle="Require immediate action"
            icon={AlertTriangle}
            color="danger"
          />
        </div>
        <div className="col-span-12 sm:col-span-6 xl:col-span-3">
          <StatCard
            title="Tasks Due Today"
            value={stats.pendingTasks + stats.inProgressTasks}
            subtitle={`${stats.inProgressTasks} in progress`}
            icon={ClipboardList}
            color="gold"
          />
        </div>
        <div className="col-span-12 sm:col-span-6 xl:col-span-3">
          <StatCard
            title={isClockedIn ? 'Shift Hours Left' : 'Shift Duration'}
            value={shiftHoursLeft || '--'}
            subtitle={isClockedIn ? (hoursWorkedToday ? `${hoursWorkedToday} worked today${lateBy ? ` · Late ${lateBy}` : ''}` : (lateBy ? `Late by ${lateBy}` : 'Just clocked in')) : 'Not clocked in'}
            icon={Clock}
            color="ocean"
          />
        </div>
      </div>

      {/* Main Content - 12 Column Grid matching admin dashboard */}
      <div className="grid grid-cols-12 gap-4 sm:gap-6 mb-4 sm:mb-6">
        {/* Recent Work Orders - 8 columns */}
        <div className="col-span-12 xl:col-span-8">
          <SectionCard
            title="Recent Work Orders"
            subtitle={`${recentWorkOrders.length} active orders`}
            action={() => navigate('/staff/maintenance/work-orders')}
            actionLabel="View All"
            className="h-full"
          >
            {recentWorkOrders.length === 0 ? (
              <div className="text-center py-8">
                <Wrench className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
                <p className="text-[13px] text-neutral-500">No open work orders</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentWorkOrders.map((wo) => (
                  <div
                    key={wo.id}
                    className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-lg bg-neutral-50/50 hover:bg-neutral-50 transition-colors cursor-pointer"
                    onClick={() => navigate(`/staff/maintenance/work-orders/${wo.id}`)}
                  >
                    <div className="flex items-start sm:items-center gap-3 sm:gap-4">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        wo.priority === 'critical' ? 'bg-rose-50' :
                        wo.priority === 'high' ? 'bg-amber-50' :
                        'bg-terra-50'
                      }`}>
                        {wo.priority === 'critical' ? (
                          <AlertCircle className="w-4.5 h-4.5 text-rose-600" />
                        ) : (
                          <Wrench className={`w-4.5 h-4.5 ${wo.priority === 'high' ? 'text-amber-600' : 'text-terra-600'}`} />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-0.5">
                          <span className="text-[13px] font-semibold text-neutral-800 truncate">{wo.title}</span>
                          <StatusBadge status={wo.status} />
                          {(wo.priority === 'critical' || wo.priority === 'high') && (
                            <SeverityBadge severity={wo.priority} />
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-neutral-500">
                          <span className="font-medium">{wo.location}</span>
                          <span className="text-neutral-300">•</span>
                          <span>{wo.issue_type}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pl-13 sm:pl-0">
                      {wo.status === 'pending' && (
                        <Button
                          size="sm"
                          icon={Play}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStartWorkOrder(wo);
                          }}
                        >
                          Start
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

        {/* Quick Actions - 4 columns */}
        <div className="col-span-12 xl:col-span-4">
          <SectionCard
            title="Quick Actions"
            subtitle="Common tasks"
            className="h-full"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-1 gap-3">
              <button
                onClick={() => {
                  const nextOrder = workOrders.find((wo: any) => wo.status === 'pending');
                  if (nextOrder) {
                    handleStartWorkOrder(nextOrder);
                  } else {
                    navigate('/staff/maintenance/work-orders');
                  }
                }}
                className="w-full flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-lg bg-terra-50 text-left hover:bg-terra-100 transition-all group"
              >
                <div className="w-10 h-10 rounded-lg bg-terra-100 flex items-center justify-center flex-shrink-0">
                  <Play className="w-4.5 h-4.5 text-terra-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-semibold text-neutral-800 mb-0.5">Start Next Order</p>
                  <p className="text-[11px] text-neutral-400 font-medium">Begin work order</p>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-neutral-300 group-hover:text-terra-600 group-hover:translate-x-0.5 transition-all hidden sm:block" />
              </button>
              <button
                onClick={() => navigate('/staff/maintenance/work-orders')}
                className="w-full flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-lg bg-neutral-50/50 text-left hover:bg-neutral-50 transition-all group"
              >
                <div className="w-10 h-10 rounded-lg bg-sage-50 flex items-center justify-center flex-shrink-0">
                  <Wrench className="w-4.5 h-4.5 text-sage-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-semibold text-neutral-800 mb-0.5">View Work Orders</p>
                  <p className="text-[11px] text-neutral-400 font-medium">Manage all orders</p>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-neutral-300 group-hover:text-terra-600 group-hover:translate-x-0.5 transition-all hidden sm:block" />
              </button>
              <button
                onClick={() => navigate('/staff/maintenance/tasks')}
                className="w-full flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-lg bg-neutral-50/50 text-left hover:bg-neutral-50 transition-all group"
              >
                <div className="w-10 h-10 rounded-lg bg-gold-50 flex items-center justify-center flex-shrink-0">
                  <ClipboardList className="w-4.5 h-4.5 text-gold-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-semibold text-neutral-800 mb-0.5">View Tasks</p>
                  <p className="text-[11px] text-neutral-400 font-medium">Scheduled maintenance</p>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-neutral-300 group-hover:text-terra-600 group-hover:translate-x-0.5 transition-all hidden sm:block" />
              </button>
              <button
                onClick={() => navigate('/staff/maintenance/equipment')}
                className="w-full flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-lg bg-neutral-50/50 text-left hover:bg-neutral-50 transition-all group"
              >
                <div className="w-10 h-10 rounded-lg bg-rose-50 flex items-center justify-center flex-shrink-0">
                  <Settings className="w-4.5 h-4.5 text-rose-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-semibold text-neutral-800 mb-0.5">Equipment Issues</p>
                  <p className="text-[11px] text-neutral-400 font-medium">{stats.pendingIssues} pending</p>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-neutral-300 group-hover:text-terra-600 group-hover:translate-x-0.5 transition-all hidden sm:block" />
              </button>
            </div>
          </SectionCard>
        </div>
      </div>

      {/* Activity & Alerts - 6 + 6 = 12 columns */}
      <div className="grid grid-cols-12 gap-4 sm:gap-6">
        {/* Recent Activity - 6 columns */}
        <div className="col-span-12 xl:col-span-6">
          <SectionCard
            title="Recent Activity"
            subtitle="Latest updates"
            className="h-full"
          >
            {recentActivity.length === 0 ? (
              <div className="text-center py-6">
                <CheckCircle className="w-10 h-10 text-sage-500 mx-auto mb-2" />
                <p className="text-[13px] font-medium text-neutral-600">No recent activity</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentActivity.map((activity) => (
                  <div
                    key={`${activity.type}-${activity.id}`}
                    className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-lg bg-neutral-50/50 hover:bg-neutral-50 transition-colors"
                  >
                    <div className="flex items-start sm:items-center gap-3 sm:gap-4">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        activity.status === 'completed' ? 'bg-sage-50' :
                        activity.status === 'in_progress' ? 'bg-amber-50' :
                        'bg-neutral-100'
                      }`}>
                        {activity.status === 'completed' ? (
                          <CheckCircle className="w-4.5 h-4.5 text-sage-600" />
                        ) : activity.status === 'in_progress' ? (
                          <Clock className="w-4.5 h-4.5 text-amber-600" />
                        ) : (
                          <Wrench className="w-4.5 h-4.5 text-neutral-500" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-semibold text-neutral-800 mb-0.5 truncate">{activity.title}</p>
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] text-neutral-500 font-medium capitalize">
                            {activity.status.replace('_', ' ')}
                          </span>
                          <span className="text-[11px] text-neutral-400">
                            {formatTimestamp(activity.timestamp)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-neutral-300 hidden sm:block" />
                  </div>
                ))}
              </div>
            )}
          </SectionCard>
        </div>

        {/* Urgent Alerts - 6 columns */}
        <div className="col-span-12 xl:col-span-6">
          <SectionCard
            title="Urgent Alerts"
            subtitle="Important notifications"
            action={() => navigate('/staff/notifications')}
            actionLabel="View All"
            className="h-full"
          >
            {urgentNotifications.length === 0 && stats.criticalWorkOrders === 0 ? (
              <div className="text-center py-6">
                <p className="text-[13px] text-neutral-500">No urgent alerts</p>
              </div>
            ) : (
              <div className="space-y-3">
                {stats.criticalWorkOrders > 0 && (
                  <div className="flex items-start gap-3 sm:gap-4 p-3 sm:p-4 rounded-lg bg-gradient-to-br from-rose-50/60 to-white">
                    <div className="w-10 h-10 rounded-lg bg-rose-50 flex items-center justify-center flex-shrink-0">
                      <AlertTriangle className="w-5 h-5 text-rose-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-semibold text-neutral-800 mb-0.5">
                        {stats.criticalWorkOrders} Critical Work Order{stats.criticalWorkOrders > 1 ? 's' : ''}
                      </p>
                      <p className="text-[11px] text-neutral-500 leading-relaxed">
                        Require immediate attention
                      </p>
                    </div>
                  </div>
                )}
                {urgentNotifications.map((notif: any) => (
                  <div
                    key={notif.id}
                    className={`
                      flex items-start gap-3 sm:gap-4 p-3 sm:p-4 rounded-lg transition-colors
                      ${notif.task?.priority === 'urgent' ? 'bg-gradient-to-br from-rose-50/60 to-white' :
                        notif.task?.priority === 'high' ? 'bg-gradient-to-br from-gold-50/60 to-white' :
                        'bg-gradient-to-br from-ocean-50/60 to-white'}
                    `}
                  >
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      notif.task?.priority === 'urgent' ? 'bg-rose-50' :
                      notif.task?.priority === 'high' ? 'bg-gold-50' : 'bg-ocean-50'
                    }`}>
                      <AlertTriangle className={`w-5 h-5 ${
                        notif.task?.priority === 'urgent' ? 'text-rose-600' :
                        notif.task?.priority === 'high' ? 'text-gold-600' : 'text-ocean-600'
                      }`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-semibold text-neutral-800 mb-0.5">{notif.title}</p>
                      <p className="text-[11px] text-neutral-500 line-clamp-2 leading-relaxed">{notif.message}</p>
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

export default MaintenanceDashboard;
