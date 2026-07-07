/**
 * RoomCard Component
 * Room card display for housekeeping - Glimmora Design System v5.0
 * Matches Staff card pattern
 */

import { User, Clock, Loader2, XCircle, Bed, CheckCircle, Eye, TrendingUp } from 'lucide-react';
import { Button, IconButton } from '../ui2/Button';

export default function RoomCard({ room, onClick, onMarkClean }) {
  // Status config using design system colors
  const statusConfig = {
    clean: {
      label: 'Clean',
      dot: 'bg-sage-500',
      text: 'text-sage-700'
    },
    dirty: {
      label: 'Dirty',
      dot: 'bg-gold-500',
      text: 'text-gold-700'
    },
    in_progress: {
      label: 'Cleaning',
      dot: 'bg-terra-500',
      text: 'text-terra-600'
    },
    inspected: {
      label: 'Inspected',
      dot: 'bg-sage-500',
      text: 'text-sage-700'
    },
    out_of_service: {
      label: 'Blocked',
      dot: 'bg-rose-400',
      text: 'text-rose-600'
    }
  };

  const status = statusConfig[room.status] || statusConfig.clean;

  // Calculate time since dirty
  const getTimeSinceDirty = (timestamp) => {
    if (!timestamp) return null;
    const now = new Date();
    const dirtyTime = new Date(timestamp);
    const diffMinutes = Math.floor((now - dirtyTime) / (1000 * 60));
    if (diffMinutes < 60) return `${diffMinutes}m`;
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours}h`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d`;
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
    <div className="bg-white rounded-[10px] overflow-hidden flex flex-col h-full">
      {/* Room Image */}
      {room.image && (
        <div className="relative h-40 w-full bg-neutral-100">
          <img
            src={room.image}
            alt={`Room ${room.number}`}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.parentElement.innerHTML = `<div class="w-full h-full flex items-center justify-center bg-terra-100"><svg class="w-12 h-12 text-terra-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg></div>`;
            }}
          />
          {/* Status Badge Overlay */}
          <div className="absolute top-3 right-3">
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold backdrop-blur-sm bg-white/90 border border-white/40 shadow-sm ${status.text}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`}></span>
              {status.label}
            </span>
          </div>
        </div>
      )}

      {/* Card Content */}
      <div className="p-5 flex flex-col flex-1">
        {/* Header with Room Icon */}
        <div className="flex items-start gap-3 mb-4">
          <div className="relative flex-shrink-0 w-12 h-12 rounded-lg bg-terra-100 flex items-center justify-center text-terra-600">
            <Bed className="w-6 h-6" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-[15px] font-semibold text-neutral-900 truncate">
              Room {room.number}
            </h3>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-[11px] font-medium text-neutral-500">Floor {room.floor} • {room.type}</span>
            </div>
            {!room.image && (
              <div className="flex items-center gap-1.5 mt-1.5">
                <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`}></span>
                <span className={`text-[11px] font-semibold ${status.text}`}>
                  {status.label}
                </span>
              </div>
            )}
          </div>
        </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 gap-2 mb-3">
        {/* Waiting Time / Progress */}
        <div className="p-3 rounded-lg bg-neutral-50 border border-neutral-100">
          <div className="flex items-center gap-1.5 mb-1.5">
            {room.status === 'in_progress' ? (
              <Loader2 className="w-3.5 h-3.5 text-terra-500 animate-spin" />
            ) : (
              <Clock className="w-3.5 h-3.5 text-terra-500" />
            )}
            <span className="text-[10px] font-medium text-neutral-500">
              {room.status === 'in_progress' ? 'Progress' : 'Wait Time'}
            </span>
          </div>
          <p className="text-[17px] font-semibold text-neutral-900">
            {room.status === 'in_progress'
              ? `${getProgress()}%`
              : (room.dirtyTimestamp ? getTimeSinceDirty(room.dirtyTimestamp) : '--')
            }
          </p>
          {room.status === 'in_progress' && room.checklist && (
            <div className="w-full bg-neutral-200 rounded-full h-1.5 mt-1.5">
              <div
                className="bg-terra-500 h-1.5 rounded-full transition-all duration-300"
                style={{ width: `${getProgress()}%` }}
              />
            </div>
          )}
        </div>

        {/* Priority */}
        <div className="p-3 rounded-lg bg-neutral-50 border border-neutral-100">
          <div className="flex items-center gap-1.5 mb-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-sage-600" />
            <span className="text-[10px] font-medium text-neutral-500">Priority</span>
          </div>
          <p className="text-[17px] font-semibold text-neutral-900 capitalize">
            {room.priority || 'Normal'}
          </p>
          {room.priority === 'high' && (
            <div className="w-full bg-neutral-200 rounded-full h-1.5 mt-1.5">
              <div className="bg-rose-500 h-1.5 rounded-full w-full" />
            </div>
          )}
        </div>
      </div>

      {/* Assigned Staff */}
      <div className={`flex items-center gap-2.5 mb-4 p-2.5 rounded-lg border ${
        room.assignedStaff
          ? 'bg-terra-50 border-terra-100'
          : 'bg-neutral-50 border-neutral-100'
      }`}>
        {room.assignedStaff ? (
          <>
            <div className="w-7 h-7 rounded-lg bg-terra-100 flex items-center justify-center">
              <span className="text-terra-600 text-[11px] font-bold">
                {room.assignedStaff.avatar || room.assignedStaff.name.charAt(0)}
              </span>
            </div>
            <div>
              <p className="text-[10px] font-medium text-terra-600">Assigned</p>
              <p className="text-[15px] font-semibold text-neutral-900">{room.assignedStaff.name}</p>
            </div>
          </>
        ) : (
          <>
            <div className="w-7 h-7 rounded-lg bg-neutral-100 flex items-center justify-center">
              <User className="w-3.5 h-3.5 text-neutral-400" />
            </div>
            <div>
              <p className="text-[10px] font-medium text-neutral-500">Not Assigned</p>
              <p className="text-[13px] font-medium text-neutral-500">Click to assign</p>
            </div>
          </>
        )}
      </div>

      {/* Spacer to push buttons to bottom */}
      <div className="flex-1"></div>

        {/* Action Button */}
        <Button
          variant="primary"
          size="sm"
          onClick={() => onClick(room)}
          className="w-full"
          icon={Eye}
        >
          View Details
        </Button>
      </div>
    </div>
  );
}
