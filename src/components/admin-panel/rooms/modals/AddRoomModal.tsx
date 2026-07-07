import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { createPortal } from 'react-dom';
import { X, Plus } from 'lucide-react';
import { SimpleDropdown } from '@/components/ui/Select';
import { Button } from '../../../ui2/Button';
import { useCurrency } from '@/hooks/useCurrency';

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

  // Room types matching database
  const roomTypes = [
    'Minimalist Studio',
    'Coastal Retreat',
    'Urban Oasis',
    'Sunset Vista',
    'Pacific Suite',
    'Wellness Suite',
    'Family Sanctuary',
    'Oceanfront Penthouse'
  ];
  const bedTypes = ['Single', 'Double', 'Queen', 'King', 'Twin'];
  const availableAmenities = ['WiFi', 'TV', 'Air Conditioning', 'Mini Fridge', 'Safe', 'Coffee Maker', 'Balcony', 'Ocean View'];

  useEffect(() => {
    if (!isOpen) return;

    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };

    // Store current scroll positions
    const scrollY = window.scrollY;
    const scrollX = window.scrollX;
    const mainContent = document.querySelector('main');

    // Prevent body scrolling
    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollY}px`;
    document.body.style.left = `-${scrollX}px`;
    document.body.style.width = '100%';
    document.body.style.overflow = 'hidden';

    // Prevent scrolling on main content
    if (mainContent) {
      mainContent.style.overflow = 'hidden';
    }

    // Reset form when drawer opens
    setFormData({
      roomNumber: '',
      type: 'Minimalist Studio',
      floor: '1',
      bedType: 'Queen',
      capacity: '2',
      price: '',
      amenities: []
    });

    document.addEventListener('keydown', handleEsc);

    return () => {
      // Restore body scrolling
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.left = '';
      document.body.style.width = '';
      document.body.style.overflow = '';

      // Restore main content scrolling
      if (mainContent) {
        mainContent.style.overflow = '';
      }

      // Restore scroll position
      window.scrollTo(scrollX, scrollY);

      document.removeEventListener('keydown', handleEsc);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

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

    // Validation
    if (!formData.roomNumber || !formData.price) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);
    try {
      // Create room object matching useRooms expected format
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
      toast.success('Room created successfully!');
      onClose();
    } catch (error: any) {
      console.error('Failed to create room:', error);
      const message = error.response?.data?.detail || error.message || 'Failed to create room';
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const drawerContent = (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed top-0 bottom-0 right-0 h-screen w-full max-w-2xl bg-white shadow-xl border-l border-neutral-200 z-50 overflow-y-auto custom-scrollbar animate-slideInRight">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-neutral-200 z-10">
          <div className="p-6 pb-4">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h2 className="text-2xl font-serif font-bold text-neutral-900">Add New Room</h2>
                <p className="text-sm text-neutral-500 mt-1">
                  Add a new room to your inventory
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-neutral-100 rounded-lg transition-all duration-150 active:scale-95"
              >
                <X className="w-5 h-5 text-neutral-600" />
              </button>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="p-6 pb-32 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Room Number */}
            <div>
              <label className="block text-sm font-semibold text-neutral-700 mb-2">
                Room Number <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="roomNumber"
                value={formData.roomNumber}
                onChange={handleChange}
                placeholder="e.g., 101"
                required
                className="w-full px-4 py-2.5 bg-[#FAF8F6] border border-neutral-200 rounded-lg text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#A57865] focus:border-[#A57865] transition-all duration-200"
              />
            </div>

            {/* Room Type */}
            <div>
              <label className="block text-sm font-semibold text-neutral-700 mb-2">
                Room Type
              </label>
              <SimpleDropdown
                value={formData.type}
                onChange={(value) => setFormData(prev => ({ ...prev, type: value }))}
                options={roomTypes.map(type => ({ value: type, label: type }))}
                placeholder="Select Room Type"
              />
            </div>

            {/* Floor */}
            <div>
              <label className="block text-sm font-semibold text-neutral-700 mb-2">
                Floor
              </label>
              <input
                type="number"
                name="floor"
                value={formData.floor}
                onChange={handleChange}
                min="1"
                max="50"
                className="w-full px-4 py-2.5 bg-[#FAF8F6] border border-neutral-200 rounded-lg text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-[#A57865] focus:border-[#A57865] transition-all duration-200"
              />
            </div>

            {/* Bed Type */}
            <div>
              <label className="block text-sm font-semibold text-neutral-700 mb-2">
                Bed Type
              </label>
              <SimpleDropdown
                value={formData.bedType}
                onChange={(value) => setFormData(prev => ({ ...prev, bedType: value }))}
                options={bedTypes.map(type => ({ value: type, label: type }))}
                placeholder="Select Bed Type"
              />
            </div>

            {/* Capacity */}
            <div>
              <label className="block text-sm font-semibold text-neutral-700 mb-2">
                Capacity (guests)
              </label>
              <input
                type="number"
                name="capacity"
                value={formData.capacity}
                onChange={handleChange}
                min="1"
                max="10"
                className="w-full px-4 py-2.5 bg-[#FAF8F6] border border-neutral-200 rounded-lg text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-[#A57865] focus:border-[#A57865] transition-all duration-200"
              />
            </div>

            {/* Price */}
            <div>
              <label className="block text-sm font-semibold text-neutral-700 mb-2">
                Price per Night <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 text-sm">{symbol}</span>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  placeholder="120"
                  min="0"
                  step="0.01"
                  required
                  className="w-full pl-8 pr-4 py-2.5 bg-[#FAF8F6] border border-neutral-200 rounded-lg text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#A57865] focus:border-[#A57865] transition-all duration-200"
                />
              </div>
            </div>
          </div>

          {/* Amenities */}
          <div>
            <label className="block text-sm font-semibold text-neutral-700 mb-3">
              Amenities
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {availableAmenities.map(amenity => (
                <label
                  key={amenity}
                  className={`flex items-center px-3 py-2.5 rounded-lg border-2 cursor-pointer transition-all duration-200 hover:bg-neutral-50 ${
                    formData.amenities.includes(amenity)
                      ? 'border-[#A57865] bg-[#A57865]/10'
                      : 'border-neutral-200'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={formData.amenities.includes(amenity)}
                    onChange={() => handleAmenityToggle(amenity)}
                    className="w-4 h-4 text-[#A57865] focus:ring-[#A57865] rounded border-neutral-300"
                  />
                  <span className="ml-2 text-xs font-medium text-neutral-700">{amenity}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Sticky Footer */}
        <div className="fixed bottom-0 right-0 w-full max-w-2xl bg-white border-t border-neutral-200 p-6 z-10">
          <div className="flex items-center gap-3">
            <Button variant="ghost" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSubmit} disabled={isSubmitting} icon={Plus} loading={isSubmitting} className="flex-1">
              {isSubmitting ? 'Creating...' : 'Add Room'}
            </Button>
          </div>
        </div>
      </div>
    </>
  );

  return createPortal(drawerContent, document.body);
}
