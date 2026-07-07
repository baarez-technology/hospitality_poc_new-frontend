import { useState, useMemo } from 'react';
import {
  Star,
  Calendar,
  Tag,
  MessageSquare,
  Copy,
  Check,
  Sparkles,
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
} from '../../utils/reputation';
import { Drawer } from '../ui2/Drawer';
import { Button } from '../ui2/Button';
import { Select, Textarea } from '../ui2/Input';

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
            className={`w-4 h-4 ${
              star <= rating
                ? 'text-gold-500 fill-gold-500'
                : 'text-neutral-200'
            }`}
          />
        ))}
      </div>
    );
  };

  const header = (
    <div className="flex items-center gap-3 sm:gap-4">
      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-[10px] bg-terra-500 flex items-center justify-center text-white text-sm sm:text-lg font-bold flex-shrink-0">
        {review.guestName?.split(' ').filter(n => n).map(n => n[0]).join('').substring(0, 2) || 'G'}
      </div>
      <div className="flex-1 min-w-0">
        <h2 className="text-base sm:text-lg font-semibold text-neutral-900 tracking-tight truncate">{review.guestName}</h2>
        <div className="flex items-center gap-1.5 sm:gap-2 mt-0.5 sm:mt-1 flex-wrap">
          {platform && (
            <span
              className="px-1.5 sm:px-2 py-0.5 text-[9px] sm:text-[10px] font-bold text-white rounded"
              style={{ backgroundColor: platform.color }}
            >
              {platform.name}
            </span>
          )}
          {review.responded && (
            <span className="px-1.5 sm:px-2 py-0.5 rounded text-[9px] sm:text-[10px] font-semibold bg-sage-100 text-sage-700 flex items-center gap-1">
              <CheckCircle className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
              Responded
            </span>
          )}
        </div>
      </div>
    </div>
  );

  const footer = (
    <div className="flex items-center justify-between w-full">
      <Button variant="ghost" size="sm" icon={Trash2} onClick={() => onDelete(review.id)} className="text-rose-600 hover:bg-rose-50 text-[11px] sm:text-[13px] px-2 sm:px-3">
        <span className="hidden sm:inline">Delete</span>
      </Button>
      <Button variant="ghost" onClick={onClose} className="text-[11px] sm:text-[13px] px-2 sm:px-3">
        Close
      </Button>
    </div>
  );

  return (
    <Drawer
      isOpen={!!review}
      onClose={onClose}
      header={header}
      maxWidth="max-w-xl"
      footer={footer}
    >
      <div className="space-y-4 sm:space-y-6">
        {/* Rating & Sentiment */}
        <div className="grid grid-cols-2 gap-2 sm:gap-3">
          <div className="flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 bg-neutral-50 rounded-[10px]">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-[8px] bg-gold-100 flex items-center justify-center flex-shrink-0">
              <Star className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gold-600" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] sm:text-[11px] text-neutral-500">Rating</p>
              <div className="flex items-center gap-1 sm:gap-2">
                {renderStars(review.rating)}
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
              <span className={`inline-flex items-center px-1.5 sm:px-2 py-0.5 rounded text-[10px] sm:text-[11px] font-semibold ${sentimentConfig?.bgColor} ${sentimentConfig?.textColor}`}>
                {sentimentConfig?.label}
              </span>
            </div>
          </div>
        </div>

        {/* Date & Category */}
        <div className="grid grid-cols-2 gap-2 sm:gap-3">
          <div className="flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 bg-neutral-50 rounded-[10px]">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-[8px] bg-ocean-100 flex items-center justify-center flex-shrink-0">
              <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-ocean-600" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] sm:text-[11px] text-neutral-500">Date</p>
              <p className="text-[12px] sm:text-[13px] font-semibold text-neutral-900 truncate">{formatDate(review.date)}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 bg-neutral-50 rounded-[10px]">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-[8px] bg-sage-100 flex items-center justify-center flex-shrink-0">
              <Tag className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-sage-600" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] sm:text-[11px] text-neutral-500">Category</p>
              {category && (
                <span
                  className="inline-flex items-center px-1.5 sm:px-2 py-0.5 rounded text-[10px] sm:text-[11px] font-medium text-white truncate"
                  style={{ backgroundColor: category.color }}
                >
                  {category.label}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Full Review */}
        <div>
          <p className="text-[10px] sm:text-[11px] font-semibold text-neutral-400 uppercase tracking-widest mb-1.5 sm:mb-2 flex items-center gap-1">
            <MessageSquare className="w-3 h-3" />
            Full Review
          </p>
          <div className="bg-neutral-50 rounded-[10px] p-3 sm:p-4">
            <p className="text-[12px] sm:text-[13px] text-neutral-700 whitespace-pre-wrap leading-relaxed">{review.comment}</p>
          </div>
        </div>

        {/* Highlights */}
        {review.highlights && review.highlights.length > 0 && (
          <div>
            <p className="text-[10px] sm:text-[11px] font-semibold text-neutral-400 uppercase tracking-widest mb-1.5 sm:mb-2">AI Extracted Highlights</p>
            <div className="flex flex-wrap gap-1.5 sm:gap-2">
              {review.highlights.map((highlight, index) => (
                <span
                  key={index}
                  className="px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-[11px] font-medium bg-terra-100 text-terra-700"
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
            <p className="text-[10px] sm:text-[11px] font-semibold text-sage-700 uppercase tracking-widest mb-1.5 sm:mb-2 flex items-center gap-1">
              <CheckCircle className="w-3 h-3" />
              Your Response
            </p>
            <div className="bg-sage-50 rounded-[10px] p-3 sm:p-4 border border-sage-100">
              <p className="text-[12px] sm:text-[13px] text-neutral-700 whitespace-pre-wrap">{review.response}</p>
              <p className="text-[10px] sm:text-[11px] text-neutral-500 mt-1.5 sm:mt-2">
                Responded on {formatDate(review.respondedAt)}
              </p>
            </div>
          </div>
        )}

        {/* AI Response Generator */}
        {!review.responded && (
          <div>
            <p className="text-[10px] sm:text-[11px] font-semibold text-neutral-400 uppercase tracking-widest mb-2 sm:mb-3 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-terra-600" />
              AI Response Generator
            </p>

            {/* Response Tabs */}
            <div className="flex gap-1 mb-2 sm:mb-3 bg-neutral-100 rounded-lg p-1">
              {[
                { id: 'professional', label: 'Professional' },
                { id: 'warm', label: 'Warm' },
                { id: 'short', label: 'Short' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveResponseTab(tab.id)}
                  className={`flex-1 px-2 sm:px-3 py-1.5 sm:py-2 text-[11px] sm:text-[12px] font-medium rounded-md transition-colors ${
                    activeResponseTab === tab.id
                      ? 'bg-white text-terra-600 shadow-sm'
                      : 'text-neutral-600 hover:text-neutral-900'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Response Content */}
            <div className="bg-terra-50 rounded-[10px] p-3 sm:p-4 border border-terra-100">
              <p className="text-[12px] sm:text-[13px] text-neutral-700 whitespace-pre-wrap leading-relaxed">
                {aiResponses[activeResponseTab]}
              </p>
            </div>

            {/* Response Actions */}
            <div className="flex items-center gap-2 mt-2 sm:mt-3">
              <Button
                variant="outline"
                size="sm"
                icon={copiedResponse === activeResponseTab ? Check : Copy}
                onClick={() => handleCopyResponse(activeResponseTab)}
                className="text-[10px] sm:text-[11px]"
              >
                {copiedResponse === activeResponseTab ? 'Copied!' : 'Copy'}
              </Button>
              <Button
                variant="primary"
                size="sm"
                icon={CheckCircle}
                onClick={() => onMarkResponded(review.id, aiResponses[activeResponseTab])}
                className="flex-1 text-[10px] sm:text-[11px]"
              >
                <span className="hidden sm:inline">Mark as Responded</span>
                <span className="sm:hidden">Responded</span>
              </Button>
            </div>
          </div>
        )}

        {/* Category Update */}
        <div>
          <p className="text-[10px] sm:text-[11px] font-semibold text-neutral-400 uppercase tracking-widest mb-1.5 sm:mb-2">Update Category</p>
          <Select
            value={review.category || ''}
            onChange={(e) => onUpdateCategory(review.id, e.target.value)}
            size="md"
          >
            {ISSUE_CATEGORIES.map(cat => (
              <option key={cat.value} value={cat.value}>{cat.label}</option>
            ))}
          </Select>
        </div>

        {/* Add Note */}
        <div>
          <p className="text-[10px] sm:text-[11px] font-semibold text-neutral-400 uppercase tracking-widest mb-1.5 sm:mb-2 flex items-center gap-1">
            <FileText className="w-3 h-3" />
            Add Internal Note
          </p>
          <Textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Add a note about this review..."
            rows={2}
          />
          {note.trim() && (
            <Button variant="subtle" size="sm" onClick={handleAddNote} className="mt-1.5 sm:mt-2 text-[11px] sm:text-[12px]">
              Save Note
            </Button>
          )}
        </div>
      </div>
    </Drawer>
  );
}
