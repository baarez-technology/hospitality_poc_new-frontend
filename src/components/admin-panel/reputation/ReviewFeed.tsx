import { useMemo } from 'react';
import { MessageSquare, Star, Calendar, CheckCircle, AlertCircle, ExternalLink } from 'lucide-react';

const SOURCE_COLORS = {
  'Booking.com': '#003580',
  'Google': '#4285F4',
  'Expedia': '#FFCC00',
  'Tripadvisor': '#34E0A1',
  'Agoda': '#5C2D91'
};

const getSentimentBand = (sentiment) => {
  if (sentiment >= 70) return 'border-l-[#4E5840]';
  if (sentiment >= 40) return 'border-l-[#C8B29D]';
  return 'border-l-[#CDB261]';
};

const getSentimentBadge = (sentiment) => {
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
          className={`w-3.5 h-3.5 ${
            i < fullStars
              ? 'text-[#CDB261] fill-[#CDB261]'
              : i === fullStars && hasHalf
              ? 'text-[#CDB261] fill-[#CDB261]/50'
              : 'text-neutral-300'
          }`}
        />
      ))}
      <span className="ml-1 text-sm font-semibold text-neutral-700">{rating.toFixed(1)}</span>
    </div>
  );
};

export default function ReviewFeed({ reviews, onReviewClick }) {
  const stats = useMemo(() => {
    const responded = reviews.filter(r => r.responded).length;
    const pending = reviews.length - responded;
    const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

    return { responded, pending, avgRating };
  }, [reviews]);

  return (
    <div className="bg-white rounded-xl border border-[#E5E5E5] p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#CDB261]/10 flex items-center justify-center">
            <MessageSquare className="w-5 h-5 text-[#CDB261]" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-neutral-900">Recent Reviews</h3>
            <p className="text-sm text-neutral-500">{reviews.length} reviews</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-[#4E5840]/10 rounded-lg">
            <CheckCircle className="w-4 h-4 text-[#4E5840]" />
            <span className="text-xs font-semibold text-[#4E5840]">{stats.responded} Responded</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-[#A57865]/10 rounded-lg">
            <AlertCircle className="w-4 h-4 text-[#A57865]" />
            <span className="text-xs font-semibold text-[#A57865]">{stats.pending} Pending</span>
          </div>
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
        {reviews.map((review) => {
          const sentimentStyle = getSentimentBadge(review.sentiment);
          const sourceColor = SOURCE_COLORS[review.source] || '#A57865';

          return (
            <div
              key={review.id}
              className={`p-4 rounded-xl border-l-4 bg-[#FAF7F4] hover:bg-[#FAF7F4]/80 cursor-pointer transition-colors ${getSentimentBand(review.sentiment)}`}
              onClick={() => onReviewClick(review)}
            >
              <div className="flex items-start justify-between gap-4">
                {/* Left Side */}
                <div className="flex-1 min-w-0">
                  {/* Top Row */}
                  <div className="flex items-center gap-3 mb-2">
                    {/* Source Badge */}
                    <span
                      className="px-2 py-0.5 text-xs font-bold text-white rounded"
                      style={{ backgroundColor: sourceColor }}
                    >
                      {review.source}
                    </span>
                    <StarRating rating={review.rating} />
                    <span className={`px-2 py-0.5 rounded text-xs font-semibold ${sentimentStyle.bg} ${sentimentStyle.text}`}>
                      {sentimentStyle.label}
                    </span>
                    {review.responded && (
                      <span className="flex items-center gap-1 px-2 py-0.5 bg-[#4E5840]/10 text-[#4E5840] text-xs font-medium rounded">
                        <CheckCircle className="w-3 h-3" />
                        Responded
                      </span>
                    )}
                  </div>

                  {/* Guest Name */}
                  <p className="text-sm font-semibold text-neutral-900 mb-1">{review.guest}</p>

                  {/* Review Title */}
                  <p className="text-sm font-medium text-neutral-800 mb-1">"{review.title}"</p>

                  {/* Review Preview */}
                  <p className="text-sm text-neutral-600 line-clamp-2">
                    {review.review}
                  </p>

                  {/* Keywords */}
                  {review.keywords && review.keywords.length > 0 && (
                    <div className="flex items-center gap-1 mt-2 flex-wrap">
                      {review.keywords.slice(0, 4).map((keyword, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 bg-neutral-100 text-neutral-600 text-xs rounded"
                        >
                          {keyword}
                        </span>
                      ))}
                      {review.keywords.length > 4 && (
                        <span className="text-xs text-neutral-400">
                          +{review.keywords.length - 4} more
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Right Side */}
                <div className="flex flex-col items-end gap-2">
                  <div className="flex items-center gap-1 text-xs text-neutral-500">
                    <Calendar className="w-3 h-3" />
                    {new Date(review.date).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </div>

                  <button
                    className="flex items-center gap-1 px-3 py-1.5 bg-[#A57865] text-white text-xs font-semibold rounded-lg hover:bg-[#A57865]/90 transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      onReviewClick(review);
                    }}
                  >
                    {review.responded ? 'View' : 'Respond'}
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Load More */}
      {reviews.length > 5 && (
        <div className="mt-4 pt-4 border-t border-neutral-100 text-center">
          <button className="text-sm font-medium text-[#A57865] hover:underline">
            View All Reviews
          </button>
        </div>
      )}
    </div>
  );
}
