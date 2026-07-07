/**
 * NewBookingModal Component
 * Premium Hotel Booking Flow - Glimmora Design System
 * Refined luxury aesthetic with warm terra tones
 */

import { useState, useEffect } from 'react';
import {
  User, Calendar, Bed, Crown, Check, Users, AlertCircle,
  Sparkles, Globe, Mail, Phone, X, ChevronRight,
  Building, Wifi, Coffee, Car, MessageSquare
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Modal, ModalHeader, ModalTitle, ModalDescription, ModalContent, ModalFooter } from '../ui2/Modal';
import { Input, FormField, Select, Textarea } from '../ui2/Input';
import { Button } from '../ui2/Button';
import DatePicker from '../ui2/DatePicker';
import { useCurrency } from '@/hooks/useCurrency';

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
const ratePlans = ['BAR', 'Corporate', 'OTA', 'Long Stay'];
const sources = [
  { id: 'Direct', label: 'Direct', icon: Building },
  { id: 'Booking.com', label: 'Booking.com', icon: Globe },
  { id: 'Expedia', label: 'Expedia', icon: Globe },
  { id: 'Hotels.com', label: 'Hotels.com', icon: Globe },
  { id: 'Corporate Portal', label: 'Corporate', icon: Building },
];

export default function NewBookingModal({
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
    ratePlan: 'BAR',
    roomType: 'Minimalist Studio',
    adults: 2,
    children: 0,
    source: 'Direct',
    specialRequests: '',
    selectedRoom: null,
    amount: 0
  });

  const [errors, setErrors] = useState({});
  const [filteredRooms, setFilteredRooms] = useState([]);

  useEffect(() => {
    if (formData.checkIn && formData.checkOut) {
      const start = new Date(formData.checkIn);
      const end = new Date(formData.checkOut);
      const nights = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
      if (nights > 0) {
        setFormData(prev => ({ ...prev, nights }));
      }
    }
  }, [formData.checkIn, formData.checkOut]);

  useEffect(() => {
    if (formData.checkIn && formData.checkOut) {
      const filtered = availableRooms.filter(room =>
        room.type === formData.roomType &&
        room.cleaning !== 'dirty'
      );
      setFilteredRooms(filtered);

      if (getRateForBooking && formData.nights > 0) {
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
  }, [formData.roomType, formData.checkIn, formData.checkOut, formData.ratePlan, formData.nights, availableRooms, getRateForBooking]);

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
    if (!formData.selectedRoom && filteredRooms.length > 0) {
      setErrors({ selectedRoom: 'Please select a room' });
      return;
    }

    const bookingData = {
      ...formData,
      roomNumber: formData.selectedRoom?.roomNumber || null,
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
      amount: 0
    });
    setErrors({});
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
    { num: 1, label: 'Guest Details', shortLabel: 'Guest', icon: User },
    { num: 2, label: 'Stay Information', shortLabel: 'Stay', icon: Calendar },
    { num: 3, label: 'Room Selection', shortLabel: 'Room', icon: Bed }
  ];

  return (
    <Modal open={isOpen} onClose={handleClose} size="xl" showClose={false}>
      {/* Header with Stepper */}
      <div className="relative px-4 sm:px-6 pt-4 sm:pt-6 pb-4 sm:pb-5 border-b border-neutral-100">
        {/* Title Row */}
        <div className="flex items-center justify-between mb-4 sm:mb-5">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-terra-500 to-terra-600 flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <div className="min-w-0">
              <h2 className="text-base sm:text-lg font-semibold text-neutral-900">New Reservation</h2>
              <p className="text-xs sm:text-sm text-neutral-500 truncate">Create a new guest booking</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 sm:p-2 rounded-lg text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 transition-colors flex-shrink-0"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>

        {/* Progress Stepper */}
        <div className="flex items-center justify-between">
          {steps.map((s, idx) => {
            const isActive = step === s.num;
            const isCompleted = step > s.num;
            const isUpcoming = step < s.num;
            const Icon = s.icon;

            return (
              <div key={s.num} className="flex items-center flex-1">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div
                    className={cn(
                      "relative w-7 h-7 sm:w-9 sm:h-9 rounded-full flex items-center justify-center transition-all duration-200 flex-shrink-0",
                      isCompleted && "bg-terra-500 text-white",
                      isActive && "bg-terra-100 text-terra-600 border border-terra-500",
                      isUpcoming && "bg-neutral-100 text-neutral-400"
                    )}
                  >
                    {isCompleted ? (
                      <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4" strokeWidth={2.5} />
                    ) : (
                      <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    )}
                  </div>
                  <div className="hidden sm:block">
                    <p className={cn(
                      "text-xs sm:text-sm font-medium",
                      (isActive || isCompleted) ? "text-neutral-900" : "text-neutral-400"
                    )}>
                      {s.shortLabel}
                    </p>
                    <p className={cn(
                      "text-[10px] sm:text-xs",
                      (isActive || isCompleted) ? "text-neutral-500" : "text-neutral-300"
                    )}>
                      Step {s.num}
                    </p>
                  </div>
                </div>
                {idx < steps.length - 1 && (
                  <div className="flex-1 mx-2 sm:mx-4">
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
      </div>

      {/* Content */}
      <div className="px-4 sm:px-6 py-4 sm:py-5 max-h-[50vh] overflow-y-auto">
        {/* Step 1 - Guest Details */}
        {step === 1 && (
          <div className="space-y-4 sm:space-y-5">
            {/* Contact Information */}
            <div>
              <h3 className="text-xs sm:text-sm font-semibold text-neutral-900 mb-3 sm:mb-4 flex items-center gap-2">
                <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-terra-500" />
                Contact Information
              </h3>

              <div className="space-y-3 sm:space-y-4">
                <FormField label="Full Name" required error={errors.guestName}>
                  <Input
                    name="guestName"
                    value={formData.guestName}
                    onChange={(e) => handleChange('guestName', e.target.value)}
                    placeholder="Enter guest's full name"
                    autoComplete="name"
                    error={errors.guestName}
                    size="lg"
                  />
                </FormField>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField label="Email Address" required error={errors.guestEmail}>
                    <Input
                      type="email"
                      name="guestEmail"
                      value={formData.guestEmail}
                      onChange={(e) => handleChange('guestEmail', e.target.value)}
                      placeholder="guest@email.com"
                      autoComplete="email"
                      error={errors.guestEmail}
                      size="lg"
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
                      size="lg"
                    />
                  </FormField>
                </div>
              </div>
            </div>

              {/* Guest Status */}
              <div>
                <h3 className="text-xs sm:text-sm font-semibold text-neutral-900 mb-3 sm:mb-4 flex items-center gap-2">
                  <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-terra-500" />
                  Guest Status
                </h3>

                <div className="grid grid-cols-2 gap-2 sm:gap-3">
                  {/* Regular Guest */}
                  <button
                    type="button"
                    onClick={() => handleChange('isVip', false)}
                    className={cn(
                      'relative p-3 sm:p-4 rounded-xl border transition-all duration-200 text-left group overflow-hidden',
                      !formData.isVip
                        ? 'border-terra-500 bg-terra-50/50'
                        : 'border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50'
                    )}
                  >
                    <div className="flex items-start gap-2 sm:gap-3">
                      <div className={cn(
                        'w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center transition-all duration-200 flex-shrink-0',
                        !formData.isVip
                          ? 'bg-terra-500 text-white'
                          : 'bg-neutral-100 text-neutral-500 group-hover:bg-neutral-200'
                      )}>
                        <User className="w-4 h-4 sm:w-5 sm:h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm sm:text-base font-semibold text-neutral-900">Regular</p>
                        <p className="text-[10px] sm:text-xs text-neutral-500 mt-0.5 truncate">Standard privileges</p>
                      </div>
                      {!formData.isVip && (
                        <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-terra-500 flex items-center justify-center flex-shrink-0">
                          <Check className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-white" strokeWidth={3} />
                        </div>
                      )}
                    </div>
                  </button>

                  {/* VIP Guest */}
                  <button
                    type="button"
                    onClick={() => handleChange('isVip', true)}
                    className={cn(
                      'relative p-3 sm:p-4 rounded-xl border transition-all duration-200 text-left group overflow-hidden',
                      formData.isVip
                        ? 'border-gold-500 bg-gold-50/50'
                        : 'border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50'
                    )}
                  >
                    {formData.isVip && (
                      <div className="absolute top-0 right-0 w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-bl from-gold-200/50 to-transparent rounded-bl-full" />
                    )}
                    <div className="relative flex items-start gap-2 sm:gap-3">
                      <div className={cn(
                        'w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center transition-all duration-200 flex-shrink-0',
                        formData.isVip
                          ? 'bg-gradient-to-br from-gold-500 to-gold-600 text-white shadow-lg shadow-gold-500/30'
                          : 'bg-neutral-100 text-neutral-500 group-hover:bg-neutral-200'
                      )}>
                        <Crown className="w-4 h-4 sm:w-5 sm:h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm sm:text-base font-semibold text-neutral-900">VIP</p>
                        <p className="text-[10px] sm:text-xs text-neutral-500 mt-0.5 truncate">Premium benefits</p>
                      </div>
                      {formData.isVip && (
                        <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-gold-500 flex items-center justify-center flex-shrink-0">
                          <Check className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-white" strokeWidth={3} />
                        </div>
                      )}
                    </div>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Step 2 - Stay Details */}
          {step === 2 && (
            <div className="space-y-4 sm:space-y-6 animate-in fade-in-0 slide-in-from-right-4 duration-300">
              {/* Dates */}
              <div>
                <h3 className="text-xs sm:text-sm font-semibold text-neutral-900 mb-3 sm:mb-4 flex items-center gap-2">
                  <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-terra-500" />
                  Stay Dates
                </h3>

                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-neutral-700 mb-1.5 sm:mb-2">
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
                      <p className="text-rose-500 text-[10px] sm:text-xs mt-1 sm:mt-1.5 flex items-center gap-1">
                        <AlertCircle className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                        {errors.checkIn}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-neutral-700 mb-1.5 sm:mb-2">
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
                      <p className="text-rose-500 text-[10px] sm:text-xs mt-1 sm:mt-1.5 flex items-center gap-1">
                        <AlertCircle className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                        {errors.checkOut}
                      </p>
                    )}
                  </div>
                </div>

                {/* Nights Display */}
                {formData.nights > 0 && (
                  <div className="mt-3 sm:mt-4 p-3 sm:p-4 rounded-xl bg-gradient-to-r from-terra-50 to-copper-50/50 border border-terra-100">
                    <div className="flex items-center justify-center gap-2">
                      <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-terra-500" />
                      <span className="text-xl sm:text-2xl font-bold text-terra-600">{formData.nights}</span>
                      <span className="text-xs sm:text-sm font-medium text-terra-600">night{formData.nights !== 1 ? 's' : ''}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Room & Rate */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <FormField label="Room Type">
                  <Select
                    value={formData.roomType}
                    onChange={(e) => handleChange('roomType', e.target.value)}
                    size="lg"
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
                    size="lg"
                  >
                    {ratePlans.map((plan) => (
                      <option key={plan} value={plan}>{plan}</option>
                    ))}
                  </Select>
                </FormField>
              </div>

              {/* Guests */}
              <div>
                <h3 className="text-xs sm:text-sm font-semibold text-neutral-900 mb-3 sm:mb-4 flex items-center gap-2">
                  <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-terra-500" />
                  Guests
                </h3>

                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  {/* Adults */}
                  <div className="p-3 sm:p-4 rounded-xl bg-neutral-50 border border-neutral-200">
                    <div className="flex items-center justify-between mb-2 sm:mb-3">
                      <div>
                        <p className="text-xs sm:text-sm font-medium text-neutral-900">Adults</p>
                        <p className="text-[10px] sm:text-xs text-neutral-500">Age 13+</p>
                      </div>
                      <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-neutral-400" />
                    </div>
                    <div className="flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() => handleChange('adults', Math.max(1, formData.adults - 1))}
                        disabled={formData.adults <= 1}
                        className="w-7 h-7 sm:w-9 sm:h-9 rounded-lg bg-white border border-neutral-200 flex items-center justify-center text-neutral-600 hover:bg-neutral-50 disabled:opacity-40 transition-all"
                      >
                        <span className="text-base sm:text-lg font-medium">−</span>
                      </button>
                      <span className="text-lg sm:text-xl font-bold text-neutral-900 tabular-nums">{formData.adults}</span>
                      <button
                        type="button"
                        onClick={() => handleChange('adults', Math.min(6, formData.adults + 1))}
                        disabled={formData.adults >= 6}
                        className="w-7 h-7 sm:w-9 sm:h-9 rounded-lg bg-terra-500 text-white flex items-center justify-center hover:bg-terra-600 disabled:opacity-40 transition-all"
                      >
                        <span className="text-base sm:text-lg font-medium">+</span>
                      </button>
                    </div>
                  </div>

                  {/* Children */}
                  <div className="p-3 sm:p-4 rounded-xl bg-neutral-50 border border-neutral-200">
                    <div className="flex items-center justify-between mb-2 sm:mb-3">
                      <div>
                        <p className="text-xs sm:text-sm font-medium text-neutral-900">Children</p>
                        <p className="text-[10px] sm:text-xs text-neutral-500">Age 0-12</p>
                      </div>
                      <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-neutral-400" />
                    </div>
                    <div className="flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() => handleChange('children', Math.max(0, formData.children - 1))}
                        disabled={formData.children <= 0}
                        className="w-7 h-7 sm:w-9 sm:h-9 rounded-lg bg-white border border-neutral-200 flex items-center justify-center text-neutral-600 hover:bg-neutral-50 disabled:opacity-40 transition-all"
                      >
                        <span className="text-base sm:text-lg font-medium">−</span>
                      </button>
                      <span className="text-lg sm:text-xl font-bold text-neutral-900 tabular-nums">{formData.children}</span>
                      <button
                        type="button"
                        onClick={() => handleChange('children', Math.min(4, formData.children + 1))}
                        disabled={formData.children >= 4}
                        className="w-7 h-7 sm:w-9 sm:h-9 rounded-lg bg-terra-500 text-white flex items-center justify-center hover:bg-terra-600 disabled:opacity-40 transition-all"
                      >
                        <span className="text-base sm:text-lg font-medium">+</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Booking Source - Auto-set to Direct for in-hotel bookings */}

              {/* Special Requests */}
              <FormField label="Special Requests" description="Optional - any special requirements or preferences">
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
            <div className="space-y-4 sm:space-y-6 animate-in fade-in-0 slide-in-from-right-4 duration-300">
              {/* Booking Summary */}
              <div className="p-3 sm:p-4 rounded-xl bg-gradient-to-r from-neutral-50 to-terra-50/30 border border-neutral-200">
                <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                  <div className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 bg-white rounded-full border border-neutral-200 shadow-sm">
                    <Calendar className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-terra-500" />
                    <span className="text-xs sm:text-sm font-medium text-neutral-700">{formData.nights} night{formData.nights !== 1 ? 's' : ''}</span>
                  </div>
                  <div className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 bg-white rounded-full border border-neutral-200 shadow-sm">
                    <Users className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-terra-500" />
                    <span className="text-xs sm:text-sm font-medium text-neutral-700">
                      {formData.adults} Adult{formData.adults !== 1 ? 's' : ''}{formData.children > 0 && `, ${formData.children} Child${formData.children !== 1 ? 'ren' : ''}`}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 bg-white rounded-full border border-neutral-200 shadow-sm">
                    <Bed className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-terra-500" />
                    <span className="text-xs sm:text-sm font-medium text-neutral-700 truncate max-w-[100px] sm:max-w-none">{formData.roomType}</span>
                  </div>
                  {formData.isVip && (
                    <div className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 bg-gold-50 rounded-full border border-gold-200 shadow-sm">
                      <Crown className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-gold-600" />
                      <span className="text-xs sm:text-sm font-medium text-gold-700">VIP</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Room Selection */}
              <div>
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <h3 className="text-xs sm:text-sm font-semibold text-neutral-900 flex items-center gap-2">
                    <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-terra-500" />
                    Select Room
                  </h3>
                  <span className="text-[10px] sm:text-xs font-medium px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full bg-neutral-100 text-neutral-600">
                    {filteredRooms.length} available
                  </span>
                </div>

                {filteredRooms.length === 0 ? (
                  <div className="p-6 sm:p-8 rounded-xl border-2 border-dashed border-neutral-200 text-center">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gold-100 flex items-center justify-center mx-auto mb-2 sm:mb-3">
                      <AlertCircle className="w-5 h-5 sm:w-6 sm:h-6 text-gold-600" />
                    </div>
                    <p className="text-sm sm:text-base font-semibold text-neutral-800">No rooms available</p>
                    <p className="text-xs sm:text-sm text-neutral-500 mt-1">Try selecting a different room type or dates.</p>
                  </div>
                ) : (
                  <div className="space-y-2 sm:space-y-3 max-h-[200px] sm:max-h-[280px] overflow-y-auto pr-1 sm:pr-2">
                    {filteredRooms.map((room) => {
                      const isSelected = formData.selectedRoom?.id === room.id;
                      const isReady = room.cleaning === 'clean';

                      return (
                        <button
                          key={room.id}
                          type="button"
                          onClick={() => handleChange('selectedRoom', room)}
                          className={cn(
                            'w-full p-3 sm:p-4 rounded-xl border transition-all duration-200 text-left group',
                            isSelected
                              ? 'border-terra-500 bg-terra-50/50 shadow-md shadow-terra-500/10'
                              : 'border-neutral-200 hover:border-terra-300 hover:bg-neutral-50'
                          )}
                        >
                          <div className="flex items-center gap-3 sm:gap-4">
                            {/* Room Icon */}
                            <div className={cn(
                              'w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center transition-all duration-200 flex-shrink-0',
                              isSelected
                                ? 'bg-terra-500 text-white shadow-lg shadow-terra-500/30'
                                : 'bg-neutral-100 text-neutral-400 group-hover:bg-neutral-200'
                            )}>
                              {isSelected ? <Check className="w-5 h-5 sm:w-6 sm:h-6" /> : <Bed className="w-5 h-5 sm:w-6 sm:h-6" />}
                            </div>

                            {/* Room Info */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1.5 sm:gap-2">
                                <span className="text-sm sm:text-base font-semibold text-neutral-900">Room {room.roomNumber}</span>
                                <span className={cn(
                                  'text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 rounded-full font-medium',
                                  isReady
                                    ? 'bg-sage-100 text-sage-700'
                                    : 'bg-gold-100 text-gold-700'
                                )}>
                                  {isReady ? 'Ready' : 'Cleaning'}
                                </span>
                              </div>
                              <p className="text-xs sm:text-sm text-neutral-500 mt-0.5 truncate">Floor {room.floor} • {room.type}</p>
                            </div>

                            {/* Price */}
                            <div className="text-right flex-shrink-0">
                              <p className="text-sm sm:text-base font-bold text-neutral-900">{formatCurrency(room.price)}</p>
                              <p className="text-[10px] sm:text-xs text-neutral-400">per night</p>
                            </div>
                          </div>

                          {/* Amenities (show on selection) */}
                          {isSelected && (
                            <div className="mt-2 sm:mt-3 pt-2 sm:pt-3 border-t border-terra-200/50">
                              <div className="flex items-center gap-3 sm:gap-4 text-[10px] sm:text-xs text-terra-600">
                                <span className="flex items-center gap-1"><Wifi className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> WiFi</span>
                                <span className="flex items-center gap-1"><Coffee className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> Mini Bar</span>
                                <span className="flex items-center gap-1"><Car className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> Parking</span>
                              </div>
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}

                {errors.selectedRoom && (
                  <p className="text-rose-500 text-[10px] sm:text-xs mt-2 sm:mt-3 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                    {errors.selectedRoom}
                  </p>
                )}
              </div>

              {/* Total */}
              {formData.amount > 0 && (
                <div className="p-3 sm:p-4 rounded-xl bg-gradient-to-r from-terra-500 to-terra-600 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs sm:text-sm text-terra-100">Total Amount</p>
                      <p className="text-xl sm:text-2xl font-bold">{formatCurrency(formData.amount)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs sm:text-sm text-terra-100">{formData.nights} night{formData.nights !== 1 ? 's' : ''}</p>
                      <p className="text-xs sm:text-sm text-terra-200">{formData.ratePlan} Rate</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

      {/* Footer */}
      <div className="px-4 sm:px-6 py-3 sm:py-4 border-t border-neutral-100 bg-neutral-50/50">
        <div className="flex items-center justify-between">
          <p className="text-xs sm:text-sm text-neutral-500">
            Step <span className="font-semibold text-neutral-700">{step}</span> of <span className="font-semibold text-neutral-700">3</span>
          </p>

          <div className="flex items-center gap-2 sm:gap-3">
            <Button
              variant="outline"
              size="lg"
              onClick={step === 1 ? handleClose : handleBack}
              className="text-xs sm:text-sm h-9 sm:h-10 px-3 sm:px-4"
            >
              {step === 1 ? 'Cancel' : 'Back'}
            </Button>

            <Button
              variant="primary"
              size="lg"
              onClick={step < 3 ? handleNext : handleSubmit}
              icon={step < 3 ? ChevronRight : Check}
              className="text-xs sm:text-sm h-9 sm:h-10 px-3 sm:px-4"
            >
              {step < 3 ? 'Continue' : 'Create Booking'}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
