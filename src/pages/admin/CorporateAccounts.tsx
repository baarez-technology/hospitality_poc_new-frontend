/**
 * CorporateAccounts — Admin page for managing corporate accounts.
 * Glimmora Design System v5.0
 */

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Building2, Plus, Edit2, Trash2, FileText, CheckCircle2,
  DollarSign, Loader2, Eye, MoreHorizontal,
} from 'lucide-react';
import { corporateService, type CorporateAccount, type CorporateAccountCreate } from '@/api/services/corporate.service';
import { useCurrency } from '@/hooks/useCurrency';
import { useToast } from '@/contexts/ToastContext';
import { useGeoAddress } from '@/hooks/useGeoAddress';

// UI2 Components
import { ConfirmModal } from '@/components/ui2/Modal';
import { Drawer } from '@/components/ui2/Drawer';
import { Button } from '@/components/ui2/Button';
import { SearchableSelect } from '@/components/ui2/SearchableSelect';
import {
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
  TableEmpty, TableSkeleton, Pagination,
} from '@/components/ui2/Table';
import { Badge } from '@/components/ui2/Badge';
import { SearchBar } from '@/components/ui2/SearchBar';
import { SimpleDropdown } from '@/components/ui/Select';

// ── Status badge mapping ──────────────────────────────────────────────────────
const STATUS_VARIANT: Record<string, 'success' | 'neutral' | 'warning'> = {
  active: 'success',
  inactive: 'neutral',
  suspended: 'warning',
};

// ── Filter options ────────────────────────────────────────────────────────────
const STATUS_OPTIONS = [
  { value: '', label: 'All Status' },
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'suspended', label: 'Suspended' },
];

// ── Input styles ──────────────────────────────────────────────────────────────
const inputBase = 'w-full h-9 px-3.5 rounded-lg text-[13px] bg-white border transition-all duration-200 ease-out focus:outline-none';
const inputCls = `${inputBase} border-neutral-200/80 hover:border-terra-300/60 focus:border-terra-400/60 focus:ring-2 focus:ring-terra-500/10 placeholder:text-neutral-400 text-neutral-900`;
const textareaCls = 'w-full px-3.5 py-2.5 rounded-lg text-[13px] bg-white border border-neutral-200/80 hover:border-terra-300/60 focus:border-terra-400/60 focus:ring-2 focus:ring-terra-500/10 focus:outline-none transition-all duration-200 ease-out placeholder:text-neutral-400 text-neutral-900 resize-none';
const labelCls = 'block text-[13px] font-medium text-neutral-700 mb-1';
const sectionCls = 'text-[11px] font-semibold uppercase tracking-widest text-neutral-400 mb-3.5';

