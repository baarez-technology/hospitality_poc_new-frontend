/**
 * CashierSessions — Cash register management with open/close/record actions.
 * Structured table with KPI cards, date & status filters, variance detection.
 */

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  Banknote, Plus, AlertTriangle, CheckCircle2, DollarSign,
  Loader2, ArrowUpRight, ArrowDownRight, Lock, MoreHorizontal,
} from 'lucide-react';
import { cashierSessionService, type CashierSession } from '@/api/services/cashier-session.service';
import { useToast } from '@/contexts/ToastContext';
import { useCurrency } from '@/hooks/useCurrency';
import {
  Modal, ModalHeader, ModalTitle, ModalDescription, ModalContent, ModalFooter,
} from '@/components/ui2/Modal';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { Button } from '@/components/ui2/Button';
import { Badge } from '@/components/ui2/Badge';
import {
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
  TableEmpty, TableSkeleton, Pagination,
} from '@/components/ui2/Table';
import { SimpleDropdown } from '@/components/ui/Select';
import DatePicker from '@/components/ui2/DatePicker';
import { SearchBar } from '@/components/ui2/SearchBar';

/* ── Shared styling ────────────────────────────────────────────────────────── */
const inputBase = 'w-full h-9 px-3.5 rounded-lg text-[13px] bg-white border transition-all duration-200 ease-out focus:outline-none';
const inputCls = `${inputBase} border-neutral-200/80 hover:border-terra-300/60 focus:border-terra-400/60 focus:ring-2 focus:ring-terra-500/10 placeholder:text-neutral-400 text-neutral-900`;
const textareaCls = 'w-full px-3.5 py-2.5 rounded-lg text-[13px] bg-white border border-neutral-200/80 hover:border-terra-300/60 focus:border-terra-400/60 focus:ring-2 focus:ring-terra-500/10 focus:outline-none transition-all duration-200 ease-out placeholder:text-neutral-400 text-neutral-900 resize-none';
const labelCls = 'block text-[13px] font-medium text-neutral-700 mb-1';

/* ── Helpers ───────────────────────────────────────────────────────────────── */
function sessionStatusVariant(status: string): 'success' | 'neutral' | 'danger' {
  switch (status) {
    case 'open': return 'success';
    case 'closed': return 'neutral';
    case 'variance_flagged': return 'danger';
    default: return 'neutral';
  }
}

function formatStatus(status: string) {
  return status.replace(/_/g, ' ');
}

function formatDate(dateStr: string) {
  if (!dateStr) return '—';
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

/* ── Session Row Menu ────────────────────────────────────────────────────── */
function SessionMenu({ s, onRecord, onClose }: {
  s: { status: string };
  onRecord: () => void;
  onClose: () => void;
}) {
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

  if (s.status !== 'open') return null;

  return (
    <div className="relative flex justify-end" ref={ref}>
      <button
        className="w-7 h-7 rounded-md flex items-center justify-center text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 transition-colors"
        onClick={e => { e.stopPropagation(); setOpen(v => !v); }}
      >
        <MoreHorizontal className="w-4 h-4" />
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 z-50 w-44 bg-white rounded-xl border border-neutral-200 shadow-lg overflow-hidden">
          <button
            className="w-full px-3.5 py-2.5 text-[13px] text-left flex items-center gap-2.5 hover:bg-neutral-50 text-neutral-700 transition-colors"
            onClick={() => { onRecord(); setOpen(false); }}
          >
            <Banknote className="w-3.5 h-3.5 text-neutral-400" /> Record Cash
          </button>
          <div className="h-px bg-neutral-100 mx-2" />
          <button
            className="w-full px-3.5 py-2.5 text-[13px] text-left flex items-center gap-2.5 hover:bg-rose-50 text-rose-600 transition-colors"
            onClick={() => { onClose(); setOpen(false); }}
          >
            <Lock className="w-3.5 h-3.5" /> Close Session
          </button>
        </div>
      )}
    </div>
  );
}

