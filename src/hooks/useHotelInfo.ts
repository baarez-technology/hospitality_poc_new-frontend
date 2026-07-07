/**
 * useHotelInfo Hook
 * Provides dynamic hotel information from settings context.
 * All guest-facing pages should use this instead of hardcoded constants.
 */

import { useMemo } from 'react';
import { useSettingsContext } from '../contexts/SettingsContext';

const defaultAddress = {
  street: 'BCM Road',
  city: 'Palvancha',
  state: 'Telangana',
  zip: '507115',
  country: 'India',
};

const defaultSocial = {
  facebook: '',
  instagram: '',
  twitter: '',
  linkedin: '',
};

export function useHotelInfo() {
  const { generalSettings } = useSettingsContext() as any;

  return useMemo(() => ({
    name: generalSettings?.hotelName || 'J Park Inn Hotel',
    tagline: generalSettings?.tagline || 'Your Comfort, Our Priority',
    address: generalSettings?.address || defaultAddress,
    phone: generalSettings?.contactPhone || '+91-6300275340',
    phone2: generalSettings?.contactPhone2 || '+91-6300275340',
    email: generalSettings?.contactEmail || 'info@jparkinn.com',
    website: generalSettings?.website || '',
    logo: generalSettings?.branding?.logo || null,
    socialMedia: generalSettings?.socialMedia || defaultSocial,
    checkInTime: generalSettings?.checkInTime || '3:00 PM',
    checkOutTime: generalSettings?.checkOutTime || '11:00 AM',
    gstin: generalSettings?.gstin || '',
  }), [generalSettings]);
}

export default useHotelInfo;
