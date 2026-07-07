import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowRight } from 'lucide-react';
import { useBookingStore } from '@/stores/bookingStore';
import { BookingProgressStepper } from '@/components/booking/BookingProgressStepper';
import { BookingSummaryWidget } from '@/components/booking/BookingSummaryWidget';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { guestInfoSchema } from '@/utils/validation/booking.schema';
import { COUNTRIES } from '@/utils/countries';
import type { GuestInformation } from '@/api/types/booking.types';

export const BookingReview = () => {
  const navigate = useNavigate();
  const { draft, guestInfo, setGuestInfo } = useBookingStore();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<GuestInformation>({
    resolver: zodResolver(guestInfoSchema),
    defaultValues: guestInfo || undefined,
  });

  // Redirect if no booking draft exists
  useEffect(() => {
    if (!draft) {
      navigate('/rooms');
    }
  }, [draft, navigate]);

  if (!draft) {
    return null;
  }

  const onSubmit = async (data: GuestInformation) => {
    try {
      // Save guest information to store
      setGuestInfo(data);

      // Navigate to payment page
      navigate('/booking/payment');
    } catch (error) {
      console.error('Error saving guest information:', error);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Progress Stepper */}
        <BookingProgressStepper currentStep={1} />

        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-neutral-900">Review Your Booking</h1>
          <p className="text-neutral-600 mt-2">
            Please provide your information to complete the booking
          </p>
        </div>

        {/* Two Column Layout */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Guest Information Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm p-6 md:p-8">
              <h2 className="text-2xl font-semibold text-neutral-900 mb-6">
                Guest Information
              </h2>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Name Fields */}
                <div className="grid md:grid-cols-2 gap-6">
                  <Input
                    label="First Name"
                    required
                    error={errors.firstName?.message}
                    {...register('firstName')}
                    placeholder="John"
                    aria-label="First name"
                  />
                  <Input
                    label="Last Name"
                    required
                    error={errors.lastName?.message}
                    {...register('lastName')}
                    placeholder="Doe"
                    aria-label="Last name"
                  />
                </div>

                {/* Contact Fields */}
                <div className="grid md:grid-cols-2 gap-6">
                  <Input
                    label="Email Address"
                    type="email"
                    required
                    error={errors.email?.message}
                    {...register('email')}
                    placeholder="john.doe@example.com"
                    aria-label="Email address"
                  />
                  <Input
                    label="Phone Number"
                    type="tel"
                    required
                    error={errors.phone?.message}
                    {...register('phone')}
                    placeholder="+1234567890"
                    aria-label="Phone number"
                    helperText="Include country code (e.g., +1)"
                  />
                </div>

                {/* Country Selection */}
                <div>
                  <label
                    htmlFor="country"
                    className="block text-sm font-medium text-neutral-700 mb-2"
                  >
                    Country <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="country"
                    {...register('country')}
                    className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                    aria-label="Country"
                    aria-required="true"
                    aria-invalid={!!errors.country}
                    aria-describedby={errors.country ? 'country-error' : undefined}
                  >
                    <option value="">Select a country</option>
                    {COUNTRIES.map((country) => (
                      <option key={country.code} value={country.code}>
                        {country.name}
                      </option>
                    ))}
                  </select>
                  {errors.country && (
                    <p
                      id="country-error"
                      className="mt-1 text-sm text-red-600"
                      role="alert"
                    >
                      {errors.country.message}
                    </p>
                  )}
                </div>

                {/* Special Requests */}
                <div>
                  <label
                    htmlFor="specialRequests"
                    className="block text-sm font-medium text-neutral-700 mb-2"
                  >
                    Special Requests (Optional)
                  </label>
                  <textarea
                    id="specialRequests"
                    {...register('specialRequests')}
                    rows={4}
                    maxLength={500}
                    className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors resize-none"
                    placeholder="Any special requirements or requests for your stay..."
                    aria-label="Special requests"
                    aria-describedby="special-requests-help"
                  />
                  <p id="special-requests-help" className="mt-1 text-sm text-neutral-500">
                    Maximum 500 characters
                  </p>
                  {errors.specialRequests && (
                    <p className="mt-1 text-sm text-red-600" role="alert">
                      {errors.specialRequests.message}
                    </p>
                  )}
                </div>

                {/* Important Information */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="font-semibold text-blue-900 mb-2">
                    Important Information
                  </h3>
                  <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                    <li>Check-in time: After 3:00 PM</li>
                    <li>Check-out time: Before 11:00 AM</li>
                    <li>Valid ID required at check-in</li>
                    <li>
                      Confirmation email will be sent to the provided email address
                    </li>
                  </ul>
                </div>

                {/* Submit Button */}
                <div className="flex justify-between items-center pt-6 border-t border-neutral-200">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => navigate('/rooms')}
                  >
                    Back to Rooms
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    rightIcon={<ArrowRight size={20} />}
                    isLoading={isSubmitting}
                    disabled={isSubmitting}
                  >
                    Continue to Payment
                  </Button>
                </div>
              </form>
            </div>
          </div>

          {/* Right Column - Booking Summary */}
          <div className="lg:col-span-1">
            <BookingSummaryWidget
              booking={draft}
              showCancellationPolicy={true}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
