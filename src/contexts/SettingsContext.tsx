/**
 * Settings Context
 * Global settings state management
 * Exposes all settings hooks to the application
 */

import React, { createContext, useContext } from 'react';
import PrintPageStyle from '../components/settings/PrintPageStyle';
import { useUsers } from '../hooks/useUsers';
import { useRolesPermissions } from '../hooks/useRolesPermissions';
import { useIntegrations } from '../hooks/useIntegrations';
import { useNotifications } from '../hooks/useNotifications';
import { useAIConfig } from '../hooks/useAIConfig';
import { useSettings } from '../hooks/useSettings';

const SettingsContext = createContext(null);

/**
 * Settings Provider Component
 * Wraps the application and provides settings state
 */
export function SettingsProvider({ children }) {
  // Initialize all hooks
  const usersHook = useUsers();
  const rolesPermissionsHook = useRolesPermissions();
  const integrationsHook = useIntegrations();
  const notificationsHook = useNotifications();
  const aiConfigHook = useAIConfig();
  const settingsHook = useSettings();

  const value = {
    // Users management
    users: usersHook.users,
    usersLoading: usersHook.loading,
    addUser: usersHook.addUser,
    updateUser: usersHook.updateUser,
    disableUser: usersHook.disableUser,
    enableUser: usersHook.enableUser,
    deleteUser: usersHook.deleteUser,
    changeUserRole: usersHook.changeUserRole,
    resetPassword: usersHook.resetPassword,
    getUserById: usersHook.getUserById,
    getUsersByRole: usersHook.getUsersByRole,
    getActiveUsers: usersHook.getActiveUsers,
    searchUsers: usersHook.searchUsers,

    // Roles & Permissions
    roles: rolesPermissionsHook.roles,
    customRoles: rolesPermissionsHook.customRoles,
    permissions: rolesPermissionsHook.permissions,
    rolePermissionsMap: rolesPermissionsHook.rolePermissionsMap,
    rolesLoading: rolesPermissionsHook.loading,
    addRole: rolesPermissionsHook.addRole,
    updateRole: rolesPermissionsHook.updateRole,
    removeRole: rolesPermissionsHook.removeRole,
    togglePermission: rolesPermissionsHook.togglePermission,
    setPermissions: rolesPermissionsHook.setPermissions,
    checkAccess: rolesPermissionsHook.checkAccess,
    getRoleById: rolesPermissionsHook.getRoleById,
    getPermissionsForRole: rolesPermissionsHook.getPermissionsForRole,
    getAvailablePermissions: rolesPermissionsHook.getAvailablePermissions,
    getPermissionsByCategory: rolesPermissionsHook.getPermissionsByCategory,

    // Integrations
    integrations: integrationsHook.integrations,
    integrationsLoading: integrationsHook.loading,
    connectIntegration: integrationsHook.connectIntegration,
    disconnectIntegration: integrationsHook.disconnectIntegration,
    toggleIntegration: integrationsHook.toggleIntegration,
    updateIntegrationConfig: integrationsHook.updateIntegrationConfig,
    syncIntegration: integrationsHook.syncIntegration,
    getIntegrationById: integrationsHook.getIntegrationById,
    getIntegrationsByCategory: integrationsHook.getIntegrationsByCategory,
    getConnectedIntegrations: integrationsHook.getConnectedIntegrations,
    getAvailableIntegrations: integrationsHook.getAvailableIntegrations,
    getIntegrationStats: integrationsHook.getIntegrationStats,
    isIntegrationConnected: integrationsHook.isIntegrationConnected,

    // Notifications
    notificationSettings: notificationsHook.settings,
    notificationsLoading: notificationsHook.loading,
    updateEmailSetting: notificationsHook.updateEmailSetting,
    updateSMSSetting: notificationsHook.updateSMSSetting,
    updateStaffSetting: notificationsHook.updateStaffSetting,
    updateRevenueSetting: notificationsHook.updateRevenueSetting,
    updateNotificationSetting: notificationsHook.updateSetting,
    enableAllEmail: notificationsHook.enableAllEmail,
    disableAllEmail: notificationsHook.disableAllEmail,
    enableAllSMS: notificationsHook.enableAllSMS,
    disableAllSMS: notificationsHook.disableAllSMS,
    enableAllStaff: notificationsHook.enableAllStaff,
    disableAllStaff: notificationsHook.disableAllStaff,
    enableAllRevenue: notificationsHook.enableAllRevenue,
    disableAllRevenue: notificationsHook.disableAllRevenue,
    resetNotificationsToDefaults: notificationsHook.resetToDefaults,
    getEnabledNotificationsCount: notificationsHook.getEnabledCount,
    isNotificationEnabled: notificationsHook.isEnabled,

    // AI Config
    aiConfig: aiConfigHook.config,
    aiConfigLoading: aiConfigHook.loading,
    replyStyleOptions: aiConfigHook.replyStyleOptions,
    setVoiceEnabled: aiConfigHook.setVoiceEnabled,
    setAutoSuggestionsEnabled: aiConfigHook.setAutoSuggestionsEnabled,
    setExecuteActions: aiConfigHook.setExecuteActions,
    setReplyStyle: aiConfigHook.setReplyStyle,
    setModuleAccess: aiConfigHook.setModuleAccess,
    setAIPermission: aiConfigHook.setPermission,
    enableAllAIModules: aiConfigHook.enableAllModules,
    disableAllAIModules: aiConfigHook.disableAllModules,
    enableAllAIPermissions: aiConfigHook.enableAllPermissions,
    disableAllAIPermissions: aiConfigHook.disableAllPermissions,
    resetAIConfigToDefaults: aiConfigHook.resetToDefaults,
    getEnabledModulesCount: aiConfigHook.getEnabledModulesCount,
    getEnabledPermissionsCount: aiConfigHook.getEnabledPermissionsCount,
    isModuleEnabled: aiConfigHook.isModuleEnabled,
    hasAIPermission: aiConfigHook.hasPermission,
    getReplyStyleDetails: aiConfigHook.getReplyStyleDetails,
    updateAIConfig: aiConfigHook.updateConfig,
    getAICapabilitiesSummary: aiConfigHook.getCapabilitiesSummary,

    // General Settings
    generalSettings: settingsHook.generalSettings,
    billingSettings: settingsHook.billingSettings,
    settingsLoading: settingsHook.loading,
    updateGeneralSettings: settingsHook.updateGeneralSettings,
    setHotelName: settingsHook.setHotelName,
    updateContactInfo: settingsHook.updateContactInfo,
    updateAddress: settingsHook.updateAddress,
    updateBranding: settingsHook.updateBranding,
    updateSocialMedia: settingsHook.updateSocialMedia,
    updatePaymentSettings: settingsHook.updatePaymentSettings,
    updatePrintSettings: settingsHook.updatePrintSettings,
    setCurrency: settingsHook.setCurrency,
    setTimezone: settingsHook.setTimezone,
    changePlan: settingsHook.changePlan,
    updatePaymentMethod: settingsHook.updatePaymentMethod,
    resetGeneralSettings: settingsHook.resetGeneralSettings,
    exportSettings: settingsHook.exportSettings,
    importSettings: settingsHook.importSettings
  };

  return (
    <SettingsContext.Provider value={value}>
      <PrintPageStyle />
      {children}
    </SettingsContext.Provider>
  );
}

/**
 * useSettingsContext Hook
 * Access settings context from any component
 */
export function useSettingsContext() {
  const context = useContext(SettingsContext);

  if (!context) {
    throw new Error('useSettingsContext must be used within a SettingsProvider');
  }

  return context;
}

export default SettingsContext;
