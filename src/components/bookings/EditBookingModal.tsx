/**
 * EditBookingModal Component
 * Edit booking details - Glimmora Design System v5.0
 * Side drawer following CMS pattern
 * Includes billing recalculation when dates change
 */

import { useEffect, useMemo, useState } from 'react';
import { User, Briefcase } from 'lucide-react';
import { Drawer } from '../ui2/Drawer';
import { Button } from '../ui2/Button';
import { DatePicker } from '../ui2/DatePicker';
import { getAvailabilityGrid } from '@/api/services/availability.service';
import { useCurrency } from '@/hooks/useCurrency';
import { getTaxRate } from '@/utils/pricing-sst';

const SOURCE_OPTIONS = [
  { value: 'Website', label: 'Website' },
  { value: 'Direct', label: 'Direct (Walk-in)' },
  { value: 'Corporate Portal', label: 'Corporate Portal' },
  { value: 'Dummy Channel Manager', label: 'Dummy Channel Manager' },
  { value: 'CRS', label: 'CRS' },
  { value: 'Walk-in', label: 'Walk-in' },
  { value: 'Booking.com', label: 'Booking.com' },
  { value: 'Expedia', label: 'Expedia' },
];

// Normalise a time string to HH:mm for <input type="time">
// Handles: "14:30", "2:30 PM", "2:30PM", "14:30:00"
const toTimeInputValue = (val: string): string => {
  if (!val) return '';
  const trimmed = val.trim();
  // Already HH:mm or HH:mm:ss
  if (/^\d{2}:\d{2}(:\d{2})?$/.test(trimmed)) return trimmed.slice(0, 5);
  // 12h format e.g. "2:30 PM"
  const match = trimmed.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (match) {
    let h = parseInt(match[1], 10);
    const m = match[2];
    const period = match[3].toUpperCase();
    if (period === 'AM' && h === 12) h = 0;
    if (period === 'PM' && h !== 12) h += 12;
    return `${String(h).padStart(2, '0')}:${m}`;
  }
  return '';
};

