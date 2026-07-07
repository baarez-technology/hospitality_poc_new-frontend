import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Receipt, AlertCircle, Save } from 'lucide-react';
import { Button } from '../../ui2/Button';

export default function EditFeeModal({ fee, onClose, onSave }) {
  const [form, setForm] = useState({
    name: '',
    type: 'percentage',
    value: '',
    description: ''
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (fee) {
      setForm({
        name: fee.name,
        type: fee.type,
        value: fee.value.toString(),
        description: fee.description || ''
      });
    }
  }, [fee]);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const validate = () => {
    const newErrors = {};
    if (!form.name.trim()) newErrors.name = 'Name is required';
    if (!form.value || parseFloat(form.value) < 0) newErrors.value = 'Valid value is required';
    if (form.type === 'percentage' && parseFloat(form.value) > 100) {
      newErrors.value = 'Percentage cannot exceed 100%';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    onSave({
      ...fee,
      name: form.name,
      type: form.type,
      value: parseFloat(form.value),
      description: form.description
    });
  };

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#E5E5E5]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#5C9BA4]/10 flex items-center justify-center">
              <Receipt className="w-5 h-5 text-[#5C9BA4]" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-neutral-900">Edit Tax / Fee</h2>
              <p className="text-sm text-neutral-500">Update charge details</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-neutral-100 text-neutral-500 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Name *
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => handleChange('name', e.target.value)}
              className={`w-full px-4 py-3 rounded-lg border ${
                errors.name ? 'border-red-400' : 'border-[#E5E5E5]'
              } focus:outline-none focus:ring-2 focus:ring-[#A57865]/20 focus:border-[#A57865]`}
              placeholder="e.g., Room Tax"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.name}
              </p>
            )}
          </div>

          {/* Type */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Type *
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleChange('type', 'percentage')}
                className={`px-4 py-3 rounded-lg font-medium transition-colors ${
                  form.type === 'percentage'
                    ? 'bg-[#5C9BA4] text-white'
                    : 'bg-[#FAF7F4] text-neutral-600 hover:bg-[#5C9BA4]/10'
                }`}
              >
                Percentage (%)
              </button>
              <button
                type="button"
                onClick={() => handleChange('type', 'fixed')}
                className={`px-4 py-3 rounded-lg font-medium transition-colors ${
                  form.type === 'fixed'
                    ? 'bg-[#5C9BA4] text-white'
                    : 'bg-[#FAF7F4] text-neutral-600 hover:bg-[#5C9BA4]/10'
                }`}
              >
                Fixed Amount ($)
              </button>
            </div>
          </div>

          {/* Value */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              {form.type === 'percentage' ? 'Rate (%)' : 'Amount ($)'} *
            </label>
            <input
              type="number"
              value={form.value}
              onChange={(e) => handleChange('value', e.target.value)}
              min="0"
              max={form.type === 'percentage' ? '100' : undefined}
              step={form.type === 'percentage' ? '0.1' : '1'}
              className={`w-full px-4 py-3 rounded-lg border ${
                errors.value ? 'border-red-400' : 'border-[#E5E5E5]'
              } focus:outline-none focus:ring-2 focus:ring-[#A57865]/20 focus:border-[#A57865]`}
              placeholder={form.type === 'percentage' ? '12' : '1500'}
            />
            {errors.value && (
              <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.value}
              </p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Description
            </label>
            <input
              type="text"
              value={form.description}
              onChange={(e) => handleChange('description', e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-[#E5E5E5] focus:outline-none focus:ring-2 focus:ring-[#A57865]/20 focus:border-[#A57865]"
              placeholder="Brief description"
            />
          </div>
        </form>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-[#E5E5E5] bg-[#FAF7F4]">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmit} icon={Save}>
            Save Changes
          </Button>
        </div>
      </div>
    </div>,
    document.body
  );
}
