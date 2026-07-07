import { useState, useEffect, useRef, useCallback } from 'react';
import { useCurrency } from '@/hooks/useCurrency';
import { createPortal } from 'react-dom';
import {
  X,
  Gift,
  Mail,
  MessageSquare,
  Phone,
  User,
  Calendar,
  DollarSign,
  Sparkles,
  Eye,
  Send,
  ChevronDown,
  AlertCircle,
  Check,
  Percent,
  Award,
  ArrowUpCircle,
  Package,
} from 'lucide-react';

// Types
interface OTAGuest {
  id: string;
  name: string;
  email: string;
  phone?: string;
  otaSource: string;
  conversionProbability: number;
  totalStays: number;
  totalSpend: number;
  lastStay?: string;
  averageNightlyRate?: number;
}

interface OTAConversionOfferModalProps {
  isOpen: boolean;
  onClose: () => void;
  guest: OTAGuest | null;
  onSend: (data: OfferFormData) => void;
}

interface OfferFormData {
  guestId: string;
  offerType: string;
  offerValue: number;
  sendChannel: string;
  benefits: string[];
  useAIMessage: boolean;
  customMessage: string;
}

const OFFER_TYPES = [
  { value: 'discount', label: 'Discount', icon: Percent, description: 'Percentage off next booking' },
  { value: 'points', label: 'Bonus Points', icon: Award, description: 'Loyalty points bonus' },
  { value: 'upgrade', label: 'Room Upgrade', icon: ArrowUpCircle, description: 'Complimentary room upgrade' },
  { value: 'package', label: 'Special Package', icon: Package, description: 'Exclusive package deal' },
];

const SEND_CHANNELS = [
  { value: 'email', label: 'Email', icon: Mail },
  { value: 'sms', label: 'SMS', icon: MessageSquare },
  { value: 'whatsapp', label: 'WhatsApp', icon: Phone },
];

const BENEFITS = [
  { value: 'free_breakfast', label: 'Free Breakfast' },
  { value: 'late_checkout', label: 'Late Checkout' },
  { value: 'spa_credit', label: 'Spa Credit' },
  { value: 'dining_credit', label: 'Dining Credit' },
  { value: 'airport_transfer', label: 'Airport Transfer' },
  { value: 'welcome_amenity', label: 'Welcome Amenity' },
  { value: 'early_checkin', label: 'Early Check-in' },
  { value: 'room_upgrade', label: 'Room Upgrade' },
];

const OTA_COLORS: Record<string, { bg: string; text: string }> = {
  'booking.com': { bg: 'bg-[#003580]/10', text: 'text-[#003580]' },
  'expedia': { bg: 'bg-[#00355F]/10', text: 'text-[#00355F]' },
  'agoda': { bg: 'bg-[#5542F6]/10', text: 'text-[#5542F6]' },
  'airbnb': { bg: 'bg-[#FF5A5F]/10', text: 'text-[#FF5A5F]' },
  'default': { bg: 'bg-neutral-100', text: 'text-neutral-600' },
};

const getOTAColors = (source: string) => {
  const normalizedSource = source.toLowerCase();
  return OTA_COLORS[normalizedSource] || OTA_COLORS.default;
};

const getConversionColor = (probability: number): string => {
  if (probability >= 70) return 'text-emerald-600';
  if (probability >= 40) return 'text-amber-600';
  return 'text-rose-600';
};

const getConversionBgColor = (probability: number): string => {
  if (probability >= 70) return 'bg-emerald-500';
  if (probability >= 40) return 'bg-amber-500';
  return 'bg-rose-500';
};

