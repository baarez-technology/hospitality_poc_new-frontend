/**
 * MessageStaffModal Component
 * Send message to staff - Glimmora Design System v5.0
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

export default function MessageStaffModal({ staff, isOpen, onClose, onSend }) {
  const [formData, setFormData] = useState({
    template: 'custom',
    subject: '',
    message: ''
  });

  const messageTemplates = {
    welcome: {
      subject: 'Welcome to Terra Suites Team!',
      message: `Dear ${staff?.name || '[Staff Name]'},

Welcome to the team! We're excited to have you join Terra Suites.

We believe you'll be a valuable addition to our team, and we look forward to working with you. If you have any questions or need assistance as you settle in, please don't hesitate to reach out.

We're confident that together we'll continue to provide exceptional service to our guests.

Best regards,
Terra Suites Management`
    },
    shiftReminder: {
      subject: 'Upcoming Shift Reminder',
      message: `Dear ${staff?.name || '[Staff Name]'},

This is a reminder about your upcoming shift.

Please ensure you arrive 15 minutes before your scheduled start time and review any specific duties or updates from your supervisor.

If you have any conflicts or need to make changes to your schedule, please contact us as soon as possible.

Thank you for your dedication!

Best regards,
Terra Suites Management`
    },
    performanceReview: {
      subject: 'Performance Review Invitation',
      message: `Dear ${staff?.name || '[Staff Name]'},

We'd like to schedule your performance review for the upcoming period.

This is an opportunity for us to discuss your achievements, goals, and any support you may need to excel in your role. Your contributions to Terra Suites are valued, and we want to ensure your continued growth and success.

Please let us know your availability for a meeting in the next week.

Best regards,
Terra Suites Management`
    },
    custom: {
      subject: '',
      message: ''
    }
  };

  useEffect(() => {
    if (isOpen) {
      setFormData({ template: 'custom', subject: '', message: '' });
    }
  }, [isOpen]);

  if (!staff) return null;

  const handleTemplateChange = (value) => {
    const template = messageTemplates[value];
    setFormData({
      template: value,
      subject: template.subject,
      message: template.message
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSend(staff.id, formData);
    onClose();
  };

  const templateOptions = [
    { value: 'custom', label: 'Custom Message' },
    { value: 'welcome', label: 'Welcome - New team member greeting' },
    { value: 'shiftReminder', label: 'Shift Reminder - Upcoming shift notification' },
    { value: 'performanceReview', label: 'Performance Review - Review invitation' }
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
        Send Message
      </Button>
    </div>
  );

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title="Send Message"
      subtitle={`To: ${staff.name} (${staff.email})`}
      maxWidth="max-w-2xl"
      footer={renderFooter()}
    >
      <div className="space-y-6">
        {/* Template Selector */}
        <div>
          <h4 className="text-[11px] font-semibold uppercase tracking-widest text-neutral-900 mb-3">
            Message Template
          </h4>
          <SelectDropdown
            value={formData.template}
            onChange={handleTemplateChange}
            options={templateOptions}
            placeholder="Select a template"
          />
        </div>

        {/* Subject */}
        <div>
          <h4 className="text-[11px] font-semibold uppercase tracking-widest text-neutral-900 mb-3">
            Subject
            <span className="text-rose-500 ml-1">*</span>
          </h4>
          <input
            type="text"
            name="subject"
            value={formData.subject}
            onChange={handleChange}
            required
            placeholder="Enter message subject"
            className={inputStyles}
          />
        </div>

        {/* Message */}
        <div>
          <h4 className="text-[11px] font-semibold uppercase tracking-widest text-neutral-900 mb-3">
            Message
            <span className="text-rose-500 ml-1">*</span>
          </h4>
          <textarea
            name="message"
            value={formData.message}
            onChange={handleChange}
            required
            rows={10}
            placeholder="Type your message here..."
            className="w-full px-3.5 py-2.5 rounded-lg text-[13px] bg-white border border-neutral-200 text-neutral-900 placeholder:text-neutral-400 hover:border-neutral-300 focus:border-terra-400 focus:ring-2 focus:ring-terra-500/10 focus:outline-none transition-all resize-none"
          />
        </div>

        {/* Recipient Info */}
        <div className="p-4 bg-sage-50 rounded-lg border border-sage-100">
          <p className="text-[10px] font-medium text-sage-600 mb-1">Message will be sent to:</p>
          <p className="text-[13px] font-semibold text-neutral-900">{staff.name}</p>
          <p className="text-[11px] text-neutral-600">{staff.email}</p>
        </div>
      </div>
    </Drawer>
  );
}
