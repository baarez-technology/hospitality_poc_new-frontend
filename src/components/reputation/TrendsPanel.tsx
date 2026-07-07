import { TrendingUp, TrendingDown, Minus, AlertTriangle } from 'lucide-react';
import { useReputation } from '@/context/ReputationContext';

export default function TrendsPanel() {
  // Trends are loaded by ReputationContext on mount - no need to fetch again
  const { trends: trendsData, isLoading } = useReputation();

  if (isLoading) {
    return (
      <div className="bg-white rounded-[10px] p-6 animate-pulse">
        <div className="h-5 bg-neutral-200 rounded w-1/3 mb-5" />
        <div className="space-y-3">
          <div className="h-16 bg-neutral-100 rounded-[8px]" />
          <div className="h-16 bg-neutral-100 rounded-[8px]" />
        </div>
      </div>
    );
  }

  const getTrendIcon = (direction: string) => {
    switch (direction) {
      case 'up':
        return <TrendingUp className="w-5 h-5 text-sage-600" />;
      case 'down':
        return <TrendingDown className="w-5 h-5 text-gold-600" />;
      default:
        return <Minus className="w-5 h-5 text-neutral-400" />;
    }
  };

  const getTrendColor = (direction: string) => {
    switch (direction) {
      case 'up':
        return 'text-sage-700 bg-sage-50';
      case 'down':
        return 'text-gold-700 bg-gold-50';
      default:
        return 'text-neutral-600 bg-neutral-50';
    }
  };

  return (
    <div className="bg-white rounded-[10px] p-6">
      <div className="mb-5">
        <h3 className="text-[15px] font-semibold text-neutral-900">Rating Trends</h3>
        <p className="text-[13px] text-neutral-500 mt-0.5">Last 14 days performance</p>
      </div>

      {trendsData ? (
        <div className="space-y-4">
          {/* Trend Summary Card */}
          <div className={`rounded-[8px] p-4 ${getTrendColor(trendsData.direction)}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {getTrendIcon(trendsData.direction)}
                <div>
                  <p className="text-[14px] font-semibold capitalize">{trendsData.direction} Trend</p>
                  <p className="text-[12px] opacity-75">vs previous period</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[22px] font-semibold tracking-tight">
                  {trendsData.rating_change >= 0 ? '+' : ''}
                  {trendsData.rating_change?.toFixed(2) || '0.00'}
                </p>
                <p className="text-[11px] opacity-75">Rating change</p>
              </div>
            </div>
          </div>

          {/* Period Comparison */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-neutral-50 rounded-[8px] p-4">
              <p className="text-[11px] font-semibold uppercase tracking-widest text-neutral-400 mb-1">Current</p>
              <div className="flex items-baseline gap-1.5">
                <p className="text-[20px] font-semibold tracking-tight text-neutral-900">
                  {trendsData.current_period?.avg_rating?.toFixed(2) || '-'}
                </p>
                <span className="text-[11px] text-neutral-400">
                  ({trendsData.current_period?.count || 0})
                </span>
              </div>
            </div>
            <div className="bg-neutral-50 rounded-[8px] p-4">
              <p className="text-[11px] font-semibold uppercase tracking-widest text-neutral-400 mb-1">Previous</p>
              <div className="flex items-baseline gap-1.5">
                <p className="text-[20px] font-semibold tracking-tight text-neutral-900">
                  {trendsData.previous_period?.avg_rating?.toFixed(2) || '-'}
                </p>
                <span className="text-[11px] text-neutral-400">
                  ({trendsData.previous_period?.count || 0})
                </span>
              </div>
            </div>
          </div>

          {/* Alerts Section */}
          {trendsData.direction === 'down' && (
            <div className="flex items-start gap-3 p-4 bg-gold-50 rounded-[8px]">
              <AlertTriangle className="w-4 h-4 text-gold-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-[13px] font-semibold text-gold-800">Attention Required</p>
                <p className="text-[12px] text-gold-700 mt-0.5">
                  Ratings trending down. Review negative feedback.
                </p>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-8 text-neutral-400">
          <TrendingUp className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="text-[14px] font-medium text-neutral-500">No trend data</p>
          <p className="text-[12px]">Check back after more reviews</p>
        </div>
      )}
    </div>
  );
}
