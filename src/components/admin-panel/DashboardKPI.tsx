import { TrendingUp, TrendingDown, Bed, DollarSign, UserCheck, AlertCircle } from 'lucide-react';

const iconMap = {
  bed: Bed,
  dollar: DollarSign,
  check: UserCheck,
  alert: AlertCircle,
};

export default function DashboardKPI({ kpi }) {
  const Icon = iconMap[kpi.icon] || Bed;

  // Unified icon color - elegant brown
  const iconBgColor = 'bg-[#A57865]/10';
  const iconColor = 'text-[#A57865]';

  // Map trend colors
  const getTrendBg = (trend) => {
    if (trend === 'up') return 'bg-[#4E5840]/10';
    if (trend === 'down') return 'bg-[#CDB261]/15';
    return 'bg-neutral-100';
  };

  const getTrendColor = (trend) => {
    if (trend === 'up') return 'text-[#4E5840]';
    if (trend === 'down') return 'text-[#CDB261]';
    return 'text-neutral-600';
  };

  return (
    <div className="bg-white rounded-2xl p-6 border border-neutral-200/60 hover:border-[#A57865]/30 transition-all duration-300 ease-out flex flex-col justify-between group cursor-pointer overflow-hidden relative">
      {/* Subtle gradient overlay on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#A57865]/0 to-[#A57865]/0 group-hover:from-[#A57865]/5 group-hover:to-transparent transition-all duration-300 pointer-events-none"></div>

      <div className="flex items-start justify-between mb-5 relative z-10">
        {/* Icon Box - Unified elegant brown */}
        <div className={`${iconBgColor} rounded-xl p-3 transition-all duration-300 group-hover:scale-110 group-hover:rotate-3`}>
          <Icon className={`w-5 h-5 ${iconColor}`} />
        </div>

        {/* Trend Pill */}
        <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full ${getTrendBg(kpi.trend)} transition-all duration-200`}>
          {kpi.trend === 'up' && <TrendingUp className={`w-3.5 h-3.5 ${getTrendColor(kpi.trend)}`} />}
          {kpi.trend === 'down' && <TrendingDown className={`w-3.5 h-3.5 ${getTrendColor(kpi.trend)}`} />}
          <span className={`text-xs font-bold ${getTrendColor(kpi.trend)}`}>
            {kpi.change}
          </span>
        </div>
      </div>

      <div className="relative z-10 space-y-2">
        {/* Title */}
        <h3 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
          {kpi.title}
        </h3>

        {/* Value */}
        <p className="text-3xl font-bold text-neutral-900 leading-none transition-all duration-200 group-hover:text-[#A57865]">
          {kpi.value}
        </p>
      </div>
    </div>
  );
}
