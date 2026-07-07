import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Calendar, Clock, CheckCircle2, Loader2, AlertTriangle } from 'lucide-react';
import { staffService } from '../../../../api/services/staff.service';
import { Button } from '../../../ui2/Button';

export default function AssignShiftModal({ staff, isOpen, onClose, onAssign }) {
  const [formData, setFormData] = useState({
    shift: 'morning',
    date: '',
    endDate: '',
    startTime: '08:00',
    endTime: '16:00',
    multipleDays: false
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDuplicateWarning, setShowDuplicateWarning] = useState(false);
  const [existingShiftDates, setExistingShiftDates] = useState<string[]>([]);

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

    // Set default date to today
    const today = new Date().toISOString().split('T')[0];
    setFormData({
      shift: staff?.shift || 'morning',
      date: today,
      endDate: today,
      startTime: '08:00',
      endTime: '16:00',
      multipleDays: false
    });
    setError(null);
    setShowDuplicateWarning(false);
    setExistingShiftDates([]);

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
  }, [isOpen, onClose, staff]);

  if (!isOpen || !staff) return null;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;

    setFormData(prev => ({ ...prev, [name]: newValue }));

    // Auto-adjust times based on shift
    if (name === 'shift') {
      if (value === 'morning') {
        setFormData(prev => ({ ...prev, startTime: '08:00', endTime: '16:00' }));
      } else if (value === 'evening') {
        setFormData(prev => ({ ...prev, startTime: '16:00', endTime: '00:00' }));
      } else if (value === 'night') {
        setFormData(prev => ({ ...prev, startTime: '00:00', endTime: '08:00' }));
      }
    }

    // If multipleDays is unchecked, reset endDate to match date
    if (name === 'multipleDays' && !checked) {
      setFormData(prev => ({ ...prev, endDate: prev.date }));
    }

    // If date changes and multipleDays is on, ensure endDate is not before date
    if (name === 'date' && formData.multipleDays) {
      const newDate = new Date(value);
      const currentEndDate = new Date(formData.endDate);
      if (currentEndDate < newDate) {
        setFormData(prev => ({ ...prev, endDate: value }));
      }
    }
  };

  // Check if any of the selected dates already have shifts assigned
  const checkForExistingShifts = (): string[] => {
    if (!staff?.schedule) return [];

    const existingDates: string[] = [];

    if (formData.multipleDays) {
      const startDate = new Date(formData.date);
      const endDate = new Date(formData.endDate);

      for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
        const dateStr = date.toISOString().split('T')[0];
        const hasExisting = staff.schedule.some(s => s.date === dateStr);
        if (hasExisting) {
          existingDates.push(dateStr);
        }
      }
    } else {
      const hasExisting = staff.schedule.some(s => s.date === formData.date);
      if (hasExisting) {
        existingDates.push(formData.date);
      }
    }

    return existingDates;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check for existing shifts first (unless user already confirmed)
    if (!showDuplicateWarning) {
      const duplicates = checkForExistingShifts();
      if (duplicates.length > 0) {
        setExistingShiftDates(duplicates);
        setShowDuplicateWarning(true);
        return;
      }
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // If multiple days is enabled, create an entry for each day
      if (formData.multipleDays) {
        const startDate = new Date(formData.date);
        const endDate = new Date(formData.endDate);
        const scheduleEntries = [];

        // Generate schedule entries for each day in the range
        for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
          const dateStr = date.toISOString().split('T')[0];
          // Call API for each day
          await staffService.assignShift(staff.id, {
            schedule_date: dateStr,
            shift_type: formData.shift,
            start_time: formData.startTime,
            end_time: formData.endTime
          });
          scheduleEntries.push({
            ...formData,
            date: dateStr
          });
        }

        // Pass all entries to the onAssign function
        onAssign(staff.id, scheduleEntries);
      } else {
        // Single day assignment
        await staffService.assignShift(staff.id, {
          schedule_date: formData.date,
          shift_type: formData.shift,
          start_time: formData.startTime,
          end_time: formData.endTime
        });
        onAssign(staff.id, formData);
      }

      onClose();
    } catch (err: any) {
      console.error('Failed to assign shift:', err);
      setError(err.response?.data?.detail || err.message || 'Failed to assign shift. Please try again.');
    } finally {
      setIsSubmitting(false);
      setShowDuplicateWarning(false);
      setExistingShiftDates([]);
    }
  };

  const handleCancelDuplicate = () => {
    setShowDuplicateWarning(false);
    setExistingShiftDates([]);
  };

  // Get min date (today)
  const today = new Date().toISOString().split('T')[0];

  const modalContent = (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 flex items-center justify-center p-4"
        onClick={onClose}
      >
        {/* Modal */}
        <div
          className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden animate-scaleIn"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-6 border-b border-neutral-200">
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-2xl font-serif font-bold text-neutral-900">Assign Shift</h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-neutral-100 rounded-lg transition-all duration-150 active:scale-95"
              >
                <X className="w-5 h-5 text-neutral-600" />
              </button>
            </div>
            <p className="text-sm text-neutral-600">
              {staff.name} - {staff.role}
            </p>
          </div>

          {/* Form - Scrollable Content */}
          <div className="overflow-y-auto max-h-[calc(90vh-200px)] custom-scrollbar">
            <form onSubmit={handleSubmit} className="p-6 pb-4 space-y-6">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                  {error}
                </div>
              )}

              {showDuplicateWarning && (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0">
                      <AlertTriangle className="w-4 h-4 text-amber-600" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-semibold text-amber-900">Shift Already Assigned</h4>
                      <p className="text-sm text-amber-700 mt-1">
                        {staff.name} already has a shift assigned for the following date{existingShiftDates.length > 1 ? 's' : ''}:
                      </p>
                      <ul className="mt-2 space-y-1">
                        {existingShiftDates.map(date => (
                          <li key={date} className="text-sm font-medium text-amber-800">
                            • {new Date(date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                          </li>
                        ))}
                      </ul>
                      <p className="text-sm text-amber-700 mt-3">
                        Do you want to replace the existing shift{existingShiftDates.length > 1 ? 's' : ''} with the new assignment?
                      </p>
                      <div className="flex gap-2 mt-4">
                        <Button variant="outline-warning" size="sm" onClick={handleCancelDuplicate}>
                          Cancel
                        </Button>
                        <Button variant="warning" size="sm" onClick={handleSubmit}>
                          Replace Shift{existingShiftDates.length > 1 ? 's' : ''}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

          {/* Date Selection */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-1 h-5 bg-[#A57865] rounded-full"></div>
              <Calendar className="w-4 h-4 text-[#A57865]" />
              <h3 className="text-base font-semibold text-neutral-900">Date Selection</h3>
            </div>

            {/* Multiple Days Checkbox */}
            <div className="flex items-center gap-3 p-4 bg-[#FAF8F6] rounded-xl border border-neutral-100 mb-4">
              <input
                type="checkbox"
                id="multipleDays"
                name="multipleDays"
                checked={formData.multipleDays}
                onChange={handleChange}
                disabled={isSubmitting}
                className="w-4 h-4 text-[#A57865] bg-white border-neutral-300 rounded focus:ring-2 focus:ring-[#A57865] transition-all duration-200 cursor-pointer"
              />
              <label htmlFor="multipleDays" className="text-sm font-semibold text-neutral-700 cursor-pointer">
                Assign to multiple consecutive days
              </label>
            </div>

            {/* Date Range */}
            <div className={`grid ${formData.multipleDays ? 'grid-cols-2' : 'grid-cols-1'} gap-4`}>
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-neutral-700 mb-2">
                  <Calendar className="w-4 h-4 text-[#A57865]" />
                  {formData.multipleDays ? 'Start Date' : 'Date'} <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  min={today}
                  required
                  disabled={isSubmitting}
                  className="w-full px-4 py-2.5 bg-[#FAF8F6] border border-neutral-200 rounded-xl text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-[#A57865] focus:border-[#A57865] transition-all duration-200 cursor-pointer disabled:opacity-50"
                />
              </div>
              {formData.multipleDays && (
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-neutral-700 mb-2">
                    <Calendar className="w-4 h-4 text-[#A57865]" />
                    End Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleChange}
                    min={formData.date || today}
                    required
                    disabled={isSubmitting}
                    className="w-full px-4 py-2.5 bg-[#FAF8F6] border border-neutral-200 rounded-xl text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-[#A57865] focus:border-[#A57865] transition-all duration-200 cursor-pointer disabled:opacity-50"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Shift Details */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-1 h-5 bg-[#4E5840] rounded-full"></div>
              <Clock className="w-4 h-4 text-[#4E5840]" />
              <h3 className="text-base font-semibold text-neutral-900">Shift Details</h3>
            </div>

            {/* Shift Type */}
            <div className="mb-4">
              <label className="flex items-center gap-2 text-sm font-semibold text-neutral-700 mb-2">
                <CheckCircle2 className="w-4 h-4 text-[#4E5840]" />
                Shift Type <span className="text-red-500">*</span>
              </label>
              <select
                name="shift"
                value={formData.shift}
                onChange={handleChange}
                required
                disabled={isSubmitting}
                className="w-full px-4 py-2.5 bg-[#FAF8F6] border border-neutral-200 rounded-xl text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-[#4E5840] focus:border-[#4E5840] transition-all duration-200 cursor-pointer disabled:opacity-50"
              >
                <option value="morning">Morning Shift</option>
                <option value="evening">Evening Shift</option>
                <option value="night">Night Shift</option>
              </select>
            </div>

            {/* Time Range */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-neutral-700 mb-2">
                  <Clock className="w-4 h-4 text-[#4E5840]" />
                  Start Time <span className="text-red-500">*</span>
                </label>
                <input
                  type="time"
                  name="startTime"
                  value={formData.startTime}
                  onChange={handleChange}
                  required
                  disabled={isSubmitting}
                  className="w-full px-4 py-2.5 bg-[#FAF8F6] border border-neutral-200 rounded-xl text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-[#4E5840] focus:border-[#4E5840] transition-all duration-200 cursor-pointer disabled:opacity-50"
                />
              </div>
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-neutral-700 mb-2">
                  <Clock className="w-4 h-4 text-[#4E5840]" />
                  End Time <span className="text-red-500">*</span>
                </label>
                <input
                  type="time"
                  name="endTime"
                  value={formData.endTime}
                  onChange={handleChange}
                  required
                  disabled={isSubmitting}
                  className="w-full px-4 py-2.5 bg-[#FAF8F6] border border-neutral-200 rounded-xl text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-[#4E5840] focus:border-[#4E5840] transition-all duration-200 cursor-pointer disabled:opacity-50"
                />
              </div>
            </div>
          </div>

          {/* Summary */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-1 h-5 bg-[#CDB261] rounded-full"></div>
              <h3 className="text-base font-semibold text-neutral-900">Summary</h3>
            </div>
            <div className="p-4 bg-gradient-to-r from-[#CDB261]/10 to-[#CDB261]/5 rounded-xl border border-[#CDB261]/20">
              <p className="text-xs font-semibold text-neutral-700 mb-2">Shift Assignment Details</p>
              <p className="text-sm text-neutral-900">
                {formData.multipleDays ? (
                  <>
                    Assigning <span className="font-semibold text-[#A57865]">{formData.shift} shift</span> from <span className="font-semibold">{formData.date}</span> to <span className="font-semibold">{formData.endDate}</span> ({formData.startTime} - {formData.endTime} daily)
                    {formData.date && formData.endDate && (
                      <span className="block mt-2 text-xs font-semibold text-[#4E5840]">
                        Total: {Math.ceil((new Date(formData.endDate) - new Date(formData.date)) / (1000 * 60 * 60 * 24)) + 1} days
                      </span>
                    )}
                  </>
                ) : (
                  <>
                    Assigning <span className="font-semibold text-[#A57865]">{formData.shift} shift</span> on <span className="font-semibold">{formData.date}</span> from <span className="font-semibold">{formData.startTime}</span> to <span className="font-semibold">{formData.endTime}</span>
                  </>
                )}
              </p>
            </div>
          </div>
            </form>
          </div>

          {/* Footer Actions */}
          <div className="border-t border-neutral-200 p-6 bg-white">
            <div className="flex items-center justify-end gap-3">
              <Button variant="ghost" onClick={onClose} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button variant="primary" onClick={handleSubmit} disabled={isSubmitting} icon={isSubmitting ? Loader2 : Calendar} loading={isSubmitting}>
                {isSubmitting ? 'Assigning...' : 'Assign Shift'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );

  return createPortal(modalContent, document.body);
}
