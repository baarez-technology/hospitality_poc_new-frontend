import { DollarSign, TrendingUp, Users, Percent, ArrowUp, ArrowDown } from 'lucide-react';
import { useCurrency } from '@/hooks/useCurrency';

export default function RevenueSummaryCards({ summary, yoyComparison }) {
  const { symbol } = useCurrency();
  const cards = [
    {
      title: 'Total Revenue',
      value: `${symbol}${(summary.totalRevenue / 1000).toFixed(1)}K`,
      change: yoyComparison.revenueGrowth,
      icon: DollarSign,
      color: 'primary',
      description: '30-day total'
    },
    {
      title: 'Average ADR',
      value: `${symbol}${summary.avgADR}`,
      change: yoyComparison.adrGrowth,
      icon: TrendingUp,
      color: 'aurora',
      description: 'Avg daily rate'
    },
    {
      title: 'Occupancy',
      value: `${summary.avgOccupancy}%`,
      change: yoyComparison.occupancyGrowth,
      icon: Users,
      color: 'sunset',
      description: 'Average rate'
    },
    {
      title: 'RevPAR',
      value: `${symbol}${summary.avgRevPAR}`,
      change: yoyComparison.revparGrowth,
      icon: Percent,
      color: 'green',
      description: 'Revenue per available room'
    }
  ];

  const getColorClasses = (color) => {
    const colors = {
      primary: 'from-primary-500 to-primary-600',
      aurora: 'from-aurora-500 to-aurora-600',
      sunset: 'from-sunset-500 to-sunset-600',
      green: 'from-green-500 to-green-600'
    };
    return colors[color] || colors.primary;
  };

  return (
    <div className="grid grid-cols-2 tablet:grid-cols-2 md:grid-cols-4 gap-4 tablet:gap-5 lg:gap-6">
      {cards.map((card, index) => {
        const Icon = card.icon;
        const isPositive = card.change >= 0;

        return (
          <div
            key={index}
            className="bg-white rounded-xl p-6 border border-neutral-200 hover:shadow transition-shadow duration-200"
          >
            {/* Icon */}
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${getColorClasses(card.color)} flex items-center justify-center mb-4`}>
              <Icon className="w-6 h-6 text-white" />
            </div>

            {/* Title */}
            <h3 className="text-sm font-medium text-neutral-600 mb-1">{card.title}</h3>

            {/* Value */}
            <div className="flex items-baseline gap-3 mb-2">
              <span className="text-3xl font-bold text-neutral-900">{card.value}</span>
              <div className={`flex items-center gap-1 text-sm font-semibold ${
                isPositive ? 'text-[#4E5840]' : 'text-red-600'
              }`}>
                {isPositive ? (
                  <ArrowUp className="w-4 h-4" />
                ) : (
                  <ArrowDown className="w-4 h-4" />
                )}
                <span>{Math.abs(card.change).toFixed(1)}%</span>
              </div>
            </div>

            {/* Description */}
            <p className="text-xs text-neutral-500">{card.description}</p>
          </div>
        );
      })}
    </div>
  );
}
