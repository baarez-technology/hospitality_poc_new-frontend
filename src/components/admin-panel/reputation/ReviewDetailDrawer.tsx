import { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  Star,
  Calendar,
  Mail,
  Phone,
  Tag,
  MessageSquare,
  Copy,
  Check,
  Sparkles,
  Send,
  Edit3,
  User,
  ExternalLink,
  ThumbsUp,
  ThumbsDown
} from 'lucide-react';

const SOURCE_COLORS = {
  'Booking.com': '#003580',
  'Google': '#4285F4',
  'Expedia': '#FFCC00',
  'Tripadvisor': '#34E0A1',
  'Agoda': '#5C2D91'
};

const getSentimentStyle = (sentiment) => {
  if (sentiment >= 70) return { bg: 'bg-[#4E5840]/15', text: 'text-[#4E5840]', label: 'Positive' };
  if (sentiment >= 40) return { bg: 'bg-[#C8B29D]/20', text: 'text-[#C8B29D]', label: 'Neutral' };
  return { bg: 'bg-[#CDB261]/20', text: 'text-[#CDB261]', label: 'Negative' };
};

const StarRating = ({ rating }) => {
  const fullStars = Math.floor(rating);
  const hasHalf = rating % 1 >= 0.5;

  return (
    <div className="flex items-center gap-0.5">
      {[...Array(5)].map((_, i) => (
        <Star
          key={i}
          className={`w-4 h-4 ${
            i < fullStars
              ? 'text-[#CDB261] fill-[#CDB261]'
              : i === fullStars && hasHalf
              ? 'text-[#CDB261] fill-[#CDB261]/50'
              : 'text-neutral-300'
          }`}
        />
      ))}
    </div>
  );
};

