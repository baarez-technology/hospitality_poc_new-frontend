import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, User, Clock, CheckCircle2, AlertCircle, Play, CheckCircle, Ban, RotateCcw, Edit, Sparkles, Loader2, XCircle, Wrench } from 'lucide-react';
import { Button } from '../../ui2/Button';

export default function RoomDrawer({
  room,
  isOpen,
  onClose,
  onAssignHousekeeper,
  onEditChecklist,
  onStartCleaning,
  onMarkCleaned,
  onMarkDirty,
  onBlockRoom,
  onUnblockRoom,
  onToggleChecklistItem
}) {
  useEffect(() => {
    if (!isOpen) return;

    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };

    // Store current scroll positions
    const scrollY = window.scrollY;
    const scrollX = window.scrollX;
    const mainContent = document.querySelector('main');

    // Prevent body scrolling
    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollY}px`;
    document.body.style.left = `-${scrollX}px`;
    document.body.style.width = '100%';
    document.body.style.overflow = 'hidden';

    // Prevent scrolling on main content
    if (mainContent) {
      mainContent.style.overflow = 'hidden';
    }

    document.addEventListener('keydown', handleEsc);

    return () => {
      // Restore body scrolling
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.left = '';
      document.body.style.width = '';
      document.body.style.overflow = '';

      // Restore main content scrolling
      if (mainContent) {
        mainContent.style.overflow = '';
      }

      // Restore scroll position
      window.scrollTo(scrollX, scrollY);

      document.removeEventListener('keydown', handleEsc);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !room) return null;

  // Get housekeeper from room data (comes from API)
  const housekeeper = room.assignedStaffName ? {
    name: room.assignedStaffName,
    avatar: room.assignedStaffName?.charAt(0).toUpperCase(),
    tasksAssigned: '-',
    efficiency: '-'
  } : null;

  // Calculate progress
  const totalTasks = room.checklist?.length || 0;
  const completedTasks = room.checklist?.filter(item => item.completed).length || 0;
  const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Status styling - using brand colors and icons
  const statusConfig = {
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

  const cleaningStatusConfig = {
    not_started: { label: 'Not Started', color: 'text-neutral-600', bg: 'bg-neutral-100' },
    in_progress: { label: 'In Progress', color: 'text-[#5C9BA4]', bg: 'bg-[#5C9BA4]/10' },
    done: { label: 'Done', color: 'text-[#4E5840]', bg: 'bg-[#4E5840]/10' }
  };

  const priorityConfig = {
    low: { bg: 'bg-neutral-100', text: 'text-neutral-700', border: 'border-neutral-200', label: 'Low Priority' },
    medium: { bg: 'bg-[#CDB261]/15', text: 'text-[#CDB261]', border: 'border-[#CDB261]/30', label: 'Medium Priority' },
    high: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', label: 'High Priority' }
  };

  const status = statusConfig[room.status] || statusConfig.clean;
  const cleaningStatus = cleaningStatusConfig[room.cleaningStatus] || cleaningStatusConfig.not_started;
  const priority = priorityConfig[room.priority] || priorityConfig.low;

  // Time tracking
  const formatTime = (minutes) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const modalContent = (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 flex items-center justify-center p-4"
        onClick={onClose}
      >
        {/* Modal */}
        <div
          className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[calc(100vh-2rem)] sm:max-h-[90vh] overflow-hidden animate-scaleIn flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-4 sm:p-6 border-b border-neutral-200 bg-gradient-to-r from-[#FAF8F6] to-white flex-shrink-0">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h2 className="text-3xl font-serif font-bold text-neutral-900 mb-1">
                  Room {room.number || room.roomNumber}
                </h2>
                <p className="text-sm text-neutral-600">{room.type} Room • Floor {room.floor}</p>
              </div>
              <button
                onClick={onClose}
                className="p-2.5 hover:bg-white/80 rounded-xl transition-all duration-150 active:scale-95 border border-neutral-200"
              >
                <X className="w-5 h-5 text-neutral-600" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="overflow-y-auto flex-1 custom-scrollbar p-4 sm:p-6 pb-4 space-y-6">
          {/* Status Section */}
          <div>
            <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-wide mb-3">Status</h3>
            <div className="flex items-center gap-2 flex-wrap">
              {/* Main Status Badge with Icon */}
              <span className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold border ${status.bg} ${status.text} ${status.border}`}>
                {status.icon && <status.icon className={`w-4 h-4 ${room.status === 'in_progress' ? 'animate-spin' : ''}`} />}
                {status.label}
              </span>
              {/* Cleaning Status */}
              <span className={`px-3 py-2 rounded-xl text-sm font-semibold border ${cleaningStatus.bg} ${cleaningStatus.color} border-transparent`}>
                {cleaningStatus.label}
              </span>
              {/* Priority Badge */}
              {room.priority && (
                <span className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold border ${priority.bg} ${priority.text} ${priority.border}`}>
                  <AlertCircle className="w-4 h-4" />
                  {priority.label}
                </span>
              )}
            </div>
          </div>

          {/* Workflow Actions */}
          {room.status !== 'out_of_service' && (
            <div>
              <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-wide mb-3">Actions</h3>
              <div className="flex flex-wrap gap-2">
                {/* Start Cleaning */}
                {room.cleaningStatus === 'not_started' && room.status === 'dirty' && (
                  <Button variant="secondary" onClick={() => onStartCleaning(room.id)} icon={Play}>
                    Start Cleaning
                  </Button>
                )}

                {/* Mark as Cleaned */}
                {(room.cleaningStatus === 'in_progress' || room.status === 'dirty') && (
                  <Button variant="success" onClick={() => onMarkCleaned(room.id)} icon={CheckCircle}>
                    Mark Cleaned
                  </Button>
                )}

                {/* Mark as Dirty */}
                {room.status === 'clean' && (
                  <Button variant="warning" onClick={() => onMarkDirty(room.id)} icon={RotateCcw}>
                    Mark Dirty
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* Block/Unblock Actions */}
          <div>
            {room.status === 'out_of_service' ? (
              <Button variant="success" onClick={() => onUnblockRoom(room.id)} icon={CheckCircle} fullWidth>
                Unblock Room
              </Button>
            ) : (
              <div className="space-y-2">
                <Button
                  variant="primary"
                  onClick={() => onBlockRoom(room.id, 'Maintenance required')}
                  icon={Ban}
                  fullWidth
                  disabled={room.occupancyStatus === 'occupied' || room.status === 'occupied' || !!room.guests}
                  title={room.occupancyStatus === 'occupied' || room.status === 'occupied' || room.guests ? 'Check out guest first to block room' : 'Block this room'}
                  className={room.occupancyStatus === 'occupied' || room.status === 'occupied' || room.guests ? 'opacity-50 cursor-not-allowed' : ''}
                >
                  Block Room
                </Button>
                {(room.occupancyStatus === 'occupied' || room.status === 'occupied' || room.guests) && (
                  <p className="text-xs text-amber-600 text-center">Room is occupied - check out guest first</p>
                )}
              </div>
            )}
          </div>

          {/* Assigned Housekeeper */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-wide">Assigned Housekeeper</h3>
              <button
                onClick={onAssignHousekeeper}
                className="text-xs text-[#A57865] hover:text-[#8E6554] font-semibold transition-colors"
              >
                {housekeeper ? 'Reassign' : 'Assign'}
              </button>
            </div>
            {housekeeper ? (
              <div className="flex items-center gap-3 p-4 bg-[#A57865]/5 rounded-xl border border-[#A57865]/20 hover:border-[#A57865]/30 transition-all duration-200">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#A57865] to-[#8E6554] flex items-center justify-center text-white font-bold text-lg shadow-md flex-shrink-0">
                  {housekeeper.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-[#A57865] uppercase tracking-wide mb-0.5">Housekeeper</p>
                  <p className="font-bold text-neutral-900 mb-1">{housekeeper.name}</p>
                  <p className="text-xs text-neutral-600">
                    {housekeeper.tasksAssigned} rooms • {housekeeper.efficiency}% efficiency
                  </p>
                </div>
              </div>
            ) : (
              <div className="p-5 bg-neutral-50 rounded-xl border border-neutral-200 text-center">
                <User className="w-8 h-8 text-neutral-400 mx-auto mb-2" />
                <p className="text-sm font-medium text-neutral-600">No housekeeper assigned</p>
                <p className="text-xs text-neutral-500 mt-1">Click assign to add a housekeeper</p>
              </div>
            )}
          </div>

          {/* Time Tracking */}
          {room.status !== 'out_of_service' && (
            <div>
              <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-wide mb-3">Time Tracking</h3>
              <div className="space-y-2.5 text-sm">
                {room.timeSinceDirtyMinutes > 0 && (
                  <div className="flex items-center justify-between p-3.5 bg-[#CDB261]/10 rounded-xl border border-[#CDB261]/30">
                    <span className="text-[#CDB261] flex items-center gap-2 font-semibold">
                      <Clock className="w-4 h-4" />
                      Time Since Dirty
                    </span>
                    <span className="font-bold text-neutral-900">
                      {formatTime(room.timeSinceDirtyMinutes)}
                    </span>
                  </div>
                )}
                {room.cleaningStartedAt && (
                  <div className="flex items-center justify-between p-3.5 bg-[#5C9BA4]/10 rounded-xl border border-[#5C9BA4]/30">
                    <span className="text-[#5C9BA4] font-semibold">Cleaning Started</span>
                    <span className="font-bold text-neutral-900">
                      {new Date(room.cleaningStartedAt).toLocaleTimeString()}
                    </span>
                  </div>
                )}
                {room.cleaningCompletedAt && (
                  <div className="flex items-center justify-between p-3.5 bg-[#4E5840]/10 rounded-xl border border-[#4E5840]/30">
                    <span className="text-[#4E5840] font-semibold">Cleaning Completed</span>
                    <span className="font-bold text-neutral-900">
                      {new Date(room.cleaningCompletedAt).toLocaleTimeString()}
                    </span>
                  </div>
                )}
                {room.lastCleaned && (
                  <div className="flex items-center justify-between p-3.5 bg-neutral-50 rounded-xl border border-neutral-200">
                    <span className="text-neutral-600 font-semibold">Last Cleaned</span>
                    <span className="font-bold text-neutral-900">{room.lastCleaned}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Cleaning Progress */}
          {totalTasks > 0 && room.status !== 'out_of_service' && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-wide">Cleaning Progress</h3>
                <span className="text-sm font-bold text-neutral-900">
                  {completedTasks}/{totalTasks} ({progress}%)
                </span>
              </div>
              <div className="w-full bg-[#5C9BA4]/20 rounded-full h-3 mb-2">
                <div
                  className="bg-[#5C9BA4] h-3 rounded-full transition-all duration-300 flex items-center justify-end pr-1"
                  style={{ width: `${progress}%` }}
                >
                  {progress > 15 && (
                    <Sparkles className="w-3 h-3 text-white" />
                  )}
                </div>
              </div>
              <p className="text-xs text-[#5C9BA4] font-medium">
                {completedTasks} of {totalTasks} tasks completed
              </p>
            </div>
          )}

          {/* Checklist */}
          {room.checklist && room.checklist.length > 0 && room.status !== 'out_of_service' && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-wide">Cleaning Checklist</h3>
                <button
                  onClick={onEditChecklist}
                  className="flex items-center gap-1.5 text-xs text-[#A57865] hover:text-[#8E6554] font-semibold transition-colors"
                >
                  <Edit className="w-3.5 h-3.5" />
                  Edit
                </button>
              </div>
              <div className="space-y-2">
                {room.checklist.map((item, index) => (
                  <div
                    key={item.id || index}
                    className="flex items-start gap-3 p-3 hover:bg-[#FAF8F6] rounded-xl transition-all duration-200 cursor-pointer group border border-transparent hover:border-neutral-200"
                    onClick={() => onToggleChecklistItem && onToggleChecklistItem(room.id, item.id)}
                  >
                    <button
                      className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-all duration-200 ${
                        item.completed
                          ? 'bg-[#4E5840] border-[#4E5840]'
                          : 'bg-white border-neutral-300 group-hover:border-[#A57865]'
                      }`}
                    >
                      {item.completed && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                    </button>
                    <span
                      className={`text-sm font-medium transition-all duration-200 ${
                        item.completed
                          ? 'text-neutral-500 line-through'
                          : 'text-neutral-900'
                      }`}
                    >
                      {item.task}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Notes */}
          {room.notes && (
            <div>
              <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-wide mb-3">Notes</h3>
              <div className="p-4 bg-[#CDB261]/10 rounded-xl border border-[#CDB261]/30">
                <p className="text-sm text-neutral-900 font-medium leading-relaxed">{room.notes}</p>
              </div>
            </div>
          )}
          </div>

          {/* Footer CTA */}
          <div className="p-4 sm:p-6 border-t border-neutral-200 bg-gradient-to-r from-[#FAF8F6] to-white flex-shrink-0">
            <div className="text-center px-4 py-3 bg-[#A57865]/5 rounded-xl border border-[#A57865]/20 transition-all duration-200">
              <p className="text-sm font-semibold text-[#A57865]">
                Use the actions above to manage this room's cleaning status
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );

  return createPortal(modalContent, document.body);
}
