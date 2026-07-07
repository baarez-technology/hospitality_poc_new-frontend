/**
 * useSettings Hook
 * Master settings hook that combines all settings functionality
 * Now wired with backend API for persistence
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { loadGeneralSettings, saveGeneralSettings, loadBilling, saveBilling } from '../utils/settingsStorage';
import { hotelSettingsService, HotelSettingsResponse, HotelSettingsUpdate } from '../api/services/hotel-settings.service';

const defaultGeneralSettings = {
  hotelName: 'Hotel Management',
  tagline: 'Your Comfort, Our Priority',
  currency: 'INR',
  timezone: 'Asia/Kolkata',
  dateFormat: 'DD/MM/YYYY',
  timeFormat: '12h',
  language: 'en',
  contactEmail: 'info@jparkinn.com',
  contactPhone: '+91-6300275340',
  contactPhone2: '+91-6300275340',
  website: 'https://jparkinn.com',
  checkInTime: '12:00',
  checkOutTime: '11:00',
  address: {
    street: 'BCM Road',
    city: 'Palvancha',
    state: 'Telangana',
    zip: '507115',
    country: 'India'
  },
  branding: {
    primaryColor: '#8B5CF6',
    secondaryColor: '#EC4899',
    logo: null as string | null,
    favicon: null as string | null
  },
  socialMedia: {
    facebook: '',
    instagram: '',
    twitter: '',
    linkedin: ''
  },
  paymentSettings: {
    upiEnabled: false,
    upiId: '',
    upiQrImage: null as string | null,
    upiDisplayName: '',
    bankName: '',
    bankAccountNumber: '',
    bankIfsc: '',
    bankAccountHolder: ''
  },
  printSettings: {
    paperSize: 'A4',         // A4 | Letter | Legal | A5 | 80mm | 58mm
    orientation: 'portrait', // portrait | landscape
    margin: 'normal'         // normal | narrow | wide | none
  },
  gstin: ''
};

const defaultBillingSettings = {
  currentPlan: {
    id: 'pro',
    name: 'Pro',
    price: 49,
    billingCycle: 'month',
    features: [
      'Up to 50 rooms',
      'Up to 10 users',
      'Advanced Analytics',
      'AI Assistant',
      'Priority Support',
      'All Integrations'
    ]
  },
  usage: {
    rooms: 25,
    roomsLimit: 50,
    users: 5,
    usersLimit: 10,
    storageUsed: '12 GB',
    storageLimit: '50 GB',
    bookingsThisMonth: 127
  },
  paymentMethod: {
    type: 'Visa',
    last4: '4242',
    expiryMonth: '12',
    expiryYear: '2026'
  },
  billingHistory: [],
  nextBillingDate: null
};

// Helper to convert backend response to frontend format
const backendToFrontend = (backend: HotelSettingsResponse) => ({
  hotelName: backend.hotel_name || defaultGeneralSettings.hotelName,
  tagline: backend.tagline || defaultGeneralSettings.tagline,
  currency: backend.currency || defaultGeneralSettings.currency,
  timezone: backend.timezone || defaultGeneralSettings.timezone,
  dateFormat: defaultGeneralSettings.dateFormat,
  timeFormat: defaultGeneralSettings.timeFormat,
  language: defaultGeneralSettings.language,
  contactEmail: backend.email || defaultGeneralSettings.contactEmail,
  contactPhone: backend.phone || defaultGeneralSettings.contactPhone,
  contactPhone2: backend.phone2 || defaultGeneralSettings.contactPhone2,
  website: backend.website || defaultGeneralSettings.website,
  checkInTime: backend.check_in_time || defaultGeneralSettings.checkInTime,
  checkOutTime: backend.check_out_time || defaultGeneralSettings.checkOutTime,
  address: {
    street: backend.address?.street || defaultGeneralSettings.address.street,
    city: backend.address?.city || defaultGeneralSettings.address.city,
    state: backend.address?.state || defaultGeneralSettings.address.state,
    zip: backend.address?.zip || defaultGeneralSettings.address.zip,
    country: backend.address?.country || defaultGeneralSettings.address.country
  },
  branding: {
    primaryColor: backend.branding?.primaryColor || defaultGeneralSettings.branding.primaryColor,
    secondaryColor: backend.branding?.secondaryColor || defaultGeneralSettings.branding.secondaryColor,
    logo: backend.branding?.logo || defaultGeneralSettings.branding.logo,
    favicon: backend.branding?.favicon || defaultGeneralSettings.branding.favicon
  },
  socialMedia: {
    facebook: backend.social_media?.facebook || defaultGeneralSettings.socialMedia.facebook,
    instagram: backend.social_media?.instagram || defaultGeneralSettings.socialMedia.instagram,
    twitter: backend.social_media?.twitter || defaultGeneralSettings.socialMedia.twitter,
    linkedin: backend.social_media?.linkedin || defaultGeneralSettings.socialMedia.linkedin
  },
  paymentSettings: {
    upiEnabled: backend.payment_settings?.upi_enabled || false,
    upiId: backend.payment_settings?.upi_id || '',
    upiQrImage: backend.payment_settings?.upi_qr_image || null,
    upiDisplayName: backend.payment_settings?.upi_display_name || '',
    bankName: backend.payment_settings?.bank_name || '',
    bankAccountNumber: backend.payment_settings?.bank_account_number || '',
    bankIfsc: backend.payment_settings?.bank_ifsc || '',
    bankAccountHolder: backend.payment_settings?.bank_account_holder || ''
  },
  printSettings: {
    paperSize: backend.print_settings?.paper_size || defaultGeneralSettings.printSettings.paperSize,
    orientation: backend.print_settings?.orientation || defaultGeneralSettings.printSettings.orientation,
    margin: backend.print_settings?.margin || defaultGeneralSettings.printSettings.margin
  },
  gstin: backend.gstin || ''
});

// Helper to convert frontend format to backend update format
const frontendToBackend = (frontend: typeof defaultGeneralSettings): HotelSettingsUpdate => ({
  hotel_name: frontend.hotelName,
  tagline: frontend.tagline,
  currency: frontend.currency,
  timezone: frontend.timezone,
  email: frontend.contactEmail,
  phone: frontend.contactPhone,
  phone2: frontend.contactPhone2,
  website: frontend.website,
  check_in_time: frontend.checkInTime,
  check_out_time: frontend.checkOutTime,
  address: {
    street: frontend.address.street,
    city: frontend.address.city,
    state: frontend.address.state,
    zip: frontend.address.zip,
    country: frontend.address.country
  },
  branding: {
    logo: frontend.branding.logo,
    primaryColor: frontend.branding.primaryColor,
    secondaryColor: frontend.branding.secondaryColor,
    favicon: frontend.branding.favicon
  },
  social_media: {
    facebook: frontend.socialMedia.facebook,
    instagram: frontend.socialMedia.instagram,
    twitter: frontend.socialMedia.twitter,
    linkedin: frontend.socialMedia.linkedin
  },
  payment_settings: frontend.paymentSettings ? {
    upi_enabled: frontend.paymentSettings.upiEnabled,
    upi_id: frontend.paymentSettings.upiId,
    upi_qr_image: frontend.paymentSettings.upiQrImage,
    upi_display_name: frontend.paymentSettings.upiDisplayName,
    bank_name: frontend.paymentSettings.bankName,
    bank_account_number: frontend.paymentSettings.bankAccountNumber,
    bank_ifsc: frontend.paymentSettings.bankIfsc,
    bank_account_holder: frontend.paymentSettings.bankAccountHolder
  } : undefined,
  print_settings: frontend.printSettings ? {
    paper_size: frontend.printSettings.paperSize,
    orientation: frontend.printSettings.orientation,
    margin: frontend.printSettings.margin
  } : undefined,
  gstin: frontend.gstin
});

export function useSettings() {
  const [generalSettings, setGeneralSettings] = useState(defaultGeneralSettings);
  const [billingSettings, setBillingSettings] = useState(defaultBillingSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const initialLoadDone = useRef(false);
  const pendingSave = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load settings from backend on mount, fallback to localStorage
  useEffect(() => {
    const loadSettings = async () => {
      // Always load localStorage first as base
      const storedGeneral = loadGeneralSettings();
      const localSettings = storedGeneral && Object.keys(storedGeneral).length > 0
        ? {
            ...defaultGeneralSettings,
            ...storedGeneral,
            address: { ...defaultGeneralSettings.address, ...storedGeneral.address },
            branding: { ...defaultGeneralSettings.branding, ...storedGeneral.branding },
            socialMedia: { ...defaultGeneralSettings.socialMedia, ...storedGeneral.socialMedia }
          }
        : defaultGeneralSettings;

      try {
        // Try to load from backend
        const backendSettings = await hotelSettingsService.getSettings();

        if (backendSettings) {
          const converted = backendToFrontend(backendSettings);
          // Merge: localStorage first, then backend (backend wins for non-null values)
          // But keep localStorage logo if backend has none
          const mergedSettings = {
            ...localSettings,
            ...converted,
            address: { ...localSettings.address, ...converted.address },
            branding: {
              ...localSettings.branding,
              ...converted.branding,
              // Keep localStorage logo if backend has none
              logo: converted.branding.logo || localSettings.branding?.logo || null
            },
            socialMedia: { ...localSettings.socialMedia, ...converted.socialMedia }
          };
          setGeneralSettings(mergedSettings);
          // Save merged settings to localStorage
          saveGeneralSettings(mergedSettings);
        } else {
          // No backend data, use localStorage
          setGeneralSettings(localSettings);
          if (!storedGeneral || Object.keys(storedGeneral).length === 0) {
            saveGeneralSettings(defaultGeneralSettings);
          }
        }
      } catch (error) {
        console.error('[useSettings] Failed to load from backend, using localStorage:', error);
        // Use localStorage settings
        setGeneralSettings(localSettings);
      }

      // Load billing from localStorage (not backend for now)
      const storedBilling = loadBilling();
      if (storedBilling && Object.keys(storedBilling).length > 0) {
        setBillingSettings({
          ...defaultBillingSettings,
          ...storedBilling
        });
      } else {
        saveBilling(defaultBillingSettings);
      }

      setLoading(false);
      initialLoadDone.current = true;
    };

    loadSettings();
  }, []);

  // Save general settings to localStorage (immediate) and backend (debounced)
  useEffect(() => {
    if (!loading && initialLoadDone.current) {
      // Always save to localStorage immediately
      saveGeneralSettings(generalSettings);

      // Debounce backend save
      if (pendingSave.current) {
        clearTimeout(pendingSave.current);
      }

      pendingSave.current = setTimeout(async () => {
        try {
          setSaving(true);
          await hotelSettingsService.updateSettings(frontendToBackend(generalSettings));
          console.log('[useSettings] Settings saved to backend');
        } catch (error) {
          console.error('[useSettings] Failed to save to backend:', error);
        } finally {
          setSaving(false);
        }
      }, 1000); // Debounce for 1 second
    }

    return () => {
      if (pendingSave.current) {
        clearTimeout(pendingSave.current);
      }
    };
  }, [generalSettings, loading]);

  // Save billing settings to localStorage
  useEffect(() => {
    if (!loading) {
      saveBilling(billingSettings);
    }
  }, [billingSettings, loading]);

  /**
   * Update general settings
   * @param {object} updates - Fields to update
   */
  const updateGeneralSettings = useCallback((updates) => {
    setGeneralSettings(prev => ({
      ...prev,
      ...updates,
      address: updates.address ? { ...prev.address, ...updates.address } : prev.address,
      branding: updates.branding ? { ...prev.branding, ...updates.branding } : prev.branding,
      socialMedia: updates.socialMedia ? { ...prev.socialMedia, ...updates.socialMedia } : prev.socialMedia,
      updatedAt: new Date().toISOString()
    }));
  }, []);

  /**
   * Update hotel name
   * @param {string} name - New hotel name
   */
  const setHotelName = useCallback((name) => {
    setGeneralSettings(prev => ({
      ...prev,
      hotelName: name,
      updatedAt: new Date().toISOString()
    }));
  }, []);

  /**
   * Update contact information
   * @param {object} contact - { email, phone, website }
   */
  const updateContactInfo = useCallback((contact) => {
    setGeneralSettings(prev => ({
      ...prev,
      contactEmail: contact.email ?? prev.contactEmail,
      contactPhone: contact.phone ?? prev.contactPhone,
      website: contact.website ?? prev.website,
      updatedAt: new Date().toISOString()
    }));
  }, []);

  /**
   * Update address
   * @param {object} address - Address fields
   */
  const updateAddress = useCallback((address) => {
    setGeneralSettings(prev => ({
      ...prev,
      address: {
        ...prev.address,
        ...address
      },
      updatedAt: new Date().toISOString()
    }));
  }, []);

  /**
   * Update branding
   * @param {object} branding - Branding fields
   */
  const updateBranding = useCallback((branding) => {
    setGeneralSettings(prev => ({
      ...prev,
      branding: {
        ...prev.branding,
        ...branding
      },
      updatedAt: new Date().toISOString()
    }));
  }, []);

  /**
   * Update social media links
   * @param {object} socialMedia - Social media links
   */
  const updateSocialMedia = useCallback((socialMedia) => {
    setGeneralSettings(prev => ({
      ...prev,
      socialMedia: {
        ...prev.socialMedia,
        ...socialMedia
      },
      updatedAt: new Date().toISOString()
    }));
  }, []);

  /**
   * Update payment settings (UPI, bank details)
   * @param {object} paymentSettings - Payment settings fields
   */
  const updatePaymentSettings = useCallback((paymentSettings) => {
    setGeneralSettings(prev => ({
      ...prev,
      paymentSettings: {
        ...prev.paymentSettings,
        ...paymentSettings
      },
      updatedAt: new Date().toISOString()
    }));
  }, []);

  /**
   * Update print & preview settings (paper size, orientation, margins)
   * @param {object} printSettings - Print settings fields
   */
  const updatePrintSettings = useCallback((printSettings) => {
    setGeneralSettings(prev => ({
      ...prev,
      printSettings: {
        ...prev.printSettings,
        ...printSettings
      },
      updatedAt: new Date().toISOString()
    }));
  }, []);

  /**
   * Update currency
   * @param {string} currency - Currency code (e.g., 'USD', 'EUR')
   */
  const setCurrency = useCallback((currency) => {
    setGeneralSettings(prev => ({
      ...prev,
      currency,
      updatedAt: new Date().toISOString()
    }));
  }, []);

  /**
   * Update timezone
   * @param {string} timezone - Timezone string
   */
  const setTimezone = useCallback((timezone) => {
    setGeneralSettings(prev => ({
      ...prev,
      timezone,
      updatedAt: new Date().toISOString()
    }));
  }, []);

  /**
   * Update billing plan (dummy)
   * @param {string} planId - Plan ID
   */
  const changePlan = useCallback((planId) => {
    // In a real app, this would call an API
    const plans = {
      starter: {
        id: 'starter',
        name: 'Starter',
        price: 19,
        billingCycle: 'month',
        features: ['Up to 10 rooms', 'Up to 3 users', 'Basic Analytics']
      },
      pro: {
        id: 'pro',
        name: 'Pro',
        price: 49,
        billingCycle: 'month',
        features: ['Up to 50 rooms', 'Up to 10 users', 'Advanced Analytics', 'AI Assistant']
      },
      enterprise: {
        id: 'enterprise',
        name: 'Enterprise',
        price: 99,
        billingCycle: 'month',
        features: ['Unlimited rooms', 'Unlimited users', 'Custom Analytics', 'Priority Support']
      }
    };

    const newPlan = plans[planId];
    if (!newPlan) return;

    setBillingSettings(prev => ({
      ...prev,
      currentPlan: newPlan,
      updatedAt: new Date().toISOString()
    }));
  }, []);

  /**
   * Update payment method (dummy)
   * @param {object} paymentMethod - Payment method details
   */
  const updatePaymentMethod = useCallback((paymentMethod) => {
    setBillingSettings(prev => ({
      ...prev,
      paymentMethod: {
        ...prev.paymentMethod,
        ...paymentMethod
      },
      updatedAt: new Date().toISOString()
    }));
  }, []);

  /**
   * Reset general settings to defaults
   */
  const resetGeneralSettings = useCallback(() => {
    setGeneralSettings(defaultGeneralSettings);
    saveGeneralSettings(defaultGeneralSettings);
  }, []);

  /**
   * Export all settings as JSON
   * @returns {object}
   */
  const exportSettings = useCallback(() => {
    return {
      general: generalSettings,
      billing: billingSettings,
      exportedAt: new Date().toISOString()
    };
  }, [generalSettings, billingSettings]);

  /**
   * Import settings from JSON
   * @param {object} data - Settings data
   */
  const importSettings = useCallback((data) => {
    if (data.general) {
      setGeneralSettings({
        ...defaultGeneralSettings,
        ...data.general
      });
    }

    if (data.billing) {
      setBillingSettings({
        ...defaultBillingSettings,
        ...data.billing
      });
    }
  }, []);

  return {
    generalSettings,
    billingSettings,
    loading,
    saving,
    updateGeneralSettings,
    setHotelName,
    updateContactInfo,
    updateAddress,
    updateBranding,
    updateSocialMedia,
    updatePaymentSettings,
    updatePrintSettings,
    setCurrency,
    setTimezone,
    changePlan,
    updatePaymentMethod,
    resetGeneralSettings,
    exportSettings,
    importSettings
  };
}
