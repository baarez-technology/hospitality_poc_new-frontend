import { Users, UserCheck, Home, Wrench, Shield, Package } from 'lucide-react';

export default function StaffTabs({ activeTab, onTabChange, counts }) {
  const tabs = [
    { id: 'all', label: 'All Staff', icon: Users, count: counts.all },
    { id: 'frontdesk', label: 'Front Desk', icon: UserCheck, count: counts.frontdesk },
    { id: 'housekeeping', label: 'Housekeeping', icon: Home, count: counts.housekeeping },
    { id: 'maintenance', label: 'Maintenance', icon: Wrench, count: counts.maintenance },
    { id: 'runner', label: 'Runners', icon: Package, count: counts.runner },
    { id: 'management', label: 'Management', icon: Shield, count: counts.management }
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
              {tab.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
