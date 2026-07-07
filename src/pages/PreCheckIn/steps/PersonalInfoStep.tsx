import { motion } from 'framer-motion';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useEffect, useMemo } from 'react';
import { Mail, Phone, MapPin, Globe, Building2, ArrowLeft, Landmark, Hash } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { usePreCheckIn } from '@/contexts/PreCheckInContext';
import { useAuth } from '@/hooks/useAuth';
import { useGeoAddress } from '@/hooks/useGeoAddress';
import { SearchableSelect } from '@/components/ui2/SearchableSelect';
import { userService } from '@/api/services/user.service';
import { guestsService } from '@/api/services/guests.service';
import logo from '@/assets/logo.png';

const personalInfoSchema = z.object({
  email: z.string().email('Valid email required'),
  phone: z.string().regex(/^\d{10}$/, 'Phone number must be exactly 10 digits'),
  address: z.string().min(5, 'Address required'),
  city: z.string().min(2, 'City required'),
  state: z.string().min(1, 'State required'),
  zipCode: z.string().min(3, 'ZIP/Postal code required'),
  country: z.string().min(2, 'Country required'),
});

interface PersonalInfoStepProps {
  onNext: () => void;
  onPrevious?: () => void;
}

export function PersonalInfoStep({ onNext, onPrevious }: PersonalInfoStepProps) {
  const navigate = useNavigate();
  const { preCheckInData, updatePreCheckInData } = usePreCheckIn();
  const { user } = useAuth();

  const handleLogoClick = () => {
    const confirmed = window.confirm('Are you sure you want to cancel the pre-check-in? Your progress will be lost.');
    if (confirmed) {
      navigate('/');
    }
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
    control,
  } = useForm({
    resolver: zodResolver(personalInfoSchema),
    defaultValues: preCheckInData.personalInfo,
  });

  const watchedCountry = watch('country');
  const watchedState = watch('state');
  const watchedCity = watch('city');

  // Use the reusable geo address hook
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

  // Memoize dropdown options
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

  // Autofill from user profile and guest preferences when logged in
  useEffect(() => {
    const autofillUserInfo = async () => {
      if (user && (!preCheckInData?.personalInfo?.email || !preCheckInData?.personalInfo?.phone)) {
        try {
          const profile = await userService.getProfile();
          let autofilledData = {
            email: profile.email || preCheckInData?.personalInfo?.email || '',
            phone: profile.phone || preCheckInData?.personalInfo?.phone || '',
            address: profile.address || preCheckInData?.personalInfo?.address || '',
            city: profile.city || preCheckInData?.personalInfo?.city || '',
            state: profile.state || preCheckInData?.personalInfo?.state || '',
            zipCode: profile.zipCode || preCheckInData?.personalInfo?.zipCode || '',
            country: profile.country || preCheckInData?.personalInfo?.country || '',
          };

          try {
            const guests = await guestsService.list({ email: profile.email });
            if (guests && guests.length > 0) {
              const guestProfile = await guestsService.getProfile(guests[0].id);
              if (guestProfile) {
                autofilledData = {
                  ...autofilledData,
                  address: autofilledData.address || guestProfile.address || '',
                  city: autofilledData.city || guestProfile.city || '',
                  state: autofilledData.state || guestProfile.state || '',
                  zipCode: autofilledData.zipCode || guestProfile.postal_code || '',
                  country: autofilledData.country || guestProfile.country || '',
                };

                if (guestProfile.floor_preference || guestProfile.view_preference || guestProfile.bed_type_preference) {
                  updatePreCheckInData({
                    roomPreferences: {
                      floor: (guestProfile.floor_preference as any) || preCheckInData?.roomPreferences?.floor || 'any',
                      view: (guestProfile.view_preference as any) || preCheckInData?.roomPreferences?.view || 'any',
                      bedType: (guestProfile.bed_type_preference as any) || preCheckInData?.roomPreferences?.bedType || 'any',
                      quietness: (guestProfile.quietness_preference as any) || preCheckInData?.roomPreferences?.quietness || 'any',
                    },
                    preferences: {
                      pillowType: guestProfile.pillow_type ? [guestProfile.pillow_type] : preCheckInData?.preferences?.pillowType || [],
                      temperature: guestProfile.temperature_preference || preCheckInData?.preferences?.temperature || 72,
                      minibarPreferences: preCheckInData?.preferences?.minibarPreferences || [],
                      dietaryRestrictions: guestProfile.dietary_restrictions ? [guestProfile.dietary_restrictions] : preCheckInData?.preferences?.dietaryRestrictions || [],
                    },
                  });
                }
              }
            }
          } catch (guestError) {
            console.log('No existing guest profile found');
          }

          reset(autofilledData);
          updatePreCheckInData({ personalInfo: autofilledData });
        } catch (error) {
          console.error('Failed to load user profile:', error);
        }
      }
    };

    autofillUserInfo();
  }, [user]);

  const onSubmit = (data: any) => {
    updatePreCheckInData({ personalInfo: data });
    onNext();
  };

  const steps = [
    { number: 1, label: 'Welcome', active: false },
    { number: 2, label: 'Guest Details', active: true },
    { number: 3, label: 'Room Type', active: false },
    { number: 4, label: 'Travel Details', active: false },
    { number: 5, label: 'Documents', active: false },
    { number: 6, label: 'Preferences', active: false },
    { number: 7, label: 'Special Requests', active: false },
    { number: 8, label: 'Review', active: false },
    { number: 9, label: 'Confirmation', active: false },
  ];

  const currentStepIndex = steps.findIndex(s => s.active);

  const inputBaseClass = "w-full pl-10 pr-4 py-3 border rounded-[10px] focus:outline-none focus:ring-2 focus:border-terra-500 transition-all text-[13px] bg-white";
  const errorClass = "border-rose-500 focus:ring-rose-500/20";
  const normalClass = "border-neutral-200 focus:ring-terra-500/20";
  const labelClass = "block text-[11px] font-semibold uppercase tracking-widest text-neutral-400 mb-2";
  const errorMsgClass = "mt-1.5 text-[11px] text-rose-600 font-medium";

  return (
    <div className="flex min-h-screen bg-white">
      {/* LEFT COLUMN - Vertical Stepper (Hidden on mobile) */}
      <div className="hidden lg:block w-[410px] min-h-screen px-12 py-12 border-r border-neutral-200 bg-white">
        <div className="sticky top-12">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-20"
          >
            <img
              src={logo}
              alt="Glimmora"
              className="h-10 w-auto cursor-pointer"
              onClick={handleLogoClick}
            />
          </motion.div>

          <div className="space-y-0">
            {steps.map((step, index) => (
              <div key={step.number} className="flex items-start gap-4">
                <div className="flex flex-col items-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: index * 0.05 }}
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium transition-all ${
                      step.active
                        ? 'bg-terra-500 text-white'
                        : 'bg-transparent text-neutral-400 border border-neutral-300'
                    }`}
                  >
                    {step.active ? <div className="w-2 h-2 bg-white rounded-full" /> : step.number}
                  </motion.div>
                  {index < steps.length - 1 && (
                    <div className="w-px h-10 bg-neutral-200 mt-1.5" />
                  )}
                </div>
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 + 0.1 }}
                  className="pt-1 pb-8"
                >
                  <div
                    className={`text-sm font-medium mb-1 ${
                      step.active ? 'text-neutral-800' : 'text-neutral-500'
                    }`}
                  >
                    {step.label}
                  </div>
                  {step.active && (
                    <div className="text-[11px] text-neutral-400">
                      Provide your contact information
                    </div>
                  )}
                </motion.div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN - Content Area */}
      <div className="flex-1 min-h-screen bg-neutral-50">
        {/* Mobile Header */}
        <div className="lg:hidden bg-white border-b border-neutral-200 px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <img
              src={logo}
              alt="Glimmora"
              className="h-8 w-auto cursor-pointer"
              onClick={handleLogoClick}
            />
            <span className="text-[13px] text-neutral-500">Step {currentStepIndex + 1} of {steps.length}</span>
          </div>
          <div className="w-full bg-neutral-200 rounded-full h-1">
            <div
              className="bg-terra-500 h-1 rounded-full transition-all duration-300"
              style={{ width: `${((currentStepIndex + 1) / steps.length) * 100}%` }}
            />
          </div>
        </div>

        <div className="px-4 py-6 lg:px-10 lg:py-8">
          <motion.button
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={onPrevious}
            className="flex items-center gap-2 text-[13px] text-neutral-600 hover:text-neutral-800 transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Previous</span>
          </motion.button>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-6 lg:p-8 rounded-[10px] shadow-sm"
          >
            <div className="mb-6 lg:mb-8">
              <h1 className="text-lg font-semibold text-neutral-800 mb-2">
                Personal Information
              </h1>
              <p className="text-[13px] text-neutral-500">
                Please confirm your contact and address details
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              {/* Email */}
              <div>
                <label className={labelClass}>Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                  <input
                    type="email"
                    placeholder="your.email@example.com"
                    {...register('email')}
                    className={`${inputBaseClass} ${errors.email ? errorClass : normalClass}`}
                  />
                </div>
                {errors.email && <p className={errorMsgClass}>{errors.email.message}</p>}
              </div>

              {/* Phone */}
              <div>
                <label className={labelClass}>Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                  <input
                    type="tel"
                    placeholder="9876543210"
                    {...register('phone', {
                      onChange: (e) => {
                        e.target.value = e.target.value.replace(/\D/g, '').slice(0, 10);
                      }
                    })}
                    className={`${inputBaseClass} ${errors.phone ? errorClass : normalClass}`}
                  />
                </div>
                {errors.phone && <p className={errorMsgClass}>{errors.phone.message}</p>}
              </div>

              {/* Address */}
              <div>
                <label className={labelClass}>Street Address</label>
                <div className="relative">
                  <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                  <input
                    type="text"
                    placeholder="123 Main Street, Apt 4B"
                    {...register('address')}
                    className={`${inputBaseClass} ${errors.address ? errorClass : normalClass}`}
                  />
                </div>
                {errors.address && <p className={errorMsgClass}>{errors.address.message}</p>}
              </div>

              {/* Country & State Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Country */}
                <div>
                  <label className={labelClass}>Country</label>
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
                        searchable
                      />
                    )}
                  />
                  {errors.country && <p className={errorMsgClass}>{errors.country.message}</p>}
                </div>

                {/* State / Province */}
                <div>
                  <label className={labelClass}>State / Province</label>
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
                          disabled={!watchedCountry}
                          searchable
                        />
                      )}
                    />
                  ) : (
                    <div className="relative">
                      <Landmark className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 z-10" />
                      <input
                        type="text"
                        placeholder={watchedCountry ? 'Enter state or province' : 'Select country first'}
                        disabled={!watchedCountry}
                        {...register('state')}
                        className={`${inputBaseClass} ${errors.state ? errorClass : normalClass} ${!watchedCountry ? 'opacity-50 cursor-not-allowed' : ''}`}
                      />
                    </div>
                  )}
                  {errors.state && <p className={errorMsgClass}>{errors.state.message}</p>}
                </div>
              </div>

              {/* City & ZIP Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* City */}
                <div>
                  <label className={labelClass}>City</label>
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
                          disabled={!watchedState}
                          searchable
                        />
                      )}
                    />
                  ) : (
                    <div className="relative">
                      <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 z-10" />
                      <input
                        type="text"
                        placeholder={watchedState ? 'Enter city' : 'Select state first'}
                        disabled={!watchedCountry}
                        {...register('city')}
                        className={`${inputBaseClass} ${errors.city ? errorClass : normalClass} ${!watchedCountry ? 'opacity-50 cursor-not-allowed' : ''}`}
                      />
                    </div>
                  )}
                  {errors.city && <p className={errorMsgClass}>{errors.city.message}</p>}
                </div>

                {/* ZIP Code */}
                <div>
                  <label className={labelClass}>ZIP / Postal Code</label>
                  <div className="relative">
                    <Hash className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                    <input
                      type="text"
                      placeholder="10001"
                      {...register('zipCode')}
                      className={`${inputBaseClass} ${errors.zipCode ? errorClass : normalClass}`}
                    />
                  </div>
                  {errors.zipCode && <p className={errorMsgClass}>{errors.zipCode.message}</p>}
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full h-10 text-white font-semibold rounded-lg transition-all text-[13px] mt-6 bg-terra-500 hover:bg-terra-600 active:scale-[0.98]"
              >
                Next
              </button>
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
