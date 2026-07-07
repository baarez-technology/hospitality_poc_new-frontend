/**
 * AddBookingModal Component
 * Create new bookings - Glimmora Design System v5.0
 * Side drawer following CMS pattern
 */

import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import {
  calculateNights,
  generateBookingId,
} from '../../utils/bookings';
import { getTaxRate } from '@/utils/pricing-sst';
import { Drawer } from '../ui2/Drawer';
import { Button } from '../ui2/Button';
import DatePicker from '../ui2/DatePicker';
import { useCurrency } from '@/hooks/useCurrency';
import { apiClient } from '@/api/client';
import { bookingApi } from '@/api/services/booking.service';
import { getAvailabilityGrid } from '@/api/services/availability.service';
import type { RoomRequest } from '@/api/services/multi-room.service';
import MultiRoomSelector, { type RoomType } from '../cbs/MultiRoomSelector';

const SOURCE_OPTIONS = [
  { value: 'Direct', label: 'Direct (Walk-in)' },
  { value: 'Website', label: 'Website' },
  { value: 'Corporate Portal', label: 'Corporate Portal' },
  { value: 'Booking.com', label: 'Booking.com' },
  { value: 'Expedia', label: 'Expedia' },
  { value: 'Dummy Channel Manager', label: 'Channel Manager' },
  { value: 'OTA', label: 'OTA (Other)' },
];

const PAYMENT_METHOD_OPTIONS = [
  { value: 'card', label: 'Credit/Debit Card' },
  { value: 'upi', label: 'UPI' },
  { value: 'bank_transfer', label: 'Bank Transfer' },
];

// Form validation errors interface
interface FormErrors {
  guestName?: string | null;
  email?: string | null;
  phone?: string | null;
  checkIn?: string | null;
  checkOut?: string | null;
  roomType?: string | null;
  ratePlan?: string | null;
  rateOverride?: string | null;
  discount?: string | null;
  [key: string]: string | null | undefined;
}

