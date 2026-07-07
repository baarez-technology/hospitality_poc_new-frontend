/**
 * OOOStatusPanel Component
 * Panel showing OOO status with extend/release actions - Glimmora Design System v5.0
 */

import { useState } from 'react';
import {
  AlertTriangle,
  Clock,
  CalendarPlus,
  CheckCircle2,
  XCircle,
  Loader2,
} from 'lucide-react';
import { Button } from '../../ui2/Button';
import { Badge } from '../../ui2/Badge';
import DatePicker from '../../ui2/DatePicker';

interface OOOStatusPanelProps {
  workOrderId: string | number;
  roomNumber: string;
  isOOO: boolean;
  blockStartDate?: string;
  blockEndDate?: string;
  estimatedCompletion?: string;
  oooCategory?: string;
  affectedBookingsCount?: number;
  onExtend?: (newDate: string, notes?: string) => Promise<boolean>;
  onRelease?: (resolutionNotes?: string) => Promise<boolean>;
  onMarkOOO?: () => void;
}

export default function OOOStatusPanel({
  workOrderId,
  roomNumber,
  isOOO,
  blockStartDate,
  blockEndDate,
  estimatedCompletion,
  oooCategory,
  affectedBookingsCount = 0,
  onExtend,
  onRelease,
  onMarkOOO,
}: OOOStatusPanelProps) {
  const [showExtendForm, setShowExtendForm] = useState(false);
  const [showReleaseForm, setShowReleaseForm] = useState(false);
  const [newEndDate, setNewEndDate] = useState('');
  const [extendNotes, setExtendNotes] = useState('');
  const [releaseNotes, setReleaseNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getDaysRemaining = () => {
    if (!blockEndDate) return 0;
    const end = new Date(blockEndDate);
    const now = new Date();
    return Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  };

  const handleExtend = async () => {
    if (!newEndDate || !onExtend) return;
    setIsSubmitting(true);
    try {
      const success = await onExtend(newEndDate, extendNotes);
      if (success) {
        setShowExtendForm(false);
        setNewEndDate('');
        setExtendNotes('');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRelease = async () => {
    if (!onRelease) return;
    setIsSubmitting(true);
    try {
      const success = await onRelease(releaseNotes);
      if (success) {
        setShowReleaseForm(false);
        setReleaseNotes('');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Not OOO - show option to mark as OOO
  if (!isOOO) {
    return (
      <div className="bg-neutral-50 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-neutral-200 flex items-center justify-center">
              <XCircle className="w-4 h-4 text-neutral-500" />
            </div>
            <div>
              <p className="text-[13px] font-medium text-neutral-900">Room Available</p>
              <p className="text-[11px] text-neutral-500">Room is not blocked for maintenance</p>
            </div>
          </div>
          {onMarkOOO && (
            <Button
              variant="outline"
              size="sm"
              onClick={onMarkOOO}
            >
              Mark as OOO
            </Button>
          )}
        </div>
      </div>
    );
  }

  const daysRemaining = getDaysRemaining();

  return (
    <div className="bg-rose-50 border border-rose-100 rounded-lg overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-rose-100">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-rose-100 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4 text-rose-600" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className="text-[13px] font-semibold text-rose-900">Out of Order</p>
                <Badge variant="danger-solid" size="sm">OOO</Badge>
              </div>
              <p className="text-[11px] text-rose-700 mt-0.5">
                Room {roomNumber} is blocked for maintenance
              </p>
            </div>
          </div>
          {oooCategory && (
            <Badge variant="neutral" size="sm">
              {oooCategory.replace('_', ' ').toUpperCase()}
            </Badge>
          )}
        </div>
      </div>

      {/* Details */}
      <div className="p-4 space-y-3">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-[11px] text-rose-600 font-medium">Block Period</p>
            <p className="text-[13px] text-rose-900 mt-0.5">
              {blockStartDate ? formatDate(blockStartDate) : 'Today'} -{' '}
              {blockEndDate ? formatDate(blockEndDate) : 'N/A'}
            </p>
          </div>
          <div>
            <p className="text-[11px] text-rose-600 font-medium">Days Remaining</p>
            <p className="text-[13px] text-rose-900 mt-0.5">
              {daysRemaining > 0 ? (
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {daysRemaining} day{daysRemaining !== 1 ? 's' : ''}
                </span>
              ) : (
                <span className="text-amber-600 font-medium">Overdue</span>
              )}
            </p>
          </div>
        </div>

        {affectedBookingsCount > 0 && (
          <div className="bg-white/50 rounded-lg p-3 border border-rose-100">
            <p className="text-[12px] text-rose-700">
              <span className="font-semibold">{affectedBookingsCount}</span>{' '}
              affected booking{affectedBookingsCount !== 1 ? 's' : ''} may need attention
            </p>
          </div>
        )}
      </div>

      {/* Actions */}
      {!showExtendForm && !showReleaseForm && (
        <div className="px-4 pb-4 flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            icon={CalendarPlus}
            onClick={() => setShowExtendForm(true)}
            className="flex-1"
          >
            Extend Block
          </Button>
          <Button
            variant="primary"
            size="sm"
            icon={CheckCircle2}
            onClick={() => setShowReleaseForm(true)}
            className="flex-1"
          >
            Complete & Release
          </Button>
        </div>
      )}

      {/* Extend Form */}
      {showExtendForm && (
        <div className="p-4 border-t border-rose-100 bg-white space-y-4">
          <h4 className="text-[13px] font-semibold text-neutral-900">Extend OOO Block</h4>
          <div>
            <label className="text-[11px] font-medium text-neutral-700 mb-2 block">
              New End Date
            </label>
            <DatePicker
              value={newEndDate}
              onChange={setNewEndDate}
              minDate={blockEndDate || new Date().toISOString().split('T')[0]}
            />
          </div>
          <div>
            <label className="text-[11px] font-medium text-neutral-700 mb-2 block">
              Notes (optional)
            </label>
            <textarea
              value={extendNotes}
              onChange={(e) => setExtendNotes(e.target.value)}
              placeholder="Reason for extension..."
              className="w-full h-16 px-3 py-2 rounded-lg border border-neutral-200 text-[13px] resize-none focus:border-terra-400 focus:ring-2 focus:ring-terra-500/10 outline-none"
            />
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setShowExtendForm(false);
                setNewEndDate('');
                setExtendNotes('');
              }}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleExtend}
              disabled={!newEndDate || isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-1" />
                  Extending...
                </>
              ) : (
                'Confirm Extension'
              )}
            </Button>
          </div>
        </div>
      )}

      {/* Release Form */}
      {showReleaseForm && (
        <div className="p-4 border-t border-rose-100 bg-white space-y-4">
          <h4 className="text-[13px] font-semibold text-neutral-900">Complete & Release Room</h4>
          <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-3">
            <p className="text-[12px] text-emerald-700">
              This will complete the work order and release the room block,
              making the room available for bookings again.
            </p>
          </div>
          <div>
            <label className="text-[11px] font-medium text-neutral-700 mb-2 block">
              Resolution Notes
            </label>
            <textarea
              value={releaseNotes}
              onChange={(e) => setReleaseNotes(e.target.value)}
              placeholder="Describe the completed work..."
              className="w-full h-20 px-3 py-2 rounded-lg border border-neutral-200 text-[13px] resize-none focus:border-terra-400 focus:ring-2 focus:ring-terra-500/10 outline-none"
            />
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setShowReleaseForm(false);
                setReleaseNotes('');
              }}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleRelease}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-1" />
                  Releasing...
                </>
              ) : (
                'Complete & Release'
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
