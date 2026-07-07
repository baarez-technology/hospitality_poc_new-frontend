import { useState } from 'react';
import { Sparkles, Send, Star } from 'lucide-react';
import { Drawer } from '../ui2/Drawer';
import { Button } from '../ui2/Button';

interface Review {
  id: string;
  guestName: string;
  date: string;
  rating: number;
  sentiment: string;
  reviewText: string;
  keywords: string[];
}

interface ReplyDrawerProps {
  review: Review | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (reviewId: string, replyText: string) => void;
  generateReply?: (review: Review) => string;
}

export default function ReplyDrawer({ review, isOpen, onClose, onSubmit, generateReply }: ReplyDrawerProps) {
  const [replyText, setReplyText] = useState('');
  const [useAI, setUseAI] = useState(false);

  if (!review) return null;

  const handleGenerateAIReply = () => {
    if (generateReply) {
      const aiReply = generateReply(review);
      setReplyText(aiReply);
      setUseAI(true);
    } else {
      const templates: Record<string, string> = {
        Positive: `Dear ${review.guestName.split(' ')[0]},\n\nThank you so much for your wonderful ${review.rating}-star review! We're delighted to hear that you enjoyed your stay at Glimmora. Your kind words about our ${review.keywords[0] || 'services'} truly make our day.\n\nWe look forward to welcoming you back soon!\n\nBest regards,\nGlimmora Management`,
        Negative: `Dear ${review.guestName.split(' ')[0]},\n\nThank you for taking the time to share your feedback. We sincerely apologize that your experience did not meet expectations. Your concerns about ${review.keywords[0] || 'your stay'} are being addressed immediately with our team.\n\nWe would appreciate the opportunity to make this right. Please contact us directly so we can discuss how we can improve your next visit.\n\nSincerely,\nGlimmora Management`,
        Neutral: `Dear ${review.guestName.split(' ')[0]},\n\nThank you for your ${review.rating}-star review and for choosing Glimmora. We appreciate your feedback regarding ${review.keywords[0] || 'your stay'}.\n\nWe're constantly working to improve our services, and your input helps us do that. We hope to have the opportunity to exceed your expectations on your next visit.\n\nBest regards,\nGlimmora Management`
      };

      setReplyText(templates[review.sentiment] || templates.Neutral);
      setUseAI(true);
    }
  };

  const handleSubmit = () => {
    if (replyText.trim()) {
      onSubmit(review.id, replyText);
      setReplyText('');
      setUseAI(false);
      onClose();
    }
  };

  const handleClose = () => {
    setReplyText('');
    setUseAI(false);
    onClose();
  };

  const header = (
    <div>
      <h2 className="text-base sm:text-lg font-semibold text-neutral-900 tracking-tight">Reply to Review</h2>
      <p className="text-[10px] sm:text-[11px] text-neutral-400 font-medium mt-0.5 sm:mt-1">Respond to {review.guestName}</p>
    </div>
  );

  const footer = (
    <div className="flex items-center justify-end gap-2 sm:gap-3 w-full flex-wrap sm:flex-nowrap">
      <Button
        variant="ghost"
        onClick={() => {
          setReplyText('');
          setUseAI(false);
        }}
        className="text-[11px] sm:text-[13px] px-2 sm:px-3 py-1.5 sm:py-2"
      >
        Clear
      </Button>
      <Button variant="outline" onClick={handleClose} className="text-[11px] sm:text-[13px] px-2 sm:px-3 py-1.5 sm:py-2">
        Cancel
      </Button>
      <Button
        variant="primary"
        icon={Send}
        onClick={handleSubmit}
        disabled={!replyText.trim()}
        className="text-[11px] sm:text-[13px] px-2 sm:px-3 py-1.5 sm:py-2"
      >
        <span className="hidden sm:inline">Send Reply</span>
        <span className="sm:hidden">Send</span>
      </Button>
    </div>
  );

  return (
    <Drawer
      isOpen={isOpen}
      onClose={handleClose}
      header={header}
      maxWidth="max-w-xl"
      footer={footer}
    >
      <div className="space-y-4 sm:space-y-5">
        {/* Original Review */}
        <div>
          <p className="text-[10px] sm:text-[11px] font-semibold text-neutral-400 uppercase tracking-widest mb-1.5 sm:mb-2">Original Review</p>
          <div className="bg-neutral-50 rounded-[10px] p-3 sm:p-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0 mb-2 sm:mb-3">
              <div>
                <p className="text-[13px] sm:text-[14px] font-semibold text-neutral-900">{review.guestName}</p>
                <p className="text-[10px] sm:text-[11px] text-neutral-500">
                  {new Date(review.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </p>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <div className="flex items-center gap-1 px-1.5 sm:px-2 py-0.5 sm:py-1 bg-gold-100 rounded-[6px]">
                  <Star className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-gold-600 fill-gold-600" />
                  <span className="text-[11px] sm:text-[12px] font-semibold text-gold-700">{review.rating}</span>
                </div>
                <span className={`px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-[6px] text-[10px] sm:text-[11px] font-semibold ${
                  review.sentiment === 'Positive'
                    ? 'bg-sage-100 text-sage-700'
                    : review.sentiment === 'Negative'
                    ? 'bg-rose-50 text-rose-600'
                    : 'bg-amber-50 text-amber-700'
                }`}>
                  {review.sentiment}
                </span>
              </div>
            </div>
            <p className="text-[12px] sm:text-[13px] text-neutral-700 leading-relaxed">{review.reviewText}</p>
          </div>
        </div>

        {/* AI Assistant */}
        <div className="bg-terra-50 rounded-[10px] p-3 sm:p-4 border border-terra-100">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
            <div className="flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-terra-600" />
              <span className="text-[12px] sm:text-[13px] font-semibold text-neutral-900">AI Reply Assistant</span>
            </div>
            <Button
              variant="primary"
              size="sm"
              icon={Sparkles}
              onClick={handleGenerateAIReply}
              className="text-[11px] sm:text-[12px] w-full sm:w-auto"
            >
              Generate Reply
            </Button>
          </div>
          <p className="text-[10px] sm:text-[11px] text-neutral-500 mt-1.5 sm:mt-2">
            Let AI craft a professional, personalized response based on the review sentiment.
          </p>
        </div>

        {/* Reply Text Area */}
        <div>
          <div className="flex items-center justify-between mb-1.5 sm:mb-2">
            <label className="text-[10px] sm:text-[11px] font-semibold text-neutral-400 uppercase tracking-widest">
              Your Response
            </label>
            {useAI && (
              <span className="text-[10px] sm:text-[11px] font-semibold text-terra-600">AI Generated</span>
            )}
          </div>
          <textarea
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            placeholder="Write your response to this review..."
            rows={5}
            className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-white border border-neutral-200 rounded-[10px] text-[12px] sm:text-[13px] focus:outline-none focus:ring-2 focus:ring-terra-500/20 focus:border-terra-500 resize-none"
          />
          <div className="flex items-center justify-between mt-1.5 sm:mt-2">
            <p className="text-[10px] sm:text-[11px] text-neutral-400">
              {replyText.length} characters
            </p>
            <p className="text-[10px] sm:text-[11px] text-neutral-400 hidden sm:block">
              Recommended: 100-300 characters
            </p>
          </div>
        </div>

        {/* Best Practices */}
        <div className="bg-amber-50 rounded-[10px] p-3 sm:p-4 border border-amber-100">
          <h4 className="text-[12px] sm:text-[13px] font-semibold text-amber-900 mb-1.5 sm:mb-2">Reply Best Practices</h4>
          <ul className="space-y-0.5 sm:space-y-1 text-[10px] sm:text-[11px] text-amber-800">
            <li>• Thank the guest for their feedback</li>
            <li>• Address specific points mentioned in the review</li>
            <li>• For negative reviews, apologize and offer to make it right</li>
            <li>• Keep it professional and personal</li>
          </ul>
        </div>
      </div>
    </Drawer>
  );
}
