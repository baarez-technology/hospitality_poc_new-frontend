import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Plus, Clock, AlertTriangle } from 'lucide-react';
import { calculateCleaningTime } from '@/utils/admin/housekeeping';
import { Button } from '../../../ui2/Button';

export default function AddCleaningTaskModal({
  rooms,
  staff,
  isOpen,
  onClose,
  onAddTask
}) {
  const [formData, setFormData] = useState({
    roomId: '',
    staffId: '',
    priority: 'medium',
    notes: '',
    estimatedTimeOverride: ''
  });
  const [errors, setErrors] = useState({});
  const [showDuplicateWarning, setShowDuplicateWarning] = useState(false);
  const [duplicateInfo, setDuplicateInfo] = useState<{ staffName: string; roomNumber: string } | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };

    const scrollY = window.scrollY;
    const scrollX = window.scrollX;
    const mainContent = document.querySelector('main');

    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollY}px`;
    document.body.style.left = `-${scrollX}px`;
    document.body.style.width = '100%';
    document.body.style.overflow = 'hidden';

    if (mainContent) {
      mainContent.style.overflow = 'hidden';
    }

    document.addEventListener('keydown', handleEsc);

    return () => {
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.left = '';
      document.body.style.width = '';
      document.body.style.overflow = '';

      if (mainContent) {
        mainContent.style.overflow = '';
      }

      window.scrollTo(scrollX, scrollY);
      document.removeEventListener('keydown', handleEsc);
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      setFormData({
        roomId: '',
        staffId: '',
        priority: 'medium',
        notes: '',
        estimatedTimeOverride: ''
      });
      setErrors({});
      setShowDuplicateWarning(false);
      setDuplicateInfo(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Get dirty/unassigned rooms
  const availableRooms = rooms?.filter(r =>
    (r.status === 'dirty' || r.status === 'in_progress') && !r.assignedTo
  ) || [];

  // Get selected room for time estimation
  const selectedRoom = rooms?.find(r => r.id === formData.roomId);
  const estimatedTime = selectedRoom ? calculateCleaningTime({
    type: selectedRoom.type,
    priority: formData.priority
  }) : 0;

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.roomId) newErrors.roomId = 'Please select a room';
    if (!formData.staffId) newErrors.staffId = 'Please select a staff member';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Check if the selected staff member already has tasks assigned today
  const checkForExistingAssignment = (): { hasExisting: boolean; staffName: string; taskCount: number } => {
    if (!formData.staffId) return { hasExisting: false, staffName: '', taskCount: 0 };

    const selectedStaff = staff?.find(s => s.id?.toString() === formData.staffId?.toString());
    if (!selectedStaff) return { hasExisting: false, staffName: '', taskCount: 0 };

    // Check if this staff member already has tasks assigned
    const tasksAssigned = selectedStaff.tasksAssigned || 0;

    // Also check if this specific room is already being cleaned by this staff member
    // (by looking at all rooms assigned to this staff)
    const roomsAssignedToStaff = rooms?.filter(r =>
      r.assignedTo?.toString() === formData.staffId?.toString()
    ) || [];

    if (roomsAssignedToStaff.length > 0) {
      return {
        hasExisting: true,
        staffName: selectedStaff.name,
        taskCount: roomsAssignedToStaff.length
      };
    }

    return { hasExisting: false, staffName: selectedStaff.name, taskCount: 0 };
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    // Check for existing assignments (unless user already confirmed)
    if (!showDuplicateWarning) {
      const { hasExisting, staffName, taskCount } = checkForExistingAssignment();
      if (hasExisting) {
        const selectedRoom = rooms?.find(r => r.id?.toString() === formData.roomId?.toString());
        setDuplicateInfo({
          staffName,
          roomNumber: selectedRoom?.roomNumber || 'Unknown'
        });
        setShowDuplicateWarning(true);
        return;
      }
    }

    const taskData = {
      roomId: formData.roomId,
      staffId: formData.staffId,
      priority: formData.priority,
      notes: formData.notes,
      estimatedTime: formData.estimatedTimeOverride
        ? parseInt(formData.estimatedTimeOverride)
        : estimatedTime
    };

    onAddTask(taskData);
    onClose();
  };

  const handleCancelDuplicate = () => {
    setShowDuplicateWarning(false);
    setDuplicateInfo(null);
  };

  const modalContent = (
    <>
      <div
        className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <div
          className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-scaleIn"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-[#FAF8F6] border-b border-neutral-200 p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-[#A57865]/10 flex items-center justify-center">
                  <Plus className="w-6 h-6 text-[#A57865]" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-neutral-900">Add Cleaning Task</h2>
                  <p className="text-sm text-neutral-500">Assign a new cleaning task to staff</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white rounded-lg transition-all duration-150"
              >
                <X className="w-5 h-5 text-neutral-600" />
              </button>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {/* Duplicate Warning */}
            {showDuplicateWarning && duplicateInfo && (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-semibold text-amber-900">Staff Already Has Tasks Assigned</h4>
                    <p className="text-sm text-amber-700 mt-1">
                      <span className="font-medium">{duplicateInfo.staffName}</span> already has cleaning tasks assigned today.
                    </p>
                    <p className="text-sm text-amber-700 mt-2">
                      Do you still want to assign Room {duplicateInfo.roomNumber} to this staff member?
                    </p>
                    <div className="flex gap-2 mt-4">
                      <Button variant="outline-warning" size="sm" onClick={handleCancelDuplicate}>
                        Cancel
                      </Button>
                      <Button variant="warning" size="sm" onClick={handleSubmit}>
                        Assign Anyway
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Room Selection */}
            <div>
              <label className="block text-sm font-semibold text-neutral-700 mb-2">
                Room <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.roomId}
                onChange={(e) => handleChange('roomId', e.target.value)}
                className={`w-full px-4 py-2.5 bg-white border rounded-xl text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-[#A57865] focus:border-[#A57865] transition-all duration-200 ${
                  errors.roomId ? 'border-red-500' : 'border-neutral-200'
                }`}
              >
                <option value="">Select a room...</option>
                {availableRooms.map(room => (
                  <option key={room.id} value={room.id}>
                    Room {room.roomNumber} - {room.type} (Floor {room.floor})
                  </option>
                ))}
              </select>
              {errors.roomId && (
                <p className="text-xs text-red-500 mt-1">{errors.roomId}</p>
              )}
              {availableRooms.length === 0 && (
                <p className="text-xs text-amber-600 mt-1">No unassigned dirty rooms available</p>
              )}
            </div>

            {/* Staff Selection */}
            <div>
              <label className="block text-sm font-semibold text-neutral-700 mb-2">
                Assign to Staff <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.staffId}
                onChange={(e) => handleChange('staffId', e.target.value)}
                className={`w-full px-4 py-2.5 bg-white border rounded-xl text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-[#A57865] focus:border-[#A57865] transition-all duration-200 ${
                  errors.staffId ? 'border-red-500' : 'border-neutral-200'
                }`}
              >
                <option value="">Select staff member...</option>
                {staff?.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.tasksAssigned} tasks assigned)
                  </option>
                ))}
              </select>
              {errors.staffId && (
                <p className="text-xs text-red-500 mt-1">{errors.staffId}</p>
              )}
            </div>

            {/* Priority */}
            <div>
              <label className="block text-sm font-semibold text-neutral-700 mb-2">
                Priority
              </label>
              <div className="flex gap-2">
                {['high', 'medium', 'low'].map(priority => (
                  <button
                    key={priority}
                    type="button"
                    onClick={() => handleChange('priority', priority)}
                    className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold border-2 transition-all duration-200 ${
                      formData.priority === priority
                        ? priority === 'high'
                          ? 'bg-red-600 text-white border-red-600'
                          : priority === 'medium'
                            ? 'bg-[#CDB261] text-neutral-900 border-[#CDB261]'
                            : 'bg-neutral-200 text-neutral-900 border-neutral-200'
                        : 'bg-white border-neutral-200 text-neutral-700 hover:border-neutral-300'
                    }`}
                  >
                    {priority.charAt(0).toUpperCase() + priority.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Estimated Time Preview */}
            {selectedRoom && (
              <div className="bg-[#5C9BA4]/10 rounded-xl p-4 border border-[#5C9BA4]/30">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-4 h-4 text-[#5C9BA4]" />
                  <span className="text-sm font-semibold text-[#5C9BA4]">Estimated Cleaning Time</span>
                </div>
                <p className="text-2xl font-bold text-neutral-900">{estimatedTime} minutes</p>
                <p className="text-xs text-neutral-500 mt-1">
                  Based on {selectedRoom.type} room type + {formData.priority} priority
                </p>
              </div>
            )}

            {/* Time Override */}
            <div>
              <label className="block text-sm font-semibold text-neutral-700 mb-2">
                Estimated Time Override (minutes)
              </label>
              <input
                type="number"
                value={formData.estimatedTimeOverride}
                onChange={(e) => handleChange('estimatedTimeOverride', e.target.value)}
                placeholder="Leave empty to use calculated estimate"
                className="w-full px-4 py-2.5 bg-white border border-neutral-200 rounded-xl text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#A57865] focus:border-[#A57865] transition-all duration-200"
              />
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-semibold text-neutral-700 mb-2">
                Notes
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => handleChange('notes', e.target.value)}
                placeholder="Add any special instructions or notes..."
                rows={3}
                className="w-full px-4 py-2.5 bg-white border border-neutral-200 rounded-xl text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#A57865] focus:border-[#A57865] transition-all duration-200 resize-none"
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <Button variant="ghost" onClick={onClose} className="flex-1">
                Cancel
              </Button>
              <Button variant="primary" type="submit" disabled={availableRooms.length === 0} icon={Plus} className="flex-1">
                Add Task
              </Button>
            </div>
          </form>
        </div>
      </div>
    </>
  );

  return createPortal(modalContent, document.body);
}
