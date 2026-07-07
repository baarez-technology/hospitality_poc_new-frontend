/**
 * PreAuthHolds — Admin page for managing pre-authorization / card holds.
 * Glimmora Design System v5.0
 */

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Shield, Plus, Ban, CreditCard, MoreHorizontal } from 'lucide-react';
import { preauthService, type AuthorizationHold } from '@/api/services/preauth.service';
import { useToast } from '@/contexts/ToastContext';
import { useCurrency } from '@/hooks/useCurrency';
import {
  Modal, ModalHeader, ModalTitle, ModalDescription, ModalContent, ModalFooter,
  ConfirmModal,
} from '@/components/ui2/Modal';
import { Drawer } from '@/components/ui2/Drawer';
import { Button } from '@/components/ui2/Button';
import { Badge } from '@/components/ui2/Badge';
import { SearchBar } from '@/components/ui2/SearchBar';
import { SimpleDropdown } from '@/components/ui/Select';
import {
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
  TableEmpty, TableSkeleton, Pagination,
} from '@/components/ui2/Table';

/* ── Module-level style constants ─────────────────────────────────────────── */
const inputBase = 'w-full h-9 px-3.5 rounded-lg text-[13px] bg-white border transition-all duration-200 ease-out focus:outline-none';
const inputCls = `${inputBase} border-neutral-200/80 hover:border-terra-300/60 focus:border-terra-400/60 focus:ring-2 focus:ring-terra-500/10 placeholder:text-neutral-400 text-neutral-900`;
const textareaCls = 'w-full px-3.5 py-2.5 rounded-lg text-[13px] bg-white border border-neutral-200/80 hover:border-terra-300/60 focus:border-terra-400/60 focus:ring-2 focus:ring-terra-500/10 focus:outline-none transition-all duration-200 ease-out placeholder:text-neutral-400 text-neutral-900 resize-none';
const labelCls = 'block text-[13px] font-medium text-neutral-700 mb-1';

const CARD_BRAND_OPTIONS = [
  { value: '', label: 'Select brand' },
  { value: 'visa', label: 'Visa' },
  { value: 'mastercard', label: 'Mastercard' },
  { value: 'amex', label: 'Amex' },
  { value: 'rupay', label: 'RuPay' },
];

const STATUS_OPTIONS = [
  { value: 'all', label: 'All Statuses' },
  { value: 'authorized', label: 'Authorized' },
  { value: 'captured', label: 'Captured' },
  { value: 'released', label: 'Released' },
  { value: 'expired', label: 'Expired' },
];

/* ── Status variant helper ───────────────────────────────────────────────── */
function holdStatusVariant(status: string): 'info' | 'success' | 'neutral' | 'danger' {
  switch (status) {
    case 'authorized': return 'info';
    case 'captured': return 'success';
    case 'released': return 'neutral';
    case 'expired': return 'danger';
    default: return 'info';
  }
}

/* ── Hold Row Menu ───────────────────────────────────────────────────────── */
function HoldMenu({ onCapture, onRelease }: { onCapture: () => void; onRelease: () => void }) {
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
            onClick={() => { onCapture(); setOpen(false); }}
          >
            <CreditCard className="w-3.5 h-3.5 text-neutral-400" /> Capture
          </button>
          <div className="h-px bg-neutral-100 mx-2" />
          <button
            className="w-full px-3.5 py-2.5 text-[13px] text-left flex items-center gap-2.5 hover:bg-rose-50 text-rose-600 transition-colors"
            onClick={() => { onRelease(); setOpen(false); }}
          >
            <Ban className="w-3.5 h-3.5" /> Release
          </button>
        </div>
      )}
    </div>
  );
}

