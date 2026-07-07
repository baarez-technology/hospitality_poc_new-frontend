import { Star, MessageCircle, ThumbsUp } from 'lucide-react';

const sentimentColors = {
  positive: 'bg-[#4E5840]/10 text-[#4E5840] border-[#4E5840]/20',
  neutral: 'bg-neutral-100 text-neutral-600 border-neutral-200',
  negative: 'bg-[#CDB261]/10 text-[#CDB261] border-[#CDB261]/20',
};

function formatTimeAgo(date) {
  const now = new Date();
  const reviewDate = new Date(date);
  const diffInHours = Math.floor((now - reviewDate) / (1000 * 60 * 60));

  if (diffInHours < 1) return 'Just now';
  if (diffInHours < 24) return `${diffInHours}h ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  return `${diffInDays}d ago`;
}

function StarRating({ rating }) {
  return (
    <div className="flex items-center gap-0.5">
      {[...Array(5)].map((_, index) => (
        <Star
          key={index}
          className={`w-3.5 h-3.5 ${
            index < rating
              ? 'fill-[#CDB261] text-[#CDB261]'
              : 'text-neutral-300'
          }`}
        />
      ))}
    </div>
  );
}

export default function RecentReviews({ reviews, onReviewClick }) {
  return (
    <div className="bg-white rounded-2xl p-6 border border-neutral-200/60 hover:border-[#A57865]/30 transition-all duration-300 ease-out group">
      {/* Header */}
      <div className="mb-6 flex items-start gap-3">
        <div className="p-2 bg-[#A57865]/10 rounded-lg group-hover:scale-105 transition-transform duration-200">
          <ThumbsUp className="w-4 h-4 text-[#A57865]" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-neutral-900 mb-1">
            Recent Reviews
          </h3>
          <p className="text-xs text-neutral-600 font-medium">Guest feedback and sentiment analysis</p>
        </div>
      </div>

      {/* Sentiment Stats */}
      <div className="mb-6 p-4 bg-[#A57865]/5 rounded-xl border border-[#A57865]/20">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-2xl font-bold text-neutral-900">4.6</div>
            <div className="flex items-center gap-1 mt-1">
              <Star className="w-3 h-3 fill-[#CDB261] text-[#CDB261]" />
              <span className="text-xs text-neutral-600 font-medium">Average Rating</span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-lg font-bold text-neutral-900">328</div>
            <div className="text-xs text-neutral-600 font-medium">Total Reviews</div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <div className="text-center p-2.5 bg-[#4E5840]/10 rounded-lg border border-[#4E5840]/20">
            <div className="text-base font-bold text-[#4E5840]">72%</div>
            <div className="text-[10px] text-[#4E5840] font-semibold uppercase tracking-wide mt-0.5">Positive</div>
          </div>
          <div className="text-center p-2.5 bg-neutral-100 rounded-lg border border-neutral-200">
            <div className="text-base font-bold text-neutral-600">18%</div>
            <div className="text-[10px] text-neutral-600 font-semibold uppercase tracking-wide mt-0.5">Neutral</div>
          </div>
          <div className="text-center p-2.5 bg-[#CDB261]/10 rounded-lg border border-[#CDB261]/20">
            <div className="text-base font-bold text-[#CDB261]">10%</div>
            <div className="text-[10px] text-[#CDB261] font-semibold uppercase tracking-wide mt-0.5">Negative</div>
          </div>
        </div>
      </div>

      {/* Reviews List - Scrollable */}
      <div className="space-y-1 max-h-[360px] overflow-y-auto pr-2 custom-scrollbar">
        {reviews?.map((review) => (
          <div
            key={review.id}
            onClick={() => onReviewClick && onReviewClick(review)}
            className="p-2.5 bg-neutral-50 rounded-xl hover:bg-neutral-100 hover:border-[#A57865]/30 border border-transparent transition-all duration-200 ease-out cursor-pointer group"
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-bold text-neutral-900 text-sm group-hover:text-[#A57865] transition-colors">
                    {review.guestName}
                  </h4>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border uppercase tracking-wide ${
                      sentimentColors[review.sentiment]
                    }`}
                  >
                    {review.sentiment}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-neutral-500 font-medium">
                  <span>{review.platform}</span>
                  <span>•</span>
                  <span>{formatTimeAgo(review.date)}</span>
                </div>
              </div>
              <StarRating rating={review.rating} />
            </div>

            {/* Comment */}
            <p className="text-xs text-neutral-700 mb-2 line-clamp-2 leading-relaxed">
              {review.comment}
            </p>

            {/* Actions */}
            <div className="flex items-center justify-between pt-1.5 border-t border-neutral-200/60">
              <div className="text-xs">
                {review.replied ? (
                  <span className="flex items-center gap-1.5 text-[#4E5840] font-semibold">
                    <MessageCircle className="w-3.5 h-3.5" />
                    Replied
                  </span>
                ) : (
                  <button className="flex items-center gap-1.5 text-[#A57865] hover:text-[#8E6554] font-semibold transition-all duration-150 focus:outline-none group/btn">
                    <MessageCircle className="w-3.5 h-3.5 group-hover/btn:scale-110 transition-transform" />
                    Reply
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
