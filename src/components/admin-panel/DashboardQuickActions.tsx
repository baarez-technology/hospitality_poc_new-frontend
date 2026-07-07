import {
  Plus,
  UserPlus,
  Calendar,
  BarChart3,
  Settings,
  ChevronRight,
  Zap,
} from 'lucide-react';

const quickActions = [
  {
    id: 1,
    label: 'New Booking',
    description: 'Create reservation',
    icon: Plus,
    bgColor: 'bg-[#A57865]',
    hoverColor: 'hover:bg-[#8E6554]',
  },
  {
    id: 2,
    label: 'Check-in Guest',
    description: 'Process arrival',
    icon: UserPlus,
    bgColor: 'bg-[#4E5840]',
    hoverColor: 'hover:bg-[#3D4533]',
  },
  {
    id: 3,
    label: 'Room Assignment',
    description: 'Assign rooms',
    icon: Calendar,
    bgColor: 'bg-[#CDB261]',
    hoverColor: 'hover:bg-[#B89D4E]',
  },
  {
    id: 4,
    label: 'Revenue Report',
    description: 'View analytics',
    icon: BarChart3,
    bgColor: 'bg-[#A57865]',
    hoverColor: 'hover:bg-[#8E6554]',
  },
];

export default function DashboardQuickActions({ onActionClick }) {
  return (
    <div className="bg-white rounded-2xl p-6 border border-neutral-200/60 hover:border-[#A57865]/30 transition-all duration-300 ease-out group">
      {/* Header */}
      <div className="mb-6 flex items-start gap-3">
        <div className="p-2 bg-[#A57865]/10 rounded-lg group-hover:scale-105 transition-transform duration-200">
          <Zap className="w-4 h-4 text-[#A57865]" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-neutral-900 mb-1">
            Quick Actions
          </h3>
          <p className="text-xs text-neutral-600 font-medium">Frequently used operations</p>
        </div>
      </div>

      {/* Actions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {quickActions.map((action) => {
          const Icon = action.icon;
          return (
            <button
              key={action.id}
              onClick={() => onActionClick && onActionClick(action.id)}
              className={`flex flex-col items-start gap-3 p-5 ${action.bgColor} ${action.hoverColor} text-white rounded-xl transition-all duration-200 ease-out hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#A57865] group/btn`}
            >
              <div className="p-2.5 bg-white/20 rounded-lg transition-all duration-200 group-hover/btn:bg-white/30 group-hover/btn:scale-110">
                <Icon className="w-5 h-5" />
              </div>
              <div className="text-left flex-1">
                <div className="font-bold text-sm mb-0.5">{action.label}</div>
                <div className="text-xs text-white/80 font-medium">{action.description}</div>
              </div>
              <ChevronRight className="w-4 h-4 ml-auto opacity-70 group-hover/btn:opacity-100 group-hover/btn:translate-x-1 transition-all duration-200" />
            </button>
          );
        })}
      </div>

      {/* Settings Button */}
      <div className="mt-6 pt-6 border-t border-neutral-200/60">
        <button className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-neutral-50 hover:bg-neutral-100 text-neutral-700 hover:text-[#A57865] rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#A57865]/30 group/settings border border-transparent hover:border-[#A57865]/30">
          <Settings className="w-4 h-4 group-hover/settings:rotate-90 transition-transform duration-300" />
          <span className="text-sm font-semibold">Customize Actions</span>
        </button>
      </div>
    </div>
  );
}
