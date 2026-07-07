import { useEffect, useRef, useCallback } from 'react';
import { useCurrency } from '@/hooks/useCurrency';
import { createPortal } from 'react-dom';
import {
  X,
  FlaskConical,
  Crown,
  TrendingUp,
  TrendingDown,
  Clock,
  Users,
  Target,
  DollarSign,
  CheckCircle,
  XCircle,
  Rocket,
} from 'lucide-react';

// Types
interface ABTestVariant {
  id: string;
  name: string;
  label: string;
  impressions: number;
  conversions: number;
  conversionRate: number;
  revenue: number;
  isWinner?: boolean;
}

interface ABTest {
  id: string;
  name: string;
  description?: string;
  testType: string;
  status: 'draft' | 'running' | 'paused' | 'completed' | 'deployed';
  startedAt?: string;
  endedAt?: string;
  variants: ABTestVariant[];
  winnerId?: string;
  pValue?: number;
  confidence?: number;
  lift?: number;
  isSignificant?: boolean;
  recommendation?: string;
}

interface ABTestResultsModalProps {
  isOpen: boolean;
  onClose: () => void;
  test: ABTest | null;
  onDeployWinner?: (testId: string, winnerId: string) => void;
}

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  draft: { bg: 'bg-neutral-100', text: 'text-neutral-600' },
  running: { bg: 'bg-blue-100', text: 'text-blue-700' },
  paused: { bg: 'bg-amber-100', text: 'text-amber-700' },
  completed: { bg: 'bg-[#4E5840]/10', text: 'text-[#4E5840]' },
  deployed: { bg: 'bg-emerald-100', text: 'text-emerald-700' },
};

const TEST_TYPE_LABELS: Record<string, string> = {
  subject_line: 'Subject Line Test',
  offer: 'Offer/Discount Test',
  template: 'Template Test',
  cta: 'Call to Action Test',
  timing: 'Send Timing Test',
  channel: 'Channel Test',
};

const formatDuration = (startDate?: string, endDate?: string): string => {
  if (!startDate) return 'Not started';

  const start = new Date(startDate);
  const end = endDate ? new Date(endDate) : new Date();
  const diffMs = end.getTime() - start.getTime();

  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

  if (days > 0) {
    return `${days} day${days > 1 ? 's' : ''} ${hours}h`;
  }
  return `${hours} hour${hours !== 1 ? 's' : ''}`;
};

const formatNumber = (value: number): string => {
  return new Intl.NumberFormat('en-US').format(value);
};

const formatPercent = (value: number): string => {
  return `${value.toFixed(2)}%`;
};

