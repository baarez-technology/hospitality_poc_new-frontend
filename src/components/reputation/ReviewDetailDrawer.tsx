import { useState, useEffect } from 'react';
import {
  Star,
  Calendar,
  Mail,
  Copy,
  Check,
  Sparkles,
  Edit3,
  User,
  ExternalLink,
  Loader2,
  RefreshCw
} from 'lucide-react';
import { Drawer } from '../ui2/Drawer';
import { Button } from '../ui2/Button';
import { useReputation } from '@/context/ReputationContext';
import { useToast } from '@/contexts/ToastContext';

const SOURCE_COLORS: Record<string, string> = {
  'Booking.com': '#003580',
  'Google': '#4285F4',
  'Expedia': '#FFCC00',
  'Tripadvisor': '#34E0A1',
  'Agoda': '#5C2D91'
};

const getSentimentStyle = (sentiment: number) => {
  if (sentiment >= 70) return { bg: 'bg-sage-100', text: 'text-sage-700', label: 'Positive' };
  if (sentiment >= 40) return { bg: 'bg-neutral-100', text: 'text-neutral-600', label: 'Neutral' };
  return { bg: 'bg-gold-100', text: 'text-gold-700', label: 'Negative' };
};

const StarRating = ({ rating }: { rating: number }) => {
  const fullStars = Math.floor(rating);
  const hasHalf = rating % 1 >= 0.5;

  return (
    <div className="flex items-center gap-0.5">
      {[...Array(5)].map((_, i) => (
        <Star
          key={i}
          className={`w-3 h-3 sm:w-4 sm:h-4 ${
            i < fullStars
              ? 'text-gold-500 fill-gold-500'
              : i === fullStars && hasHalf
              ? 'text-gold-500 fill-gold-500/50'
              : 'text-neutral-300'
          }`}
        />
      ))}
    </div>
  );
};

interface Review {
  id: string | number;
  guest: string;
  email?: string;
  source: string;
  rating: number;
  sentiment: number;
  date?: string;
  created_at?: string;
  title: string;
  review: string;
  keywords?: string[];
  responded?: boolean;
  responseText?: string;
  response_text?: string;  // Backend field name
  response?: string;       // Backend sends this field
  responseDate?: string;
  response_date?: string;  // Backend field name
  responded_at?: string;   // Backend sends this field
}

interface GuestCRMData {
  totalStays: number;
  ltv: number;
  segment: string;
}

interface ReviewDetailDrawerProps {
  review: Review | null;
  onClose: () => void;
  onRespond?: (reviewId: string | number, responseText: string) => void;
  guestCRMData?: GuestCRMData;
}

