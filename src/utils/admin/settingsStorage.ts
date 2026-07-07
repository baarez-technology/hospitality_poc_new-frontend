/**
 * Settings Storage Utility
 * Handle localStorage persistence for all settings
 */

const STORAGE_KEYS = {
  USERS: 'glimmora_users',
  ROLES: 'glimmora_roles',
  PERMISSIONS: 'glimmora_permissions',
  GENERAL_SETTINGS: 'glimmora_general_settings',
  NOTIFICATIONS: 'glimmora_notifications',
  AI_SETTINGS: 'glimmora_ai_settings',
  INTEGRATIONS: 'glimmora_integrations',
  BILLING: 'glimmora_billing'
};

/**
 * Load data from localStorage
 */
export function loadFromStorage(key: string, defaultValue: any = null): any {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error(`Error loading from storage (${key}):`, error);
    return defaultValue;
  }
}

/**
 * Save data to localStorage
 */
export function saveToStorage(key: string, value: any): boolean {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error(`Error saving to storage (${key}):`, error);
    return false;
  }
}

/**
 * Remove item from localStorage
 */
export function removeFromStorage(key: string): boolean {
  try {
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error(`Error removing from storage (${key}):`, error);
    return false;
  }
}

/**
 * Clear all Glimmora settings
 */
export function clearAllSettings() {
  Object.values(STORAGE_KEYS).forEach(key => {
    removeFromStorage(key);
  });
}

/**
 * Users
 */
export function loadUsers(): any[] {
  return loadFromStorage(STORAGE_KEYS.USERS, []);
}

export function saveUsers(users: any[]): boolean {
  return saveToStorage(STORAGE_KEYS.USERS, users);
}

/**
 * Roles
 */
export function loadRoles(): any[] {
  return loadFromStorage(STORAGE_KEYS.ROLES, []);
}

export function saveRoles(roles: any[]): boolean {
  return saveToStorage(STORAGE_KEYS.ROLES, roles);
}

/**
 * Permissions
 */
export function loadPermissions(): any {
  return loadFromStorage(STORAGE_KEYS.PERMISSIONS, {});
}

export function savePermissions(permissions: any): boolean {
  return saveToStorage(STORAGE_KEYS.PERMISSIONS, permissions);
}

/**
 * General Settings
 */
export function loadGeneralSettings(): any {
  const settings = loadFromStorage(STORAGE_KEYS.GENERAL_SETTINGS, {});
  // Migrate legacy USD default to INR
  if (settings && settings.currency === 'USD') {
    settings.currency = 'INR';
    saveToStorage(STORAGE_KEYS.GENERAL_SETTINGS, settings);
  }
  return settings;
}

export function saveGeneralSettings(settings: any): boolean {
  return saveToStorage(STORAGE_KEYS.GENERAL_SETTINGS, settings);
}

/**
 * Notifications
 */
export function loadNotifications(): any {
  return loadFromStorage(STORAGE_KEYS.NOTIFICATIONS, {});
}

export function saveNotifications(notifications: any): boolean {
  return saveToStorage(STORAGE_KEYS.NOTIFICATIONS, notifications);
}

/**
 * AI Settings
 */
export function loadAISettings(): any {
  return loadFromStorage(STORAGE_KEYS.AI_SETTINGS, {});
}

export function saveAISettings(settings: any): boolean {
  return saveToStorage(STORAGE_KEYS.AI_SETTINGS, settings);
}

/**
 * Integrations
 */
export function loadIntegrations(): any[] {
  return loadFromStorage(STORAGE_KEYS.INTEGRATIONS, []);
}

export function saveIntegrations(integrations: any[]): boolean {
  return saveToStorage(STORAGE_KEYS.INTEGRATIONS, integrations);
}

/**
 * Billing
 */
export function loadBilling(): any {
  return loadFromStorage(STORAGE_KEYS.BILLING, {});
}

export function saveBilling(billing: any): boolean {
  return saveToStorage(STORAGE_KEYS.BILLING, billing);
}

export { STORAGE_KEYS };
