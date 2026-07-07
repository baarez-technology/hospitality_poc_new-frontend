/**
 * Bulk Update Drawer
 * Allows admins to update rates, inventory, and restrictions in bulk
 * Following Glimmora Design System v5.0
 */

import React, { useState, useMemo } from 'react';
import { Drawer } from '../ui2/Drawer';
import { Button } from '../ui2/Button';
import { SelectDropdown } from '../ui2/Input';
import DatePicker from '../ui2/DatePicker';
import { Check, DollarSign, Package, Lock, Percent } from 'lucide-react';
import { cn } from '../../lib/utils';

interface BulkUpdateDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  roomTypes: string[];
  availability: Record<string, Record<string, any>>;
  onApply: (config: {
    startDate: string;
    endDate: string;
    roomTypes: string[];
    updates: {
      rate?: { type: 'fixed' | 'adjust' | 'percent'; value: number };
      inventory?: number;
      restrictions?: {
        minStay?: number;
        maxStay?: number;
        cta?: boolean;
        ctd?: boolean;
        stopSell?: boolean;
      };
    };
  }) => void;
}

// Room type options for multi-select
const ALL_ROOM_TYPES = [
  'Minimalist Studio',
  'Coastal Retreat',
  'Urban Oasis',
  'Sunset Vista',
  'Pacific Suite',
  'Wellness Suite',
  'Family Sanctuary',
  'Oceanfront Penthouse'
];

// Rate adjustment type options
const rateAdjustmentOptions = [
  { value: 'fixed', label: 'Set fixed rate' },
  { value: 'adjust', label: 'Adjust by amount (+/-)' },
  { value: 'percent', label: 'Adjust by percentage (+/-)' }
];

// Min/Max stay options
const stayOptions = [
  { value: '0', label: 'No change' },
  { value: '1', label: '1 night' },
  { value: '2', label: '2 nights' },
  { value: '3', label: '3 nights' },
  { value: '4', label: '4 nights' },
  { value: '5', label: '5 nights' },
  { value: '6', label: '6 nights' },
  { value: '7', label: '7 nights' }
];

