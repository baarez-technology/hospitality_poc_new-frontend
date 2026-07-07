/**
 * PromotionDrawer Component
 * Drawer for creating/editing channel promotions - Glimmora Design System v5.0
 * Consistent with RestrictionDrawer pattern
 */

import { useState, useEffect, useRef } from 'react';
import { Trash2, Check, ChevronDown, Percent, DollarSign } from 'lucide-react';
import { createPortal } from 'react-dom';
import { useChannelManager } from '../../context/ChannelManagerContext';
import { Drawer } from '../ui2/Drawer';
import { Button } from '../ui2/Button';
import DatePicker from '../ui2/DatePicker';

// Custom Select Dropdown Component
function SelectDropdown({ value, onChange, options, placeholder = 'Select...' }) {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState(null);
  const triggerRef = useRef(null);
  const menuRef = useRef(null);

  const selectedOption = options.find(opt => opt.value === value);

  const calculatePosition = () => {
    if (!triggerRef.current) return null;
    const rect = triggerRef.current.getBoundingClientRect();
    return {
      top: rect.bottom + 4,
      left: rect.left,
      width: rect.width
    };
  };

  const handleToggle = () => {
    if (isOpen) {
      setIsOpen(false);
      setPosition(null);
    } else {
      setPosition(calculatePosition());
      setIsOpen(true);
    }
  };

  const handleSelect = (optionValue) => {
    onChange(optionValue);
    setIsOpen(false);
    setPosition(null);
  };

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e) => {
      if (!triggerRef.current?.contains(e.target) && !menuRef.current?.contains(e.target)) {
        setIsOpen(false);
        setPosition(null);
      }
    };

    const handleEsc = (e) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
        setPosition(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEsc);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEsc);
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const updatePosition = () => {
      setPosition(calculatePosition());
    };

    window.addEventListener('scroll', updatePosition, true);
    window.addEventListener('resize', updatePosition);
    return () => {
      window.removeEventListener('scroll', updatePosition, true);
      window.removeEventListener('resize', updatePosition);
    };
  }, [isOpen]);

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={handleToggle}
        className={`w-full h-9 px-3.5 rounded-lg text-[13px] bg-white border text-left flex items-center justify-between transition-all ${
          isOpen
            ? 'border-terra-400 ring-2 ring-terra-500/10'
            : 'border-neutral-200 hover:border-neutral-300'
        }`}
      >
        <span className={selectedOption ? 'text-neutral-900' : 'text-neutral-400'}>
          {selectedOption?.label || placeholder}
        </span>
        <ChevronDown className={`w-4 h-4 text-neutral-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && position && createPortal(
        <div
          ref={menuRef}
          style={{
            position: 'fixed',
            top: `${position.top}px`,
            left: `${position.left}px`,
            width: `${position.width}px`,
            zIndex: 9999
          }}
          className="bg-white rounded-lg border border-neutral-200 shadow-lg shadow-neutral-900/10 overflow-hidden animate-in fade-in-0 zoom-in-95 duration-100"
        >
          <div className="py-1 max-h-60 overflow-y-auto">
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => handleSelect(option.value)}
                className={`w-full px-3 py-2.5 text-left text-[13px] flex items-center justify-between transition-colors ${
                  value === option.value
                    ? 'bg-terra-50 text-terra-700 font-medium'
                    : 'text-neutral-700 hover:bg-neutral-50'
                }`}
              >
                <span>{option.label}</span>
                {value === option.value && <Check className="w-4 h-4 text-terra-500" />}
              </button>
            ))}
          </div>
        </div>,
        document.body
      )}
    </>
  );
}

// Multi-select dropdown for OTAs and Room Types
function MultiSelectDropdown({ value = [], onChange, options, placeholder = 'Select...' }) {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState(null);
  const triggerRef = useRef(null);
  const menuRef = useRef(null);

  const selectedLabels = value.includes('ALL')
    ? 'All'
    : options.filter(opt => value.includes(opt.value) && opt.value !== 'ALL').map(opt => opt.label).join(', ');

  const calculatePosition = () => {
    if (!triggerRef.current) return null;
    const rect = triggerRef.current.getBoundingClientRect();
    return {
      top: rect.bottom + 4,
      left: rect.left,
      width: rect.width
    };
  };

  const handleToggle = () => {
    if (isOpen) {
      setIsOpen(false);
      setPosition(null);
    } else {
      setPosition(calculatePosition());
      setIsOpen(true);
    }
  };

  const handleSelect = (optionValue) => {
    if (optionValue === 'ALL') {
      onChange(['ALL']);
    } else {
      const newValue = value.filter(v => v !== 'ALL');
      if (newValue.includes(optionValue)) {
        const filtered = newValue.filter(v => v !== optionValue);
        onChange(filtered.length === 0 ? ['ALL'] : filtered);
      } else {
        onChange([...newValue, optionValue]);
      }
    }
  };

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e) => {
      if (!triggerRef.current?.contains(e.target) && !menuRef.current?.contains(e.target)) {
        setIsOpen(false);
        setPosition(null);
      }
    };

    const handleEsc = (e) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
        setPosition(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEsc);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEsc);
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const updatePosition = () => {
      setPosition(calculatePosition());
    };

    window.addEventListener('scroll', updatePosition, true);
    window.addEventListener('resize', updatePosition);
    return () => {
      window.removeEventListener('scroll', updatePosition, true);
      window.removeEventListener('resize', updatePosition);
    };
  }, [isOpen]);

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={handleToggle}
        className={`w-full h-9 px-3.5 rounded-lg text-[13px] bg-white border text-left flex items-center justify-between transition-all ${
          isOpen
            ? 'border-terra-400 ring-2 ring-terra-500/10'
            : 'border-neutral-200 hover:border-neutral-300'
        }`}
      >
        <span className={selectedLabels ? 'text-neutral-900 truncate' : 'text-neutral-400'}>
          {selectedLabels || placeholder}
        </span>
        <ChevronDown className={`w-4 h-4 text-neutral-400 transition-transform flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && position && createPortal(
        <div
          ref={menuRef}
          style={{
            position: 'fixed',
            top: `${position.top}px`,
            left: `${position.left}px`,
            width: `${position.width}px`,
            zIndex: 9999
          }}
          className="bg-white rounded-lg border border-neutral-200 shadow-lg shadow-neutral-900/10 overflow-hidden animate-in fade-in-0 zoom-in-95 duration-100"
        >
          <div className="py-1 max-h-60 overflow-y-auto">
            {options.map((option) => {
              const isSelected = value.includes(option.value);
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleSelect(option.value)}
                  className={`w-full px-3 py-2.5 text-left text-[13px] flex items-center justify-between transition-colors ${
                    isSelected
                      ? 'bg-terra-50 text-terra-700 font-medium'
                      : 'text-neutral-700 hover:bg-neutral-50'
                  }`}
                >
                  <span>{option.label}</span>
                  {isSelected && <Check className="w-4 h-4 text-terra-500" />}
                </button>
              );
            })}
          </div>
        </div>,
        document.body
      )}
    </>
  );
}

