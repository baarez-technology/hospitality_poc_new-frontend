import { useState } from 'react';
import { Search, SlidersHorizontal } from 'lucide-react';
import ReviewCard from './ReviewCard';

export default function ReviewsFeed({ reviews, onReplyClick }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('recent');
  const [showFilters, setShowFilters] = useState(false);

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
      <div className="bg-white rounded-xl p-4 border border-neutral-200">
        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-400" />
            <input
              type="text"
              placeholder="Search reviews by guest, content, or platform..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-[#FAF8F6] border border-neutral-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#A57865]"
            />
          </div>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-2 bg-[#FAF8F6] border border-neutral-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#A57865]"
          >
            <option value="recent">Most Recent</option>
            <option value="oldest">Oldest First</option>
            <option value="highest">Highest Rating</option>
            <option value="lowest">Lowest Rating</option>
          </select>

          {/* Filters Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="p-2 bg-[#FAF8F6] hover:bg-neutral-100 border border-neutral-200 rounded-xl transition-colors"
          >
            <SlidersHorizontal className="w-5 h-5 text-neutral-700" />
          </button>
        </div>

        {/* Extended Filters (if shown) */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-neutral-200 grid grid-cols-3 gap-3">
            <select className="px-3 py-2 bg-[#FAF8F6] border border-neutral-200 rounded-lg text-sm">
              <option value="">All Platforms</option>
              <option value="google">Google</option>
              <option value="booking">Booking.com</option>
              <option value="tripadvisor">TripAdvisor</option>
              <option value="expedia">Expedia</option>
              <option value="yelp">Yelp</option>
            </select>
            <select className="px-3 py-2 bg-[#FAF8F6] border border-neutral-200 rounded-lg text-sm">
              <option value="">All Sentiments</option>
              <option value="positive">Positive</option>
              <option value="neutral">Neutral</option>
              <option value="negative">Negative</option>
            </select>
            <select className="px-3 py-2 bg-[#FAF8F6] border border-neutral-200 rounded-lg text-sm">
              <option value="">All Ratings</option>
              <option value="5">5 Stars</option>
              <option value="4">4 Stars</option>
              <option value="3">3 Stars</option>
              <option value="2">2 Stars</option>
              <option value="1">1 Star</option>
            </select>
          </div>
        )}
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-neutral-600">
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
          <div className="bg-white rounded-xl p-12 border border-neutral-200 text-center">
            <p className="text-neutral-600">No reviews found matching your criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
}