export default function ReviewDetailDrawer({
  review,
  onClose,
  onRespond,
  generateAutoReply,
  guestCRMData
}) {
  const [responseText, setResponseText] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [copied, setCopied] = useState(false);

  const suggestedReply = useMemo(() => {
    if (!review || !generateAutoReply) return '';
    return generateAutoReply(review);
  }, [review, generateAutoReply]);

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
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSend = () => {
    if (responseText.trim() && onRespond) {
      onRespond(review.id, responseText);
      onClose();
    }
  };

  const drawerContent = (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="relative w-full max-w-[480px] bg-white shadow-2xl border-l border-[#E5E5E5] flex flex-col animate-slide-in-right">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#E5E5E5] bg-[#FAF7F4]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#A57865]/10 flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-[#A57865]" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-neutral-900">Review Details</h2>
              <p className="text-xs text-neutral-500">{review.id}</p>
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
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* Guest Info */}
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#A57865] to-[#8E6554] flex items-center justify-center text-white text-xl font-bold">
              {review.guest?.split(' ').filter(n => n).map(n => n[0]).join('') || 'G'.substring(0, 2)}
            </div>
            <div className="flex-1">
              <p className="font-bold text-neutral-900 text-lg">{review.guest}</p>
              <div className="flex items-center gap-2 mt-1">
                <span
                  className="px-2 py-0.5 text-xs font-bold text-white rounded"
                  style={{ backgroundColor: sourceColor }}
                >
                  {review.source}
                </span>
                <span className={`px-2 py-0.5 rounded text-xs font-semibold ${sentimentStyle.bg} ${sentimentStyle.text}`}>
                  {sentimentStyle.label}
                </span>
              </div>
              <div className="flex items-center gap-4 mt-2 text-xs text-neutral-500">
                <span className="flex items-center gap-1">
                  <Mail className="w-3 h-3" />
                  {review.email}
                </span>
              </div>
            </div>
          </div>

          {/* Rating & Sentiment */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-[#FAF7F4] rounded-xl p-4">
              <div className="flex items-center gap-2 text-neutral-500 mb-2">
                <Star className="w-4 h-4 text-[#CDB261]" />
                <span className="text-xs font-medium">Rating</span>
              </div>
              <StarRating rating={review.rating} />
              <p className="text-lg font-bold text-neutral-900 mt-1">{review.rating}/5</p>
            </div>
            <div className="bg-[#FAF7F4] rounded-xl p-4">
              <div className="flex items-center gap-2 text-neutral-500 mb-2">
                <Sparkles className="w-4 h-4 text-[#A57865]" />
                <span className="text-xs font-medium">Sentiment</span>
              </div>
              <div className={`inline-flex items-center px-2.5 py-1 rounded-lg text-sm font-semibold ${sentimentStyle.bg} ${sentimentStyle.text}`}>
                {review.sentiment >= 70 ? <ThumbsUp className="w-3 h-3 mr-1" /> : review.sentiment < 40 ? <ThumbsDown className="w-3 h-3 mr-1" /> : null}
                {review.sentiment}/100
              </div>
            </div>
          </div>

          {/* Date */}
          <div className="flex items-center gap-2 text-sm text-neutral-600">
            <Calendar className="w-4 h-4" />
            <span>
              {new Date(review.date).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </span>
          </div>

          {/* Review Title */}
          <div>
            <h3 className="text-sm font-semibold text-neutral-900 mb-2">Review Title</h3>
            <p className="text-lg font-medium text-neutral-800">"{review.title}"</p>
          </div>

          {/* Full Review */}
          <div>
            <h3 className="text-sm font-semibold text-neutral-900 mb-2 flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              Full Review
            </h3>
            <div className="bg-[#FAF7F4] rounded-xl p-4">
              <p className="text-sm text-neutral-700 whitespace-pre-wrap leading-relaxed">
                {review.review}
              </p>
            </div>
          </div>

          {/* Keywords */}
          {review.keywords && review.keywords.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-neutral-900 mb-2 flex items-center gap-2">
                <Tag className="w-4 h-4" />
                Detected Keywords
              </h3>
              <div className="flex flex-wrap gap-2">
                {review.keywords.map((keyword, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-[#5C9BA4]/10 text-[#5C9BA4] text-xs font-medium rounded-full"
                  >
                    {keyword}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* CRM Guest Profile Link */}
          {guestCRMData && (
            <div className="bg-[#4E5840]/5 rounded-xl p-4 border border-[#4E5840]/20">
              <h3 className="text-sm font-semibold text-[#4E5840] mb-3 flex items-center gap-2">
                <User className="w-4 h-4" />
                CRM Guest Profile
              </h3>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <p className="text-xs text-neutral-500">Total Stays</p>
                  <p className="text-lg font-bold text-neutral-900">{guestCRMData.totalStays || 0}</p>
                </div>
                <div>
                  <p className="text-xs text-neutral-500">LTV</p>
                  <p className="text-lg font-bold text-[#4E5840]">₹{(guestCRMData.ltv || 0).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs text-neutral-500">Segment</p>
                  <p className="text-sm font-semibold text-neutral-900">{guestCRMData.segment || 'N/A'}</p>
                </div>
              </div>
              <button className="mt-3 flex items-center gap-1 text-xs font-medium text-[#4E5840] hover:underline">
                View Full Profile
                <ExternalLink className="w-3 h-3" />
              </button>
            </div>
          )}

          {/* Existing Response */}
          {review.responded && review.responseText && (
            <div>
              <h3 className="text-sm font-semibold text-[#4E5840] mb-2 flex items-center gap-2">
                <Check className="w-4 h-4" />
                Your Response
              </h3>
              <div className="bg-[#4E5840]/10 rounded-xl p-4 border border-[#4E5840]/20">
                <p className="text-sm text-neutral-700 whitespace-pre-wrap">
                  {review.responseText}
                </p>
              </div>
            </div>
          )}

          {/* AI Response Generator */}
          {!review.responded && (
            <div>
              <h3 className="text-sm font-semibold text-neutral-900 mb-3 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#A57865]" />
                AI Suggested Response
              </h3>

              {/* Suggested Response */}
              <div className="bg-[#A57865]/5 rounded-xl p-4 border border-[#A57865]/20 mb-3">
                <p className="text-sm text-neutral-700 whitespace-pre-wrap leading-relaxed">
                  {suggestedReply}
                </p>
                <div className="flex items-center gap-2 mt-3">
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-1 px-3 py-1.5 border border-neutral-200 rounded-lg text-xs font-medium text-neutral-700 hover:bg-neutral-50 transition-colors"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3 h-3 text-[#4E5840]" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        Copy
                      </>
                    )}
                  </button>
                  <button
                    onClick={handleUseSuggested}
                    className="flex items-center gap-1 px-3 py-1.5 bg-[#A57865] text-white rounded-lg text-xs font-medium hover:bg-[#A57865]/90 transition-colors"
                  >
                    <Edit3 className="w-3 h-3" />
                    Use & Edit
                  </button>
                </div>
              </div>

              {/* Custom Response Editor */}
              {isEditing && (
                <div>
                  <label className="text-xs font-medium text-neutral-600 mb-2 block">
                    Edit Response
                  </label>
                  <textarea
                    value={responseText}
                    onChange={(e) => setResponseText(e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2.5 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#A57865]/20 focus:border-[#A57865] resize-none"
                    placeholder="Edit your response..."
                  />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-[#E5E5E5] p-4 bg-[#FAF7F4]">
          {!review.responded ? (
            <div className="flex items-center gap-3">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2.5 border border-neutral-200 bg-white text-neutral-700 rounded-xl text-sm font-medium hover:bg-neutral-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSend}
                disabled={!responseText.trim()}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  responseText.trim()
                    ? 'bg-[#4E5840] text-white hover:bg-[#4E5840]/90'
                    : 'bg-neutral-200 text-neutral-400 cursor-not-allowed'
                }`}
              >
                <Send className="w-4 h-4" />
                Send Response
              </button>
            </div>
          ) : (
            <button
              onClick={onClose}
              className="w-full px-4 py-2.5 bg-neutral-200 text-neutral-700 rounded-xl text-sm font-medium hover:bg-neutral-300 transition-colors"
            >
              Close
            </button>
          )}
        </div>
      </div>

      <style>{`
        @keyframes slide-in-right {
          from {
            transform: translateX(100%);
          }
          to {
            transform: translateX(0);
          }
        }
        .animate-slide-in-right {
          animation: slide-in-right 0.3s ease-out;
        }
      `}</style>
    </div>
  );

  return createPortal(drawerContent, document.body);
}
