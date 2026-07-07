import { useState, useEffect, useMemo } from 'react';
import { Sparkles, TrendingUp, ArrowRight, Check, X, Loader2 } from 'lucide-react';
import { Button } from '../ui2/Button';
import { useToast } from '../../contexts/ToastContext';
import revenueIntelligenceService, {
  PricingRecommendation,
} from '../../api/services/revenue-intelligence.service';
import { useRecommendations } from '../../contexts/RevenueDataContext';
import { useCurrency } from '@/hooks/useCurrency';

interface RateRecommendationsProps {
  settings?: {
    autoRate?: boolean;
  };
  onRefreshCalendar?: () => void;
}

export default function RateRecommendations({ settings, onRefreshCalendar }: RateRecommendationsProps) {
  const { success, error: showError } = useToast();
  const { data: recommendationsResponse, loading: isLoading, refresh: refreshRecommendations } = useRecommendations();
  const { currency, symbol } = useCurrency();

  // Local state for recommendations (to handle accept/dismiss operations)
  const [localRecommendations, setLocalRecommendations] = useState<PricingRecommendation[]>([]);
  const [loadingIds, setLoadingIds] = useState<Set<string>>(new Set());
  const [isApplyingAll, setIsApplyingAll] = useState(false);
  const [isDismissingAll, setIsDismissingAll] = useState(false);

  // Sync local state with context data
  useEffect(() => {
    if (recommendationsResponse?.recommendations) {
      setLocalRecommendations(recommendationsResponse.recommendations);
    }
  }, [recommendationsResponse]);

  // Use local state for rendering
  const recommendations = localRecommendations;

  // Composite ID must be room_type_id_YYYY-MM-DD to match backend _resolve_recommendation_id
  const getRecommendationId = (rec: PricingRecommendation): string => {
    return `${rec.room_type_id}_${rec.date}`;
  };

  // Accept single recommendation
  const handleAccept = async (rec: PricingRecommendation) => {
    const id = getRecommendationId(rec);
    setLoadingIds(prev => new Set(prev).add(id));

    try {
      await revenueIntelligenceService.acceptRecommendation(id);
      setLocalRecommendations(prev => prev.filter(r => getRecommendationId(r) !== id));
      success(`Rate updated for ${rec.room_type_name} on ${new Date(rec.date).toLocaleDateString()}`);
      onRefreshCalendar?.();
    } catch (err) {
      showError('Failed to apply recommendation');
      console.error('Error accepting recommendation:', err);
    } finally {
      setLoadingIds(prev => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  };

  // Dismiss single recommendation (if backend returns 404, still remove from list so UI stays usable)
  const handleDismiss = async (rec: PricingRecommendation) => {
    const id = getRecommendationId(rec);
    setLoadingIds(prev => new Set(prev).add(id));

    try {
      await revenueIntelligenceService.dismissRecommendation(id);
      setLocalRecommendations(prev => prev.filter(r => getRecommendationId(r) !== id));
      success('Recommendation dismissed');
    } catch (err: unknown) {
      const is404 = typeof err === 'object' && err !== null && 'response' in err && (err as { response?: { status?: number } }).response?.status === 404;
      if (is404) {
        setLocalRecommendations(prev => prev.filter(r => getRecommendationId(r) !== id));
        success('Removed from list');
      } else {
        showError('Failed to dismiss recommendation');
        console.error('Error dismissing recommendation:', err);
      }
    } finally {
      setLoadingIds(prev => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  };

  // Apply all recommendations
  const handleApplyAll = async () => {
    if (recommendations.length === 0) return;

    setIsApplyingAll(true);
    try {
      await revenueIntelligenceService.applyAllRecommendations();
      setLocalRecommendations([]);
      success(`Applied ${recommendations.length} rate recommendations`);
      onRefreshCalendar?.();
    } catch (err) {
      showError('Failed to apply all recommendations');
      console.error('Error applying all recommendations:', err);
    } finally {
      setIsApplyingAll(false);
    }
  };

  // Dismiss all recommendations (if backend returns 404, still clear list so UI stays usable)
  const handleDismissAll = async () => {
    if (recommendations.length === 0) return;

    setIsDismissingAll(true);
    try {
      await revenueIntelligenceService.dismissAllRecommendations();
      setLocalRecommendations([]);
      success('All recommendations dismissed');
    } catch (err: unknown) {
      const is404 = typeof err === 'object' && err !== null && 'response' in err && (err as { response?: { status?: number } }).response?.status === 404;
      if (is404) {
        setLocalRecommendations([]);
        success('Removed from list');
      } else {
        showError('Failed to dismiss all recommendations');
        console.error('Error dismissing all recommendations:', err);
      }
    } finally {
      setIsDismissingAll(false);
    }
  };

  const highConfidenceCount = recommendations.filter(r => r.confidence >= 0.8).length;

  const getDemandColor = (level: string) => {
    switch (level) {
      case 'high':
      case 'critical':
        return 'bg-sage-500 text-white';
      case 'moderate':
        return 'bg-gold-100 text-gold-700';
      case 'low':
      case 'very_low':
        return 'bg-neutral-100 text-neutral-600';
      default:
        return 'bg-neutral-100 text-neutral-600';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'bg-rose-50 border-rose-200';
      case 'high':
        return 'bg-gold-50 border-gold-200';
      case 'medium':
        return 'bg-ocean-50 border-ocean-200';
      default:
        return '';
    }
  };

  // Loading skeleton
  if (isLoading) {
    return (
      <div>
        <div className="px-6 py-5 border-b border-neutral-100">
          <div className="flex items-center justify-between">
            <div>
              <div className="h-4 w-40 bg-neutral-200 rounded animate-pulse" />
              <div className="h-3 w-32 bg-neutral-100 rounded animate-pulse mt-2" />
            </div>
            <div className="h-6 w-32 bg-neutral-100 rounded-lg animate-pulse" />
          </div>
        </div>
        <div className="divide-y divide-neutral-100">
          {[1, 2, 3].map(i => (
            <div key={i} className="px-6 py-4">
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="h-4 w-32 bg-neutral-200 rounded animate-pulse" />
                  <div className="h-3 w-20 bg-neutral-100 rounded animate-pulse mt-2" />
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-8 w-20 bg-neutral-100 rounded animate-pulse" />
                  <div className="h-8 w-20 bg-neutral-100 rounded animate-pulse" />
                </div>
                <div className="h-8 w-16 bg-neutral-100 rounded animate-pulse" />
                <div className="flex gap-2">
                  <div className="h-8 w-8 bg-neutral-100 rounded-lg animate-pulse" />
                  <div className="h-8 w-8 bg-neutral-100 rounded-lg animate-pulse" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Empty state
  if (recommendations.length === 0) {
    return (
      <div>
        <div className="px-6 py-5 border-b border-neutral-100">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-neutral-800">AI Rate Recommendations</h3>
              <p className="text-[11px] text-neutral-400 font-medium mt-0.5">Optimized for next 7 days</p>
            </div>
          </div>
        </div>
        <div className="px-6 py-12 text-center">
          <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-sage-50 flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-sage-500" />
          </div>
          <p className="text-sm font-medium text-neutral-700 mb-1">All caught up!</p>
          <p className="text-[13px] text-neutral-500">No pricing recommendations at this time.</p>
          <Button
            variant="ghost"
            size="sm"
            className="mt-4"
            onClick={refreshRecommendations}
          >
            Refresh
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="px-6 py-5 border-b border-neutral-100">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-neutral-800">AI Rate Recommendations</h3>
            <p className="text-[11px] text-neutral-400 font-medium mt-0.5">Optimized for next 7 days</p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-sage-50 rounded-lg">
            <div className="w-2 h-2 rounded-full bg-sage-500" />
            <span className="text-[11px] font-semibold text-sage-700">
              {highConfidenceCount}/{recommendations.length} High Confidence
            </span>
          </div>
        </div>
      </div>

      {/* Recommendations List */}
      <div className="divide-y divide-neutral-100">
        {recommendations.map((rec) => {
          const id = getRecommendationId(rec);
          const isPositive = rec.change_percent > 0;
          const isItemLoading = loadingIds.has(id);

          return (
            <div
              key={id}
              className={`px-6 py-4 hover:bg-neutral-50 transition-colors ${getPriorityColor(rec.priority)}`}
            >
              <div className="flex items-center gap-4">
                {/* Room Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-semibold text-neutral-900">{rec.room_type_name}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${getDemandColor(rec.demand_level)}`}>
                      {rec.demand_level.charAt(0).toUpperCase() + rec.demand_level.slice(1)} demand
                    </span>
                    <span className="text-[10px] text-neutral-400">
                      {new Date(rec.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                  {rec.reasoning && (
                    <p className="text-[11px] text-neutral-500 mt-1 line-clamp-1">{rec.reasoning}</p>
                  )}
                </div>

                {/* Price Comparison */}
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-[10px] text-neutral-400 font-medium uppercase tracking-wider">Current</p>
                    <p className="text-[13px] font-medium text-neutral-500 mt-0.5">
                      {new Intl.NumberFormat('en-US', { style: 'currency', currency: currency, maximumFractionDigits: 0 }).format(rec.current_rate)}
                    </p>
                  </div>

                  <ArrowRight className="w-4 h-4 text-neutral-300" />

                  <div className="text-right">
                    <p className="text-[10px] text-neutral-400 font-medium uppercase tracking-wider">Recommended</p>
                    <p className="text-[15px] font-bold text-neutral-900 mt-0.5">
                      {new Intl.NumberFormat('en-US', { style: 'currency', currency: currency, maximumFractionDigits: 0 }).format(rec.recommended_rate)}
                    </p>
                  </div>
                </div>

                {/* Change Percentage */}
                <div className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold ${
                  isPositive ? 'bg-sage-50 text-sage-700' : 'bg-rose-50 text-rose-600'
                }`}>
                  <TrendingUp className={`w-3.5 h-3.5 ${!isPositive && 'rotate-180'}`} />
                  <span>
                    {isPositive ? '+' : ''}{rec.change_percent}%
                  </span>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleAccept(rec)}
                    disabled={isItemLoading}
                    className="w-8 h-8 flex items-center justify-center bg-sage-500 text-white rounded-lg hover:bg-sage-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Apply"
                  >
                    {isItemLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Check className="w-4 h-4" />
                    )}
                  </button>
                  <button
                    onClick={() => handleDismiss(rec)}
                    disabled={isItemLoading}
                    className="w-8 h-8 flex items-center justify-center bg-neutral-100 text-neutral-500 rounded-lg hover:bg-neutral-200 hover:text-neutral-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Dismiss"
                  >
                    {isItemLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <X className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="px-6 py-4 bg-neutral-50 border-t border-neutral-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {settings?.autoRate ? (
              <>
                <div className="w-2 h-2 rounded-full bg-sage-500 animate-pulse" />
                <span className="text-[13px] text-sage-700 font-medium">Auto-optimization enabled</span>
              </>
            ) : (
              <span className="text-[13px] text-neutral-500">Review and apply recommended rates</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDismissAll}
              disabled={isDismissingAll || isApplyingAll || recommendations.length === 0}
            >
              {isDismissingAll ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                  Dismissing...
                </>
              ) : (
                'Dismiss All'
              )}
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleApplyAll}
              disabled={isApplyingAll || isDismissingAll || recommendations.length === 0}
            >
              {isApplyingAll ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                  Applying...
                </>
              ) : (
                'Apply All'
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
