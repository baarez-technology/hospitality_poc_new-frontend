import { useMemo } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Smile,
  Frown,
  Meh,
  Star,
  MessageSquarePlus,
  Activity,
  BarChart3
} from 'lucide-react';

interface SentimentSummaryProps {
  metrics: {
    overallSentiment: number;
    positivePercent: number;
    negativePercent: number;
    neutralPercent: number;
    avgOTARating: string | number;
    newReviewsToday: number;
    reviewVolumeTrend: number;
    totalReviews?: number;
  };
}

export default function SentimentSummary({ metrics }: SentimentSummaryProps) {
  const kpis = useMemo(() => [
    {
      id: 'overall',
      title: 'Overall Sentiment',
      value: metrics.overallSentiment,
      suffix: '/100',
      icon: Activity,
      iconBgColor: 'bg-terra-50',
      iconColor: 'text-terra-600',
      trend: metrics.overallSentiment >= 70 ? 'up' : 'down',
      trendValue: metrics.overallSentiment >= 70 ? 'Good' : 'Needs work',
      trendColor: metrics.overallSentiment >= 70 ? 'text-sage-600' : 'text-rose-600'
    },
    {
      id: 'positive',
      title: 'Positive',
      value: metrics.positivePercent,
      suffix: '%',
      icon: Smile,
      iconBgColor: 'bg-sage-50',
      iconColor: 'text-sage-600',
      trend: 'up',
      trendValue: '+2.3%',
      trendColor: 'text-sage-600'
    },
    {
      id: 'negative',
      title: 'Negative',
      value: metrics.negativePercent,
      suffix: '%',
      icon: Frown,
      iconBgColor: 'bg-rose-50',
      iconColor: 'text-rose-600',
      trend: 'down',
      trendValue: '-1.2%',
      trendColor: 'text-sage-600'
    },
    {
      id: 'neutral',
      title: 'Neutral',
      value: metrics.neutralPercent,
      suffix: '%',
      icon: Meh,
      iconBgColor: 'bg-neutral-100',
      iconColor: 'text-neutral-500',
      trend: 'neutral',
      trendValue: '0%',
      trendColor: 'text-neutral-500'
    },
    {
      id: 'ota',
      title: 'OTA Rating',
      value: metrics.avgOTARating,
      suffix: '/5',
      icon: Star,
      iconBgColor: 'bg-gold-50',
      iconColor: 'text-gold-600',
      trend: 'up',
      trendValue: '+0.1',
      trendColor: 'text-sage-600'
    },
    {
      id: 'new',
      title: 'New Today',
      value: metrics.newReviewsToday,
      suffix: '',
      icon: MessageSquarePlus,
      iconBgColor: 'bg-ocean-50',
      iconColor: 'text-ocean-600',
      trend: 'neutral',
      trendValue: 'reviews',
      trendColor: 'text-neutral-500'
    },
    {
      id: 'trend',
      title: '7-Day Trend',
      value: metrics.reviewVolumeTrend > 0 ? `+${metrics.reviewVolumeTrend}` : metrics.reviewVolumeTrend,
      suffix: '',
      icon: BarChart3,
      iconBgColor: metrics.reviewVolumeTrend >= 0 ? 'bg-sage-50' : 'bg-rose-50',
      iconColor: metrics.reviewVolumeTrend >= 0 ? 'text-sage-600' : 'text-rose-600',
      trend: metrics.reviewVolumeTrend >= 0 ? 'up' : 'down',
      trendValue: metrics.reviewVolumeTrend >= 0 ? 'vs last week' : 'vs last week',
      trendColor: metrics.reviewVolumeTrend >= 0 ? 'text-sage-600' : 'text-rose-600'
    }
  ], [metrics]);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-3 sm:gap-4">
      {kpis.map((kpi) => {
        const Icon = kpi.icon;
        const TrendIcon = kpi.trend === 'up' ? TrendingUp : kpi.trend === 'down' ? TrendingDown : null;

        return (
          <div
            key={kpi.id}
            className="bg-white rounded-[10px] p-4 sm:p-5"
          >
            {/* Header with Icon and Title */}
            <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
              <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${kpi.iconBgColor}`}>
                <Icon className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${kpi.iconColor}`} />
              </div>
              <p className="text-[9px] sm:text-[11px] font-semibold uppercase tracking-widest text-neutral-400 truncate">
                {kpi.title}
              </p>
            </div>

            {/* Value + Trend Row */}
            <div className="flex items-center justify-between">
              <div className="flex items-baseline gap-0.5">
                <p className="text-xl sm:text-[28px] font-semibold tracking-tight text-neutral-900">
                  {kpi.value}
                </p>
                {kpi.suffix && (
                  <span className="text-[11px] sm:text-[13px] text-neutral-400">{kpi.suffix}</span>
                )}
              </div>
              <p className={`text-[10px] sm:text-[11px] font-medium ${kpi.trendColor} flex items-center gap-1`}>
                {TrendIcon && (
                  <TrendIcon className="w-3 h-3" />
                )}
                <span className="hidden sm:inline">{kpi.trendValue}</span>
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
