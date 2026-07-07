import { Plus, Search, Target } from 'lucide-react';
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
      <div className="bg-white rounded-[10px] border border-neutral-200">
        <div className="px-5 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-[8px] bg-[#A57865]/10 flex items-center justify-center flex-shrink-0">
                <Target className="w-[18px] h-[18px] text-[#A57865]" />
              </div>
              <div>
                <h3 className="text-[15px] font-semibold text-neutral-900">Guest Segments</h3>
                <p className="text-[12px] text-neutral-400 mt-0.5">
                  {segments.length} segment{segments.length !== 1 ? 's' : ''} configured
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-400" />
                <input
                  type="text"
                  placeholder="Search segments..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-3.5 py-2 border border-neutral-200 rounded-[8px] text-[13px] text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#A57865]/20 focus:border-[#A57865] w-[180px] transition-colors"
                />
              </div>

              {/* Create Button */}
              <button
                onClick={onCreateSegment}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-[#A57865] text-white rounded-[8px] text-[13px] font-semibold hover:bg-[#8E6554] transition-colors whitespace-nowrap"
              >
                <Plus className="w-3.5 h-3.5" />
                Create Segment
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Segments Grid */}
      {filteredSegments.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {filteredSegments.map((segment) => (
            <SegmentCard
              key={segment.id}
              segment={segment}
              onClick={onViewSegment}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-[10px] border border-neutral-200 p-12 text-center">
          <div className="w-12 h-12 rounded-[10px] bg-neutral-100 flex items-center justify-center mx-auto mb-3">
            <Search className="w-6 h-6 text-neutral-300" />
          </div>
          <p className="text-[13px] font-medium text-neutral-600">No segments found</p>
          <p className="text-[11px] text-neutral-400 mt-1">
            {searchQuery ? 'Try adjusting your search' : 'Create your first segment to get started'}
          </p>
          {!searchQuery && (
            <button
              onClick={onCreateSegment}
              className="mt-4 inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#A57865] text-white rounded-[8px] text-[13px] font-semibold hover:bg-[#8E6554] transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Create Segment
            </button>
          )}
        </div>
      )}
    </div>
  );
}
