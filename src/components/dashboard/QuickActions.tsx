import { useNavigate } from 'react-router-dom';
import {
  LogIn,
  LogOut,
  Calendar,
  Wrench,
  ChevronRight,
  Wifi,
  Coffee,
  Dumbbell,
  Car,
  Zap,
} from 'lucide-react';
import { cn } from '../../lib/utils';

/**
 * QuickActions - Action buttons with amenity usage stats
 * Features: Hover animations, progress bars, icon styling
 */

const actions = [
  {
    icon: LogIn,
    label: 'Check-in Guest',
    sublabel: 'Process arrival',
    bgColor: 'bg-sage-50',
    textColor: 'text-sage-600',
    hoverBg: 'group-hover:bg-sage-100',
    path: '/admin/guests',
  },
  {
    icon: LogOut,
    label: 'Check-out',
    sublabel: 'Process departure',
    bgColor: 'bg-ocean-50',
    textColor: 'text-ocean-600',
    hoverBg: 'group-hover:bg-ocean-100',
    path: '/admin/guests',
  },
  {
    icon: Wrench,
    label: 'Maintenance',
    sublabel: 'New request',
    bgColor: 'bg-gold-50',
    textColor: 'text-gold-600',
    hoverBg: 'group-hover:bg-gold-100',
    path: '/admin/maintenance',
  },
];

const amenities = [
  { icon: Wifi, name: 'WiFi', usage: 94, color: 'bg-ocean-500' },
  { icon: Coffee, name: 'Breakfast', usage: 78, color: 'bg-gold-500' },
  { icon: Dumbbell, name: 'Gym', usage: 45, color: 'bg-sage-500' },
  { icon: Car, name: 'Parking', usage: 62, color: 'bg-terra-500' },
];

function ActionButton({ action }) {
  const navigate = useNavigate();
  const Icon = action.icon;

  return (
    <button
      onClick={() => navigate(action.path)}
      className={cn(
        "group w-full flex items-center gap-4 p-3 rounded-xl",
        "hover:bg-neutral-50 transition-all duration-300",
        "text-left"
      )}
    >
      <div className={cn(
        "w-11 h-11 rounded-xl flex items-center justify-center",
        "transition-all duration-300",
        "group-hover:scale-110 group-hover:shadow-md",
        action.bgColor,
        action.hoverBg
      )}>
        <Icon className={cn("w-5 h-5", action.textColor)} />
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-neutral-900">{action.label}</p>
        <p className="text-xs text-neutral-400">{action.sublabel}</p>
      </div>

      <ChevronRight className={cn(
        "w-4 h-4 text-neutral-300",
        "opacity-0 -translate-x-2",
        "group-hover:opacity-100 group-hover:translate-x-0",
        "transition-all duration-300"
      )} />
    </button>
  );
}

function AmenityBar({ amenity }) {
  const Icon = amenity.icon;

  return (
    <div className="flex items-center gap-3">
      <Icon className="w-4 h-4 text-neutral-400" />
      <div className="flex-1">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs font-medium text-neutral-600">{amenity.name}</span>
          <span className="text-xs font-bold text-neutral-900 tabular-nums">{amenity.usage}%</span>
        </div>
        <div className="h-1.5 rounded-full bg-neutral-100 overflow-hidden">
          <div
            className={cn(
              "h-full rounded-full transition-all duration-1000 ease-out",
              amenity.color
            )}
            style={{ width: `${amenity.usage}%` }}
          />
        </div>
      </div>
    </div>
  );
}

export default function QuickActions({ className }) {
  return (
    <div className={cn(
      "bg-white rounded-2xl border border-neutral-100",
      "shadow-sm hover:shadow-lg transition-all duration-300",
      "overflow-hidden",
      className
    )}>
      {/* Header */}
      <div className="px-6 py-4 border-b border-neutral-100">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-terra-100 to-terra-50 flex items-center justify-center">
            <Zap className="w-4 h-4 text-terra-600" />
          </div>
          <h3 className="text-sm font-semibold text-neutral-900">Quick Actions</h3>
        </div>
      </div>

      {/* Actions */}
      <div className="p-3 space-y-1">
        {actions.map((action, index) => (
          <ActionButton key={index} action={action} />
        ))}
      </div>

      {/* Divider */}
      <div className="mx-6 border-t border-neutral-100" />

      {/* Amenities */}
      <div className="p-6 pt-4">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-neutral-400 mb-4">
          Amenity Usage
        </p>
        <div className="space-y-4">
          {amenities.map((amenity, index) => (
            <AmenityBar key={index} amenity={amenity} />
          ))}
        </div>
      </div>
    </div>
  );
}
