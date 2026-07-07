import { Home, CheckCircle, AlertTriangle, XCircle, Ban, Wrench } from 'lucide-react';

export default function SummaryCards({ counts = {} }) {
  // Ensure counts has all expected properties with defaults
  const safeCounts = {
    total: counts.total || 0,
    clean: counts.clean || 0,
    dirty: counts.dirty || 0,
    out_of_service: counts.out_of_service || 0,
    out_of_order: counts.out_of_order || 0,
    maintenance: counts.maintenance || 0,
  };
  const cards = [
    {
      id: 'total',
      title: 'Total Rooms',
      value: safeCounts.total,
      icon: Home,
      iconBgColor: 'bg-[#A57865]/10',
      iconColor: 'text-[#A57865]'
    },
    {
      id: 'clean',
      title: 'Clean Rooms',
      value: safeCounts.clean,
      icon: CheckCircle,
      iconBgColor: 'bg-[#4E5840]/10',
      iconColor: 'text-[#4E5840]'
    },
    {
      id: 'dirty',
      title: 'Dirty Rooms',
      value: safeCounts.dirty,
      icon: AlertTriangle,
      iconBgColor: 'bg-red-50',
      iconColor: 'text-red-600'
    },
    {
      id: 'out_of_service',
      title: 'Out of Service',
      value: safeCounts.out_of_service,
      icon: XCircle,
      iconBgColor: 'bg-amber-50',
      iconColor: 'text-amber-600'
    },
    {
      id: 'out_of_order',
      title: 'Out of Order',
      value: safeCounts.out_of_order,
      icon: Ban,
      iconBgColor: 'bg-rose-50',
      iconColor: 'text-rose-600'
    },
    {
      id: 'maintenance',
      title: 'Maintenance',
      value: safeCounts.maintenance,
      icon: Wrench,
      iconBgColor: 'bg-orange-50',
      iconColor: 'text-orange-600'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
      {cards.map((card) => {
        const Icon = card.icon;

        return (
          <div
            key={card.id}
            className="bg-white rounded-2xl p-6 border border-neutral-200/60 hover:border-[#A57865]/30 transition-all duration-300 ease-out flex flex-col justify-between group cursor-pointer overflow-hidden relative"
          >
            {/* Subtle gradient overlay on hover */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#A57865]/0 to-[#A57865]/0 group-hover:from-[#A57865]/5 group-hover:to-transparent transition-all duration-300 pointer-events-none"></div>

            <div className="flex items-start justify-between mb-5 relative z-10">
              {/* Icon Box */}
              <div className={`${card.iconBgColor} rounded-xl p-3 transition-all duration-300 group-hover:scale-110 group-hover:rotate-3`}>
                <Icon className={`w-5 h-5 ${card.iconColor}`} />
              </div>
            </div>

            <div className="relative z-10 space-y-2">
              {/* Title */}
              <h3 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                {card.title}
              </h3>

              {/* Value */}
              <p className="text-3xl font-bold text-neutral-900 leading-none transition-all duration-200 group-hover:text-[#A57865]">
                {card.value}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
