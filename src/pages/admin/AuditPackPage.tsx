/**
 * AuditPackPage — Night audit sign-off chain & evaluation reports.
 * Visual stepper for sequential approval flow, structured pre/post reports.
 */

import { useState, useCallback } from 'react';
import {
  ClipboardCheck, CheckCircle2, XCircle, Clock, Download,
  FileBarChart, BarChart3, Loader2, Search, AlertTriangle,
  User, Calendar, Shield,
} from 'lucide-react';
import { auditPackService, type ApprovalStatus, type AuditSignOff } from '@/api/services/audit-pack.service';
import { useToast } from '@/contexts/ToastContext';
import { Button } from '@/components/ui2/Button';
import { Badge } from '@/components/ui2/Badge';
import { ConfirmModal } from '@/components/ui2/Modal';

const ROLE_LABELS: Record<string, string> = {
  duty_manager: 'Duty Manager',
  general_manager: 'General Manager',
  finance_controller: 'Finance Controller',
};

const ROLE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  duty_manager: User,
  general_manager: Shield,
  finance_controller: BarChart3,
};

/* ── Report Section — structured key/value rendering ─────────────────────── */
function ReportSection({ data }: { data: any }) {
  if (!data) {
    return (
      <div className="py-8 text-center">
        <FileBarChart className="w-8 h-8 text-neutral-300 mx-auto mb-2" />
        <p className="text-[13px] text-neutral-400">No report data available</p>
      </div>
    );
  }

  if (typeof data !== 'object' || Array.isArray(data)) {
    return (
      <pre className="bg-neutral-50/70 rounded-[10px] p-4 text-[11px] font-mono overflow-auto max-h-[400px] whitespace-pre-wrap text-neutral-600 border border-neutral-100">
        {JSON.stringify(data, null, 2)}
      </pre>
    );
  }

  return (
    <div className="space-y-4">
      {Object.entries(data).map(([key, value]) => (
        <div key={key} className="bg-neutral-50/70 rounded-[10px] border border-neutral-100 p-4">
          <h4 className="text-[11px] font-semibold text-neutral-400 uppercase tracking-widest mb-3">
            {key.replace(/_/g, ' ')}
          </h4>
          {typeof value === 'object' && value !== null ? (
            <div className="space-y-1.5">
              {Object.entries(value as Record<string, any>).map(([k, v]) => (
                <div key={k} className="flex justify-between py-1 text-[12px]">
                  <span className="text-neutral-600 capitalize">{k.replace(/_/g, ' ')}</span>
                  <span className="font-semibold text-neutral-900">
                    {typeof v === 'number' ? v.toLocaleString() : String(v ?? '—')}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-[13px] font-semibold text-neutral-900">
              {typeof value === 'number' ? value.toLocaleString() : String(value ?? '—')}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}

/* ── Main Page ────────────────────────────────────────────────────────────── */
export default function AuditPackPage() {
  const [auditId, setAuditId] = useState('');
  const [approvalStatus, setApprovalStatus] = useState<ApprovalStatus | null>(null);
  const [preReport, setPreReport] = useState<any>(null);
  const [postReport, setPostReport] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'signoffs' | 'pre' | 'post'>('signoffs');
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [signingRole, setSigningRole] = useState<string | null>(null);
  const [confirmAction, setConfirmAction] = useState<{ role: string; type: 'approve' | 'reject'; comments: string } | null>(null);
  const { success, error } = useToast();

  const loadAudit = useCallback(async () => {
    const id = parseInt(auditId);
    if (!id) { error('Enter a valid audit ID'); return; }
    setLoading(true);
    try {
      const [approvals, pre, post] = await Promise.allSettled([
        auditPackService.getApprovals(id),
        auditPackService.getPreReport(id),
        auditPackService.getPostReport(id),
      ]);
      setApprovalStatus(approvals.status === 'fulfilled' ? approvals.value : null);
      setPreReport(pre.status === 'fulfilled' ? pre.value : null);
      setPostReport(post.status === 'fulfilled' ? post.value : null);
      if (approvals.status === 'rejected') {
        error('Could not load audit pack — check the audit ID');
      }
    } catch {
      error('Failed to load audit pack');
    }
    setLoading(false);
  }, [auditId]);

  const handleSignOff = async (role: string, comments: string) => {
    const id = parseInt(auditId);
    if (!id) return;
    setSigningRole(role);
    setConfirmAction(null);
    try {
      await auditPackService.signOff(id, role, comments || undefined);
      success(`${ROLE_LABELS[role] || role} approved`);
      loadAudit();
    } catch (err: any) {
      error(err?.response?.data?.detail || 'Sign-off failed');
    }
    setSigningRole(null);
  };

  const handleReject = async (role: string, comments: string) => {
    const id = parseInt(auditId);
    if (!id) return;
    setSigningRole(role);
    setConfirmAction(null);
    try {
      await auditPackService.reject(id, role, comments || undefined);
      success(`${ROLE_LABELS[role] || role} rejected`);
      loadAudit();
    } catch (err: any) {
      error(err?.response?.data?.detail || 'Rejection failed');
    }
    setSigningRole(null);
  };

  const handleExport = async () => {
    const id = parseInt(auditId);
    if (!id) return;
    setExporting(true);
    try {
      const res = await auditPackService.exportPdf(id);
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = `audit-pack-${id}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
      success('Export downloaded');
    } catch {
      error('Export failed');
    }
    setExporting(false);
  };

  const signOffs = approvalStatus?.approvals || [];
  const sortedSignOffs = [...signOffs].sort((a, b) => a.sign_order - b.sign_order);
  const approvedCount = signOffs.filter(s => s.status === 'approved').length;
  const totalSteps = signOffs.length;

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F9F7F7' }}>
      <div className="px-4 sm:px-6 lg:px-10 py-4 sm:py-6 space-y-4 sm:space-y-6">

        {/* ─── Header ─────────────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-neutral-900">Audit Pack</h1>
            <p className="text-[12px] sm:text-[13px] text-neutral-500 mt-1">
              Night audit sign-off chain & evaluation reports
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative flex-1 sm:flex-none">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-400 pointer-events-none" />
              <input
                type="number"
                placeholder="Audit ID..."
                value={auditId}
                onChange={e => setAuditId(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && loadAudit()}
                className="w-full sm:w-[150px] h-9 pl-8 pr-3 text-[13px] bg-white border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-terra-500/10 focus:border-terra-400 transition-colors"
              />
            </div>
            <Button variant="primary" size="sm" onClick={loadAudit} disabled={loading} loading={loading}>
              Load
            </Button>
            {approvalStatus && (
              <Button
                variant="outline"
                size="sm"
                icon={Download}
                onClick={handleExport}
                disabled={exporting}
                loading={exporting}
                className="hidden sm:flex"
              >
                Export PDF
              </Button>
            )}
          </div>
        </div>

        {/* ─── Loading ────────────────────────────────────────────────────── */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-12 gap-3">
            <Loader2 className="w-7 h-7 animate-spin text-terra-500" />
            <p className="text-[13px] text-neutral-500 animate-pulse">Loading audit pack...</p>
          </div>
        )}

        {/* ─── Empty State ────────────────────────────────────────────────── */}
        {!approvalStatus && !loading && (
          <div className="bg-white rounded-[10px] border border-neutral-100 p-10 sm:p-12 text-center">
            <ClipboardCheck className="w-10 h-10 text-neutral-300 mx-auto mb-3" />
            <p className="text-[14px] font-medium text-neutral-600 mb-1">No audit pack loaded</p>
            <p className="text-[12px] text-neutral-400">Enter an audit ID above and click Load to view the sign-off chain and reports</p>
          </div>
        )}

        {/* ─── Loaded Content ─────────────────────────────────────────────── */}
        {approvalStatus && (
          <>
            {/* KPI Summary Row */}
            <div className="grid grid-cols-3 gap-3 sm:gap-4">
              {/* Audit Date */}
              <div className="bg-white rounded-[10px] border border-neutral-100 p-3 sm:p-5">
                <div className="flex items-center gap-1.5 sm:gap-3 mb-2 sm:mb-4">
                  <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg bg-terra-50 flex items-center justify-center">
                    <Calendar className="w-3 h-3 sm:w-4 sm:h-4 text-terra-600" />
                  </div>
                  <p className="text-[9px] sm:text-[11px] font-semibold uppercase tracking-widest text-neutral-400">Audit Date</p>
                </div>
                <p className="text-[15px] sm:text-2xl font-semibold tracking-tight text-neutral-900">
                  {(() => {
                    try {
                      const d = new Date(approvalStatus.audit_date + 'T00:00:00');
                      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                    } catch { return approvalStatus.audit_date; }
                  })()}
                </p>
                <p className="text-[9px] sm:text-[11px] text-neutral-400 font-medium mt-0.5 sm:mt-1">Audit #{approvalStatus.audit_id}</p>
              </div>

              {/* Status */}
              <div className="bg-white rounded-[10px] border border-neutral-100 p-3 sm:p-5">
                <div className="flex items-center gap-1.5 sm:gap-3 mb-2 sm:mb-4">
                  <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center ${approvalStatus.fully_approved ? 'bg-sage-50' : 'bg-ocean-50'}`}>
                    {approvalStatus.fully_approved
                      ? <CheckCircle2 className="w-3 h-3 sm:w-4 sm:h-4 text-sage-600" />
                      : <Clock className="w-3 h-3 sm:w-4 sm:h-4 text-ocean-600" />
                    }
                  </div>
                  <p className="text-[9px] sm:text-[11px] font-semibold uppercase tracking-widest text-neutral-400">Status</p>
                </div>
                <p className="text-[15px] sm:text-2xl font-semibold tracking-tight text-neutral-900 capitalize">
                  {approvalStatus.fully_approved ? 'Approved' : approvalStatus.approval_status?.replace(/_/g, ' ') || 'In Progress'}
                </p>
                {!approvalStatus.fully_approved && approvalStatus.next_pending_role && (
                  <p className="text-[9px] sm:text-[11px] text-ocean-600 font-medium mt-0.5 sm:mt-1">
                    Next: {ROLE_LABELS[approvalStatus.next_pending_role] || approvalStatus.next_pending_role}
                  </p>
                )}
              </div>

              {/* Approvals */}
              <div className="bg-white rounded-[10px] border border-neutral-100 p-3 sm:p-5">
                <div className="flex items-center gap-1.5 sm:gap-3 mb-2 sm:mb-4">
                  <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg bg-gold-50 flex items-center justify-center">
                    <ClipboardCheck className="w-3 h-3 sm:w-4 sm:h-4 text-gold-600" />
                  </div>
                  <p className="text-[9px] sm:text-[11px] font-semibold uppercase tracking-widest text-neutral-400">Approvals</p>
                </div>
                <p className="text-[15px] sm:text-2xl font-semibold tracking-tight text-neutral-900">
                  {approvedCount} / {totalSteps}
                </p>
                <p className="text-[9px] sm:text-[11px] text-neutral-400 font-medium mt-0.5 sm:mt-1">
                  {totalSteps > 0 ? `${Math.round((approvedCount / totalSteps) * 100)}% complete` : 'No sign-offs'}
                </p>
              </div>
            </div>

            {/* Mobile Export Button */}
            <div className="sm:hidden">
              <Button
                variant="outline"
                size="sm"
                icon={Download}
                onClick={handleExport}
                disabled={exporting}
                loading={exporting}
                className="w-full"
              >
                Export PDF
              </Button>
            </div>

            {/* Fully Approved Banner */}
            {approvalStatus.fully_approved && (
              <div className="bg-sage-50 border border-sage-200 rounded-[10px] p-4 sm:p-5 flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-sage-600 flex-shrink-0" />
                <div>
                  <p className="text-[14px] font-semibold text-sage-800">All Approvals Complete</p>
                  <p className="text-[12px] text-sage-600 mt-0.5">
                    The sign-off chain for Audit #{approvalStatus.audit_id} is fully approved. You can export the audit pack.
                  </p>
                </div>
              </div>
            )}

            {/* Tab Bar */}
            <div className="bg-white rounded-[10px] border border-neutral-100 overflow-hidden">
              <div className="flex border-b border-neutral-100">
                {([
                  { key: 'signoffs' as const, label: 'Sign-offs', fullLabel: 'Sign-off Chain', icon: ClipboardCheck },
                  { key: 'pre' as const, label: 'Pre-Audit', fullLabel: 'Pre-Audit Report', icon: FileBarChart },
                  { key: 'post' as const, label: 'Post-Audit', fullLabel: 'Post-Audit Report', icon: BarChart3 },
                ] as const).map(tab => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-5 py-3 sm:py-3.5 text-[11px] sm:text-[13px] font-medium border-b-2 -mb-px transition-colors whitespace-nowrap ${
                      activeTab === tab.key
                        ? 'border-terra-500 text-terra-700 bg-terra-50/30'
                        : 'border-transparent text-neutral-500 hover:text-neutral-700 hover:bg-neutral-50/50'
                    }`}
                  >
                    <tab.icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                    <span className="sm:hidden">{tab.label}</span>
                    <span className="hidden sm:inline">{tab.fullLabel}</span>
                  </button>
                ))}
              </div>

              <div className="p-4 sm:p-6">
                {/* Sign-off Chain Tab */}
                {activeTab === 'signoffs' && (
                  sortedSignOffs.length > 0 ? (
                    <div className="space-y-0">
                      {sortedSignOffs.map((so, idx) => {
                        const isNext = approvalStatus.next_pending_role === so.role;
                        const isApproved = so.status === 'approved';
                        const isRejected = so.status === 'rejected';
                        const isPending = so.status === 'pending';
                        const isLast = idx === sortedSignOffs.length - 1;
                        const RoleIcon = ROLE_ICONS[so.role] || User;
                        const isSigning = signingRole === so.role;

                        return (
                          <div key={so.id}>
                            {/* Step Row */}
                            <div className="flex gap-4">
                              {/* Stepper Column */}
                              <div className="flex flex-col items-center">
                                <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 border-2 ${
                                  isApproved ? 'bg-sage-50 border-sage-300' :
                                  isRejected ? 'bg-rose-50 border-rose-300' :
                                  isNext ? 'bg-terra-50 border-terra-300' :
                                  'bg-neutral-50 border-neutral-200'
                                }`}>
                                  {isApproved && <CheckCircle2 className="w-4 h-4 text-sage-600" />}
                                  {isRejected && <XCircle className="w-4 h-4 text-rose-500" />}
                                  {isPending && isNext && <RoleIcon className="w-4 h-4 text-terra-600" />}
                                  {isPending && !isNext && <Clock className="w-4 h-4 text-neutral-400" />}
                                </div>
                                {!isLast && (
                                  <div className={`w-px flex-1 min-h-[24px] ${
                                    isApproved ? 'bg-sage-200' : 'bg-neutral-200'
                                  }`} />
                                )}
                              </div>

                              {/* Content */}
                              <div className={`flex-1 pb-6 ${isLast ? 'pb-0' : ''}`}>
                                <div className="flex items-center justify-between mb-1">
                                  <div>
                                    <p className="text-[10px] text-neutral-400 uppercase tracking-widest">Step {so.sign_order}</p>
                                    <h3 className="text-[14px] font-semibold text-neutral-900">{ROLE_LABELS[so.role] || so.role}</h3>
                                  </div>
                                  <Badge
                                    variant={isApproved ? 'success' : isRejected ? 'danger' : isNext ? 'warning' : 'neutral'}
                                    dot={isNext && isPending}
                                    dotColor={isNext ? 'live' : undefined}
                                  >
                                    {isApproved ? 'Approved' : isRejected ? 'Rejected' : isNext ? 'Awaiting' : 'Pending'}
                                  </Badge>
                                </div>

                                {/* Approved details */}
                                {isApproved && (
                                  <div className="mt-2 text-[12px] space-y-0.5">
                                    {so.staff_name && (
                                      <p className="text-neutral-500">Signed by <span className="font-medium text-neutral-700">{so.staff_name}</span></p>
                                    )}
                                    {so.signed_at && (
                                      <p className="text-neutral-400">{new Date(so.signed_at).toLocaleString()}</p>
                                    )}
                                    {so.comments && (
                                      <p className="text-neutral-600 mt-1.5 italic">"{so.comments}"</p>
                                    )}
                                  </div>
                                )}

                                {/* Rejected details */}
                                {isRejected && (
                                  <div className="mt-2 text-[12px] space-y-0.5">
                                    {so.staff_name && (
                                      <p className="text-neutral-500">Rejected by <span className="font-medium text-rose-700">{so.staff_name}</span></p>
                                    )}
                                    {so.comments && (
                                      <p className="text-rose-600 mt-1.5 italic">"{so.comments}"</p>
                                    )}
                                  </div>
                                )}

                                {/* Actionable: next pending step */}
                                {isPending && isNext && (
                                  <SignOffForm
                                    role={so.role}
                                    isSigning={isSigning}
                                    onApprove={(comments) => setConfirmAction({ role: so.role, type: 'approve', comments })}
                                    onReject={(comments) => setConfirmAction({ role: so.role, type: 'reject', comments })}
                                  />
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="py-8 text-center">
                      <ClipboardCheck className="w-8 h-8 text-neutral-300 mx-auto mb-2" />
                      <p className="text-[13px] text-neutral-500">No sign-offs found</p>
                      <p className="text-[11px] text-neutral-400 mt-0.5">Sign-offs are auto-created when a night audit completes</p>
                    </div>
                  )
                )}

                {/* Pre-Audit Report Tab */}
                {activeTab === 'pre' && <ReportSection data={preReport} />}

                {/* Post-Audit Report Tab */}
                {activeTab === 'post' && <ReportSection data={postReport} />}
              </div>
            </div>

          </>
        )}

        {/* ─── Confirm Modal ──────────────────────────────────────────────── */}
        <ConfirmModal
          open={!!confirmAction}
          onClose={() => setConfirmAction(null)}
          onConfirm={() => {
            if (!confirmAction) return;
            if (confirmAction.type === 'approve') {
              handleSignOff(confirmAction.role, confirmAction.comments);
            } else {
              handleReject(confirmAction.role, confirmAction.comments);
            }
          }}
          variant={confirmAction?.type === 'reject' ? 'danger' : 'primary'}
          icon={confirmAction?.type === 'reject' ? XCircle : CheckCircle2}
          title={confirmAction?.type === 'reject'
            ? `Reject as ${ROLE_LABELS[confirmAction?.role ?? ''] || confirmAction?.role}?`
            : `Approve as ${ROLE_LABELS[confirmAction?.role ?? ''] || confirmAction?.role}?`
          }
          description={confirmAction?.type === 'reject'
            ? 'This will reject the audit and may require re-running the night audit process.'
            : 'This will record your approval in the sign-off chain. This action is logged.'
          }
          confirmText={confirmAction?.type === 'reject' ? 'Reject' : 'Approve'}
          loading={signingRole === confirmAction?.role}
        />
      </div>
    </div>
  );
}

/* ── Sign-Off Inline Form ─────────────────────────────────────────────────── */
function SignOffForm({ role, isSigning, onApprove, onReject }: {
  role: string;
  isSigning: boolean;
  onApprove: (comments: string) => void;
  onReject: (comments: string) => void;
}) {
  const [comments, setComments] = useState('');

  return (
    <div className="mt-3 bg-neutral-50/70 border border-neutral-100 rounded-[10px] p-4">
      <label className="block text-[12px] font-semibold text-neutral-600 mb-1.5">Comments</label>
      <textarea
        placeholder="Optional comments..."
        value={comments}
        onChange={e => setComments(e.target.value)}
        className="w-full px-4 py-2.5 text-sm bg-[#FAF8F6] border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-terra-500/30 focus:border-terra-400 min-h-[60px] resize-none"
      />
      <div className="flex gap-2 mt-3">
        <Button
          variant="primary"
          className="flex-1"
          icon={CheckCircle2}
          onClick={() => onApprove(comments)}
          disabled={isSigning}
          loading={isSigning}
        >
          Approve
        </Button>
        <Button
          variant="danger"
          className="flex-1"
          icon={XCircle}
          onClick={() => onReject(comments)}
          disabled={isSigning}
        >
          Reject
        </Button>
      </div>
    </div>
  );
}
