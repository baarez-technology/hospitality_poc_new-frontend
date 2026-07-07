import React from 'react';
import { useSettingsContext } from '../../../contexts/SettingsContext';
import { useToast } from '../../../contexts/ToastContext';
import FormSection from '../../../components/settings/FormSection';
import IntegrationCard from '../../../components/settings/IntegrationCard';

/**
 * Integrations Settings Page
 * OTA integrations, payment gateways, channel managers
 */
export default function IntegrationsSettings() {
  const {
    integrations,
    connectIntegration,
    disconnectIntegration,
    getIntegrationsByCategory
  } = useSettingsContext();

  const { success, warning } = useToast();

  const handleConnect = (integration) => {
    const result = connectIntegration(integration.id);
    if (result.success) {
      success(`Connected to ${integration.name} successfully`);
    } else {
      warning(result.reason || 'Failed to connect integration');
    }
  };

  const handleDisconnect = (integration) => {
    if (confirm(`Are you sure you want to disconnect ${integration.name}?`)) {
      const result = disconnectIntegration(integration.id);
      if (result.success) {
        success(`Disconnected from ${integration.name}`);
      } else {
        warning(result.reason || 'Failed to disconnect integration');
      }
    }
  };

  const handleConfigure = (integration) => {
    success(`Opening ${integration.name} configuration...`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-semibold text-neutral-800">
          Integrations
        </h2>
        <p className="text-sm text-neutral-600 mt-1">
          Connect with OTAs, payment gateways, and third-party services
        </p>
      </div>

      {/* Connected Integrations Summary */}
      <div className="grid grid-cols-4 gap-4">
        <div className="p-4 bg-[#4E5840]/10 border border-[#4E5840]/30 rounded-xl">
          <p className="text-sm text-[#4E5840] font-medium mb-1">Connected</p>
          <p className="text-3xl font-bold text-green-800">
            {integrations.filter(i => i.connected).length}
          </p>
        </div>
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
          <p className="text-sm text-blue-700 font-medium mb-1">Available</p>
          <p className="text-3xl font-bold text-blue-800">
            {integrations.filter(i => !i.connected).length}
          </p>
        </div>
        <div className="p-4 bg-purple-50 border border-purple-200 rounded-xl">
          <p className="text-sm text-purple-700 font-medium mb-1">OTA Channels</p>
          <p className="text-3xl font-bold text-purple-800">
            {getIntegrationsByCategory('OTA').filter(i => i.connected).length}/{getIntegrationsByCategory('OTA').length}
          </p>
        </div>
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
          <p className="text-sm text-amber-700 font-medium mb-1">Total Integrations</p>
          <p className="text-3xl font-bold text-amber-800">
            {integrations.length}
          </p>
        </div>
      </div>

      {/* OTA Integrations */}
      <FormSection
        title="OTA Integrations"
        description="Connect to online travel agencies for distribution"
      >
        <div className="grid grid-cols-2 gap-4">
          {getIntegrationsByCategory('OTA').map(integration => (
            <IntegrationCard
              key={integration.id}
              integration={integration}
              onConnect={handleConnect}
              onDisconnect={handleDisconnect}
              onConfigure={handleConfigure}
            />
          ))}
        </div>
      </FormSection>

      {/* Payment Gateways */}
      <FormSection
        title="Payment Gateways"
        description="Connect payment processors for online payments"
      >
        <div className="grid grid-cols-2 gap-4">
          {getIntegrationsByCategory('Payment').map(integration => (
            <IntegrationCard
              key={integration.id}
              integration={integration}
              onConnect={handleConnect}
              onDisconnect={handleDisconnect}
              onConfigure={handleConfigure}
            />
          ))}
        </div>
      </FormSection>

      {/* Other Integrations */}
      <FormSection
        title="Other Integrations"
        description="Additional services and tools"
      >
        <div className="grid grid-cols-2 gap-4">
          {integrations.filter(i => !['OTA', 'Payment'].includes(i.category)).map(integration => (
            <IntegrationCard
              key={integration.id}
              integration={integration}
              onConnect={handleConnect}
              onDisconnect={handleDisconnect}
              onConfigure={handleConfigure}
            />
          ))}
        </div>
      </FormSection>

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          <strong>Need a custom integration?</strong> Contact our support team to discuss custom integration options for your property management system or preferred services.
        </p>
      </div>
    </div>
  );
}
