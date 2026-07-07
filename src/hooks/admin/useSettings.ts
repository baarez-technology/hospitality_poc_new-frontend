/**
 * useSettings Hook
 * Master settings hook that combines all settings functionality
 */

import { useState, useEffect, useCallback } from 'react';
import { loadGeneralSettings, saveGeneralSettings, loadBilling, saveBilling } from '@/utils/admin/settingsStorage';

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
    logo: null,
    favicon: null
  },
  socialMedia: {
    facebook: '',
    instagram: '',
    twitter: '',
    linkedin: ''
  }
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

export function useSettings() {
  const [generalSettings, setGeneralSettings] = useState(defaultGeneralSettings);
  const [billingSettings, setBillingSettings] = useState(defaultBillingSettings);
  const [loading, setLoading] = useState(true);

  // Load settings from localStorage on mount
  useEffect(() => {
    const storedGeneral = loadGeneralSettings();
    const storedBilling = loadBilling();

    if (storedGeneral && Object.keys(storedGeneral).length > 0) {
      setGeneralSettings({
        ...defaultGeneralSettings,
        ...storedGeneral,
        address: { ...defaultGeneralSettings.address, ...storedGeneral.address },
        branding: { ...defaultGeneralSettings.branding, ...storedGeneral.branding },
        socialMedia: { ...defaultGeneralSettings.socialMedia, ...storedGeneral.socialMedia }
      });
    } else {
      saveGeneralSettings(defaultGeneralSettings);
    }

    if (storedBilling && Object.keys(storedBilling).length > 0) {
      setBillingSettings({
        ...defaultBillingSettings,
        ...storedBilling
      });
    } else {
      saveBilling(defaultBillingSettings);
    }

    setLoading(false);
  }, []);

  // Save general settings to localStorage
  useEffect(() => {
    if (!loading) {
      saveGeneralSettings(generalSettings);
    }
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
    updateGeneralSettings,
    setHotelName,
    updateContactInfo,
    updateAddress,
    updateBranding,
    updateSocialMedia,
    setCurrency,
    setTimezone,
    changePlan,
    updatePaymentMethod,
    resetGeneralSettings,
    exportSettings,
    importSettings
  };
}
