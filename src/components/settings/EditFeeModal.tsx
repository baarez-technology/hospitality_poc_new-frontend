import { useState, useEffect } from 'react';
import { AlertCircle } from 'lucide-react';
import { Drawer } from '../ui2/Drawer';
import { Button } from '../ui2/Button';
import { useCurrency } from '@/hooks/useCurrency';

export default function EditFeeModal({ fee, onClose, onSave }) {
  const { symbol } = useCurrency();
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
    e?.preventDefault();
    if (!validate()) return;

    onSave({
      ...fee,
      name: form.name,
      type: form.type,
      value: parseFloat(form.value),
      description: form.description
    });
  };

  const inputClass = (hasError = false) =>
    `w-full h-11 px-4 rounded-lg border text-sm text-neutral-900 placeholder:text-neutral-400 transition-colors ${
      hasError
        ? 'border-rose-300 focus:border-rose-500'
        : 'border-neutral-200 hover:border-neutral-300 focus:border-terra-500 focus:ring-2 focus:ring-terra-500/20'
    } focus:ring-0 focus:outline-none`;

  const labelClass = 'block text-[13px] font-medium text-neutral-600 mb-1.5';

  return (
    <Drawer
      isOpen={true}
      onClose={onClose}
      title="Edit Tax / Fee"
      subtitle="Update charge details"
      maxWidth="max-w-md"
      footer={
        <div className="flex items-center justify-end gap-3">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmit}>
            Save Changes
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Name */}
        <div>
          <label className={labelClass}>
            Name <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => handleChange('name', e.target.value)}
            className={inputClass(!!errors.name)}
            placeholder="e.g., Room Tax"
          />
          {errors.name && (
            <p className="mt-1.5 text-xs text-rose-500 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" />
              {errors.name}
            </p>
          )}
        </div>

        {/* Type */}
        <div>
          <label className={labelClass}>
            Type <span className="text-rose-500">*</span>
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => handleChange('type', 'percentage')}
              className={`px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                form.type === 'percentage'
                  ? 'bg-terra-500 text-white'
                  : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
              }`}
            >
              Percentage (%)
            </button>
            <button
              type="button"
              onClick={() => handleChange('type', 'fixed')}
              className={`px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                form.type === 'fixed'
                  ? 'bg-terra-500 text-white'
                  : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
              }`}
            >
              Fixed Amount ({symbol})
            </button>
          </div>
        </div>

        {/* Value */}
        <div>
          <label className={labelClass}>
            {form.type === 'percentage' ? 'Rate (%)' : `Amount (${symbol})`} <span className="text-rose-500">*</span>
          </label>
          <input
            type="number"
            value={form.value}
            onChange={(e) => handleChange('value', e.target.value)}
            min="0"
            max={form.type === 'percentage' ? '100' : undefined}
            step={form.type === 'percentage' ? '0.1' : '1'}
            className={inputClass(!!errors.value)}
            placeholder={form.type === 'percentage' ? '12' : '1500'}
          />
          {errors.value && (
            <p className="mt-1.5 text-xs text-rose-500 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" />
              {errors.value}
            </p>
          )}
        </div>

        {/* Description */}
        <div>
          <label className={labelClass}>Description</label>
          <input
            type="text"
            value={form.description}
            onChange={(e) => handleChange('description', e.target.value)}
            className={inputClass()}
            placeholder="Brief description"
          />
        </div>
      </form>
    </Drawer>
  );
}
