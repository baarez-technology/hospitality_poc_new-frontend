/**
 * PaymasterAccounts — Holding accounts for disputed charges.
 * Table + detail drawer with postings, transfer to booking, and write-off actions.
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Wallet, Plus, ArrowRight, Trash2, Loader2, Eye,
} from 'lucide-react';
import {
  paymasterService, type PaymasterAccount, type PaymasterPosting,
} from '@/api/services/paymaster.service';
import { useToast } from '@/contexts/ToastContext';
import { useCurrency } from '@/hooks/useCurrency';
import {
  Modal, ModalHeader, ModalTitle, ModalDescription, ModalContent, ModalFooter,
} from '@/components/ui2/Modal';
import { Drawer } from '@/components/ui2/Drawer';
import { Button, IconButton } from '@/components/ui2/Button';
import { Badge } from '@/components/ui2/Badge';
import { SearchBar } from '@/components/ui2/SearchBar';
import { SimpleDropdown } from '@/components/ui/Select';
import {
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
  TableActions, TableEmpty, TableSkeleton, Pagination,
} from '@/components/ui2/Table';

/* ── Module-level style constants ────────────────────────────────────────── */
const inputBase = 'w-full h-9 px-3.5 rounded-lg text-[13px] bg-white border transition-all duration-200 ease-out focus:outline-none';
const inputCls = `${inputBase} border-neutral-200/80 hover:border-terra-300/60 focus:border-terra-400/60 focus:ring-2 focus:ring-terra-500/10 placeholder:text-neutral-400 text-neutral-900`;
const textareaCls = 'w-full px-3.5 py-2.5 rounded-lg text-[13px] bg-white border border-neutral-200/80 hover:border-terra-300/60 focus:border-terra-400/60 focus:ring-2 focus:ring-terra-500/10 focus:outline-none transition-all duration-200 ease-out placeholder:text-neutral-400 text-neutral-900 resize-none';
const labelCls = 'block text-[13px] font-medium text-neutral-700 mb-1';

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

/* ── Status variant helper ───────────────────────────────────────────────── */
function statusVariant(status: string): 'success' | 'neutral' {
  return status === 'active' ? 'success' : 'neutral';
}

/* ── Create Drawer ───────────────────────────────────────────────────────── */
function CreateDrawer({ isOpen, onClose, onSave }: {
  isOpen: boolean; onClose: () => void;
  onSave: (data: { account_name?: string; account_code?: string; notes?: string }) => Promise<void>;
}) {
  const [form, setForm] = useState({ account_name: '', account_code: '', notes: '' });
  const [saving, setSaving] = useState(false);
  const { error } = useToast();

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave({
        account_name: form.account_name || undefined,
        account_code: form.account_code || undefined,
        notes: form.notes || undefined,
      });
      onClose();
      setForm({ account_name: '', account_code: '', notes: '' });
    } catch (err: any) {
      error(err?.response?.data?.detail || 'Failed to create');
    }
    setSaving(false);
  };

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title="New Paymaster Account"
      subtitle="Create a holding account for disputed charges"
      maxWidth="max-w-md"
      footer={
        <div className="flex gap-3 w-full">
          <Button variant="ghost" className="flex-1" onClick={onClose}>Cancel</Button>
          <Button variant="primary" className="flex-1" onClick={handleSave} disabled={saving} loading={saving}>
            {saving ? 'Creating...' : 'Create Account'}
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        <div>
          <label className={labelCls}>Account Name</label>
          <input
            className={inputCls}
            value={form.account_name}
            onChange={e => setForm(f => ({ ...f, account_name: e.target.value }))}
            placeholder="e.g. Disputed Charges Pool"
          />
        </div>
        <div>
          <label className={labelCls}>Account Code</label>
          <input
            className={inputCls}
            value={form.account_code}
            onChange={e => setForm(f => ({ ...f, account_code: e.target.value }))}
            placeholder="Optional code"
          />
        </div>
        <div>
          <label className={labelCls}>Notes</label>
          <textarea
            className={textareaCls}
            rows={4}
            value={form.notes}
            onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
            placeholder="Optional notes..."
          />
        </div>
      </div>
    </Drawer>
  );
}

