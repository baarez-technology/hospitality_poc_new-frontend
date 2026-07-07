import { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  FlaskConical,
  Plus,
  Trash2,
  Percent,
  AlertCircle,
  ChevronDown,
} from 'lucide-react';

// Types
interface Variant {
  id: string;
  name: string;
  label: string;
  content: string;
  isControl: boolean;
}

interface ABTestFormData {
  name: string;
  description: string;
  testType: string;
  campaignId: string;
  variants: Variant[];
  trafficSplit: number[];
  significanceThreshold: number;
  startImmediately: boolean;
}

interface Campaign {
  id: string;
  name: string;
}

interface ABTestCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ABTestFormData) => void;
  campaignId?: string;
  campaigns?: Campaign[];
}

const TEST_TYPES = [
  { value: 'subject_line', label: 'Subject Line' },
  { value: 'offer', label: 'Offer/Discount' },
  { value: 'template', label: 'Email Template' },
  { value: 'cta', label: 'Call to Action' },
  { value: 'timing', label: 'Send Timing' },
  { value: 'channel', label: 'Channel' },
];

const TRAFFIC_SPLITS = [
  { value: [50, 50], label: '50/50' },
  { value: [60, 40], label: '60/40' },
  { value: [70, 30], label: '70/30' },
  { value: [80, 20], label: '80/20' },
];

const SIGNIFICANCE_THRESHOLDS = [
  { value: 90, label: '90% Confidence' },
  { value: 95, label: '95% Confidence' },
  { value: 99, label: '99% Confidence' },
];

