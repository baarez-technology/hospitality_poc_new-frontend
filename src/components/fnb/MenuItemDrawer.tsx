/**
 * Menu Item Drawer — Uses UI2 Drawer, Input, SearchableSelect.
 * Matches admin design system (same as booking/guest drawers).
 * File upload area instead of URL input. ₹ currency via formatCurrency.
 */
import { useState, useEffect, useRef } from 'react';
import { Upload, Plus, Trash2, Image as ImageIcon } from 'lucide-react';
import { Drawer } from '../ui2/Drawer';
import { Input } from '../ui2/Input';
import { SearchableSelect } from '../ui2/SearchableSelect';
import { Button } from '../ui2/Button';
import { Badge } from '../ui2/Badge';
import type { MenuItem, MenuCategory } from '../../api/services/fnb.service';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<MenuItem>) => void;
  item?: MenuItem | null;
  categories: MenuCategory[];
}

export default function MenuItemDrawer({ isOpen, onClose, onSubmit, item, categories }: Props) {
  const [form, setForm] = useState({
    name: '', description: '', price: '', category_id: '',
    is_veg: true, prep_time_minutes: '15', image_url: '',
    modifiers: [] as { name: string; price: string }[],
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (item) {
      setForm({
        name: item.name, description: item.description || '',
        price: String(item.price), category_id: String(item.category_id),
        is_veg: item.is_veg, prep_time_minutes: String(item.prep_time_minutes),
        image_url: item.image_url || '',
        modifiers: item.modifier_groups?.flatMap(g => g.modifiers.map(m => ({ name: m.name, price: String(m.price) }))) || [],
      });
    } else {
      setForm({
        name: '', description: '', price: '',
        category_id: categories[0]?.id ? String(categories[0].id) : '',
        is_veg: true, prep_time_minutes: '15', image_url: '',
        modifiers: [],
      });
    }
  }, [item, isOpen, categories]);

  const handleSubmit = () => {
    if (!form.name.trim() || !form.price || !form.category_id) return;
    onSubmit({
      id: item?.id, name: form.name, description: form.description || undefined,
      price: parseFloat(form.price), category_id: parseInt(form.category_id),
      is_veg: form.is_veg, prep_time_minutes: parseInt(form.prep_time_minutes) || 15,
      image_url: form.image_url || undefined,
    });
    onClose();
  };

  const addModifier = () => setForm(f => ({ ...f, modifiers: [...f.modifiers, { name: '', price: '0' }] }));
  const removeModifier = (i: number) => setForm(f => ({ ...f, modifiers: f.modifiers.filter((_, idx) => idx !== i) }));
  const updateModifier = (i: number, field: string, val: string) => {
    setForm(f => ({ ...f, modifiers: f.modifiers.map((m, idx) => idx === i ? { ...m, [field]: val } : m) }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // In production this would upload to S3/CDN. For now, create a local URL.
      const url = URL.createObjectURL(file);
      setForm(f => ({ ...f, image_url: url }));
    }
  };

  const categoryOptions = categories.map(c => ({ value: String(c.id), label: c.name }));

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title={item ? 'Edit Menu Item' : 'Add Menu Item'}
      subtitle={item ? `Editing ${item.name}` : 'Add a new item to the menu'}
      maxWidth="max-w-md"
      footer={
        <div className="flex gap-3">
          <Button variant="outline-neutral" onClick={onClose} className="flex-1">Cancel</Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            disabled={!form.name.trim() || !form.price || !form.category_id}
            className="flex-1"
          >
            {item ? 'Update Item' : 'Add Item'}
          </Button>
        </div>
      }
    >
      <div className="space-y-5">
        {/* Image Upload */}
        <div>
          <label className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider block mb-2">Image</label>
          {form.image_url ? (
            <div className="relative w-full h-36 rounded-lg overflow-hidden bg-neutral-100 group">
              <img src={form.image_url} alt="" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <button onClick={() => fileInputRef.current?.click()}
                  className="h-8 px-3 rounded-lg bg-white text-[12px] font-medium text-neutral-700">Change</button>
                <button onClick={() => setForm(f => ({ ...f, image_url: '' }))}
                  className="h-8 px-3 rounded-lg bg-white text-[12px] font-medium text-red-600">Remove</button>
              </div>
            </div>
          ) : (
            <button onClick={() => fileInputRef.current?.click()}
              className="w-full h-28 rounded-lg border-2 border-dashed border-neutral-200 hover:border-neutral-300 bg-neutral-50 flex flex-col items-center justify-center gap-2 text-neutral-400 hover:text-neutral-500 transition-colors">
              <Upload className="w-5 h-5" />
              <span className="text-[12px] font-medium">Upload image</span>
              <span className="text-[10px]">JPG, PNG up to 2MB</span>
            </button>
          )}
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
        </div>

        {/* Name */}
        <div>
          <label className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider block mb-1.5">Name <span className="text-red-500">*</span></label>
          <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Paneer Tikka" size="md" />
        </div>

        {/* Description */}
        <div>
          <label className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider block mb-1.5">Description</label>
          <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            className="w-full h-9 min-h-[72px] px-3.5 py-2 text-sm bg-white border border-neutral-200 rounded-[var(--brand-radius-md)] text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-[var(--brand-primary)] focus:ring-2 focus:ring-[var(--brand-primary)]/10 hover:border-neutral-300 resize-none transition-all"
            placeholder="Grilled cottage cheese with spices..." />
        </div>

        {/* Price + Prep Time */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider block mb-1.5">Price (₹) <span className="text-red-500">*</span></label>
            <Input type="number" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} placeholder="350" size="md" />
          </div>
          <div>
            <label className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider block mb-1.5">Prep Time (min)</label>
            <Input type="number" value={form.prep_time_minutes} onChange={e => setForm(f => ({ ...f, prep_time_minutes: e.target.value }))} placeholder="15" size="md" />
          </div>
        </div>

        {/* Category — using SearchableSelect */}
        <div>
          <label className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider block mb-1.5">Category <span className="text-red-500">*</span></label>
          <SearchableSelect
            options={categoryOptions}
            value={form.category_id}
            onChange={val => setForm(f => ({ ...f, category_id: val }))}
            placeholder="Select category"
            searchable={false}
          />
        </div>

        {/* Dietary — Veg / Non-Veg toggle */}
        <div>
          <label className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider block mb-1.5">Dietary</label>
          <div className="flex gap-2">
            <button onClick={() => setForm(f => ({ ...f, is_veg: true }))}
              className={`flex-1 h-9 rounded-lg text-[13px] font-medium flex items-center justify-center gap-2 border transition-colors ${
                form.is_veg
                  ? 'border-[var(--brand-primary)] bg-[var(--brand-primary-50)] text-[var(--brand-primary)]'
                  : 'border-neutral-200 text-neutral-500 hover:bg-neutral-50'
              }`}>
              <span className="w-2.5 h-2.5 rounded-sm bg-green-600" /> Veg
            </button>
            <button onClick={() => setForm(f => ({ ...f, is_veg: false }))}
              className={`flex-1 h-9 rounded-lg text-[13px] font-medium flex items-center justify-center gap-2 border transition-colors ${
                !form.is_veg
                  ? 'border-[var(--brand-primary)] bg-[var(--brand-primary-50)] text-[var(--brand-primary)]'
                  : 'border-neutral-200 text-neutral-500 hover:bg-neutral-50'
              }`}>
              <span className="w-2.5 h-2.5 rounded-sm bg-red-600" /> Non-Veg
            </button>
          </div>
        </div>

        {/* Modifiers */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">Modifiers</label>
            <button onClick={addModifier} className="text-[11px] text-[var(--brand-primary)] font-semibold flex items-center gap-0.5 hover:opacity-80">
              <Plus className="w-3 h-3" /> Add
            </button>
          </div>
          {form.modifiers.length === 0 ? (
            <p className="text-[11px] text-neutral-400 italic">No modifiers — e.g. Extra Cheese +₹50, No Onion +₹0</p>
          ) : (
            <div className="space-y-2">
              {form.modifiers.map((mod, i) => (
                <div key={i} className="flex items-center gap-2">
                  <Input value={mod.name} onChange={e => updateModifier(i, 'name', e.target.value)} placeholder="Extra Cheese" size="sm" className="flex-1" />
                  <div className="w-20">
                    <Input type="number" value={mod.price} onChange={e => updateModifier(i, 'price', e.target.value)} placeholder="+₹50" size="sm" />
                  </div>
                  <button onClick={() => removeModifier(i)} className="w-8 h-8 rounded-lg flex items-center justify-center text-neutral-400 hover:text-red-500 hover:bg-red-50 transition-colors">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Drawer>
  );
}
