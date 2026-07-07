/**
 * PreventiveModal Component
 * Side drawer for creating/editing PM tasks - Glimmora Design System v5.0
 * Pattern matching CreateWOModal drawer
 */

import { useState, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { Drawer } from '../../ui2/Drawer';
import { Button } from '../../ui2/Button';
import DatePicker from '../../ui2/DatePicker';
import { WO_CATEGORIES, PM_FREQUENCY } from '../../../utils/maintenance';

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
      {error && <p className="text-xs text-rose-500 mt-1">{error}</p>}
    </div>
  );
}

export default function PreventiveModal({
  isOpen,
  onClose,
  onSubmit,
  pmTask,
  technicians,
  rooms,
  mode = 'create'
}) {
  const [formData, setFormData] = useState({
    equipment: '',
    roomNumber: '',
    roomId: '',
    category: 'general',
    frequency: 'monthly',
    nextDueDate: '',
    assignedTo: '',
    technicianName: '',
    notes: '',
    isActive: true
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (pmTask && mode === 'edit') {
      setFormData({
        equipment: pmTask.equipment || '',
        roomNumber: pmTask.roomNumber || '',
        roomId: pmTask.roomId || '',
        category: pmTask.category || 'general',
        frequency: pmTask.frequency || 'monthly',
        nextDueDate: pmTask.nextDueDate || '',
        assignedTo: pmTask.assignedTo || '',
        technicianName: pmTask.technicianName || '',
        notes: pmTask.notes || '',
        isActive: pmTask.isActive !== false
      });
    } else {
      // Reset for create mode
      setFormData({
        equipment: '',
        roomNumber: '',
        roomId: '',
        category: 'general',
        frequency: 'monthly',
        nextDueDate: new Date().toISOString().split('T')[0],
        assignedTo: '',
        technicianName: '',
        notes: '',
        isActive: true
      });
    }
    setErrors({});
  }, [pmTask, mode, isOpen]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: null }));
  };

  const handleRoomChange = (roomNumber) => {
    const room = rooms?.find(r => r.roomNumber === roomNumber);
    setFormData(prev => ({
      ...prev,
      roomNumber,
      roomId: room?.id || ''
    }));
  };

  const handleTechChange = (techId) => {
    const tech = technicians.find(t => t.id === techId);
    setFormData(prev => ({
      ...prev,
      assignedTo: techId,
      technicianName: tech?.name || ''
    }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.equipment.trim()) {
      newErrors.equipment = 'Equipment/Task name is required';
    }
    if (!formData.nextDueDate) {
      newErrors.nextDueDate = 'Next due date is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // BUG-027 FIX: Await async onSubmit before closing the modal.
  // Previously, onClose() fired immediately (before the API call completed).
  // If the API failed, the modal was already closed and the user believed
  // the task was created — but it was never persisted, so it vanished on refresh.
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!validate()) return;
    setIsSubmitting(true);
    try {
      if (mode === 'edit' && pmTask) {
        await onSubmit(pmTask.id, formData);
      } else {
        await onSubmit(formData);
      }
      onClose();
    } catch {
      // Error toast is shown by the hook — keep modal open so user can retry
    } finally {
      setIsSubmitting(false);
    }
  };

  // Prepare dropdown options
  const roomOptions = [
    { value: '', label: 'Building / Common Area' },
    ...(rooms?.map(room => ({
      value: room.roomNumber,
      label: `${room.roomNumber} - ${room.type}`
    })) || [])
  ];

  const categoryOptions = WO_CATEGORIES.map(cat => ({
    value: cat.value,
    label: cat.label
  }));

  const frequencyOptions = PM_FREQUENCY.map(freq => ({
    value: freq.value,
    label: freq.label
  }));

  const technicianOptions = [
    { value: '', label: 'Unassigned' },
    ...technicians
      .filter(t => t.status === 'active' || t.status === 'on_duty')
      .map(tech => ({
        value: tech.id,
        label: `${tech.name} (${tech.specialty})`
      }))
  ];

  // Custom header
  const renderHeader = () => (
    <div className="flex-1 min-w-0">
      <h2 className="text-lg font-semibold text-neutral-900 tracking-tight">
        {mode === 'edit' ? 'Edit PM Task' : 'Create PM Task'}
      </h2>
      <p className="text-[13px] text-neutral-500 mt-1">
        {mode === 'edit' && pmTask ? pmTask.id : 'Add a new preventive maintenance task'}
      </p>
    </div>
  );

  // Footer
  const renderFooter = () => (
    <div className="flex items-center justify-end gap-3">
      <button
        type="button"
        onClick={onClose}
        className="px-4 py-2.5 border border-neutral-200 text-neutral-600 hover:border-neutral-300 hover:bg-neutral-50 rounded-lg text-[13px] font-medium transition-colors"
      >
        Cancel
      </button>
      <button
        type="button"
        onClick={handleSubmit}
        disabled={isSubmitting}
        className="px-4 py-2.5 bg-terra-500 hover:bg-terra-600 disabled:opacity-60 disabled:cursor-not-allowed text-white rounded-lg text-[13px] font-semibold transition-colors"
      >
        {isSubmitting ? 'Saving...' : (mode === 'edit' ? 'Save Changes' : 'Create PM Task')}
      </button>
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
        {/* Equipment/Task Name */}
        <div>
          <h4 className="text-[11px] font-semibold uppercase tracking-widest text-neutral-900 mb-3">
            Equipment / Task Name <span className="text-rose-500">*</span>
          </h4>
          <input
            type="text"
            value={formData.equipment}
            onChange={(e) => handleChange('equipment', e.target.value)}
            placeholder="e.g., HVAC System - Building A"
            className={`w-full h-10 px-4 bg-white border rounded-lg text-[13px] text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-terra-500/10 focus:border-terra-400 transition-all hover:border-neutral-300 ${
              errors.equipment ? 'border-rose-300' : 'border-neutral-200'
            }`}
          />
          {errors.equipment && <p className="text-xs text-rose-500 mt-1">{errors.equipment}</p>}
        </div>

        {/* Room (Optional) */}
        <DrawerSelect
          label="Room (Optional)"
          value={formData.roomNumber}
          onChange={handleRoomChange}
          placeholder="Building / Common Area"
          options={roomOptions}
        />

        {/* Category & Frequency Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <DrawerSelect
            label="Category"
            value={formData.category}
            onChange={(value) => handleChange('category', value)}
            placeholder="Select category"
            options={categoryOptions}
          />

          <DrawerSelect
            label="Frequency"
            value={formData.frequency}
            onChange={(value) => handleChange('frequency', value)}
            placeholder="Select frequency"
            options={frequencyOptions}
          />
        </div>

        {/* Next Due Date */}
        <div>
          <h4 className="text-[11px] font-semibold uppercase tracking-widest text-neutral-900 mb-3">
            Next Due Date <span className="text-rose-500">*</span>
          </h4>
          <DatePicker
            value={formData.nextDueDate}
            onChange={(value) => handleChange('nextDueDate', value)}
            placeholder="Select due date"
            className="w-full"
          />
          {errors.nextDueDate && <p className="text-xs text-rose-500 mt-1">{errors.nextDueDate}</p>}
        </div>

        {/* Assign Technician */}
        <DrawerSelect
          label="Assign Technician"
          value={formData.assignedTo}
          onChange={handleTechChange}
          placeholder="Unassigned"
          options={technicianOptions}
        />

        {/* Notes */}
        <div>
          <h4 className="text-[11px] font-semibold uppercase tracking-widest text-neutral-900 mb-3">
            Notes / Checklist
          </h4>
          <textarea
            value={formData.notes}
            onChange={(e) => handleChange('notes', e.target.value)}
            placeholder="Describe what needs to be done during this maintenance task..."
            rows={3}
            className="w-full px-4 py-3 bg-white border border-neutral-200 rounded-lg text-[13px] text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-terra-500/10 focus:border-terra-400 transition-all resize-none hover:border-neutral-300"
          />
        </div>

        {/* Active Toggle */}
        <div className="p-3 sm:p-4 rounded-lg bg-neutral-50 border border-neutral-200">
          <label className="flex items-center gap-2 sm:gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.isActive}
              onChange={(e) => handleChange('isActive', e.target.checked)}
              className="w-4 h-4 rounded border-neutral-300 text-terra-500 focus:ring-terra-500/20"
            />
            <div>
              <span className="font-semibold text-neutral-900 text-[12px] sm:text-[13px]">Active</span>
              <p className="text-[10px] sm:text-[11px] text-neutral-500 mt-0.5">
                Active tasks will appear in the maintenance calendar
              </p>
            </div>
          </label>
        </div>
      </div>
    </Drawer>
  );
}
