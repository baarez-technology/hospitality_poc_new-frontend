/**
 * AddCleaningTaskDrawer Component
 * Side drawer for adding cleaning tasks - Glimmora Design System v5.0
 * Pattern matching Staff/Channel Manager drawers
 */

import { useState, useEffect, useMemo } from 'react';
import { Plus, Clock, ChevronDown, Check } from 'lucide-react';
import { Drawer } from '../../ui2/Drawer';
import { Button } from '../../ui2/Button';
import { calculateCleaningTime } from '../../../utils/housekeeping';

// Custom Select for Drawer
function DrawerSelect({ label, value, onChange, options, placeholder, error, required }) {
  const [isOpen, setIsOpen] = useState(false);
  const selectedOption = options.find(opt => opt.value === value);

  return (
    <div>
      <h4 className="text-[11px] font-semibold uppercase tracking-widest text-neutral-900 mb-3">
        {label} {required && <span className="text-rose-500">*</span>}
      </h4>
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`w-full h-10 px-4 rounded-lg text-[13px] bg-white border transition-all flex items-center justify-between ${
            error
              ? 'border-rose-300 ring-2 ring-rose-500/10'
              : isOpen
                ? 'border-terra-400 ring-2 ring-terra-500/10'
                : 'border-neutral-200 hover:border-neutral-300'
          }`}
        >
          <span className={selectedOption ? 'text-neutral-900 font-medium' : 'text-neutral-400'}>
            {selectedOption?.label || placeholder}
          </span>
          <ChevronDown className={`w-4 h-4 text-neutral-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {isOpen && (
          <>
            <div className="fixed inset-0 z-[60]" onClick={() => setIsOpen(false)} />
            <div className="absolute z-[70] w-full mt-1.5 bg-white rounded-lg border border-neutral-200 shadow-lg overflow-hidden max-h-48 overflow-y-auto">
              {options.length === 0 ? (
                <div className="px-4 py-3 text-[13px] text-neutral-500">No options available</div>
              ) : (
                options.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => {
                      onChange(option.value);
                      setIsOpen(false);
                    }}
                    className={`w-full px-4 py-2.5 text-[13px] text-left hover:bg-neutral-50 transition-colors flex items-center justify-between ${
                      value === option.value ? 'bg-terra-50 text-terra-700' : 'text-neutral-700'
                    }`}
                  >
                    {option.label}
                    {value === option.value && <Check className="w-4 h-4 text-terra-500" />}
                  </button>
                ))
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

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
    taskType: 'cleaning',
    priority: 'medium',
    notes: '',
    estimatedTimeOverride: ''
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen) {
      setFormData({ roomId: '', staffId: '', taskType: 'cleaning', priority: 'medium', notes: '', estimatedTimeOverride: '' });
      setErrors({});
    }
  }, [isOpen]);

  // Smart room filtering based on task type:
  // - cleaning: only dirty rooms (not already assigned to an active task)
  // - turndown/mid_stay: occupied rooms (any status except out_of_service)
  // - deep_clean/inspection: all rooms except out_of_service
  const availableRooms = useMemo(() => {
    const allRooms = rooms?.filter(r => r.status !== 'out_of_service') || [];

    if (formData.taskType === 'cleaning') {
      // For regular cleaning, show dirty rooms that don't already have an active task assigned
      return allRooms.filter(r => r.status === 'dirty' || r.status === 'in_progress');
    }

    if (formData.taskType === 'turndown' || formData.taskType === 'mid_stay') {
      // For turndown/mid-stay, show occupied or clean rooms (guests are in the room)
      return allRooms.filter(r => r.status !== 'dirty');
    }

    // For deep_clean and inspection, show all rooms
    return allRooms;
  }, [rooms, formData.taskType]);
  const selectedRoom = rooms?.find(r => r.id === formData.roomId);
  const estimatedTime = selectedRoom ? calculateCleaningTime({ type: selectedRoom.type, priority: formData.priority }) : 0;

  // Room status label helper
  const getRoomStatusLabel = (status: string) => {
    switch (status) {
      case 'clean': return 'Clean';
      case 'inspected': return 'Inspected';
      case 'dirty': return 'Dirty';
      case 'in_progress': return 'In Progress';
      default: return status;
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => {
      const next = { ...prev, [field]: value };
      // Reset room selection when task type changes (available rooms differ)
      if (field === 'taskType') next.roomId = '';
      return next;
    });
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: null }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.roomId) newErrors.roomId = 'Please select a room';
    if (!formData.staffId) newErrors.staffId = 'Please select a staff member';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    onAddTask({
      roomId: formData.roomId,
      staffId: formData.staffId,
      taskType: formData.taskType,
      priority: formData.priority,
      notes: formData.notes,
      estimatedTime: formData.estimatedTimeOverride ? parseInt(formData.estimatedTimeOverride) : estimatedTime
    });
    onClose();
  };

  // Custom header
  const renderHeader = () => (
    <div className="flex-1 min-w-0">
      <h2 className="text-lg font-semibold text-neutral-900 tracking-tight">Add Cleaning Task</h2>
      <p className="text-[13px] text-neutral-500 mt-1">Assign a new cleaning task to staff</p>
    </div>
  );

  // Footer
  const renderFooter = () => (
    <div className="flex items-center justify-end gap-3">
      <Button variant="outline-neutral" size="md" onClick={onClose}>
        Cancel
      </Button>
      <Button variant="primary" size="md" onClick={handleSubmit} disabled={availableRooms.length === 0 || !formData.roomId || !formData.staffId}>
        Add Task
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
        {/* Task Type Selection */}
        <DrawerSelect
          label="Task Type"
          value={formData.taskType}
          onChange={(value) => handleChange('taskType', value)}
          placeholder="Select task type..."
          error={false}
          required
          options={[
            { value: 'cleaning', label: 'Regular Cleaning' },
            { value: 'turndown', label: 'Turndown Service' },
            { value: 'mid_stay', label: 'Mid-Stay Cleaning' },
            { value: 'deep_clean', label: 'Deep Cleaning' },
            { value: 'inspection', label: 'Inspection' },
          ]}
        />

        {/* Room Selection */}
        <div>
          <DrawerSelect
            label="Room"
            value={formData.roomId}
            onChange={(value) => handleChange('roomId', value)}
            placeholder="Select a room..."
            error={!!errors.roomId}
            required
            options={availableRooms.map(room => ({
              value: room.id,
              label: `Room ${room.roomNumber || room.number} - ${room.type || room.roomType} (Floor ${room.floor}) [${getRoomStatusLabel(room.status)}]${room.assignedTo ? ' - Assigned' : ''}`
            }))}
          />
          {errors.roomId && <p className="text-xs text-rose-500 mt-1">{errors.roomId}</p>}
          {availableRooms.length === 0 && (
            <p className="text-[11px] text-gold-600 mt-1">
              {formData.taskType === 'cleaning'
                ? 'No dirty rooms available for cleaning assignment'
                : 'No rooms available for this task type'}
            </p>
          )}
        </div>

        {/* Staff Selection */}
        <DrawerSelect
          label="Assign to Staff"
          value={formData.staffId}
          onChange={(value) => handleChange('staffId', value)}
          placeholder="Select staff member..."
          error={!!errors.staffId}
          required
          options={staff?.map(s => ({ value: s.id, label: `${s.name} (${s.tasksAssigned} tasks assigned)` })) || []}
        />

        {/* Priority */}
        <div>
          <h4 className="text-[11px] font-semibold uppercase tracking-widest text-neutral-900 mb-3">Priority</h4>
          <div className="flex gap-2">
            {['urgent', 'high', 'medium', 'low'].map(priority => (
              <button
                key={priority}
                type="button"
                onClick={() => handleChange('priority', priority)}
                className={`flex-1 h-10 px-3 rounded-lg text-[13px] font-semibold transition-all ${
                  formData.priority === priority
                    ? priority === 'urgent'
                      ? 'bg-rose-600 text-white'
                      : priority === 'high'
                        ? 'bg-rose-500 text-white'
                        : priority === 'medium'
                          ? 'bg-gold-500 text-white'
                          : 'bg-neutral-200 text-neutral-700'
                    : 'bg-white border border-neutral-200 text-neutral-700 hover:border-neutral-300'
                }`}
              >
                {priority.charAt(0).toUpperCase() + priority.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Estimated Time Preview */}
        {selectedRoom && (
          <div>
            <h4 className="text-[11px] font-semibold uppercase tracking-widest text-neutral-900 mb-3">
              Estimated Cleaning Time
            </h4>
            <div className="p-3 sm:p-4 rounded-lg bg-sage-50 border border-sage-100">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-sage-100 flex items-center justify-center flex-shrink-0">
                  <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-sage-600" />
                </div>
                <div>
                  <p className="text-[15px] sm:text-[17px] font-bold text-neutral-900">{estimatedTime} minutes</p>
                  <p className="text-[10px] sm:text-[11px] text-neutral-500">
                    Based on {selectedRoom.type} room type + {formData.priority} priority
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Time Override */}
        <div>
          <h4 className="text-[11px] font-semibold uppercase tracking-widest text-neutral-900 mb-3">
            Estimated Time Override (minutes)
          </h4>
          <input
            type="number"
            value={formData.estimatedTimeOverride}
            onChange={(e) => handleChange('estimatedTimeOverride', e.target.value)}
            placeholder="Leave empty to use calculated estimate"
            className="w-full h-10 px-4 bg-white border border-neutral-200 rounded-lg text-[13px] text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-terra-500/10 focus:border-terra-400 transition-all hover:border-neutral-300"
          />
        </div>

        {/* Notes */}
        <div>
          <h4 className="text-[11px] font-semibold uppercase tracking-widest text-neutral-900 mb-3">Notes</h4>
          <textarea
            value={formData.notes}
            onChange={(e) => handleChange('notes', e.target.value)}
            placeholder="Add any special instructions or notes..."
            rows={3}
            className="w-full px-4 py-3 bg-white border border-neutral-200 rounded-lg text-[13px] text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-terra-500/10 focus:border-terra-400 transition-all resize-none hover:border-neutral-300"
          />
        </div>
      </div>
    </Drawer>
  );
}