export function BulkUpdateDrawer({
  isOpen,
  onClose,
  roomTypes,
  availability,
  onApply
}: BulkUpdateDrawerProps) {
  // Default date range: today + 7 days
  const today = new Date();
  const defaultEndDate = new Date(today);
  defaultEndDate.setDate(defaultEndDate.getDate() + 6);

  const formatDate = (date: Date) => date.toISOString().split('T')[0];

  // Form state
  const [startDate, setStartDate] = useState(formatDate(today));
  const [endDate, setEndDate] = useState(formatDate(defaultEndDate));
  const [selectedRoomTypes, setSelectedRoomTypes] = useState<string[]>(ALL_ROOM_TYPES);

  // Update toggles
  const [updateRate, setUpdateRate] = useState(false);
  const [updateInventory, setUpdateInventory] = useState(false);
  const [updateRestrictions, setUpdateRestrictions] = useState(false);

  // Rate settings
  const [rateAdjustType, setRateAdjustType] = useState('fixed');
  const [rateValue, setRateValue] = useState('');

  // Inventory settings
  const [inventoryValue, setInventoryValue] = useState('');

  // Restriction settings
  const [minStay, setMinStay] = useState('0');
  const [maxStay, setMaxStay] = useState('0');
  const [cta, setCta] = useState(false);
  const [ctd, setCtd] = useState(false);
  const [stopSell, setStopSell] = useState(false);

  // Calculate days in range
  const daysInRange = useMemo(() => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  }, [startDate, endDate]);

  // Toggle room type selection
  const handleToggleRoomType = (roomType: string) => {
    setSelectedRoomTypes(prev =>
      prev.includes(roomType)
        ? prev.filter(rt => rt !== roomType)
        : [...prev, roomType]
    );
  };

  // Select/deselect all room types
  const handleSelectAllRoomTypes = () => {
    setSelectedRoomTypes(
      selectedRoomTypes.length === ALL_ROOM_TYPES.length ? [] : [...ALL_ROOM_TYPES]
    );
  };

  // Build updates object
  const buildUpdates = () => {
    const updates: any = {};

    if (updateRate && rateValue) {
      updates.rate = {
        type: rateAdjustType,
        value: parseFloat(rateValue)
      };
    }

    if (updateInventory && inventoryValue) {
      updates.inventory = parseInt(inventoryValue);
    }

    if (updateRestrictions) {
      updates.restrictions = {};
      if (minStay !== '0') updates.restrictions.minStay = parseInt(minStay);
      if (maxStay !== '0') updates.restrictions.maxStay = parseInt(maxStay);
      if (cta) updates.restrictions.cta = true;
      if (ctd) updates.restrictions.ctd = true;
      if (stopSell) updates.restrictions.stopSell = true;
    }

    return updates;
  };

  // Check if form is valid
  const isFormValid = useMemo(() => {
    if (selectedRoomTypes.length === 0) return false;
    if (!updateRate && !updateInventory && !updateRestrictions) return false;
    if (updateRate && !rateValue) return false;
    if (updateInventory && !inventoryValue) return false;
    if (updateRestrictions && minStay === '0' && maxStay === '0' && !cta && !ctd && !stopSell) return false;
    return true;
  }, [selectedRoomTypes, updateRate, updateInventory, updateRestrictions, rateValue, inventoryValue, minStay, maxStay, cta, ctd, stopSell]);

  // Calculate total changes
  const totalChanges = useMemo(() => {
    return selectedRoomTypes.length * daysInRange;
  }, [selectedRoomTypes, daysInRange]);

  const handleSubmit = () => {
    if (!isFormValid) return;

    onApply({
      startDate,
      endDate,
      roomTypes: selectedRoomTypes,
      updates: buildUpdates()
    });
  };

  const renderFooter = () => (
    <div className="flex items-center justify-end w-full gap-3">
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
        variant="primary"
        onClick={handleSubmit}
        disabled={!isFormValid}
        className="px-5 py-2 text-[13px] font-semibold"
      >
        Apply Bulk Update
      </Button>
    </div>
  );

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title="Bulk Update"
      subtitle="Update rates, inventory, and restrictions in bulk"
      maxWidth="max-w-2xl"
      footer={renderFooter()}
    >
      <div className="space-y-6">
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

        {/* Room Types Section */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-[11px] font-semibold uppercase tracking-widest text-neutral-900">
              Room Types
            </h4>
            <button
              type="button"
              onClick={handleSelectAllRoomTypes}
              className="text-[11px] font-medium text-terra-600 hover:text-terra-700"
            >
              {selectedRoomTypes.length === ALL_ROOM_TYPES.length ? 'Deselect All' : 'Select All'}
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {ALL_ROOM_TYPES.map((roomType) => {
              const isSelected = selectedRoomTypes.includes(roomType);
              return (
                <button
                  key={roomType}
                  type="button"
                  onClick={() => handleToggleRoomType(roomType)}
                  className={cn(
                    "flex items-center gap-2.5 px-3 py-2.5 rounded-lg border text-[13px] font-medium text-left transition-all",
                    isSelected
                      ? "border-terra-300 bg-terra-50 text-terra-700"
                      : "border-neutral-200 bg-white text-neutral-700 hover:border-neutral-300"
                  )}
                >
                  <div className={cn(
                    "w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all",
                    isSelected
                      ? "bg-terra-500 border-terra-500"
                      : "border-neutral-300 bg-white"
                  )}>
                    {isSelected && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                  </div>
                  <span className="truncate">{roomType}</span>
                </button>
              );
            })}
          </div>
          <p className="text-[11px] text-neutral-400 mt-2">
            {selectedRoomTypes.length} of {ALL_ROOM_TYPES.length} room types selected
          </p>
        </div>

        {/* Update Options Section */}
        <div>
          <h4 className="text-[11px] font-semibold uppercase tracking-widest text-neutral-900 mb-3">
            What to Update
          </h4>
          <div className="space-y-3">
            {/* Rate Update Toggle */}
            <div className={cn(
              "rounded-lg border transition-all overflow-hidden",
              updateRate ? "border-terra-200 bg-terra-50/30" : "border-neutral-200 bg-white"
            )}>
              <button
                type="button"
                onClick={() => setUpdateRate(!updateRate)}
                className="w-full flex items-center gap-3 p-4"
              >
                <div className={cn(
                  "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0",
                  updateRate ? "bg-terra-100" : "bg-neutral-100"
                )}>
                  <DollarSign className={cn("w-4 h-4", updateRate ? "text-terra-600" : "text-neutral-500")} />
                </div>
                <div className="flex-1 text-left">
                  <p className="text-[13px] font-semibold text-neutral-900">Update Rates</p>
                  <p className="text-[11px] text-neutral-500">Modify room rates</p>
                </div>
                <div className={cn(
                  "w-5 h-5 rounded-full flex items-center justify-center transition-all flex-shrink-0",
                  updateRate ? "bg-terra-500" : "border border-neutral-300 bg-white"
                )}>
                  {updateRate && <Check className="w-3 h-3 text-white" />}
                </div>
              </button>
              {updateRate && (
                <div className="px-4 pb-4 pt-0 space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-medium text-neutral-500 mb-1.5">
                        Adjustment Type
                      </label>
                      <SelectDropdown
                        value={rateAdjustType}
                        onChange={(val) => setRateAdjustType(val)}
                        options={rateAdjustmentOptions}
                        size="md"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-neutral-500 mb-1.5">
                        {rateAdjustType === 'percent' ? 'Percentage' : 'Amount ($)'}
                      </label>
                      <input
                        type="number"
                        value={rateValue}
                        onChange={(e) => setRateValue(e.target.value)}
                        placeholder={rateAdjustType === 'percent' ? 'e.g., 15 or -10' : 'e.g., 250 or -50'}
                        className="w-full h-9 px-3.5 rounded-lg text-[13px] bg-white border border-neutral-200 text-neutral-900 placeholder:text-neutral-400 hover:border-neutral-300 focus:border-terra-400 focus:ring-2 focus:ring-terra-500/10 focus:outline-none transition-all"
                      />
                    </div>
                  </div>
                  <p className="text-[11px] text-neutral-400">
                    {rateAdjustType === 'fixed' && 'Set all selected rooms to this rate'}
                    {rateAdjustType === 'adjust' && 'Add or subtract this amount from current rates'}
                    {rateAdjustType === 'percent' && 'Increase or decrease rates by this percentage'}
                  </p>
                </div>
              )}
            </div>

            {/* Inventory Update Toggle */}
            <div className={cn(
              "rounded-lg border transition-all overflow-hidden",
              updateInventory ? "border-terra-200 bg-terra-50/30" : "border-neutral-200 bg-white"
            )}>
              <button
                type="button"
                onClick={() => setUpdateInventory(!updateInventory)}
                className="w-full flex items-center gap-3 p-4"
              >
                <div className={cn(
                  "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0",
                  updateInventory ? "bg-terra-100" : "bg-neutral-100"
                )}>
                  <Package className={cn("w-4 h-4", updateInventory ? "text-terra-600" : "text-neutral-500")} />
                </div>
                <div className="flex-1 text-left">
                  <p className="text-[13px] font-semibold text-neutral-900">Update Inventory</p>
                  <p className="text-[11px] text-neutral-500">Set available room count</p>
                </div>
                <div className={cn(
                  "w-5 h-5 rounded-full flex items-center justify-center transition-all flex-shrink-0",
                  updateInventory ? "bg-terra-500" : "border border-neutral-300 bg-white"
                )}>
                  {updateInventory && <Check className="w-3 h-3 text-white" />}
                </div>
              </button>
              {updateInventory && (
                <div className="px-4 pb-4 pt-0">
                  <label className="block text-[11px] font-medium text-neutral-500 mb-1.5">
                    Available Rooms
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={inventoryValue}
                    onChange={(e) => setInventoryValue(e.target.value)}
                    placeholder="e.g., 5"
                    className="w-full h-9 px-3.5 rounded-lg text-[13px] bg-white border border-neutral-200 text-neutral-900 placeholder:text-neutral-400 hover:border-neutral-300 focus:border-terra-400 focus:ring-2 focus:ring-terra-500/10 focus:outline-none transition-all"
                  />
                </div>
              )}
            </div>

            {/* Restrictions Update Toggle */}
            <div className={cn(
              "rounded-lg border transition-all overflow-hidden",
              updateRestrictions ? "border-terra-200 bg-terra-50/30" : "border-neutral-200 bg-white"
            )}>
              <button
                type="button"
                onClick={() => setUpdateRestrictions(!updateRestrictions)}
                className="w-full flex items-center gap-3 p-4"
              >
                <div className={cn(
                  "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0",
                  updateRestrictions ? "bg-terra-100" : "bg-neutral-100"
                )}>
                  <Lock className={cn("w-4 h-4", updateRestrictions ? "text-terra-600" : "text-neutral-500")} />
                </div>
                <div className="flex-1 text-left">
                  <p className="text-[13px] font-semibold text-neutral-900">Update Restrictions</p>
                  <p className="text-[11px] text-neutral-500">Set booking restrictions</p>
                </div>
                <div className={cn(
                  "w-5 h-5 rounded-full flex items-center justify-center transition-all flex-shrink-0",
                  updateRestrictions ? "bg-terra-500" : "border border-neutral-300 bg-white"
                )}>
                  {updateRestrictions && <Check className="w-3 h-3 text-white" />}
                </div>
              </button>
              {updateRestrictions && (
                <div className="px-4 pb-4 pt-0 space-y-4">
                  {/* Length of Stay */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-medium text-neutral-500 mb-1.5">
                        Minimum Stay
                      </label>
                      <SelectDropdown
                        value={minStay}
                        onChange={(val) => setMinStay(val)}
                        options={stayOptions}
                        size="md"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-neutral-500 mb-1.5">
                        Maximum Stay
                      </label>
                      <SelectDropdown
                        value={maxStay}
                        onChange={(val) => setMaxStay(val)}
                        options={stayOptions}
                        size="md"
                      />
                    </div>
                  </div>

                  {/* Restriction Toggles */}
                  <div className="space-y-2">
                    <label className="block text-[11px] font-medium text-neutral-500 mb-1.5">
                      Booking Restrictions
                    </label>
                    <div className="space-y-2">
                      {[
                        { key: 'cta', label: 'Closed to Arrival (CTA)', description: 'No check-ins allowed', state: cta, setter: setCta, color: 'gold' },
                        { key: 'ctd', label: 'Closed to Departure (CTD)', description: 'No check-outs allowed', state: ctd, setter: setCtd, color: 'sage' },
                        { key: 'stopSell', label: 'Stop Sell', description: 'Block all bookings', state: stopSell, setter: setStopSell, color: 'rose' }
                      ].map((restriction) => (
                        <button
                          key={restriction.key}
                          type="button"
                          onClick={() => restriction.setter(!restriction.state)}
                          className={cn(
                            "w-full flex items-center justify-between p-3 rounded-lg border transition-all",
                            restriction.state
                              ? `bg-${restriction.color}-50 border-${restriction.color}-200`
                              : "bg-white border-neutral-200 hover:border-neutral-300"
                          )}
                        >
                          <div className="text-left">
                            <p className="text-[13px] font-medium text-neutral-900">{restriction.label}</p>
                            <p className="text-[11px] text-neutral-500">{restriction.description}</p>
                          </div>
                          <div className={cn(
                            "w-5 h-5 rounded-full flex items-center justify-center transition-all flex-shrink-0",
                            restriction.state
                              ? `bg-${restriction.color}-500`
                              : "border border-neutral-300 bg-white"
                          )}>
                            {restriction.state && <Check className="w-3 h-3 text-white" />}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="p-4 rounded-lg bg-neutral-50 border border-neutral-100">
          <p className="text-[13px] text-neutral-600">
            <span className="font-semibold text-neutral-900">Summary:</span>{' '}
            {isFormValid ? (
              <>
                Updating{' '}
                <span className="font-semibold text-terra-600">{selectedRoomTypes.length}</span> room type{selectedRoomTypes.length > 1 ? 's' : ''}{' '}
                across <span className="font-semibold">{daysInRange}</span> days
                <span className="text-neutral-400 ml-1">({totalChanges} total updates)</span>
              </>
            ) : (
              <span className="text-neutral-500">Select room types and at least one update option</span>
            )}
          </p>
        </div>
      </div>
    </Drawer>
  );
}

export default BulkUpdateDrawer;
