import { Calendar, LogIn, LogOut } from 'lucide-react';

export default function Tabs({ activeTab, onTabChange }) {
  const tabs = [
    { id: 'all', label: 'All Bookings', icon: Calendar, count: null },
    { id: 'arrivals', label: 'Arrivals Today', icon: LogIn, count: null },
    { id: 'departures', label: 'Departures Today', icon: LogOut, count: null },
  ];

  return (
    <div className="border-b border-neutral-200">
      <div className="flex items-center gap-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`relative flex items-center gap-2 px-5 py-3 text-sm font-semibold transition-all duration-200 ${
                activeTab === tab.id
                  ? 'text-[#A57865] border-b-2 border-[#A57865]'
                  : 'text-neutral-600 hover:text-neutral-900 border-b-2 border-transparent'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
              {tab.count !== null && (
                <span
                  className={`ml-1 px-2 py-0.5 rounded-full text-xs font-semibold ${
                    activeTab === tab.id
                      ? 'bg-[#A57865]/10 text-[#A57865]'
                      : 'bg-neutral-100 text-neutral-600'
                  }`}
                >
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
