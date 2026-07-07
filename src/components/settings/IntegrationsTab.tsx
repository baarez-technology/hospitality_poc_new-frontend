import { useState, useEffect } from 'react';
import { Globe, CreditCard, Mail, MessageSquare, Link2, Lock, Check, Eye, EyeOff } from 'lucide-react';
import { INTEGRATION_PROVIDERS, defaultSettings, deepMerge } from '../../utils/settings';
import { Button } from '../ui2/Button';
import { SelectDropdown } from '../ui2/Input';
import { Badge } from '../ui2/Badge';

const STORAGE_KEY = 'glimmora_integrations';

export default function IntegrationsTab() {
  const [integrations, setIntegrations] = useState(defaultSettings.integrations);
  const [saved, setSaved] = useState(false);
  const [showSecrets, setShowSecrets] = useState({});

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setIntegrations(deepMerge(defaultSettings.integrations, parsed));
      } catch (e) {
        console.error('Error parsing integrations from localStorage:', e);
      }
    }
  }, []);

  const saveIntegrations = (newIntegrations) => {
    setIntegrations(newIntegrations);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newIntegrations));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const updateSection = (section, updates) => {
    saveIntegrations({
      ...integrations,
      [section]: { ...integrations[section], ...updates }
    });
  };

  const updateOTA = (ota, updates) => {
    saveIntegrations({
      ...integrations,
      otaSync: {
        ...integrations.otaSync,
        [ota]: { ...integrations.otaSync[ota], ...updates }
      }
    });
  };

  const updateWebhook = (key, value) => {
    saveIntegrations({
      ...integrations,
      webhooks: { ...integrations.webhooks, [key]: value }
    });
  };

  const toggleSecret = (key) => {
    setShowSecrets((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const inputClass = "w-full px-4 py-2.5 text-sm bg-white border border-neutral-200 rounded-xl text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-terra-500/30 focus:border-terra-400 transition-colors";
  const labelClass = "block text-[12px] font-semibold text-neutral-600 mb-1.5";

  // Toggle Switch Component
  const ToggleSwitch = ({ checked, onChange }) => (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
        checked ? 'bg-terra-500' : 'bg-neutral-200'
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
          checked ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  );

  return (
    <div className="max-w-4xl space-y-6 sm:space-y-8">
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-base sm:text-lg font-semibold text-neutral-900">
            Integrations
          </h1>
          <p className="text-[12px] sm:text-sm text-neutral-500 mt-1">
            Connect external services and manage API configurations
          </p>
        </div>
        {saved && (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-sage-50 text-sage-600 rounded-lg self-start">
            <Check className="w-3.5 h-3.5" />
            <span className="text-xs font-medium">Saved</span>
          </div>
        )}
      </header>

      {/* Channel Manager */}
      <section className="bg-neutral-50/50 rounded-[10px] overflow-hidden">
        <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-neutral-100">
          <div className="flex items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 sm:gap-3">
              <Globe className="w-4 h-4 sm:w-5 sm:h-5 text-neutral-400 flex-shrink-0" />
              <div>
                <h2 className="text-[13px] sm:text-sm font-medium text-neutral-900">Channel Manager</h2>
                <p className="text-[10px] sm:text-xs text-neutral-500 mt-0.5">Manage room availability across OTAs</p>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
              <Badge
                variant={integrations.channelManager.enabled ? 'success' : 'neutral'}
                size="xs"
                dot={integrations.channelManager.enabled}
                className="hidden sm:inline-flex"
              >
                {integrations.channelManager.enabled ? 'Connected' : 'Disconnected'}
              </Badge>
              <ToggleSwitch
                checked={integrations.channelManager.enabled}
                onChange={(checked) => updateSection('channelManager', { enabled: checked })}
              />
            </div>
          </div>
        </div>
        <div className="p-4 sm:p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className={labelClass}>Provider</label>
              <SelectDropdown
                value={integrations.channelManager.provider}
                onChange={(value) => updateSection('channelManager', { provider: value })}
                options={INTEGRATION_PROVIDERS.channelManager.map((p) => ({ value: p, label: p }))}
              />
            </div>
            <div>
              <label className={labelClass}>API Key</label>
              <div className="relative">
                <input
                  type={showSecrets.cmApi ? 'text' : 'password'}
                  value={integrations.channelManager.apiKey}
                  onChange={(e) => updateSection('channelManager', { apiKey: e.target.value })}
                  className={`${inputClass} pr-9`}
                  placeholder="Enter API key"
                />
                <button
                  type="button"
                  onClick={() => toggleSecret('cmApi')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 transition-colors"
                >
                  {showSecrets.cmApi ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div>
              <label className={labelClass}>Sync Interval (minutes)</label>
              <input
                type="number"
                value={integrations.channelManager.syncInterval}
                onChange={(e) => updateSection('channelManager', { syncInterval: parseInt(e.target.value) })}
                min="5"
                max="60"
                className={inputClass}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Payment Gateway */}
      <section className="bg-neutral-50/50 rounded-[10px] overflow-hidden">
        <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-neutral-100">
          <div className="flex items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 sm:gap-3">
              <CreditCard className="w-4 h-4 sm:w-5 sm:h-5 text-neutral-400 flex-shrink-0" />
              <div>
                <h2 className="text-[13px] sm:text-sm font-medium text-neutral-900">Payment Gateway</h2>
                <p className="text-[10px] sm:text-xs text-neutral-500 mt-0.5">Process payments securely</p>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
              <Badge
                variant={integrations.paymentGateway.enabled ? 'success' : 'neutral'}
                size="xs"
                dot={integrations.paymentGateway.enabled}
                className="hidden sm:inline-flex"
              >
                {integrations.paymentGateway.enabled ? 'Connected' : 'Disconnected'}
              </Badge>
              <ToggleSwitch
                checked={integrations.paymentGateway.enabled}
                onChange={(checked) => updateSection('paymentGateway', { enabled: checked })}
              />
            </div>
          </div>
        </div>
        <div className="p-4 sm:p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className={labelClass}>Provider</label>
              <SelectDropdown
                value={integrations.paymentGateway.provider}
                onChange={(value) => updateSection('paymentGateway', { provider: value })}
                options={INTEGRATION_PROVIDERS.paymentGateway.map((p) => ({ value: p, label: p }))}
              />
            </div>
            <div>
              <label className={labelClass}>API Key</label>
              <div className="relative">
                <input
                  type={showSecrets.pgApi ? 'text' : 'password'}
                  value={integrations.paymentGateway.apiKey}
                  onChange={(e) => updateSection('paymentGateway', { apiKey: e.target.value })}
                  className={`${inputClass} pr-9`}
                  placeholder="Enter API key"
                />
                <button
                  type="button"
                  onClick={() => toggleSecret('pgApi')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 transition-colors"
                >
                  {showSecrets.pgApi ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div>
              <label className={labelClass}>Secret Key</label>
              <div className="relative">
                <input
                  type={showSecrets.pgSecret ? 'text' : 'password'}
                  value={integrations.paymentGateway.secretKey}
                  onChange={(e) => updateSection('paymentGateway', { secretKey: e.target.value })}
                  className={`${inputClass} pr-9`}
                  placeholder="Enter secret key"
                />
                <button
                  type="button"
                  onClick={() => toggleSecret('pgSecret')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 transition-colors"
                >
                  {showSecrets.pgSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div className="flex items-center gap-2 pt-5">
              <input
                type="checkbox"
                id="testMode"
                checked={integrations.paymentGateway.testMode}
                onChange={(e) => updateSection('paymentGateway', { testMode: e.target.checked })}
                className="w-4 h-4 rounded border-neutral-300 text-terra-500 focus:ring-terra-500"
              />
              <label htmlFor="testMode" className="text-sm text-neutral-600">Test/Sandbox Mode</label>
            </div>
          </div>
        </div>
      </section>

      {/* Email Provider */}
      <section className="bg-neutral-50/50 rounded-[10px] overflow-hidden">
        <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-neutral-100">
          <div className="flex items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 sm:gap-3">
              <Mail className="w-4 h-4 sm:w-5 sm:h-5 text-neutral-400 flex-shrink-0" />
              <div>
                <h2 className="text-[13px] sm:text-sm font-medium text-neutral-900">Email Provider</h2>
                <p className="text-[10px] sm:text-xs text-neutral-500 mt-0.5">Transactional email delivery</p>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
              <Badge
                variant={integrations.emailProvider.enabled ? 'success' : 'neutral'}
                size="xs"
                dot={integrations.emailProvider.enabled}
                className="hidden sm:inline-flex"
              >
                {integrations.emailProvider.enabled ? 'Connected' : 'Disconnected'}
              </Badge>
              <ToggleSwitch
                checked={integrations.emailProvider.enabled}
                onChange={(checked) => updateSection('emailProvider', { enabled: checked })}
              />
            </div>
          </div>
        </div>
        <div className="p-4 sm:p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className={labelClass}>Provider</label>
              <SelectDropdown
                value={integrations.emailProvider.provider}
                onChange={(value) => updateSection('emailProvider', { provider: value })}
                options={INTEGRATION_PROVIDERS.emailProvider.map((p) => ({ value: p, label: p }))}
              />
            </div>
            <div>
              <label className={labelClass}>API Key</label>
              <div className="relative">
                <input
                  type={showSecrets.emailApi ? 'text' : 'password'}
                  value={integrations.emailProvider.apiKey}
                  onChange={(e) => updateSection('emailProvider', { apiKey: e.target.value })}
                  className={`${inputClass} pr-9`}
                  placeholder="Enter API key"
                />
                <button
                  type="button"
                  onClick={() => toggleSecret('emailApi')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 transition-colors"
                >
                  {showSecrets.emailApi ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div>
              <label className={labelClass}>From Email</label>
              <input
                type="email"
                value={integrations.emailProvider.fromEmail}
                onChange={(e) => updateSection('emailProvider', { fromEmail: e.target.value })}
                className={inputClass}
                placeholder="noreply@hotel.com"
              />
            </div>
            <div>
              <label className={labelClass}>From Name</label>
              <input
                type="text"
                value={integrations.emailProvider.fromName}
                onChange={(e) => updateSection('emailProvider', { fromName: e.target.value })}
                className={inputClass}
                placeholder="Glimmora Hotel"
              />
            </div>
          </div>
        </div>
      </section>

      {/* SMS Provider */}
      <section className="bg-neutral-50/50 rounded-[10px] overflow-hidden">
        <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-neutral-100">
          <div className="flex items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 sm:gap-3">
              <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5 text-neutral-400 flex-shrink-0" />
              <div>
                <h2 className="text-[13px] sm:text-sm font-medium text-neutral-900">SMS Provider</h2>
                <p className="text-[10px] sm:text-xs text-neutral-500 mt-0.5">SMS notifications and alerts</p>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
              <Badge
                variant={integrations.smsProvider.enabled ? 'success' : 'neutral'}
                size="xs"
                dot={integrations.smsProvider.enabled}
                className="hidden sm:inline-flex"
              >
                {integrations.smsProvider.enabled ? 'Connected' : 'Disconnected'}
              </Badge>
              <ToggleSwitch
                checked={integrations.smsProvider.enabled}
                onChange={(checked) => updateSection('smsProvider', { enabled: checked })}
              />
            </div>
          </div>
        </div>
        <div className="p-4 sm:p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className={labelClass}>Provider</label>
              <SelectDropdown
                value={integrations.smsProvider.provider}
                onChange={(value) => updateSection('smsProvider', { provider: value })}
                options={INTEGRATION_PROVIDERS.smsProvider.map((p) => ({ value: p, label: p }))}
              />
            </div>
            <div>
              <label className={labelClass}>Account SID</label>
              <div className="relative">
                <input
                  type={showSecrets.smsSid ? 'text' : 'password'}
                  value={integrations.smsProvider.accountSid}
                  onChange={(e) => updateSection('smsProvider', { accountSid: e.target.value })}
                  className={`${inputClass} pr-9`}
                  placeholder="Enter account SID"
                />
                <button
                  type="button"
                  onClick={() => toggleSecret('smsSid')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 transition-colors"
                >
                  {showSecrets.smsSid ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div>
              <label className={labelClass}>Auth Token</label>
              <div className="relative">
                <input
                  type={showSecrets.smsToken ? 'text' : 'password'}
                  value={integrations.smsProvider.authToken}
                  onChange={(e) => updateSection('smsProvider', { authToken: e.target.value })}
                  className={`${inputClass} pr-9`}
                  placeholder="Enter auth token"
                />
                <button
                  type="button"
                  onClick={() => toggleSecret('smsToken')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 transition-colors"
                >
                  {showSecrets.smsToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div>
              <label className={labelClass}>From Number</label>
              <input
                type="text"
                value={integrations.smsProvider.fromNumber}
                onChange={(e) => updateSection('smsProvider', { fromNumber: e.target.value })}
                className={inputClass}
                placeholder="+91XXXXXXXXXX"
              />
            </div>
          </div>
        </div>
      </section>

      {/* OTA Sync */}
      <section className="bg-neutral-50/50 rounded-[10px] overflow-hidden">
        <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-neutral-100">
          <h2 className="text-[13px] sm:text-sm font-medium text-neutral-900">OTA Sync Settings</h2>
          <p className="text-[10px] sm:text-xs text-neutral-500 mt-0.5">Configure sync intervals per platform</p>
        </div>
        <div className="p-4 sm:p-6">
          <div className="space-y-2 sm:space-y-3">
            {Object.entries(integrations.otaSync).map(([ota, config]) => (
              <div key={ota} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4 p-3 sm:p-4 rounded-lg border border-neutral-100 hover:border-neutral-200 transition-colors">
                <div className="flex items-center gap-2 sm:gap-3">
                  <input
                    type="checkbox"
                    checked={config.enabled}
                    onChange={(e) => updateOTA(ota, { enabled: e.target.checked })}
                    className="w-4 h-4 rounded border-neutral-300 text-terra-500 focus:ring-terra-500"
                  />
                  <div className="flex items-center flex-wrap gap-2">
                    <span className="text-[12px] sm:text-sm font-medium text-neutral-900">
                      {ota === 'bookingCom' ? 'Booking.com' : ota === 'mmt' ? 'MakeMyTrip' : ota.charAt(0).toUpperCase() + ota.slice(1)}
                    </span>
                    <Badge
                      variant={config.enabled ? 'success' : 'neutral'}
                      size="xs"
                      dot={config.enabled}
                    >
                      {config.enabled ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-6 sm:ml-0">
                  <span className="text-[10px] sm:text-xs text-neutral-500">Sync every</span>
                  <input
                    type="number"
                    value={config.syncInterval}
                    onChange={(e) => updateOTA(ota, { syncInterval: parseInt(e.target.value) })}
                    min="5"
                    max="120"
                    className="w-14 sm:w-16 px-2 py-2 rounded-xl border border-neutral-200 bg-white text-[12px] sm:text-sm text-center focus:outline-none focus:ring-2 focus:ring-terra-500/30 focus:border-terra-400 transition-colors"
                  />
                  <span className="text-[10px] sm:text-xs text-neutral-500">min</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Webhooks */}
      <section className="bg-neutral-50/50 rounded-[10px] overflow-hidden">
        <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-neutral-100">
          <div className="flex items-center gap-2 sm:gap-3">
            <Link2 className="w-4 h-4 sm:w-5 sm:h-5 text-neutral-400 flex-shrink-0" />
            <div>
              <h2 className="text-[13px] sm:text-sm font-medium text-neutral-900">Webhook URLs</h2>
              <p className="text-[10px] sm:text-xs text-neutral-500 mt-0.5">Receive real-time event notifications</p>
            </div>
          </div>
        </div>
        <div className="p-4 sm:p-6 space-y-3 sm:space-y-4">
          {Object.entries(integrations.webhooks).map(([key, url]) => (
            <div key={key}>
              <label className={`${labelClass} capitalize`}>
                {key.replace(/([A-Z])/g, ' $1').trim()}
              </label>
              <input
                type="url"
                value={url}
                onChange={(e) => updateWebhook(key, e.target.value)}
                className={inputClass}
                placeholder="https://your-server.com/webhook"
              />
            </div>
          ))}
        </div>
      </section>

      {/* Security */}
      <section className="bg-neutral-50/50 rounded-[10px] overflow-hidden">
        <div className="px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 sm:gap-3">
              <Lock className="w-4 h-4 sm:w-5 sm:h-5 text-neutral-400 flex-shrink-0" />
              <div>
                <h2 className="text-[13px] sm:text-sm font-medium text-neutral-900">Encryption</h2>
                <p className="text-[10px] sm:text-xs text-neutral-500 mt-0.5">Encrypt sensitive data in transit</p>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
              <Badge
                variant={integrations.encryption ? 'success' : 'neutral'}
                size="xs"
                dot={integrations.encryption}
                className="hidden sm:inline-flex"
              >
                {integrations.encryption ? 'Enabled' : 'Disabled'}
              </Badge>
              <ToggleSwitch
                checked={integrations.encryption}
                onChange={(checked) => saveIntegrations({ ...integrations, encryption: checked })}
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
