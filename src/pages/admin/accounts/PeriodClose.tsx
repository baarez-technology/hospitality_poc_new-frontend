/**
 * Period Close — Matches admin design: current period card + checklist + history table.
 */
import { useState } from 'react';
import { Calendar, Lock, CheckCircle, Circle, AlertTriangle, X } from 'lucide-react';
import { MOCK_PERIODS, PRE_CLOSE_CHECKS, PERIOD_STATUS_CONFIG, type FiscalPeriod } from '../../../utils/accounts';
import { Badge } from '../../../components/ui2/Badge';
import { Button } from '../../../components/ui2/Button';
import toast from 'react-hot-toast';

const STATUS_VARIANTS: Record<string, string> = { open: 'success', closed: 'neutral', locked: 'danger' };

export default function PeriodClose() {
  const [periods, setPeriods] = useState<FiscalPeriod[]>(MOCK_PERIODS);
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [checks, setChecks] = useState<Record<string, boolean>>(
    Object.fromEntries(PRE_CLOSE_CHECKS.map(c => [c.id, c.autoCheck]))
  );
  const [closing, setClosing] = useState(false);

  const openPeriod = periods.find(p => p.status === 'open');
  const allChecked = PRE_CLOSE_CHECKS.every(c => checks[c.id]);
  const checkedCount = PRE_CLOSE_CHECKS.filter(c => checks[c.id]).length;

  const handleClose = async () => {
    if (!openPeriod || !allChecked) return;
    setClosing(true);
    await new Promise(r => setTimeout(r, 1500));
    setPeriods(prev => prev.map(p => p.id === openPeriod.id
      ? { ...p, status: 'closed', closed_at: new Date().toISOString(), closed_by: 'Accounts Manager' }
      : p
    ));
    setShowCloseModal(false);
    setClosing(false);
    toast.success(`${openPeriod.period} closed successfully`);
  };

  return (
    <div className="min-h-screen bg-[#F9F7F7]">
      <div className="px-4 sm:px-6 lg:px-10 py-4 sm:py-6 space-y-4 sm:space-y-6">

        {/* Header */}
        <header>
          <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-neutral-900">Period Close</h1>
          <p className="text-[10px] sm:text-[11px] text-neutral-400 font-medium mt-0.5">Close fiscal periods after completing all pre-close checks.</p>
        </header>

        {/* Current open period */}
        {openPeriod && (
          <div className="bg-white rounded-[10px] p-5 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <p className="text-[10px] font-semibold text-emerald-600 uppercase tracking-wider mb-1">Current Open Period</p>
                <h2 className="text-[22px] font-semibold tracking-tight text-neutral-900">{openPeriod.period}</h2>
                <p className="text-[11px] text-neutral-400 mt-0.5">{openPeriod.start_date} to {openPeriod.end_date}</p>
              </div>
              <Button variant="primary" onClick={() => setShowCloseModal(true)} className="self-start sm:self-auto">
                <Lock className="w-3.5 h-3.5 mr-1.5" /> Close Period
              </Button>
            </div>

            {/* Progress bar */}
            <div className="mt-5 pt-4 border-t border-neutral-100">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] text-neutral-500 font-medium">Pre-close checks</span>
                <span className="text-[11px] text-neutral-500 tabular-nums">{checkedCount}/{PRE_CLOSE_CHECKS.length} complete</span>
              </div>
              <div className="h-2 bg-neutral-100 rounded-full overflow-hidden">
                <div className={`h-full rounded-full transition-all ${allChecked ? 'bg-emerald-500' : 'bg-terra-400'}`}
                  style={{ width: `${Math.round((checkedCount / PRE_CLOSE_CHECKS.length) * 100)}%` }} />
              </div>
            </div>
          </div>
        )}

        {/* Period History */}
        <div className="bg-white rounded-[10px] overflow-hidden">
          <div className="px-3 sm:px-6 py-3 sm:py-4 border-b border-neutral-100">
            <h3 className="text-[13px] font-semibold text-neutral-800">Period History</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-neutral-100">
                  <th className="text-left py-3 px-4 sm:px-6 text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">Period</th>
                  <th className="text-center py-3 px-3 text-[11px] font-semibold text-neutral-400 uppercase tracking-wider hidden sm:table-cell">Date Range</th>
                  <th className="text-center py-3 px-3 text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">Status</th>
                  <th className="text-center py-3 px-3 text-[11px] font-semibold text-neutral-400 uppercase tracking-wider hidden md:table-cell">Closed At</th>
                  <th className="text-center py-3 px-4 sm:px-6 text-[11px] font-semibold text-neutral-400 uppercase tracking-wider hidden md:table-cell">Closed By</th>
                </tr>
              </thead>
              <tbody>
                {periods.map(p => (
                  <tr key={p.id} className="border-b border-neutral-50 hover:bg-neutral-50/80 transition-colors">
                    <td className="py-3 px-4 sm:px-6">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-neutral-400 flex-shrink-0" />
                        <span className="text-[13px] font-medium text-neutral-800">{p.period}</span>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-center hidden sm:table-cell">
                      <span className="text-[11px] text-neutral-500">{p.start_date} — {p.end_date}</span>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <Badge variant={(STATUS_VARIANTS[p.status] || 'neutral') as any} size="xs">
                        {PERIOD_STATUS_CONFIG[p.status]?.label || p.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-3 text-center hidden md:table-cell">
                      <span className="text-[11px] text-neutral-400">
                        {p.closed_at ? new Date(p.closed_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                      </span>
                    </td>
                    <td className="py-3 px-4 sm:px-6 text-center hidden md:table-cell">
                      <span className="text-[11px] text-neutral-400">{p.closed_by || '—'}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Close Period Modal with Checklist */}
      {showCloseModal && openPeriod && (
        <div className="fixed inset-0 z-50">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowCloseModal(false)} />
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white rounded-[14px] shadow-2xl z-10 overflow-hidden">
            <div className="px-6 py-5 border-b border-neutral-100">
              <h3 className="text-base font-semibold text-neutral-900">Close Period</h3>
              <p className="text-[11px] text-neutral-400 mt-0.5">{openPeriod.period} ({openPeriod.start_date} to {openPeriod.end_date})</p>
            </div>

            <div className="px-6 py-5">
              <p className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider mb-3">Pre-Close Checklist</p>
              <div className="space-y-2">
                {PRE_CLOSE_CHECKS.map(check => (
                  <button key={check.id}
                    onClick={() => setChecks(prev => ({ ...prev, [check.id]: !prev[check.id] }))}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg border transition-colors text-left ${
                      checks[check.id] ? 'border-emerald-200 bg-emerald-50/50' : 'border-neutral-200 hover:bg-neutral-50'
                    }`}>
                    {checks[check.id]
                      ? <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                      : <Circle className="w-5 h-5 text-neutral-300 flex-shrink-0" />
                    }
                    <span className={`text-[13px] ${checks[check.id] ? 'text-emerald-800 font-medium' : 'text-neutral-600'}`}>
                      {check.label}
                    </span>
                    {check.autoCheck && (
                      <span className="ml-auto text-[9px] text-neutral-400 uppercase tracking-wider flex-shrink-0">Auto</span>
                    )}
                  </button>
                ))}
              </div>

              {!allChecked && (
                <div className="mt-4 flex items-start gap-2 text-amber-700 bg-amber-50 border border-amber-200 px-3 py-2 rounded-lg">
                  <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <p className="text-[11px]">Complete all checks before closing the period.</p>
                </div>
              )}
            </div>

            <div className="px-6 py-4 border-t border-neutral-100 bg-neutral-50/50 flex gap-3">
              <Button variant="outline-neutral" onClick={() => setShowCloseModal(false)} className="flex-1">Cancel</Button>
              <button onClick={handleClose} disabled={!allChecked || closing}
                className="flex-1 h-10 rounded-[var(--brand-radius-lg)] bg-red-600 text-white text-[13px] font-semibold flex items-center justify-center gap-1.5 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                <Lock className="w-3.5 h-3.5" /> {closing ? 'Closing...' : 'Close Period'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
