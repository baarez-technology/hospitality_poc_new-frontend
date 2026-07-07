/**
 * AddRoomModal Component
 * Add new room form - Glimmora Design System v5.0
 * Matches Channel Manager drawer pattern
 */

import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Check, ChevronDown } from 'lucide-react';
import { Drawer } from '../../ui2/Drawer';
import { Button } from '../../ui2/Button';
import { useCurrency } from '@/hooks/useCurrency';
import { roomTypesService } from '@/api/services/roomTypes.service';

// Custom Select Dropdown Component with React Portal
function SelectDropdown({ value, onChange, options, placeholder }) {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState(null);
  const triggerRef = useRef(null);
  const menuRef = useRef(null);

  const selectedOption = options.find(opt => opt.value === value);
  const displayLabel = selectedOption?.label || placeholder;

  // Estimate dropdown height
  const estimatedDropdownHeight = Math.min(options.length * 40 + 8, 248);

  const calculatePosition = () => {
    if (!triggerRef.current) return null;
    const rect = triggerRef.current.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;

    const openAbove = spaceBelow < estimatedDropdownHeight && spaceAbove > spaceBelow;

    return {
      top: openAbove ? rect.top - estimatedDropdownHeight - 4 : rect.bottom + 4,
      left: rect.left,
      width: rect.width,
      openAbove
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

  // Close on click outside
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

  // Update position on scroll/resize
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
        className={`w-full h-9 px-3.5 rounded-lg text-[13px] bg-white border transition-all flex items-center justify-between focus:outline-none ${
          isOpen
            ? 'border-terra-400 ring-2 ring-terra-500/10'
            : 'border-neutral-200 hover:border-neutral-300'
        }`}
      >
        <span className="text-neutral-900 truncate">{displayLabel}</span>
        <ChevronDown className={`w-4 h-4 text-neutral-400 transition-transform flex-shrink-0 ml-2 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && position && createPortal(
        <div
          ref={menuRef}
          style={{
            position: 'fixed',
            top: `${position.top}px`,
            left: `${position.left}px`,
            width: `${position.width}px`,
            maxHeight: `${estimatedDropdownHeight}px`,
            zIndex: 99999
          }}
          className={`bg-white rounded-lg border border-neutral-200 shadow-lg shadow-neutral-900/10 overflow-hidden animate-in fade-in-0 duration-100 ${
            position.openAbove ? 'origin-bottom' : 'origin-top'
          }`}
        >
          <div className="py-1 max-h-60 overflow-y-auto">
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => handleSelect(option.value)}
                className={`w-full px-3.5 py-2.5 text-[13px] text-left hover:bg-neutral-50 transition-colors flex items-center justify-between ${
                  value === option.value ? 'bg-terra-50 text-terra-700 font-medium' : 'text-neutral-700'
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

export default function AddRoomModal({ isOpen, onClose, onAdd }) {
  const { symbol } = useCurrency();
  const [formData, setFormData] = useState({
    roomNumber: '',
    type: 'Minimalist Studio',
    floor: '1',
    bedType: 'Queen',
    capacity: '2',
    price: '',
    amenities: []
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [roomTypeOptions, setRoomTypeOptions] = useState([
    { value: 'Minimalist Studio', label: 'Minimalist Studio' },
  ]);

  useEffect(() => {
    roomTypesService.getRoomTypes().then((data: any[]) => {
      const options = data.map((rt: any) => ({
        value: rt.name,
        label: rt.name,
      }));
      if (options.length > 0) {
        setRoomTypeOptions(options);
        setFormData(prev => ({ ...prev, type: options[0].value }));
      }
    }).catch(() => {});
  }, []);
  const bedTypeOptions = [
    { value: 'Single', label: 'Single' },
    { value: 'Double', label: 'Double' },
    { value: 'Queen', label: 'Queen' },
    { value: 'King', label: 'King' },
    { value: 'Twin', label: 'Twin' }
  ];
  const availableAmenities = ['WiFi', 'TV', 'Air Conditioning', 'Mini Fridge', 'Safe', 'Coffee Maker', 'Balcony', 'Ocean View'];

  useEffect(() => {
    if (isOpen) {
      setFormData(prev => ({
        roomNumber: '',
        type: roomTypeOptions[0]?.value || prev.type,
        floor: '1',
        bedType: 'Queen',
        capacity: '2',
        price: '',
        amenities: []
      }));
      setError(null);
    }
  }, [isOpen, roomTypeOptions]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAmenityToggle = (amenity) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.roomNumber || !formData.price) {
      setError('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const newRoom = {
        roomNumber: formData.roomNumber,
        type: formData.type,
        floor: parseInt(formData.floor),
        bedType: formData.bedType,
        capacity: parseInt(formData.capacity),
        price: parseFloat(formData.price),
        amenities: formData.amenities,
        status: 'available',
        cleaning: 'clean',
        guests: null
      };

      await onAdd(newRoom);
      onClose();
    } catch (err: any) {
      console.error('Failed to create room:', err);
      setError(err.response?.data?.detail || err.message || 'Failed to create room');
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputStyles = "w-full h-9 px-3.5 rounded-lg text-[13px] bg-white border border-neutral-200 text-neutral-900 placeholder:text-neutral-400 hover:border-neutral-300 focus:border-terra-400 focus:ring-2 focus:ring-terra-500/10 focus:outline-none transition-all";

  const renderFooter = () => (
    <div className="flex items-center justify-end gap-3">
      <Button type="button" variant="ghost" onClick={onClose} disabled={isSubmitting} className="px-5 py-2 text-[13px] font-semibold">
        Cancel
      </Button>
      <Button type="submit" variant="primary" form="add-room-form" disabled={isSubmitting} className="px-5 py-2 text-[13px] font-semibold">
        {isSubmitting ? 'Creating...' : 'Add Room'}
      </Button>
    </div>
  );

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title="Add New Room"
      subtitle="Add a new room to your inventory"
      maxWidth="max-w-2xl"
      footer={renderFooter()}
    >
      <form id="add-room-form" onSubmit={handleSubmit} className="space-y-6">
        {/* Error Message */}
        {error && (
          <div className="p-3 bg-rose-50 border border-rose-100 rounded-lg text-rose-700 text-[13px]">
            {error}
          </div>
        )}

        {/* Room Information */}
        <div>
          <h4 className="text-[11px] font-semibold uppercase tracking-widest text-neutral-900 mb-3">
            Room Information
          </h4>
          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-neutral-500 mb-1.5">
                  Room Number
                </label>
                <input
                  type="text"
                  name="roomNumber"
                  value={formData.roomNumber}
                  onChange={handleChange}
                  placeholder="e.g., 101"
                  required
                  className={inputStyles}
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-neutral-500 mb-1.5">
                  Room Type
                </label>
                <SelectDropdown
                  value={formData.type}
                  onChange={(value) => setFormData(prev => ({ ...prev, type: value }))}
                  options={roomTypeOptions}
                  placeholder="Select room type"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-neutral-500 mb-1.5">
                  Floor
                </label>
                <input
                  type="number"
                  name="floor"
                  value={formData.floor}
                  onChange={handleChange}
                  min="1"
                  max="50"
                  className={inputStyles}
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-neutral-500 mb-1.5">
                  Bed Type
                </label>
                <SelectDropdown
                  value={formData.bedType}
                  onChange={(value) => setFormData(prev => ({ ...prev, bedType: value }))}
                  options={bedTypeOptions}
                  placeholder="Select bed type"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Capacity & Pricing */}
        <div>
          <h4 className="text-[11px] font-semibold uppercase tracking-widest text-neutral-900 mb-3">
            Capacity & Pricing
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-medium text-neutral-500 mb-1.5">
                Max Guests
              </label>
              <input
                type="number"
                name="capacity"
                value={formData.capacity}
                onChange={handleChange}
                min="1"
                max="10"
                className={inputStyles}
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-neutral-500 mb-1.5">
                Price per Night
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 text-[13px]">{symbol}</span>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  placeholder="120"
                  min="0"
                  step="0.01"
                  required
                  className={`${inputStyles} pl-7`}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Amenities */}
        <div>
          <h4 className="text-[11px] font-semibold uppercase tracking-widest text-neutral-900 mb-3">
            Amenities
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {availableAmenities.map(amenity => {
              const isSelected = formData.amenities.includes(amenity);
              return (
                <button
                  key={amenity}
                  type="button"
                  onClick={() => handleAmenityToggle(amenity)}
                  className={`flex items-center justify-between p-3 rounded-lg border transition-all ${
                    isSelected
                      ? 'border-terra-200 bg-terra-50'
                      : 'border-neutral-200 hover:border-neutral-300 bg-white'
                  }`}
                >
                  <span className={`text-[13px] font-medium ${isSelected ? 'text-terra-700' : 'text-neutral-700'}`}>
                    {amenity}
                  </span>
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center transition-all ${
                    isSelected ? 'bg-terra-500' : 'border border-neutral-300 bg-white'
                  }`}>
                    {isSelected && <Check className="w-3 h-3 text-white" />}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </form>
    </Drawer>
  );
}
