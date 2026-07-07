import { useState, useEffect, useRef, useCallback } from 'react';
import { useCurrency } from '@/hooks/useCurrency';
import { createPortal } from 'react-dom';
import {
  X,
  ArrowUpCircle,
  Crown,
  Star,
  Sparkles,
  Check,
  Bell,
  ChevronDown,
  AlertCircle,
  TrendingUp,
  DollarSign,
  Loader2,
} from 'lucide-react';

// Types
interface DirectMember {
  id: string;
  guestId: string;
  name: string;
  email: string;
  memberNumber: string;
  currentTier: string;
  points: number;
  totalSpend: number;
  enrolledAt: string;
}

interface TierUpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  member: DirectMember | null;
  onUpgrade: (data: UpgradeFormData) => void;
  isLoading?: boolean;
}

interface UpgradeFormData {
  memberId: string;
  newTier: string;
  reason: string;
  notifyMember: boolean;
}

interface TierConfig {
  id: string;
  name: string;
  color: string;
  bgColor: string;
  borderColor: string;
  icon: typeof Star;
  discount: number;
  minSpend: number;
  benefits: string[];
}

const TIERS: TierConfig[] = [
  {
    id: 'bronze',
    name: 'Bronze',
    color: 'text-amber-700',
    bgColor: 'bg-amber-100',
    borderColor: 'border-amber-300',
    icon: Star,
    discount: 5,
    minSpend: 0,
    benefits: ['5% discount on direct bookings', 'Member-only rates', 'Early access to promotions'],
  },
  {
    id: 'silver',
    name: 'Silver',
    color: 'text-neutral-500',
    bgColor: 'bg-neutral-200',
    borderColor: 'border-neutral-300',
    icon: Star,
    discount: 10,
    minSpend: 2000,
    benefits: ['10% discount on direct bookings', 'Free room upgrade (subject to availability)', 'Late checkout', 'Welcome amenity'],
  },
  {
    id: 'gold',
    name: 'Gold',
    color: 'text-amber-500',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
    icon: Crown,
    discount: 15,
    minSpend: 5000,
    benefits: ['15% discount on direct bookings', 'Guaranteed room upgrade', 'Free breakfast', 'Airport transfer', 'Spa credits'],
  },
  {
    id: 'platinum',
    name: 'Platinum',
    color: 'text-neutral-400',
    bgColor: 'bg-neutral-100',
    borderColor: 'border-neutral-200',
    icon: Crown,
    discount: 20,
    minSpend: 10000,
    benefits: ['20% discount on direct bookings', 'Suite upgrade', 'Full board included', 'Personal concierge', 'Exclusive experiences'],
  },
  {
    id: 'diamond',
    name: 'Diamond',
    color: 'text-cyan-500',
    bgColor: 'bg-cyan-50',
    borderColor: 'border-cyan-200',
    icon: Sparkles,
    discount: 25,
    minSpend: 25000,
    benefits: ['25% discount on direct bookings', 'Best available suite', 'All-inclusive perks', 'Private transfers', 'VIP experiences', 'Dedicated host'],
  },
];

const getTierIndex = (tierId: string): number => {
  return TIERS.findIndex(t => t.id === tierId);
};

const getTierConfig = (tierId: string): TierConfig | undefined => {
  return TIERS.find(t => t.id === tierId);
};

