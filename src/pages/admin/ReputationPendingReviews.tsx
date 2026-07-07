import { useState, useMemo, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPortal } from 'react-dom';
import toast from 'react-hot-toast';
import {
  MessageSquare,
  Wand2,
  Star,
  Clock,
  Send,
  Loader2,
  ArrowLeft,
  Search,
  Filter,
  X,
  ChevronDown,
  Check,
  CheckCircle,
  Calendar,
  ExternalLink
} from 'lucide-react';
import { ReputationProvider, useReputation } from '../../contexts/ReputationContext';
import { Drawer } from '../../components/ui2/Drawer';
import { Button } from '../../components/ui2/Button';
import { Textarea } from '../../components/ui2/Input';

// ── Review Draft Drawer ──────────────────────────────────────────

interface ReviewDraftDrawerProps {
  isOpen: boolean;
  review: any;
  onClose: () => void;
  onApprove: (text: string) => Promise<void>;
  isPublishing?: boolean;
}

function ReviewDraftDrawer({ isOpen, review, onClose, onApprove, isPublishing }: ReviewDraftDrawerProps) {
  const { generateDraft } = useReputation();
  const [draft, setDraft] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [tone, setTone] = useState('professional');
  const [editedText, setEditedText] = useState('');

  if (!review) return null;

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const result = await generateDraft(review.id, tone, true);
      const text = result?.draft_text || result?.text || '';
      setDraft(text);
      setEditedText(text);
    } catch (error) {
      console.error('Failed to generate draft:', error);
      toast.error('Failed to generate AI response');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleClose = () => {
    setDraft('');
    setEditedText('');
    setTone('professional');
    onClose();
  };

  const handlePublish = async () => {
    if (!editedText.trim()) return;
    await onApprove(editedText);
    setDraft('');
    setEditedText('');
    setTone('professional');
  };

  const toneOptions = [
    { value: 'professional', label: 'Professional' },
    { value: 'empathetic', label: 'Empathetic' },
    { value: 'concise', label: 'Concise' },
    { value: 'friendly', label: 'Friendly' },
  ];

  const footer = (
    <div className="flex items-center justify-end gap-3 w-full">
      <Button variant="outline" onClick={handleClose} disabled={isPublishing}>Cancel</Button>
      {draft && (
        <Button variant="primary" icon={Send} onClick={handlePublish} loading={isPublishing} disabled={!editedText.trim() || isPublishing}>
          Publish Response
        </Button>
      )}
    </div>
  );

  const isResponded = review._responded || review.responded;
  const existingResponse = review.responseText || review.response_text || '';

  return (
    <Drawer
      isOpen={isOpen}
      onClose={handleClose}
      title={isResponded ? 'View Response' : 'Generate Response'}
      subtitle={isResponded ? `Response for ${review._guest || review.guest_name || 'Guest'}` : `AI-powered response for ${review._guest || review.guest_name || 'Guest'}`}
      maxWidth="max-w-xl"
      footer={isResponded ? (
        <div className="flex items-center justify-end w-full">
          <Button variant="outline" onClick={handleClose}>Close</Button>
        </div>
      ) : footer}
    >
      <div className="space-y-6">
        {/* Original Review */}
        <div>
          <p className="text-[11px] font-semibold text-neutral-400 uppercase tracking-widest mb-2">Original Review</p>
          <div className="bg-neutral-50 rounded-[10px] p-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} className={`w-3.5 h-3.5 ${s <= review.rating ? 'fill-gold-500 text-gold-500' : 'text-neutral-300'}`} />
                ))}
              </div>
              <span className="text-[11px] text-neutral-500 px-2 py-0.5 bg-neutral-200 rounded-full font-medium">
                {review._source || review.source || 'Direct'}
              </span>
            </div>
            <p className="text-[13px] text-neutral-700 leading-relaxed">{review._content || review.content || review.comment || review.review || review.text}</p>
            <p className="text-[11px] text-neutral-500 mt-3 font-medium">
              {review._guest || review.guest_name || review.guest || `Guest ${review.id}`} • {(() => {
                const dateStr = review._date || review.review_date || review.created_at || review.date;
                if (!dateStr) return 'No date';
                const d = new Date(dateStr);
                return isNaN(d.getTime()) ? 'No date' : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
              })()}
            </p>
          </div>
        </div>

        {/* Already Responded — show existing response */}
        {isResponded && existingResponse && (
          <div>
            <p className="text-[11px] font-semibold text-neutral-400 uppercase tracking-widest mb-2">Published Response</p>
            <div className="bg-[#4E5840]/5 rounded-[10px] p-4 border border-[#4E5840]/10">
              <p className="text-[13px] text-neutral-700 leading-relaxed">{existingResponse}</p>
              {review.responseDate || review.response_date ? (
                <p className="text-[11px] text-neutral-400 mt-3 flex items-center gap-1">
                  <CheckCircle className="w-3 h-3 text-[#4E5840]" />
                  Responded on {new Date(review.responseDate || review.response_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </p>
              ) : null}
            </div>
          </div>
        )}

        {/* Pending — show generate workflow */}
        {!isResponded && (
          <>
            {/* Tone Selector */}
            <div>
              <p className="text-[11px] font-semibold text-neutral-400 uppercase tracking-widest mb-2">Response Tone</p>
              <div className="flex flex-wrap gap-2">
                {toneOptions.map((t) => (
                  <button
                    key={t.value}
                    onClick={() => setTone(t.value)}
                    className={`px-3 py-1.5 rounded-[8px] text-[12px] font-medium transition-colors ${
                      tone === t.value
                        ? 'bg-terra-500 text-white'
                        : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Generate Button */}
            {!draft && (
              <Button variant="primary" icon={isGenerating ? Loader2 : Wand2} onClick={handleGenerate} disabled={isGenerating} fullWidth className={isGenerating ? '[&>svg]:animate-spin' : ''}>
                {isGenerating ? 'Generating...' : 'Generate AI Response'}
              </Button>
            )}

            {/* Generated Draft */}
            {draft && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-[11px] font-semibold text-neutral-400 uppercase tracking-widest">Generated Response</p>
                  <Button variant="ghost" size="xs" icon={isGenerating ? Loader2 : Wand2} onClick={handleGenerate} disabled={isGenerating} className={isGenerating ? '[&>svg]:animate-spin' : ''}>
                    Regenerate
                  </Button>
                </div>
                <Textarea value={editedText} onChange={(e) => setEditedText(e.target.value)} rows={6} className="w-full" />
              </div>
            )}
          </>
        )}
      </div>
    </Drawer>
  );
}

// ── Filter Select Dropdown ───────────────────────────────────────

const SOURCE_OPTIONS = [
  { value: 'all', label: 'All Sources' },
  { value: 'booking.com', label: 'Booking.com' },
  { value: 'google', label: 'Google' },
  { value: 'expedia', label: 'Expedia' },
  { value: 'tripadvisor', label: 'Tripadvisor' },
  { value: 'agoda', label: 'Agoda' }
];

const RATING_OPTIONS = [
  { value: 'all', label: 'All Ratings' },
  { value: '5', label: '5 Stars' },
  { value: '4', label: '4 Stars' },
  { value: '3', label: '3 Stars' },
  { value: '2', label: '2 Stars' },
  { value: '1', label: '1 Star' }
];

const SENTIMENT_OPTIONS = [
  { value: 'all', label: 'All Sentiments' },
  { value: 'positive', label: 'Positive' },
  { value: 'neutral', label: 'Neutral' },
  { value: 'negative', label: 'Negative' }
];

const SOURCE_COLORS: Record<string, string> = {
  'Booking.com': '#003580',
  'Google': '#4285F4',
  'Expedia': '#FFCC00',
  'Tripadvisor': '#34E0A1',
  'Agoda': '#5C2D91'
};

function DrawerFilterSelect({ label, value, onChange, options }: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState<{ top: number; left: number; width: number } | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const selectedOption = options.find(opt => opt.value === value);
  const displayLabel = value === 'all' ? 'All' : selectedOption?.label;

  const handleToggle = () => {
    if (isOpen) {
      setIsOpen(false);
      setPosition(null);
    } else if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setPosition({ top: rect.bottom + 4, left: rect.left, width: rect.width });
      setIsOpen(true);
    }
  };

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (
        triggerRef.current && !triggerRef.current.contains(e.target as Node) &&
        menuRef.current && !menuRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
        setPosition(null);
      }
    };
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { setIsOpen(false); setPosition(null); }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEsc);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEsc);
    };
  }, [isOpen]);

  return (
    <div className="space-y-2">
      <label className="text-[11px] font-semibold text-neutral-400 uppercase tracking-widest">
        {label}
      </label>
      <button
        ref={triggerRef}
        type="button"
        onClick={handleToggle}
        className={`w-full h-10 px-4 rounded-[8px] text-[13px] bg-white border transition-all flex items-center justify-between ${
          isOpen
            ? 'border-terra-400 ring-2 ring-terra-500/10'
            : 'border-neutral-200 hover:border-neutral-300'
        }`}
      >
        <span className={value === 'all' ? 'text-neutral-400' : 'text-neutral-900'}>{displayLabel}</span>
        <ChevronDown className={`w-4 h-4 text-neutral-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && position && createPortal(
        <div
          ref={menuRef}
          style={{
            position: 'fixed',
            top: `${position.top}px`,
            left: `${position.left}px`,
            width: `${position.width}px`,
            zIndex: 9999,
          }}
          className="bg-white rounded-[8px] border border-neutral-200 shadow-lg shadow-neutral-900/10 overflow-hidden max-h-48 overflow-y-auto"
        >
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
                setPosition(null);
              }}
              className={`w-full px-4 py-2.5 text-[13px] text-left hover:bg-neutral-50 transition-colors flex items-center justify-between ${
                value === option.value ? 'bg-terra-50 text-terra-700' : 'text-neutral-700'
              }`}
            >
              {option.label}
              {value === option.value && (
                <Check className="w-4 h-4 text-terra-500" />
              )}
            </button>
          ))}
        </div>,
        document.body
      )}
    </div>
  );
}

