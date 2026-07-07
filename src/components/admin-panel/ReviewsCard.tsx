import { Star, ThumbsUp, MessageCircle, ExternalLink } from 'lucide-react';
import { getRelativeTime, getSentimentColor, getSentimentEmoji } from '@/utils/admin/formatters';

const ReviewsCard = ({ reviews, stats }) => {
  const renderStars = (rating) => {
    return (
      <div className="flex items-center gap-0.5">
        {[...Array(5)].map((_, index) => (
          <Star
            key={index}
            className={`w-4 h-4 ${
              index < rating
                ? 'fill-amber-400 text-amber-400'
                : 'text-neutral-300'
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-neutral-200">
      <div className="mb-6">
        <h3 className="text-lg font-serif font-bold text-neutral-900">
          Recent Reviews
        </h3>
        <p className="text-sm text-neutral-500 mt-1">
          Guest feedback and sentiment analysis
        </p>
      </div>

      {/* Sentiment Stats */}
      <div className="mb-6 p-4 bg-[#FAF8F6] rounded-xl">
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="text-3xl font-bold text-neutral-900">
              {stats.averageRating}
            </div>
            <div className="text-xs text-neutral-500">Average Rating</div>
          </div>
          <div className="text-right">
            <div className="text-lg font-semibold text-neutral-900">
              {stats.totalReviews}
            </div>
            <div className="text-xs text-neutral-500">Total Reviews</div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <div className="text-center p-2 bg-[#4E5840]/10 rounded-lg">
            <div className="text-lg font-bold text-[#4E5840]">
              {stats.positive}%
            </div>
            <div className="text-xs text-[#4E5840]">Positive</div>
          </div>
          <div className="text-center p-2 bg-[#5C9BA4]/10 rounded-lg">
            <div className="text-lg font-bold text-[#5C9BA4]">
              {stats.neutral}%
            </div>
            <div className="text-xs text-[#5C9BA4]">Neutral</div>
          </div>
          <div className="text-center p-2 bg-[#CDB261]/20 rounded-lg">
            <div className="text-lg font-bold text-[#CDB261]">
              {stats.negative}%
            </div>
            <div className="text-xs text-[#CDB261]">Negative</div>
          </div>
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-4 max-h-96 overflow-y-auto">
        {reviews.map((review) => (
          <div
            key={review.id}
            className="p-4 bg-[#FAF8F6] rounded-xl hover:bg-neutral-100 transition-all"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-semibold text-neutral-900 text-sm">
                    {review.guestName}
                  </h4>
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-medium ${getSentimentColor(
                      review.sentiment
                    )}`}
                  >
                    {getSentimentEmoji(review.sentiment)} {review.sentiment}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-neutral-500">
                  <span>Room {review.room}</span>
                  <span>•</span>
                  <span>{review.source}</span>
                  <span>•</span>
                  <span>{getRelativeTime(review.date)}</span>
                </div>
              </div>
              {renderStars(review.rating)}
            </div>

            <p className="text-sm text-neutral-700 mb-3 line-clamp-2">
              {review.comment}
            </p>

            <div className="flex items-center justify-between">
              <div className="flex flex-wrap gap-1.5">
                {review.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-white rounded-md text-xs text-neutral-600"
                  >
                    #{tag}
                  </span>
                ))}
              </div>

              <div className="flex items-center gap-2">
                {review.replied ? (
                  <span className="flex items-center gap-1 text-xs text-[#4E5840]">
                    <MessageCircle className="w-3.5 h-3.5" />
                    Replied
                  </span>
                ) : (
                  <button className="flex items-center gap-1 text-xs text-[#5C9BA4] hover:text-[#5C9BA4]">
                    <MessageCircle className="w-3.5 h-3.5" />
                    Reply
                  </button>
                )}
                <button className="text-neutral-400 hover:text-neutral-600">
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t border-neutral-200">
        <button className="w-full px-4 py-2 bg-[#FAF8F6] hover:bg-neutral-100 text-neutral-700 rounded-lg transition-all text-sm font-medium">
          View All Reviews
        </button>
      </div>
    </div>
  );
};

export default ReviewsCard;