// ── Account Form Drawer ───────────────────────────────────────────────────────
function AccountDrawer({ isOpen, onClose, onSave, initial }: {
  isOpen: boolean; onClose: () => void;
  onSave: (data: CorporateAccountCreate) => Promise<void>;
  initial?: CorporateAccount | null;
}) {
  const [form, setForm] = useState<CorporateAccountCreate>({
    company_name: '', contact_name: '', contact_email: '', contact_phone: '',
    billing_address: '', city: '', state: '', country: '', tax_id: '',
    credit_limit: 0, payment_terms: '30', notes: '',
  });
  const [saving, setSaving] = useState(false);
  const { error: showError } = useToast();

  // Geo address cascading selects
  const { countries, states, cities, hasStates, hasCities } = useGeoAddress({
    countryCode: form.country || '',
    stateCode: form.state || '',
    cityName: form.city || '',
    onStateReset: () => setForm(f => ({ ...f, state: '', city: '' })),
    onCityReset: () => setForm(f => ({ ...f, city: '' })),
  });
  const countryOptions = useMemo(() => countries.map(c => ({ value: c.isoCode, label: c.name })), [countries]);
  const stateOptions = useMemo(() => states.map(s => ({ value: s.isoCode, label: s.name })), [states]);
  const cityOptions = useMemo(() => cities.map(c => ({ value: c.name, label: c.name })), [cities]);

  useEffect(() => {
    if (initial) {
      setForm({
        company_name: initial.company_name || '', account_code: initial.account_code || '',
        contact_name: initial.contact_name || '', contact_email: initial.contact_email || '',
        contact_phone: initial.contact_phone || '', billing_address: initial.billing_address || '',
        city: initial.city || '', state: initial.state || '', country: initial.country || '',
        tax_id: initial.tax_id || '', credit_limit: initial.credit_limit || 0,
        payment_terms: initial.payment_terms || '30',
        discount_percentage: initial.discount_percentage || undefined,
        contract_start_date: initial.contract_start_date || '',
        contract_end_date: initial.contract_end_date || '', notes: initial.notes || '',
      });
    } else {
      setForm({
        company_name: '', contact_name: '', contact_email: '', contact_phone: '',
        billing_address: '', city: '', state: '', country: '', tax_id: '',
        credit_limit: 0, payment_terms: '30', notes: '',
      });
    }
  }, [initial, isOpen]);

  const handleSave = async () => {
    if (!form.company_name.trim()) return;
    setSaving(true);
    try {
      await onSave(form);
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
      title={initial ? 'Edit Corporate Account' : 'New Corporate Account'}
      subtitle={initial ? 'Update account details' : 'Fill in the details to create a new corporate account'}
      maxWidth="max-w-xl"
      footer={
        <div className="flex gap-3 w-full">
          <Button variant="ghost" className="flex-1" onClick={onClose}>Cancel</Button>
          <Button variant="primary" className="flex-1" onClick={handleSave} disabled={saving} loading={saving}>
            {initial ? 'Update Account' : 'Create Account'}
          </Button>
        </div>
      }
    >
      <div className="space-y-6">

        {/* ── Company Info ── */}
        <div>
          <p className={sectionCls}>Company Info</p>
          <div className="space-y-3.5">
            <div>
              <label className={labelCls}>Company Name <span className="text-rose-400">*</span></label>
              <input
                className={inputCls}
                value={form.company_name}
                onChange={e => setForm(f => ({ ...f, company_name: e.target.value }))}
                placeholder="e.g. Acme Corporation"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>Contact Name</label>
                <input
                  className={inputCls}
                  value={form.contact_name || ''}
                  onChange={e => setForm(f => ({ ...f, contact_name: e.target.value }))}
                  placeholder="Full name"
                />
              </div>
              <div>
                <label className={labelCls}>Contact Email</label>
                <input
                  className={inputCls}
                  type="email"
                  value={form.contact_email || ''}
                  onChange={e => setForm(f => ({ ...f, contact_email: e.target.value }))}
                  placeholder="email@company.com"
                />
              </div>
              <div>
                <label className={labelCls}>Contact Phone</label>
                <input
                  className={inputCls}
                  type="tel"
                  value={form.contact_phone || ''}
                  onChange={e => setForm(f => ({ ...f, contact_phone: e.target.value.replace(/[^0-9+\-\s()]/g, '') }))}
                  placeholder="+1 000 000 0000"
                />
              </div>
              <div>
                <label className={labelCls}>Tax ID / GST</label>
                <input
                  className={inputCls}
                  value={form.tax_id || ''}
                  onChange={e => setForm(f => ({ ...f, tax_id: e.target.value.replace(/[^0-9A-Z\-]/gi, '') }))}
                  placeholder="e.g. 12-3456789"
                />
              </div>
            </div>
          </div>
        </div>

        {/* ── Billing Address ── */}
        <div className="border-t border-neutral-100 pt-5">
          <p className={sectionCls}>Billing Address</p>
          <div className="space-y-3.5">
            <div>
              <label className={labelCls}>Street Address</label>
              <input
                className={inputCls}
                value={form.billing_address || ''}
                onChange={e => setForm(f => ({ ...f, billing_address: e.target.value }))}
                placeholder="Street address"
              />
            </div>
            <div>
              <label className={labelCls}>Country</label>
              <SearchableSelect
                options={countryOptions}
                value={form.country || ''}
                onChange={val => setForm(f => ({ ...f, country: val, state: '', city: '' }))}
                placeholder="Select country"
                searchable
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>State / Province</label>
                {hasStates ? (
                  <SearchableSelect
                    options={stateOptions}
                    value={form.state || ''}
                    onChange={val => setForm(f => ({ ...f, state: val, city: '' }))}
                    placeholder="Select state"
                    disabled={!form.country}
                    searchable
                  />
                ) : (
                  <input
                    className={inputCls}
                    value={form.state || ''}
                    onChange={e => setForm(f => ({ ...f, state: e.target.value }))}
                    placeholder="State / Province"
                  />
                )}
              </div>
              <div>
                <label className={labelCls}>City</label>
                {hasCities ? (
                  <SearchableSelect
                    options={cityOptions}
                    value={form.city || ''}
                    onChange={val => setForm(f => ({ ...f, city: val }))}
                    placeholder="Select city"
                    disabled={!form.state}
                    searchable
                  />
                ) : (
                  <input
                    className={inputCls}
                    value={form.city || ''}
                    onChange={e => setForm(f => ({ ...f, city: e.target.value }))}
                    placeholder="City"
                  />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ── Contract Terms ── */}
        <div className="border-t border-neutral-100 pt-5">
          <p className={sectionCls}>Contract Terms</p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Credit Limit</label>
              <input
                className={inputCls}
                type="number"
                min={0}
                step={1000}
                value={form.credit_limit || 0}
                onChange={e => setForm(f => ({ ...f, credit_limit: parseFloat(e.target.value) || 0 }))}
              />
            </div>
            <div>
              <label className={labelCls}>Payment Terms (days)</label>
              <input
                className={inputCls}
                type="number"
                min={0}
                value={form.payment_terms || '30'}
                onChange={e => setForm(f => ({ ...f, payment_terms: e.target.value }))}
                placeholder="30"
              />
            </div>
            <div>
              <label className={labelCls}>Discount %</label>
              <input
                className={inputCls}
                type="number"
                min={0}
                max={100}
                step={0.5}
                value={form.discount_percentage || ''}
                onChange={e => setForm(f => ({ ...f, discount_percentage: parseFloat(e.target.value) || undefined }))}
                placeholder="0"
              />
            </div>
          </div>
        </div>

        {/* ── Notes ── */}
        <div className="border-t border-neutral-100 pt-5">
          <label className={labelCls}>Notes</label>
          <textarea
            className={textareaCls}
            rows={3}
            value={form.notes || ''}
            onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
            placeholder="Optional notes about this account..."
          />
        </div>

      </div>
    </Drawer>
  );
}

// ── Detail Drawer ─────────────────────────────────────────────────────────────
function DetailDrawer({ account, isOpen, onClose, onEdit, navigate }: {
  account: CorporateAccount | null; isOpen: boolean; onClose: () => void;
  onEdit: (a: CorporateAccount) => void; navigate: ReturnType<typeof useNavigate>;
}) {
  const { formatCurrency } = useCurrency();
  const [bookings, setBookings] = useState<any[]>([]);

  useEffect(() => {
    if (account?.id) {
      corporateService.getBookings(account.id).then(res => setBookings(res.bookings || [])).catch(() => {});
    }
  }, [account?.id]);

  if (!account) return null;

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title={account.company_name}
      subtitle={account.account_code}
      maxWidth="max-w-lg"
      footer={
        <div className="flex gap-3 w-full">
          <Button variant="ghost" className="flex-1" onClick={onClose}>Close</Button>
          <Button variant="primary" className="flex-1" icon={Edit2} onClick={() => onEdit(account)}>Edit</Button>
        </div>
      }
    >
      <div className="space-y-5">
        {/* Summary Cards */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-neutral-50 rounded-lg p-3 text-center">
            <p className="text-[11px] text-neutral-500 mb-0.5">Bookings</p>
            <p className="text-[18px] font-bold text-neutral-900">{account.total_bookings}</p>
          </div>
          <div className="bg-neutral-50 rounded-lg p-3 text-center">
            <p className="text-[11px] text-neutral-500 mb-0.5">Revenue</p>
            <p className="text-[14px] font-bold text-neutral-900 tabular-nums">{formatCurrency(account.total_revenue)}</p>
          </div>
          <div className="bg-neutral-50 rounded-lg p-3 text-center">
            <p className="text-[11px] text-neutral-500 mb-0.5">AR Balance</p>
            <p className={`text-[14px] font-bold tabular-nums ${account.ar_balance > 0 ? 'text-gold-600' : 'text-sage-600'}`}>
              {formatCurrency(account.ar_balance)}
            </p>
          </div>
        </div>

        {/* Contact */}
        <div>
          <h3 className="text-[11px] font-semibold text-neutral-400 uppercase tracking-widest mb-2.5">Contact</h3>
          <div className="space-y-1.5 text-[13px]">
            {account.contact_name && (
              <div className="flex gap-2">
                <span className="text-neutral-400 w-14 flex-shrink-0">Name</span>
                <span className="text-neutral-800 font-medium">{account.contact_name}</span>
              </div>
            )}
            {account.contact_email && (
              <div className="flex gap-2">
                <span className="text-neutral-400 w-14 flex-shrink-0">Email</span>
                <span className="text-neutral-800">{account.contact_email}</span>
              </div>
            )}
            {account.contact_phone && (
              <div className="flex gap-2">
                <span className="text-neutral-400 w-14 flex-shrink-0">Phone</span>
                <span className="text-neutral-800">{account.contact_phone}</span>
              </div>
            )}
          </div>
        </div>

        {/* Billing */}
        <div className="border-t border-neutral-100 pt-4">
          <h3 className="text-[11px] font-semibold text-neutral-400 uppercase tracking-widest mb-2.5">Billing</h3>
          <div className="space-y-1.5 text-[13px]">
            {account.billing_address && <p className="text-neutral-700">{account.billing_address}</p>}
            {(account.city || account.state) && (
              <p className="text-neutral-700">{[account.city, account.state].filter(Boolean).join(', ')}</p>
            )}
            {account.tax_id && (
              <div className="flex gap-2">
                <span className="text-neutral-400 w-16 flex-shrink-0">Tax ID</span>
                <span className="text-neutral-800 font-mono">{account.tax_id}</span>
              </div>
            )}
            <div className="flex gap-2">
              <span className="text-neutral-400 w-16 flex-shrink-0">Credit</span>
              <span className="text-neutral-800 tabular-nums">{formatCurrency(account.credit_limit || 0)}</span>
            </div>
            <div className="flex gap-2">
              <span className="text-neutral-400 w-16 flex-shrink-0">Terms</span>
              <span className="text-neutral-800">{account.payment_terms || '30'} days</span>
            </div>
            {account.discount_percentage ? (
              <div className="flex gap-2">
                <span className="text-neutral-400 w-16 flex-shrink-0">Discount</span>
                <span className="text-neutral-800">{account.discount_percentage}%</span>
              </div>
            ) : null}
          </div>
        </div>

        {/* Linked Bookings */}
        <div className="border-t border-neutral-100 pt-4">
          <div className="flex items-center justify-between mb-2.5">
            <h3 className="text-[11px] font-semibold text-neutral-400 uppercase tracking-widest">Linked Bookings</h3>
            <span className="text-[11px] text-neutral-400">{bookings.length} total</span>
          </div>
          {bookings.length === 0 ? (
            <div className="flex items-center justify-center py-6 bg-neutral-50 rounded-lg border border-neutral-100">
              <p className="text-[13px] text-neutral-400">No bookings linked yet</p>
            </div>
          ) : (
            <div className="space-y-1.5 max-h-[200px] overflow-y-auto pr-0.5">
              {bookings.map((b: any) => (
                <div key={b.id} className="flex items-center justify-between px-3.5 py-2.5 bg-neutral-50 rounded-lg border border-neutral-100 text-[13px]">
                  <div>
                    <span className="font-semibold text-neutral-800">#{b.booking_number}</span>
                    <span className="ml-2 text-neutral-400 text-[12px]">{b.arrival_date}</span>
                  </div>
                  <Badge variant={STATUS_VARIANT[b.status] || 'neutral'}>{b.status}</Badge>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* View AR Ledger */}
        <Button
          variant="outline"
          icon={FileText}
          onClick={() => navigate(`/admin/ar-ledger?corporate=${account.id}`)}
          fullWidth
        >
          View AR Ledger
        </Button>
      </div>
    </Drawer>
  );
}

// ── Row Actions Menu (Bookings-style … dropdown) ──────────────────────────────
function RowMenu({ acct, onView, onEdit, onDeactivate }: {
  acct: CorporateAccount;
  onView: () => void;
  onEdit: () => void;
  onDeactivate: () => void;
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
            onClick={() => { onView(); setOpen(false); }}
          >
            <Eye className="w-3.5 h-3.5 text-neutral-400" />
            View
          </button>
          <button
            className="w-full px-3.5 py-2.5 text-[13px] text-left flex items-center gap-2.5 hover:bg-neutral-50 text-neutral-700 transition-colors"
            onClick={() => { onEdit(); setOpen(false); }}
          >
            <Edit2 className="w-3.5 h-3.5 text-neutral-400" />
            Edit
          </button>
          {acct.status === 'active' && (
            <>
              <div className="h-px bg-neutral-100 mx-2" />
              <button
                className="w-full px-3.5 py-2.5 text-[13px] text-left flex items-center gap-2.5 hover:bg-rose-50 text-rose-600 transition-colors"
                onClick={() => { onDeactivate(); setOpen(false); }}
              >
                <Trash2 className="w-3.5 h-3.5" />
                Deactivate
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function CorporateAccounts() {
  const navigate = useNavigate();
  const { formatCurrency } = useCurrency();
  const { success, error: showError } = useToast();
  const [accounts, setAccounts] = useState<CorporateAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const perPage = 15;

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editAccount, setEditAccount] = useState<CorporateAccount | null>(null);
  const [selectedAccount, setSelectedAccount] = useState<CorporateAccount | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<CorporateAccount | null>(null);

  const fetchAccounts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await corporateService.listAccounts({ status: statusFilter || undefined, search: search || undefined });
      setAccounts(res.accounts || []);
    } catch {
      showError('Failed to load corporate accounts');
    }
    setLoading(false);
  }, [search, statusFilter]);

  useEffect(() => { fetchAccounts(); }, [fetchAccounts]);

  const activeCount = useMemo(() => accounts.filter(a => a.status === 'active').length, [accounts]);
  const totalAR = useMemo(() => accounts.reduce((sum, a) => sum + (a.ar_balance || 0), 0), [accounts]);

  const paged = useMemo(() => {
    const start = (page - 1) * perPage;
    return accounts.slice(start, start + perPage);
  }, [accounts, page]);
  const totalPages = Math.ceil(accounts.length / perPage);

  const handleCreate = async (data: CorporateAccountCreate) => {
    await corporateService.createAccount(data);
    success('Corporate account created');
    fetchAccounts();
  };

  const handleUpdate = async (data: CorporateAccountCreate) => {
    if (!editAccount) return;
    await corporateService.updateAccount(editAccount.id, data);
    success('Account updated');
    setEditAccount(null);
    fetchAccounts();
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await corporateService.deleteAccount(deleteTarget.id);
      success('Account deactivated');
      fetchAccounts();
    } catch {
      showError('Failed to deactivate');
    }
    setDeleteTarget(null);
  };

  const openAdd = () => { setEditAccount(null); setDrawerOpen(true); };

  const openEdit = (acct: CorporateAccount) => {
    setSelectedAccount(null);
    setEditAccount(acct);
    setDrawerOpen(true);
  };

  const closeDrawer = () => { setDrawerOpen(false); setEditAccount(null); };

  if (loading && accounts.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#F9F7F7' }}>
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-7 h-7 animate-spin text-terra-500" />
          <p className="text-[13px] text-neutral-500 animate-pulse">Loading corporate accounts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F9F7F7' }}>
      <div className="px-4 sm:px-6 lg:px-10 py-4 sm:py-6 space-y-4 sm:space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-neutral-900">Corporate Accounts</h1>
            <p className="text-[12px] sm:text-[13px] text-neutral-500 mt-1">
              Manage corporate accounts, credit limits and AR balances
            </p>
          </div>
          <Button variant="primary" icon={Plus} onClick={openAdd}>
            Add Account
          </Button>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white rounded-[10px] border border-neutral-100 p-3 sm:p-5">
            <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
              <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg bg-terra-50 flex items-center justify-center">
                <Building2 className="w-3 h-3 sm:w-4 sm:h-4 text-terra-600" />
              </div>
              <p className="text-[9px] sm:text-[11px] font-semibold uppercase tracking-widest text-neutral-400">Total Accounts</p>
            </div>
            <p className="text-[15px] sm:text-2xl font-semibold tracking-tight text-neutral-900">{accounts.length}</p>
            <p className="text-[9px] sm:text-[11px] text-neutral-400 font-medium mt-1">All corporate accounts</p>
          </div>

          <div className="bg-white rounded-[10px] border border-neutral-100 p-3 sm:p-5">
            <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
              <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg bg-sage-50 flex items-center justify-center">
                <CheckCircle2 className="w-3 h-3 sm:w-4 sm:h-4 text-sage-600" />
              </div>
              <p className="text-[9px] sm:text-[11px] font-semibold uppercase tracking-widest text-neutral-400">Active</p>
            </div>
            <p className="text-[15px] sm:text-2xl font-semibold tracking-tight text-neutral-900">{activeCount}</p>
            <p className="text-[9px] sm:text-[11px] text-sage-600 font-medium mt-1">
              {accounts.length > 0 ? `${Math.round((activeCount / accounts.length) * 100)}% of total` : '—'}
            </p>
          </div>

          <div className="bg-white rounded-[10px] border border-neutral-100 p-3 sm:p-5">
            <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
              <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center ${totalAR > 0 ? 'bg-gold-50' : 'bg-sage-50'}`}>
                {totalAR > 0
                  ? <DollarSign className="w-3 h-3 sm:w-4 sm:h-4 text-gold-600" />
                  : <CheckCircle2 className="w-3 h-3 sm:w-4 sm:h-4 text-sage-600" />
                }
              </div>
              <p className="text-[9px] sm:text-[11px] font-semibold uppercase tracking-widest text-neutral-400">Outstanding AR</p>
            </div>
            <p className="text-[15px] sm:text-2xl font-semibold tracking-tight text-neutral-900">{formatCurrency(totalAR)}</p>
            {totalAR > 0
              ? <p className="text-[9px] sm:text-[11px] text-gold-600 font-medium mt-1">Receivables pending</p>
              : <p className="text-[9px] sm:text-[11px] text-sage-600 font-medium mt-1">All settled</p>
            }
          </div>
        </div>

        {/* Table Card */}
        <div className="bg-white rounded-[10px] border border-neutral-100 overflow-hidden">

          {/* Filter Bar */}
          <div className="px-4 sm:px-6 py-3 border-b border-neutral-100">
            <div className="flex items-center gap-3">
              <div className="flex-1 max-w-xs">
                <SearchBar
                  value={search}
                  onChange={val => { setSearch(val); setPage(1); }}
                  onClear={() => { setSearch(''); setPage(1); }}
                  placeholder="Search by company or code..."
                  size="md"
                />
              </div>
              <div className="ml-auto">
                <SimpleDropdown
                  value={statusFilter}
                  onChange={val => { setStatusFilter(val); setPage(1); }}
                  options={STATUS_OPTIONS}
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
                  <TableHead>Company</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Credit Limit</TableHead>
                  <TableHead>AR Balance</TableHead>
                  <TableHead>Bookings</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableSkeleton columns={8} rows={5} />
                ) : paged.length === 0 ? (
                  <TableEmpty
                    colSpan={8}
                    icon={Building2}
                    title="No corporate accounts found"
                    description="Add a corporate account to get started"
                  />
                ) : paged.map(acct => (
                  <TableRow
                    key={acct.id}
                    clickable
                    onClick={() => setSelectedAccount(acct)}
                  >
                    <TableCell className="font-mono text-neutral-500 text-[12px]">{acct.account_code}</TableCell>
                    <TableCell>
                      <p className="font-medium text-neutral-900">{acct.company_name}</p>
                      {acct.city && <p className="text-[11px] text-neutral-400">{acct.city}</p>}
                    </TableCell>
                    <TableCell className="text-neutral-600">{acct.contact_name || <span className="text-neutral-300">—</span>}</TableCell>
                    <TableCell className="tabular-nums font-medium">{formatCurrency(acct.credit_limit || 0)}</TableCell>
                    <TableCell>
                      <span className={`font-medium tabular-nums ${acct.ar_balance > 0 ? 'text-gold-600' : 'text-sage-600'}`}>
                        {formatCurrency(acct.ar_balance)}
                      </span>
                    </TableCell>
                    <TableCell className="tabular-nums">{acct.total_bookings}</TableCell>
                    <TableCell>
                      <Badge variant={STATUS_VARIANT[acct.status] || 'neutral'} dot>{acct.status}</Badge>
                    </TableCell>
                    <TableCell className="w-10">
                      <RowMenu
                        acct={acct}
                        onView={() => setSelectedAccount(acct)}
                        onEdit={() => openEdit(acct)}
                        onDeactivate={() => setDeleteTarget(acct)}
                      />
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
                totalItems={accounts.length}
                itemsPerPage={perPage}
                onPageChange={setPage}
              />
            </div>
          )}
        </div>
      </div>

      <AccountDrawer
        isOpen={drawerOpen}
        onClose={closeDrawer}
        onSave={editAccount ? handleUpdate : handleCreate}
        initial={editAccount}
      />

      <DetailDrawer
        account={selectedAccount}
        isOpen={!!selectedAccount}
        onClose={() => setSelectedAccount(null)}
        onEdit={openEdit}
        navigate={navigate}
      />

      <ConfirmModal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title={`Deactivate "${deleteTarget?.company_name}"?`}
        description="This corporate account will be marked as inactive."
        confirmText="Deactivate"
        cancelText="Cancel"
        variant="danger"
      />
    </div>
  );
}
