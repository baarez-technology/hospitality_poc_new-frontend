import { useMemo } from 'react';
import {
  ThumbsUp,
  ThumbsDown,
  Minus,
  Star,
  MessageSquare,
  TrendingUp,
  TrendingDown,
  Activity
} from 'lucide-react';

const getSentimentColor = (score) => {
  if (score >= 70) return '#4E5840';
  if (score >= 40) return '#C8B29D';
  return '#CDB261';
};

export default function SentimentSummary({ metrics }) {
  const kpis = useMemo(() => [
    {
      id: 'overall',
      label: 'Overall Sentiment',
      value: metrics.overallSentiment,
      suffix: '/100',
      icon: Activity,
      color: getSentimentColor(metrics.overallSentiment),
      bgColor: `${getSentimentColor(metrics.overallSentiment)}15`
    },
    {
      id: 'positive',
      label: 'Positive',
      value: metrics.positivePercent,
      suffix: '%',
      icon: ThumbsUp,
      color: '#4E5840',
      bgColor: '#4E584015'
    },
    {
      id: 'negative',
      label: 'Negative',
      value: metrics.negativePercent,
      suffix: '%',
      icon: ThumbsDown,
      color: '#CDB261',
      bgColor: '#CDB26120'
    },
    {
      id: 'neutral',
      label: 'Neutral',
      value: metrics.neutralPercent,
      suffix: '%',
      icon: Minus,
      color: '#C8B29D',
      bgColor: '#C8B29D20'
    },
    {
      id: 'ota',
      label: 'OTA Rating',
      value: metrics.avgOTARating,
      suffix: '/5',
      icon: Star,
      color: '#A57865',
      bgColor: '#A5786510'
    },
    {
      id: 'new',
      label: 'New Today',
      value: metrics.newReviewsToday,
      suffix: '',
      icon: MessageSquare,
      color: '#5C9BA4',
      bgColor: '#5C9BA410'
    },
    {
      id: 'trend',
      label: '7-Day Trend',
      value: metrics.reviewVolumeTrend > 0 ? `+${metrics.reviewVolumeTrend}` : metrics.reviewVolumeTrend,
      suffix: '',
      icon: metrics.reviewVolumeTrend >= 0 ? TrendingUp : TrendingDown,
      color: metrics.reviewVolumeTrend >= 0 ? '#4E5840' : '#CDB261',
      bgColor: metrics.reviewVolumeTrend >= 0 ? '#4E584015' : '#CDB26120'
    }
  ], [metrics]);

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-4">
      {kpis.map((kpi) => {
        const Icon = kpi.icon;
        return (
          <div
            key={kpi.id}
            className="bg-white rounded-xl border border-[#E5E5E5] p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center gap-2 mb-3">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: kpi.bgColor }}
              >
                <Icon className="w-4 h-4" style={{ color: kpi.color }} />
              </div>
            </div>
            <div>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold text-neutral-900">
                  {kpi.value}
                </span>
                {kpi.suffix && (
                  <span className="text-sm text-neutral-500">{kpi.suffix}</span>
                )}
              </div>
              <p className="text-xs text-neutral-500 mt-1">{kpi.label}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
