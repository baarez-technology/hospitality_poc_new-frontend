import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Save, Bed, Users, DollarSign, MapPin, Tag } from 'lucide-react';
import { Button } from '../../../ui2/Button';

export default function EditRoomModal({ room, isOpen, onClose, onSave }) {
  const [formData, setFormData] = useState({
    roomNumber: '',
    type: 'Minimalist Studio',
    floor: '1',
    bedType: 'Queen',
    capacity: '2',
    price: '',
    amenities: [],
    description: ''
  });

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
  const bedTypes = ['Single', 'Double', 'Queen', 'King', 'Twin', 'King + Sofa Bed', 'King + 2 Queens'];
  const availableAmenities = [
    'WiFi', 'TV', 'Air Conditioning', 'Mini Fridge', 'Safe', 'Coffee Maker',
    'Balcony', 'Ocean View', 'City View', 'Garden View', 'Jacuzzi',
    'Living Room', 'Kitchenette', 'Work Desk', 'Penthouse'
  ];

  useEffect(() => {
    if (!isOpen || !room) return;

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

    if (mainContent) {
      mainContent.style.overflow = 'hidden';
    }

    // Populate form with room data
    setFormData({
      roomNumber: room.roomNumber || '',
      type: room.type || 'Standard',
      floor: String(room.floor || 1),
      bedType: room.bedType || 'Queen',
      capacity: String(room.capacity || 2),
      price: String(room.price || ''),
      amenities: room.amenities || [],
      description: room.description || ''
    });

    document.addEventListener('keydown', handleEsc);

    return () => {
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.left = '';
      document.body.style.width = '';
      document.body.style.overflow = '';

      if (mainContent) {
        mainContent.style.overflow = '';
      }

      window.scrollTo(scrollX, scrollY);
      document.removeEventListener('keydown', handleEsc);
    };
  }, [isOpen, onClose, room]);

  if (!isOpen || !room) return null;

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

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validation
    if (!formData.roomNumber || !formData.price) {
      alert('Please fill in all required fields');
      return;
    }

    // Create updated room object
    const updatedRoom = {
      ...room,
      roomNumber: formData.roomNumber,
      type: formData.type,
      floor: parseInt(formData.floor),
      bedType: formData.bedType,
      capacity: parseInt(formData.capacity),
      price: parseFloat(formData.price),
      amenities: formData.amenities,
      description: formData.description
    };

    onSave(room.id, updatedRoom);
    onClose();
  };

  const modalContent = (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed top-0 bottom-0 right-0 h-screen w-full max-w-2xl bg-white shadow-xl border-l border-neutral-200 z-50 overflow-y-auto custom-scrollbar animate-slideInRight">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-neutral-200 z-10">
          <div className="p-6 pb-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-[#5C9BA4]/10 rounded-xl flex items-center justify-center">
                  <Bed className="w-6 h-6 text-[#5C9BA4]" />
                </div>
                <div>
                  <h2 className="text-2xl font-serif font-bold text-neutral-900">Edit Room</h2>
                  <p className="text-sm text-neutral-500 mt-1">
                    Room {room.roomNumber} • {room.type}
                  </p>
                </div>
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
        <form onSubmit={handleSubmit} className="p-6 pb-32 space-y-6">
          {/* Basic Info Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-1 h-4 bg-[#A57865] rounded-full"></div>
              <h3 className="text-xs font-bold text-neutral-900 uppercase tracking-wider">
                Basic Information
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Room Number */}
              <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-2">
                  Room Number <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                  <input
                    type="text"
                    name="roomNumber"
                    value={formData.roomNumber}
                    onChange={handleChange}
                    placeholder="e.g., 101"
                    required
                    className="w-full pl-10 pr-4 py-2.5 bg-[#FAF8F6] border border-neutral-200 rounded-lg text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#5C9BA4] focus:border-[#5C9BA4] transition-all duration-200"
                  />
                </div>
              </div>

              {/* Room Type */}
              <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-2">
                  Room Type
                </label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-[#FAF8F6] border border-neutral-200 rounded-lg text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-[#5C9BA4] focus:border-[#5C9BA4] transition-all duration-200 cursor-pointer"
                >
                  {roomTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
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
                  className="w-full px-4 py-2.5 bg-[#FAF8F6] border border-neutral-200 rounded-lg text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-[#5C9BA4] focus:border-[#5C9BA4] transition-all duration-200"
                />
              </div>

              {/* Bed Type */}
              <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-2">
                  Bed Type
                </label>
                <select
                  name="bedType"
                  value={formData.bedType}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-[#FAF8F6] border border-neutral-200 rounded-lg text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-[#5C9BA4] focus:border-[#5C9BA4] transition-all duration-200 cursor-pointer"
                >
                  {bedTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Capacity & Pricing Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-1 h-4 bg-[#4E5840] rounded-full"></div>
              <h3 className="text-xs font-bold text-neutral-900 uppercase tracking-wider">
                Capacity & Pricing
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Capacity */}
              <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-2">
                  Capacity (guests)
                </label>
                <div className="relative">
                  <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                  <input
                    type="number"
                    name="capacity"
                    value={formData.capacity}
                    onChange={handleChange}
                    min="1"
                    max="10"
                    className="w-full pl-10 pr-4 py-2.5 bg-[#FAF8F6] border border-neutral-200 rounded-lg text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-[#5C9BA4] focus:border-[#5C9BA4] transition-all duration-200"
                  />
                </div>
              </div>

              {/* Price */}
              <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-2">
                  Price per Night <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    placeholder="120"
                    min="0"
                    step="0.01"
                    required
                    className="w-full pl-10 pr-4 py-2.5 bg-[#FAF8F6] border border-neutral-200 rounded-lg text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#5C9BA4] focus:border-[#5C9BA4] transition-all duration-200"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-1 h-4 bg-[#CDB261] rounded-full"></div>
              <h3 className="text-xs font-bold text-neutral-900 uppercase tracking-wider">
                Description
              </h3>
            </div>

            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              placeholder="Enter room description..."
              className="w-full px-4 py-3 bg-[#FAF8F6] border border-neutral-200 rounded-lg text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#5C9BA4] focus:border-[#5C9BA4] transition-all duration-200 resize-none"
            />
          </div>

          {/* Amenities */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-1 h-4 bg-[#5C9BA4] rounded-full"></div>
              <h3 className="text-xs font-bold text-neutral-900 uppercase tracking-wider">
                Amenities
              </h3>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {availableAmenities.map(amenity => (
                <label
                  key={amenity}
                  className={`flex items-center px-3 py-2.5 rounded-lg border-2 cursor-pointer transition-all duration-200 hover:bg-neutral-50 ${
                    formData.amenities.includes(amenity)
                      ? 'border-[#5C9BA4] bg-[#5C9BA4]/10'
                      : 'border-neutral-200'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={formData.amenities.includes(amenity)}
                    onChange={() => handleAmenityToggle(amenity)}
                    className="w-4 h-4 text-[#5C9BA4] focus:ring-[#5C9BA4] rounded border-neutral-300"
                  />
                  <span className="ml-2 text-xs font-medium text-neutral-700">{amenity}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Current Status Info */}
          <div className="bg-[#FAF8F6] rounded-xl p-4 border border-neutral-200">
            <div className="flex items-center gap-2 mb-3">
              <Tag className="w-4 h-4 text-neutral-500" />
              <span className="text-xs font-semibold text-neutral-600 uppercase tracking-wider">Current Status</span>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <div>
                <span className="text-neutral-500">Status:</span>
                <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-medium ${
                  room.status === 'available' ? 'bg-[#4E5840]/10 text-[#4E5840]' :
                  room.status === 'occupied' ? 'bg-[#A57865]/10 text-[#A57865]' :
                  room.status === 'dirty' ? 'bg-orange-100 text-orange-700' :
                  'bg-red-100 text-red-700'
                }`}>
                  {room.status === 'out_of_service' ? 'Out of Service' : room.status?.charAt(0).toUpperCase() + room.status?.slice(1)}
                </span>
              </div>
              <div>
                <span className="text-neutral-500">Cleaning:</span>
                <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-medium ${
                  room.cleaning === 'clean' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                }`}>
                  {room.cleaning?.charAt(0).toUpperCase() + room.cleaning?.slice(1)}
                </span>
              </div>
            </div>
          </div>
        </form>

        {/* Sticky Footer */}
        <div className="fixed bottom-0 right-0 w-full max-w-2xl bg-white border-t border-neutral-200 p-6 z-10">
          <div className="flex items-center gap-3">
            <Button variant="ghost" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSubmit} icon={Save} className="flex-1">
              Save Changes
            </Button>
          </div>
        </div>
      </div>
    </>
  );

  return createPortal(modalContent, document.body);
}
