/**
 * MessageGuestModal Component
 * Send message to guest - Glimmora Design System v5.0
 * Side drawer following CMS pattern
 */

import { useState, useEffect } from 'react';
import { Sparkles, Loader2 } from 'lucide-react';
import { guestsService } from '../../../api/services/guests.service';
import { Drawer } from '../../ui2/Drawer';
import { Button } from '../../ui2/Button';

interface MessageGuestModalProps {
  guest: {
    id: string | number;
    name: string;
    email: string;
  } | null;
  isOpen: boolean;
  onClose: () => void;
  onSend?: (guestId: string | number, data: { subject: string; message: string }) => void;
}

// Custom Select Component matching CMS pattern
function CustomSelect({ value, onChange, options, placeholder = 'Select...' }) {
  const [isOpen, setIsOpen] = useState(false);

  const selectedOption = options.find(opt => opt.value === value);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full h-9 px-3.5 rounded-lg text-[13px] bg-white border transition-all duration-150 text-left flex items-center justify-between focus:outline-none ${
          isOpen
            ? 'border-terra-400 ring-2 ring-terra-500/10'
            : 'border-neutral-200 hover:border-neutral-300'
        }`}
      >
        <span className={selectedOption ? 'text-neutral-900' : 'text-neutral-400'}>
          {selectedOption?.label || placeholder}
        </span>
        <svg className={`w-4 h-4 text-neutral-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-[80]" onClick={() => setIsOpen(false)} />
          <div className="absolute z-[90] w-full mt-1 bg-white rounded-lg border border-neutral-200 shadow-lg overflow-hidden max-h-60 overflow-y-auto">
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                className={`w-full px-3.5 py-2.5 text-[13px] text-left hover:bg-neutral-50 transition-colors ${
                  value === option.value ? 'bg-terra-50 text-terra-700' : 'text-neutral-700'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default function MessageGuestModal({ guest, isOpen, onClose, onSend }: MessageGuestModalProps) {
  const [formData, setFormData] = useState({
    subject: '',
    message: '',
    template: 'custom'
  });
  const [aiContext, setAiContext] = useState('');
  const [aiTone, setAiTone] = useState<'professional' | 'friendly' | 'formal' | 'casual'>('professional');
  const [isLoading, setIsLoading] = useState(false);
  const [isDrafting, setIsDrafting] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const templates = {
    custom: { subject: '', message: '' },
    welcome: {
      subject: 'Welcome to Glimmora',
      message: `Dear ${guest?.name || 'Guest'},\n\nWelcome to Glimmora! We're thrilled to have you stay with us.\n\nIf you need anything during your stay, please don't hesitate to reach out to our concierge team.\n\nBest regards,\nThe Glimmora Team`
    },
    thankyou: {
      subject: 'Thank You for Your Stay',
      message: `Dear ${guest?.name || 'Guest'},\n\nThank you for choosing Glimmora for your recent stay. We hope you had a wonderful experience.\n\nWe'd love to welcome you back soon!\n\nWarm regards,\nThe Glimmora Team`
    },
    followup: {
      subject: "We'd Love Your Feedback",
      message: `Dear ${guest?.name || 'Guest'},\n\nWe hope you enjoyed your recent stay at Glimmora.\n\nYour feedback is invaluable to us. Would you mind taking a moment to share your experience?\n\nThank you,\nThe Glimmora Team`
    },
    birthday: {
      subject: 'Happy Birthday from Glimmora!',
      message: `Dear ${guest?.name || 'Guest'},\n\nHappy Birthday!\n\nWe'd like to offer you a special 20% discount on your next stay with us.\n\nCelebrate in style at Glimmora!\n\nBest wishes,\nThe Glimmora Team`
    },
    promotional: {
      subject: 'Exclusive Offer Just for You',
      message: `Dear ${guest?.name || 'Guest'},\n\nAs a valued guest, we're pleased to offer you an exclusive discount on your next stay at Glimmora.\n\nBook within the next 30 days and enjoy 15% off our best available rates.\n\nWe look forward to welcoming you back!\n\nBest regards,\nThe Glimmora Team`
    },
    apology: {
      subject: 'Our Sincere Apologies',
      message: `Dear ${guest?.name || 'Guest'},\n\nWe sincerely apologize for any inconvenience you may have experienced during your stay.\n\nYour satisfaction is our top priority, and we would like to make it right. Please accept our offer of a complimentary upgrade on your next visit.\n\nThank you for your understanding.\n\nBest regards,\nThe Glimmora Team`
    }
  };

  useEffect(() => {
    if (isOpen) {
      setStatus(null);
      setFormData({ subject: '', message: '', template: 'custom' });
      setAiContext('');
    }
  }, [isOpen]);

  useEffect(() => {
    if (formData.template !== 'custom' && formData.template !== 'ai') {
      const template = templates[formData.template as keyof typeof templates];
      if (template) {
        setFormData(prev => ({
          ...prev,
          subject: template.subject,
          message: template.message
        }));
      }
    }
  }, [formData.template, guest]);

  if (!guest) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAIDraft = async () => {
    if (!guest || !aiContext.trim()) return;

    setIsDrafting(true);
    setStatus(null);

    try {
      const response = await guestsService.draftMessage(guest.id, {
        template: 'custom',
        context: aiContext,
        tone: aiTone
      });

      if (response.success) {
        setFormData(prev => ({
          ...prev,
          subject: response.subject,
          message: response.message,
          template: 'ai'
        }));
        setStatus({ type: 'success', message: 'AI draft generated!' });
      }
    } catch (error) {
      setStatus({ type: 'error', message: 'Failed to generate AI draft. Using template fallback.' });
    } finally {
      setIsDrafting(false);
    }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();

    if (!guest || !formData.subject.trim() || !formData.message.trim()) return;

    setIsLoading(true);
    setStatus(null);

    try {
      const response = await guestsService.sendMessage(guest.id, {
        subject: formData.subject,
        message: formData.message,
        template: formData.template
      });

      if (response.success && response.email_sent) {
        setStatus({ type: 'success', message: 'Email sent successfully!' });

        // Call optional onSend callback
        if (onSend) {
          onSend(guest.id, {
            subject: formData.subject,
            message: formData.message
          });
        }

        // Close modal after delay
        setTimeout(() => {
          onClose();
          setFormData({ subject: '', message: '', template: 'custom' });
          setAiContext('');
          setStatus(null);
        }, 1500);
      } else {
        setStatus({ type: 'error', message: response.message || 'Failed to send email' });
      }
    } catch (error: any) {
      setStatus({
        type: 'error',
        message: error.response?.data?.detail || 'Failed to send email. Please try again.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const isFormValid = formData.subject.trim() && formData.message.trim();

  const templateOptions = [
    { value: 'custom', label: 'Custom Message' },
    { value: 'welcome', label: 'Welcome Email' },
    { value: 'thankyou', label: 'Thank You Note' },
    { value: 'followup', label: 'Follow-up Request' },
    { value: 'birthday', label: 'Birthday Greeting' },
    { value: 'promotional', label: 'Promotional Offer' },
    { value: 'apology', label: 'Service Apology' },
  ];

  const toneOptions = [
    { value: 'professional', label: 'Professional' },
    { value: 'friendly', label: 'Friendly' },
    { value: 'formal', label: 'Formal' },
    { value: 'casual', label: 'Casual' },
  ];

  const drawerFooter = (
    <div className="flex items-center justify-end gap-3 w-full">
      <Button variant="outline" onClick={onClose}>
        Cancel
      </Button>
      <Button
        variant="primary"
        onClick={handleSubmit}
        disabled={!isFormValid}
        loading={isLoading}
      >
        Send Email
      </Button>
    </div>
  );

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title="Send Message"
      subtitle={`Send a message to ${guest.name}`}
      maxWidth="max-w-2xl"
      footer={drawerFooter}
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Status Message */}
        {status && (
          <div className={`p-3 rounded-lg text-[13px] ${
            status.type === 'success'
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              : 'bg-rose-50 text-rose-700 border border-rose-200'
          }`}>
            {status.message}
          </div>
        )}

        {/* Template Selector */}
        <section>
          <h3 className="text-[11px] font-semibold uppercase tracking-widest text-neutral-400 mb-4">
            Template
          </h3>
          <CustomSelect
            value={formData.template}
            onChange={(value) => setFormData(prev => ({ ...prev, template: value }))}
            options={templateOptions}
            placeholder="Select template"
          />
        </section>

        {/* AI Drafting Section */}
        <section>
          <h3 className="text-[11px] font-semibold uppercase tracking-widest text-neutral-400 mb-4">
            AI Draft Assistant
          </h3>
          <div className="bg-gradient-to-r from-terra-50 to-amber-50 rounded-lg p-4 border border-terra-100">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-terra-500" />
              <span className="font-medium text-[13px] text-neutral-900">Generate with AI</span>
            </div>
            <div className="space-y-3">
              <textarea
                value={aiContext}
                onChange={(e) => setAiContext(e.target.value)}
                placeholder="Describe what you want to communicate (e.g., 'Thank them for their feedback and offer a discount on their next stay')"
                rows={2}
                className="w-full px-3.5 py-2.5 bg-white border border-neutral-200 rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-terra-500/10 focus:border-terra-400 resize-none"
              />
              <div className="flex items-center gap-3">
                <div className="w-40">
                  <CustomSelect
                    value={aiTone}
                    onChange={(value) => setAiTone(value as typeof aiTone)}
                    options={toneOptions}
                    placeholder="Select tone"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleAIDraft}
                  disabled={isDrafting || !aiContext.trim()}
                  className="h-9 px-4 text-[13px] font-medium text-white bg-terra-500 rounded-lg hover:bg-terra-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-2"
                >
                  {isDrafting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Drafting...
                    </>
                  ) : (
                    'Generate Draft'
                  )}
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Message Content */}
        <section>
          <h3 className="text-[11px] font-semibold uppercase tracking-widest text-neutral-400 mb-4">
            Message Content
          </h3>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="block text-[13px] font-medium text-neutral-700">
                Subject <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                required
                placeholder="Enter email subject..."
                className="w-full h-9 px-3.5 rounded-lg text-[13px] bg-white border border-neutral-200 hover:border-neutral-300 focus:border-terra-400 focus:ring-2 focus:ring-terra-500/10 focus:outline-none transition-all duration-150"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-[13px] font-medium text-neutral-700">
                Message <span className="text-rose-500">*</span>
              </label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                required
                rows={10}
                placeholder="Type your message here..."
                className="w-full px-3.5 py-2.5 rounded-lg text-[13px] bg-white border border-neutral-200 hover:border-neutral-300 focus:border-terra-400 focus:ring-2 focus:ring-terra-500/10 focus:outline-none transition-all duration-150 resize-none"
              />
            </div>
          </div>
        </section>

        {/* Recipient Info */}
        <div className="p-4 bg-neutral-50 rounded-lg border border-neutral-200">
          <p className="text-[11px] font-medium text-neutral-500 mb-1">This message will be sent to:</p>
          <p className="text-[13px] font-medium text-neutral-900">{guest.email}</p>
        </div>
      </form>
    </Drawer>
  );
}