/* ── Create Hold Drawer ──────────────────────────────────────────────────── */
function CreateHoldDrawer({ isOpen, onClose, onSave }: {
  isOpen: boolean; onClose: () => void;
  onSave: (data: { booking_id: number; hold_amount?: number; card_last4?: string; card_brand?: string; notes?: string }) => Promise<void>;
}) {
  const [form, setForm] = useState({ booking_id: '', hold_amount: '', card_last4: '', card_brand: '', notes: '' });
  const [saving, setSaving] = useState(false);
  const { error } = useToast();

  useEffect(() => {
    if (isOpen) setForm({ booking_id: '', hold_amount: '', card_last4: '', card_brand: '', notes: '' });
  }, [isOpen]);

  const handleSave = async () => {
    if (!form.booking_id) return;
    setSaving(true);
    try {
      await onSave({
        booking_id: parseInt(form.booking_id),
        hold_amount: form.hold_amount ? parseFloat(form.hold_amount) : undefined,
        card_last4: form.card_last4 || undefined,
        card_brand: form.card_brand || undefined,
        notes: form.notes || undefined,
      });
      onClose();
    } catch (err: any) {
      error(err?.response?.data?.detail || 'Failed to create hold');
    }
    setSaving(false);
  };

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title="New Pre-Authorization Hold"
      subtitle="Create a card hold for a booking reservation"
      maxWidth="max-w-md"
      footer={
        <div className="flex gap-3 w-full">
          <Button variant="ghost" className="flex-1" onClick={onClose}>Cancel</Button>
          <Button
            variant="primary"
            className="flex-1"
            onClick={handleSave}
            disabled={saving || !form.booking_id}
            loading={saving}
          >
            Create Hold
          </Button>
        </div>
      }
    >
      <div className="space-y-6">

        {/* ── Booking ── */}
        <div>
          <p className="text-[11px] font-semibold text-neutral-500 uppercase tracking-widest mb-3.5">Booking</p>
          <div className="space-y-3.5">
            <div>
              <label className={labelCls}>Booking ID <span className="text-rose-400">*</span></label>
              <input
                type="number"
                className={inputCls}
                value={form.booking_id}
                onChange={e => setForm(f => ({ ...f, booking_id: e.target.value }))}
                placeholder="e.g. 42"
              />
            </div>
            <div>
              <label className={labelCls}>
                Hold Amount{' '}
                <span className="text-neutral-400 font-normal">(leave blank for auto-calc)</span>
              </label>
              <input
                type="number"
                step="0.01"
                className={inputCls}
                value={form.hold_amount}
                onChange={e => setForm(f => ({ ...f, hold_amount: e.target.value }))}
                placeholder="Auto-calculated from config"
              />
            </div>
          </div>
        </div>

        {/* ── Card Details ── */}
        <div className="border-t border-neutral-100 pt-5">
          <p className="text-[11px] font-semibold text-neutral-500 uppercase tracking-widest mb-3.5">Card Details</p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Last 4 Digits</label>
              <input
                className={inputCls}
                maxLength={4}
                value={form.card_last4}
                onChange={e => setForm(f => ({ ...f, card_last4: e.target.value }))}
                placeholder="1234"
              />
            </div>
            <div>
              <label className={labelCls}>Card Brand</label>
              <SimpleDropdown
                options={CARD_BRAND_OPTIONS}
                value={form.card_brand}
                onChange={v => setForm(f => ({ ...f, card_brand: v }))}
                triggerClassName="w-full h-9 py-0 text-[13px]"
              />
            </div>
          </div>
        </div>

        {/* ── Notes ── */}
        <div className="border-t border-neutral-100 pt-5">
          <p className="text-[11px] font-semibold text-neutral-500 uppercase tracking-widest mb-3.5">Notes</p>
          <textarea
            className={textareaCls}
            rows={3}
            value={form.notes}
            onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
            placeholder="Optional notes about this hold..."
          />
        </div>

      </div>
    </Drawer>
  );
}

