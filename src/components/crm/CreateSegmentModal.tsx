import { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { X, Users, Filter, Eye, Plus, Tag } from 'lucide-react';
import {
  BOOKING_SOURCES,
  ROOM_TYPES,
  DEFAULT_LOYALTY_TIERS,
  filterGuestsBySegment,
  calculateAverageLTV,
  calculateRepeatRate,
  generateId
} from '../../utils/crm';
import CustomDropdown from '../ui/CustomDropdown';

const SEGMENT_COLORS = [
  '#A57865', '#4E5840', '#5C9BA4', '#CDB261', '#8E6554',
  '#003580', '#00355F', '#5542F6', '#FF5A5F', '#6B7280'
];

const COMMON_TAGS = [
  'vip', 'corporate', 'leisure', 'family', 'honeymoon',
  'long-stay', 'frequent', 'first-time', 'anniversary', 'luxury'
];

export default function CreateSegmentModal({ isOpen, onClose, onSave, guests, loyaltyTiers }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: SEGMENT_COLORS[0],
    filters: {
      loyaltyTier: 'all',
      minStays: '',
      maxStays: '',
      bookingSource: 'all',
      minSpend: '',
      maxSpend: '',
      lastStayDays: '',
      country: '',
      roomType: 'all',
      tags: []
    }
  });

  const [tagInput, setTagInput] = useState('');

  const tiers = loyaltyTiers || DEFAULT_LOYALTY_TIERS;

  // ESC key handler and body scroll lock
  useEffect(() => {
    if (!isOpen) return;

    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };

    document.addEventListener('keydown', handleEsc);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  // Preview matching guests
  const previewGuests = useMemo(() => {
    const cleanFilters = {};
    Object.entries(formData.filters).forEach(([key, value]) => {
      if (value && value !== 'all' && (Array.isArray(value) ? value.length > 0 : true)) {
        cleanFilters[key] = value;
      }
    });
    return filterGuestsBySegment(guests || [], cleanFilters);
  }, [guests, formData.filters]);

  const previewStats = useMemo(() => {
    return {
      count: previewGuests.length,
      avgRevenue: calculateAverageLTV(previewGuests),
      repeatRate: calculateRepeatRate(previewGuests)
    };
  }, [previewGuests]);

  useEffect(() => {
    if (!isOpen) {
      setFormData({
        name: '',
        description: '',
        color: SEGMENT_COLORS[0],
        filters: {
          loyaltyTier: 'all',
          minStays: '',
          maxStays: '',
          bookingSource: 'all',
          minSpend: '',
          maxSpend: '',
          lastStayDays: '',
          country: '',
          roomType: 'all',
          tags: []
        }
      });
      setTagInput('');
    }
  }, [isOpen]);

  const handleFilterChange = (key, value) => {
    setFormData(prev => ({
      ...prev,
      filters: {
        ...prev.filters,
        [key]: value
      }
    }));
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.filters.tags.includes(tagInput.trim())) {
      handleFilterChange('tags', [...formData.filters.tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tag) => {
    handleFilterChange('tags', formData.filters.tags.filter(t => t !== tag));
  };

  const handleSubmit = () => {
    if (!formData.name.trim()) return;

    const cleanFilters = {};
    Object.entries(formData.filters).forEach(([key, value]) => {
      if (value && value !== 'all' && (Array.isArray(value) ? value.length > 0 : true)) {
        cleanFilters[key] = value;
      }
    });

    const newSegment = {
      id: generateId(),
      name: formData.name.trim(),
      description: formData.description.trim(),
      color: formData.color,
      filters: cleanFilters,
      guestCount: previewStats.count,
      avgRevenue: previewStats.avgRevenue,
      repeatRate: previewStats.repeatRate,
      createdAt: new Date().toISOString()
    };

    onSave(newSegment);
    onClose();
  };

  // Dropdown options
  const tierOptions = [
    { value: 'all', label: 'All Tiers' },
    ...tiers.map(tier => ({ value: tier.id, label: tier.name }))
  ];

  const bookingSourceOptions = [
    { value: 'all', label: 'All Sources' },
    ...BOOKING_SOURCES.map(source => ({ value: source.id, label: source.name }))
  ];

  const roomTypeOptions = [
    { value: 'all', label: 'All Room Types' },
    ...ROOM_TYPES.map(room => ({ value: room.id, label: room.name }))
  ];

  if (!isOpen) return null;

  const modalContent = (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Right Side Drawer */}
      <div
        className="fixed right-0 top-0 bottom-0 w-full sm:max-w-xl flex flex-col bg-white border-l border-neutral-200 shadow-2xl h-screen"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative px-4 sm:px-6 py-4 sm:py-5 pr-12 sm:pr-14 border-b border-neutral-100 bg-white flex-shrink-0 z-10">
          <div className="flex-1 min-w-0">
            <h2 className="text-base sm:text-lg font-semibold text-neutral-900 tracking-tight">Create Segment</h2>
            <p className="text-[10px] sm:text-[11px] text-neutral-400 font-medium mt-0.5 sm:mt-1">Define filters to group guests</p>
          </div>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 sm:top-5 sm:right-5 p-2 hover:bg-neutral-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-neutral-400" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 sm:py-6 bg-white">
          <div className="space-y-4 sm:space-y-5">
            {/* Basic Info */}
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-semibold text-neutral-400 uppercase tracking-widest mb-2 block">
                  Segment Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., High Value Guests"
                  className="w-full px-4 py-2.5 bg-white border border-neutral-200 rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-terra-500/20 focus:border-terra-500"
                />
              </div>

              <div>
                <label className="text-[10px] font-semibold text-neutral-400 uppercase tracking-widest mb-2 block">
                  Description
                </label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Brief description of this segment"
                  className="w-full px-4 py-2.5 bg-white border border-neutral-200 rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-terra-500/20 focus:border-terra-500"
                />
              </div>

              <div>
                <label className="text-[10px] font-semibold text-neutral-400 uppercase tracking-widest mb-2 block">
                  Segment Color
                </label>
                <div className="flex flex-wrap gap-2">
                  {SEGMENT_COLORS.map((color) => (
                    <button
                      key={color}
                      onClick={() => setFormData(prev => ({ ...prev, color }))}
                      className={`w-8 h-8 rounded-lg transition-transform ${
                        formData.color === color ? 'ring-2 ring-offset-2 ring-terra-500 scale-110' : ''
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Filters */}
            <div>
              <p className="text-[10px] font-semibold text-neutral-400 uppercase tracking-widest mb-3">
                Segment Filters
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                {/* Loyalty Tier */}
                <CustomDropdown
                  label="Loyalty Tier"
                  options={tierOptions}
                  value={formData.filters.loyaltyTier}
                  onChange={(value) => handleFilterChange('loyaltyTier', value)}
                />

                {/* Booking Source */}
                <CustomDropdown
                  label="Booking Source"
                  options={bookingSourceOptions}
                  value={formData.filters.bookingSource}
                  onChange={(value) => handleFilterChange('bookingSource', value)}
                />

                {/* Min Stays */}
                <div>
                  <label className="block text-[10px] font-semibold text-neutral-400 uppercase tracking-widest mb-2">
                    Minimum Stays
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.filters.minStays}
                    onChange={(e) => handleFilterChange('minStays', e.target.value)}
                    placeholder="e.g., 3"
                    className="w-full px-4 py-2.5 bg-white border border-neutral-200 rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-terra-500/20 focus:border-terra-500"
                  />
                </div>

                {/* Max Stays */}
                <div>
                  <label className="block text-[10px] font-semibold text-neutral-400 uppercase tracking-widest mb-2">
                    Maximum Stays
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.filters.maxStays}
                    onChange={(e) => handleFilterChange('maxStays', e.target.value)}
                    placeholder="e.g., 10"
                    className="w-full px-4 py-2.5 bg-white border border-neutral-200 rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-terra-500/20 focus:border-terra-500"
                  />
                </div>

                {/* Min Spend */}
                <div>
                  <label className="block text-[10px] font-semibold text-neutral-400 uppercase tracking-widest mb-2">
                    Minimum Spend (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.filters.minSpend}
                    onChange={(e) => handleFilterChange('minSpend', e.target.value)}
                    placeholder="e.g., 5000"
                    className="w-full px-4 py-2.5 bg-white border border-neutral-200 rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-terra-500/20 focus:border-terra-500"
                  />
                </div>

                {/* Max Spend */}
                <div>
                  <label className="block text-[10px] font-semibold text-neutral-400 uppercase tracking-widest mb-2">
                    Maximum Spend (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.filters.maxSpend}
                    onChange={(e) => handleFilterChange('maxSpend', e.target.value)}
                    placeholder="e.g., 20000"
                    className="w-full px-4 py-2.5 bg-white border border-neutral-200 rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-terra-500/20 focus:border-terra-500"
                  />
                </div>

                {/* Last Stay Days */}
                <div>
                  <label className="block text-[10px] font-semibold text-neutral-400 uppercase tracking-widest mb-2">
                    Last Stay Within (Days)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.filters.lastStayDays}
                    onChange={(e) => handleFilterChange('lastStayDays', e.target.value)}
                    placeholder="e.g., 30"
                    className="w-full px-4 py-2.5 bg-white border border-neutral-200 rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-terra-500/20 focus:border-terra-500"
                  />
                </div>

                {/* Country */}
                <div>
                  <label className="block text-[10px] font-semibold text-neutral-400 uppercase tracking-widest mb-2">
                    Country
                  </label>
                  <input
                    type="text"
                    value={formData.filters.country}
                    onChange={(e) => handleFilterChange('country', e.target.value)}
                    placeholder="e.g., United States"
                    className="w-full px-4 py-2.5 bg-white border border-neutral-200 rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-terra-500/20 focus:border-terra-500"
                  />
                </div>

                {/* Room Type */}
                <div className="sm:col-span-2">
                  <CustomDropdown
                    label="Room Type Preference"
                    options={roomTypeOptions}
                    value={formData.filters.roomType}
                    onChange={(value) => handleFilterChange('roomType', value)}
                  />
                </div>

                {/* Tags */}
                <div className="sm:col-span-2">
                  <label className="block text-[10px] font-semibold text-neutral-400 uppercase tracking-widest mb-2">
                    Guest Tags
                  </label>
                  <div className="flex items-center gap-2 mb-2">
                    <input
                      type="text"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                      placeholder="Add a tag..."
                      className="flex-1 px-4 py-2.5 bg-white border border-neutral-200 rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-terra-500/20 focus:border-terra-500"
                    />
                    <button
                      onClick={handleAddTag}
                      className="p-2.5 bg-terra-500 text-white rounded-lg hover:bg-terra-600 transition-colors flex-shrink-0"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Common Tags */}
                  <div className="flex flex-wrap gap-1 mb-2">
                    {COMMON_TAGS.filter(t => !formData.filters.tags.includes(t)).slice(0, 6).map(tag => (
                      <button
                        key={tag}
                        onClick={() => handleFilterChange('tags', [...formData.filters.tags, tag])}
                        className="px-2 py-1 text-[11px] bg-neutral-100 text-neutral-600 rounded-lg hover:bg-neutral-200 transition-colors"
                      >
                        + {tag}
                      </button>
                    ))}
                  </div>

                  {/* Selected Tags */}
                  {formData.filters.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {formData.filters.tags.map(tag => (
                        <span
                          key={tag}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium bg-terra-50 text-terra-700"
                        >
                          <Tag className="w-3 h-3" />
                          {tag}
                          <button
                            onClick={() => handleRemoveTag(tag)}
                            className="ml-1 hover:text-rose-500"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Preview */}
            <div className="bg-neutral-50 rounded-[10px] p-3 sm:p-4">
              <p className="text-[10px] font-semibold text-neutral-400 uppercase tracking-widest mb-2 sm:mb-3">
                Segment Preview
              </p>
              <div className="grid grid-cols-3 gap-2 sm:gap-4">
                <div className="text-center">
                  <p className="text-lg sm:text-2xl font-bold text-terra-600">{previewStats.count}</p>
                  <p className="text-[10px] sm:text-[11px] text-neutral-500">Matching</p>
                </div>
                <div className="text-center">
                  <p className="text-lg sm:text-2xl font-bold text-sage-700">₹{previewStats.avgRevenue.toLocaleString()}</p>
                  <p className="text-[10px] sm:text-[11px] text-neutral-500">Avg Rev</p>
                </div>
                <div className="text-center">
                  <p className="text-lg sm:text-2xl font-bold text-ocean-600">{previewStats.repeatRate}%</p>
                  <p className="text-[10px] sm:text-[11px] text-neutral-500">Repeat</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 border-t border-neutral-100 px-4 sm:px-6 py-4 sm:py-5 bg-neutral-50/50">
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2.5 border border-neutral-200 text-neutral-600 rounded-lg text-[12px] sm:text-[13px] font-medium hover:bg-neutral-50 hover:border-neutral-300 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={!formData.name.trim()}
              className={`flex-1 px-4 py-2.5 rounded-lg text-[12px] sm:text-[13px] font-semibold transition-colors ${
                formData.name.trim()
                  ? 'bg-sage-600 text-white hover:bg-sage-700'
                  : 'bg-neutral-200 text-neutral-400 cursor-not-allowed'
              }`}
            >
              Create Segment
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
