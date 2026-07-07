import { TrendingUp, TrendingDown, Minus, Bed, DollarSign, UserCheck, AlertCircle } from 'lucide-react';

const iconMap = {
  bed: Bed,
  'dollar-sign': DollarSign,
  'user-check': UserCheck,
  'alert-circle': AlertCircle,
};

const KpiCard = ({ kpi }) => {
  const Icon = iconMap[kpi.icon] || Bed;

  const getTrendColor = (trend) => {
    if (trend === 'up') return 'text-[#4E5840]';
    if (trend === 'down') return 'text-[#CDB261]';
    return 'text-neutral-500';
  };

  const getTrendIcon = (trend) => {
    if (trend === 'up') return <TrendingUp className="w-4 h-4" />;
    if (trend === 'down') return <TrendingDown className="w-4 h-4" />;
    return <Minus className="w-4 h-4" />;
  };

  const getTrendBg = (trend) => {
    if (trend === 'up') return 'bg-[#4E5840]/10';
    if (trend === 'down') return 'bg-[#CDB261]/20';
    return 'bg-neutral-100';
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-neutral-200 hover:shadow transition-all">
      <div className="flex items-start justify-between mb-4">
        <div className={`p-3 rounded-lg ${getTrendBg(kpi.trend)}`}>
          <Icon className={`w-6 h-6 ${getTrendColor(kpi.trend)}`} />
        </div>
        <div className={`flex items-center gap-1 px-2.5 py-1 rounded-lg ${getTrendBg(kpi.trend)}`}>
          {getTrendIcon(kpi.trend)}
          <span className={`text-sm font-semibold ${getTrendColor(kpi.trend)}`}>
            {kpi.change}
          </span>
        </div>
      </div>

      <div>
        <h3 className="text-neutral-600 text-sm font-medium mb-1">
          {kpi.title}
        </h3>
        <p className="text-3xl font-bold text-neutral-900 mb-1">
          {kpi.value}
        </p>
        <p className="text-xs text-neutral-500">
          {kpi.description}
        </p>
      </div>
    </div>
  );
};

export default KpiCard;
