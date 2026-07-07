/**
 * EditStaffModal Component
 * Edit staff details - Glimmora Design System v5.0
 * Uses Drawer pattern with Tailwind components
 */

import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, Check } from 'lucide-react';
import { Drawer } from '../../ui2/Drawer';
import { Button } from '../../ui2/Button';

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

export default function EditStaffModal({ staff, isOpen, onClose, onSave }) {
  const [formData, setFormData] = useState({
    name: '',
    role: '',
    department: 'frontdesk',
    status: 'active',
    phone: '',
    email: ''
  });

  useEffect(() => {
    if (isOpen && staff) {
      setFormData({
        name: staff.name || '',
        role: staff.role || '',
        department: staff.department || 'frontdesk',
        status: staff.status || 'active',
        phone: staff.phone || '',
        email: staff.email || ''
      });
    }
  }, [isOpen, staff]);

  if (!staff) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(staff.id, formData);
    onClose();
  };

  const departmentOptions = [
    { value: 'frontdesk', label: 'Front Desk' },
    { value: 'housekeeping', label: 'Housekeeping' },
    { value: 'management', label: 'Management' },
    { value: 'maintenance', label: 'Maintenance' }
  ];

  const statusOptions = [
    { value: 'active', label: 'Active' },
    { value: 'off-duty', label: 'Off Duty' },
    { value: 'sick', label: 'Sick' },
    { value: 'leave', label: 'On Leave' }
  ];

  const inputStyles = "w-full h-9 px-3.5 rounded-lg text-[13px] bg-white border border-neutral-200 text-neutral-900 placeholder:text-neutral-400 hover:border-neutral-300 focus:border-terra-400 focus:ring-2 focus:ring-terra-500/10 focus:outline-none transition-all";

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
        Save Changes
      </Button>
    </div>
  );

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Staff Details"
      subtitle={`Update information for ${staff.name}`}
      maxWidth="max-w-2xl"
      footer={renderFooter()}
    >
      <div className="space-y-6">
        {/* Personal Information */}
        <div>
          <h4 className="text-[11px] font-semibold uppercase tracking-widest text-neutral-900 mb-3">
            Personal Information
          </h4>
          <div className="space-y-4">
            <div>
              <label className="block text-[11px] font-medium text-neutral-500 mb-1.5">
                Full Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="Enter full name"
                className={inputStyles}
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-neutral-500 mb-1.5">
                Role <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                name="role"
                value={formData.role}
                onChange={handleChange}
                required
                placeholder="e.g., Receptionist"
                className={inputStyles}
              />
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div>
          <h4 className="text-[11px] font-semibold uppercase tracking-widest text-neutral-900 mb-3">
            Contact Information
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-medium text-neutral-500 mb-1.5">
                Phone Number <span className="text-rose-500">*</span>
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
                placeholder="+1 (555) 123-4567"
                className={inputStyles}
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-neutral-500 mb-1.5">
                Email Address <span className="text-rose-500">*</span>
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="name@glimmora.com"
                className={inputStyles}
              />
            </div>
          </div>
        </div>

        {/* Employment Details */}
        <div>
          <h4 className="text-[11px] font-semibold uppercase tracking-widest text-neutral-900 mb-3">
            Employment Details
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-medium text-neutral-500 mb-1.5">
                Department <span className="text-rose-500">*</span>
              </label>
              <SelectDropdown
                value={formData.department}
                onChange={(value) => setFormData(prev => ({ ...prev, department: value }))}
                options={departmentOptions}
                placeholder="Select department"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-neutral-500 mb-1.5">
                Status <span className="text-rose-500">*</span>
              </label>
              <SelectDropdown
                value={formData.status}
                onChange={(value) => setFormData(prev => ({ ...prev, status: value }))}
                options={statusOptions}
                placeholder="Select status"
              />
            </div>
          </div>
        </div>
      </div>
    </Drawer>
  );
}
