import { useState, useMemo } from 'react';
import { Download, Filter, X } from 'lucide-react';
import { reviewsData } from '../../data/reviewsData';
import { competitorData, competitorRatingTrends } from '../../data/competitorData';
import { useReputation } from '../../hooks/useReputation';
import RepSummaryCards from '../../components/reputation/RepSummaryCards';
import RepTabs from '../../components/reputation/RepTabs';
import SentimentChart from '../../components/reputation/SentimentChart';
import ReviewsFeed from '../../components/reputation/ReviewsFeed';
import PlatformTable from '../../components/reputation/PlatformTable';
import KeywordCloud from '../../components/reputation/KeywordCloud';
import CompetitorComparison from '../../components/reputation/CompetitorComparison';
import AIInsights from '../../components/reputation/AIInsights';
import ReplyModal from '../../components/reputation/ReplyModal';

export default function Reputation() {
  const [activeTab, setActiveTab] = useState('all');
  const [selectedReview, setSelectedReview] = useState(null);
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Use the master reputation hook
  const {
    reviews,
    totalReviews,
    filteredCount,
    filters,
    updateFilter,
    clearFilters,
    hasActiveFilters,
    activeFilterCount,
    sortOption,
    setSortOption,
    sortOptions,
    kpis,
    sentimentData,
    sentimentDistribution,
    keywords,
    trendingKeywords,
    topIssues,
    topStrengths,
    platformStats,
    platformAggregation,
    platformInsights,
    aiInsights,
    competitorAnalysis,
    generateReply
  } = useReputation(reviewsData, competitorData);

  // Build summary data for RepSummaryCards
  const reviewsSummary = useMemo(() => ({
    totalReviews: kpis.totalReviews,
    averageRating: kpis.overallScore,
    positiveCount: Math.round((kpis.positivePercent / 100) * kpis.totalReviews),
    responseRate: kpis.responseRate
  }), [kpis]);

  // Build platform summary
  const platformSummary = useMemo(() => {
    if (platformStats.length === 0) return { bestPlatform: null, worstPlatform: null, totalPlatforms: 0 };

    const sorted = [...platformStats].sort((a, b) => parseFloat(b.averageRating) - parseFloat(a.averageRating));
    return {
      bestPlatform: sorted[0]?.platform || null,
      worstPlatform: sorted[sorted.length - 1]?.platform || null,
      totalPlatforms: platformStats.length
    };
  }, [platformStats]);

  // Build competitor summary
  const competitorSummary = useMemo(() => ({
    yourRank: competitorAnalysis.position.position === 'Market Leader' ? 1 :
              competitorAnalysis.position.position === 'Strong Performer' ? 2 : 3,
    totalCompetitors: competitorData.length + 1,
    ratingGap: {
      toLeader: competitorAnalysis.insights.find(i => i.message.includes('leader'))?.metric || 0,
      toAverage: parseFloat(kpis.overallScore) - 4.3
    }
  }), [competitorAnalysis, kpis, competitorData]);

  // Filter reviews based on active tab
  const tabFilteredReviews = useMemo(() => {
    return reviews.filter(review => {
      const sentiment = review.computedSentiment?.label || review.sentiment;
      switch (activeTab) {
        case 'positive':
          return sentiment === 'positive' || sentiment === 'Positive';
        case 'negative':
          return sentiment === 'negative' || sentiment === 'Negative';
        case 'all':
        default:
          return true;
      }
    });
  }, [reviews, activeTab]);

  const handleReplyClick = (review) => {
    setSelectedReview(review);
    setShowReplyModal(true);
  };

  const handleReplySubmit = (reviewId, replyText) => {
    console.log('Reply submitted for review:', reviewId, replyText);
    // In real app, this would send to backend
    // For now, just close the modal
    setShowReplyModal(false);
    setSelectedReview(null);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'all':
      case 'positive':
      case 'negative':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: Reviews Feed (2/3 width) */}
            <div className="lg:col-span-2">
              <ReviewsFeed
                reviews={tabFilteredReviews}
                onReplyClick={handleReplyClick}
              />
            </div>

            {/* Right: Sentiment Chart (1/3 width) */}
            <div>
              <SentimentChart sentimentData={sentimentData} />
            </div>
          </div>
        );

      case 'platforms':
        return (
          <div className="space-y-6">
            <PlatformTable
              platformData={platformStats}
              summary={platformSummary}
            />
          </div>
        );

      case 'competitors':
        return (
          <CompetitorComparison
            competitors={competitorData}
            ratingTrends={competitorRatingTrends}
            summary={competitorSummary}
          />
        );

      case 'insights':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: AI Insights (2/3 width) */}
            <div className="lg:col-span-2">
              <AIInsights insights={aiInsights} />
            </div>

            {/* Right: Keyword Cloud (1/3 width) */}
            <div>
              <KeywordCloud
                keywords={keywords}
                trendingKeywords={trendingKeywords}
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="flex-1 overflow-y-auto bg-neutral-50">
      <div className="max-w-[1440px] mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-4xl font-sans font-semibold text-neutral-900 mb-2">
              Reputation & Reviews
            </h1>
            <p className="text-neutral-600">
              Monitor, analyze, and respond to guest reviews across all platforms
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2 border rounded-xl text-sm font-medium transition-colors ${
                showFilters || hasActiveFilters
                  ? 'bg-[#8E6554] text-white border-[#A57865]'
                  : 'bg-white border-neutral-200 hover:bg-[#FAF8F6] text-neutral-700'
              }`}
            >
              <Filter className="w-4 h-4" />
              Filters
              {activeFilterCount > 0 && (
                <span className="ml-1 px-1.5 py-0.5 bg-white text-[#A57865] rounded text-xs font-bold">
                  {activeFilterCount}
                </span>
              )}
            </button>

            <button className="flex items-center gap-2 px-4 py-2 bg-[#8E6554] hover:bg-[#A57865] text-white rounded-xl text-sm font-semibold transition-colors">
              <Download className="w-4 h-4" />
              Export Report
            </button>
          </div>
        </div>

        {/* Active Filters Badge */}
        {hasActiveFilters && (
          <div className="flex items-center gap-2 p-3 bg-[#A57865]/5 border border-[#A57865]/30 rounded-xl">
            <p className="text-sm text-neutral-900">
              <span className="font-semibold">{activeFilterCount} filter{activeFilterCount > 1 ? 's' : ''} active</span>
              {' • '}
              Showing {filteredCount} of {totalReviews} reviews
            </p>
            <button
              onClick={clearFilters}
              className="ml-auto flex items-center gap-1 px-3 py-1 bg-white hover:bg-[#A57865]/10 text-[#A57865] rounded-lg text-sm font-medium transition-colors"
            >
              <X className="w-4 h-4" />
              Clear All
            </button>
          </div>
        )}

        {/* Filters Panel */}
        {showFilters && (
          <div className="bg-white rounded-xl p-6 border border-neutral-200 space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-neutral-900">Filter Reviews</h3>
              <button
                onClick={() => setShowFilters(false)}
                className="text-neutral-500 hover:text-neutral-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Rating Filter */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">Rating</label>
                <select
                  value={filters.rating || ''}
                  onChange={(e) => updateFilter('rating', e.target.value ? parseInt(e.target.value) : null)}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-[#A57865] focus:border-[#A57865]"
                >
                  <option value="">All Ratings</option>
                  <option value="5">5 Stars</option>
                  <option value="4">4 Stars</option>
                  <option value="3">3 Stars</option>
                  <option value="2">2 Stars</option>
                  <option value="1">1 Star</option>
                </select>
              </div>

              {/* Sentiment Filter */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">Sentiment</label>
                <select
                  value={filters.sentiment || ''}
                  onChange={(e) => updateFilter('sentiment', e.target.value || null)}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-[#A57865] focus:border-[#A57865]"
                >
                  <option value="">All Sentiments</option>
                  <option value="positive">Positive</option>
                  <option value="neutral">Neutral</option>
                  <option value="negative">Negative</option>
                </select>
              </div>

              {/* Platform Filter */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">Platform</label>
                <select
                  value={filters.platform || ''}
                  onChange={(e) => updateFilter('platform', e.target.value || null)}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-[#A57865] focus:border-[#A57865]"
                >
                  <option value="">All Platforms</option>
                  <option value="Google">Google</option>
                  <option value="Booking.com">Booking.com</option>
                  <option value="TripAdvisor">TripAdvisor</option>
                  <option value="Expedia">Expedia</option>
                  <option value="Yelp">Yelp</option>
                </select>
              </div>

              {/* Date Range Filter */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">Date Range</label>
                <select
                  value={filters.dateRange}
                  onChange={(e) => updateFilter('dateRange', e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-[#A57865] focus:border-[#A57865]"
                >
                  <option value="all">All Time</option>
                  <option value="7d">Last 7 Days</option>
                  <option value="30d">Last 30 Days</option>
                  <option value="90d">Last 90 Days</option>
                  <option value="6m">Last 6 Months</option>
                  <option value="1y">Last Year</option>
                  <option value="ytd">Year to Date</option>
                </select>
              </div>

              {/* Has Reply Filter */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">Response Status</label>
                <select
                  value={filters.hasReply === null ? '' : filters.hasReply.toString()}
                  onChange={(e) => updateFilter('hasReply', e.target.value === '' ? null : e.target.value === 'true')}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-[#A57865] focus:border-[#A57865]"
                >
                  <option value="">All Reviews</option>
                  <option value="true">Replied</option>
                  <option value="false">Needs Reply</option>
                </select>
              </div>

              {/* Verified Filter */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">Verification</label>
                <select
                  value={filters.verified === null ? '' : filters.verified.toString()}
                  onChange={(e) => updateFilter('verified', e.target.value === '' ? null : e.target.value === 'true')}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-[#A57865] focus:border-[#A57865]"
                >
                  <option value="">All Reviews</option>
                  <option value="true">Verified Only</option>
                  <option value="false">Unverified Only</option>
                </select>
              </div>
            </div>

            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">Search</label>
              <input
                type="text"
                value={filters.searchQuery}
                onChange={(e) => updateFilter('searchQuery', e.target.value)}
                placeholder="Search reviews by guest name, text, or keywords..."
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-[#A57865] focus:border-[#A57865]"
              />
            </div>

            {/* Sort */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">Sort By</label>
              <select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-[#A57865] focus:border-[#A57865]"
              >
                {sortOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Summary Cards */}
        <RepSummaryCards summary={reviewsSummary} />

        {/* Tabs */}
        <RepTabs activeTab={activeTab} onTabChange={setActiveTab} />

        {/* Tab Content */}
        {renderTabContent()}

        {/* Reply Modal */}
        <ReplyModal
          review={selectedReview}
          isOpen={showReplyModal}
          onClose={() => {
            setShowReplyModal(false);
            setSelectedReview(null);
          }}
          onSubmit={handleReplySubmit}
          generateReply={generateReply}
        />
      </div>
    </div>
  );
}
