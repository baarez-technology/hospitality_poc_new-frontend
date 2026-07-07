import { useState } from 'react';
import { Calendar, CalendarDays, MapPin, TrendingUp, FileText, AlertCircle, CheckCircle } from 'lucide-react';
import { Modal, ModalHeader, ModalTitle, ModalDescription, ModalContent, ModalFooter } from '../ui2/Modal';
import { Button } from '../ui2/Button';
import { DatePicker } from '../ui2/DatePicker';
import { revenueIntelligenceService, CreateEventRequest, Event } from '../../api/services/revenue-intelligence.service';

interface EventModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: (event: Event) => void;
}

interface FormData {
  name: string;
  startDate: string;
  endDate: string;
  type: 'local' | 'regional' | 'national' | 'international';
  expectedImpact: 'high' | 'medium' | 'low';
  description: string;
}

interface FormErrors {
  name?: string;
  startDate?: string;
  endDate?: string;
  type?: string;
  expectedImpact?: string;
}

const EVENT_TYPES = [
  { value: 'local', label: 'Local', description: 'City/neighborhood event', color: 'bg-sage-100 text-sage-700 border-sage-200' },
  { value: 'regional', label: 'Regional', description: 'State/province event', color: 'bg-ocean-100 text-ocean-700 border-ocean-200' },
  { value: 'national', label: 'National', description: 'Country-wide event', color: 'bg-gold-100 text-gold-700 border-gold-200' },
  { value: 'international', label: 'International', description: 'Global event', color: 'bg-terra-100 text-terra-700 border-terra-200' },
] as const;

const IMPACT_LEVELS = [
  { value: 'low', label: 'Low', description: '+5-15% demand', color: 'bg-neutral-100 text-neutral-700' },
  { value: 'medium', label: 'Medium', description: '+15-30% demand', color: 'bg-gold-100 text-gold-700' },
  { value: 'high', label: 'High', description: '+30%+ demand', color: 'bg-rose-100 text-rose-700' },
] as const;

