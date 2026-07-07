/**
 * ARLedger — Accounts Receivable Ledger page.
 * Glimmora Design System v5.0
 */

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Receipt, DollarSign, FileText, RefreshCw,
  Loader2, AlertTriangle, Building2,
} from 'lucide-react';
import { arService, type ARAccount, type ARPosting, type AgingBucket } from '@/api/services/ar.service';
import { useCurrency } from '@/hooks/useCurrency';
import { useToast } from '@/contexts/ToastContext';

// UI2 Components
import { Modal, ModalHeader, ModalTitle, ModalDescription, ModalContent, ModalFooter } from '@/components/ui2/Modal';
import { Button } from '@/components/ui2/Button';
import { Badge } from '@/components/ui2/Badge';
import {
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell, TableEmpty, TableSkeleton,
} from '@/components/ui2/Table';
import { SimpleDropdown } from '@/components/ui/Select';

// ── Posting badge mapping ───────────────────────────────────────────────────
const POSTING_VARIANT: Record<string, 'danger' | 'success' | 'info' | 'warning'> = {
  charge: 'danger',
  payment: 'success',
  credit_note: 'info',
  adjustment: 'warning',
};
const POSTING_LABEL: Record<string, string> = {
  charge: 'Charge', payment: 'Payment', credit_note: 'Credit Note', adjustment: 'Adjustment',
};

// ── Helpers ─────────────────────────────────────────────────────────────────
function formatDate(dateStr: string | null) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

// ── Input styles ────────────────────────────────────────────────────────────
const inputBase = 'w-full h-9 px-3.5 rounded-lg text-[13px] bg-white border transition-all duration-200 ease-out focus:outline-none';
const inputCls = `${inputBase} border-neutral-200/80 hover:border-terra-300/60 focus:border-terra-400/60 focus:ring-2 focus:ring-terra-500/10 placeholder:text-neutral-400 text-neutral-900`;
const labelCls = 'block text-[13px] font-medium text-neutral-700 mb-1';

// ── Payment method options ───────────────────────────────────────────────────
const PAYMENT_OPTIONS = [
  { value: 'bank_transfer', label: 'Bank Transfer' },
  { value: 'cheque', label: 'Cheque' },
  { value: 'cash', label: 'Cash' },
  { value: 'card', label: 'Card' },
];

