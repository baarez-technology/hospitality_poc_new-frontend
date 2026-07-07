import { useState } from 'react';
import {
  Star,
  ChevronUp,
  ChevronDown,
  MoreVertical,
  Eye,
  MessageSquare,
  Trash2,
  Search,
  Filter,
  X
} from 'lucide-react';
import {
  PLATFORMS,
  ISSUE_CATEGORIES,
  SENTIMENT_CONFIG,
  getSentimentLabel,
  formatDate
} from '@/utils/admin/reputation';

export default function ReviewTable({
  reviews,
  filters,
  setFilters,
  searchQuery,
  setSearchQuery,
  sortField,
  sortDirection,
  onSort,
  onRowClick,
  onRespond,
  onDelete,
  currentPage,
  totalPages,
  onPageChange
}) {
  const [openMenuId, setOpenMenuId] = useState(null);

  const handleSort = (field) => {
    if (sortField === field) {
      onSort(field, sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      onSort(field, 'desc');
    }
  };

  const SortIcon = ({ field }) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? (
      <ChevronUp className="w-4 h-4" />
    ) : (
      <ChevronDown className="w-4 h-4" />
    );
  };

  const getPlatformBadge = (platformId) => {
    const platform = PLATFORMS.find(p => p.id === platformId);
    if (!platform) return null;
    return (
      <span
        className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-semibold text-white"
        style={{ backgroundColor: platform.color }}
      >
        {platform.icon} {platform.name}
      </span>
    );
  };

  const getSentimentBadge = (score) => {
    const sentiment = getSentimentLabel(score);
    const config = SENTIMENT_CONFIG[sentiment];
    return (
      <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold ${config.bgColor} ${config.textColor}`}>
        {config.label}
      </span>
    );
  };

  const getCategoryBadge = (categoryValue) => {
    const category = ISSUE_CATEGORIES.find(c => c.value === categoryValue);
    if (!category) return null;
    return (
      <span
        className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium text-white"
        style={{ backgroundColor: category.color }}
      >
        {category.label}
      </span>
    );
  };

  const renderStars = (rating) => {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= rating
                ? 'text-[#CDB261] fill-[#CDB261]'
                : 'text-neutral-200'
            }`}
          />
        ))}
      </div>
    );
  };

  const hasActiveFilters =
    filters.platform !== 'all' ||
    filters.sentiment !== 'all' ||
    filters.category !== 'all' ||
    filters.responded !== 'all' ||
    searchQuery;

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="bg-white rounded-xl border border-neutral-200 p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input
              type="text"
              placeholder="Search reviews..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#A57865]/20 focus:border-[#A57865]"
            />
          </div>

          {/* Platform Filter */}
          <select
            value={filters.platform}
            onChange={(e) => setFilters(prev => ({ ...prev, platform: e.target.value }))}
            className="px-3 py-2.5 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#A57865]/20 focus:border-[#A57865] bg-white"
          >
            <option value="all">All Platforms</option>
            {PLATFORMS.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>

          {/* Sentiment Filter */}
          <select
            value={filters.sentiment}
            onChange={(e) => setFilters(prev => ({ ...prev, sentiment: e.target.value }))}
            className="px-3 py-2.5 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#A57865]/20 focus:border-[#A57865] bg-white"
          >
            <option value="all">All Sentiments</option>
            <option value="positive">Positive</option>
            <option value="neutral">Neutral</option>
            <option value="negative">Negative</option>
          </select>

          {/* Category Filter */}
          <select
            value={filters.category}
            onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
            className="px-3 py-2.5 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#A57865]/20 focus:border-[#A57865] bg-white"
          >
            <option value="all">All Categories</option>
            {ISSUE_CATEGORIES.map(c => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>

          {/* Response Status */}
          <select
            value={filters.responded}
            onChange={(e) => setFilters(prev => ({ ...prev, responded: e.target.value }))}
            className="px-3 py-2.5 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#A57865]/20 focus:border-[#A57865] bg-white"
          >
            <option value="all">All Status</option>
            <option value="true">Responded</option>
            <option value="false">Pending</option>
          </select>

          {/* Clear Filters */}
          {hasActiveFilters && (
            <button
              onClick={() => {
                setFilters({
                  platform: 'all',
                  sentiment: 'all',
                  category: 'all',
                  responded: 'all'
                });
                setSearchQuery('');
              }}
              className="flex items-center gap-1.5 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-[#FAF8F6] border-b border-neutral-200">
                <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-600 uppercase tracking-wider">
                  Guest
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-600 uppercase tracking-wider">
                  Platform
                </th>
                <th
                  className="px-4 py-3 text-center text-xs font-semibold text-neutral-600 uppercase tracking-wider cursor-pointer hover:bg-neutral-100"
                  onClick={() => handleSort('rating')}
                >
                  <div className="flex items-center justify-center gap-1">
                    Rating
                    <SortIcon field="rating" />
                  </div>
                </th>
                <th
                  className="px-4 py-3 text-left text-xs font-semibold text-neutral-600 uppercase tracking-wider cursor-pointer hover:bg-neutral-100"
                  onClick={() => handleSort('date')}
                >
                  <div className="flex items-center gap-1">
                    Date
                    <SortIcon field="date" />
                  </div>
                </th>
                <th
                  className="px-4 py-3 text-center text-xs font-semibold text-neutral-600 uppercase tracking-wider cursor-pointer hover:bg-neutral-100"
                  onClick={() => handleSort('sentiment')}
                >
                  <div className="flex items-center justify-center gap-1">
                    Sentiment
                    <SortIcon field="sentiment" />
                  </div>
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-600 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-600 uppercase tracking-wider">
                  Comment
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-neutral-600 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {reviews.map((review) => (
                <tr
                  key={review.id}
                  onClick={() => onRowClick(review)}
                  className="hover:bg-[#FAF8F6]/50 cursor-pointer transition-colors"
                >
                  {/* Guest Name */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#A57865] to-[#8E6554] flex items-center justify-center text-white text-sm font-bold">
                        {review.guestName?.split(' ').filter(n => n).map(n => n[0]).join('') || 'G' || '?'}
                      </div>
                      <div>
                        <p className="font-semibold text-neutral-900 text-sm">{review.guestName}</p>
                        {review.responded && (
                          <span className="text-xs text-[#4E5840]">Responded</span>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Platform */}
                  <td className="px-4 py-3">
                    {getPlatformBadge(review.platform)}
                  </td>

                  {/* Rating */}
                  <td className="px-4 py-3 text-center">
                    {renderStars(review.rating)}
                  </td>

                  {/* Date */}
                  <td className="px-4 py-3">
                    <span className="text-sm text-neutral-600">{formatDate(review.date)}</span>
                  </td>

                  {/* Sentiment */}
                  <td className="px-4 py-3 text-center">
                    {getSentimentBadge(review.sentimentScore)}
                  </td>

                  {/* Category */}
                  <td className="px-4 py-3">
                    {getCategoryBadge(review.category)}
                  </td>

                  {/* Comment */}
                  <td className="px-4 py-3">
                    <p className="text-sm text-neutral-700 max-w-[200px] truncate" title={review.comment}>
                      {review.comment}
                    </p>
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-3">
                    <div className="relative flex items-center justify-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenMenuId(openMenuId === review.id ? null : review.id);
                        }}
                        className="p-1.5 hover:bg-neutral-100 rounded-lg transition-colors"
                      >
                        <MoreVertical className="w-4 h-4 text-neutral-500" />
                      </button>

                      {openMenuId === review.id && (
                        <>
                          <div
                            className="fixed inset-0 z-10"
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenMenuId(null);
                            }}
                          />
                          <div className="absolute right-0 top-full mt-1 w-40 bg-white rounded-lg shadow-lg border border-neutral-200 py-1 z-20">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setOpenMenuId(null);
                                onRowClick(review);
                              }}
                              className="w-full px-4 py-2 text-left text-sm text-neutral-700 hover:bg-neutral-50 flex items-center gap-2"
                            >
                              <Eye className="w-4 h-4" />
                              View
                            </button>
                            {!review.responded && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setOpenMenuId(null);
                                  onRespond(review);
                                }}
                                className="w-full px-4 py-2 text-left text-sm text-[#A57865] hover:bg-[#A57865]/10 flex items-center gap-2"
                              >
                                <MessageSquare className="w-4 h-4" />
                                Respond
                              </button>
                            )}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setOpenMenuId(null);
                                onDelete(review.id);
                              }}
                              className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                            >
                              <Trash2 className="w-4 h-4" />
                              Delete
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {reviews.length === 0 && (
          <div className="p-12 text-center">
            <p className="text-neutral-500">No reviews found</p>
            <p className="text-sm text-neutral-400 mt-1">Try adjusting your filters</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-neutral-600">
            Page {currentPage} of {totalPages}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-3 py-1.5 text-sm font-medium text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const page = i + 1;
              return (
                <button
                  key={page}
                  onClick={() => onPageChange(page)}
                  className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                    currentPage === page
                      ? 'bg-[#A57865] text-white'
                      : 'text-neutral-700 hover:bg-neutral-100'
                  }`}
                >
                  {page}
                </button>
              );
            })}
            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-3 py-1.5 text-sm font-medium text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
