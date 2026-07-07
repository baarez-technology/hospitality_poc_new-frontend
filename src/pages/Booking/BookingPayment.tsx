import { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Elements, CardNumberElement, CardExpiryElement, CardCvcElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { ArrowLeft, Lock, CreditCard, MapPin, Globe, Landmark, Building2, Hash } from 'lucide-react';
import { useBookingStore } from '@/stores/bookingStore';
import { BookingProgressStepper } from '@/components/booking/BookingProgressStepper';
import { BookingSummaryWidget } from '@/components/booking/BookingSummaryWidget';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { SearchableSelect } from '@/components/ui2/SearchableSelect';
import { useGeoAddress } from '@/hooks/useGeoAddress';
import toast from 'react-hot-toast';
import { bookingApi } from '@/api/services/booking.service';
import { z } from 'zod';
import { getStripe } from '@/lib/stripe';

// Payment form schema (without Stripe-handled fields)
const paymentFormSchema = z.object({
  cardHolder: z.string().min(3, 'Cardholder name is required').max(50),
  address: z.string().min(3, 'Street address is required'),
  country: z.string().min(2, 'Country is required'),
  state: z.string().min(1, 'State / Province is required'),
  city: z.string().min(1, 'City is required'),
  zipCode: z.string().min(3, 'ZIP / Postal code is required'),
  saveCard: z.boolean().catch(false),
});

type PaymentFormData = z.output<typeof paymentFormSchema>;

const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      fontSize: '16px',
      color: '#171717',
      fontFamily: 'Inter, system-ui, sans-serif',
      '::placeholder': {
        color: '#a3a3a3',
      },
    },
    invalid: {
      color: '#dc2626',
    },
  },
};

