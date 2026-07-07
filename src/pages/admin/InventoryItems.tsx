/**
 * InventoryItems — CRUD admin page for the sellable consumables catalog
 * (water bottles, snacks, minibar, etc.). Items can be picked when posting a
 * charge to a folio. Catalog only — no stock-quantity tracking.
 * Glimmora Design System v5.0
 */

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Package, Plus, Edit2, Trash2, Download, MoreHorizontal } from 'lucide-react';
import { catalogItemsService, type CatalogItem } from '@/api/services/catalog-items.service';
import { useToast } from '@/contexts/ToastContext';

// UI2 Components
import { ConfirmModal } from '@/components/ui2/Modal';
import { Drawer } from '@/components/ui2/Drawer';
import { Button } from '@/components/ui2/Button';
import {
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
  TableEmpty, TableSkeleton, Pagination,
} from '@/components/ui2/Table';
import { Badge } from '@/components/ui2/Badge';
import { SearchBar } from '@/components/ui2/SearchBar';
import { SimpleDropdown } from '@/components/ui/Select';

// ── Module-level style constants ─────────────────────────────────────────────
const inputBase = 'w-full h-9 px-3.5 rounded-lg text-[13px] bg-white border transition-all duration-200 ease-out focus:outline-none';
const inputCls = `${inputBase} border-neutral-200/80 hover:border-terra-300/60 focus:border-terra-400/60 focus:ring-2 focus:ring-terra-500/10 placeholder:text-neutral-400 text-neutral-900`;
const labelCls = 'block text-[13px] font-medium text-neutral-700 mb-1';

// ── Category options (map to FolioLineItem.item_type) ─────────────────────────
const CATEGORY_OPTIONS = [
  { value: 'minibar', label: 'Minibar' },
  { value: 'water', label: 'Water (GST-exempt)' },
  { value: 'service', label: 'Room Service' },
  { value: 'restaurant', label: 'Restaurant' },
  { value: 'laundry', label: 'Laundry' },
  { value: 'spa', label: 'Spa' },
  { value: 'parking', label: 'Parking' },
  { value: 'newspaper', label: 'Newspaper' },
  { value: 'misc', label: 'Miscellaneous' },
];

const CATEGORY_FILTER_OPTIONS = [{ value: '', label: 'All Categories' }, ...CATEGORY_OPTIONS];

const CATEGORY_LABEL: Record<string, string> = Object.fromEntries(CATEGORY_OPTIONS.map(o => [o.value, o.label]));

const fmtPrice = (v: number) => `₹${Number(v || 0).toFixed(2)}`;

// ── Row Menu ──────────────────────────────────────────────────────────────────
function RowMenu({ onEdit, onDelete }: { onEdit: () => void; onDelete: () => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  return (
    <div className="relative flex justify-end" ref={ref}>
      <button
        className="w-7 h-7 rounded-md flex items-center justify-center text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 transition-colors"
        onClick={e => { e.stopPropagation(); setOpen(v => !v); }}
      >
        <MoreHorizontal className="w-4 h-4" />
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 z-50 w-40 bg-white rounded-xl border border-neutral-200 shadow-lg overflow-hidden">
          <button
            className="w-full px-3.5 py-2.5 text-[13px] text-left flex items-center gap-2.5 hover:bg-neutral-50 text-neutral-700 transition-colors"
            onClick={() => { onEdit(); setOpen(false); }}
          >
            <Edit2 className="w-3.5 h-3.5 text-neutral-400" /> Edit
          </button>
          <div className="h-px bg-neutral-100 mx-2" />
          <button
            className="w-full px-3.5 py-2.5 text-[13px] text-left flex items-center gap-2.5 hover:bg-rose-50 text-rose-600 transition-colors"
            onClick={() => { onDelete(); setOpen(false); }}
          >
            <Trash2 className="w-3.5 h-3.5" /> Delete
          </button>
        </div>
      )}
    </div>
  );
}

