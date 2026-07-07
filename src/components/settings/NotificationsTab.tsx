import { useState, useEffect } from 'react';
import { Mail, MessageSquare, Smartphone, Check } from 'lucide-react';
import { defaultSettings, deepMerge } from '../../utils/settings';
import { Button } from '../ui2/Button';

const STORAGE_KEY = 'glimmora_notifications';

const TRIGGER_CONFIG = [
  { key: 'newBooking', label: 'New Booking', description: 'When a new reservation is made', category: 'bookings' },
  { key: 'cancellation', label: 'Cancellation', description: 'When a booking is cancelled', category: 'bookings' },
  { key: 'vipArrival', label: 'VIP Arrival', description: 'VIP guest check-in alert', category: 'bookings' },
  { key: 'hkDelay', label: 'Housekeeping Delay', description: 'Room cleaning is behind schedule', category: 'operations' },
  { key: 'maintenanceIssue', label: 'Maintenance Issue', description: 'New maintenance request created', category: 'operations' },
  { key: 'autoCreateWorkOrder', label: 'Auto Work Order', description: 'Automatic work order creation', category: 'operations' },
  { key: 'autoAssignHousekeeping', label: 'Auto Assign HK', description: 'Automatic room assignment', category: 'operations' },
  { key: 'revenueAlert', label: 'Revenue Alert', description: 'Revenue AI insights and alerts', category: 'analytics' },
  { key: 'badReview', label: 'Bad Review', description: 'Negative guest feedback received', category: 'analytics' }
];

const CHANNEL_CONFIG = [
  { key: 'email', label: 'Email Notifications', description: 'Receive notifications via email', icon: Mail },
  { key: 'push', label: 'Push Notifications', description: 'Browser and mobile push alerts', icon: Smartphone },
  { key: 'sms', label: 'SMS Notifications', description: 'Text message alerts for urgent items', icon: MessageSquare }
];

const CATEGORIES = [
  { key: 'bookings', label: 'Booking Alerts' },
  { key: 'operations', label: 'Operations' },
  { key: 'analytics', label: 'Analytics & Reviews' }
];

interface ToggleProps {
  enabled: boolean;
  onChange: () => void;
}

