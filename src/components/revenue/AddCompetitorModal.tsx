import { useState } from 'react';
import { Building2, Globe, Star, MapPin, AlertCircle, CheckCircle } from 'lucide-react';
import { Modal, ModalHeader, ModalTitle, ModalDescription, ModalContent, ModalFooter } from '../ui2/Modal';
import { Button } from '../ui2/Button';
import { revenueIntelligenceService, CreateCompetitorRequest, Competitor } from '../../api/services/revenue-intelligence.service';

interface AddCompetitorModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: (competitor: Competitor) => void;
}

interface FormData {
  name: string;
  rating: string;
  distance: string;
  url: string;
}

interface FormErrors {
  name?: string;
  rating?: string;
  distance?: string;
  url?: string;
}

export default function AddCompetitorModal({ open, onClose, onSuccess }: AddCompetitorModalProps) {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    rating: '',
    distance: '',
    url: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Hotel name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Hotel name must be at least 2 characters';
    }

    if (formData.rating) {
      const rating = parseFloat(formData.rating);
      if (isNaN(rating) || rating < 0 || rating > 5) {
        newErrors.rating = 'Rating must be between 0 and 5';
      }
    }

    if (formData.url && !isValidUrl(formData.url)) {
      newErrors.url = 'Please enter a valid URL';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidUrl = (string: string): boolean => {
    try {
      new URL(string);
      return true;
    } catch {
      return false;
    }
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
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
      const request: CreateCompetitorRequest = {
        name: formData.name.trim(),
        rating: formData.rating ? parseFloat(formData.rating) : undefined,
        distance: formData.distance.trim() || undefined,
        url: formData.url.trim() || undefined,
      };

      const competitor = await revenueIntelligenceService.addCompetitor(request);
      setSuccess(true);

      // Notify parent component
      onSuccess?.(competitor);

      // Close modal after brief delay to show success message
      setTimeout(() => {
        handleClose();
      }, 1500);
    } catch (err) {
      console.error('Failed to add competitor:', err);
      setApiError('Failed to add competitor. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({ name: '', rating: '', distance: '', url: '' });
    setErrors({});
    setApiError(null);
    setSuccess(false);
    onClose();
  };

  return (
    <Modal open={open} onClose={handleClose} size="md">
      <ModalHeader icon={Building2}>
        <ModalTitle>Add Competitor</ModalTitle>
        <ModalDescription>
          Track a competing hotel to compare rates and market position
        </ModalDescription>
      </ModalHeader>

      <ModalContent className="space-y-5">
        {/* Success Message */}
        {success && (
          <div className="flex items-center gap-3 p-4 bg-sage-50 rounded-xl border border-sage-200">
            <CheckCircle className="w-5 h-5 text-sage-600 flex-shrink-0" />
            <div>
              <p className="font-medium text-sage-900">Competitor Added Successfully</p>
              <p className="text-sm text-sage-700">Rate tracking will begin shortly.</p>
            </div>
          </div>
        )}

        {/* Hotel Name */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">
            Hotel Name <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Building2 className="w-4 h-4 text-neutral-400" />
            </div>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="e.g., Grand Hyatt Mumbai"
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

        {/* Rating */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">
            Star Rating
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Star className="w-4 h-4 text-neutral-400" />
            </div>
            <input
              type="number"
              step="0.1"
              min="0"
              max="5"
              value={formData.rating}
              onChange={(e) => handleInputChange('rating', e.target.value)}
              placeholder="e.g., 4.5"
              className={`w-full pl-10 pr-4 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-terra-500/20 focus:border-terra-500 transition-colors ${
                errors.rating ? 'border-rose-300 bg-rose-50' : 'border-neutral-300 bg-white'
              }`}
              disabled={loading || success}
            />
          </div>
          {errors.rating && (
            <p className="mt-1.5 text-xs text-rose-600 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              {errors.rating}
            </p>
          )}
          <p className="mt-1 text-xs text-neutral-500">Rating between 0 and 5 stars</p>
        </div>

        {/* Distance */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">
            Distance
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MapPin className="w-4 h-4 text-neutral-400" />
            </div>
            <input
              type="text"
              value={formData.distance}
              onChange={(e) => handleInputChange('distance', e.target.value)}
              placeholder="e.g., 0.5 km or 2 miles"
              className={`w-full pl-10 pr-4 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-terra-500/20 focus:border-terra-500 transition-colors ${
                errors.distance ? 'border-rose-300 bg-rose-50' : 'border-neutral-300 bg-white'
              }`}
              disabled={loading || success}
            />
          </div>
          <p className="mt-1 text-xs text-neutral-500">Distance from your property</p>
        </div>

        {/* Website URL */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">
            Website URL
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Globe className="w-4 h-4 text-neutral-400" />
            </div>
            <input
              type="url"
              value={formData.url}
              onChange={(e) => handleInputChange('url', e.target.value)}
              placeholder="https://www.hotel-website.com"
              className={`w-full pl-10 pr-4 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-terra-500/20 focus:border-terra-500 transition-colors ${
                errors.url ? 'border-rose-300 bg-rose-50' : 'border-neutral-300 bg-white'
              }`}
              disabled={loading || success}
            />
          </div>
          {errors.url && (
            <p className="mt-1.5 text-xs text-rose-600 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              {errors.url}
            </p>
          )}
          <p className="mt-1 text-xs text-neutral-500">Used for automated rate scraping (optional)</p>
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
          <p className="text-xs font-medium text-ocean-700 mb-1">What happens next?</p>
          <p className="text-xs text-ocean-600 leading-relaxed">
            Once added, our AI will begin tracking this competitor's rates automatically.
            You'll receive alerts when their pricing changes significantly and see comparisons
            in your rate recommendations.
          </p>
        </div>
      </ModalContent>

      <ModalFooter>
        <Button variant="outline" onClick={handleClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          variant="primary"
          icon={Building2}
          onClick={handleSubmit}
          loading={loading}
          disabled={loading || success || !formData.name.trim()}
        >
          Add Competitor
        </Button>
      </ModalFooter>
    </Modal>
  );
}
