/**
 * TaxesTab — API-backed Tax Configuration
 * Replaces the old localStorage-based version.
 * Shows tax categories, slabs, and a calculator preview.
 */

import { useState, useEffect, useCallback } from 'react';
import { Plus, Trash2, Check, X, Loader2, Calculator, Sprout, ChevronDown, ChevronRight } from 'lucide-react';
import { Button } from '../ui2/Button';
import {
  Modal, ModalHeader, ModalTitle, ModalContent, ModalFooter, ConfirmModal,
} from '../ui2/Modal';
import { taxService } from '@/api/services/tax.service';
import type { TaxCategory, TaxSlab, TaxCalculationResult } from '@/api/services/tax.service';
import { useToast } from '@/contexts/ToastContext';
import { useCurrency } from '@/hooks/useCurrency';

// ── Add Category Modal ────────────────────────────────────────
function AddCategoryModal({ isOpen, onClose, onSave }: {
  isOpen: boolean; onClose: () => void;
  onSave: (data: { name: string; display_name: string; description?: string }) => Promise<void>;
}) {
  const [name, setName] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);

  const inputCls = 'w-full px-4 py-2.5 text-sm bg-white border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-terra-500/30 focus:border-terra-400';
  const labelCls = 'block text-[12px] font-semibold text-neutral-600 mb-1.5';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !displayName.trim()) return;
    setSaving(true);
    try {
      await onSave({ name: name.trim().toLowerCase().replace(/\s+/g, '_'), display_name: displayName.trim(), description: description.trim() || undefined });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <form onSubmit={handleSubmit}>
        <ModalHeader>
          <ModalTitle>Add Tax Category</ModalTitle>
        </ModalHeader>
        <ModalContent>
          <div className="space-y-4">
            <div>
              <label className={labelCls}>Internal Name</label>
              <input
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. room_charge"
                className={inputCls}
                required
              />
              <p className="text-[10px] text-neutral-400 mt-1">Lowercase, underscores. Used internally for mapping.</p>
            </div>
            <div>
              <label className={labelCls}>Display Name</label>
              <input
                value={displayName}
                onChange={e => setDisplayName(e.target.value)}
                placeholder="e.g. Room Charges"
                className={inputCls}
                required
              />
            </div>
            <div>
              <label className={labelCls}>Description (optional)</label>
              <input
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="e.g. GST on room tariff"
                className={inputCls}
              />
            </div>
          </div>
        </ModalContent>
        <ModalFooter>
          <Button variant="ghost" onClick={onClose} type="button">Cancel</Button>
          <Button variant="primary" type="submit" disabled={saving || !name.trim() || !displayName.trim()} loading={saving}>
            {saving ? 'Creating...' : 'Create'}
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  );
}

