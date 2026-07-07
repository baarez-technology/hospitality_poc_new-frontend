import { X, Sparkles, Send } from 'lucide-react';
import { useState } from 'react';
import { Button } from '../../ui2/Button';

export default function ReplyModal({ review, isOpen, onClose, onSubmit, generateReply }) {
  const [replyText, setReplyText] = useState('');
  const [useAI, setUseAI] = useState(false);

  if (!isOpen || !review) return null;

  const handleGenerateAIReply = () => {
    if (generateReply) {
      // Use the hook-generated AI reply
      const aiReply = generateReply(review);
      setReplyText(aiReply);
      setUseAI(true);
    } else {
      // Fallback to simple template if generateReply not provided
      const templates = {
        Positive: `Dear ${review.guestName.split(' ')[0]},\n\nThank you so much for your wonderful ${review.rating}-star review! We're delighted to hear that you enjoyed your stay at Terra Suites. Your kind words about our ${review.keywords[0]} truly make our day.\n\nWe look forward to welcoming you back soon!\n\nBest regards,\nTerra Suites Management`,
        Negative: `Dear ${review.guestName.split(' ')[0]},\n\nThank you for taking the time to share your feedback. We sincerely apologize that your experience did not meet expectations. Your concerns about ${review.keywords[0]} are being addressed immediately with our team.\n\nWe would appreciate the opportunity to make this right. Please contact us directly so we can discuss how we can improve your next visit.\n\nSincerely,\nTerra Suites Management`,
        Neutral: `Dear ${review.guestName.split(' ')[0]},\n\nThank you for your ${review.rating}-star review and for choosing Terra Suites. We appreciate your feedback regarding ${review.keywords[0]}.\n\nWe're constantly working to improve our services, and your input helps us do that. We hope to have the opportunity to exceed your expectations on your next visit.\n\nBest regards,\nTerra Suites Management`
      };

      setReplyText(templates[review.sentiment]);
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

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-6">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-[calc(100vh-2rem)] sm:max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-neutral-200 p-4 sm:p-6 flex items-center justify-between flex-shrink-0">
          <h3 className="text-2xl font-serif font-semibold text-neutral-900">
            Reply to Review
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 sm:p-6 space-y-6 flex-1 overflow-y-auto">
          {/* Original Review */}
          <div className="p-4 bg-[#FAF8F6] rounded-xl border border-neutral-200">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="font-semibold text-neutral-900">{review.guestName}</p>
                <p className="text-sm text-neutral-600">
                  {new Date(review.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-3 py-1 rounded-lg text-sm font-semibold ${
                  review.sentiment === 'Positive'
                    ? 'bg-green-100 text-[#4E5840]'
                    : review.sentiment === 'Negative'
                    ? 'bg-red-100 text-red-700'
                    : 'bg-amber-100 text-amber-700'
                }`}>
                  {review.rating} ★
                </span>
              </div>
            </div>
            <p className="text-neutral-700 text-sm leading-relaxed">{review.reviewText}</p>
          </div>

          {/* AI Assistant */}
          <div className="bg-gradient-to-br from-aurora-50 to-primary-50 rounded-xl p-4 border border-[#A57865]/30">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#A57865]" />
                <span className="text-sm font-semibold text-neutral-900">AI Reply Assistant</span>
              </div>
              <button
                onClick={handleGenerateAIReply}
                className="px-4 py-2 bg-[#8E6554] hover:bg-[#A57865] text-white rounded-lg text-sm font-medium transition-colors"
              >
                Generate Reply
              </button>
            </div>
            <p className="text-xs text-[#A57865]">
              Let AI craft a professional, personalized response based on the review sentiment and content.
            </p>
          </div>

          {/* Reply Text Area */}
          <div>
            <label className="block text-sm font-semibold text-neutral-700 mb-2">
              Your Response
            </label>
            <textarea
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="Write your response to this review..."
              rows={8}
              className="w-full px-4 py-3 bg-white border border-neutral-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#A57865] resize-none"
            />
            <div className="flex items-center justify-between mt-2">
              <p className="text-xs text-neutral-600">
                {replyText.length} characters
                {useAI && <span className="ml-2 text-[#A57865] font-medium">(AI Generated)</span>}
              </p>
              <p className="text-xs text-neutral-600">
                Recommended: 100-300 characters
              </p>
            </div>
          </div>

          {/* Best Practices */}
          <div className="bg-amber-50 rounded-xl p-4 border border-amber-200">
            <h4 className="text-sm font-semibold text-amber-900 mb-2">Reply Best Practices</h4>
            <ul className="space-y-1 text-xs text-amber-800">
              <li>• Thank the guest for their feedback</li>
              <li>• Address specific points mentioned in the review</li>
              <li>• For negative reviews, apologize and offer to make it right</li>
              <li>• Keep it professional and personal</li>
              <li>• Respond within 24-48 hours for best impact</li>
            </ul>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button variant="primary" onClick={handleSubmit} disabled={!replyText.trim()} icon={Send} className="flex-1">
              Send Reply
            </Button>
            <Button variant="ghost" onClick={() => { setReplyText(''); setUseAI(false); }}>
              Clear
            </Button>
            <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
