import {
  Plus,
  UserPlus,
  Calendar,
  DollarSign,
  Settings,
  FileText,
  MessageSquare,
  BarChart3
} from 'lucide-react';

const quickActions = [
  {
    id: 1,
    label: 'New Booking',
    icon: Plus,
    color: 'bg-[#5C9BA4] hover:bg-[#4A7C84]',
    description: 'Create reservation',
  },
  {
    id: 2,
    label: 'Check-in Guest',
    icon: UserPlus,
    color: 'bg-[#A57865] hover:bg-[#8E6554]',
    description: 'Process arrival',
  },
  {
    id: 3,
    label: 'Room Assignment',
    icon: Calendar,
    color: 'bg-[#4E5840] hover:bg-[#3D4533]',
    description: 'Assign rooms',
  },
  {
    id: 4,
    label: 'Revenue Report',
    icon: BarChart3,
    color: 'bg-[#CDB261] hover:bg-[#B89D4E]',
    description: 'View analytics',
  },
];

const QuickActions = () => {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-neutral-200">
      <div className="mb-6">
        <h3 className="text-lg font-serif font-bold text-neutral-900">
          Quick Actions
        </h3>
        <p className="text-sm text-neutral-500 mt-1">
          Frequently used operations
        </p>
      </div>

      <div className="space-y-3">
        {quickActions.map((action) => {
          const Icon = action.icon;
          return (
            <button
              key={action.id}
              className={`w-full flex items-center gap-4 p-4 ${action.color} text-white rounded-xl transition-all shadow-sm hover:shadow group`}
            >
              <div className="p-2 bg-white/20 rounded-lg">
                <Icon className="w-5 h-5" />
              </div>
              <div className="text-left flex-1">
                <div className="font-semibold text-sm">{action.label}</div>
                <div className="text-xs text-white/80">
                  {action.description}
                </div>
              </div>
              <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                →
              </div>
            </button>
          );
        })}
      </div>

      <div className="mt-6 pt-6 border-t border-neutral-200">
        <button className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#FAF8F6] hover:bg-neutral-100 text-neutral-700 rounded-xl transition-all">
          <Settings className="w-4 h-4" />
          <span className="text-sm font-medium">Customize Actions</span>
        </button>
      </div>
    </div>
  );
};

export default QuickActions;
