import { useState, useEffect } from 'react';
import { X, Calendar, Loader2 } from 'lucide-react';
import { staffService } from '../../../../api/services/staff.service';
import { Button } from '../../../ui2/Button';

export default function MarkLeaveModal({ staff, isOpen, onClose, onMarkLeave }) {
  const [formData, setFormData] = useState({
    startDate: '',
    endDate: '',
    type: 'paid',
    notes: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      // Set default start date to today
      const today = new Date().toISOString().split('T')[0];
      setFormData({
        startDate: today,
        endDate: '',
        type: 'paid',
        notes: ''
      });
      setError(null);
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen || !staff) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      await staffService.requestLeave(staff.id, {
        leave_type: formData.type,
        start_date: formData.startDate,
        end_date: formData.endDate,
        reason: formData.notes
      });
      onMarkLeave(staff.id, formData);
      onClose();
    } catch (err: any) {
      console.error('Failed to mark leave:', err);
      setError(err.response?.data?.detail || err.message || 'Failed to mark leave. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get min date (today)
  const today = new Date().toISOString().split('T')[0];

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
            <h2 className="text-2xl font-serif font-semibold text-neutral-900">Mark Leave</h2>
            <p className="text-sm text-neutral-600 mt-1">
              {staff.name} - {staff.role}
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

          {/* Leave Type */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Leave Type *
            </label>
            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
              required
              disabled={isSubmitting}
              className="w-full px-4 py-3 bg-[#FAF8F6] border border-neutral-200 rounded-xl text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-[#A57865] focus:border-[#A57865] transition-all duration-200 disabled:opacity-50"
            >
              <option value="paid">Paid Leave</option>
              <option value="unpaid">Unpaid Leave</option>
              <option value="sick">Sick Leave</option>
            </select>
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Start Date *
              </label>
              <input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                min={today}
                required
                disabled={isSubmitting}
                className="w-full px-4 py-3 bg-[#FAF8F6] border border-neutral-200 rounded-xl text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-[#A57865] focus:border-[#A57865] transition-all duration-200 disabled:opacity-50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                End Date *
              </label>
              <input
                type="date"
                name="endDate"
                value={formData.endDate}
                onChange={handleChange}
                min={formData.startDate || today}
                required
                disabled={isSubmitting}
                className="w-full px-4 py-3 bg-[#FAF8F6] border border-neutral-200 rounded-xl text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-[#A57865] focus:border-[#A57865] transition-all duration-200 disabled:opacity-50"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Notes (Optional)
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={4}
              disabled={isSubmitting}
              placeholder="Add any additional notes about this leave..."
              className="w-full px-4 py-3 bg-[#FAF8F6] border border-neutral-200 rounded-xl text-sm text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#A57865] focus:border-[#A57865] transition-all duration-200 resize-none disabled:opacity-50"
            />
          </div>

          {/* Info */}
          <div className="p-4 bg-amber-50 rounded-xl border border-amber-100">
            <p className="text-xs font-medium text-amber-900 mb-1">Leave Information</p>
            <p className="text-xs text-amber-700">
              Staff status will be updated to "On Leave" and this leave will be recorded in their history.
            </p>
          </div>
        </form>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-neutral-200">
          <Button variant="ghost" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button variant="warning" onClick={handleSubmit} disabled={isSubmitting} icon={isSubmitting ? Loader2 : Calendar} loading={isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Mark Leave'}
          </Button>
        </div>
      </div>
    </div>
  );
}