// Custom Select Component matching CMS pattern
function CustomSelect({ value, onChange, options, placeholder = 'Select...', isLoading = false, disabled = false }) {
  const [isOpen, setIsOpen] = useState(false);

  const selectedOption = options.find(opt => opt.value === value);
  const isDisabled = disabled || isLoading;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => !isDisabled && setIsOpen(!isOpen)}
        disabled={isDisabled}
        className={`w-full h-9 px-3.5 rounded-lg text-[13px] bg-white border transition-all duration-150 text-left flex items-center justify-between focus:outline-none ${
          isDisabled
            ? 'border-neutral-200 bg-neutral-50 cursor-not-allowed'
            : isOpen
              ? 'border-terra-400 ring-2 ring-terra-500/10'
              : 'border-neutral-200 hover:border-neutral-300'
        }`}
      >
        <span className={selectedOption ? 'text-neutral-900' : 'text-neutral-400'}>
          {isLoading ? 'Loading...' : (selectedOption?.label || placeholder)}
        </span>
        {isLoading ? (
          <svg className="w-4 h-4 text-neutral-400 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        ) : (
          <svg className={`w-4 h-4 text-neutral-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        )}
      </button>

      {isOpen && !isDisabled && options.length > 0 && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute z-50 w-full mt-1 bg-white rounded-lg border border-neutral-200 shadow-lg overflow-hidden max-h-60 overflow-y-auto">
            {options.map((option) => (
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

      {isOpen && !isDisabled && options.length === 0 && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute z-50 w-full mt-1 bg-white rounded-lg border border-neutral-200 shadow-lg overflow-hidden">
            <div className="px-3.5 py-2.5 text-[13px] text-neutral-500 text-center">
              No options available
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default function AddBookingModal({ isOpen, onClose, onSubmit, isCreating = false }) {
  const { formatCurrency } = useCurrency();
  const isSubmittingRef = useRef(false);

  // Reset isSubmittingRef when isCreating changes from true to false (API call completed)
  // or when modal is closed
  useEffect(() => {
    if (!isCreating) {
      isSubmittingRef.current = false;
    }
  }, [isCreating]);

  useEffect(() => {
    if (!isOpen) {
      isSubmittingRef.current = false;
    }
  }, [isOpen]);

  const initialFormData = {
    guestName: '',
    email: '',
    phone: '',
    nationality: '',
    checkIn: '',
    checkOut: '',
    roomType: '',
    adults: 1,
    children: 0,
    infants: 0,
    specialRequests: '',
    source: 'Direct',
    rateOverride: '',
    discount: '',
    isVip: false,
    gstNumber: '',
    companyName: '',
    companyAddress: '',
    eta: '',
    etd: '',
    paymentMethod: 'card',
    ratePlan: '',
  };

  const [formData, setFormData] = useState(initialFormData);
  const [errors, setErrors] = useState<FormErrors>({});
  const [apiRoomTypes, setApiRoomTypes] = useState<any[]>([]);
  const [apiRatePlans, setApiRatePlans] = useState<any[]>([]);
  const [isLoadingRoomTypes, setIsLoadingRoomTypes] = useState(true);
  const [isLoadingRatePlans, setIsLoadingRatePlans] = useState(true);

  // Restrict dates before current month (May 1st onwards allowed)
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth();
  const monthStart = new Date(currentYear, currentMonth, 1).toISOString().split('T')[0];

  // Multi-room booking state
  const [isMultiRoom, setIsMultiRoom] = useState(false);
  const [selectedRooms, setSelectedRooms] = useState<RoomRequest[]>([]);

  // Stop sell check state
  const [stopSellInfo, setStopSellInfo] = useState<{
    isStopSell: boolean;
    dates: string[];
    roomTypeName: string;
  } | null>(null);
  const [isCheckingStopSell, setIsCheckingStopSell] = useState(false);

  // Daily rates from availability grid (for date-specific pricing)
  const [dailyRates, setDailyRates] = useState<{
    date: string;
    rate: number;
  }[]>([]);

  // Fetch room types, rate plans each time modal opens
  useEffect(() => {
    if (!isOpen) return;

    // Fetch room types — try /room-types first, fallback to availability grid
    setIsLoadingRoomTypes(true);

    const extractRoomTypes = (res: any): any[] => {
      const raw = res?.data;
      console.log('[AddBookingModal] Room types API raw response:', JSON.stringify(raw)?.slice(0, 500));
      // Try every known response shape:
      // 1. { success: true, data: { items: [...] } }
      // 2. { data: { items: [...] } }
      // 3. { items: [...] }
      // 4. { success: true, data: [...] }
      // 5. { data: [...] }
      // 6. [...]
      const d = raw?.data ?? raw;
      const arr = d?.items ?? (Array.isArray(d) ? d : d?.data?.items ?? (Array.isArray(d?.data) ? d.data : []));
      return Array.isArray(arr) ? arr : [];
    };

    const mapRoomType = (rt: any) => ({
      name: rt.name || rt.room_type_name || rt.slug || 'Standard Room',
      price: rt.price || rt.base_price || rt.base_rate || 0,
      roomTypeId: rt.roomTypeId || rt.room_type_id || rt.id,
    });

    apiClient.get('/api/v1/room-types', { params: { pageSize: 100 } }).then((res) => {
      const roomTypes = extractRoomTypes(res);
      console.log('[AddBookingModal] Extracted room types:', roomTypes.length);
      if (roomTypes.length > 0) {
        setApiRoomTypes(roomTypes.map(mapRoomType));
      } else {
        // Fallback: extract unique room types from availability grid
        console.warn('[AddBookingModal] /room-types returned empty, trying availability grid fallback');
        const today = new Date().toISOString().split('T')[0];
        const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
        return apiClient.get('/api/v1/availability/grid', {
          params: { start_date: today, end_date: tomorrow }
        }).then((gridRes) => {
          const gridData = gridRes.data?.data || gridRes.data;
          const avail = gridData?.availability || gridData || [];
          if (Array.isArray(avail) && avail.length > 0) {
            // Deduplicate by room_type_id
            const seen = new Set<number>();
            const types = avail.filter((a: any) => {
              if (seen.has(a.room_type_id)) return false;
              seen.add(a.room_type_id);
              return true;
            });
            console.log('[AddBookingModal] Availability grid fallback room types:', types.length);
            setApiRoomTypes(types.map(mapRoomType));
          }
        });
      }
    }).catch((err) => {
      console.error('Failed to fetch room types:', err);
    }).finally(() => {
      setIsLoadingRoomTypes(false);
    });

    setIsLoadingRatePlans(true);
    apiClient.get('/api/v1/rates/plans', { params: { is_active: true } }).then((res) => {
      // API client interceptor wraps response: { success: true, data: ... }
      const responseData = res.data?.data || res.data;
      const plans = Array.isArray(responseData) ? responseData : responseData?.items || [];
      console.log('[AddBookingModal] Rate plans API response:', plans);
      setApiRatePlans(plans);
    }).catch((err) => {
      console.error('Failed to fetch rate plans:', err);
    }).finally(() => {
      setIsLoadingRatePlans(false);
    });
  }, [isOpen]);

  // Compute room type options - always use room type base price (no dynamic pricing overrides)
  // Rate plan discounts are applied separately
  const roomTypeOptions = useMemo(() => {
    return apiRoomTypes.map(rt => {
      const basePrice = rt.price || 0;
      return {
        value: rt.name,
        label: rt.name,
        price: basePrice,  // Always use room type base price
        basePrice,
      };
    });
  }, [apiRoomTypes]);

  // Room types formatted for MultiRoomSelector component
  const roomTypesForSelector: RoomType[] = useMemo(() => {
    return apiRoomTypes.map(rt => ({
      id: rt.roomTypeId,
      name: rt.name,
      basePrice: rt.price ?? 0,  // Always use room type base price
      maxGuests: 4, // Default max guests per room
    }));
  }, [apiRoomTypes]);

  // Compute rate plan options from API only (no fallback - sync with database)
  const ratePlanOptions = useMemo(() => {
    const plans = apiRatePlans;
    return plans.map(rp => {
      // Build label with discount info
      let discountLabel = '';
      if (rp.discount_type === 'percentage' && rp.discount_value > 0) {
        discountLabel = ` (${rp.discount_value}% off)`;
      } else if (rp.discount_type === 'flat' && rp.discount_value > 0) {
        discountLabel = ` (₹${rp.discount_value} off)`;
      } else if (rp.discount_type === 'fixed' && rp.discount_value > 0) {
        discountLabel = ` (₹${rp.discount_value} fixed)`;
      }
      return {
        value: rp.name || rp.code,
        label: `${rp.name || rp.code}${discountLabel}`,
        id: rp.id || null,
        description: rp.description || '',
        planType: rp.plan_type || '',
        basePrice: rp.base_price || 0,
        discountType: rp.discount_type || 'percentage',
        discountValue: rp.discount_value || 0,
      };
    });
  }, [apiRatePlans]);

  // Get selected rate plan details
  const selectedRatePlan = useMemo(() => {
    if (!formData.ratePlan) return null;
    return ratePlanOptions.find(rp => rp.value === formData.ratePlan) || null;
  }, [formData.ratePlan, ratePlanOptions]);

  // Check for stop sell and fetch daily rates when dates and room type change
  useEffect(() => {
    // Clear stop sell info and daily rates when inputs change
    setStopSellInfo(null);
    setDailyRates([]);

    if (!formData.checkIn || !formData.checkOut || !formData.roomType) {
      return;
    }

    // Get room type base price as fallback
    const roomTypeConfig = apiRoomTypes.find(rt => rt.name === formData.roomType);
    const basePrice = roomTypeConfig?.price || 0;

    let cancelled = false;
    setIsCheckingStopSell(true);

    // Fetch availability grid for the selected date range
    getAvailabilityGrid(formData.checkIn, formData.checkOut)
      .then((gridData) => {
        if (cancelled) return;

        // Filter availability data for the selected room type
        const roomTypeAvailability = gridData.availability.filter(
          (a) => a.room_type_name === formData.roomType
        );

        // Check if any date has is_closed = true (stop sell)
        const closedDates = roomTypeAvailability
          .filter((a) => a.is_closed)
          .map((a) => a.date);

        if (closedDates.length > 0) {
          setStopSellInfo({
            isStopSell: true,
            dates: closedDates,
            roomTypeName: formData.roomType,
          });
        } else {
          setStopSellInfo(null);
        }

        // Extract daily rates for pricing calculation
        // For booking, we need rates for check-in to (check-out - 1) dates
        // The availability grid returns dates from check-in to check-out (inclusive)
        // But we only charge for nights stayed (check-in to check-out - 1)
        // Special case: same-day booking (check-in = check-out) still counts as 1 night
        const isSameDayBooking = formData.checkIn === formData.checkOut;
        const rates = roomTypeAvailability
          .filter((a) => {
            // For same-day booking, include the check-in date
            if (isSameDayBooking) {
              return a.date === formData.checkIn;
            }
            // For multi-day booking, exclude checkout date
            return a.date < formData.checkOut;
          })
          .map((a) => ({
            date: a.date,
            rate: a.base_rate || basePrice, // Use date-specific rate or fall back to base price
          }))
          .sort((a, b) => a.date.localeCompare(b.date));

        setDailyRates(rates);
        console.log('[AddBookingModal] Daily rates loaded:', rates);
      })
      .catch((err) => {
        console.error('[AddBookingModal] Failed to check stop sell:', err);
        if (!cancelled) {
          setStopSellInfo(null);
          setDailyRates([]);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setIsCheckingStopSell(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [formData.checkIn, formData.checkOut, formData.roomType, apiRoomTypes]);

  // Fetch calculated rate from backend when rate plan, dates, or room type changes
  const [calculatedRate, setCalculatedRate] = useState<number | null>(null);
  const [isCalculatingRate, setIsCalculatingRate] = useState(false);

  // Store discount breakdown from rate plan calculation
  const [discountInfo, setDiscountInfo] = useState<{
    originalRate: number;
    discountAmount: number;
    discountType: string;
    discountValue: number;
    ratePlanName: string;
  } | null>(null);

  // Extract current room price to avoid infinite loop from roomTypeOptions reference
  const currentRoomPrice = useMemo(() => {
    const roomTypeConfig = roomTypeOptions.find(r => r.value === formData.roomType);
    return roomTypeConfig?.price || roomTypeConfig?.basePrice || 0;
  }, [roomTypeOptions, formData.roomType]);

  useEffect(() => {
    const ratePlanId = selectedRatePlan?.id;
    if (!ratePlanId || !formData.checkIn || !formData.checkOut || !formData.roomType) {
      setCalculatedRate(null);
      setDiscountInfo(null);
      return;
    }

    // Skip if room price is not yet loaded
    if (currentRoomPrice <= 0) {
      return;
    }

    let cancelled = false;
    setIsCalculatingRate(true);

    apiClient.get('/api/v1/rates/calculate', {
      params: {
        rate_plan_id: ratePlanId,
        arrival_date: formData.checkIn,
        departure_date: formData.checkOut,
        room_type: formData.roomType,
        base_price: currentRoomPrice,  // Pass room price for accurate discount calculation
      }
    }).then((res) => {
      if (cancelled) return;
      const data = res.data?.data || res.data;
      console.log('[AddBookingModal] Rate calculate response:', data);
      if (data?.rate_per_night != null && data.rate_per_night > 0) {
        setCalculatedRate(Math.round(data.rate_per_night));
        // Store discount breakdown info
        if (data.discount_amount > 0 || data.discount_type === 'fixed') {
          setDiscountInfo({
            originalRate: currentRoomPrice,
            discountAmount: data.discount_amount || (currentRoomPrice - data.rate_per_night),
            discountType: data.discount_type || 'percentage',
            discountValue: data.discount_value || 0,
            ratePlanName: selectedRatePlan?.value || 'Rate Plan',
          });
        } else {
          setDiscountInfo(null);
        }
      } else {
        setCalculatedRate(null);
        setDiscountInfo(null);
      }
    }).catch((err) => {
      if (!cancelled) {
        console.warn('[AddBookingModal] Rate calculation failed, using dynamic rate:', err);
        setCalculatedRate(null);
        setDiscountInfo(null);
      }
    }).finally(() => {
      if (!cancelled) setIsCalculatingRate(false);
    });

    return () => { cancelled = true; };
  }, [selectedRatePlan?.id, formData.checkIn, formData.checkOut, formData.roomType, currentRoomPrice]);

  // ── Guest email lookup (debounced) ──────────────────────────────
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

        // Autofill name + phone from guest profile
        setFormData(prev => {
          const updates: Record<string, string> = {};
          if (data.guest!.fullName) {
            updates.guestName = data.guest!.fullName;
          }
          if (data.guest!.phone) {
            updates.phone = data.guest!.phone;
          }
          return Object.keys(updates).length ? { ...prev, ...updates } : prev;
        });
      } catch {
        clearGuestLookup();
      }
    }, 450);
  }, [clearGuestLookup]);

  // ── Guest phone lookup (debounced) ──────────────────────────────
  const phoneLookupTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const lookupGuestByPhone = useCallback((phone: string) => {
    if (phoneLookupTimer.current) clearTimeout(phoneLookupTimer.current);
    const digits = phone.replace(/\D/g, '');
    if (digits.length < 10) return;
    phoneLookupTimer.current = setTimeout(async () => {
      try {
        const data = await bookingApi.getGuestPhoneLookup(phone.trim());
        if (!data.found || !data.guest) return;
        // Autofill name + email from phone match
        setFormData(prev => {
          const updates: Record<string, string> = {};
          if (data.guest!.fullName) {
            updates.guestName = data.guest!.fullName;
          }
          if (data.guest!.email) {
            updates.email = data.guest!.email;
          }
          return Object.keys(updates).length ? { ...prev, ...updates } : prev;
        });
      } catch {
        // Silently ignore lookup errors
      }
    }, 450);
  }, []);

  // Trigger lookup whenever email or phone field changes
  useEffect(() => {
    lookupGuestByEmail(formData.email);
    return () => { if (emailLookupTimer.current) clearTimeout(emailLookupTimer.current); };
  }, [formData.email, lookupGuestByEmail]);

  useEffect(() => {
    lookupGuestByPhone(formData.phone);
    return () => { if (phoneLookupTimer.current) clearTimeout(phoneLookupTimer.current); };
  }, [formData.phone, lookupGuestByPhone]);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setFormData(initialFormData);
      setErrors({});
      isSubmittingRef.current = false;
      clearGuestLookup();
      setIsMultiRoom(false);
      setSelectedRooms([]);
    }
  }, [isOpen]);

  // Set initial room type and rate plan to first available option when loaded
  useEffect(() => {
    if (roomTypeOptions.length > 0) {
      setFormData(prev => {
        const currentRoomTypeValid = roomTypeOptions.some(rt => rt.value === prev.roomType);
        if (!currentRoomTypeValid) {
          return { ...prev, roomType: roomTypeOptions[0].value };
        }
        return prev;
      });
    }
  }, [roomTypeOptions]);

  useEffect(() => {
    if (ratePlanOptions.length > 0) {
      setFormData(prev => {
        const currentRatePlanValid = ratePlanOptions.some(rp => rp.value === prev.ratePlan);
        if (!currentRatePlanValid) {
          return { ...prev, ratePlan: ratePlanOptions[0].value };
        }
        return prev;
      });
    }
  }, [ratePlanOptions]);

  // Calculate booking details using date-specific rates from availability grid
  // GST rates: 5% for room rate ≤ ₹7500/night, 18% for > ₹7500/night
  // Service fee: removed (was 5%, now 0 — matches backend and useGSTCalculator)
  const bookingCalc = useMemo(() => {
    const nights = calculateNights(formData.checkIn, formData.checkOut);
    const roomTypeConfig = roomTypeOptions.find(r => r.value === formData.roomType);
    const fallbackPrice = roomTypeConfig?.price ?? 0;

    let subtotal = 0;
    let baseRate = 0; // Average rate for display
    let rateBreakdown: { date: string; rate: number; originalRate?: number }[] = [];

    // Helper to apply rate plan discount to a rate
    const applyDiscount = (rate: number): number => {
      if (!discountInfo) return rate;
      if (discountInfo.discountType === 'percentage') {
        return Math.round(rate * (1 - discountInfo.discountValue / 100));
      } else if (discountInfo.discountType === 'flat') {
        return Math.max(0, rate - discountInfo.discountValue);
      } else if (discountInfo.discountType === 'fixed') {
        // Fixed rate plan means use the fixed rate, not the daily rate
        return discountInfo.discountValue;
      }
      return rate;
    };

    if (formData.rateOverride) {
      // Rate override: use flat rate for all nights (no discount applied)
      baseRate = parseFloat(formData.rateOverride);
      subtotal = baseRate * nights;
    } else if (dailyRates.length > 0) {
      // Use date-specific rates from availability grid
      // Apply rate plan discount to each daily rate
      rateBreakdown = dailyRates.map(dr => ({
        date: dr.date,
        rate: applyDiscount(dr.rate),
        originalRate: discountInfo ? dr.rate : undefined,
      }));

      // Calculate total by summing individual daily rates (after discount)
      subtotal = rateBreakdown.reduce((sum, dr) => sum + dr.rate, 0);
      baseRate = nights > 0 ? Math.round(subtotal / nights) : 0; // Average for display

      // If we have fewer rates than nights (missing dates), fill with fallback
      if (dailyRates.length < nights) {
        const missingNights = nights - dailyRates.length;
        const discountedFallback = applyDiscount(fallbackPrice);
        subtotal += discountedFallback * missingNights;
        baseRate = nights > 0 ? Math.round(subtotal / nights) : discountedFallback;
      }
    } else {
      // Fallback to room type base price (with discount if applicable)
      baseRate = applyDiscount(fallbackPrice);
      subtotal = baseRate * nights;
    }

    // Gross room charges before any manual discount
    const grossSubtotal = subtotal;

    // Manual discount: a flat amount entered by staff, subtracted from the
    // room charges (pre-tax). Clamped to [0, grossSubtotal].
    const parsedDiscount = Math.max(0, parseFloat(formData.discount) || 0);
    const discount = Math.min(parsedDiscount, grossSubtotal);
    // Net taxable subtotal after discount — this is what backend stores as basePrice
    subtotal = Math.round((grossSubtotal - discount) * 100) / 100;

    // GST slab: Use centralized pricing-sst for tax rate
    const { rate: gstRate } = getTaxRate(baseRate);
    // Round taxes to 2 decimal places using Math.round with proper precision
    // Use toFixed(2) then parseFloat to avoid floating point issues
    // Tax is calculated on the discounted (net) subtotal.
    const rawTaxes = subtotal * gstRate;
    const taxes = Math.round(rawTaxes * 100) / 100;
    // Service fee removed (matches backend and useGSTCalculator)
    const serviceFee = 0;
    // Round total the same way backend does (add then round)
    const total = Math.round((subtotal + taxes) * 100) / 100;

    // Debug logging for discount calculation
    if (parsedDiscount > 0) {
      console.log('[BookingCalc] Discount calculation:', {
        grossSubtotal,
        parsedDiscount,
        discount,
        netSubtotal: subtotal,
        gstRate,
        taxes,
        total
      });
    }

    return {
      nights,
      baseRate,
      grossSubtotal,
      discount,
      subtotal,
      taxes,
      serviceFee,
      total,
      gstRate,
      hasPriceError: baseRate === 0 && !formData.rateOverride,
      discountExceedsSubtotal: parsedDiscount > grossSubtotal && grossSubtotal > 0,
      rateBreakdown, // Include daily rate breakdown for display
      hasVariableRates: rateBreakdown.length > 0 && new Set(rateBreakdown.map(r => r.rate)).size > 1,
    };
  }, [formData.checkIn, formData.checkOut, formData.roomType, formData.rateOverride, formData.discount, roomTypeOptions, discountInfo, dailyRates]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const validate = () => {
    const newErrors: FormErrors = {};

    if (!formData.guestName.trim()) {
      newErrors.guestName = 'Guest name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^[\d\s\+\-\(\)]+$/.test(formData.phone.trim())) {
      newErrors.phone = 'Phone number contains invalid characters';
    } else if (formData.phone.replace(/\D/g, '').length < 10) {
      newErrors.phone = 'Phone number must have at least 10 digits';
    }

    if (!formData.checkIn) {
      newErrors.checkIn = 'Check-in date is required';
    }

    if (!formData.checkOut) {
      newErrors.checkOut = 'Check-out date is required';
    }

    if (formData.checkIn && formData.checkOut) {
      // String comparison is safe for YYYY-MM-DD (ISO date) values
      // Allow same-day bookings (check-out on same day as check-in)
      if (formData.checkOut < formData.checkIn) {
        newErrors.checkOut = 'Check-out cannot be before check-in';
      }
    }

    // Room type validation (only for single room mode)
    if (!isMultiRoom) {
      if (!formData.roomType) {
        newErrors.roomType = 'Room type is required';
      }

      if (!formData.ratePlan) {
        newErrors.ratePlan = 'Rate plan is required';
      }

      // Validate that we have a price - either from room type or override
      const roomTypeConfig = roomTypeOptions.find(r => r.value === formData.roomType);
      const hasPrice = formData.rateOverride ? parseFloat(formData.rateOverride) > 0 : (roomTypeConfig?.price > 0);
      if (!hasPrice) {
        newErrors.rateOverride = 'Rate is required - room type has no price configured';
      }
    } else {
      // Multi-room validation
      if (selectedRooms.length === 0) {
        newErrors.roomType = 'At least one room is required';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Toggle multi-room mode
  const handleMultiRoomToggle = (enabled: boolean) => {
    setIsMultiRoom(enabled);
    if (enabled && selectedRooms.length === 0 && roomTypesForSelector.length > 0) {
      // Initialize with one room when enabling multi-room mode
      setSelectedRooms([{
        room_type_id: roomTypesForSelector[0].id,
        adults: formData.adults || 1,
        children: formData.children || 0,
        special_requests: formData.specialRequests || '',
      }]);
    }
  };

  // Calculate multi-room pricing with per-room GST
  const multiRoomPricing = useMemo(() => {
    if (!isMultiRoom || selectedRooms.length === 0) {
      return { subtotal: 0, taxes: 0, total: 0, roomDetails: [] };
    }

    let totalSubtotal = 0;
    let totalTaxes = 0;
    const roomDetails: Array<{
      room_type_id: number;
      room_type_name: string;
      rate_per_night: number;
      nights: number;
      subtotal: number;
      gst_rate: number;
      taxes: number;
      total: number;
      adults: number;
      children: number;
      special_requests?: string;
    }> = [];

    selectedRooms.forEach((room) => {
      const roomType = roomTypesForSelector.find(rt => rt.id === room.room_type_id);
      const ratePerNight = roomType?.basePrice || 0;
      const roomSubtotal = ratePerNight * bookingCalc.nights;
      // GST slab: 5% for ≤7500/night, 18% for >7500/night (per room)
      const gstRate = ratePerNight > 7500 ? 0.18 : 0.05;
      const roomTaxes = Math.round(roomSubtotal * gstRate * 100) / 100;
      const roomTotal = roomSubtotal + roomTaxes;

      totalSubtotal += roomSubtotal;
      totalTaxes += roomTaxes;

      roomDetails.push({
        room_type_id: room.room_type_id,
        room_type_name: roomType?.name || 'Unknown',
        rate_per_night: ratePerNight,
        nights: bookingCalc.nights,
        subtotal: roomSubtotal,
        gst_rate: gstRate,
        taxes: roomTaxes,
        total: roomTotal,
        adults: room.adults || 1,
        children: room.children || 0,
        special_requests: room.special_requests,
      });
    });

    return {
      subtotal: totalSubtotal,
      taxes: Math.round(totalTaxes * 100) / 100,
      // Round total consistently with single room calculation
      total: Math.round((totalSubtotal + totalTaxes) * 100) / 100,
      roomDetails,
    };
  }, [isMultiRoom, selectedRooms, roomTypesForSelector, bookingCalc.nights]);

  // Alias for backward compatibility
  const multiRoomTotalPrice = multiRoomPricing.subtotal;

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (isCreating || isSubmittingRef.current) return; // Prevent double submission

    // Block booking if stop sell is active
    if (stopSellInfo?.isStopSell) {
      setErrors(prev => ({
        ...prev,
        roomType: `${stopSellInfo.roomTypeName} is stopped selling for the selected dates`
      }));
      return;
    }

    if (validate()) {
      isSubmittingRef.current = true;

      // Check if this is a multi-room booking
      const isGroupBooking = isMultiRoom && selectedRooms.length > 1;

      // Build rooms array with pricing for backend folio creation
      const roomsWithPricing = isGroupBooking
        ? multiRoomPricing.roomDetails.map(rd => ({
            room_type_id: rd.room_type_id,
            adults: rd.adults,
            children: rd.children,
            special_requests: rd.special_requests || '',
            // Include pricing for each room (backend uses this for folio)
            rate_per_night: rd.rate_per_night,
            subtotal: rd.subtotal,
            taxes: rd.taxes,
            total: rd.total,
          }))
        : undefined;

      const bookingData = {
        id: generateBookingId(),
        guest: formData.guestName.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        nationality: formData.nationality.trim(),
        checkIn: formData.checkIn,
        checkOut: formData.checkOut,
        nights: bookingCalc.nights,
        roomType: isGroupBooking ? undefined : formData.roomType,
        room: '',
        guests: formData.adults + formData.children + formData.infants,
        adults: formData.adults,
        children: formData.children,
        infants: formData.infants,
        specialRequests: formData.specialRequests.trim(),
        source: formData.source,
        amount: isGroupBooking ? multiRoomPricing.total : bookingCalc.total,
        // Price breakdown for backend to store
        // Send GROSS subtotal (before discount) as basePrice; discount is applied separately
        basePrice: isGroupBooking ? multiRoomPricing.subtotal : bookingCalc.grossSubtotal,
        taxes: isGroupBooking ? multiRoomPricing.taxes : bookingCalc.taxes,
        serviceFee: bookingCalc.serviceFee,
        totalPrice: isGroupBooking ? multiRoomPricing.total : bookingCalc.total,
        ratePerNight: isGroupBooking ? undefined : bookingCalc.baseRate,
        status: 'PENDING',
        bookedOn: new Date().toISOString().split('T')[0],
        vip: formData.isVip,
        isVip: formData.isVip,
        gstNumber: formData.gstNumber || undefined,
        companyName: formData.companyName || undefined,
        companyAddress: formData.companyAddress || undefined,
        eta: formData.eta || undefined,
        etd: formData.etd || undefined,
        paymentMethod: formData.paymentMethod,
        ratePlan: formData.ratePlan,
        upsells: [],
        // Manual discount applied by staff (flat amount in ₹)
        discountAmount: isGroupBooking ? 0 : bookingCalc.discount,
        // Multi-room booking: include rooms array with pricing
        rooms: roomsWithPricing,
      };
      // Don't close here - let parent handle closing after API response
      onSubmit(bookingData);
    }
  };

  const drawerFooter = (
    <div className="flex items-center justify-end gap-3 w-full">
      <Button variant="outline" onClick={onClose} disabled={isCreating}>
        Cancel
      </Button>
      <Button
        variant="primary"
        onClick={handleSubmit}
        loading={isCreating}
        disabled={isCreating || stopSellInfo?.isStopSell}
      >
        {isCreating ? 'Creating...' : stopSellInfo?.isStopSell ? 'Room Stopped Selling' : 'Create Booking'}
      </Button>
    </div>
  );

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title="New Booking"
      subtitle="Create a new reservation"
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
            <div className="space-y-2">
              <label className="block text-[13px] font-medium text-neutral-700">
                Guest Name
                <span className="text-rose-500 ml-0.5">*</span>
              </label>
              <input
                type="text"
                name="guestName"
                value={formData.guestName}
                onChange={handleChange}
                placeholder="John Doe"
                className={`w-full h-9 px-3.5 rounded-lg text-[13px] bg-white border transition-all duration-150 focus:outline-none ${
                  errors.guestName
                    ? 'border-rose-400 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/10'
                    : 'border-neutral-200 hover:border-neutral-300 focus:border-terra-400 focus:ring-2 focus:ring-terra-500/10'
                }`}
              />
              {errors.guestName && (
                <p className="text-[11px] text-rose-500">{errors.guestName}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-[13px] font-medium text-neutral-700">
                  Email
                  <span className="text-rose-500 ml-0.5">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="john@example.com"
                  className={`w-full h-9 px-3.5 rounded-lg text-[13px] bg-white border transition-all duration-150 focus:outline-none ${
                    errors.email
                      ? 'border-rose-400 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/10'
                      : 'border-neutral-200 hover:border-neutral-300 focus:border-terra-400 focus:ring-2 focus:ring-terra-500/10'
                  }`}
                />
                {errors.email && (
                  <p className="text-[11px] text-rose-500">{errors.email}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="block text-[13px] font-medium text-neutral-700">
                  Phone <span className="text-rose-500">*</span>
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="e.g. +1 (555) 441-7983 or 9876543210"
                  inputMode="tel"
                  required
                  onKeyDown={(e) => {
                    const allowed = ['Backspace', 'Delete', 'Tab', 'Escape', 'Enter', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'];
                    if (allowed.includes(e.key)) return;
                    if ((e.ctrlKey || e.metaKey) && ['a', 'c', 'v', 'x'].includes(e.key.toLowerCase())) return;
                    if (!/^[\d\s\+\-\(\)]$/.test(e.key)) e.preventDefault();
                  }}
                  className={`w-full h-9 px-3.5 rounded-lg text-[13px] bg-white border transition-all duration-150 focus:outline-none focus:ring-2 ${
                    errors.phone
                      ? 'border-rose-400 focus:border-rose-400 focus:ring-rose-500/10'
                      : 'border-neutral-200 hover:border-neutral-300 focus:border-terra-400 focus:ring-terra-500/10'
                  }`}
                />
                {errors.phone && (
                  <p className="text-[11px] text-rose-500">{errors.phone}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-[13px] font-medium text-neutral-700">
                Nationality / Country
              </label>
              <input
                type="text"
                name="nationality"
                value={formData.nationality}
                onChange={handleChange}
                placeholder="e.g. India, United States"
                className="w-full h-9 px-3.5 rounded-lg text-[13px] bg-white border border-neutral-200 hover:border-neutral-300 focus:border-terra-400 focus:ring-2 focus:ring-terra-500/10 focus:outline-none transition-all duration-150"
              />
            </div>
          </div>
        </section>

        {/* Guest Status & Corporate */}
        <section>
          <h3 className="text-[11px] font-semibold uppercase tracking-widest text-neutral-400 mb-4">
            Guest Status
          </h3>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, isVip: false }))}
                className={`flex-1 h-10 rounded-lg text-[13px] font-medium border-2 transition-all ${
                  !formData.isVip
                    ? 'border-terra-500 bg-terra-50 text-terra-700'
                    : 'border-neutral-200 text-neutral-500 hover:border-neutral-300'
                }`}
              >
                Regular
              </button>
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, isVip: true }))}
                className={`flex-1 h-10 rounded-lg text-[13px] font-medium border-2 transition-all ${
                  formData.isVip
                    ? 'border-amber-500 bg-amber-50 text-amber-700'
                    : 'border-neutral-200 text-neutral-500 hover:border-neutral-300'
                }`}
              >
                VIP
              </button>
            </div>

            <div className="space-y-2">
              <label className="block text-[13px] font-medium text-neutral-700">
                GST Number
              </label>
              <input
                type="text"
                name="gstNumber"
                value={formData.gstNumber || ''}
                onChange={(e) => {
                  const val = e.target.value.toUpperCase();
                  setFormData(prev => ({
                    ...prev,
                    gstNumber: val
                  }));
                }}
                placeholder="e.g. 27AAAAA1111A1Z1"
                className="w-full h-9 px-3.5 rounded-lg text-[13px] bg-white border border-neutral-200 hover:border-neutral-300 focus:border-terra-400 focus:ring-2 focus:ring-terra-500/10 focus:outline-none transition-all duration-150"
              />
            </div>
          </div>
        </section>

        {/* Stay Details */}
        <section>
          <h3 className="text-[11px] font-semibold uppercase tracking-widest text-neutral-400 mb-4">
            Stay Details
          </h3>

          {/* Returning-guest info cards */}
          {matchedGuestId !== null && (
            <div className="space-y-3 mb-6">
              {/* Stay count + View history */}
              <div className="flex items-center justify-between rounded-lg border border-neutral-200 bg-white px-4 py-3">
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
                  className="whitespace-nowrap rounded-lg border border-neutral-300 bg-white px-3 py-1.5 text-[12px] font-medium text-neutral-700 hover:bg-neutral-50 transition-colors"
                >
                  View stay history
                </button>
              </div>

              {/* Last stay detail */}
              {lastStaySummary && (
                <div className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-3">
                  <p className="text-[13px] font-medium text-amber-900">{lastStaySummary}</p>
                </div>
              )}

              {/* Points / loyalty */}
              <div className="rounded-lg border border-neutral-200 bg-white px-4 py-3">
                <p className="text-[13px] font-medium text-neutral-700">
                  {guestMetaLine || 'Points: 0'}
                </p>
              </div>
            </div>
          )}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-[13px] font-medium text-neutral-700">
                  Check-in Date
                  <span className="text-rose-500 ml-0.5">*</span>
                </label>
                <DatePicker
                  value={formData.checkIn}
                  onChange={(value) => {
                    setFormData(prev => ({ ...prev, checkIn: value }));
                    // Clear both checkIn error and the cross-field checkOut error
                    // since checkOut validity depends on checkIn
                    setErrors(prev => ({ ...prev, checkIn: null, checkOut: null }));
                  }}
                  placeholder="Select check-in date"
                  minDate={monthStart}
                  className="w-full"
                />
                {errors.checkIn && (
                  <p className="text-[11px] text-rose-500">{errors.checkIn}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="block text-[13px] font-medium text-neutral-700">
                  Check-out Date
                  <span className="text-rose-500 ml-0.5">*</span>
                </label>
                <DatePicker
                  value={formData.checkOut}
                  onChange={(value) => {
                    setFormData(prev => ({ ...prev, checkOut: value }));
                    if (errors.checkOut) {
                      setErrors(prev => ({ ...prev, checkOut: null }));
                    }
                  }}
                  placeholder="Select check-out date"
                  minDate={formData.checkIn || monthStart}
                  className="w-full"
                />
                {errors.checkOut && (
                  <p className="text-[11px] text-rose-500">{errors.checkOut}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-4 gap-4">
              <div className="space-y-2">
                <label className="block text-[13px] font-medium text-neutral-700">
                  Adults
                </label>
                <input
                  type="number"
                  name="adults"
                  value={formData.adults}
                  onChange={handleChange}
                  min="1"
                  max="6"
                  className="w-full h-9 px-3.5 rounded-lg text-[13px] bg-white border border-neutral-200 hover:border-neutral-300 focus:border-terra-400 focus:ring-2 focus:ring-terra-500/10 focus:outline-none transition-all duration-150"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-[13px] font-medium text-neutral-700">
                  Children
                </label>
                <input
                  type="number"
                  name="children"
                  value={formData.children}
                  onChange={handleChange}
                  min="0"
                  max="4"
                  className="w-full h-9 px-3.5 rounded-lg text-[13px] bg-white border border-neutral-200 hover:border-neutral-300 focus:border-terra-400 focus:ring-2 focus:ring-terra-500/10 focus:outline-none transition-all duration-150"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-[13px] font-medium text-neutral-700">
                  Infants
                </label>
                <input
                  type="number"
                  name="infants"
                  value={formData.infants}
                  onChange={handleChange}
                  min="0"
                  max="2"
                  className="w-full h-9 px-3.5 rounded-lg text-[13px] bg-white border border-neutral-200 hover:border-neutral-300 focus:border-terra-400 focus:ring-2 focus:ring-terra-500/10 focus:outline-none transition-all duration-150"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-[13px] font-medium text-neutral-700">
                  Nights
                </label>
                <div className="h-9 px-3.5 bg-neutral-50 border border-neutral-200 rounded-lg text-neutral-700 font-medium flex items-center text-[13px]">
                  {bookingCalc.nights || '-'}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-[13px] font-medium text-neutral-700">
                  ETA (Expected Arrival)
                </label>
                <input
                  type="time"
                  name="eta"
                  value={formData.eta}
                  onChange={handleChange}
                  className="w-full h-9 px-3.5 rounded-lg text-[13px] bg-white border border-neutral-200 hover:border-neutral-300 focus:border-terra-400 focus:ring-2 focus:ring-terra-500/10 focus:outline-none transition-all duration-150"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-[13px] font-medium text-neutral-700">
                  ETD (Expected Departure)
                </label>
                <input
                  type="time"
                  name="etd"
                  value={formData.etd}
                  onChange={handleChange}
                  className="w-full h-9 px-3.5 rounded-lg text-[13px] bg-white border border-neutral-200 hover:border-neutral-300 focus:border-terra-400 focus:ring-2 focus:ring-terra-500/10 focus:outline-none transition-all duration-150"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Room, Rate & Source */}
        <section>
          <h3 className="text-[11px] font-semibold uppercase tracking-widest text-neutral-400 mb-4">
            Room & Source
          </h3>
          <div className="space-y-4">
            {/* Multi-room toggle */}
            <div className="flex items-center gap-3 pb-3 border-b border-neutral-100">
              <button
                type="button"
                onClick={() => handleMultiRoomToggle(false)}
                className={`flex-1 h-10 rounded-lg text-[13px] font-medium border-2 transition-all ${
                  !isMultiRoom
                    ? 'border-terra-500 bg-terra-50 text-terra-700'
                    : 'border-neutral-200 text-neutral-500 hover:border-neutral-300'
                }`}
              >
                Single Room
              </button>
              <button
                type="button"
                onClick={() => handleMultiRoomToggle(true)}
                disabled={roomTypesForSelector.length === 0}
                className={`flex-1 h-10 rounded-lg text-[13px] font-medium border-2 transition-all ${
                  isMultiRoom
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-neutral-200 text-neutral-500 hover:border-neutral-300'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                Multiple Rooms
              </button>
            </div>

            {/* Multi-room selector */}
            {isMultiRoom ? (
              <div className="space-y-3">
                <p className="text-[12px] text-neutral-500">
                  Add multiple rooms for a group booking. Each room can have different room type and guest counts.
                </p>
                <MultiRoomSelector
                  rooms={selectedRooms}
                  onChange={setSelectedRooms}
                  roomTypes={roomTypesForSelector}
                  nights={bookingCalc.nights}
                  disabled={isCreating}
                  maxRooms={10}
                />
              </div>
            ) : (
              /* Single room selection */
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-[13px] font-medium text-neutral-700">
                    Room Type <span className="text-rose-500">*</span>
                  </label>
                  <CustomSelect
                    value={formData.roomType}
                    onChange={(value) => {
                      setFormData(prev => ({ ...prev, roomType: value }));
                      if (errors.roomType) setErrors(prev => ({ ...prev, roomType: null }));
                    }}
                    options={roomTypeOptions.map(type => ({
                      value: type.value,
                      label: `${type.label} - ${formatCurrency(type.price)}/night`
                    }))}
                    placeholder="Select room type"
                    isLoading={isLoadingRoomTypes}
                  />
                  {errors.roomType && (
                    <p className="text-[11px] text-rose-500">{errors.roomType}</p>
                  )}
                  {!isLoadingRoomTypes && roomTypeOptions.length === 0 && (
                    <p className="text-[11px] text-amber-600">No room types found in database</p>
                  )}
                </div>

              <div className="space-y-2">
                <label className="block text-[13px] font-medium text-neutral-700">
                  Rate Plan <span className="text-rose-500">*</span>
                </label>
                <CustomSelect
                  value={formData.ratePlan}
                  onChange={(value) => {
                    setFormData(prev => ({ ...prev, ratePlan: value }));
                    if (errors.ratePlan) setErrors(prev => ({ ...prev, ratePlan: null }));
                  }}
                  options={ratePlanOptions}
                  placeholder="Select rate plan"
                  isLoading={isLoadingRatePlans}
                />
                {errors.ratePlan && (
                  <p className="text-[11px] text-rose-500">{errors.ratePlan}</p>
                )}
                {!isLoadingRatePlans && ratePlanOptions.length === 0 && (
                  <p className="text-[11px] text-amber-600">No rate plans found in database</p>
                )}
                {selectedRatePlan && selectedRatePlan.description && (
                  <div className="mt-1.5 rounded-md bg-blue-50 border border-blue-100 px-3 py-2">
                    <p className="text-[11px] text-blue-800 leading-relaxed">
                      {selectedRatePlan.planType && (
                        <span className="inline-block bg-blue-100 text-blue-700 text-[10px] font-medium px-1.5 py-0.5 rounded mr-1.5 uppercase">
                          {selectedRatePlan.planType}
                        </span>
                      )}
                      {selectedRatePlan.description}
                    </p>
                  </div>
                )}
              </div>
            </div>
            )}

            {/* Stop Sell Warning */}
            {stopSellInfo?.isStopSell && (
              <div className="rounded-lg bg-rose-50 border border-rose-200 p-4">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-0.5">
                    <svg className="w-5 h-5 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-[13px] font-semibold text-rose-800">
                      Room Stopped Selling
                    </h4>
                    <p className="text-[12px] text-rose-700 mt-1">
                      <strong>{stopSellInfo.roomTypeName}</strong> is not available for booking on the following dates:
                    </p>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {stopSellInfo.dates.map((date) => (
                        <span
                          key={date}
                          className="inline-block bg-rose-100 text-rose-700 text-[11px] font-medium px-2 py-0.5 rounded"
                        >
                          {new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                        </span>
                      ))}
                    </div>
                    <p className="text-[11px] text-rose-600 mt-2">
                      Please select different dates or choose another room type to proceed.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Checking stop sell indicator */}
            {isCheckingStopSell && formData.roomType && formData.checkIn && formData.checkOut && (
              <div className="flex items-center gap-2 text-[12px] text-neutral-500">
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Checking availability...
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-[13px] font-medium text-neutral-700">
                  Booking Source
                </label>
                <CustomSelect
                  value={formData.source}
                  onChange={(value) => setFormData(prev => ({ ...prev, source: value }))}
                  options={SOURCE_OPTIONS}
                  placeholder="Select source"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-[13px] font-medium text-neutral-700">
                  Payment Method
                </label>
                <CustomSelect
                  value={formData.paymentMethod}
                  onChange={(value) => setFormData(prev => ({ ...prev, paymentMethod: value }))}
                  options={PAYMENT_METHOD_OPTIONS}
                  placeholder="Select payment method"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-[13px] font-medium text-neutral-700">
                Special Requests
              </label>
              <textarea
                name="specialRequests"
                value={formData.specialRequests}
                onChange={handleChange}
                rows={2}
                placeholder="Any special requirements..."
                className="w-full px-3.5 py-2.5 rounded-lg text-[13px] bg-white border border-neutral-200 hover:border-neutral-300 focus:border-terra-400 focus:ring-2 focus:ring-terra-500/10 focus:outline-none transition-all duration-150 resize-none"
              />
            </div>
          </div>
        </section>

        {/* Payment Summary */}
        <section>
          <h3 className="text-[11px] font-semibold uppercase tracking-widest text-neutral-400 mb-4">
            Payment
          </h3>
          <div className="space-y-4">
            {/* Rate override - only for single room mode */}
            {!isMultiRoom && (
              <div className="space-y-2">
                <label className="block text-[13px] font-medium text-neutral-700">
                  Rate per Night {bookingCalc.hasPriceError && <span className="text-rose-500">*</span>}
                </label>
                <input
                  type="number"
                  name="rateOverride"
                  value={formData.rateOverride}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  placeholder={
                    isCalculatingRate
                      ? 'Calculating rate...'
                      : calculatedRate
                        ? `${selectedRatePlan?.value || 'Plan'}: ${formatCurrency(calculatedRate)}`
                        : roomTypeOptions.find(r => r.value === formData.roomType)?.price
                          ? `Default: ${formatCurrency(roomTypeOptions.find(r => r.value === formData.roomType)?.price)}`
                          : 'Enter rate (no default price set)'
                  }
                  className={`w-full h-9 px-3.5 rounded-lg text-[13px] bg-white border transition-all duration-150 focus:outline-none ${
                    bookingCalc.hasPriceError
                      ? 'border-rose-300 hover:border-rose-400 focus:border-rose-400 focus:ring-2 focus:ring-rose-500/10'
                      : 'border-neutral-200 hover:border-neutral-300 focus:border-terra-400 focus:ring-2 focus:ring-terra-500/10'
                  }`}
                />
                {isCalculatingRate && (
                  <p className="text-[11px] text-blue-600">Calculating rate for {selectedRatePlan?.value}...</p>
                )}
                {!isCalculatingRate && calculatedRate && !formData.rateOverride && (
                  <p className="text-[11px] text-green-600">
                    Rate plan "{selectedRatePlan?.value}" rate: {formatCurrency(calculatedRate)}/night
                    {(() => {
                      const roomPrice = roomTypeOptions.find(r => r.value === formData.roomType)?.price || 0;
                      if (roomPrice > 0 && calculatedRate !== roomPrice) {
                        const diff = Math.round(((calculatedRate - roomPrice) / roomPrice) * 100);
                        return diff < 0
                          ? ` (${diff}% from base ${formatCurrency(roomPrice)})`
                          : ` (+${diff}% from base ${formatCurrency(roomPrice)})`;
                      }
                      return '';
                    })()}
                  </p>
                )}
                {bookingCalc.hasPriceError && (
                  <p className="text-[11px] text-rose-500">Room type has no price configured. Please enter a rate.</p>
                )}
              </div>
            )}

            {/* Manual discount - only for single room mode */}
            {!isMultiRoom && (
              <div className="space-y-2">
                <label className="block text-[13px] font-medium text-neutral-700">
                  Discount
                </label>
                <input
                  type="number"
                  name="discount"
                  value={formData.discount}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  placeholder="Enter discount amount (₹)"
                  className={`w-full h-9 px-3.5 rounded-lg text-[13px] bg-white border transition-all duration-150 focus:outline-none ${
                    bookingCalc.discountExceedsSubtotal
                      ? 'border-rose-300 hover:border-rose-400 focus:border-rose-400 focus:ring-2 focus:ring-rose-500/10'
                      : 'border-neutral-200 hover:border-neutral-300 focus:border-terra-400 focus:ring-2 focus:ring-terra-500/10'
                  }`}
                />
                {bookingCalc.discountExceedsSubtotal ? (
                  <p className="text-[11px] text-rose-500">
                    Discount can't exceed the room charges ({formatCurrency(bookingCalc.grossSubtotal)}). Capped at the subtotal.
                  </p>
                ) : (
                  <p className="text-[11px] text-neutral-400">Flat amount subtracted from the room charges before tax.</p>
                )}
              </div>
            )}

            {/* Multi-room summary with per-room breakdown */}
            {isMultiRoom && selectedRooms.length > 0 && bookingCalc.nights > 0 && (
              <div className="space-y-3">
                {/* Per-room charges */}
                <div className="space-y-2">
                  {multiRoomPricing.roomDetails.map((rd, idx) => (
                    <div key={idx} className="p-3 bg-white rounded-lg border border-neutral-200">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="text-[13px] font-medium text-neutral-900">
                            Room {idx + 1}: {rd.room_type_name}
                          </p>
                          <p className="text-[11px] text-neutral-500">
                            {rd.adults} adult{rd.adults !== 1 ? 's' : ''}
                            {rd.children > 0 && `, ${rd.children} child${rd.children !== 1 ? 'ren' : ''}`}
                          </p>
                        </div>
                        <p className="text-[13px] font-semibold text-neutral-900">
                          {formatCurrency(rd.total)}
                        </p>
                      </div>
                      <div className="text-[11px] text-neutral-500 space-y-0.5">
                        <div className="flex justify-between">
                          <span>{formatCurrency(rd.rate_per_night)} x {rd.nights} night{rd.nights > 1 ? 's' : ''}</span>
                          <span>{formatCurrency(rd.subtotal)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>GST ({Math.round(rd.gst_rate * 100)}%)</span>
                          <span>{formatCurrency(rd.taxes)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Group total */}
                <div className="p-4 bg-blue-500 rounded-lg text-white">
                  <div className="space-y-2">
                    <div className="flex justify-between text-[13px]">
                      <span className="text-blue-100">
                        {selectedRooms.length} room{selectedRooms.length > 1 ? 's' : ''} subtotal
                      </span>
                      <span className="text-blue-100">{formatCurrency(multiRoomPricing.subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-[13px]">
                      <span className="text-blue-100">Total GST</span>
                      <span className="text-blue-100">{formatCurrency(multiRoomPricing.taxes)}</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-blue-400">
                      <span className="font-semibold text-[13px]">Group Total</span>
                      <span className="font-bold text-xl">{formatCurrency(multiRoomPricing.total)}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Single room summary */}
            {!isMultiRoom && bookingCalc.nights > 0 && (
              <div className="p-4 bg-terra-50 rounded-lg border border-terra-100">
                <div className="space-y-2">
                  {/* Show original price and discount if rate plan applied */}
                  {discountInfo && discountInfo.discountAmount > 0 && (
                    <>
                      <div className="flex justify-between text-[13px]">
                        <span className="text-neutral-500">
                          Original rate
                        </span>
                        <span className="text-neutral-500 line-through">
                          {formatCurrency(discountInfo.originalRate)}/night
                        </span>
                      </div>
                      <div className="flex justify-between text-[13px]">
                        <span className="text-green-600">
                          {discountInfo.ratePlanName} {discountInfo.discountType === 'percentage'
                            ? `(${discountInfo.discountValue}% off)`
                            : discountInfo.discountType === 'flat'
                              ? `(₹${discountInfo.discountValue} off)`
                              : '(Fixed rate)'}
                        </span>
                        <span className="text-green-600">
                          -{formatCurrency(discountInfo.discountAmount * bookingCalc.nights)}
                        </span>
                      </div>
                    </>
                  )}
                  {/* Show rate breakdown for variable rates */}
                  {bookingCalc.hasVariableRates ? (
                    <div className="space-y-1">
                      <div className="text-[12px] text-neutral-500 font-medium mb-1">Nightly rates:</div>
                      {bookingCalc.rateBreakdown.map((dr, idx) => (
                        <div key={dr.date} className="flex justify-between text-[12px]">
                          <span className="text-neutral-500">
                            {new Date(dr.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                          </span>
                          <span className="text-neutral-600">{formatCurrency(dr.rate)}</span>
                        </div>
                      ))}
                      <div className="flex justify-between text-[13px] pt-1 border-t border-neutral-100">
                        <span className="text-neutral-600">
                          Subtotal ({bookingCalc.nights} night{bookingCalc.nights > 1 ? 's' : ''})
                        </span>
                        <span className="text-neutral-700">{formatCurrency(bookingCalc.grossSubtotal)}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="flex justify-between text-[13px]">
                      <span className="text-neutral-600">
                        {formatCurrency(bookingCalc.baseRate)} x {bookingCalc.nights} night{bookingCalc.nights > 1 ? 's' : ''}
                      </span>
                      <span className="text-neutral-700">{formatCurrency(bookingCalc.grossSubtotal)}</span>
                    </div>
                  )}
                  {/* Manual discount line */}
                  {bookingCalc.discount > 0 && (
                    <>
                      <div className="flex justify-between text-[13px]">
                        <span className="text-green-600">Discount</span>
                        <span className="text-green-600">-{formatCurrency(bookingCalc.discount)}</span>
                      </div>
                      <div className="flex justify-between text-[13px]">
                        <span className="text-neutral-500">Net Subtotal</span>
                        <span className="text-neutral-600">{formatCurrency(bookingCalc.subtotal)}</span>
                      </div>
                    </>
                  )}
                  <div className="flex justify-between text-[13px]">
                    <span className="text-neutral-600">GST ({Math.round(bookingCalc.gstRate * 100)}%)</span>
                    <span className="text-neutral-700">{formatCurrency(bookingCalc.taxes)}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-terra-200">
                    <span className="font-semibold text-neutral-900 text-[13px]">Total</span>
                    <span className="font-bold text-lg text-terra-600">{formatCurrency(bookingCalc.total)}</span>
                  </div>
                  {/* Show total savings */}
                  {discountInfo && discountInfo.discountAmount > 0 && (
                    <div className="flex justify-between text-[12px] pt-1">
                      <span className="text-green-600 font-medium">You save</span>
                      <span className="text-green-600 font-medium">
                        {formatCurrency(discountInfo.discountAmount * bookingCalc.nights)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </section>
      </form>
    </Drawer>
  );
}
