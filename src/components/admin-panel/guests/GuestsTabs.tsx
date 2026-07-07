import { Users, RefreshCw, Star, UserX } from 'lucide-react';

export default function GuestsTabs({ activeTab, onTabChange }) {
  const tabs = [
    { id: 'all', label: 'All Guests', icon: Users },
    { id: 'returning', label: 'Returning', icon: RefreshCw },
    { id: 'vip', label: 'VIP', icon: Star },
    { id: 'blacklisted', label: 'Blacklisted', icon: UserX }
  ];

  return (
    <div className="border-b border-neutral-200">
      <div className="flex items-center gap-1">
        {tabs.map(tab => {
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
