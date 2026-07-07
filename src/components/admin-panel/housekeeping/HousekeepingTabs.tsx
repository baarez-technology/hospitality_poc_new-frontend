import { Home, AlertTriangle, Clock, CheckCircle, XCircle, Users, Building, Ban, Wrench } from 'lucide-react';

export default function HousekeepingTabs({ activeTab, onTabChange, counts }) {
  const tabs = [
    {
      id: 'all',
      label: 'All Rooms',
      icon: Home,
      count: counts.total
    },
    {
      id: 'dirty',
      label: 'Dirty',
      icon: AlertTriangle,
      count: counts.dirty
    },
    {
      id: 'in_progress',
      label: 'In Progress',
      icon: Clock,
      count: counts.in_progress
    },
    {
      id: 'clean',
      label: 'Clean',
      icon: CheckCircle,
      count: counts.clean
    },
    {
      id: 'out_of_service',
      label: 'Out of Service',
      icon: XCircle,
      count: counts.out_of_service
    },
    {
      id: 'out_of_order',
      label: 'Out of Order',
      icon: Ban,
      count: counts.out_of_order
    },
    {
      id: 'maintenance',
      label: 'Maintenance',
      icon: Wrench,
      count: counts.maintenance
    },
    {
      id: 'by_staff',
      label: 'By Staff',
      icon: Users,
      count: null
    },
    {
      id: 'by_floor',
      label: 'By Floor',
      icon: Building,
      count: null
    }
  ];

  return (
    <div className="border-b border-neutral-200">
      <div className="flex items-center gap-1 overflow-x-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`relative flex items-center gap-2 px-5 py-3 text-sm font-semibold transition-all duration-200 whitespace-nowrap ${
                isActive
                  ? 'text-[#A57865] border-b-2 border-[#A57865]'
                  : 'text-neutral-600 hover:text-neutral-900 border-b-2 border-transparent'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              {tab.count !== null && (
                <span className={`
                  px-2.5 py-0.5 rounded-full text-xs font-bold min-w-[24px] text-center
                  ${isActive
                    ? 'bg-[#A57865]/10 text-[#A57865]'
                    : 'bg-neutral-200 text-neutral-700'
                  }
                `}>
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
