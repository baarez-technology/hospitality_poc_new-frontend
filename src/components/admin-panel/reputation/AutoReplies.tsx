import { useState } from 'react';
import { Bot, Save, RefreshCw, Clock, Globe, Edit3, Check, X, MessageSquare } from 'lucide-react';

const DELAY_OPTIONS = [
  { value: '1h', label: '1 Hour' },
  { value: '3h', label: '3 Hours' },
  { value: '6h', label: '6 Hours' },
  { value: '12h', label: '12 Hours' },
  { value: '24h', label: '24 Hours' }
];

const LANGUAGE_OPTIONS = [
  { value: 'en', label: 'English' },
  { value: 'hi', label: 'Hindi' },
  { value: 'ta', label: 'Tamil' },
  { value: 'te', label: 'Telugu' },
  { value: 'kn', label: 'Kannada' }
];

const TEMPLATE_TYPES = [
  {
    id: 'positive',
    label: 'Positive Reviews',
    description: 'For sentiment > 70',
    color: '#4E5840',
    icon: '+'
  },
  {
    id: 'neutral',
    label: 'Neutral Reviews',
    description: 'For sentiment 40-70',
    color: '#C8B29D',
    icon: '~'
  },
  {
    id: 'negative',
    label: 'Negative Reviews',
    description: 'For sentiment < 40',
    color: '#CDB261',
    icon: '-'
  }
];

