/**
 * useAIConfig Hook
 * AI Assistant configuration management with localStorage persistence
 */

import { useState, useEffect, useCallback } from 'react';
import { loadAISettings, saveAISettings } from '../utils/settingsStorage';
import { defaultAISettings, replyStyleOptions } from '../data/aiSettingsDefault';

export function useAIConfig() {
  const [config, setConfig] = useState(defaultAISettings);
  const [loading, setLoading] = useState(true);

  // Load AI settings from localStorage on mount
  useEffect(() => {
    const storedSettings = loadAISettings();
    if (storedSettings && Object.keys(storedSettings).length > 0) {
      setConfig({
        ...defaultAISettings,
        ...storedSettings,
        // Merge nested objects
        modules: { ...defaultAISettings.modules, ...storedSettings.modules },
        permissions: { ...defaultAISettings.permissions, ...storedSettings.permissions }
      });
    } else {
      // Initialize with defaults
      setConfig(defaultAISettings);
      saveAISettings(defaultAISettings);
    }
    setLoading(false);
  }, []);

  // Save settings to localStorage whenever they change
  useEffect(() => {
    if (!loading) {
      saveAISettings(config);
    }
  }, [config, loading]);

  /**
   * Update voice enabled setting
   * @param {boolean} enabled - Enable/disable voice
   */
  const setVoiceEnabled = useCallback((enabled) => {
    setConfig(prev => ({
      ...prev,
      voiceEnabled: enabled
    }));
  }, []);

  /**
   * Update auto-suggestions setting
   * @param {boolean} enabled - Enable/disable auto-suggestions
   */
  const setAutoSuggestionsEnabled = useCallback((enabled) => {
    setConfig(prev => ({
      ...prev,
      autoSuggestionsEnabled: enabled
    }));
  }, []);

  /**
   * Update execute actions setting
   * @param {boolean} enabled - Allow AI to execute actions
   */
  const setExecuteActions = useCallback((enabled) => {
    setConfig(prev => ({
      ...prev,
      executeActions: enabled
    }));
  }, []);

  /**
   * Update reply style
   * @param {string} style - Reply style ('professional', 'friendly', 'short', 'detailed')
   */
  const setReplyStyle = useCallback((style) => {
    if (!replyStyleOptions.find(opt => opt.value === style)) {
      console.error(`Invalid reply style: ${style}`);
      return;
    }

    setConfig(prev => ({
      ...prev,
      replyStyle: style
    }));
  }, []);

  /**
   * Update module access
   * @param {string} module - Module name
   * @param {boolean} enabled - Enable/disable access
   */
  const setModuleAccess = useCallback((module, enabled) => {
    setConfig(prev => ({
      ...prev,
      modules: {
        ...prev.modules,
        [module]: enabled
      }
    }));
  }, []);

  /**
   * Update AI permission
   * @param {string} permission - Permission name
   * @param {boolean} enabled - Enable/disable permission
   */
  const setPermission = useCallback((permission, enabled) => {
    setConfig(prev => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [permission]: enabled
      }
    }));
  }, []);

  /**
   * Enable all modules
   */
  const enableAllModules = useCallback(() => {
    setConfig(prev => ({
      ...prev,
      modules: {
        housekeeping: true,
        crm: true,
        revenue: true,
        reputation: true,
        bookings: true
      }
    }));
  }, []);

  /**
   * Disable all modules
   */
  const disableAllModules = useCallback(() => {
    setConfig(prev => ({
      ...prev,
      modules: {
        housekeeping: false,
        crm: false,
        revenue: false,
        reputation: false,
        bookings: false
      }
    }));
  }, []);

  /**
   * Enable all permissions
   */
  const enableAllPermissions = useCallback(() => {
    setConfig(prev => ({
      ...prev,
      permissions: {
        viewData: true,
        executeCommands: true,
        modifySettings: true
      }
    }));
  }, []);

  /**
   * Disable all permissions
   */
  const disableAllPermissions = useCallback(() => {
    setConfig(prev => ({
      ...prev,
      permissions: {
        viewData: false,
        executeCommands: false,
        modifySettings: false
      }
    }));
  }, []);

  /**
   * Reset to default settings
   */
  const resetToDefaults = useCallback(() => {
    setConfig(defaultAISettings);
    saveAISettings(defaultAISettings);
  }, []);

  /**
   * Get enabled modules count
   */
  const getEnabledModulesCount = useCallback(() => {
    return Object.values(config.modules).filter(Boolean).length;
  }, [config.modules]);

  /**
   * Get enabled permissions count
   */
  const getEnabledPermissionsCount = useCallback(() => {
    return Object.values(config.permissions).filter(Boolean).length;
  }, [config.permissions]);

  /**
   * Check if module is enabled
   * @param {string} module - Module name
   * @returns {boolean}
   */
  const isModuleEnabled = useCallback((module) => {
    return config.modules[module] === true;
  }, [config.modules]);

  /**
   * Check if permission is enabled
   * @param {string} permission - Permission name
   * @returns {boolean}
   */
  const hasPermission = useCallback((permission) => {
    return config.permissions[permission] === true;
  }, [config.permissions]);

  /**
   * Get reply style details
   * @returns {object|null}
   */
  const getReplyStyleDetails = useCallback(() => {
    return replyStyleOptions.find(opt => opt.value === config.replyStyle) || null;
  }, [config.replyStyle]);

  /**
   * Update multiple settings at once
   * @param {object} updates - Settings to update
   */
  const updateConfig = useCallback((updates) => {
    setConfig(prev => ({
      ...prev,
      ...updates,
      // Merge nested objects if provided
      modules: updates.modules ? { ...prev.modules, ...updates.modules } : prev.modules,
      permissions: updates.permissions ? { ...prev.permissions, ...updates.permissions } : prev.permissions
    }));
  }, []);

  /**
   * Get AI capabilities summary
   * @returns {object}
   */
  const getCapabilitiesSummary = useCallback(() => {
    const enabledModules = Object.entries(config.modules)
      .filter(([_, enabled]) => enabled)
      .map(([module, _]) => module);

    const enabledPermissions = Object.entries(config.permissions)
      .filter(([_, enabled]) => enabled)
      .map(([permission, _]) => permission);

    return {
      voiceEnabled: config.voiceEnabled,
      autoSuggestionsEnabled: config.autoSuggestionsEnabled,
      executeActions: config.executeActions,
      replyStyle: config.replyStyle,
      enabledModules,
      enabledPermissions,
      modulesCount: enabledModules.length,
      permissionsCount: enabledPermissions.length
    };
  }, [config]);

  return {
    config,
    loading,
    replyStyleOptions,
    setVoiceEnabled,
    setAutoSuggestionsEnabled,
    setExecuteActions,
    setReplyStyle,
    setModuleAccess,
    setPermission,
    enableAllModules,
    disableAllModules,
    enableAllPermissions,
    disableAllPermissions,
    resetToDefaults,
    getEnabledModulesCount,
    getEnabledPermissionsCount,
    isModuleEnabled,
    hasPermission,
    getReplyStyleDetails,
    updateConfig,
    getCapabilitiesSummary
  };
}
