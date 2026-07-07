import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Percent,
  BarChart3,
  Calendar,
  Building2
} from 'lucide-react';
import { useCurrency } from '@/hooks/useCurrency';

interface KPIData {
  // API format (snake_case)
  total_revenue?: number;
  revenue_trend?: number;
  adr?: number;
  adr_trend?: number;
  revpar?: number;
  revpar_trend?: number;
  occupancy?: number;
  occupancy_trend?: number;
  occupied_room_nights?: number;
  available_room_nights?: number;
  // Legacy format (camelCase)
  todayRevenue?: number;
  yesterdayRevenue?: number;
  forecastedRevenue7Days?: number;
  growth?: number;
  roomsSold?: number;
  totalRooms?: number;
}

interface KPICardsProps {
  data?: KPIData | null;
}

export default function KPICards({ data }: KPICardsProps) {
  const { symbol } = useCurrency();

  const formatCurrencyCompact = (value: number) => {
    if (value >= 1000000) {
      return `${symbol}${(value / 1000000).toFixed(1)}M`;
    }
    if (value >= 1000) {
      return `${symbol}${(value / 1000).toFixed(0)}K`;
    }
    return `${symbol}${value.toLocaleString()}`;
  };
  // Loading skeleton when no data
  if (!data) {
    return (
      <div className="grid grid-cols-2 tablet:grid-cols-3 lg:grid-cols-6 gap-3 tablet:gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="bg-white rounded-xl border border-[#E5E5E5] p-5 relative overflow-hidden"
          >
            <div className="absolute top-4 right-4 w-10 h-10 rounded-lg bg-neutral-100 animate-pulse" />
            <div className="pr-12">
              <div className="h-3 w-16 bg-neutral-100 rounded animate-pulse mb-2" />
              <div className="h-7 w-24 bg-neutral-200 rounded animate-pulse" />
              <div className="h-3 w-20 bg-neutral-100 rounded animate-pulse mt-3" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Normalize data - handle both API format and legacy format
  const todayRevenue = data.total_revenue ?? data.todayRevenue ?? 0;
  const revenueTrend = data.revenue_trend ?? (data.yesterdayRevenue ? Math.round(((todayRevenue - data.yesterdayRevenue) / data.yesterdayRevenue) * 100) : 0);
  const adr = data.adr ?? 0;
  const revpar = data.revpar ?? 0;
  const occupancy = data.occupancy ?? 0;
  const roomsSold = data.occupied_room_nights ?? data.roomsSold ?? 0;
  const totalRooms = data.available_room_nights ?? data.totalRooms ?? 0;
  const forecastedRevenue = data.forecastedRevenue7Days ?? (todayRevenue * 7) ?? 0;
  const growth = data.revenue_trend ?? data.growth ?? 0;

  const kpis = [
    {
      id: 'todayRevenue',
      label: "Today's Revenue",
      value: formatCurrencyCompact(todayRevenue),
      icon: DollarSign,
      color: '#A57865',
      bgColor: 'bg-[#A57865]/10',
      trend: revenueTrend >= 0 ? 'up' : 'down',
      trendValue: revenueTrend
    },
    {
      id: 'adr',
      label: 'ADR',
      value: `${symbol}${adr.toLocaleString()}`,
      icon: Building2,
      color: '#5C9BA4',
      bgColor: 'bg-[#5C9BA4]/10',
      subLabel: 'Avg Daily Rate'
    },
    {
      id: 'revpar',
      label: 'RevPAR',
      value: `${symbol}${revpar.toLocaleString()}`,
      icon: BarChart3,
      color: '#4E5840',
      bgColor: 'bg-[#4E5840]/10',
      subLabel: 'Revenue Per Available Room'
    },
    {
      id: 'occupancy',
      label: 'Occupancy',
      value: `${occupancy}%`,
      icon: Percent,
      color: '#CDB261',
      bgColor: 'bg-[#CDB261]/10',
      progress: occupancy
    },
    {
      id: 'forecast',
      label: 'Forecasted Revenue',
      value: formatCurrencyCompact(forecastedRevenue),
      icon: Calendar,
      color: '#8E6554',
      bgColor: 'bg-[#8E6554]/10',
      subLabel: 'Next 7 Days'
    },
    {
      id: 'growth',
      label: 'Revenue Growth',
      value: `${growth > 0 ? '+' : ''}${growth}%`,
      icon: growth >= 0 ? TrendingUp : TrendingDown,
      color: growth >= 0 ? '#4E5840' : '#DC2626',
      bgColor: growth >= 0 ? 'bg-[#4E5840]/10' : 'bg-red-100',
      subLabel: 'vs Last Period'
    }
  ];

  return (
    <div className="grid grid-cols-2 tablet:grid-cols-3 lg:grid-cols-6 gap-3 tablet:gap-4">
      {kpis.map((kpi) => {
        const Icon = kpi.icon;
        return (
          <div
            key={kpi.id}
            className="bg-white rounded-xl border border-[#E5E5E5] p-5 relative overflow-hidden group hover:shadow-md transition-shadow"
          >
            {/* Icon */}
            <div className={`absolute top-4 right-4 w-10 h-10 rounded-lg ${kpi.bgColor} flex items-center justify-center`}>
              <Icon className="w-5 h-5" style={{ color: kpi.color }} />
            </div>

            {/* Content */}
            <div className="pr-12">
              <p className="text-xs font-medium text-neutral-500 uppercase tracking-wider mb-1">
                {kpi.label}
              </p>
              <p className="text-2xl font-bold text-neutral-900" style={{ color: kpi.color }}>
                {kpi.value}
              </p>

              {/* Trend indicator */}
              {kpi.trend && (
                <div className={`flex items-center gap-1 mt-2 text-xs ${
                  kpi.trend === 'up' ? 'text-[#4E5840]' : 'text-red-600'
                }`}>
                  {kpi.trend === 'up' ? (
                    <TrendingUp className="w-3 h-3" />
                  ) : (
                    <TrendingDown className="w-3 h-3" />
                  )}
                  <span>{kpi.trendValue > 0 ? '+' : ''}{kpi.trendValue}% vs yesterday</span>
                </div>
              )}

              {/* Sub label */}
              {kpi.subLabel && (
                <p className="text-xs text-neutral-400 mt-2">{kpi.subLabel}</p>
              )}

              {/* Progress bar for occupancy */}
              {kpi.progress !== undefined && (
                <div className="mt-3">
                  <div className="h-1.5 bg-neutral-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${kpi.progress}%`,
                        backgroundColor: kpi.color
                      }}
                    />
                  </div>
                  <p className="text-xs text-neutral-400 mt-1">
                    {roomsSold} / {totalRooms} rooms
                  </p>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
