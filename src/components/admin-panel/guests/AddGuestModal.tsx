import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, UserPlus, Plus, Tag } from 'lucide-react';
import {
  COUNTRIES,
  GUEST_TAGS,
  GUEST_STATUS_CONFIG,
  validateGuest,
  generateGuestId,
} from '@/utils/admin/guests';
import { SimpleDropdown } from '@/components/ui/Select';
import { Button } from '../../ui2/Button';

export default function AddGuestModal({ isOpen, onClose, onSubmit, isAdding }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    country: 'United States',
    status: 'Active',
    tags: [],
    preferences: [],
  });

  const [errors, setErrors] = useState({});
  const [newTag, setNewTag] = useState('');
  const [showTagDropdown, setShowTagDropdown] = useState(false);
  const [newPreference, setNewPreference] = useState('');

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setFormData({
        name: '',
        email: '',
        phone: '',
        country: 'United States',
        status: 'Active',
        tags: [],
        preferences: [],
      });
      setErrors({});
      setNewTag('');
      setNewPreference('');
    }
  }, [isOpen]);

  // Handle ESC key
  useEffect(() => {
    if (!isOpen) return;
    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Close tag dropdown when clicking outside
  useEffect(() => {
    if (!showTagDropdown) return;
    const handleClickOutside = (e) => {
      if (!e.target.closest('.tag-dropdown-container')) {
        setShowTagDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showTagDropdown]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  // Get form values directly from DOM inputs as fallback for testing tools
  const getFormValues = () => {
    const form = document.getElementById('guest-form') as HTMLFormElement;
    if (!form) return formData;

    const nameInput = form.querySelector('input[name="name"]') as HTMLInputElement;
    const emailInput = form.querySelector('input[name="email"]') as HTMLInputElement;
    const phoneInput = form.querySelector('input[name="phone"]') as HTMLInputElement;

    return {
      ...formData,
      name: nameInput?.value || formData.name,
      email: emailInput?.value || formData.email,
      phone: phoneInput?.value || formData.phone,
    };
  };

  const handleAddTag = (tag) => {
    if (!formData.tags.includes(tag)) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, tag],
      }));
    }
    setNewTag('');
    setShowTagDropdown(false);
  };

  const handleRemoveTag = (tagToRemove) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
  };

  const handleAddPreference = () => {
    if (newPreference.trim() && !formData.preferences.includes(newPreference.trim())) {
      setFormData((prev) => ({
        ...prev,
        preferences: [...prev.preferences, newPreference.trim()],
      }));
      setNewPreference('');
    }
  };

  const handleRemovePreference = (prefToRemove) => {
    setFormData((prev) => ({
      ...prev,
      preferences: prev.preferences.filter((pref) => pref !== prefToRemove),
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Get values from DOM as fallback (for testing tools like Playwright)
    const currentFormData = getFormValues();

    const { isValid, errors: validationErrors } = validateGuest(currentFormData);

    if (!isValid) {
      setErrors(validationErrors);
      return;
    }

    // Parse name into first and last name for API
    const nameParts = currentFormData.name.trim().split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';

    // Create guest object with both name formats for compatibility
    const newGuest = {
      id: generateGuestId(),
      name: currentFormData.name,
      firstName: firstName,
      lastName: lastName,
      email: currentFormData.email,
      phone: currentFormData.phone || '',
      country: currentFormData.country,
      status: currentFormData.status,
      emotion: 'neutral',
      totalStays: 0,
      totalSpent: 0,
      lastStay: null,
      tags: currentFormData.tags,
      preferences: currentFormData.preferences,
      notes: [],
      history: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    onSubmit(newGuest);
  };

  const filteredTags = GUEST_TAGS.filter(
    (tag) =>
      !formData.tags.includes(tag) &&
      tag.toLowerCase().includes(newTag.toLowerCase())
  );

  if (!isOpen) return null;

  const modalContent = (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-neutral-900/50 backdrop-blur-sm z-[60]"
        onClick={onClose}
      />

      {/* Side Drawer */}
      <div
        className={`fixed top-0 bottom-0 right-0 h-screen w-full max-w-[650px] bg-white shadow-xl border-l border-neutral-200 z-[70] transform transition-transform duration-300 ease-out flex flex-col ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex-shrink-0 bg-white border-b border-neutral-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#A57865]/10 rounded-full flex items-center justify-center">
              <UserPlus className="w-5 h-5 text-[#A57865]" />
            </div>
            <div>
              <h2 className="text-xl font-serif font-bold text-neutral-900">
                Add New Guest
              </h2>
              <p className="text-sm text-neutral-600">
                Create a new guest profile
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-neutral-100 rounded-lg transition-all duration-200 hover:scale-110 active:scale-95 focus:outline-none focus:ring-2 focus:ring-[#A57865]"
          >
            <X className="w-5 h-5 text-neutral-600 hover:text-neutral-900 transition-colors" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar min-h-0">
          <form id="guest-form" onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Guest Information */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-neutral-200">
                <div className="w-1 h-5 bg-[#A57865] rounded-full"></div>
                <h3 className="font-bold text-neutral-900">Guest Information</h3>
              </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Full Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`w-full px-4 py-3 bg-[#FAF8F6] border ${
                  errors.name ? 'border-red-300 focus:ring-red-500' : 'border-neutral-200'
                } rounded-xl hover:border-neutral-300 hover:bg-white focus:outline-none focus:ring-2 focus:ring-[#A57865] focus:ring-offset-2 focus:bg-white transition-all duration-200`}
                placeholder="John Doe"
              />
              {errors.name && (
                <p className="mt-1.5 text-xs text-red-600 font-medium">{errors.name}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 bg-[#FAF8F6] border ${
                    errors.email ? 'border-red-300 focus:ring-red-500' : 'border-neutral-200'
                  } rounded-xl hover:border-neutral-300 hover:bg-white focus:outline-none focus:ring-2 focus:ring-[#A57865] focus:ring-offset-2 focus:bg-white transition-all duration-200`}
                  placeholder="john@example.com"
                />
                {errors.email && (
                  <p className="mt-1.5 text-xs text-red-600 font-medium">{errors.email}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Phone
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-[#FAF8F6] border border-neutral-200 rounded-xl hover:border-neutral-300 hover:bg-white focus:outline-none focus:ring-2 focus:ring-[#A57865] focus:ring-offset-2 focus:bg-white transition-all duration-200"
                  placeholder="+1 (555) 123-4567"
                />
              </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Country
                  </label>
                  <SimpleDropdown
                    value={formData.country}
                    onChange={(value) => setFormData((prev) => ({ ...prev, country: value }))}
                    options={COUNTRIES.map((country) => ({
                      value: country,
                      label: country
                    }))}
                    placeholder="Select Country"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Status
                  </label>
                  <SimpleDropdown
                    value={formData.status}
                    onChange={(value) => setFormData((prev) => ({ ...prev, status: value }))}
                    options={Object.keys(GUEST_STATUS_CONFIG).map((status) => ({
                      value: status,
                      label: GUEST_STATUS_CONFIG[status].label
                    }))}
                    placeholder="Select Status"
                  />
                </div>
              </div>
            </div>

            {/* Tags Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-neutral-200">
                <div className="w-1 h-5 bg-[#5C9BA4] rounded-full"></div>
                <h3 className="font-bold text-neutral-900">Tags</h3>
              </div>

              {/* Selected Tags */}
              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#5C9BA4]/10 text-[#5C9BA4] rounded-full text-sm font-medium"
                    >
                      <Tag className="w-3 h-3" />
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="ml-1 hover:bg-[#5C9BA4]/20 rounded-full p-0.5"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}

              {/* Add Tag */}
              <div className="relative tag-dropdown-container">
                <input
                  type="text"
                  value={newTag}
                  onChange={(e) => {
                    setNewTag(e.target.value);
                    setShowTagDropdown(true);
                  }}
                  onFocus={() => setShowTagDropdown(true)}
                  placeholder="Search or add tags..."
                  className="w-full px-4 py-3 bg-[#FAF8F6] border border-neutral-200 rounded-xl hover:border-neutral-300 hover:bg-white focus:outline-none focus:ring-2 focus:ring-[#5C9BA4] focus:ring-offset-2 focus:bg-white transition-all duration-200"
                />
                {showTagDropdown && filteredTags.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-neutral-200 rounded-xl shadow-lg max-h-48 overflow-y-auto z-10">
                    {filteredTags.slice(0, 8).map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => handleAddTag(tag)}
                        className="w-full px-4 py-2 text-left text-sm hover:bg-[#5C9BA4]/10 transition-colors first:rounded-t-xl last:rounded-b-xl"
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Preferences Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-neutral-200">
                <div className="w-1 h-5 bg-[#CDB261] rounded-full"></div>
                <h3 className="font-bold text-neutral-900">Preferences</h3>
              </div>

              {/* Selected Preferences */}
              {formData.preferences.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.preferences.map((pref) => (
                    <span
                      key={pref}
                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#CDB261]/10 text-[#CDB261] rounded-full text-sm font-medium"
                    >
                      {pref}
                      <button
                        type="button"
                        onClick={() => handleRemovePreference(pref)}
                        className="ml-1 hover:bg-[#CDB261]/20 rounded-full p-0.5"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}

              {/* Add Preference */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newPreference}
                  onChange={(e) => setNewPreference(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddPreference();
                    }
                  }}
                  placeholder="Add a preference (e.g., Ocean View, King Bed)..."
                  className="flex-1 px-4 py-3 bg-[#FAF8F6] border border-neutral-200 rounded-xl hover:border-neutral-300 hover:bg-white focus:outline-none focus:ring-2 focus:ring-[#CDB261] focus:ring-offset-2 focus:bg-white transition-all duration-200"
                />
                <button
                  type="button"
                  onClick={handleAddPreference}
                  disabled={!newPreference.trim()}
                  className="px-4 py-3 bg-[#CDB261]/10 hover:bg-[#CDB261]/20 text-[#CDB261] disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-all duration-200"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Actions Footer - Sticky */}
        <div className="flex-shrink-0 bg-white border-t border-neutral-200 px-6 py-4 shadow-lg">
          <div className="flex items-center gap-3">
            <Button variant="ghost" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button variant="primary" type="submit" form="guest-form" disabled={isAdding} icon={UserPlus} loading={isAdding} className="flex-1">
              {isAdding ? 'Adding...' : 'Add Guest'}
            </Button>
          </div>
        </div>
      </div>
    </>
  );

  return createPortal(modalContent, document.body);
}