// ── Payment Modal ───────────────────────────────────────────────────────────
function PaymentModal({ isOpen, onClose, accountId, onSuccess, mode }: {
  isOpen: boolean; onClose: () => void; accountId: number; onSuccess: () => void;
  mode: 'payment' | 'credit_note';
}) {
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('bank_transfer');
  const [reference, setReference] = useState('');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);
  const { success, error: showError } = useToast();

  useEffect(() => {
    if (isOpen) { setAmount(''); setMethod('bank_transfer'); setReference(''); setDescription(''); }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(amount);
    if (!amt || amt <= 0) { showError('Enter a valid amount'); return; }
    setSaving(true);
    try {
      if (mode === 'payment') {
        await arService.postPayment(accountId, { amount: amt, payment_method: method, reference_number: reference || undefined });
        success(`Payment of ${amt.toFixed(2)} recorded`);
      } else {
        await arService.creditNote(accountId, { amount: amt, description: description || 'Credit note', reference_number: reference || undefined });
        success(`Credit note of ${amt.toFixed(2)} issued`);
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      showError(err?.response?.data?.detail || 'Failed');
    }
    setSaving(false);
  };

  return (
    <Modal open={isOpen} onClose={onClose} size="md">
      <ModalHeader>
        <ModalTitle>{mode === 'payment' ? 'Record Payment' : 'Issue Credit Note'}</ModalTitle>
        <ModalDescription>{mode === 'payment' ? 'Record an incoming payment' : 'Issue a credit note for this account'}</ModalDescription>
      </ModalHeader>
      <form onSubmit={handleSubmit}>
        <ModalContent>
          <div className="space-y-4">
            <div>
              <label className={labelCls}>Amount *</label>
              <input className={inputCls} type="number" min={0} step={0.01} value={amount} onChange={e => setAmount(e.target.value)} required autoFocus />
            </div>
            {mode === 'payment' && (
              <div>
                <label className={labelCls}>Payment Method</label>
                <SimpleDropdown
                  value={method}
                  onChange={setMethod}
                  options={PAYMENT_OPTIONS}
                  triggerClassName="h-9 py-0 text-[13px]"
                />
              </div>
            )}
            {mode === 'credit_note' && (
              <div>
                <label className={labelCls}>Description *</label>
                <input className={inputCls} value={description} onChange={e => setDescription(e.target.value)} required />
              </div>
            )}
            <div>
              <label className={labelCls}>Reference #</label>
              <input className={inputCls} value={reference} onChange={e => setReference(e.target.value)} placeholder="Invoice/receipt number" />
            </div>
          </div>
        </ModalContent>
        <ModalFooter>
          <Button variant="ghost" type="button" onClick={onClose}>Cancel</Button>
          <Button variant="primary" type="submit" loading={saving}>
            {mode === 'payment' ? 'Record Payment' : 'Issue Credit'}
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  );
}

// ── Main Page ───────────────────────────────────────────────────────────────
export default function ARLedger() {
  const { formatCurrency } = useCurrency();
  const { error: showError } = useToast();
  const [searchParams] = useSearchParams();
  const corpFilter = searchParams.get('corporate');

  const [accounts, setAccounts] = useState<ARAccount[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [selectedAccount, setSelectedAccount] = useState<ARAccount | null>(null);
  const [postings, setPostings] = useState<ARPosting[]>([]);
  const [aging, setAging] = useState<{ items: AgingBucket[]; totals: any } | null>(null);
  const [loading, setLoading] = useState(true);
  const [ledgerLoading, setLedgerLoading] = useState(false);

  const [paymentModal, setPaymentModal] = useState(false);
  const [creditModal, setCreditModal] = useState(false);

  const fetchAccounts = useCallback(async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (corpFilter) params.corporate_account_id = parseInt(corpFilter);
      const res = await arService.listAccounts(params);
      const list: ARAccount[] = res.accounts || [];
      setAccounts(list);
      if (list.length > 0 && !selectedId) setSelectedId(list[0].id);
    } catch {
      showError('Failed to load AR accounts');
    }
    setLoading(false);
  }, [corpFilter]);

  const fetchLedger = useCallback(async () => {
    if (!selectedId) return;
    setLedgerLoading(true);
    try {
      const [acctRes, ledgerRes] = await Promise.all([
        arService.getAccount(selectedId),
        arService.getLedger(selectedId, { limit: 200 }),
      ]);
      setSelectedAccount(acctRes.account || null);
      setPostings(ledgerRes.postings || []);
    } catch {
      showError('Failed to load ledger');
    }
    setLedgerLoading(false);
  }, [selectedId]);

  const fetchAging = useCallback(async () => {
    try {
      const res = await arService.getAgingReport();
      setAging(res.aging_report || null);
    } catch {}
  }, []);

  useEffect(() => { fetchAccounts(); fetchAging(); }, [fetchAccounts, fetchAging]);
  useEffect(() => { fetchLedger(); }, [fetchLedger]);

  const refresh = () => { fetchAccounts(); fetchLedger(); fetchAging(); };

  // Initial full-page loading
  if (loading && accounts.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#F9F7F7' }}>
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-7 h-7 animate-spin text-terra-500" />
          <p className="text-[13px] text-neutral-500 animate-pulse">Loading AR ledger...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F9F7F7' }}>
      <div className="px-4 sm:px-6 lg:px-10 py-4 sm:py-6 space-y-4 sm:space-y-6">

        {/* ─── Header ─────────────────────────────────────────────────────── */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-neutral-900">AR Ledger</h1>
            <p className="text-[12px] sm:text-[13px] text-neutral-500 mt-1">
              Track accounts receivable, postings and payment collections
            </p>
          </div>
          <Button variant="outline" icon={RefreshCw} onClick={refresh} className="w-full sm:w-auto">
            Refresh
          </Button>
        </header>

        {/* ─── Aging Report Summary ────────────────────────────────────────── */}
        {aging && aging.totals && aging.totals.total > 0 && (
          <div className="bg-white rounded-[10px] border border-neutral-100 p-4 sm:p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-1.5 h-1.5 rounded-full bg-terra-500" />
              <h2 className="text-[11px] font-semibold text-neutral-500 uppercase tracking-widest">AR Aging Summary</h2>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
              {[
                { label: 'Current', value: aging.totals.current, color: 'text-sage-600', bg: 'bg-sage-50' },
                { label: '1–30 days', value: aging.totals.days_30, color: 'text-ocean-600', bg: 'bg-ocean-50' },
                { label: '31–60 days', value: aging.totals.days_60, color: 'text-gold-600', bg: 'bg-gold-50' },
                { label: '61–90 days', value: aging.totals.days_90, color: 'text-terra-600', bg: 'bg-terra-50' },
                { label: '90+ days', value: aging.totals.days_90_plus, color: 'text-rose-600', bg: 'bg-rose-50' },
                { label: 'Total', value: aging.totals.total, color: 'text-neutral-900', bg: 'bg-neutral-100' },
              ].map(b => (
                <div key={b.label} className={`${b.bg} rounded-lg p-3 text-center`}>
                  <p className="text-[11px] font-medium text-neutral-500 mb-0.5">{b.label}</p>
                  <p className={`text-[13px] font-semibold ${b.color}`}>{formatCurrency(b.value)}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ─── Two-Panel Layout ────────────────────────────────────────────── */}
        <div className="flex flex-col lg:flex-row gap-4 sm:gap-5">

          {/* Left: Account List — stretches to match right panel */}
          <div className="w-full lg:w-[270px] lg:flex-shrink-0">
            <div className="bg-white rounded-[10px] border border-neutral-100 h-full flex flex-col overflow-hidden">
              <div className="px-4 py-3 border-b border-neutral-100 bg-neutral-50/30 flex-shrink-0">
                <div className="flex items-center justify-between">
                  <h3 className="text-[11px] font-semibold text-neutral-500 uppercase tracking-widest">AR Accounts</h3>
                  {accounts.length > 0 && (
                    <span className="text-[11px] font-medium text-neutral-400">{accounts.length}</span>
                  )}
                </div>
              </div>
              {loading ? (
                <div className="flex-1 flex items-center justify-center py-12">
                  <div className="flex flex-col items-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin text-terra-500" />
                    <p className="text-[12px] text-neutral-400">Loading accounts...</p>
                  </div>
                </div>
              ) : accounts.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center gap-3 py-8">
                  <div className="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-neutral-400" />
                  </div>
                  <p className="text-[13px] text-neutral-400">No AR accounts found</p>
                </div>
              ) : (
                <div className="flex-1 divide-y divide-neutral-100 overflow-y-auto">
                  {accounts.map(a => (
                    <button
                      key={a.id}
                      onClick={() => setSelectedId(a.id)}
                      className={`w-full px-4 py-3.5 text-left transition-colors border-l-2 ${
                        selectedId === a.id
                          ? 'bg-terra-50/60 border-l-terra-500'
                          : 'hover:bg-neutral-50 border-l-transparent'
                      }`}
                    >
                      <p className="text-[13px] font-medium text-neutral-900 leading-tight">{a.account_name}</p>
                      <div className="flex items-center justify-between mt-1.5">
                        <span className="text-[11px] text-neutral-400 font-mono tracking-wide">{a.account_number}</span>
                        <span className={`text-[12px] font-semibold tabular-nums ${a.current_balance > 0 ? 'text-gold-600' : 'text-sage-600'}`}>
                          {formatCurrency(a.current_balance)}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right: Ledger View */}
          <div className="flex-1 min-w-0">
            {!selectedId ? (
              <div className="bg-white rounded-[10px] border border-neutral-100 flex flex-col items-center justify-center py-20 gap-3">
                <div className="w-12 h-12 rounded-full bg-neutral-100 flex items-center justify-center">
                  <Receipt className="w-6 h-6 text-neutral-400" />
                </div>
                <p className="text-[13px] text-neutral-400">Select an AR account to view its ledger</p>
              </div>
            ) : (
              <div className="space-y-4">

                {/* Account Summary */}
                {selectedAccount && (
                  <div className="bg-white rounded-[10px] border border-neutral-100 p-4 sm:p-5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                      <div>
                        <h2 className="text-[15px] font-semibold text-neutral-900">{selectedAccount.account_name}</h2>
                        <p className="text-[12px] text-neutral-500 mt-0.5">{selectedAccount.account_number}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" icon={DollarSign} onClick={() => setPaymentModal(true)}>
                          Record Payment
                        </Button>
                        <Button variant="outline" size="sm" icon={FileText} onClick={() => setCreditModal(true)}>
                          Credit Note
                        </Button>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div className="bg-neutral-50 rounded-lg p-3">
                        <p className="text-[11px] text-neutral-500 font-medium mb-0.5">Balance</p>
                        <p className={`text-[15px] font-semibold ${selectedAccount.current_balance > 0 ? 'text-gold-600' : 'text-sage-600'}`}>
                          {formatCurrency(selectedAccount.current_balance)}
                        </p>
                      </div>
                      <div className="bg-neutral-50 rounded-lg p-3">
                        <p className="text-[11px] text-neutral-500 font-medium mb-0.5">Credit Limit</p>
                        <p className="text-[15px] font-semibold text-neutral-900">{formatCurrency(selectedAccount.credit_limit)}</p>
                      </div>
                      <div className="bg-neutral-50 rounded-lg p-3">
                        <p className="text-[11px] text-neutral-500 font-medium mb-0.5">Available</p>
                        <p className="text-[15px] font-semibold text-sage-600">{formatCurrency(selectedAccount.available_credit)}</p>
                      </div>
                      <div className="bg-neutral-50 rounded-lg p-3">
                        <p className="text-[11px] text-neutral-500 font-medium mb-0.5">Terms</p>
                        <p className="text-[15px] font-semibold text-neutral-900">{selectedAccount.payment_terms_days}d</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Ledger Table */}
                <div className="bg-white rounded-[10px] border border-neutral-100 overflow-hidden">
                  <div className="px-4 sm:px-6 py-3 border-b border-neutral-100 bg-neutral-50/30 flex items-center justify-between">
                    <h3 className="text-[11px] font-semibold text-neutral-500 uppercase tracking-widest">Ledger Postings</h3>
                    {postings.length > 0 && (
                      <span className="text-[11px] text-neutral-400 font-medium">{postings.length} entries</span>
                    )}
                  </div>

                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Description</TableHead>
                          <TableHead>Booking</TableHead>
                          <TableHead align="right">Debit</TableHead>
                          <TableHead align="right">Credit</TableHead>
                          <TableHead align="right">Balance</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {ledgerLoading ? (
                          <TableSkeleton columns={8} rows={5} />
                        ) : postings.length === 0 ? (
                          <TableEmpty
                            colSpan={8}
                            icon={Receipt}
                            title="No postings yet"
                            description="Postings will appear here once transactions are recorded"
                          />
                        ) : postings.map(p => {
                          const isDebit = p.amount > 0;
                          return (
                            <TableRow key={p.id}>
                              <TableCell className="text-neutral-600 whitespace-nowrap">
                                {formatDate(p.posted_at)}
                              </TableCell>
                              <TableCell>
                                <Badge variant={POSTING_VARIANT[p.posting_type] || 'neutral'}>
                                  {POSTING_LABEL[p.posting_type] || p.posting_type}
                                </Badge>
                              </TableCell>
                              <TableCell className="min-w-[140px]">
                                <span className="block max-w-[220px] truncate text-neutral-700 text-[13px]" title={p.description}>
                                  {p.description}
                                </span>
                              </TableCell>
                              <TableCell className="text-neutral-500 whitespace-nowrap font-mono text-[12px]">
                                {p.booking_id ? `#${p.booking_id}` : <span className="text-neutral-300">—</span>}
                              </TableCell>
                              <TableCell className="whitespace-nowrap tabular-nums text-right font-medium text-rose-600">
                                {isDebit ? formatCurrency(p.amount) : <span className="text-neutral-300">—</span>}
                              </TableCell>
                              <TableCell className="whitespace-nowrap tabular-nums text-right font-medium text-sage-600">
                                {!isDebit ? formatCurrency(Math.abs(p.amount)) : <span className="text-neutral-300">—</span>}
                              </TableCell>
                              <TableCell className="whitespace-nowrap tabular-nums text-right font-semibold text-neutral-800">
                                {formatCurrency(p.balance_after)}
                              </TableCell>
                              <TableCell>
                                <Badge
                                  variant={p.status === 'paid' ? 'success' : p.status === 'overdue' ? 'danger' : 'warning'}
                                  dot
                                >
                                  {p.status}
                                </Badge>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                </div>

              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      {selectedId && (
        <>
          <PaymentModal isOpen={paymentModal} onClose={() => setPaymentModal(false)} accountId={selectedId} onSuccess={refresh} mode="payment" />
          <PaymentModal isOpen={creditModal} onClose={() => setCreditModal(false)} accountId={selectedId} onSuccess={refresh} mode="credit_note" />
        </>
      )}
    </div>
  );
}
