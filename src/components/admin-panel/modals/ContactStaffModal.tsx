import { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Send } from 'lucide-react';
import { Button } from '../../ui2/Button';

const staffMembers = [
  { id: 1, name: 'Maria Santos', role: 'Front Desk Manager', department: 'Reception' },
  { id: 2, name: 'John Williams', role: 'Housekeeping Supervisor', department: 'Housekeeping' },
  { id: 3, name: 'Emily Chen', role: 'Concierge Lead', department: 'Concierge' },
  { id: 4, name: 'David Kumar', role: 'Maintenance Manager', department: 'Maintenance' },
  { id: 5, name: 'Lisa Martinez', role: 'F&B Manager', department: 'Food & Beverage' },
];

export default function ContactStaffModal({ isOpen, onClose, onSubmit }) {
  const [formData, setFormData] = useState({
    staff: '',
    subject: '',
    message: '',
    priority: 'normal',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.staff && formData.message) {
      onSubmit(formData);
      setFormData({ staff: '', subject: '', message: '', priority: 'normal' });
      onClose();
    }
  };

  if (!isOpen) return null;

  const modalContent = (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-neutral-900/30 backdrop-blur-sm z-40"
        onClick={onClose}
      />

      {/* Side Drawer */}
      <div
        className={`fixed top-0 bottom-0 right-0 h-screen w-full max-w-[650px] bg-white shadow-xl border-l border-neutral-200 z-50 transform transition-transform duration-300 ease-out flex flex-col ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex-shrink-0 bg-white border-b border-neutral-200 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-serif font-bold text-neutral-900">Contact Staff</h2>
            <p className="text-sm text-neutral-600 mt-1">Send a message to staff members</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-neutral-100 rounded-lg transition-all duration-200 hover:scale-110 active:scale-95 focus:outline-none focus:ring-2 focus:ring-[#A57865]"
          >
            <X className="w-5 h-5 text-neutral-600 hover:text-neutral-900 transition-colors" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar min-h-0">
          <form id="contact-staff-form" onSubmit={handleSubmit} className="p-6 space-y-6">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">Select Staff Member *</label>
              <select
                name="staff"
                value={formData.staff}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-[#FAF8F6] border border-neutral-200 rounded-xl hover:border-neutral-300 hover:bg-white focus:outline-none focus:ring-2 focus:ring-[#A57865] focus:ring-offset-2 focus:bg-white transition-all duration-200 cursor-pointer"
              >
                <option value="">Choose staff member...</option>
                {staffMembers.map((staff) => (
                  <option key={staff.id} value={staff.id}>
                    {staff.name} - {staff.role}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">Subject</label>
              <input
                type="text"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-[#FAF8F6] border border-neutral-200 rounded-xl hover:border-neutral-300 hover:bg-white focus:outline-none focus:ring-2 focus:ring-[#A57865] focus:ring-offset-2 focus:bg-white transition-all duration-200"
                placeholder="Brief subject line"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">Priority</label>
              <div className="grid grid-cols-4 gap-2">
                {['low', 'normal', 'high', 'urgent'].map((priority) => (
                  <button
                    key={priority}
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, priority }))}
                    className={`px-3 py-2 rounded-xl border-2 transition-all duration-200 capitalize text-sm font-medium ${
                      formData.priority === priority
                        ? 'border-[#A57865] bg-[#A57865]/10 text-[#A57865] font-semibold scale-105 shadow-sm'
                        : 'border-neutral-200 hover:border-[#A57865]/30 text-neutral-600 hover:bg-neutral-50'
                    }`}
                  >
                    {priority}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">Message *</label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                required
                rows="8"
                className="w-full px-4 py-3 bg-[#FAF8F6] border border-neutral-200 rounded-xl hover:border-neutral-300 hover:bg-white focus:outline-none focus:ring-2 focus:ring-[#A57865] focus:ring-offset-2 focus:bg-white transition-all duration-200 resize-none"
                placeholder="Type your message here..."
              />
            </div>
          </form>
        </div>

        {/* Actions Footer - Sticky */}
        <div className="flex-shrink-0 bg-white border-t border-neutral-200 px-6 py-4 flex items-center justify-end gap-3 shadow-lg">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" form="contact-staff-form" icon={Send}>
            Send Message
          </Button>
        </div>
      </div>
    </>
  );

  return createPortal(modalContent, document.body);
}
