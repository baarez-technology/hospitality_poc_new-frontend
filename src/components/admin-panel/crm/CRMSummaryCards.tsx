import { Users, UserCheck, DollarSign, Repeat } from 'lucide-react';
import { useCurrency } from '@/hooks/useCurrency';

export default function CRMSummaryCards({ summary }) {
  const { symbol } = useCurrency();
  const cards = [
    {
      title: 'Total Guests',
      value: summary.totalGuests.toLocaleString(),
      change: summary.totalGuestsChange,
      trend: summary.totalGuestsTrend,
      icon: Users,
      color: 'primary',
      bgColor: 'bg-[#A57865]/10',
      iconColor: 'text-[#A57865]'
    },
    {
      title: 'Active Guests',
      value: summary.activeGuests.toLocaleString(),
      change: summary.activeGuestsChange,
      trend: summary.activeGuestsTrend,
      icon: UserCheck,
      color: 'aurora',
      bgColor: 'bg-[#5C9BA4]/15',
      iconColor: 'text-[#5C9BA4]'
    },
    {
      title: 'Average LTV',
      value: `${symbol}${summary.averageLTV.toLocaleString()}`,
      change: summary.averageLTVChange,
      trend: summary.averageLTVTrend,
      icon: DollarSign,
      color: 'green',
      bgColor: 'bg-green-100',
      iconColor: 'text-[#4E5840]'
    },
    {
      title: 'Retention Rate',
      value: `${summary.retentionRate}%`,
      change: summary.retentionRateChange,
      trend: summary.retentionRateTrend,
      icon: Repeat,
      color: 'sunset',
      bgColor: 'bg-[#CDB261]/25',
      iconColor: 'text-[#CDB261]'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card, index) => {
        const Icon = card.icon;
        const isPositive = card.trend === 'up';

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
            <p className="text-sm text-neutral-600 mb-1">{card.title}</p>

            {/* Value */}
            <div className="flex items-baseline gap-2 mb-2">
              <h3 className="text-3xl font-bold text-neutral-900">{card.value}</h3>
            </div>

            {/* Change */}
            <div className="flex items-center gap-1">
              <span className={`text-sm font-semibold ${isPositive ? 'text-[#4E5840]' : 'text-red-600'}`}>
                {card.change}
              </span>
              <span className="text-xs text-neutral-500">vs last month</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
