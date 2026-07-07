import { CheckCircle2, AlertCircle, Sparkles, ChevronRight, TrendingUp } from 'lucide-react';
import { cn } from '../../lib/utils';

/**
 * InsightsPanel - AI-powered insights with elegant cards
 * Features: Type-based styling, confidence indicator, hover effects
 */

const insightConfig = {
  success: {
    icon: CheckCircle2,
    bgColor: 'bg-sage-50',
    textColor: 'text-sage-600',
    borderColor: 'border-sage-200',
    accentColor: '#4E5840',
  },
  warning: {
    icon: AlertCircle,
    bgColor: 'bg-gold-50',
    textColor: 'text-gold-600',
    borderColor: 'border-gold-200',
    accentColor: '#CDB261',
  },
  info: {
    icon: Sparkles,
    bgColor: 'bg-ocean-50',
    textColor: 'text-ocean-600',
    borderColor: 'border-ocean-200',
    accentColor: '#5C9BA4',
  },
};

function InsightCard({ insight, index }) {
  const config = insightConfig[insight.type] || insightConfig.info;
  const IconComponent = config.icon;

  return (
    <div
      className={cn(
        "group relative p-4 rounded-xl",
        "bg-white border border-neutral-100",
        "hover:border-neutral-200 hover:shadow-md",
        "transition-all duration-300 cursor-pointer",
        "opacity-0 animate-fadeInUp"
      )}
      style={{ animationDelay: `${index * 100}ms`, animationFillMode: 'forwards' }}
    >
      <div className="flex gap-4">
        {/* Icon */}
        <div className={cn(
          "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0",
          "transition-transform duration-300 group-hover:scale-110",
          config.bgColor
        )}>
          <IconComponent className={cn("w-5 h-5", config.textColor)} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Meta */}
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[9px] font-bold uppercase tracking-widest text-neutral-400">
              {insight.category}
            </span>
            <span className="w-1 h-1 rounded-full bg-neutral-200" />
            <span className="text-[9px] text-neutral-400">{insight.timeAgo}</span>
          </div>

          {/* Title */}
          <p className="text-sm font-semibold text-neutral-900 mb-1.5 leading-snug">
            {insight.title}
          </p>

          {/* Message */}
          <p className="text-xs text-neutral-500 leading-relaxed line-clamp-2">
            {insight.message}
          </p>

          {/* Confidence bar */}
          <div className="flex items-center gap-3 mt-3">
            <div className="flex-1 h-1.5 rounded-full bg-neutral-100 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-1000 ease-out"
                style={{
                  width: `${insight.confidence}%`,
                  backgroundColor: config.accentColor,
                }}
              />
            </div>
            <span className="text-[9px] font-bold text-neutral-400 tabular-nums">
              {insight.confidence}%
            </span>
          </div>
        </div>

        {/* Arrow */}
        <ChevronRight
          className={cn(
            "w-4 h-4 text-neutral-300 flex-shrink-0 mt-1",
            "opacity-0 -translate-x-2",
            "group-hover:opacity-100 group-hover:translate-x-0",
            "transition-all duration-300"
          )}
        />
      </div>
    </div>
  );
}

export default function InsightsPanel({ insights, onViewAll, className }) {
  return (
    <div className={cn(
      "bg-white rounded-2xl border border-neutral-100",
      "shadow-sm hover:shadow-lg transition-all duration-300",
      "overflow-hidden flex flex-col",
      className
    )}>
      {/* Header */}
      <div className="px-6 py-4 border-b border-neutral-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-terra-100 to-gold-100 flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-terra-600" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-neutral-900">AI Insights</h3>
              <p className="text-xs text-neutral-400">Powered by Glimmora Intelligence</p>
            </div>
          </div>
          {onViewAll && (
            <button
              onClick={onViewAll}
              className={cn(
                "flex items-center gap-1 text-xs font-semibold",
                "text-terra-500 hover:text-terra-600",
                "transition-colors"
              )}
            >
              View All
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-4 space-y-3 overflow-y-auto max-h-[360px] custom-scrollbar">
        {insights.map((insight, index) => (
          <InsightCard key={insight.id} insight={insight} index={index} />
        ))}
      </div>

      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeInUp {
          animation: fadeInUp 0.4s ease-out forwards;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #E7E5E4;
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #D6D3D1;
        }
      `}</style>
    </div>
  );
}