export default function PromotionDrawer({
  isOpen,
  onClose,
  promotion = null,
  onSave,
  connectedOTAs = [],
}) {
  const { roomTypes } = useChannelManager();
  
  // Build room type options from API data
  const roomTypeOptions = [
    { value: 'ALL', label: 'All Room Types' },
    ...(roomTypes.map(rt => ({
      value: rt.name,
      label: rt.name
    })))
  ];

  const channelOptions = [
    { value: 'ALL', label: 'All Channels' },
    ...connectedOTAs.map(ota => ({ value: ota.code, label: ota.name }))
  ];

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    discountType: 'percentage',
    discountValue: 10,
    validFrom: '',
    validTo: '',
    otaCodes: ['ALL'],
    roomTypes: ['ALL'],
    minStay: 1,
    isActive: true
  });

  useEffect(() => {
    if (promotion) {
      setFormData({
        name: promotion.name || '',
        description: promotion.description || '',
        discountType: promotion.discountType || 'percentage',
        discountValue: promotion.discountValue || 10,
        validFrom: promotion.validFrom || '',
        validTo: promotion.validTo || '',
        otaCodes: promotion.otaCodes || ['ALL'],
        roomTypes: promotion.roomTypes || ['ALL'],
        minStay: promotion.minStay || 1,
        isActive: promotion.isActive !== false
      });
    } else {
      const today = new Date();
      const nextMonth = new Date(today);
      nextMonth.setMonth(nextMonth.getMonth() + 1);

      setFormData({
        name: '',
        description: '',
        discountType: 'percentage',
        discountValue: 10,
        validFrom: today.toISOString().split('T')[0],
        validTo: nextMonth.toISOString().split('T')[0],
        otaCodes: ['ALL'],
        roomTypes: ['ALL'],
        minStay: 1,
        isActive: true
      });
    }
  }, [promotion, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const isEditing = !!promotion;
    onSave({
      ...formData,
      id: promotion?.id || `cp-${Date.now()}`
    }, isEditing);
    onClose();
  };

  // Discount type options
  const discountTypes = [
    {
      key: 'percentage',
      label: 'Percentage Off',
      description: 'Apply a percentage discount',
      icon: Percent,
      activeColor: 'bg-terra-50 border-terra-200',
      activeBadge: 'bg-terra-500'
    },
    {
      key: 'fixed',
      label: 'Fixed Amount Off',
      description: 'Apply a fixed dollar discount',
      icon: DollarSign,
      activeColor: 'bg-sage-50 border-sage-200',
      activeBadge: 'bg-sage-500'
    }
  ];

  const renderFooter = () => (
    <div className="flex items-center justify-end gap-3 w-full">
      <Button type="button" variant="ghost" onClick={onClose} className="px-5 py-2 text-[13px] font-semibold">
        Cancel
      </Button>
      <Button type="submit" variant="primary" form="promotion-form" className="px-5 py-2 text-[13px] font-semibold">
        {promotion ? 'Update Promotion' : 'Create Promotion'}
      </Button>
    </div>
  );

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title={promotion ? 'Edit Promotion' : 'New Promotion'}
      subtitle="Create discounts for your distribution channels"
      maxWidth="max-w-2xl"
      footer={renderFooter()}
    >
      <form id="promotion-form" onSubmit={handleSubmit} className="space-y-6">
        {/* Promotion Details Section */}
        <div>
          <h4 className="text-[11px] font-semibold uppercase tracking-widest text-neutral-900 mb-3">
            Promotion Details
          </h4>
          <div className="space-y-3">
            <div>
              <label className="block text-[11px] font-medium text-neutral-500 mb-1.5">
                Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Winter Flash Sale"
                required
                className="w-full h-9 px-3.5 rounded-lg text-[13px] bg-white border border-neutral-200 text-neutral-900 placeholder:text-neutral-400 hover:border-neutral-300 focus:border-terra-400 focus:ring-2 focus:ring-terra-500/10 focus:outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-neutral-500 mb-1.5">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Brief description of the promotion"
                rows={2}
                className="w-full px-3.5 py-2.5 rounded-lg text-[13px] bg-white border border-neutral-200 text-neutral-900 placeholder:text-neutral-400 hover:border-neutral-300 focus:border-terra-400 focus:ring-2 focus:ring-terra-500/10 focus:outline-none transition-all resize-none"
              />
            </div>
          </div>
        </div>

        {/* Discount Type Section */}
        <div>
          <h4 className="text-[11px] font-semibold uppercase tracking-widest text-neutral-900 mb-3">
            Discount Type
          </h4>
          <div className="space-y-2">
            {discountTypes.map(type => {
              const isActive = formData.discountType === type.key;
              const Icon = type.icon;
              return (
                <button
                  key={type.key}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, discountType: type.key }))}
                  className={`w-full flex items-center justify-between p-4 rounded-lg border transition-all duration-200 ${
                    isActive
                      ? type.activeColor
                      : 'bg-neutral-50 border-neutral-200 hover:border-neutral-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      isActive ? type.activeBadge + ' text-white' : 'bg-neutral-200 text-neutral-500'
                    }`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="text-left">
                      <p className="text-[13px] font-semibold text-neutral-900">{type.label}</p>
                      <p className="text-[11px] text-neutral-500 mt-0.5">{type.description}</p>
                    </div>
                  </div>
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center transition-all flex-shrink-0 ml-3 ${
                    isActive ? type.activeBadge : 'border border-neutral-300 bg-white'
                  }`}>
                    {isActive && <Check className="w-3 h-3 text-white" />}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Discount Value */}
        <div>
          <h4 className="text-[11px] font-semibold uppercase tracking-widest text-neutral-900 mb-3">
            Discount Value
          </h4>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 text-[13px]">
              {formData.discountType === 'percentage' ? '' : '₹'}
            </span>
            <input
              type="number"
              min="1"
              max={formData.discountType === 'percentage' ? 100 : 10000}
              value={formData.discountValue}
              onChange={(e) => setFormData(prev => ({ ...prev, discountValue: parseInt(e.target.value) || 0 }))}
              className={`w-full h-9 rounded-lg text-[13px] bg-white border border-neutral-200 text-neutral-900 hover:border-neutral-300 focus:border-terra-400 focus:ring-2 focus:ring-terra-500/10 focus:outline-none transition-all ${
                formData.discountType === 'percentage' ? 'px-3.5' : 'pl-7 pr-3.5'
              }`}
            />
            {formData.discountType === 'percentage' && (
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 text-[13px]">%</span>
            )}
          </div>
        </div>

        {/* Date Range Section */}
        <div>
          <h4 className="text-[11px] font-semibold uppercase tracking-widest text-neutral-900 mb-3">
            Valid Period
          </h4>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-medium text-neutral-500 mb-1.5">
                Start Date
              </label>
              <DatePicker
                value={formData.validFrom}
                onChange={(date) => setFormData(prev => ({ ...prev, validFrom: date }))}
                placeholder="Select start"
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-neutral-500 mb-1.5">
                End Date
              </label>
              <DatePicker
                value={formData.validTo}
                onChange={(date) => setFormData(prev => ({ ...prev, validTo: date }))}
                placeholder="Select end"
                minDate={formData.validFrom}
                className="w-full"
              />
            </div>
          </div>
        </div>

        {/* Applies To Section */}
        <div>
          <h4 className="text-[11px] font-semibold uppercase tracking-widest text-neutral-900 mb-3">
            Applies To
          </h4>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-medium text-neutral-500 mb-1.5">
                Channels
              </label>
              <MultiSelectDropdown
                value={formData.otaCodes}
                onChange={(value) => setFormData(prev => ({ ...prev, otaCodes: value }))}
                options={channelOptions}
                placeholder="Select channels"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-neutral-500 mb-1.5">
                Room Types
              </label>
              <MultiSelectDropdown
                value={formData.roomTypes}
                onChange={(value) => setFormData(prev => ({ ...prev, roomTypes: value }))}
                options={roomTypeOptions}
                placeholder="Select room types"
              />
            </div>
          </div>
        </div>

        {/* Minimum Stay */}
        <div>
          <h4 className="text-[11px] font-semibold uppercase tracking-widest text-neutral-900 mb-3">
            Minimum Stay
          </h4>
          <div className="p-4 rounded-lg bg-neutral-50 border border-neutral-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[13px] font-medium text-neutral-700">Minimum nights required</p>
                <p className="text-[11px] text-neutral-500 mt-0.5">Guest must book at least this many nights</p>
              </div>
              <input
                type="number"
                min="1"
                max="30"
                value={formData.minStay}
                onChange={(e) => setFormData(prev => ({ ...prev, minStay: parseInt(e.target.value) || 1 }))}
                className="w-20 h-9 px-3.5 rounded-lg text-[13px] text-center bg-white border border-neutral-200 text-neutral-900 hover:border-neutral-300 focus:border-terra-400 focus:ring-2 focus:ring-terra-500/10 focus:outline-none transition-all"
              />
            </div>
          </div>
        </div>

        {/* Status Toggle */}
        <div className="flex items-center justify-between p-4 rounded-lg bg-neutral-50 border border-neutral-100">
          <div>
            <p className="text-[13px] font-semibold text-neutral-900">Status</p>
            <p className="text-[11px] text-neutral-500 mt-0.5">
              {formData.isActive ? 'Promotion is active' : 'Promotion is inactive'}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setFormData(prev => ({ ...prev, isActive: !prev.isActive }))}
            className={`relative w-11 h-6 rounded-full transition-colors ${
              formData.isActive ? 'bg-terra-500' : 'bg-neutral-300'
            }`}
          >
            <span
              className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                formData.isActive ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </form>
    </Drawer>
  );
}
