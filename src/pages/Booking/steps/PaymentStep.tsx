import { motion, AnimatePresence } from 'framer-motion';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState, useEffect, useMemo, useRef } from 'react';
import { CreditCard, Lock, MapPin, Shield, CheckCircle, Calendar, User, Building2, ArrowRight, ChevronDown, Mail, KeyRound, Globe, Landmark, Hash, Search, Banknote, Smartphone, Wallet, QrCode } from 'lucide-react';
import { useBooking } from '@/contexts/BookingContext';
import { paymentMethodsService } from '@/api/services/payment-methods.service';
import { bookingService } from '@/api/services/booking.service';
import { otpService } from '@/api/services/otp.service';
import { paymentQRService, type QRSettingsResponse } from '@/api/services/payment-qr.service';
import { useAuth } from '@/hooks/useAuth';
import { useGeoAddress } from '@/hooks/useGeoAddress';
import toast from 'react-hot-toast';

function notifyGuestEmailDuplicate(bookingResponse: {
  guestEmailDuplicateMessage?: string | null;
}) {
  const msg = bookingResponse?.guestEmailDuplicateMessage;
  if (msg) {
    toast(msg, { duration: 7000, icon: '⚠️' });
  }
}

const paymentSchema = z.object({
  cardNumber: z.string().refine((val) => {
    // Allow masked saved cards (**** **** **** 1234) or full card numbers
    if (val.startsWith('****')) return true;
    const cleaned = val.replace(/\s/g, '');
    if (!/^\d+$/.test(cleaned)) return false;
    // D-13: CC digit validation per card type based on prefix
    if (cleaned.startsWith('34') || cleaned.startsWith('37')) return cleaned.length === 15; // Amex
    if (cleaned.startsWith('5018') || cleaned.startsWith('5020') || cleaned.startsWith('5038') || cleaned.startsWith('6304')) return cleaned.length >= 12 && cleaned.length <= 19; // Maestro
    if (cleaned.startsWith('4')) return cleaned.length === 16 || cleaned.length === 19; // Visa (16 or 19)
    if (cleaned.startsWith('5') || cleaned.startsWith('2')) return cleaned.length === 16; // Mastercard
    if (cleaned.startsWith('6011') || cleaned.startsWith('65')) return cleaned.length === 16; // Discover
    return cleaned.length >= 13 && cleaned.length <= 19; // Fallback
  }, 'Card number must be valid for its card type'),
  cardName: z.string().min(3, 'Name on card is required'),
  expiryDate: z.string().regex(/^(0[1-9]|1[0-2])\/\d{2}$/, 'Format: MM/YY').refine((val) => {
    const [mm, yy] = val.split('/');
    if (!mm || !yy) return false;
    const month = parseInt(mm, 10);
    const year = 2000 + parseInt(yy, 10);
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;
    return year > currentYear || (year === currentYear && month >= currentMonth);
  }, 'Card is expired'),
  cvv: z.string().regex(/^\d{3,4}$/, 'CVV must be 3 or 4 digits'),
  billingAddress: z.string().min(5, 'Billing address is required'),
  city: z.string().min(2, 'City is required'),
  zipCode: z.string().optional().default(''),  // D-15: ZIP code non-mandatory
  country: z.string().min(2, 'Country is required'),
  state: z.string().optional(),
});

interface PaymentStepProps {
  onNext: () => void;
}

interface SavedCard {
  id: string | number;
  type: 'visa' | 'mastercard' | 'amex';
  last4: string;
  expiryMonth: number;
  expiryYear: number;
  isDefault: boolean;
  cardholderName?: string;
}

const GUEST_PAYMENT_METHODS = [
  { value: 'card', label: 'Card', icon: CreditCard, desc: 'Credit or Debit Card', color: '#A57865' },
  { value: 'upi', label: 'UPI', icon: Smartphone, desc: 'Google Pay, PhonePe', color: '#5C9BA4' },
  { value: 'qr_code', label: 'QR Code', icon: QrCode, desc: 'Scan & Pay via UPI', color: '#7C3AED' },
  { value: 'cash', label: 'Cash', icon: Banknote, desc: 'Pay at hotel', color: '#4E5840' },
  { value: 'bank_transfer', label: 'Bank Transfer', icon: Landmark, desc: 'Wire / NEFT / RTGS', color: '#CDB261' },
  { value: 'online', label: 'Online', icon: Globe, desc: 'Net Banking / Wallet', color: '#8B7355' },
  { value: 'pay_at_hotel', label: 'Pay at Hotel', icon: Building2, desc: 'Pay during check-in', color: '#C8B29D' },
];

