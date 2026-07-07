/**
 * AddInventoryModal Component
 * Modal for adding/editing inventory items - Glimmora Design System v5.0
 */

import { useState, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { Drawer } from '../../../ui2/Drawer';
import { Button } from '../../../ui2/Button';
import { INVENTORY_CATEGORIES } from '@/utils/admin/maintenance';

// Custom Select for Drawer
function DrawerSelect({ label, value, onChange, options, placeholder, error, required }) {
  const [isOpen, setIsOpen] = useState(false);
  const selectedOption = options.find(opt => opt.value === value);

  return (
    <div>
      <h4 className="text-[11px] font-semibold uppercase tracking-widest text-neutral-900 mb-3">
        {label} {required && <span className="text-rose-500">*</span>}
      </h4>
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`w-full h-10 px-4 rounded-lg text-[13px] bg-white border transition-all flex items-center justify-between ${
            error
              ? 'border-rose-300 ring-2 ring-rose-500/10'
              : isOpen
                ? 'border-terra-400 ring-2 ring-terra-500/10'
                : 'border-neutral-200 hover:border-neutral-300'
          }`}
        >
          <span className={selectedOption ? 'text-neutral-900 font-medium' : 'text-neutral-400'}>
            {selectedOption?.label || placeholder}
          </span>
          <ChevronDown className={`w-4 h-4 text-neutral-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {isOpen && (
          <>
            <div className="fixed inset-0 z-[60]" onClick={() => setIsOpen(false)} />
            <div className="absolute z-[70] w-full mt-1.5 bg-white rounded-lg border border-neutral-200 shadow-lg overflow-hidden max-h-48 overflow-y-auto">
              {options.length === 0 ? (
                <div className="px-4 py-3 text-[13px] text-neutral-500">No options available</div>
              ) : (
                options.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => {
                      onChange(option.value);
                      setIsOpen(false);
                    }}
                    className={`w-full px-4 py-2.5 text-[13px] text-left hover:bg-neutral-50 transition-colors flex items-center justify-between ${
                      value === option.value ? 'bg-terra-50 text-terra-700' : 'text-neutral-700'
                    }`}
                  >
                    {option.label}
                    {value === option.value && <Check className="w-4 h-4 text-terra-500" />}
                  </button>
                ))
              )}
            </div>
          </>
        )}
      </div>
      {error && <p className="text-xs text-rose-500 mt-1">{error}</p>}
    </div>
  );
}

interface AddInventoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  editItem?: any; // If provided, modal is in edit mode
}

export default function AddInventoryModal({ isOpen, onClose, onSubmit, editItem }: AddInventoryModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    category: 'general',
    stockLevel: 0,
    minStock: 0,
    unitCost: 0,
    location: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const isEditMode = !!editItem;

  useEffect(() => {
    if (isOpen) {
      if (editItem) {
        // Edit mode - pre-populate form
        setFormData({
          name: editItem.name || '',
          category: editItem.category || 'general',
          stockLevel: editItem.stockLevel || 0,
          minStock: editItem.minStock ?? 0,
          unitCost: editItem.unitCost || 0,
          location: editItem.location || ''
        });
      } else {
        // Add mode - reset form
        setFormData({
          name: '',
          category: 'general',
          stockLevel: 0,
          minStock: 0,
          unitCost: 0,
          location: ''
        });
      }
      setErrors({});
    }
  }, [isOpen, editItem]);

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Item name is required';
    }

    if (!formData.category) {
      newErrors.category = 'Category is required';
    }

    if (formData.stockLevel < 0) {
      newErrors.stockLevel = 'Stock level cannot be negative';
    }

    if (formData.minStock < 0) {
      newErrors.minStock = 'Minimum stock cannot be negative';
    }

    if (formData.unitCost < 0) {
      newErrors.unitCost = 'Unit cost cannot be negative';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validate()) {
      onSubmit({
        ...formData,
        ...(editItem && { id: editItem.id })
      });
      onClose();
    }
  };

  // Custom header
  const renderHeader = () => (
    <div className="flex-1 min-w-0">
      <h2 className="text-lg font-semibold text-neutral-900 tracking-tight">
        {isEditMode ? 'Edit Inventory Item' : 'Add Inventory Item'}
      </h2>
      <p className="text-[13px] text-neutral-500 mt-1">
        {isEditMode ? `Editing ${editItem?.name}` : 'Add a new item to inventory'}
      </p>
    </div>
  );

  // Footer
  const renderFooter = () => (
    <div className="flex items-center justify-end gap-3">
      <Button
        variant="outline"
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
        {isEditMode ? 'Save Changes' : 'Add Item'}
      </Button>
    </div>
  );

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title=""
      subtitle=""
      header={renderHeader()}
      footer={renderFooter()}
      maxWidth="max-w-2xl"
      className=""
    >
      <div className="space-y-6">
        {/* Item Name */}
        <div>
          <h4 className="text-[11px] font-semibold uppercase tracking-widest text-neutral-900 mb-3">
            Item Name <span className="text-rose-500">*</span>
          </h4>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            placeholder="Enter item name"
            className={`w-full h-10 px-4 bg-white border rounded-lg text-[13px] text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-terra-500/10 focus:border-terra-400 transition-all hover:border-neutral-300 ${
              errors.name ? 'border-rose-300 ring-2 ring-rose-500/10' : 'border-neutral-200'
            }`}
          />
          {errors.name && <p className="text-xs text-rose-500 mt-1">{errors.name}</p>}
        </div>

        {/* Category */}
        <DrawerSelect
          label="Category"
          value={formData.category}
          onChange={(value) => handleChange('category', value)}
          options={INVENTORY_CATEGORIES}
          placeholder="Select category"
          error={errors.category}
          required
        />

        {/* Stock Quantity & Minimum Stock - Two columns */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h4 className="text-[11px] font-semibold uppercase tracking-widest text-neutral-900 mb-3">
              Stock Quantity
            </h4>
            <input
              type="number"
              min="0"
              value={formData.stockLevel}
              onChange={(e) => handleChange('stockLevel', parseInt(e.target.value) || 0)}
              placeholder="0"
              className={`w-full h-10 px-4 bg-white border rounded-lg text-[13px] text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-terra-500/10 focus:border-terra-400 transition-all hover:border-neutral-300 ${
                errors.stockLevel ? 'border-rose-300 ring-2 ring-rose-500/10' : 'border-neutral-200'
              }`}
            />
            {errors.stockLevel && <p className="text-xs text-rose-500 mt-1">{errors.stockLevel}</p>}
          </div>

          <div>
            <h4 className="text-[11px] font-semibold uppercase tracking-widest text-neutral-900 mb-3">
              Minimum Stock
            </h4>
            <input
              type="number"
              min="0"
              value={formData.minStock}
              onChange={(e) => handleChange('minStock', parseInt(e.target.value) || 0)}
              placeholder="10"
              className={`w-full h-10 px-4 bg-white border rounded-lg text-[13px] text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-terra-500/10 focus:border-terra-400 transition-all hover:border-neutral-300 ${
                errors.minStock ? 'border-rose-300 ring-2 ring-rose-500/10' : 'border-neutral-200'
              }`}
            />
            {errors.minStock && <p className="text-xs text-rose-500 mt-1">{errors.minStock}</p>}
          </div>
        </div>

        {/* Unit Cost */}
        <div>
          <h4 className="text-[11px] font-semibold uppercase tracking-widest text-neutral-900 mb-3">
            Unit Cost ($)
          </h4>
          <input
            type="number"
            min="0"
            step="0.01"
            value={formData.unitCost}
            onChange={(e) => handleChange('unitCost', parseFloat(e.target.value) || 0)}
            placeholder="0.00"
            className={`w-full h-10 px-4 bg-white border rounded-lg text-[13px] text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-terra-500/10 focus:border-terra-400 transition-all hover:border-neutral-300 ${
              errors.unitCost ? 'border-rose-300 ring-2 ring-rose-500/10' : 'border-neutral-200'
            }`}
          />
          {errors.unitCost && <p className="text-xs text-rose-500 mt-1">{errors.unitCost}</p>}
        </div>

        {/* Location */}
        <div>
          <h4 className="text-[11px] font-semibold uppercase tracking-widest text-neutral-900 mb-3">
            Storage Location
          </h4>
          <input
            type="text"
            value={formData.location}
            onChange={(e) => handleChange('location', e.target.value)}
            placeholder="e.g., Storage Room A, Shelf 3"
            className="w-full h-10 px-4 bg-white border border-neutral-200 rounded-lg text-[13px] text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-terra-500/10 focus:border-terra-400 transition-all hover:border-neutral-300"
          />
        </div>
      </div>
    </Drawer>
  );
}
