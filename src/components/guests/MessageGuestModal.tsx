import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Send, Mail } from 'lucide-react';
import CustomDropdown from '../ui/CustomDropdown';

export default function MessageGuestModal({ guest, isOpen, onClose, onSend }) {
  const [formData, setFormData] = useState({
    subject: '',
    message: '',
    template: 'custom'
  });

  const templates = {
    custom: { subject: '', message: '' },
    welcome: {
      subject: 'Welcome to Glimmora',
      message: `Dear ${guest?.name || 'Guest'},\n\nWelcome to Glimmora! We're thrilled to have you stay with us.\n\nIf you need anything during your stay, please don't hesitate to reach out to our concierge team.\n\nBest regards,\nThe Glimmora Team`
    },
    thankyou: {
      subject: 'Thank You for Your Stay',
      message: `Dear ${guest?.name || 'Guest'},\n\nThank you for choosing Glimmora for your recent stay. We hope you had a wonderful experience.\n\nWe'd love to welcome you back soon!\n\nWarm regards,\nThe Glimmora Team`
    },
    followup: {
      subject: "We'd Love Your Feedback",
      message: `Dear ${guest?.name || 'Guest'},\n\nWe hope you enjoyed your recent stay at Glimmora.\n\nYour feedback is invaluable to us. Would you mind taking a moment to share your experience?\n\nThank you,\nThe Glimmora Team`
    },
    birthday: {
      subject: 'Happy Birthday from Glimmora!',
      message: `Dear ${guest?.name || 'Guest'},\n\nHappy Birthday! 🎉\n\nWe'd like to offer you a special 20% discount on your next stay with us.\n\nCelebrate in style at Glimmora!\n\nBest wishes,\nThe Glimmora Team`
    }
  };

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  useEffect(() => {
    if (formData.template !== 'custom') {
      const template = templates[formData.template];
      setFormData(prev => ({
        ...prev,
        subject: template.subject,
        message: template.message
      }));
    }
  }, [formData.template, guest]);

  if (!isOpen || !guest) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleTemplateChange = (value) => {
    setFormData(prev => ({ ...prev, template: value }));
  };

  const templateOptions = [
    { value: 'custom', label: 'Custom Message' },
    { value: 'welcome', label: 'Welcome Email' },
    { value: 'thankyou', label: 'Thank You Note' },
    { value: 'followup', label: 'Follow-up Request' },
    { value: 'birthday', label: 'Birthday Greeting' },
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    onSend(guest.id, {
      subject: formData.subject,
      message: formData.message,
      sentAt: new Date().toISOString()
    });
    onClose();
    setFormData({ subject: '', message: '', template: 'custom' });
  };

  const inputStyles = "w-full px-4 py-2.5 bg-white border border-neutral-200 rounded-[10px] hover:border-terra-500/50 focus:outline-none focus:ring-2 focus:ring-terra-500/20 focus:border-terra-500 transition-all duration-200 text-[13px]";

  const modalContent = (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/30 z-[60] transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Right Side Drawer */}
      <div
        className={`fixed inset-y-0 right-0 z-[70] w-[680px] transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div
          className="bg-white shadow-2xl w-full h-full flex flex-col"
          onClick={(e) => e.stopPropagation()}
          role="dialog"
          aria-modal="true"
        >
          {/* Header */}
          <div className="flex-shrink-0 px-6 py-5 border-b border-neutral-200 flex items-center justify-between">
            <div>
              <h2 className="text-[17px] font-semibold text-neutral-900 tracking-tight">Send Message</h2>
              <p className="text-[13px] text-neutral-600 mt-0.5">
                Send a message to {guest.name}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-neutral-100 rounded-lg transition-all duration-200 hover:scale-110 active:scale-95 focus:outline-none focus:ring-2 focus:ring-terra-500"
            >
              <X className="w-5 h-5 text-neutral-600 hover:text-neutral-900 transition-colors" />
            </button>
          </div>

          {/* Scrollable Form Content */}
          <div className="flex-1 overflow-y-auto">
            <form id="message-form" onSubmit={handleSubmit} className="p-6 space-y-5">
              {/* Template Selector */}
              <CustomDropdown
                label="Template"
                options={templateOptions}
                value={formData.template}
                onChange={handleTemplateChange}
                placeholder="Select a template"
              />

              {/* Subject */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                  Subject <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  placeholder="Enter email subject..."
                  className={inputStyles}
                />
              </div>

              {/* Message Body */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                  Message <span className="text-rose-500">*</span>
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={10}
                  placeholder="Type your message here..."
                  className={`${inputStyles} resize-none`}
                />
              </div>

              {/* Recipient Info */}
              <div className="flex items-center gap-3 p-4 bg-neutral-50 rounded-xl">
                <div className="w-9 h-9 bg-white rounded-full flex items-center justify-center border border-neutral-200">
                  <Mail className="w-4 h-4 text-neutral-400" />
                </div>
                <div>
                  <p className="text-xs text-neutral-500">This message will be sent to</p>
                  <p className="text-sm font-medium text-neutral-900">{guest.email}</p>
                </div>
              </div>
            </form>
          </div>

          {/* Actions Footer */}
          <div className="flex-shrink-0 border-t border-neutral-200 px-6 py-4 bg-white">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-5 py-2.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-[10px] transition-all duration-200 text-[13px] font-semibold focus:outline-none focus:ring-2 focus:ring-neutral-400/20"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="message-form"
                className="flex-1 flex items-center justify-center gap-2 px-5 py-2.5 bg-terra-500 hover:bg-terra-600 text-white rounded-[10px] transition-all duration-200 text-[13px] font-semibold shadow-sm focus:outline-none focus:ring-2 focus:ring-terra-500/20"
              >
                <Send className="w-4 h-4" />
                Send Message
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );

  return createPortal(modalContent, document.body);
}