const calculateNights = (checkIn: string, checkOut: string) => {
  if (!checkIn || !checkOut) return 0;
  const start = new Date(checkIn);
  const end = new Date(checkOut);
  const diff = Math.max(0, Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
  return diff;
};

const validateEmail = (email: string): string => {
  // Optional on edit (walk-in / OTA guests often have no email) — validate format only if provided
  if (!email.trim()) return '';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Enter a valid email address';
  return '';
};

const validatePhone = (phone: string): string => {
  // Optional on edit — validate format only if provided
  if (!phone.trim()) return '';
  const cleaned = phone.replace(/[\s\-().+]/g, '');
  if (cleaned.length < 7 || cleaned.length > 15) return 'Phone must be 7–15 digits';
  if (!/^\d+$/.test(cleaned)) return 'Phone must contain only digits';
  return '';
};

// Custom Select Component matching CMS pattern
function CustomSelect({ value, onChange, options, placeholder = 'Select...' }: any) {
  const [isOpen, setIsOpen] = useState(false);
  const selectedOption = options.find((opt: any) => opt.value === value);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full h-9 px-3.5 rounded-lg text-[13px] bg-white border transition-all duration-200 ease-out text-left flex items-center justify-between focus:outline-none ${
          isOpen
            ? 'border-terra-400/60 ring-2 ring-terra-500/10'
            : 'border-neutral-200/80 hover:border-terra-300/60'
        }`}
      >
        <span className={selectedOption ? 'text-neutral-900' : 'text-neutral-400'}>
          {selectedOption?.label || placeholder}
        </span>
        <svg className={`w-4 h-4 text-neutral-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute z-50 w-full mt-1 bg-white rounded-lg border border-neutral-200 shadow-lg overflow-hidden max-h-60 overflow-y-auto">
            {options.map((option: any) => (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                className={`w-full px-3.5 py-2.5 text-[13px] text-left hover:bg-neutral-50 transition-colors ${
                  value === option.value ? 'bg-terra-50 text-terra-700' : 'text-neutral-700'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

interface FieldErrors {
  guest?: string;
  email?: string;
  phone?: string;
  checkIn?: string;
  checkOut?: string;
}

export default function EditBookingModal({ isOpen, booking, onClose, onSave, isSaving }: any) {
  const { formatCurrency } = useCurrency();

  const [formState, setFormState] = useState({
    guest: '',
    email: '',
    phone: '',
    checkIn: '',
    checkOut: '',
    notes: '',
    source: 'Website',
    eta: '',
    etd: '',
    gstNumber: '',
    stayPurpose: 'personal' as 'personal' | 'business',
    companyName: '',
    companyAddress: '',
  });

  const [errors, setErrors] = useState<FieldErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [dailyRates, setDailyRates] = useState<{ date: string; rate: number }[]>([]);
  const [isLoadingRates, setIsLoadingRates] = useState(false);
  // Manual discount applied to this booking — '₹' off a flat amount or '%' of the subtotal
  const [discountType, setDiscountType] = useState<'flat' | 'percent'>('flat');
  const [discountValue, setDiscountValue] = useState('');
  // True after a Save attempt that failed validation — drives a visible hint so the
  // failure is never silent (previously errors could be scrolled out of view).
  const [submitAttempted, setSubmitAttempted] = useState(false);

  useEffect(() => {
    if (booking && isOpen) {
      // Determine stay purpose: default to business if company is on file but purpose wasn't set
      const companyName = booking.companyName || booking.company_name || '';
      const rawPurpose = booking.stayPurpose || booking.stay_purpose || '';
      const stayPurpose: 'personal' | 'business' =
        rawPurpose === 'business' || rawPurpose === 'personal'
          ? rawPurpose
          : (companyName ? 'business' : 'personal');

      setFormState({
        guest: booking.guest || '',
        email: booking.email || '',
        phone: booking.phone || '',
        checkIn: booking.checkIn || '',
        checkOut: booking.checkOut || '',
        notes: booking.specialRequests || '',
        source: booking.source || 'Website',
        eta: toTimeInputValue(booking.eta || ''),
        etd: toTimeInputValue(booking.etd || ''),
        gstNumber: booking.gstNumber || '',
        stayPurpose,
        companyName,
        companyAddress: booking.companyAddress || booking.company_address || '',
      });
      // Seed the discount controls from the saved booking. A discount code ending
      // in '%' means it was entered as a percentage; otherwise treat as a flat ₹ amount.
      const savedCode = booking.discountCode || '';
      const savedAmount = booking.discountAmount || 0;
      if (savedCode.trim().endsWith('%')) {
        setDiscountType('percent');
        setDiscountValue(savedCode.trim().replace('%', ''));
      } else if (savedAmount > 0) {
        setDiscountType('flat');
        setDiscountValue(String(savedAmount));
      } else {
        setDiscountType('flat');
        setDiscountValue('');
      }
      setErrors({});
      setTouched({});
    }
  }, [booking, isOpen]);

  const nights = useMemo(
    () => calculateNights(formState.checkIn, formState.checkOut),
    [formState.checkIn, formState.checkOut]
  );

  // Calculate billing when dates change
  const originalNights = useMemo(
    () => booking ? calculateNights(booking.checkIn, booking.checkOut) : 0,
    [booking]
  );

  const amountPaid = booking?.amountPaid || booking?.depositAmount || 0;

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];

  // Check if dates have changed
  const datesHaveChanged = useMemo(() => {
    if (!booking) return false;
    return formState.checkIn !== booking.checkIn || formState.checkOut !== booking.checkOut;
  }, [booking, formState.checkIn, formState.checkOut]);

  // Fetch daily rates from availability calendar when dates are set
  useEffect(() => {
    // Debug: log booking properties related to room type
    console.log('[EditBookingModal] Booking object:', {
      id: booking?.id,
      roomTypeId: booking?.roomTypeId,
      room_type_id: booking?.room_type_id,
      roomType: booking?.roomType,
    });

    if (!formState.checkIn || !formState.checkOut) {
      console.log('[EditBookingModal] Missing dates, skipping rate fetch');
      setDailyRates([]);
      return;
    }

    // Try multiple properties for room type ID
    const roomTypeId = Number(booking?.roomTypeId || booking?.room_type_id || 0);

    if (!roomTypeId) {
      console.warn('[EditBookingModal] No roomTypeId found on booking object');
      setDailyRates([]);
      return;
    }

    setIsLoadingRates(true);
    console.log('[EditBookingModal] Fetching rates for:', { checkIn: formState.checkIn, checkOut: formState.checkOut, roomTypeId });

    // Add timestamp to bypass cache and get fresh rates
    const fetchRates = async () => {
      try {
        const data = await getAvailabilityGrid(formState.checkIn, formState.checkOut, String(roomTypeId));
        console.log('[EditBookingModal] Availability API response:', JSON.stringify(data, null, 2));

        if (!data || !data.availability) {
          console.warn('[EditBookingModal] No availability data returned');
          setDailyRates([]);
          return;
        }

        const rates: { date: string; rate: number }[] = [];

        // Parse dates safely - use local date to avoid timezone issues
        const [ciYear, ciMonth, ciDay] = formState.checkIn.split('-').map(Number);
        const [coYear, coMonth, coDay] = formState.checkOut.split('-').map(Number);
        const checkInDate = new Date(ciYear, ciMonth - 1, ciDay);
        const checkOutDate = new Date(coYear, coMonth - 1, coDay);

        // Get room type base price as fallback (in case availability doesn't have rate for a specific date)
        const roomType = data.room_types?.find((rt: any) => Number(rt.id) === roomTypeId);
        const roomTypeBasePrice = roomType?.base_price || 0;
        console.log('[EditBookingModal] Room type:', roomType?.name, 'base_price:', roomTypeBasePrice);

        // Iterate through each night (check-in to day before check-out)
        const currentDate = new Date(checkInDate);
        while (currentDate < checkOutDate) {
          const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(currentDate.getDate()).padStart(2, '0')}`;

          // Find matching availability data for this date
          const dayData = data.availability.find((a: any) => {
            // Handle date comparison - API returns date as string "YYYY-MM-DD"
            const apiDate = String(a.date).split('T')[0];
            return apiDate === dateStr && Number(a.room_type_id) === roomTypeId;
          });

          // Use base_rate from availability, fallback to room type base_price
          // Use nullish coalescing (??) so 0 is treated as a valid rate
          const rate = dayData?.base_rate ?? roomTypeBasePrice;
          console.log('[EditBookingModal] Date:', dateStr, 'base_rate:', dayData?.base_rate, 'using rate:', rate);
          rates.push({ date: dateStr, rate: Number(rate) || 0 });

          currentDate.setDate(currentDate.getDate() + 1);
        }

        console.log('[EditBookingModal] Final daily rates:', rates);
        console.log('[EditBookingModal] Total:', rates.reduce((sum, r) => sum + r.rate, 0));
        setDailyRates(rates);
      } catch (err) {
        console.error('[EditBookingModal] Failed to fetch daily rates:', err);
        setDailyRates([]);
      } finally {
        setIsLoadingRates(false);
      }
    };

    fetchRates();
  }, [formState.checkIn, formState.checkOut, booking?.roomTypeId, booking?.room_type_id]);

  // Get fallback nightly rate from booking (stored at booking time)
  const fallbackRate = booking?.nightly_rate || booking?.ratePerNight ||
    (booking?.basePrice && originalNights > 0 ? booking.basePrice / originalNights : 0) ||
    (booking?.totalPrice && originalNights > 0 ? Math.round(booking.totalPrice / originalNights / 1.12) : 0);

  // Calculate billing based on daily rates (same as backend)
  // Falls back to stored nightly_rate if daily rates not available
  const calculatedBilling = useMemo(() => {
    if (nights <= 0) return null;

    // PRESERVE DISCOUNT: the stored nightly_rate already reflects any discount /
    // rate-plan agreed at booking time, and the backend reuses it for the same room
    // type when only dates change. Prefer it so this preview matches the saved bill
    // instead of showing the full public tariff (which would drop the discount).
    if (fallbackRate > 0) {
      const subtotal = Math.round(fallbackRate * nights);
      const { rate: taxRate } = getTaxRate(fallbackRate);
      const taxAmount = Math.round(subtotal * taxRate);
      const totalPrice = subtotal + taxAmount;

      return {
        nights,
        // Keep the per-night breakdown dates (if fetched) but at the agreed rate
        dailyRates: dailyRates.length === nights
          ? dailyRates.map((r) => ({ date: r.date, rate: fallbackRate }))
          : [],
        avgRate: fallbackRate,
        subtotal,
        taxRate,
        taxAmount,
        totalPrice,
        balanceDue: Math.max(0, totalPrice - amountPaid),
      };
    }

    // Fallback: no stored rate — use daily rates from the availability API
    if (dailyRates.length > 0) {
      const subtotal = dailyRates.reduce((sum, r) => sum + r.rate, 0);
      const avgRate = subtotal / dailyRates.length;
      // Tax rate: Use centralized pricing-sst
      const { rate: taxRate } = getTaxRate(avgRate);
      const taxAmount = Math.round(subtotal * taxRate);
      const totalPrice = Math.round(subtotal + taxAmount);

      return {
        nights: dailyRates.length,
        dailyRates,
        avgRate: Math.round(avgRate),
        subtotal: Math.round(subtotal),
        taxRate,
        taxAmount,
        totalPrice,
        balanceDue: Math.max(0, totalPrice - amountPaid),
      };
    }

    return null;
  }, [dailyRates, nights, amountPaid, fallbackRate]);

  // ── Discount maths ────────────────────────────────────────────────────────
  // Discount applies to the room subtotal (pre-tax). Use the freshly calculated
  // subtotal when dates changed, otherwise the booking's stored base price.
  const billingBase = calculatedBilling?.subtotal ?? booking?.basePrice ?? 0;
  const billingTax = calculatedBilling?.taxAmount ?? booking?.taxes ?? 0;

  const discountAmount = useMemo(() => {
    const v = parseFloat(discountValue) || 0;
    if (v <= 0 || billingBase <= 0) return 0;
    const raw = discountType === 'percent' ? (billingBase * v) / 100 : v;
    return Math.min(Math.round(raw), billingBase); // never exceed the subtotal
  }, [discountValue, discountType, billingBase]);

  const netTotal = Math.max(0, Math.round(billingBase + billingTax - discountAmount));
  const netBalance = Math.max(0, netTotal - amountPaid);
  // Whether the booking already carried a discount — lets us send a "clear to 0"
  const hadDiscount = (booking?.discountAmount || 0) > 0;

  const validateField = (name: string, value: string): string => {
    switch (name) {
      case 'guest':
        return value.trim() ? '' : 'Guest name is required';
      case 'email':
        return validateEmail(value);
      case 'phone':
        return validatePhone(value);
      case 'checkIn':
        return value ? '' : 'Check-in date is required';
      case 'checkOut':
        if (!value) return 'Check-out date is required';
        if (formState.checkIn && new Date(value) < new Date(formState.checkIn))
          return 'Check-out cannot be before check-in';
        return '';
      default:
        return '';
    }
  };

  const validateAll = (): boolean => {
    const newErrors: FieldErrors = {};
    let valid = true;
    // Only validate the dates that are actually editable. When a booking is checked
    // in (or terminal) the dates are locked and derived from the booking, so the form
    // fields may be empty — validating them would block an otherwise-valid save.
    const fields: (keyof FieldErrors)[] = ['guest', 'email', 'phone'];
    if (!isPostCheckIn) fields.push('checkIn');
    if (!isTerminal) fields.push('checkOut');

    fields.forEach((field) => {
      const msg = validateField(field, formState[field]);
      if (msg) {
        newErrors[field] = msg;
        valid = false;
      }
    });

    setErrors(newErrors);
    setTouched({ guest: true, email: true, phone: true, checkIn: true, checkOut: true });
    return valid;
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    setFormState((prev) => ({ ...prev, [name]: value }));

    if (touched[name]) {
      const msg = validateField(name, value);
      setErrors((prev) => ({ ...prev, [name]: msg || undefined }));
    }
  };

  const handleBlur = (event: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    const msg = validateField(name, value);
    setErrors((prev) => ({ ...prev, [name]: msg || undefined }));
  };

  const handleDateChange = (name: 'checkIn' | 'checkOut', value: string) => {
    setFormState((prev) => ({ ...prev, [name]: value }));
    setTouched((prev) => ({ ...prev, [name]: true }));
    const msg = validateField(name, value);
    setErrors((prev) => ({ ...prev, [name]: msg || undefined }));
  };

  const handleSubmit = (event?: React.FormEvent) => {
    event?.preventDefault();
    if (!booking) return;
    if (!validateAll()) {
      setSubmitAttempted(true); // surface a visible hint near the Save button
      return;
    }
    setSubmitAttempted(false);

    // Post check-in: preserve original check-in date, source, and special requests
    const safeCheckIn = isPostCheckIn ? (booking.checkIn || formState.checkIn) : formState.checkIn;
    const safeSource = isPostCheckIn ? (booking.source || formState.source) : formState.source;
    const safeNotes = isPostCheckIn ? (booking.specialRequests || formState.notes) : (formState.notes || '').trim();
    // Post check-out: also preserve check-out date
    const safeCheckOut = isTerminal ? (booking.checkOut || formState.checkOut) : formState.checkOut;

    // Include billing data if dates changed.
    // Guard every .trim() with `|| ''` — the booking-init effect may leave some
    // optional fields (eta/etd) undefined, and reading .trim() on them throws.
    const isBusiness = formState.stayPurpose === 'business';
    const saveData: any = {
      guest: (formState.guest || '').trim(),
      email: (formState.email || '').trim(),
      phone: (formState.phone || '').trim(),
      checkIn: safeCheckIn,
      checkOut: safeCheckOut,
      nights: calculateNights(safeCheckIn, safeCheckOut),
      specialRequests: safeNotes,
      source: safeSource,
      eta: (formState.eta || '').trim() || undefined,
      etd: (formState.etd || '').trim() || undefined,
      gstNumber: isBusiness ? (formState.gstNumber || '').trim() || null : null,
      stayPurpose: formState.stayPurpose,
      companyName: isBusiness ? (formState.companyName || '').trim() || null : null,
      companyAddress: isBusiness ? (formState.companyAddress || '').trim() || null : null,
    };

    // Add billing data if dates changed and we have new billing calculated
    if (datesHaveChanged && calculatedBilling) {
      saveData.basePrice = calculatedBilling.subtotal;
      saveData.taxes = calculatedBilling.taxAmount;
      saveData.totalPrice = calculatedBilling.totalPrice;
      saveData.ratePerNight = calculatedBilling.avgRate;
      saveData.balanceDue = calculatedBilling.balanceDue;
    }

    // Manual discount — send when the user has ENTERED a value (not when the
    // computed amount happens to be 0 from a stale base), or when clearing a
    // previously-saved discount. For a percentage we send the code (e.g. "10%")
    // and let the backend recompute off the authoritative base_price, so the
    // discount no longer depends on this modal's subtotal estimate.
    const pct = parseFloat(discountValue) || 0;
    const discountEntered = pct > 0;
    if (discountEntered || hadDiscount) {
      saveData.discountAmount = discountAmount;
      saveData.discountCode =
        discountType === 'percent' && pct > 0 ? `${pct}%` : null;
    }

    onSave(saveData);
  };

  // Determine booking lifecycle stage for field locking
  const statusNorm = (booking?.status || '').toUpperCase().replace(/[\s_]/g, '-');
  const isCheckedIn = statusNorm === 'IN-HOUSE' || statusNorm === 'CHECKED-IN';
  const isCheckedOut = statusNorm === 'CHECKED-OUT' || statusNorm === 'COMPLETED';
  const isCancelled = statusNorm === 'CANCELLED';
  const isNoShow = statusNorm === 'NO-SHOW';
  // Post check-in: lock source, check-in date, special requests (applies to checked-in, checked-out, cancelled, no-show)
  const isPostCheckIn = isCheckedIn || isCheckedOut || isCancelled || isNoShow;
  // Post check-out: additionally lock check-out date and all stay details
  const isTerminal = isCheckedOut || isCancelled;

  if (!booking) return null;

  const inputBase =
    'w-full h-9 px-3.5 rounded-lg text-[13px] bg-white border transition-all duration-200 ease-out focus:outline-none';
  const inputNormal = `${inputBase} border-neutral-200/80 hover:border-terra-300/60 focus:border-terra-400/60 focus:ring-2 focus:ring-terra-500/10`;
  const inputError = `${inputBase} border-red-300 hover:border-red-400 focus:border-red-400 focus:ring-2 focus:ring-red-500/10`;

  const getInputClass = (field: keyof FieldErrors) =>
    errors[field] && touched[field] ? inputError : inputNormal;

  const hasBlockingErrors = submitAttempted && Object.values(errors).some(Boolean);

  const drawerFooter = (
    <div className="flex items-center justify-end gap-3 w-full">
      {hasBlockingErrors && (
        <span className="mr-auto text-[12px] text-red-600">
          Please fix the highlighted fields above before saving.
        </span>
      )}
      <Button variant="outline" onClick={onClose}>
        Cancel
      </Button>
      <Button
        variant="primary"
        onClick={handleSubmit}
        loading={isSaving}
      >
        Save Changes
      </Button>
    </div>
  );

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Booking"
      subtitle="Update stay and guest details"
      maxWidth="max-w-2xl"
      footer={drawerFooter}
    >
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Guest Information */}
        <section>
          <h3 className="text-[11px] font-semibold uppercase tracking-widest text-neutral-400 mb-4">
            Guest Information
          </h3>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {/* Guest Name */}
              <div className="space-y-2">
                <label className="block text-[13px] font-medium text-neutral-700">
                  Guest Name <span className="text-red-500">*</span>
                </label>
                <input
                  name="guest"
                  value={formState.guest}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="John Doe"
                  className={getInputClass('guest')}
                />
                {errors.guest && touched.guest && (
                  <p className="text-[11px] text-red-600 font-medium">{errors.guest}</p>
                )}
              </div>

              {/* Email */}
              <div className="space-y-2">
                <label className="block text-[13px] font-medium text-neutral-700">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  name="email"
                  type="email"
                  value={formState.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="john@example.com"
                  className={getInputClass('email')}
                />
                {errors.email && touched.email && (
                  <p className="text-[11px] text-red-600 font-medium">{errors.email}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Phone */}
              <div className="space-y-2">
                <label className="block text-[13px] font-medium text-neutral-700">
                  Phone <span className="text-red-500">*</span>
                </label>
                <input
                  name="phone"
                  type="tel"
                  value={formState.phone}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="+1 (555) 123-4567"
                  className={getInputClass('phone')}
                />
                {errors.phone && touched.phone && (
                  <p className="text-[11px] text-red-600 font-medium">{errors.phone}</p>
                )}
              </div>

              {/* Booking Source */}
              <div className="space-y-2">
                <label className="block text-[13px] font-medium text-neutral-700">
                  Booking Source {isPostCheckIn && <span className="text-neutral-400 font-normal">(locked)</span>}
                </label>
                {isPostCheckIn ? (
                  <div className="h-9 px-3.5 rounded-lg text-[13px] bg-neutral-50 border border-neutral-200/80 text-neutral-500 flex items-center cursor-not-allowed">
                    {SOURCE_OPTIONS.find(o => o.value === formState.source)?.label || formState.source}
                  </div>
                ) : (
                  <CustomSelect
                    value={formState.source}
                    onChange={(value: string) => setFormState(prev => ({ ...prev, source: value }))}
                    options={SOURCE_OPTIONS}
                    placeholder="Select source"
                  />
                )}
              </div>
            </div>

            {/* Purpose of Stay */}
            <div className="space-y-2">
              <label className="block text-[13px] font-medium text-neutral-700">
                Purpose of Stay
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setFormState(prev => ({ ...prev, stayPurpose: 'personal' }))}
                  className={`flex items-center justify-center gap-1.5 px-3 h-9 rounded-lg border text-[13px] font-medium transition-all ${
                    formState.stayPurpose === 'personal'
                      ? 'border-terra-400 bg-terra-50 text-terra-700'
                      : 'border-neutral-200 text-neutral-600 hover:border-neutral-300 hover:bg-neutral-50'
                  }`}
                >
                  <User className="w-3.5 h-3.5" /> Personal
                </button>
                <button
                  type="button"
                  onClick={() => setFormState(prev => ({ ...prev, stayPurpose: 'business' }))}
                  className={`flex items-center justify-center gap-1.5 px-3 h-9 rounded-lg border text-[13px] font-medium transition-all ${
                    formState.stayPurpose === 'business'
                      ? 'border-terra-400 bg-terra-50 text-terra-700'
                      : 'border-neutral-200 text-neutral-600 hover:border-neutral-300 hover:bg-neutral-50'
                  }`}
                >
                  <Briefcase className="w-3.5 h-3.5" /> Office Work
                </button>
              </div>
            </div>

            {/* Company Details - shown only for business stays */}
            {formState.stayPurpose === 'business' && (
              <>
                <div className="space-y-2">
                  <label className="block text-[13px] font-medium text-neutral-700">
                    Company Name
                  </label>
                  <input
                    type="text"
                    name="companyName"
                    value={formState.companyName || ''}
                    onChange={(e) => setFormState(prev => ({ ...prev, companyName: e.target.value }))}
                    placeholder="e.g. Acme Pvt Ltd"
                    className={inputNormal}
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-[13px] font-medium text-neutral-700">
                    Company Address
                  </label>
                  <textarea
                    name="companyAddress"
                    value={formState.companyAddress || ''}
                    onChange={(e) => setFormState(prev => ({ ...prev, companyAddress: e.target.value }))}
                    rows={2}
                    placeholder="Street, city, state, postal code"
                    className="w-full px-3.5 py-2.5 rounded-lg text-[13px] bg-white border border-neutral-200/80 hover:border-terra-300/60 focus:border-terra-400/60 focus:ring-2 focus:ring-terra-500/10 focus:outline-none transition-all duration-200 ease-out resize-none"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-[13px] font-medium text-neutral-700">
                    GST Number
                  </label>
                  <input
                    type="text"
                    name="gstNumber"
                    value={formState.gstNumber || ''}
                    onChange={(e) => {
                      const val = e.target.value.toUpperCase();
                      setFormState(prev => ({
                        ...prev,
                        gstNumber: val
                      }));
                    }}
                    placeholder="e.g. 27AAAAA1111A1Z1"
                    className={inputNormal}
                  />
                  <p className="text-[11px] text-neutral-400">15-digit GSTIN for corporate tax claim</p>
                </div>
              </>
            )}
          </div>
        </section>

        {/* Stay Details */}
        <section>
          <h3 className="text-[11px] font-semibold uppercase tracking-widest text-neutral-400 mb-4">
            Stay Details
          </h3>
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              {/* Check-in */}
              <div className="space-y-2">
                <label className="block text-[13px] font-medium text-neutral-700">
                  Check-in {isPostCheckIn ? <span className="text-neutral-400 font-normal">(locked)</span> : <span className="text-red-500">*</span>}
                </label>
                {isPostCheckIn ? (
                  <div className="h-9 px-3.5 rounded-lg text-[13px] bg-neutral-50 border border-neutral-200/80 text-neutral-500 flex items-center cursor-not-allowed">
                    {formState.checkIn ? new Date(formState.checkIn + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                  </div>
                ) : (
                  <DatePicker
                    value={formState.checkIn}
                    onChange={(val) => handleDateChange('checkIn', val)}
                    placeholder="Select check-in"
                    minDate={monthStart}
                    className="w-full"
                  />
                )}
                {!isPostCheckIn && errors.checkIn && touched.checkIn && (
                  <p className="text-[11px] text-red-600 font-medium">{errors.checkIn}</p>
                )}
              </div>

              {/* Check-out */}
              <div className="space-y-2">
                <label className="block text-[13px] font-medium text-neutral-700">
                  Check-out {isTerminal ? <span className="text-neutral-400 font-normal">(locked)</span> : <span className="text-red-500">*</span>}
                </label>
                {isTerminal ? (
                  <div className="h-9 px-3.5 rounded-lg text-[13px] bg-neutral-50 border border-neutral-200/80 text-neutral-500 flex items-center cursor-not-allowed">
                    {formState.checkOut ? new Date(formState.checkOut + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                  </div>
                ) : (
                  <DatePicker
                    value={formState.checkOut}
                    onChange={(val) => handleDateChange('checkOut', val)}
                    placeholder="Select check-out"
                    minDate={formState.checkIn || monthStart}
                    className="w-full"
                  />
                )}
                {!isTerminal && errors.checkOut && touched.checkOut && (
                  <p className="text-[11px] text-red-600 font-medium">{errors.checkOut}</p>
                )}
              </div>

              {/* Nights */}
              <div className="space-y-2">
                <label className="block text-[13px] font-medium text-neutral-700">
                  Nights
                </label>
                <div className="h-9 px-3.5 bg-neutral-50 border border-neutral-200/80 rounded-lg text-neutral-700 font-medium flex items-center text-[13px]">
                  {nights > 0 ? `${nights} night${nights > 1 ? 's' : ''}` : (formState.checkIn && formState.checkOut && formState.checkIn === formState.checkOut ? 'Day use' : '—')}
                </div>
              </div>
            </div>

            {/* ETA / ETD - Expected arrival and departure times */}
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="space-y-2">
                <label className="block text-[13px] font-medium text-neutral-700">
                  ETA (Expected Arrival)
                </label>
                <input
                  name="eta"
                  type="time"
                  value={formState.eta}
                  onChange={handleChange}
                  className={inputNormal}
                />
              </div>
              <div className="space-y-2">
                <label className="block text-[13px] font-medium text-neutral-700">
                  ETD (Expected Departure)
                </label>
                <input
                  name="etd"
                  type="time"
                  value={formState.etd}
                  onChange={handleChange}
                  className={inputNormal}
                />
              </div>
            </div>
          </div>
        </section>

        {/* Billing Summary - Show when dates have changed */}
        {datesHaveChanged && (
          <section>
            <h3 className="text-[11px] font-semibold uppercase tracking-widest text-neutral-400 mb-4">
              Updated Billing
            </h3>
            <div className="p-4 bg-terra-50 rounded-lg border border-terra-100 space-y-3">
              {/* Change indicator */}
              <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-[13px] font-medium ${
                nights > originalNights
                  ? 'bg-blue-50 text-blue-700 border border-blue-200'
                  : nights < originalNights
                    ? 'bg-amber-50 text-amber-700 border border-amber-200'
                    : 'bg-neutral-50 text-neutral-600 border border-neutral-200'
              }`}>
                {nights > originalNights ? (
                  <>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Stay extended by {nights - originalNights} night{nights - originalNights !== 1 ? 's' : ''}
                  </>
                ) : nights < originalNights ? (
                  <>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                    </svg>
                    Stay shortened by {originalNights - nights} night{originalNights - nights !== 1 ? 's' : ''}
                  </>
                ) : (
                  'Dates updated (same duration)'
                )}
              </div>

              {/* Billing breakdown */}
              {isLoadingRates ? (
                <div className="flex items-center gap-2 text-[13px] text-neutral-500">
                  <div className="w-4 h-4 border-2 border-terra-300 border-t-transparent rounded-full animate-spin" />
                  Loading rates...
                </div>
              ) : calculatedBilling ? (
                <div className="space-y-2 text-[13px]">
                  {/* Daily rates breakdown - only show if we have daily rates */}
                  {calculatedBilling.dailyRates.length > 0 ? (
                    <div className="space-y-1 max-h-32 overflow-y-auto">
                      {calculatedBilling.dailyRates.map((r) => (
                        <div key={r.date} className="flex justify-between text-neutral-600">
                          <span>
                            {new Date(r.date + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                          </span>
                          <span>{formatCurrency(r.rate)}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex justify-between text-neutral-600">
                      <span>Rate per night</span>
                      <span>{formatCurrency(calculatedBilling.avgRate)}</span>
                    </div>
                  )}

                  <div className="flex justify-between pt-2 border-t border-terra-200">
                    <span className="text-neutral-600">Subtotal ({calculatedBilling.nights} night{calculatedBilling.nights !== 1 ? 's' : ''})</span>
                    <span className="text-neutral-700">{formatCurrency(calculatedBilling.subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-600">GST ({Math.round(calculatedBilling.taxRate * 100)}%)</span>
                    <span className="text-neutral-700">{formatCurrency(calculatedBilling.taxAmount)}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-terra-200">
                    <span className="font-semibold text-neutral-900">New Total</span>
                    <span className="font-bold text-terra-600">{formatCurrency(calculatedBilling.totalPrice)}</span>
                  </div>

                  {/* Show difference from original */}
                  {booking?.totalPrice && (
                    <div className={`flex justify-between text-[12px] ${
                      calculatedBilling.totalPrice > booking.totalPrice ? 'text-blue-600' : 'text-amber-600'
                    }`}>
                      <span>Difference from original</span>
                      <span>
                        {calculatedBilling.totalPrice > booking.totalPrice ? '+' : ''}
                        {formatCurrency(calculatedBilling.totalPrice - booking.totalPrice)}
                      </span>
                    </div>
                  )}

                  {/* Payment status */}
                  {amountPaid > 0 && (
                    <>
                      <div className="flex justify-between text-emerald-600">
                        <span>Already Paid</span>
                        <span>−{formatCurrency(amountPaid)}</span>
                      </div>
                      <div className={`flex justify-between pt-2 border-t border-terra-200 ${
                        calculatedBilling.balanceDue > 0 ? 'text-amber-700' : 'text-emerald-600'
                      }`}>
                        <span className="font-semibold">Balance Due</span>
                        <span className="font-bold">{formatCurrency(calculatedBilling.balanceDue)}</span>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <p className="text-[13px] text-neutral-500">Unable to calculate rates for selected dates.</p>
              )}

              {/* Note about billing sync */}
              <p className="text-[11px] text-neutral-500 mt-2">
                Folio charges will be automatically updated when you save.
              </p>
            </div>
          </section>
        )}

        {/* Current Billing Summary - Show when dates haven't changed */}
        {!datesHaveChanged && (
          <section>
            <h3 className="text-[11px] font-semibold uppercase tracking-widest text-neutral-400 mb-4">
              Billing Summary
            </h3>
            <div className="p-4 bg-neutral-50 rounded-lg border border-neutral-200 space-y-2 text-[13px]">
              {isLoadingRates ? (
                <div className="flex items-center gap-2 text-neutral-500">
                  <div className="w-4 h-4 border-2 border-neutral-300 border-t-transparent rounded-full animate-spin" />
                  Loading rates...
                </div>
              ) : calculatedBilling ? (
                <div className="space-y-2">
                  {/* Daily rates breakdown - only show if we have daily rates */}
                  {calculatedBilling.dailyRates.length > 0 ? (
                    <div className="space-y-1 max-h-32 overflow-y-auto">
                      {calculatedBilling.dailyRates.map((r) => (
                        <div key={r.date} className="flex justify-between text-neutral-600">
                          <span>
                            {new Date(r.date + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                          </span>
                          <span>{formatCurrency(r.rate)}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex justify-between text-neutral-600">
                      <span>Rate per night</span>
                      <span>{formatCurrency(calculatedBilling.avgRate)}</span>
                    </div>
                  )}

                  <div className="flex justify-between pt-2 border-t border-neutral-200">
                    <span className="text-neutral-600">Subtotal ({calculatedBilling.nights} night{calculatedBilling.nights !== 1 ? 's' : ''})</span>
                    <span className="text-neutral-700">{formatCurrency(calculatedBilling.subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-600">GST ({Math.round(calculatedBilling.taxRate * 100)}%)</span>
                    <span className="text-neutral-700">{formatCurrency(calculatedBilling.taxAmount)}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-neutral-200">
                    <span className="font-semibold text-neutral-900">Total</span>
                    <span className="font-bold text-neutral-900">{formatCurrency(calculatedBilling.totalPrice)}</span>
                  </div>

                  {/* Payment status */}
                  {amountPaid > 0 && (
                    <>
                      <div className="flex justify-between text-emerald-600">
                        <span>Paid</span>
                        <span>−{formatCurrency(amountPaid)}</span>
                      </div>
                      <div className={`flex justify-between pt-2 border-t border-neutral-200 ${
                        calculatedBilling.balanceDue > 0 ? 'text-amber-700' : 'text-emerald-600'
                      }`}>
                        <span className="font-medium">Balance Due</span>
                        <span className="font-semibold">{formatCurrency(calculatedBilling.balanceDue)}</span>
                      </div>
                    </>
                  )}
                </div>
              ) : booking?.totalPrice ? (
                /* Fallback to stored total if rates not available */
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-neutral-600">Total</span>
                    <span className="font-semibold text-neutral-900">{formatCurrency(booking.totalPrice || booking.total || 0)}</span>
                  </div>
                  {amountPaid > 0 && (() => {
                    const total = booking.totalPrice || booking.total || 0;
                    const balance = Math.max(0, total - amountPaid);
                    return (
                      <>
                        <div className="flex justify-between text-emerald-600">
                          <span>Paid</span>
                          <span>{formatCurrency(amountPaid)}</span>
                        </div>
                        <div className={`flex justify-between pt-2 border-t border-neutral-200 ${
                          balance > 0 ? 'text-amber-700' : 'text-emerald-600'
                        }`}>
                          <span className="font-medium">Balance</span>
                          <span className="font-semibold">{formatCurrency(balance)}</span>
                        </div>
                      </>
                    );
                  })()}
                </div>
              ) : null}
            </div>
          </section>
        )}

        {/* Discount — apply or edit a manual discount after booking */}
        {!isTerminal && (
          <section>
            <h3 className="text-[11px] font-semibold uppercase tracking-widest text-neutral-400 mb-4">
              Discount
            </h3>
            <div className="p-4 bg-neutral-50 rounded-lg border border-neutral-200 space-y-3 text-[13px]">
              <div className="flex items-center gap-2">
                {/* ₹ / % toggle */}
                <div className="flex rounded-lg border border-neutral-200 overflow-hidden shrink-0">
                  {(['flat', 'percent'] as const).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setDiscountType(t)}
                      className={`px-3 h-9 text-[13px] font-medium transition-colors ${
                        discountType === t
                          ? 'bg-terra-500 text-white'
                          : 'bg-white text-neutral-600 hover:bg-neutral-100'
                      }`}
                    >
                      {t === 'flat' ? '₹' : '%'}
                    </button>
                  ))}
                </div>
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={discountValue}
                  onChange={(e) => setDiscountValue(e.target.value)}
                  placeholder={discountType === 'percent' ? 'e.g. 10 (% off)' : 'e.g. 500 (₹ off)'}
                  className={`${inputNormal} flex-1`}
                />
                {discountValue !== '' && (
                  <button
                    type="button"
                    onClick={() => setDiscountValue('')}
                    className="text-[12px] text-neutral-500 hover:text-red-600 shrink-0"
                  >
                    Clear
                  </button>
                )}
              </div>

              {/* Net breakdown */}
              <div className="space-y-1.5 pt-1">
                <div className="flex justify-between text-neutral-600">
                  <span>Subtotal</span>
                  <span>{formatCurrency(billingBase)}</span>
                </div>
                <div className="flex justify-between text-neutral-600">
                  <span>GST</span>
                  <span>{formatCurrency(billingTax)}</span>
                </div>
                <div className="flex justify-between text-emerald-600">
                  <span>
                    Discount
                    {discountType === 'percent' && (parseFloat(discountValue) || 0) > 0
                      ? ` (${parseFloat(discountValue)}%)`
                      : ''}
                  </span>
                  <span>−{formatCurrency(discountAmount)}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-neutral-200">
                  <span className="font-semibold text-neutral-900">Net Total</span>
                  <span className="font-bold text-terra-600">{formatCurrency(netTotal)}</span>
                </div>
                {amountPaid > 0 && (
                  <div
                    className={`flex justify-between pt-2 border-t border-neutral-200 ${
                      netBalance > 0 ? 'text-amber-700' : 'text-emerald-600'
                    }`}
                  >
                    <span className="font-medium">Balance Due</span>
                    <span className="font-semibold">{formatCurrency(netBalance)}</span>
                  </div>
                )}
              </div>
              <p className="text-[11px] text-neutral-500">
                The discount reflects on the guest bill and folio after you save.
              </p>
            </div>
          </section>
        )}

        {/* Additional Notes */}
        {formState.notes && (
          <section>
            <h3 className="text-[11px] font-semibold uppercase tracking-widest text-neutral-400 mb-4">
              Guest Special Requests
            </h3>
            <div className="space-y-2">
              <label className="block text-[13px] font-medium text-neutral-700">
                Special Requests <span className="text-neutral-400 font-normal">{isPostCheckIn ? '(locked after check-in)' : '(read-only, set by guest)'}</span>
              </label>
              <textarea
                name="notes"
                value={formState.notes}
                readOnly
                rows={3}
                className="w-full px-3.5 py-2.5 rounded-lg text-[13px] bg-neutral-50 border border-neutral-200/80 text-neutral-600 cursor-not-allowed resize-none"
              />
            </div>
          </section>
        )}
      </form>
    </Drawer>
  );
}
