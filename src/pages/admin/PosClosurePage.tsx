/**
 * PosClosurePage — Confirm POS outlet closures before night audit.
 * Structured list with inline forms, progress KPIs, confirm modal, and Night Audit CTA.
 */

import { useState, useEffect, useCallback } from 'react';
import {
  Store, CheckCircle2, Clock, Plus, RefreshCw, Loader2,
  ArrowRight, DollarSign, AlertCircle, ChevronDown, ChevronUp,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { posClosureService, type PosClosureStatus } from '@/api/services/pos-closure.service';
import { useToast } from '@/contexts/ToastContext';
import { useCurrency } from '@/hooks/useCurrency';
import { Button, IconButton } from '@/components/ui2/Button';
import { Badge } from '@/components/ui2/Badge';
import { ConfirmModal } from '@/components/ui2/Modal';
import DatePicker from '@/components/ui2/DatePicker';

interface OutletStatus {
  outlet_id: number;
  outlet_code: string;
  outlet_name: string;
  audit_date: string;
  close_status: string;
  closing_revenue: number | null;
  open_checks: number | null;
  confirmed_by: number | null;
  confirmed_at: string | null;
}

export default function PosClosurePage() {
  const navigate = useNavigate();
  const [status, setStatus] = useState<PosClosureStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [auditDate, setAuditDate] = useState('');
  const [confirmingId, setConfirmingId] = useState<number | null>(null);
  const [seeding, setSeeding] = useState(false);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [confirmOutlet, setConfirmOutlet] = useState<OutletStatus | null>(null);
  const { success, error } = useToast();
  const { formatSimple } = useCurrency();

  // Per-outlet form state
  const [outletForms, setOutletForms] = useState<Record<number, { revenue: string; openChecks: string; notes: string }>>({});

  const fetchStatus = useCallback(async () => {
    setLoading(true);
    try {
      const data = await posClosureService.getStatus(auditDate || undefined);
      setStatus(data);
    } catch {
      error('Failed to load POS status');
    }
    setLoading(false);
  }, [auditDate]);

  useEffect(() => { fetchStatus(); }, [fetchStatus]);

  const handleSeedDefaults = async () => {
    setSeeding(true);
    try {
      await posClosureService.seedDefaults();
      success('Default outlets created');
      fetchStatus();
    } catch (err: any) {
      error(err?.response?.data?.detail || 'Failed to seed');
    }
    setSeeding(false);
  };

  const handleConfirm = async (outletId: number) => {
    const form = outletForms[outletId] || { revenue: '', openChecks: '', notes: '' };
    setConfirmOutlet(null);
    setConfirmingId(outletId);
    try {
      await posClosureService.confirmOutlet(
        outletId,
        {
          closing_revenue: form.revenue ? parseFloat(form.revenue) : undefined,
          open_checks: form.openChecks ? parseInt(form.openChecks) : undefined,
          discrepancy_notes: form.notes || undefined,
        },
        auditDate || undefined
      );
      success('Outlet confirmed');
      setExpandedId(null);
      fetchStatus();
    } catch (err: any) {
      error(err?.response?.data?.detail || 'Failed to confirm');
    }
    setConfirmingId(null);
  };

  const updateForm = (outletId: number, field: string, value: string) => {
    setOutletForms(prev => ({
      ...prev,
      [outletId]: { ...(prev[outletId] || { revenue: '', openChecks: '', notes: '' }), [field]: value },
    }));
  };

  const outlets: OutletStatus[] = status?.outlets || [];
  const pendingOutlets = outlets.filter(o => o.close_status !== 'confirmed');
  const confirmedOutlets = outlets.filter(o => o.close_status === 'confirmed');

  const inputCls = 'w-full px-4 py-2.5 text-sm bg-[#FAF8F6] border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-terra-500/30 focus:border-terra-400';

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#F9F7F7' }}>
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-7 h-7 animate-spin text-terra-500" />
          <p className="text-[13px] text-neutral-500 animate-pulse">Loading POS closures...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F9F7F7' }}>
      <div className="px-4 sm:px-6 lg:px-10 py-4 sm:py-6 space-y-4 sm:space-y-6">

        {/* ─── Header ─────────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-neutral-900">POS Closure</h1>
            <p className="text-[12px] sm:text-[13px] text-neutral-500 mt-1">
              Confirm outlet closures before night audit
            </p>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-[160px]">
              <DatePicker
                value={auditDate}
                onChange={setAuditDate}
                placeholder="Audit date"
                className="w-full"
              />
            </div>
            <IconButton
              icon={RefreshCw}
              variant="outline"
              size="sm"
              onClick={fetchStatus}
              aria-label="Refresh"
            />
          </div>
        </div>

        {/* ─── KPI Cards ──────────────────────────────────────────────────── */}
        {status && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white rounded-[10px] border border-neutral-100 p-4 sm:p-5">
              <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-terra-50 flex items-center justify-center">
                  <Store className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-terra-600" />
                </div>
                <p className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-widest text-neutral-400">Total Outlets</p>
              </div>
              <p className="text-xl sm:text-2xl font-semibold tracking-tight text-neutral-900">{status.total_outlets}</p>
            </div>

            <div className="bg-white rounded-[10px] border border-neutral-100 p-4 sm:p-5">
              <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-sage-50 flex items-center justify-center">
                  <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-sage-600" />
                </div>
                <p className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-widest text-neutral-400">Confirmed</p>
              </div>
              <p className="text-xl sm:text-2xl font-semibold tracking-tight text-neutral-900">{status.confirmed}</p>
              <p className="text-[10px] sm:text-[11px] text-sage-600 font-medium mt-1">
                {status.total_outlets > 0 ? `${Math.round((status.confirmed / status.total_outlets) * 100)}% complete` : '—'}
              </p>
            </div>

            <div className="bg-white rounded-[10px] border border-neutral-100 p-4 sm:p-5">
              <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center ${status.pending > 0 ? 'bg-gold-50' : 'bg-sage-50'}`}>
                  {status.pending > 0
                    ? <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gold-600" />
                    : <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-sage-600" />
                  }
                </div>
                <p className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-widest text-neutral-400">Pending</p>
              </div>
              <p className="text-xl sm:text-2xl font-semibold tracking-tight text-neutral-900">{status.pending}</p>
              {status.pending > 0 && (
                <p className="text-[10px] sm:text-[11px] text-gold-600 font-medium mt-1">Action required</p>
              )}
            </div>
          </div>
        )}

        {/* ─── All Confirmed Banner + Night Audit CTA ─────────────────────── */}
        {status?.all_confirmed && (
          <div className="bg-sage-50 border border-sage-200 rounded-[10px] p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-sage-600 flex-shrink-0" />
              <div>
                <p className="text-[14px] font-semibold text-sage-800">All Outlets Confirmed</p>
                <p className="text-[12px] text-sage-600 mt-0.5">POS closure is complete — you can now proceed to the night audit.</p>
              </div>
            </div>
            <Button
              variant="primary"
              icon={ArrowRight}
              onClick={() => navigate('/admin/night-audit')}
              className="flex-shrink-0 w-full sm:w-auto"
            >
              Go to Night Audit
            </Button>
          </div>
        )}

        {/* ─── No Outlets Empty State ─────────────────────────────────────── */}
        {!loading && outlets.length === 0 && (
          <div className="bg-white rounded-[10px] border border-neutral-100 p-10 text-center">
            <Store className="w-10 h-10 text-neutral-300 mx-auto mb-3" />
            <p className="text-[14px] font-medium text-neutral-600 mb-1">No POS outlets configured</p>
            <p className="text-[12px] text-neutral-400 mb-5">Create default outlets to start tracking closures.</p>
            <Button variant="primary" icon={Plus} onClick={handleSeedDefaults} disabled={seeding} loading={seeding}>
              Seed Default Outlets
            </Button>
          </div>
        )}

        {/* ─── Outlets List ───────────────────────────────────────────────── */}
        {outlets.length > 0 && (
          <div className="bg-white rounded-[10px] border border-neutral-100 overflow-hidden">

            {/* Section Header */}
            <div className="px-4 sm:px-6 py-3 sm:py-4 bg-neutral-50/30 border-b border-neutral-100">
              <div className="flex items-center justify-between">
                <p className="text-[13px] font-semibold text-neutral-700">
                  Outlet Status
                  {status && <span className="text-neutral-400 font-normal ml-2">({status.confirmed}/{status.total_outlets} confirmed)</span>}
                </p>
                {status?.audit_date && (
                  <p className="text-[11px] text-neutral-400">
                    Audit date: <span className="font-medium text-neutral-600">{status.audit_date}</span>
                  </p>
                )}
              </div>
            </div>

            {/* Pending Outlets */}
            {pendingOutlets.length > 0 && (
              <div>
                {pendingOutlets.map((outlet, idx) => {
                  const form = outletForms[outlet.outlet_id] || { revenue: '', openChecks: '', notes: '' };
                  const isExpanded = expandedId === outlet.outlet_id;
                  const isConfirming = confirmingId === outlet.outlet_id;

                  return (
                    <div key={outlet.outlet_id} className={idx > 0 ? 'border-t border-neutral-100' : ''}>
                      {/* Outlet Row */}
                      <button
                        onClick={() => setExpandedId(isExpanded ? null : outlet.outlet_id)}
                        className="w-full px-4 sm:px-6 py-3.5 flex items-center justify-between hover:bg-neutral-50/50 transition-colors text-left"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-gold-50 flex items-center justify-center">
                            <Store className="w-4 h-4 text-gold-600" />
                          </div>
                          <div>
                            <p className="text-[13px] font-semibold text-neutral-900">{outlet.outlet_name}</p>
                            <p className="text-[11px] text-neutral-400">{outlet.outlet_code}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge variant="warning" dot>Pending</Badge>
                          {isExpanded
                            ? <ChevronUp className="w-4 h-4 text-neutral-400" />
                            : <ChevronDown className="w-4 h-4 text-neutral-400" />
                          }
                        </div>
                      </button>

                      {/* Expanded Form */}
                      {isExpanded && (
                        <div className="px-4 sm:px-6 pb-4 sm:pb-5">
                          <div className="bg-neutral-50/50 border border-neutral-100 rounded-[10px] p-4 sm:p-5">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                              <div>
                                <label className="block text-[12px] font-semibold text-neutral-600 mb-1.5">Closing Revenue</label>
                                <input
                                  type="number"
                                  min={0}
                                  step={0.01}
                                  value={form.revenue}
                                  onChange={e => updateForm(outlet.outlet_id, 'revenue', e.target.value)}
                                  className={inputCls}
                                  placeholder="0.00"
                                />
                              </div>
                              <div>
                                <label className="block text-[12px] font-semibold text-neutral-600 mb-1.5">Open Checks</label>
                                <input
                                  type="number"
                                  min={0}
                                  value={form.openChecks}
                                  onChange={e => updateForm(outlet.outlet_id, 'openChecks', e.target.value)}
                                  className={inputCls}
                                  placeholder="0"
                                />
                              </div>
                            </div>
                            <div className="mt-3 sm:mt-4">
                              <label className="block text-[12px] font-semibold text-neutral-600 mb-1.5">Discrepancy Notes</label>
                              <textarea
                                value={form.notes}
                                onChange={e => updateForm(outlet.outlet_id, 'notes', e.target.value)}
                                className={`${inputCls} min-h-[60px] resize-none`}
                                placeholder="Optional notes..."
                              />
                            </div>
                            <div className="mt-4 flex justify-end">
                              <Button
                                variant="primary"
                                icon={CheckCircle2}
                                onClick={() => setConfirmOutlet(outlet)}
                                disabled={isConfirming}
                                loading={isConfirming}
                              >
                                Confirm Closure
                              </Button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Divider between pending and confirmed */}
            {pendingOutlets.length > 0 && confirmedOutlets.length > 0 && (
              <div className="border-t border-neutral-100" />
            )}

            {/* Confirmed Outlets */}
            {confirmedOutlets.map((outlet, idx) => (
              <div
                key={outlet.outlet_id}
                className={`px-4 sm:px-6 py-3.5 flex items-center justify-between ${
                  idx > 0 || pendingOutlets.length > 0 ? 'border-t border-neutral-100' : ''
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-sage-50 flex items-center justify-center">
                    <Store className="w-4 h-4 text-sage-600" />
                  </div>
                  <div>
                    <p className="text-[13px] font-semibold text-neutral-900">{outlet.outlet_name}</p>
                    <p className="text-[11px] text-neutral-400">{outlet.outlet_code}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 sm:gap-6">
                  {outlet.closing_revenue != null && (
                    <div className="hidden sm:block text-right">
                      <p className="text-[10px] text-neutral-400">Revenue</p>
                      <p className="text-[13px] font-semibold text-neutral-900">{formatSimple(outlet.closing_revenue)}</p>
                    </div>
                  )}
                  {outlet.open_checks != null && outlet.open_checks > 0 && (
                    <div className="hidden sm:block text-right">
                      <p className="text-[10px] text-neutral-400">Open Checks</p>
                      <p className="text-[13px] font-semibold text-gold-700">{outlet.open_checks}</p>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Badge variant="success" dot>Confirmed</Badge>
                    {outlet.confirmed_at && (
                      <span className="hidden sm:inline text-[10px] text-neutral-400">
                        {new Date(outlet.confirmed_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ─── Confirm Modal ──────────────────────────────────────────────── */}
        <ConfirmModal
          open={!!confirmOutlet}
          onClose={() => setConfirmOutlet(null)}
          onConfirm={() => confirmOutlet && handleConfirm(confirmOutlet.outlet_id)}
          variant="primary"
          icon={CheckCircle2}
          title={`Confirm ${confirmOutlet?.outlet_name}?`}
          description={`This will mark ${confirmOutlet?.outlet_name} (${confirmOutlet?.outlet_code}) as closed for this audit date. This action cannot be undone.`}
          confirmText="Confirm Closure"
          loading={confirmingId === confirmOutlet?.outlet_id}
        />

      </div>
    </div>
  );
}
