/**
 * NewBookingDrawer Component
 * Premium Hotel Booking Flow - Glimmora Design System v4.0
 * Side drawer with refined luxury aesthetic
 */

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  User, Calendar, Bed, Crown, Check, Users, AlertCircle,
  Sparkles, Globe, Mail, Phone, X, ChevronRight,
  Building, Building2, Wifi, Coffee, Car, ChevronLeft,
  ExternalLink, Star, Award, Layers
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Drawer } from '../ui2/Drawer';
import { Input, FormField, Select, Textarea } from '../ui2/Input';
import { Button } from '../ui2/Button';
import DatePicker from '../ui2/DatePicker';
import { bookingApi } from '@/api/services/booking.service';
import { multiRoomService, type RoomRequest } from '@/api/services/multi-room.service';
import MultiRoomSelector, { type RoomType } from '../cbs/MultiRoomSelector';
import { apiClient } from '@/api/client';
import { getTaxRate } from '@/utils/pricing-sst';

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
const sources = [
  { id: 'Direct', label: 'Direct', icon: Building },
  { id: 'Booking.com', label: 'Booking.com', icon: Globe },
  { id: 'Expedia', label: 'Expedia', icon: Globe },
  { id: 'Hotels.com', label: 'Hotels.com', icon: Globe },
  { id: 'Corporate Portal', label: 'Corporate', icon: Building },
];

