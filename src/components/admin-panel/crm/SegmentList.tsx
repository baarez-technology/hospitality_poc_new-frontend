import { Plus, Search } from 'lucide-react';
import { useState } from 'react';
import SegmentCard from './SegmentCard';

export default function SegmentList({ segments, onViewSegment, onCreateSegment }) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredSegments = segments.filter(segment =>
    segment.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (segment.description && segment.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-neutral-900">Guest Segments</h2>
          <p className="text-sm text-neutral-500">
            {segments.length} segment{segments.length !== 1 ? 's' : ''} configured
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input
              type="text"
              placeholder="Search segments..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#A57865]/20 focus:border-[#A57865] w-[200px]"
            />
          </div>

          {/* Create Button */}
          <button
            onClick={onCreateSegment}
            className="flex items-center gap-2 px-4 py-2 bg-[#A57865] text-white rounded-lg text-sm font-medium hover:bg-[#A57865]/90 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Create Segment
          </button>
        </div>
      </div>

      {/* Segments Grid */}
      {filteredSegments.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredSegments.map((segment) => (
            <SegmentCard
              key={segment.id}
              segment={segment}
              onClick={onViewSegment}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-neutral-200 p-12 text-center">
          <div className="w-16 h-16 rounded-full bg-neutral-100 flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8 text-neutral-400" />
          </div>
          <p className="text-neutral-600 font-medium">No segments found</p>
          <p className="text-sm text-neutral-400 mt-1">
            {searchQuery ? 'Try adjusting your search' : 'Create your first segment to get started'}
          </p>
          {!searchQuery && (
            <button
              onClick={onCreateSegment}
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-[#A57865] text-white rounded-lg text-sm font-medium hover:bg-[#A57865]/90 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Create Segment
            </button>
          )}
        </div>
      )}
    </div>
  );
}
