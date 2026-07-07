import { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { X, Save, Tag, Plus, Globe } from 'lucide-react';
import {
  GUEST_TAGS,
  GUEST_STATUS_CONFIG,
  EMOTION_CONFIG,
  calculateLoyaltyTier,
  LOYALTY_TIERS,
} from '@/utils/admin/guests';
import { Button } from '../../ui2/Button';
import { SearchableSelect } from '../../ui2/SearchableSelect';
import { Country } from 'country-state-city';

export default function EditGuestModal({ guest, isOpen, onClose, onSave, isSaving }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    country: '',
    status: 'Active',
    emotion: 'neutral',
    bedType: '',
    floor: '',
    allergies: '',
    tags: [],
    preferences: [],
  });
  const [newTag, setNewTag] = useState('');
  const [showTagDropdown, setShowTagDropdown] = useState(false);
  const [newPreference, setNewPreference] = useState('');

  useEffect(() => {
    if (guest) {
      setFormData({
        name: guest.name || '',
        email: guest.email || '',
        phone: guest.phone || '',
        country: guest.country || 'United States',
        status: guest.status || 'Active',
        emotion: guest.emotion || 'neutral',
        bedType: guest.preferences?.bedType || (Array.isArray(guest.preferences) ? '' : ''),
        floor: guest.preferences?.floor || '',
        allergies: guest.preferences?.allergies || '',
        tags: guest.tags || [],
        preferences: Array.isArray(guest.preferences) ? guest.preferences : [],
      });
    }
  }, [guest]);

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

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen || !guest) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
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
    onSave(guest.id, {
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      country: formData.country,
      status: formData.status,
      emotion: formData.emotion,
      tags: formData.tags,
      preferences: formData.preferences,
      updatedAt: new Date().toISOString(),
    });
  };

  const countryOptions = useMemo(
    () =>
      Country.getAllCountries().map((c) => ({
        label: c.name,
        value: c.name,
      })),
    []
  );

  const filteredTags = GUEST_TAGS.filter(
    (tag) =>
      !formData.tags.includes(tag) &&
      tag.toLowerCase().includes(newTag.toLowerCase())
  );

  const loyaltyTier = guest ? calculateLoyaltyTier(guest.totalStays, guest.totalSpent) : 'Bronze';
  const tierConfig = LOYALTY_TIERS[loyaltyTier];

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
              <Save className="w-5 h-5 text-[#A57865]" />
            </div>
            <div>
              <h2 className="text-xl font-serif font-bold text-neutral-900">Edit Guest</h2>
              <p className="text-sm text-neutral-600">Update guest information</p>
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
          <form id="edit-guest-form" onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Loyalty Tier Badge */}
            <div className="p-4 bg-[#FAF8F6] rounded-xl border border-neutral-200">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-medium text-neutral-500 block">Loyalty Tier</span>
                  <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold mt-1 ${tierConfig.bgColor} ${tierConfig.textColor}`}>
                    {tierConfig.icon} {loyaltyTier}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-xs font-medium text-neutral-500 block">Total Stays</span>
                  <span className="text-lg font-bold text-neutral-900">{guest.totalStays || 0}</span>
                </div>
              </div>
            </div>

            {/* Personal Information */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-neutral-200">
                <div className="w-1 h-5 bg-[#A57865] rounded-full"></div>
                <h3 className="font-bold text-neutral-900">Personal Information</h3>
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
                  required
                  className="w-full px-4 py-3 bg-[#FAF8F6] border border-neutral-200 rounded-xl hover:border-neutral-300 hover:bg-white focus:outline-none focus:ring-2 focus:ring-[#A57865] focus:ring-offset-2 focus:bg-white transition-all duration-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-[#FAF8F6] border border-neutral-200 rounded-xl hover:border-neutral-300 hover:bg-white focus:outline-none focus:ring-2 focus:ring-[#A57865] focus:ring-offset-2 focus:bg-white transition-all duration-200"
                  />
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
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Country
                  </label>
                  <SearchableSelect
                    options={countryOptions}
                    value={formData.country}
                    onChange={(val) =>
                      setFormData((prev) => ({ ...prev, country: val }))
                    }
                    placeholder="Select country"
                    icon={Globe}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Status
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-[#FAF8F6] border border-neutral-200 rounded-xl hover:border-neutral-300 hover:bg-white focus:outline-none focus:ring-2 focus:ring-[#A57865] focus:ring-offset-2 focus:bg-white transition-all duration-200 cursor-pointer"
                  >
                    {Object.keys(GUEST_STATUS_CONFIG).map((status) => (
                      <option key={status} value={status}>
                        {GUEST_STATUS_CONFIG[status].label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Satisfaction
                </label>
                <div className="flex gap-2">
                  {Object.keys(EMOTION_CONFIG).map((emotion) => (
                    <button
                      key={emotion}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, emotion }))}
                      className={`flex-1 py-3 px-4 rounded-xl border-2 transition-all duration-200 ${
                        formData.emotion === emotion
                          ? 'border-[#A57865] bg-[#A57865]/5'
                          : 'border-neutral-200 hover:border-neutral-300'
                      }`}
                    >
                      <span className="text-2xl">{EMOTION_CONFIG[emotion].emoji}</span>
                      <span className="block text-xs mt-1 text-neutral-600">
                        {EMOTION_CONFIG[emotion].label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Tags Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-neutral-200">
                <div className="w-1 h-5 bg-[#5C9BA4] rounded-full"></div>
                <h3 className="font-bold text-neutral-900">Tags</h3>
              </div>

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

        {/* Actions Footer */}
        <div className="flex-shrink-0 bg-white border-t border-neutral-200 px-6 py-4 shadow-lg">
          <div className="flex items-center gap-3">
            <Button variant="ghost" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button variant="primary" type="submit" form="edit-guest-form" disabled={isSaving} icon={Save} loading={isSaving} className="flex-1">
              {isSaving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>
      </div>
    </>
  );

  return createPortal(modalContent, document.body);
}