export default function EventModal({ open, onClose, onSuccess }: EventModalProps) {
  const today = new Date().toISOString().split('T')[0];

  const [formData, setFormData] = useState<FormData>({
    name: '',
    startDate: '',
    endDate: '',
    type: 'local',
    expectedImpact: 'medium',
    description: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Event name is required';
    } else if (formData.name.trim().length < 3) {
      newErrors.name = 'Event name must be at least 3 characters';
    }

    if (!formData.startDate) {
      newErrors.startDate = 'Start date is required';
    }

    if (!formData.endDate) {
      newErrors.endDate = 'End date is required';
    } else if (formData.startDate && formData.endDate < formData.startDate) {
      newErrors.endDate = 'End date must be after start date';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
    setApiError(null);
    setSuccess(false);
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    setApiError(null);

    try {
      const request: CreateEventRequest = {
        name: formData.name.trim(),
        startDate: formData.startDate,
        endDate: formData.endDate,
        type: formData.type,
        expectedImpact: formData.expectedImpact,
        description: formData.description.trim() || undefined,
      };

      const event = await revenueIntelligenceService.createEvent(request);
      setSuccess(true);

      // Notify parent component
      onSuccess?.(event);

      // Close modal after brief delay to show success message
      setTimeout(() => {
        handleClose();
      }, 1500);
    } catch (err) {
      console.error('Failed to create event:', err);
      setApiError('Failed to create event. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      name: '',
      startDate: '',
      endDate: '',
      type: 'local',
      expectedImpact: 'medium',
      description: '',
    });
    setErrors({});
    setApiError(null);
    setSuccess(false);
    onClose();
  };

  // Calculate event duration
  const getEventDuration = () => {
    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      return days > 0 ? `${days} day${days > 1 ? 's' : ''}` : null;
    }
    return null;
  };

  return (
    <Modal open={open} onClose={handleClose} size="lg">
      <ModalHeader icon={CalendarDays}>
        <ModalTitle>Add Event</ModalTitle>
        <ModalDescription>
          Track local events and holidays that may impact demand and pricing
        </ModalDescription>
      </ModalHeader>

      <ModalContent className="space-y-5">
        {/* Success Message */}
        {success && (
          <div className="flex items-center gap-3 p-4 bg-sage-50 rounded-xl border border-sage-200">
            <CheckCircle className="w-5 h-5 text-sage-600 flex-shrink-0" />
            <div>
              <p className="font-medium text-sage-900">Event Added Successfully</p>
              <p className="text-sm text-sage-700">AI will factor this event into rate recommendations.</p>
            </div>
          </div>
        )}

        {/* Event Name */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">
            Event Name <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Calendar className="w-4 h-4 text-neutral-400" />
            </div>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="e.g., Diwali Festival, Tech Conference 2025"
              className={`w-full pl-10 pr-4 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-terra-500/20 focus:border-terra-500 transition-colors ${
                errors.name ? 'border-rose-300 bg-rose-50' : 'border-neutral-300 bg-white'
              }`}
              disabled={loading || success}
            />
          </div>
          {errors.name && (
            <p className="mt-1.5 text-xs text-rose-600 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              {errors.name}
            </p>
          )}
        </div>

        {/* Date Range */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Start Date <span className="text-rose-500">*</span>
            </label>
            <DatePicker
              value={formData.startDate}
              onChange={(value) => handleInputChange('startDate', value)}
              minDate={today}
              placeholder="Select start date"
              disabled={loading || success}
              className="w-full"
            />
            {errors.startDate && (
              <p className="mt-1.5 text-xs text-rose-600 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.startDate}
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              End Date <span className="text-rose-500">*</span>
            </label>
            <DatePicker
              value={formData.endDate}
              onChange={(value) => handleInputChange('endDate', value)}
              minDate={formData.startDate || today}
              placeholder="Select end date"
              disabled={loading || success}
              className="w-full"
            />
            {errors.endDate && (
              <p className="mt-1.5 text-xs text-rose-600 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.endDate}
              </p>
            )}
          </div>
        </div>
        {getEventDuration() && (
          <p className="text-xs text-neutral-500">
            Event duration: <span className="font-medium">{getEventDuration()}</span>
          </p>
        )}

        {/* Event Type */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-3">
            Event Type
          </label>
          <div className="grid grid-cols-4 gap-2">
            {EVENT_TYPES.map((type) => (
              <button
                key={type.value}
                onClick={() => handleInputChange('type', type.value)}
                disabled={loading || success}
                className={`p-3 rounded-lg border-2 transition-all text-center ${
                  formData.type === type.value
                    ? type.color
                    : 'bg-white border-neutral-200 hover:border-neutral-300'
                }`}
              >
                <p className="text-sm font-medium">{type.label}</p>
                <p className="text-xs opacity-75 mt-0.5">{type.description}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Expected Impact */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-3">
            Expected Demand Impact
          </label>
          <div className="grid grid-cols-3 gap-3">
            {IMPACT_LEVELS.map((impact) => (
              <button
                key={impact.value}
                onClick={() => handleInputChange('expectedImpact', impact.value)}
                disabled={loading || success}
                className={`p-4 rounded-xl border-2 transition-all ${
                  formData.expectedImpact === impact.value
                    ? `${impact.color} border-current`
                    : 'bg-white border-neutral-200 hover:border-neutral-300'
                }`}
              >
                <div className="flex items-center justify-center gap-2 mb-1">
                  <TrendingUp className="w-4 h-4" />
                  <span className="font-semibold">{impact.label}</span>
                </div>
                <p className="text-xs opacity-75">{impact.description}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">
            Description (Optional)
          </label>
          <div className="relative">
            <div className="absolute top-3 left-3 pointer-events-none">
              <FileText className="w-4 h-4 text-neutral-400" />
            </div>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Additional details about the event..."
              rows={3}
              className="w-full pl-10 pr-4 py-2.5 text-sm border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-terra-500/20 focus:border-terra-500 transition-colors resize-none"
              disabled={loading || success}
            />
          </div>
        </div>

        {/* API Error */}
        {apiError && (
          <div className="flex items-center gap-2 p-3 bg-rose-50 rounded-lg border border-rose-200">
            <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
            <p className="text-sm text-rose-700">{apiError}</p>
          </div>
        )}

        {/* Info Box */}
        <div className="p-4 bg-ocean-50 rounded-xl border border-ocean-200">
          <p className="text-xs font-medium text-ocean-700 mb-1">How events affect pricing</p>
          <p className="text-xs text-ocean-600 leading-relaxed">
            Events are factored into our AI demand forecasting. Higher impact events will trigger
            more aggressive rate recommendations. You can view event impact analysis after the event
            concludes.
          </p>
        </div>
      </ModalContent>

      <ModalFooter>
        <Button variant="outline" onClick={handleClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          variant="primary"
          icon={CalendarDays}
          onClick={handleSubmit}
          loading={loading}
          disabled={loading || success || !formData.name.trim() || !formData.startDate || !formData.endDate}
        >
          Add Event
        </Button>
      </ModalFooter>
    </Modal>
  );
}
