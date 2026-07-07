import { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  UserPlus,
  Search,
  Crown,
  Star,
  Gift,
  Bell,
  Mail,
  MessageSquare,
  Phone,
  ChevronDown,
  AlertCircle,
  Sparkles,
  Check,
  User,
  Loader2,
} from 'lucide-react';

// Types
interface Guest {
  id: string;
  name: string;
  email: string;
  phone?: string;
  totalStays?: number;
  totalSpend?: number;
}

interface MemberEnrollModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEnroll: (data: EnrollmentFormData) => void;
  guestId?: string;
  guests?: Guest[];
  isLoading?: boolean;
}

interface EnrollmentFormData {
  guestId: string;
  initialTier: string;
  welcomeOffer: boolean;
  notifications: {
    email: boolean;
    sms: boolean;
    push: boolean;
  };
}

interface TierConfig {
  id: string;
  name: string;
  color: string;
  bgColor: string;
  icon: typeof Star;
  discount: number;
  benefits: string[];
}

const TIERS: TierConfig[] = [
  {
    id: 'bronze',
    name: 'Bronze',
    color: 'text-amber-700',
    bgColor: 'bg-amber-100',
    icon: Star,
    discount: 5,
    benefits: ['5% discount on direct bookings', 'Member-only rates', 'Early access to promotions'],
  },
  {
    id: 'silver',
    name: 'Silver',
    color: 'text-neutral-500',
    bgColor: 'bg-neutral-200',
    icon: Star,
    discount: 10,
    benefits: ['10% discount on direct bookings', 'Free room upgrade (subject to availability)', 'Late checkout', 'Welcome amenity'],
  },
  {
    id: 'gold',
    name: 'Gold',
    color: 'text-amber-500',
    bgColor: 'bg-amber-50',
    icon: Crown,
    discount: 15,
    benefits: ['15% discount on direct bookings', 'Guaranteed room upgrade', 'Free breakfast', 'Airport transfer', 'Spa credits'],
  },
  {
    id: 'platinum',
    name: 'Platinum',
    color: 'text-neutral-400',
    bgColor: 'bg-neutral-100',
    icon: Crown,
    discount: 20,
    benefits: ['20% discount on direct bookings', 'Suite upgrade', 'Full board included', 'Personal concierge', 'Exclusive experiences'],
  },
  {
    id: 'diamond',
    name: 'Diamond',
    color: 'text-cyan-500',
    bgColor: 'bg-cyan-50',
    icon: Sparkles,
    discount: 25,
    benefits: ['25% discount on direct bookings', 'Best available suite', 'All-inclusive perks', 'Private transfers', 'VIP experiences', 'Dedicated host'],
  },
];

const generateMemberNumber = (year: number): string => {
  const randomPart = Math.floor(1000 + Math.random() * 9000);
  return `GLM-${year}-${randomPart}`;
};

