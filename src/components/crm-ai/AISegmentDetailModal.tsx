import { useEffect, useRef, useCallback } from 'react';
import { useCurrency } from '@/hooks/useCurrency';
import { createPortal } from 'react-dom';
import {
  X,
  Brain,
  Users,
  Calendar,
  Cpu,
  TrendingUp,
  Heart,
  AlertTriangle,
  Activity,
  Download,
  Megaphone,
  Mail,
  User,
  DollarSign,
  Clock,
  MessageSquare,
  Smile,
  Frown,
  Meh,
} from 'lucide-react';

// Types
interface AISegment {
  id: string;
  name: string;
  description: string;
  memberCount: number;
  generatedAt: string;
  algorithm: string;
  characteristics: {
    value: 'high' | 'medium' | 'low';
    frequency: 'frequent' | 'occasional' | 'rare';
    recency: 'recent' | 'moderate' | 'lapsed';
    sentiment: 'positive' | 'neutral' | 'negative';
  };
  metrics: {
    averageLTV: number;
    averageHealthScore: number;
    averageChurnRisk: number;
  };
  featureImportance: {
    feature: string;
    importance: number;
  }[];
  sampleMembers: {
    id: string;
    name: string;
    email: string;
    membershipScore: number;
  }[];
  recommendedCampaigns: {
    type: string;
    title: string;
    description: string;
  }[];
}

interface AISegmentDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  segment: AISegment | null;
  onCreateCampaign?: (segmentId: string, campaignType: string) => void;
  onExportMembers?: (segmentId: string) => void;
}

const CHARACTERISTIC_BADGES: Record<string, { bg: string; text: string; label: string }> = {
  // Value
  high: { bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'High Value' },
  medium: { bg: 'bg-amber-100', text: 'text-amber-700', label: 'Medium Value' },
  low: { bg: 'bg-rose-100', text: 'text-rose-700', label: 'Low Value' },
  // Frequency
  frequent: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Frequent' },
  occasional: { bg: 'bg-purple-100', text: 'text-purple-700', label: 'Occasional' },
  rare: { bg: 'bg-neutral-100', text: 'text-neutral-700', label: 'Rare' },
  // Recency
  recent: { bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'Recent' },
  moderate: { bg: 'bg-amber-100', text: 'text-amber-700', label: 'Moderate' },
  lapsed: { bg: 'bg-rose-100', text: 'text-rose-700', label: 'Lapsed' },
  // Sentiment
  positive: { bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'Positive' },
  neutral: { bg: 'bg-neutral-100', text: 'text-neutral-700', label: 'Neutral' },
  negative: { bg: 'bg-rose-100', text: 'text-rose-700', label: 'Negative' },
};

const SENTIMENT_ICONS: Record<string, typeof Smile> = {
  positive: Smile,
  neutral: Meh,
  negative: Frown,
};

const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const getHealthScoreColor = (score: number): string => {
  if (score >= 70) return 'text-emerald-600';
  if (score >= 40) return 'text-amber-600';
  return 'text-rose-600';
};

const getChurnRiskColor = (risk: number): string => {
  if (risk <= 30) return 'text-emerald-600';
  if (risk <= 60) return 'text-amber-600';
  return 'text-rose-600';
};

