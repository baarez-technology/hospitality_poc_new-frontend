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
import { calculateMaintenanceKPIs } from '@/utils/admin/maintenance';

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
      bgColor: 'bg-[#4E5840]/10',
      iconColor: 'text-[#4E5840]',
      borderColor: 'border-[#4E5840]/20'
    },
    {
      label: 'High Priority',
      value: kpis.highPriority,
      icon: AlertTriangle,
      bgColor: 'bg-red-50',
      iconColor: 'text-red-600',
      borderColor: 'border-red-200',
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
      bgColor: blockedRoomsCount > 0 ? 'bg-red-50' : 'bg-neutral-50',
      iconColor: blockedRoomsCount > 0 ? 'text-red-600' : 'text-neutral-600',
      borderColor: blockedRoomsCount > 0 ? 'border-red-200' : 'border-neutral-200',
      highlight: blockedRoomsCount > 0
    }
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
      {kpiCards.map((kpi) => (
        <div
          key={kpi.label}
          className={`${kpi.bgColor} rounded-xl p-4 border ${kpi.borderColor} ${
            kpi.highlight ? 'ring-2 ring-red-300' : ''
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <kpi.icon className={`w-5 h-5 ${kpi.iconColor}`} />
            {kpi.highlight && (
              <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            )}
          </div>
          <p className="text-2xl font-bold text-neutral-900">{kpi.value}</p>
          <p className="text-xs text-neutral-600 mt-1">{kpi.label}</p>
        </div>
      ))}
    </div>
  );
}
