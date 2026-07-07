import { useMemo } from 'react';
import {
  TrendingUp,
  Star,
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  MessageCircle
} from 'lucide-react';
import { calculateReputationKPIs } from '@/utils/admin/reputation';

export default function KPICards({ reviews }) {
  const kpis = useMemo(() => {
    return calculateReputationKPIs(reviews);
  }, [reviews]);

  const kpiCards = [
    {
      label: 'Global Sentiment',
      value: kpis.globalSentiment,
      suffix: '/100',
      icon: TrendingUp,
      bgColor: 'bg-[#A57865]/10',
      iconColor: 'text-[#A57865]',
      borderColor: 'border-[#A57865]/20',
      trend: '+5%',
      trendUp: true
    },
    {
      label: 'Average Rating',
      value: kpis.averageRating,
      suffix: '/5',
      icon: Star,
      bgColor: 'bg-[#CDB261]/10',
      iconColor: 'text-[#CDB261]',
      borderColor: 'border-[#CDB261]/20',
      trend: '+0.2',
      trendUp: true
    },
    {
      label: 'Total Reviews',
      value: kpis.totalReviews,
      suffix: '',
      icon: MessageSquare,
      bgColor: 'bg-[#5C9BA4]/10',
      iconColor: 'text-[#5C9BA4]',
      borderColor: 'border-[#5C9BA4]/20',
      trend: '+12',
      trendUp: true
    },
    {
      label: 'Positive Reviews',
      value: kpis.positiveReviews,
      suffix: '',
      icon: ThumbsUp,
      bgColor: 'bg-[#4E5840]/10',
      iconColor: 'text-[#4E5840]',
      borderColor: 'border-[#4E5840]/20',
      trend: '+8',
      trendUp: true
    },
    {
      label: 'Negative Reviews',
      value: kpis.negativeReviews,
      suffix: '',
      icon: ThumbsDown,
      bgColor: kpis.negativeReviews > 5 ? 'bg-red-50' : 'bg-neutral-50',
      iconColor: kpis.negativeReviews > 5 ? 'text-red-600' : 'text-neutral-600',
      borderColor: kpis.negativeReviews > 5 ? 'border-red-200' : 'border-neutral-200',
      trend: '-2',
      trendUp: false
    },
    {
      label: 'Response Rate',
      value: kpis.responseRate,
      suffix: '%',
      icon: MessageCircle,
      bgColor: kpis.responseRate >= 80 ? 'bg-[#4E5840]/10' : 'bg-[#CDB261]/10',
      iconColor: kpis.responseRate >= 80 ? 'text-[#4E5840]' : 'text-[#CDB261]',
      borderColor: kpis.responseRate >= 80 ? 'border-[#4E5840]/20' : 'border-[#CDB261]/20',
      trend: '+10%',
      trendUp: true
    }
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
      {kpiCards.map((kpi) => (
        <div
          key={kpi.label}
          className={`${kpi.bgColor} rounded-xl p-4 border ${kpi.borderColor}`}
        >
          <div className="flex items-center justify-between mb-3">
            <kpi.icon className={`w-5 h-5 ${kpi.iconColor}`} />
            <span className={`text-xs font-medium ${kpi.trendUp ? 'text-[#4E5840]' : 'text-red-600'}`}>
              {kpi.trend}
            </span>
          </div>
          <p className="text-2xl font-bold text-neutral-900">
            {kpi.value}
            <span className="text-sm font-normal text-neutral-500">{kpi.suffix}</span>
          </p>
          <p className="text-xs text-neutral-600 mt-1">{kpi.label}</p>
        </div>
      ))}
    </div>
  );
}
