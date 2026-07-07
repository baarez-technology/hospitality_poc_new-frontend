/**
 * NightAudit — Run night audit, view business date & pre-audit checklist.
 * Unified "Audit Control Center" with clear workflow:
 *   Status → Readiness Check → Run → Results → Next Steps
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Moon, Calendar, Clock, AlertTriangle, CheckCircle2, Loader2,
  ArrowRight, Users, FileText, Settings, ClipboardCheck,
  TrendingUp, DollarSign, Hotel, ChevronDown, ChevronUp,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { frontdeskService } from '@/api/services/frontdesk.service';
import { apiClient } from '@/api/client';
import { Button } from '@/components/ui2/Button';
import { Badge } from '@/components/ui2/Badge';
import {
  Modal, ModalHeader, ModalTitle, ModalDescription, ModalContent, ModalFooter,
} from '@/components/ui2/Modal';
import { useToast } from '@/contexts/ToastContext';
import { useCurrency } from '@/hooks/useCurrency';

interface AuditResult {
  audit_date?: string;
  status?: string;
  new_business_date?: string;
  occupancy_rate?: number;
  in_house?: number;
  total_rooms?: number;
  ooo_rooms?: number;
  arrivals?: number;
  departures?: number;
  no_shows?: number;
  auto_checkouts?: number;
  room_charges_posted?: number;
  room_charge_revenue?: number;
  revenue?: {
    room?: number;
    fnb?: number;
    other?: number;
    tax?: number;
    total?: number;
    payments_received?: number;
  };
  statistics?: {
    adr?: number;
    revpar?: number;
  };
  rooms_set_dirty?: number;
  rooms_returned_from_ooo?: number;
  expired_auth_holds?: number;
  ar_postings_aged?: number;
  blockers_resolved?: Array<{
    type: string;
    count: number;
    auto_resolved?: boolean;
    message: string;
    bookings?: Array<{ id: number; guest_name: string; room?: string }>;
  }>;
  charge_errors?: string[];
  notes?: string;
  procedure_log?: Array<{
    step: string;
    status: string;
    detail: string;
    count: number;
    timestamp: string;
  }>;
  message?: string;
  warnings?: string[];
}

/* ── Checklist Item ──────────────────────────────────────────────────────── */
function ChecklistItem({ icon: Icon, label, status, value, variant = 'neutral' }: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  status: 'ok' | 'warning' | 'info';
  value: React.ReactNode;
  variant?: string;
}) {
  return (
    <div className="flex items-center justify-between p-3.5 rounded-[10px] bg-neutral-50/70 border border-neutral-100">
      <div className="flex items-center gap-3">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
          status === 'ok' ? 'bg-sage-50' : status === 'warning' ? 'bg-gold-50' : 'bg-ocean-50'
        }`}>
          <Icon className={`w-4 h-4 ${
            status === 'ok' ? 'text-sage-600' : status === 'warning' ? 'text-gold-600' : 'text-ocean-600'
          }`} />
        </div>
        <span className="text-[13px] text-neutral-700">{label}</span>
      </div>
      <div className="flex items-center gap-2">
        {status === 'ok' && <CheckCircle2 className="w-4 h-4 text-sage-500" />}
        {status === 'warning' && <AlertTriangle className="w-4 h-4 text-gold-500" />}
        <span className={`text-[13px] font-semibold ${
          status === 'ok' ? 'text-sage-700' : status === 'warning' ? 'text-gold-700' : 'text-ocean-700'
        }`}>
          {value}
        </span>
      </div>
    </div>
  );
}

/* ── Metric Card (for results) ──────────────────────────────────────────── */
function MetricCard({ label, value, icon: Icon, color }: {
  label: string;
  value: React.ReactNode;
  icon: React.ComponentType<{ className?: string }>;
  color: 'terra' | 'sage' | 'ocean' | 'gold';
}) {
  const colors = {
    terra: { bg: 'bg-terra-50', icon: 'text-terra-600' },
    sage: { bg: 'bg-sage-50', icon: 'text-sage-600' },
    ocean: { bg: 'bg-ocean-50', icon: 'text-ocean-600' },
    gold: { bg: 'bg-gold-50', icon: 'text-gold-600' },
  };
  const c = colors[color];
  return (
    <div className="bg-white rounded-[10px] border border-neutral-100 p-4 sm:p-5">
      <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
        <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg ${c.bg} flex items-center justify-center`}>
          <Icon className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${c.icon}`} />
        </div>
        <p className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-widest text-neutral-400">{label}</p>
      </div>
      <p className="text-xl sm:text-2xl font-semibold tracking-tight text-neutral-900">{value}</p>
    </div>
  );
}

/* ── Procedure Log Step ─────────────────────────────────────────────────── */
function ProcedureStep({ step, isLast }: {
  step: { step: string; status: string; detail: string; count: number; timestamp: string };
  isLast: boolean;
}) {
  const isComplete = step.status === 'completed' || step.status === 'done';
  const isFailed = step.status === 'failed' || step.status === 'error';
  return (
    <div className="flex gap-3">
      <div className="flex flex-col items-center">
        <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
          isComplete ? 'bg-sage-100' : isFailed ? 'bg-rose-100' : 'bg-neutral-100'
        }`}>
          {isComplete && <CheckCircle2 className="w-3.5 h-3.5 text-sage-600" />}
          {isFailed && <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />}
          {!isComplete && !isFailed && <div className="w-2 h-2 rounded-full bg-neutral-300" />}
        </div>
        {!isLast && <div className={`w-px flex-1 min-h-[16px] ${isComplete ? 'bg-sage-200' : 'bg-neutral-200'}`} />}
      </div>
      <div className="pb-3 flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <p className="text-[13px] font-medium text-neutral-800">{step.step}</p>
          {step.count > 0 && (
            <Badge variant={isComplete ? 'success' : isFailed ? 'danger' : 'neutral'} size="xs">
              {step.count}
            </Badge>
          )}
        </div>
        <p className="text-[11px] text-neutral-500 mt-0.5">{step.detail}</p>
      </div>
    </div>
  );
}

