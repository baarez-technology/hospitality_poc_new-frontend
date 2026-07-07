import { TrendingUp, Users, Percent, ArrowUp, ArrowDown } from 'lucide-react';
import { useCurrency } from '@/hooks/useCurrency';

export default function RevenueSummaryCards({ summary, yoyComparison }) {
  const { symbol } = useCurrency();

  const cards = [
    {
      title: 'Total Revenue',
      value: `${symbol}${(summary.totalRevenue / 1000).toFixed(1)}K`,
      change: yoyComparison.revenueGrowth,
      icon: () => <span className="text-base font-bold">{symbol}</span>,
      iconBg: 'bg-[#A57865]/10',
      iconColor: 'text-[#A57865]',
      description: '30-day total'
    },
    {
      title: 'Average ADR',
      value: `${symbol}${summary.avgADR}`,
      change: yoyComparison.adrGrowth,
      icon: TrendingUp,
      iconBg: 'bg-[#5C9BA4]/10',
      iconColor: 'text-[#5C9BA4]',
      description: 'Avg daily rate'
    },
    {
      title: 'Occupancy',
      value: `${summary.avgOccupancy}%`,
      change: yoyComparison.occupancyGrowth,
      icon: Users,
      iconBg: 'bg-[#CDB261]/10',
      iconColor: 'text-[#CDB261]',
      description: 'Average rate'
    },
    {
      title: 'RevPAR',
      value: `${symbol}${summary.avgRevPAR}`,
      change: yoyComparison.revparGrowth,
      icon: Percent,
      iconBg: 'bg-[#4E5840]/10',
      iconColor: 'text-[#4E5840]',
      description: 'Revenue per available room'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, index) => {
        const Icon = card.icon;
        const isPositive = card.change >= 0;

        return (
          <div
            key={index}
            className="bg-white rounded-xl p-5 border border-neutral-200 hover:border-neutral-300 hover:shadow-sm transition-all duration-200"
          >
            <div className="flex items-start justify-between mb-4">
              {/* Icon */}
              <div className={`w-10 h-10 rounded-xl ${card.iconBg} flex items-center justify-center`}>
                <Icon className={`w-5 h-5 ${card.iconColor}`} />
              </div>

              {/* Change indicator */}
              <div className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold ${
                isPositive
                  ? 'bg-[#4E5840]/10 text-[#4E5840]'
                  : 'bg-rose-50 text-rose-600'
              }`}>
                {isPositive ? (
                  <ArrowUp className="w-3 h-3" />
                ) : (
                  <ArrowDown className="w-3 h-3" />
                )}
                <span>{Math.abs(card.change).toFixed(1)}%</span>
              </div>
            </div>

            {/* Title */}
            <p className="text-xs font-medium text-neutral-500 uppercase tracking-wide mb-1">{card.title}</p>

            {/* Value */}
            <p className="text-2xl font-bold text-neutral-900 mb-1">{card.value}</p>

            {/* Description */}
            <p className="text-xs text-neutral-400">{card.description}</p>
          </div>
        );
      })}
    </div>
  );
}