/* ── Transfer Modal ──────────────────────────────────────────────────────── */
function TransferModal({ isOpen, onClose, postings, onSave }: {
  isOpen: boolean; onClose: () => void;
  postings: PaymasterPosting[];
  onSave: (data: { posting_ids: number[]; target_booking_id: number; notes?: string }) => Promise<void>;
}) {
  const [bookingId, setBookingId] = useState('');
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const { error } = useToast();
  const { formatSimple } = useCurrency();

  const chargePostings = postings.filter(p => p.posting_type === 'charge_in');

  const togglePosting = (id: number) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingId || selectedIds.length === 0) return;
    setSaving(true);
    try {
      await onSave({ posting_ids: selectedIds, target_booking_id: parseInt(bookingId), notes: notes || undefined });
      onClose();
      setBookingId('');
      setSelectedIds([]);
      setNotes('');
    } catch (err: any) {
      error(err?.response?.data?.detail || 'Transfer failed');
    }
    setSaving(false);
  };

  return (
    <Modal open={isOpen} onClose={onClose} size="lg">
      <form onSubmit={handleSubmit}>
        <ModalHeader>
          <ModalTitle>Transfer to Booking</ModalTitle>
          <ModalDescription>Select postings and transfer them to a guest booking</ModalDescription>
        </ModalHeader>
        <ModalContent>
          <div className="space-y-4">
            <div>
              <label className={labelCls}>Target Booking ID *</label>
              <input type="number" value={bookingId} onChange={e => setBookingId(e.target.value)}
                className={inputCls} placeholder="Enter booking ID" required />
            </div>
            <div>
              <label className={labelCls}>Select Postings to Transfer</label>
              {chargePostings.length === 0 ? (
                <div className="mt-1 flex items-center justify-center py-6 bg-neutral-50 rounded-lg border border-neutral-100">
                  <p className="text-[13px] text-neutral-400">No charge postings available</p>
                </div>
              ) : (
                <div className="space-y-1.5 max-h-[200px] overflow-y-auto mt-1 pr-0.5">
                  {chargePostings.map(p => (
                    <label
                      key={p.id}
                      className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg cursor-pointer border transition-all duration-150 ${
                        selectedIds.includes(p.id)
                          ? 'bg-terra-50 border-terra-200'
                          : 'bg-neutral-50 border-transparent hover:bg-neutral-100 hover:border-neutral-200'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(p.id)}
                        onChange={() => togglePosting(p.id)}
                        className="w-4 h-4 rounded border-neutral-300 text-terra-600 focus:ring-terra-500"
                      />
                      <span className="text-[13px] text-neutral-700 flex-1 truncate">{p.description}</span>
                      <span className="text-[13px] font-semibold text-neutral-900 tabular-nums flex-shrink-0">{formatSimple(p.amount)}</span>
                    </label>
                  ))}
                </div>
              )}
              {selectedIds.length > 0 && (
                <p className="text-[11px] text-terra-600 mt-1.5 font-medium">{selectedIds.length} posting{selectedIds.length > 1 ? 's' : ''} selected</p>
              )}
            </div>
            <div>
              <label className={labelCls}>Notes</label>
              <textarea value={notes} onChange={e => setNotes(e.target.value)}
                className={textareaCls} rows={2} placeholder="Optional transfer notes..." />
            </div>
          </div>
        </ModalContent>
        <ModalFooter>
          <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="primary" disabled={saving || selectedIds.length === 0} loading={saving}>
            {saving ? 'Transferring...' : 'Transfer'}
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  );
}

/* ── Write Off Modal ─────────────────────────────────────────────────────── */
function WriteOffModal({ isOpen, onClose, onSave }: {
  isOpen: boolean; onClose: () => void;
  onSave: (amount: number, reason: string) => Promise<void>;
}) {
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');
  const [saving, setSaving] = useState(false);
  const { error } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !reason) return;
    setSaving(true);
    try {
      await onSave(parseFloat(amount), reason);
      onClose();
      setAmount('');
      setReason('');
    } catch (err: any) {
      error(err?.response?.data?.detail || 'Write-off failed');
    }
    setSaving(false);
  };

  return (
    <Modal open={isOpen} onClose={onClose} size="md">
      <form onSubmit={handleSubmit}>
        <ModalHeader>
          <ModalTitle>Write Off</ModalTitle>
          <ModalDescription>Write off an amount from this paymaster account</ModalDescription>
        </ModalHeader>
        <ModalContent>
          <div className="space-y-4">
            <div>
              <label className={labelCls}>Amount *</label>
              <input type="number" min={0} step={0.01} value={amount}
                onChange={e => setAmount(e.target.value)} className={inputCls}
                placeholder="0.00" required />
            </div>
            <div>
              <label className={labelCls}>Reason *</label>
              <textarea value={reason} onChange={e => setReason(e.target.value)}
                className={textareaCls} rows={3}
                placeholder="Reason for write-off..." required />
            </div>
          </div>
        </ModalContent>
        <ModalFooter>
          <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="danger" disabled={saving} loading={saving}>
            {saving ? 'Writing off...' : 'Write Off'}
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  );
}

