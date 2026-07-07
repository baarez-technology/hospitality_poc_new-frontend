import { TrendingUp, Users, MessageSquare, Sparkles, ChevronRight } from 'lucide-react';

const iconMap = {
  'trending-up': TrendingUp,
  users: Users,
  message: MessageSquare,
};

const priorityConfig = {
  high: {
    bg: 'bg-[#CDB261]/10',
    iconBg: 'bg-[#CDB261]',
    border: 'border-[#CDB261]/20',
    hoverBorder: 'hover:border-[#CDB261]/40',
    badge: 'High Priority',
    badgeBg: 'bg-[#CDB261]/10',
    badgeText: 'text-[#CDB261]',
  },
  normal: {
    bg: 'bg-[#A57865]/5',
    iconBg: 'bg-[#A57865]',
    border: 'border-neutral-200/60',
    hoverBorder: 'hover:border-[#A57865]/30',
    badge: null,
    badgeBg: '',
    badgeText: '',
  },
};

export default function AIInsightsBanner({ insights }) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-[#A57865] rounded-xl">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-neutral-900">
              AI Intelligence Center
            </h2>
            <p className="text-neutral-600 text-xs font-medium">
              Real-time predictive insights
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-[#4E5840]/5 rounded-full border border-[#4E5840]/20">
          <div className="w-1.5 h-1.5 bg-[#4E5840] rounded-full animate-pulse"></div>
          <span className="text-xs font-bold text-[#4E5840]">Active</span>
        </div>
      </div>

      {/* Insights Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {insights.map((insight) => {
          const Icon = iconMap[insight.icon] || Sparkles;
          const config = priorityConfig[insight.priority] || priorityConfig.normal;

          return (
            <div
              key={insight.id}
              className={`${config.bg} rounded-xl border ${config.border} ${config.hoverBorder} transition-all duration-300 ease-out cursor-pointer group hover:shadow-sm`}
            >
              {/* Card Header */}
              <div className="p-5 pb-4 border-b border-neutral-200/40">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className={`${config.iconBg} p-2 rounded-lg flex-shrink-0 group-hover:scale-105 transition-transform duration-200`}>
                    <Icon className="w-4 h-4 text-white" />
                  </div>
                  {config.badge && (
                    <span className={`${config.badgeBg} ${config.badgeText} text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wide`}>
                      {config.badge}
                    </span>
                  )}
                </div>

                <h3 className="font-bold text-neutral-900 text-sm mb-2 group-hover:text-[#A57865] transition-colors leading-tight">
                  {insight.title}
                </h3>

                <p className="text-xs text-neutral-600 leading-relaxed line-clamp-3">
                  {insight.message}
                </p>
              </div>

              {/* Card Footer */}
              <div className="p-4">
                <button className="w-full flex items-center justify-between px-3 py-2 bg-white hover:bg-neutral-50 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#A57865]/30 border border-neutral-200/60 group/btn">
                  <span className="text-xs font-semibold text-neutral-700 group-hover/btn:text-[#A57865] transition-colors">
                    {insight.action}
                  </span>
                  <ChevronRight className="w-4 h-4 text-neutral-400 group-hover/btn:translate-x-0.5 group-hover/btn:text-[#A57865] transition-all duration-200" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
