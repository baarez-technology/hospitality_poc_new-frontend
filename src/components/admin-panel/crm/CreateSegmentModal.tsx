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
} from '@/utils/admin/crm';
import { Button } from '../../ui2/Button';

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

  if (!isOpen) return null;

  const modalContent = (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[calc(100vh-2rem)] sm:max-h-[90vh] overflow-hidden animate-scale-in flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-neutral-200 bg-[#FAF7F4] flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#A57865]/10 flex items-center justify-center">
              <Users className="w-5 h-5 text-[#A57865]" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-neutral-900">Create Segment</h2>
              <p className="text-sm text-neutral-500">Define filters to group guests</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-neutral-200 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-neutral-500" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto flex-1 p-4 space-y-6">
          {/* Basic Info */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Segment Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., High Value Guests"
                className="w-full px-3 py-2.5 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#A57865]/20 focus:border-[#A57865]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Description
              </label>
              <input
                type="text"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Brief description of this segment"
                className="w-full px-3 py-2.5 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#A57865]/20 focus:border-[#A57865]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Segment Color
              </label>
              <div className="flex flex-wrap gap-2">
                {SEGMENT_COLORS.map((color) => (
                  <button
                    key={color}
                    onClick={() => setFormData(prev => ({ ...prev, color }))}
                    className={`w-8 h-8 rounded-lg transition-transform ${
                      formData.color === color ? 'ring-2 ring-offset-2 ring-[#A57865] scale-110' : ''
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Filters */}
          <div>
            <h3 className="text-sm font-semibold text-neutral-900 mb-3 flex items-center gap-2">
              <Filter className="w-4 h-4 text-[#A57865]" />
              Segment Filters
            </h3>

            <div className="grid grid-cols-2 gap-4">
              {/* Loyalty Tier */}
              <div>
                <label className="block text-xs font-medium text-neutral-500 mb-1">
                  Loyalty Tier
                </label>
                <select
                  value={formData.filters.loyaltyTier}
                  onChange={(e) => handleFilterChange('loyaltyTier', e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#A57865]/20 focus:border-[#A57865] bg-white"
                >
                  <option value="all">All Tiers</option>
                  {tiers.map(tier => (
                    <option key={tier.id} value={tier.id}>{tier.name}</option>
                  ))}
                </select>
              </div>

              {/* Booking Source */}
              <div>
                <label className="block text-xs font-medium text-neutral-500 mb-1">
                  Booking Source
                </label>
                <select
                  value={formData.filters.bookingSource}
                  onChange={(e) => handleFilterChange('bookingSource', e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#A57865]/20 focus:border-[#A57865] bg-white"
                >
                  <option value="all">All Sources</option>
                  {BOOKING_SOURCES.map(source => (
                    <option key={source.id} value={source.id}>{source.name}</option>
                  ))}
                </select>
              </div>

              {/* Min Stays */}
              <div>
                <label className="block text-xs font-medium text-neutral-500 mb-1">
                  Minimum Stays
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.filters.minStays}
                  onChange={(e) => handleFilterChange('minStays', e.target.value)}
                  placeholder="e.g., 3"
                  className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#A57865]/20 focus:border-[#A57865]"
                />
              </div>

              {/* Max Stays */}
              <div>
                <label className="block text-xs font-medium text-neutral-500 mb-1">
                  Maximum Stays
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.filters.maxStays}
                  onChange={(e) => handleFilterChange('maxStays', e.target.value)}
                  placeholder="e.g., 10"
                  className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#A57865]/20 focus:border-[#A57865]"
                />
              </div>

              {/* Min Spend */}
              <div>
                <label className="block text-xs font-medium text-neutral-500 mb-1">
                  Minimum Spend (₹)
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.filters.minSpend}
                  onChange={(e) => handleFilterChange('minSpend', e.target.value)}
                  placeholder="e.g., 5000"
                  className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#A57865]/20 focus:border-[#A57865]"
                />
              </div>

              {/* Max Spend */}
              <div>
                <label className="block text-xs font-medium text-neutral-500 mb-1">
                  Maximum Spend (₹)
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.filters.maxSpend}
                  onChange={(e) => handleFilterChange('maxSpend', e.target.value)}
                  placeholder="e.g., 20000"
                  className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#A57865]/20 focus:border-[#A57865]"
                />
              </div>

              {/* Last Stay Days */}
              <div>
                <label className="block text-xs font-medium text-neutral-500 mb-1">
                  Last Stay Within (Days)
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.filters.lastStayDays}
                  onChange={(e) => handleFilterChange('lastStayDays', e.target.value)}
                  placeholder="e.g., 30"
                  className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#A57865]/20 focus:border-[#A57865]"
                />
              </div>

              {/* Country */}
              <div>
                <label className="block text-xs font-medium text-neutral-500 mb-1">
                  Country
                </label>
                <input
                  type="text"
                  value={formData.filters.country}
                  onChange={(e) => handleFilterChange('country', e.target.value)}
                  placeholder="e.g., United States"
                  className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#A57865]/20 focus:border-[#A57865]"
                />
              </div>

              {/* Room Type */}
              <div className="col-span-2">
                <label className="block text-xs font-medium text-neutral-500 mb-1">
                  Room Type Preference
                </label>
                <select
                  value={formData.filters.roomType}
                  onChange={(e) => handleFilterChange('roomType', e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#A57865]/20 focus:border-[#A57865] bg-white"
                >
                  <option value="all">All Room Types</option>
                  {ROOM_TYPES.map(room => (
                    <option key={room.id} value={room.id}>{room.name}</option>
                  ))}
                </select>
              </div>

              {/* Tags */}
              <div className="col-span-2">
                <label className="block text-xs font-medium text-neutral-500 mb-1">
                  Guest Tags
                </label>
                <div className="flex items-center gap-2 mb-2">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                    placeholder="Add a tag..."
                    className="flex-1 px-3 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#A57865]/20 focus:border-[#A57865]"
                  />
                  <button
                    onClick={handleAddTag}
                    className="p-2 bg-[#A57865] text-white rounded-lg hover:bg-[#A57865]/90 transition-colors"
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
                      className="px-2 py-1 text-xs bg-neutral-100 text-neutral-600 rounded hover:bg-neutral-200 transition-colors"
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
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-[#A57865]/10 text-[#A57865]"
                      >
                        <Tag className="w-3 h-3" />
                        {tag}
                        <button
                          onClick={() => handleRemoveTag(tag)}
                          className="ml-1 hover:text-red-500"
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
          <div className="bg-[#FAF7F4] rounded-xl p-4">
            <h3 className="text-sm font-semibold text-neutral-900 mb-3 flex items-center gap-2">
              <Eye className="w-4 h-4 text-[#A57865]" />
              Segment Preview
            </h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-[#A57865]">{previewStats.count}</p>
                <p className="text-xs text-neutral-500">Matching Guests</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-[#4E5840]">₹{previewStats.avgRevenue.toLocaleString()}</p>
                <p className="text-xs text-neutral-500">Avg Revenue</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-[#5C9BA4]">{previewStats.repeatRate}%</p>
                <p className="text-xs text-neutral-500">Repeat Rate</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-4 border-t border-neutral-200 bg-neutral-50 flex-shrink-0">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmit} disabled={!formData.name.trim()} icon={Plus}>
            Create Segment
          </Button>
        </div>
      </div>

      <style>{`
        @keyframes scale-in {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-scale-in {
          animation: scale-in 0.2s ease-out;
        }
      `}</style>
    </div>
  );

  return createPortal(modalContent, document.body);
}
