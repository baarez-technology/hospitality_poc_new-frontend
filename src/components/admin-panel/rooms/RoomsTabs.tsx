import { Home, Check, CheckCircle, ShieldCheck, Users, AlertTriangle, Clock, Wrench, XCircle, Ban } from 'lucide-react';

export default function RoomsTabs({ activeTab, onTabChange, counts }) {
  const tabs = [
    { id: 'all', label: 'All Rooms', icon: Home, count: counts.all },
    { id: 'available', label: 'Available', icon: Check, count: counts.available },
    { id: 'occupied', label: 'Occupied', icon: Users, count: counts.occupied },
    { id: 'dirty', label: 'Dirty', icon: AlertTriangle, count: counts.dirty },
    { id: 'in_progress', label: 'In Progress', icon: Clock, count: counts.in_progress },
    { id: 'clean', label: 'Clean', icon: CheckCircle, count: counts.clean },
    { id: 'inspected', label: 'Inspected', icon: ShieldCheck, count: counts.inspected },
    { id: 'maintenance', label: 'Maintenance', icon: Wrench, count: counts.maintenance },
    { id: 'out_of_service', label: 'Out of Service', icon: XCircle, count: counts.out_of_service },
    { id: 'out_of_order', label: 'Out of Order', icon: Ban, count: counts.out_of_order }
  ];

  return (
    <div className="border-b border-neutral-200">
      <div className="flex items-center gap-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`relative flex items-center gap-2 px-5 py-3 text-sm font-semibold transition-all duration-200 ${
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
