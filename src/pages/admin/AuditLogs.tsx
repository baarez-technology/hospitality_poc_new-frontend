/**
 * AuditLogs — Read-only audit trail viewer with search, filters, and CSV export.
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { ScrollText, Download, X } from 'lucide-react';
import { auditLogService, type AuditLogEntry } from '@/api/services/audit-log.service';
import { apiClient } from '@/api/client';
import { useToast } from '@/contexts/ToastContext';
import { Button } from '@/components/ui2/Button';
import { Badge } from '@/components/ui2/Badge';
import { SearchBar } from '@/components/ui2/SearchBar';
import {
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
  TableEmpty, TableSkeleton, Pagination,
} from '@/components/ui2/Table';

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

/* ── JSON Cell (expandable modal) ───────────────────────────────────────── */
function JsonCell({ value }: { value: any }) {
  const [showModal, setShowModal] = useState(false);
  if (!value) return <span className="text-neutral-300">—</span>;

  // Parse if string
  let parsed: any = value;
  if (typeof value === 'string') {
    try { parsed = JSON.parse(value); } catch { parsed = value; }
  }

  // If it's a plain string (not an object), just show it
  if (typeof parsed === 'string') {
    return <span className="text-[11px] font-mono text-neutral-600 break-all leading-relaxed">{parsed}</span>;
  }

  // For objects, show a summary of keys inline + click to view full
  const entries = Object.entries(parsed);
  const summary = entries.length <= 2
    ? entries.map(([k, v]) => `${k}: ${typeof v === 'object' ? '…' : String(v)}`).join(', ')
    : `${entries.length} fields`;

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="inline-flex items-center gap-1 text-[11px] text-left"
        title="Click to view full JSON"
      >
        <span className="font-mono text-neutral-500 truncate max-w-[120px] block">{summary}</span>
        <svg className="w-3 h-3 text-terra-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
      </button>
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
          <div
            className="relative bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[70vh] flex flex-col"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-neutral-100">
              <h3 className="text-sm font-semibold text-neutral-800">JSON Data</h3>
              <button onClick={() => setShowModal(false)} className="text-neutral-400 hover:text-neutral-600 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5 overflow-auto flex-1">
              <div className="space-y-1.5">
                {entries.map(([key, val]) => (
                  <div key={key} className="flex gap-2 text-[12px]">
                    <span className="font-medium text-terra-700 whitespace-nowrap">{key}:</span>
                    <span className="font-mono text-neutral-600 break-all">
                      {typeof val === 'object' && val !== null ? JSON.stringify(val, null, 2) : String(val ?? '—')}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/* ── Action badge variant ────────────────────────────────────────────────── */
function actionVariant(action: string): 'info' | 'success' | 'danger' | 'warning' | 'neutral' {
  if (action?.includes('create') || action?.includes('add')) return 'success';
  if (action?.includes('delete') || action?.includes('remove')) return 'danger';
  if (action?.includes('update') || action?.includes('edit')) return 'warning';
  return 'info';
}

/* ── Main Page ───────────────────────────────────────────────────────────── */
export default function AuditLogs() {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [entityType, setEntityType] = useState('all');
  const [actionFilter, setActionFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [exporting, setExporting] = useState(false);
  const perPage = 20;
  const { success, error } = useToast();

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const params: any = { limit: 500 };
      if (entityType !== 'all') params.entity_type = entityType;
      if (actionFilter !== 'all') params.action = actionFilter;
      const data = await auditLogService.list(params);
      setLogs(Array.isArray(data) ? data : []);
    } catch {
      error('Failed to load audit logs');
    }
    setLoading(false);
  }, [entityType, actionFilter]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  // Client-side search filter
  const filtered = useMemo(() => {
    if (!search.trim()) return logs;
    const q = search.toLowerCase();
    return logs.filter(l =>
      l.action?.toLowerCase().includes(q) ||
      l.entity_type?.toLowerCase().includes(q) ||
      l.description?.toLowerCase().includes(q) ||
      String(l.entity_id).includes(q)
    );
  }, [logs, search]);

  const paged = useMemo(() => {
    const start = (page - 1) * perPage;
    return filtered.slice(start, start + perPage);
  }, [filtered, page]);
  const totalPages = Math.ceil(filtered.length / perPage);

  const handleExportCSV = async () => {
    setExporting(true);
    try {
      const res = await apiClient.get('/api/v1/audit-logs/export/csv', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = `audit-logs-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
      success('CSV exported');
    } catch {
      error('Export failed');
    }
    setExporting(false);
  };

  const entityTypes = useMemo(() => [...new Set(logs.map(l => l.entity_type).filter(Boolean))], [logs]);
  const actions = useMemo(() => [...new Set(logs.map(l => l.action).filter(Boolean))], [logs]);

  const entityOptions = [{ value: 'all', label: 'All Entities' }, ...entityTypes.map(t => ({ value: t, label: t }))];
  const actionOptions = [{ value: 'all', label: 'All Actions' }, ...actions.map(a => ({ value: a, label: a }))];

  const hasActiveFilters = search || entityType !== 'all' || actionFilter !== 'all';

  return (
    <div className="min-h-screen bg-[#FAF8F6]">
      <div className="px-4 sm:px-6 lg:px-10 py-4 sm:py-6 space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-neutral-900">Audit Logs</h1>
            <p className="text-[12px] sm:text-[13px] text-neutral-500 mt-1">
              {filtered.length} entr{filtered.length !== 1 ? 'ies' : 'y'} total
            </p>
          </div>
          <Button
            variant="outline"
            icon={Download}
            onClick={handleExportCSV}
            disabled={exporting}
            loading={exporting}
          >
            {exporting ? 'Exporting...' : 'Export CSV'}
          </Button>
        </div>

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
                  placeholder="Search logs..."
                  size="sm"
                />
              </div>
              <div className="hidden sm:block sm:flex-1" />
              <FilterSelect
                value={entityType}
                onChange={v => { setEntityType(v); setPage(1); }}
                options={entityOptions}
                placeholder="Entity"
              />
              <FilterSelect
                value={actionFilter}
                onChange={v => { setActionFilter(v); setPage(1); }}
                options={actionOptions}
                placeholder="Action"
              />
              {hasActiveFilters && (
                <button
                  onClick={() => { setSearch(''); setEntityType('all'); setActionFilter('all'); setPage(1); }}
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
              <colgroup>
                <col style={{ width: '130px' }} />
                <col style={{ width: '70px' }} />
                <col style={{ width: '140px' }} />
                <col style={{ width: '100px' }} />
                <col style={{ width: '70px' }} />
                <col style={{ width: '200px' }} />
                <col style={{ width: '140px' }} />
                <col style={{ width: '140px' }} />
                <col style={{ width: '100px' }} />
              </colgroup>
              <TableHeader>
                <TableRow>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>User ID</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Entity Type</TableHead>
                  <TableHead>Entity ID</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Old Value</TableHead>
                  <TableHead>New Value</TableHead>
                  <TableHead>IP</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableSkeleton columns={9} rows={5} />
                ) : paged.length === 0 ? (
                  <TableEmpty
                    colSpan={9}
                    icon={ScrollText}
                    title="No audit logs found"
                    description={hasActiveFilters ? 'Try adjusting your search or filters' : 'Audit logs will appear here as actions are performed'}
                  />
                ) : paged.map(log => (
                  <TableRow key={log.id}>
                    <TableCell className="text-neutral-500 whitespace-nowrap text-[11px]">
                      {new Date(log.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                    </TableCell>
                    <TableCell className="text-neutral-600 text-[12px]">{log.user_id ?? '—'}</TableCell>
                    <TableCell>
                      <Badge variant={actionVariant(log.action)}>{log.action}</Badge>
                    </TableCell>
                    <TableCell className="font-medium text-neutral-700 text-[12px]">{log.entity_type}</TableCell>
                    <TableCell className="font-mono text-neutral-600 text-[12px]">{log.entity_id ?? '—'}</TableCell>
                    <TableCell className="text-neutral-600 text-[12px]">
                      <span className="block max-w-[200px] truncate" title={log.description}>{log.description || '—'}</span>
                    </TableCell>
                    <TableCell className="text-[12px]"><JsonCell value={log.old_value} /></TableCell>
                    <TableCell className="text-[12px]"><JsonCell value={log.new_value} /></TableCell>
                    <TableCell className="text-neutral-400 font-mono text-[11px]">{log.ip_address || '—'}</TableCell>
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
