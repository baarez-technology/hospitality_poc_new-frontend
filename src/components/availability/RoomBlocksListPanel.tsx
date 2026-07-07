/**
 * Room Blocks List Panel Component
 * Displays active room blocks with options to edit/unblock (delete)
 */

import React, { useState } from 'react';
import { cn } from '../../lib/utils';
import {
  Ban, Calendar, ChevronDown, ChevronUp, Edit, Trash2,
  AlertTriangle, Wrench, Building2, Users, RefreshCw
} from 'lucide-react';
import { Button } from '../ui2/Button';
import type { RoomBlock } from '../../api/services/availability.service';

interface RoomBlocksListPanelProps {
  blocks: RoomBlock[];
  isLoading?: boolean;
  onEdit?: (block: RoomBlock) => void;
  onDelete?: (blockId: number) => Promise<void>;
  onRefresh?: () => void;
}

const BLOCK_TYPE_CONFIG: Record<string, { icon: typeof Ban; color: string; label: string }> = {
  maintenance: { icon: Wrench, color: 'orange', label: 'Maintenance' },
  renovation: { icon: Building2, color: 'blue', label: 'Renovation' },
  event: { icon: Users, color: 'purple', label: 'Event' },
  overbooking_buffer: { icon: AlertTriangle, color: 'yellow', label: 'Buffer' },
  manual: { icon: Calendar, color: 'gray', label: 'Manual' }
};

export function RoomBlocksListPanel({
  blocks,
  isLoading,
  onEdit,
  onDelete,
  onRefresh
}: RoomBlocksListPanelProps) {
  const [expanded, setExpanded] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const activeBlocks = blocks.filter(b => b.status === 'active');

  const handleDelete = async (blockId: number) => {
    if (!onDelete) return;

    if (!window.confirm('Are you sure you want to unblock these rooms? They will become available for booking.')) {
      return;
    }

    setDeletingId(blockId);
    try {
      await onDelete(blockId);
    } finally {
      setDeletingId(null);
    }
  };

  const formatDateRange = (start: string, end: string) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };

    if (startDate.toDateString() === endDate.toDateString()) {
      return startDate.toLocaleDateString('en-US', options);
    }

    return `${startDate.toLocaleDateString('en-US', options)} - ${endDate.toLocaleDateString('en-US', options)}`;
  };

  const getBlockTypeConfig = (type: string) => {
    return BLOCK_TYPE_CONFIG[type] || BLOCK_TYPE_CONFIG.manual;
  };

  return (
    <div className="bg-white rounded-[10px] overflow-hidden border border-neutral-200/60">
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full px-5 py-4 flex items-center justify-between bg-gradient-to-br from-rose-50 to-white border-b border-neutral-200/60 hover:bg-rose-50/80 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-rose-100 flex items-center justify-center">
            <Ban className="w-5 h-5 text-rose-600" />
          </div>
          <div className="text-left">
            <h3 className="text-sm font-semibold text-neutral-900">Blocked Rooms</h3>
            <p className="text-xs text-neutral-500">
              {activeBlocks.length} active block{activeBlocks.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {onRefresh && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRefresh();
              }}
              className="p-2 rounded-lg hover:bg-neutral-100 transition-colors"
              title="Refresh blocks"
            >
              <RefreshCw className={cn('w-4 h-4 text-neutral-400', isLoading && 'animate-spin')} />
            </button>
          )}
          {expanded ? (
            <ChevronUp className="w-5 h-5 text-neutral-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-neutral-400" />
          )}
        </div>
      </button>

      {/* Content */}
      {expanded && (
        <div className="p-4 max-h-[400px] overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="w-5 h-5 animate-spin text-neutral-400" />
              <span className="ml-2 text-sm text-neutral-500">Loading blocks...</span>
            </div>
          ) : activeBlocks.length === 0 ? (
            <div className="text-center py-8">
              <Ban className="w-12 h-12 text-neutral-200 mx-auto mb-3" />
              <p className="text-sm text-neutral-500">No active room blocks</p>
              <p className="text-xs text-neutral-400 mt-1">
                All rooms are available for booking
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {activeBlocks.map((block) => {
                const typeConfig = getBlockTypeConfig(block.block_type);
                const Icon = typeConfig.icon;
                const isDeleting = deletingId === block.id;

                return (
                  <div
                    key={block.id}
                    className={cn(
                      'p-4 rounded-lg border transition-all duration-200',
                      'bg-neutral-50/50 border-neutral-200 hover:border-neutral-300',
                      isDeleting && 'opacity-50 pointer-events-none'
                    )}
                  >
                    {/* Block Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          'w-9 h-9 rounded-lg flex items-center justify-center',
                          typeConfig.color === 'orange' && 'bg-orange-100',
                          typeConfig.color === 'blue' && 'bg-blue-100',
                          typeConfig.color === 'purple' && 'bg-purple-100',
                          typeConfig.color === 'yellow' && 'bg-amber-100',
                          typeConfig.color === 'gray' && 'bg-neutral-100'
                        )}>
                          <Icon className={cn(
                            'w-4 h-4',
                            typeConfig.color === 'orange' && 'text-orange-600',
                            typeConfig.color === 'blue' && 'text-blue-600',
                            typeConfig.color === 'purple' && 'text-purple-600',
                            typeConfig.color === 'yellow' && 'text-amber-600',
                            typeConfig.color === 'gray' && 'text-neutral-600'
                          )} />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-neutral-900">
                            {block.room_type_name || `Room Type #${block.room_type_id}`}
                          </p>
                          <p className="text-xs text-neutral-500">
                            {typeConfig.label} · {block.quantity} room{block.quantity !== 1 ? 's' : ''}
                          </p>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1">
                        {onEdit && (
                          <button
                            onClick={() => onEdit(block)}
                            className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 transition-colors"
                            title="Edit block"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                        )}
                        {onDelete && (
                          <button
                            onClick={() => handleDelete(block.id)}
                            disabled={isDeleting}
                            className="p-1.5 rounded-lg text-rose-400 hover:text-rose-600 hover:bg-rose-50 transition-colors disabled:opacity-50"
                            title="Unblock (delete)"
                          >
                            {isDeleting ? (
                              <RefreshCw className="w-4 h-4 animate-spin" />
                            ) : (
                              <Trash2 className="w-4 h-4" />
                            )}
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Date Range */}
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="w-3.5 h-3.5 text-neutral-400" />
                      <span className="text-xs font-medium text-neutral-700">
                        {formatDateRange(block.start_date, block.end_date)}
                      </span>
                    </div>

                    {/* Reason */}
                    <p className="text-xs text-neutral-600 bg-white px-3 py-2 rounded-lg border border-neutral-100">
                      {block.reason}
                    </p>

                    {/* Notes */}
                    {block.notes && (
                      <p className="text-xs text-neutral-400 mt-2 italic">
                        Note: {block.notes}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
