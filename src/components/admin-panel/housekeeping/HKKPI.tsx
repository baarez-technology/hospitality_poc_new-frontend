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
      iconBgColor: 'bg-red-50',
      iconColor: 'text-red-600',
      trend: dirty > 10 ? 'up' : 'down',
      trendValue: dirty > 10 ? '+3' : '-2',
      trendColor: dirty > 10 ? 'text-red-600' : 'text-[#4E5840]'
    },
    {
      id: 'in_progress',
      title: 'In Progress',
      value: inProgress,
      icon: Clock,
      iconBgColor: 'bg-[#CDB261]/15',
      iconColor: 'text-[#CDB261]',
      trend: 'neutral',
      trendValue: '0',
      trendColor: 'text-neutral-500'
    },
    {
      id: 'clean',
      title: 'Rooms Clean',
      value: clean,
      icon: CheckCircle,
      iconBgColor: 'bg-[#5C9BA4]/15',
      iconColor: 'text-[#5C9BA4]',
      trend: clean > 20 ? 'up' : 'down',
      trendValue: clean > 20 ? '+5' : '-1',
      trendColor: clean > 20 ? 'text-[#4E5840]' : 'text-red-600'
    },
    {
      id: 'inspected',
      title: 'Inspected',
      value: inspected,
      icon: ShieldCheck,
      iconBgColor: 'bg-[#4E5840]/15',
      iconColor: 'text-[#4E5840]',
      trend: 'up',
      trendValue: '+2',
      trendColor: 'text-[#4E5840]'
    },
    {
      id: 'avg_time',
      title: 'Avg Clean Time',
      value: `${avgCleaningTime}m`,
      icon: Timer,
      iconBgColor: 'bg-[#A57865]/10',
      iconColor: 'text-[#A57865]',
      trend: avgCleaningTime <= 25 ? 'down' : 'up',
      trendValue: avgCleaningTime <= 25 ? '-3m' : '+5m',
      trendColor: avgCleaningTime <= 25 ? 'text-[#4E5840]' : 'text-red-600'
    },
    {
      id: 'staff',
      title: 'Staff on Shift',
      value: staffOnShift,
      icon: Users,
      iconBgColor: 'bg-[#5C9BA4]/15',
      iconColor: 'text-[#5C9BA4]',
      trend: 'neutral',
      trendValue: `/${staff?.length || 0}`,
      trendColor: 'text-neutral-500'
    },
    {
      id: 'urgent',
      title: 'Urgent Rooms',
      value: urgent,
      icon: Zap,
      iconBgColor: urgent > 0 ? 'bg-red-50' : 'bg-[#4E5840]/15',
      iconColor: urgent > 0 ? 'text-red-600' : 'text-[#4E5840]',
      trend: urgent > 3 ? 'up' : 'down',
      trendValue: urgent > 3 ? '+2' : '0',
      trendColor: urgent > 3 ? 'text-red-600' : 'text-[#4E5840]'
    },
    {
      id: 'pending',
      title: 'Pending Inspection',
      value: pendingInspection,
      icon: ClipboardCheck,
      iconBgColor: 'bg-[#CDB261]/15',
      iconColor: 'text-[#CDB261]',
      trend: pendingInspection > 5 ? 'up' : 'neutral',
      trendValue: pendingInspection > 5 ? `${pendingInspection} waiting` : 'On track',
      trendColor: pendingInspection > 5 ? 'text-[#CDB261]' : 'text-[#4E5840]'
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
      {kpis.map((kpi) => {
        const Icon = kpi.icon;
        const TrendIcon = kpi.trend === 'up' ? TrendingUp : kpi.trend === 'down' ? TrendingDown : null;

        return (
          <div
            key={kpi.id}
            className="bg-white rounded-xl p-4 border border-neutral-200/60 hover:border-[#A57865]/30 transition-all duration-300 ease-out group cursor-pointer"
          >
            <div className="flex items-center justify-between mb-3">
              <div className={`${kpi.iconBgColor} rounded-lg p-2 transition-all duration-300 group-hover:scale-110`}>
                <Icon className={`w-4 h-4 ${kpi.iconColor}`} />
              </div>
              {TrendIcon && (
                <div className={`flex items-center gap-0.5 text-xs font-medium ${kpi.trendColor}`}>
                  <TrendIcon className="w-3 h-3" />
                  <span>{kpi.trendValue}</span>
                </div>
              )}
              {!TrendIcon && kpi.trendValue && (
                <span className={`text-xs font-medium ${kpi.trendColor}`}>{kpi.trendValue}</span>
              )}
            </div>
            <p className="text-2xl font-bold text-neutral-900 mb-1 transition-all duration-200 group-hover:text-[#A57865]">
              {kpi.value}
            </p>
            <p className="text-xs font-medium text-neutral-500 uppercase tracking-wide">
              {kpi.title}
            </p>
          </div>
        );
      })}
    </div>
  );
}
