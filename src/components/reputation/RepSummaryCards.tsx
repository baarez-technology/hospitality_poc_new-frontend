import { Star, TrendingUp, MessageCircle, CheckCircle } from 'lucide-react';

export default function RepSummaryCards({ summary }) {
  const cards = [
    {
      title: 'Average Rating',
      value: summary.averageRating,
      suffix: '/5.0',
      icon: Star,
      iconColor: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
      trend: summary.recentTrend,
      trendUp: true
    },
    {
      title: 'Total Reviews',
      value: summary.totalReviews,
      suffix: '',
      icon: MessageCircle,
      iconColor: 'text-[#A57865]',
      bgColor: 'bg-[#A57865]/10',
      trend: '+12 this week',
      trendUp: true
    },
    {
      title: 'Response Rate',
      value: summary.responseRate,
      suffix: '%',
      icon: CheckCircle,
      iconColor: 'text-[#4E5840]',
      bgColor: 'bg-green-100',
      trend: '+8% vs last month',
      trendUp: true
    },
    {
      title: 'Positive Sentiment',
      value: Math.round((summary.positiveCount / summary.totalReviews) * 100),
      suffix: '%',
      icon: TrendingUp,
      iconColor: 'text-[#5C9BA4]',
      bgColor: 'bg-[#5C9BA4]/15',
      trend: '+3.2%',
      trendUp: true
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card, index) => {
        const Icon = card.icon;

        return (
          <div
            key={index}
            className="bg-white rounded-xl p-6 border border-neutral-200 hover:shadow transition-shadow duration-200"
          >
            {/* Icon */}
            <div className={`w-12 h-12 rounded-xl ${card.bgColor} flex items-center justify-center mb-4`}>
              <Icon className={`w-6 h-6 ${card.iconColor}`} />
            </div>

            {/* Title */}
            <p className="text-sm font-medium text-neutral-600 mb-2">
              {card.title}
            </p>

            {/* Value */}
            <div className="flex items-baseline gap-1 mb-2">
              <p className="text-3xl font-bold text-neutral-900">
                {card.value}
              </p>
              <span className="text-lg text-neutral-600">{card.suffix}</span>
            </div>

            {/* Trend */}
            <div className="flex items-center gap-1">
              <TrendingUp className={`w-4 h-4 ${card.trendUp ? 'text-[#4E5840]' : 'text-rose-600'}`} />
              <span className={`text-sm font-medium ${card.trendUp ? 'text-[#4E5840]' : 'text-rose-600'}`}>
                {card.trend}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