/* ── Capture Modal ───────────────────────────────────────────────────────── */
function CaptureModal({ isOpen, hold, onClose, onCapture }: {
  isOpen: boolean; hold: AuthorizationHold | null; onClose: () => void;
  onCapture: (holdId: number, data: { capture_amount?: number; notes?: string }) => Promise<void>;
}) {
  const [amount, setAmount] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const { error } = useToast();
  const { formatSimple } = useCurrency();

  useEffect(() => {
    if (hold) { setAmount(String(hold.hold_amount)); setNotes(''); }
  }, [hold]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hold) return;
    setSaving(true);
    try {
      await onCapture(hold.id, { capture_amount: parseFloat(amount) || undefined, notes: notes || undefined });
      onClose();
    } catch (err: any) {
      error(err?.response?.data?.detail || 'Capture failed');
    }
    setSaving(false);
  };

  if (!hold) return null;

  return (
    <Modal open={isOpen} onClose={onClose} size="sm">
      <form onSubmit={handleSubmit}>
        <ModalHeader>
          <ModalTitle>Capture Hold</ModalTitle>
          <ModalDescription>
            Auth: {hold.authorization_code} · Max: {formatSimple(hold.hold_amount)}
          </ModalDescription>
        </ModalHeader>
        <ModalContent>
          <div className="space-y-4">
            <div>
              <label className={labelCls}>Capture Amount</label>
              <input
                type="number"
                step="0.01"
                className={inputCls}
                value={amount}
                onChange={e => setAmount(e.target.value)}
                max={hold.hold_amount}
              />
            </div>
            <div>
              <label className={labelCls}>Notes</label>
              <input
                className={inputCls}
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Optional notes..."
              />
            </div>
          </div>
        </ModalContent>
        <ModalFooter>
          <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="primary" disabled={saving} loading={saving}>
            Capture
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  );
}

