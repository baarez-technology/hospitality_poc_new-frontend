import { useState } from 'react';
import {
  Star,
  ChevronUp,
  ChevronDown,
  MoreVertical,
  Eye,
  MessageSquare,
  Trash2,
  X
} from 'lucide-react';
import {
  PLATFORMS,
  ISSUE_CATEGORIES,
  SENTIMENT_CONFIG,
  getSentimentLabel,
  formatDate
} from '../../utils/reputation';
import { SelectDropdown, SearchInput } from '../ui2/Input';
import { Button } from '../ui2/Button';
import { DropdownMenu, DropdownMenuItem, DropdownMenuSeparator } from '../ui2/DropdownMenu';

const PLATFORM_OPTIONS = [
  { value: 'all', label: 'All Platforms' },
  ...PLATFORMS.map(p => ({ value: p.id, label: p.name }))
];

const SENTIMENT_OPTIONS = [
  { value: 'all', label: 'All Sentiments' },
  { value: 'positive', label: 'Positive' },
  { value: 'neutral', label: 'Neutral' },
  { value: 'negative', label: 'Negative' }
];

const CATEGORY_OPTIONS = [
  { value: 'all', label: 'All Categories' },
  ...ISSUE_CATEGORIES.map(c => ({ value: c.value, label: c.label }))
];

const STATUS_OPTIONS = [
  { value: 'all', label: 'All Status' },
  { value: 'true', label: 'Responded' },
  { value: 'false', label: 'Pending' }
];

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
      <div className="bg-white rounded-[10px] border border-neutral-200 p-4">
        <div className="flex flex-col lg:flex-row gap-3">
          {/* Search */}
          <div className="flex-1 min-w-[200px]">
            <SearchInput
              placeholder="Search reviews..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onClear={() => setSearchQuery('')}
              size="md"
            />
          </div>

          {/* Platform Filter */}
          <div className="w-[140px]">
            <SelectDropdown
              value={filters.platform}
              onChange={(value) => setFilters(prev => ({ ...prev, platform: value }))}
              options={PLATFORM_OPTIONS}
              size="md"
            />
          </div>

          {/* Sentiment Filter */}
          <div className="w-[150px]">
            <SelectDropdown
              value={filters.sentiment}
              onChange={(value) => setFilters(prev => ({ ...prev, sentiment: value }))}
              options={SENTIMENT_OPTIONS}
              size="md"
            />
          </div>

          {/* Category Filter */}
          <div className="w-[150px]">
            <SelectDropdown
              value={filters.category}
              onChange={(value) => setFilters(prev => ({ ...prev, category: value }))}
              options={CATEGORY_OPTIONS}
              size="md"
            />
          </div>

          {/* Response Status */}
          <div className="w-[130px]">
            <SelectDropdown
              value={filters.responded}
              onChange={(value) => setFilters(prev => ({ ...prev, responded: value }))}
              options={STATUS_OPTIONS}
              size="md"
            />
          </div>

          {/* Clear Filters */}
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              icon={X}
              onClick={() => {
                setFilters({
                  platform: 'all',
                  sentiment: 'all',
                  category: 'all',
                  responded: 'all'
                });
                setSearchQuery('');
              }}
              className="text-rose-600 hover:bg-rose-50"
            >
              Clear
            </Button>
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
                        {(review.guestName || '').split(' ').filter(n => n).map(n => n[0]).join('') || '?'}
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
                  <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-center">
                      <DropdownMenu
                        trigger={
                          <button className="p-1.5 hover:bg-neutral-100 rounded-lg transition-colors">
                            <MoreVertical className="w-4 h-4 text-neutral-500" />
                          </button>
                        }
                        align="end"
                      >
                        <DropdownMenuItem icon={Eye} onSelect={() => onRowClick(review)}>
                          View
                        </DropdownMenuItem>
                        {!review.responded && (
                          <DropdownMenuItem icon={MessageSquare} onSelect={() => onRespond(review)}>
                            Respond
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem icon={Trash2} destructive onSelect={() => onDelete(review.id)}>
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenu>
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