// ── Add/Edit Slab Modal ────────────────────────────────────────
function SlabModal({ isOpen, categories, slab, onClose, onSave }: {
  isOpen: boolean;
  categories: TaxCategory[];
  slab?: TaxSlab | null;
  onClose: () => void;
  onSave: (data: any) => Promise<void>;
}) {
  const [form, setForm] = useState({
    tax_category_id: slab?.tax_category_id || (categories[0]?.id || 0),
    country: slab?.country || 'IN',
    min_amount: slab?.min_amount ?? 0,
    max_amount: slab?.max_amount ?? '',
    rate_pct: slab?.rate_pct ?? 0,
    component_1_name: slab?.component_1_name || 'CGST',
    component_1_pct: slab?.component_1_pct ?? 0,
    component_2_name: slab?.component_2_name || 'SGST',
    component_2_pct: slab?.component_2_pct ?? 0,
    effective_from: slab?.effective_from || new Date().toISOString().split('T')[0],
    effective_to: slab?.effective_to || '',
  });
  const [saving, setSaving] = useState(false);

  const set = (key: string, value: any) => setForm(prev => ({ ...prev, [key]: value }));

  const inputCls = 'w-full px-4 py-2.5 text-sm bg-white border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-terra-500/30 focus:border-terra-400';
  const labelCls = 'block text-[12px] font-semibold text-neutral-600 mb-1.5';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSave({
        ...form,
        max_amount: form.max_amount === '' ? null : Number(form.max_amount),
        effective_to: form.effective_to || null,
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <form onSubmit={handleSubmit}>
        <ModalHeader>
          <ModalTitle>{slab ? 'Edit Tax Slab' : 'Add Tax Slab'}</ModalTitle>
        </ModalHeader>
        <ModalContent>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Category</label>
                <select
                  value={form.tax_category_id}
                  onChange={e => set('tax_category_id', Number(e.target.value))}
                  className={inputCls}
                >
                  {categories.map(c => <option key={c.id} value={c.id}>{c.display_name}</option>)}
                </select>
              </div>
              <div>
                <label className={labelCls}>Country</label>
                <input
                  value={form.country}
                  onChange={e => set('country', e.target.value)}
                  placeholder="IN"
                  className={inputCls}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Min Amount</label>
                <input type="number" min={0} step="0.01" value={form.min_amount}
                  onChange={e => set('min_amount', Number(e.target.value))} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Max Amount (blank = no limit)</label>
                <input type="number" min={0} step="0.01" value={form.max_amount}
                  onChange={e => set('max_amount', e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="No limit" className={inputCls} />
              </div>
            </div>

            <div>
              <label className={labelCls}>Total Rate %</label>
              <input type="number" min={0} max={100} step="0.01" value={form.rate_pct}
                onChange={e => set('rate_pct', Number(e.target.value))} className={inputCls} />
            </div>

            <div className="bg-neutral-50 rounded-xl p-4 space-y-3">
              <p className="text-[11px] font-semibold text-neutral-500 uppercase tracking-widest">Tax Components</p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-medium text-neutral-500 mb-1">Component 1 Name</label>
                  <input value={form.component_1_name} onChange={e => set('component_1_name', e.target.value)}
                    className={inputCls} />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-neutral-500 mb-1">Component 1 %</label>
                  <input type="number" min={0} max={100} step="0.01" value={form.component_1_pct}
                    onChange={e => set('component_1_pct', Number(e.target.value))} className={inputCls} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-medium text-neutral-500 mb-1">Component 2 Name</label>
                  <input value={form.component_2_name} onChange={e => set('component_2_name', e.target.value)}
                    className={inputCls} />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-neutral-500 mb-1">Component 2 %</label>
                  <input type="number" min={0} max={100} step="0.01" value={form.component_2_pct}
                    onChange={e => set('component_2_pct', Number(e.target.value))} className={inputCls} />
                </div>
              </div>
              {Math.abs(form.component_1_pct + form.component_2_pct - form.rate_pct) > 0.01 && (
                <p className="text-[11px] text-amber-600 font-medium">
                  Components ({form.component_1_pct}% + {form.component_2_pct}%) must equal total rate ({form.rate_pct}%)
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Effective From</label>
                <input type="date" value={form.effective_from}
                  onChange={e => set('effective_from', e.target.value)} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Effective To (optional)</label>
                <input type="date" value={form.effective_to}
                  onChange={e => set('effective_to', e.target.value)} className={inputCls} />
              </div>
            </div>
          </div>
        </ModalContent>
        <ModalFooter>
          <Button variant="ghost" onClick={onClose} type="button">Cancel</Button>
          <Button variant="primary" type="submit" disabled={saving} loading={saving}>
            {saving ? 'Saving...' : (slab ? 'Update' : 'Create')}
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  );
}

// ── Tax Calculator Preview ────────────────────────────────────
function TaxCalculator({ categories }: { categories: TaxCategory[] }) {
  const [categoryName, setCategoryName] = useState(categories[0]?.name || '');
  const [amount, setAmount] = useState<number>(5000);
  const [result, setResult] = useState<TaxCalculationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const { error } = useToast();
  const { formatSimple } = useCurrency();

  const inputCls = 'w-full px-4 py-2.5 text-sm bg-white border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400';

  const calculate = async () => {
    if (!categoryName || !amount) return;
    setLoading(true);
    try {
      const res = await taxService.calculateTax({ category_name: categoryName, base_amount: amount });
      setResult(res);
    } catch (err: any) {
      error(err?.response?.data?.detail || 'Calculation failed');
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-amber-50/50 border border-amber-200/60 rounded-xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <Calculator className="w-4 h-4 text-amber-600" />
        <h3 className="text-[13px] font-semibold text-neutral-900">Tax Calculator Preview</h3>
      </div>
      <div className="flex items-end gap-3">
        <div className="flex-1">
          <label className="block text-[11px] font-medium text-neutral-500 mb-1">Category</label>
          <select
            value={categoryName}
            onChange={e => { setCategoryName(e.target.value); setResult(null); }}
            className={inputCls}
          >
            {categories.map(c => <option key={c.id} value={c.name}>{c.display_name}</option>)}
          </select>
        </div>
        <div className="w-36">
          <label className="block text-[11px] font-medium text-neutral-500 mb-1">Amount</label>
          <input
            type="number"
            min={0}
            step="0.01"
            value={amount}
            onChange={e => { setAmount(Number(e.target.value)); setResult(null); }}
            className={inputCls}
          />
        </div>
        <Button variant="primary" onClick={calculate} disabled={loading || !categoryName || !amount} loading={loading}>
          Calculate
        </Button>
      </div>
      {result && (
        <div className="mt-4 bg-white rounded-xl p-4 border border-neutral-100 space-y-2 text-[12px]">
          <div className="flex justify-between"><span className="text-neutral-500">Base Amount</span><span className="font-medium">{formatSimple(result.base_amount)}</span></div>
          {result.components.map((c, i) => (
            <div key={i} className="flex justify-between">
              <span className="text-neutral-500">{c.name} @ {c.rate_pct}%</span>
              <span className="font-medium">{formatSimple(c.amount)}</span>
            </div>
          ))}
          <div className="flex justify-between border-t border-neutral-100 pt-2 font-semibold">
            <span className="text-neutral-700">Total Tax ({result.tax_rate_pct}%)</span>
            <span>{formatSimple(result.tax_amount)}</span>
          </div>
          <div className="flex justify-between border-t border-neutral-200 pt-2 font-bold text-[13px]">
            <span className="text-neutral-900">Grand Total</span>
            <span>{formatSimple(result.total_with_tax)}</span>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main TaxesTab Component ───────────────────────────────────
export default function TaxesTab() {
  const [categories, setCategories] = useState<TaxCategory[]>([]);
  const [slabs, setSlabs] = useState<TaxSlab[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [showSlabModal, setShowSlabModal] = useState<{ open: boolean; slab?: TaxSlab | null }>({ open: false });
  const [deleteConfirm, setDeleteConfirm] = useState<{ type: 'category' | 'slab'; id: number } | null>(null);
  const [seeding, setSeeding] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<Set<number>>(new Set());
  const { success, error } = useToast();

  const fetchData = useCallback(async () => {
    try {
      const [cats, slabsList] = await Promise.all([
        taxService.listCategories(),
        taxService.listSlabs(),
      ]);
      setCategories(Array.isArray(cats) ? cats : []);
      setSlabs(Array.isArray(slabsList) ? slabsList : []);
      setExpandedCategories(new Set((Array.isArray(cats) ? cats : []).map((c: TaxCategory) => c.id)));
    } catch (err: any) {
      error('Failed to load tax data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSeedGST = async () => {
    setSeeding(true);
    try {
      const res = await taxService.seedIndiaGST();
      success(`India GST seeded! Categories: ${res.categories_created || 0}, Slabs: ${res.slabs_created || 0}`);
      await fetchData();
    } catch (err: any) {
      error(err?.response?.data?.detail || 'Failed to seed GST');
    } finally {
      setSeeding(false);
    }
  };

  const handleAddCategory = async (data: { name: string; display_name: string; description?: string }) => {
    try {
      await taxService.createCategory(data);
      success('Category created');
      setShowAddCategory(false);
      await fetchData();
    } catch (err: any) {
      error(err?.response?.data?.detail || 'Failed to create category');
    }
  };

  const handleDeleteCategory = async (id: number) => {
    try {
      await taxService.deleteCategory(id);
      success('Category deactivated');
      setDeleteConfirm(null);
      await fetchData();
    } catch (err: any) {
      error(err?.response?.data?.detail || 'Failed to deactivate');
    }
  };

  const handleSaveSlab = async (data: any) => {
    try {
      if (showSlabModal.slab) {
        await taxService.updateSlab(showSlabModal.slab.id, data);
        success('Slab updated');
      } else {
        await taxService.createSlab(data);
        success('Slab created');
      }
      setShowSlabModal({ open: false });
      await fetchData();
    } catch (err: any) {
      error(err?.response?.data?.detail || 'Failed to save slab');
    }
  };

  const handleDeleteSlab = async (id: number) => {
    try {
      await taxService.deleteSlab(id);
      success('Slab deactivated');
      setDeleteConfirm(null);
      await fetchData();
    } catch (err: any) {
      error(err?.response?.data?.detail || 'Failed to deactivate slab');
    }
  };

  const toggleCategory = (id: number) => {
    setExpandedCategories(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-neutral-400" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl space-y-6">
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-base sm:text-lg font-semibold text-neutral-900">Tax Configuration</h1>
          <p className="text-[12px] text-neutral-500 mt-1">
            Manage GST categories, tax slabs, and rate structures
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" icon={Sprout} onClick={handleSeedGST} disabled={seeding} loading={seeding}>
            <span className="hidden sm:inline">Seed India GST</span>
            <span className="sm:hidden">Seed GST</span>
          </Button>
          <Button variant="primary" icon={Plus} onClick={() => setShowAddCategory(true)}>
            <span className="hidden sm:inline">Add Category</span>
            <span className="sm:hidden">Category</span>
          </Button>
        </div>
      </header>

      {/* Categories + Slabs */}
      {categories.length === 0 ? (
        <div className="bg-neutral-50 rounded-xl p-12 text-center">
          <p className="text-[13px] text-neutral-500">No tax categories configured.</p>
          <p className="text-[12px] text-neutral-400 mt-1">Use "Seed India GST" to set up default categories and slabs, or add a category manually.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {categories.map(cat => {
            const catSlabs = slabs.filter(s => s.tax_category_id === cat.id);
            const isExpanded = expandedCategories.has(cat.id);

            return (
              <div key={cat.id} className="bg-neutral-50/50 rounded-[10px] overflow-hidden border border-neutral-100">
                {/* Category Header */}
                <div className="flex items-center justify-between px-5 py-3.5 bg-white">
                  <button onClick={() => toggleCategory(cat.id)} className="flex items-center gap-2 text-left flex-1 min-w-0">
                    {isExpanded ? <ChevronDown className="w-4 h-4 text-neutral-400 flex-shrink-0" /> : <ChevronRight className="w-4 h-4 text-neutral-400 flex-shrink-0" />}
                    <div className="min-w-0">
                      <span className="text-[13px] font-semibold text-neutral-900">{cat.display_name}</span>
                      <span className="text-[11px] text-neutral-400 ml-2">({cat.name})</span>
                      {cat.description && <p className="text-[11px] text-neutral-500 truncate">{cat.description}</p>}
                    </div>
                  </button>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-[10px] font-medium text-neutral-400 bg-neutral-100 px-2 py-0.5 rounded">
                      {catSlabs.length} slab{catSlabs.length !== 1 ? 's' : ''}
                    </span>
                    {deleteConfirm?.type === 'category' && deleteConfirm.id === cat.id ? (
                      <div className="flex items-center gap-1">
                        <Button variant="outline" size="sm" icon={X} onClick={() => setDeleteConfirm(null)} />
                        <Button variant="danger" size="sm" icon={Check} onClick={() => handleDeleteCategory(cat.id)} />
                      </div>
                    ) : (
                      <Button variant="ghost" size="sm" icon={Trash2} onClick={() => setDeleteConfirm({ type: 'category', id: cat.id })} />
                    )}
                  </div>
                </div>

                {/* Slabs Table */}
                {isExpanded && (
                  <div className="border-t border-neutral-100">
                    {catSlabs.length === 0 ? (
                      <div className="py-8 text-center text-[12px] text-neutral-400">
                        No slabs for this category.
                        <button onClick={() => setShowSlabModal({ open: true, slab: null })} className="text-terra-600 hover:underline ml-1">Add one</button>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-[12px]">
                          <thead>
                            <tr className="bg-neutral-50 border-b border-neutral-100">
                              <th className="text-left px-4 py-2 font-medium text-neutral-500">Country</th>
                              <th className="text-right px-4 py-2 font-medium text-neutral-500">Amount Range</th>
                              <th className="text-right px-4 py-2 font-medium text-neutral-500">Rate%</th>
                              <th className="text-right px-4 py-2 font-medium text-neutral-500">
                                {catSlabs[0]?.component_1_name || 'Comp 1'}%
                              </th>
                              <th className="text-right px-4 py-2 font-medium text-neutral-500">
                                {catSlabs[0]?.component_2_name || 'Comp 2'}%
                              </th>
                              <th className="text-left px-4 py-2 font-medium text-neutral-500">Effective</th>
                              <th className="text-right px-4 py-2 font-medium text-neutral-500">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {catSlabs.map(slab => (
                              <tr key={slab.id} className="border-b border-neutral-50 last:border-0 hover:bg-neutral-50/50">
                                <td className="px-4 py-2.5 text-neutral-600">{slab.country}</td>
                                <td className="px-4 py-2.5 text-right text-neutral-700 font-medium">
                                  {slab.min_amount.toLocaleString()} – {slab.max_amount ? slab.max_amount.toLocaleString() : '∞'}
                                </td>
                                <td className="px-4 py-2.5 text-right font-semibold text-neutral-900">{slab.rate_pct}%</td>
                                <td className="px-4 py-2.5 text-right text-neutral-600">{slab.component_1_pct ?? '–'}%</td>
                                <td className="px-4 py-2.5 text-right text-neutral-600">{slab.component_2_pct ?? '–'}%</td>
                                <td className="px-4 py-2.5 text-neutral-500">
                                  {slab.effective_from}{slab.effective_to ? ` → ${slab.effective_to}` : ' → present'}
                                </td>
                                <td className="px-4 py-2.5 text-right">
                                  {deleteConfirm?.type === 'slab' && deleteConfirm.id === slab.id ? (
                                    <div className="flex items-center justify-end gap-1">
                                      <Button variant="outline" size="sm" icon={X} onClick={() => setDeleteConfirm(null)} />
                                      <Button variant="danger" size="sm" icon={Check} onClick={() => handleDeleteSlab(slab.id)} />
                                    </div>
                                  ) : (
                                    <div className="flex items-center justify-end gap-1">
                                      <button
                                        onClick={() => setShowSlabModal({ open: true, slab })}
                                        className="px-2 py-1 text-[11px] text-terra-600 hover:bg-terra-50 rounded transition-colors"
                                      >
                                        Edit
                                      </button>
                                      <Button variant="ghost" size="sm" icon={Trash2} onClick={() => setDeleteConfirm({ type: 'slab', id: slab.id })} />
                                    </div>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                    <div className="px-4 py-2 border-t border-neutral-100">
                      <button
                        onClick={() => setShowSlabModal({ open: true, slab: null })}
                        className="inline-flex items-center gap-1 text-[11px] text-terra-600 hover:text-terra-700 font-medium"
                      >
                        <Plus className="w-3 h-3" /> Add Slab
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Tax Calculator */}
      {categories.length > 0 && <TaxCalculator categories={categories} />}

      {/* Modals */}
      <AddCategoryModal isOpen={showAddCategory} onClose={() => setShowAddCategory(false)} onSave={handleAddCategory} />
      <SlabModal
        isOpen={showSlabModal.open}
        categories={categories}
        slab={showSlabModal.slab}
        onClose={() => setShowSlabModal({ open: false })}
        onSave={handleSaveSlab}
      />
    </div>
  );
}