function Toggle({ enabled, onChange }: ToggleProps) {
  return (
    <button
      type="button"
      onClick={onChange}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
        enabled ? 'bg-terra-500' : 'bg-neutral-200'
      }`}
    >
      <span
        className={`h-5 w-5 rounded-full bg-white transition-transform ${
          enabled ? 'translate-x-5' : 'translate-x-0.5'
        }`}
      />
    </button>
  );
}

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

  const saveNotifications = (newNotifications: typeof notifications) => {
    setNotifications(newNotifications);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newNotifications));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const toggleTrigger = (triggerKey: string) => {
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

  const toggleTriggerChannel = (triggerKey: string, channel: string) => {
    // Ensure channels is always an array
    const triggerData = notifications.triggers[triggerKey] || { enabled: false, channels: [] };
    const currentChannels = Array.isArray(triggerData.channels) ? triggerData.channels : [];
    const newChannels = currentChannels.includes(channel)
      ? currentChannels.filter((c: string) => c !== channel)
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

  const toggleChannel = (channelKey: string) => {
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

  const getTriggersByCategory = (category: string) => {
    return TRIGGER_CONFIG.filter(trigger => trigger.category === category);
  };

  return (
    <div className="max-w-3xl space-y-6 sm:space-y-8">
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-base sm:text-lg font-semibold text-neutral-900">Notifications</h1>
          <p className="text-[12px] sm:text-sm text-neutral-500 mt-1">
            Manage how and when you receive alerts
          </p>
        </div>
        {saved && (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-sage-50 text-sage-600 rounded-lg self-start">
            <Check className="w-4 h-4" />
            <span className="text-[12px] sm:text-sm font-medium">Saved</span>
          </div>
        )}
      </header>

      {/* Delivery Channels */}
      <section className="bg-neutral-50/50 rounded-[10px] overflow-hidden">
        <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-neutral-100">
          <h2 className="text-[13px] sm:text-sm font-medium text-neutral-900">Delivery Channels</h2>
          <p className="text-[10px] sm:text-xs text-neutral-500 mt-0.5">Choose how you want to receive notifications</p>
        </div>

        <div className="p-4 sm:p-6">
          {CHANNEL_CONFIG.map((channel, index) => {
            const isEnabled = notifications.channels[channel.key]?.enabled;
            const Icon = channel.icon;

            return (
              <div
                key={channel.key}
                className={`flex items-center justify-between py-3 sm:py-4 border-b border-neutral-100 ${
                  index === CHANNEL_CONFIG.length - 1 ? 'border-0' : ''
                }`}
              >
                <div className="flex items-center gap-3 sm:gap-4">
                  <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-neutral-400 flex-shrink-0" />
                  <div>
                    <p className="text-[12px] sm:text-sm font-medium text-neutral-900">{channel.label}</p>
                    <p className="text-[10px] sm:text-xs text-neutral-500 mt-0.5">{channel.description}</p>
                  </div>
                </div>
                <Toggle enabled={isEnabled} onChange={() => toggleChannel(channel.key)} />
              </div>
            );
          })}
        </div>
      </section>

      {/* Notification Triggers by Category */}
      {CATEGORIES.map((category) => {
        const categoryTriggers = getTriggersByCategory(category.key);

        return (
          <section key={category.key} className="bg-neutral-50/50 rounded-[10px] overflow-hidden">
            <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-neutral-100 flex items-center justify-between gap-2">
              <div>
                <h2 className="text-[13px] sm:text-sm font-medium text-neutral-900">{category.label}</h2>
              </div>
              {category.key === 'bookings' && (
                <div className="flex items-center gap-2 sm:gap-3">
                  <button
                    onClick={enableAllTriggers}
                    className="text-[10px] sm:text-xs text-neutral-500 hover:text-neutral-900 transition-colors"
                  >
                    Enable all
                  </button>
                  <span className="text-neutral-300">|</span>
                  <button
                    onClick={disableAllTriggers}
                    className="text-[10px] sm:text-xs text-neutral-500 hover:text-neutral-900 transition-colors"
                  >
                    Disable all
                  </button>
                </div>
              )}
            </div>

            <div className="p-4 sm:p-6">
              {categoryTriggers.map((trigger, index) => {
                const triggerData = notifications.triggers[trigger.key] || { enabled: false, channels: [] };
                const config = {
                  enabled: triggerData.enabled || false,
                  channels: Array.isArray(triggerData.channels) ? triggerData.channels : []
                };

                return (
                  <div
                    key={trigger.key}
                    className={`py-3 sm:py-4 border-b border-neutral-100 ${
                      index === categoryTriggers.length - 1 ? 'border-0' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <p className="text-[12px] sm:text-sm font-medium text-neutral-900">{trigger.label}</p>
                        <p className="text-[10px] sm:text-xs text-neutral-500 mt-0.5">{trigger.description}</p>
                      </div>
                      <Toggle enabled={config.enabled} onChange={() => toggleTrigger(trigger.key)} />
                    </div>

                    {/* Channel Selection */}
                    {config.enabled && (
                      <div className="mt-3 sm:mt-4 flex flex-wrap items-center gap-2 sm:gap-3">
                        <span className="text-[10px] sm:text-xs text-neutral-500">Send via:</span>
                        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                          {CHANNEL_CONFIG.map((channel) => {
                            const isActive = config.channels.includes(channel.key);
                            const isChannelEnabled = notifications.channels[channel.key]?.enabled;

                            return (
                              <button
                                key={channel.key}
                                onClick={() => toggleTriggerChannel(trigger.key, channel.key)}
                                disabled={!isChannelEnabled}
                                className={`px-2 sm:px-3 py-1 sm:py-1.5 text-[10px] sm:text-xs rounded-lg border transition-colors ${
                                  isActive
                                    ? 'bg-terra-500 text-white border-terra-500'
                                    : 'bg-white text-neutral-600 border-neutral-200 hover:border-neutral-300'
                                } ${
                                  !isChannelEnabled
                                    ? 'opacity-40 cursor-not-allowed'
                                    : ''
                                }`}
                              >
                                {channel.key.charAt(0).toUpperCase() + channel.key.slice(1)}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        );
      })}

      {/* Summary */}
      <section className="bg-neutral-50/50 rounded-[10px] overflow-hidden">
        <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-neutral-100">
          <h2 className="text-[13px] sm:text-sm font-medium text-neutral-900">Summary</h2>
          <p className="text-[10px] sm:text-xs text-neutral-500 mt-0.5">
            {Object.values(notifications.triggers).filter((t: { enabled: boolean }) => t.enabled).length} of {TRIGGER_CONFIG.length} alerts enabled
          </p>
        </div>
        <div className="p-4 sm:p-6">
          <div className="flex flex-wrap items-center gap-4 sm:gap-6">
            {CHANNEL_CONFIG.map((channel) => {
              const isEnabled = notifications.channels[channel.key]?.enabled;
              const Icon = channel.icon;

              return (
                <div
                  key={channel.key}
                  className={`flex items-center gap-2 ${
                    isEnabled ? 'text-neutral-900' : 'text-neutral-400'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span className="text-[12px] sm:text-sm">{channel.label.split(' ')[0]}</span>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
