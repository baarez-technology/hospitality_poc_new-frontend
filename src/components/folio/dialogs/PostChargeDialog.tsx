/**
 * PostChargeDialog - Category selector + description + qty + price
 */

import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, ChevronDown, Check } from 'lucide-react';
import { catalogItemsService, type CatalogItem } from '@/api/services/catalog-items.service';

const CHARGE_CATEGORIES = [
  { value: 'room_charge', label: 'Room Charge' },
  { value: 'service', label: 'Room Service' },
  { value: 'minibar', label: 'Minibar' },
  { value: 'water', label: 'Water (GST-exempt)' },
  { value: 'spa', label: 'Spa' },
  { value: 'parking', label: 'Parking' },
  { value: 'restaurant', label: 'Restaurant' },
  { value: 'phone', label: 'Phone' },
  { value: 'laundry', label: 'Laundry' },
  { value: 'newspaper', label: 'Newspaper' },
  { value: 'late_checkout', label: 'Late Checkout' },
  { value: 'damage', label: 'Damage' },
  { value: 'misc', label: 'Miscellaneous' },
];

function Select({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: { value: string; label: string }[] }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const selected = options.find(o => o.value === value);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full h-9 pl-3 pr-8 rounded-lg text-[13px] bg-white border border-neutral-200 hover:border-neutral-300 focus:border-terra-400 focus:ring-2 focus:ring-terra-500/10 focus:outline-none flex items-center justify-between transition-colors"
      >
        <span className="text-neutral-800 truncate">{selected?.label || '—'}</span>
        <ChevronDown className={`absolute right-2.5 w-3.5 h-3.5 text-neutral-400 transition-transform duration-150 ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-neutral-200 rounded-lg shadow-lg z-[201] overflow-hidden">
          {options.map(o => (
            <button
              key={o.value}
              type="button"
              onClick={() => { onChange(o.value); setOpen(false); }}
              className={`w-full text-left px-3 py-2 text-[13px] flex items-center justify-between transition-colors ${
                o.value === value ? 'bg-terra-50 text-terra-700' : 'text-neutral-700 hover:bg-neutral-50'
              }`}
            >
              <span>{o.label}</span>
              {o.value === value && <Check className="w-3 h-3 text-terra-600 flex-shrink-0" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

interface PostChargeDialogProps {
  onSubmit: (data: { item_type: string; description: string; quantity: number; unit_price: number; notes?: string }) => Promise<void>;
  onClose: () => void;
}

export default function PostChargeDialog({ onSubmit, onClose }: PostChargeDialogProps) {
  const [itemType, setItemType] = useState('service');
  const [description, setDescription] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [unitPrice, setUnitPrice] = useState(0);
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Inventory catalog picker — selecting an item auto-fills description/price/category
  const [catalog, setCatalog] = useState<CatalogItem[]>([]);
  const [selectedItemId, setSelectedItemId] = useState('');

  useEffect(() => {
    catalogItemsService.list({ active_only: true })
      .then(setCatalog)
      .catch(() => setCatalog([]));
  }, []);

  const catalogOptions = [
    { value: '', label: 'Custom charge (enter manually)' },
    ...catalog.map(it => ({
      value: String(it.id),
      label: `${it.name} — ₹${Number(it.unit_price).toFixed(2)}${it.unit ? ` / ${it.unit}` : ''}`,
    })),
  ];

  const handleSelectItem = (val: string) => {
    setSelectedItemId(val);
    if (!val) return;
    const item = catalog.find(it => String(it.id) === val);
    if (item) {
      setItemType(item.category || 'misc');
      setDescription(item.name);
      setUnitPrice(item.unit_price || 0);
    }
  };

  const total = quantity * unitPrice;

  const handleSubmit = async () => {
    if (!description.trim() || unitPrice <= 0) return;
    setSubmitting(true);
    try {
      await onSubmit({ item_type: itemType, description: description.trim(), quantity, unit_price: unitPrice, notes: notes.trim() || undefined });
    } catch { /* parent handles */ }
    setSubmitting(false);
  };

  const inputCls = "w-full h-9 px-3 rounded-lg text-[13px] bg-white border border-neutral-200 focus:border-terra-400 focus:ring-2 focus:ring-terra-500/10 focus:outline-none";

  return createPortal(
    <div className="fixed inset-0 z-[200] flex items-center justify-center">
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-visible">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-100">
          <h3 className="text-[15px] font-semibold text-neutral-900">Post Charge</h3>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-neutral-100 text-neutral-400 hover:text-neutral-600 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="px-5 py-4 space-y-4">
          {/* Inventory item picker */}
          {catalog.length > 0 && (
            <div>
              <label className="block text-[12px] font-medium text-neutral-600 mb-1.5">Inventory Item</label>
              <Select value={selectedItemId} onChange={handleSelectItem} options={catalogOptions} />
              <p className="text-[11px] text-neutral-400 mt-1">Pick an item to auto-fill, or choose "Custom charge".</p>
            </div>
          )}

          {/* Category */}
          <div>
            <label className="block text-[12px] font-medium text-neutral-600 mb-1.5">Category</label>
            <Select value={itemType} onChange={setItemType} options={CHARGE_CATEGORIES} />
          </div>

          {/* Description */}
          <div>
            <label className="block text-[12px] font-medium text-neutral-600 mb-1.5">Description <span className="text-red-500">*</span></label>
            <input
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="e.g., Minibar - 2x Water, 1x Snack"
              className={inputCls}
            />
          </div>

          {/* Qty + Price */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[12px] font-medium text-neutral-600 mb-1.5">Quantity</label>
              <input
                type="number"
                min="1"
                step="1"
                value={quantity}
                onChange={e => setQuantity(Math.max(1, Number(e.target.value)))}
                className={inputCls}
              />
            </div>
            <div>
              <label className="block text-[12px] font-medium text-neutral-600 mb-1.5">Unit Price <span className="text-red-500">*</span></label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={unitPrice}
                onChange={e => setUnitPrice(Math.max(0, Number(e.target.value)))}
                className={inputCls}
              />
            </div>
          </div>

          {/* Total */}
          <div className="bg-neutral-50 rounded-lg px-4 py-3 flex items-center justify-between">
            <span className="text-[12px] font-medium text-neutral-500">Total Amount</span>
            <span className="text-lg font-bold text-neutral-900">₹{total.toFixed(2)}</span>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-[12px] font-medium text-neutral-600 mb-1.5">Notes (optional)</label>
            <input value={notes} onChange={e => setNotes(e.target.value)} placeholder="Additional notes..." className={inputCls} />
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-neutral-100 flex justify-end gap-2 rounded-b-2xl bg-white">
          <button onClick={onClose} className="px-4 py-2 text-[13px] font-medium text-neutral-600 hover:bg-neutral-100 rounded-lg transition-colors">Cancel</button>
          <button
            onClick={handleSubmit}
            disabled={!description.trim() || unitPrice <= 0 || submitting}
            className="px-4 py-2 text-[13px] font-medium text-white bg-terra-600 hover:bg-terra-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
          >
            {submitting ? 'Posting...' : 'Post Charge'}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