export default function TierUpgradeModal({
  isOpen,
  onClose,
  member,
  onUpgrade,
  isLoading = false,
}: TierUpgradeModalProps) {
  const { formatCurrency } = useCurrency();
  const modalRef = useRef<HTMLDivElement>(null);
  const [showTierDropdown, setShowTierDropdown] = useState(false);

  const [formData, setFormData] = useState<UpgradeFormData>({
    memberId: '',
    newTier: '',
    reason: '',
    notifyMember: true,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Get available tiers (only above current)
  const availableTiers = member
    ? TIERS.filter(t => getTierIndex(t.id) > getTierIndex(member.currentTier))
    : [];

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen && member) {
      const defaultNewTier = availableTiers.length > 0 ? availableTiers[0].id : '';
      setFormData({
        memberId: member.id,
        newTier: defaultNewTier,
        reason: '',
        notifyMember: true,
      });
      setErrors({});
    }
  }, [isOpen, member]);

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

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.newTier) {
      newErrors.newTier = 'Please select a new tier';
    }

    if (!formData.reason.trim()) {
      newErrors.reason = 'Please provide an upgrade reason';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleUpgrade = () => {
    if (validateForm()) {
      onUpgrade(formData);
      onClose();
    }
  };

  if (!isOpen || !member) return null;

  const currentTier = getTierConfig(member.currentTier);
  const newTier = getTierConfig(formData.newTier);

  if (!currentTier) return null;

  const CurrentTierIcon = currentTier.icon;
  const NewTierIcon = newTier?.icon || Star;

  // Calculate new benefits (benefits in new tier not in current)
  const newBenefits = newTier
    ? newTier.benefits.filter(b => !currentTier.benefits.includes(b))
    : [];

  // Calculate discount change
  const discountChange = newTier ? newTier.discount - currentTier.discount : 0;

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
          className="w-full max-w-[560px] max-h-[calc(100vh-2rem)] sm:max-h-[90vh] bg-white shadow-2xl rounded-2xl flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex-shrink-0 p-6 border-b border-neutral-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#4E5840]/10 flex items-center justify-center">
                  <ArrowUpCircle className="w-5 h-5 text-[#4E5840]" />
                </div>
                <div>
                  <h2 id="modal-title" className="text-lg font-semibold text-neutral-900">
                    Upgrade Member Tier
                  </h2>
                  <p className="text-sm text-neutral-500">
                    Manually upgrade member to a higher tier
                  </p>
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
            {/* Current Tier Display */}
            <div className={`p-4 rounded-xl border-2 ${currentTier.borderColor} ${currentTier.bgColor}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full bg-white flex items-center justify-center`}>
                    <CurrentTierIcon className={`w-5 h-5 ${currentTier.color}`} />
                  </div>
                  <div>
                    <p className="text-xs text-neutral-500 uppercase tracking-wide">Current Tier</p>
                    <p className={`text-lg font-bold ${currentTier.color}`}>{currentTier.name}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-neutral-500">Member</p>
                  <p className="font-medium text-neutral-900">{member.name}</p>
                  <p className="text-xs text-neutral-500 font-mono">{member.memberNumber}</p>
                </div>
              </div>

              {/* Current Points/Spend */}
              <div className="mt-4 pt-4 border-t border-white/50 grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-neutral-500 flex items-center gap-1">
                    <Star className="w-3 h-3" />
                    Points Balance
                  </p>
                  <p className="text-lg font-semibold text-neutral-900">
                    {member.points.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-neutral-500 flex items-center gap-1">
                    <DollarSign className="w-3 h-3" />
                    Total Spend
                  </p>
                  <p className="text-lg font-semibold text-neutral-900">
                    {formatCurrency(member.totalSpend)}
                  </p>
                </div>
              </div>
            </div>

            {/* New Tier Selection */}
            <div className="relative">
              <label className="block text-xs font-medium text-neutral-500 uppercase tracking-wide mb-2">
                New Tier <span className="text-rose-500">*</span>
              </label>

              {availableTiers.length === 0 ? (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-700">
                  This member is already at the highest tier (Diamond).
                </div>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => setShowTierDropdown(!showTierDropdown)}
                    className={`w-full px-4 py-3 bg-white border rounded-xl text-sm text-left flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-[#4E5840]/20 focus:border-[#4E5840] ${
                      errors.newTier ? 'border-rose-300' : 'border-neutral-200'
                    }`}
                  >
                    {newTier ? (
                      <span className="flex items-center gap-2">
                        <div className={`w-8 h-8 rounded-full ${newTier.bgColor} flex items-center justify-center`}>
                          <NewTierIcon className={`w-4 h-4 ${newTier.color}`} />
                        </div>
                        <span className="font-medium">{newTier.name}</span>
                        <span className="text-neutral-500">({newTier.discount}% discount)</span>
                      </span>
                    ) : (
                      <span className="text-neutral-400">Select new tier</span>
                    )}
                    <ChevronDown className={`w-4 h-4 text-neutral-400 transition-transform ${showTierDropdown ? 'rotate-180' : ''}`} />
                  </button>

                  {showTierDropdown && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-neutral-200 rounded-xl shadow-lg py-1">
                      {availableTiers.map((tier) => {
                        const Icon = tier.icon;
                        return (
                          <button
                            key={tier.id}
                            onClick={() => {
                              setFormData(prev => ({ ...prev, newTier: tier.id }));
                              setShowTierDropdown(false);
                            }}
                            className={`w-full px-4 py-3 text-sm text-left hover:bg-neutral-50 flex items-center gap-3 ${
                              formData.newTier === tier.id ? 'bg-[#4E5840]/5' : ''
                            }`}
                          >
                            <div className={`w-8 h-8 rounded-full ${tier.bgColor} flex items-center justify-center`}>
                              <Icon className={`w-4 h-4 ${tier.color}`} />
                            </div>
                            <div className="flex-1">
                              <p className="font-medium text-neutral-900">{tier.name}</p>
                              <p className="text-xs text-neutral-500">{tier.discount}% discount</p>
                            </div>
                            {formData.newTier === tier.id && (
                              <Check className="w-4 h-4 text-[#4E5840]" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {errors.newTier && (
                    <p className="mt-1 text-xs text-rose-500 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.newTier}
                    </p>
                  )}
                </>
              )}
            </div>

            {/* Upgrade Reason */}
            <div>
              <label className="block text-xs font-medium text-neutral-500 uppercase tracking-wide mb-2">
                Upgrade Reason <span className="text-rose-500">*</span>
              </label>
              <textarea
                value={formData.reason}
                onChange={(e) => setFormData(prev => ({ ...prev, reason: e.target.value }))}
                placeholder="Explain the reason for this manual upgrade..."
                rows={3}
                className={`w-full px-4 py-2.5 bg-white border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#4E5840]/20 focus:border-[#4E5840] resize-none ${
                  errors.reason ? 'border-rose-300' : 'border-neutral-200'
                }`}
              />
              {errors.reason && (
                <p className="mt-1 text-xs text-rose-500 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.reason}
                </p>
              )}
            </div>

            {/* Notify Member Toggle */}
            <div className="flex items-center justify-between p-4 bg-neutral-50 rounded-xl">
              <div className="flex items-center gap-3">
                <Bell className="w-5 h-5 text-[#4E5840]" />
                <div>
                  <p className="font-medium text-neutral-900">Notify Member</p>
                  <p className="text-xs text-neutral-500">Send upgrade notification to member</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, notifyMember: !prev.notifyMember }))}
                className={`relative w-11 h-6 rounded-full transition-colors ${
                  formData.notifyMember ? 'bg-[#4E5840]' : 'bg-neutral-300'
                }`}
              >
                <span
                  className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                    formData.notifyMember ? 'translate-x-5' : ''
                  }`}
                />
              </button>
            </div>

            {/* Preview: New Benefits */}
            {newTier && newBenefits.length > 0 && (
              <div className="p-4 bg-[#4E5840]/5 border border-[#4E5840]/20 rounded-xl">
                <h4 className="text-xs font-medium text-[#4E5840] uppercase tracking-wide mb-3 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  New Benefits
                </h4>

                {/* Discount Change */}
                <div className="mb-3 pb-3 border-b border-[#4E5840]/10">
                  <p className="text-sm text-neutral-600">
                    Discount increases from{' '}
                    <span className="font-medium text-neutral-900">{currentTier.discount}%</span>
                    {' to '}
                    <span className="font-medium text-[#4E5840]">{newTier.discount}%</span>
                    <span className="ml-2 text-xs text-[#4E5840]">(+{discountChange}%)</span>
                  </p>
                </div>

                {/* New Benefits List */}
                <ul className="space-y-2">
                  {newBenefits.map((benefit, index) => (
                    <li key={index} className="flex items-center gap-2 text-sm text-neutral-700">
                      <Check className="w-4 h-4 text-[#4E5840] flex-shrink-0" />
                      {benefit}
                    </li>
                  ))}
                </ul>
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
                Cancel
              </button>
              <button
                onClick={handleUpgrade}
                disabled={isLoading || availableTiers.length === 0}
                className="flex-1 px-4 py-2.5 bg-[#4E5840] text-white rounded-xl text-sm font-medium hover:bg-[#3d4632] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <ArrowUpCircle className="w-4 h-4" />
                )}
                Upgrade Tier
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );

  return createPortal(modalContent, document.body);
}