export default function AutoReplies({ settings, onSettingsChange }) {
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [tempTemplate, setTempTemplate] = useState('');
  const [saved, setSaved] = useState(false);

  const handleToggleAutoReply = () => {
    onSettingsChange({
      ...settings,
      autoReply: {
        ...settings.autoReply,
        enabled: !settings.autoReply.enabled
      }
    });
  };

  const handleDelayChange = (delay) => {
    onSettingsChange({
      ...settings,
      autoReply: {
        ...settings.autoReply,
        delay
      }
    });
  };

  const handleLanguageChange = (language) => {
    onSettingsChange({
      ...settings,
      autoReply: {
        ...settings.autoReply,
        language
      }
    });
  };

  const handleEditTemplate = (type) => {
    setEditingTemplate(type);
    setTempTemplate(settings.autoReply.templates[type]);
  };

  const handleSaveTemplate = () => {
    onSettingsChange({
      ...settings,
      autoReply: {
        ...settings.autoReply,
        templates: {
          ...settings.autoReply.templates,
          [editingTemplate]: tempTemplate
        }
      }
    });
    setEditingTemplate(null);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleCancelEdit = () => {
    setEditingTemplate(null);
    setTempTemplate('');
  };

  return (
    <div className="bg-white rounded-xl border border-[#E5E5E5] p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#A57865]/10 flex items-center justify-center">
            <Bot className="w-5 h-5 text-[#A57865]" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-neutral-900">Auto-Reply Engine</h3>
            <p className="text-sm text-neutral-500">AI-powered response automation</p>
          </div>
        </div>

        {/* Enable Toggle */}
        <label className="flex items-center gap-3 cursor-pointer">
          <span className="text-sm font-medium text-neutral-700">
            {settings.autoReply?.enabled ? 'Enabled' : 'Disabled'}
          </span>
          <div className="relative">
            <input
              type="checkbox"
              checked={settings.autoReply?.enabled || false}
              onChange={handleToggleAutoReply}
              className="sr-only"
            />
            <div className={`w-12 h-6 rounded-full transition-colors ${
              settings.autoReply?.enabled ? 'bg-[#4E5840]' : 'bg-neutral-300'
            }`}>
              <div className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform mt-0.5 ${
                settings.autoReply?.enabled ? 'translate-x-6 ml-0.5' : 'translate-x-0.5'
              }`} />
            </div>
          </div>
        </label>
      </div>

      {/* Settings */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {/* Delay */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-neutral-700 mb-2">
            <Clock className="w-4 h-4" />
            Response Delay
          </label>
          <select
            value={settings.autoReply?.delay || '3h'}
            onChange={(e) => handleDelayChange(e.target.value)}
            disabled={!settings.autoReply?.enabled}
            className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#A57865]/20 focus:border-[#A57865] disabled:bg-neutral-50 disabled:text-neutral-400"
          >
            {DELAY_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        {/* Language */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-neutral-700 mb-2">
            <Globe className="w-4 h-4" />
            Language
          </label>
          <select
            value={settings.autoReply?.language || 'en'}
            onChange={(e) => handleLanguageChange(e.target.value)}
            disabled={!settings.autoReply?.enabled}
            className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#A57865]/20 focus:border-[#A57865] disabled:bg-neutral-50 disabled:text-neutral-400"
          >
            {LANGUAGE_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* AI Rules Info */}
      <div className="bg-[#FAF7F4] rounded-xl p-4 mb-6">
        <h4 className="text-sm font-semibold text-neutral-900 mb-2 flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-[#A57865]" />
          AI Response Rules
        </h4>
        <ul className="space-y-1 text-xs text-neutral-600">
          <li className="flex items-center gap-2">
            <span className="w-5 h-5 rounded bg-[#CDB261]/20 text-[#CDB261] flex items-center justify-center font-bold">-</span>
            Sentiment &lt; 40: Apology tone with service recovery offer
          </li>
          <li className="flex items-center gap-2">
            <span className="w-5 h-5 rounded bg-[#C8B29D]/20 text-[#C8B29D] flex items-center justify-center font-bold">~</span>
            Sentiment 40-70: Neutral service acknowledgment
          </li>
          <li className="flex items-center gap-2">
            <span className="w-5 h-5 rounded bg-[#4E5840]/15 text-[#4E5840] flex items-center justify-center font-bold">+</span>
            Sentiment &gt; 70: Warm appreciation with return invitation
          </li>
        </ul>
      </div>

      {/* Templates */}
      <div>
        <h4 className="text-sm font-semibold text-neutral-900 mb-3">Response Templates</h4>
        <div className="space-y-3">
          {TEMPLATE_TYPES.map((type) => (
            <div
              key={type.id}
              className="border border-neutral-200 rounded-xl overflow-hidden"
            >
              <div
                className="flex items-center justify-between p-3 bg-[#FAF7F4]"
                style={{ borderLeft: `4px solid ${type.color}` }}
              >
                <div className="flex items-center gap-2">
                  <span
                    className="w-6 h-6 rounded flex items-center justify-center text-white text-sm font-bold"
                    style={{ backgroundColor: type.color }}
                  >
                    {type.icon}
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-neutral-900">{type.label}</p>
                    <p className="text-xs text-neutral-500">{type.description}</p>
                  </div>
                </div>
                {editingTemplate !== type.id && (
                  <button
                    onClick={() => handleEditTemplate(type.id)}
                    className="flex items-center gap-1 px-3 py-1.5 border border-neutral-200 bg-white rounded-lg text-xs font-medium text-neutral-700 hover:bg-neutral-50 transition-colors"
                  >
                    <Edit3 className="w-3 h-3" />
                    Edit
                  </button>
                )}
              </div>

              {editingTemplate === type.id ? (
                <div className="p-3 bg-white">
                  <textarea
                    value={tempTemplate}
                    onChange={(e) => setTempTemplate(e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#A57865]/20 focus:border-[#A57865] resize-none"
                    placeholder="Enter template text... Use {guest} for guest name placeholder"
                  />
                  <div className="flex items-center gap-2 mt-2">
                    <button
                      onClick={handleSaveTemplate}
                      className="flex items-center gap-1 px-3 py-1.5 bg-[#4E5840] text-white rounded-lg text-xs font-medium hover:bg-[#4E5840]/90 transition-colors"
                    >
                      <Save className="w-3 h-3" />
                      Save
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      className="flex items-center gap-1 px-3 py-1.5 border border-neutral-200 rounded-lg text-xs font-medium text-neutral-700 hover:bg-neutral-50 transition-colors"
                    >
                      <X className="w-3 h-3" />
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-3 bg-white">
                  <p className="text-sm text-neutral-600 line-clamp-2">
                    {settings.autoReply?.templates?.[type.id] || 'No template set'}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Status Footer */}
      {saved && (
        <div className="mt-4 flex items-center gap-2 px-4 py-2 bg-[#4E5840]/10 text-[#4E5840] rounded-lg">
          <Check className="w-4 h-4" />
          <span className="text-sm font-medium">Template saved successfully!</span>
        </div>
      )}

      {settings.autoReply?.enabled && (
        <div className="mt-4 p-3 bg-[#4E5840]/5 rounded-xl border border-[#4E5840]/20">
          <p className="text-xs text-[#4E5840]">
            <span className="font-semibold">Auto-reply is active.</span> Responses will be automatically posted {settings.autoReply?.delay || '3h'} after new reviews are detected.
          </p>
        </div>
      )}
    </div>
  );
}
