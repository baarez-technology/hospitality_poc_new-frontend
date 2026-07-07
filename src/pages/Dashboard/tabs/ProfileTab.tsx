import { motion } from 'framer-motion';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useEffect, useState, useMemo } from 'react';
import { User, Mail, Phone, MapPin, Camera, Save, Globe, Landmark, Building2, Hash } from 'lucide-react';
import toast from 'react-hot-toast';
import { userService } from '@/api/services/user.service';
import { useAuth } from '@/hooks/useAuth';
import { useGeoAddress } from '@/hooks/useGeoAddress';
import { SearchableSelect } from '@/components/ui2/SearchableSelect';

const profileSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().regex(/^\d{10}$/, 'Phone number must be exactly 10 digits'),
  address: z.string().min(5, 'Address must be at least 5 characters'),
  city: z.string().min(2, 'City must be at least 2 characters'),
  state: z.string().min(1, 'State required'),
  zipCode: z.string().min(3, 'ZIP code must be at least 3 characters'),
  country: z.string().min(2, 'Country must be at least 2 characters'),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export function ProfileTab() {
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Parse full name into first and last
  const fullName = user?.fullName || '';
  const nameParts = fullName.split(' ');
  const firstName = nameParts[0] || '';
  const lastName = nameParts.slice(1).join(' ') || '';

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
    control,
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: firstName,
      lastName: lastName,
      email: user?.email || '',
      phone: user?.phone || '',
      address: '',
      city: '',
      state: '',
      zipCode: '',
      country: '',
    },
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

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const profile = await userService.getProfile();
        const nameParts = (profile.fullName || '').split(' ');
        reset({
          firstName: nameParts[0] || '',
          lastName: nameParts.slice(1).join(' ') || '',
          email: profile.email || '',
          phone: profile.phone || '',
          address: profile.address || '',
          city: profile.city || '',
          state: profile.state || '',
          zipCode: profile.zipCode || '',
          country: profile.country || '',
        });
      } catch (error: any) {
        console.error('Failed to load profile:', error);
        toast.error('Failed to load profile data');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      loadProfile();
    }
  }, [user, reset]);

  const onSubmit = async (data: ProfileFormData) => {
    setSaving(true);
    try {
      const updatedProfile = await userService.updateProfile({
        fullName: `${data.firstName} ${data.lastName}`.trim(),
        phone: data.phone,
        address: data.address,
        city: data.city,
        state: data.state,
        zipCode: data.zipCode,
        country: data.country,
      });

      // Also sync to guest record for booking data consistency
      try {
        const syncResult = await userService.syncToGuest();
        console.log('Guest sync result:', syncResult);
      } catch (syncError: any) {
        // Don't fail if sync fails - just log it
        console.warn('Guest sync warning:', syncError.response?.data?.detail || syncError.message);
      }

      updateUser({
        ...user!,
        fullName: updatedProfile.fullName,
        phone: updatedProfile.phone,
      });

      // Parse the updated name for form reset
      const updatedNameParts = (updatedProfile.fullName || '').split(' ');

      // Update form with saved values
      reset({
        firstName: updatedNameParts[0] || '',
        lastName: updatedNameParts.slice(1).join(' ') || '',
        email: updatedProfile.email || '',
        phone: updatedProfile.phone || '',
        address: updatedProfile.address || '',
        city: updatedProfile.city || '',
        state: updatedProfile.state || '',
        zipCode: updatedProfile.zipCode || '',
        country: updatedProfile.country || '',
      });

      toast.success('Profile updated successfully!');
    } catch (error: any) {
      console.error('Failed to update profile:', error);
      toast.error(error.response?.data?.detail || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-neutral-500">Loading profile...</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl">
      {/* Profile Picture */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="border border-neutral-200 rounded-xl p-6 bg-white mb-6"
      >
        <h3 className="text-lg font-semibold text-neutral-900 mb-6">Profile Picture</h3>
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 bg-neutral-100 rounded-full flex items-center justify-center text-neutral-600 font-semibold text-2xl border-2 border-neutral-200">
            {firstName.charAt(0).toUpperCase()}{lastName.charAt(0).toUpperCase() || firstName.charAt(1)?.toUpperCase() || ''}
          </div>
          <div className="flex-1">
            <button onClick={() => toast('Photo upload coming soon')} className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors text-sm">
              <Camera className="w-4 h-4" />
              Upload New Photo
            </button>
            <p className="text-xs text-neutral-500 mt-2">
              JPG, PNG or GIF. Max size of 5MB.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Profile Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="border border-neutral-200 rounded-xl p-6 bg-white"
      >
        <h3 className="text-lg font-semibold text-neutral-900 mb-6">Personal Information</h3>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Name */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                First Name
              </label>
              <input
                {...register('firstName')}
                type="text"
                className="w-full px-4 py-2.5 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all text-sm"
                placeholder="John"
              />
              {errors.firstName && (
                <p className="mt-1 text-xs text-red-600">{errors.firstName.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Last Name
              </label>
              <input
                {...register('lastName')}
                type="text"
                className="w-full px-4 py-2.5 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all text-sm"
                placeholder="Doe"
              />
              {errors.lastName && (
                <p className="mt-1 text-xs text-red-600">{errors.lastName.message}</p>
              )}
            </div>
          </div>

          {/* Contact */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Email Address
              </label>
              <input
                {...register('email')}
                type="email"
                disabled
                className="w-full px-4 py-2.5 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all text-sm bg-neutral-50 cursor-not-allowed"
                placeholder="john.doe@email.com"
              />
              <p className="mt-1 text-xs text-neutral-500">Email cannot be changed</p>
              {errors.email && (
                <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Phone Number
              </label>
              <input
                {...register('phone', {
                  onChange: (e) => {
                    e.target.value = e.target.value.replace(/\D/g, '').slice(0, 10);
                  }
                })}
                type="tel"
                className="w-full px-4 py-2.5 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all text-sm"
                placeholder="9876543210"
              />
              {errors.phone && (
                <p className="mt-1 text-xs text-red-600">{errors.phone.message}</p>
              )}
            </div>
          </div>

          {/* Address */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Street Address
            </label>
            <input
              {...register('address')}
              type="text"
              className="w-full px-4 py-2.5 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all text-sm"
              placeholder="123 Ocean Drive"
            />
            {errors.address && (
              <p className="mt-1 text-xs text-red-600">{errors.address.message}</p>
            )}
          </div>

          {/* Country & State Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Country */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Country
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
                    searchable
                  />
                )}
              />
              {errors.country && (
                <p className="mt-1 text-xs text-red-600">{errors.country.message}</p>
              )}
            </div>

            {/* State / Province */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                State / Province
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
                      disabled={!watchedCountry}
                      searchable
                    />
                  )}
                />
              ) : (
                <input
                  type="text"
                  placeholder={watchedCountry ? 'Enter state or province' : 'Select country first'}
                  disabled={!watchedCountry}
                  {...register('state')}
                  className="w-full px-4 py-2.5 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                />
              )}
              {errors.state && (
                <p className="mt-1 text-xs text-red-600">{errors.state.message}</p>
              )}
            </div>
          </div>

          {/* City & ZIP Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* City */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                City
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
                      disabled={!watchedState}
                      searchable
                    />
                  )}
                />
              ) : (
                <input
                  type="text"
                  placeholder={watchedState ? 'Enter city' : 'Select state first'}
                  disabled={!watchedCountry}
                  {...register('city')}
                  className="w-full px-4 py-2.5 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                />
              )}
              {errors.city && (
                <p className="mt-1 text-xs text-red-600">{errors.city.message}</p>
              )}
            </div>

            {/* ZIP Code */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                ZIP / Postal Code
              </label>
              <input
                {...register('zipCode')}
                type="text"
                className="w-full px-4 py-2.5 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all text-sm"
                placeholder="33139"
              />
              {errors.zipCode && (
                <p className="mt-1 text-xs text-red-600">{errors.zipCode.message}</p>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 bg-primary-600 hover:bg-primary-700 disabled:bg-neutral-400 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors flex items-center gap-2 text-sm"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}