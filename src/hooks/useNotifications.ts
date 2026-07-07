/**
 * useNotifications Hook
 * Notification settings management with localStorage persistence
 */

import { useState, useEffect, useCallback } from 'react';
import { loadNotifications, saveNotifications } from '../utils/settingsStorage';
import { defaultNotificationSettings } from '../data/notificationOptions';

export function useNotifications() {
  const [settings, setSettings] = useState(defaultNotificationSettings);
  const [loading, setLoading] = useState(true);

  // Load notification settings from localStorage on mount
  useEffect(() => {
    const storedSettings = loadNotifications();
    if (storedSettings && Object.keys(storedSettings).length > 0) {
      setSettings({
        ...defaultNotificationSettings,
        ...storedSettings
      });
    } else {
      // Initialize with defaults
      setSettings(defaultNotificationSettings);
      saveNotifications(defaultNotificationSettings);
    }
    setLoading(false);
  }, []);

  // Save settings to localStorage whenever they change
  useEffect(() => {
    if (!loading) {
      saveNotifications(settings);
    }
  }, [settings, loading]);

  /**
   * Update email notification settings
   * @param {string} key - Setting key
   * @param {boolean} value - New value
   */
  const updateEmailSetting = useCallback((key, value) => {
    setSettings(prev => ({
      ...prev,
      email: {
        ...prev.email,
        [key]: value
      }
    }));
  }, []);

  /**
   * Update SMS notification settings
   * @param {string} key - Setting key
   * @param {boolean} value - New value
   */
  const updateSMSSetting = useCallback((key, value) => {
    setSettings(prev => ({
      ...prev,
      sms: {
        ...prev.sms,
        [key]: value
      }
    }));
  }, []);

  /**
   * Update staff notification settings
   * @param {string} key - Setting key
   * @param {boolean} value - New value
   */
  const updateStaffSetting = useCallback((key, value) => {
    setSettings(prev => ({
      ...prev,
      staff: {
        ...prev.staff,
        [key]: value
      }
    }));
  }, []);

  /**
   * Update revenue notification settings
   * @param {string} key - Setting key
   * @param {boolean} value - New value
   */
  const updateRevenueSetting = useCallback((key, value) => {
    setSettings(prev => ({
      ...prev,
      revenue: {
        ...prev.revenue,
        [key]: value
      }
    }));
  }, []);

  /**
   * Update any notification setting by category and key
   * @param {string} category - Category (email, sms, staff, revenue)
   * @param {string} key - Setting key
   * @param {boolean} value - New value
   */
  const updateSetting = useCallback((category, key, value) => {
    if (!settings[category]) {
      console.error(`Invalid notification category: ${category}`);
      return;
    }

    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value
      }
    }));
  }, [settings]);

  /**
   * Enable all email notifications
   */
  const enableAllEmail = useCallback(() => {
    setSettings(prev => ({
      ...prev,
      email: {
        enabled: true,
        newBooking: true,
        cancellation: true,
        checkIn: true,
        checkOut: true,
        payment: true,
        review: true,
        lowInventory: true
      }
    }));
  }, []);

  /**
   * Disable all email notifications
   */
  const disableAllEmail = useCallback(() => {
    setSettings(prev => ({
      ...prev,
      email: {
        ...prev.email,
        enabled: false
      }
    }));
  }, []);

  /**
   * Enable all SMS notifications
   */
  const enableAllSMS = useCallback(() => {
    setSettings(prev => ({
      ...prev,
      sms: {
        enabled: true,
        urgentOnly: false,
        checkIn: true,
        checkOut: true,
        payment: true
      }
    }));
  }, []);

  /**
   * Disable all SMS notifications
   */
  const disableAllSMS = useCallback(() => {
    setSettings(prev => ({
      ...prev,
      sms: {
        ...prev.sms,
        enabled: false
      }
    }));
  }, []);

  /**
   * Enable all staff notifications
   */
  const enableAllStaff = useCallback(() => {
    setSettings(prev => ({
      ...prev,
      staff: {
        housekeepingAlerts: true,
        maintenanceAlerts: true,
        guestRequests: true,
        lowInventory: true
      }
    }));
  }, []);

  /**
   * Disable all staff notifications
   */
  const disableAllStaff = useCallback(() => {
    setSettings(prev => ({
      ...prev,
      staff: {
        housekeepingAlerts: false,
        maintenanceAlerts: false,
        guestRequests: false,
        lowInventory: false
      }
    }));
  }, []);

  /**
   * Enable all revenue notifications
   */
  const enableAllRevenue = useCallback(() => {
    setSettings(prev => ({
      ...prev,
      revenue: {
        dailyReports: true,
        weeklyReports: true,
        priceAlerts: true,
        occupancyAlerts: true
      }
    }));
  }, []);

  /**
   * Disable all revenue notifications
   */
  const disableAllRevenue = useCallback(() => {
    setSettings(prev => ({
      ...prev,
      revenue: {
        dailyReports: false,
        weeklyReports: false,
        priceAlerts: false,
        occupancyAlerts: false
      }
    }));
  }, []);

  /**
   * Reset to default settings
   */
  const resetToDefaults = useCallback(() => {
    setSettings(defaultNotificationSettings);
    saveNotifications(defaultNotificationSettings);
  }, []);

  /**
   * Get notification count (how many are enabled)
   */
  const getEnabledCount = useCallback(() => {
    let count = 0;

    // Count email notifications
    if (settings.email.enabled) {
      Object.keys(settings.email).forEach(key => {
        if (key !== 'enabled' && settings.email[key]) count++;
      });
    }

    // Count SMS notifications
    if (settings.sms.enabled) {
      Object.keys(settings.sms).forEach(key => {
        if (key !== 'enabled' && settings.sms[key]) count++;
      });
    }

    // Count staff notifications
    Object.values(settings.staff).forEach(value => {
      if (value) count++;
    });

    // Count revenue notifications
    Object.values(settings.revenue).forEach(value => {
      if (value) count++;
    });

    return count;
  }, [settings]);

  /**
   * Check if a specific notification is enabled
   * @param {string} category - Category (email, sms, staff, revenue)
   * @param {string} key - Setting key
   * @returns {boolean}
   */
  const isEnabled = useCallback((category, key) => {
    if (!settings[category]) return false;
    return settings[category][key] === true;
  }, [settings]);

  return {
    settings,
    loading,
    updateEmailSetting,
    updateSMSSetting,
    updateStaffSetting,
    updateRevenueSetting,
    updateSetting,
    enableAllEmail,
    disableAllEmail,
    enableAllSMS,
    disableAllSMS,
    enableAllStaff,
    disableAllStaff,
    enableAllRevenue,
    disableAllRevenue,
    resetToDefaults,
    getEnabledCount,
    isEnabled
  };
}
