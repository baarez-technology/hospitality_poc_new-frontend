import { Star, ThumbsUp, ThumbsDown, Globe, BarChart3, Sparkles } from 'lucide-react';

export default function RepTabs({ activeTab, onTabChange }) {
  const tabs = [
    { id: 'all', label: 'All Reviews', icon: Star },
    { id: 'positive', label: 'Positive', icon: ThumbsUp },
    { id: 'negative', label: 'Negative', icon: ThumbsDown },
    { id: 'platforms', label: 'Platforms', icon: Globe },
    { id: 'competitors', label: 'Competitors', icon: BarChart3 },
    { id: 'insights', label: 'AI Insights', icon: Sparkles }
  ];

  return (
    <div className="bg-white rounded-xl p-2 border border-neutral-200">
      <div className="flex flex-wrap gap-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-[#8E6554] text-white shadow-lg'
                  : 'bg-transparent text-neutral-700 hover:bg-neutral-100'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-neutral-600'}`} />
              {tab.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
