import { Calendar, TrendingUp, BarChart3, PieChart } from 'lucide-react';

export default function RevenueTabs({ activeTab, onTabChange }) {
  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'forecast', label: 'Forecast', icon: TrendingUp },
    { id: 'segments', label: 'Segments', icon: PieChart },
    { id: 'channels', label: 'Channels', icon: Calendar }
  ];

  return (
    <div className="bg-white rounded-xl p-2 border border-neutral-200 inline-flex gap-1">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium text-sm transition-all duration-200 ${
              isActive
                ? 'bg-[#8E6554] text-white shadow-md'
                : 'text-neutral-600 hover:bg-neutral-100'
            }`}
          >
            <Icon className="w-4 h-4" />
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