// ── Sentiment Badge ──────────────────────────────────────────────

const getSentimentBadge = (sentimentScore: number | undefined, sentimentLabel?: string) => {
  if (typeof sentimentScore === 'number' && !isNaN(sentimentScore)) {
    if (sentimentScore >= 70) return { bg: 'bg-[#4E5840]/15', text: 'text-[#4E5840]', label: 'Positive' };
    if (sentimentScore >= 40) return { bg: 'bg-[#C8B29D]/20', text: 'text-[#C8B29D]', label: 'Neutral' };
    return { bg: 'bg-[#CDB261]/20', text: 'text-[#CDB261]', label: 'Negative' };
  }
  if (sentimentLabel) {
    const l = sentimentLabel.toLowerCase();
    if (l === 'positive') return { bg: 'bg-[#4E5840]/15', text: 'text-[#4E5840]', label: 'Positive' };
    if (l === 'negative') return { bg: 'bg-[#CDB261]/20', text: 'text-[#CDB261]', label: 'Negative' };
    return { bg: 'bg-[#C8B29D]/20', text: 'text-[#C8B29D]', label: 'Neutral' };
  }
  return { bg: 'bg-[#C8B29D]/20', text: 'text-[#C8B29D]', label: 'Neutral' };
};

// ── Main Page Content ────────────────────────────────────────────

