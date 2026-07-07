import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageSquare, Star, Calendar, CheckCircle, AlertCircle, ExternalLink, Loader2, ArrowRight } from 'lucide-react';
import { Button } from '../ui2/Button';

const SOURCE_COLORS = {
  'Booking.com': '#003580',
  'Google': '#4285F4',
  'Expedia': '#FFCC00',
  'Tripadvisor': '#34E0A1',
  'Agoda': '#5C2D91'
};

const getSentimentBadge = (sentiment, sentimentLabel?: string) => {
  // If we have a valid numeric sentiment score, use it
  if (typeof sentiment === 'number' && !isNaN(sentiment)) {
    if (sentiment >= 70) return { bg: 'bg-[#4E5840]/15', text: 'text-[#4E5840]', label: 'Positive' };
    if (sentiment >= 40) return { bg: 'bg-[#C8B29D]/20', text: 'text-[#C8B29D]', label: 'Neutral' };
    return { bg: 'bg-[#CDB261]/20', text: 'text-[#CDB261]', label: 'Negative' };
  }
  // Fallback to sentiment label if available
  if (sentimentLabel) {
    const label = sentimentLabel.toLowerCase();
    if (label === 'positive') return { bg: 'bg-[#4E5840]/15', text: 'text-[#4E5840]', label: 'Positive' };
    if (label === 'negative') return { bg: 'bg-[#CDB261]/20', text: 'text-[#CDB261]', label: 'Negative' };
    return { bg: 'bg-[#C8B29D]/20', text: 'text-[#C8B29D]', label: 'Neutral' };
  }
  // Default to neutral
  return { bg: 'bg-[#C8B29D]/20', text: 'text-[#C8B29D]', label: 'Neutral' };
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

export default function ReviewFeed({ reviews, onReviewClick, isLoading = false }: { reviews: any; onReviewClick: any; isLoading?: boolean }) {
  const [showAll, setShowAll] = useState(false);

  const navigate = useNavigate();
  const stats = useMemo(() => {
    const responded = reviews.filter((r: any) => r.responded).length;
    const pending = reviews.length - responded;
    const avgRating = reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / reviews.length;

    return { responded, pending, avgRating };
  }, [reviews]);

  return (
    <div className="bg-white rounded-[10px] p-6 relative">
      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-white/70 rounded-[10px] flex items-center justify-center z-10">
          <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow-sm border border-neutral-200">
            <Loader2 className="w-4 h-4 text-terra-500 animate-spin" />
            <span className="text-[13px] text-neutral-600 font-medium">Applying filters...</span>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-[15px] font-semibold text-neutral-900">Recent Reviews</h3>
          <p className="text-[13px] text-neutral-500 mt-0.5">{reviews.length} reviews total</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-sage-50 rounded-full">
            <CheckCircle className="w-3.5 h-3.5 text-sage-600" />
            <span className="text-[11px] font-semibold text-sage-700">{stats.responded} Responded</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-terra-50 rounded-full">
            <AlertCircle className="w-3.5 h-3.5 text-terra-600" />
            <span className="text-[11px] font-semibold text-terra-700">{stats.pending} Pending</span>
          </div>
        </div>
      </div>

      {/* Reviews List */}
      <div className={`space-y-4 pr-2 ${showAll ? '' : 'max-h-[500px] overflow-y-auto'}`}>
        {reviews.map((review) => {
          const sentimentStyle = getSentimentBadge(
            review.sentiment ?? review.sentiment_score,
            review.sentimentLabel ?? review.sentiment_label
          );
          const sourceColor = SOURCE_COLORS[review.source] || '#A57865';

          return (
            <div
              key={review.id}
              className="p-4 rounded-[8px] bg-neutral-50 hover:bg-neutral-100/80 cursor-pointer transition-colors"
              onClick={() => onReviewClick(review)}
            >
              <div className="flex items-start justify-between gap-4">
                {/* Left Side */}
                <div className="flex-1 min-w-0">
                  {/* Top Row */}
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    {/* Source Badge */}
                    <span
                      className="px-2 py-0.5 text-[10px] font-bold text-white rounded-full"
                      style={{ backgroundColor: sourceColor }}
                    >
                      {review.source}
                    </span>
                    <StarRating rating={review.rating} />
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${sentimentStyle.bg} ${sentimentStyle.text}`}>
                      {sentimentStyle.label}
                    </span>
                    {review.responded && (
                      <span className="flex items-center gap-1 px-2 py-0.5 bg-sage-100 text-sage-700 text-[10px] font-medium rounded-full">
                        <CheckCircle className="w-3 h-3" />
                        Responded
                      </span>
                    )}
                  </div>

                  {/* Guest Name */}
                  <p className="text-[13px] font-semibold text-neutral-900 mb-1">{review.guest}</p>

                  {/* Review Title */}
                  <p className="text-[13px] font-medium text-neutral-700 mb-1">"{review.title}"</p>

                  {/* Review Preview */}
                  <p className="text-[12px] text-neutral-500 line-clamp-2">
                    {review.review}
                  </p>

                  {/* Keywords */}
                  {review.keywords && review.keywords.length > 0 && (
                    <div className="flex items-center gap-1 mt-2 flex-wrap">
                      {review.keywords.slice(0, 4).map((keyword, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 bg-neutral-200/60 text-neutral-600 text-[10px] rounded-full font-medium"
                        >
                          {keyword}
                        </span>
                      ))}
                      {review.keywords.length > 4 && (
                        <span className="text-[10px] text-neutral-400">
                          +{review.keywords.length - 4} more
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
                      const dateStr = review.date || review.created_at;
                      if (!dateStr) return 'No date';
                      const d = new Date(dateStr);
                      return isNaN(d.getTime()) ? 'No date' : d.toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      });
                    })()}
                  </div>

                  <Button
                    variant={review.responded ? 'outline' : 'primary'}
                    size="xs"
                    iconRight={ExternalLink}
                    onClick={(e) => {
                      e.stopPropagation();
                      onReviewClick(review);
                    }}
                  >
                    {review.responded ? 'View Response' : 'Respond'}
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* View All */}
      {reviews.length > 5 && (
        <div className="mt-5 pt-4 border-t border-neutral-100 text-center">
          <Button variant="ghost" size="sm" onClick={() => setShowAll(!showAll)}>
            {showAll ? 'Show Less' : 'View All Reviews'}
          </Button>
        </div>
      )}
    </div>
  );
}
