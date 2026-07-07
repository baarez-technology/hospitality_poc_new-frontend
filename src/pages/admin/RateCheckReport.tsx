/**
 * RateCheckReport — Compares actual rates vs standard room-type base price for checked-in bookings.
 */

import { useState, useEffect, useMemo } from 'react';
import { BarChart3, RefreshCw, X } from 'lucide-react';
import { apiClient } from '@/api/client';
import { useToast } from '@/contexts/ToastContext';
import { useCurrency } from '@/hooks/useCurrency';
import { Button, IconButton } from '@/components/ui2/Button';
import { Badge } from '@/components/ui2/Badge';
import { SearchBar } from '@/components/ui2/SearchBar';
import {
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
  TableEmpty, TableSkeleton, Pagination,
} from '@/components/ui2/Table';

interface RateRow {
  booking_id: number;
  booking_number: string;
  guest_name: string;
  room_number: string;
  room_type: string;
  nights: number;
  actual_rate: number;
  standard_rate: number;
  variance: number;
  variance_pct: number;
  flag: 'match' | 'discount' | 'surcharge';
  arrival_date: string | null;
  departure_date: string | null;
}

interface Summary {
  total_checked_in: number;
  matches: number;
  discounts: number;
  surcharges: number;
  avg_variance_pct: number;
}

