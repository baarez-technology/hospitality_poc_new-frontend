/**
 * Stop Sell Configuration Drawer
 * Allows admins to selectively apply stop sell for specific dates and room types
 * Following Glimmora Design System v5.0
 */

import { useState, useMemo, useEffect } from 'react';
import { Drawer } from '../ui2/Drawer';
import { Button } from '../ui2/Button';
import DatePicker from '../ui2/DatePicker';
import { cn } from '../../lib/utils';
import { AlertTriangle, Ban, Check, Minus } from 'lucide-react';

interface StopSellConfigProps {
  isOpen: boolean;
  onClose: () => void;
  roomTypes: string[];
  availability: Record<string, Record<string, any>>;
  onApply: (config: {
    startDate: string;
    endDate: string;
    roomTypes: string[];
    action: 'enable' | 'disable';
  }) => void;
}

export function StopSellConfigModal({
  isOpen,
  onClose,
  roomTypes,
  availability,
  onApply
}: StopSellConfigProps) {
  const today = new Date();
  const defaultEndDate = new Date(today);
  defaultEndDate.setDate(defaultEndDate.getDate() + 6); // Default to 1 week

  const formatDate = (date: Date) => date.toISOString().split('T')[0];

  const [startDate, setStartDate] = useState(formatDate(today));
  const [endDate, setEndDate] = useState(formatDate(defaultEndDate));
  const [selectedRoomTypes, setSelectedRoomTypes] = useState<string[]>([...roomTypes]);
  const [action, setAction] = useState<'enable' | 'disable'>('enable');

  // Reset state when drawer opens
  useEffect(() => {
    if (isOpen) {
      setStartDate(formatDate(today));
      const end = new Date(today);
      end.setDate(end.getDate() + 6);
      setEndDate(formatDate(end));
      setSelectedRoomTypes([...roomTypes]);
      setAction('enable');
    }
  }, [isOpen]);

  // Calculate days in range
  const daysInRange = useMemo(() => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (end < start) return 0;
    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  }, [startDate, endDate]);

  // Count currently stop-sold cells in selected range
  const currentStopSellCount = useMemo(() => {
    let count = 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    let current = new Date(start);
    while (current <= end) {
      const dateStr = current.toISOString().split('T')[0];
      selectedRoomTypes.forEach(rt => {
        if (availability[dateStr]?.[rt]?.stopSell) count++;
      });
      current.setDate(current.getDate() + 1);
    }
    return count;
  }, [startDate, endDate, selectedRoomTypes, availability]);

  const toggleRoomType = (rt: string) => {
    setSelectedRoomTypes(prev =>
      prev.includes(rt) ? prev.filter(r => r !== rt) : [...prev, rt]
    );
  };

  const selectAllRooms = () => setSelectedRoomTypes([...roomTypes]);
  const deselectAllRooms = () => setSelectedRoomTypes([]);

  const isValid = selectedRoomTypes.length > 0 && daysInRange > 0;

  const handleSubmit = () => {
    if (!isValid) return;
    onApply({
      startDate,
      endDate,
      roomTypes: selectedRoomTypes,
      action,
    });
  };

  const totalChanges = selectedRoomTypes.length * daysInRange;

  const renderFooter = () => (
    <div className="flex items-center justify-between w-full">
      <p className="text-[11px] text-neutral-400">
        {totalChanges} cell{totalChanges !== 1 ? 's' : ''} will be affected
      </p>
      <div className="flex items-center gap-3">
        <Button
          type="button"
          variant="ghost"
          onClick={onClose}
          className="px-5 py-2 text-[13px] font-semibold"
        >
          Cancel
        </Button>
        <Button
          type="button"
          variant={action === 'enable' ? 'danger' : 'primary'}
          onClick={handleSubmit}
          disabled={!isValid}
          className="px-5 py-2 text-[13px] font-semibold"
        >
          {action === 'enable' ? 'Apply Stop Sell' : 'Remove Stop Sell'}
        </Button>
      </div>
    </div>
  );

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title="Stop Sell Configuration"
      subtitle="Block or unblock bookings for selected dates and room types"
      maxWidth="max-w-2xl"
      footer={renderFooter()}
    >
      <div className="space-y-6">
        {/* Action Toggle */}
        <div>
          <h4 className="text-[11px] font-semibold uppercase tracking-widest text-neutral-900 mb-3">
            Action
          </h4>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setAction('enable')}
              className={cn(
                'flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-[13px] font-semibold transition-all border-2',
                action === 'enable'
                  ? 'bg-rose-50 border-rose-300 text-rose-700'
                  : 'bg-white border-neutral-200 text-neutral-600 hover:border-neutral-300'
              )}
            >
              <Ban className="w-4 h-4" />
              Enable Stop Sell
            </button>
            <button
              type="button"
              onClick={() => setAction('disable')}
              className={cn(
                'flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-[13px] font-semibold transition-all border-2',
                action === 'disable'
                  ? 'bg-sage-50 border-sage-300 text-sage-700'
                  : 'bg-white border-neutral-200 text-neutral-600 hover:border-neutral-300'
              )}
            >
              <Check className="w-4 h-4" />
              Remove Stop Sell
            </button>
          </div>
        </div>

        {/* Date Range */}
        <div>
          <h4 className="text-[11px] font-semibold uppercase tracking-widest text-neutral-900 mb-3">
            Date Range
          </h4>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-medium text-neutral-500 mb-1.5">
                Start Date
              </label>
              <DatePicker
                value={startDate}
                onChange={(date) => setStartDate(date)}
                placeholder="Select start date"
                minDate={formatDate(today)}
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-neutral-500 mb-1.5">
                End Date
              </label>
              <DatePicker
                value={endDate}
                onChange={(date) => setEndDate(date)}
                placeholder="Select end date"
                minDate={startDate}
                className="w-full"
              />
            </div>
          </div>
          <p className="text-[11px] text-neutral-400 mt-2">
            {daysInRange} day{daysInRange !== 1 ? 's' : ''} selected
          </p>
        </div>

        {/* Room Types */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-[11px] font-semibold uppercase tracking-widest text-neutral-900">
              Room Types
            </h4>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={selectAllRooms}
                className="text-[11px] font-medium text-[#5C9BA4] hover:text-[#4E8A93] transition-colors"
              >
                Select All
              </button>
              <span className="text-neutral-300">|</span>
              <button
                type="button"
                onClick={deselectAllRooms}
                className="text-[11px] font-medium text-neutral-400 hover:text-neutral-600 transition-colors"
              >
                Deselect All
              </button>
            </div>
          </div>

          <div className="border border-neutral-200 rounded-lg overflow-hidden">
            <div className="divide-y divide-neutral-100">
              {roomTypes.map((rt) => {
                const isSelected = selectedRoomTypes.includes(rt);
                // Check current stop sell status for this room type (today)
                const todayStr = formatDate(today);
                const currentlyStopSold = availability[todayStr]?.[rt]?.stopSell || false;

                return (
                  <button
                    key={rt}
                    type="button"
                    onClick={() => toggleRoomType(rt)}
                    className={cn(
                      'w-full flex items-center justify-between px-4 py-3 transition-colors text-left',
                      isSelected ? 'bg-terra-50/30' : 'hover:bg-neutral-50'
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        'w-5 h-5 rounded-md flex items-center justify-center border-2 transition-all',
                        isSelected
                          ? 'bg-terra-500 border-terra-500 text-white'
                          : 'bg-white border-neutral-300'
                      )}>
                        {isSelected && <Check className="w-3 h-3" />}
                      </div>
                      <span className="text-[13px] font-medium text-neutral-900">{rt}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {currentlyStopSold && (
                        <span className="px-2 py-0.5 text-[10px] font-medium bg-rose-50 text-rose-600 rounded border border-rose-200">
                          Currently Stopped
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <p className="text-[11px] text-neutral-400 mt-2">
            {selectedRoomTypes.length} of {roomTypes.length} room type{roomTypes.length !== 1 ? 's' : ''} selected
          </p>
        </div>

        {/* Warning / Summary */}
        {action === 'enable' && isValid && (
          <div className="flex items-start gap-3 p-4 rounded-lg bg-rose-50 border border-rose-200">
            <AlertTriangle className="w-4 h-4 text-rose-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-[12px] font-semibold text-rose-700">Stop Sell Warning</p>
              <p className="text-[11px] text-rose-600 mt-0.5">
                This will block all new bookings for{' '}
                <span className="font-semibold">{selectedRoomTypes.length}</span> room type{selectedRoomTypes.length !== 1 ? 's' : ''}{' '}
                across <span className="font-semibold">{daysInRange}</span> day{daysInRange !== 1 ? 's' : ''}.{' '}
                {currentStopSellCount > 0 && (
                  <span className="text-neutral-500">
                    ({currentStopSellCount} cell{currentStopSellCount !== 1 ? 's' : ''} already stop-sold)
                  </span>
                )}
              </p>
            </div>
          </div>
        )}

        {action === 'disable' && isValid && (
          <div className="p-4 rounded-lg bg-sage-50 border border-sage-200">
            <p className="text-[12px] text-sage-700">
              <span className="font-semibold">Summary:</span>{' '}
              Removing stop sell from{' '}
              <span className="font-semibold">{selectedRoomTypes.length}</span> room type{selectedRoomTypes.length !== 1 ? 's' : ''}{' '}
              across <span className="font-semibold">{daysInRange}</span> day{daysInRange !== 1 ? 's' : ''}.
              Bookings will be re-enabled for these dates.
            </p>
          </div>
        )}
      </div>
    </Drawer>
  );
}

export default StopSellConfigModal;