export default function AddBookingModal({
  isOpen,
  onClose,
  onSubmit,
  availableRooms = [],
  getRateForBooking
}) {
  const { formatCurrency } = useCurrency();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    guestName: '',
    guestEmail: '',
    guestPhone: '',
    isVip: false,
    checkIn: '',
    checkOut: '',
    nights: 0,
    ratePlan: '',  // Will be set from API
    roomType: 'Minimalist Studio',
    adults: 2,
    children: 0,
    source: 'Direct',
    specialRequests: '',
    selectedRoom: null,
    amount: 0,
    gstNumber: ''
  });

  const [errors, setErrors] = useState({});
  const [filteredRooms, setFilteredRooms] = useState([]);
  const [ratePlansData, setRatePlansData] = useState<any[]>([]);
  const [calculatedRate, setCalculatedRate] = useState<number | null>(null);

  // Derive rate plan options for dropdown with discount info
  const ratePlanOptions = useMemo(() => {
    return ratePlansData.map(p => {
      let discountLabel = '';
      if (p.discount_type === 'percentage' && p.discount_value > 0) {
        discountLabel = ` (${p.discount_value}% off)`;
      } else if (p.discount_type === 'flat' && p.discount_value > 0) {
        discountLabel = ` (₹${p.discount_value} off)`;
      } else if (p.discount_type === 'fixed' && p.discount_value > 0) {
        discountLabel = ` (₹${p.discount_value} fixed)`;
      }
      return {
        value: p.name || p.code,  // Use name as value for API calls
        label: `${p.name || p.code}${discountLabel}`,  // Show discount in label
      };
    });
  }, [ratePlansData]);

  // Fetch rate plans from API
  useEffect(() => {
    const fetchRatePlans = async () => {
      try {
        const response = await apiClient.get('/api/v1/rates/plans');
        const plans = response.data || [];
        setRatePlansData(plans.length > 0 ? plans : []);
      } catch (err) {
        console.error('Failed to fetch rate plans:', err);
        setRatePlansData([]);
      }
    };
    fetchRatePlans();
  }, []);

  // Extract current room price to avoid infinite loop from availableRooms reference
  const currentRoomPrice = useMemo(() => {
    const roomsOfType = availableRooms.filter(r => r.type === formData.roomType);
    return roomsOfType.length > 0 ? (roomsOfType[0]?.pricePerNight || roomsOfType[0]?.price || 0) : 0;
  }, [availableRooms, formData.roomType]);

  // Calculate rate from backend when rate plan, dates, or room type changes
  useEffect(() => {
    if (!formData.ratePlan || !formData.checkIn || !formData.checkOut || !formData.roomType) {
      setCalculatedRate(null);
      return;
    }

    // Skip if room price is not yet loaded
    if (currentRoomPrice <= 0) {
      return;
    }

    let cancelled = false;
    apiClient.get('/api/v1/rates/calculate', {
      params: {
        rate_plan: formData.ratePlan,
        arrival_date: formData.checkIn,
        departure_date: formData.checkOut,
        room_type: formData.roomType,
        base_price: currentRoomPrice,  // Pass room price for discount calculation
      }
    }).then((res) => {
      if (cancelled) return;
      const data = res.data || {};
      if (data.rate_per_night != null && data.rate_per_night > 0) {
        setCalculatedRate(Math.round(data.rate_per_night));
      } else {
        setCalculatedRate(null);
      }
    }).catch((err) => {
      if (!cancelled) {
        console.warn('Rate calculation failed:', err);
        setCalculatedRate(null);
      }
    });

    return () => { cancelled = true; };
  }, [formData.ratePlan, formData.checkIn, formData.checkOut, formData.roomType, currentRoomPrice]);

  // Set default rate plan when rate plans are loaded
  useEffect(() => {
    if (ratePlanOptions.length > 0 && !formData.ratePlan) {
      setFormData(prev => ({ ...prev, ratePlan: ratePlanOptions[0].value }));
    }
  }, [ratePlanOptions, formData.ratePlan]);

  // Multi-room booking state
  const [isMultiRoom, setIsMultiRoom] = useState(false);
  const [selectedRooms, setSelectedRooms] = useState<RoomRequest[]>([]);

  // Convert available rooms to RoomType format for MultiRoomSelector
  const roomTypesForSelector: RoomType[] = roomTypes.map((name, index) => {
    // Find rooms of this type to get base price
    const roomsOfType = availableRooms.filter(r => r.type === name);
    const basePrice = roomsOfType.length > 0 ? roomsOfType[0]?.price || 0 : 0;
    return {
      id: index + 1,
      name,
      basePrice,
      maxGuests: 4,
      available: roomsOfType.filter(r => r.cleaning === 'clean').length,
    };
  });

  // ── Guest email lookup state ─────────────────────────────────────
  const [matchedGuestId, setMatchedGuestId] = useState<number | null>(null);
  const [returningTotalStays, setReturningTotalStays] = useState<number>(0);
  const [lastStaySummary, setLastStaySummary] = useState<string | null>(null);
  const [guestMetaLine, setGuestMetaLine] = useState<string | null>(null);
  const emailLookupTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearGuestLookup = useCallback(() => {
    setMatchedGuestId(null);
    setReturningTotalStays(0);
    setLastStaySummary(null);
    setGuestMetaLine(null);
  }, []);

  const lookupGuestByEmail = useCallback((email: string) => {
    if (emailLookupTimer.current) clearTimeout(emailLookupTimer.current);
    const trimmed = email.trim();
    if (!trimmed || !trimmed.includes('@') || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      clearGuestLookup();
      return;
    }
    emailLookupTimer.current = setTimeout(async () => {
      try {
        const data = await bookingApi.getGuestProfileSummary(trimmed);
        if (!data.found || !data.guest) {
          clearGuestLookup();
          return;
        }
        setMatchedGuestId(data.guest.id);
        setReturningTotalStays(data.stats?.totalStays ?? 0);
        setLastStaySummary(data.lastStay?.summary ?? null);

        // Build meta line: "Points: N" (+ tier/VIP if available)
        const parts: string[] = [];
        parts.push(`Points: ${data.guest.loyaltyPoints ?? 0}`);
        if (data.guest.loyaltyTier) parts.push(data.guest.loyaltyTier);
        if (data.guest.vipStatus) parts.push('VIP');
        setGuestMetaLine(parts.join(' · '));

        // Autofill name + phone only if fields are currently empty
        setFormData(prev => {
          const updates: any = {};
          if (!prev.guestName.trim() && data.guest!.fullName) {
            updates.guestName = data.guest!.fullName;
          }
          if (!prev.guestPhone.trim() && data.guest!.phone) {
            updates.guestPhone = data.guest!.phone;
          }
          return Object.keys(updates).length ? { ...prev, ...updates } : prev;
        });
      } catch {
        clearGuestLookup();
      }
    }, 450);
  }, [clearGuestLookup]);

  // Trigger lookup when email changes
  useEffect(() => {
    lookupGuestByEmail(formData.guestEmail);
    return () => { if (emailLookupTimer.current) clearTimeout(emailLookupTimer.current); };
  }, [formData.guestEmail, lookupGuestByEmail]);

  // Clear lookup state when modal opens/closes
  useEffect(() => {
    if (!isOpen) clearGuestLookup();
  }, [isOpen, clearGuestLookup]);

  useEffect(() => {
    corporateService.listAccounts({ status: 'active' }).then((data) => {
      setCorporateAccounts(Array.isArray(data) ? data : data?.items || []);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (formData.checkIn && formData.checkOut) {
      const start = new Date(formData.checkIn);
      const end = new Date(formData.checkOut);
      const nights = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
      if (nights > 0) {
        setFormData(prev => ({ ...prev, nights }));
      } else {
        setFormData(prev => ({ ...prev, nights: 0 }));
      }
    } else {
      // Reset nights when dates are cleared
      setFormData(prev => ({ ...prev, nights: 0 }));
    }
  }, [formData.checkIn, formData.checkOut]);

  useEffect(() => {
    if (formData.checkIn && formData.checkOut) {
      const filtered = availableRooms.filter(room =>
        room.type === formData.roomType &&
        room.cleaning !== 'dirty'
      );
      setFilteredRooms(filtered);

      // Use calculated rate from API (rate plan applied) or fallback to getRateForBooking
      if (calculatedRate && formData.nights > 0) {
        // Apply GST based on rate slab (use centralized pricing-sst)
        const { rate: gstRate } = getTaxRate(calculatedRate);
        const subtotal = calculatedRate * formData.nights;
        const taxes = Math.round(subtotal * gstRate);
        const total = subtotal + taxes;
        setFormData(prev => ({ ...prev, amount: total }));
      } else if (getRateForBooking && formData.nights > 0) {
        const rateInfo = getRateForBooking(
          formData.roomType,
          formData.ratePlan,
          formData.checkIn,
          formData.checkOut
        );
        if (rateInfo) {
          setFormData(prev => ({ ...prev, amount: rateInfo.totalRate }));
        }
      }
    }
  }, [formData.roomType, formData.checkIn, formData.checkOut, formData.ratePlan, formData.nights, availableRooms, getRateForBooking, calculatedRate]);

  const validateStep = (stepNum) => {
    const newErrors = {};

    if (stepNum === 1) {
      if (!formData.guestName.trim()) newErrors.guestName = 'Name is required';
      if (!formData.guestEmail.trim()) newErrors.guestEmail = 'Email is required';
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.guestEmail)) {
        newErrors.guestEmail = 'Invalid email format';
      }
      if (!formData.guestPhone.trim()) newErrors.guestPhone = 'Phone is required';
      else if (!/^[\d\s\-\+\(\)]+$/.test(formData.guestPhone)) {
        newErrors.guestPhone = 'Invalid phone number';
      } else if (formData.guestPhone.replace(/\D/g, '').length < 10) {
        newErrors.guestPhone = 'Phone must be at least 10 digits';
      }
    }

    if (stepNum === 2) {
      if (!formData.checkIn) newErrors.checkIn = 'Check-in date is required';
      if (!formData.checkOut) newErrors.checkOut = 'Check-out date is required';
      if (formData.checkIn && formData.checkOut) {
        const start = new Date(formData.checkIn);
        const end = new Date(formData.checkOut);
        // Allow same-day bookings (check-out on same day as check-in)
        if (end < start) {
          newErrors.checkOut = 'Check-out cannot be before check-in';
        }
      }
      if (formData.adults < 1) newErrors.adults = 'At least 1 adult required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep(prev => Math.min(prev + 1, 3));
    }
  };

  const handleBack = () => {
    setStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = () => {
    // Validate based on mode
    if (isMultiRoom) {
      if (selectedRooms.length < 2) {
        setErrors({ selectedRoom: 'Please add at least 2 rooms for a multi-room booking' });
        return;
      }
    } else {
      if (!formData.selectedRoom && filteredRooms.length > 0) {
        setErrors({ selectedRoom: 'Please select a room' });
        return;
      }
    }

    // Build booking data
    const bookingData = {
      ...formData,
      isMultiRoom,
      // For multi-room, include rooms array
      rooms: isMultiRoom ? selectedRooms : undefined,
      // For single room, include selected room
      roomNumber: !isMultiRoom ? formData.selectedRoom?.roomNumber || null : null,
      status: 'PENDING',
      amountPaid: 0,
      balance: formData.amount,
      createdBy: 'Front Desk'
    };

    onSubmit(bookingData);
    resetForm();
    onClose();
  };

  const resetForm = () => {
    setStep(1);
    setFormData({
      guestName: '',
      guestEmail: '',
      guestPhone: '',
      isVip: false,
      checkIn: '',
      checkOut: '',
      nights: 0,
      ratePlan: 'BAR',
      roomType: 'Minimalist Studio',
      adults: 2,
      children: 0,
      source: 'Direct',
      specialRequests: '',
      selectedRoom: null,
      amount: 0,
      gstNumber: ''
    });
    setErrors({});
    setIsMultiRoom(false);
    setSelectedRooms([]);
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const today = new Date().toISOString().split('T')[0];
  // Restrict dates before current month (May 1st onwards allowed)
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth();
  const monthStart = new Date(currentYear, currentMonth, 1).toISOString().split('T')[0];

  const steps = [
    { num: 1, label: 'Guest', icon: User },
    { num: 2, label: 'Stay', icon: Calendar },
    { num: 3, label: 'Room', icon: Bed }
  ];

  const drawerFooter = (
    <div className="flex items-center justify-between w-full">
      <p className="text-[11px] font-medium text-neutral-400">
        Step <span className="text-neutral-600">{step}</span> of <span className="text-neutral-600">3</span>
      </p>
      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          onClick={step === 1 ? handleClose : handleBack}
          className="px-4 py-2 text-[13px]"
        >
          {step === 1 ? 'Cancel' : 'Back'}
        </Button>
        <Button
          variant="primary"
          onClick={step < 3 ? handleNext : handleSubmit}
          className="px-4 py-2 text-[13px]"
        >
          {step < 3 ? 'Continue' : 'Create Booking'}
        </Button>
      </div>
    </div>
  );

  return (
    <Drawer
      isOpen={isOpen}
      onClose={handleClose}
      title="New Reservation"
      subtitle="Create a new guest booking"
      maxWidth="max-w-xl"
      footer={drawerFooter}
    >
      {/* Progress Stepper - Compact */}
      <div className="flex items-center justify-between mb-6 pb-5 border-b border-neutral-100">
        {steps.map((s, idx) => {
          const isActive = step === s.num;
          const isCompleted = step > s.num;
          const Icon = s.icon;

          return (
            <div key={s.num} className="flex items-center flex-1">
              <div className="flex items-center gap-2">
                <div
                  className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center transition-all",
                    isCompleted && "bg-terra-500 text-white",
                    isActive && "bg-terra-50 text-terra-600 ring-2 ring-terra-500",
                    !isActive && !isCompleted && "bg-neutral-100 text-neutral-400"
                  )}
                >
                  {isCompleted ? (
                    <Check className="w-4 h-4" strokeWidth={2.5} />
                  ) : (
                    <Icon className="w-4 h-4" />
                  )}
                </div>
                <div>
                  <p className={cn(
                    "text-[13px] font-semibold",
                    (isActive || isCompleted) ? "text-neutral-900" : "text-neutral-400"
                  )}>
                    {s.label}
                  </p>
                </div>
              </div>
              {idx < steps.length - 1 && (
                <div className="flex-1 mx-3">
                  <div className="h-0.5 bg-neutral-200 rounded-full overflow-hidden">
                    <div
                      className={cn(
                        "h-full bg-terra-500 transition-all duration-300",
                        isCompleted ? "w-full" : "w-0"
                      )}
                    />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Step 1 - Guest Details */}
      {step === 1 && (
        <div className="space-y-6">
          {/* Contact Information */}
          <div>
            <h3 className="text-[11px] font-semibold uppercase tracking-widest text-neutral-400 mb-4 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-terra-500" />
              Contact Information
            </h3>

            <div className="space-y-4">
              <FormField label="Full Name" required error={errors.guestName}>
                <Input
                  name="guestName"
                  value={formData.guestName}
                  onChange={(e) => handleChange('guestName', e.target.value)}
                  placeholder="Enter guest's full name"
                  autoComplete="name"
                  error={errors.guestName}
                />
              </FormField>

              <div className="grid grid-cols-2 gap-4">
                <FormField label="Email Address" required error={errors.guestEmail}>
                  <Input
                    type="email"
                    name="guestEmail"
                    value={formData.guestEmail}
                    onChange={(e) => handleChange('guestEmail', e.target.value)}
                    placeholder="guest@email.com"
                    autoComplete="email"
                    error={errors.guestEmail}
                  />
                </FormField>

                <FormField label="Phone Number" required error={errors.guestPhone}>
                  <Input
                    type="tel"
                    name="guestPhone"
                    value={formData.guestPhone}
                    onChange={(e) => {
                      const value = e.target.value.replace(/[^0-9+\-\(\)\s]/g, '');
                      handleChange('guestPhone', value);
                    }}
                    placeholder="+1 (555) 123-4567"
                    autoComplete="tel"
                    error={errors.guestPhone}
                  />
                </FormField>
              </div>
            </div>
          </div>

          {/* Guest Status */}
          <div>
            <h3 className="text-[11px] font-semibold uppercase tracking-widest text-neutral-400 mb-4 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-terra-500" />
              Guest Status
            </h3>

            <div className="grid grid-cols-2 gap-3">
              {/* Regular Guest */}
              <button
                type="button"
                onClick={() => handleChange('isVip', false)}
                className={cn(
                  'relative p-4 rounded-[10px] border-2 transition-all text-left',
                  !formData.isVip
                    ? 'border-terra-500 bg-terra-50'
                    : 'border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50'
                )}
              >
                <div className="flex items-start gap-3">
                  <div className={cn(
                    'w-10 h-10 rounded-lg flex items-center justify-center',
                    !formData.isVip
                      ? 'bg-terra-500 text-white'
                      : 'bg-neutral-100 text-neutral-500'
                  )}>
                    <User className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-semibold text-neutral-900">Regular</p>
                    <p className="text-[11px] text-neutral-500 mt-0.5">Standard guest privileges</p>
                  </div>
                  {!formData.isVip && (
                    <div className="w-5 h-5 rounded-full bg-terra-500 flex items-center justify-center flex-shrink-0">
                      <Check className="w-3 h-3 text-white" strokeWidth={3} />
                    </div>
                  )}
                </div>
              </button>

              {/* VIP Guest */}
              <button
                type="button"
                onClick={() => handleChange('isVip', true)}
                className={cn(
                  'relative p-4 rounded-[10px] border-2 transition-all text-left',
                  formData.isVip
                    ? 'border-gold-500 bg-gold-50'
                    : 'border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50'
                )}
              >
                <div className="flex items-start gap-3">
                  <div className={cn(
                    'w-10 h-10 rounded-lg flex items-center justify-center',
                    formData.isVip
                      ? 'bg-gold-500 text-white'
                      : 'bg-neutral-100 text-neutral-500'
                  )}>
                    <Crown className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-semibold text-neutral-900">VIP</p>
                    <p className="text-[11px] text-neutral-500 mt-0.5">Premium guest benefits</p>
                  </div>
                  {formData.isVip && (
                    <div className="w-5 h-5 rounded-full bg-gold-500 flex items-center justify-center flex-shrink-0">
                      <Check className="w-3 h-3 text-white" strokeWidth={3} />
                    </div>
                  )}
                </div>
              </button>
            </div>
          </div>

          {/* GST Number */}
          <div>
            <h3 className="text-[11px] font-semibold uppercase tracking-widest text-neutral-400 mb-4 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-terra-500" />
              GST Number
            </h3>

            <FormField label="GST Number" description="Optional - add GST number for corporate tax claim">
              <Input
                type="text"
                name="gstNumber"
                value={formData.gstNumber || ''}
                onChange={(e) => {
                  const val = e.target.value.toUpperCase();
                  handleChange('gstNumber', val);
                }}
                placeholder="e.g. 27AAAAA1111A1Z1"
                className="w-full"
              />
            </FormField>
          </div>
        </div>
      )}

      {/* Step 2 - Stay Details */}
      {step === 2 && (
        <div className="space-y-6">
          {/* Returning-guest info cards — shown above Stay Dates */}
          {matchedGuestId !== null && (
            <div className="space-y-3">
              {/* Stay count + View history */}
              <div className="flex items-center justify-between rounded-[10px] border border-neutral-200 bg-white px-4 py-3">
                <p className="text-[13px] font-semibold text-neutral-900">
                  {returningTotalStays > 0
                    ? `This guest has stayed with us ${returningTotalStays} time${returningTotalStays !== 1 ? 's' : ''}.`
                    : 'We have a guest profile on file for this email.'}
                </p>
                <button
                  type="button"
                  onClick={() =>
                    window.open(
                      `${window.location.origin}/admin/guests/${matchedGuestId}`,
                      '_blank',
                      'noopener,noreferrer'
                    )
                  }
                  className="flex items-center gap-1.5 whitespace-nowrap rounded-lg border border-neutral-300 bg-white px-3 py-1.5 text-[12px] font-medium text-neutral-700 hover:bg-neutral-50 transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  View stay history
                </button>
              </div>

              {/* Last stay detail */}
              {lastStaySummary && (
                <div className="rounded-[10px] border border-amber-300 bg-amber-50 px-4 py-3">
                  <p className="text-[13px] font-medium text-amber-900">{lastStaySummary}</p>
                </div>
              )}

              {/* Points / loyalty */}
              <div className="rounded-[10px] border border-neutral-200 bg-white px-4 py-3">
                <p className="text-[13px] font-medium text-neutral-700">
                  {guestMetaLine ? guestMetaLine : `Points: 0`}
                </p>
              </div>
            </div>
          )}

          {/* Dates */}
          <div>
            <h3 className="text-[11px] font-semibold uppercase tracking-widest text-neutral-400 mb-4 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-terra-500" />
              Stay Dates
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[13px] font-medium text-neutral-700 mb-2">
                  Check-in <span className="text-rose-500">*</span>
                </label>
                <DatePicker
                  value={formData.checkIn}
                  onChange={(value) => handleChange('checkIn', value)}
                  minDate={monthStart}
                  placeholder="Select date"
                  className="w-full"
                />
                {errors.checkIn && (
                  <p className="text-rose-500 text-[11px] mt-1.5 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.checkIn}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-[13px] font-medium text-neutral-700 mb-2">
                  Check-out <span className="text-rose-500">*</span>
                </label>
                <DatePicker
                  value={formData.checkOut}
                  onChange={(value) => handleChange('checkOut', value)}
                  minDate={formData.checkIn || monthStart}
                  placeholder="Select date"
                  className="w-full"
                />
                {errors.checkOut && (
                  <p className="text-rose-500 text-[11px] mt-1.5 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.checkOut}
                  </p>
                )}
              </div>
            </div>

            {/* Nights Display */}
            {formData.nights > 0 && (
              <div className="mt-4 p-4 rounded-[10px] bg-terra-50 border border-terra-200">
                <div className="flex items-center justify-center gap-2">
                  <Calendar className="w-5 h-5 text-terra-600" />
                  <span className="text-2xl font-bold text-terra-600">{formData.nights}</span>
                  <span className="text-[13px] font-medium text-terra-600">night{formData.nights !== 1 ? 's' : ''}</span>
                </div>
              </div>
            )}
          </div>

          {/* Room & Rate */}
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Room Type">
              <Select
                value={formData.roomType}
                onChange={(e) => handleChange('roomType', e.target.value)}
              >
                {roomTypes.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </Select>
            </FormField>
            <FormField label="Rate Plan">
              <Select
                value={formData.ratePlan}
                onChange={(e) => handleChange('ratePlan', e.target.value)}
              >
                {ratePlanOptions.map((plan) => (
                  <option key={plan.value} value={plan.value}>{plan.label}</option>
                ))}
              </Select>
            </FormField>
          </div>

          {/* Guests */}
          <div>
            <h3 className="text-[11px] font-semibold uppercase tracking-widest text-neutral-400 mb-4 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-terra-500" />
              Guests
            </h3>

            <div className="grid grid-cols-2 gap-4">
              {/* Adults */}
              <div className="p-4 rounded-[10px] bg-neutral-50 border border-neutral-200">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-[13px] font-semibold text-neutral-900">Adults</p>
                    <p className="text-[10px] text-neutral-500">Age 13+</p>
                  </div>
                  <Users className="w-4 h-4 text-neutral-400" />
                </div>
                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => handleChange('adults', Math.max(1, formData.adults - 1))}
                    disabled={formData.adults <= 1}
                    className="w-8 h-8 rounded-lg bg-white border border-neutral-200 flex items-center justify-center text-neutral-600 hover:bg-neutral-50 disabled:opacity-40 transition-all"
                  >
                    <span className="text-lg font-medium">−</span>
                  </button>
                  <span className="text-xl font-bold text-neutral-900 tabular-nums">{formData.adults}</span>
                  <button
                    type="button"
                    onClick={() => handleChange('adults', Math.min(6, formData.adults + 1))}
                    disabled={formData.adults >= 6}
                    className="w-8 h-8 rounded-lg bg-terra-500 text-white flex items-center justify-center hover:bg-terra-600 disabled:opacity-40 transition-all"
                  >
                    <span className="text-lg font-medium">+</span>
                  </button>
                </div>
              </div>

              {/* Children */}
              <div className="p-4 rounded-[10px] bg-neutral-50 border border-neutral-200">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-[13px] font-semibold text-neutral-900">Children</p>
                    <p className="text-[10px] text-neutral-500">Age 0-12</p>
                  </div>
                  <Users className="w-4 h-4 text-neutral-400" />
                </div>
                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => handleChange('children', Math.max(0, formData.children - 1))}
                    disabled={formData.children <= 0}
                    className="w-8 h-8 rounded-lg bg-white border border-neutral-200 flex items-center justify-center text-neutral-600 hover:bg-neutral-50 disabled:opacity-40 transition-all"
                  >
                    <span className="text-lg font-medium">−</span>
                  </button>
                  <span className="text-xl font-bold text-neutral-900 tabular-nums">{formData.children}</span>
                  <button
                    type="button"
                    onClick={() => handleChange('children', Math.min(4, formData.children + 1))}
                    disabled={formData.children >= 4}
                    className="w-8 h-8 rounded-lg bg-terra-500 text-white flex items-center justify-center hover:bg-terra-600 disabled:opacity-40 transition-all"
                  >
                    <span className="text-lg font-medium">+</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Booking Source - Auto-set to Direct for in-hotel bookings */}

          {/* Special Requests */}
          <FormField label="Special Requests" description="Optional - any special requirements">
            <Textarea
              value={formData.specialRequests}
              onChange={(e) => handleChange('specialRequests', e.target.value)}
              rows={3}
              placeholder="Early check-in, extra pillows, dietary requirements..."
            />
          </FormField>
        </div>
      )}

      {/* Step 3 - Room Selection */}
      {step === 3 && (
        <div className="space-y-6">
          {/* Booking Summary */}
          <div className="p-4 rounded-[10px] bg-neutral-50 border border-neutral-200">
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1.5 px-2.5 py-1 bg-white rounded-lg border border-neutral-200 text-[11px] font-medium text-neutral-600">
                <Calendar className="w-3 h-3 text-terra-500" />
                {formData.nights} night{formData.nights !== 1 ? 's' : ''}
              </div>
              {!isMultiRoom && (
                <>
                  <div className="flex items-center gap-1.5 px-2.5 py-1 bg-white rounded-lg border border-neutral-200 text-[11px] font-medium text-neutral-600">
                    <Users className="w-3 h-3 text-terra-500" />
                    {formData.adults} Adult{formData.adults !== 1 ? 's' : ''}{formData.children > 0 && `, ${formData.children} Child`}
                  </div>
                  <div className="flex items-center gap-1.5 px-2.5 py-1 bg-white rounded-lg border border-neutral-200 text-[11px] font-medium text-neutral-600">
                    <Bed className="w-3 h-3 text-terra-500" />
                    {formData.roomType}
                  </div>
                </>
              )}
              {isMultiRoom && selectedRooms.length > 0 && (
                <div className="flex items-center gap-1.5 px-2.5 py-1 bg-terra-50 rounded-lg border border-terra-200 text-[11px] font-semibold text-terra-700">
                  <Layers className="w-3 h-3" />
                  {selectedRooms.length} room{selectedRooms.length !== 1 ? 's' : ''}
                </div>
              )}
              {formData.isVip && (
                <div className="flex items-center gap-1.5 px-2.5 py-1 bg-gold-50 rounded-lg border border-gold-200 text-[11px] font-semibold text-gold-700">
                  <Crown className="w-3 h-3" />
                  VIP
                </div>
              )}
            </div>
          </div>

          {/* Single/Multi Room Toggle */}
          <div className="flex items-center justify-between p-3 rounded-[10px] bg-neutral-50 border border-neutral-200">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-neutral-500" />
              <div>
                <p className="text-[13px] font-semibold text-neutral-900">Multiple Rooms</p>
                <p className="text-[10px] text-neutral-500">Book multiple rooms at once</p>
              </div>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={isMultiRoom}
              onClick={() => {
                const newIsMultiRoom = !isMultiRoom;
                setIsMultiRoom(newIsMultiRoom);
                // Initialize with one room if switching to multi-room mode
                if (newIsMultiRoom && selectedRooms.length === 0) {
                  const firstRoomType = roomTypesForSelector[0];
                  if (firstRoomType) {
                    setSelectedRooms([{
                      room_type_id: firstRoomType.id,
                      adults: formData.adults || 1,
                      children: formData.children || 0,
                    }]);
                  }
                }
              }}
              className={cn(
                'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                isMultiRoom ? 'bg-terra-500' : 'bg-neutral-200'
              )}
            >
              <span
                className={cn(
                  'inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-sm',
                  isMultiRoom ? 'translate-x-6' : 'translate-x-1'
                )}
              />
            </button>
          </div>

          {/* Room Selection - Different UI based on mode */}
          {isMultiRoom ? (
            /* Multi-Room Selector */
            <div>
              <h3 className="text-[11px] font-semibold uppercase tracking-widest text-neutral-400 mb-4 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-terra-500" />
                Configure Rooms
              </h3>
              <MultiRoomSelector
                rooms={selectedRooms}
                onChange={setSelectedRooms}
                roomTypes={roomTypesForSelector}
                checkIn={formData.checkIn}
                checkOut={formData.checkOut}
                nights={formData.nights}
              />
              {errors.selectedRoom && (
                <p className="text-rose-500 text-[11px] mt-3 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.selectedRoom}
                </p>
              )}
            </div>
          ) : (
            /* Single Room Selection */
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-[11px] font-semibold uppercase tracking-widest text-neutral-400 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-terra-500" />
                  Select Room
                </h3>
                <span className="text-[10px] font-semibold px-2 py-1 rounded-lg bg-neutral-100 text-neutral-600">
                  {filteredRooms.length} available
                </span>
              </div>

              {filteredRooms.length === 0 ? (
              <div className="p-8 rounded-[10px] border border-dashed border-neutral-300 text-center">
                <div className="w-10 h-10 rounded-lg bg-gold-50 flex items-center justify-center mx-auto mb-3">
                  <AlertCircle className="w-5 h-5 text-gold-600" />
                </div>
                <p className="text-[13px] font-semibold text-neutral-800">No rooms available</p>
                <p className="text-[11px] text-neutral-500 mt-1">Try selecting a different room type or dates.</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {filteredRooms.map((room) => {
                  const isSelected = formData.selectedRoom?.id === room.id;
                  const isReady = room.cleaning === 'clean';

                  return (
                    <button
                      key={room.id}
                      type="button"
                      onClick={() => handleChange('selectedRoom', room)}
                      className={cn(
                        'w-full p-4 rounded-[10px] border-2 transition-all text-left',
                        isSelected
                          ? 'border-terra-500 bg-terra-50'
                          : 'border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50'
                      )}
                    >
                      <div className="flex items-center gap-4">
                        {/* Room Icon */}
                        <div className={cn(
                          'w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0',
                          isSelected
                            ? 'bg-terra-500 text-white'
                            : 'bg-neutral-100 text-neutral-400'
                        )}>
                          {isSelected ? <Check className="w-5 h-5" /> : <Bed className="w-5 h-5" />}
                        </div>

                        {/* Room Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-[13px] font-semibold text-neutral-900">Room {room.roomNumber}</span>
                            <span className={cn(
                              'text-[10px] px-2 py-0.5 rounded-lg font-semibold uppercase tracking-wider',
                              isReady
                                ? 'bg-sage-50 text-sage-700'
                                : 'bg-gold-50 text-gold-700'
                            )}>
                              {isReady ? 'Ready' : 'Cleaning'}
                            </span>
                          </div>
                          <p className="text-[11px] text-neutral-500 mt-0.5">Floor {room.floor} · {room.type}</p>
                        </div>

                        {/* Price */}
                        <div className="text-right flex-shrink-0">
                          <p className="text-[15px] font-bold text-neutral-900">{formatCurrency(room.price)}</p>
                          <p className="text-[10px] text-neutral-400">per night</p>
                        </div>
                      </div>

                      {/* Amenities (show on selection) */}
                      {isSelected && (
                        <div className="mt-3 pt-3 border-t border-terra-200">
                          <div className="flex items-center gap-4 text-[10px] font-medium text-terra-600">
                            <span className="flex items-center gap-1"><Wifi className="w-3 h-3" /> WiFi</span>
                            <span className="flex items-center gap-1"><Coffee className="w-3 h-3" /> Mini Bar</span>
                            <span className="flex items-center gap-1"><Car className="w-3 h-3" /> Parking</span>
                          </div>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            )}

            {errors.selectedRoom && (
              <p className="text-rose-500 text-[11px] mt-3 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.selectedRoom}
              </p>
            )}
          </div>
          )}

          {/* Total - Show for single room mode only when there's an amount */}
          {!isMultiRoom && formData.amount > 0 && (
            <div className="p-4 rounded-[10px] bg-terra-500 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[11px] text-terra-200 font-medium">Total Amount</p>
                  <p className="text-2xl font-bold">{formatCurrency(formData.amount)}</p>
                </div>
                <div className="text-right">
                  <p className="text-[11px] text-terra-200">{formData.nights} night{formData.nights !== 1 ? 's' : ''}</p>
                  <p className="text-[11px] text-terra-200">{formData.ratePlan} Rate</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </Drawer>
  );
}
