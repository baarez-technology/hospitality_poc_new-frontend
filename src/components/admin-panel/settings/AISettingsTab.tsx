import { useState, useEffect, useCallback } from 'react';
import { Brain, TrendingUp, MessageSquare, Users, Mic, Check, Sparkles, Loader2, AlertCircle } from 'lucide-react';
import { defaultSettings, deepMerge } from '@/utils/admin/settings';
import { revenueIntelligenceService } from '@/api/services/revenue-intelligence.service';
import { reputationService } from '@/api/services/reputation.service';

const STORAGE_KEY = 'glimmora_ai_settings';

export default function AISettingsTab() {
  const [ai, setAI] = useState(defaultSettings.ai);
  const [saved, setSaved] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setAI(deepMerge(defaultSettings.ai, parsed));
      } catch (e) {
        console.error('Error parsing AI settings from localStorage:', e);
      }
    }
  }, []);

  // Sync settings with backend services
  const syncWithBackend = useCallback(async (newAI: typeof ai, changedSection?: string) => {
    setSyncing(true);
    setSyncError(null);

    try {
      // Sync Revenue AI settings
      if (!changedSection || changedSection === 'revenueAI') {
        await revenueIntelligenceService.updateAutoPricingSettings({
          enabled: true,
          minRateThreshold: newAI.revenueAI.minRateChange,
          maxRateThreshold: newAI.revenueAI.maxRateChange,
          demandBasedPricing: true,
          competitorTracking: newAI.revenueAI.competitorTracking,
          seasonalAdjustments: true,
          lastUpdated: new Date().toISOString()
        });

        await revenueIntelligenceService.toggleCompetitorScan(newAI.revenueAI.competitorTracking);
      }

      // Sync Reputation AI settings
      if (!changedSection || changedSection === 'reputationAI') {
        await reputationService.updateAutomationConfig({
          global_enabled: newAI.reputationAI.autoResponse,
          auto_respond_positive: newAI.reputationAI.autoResponse,
          auto_respond_threshold: newAI.reputationAI.sentimentThreshold,
          require_approval: !newAI.reputationAI.autoResponse,
          response_delay_hours: newAI.reputationAI.autoResponseDelay,
          templates: { positive: '', neutral: '', negative: '' },
          sentiment_threshold_positive: 100 - newAI.reputationAI.sentimentThreshold,
          sentiment_threshold_negative: newAI.reputationAI.escalateThreshold
        });
      }

      console.log('AI settings synced with backend successfully');
    } catch (error) {
      console.error('Error syncing AI settings with backend:', error);
      setSyncError('Settings saved locally. Backend sync failed - will retry on next save.');
    } finally {
      setSyncing(false);
    }
  }, []);

  const saveAI = useCallback((newAI: typeof ai, changedSection?: string) => {
    setAI(newAI);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newAI));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);

    // Sync with backend
    syncWithBackend(newAI, changedSection);
  }, [syncWithBackend]);

  const updateSection = (section: string, updates: Record<string, unknown>) => {
    const newAI = {
      ...ai,
      [section]: { ...ai[section as keyof typeof ai], ...updates }
    };
    saveAI(newAI, section);
  };

  return (
    <div className="max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">AI Settings</h1>
          <p className="text-sm text-neutral-500 mt-1">
            Configure AI modules and intelligence features
          </p>
        </div>
        <div className="flex items-center gap-3">
          {syncing && (
            <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm font-medium">Syncing...</span>
            </div>
          )}
          {saved && !syncing && (
            <div className="flex items-center gap-2 px-4 py-2 bg-[#4E5840]/10 text-[#4E5840] rounded-lg">
              <Check className="w-4 h-4" />
              <span className="text-sm font-medium">Saved</span>
            </div>
          )}
        </div>
      </div>

      {/* Sync Error Banner */}
      {syncError && (
        <div className="flex items-start gap-3 p-4 mb-6 bg-amber-50 border border-amber-200 rounded-lg">
          <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-amber-800">Sync Warning</p>
            <p className="text-xs text-amber-600 mt-0.5">{syncError}</p>
          </div>
          <button
            onClick={() => setSyncError(null)}
            className="ml-auto text-amber-500 hover:text-amber-700"
          >
            &times;
          </button>
        </div>
      )}

      <div className="space-y-6">
        {/* Revenue AI */}
        <section className="bg-white border border-[#E5E5E5] rounded-xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-[#4E5840]/10 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-[#4E5840]" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-neutral-900">Revenue AI</h2>
              <p className="text-sm text-neutral-500">Pricing optimization and forecasting</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Forecast Interval
              </label>
              <select
                value={ai.revenueAI.forecastInterval}
                onChange={(e) => updateSection('revenueAI', { forecastInterval: e.target.value })}
                className="w-full px-4 py-3 rounded-lg border border-[#E5E5E5] focus:outline-none focus:ring-2 focus:ring-[#A57865]/20 focus:border-[#A57865] bg-white"
              >
                <option value="hourly">Hourly</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Aggressiveness Level
              </label>
              <select
                value={ai.revenueAI.aggressivenessLevel}
                onChange={(e) => updateSection('revenueAI', { aggressivenessLevel: e.target.value })}
                className="w-full px-4 py-3 rounded-lg border border-[#E5E5E5] focus:outline-none focus:ring-2 focus:ring-[#A57865]/20 focus:border-[#A57865] bg-white"
              >
                <option value="conservative">Conservative</option>
                <option value="moderate">Moderate</option>
                <option value="aggressive">Aggressive</option>
              </select>
              <p className="text-xs text-neutral-400 mt-1">How bold should rate recommendations be</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Rate Update Policy
              </label>
              <select
                value={ai.revenueAI.rateUpdatePolicy}
                onChange={(e) => updateSection('revenueAI', { rateUpdatePolicy: e.target.value })}
                className="w-full px-4 py-3 rounded-lg border border-[#E5E5E5] focus:outline-none focus:ring-2 focus:ring-[#A57865]/20 focus:border-[#A57865] bg-white"
              >
                <option value="manual">Manual Approval</option>
                <option value="auto">Auto-Apply</option>
                <option value="scheduled">Scheduled</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Min Rate Change (%)
              </label>
              <input
                type="number"
                value={ai.revenueAI.minRateChange}
                onChange={(e) => updateSection('revenueAI', { minRateChange: parseInt(e.target.value) })}
                min="1"
                max="20"
                className="w-full px-4 py-3 rounded-lg border border-[#E5E5E5] focus:outline-none focus:ring-2 focus:ring-[#A57865]/20 focus:border-[#A57865]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Max Rate Change (%)
              </label>
              <input
                type="number"
                value={ai.revenueAI.maxRateChange}
                onChange={(e) => updateSection('revenueAI', { maxRateChange: parseInt(e.target.value) })}
                min="10"
                max="100"
                className="w-full px-4 py-3 rounded-lg border border-[#E5E5E5] focus:outline-none focus:ring-2 focus:ring-[#A57865]/20 focus:border-[#A57865]"
              />
            </div>

            <div className="flex items-center pt-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={ai.revenueAI.competitorTracking}
                  onChange={(e) => updateSection('revenueAI', { competitorTracking: e.target.checked })}
                  className="w-4 h-4 rounded border-neutral-300 text-[#A57865] focus:ring-[#A57865]"
                />
                <span className="text-sm text-neutral-700">Enable competitor rate tracking</span>
              </label>
            </div>
          </div>
        </section>

        {/* Reputation AI */}
        <section className="bg-white border border-[#E5E5E5] rounded-xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-[#CDB261]/10 flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-[#CDB261]" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-neutral-900">Reputation AI</h2>
              <p className="text-sm text-neutral-500">Review analysis and response automation</p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex items-center justify-between p-4 bg-[#FAF7F4] rounded-lg">
              <div>
                <p className="font-medium text-neutral-900">Auto-Response</p>
                <p className="text-sm text-neutral-500">Automatically generate review responses</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={ai.reputationAI.autoResponse}
                  onChange={(e) => updateSection('reputationAI', { autoResponse: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#4E5840]"></div>
              </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Auto-Response Delay (hours)
                </label>
                <input
                  type="number"
                  value={ai.reputationAI.autoResponseDelay}
                  onChange={(e) => updateSection('reputationAI', { autoResponseDelay: parseInt(e.target.value) })}
                  min="1"
                  max="72"
                  className="w-full px-4 py-3 rounded-lg border border-[#E5E5E5] focus:outline-none focus:ring-2 focus:ring-[#A57865]/20 focus:border-[#A57865]"
                />
                <p className="text-xs text-neutral-400 mt-1">Wait before auto-responding</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Sentiment Threshold (%)
                </label>
                <input
                  type="number"
                  value={ai.reputationAI.sentimentThreshold}
                  onChange={(e) => updateSection('reputationAI', { sentimentThreshold: parseInt(e.target.value) })}
                  min="10"
                  max="70"
                  className="w-full px-4 py-3 rounded-lg border border-[#E5E5E5] focus:outline-none focus:ring-2 focus:ring-[#A57865]/20 focus:border-[#A57865]"
                />
                <p className="text-xs text-neutral-400 mt-1">Below this = negative review</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Escalate Threshold (%)
                </label>
                <input
                  type="number"
                  value={ai.reputationAI.escalateThreshold}
                  onChange={(e) => updateSection('reputationAI', { escalateThreshold: parseInt(e.target.value) })}
                  min="5"
                  max="40"
                  className="w-full px-4 py-3 rounded-lg border border-[#E5E5E5] focus:outline-none focus:ring-2 focus:ring-[#A57865]/20 focus:border-[#A57865]"
                />
                <p className="text-xs text-neutral-400 mt-1">Alert manager below this</p>
              </div>

              <div className="flex items-center gap-4 pt-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={ai.reputationAI.alertOnNegative}
                    onChange={(e) => updateSection('reputationAI', { alertOnNegative: e.target.checked })}
                    className="w-4 h-4 rounded border-neutral-300 text-[#A57865] focus:ring-[#A57865]"
                  />
                  <span className="text-sm text-neutral-700">Alert on negative reviews</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={ai.reputationAI.responseTemplates}
                    onChange={(e) => updateSection('reputationAI', { responseTemplates: e.target.checked })}
                    className="w-4 h-4 rounded border-neutral-300 text-[#A57865] focus:ring-[#A57865]"
                  />
                  <span className="text-sm text-neutral-700">Use templates</span>
                </label>
              </div>
            </div>
          </div>
        </section>

        {/* CRM AI */}
        <section className="bg-white border border-[#E5E5E5] rounded-xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-[#5C9BA4]/10 flex items-center justify-center">
              <Users className="w-5 h-5 text-[#5C9BA4]" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-neutral-900">CRM AI</h2>
              <p className="text-sm text-neutral-500">Guest intelligence and segmentation</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Churn Threshold (%)
              </label>
              <input
                type="number"
                value={ai.crmAI.churnThreshold}
                onChange={(e) => updateSection('crmAI', { churnThreshold: parseInt(e.target.value) })}
                min="10"
                max="60"
                className="w-full px-4 py-3 rounded-lg border border-[#E5E5E5] focus:outline-none focus:ring-2 focus:ring-[#A57865]/20 focus:border-[#A57865]"
              />
              <p className="text-xs text-neutral-400 mt-1">Above this = at-risk guest</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Upgrade Likelihood Cutoff (%)
              </label>
              <input
                type="number"
                value={ai.crmAI.upgradeLikelihoodCutoff}
                onChange={(e) => updateSection('crmAI', { upgradeLikelihoodCutoff: parseInt(e.target.value) })}
                min="50"
                max="95"
                className="w-full px-4 py-3 rounded-lg border border-[#E5E5E5] focus:outline-none focus:ring-2 focus:ring-[#A57865]/20 focus:border-[#A57865]"
              />
              <p className="text-xs text-neutral-400 mt-1">Show upgrade suggestions above this</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Return Probability Window (days)
              </label>
              <input
                type="number"
                value={ai.crmAI.returnProbabilityWindow}
                onChange={(e) => updateSection('crmAI', { returnProbabilityWindow: parseInt(e.target.value) })}
                min="30"
                max="730"
                className="w-full px-4 py-3 rounded-lg border border-[#E5E5E5] focus:outline-none focus:ring-2 focus:ring-[#A57865]/20 focus:border-[#A57865]"
              />
              <p className="text-xs text-neutral-400 mt-1">Calculate return probability within</p>
            </div>

            <div className="flex flex-col gap-3 pt-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={ai.crmAI.segmentationEnabled}
                  onChange={(e) => updateSection('crmAI', { segmentationEnabled: e.target.checked })}
                  className="w-4 h-4 rounded border-neutral-300 text-[#A57865] focus:ring-[#A57865]"
                />
                <span className="text-sm text-neutral-700">Enable AI segmentation</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={ai.crmAI.autoTagging}
                  onChange={(e) => updateSection('crmAI', { autoTagging: e.target.checked })}
                  className="w-4 h-4 rounded border-neutral-300 text-[#A57865] focus:ring-[#A57865]"
                />
                <span className="text-sm text-neutral-700">Auto-tag guests</span>
              </label>
            </div>
          </div>
        </section>

        {/* Baarez AI Assistant */}
        <section className="bg-white border border-[#E5E5E5] rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#A57865]/10 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-[#A57865]" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-neutral-900">Baarez AI Assistant</h2>
                <p className="text-sm text-neutral-500">Voice and command settings</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={ai.baarezAssistant.enabled}
                onChange={(e) => updateSection('baarezAssistant', { enabled: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#4E5840]"></div>
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-center justify-between p-4 bg-[#FAF7F4] rounded-lg">
              <div className="flex items-center gap-3">
                <Mic className="w-5 h-5 text-neutral-500" />
                <div>
                  <p className="font-medium text-neutral-900">Wake Word</p>
                  <p className="text-xs text-neutral-500">"Hey Baarez" activation</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={ai.baarezAssistant.wakeWord}
                  onChange={(e) => updateSection('baarezAssistant', { wakeWord: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#4E5840]"></div>
              </label>
            </div>

            <div className="flex items-center justify-between p-4 bg-[#FAF7F4] rounded-lg">
              <div className="flex items-center gap-3">
                <Mic className="w-5 h-5 text-neutral-500" />
                <div>
                  <p className="font-medium text-neutral-900">Mic Auto-Start</p>
                  <p className="text-xs text-neutral-500">Listen on page load</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={ai.baarezAssistant.micAutoStart}
                  onChange={(e) => updateSection('baarezAssistant', { micAutoStart: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#4E5840]"></div>
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Command Sensitivity
              </label>
              <select
                value={ai.baarezAssistant.commandSensitivity}
                onChange={(e) => updateSection('baarezAssistant', { commandSensitivity: e.target.value })}
                className="w-full px-4 py-3 rounded-lg border border-[#E5E5E5] focus:outline-none focus:ring-2 focus:ring-[#A57865]/20 focus:border-[#A57865] bg-white"
              >
                <option value="low">Low (strict matching)</option>
                <option value="medium">Medium (balanced)</option>
                <option value="high">High (fuzzy matching)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Language
              </label>
              <select
                value={ai.baarezAssistant.language}
                onChange={(e) => updateSection('baarezAssistant', { language: e.target.value })}
                className="w-full px-4 py-3 rounded-lg border border-[#E5E5E5] focus:outline-none focus:ring-2 focus:ring-[#A57865]/20 focus:border-[#A57865] bg-white"
              >
                <option value="en-IN">English (India)</option>
                <option value="en-US">English (US)</option>
                <option value="en-GB">English (UK)</option>
                <option value="hi-IN">Hindi</option>
              </select>
            </div>

            <div className="md:col-span-2 flex items-center">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={ai.baarezAssistant.voiceResponse}
                  onChange={(e) => updateSection('baarezAssistant', { voiceResponse: e.target.checked })}
                  className="w-4 h-4 rounded border-neutral-300 text-[#A57865] focus:ring-[#A57865]"
                />
                <span className="text-sm text-neutral-700">Enable voice responses (text-to-speech)</span>
              </label>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