/* ── Main Page ───────────────────────────────────────────────────────────── */
export default function PreAuthHolds() {
  const [holds, setHolds] = useState<AuthorizationHold[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [createOpen, setCreateOpen] = useState(false);
  const [captureHold, setCaptureHold] = useState<AuthorizationHold | null>(null);
  const [releaseTarget, setReleaseTarget] = useState<AuthorizationHold | null>(null);
  const perPage = 20;
  const { success, error } = useToast();
  const { formatSimple } = useCurrency();

  const fetchHolds = useCallback(async () => {
    setLoading(true);
    try {
      const data = await preauthService.list({
        hold_status: statusFilter !== 'all' ? statusFilter : undefined,
      });
      setHolds(Array.isArray(data) ? data : []);
    } catch {
      error('Failed to load holds');
    }
    setLoading(false);
  }, [statusFilter]);

  useEffect(() => { fetchHolds(); }, [fetchHolds]);

  const filtered = useMemo(() => {
    if (!search.trim()) return holds;
    const q = search.toLowerCase();
    return holds.filter(h =>
      String(h.booking_id).includes(q) ||
      h.authorization_code?.toLowerCase().includes(q) ||
      h.card_last4?.includes(q)
    );
  }, [holds, search]);

  const paged = useMemo(() => filtered.slice((page - 1) * perPage, page * perPage), [filtered, page]);
  const totalPages = Math.ceil(filtered.length / perPage);

  const handleCreate = async (data: Parameters<typeof preauthService.create>[0]) => {
    await preauthService.create(data);
    success('Hold created');
    fetchHolds();
  };

  const handleRelease = async () => {
    if (!releaseTarget) return;
    try {
      await preauthService.release(releaseTarget.id, 'manual_release');
      success('Hold released');
      fetchHolds();
    } catch (err: any) {
      error(err?.response?.data?.detail || 'Release failed');
    }
    setReleaseTarget(null);
  };

  const handleCapture = async (holdId: number, data: { capture_amount?: number; notes?: string }) => {
    await preauthService.capture(holdId, data);
    success('Hold captured');
    fetchHolds();
  };

  const fmtDate = (d: string | null) =>
    d ? new Date(d).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) : '—';

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F9F7F7' }}>
      <div className="px-4 sm:px-6 lg:px-10 py-4 sm:py-6 space-y-4 sm:space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-neutral-900">Pre-Authorization Holds</h1>
            <p className="text-[12px] sm:text-[13px] text-neutral-500 mt-1">
              {filtered.length} hold{filtered.length !== 1 ? 's' : ''}
            </p>
          </div>
          <Button variant="primary" icon={Plus} onClick={() => setCreateOpen(true)}>
            New Hold
          </Button>
        </div>

        {/* Card */}
        <div className="bg-white rounded-[10px] border border-neutral-100 overflow-hidden">

          {/* Filter bar */}
          <div className="px-4 sm:px-6 py-3 border-b border-neutral-100">
            <div className="flex items-center gap-3">
              <div className="flex-1 max-w-xs">
                <SearchBar
                  value={search}
                  onChange={v => { setSearch(v); setPage(1); }}
                  onClear={() => setSearch('')}
                  placeholder="Search by booking, auth code, card..."
                  size="md"
                />
              </div>
              <div className="ml-auto">
                <SimpleDropdown
                  options={STATUS_OPTIONS}
                  value={statusFilter}
                  onChange={v => { setStatusFilter(v); setPage(1); }}
                  triggerClassName="h-9 py-0 text-[13px] min-w-[140px]"
                />
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Booking</TableHead>
                  <TableHead>Auth Code</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Card</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Authorized</TableHead>
                  <TableHead>Expires</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableSkeleton columns={8} rows={5} />
                ) : paged.length === 0 ? (
                  <TableEmpty
                    colSpan={8}
                    icon={Shield}
                    title="No holds found"
                    description={search ? 'Try adjusting your search or filters' : 'Create a new hold to get started'}
                  />
                ) : paged.map(h => (
                  <TableRow key={h.id}>
                    <TableCell className="font-mono font-medium text-neutral-900">#{h.booking_id}</TableCell>
                    <TableCell className="font-mono text-[12px] text-neutral-500">{h.authorization_code || '—'}</TableCell>
                    <TableCell className="font-semibold tabular-nums text-neutral-900">
                      {h.hold_amount != null ? formatSimple(h.hold_amount) : '—'}
                    </TableCell>
                    <TableCell className="text-neutral-600">
                      {h.card_brand && h.card_last4 ? `${h.card_brand} ••${h.card_last4}` : '—'}
                    </TableCell>
                    <TableCell>
                      <Badge variant={holdStatusVariant(h.status)}>{h.status}</Badge>
                    </TableCell>
                    <TableCell className="text-neutral-500 whitespace-nowrap">{fmtDate(h.authorized_at)}</TableCell>
                    <TableCell className="text-neutral-500 whitespace-nowrap">{fmtDate(h.expires_at)}</TableCell>
                    <TableCell className="w-10">
                      {h.status === 'authorized' && (
                        <HoldMenu
                          onCapture={() => setCaptureHold(h)}
                          onRelease={() => setReleaseTarget(h)}
                        />
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {!loading && totalPages > 0 && (
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

        <CreateHoldDrawer isOpen={createOpen} onClose={() => setCreateOpen(false)} onSave={handleCreate} />

        <CaptureModal
          isOpen={!!captureHold}
          hold={captureHold}
          onClose={() => setCaptureHold(null)}
          onCapture={handleCapture}
        />

        <ConfirmModal
          open={!!releaseTarget}
          onClose={() => setReleaseTarget(null)}
          onConfirm={handleRelease}
          variant="danger"
          title="Release Hold?"
          description={releaseTarget
            ? `Release hold ${releaseTarget.authorization_code} (${formatSimple(releaseTarget.hold_amount)})?`
            : ''
          }
          confirmText="Release"
          cancelText="Cancel"
        />

      </div>
    </div>
  );
}
