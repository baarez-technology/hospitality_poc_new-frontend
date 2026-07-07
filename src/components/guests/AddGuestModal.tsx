/**
 * AddGuestModal Component
 * Add new guest form - Glimmora Design System v5.0
 * Side drawer following CMS pattern
 */

import { useState, useEffect, useMemo } from 'react';
import { X, Plus, Tag } from 'lucide-react';
import {
  GUEST_TAGS,
  GUEST_STATUS_CONFIG,
  validateGuest,
  generateGuestId,
} from '../../utils/guests';
import { Drawer } from '../ui2/Drawer';
import { Button } from '../ui2/Button';
import { SearchableSelect } from '../ui2/SearchableSelect';
import { useGeoAddress } from '@/hooks/useGeoAddress';

// Custom Select Component matching CMS pattern
function CustomSelect({ value, onChange, options, placeholder = 'Select...' }) {
  const [isOpen, setIsOpen] = useState(false);

  const selectedOption = options.find(opt => opt.value === value);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full h-9 px-3.5 rounded-lg text-[13px] bg-white border transition-all duration-150 text-left flex items-center justify-between focus:outline-none ${
          isOpen
            ? 'border-terra-400 ring-2 ring-terra-500/10'
            : 'border-neutral-200 hover:border-neutral-300'
        }`}
      >
        <span className={selectedOption ? 'text-neutral-900' : 'text-neutral-400'}>
          {selectedOption?.label || placeholder}
        </span>
        <svg className={`w-4 h-4 text-neutral-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-[80]" onClick={() => setIsOpen(false)} />
          <div className="absolute z-[90] w-full mt-1 bg-white rounded-lg border border-neutral-200 shadow-lg overflow-hidden max-h-60 overflow-y-auto">
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                className={`w-full px-3.5 py-2.5 text-[13px] text-left hover:bg-neutral-50 transition-colors ${
                  value === option.value ? 'bg-terra-50 text-terra-700' : 'text-neutral-700'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default function AddGuestModal({ isOpen, onClose, onSubmit, isAdding }) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    country: '',
    state: '',
    city: '',
    address: '',
    postalCode: '',
    status: 'Active',
    tags: [],
    preferences: [],
  });

  const [errors, setErrors] = useState({});
  const [newTag, setNewTag] = useState('');
  const [showTagDropdown, setShowTagDropdown] = useState(false);
  const [newPreference, setNewPreference] = useState('');

  // Cascading country/state/city dropdowns
  const { countries, states, cities, hasStates, hasCities, getCountryName, getStateName } = useGeoAddress({
    countryCode: formData.country,
    stateCode: formData.state,
    cityName: formData.city,
    onStateReset: () => setFormData(prev => ({ ...prev, state: '', city: '' })),
    onCityReset: () => setFormData(prev => ({ ...prev, city: '' })),
  });

  const countryOptions = useMemo(
    () => countries.map((c) => ({ value: c.isoCode, label: c.name })),
    [countries]
  );

  const stateOptions = useMemo(
    () => states.map((s) => ({ value: s.isoCode, label: s.name })),
    [states]
  );

  const cityOptions = useMemo(
    () => cities.map((c) => ({ value: c.name, label: c.name })),
    [cities]
  );

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        country: '',
        state: '',
        city: '',
        address: '',
        postalCode: '',
        status: 'Active',
        tags: [],
        preferences: [],
      });
      setErrors({});
      setNewTag('');
      setNewPreference('');
    }
  }, [isOpen]);

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
    e?.preventDefault();

    // Simple validation
    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      setErrors({ firstName: 'First name is required', lastName: 'Last name is required' });
      return;
    }

    if (!formData.email.trim()) {
      setErrors({ email: 'Email is required' });
      return;
    }

    // Create guest object with firstName/lastName
    const newGuest = {
      firstName: formData.firstName.trim(),
      lastName: formData.lastName.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim() || '',
      country: formData.country ? getCountryName(formData.country) : '',
      state: formData.state ? getStateName(formData.country, formData.state) : formData.state,
      city: formData.city,
      address: formData.address,
      postalCode: formData.postalCode,
      status: formData.status,
      tags: formData.tags,
      preferences: formData.preferences,
    };
    onSubmit(newGuest);
  };

  const filteredTags = GUEST_TAGS.filter(
    (tag) =>
      !formData.tags.includes(tag) &&
      tag.toLowerCase().includes(newTag.toLowerCase())
  );

  const isFormValid = formData.firstName.trim() && formData.lastName.trim() && formData.email.trim();

  // Options for dropdowns
  const statusOptions = Object.keys(GUEST_STATUS_CONFIG).map(status => ({
    value: status,
    label: GUEST_STATUS_CONFIG[status].label
  }));

  const drawerFooter = (
    <div className="flex items-center justify-end gap-3 w-full">
      <Button variant="outline" onClick={onClose}>
        Cancel
      </Button>
      <Button
        variant="primary"
        onClick={handleSubmit}
        disabled={!isFormValid}
        loading={isAdding}
      >
        Add Guest
      </Button>
    </div>
  );

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title="Add New Guest"
      subtitle="Create a new guest profile"
      maxWidth="max-w-2xl"
      footer={drawerFooter}
    >
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Guest Information */}
        <section>
          <h3 className="text-[11px] font-semibold uppercase tracking-widest text-neutral-400 mb-4">
            Guest Information
          </h3>
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-[13px] font-medium text-neutral-700">
                  First Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  placeholder="John"
                  className={`w-full h-9 px-3.5 rounded-lg text-[13px] bg-white border transition-all duration-150 focus:outline-none ${
                    errors.firstName
                      ? 'border-rose-300 focus:border-rose-400 focus:ring-2 focus:ring-rose-500/10'
                      : 'border-neutral-200 hover:border-neutral-300 focus:border-terra-400 focus:ring-2 focus:ring-terra-500/10'
                  }`}
                />
                {errors.firstName && (
                  <p className="text-[11px] text-rose-600">{errors.firstName}</p>
                )}
              </div>
              <div className="space-y-2">
                <label className="block text-[13px] font-medium text-neutral-700">
                  Last Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  placeholder="Doe"
                  className={`w-full h-9 px-3.5 rounded-lg text-[13px] bg-white border transition-all duration-150 focus:outline-none ${
                    errors.lastName
                      ? 'border-rose-300 focus:border-rose-400 focus:ring-2 focus:ring-rose-500/10'
                      : 'border-neutral-200 hover:border-neutral-300 focus:border-terra-400 focus:ring-2 focus:ring-terra-500/10'
                  }`}
                />
                {errors.lastName && (
                  <p className="text-[11px] text-rose-600">{errors.lastName}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-[13px] font-medium text-neutral-700">
                  Email <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="john@example.com"
                  className={`w-full h-9 px-3.5 rounded-lg text-[13px] bg-white border transition-all duration-150 focus:outline-none ${
                    errors.email
                      ? 'border-rose-300 focus:border-rose-400 focus:ring-2 focus:ring-rose-500/10'
                      : 'border-neutral-200 hover:border-neutral-300 focus:border-terra-400 focus:ring-2 focus:ring-terra-500/10'
                  }`}
                />
                {errors.email && (
                  <p className="text-[11px] text-rose-600">{errors.email}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="block text-[13px] font-medium text-neutral-700">
                  Phone
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+1 (555) 123-4567"
                  className="w-full h-9 px-3.5 rounded-lg text-[13px] bg-white border border-neutral-200 hover:border-neutral-300 focus:border-terra-400 focus:ring-2 focus:ring-terra-500/10 focus:outline-none transition-all duration-150"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-[13px] font-medium text-neutral-700">
                  Country
                </label>
                <SearchableSelect
                  options={countryOptions}
                  value={formData.country}
                  onChange={(value) => setFormData(prev => ({ ...prev, country: value }))}
                  placeholder="Select Country"
                  searchable
                />
              </div>

              <div className="space-y-2">
                <label className="block text-[13px] font-medium text-neutral-700">
                  State
                </label>
                {hasStates ? (
                  <SearchableSelect
                    options={stateOptions}
                    value={formData.state}
                    onChange={(value) => setFormData(prev => ({ ...prev, state: value }))}
                    placeholder="Select State"
                    disabled={!formData.country}
                    searchable
                  />
                ) : (
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    placeholder={formData.country ? 'Enter state or province' : 'Select country first'}
                    disabled={!formData.country}
                    className="w-full h-9 px-3.5 rounded-lg text-[13px] bg-white border border-neutral-200 hover:border-neutral-300 focus:border-terra-400 focus:ring-2 focus:ring-terra-500/10 focus:outline-none transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-[13px] font-medium text-neutral-700">
                  City
                </label>
                {hasCities ? (
                  <SearchableSelect
                    options={cityOptions}
                    value={formData.city}
                    onChange={(value) => setFormData(prev => ({ ...prev, city: value }))}
                    placeholder="Select City"
                    disabled={!formData.state}
                    searchable
                  />
                ) : (
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    placeholder={formData.state || !hasStates ? 'Enter city' : 'Select state first'}
                    disabled={!formData.country}
                    className="w-full h-9 px-3.5 rounded-lg text-[13px] bg-white border border-neutral-200 hover:border-neutral-300 focus:border-terra-400 focus:ring-2 focus:ring-terra-500/10 focus:outline-none transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                )}
              </div>

              <div className="space-y-2">
                <label className="block text-[13px] font-medium text-neutral-700">
                  Status
                </label>
                <CustomSelect
                  value={formData.status}
                  onChange={(value) => setFormData(prev => ({ ...prev, status: value }))}
                  options={statusOptions}
                  placeholder="Select status"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-[13px] font-medium text-neutral-700">
                  Address
                </label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Street address"
                  className="w-full h-9 px-3.5 rounded-lg text-[13px] bg-white border border-neutral-200 hover:border-neutral-300 focus:border-terra-400 focus:ring-2 focus:ring-terra-500/10 focus:outline-none transition-all duration-150"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-[13px] font-medium text-neutral-700">
                  Postal Code
                </label>
                <input
                  type="text"
                  name="postalCode"
                  value={formData.postalCode}
                  onChange={handleChange}
                  placeholder="Postal / ZIP code"
                  className="w-full h-9 px-3.5 rounded-lg text-[13px] bg-white border border-neutral-200 hover:border-neutral-300 focus:border-terra-400 focus:ring-2 focus:ring-terra-500/10 focus:outline-none transition-all duration-150"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Tags Section */}
        <section>
          <h3 className="text-[11px] font-semibold uppercase tracking-widest text-neutral-400 mb-4">
            Tags
          </h3>
          <div className="space-y-3">
            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-sage-100 text-sage-700 rounded-full text-[13px] font-medium"
                  >
                    <Tag className="w-3 h-3" />
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="ml-0.5 hover:bg-sage-200 rounded-full p-0.5 transition-colors"
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
                className="w-full h-9 px-3.5 rounded-lg text-[13px] bg-white border border-neutral-200 hover:border-neutral-300 focus:border-terra-400 focus:ring-2 focus:ring-terra-500/10 focus:outline-none transition-all duration-150"
              />
              {showTagDropdown && filteredTags.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-neutral-200 rounded-lg shadow-lg max-h-48 overflow-y-auto z-10">
                  {filteredTags.slice(0, 8).map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => handleAddTag(tag)}
                      className="w-full px-3.5 py-2.5 text-left text-[13px] hover:bg-neutral-50 transition-colors"
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Preferences Section */}
        <section>
          <h3 className="text-[11px] font-semibold uppercase tracking-widest text-neutral-400 mb-4">
            Preferences
          </h3>
          <div className="space-y-3">
            {formData.preferences.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.preferences.map((pref) => (
                  <span
                    key={pref}
                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-amber-100 text-amber-700 rounded-full text-[13px] font-medium"
                  >
                    {pref}
                    <button
                      type="button"
                      onClick={() => handleRemovePreference(pref)}
                      className="ml-0.5 hover:bg-amber-200 rounded-full p-0.5 transition-colors"
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
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddPreference();
                  }
                }}
                placeholder="Add a preference (e.g., Ocean View, King Bed)..."
                className="flex-1 h-9 px-3.5 rounded-lg text-[13px] bg-white border border-neutral-200 hover:border-neutral-300 focus:border-terra-400 focus:ring-2 focus:ring-terra-500/10 focus:outline-none transition-all duration-150"
              />
              <button
                type="button"
                onClick={handleAddPreference}
                disabled={!newPreference.trim()}
                className="h-9 px-3 bg-neutral-100 hover:bg-neutral-200 text-neutral-600 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>
        </section>
      </form>
    </Drawer>
  );
}
