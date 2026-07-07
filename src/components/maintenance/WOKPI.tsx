import { useMemo } from 'react';
import {
  Wrench,
  AlertTriangle,
  Clock,
  CheckCircle,
  Users,
  XCircle,
  TrendingUp,
  Package
} from 'lucide-react';
import { calculateMaintenanceKPIs } from '../../utils/maintenance';

export default function WOKPI({ workOrders, technicians, blockedRoomsCount = 0, inventory }) {
  const kpis = useMemo(() => {
    const metrics = calculateMaintenanceKPIs(workOrders, technicians);

    // Calculate low stock items
    const lowStockCount = inventory?.filter(item => item.stockLevel <= item.minStock).length || 0;

    return { ...metrics, lowStockCount };
  }, [workOrders, technicians, inventory]);

  const kpiCards = [
    {
      label: 'Total Work Orders',
      value: kpis.total,
      icon: Wrench,
      bgColor: 'bg-[#A57865]/10',
      iconColor: 'text-[#A57865]',
      borderColor: 'border-[#A57865]/20'
    },
    {
      label: 'Open',
      value: kpis.open,
      icon: Clock,
      bgColor: 'bg-[#CDB261]/10',
      iconColor: 'text-[#CDB261]',
      borderColor: 'border-[#CDB261]/20'
    },
    {
      label: 'In Progress',
      value: kpis.inProgress,
      icon: TrendingUp,
      bgColor: 'bg-[#5C9BA4]/10',
      iconColor: 'text-[#5C9BA4]',
      borderColor: 'border-[#5C9BA4]/20'
    },
    {
      label: 'Completed',
      value: kpis.completed,
      icon: CheckCircle,
      bgColor: 'bg-[#5C9BA4]/10',
      iconColor: 'text-[#5C9BA4]',
      borderColor: 'border-[#5C9BA4]/20'
    },
    {
      label: 'High Priority',
      value: kpis.highPriority,
      icon: AlertTriangle,
      bgColor: 'bg-rose-50',
      iconColor: 'text-rose-600',
      borderColor: 'border-rose-200',
      highlight: kpis.highPriority > 0
    },
    {
      label: 'Avg Resolution',
      value: kpis.avgResolutionTime >= 24
        ? `${Math.round(kpis.avgResolutionTime / 24)}d`
        : `${kpis.avgResolutionTime}h`,
      icon: Clock,
      bgColor: 'bg-neutral-50',
      iconColor: 'text-neutral-600',
      borderColor: 'border-neutral-200'
    },
    {
      label: 'Techs On Duty',
      value: kpis.techsOnDuty,
      icon: Users,
      bgColor: 'bg-[#5C9BA4]/10',
      iconColor: 'text-[#5C9BA4]',
      borderColor: 'border-[#5C9BA4]/20'
    },
    {
      label: 'Rooms Blocked',
      value: blockedRoomsCount,
      icon: XCircle,
      bgColor: blockedRoomsCount > 0 ? 'bg-rose-50' : 'bg-neutral-50',
      iconColor: blockedRoomsCount > 0 ? 'text-rose-600' : 'text-neutral-600',
      borderColor: blockedRoomsCount > 0 ? 'border-rose-200' : 'border-neutral-200',
      highlight: blockedRoomsCount > 0
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
      {kpiCards.map((kpi) => (
        <div
          key={kpi.label}
          className="bg-white rounded-[10px] p-4 sm:p-6"
        >
            {/* Header with Icon and Title */}
            <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
              <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${kpi.bgColor}`}>
                <kpi.icon className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${kpi.iconColor}`} />
              </div>
              <p className="text-[9px] sm:text-[11px] font-semibold uppercase tracking-widest text-neutral-400 truncate">
                {kpi.label}
              </p>
            </div>

            {/* Value Row */}
            <div className="flex items-center justify-between">
              <p className="text-xl sm:text-[28px] font-semibold tracking-tight text-neutral-900">
                {kpi.value}
              </p>
            </div>
        </div>
      ))}
    </div>
  );
}