/* ── Main Page ───────────────────────────────────────────────────────────── */
export default function NightAudit() {
  const navigate = useNavigate();
  const [businessDate, setBusinessDate] = useState<string>('');
  const [config, setConfig] = useState<any>(null);
  const [pendingDepartures, setPendingDepartures] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [result, setResult] = useState<AuditResult | null>(null);
  const [showCutoffEdit, setShowCutoffEdit] = useState(false);
  const [editCutoff, setEditCutoff] = useState('03:00');
  const [savingCutoff, setSavingCutoff] = useState(false);
  const [showProcedureLog, setShowProcedureLog] = useState(false);
  const { success, error } = useToast();
  const { formatSimple } = useCurrency();
  const resultsRef = useRef<HTMLDivElement>(null);

  const fetchData = useCallback(async () => {
    try {
      const [bdRes, configRes, depRes] = await Promise.all([
        frontdeskService.getBusinessDate().catch(() => null),
        frontdeskService.getHotelConfig().catch(() => null),
        frontdeskService.getDepartures().catch(() => []),
      ]);

      if (bdRes?.business_date) {
        setBusinessDate(bdRes.business_date);
      } else if (typeof bdRes === 'string') {
        setBusinessDate(bdRes);
      }

      setConfig(configRes);

      const deps = Array.isArray(depRes) ? depRes : (depRes?.data || []);
      setPendingDepartures(Array.isArray(deps) ? deps.length : 0);
    } catch (err) {
      console.error('Failed to load night audit data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const getNextDate = (dateStr: string) => {
    if (!dateStr) return '';
    const d = new Date(dateStr + 'T00:00:00');
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '—';
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatWeekday = (dateStr: string) => {
    if (!dateStr) return '';
    return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long' });
  };

  const handleRunAudit = async () => {
    setShowConfirm(false);
    setRunning(true);
    setResult(null);
    try {
      const res = await frontdeskService.runNightAudit();
      setResult(res);
      success('Night audit completed successfully');
      await fetchData();
      // Auto-scroll to results
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    } catch (err: any) {
      const detail = err?.response?.data?.detail || err?.message || 'Night audit failed';
      error(detail);
      setResult({ message: detail, warnings: [detail] });
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    } finally {
      setRunning(false);
    }
  };

  const handleSaveCutoff = async () => {
    setSavingCutoff(true);
    try {
      await apiClient.put('/api/v1/config', { night_audit_cutoff: editCutoff });
      setConfig((prev: any) => ({ ...prev, night_audit_cutoff: editCutoff }));
      setShowCutoffEdit(false);
      success(`Audit cutoff updated to ${editCutoff}`);
    } catch {
      error('Failed to update cutoff time');
    } finally {
      setSavingCutoff(false);
    }
  };

  const isReady = pendingDepartures === 0;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#F9F7F7' }}>
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-7 h-7 animate-spin text-terra-500" />
          <p className="text-[13px] text-neutral-500 animate-pulse">Loading night audit...</p>
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
            <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-neutral-900">Night Audit</h1>
            <p className="text-[12px] sm:text-[13px] text-neutral-500 mt-1">
              Post room charges, resolve blockers, and advance the business date
            </p>
          </div>
          {config?.night_audit_cutoff && (
            <button
              onClick={() => { setEditCutoff(config.night_audit_cutoff); setShowCutoffEdit(true); }}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-[12px] text-neutral-500 hover:text-neutral-700 bg-white border border-neutral-200 rounded-lg hover:border-neutral-300 transition-colors"
            >
              <Clock className="w-3.5 h-3.5" />
              Cutoff: {config.night_audit_cutoff}
              <Settings className="w-3 h-3 ml-0.5 text-neutral-400" />
            </button>
          )}
        </div>

        {/* ─── Status Cards Row ─────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Business Date */}
          <div className="bg-white rounded-[10px] border border-neutral-100 p-4 sm:p-5">
            <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-terra-50 flex items-center justify-center">
                <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-terra-600" />
              </div>
              <p className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-widest text-neutral-400">
                Current Business Date
              </p>
            </div>
            <p className="text-lg sm:text-xl font-semibold tracking-tight text-neutral-900">
              {formatDate(businessDate)}
            </p>
            <p className="text-[10px] sm:text-[11px] text-neutral-400 font-medium mt-1">
              {formatWeekday(businessDate)}
            </p>
          </div>

          {/* Will Advance To */}
          <div className="bg-white rounded-[10px] border border-neutral-100 p-4 sm:p-5">
            <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-ocean-50 flex items-center justify-center">
                <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-ocean-600" />
              </div>
              <p className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-widest text-neutral-400">
                Will Advance To
              </p>
            </div>
            <p className="text-lg sm:text-xl font-semibold tracking-tight text-neutral-900">
              {formatDate(getNextDate(businessDate))}
            </p>
            <p className="text-[10px] sm:text-[11px] text-neutral-400 font-medium mt-1">
              {formatWeekday(getNextDate(businessDate))}
            </p>
          </div>

          {/* Readiness Status */}
          <div className="bg-white rounded-[10px] border border-neutral-100 p-4 sm:p-5">
            <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
              <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center ${
                isReady ? 'bg-sage-50' : 'bg-gold-50'
              }`}>
                {isReady
                  ? <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-sage-600" />
                  : <AlertTriangle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gold-600" />
                }
              </div>
              <p className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-widest text-neutral-400">
                Audit Readiness
              </p>
            </div>
            <p className="text-xl sm:text-2xl font-semibold tracking-tight text-neutral-900">
              {isReady ? 'Ready' : 'Attention Needed'}
            </p>
            <p className={`text-[10px] sm:text-[11px] font-medium mt-1 ${isReady ? 'text-sage-600' : 'text-gold-600'}`}>
              {isReady ? 'All pre-checks passed' : `${pendingDepartures} issue${pendingDepartures !== 1 ? 's' : ''} to review`}
            </p>
          </div>
        </div>

        {/* ─── Pre-Audit Checklist + Run ──────────────────────────────────── */}
        <div className="bg-white rounded-[10px] border border-neutral-100 overflow-hidden">
          <div className="p-5 sm:p-6">
            <h2 className="text-[14px] font-semibold text-neutral-900 mb-4">Pre-Audit Checklist</h2>

            <div className="space-y-2.5">
              <ChecklistItem
                icon={Users}
                label="Pending departures (today)"
                status={pendingDepartures === 0 ? 'ok' : 'warning'}
                value={pendingDepartures === 0 ? 'All clear' : `${pendingDepartures} pending`}
              />
              <ChecklistItem
                icon={Calendar}
                label="Business date advance"
                status="info"
                value={`${businessDate} → ${getNextDate(businessDate)}`}
              />
              <ChecklistItem
                icon={FileText}
                label="Room charge posting"
                status="ok"
                value="Will post for all in-house guests"
              />
            </div>

            {pendingDepartures > 0 && (
              <div className="mt-4 p-3 bg-gold-50 border border-gold-200 rounded-lg flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-gold-600 mt-0.5 flex-shrink-0" />
                <p className="text-[12px] text-gold-700">
                  <strong>{pendingDepartures} departure{pendingDepartures !== 1 ? 's' : ''}</strong> not yet checked out.
                  These guests should be processed before running the night audit to avoid auto-checkout.
                </p>
              </div>
            )}
          </div>

          {/* Run Action Bar */}
          <div className="px-5 sm:px-6 py-4 bg-neutral-50/50 border-t border-neutral-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <p className="text-[13px] font-medium text-neutral-700">
                {isReady ? 'All checks passed — ready to run' : 'Review items above before proceeding'}
              </p>
              <p className="text-[11px] text-neutral-400 mt-0.5">
                This action is irreversible. Room charges will be posted and the business date will advance.
              </p>
            </div>
            <Button
              variant="primary"
              size="lg"
              icon={running ? Loader2 : Moon}
              onClick={() => setShowConfirm(true)}
              disabled={running}
              className={`w-full sm:w-auto flex-shrink-0 ${running ? '[&_svg]:animate-spin' : ''}`}
            >
              {running ? 'Running Audit...' : 'Run Night Audit'}
            </Button>
          </div>
        </div>

        {/* ─── Confirm Modal ──────────────────────────────────────────────── */}
        <Modal open={showConfirm} onClose={() => setShowConfirm(false)} maxWidth="md">
          <ModalHeader icon={AlertTriangle}>
            <ModalTitle>Confirm Night Audit</ModalTitle>
            <ModalDescription>
              This will perform the following irreversible actions for business date {businessDate}:
            </ModalDescription>
          </ModalHeader>
          <ModalContent>
            <div className="space-y-2">
              {[
                'Mark unresolved arrivals as No-Show',
                'Auto-checkout overdue departures',
                'Post nightly room charges (with tax) for all in-house guests',
                'Sync room statuses (occupied → dirty for housekeeping)',
                'Return OOO rooms past return date, update AR aging, flag expired holds',
                `Calculate statistics (ADR, RevPAR) and advance business date to ${getNextDate(businessDate)}`,
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-2.5 p-2 rounded-lg bg-neutral-50">
                  <span className="w-5 h-5 rounded-full bg-terra-100 text-terra-600 text-[11px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  <p className="text-[12px] text-neutral-600">{item}</p>
                </div>
              ))}
            </div>
          </ModalContent>
          <ModalFooter>
            <Button variant="ghost" onClick={() => setShowConfirm(false)}>Cancel</Button>
            <Button variant="primary" icon={Moon} onClick={handleRunAudit}>
              Confirm & Run
            </Button>
          </ModalFooter>
        </Modal>

        {/* ─── Cutoff Edit Modal ──────────────────────────────────────────── */}
        <Modal open={showCutoffEdit} onClose={() => setShowCutoffEdit(false)} maxWidth="sm">
          <ModalHeader icon={Clock}>
            <ModalTitle>Night Audit Cutoff</ModalTitle>
            <ModalDescription>
              Set the time after which the night audit should run. The system will use this as the operational cutoff.
            </ModalDescription>
          </ModalHeader>
          <ModalContent>
            <div>
              <label className="block text-[12px] font-semibold text-neutral-600 mb-1.5">Cutoff Time</label>
              <input
                type="time"
                value={editCutoff}
                onChange={e => setEditCutoff(e.target.value)}
                className="w-full px-4 py-2.5 text-sm bg-white border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-terra-500/30 focus:border-terra-400"
              />
            </div>
          </ModalContent>
          <ModalFooter>
            <Button variant="ghost" onClick={() => setShowCutoffEdit(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleSaveCutoff} disabled={savingCutoff} loading={savingCutoff}>
              Save
            </Button>
          </ModalFooter>
        </Modal>

        {/* ─── Results ────────────────────────────────────────────────────── */}
        {result && (
          <div ref={resultsRef} className="space-y-4 sm:space-y-6">
            {/* Status banner */}
            <div className={`rounded-[10px] border p-4 flex items-center gap-3 ${
              result.status === 'completed'
                ? 'bg-sage-50 border-sage-200'
                : result.warnings?.length
                  ? 'bg-gold-50 border-gold-200'
                  : 'bg-rose-50 border-rose-200'
            }`}>
              {result.status === 'completed' ? (
                <CheckCircle2 className="w-5 h-5 text-sage-600 flex-shrink-0" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-gold-600 flex-shrink-0" />
              )}
              <div className="flex-1">
                <p className="text-[14px] font-semibold text-neutral-900">
                  {result.status === 'completed' ? 'Night Audit Completed Successfully' : 'Night Audit Completed with Warnings'}
                </p>
                <p className="text-[12px] text-neutral-500 mt-0.5">
                  {result.audit_date && `Audit date: ${result.audit_date}`}
                  {result.new_business_date && ` — New business date: ${result.new_business_date}`}
                </p>
              </div>
              <Badge variant={result.status === 'completed' ? 'success' : 'warning'}>
                {result.status || 'error'}
              </Badge>
            </div>

            {/* Key Metrics Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {result.new_business_date && (
                <div className="bg-white rounded-[10px] border border-neutral-100 p-4 sm:p-5">
                  <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-terra-50 flex items-center justify-center">
                      <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-terra-600" />
                    </div>
                    <p className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-widest text-neutral-400">New Business Date</p>
                  </div>
                  <p className="text-lg sm:text-xl font-semibold tracking-tight text-neutral-900">{formatDate(result.new_business_date)}</p>
                  <p className="text-[10px] sm:text-[11px] text-neutral-400 font-medium mt-1">{formatWeekday(result.new_business_date)}</p>
                </div>
              )}
              {typeof result.room_charges_posted === 'number' && (
                <MetricCard
                  label="Charges Posted"
                  value={result.room_charges_posted}
                  icon={DollarSign}
                  color="sage"
                />
              )}
              {typeof result.room_charge_revenue === 'number' && (
                <MetricCard
                  label="Revenue (incl. tax)"
                  value={formatSimple(result.room_charge_revenue)}
                  icon={TrendingUp}
                  color="sage"
                />
              )}
              {typeof result.occupancy_rate === 'number' && (
                <MetricCard
                  label="Occupancy Rate"
                  value={`${result.occupancy_rate.toFixed(1)}%`}
                  icon={Hotel}
                  color="ocean"
                />
              )}
            </div>

            {/* Detail cards — 2 column layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Operations Summary */}
              <div className="bg-white rounded-[10px] border border-neutral-100 p-5">
                <h3 className="text-[13px] font-semibold text-neutral-900 mb-3">Operations Summary</h3>
                <div className="space-y-2 text-[12px]">
                  {typeof result.in_house === 'number' && (
                    <div className="flex justify-between py-1">
                      <span className="text-neutral-600">In-house guests</span>
                      <span className="font-semibold text-neutral-900">{result.in_house}</span>
                    </div>
                  )}
                  {typeof result.arrivals === 'number' && (
                    <div className="flex justify-between py-1">
                      <span className="text-neutral-600">Arrivals</span>
                      <span className="font-semibold text-neutral-900">{result.arrivals}</span>
                    </div>
                  )}
                  {typeof result.departures === 'number' && (
                    <div className="flex justify-between py-1">
                      <span className="text-neutral-600">Departures</span>
                      <span className="font-semibold text-neutral-900">{result.departures}</span>
                    </div>
                  )}
                  {typeof result.no_shows === 'number' && result.no_shows > 0 && (
                    <div className="flex justify-between py-1">
                      <span className="text-gold-700">No-shows marked</span>
                      <Badge variant="warning" size="xs">{result.no_shows}</Badge>
                    </div>
                  )}
                  {typeof result.auto_checkouts === 'number' && result.auto_checkouts > 0 && (
                    <div className="flex justify-between py-1">
                      <span className="text-gold-700">Auto-checkouts</span>
                      <Badge variant="warning" size="xs">{result.auto_checkouts}</Badge>
                    </div>
                  )}
                  {typeof result.rooms_set_dirty === 'number' && result.rooms_set_dirty > 0 && (
                    <div className="flex justify-between py-1">
                      <span className="text-neutral-600">Rooms set to dirty</span>
                      <span className="font-semibold text-neutral-900">{result.rooms_set_dirty}</span>
                    </div>
                  )}
                  {typeof result.rooms_returned_from_ooo === 'number' && result.rooms_returned_from_ooo > 0 && (
                    <div className="flex justify-between py-1">
                      <span className="text-neutral-600">Rooms returned from OOO</span>
                      <span className="font-semibold text-neutral-900">{result.rooms_returned_from_ooo}</span>
                    </div>
                  )}
                  {typeof result.expired_auth_holds === 'number' && result.expired_auth_holds > 0 && (
                    <div className="flex justify-between py-1">
                      <span className="text-gold-700">Expired auth holds flagged</span>
                      <Badge variant="warning" size="xs">{result.expired_auth_holds}</Badge>
                    </div>
                  )}
                  {typeof result.ar_postings_aged === 'number' && result.ar_postings_aged > 0 && (
                    <div className="flex justify-between py-1">
                      <span className="text-neutral-600">AR postings aged to overdue</span>
                      <span className="font-semibold text-neutral-900">{result.ar_postings_aged}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Revenue Summary */}
              {result.revenue && typeof result.revenue === 'object' && (
                <div className="bg-white rounded-[10px] border border-neutral-100 p-5">
                  <h3 className="text-[13px] font-semibold text-neutral-900 mb-3">Revenue Summary</h3>
                  <div className="space-y-2 text-[12px]">
                    <div className="flex justify-between py-1">
                      <span className="text-neutral-600">Room Revenue</span>
                      <span className="font-semibold text-neutral-900">{formatSimple(result.revenue.room || 0)}</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-neutral-600">F&B Revenue</span>
                      <span className="font-semibold text-neutral-900">{formatSimple(result.revenue.fnb || 0)}</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-neutral-600">Other Revenue</span>
                      <span className="font-semibold text-neutral-900">{formatSimple(result.revenue.other || 0)}</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-t border-neutral-100 mt-1">
                      <span className="text-neutral-900 font-semibold">Total Revenue</span>
                      <span className="font-bold text-sage-700 text-[13px]">{formatSimple(result.revenue.total || 0)}</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-neutral-600">Tax Collected</span>
                      <span className="font-semibold text-neutral-900">{formatSimple(result.revenue.tax || 0)}</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-neutral-600">Payments Received</span>
                      <span className="font-semibold text-neutral-900">{formatSimple(result.revenue.payments_received || 0)}</span>
                    </div>
                  </div>

                  {/* KPIs inline */}
                  {result.statistics && (result.statistics.adr || result.statistics.revpar) && (
                    <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-neutral-100">
                      <div className="bg-neutral-50 rounded-lg p-3">
                        <p className="text-[10px] font-semibold text-neutral-400 uppercase">ADR</p>
                        <p className="text-[16px] font-bold text-neutral-900 mt-0.5">{formatSimple(result.statistics.adr || 0)}</p>
                        <p className="text-[10px] text-neutral-400">Avg Daily Rate</p>
                      </div>
                      <div className="bg-neutral-50 rounded-lg p-3">
                        <p className="text-[10px] font-semibold text-neutral-400 uppercase">RevPAR</p>
                        <p className="text-[16px] font-bold text-neutral-900 mt-0.5">{formatSimple(result.statistics.revpar || 0)}</p>
                        <p className="text-[10px] text-neutral-400">Rev Per Available Room</p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Procedure Log (collapsible) */}
            {result.procedure_log && result.procedure_log.length > 0 && (
              <div className="bg-white rounded-[10px] border border-neutral-100">
                <button
                  onClick={() => setShowProcedureLog(!showProcedureLog)}
                  className="w-full flex items-center justify-between p-5 text-left hover:bg-neutral-50/50 transition-colors rounded-[10px]"
                >
                  <div className="flex items-center gap-2">
                    <h3 className="text-[13px] font-semibold text-neutral-900">Procedure Log</h3>
                    <Badge variant="neutral" size="xs">{result.procedure_log.length} steps</Badge>
                  </div>
                  {showProcedureLog ? (
                    <ChevronUp className="w-4 h-4 text-neutral-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-neutral-400" />
                  )}
                </button>
                {showProcedureLog && (
                  <div className="px-5 pb-5 pt-0">
                    {result.procedure_log.map((step, i) => (
                      <ProcedureStep
                        key={i}
                        step={step}
                        isLast={i === (result.procedure_log?.length ?? 0) - 1}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Blockers Resolved */}
            {result.blockers_resolved && result.blockers_resolved.length > 0 && (
              <div className="bg-gold-50 border border-gold-200 rounded-[10px] p-5">
                <h3 className="text-[13px] font-semibold text-gold-800 mb-3 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  Blockers Resolved
                </h3>
                <div className="space-y-2">
                  {result.blockers_resolved.map((b, i) => (
                    <div key={i} className="flex items-center gap-2 p-2 bg-white/60 rounded-lg">
                      <CheckCircle2 className="w-3.5 h-3.5 text-gold-600 flex-shrink-0" />
                      <p className="text-[12px] text-gold-800 flex-1">{b.message}</p>
                      {b.auto_resolved && (
                        <Badge variant="warning" size="xs">auto</Badge>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Charge Errors */}
            {result.charge_errors && result.charge_errors.length > 0 && (
              <div className="bg-rose-50 border border-rose-200 rounded-[10px] p-5">
                <h3 className="text-[13px] font-semibold text-rose-800 mb-3 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  Charge Posting Errors
                </h3>
                <div className="space-y-1.5">
                  {result.charge_errors.map((err, i) => (
                    <p key={i} className="text-[12px] text-rose-700 flex items-start gap-2 p-2 bg-white/60 rounded-lg">
                      <AlertTriangle className="w-3 h-3 mt-0.5 flex-shrink-0" /> {err}
                    </p>
                  ))}
                </div>
              </div>
            )}

            {/* Fallback error */}
            {result.message && !result.status && (
              <div className="bg-rose-50 border border-rose-200 rounded-[10px] p-5">
                <p className="text-[13px] text-rose-700 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                  {result.message}
                </p>
              </div>
            )}

            {/* Next Steps */}
            {result.status === 'completed' && (
              <div className="bg-white rounded-[10px] border border-neutral-100 p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-[14px] font-semibold text-neutral-900">Next Step: Sign-Off Chain</h3>
                  <p className="text-[12px] text-neutral-500 mt-0.5">
                    The audit pack is ready for review. Proceed to the sign-off chain for Duty Manager, General Manager, and Finance Controller approval.
                  </p>
                </div>
                <Button
                  variant="outline"
                  icon={ClipboardCheck}
                  onClick={() => navigate('/admin/audit-pack')}
                  className="flex-shrink-0 w-full sm:w-auto"
                >
                  Go to Audit Pack
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
