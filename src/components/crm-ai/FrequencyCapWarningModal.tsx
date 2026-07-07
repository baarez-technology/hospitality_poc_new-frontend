import { useEffect, useRef, useCallback, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  AlertTriangle,
  Mail,
  MessageSquare,
  Phone,
  Bell,
  Clock,
  RefreshCw,
  Shield,
  ChevronDown,
  AlertCircle,
} from 'lucide-react';

// Types
interface ChannelStatus {
  channel: string;
  remainingWeek: number;
  remainingMonth: number;
  maxWeek: number;
  maxMonth: number;
  lastSent: string | null;
  nextAvailable: string | null;
  isBlocked: boolean;
}

interface FrequencyCapWarningModalProps {
  isOpen: boolean;
  onClose: () => void;
  guestId: string;
  channel: string;
  channelStatuses?: ChannelStatus[];
  onOverride?: (guestId: string, channel: string) => void;
  onChangeChannel: (newChannel: string) => void;
  isAdmin?: boolean;
}

const CHANNEL_ICONS: Record<string, typeof Mail> = {
  email: Mail,
  sms: MessageSquare,
  whatsapp: Phone,
  push: Bell,
};

const CHANNEL_LABELS: Record<string, string> = {
  email: 'Email',
  sms: 'SMS',
  whatsapp: 'WhatsApp',
  push: 'Push Notification',
};

const formatDate = (dateString: string | null): string => {
  if (!dateString) return 'Never';
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffHours < 1) return 'Just now';
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
};

const formatNextAvailable = (dateString: string | null): string => {
  if (!dateString) return 'Available now';
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = date.getTime() - now.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMs <= 0) return 'Available now';
  if (diffHours < 1) return 'In less than 1 hour';
  if (diffHours < 24) return `In ${diffHours} hours`;
  if (diffDays < 7) return `In ${diffDays} days`;
  return date.toLocaleDateString();
};

// Default mock data for channel statuses
const DEFAULT_CHANNEL_STATUSES: ChannelStatus[] = [
  {
    channel: 'email',
    remainingWeek: 0,
    remainingMonth: 2,
    maxWeek: 3,
    maxMonth: 10,
    lastSent: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    nextAvailable: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    isBlocked: true,
  },
  {
    channel: 'sms',
    remainingWeek: 1,
    remainingMonth: 3,
    maxWeek: 2,
    maxMonth: 5,
    lastSent: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    nextAvailable: null,
    isBlocked: false,
  },
  {
    channel: 'whatsapp',
    remainingWeek: 2,
    remainingMonth: 4,
    maxWeek: 2,
    maxMonth: 6,
    lastSent: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    nextAvailable: null,
    isBlocked: false,
  },
  {
    channel: 'push',
    remainingWeek: 3,
    remainingMonth: 8,
    maxWeek: 5,
    maxMonth: 15,
    lastSent: null,
    nextAvailable: null,
    isBlocked: false,
  },
];