export default function MemberEnrollModal({
  isOpen,
  onClose,
  onEnroll,
  guestId,
  guests = [],
  isLoading = false,
}: MemberEnrollModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [showGuestDropdown, setShowGuestDropdown] = useState(false);
  const [showTierDropdown, setShowTierDropdown] = useState(false);
  const [memberNumberPreview, setMemberNumberPreview] = useState('');

  const [formData, setFormData] = useState<EnrollmentFormData>({
    guestId: '',
    initialTier: 'bronze',
    welcomeOffer: true,
    notifications: {
      email: true,
      sms: false,
      push: true,
    },
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setFormData({
        guestId: guestId || '',
        initialTier: 'bronze',
        welcomeOffer: true,
        notifications: {
          email: true,
          sms: false,
          push: true,
        },
      });
      setSearchQuery('');
      setErrors({});
      setMemberNumberPreview(generateMemberNumber(new Date().getFullYear()));
    }
  }, [isOpen, guestId]);

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

  // Filter guests based on search
  const filteredGuests = guests.filter(guest =>
    guest.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    guest.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedGuest = guests.find(g => g.id === formData.guestId);
  const selectedTier = TIERS.find(t => t.id === formData.initialTier) || TIERS[0];

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.guestId) {
      newErrors.guestId = 'Please select a guest';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleEnroll = () => {
    if (validateForm()) {
      onEnroll(formData);
      onClose();
    }
  };

  const handleSelectGuest = (guest: Guest) => {
    setFormData(prev => ({ ...prev, guestId: guest.id }));
    setSearchQuery('');
    setShowGuestDropdown(false);
  };

  const handleNotificationChange = (channel: 'email' | 'sms' | 'push') => {
    setFormData(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [channel]: !prev.notifications[channel],
      },
    }));
  };

  if (!isOpen) return null;

  const TierIcon = selectedTier.icon;

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
          className="w-full max-w-[600px] max-h-[calc(100vh-2rem)] sm:max-h-[90vh] bg-white shadow-2xl rounded-2xl flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex-shrink-0 p-6 border-b border-neutral-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#4E5840]/10 flex items-center justify-center">
                  <UserPlus className="w-5 h-5 text-[#4E5840]" />
                </div>
                <div>
                  <h2 id="modal-title" className="text-lg font-semibold text-neutral-900">
                    Enroll New Member
                  </h2>
                  <p className="text-sm text-neutral-500">
                    Add guest to direct booking program
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
            {/* Guest Search/Select */}
            {!guestId && (
              <div className="relative">
                <label className="block text-xs font-medium text-neutral-500 uppercase tracking-wide mb-2">
                  Select Guest <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={selectedGuest ? selectedGuest.name : searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setFormData(prev => ({ ...prev, guestId: '' }));
                      setShowGuestDropdown(true);
                    }}
                    onFocus={() => setShowGuestDropdown(true)}
                    placeholder="Search by name or email..."
                    className={`w-full pl-10 pr-4 py-2.5 bg-white border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#4E5840]/20 focus:border-[#4E5840] ${
                      errors.guestId ? 'border-rose-300' : 'border-neutral-200'
                    }`}
                  />
                  {isLoading && (
                    <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 animate-spin" />
                  )}
                </div>

                {showGuestDropdown && searchQuery && filteredGuests.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-neutral-200 rounded-xl shadow-lg py-1 max-h-48 overflow-y-auto">
                    {filteredGuests.map((guest) => (
                      <button
                        key={guest.id}
                        onClick={() => handleSelectGuest(guest)}
                        className="w-full px-4 py-2 text-sm text-left hover:bg-neutral-50 flex items-center gap-3"
                      >
                        <div className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center">
                          <User className="w-4 h-4 text-neutral-500" />
                        </div>
                        <div>
                          <p className="font-medium text-neutral-900">{guest.name}</p>
                          <p className="text-xs text-neutral-500">{guest.email}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {showGuestDropdown && searchQuery && filteredGuests.length === 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-neutral-200 rounded-xl shadow-lg py-4 text-center text-sm text-neutral-500">
                    No guests found
                  </div>
                )}

                {errors.guestId && (
                  <p className="mt-1 text-xs text-rose-500 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.guestId}
                  </p>
                )}
              </div>
            )}

            {/* Selected Guest Display (when guestId is provided) */}
            {guestId && selectedGuest && (
              <div className="p-4 bg-neutral-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#4E5840]/10 flex items-center justify-center">
                    <User className="w-5 h-5 text-[#4E5840]" />
                  </div>
                  <div>
                    <p className="font-medium text-neutral-900">{selectedGuest.name}</p>
                    <p className="text-sm text-neutral-500">{selectedGuest.email}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Initial Tier Dropdown */}
            <div className="relative">
              <label className="block text-xs font-medium text-neutral-500 uppercase tracking-wide mb-2">
                Initial Tier
              </label>
              <button
                type="button"
                onClick={() => setShowTierDropdown(!showTierDropdown)}
                className="w-full px-4 py-2.5 bg-white border border-neutral-200 rounded-xl text-sm text-left flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-[#4E5840]/20 focus:border-[#4E5840]"
              >
                <span className="flex items-center gap-2">
                  <div className={`w-6 h-6 rounded-full ${selectedTier.bgColor} flex items-center justify-center`}>
                    <TierIcon className={`w-3 h-3 ${selectedTier.color}`} />
                  </div>
                  <span className="font-medium">{selectedTier.name}</span>
                  <span className="text-neutral-500">({selectedTier.discount}% discount)</span>
                </span>
                <ChevronDown className={`w-4 h-4 text-neutral-400 transition-transform ${showTierDropdown ? 'rotate-180' : ''}`} />
              </button>

              {showTierDropdown && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-neutral-200 rounded-xl shadow-lg py-1 max-h-64 overflow-y-auto">
                  {TIERS.map((tier) => {
                    const Icon = tier.icon;
                    return (
                      <button
                        key={tier.id}
                        onClick={() => {
                          setFormData(prev => ({ ...prev, initialTier: tier.id }));
                          setShowTierDropdown(false);
                        }}
                        className={`w-full px-4 py-3 text-sm text-left hover:bg-neutral-50 flex items-center gap-3 ${
                          formData.initialTier === tier.id ? 'bg-[#4E5840]/5' : ''
                        }`}
                      >
                        <div className={`w-8 h-8 rounded-full ${tier.bgColor} flex items-center justify-center`}>
                          <Icon className={`w-4 h-4 ${tier.color}`} />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-neutral-900">{tier.name}</p>
                          <p className="text-xs text-neutral-500">{tier.discount}% discount</p>
                        </div>
                        {formData.initialTier === tier.id && (
                          <Check className="w-4 h-4 text-[#4E5840]" />
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Welcome Offer Toggle */}
            <div className="flex items-center justify-between p-4 bg-neutral-50 rounded-xl">
              <div className="flex items-center gap-3">
                <Gift className="w-5 h-5 text-amber-500" />
                <div>
                  <p className="font-medium text-neutral-900">Welcome Offer</p>
                  <p className="text-xs text-neutral-500">Send welcome bonus to new member</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, welcomeOffer: !prev.welcomeOffer }))}
                className={`relative w-11 h-6 rounded-full transition-colors ${
                  formData.welcomeOffer ? 'bg-[#4E5840]' : 'bg-neutral-300'
                }`}
              >
                <span
                  className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                    formData.welcomeOffer ? 'translate-x-5' : ''
                  }`}
                />
              </button>
            </div>

            {/* Notification Preferences */}
            <div>
              <label className="block text-xs font-medium text-neutral-500 uppercase tracking-wide mb-3">
                <Bell className="w-3 h-3 inline mr-1" />
                Notification Preferences
              </label>
              <div className="space-y-2">
                {[
                  { id: 'email', label: 'Email', icon: Mail, description: 'Receive offers and updates via email' },
                  { id: 'sms', label: 'SMS', icon: MessageSquare, description: 'Receive SMS notifications' },
                  { id: 'push', label: 'Push', icon: Phone, description: 'Receive push notifications' },
                ].map((channel) => {
                  const Icon = channel.icon;
                  const isEnabled = formData.notifications[channel.id as keyof typeof formData.notifications];
                  return (
                    <button
                      key={channel.id}
                      type="button"
                      onClick={() => handleNotificationChange(channel.id as 'email' | 'sms' | 'push')}
                      className={`w-full px-4 py-3 rounded-xl text-left flex items-center justify-between transition-colors ${
                        isEnabled
                          ? 'bg-[#4E5840]/5 border border-[#4E5840]/20'
                          : 'bg-neutral-50 border border-transparent hover:bg-neutral-100'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className={`w-4 h-4 ${isEnabled ? 'text-[#4E5840]' : 'text-neutral-400'}`} />
                        <div>
                          <p className={`text-sm font-medium ${isEnabled ? 'text-[#4E5840]' : 'text-neutral-700'}`}>
                            {channel.label}
                          </p>
                          <p className="text-xs text-neutral-500">{channel.description}</p>
                        </div>
                      </div>
                      <div className={`w-5 h-5 rounded border flex items-center justify-center ${
                        isEnabled
                          ? 'bg-[#4E5840] border-[#4E5840]'
                          : 'border-neutral-300'
                      }`}>
                        {isEnabled && <Check className="w-3 h-3 text-white" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Preview Section */}
            <div className="p-4 bg-[#4E5840]/5 border border-[#4E5840]/20 rounded-xl">
              <h4 className="text-xs font-medium text-[#4E5840] uppercase tracking-wide mb-3">
                Membership Preview
              </h4>

              {/* Member Number Preview */}
              <div className="mb-4">
                <p className="text-xs text-neutral-500 mb-1">Member Number</p>
                <p className="font-mono text-lg font-semibold text-neutral-900">{memberNumberPreview}</p>
              </div>

              {/* Tier Benefits Preview */}
              <div>
                <p className="text-xs text-neutral-500 mb-2">
                  {selectedTier.name} Tier Benefits
                </p>
                <ul className="space-y-1">
                  {selectedTier.benefits.map((benefit, index) => (
                    <li key={index} className="flex items-center gap-2 text-sm text-neutral-700">
                      <Check className="w-3 h-3 text-[#4E5840]" />
                      {benefit}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
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
                onClick={handleEnroll}
                disabled={isLoading}
                className="flex-1 px-4 py-2.5 bg-[#4E5840] text-white rounded-xl text-sm font-medium hover:bg-[#3d4632] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <UserPlus className="w-4 h-4" />
                )}
                Enroll Member
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );

  return createPortal(modalContent, document.body);
}
