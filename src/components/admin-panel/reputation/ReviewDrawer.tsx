import { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  Star,
  Calendar,
  Tag,
  MessageSquare,
  Copy,
  Check,
  Sparkles,
  Edit2,
  Trash2,
  CheckCircle,
  FileText
} from 'lucide-react';
import {
  PLATFORMS,
  ISSUE_CATEGORIES,
  SENTIMENT_CONFIG,
  getSentimentLabel,
  formatDate,
  generateAIResponses
} from '@/utils/admin/reputation';

export default function ReviewDrawer({
  review,
  onClose,
  onMarkResponded,
  onUpdateCategory,
  onDelete,
  onAddNote
}) {
  const [activeResponseTab, setActiveResponseTab] = useState('professional');
  const [copiedResponse, setCopiedResponse] = useState(null);
  const [note, setNote] = useState('');

  const aiResponses = useMemo(() => {
    if (!review) return { professional: '', warm: '', short: '' };
    return generateAIResponses(review);
  }, [review]);

  if (!review) return null;

  const platform = PLATFORMS.find(p => p.id === review.platform);
  const sentiment = getSentimentLabel(review.sentimentScore);
  const sentimentConfig = SENTIMENT_CONFIG[sentiment];
  const category = ISSUE_CATEGORIES.find(c => c.value === review.category);

  const handleCopyResponse = (type) => {
    navigator.clipboard.writeText(aiResponses[type]);
    setCopiedResponse(type);
    setTimeout(() => setCopiedResponse(null), 2000);
  };

  const handleAddNote = () => {
    if (note.trim()) {
      onAddNote(review.id, note.trim());
      setNote('');
    }
  };

  const renderStars = (rating) => {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-5 h-5 ${
              star <= rating
                ? 'text-[#CDB261] fill-[#CDB261]'
                : 'text-neutral-200'
            }`}
          />
        ))}
      </div>
    );
  };

  const drawerContent = (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="relative w-full max-w-[420px] bg-white shadow-2xl flex flex-col animate-slide-in-right">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-neutral-200 bg-[#FAF8F6]">
          <div>
            <h2 className="text-lg font-bold text-neutral-900">Review Details</h2>
            <p className="text-sm text-neutral-500">{review.id}</p>
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
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#A57865] to-[#8E6554] flex items-center justify-center text-white text-xl font-bold">
              {review.guestName?.split(' ').filter(n => n).map(n => n[0]).join('') || 'G'}
            </div>
            <div>
              <p className="font-bold text-neutral-900 text-lg">{review.guestName}</p>
              <div className="flex items-center gap-2 mt-1">
                {platform && (
                  <span
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold text-white"
                    style={{ backgroundColor: platform.color }}
                  >
                    {platform.icon} {platform.name}
                  </span>
                )}
                {review.responded && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold bg-[#4E5840]/15 text-[#4E5840]">
                    <CheckCircle className="w-3 h-3" />
                    Responded
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Rating & Sentiment */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-neutral-50 rounded-lg p-3">
              <div className="flex items-center gap-2 text-neutral-500 mb-2">
                <Star className="w-4 h-4" />
                <span className="text-xs font-medium">Rating</span>
              </div>
              {renderStars(review.rating)}
              <p className="text-sm font-semibold text-neutral-900 mt-1">{review.rating}/5</p>
            </div>
            <div className="bg-neutral-50 rounded-lg p-3">
              <div className="flex items-center gap-2 text-neutral-500 mb-2">
                <Sparkles className="w-4 h-4" />
                <span className="text-xs font-medium">Sentiment</span>
              </div>
              <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-sm font-semibold ${sentimentConfig.bgColor} ${sentimentConfig.textColor}`}>
                {sentimentConfig.label}
              </span>
              <p className="text-sm text-neutral-500 mt-1">{review.sentimentScore}/100</p>
            </div>
          </div>

          {/* Date & Category */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-neutral-50 rounded-lg p-3">
              <div className="flex items-center gap-2 text-neutral-500 mb-1">
                <Calendar className="w-4 h-4" />
                <span className="text-xs font-medium">Date</span>
              </div>
              <p className="font-semibold text-neutral-900">{formatDate(review.date)}</p>
            </div>
            <div className="bg-neutral-50 rounded-lg p-3">
              <div className="flex items-center gap-2 text-neutral-500 mb-1">
                <Tag className="w-4 h-4" />
                <span className="text-xs font-medium">Category</span>
              </div>
              {category && (
                <span
                  className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium text-white"
                  style={{ backgroundColor: category.color }}
                >
                  {category.label}
                </span>
              )}
            </div>
          </div>

          {/* Full Review */}
          <div>
            <h3 className="text-sm font-semibold text-neutral-900 mb-2 flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              Full Review
            </h3>
            <div className="bg-neutral-50 rounded-lg p-4">
              <p className="text-sm text-neutral-700 whitespace-pre-wrap">{review.comment}</p>
            </div>
          </div>

          {/* Highlights */}
          {review.highlights && review.highlights.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-neutral-900 mb-2">AI Extracted Highlights</h3>
              <div className="flex flex-wrap gap-2">
                {review.highlights.map((highlight, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-[#A57865]/10 text-[#A57865]"
                  >
                    {highlight}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Existing Response */}
          {review.responded && review.response && (
            <div>
              <h3 className="text-sm font-semibold text-neutral-900 mb-2 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-[#4E5840]" />
                Your Response
              </h3>
              <div className="bg-[#4E5840]/10 rounded-lg p-4">
                <p className="text-sm text-neutral-700 whitespace-pre-wrap">{review.response}</p>
                <p className="text-xs text-neutral-500 mt-2">
                  Responded on {formatDate(review.respondedAt)}
                </p>
              </div>
            </div>
          )}

          {/* AI Response Generator */}
          {!review.responded && (
            <div>
              <h3 className="text-sm font-semibold text-neutral-900 mb-3 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#A57865]" />
                AI Response Generator
              </h3>

              {/* Response Tabs */}
              <div className="flex gap-1 mb-3 bg-neutral-100 rounded-lg p-1">
                {[
                  { id: 'professional', label: 'Professional' },
                  { id: 'warm', label: 'Warm & Empathetic' },
                  { id: 'short', label: 'Short & Direct' }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveResponseTab(tab.id)}
                    className={`flex-1 px-3 py-2 text-xs font-medium rounded-md transition-colors ${
                      activeResponseTab === tab.id
                        ? 'bg-white text-[#A57865] shadow-sm'
                        : 'text-neutral-600 hover:text-neutral-900'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Response Content */}
              <div className="bg-[#FAF8F6] rounded-lg p-4 border border-[#A57865]/20">
                <p className="text-sm text-neutral-700 whitespace-pre-wrap">
                  {aiResponses[activeResponseTab]}
                </p>
              </div>

              {/* Response Actions */}
              <div className="flex items-center gap-2 mt-3">
                <button
                  onClick={() => handleCopyResponse(activeResponseTab)}
                  className="flex items-center gap-2 px-4 py-2 border border-neutral-200 rounded-lg text-sm font-medium text-neutral-700 hover:bg-neutral-50 transition-colors"
                >
                  {copiedResponse === activeResponseTab ? (
                    <>
                      <Check className="w-4 h-4 text-[#4E5840]" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      Copy
                    </>
                  )}
                </button>
                <button
                  onClick={() => onMarkResponded(review.id, aiResponses[activeResponseTab])}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-[#A57865] text-white rounded-lg text-sm font-medium hover:bg-[#A57865]/90 transition-colors"
                >
                  <CheckCircle className="w-4 h-4" />
                  Mark as Responded
                </button>
              </div>
            </div>
          )}

          {/* Category Update */}
          <div>
            <h3 className="text-sm font-semibold text-neutral-900 mb-2">Update Category</h3>
            <select
              value={review.category || ''}
              onChange={(e) => onUpdateCategory(review.id, e.target.value)}
              className="w-full px-3 py-2.5 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#A57865]/20 focus:border-[#A57865] bg-white"
            >
              {ISSUE_CATEGORIES.map(cat => (
                <option key={cat.value} value={cat.value}>{cat.label}</option>
              ))}
            </select>
          </div>

          {/* Add Note */}
          <div>
            <h3 className="text-sm font-semibold text-neutral-900 mb-2 flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Add Internal Note
            </h3>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Add a note about this review..."
              rows={2}
              className="w-full px-3 py-2.5 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#A57865]/20 focus:border-[#A57865] resize-none"
            />
            {note.trim() && (
              <button
                onClick={handleAddNote}
                className="mt-2 px-4 py-2 bg-neutral-100 text-neutral-700 rounded-lg text-sm font-medium hover:bg-neutral-200 transition-colors"
              >
                Save Note
              </button>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-neutral-200 p-4 bg-[#FAF8F6]">
          <div className="flex items-center gap-3">
            <button
              onClick={() => onDelete(review.id)}
              className="flex items-center gap-2 px-4 py-2 border border-red-200 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              Delete Review
            </button>
            <div className="flex-1" />
            <button
              onClick={onClose}
              className="px-4 py-2 bg-neutral-200 text-neutral-700 rounded-lg text-sm font-medium hover:bg-neutral-300 transition-colors"
            >
              Close
            </button>
          </div>
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