/* ── Detail Drawer ───────────────────────────────────────────────────────── */
function DetailDrawer({ account, onClose, onRefresh }: {
  account: PaymasterAccount; onClose: () => void; onRefresh: () => void;
}) {
  const [postings, setPostings] = useState<PaymasterPosting[]>([]);
  const [loadingPostings, setLoadingPostings] = useState(true);
  const [transferOpen, setTransferOpen] = useState(false);
  const [writeOffOpen, setWriteOffOpen] = useState(false);
  const { success } = useToast();
  const { formatSimple } = useCurrency();

  useEffect(() => {
    setLoadingPostings(true);
    paymasterService.getPostings(account.id, { limit: 100 })
      .then(data => setPostings(data?.items || data || []))
      .catch(() => {})
      .finally(() => setLoadingPostings(false));
  }, [account.id]);

  const handleTransfer = async (data: any) => {
    await paymasterService.transferToBooking(account.id, data);
    success('Transfer completed');
    onRefresh();
  };

  const handleWriteOff = async (amount: number, reason: string) => {
    await paymasterService.writeOff(account.id, amount, reason);
    success('Write-off recorded');
    onRefresh();
  };

  return (
    <>
      <Drawer
        isOpen={true}
        onClose={onClose}
        title={account.account_name || 'Paymaster Account'}
        subtitle={account.account_code || `#${account.id}`}
        maxWidth="max-w-lg"
        footer={
          account.status === 'active' ? (
            <div className="flex gap-3 w-full">
              <Button variant="outline" className="flex-1" icon={ArrowRight} onClick={() => setTransferOpen(true)}>
                Transfer to Booking
              </Button>
              <Button variant="danger" className="flex-1" icon={Trash2} onClick={() => setWriteOffOpen(true)}>
                Write Off
              </Button>
            </div>
          ) : undefined
        }
      >
        <div className="space-y-5">
          {/* Summary */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-neutral-50 rounded-lg p-3 text-center">
              <p className="text-[11px] text-neutral-500 mb-0.5">Total Charges</p>
              <p className="text-[14px] font-bold text-neutral-900 tabular-nums">{formatSimple(account.total_charges)}</p>
            </div>
            <div className="bg-neutral-50 rounded-lg p-3 text-center">
              <p className="text-[11px] text-neutral-500 mb-0.5">Transferred</p>
              <p className="text-[14px] font-bold text-neutral-900 tabular-nums">{formatSimple(account.total_transferred)}</p>
            </div>
            <div className="bg-neutral-50 rounded-lg p-3 text-center">
              <p className="text-[11px] text-neutral-500 mb-0.5">Balance</p>
              <p className={`text-[14px] font-bold tabular-nums ${account.current_balance > 0 ? 'text-gold-600' : 'text-sage-600'}`}>
                {formatSimple(account.current_balance)}
              </p>
            </div>
          </div>

          {account.notes && (
            <div className="text-[13px] text-neutral-600 bg-neutral-50 rounded-lg px-3.5 py-3 border border-neutral-100">
              {account.notes}
            </div>
          )}

          {/* Postings */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-[11px] font-semibold text-neutral-400 uppercase tracking-widest">Postings</h3>
              <span className="text-[11px] text-neutral-400">{Array.isArray(postings) ? postings.length : 0} items</span>
            </div>
            {loadingPostings ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-5 h-5 animate-spin text-terra-400" />
              </div>
            ) : !Array.isArray(postings) || postings.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 bg-neutral-50 rounded-lg border border-neutral-100">
                <p className="text-[13px] text-neutral-400">No postings yet</p>
              </div>
            ) : (
              <div className="space-y-1.5 max-h-[300px] overflow-y-auto pr-0.5">
                {postings.map((p: PaymasterPosting) => (
                  <div key={p.id} className="flex items-center justify-between px-3.5 py-2.5 bg-neutral-50 rounded-lg border border-neutral-100">
                    <div className="flex-1 min-w-0 mr-3">
                      <p className="text-[13px] font-medium text-neutral-800 truncate">{p.description}</p>
                      <p className="text-[11px] text-neutral-400 mt-0.5">
                        {p.posting_type} · {formatDate(p.posted_at)}
                        {p.source_booking_id ? ` · Booking #${p.source_booking_id}` : ''}
                      </p>
                    </div>
                    <span className={`text-[13px] font-semibold tabular-nums flex-shrink-0 ${
                      p.posting_type === 'charge_in' ? 'text-rose-600' : 'text-sage-600'
                    }`}>
                      {p.posting_type === 'charge_in' ? '+' : '-'}{formatSimple(p.amount)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </Drawer>

      <TransferModal
        isOpen={transferOpen}
        onClose={() => setTransferOpen(false)}
        postings={Array.isArray(postings) ? postings : []}
        onSave={handleTransfer}
      />
      <WriteOffModal
        isOpen={writeOffOpen}
        onClose={() => setWriteOffOpen(false)}
        onSave={handleWriteOff}
      />
    </>
  );
}

/* ── Main Page ───────────────────────────────────────────────────────────── */
export default function PaymasterAccounts() {
  const [accounts, setAccounts] = useState<PaymasterAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [createOpen, setCreateOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<PaymasterAccount | null>(null);
  const perPage = 15;
  const { success, error } = useToast();
  const { formatSimple } = useCurrency();

  const fetchAccounts = useCallback(async () => {
    setLoading(true);
    try {
      const data = await paymasterService.listAccounts({
        status: statusFilter !== 'all' ? statusFilter : undefined,
        limit: 200,
      });
      setAccounts(Array.isArray(data) ? data : []);
    } catch {
      error('Failed to load paymaster accounts');
    }
    setLoading(false);
  }, [statusFilter]);

  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  const filtered = useMemo(() => {
    if (!search.trim()) return accounts;
    const q = search.toLowerCase();
    return accounts.filter(a =>
      (a.account_name || '').toLowerCase().includes(q) ||
      (a.account_code || '').toLowerCase().includes(q) ||
      String(a.id).includes(q)
    );
  }, [accounts, search]);

  const paged = useMemo(() => {
    const start = (page - 1) * perPage;
    return filtered.slice(start, start + perPage);
  }, [filtered, page]);
  const totalPages = Math.ceil(filtered.length / perPage);

  const handleCreate = async (data: any) => {
    await paymasterService.createAccount(data);
    success('Account created');
    fetchAccounts();
  };

  const handleRefreshFromDrawer = () => {
    fetchAccounts();
    setSelectedAccount(null);
  };

  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'active', label: 'Active' },
    { value: 'closed', label: 'Closed' },
  ];

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F9F7F7' }}>
      <div className="px-4 sm:px-6 lg:px-10 py-4 sm:py-6 space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-neutral-900">Paymaster Accounts</h1>
            <p className="text-[12px] sm:text-[13px] text-neutral-500 mt-1">
              {accounts.length} account{accounts.length !== 1 ? 's' : ''} total
            </p>
          </div>
          <Button variant="primary" icon={Plus} onClick={() => setCreateOpen(true)}>
            New Account
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
                  onChange={setSearch}
                  onClear={() => setSearch('')}
                  placeholder="Search accounts..."
                  size="md"
                />
              </div>
              <div className="ml-auto">
                <SimpleDropdown
                  options={statusOptions}
                  value={statusFilter}
                  onChange={v => { setStatusFilter(v); setPage(1); }}
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
                  <TableHead>Account Name</TableHead>
                  <TableHead>Total Charges</TableHead>
                  <TableHead>Transferred</TableHead>
                  <TableHead>Balance</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableSkeleton columns={8} rows={5} />
                ) : paged.length === 0 ? (
                  <TableEmpty
                    colSpan={8}
                    icon={Wallet}
                    title="No paymaster accounts found"
                    description={search ? 'Try adjusting your search or filters' : 'Create a new account to get started'}
                  />
                ) : paged.map(acct => (
                  <TableRow key={acct.id}>
                    <TableCell className="font-mono text-neutral-600">{acct.account_code || `#${acct.id}`}</TableCell>
                    <TableCell className="font-medium text-neutral-900">{acct.account_name || '—'}</TableCell>
                    <TableCell className="tabular-nums">{formatSimple(acct.total_charges)}</TableCell>
                    <TableCell className="tabular-nums">{formatSimple(acct.total_transferred)}</TableCell>
                    <TableCell>
                      <span className={`font-medium tabular-nums ${acct.current_balance > 0 ? 'text-gold-600' : 'text-sage-600'}`}>
                        {formatSimple(acct.current_balance)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusVariant(acct.status)}>{acct.status}</Badge>
                    </TableCell>
                    <TableCell className="text-neutral-500">{formatDate(acct.created_at)}</TableCell>
                    <TableActions sticky>
                      <IconButton
                        icon={Eye}
                        label="View"
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedAccount(acct)}
                      />
                    </TableActions>
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

        <CreateDrawer isOpen={createOpen} onClose={() => setCreateOpen(false)} onSave={handleCreate} />

        {selectedAccount && (
          <DetailDrawer
            account={selectedAccount}
            onClose={() => setSelectedAccount(null)}
            onRefresh={handleRefreshFromDrawer}
          />
        )}
      </div>
    </div>
  );
}