export default function FrequencyCapWarningModal({
  isOpen,
  onClose,
  guestId,
  channel,
  channelStatuses = DEFAULT_CHANNEL_STATUSES,
  onOverride,
  onChangeChannel,
  isAdmin = false,
}: FrequencyCapWarningModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const [showOverrideConfirm, setShowOverrideConfirm] = useState(false);
  const [showChannelDropdown, setShowChannelDropdown] = useState(false);

  // Handle ESC key and body scroll lock
  useEffect(() => {
    if (!isOpen) return;

    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    document.addEventListener('keydown', handleEsc);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setShowOverrideConfirm(false);
    }
  }, [isOpen]);

  // Focus trap
  const handleTabKey = useCallback((e: KeyboardEvent) => {
    if (e.key !== 'Tab' || !modalRef.current) return;

    const focusableElements = modalRef.current.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    if (e.shiftKey && document.activeElement === firstElement) {
      e.preventDefault();
      lastElement?.focus();
    } else if (!e.shiftKey && document.activeElement === lastElement) {
      e.preventDefault();
      firstElement?.focus();
    }
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    document.addEventListener('keydown', handleTabKey);
    return () => document.removeEventListener('keydown', handleTabKey);
  }, [isOpen, handleTabKey]);

  const handleOverride = () => {
    if (onOverride) {
      onOverride(guestId, channel);
      onClose();
    }
  };

  const handleChangeChannel = (newChannel: string) => {
    onChangeChannel(newChannel);
    setShowChannelDropdown(false);
    onClose();
  };

  if (!isOpen) return null;

  const currentChannelStatus = channelStatuses.find(s => s.channel === channel);
  const availableChannels = channelStatuses.filter(s => !s.isBlocked);
  const ChannelIcon = CHANNEL_ICONS[channel] || Mail;

  const modalContent = (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/30 z-[60]"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
        <div
          ref={modalRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
          className="w-full max-w-[560px] max-h-[calc(100vh-2rem)] sm:max-h-[90vh] bg-white shadow-2xl rounded-2xl flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex-shrink-0 p-6 border-b border-neutral-200 bg-amber-50 rounded-t-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <h2 id="modal-title" className="text-lg font-semibold text-neutral-900">
                    Frequency Cap Warning
                  </h2>
                  <p className="text-sm text-amber-700">
                    This guest has reached their communication limit
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-neutral-400 hover:text-neutral-600 hover:bg-white/50 rounded-full transition-colors"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Warning Message */}
            <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
              <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-amber-800">
                  The <span className="font-medium">{CHANNEL_LABELS[channel]}</span> channel has reached its weekly limit for this guest.
                  Sending additional messages may negatively impact guest experience and engagement.
                </p>
              </div>
            </div>

            {/* Channel Status Table */}
            <div>
              <h3 className="text-xs font-medium text-neutral-500 uppercase tracking-wide mb-3">
                Channel Status
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-neutral-200">
                      <th className="text-left text-xs font-medium text-neutral-500 uppercase tracking-wide py-2 px-3">
                        Channel
                      </th>
                      <th className="text-center text-xs font-medium text-neutral-500 uppercase tracking-wide py-2 px-3">
                        Weekly
                      </th>
                      <th className="text-center text-xs font-medium text-neutral-500 uppercase tracking-wide py-2 px-3">
                        Monthly
                      </th>
                      <th className="text-right text-xs font-medium text-neutral-500 uppercase tracking-wide py-2 px-3">
                        Last Sent
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {channelStatuses.map((status) => {
                      const Icon = CHANNEL_ICONS[status.channel] || Mail;
                      const isCurrentChannel = status.channel === channel;
                      return (
                        <tr
                          key={status.channel}
                          className={`border-b border-neutral-100 ${
                            isCurrentChannel ? 'bg-amber-50' : ''
                          } ${status.isBlocked ? '' : 'cursor-pointer hover:bg-neutral-50'}`}
                          onClick={() => !status.isBlocked && handleChangeChannel(status.channel)}
                        >
                          <td className="py-3 px-3">
                            <div className="flex items-center gap-2">
                              <Icon className={`w-4 h-4 ${status.isBlocked ? 'text-neutral-400' : 'text-neutral-600'}`} />
                              <span className={`text-sm font-medium ${status.isBlocked ? 'text-neutral-400' : 'text-neutral-900'}`}>
                                {CHANNEL_LABELS[status.channel]}
                              </span>
                              {status.isBlocked && (
                                <span className="px-1.5 py-0.5 text-xs bg-rose-100 text-rose-600 rounded">
                                  Blocked
                                </span>
                              )}
                              {!status.isBlocked && isCurrentChannel && (
                                <span className="px-1.5 py-0.5 text-xs bg-emerald-100 text-emerald-600 rounded">
                                  Available
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-3 text-center">
                            <span className={`text-sm ${
                              status.remainingWeek === 0 ? 'text-rose-600 font-medium' : 'text-neutral-600'
                            }`}>
                              {status.remainingWeek}/{status.maxWeek}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-center">
                            <span className={`text-sm ${
                              status.remainingMonth === 0 ? 'text-rose-600 font-medium' : 'text-neutral-600'
                            }`}>
                              {status.remainingMonth}/{status.maxMonth}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-right text-sm text-neutral-500">
                            {formatDate(status.lastSent)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Next Available Time */}
            {currentChannelStatus?.isBlocked && currentChannelStatus?.nextAvailable && (
              <div className="p-4 bg-neutral-50 rounded-xl">
                <div className="flex items-center gap-2 text-neutral-600">
                  <Clock className="w-4 h-4" />
                  <span className="text-sm">
                    Next available send time for {CHANNEL_LABELS[channel]}:{' '}
                    <span className="font-medium text-neutral-900">
                      {formatNextAvailable(currentChannelStatus.nextAvailable)}
                    </span>
                  </span>
                </div>
              </div>
            )}

            {/* Change Channel Section */}
            {availableChannels.length > 0 && (
              <div className="relative">
                <label className="block text-xs font-medium text-neutral-500 uppercase tracking-wide mb-2">
                  Switch to Available Channel
                </label>
                <button
                  type="button"
                  onClick={() => setShowChannelDropdown(!showChannelDropdown)}
                  className="w-full px-4 py-3 bg-white border border-neutral-200 rounded-xl text-sm text-left flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-[#4E5840]/20 focus:border-[#4E5840]"
                >
                  <span className="text-neutral-500">Select an alternative channel</span>
                  <ChevronDown className={`w-4 h-4 text-neutral-400 transition-transform ${showChannelDropdown ? 'rotate-180' : ''}`} />
                </button>

                {showChannelDropdown && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-neutral-200 rounded-xl shadow-lg py-1">
                    {availableChannels.map((status) => {
                      const Icon = CHANNEL_ICONS[status.channel] || Mail;
                      return (
                        <button
                          key={status.channel}
                          onClick={() => handleChangeChannel(status.channel)}
                          className="w-full px-4 py-3 text-sm text-left hover:bg-neutral-50 flex items-center gap-3"
                        >
                          <Icon className="w-4 h-4 text-neutral-600" />
                          <div className="flex-1">
                            <p className="font-medium text-neutral-900">{CHANNEL_LABELS[status.channel]}</p>
                            <p className="text-xs text-neutral-500">
                              {status.remainingWeek} weekly / {status.remainingMonth} monthly remaining
                            </p>
                          </div>
                          <span className="px-2 py-1 text-xs bg-emerald-100 text-emerald-600 rounded-full">
                            Available
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Admin Override Section */}
            {isAdmin && onOverride && (
              <div className="border-t border-neutral-200 pt-4">
                {!showOverrideConfirm ? (
                  <button
                    onClick={() => setShowOverrideConfirm(true)}
                    className="flex items-center gap-2 text-sm text-amber-600 hover:text-amber-700"
                  >
                    <Shield className="w-4 h-4" />
                    Override frequency cap (Admin only)
                  </button>
                ) : (
                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
                    <p className="text-sm text-amber-800 mb-3">
                      <strong>Warning:</strong> Overriding the frequency cap may negatively impact guest experience.
                      This action will be logged. Are you sure you want to proceed?
                    </p>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleOverride}
                        className="px-4 py-2 bg-amber-600 text-white text-sm font-medium rounded-xl hover:bg-amber-700 transition-colors flex items-center gap-2"
                      >
                        <Shield className="w-4 h-4" />
                        Confirm Override
                      </button>
                      <button
                        onClick={() => setShowOverrideConfirm(false)}
                        className="px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-100 rounded-xl transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex-shrink-0 border-t border-neutral-200 p-4 bg-white rounded-b-2xl">
            <div className="flex items-center gap-3">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2.5 border border-neutral-200 text-neutral-700 rounded-xl text-sm font-medium hover:bg-neutral-50 transition-colors"
              >
                Cancel
              </button>
              {availableChannels.length > 0 && (
                <button
                  onClick={() => handleChangeChannel(availableChannels[0].channel)}
                  className="flex-1 px-4 py-2.5 bg-[#4E5840] text-white rounded-xl text-sm font-medium hover:bg-[#3d4632] transition-colors flex items-center justify-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  Switch to {CHANNEL_LABELS[availableChannels[0].channel]}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );

  return createPortal(modalContent, document.body);
}
