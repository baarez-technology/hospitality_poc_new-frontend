/**
 * AssignShiftModal Component
 * Assign shift to staff - Glimmora Design System v5.0
 * Uses Drawer pattern with Tailwind components
 */

import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Calendar, Clock, ChevronDown, Check } from 'lucide-react';
import { Drawer } from '../../ui2/Drawer';
import { Button } from '../../ui2/Button';
import DatePicker from '../../ui2/DatePicker';

// Custom Select Dropdown Component
function SelectDropdown({ value, onChange, options, placeholder = 'Select...' }) {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState(null);
  const triggerRef = useRef(null);
  const menuRef = useRef(null);

  const selectedOption = options.find(opt => opt.value === value);

  const calculatePosition = () => {
    if (!triggerRef.current) return null;
    const rect = triggerRef.current.getBoundingClientRect();
    return {
      top: rect.bottom + 4,
      left: rect.left,
      width: rect.width
    };
  };

  const handleToggle = () => {
    if (isOpen) {
      setIsOpen(false);
      setPosition(null);
    } else {
      setPosition(calculatePosition());
      setIsOpen(true);
    }
  };

  const handleSelect = (optionValue) => {
    onChange(optionValue);
    setIsOpen(false);
    setPosition(null);
  };

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e) => {
      if (!triggerRef.current?.contains(e.target) && !menuRef.current?.contains(e.target)) {
        setIsOpen(false);
        setPosition(null);
      }
    };

    const handleEsc = (e) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
        setPosition(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEsc);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEsc);
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const updatePosition = () => {
      setPosition(calculatePosition());
    };

    window.addEventListener('scroll', updatePosition, true);
    window.addEventListener('resize', updatePosition);
    return () => {
      window.removeEventListener('scroll', updatePosition, true);
      window.removeEventListener('resize', updatePosition);
    };
  }, [isOpen]);

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={handleToggle}
        className={`w-full h-9 px-3.5 rounded-lg text-[13px] bg-white border text-left flex items-center justify-between transition-all ${
          isOpen
            ? 'border-terra-400 ring-2 ring-terra-500/10'
            : 'border-neutral-200 hover:border-neutral-300'
        }`}
      >
        <span className={selectedOption ? 'text-neutral-900' : 'text-neutral-400'}>
          {selectedOption?.label || placeholder}
        </span>
        <ChevronDown className={`w-4 h-4 text-neutral-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && position && createPortal(
        <div
          ref={menuRef}
          style={{
            position: 'fixed',
            top: `${position.top}px`,
            left: `${position.left}px`,
            width: `${position.width}px`,
            zIndex: 9999
          }}
          className="bg-white rounded-lg border border-neutral-200 shadow-lg shadow-neutral-900/10 overflow-hidden animate-in fade-in-0 zoom-in-95 duration-100"
        >
          <div className="py-1 max-h-60 overflow-y-auto">
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => handleSelect(option.value)}
                className={`w-full px-3 py-2.5 text-left text-[13px] flex items-center justify-between transition-colors ${
                  value === option.value
                    ? 'bg-terra-50 text-terra-700 font-medium'
                    : 'text-neutral-700 hover:bg-neutral-50'
                }`}
              >
                <span>{option.label}</span>
                {value === option.value && <Check className="w-4 h-4 text-terra-500" />}
              </button>
            ))}
          </div>
        </div>,
        document.body
      )}
    </>
  );
}

export default function AssignShiftModal({ staff, isOpen, onClose, onAssign }) {
  const [formData, setFormData] = useState({
    shift: 'morning',
    date: '',
    endDate: '',
    startTime: '08:00',
    endTime: '16:00',
    multipleDays: false
  });

  useEffect(() => {
    if (isOpen && staff) {
      const today = new Date().toISOString().split('T')[0];
      setFormData({
        shift: staff.shift || 'morning',
        date: today,
        endDate: today,
        startTime: '08:00',
        endTime: '16:00',
        multipleDays: false
      });
    }
  }, [isOpen, staff]);

  if (!staff) return null;

  const handleShiftChange = (value) => {
    setFormData(prev => {
      let startTime = '08:00';
      let endTime = '16:00';

      if (value === 'morning') {
        startTime = '08:00';
        endTime = '16:00';
      } else if (value === 'evening') {
        startTime = '16:00';
        endTime = '00:00';
      } else if (value === 'night') {
        startTime = '00:00';
        endTime = '08:00';
      }

      return { ...prev, shift: value, startTime, endTime };
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (formData.multipleDays) {
      const startDate = new Date(formData.date);
      const endDate = new Date(formData.endDate);
      const scheduleEntries = [];

      for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
        scheduleEntries.push({
          ...formData,
          date: date.toISOString().split('T')[0]
        });
      }

      onAssign(staff.id, scheduleEntries);
    } else {
      onAssign(staff.id, formData);
    }

    onClose();
  };

  const today = new Date().toISOString().split('T')[0];

  const shiftOptions = [
    { value: 'morning', label: 'Morning Shift' },
    { value: 'evening', label: 'Evening Shift' },
    { value: 'night', label: 'Night Shift' }
  ];

  const inputStyles = "w-full h-9 px-3.5 rounded-lg text-[13px] bg-white border border-neutral-200 text-neutral-900 hover:border-neutral-300 focus:border-terra-400 focus:ring-2 focus:ring-terra-500/10 focus:outline-none transition-all";

  const renderFooter = () => (
    <div className="flex items-center justify-end gap-3">
      <Button
        variant="ghost"
        onClick={onClose}
        className="px-5 py-2 text-[13px] font-semibold"
      >
        Cancel
      </Button>
      <Button
        variant="primary"
        onClick={handleSubmit}
        className="px-5 py-2 text-[13px] font-semibold"
      >
        Assign Shift
      </Button>
    </div>
  );

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title="Assign Shift"
      subtitle={`${staff.name} - ${staff.role}`}
      maxWidth="max-w-2xl"
      footer={renderFooter()}
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Date Selection */}
        <div>
          <h4 className="text-[11px] font-semibold uppercase tracking-widest text-neutral-900 mb-3 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-terra-500" />
            Date Selection
          </h4>

          {/* Multiple Days Checkbox */}
          <div className="flex items-center gap-3 p-3 sm:p-4 bg-neutral-50 rounded-lg border border-neutral-100 mb-4">
            <input
              type="checkbox"
              id="multipleDays"
              checked={formData.multipleDays}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                multipleDays: e.target.checked,
                endDate: e.target.checked ? prev.endDate : prev.date
              }))}
              className="w-4 h-4 text-terra-500 bg-white border-neutral-300 rounded focus:ring-2 focus:ring-terra-500/20 transition-all cursor-pointer"
            />
            <label htmlFor="multipleDays" className="text-[13px] font-medium text-neutral-700 cursor-pointer">
              Assign to multiple consecutive days
            </label>
          </div>

          {/* Date Range */}
          <div className={`grid ${formData.multipleDays ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1'} gap-3`}>
            <div>
              <label className="block text-[11px] font-medium text-neutral-500 mb-1.5">
                {formData.multipleDays ? 'Start Date' : 'Date'} <span className="text-rose-500">*</span>
              </label>
              <DatePicker
                value={formData.date}
                onChange={(date) => setFormData(prev => ({ ...prev, date }))}
                minDate={today}
                placeholder="Select date"
                className="w-full"
              />
            </div>
            {formData.multipleDays && (
              <div>
                <label className="block text-[11px] font-medium text-neutral-500 mb-1.5">
                  End Date <span className="text-rose-500">*</span>
                </label>
                <DatePicker
                  value={formData.endDate}
                  onChange={(date) => setFormData(prev => ({ ...prev, endDate: date }))}
                  minDate={formData.date || today}
                  placeholder="Select end date"
                  className="w-full"
                />
              </div>
            )}
          </div>
        </div>

        {/* Shift Details */}
        <div>
          <h4 className="text-[11px] font-semibold uppercase tracking-widest text-neutral-900 mb-3 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-sage-600" />
            Shift Details
          </h4>

          {/* Shift Type */}
          <div className="mb-4">
            <label className="block text-[11px] font-medium text-neutral-500 mb-1.5">
              Shift Type <span className="text-rose-500">*</span>
            </label>
            <SelectDropdown
              value={formData.shift}
              onChange={handleShiftChange}
              options={shiftOptions}
              placeholder="Select shift"
            />
          </div>

          {/* Time Range */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-medium text-neutral-500 mb-1.5">
                Start Time <span className="text-rose-500">*</span>
              </label>
              <input
                type="time"
                value={formData.startTime}
                onChange={(e) => setFormData(prev => ({ ...prev, startTime: e.target.value }))}
                required
                className={inputStyles}
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-neutral-500 mb-1.5">
                End Time <span className="text-rose-500">*</span>
              </label>
              <input
                type="time"
                value={formData.endTime}
                onChange={(e) => setFormData(prev => ({ ...prev, endTime: e.target.value }))}
                required
                className={inputStyles}
              />
            </div>
          </div>
        </div>

        {/* Summary */}
        <div>
          <h4 className="text-[11px] font-semibold uppercase tracking-widest text-neutral-900 mb-3">
            Summary
          </h4>
          <div className="p-3 sm:p-4 bg-gold-50 rounded-lg border border-gold-100">
            <p className="text-[10px] font-medium text-gold-600 mb-1.5">Shift Assignment Details</p>
            <p className="text-[13px] text-neutral-900">
              {formData.multipleDays ? (
                <>
                  Assigning <span className="font-semibold text-terra-600">{formData.shift} shift</span> from <span className="font-semibold">{formData.date}</span> to <span className="font-semibold">{formData.endDate}</span> ({formData.startTime} - {formData.endTime} daily)
                  {formData.date && formData.endDate && (
                    <span className="block mt-1.5 text-[11px] font-semibold text-sage-600">
                      Total: {Math.ceil((new Date(formData.endDate) - new Date(formData.date)) / (1000 * 60 * 60 * 24)) + 1} days
                    </span>
                  )}
                </>
              ) : (
                <>
                  Assigning <span className="font-semibold text-terra-600">{formData.shift} shift</span> on <span className="font-semibold">{formData.date}</span> from <span className="font-semibold">{formData.startTime}</span> to <span className="font-semibold">{formData.endTime}</span>
                </>
              )}
            </p>
          </div>
        </div>
      </form>
    </Drawer>
  );
}
