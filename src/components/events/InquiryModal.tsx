/**
 * New Inquiry Modal — Creates inquiry then navigates to Event Builder
 */
import { useState } from 'react';
import { X } from 'lucide-react';
import { EVENT_TYPES } from '../../utils/events';
import type { EventInquiry } from '../../api/services/events.service';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<EventInquiry>) => Promise<EventInquiry | null>;
}

export default function InquiryModal({ isOpen, onClose, onSubmit }: Props) {
  const [form, setForm] = useState({
    event_name: '',
    event_type: 'wedding',
    contact_name: '',
    contact_phone: '',
    contact_email: '',
    start_date: '',
    end_date: '',
    expected_guests: '',
    notes: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!form.event_name.trim() || !form.contact_name.trim() || !form.start_date || !form.end_date) return;
    setSubmitting(true);
    const result = await onSubmit({
      ...form,
      expected_guests: parseInt(form.expected_guests) || 50,
    });
    setSubmitting(false);
    if (result) {
      setForm({ event_name: '', event_type: 'wedding', contact_name: '', contact_phone: '', contact_email: '', start_date: '', end_date: '', expected_guests: '', notes: '' });
      onClose();
      return result;
    }
    return null;
  };

  if (!isOpen) return null;

  const labelCls = 'block text-[12px] font-semibold text-neutral-600 mb-1.5';
  const inputCls = 'w-full border border-neutral-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-terra-200 focus:border-terra-400';

  return (
    <>
      <div className="fixed inset-0 bg-neutral-900/50 backdrop-blur-[2px] z-[60]" onClick={onClose} />
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-white rounded-2xl shadow-2xl z-[61] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200">
          <div>
            <h3 className="text-base font-bold text-neutral-800">New Event Inquiry</h3>
            <p className="text-[11px] text-neutral-500 mt-0.5">Fill in event details to start building a proposal</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg bg-neutral-100 flex items-center justify-center hover:bg-neutral-200">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 max-h-[60vh] overflow-auto space-y-4">
          <div>
            <label className={labelCls}>Event Name *</label>
            <input value={form.event_name} onChange={e => setForm(f => ({ ...f, event_name: e.target.value }))} className={inputCls} placeholder="Sharma Wedding Reception" />
          </div>

          <div>
            <label className={labelCls}>Event Type *</label>
            <select value={form.event_type} onChange={e => setForm(f => ({ ...f, event_type: e.target.value }))} className={inputCls}>
              {EVENT_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Contact Name *</label>
              <input value={form.contact_name} onChange={e => setForm(f => ({ ...f, contact_name: e.target.value }))} className={inputCls} placeholder="Rajesh Sharma" />
            </div>
            <div>
              <label className={labelCls}>Phone</label>
              <input value={form.contact_phone} onChange={e => setForm(f => ({ ...f, contact_phone: e.target.value }))} className={inputCls} placeholder="+91 98765 43210" />
            </div>
          </div>

          <div>
            <label className={labelCls}>Email</label>
            <input type="email" value={form.contact_email} onChange={e => setForm(f => ({ ...f, contact_email: e.target.value }))} className={inputCls} placeholder="rajesh@email.com" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Start Date *</label>
              <input type="date" value={form.start_date} onChange={e => setForm(f => ({ ...f, start_date: e.target.value }))} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>End Date *</label>
              <input type="date" value={form.end_date} onChange={e => setForm(f => ({ ...f, end_date: e.target.value }))} className={inputCls} />
            </div>
          </div>

          <div>
            <label className={labelCls}>Expected Guests</label>
            <input type="number" value={form.expected_guests} onChange={e => setForm(f => ({ ...f, expected_guests: e.target.value }))} className={inputCls} placeholder="200" />
          </div>

          <div>
            <label className={labelCls}>Notes</label>
            <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} className={`${inputCls} resize-none`} rows={3} placeholder="Special requirements, preferences..." />
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-neutral-200 flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-lg border border-neutral-200 text-sm font-medium text-neutral-600 hover:bg-neutral-50">
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting || !form.event_name.trim() || !form.contact_name.trim() || !form.start_date || !form.end_date}
            className="flex-1 py-2.5 rounded-lg bg-terra-600 text-white text-sm font-bold hover:bg-terra-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? 'Creating...' : 'Start Building'}
          </button>
        </div>
      </div>
    </>
  );
}