export default function AISegmentDetailModal({
  isOpen,
  onClose,
  segment,
  onCreateCampaign,
  onExportMembers,
}: AISegmentDetailModalProps) {
  const { formatCurrency } = useCurrency();
  const modalRef = useRef<HTMLDivElement>(null);

  // Handle ESC key and body scroll lock
  useEffect(() => {
    if (!isOpen) return;

    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    document.addEventListener('keydown', handleEsc);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  // Focus trap
  const handleTabKey = useCallback((e: KeyboardEvent) => {
    if (e.key !== 'Tab' || !modalRef.current) return;

    const focusableElements = modalRef.current.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    if (e.shiftKey && document.activeElement === firstElement) {
      e.preventDefault();
      lastElement?.focus();
    } else if (!e.shiftKey && document.activeElement === lastElement) {
      e.preventDefault();
      firstElement?.focus();
    }
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    document.addEventListener('keydown', handleTabKey);
    return () => document.removeEventListener('keydown', handleTabKey);
  }, [isOpen, handleTabKey]);

  if (!isOpen || !segment) return null;

  const SentimentIcon = SENTIMENT_ICONS[segment.characteristics.sentiment] || Meh;

  const modalContent = (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/30 z-[60]"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
        <div
          ref={modalRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
          className="w-full max-w-[800px] max-h-[calc(100vh-2rem)] sm:max-h-[90vh] bg-white shadow-2xl rounded-2xl flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex-shrink-0 p-6 border-b border-neutral-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#4E5840]/10 flex items-center justify-center">
                  <Brain className="w-5 h-5 text-[#4E5840]" />
                </div>
                <div>
                  <h2 id="modal-title" className="text-lg font-semibold text-neutral-900">
                    {segment.name}
                  </h2>
                  <p className="text-sm text-neutral-500">{segment.description}</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 rounded-full transition-colors"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Segment Info Grid */}
            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 bg-neutral-50 rounded-xl">
                <div className="flex items-center gap-2 text-neutral-500 mb-1">
                  <Users className="w-4 h-4" />
                  <span className="text-xs uppercase tracking-wide">Members</span>
                </div>
                <p className="text-2xl font-bold text-neutral-900">
                  {segment.memberCount.toLocaleString()}
                </p>
              </div>
              <div className="p-4 bg-neutral-50 rounded-xl">
                <div className="flex items-center gap-2 text-neutral-500 mb-1">
                  <Calendar className="w-4 h-4" />
                  <span className="text-xs uppercase tracking-wide">Generated</span>
                </div>
                <p className="text-sm font-medium text-neutral-900">
                  {formatDate(segment.generatedAt)}
                </p>
              </div>
              <div className="p-4 bg-neutral-50 rounded-xl">
                <div className="flex items-center gap-2 text-neutral-500 mb-1">
                  <Cpu className="w-4 h-4" />
                  <span className="text-xs uppercase tracking-wide">Algorithm</span>
                </div>
                <p className="text-sm font-medium text-neutral-900">{segment.algorithm}</p>
              </div>
            </div>

            {/* Characteristics */}
            <div>
              <h3 className="text-xs font-medium text-neutral-500 uppercase tracking-wide mb-3">
                Segment Characteristics
              </h3>
              <div className="flex flex-wrap gap-2">
                <span className={`px-3 py-1.5 rounded-full text-sm font-medium ${CHARACTERISTIC_BADGES[segment.characteristics.value].bg} ${CHARACTERISTIC_BADGES[segment.characteristics.value].text}`}>
                  <DollarSign className="w-3 h-3 inline mr-1" />
                  {CHARACTERISTIC_BADGES[segment.characteristics.value].label}
                </span>
                <span className={`px-3 py-1.5 rounded-full text-sm font-medium ${CHARACTERISTIC_BADGES[segment.characteristics.frequency].bg} ${CHARACTERISTIC_BADGES[segment.characteristics.frequency].text}`}>
                  <Activity className="w-3 h-3 inline mr-1" />
                  {CHARACTERISTIC_BADGES[segment.characteristics.frequency].label}
                </span>
                <span className={`px-3 py-1.5 rounded-full text-sm font-medium ${CHARACTERISTIC_BADGES[segment.characteristics.recency].bg} ${CHARACTERISTIC_BADGES[segment.characteristics.recency].text}`}>
                  <Clock className="w-3 h-3 inline mr-1" />
                  {CHARACTERISTIC_BADGES[segment.characteristics.recency].label}
                </span>
                <span className={`px-3 py-1.5 rounded-full text-sm font-medium ${CHARACTERISTIC_BADGES[segment.characteristics.sentiment].bg} ${CHARACTERISTIC_BADGES[segment.characteristics.sentiment].text}`}>
                  <SentimentIcon className="w-3 h-3 inline mr-1" />
                  {CHARACTERISTIC_BADGES[segment.characteristics.sentiment].label}
                </span>
              </div>
            </div>

            {/* Metrics */}
            <div>
              <h3 className="text-xs font-medium text-neutral-500 uppercase tracking-wide mb-3">
                Segment Metrics
              </h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 bg-[#4E5840]/5 rounded-xl border border-[#4E5840]/10">
                  <div className="flex items-center gap-2 text-neutral-500 mb-2">
                    <TrendingUp className="w-4 h-4" />
                    <span className="text-xs uppercase tracking-wide">Avg LTV</span>
                  </div>
                  <p className="text-xl font-bold text-[#4E5840]">
                    {formatCurrency(segment.metrics.averageLTV)}
                  </p>
                </div>
                <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100">
                  <div className="flex items-center gap-2 text-neutral-500 mb-2">
                    <Heart className="w-4 h-4" />
                    <span className="text-xs uppercase tracking-wide">Avg Health Score</span>
                  </div>
                  <p className={`text-xl font-bold ${getHealthScoreColor(segment.metrics.averageHealthScore)}`}>
                    {segment.metrics.averageHealthScore}%
                  </p>
                </div>
                <div className="p-4 bg-amber-50 rounded-xl border border-amber-100">
                  <div className="flex items-center gap-2 text-neutral-500 mb-2">
                    <AlertTriangle className="w-4 h-4" />
                    <span className="text-xs uppercase tracking-wide">Avg Churn Risk</span>
                  </div>
                  <p className={`text-xl font-bold ${getChurnRiskColor(segment.metrics.averageChurnRisk)}`}>
                    {segment.metrics.averageChurnRisk}%
                  </p>
                </div>
              </div>
            </div>

            {/* Feature Importance */}
            {segment.featureImportance.length > 0 && (
              <div>
                <h3 className="text-xs font-medium text-neutral-500 uppercase tracking-wide mb-3">
                  Feature Importance
                </h3>
                <div className="space-y-3">
                  {segment.featureImportance.map((feature, index) => (
                    <div key={index}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-neutral-700">{feature.feature}</span>
                        <span className="text-sm font-medium text-neutral-900">
                          {(feature.importance * 100).toFixed(0)}%
                        </span>
                      </div>
                      <div className="h-2 bg-neutral-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#4E5840] rounded-full transition-all"
                          style={{ width: `${feature.importance * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Sample Members */}
            {segment.sampleMembers.length > 0 && (
              <div>
                <h3 className="text-xs font-medium text-neutral-500 uppercase tracking-wide mb-3">
                  Sample Members (Top 10)
                </h3>
                <div className="bg-neutral-50 rounded-xl overflow-hidden">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-neutral-200">
                        <th className="text-left text-xs font-medium text-neutral-500 uppercase tracking-wide py-2 px-4">
                          Member
                        </th>
                        <th className="text-left text-xs font-medium text-neutral-500 uppercase tracking-wide py-2 px-4">
                          Email
                        </th>
                        <th className="text-right text-xs font-medium text-neutral-500 uppercase tracking-wide py-2 px-4">
                          Score
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {segment.sampleMembers.slice(0, 10).map((member) => (
                        <tr key={member.id} className="border-b border-neutral-100 last:border-0">
                          <td className="py-2 px-4">
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-full bg-neutral-200 flex items-center justify-center">
                                <User className="w-3 h-3 text-neutral-500" />
                              </div>
                              <span className="text-sm font-medium text-neutral-900">{member.name}</span>
                            </div>
                          </td>
                          <td className="py-2 px-4 text-sm text-neutral-600">{member.email}</td>
                          <td className="py-2 px-4 text-right">
                            <span className={`text-sm font-medium ${
                              member.membershipScore >= 80 ? 'text-emerald-600' :
                              member.membershipScore >= 50 ? 'text-amber-600' : 'text-rose-600'
                            }`}>
                              {member.membershipScore}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Recommended Campaigns */}
            {segment.recommendedCampaigns.length > 0 && (
              <div>
                <h3 className="text-xs font-medium text-neutral-500 uppercase tracking-wide mb-3">
                  Recommended Campaigns
                </h3>
                <div className="space-y-3">
                  {segment.recommendedCampaigns.map((campaign, index) => (
                    <div
                      key={index}
                      className="p-4 bg-white border border-neutral-200 rounded-xl hover:border-[#4E5840]/30 hover:bg-[#4E5840]/5 transition-colors cursor-pointer"
                      onClick={() => onCreateCampaign?.(segment.id, campaign.type)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-[#A57865]/10 flex items-center justify-center">
                            {campaign.type === 'email' ? (
                              <Mail className="w-4 h-4 text-[#A57865]" />
                            ) : campaign.type === 'sms' ? (
                              <MessageSquare className="w-4 h-4 text-[#A57865]" />
                            ) : (
                              <Megaphone className="w-4 h-4 text-[#A57865]" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-neutral-900">{campaign.title}</p>
                            <p className="text-sm text-neutral-500">{campaign.description}</p>
                          </div>
                        </div>
                        <span className="text-xs text-[#4E5840] font-medium">Create</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex-shrink-0 border-t border-neutral-200 p-4 bg-white rounded-b-2xl">
            <div className="flex items-center gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2.5 border border-neutral-200 text-neutral-700 rounded-xl text-sm font-medium hover:bg-neutral-50 transition-colors"
              >
                Close
              </button>
              <button
                onClick={() => onExportMembers?.(segment.id)}
                className="px-4 py-2.5 border border-neutral-200 text-neutral-700 rounded-xl text-sm font-medium hover:bg-neutral-50 transition-colors flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Export Members
              </button>
              <button
                onClick={() => onCreateCampaign?.(segment.id, 'general')}
                className="flex-1 px-4 py-2.5 bg-[#4E5840] text-white rounded-xl text-sm font-medium hover:bg-[#3d4632] transition-colors flex items-center justify-center gap-2"
              >
                <Megaphone className="w-4 h-4" />
                Create Campaign
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );

  return createPortal(modalContent, document.body);
}
