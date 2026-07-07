/**
 * EditPromotionModal Component
 * Edit existing promotions - Glimmora Design System v4.0
 * Premium side drawer with refined luxury aesthetic
 */

import { useState, useEffect, useRef } from 'react';
import {
  Percent, DollarSign, Gift, Tag, Check, AlertCircle, X, ChevronDown
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { Drawer } from '../ui2/Drawer';
import { Input, FormField, Textarea } from '../ui2/Input';
import { Button } from '../ui2/Button';
import DatePicker from '../ui2/DatePicker';

// Custom Select Component
function CustomSelect({ value, onChange, options, placeholder = 'Select...' }) {
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef(null);

  const selectedOption = options.find(opt => opt.value === value);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (selectRef.current && !selectRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={selectRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-full h-9 sm:h-10 px-3 sm:px-3.5 rounded-lg text-xs sm:text-sm bg-white border transition-all duration-150 text-left flex items-center justify-between focus:outline-none",
          isOpen
            ? "border-terra-400 ring-2 ring-terra-500/10"
            : "border-neutral-200 hover:border-neutral-300"
        )}
      >
        <span className={selectedOption ? 'text-neutral-900' : 'text-neutral-400'}>
          {selectedOption?.label || placeholder}
        </span>
        <ChevronDown className={cn("w-3.5 h-3.5 sm:w-4 sm:h-4 text-neutral-400 transition-transform", isOpen && "rotate-180")} />
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white rounded-lg border border-neutral-200 shadow-lg overflow-hidden max-h-48 sm:max-h-60 overflow-y-auto">
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
              className={cn(
                "w-full px-3 sm:px-3.5 py-2 sm:py-2.5 text-xs sm:text-sm text-left flex items-center justify-between hover:bg-neutral-50 transition-colors",
                value === option.value && "bg-terra-50 text-terra-700"
              )}
            >
              <span>{option.label}</span>
              {value === option.value && <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-terra-600" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// Default promotion types - can be overridden via props
const DEFAULT_PROMOTION_TYPES = [
  { value: 'Early Bird', label: 'Early Bird' },
  { value: 'Last Minute', label: 'Last Minute' },
  { value: 'Long Stay', label: 'Long Stay' },
  { value: 'Advance Purchase', label: 'Advance Purchase' },
  { value: 'Seasonal Deal', label: 'Seasonal Deal' },
  { value: 'Flash Sale', label: 'Flash Sale' },
  { value: 'OTA Exclusive', label: 'OTA Exclusive' },
  { value: 'Direct Booking', label: 'Direct Booking' },
];

const DISCOUNT_TYPES = [
  { value: 'percentage', label: 'Percentage', icon: Percent, desc: '% off rate' },
  { value: 'flat', label: 'Flat Amount', icon: DollarSign, desc: 'Fixed discount' },
  { value: 'free_night', label: 'Free Night', icon: Gift, desc: 'Stay X Pay Y' },
  { value: 'derived', label: 'From BAR', icon: Tag, desc: 'BAR minus %' },
];

const DEFAULT_ROOM_TYPES = [
  { id: 'rt1', name: 'Minimalist Studio' },
  { id: 'rt2', name: 'Coastal Retreat' },
  { id: 'rt3', name: 'Urban Oasis' },
  { id: 'rt4', name: 'Sunset Vista' },
  { id: 'rt5', name: 'Pacific Suite' },
  { id: 'rt6', name: 'Wellness Suite' },
  { id: 'rt7', name: 'Family Sanctuary' },
  { id: 'rt8', name: 'Oceanfront Penthouse' },
];

const CHANNELS = [
  { id: 'website', name: 'Website', type: 'direct' },
  { id: 'mobile', name: 'Mobile App', type: 'direct' },
  { id: 'callcenter', name: 'Call Centre', type: 'direct' },
  { id: 'booking', name: 'Booking.com', type: 'ota' },
  { id: 'expedia', name: 'Expedia', type: 'ota' },
  { id: 'agoda', name: 'Agoda', type: 'ota' },
];

const STATUS_OPTIONS = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
];

interface Promotion {
  id: string;
  title: string;
  description?: string;
  discountType: string;
  discountValue: number;
  validFrom: string;
  validTo: string;
  bookingWindowStart?: string;
  bookingWindowEnd?: string;
  minNights?: number;
  maxNights?: number;
  minBookingAmount?: number;
  stackable?: boolean;
  isActive: boolean;
  applicableRoomTypes?: string[];
  applicableChannels?: string[];
  code?: string;
  usageLimit?: number;
  usageCount?: number;
}

interface EditPromotionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (id: string, data: any) => void;
  promotion: Promotion | null;
  roomTypes?: { id: string; name: string }[];
  promotionTypes?: { value: string; label: string }[];
}

export default function EditPromotionModal({
  isOpen,
  onClose,
  onSubmit,
  promotion,
  roomTypes = DEFAULT_ROOM_TYPES,
  promotionTypes = DEFAULT_PROMOTION_TYPES
}: EditPromotionModalProps) {
  // Use the passed promotion types for the dropdown
  const PROMOTION_TYPES = promotionTypes;
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'Early Bird',
    discountType: 'percentage',
    discountValue: 10,
    flatAmount: 50,
    stayX: 4,
    payY: 3,
    derivedPercent: 10,
    stayStart: '',
    stayEnd: '',
    bookingStart: '',
    bookingEnd: '',
    minLos: 1,
    maxLos: 30,
    cta: false,
    ctd: false,
    stackable: false,
    eligibleRooms: [] as string[],
    channels: ['website'],
    status: 'active',
    blackoutDates: [] as string[],
    code: '',
    usageLimit: 0,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [blackoutInput, setBlackoutInput] = useState('');

  // Initialize form data when promotion changes
  useEffect(() => {
    if (promotion && isOpen) {
      // Map room type names to IDs
      const roomIds = (promotion.applicableRoomTypes || []).map(name => {
        const room = roomTypes.find(r => r.name === name);
        return room?.id || name;
      });

      // Map channel names to IDs
      const channelIds = (promotion.applicableChannels || []).map(name => {
        const channel = CHANNELS.find(c => c.name.toLowerCase() === name.toLowerCase());
        return channel?.id || name.toLowerCase();
      });

      setFormData({
        name: promotion.title || '',
        description: promotion.description || '',
        type: 'Early Bird', // Default since not stored in promotion
        discountType: promotion.discountType || 'percentage',
        discountValue: promotion.discountType === 'percentage' ? (promotion.discountValue || 10) : 10,
        flatAmount: promotion.discountType === 'flat' || promotion.discountType === 'fixed' ? (promotion.discountValue || 50) : 50,
        stayX: promotion.discountType === 'free_night' ? (promotion.discountValue || 4) : 4,
        payY: 3, // Default
        derivedPercent: promotion.discountType === 'derived' ? (promotion.discountValue || 10) : 10,
        stayStart: promotion.validFrom || '',
        stayEnd: promotion.validTo || '',
        bookingStart: promotion.bookingWindowStart || '',
        bookingEnd: promotion.bookingWindowEnd || '',
        minLos: promotion.minNights || 1,
        maxLos: promotion.maxNights || 30,
        cta: false,
        ctd: false,
        stackable: promotion.stackable || false,
        eligibleRooms: roomIds,
        channels: channelIds.length > 0 ? channelIds : ['website'],
        status: promotion.isActive ? 'active' : 'inactive',
        blackoutDates: [],
        code: promotion.code || '',
        usageLimit: promotion.usageLimit || 0,
      });
    }
  }, [promotion, isOpen, roomTypes]);

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleRoomToggle = (roomId: string) => {
    const newRooms = formData.eligibleRooms.includes(roomId)
      ? formData.eligibleRooms.filter(id => id !== roomId)
      : [...formData.eligibleRooms, roomId];
    handleChange('eligibleRooms', newRooms);
  };

  const handleChannelToggle = (channelId: string) => {
    const newChannels = formData.channels.includes(channelId)
      ? formData.channels.filter(id => id !== channelId)
      : [...formData.channels, channelId];
    handleChange('channels', newChannels);
  };

  const handleSelectAllRooms = () => {
    const allIds = roomTypes.map(r => r.id);
    const allSelected = allIds.every(id => formData.eligibleRooms.includes(id));
    handleChange('eligibleRooms', allSelected ? [] : allIds);
  };

  const handleAddBlackout = () => {
    if (blackoutInput && !formData.blackoutDates.includes(blackoutInput)) {
      handleChange('blackoutDates', [...formData.blackoutDates, blackoutInput].sort());
      setBlackoutInput('');
    }
  };

  const handleRemoveBlackout = (date: string) => {
    handleChange('blackoutDates', formData.blackoutDates.filter(d => d !== date));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (formData.eligibleRooms.length === 0) newErrors.eligibleRooms = 'Select at least one room';
    if (formData.channels.length === 0) newErrors.channels = 'Select at least one channel';
    if (formData.discountType === 'percentage' && (formData.discountValue <= 0 || formData.discountValue > 100)) {
      newErrors.discountValue = 'Must be 1-100%';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!validateForm() || !promotion) return;

    let discountValue = formData.discountValue;
    switch (formData.discountType) {
      case 'flat': discountValue = formData.flatAmount; break;
      case 'free_night': discountValue = formData.stayX; break;
      case 'derived': discountValue = formData.derivedPercent; break;
    }

    // Map room IDs back to names
    const roomNames = formData.eligibleRooms.map(id => {
      const room = roomTypes.find(r => r.id === id);
      return room?.name || id;
    });

    // Map channel IDs back to names
    const channelNames = formData.channels.map(id => {
      const channel = CHANNELS.find(c => c.id === id);
      return channel?.name || id;
    });

    const payload = {
      title: formData.name.trim(),
      description: formData.description.trim(),
      discountType: formData.discountType === 'flat' ? 'fixed' : formData.discountType,
      discountValue,
      validFrom: formData.stayStart,
      validTo: formData.stayEnd,
      bookingWindowStart: formData.bookingStart,
      bookingWindowEnd: formData.bookingEnd,
      minNights: formData.minLos,
      maxNights: formData.maxLos,
      stackable: formData.stackable,
      isActive: formData.status === 'active',
      applicableRoomTypes: roomNames,
      applicableChannels: channelNames,
      code: formData.code,
      usageLimit: formData.usageLimit,
    };

    onSubmit(promotion.id, payload);
    handleClose();
  };

  const handleClose = () => {
    setErrors({});
    onClose();
  };

  const allRoomsSelected = roomTypes.every(r => formData.eligibleRooms.includes(r.id));

  const drawerFooter = (
    <div className="flex items-center justify-end gap-2 sm:gap-3 w-full">
      <Button variant="outline" onClick={handleClose} className="text-xs sm:text-sm h-9 sm:h-10 px-3 sm:px-4">Cancel</Button>
      <Button variant="primary" onClick={handleSubmit} className="text-xs sm:text-sm h-9 sm:h-10 px-3 sm:px-4">Save Changes</Button>
    </div>
  );

  if (!promotion) return null;

  return (
    <Drawer
      isOpen={isOpen}
      onClose={handleClose}
      title="Edit Promotion"
      subtitle={`Editing: ${promotion.title}`}
      maxWidth="max-w-2xl"
      footer={drawerFooter}
    >
      <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">

        {/* Basic Info */}
        <section>
          <h3 className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-widest text-neutral-400 mb-3 sm:mb-4">
            Basic Information
          </h3>
          <div className="space-y-3 sm:space-y-4">
            <FormField label="Promotion Name" required error={errors.name}>
              <Input
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="e.g., Summer Early Bird 20%"
                error={errors.name}
                className="h-9 sm:h-10 text-xs sm:text-sm"
              />
            </FormField>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <FormField label="Promotion Type">
                <CustomSelect
                  value={formData.type}
                  onChange={(value) => handleChange('type', value)}
                  options={PROMOTION_TYPES}
                  placeholder="Select type"
                />
              </FormField>

              <FormField label="Status">
                <CustomSelect
                  value={formData.status}
                  onChange={(value) => handleChange('status', value)}
                  options={STATUS_OPTIONS}
                  placeholder="Select status"
                />
              </FormField>
            </div>

            <FormField label="Promo Code" description="Optional code for customers">
              <Input
                value={formData.code}
                onChange={(e) => handleChange('code', e.target.value.toUpperCase())}
                placeholder="e.g., SUMMER20"
                className="h-9 sm:h-10 text-xs sm:text-sm font-mono"
              />
            </FormField>

            <FormField label="Description" description="Optional internal notes">
              <Textarea
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder="Terms and conditions..."
                rows={2}
                className="text-xs sm:text-sm"
              />
            </FormField>
          </div>
        </section>

        {/* Discount Type */}
        <section>
          <h3 className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-widest text-neutral-400 mb-3 sm:mb-4">
            Discount Configuration
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 mb-3 sm:mb-4">
            {DISCOUNT_TYPES.map(type => {
              const Icon = type.icon;
              const isSelected = formData.discountType === type.value;
              return (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => handleChange('discountType', type.value)}
                  className={cn(
                    'p-2 sm:p-3 rounded-lg border transition-all text-left',
                    isSelected
                      ? 'border-terra-400 bg-terra-50 ring-2 ring-terra-500/10'
                      : 'border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50'
                  )}
                >
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className={cn(
                      'w-7 h-7 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center flex-shrink-0',
                      isSelected ? 'bg-terra-500 text-white' : 'bg-neutral-100 text-neutral-400'
                    )}>
                      <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs sm:text-[13px] font-semibold text-neutral-900 truncate">{type.label}</p>
                      <p className="text-[9px] sm:text-[10px] text-neutral-500 truncate">{type.desc}</p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Discount Value Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            {formData.discountType === 'percentage' && (
              <FormField label="Discount %" required error={errors.discountValue}>
                <Input
                  type="number"
                  value={formData.discountValue}
                  onChange={(e) => handleChange('discountValue', parseInt(e.target.value) || 0)}
                  min={1} max={100}
                  error={errors.discountValue}
                />
              </FormField>
            )}
            {formData.discountType === 'flat' && (
              <FormField label="Amount ($)" required>
                <Input
                  type="number"
                  value={formData.flatAmount}
                  onChange={(e) => handleChange('flatAmount', parseInt(e.target.value) || 0)}
                  min={1}
                />
              </FormField>
            )}
            {formData.discountType === 'free_night' && (
              <>
                <FormField label="Stay Nights">
                  <Input
                    type="number"
                    value={formData.stayX}
                    onChange={(e) => handleChange('stayX', parseInt(e.target.value) || 2)}
                    min={2}
                  />
                </FormField>
                <FormField label="Pay Nights">
                  <Input
                    type="number"
                    value={formData.payY}
                    onChange={(e) => handleChange('payY', parseInt(e.target.value) || 1)}
                    min={1}
                  />
                </FormField>
              </>
            )}
            {formData.discountType === 'derived' && (
              <FormField label="% Below BAR" required>
                <Input
                  type="number"
                  value={formData.derivedPercent}
                  onChange={(e) => handleChange('derivedPercent', parseInt(e.target.value) || 0)}
                  min={1} max={100}
                />
              </FormField>
            )}
            <FormField label="Usage Limit" description="0 = unlimited">
              <Input
                type="number"
                value={formData.usageLimit}
                onChange={(e) => handleChange('usageLimit', parseInt(e.target.value) || 0)}
                min={0}
              />
            </FormField>
          </div>
        </section>

        {/* Validity Period */}
        <section>
          <h3 className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-widest text-neutral-400 mb-3 sm:mb-4">
            Validity Period
          </h3>

          <div className="space-y-3 sm:space-y-4">
            <div>
              <p className="text-xs sm:text-[13px] font-medium text-neutral-700 mb-2">Stay Dates</p>
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <FormField label="From">
                  <DatePicker
                    value={formData.stayStart}
                    onChange={(value) => handleChange('stayStart', value)}
                    placeholder="Select date"
                    className="w-full"
                  />
                </FormField>
                <FormField label="To">
                  <DatePicker
                    value={formData.stayEnd}
                    onChange={(value) => handleChange('stayEnd', value)}
                    minDate={formData.stayStart}
                    placeholder="Select date"
                    className="w-full"
                  />
                </FormField>
              </div>
            </div>

            <div>
              <p className="text-xs sm:text-[13px] font-medium text-neutral-700 mb-2">Booking Window</p>
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <FormField label="From">
                  <DatePicker
                    value={formData.bookingStart}
                    onChange={(value) => handleChange('bookingStart', value)}
                    placeholder="Select date"
                    className="w-full"
                  />
                </FormField>
                <FormField label="To">
                  <DatePicker
                    value={formData.bookingEnd}
                    onChange={(value) => handleChange('bookingEnd', value)}
                    minDate={formData.bookingStart}
                    placeholder="Select date"
                    className="w-full"
                  />
                </FormField>
              </div>
            </div>
          </div>
        </section>

        {/* Restrictions */}
        <section>
          <h3 className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-widest text-neutral-400 mb-3 sm:mb-4">
            Restrictions
          </h3>

          <div className="space-y-3 sm:space-y-4">
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <FormField label="Min Stay (nights)">
                <Input
                  type="number"
                  value={formData.minLos}
                  onChange={(e) => handleChange('minLos', parseInt(e.target.value) || 1)}
                  min={1}
                  className="h-9 sm:h-10 text-xs sm:text-sm"
                />
              </FormField>
              <FormField label="Max Stay (nights)">
                <Input
                  type="number"
                  value={formData.maxLos}
                  onChange={(e) => handleChange('maxLos', parseInt(e.target.value) || 30)}
                  min={1}
                  className="h-9 sm:h-10 text-xs sm:text-sm"
                />
              </FormField>
            </div>

            {/* Toggle Options */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3">
              {[
                { key: 'cta', label: 'CTA', desc: 'Closed to Arrival' },
                { key: 'ctd', label: 'CTD', desc: 'Closed to Departure' },
                { key: 'stackable', label: 'Stackable', desc: 'Combine promos' },
              ].map(toggle => (
                <button
                  key={toggle.key}
                  type="button"
                  onClick={() => handleChange(toggle.key, !formData[toggle.key])}
                  className={cn(
                    'p-2 sm:p-3 rounded-lg border transition-all text-left',
                    formData[toggle.key]
                      ? 'border-terra-400 bg-terra-50 ring-2 ring-terra-500/10'
                      : 'border-neutral-200 hover:border-neutral-300'
                  )}
                >
                  <div className="flex items-center justify-between mb-0.5 sm:mb-1">
                    <span className="text-[10px] sm:text-[12px] font-semibold text-neutral-900">{toggle.label}</span>
                    <div className={cn(
                      'w-3.5 h-3.5 sm:w-4 sm:h-4 rounded flex items-center justify-center flex-shrink-0',
                      formData[toggle.key] ? 'bg-terra-500 text-white' : 'border border-neutral-300 bg-white'
                    )}>
                      {formData[toggle.key] && <Check className="w-2.5 h-2.5 sm:w-3 sm:h-3" strokeWidth={3} />}
                    </div>
                  </div>
                  <p className="text-[8px] sm:text-[10px] text-neutral-500 truncate">{toggle.desc}</p>
                </button>
              ))}
            </div>

            {/* Blackout Dates */}
            <div>
              <p className="text-xs sm:text-[13px] font-medium text-neutral-700 mb-2">Blackout Dates</p>
              <div className="flex gap-2 items-center">
                <DatePicker
                  value={blackoutInput}
                  onChange={(value) => setBlackoutInput(value)}
                  placeholder="Select date"
                  className="flex-1"
                />
                <Button type="button" variant="outline" onClick={handleAddBlackout} className="text-xs sm:text-sm h-9 sm:h-10 px-3 sm:px-4">Add</Button>
              </div>
              {formData.blackoutDates.length > 0 && (
                <div className="flex flex-wrap gap-1.5 sm:gap-2 mt-2 sm:mt-3">
                  {formData.blackoutDates.map(date => (
                    <span
                      key={date}
                      className="inline-flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-lg text-[10px] sm:text-[11px] font-medium bg-rose-50 text-rose-700 border border-rose-200"
                    >
                      {date}
                      <button type="button" onClick={() => handleRemoveBlackout(date)} className="hover:opacity-70">
                        <X className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Room Eligibility */}
        <section>
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <h3 className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-widest text-neutral-400">
              Room Types
            </h3>
            <button
              type="button"
              onClick={handleSelectAllRooms}
              className="text-[10px] sm:text-[12px] text-terra-500 hover:text-terra-600 font-medium"
            >
              {allRoomsSelected ? 'Deselect All' : 'Select All'}
            </button>
          </div>

          {errors.eligibleRooms && (
            <p className="text-rose-500 text-[10px] sm:text-[11px] mb-2 sm:mb-3 flex items-center gap-1">
              <AlertCircle className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
              {errors.eligibleRooms}
            </p>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 sm:gap-2">
            {roomTypes.map(room => {
              const isSelected = formData.eligibleRooms.includes(room.id);
              return (
                <button
                  key={room.id}
                  type="button"
                  onClick={() => handleRoomToggle(room.id)}
                  className={cn(
                    'flex items-center gap-2.5 sm:gap-3 p-2.5 sm:p-3 rounded-lg border transition-all text-left',
                    isSelected
                      ? 'border-terra-400 bg-terra-50 ring-2 ring-terra-500/10'
                      : 'border-neutral-200 hover:border-neutral-300'
                  )}
                >
                  <div className={cn(
                    'w-4 h-4 sm:w-5 sm:h-5 rounded flex items-center justify-center flex-shrink-0',
                    isSelected ? 'bg-terra-500 text-white' : 'border border-neutral-300 bg-white'
                  )}>
                    {isSelected && <Check className="w-2.5 h-2.5 sm:w-3 sm:h-3" strokeWidth={3} />}
                  </div>
                  <span className="text-xs sm:text-[13px] font-medium text-neutral-700 truncate">{room.name}</span>
                </button>
              );
            })}
          </div>
        </section>

        {/* Channel Distribution */}
        <section>
          <h3 className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-widest text-neutral-400 mb-3 sm:mb-4">
            Channel Distribution
          </h3>

          {errors.channels && (
            <p className="text-rose-500 text-[10px] sm:text-[11px] mb-2 sm:mb-3 flex items-center gap-1">
              <AlertCircle className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
              {errors.channels}
            </p>
          )}

          <div className="space-y-3 sm:space-y-4">
            <div>
              <p className="text-[10px] sm:text-[12px] font-medium text-neutral-600 mb-2">Direct Channels</p>
              <div className="flex flex-wrap gap-1.5 sm:gap-2">
                {CHANNELS.filter(c => c.type === 'direct').map(channel => {
                  const isSelected = formData.channels.includes(channel.id);
                  return (
                    <button
                      key={channel.id}
                      type="button"
                      onClick={() => handleChannelToggle(channel.id)}
                      className={cn(
                        'flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg text-[10px] sm:text-[12px] font-medium transition-all',
                        isSelected
                          ? 'bg-terra-500 text-white'
                          : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                      )}
                    >
                      {isSelected && <Check className="w-2.5 h-2.5 sm:w-3 sm:h-3" />}
                      {channel.name}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <p className="text-[10px] sm:text-[12px] font-medium text-neutral-600 mb-2">OTA Channels</p>
              <div className="flex flex-wrap gap-1.5 sm:gap-2">
                {CHANNELS.filter(c => c.type === 'ota').map(channel => {
                  const isSelected = formData.channels.includes(channel.id);
                  return (
                    <button
                      key={channel.id}
                      type="button"
                      onClick={() => handleChannelToggle(channel.id)}
                      className={cn(
                        'flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg text-[10px] sm:text-[12px] font-medium transition-all',
                        isSelected
                          ? 'bg-terra-500 text-white'
                          : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                      )}
                    >
                      {isSelected && <Check className="w-2.5 h-2.5 sm:w-3 sm:h-3" />}
                      {channel.name}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

      </form>
    </Drawer>
  );
}
