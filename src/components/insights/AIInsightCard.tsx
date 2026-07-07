import {
  Bed,
  DollarSign,
  BarChart3,
  Target,
  Zap,
  Wrench,
  Star,
  TrendingUp,
  TrendingDown,
  Sparkles,
} from 'lucide-react';

// Category config
const categoryConfig = {
  'Operations': { icon: Zap, color: '#CDB261' },
  'Revenue': { icon: DollarSign, color: '#4E5840', colorDark: '#8BA876' },
  'Guest Experience': { icon: Star, color: '#A57865' },
  'Distribution': { icon: Target, color: '#5C9BA4' },
  'Forecast': { icon: BarChart3, color: '#A57865' },
  'Maintenance': { icon: Wrench, color: '#C8B29D' },
  'Occupancy': { icon: Bed, color: '#5C9BA4' },
};

// Severity config
const severityConfig = {
  urgent: { color: '#A57865' },
  high: { color: '#CDB261' },
  medium: { color: '#5C9BA4' },
  low: { color: '#C8B29D' },
};

export default function AIInsightCard({ insight, isDark = false, isActive = false, onClick, index = 0 }) {
  const { category, title, impact, severity, confidence } = insight;

  const categoryInfo = categoryConfig[category] || { icon: Sparkles, color: '#A57865' };
  const CategoryIcon = categoryInfo.icon;
  const iconColor = isDark && categoryInfo.colorDark ? categoryInfo.colorDark : categoryInfo.color;
  const severityStyle = severityConfig[severity] || severityConfig.low;

  const isPositiveImpact = impact && (impact.startsWith('+') || !impact.startsWith('-'));
  const ImpactIcon = isPositiveImpact ? TrendingUp : TrendingDown;
  const impactColor = isPositiveImpact ? (isDark ? '#8BA876' : '#4E5840') : '#A57865';

  const confidenceValue = parseInt(confidence) || 0;

  return (
    <div
      onClick={onClick}
      className={`group relative rounded-xl p-4 cursor-pointer transition-all duration-200 ${
        isActive
          ? isDark
            ? 'bg-[#A57865]/10 border-2 border-[#A57865]/30 shadow-lg shadow-[#A57865]/10'
            : 'bg-[#A57865]/5 border-2 border-[#A57865]/20 shadow-lg shadow-[#A57865]/10'
          : isDark
            ? 'bg-white/[0.02] border border-white/[0.06] hover:bg-white/[0.04] shadow-sm shadow-black/5'
            : 'bg-white/50 border border-white/60 hover:bg-white/80 shadow-sm shadow-neutral-200/50 hover:shadow-md'
      }`}
    >
      {/* Top Row - Icon & Severity */}
      <div className="flex items-center justify-between mb-3">
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: `${iconColor}15` }}
        >
          <CategoryIcon className="w-[18px] h-[18px]" style={{ color: iconColor }} />
        </div>
        <div
          className="w-2 h-2 rounded-full"
          style={{ backgroundColor: severityStyle.color }}
        />
      </div>

      {/* Title */}
      <h4 className={`text-sm font-semibold leading-snug mb-2 line-clamp-2 ${
        isDark ? 'text-white/90' : 'text-neutral-800'
      }`}>
        {title}
      </h4>

      {/* Category */}
      <p className={`text-[11px] mb-3 ${isDark ? 'text-white/40' : 'text-neutral-400'}`}>
        {category}
      </p>

      {/* Bottom Row - Impact & Confidence */}
      <div className="flex items-center justify-between">
        {impact ? (
          <div className="flex items-center gap-1">
            <ImpactIcon className="w-3 h-3" style={{ color: impactColor }} />
            <span className="text-xs font-bold" style={{ color: impactColor }}>
              {impact}
            </span>
          </div>
        ) : (
          <div />
        )}

        {confidence && (
          <div className="flex items-center gap-1.5">
            <div className={`w-8 h-1 rounded-full overflow-hidden ${isDark ? 'bg-white/10' : 'bg-neutral-200'}`}>
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#A57865] to-[#CDB261]"
                style={{ width: confidence }}
              />
            </div>
            <span className={`text-[10px] ${isDark ? 'text-white/40' : 'text-neutral-400'}`}>
              {confidence}
            </span>
          </div>
        )}
      </div>

      {/* Active indicator line */}
      {isActive && (
        <div className="absolute bottom-0 left-4 right-4 h-0.5 rounded-full bg-[#A57865]" />
      )}
    </div>
  );
}
