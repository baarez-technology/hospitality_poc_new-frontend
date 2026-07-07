import { useState, useEffect } from 'react';
import {
  CheckCircle,
  XCircle,
  Clock,
  Star,
  Edit2,
  Eye,
  Send,
  Wand2,
  Loader2,
  MessageSquare,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import { useReputation } from '@/context/ReputationContext';
import { Button } from '../ui2/Button';
import { Drawer } from '../ui2/Drawer';
import { Textarea } from '../ui2/Input';

interface ApprovalItem {
  id: number | string;
  review_id: number | string;
  review?: {
    guest_name: string;
    rating: number;
    content: string;
    source: string;
    created_at: string;
  };
  draft_text: string;
  tone: string;
  status: 'pending' | 'approved' | 'rejected';
  approval_stage?: number;
  current_stage?: string;
  created_at: string;
  generated_at?: string;
  approved_by?: string;
  approved_at?: string;
}

const STATUS_STYLES = {
  pending: { bg: 'bg-gold-100', text: 'text-gold-700', icon: Clock },
  approved: { bg: 'bg-sage-100', text: 'text-sage-700', icon: CheckCircle },
  rejected: { bg: 'bg-red-100', text: 'text-red-700', icon: XCircle }
};

const TONE_LABELS = {
  professional: 'Professional',
  empathetic: 'Empathetic',
  concise: 'Concise',
  friendly: 'Friendly'
};

function ApprovalDetailDrawer({
  isOpen,
  item,
  onClose,
  onApprove,
  onReject,
  onEdit
}: {
  isOpen: boolean;
  item: ApprovalItem | null;
  onClose: () => void;
  onApprove: (id: string, text: string) => Promise<void>;
  onReject: (id: string, reason: string) => Promise<void>;
  onEdit: (id: string, text: string) => Promise<void>;
}) {
  const [editedText, setEditedText] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (item) {
      setEditedText(item.draft_text);
      setIsEditing(false);
      setShowRejectForm(false);
      setRejectReason('');
    }
  }, [item]);

  if (!item) return null;

  const handleApprove = async () => {
    setIsProcessing(true);
    try {
      await onApprove(item.id, editedText);
      onClose();
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) return;
    setIsProcessing(true);
    try {
      await onReject(item.id, rejectReason);
      onClose();
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSaveEdit = async () => {
    setIsProcessing(true);
    try {
      await onEdit(item.id, editedText);
      setIsEditing(false);
    } finally {
      setIsProcessing(false);
    }
  };

  const footer = item.status === 'pending' ? (
    <div className="flex items-center justify-between gap-3 w-full">
      <Button
        variant="outline"
        onClick={() => setShowRejectForm(true)}
        disabled={isProcessing || showRejectForm}
        className="text-red-600 border-red-200 hover:bg-red-50"
      >
        Reject
      </Button>
      <div className="flex items-center gap-2">
        {isEditing ? (
          <>
            <Button variant="outline" onClick={() => setIsEditing(false)} disabled={isProcessing}>
              Cancel Edit
            </Button>
            <Button
              variant="primary"
              icon={isProcessing ? Loader2 : CheckCircle}
              onClick={handleSaveEdit}
              disabled={isProcessing}
              className={isProcessing ? '[&>svg]:animate-spin' : ''}
            >
              Save Changes
            </Button>
          </>
        ) : (
          <>
            <Button variant="outline" icon={Edit2} onClick={() => setIsEditing(true)}>
              Edit
            </Button>
            <Button
              variant="primary"
              icon={isProcessing ? Loader2 : Send}
              onClick={handleApprove}
              disabled={isProcessing}
              className={isProcessing ? '[&>svg]:animate-spin' : ''}
            >
              Approve & Publish
            </Button>
          </>
        )}
      </div>
    </div>
  ) : (
    <Button variant="outline" onClick={onClose}>
      Close
    </Button>
  );

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title="Review Response Approval"
      subtitle={`Response for ${item.review?.guest_name || 'Guest'}`}
      maxWidth="max-w-xl"
      footer={footer}
    >
      <div className="space-y-6">
        {/* Status Badge */}
        <div className="flex items-center gap-2">
          {(() => {
            const style = STATUS_STYLES[item.status];
            const Icon = style.icon;
            return (
              <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-semibold ${style.bg} ${style.text}`}>
                <Icon className="w-4 h-4" />
                {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
              </span>
            );
          })()}
          <span className="px-2.5 py-1 bg-neutral-100 text-neutral-600 rounded-full text-[11px] font-medium">
            {TONE_LABELS[item.tone as keyof typeof TONE_LABELS] || item.tone}
          </span>
        </div>

        {/* Original Review */}
        <div>
          <p className="text-[11px] font-semibold text-neutral-400 uppercase tracking-widest mb-2">
            Original Review
          </p>
          <div className="bg-neutral-50 rounded-[10px] p-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    className={`w-3.5 h-3.5 ${
                      s <= (item.review?.rating || 0) ? 'fill-gold-500 text-gold-500' : 'text-neutral-300'
                    }`}
                  />
                ))}
              </div>
              <span className="text-[11px] text-neutral-500 px-2 py-0.5 bg-neutral-200 rounded-full font-medium">
                {item.review?.source || 'Direct'}
              </span>
            </div>
            <p className="text-[13px] text-neutral-700 leading-relaxed">
              {item.review?.content}
            </p>
            <p className="text-[11px] text-neutral-500 mt-3 font-medium">
              {item.review?.guest_name} - {new Date(item.review?.created_at || item.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* AI Generated Response */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-[11px] font-semibold text-neutral-400 uppercase tracking-widest">
              AI Generated Response
            </p>
            {!isEditing && item.status === 'pending' && (
              <Button variant="ghost" size="xs" icon={Edit2} onClick={() => setIsEditing(true)}>
                Edit
              </Button>
            )}
          </div>
          {isEditing ? (
            <Textarea
              value={editedText}
              onChange={(e) => setEditedText(e.target.value)}
              rows={6}
              className="w-full"
            />
          ) : (
            <div className="bg-sage-50 rounded-[10px] p-4">
              <p className="text-[13px] text-neutral-700 leading-relaxed whitespace-pre-wrap">
                {item.draft_text}
              </p>
            </div>
          )}
        </div>

        {/* Reject Form */}
        {showRejectForm && item.status === 'pending' && (
          <div className="bg-red-50 rounded-[10px] p-4 space-y-3">
            <p className="text-[13px] font-semibold text-red-700">Rejection Reason</p>
            <Textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={3}
              placeholder="Explain why this response is being rejected..."
              className="bg-white"
            />
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setShowRejectForm(false);
                  setRejectReason('');
                }}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                icon={isProcessing ? Loader2 : XCircle}
                onClick={handleReject}
                disabled={isProcessing || !rejectReason.trim()}
                className={`bg-red-600 hover:bg-red-700 ${isProcessing ? '[&>svg]:animate-spin' : ''}`}
              >
                Confirm Rejection
              </Button>
            </div>
          </div>
        )}

        {/* Approval Info */}
        {item.status !== 'pending' && item.approved_by && (
          <div className="bg-neutral-50 rounded-[10px] p-4">
            <p className="text-[11px] font-semibold text-neutral-400 uppercase tracking-widest mb-2">
              {item.status === 'approved' ? 'Approved By' : 'Rejected By'}
            </p>
            <p className="text-[13px] text-neutral-700">
              {item.approved_by} - {item.approved_at && new Date(item.approved_at).toLocaleString()}
            </p>
          </div>
        )}
      </div>
    </Drawer>
  );
}

export default function ApprovalQueue() {
  const {
    pendingApprovals,
    loadPendingApprovals,
    approveDraft,
    rejectDraft,
    isLoading
  } = useReputation();

  const [selectedItem, setSelectedItem] = useState<ApprovalItem | null>(null);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    loadPendingApprovals();
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await loadPendingApprovals();
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleApprove = async (id: number | string, text: string) => {
    await approveDraft(id, text);
    await loadPendingApprovals();
  };

  const handleReject = async (id: number | string, reason: string) => {
    await rejectDraft(id, reason);
    await loadPendingApprovals();
  };

  const handleEdit = async (id: number | string, text: string) => {
    // In real implementation, this would update the draft text
    console.log('Editing draft:', id, text);
  };

  const filteredItems = pendingApprovals.filter((item: ApprovalItem) => {
    if (filter === 'all') return true;
    return item.status === filter;
  });

  const stats = {
    pending: pendingApprovals.filter((i: ApprovalItem) => i.status === 'pending').length,
    approved: pendingApprovals.filter((i: ApprovalItem) => i.status === 'approved').length,
    rejected: pendingApprovals.filter((i: ApprovalItem) => i.status === 'rejected').length
  };

  if (isLoading && pendingApprovals.length === 0) {
    return (
      <div className="bg-white rounded-[10px] p-6 animate-pulse">
        <div className="h-6 bg-neutral-200 rounded w-1/3 mb-6" />
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-neutral-100 rounded-[8px]" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <div className="bg-white rounded-[10px] p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-[15px] font-semibold text-neutral-900">Response Approval Queue</h3>
            <p className="text-[13px] text-neutral-500 mt-0.5">
              Review and approve AI-generated responses before publishing
            </p>
          </div>
          <Button
            variant="outline"
            icon={isRefreshing ? Loader2 : RefreshCw}
            onClick={handleRefresh}
            disabled={isRefreshing}
            className={isRefreshing ? '[&>svg]:animate-spin' : ''}
          >
            Refresh
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <button
            onClick={() => setFilter('pending')}
            className={`rounded-lg p-4 text-center transition-all ${
              filter === 'pending' ? 'ring-2 ring-gold-500 bg-gold-50' : 'bg-gold-50 hover:ring-1 hover:ring-gold-300'
            }`}
          >
            <p className="text-[24px] font-bold text-gold-700">{stats.pending}</p>
            <p className="text-[11px] font-medium text-gold-600 uppercase tracking-wider">Pending</p>
          </button>
          <button
            onClick={() => setFilter('approved')}
            className={`rounded-lg p-4 text-center transition-all ${
              filter === 'approved' ? 'ring-2 ring-sage-500 bg-sage-50' : 'bg-sage-50 hover:ring-1 hover:ring-sage-300'
            }`}
          >
            <p className="text-[24px] font-bold text-sage-700">{stats.approved}</p>
            <p className="text-[11px] font-medium text-sage-600 uppercase tracking-wider">Approved</p>
          </button>
          <button
            onClick={() => setFilter('rejected')}
            className={`rounded-lg p-4 text-center transition-all ${
              filter === 'rejected' ? 'ring-2 ring-red-500 bg-red-50' : 'bg-red-50 hover:ring-1 hover:ring-red-300'
            }`}
          >
            <p className="text-[24px] font-bold text-red-700">{stats.rejected}</p>
            <p className="text-[11px] font-medium text-red-600 uppercase tracking-wider">Rejected</p>
          </button>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-2 mb-4">
          {(['all', 'pending', 'approved', 'rejected'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-3 py-1.5 rounded-lg text-[12px] font-medium capitalize transition-colors ${
                filter === status
                  ? 'bg-terra-500 text-white'
                  : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
              }`}
            >
              {status}
            </button>
          ))}
        </div>

        {/* Queue List */}
        {filteredItems.length === 0 ? (
          <div className="text-center py-12 text-neutral-400">
            <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-[14px] font-medium text-neutral-500">No items in queue</p>
            <p className="text-[12px]">
              {filter === 'pending'
                ? 'All responses have been reviewed'
                : `No ${filter} responses to display`
              }
            </p>
          </div>
        ) : (
          <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
            {filteredItems.map((item: ApprovalItem) => {
              const statusStyle = STATUS_STYLES[item.status];
              const StatusIcon = statusStyle.icon;

              return (
                <div
                  key={item.id}
                  className="p-4 rounded-[8px] bg-neutral-50 hover:bg-neutral-100/80 cursor-pointer transition-colors"
                  onClick={() => setSelectedItem(item)}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      {/* Header Row */}
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${statusStyle.bg} ${statusStyle.text}`}>
                          <StatusIcon className="w-3 h-3" />
                          {item.status}
                        </span>
                        <div className="flex items-center gap-0.5">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star
                              key={s}
                              className={`w-3 h-3 ${
                                s <= (item.review?.rating || 0) ? 'fill-gold-500 text-gold-500' : 'text-neutral-300'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-[10px] text-neutral-500 px-2 py-0.5 bg-neutral-200 rounded-full font-medium">
                          {item.review?.source || 'Direct'}
                        </span>
                        <span className="text-[10px] text-neutral-400 px-2 py-0.5 bg-neutral-100 rounded-full">
                          {TONE_LABELS[item.tone as keyof typeof TONE_LABELS] || item.tone}
                        </span>
                      </div>

                      {/* Guest & Review Preview */}
                      <p className="text-[13px] font-semibold text-neutral-900 mb-1">
                        {item.review?.guest_name || 'Guest'}
                      </p>
                      <p className="text-[12px] text-neutral-500 line-clamp-2 mb-2">
                        <span className="font-medium">Review:</span> {item.review?.content}
                      </p>

                      {/* Response Preview */}
                      <div className="bg-sage-50/50 rounded p-2">
                        <p className="text-[11px] text-neutral-600 line-clamp-2">
                          <span className="font-medium text-sage-700">Response:</span> {item.draft_text}
                        </p>
                      </div>

                      {/* Timestamp */}
                      <p className="text-[10px] text-neutral-400 mt-2">
                        Generated {new Date(item.created_at).toLocaleString()}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col items-end gap-2">
                      {item.status === 'pending' ? (
                        <>
                          <Button
                            variant="primary"
                            size="xs"
                            icon={CheckCircle}
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedItem(item);
                            }}
                          >
                            Review
                          </Button>
                        </>
                      ) : (
                        <Button
                          variant="ghost"
                          size="xs"
                          icon={Eye}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedItem(item);
                          }}
                        >
                          View
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Workflow Info */}
      <div className="bg-ocean-50 rounded-[10px] p-5">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-ocean-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-[13px] font-semibold text-ocean-700 mb-1">Approval Workflow</p>
            <p className="text-[12px] text-neutral-600 leading-relaxed">
              All AI-generated responses require human approval before being published.
              You can edit responses before approving, or reject them with a reason.
              Approved responses will be automatically posted to the respective OTA platform.
            </p>
          </div>
        </div>
      </div>

      {/* Detail Drawer */}
      <ApprovalDetailDrawer
        isOpen={!!selectedItem}
        item={selectedItem}
        onClose={() => setSelectedItem(null)}
        onApprove={handleApprove}
        onReject={handleReject}
        onEdit={handleEdit}
      />
    </div>
  );
}
