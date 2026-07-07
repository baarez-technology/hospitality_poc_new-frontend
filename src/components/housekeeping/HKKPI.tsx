import { AlertTriangle, Clock, CheckCircle, ShieldCheck, Users, Zap, Timer, ClipboardCheck, TrendingUp, TrendingDown } from 'lucide-react';

export default function HKKPI({ rooms, staff }) {
  // Calculate KPIs
  const dirty = rooms.filter(r => r.status === 'dirty').length;
  const inProgress = rooms.filter(r => r.status === 'in_progress').length;
  const clean = rooms.filter(r => r.status === 'clean').length;
  const inspected = rooms.filter(r => r.status === 'inspected').length;
  const urgent = rooms.filter(r => r.priority === 'high' && r.status !== 'clean' && r.status !== 'inspected').length;
  const pendingInspection = rooms.filter(r => r.status === 'clean').length;

  // Calculate avg cleaning time
  const completedRooms = rooms.filter(r => r.cleaningStartedAt && r.cleaningCompletedAt);
  let avgCleaningTime = 25;
  if (completedRooms.length > 0) {
    const totalTime = completedRooms.reduce((sum, room) => {
      const start = new Date(room.cleaningStartedAt);
      const end = new Date(room.cleaningCompletedAt);
      return sum + (end - start) / (1000 * 60);
    }, 0);
    avgCleaningTime = Math.round(totalTime / completedRooms.length);
  }

  // Staff on shift (morning or evening active)
  const staffOnShift = staff ? staff.filter(s => s.tasksAssigned > 0).length : 0;

  const kpis = [
    {
      id: 'dirty',
      title: 'Rooms Dirty',
      value: dirty,
      icon: AlertTriangle,
      iconBgColor: 'bg-rose-50',
      iconBorderColor: 'border-rose-100',
      iconColor: 'text-rose-600',
      trend: dirty > 10 ? 'up' : 'down',
      trendValue: dirty > 10 ? '+3' : '-2',
      trendColor: dirty > 10 ? 'text-rose-600' : 'text-sage-600'
    },
    {
      id: 'in_progress',
      title: 'In Progress',
      value: inProgress,
      icon: Clock,
      iconBgColor: 'bg-gold-50',
      iconBorderColor: 'border-gold-100',
      iconColor: 'text-gold-700',
      trend: 'neutral',
      trendValue: '0',
      trendColor: 'text-neutral-500'
    },
    {
      id: 'clean',
      title: 'Rooms Clean',
      value: clean,
      icon: CheckCircle,
      iconBgColor: 'bg-sage-50',
      iconBorderColor: 'border-sage-100',
      iconColor: 'text-sage-600',
      trend: clean > 20 ? 'up' : 'down',
      trendValue: clean > 20 ? '+5' : '-1',
      trendColor: clean > 20 ? 'text-sage-600' : 'text-rose-600'
    },
    {
      id: 'inspected',
      title: 'Inspected',
      value: inspected,
      icon: ShieldCheck,
      iconBgColor: 'bg-sage-50',
      iconBorderColor: 'border-sage-100',
      iconColor: 'text-sage-600',
      trend: 'up',
      trendValue: '+2',
      trendColor: 'text-sage-600'
    },
    {
      id: 'avg_time',
      title: 'Avg Clean Time',
      value: `${avgCleaningTime}m`,
      icon: Timer,
      iconBgColor: 'bg-terra-50',
      iconBorderColor: 'border-terra-100',
      iconColor: 'text-terra-600',
      trend: avgCleaningTime <= 25 ? 'down' : 'up',
      trendValue: avgCleaningTime <= 25 ? '-3m' : '+5m',
      trendColor: avgCleaningTime <= 25 ? 'text-sage-600' : 'text-rose-600'
    },
    {
      id: 'staff',
      title: 'Staff on Shift',
      value: staffOnShift,
      icon: Users,
      iconBgColor: 'bg-sage-50',
      iconBorderColor: 'border-sage-100',
      iconColor: 'text-sage-600',
      trend: 'neutral',
      trendValue: `/${staff?.length || 0}`,
      trendColor: 'text-neutral-900'
    },
    {
      id: 'urgent',
      title: 'Urgent Rooms',
      value: urgent,
      icon: Zap,
      iconBgColor: urgent > 0 ? 'bg-rose-50' : 'bg-sage-50',
      iconBorderColor: urgent > 0 ? 'border-rose-100' : 'border-sage-100',
      iconColor: urgent > 0 ? 'text-rose-600' : 'text-sage-600',
      trend: urgent > 3 ? 'up' : 'down',
      trendValue: urgent > 3 ? '+2' : '0',
      trendColor: urgent > 3 ? 'text-rose-600' : 'text-sage-600'
    },
    {
      id: 'pending',
      title: 'Pending Inspection',
      value: pendingInspection,
      icon: ClipboardCheck,
      iconBgColor: 'bg-gold-50',
      iconBorderColor: 'border-gold-100',
      iconColor: 'text-gold-700',
      trend: pendingInspection > 5 ? 'up' : 'neutral',
      trendValue: pendingInspection > 5 ? `${pendingInspection} waiting` : 'On track',
      trendColor: pendingInspection > 5 ? 'text-gold-700' : 'text-sage-600'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
      {kpis.map((kpi) => {
        const Icon = kpi.icon;
        const TrendIcon = kpi.trend === 'up' ? TrendingUp : kpi.trend === 'down' ? TrendingDown : null;

        return (
          <div
            key={kpi.id}
            className="bg-white rounded-[10px] p-4 sm:p-6"
          >
              {/* Header with Icon and Title */}
              <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${kpi.iconBgColor}`}>
                  <Icon className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${kpi.iconColor}`} />
                </div>
                <p className="text-[9px] sm:text-[11px] font-semibold uppercase tracking-widest text-neutral-400 truncate">
                  {kpi.title}
                </p>
              </div>

              {/* Value + Trend Row */}
              <div className="flex items-center justify-between">
                <p className="text-xl sm:text-[28px] font-semibold tracking-tight text-neutral-900">
                  {kpi.value}
                </p>
                <p className={`text-[10px] sm:text-[11px] font-medium ${kpi.trendColor} flex items-center gap-1`}>
                  {TrendIcon && (
                    <TrendIcon className="w-3 h-3" />
                  )}
                  <span className="hidden sm:inline">{kpi.trendValue}</span>
                </p>
              </div>
          </div>
        );
      })}
    </div>
  );
}
