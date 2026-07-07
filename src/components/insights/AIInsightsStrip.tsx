import { useState } from 'react';
import { RefreshCw, Brain, Sparkles, ChevronLeft, ChevronRight, TrendingUp, AlertCircle } from 'lucide-react';
import { useAIInsights } from '../../context/AIInsightsContext';
import { useTheme } from '../../contexts/ThemeContext';
import AIInsightCard from './AIInsightCard';

export default function AIInsightsStrip() {
  const { insights, isLoading, refreshInsights } = useAIInsights();
  const { isDark } = useTheme();
  const [activeIndex, setActiveIndex] = useState(0);

  const cardBg = isDark
    ? 'bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] shadow-[0_2px_8px_-2px_rgba(0,0,0,0.2)]'
    : 'bg-white/70 backdrop-blur-xl border border-neutral-200/60 shadow-[0_2px_8px_-2px_rgba(165,120,101,0.12)]';

  const canGoPrev = activeIndex > 0;
  const canGoNext = activeIndex < insights.length - 1;

  const priorityCount = insights.filter(i => i.severity === 'urgent' || i.severity === 'high').length;
  const actionableCount = insights.filter(i => i.impact).length;

  if (!isLoading && insights.length === 0) {
    return (
      <div className={`${cardBg} rounded-2xl p-8`}>
        <div className="flex items-center justify-center gap-3">
          <Sparkles className="w-5 h-5 text-[#A57865]/40" />
          <p className={`text-sm ${isDark ? 'text-white/40' : 'text-neutral-400'}`}>
            No insights available
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`${cardBg} rounded-2xl overflow-hidden`}>
      <div className="p-5">
        {/* Header Row */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-6">
            {/* Title */}
            <div className="flex items-center gap-2.5">
              <div className="relative">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  isDark ? 'bg-[#A57865]/15' : 'bg-[#A57865]/10'
                }`}>
                  <Brain className="w-4 h-4 text-[#A57865]" />
                </div>
                <div className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-[#4E5840]" />
              </div>
              <span className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-neutral-900'}`}>
                AI Insights
              </span>
            </div>

            {/* Quick Stats */}
            {!isLoading && (
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 text-[#CDB261]" />
                  <span className={`text-xs ${isDark ? 'text-white/50' : 'text-neutral-500'}`}>
                    <span className="font-semibold text-[#CDB261]">{priorityCount}</span> priority
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <TrendingUp className={`w-3.5 h-3.5 ${isDark ? 'text-[#8BA876]' : 'text-[#4E5840]'}`} />
                  <span className={`text-xs ${isDark ? 'text-white/50' : 'text-neutral-500'}`}>
                    <span className={`font-semibold ${isDark ? 'text-[#8BA876]' : 'text-[#4E5840]'}`}>{actionableCount}</span> actionable
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Controls */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => canGoPrev && setActiveIndex(prev => prev - 1)}
              disabled={!canGoPrev}
              className={`w-7 h-7 rounded-md flex items-center justify-center transition-colors ${
                canGoPrev
                  ? isDark ? 'hover:bg-white/[0.05] text-white/60' : 'hover:bg-neutral-100 text-neutral-500'
                  : isDark ? 'text-white/15' : 'text-neutral-200'
              }`}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className={`text-[11px] font-medium min-w-[32px] text-center ${isDark ? 'text-white/40' : 'text-neutral-400'}`}>
              {activeIndex + 1}/{insights.length}
            </span>
            <button
              onClick={() => canGoNext && setActiveIndex(prev => prev + 1)}
              disabled={!canGoNext}
              className={`w-7 h-7 rounded-md flex items-center justify-center transition-colors ${
                canGoNext
                  ? isDark ? 'hover:bg-white/[0.05] text-white/60' : 'hover:bg-neutral-100 text-neutral-500'
                  : isDark ? 'text-white/15' : 'text-neutral-200'
              }`}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <button
              onClick={refreshInsights}
              disabled={isLoading}
              className={`w-7 h-7 rounded-md flex items-center justify-center transition-colors ml-1 ${
                isDark ? 'hover:bg-white/[0.05] text-white/40' : 'hover:bg-neutral-100 text-neutral-400'
              }`}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {[1, 2, 3, 4].map(i => (
              <div
                key={i}
                className={`h-32 rounded-xl ${isDark ? 'bg-white/[0.02]' : 'bg-neutral-50'}`}
                style={{ animation: 'pulse 2s ease-in-out infinite', animationDelay: `${i * 100}ms` }}
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {insights.slice(0, 4).map((insight, index) => (
              <AIInsightCard
                key={insight.id}
                insight={insight}
                isDark={isDark}
                isActive={index === activeIndex}
                onClick={() => setActiveIndex(index)}
                index={index}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