export default function OTAConversionOfferModal({
  isOpen,
  onClose,
  guest,
  onSend,
}: OTAConversionOfferModalProps) {
  const { formatCurrency } = useCurrency();
  const modalRef = useRef<HTMLDivElement>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [showTypeDropdown, setShowTypeDropdown] = useState(false);
  const [showChannelDropdown, setShowChannelDropdown] = useState(false);

  const [formData, setFormData] = useState<OfferFormData>({
    guestId: '',
    offerType: 'discount',
    offerValue: 15,
    sendChannel: 'email',
    benefits: [],
    useAIMessage: true,
    customMessage: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen && guest) {
      setFormData({
        guestId: guest.id,
        offerType: 'discount',
        offerValue: 15,
        sendChannel: 'email',
        benefits: [],
        useAIMessage: true,
        customMessage: '',
      });
      setErrors({});
      setShowPreview(false);
    }
  }, [isOpen, guest]);

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

    if (formData.offerValue <= 0) {
      newErrors.offerValue = 'Offer value must be greater than 0';
    }

    if (!formData.useAIMessage && !formData.customMessage.trim()) {
      newErrors.customMessage = 'Custom message is required when AI message is disabled';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSend = () => {
    if (validateForm()) {
      onSend(formData);
      onClose();
    }
  };

  const toggleBenefit = (benefit: string) => {
    setFormData(prev => ({
      ...prev,
      benefits: prev.benefits.includes(benefit)
        ? prev.benefits.filter(b => b !== benefit)
        : [...prev.benefits, benefit],
    }));
  };

  const getOfferTypeConfig = (type: string) => {
    return OFFER_TYPES.find(t => t.value === type) || OFFER_TYPES[0];
  };

  const getChannelConfig = (channel: string) => {
    return SEND_CHANNELS.find(c => c.value === channel) || SEND_CHANNELS[0];
  };

  const generatePreviewMessage = (): string => {
    if (!guest) return '';

    const offerConfig = getOfferTypeConfig(formData.offerType);
    const firstName = guest.name.split(' ')[0];

    if (formData.useAIMessage) {
      let offerText = '';
      switch (formData.offerType) {
        case 'discount':
          offerText = `${formData.offerValue}% off your next direct booking`;
          break;
        case 'points':
          offerText = `${formData.offerValue.toLocaleString()} bonus loyalty points`;
          break;
        case 'upgrade':
          offerText = 'a complimentary room upgrade';
          break;
        case 'package':
          offerText = 'an exclusive package deal';
          break;
      }

      let benefitsText = '';
      if (formData.benefits.length > 0) {
        const benefitLabels = formData.benefits.map(b =>
          BENEFITS.find(ben => ben.value === b)?.label || b
        );
        benefitsText = `\n\nPlus, enjoy these exclusive benefits:\n- ${benefitLabels.join('\n- ')}`;
      }

      return `Dear ${firstName},\n\nAs a valued guest, we'd like to offer you ${offerText} when you book directly with us next time.${benefitsText}\n\nBook directly to unlock the best rates and exclusive perks!\n\nWarm regards,\nThe Glimmora Team`;
    }

    return formData.customMessage;
  };

  if (!isOpen || !guest) return null;

  const otaColors = getOTAColors(guest.otaSource);
  const selectedOfferType = getOfferTypeConfig(formData.offerType);
  const selectedChannel = getChannelConfig(formData.sendChannel);
  const SelectedOfferIcon = selectedOfferType.icon;
  const SelectedChannelIcon = selectedChannel.icon;

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
          className="w-full max-w-[720px] max-h-[calc(100vh-2rem)] sm:max-h-[90vh] bg-white shadow-2xl rounded-2xl flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex-shrink-0 p-6 border-b border-neutral-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#A57865]/10 flex items-center justify-center">
                  <Gift className="w-5 h-5 text-[#A57865]" />
                </div>
                <div>
                  <h2 id="modal-title" className="text-lg font-semibold text-neutral-900">
                    Create Conversion Offer
                  </h2>
                  <p className="text-sm text-neutral-500">
                    Send a personalized offer to convert OTA guest
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
            {/* Guest Info Section */}
            <div className="p-4 bg-neutral-50 rounded-xl">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-[#A57865]/10 flex items-center justify-center">
                  <User className="w-6 h-6 text-[#A57865]" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-neutral-900">{guest.name}</h3>
                    <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${otaColors.bg} ${otaColors.text}`}>
                      {guest.otaSource}
                    </span>
                  </div>
                  <p className="text-sm text-neutral-600">{guest.email}</p>
                  {guest.phone && (
                    <p className="text-sm text-neutral-500">{guest.phone}</p>
                  )}
                </div>
              </div>

              {/* Conversion Probability Gauge */}
              <div className="mt-4 pt-4 border-t border-neutral-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-neutral-500 uppercase tracking-wide">
                    Conversion Probability
                  </span>
                  <span className={`text-lg font-bold ${getConversionColor(guest.conversionProbability)}`}>
                    {guest.conversionProbability}%
                  </span>
                </div>
                <div className="h-2 bg-neutral-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${getConversionBgColor(guest.conversionProbability)}`}
                    style={{ width: `${guest.conversionProbability}%` }}
                  />
                </div>
              </div>

              {/* Stay History Summary */}
              <div className="mt-4 pt-4 border-t border-neutral-200 grid grid-cols-3 gap-4">
                <div className="text-center">
                  <p className="text-lg font-semibold text-neutral-900">{guest.totalStays}</p>
                  <p className="text-xs text-neutral-500">Total Stays</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-semibold text-neutral-900">{formatCurrency(guest.totalSpend)}</p>
                  <p className="text-xs text-neutral-500">Total Spend</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-semibold text-neutral-900">
                    {guest.lastStay ? new Date(guest.lastStay).toLocaleDateString() : 'N/A'}
                  </p>
                  <p className="text-xs text-neutral-500">Last Stay</p>
                </div>
              </div>
            </div>

            {/* Offer Type and Value */}
            <div className="grid grid-cols-2 gap-4">
              {/* Offer Type Dropdown */}
              <div className="relative">
                <label className="block text-xs font-medium text-neutral-500 uppercase tracking-wide mb-2">
                  Offer Type
                </label>
                <button
                  type="button"
                  onClick={() => setShowTypeDropdown(!showTypeDropdown)}
                  className="w-full px-4 py-2.5 bg-white border border-neutral-200 rounded-xl text-sm text-left flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-[#A57865]/20 focus:border-[#A57865]"
                >
                  <span className="flex items-center gap-2">
                    <SelectedOfferIcon className="w-4 h-4 text-neutral-400" />
                    {selectedOfferType.label}
                  </span>
                  <ChevronDown className={`w-4 h-4 text-neutral-400 transition-transform ${showTypeDropdown ? 'rotate-180' : ''}`} />
                </button>
                {showTypeDropdown && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-neutral-200 rounded-xl shadow-lg py-1">
                    {OFFER_TYPES.map((type) => {
                      const Icon = type.icon;
                      return (
                        <button
                          key={type.value}
                          onClick={() => {
                            setFormData(prev => ({ ...prev, offerType: type.value }));
                            setShowTypeDropdown(false);
                          }}
                          className={`w-full px-4 py-2 text-sm text-left hover:bg-neutral-50 flex items-center gap-2 ${
                            formData.offerType === type.value ? 'bg-[#A57865]/5 text-[#A57865]' : 'text-neutral-700'
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                          <div>
                            <p className="font-medium">{type.label}</p>
                            <p className="text-xs text-neutral-500">{type.description}</p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Offer Value */}
              <div>
                <label className="block text-xs font-medium text-neutral-500 uppercase tracking-wide mb-2">
                  {formData.offerType === 'discount' ? 'Discount %' :
                   formData.offerType === 'points' ? 'Points Amount' : 'Value'}
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.offerValue}
                  onChange={(e) => setFormData(prev => ({ ...prev, offerValue: parseInt(e.target.value) || 0 }))}
                  className={`w-full px-4 py-2.5 bg-white border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#A57865]/20 focus:border-[#A57865] ${
                    errors.offerValue ? 'border-rose-300' : 'border-neutral-200'
                  }`}
                />
                {errors.offerValue && (
                  <p className="mt-1 text-xs text-rose-500 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.offerValue}
                  </p>
                )}
              </div>
            </div>

            {/* Send Channel */}
            <div className="relative">
              <label className="block text-xs font-medium text-neutral-500 uppercase tracking-wide mb-2">
                Send Channel
              </label>
              <button
                type="button"
                onClick={() => setShowChannelDropdown(!showChannelDropdown)}
                className="w-full px-4 py-2.5 bg-white border border-neutral-200 rounded-xl text-sm text-left flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-[#A57865]/20 focus:border-[#A57865]"
              >
                <span className="flex items-center gap-2">
                  <SelectedChannelIcon className="w-4 h-4 text-neutral-400" />
                  {selectedChannel.label}
                </span>
                <ChevronDown className={`w-4 h-4 text-neutral-400 transition-transform ${showChannelDropdown ? 'rotate-180' : ''}`} />
              </button>
              {showChannelDropdown && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-neutral-200 rounded-xl shadow-lg py-1">
                  {SEND_CHANNELS.map((channel) => {
                    const Icon = channel.icon;
                    return (
                      <button
                        key={channel.value}
                        onClick={() => {
                          setFormData(prev => ({ ...prev, sendChannel: channel.value }));
                          setShowChannelDropdown(false);
                        }}
                        className={`w-full px-4 py-2 text-sm text-left hover:bg-neutral-50 flex items-center gap-2 ${
                          formData.sendChannel === channel.value ? 'bg-[#A57865]/5 text-[#A57865]' : 'text-neutral-700'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        {channel.label}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Benefits Checklist */}
            <div>
              <label className="block text-xs font-medium text-neutral-500 uppercase tracking-wide mb-2">
                Additional Benefits
              </label>
              <div className="grid grid-cols-2 gap-2">
                {BENEFITS.map((benefit) => (
                  <button
                    key={benefit.value}
                    type="button"
                    onClick={() => toggleBenefit(benefit.value)}
                    className={`px-3 py-2 rounded-lg text-sm text-left flex items-center gap-2 transition-colors ${
                      formData.benefits.includes(benefit.value)
                        ? 'bg-[#A57865]/10 text-[#A57865] border border-[#A57865]/30'
                        : 'bg-neutral-50 text-neutral-600 border border-transparent hover:bg-neutral-100'
                    }`}
                  >
                    <div className={`w-4 h-4 rounded border flex items-center justify-center ${
                      formData.benefits.includes(benefit.value)
                        ? 'bg-[#A57865] border-[#A57865]'
                        : 'border-neutral-300'
                    }`}>
                      {formData.benefits.includes(benefit.value) && (
                        <Check className="w-3 h-3 text-white" />
                      )}
                    </div>
                    {benefit.label}
                  </button>
                ))}
              </div>
            </div>

            {/* AI Message Toggle */}
            <div className="flex items-center gap-3 p-4 bg-neutral-50 rounded-xl">
              <input
                type="checkbox"
                id="useAIMessage"
                checked={formData.useAIMessage}
                onChange={(e) => setFormData(prev => ({ ...prev, useAIMessage: e.target.checked }))}
                className="w-4 h-4 text-[#A57865] border-neutral-300 rounded focus:ring-[#A57865]"
              />
              <label htmlFor="useAIMessage" className="flex items-center gap-2 text-sm text-neutral-700">
                <Sparkles className="w-4 h-4 text-amber-500" />
                Use AI-generated message
              </label>
            </div>

            {/* Custom Message */}
            {!formData.useAIMessage && (
              <div>
                <label className="block text-xs font-medium text-neutral-500 uppercase tracking-wide mb-2">
                  Custom Message
                </label>
                <textarea
                  value={formData.customMessage}
                  onChange={(e) => setFormData(prev => ({ ...prev, customMessage: e.target.value }))}
                  placeholder="Write your custom offer message..."
                  rows={4}
                  className={`w-full px-4 py-2.5 bg-white border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#A57865]/20 focus:border-[#A57865] resize-none ${
                    errors.customMessage ? 'border-rose-300' : 'border-neutral-200'
                  }`}
                />
                {errors.customMessage && (
                  <p className="mt-1 text-xs text-rose-500 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.customMessage}
                  </p>
                )}
              </div>
            )}

            {/* Message Preview */}
            {showPreview && (
              <div className="p-4 bg-[#4E5840]/5 border border-[#4E5840]/20 rounded-xl">
                <h4 className="text-xs font-medium text-[#4E5840] uppercase tracking-wide mb-2 flex items-center gap-1">
                  <Eye className="w-3 h-3" />
                  Message Preview
                </h4>
                <div className="p-3 bg-white rounded-lg text-sm text-neutral-700 whitespace-pre-wrap">
                  {generatePreviewMessage()}
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
                Cancel
              </button>
              <button
                onClick={() => setShowPreview(!showPreview)}
                className="px-4 py-2.5 border border-neutral-200 text-neutral-700 rounded-xl text-sm font-medium hover:bg-neutral-50 transition-colors flex items-center gap-2"
              >
                <Eye className="w-4 h-4" />
                {showPreview ? 'Hide Preview' : 'Preview'}
              </button>
              <button
                onClick={handleSend}
                className="flex-1 px-4 py-2.5 bg-[#A57865] text-white rounded-xl text-sm font-medium hover:bg-[#8E6554] transition-colors flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                Send Offer
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );

  return createPortal(modalContent, document.body);
}