export default function ReviewDetailDrawer({
  review,
  onClose,
  onRespond,
  guestCRMData
}: ReviewDetailDrawerProps) {
  const { generateDraft } = useReputation();
  const { showToast } = useToast();
  const [responseText, setResponseText] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [suggestedReply, setSuggestedReply] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generateError, setGenerateError] = useState<string | null>(null);

  // Check if review already has a response (backend sends 'response' field)
  const reviewHasResponse = review?.responded || !!review?.responseText || !!review?.response_text || !!review?.response;

  // Generate AI response when drawer opens with a review that has no response
  useEffect(() => {
    if (review && !reviewHasResponse) {
      generateAIResponse();
    }
    // Reset state when review changes
    return () => {
      setSuggestedReply('');
      setResponseText('');
      setIsEditing(false);
      setGenerateError(null);
    };
  }, [review?.id, reviewHasResponse]);

  const generateAIResponse = async () => {
    if (!review) return;

    setIsGenerating(true);
    setGenerateError(null);

    try {
      const reviewId = typeof review.id === 'string' ? parseInt(review.id, 10) : review.id;
      const result = await generateDraft(reviewId, 'professional', true);
      setSuggestedReply(result.draft_text || '');
    } catch (error: any) {
      console.error('Failed to generate AI response:', error);
      setGenerateError('Failed to generate response. Click regenerate to try again.');
      showToast('Failed to generate AI response', 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  if (!review) return null;

  const sentimentStyle = getSentimentStyle(review.sentiment);
  const sourceColor = SOURCE_COLORS[review.source] || '#A57865';

  const handleUseSuggested = () => {
    setResponseText(suggestedReply);
    setIsEditing(true);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(suggestedReply);
    setCopied(true);
    showToast('Response copied to clipboard', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSend = () => {
    if (responseText.trim() && onRespond) {
      onRespond(review.id, responseText);
      onClose();
    }
  };

  // Send the AI-generated response directly without editing
  const handleSendSuggested = () => {
    if (suggestedReply.trim() && onRespond) {
      onRespond(review.id, suggestedReply);
      onClose();
    }
  };

  const header = (
    <div className="flex items-center gap-3 sm:gap-4">
      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-[10px] bg-terra-500 flex items-center justify-center text-white text-sm sm:text-lg font-bold flex-shrink-0">
        {review.guest?.split(' ').filter(n => n).map(n => n[0]).join('').substring(0, 2) || 'G'}
      </div>
      <div className="flex-1 min-w-0">
        <h2 className="text-base sm:text-lg font-semibold text-neutral-900 tracking-tight truncate">{review.guest}</h2>
        <div className="flex items-center gap-1.5 sm:gap-2 mt-0.5 sm:mt-1 flex-wrap">
          <span
            className="px-1.5 sm:px-2 py-0.5 text-[9px] sm:text-[10px] font-bold text-white rounded"
            style={{ backgroundColor: sourceColor }}
          >
            {review.source}
          </span>
          <span className={`px-1.5 sm:px-2 py-0.5 rounded text-[9px] sm:text-[10px] font-semibold ${sentimentStyle.bg} ${sentimentStyle.text}`}>
            {sentimentStyle.label}
          </span>
        </div>
        {review.email && (
          <p className="text-[10px] sm:text-[11px] text-neutral-400 mt-0.5 sm:mt-1 flex items-center gap-1 truncate">
            <Mail className="w-3 h-3 flex-shrink-0" />
            <span className="truncate">{review.email}</span>
          </p>
        )}
      </div>
    </div>
  );

  // Check if review already has a response (backend sends 'response' field)
  const hasExistingResponse = review.responded || review.responseText || review.response_text || review.response;

  const footer = !hasExistingResponse ? (
    <div className="flex items-center justify-end gap-2 sm:gap-3 w-full">
      <Button variant="outline" onClick={onClose} className="text-[12px] sm:text-[13px] px-3 sm:px-4 py-2">
        Cancel
      </Button>
      <Button
        variant="primary"
        onClick={handleSend}
        disabled={!responseText.trim()}
        className="text-[12px] sm:text-[13px] px-3 sm:px-4 py-2"
      >
        Send Response
      </Button>
    </div>
  ) : (
    <div className="flex items-center justify-end w-full">
      <Button variant="ghost" onClick={onClose} className="text-[12px] sm:text-[13px] px-3 sm:px-4 py-2">
        Close
      </Button>
    </div>
  );

  return (
    <Drawer
      isOpen={!!review}
      onClose={onClose}
      title=""
      subtitle=""
      header={header}
      maxWidth="max-w-xl"
      footer={footer}
      className=""
    >
      <div className="space-y-4 sm:space-y-5">
        {/* Rating & Sentiment */}
        <div className="grid grid-cols-2 gap-2 sm:gap-3">
          <div className="flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 bg-neutral-50 rounded-[10px]">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-[8px] bg-gold-100 flex items-center justify-center flex-shrink-0">
              <Star className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gold-600" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] sm:text-[11px] text-neutral-500">Rating</p>
              <div className="flex items-center gap-1 sm:gap-2">
                <StarRating rating={review.rating} />
                <span className="text-[12px] sm:text-[13px] font-semibold text-neutral-900">{review.rating}/5</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 bg-neutral-50 rounded-[10px]">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-[8px] bg-terra-100 flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-terra-600" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] sm:text-[11px] text-neutral-500">Sentiment</p>
              <p className="text-[12px] sm:text-[13px] font-semibold text-neutral-900">{review.sentiment}/100</p>
            </div>
          </div>
        </div>

        {/* Date */}
        <div className="flex items-center gap-2 text-[12px] sm:text-[13px] text-neutral-500">
          <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
          <span className="truncate">
            {(() => {
              const dateStr = review.date || review.created_at;
              if (!dateStr) return 'No date';
              const d = new Date(dateStr);
              return isNaN(d.getTime()) ? 'No date' : d.toLocaleDateString('en-US', {
                weekday: 'short',
                year: 'numeric',
                month: 'short',
                day: 'numeric'
              });
            })()}
          </span>
        </div>

        {/* Review Title */}
        <div>
          <p className="text-[10px] sm:text-[11px] font-semibold text-neutral-400 uppercase tracking-widest mb-1.5 sm:mb-2">Review Title</p>
          <p className="text-[14px] sm:text-[16px] font-medium text-neutral-900">"{review.title}"</p>
        </div>

        {/* Full Review */}
        <div>
          <p className="text-[10px] sm:text-[11px] font-semibold text-neutral-400 uppercase tracking-widest mb-1.5 sm:mb-2">Full Review</p>
          <div className="bg-neutral-50 rounded-[10px] p-3 sm:p-4">
            <p className="text-[12px] sm:text-[13px] text-neutral-700 whitespace-pre-wrap leading-relaxed">
              {review.review}
            </p>
          </div>
        </div>

        {/* Keywords */}
        {review.keywords && review.keywords.length > 0 && (
          <div>
            <p className="text-[10px] sm:text-[11px] font-semibold text-neutral-400 uppercase tracking-widest mb-1.5 sm:mb-2">Detected Keywords</p>
            <div className="flex flex-wrap gap-1.5 sm:gap-2">
              {review.keywords.map((keyword, index) => (
                <span
                  key={index}
                  className="px-2 sm:px-3 py-0.5 sm:py-1 bg-ocean-100 text-ocean-700 text-[10px] sm:text-[11px] font-medium rounded-full"
                >
                  {keyword}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* CRM Guest Profile */}
        {guestCRMData && (
          <div className="bg-sage-50 rounded-[10px] p-3 sm:p-4 border border-sage-100">
            <div className="flex items-center gap-2 mb-2 sm:mb-3">
              <User className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-sage-700" />
              <p className="text-[12px] sm:text-[13px] font-semibold text-sage-800">CRM Guest Profile</p>
            </div>
            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              <div>
                <p className="text-[10px] sm:text-[11px] text-neutral-500">Total Stays</p>
                <p className="text-[16px] sm:text-[18px] font-bold text-neutral-900">{guestCRMData.totalStays || 0}</p>
              </div>
              <div>
                <p className="text-[10px] sm:text-[11px] text-neutral-500">LTV</p>
                <p className="text-[16px] sm:text-[18px] font-bold text-sage-700">₹{(guestCRMData.ltv || 0).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-[10px] sm:text-[11px] text-neutral-500">Segment</p>
                <p className="text-[12px] sm:text-[13px] font-semibold text-neutral-900">{guestCRMData.segment || 'N/A'}</p>
              </div>
            </div>
            <button className="mt-2 sm:mt-3 flex items-center gap-1 text-[10px] sm:text-[11px] font-medium text-sage-700 hover:underline">
              View Full Profile
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>
        )}

        {/* Existing Response */}
        {hasExistingResponse && (review.responseText || review.response_text || review.response) && (
          <div className="bg-sage-50/50 rounded-[12px] p-4 sm:p-5 border border-sage-200">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-sage-500 flex items-center justify-center">
                  <Check className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-[12px] sm:text-[13px] font-semibold text-sage-700">Response Published</p>
                  {(review.responseDate || review.response_date || review.responded_at) && (
                    <p className="text-[10px] sm:text-[11px] text-neutral-500">
                      {new Date(review.responseDate || review.response_date || review.responded_at || '').toLocaleDateString('en-US', {
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  )}
                </div>
              </div>
              <Button
                variant="ghost"
                size="xs"
                icon={Copy}
                onClick={() => {
                  navigator.clipboard.writeText(review.responseText || review.response_text || review.response || '');
                  showToast('Response copied to clipboard', 'success');
                }}
              >
                Copy
              </Button>
            </div>
            <div className="bg-white rounded-[10px] p-3 sm:p-4 border border-sage-100">
              <p className="text-[12px] sm:text-[13px] text-neutral-700 whitespace-pre-wrap leading-relaxed">
                {review.responseText || review.response_text || review.response}
              </p>
            </div>
          </div>
        )}

        {/* AI Response Generator */}
        {!hasExistingResponse && (
          <div>
            <p className="text-[10px] sm:text-[11px] font-semibold text-neutral-400 uppercase tracking-widest mb-1.5 sm:mb-2 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-terra-600" />
              AI Suggested Response
            </p>

            <div className="bg-terra-50 rounded-[10px] p-3 sm:p-4 border border-terra-100 mb-2 sm:mb-3">
              {isGenerating ? (
                <div className="flex items-center justify-center py-6">
                  <Loader2 className="w-5 h-5 text-terra-600 animate-spin" />
                  <span className="ml-2 text-[12px] text-neutral-600">Generating AI response...</span>
                </div>
              ) : generateError ? (
                <div className="text-center py-4">
                  <p className="text-[12px] text-neutral-500 mb-2">{generateError}</p>
                  <Button
                    variant="outline"
                    size="xs"
                    icon={RefreshCw}
                    onClick={generateAIResponse}
                    className="text-[10px] sm:text-[11px]"
                  >
                    Regenerate
                  </Button>
                </div>
              ) : (
                <>
                  <p className="text-[12px] sm:text-[13px] text-neutral-700 whitespace-pre-wrap leading-relaxed">
                    {suggestedReply || 'Click regenerate to generate an AI response.'}
                  </p>
                  <div className="flex items-center gap-2 mt-2 sm:mt-3">
                    <Button
                      variant="outline"
                      size="xs"
                      icon={RefreshCw}
                      onClick={generateAIResponse}
                      className="text-[10px] sm:text-[11px]"
                    >
                      Regenerate
                    </Button>
                    {suggestedReply && (
                      <>
                        <Button
                          variant="outline"
                          size="xs"
                          icon={copied ? Check : Copy}
                          onClick={handleCopy}
                          className="text-[10px] sm:text-[11px]"
                        >
                          {copied ? 'Copied' : 'Copy'}
                        </Button>
                        <Button
                          variant="outline"
                          size="xs"
                          icon={Edit3}
                          onClick={handleUseSuggested}
                          className="text-[10px] sm:text-[11px]"
                        >
                          Edit
                        </Button>
                        <Button
                          variant="primary"
                          size="xs"
                          icon={Check}
                          onClick={handleSendSuggested}
                          className="text-[10px] sm:text-[11px]"
                        >
                          Approve & Send
                        </Button>
                      </>
                    )}
                  </div>
                </>
              )}
            </div>

            {isEditing && (
              <div>
                <label className="text-[10px] sm:text-[11px] font-semibold text-neutral-400 uppercase tracking-widest mb-1.5 sm:mb-2 block">
                  Edit Response
                </label>
                <textarea
                  value={responseText}
                  onChange={(e) => setResponseText(e.target.value)}
                  rows={4}
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-neutral-200 rounded-[10px] text-[12px] sm:text-[13px] focus:outline-none focus:ring-2 focus:ring-terra-500/20 focus:border-terra-500 resize-none"
                  placeholder="Edit your response..."
                />
              </div>
            )}
          </div>
        )}
      </div>
    </Drawer>
  );
}
