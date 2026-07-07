import { useState, useCallback, useEffect, useRef } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Lock,
  Calendar,
  Sparkles,
  CheckCircle2,
  X,
  Zap,
  ChevronUp,
  ArrowRight,
  Loader2,
} from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';
import { revenueIntelligenceService } from '../../api/services/revenue-intelligence.service';
import { Button } from '../ui2/Button';

interface Recommendation {
  id: string;
  type: 'rate_increase' | 'rate_decrease' | 'restriction' | 'optimize';
  priority: 'critical' | 'high' | 'medium' | 'low';
  date: string;
  title: string;
  message: string;
  potentialRevenue?: number;
  riskAmount?: number;
  roomTypeId?: number;
  currentRate?: number;
  suggestedRate?: number;
}

interface RecommendationCardProps {
  recommendation: Recommendation;
  onApply: (recommendation: Recommendation) => void;
  onDismiss: (recommendation: Recommendation) => void;
  onRemove?: (recommendation: Recommendation) => void;
}

// Individual Recommendation Card - Redesigned for better UX
const RecommendationCard = ({ recommendation, onApply, onDismiss, onRemove }: RecommendationCardProps) => {
  const { success, error: showError } = useToast();
  const [isApplying, setIsApplying] = useState(false);
  const [isDismissing, setIsDismissing] = useState(false);
  const [isRemoved, setIsRemoved] = useState(false);

  const getTypeConfig = () => {
    switch (recommendation.type) {
      case 'rate_increase':
        return {
          icon: TrendingUp,
          label: 'Increase Rate',
          accentColor: 'sage',
        };
      case 'rate_decrease':
        return {
          icon: TrendingDown,
          label: 'Decrease Rate',
          accentColor: 'gold',
        };
      case 'restriction':
        return {
          icon: Lock,
          label: 'Add Restriction',
          accentColor: 'ocean',
        };
      default:
        return {
          icon: Sparkles,
          label: 'Optimize',
          accentColor: 'terra',
        };
    }
  };

  const getPriorityConfig = () => {
    switch (recommendation.priority) {
      case 'critical':
        return {
          bg: 'bg-rose-50',
          border: 'border-rose-200',
          dot: 'bg-rose-500',
          text: 'text-rose-700',
          label: 'Act Now',
        };
      case 'high':
        return {
          bg: 'bg-gold-50',
          border: 'border-gold-200',
          dot: 'bg-gold-500',
          text: 'text-gold-700',
          label: 'High Priority',
        };
      case 'medium':
        return {
          bg: 'bg-ocean-50',
          border: 'border-ocean-200',
          dot: 'bg-ocean-500',
          text: 'text-ocean-700',
          label: 'Recommended',
        };
      default:
        return {
          bg: 'bg-neutral-50',
          border: 'border-neutral-200',
          dot: 'bg-neutral-400',
          text: 'text-neutral-600',
          label: 'Optional',
        };
    }
  };

  const handleApply = useCallback(async () => {
    setIsApplying(true);
    try {
      await revenueIntelligenceService.acceptRecommendation(recommendation.id);

      success('Recommendation applied successfully!', { duration: 3000 });
      onApply(recommendation);

      // Animate removal
      setIsRemoved(true);
      setTimeout(() => {
        if (onRemove) onRemove(recommendation);
      }, 300);
    } catch (err) {
      showError('Failed to apply recommendation. Please try again.');
    } finally {
      setIsApplying(false);
    }
  }, [recommendation, onApply, onRemove, success, showError]);

  const handleDismiss = useCallback(async () => {
    setIsDismissing(true);
    try {
      await revenueIntelligenceService.dismissRecommendation(recommendation.id);

      success('Recommendation dismissed', { duration: 2000 });
      onDismiss(recommendation);

      // Animate removal
      setIsRemoved(true);
      setTimeout(() => {
        if (onRemove) onRemove(recommendation);
      }, 300);
    } catch (err) {
      showError('Failed to dismiss recommendation. Please try again.');
    } finally {
      setIsDismissing(false);
    }
  }, [recommendation, onDismiss, onRemove, success, showError]);

  const typeConfig = getTypeConfig();
  const priorityConfig = getPriorityConfig();
  const Icon = typeConfig.icon;

  // Animation classes for removal
  const animationClasses = isRemoved
    ? 'opacity-0 scale-95 -translate-y-2 transition-all duration-300'
    : 'opacity-100 scale-100 translate-y-0 transition-all duration-300';

  return (
    <div className={`rounded-lg border overflow-hidden ${priorityConfig.border} bg-white ${animationClasses}`}>
      {/* Priority Header Bar */}
      <div className={`px-4 py-2 flex items-center justify-between ${priorityConfig.bg}`}>
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${priorityConfig.dot} animate-pulse`} />
          <span className={`text-[11px] font-bold uppercase tracking-wider ${priorityConfig.text}`}>
            {priorityConfig.label}
          </span>
        </div>
        <span className="text-[11px] text-neutral-500 font-medium flex items-center gap-1">
          <Calendar className="w-3 h-3" />
          {new Date(recommendation.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
        </span>
      </div>

      {/* Main Content */}
      <div className="p-4">
        {/* Action Type & Title */}
        <div className="flex items-start gap-3 mb-3">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 bg-${typeConfig.accentColor}-50`}>
            <Icon className={`w-5 h-5 text-${typeConfig.accentColor}-600`} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-medium text-neutral-400 uppercase tracking-wide mb-0.5">
              {typeConfig.label}
            </p>
            <h4 className="text-[14px] font-semibold text-neutral-800 leading-tight">
              {recommendation.title}
            </h4>
          </div>
        </div>

        {/* Description */}
        <p className="text-[12px] text-neutral-600 mb-4 leading-relaxed">
          {recommendation.message}
        </p>

        {/* Rate Change Preview */}
        {recommendation.currentRate && recommendation.suggestedRate && (
          <div className="flex items-center gap-2 mb-4 p-3 rounded-lg bg-neutral-50 border border-neutral-100">
            <div className="flex-1">
              <p className="text-[10px] text-neutral-500 font-medium uppercase tracking-wide">
                Current
              </p>
              <p className="text-[16px] font-bold text-neutral-700">
                ${recommendation.currentRate}
              </p>
            </div>
            <ArrowRight className="w-4 h-4 text-neutral-400" />
            <div className="flex-1">
              <p className="text-[10px] text-neutral-500 font-medium uppercase tracking-wide">
                Suggested
              </p>
              <p className={`text-[16px] font-bold ${
                recommendation.suggestedRate > recommendation.currentRate ? 'text-sage-600' : 'text-gold-600'
              }`}>
                ${recommendation.suggestedRate}
              </p>
            </div>
          </div>
        )}

        {/* Impact Metrics */}
        <div className="flex items-center gap-3 mb-4">
          {recommendation.potentialRevenue && (
            <div className="flex-1 p-3 rounded-lg bg-sage-50 border border-sage-100">
              <p className="text-[10px] text-sage-600 font-medium uppercase tracking-wide mb-1">
                Potential Gain
              </p>
              <p className="text-[18px] font-bold text-sage-700">
                +${recommendation.potentialRevenue.toLocaleString()}
              </p>
            </div>
          )}
          {recommendation.riskAmount && (
            <div className="flex-1 p-3 rounded-lg bg-rose-50 border border-rose-100">
              <p className="text-[10px] text-rose-600 font-medium uppercase tracking-wide mb-1">
                At Risk
              </p>
              <p className="text-[18px] font-bold text-rose-700">
                ${recommendation.riskAmount.toLocaleString()}
              </p>
            </div>
          )}
          {!recommendation.potentialRevenue && !recommendation.riskAmount && (
            <div className="flex-1 p-3 rounded-lg bg-neutral-50 border border-neutral-100">
              <p className="text-[10px] text-neutral-500 font-medium uppercase tracking-wide mb-1">
                Impact
              </p>
              <p className="text-[13px] font-semibold text-neutral-700">
                Optimization
              </p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Button
            variant="primary"
            size="sm"
            onClick={handleApply}
            disabled={isApplying || isDismissing}
            className="flex-1"
          >
            {isApplying ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Applying...
              </>
            ) : (
              'Apply Recommendation'
            )}
          </Button>
          <button
            onClick={handleDismiss}
            disabled={isApplying || isDismissing}
            className={`w-9 h-9 flex items-center justify-center rounded-lg transition-colors ${
              isDismissing
                ? 'text-neutral-300 cursor-not-allowed'
                : 'text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100'
            }`}
          >
            {isDismissing ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <X className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

// Recommendations Panel with Summary
interface RecommendationsPanelProps {
  limit?: number;
  recommendations?: Recommendation[];
  onRefresh?: () => void;
  isLoading?: boolean;
}

export const RecommendationsPanel = ({
  limit = 5,
  recommendations = [],
  onRefresh,
  isLoading = false,
}: RecommendationsPanelProps) => {
  const { success } = useToast();
  const [showAll, setShowAll] = useState(false);
  const [localRecommendations, setLocalRecommendations] = useState<Recommendation[]>(recommendations);
  const [isApplyingAll, setIsApplyingAll] = useState(false);
  const prevRecommendationsRef = useRef<string>('');

  // Update local state when props change
  useEffect(() => {
    if (!isLoading && recommendations) {
      // Compare by serializing IDs to detect actual changes
      const currentIds = recommendations.map(r => r.id).sort().join(',');
      
      // Only update if the recommendations actually changed
      if (prevRecommendationsRef.current !== currentIds) {
        prevRecommendationsRef.current = currentIds;
        setLocalRecommendations(recommendations);
      }
    }
  }, [recommendations, isLoading]);

  const displayRecommendations = showAll ? localRecommendations : localRecommendations.slice(0, limit);

  // Calculate totals
  const totalPotentialRevenue = localRecommendations.reduce((sum, rec) => sum + (rec.potentialRevenue || 0), 0);
  const totalAtRisk = localRecommendations.reduce((sum, rec) => sum + (rec.riskAmount || 0), 0);
  const criticalCount = localRecommendations.filter(r => r.priority === 'critical').length;
  const highCount = localRecommendations.filter(r => r.priority === 'high').length;

  const handleApply = useCallback((rec: Recommendation) => {
    // Remove from local state after animation
  }, []);

  const handleDismiss = useCallback((rec: Recommendation) => {
    // Remove from local state after animation
  }, []);

  const handleRemove = useCallback((rec: Recommendation) => {
    setLocalRecommendations(prev => prev.filter(r => r.id !== rec.id));
  }, []);

  const handleApplyAll = async () => {
    setIsApplyingAll(true);
    try {
      await revenueIntelligenceService.applyAllRecommendations();
      success(`Applied ${localRecommendations.length} recommendations successfully!`);
      setLocalRecommendations([]);
      if (onRefresh) onRefresh();
    } catch {
      // Error handled by service
    } finally {
      setIsApplyingAll(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-8 text-center rounded-lg bg-neutral-50 border border-neutral-100">
        <Loader2 className="w-8 h-8 mx-auto mb-3 text-terra-500 animate-spin" />
        <p className="text-[13px] text-neutral-500">Loading recommendations...</p>
      </div>
    );
  }

  if (displayRecommendations.length === 0) {
    return (
      <div className="p-8 text-center rounded-lg bg-gradient-to-br from-sage-50 to-sage-100/50 border border-sage-100">
        <div className="w-14 h-14 mx-auto mb-4 rounded-xl flex items-center justify-center bg-sage-100">
          <CheckCircle2 className="w-7 h-7 text-sage-600" />
        </div>
        <h3 className="text-[15px] font-semibold text-neutral-800 mb-1">All Optimized!</h3>
        <p className="text-[12px] text-neutral-500 mb-4">
          Your pricing is currently optimized. We'll notify you when new opportunities arise.
        </p>
        {onRefresh && (
          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
          >
            Refresh Analysis
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Summary Header */}
      <div className="p-4 rounded-lg bg-gradient-to-r from-terra-50 to-gold-50 border border-terra-100">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-terra-600" />
            <span className="text-[13px] font-semibold text-neutral-800">
              {localRecommendations.length} Action{localRecommendations.length !== 1 ? 's' : ''} Available
            </span>
          </div>
          <div className="flex items-center gap-2">
            {criticalCount > 0 && (
              <span className="px-2 py-1 text-[10px] font-bold uppercase tracking-wide rounded-full bg-rose-100 text-rose-700">
                {criticalCount} Critical
              </span>
            )}
            {highCount > 0 && (
              <span className="px-2 py-1 text-[10px] font-bold uppercase tracking-wide rounded-full bg-gold-100 text-gold-700">
                {highCount} High
              </span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-3">
          {totalPotentialRevenue > 0 && (
            <div className="p-3 rounded-lg bg-white/80">
              <p className="text-[10px] text-neutral-500 font-medium uppercase tracking-wide">
                Total Potential Revenue
              </p>
              <p className="text-[20px] font-bold text-sage-600">
                +${totalPotentialRevenue.toLocaleString()}
              </p>
            </div>
          )}
          {totalAtRisk > 0 && (
            <div className="p-3 rounded-lg bg-white/80">
              <p className="text-[10px] text-neutral-500 font-medium uppercase tracking-wide">
                Revenue at Risk
              </p>
              <p className="text-[20px] font-bold text-rose-600">
                ${totalAtRisk.toLocaleString()}
              </p>
            </div>
          )}
        </div>

        {/* Apply All Button */}
        <Button
          variant="primary"
          size="sm"
          fullWidth
          onClick={handleApplyAll}
          disabled={isApplyingAll}
        >
          {isApplyingAll ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Applying All...
            </>
          ) : (
            `Apply All ${localRecommendations.length} Recommendations`
          )}
        </Button>
      </div>

      {/* Recommendation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {displayRecommendations.map((rec) => (
          <RecommendationCard
            key={rec.id}
            recommendation={rec}
            onApply={handleApply}
            onDismiss={handleDismiss}
            onRemove={handleRemove}
          />
        ))}
      </div>

      {/* View All / Show Less Button */}
      {localRecommendations.length > limit && (
        <Button
          variant="outline"
          size="sm"
          fullWidth
          iconRight={showAll ? ChevronUp : ArrowRight}
          onClick={() => setShowAll(!showAll)}
        >
          {showAll ? 'Show Less' : `View All ${localRecommendations.length} Recommendations`}
        </Button>
      )}
    </div>
  );
};

// Mini Recommendation Alert for headers
interface RecommendationAlertProps {
  recommendations?: Recommendation[];
  onClick?: () => void;
}

export const RecommendationAlert = ({ recommendations = [], onClick }: RecommendationAlertProps) => {
  const criticalCount = recommendations.filter(r => r.priority === 'critical').length;
  const highCount = recommendations.filter(r => r.priority === 'high').length;
  const totalPotential = recommendations.reduce((sum, rec) => sum + (rec.potentialRevenue || 0), 0);

  if (recommendations.length === 0) return null;

  return (
    <button
      onClick={onClick}
      className="flex items-center gap-3 px-4 py-2.5 bg-gradient-to-r from-terra-50 to-gold-50 rounded-lg border border-terra-100 hover:shadow-md transition-shadow w-full text-left"
    >
      <div className="flex items-center gap-2">
        <Zap className="w-4 h-4 text-terra-600" />
        <span className="text-[12px] font-semibold text-neutral-800">
          {recommendations.length} AI Insight{recommendations.length !== 1 ? 's' : ''}
        </span>
      </div>
      {totalPotential > 0 && (
        <span className="text-[11px] font-medium text-sage-600">
          +${totalPotential.toLocaleString()} potential
        </span>
      )}
      <div className="flex items-center gap-1 ml-auto">
        {criticalCount > 0 && (
          <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
        )}
        {highCount > 0 && (
          <span className="w-2 h-2 rounded-full bg-gold-500" />
        )}
        <ArrowRight className="w-3 h-3 text-neutral-400 ml-1" />
      </div>
    </button>
  );
};

export default RecommendationCard;
