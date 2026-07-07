import { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  Eye,
  Mail,
  MessageSquare,
  Phone,
  Bell,
  Users,
  TrendingUp,
  MousePointer,
  Clock,
  AlertTriangle,
  Send,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  BarChart3,
  Loader2,
} from 'lucide-react';

// Types
interface Campaign {
  id: string;
  name: string;
  subject?: string;
  content: string;
  channel: 'email' | 'sms' | 'whatsapp' | 'push';
  abTestEnabled?: boolean;
  variants?: {
    id: string;
    name: string;
    content: string;
  }[];
  scheduledAt?: string;
}

interface Segment {
  id: string;
  name: string;
  memberCount: number;
}

interface SampleGuest {
  id: string;
  name: string;
  email: string;
  firstName: string;
  tier?: string;
  lastStay?: string;
}

interface FrequencyConflict {
  guestId: string;
  guestName: string;
  channel: string;
  reason: string;
}

interface CampaignPreviewSidebarProps {
  campaign: Campaign | null;
  segment: Segment | null;
  isOpen: boolean;
  onClose: () => void;
  onSend?: () => void;
  onSchedule?: (scheduledAt: string) => void;
  sampleGuests?: SampleGuest[];
  frequencyConflicts?: FrequencyConflict[];
  optimalSendTime?: string;
  isLoading?: boolean;
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

// Default sample guests
const DEFAULT_SAMPLE_GUESTS: SampleGuest[] = [
  { id: '1', name: 'Sarah Johnson', email: 'sarah.j@email.com', firstName: 'Sarah', tier: 'gold', lastStay: '2024-01-15' },
  { id: '2', name: 'Michael Chen', email: 'm.chen@email.com', firstName: 'Michael', tier: 'silver', lastStay: '2024-01-20' },
  { id: '3', name: 'Emma Wilson', email: 'emma.w@email.com', firstName: 'Emma', tier: 'bronze', lastStay: '2024-01-25' },
];

// Personalization helper
const personalizeContent = (content: string, guest: SampleGuest): string => {
  return content
    .replace(/\{first_name\}/gi, guest.firstName)
    .replace(/\{name\}/gi, guest.name)
    .replace(/\{email\}/gi, guest.email)
    .replace(/\{tier\}/gi, guest.tier || 'Member')
    .replace(/\{last_stay\}/gi, guest.lastStay || 'your last visit');
};

// Mock predicted metrics
const getPredictedMetrics = (channel: string, segmentSize: number) => {
  const baseRates: Record<string, { openRate: number; conversionRate: number }> = {
    email: { openRate: 0.25, conversionRate: 0.035 },
    sms: { openRate: 0.95, conversionRate: 0.08 },
    whatsapp: { openRate: 0.90, conversionRate: 0.07 },
    push: { openRate: 0.45, conversionRate: 0.02 },
  };

  const rates = baseRates[channel] || baseRates.email;

  return {
    reach: segmentSize,
    predictedOpenRate: rates.openRate * 100,
    predictedConversionRate: rates.conversionRate * 100,
    estimatedOpens: Math.floor(segmentSize * rates.openRate),
    estimatedConversions: Math.floor(segmentSize * rates.conversionRate),
  };
};

export default function CampaignPreviewSidebar({
  campaign,
  segment,
  isOpen,
  onClose,
  onSend,
  onSchedule,
  sampleGuests = DEFAULT_SAMPLE_GUESTS,
  frequencyConflicts = [],
  optimalSendTime,
  isLoading = false,
}: CampaignPreviewSidebarProps) {
  const sidebarRef = useRef<HTMLDivElement>(null);
  const [activeChannel, setActiveChannel] = useState<string>('email');
  const [activeVariant, setActiveVariant] = useState<string>('');
  const [currentGuestIndex, setCurrentGuestIndex] = useState(0);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleTime, setScheduleTime] = useState('');

  // Reset state when sidebar opens
  useEffect(() => {
    if (isOpen && campaign) {
      setActiveChannel(campaign.channel);
      setActiveVariant(campaign.variants?.[0]?.id || '');
      setCurrentGuestIndex(0);
    }
  }, [isOpen, campaign]);

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

