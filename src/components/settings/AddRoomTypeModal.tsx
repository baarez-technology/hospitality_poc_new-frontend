import { useState, useRef } from 'react';
import { AlertCircle, Upload, X, Image as ImageIcon, Plus, GripVertical } from 'lucide-react';
import { AMENITIES } from '../../utils/settings';
import { Drawer } from '../ui2/Drawer';
import { Button } from '../ui2/Button';
import { useCurrency } from '@/hooks/useCurrency';

const MAX_IMAGES = 10;
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export default function AddRoomTypeModal({ onClose, onSave }) {
  const { symbol } = useCurrency();
  const fileInputRef = useRef(null);
  const [form, setForm] = useState({
    name: '',
    description: '',
    price: '',
    maxOccupancy: 2,
    amenities: [],
    inclusions: '',
    images: [] as File[]
  });
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

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

  const handleImageChange = (e) => {
    const files: File[] = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const remaining = MAX_IMAGES - form.images.length;
    if (remaining <= 0) {
      setErrors((prev) => ({ ...prev, images: `Maximum ${MAX_IMAGES} images allowed` }));
      return;
    }

    const filesToAdd = files.slice(0, remaining);
    const invalidType = filesToAdd.find(f => !f.type.startsWith('image/'));
    if (invalidType) {
      setErrors((prev) => ({ ...prev, images: `"${invalidType.name}" is not an image file` }));
      return;
    }

    const tooLarge = filesToAdd.find(f => f.size > MAX_FILE_SIZE);
    if (tooLarge) {
      setErrors((prev) => ({ ...prev, images: `"${tooLarge.name}" exceeds 5MB limit` }));
      return;
    }

    setErrors((prev) => ({ ...prev, images: '' }));

    // Generate previews for new files
    filesToAdd.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviews((prev) => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });

    setForm((prev) => ({ ...prev, images: [...prev.images, ...filesToAdd] }));

    // Reset input so the same file can be re-selected
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeImage = (index: number) => {
    setForm((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!form.name.trim()) newErrors.name = 'Room type name is required';
    if (!form.price || parseFloat(form.price) <= 0) newErrors.price = 'Valid price is required';
    if (!form.maxOccupancy || form.maxOccupancy < 1) newErrors.maxOccupancy = 'Valid occupancy is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (!validate()) return;

    const inclusionsList = form.inclusions
      .split(',')
      .map((i) => i.trim())
      .filter((i) => i);

    onSave({
      name: form.name,
      description: form.description,
      price: parseFloat(form.price),
      maxOccupancy: parseInt(form.maxOccupancy),
      amenities: form.amenities,
      inclusions: inclusionsList,
      images: form.images
    });
  };

  const inputClass = (hasError = false) =>
    `w-full h-11 px-4 rounded-lg border text-sm text-neutral-900 placeholder:text-neutral-400 transition-colors ${
      hasError
        ? 'border-rose-300 focus:border-rose-500'
        : 'border-neutral-200 hover:border-neutral-300 focus:border-terra-500 focus:ring-2 focus:ring-terra-500/20'
    } focus:ring-0 focus:outline-none`;

  const labelClass = 'block text-[13px] font-medium text-neutral-600 mb-1.5';

  return (
    <Drawer
      isOpen={true}
      onClose={onClose}
      title="Add Room Type"
      subtitle="Create a new room category"
      maxWidth="max-w-lg"
      footer={
        <div className="flex items-center justify-end gap-3">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmit}>
            Add Room Type
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Name */}
        <div>
          <label className={labelClass}>
            Room Type Name <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => handleChange('name', e.target.value)}
            className={inputClass(!!errors.name)}
            placeholder="e.g., Deluxe Suite"
          />
          {errors.name && (
            <p className="mt-1.5 text-xs text-rose-500 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" />
              {errors.name}
            </p>
          )}
        </div>

        {/* Description */}
        <div>
          <label className={labelClass}>Description</label>
          <textarea
            value={form.description}
            onChange={(e) => handleChange('description', e.target.value)}
            rows={3}
            className="w-full px-4 py-3 rounded-lg border border-neutral-200 text-sm text-neutral-900 placeholder:text-neutral-400 hover:border-neutral-300 focus:border-terra-500 focus:ring-2 focus:ring-terra-500/20 focus:ring-0 focus:outline-none transition-colors resize-none"
            placeholder="Brief description of this room type"
          />
        </div>

        {/* Room Images - Multiple */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-[13px] font-medium text-neutral-600">
              Room Images
            </label>
            <span className="text-[11px] text-neutral-400">
              {form.images.length}/{MAX_IMAGES}
            </span>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageChange}
            className="hidden"
          />

          {/* Image Grid */}
          {imagePreviews.length > 0 && (
            <div className="grid grid-cols-3 gap-2 mb-2">
              {imagePreviews.map((preview, index) => (
                <div
                  key={index}
                  className="relative group rounded-lg overflow-hidden border border-neutral-200 bg-neutral-50 aspect-[4/3]"
                >
                  <img
                    src={preview}
                    alt={`Room image ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  {/* First image badge */}
                  {index === 0 && (
                    <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 text-[9px] font-semibold bg-terra-500 text-white rounded">
                      Cover
                    </span>
                  )}
                  {/* Remove button */}
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-1.5 right-1.5 p-1 rounded-full bg-neutral-900/70 hover:bg-neutral-900/90 text-white transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <X className="w-3 h-3" />
                  </button>
                  {/* File name overlay */}
                  <div className="absolute bottom-0 left-0 right-0 px-2 py-1 bg-gradient-to-t from-neutral-900/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                    <p className="text-[9px] text-white truncate">{form.images[index]?.name}</p>
                  </div>
                </div>
              ))}

              {/* Add more button (inside grid) */}
              {form.images.length < MAX_IMAGES && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="rounded-lg border-2 border-dashed border-neutral-200 hover:border-terra-300 bg-neutral-50 hover:bg-terra-50/30 transition-colors flex flex-col items-center justify-center gap-1 aspect-[4/3] group"
                >
                  <Plus className="w-5 h-5 text-neutral-400 group-hover:text-terra-500 transition-colors" />
                  <span className="text-[10px] font-medium text-neutral-400 group-hover:text-terra-500 transition-colors">
                    Add More
                  </span>
                </button>
              )}
            </div>
          )}

          {/* Empty state upload zone */}
          {imagePreviews.length === 0 && (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full h-40 rounded-lg border-2 border-dashed border-neutral-200 hover:border-terra-300 bg-neutral-50 hover:bg-terra-50/30 transition-colors flex flex-col items-center justify-center gap-2 group"
            >
              <div className="w-12 h-12 rounded-full bg-neutral-100 group-hover:bg-terra-100 flex items-center justify-center transition-colors">
                <ImageIcon className="w-6 h-6 text-neutral-400 group-hover:text-terra-500 transition-colors" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-neutral-700 group-hover:text-terra-600 transition-colors">
                  Click to upload images
                </p>
                <p className="text-xs text-neutral-400 mt-0.5">
                  PNG, JPG up to 5MB each &middot; Max {MAX_IMAGES} images
                </p>
              </div>
            </button>
          )}

          {errors.images && (
            <p className="mt-1.5 text-xs text-rose-500 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" />
              {errors.images}
            </p>
          )}
        </div>

        {/* Price & Occupancy */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>
              Price per Night ({symbol}) <span className="text-rose-500">*</span>
            </label>
            <input
              type="number"
              value={form.price}
              onChange={(e) => handleChange('price', e.target.value)}
              min="0"
              className={inputClass(!!errors.price)}
              placeholder="8500"
            />
            {errors.price && (
              <p className="mt-1.5 text-xs text-rose-500 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                {errors.price}
              </p>
            )}
          </div>

          <div>
            <label className={labelClass}>
              Max Occupancy <span className="text-rose-500">*</span>
            </label>
            <input
              type="number"
              value={form.maxOccupancy}
              onChange={(e) => handleChange('maxOccupancy', e.target.value)}
              min="1"
              max="10"
              className={inputClass(!!errors.maxOccupancy)}
            />
            {errors.maxOccupancy && (
              <p className="mt-1.5 text-xs text-rose-500 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                {errors.maxOccupancy}
              </p>
            )}
          </div>
        </div>

        {/* Amenities */}
        <div>
          <label className={labelClass}>Amenities</label>
          <div className="grid grid-cols-3 gap-2">
            {AMENITIES.map((amenity) => (
              <button
                key={amenity.id}
                type="button"
                onClick={() => toggleAmenity(amenity.id)}
                className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                  form.amenities.includes(amenity.id)
                    ? 'bg-terra-500 text-white'
                    : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                }`}
              >
                {amenity.label}
              </button>
            ))}
          </div>
        </div>

        {/* Inclusions */}
        <div>
          <label className={labelClass}>Inclusions (comma-separated)</label>
          <input
            type="text"
            value={form.inclusions}
            onChange={(e) => handleChange('inclusions', e.target.value)}
            className={inputClass()}
            placeholder="Breakfast, Wi-Fi, Welcome Drink"
          />
          <p className="mt-1.5 text-xs text-neutral-400">
            Enter each inclusion separated by commas
          </p>
        </div>
      </form>
    </Drawer>
  );
}
