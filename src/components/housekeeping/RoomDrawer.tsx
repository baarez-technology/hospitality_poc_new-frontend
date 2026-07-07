/**
 * RoomDrawer Component
 * Room detail drawer - Glimmora Design System v5.0
 * Side drawer pattern matching Staff/Channel Manager
 */

import { useState } from 'react';
import { User, Clock, CheckCircle2, AlertCircle, Play, CheckCircle, Ban, RotateCcw, Edit, Send, SprayCan } from 'lucide-react';
import { Button } from '../ui2/Button';
import { Drawer } from '../ui2/Drawer';

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
  onToggleChecklistItem,
  onAddNote,
  onRequestCleaning
}) {
  const [newNote, setNewNote] = useState('');
  const [isSavingNote, setIsSavingNote] = useState(false);

  if (!room) return null;

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

  // Status styling
  const statusConfig = {
    clean: { dot: 'bg-sage-500', badge: 'bg-sage-50 text-sage-700 border-sage-200', label: 'Ready to Use' },
    dirty: { dot: 'bg-gold-500', badge: 'bg-gold-50 text-gold-700 border-gold-200', label: 'Needs Cleaning' },
    in_progress: { dot: 'bg-terra-500', badge: 'bg-terra-50 text-terra-600 border-terra-200', label: 'Being Cleaned' },
    inspected: { dot: 'bg-sage-500', badge: 'bg-sage-50 text-sage-700 border-sage-200', label: 'Inspected' },
    out_of_service: { dot: 'bg-rose-400', badge: 'bg-rose-50 text-rose-600 border-rose-200', label: 'Out of Service' }
  };

  const priorityConfig = {
    low: { badge: 'bg-neutral-50 text-neutral-600 border-neutral-200', label: 'Low Priority' },
    medium: { badge: 'bg-gold-50 text-gold-700 border-gold-200', label: 'Medium Priority' },
    high: { badge: 'bg-rose-50 text-rose-600 border-rose-200', label: 'High Priority' }
  };

  const status = statusConfig[room.status] || statusConfig.clean;
  const priority = priorityConfig[room.priority] || priorityConfig.low;

  const formatTime = (minutes) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  // Custom header with room info
  const renderHeader = () => (
    <div className="flex-1 min-w-0">
      <h2 className="text-lg font-semibold text-neutral-900 tracking-tight">
        Room {room.number || room.roomNumber}
      </h2>
      <p className="text-[13px] text-neutral-500 mt-1">{room.type} • Floor {room.floor}</p>
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 mt-2 rounded-md text-[11px] font-semibold border ${status.badge}`}>
        <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`}></span>
        {status.label}
      </span>
    </div>
  );

  // Footer
  const renderFooter = () => (
    <div className="flex items-center justify-end">
      <Button variant="outline-neutral" size="md" onClick={onClose}>
        Close
      </Button>
    </div>
  );

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      header={renderHeader()}
      footer={renderFooter()}
      maxWidth="max-w-2xl"
    >
      <div className="space-y-6">
        {/* Room Image */}
        {room.image && (
          <div className="relative -mx-6 -mt-6 mb-6">
            <div className="relative h-48 w-full bg-neutral-100">
              <img
                src={room.image}
                alt={`Room ${room.number || room.roomNumber}`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
            </div>
          </div>
        )}

        {/* Priority Badge */}
        {room.priority && (
          <div>
            <h4 className="text-[11px] font-semibold uppercase tracking-widest text-neutral-900 mb-3">
              Priority
            </h4>
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[11px] font-semibold border ${priority.badge}`}>
              <AlertCircle className="w-3 h-3" />
              {priority.label}
            </span>
          </div>
        )}

        {/* Assigned Housekeeper */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-[11px] font-semibold uppercase tracking-widest text-neutral-900">
              Assigned Housekeeper
            </h4>
            {/* BUG-021 FIX: Only allow assigning staff to dirty/in_progress rooms */}
            {(room.status === 'dirty' || room.status === 'in_progress') && (
              <button
                onClick={onAssignHousekeeper}
                className="text-[12px] text-terra-600 hover:text-terra-700 font-semibold transition-colors"
              >
                {housekeeper ? 'Reassign' : 'Assign'}
              </button>
            )}
          </div>
          {housekeeper ? (
            <div className="p-3 sm:p-4 rounded-lg bg-neutral-50 border border-neutral-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-terra-100 flex items-center justify-center text-terra-600 font-bold text-[13px]">
                  {housekeeper.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-semibold text-neutral-900">{housekeeper.name}</p>
                  <p className="text-[11px] text-neutral-500 font-medium">
                    {housekeeper.tasksAssigned} rooms • {housekeeper.efficiency}% efficiency
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-3 sm:p-4 rounded-lg bg-neutral-50 border border-neutral-100 text-center">
              <div className="w-10 h-10 rounded-lg bg-white border border-neutral-200 flex items-center justify-center mx-auto mb-2">
                <User className="w-5 h-5 text-neutral-400" />
              </div>
              <p className="text-[13px] font-medium text-neutral-700">No housekeeper assigned</p>
              <p className="text-[11px] text-neutral-500 mt-0.5">Click assign to add a housekeeper</p>
            </div>
          )}
        </div>

        {/* Time Tracking */}
        {room.status !== 'out_of_service' && (room.timeSinceDirtyMinutes > 0 || room.cleaningStartedAt || room.cleaningCompletedAt || room.lastCleaned) && (
          <div>
            <h4 className="text-[11px] font-semibold uppercase tracking-widest text-neutral-900 mb-3">
              Time Tracking
            </h4>
            <div className="p-3 sm:p-4 rounded-lg bg-neutral-50 border border-neutral-100 space-y-3">
              {room.timeSinceDirtyMinutes > 0 && (
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gold-100 flex items-center justify-center flex-shrink-0">
                    <Clock className="w-4 h-4 text-gold-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-medium text-neutral-500">Time Since Dirty</p>
                    <p className="text-[13px] font-semibold text-neutral-900">{formatTime(room.timeSinceDirtyMinutes)}</p>
                  </div>
                </div>
              )}
              {room.cleaningStartedAt && (
                <>
                  <div className="h-px bg-neutral-200"></div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-terra-100 flex items-center justify-center flex-shrink-0">
                      <Play className="w-4 h-4 text-terra-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-medium text-neutral-500">Cleaning Started</p>
                      <p className="text-[13px] font-semibold text-neutral-900">{new Date(room.cleaningStartedAt).toLocaleTimeString()}</p>
                    </div>
                  </div>
                </>
              )}
              {room.cleaningCompletedAt && (
                <>
                  <div className="h-px bg-neutral-200"></div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-sage-100 flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="w-4 h-4 text-sage-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-medium text-neutral-500">Cleaning Completed</p>
                      <p className="text-[13px] font-semibold text-neutral-900">{new Date(room.cleaningCompletedAt).toLocaleTimeString()}</p>
                    </div>
                  </div>
                </>
              )}
              {room.lastCleaned && (
                <>
                  <div className="h-px bg-neutral-200"></div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-white border border-neutral-200 flex items-center justify-center flex-shrink-0">
                      <Clock className="w-4 h-4 text-neutral-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-medium text-neutral-500">Last Cleaned</p>
                      <p className="text-[13px] font-semibold text-neutral-900">{room.lastCleaned}</p>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* Cleaning Progress - Show for all rooms with checklist including clean/inspected */}
        {totalTasks > 0 && room.status !== 'out_of_service' && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-[11px] font-semibold uppercase tracking-widest text-neutral-900">
                Cleaning Progress
              </h4>
              <span className="text-[12px] font-bold text-neutral-900">
                {completedTasks}/{totalTasks} ({progress}%)
              </span>
            </div>
            <div className="w-full bg-neutral-100 rounded-full h-2">
              <div
                className="bg-sage-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Checklist */}
        {room.checklist && room.checklist.length > 0 && room.status !== 'out_of_service' && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-[11px] font-semibold uppercase tracking-widest text-neutral-900">
                Cleaning Checklist
              </h4>
              <button
                onClick={onEditChecklist}
                className="flex items-center gap-1 text-[12px] text-terra-600 hover:text-terra-700 font-semibold transition-colors"
              >
                <Edit className="w-3 h-3" />
                Edit
              </button>
            </div>
            <div className="p-3 sm:p-4 rounded-lg bg-neutral-50 border border-neutral-100 space-y-2">
              {room.checklist.map((item, index) => (
                <div
                  key={item.id || index}
                  className="flex items-center gap-2.5 p-2 hover:bg-white rounded-lg transition-colors cursor-pointer group"
                  onClick={() => onToggleChecklistItem && onToggleChecklistItem(room.id, item.id)}
                >
                  <div
                    className={`w-4.5 h-4.5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                      item.completed
                        ? 'bg-sage-500 border-sage-500'
                        : 'bg-white border-neutral-300 group-hover:border-terra-500'
                    }`}
                  >
                    {item.completed && <CheckCircle2 className="w-3 h-3 text-white" />}
                  </div>
                  <span className={`text-[13px] font-medium ${item.completed ? 'text-neutral-400 line-through' : 'text-neutral-900'}`}>
                    {item.task}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Notes - BUG-005 FIX: Added input form for adding notes */}
        <div>
          <h4 className="text-[11px] font-semibold uppercase tracking-widest text-neutral-900 mb-3">
            Notes
          </h4>
          {room.notes && (
            <div className="p-3 sm:p-4 rounded-lg bg-gold-50 border border-gold-100 mb-3">
              <p className="text-[13px] text-neutral-700 leading-relaxed whitespace-pre-line">{room.notes}</p>
            </div>
          )}
          {onAddNote && (
            <div className="flex items-end gap-2">
              <div className="flex-1">
                <textarea
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder="Add a note (e.g., 'Washroom tap not working')..."
                  rows={2}
                  className="w-full px-3 py-2 rounded-lg text-sm bg-white border border-neutral-200 text-neutral-900 placeholder:text-neutral-400 hover:border-neutral-300 focus:border-terra-400 focus:ring-2 focus:ring-terra-500/10 focus:outline-none transition-all duration-150 resize-none"
                />
              </div>
              <Button
                variant="primary"
                size="sm"
                icon={Send}
                disabled={!newNote.trim() || isSavingNote}
                loading={isSavingNote}
                onClick={async () => {
                  if (!newNote.trim()) return;
                  setIsSavingNote(true);
                  try {
                    await onAddNote(room.id, newNote.trim());
                    setNewNote('');
                  } finally {
                    setIsSavingNote(false);
                  }
                }}
                className="flex-shrink-0"
              >
                Save
              </Button>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div>
          <h4 className="text-[11px] font-semibold uppercase tracking-widest text-neutral-900 mb-3">
            Quick Actions
          </h4>
          <div className="space-y-2">
            {room.status !== 'out_of_service' && (
              <>
                {room.cleaningStatus === 'not_started' && room.status === 'dirty' && (
                  <Button variant="primary" onClick={() => onStartCleaning(room.id)} className="w-full justify-center px-5 py-2 text-[13px] font-semibold">
                    Start Cleaning
                  </Button>
                )}
                {(room.cleaningStatus === 'in_progress' || room.status === 'dirty') && (
                  <Button variant="primary" onClick={() => onMarkCleaned(room.id)} className="w-full justify-center px-5 py-2 text-[13px] font-semibold">
                    Mark Cleaned
                  </Button>
                )}
                {room.status === 'clean' && (
                  <Button variant="outline" onClick={() => onMarkDirty(room.id)} className="w-full justify-center px-5 py-2 text-[13px] font-semibold">
                    Mark Dirty
                  </Button>
                )}
              </>
            )}
            {/* Request Cleaning — for occupied rooms */}
            {room.status === 'occupied' && onRequestCleaning && (
              <Button variant="outline" onClick={() => onRequestCleaning()} className="w-full justify-center px-5 py-2 text-[13px] font-semibold text-sage-700 border-sage-200 hover:bg-sage-50">
                <SprayCan className="w-4 h-4 mr-1.5" />
                Request Cleaning
              </Button>
            )}

            {room.status === 'out_of_service' ? (
              <Button variant="primary" onClick={() => onUnblockRoom(room.id)} className="w-full justify-center px-5 py-2 text-[13px] font-semibold">
                Unblock Room
              </Button>
            ) : (
              <Button variant="outline" onClick={() => onBlockRoom(room.id, 'Maintenance required')} className="w-full justify-center px-5 py-2 text-[13px] font-semibold text-rose-600 border-rose-200 hover:bg-rose-50 hover:border-rose-300">
                Block Room
              </Button>
            )}
          </div>
        </div>
      </div>
    </Drawer>
  );
}