/* ── FilterSelect (matches Bookings pattern) ─────────────────────────────── */
function FilterSelect({ value, onChange, options, placeholder }: {
  value: string; onChange: (v: string) => void;
  options: { value: string; label: string }[]; placeholder: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const selectedOption = options.find(opt => opt.value === value);
  const displayLabel = !value || value === 'all' ? placeholder : selectedOption?.label;
  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`h-9 px-2.5 sm:px-3.5 rounded-lg text-xs sm:text-[13px] bg-white border transition-all duration-150 flex items-center gap-1.5 sm:gap-2 focus:outline-none w-full sm:min-w-[140px] ${
          isOpen
            ? 'border-terra-400 ring-2 ring-terra-500/10'
            : value && value !== 'all'
              ? 'border-terra-300 bg-terra-50'
              : 'border-neutral-200 hover:border-neutral-300'
        }`}
      >
        <span className={value && value !== 'all' ? 'text-terra-700 font-medium' : 'text-neutral-500'}>
          {displayLabel}
        </span>
        <svg className={`w-4 h-4 ml-auto transition-transform ${isOpen ? 'rotate-180' : ''} ${value && value !== 'all' ? 'text-terra-500' : 'text-neutral-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute z-50 w-full mt-1 bg-white rounded-lg border border-neutral-200 shadow-lg overflow-hidden min-w-[160px] max-h-[240px] overflow-y-auto">
            {options.map(option => (
              <button
                key={option.value}
                type="button"
                onClick={() => { onChange(option.value); setIsOpen(false); }}
                className={`w-full px-3.5 py-2.5 text-[13px] text-left hover:bg-neutral-50 transition-colors flex items-center justify-between ${
                  value === option.value ? 'bg-terra-50 text-terra-700' : 'text-neutral-700'
                }`}
              >
                {option.label}
                {value === option.value && (
                  <svg className="w-4 h-4 text-terra-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

/* ── Flag → Badge variant ─────────────────────────────────────────────────── */
function flagVariant(flag: string): 'success' | 'warning' | 'danger' {
  if (flag === 'match') return 'success';
  if (flag === 'discount') return 'warning';
  return 'danger';
}

/* ── Main Page ────────────────────────────────────────────────────────────── */
export default function RateCheckReport() {
  const [report, setReport] = useState<RateRow[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [flagFilter, setFlagFilter] = useState('all');
  const [page, setPage] = useState(1);
  const perPage = 20;
  const { success: _, error } = useToast();
  const { formatSimple } = useCurrency();

  const fetchReport = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/api/v1/bookings/rate-check-report');
      const data = res.data;
      setReport(Array.isArray(data.report) ? data.report : []);
      setSummary(data.summary || null);
    } catch {
      error('Failed to load rate check report');
    }
    setLoading(false);
  };

  useEffect(() => { fetchReport(); }, []);

  const filtered = useMemo(() => {
    let rows = report;
    if (flagFilter && flagFilter !== 'all') rows = rows.filter(r => r.flag === flagFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      rows = rows.filter(r =>
        r.booking_number?.toLowerCase().includes(q) ||
        r.guest_name?.toLowerCase().includes(q) ||
        r.room_number?.toLowerCase().includes(q) ||
        r.room_type?.toLowerCase().includes(q)
      );
    }
    return rows;
  }, [report, search, flagFilter]);

  const paged = useMemo(() => filtered.slice((page - 1) * perPage, page * perPage), [filtered, page]);
  const totalPages = Math.ceil(filtered.length / perPage);

  const flagOptions = [
    { value: 'all', label: 'All Flags' },
    { value: 'match', label: 'Match' },
    { value: 'discount', label: 'Discount' },
    { value: 'surcharge', label: 'Surcharge' },
  ];

  const hasActiveFilters = search || flagFilter !== 'all';

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F9F7F7' }}>
      <div className="px-4 sm:px-6 lg:px-10 py-4 sm:py-6 space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-neutral-900">Rate Check Report</h1>
            <p className="text-[12px] sm:text-[13px] text-neutral-500 mt-1">
              Actual vs standard rates for checked-in bookings
            </p>
          </div>
          <Button
            variant="outline"
            icon={RefreshCw}
            onClick={fetchReport}
            disabled={loading}
            loading={loading}
          >
            Refresh
          </Button>
        </div>

        {/* Summary Cards */}
        {summary && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {[
              { label: 'Checked-In', value: summary.total_checked_in, color: 'text-neutral-900' },
              { label: 'Matches', value: summary.matches, color: 'text-emerald-600' },
              { label: 'Discounts', value: summary.discounts, color: 'text-amber-600' },
              { label: 'Surcharges', value: summary.surcharges, color: 'text-red-600' },
              { label: 'Avg Variance', value: `${summary.avg_variance_pct}%`, color: 'text-neutral-900' },
            ].map(c => (
              <div key={c.label} className="bg-white rounded-[10px] border border-neutral-100 px-4 py-3">
                <p className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">{c.label}</p>
                <p className={`text-[20px] font-bold ${c.color}`}>{c.value}</p>
              </div>
            ))}
          </div>
        )}

        {/* Card */}
        <div className="bg-white rounded-[10px] overflow-hidden">
          {/* Filter bar */}
          <div className="px-4 sm:px-6 py-3 sm:py-4 bg-neutral-50/30 border-b border-neutral-100">
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <div className="sm:flex-1 sm:max-w-md w-full">
                <SearchBar
                  value={search}
                  onChange={v => { setSearch(v); setPage(1); }}
                  onClear={() => setSearch('')}
                  placeholder="Search bookings..."
                  size="sm"
                />
              </div>
              <div className="hidden sm:block sm:flex-1" />
              <FilterSelect
                value={flagFilter}
                onChange={v => { setFlagFilter(v); setPage(1); }}
                options={flagOptions}
                placeholder="Flag"
              />
              {hasActiveFilters && (
                <button
                  onClick={() => { setSearch(''); setFlagFilter('all'); setPage(1); }}
                  className="h-9 px-2 sm:px-3 flex items-center gap-1 sm:gap-1.5 text-xs sm:text-[13px] font-medium text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors"
                >
                  <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">Clear</span>
                </button>
              )}
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Booking</TableHead>
                  <TableHead>Guest</TableHead>
                  <TableHead>Room</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Nights</TableHead>
                  <TableHead>Actual Rate</TableHead>
                  <TableHead>Std Rate</TableHead>
                  <TableHead>Variance</TableHead>
                  <TableHead>%</TableHead>
                  <TableHead>Flag</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableSkeleton columns={10} rows={5} />
                ) : paged.length === 0 ? (
                  <TableEmpty
                    colSpan={10}
                    icon={BarChart3}
                    title="No rate data found"
                    description={hasActiveFilters ? 'Try adjusting your search or filters' : 'Rate check data will appear for checked-in bookings'}
                  />
                ) : paged.map(r => (
                  <TableRow key={r.booking_id}>
                    <TableCell className="font-mono font-bold text-neutral-900">{r.booking_number}</TableCell>
                    <TableCell className="text-neutral-700">{r.guest_name}</TableCell>
                    <TableCell className="font-mono text-neutral-700">{r.room_number}</TableCell>
                    <TableCell className="text-neutral-600">{r.room_type}</TableCell>
                    <TableCell className="text-neutral-600">{r.nights}</TableCell>
                    <TableCell className="font-semibold text-neutral-900">{formatSimple(r.actual_rate)}</TableCell>
                    <TableCell className="text-neutral-600">{formatSimple(r.standard_rate)}</TableCell>
                    <TableCell className={`font-semibold ${r.variance < 0 ? 'text-amber-600' : r.variance > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                      {r.variance > 0 ? '+' : ''}{formatSimple(r.variance)}
                    </TableCell>
                    <TableCell className={r.variance_pct < 0 ? 'text-amber-600' : r.variance_pct > 0 ? 'text-red-600' : 'text-neutral-500'}>
                      {r.variance_pct > 0 ? '+' : ''}{r.variance_pct}%
                    </TableCell>
                    <TableCell>
                      <Badge variant={flagVariant(r.flag)}>{r.flag}</Badge>
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
      </div>
    </div>
  );
}
