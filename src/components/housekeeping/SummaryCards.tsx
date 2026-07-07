import { Home, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';

export default function SummaryCards({ counts }) {
  const cards = [
    {
      id: 'total',
      title: 'Total Rooms',
      value: counts.total,
      icon: Home,
      iconBgColor: 'bg-terra-50',
      iconBorderColor: 'border-terra-100',
      iconColor: 'text-terra-600'
    },
    {
      id: 'clean',
      title: 'Clean Rooms',
      value: counts.clean,
      icon: CheckCircle,
      iconBgColor: 'bg-sage-50',
      iconBorderColor: 'border-sage-100',
      iconColor: 'text-sage-600'
    },
    {
      id: 'dirty',
      title: 'Dirty Rooms',
      value: counts.dirty,
      icon: AlertTriangle,
      iconBgColor: 'bg-rose-50',
      iconBorderColor: 'border-rose-100',
      iconColor: 'text-rose-600'
    },
    {
      id: 'out_of_service',
      title: 'Out of Service',
      value: counts.out_of_service,
      icon: XCircle,
      iconBgColor: 'bg-gold-50',
      iconBorderColor: 'border-gold-100',
      iconColor: 'text-gold-600'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card) => {
        const Icon = card.icon;

        return (
          <div
            key={card.id}
            className="bg-white rounded-[10px] p-6"
          >
            {/* Header with Icon and Title */}
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${card.iconBgColor}`}>
                <Icon className={`w-4 h-4 ${card.iconColor}`} />
              </div>
              <p className="text-[11px] font-semibold uppercase tracking-widest text-neutral-400">
                {card.title}
              </p>
            </div>

            {/* Value */}
            <p className="text-[28px] font-semibold tracking-tight text-neutral-900">
              {card.value}
            </p>
          </div>
        );
      })}
    </div>
  );
}
