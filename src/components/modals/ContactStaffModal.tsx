import { useState } from 'react';
import { Send } from 'lucide-react';
import { Modal, Input, Button, Label, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui';

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

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Contact Staff" size="default">
      <form id="contact-staff-form" onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-1.5">
          <Label className="block text-sm font-medium text-neutral-700">
            Select Staff Member <span className="text-rose-500">*</span>
          </Label>
          <Select
            value={formData.staff}
            onValueChange={(value) => setFormData((prev) => ({ ...prev, staff: value }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Choose staff member..." />
            </SelectTrigger>
            <SelectContent>
              {staffMembers.map((staff) => (
                <SelectItem key={staff.id} value={String(staff.id)}>
                  {staff.name} - {staff.role}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Input
          label="Subject"
          name="subject"
          value={formData.subject}
          onChange={handleChange}
          placeholder="Brief subject line"
        />

        <div className="space-y-1.5">
          <Label className="block text-sm font-medium text-neutral-700">Priority</Label>
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

        <Input
          type="textarea"
          label="Message"
          name="message"
          value={formData.message}
          onChange={handleChange}
          required
          rows={8}
          placeholder="Type your message here..."
        />
      </form>
      <div className="flex gap-3">
        <Button variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button
          type="submit"
          form="contact-staff-form"
          variant="primary"
          icon={<Send className="w-4 h-4" />}
        >
          Send Message
        </Button>
      </div>
    </Modal>
  );
}
