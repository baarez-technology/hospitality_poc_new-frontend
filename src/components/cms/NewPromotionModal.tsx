/**
 * NewPromotionModal Component
 * Create new promotions - Glimmora Design System v4.0
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

export default function NewPromotionModal({
  isOpen,
  onClose,
  onSubmit,
  roomTypes = DEFAULT_ROOM_TYPES,
  promotionTypes = DEFAULT_PROMOTION_TYPES
}) {
  // Use the passed promotionTypes or fall back to defaults
  const PROMOTION_TYPES = promotionTypes;
  const getDefaultDates = () => {
    const today = new Date();
    const stayStart = new Date(today);
    stayStart.setDate(stayStart.getDate() + 7);
    const stayEnd = new Date(stayStart);
    stayEnd.setMonth(stayEnd.getMonth() + 3);
    const bookingEnd = new Date(stayStart);
    bookingEnd.setDate(bookingEnd.getDate() - 1);

    return {
      stayStart: stayStart.toISOString().split('T')[0],
      stayEnd: stayEnd.toISOString().split('T')[0],
      bookingStart: today.toISOString().split('T')[0],
      bookingEnd: bookingEnd.toISOString().split('T')[0],
    };
  };

  const defaultDates = getDefaultDates();

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
    stayStart: defaultDates.stayStart,
    stayEnd: defaultDates.stayEnd,
    bookingStart: defaultDates.bookingStart,
    bookingEnd: defaultDates.bookingEnd,
    minLos: 1,
    maxLos: 30,
    cta: false,
    ctd: false,
    stackable: false,
    eligibleRooms: [],
    channels: ['website'],
    status: 'active',
    blackoutDates: [],
  });

  const [errors, setErrors] = useState({});
  const [blackoutInput, setBlackoutInput] = useState('');

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleRoomToggle = (roomId) => {
    const newRooms = formData.eligibleRooms.includes(roomId)
      ? formData.eligibleRooms.filter(id => id !== roomId)
      : [...formData.eligibleRooms, roomId];
    handleChange('eligibleRooms', newRooms);
  };

  const handleChannelToggle = (channelId) => {
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

  const handleRemoveBlackout = (date) => {
    handleChange('blackoutDates', formData.blackoutDates.filter(d => d !== date));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (formData.eligibleRooms.length === 0) newErrors.eligibleRooms = 'Select at least one room';
    if (formData.channels.length === 0) newErrors.channels = 'Select at least one channel';
    if (formData.discountType === 'percentage' && (formData.discountValue <= 0 || formData.discountValue > 100)) {
      newErrors.discountValue = 'Must be 1-100%';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (!validateForm()) return;

    let discount = { type: formData.discountType };
    switch (formData.discountType) {
      case 'percentage': discount.value = formData.discountValue; break;
      case 'flat': discount.value = formData.flatAmount; break;
      case 'free_night': discount.stayX = formData.stayX; discount.payY = formData.payY; break;
      case 'derived': discount.value = formData.derivedPercent; break;
    }

    const payload = {
      name: formData.name.trim(),
      description: formData.description.trim(),
      type: formData.type,
      discount,
      stayPeriod: { start: formData.stayStart, end: formData.stayEnd },
      bookingWindow: { start: formData.bookingStart, end: formData.bookingEnd },
      restrictions: {
        minLos: formData.minLos,
        maxLos: formData.maxLos,
        cta: formData.cta,
        ctd: formData.ctd,
        blackoutDates: formData.blackoutDates,
        stackable: formData.stackable,
      },
      eligibleRooms: formData.eligibleRooms,
      channels: formData.channels,
      status: formData.status,
    };

    onSubmit(payload);
    handleClose();
  };

  const handleClose = () => {
    setFormData({
      name: '', description: '', type: 'Early Bird',
      discountType: 'percentage', discountValue: 10, flatAmount: 50,
      stayX: 4, payY: 3, derivedPercent: 10,
      stayStart: defaultDates.stayStart, stayEnd: defaultDates.stayEnd,
      bookingStart: defaultDates.bookingStart, bookingEnd: defaultDates.bookingEnd,
      minLos: 1, maxLos: 30, cta: false, ctd: false, stackable: false,
      eligibleRooms: [], channels: ['website'], status: 'active', blackoutDates: [],
    });
    setErrors({});
    onClose();
  };

  const allRoomsSelected = roomTypes.every(r => formData.eligibleRooms.includes(r.id));

  const drawerFooter = (
    <div className="flex items-center justify-end gap-2 sm:gap-3 w-full">
      <Button variant="outline" onClick={handleClose} className="text-xs sm:text-sm h-9 sm:h-10 px-3 sm:px-4">Cancel</Button>
      <Button variant="primary" onClick={handleSubmit} className="text-xs sm:text-sm h-9 sm:h-10 px-3 sm:px-4">Create Promotion</Button>
    </div>
  );

  return (
    <Drawer
      isOpen={isOpen}
      onClose={handleClose}
      title="New Promotion"
      subtitle="Configure discount rules and distribution"
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
                  onChange={(e) => handleChange('discountValue', e.target.value)}
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
                  onChange={(e) => handleChange('flatAmount', e.target.value)}
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
                    onChange={(e) => handleChange('stayX', e.target.value)}
                    min={2}
                  />
                </FormField>
                <FormField label="Pay Nights">
                  <Input
                    type="number"
                    value={formData.payY}
                    onChange={(e) => handleChange('payY', e.target.value)}
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
                  onChange={(e) => handleChange('derivedPercent', e.target.value)}
                  min={1} max={100}
                />
              </FormField>
            )}
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
