import { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { X, User, Calendar, Bed, DollarSign, Globe, Plus } from 'lucide-react';
import {
  SOURCE_OPTIONS,
  calculateNights,
  generateBookingId,
} from '@/utils/admin/bookings';
import { SimpleDropdown } from '@/components/ui/Select';
import { useCurrency } from '@/hooks/useCurrency';
import { Button } from '../../ui2/Button';
import { roomTypesService } from '@/api/services/roomTypes.service';
import { useDynamicPricing } from '@/hooks/useDynamicPricing';
import { getTaxRate } from '@/utils/pricing-sst';

export default function AddBookingModal({ isOpen, onClose, onSubmit }) {
  const { formatCurrency } = useCurrency();

  // Fetch room types from API instead of using hardcoded ROOM_TYPES
  const [apiRoomTypes, setApiRoomTypes] = useState<Array<{ value: string; label: string; price: number }>>([]);
  useEffect(() => {
    if (!isOpen) return;
    roomTypesService.getRoomTypes().then((rooms) => {
      if (Array.isArray(rooms) && rooms.length > 0) {
        setApiRoomTypes(rooms.map((r: any) => ({
          value: r.name || r.slug,
          label: r.name,
          price: r.price || r.base_price || r.basePrice || 0,
        })));
      }
    }).catch(() => {});
  }, [isOpen]);

  const [formData, setFormData] = useState({
    guestName: '',
    email: '',
    phone: '',
    nationality: '',
    checkIn: '',
    checkOut: '',
    roomType: '',
    adults: 1,
    children: 0,
    specialRequests: '',
    source: 'Website',
    rateOverride: '',
  });

  const [errors, setErrors] = useState({});

  // Dynamic pricing for selected dates
  const { ratesByRoomType } = useDynamicPricing(
    formData.checkIn || undefined,
    formData.checkOut || undefined,
    isOpen && !!formData.checkIn
  );

  // Room types with dynamic pricing applied
  const roomTypesWithPricing = useMemo(() => {
    if (apiRoomTypes.length === 0) return [];
    return apiRoomTypes.map((rt) => {
      const dynamicRate = ratesByRoomType[rt.label] ?? ratesByRoomType[rt.value];
      return {
        ...rt,
        price: dynamicRate ?? rt.price,
        basePrice: rt.price,
      };
    });
  }, [apiRoomTypes, ratesByRoomType]);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setFormData({
        guestName: '',
        email: '',
        phone: '',
        nationality: '',
        checkIn: '',
        checkOut: '',
        roomType: '',
        adults: 1,
        children: 0,
        specialRequests: '',
        source: 'Website',
        rateOverride: '',
      });
      setErrors({});
    }
  }, [isOpen]);

  // Auto-select first room type when API data loads
  useEffect(() => {
    if (apiRoomTypes.length > 0 && !formData.roomType) {
      setFormData((prev) => ({ ...prev, roomType: apiRoomTypes[0].value }));
    }
  }, [apiRoomTypes]);

  // Handle ESC key
  useEffect(() => {
    if (!isOpen) return;
    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Calculate booking details using dynamic pricing
  const bookingCalc = useMemo(() => {
    const nights = calculateNights(formData.checkIn, formData.checkOut);
    const roomTypeConfig = roomTypesWithPricing.find(r => r.value === formData.roomType);
    const effectiveRate = roomTypeConfig?.price || 0;
    const baseRate = formData.rateOverride ? parseFloat(formData.rateOverride) : effectiveRate;

    const subtotal = baseRate * nights;
    // GST slab: Use centralized pricing-sst for tax rate
    const { rate: taxRate } = getTaxRate(baseRate);
    const taxes = subtotal * taxRate;
    const total = Math.round(subtotal + taxes);

    return { nights, baseRate, subtotal, taxes, total, taxRate };
  }, [formData.checkIn, formData.checkOut, formData.roomType, formData.rateOverride, roomTypesWithPricing]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.guestName.trim()) {
      newErrors.guestName = 'Guest name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    if (formData.phone && !/^\d{10}$/.test(formData.phone)) {
      newErrors.phone = 'Phone number must be exactly 10 digits';
    }

    if (!formData.checkIn) {
      newErrors.checkIn = 'Check-in date is required';
    }

    if (!formData.checkOut) {
      newErrors.checkOut = 'Check-out date is required';
    }

    if (formData.checkIn && formData.checkOut) {
      const checkInDate = new Date(formData.checkIn);
      const checkOutDate = new Date(formData.checkOut);
      // Allow same-day bookings (check-out on same day as check-in)
      if (checkOutDate < checkInDate) {
        newErrors.checkOut = 'Check-out cannot be before check-in';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      const bookingData = {
        id: generateBookingId(),
        guest: formData.guestName.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        nationality: formData.nationality.trim(),
        checkIn: formData.checkIn,
        checkOut: formData.checkOut,
        nights: bookingCalc.nights,
        roomType: formData.roomType,
        room: '',
        guests: formData.adults + formData.children,
        adults: formData.adults,
        children: formData.children,
        specialRequests: formData.specialRequests.trim(),
        source: formData.source,
        amount: bookingCalc.total,
        status: 'PENDING',
        bookedOn: new Date().toISOString().split('T')[0],
        vip: false,
        upsells: [],
      };
      onSubmit(bookingData);
      onClose();
    }
  };

  if (!isOpen) return null;

  const modalContent = (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-neutral-900/30 backdrop-blur-sm z-40"
        onClick={onClose}
      />

      {/* Side Drawer */}
      <div
        className={`fixed top-0 bottom-0 right-0 h-screen w-full max-w-[700px] bg-white shadow-xl border-l border-neutral-200 z-50 transform transition-transform duration-300 ease-out flex flex-col ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex-shrink-0 bg-white border-b border-neutral-200 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-serif font-bold text-neutral-900">
              New Booking
            </h2>
            <p className="text-sm text-neutral-600 mt-1">
              Create a new reservation
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-neutral-100 rounded-lg transition-all duration-200 hover:scale-110 active:scale-95 focus:outline-none focus:ring-2 focus:ring-[#A57865]"
          >
            <X className="w-5 h-5 text-neutral-600 hover:text-neutral-900 transition-colors" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar min-h-0">
          <form id="booking-form" onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Guest Information */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-neutral-200">
                <User className="w-4 h-4 text-[#A57865]" />
                <h3 className="font-bold text-neutral-900">Guest Information</h3>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Guest Name *
                </label>
                <input
                  type="text"
                  name="guestName"
                  value={formData.guestName}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 bg-[#FAF8F6] border ${
                    errors.guestName ? 'border-red-300 focus:ring-red-500' : 'border-neutral-200'
                  } rounded-xl hover:border-neutral-300 hover:bg-white focus:outline-none focus:ring-2 focus:ring-[#A57865] focus:ring-offset-2 focus:bg-white transition-all duration-200`}
                  placeholder="John Doe"
                />
                {errors.guestName && (
                  <p className="mt-1.5 text-xs text-red-600 font-medium">{errors.guestName}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 bg-[#FAF8F6] border ${
                      errors.email ? 'border-red-300 focus:ring-red-500' : 'border-neutral-200'
                    } rounded-xl hover:border-neutral-300 hover:bg-white focus:outline-none focus:ring-2 focus:ring-[#A57865] focus:ring-offset-2 focus:bg-white transition-all duration-200`}
                    placeholder="john@example.com"
                  />
                  {errors.email && (
                    <p className="mt-1.5 text-xs text-red-600 font-medium">{errors.email}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Phone
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={(e) => {
                      // Only allow digits and limit to 10 characters
                      const value = e.target.value.replace(/\D/g, '').slice(0, 10);
                      setFormData((prev) => ({ ...prev, phone: value }));
                      if (errors.phone) {
                        setErrors((prev) => ({ ...prev, phone: null }));
                      }
                    }}
                    className={`w-full px-4 py-3 bg-[#FAF8F6] border ${
                      errors.phone ? 'border-red-300 focus:ring-red-500' : 'border-neutral-200'
                    } rounded-xl hover:border-neutral-300 hover:bg-white focus:outline-none focus:ring-2 focus:ring-[#A57865] focus:ring-offset-2 focus:bg-white transition-all duration-200`}
                    placeholder="9876543210"
                  />
                  {errors.phone && (
                    <p className="mt-1.5 text-xs text-red-600 font-medium">{errors.phone}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Nationality
                </label>
                <input
                  type="text"
                  name="nationality"
                  value={formData.nationality}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-[#FAF8F6] border border-neutral-200 rounded-xl hover:border-neutral-300 hover:bg-white focus:outline-none focus:ring-2 focus:ring-[#A57865] focus:ring-offset-2 focus:bg-white transition-all duration-200"
                  placeholder="United States"
                />
              </div>
            </div>

            {/* Stay Details */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-neutral-200">
                <Calendar className="w-4 h-4 text-[#A57865]" />
                <h3 className="font-bold text-neutral-900">Stay Details</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Check-in Date *
                  </label>
                  <input
                    type="date"
                    name="checkIn"
                    value={formData.checkIn}
                    onChange={handleChange}
                    min={new Date().toISOString().split('T')[0]}
                    className={`w-full px-4 py-3 bg-[#FAF8F6] border ${
                      errors.checkIn ? 'border-red-300 focus:ring-red-500' : 'border-neutral-200'
                    } rounded-xl hover:border-neutral-300 hover:bg-white focus:outline-none focus:ring-2 focus:ring-[#A57865] focus:ring-offset-2 focus:bg-white transition-all duration-200`}
                  />
                  {errors.checkIn && (
                    <p className="mt-1.5 text-xs text-red-600 font-medium">{errors.checkIn}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Check-out Date *
                  </label>
                  <input
                    type="date"
                    name="checkOut"
                    value={formData.checkOut}
                    onChange={handleChange}
                    min={formData.checkIn || new Date().toISOString().split('T')[0]}
                    className={`w-full px-4 py-3 bg-[#FAF8F6] border ${
                      errors.checkOut ? 'border-red-300 focus:ring-red-500' : 'border-neutral-200'
                    } rounded-xl hover:border-neutral-300 hover:bg-white focus:outline-none focus:ring-2 focus:ring-[#A57865] focus:ring-offset-2 focus:bg-white transition-all duration-200`}
                  />
                  {errors.checkOut && (
                    <p className="mt-1.5 text-xs text-red-600 font-medium">{errors.checkOut}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Adults
                  </label>
                  <input
                    type="number"
                    name="adults"
                    value={formData.adults}
                    onChange={handleChange}
                    min="1"
                    max="4"
                    className="w-full px-4 py-3 bg-[#FAF8F6] border border-neutral-200 rounded-xl hover:border-neutral-300 hover:bg-white focus:outline-none focus:ring-2 focus:ring-[#A57865] focus:ring-offset-2 focus:bg-white transition-all duration-200"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Children
                  </label>
                  <input
                    type="number"
                    name="children"
                    value={formData.children}
                    onChange={handleChange}
                    min="0"
                    max="3"
                    className="w-full px-4 py-3 bg-[#FAF8F6] border border-neutral-200 rounded-xl hover:border-neutral-300 hover:bg-white focus:outline-none focus:ring-2 focus:ring-[#A57865] focus:ring-offset-2 focus:bg-white transition-all duration-200"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Nights
                  </label>
                  <div className="px-4 py-3 bg-neutral-100 border border-neutral-200 rounded-xl text-neutral-700 font-semibold">
                    {bookingCalc.nights || '-'}
                  </div>
                </div>
              </div>
            </div>

            {/* Room & Source */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-neutral-200">
                <Bed className="w-4 h-4 text-[#A57865]" />
                <h3 className="font-bold text-neutral-900">Room & Source</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Room Type
                  </label>
                  <SimpleDropdown
                    value={formData.roomType}
                    onChange={(value) => setFormData((prev) => ({ ...prev, roomType: value }))}
                    options={roomTypesWithPricing.map((type) => ({
                      value: type.value,
                      label: `${type.label} - ${formatCurrency(type.price)}/night`
                    }))}
                    placeholder="Select Room Type"
                  />
                </div>

                {/* Booking Source - Auto-set to Direct for in-hotel bookings */}
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Special Requests
                </label>
                <textarea
                  name="specialRequests"
                  value={formData.specialRequests}
                  onChange={handleChange}
                  rows="3"
                  className="w-full px-4 py-3 bg-[#FAF8F6] border border-neutral-200 rounded-xl hover:border-neutral-300 hover:bg-white focus:outline-none focus:ring-2 focus:ring-[#A57865] focus:ring-offset-2 focus:bg-white transition-all duration-200 resize-none"
                  placeholder="Any special requirements or preferences..."
                />
              </div>
            </div>

            {/* Payment Summary */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-neutral-200">
                <DollarSign className="w-4 h-4 text-[#A57865]" />
                <h3 className="font-bold text-neutral-900">Payment</h3>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Rate per Night (Optional Override)
                </label>
                <input
                  type="number"
                  name="rateOverride"
                  value={formData.rateOverride}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  placeholder={`Default: ${formatCurrency(roomTypesWithPricing.find(r => r.value === formData.roomType)?.price || 0)}`}
                  className="w-full px-4 py-3 bg-[#FAF8F6] border border-neutral-200 rounded-xl hover:border-neutral-300 hover:bg-white focus:outline-none focus:ring-2 focus:ring-[#A57865] focus:ring-offset-2 focus:bg-white transition-all duration-200"
                />
              </div>

              {bookingCalc.nights > 0 && (
                <div className="p-4 bg-gradient-to-br from-[#A57865]/10 to-[#A57865]/5 rounded-xl border border-[#A57865]/20">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-neutral-600">
                        {formatCurrency(bookingCalc.baseRate)} x {bookingCalc.nights} night{bookingCalc.nights > 1 ? 's' : ''}
                      </span>
                      <span className="text-neutral-700">{formatCurrency(bookingCalc.subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-neutral-600">Taxes ({Math.round(bookingCalc.taxRate * 100)}%)</span>
                      <span className="text-neutral-700">{formatCurrency(bookingCalc.taxes)}</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-[#A57865]/20">
                      <span className="font-semibold text-neutral-900">Total</span>
                      <span className="font-bold text-lg text-[#A57865]">{formatCurrency(bookingCalc.total)}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </form>
        </div>

        {/* Actions Footer - Sticky */}
        <div className="flex-shrink-0 bg-white border-t border-neutral-200 px-6 py-4 flex items-center justify-end gap-3 shadow-lg">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" form="booking-form" icon={Plus}>
            Create Booking
          </Button>
        </div>
      </div>
    </>
  );

  return createPortal(modalContent, document.body);
}