  // Focus trap
  const handleTabKey = useCallback((e: KeyboardEvent) => {
    if (e.key !== 'Tab' || !sidebarRef.current) return;

    const focusableElements = sidebarRef.current.querySelectorAll(
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

  const handlePrevGuest = () => {
    setCurrentGuestIndex(prev => Math.max(0, prev - 1));
  };

  const handleNextGuest = () => {
    setCurrentGuestIndex(prev => Math.min(sampleGuests.length - 1, prev + 1));
  };

  const handleScheduleSubmit = () => {
    if (scheduleDate && scheduleTime && onSchedule) {
      const scheduledAt = `${scheduleDate}T${scheduleTime}:00`;
      onSchedule(scheduledAt);
      setShowScheduleModal(false);
      onClose();
    }
  };

  if (!isOpen || !campaign) return null;

  const currentGuest = sampleGuests[currentGuestIndex];
  const currentContent = activeVariant && campaign.variants
    ? campaign.variants.find(v => v.id === activeVariant)?.content || campaign.content
    : campaign.content;
  const personalizedContent = currentGuest ? personalizeContent(currentContent, currentGuest) : currentContent;
  const personalizedSubject = campaign.subject && currentGuest
    ? personalizeContent(campaign.subject, currentGuest)
    : campaign.subject;

  const metrics = segment ? getPredictedMetrics(campaign.channel, segment.memberCount) : null;
  const ChannelIcon = CHANNEL_ICONS[campaign.channel] || Mail;

  const sidebarContent = (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/30 z-[60]"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Sidebar */}
      <div
        ref={sidebarRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="sidebar-title"
        className="fixed right-0 top-0 bottom-0 w-full max-w-[480px] bg-white shadow-2xl z-[70] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex-shrink-0 p-4 border-b border-neutral-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Eye className="w-5 h-5 text-[#4E5840]" />
              <h2 id="sidebar-title" className="text-lg font-semibold text-neutral-900">
                Campaign Preview
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 rounded-full transition-colors"
              aria-label="Close sidebar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="w-8 h-8 text-[#4E5840] animate-spin" />
            </div>
          ) : (
            <div className="p-4 space-y-6">
              {/* Sample Guest Preview */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-medium text-neutral-500 uppercase tracking-wide">
                    Sample Guest Preview
                  </h3>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={handlePrevGuest}
                      disabled={currentGuestIndex === 0}
                      className="p-1 text-neutral-400 hover:text-neutral-600 disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <span className="text-xs text-neutral-500">
                      {currentGuestIndex + 1} / {sampleGuests.length}
                    </span>
                    <button
                      onClick={handleNextGuest}
                      disabled={currentGuestIndex === sampleGuests.length - 1}
                      className="p-1 text-neutral-400 hover:text-neutral-600 disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {currentGuest && (
                  <div className="p-3 bg-neutral-50 rounded-lg mb-3">
                    <p className="text-sm font-medium text-neutral-900">{currentGuest.name}</p>
                    <p className="text-xs text-neutral-500">{currentGuest.email}</p>
                  </div>
                )}

                {/* Content Preview */}
                <div className={`border rounded-xl overflow-hidden ${
                  campaign.channel === 'email' ? 'border-neutral-200' : 'border-[#4E5840]/20'
                }`}>
                  {campaign.channel === 'email' && personalizedSubject && (
                    <div className="px-4 py-3 bg-neutral-100 border-b border-neutral-200">
                      <p className="text-xs text-neutral-500 mb-1">Subject</p>
                      <p className="text-sm font-medium text-neutral-900">{personalizedSubject}</p>
                    </div>
                  )}
                  <div className="p-4">
                    <div className="prose prose-sm max-w-none">
                      <p className="text-sm text-neutral-700 whitespace-pre-wrap">
                        {personalizedContent}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* A/B Variant Toggle */}
              {campaign.abTestEnabled && campaign.variants && campaign.variants.length > 0 && (
                <div>
                  <h3 className="text-xs font-medium text-neutral-500 uppercase tracking-wide mb-3 flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    A/B Test Variants
                  </h3>
                  <div className="flex gap-2">
                    {campaign.variants.map((variant) => (
                      <button
                        key={variant.id}
                        onClick={() => setActiveVariant(variant.id)}
                        className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                          activeVariant === variant.id
                            ? 'bg-[#4E5840] text-white'
                            : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                        }`}
                      >
                        {variant.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Channel Preview Tabs */}
              <div>
                <h3 className="text-xs font-medium text-neutral-500 uppercase tracking-wide mb-3">
                  Channel Preview
                </h3>
                <div className="flex gap-2">
                  {(['email', 'sms', 'whatsapp', 'push'] as const).map((channel) => {
                    const Icon = CHANNEL_ICONS[channel];
                    const isActive = activeChannel === channel;
                    const isCampaignChannel = campaign.channel === channel;
                    return (
                      <button
                        key={channel}
                        onClick={() => setActiveChannel(channel)}
                        className={`flex-1 px-2 py-2 rounded-lg text-xs font-medium transition-colors flex flex-col items-center gap-1 ${
                          isActive
                            ? 'bg-[#4E5840] text-white'
                            : isCampaignChannel
                            ? 'bg-[#4E5840]/10 text-[#4E5840] border border-[#4E5840]/30'
                            : 'bg-neutral-100 text-neutral-500 hover:bg-neutral-200'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        {CHANNEL_LABELS[channel]}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Estimated Metrics */}
              {metrics && (
                <div>
                  <h3 className="text-xs font-medium text-neutral-500 uppercase tracking-wide mb-3 flex items-center gap-1">
                    <BarChart3 className="w-3 h-3" />
                    Estimated Metrics
                  </h3>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="p-3 bg-neutral-50 rounded-xl">
                      <div className="flex items-center gap-1 text-neutral-500 mb-1">
                        <Users className="w-3 h-3" />
                        <span className="text-xs">Reach</span>
                      </div>
                      <p className="text-lg font-bold text-neutral-900">
                        {metrics.reach.toLocaleString()}
                      </p>
                    </div>
                    <div className="p-3 bg-neutral-50 rounded-xl">
                      <div className="flex items-center gap-1 text-neutral-500 mb-1">
                        <TrendingUp className="w-3 h-3" />
                        <span className="text-xs">Open Rate</span>
                      </div>
                      <p className="text-lg font-bold text-[#4E5840]">
                        {metrics.predictedOpenRate.toFixed(1)}%
                      </p>
                      <p className="text-xs text-neutral-500">
                        ~{metrics.estimatedOpens.toLocaleString()}
                      </p>
                    </div>
                    <div className="p-3 bg-neutral-50 rounded-xl">
                      <div className="flex items-center gap-1 text-neutral-500 mb-1">
                        <MousePointer className="w-3 h-3" />
                        <span className="text-xs">Conversion</span>
                      </div>
                      <p className="text-lg font-bold text-[#A57865]">
                        {metrics.predictedConversionRate.toFixed(1)}%
                      </p>
                      <p className="text-xs text-neutral-500">
                        ~{metrics.estimatedConversions.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Frequency Cap Warnings */}
              {frequencyConflicts.length > 0 && (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-medium text-amber-800 mb-2">
                        Frequency Cap Conflicts
                      </h4>
                      <p className="text-xs text-amber-700 mb-2">
                        {frequencyConflicts.length} guest(s) have reached their communication limits:
                      </p>
                      <ul className="text-xs text-amber-700 space-y-1">
                        {frequencyConflicts.slice(0, 3).map((conflict, index) => (
                          <li key={index}>
                            {conflict.guestName} - {conflict.reason}
                          </li>
                        ))}
                        {frequencyConflicts.length > 3 && (
                          <li>... and {frequencyConflicts.length - 3} more</li>
                        )}
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {/* Optimal Send Time */}
              {optimalSendTime && (
                <div className="p-4 bg-[#4E5840]/5 border border-[#4E5840]/20 rounded-xl">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-[#4E5840]" />
                    <div>
                      <p className="text-xs text-neutral-500 uppercase tracking-wide">
                        AI Recommended Send Time
                      </p>
                      <p className="text-sm font-medium text-[#4E5840]">{optimalSendTime}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 border-t border-neutral-200 p-4 bg-white">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowScheduleModal(true)}
              className="flex-1 px-4 py-2.5 border border-neutral-200 text-neutral-700 rounded-xl text-sm font-medium hover:bg-neutral-50 transition-colors flex items-center justify-center gap-2"
            >
              <Calendar className="w-4 h-4" />
              Schedule
            </button>
            <button
              onClick={onSend}
              disabled={isLoading}
              className="flex-1 px-4 py-2.5 bg-[#4E5840] text-white rounded-xl text-sm font-medium hover:bg-[#3d4632] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" />
              Send Now
            </button>
          </div>
        </div>

        {/* Schedule Modal */}
        {showScheduleModal && (
          <div className="absolute inset-0 bg-black/30 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-6">
              <h3 className="text-lg font-semibold text-neutral-900 mb-4">Schedule Campaign</h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-neutral-500 uppercase tracking-wide mb-2">
                    Date
                  </label>
                  <input
                    type="date"
                    value={scheduleDate}
                    onChange={(e) => setScheduleDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-2.5 bg-white border border-neutral-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#4E5840]/20 focus:border-[#4E5840]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-500 uppercase tracking-wide mb-2">
                    Time
                  </label>
                  <input
                    type="time"
                    value={scheduleTime}
                    onChange={(e) => setScheduleTime(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white border border-neutral-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#4E5840]/20 focus:border-[#4E5840]"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 mt-6">
                <button
                  onClick={() => setShowScheduleModal(false)}
                  className="flex-1 px-4 py-2.5 border border-neutral-200 text-neutral-700 rounded-xl text-sm font-medium hover:bg-neutral-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleScheduleSubmit}
                  disabled={!scheduleDate || !scheduleTime}
                  className="flex-1 px-4 py-2.5 bg-[#4E5840] text-white rounded-xl text-sm font-medium hover:bg-[#3d4632] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <Calendar className="w-4 h-4" />
                  Schedule
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );

  return createPortal(sidebarContent, document.body);
}
