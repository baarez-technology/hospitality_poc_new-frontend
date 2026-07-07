import React from 'react';
import { useSettingsContext } from '../../../contexts/SettingsContext';
import { useToast } from '../../../contexts/ToastContext';
import FormSection from '../../../components/settings/FormSection';
import ToggleSwitch from '../../../components/settings/ToggleSwitch';
import { Save, Sparkles } from 'lucide-react';

/**
 * AI Assistant Settings Page
 * Configure Glimmora AI behavior and permissions
 */
export default function AIAssistantSettings() {
  const {
    aiConfig,
    setVoiceEnabled,
    setAutoSuggestionsEnabled,
    setExecuteActions,
    setReplyStyle,
    setModuleAccess,
    setAIPermission
  } = useSettingsContext();

  const { success } = useToast();

  const settings = aiConfig;

  const handleSave = () => {
    success('AI Assistant settings saved successfully');
  };

  const updateModule = (key, value) => {
    setModuleAccess(key, value);
  };

  const updatePermission = (key, value) => {
    setAIPermission(key, value);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-neutral-800">
            AI Assistant Settings
          </h2>
          <p className="text-sm text-neutral-600 mt-1">
            Configure Glimmora AI behavior and capabilities
          </p>
        </div>
        <button
          onClick={handleSave}
          className="px-4 py-2 bg-gradient-to-br from-primary-500 to-primary-600 text-white rounded-lg hover:shadow transition-all flex items-center gap-2 text-sm font-medium"
        >
          <Save className="w-4 h-4" />
          Save Changes
        </button>
      </div>

      {/* General AI Settings */}
      <FormSection
        title="General Settings"
        description="Basic AI assistant configuration"
      >
        <div className="space-y-1">
          <ToggleSwitch
            label="Enable Voice Input"
            description="Allow voice commands and dictation"
            enabled={settings.voiceEnabled}
            onChange={(value) => setVoiceEnabled(value)}
          />
          <ToggleSwitch
            label="Auto-Suggestions"
            description="Show contextual suggestions automatically"
            enabled={settings.autoSuggestionsEnabled}
            onChange={(value) => setAutoSuggestionsEnabled(value)}
          />
          <ToggleSwitch
            label="Allow AI to Execute Actions"
            description="Permit AI to perform operations (e.g., clean room, assign staff)"
            enabled={settings.executeActions}
            onChange={(value) => setExecuteActions(value)}
          />
        </div>

        <div className="mt-6">
          <label className="block text-sm font-medium text-neutral-700 mb-2">
            Reply Style
          </label>
          <select
            value={settings.replyStyle}
            onChange={(e) => setReplyStyle(e.target.value)}
            className="w-full px-4 py-3 bg-[#FAF8F6] border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A57865] focus:border-transparent"
          >
            <option value="professional">Professional - Formal and detailed</option>
            <option value="friendly">Friendly - Casual and approachable</option>
            <option value="short">Short - Brief and concise</option>
            <option value="detailed">Detailed - Comprehensive explanations</option>
          </select>
        </div>
      </FormSection>

      {/* Module Access */}
      <FormSection
        title="Module Access"
        description="Control which modules AI can access and query"
      >
        <div className="space-y-1">
          <ToggleSwitch
            label="Housekeeping"
            description="Allow AI to access housekeeping data and operations"
            enabled={settings.modules.housekeeping}
            onChange={(value) => updateModule('housekeeping', value)}
          />
          <ToggleSwitch
            label="CRM & Guests"
            description="Allow AI to access guest profiles and CRM data"
            enabled={settings.modules.crm}
            onChange={(value) => updateModule('crm', value)}
          />
          <ToggleSwitch
            label="Revenue & Analytics"
            description="Allow AI to access revenue reports and analytics"
            enabled={settings.modules.revenue}
            onChange={(value) => updateModule('revenue', value)}
          />
          <ToggleSwitch
            label="Reputation & Reviews"
            description="Allow AI to access reviews and reputation data"
            enabled={settings.modules.reputation}
            onChange={(value) => updateModule('reputation', value)}
          />
          <ToggleSwitch
            label="Bookings"
            description="Allow AI to access booking information"
            enabled={settings.modules.bookings}
            onChange={(value) => updateModule('bookings', value)}
          />
        </div>
      </FormSection>

      {/* AI Permissions */}
      <FormSection
        title="AI Permissions"
        description="Fine-grained control over AI capabilities"
      >
        <div className="space-y-1">
          <ToggleSwitch
            label="View Data"
            description="AI can read and display data from modules"
            enabled={settings.permissions.viewData}
            onChange={(value) => updatePermission('viewData', value)}
          />
          <ToggleSwitch
            label="Execute Commands"
            description="AI can perform actions (clean rooms, assign staff, etc.)"
            enabled={settings.permissions.executeCommands}
            onChange={(value) => updatePermission('executeCommands', value)}
          />
          <ToggleSwitch
            label="Modify Settings"
            description="AI can change system settings (not recommended)"
            enabled={settings.permissions.modifySettings}
            onChange={(value) => updatePermission('modifySettings', value)}
          />
        </div>
      </FormSection>

      {/* Info Box */}
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 flex items-start gap-3">
        <Sparkles className="w-5 h-5 text-purple-700 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm text-purple-800 font-medium mb-1">
            About Glimmora AI
          </p>
          <p className="text-sm text-purple-700">
            Glimmora AI uses natural language processing to understand your commands and perform hotel management tasks. All data processing happens locally on your device for privacy and security.
          </p>
        </div>
      </div>
    </div>
  );
}