/* ── Main Page ───────────────────────────────────────────────────────────── */
export default function CashierSessions() {
  const [sessions, setSessions] = useState<CashierSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const perPage = 15;
  const { success, error } = useToast();
  const { formatSimple } = useCurrency();

  // Drawer / Modal state
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [recordSession, setRecordSession] = useState<CashierSession | null>(null);
  const [closeSession, setCloseSession] = useState<CashierSession | null>(null);

  // Open Session drawer form state
  const [openBalance, setOpenBalance] = useState(0);
  const [openNotes, setOpenNotes] = useState('');
  const [openSaving, setOpenSaving] = useState(false);

  // Record Cash modal form state
  const [recordAmount, setRecordAmount] = useState(0);
  const [recordSaving, setRecordSaving] = useState(false);

  // Close Session modal form state
  const [closingBalance, setClosingBalance] = useState(0);
  const [closeNotes, setCloseNotes] = useState('');
  const [closeSaving, setCloseSaving] = useState(false);

  const fetchSessions = useCallback(async () => {
    setLoading(true);
    try {
      const data = await cashierSessionService.list({
        status: statusFilter !== 'all' ? statusFilter : undefined,
        session_date: dateFilter || undefined,
        limit: 200,
      });
      setSessions(Array.isArray(data) ? data : []);
    } catch {
      error('Failed to load cashier sessions');
    }
    setLoading(false);
  }, [statusFilter, dateFilter]);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  const openCount = useMemo(() => sessions.filter(s => s.status === 'open').length, [sessions]);
  const totalCashIn = useMemo(() => sessions.filter(s => s.status === 'open').reduce((sum, s) => sum + s.cash_received, 0), [sessions]);
  const flaggedCount = useMemo(() => sessions.filter(s => s.status === 'variance_flagged').length, [sessions]);

  // Search filtering
  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return sessions;
    const q = searchQuery.toLowerCase().trim();
    return sessions.filter(s =>
      String(s.id).includes(q) ||
      String(s.staff_id).includes(q) ||
      s.session_date?.toLowerCase().includes(q) ||
      s.status?.toLowerCase().includes(q) ||
      s.notes?.toLowerCase().includes(q) ||
      s.workstation_id?.toLowerCase().includes(q)
    );
  }, [sessions, searchQuery]);

  const paged = useMemo(() => {
    const start = (page - 1) * perPage;
    return filtered.slice(start, start + perPage);
  }, [filtered, page]);
  const totalPages = Math.ceil(filtered.length / perPage);

  /* ── Handlers ─────────────────────────────────────────────────────────── */
  const handleOpenSession = async (e: React.FormEvent) => {
    e.preventDefault();
    setOpenSaving(true);
    try {
      await cashierSessionService.open({ opening_balance: openBalance, notes: openNotes || undefined });
      success('Session opened');
      setDrawerOpen(false);
      setOpenBalance(0);
      setOpenNotes('');
      fetchSessions();
    } catch (err: any) {
      error(err?.response?.data?.detail || 'Failed to open session');
    }
    setOpenSaving(false);
  };

  const handleRecordCash = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recordSession || recordAmount === 0) return;
    setRecordSaving(true);
    try {
      await cashierSessionService.recordCash(recordSession.id, recordAmount);
      success('Cash recorded');
      setRecordSession(null);
      setRecordAmount(0);
      fetchSessions();
    } catch (err: any) {
      error(err?.response?.data?.detail || 'Failed to record cash');
    }
    setRecordSaving(false);
  };

  const handleCloseSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!closeSession) return;
    setCloseSaving(true);
    try {
      await cashierSessionService.close(closeSession.id, { closing_balance: closingBalance, notes: closeNotes || undefined });
      success('Session closed');
      setCloseSession(null);
      setClosingBalance(0);
      setCloseNotes('');
      fetchSessions();
    } catch (err: any) {
      error(err?.response?.data?.detail || 'Failed to close session');
    }
    setCloseSaving(false);
  };

  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'open', label: 'Open' },
    { value: 'closed', label: 'Closed' },
    { value: 'variance_flagged', label: 'Variance Flagged' },
  ];

  // Variance calc for close modal
  const expectedBalance = closeSession
    ? closeSession.opening_balance + closeSession.cash_received - closeSession.cash_paid_out
    : 0;
  const variance = closingBalance - expectedBalance;

  if (loading && sessions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#F9F7F7' }}>
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-7 h-7 animate-spin text-terra-500" />
          <p className="text-[13px] text-neutral-500 animate-pulse">Loading cashier sessions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F9F7F7' }}>
      <div className="px-4 sm:px-6 lg:px-10 py-4 sm:py-6 space-y-4 sm:space-y-6">

        {/* ─── Header ─────────────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-neutral-900">Cashier Sessions</h1>
            <p className="text-[12px] sm:text-[13px] text-neutral-500 mt-1">
              Manage cash register sessions and track variances
            </p>
          </div>
          <Button variant="primary" icon={Plus} onClick={() => setDrawerOpen(true)} className="w-full sm:w-auto">
            Open Session
          </Button>
        </div>

        {/* ─── KPI Cards ──────────────────────────────────────────────────── */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white rounded-[10px] border border-neutral-100 p-3 sm:p-5">
            <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
              <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg bg-sage-50 flex items-center justify-center">
                <CheckCircle2 className="w-3 h-3 sm:w-4 sm:h-4 text-sage-600" />
              </div>
              <p className="text-[9px] sm:text-[11px] font-semibold uppercase tracking-widest text-neutral-400">Open Sessions</p>
            </div>
            <p className="text-[15px] sm:text-2xl font-semibold tracking-tight text-neutral-900">{openCount}</p>
            <p className="text-[9px] sm:text-[11px] text-neutral-400 font-medium mt-1">
              {sessions.length} total
            </p>
          </div>

          <div className="bg-white rounded-[10px] border border-neutral-100 p-3 sm:p-5">
            <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
              <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg bg-terra-50 flex items-center justify-center">
                <DollarSign className="w-3 h-3 sm:w-4 sm:h-4 text-terra-600" />
              </div>
              <p className="text-[9px] sm:text-[11px] font-semibold uppercase tracking-widest text-neutral-400">Cash In Transit</p>
            </div>
            <p className="text-[15px] sm:text-2xl font-semibold tracking-tight text-neutral-900">{formatSimple(totalCashIn)}</p>
            <p className="text-[9px] sm:text-[11px] text-neutral-400 font-medium mt-1">
              From open sessions
            </p>
          </div>

          <div className="bg-white rounded-[10px] border border-neutral-100 p-3 sm:p-5">
            <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
              <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center ${flaggedCount > 0 ? 'bg-gold-50' : 'bg-sage-50'}`}>
                {flaggedCount > 0
                  ? <AlertTriangle className="w-3 h-3 sm:w-4 sm:h-4 text-gold-600" />
                  : <CheckCircle2 className="w-3 h-3 sm:w-4 sm:h-4 text-sage-600" />
                }
              </div>
              <p className="text-[9px] sm:text-[11px] font-semibold uppercase tracking-widest text-neutral-400">Flagged</p>
            </div>
            <p className="text-[15px] sm:text-2xl font-semibold tracking-tight text-neutral-900">{flaggedCount}</p>
            {flaggedCount > 0 ? (
              <p className="text-[9px] sm:text-[11px] text-gold-600 font-medium mt-1">Needs review</p>
            ) : (
              <p className="text-[9px] sm:text-[11px] text-sage-600 font-medium mt-1">All clear</p>
            )}
          </div>
        </div>

        {/* ─── Table Card ─────────────────────────────────────────────────── */}
        <div className="bg-white rounded-[10px] border border-neutral-100 overflow-hidden">

          {/* Filter bar */}
          <div className="px-4 sm:px-6 py-3 sm:py-4 bg-neutral-50/30 border-b border-neutral-100">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
              <div className="w-full sm:flex-1 sm:max-w-xs">
                <SearchBar
                  value={searchQuery}
                  onChange={v => { setSearchQuery(v); setPage(1); }}
                  onClear={() => { setSearchQuery(''); setPage(1); }}
                  placeholder="Search by ID, staff, notes..."
                  size="md"
                />
              </div>
              <div className="hidden sm:block sm:flex-1" />
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-[150px] sm:w-[160px] flex-shrink-0">
                  <DatePicker
                    value={dateFilter}
                    onChange={v => { setDateFilter(v); setPage(1); }}
                    placeholder="Session date"
                    className="w-full"
                  />
                </div>
                <div className="w-[150px] sm:w-[170px] flex-shrink-0">
                  <SimpleDropdown
                    value={statusFilter}
                    onChange={v => { setStatusFilter(v); setPage(1); }}
                    options={statusOptions}
                    placeholder="Status"
                    triggerClassName="h-9 py-0 text-[13px]"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Staff</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Opening</TableHead>
                  <TableHead>
                    <span className="flex items-center gap-1">
                      <ArrowUpRight className="w-3 h-3 text-sage-500" />
                      Cash In
                    </span>
                  </TableHead>
                  <TableHead>
                    <span className="flex items-center gap-1">
                      <ArrowDownRight className="w-3 h-3 text-rose-400" />
                      Cash Out
                    </span>
                  </TableHead>
                  <TableHead>Expected</TableHead>
                  <TableHead>Closing</TableHead>
                  <TableHead>Variance</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableSkeleton columns={11} rows={5} />
                ) : paged.length === 0 ? (
                  <TableEmpty
                    colSpan={11}
                    icon={Banknote}
                    title="No sessions found"
                    description="Open a new cashier session to get started"
                  />
                ) : paged.map(s => (
                  <TableRow key={s.id}>
                    <TableCell className="font-mono text-neutral-500 text-[12px]">#{s.id}</TableCell>
                    <TableCell className="text-neutral-700">{s.staff_id}</TableCell>
                    <TableCell className="whitespace-nowrap">
                      <p className="text-[13px] text-neutral-900 font-medium">{formatDate(s.session_date)}</p>
                    </TableCell>
                    <TableCell>
                      <Badge variant={sessionStatusVariant(s.status)} dot>{formatStatus(s.status)}</Badge>
                    </TableCell>
                    <TableCell className="font-medium">{formatSimple(s.opening_balance)}</TableCell>
                    <TableCell className="text-sage-700 font-medium">{formatSimple(s.cash_received)}</TableCell>
                    <TableCell className="text-rose-600 font-medium">{formatSimple(s.cash_paid_out)}</TableCell>
                    <TableCell className="text-neutral-600">{s.expected_balance != null ? formatSimple(s.expected_balance) : '—'}</TableCell>
                    <TableCell className="text-neutral-600">{s.closing_balance != null ? formatSimple(s.closing_balance) : '—'}</TableCell>
                    <TableCell>
                      {s.variance != null ? (
                        <span className={`font-medium ${Math.abs(s.variance) > 0.01 ? 'text-rose-600' : 'text-sage-700'}`}>
                          {s.variance >= 0 ? '+' : ''}{formatSimple(s.variance)}
                        </span>
                      ) : <span className="text-neutral-300">—</span>}
                    </TableCell>
                    <TableCell className="w-10">
                      <SessionMenu
                        s={s}
                        onRecord={() => { setRecordAmount(0); setRecordSession(s); }}
                        onClose={() => { setClosingBalance(0); setCloseNotes(''); setCloseSession(s); }}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {!loading && totalPages > 0 && (
            <div className="px-4 sm:px-6 py-3 sm:py-4 border-t border-neutral-100 bg-neutral-50/30">
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

        {/* ─── Open Session Side Panel ─────────────────────────────────────── */}
        {drawerOpen && createPortal(
          <div className="fixed inset-0 z-50">
            {/* Dim overlay — no blur */}
            <div
              className="fixed inset-0 bg-black/30 animate-fadeIn"
              onClick={() => setDrawerOpen(false)}
            />

            {/* Panel */}
            <div className="fixed top-0 right-0 bottom-0 w-full sm:w-96 bg-white border-l border-neutral-200 shadow-xl flex flex-col animate-slideInRight z-[51]">
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100">
                <div>
                <h2 className="text-base font-semibold text-neutral-900">Open Cashier Session</h2>
                <p className="text-[11px] text-neutral-400 font-medium mt-0.5">Start a new session with an opening balance</p>
              </div>
                <button
                  onClick={() => setDrawerOpen(false)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Content */}
              <form onSubmit={handleOpenSession} className="flex flex-col flex-1 overflow-hidden">
                <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
                  <p className="text-[13px] text-neutral-500">
                    Start a new cashier session with an opening balance. The session will remain open until you close it at the end of your shift.
                  </p>

                  <div>
                    <label className={labelCls}>Opening Balance</label>
                    <input
                      type="number"
                      min={0}
                      step={0.01}
                      value={openBalance}
                      onChange={e => setOpenBalance(parseFloat(e.target.value) || 0)}
                      className={inputCls}
                      placeholder="0.00"
                    />
                  </div>

                  <div>
                    <label className={labelCls}>Notes</label>
                    <textarea
                      value={openNotes}
                      onChange={e => setOpenNotes(e.target.value)}
                      className={`${textareaCls} min-h-[100px]`}
                      placeholder="Optional notes about this session..."
                    />
                  </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-neutral-100 flex gap-3">
                  <Button type="button" variant="ghost" onClick={() => setDrawerOpen(false)} className="flex-1">
                    Cancel
                  </Button>
                  <Button type="submit" variant="primary" disabled={openSaving} loading={openSaving} className="flex-1">
                    Open Session
                  </Button>
                </div>
              </form>
            </div>
          </div>,
          document.body
        )}

        {/* ─── Record Cash Modal ──────────────────────────────────────────── */}
        <Modal open={!!recordSession} onClose={() => setRecordSession(null)} size="md">
          <form onSubmit={handleRecordCash}>
            <ModalHeader>
              <ModalTitle>Record Cash Transaction</ModalTitle>
              <ModalDescription>
                Session #{recordSession?.id} — Current received: {formatSimple(recordSession?.cash_received ?? 0)}
              </ModalDescription>
            </ModalHeader>
            <ModalContent>
              <div className="space-y-4">
                <div>
                  <label className={labelCls}>Amount</label>
                  <input
                    type="number"
                    step={0.01}
                    value={recordAmount}
                    onChange={e => setRecordAmount(parseFloat(e.target.value) || 0)}
                    className={inputCls}
                    placeholder="0.00"
                  />
                  <p className="text-[11px] text-neutral-400 mt-1.5">
                    Use positive for cash in, negative for cash out
                  </p>
                </div>
              </div>
            </ModalContent>
            <ModalFooter>
              <Button type="button" variant="ghost" onClick={() => setRecordSession(null)}>Cancel</Button>
              <Button type="submit" variant="primary" disabled={recordSaving || recordAmount === 0} loading={recordSaving}>
                Record
              </Button>
            </ModalFooter>
          </form>
        </Modal>

        {/* ─── Close Session Modal ────────────────────────────────────────── */}
        <Modal open={!!closeSession} onClose={() => setCloseSession(null)} size="md">
          <form onSubmit={handleCloseSession}>
            <ModalHeader>
              <ModalTitle>Close Cashier Session</ModalTitle>
              <ModalDescription>Enter the actual closing balance to close this session</ModalDescription>
            </ModalHeader>
            <ModalContent>
              <div className="space-y-4">
                {closeSession && (
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-neutral-50 rounded-lg p-3 text-center">
                      <p className="text-[11px] text-neutral-500 font-medium">Opening</p>
                      <p className="text-[14px] font-semibold text-neutral-900 mt-0.5">{formatSimple(closeSession.opening_balance)}</p>
                    </div>
                    <div className="bg-neutral-50 rounded-lg p-3 text-center">
                      <p className="text-[11px] text-neutral-500 font-medium">Expected</p>
                      <p className="text-[14px] font-semibold text-neutral-900 mt-0.5">{formatSimple(expectedBalance)}</p>
                    </div>
                  </div>
                )}
                <div>
                  <label className={labelCls}>Actual Closing Balance</label>
                  <input
                    type="number"
                    min={0}
                    step={0.01}
                    value={closingBalance}
                    onChange={e => setClosingBalance(parseFloat(e.target.value) || 0)}
                    className={inputCls}
                    placeholder="0.00"
                  />
                </div>
                {closingBalance > 0 && (
                  <div className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-[12px] font-medium ${
                    Math.abs(variance) > 0.01 ? 'bg-gold-50 text-gold-700' : 'bg-sage-50 text-sage-700'
                  }`}>
                    {Math.abs(variance) > 0.01 && <AlertTriangle size={14} />}
                    Variance: {variance >= 0 ? '+' : ''}{formatSimple(variance)}
                  </div>
                )}
                <div>
                  <label className={labelCls}>Notes</label>
                  <textarea
                    value={closeNotes}
                    onChange={e => setCloseNotes(e.target.value)}
                    className={`${textareaCls} min-h-[60px]`}
                    placeholder="Optional notes..."
                  />
                </div>
              </div>
            </ModalContent>
            <ModalFooter>
              <Button type="button" variant="ghost" onClick={() => setCloseSession(null)}>Cancel</Button>
              <Button type="submit" variant="primary" disabled={closeSaving} loading={closeSaving}>
                Close Session
              </Button>
            </ModalFooter>
          </form>
        </Modal>

      </div>
    </div>
  );
}
