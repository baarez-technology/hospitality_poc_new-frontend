import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, Users, Clock } from 'lucide-react';
import { cn } from '../../lib/utils';

/**
 * HousekeepingStatus - Visual room status grid
 * Features: Color-coded grid, legend, staff stats, hover effects
 */

const statusConfig = {
  dirty: {
    color: 'bg-rose-400',
    hoverColor: 'hover:bg-rose-500',
    label: 'Needs Cleaning',
  },
  cleaning: {
    color: 'bg-amber-400',
    hoverColor: 'hover:bg-amber-500',
    label: 'In Progress',
  },
  clean: {
    color: 'bg-emerald-400',
    hoverColor: 'hover:bg-emerald-500',
    label: 'Ready',
    opacity: 'opacity-60',
  },
};

export default function HousekeepingStatus({ summary, totalRooms = 36, className }) {
  const navigate = useNavigate();

  const roomItems = useMemo(() => {
    const items = [];
    for (let i = 0; i < totalRooms; i++) {
      let status = 'clean';
      if (i < summary.dirty) status = 'dirty';
      else if (i < summary.dirty + summary.inProgress) status = 'cleaning';
      items.push({ id: i + 101, status });
    }
    return items;
  }, [summary, totalRooms]);

  return (
    <div className={cn(
      "bg-white rounded-2xl border border-neutral-100",
      "shadow-sm hover:shadow-lg transition-all duration-300",
      "overflow-hidden",
      className
    )}>
      {/* Header */}
      <div className="px-6 py-4 border-b border-neutral-100">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-neutral-900">Housekeeping</h3>
            <p className="text-xs text-neutral-400 mt-0.5">Room status overview</p>
          </div>
          <button
            onClick={() => navigate('/admin/housekeeping')}
            className={cn(
              "flex items-center gap-1 text-xs font-semibold",
              "text-terra-500 hover:text-terra-600",
              "transition-colors"
            )}
          >
            Manage
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Legend */}
        <div className="flex items-center justify-between mb-4">
          {Object.entries(statusConfig).map(([key, config]) => {
            const count = key === 'dirty' ? summary.dirty
              : key === 'cleaning' ? summary.inProgress
              : summary.clean;

            return (
              <div key={key} className="flex items-center gap-2">
                <div className={cn("w-2.5 h-2.5 rounded-sm", config.color, config.opacity)} />
                <span className="text-xs text-neutral-500">
                  {config.label}
                </span>
                <span className="text-xs font-bold text-neutral-900">
                  ({count})
                </span>
              </div>
            );
          })}
        </div>

        {/* Room Grid */}
        <div className="p-4 rounded-xl bg-gradient-to-br from-neutral-50 to-terra-50/30">
          <div className="grid grid-cols-9 gap-1.5">
            {roomItems.map((room) => {
              const config = statusConfig[room.status];
              return (
                <div
                  key={room.id}
                  className={cn(
                    "aspect-square rounded-md cursor-pointer",
                    "transition-all duration-200",
                    "hover:scale-125 hover:z-10 hover:shadow-lg",
                    config.color,
                    config.hoverColor,
                    config.opacity
                  )}
                  title={`Room ${room.id}: ${config.label}`}
                />
              );
            })}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-neutral-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-terra-50 flex items-center justify-center">
              <Clock className="w-5 h-5 text-terra-600" />
            </div>
            <div>
              <p className="text-xl font-semibold text-neutral-900">
                {summary.avgCleaningTime}<span className="text-sm text-neutral-400 ml-0.5">min</span>
              </p>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-neutral-400">
                Avg Clean Time
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sage-50 flex items-center justify-center">
              <Users className="w-5 h-5 text-sage-600" />
            </div>
            <div>
              <p className="text-xl font-semibold text-neutral-900">{summary.staffOnShift}</p>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-neutral-400">
                Staff Active
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
