import { User, Clock, AlertCircle, Sparkles, Loader2, XCircle, CheckCircle2, Ban, Wrench } from 'lucide-react';

export default function RoomCard({ room, onClick }) {
  // Status badge styling with icons - using brand colors
  const getStatusBadge = (status) => {
    const config = {
      clean: {
        bg: 'bg-[#4E5840]/10',
        text: 'text-[#4E5840]',
        border: 'border-[#4E5840]/30',
        icon: CheckCircle2,
        label: 'Ready to Use'
      },
      dirty: {
        bg: 'bg-[#CDB261]/15',
        text: 'text-[#CDB261]',
        border: 'border-[#CDB261]/30',
        icon: AlertCircle,
        label: 'Needs Cleaning'
      },
      in_progress: {
        bg: 'bg-[#5C9BA4]/15',
        text: 'text-[#5C9BA4]',
        border: 'border-[#5C9BA4]/30',
        icon: Loader2,
        label: 'Being Cleaned'
      },
      inspected: {
        bg: 'bg-emerald-50',
        text: 'text-emerald-600',
        border: 'border-emerald-200',
        icon: CheckCircle2,
        label: 'Inspected'
      },
      out_of_service: {
        bg: 'bg-[#A57865]/10',
        text: 'text-[#A57865]',
        border: 'border-[#A57865]/30',
        icon: XCircle,
        label: 'Out of Service'
      },
      out_of_order: {
        bg: 'bg-rose-50',
        text: 'text-rose-600',
        border: 'border-rose-200',
        icon: Ban,
        label: 'Out of Order'
      },
      maintenance: {
        bg: 'bg-orange-50',
        text: 'text-orange-600',
        border: 'border-orange-200',
        icon: Wrench,
        label: 'Maintenance'
      }
    };

    const statusConfig = config[status] || {
      bg: 'bg-neutral-100',
      text: 'text-neutral-700',
      border: 'border-neutral-200',
      icon: AlertCircle,
      label: 'Unknown'
    };
    const Icon = statusConfig.icon;

    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold border ${statusConfig.bg} ${statusConfig.text} ${statusConfig.border}`}>
        <Icon className="w-3.5 h-3.5" />
        {statusConfig.label}
      </span>
    );
  };

  // Room type badge styling
  const getRoomTypeBadge = (type) => {
    const styles = {
      Standard: 'bg-neutral-100 text-neutral-700 border-neutral-200',
      Premium: 'bg-[#A57865]/10 text-[#A57865] border-[#A57865]/30',
      Deluxe: 'bg-[#5C9BA4]/15 text-[#5C9BA4] border-[#5C9BA4]/30',
      Suite: 'bg-[#CDB261]/25 text-[#CDB261] border-[#CDB261]/30'
    };

    return (
      <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold border ${styles[type] || styles.Standard}`}>
        {type}
      </span>
    );
  };

  // Priority badge styling - using brand colors
  const getPriorityBadge = (priority) => {
    if (!priority || priority === 'low') return null;

    const styles = {
      high: 'bg-red-50 text-red-700 border-red-200',
      medium: 'bg-[#CDB261]/15 text-[#CDB261] border-[#CDB261]/30'
    };

    const labels = {
      high: 'High Priority',
      medium: 'Medium Priority'
    };

    return (
      <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold border ${styles[priority]}`}>
        <AlertCircle className="w-3.5 h-3.5" />
        {labels[priority]}
      </div>
    );
  };

  // Calculate time since dirty
  const getTimeSinceDirty = (timestamp) => {
    if (!timestamp) return null;

    const now = new Date();
    const dirtyTime = new Date(timestamp);
    const diffMinutes = Math.floor((now - dirtyTime) / (1000 * 60));

    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  // Calculate progress percentage
  // BUG-022 FIX: Handle both array format [{completed: true},...] and object format {total, completed}
  const getProgress = () => {
    if (!room.checklist) return 0;
    if (Array.isArray(room.checklist)) {
      const total = room.checklist.length;
      const completed = room.checklist.filter((item: any) => item.completed).length;
      return total > 0 ? Math.round((completed / total) * 100) : 0;
    }
    const total = room.checklist.total || 0;
    const completed = room.checklist.completed || 0;
    return total > 0 ? Math.round((completed / total) * 100) : 0;
  };

  return (
    <div
      onClick={() => onClick(room)}
      className="bg-white rounded-xl border border-neutral-200 p-6 hover:shadow-lg hover:border-[#A57865]/30 transition-all duration-200 cursor-pointer group"
    >
      {/* Header with Room Number */}
      <div className="flex items-start justify-between mb-5">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-4xl font-serif font-bold text-neutral-900 group-hover:text-[#A57865] transition-colors">
              {room.number}
            </h3>
            <div className="flex items-center gap-1 px-2 py-1 bg-neutral-100 rounded-md">
              <span className="text-xs font-medium text-neutral-600">Floor {room.floor}</span>
            </div>
          </div>
          <p className="text-sm text-neutral-600 mb-3">{room.type} Room</p>
          <div className="flex items-center gap-2 flex-wrap">
            {getStatusBadge(room.status)}
          </div>
        </div>
      </div>

      {/* Room Details Section */}
      <div className="space-y-3 mb-4">
        {/* Priority Badge */}
        {getPriorityBadge(room.priority) && (
          <div>
            {getPriorityBadge(room.priority)}
          </div>
        )}

        {/* Time Since Dirty */}
        {room.status === 'dirty' && room.dirtyTimestamp && (
          <div className="p-3.5 bg-[#CDB261]/10 rounded-xl border border-[#CDB261]/30">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold text-[#CDB261] uppercase tracking-wide">Urgent</span>
              <Clock className="w-4 h-4 text-[#CDB261]" />
            </div>
            <p className="text-sm font-semibold text-neutral-900">
              Dirty for {getTimeSinceDirty(room.dirtyTimestamp)}
            </p>
            <p className="text-xs text-[#CDB261] mt-1">Needs immediate attention</p>
          </div>
        )}

        {/* Assigned Staff */}
        {room.assignedStaff ? (
          <div className="flex items-center gap-3 p-3.5 bg-[#A57865]/5 rounded-xl border border-[#A57865]/20">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#A57865] to-[#8E6554] flex items-center justify-center text-white font-bold shadow-md flex-shrink-0">
              {room.assignedStaff.avatar || room.assignedStaff.name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-[#A57865] uppercase tracking-wide mb-0.5">Housekeeper</p>
              <p className="text-sm font-bold text-neutral-900 truncate">
                {room.assignedStaff.name}
              </p>
            </div>
          </div>
        ) : (
          <div className="p-3.5 bg-neutral-50 rounded-xl border border-neutral-200">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-neutral-400" />
              <p className="text-sm font-medium text-neutral-600">No housekeeper assigned</p>
            </div>
          </div>
        )}

        {/* Progress Bar for In Progress Rooms */}
        {room.status === 'in_progress' && room.checklist && (
          <div className="p-4 bg-[#5C9BA4]/10 rounded-xl border border-[#5C9BA4]/30">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 text-[#5C9BA4] animate-spin" />
                <span className="text-xs font-bold text-[#5C9BA4] uppercase tracking-wide">In Progress</span>
              </div>
              <span className="text-sm font-bold text-neutral-900">
                {getProgress()}%
              </span>
            </div>
            <div className="w-full bg-[#5C9BA4]/20 rounded-full h-3 mb-2">
              <div
                className="bg-[#5C9BA4] h-3 rounded-full transition-all duration-300 flex items-center justify-end pr-1"
                style={{ width: `${getProgress()}%` }}
              >
                {getProgress() > 15 && (
                  <Sparkles className="w-3 h-3 text-white" />
                )}
              </div>
            </div>
            <p className="text-xs text-[#5C9BA4] font-medium">
              {Array.isArray(room.checklist)
                ? `${room.checklist.filter((i: any) => i.completed).length} of ${room.checklist.length}`
                : `${room.checklist.completed || 0} of ${room.checklist.total || 0}`
              } tasks completed
            </p>
          </div>
        )}

        {/* Out of Service Info */}
        {room.status === 'out_of_service' && (
          <div className="p-3.5 bg-[#A57865]/10 rounded-xl border border-[#A57865]/30">
            <div className="flex items-center gap-2 mb-1">
              <XCircle className="w-4 h-4 text-[#A57865]" />
              <span className="text-xs font-bold text-[#A57865] uppercase tracking-wide">Out of Service</span>
            </div>
            <p className="text-sm font-semibold text-neutral-900">Room temporarily unavailable</p>
            <p className="text-xs text-[#A57865] mt-1">Minor maintenance required</p>
          </div>
        )}

        {/* Out of Order Info */}
        {room.status === 'out_of_order' && (
          <div className="p-3.5 bg-rose-50 rounded-xl border border-rose-200">
            <div className="flex items-center gap-2 mb-1">
              <Ban className="w-4 h-4 text-rose-600" />
              <span className="text-xs font-bold text-rose-600 uppercase tracking-wide">Out of Order</span>
            </div>
            <p className="text-sm font-semibold text-neutral-900">Room cannot be sold</p>
            <p className="text-xs text-rose-600 mt-1">Major issue - {room.ooo_reason || 'requires repair'}</p>
          </div>
        )}

        {/* Maintenance Info */}
        {room.status === 'maintenance' && (
          <div className="p-3.5 bg-orange-50 rounded-xl border border-orange-200">
            <div className="flex items-center gap-2 mb-1">
              <Wrench className="w-4 h-4 text-orange-600" />
              <span className="text-xs font-bold text-orange-600 uppercase tracking-wide">Maintenance</span>
            </div>
            <p className="text-sm font-semibold text-neutral-900">Under maintenance</p>
            <p className="text-xs text-orange-600 mt-1">{room.notes || 'Scheduled maintenance'}</p>
          </div>
        )}
      </div>

      {/* View Details Button */}
      <div className="mt-auto pt-4 border-t border-neutral-100">
        <div className="text-center px-4 py-2.5 bg-neutral-50 group-hover:bg-[#A57865]/5 rounded-lg transition-all duration-200">
          <p className="text-xs font-semibold text-neutral-600 group-hover:text-[#A57865] transition-colors">
            Click for full details & actions
          </p>
        </div>
      </div>
    </div>
  );
}