const generateVariantId = () => `var_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

const createDefaultVariant = (isControl: boolean, index: number): Variant => ({
  id: generateVariantId(),
  name: isControl ? 'control' : `variant_${String.fromCharCode(65 + index)}`,
  label: isControl ? 'Control (A)' : `Variant ${String.fromCharCode(66 + index - 1)}`,
  content: '',
  isControl,
});

export default function ABTestCreateModal({
  isOpen,
  onClose,
  onSubmit,
  campaignId,
  campaigns = [],
}: ABTestCreateModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const firstInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<ABTestFormData>({
    name: '',
    description: '',
    testType: 'subject_line',
    campaignId: campaignId || '',
    variants: [createDefaultVariant(true, 0), createDefaultVariant(false, 1)],
    trafficSplit: [50, 50],
    significanceThreshold: 95,
    startImmediately: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showTypeDropdown, setShowTypeDropdown] = useState(false);
  const [showCampaignDropdown, setShowCampaignDropdown] = useState(false);
  const [showSplitDropdown, setShowSplitDropdown] = useState(false);
  const [showThresholdDropdown, setShowThresholdDropdown] = useState(false);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setFormData({
        name: '',
        description: '',
        testType: 'subject_line',
        campaignId: campaignId || '',
        variants: [createDefaultVariant(true, 0), createDefaultVariant(false, 1)],
        trafficSplit: [50, 50],
        significanceThreshold: 95,
        startImmediately: false,
      });
      setErrors({});
      // Focus first input after modal opens
      setTimeout(() => firstInputRef.current?.focus(), 100);
    }
  }, [isOpen, campaignId]);

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

    if (!formData.name.trim()) {
      newErrors.name = 'Test name is required';
    }

    if (formData.variants.length < 2) {
      newErrors.variants = 'At least 2 variants are required';
    }

    const emptyVariants = formData.variants.filter(v => !v.content.trim());
    if (emptyVariants.length > 0) {
      newErrors.variantContent = 'All variants must have content';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      onSubmit(formData);
      onClose();
    }
  };

  const handleAddVariant = () => {
    if (formData.variants.length >= 5) return;
    const newVariant = createDefaultVariant(false, formData.variants.length);
    setFormData(prev => ({
      ...prev,
      variants: [...prev.variants, newVariant],
    }));
  };

  const handleRemoveVariant = (variantId: string) => {
    if (formData.variants.length <= 2) return;
    setFormData(prev => ({
      ...prev,
      variants: prev.variants.filter(v => v.id !== variantId),
    }));
  };

  const handleVariantChange = (variantId: string, field: keyof Variant, value: string) => {
    setFormData(prev => ({
      ...prev,
      variants: prev.variants.map(v =>
        v.id === variantId ? { ...v, [field]: value } : v
      ),
    }));
  };

  const getTestTypeLabel = (value: string) =>
    TEST_TYPES.find(t => t.value === value)?.label || value;

  const getCampaignLabel = (id: string) =>
    campaigns.find(c => c.id === id)?.name || 'Select Campaign';

  const getSplitLabel = (split: number[]) =>
    TRAFFIC_SPLITS.find(s => s.value[0] === split[0])?.label || `${split[0]}/${split[1]}`;

  const getThresholdLabel = (value: number) =>
    SIGNIFICANCE_THRESHOLDS.find(t => t.value === value)?.label || `${value}%`;

  if (!isOpen) return null;

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
                <div className="w-10 h-10 rounded-xl bg-[#4E5840]/10 flex items-center justify-center">
                  <FlaskConical className="w-5 h-5 text-[#4E5840]" />
                </div>
                <div>
                  <h2 id="modal-title" className="text-lg font-semibold text-neutral-900">
                    Create A/B Test
                  </h2>
                  <p className="text-sm text-neutral-500">
                    Compare variants to optimize performance
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
            {/* Test Name */}
            <div>
              <label className="block text-xs font-medium text-neutral-500 uppercase tracking-wide mb-2">
                Test Name <span className="text-rose-500">*</span>
              </label>
              <input
                ref={firstInputRef}
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Summer Sale Subject Line Test"
                className={`w-full px-4 py-2.5 bg-white border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#4E5840]/20 focus:border-[#4E5840] ${
                  errors.name ? 'border-rose-300' : 'border-neutral-200'
                }`}
              />
              {errors.name && (
                <p className="mt-1 text-xs text-rose-500 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.name}
                </p>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-medium text-neutral-500 uppercase tracking-wide mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe the purpose of this test..."
                rows={2}
                className="w-full px-4 py-2.5 bg-white border border-neutral-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#4E5840]/20 focus:border-[#4E5840] resize-none"
              />
            </div>

            {/* Test Type and Campaign */}
            <div className="grid grid-cols-2 gap-4">
              {/* Test Type Dropdown */}
              <div className="relative">
                <label className="block text-xs font-medium text-neutral-500 uppercase tracking-wide mb-2">
                  Test Type
                </label>
                <button
                  type="button"
                  onClick={() => setShowTypeDropdown(!showTypeDropdown)}
                  className="w-full px-4 py-2.5 bg-white border border-neutral-200 rounded-xl text-sm text-left flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-[#4E5840]/20 focus:border-[#4E5840]"
                >
                  <span>{getTestTypeLabel(formData.testType)}</span>
                  <ChevronDown className={`w-4 h-4 text-neutral-400 transition-transform ${showTypeDropdown ? 'rotate-180' : ''}`} />
                </button>
                {showTypeDropdown && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-neutral-200 rounded-xl shadow-lg py-1">
                    {TEST_TYPES.map((type) => (
                      <button
                        key={type.value}
                        onClick={() => {
                          setFormData(prev => ({ ...prev, testType: type.value }));
                          setShowTypeDropdown(false);
                        }}
                        className={`w-full px-4 py-2 text-sm text-left hover:bg-neutral-50 ${
                          formData.testType === type.value ? 'bg-[#4E5840]/5 text-[#4E5840]' : 'text-neutral-700'
                        }`}
                      >
                        {type.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Campaign Dropdown */}
              <div className="relative">
                <label className="block text-xs font-medium text-neutral-500 uppercase tracking-wide mb-2">
                  Campaign (Optional)
                </label>
                <button
                  type="button"
                  onClick={() => setShowCampaignDropdown(!showCampaignDropdown)}
                  className="w-full px-4 py-2.5 bg-white border border-neutral-200 rounded-xl text-sm text-left flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-[#4E5840]/20 focus:border-[#4E5840]"
                >
                  <span className={formData.campaignId ? 'text-neutral-900' : 'text-neutral-400'}>
                    {formData.campaignId ? getCampaignLabel(formData.campaignId) : 'Select Campaign'}
                  </span>
                  <ChevronDown className={`w-4 h-4 text-neutral-400 transition-transform ${showCampaignDropdown ? 'rotate-180' : ''}`} />
                </button>
                {showCampaignDropdown && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-neutral-200 rounded-xl shadow-lg py-1 max-h-48 overflow-y-auto">
                    <button
                      onClick={() => {
                        setFormData(prev => ({ ...prev, campaignId: '' }));
                        setShowCampaignDropdown(false);
                      }}
                      className="w-full px-4 py-2 text-sm text-left text-neutral-400 hover:bg-neutral-50"
                    >
                      No Campaign
                    </button>
                    {campaigns.map((campaign) => (
                      <button
                        key={campaign.id}
                        onClick={() => {
                          setFormData(prev => ({ ...prev, campaignId: campaign.id }));
                          setShowCampaignDropdown(false);
                        }}
                        className={`w-full px-4 py-2 text-sm text-left hover:bg-neutral-50 ${
                          formData.campaignId === campaign.id ? 'bg-[#4E5840]/5 text-[#4E5840]' : 'text-neutral-700'
                        }`}
                      >
                        {campaign.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Variants Section */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-xs font-medium text-neutral-500 uppercase tracking-wide">
                  Test Variants
                </label>
                {formData.variants.length < 5 && (
                  <button
                    onClick={handleAddVariant}
                    className="flex items-center gap-1 text-xs font-medium text-[#4E5840] hover:text-[#3d4632] transition-colors"
                  >
                    <Plus className="w-3 h-3" />
                    Add Variant
                  </button>
                )}
              </div>

              {errors.variants && (
                <p className="mb-2 text-xs text-rose-500 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.variants}
                </p>
              )}

              {errors.variantContent && (
                <p className="mb-2 text-xs text-rose-500 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.variantContent}
                </p>
              )}

              <div className="space-y-4">
                {formData.variants.map((variant, index) => (
                  <div
                    key={variant.id}
                    className={`p-4 rounded-xl border ${
                      variant.isControl
                        ? 'border-[#4E5840]/30 bg-[#4E5840]/5'
                        : 'border-neutral-200 bg-neutral-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-medium ${
                          variant.isControl ? 'text-[#4E5840]' : 'text-neutral-700'
                        }`}>
                          {variant.label}
                        </span>
                        {variant.isControl && (
                          <span className="px-2 py-0.5 text-xs font-medium bg-[#4E5840] text-white rounded-full">
                            Control
                          </span>
                        )}
                      </div>
                      {!variant.isControl && formData.variants.length > 2 && (
                        <button
                          onClick={() => handleRemoveVariant(variant.id)}
                          className="p-1 text-neutral-400 hover:text-rose-500 transition-colors"
                          aria-label={`Remove ${variant.label}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-3 mb-3">
                      <input
                        type="text"
                        value={variant.name}
                        onChange={(e) => handleVariantChange(variant.id, 'name', e.target.value)}
                        placeholder="Variant name"
                        className="px-3 py-2 bg-white border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#4E5840]/20 focus:border-[#4E5840]"
                      />
                      <input
                        type="text"
                        value={variant.label}
                        onChange={(e) => handleVariantChange(variant.id, 'label', e.target.value)}
                        placeholder="Display label"
                        className="px-3 py-2 bg-white border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#4E5840]/20 focus:border-[#4E5840]"
                      />
                    </div>

                    <textarea
                      value={variant.content}
                      onChange={(e) => handleVariantChange(variant.id, 'content', e.target.value)}
                      placeholder={`Enter ${formData.testType.replace('_', ' ')} content...`}
                      rows={3}
                      className="w-full px-3 py-2 bg-white border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#4E5840]/20 focus:border-[#4E5840] resize-none"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Traffic Split and Significance */}
            <div className="grid grid-cols-2 gap-4">
              {/* Traffic Split */}
              <div className="relative">
                <label className="block text-xs font-medium text-neutral-500 uppercase tracking-wide mb-2">
                  Traffic Split
                </label>
                <button
                  type="button"
                  onClick={() => setShowSplitDropdown(!showSplitDropdown)}
                  className="w-full px-4 py-2.5 bg-white border border-neutral-200 rounded-xl text-sm text-left flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-[#4E5840]/20 focus:border-[#4E5840]"
                >
                  <span className="flex items-center gap-2">
                    <Percent className="w-4 h-4 text-neutral-400" />
                    {getSplitLabel(formData.trafficSplit)}
                  </span>
                  <ChevronDown className={`w-4 h-4 text-neutral-400 transition-transform ${showSplitDropdown ? 'rotate-180' : ''}`} />
                </button>
                {showSplitDropdown && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-neutral-200 rounded-xl shadow-lg py-1">
                    {TRAFFIC_SPLITS.map((split) => (
                      <button
                        key={split.label}
                        onClick={() => {
                          setFormData(prev => ({ ...prev, trafficSplit: split.value }));
                          setShowSplitDropdown(false);
                        }}
                        className={`w-full px-4 py-2 text-sm text-left hover:bg-neutral-50 ${
                          formData.trafficSplit[0] === split.value[0] ? 'bg-[#4E5840]/5 text-[#4E5840]' : 'text-neutral-700'
                        }`}
                      >
                        {split.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Significance Threshold */}
              <div className="relative">
                <label className="block text-xs font-medium text-neutral-500 uppercase tracking-wide mb-2">
                  Significance Threshold
                </label>
                <button
                  type="button"
                  onClick={() => setShowThresholdDropdown(!showThresholdDropdown)}
                  className="w-full px-4 py-2.5 bg-white border border-neutral-200 rounded-xl text-sm text-left flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-[#4E5840]/20 focus:border-[#4E5840]"
                >
                  <span>{getThresholdLabel(formData.significanceThreshold)}</span>
                  <ChevronDown className={`w-4 h-4 text-neutral-400 transition-transform ${showThresholdDropdown ? 'rotate-180' : ''}`} />
                </button>
                {showThresholdDropdown && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-neutral-200 rounded-xl shadow-lg py-1">
                    {SIGNIFICANCE_THRESHOLDS.map((threshold) => (
                      <button
                        key={threshold.value}
                        onClick={() => {
                          setFormData(prev => ({ ...prev, significanceThreshold: threshold.value }));
                          setShowThresholdDropdown(false);
                        }}
                        className={`w-full px-4 py-2 text-sm text-left hover:bg-neutral-50 ${
                          formData.significanceThreshold === threshold.value ? 'bg-[#4E5840]/5 text-[#4E5840]' : 'text-neutral-700'
                        }`}
                      >
                        {threshold.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Start Immediately */}
            <div className="flex items-center gap-3 p-4 bg-neutral-50 rounded-xl">
              <input
                type="checkbox"
                id="startImmediately"
                checked={formData.startImmediately}
                onChange={(e) => setFormData(prev => ({ ...prev, startImmediately: e.target.checked }))}
                className="w-4 h-4 text-[#4E5840] border-neutral-300 rounded focus:ring-[#4E5840]"
              />
              <label htmlFor="startImmediately" className="text-sm text-neutral-700">
                Start test immediately after creation
              </label>
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
                onClick={handleSubmit}
                className="flex-1 px-4 py-2.5 bg-[#4E5840] text-white rounded-xl text-sm font-medium hover:bg-[#3d4632] transition-colors"
              >
                Create Test
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );

  return createPortal(modalContent, document.body);
}
