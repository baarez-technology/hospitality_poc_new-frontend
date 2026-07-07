/**
 * TransactionCodes — CRUD admin page for Opera-style numeric transaction codes.
 * Glimmora Design System v5.0
 */

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Hash, Plus, Edit2, Trash2, Download, MoreHorizontal } from 'lucide-react';
import { transactionCodesService, type TransactionCode } from '@/api/services/transaction-codes.service';
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

// ── Type badge mapping ────────────────────────────────────────────────────────
const TYPE_VARIANT: Record<string, 'info' | 'success' | 'warning' | 'secondary'> = {
  charge: 'info',
  payment: 'success',
  adjustment: 'warning',
  tax: 'secondary',
};

// ── Filter / form options ─────────────────────────────────────────────────────
const TYPE_FILTER_OPTIONS = [
  { value: '', label: 'All Types' },
  { value: 'charge', label: 'Charge' },
  { value: 'payment', label: 'Payment' },
  { value: 'adjustment', label: 'Adjustment' },
  { value: 'tax', label: 'Tax' },
];

const TYPE_FORM_OPTIONS = [
  { value: 'charge', label: 'Charge' },
  { value: 'payment', label: 'Payment' },
  { value: 'adjustment', label: 'Adjustment' },
  { value: 'tax', label: 'Tax' },
];

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
function CodeDrawer({ isOpen, onClose, onSave, initial }: {
  isOpen: boolean; onClose: () => void;
  onSave: (data: Partial<TransactionCode>) => Promise<void>;
  initial?: TransactionCode | null;
}) {
  const [form, setForm] = useState({
    code: '', name: '', category: '', code_type: 'charge',
    adjustment_code: '', department: '', sort_order: '0',
  });
  const [saving, setSaving] = useState(false);
  const { error: showError } = useToast();

  useEffect(() => {
    if (initial) {
      setForm({
        code: initial.code || '', name: initial.name || '',
        category: initial.category || '', code_type: initial.code_type || 'charge',
        adjustment_code: initial.adjustment_code || '', department: initial.department || '',
        sort_order: String(initial.sort_order || 0),
      });
    } else {
      setForm({ code: '', name: '', category: '', code_type: 'charge', adjustment_code: '', department: '', sort_order: '0' });
    }
  }, [initial, isOpen]);

  const handleSave = async () => {
    if (!form.code || !form.name) return;
    setSaving(true);
    try {
      await onSave({
        code: form.code, name: form.name,
        category: form.category || undefined,
        code_type: form.code_type as any,
        adjustment_code: form.adjustment_code || undefined,
        department: form.department || undefined,
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
      title={initial ? 'Edit Transaction Code' : 'New Transaction Code'}
      subtitle={initial ? `Editing code ${initial.code}` : 'Create a new transaction code'}
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

        {/* ── Section: Identity ── */}
        <div>
          <p className="text-[11px] font-semibold text-neutral-500 uppercase tracking-widest mb-3.5">Identity</p>
          <div className="space-y-3.5">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>Code <span className="text-rose-400">*</span></label>
                <input
                  className={inputCls}
                  value={form.code}
                  onChange={e => setForm(f => ({ ...f, code: e.target.value }))}
                  placeholder="e.g. 1000"
                />
              </div>
              <div>
                <label className={labelCls}>Type <span className="text-rose-400">*</span></label>
                <SimpleDropdown
                  options={TYPE_FORM_OPTIONS}
                  value={form.code_type}
                  onChange={v => setForm(f => ({ ...f, code_type: v }))}
                  triggerClassName="w-full h-9 py-0 text-[13px]"
                />
              </div>
            </div>
            <div>
              <label className={labelCls}>Name <span className="text-rose-400">*</span></label>
              <input
                className={inputCls}
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="e.g. Room Charge"
              />
            </div>
          </div>
        </div>

        {/* ── Section: Classification ── */}
        <div className="border-t border-neutral-100 pt-5">
          <p className="text-[11px] font-semibold text-neutral-500 uppercase tracking-widest mb-3.5">Classification</p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Category</label>
              <input
                className={inputCls}
                value={form.category}
                onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                placeholder="e.g. room_charge"
              />
            </div>
            <div>
              <label className={labelCls}>Department</label>
              <input
                className={inputCls}
                value={form.department}
                onChange={e => setForm(f => ({ ...f, department: e.target.value }))}
                placeholder="e.g. Front Office"
              />
            </div>
          </div>
        </div>

        {/* ── Section: Advanced ── */}
        <div className="border-t border-neutral-100 pt-5">
          <p className="text-[11px] font-semibold text-neutral-500 uppercase tracking-widest mb-3.5">Advanced</p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Adjustment Code</label>
              <input
                className={inputCls}
                value={form.adjustment_code}
                onChange={e => setForm(f => ({ ...f, adjustment_code: e.target.value }))}
                placeholder="e.g. 1001"
              />
            </div>
            <div>
              <label className={labelCls}>Sort Order</label>
              <input
                type="number"
                className={inputCls}
                value={form.sort_order}
                onChange={e => setForm(f => ({ ...f, sort_order: e.target.value }))}
              />
            </div>
          </div>
          <p className="text-[11px] text-neutral-400 mt-3 leading-relaxed">
            Adjustment Code links this entry to its reversal transaction.
          </p>
        </div>

      </div>
    </Drawer>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function TransactionCodes() {
  const { success, error: showError } = useToast();
  const [codes, setCodes] = useState<TransactionCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editCode, setEditCode] = useState<TransactionCode | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<TransactionCode | null>(null);
  const [seeding, setSeeding] = useState(false);
  const perPage = 20;

  const fetchCodes = useCallback(async () => {
    setLoading(true);
    try {
      const data = await transactionCodesService.list({ code_type: typeFilter || undefined });
      setCodes(Array.isArray(data) ? data : []);
    } catch {
      showError('Failed to load transaction codes');
    }
    setLoading(false);
  }, [typeFilter]);

  useEffect(() => { fetchCodes(); }, [fetchCodes]);

  const filtered = useMemo(() => {
    if (!search.trim()) return codes;
    const q = search.toLowerCase();
    return codes.filter(c =>
      c.code?.toLowerCase().includes(q) || c.name?.toLowerCase().includes(q) ||
      c.category?.toLowerCase().includes(q) || c.department?.toLowerCase().includes(q)
    );
  }, [codes, search]);

  const paged = useMemo(() => filtered.slice((page - 1) * perPage, page * perPage), [filtered, page]);
  const totalPages = Math.ceil(filtered.length / perPage);

  const handleCreate = async (data: Partial<TransactionCode>) => {
    await transactionCodesService.create(data);
    success('Transaction code created');
    fetchCodes();
  };

  const handleUpdate = async (data: Partial<TransactionCode>) => {
    if (!editCode) return;
    await transactionCodesService.update(editCode.id, data);
    success('Transaction code updated');
    setEditCode(null);
    fetchCodes();
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await transactionCodesService.delete(deleteTarget.id);
      success('Transaction code deleted');
      fetchCodes();
    } catch (err: any) {
      showError(err?.response?.data?.detail || 'Delete failed');
    }
    setDeleteTarget(null);
  };

  const handleSeed = async () => {
    setSeeding(true);
    try {
      await transactionCodesService.seed();
      success('Default codes seeded');
      fetchCodes();
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
            <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-neutral-900">Transaction Codes</h1>
            <p className="text-[12px] sm:text-[13px] text-neutral-500 mt-1">{filtered.length} code{filtered.length !== 1 ? 's' : ''}</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" icon={Download} onClick={handleSeed} loading={seeding}>
              Seed Defaults
            </Button>
            <Button variant="primary" icon={Plus} onClick={() => { setEditCode(null); setModalOpen(true); }}>
              Add Code
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
                  placeholder="Search codes..."
                  size="md"
                />
              </div>
              <div className="ml-auto">
                <SimpleDropdown
                  options={TYPE_FILTER_OPTIONS}
                  value={typeFilter}
                  onChange={val => { setTypeFilter(val); setPage(1); }}
                  triggerClassName="h-9 py-0 text-[13px] min-w-[130px]"
                />
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Adj. Code</TableHead>
                  <TableHead>Active</TableHead>
                  <TableHead>Sort</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableSkeleton columns={9} rows={6} />
                ) : paged.length === 0 ? (
                  <TableEmpty
                    colSpan={9}
                    icon={Hash}
                    title="No transaction codes found"
                    description={search ? 'Try adjusting your search or filters' : 'Add a transaction code or seed defaults'}
                  />
                ) : paged.map(tc => (
                  <TableRow key={tc.id} clickable onClick={() => { setEditCode(tc); setModalOpen(true); }}>
                    <TableCell className="font-mono font-bold text-neutral-900">{tc.code}</TableCell>
                    <TableCell className="font-medium text-neutral-800">{tc.name}</TableCell>
                    <TableCell>
                      <Badge variant={TYPE_VARIANT[tc.code_type] || 'neutral'}>{tc.code_type}</Badge>
                    </TableCell>
                    <TableCell className="text-neutral-500">
                      {tc.category ? (
                        <span className="font-mono text-[12px]">{tc.category}</span>
                      ) : <span className="text-neutral-300">—</span>}
                    </TableCell>
                    <TableCell className="text-neutral-600">
                      {tc.department || <span className="text-neutral-300">—</span>}
                    </TableCell>
                    <TableCell className="font-mono text-neutral-500">
                      {tc.adjustment_code || <span className="text-neutral-300">—</span>}
                    </TableCell>
                    <TableCell>
                      <span className={`w-2 h-2 rounded-full inline-block ${tc.is_active ? 'bg-sage-500' : 'bg-neutral-300'}`} />
                    </TableCell>
                    <TableCell className="tabular-nums text-neutral-500">{tc.sort_order}</TableCell>
                    <TableCell className="w-10">
                      <RowMenu
                        onEdit={() => { setEditCode(tc); setModalOpen(true); }}
                        onDelete={() => setDeleteTarget(tc)}
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

      <CodeDrawer
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setEditCode(null); }}
        onSave={editCode ? handleUpdate : handleCreate}
        initial={editCode}
      />

      <ConfirmModal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title={`Delete "${deleteTarget?.code} — ${deleteTarget?.name}"?`}
        description="This transaction code will be permanently deleted and cannot be recovered."
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
      />
    </div>
  );
}
