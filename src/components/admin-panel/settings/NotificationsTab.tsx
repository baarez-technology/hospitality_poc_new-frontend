import { useState, useEffect } from 'react';
import { Bell, Mail, MessageSquare, Smartphone, Check, CalendarCheck, X as XIcon, Clock, Wrench, Crown, TrendingUp, Star, Sparkles, Users } from 'lucide-react';
import { defaultSettings, deepMerge } from '@/utils/admin/settings';

const STORAGE_KEY = 'glimmora_notifications';

const TRIGGER_CONFIG = [
  { key: 'newBooking', label: 'New Booking', description: 'When a new reservation is made', icon: CalendarCheck, color: '#4E5840' },
  { key: 'cancellation', label: 'Cancellation', description: 'When a booking is cancelled', icon: XIcon, color: '#CDB261' },
  { key: 'hkDelay', label: 'Housekeeping Delay', description: 'Room cleaning is behind schedule', icon: Clock, color: '#5C9BA4' },
  { key: 'maintenanceIssue', label: 'Maintenance Issue', description: 'New maintenance request created', icon: Wrench, color: '#A57865' },
  { key: 'vipArrival', label: 'VIP Arrival', description: 'VIP guest check-in alert', icon: Crown, color: '#CDB261' },
  { key: 'revenueAlert', label: 'Revenue Alert', description: 'Revenue AI insights and alerts', icon: TrendingUp, color: '#4E5840' },
  { key: 'badReview', label: 'Bad Review', description: 'Negative guest feedback received', icon: Star, color: '#A57865' },
  { key: 'autoCreateWorkOrder', label: 'Auto Work Order', description: 'Automatic work order creation', icon: Sparkles, color: '#5C9BA4' },
  { key: 'autoAssignHousekeeping', label: 'Auto Assign HK', description: 'Automatic room assignment', icon: Users, color: '#4E5840' }
];

const CHANNEL_CONFIG = [
  { key: 'email', label: 'Email', icon: Mail, color: '#A57865' },
  { key: 'sms', label: 'SMS', icon: MessageSquare, color: '#4E5840' },
  { key: 'push', label: 'Push', icon: Smartphone, color: '#5C9BA4' }
];

