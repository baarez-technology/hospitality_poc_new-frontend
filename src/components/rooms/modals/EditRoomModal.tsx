/**
 * EditRoomModal Component
 * Edit room form - Glimmora Design System v5.0
 * Matches Channel Manager drawer pattern
 */

import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Check, ChevronDown } from 'lucide-react';
import { Drawer } from '../../ui2/Drawer';
import { Button } from '../../ui2/Button';
import { useCurrency } from '@/hooks/useCurrency';

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

export default function EditRoomModal({ room, isOpen, onClose, onSave }) {
  const { symbol } = useCurrency();
  const [formData, setFormData] = useState({
    roomNumber: '',
    type: 'Minimalist Studio',
    floor: '1',
    bedType: 'Queen',
    capacity: '2',
    price: '',
    amenities: [],
    description: '',
    viewType: 'Standard'
  });

  const roomTypeOptions = [
    { value: 'Minimalist Studio', label: 'Minimalist Studio' },
    { value: 'Coastal Retreat', label: 'Coastal Retreat' },
    { value: 'Urban Oasis', label: 'Urban Oasis' },
    { value: 'Sunset Vista', label: 'Sunset Vista' },
    { value: 'Pacific Suite', label: 'Pacific Suite' },
    { value: 'Wellness Suite', label: 'Wellness Suite' },
    { value: 'Family Sanctuary', label: 'Family Sanctuary' },
    { value: 'Oceanfront Penthouse', label: 'Oceanfront Penthouse' }
  ];
  const bedTypeOptions = [
    { value: 'Single', label: 'Single' },
    { value: 'Double', label: 'Double' },
    { value: 'Queen', label: 'Queen' },
    { value: 'King', label: 'King' },
    { value: 'Twin', label: 'Twin' },
    { value: 'King + Sofa Bed', label: 'King + Sofa Bed' }
  ];
  const availableAmenities = [
    'WiFi', 'TV', 'Air Conditioning', 'Mini Fridge', 'Safe', 'Coffee Maker',
    'Balcony', 'Ocean View', 'City View', 'Garden View', 'Jacuzzi', 'Work Desk'
  ];

  useEffect(() => {
    if (isOpen && room) {
      setFormData({
        roomNumber: room.roomNumber || '',
        type: room.type || 'Standard',
        floor: String(room.floor || 1),
        bedType: room.bedType || 'Queen',
        capacity: String(room.capacity || 2),
        price: String(room.price || ''),
        amenities: room.amenities || [],
        description: room.description || '',
        viewType: room.viewType || 'Standard'
      });
    }
  }, [isOpen, room]);

  if (!room) return null;

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
      return;
    }

    // Prepare update payload — used for both local state and API
    const updatedRoom = {
      ...room,
      roomNumber: formData.roomNumber,
      type: formData.type,
      floor: parseInt(formData.floor),
      bedType: formData.bedType,
      capacity: parseInt(formData.capacity),
      price: parseFloat(formData.price),
      amenities: formData.amenities,
      description: formData.description,
      viewType: formData.viewType || 'Standard'
    };

    onSave(room.id, updatedRoom);
    onClose();
  };

  const inputStyles = "w-full h-9 px-3.5 rounded-lg text-[13px] bg-white border border-neutral-200 text-neutral-900 placeholder:text-neutral-400 hover:border-neutral-300 focus:border-terra-400 focus:ring-2 focus:ring-terra-500/10 focus:outline-none transition-all";

  const renderFooter = () => (
    <div className="flex items-center justify-end gap-3">
      <Button type="button" variant="ghost" onClick={onClose} className="px-5 py-2 text-[13px] font-semibold">
        Cancel
      </Button>
      <Button type="submit" variant="primary" form="edit-room-form" className="px-5 py-2 text-[13px] font-semibold">
        Save Changes
      </Button>
    </div>
  );

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Room"
      subtitle={`Room ${room.roomNumber} • ${room.type}`}
      maxWidth="max-w-2xl"
      footer={renderFooter()}
    >
      <form id="edit-room-form" onSubmit={handleSubmit} className="space-y-6">
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

        {/* Description */}
        <div>
          <h4 className="text-[11px] font-semibold uppercase tracking-widest text-neutral-900 mb-3">
            Description
          </h4>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={2}
            placeholder="Enter room description..."
            className="w-full px-3.5 py-2.5 rounded-lg text-[13px] bg-white border border-neutral-200 text-neutral-900 placeholder:text-neutral-400 hover:border-neutral-300 focus:border-terra-400 focus:ring-2 focus:ring-terra-500/10 focus:outline-none transition-all resize-none"
          />
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

        {/* Current Status */}
        <div>
          <h4 className="text-[11px] font-semibold uppercase tracking-widest text-neutral-900 mb-3">
            Current Status
          </h4>
          <div className="p-3 sm:p-4 rounded-lg bg-neutral-50 border border-neutral-100">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-medium text-neutral-500">Status:</span>
                <span className={`inline-flex items-center gap-1.5 text-[13px] font-semibold ${
                  room.status === 'available' ? 'text-sage-700' :
                  room.status === 'occupied' ? 'text-terra-700' :
                  room.status === 'dirty' ? 'text-gold-700' : 'text-rose-600'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${
                    room.status === 'available' ? 'bg-sage-500' :
                    room.status === 'occupied' ? 'bg-terra-500' :
                    room.status === 'dirty' ? 'bg-gold-500' : 'bg-rose-500'
                  }`}></span>
                  {room.status === 'out_of_service' ? 'Out of Service' : room.status?.charAt(0).toUpperCase() + room.status?.slice(1)}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-medium text-neutral-500">Cleaning:</span>
                <span className={`text-[13px] font-semibold ${
                  room.cleaning === 'clean' ? 'text-sage-700' : 'text-gold-700'
                }`}>
                  {room.cleaning?.charAt(0).toUpperCase() + room.cleaning?.slice(1)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </form>
    </Drawer>
  );
}
