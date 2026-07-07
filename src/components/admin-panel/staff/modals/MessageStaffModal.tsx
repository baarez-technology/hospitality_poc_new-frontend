import { useState, useEffect } from 'react';
import { X, Send, Loader2 } from 'lucide-react';
import { staffService } from '../../../../api/services/staff.service';
import { Button } from '../../../ui2/Button';

export default function MessageStaffModal({ staff, isOpen, onClose, onSend }) {
  const [formData, setFormData] = useState({
    template: 'custom',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      document.body.style.overflow = 'hidden';
      setFormData({ template: 'custom', subject: '', message: '' });
      setError(null);
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen || !staff) return null;

  const handleTemplateChange = (e) => {
    const templateName = e.target.value;
    const template = messageTemplates[templateName];
    setFormData({
      template: templateName,
      subject: template.subject,
      message: template.message
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      await staffService.sendMessage(staff.id, {
        subject: formData.subject,
        message: formData.message,
        priority: 'normal'
      });
      onSend(staff.id, formData);
      onClose();
    } catch (err: any) {
      console.error('Failed to send message:', err);
      setError(err.response?.data?.detail || err.message || 'Failed to send message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden animate-scaleIn">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-neutral-200">
          <div>
            <h2 className="text-2xl font-serif font-semibold text-neutral-900">Send Message</h2>
            <p className="text-sm text-neutral-600 mt-1">
              To: {staff.name} ({staff.email})
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-neutral-100 rounded-lg transition-colors duration-150"
          >
            <X className="w-5 h-5 text-neutral-600" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              {error}
            </div>
          )}

          {/* Template Selector */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Message Template
            </label>
            <select
              value={formData.template}
              onChange={handleTemplateChange}
              disabled={isSubmitting}
              className="w-full px-4 py-3 bg-[#FAF8F6] border border-neutral-200 rounded-xl text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-[#A57865] focus:border-[#A57865] transition-all duration-200 disabled:opacity-50"
            >
              <option value="custom">Custom Message</option>
              <option value="welcome">Welcome - New team member greeting</option>
              <option value="shiftReminder">Shift Reminder - Upcoming shift notification</option>
              <option value="performanceReview">Performance Review - Review invitation</option>
            </select>
          </div>

          {/* Subject */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Subject *
            </label>
            <input
              type="text"
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              required
              disabled={isSubmitting}
              placeholder="Enter message subject"
              className="w-full px-4 py-3 bg-[#FAF8F6] border border-neutral-200 rounded-xl text-sm text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#A57865] focus:border-[#A57865] transition-all duration-200 disabled:opacity-50"
            />
          </div>

          {/* Message */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Message *
            </label>
            <textarea
              name="message"
              value={formData.message}
              onChange={handleChange}
              required
              disabled={isSubmitting}
              rows={10}
              placeholder="Type your message here..."
              className="w-full px-4 py-3 bg-[#FAF8F6] border border-neutral-200 rounded-xl text-sm text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#A57865] focus:border-[#A57865] transition-all duration-200 resize-none disabled:opacity-50"
            />
          </div>

          {/* Recipient Info */}
          <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
            <p className="text-xs font-medium text-blue-900 mb-1">Message will be sent to:</p>
            <p className="text-sm font-medium text-blue-900">{staff.name}</p>
            <p className="text-xs text-blue-700">{staff.email}</p>
          </div>
        </form>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-neutral-200">
          <Button variant="ghost" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmit} disabled={isSubmitting} icon={isSubmitting ? Loader2 : Send} loading={isSubmitting}>
            {isSubmitting ? 'Sending...' : 'Send Message'}
          </Button>
        </div>
      </div>
    </div>
  );
}