// ── Create / Edit Drawer ──────────────────────────────────────────────────────
function ItemDrawer({ isOpen, onClose, onSave, initial }: {
  isOpen: boolean; onClose: () => void;
  onSave: (data: Partial<CatalogItem>) => Promise<void>;
  initial?: CatalogItem | null;
}) {
  const [form, setForm] = useState({
    name: '', sku: '', category: 'minibar', unit_price: '0', unit: '', sort_order: '0',
  });
  const [saving, setSaving] = useState(false);
  const { error: showError } = useToast();

  useEffect(() => {
    if (initial) {
      setForm({
        name: initial.name || '', sku: initial.sku || '',
        category: initial.category || 'minibar',
        unit_price: String(initial.unit_price ?? 0),
        unit: initial.unit || '',
        sort_order: String(initial.sort_order || 0),
      });
    } else {
      setForm({ name: '', sku: '', category: 'minibar', unit_price: '0', unit: '', sort_order: '0' });
    }
  }, [initial, isOpen]);

  const handleSave = async () => {
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      await onSave({
        name: form.name.trim(),
        sku: form.sku.trim() || undefined,
        category: form.category,
        unit_price: parseFloat(form.unit_price) || 0,
        unit: form.unit.trim() || undefined,
        sort_order: parseInt(form.sort_order) || 0,
      });
      onClose();
    } catch (err: any) {
      showError(err?.response?.data?.detail || 'Failed to save');
    }
    setSaving(false);
  };

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title={initial ? 'Edit Item' : 'New Item'}
      subtitle={initial ? `Editing ${initial.name}` : 'Add a sellable consumable'}
      maxWidth="max-w-md"
      footer={
        <div className="flex gap-3 w-full">
          <Button variant="ghost" className="flex-1" onClick={onClose}>Cancel</Button>
          <Button variant="primary" className="flex-1" onClick={handleSave} disabled={saving} loading={saving}>
            {initial ? 'Update' : 'Create'}
          </Button>
        </div>
      }
    >
      <div className="space-y-6">

        {/* ── Section: Item ── */}
        <div>
          <p className="text-[11px] font-semibold text-neutral-500 uppercase tracking-widest mb-3.5">Item</p>
          <div className="space-y-3.5">
            <div>
              <label className={labelCls}>Name <span className="text-rose-400">*</span></label>
              <input
                className={inputCls}
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="e.g. Water Bottle 1L"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>SKU / Code</label>
                <input
                  className={inputCls}
                  value={form.sku}
                  onChange={e => setForm(f => ({ ...f, sku: e.target.value }))}
                  placeholder="e.g. WTR1L"
                />
              </div>
              <div>
                <label className={labelCls}>Category</label>
                <SimpleDropdown
                  options={CATEGORY_OPTIONS}
                  value={form.category}
                  onChange={v => setForm(f => ({ ...f, category: v }))}
                  triggerClassName="w-full h-9 py-0 text-[13px]"
                />
              </div>
            </div>
          </div>
        </div>

        {/* ── Section: Pricing ── */}
        <div className="border-t border-neutral-100 pt-5">
          <p className="text-[11px] font-semibold text-neutral-500 uppercase tracking-widest mb-3.5">Pricing</p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Unit Price (₹) <span className="text-rose-400">*</span></label>
              <input
                type="number"
                min="0"
                step="0.01"
                className={inputCls}
                value={form.unit_price}
                onChange={e => setForm(f => ({ ...f, unit_price: e.target.value }))}
                placeholder="0.00"
              />
            </div>
            <div>
              <label className={labelCls}>Unit</label>
              <input
                className={inputCls}
                value={form.unit}
                onChange={e => setForm(f => ({ ...f, unit: e.target.value }))}
                placeholder="e.g. bottle"
              />
            </div>
          </div>
          <p className="text-[11px] text-neutral-400 mt-3 leading-relaxed">
            Price is pre-tax. GST is applied automatically when the item is charged to a room.
          </p>
        </div>

        {/* ── Section: Display ── */}
        <div className="border-t border-neutral-100 pt-5">
          <p className="text-[11px] font-semibold text-neutral-500 uppercase tracking-widest mb-3.5">Display</p>
          <div className="w-1/2 pr-1.5">
            <label className={labelCls}>Sort Order</label>
            <input
              type="number"
              className={inputCls}
              value={form.sort_order}
              onChange={e => setForm(f => ({ ...f, sort_order: e.target.value }))}
            />
          </div>
        </div>

      </div>
    </Drawer>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function InventoryItems() {
  const { success, error: showError } = useToast();
  const [items, setItems] = useState<CatalogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<CatalogItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<CatalogItem | null>(null);
  const [seeding, setSeeding] = useState(false);
  const perPage = 20;

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const data = await catalogItemsService.list({ category: categoryFilter || undefined });
      setItems(Array.isArray(data) ? data : []);
    } catch {
      showError('Failed to load inventory items');
    }
    setLoading(false);
  }, [categoryFilter]);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  const filtered = useMemo(() => {
    if (!search.trim()) return items;
    const q = search.toLowerCase();
    return items.filter(it =>
      it.name?.toLowerCase().includes(q) || it.sku?.toLowerCase().includes(q) ||
      it.category?.toLowerCase().includes(q)
    );
  }, [items, search]);

  const paged = useMemo(() => filtered.slice((page - 1) * perPage, page * perPage), [filtered, page]);
  const totalPages = Math.ceil(filtered.length / perPage);

  const handleCreate = async (data: Partial<CatalogItem>) => {
    await catalogItemsService.create(data);
    success('Item created');
    fetchItems();
  };

  const handleUpdate = async (data: Partial<CatalogItem>) => {
    if (!editItem) return;
    await catalogItemsService.update(editItem.id, data);
    success('Item updated');
    setEditItem(null);
    fetchItems();
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await catalogItemsService.delete(deleteTarget.id);
      success('Item deleted');
      fetchItems();
    } catch (err: any) {
      showError(err?.response?.data?.detail || 'Delete failed');
    }
    setDeleteTarget(null);
  };

  const handleSeed = async () => {
    setSeeding(true);
    try {
      await catalogItemsService.seed();
      success('Default items seeded');
      fetchItems();
    } catch (err: any) {
      showError(err?.response?.data?.detail || 'Seed failed');
    }
    setSeeding(false);
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F9F7F7' }}>
      <div className="px-4 sm:px-6 lg:px-10 py-4 sm:py-6 space-y-4 sm:space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-neutral-900">Inventory</h1>
            <p className="text-[12px] sm:text-[13px] text-neutral-500 mt-1">{filtered.length} item{filtered.length !== 1 ? 's' : ''}</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" icon={Download} onClick={handleSeed} loading={seeding}>
              Seed Defaults
            </Button>
            <Button variant="primary" icon={Plus} onClick={() => { setEditItem(null); setModalOpen(true); }}>
              Add Item
            </Button>
          </div>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-[10px] border border-neutral-100 overflow-hidden">

          {/* Search & Filter Bar */}
          <div className="px-4 sm:px-6 py-3 border-b border-neutral-100">
            <div className="flex items-center gap-3">
              <div className="flex-1 max-w-xs">
                <SearchBar
                  value={search}
                  onChange={val => { setSearch(val); setPage(1); }}
                  onClear={() => { setSearch(''); setPage(1); }}
                  placeholder="Search items..."
                  size="md"
                />
              </div>
              <div className="ml-auto">
                <SimpleDropdown
                  options={CATEGORY_FILTER_OPTIONS}
                  value={categoryFilter}
                  onChange={val => { setCategoryFilter(val); setPage(1); }}
                  triggerClassName="h-9 py-0 text-[13px] min-w-[150px]"
                />
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Unit</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                  <TableHead>Active</TableHead>
                  <TableHead>Sort</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableSkeleton columns={8} rows={6} />
                ) : paged.length === 0 ? (
                  <TableEmpty
                    colSpan={8}
                    icon={Package}
                    title="No inventory items found"
                    description={search ? 'Try adjusting your search or filters' : 'Add an item or seed defaults'}
                  />
                ) : paged.map(it => (
                  <TableRow key={it.id} clickable onClick={() => { setEditItem(it); setModalOpen(true); }}>
                    <TableCell className="font-medium text-neutral-800">{it.name}</TableCell>
                    <TableCell className="font-mono text-neutral-500">
                      {it.sku || <span className="text-neutral-300">—</span>}
                    </TableCell>
                    <TableCell>
                      <Badge variant="info">{CATEGORY_LABEL[it.category] || it.category}</Badge>
                    </TableCell>
                    <TableCell className="text-neutral-600">
                      {it.unit || <span className="text-neutral-300">—</span>}
                    </TableCell>
                    <TableCell className="text-right tabular-nums font-semibold text-neutral-900">{fmtPrice(it.unit_price)}</TableCell>
                    <TableCell>
                      <span className={`w-2 h-2 rounded-full inline-block ${it.is_active ? 'bg-sage-500' : 'bg-neutral-300'}`} />
                    </TableCell>
                    <TableCell className="tabular-nums text-neutral-500">{it.sort_order}</TableCell>
                    <TableCell className="w-10">
                      <RowMenu
                        onEdit={() => { setEditItem(it); setModalOpen(true); }}
                        onDelete={() => setDeleteTarget(it)}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {!loading && totalPages > 1 && (
            <div className="px-4 sm:px-6 py-3 border-t border-neutral-100 bg-neutral-50/30">
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                totalItems={filtered.length}
                itemsPerPage={perPage}
                onPageChange={setPage}
              />
            </div>
          )}
        </div>
      </div>

      <ItemDrawer
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setEditItem(null); }}
        onSave={editItem ? handleUpdate : handleCreate}
        initial={editItem}
      />

      <ConfirmModal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title={`Delete "${deleteTarget?.name}"?`}
        description="This item will be deactivated and removed from the charge picker."
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
      />
    </div>
  );
}
