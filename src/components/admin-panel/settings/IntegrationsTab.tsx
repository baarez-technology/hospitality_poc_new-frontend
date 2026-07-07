import { useState, useEffect } from 'react';
import { Plug, Globe, CreditCard, Mail, MessageSquare, Link2, Lock, Check, Eye, EyeOff } from 'lucide-react';
import { INTEGRATION_PROVIDERS, defaultSettings, deepMerge } from '@/utils/admin/settings';

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
        // Deep merge with defaults to ensure all properties exist
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

  return (
    <div className="max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Integrations</h1>
          <p className="text-sm text-neutral-500 mt-1">
            Connect external services and APIs
          </p>
        </div>
        {saved && (
          <div className="flex items-center gap-2 px-4 py-2 bg-[#4E5840]/10 text-[#4E5840] rounded-lg">
            <Check className="w-4 h-4" />
            <span className="text-sm font-medium">Saved</span>
          </div>
        )}
      </div>

      <div className="space-y-6">
        {/* Channel Manager */}
        <section className="bg-white border border-[#E5E5E5] rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#A57865]/10 flex items-center justify-center">
                <Globe className="w-5 h-5 text-[#A57865]" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-neutral-900">Channel Manager</h2>
                <p className="text-sm text-neutral-500">Manage room availability across OTAs</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={integrations.channelManager.enabled}
                onChange={(e) => updateSection('channelManager', { enabled: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#4E5840]"></div>
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">Provider</label>
              <select
                value={integrations.channelManager.provider}
                onChange={(e) => updateSection('channelManager', { provider: e.target.value })}
                className="w-full px-4 py-3 rounded-lg border border-[#E5E5E5] focus:outline-none focus:ring-2 focus:ring-[#A57865]/20 focus:border-[#A57865] bg-white"
              >
                {INTEGRATION_PROVIDERS.channelManager.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">API Key</label>
              <div className="relative">
                <input
                  type={showSecrets.cmApi ? 'text' : 'password'}
                  value={integrations.channelManager.apiKey}
                  onChange={(e) => updateSection('channelManager', { apiKey: e.target.value })}
                  className="w-full px-4 py-3 pr-10 rounded-lg border border-[#E5E5E5] focus:outline-none focus:ring-2 focus:ring-[#A57865]/20 focus:border-[#A57865]"
                  placeholder="Enter API key"
                />
                <button
                  type="button"
                  onClick={() => toggleSecret('cmApi')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400"
                >
                  {showSecrets.cmApi ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">Sync Interval (minutes)</label>
              <input
                type="number"
                value={integrations.channelManager.syncInterval}
                onChange={(e) => updateSection('channelManager', { syncInterval: parseInt(e.target.value) })}
                min="5"
                max="60"
                className="w-full px-4 py-3 rounded-lg border border-[#E5E5E5] focus:outline-none focus:ring-2 focus:ring-[#A57865]/20 focus:border-[#A57865]"
              />
            </div>
          </div>
        </section>

        {/* Payment Gateway */}
        <section className="bg-white border border-[#E5E5E5] rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#4E5840]/10 flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-[#4E5840]" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-neutral-900">Payment Gateway</h2>
                <p className="text-sm text-neutral-500">Process payments securely</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={integrations.paymentGateway.enabled}
                onChange={(e) => updateSection('paymentGateway', { enabled: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#4E5840]"></div>
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">Provider</label>
              <select
                value={integrations.paymentGateway.provider}
                onChange={(e) => updateSection('paymentGateway', { provider: e.target.value })}
                className="w-full px-4 py-3 rounded-lg border border-[#E5E5E5] focus:outline-none focus:ring-2 focus:ring-[#A57865]/20 focus:border-[#A57865] bg-white"
              >
                {INTEGRATION_PROVIDERS.paymentGateway.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">API Key</label>
              <div className="relative">
                <input
                  type={showSecrets.pgApi ? 'text' : 'password'}
                  value={integrations.paymentGateway.apiKey}
                  onChange={(e) => updateSection('paymentGateway', { apiKey: e.target.value })}
                  className="w-full px-4 py-3 pr-10 rounded-lg border border-[#E5E5E5] focus:outline-none focus:ring-2 focus:ring-[#A57865]/20 focus:border-[#A57865]"
                  placeholder="Enter API key"
                />
                <button
                  type="button"
                  onClick={() => toggleSecret('pgApi')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400"
                >
                  {showSecrets.pgApi ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">Secret Key</label>
              <div className="relative">
                <input
                  type={showSecrets.pgSecret ? 'text' : 'password'}
                  value={integrations.paymentGateway.secretKey}
                  onChange={(e) => updateSection('paymentGateway', { secretKey: e.target.value })}
                  className="w-full px-4 py-3 pr-10 rounded-lg border border-[#E5E5E5] focus:outline-none focus:ring-2 focus:ring-[#A57865]/20 focus:border-[#A57865]"
                  placeholder="Enter secret key"
                />
                <button
                  type="button"
                  onClick={() => toggleSecret('pgSecret')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400"
                >
                  {showSecrets.pgSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div className="flex items-center gap-3 pt-6">
              <input
                type="checkbox"
                id="testMode"
                checked={integrations.paymentGateway.testMode}
                onChange={(e) => updateSection('paymentGateway', { testMode: e.target.checked })}
                className="w-4 h-4 rounded border-neutral-300 text-[#A57865] focus:ring-[#A57865]"
              />
              <label htmlFor="testMode" className="text-sm text-neutral-700">Test/Sandbox Mode</label>
            </div>
          </div>
        </section>

        {/* Email Provider */}
        <section className="bg-white border border-[#E5E5E5] rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#5C9BA4]/10 flex items-center justify-center">
                <Mail className="w-5 h-5 text-[#5C9BA4]" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-neutral-900">Email Provider</h2>
                <p className="text-sm text-neutral-500">Transactional email delivery</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={integrations.emailProvider.enabled}
                onChange={(e) => updateSection('emailProvider', { enabled: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#4E5840]"></div>
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">Provider</label>
              <select
                value={integrations.emailProvider.provider}
                onChange={(e) => updateSection('emailProvider', { provider: e.target.value })}
                className="w-full px-4 py-3 rounded-lg border border-[#E5E5E5] focus:outline-none focus:ring-2 focus:ring-[#A57865]/20 focus:border-[#A57865] bg-white"
              >
                {INTEGRATION_PROVIDERS.emailProvider.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">API Key</label>
              <div className="relative">
                <input
                  type={showSecrets.emailApi ? 'text' : 'password'}
                  value={integrations.emailProvider.apiKey}
                  onChange={(e) => updateSection('emailProvider', { apiKey: e.target.value })}
                  className="w-full px-4 py-3 pr-10 rounded-lg border border-[#E5E5E5] focus:outline-none focus:ring-2 focus:ring-[#A57865]/20 focus:border-[#A57865]"
                  placeholder="Enter API key"
                />
                <button
                  type="button"
                  onClick={() => toggleSecret('emailApi')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400"
                >
                  {showSecrets.emailApi ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">From Email</label>
              <input
                type="email"
                value={integrations.emailProvider.fromEmail}
                onChange={(e) => updateSection('emailProvider', { fromEmail: e.target.value })}
                className="w-full px-4 py-3 rounded-lg border border-[#E5E5E5] focus:outline-none focus:ring-2 focus:ring-[#A57865]/20 focus:border-[#A57865]"
                placeholder="noreply@hotel.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">From Name</label>
              <input
                type="text"
                value={integrations.emailProvider.fromName}
                onChange={(e) => updateSection('emailProvider', { fromName: e.target.value })}
                className="w-full px-4 py-3 rounded-lg border border-[#E5E5E5] focus:outline-none focus:ring-2 focus:ring-[#A57865]/20 focus:border-[#A57865]"
                placeholder="Glimmora Hotel"
              />
            </div>
          </div>
        </section>

        {/* SMS Provider */}
        <section className="bg-white border border-[#E5E5E5] rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#CDB261]/10 flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-[#CDB261]" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-neutral-900">SMS Provider</h2>
                <p className="text-sm text-neutral-500">SMS notifications and alerts</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={integrations.smsProvider.enabled}
                onChange={(e) => updateSection('smsProvider', { enabled: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#4E5840]"></div>
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">Provider</label>
              <select
                value={integrations.smsProvider.provider}
                onChange={(e) => updateSection('smsProvider', { provider: e.target.value })}
                className="w-full px-4 py-3 rounded-lg border border-[#E5E5E5] focus:outline-none focus:ring-2 focus:ring-[#A57865]/20 focus:border-[#A57865] bg-white"
              >
                {INTEGRATION_PROVIDERS.smsProvider.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">Account SID</label>
              <div className="relative">
                <input
                  type={showSecrets.smsSid ? 'text' : 'password'}
                  value={integrations.smsProvider.accountSid}
                  onChange={(e) => updateSection('smsProvider', { accountSid: e.target.value })}
                  className="w-full px-4 py-3 pr-10 rounded-lg border border-[#E5E5E5] focus:outline-none focus:ring-2 focus:ring-[#A57865]/20 focus:border-[#A57865]"
                  placeholder="Enter account SID"
                />
                <button
                  type="button"
                  onClick={() => toggleSecret('smsSid')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400"
                >
                  {showSecrets.smsSid ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">Auth Token</label>
              <div className="relative">
                <input
                  type={showSecrets.smsToken ? 'text' : 'password'}
                  value={integrations.smsProvider.authToken}
                  onChange={(e) => updateSection('smsProvider', { authToken: e.target.value })}
                  className="w-full px-4 py-3 pr-10 rounded-lg border border-[#E5E5E5] focus:outline-none focus:ring-2 focus:ring-[#A57865]/20 focus:border-[#A57865]"
                  placeholder="Enter auth token"
                />
                <button
                  type="button"
                  onClick={() => toggleSecret('smsToken')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400"
                >
                  {showSecrets.smsToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">From Number</label>
              <input
                type="text"
                value={integrations.smsProvider.fromNumber}
                onChange={(e) => updateSection('smsProvider', { fromNumber: e.target.value })}
                className="w-full px-4 py-3 rounded-lg border border-[#E5E5E5] focus:outline-none focus:ring-2 focus:ring-[#A57865]/20 focus:border-[#A57865]"
                placeholder="+91XXXXXXXXXX"
              />
            </div>
          </div>
        </section>

        {/* OTA Sync */}
        <section className="bg-white border border-[#E5E5E5] rounded-xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-[#A57865]/10 flex items-center justify-center">
              <Link2 className="w-5 h-5 text-[#A57865]" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-neutral-900">OTA Sync Settings</h2>
              <p className="text-sm text-neutral-500">Configure sync intervals per platform</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(integrations.otaSync).map(([ota, config]) => (
              <div key={ota} className="flex items-center justify-between p-4 bg-[#FAF7F4] rounded-lg">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={config.enabled}
                    onChange={(e) => updateOTA(ota, { enabled: e.target.checked })}
                    className="w-4 h-4 rounded border-neutral-300 text-[#A57865] focus:ring-[#A57865]"
                  />
                  <span className="font-medium text-neutral-700 capitalize">
                    {ota === 'bookingCom' ? 'Booking.com' : ota === 'mmt' ? 'MakeMyTrip' : ota.charAt(0).toUpperCase() + ota.slice(1)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={config.syncInterval}
                    onChange={(e) => updateOTA(ota, { syncInterval: parseInt(e.target.value) })}
                    min="5"
                    max="120"
                    className="w-16 px-2 py-1 rounded border border-[#E5E5E5] text-sm text-center"
                  />
                  <span className="text-sm text-neutral-500">min</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Webhooks */}
        <section className="bg-white border border-[#E5E5E5] rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#4E5840]/10 flex items-center justify-center">
                <Link2 className="w-5 h-5 text-[#4E5840]" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-neutral-900">Webhook URLs</h2>
                <p className="text-sm text-neutral-500">Receive real-time event notifications</p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {Object.entries(integrations.webhooks).map(([key, url]) => (
              <div key={key}>
                <label className="block text-sm font-medium text-neutral-700 mb-2 capitalize">
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </label>
                <input
                  type="url"
                  value={url}
                  onChange={(e) => updateWebhook(key, e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-[#E5E5E5] focus:outline-none focus:ring-2 focus:ring-[#A57865]/20 focus:border-[#A57865]"
                  placeholder="https://your-server.com/webhook"
                />
              </div>
            ))}
          </div>
        </section>

        {/* Security */}
        <section className="bg-white border border-[#E5E5E5] rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#5C9BA4]/10 flex items-center justify-center">
                <Lock className="w-5 h-5 text-[#5C9BA4]" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-neutral-900">Encryption</h2>
                <p className="text-sm text-neutral-500">Encrypt sensitive data in transit</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={integrations.encryption}
                onChange={(e) => saveIntegrations({ ...integrations, encryption: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#4E5840]"></div>
            </label>
          </div>
        </section>
      </div>
    </div>
  );
}