export default function NotificationsTab() {
  const [notifications, setNotifications] = useState(defaultSettings.notifications);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setNotifications(deepMerge(defaultSettings.notifications, parsed));
      } catch (e) {
        console.error('Error parsing notifications from localStorage:', e);
      }
    }
  }, []);

  const saveNotifications = (newNotifications) => {
    setNotifications(newNotifications);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newNotifications));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const toggleTrigger = (triggerKey) => {
    saveNotifications({
      ...notifications,
      triggers: {
        ...notifications.triggers,
        [triggerKey]: {
          ...notifications.triggers[triggerKey],
          enabled: !notifications.triggers[triggerKey].enabled
        }
      }
    });
  };

  const toggleTriggerChannel = (triggerKey, channel) => {
    const currentChannels = notifications.triggers[triggerKey].channels || [];
    const newChannels = currentChannels.includes(channel)
      ? currentChannels.filter((c) => c !== channel)
      : [...currentChannels, channel];

    saveNotifications({
      ...notifications,
      triggers: {
        ...notifications.triggers,
        [triggerKey]: {
          ...notifications.triggers[triggerKey],
          channels: newChannels
        }
      }
    });
  };

  const toggleChannel = (channelKey) => {
    saveNotifications({
      ...notifications,
      channels: {
        ...notifications.channels,
        [channelKey]: {
          ...notifications.channels[channelKey],
          enabled: !notifications.channels[channelKey].enabled
        }
      }
    });
  };

  const enableAllTriggers = () => {
    const newTriggers = { ...notifications.triggers };
    Object.keys(newTriggers).forEach((key) => {
      newTriggers[key] = { ...newTriggers[key], enabled: true };
    });
    saveNotifications({ ...notifications, triggers: newTriggers });
  };

  const disableAllTriggers = () => {
    const newTriggers = { ...notifications.triggers };
    Object.keys(newTriggers).forEach((key) => {
      newTriggers[key] = { ...newTriggers[key], enabled: false };
    });
    saveNotifications({ ...notifications, triggers: newTriggers });
  };

  return (
    <div className="max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Notifications & Automations</h1>
          <p className="text-sm text-neutral-500 mt-1">
            Configure alerts and notification channels
          </p>
        </div>
        {saved && (
          <div className="flex items-center gap-2 px-4 py-2 bg-[#4E5840]/10 text-[#4E5840] rounded-lg">
            <Check className="w-4 h-4" />
            <span className="text-sm font-medium">Saved</span>
          </div>
        )}
      </div>

      {/* Delivery Channels */}
      <section className="bg-white border border-[#E5E5E5] rounded-xl p-6 mb-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-[#A57865]/10 flex items-center justify-center">
            <Bell className="w-5 h-5 text-[#A57865]" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-neutral-900">Delivery Channels</h2>
            <p className="text-sm text-neutral-500">Enable or disable notification methods</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {CHANNEL_CONFIG.map((channel) => {
            const isEnabled = notifications.channels[channel.key]?.enabled;
            const Icon = channel.icon;

            return (
              <div
                key={channel.key}
                className={`p-4 rounded-xl border-2 transition-colors cursor-pointer ${
                  isEnabled
                    ? 'border-[#4E5840] bg-[#4E5840]/5'
                    : 'border-[#E5E5E5] hover:border-neutral-300'
                }`}
                onClick={() => toggleChannel(channel.key)}
              >
                <div className="flex items-center justify-between mb-3">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: `${channel.color}15` }}
                  >
                    <Icon className="w-5 h-5" style={{ color: channel.color }} />
                  </div>
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center ${
                      isEnabled ? 'bg-[#4E5840]' : 'bg-neutral-200'
                    }`}
                  >
                    {isEnabled && <Check className="w-4 h-4 text-white" />}
                  </div>
                </div>
                <h3 className="font-semibold text-neutral-900">{channel.label}</h3>
                <p className="text-sm text-neutral-500">
                  {channel.key === 'email' && 'Send email notifications'}
                  {channel.key === 'sms' && 'Send SMS alerts'}
                  {channel.key === 'push' && 'Browser & mobile push'}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Notification Triggers */}
      <section className="bg-white border border-[#E5E5E5] rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#5C9BA4]/10 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-[#5C9BA4]" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-neutral-900">Notification Triggers</h2>
              <p className="text-sm text-neutral-500">Configure when to send notifications</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={enableAllTriggers}
              className="text-sm text-[#4E5840] hover:underline"
            >
              Enable all
            </button>
            <span className="text-neutral-300">|</span>
            <button
              onClick={disableAllTriggers}
              className="text-sm text-neutral-500 hover:underline"
            >
              Disable all
            </button>
          </div>
        </div>

        <div className="space-y-4">
          {TRIGGER_CONFIG.map((trigger) => {
            const config = notifications.triggers[trigger.key] || { enabled: false, channels: [] };
            const Icon = trigger.icon;

            return (
              <div
                key={trigger.key}
                className={`p-4 rounded-xl border transition-colors ${
                  config.enabled
                    ? 'border-[#E5E5E5] bg-white'
                    : 'border-[#E5E5E5] bg-neutral-50'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: `${trigger.color}15` }}
                    >
                      <Icon className="w-5 h-5" style={{ color: trigger.color }} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-neutral-900">{trigger.label}</h3>
                      <p className="text-sm text-neutral-500">{trigger.description}</p>

                      {/* Channel Selection */}
                      {config.enabled && (
                        <div className="flex items-center gap-2 mt-3">
                          <span className="text-xs text-neutral-400">Channels:</span>
                          {CHANNEL_CONFIG.map((channel) => {
                            const isActive = config.channels?.includes(channel.key);
                            const ChannelIcon = channel.icon;

                            return (
                              <button
                                key={channel.key}
                                onClick={() => toggleTriggerChannel(trigger.key, channel.key)}
                                disabled={!notifications.channels[channel.key]?.enabled}
                                className={`p-1.5 rounded-lg transition-colors ${
                                  isActive
                                    ? 'bg-[#A57865] text-white'
                                    : 'bg-neutral-100 text-neutral-400 hover:bg-neutral-200'
                                } ${
                                  !notifications.channels[channel.key]?.enabled
                                    ? 'opacity-50 cursor-not-allowed'
                                    : ''
                                }`}
                                title={channel.label}
                              >
                                <ChannelIcon className="w-4 h-4" />
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>

                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={config.enabled}
                      onChange={() => toggleTrigger(trigger.key)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#4E5840]"></div>
                  </label>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Summary */}
      <div className="mt-6 p-4 bg-[#FAF7F4] rounded-xl">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-neutral-700">Active Notifications</p>
            <p className="text-xs text-neutral-500">
              {Object.values(notifications.triggers).filter((t) => t.enabled).length} of {TRIGGER_CONFIG.length} triggers enabled
            </p>
          </div>
          <div className="flex items-center gap-4">
            {CHANNEL_CONFIG.map((channel) => {
              const isEnabled = notifications.channels[channel.key]?.enabled;
              const Icon = channel.icon;

              return (
                <div
                  key={channel.key}
                  className={`flex items-center gap-1.5 ${
                    isEnabled ? 'text-[#4E5840]' : 'text-neutral-400'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-xs font-medium">{channel.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
