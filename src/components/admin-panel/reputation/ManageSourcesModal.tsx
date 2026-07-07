import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Settings, RefreshCw, Key, Clock, Check, Save } from 'lucide-react';
import { PLATFORMS } from '@/utils/admin/reputation';
import { Button } from '../../ui2/Button';

export default function ManageSourcesModal({ isOpen, onClose, sourcesConfig, onSave }) {
  const [config, setConfig] = useState([]);

  useEffect(() => {
    if (sourcesConfig) {
      setConfig([...sourcesConfig]);
    }
  }, [sourcesConfig]);

  const handleToggle = (platformId) => {
    setConfig(prev => prev.map(source =>
      source.platform === platformId
        ? { ...source, enabled: !source.enabled }
        : source
    ));
  };

  const handleApiKeyChange = (platformId, value) => {
    setConfig(prev => prev.map(source =>
      source.platform === platformId
        ? { ...source, apiKey: value }
        : source
    ));
  };

  const handleFrequencyChange = (platformId, value) => {
    setConfig(prev => prev.map(source =>
      source.platform === platformId
        ? { ...source, importFrequency: value }
        : source
    ));
  };

  const handleSave = () => {
    onSave(config);
    onClose();
  };

  const getPlatformConfig = (platformId) => {
    return PLATFORMS.find(p => p.id === platformId) || { name: platformId, color: '#6B7280', icon: '?' };
  };

  const formatLastSync = (dateStr) => {
    if (!dateStr) return 'Never';
    try {
      const date = new Date(dateStr);
      return date.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Unknown';
    }
  };

  if (!isOpen) return null;

  const modalContent = (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[calc(100vh-2rem)] sm:max-h-[90vh] overflow-hidden animate-scale-in flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-neutral-200 bg-[#FAF8F6] flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#A57865]/10 flex items-center justify-center">
              <Settings className="w-5 h-5 text-[#A57865]" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-neutral-900">Manage Review Sources</h2>
              <p className="text-sm text-neutral-500">Configure OTA platform connections</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-neutral-200 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-neutral-500" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto flex-1 p-4 space-y-4">
          {config.map((source) => {
            const platform = getPlatformConfig(source.platform);
            return (
              <div
                key={source.platform}
                className={`rounded-xl border p-4 transition-colors ${
                  source.enabled
                    ? 'bg-white border-[#A57865]/30'
                    : 'bg-neutral-50 border-neutral-200'
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold text-lg"
                      style={{ backgroundColor: source.enabled ? platform.color : '#9CA3AF' }}
                    >
                      {platform.icon}
                    </div>
                    <div>
                      <p className="font-semibold text-neutral-900">{platform.name}</p>
                      <div className="flex items-center gap-2 text-xs text-neutral-500 mt-0.5">
                        <Clock className="w-3 h-3" />
                        Last sync: {formatLastSync(source.lastSync)}
                      </div>
                    </div>
                  </div>

                  {/* Enable Toggle */}
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={source.enabled}
                      onChange={() => handleToggle(source.platform)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#A57865]/20 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#A57865]"></div>
                    <span className="ms-2 text-sm font-medium text-neutral-700">
                      {source.enabled ? 'Enabled' : 'Disabled'}
                    </span>
                  </label>
                </div>

                {source.enabled && (
                  <div className="space-y-3 pt-3 border-t border-neutral-100">
                    {/* API Key */}
                    <div>
                      <label className="flex items-center gap-2 text-sm font-medium text-neutral-700 mb-1">
                        <Key className="w-4 h-4" />
                        API Key
                      </label>
                      <input
                        type="password"
                        value={source.apiKey}
                        onChange={(e) => handleApiKeyChange(source.platform, e.target.value)}
                        placeholder="Enter API key..."
                        className="w-full px-3 py-2.5 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#A57865]/20 focus:border-[#A57865]"
                      />
                    </div>

                    {/* Import Frequency */}
                    <div>
                      <label className="flex items-center gap-2 text-sm font-medium text-neutral-700 mb-1">
                        <RefreshCw className="w-4 h-4" />
                        Import Frequency
                      </label>
                      <select
                        value={source.importFrequency}
                        onChange={(e) => handleFrequencyChange(source.platform, e.target.value)}
                        className="w-full px-3 py-2.5 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#A57865]/20 focus:border-[#A57865] bg-white"
                      >
                        <option value="realtime">Real-time</option>
                        <option value="hourly">Hourly</option>
                        <option value="daily">Daily</option>
                        <option value="weekly">Weekly</option>
                      </select>
                    </div>

                    {/* Test Connection Button */}
                    <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-[#5C9BA4] hover:bg-[#5C9BA4]/10 rounded-lg transition-colors">
                      <Check className="w-4 h-4" />
                      Test Connection
                    </button>
                  </div>
                )}
              </div>
            );
          })}

          {/* Additional Connections */}
          <div className="bg-[#FAF8F6] rounded-xl p-4 border border-dashed border-neutral-300">
            <h3 className="font-semibold text-neutral-900 mb-2">Connect Additional Sources</h3>
            <p className="text-sm text-neutral-600 mb-4">
              Link your Google Business Profile or TripAdvisor account to automatically import reviews.
            </p>
            <div className="flex flex-wrap gap-2">
              <button className="flex items-center gap-2 px-4 py-2 bg-white border border-neutral-200 rounded-lg text-sm font-medium text-neutral-700 hover:bg-neutral-50 transition-colors">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="#4285F4">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                Connect Google
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-white border border-neutral-200 rounded-lg text-sm font-medium text-neutral-700 hover:bg-neutral-50 transition-colors">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="#00AF87">
                  <circle cx="12" cy="12" r="10" />
                  <text x="12" y="16" textAnchor="middle" fill="white" fontSize="10" fontWeight="bold">T</text>
                </svg>
                Connect TripAdvisor
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-4 border-t border-neutral-200 bg-neutral-50 flex-shrink-0">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSave} icon={Save}>
            Save Changes
          </Button>
        </div>
      </div>

      <style>{`
        @keyframes scale-in {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-scale-in {
          animation: scale-in 0.2s ease-out;
        }
      `}</style>
    </div>
  );

  return createPortal(modalContent, document.body);
}
