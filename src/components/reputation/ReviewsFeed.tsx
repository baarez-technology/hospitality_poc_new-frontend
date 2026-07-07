import { useState } from 'react';
import { SlidersHorizontal } from 'lucide-react';
import ReviewCard from './ReviewCard';
import { SelectDropdown, SearchInput } from '../ui2/Input';
import { Button } from '../ui2/Button';

const SORT_OPTIONS = [
  { value: 'recent', label: 'Most Recent' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'highest', label: 'Highest Rating' },
  { value: 'lowest', label: 'Lowest Rating' }
];

const PLATFORM_OPTIONS = [
  { value: '', label: 'All Platforms' },
  { value: 'google', label: 'Google' },
  { value: 'booking', label: 'Booking.com' },
  { value: 'tripadvisor', label: 'TripAdvisor' },
  { value: 'expedia', label: 'Expedia' },
  { value: 'yelp', label: 'Yelp' }
];

const SENTIMENT_OPTIONS = [
  { value: '', label: 'All Sentiments' },
  { value: 'positive', label: 'Positive' },
  { value: 'neutral', label: 'Neutral' },
  { value: 'negative', label: 'Negative' }
];

const RATING_OPTIONS = [
  { value: '', label: 'All Ratings' },
  { value: '5', label: '5 Stars' },
  { value: '4', label: '4 Stars' },
  { value: '3', label: '3 Stars' },
  { value: '2', label: '2 Stars' },
  { value: '1', label: '1 Star' }
];

export default function ReviewsFeed({ reviews, onReplyClick }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('recent');
  const [showFilters, setShowFilters] = useState(false);
  const [platformFilter, setPlatformFilter] = useState('');
  const [sentimentFilter, setSentimentFilter] = useState('');
  const [ratingFilter, setRatingFilter] = useState('');

  // Filter and sort reviews
  const filteredReviews = reviews
    .filter(review => {
      if (!searchQuery) return true;
      const query = searchQuery.toLowerCase();
      return (
        review.guestName.toLowerCase().includes(query) ||
        review.reviewText.toLowerCase().includes(query) ||
        review.platform.toLowerCase().includes(query)
      );
    })
    .filter(review => {
      if (platformFilter && review.platform.toLowerCase() !== platformFilter) return false;
      if (sentimentFilter && review.sentiment?.toLowerCase() !== sentimentFilter) return false;
      if (ratingFilter && review.rating !== parseInt(ratingFilter)) return false;
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'recent':
          return new Date(b.date) - new Date(a.date);
        case 'oldest':
          return new Date(a.date) - new Date(b.date);
        case 'highest':
          return b.rating - a.rating;
        case 'lowest':
          return a.rating - b.rating;
        default:
          return 0;
      }
    });

  return (
    <div className="space-y-4">
      {/* Search and Filter Bar */}
      <div className="bg-white rounded-[10px] p-4 border border-neutral-200">
        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="flex-1">
            <SearchInput
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onClear={() => setSearchQuery('')}
              placeholder="Search reviews by guest, content, or platform..."
              size="md"
            />
          </div>

          {/* Sort */}
          <div className="w-[150px]">
            <SelectDropdown
              value={sortBy}
              onChange={(value) => setSortBy(value)}
              options={SORT_OPTIONS}
              size="md"
            />
          </div>

          {/* Filters Toggle */}
          <Button
            variant={showFilters ? 'primary' : 'outline'}
            size="md"
            icon={SlidersHorizontal}
            onClick={() => setShowFilters(!showFilters)}
          />
        </div>

        {/* Extended Filters (if shown) */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-neutral-200 grid grid-cols-3 gap-3">
            <SelectDropdown
              value={platformFilter}
              onChange={(value) => setPlatformFilter(value)}
              options={PLATFORM_OPTIONS}
              size="md"
            />
            <SelectDropdown
              value={sentimentFilter}
              onChange={(value) => setSentimentFilter(value)}
              options={SENTIMENT_OPTIONS}
              size="md"
            />
            <SelectDropdown
              value={ratingFilter}
              onChange={(value) => setRatingFilter(value)}
              options={RATING_OPTIONS}
              size="md"
            />
          </div>
        )}
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-[13px] text-neutral-600">
          Showing <span className="font-semibold text-neutral-900">{filteredReviews.length}</span> reviews
        </p>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {filteredReviews.map((review) => (
          <ReviewCard
            key={review.id}
            review={review}
            onReply={onReplyClick}
          />
        ))}

        {filteredReviews.length === 0 && (
          <div className="bg-white rounded-[10px] p-12 border border-neutral-200 text-center">
            <p className="text-neutral-600">No reviews found matching your criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
}