function ReputationReviewsContent() {
  const navigate = useNavigate();
  const {
    reviews,
    pendingReviews,
    fetchPendingReviews,
    addReviewResponse,
    isLoading
  } = useReputation();

  const [selectedReview, setSelectedReview] = useState<any>(null);
  const [tab, setTab] = useState<'all' | 'pending' | 'responded'>('all');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
  const [localFilters, setLocalFilters] = useState({
    source: 'all',
    rating: 'all',
    sentimentRange: 'all',
  });

  // Helper: derive sentiment score from rating for pending reviews that lack it
  const deriveSentiment = (r: any) => {
    if (typeof r.sentiment_score === 'number' && !isNaN(r.sentiment_score)) return r.sentiment_score;
    if (typeof r.sentiment === 'number' && !isNaN(r.sentiment)) return r.sentiment;
    if (r.rating >= 4) return 85;
    if (r.rating >= 3) return 55;
    return 25;
  };

  // Normalize both data sources into a unified shape
  const allReviews = useMemo(() => {
    const reviewMap = new Map<number, any>();

    // Add all reviews (unfiltered from context)
    reviews.forEach((r: any) => {
      reviewMap.set(r.id, {
        ...r,
        _guest: r.guest_name || r.guest || `Guest ${r.id}`,
        _content: r.content || r.comment || r.review || r.text || '',
        _title: r.title || '',
        _date: r.review_date || r.created_at || r.date || '',
        _source: r.source || 'Direct',
        _sentimentScore: deriveSentiment(r),
        _sentimentLabel: r.sentiment_label ?? r.sentimentLabel,
        _keywords: r.keywords || [],
        _responded: r.responded ?? false,
      });
    });

    // Add pending reviews (may overlap with reviews above)
    pendingReviews.forEach((r: any) => {
      if (!reviewMap.has(r.id)) {
        reviewMap.set(r.id, {
          ...r,
          _guest: r.guest_name || r.guest || `Guest ${r.id}`,
          _content: r.content || r.comment || r.review || r.text || '',
          _title: r.title || '',
          _date: r.review_date || r.created_at || r.date || '',
          _source: r.source || 'Direct',
          _sentimentScore: deriveSentiment(r),
          _sentimentLabel: r.sentiment_label ?? r.sentimentLabel,
          _keywords: r.keywords || [],
          _responded: false,
        });
      }
    });

    return Array.from(reviewMap.values())
      .sort((a, b) => new Date(b._date).getTime() - new Date(a._date).getTime());
  }, [reviews, pendingReviews]);

  // Apply ALL filters locally (source, rating, sentiment, keyword, tab)
  const displayedReviews = useMemo(() => {
    let list = allReviews;

    // Source filter
    if (localFilters.source !== 'all') {
      list = list.filter(r => r._source.toLowerCase() === localFilters.source.toLowerCase());
    }

    // Rating filter
    if (localFilters.rating !== 'all') {
      const ratingNum = parseFloat(localFilters.rating);
      list = list.filter(r => r.rating >= ratingNum && r.rating < ratingNum + 1);
    }

    // Sentiment filter
    if (localFilters.sentimentRange !== 'all') {
      list = list.filter(r => {
        const score = r._sentimentScore;
        if (localFilters.sentimentRange === 'positive') return score >= 70;
        if (localFilters.sentimentRange === 'negative') return score < 40;
        if (localFilters.sentimentRange === 'neutral') return score >= 40 && score < 70;
        return true;
      });
    }

    // Tab filter
    if (tab === 'pending') {
      list = list.filter(r => !r._responded);
    } else if (tab === 'responded') {
      list = list.filter(r => r._responded);
    }

    // Search keyword
    if (searchKeyword.trim()) {
      const kw = searchKeyword.toLowerCase();
      list = list.filter(r =>
        r._guest.toLowerCase().includes(kw) ||
        r._content.toLowerCase().includes(kw) ||
        r._title.toLowerCase().includes(kw) ||
        r._source.toLowerCase().includes(kw) ||
        r._keywords.some((k: string) => k.toLowerCase().includes(kw))
      );
    }

    return list;
  }, [allReviews, localFilters, tab, searchKeyword]);

  // Counts for tabs (based on filtered-by-source/rating/sentiment, NOT tab)
  const filteredByDropdowns = useMemo(() => {
    let list = allReviews;
    if (localFilters.source !== 'all') {
      list = list.filter(r => r._source.toLowerCase() === localFilters.source.toLowerCase());
    }
    if (localFilters.rating !== 'all') {
      const ratingNum = parseFloat(localFilters.rating);
      list = list.filter(r => r.rating >= ratingNum && r.rating < ratingNum + 1);
    }
    if (localFilters.sentimentRange !== 'all') {
      list = list.filter(r => {
        const score = r._sentimentScore;
        if (localFilters.sentimentRange === 'positive') return score >= 70;
        if (localFilters.sentimentRange === 'negative') return score < 40;
        if (localFilters.sentimentRange === 'neutral') return score >= 40 && score < 70;
        return true;
      });
    }
    if (searchKeyword.trim()) {
      const kw = searchKeyword.toLowerCase();
      list = list.filter(r =>
        r._guest.toLowerCase().includes(kw) ||
        r._content.toLowerCase().includes(kw) ||
        r._title.toLowerCase().includes(kw) ||
        r._source.toLowerCase().includes(kw) ||
        r._keywords.some((k: string) => k.toLowerCase().includes(kw))
      );
    }
    return list;
  }, [allReviews, localFilters, searchKeyword]);

  const allCount = filteredByDropdowns.length;
  const pendingCount = filteredByDropdowns.filter(r => !r._responded).length;
  const respondedCount = filteredByDropdowns.filter(r => r._responded).length;

  // Active filter count (excluding search)
  const activeFilterCount = [
    localFilters.source !== 'all',
    localFilters.rating !== 'all',
    localFilters.sentimentRange !== 'all'
  ].filter(Boolean).length;

  const handleApplyFilters = () => {
    setIsFilterDrawerOpen(false);
  };

  const handleClearFilters = () => {
    setLocalFilters({ source: 'all', rating: 'all', sentimentRange: 'all' });
    setSearchKeyword('');
  };

  const handleSearchChange = (value: string) => {
    setSearchKeyword(value);
  };

  const [isPublishing, setIsPublishing] = useState(false);

  const handleApprove = async (text: string) => {
    if (!selectedReview || !text.trim()) return;
    setIsPublishing(true);
    try {
      await addReviewResponse(selectedReview.id, text.trim());
      toast.success('Response published successfully');
      setSelectedReview(null);
    } catch (error) {
      console.error('Failed to publish response:', error);
      toast.error('Failed to publish response');
    } finally {
      setIsPublishing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#F9F7F7' }}>
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-terra-500 animate-spin mx-auto mb-2" />
          <p className="text-neutral-600">Loading reviews...</p>
        </div>
      </div>
    );
  }

  // Filter drawer header & footer
  const filterDrawerHeader = (
    <div className="flex-1 min-w-0">
      <h2 className="text-lg font-semibold text-neutral-900 tracking-tight">Filters</h2>
      <p className="text-[13px] text-neutral-500 mt-1">Filter reviews by source, rating, and sentiment</p>
    </div>
  );

  const filterDrawerFooter = (
    <div className="flex items-center justify-end gap-3">
      <Button variant="outline" onClick={handleClearFilters} disabled={activeFilterCount === 0}>
        Clear All
      </Button>
      <Button variant="primary" onClick={handleApplyFilters}>
        Apply Filters
      </Button>
    </div>
  );

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F9F7F7' }}>
      <div className="px-4 sm:px-6 lg:px-10 py-4 sm:py-6 space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
          <div className="flex items-center gap-3 sm:gap-4">
            <button
              onClick={() => navigate('/admin/reputation')}
              className="flex-shrink-0"
            >
              <ArrowLeft className="w-5 h-5 text-neutral-500 hover:text-neutral-700 transition-colors" />
            </button>
            <div>
              <h1 className="text-lg sm:text-xl font-semibold text-neutral-900">All Reviews</h1>
              <p className="text-[12px] sm:text-[13px] text-neutral-500">Manage and respond to guest reviews</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1.5 bg-gold-100 text-gold-700 rounded-full text-[12px] font-semibold">
              {pendingCount} pending
            </span>
            <span className="px-3 py-1.5 bg-sage-100 text-sage-700 rounded-full text-[12px] font-semibold">
              {respondedCount} responded
            </span>
          </div>
        </div>

        {/* Search & Filters Bar */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Search */}
          <div className="relative flex-1 min-w-0 sm:min-w-[200px] sm:max-w-md">
            <Search className="absolute left-3 sm:left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 sm:w-4 sm:h-4 text-neutral-400" />
            <input
              type="text"
              placeholder="Search reviews..."
              value={searchKeyword}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full h-8 sm:h-9 pl-8 sm:pl-10 pr-3 sm:pr-4 border border-neutral-200 rounded-[8px] text-[12px] sm:text-[13px] text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-terra-500/10 focus:border-terra-400 hover:border-neutral-300 bg-white transition-all"
            />
            {searchKeyword && (
              <button
                onClick={() => handleSearchChange('')}
                className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 p-1 rounded-[6px] hover:bg-neutral-100 transition-colors"
              >
                <X className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-neutral-400" />
              </button>
            )}
          </div>

          {/* Filter Button */}
          <button
            onClick={() => setIsFilterDrawerOpen(true)}
            className={`h-8 sm:h-9 px-2.5 sm:px-3.5 rounded-[8px] text-[12px] sm:text-[13px] font-medium flex items-center gap-1.5 sm:gap-2 transition-all duration-150 flex-shrink-0 ${
              activeFilterCount > 0
                ? 'bg-terra-50 border border-terra-300 text-terra-700'
                : 'bg-white border border-neutral-200 text-neutral-600 hover:border-neutral-300'
            }`}
          >
            <Filter className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${activeFilterCount > 0 ? 'text-terra-500' : ''}`} />
            <span className="hidden sm:inline">Filters</span>
            {activeFilterCount > 0 && (
              <span className="min-w-[16px] h-[16px] sm:min-w-[18px] sm:h-[18px] px-1 rounded-full bg-terra-500 text-white text-[10px] sm:text-[11px] font-semibold flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-white rounded-[10px] border border-neutral-200 p-4">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-8 h-8 rounded-[8px] bg-neutral-100 flex items-center justify-center flex-shrink-0">
                <MessageSquare className="w-4 h-4 text-neutral-600" />
              </div>
              <p className="text-[11px] font-semibold text-neutral-400 uppercase tracking-widest">Total Reviews</p>
            </div>
            <p className="text-xl font-bold text-neutral-900">{allCount}</p>
          </div>
          <div className="bg-white rounded-[10px] border border-neutral-200 p-4">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-8 h-8 rounded-[8px] bg-[#CDB261]/10 flex items-center justify-center flex-shrink-0">
                <Clock className="w-4 h-4 text-[#CDB261]" />
              </div>
              <p className="text-[11px] font-semibold text-neutral-400 uppercase tracking-widest">Pending</p>
            </div>
            <p className="text-xl font-bold text-[#CDB261]">{pendingCount}</p>
          </div>
          <div className="bg-white rounded-[10px] border border-neutral-200 p-4">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-8 h-8 rounded-[8px] bg-[#4E5840]/10 flex items-center justify-center flex-shrink-0">
                <CheckCircle className="w-4 h-4 text-[#4E5840]" />
              </div>
              <p className="text-[11px] font-semibold text-neutral-400 uppercase tracking-widest">Responded</p>
            </div>
            <p className="text-xl font-bold text-[#4E5840]">{respondedCount}</p>
          </div>
          <div className="bg-white rounded-[10px] border border-neutral-200 p-4">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-8 h-8 rounded-[8px] bg-[#A57865]/10 flex items-center justify-center flex-shrink-0">
                <Star className="w-4 h-4 text-[#A57865]" />
              </div>
              <p className="text-[11px] font-semibold text-neutral-400 uppercase tracking-widest">Avg Rating</p>
            </div>
            <p className="text-xl font-bold text-[#A57865]">
              {allReviews.length > 0 ? (allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length).toFixed(1) : '0.0'}
            </p>
          </div>
        </div>

        {/* Tab Filter */}
        <div className="bg-white rounded-[10px] border border-neutral-200">
          <div className="px-2 sm:px-5 overflow-x-auto scrollbar-hide">
            <div className="flex items-center gap-1 min-w-max">
              {[
                { id: 'all' as const, label: 'All Reviews', count: allCount },
                { id: 'pending' as const, label: 'Pending', count: pendingCount },
                { id: 'responded' as const, label: 'Responded', count: respondedCount },
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={`relative px-3 sm:px-4 py-3 sm:py-3.5 text-[11px] sm:text-[13px] font-semibold transition-all duration-150 whitespace-nowrap flex items-center gap-1.5 ${
                    tab === t.id
                      ? 'text-[#A57865]'
                      : 'text-neutral-400 hover:text-neutral-600'
                  }`}
                >
                  {t.label}
                  <span className={`text-[10px] sm:text-[11px] px-1.5 py-0.5 rounded-full font-semibold ${
                    tab === t.id
                      ? 'bg-[#A57865]/10 text-[#A57865]'
                      : 'bg-neutral-100 text-neutral-400'
                  }`}>
                    {t.count}
                  </span>
                  {tab === t.id && (
                    <span className="absolute bottom-0 left-2 right-2 h-[2px] bg-[#A57865] rounded-t-full" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Reviews List */}
        {displayedReviews.length > 0 ? (
          <div className="space-y-3">
            {displayedReviews.map((review: any) => {
              const sentimentStyle = getSentimentBadge(review._sentimentScore, review._sentimentLabel);
              const sourceColor = SOURCE_COLORS[review._source] || '#A57865';

              return (
                <div
                  key={review.id}
                  className="bg-white rounded-[10px] border border-neutral-200 p-5 hover:border-neutral-300 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      {/* Top badges row */}
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        {/* Source Badge */}
                        <span
                          className="px-2 py-0.5 text-[10px] font-bold text-white rounded-full"
                          style={{ backgroundColor: sourceColor }}
                        >
                          {review._source}
                        </span>
                        {/* Star Rating */}
                        <div className="flex items-center gap-0.5">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star
                              key={s}
                              className={`w-3.5 h-3.5 ${s <= review.rating ? 'fill-gold-500 text-gold-500' : 'text-neutral-300'}`}
                            />
                          ))}
                          <span className="ml-1 text-[12px] font-semibold text-neutral-700">{review.rating.toFixed(1)}</span>
                        </div>
                        {/* Sentiment Badge */}
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${sentimentStyle.bg} ${sentimentStyle.text}`}>
                          {sentimentStyle.label}
                        </span>
                        {/* Status Badge */}
                        {review._responded ? (
                          <span className="flex items-center gap-1 px-2 py-0.5 bg-sage-100 text-sage-700 text-[10px] font-medium rounded-full">
                            <CheckCircle className="w-3 h-3" />
                            Responded
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 px-2 py-0.5 bg-gold-100 text-gold-700 text-[10px] font-medium rounded-full">
                            <Clock className="w-3 h-3" />
                            Pending
                          </span>
                        )}
                      </div>

                      {/* Guest Name */}
                      <p className="text-[13px] font-semibold text-neutral-900 mb-1">{review._guest}</p>

                      {/* Review Title */}
                      {review._title && (
                        <p className="text-[13px] font-medium text-neutral-700 mb-1">"{review._title}"</p>
                      )}

                      {/* Review Content */}
                      <p className="text-[12px] text-neutral-500 line-clamp-2">
                        {review._content}
                      </p>

                      {/* Keywords */}
                      {review._keywords && review._keywords.length > 0 && (
                        <div className="flex items-center gap-1 mt-2 flex-wrap">
                          {review._keywords.slice(0, 4).map((keyword: string, i: number) => (
                            <span
                              key={i}
                              className="px-2 py-0.5 bg-neutral-200/60 text-neutral-600 text-[10px] rounded-full font-medium"
                            >
                              {keyword}
                            </span>
                          ))}
                          {review._keywords.length > 4 && (
                            <span className="text-[10px] text-neutral-400">
                              +{review._keywords.length - 4} more
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Right Side */}
                    <div className="flex flex-col items-end gap-2 flex-shrink-0">
                      <div className="flex items-center gap-1 text-[11px] text-neutral-400">
                        <Calendar className="w-3 h-3" />
                        {(() => {
                          if (!review._date) return 'No date';
                          const d = new Date(review._date);
                          return isNaN(d.getTime()) ? 'No date' : d.toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          });
                        })()}
                      </div>

                      <Button
                        variant="primary"
                        size="xs"
                        iconRight={review._responded ? ExternalLink : Wand2}
                        onClick={() => setSelectedReview(review)}
                      >
                        {review._responded ? 'View' : 'Respond'}
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-[10px] border border-neutral-200 py-16 text-center">
            <div className="w-16 h-16 rounded-[10px] bg-neutral-100 flex items-center justify-center mx-auto mb-4">
              <MessageSquare className="w-8 h-8 text-neutral-300" />
            </div>
            <p className="text-[15px] font-medium text-neutral-600 mb-1">
              {tab === 'all' ? 'No reviews found' : tab === 'pending' ? 'All caught up!' : 'No responded reviews yet'}
            </p>
            <p className="text-[13px] text-neutral-400">
              {searchKeyword || activeFilterCount > 0
                ? 'Try adjusting your search or filters'
                : tab === 'pending'
                  ? 'No reviews need responses right now'
                  : 'Reviews will appear here as they come in'}
            </p>
            {(searchKeyword || activeFilterCount > 0) && (
              <Button variant="outline" size="sm" onClick={handleClearFilters} className="mt-4">
                Clear Filters
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Filter Drawer */}
      <Drawer
        isOpen={isFilterDrawerOpen}
        onClose={() => setIsFilterDrawerOpen(false)}
        header={filterDrawerHeader}
        footer={filterDrawerFooter}
        maxWidth="max-w-sm"
      >
        <div className="space-y-5">
          <DrawerFilterSelect
            label="Source"
            value={localFilters.source}
            onChange={(value) => setLocalFilters(prev => ({ ...prev, source: value }))}
            options={SOURCE_OPTIONS}
          />
          <DrawerFilterSelect
            label="Rating"
            value={localFilters.rating}
            onChange={(value) => setLocalFilters(prev => ({ ...prev, rating: value }))}
            options={RATING_OPTIONS}
          />
          <DrawerFilterSelect
            label="Sentiment"
            value={localFilters.sentimentRange}
            onChange={(value) => setLocalFilters(prev => ({ ...prev, sentimentRange: value }))}
            options={SENTIMENT_OPTIONS}
          />
        </div>
      </Drawer>

      {/* Response Drawer */}
      <ReviewDraftDrawer
        isOpen={!!selectedReview}
        review={selectedReview}
        onClose={() => setSelectedReview(null)}
        onApprove={handleApprove}
        isPublishing={isPublishing}
      />
    </div>
  );
}

export default function ReputationPendingReviews() {
  return (
    <ReputationProvider>
      <ReputationReviewsContent />
    </ReputationProvider>
  );
}