export default function ABTestResultsModal({
  isOpen,
  onClose,
  test,
  onDeployWinner,
}: ABTestResultsModalProps) {
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

  const handleDeployWinner = () => {
    if (test && test.winnerId && onDeployWinner) {
      onDeployWinner(test.id, test.winnerId);
      onClose();
    }
  };

  if (!isOpen || !test) return null;

  const winningVariant = test.variants.find(v => v.id === test.winnerId);
  const canDeploy = test.isSignificant && test.winnerId && test.status !== 'deployed';
  const statusStyle = STATUS_COLORS[test.status] || STATUS_COLORS.draft;

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
                  <FlaskConical className="w-5 h-5 text-[#4E5840]" />
                </div>
                <div>
                  <h2 id="modal-title" className="text-lg font-semibold text-neutral-900">
                    {test.name}
                  </h2>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-sm text-neutral-500">
                      {TEST_TYPE_LABELS[test.testType] || test.testType}
                    </span>
                    <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${statusStyle.bg} ${statusStyle.text}`}>
                      {test.status.charAt(0).toUpperCase() + test.status.slice(1)}
                    </span>
                  </div>
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
            {/* Duration Info */}
            <div className="flex items-center gap-6 p-4 bg-neutral-50 rounded-xl">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-neutral-400" />
                <span className="text-sm text-neutral-600">Duration:</span>
                <span className="text-sm font-medium text-neutral-900">
                  {formatDuration(test.startedAt, test.endedAt)}
                </span>
              </div>
              {test.startedAt && (
                <div className="text-sm text-neutral-500">
                  Started: {new Date(test.startedAt).toLocaleDateString()}
                </div>
              )}
              {test.endedAt && (
                <div className="text-sm text-neutral-500">
                  Ended: {new Date(test.endedAt).toLocaleDateString()}
                </div>
              )}
            </div>

            {/* Variants Comparison Table */}
            <div>
              <h3 className="text-xs font-medium text-neutral-500 uppercase tracking-wide mb-3">
                Variants Comparison
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-neutral-200">
                      <th className="text-left text-xs font-medium text-neutral-500 uppercase tracking-wide py-3 px-4">
                        Variant
                      </th>
                      <th className="text-right text-xs font-medium text-neutral-500 uppercase tracking-wide py-3 px-4">
                        <div className="flex items-center justify-end gap-1">
                          <Users className="w-3 h-3" />
                          Impressions
                        </div>
                      </th>
                      <th className="text-right text-xs font-medium text-neutral-500 uppercase tracking-wide py-3 px-4">
                        <div className="flex items-center justify-end gap-1">
                          <Target className="w-3 h-3" />
                          Conversions
                        </div>
                      </th>
                      <th className="text-right text-xs font-medium text-neutral-500 uppercase tracking-wide py-3 px-4">
                        Rate
                      </th>
                      <th className="text-right text-xs font-medium text-neutral-500 uppercase tracking-wide py-3 px-4">
                        <div className="flex items-center justify-end gap-1">
                          <DollarSign className="w-3 h-3" />
                          Revenue
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {test.variants.map((variant) => {
                      const isWinner = variant.id === test.winnerId;
                      return (
                        <tr
                          key={variant.id}
                          className={`border-b border-neutral-100 ${
                            isWinner ? 'bg-emerald-50' : ''
                          }`}
                        >
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-2">
                              {isWinner && (
                                <Crown className="w-4 h-4 text-amber-500" />
                              )}
                              <span className={`font-medium ${isWinner ? 'text-emerald-700' : 'text-neutral-900'}`}>
                                {variant.label}
                              </span>
                              {variant.name === 'control' && (
                                <span className="px-2 py-0.5 text-xs bg-neutral-200 text-neutral-600 rounded-full">
                                  Control
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-4 px-4 text-right text-sm text-neutral-700">
                            {formatNumber(variant.impressions)}
                          </td>
                          <td className="py-4 px-4 text-right text-sm text-neutral-700">
                            {formatNumber(variant.conversions)}
                          </td>
                          <td className="py-4 px-4 text-right">
                            <span className={`text-sm font-medium ${isWinner ? 'text-emerald-700' : 'text-neutral-900'}`}>
                              {formatPercent(variant.conversionRate)}
                            </span>
                          </td>
                          <td className="py-4 px-4 text-right text-sm font-medium text-neutral-900">
                            {formatCurrency(variant.revenue)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Statistical Significance Section */}
            <div className="p-4 bg-neutral-50 rounded-xl space-y-4">
              <h3 className="text-xs font-medium text-neutral-500 uppercase tracking-wide">
                Statistical Analysis
              </h3>

              <div className="grid grid-cols-3 gap-4">
                {/* P-Value */}
                <div className="bg-white p-4 rounded-lg">
                  <p className="text-xs text-neutral-500 mb-1">P-Value</p>
                  <p className="text-xl font-semibold text-neutral-900">
                    {test.pValue !== undefined ? test.pValue.toFixed(4) : 'N/A'}
                  </p>
                </div>

                {/* Confidence */}
                <div className="bg-white p-4 rounded-lg">
                  <p className="text-xs text-neutral-500 mb-1">Confidence</p>
                  <p className="text-xl font-semibold text-neutral-900">
                    {test.confidence !== undefined ? `${test.confidence.toFixed(1)}%` : 'N/A'}
                  </p>
                  {test.confidence !== undefined && (
                    <div className="mt-2 h-2 bg-neutral-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          test.confidence >= 95 ? 'bg-emerald-500' :
                          test.confidence >= 90 ? 'bg-amber-500' : 'bg-neutral-400'
                        }`}
                        style={{ width: `${Math.min(test.confidence, 100)}%` }}
                      />
                    </div>
                  )}
                </div>

                {/* Lift */}
                <div className="bg-white p-4 rounded-lg">
                  <p className="text-xs text-neutral-500 mb-1">Lift</p>
                  {test.lift !== undefined ? (
                    <div className="flex items-center gap-2">
                      {test.lift > 0 ? (
                        <TrendingUp className="w-5 h-5 text-emerald-500" />
                      ) : (
                        <TrendingDown className="w-5 h-5 text-rose-500" />
                      )}
                      <p className={`text-xl font-semibold ${
                        test.lift > 0 ? 'text-emerald-600' : 'text-rose-600'
                      }`}>
                        {test.lift > 0 ? '+' : ''}{test.lift.toFixed(1)}%
                      </p>
                    </div>
                  ) : (
                    <p className="text-xl font-semibold text-neutral-900">N/A</p>
                  )}
                </div>
              </div>

              {/* Significance Badge */}
              <div className="flex items-center gap-3">
                {test.isSignificant ? (
                  <div className="flex items-center gap-2 px-4 py-2 bg-emerald-100 text-emerald-700 rounded-xl">
                    <CheckCircle className="w-4 h-4" />
                    <span className="text-sm font-medium">Statistically Significant</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 px-4 py-2 bg-amber-100 text-amber-700 rounded-xl">
                    <XCircle className="w-4 h-4" />
                    <span className="text-sm font-medium">Not Statistically Significant</span>
                  </div>
                )}
                {test.lift !== undefined && test.lift > 0 && (
                  <span className="text-sm text-neutral-600">
                    {winningVariant?.label} shows {test.lift.toFixed(1)}% improvement over control
                  </span>
                )}
              </div>
            </div>

            {/* Recommendation */}
            {test.recommendation && (
              <div className="p-4 border border-[#4E5840]/20 bg-[#4E5840]/5 rounded-xl">
                <h3 className="text-xs font-medium text-[#4E5840] uppercase tracking-wide mb-2">
                  Recommendation
                </h3>
                <p className="text-sm text-neutral-700">{test.recommendation}</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex-shrink-0 border-t border-neutral-200 p-4 bg-white rounded-b-2xl">
            <div className="flex items-center gap-3">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2.5 border border-neutral-200 text-neutral-700 rounded-xl text-sm font-medium hover:bg-neutral-50 transition-colors"
              >
                Close
              </button>
              {canDeploy && (
                <button
                  onClick={handleDeployWinner}
                  className="flex-1 px-4 py-2.5 bg-[#4E5840] text-white rounded-xl text-sm font-medium hover:bg-[#3d4632] transition-colors flex items-center justify-center gap-2"
                >
                  <Rocket className="w-4 h-4" />
                  Deploy Winner
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );

  return createPortal(modalContent, document.body);
}
