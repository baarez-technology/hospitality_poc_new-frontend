/**
 * Min Stay Configuration Drawer
 * Allows admins to set different minimum stay values per room type
 * Following Glimmora Design System v5.0
 */

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Check, ChevronDown } from 'lucide-react';
import { Drawer } from '../ui2/Drawer';
import { Button } from '../ui2/Button';
import { SelectDropdown } from '../ui2/Input';
import DatePicker from '../ui2/DatePicker';
import { cn } from '../../lib/utils';

interface RoomTypeConfig {
  name: string;
  currentMinStay: number;
  newMinStay: number;
}

interface MinStayConfigDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  roomTypes: string[];
  availability: Record<string, Record<string, any>>;
  onApply: (config: {
    startDate: string;
    endDate: string;
    roomConfigs: Array<{ roomType: string; minStay: number }>;
  }) => void;
}

// Generate night options for dropdown
const nightOptions = [1, 2, 3, 4, 5, 6, 7].map(n => ({
  value: String(n),
  label: `${n} night${n > 1 ? 's' : ''}`
}));

export function MinStayConfigModal({
  isOpen,
  onClose,
  roomTypes,
  availability,
  onApply
}: MinStayConfigDrawerProps) {
  // Default date range: today + 30 days
  const today = new Date();
  const defaultEndDate = new Date(today);
  defaultEndDate.setDate(defaultEndDate.getDate() + 29);

  const formatDate = (date: Date) => date.toISOString().split('T')[0];

  const [startDate, setStartDate] = useState(formatDate(today));
  const [endDate, setEndDate] = useState(formatDate(defaultEndDate));
  const [applyAllValue, setApplyAllValue] = useState('2');
  const [isApplying, setIsApplying] = useState(false);
  const [quickApplyRooms, setQuickApplyRooms] = useState<string[]>([]);
  const [quickDropdownOpen, setQuickDropdownOpen] = useState(false);
  const quickDropdownRef = useRef<HTMLDivElement>(null);

  // Sync quick apply selection when roomTypes load
  useEffect(() => {
    setQuickApplyRooms(roomTypes || []);
  }, [roomTypes]);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (quickDropdownRef.current && !quickDropdownRef.current.contains(e.target as Node)) {
        setQuickDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Initialize room configs with current min stay values
  const [roomConfigs, setRoomConfigs] = useState<RoomTypeConfig[]>([]);

  // Sync room configs when roomTypes or availability changes (handles async API loading)
  useEffect(() => {
    if (!roomTypes || roomTypes.length === 0) return;
    const todayStr = formatDate(today);
    setRoomConfigs(roomTypes.map(name => {
      const currentMinStay = availability[todayStr]?.[name]?.restrictions?.minStay || 1;
      return {
        name,
        currentMinStay,
        newMinStay: 2
      };
    }));
  }, [roomTypes, availability]);

  // Calculate days in range
  const daysInRange = useMemo(() => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  }, [startDate, endDate]);

  // Count rooms with changes
  const roomsWithChanges = useMemo(() => {
    return roomConfigs.filter(rc => rc.newMinStay !== rc.currentMinStay).length;
  }, [roomConfigs]);

  const handleQuickApply = () => {
    if (quickApplyRooms.length === 0) return;
    setRoomConfigs(prev => prev.map(rc =>
      quickApplyRooms.includes(rc.name)
        ? { ...rc, newMinStay: parseInt(applyAllValue) }
        : rc
    ));
  };

  const handleRoomConfigChange = (index: number, newMinStay: string) => {
    setRoomConfigs(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], newMinStay: parseInt(newMinStay) };
      return updated;
    });
  };

  const handleSubmit = async () => {
    if (isApplying) return;
    setIsApplying(true);
    try {
      await onApply({
        startDate,
        endDate,
        roomConfigs: roomConfigs.map(rc => ({
          roomType: rc.name,
          minStay: rc.newMinStay
        }))
      });
    } catch (err) {
      console.error('[MinStayConfig] Apply failed:', err);
    } finally {
      setIsApplying(false);
    }
  };

  const renderFooter = () => (
    <div className="flex items-center justify-end w-full gap-3">
      <Button
        type="button"
        variant="ghost"
        onClick={onClose}
        disabled={isApplying}
        className="px-5 py-2 text-[13px] font-semibold"
      >
        Cancel
      </Button>
      <Button
        type="button"
        variant="primary"
        onClick={handleSubmit}
        disabled={isApplying || roomConfigs.length === 0}
        loading={isApplying}
        className="px-5 py-2 text-[13px] font-semibold"
      >
        Apply Changes
      </Button>
    </div>
  );

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title="Set Minimum Stay Restrictions"
      subtitle="Configure minimum stay per room type"
      maxWidth="max-w-2xl"
      footer={renderFooter()}
    >
      <div className="space-y-6">
        {/* Empty state when no room types are available */}
        {(!roomTypes || roomTypes.length === 0) && (
          <div className="p-4 rounded-lg bg-amber-50 border border-amber-200 text-center">
            <p className="text-[13px] text-amber-700 font-medium">
              No room types found. Please ensure room types are configured in the CMS.
            </p>
          </div>
        )}

        {roomTypes && roomTypes.length > 0 && (<>
        {/* Date Range Section */}
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
            {daysInRange} days selected
          </p>
        </div>

        {/* Quick Apply Section */}
        <div>
          <h4 className="text-[11px] font-semibold uppercase tracking-widest text-neutral-900 mb-3">
            Quick Apply
          </h4>
          <div className="p-4 rounded-lg bg-neutral-50 border border-neutral-100">
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-[13px] text-neutral-600">Set</span>

              {/* Multi-select room type picker */}
              <div className="relative" ref={quickDropdownRef}>
                <button
                  type="button"
                  onClick={() => setQuickDropdownOpen(o => !o)}
                  className="inline-flex items-center gap-2 px-3 py-2 text-[13px] border border-neutral-200 rounded-lg bg-white hover:border-neutral-300 transition-colors min-w-[120px] justify-between"
                >
                  <span className="text-neutral-700">
                    {quickApplyRooms.length === 0
                      ? 'No rooms'
                      : quickApplyRooms.length === roomTypes.length
                      ? 'All rooms'
                      : `${quickApplyRooms.length} room${quickApplyRooms.length > 1 ? 's' : ''}`}
                  </span>
                  <ChevronDown className={cn('w-3.5 h-3.5 text-neutral-400 transition-transform', quickDropdownOpen && 'rotate-180')} />
                </button>

                {quickDropdownOpen && (
                  <div className="absolute z-30 top-full mt-1 left-0 w-56 bg-white rounded-lg border border-neutral-200 shadow-lg py-1">
                    {/* All option */}
                    <button
                      type="button"
                      onClick={() => setQuickApplyRooms(
                        quickApplyRooms.length === roomTypes.length ? [] : [...roomTypes]
                      )}
                      className="w-full px-3 py-2 text-[13px] text-left flex items-center gap-2.5 hover:bg-neutral-50 transition-colors font-semibold text-neutral-700"
                    >
                      <div className={cn('w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 transition-colors',
                        quickApplyRooms.length === roomTypes.length ? 'bg-[#A57865] border-[#A57865]' : 'border-neutral-300'
                      )}>
                        {quickApplyRooms.length === roomTypes.length && <Check className="w-2.5 h-2.5 text-white" />}
                      </div>
                      All Room Types
                    </button>
                    <div className="border-t border-neutral-100 my-1" />
                    {roomTypes.map(rt => (
                      <button
                        key={rt}
                        type="button"
                        onClick={() => setQuickApplyRooms(prev =>
                          prev.includes(rt) ? prev.filter(r => r !== rt) : [...prev, rt]
                        )}
                        className="w-full px-3 py-2 text-[13px] text-left flex items-center gap-2.5 hover:bg-neutral-50 transition-colors text-neutral-700"
                      >
                        <div className={cn('w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 transition-colors',
                          quickApplyRooms.includes(rt) ? 'bg-[#A57865] border-[#A57865]' : 'border-neutral-300'
                        )}>
                          {quickApplyRooms.includes(rt) && <Check className="w-2.5 h-2.5 text-white" />}
                        </div>
                        {rt}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <span className="text-[13px] text-neutral-600">to</span>
              <div className="w-32">
                <SelectDropdown
                  value={applyAllValue}
                  onChange={(val) => setApplyAllValue(val)}
                  options={nightOptions}
                  size="md"
                />
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleQuickApply}
                disabled={quickApplyRooms.length === 0}
                className="text-[13px] font-medium"
              >
                Apply
              </Button>
            </div>
          </div>
        </div>

        {/* Room Types Section */}
        <div>
          <h4 className="text-[11px] font-semibold uppercase tracking-widest text-neutral-900 mb-3">
            Per Room Type Configuration
          </h4>
          <div className="border border-neutral-200 rounded-lg overflow-hidden">
            {/* Table Header */}
            <div className="grid grid-cols-12 gap-4 px-4 py-2.5 bg-neutral-50 border-b border-neutral-200">
              <div className="col-span-5 text-[11px] font-medium text-neutral-500 uppercase tracking-wider">
                Room Type
              </div>
              <div className="col-span-3 text-[11px] font-medium text-neutral-500 uppercase tracking-wider text-center">
                Current
              </div>
              <div className="col-span-4 text-[11px] font-medium text-neutral-500 uppercase tracking-wider text-center">
                New Min Stay
              </div>
            </div>

            {/* Room Type Rows */}
            <div className="divide-y divide-neutral-100">
              {roomConfigs.map((config, index) => {
                const hasChange = config.newMinStay !== config.currentMinStay;

                return (
                  <div
                    key={config.name}
                    className={cn(
                      "grid grid-cols-12 gap-4 px-4 py-3 items-center transition-colors",
                      hasChange && "bg-terra-50/30"
                    )}
                  >
                    {/* Room Type Name */}
                    <div className="col-span-5 flex items-center gap-3">
                      <span className="text-[13px] font-medium text-neutral-900 truncate">
                        {config.name}
                      </span>
                      {hasChange && (
                        <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-terra-500" />
                      )}
                    </div>

                    {/* Current Min Stay */}
                    <div className="col-span-3 text-center">
                      <span className="text-[13px] text-neutral-500">
                        {config.currentMinStay} night{config.currentMinStay > 1 ? 's' : ''}
                      </span>
                    </div>

                    {/* New Min Stay Dropdown */}
                    <div className="col-span-4 flex justify-center">
                      <div className="w-28">
                        <SelectDropdown
                          value={String(config.newMinStay)}
                          onChange={(val) => handleRoomConfigChange(index, val)}
                          options={nightOptions}
                          size="md"
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="p-4 rounded-lg bg-neutral-50 border border-neutral-100">
          <p className="text-[13px] text-neutral-600">
            <span className="font-semibold text-neutral-900">Summary:</span>{' '}
            {roomsWithChanges > 0 ? (
              <>
                Updating <span className="font-semibold text-terra-600">{roomsWithChanges}</span> room type{roomsWithChanges > 1 ? 's' : ''}{' '}
                across <span className="font-semibold">{daysInRange}</span> days
                <span className="text-neutral-400 ml-1">({roomsWithChanges * daysInRange} total changes)</span>
              </>
            ) : (
              <span className="text-neutral-500">No changes from current values</span>
            )}
          </p>
        </div>
        </>)}
      </div>
    </Drawer>
  );
}

export default MinStayConfigModal;