const PaymentFormContent = () => {
  const navigate = useNavigate();
  const stripe = useStripe();
  const elements = useElements();
  const { draft, guestInfo, clearBooking } = useBookingStore();

  const [isProcessing, setIsProcessing] = useState(false);
  const paymentSubmitLockRef = useRef(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [cardErrors, setCardErrors] = useState({
    cardNumber: '',
    cardExpiry: '',
    cardCvc: '',
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    control,
  } = useForm<PaymentFormData>({
    resolver: zodResolver(paymentFormSchema),
    defaultValues: {
      address: '',
      country: '',
      state: '',
      city: '',
      zipCode: '',
      saveCard: false,
    },
  });

  const watchedCountry = watch('country');
  const watchedState = watch('state');
  const watchedCity = watch('city');

  const { countries, states, cities, hasStates, hasCities } = useGeoAddress({
    countryCode: watchedCountry,
    stateCode: watchedState,
    cityName: watchedCity,
    onStateReset: () => {
      setValue('state', '');
      setValue('city', '');
    },
    onCityReset: () => {
      setValue('city', '');
    },
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

  // Redirect if no booking draft or guest info
  useEffect(() => {
    if (!draft || !guestInfo) {
      navigate('/booking/review');
    }
  }, [draft, guestInfo, navigate]);

  if (!draft || !guestInfo) {
    return null;
  }

  const onSubmit = async (data: PaymentFormData) => {
    if (!stripe || !elements) {
      setPaymentError('Stripe has not loaded. Please refresh the page.');
      return;
    }
    if (paymentSubmitLockRef.current) {
      return;
    }
    paymentSubmitLockRef.current = true;
    setIsProcessing(true);
    setPaymentError(null);

    try {
      // Create payment method with Stripe
      const cardNumberElement = elements.getElement(CardNumberElement);

      if (!cardNumberElement) {
        throw new Error('Card element not found');
      }

      const { error: stripeError, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardNumberElement,
        billing_details: {
          name: data.cardHolder,
          email: guestInfo.email,
          phone: guestInfo.phone,
          address: {
            line1: data.address,
            city: data.city,
            state: data.state,
            postal_code: data.zipCode,
            country: data.country,
          },
        },
      });

      if (stripeError) {
        throw new Error(stripeError.message || 'Payment failed');
      }

      if (!paymentMethod) {
        throw new Error('Failed to create payment method');
      }

      // Create booking via API
      const bookingResponse = await bookingApi.createBooking({
        roomId: draft.roomId,
        checkIn: draft.checkIn.toISOString(),
        checkOut: draft.checkOut.toISOString(),
        guests: draft.guests,
        guestInfo,
        paymentMethodId: paymentMethod.id,
        saveCard: data.saveCard,
      });

      if (bookingResponse.guestEmailDuplicateMessage) {
        toast(bookingResponse.guestEmailDuplicateMessage, { duration: 7000, icon: '⚠️' });
      }

      // Clear booking draft on success
      clearBooking();

      // Navigate to confirmation page with booking ID
      navigate('/booking/confirmation', {
        state: { bookingId: bookingResponse.id },
      });
    } catch (error) {
      console.error('Payment error:', error);
      setPaymentError(
        error instanceof Error ? error.message : 'Payment failed. Please try again.'
      );
    } finally {
      paymentSubmitLockRef.current = false;
      setIsProcessing(false);
    }
  };

  const handleCardElementChange = (field: keyof typeof cardErrors) => (event: any) => {
    setCardErrors((prev) => ({
      ...prev,
      [field]: event.error ? event.error.message : '',
    }));
  };

  return (
    <div className="min-h-screen bg-neutral-50 py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Progress Stepper */}
        <BookingProgressStepper currentStep={2} />

        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-neutral-900">Payment Details</h1>
          <p className="text-neutral-600 mt-2">
            Complete your booking with secure payment
          </p>
        </div>

        {/* Two Column Layout */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Payment Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm p-6 md:p-8">
              {/* Security Badge */}
              <div className="flex items-center gap-2 mb-6 pb-6 border-b border-neutral-200">
                <Lock className="w-5 h-5 text-green-600" />
                <span className="text-sm font-medium text-neutral-700">
                  Your payment information is secure and encrypted
                </span>
              </div>

              <h2 className="text-2xl font-semibold text-neutral-900 mb-6 flex items-center gap-2">
                <CreditCard className="w-6 h-6" />
                Payment Information
              </h2>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Cardholder Name */}
                <Input
                  label="Cardholder Name"
                  required
                  error={errors.cardHolder?.message}
                  {...register('cardHolder')}
                  placeholder="John Doe"
                  aria-label="Cardholder name"
                  disabled={isProcessing}
                />

                {/* Billing Address Section */}
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-neutral-900 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-neutral-500" />
                    Billing Address
                  </h3>

                  {/* Street Address */}
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      Street Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="123 Main Street, Apt 4B"
                      {...register('address')}
                      disabled={isProcessing}
                      className={`w-full px-4 py-3 border rounded-lg text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:border-primary-500 transition-colors ${
                        errors.address ? 'border-red-500 focus:ring-red-500/20' : 'border-neutral-300 focus:ring-primary-500/20'
                      }`}
                    />
                    {errors.address && (
                      <p className="mt-1 text-sm text-red-600">{errors.address.message}</p>
                    )}
                  </div>

                  {/* Country & State Row */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Country */}
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-2">
                        Country <span className="text-red-500">*</span>
                      </label>
                      <Controller
                        name="country"
                        control={control}
                        render={({ field }) => (
                          <SearchableSelect
                            options={countryOptions}
                            value={field.value}
                            onChange={field.onChange}
                            placeholder="Select Country"
                            icon={Globe}
                            error={!!errors.country}
                            disabled={isProcessing}
                            searchable
                          />
                        )}
                      />
                      {errors.country && (
                        <p className="mt-1 text-sm text-red-600">{errors.country.message}</p>
                      )}
                    </div>

                    {/* State / Province */}
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-2">
                        State / Province <span className="text-red-500">*</span>
                      </label>
                      {hasStates ? (
                        <Controller
                          name="state"
                          control={control}
                          render={({ field }) => (
                            <SearchableSelect
                              options={stateOptions}
                              value={field.value}
                              onChange={field.onChange}
                              placeholder="Select State"
                              icon={Landmark}
                              error={!!errors.state}
                              disabled={isProcessing || !watchedCountry}
                              searchable
                            />
                          )}
                        />
                      ) : (
                        <input
                          type="text"
                          placeholder={watchedCountry ? 'Enter state or province' : 'Select country first'}
                          {...register('state')}
                          disabled={isProcessing || !watchedCountry}
                          className={`w-full px-4 py-3 border rounded-lg text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:border-primary-500 transition-colors ${
                            errors.state ? 'border-red-500 focus:ring-red-500/20' : 'border-neutral-300 focus:ring-primary-500/20'
                          } ${!watchedCountry ? 'opacity-50 cursor-not-allowed bg-neutral-50' : ''}`}
                        />
                      )}
                      {errors.state && (
                        <p className="mt-1 text-sm text-red-600">{errors.state.message}</p>
                      )}
                    </div>
                  </div>

                  {/* City & ZIP Row */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* City */}
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-2">
                        City <span className="text-red-500">*</span>
                      </label>
                      {hasCities ? (
                        <Controller
                          name="city"
                          control={control}
                          render={({ field }) => (
                            <SearchableSelect
                              options={cityOptions}
                              value={field.value}
                              onChange={field.onChange}
                              placeholder="Select City"
                              icon={Building2}
                              error={!!errors.city}
                              disabled={isProcessing || !watchedState}
                              searchable
                            />
                          )}
                        />
                      ) : (
                        <input
                          type="text"
                          placeholder={watchedState ? 'Enter city' : 'Select state first'}
                          {...register('city')}
                          disabled={isProcessing || !watchedCountry}
                          className={`w-full px-4 py-3 border rounded-lg text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:border-primary-500 transition-colors ${
                            errors.city ? 'border-red-500 focus:ring-red-500/20' : 'border-neutral-300 focus:ring-primary-500/20'
                          } ${!watchedCountry ? 'opacity-50 cursor-not-allowed bg-neutral-50' : ''}`}
                        />
                      )}
                      {errors.city && (
                        <p className="mt-1 text-sm text-red-600">{errors.city.message}</p>
                      )}
                    </div>

                    {/* ZIP / Postal Code */}
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-2">
                        ZIP / Postal Code <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <Hash className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                        <input
                          type="text"
                          placeholder="10001"
                          {...register('zipCode')}
                          disabled={isProcessing}
                          className={`w-full pl-10 pr-4 py-3 border rounded-lg text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:border-primary-500 transition-colors ${
                            errors.zipCode ? 'border-red-500 focus:ring-red-500/20' : 'border-neutral-300 focus:ring-primary-500/20'
                          }`}
                        />
                      </div>
                      {errors.zipCode && (
                        <p className="mt-1 text-sm text-red-600">{errors.zipCode.message}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Divider before card section */}
                <div className="border-t border-neutral-200" />

                {/* Card Number */}
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Card Number <span className="text-red-500">*</span>
                  </label>
                  <div className="px-4 py-3 border border-neutral-300 rounded-lg focus-within:ring-2 focus-within:ring-primary-500 focus-within:border-primary-500 transition-colors">
                    <CardNumberElement
                      options={CARD_ELEMENT_OPTIONS}
                      onChange={handleCardElementChange('cardNumber')}
                    />
                  </div>
                  {cardErrors.cardNumber && (
                    <p className="mt-1 text-sm text-red-600" role="alert">
                      {cardErrors.cardNumber}
                    </p>
                  )}
                </div>

                {/* Expiry and CVV */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      Expiry Date <span className="text-red-500">*</span>
                    </label>
                    <div className="px-4 py-3 border border-neutral-300 rounded-lg focus-within:ring-2 focus-within:ring-primary-500 focus-within:border-primary-500 transition-colors">
                      <CardExpiryElement
                        options={CARD_ELEMENT_OPTIONS}
                        onChange={handleCardElementChange('cardExpiry')}
                      />
                    </div>
                    {cardErrors.cardExpiry && (
                      <p className="mt-1 text-sm text-red-600" role="alert">
                        {cardErrors.cardExpiry}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      CVV <span className="text-red-500">*</span>
                    </label>
                    <div className="px-4 py-3 border border-neutral-300 rounded-lg focus-within:ring-2 focus-within:ring-primary-500 focus-within:border-primary-500 transition-colors">
                      <CardCvcElement
                        options={CARD_ELEMENT_OPTIONS}
                        onChange={handleCardElementChange('cardCvc')}
                      />
                    </div>
                    {cardErrors.cardCvc && (
                      <p className="mt-1 text-sm text-red-600" role="alert">
                        {cardErrors.cardCvc}
                      </p>
                    )}
                  </div>
                </div>

                {/* Save Card Checkbox */}
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="saveCard"
                    {...register('saveCard')}
                    className="mt-1 w-4 h-4 text-primary-600 border-neutral-300 rounded focus:ring-primary-500"
                    disabled={isProcessing}
                  />
                  <label htmlFor="saveCard" className="text-sm text-neutral-700">
                    Save this card for future bookings (optional)
                  </label>
                </div>

                {/* Error Message */}
                {paymentError && (
                  <div
                    className="bg-red-50 border border-red-200 rounded-lg p-4"
                    role="alert"
                  >
                    <p className="text-sm font-medium text-red-800">{paymentError}</p>
                  </div>
                )}

                {/* Payment Info */}
                <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-4">
                  <h3 className="font-semibold text-neutral-900 mb-2">
                    Payment Information
                  </h3>
                  <ul className="text-sm text-neutral-700 space-y-1 list-disc list-inside">
                    <li>Your card will be charged immediately</li>
                    <li>All transactions are secured with SSL encryption</li>
                    <li>You will receive a confirmation email after payment</li>
                    <li>Refunds are processed according to our cancellation policy</li>
                  </ul>
                </div>

                {/* Submit Button */}
                <div className="flex justify-between items-center pt-6 border-t border-neutral-200">
                  <Button
                    type="button"
                    variant="ghost"
                    leftIcon={<ArrowLeft size={20} />}
                    onClick={() => navigate('/booking/review')}
                    disabled={isProcessing}
                  >
                    Back
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    rightIcon={<Lock size={20} />}
                    isLoading={isProcessing}
                    disabled={isProcessing || !stripe}
                  >
                    {isProcessing ? 'Processing...' : `Pay ${draft.totalPrice ? `₹${draft.totalPrice.toFixed(2)}` : ''}`}
                  </Button>
                </div>
              </form>
            </div>
          </div>

          {/* Right Column - Booking Summary */}
          <div className="lg:col-span-1">
            <BookingSummaryWidget
              booking={draft}
              showCancellationPolicy={false}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

// Wrapper component with Stripe Elements provider
export const BookingPayment = () => {
  const [stripeInstance, setStripeInstance] = useState<import('@stripe/stripe-js').Stripe | null | undefined>(undefined);
  const [stripeError, setStripeError] = useState<string | null>(null);
  
  // Initialize Stripe only when this component is rendered
  useEffect(() => {
    if (stripeInstance === undefined) {
      getStripe()
        .then((stripe) => {
          setStripeInstance(stripe);
          if (!stripe) {
            setStripeError('Stripe is not configured. Please set VITE_STRIPE_PUBLIC_KEY in your environment variables.');
          }
        })
        .catch((error) => {
          console.error('Stripe initialization error:', error);
          setStripeInstance(null);
          setStripeError('Failed to initialize payment system. Please contact support.');
        });
    }
  }, [stripeInstance]);

  // Show error if Stripe is not configured
  if (stripeError) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-sm p-8 max-w-md">
          <h2 className="text-2xl font-bold text-neutral-900 mb-4">Payment Unavailable</h2>
          <p className="text-neutral-600 mb-4">{stripeError}</p>
          <button
            onClick={() => window.history.back()}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // Wait for Stripe to initialize
  if (stripeInstance === undefined) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-neutral-600">Loading payment system...</p>
        </div>
      </div>
    );
  }

  return (
    <Elements stripe={stripeInstance}>
      <PaymentFormContent />
    </Elements>
  );
};
