import { useState, useEffect, useCallback } from 'react';
import { Sparkles, TrendingUp, AlertTriangle, CheckCircle, Lightbulb, Loader2, RefreshCw } from 'lucide-react';
import { revenueIntelligenceService, AIInsight, AIInsightsResponse } from '../../api/services/revenue-intelligence.service';
import { useCurrency } from '@/hooks/useCurrency';

interface AIInsightsProps {
  onRefresh?: () => void;
}

export default function AIInsights({ onRefresh }: AIInsightsProps) {
  const { symbol } = useCurrency();
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [stats, setStats] = useState<AIInsightsResponse['stats'] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchInsights = useCallback(async () => {
    try {
      setIsRefreshing(true);
      const response = await revenueIntelligenceService.getAIInsights();
      setInsights(response.insights || []);
      setStats(response.stats || null);
      setError(null);
    } catch (err) {
      console.error('Error fetching AI insights:', err);
      setError('Failed to load AI insights');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchInsights();
  }, [fetchInsights]);

  const handleRefresh = () => {
    fetchInsights();
    onRefresh?.();
  };

  const handleDismiss = async (insightId: string) => {
    try {
      await revenueIntelligenceService.dismissInsight(insightId);
      setInsights(prev => prev.filter(i => i.id !== insightId));
    } catch (err) {
      console.error('Error dismissing insight:', err);
    }
  };

  const handleMarkRead = async (insightId: string) => {
    try {
      await revenueIntelligenceService.markInsightRead(insightId);
      setInsights(prev => prev.map(i => i.id === insightId ? { ...i, isRead: true } : i));
    } catch (err) {
      console.error('Error marking insight as read:', err);
    }
  };

  const getIcon = (type: AIInsight['type']) => {
    const icons = {
      opportunity: TrendingUp,
      warning: AlertTriangle,
      success: CheckCircle,
      recommendation: Lightbulb
    };
    return icons[type] || Lightbulb;
  };

  const getIconColor = (type: AIInsight['type']) => {
    const colors = {
      opportunity: 'text-[#4E5840] bg-green-100',
      warning: 'text-amber-600 bg-amber-100',
      success: 'text-[#A57865] bg-[#A57865]/10',
      recommendation: 'text-[#5C9BA4] bg-[#5C9BA4]/15'
    };
    return colors[type] || colors.recommendation;
  };

  const getImpactStyle = (color: AIInsight['impactColor']) => {
    const styles = {
      green: 'bg-green-100 text-[#4E5840] border-[#4E5840]/30',
      amber: 'bg-amber-100 text-amber-700 border-amber-200',
      primary: 'bg-[#A57865]/10 text-[#A57865] border-[#A57865]/30'
    };
    return styles[color] || styles.primary;
  };

  const formatCurrency = (value: number) => {
    if (value >= 1000000) {
      return `${symbol}${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `${symbol}${(value / 1000).toFixed(0)}K`;
    }
    return `${symbol}${value.toFixed(0)}`;
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-br from-aurora-600 to-primary-600 rounded-xl p-6 text-white">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <Sparkles className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-sans font-semibold">AI Revenue Insights</h2>
          </div>
          <p className="text-white/90 text-sm">
            Real-time recommendations powered by machine learning analysis of your revenue data
          </p>
        </div>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-neutral-400" />
          <span className="ml-3 text-neutral-600">Loading AI insights...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-br from-aurora-600 to-primary-600 rounded-xl p-6 text-white">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <Sparkles className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-sans font-semibold">AI Revenue Insights</h2>
          </div>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <AlertTriangle className="w-8 h-8 text-red-500 mx-auto mb-2" />
          <p className="text-red-700">{error}</p>
          <button
            onClick={handleRefresh}
            className="mt-4 px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg text-sm font-medium transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-br from-aurora-600 to-primary-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <Sparkles className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-sans font-semibold">AI Revenue Insights</h2>
          </div>
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors disabled:opacity-50"
            title="Refresh insights"
          >
            <RefreshCw className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
        <p className="text-white/90 text-sm">
          Real-time recommendations powered by machine learning analysis of your revenue data
        </p>
      </div>

      {/* Insights Grid */}
      {insights.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {insights.map((insight) => {
            const Icon = getIcon(insight.type);

            return (
              <div
                key={insight.id}
                className={`bg-white rounded-xl p-6 border border-neutral-200 hover:shadow transition-shadow duration-200 ${!insight.isRead ? 'ring-2 ring-primary-200' : ''}`}
                onClick={() => !insight.isRead && handleMarkRead(insight.id)}
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
                      {!insight.isRead && (
                        <span className="w-2 h-2 bg-primary-500 rounded-full flex-shrink-0 mt-2" />
                      )}
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

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <button className="flex-1 py-2 px-4 bg-neutral-100 hover:bg-neutral-200 text-neutral-900 rounded-lg text-sm font-medium transition-colors duration-200">
                    {insight.action}
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDismiss(insight.id);
                    }}
                    className="py-2 px-3 text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100 rounded-lg text-sm transition-colors"
                    title="Dismiss"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-xl p-8 border border-neutral-200 text-center">
          <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-neutral-900 mb-1">All Caught Up!</h3>
          <p className="text-neutral-600 text-sm">No new AI insights at the moment. Check back later for recommendations.</p>
        </div>
      )}

      {/* AI Stats */}
      <div className="bg-white rounded-xl p-6 border border-neutral-200">
        <h3 className="text-lg font-semibold text-neutral-900 mb-4">AI Model Performance</h3>
        <div className="grid grid-cols-3 gap-6">
          <div className="text-center">
            <p className="text-3xl font-bold text-[#A57865] mb-1">
              {stats?.forecastAccuracy ? `${stats.forecastAccuracy}%` : '--'}
            </p>
            <p className="text-xs text-neutral-600">Forecast Accuracy</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-[#4E5840] mb-1">
              {stats?.revenueOptimized ? formatCurrency(stats.revenueOptimized) : '--'}
            </p>
            <p className="text-xs text-neutral-600">Revenue Optimized (30d)</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-[#5C9BA4] mb-1">
              {stats?.insightsGenerated ?? '--'}
            </p>
            <p className="text-xs text-neutral-600">Insights Generated</p>
          </div>
        </div>
      </div>
    </div>
  );
}
