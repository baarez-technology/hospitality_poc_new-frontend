/**
 * EditWODrawer Component
 * Side drawer for editing work orders - Glimmora Design System v5.0
 * Pattern matching CreateWOModal drawer
 */

import { useState, useEffect } from 'react';
import { AlertTriangle, ChevronDown, Check } from 'lucide-react';
import { Drawer } from '../../../ui2/Drawer';
import { Button } from '../../../ui2/Button';
import DatePicker from '../../../ui2/DatePicker';
import { WO_CATEGORIES, STATUS_CONFIG } from '@/utils/admin/maintenance';

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

export default function EditWOModal({ isOpen, onClose, onSubmit, workOrder, technicians, rooms }) {
  const [formData, setFormData] = useState({
    roomNumber: '',
    roomId: '',
    roomType: '',
    category: 'general',
    priority: 'medium',
    issue: '',
    description: '',
    status: 'open',
    assignedTo: '',
    technicianName: '',
    isOOO: false,
    estimatedCompletion: '',
    notes: ''
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (workOrder) {
      setFormData({
        roomNumber: workOrder.roomNumber || '',
        roomId: workOrder.roomId || '',
        roomType: workOrder.roomType || '',
        category: workOrder.category || 'general',
        priority: workOrder.priority || 'medium',
        issue: workOrder.issue || '',
        description: workOrder.description || '',
        status: workOrder.status || 'open',
        assignedTo: workOrder.assignedTo || '',
        technicianName: workOrder.technicianName || '',
        isOOO: workOrder.isOOO || false,
        estimatedCompletion: (workOrder.scheduledDate || workOrder.estimatedCompletion) ?
          new Date(workOrder.scheduledDate || workOrder.estimatedCompletion).toISOString().split('T')[0] : '',
        notes: workOrder.notes || ''
      });
      setErrors({});
    }
  }, [workOrder]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: null }));
  };

  const handleRoomChange = (roomNumber) => {
    const room = rooms?.find(r => r.roomNumber === roomNumber);
    setFormData(prev => ({
      ...prev,
      roomNumber,
      roomId: room?.id || '',
      roomType: room?.type || ''
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
    if (!formData.issue.trim()) {
      newErrors.issue = 'Issue is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validate()) {
      onSubmit(workOrder.id, formData);
      onClose();
    }
  };

  if (!workOrder) return null;

  // Prepare dropdown options
  const roomOptions = [
    { value: '', label: 'Common Area / No Room' },
    ...(rooms?.map(room => ({
      value: room.roomNumber,
      label: `${room.roomNumber} - ${room.type}`
    })) || [])
  ];

  const categoryOptions = WO_CATEGORIES.map(cat => ({
    value: cat.value,
    label: cat.label
  }));

  const statusOptions = Object.entries(STATUS_CONFIG).map(([key, config]) => ({
    value: key,
    label: config.label
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
      <h2 className="text-lg font-semibold text-neutral-900 tracking-tight">Edit Work Order</h2>
      <p className="text-[13px] text-neutral-500 mt-1">{workOrder.id}</p>
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
        className="px-4 py-2.5 bg-terra-500 hover:bg-terra-600 text-white rounded-lg text-[13px] font-semibold transition-colors"
      >
        Save Changes
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
        {/* Room Selection */}
        <DrawerSelect
          label="Room"
          value={formData.roomNumber}
          onChange={handleRoomChange}
          placeholder="Common Area / No Room"
          options={roomOptions}
        />

        {/* Issue */}
        <div>
          <h4 className="text-[11px] font-semibold uppercase tracking-widest text-neutral-900 mb-3">
            Issue <span className="text-rose-500">*</span>
          </h4>
          <input
            type="text"
            value={formData.issue}
            onChange={(e) => handleChange('issue', e.target.value)}
            placeholder="Brief description of the issue"
            className={`w-full h-10 px-4 bg-white border rounded-lg text-[13px] text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-terra-500/10 focus:border-terra-400 transition-all hover:border-neutral-300 ${
              errors.issue ? 'border-rose-300' : 'border-neutral-200'
            }`}
          />
          {errors.issue && <p className="text-xs text-rose-500 mt-1">{errors.issue}</p>}
        </div>

        {/* Description */}
        <div>
          <h4 className="text-[11px] font-semibold uppercase tracking-widest text-neutral-900 mb-3">
            Description
          </h4>
          <textarea
            value={formData.description}
            onChange={(e) => handleChange('description', e.target.value)}
            placeholder="Detailed description of the issue..."
            rows={3}
            className="w-full px-4 py-3 bg-white border border-neutral-200 rounded-lg text-[13px] text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-terra-500/10 focus:border-terra-400 transition-all resize-none hover:border-neutral-300"
          />
        </div>

        {/* Category, Priority & Status Row */}
        <div className="grid grid-cols-3 gap-4">
          <DrawerSelect
            label="Category"
            value={formData.category}
            onChange={(value) => handleChange('category', value)}
            placeholder="Select category"
            options={categoryOptions}
          />

          {/* Priority Buttons */}
          <div>
            <h4 className="text-[11px] font-semibold uppercase tracking-widest text-neutral-900 mb-3">
              Priority
            </h4>
            <div className="flex gap-2">
              {[
                { value: 'low', label: 'Low', activeClass: 'bg-sage-500 text-white' },
                { value: 'medium', label: 'Med', activeClass: 'bg-gold-500 text-white' },
                { value: 'high', label: 'High', activeClass: 'bg-rose-500 text-white' }
              ].map(priority => (
                <button
                  key={priority.value}
                  type="button"
                  onClick={() => handleChange('priority', priority.value)}
                  className={`flex-1 h-10 px-2 rounded-lg text-[12px] font-semibold transition-all ${
                    formData.priority === priority.value
                      ? priority.activeClass
                      : 'bg-white border border-neutral-200 text-neutral-700 hover:border-neutral-300'
                  }`}
                >
                  {priority.label}
                </button>
              ))}
            </div>
          </div>

          <DrawerSelect
            label="Status"
            value={formData.status}
            onChange={(value) => handleChange('status', value)}
            placeholder="Select status"
            options={statusOptions}
          />
        </div>

        {/* Assign Technician */}
        <DrawerSelect
          label="Assign Technician"
          value={formData.assignedTo}
          onChange={handleTechChange}
          placeholder="Unassigned"
          options={technicianOptions}
        />

        {/* Estimated Completion */}
        <div>
          <h4 className="text-[11px] font-semibold uppercase tracking-widest text-neutral-900 mb-3">
            Estimated Completion
          </h4>
          <DatePicker
            value={formData.estimatedCompletion}
            onChange={(value) => handleChange('estimatedCompletion', value)}
            placeholder="Select completion date"
            className="w-full"
          />
        </div>

        {/* Mark OOO */}
        {formData.roomNumber && (
          <div className="p-4 rounded-lg bg-rose-50 border border-rose-100">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isOOO}
                onChange={(e) => handleChange('isOOO', e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded border-rose-300 text-rose-600 focus:ring-rose-500/20"
              />
              <div>
                <div className="flex items-center gap-2 text-rose-700 font-semibold text-[13px]">
                  <AlertTriangle className="w-4 h-4" />
                  Mark Room Out of Order (OOO)
                </div>
                <p className="text-[11px] text-rose-600 mt-1">
                  This will update the room status and prevent new bookings
                </p>
              </div>
            </label>
          </div>
        )}

        {/* Notes */}
        <div>
          <h4 className="text-[11px] font-semibold uppercase tracking-widest text-neutral-900 mb-3">
            Notes
          </h4>
          <textarea
            value={formData.notes}
            onChange={(e) => handleChange('notes', e.target.value)}
            placeholder="Additional notes or instructions..."
            rows={2}
            className="w-full px-4 py-3 bg-white border border-neutral-200 rounded-lg text-[13px] text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-terra-500/10 focus:border-terra-400 transition-all resize-none hover:border-neutral-300"
          />
        </div>
      </div>
    </Drawer>
  );
}
