import { Star, ThumbsUp, Calendar, MapPin, CheckCircle, MessageCircle } from 'lucide-react';

export default function ReviewCard({ review, onReply }) {
  const renderStars = (rating) => {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= rating
                ? 'fill-yellow-500 text-yellow-500'
                : 'fill-neutral-200 text-neutral-200'
            }`}
          />
        ))}
      </div>
    );
  };

  const getSentimentColor = (sentiment) => {
    switch (sentiment) {
      case 'Positive':
        return 'bg-green-100 text-[#4E5840] border-[#4E5840]/30';
      case 'Negative':
        return 'bg-rose-100 text-rose-700 border-rose-200';
      default:
        return 'bg-amber-100 text-amber-700 border-amber-200';
    }
  };

  const getPlatformColor = (platform) => {
    const colors = {
      'Google': 'bg-blue-100 text-blue-700',
      'Booking.com': 'bg-indigo-100 text-indigo-700',
      'TripAdvisor': 'bg-green-100 text-[#4E5840]',
      'Expedia': 'bg-yellow-100 text-yellow-700',
      'Yelp': 'bg-rose-100 text-rose-700'
    };
    return colors[platform] || 'bg-neutral-100 text-neutral-700';
  };

  return (
    <div className="bg-white rounded-xl p-6 border border-neutral-200 hover:shadow transition-shadow duration-200">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h4 className="font-semibold text-neutral-900">{review.guestName}</h4>
            {review.verified && (
              <div className="flex items-center gap-1 px-2 py-0.5 bg-[#A57865]/10 text-[#A57865] rounded-full text-xs font-medium">
                <CheckCircle className="w-3 h-3" />
                Verified
              </div>
            )}
          </div>
          <div className="flex items-center gap-3 text-sm text-neutral-600">
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              {new Date(review.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </div>
            <div className="flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              Stay: {new Date(review.stayDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
            </div>
          </div>
        </div>

        <div className="flex flex-col items-end gap-2">
          <div className={`px-3 py-1 rounded-lg text-xs font-semibold ${getPlatformColor(review.platform)}`}>
            {review.platform}
          </div>
        </div>
      </div>

      {/* Rating and Sentiment */}
      <div className="flex items-center gap-3 mb-4">
        {renderStars(review.rating)}
        <span className={`px-2 py-0.5 rounded border text-xs font-semibold ${getSentimentColor(review.sentiment)}`}>
          {review.sentiment}
        </span>
      </div>

      {/* Review Text */}
      <p className="text-neutral-700 leading-relaxed mb-4">
        {review.reviewText}
      </p>

      {/* Keywords */}
      {review.keywords && review.keywords.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {review.keywords.slice(0, 5).map((keyword, index) => (
            <span
              key={index}
              className="px-2 py-1 bg-neutral-100 text-neutral-700 rounded text-xs font-medium"
            >
              #{keyword}
            </span>
          ))}
        </div>
      )}

      {/* Reply Section */}
      {review.hasReply && review.reply ? (
        <div className="mt-4 p-4 bg-[#A57865]/5 rounded-xl border border-[#A57865]/30">
          <div className="flex items-center gap-2 mb-2">
            <MessageCircle className="w-4 h-4 text-[#A57865]" />
            <span className="text-sm font-semibold text-neutral-900">Management Response</span>
            <span className="text-xs text-[#A57865]">
              {new Date(review.reply.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </span>
          </div>
          <p className="text-sm text-neutral-700">{review.reply.text}</p>
        </div>
      ) : (
        <button
          onClick={() => onReply(review)}
          className="w-full py-2 px-4 bg-[#8E6554] hover:bg-[#A57865] text-white rounded-lg text-sm font-medium transition-colors"
        >
          Reply to Review
        </button>
      )}

      {/* Footer */}
      <div className="mt-4 pt-4 border-t border-neutral-200 flex items-center justify-between">
        <div className="flex items-center gap-1 text-neutral-600">
          <ThumbsUp className="w-4 h-4" />
          <span className="text-sm">{review.helpful} found this helpful</span>
        </div>
      </div>
    </div>
  );
}
