import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, BedDouble, AlertCircle, Save } from 'lucide-react';
import { AMENITIES } from '@/utils/admin/settings';
import { Button } from '../../ui2/Button';

export default function EditRoomTypeModal({ room, onClose, onSave }) {
  const [form, setForm] = useState({
    name: '',
    description: '',
    price: '',
    maxOccupancy: 2,
    amenities: [],
    inclusions: ''
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (room) {
      setForm({
        name: room.name,
        description: room.description || '',
        price: room.price.toString(),
        maxOccupancy: room.maxOccupancy,
        amenities: room.amenities || [],
        inclusions: room.inclusions?.join(', ') || ''
      });
    }
  }, [room]);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const toggleAmenity = (amenityId) => {
    setForm((prev) => ({
      ...prev,
      amenities: prev.amenities.includes(amenityId)
        ? prev.amenities.filter((a) => a !== amenityId)
        : [...prev.amenities, amenityId]
    }));
  };

  const validate = () => {
    const newErrors = {};
    if (!form.name.trim()) newErrors.name = 'Room type name is required';
    if (!form.price || parseFloat(form.price) <= 0) newErrors.price = 'Valid price is required';
    if (!form.maxOccupancy || form.maxOccupancy < 1) newErrors.maxOccupancy = 'Valid occupancy is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    const inclusionsList = form.inclusions
      .split(',')
      .map((i) => i.trim())
      .filter((i) => i);

    onSave({
      ...room,
      name: form.name,
      description: form.description,
      price: parseFloat(form.price),
      maxOccupancy: parseInt(form.maxOccupancy),
      amenities: form.amenities,
      inclusions: inclusionsList
    });
  };

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[calc(100vh-2rem)] sm:max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-[#E5E5E5] flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#5C9BA4]/10 flex items-center justify-center">
              <BedDouble className="w-5 h-5 text-[#5C9BA4]" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-neutral-900">Edit Room Type</h2>
              <p className="text-sm text-neutral-500">Update room category details</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-neutral-100 text-neutral-500 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 overflow-y-auto flex-1">
          <div className="space-y-6">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Room Type Name *
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => handleChange('name', e.target.value)}
                className={`w-full px-4 py-3 rounded-lg border ${
                  errors.name ? 'border-red-400' : 'border-[#E5E5E5]'
                } focus:outline-none focus:ring-2 focus:ring-[#A57865]/20 focus:border-[#A57865]`}
                placeholder="e.g., Deluxe Suite"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.name}
                </p>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Description
              </label>
              <textarea
                value={form.description}
                onChange={(e) => handleChange('description', e.target.value)}
                rows={3}
                className="w-full px-4 py-3 rounded-lg border border-[#E5E5E5] focus:outline-none focus:ring-2 focus:ring-[#A57865]/20 focus:border-[#A57865] resize-none"
                placeholder="Brief description of this room type"
              />
            </div>

            {/* Price & Occupancy */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Price per Night ($) *
                </label>
                <input
                  type="number"
                  value={form.price}
                  onChange={(e) => handleChange('price', e.target.value)}
                  min="0"
                  className={`w-full px-4 py-3 rounded-lg border ${
                    errors.price ? 'border-red-400' : 'border-[#E5E5E5]'
                  } focus:outline-none focus:ring-2 focus:ring-[#A57865]/20 focus:border-[#A57865]`}
                  placeholder="8500"
                />
                {errors.price && (
                  <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.price}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Max Occupancy *
                </label>
                <input
                  type="number"
                  value={form.maxOccupancy}
                  onChange={(e) => handleChange('maxOccupancy', e.target.value)}
                  min="1"
                  max="10"
                  className={`w-full px-4 py-3 rounded-lg border ${
                    errors.maxOccupancy ? 'border-red-400' : 'border-[#E5E5E5]'
                  } focus:outline-none focus:ring-2 focus:ring-[#A57865]/20 focus:border-[#A57865]`}
                />
                {errors.maxOccupancy && (
                  <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.maxOccupancy}
                  </p>
                )}
              </div>
            </div>

            {/* Amenities */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Amenities
              </label>
              <div className="grid grid-cols-3 gap-2">
                {AMENITIES.map((amenity) => (
                  <button
                    key={amenity.id}
                    type="button"
                    onClick={() => toggleAmenity(amenity.id)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      form.amenities.includes(amenity.id)
                        ? 'bg-[#5C9BA4] text-white'
                        : 'bg-[#FAF7F4] text-neutral-600 hover:bg-[#5C9BA4]/10'
                    }`}
                  >
                    {amenity.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Inclusions */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Inclusions (comma-separated)
              </label>
              <input
                type="text"
                value={form.inclusions}
                onChange={(e) => handleChange('inclusions', e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-[#E5E5E5] focus:outline-none focus:ring-2 focus:ring-[#A57865]/20 focus:border-[#A57865]"
                placeholder="Breakfast, Wi-Fi, Welcome Drink"
              />
              <p className="mt-1 text-xs text-neutral-400">
                Enter each inclusion separated by commas
              </p>
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-4 sm:p-6 border-t border-[#E5E5E5] bg-[#FAF7F4] flex-shrink-0">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmit} icon={Save}>
            Save Changes
          </Button>
        </div>
      </div>
    </div>,
    document.body
  );
}
