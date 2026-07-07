import { useState, useEffect, useCallback, useRef } from 'react';
import { Sparkles, TrendingUp, AlertTriangle, CheckCircle, Lightbulb, RefreshCw, X, Loader2 } from 'lucide-react';
import { revenueIntelligenceService, AIInsight, AIInsightsResponse } from '../../../api/services/revenue-intelligence.service';
import { useToast } from '../../../context/ToastContext';

// Auto-refresh interval in milliseconds (5 minutes)
const AUTO_REFRESH_INTERVAL = 5 * 60 * 1000;

export default function AIInsights() {
  const { showToast } = useToast();
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [stats, setStats] = useState({
    forecastAccuracy: 0,
    revenueOptimized: 0,
    insightsGenerated: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [dismissingIds, setDismissingIds] = useState<Set<string>>(new Set());
  const refreshTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch insights from API
  const fetchInsights = useCallback(async (showLoadingState = true) => {
    if (showLoadingState) {
      setIsRefreshing(true);
    }
    try {
      const response = await revenueIntelligenceService.getAIInsights();
      setInsights(response.insights.filter(i => !i.isDismissed));
      setStats(response.stats);
    } catch (error) {
      console.error('Failed to fetch AI insights:', error);
      if (showLoadingState) {
        showToast('Failed to load AI insights', 'error');
      }
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [showToast]);

  // Initial load
  useEffect(() => {
    fetchInsights(false);
  }, [fetchInsights]);

  // Set up auto-refresh
  useEffect(() => {
    refreshTimerRef.current = setInterval(() => {
      fetchInsights(false);
    }, AUTO_REFRESH_INTERVAL);

    return () => {
      if (refreshTimerRef.current) {
        clearInterval(refreshTimerRef.current);
      }
    };
  }, [fetchInsights]);

  // Manual refresh handler
  const handleRefresh = async () => {
    await fetchInsights(true);
    showToast('Insights refreshed', 'success');
  };

  // Dismiss insight handler
  const handleDismiss = async (id: string) => {
    setDismissingIds(prev => new Set(prev).add(id));
    try {
      await revenueIntelligenceService.dismissInsight(id);
      setInsights(prev => prev.filter(i => i.id !== id));
      showToast('Insight dismissed', 'success');
    } catch (error) {
      console.error('Failed to dismiss insight:', error);
      showToast('Failed to dismiss insight', 'error');
    } finally {
      setDismissingIds(prev => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  };

  // Action handler
  const handleAction = async (insight: AIInsight) => {
    // Mark as read
    try {
      await revenueIntelligenceService.markInsightRead(insight.id);
    } catch (error) {
      console.error('Failed to mark insight as read:', error);
    }

    // Navigate to action URL if available
    if (insight.actionUrl) {
      window.location.href = insight.actionUrl;
    } else {
      showToast(`Action: ${insight.action}`, 'info');
    }
  };

  const getIconComponent = (type: string) => {
    switch (type) {
      case 'opportunity':
        return TrendingUp;
      case 'warning':
        return AlertTriangle;
      case 'success':
        return CheckCircle;
      case 'recommendation':
      default:
        return Lightbulb;
    }
  };

  const getIconColor = (type: string) => {
    const colors: Record<string, string> = {
      opportunity: 'text-[#4E5840] bg-green-100',
      warning: 'text-amber-600 bg-amber-100',
      success: 'text-[#A57865] bg-[#A57865]/10',
      recommendation: 'text-[#5C9BA4] bg-[#5C9BA4]/15'
    };
    return colors[type] || colors.recommendation;
  };

  const getImpactStyle = (color: string) => {
    const styles: Record<string, string> = {
      green: 'bg-green-100 text-[#4E5840] border-[#4E5840]/30',
      amber: 'bg-amber-100 text-amber-700 border-amber-200',
      primary: 'bg-[#A57865]/10 text-[#A57865] border-[#A57865]/30'
    };
    return styles[color] || styles.primary;
  };

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-br from-aurora-600 to-primary-600 rounded-xl p-6">
          <div className="animate-pulse">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-white/20 rounded-xl" />
              <div className="h-8 w-48 bg-white/20 rounded" />
            </div>
            <div className="h-4 w-64 bg-white/20 rounded mt-3" />
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="bg-white rounded-xl p-6 border border-neutral-200 animate-pulse">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 bg-neutral-200 rounded-xl" />
                <div className="flex-1">
                  <div className="h-5 w-40 bg-neutral-200 rounded mb-2" />
                  <div className="h-4 w-24 bg-neutral-200 rounded" />
                </div>
              </div>
              <div className="h-4 w-full bg-neutral-200 rounded mb-2" />
              <div className="h-4 w-3/4 bg-neutral-200 rounded mb-4" />
              <div className="h-10 w-full bg-neutral-200 rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-br from-aurora-600 to-primary-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <Sparkles className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-serif font-semibold">AI Revenue Insights</h2>
          </div>
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-2 px-3 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            {isRefreshing ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
        <p className="text-white/90 text-sm">
          Real-time recommendations powered by machine learning analysis of your revenue data
        </p>
      </div>

      {/* Empty state */}
      {insights.length === 0 && (
        <div className="bg-white rounded-xl p-12 border border-neutral-200 text-center">
          <Sparkles className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
          <p className="text-neutral-500 mb-2">No insights available</p>
          <p className="text-sm text-neutral-400">AI is analyzing your data. Check back soon for recommendations.</p>
        </div>
      )}

      {/* Insights Grid */}
      {insights.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {insights.map((insight) => {
            const Icon = getIconComponent(insight.type);
            const isDismissing = dismissingIds.has(insight.id);

            return (
              <div
                key={insight.id}
                className={`bg-white rounded-xl p-6 border border-neutral-200 hover:shadow transition-all duration-200 ${
                  isDismissing ? 'opacity-50' : ''
                }`}
              >
                {/* Icon and Title */}
                <div className="flex items-start gap-4 mb-4">
                  <div className={`w-12 h-12 rounded-xl ${getIconColor(insight.type)} flex items-center justify-center flex-shrink-0`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <h3 className="font-semibold text-neutral-900 mb-1">
                        {insight.title}
                      </h3>
                      <button
                        onClick={() => handleDismiss(insight.id)}
                        disabled={isDismissing}
                        className="p-1 text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 rounded transition-colors"
                        title="Dismiss insight"
                      >
                        {isDismissing ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <X className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                    <span className={`inline-flex px-2 py-0.5 rounded text-xs font-semibold border ${getImpactStyle(insight.impactColor)}`}>
                      {insight.impact} Impact
                    </span>
                  </div>
                </div>

                {/* Description */}
                <p className="text-sm text-neutral-600 mb-4 leading-relaxed">
                  {insight.description}
                </p>

                {/* Action Button */}
                <button
                  onClick={() => handleAction(insight)}
                  className="w-full py-2 px-4 bg-neutral-100 hover:bg-neutral-200 text-neutral-900 rounded-lg text-sm font-medium transition-colors duration-200"
                >
                  {insight.action}
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* AI Stats */}
      <div className="bg-white rounded-xl p-6 border border-neutral-200">
        <h3 className="text-lg font-semibold text-neutral-900 mb-4">AI Model Performance</h3>
        <div className="grid grid-cols-3 gap-6">
          <div className="text-center">
            <p className="text-3xl font-bold text-[#A57865] mb-1">{stats.forecastAccuracy}%</p>
            <p className="text-xs text-neutral-600">Forecast Accuracy</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-[#4E5840] mb-1">
              ${stats.revenueOptimized >= 1000
                ? `${Math.round(stats.revenueOptimized / 1000)}K`
                : stats.revenueOptimized.toLocaleString()}
            </p>
            <p className="text-xs text-neutral-600">Revenue Optimized (30d)</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-[#5C9BA4] mb-1">{stats.insightsGenerated}</p>
            <p className="text-xs text-neutral-600">Insights Generated</p>
          </div>
        </div>
      </div>
    </div>
  );
}