/* Searchable select styled to match the form's input pattern (pl-12 pr-12 py-4 rounded-lg) */
function PaymentSearchSelect({
  options,
  value,
  onChange,
  placeholder,
  icon: Icon,
  isValid,
  hasError,
}: {
  options: { value: string; label: string }[];
  value: string;
  onChange: (val: string) => void;
  placeholder: string;
  icon: React.ComponentType<any>;
  isValid: boolean;
  hasError: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const ref = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const selectedLabel = useMemo(
    () => options.find((o) => o.value === value)?.label || '',
    [options, value]
  );

  const filtered = useMemo(() => {
    if (!search) return options;
    const q = search.toLowerCase();
    return options.filter((o) => o.label.toLowerCase().includes(q));
  }, [options, search]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
        setSearch('');
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    if (isOpen && searchRef.current) searchRef.current.focus();
  }, [isOpen]);

  return (
    <div ref={ref} className="relative group">
      <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none z-10">
        <Icon
          className={`w-5 h-5 transition-colors ${
            isValid
              ? 'text-green-500'
              : hasError
                ? 'text-red-500'
                : 'text-neutral-400 group-focus-within:text-primary-600'
          }`}
          strokeWidth={2}
        />
      </div>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full pl-12 pr-12 py-4 border rounded-lg text-left font-medium transition-all ${
          hasError
            ? 'border-red-300 bg-red-50'
            : isValid
              ? 'border-green-300 bg-green-50'
              : isOpen
                ? 'border-primary-500 ring-2 ring-primary-500/20 bg-neutral-50'
                : 'border-neutral-200 bg-neutral-50 hover:border-neutral-300'
        }`}
      >
        <span className={value ? 'text-neutral-900' : 'text-neutral-400'}>
          {selectedLabel || placeholder}
        </span>
      </button>
      {isValid ? (
        <CheckCircle className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-green-500 pointer-events-none" strokeWidth={2} />
      ) : (
        <ChevronDown
          className={`absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      )}
      {isOpen && (
        <div className="absolute z-50 mt-1 w-full bg-white border border-neutral-200 rounded-lg shadow-lg overflow-hidden">
          {options.length > 6 && (
            <div className="p-2 border-b border-neutral-100">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                <input
                  ref={searchRef}
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search..."
                  className="w-full pl-9 pr-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500/20 bg-neutral-50"
                />
              </div>
            </div>
          )}
          <div className="max-h-48 overflow-y-auto">
            {filtered.length === 0 ? (
              <div className="px-4 py-3 text-sm text-neutral-400 text-center">No results</div>
            ) : (
              filtered.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    onChange(opt.value);
                    setIsOpen(false);
                    setSearch('');
                  }}
                  className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                    opt.value === value
                      ? 'bg-primary-50 text-primary-700 font-medium'
                      : 'text-neutral-700 hover:bg-neutral-50'
                  }`}
                >
                  {opt.label}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export function PaymentStep({ onNext }: PaymentStepProps) {
  const { bookingData, updateBookingData, calculateTotal } = useBooking();
  const { user } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  /** Prevents double-submit before React re-renders (sync, unlike isProcessing state). */
  const paymentSubmitLockRef = useRef(false);
  const [savedCards, setSavedCards] = useState<SavedCard[]>([]);
  const [selectedCardId, setSelectedCardId] = useState<string>('');
  const [showCardDropdown, setShowCardDropdown] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<string>(bookingData.payment?.paymentMethod || 'card');
  const [upiId, setUpiId] = useState('');
  
  // OTP verification state
  const [otpVerified, setOtpVerified] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [otpError, setOtpError] = useState('');

  // QR Code Payment state
  const [qrSettings, setQrSettings] = useState<QRSettingsResponse | null>(null);
  const [paymentReference, setPaymentReference] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    control,
  } = useForm({
    resolver: zodResolver(paymentSchema),
    defaultValues: bookingData.payment,
  });

  const countryVal = watch('country') || '';
  const stateVal = watch('state') || '';
  const cityVal = watch('city') || '';

  const { countries, states, cities, hasStates, hasCities } = useGeoAddress({
    countryCode: countryVal,
    stateCode: stateVal,
    cityName: cityVal,
    onStateReset: () => { setValue('state', ''); setValue('city', ''); },
    onCityReset: () => setValue('city', ''),
  });

  const countryOptions = useMemo(
    () => countries.map((c) => ({ value: c.isoCode, label: c.name })),
    [countries]
  );
  const stateOptions = useMemo(
    () => states.map((s) => ({ value: s.isoCode, label: s.name })),
    [states]
  );
  const cityOptions = useMemo(
    () => cities.map((c) => ({ value: c.name, label: c.name })),
    [cities]
  );

  // Load saved cards from database
  useEffect(() => {
    loadSavedCards();
  }, []);

  // Load QR settings
  useEffect(() => {
    const loadQRSettings = async () => {
      try {
        const settings = await paymentQRService.getPublicSettings();
        setQrSettings(settings);
      } catch (error) {
        console.log('QR settings not available');
      }
    };
    loadQRSettings();
  }, []);

  const loadSavedCards = async () => {
    try {
      const methods = await paymentMethodsService.list();
      const cards: SavedCard[] = methods.map(m => ({
        id: m.id,
        type: m.card_type,
        last4: m.last4,
        expiryMonth: m.expiry_month,
        expiryYear: m.expiry_year,
        isDefault: m.is_default,
        cardholderName: m.cardholder_name,
      }));
      setSavedCards(cards);
      
      // Auto-select default card if available
      const defaultCard = cards.find((c: SavedCard) => c.isDefault);
      if (defaultCard) {
        handleSelectCard(defaultCard);
      }
    } catch (error) {
      console.error('Failed to load saved cards:', error);
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (showCardDropdown && !target.closest('.card-dropdown-container')) {
        setShowCardDropdown(false);
      }
    };

    if (showCardDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showCardDropdown]);

  const handleSelectCard = (card: SavedCard) => {
    setSelectedCardId(card.id);
    setShowCardDropdown(false);
    
    // Fill form with card details (masked)
    setValue('cardNumber', `**** **** **** ${card.last4}`);
    setValue('cardName', card.cardholderName || '');
    setValue('expiryDate', `${card.expiryMonth.toString().padStart(2, '0')}/${card.expiryYear.toString().slice(-2)}`);
    // Note: CVV and billing address still need to be entered for security
  };

  const handleUseNewCard = () => {
    setSelectedCardId('');
    setShowCardDropdown(false);
    setValue('cardNumber', '');
    setValue('cardName', '');
    setValue('expiryDate', '');
    setValue('cvv', '');
  };

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    return parts.length ? parts.join(' ') : value;
  };

  const formatExpiryDate = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return `${v.substring(0, 2)}/${v.substring(2, 4)}`;
    }
    return v;
  };

  const onSubmit = async (data: any) => {
    // Prevent duplicate submission if booking was already created
    if (bookingData.bookingNumber && !bookingData.isModifyMode) {
      toast.error('Booking already created. Redirecting to confirmation.');
      onNext();
      return;
    }
    if (paymentSubmitLockRef.current) {
      return;
    }
    paymentSubmitLockRef.current = true;
    setIsProcessing(true);

    try {
      // Validate booking data
      if (!bookingData.room || !bookingData.checkIn || !bookingData.checkOut) {
        toast.error('Missing booking information. Please go back and complete all steps.');
        return;
      }

      if (!bookingData.guestInfo.firstName || !bookingData.guestInfo.lastName || !bookingData.guestInfo.email || !bookingData.guestInfo.phone) {
        toast.error('Missing guest information. Please go back and complete your details.');
        return;
      }

      // If using saved card, we need to get the actual card number
      // For now, we'll use the masked version but in production this would be handled securely
      let paymentData = { ...data };
      
      if (selectedCardId) {
        const selectedCard = savedCards.find(c => c.id === selectedCardId);
        if (selectedCard) {
          // Use saved card info but keep CVV and billing address from form
          paymentData = {
            ...paymentData,
            cardNumber: `**** **** **** ${selectedCard.last4}`, // Masked for display
            cardName: selectedCard.cardholderName || data.cardName,
            expiryDate: `${selectedCard.expiryMonth.toString().padStart(2, '0')}/${selectedCard.expiryYear.toString().slice(-2)}`,
          };
        }
      }

      let bookingResponse;

      // Debug: Log modification mode status
      console.log('[PaymentStep] Modification mode check:', {
        isModifyMode: bookingData.isModifyMode,
        originalBookingId: bookingData.originalBooking?.id,
        originalBookingNumber: bookingData.originalBooking?.bookingNumber,
      });

      // Check if we're in modification mode
      if (bookingData.isModifyMode && bookingData.originalBooking?.id) {
        console.log('[PaymentStep] UPDATING existing booking:', bookingData.originalBooking.id);
        // Update existing booking instead of creating new one
        bookingResponse = await bookingService.updateBooking(
          bookingData.originalBooking.id,
          {
            roomId: String(bookingData.room.id),
            checkIn: bookingData.checkIn,
            checkOut: bookingData.checkOut,
            guests: {
              adults: bookingData.guests.adults,
              children: bookingData.guests.children,
              infants: 0,
            },
            guestInfo: {
              firstName: bookingData.guestInfo.firstName,
              lastName: bookingData.guestInfo.lastName,
              email: bookingData.guestInfo.email,
              phone: bookingData.guestInfo.phone,
              country: paymentData.country || 'US',
              specialRequests: bookingData.guestInfo.specialRequests || '',
            },
          }
        );

        // Update booking data with response
        updateBookingData({
          payment: paymentData,
          bookingNumber: bookingResponse.bookingNumber || bookingData.originalBooking.bookingNumber,
        });

        toast.success('Booking modified successfully!');
        notifyGuestEmailDuplicate(bookingResponse);
      } else {
        console.log('[PaymentStep] CREATING new booking (not in modify mode)');
        // Calculate pricing data for rate consistency
        const pricing = calculateTotal();
        const ratePerNight = bookingData.room?.price || 0;
        bookingResponse = await bookingService.createBooking({
          roomId: String(bookingData.room.id),
          checkIn: bookingData.checkIn,
          checkOut: bookingData.checkOut,
          guests: {
            adults: bookingData.guests.adults,
            children: bookingData.guests.children,
            infants: 0,
          },
          guestInfo: {
            firstName: bookingData.guestInfo.firstName,
            lastName: bookingData.guestInfo.lastName,
            email: bookingData.guestInfo.email,
            phone: bookingData.guestInfo.phone,
            country: paymentData.country || 'US',
            specialRequests: bookingData.guestInfo.specialRequests || '',
          },
          paymentMethodId: selectedCardId ? String(selectedCardId) : 'new',
          saveCard: false,
          payment_method: 'card',
          // Include pricing data to ensure rate consistency between reservation and confirmation
          basePrice: pricing.subtotal,
          taxes: pricing.tax,
          serviceFee: pricing.serviceFee,
          totalPrice: pricing.total,
          ratePerNight: ratePerNight,
        });

        // Update booking data with response
        updateBookingData({
          payment: paymentData,
          bookingNumber: bookingResponse.bookingNumber || bookingResponse.id || `RES-${bookingResponse.id}`,
        });

        toast.success('Booking created successfully!');
        notifyGuestEmailDuplicate(bookingResponse);
      }
      onNext();
    } catch (error: any) {
      console.error('Booking error:', error);
      const defaultErrorMsg = bookingData.isModifyMode
        ? 'Failed to modify booking. Please try again.'
        : 'Failed to create booking. Please try again.';
      toast.error(error.response?.data?.detail || error.message || defaultErrorMsg);
    } finally {
      paymentSubmitLockRef.current = false;
      setIsProcessing(false);
    }
  };

  // Watch fields for validation feedback
  const cardNumber = watch('cardNumber');
  const cardName = watch('cardName');
  const expiryDate = watch('expiryDate');
  const cvv = watch('cvv');
  const billingAddress = watch('billingAddress');
  const city = watch('city');
  const zipCode = watch('zipCode');

  const isFieldValid = (fieldName: string, value: any) => {
    return value && value.length > 0 && !errors[fieldName as keyof typeof errors];
  };

  // Non-card payment submission
  const handleNonCardSubmit = async () => {
    // Prevent duplicate submission if booking was already created
    if (bookingData.bookingNumber && !bookingData.isModifyMode) {
      toast.error('Booking already created. Redirecting to confirmation.');
      onNext();
      return;
    }
    if (paymentSubmitLockRef.current) {
      return;
    }
    paymentSubmitLockRef.current = true;
    setIsProcessing(true);
    try {
      if (!bookingData.room || !bookingData.checkIn || !bookingData.checkOut) {
        toast.error('Missing booking information. Please go back and complete all steps.');
        return;
      }
      if (!bookingData.guestInfo.firstName || !bookingData.guestInfo.lastName || !bookingData.guestInfo.email || !bookingData.guestInfo.phone) {
        toast.error('Missing guest information. Please go back and complete your details.');
        return;
      }
      if (paymentMethod === 'upi' && !upiId.trim()) {
        toast.error('Please enter your UPI ID');
        return;
      }
      if (paymentMethod === 'qr_code' && paymentReference.length !== 4) {
        toast.error('Please enter the last 4 digits of your UTR/Transaction number');
        return;
      }

      let bookingResponse;

      if (bookingData.isModifyMode && bookingData.originalBooking?.id) {
        bookingResponse = await bookingService.updateBooking(
          bookingData.originalBooking.id,
          {
            roomId: String(bookingData.room.id),
            checkIn: bookingData.checkIn,
            checkOut: bookingData.checkOut,
            guests: {
              adults: bookingData.guests.adults,
              children: bookingData.guests.children,
              infants: 0,
            },
            guestInfo: {
              firstName: bookingData.guestInfo.firstName,
              lastName: bookingData.guestInfo.lastName,
              email: bookingData.guestInfo.email,
              phone: bookingData.guestInfo.phone,
              country: bookingData.guestInfo.country || 'US',
              specialRequests: bookingData.guestInfo.specialRequests || '',
            },
          }
        );
        updateBookingData({
          payment: { ...bookingData.payment, paymentMethod },
          bookingNumber: bookingResponse.bookingNumber || bookingData.originalBooking.bookingNumber,
        });
        toast.success('Booking modified successfully!');
        notifyGuestEmailDuplicate(bookingResponse);
      } else {
        // Calculate pricing data for rate consistency
        const pricing = calculateTotal();
        const ratePerNight = bookingData.room?.price || 0;
        bookingResponse = await bookingService.createBooking({
          roomId: String(bookingData.room.id),
          checkIn: bookingData.checkIn,
          checkOut: bookingData.checkOut,
          guests: {
            adults: bookingData.guests.adults,
            children: bookingData.guests.children,
            infants: 0,
          },
          guestInfo: {
            firstName: bookingData.guestInfo.firstName,
            lastName: bookingData.guestInfo.lastName,
            email: bookingData.guestInfo.email,
            phone: bookingData.guestInfo.phone,
            country: bookingData.guestInfo.country || 'US',
            specialRequests: bookingData.guestInfo.specialRequests || '',
          },
          paymentMethodId: 'none',
          payment_method: paymentMethod,
          // Include pricing data to ensure rate consistency between reservation and confirmation
          basePrice: pricing.subtotal,
          taxes: pricing.tax,
          serviceFee: pricing.serviceFee,
          totalPrice: pricing.total,
          ratePerNight: ratePerNight,
          // Include payment reference for QR code payments
          payment_reference: paymentMethod === 'qr_code' ? paymentReference : undefined,
        });
        updateBookingData({
          payment: { ...bookingData.payment, paymentMethod },
          bookingNumber: bookingResponse.bookingNumber || bookingResponse.id || `RES-${bookingResponse.id}`,
        });
        toast.success('Booking created successfully!');
        notifyGuestEmailDuplicate(bookingResponse);
      }
      onNext();
    } catch (error: any) {
      console.error('Booking error:', error);
      const defaultErrorMsg = bookingData.isModifyMode
        ? 'Failed to modify booking. Please try again.'
        : 'Failed to create booking. Please try again.';
      toast.error(error.response?.data?.detail || error.message || defaultErrorMsg);
    } finally {
      paymentSubmitLockRef.current = false;
      setIsProcessing(false);
    }
  };

  // Auto-send OTP when component mounts if email is available
  useEffect(() => {
    const email = bookingData.guestInfo?.email || user?.email;
    if (email && !otpSent && !otpVerified) {
      handleSendOTP();
    }
  }, []);

  const handleSendOTP = async () => {
    const email = bookingData.guestInfo?.email || user?.email;
    if (!email) {
      toast.error('Email is required for verification');
      return;
    }

    setSendingOtp(true);
    setOtpError('');
    try {
      await otpService.sendOTP({
        email,
        purpose: 'booking_payment',
      });
      setOtpSent(true);
      toast.success('Verification code sent to your email!');
    } catch (error: any) {
      setOtpError(error.response?.data?.detail || error.message || 'Failed to send verification code');
      toast.error('Failed to send verification code');
    } finally {
      setSendingOtp(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!otpCode || otpCode.length !== 6) {
      setOtpError('Please enter a valid 6-digit code');
      return;
    }

    const email = bookingData.guestInfo?.email || user?.email;
    if (!email) {
      setOtpError('Email is required');
      return;
    }

    setVerifyingOtp(true);
    setOtpError('');
    try {
      await otpService.verifyOTP({
        email,
        otp_code: otpCode,
        purpose: 'booking_payment',
      });
      setOtpVerified(true);
      toast.success('Email verified successfully!');
    } catch (error: any) {
      setOtpError(error.response?.data?.detail || error.message || 'Invalid verification code');
      toast.error('Invalid verification code');
    } finally {
      setVerifyingOtp(false);
    }
  };

  // Show OTP verification if not verified (only required for card payments)
  const requiresOtp = paymentMethod === 'card';
  if (requiresOtp && !otpVerified) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl p-8 sm:p-10 border border-neutral-200 shadow-lg"
      >
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-lg bg-primary-600 flex items-center justify-center shadow-md">
              <Mail className="w-6 h-6 text-white" strokeWidth={2.5} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-neutral-900">Email Verification Required</h2>
              <p className="text-neutral-600">Please verify your email to proceed with payment</p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-900">
              <strong>Verification Code Sent To:</strong> {bookingData.guestInfo?.email || user?.email || 'N/A'}
            </p>
            {otpSent && (
              <p className="text-xs text-blue-700 mt-2">
                Check your inbox for a 6-digit verification code. The code expires in 10 minutes.
              </p>
            )}
          </div>

          {otpError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-900">{otpError}</p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Enter Verification Code
            </label>
            <div className="flex gap-3">
              <input
                type="text"
                value={otpCode}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                  setOtpCode(value);
                  setOtpError('');
                }}
                placeholder="000000"
                className="flex-1 px-4 py-3 border-2 border-neutral-300 rounded-lg text-center text-2xl font-mono tracking-widest focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                maxLength={6}
                disabled={verifyingOtp}
              />
            </div>
            <p className="mt-2 text-xs text-neutral-500">
              Enter the 6-digit code sent to your email
            </p>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleVerifyOTP}
              disabled={!otpCode || otpCode.length !== 6 || verifyingOtp}
              className="flex-1 py-3 bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 text-white font-semibold rounded-lg transition-colors duration-200 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {verifyingOtp ? (
                <>
                  <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Verifying...
                </>
              ) : (
                <>
                  <KeyRound className="w-5 h-5" />
                  Verify Email
                </>
              )}
            </button>
            <button
              type="button"
              onClick={handleSendOTP}
              disabled={sendingOtp}
              className="px-6 py-3 bg-neutral-100 hover:bg-neutral-200 disabled:bg-neutral-50 text-neutral-900 font-medium rounded-lg transition-colors duration-200 disabled:cursor-not-allowed"
            >
              {sendingOtp ? 'Sending...' : 'Resend'}
            </button>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl p-8 sm:p-10 border border-neutral-200 shadow-lg"
    >
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-lg bg-primary-600 flex items-center justify-center shadow-md">
            <CreditCard className="w-6 h-6 text-white" strokeWidth={2.5} />
          </div>
          <div>
            <h2 className="text-3xl sm:text-4xl font-bold text-neutral-900">Payment Details</h2>
          </div>
        </div>
        <p className="text-base text-neutral-600 font-medium">
          Your payment information is secure and encrypted
        </p>
        
        {/* Email Verified Badge */}
        {otpVerified && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center gap-2 mt-4 px-4 py-2 bg-green-50 border border-green-200 rounded-lg"
          >
            <CheckCircle className="w-5 h-5 text-green-600" />
            <span className="text-sm font-medium text-green-900">Email Verified</span>
          </motion.div>
        )}

        {/* Security Badge */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex items-center gap-3 mt-5 px-4 py-3 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl"
        >
          <Shield className="w-5 h-5 text-green-600 flex-shrink-0" strokeWidth={2.5} />
          <div className="flex-1">
            <p className="text-sm font-bold text-green-900">Secure SSL Encrypted Payment</p>
            <p className="text-xs text-green-700 mt-0.5">256-bit encryption protects your data</p>
          </div>
        </motion.div>
      </div>

      {/* Payment Method Selector */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-8"
      >
        <h3 className="text-base font-bold text-neutral-900 mb-4">Choose Payment Method</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {GUEST_PAYMENT_METHODS.filter(method => {
            // Hide QR code option if not enabled
            if (method.value === 'qr_code' && (!qrSettings?.qr_code_enabled || !qrSettings?.qr_code_image)) {
              return false;
            }
            return true;
          }).map((method) => {
            const Icon = method.icon;
            const isSelected = paymentMethod === method.value;
            return (
              <button
                key={method.value}
                type="button"
                onClick={() => setPaymentMethod(method.value)}
                className={`relative flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-200 ${
                  isSelected
                    ? 'border-primary-500 bg-primary-50 shadow-md'
                    : 'border-neutral-200 bg-white hover:border-neutral-300 hover:shadow-sm'
                }`}
              >
                {isSelected && (
                  <div className="absolute top-2 right-2">
                    <CheckCircle className="w-4 h-4 text-primary-600" strokeWidth={2.5} />
                  </div>
                )}
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: `${method.color}15` }}
                >
                  <Icon className="w-5 h-5" style={{ color: method.color }} strokeWidth={2} />
                </div>
                <span className={`text-sm font-semibold ${isSelected ? 'text-primary-700' : 'text-neutral-800'}`}>
                  {method.label}
                </span>
                <span className="text-[11px] text-neutral-500 text-center leading-tight">{method.desc}</span>
              </button>
            );
          })}
        </div>
      </motion.div>

      {/* Card Payment Form */}
      {paymentMethod === 'card' ? (
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Saved Cards Dropdown */}
        {savedCards.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="relative"
          >
            <label className="block text-sm font-semibold text-neutral-900 mb-2">
              Use Saved Card
            </label>
            <div className="relative card-dropdown-container">
              <button
                type="button"
                onClick={() => setShowCardDropdown(!showCardDropdown)}
                className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all text-left flex items-center justify-between bg-white"
              >
                <span className="text-sm text-neutral-900">
                  {selectedCardId
                    ? `${savedCards.find(c => c.id === selectedCardId)?.type.toUpperCase()} •••• ${savedCards.find(c => c.id === selectedCardId)?.last4}`
                    : 'Select a saved card or enter new card'}
                </span>
                <ChevronDown className={`w-4 h-4 text-neutral-500 transition-transform ${showCardDropdown ? 'rotate-180' : ''}`} />
              </button>
              
              {showCardDropdown && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-neutral-200 rounded-lg shadow-lg max-h-60 overflow-y-auto card-dropdown-container">
                  <button
                    type="button"
                    onClick={handleUseNewCard}
                    className="w-full px-4 py-2 text-left text-sm text-neutral-700 hover:bg-neutral-50 border-b border-neutral-100"
                  >
                    + Use New Card
                  </button>
                  {savedCards.map((card) => (
                    <button
                      key={card.id}
                      type="button"
                      onClick={() => handleSelectCard(card)}
                      className={`w-full px-4 py-3 text-left hover:bg-neutral-50 transition-colors ${
                        selectedCardId === card.id ? 'bg-primary-50 border-l-4 border-primary-600' : ''
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-sm font-medium text-neutral-900 capitalize">
                            {card.type} •••• {card.last4}
                          </div>
                          <div className="text-xs text-neutral-500">
                            {card.cardholderName || 'Card'} • Expires {card.expiryMonth.toString().padStart(2, '0')}/{card.expiryYear}
                          </div>
                        </div>
                        {card.isDefault && (
                          <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded">
                            DEFAULT
                          </span>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Card Number */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <label className="block text-sm font-semibold text-neutral-900 mb-2">
            Card Number <span className="text-red-500">*</span>
          </label>
          <div className="relative group">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
              <CreditCard className={`w-5 h-5 transition-colors ${
                isFieldValid('cardNumber', cardNumber)
                  ? 'text-green-500'
                  : errors.cardNumber
                    ? 'text-red-500'
                    : 'text-neutral-400 group-focus-within:text-primary-600'
              }`} strokeWidth={2} />
            </div>
            <input
              type="text"
              {...register('cardNumber', {
                onChange: (e) => {
                  // Don't format if it's a saved card (starts with ****)
                  if (e.target.value.startsWith('****')) {
                    return;
                  }
                  const formatted = formatCardNumber(e.target.value);
                  e.target.value = formatted;
                  setValue('cardNumber', formatted.replace(/\s/g, ''));
                }
              })}
              placeholder={selectedCardId ? "Using saved card" : "1234 5678 9012 3456"}
              maxLength={19}
              disabled={!!selectedCardId}
              className={`w-full pl-12 pr-12 py-4 border rounded-lg focus:outline-none focus:ring-2 transition-all font-medium ${
                selectedCardId
                  ? 'bg-neutral-50 border-neutral-200 cursor-not-allowed'
                  : errors.cardNumber
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20 bg-red-50'
                    : isFieldValid('cardNumber', cardNumber)
                      ? 'border-green-300 focus:border-green-500 focus:ring-green-500/20 bg-green-50'
                      : 'border-neutral-200 focus:border-primary-500 focus:ring-primary-500/20 bg-neutral-50'
              }`}
            />
            {isFieldValid('cardNumber', cardNumber) && (
              <CheckCircle className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-green-500" strokeWidth={2} />
            )}
          </div>
          <AnimatePresence>
            {errors.cardNumber && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mt-2 text-sm text-red-600 font-medium"
              >
                {errors.cardNumber.message}
              </motion.p>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Name on Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <label className="block text-sm font-semibold text-neutral-900 mb-2">
            Name on Card <span className="text-red-500">*</span>
          </label>
          <div className="relative group">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
              <User className={`w-5 h-5 transition-colors ${
                isFieldValid('cardName', cardName)
                  ? 'text-green-500'
                  : errors.cardName
                    ? 'text-red-500'
                    : 'text-neutral-400 group-focus-within:text-primary-600'
              }`} strokeWidth={2} />
            </div>
            <input
              type="text"
              {...register('cardName')}
              placeholder="JOHN DOE"
              disabled={!!selectedCardId}
              className={`w-full pl-12 pr-12 py-4 border rounded-lg focus:outline-none focus:ring-2 transition-all font-medium uppercase ${
                selectedCardId
                  ? 'bg-neutral-50 border-neutral-200 cursor-not-allowed'
                  : errors.cardName
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20 bg-red-50'
                    : isFieldValid('cardName', cardName)
                      ? 'border-green-300 focus:border-green-500 focus:ring-green-500/20 bg-green-50'
                      : 'border-neutral-200 focus:border-primary-500 focus:ring-primary-500/20 bg-neutral-50'
              }`}
            />
            {isFieldValid('cardName', cardName) && (
              <CheckCircle className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-green-500" strokeWidth={2} />
            )}
          </div>
          <AnimatePresence>
            {errors.cardName && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mt-2 text-sm text-red-600 font-medium"
              >
                {errors.cardName.message}
              </motion.p>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Expiry & CVV */}
        <div className="grid grid-cols-2 gap-6">
          {/* Expiry Date */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.25 }}
          >
            <label className="block text-sm font-semibold text-neutral-900 mb-2">
              Expiry Date <span className="text-red-500">*</span>
            </label>
            <div className="relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                <Calendar className={`w-5 h-5 transition-colors ${
                  isFieldValid('expiryDate', expiryDate)
                    ? 'text-green-500'
                    : errors.expiryDate
                      ? 'text-red-500'
                      : 'text-neutral-400 group-focus-within:text-primary-600'
                }`} strokeWidth={2} />
              </div>
            <input
              type="text"
              {...register('expiryDate', {
                onChange: (e) => {
                  // Don't format if it's from a saved card
                  if (selectedCardId) return;
                  const formatted = formatExpiryDate(e.target.value);
                  e.target.value = formatted;
                  setValue('expiryDate', formatted);
                }
              })}
              placeholder="MM/YY"
              maxLength={5}
              disabled={!!selectedCardId}
              className={`w-full pl-12 pr-12 py-4 border rounded-lg focus:outline-none focus:ring-2 transition-all font-medium ${
                selectedCardId
                  ? 'bg-neutral-50 border-neutral-200 cursor-not-allowed'
                  : errors.expiryDate
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20 bg-red-50'
                    : isFieldValid('expiryDate', expiryDate)
                      ? 'border-green-300 focus:border-green-500 focus:ring-green-500/20 bg-green-50'
                      : 'border-neutral-200 focus:border-primary-500 focus:ring-primary-500/20 bg-neutral-50'
              }`}
            />
              {isFieldValid('expiryDate', expiryDate) && (
                <CheckCircle className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-green-500" strokeWidth={2} />
              )}
            </div>
            <AnimatePresence>
              {errors.expiryDate && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mt-2 text-sm text-red-600 font-medium"
                >
                  {errors.expiryDate.message}
                </motion.p>
              )}
            </AnimatePresence>
          </motion.div>

          {/* CVV */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <label className="block text-sm font-semibold text-neutral-900 mb-2">
              CVV <span className="text-red-500">*</span>
            </label>
            <div className="relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                <Lock className={`w-5 h-5 transition-colors ${
                  isFieldValid('cvv', cvv)
                    ? 'text-green-500'
                    : errors.cvv
                      ? 'text-red-500'
                      : 'text-neutral-400 group-focus-within:text-primary-600'
                }`} strokeWidth={2} />
              </div>
              <input
                type="text"
                {...register('cvv')}
                placeholder="123"
                maxLength={4}
                className={`w-full pl-12 pr-12 py-4 border rounded-lg focus:outline-none focus:ring-2 transition-all font-medium ${
                  errors.cvv
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20 bg-red-50'
                    : isFieldValid('cvv', cvv)
                      ? 'border-green-300 focus:border-green-500 focus:ring-green-500/20 bg-green-50'
                      : 'border-neutral-200 focus:border-primary-500 focus:ring-primary-500/20 bg-neutral-50'
                }`}
              />
              {isFieldValid('cvv', cvv) && (
                <CheckCircle className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-green-500" strokeWidth={2} />
              )}
            </div>
            <AnimatePresence>
              {errors.cvv && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mt-2 text-sm text-red-600 font-medium"
                >
                  {errors.cvv.message}
                </motion.p>
              )}
            </AnimatePresence>
          </motion.div>
        </div>

        {/* Billing Address */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="pt-6 border-t border-neutral-200"
        >
          <div className="flex items-center gap-2 mb-4">
            <MapPin className="w-5 h-5 text-primary-600" strokeWidth={2.5} />
            <h3 className="text-lg font-bold text-neutral-900">Billing Address</h3>
          </div>

          {/* Street Address */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-neutral-900 mb-2">
              Street Address <span className="text-red-500">*</span>
            </label>
            <div className="relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                <MapPin className={`w-5 h-5 transition-colors ${
                  isFieldValid('billingAddress', billingAddress)
                    ? 'text-green-500'
                    : errors.billingAddress
                      ? 'text-red-500'
                      : 'text-neutral-400 group-focus-within:text-primary-600'
                }`} strokeWidth={2} />
              </div>
              <input
                type="text"
                {...register('billingAddress')}
                placeholder="123 Main Street"
                className={`w-full pl-12 pr-12 py-4 border rounded-lg focus:outline-none focus:ring-2 transition-all font-medium ${
                  errors.billingAddress
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20 bg-red-50'
                    : isFieldValid('billingAddress', billingAddress)
                      ? 'border-green-300 focus:border-green-500 focus:ring-green-500/20 bg-green-50'
                      : 'border-neutral-200 focus:border-primary-500 focus:ring-primary-500/20 bg-neutral-50'
                }`}
              />
              {isFieldValid('billingAddress', billingAddress) && (
                <CheckCircle className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-green-500" strokeWidth={2} />
              )}
            </div>
            <AnimatePresence>
              {errors.billingAddress && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mt-2 text-sm text-red-600 font-medium"
                >
                  {errors.billingAddress.message}
                </motion.p>
              )}
            </AnimatePresence>
          </div>

          {/* Country & State */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            {/* Country */}
            <div>
              <label className="block text-sm font-semibold text-neutral-900 mb-2">
                Country <span className="text-red-500">*</span>
              </label>
              <Controller
                name="country"
                control={control}
                render={({ field }) => (
                  <PaymentSearchSelect
                    options={countryOptions}
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="Select Country"
                    icon={Globe}
                    isValid={isFieldValid('country', countryVal)}
                    hasError={!!errors.country}
                  />
                )}
              />
              <AnimatePresence>
                {errors.country && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="mt-2 text-sm text-red-600 font-medium"
                  >
                    {errors.country.message}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            {/* State / Province */}
            <div>
              <label className="block text-sm font-semibold text-neutral-900 mb-2">
                State / Province
              </label>
              {hasStates ? (
                <Controller
                  name="state"
                  control={control}
                  render={({ field }) => (
                    <PaymentSearchSelect
                      options={stateOptions}
                      value={field.value || ''}
                      onChange={field.onChange}
                      placeholder="Select State"
                      icon={Landmark}
                      isValid={isFieldValid('state', stateVal)}
                      hasError={false}
                    />
                  )}
                />
              ) : (
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                    <Landmark className="w-5 h-5 text-neutral-400 group-focus-within:text-primary-600 transition-colors" strokeWidth={2} />
                  </div>
                  <input
                    type="text"
                    {...register('state')}
                    placeholder="State / Province"
                    className="w-full pl-12 pr-12 py-4 border rounded-lg focus:outline-none focus:ring-2 transition-all font-medium border-neutral-200 focus:border-primary-500 focus:ring-primary-500/20 bg-neutral-50"
                  />
                </div>
              )}
            </div>
          </div>

          {/* City & ZIP Code */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* City */}
            <div>
              <label className="block text-sm font-semibold text-neutral-900 mb-2">
                City <span className="text-red-500">*</span>
              </label>
              {hasCities ? (
                <Controller
                  name="city"
                  control={control}
                  render={({ field }) => (
                    <PaymentSearchSelect
                      options={cityOptions}
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="Select City"
                      icon={Building2}
                      isValid={isFieldValid('city', city)}
                      hasError={!!errors.city}
                    />
                  )}
                />
              ) : (
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                    <Building2 className={`w-5 h-5 transition-colors ${
                      isFieldValid('city', city)
                        ? 'text-green-500'
                        : errors.city
                          ? 'text-red-500'
                          : 'text-neutral-400 group-focus-within:text-primary-600'
                    }`} strokeWidth={2} />
                  </div>
                  <input
                    type="text"
                    {...register('city')}
                    placeholder="City"
                    className={`w-full pl-12 pr-12 py-4 border rounded-lg focus:outline-none focus:ring-2 transition-all font-medium ${
                      errors.city
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20 bg-red-50'
                        : isFieldValid('city', city)
                          ? 'border-green-300 focus:border-green-500 focus:ring-green-500/20 bg-green-50'
                          : 'border-neutral-200 focus:border-primary-500 focus:ring-primary-500/20 bg-neutral-50'
                    }`}
                  />
                  {isFieldValid('city', city) && (
                    <CheckCircle className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-green-500" strokeWidth={2} />
                  )}
                </div>
              )}
              <AnimatePresence>
                {errors.city && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="mt-2 text-sm text-red-600 font-medium"
                  >
                    {errors.city.message}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            {/* ZIP Code */}
            <div>
              <label className="block text-sm font-semibold text-neutral-900 mb-2">
                ZIP Code <span className="text-red-500">*</span>
              </label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                  <Hash className={`w-5 h-5 transition-colors ${
                    isFieldValid('zipCode', zipCode)
                      ? 'text-green-500'
                      : errors.zipCode
                        ? 'text-red-500'
                        : 'text-neutral-400 group-focus-within:text-primary-600'
                  }`} strokeWidth={2} />
                </div>
                <input
                  type="text"
                  {...register('zipCode')}
                  placeholder="94102"
                  className={`w-full pl-12 pr-12 py-4 border rounded-lg focus:outline-none focus:ring-2 transition-all font-medium ${
                    errors.zipCode
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20 bg-red-50'
                      : isFieldValid('zipCode', zipCode)
                        ? 'border-green-300 focus:border-green-500 focus:ring-green-500/20 bg-green-50'
                        : 'border-neutral-200 focus:border-primary-500 focus:ring-primary-500/20 bg-neutral-50'
                  }`}
                />
                {isFieldValid('zipCode', zipCode) && (
                  <CheckCircle className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-green-500" strokeWidth={2} />
                )}
              </div>
              <AnimatePresence>
                {errors.zipCode && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="mt-2 text-sm text-red-600 font-medium"
                  >
                    {errors.zipCode.message}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>

        {/* Submit Button */}
        <motion.button
          type="submit"
          disabled={isProcessing}
          whileHover={{ scale: isProcessing ? 1 : 1.01 }}
          whileTap={{ scale: isProcessing ? 1 : 0.99 }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className={`w-full py-5 bg-primary-600 hover:bg-primary-700 text-white font-bold text-lg rounded-lg transition-all shadow-lg flex items-center justify-center gap-3 group ${
            isProcessing ? 'opacity-75 cursor-not-allowed' : ''
          }`}
        >
          {isProcessing ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>{bookingData.isModifyMode ? 'Updating Booking...' : 'Processing Payment...'}</span>
            </>
          ) : (
            <>
              <Lock className="w-5 h-5 group-hover:scale-110 transition-transform" strokeWidth={2.5} />
              <span>{bookingData.isModifyMode ? 'Confirm Modification' : 'Complete Booking'}</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" strokeWidth={2.5} />
            </>
          )}
        </motion.button>

        {/* Terms & Conditions */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center"
        >
          <p className="text-sm text-neutral-600 font-medium">
            By completing this booking, you agree to our{' '}
            <span className="text-primary-600 font-semibold">Terms & Conditions</span>
          </p>
        </motion.div>
      </form>
      ) : (
      /* Non-Card Payment Methods */
      <div className="space-y-6">
        {/* UPI Payment */}
        {paymentMethod === 'upi' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="bg-gradient-to-br from-ocean-50 to-blue-50 border border-ocean-200 rounded-xl p-5">
              <div className="flex items-center gap-3 mb-3">
                <Smartphone className="w-5 h-5 text-ocean-600" strokeWidth={2} />
                <h4 className="text-sm font-bold text-ocean-900">UPI Payment</h4>
              </div>
              <p className="text-xs text-ocean-700 mb-4">
                Enter your UPI ID to pay. Supports Google Pay, PhonePe, Paytm, and other UPI apps.
              </p>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                  <Smartphone className={`w-5 h-5 transition-colors ${
                    upiId.includes('@') ? 'text-green-500' : 'text-neutral-400 group-focus-within:text-primary-600'
                  }`} strokeWidth={2} />
                </div>
                <input
                  type="text"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  placeholder="yourname@upi"
                  className={`w-full pl-12 pr-12 py-4 border rounded-lg focus:outline-none focus:ring-2 transition-all font-medium ${
                    upiId.includes('@')
                      ? 'border-green-300 focus:border-green-500 focus:ring-green-500/20 bg-green-50'
                      : 'border-neutral-200 focus:border-primary-500 focus:ring-primary-500/20 bg-neutral-50'
                  }`}
                />
                {upiId.includes('@') && (
                  <CheckCircle className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-green-500" strokeWidth={2} />
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* Cash Payment */}
        {paymentMethod === 'cash' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-sage-50 to-green-50 border border-sage-200 rounded-xl p-5"
          >
            <div className="flex items-center gap-3 mb-3">
              <Banknote className="w-5 h-5 text-sage-600" strokeWidth={2} />
              <h4 className="text-sm font-bold text-sage-900">Cash Payment</h4>
            </div>
            <p className="text-sm text-sage-700">
              You can pay in cash at the hotel reception during check-in. Please have the exact amount ready.
            </p>
            <div className="mt-4 flex items-center gap-2 text-xs text-sage-600 bg-white/60 rounded-lg px-3 py-2">
              <Shield className="w-4 h-4 flex-shrink-0" />
              <span>Your booking will be confirmed and held. Payment is collected at the property.</span>
            </div>
          </motion.div>
        )}

        {/* Bank Transfer */}
        {paymentMethod === 'bank_transfer' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-amber-50 to-yellow-50 border border-amber-200 rounded-xl p-5"
          >
            <div className="flex items-center gap-3 mb-3">
              <Landmark className="w-5 h-5 text-amber-700" strokeWidth={2} />
              <h4 className="text-sm font-bold text-amber-900">Bank Transfer</h4>
            </div>
            <p className="text-sm text-amber-700 mb-3">
              Bank transfer details will be sent to your email after booking confirmation.
            </p>
            <div className="bg-white/60 rounded-lg p-3 text-xs text-amber-700 space-y-1">
              <p>Supported methods: NEFT, RTGS, IMPS, Wire Transfer</p>
              <p>Please complete the transfer within 24 hours to confirm your booking.</p>
            </div>
          </motion.div>
        )}

        {/* Online Payment */}
        {paymentMethod === 'online' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-neutral-50 to-stone-50 border border-neutral-200 rounded-xl p-5"
          >
            <div className="flex items-center gap-3 mb-3">
              <Globe className="w-5 h-5 text-neutral-700" strokeWidth={2} />
              <h4 className="text-sm font-bold text-neutral-900">Online Payment</h4>
            </div>
            <p className="text-sm text-neutral-600">
              You will be redirected to a secure payment gateway after booking confirmation. Supports Net Banking and digital wallets.
            </p>
            <div className="mt-4 flex items-center gap-2 text-xs text-neutral-500 bg-white/60 rounded-lg px-3 py-2">
              <Shield className="w-4 h-4 flex-shrink-0" />
              <span>Secure 256-bit encrypted payment processing</span>
            </div>
          </motion.div>
        )}

        {/* QR Code Payment */}
        {paymentMethod === 'qr_code' && qrSettings?.qr_code_enabled && qrSettings?.qr_code_image && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-violet-50 to-purple-50 border border-violet-200 rounded-xl p-5"
          >
            <div className="flex items-center gap-3 mb-4">
              <QrCode className="w-5 h-5 text-violet-700" strokeWidth={2} />
              <h4 className="text-sm font-bold text-violet-900">Scan & Pay via QR Code</h4>
            </div>

            {/* QR Code Image */}
            <div className="flex flex-col items-center mb-4">
              <div className="bg-white p-4 rounded-xl shadow-sm border border-violet-100">
                <img
                  src={qrSettings.qr_code_image}
                  alt="Payment QR Code"
                  className="w-48 h-48 object-contain"
                />
              </div>
              <p className="text-xs text-violet-600 mt-2 font-medium">
                Scan with any UPI app (GPay, PhonePe, Paytm, etc.)
              </p>
            </div>

            {/* Instructions */}
            {qrSettings.qr_code_instructions && (
              <div className="bg-white/60 rounded-lg p-3 mb-4">
                <p className="text-sm text-violet-700">{qrSettings.qr_code_instructions}</p>
              </div>
            )}

            {/* Payment Reference Input */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-violet-900">
                Enter Last 4 Digits of UTR/Transaction Number *
              </label>
              <input
                type="text"
                value={paymentReference}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '').slice(0, 4);
                  setPaymentReference(val);
                }}
                placeholder="e.g., 1234"
                maxLength={4}
                className="w-full px-4 py-3 border border-violet-200 rounded-lg text-lg font-mono tracking-widest text-center focus:ring-2 focus:ring-violet-500 focus:border-violet-500 outline-none transition-all"
              />
              <p className="text-xs text-violet-500">
                This helps us verify your payment. You'll find the UTR number in your UPI app's transaction history.
              </p>
            </div>

            <div className="mt-4 flex items-center gap-2 text-xs text-violet-500 bg-white/60 rounded-lg px-3 py-2">
              <Shield className="w-4 h-4 flex-shrink-0" />
              <span>Your payment reference will be verified by our team</span>
            </div>
          </motion.div>
        )}

        {/* QR Code not available message */}
        {paymentMethod === 'qr_code' && (!qrSettings?.qr_code_enabled || !qrSettings?.qr_code_image) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-5"
          >
            <div className="flex items-center gap-3 mb-3">
              <QrCode className="w-5 h-5 text-amber-700" strokeWidth={2} />
              <h4 className="text-sm font-bold text-amber-900">QR Code Payment Unavailable</h4>
            </div>
            <p className="text-sm text-amber-600">
              QR code payment is currently not available. Please select another payment method.
            </p>
          </motion.div>
        )}

        {/* Pay at Hotel */}
        {paymentMethod === 'pay_at_hotel' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-stone-50 to-neutral-50 border border-stone-200 rounded-xl p-5"
          >
            <div className="flex items-center gap-3 mb-3">
              <Building2 className="w-5 h-5 text-stone-700" strokeWidth={2} />
              <h4 className="text-sm font-bold text-stone-900">Pay at Hotel</h4>
            </div>
            <p className="text-sm text-stone-600">
              No payment required now. Pay at the hotel reception during check-in using any available payment method (Card, Cash, UPI).
            </p>
            <div className="mt-4 flex items-center gap-2 text-xs text-stone-500 bg-white/60 rounded-lg px-3 py-2">
              <CheckCircle className="w-4 h-4 flex-shrink-0" />
              <span>Your booking is guaranteed. No cancellation charges up to 24 hours before check-in.</span>
            </div>
          </motion.div>
        )}

        {/* Submit Button for non-card methods */}
        <motion.button
          type="button"
          onClick={handleNonCardSubmit}
          disabled={isProcessing || (paymentMethod === 'upi' && !upiId.includes('@')) || (paymentMethod === 'qr_code' && paymentReference.length !== 4)}
          whileHover={{ scale: isProcessing ? 1 : 1.01 }}
          whileTap={{ scale: isProcessing ? 1 : 0.99 }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className={`w-full py-5 bg-primary-600 hover:bg-primary-700 text-white font-bold text-lg rounded-lg transition-all shadow-lg flex items-center justify-center gap-3 group ${
            isProcessing ? 'opacity-75 cursor-not-allowed' : ''
          }`}
        >
          {isProcessing ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>{bookingData.isModifyMode ? 'Updating Booking...' : 'Confirming Booking...'}</span>
            </>
          ) : (
            <>
              <Lock className="w-5 h-5 group-hover:scale-110 transition-transform" strokeWidth={2.5} />
              <span>{bookingData.isModifyMode ? 'Confirm Modification' : 'Confirm Booking'}</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" strokeWidth={2.5} />
            </>
          )}
        </motion.button>

        {/* Terms */}
        <div className="text-center">
          <p className="text-sm text-neutral-600 font-medium">
            By completing this booking, you agree to our{' '}
            <span className="text-primary-600 font-semibold">Terms & Conditions</span>
          </p>
        </div>
      </div>
      )}
    </motion.div>
  );
}