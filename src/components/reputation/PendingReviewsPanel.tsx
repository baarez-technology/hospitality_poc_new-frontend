import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageSquare, Wand2, Star, Clock, Send, Loader2, ArrowRight } from 'lucide-react';
import { useReputation } from '@/context/ReputationContext';
import { useToast } from '@/contexts/ToastContext';
import { Drawer } from '../ui2/Drawer';
import { Button } from '../ui2/Button';
import { Textarea } from '../ui2/Input';

interface ReviewDraftDrawerProps {
  isOpen: boolean;
  review: any;
  onClose: () => void;
  onApprove: (text: string) => void;
}

function ReviewDraftDrawer({ isOpen, review, onClose, onApprove }: ReviewDraftDrawerProps) {
  const { generateDraft } = useReputation();
  const { showToast } = useToast();
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
      showToast('Failed to generate AI response', 'error');
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

  const footer = (
    <div className="flex items-center justify-end gap-3 w-full">
      <Button variant="outline" onClick={handleClose}>
        Cancel
      </Button>
      {draft && (
        <Button
          variant="primary"
          icon={Send}
          onClick={() => {
            onApprove(editedText);
            handleClose();
          }}
        >
          Approve & Publish
        </Button>
      )}
    </div>
  );

  const toneOptions = [
    { value: 'professional', label: 'Professional' },
    { value: 'empathetic', label: 'Empathetic' },
    { value: 'concise', label: 'Concise' },
    { value: 'friendly', label: 'Friendly' },
  ];

  return (
    <Drawer
      isOpen={isOpen}
      onClose={handleClose}
      title="Generate Response"
      subtitle={`AI-powered response for ${review.guest_name || 'Guest'}`}
      maxWidth="max-w-xl"
      footer={footer}
    >
      <div className="space-y-6">
        {/* Original Review */}
        <div>
          <p className="text-[11px] font-semibold text-neutral-400 uppercase tracking-widest mb-2">Original Review</p>
          <div className="bg-neutral-50 rounded-[10px] p-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    className={`w-3.5 h-3.5 ${s <= review.rating ? 'fill-gold-500 text-gold-500' : 'text-neutral-300'}`}
                  />
                ))}
              </div>
              <span className="text-[11px] text-neutral-500 px-2 py-0.5 bg-neutral-200 rounded-full font-medium">
                {review.source || 'Direct'}
              </span>
            </div>
            <p className="text-[13px] text-neutral-700 leading-relaxed">{review.comment || review.content || review.text}</p>
            <p className="text-[11px] text-neutral-500 mt-3 font-medium">
              {review.guest_name || review.guest || `Guest ${review.id}`} • {(() => {
                const dateStr = review.review_date || review.created_at || review.date;
                if (!dateStr) return 'No date';
                const d = new Date(dateStr);
                return isNaN(d.getTime()) ? 'No date' : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
              })()}
            </p>
          </div>
        </div>

        {/* Tone Selector */}
        <div>
          <p className="text-[11px] font-semibold text-neutral-400 uppercase tracking-widest mb-2">Response Tone</p>
          <div className="flex flex-wrap gap-2">
            {toneOptions.map((t) => (
              <button
                key={t.value}
                onClick={() => setTone(t.value)}
                className={`px-3 py-1.5 rounded-lg text-[12px] font-medium transition-colors ${
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
          <Button
            variant="primary"
            icon={isGenerating ? Loader2 : Wand2}
            onClick={handleGenerate}
            disabled={isGenerating}
            fullWidth
            className={isGenerating ? '[&>svg]:animate-spin' : ''}
          >
            {isGenerating ? 'Generating...' : 'Generate AI Response'}
          </Button>
        )}

        {/* Generated Draft */}
        {draft && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-semibold text-neutral-400 uppercase tracking-widest">Generated Response</p>
              <Button
                variant="ghost"
                size="xs"
                icon={isGenerating ? Loader2 : Wand2}
                onClick={handleGenerate}
                disabled={isGenerating}
                className={isGenerating ? '[&>svg]:animate-spin' : ''}
              >
                Regenerate
              </Button>
            </div>
            <Textarea
              value={editedText}
              onChange={(e) => setEditedText(e.target.value)}
              rows={6}
              className="w-full"
            />
          </div>
        )}
      </div>
    </Drawer>
  );
}

const PREVIEW_LIMIT = 3;

export default function PendingReviewsPanel() {
  const navigate = useNavigate();
  const { pendingReviews, fetchPendingReviews, addReviewResponse, isLoading } = useReputation();
  const { showToast } = useToast();
  const [selectedReview, setSelectedReview] = useState<any>(null);

  const displayedReviews = pendingReviews.slice(0, PREVIEW_LIMIT);
  const hasMore = pendingReviews.length > PREVIEW_LIMIT;

  const handleApprove = async (text: string) => {
    if (!selectedReview) return;
    try {
      // Call the API to respond to the review
      const reviewId = typeof selectedReview.id === 'string' ? parseInt(selectedReview.id, 10) : selectedReview.id;
      await addReviewResponse(reviewId, text);
      showToast('Response published successfully', 'success');
      setSelectedReview(null);
      await fetchPendingReviews();
    } catch (error) {
      console.error('Failed to approve response:', error);
      showToast('Failed to publish response', 'error');
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-[10px] p-6 animate-pulse">
        <div className="h-5 bg-neutral-200 rounded w-1/3 mb-5" />
        <div className="space-y-3">
          <div className="h-20 bg-neutral-100 rounded-[8px]" />
          <div className="h-20 bg-neutral-100 rounded-[8px]" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-[10px] p-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-[15px] font-semibold text-neutral-900">Pending Reviews</h3>
          <p className="text-[13px] text-neutral-500 mt-0.5">Awaiting response</p>
        </div>
        <span className="px-2.5 py-1 bg-gold-100 text-gold-700 rounded-full text-[11px] font-semibold">
          {pendingReviews.length} pending
        </span>
      </div>

      {pendingReviews.length > 0 ? (
        <div className="space-y-3">
          {displayedReviews.map((review: any) => (
            <div
              key={review.id}
              className="bg-neutral-50 rounded-[8px] p-4 hover:bg-neutral-100/80 transition-colors"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <div className="flex items-center gap-0.5">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          className={`w-3 h-3 ${s <= review.rating ? 'fill-gold-500 text-gold-500' : 'text-neutral-300'}`}
                        />
                      ))}
                    </div>
                    <span className="text-[11px] text-neutral-600 px-2 py-0.5 bg-neutral-200 rounded-full font-medium">
                      {review.source || 'Direct'}
                    </span>
                    <span className="text-[11px] text-neutral-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {(() => {
                        // Backend returns review_date for pending reviews
                        const dateStr = review.review_date || review.created_at || review.date;
                        if (!dateStr) return 'No date';
                        const d = new Date(dateStr);
                        return isNaN(d.getTime()) ? 'No date' : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                      })()}
                    </span>
                  </div>
                  <p className="text-[13px] text-neutral-700 line-clamp-2">
                    {review.comment || review.content || review.text}
                  </p>
                  <p className="text-[11px] text-neutral-500 mt-1.5 font-medium">{review.guest_name || review.guest || `Guest ${review.id}`}</p>
                </div>
                <Button
                  variant="primary"
                  size="xs"
                  icon={Wand2}
                  onClick={() => setSelectedReview(review)}
                >
                  Respond
                </Button>
              </div>
            </div>
          ))}

          {hasMore && (
            <button
              onClick={() => navigate('/admin/reputation/reviews')}
              className="w-full flex items-center justify-center gap-2 py-2.5 text-[13px] font-semibold text-[#A57865] hover:bg-[#A57865]/5 rounded-[8px] transition-colors"
            >
              View all {pendingReviews.length} pending reviews
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      ) : (
        <div className="text-center py-8 text-neutral-400">
          <MessageSquare className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="text-[14px] font-medium text-neutral-500">All caught up!</p>
          <p className="text-[12px]">No reviews need responses</p>
        </div>
      )}

      <ReviewDraftDrawer
        isOpen={!!selectedReview}
        review={selectedReview}
        onClose={() => setSelectedReview(null)}
        onApprove={handleApprove}
      />
    </div>
  );
}
