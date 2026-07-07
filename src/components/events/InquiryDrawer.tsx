/**
 * New Inquiry Drawer — Uses UI2 Drawer, Input, SearchableSelect.
 * Creates inquiry then navigates to Event Builder.
 */
import { useState } from 'react';
import { Drawer } from '../ui2/Drawer';
import { Input } from '../ui2/Input';
import { SearchableSelect } from '../ui2/SearchableSelect';
import { Button } from '../ui2/Button';
import { EVENT_TYPES } from '../../utils/events';
import type { EventInquiry } from '../../api/services/events.service';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<EventInquiry>) => Promise<EventInquiry | null>;
}

const typeOptions = EVENT_TYPES.map(t => ({ value: t.value, label: t.label }));

export default function InquiryDrawer({ isOpen, onClose, onSubmit }: Props) {
  const [form, setForm] = useState({
    event_name: '', event_type: 'wedding', contact_name: '',
    contact_phone: '', contact_email: '', start_date: '',
    end_date: '', expected_guests: '', notes: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!form.event_name.trim() || !form.contact_name.trim() || !form.start_date || !form.end_date) return;
    setSubmitting(true);
    const result = await onSubmit({ ...form, expected_guests: parseInt(form.expected_guests) || 50 });
    setSubmitting(false);
    if (result) {
      setForm({ event_name: '', event_type: 'wedding', contact_name: '', contact_phone: '', contact_email: '', start_date: '', end_date: '', expected_guests: '', notes: '' });
      onClose();
      return result;
    }
    return null;
  };

  const isValid = form.event_name.trim() && form.contact_name.trim() && form.start_date && form.end_date;

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title="New Event Inquiry"
      subtitle="Fill in event details to start building a proposal"
      maxWidth="max-w-md"
      footer={
        <div className="flex gap-3">
          <Button variant="outline-neutral" onClick={onClose} className="flex-1">Cancel</Button>
          <Button variant="primary" onClick={handleSubmit} disabled={!isValid || submitting} className="flex-1">
            {submitting ? 'Creating...' : 'Start Building'}
          </Button>
        </div>
      }
    >
      <div className="space-y-5">
        <div>
          <label className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider block mb-1.5">Event Name <span className="text-red-500">*</span></label>
          <Input value={form.event_name} onChange={e => setForm(f => ({ ...f, event_name: e.target.value }))} placeholder="Sharma Wedding Reception" size="md" />
        </div>

        <div>
          <label className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider block mb-1.5">Event Type</label>
          <SearchableSelect options={typeOptions} value={form.event_type} onChange={val => setForm(f => ({ ...f, event_type: val }))} placeholder="Select type" searchable={false} />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider block mb-1.5">Contact Name <span className="text-red-500">*</span></label>
            <Input value={form.contact_name} onChange={e => setForm(f => ({ ...f, contact_name: e.target.value }))} placeholder="Rajesh Sharma" size="md" />
          </div>
          <div>
            <label className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider block mb-1.5">Phone</label>
            <Input value={form.contact_phone} onChange={e => setForm(f => ({ ...f, contact_phone: e.target.value }))} placeholder="+91 98765 43210" size="md" />
          </div>
        </div>

        <div>
          <label className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider block mb-1.5">Email</label>
          <Input type="email" value={form.contact_email} onChange={e => setForm(f => ({ ...f, contact_email: e.target.value }))} placeholder="rajesh@email.com" size="md" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider block mb-1.5">Start Date <span className="text-red-500">*</span></label>
            <Input type="date" value={form.start_date} onChange={e => setForm(f => ({ ...f, start_date: e.target.value }))} size="md" />
          </div>
          <div>
            <label className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider block mb-1.5">End Date <span className="text-red-500">*</span></label>
            <Input type="date" value={form.end_date} onChange={e => setForm(f => ({ ...f, end_date: e.target.value }))} size="md" />
          </div>
        </div>

        <div>
          <label className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider block mb-1.5">Expected Guests</label>
          <Input type="number" value={form.expected_guests} onChange={e => setForm(f => ({ ...f, expected_guests: e.target.value }))} placeholder="200" size="md" />
        </div>

        <div>
          <label className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider block mb-1.5">Notes</label>
          <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
            className="w-full min-h-[72px] px-3.5 py-2 text-sm bg-white border border-neutral-200 rounded-[var(--brand-radius-md)] text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-[var(--brand-primary)] focus:ring-2 focus:ring-[var(--brand-primary)]/10 hover:border-neutral-300 resize-none transition-all"
            placeholder="Special requirements, preferences..." />
        </div>
      </div>
    </Drawer>
  );
}
