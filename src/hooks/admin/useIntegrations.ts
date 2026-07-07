/**
 * useIntegrations Hook
 * Integration management (connect/disconnect OTAs, payment gateways, etc.)
 */

import { useState, useEffect, useCallback } from 'react';
import { loadIntegrations, saveIntegrations } from '@/utils/admin/settingsStorage';
import { defaultIntegrations } from '@/data/integrationsData';

export function useIntegrations() {
  const [integrations, setIntegrations] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load integrations from localStorage on mount
  useEffect(() => {
    const storedIntegrations = loadIntegrations();
    if (storedIntegrations && storedIntegrations.length > 0) {
      setIntegrations(storedIntegrations);
    } else {
      // Initialize with default integrations
      setIntegrations(defaultIntegrations);
      saveIntegrations(defaultIntegrations);
    }
    setLoading(false);
  }, []);

  // Save integrations to localStorage whenever they change
  useEffect(() => {
    if (!loading) {
      saveIntegrations(integrations);
    }
  }, [integrations, loading]);

  /**
   * Connect an integration
   * @param {string} integrationId - Integration ID
   * @param {object} config - Optional configuration data
   * @returns {object} - { success: boolean, integration: object|null }
   */
  const connectIntegration = useCallback((integrationId, config = {}) => {
    const integration = integrations.find(i => i.id === integrationId);

    if (!integration) {
      return {
        success: false,
        integration: null,
        reason: 'Integration not found'
      };
    }

    if (integration.connected) {
      return {
        success: false,
        integration: null,
        reason: 'Integration already connected'
      };
    }

    // Update integration status
    const updatedIntegration = {
      ...integration,
      connected: true,
      status: 'active',
      connectedAt: new Date().toISOString(),
      lastSync: new Date().toISOString(),
      config: config
    };

    setIntegrations(prev =>
      prev.map(i => i.id === integrationId ? updatedIntegration : i)
    );

    return {
      success: true,
      integration: updatedIntegration
    };
  }, [integrations]);

  /**
   * Disconnect an integration
   * @param {string} integrationId - Integration ID
   * @returns {object} - { success: boolean }
   */
  const disconnectIntegration = useCallback((integrationId) => {
    const integration = integrations.find(i => i.id === integrationId);

    if (!integration) {
      return {
        success: false,
        reason: 'Integration not found'
      };
    }

    if (!integration.connected) {
      return {
        success: false,
        reason: 'Integration is not connected'
      };
    }

    // Update integration status
    setIntegrations(prev =>
      prev.map(i =>
        i.id === integrationId
          ? {
              ...i,
              connected: false,
              status: 'available',
              disconnectedAt: new Date().toISOString(),
              lastSync: null,
              config: null
            }
          : i
      )
    );

    return { success: true };
  }, [integrations]);

  /**
   * Toggle integration connection
   * @param {string} integrationId - Integration ID
   * @param {object} config - Optional configuration data
   * @returns {object} - { success: boolean }
   */
  const toggleIntegration = useCallback((integrationId, config = {}) => {
    const integration = integrations.find(i => i.id === integrationId);

    if (!integration) {
      return {
        success: false,
        reason: 'Integration not found'
      };
    }

    if (integration.connected) {
      return disconnectIntegration(integrationId);
    } else {
      return connectIntegration(integrationId, config);
    }
  }, [integrations, connectIntegration, disconnectIntegration]);

  /**
   * Update integration configuration
   * @param {string} integrationId - Integration ID
   * @param {object} config - New configuration data
   * @returns {object} - { success: boolean }
   */
  const updateIntegrationConfig = useCallback((integrationId, config) => {
    const integration = integrations.find(i => i.id === integrationId);

    if (!integration) {
      return {
        success: false,
        reason: 'Integration not found'
      };
    }

    setIntegrations(prev =>
      prev.map(i =>
        i.id === integrationId
          ? {
              ...i,
              config: { ...i.config, ...config },
              updatedAt: new Date().toISOString()
            }
          : i
      )
    );

    return { success: true };
  }, [integrations]);

  /**
   * Sync an integration (simulate data sync)
   * @param {string} integrationId - Integration ID
   * @returns {object} - { success: boolean }
   */
  const syncIntegration = useCallback((integrationId) => {
    const integration = integrations.find(i => i.id === integrationId);

    if (!integration) {
      return {
        success: false,
        reason: 'Integration not found'
      };
    }

    if (!integration.connected) {
      return {
        success: false,
        reason: 'Integration is not connected'
      };
    }

    // Update last sync time
    setIntegrations(prev =>
      prev.map(i =>
        i.id === integrationId
          ? {
              ...i,
              lastSync: new Date().toISOString(),
              status: 'active'
            }
          : i
      )
    );

    return {
      success: true,
      message: 'Integration synced successfully'
    };
  }, [integrations]);

  /**
   * Get integration by ID
   * @param {string} integrationId - Integration ID
   * @returns {object|null}
   */
  const getIntegrationById = useCallback((integrationId) => {
    return integrations.find(i => i.id === integrationId) || null;
  }, [integrations]);

  /**
   * Get integrations by category
   * @param {string} category - Category name (e.g., 'OTA', 'Payment')
   * @returns {object[]}
   */
  const getIntegrationsByCategory = useCallback((category) => {
    return integrations.filter(i => i.category === category);
  }, [integrations]);

  /**
   * Get connected integrations
   * @returns {object[]}
   */
  const getConnectedIntegrations = useCallback(() => {
    return integrations.filter(i => i.connected);
  }, [integrations]);

  /**
   * Get available (not connected) integrations
   * @returns {object[]}
   */
  const getAvailableIntegrations = useCallback(() => {
    return integrations.filter(i => !i.connected);
  }, [integrations]);

  /**
   * Get integration statistics
   * @returns {object}
   */
  const getIntegrationStats = useCallback(() => {
    const total = integrations.length;
    const connected = integrations.filter(i => i.connected).length;
    const available = total - connected;

    const byCategory = integrations.reduce((acc, integration) => {
      const category = integration.category;
      if (!acc[category]) {
        acc[category] = { total: 0, connected: 0 };
      }
      acc[category].total++;
      if (integration.connected) {
        acc[category].connected++;
      }
      return acc;
    }, {});

    return {
      total,
      connected,
      available,
      byCategory
    };
  }, [integrations]);

  /**
   * Check if integration is connected
   * @param {string} integrationId - Integration ID
   * @returns {boolean}
   */
  const isIntegrationConnected = useCallback((integrationId) => {
    const integration = integrations.find(i => i.id === integrationId);
    return integration ? integration.connected : false;
  }, [integrations]);

  return {
    integrations,
    loading,
    connectIntegration,
    disconnectIntegration,
    toggleIntegration,
    updateIntegrationConfig,
    syncIntegration,
    getIntegrationById,
    getIntegrationsByCategory,
    getConnectedIntegrations,
    getAvailableIntegrations,
    getIntegrationStats,
    isIntegrationConnected
  };
}
