import { useState, useEffect } from 'react';
import { Calendar, ChevronDown, Zap, Eye, TrendingUp, Check } from 'lucide-react';
import { DropdownMenu, DropdownMenuItem } from '../ui2/DropdownMenu';
import { revenueIntelligenceService } from '../../api/services/revenue-intelligence.service';

const DATE_RANGES = [
  { id: 'today', name: 'Today' },
  { id: '7days', name: 'Next 7 Days' },
  { id: '14days', name: 'Next 14 Days' },
  { id: '30days', name: 'Next 30 Days' }
];

// Fallback used only if the room-types API is unavailable. The real list
// is loaded dynamically below so this dropdown always matches the hotel's
// actual inventory instead of the old demo names.
const DEFAULT_ROOM_CATEGORIES = [
  { id: 'all', name: 'All Rooms' },
];

const CHANNELS = [
  { id: 'all', name: 'All Channels' },
  { id: 'direct', name: 'Direct' },
  { id: 'ota', name: 'OTA' },
  { id: 'corporate', name: 'Corporate' },
  { id: 'travel_agent', name: 'Travel Agent' }
];

// Custom Select Dropdown Component
function SelectDropdown({ value, options, onChange, icon: Icon, className = '' }) {
  const selectedOption = options.find(opt => opt.id === value);

  return (
    <DropdownMenu
      align="start"
      trigger={
        <button
          type="button"
          className={`flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-[11px] sm:text-[13px] font-medium text-neutral-700 hover:border-neutral-300 hover:bg-neutral-100 transition-colors ${className}`}
        >
          {Icon && <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-terra-500" />}
          <span className="max-w-[80px] sm:max-w-none truncate">{selectedOption?.name}</span>
          <ChevronDown className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-neutral-400 ml-0.5 sm:ml-1 flex-shrink-0" />
        </button>
      }
    >
      {options.map((option) => (
        <DropdownMenuItem
          key={option.id}
          onSelect={() => onChange(option.id)}
          className={value === option.id ? 'bg-terra-50 text-terra-700' : ''}
        >
          <span className="flex items-center gap-2 w-full">
            <span className="flex-1">{option.name}</span>
            {value === option.id && <Check className="w-3.5 h-3.5 text-terra-600" />}
          </span>
        </DropdownMenuItem>
      ))}
    </DropdownMenu>
  );
}

export default function ControlsBar({
  settings,
  onSettingsChange,
  dateRange: dateRangeProp,
  onDateRangeChange,
  roomCategory: roomCategoryProp,
  onRoomCategoryChange,
  channel: channelProp,
  onChannelChange,
}) {
  // If parent controls dateRange, use it; otherwise keep local state so this
  // component still works standalone. When the parent prop changes, sync.
  const [dateRange, setDateRangeLocal] = useState(dateRangeProp ?? '7days');
  useEffect(() => {
    if (dateRangeProp !== undefined && dateRangeProp !== dateRange) {
      setDateRangeLocal(dateRangeProp);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateRangeProp]);
  const setDateRange = (val) => {
    setDateRangeLocal(val);
    if (onDateRangeChange) onDateRangeChange(val);
  };

  // Room category may be parent-controlled (so the parent can filter revenue)
  // or local-only (standalone fallback).
  const [roomCategoryLocal, setRoomCategoryLocal] = useState(roomCategoryProp ?? 'all');
  useEffect(() => {
    if (roomCategoryProp !== undefined && roomCategoryProp !== roomCategoryLocal) {
      setRoomCategoryLocal(roomCategoryProp);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomCategoryProp]);
  const roomCategory = roomCategoryProp ?? roomCategoryLocal;

  // Channel may be parent-controlled (for filtering) or local-only.
  const [channelLocal, setChannelLocal] = useState(channelProp ?? 'all');
  useEffect(() => {
    if (channelProp !== undefined && channelProp !== channelLocal) {
      setChannelLocal(channelProp);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [channelProp]);
  const channel = channelProp ?? channelLocal;
  const setChannel = (val: string) => {
    setChannelLocal(val);
    console.log('[ControlsBar] Channel changed:', val);
    if (onChannelChange) onChannelChange(val);
  };

  // Load real room types so the dropdown reflects actual hotel inventory
  // instead of the hardcoded "Standard / Deluxe / Executive / Presidential
  // / Garden Villa" placeholders that never matched any real property.
  const [roomCategoryOptions, setRoomCategoryOptions] = useState(DEFAULT_ROOM_CATEGORIES);
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await revenueIntelligenceService.getRoomTypes();
        if (cancelled) return;
        const list = Array.isArray(res?.roomTypes) ? res.roomTypes : [];
        console.log('[ControlsBar] Raw room types from API:', list);
        if (list.length > 0) {
          const opts = [
            { id: 'all', name: 'All Rooms', dbId: null },
            ...list.map((rt: any) => ({
              id: String(rt.slug || rt.id || rt.dbId || rt.name),
              name: rt.name || 'Unknown',
              dbId: typeof rt.dbId === 'number' ? rt.dbId : (typeof rt.id === 'number' ? rt.id : null),
            })),
          ];
          console.log('[ControlsBar] Built room category options:', opts);
          setRoomCategoryOptions(opts);
        }
      } catch (err) {
        console.error('[ControlsBar] Failed to load room types:', err);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const setRoomCategory = (val: string) => {
    setRoomCategoryLocal(val);
    const opt = roomCategoryOptions.find((o: any) => o.id === val);
    const dbId = opt && typeof (opt as any).dbId === 'number' ? (opt as any).dbId : null;
    console.log('[ControlsBar] Room category changed:', { val, dbId, option: opt });
    if (onRoomCategoryChange) {
      onRoomCategoryChange(val, dbId);
    }
  };

  const handleToggle = (key) => {
    onSettingsChange({
      ...settings,
      [key]: !settings[key]
    });
  };

  return (
    <div className="flex items-center justify-between gap-3 sm:gap-4 overflow-x-auto">
      {/* Left - Filters */}
      <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
        {/* Date Range */}
        <SelectDropdown
          value={dateRange}
          options={DATE_RANGES}
          onChange={setDateRange}
          icon={Calendar}
        />

        {/* Room Category — populated from the real room-types API */}
        <SelectDropdown
          value={roomCategory}
          options={roomCategoryOptions}
          onChange={setRoomCategory}
        />

        {/* Channel */}
        <SelectDropdown
          value={channel}
          options={CHANNELS}
          onChange={setChannel}
        />
      </div>

      {/* Right - AI Toggles */}
      <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
        {/* Auto-rate */}
        <label className="flex items-center gap-1.5 sm:gap-2.5 cursor-pointer group px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg hover:bg-neutral-50 transition-colors flex-shrink-0">
          <div className={`w-4 h-4 sm:w-5 sm:h-5 rounded flex items-center justify-center ${
            settings?.autoRate ? 'bg-sage-100' : 'bg-neutral-100'
          }`}>
            <Zap className={`w-2.5 h-2.5 sm:w-3 sm:h-3 ${settings?.autoRate ? 'text-sage-600' : 'text-neutral-400'}`} />
          </div>
          <span className="text-[11px] sm:text-[13px] font-medium text-neutral-600 group-hover:text-neutral-900 transition-colors hidden sm:inline">Auto-rate</span>
          <button
            onClick={() => handleToggle('autoRate')}
            className={`relative w-8 h-4 sm:w-9 sm:h-5 rounded-full transition-colors ${
              settings?.autoRate ? 'bg-sage-500' : 'bg-neutral-200'
            }`}
          >
            <span
              className={`absolute top-0.5 w-3 h-3 sm:w-4 sm:h-4 bg-white rounded-full shadow-sm transition-transform ${
                settings?.autoRate ? 'left-[16px] sm:left-[18px]' : 'left-0.5'
              }`}
            />
          </button>
        </label>

        {/* Competitor Scan */}
        <label className="flex items-center gap-1.5 sm:gap-2.5 cursor-pointer group px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg hover:bg-neutral-50 transition-colors flex-shrink-0">
          <div className={`w-4 h-4 sm:w-5 sm:h-5 rounded flex items-center justify-center ${
            settings?.competitorScan ? 'bg-ocean-100' : 'bg-neutral-100'
          }`}>
            <Eye className={`w-2.5 h-2.5 sm:w-3 sm:h-3 ${settings?.competitorScan ? 'text-ocean-600' : 'text-neutral-400'}`} />
          </div>
          <span className="text-[11px] sm:text-[13px] font-medium text-neutral-600 group-hover:text-neutral-900 transition-colors hidden sm:inline">Competitor Scan</span>
          <button
            onClick={() => handleToggle('competitorScan')}
            className={`relative w-8 h-4 sm:w-9 sm:h-5 rounded-full transition-colors ${
              settings?.competitorScan ? 'bg-ocean-500' : 'bg-neutral-200'
            }`}
          >
            <span
              className={`absolute top-0.5 w-3 h-3 sm:w-4 sm:h-4 bg-white rounded-full shadow-sm transition-transform ${
                settings?.competitorScan ? 'left-[16px] sm:left-[18px]' : 'left-0.5'
              }`}
            />
          </button>
        </label>

        {/* Demand Pricing */}
        <label className="flex items-center gap-1.5 sm:gap-2.5 cursor-pointer group px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg hover:bg-neutral-50 transition-colors flex-shrink-0">
          <div className={`w-4 h-4 sm:w-5 sm:h-5 rounded flex items-center justify-center ${
            settings?.demandPricing ? 'bg-terra-100' : 'bg-neutral-100'
          }`}>
            <TrendingUp className={`w-2.5 h-2.5 sm:w-3 sm:h-3 ${settings?.demandPricing ? 'text-terra-600' : 'text-neutral-400'}`} />
          </div>
          <span className="text-[11px] sm:text-[13px] font-medium text-neutral-600 group-hover:text-neutral-900 transition-colors hidden sm:inline">Demand Pricing</span>
          <button
            onClick={() => handleToggle('demandPricing')}
            className={`relative w-8 h-4 sm:w-9 sm:h-5 rounded-full transition-colors ${
              settings?.demandPricing ? 'bg-terra-500' : 'bg-neutral-200'
            }`}
          >
            <span
              className={`absolute top-0.5 w-3 h-3 sm:w-4 sm:h-4 bg-white rounded-full shadow-sm transition-transform ${
                settings?.demandPricing ? 'left-[16px] sm:left-[18px]' : 'left-0.5'
              }`}
            />
          </button>
        </label>
      </div>
    </div>
  );
}
