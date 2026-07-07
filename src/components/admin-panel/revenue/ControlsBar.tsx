import { useState, useEffect, useCallback } from 'react';
import { Calendar, Filter, Settings, RefreshCw, Loader2 } from 'lucide-react';
import { revenueIntelligenceService, AutoPricingSettings } from '../../../api/services/revenue-intelligence.service';
import { useToast } from '../../../context/ToastContext';

// Room categories matching database
const ROOM_CATEGORIES = [
  { id: 'all', name: 'All Rooms' },
  { id: 'minimalist-studio', name: 'Minimalist Studio' },
  { id: 'coastal-retreat', name: 'Coastal Retreat' },
  { id: 'urban-oasis', name: 'Urban Oasis' },
  { id: 'sunset-vista', name: 'Sunset Vista' },
  { id: 'pacific-suite', name: 'Pacific Suite' },
  { id: 'wellness-suite', name: 'Wellness Suite' },
  { id: 'family-sanctuary', name: 'Family Sanctuary' },
  { id: 'oceanfront-penthouse', name: 'Oceanfront Penthouse' }
];

const CHANNELS = [
  { id: 'all', name: 'All Channels' },
  { id: 'direct', name: 'Direct' },
  { id: 'ota', name: 'OTA' },
  { id: 'corporate', name: 'Corporate' },
  { id: 'travel_agent', name: 'Travel Agent' }
];

const FORECAST_INTERVALS = [
  { id: 'daily', name: 'Daily' },
  { id: '6h', name: '6 Hours' },
  { id: '1h', name: '1 Hour' }
];

interface ControlsBarProps {
  settings: {
    autoRate: boolean;
    competitorScan: boolean;
    demandPricing: boolean;
  };
  onSettingsChange: (settings: {
    autoRate: boolean;
    competitorScan: boolean;
    demandPricing: boolean;
  }) => void;
  onFilterChange?: (filters: {
    dateRange: string;
    roomCategory: string;
    channel: string;
    forecastInterval: string;
  }) => void;
}

export default function ControlsBar({ settings, onSettingsChange, onFilterChange }: ControlsBarProps) {
  const { showToast } = useToast();
  const [dateRange, setDateRange] = useState('7days');
  const [roomCategory, setRoomCategory] = useState('all');
  const [channel, setChannel] = useState('all');
  const [forecastInterval, setForecastInterval] = useState('daily');

  // Loading states for each toggle
  const [loadingAutoRate, setLoadingAutoRate] = useState(false);
  const [loadingCompetitorScan, setLoadingCompetitorScan] = useState(false);
  const [loadingDemandPricing, setLoadingDemandPricing] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);

  // Fetch initial settings from API
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const apiSettings = await revenueIntelligenceService.getAutoPricingSettings();
        onSettingsChange({
          autoRate: apiSettings.enabled,
          competitorScan: apiSettings.competitorTracking,
          demandPricing: apiSettings.demandBasedPricing,
        });
      } catch (error) {
        console.error('Failed to fetch settings:', error);
        // Keep current settings on error
      } finally {
        setIsInitializing(false);
      }
    };

    fetchSettings();
  }, []);

  // Notify parent of filter changes
  useEffect(() => {
    onFilterChange?.({
      dateRange,
      roomCategory,
      channel,
      forecastInterval,
    });
  }, [dateRange, roomCategory, channel, forecastInterval, onFilterChange]);

  const handleToggleAutoRate = useCallback(async () => {
    const newValue = !settings.autoRate;
    setLoadingAutoRate(true);

    try {
      await revenueIntelligenceService.toggleAutoPricing(newValue);
      onSettingsChange({
        ...settings,
        autoRate: newValue,
      });
      showToast(
        newValue ? 'Auto-rate optimization enabled' : 'Auto-rate optimization disabled',
        'success'
      );
    } catch (error) {
      console.error('Failed to toggle auto-rate:', error);
      showToast('Failed to update auto-rate setting', 'error');
    } finally {
      setLoadingAutoRate(false);
    }
  }, [settings, onSettingsChange, showToast]);

  const handleToggleCompetitorScan = useCallback(async () => {
    const newValue = !settings.competitorScan;
    setLoadingCompetitorScan(true);

    try {
      await revenueIntelligenceService.toggleCompetitorScan(newValue);
      onSettingsChange({
        ...settings,
        competitorScan: newValue,
      });
      showToast(
        newValue ? 'Competitor scan enabled' : 'Competitor scan disabled',
        'success'
      );
    } catch (error) {
      console.error('Failed to toggle competitor scan:', error);
      showToast('Failed to update competitor scan setting', 'error');
    } finally {
      setLoadingCompetitorScan(false);
    }
  }, [settings, onSettingsChange, showToast]);

  const handleToggleDemandPricing = useCallback(async () => {
    const newValue = !settings.demandPricing;
    setLoadingDemandPricing(true);

    try {
      await revenueIntelligenceService.toggleDemandPricing(newValue);
      onSettingsChange({
        ...settings,
        demandPricing: newValue,
      });
      showToast(
        newValue ? 'Demand-based pricing enabled' : 'Demand-based pricing disabled',
        'success'
      );
    } catch (error) {
      console.error('Failed to toggle demand pricing:', error);
      showToast('Failed to update demand pricing setting', 'error');
    } finally {
      setLoadingDemandPricing(false);
    }
  }, [settings, onSettingsChange, showToast]);

  return (
    <div className="bg-white rounded-xl border border-[#E5E5E5] p-4">
      <div className="flex items-center justify-between flex-wrap gap-4">
        {/* Left Section - Filters */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* Date Range */}
          <div className="relative">
            <div className="flex items-center gap-2 px-3 py-2 bg-[#FAF7F4] rounded-lg border border-neutral-200">
              <Calendar className="w-4 h-4 text-neutral-500" />
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="bg-transparent text-sm font-medium text-neutral-700 focus:outline-none cursor-pointer pr-6"
              >
                <option value="today">Today</option>
                <option value="7days">Next 7 Days</option>
                <option value="14days">Next 14 Days</option>
                <option value="30days">Next 30 Days</option>
              </select>
            </div>
          </div>

          {/* Room Category */}
          <div className="relative">
            <div className="flex items-center gap-2 px-3 py-2 bg-[#FAF7F4] rounded-lg border border-neutral-200">
              <Filter className="w-4 h-4 text-neutral-500" />
              <select
                value={roomCategory}
                onChange={(e) => setRoomCategory(e.target.value)}
                className="bg-transparent text-sm font-medium text-neutral-700 focus:outline-none cursor-pointer pr-6"
              >
                {ROOM_CATEGORIES.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Channel */}
          <div className="relative">
            <div className="flex items-center gap-2 px-3 py-2 bg-[#FAF7F4] rounded-lg border border-neutral-200">
              <select
                value={channel}
                onChange={(e) => setChannel(e.target.value)}
                className="bg-transparent text-sm font-medium text-neutral-700 focus:outline-none cursor-pointer pr-6"
              >
                {CHANNELS.map((ch) => (
                  <option key={ch.id} value={ch.id}>{ch.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Forecast Interval */}
          <div className="relative">
            <div className="flex items-center gap-2 px-3 py-2 bg-[#FAF7F4] rounded-lg border border-neutral-200">
              <RefreshCw className="w-4 h-4 text-neutral-500" />
              <select
                value={forecastInterval}
                onChange={(e) => setForecastInterval(e.target.value)}
                className="bg-transparent text-sm font-medium text-neutral-700 focus:outline-none cursor-pointer pr-6"
              >
                {FORECAST_INTERVALS.map((interval) => (
                  <option key={interval.id} value={interval.id}>{interval.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Right Section - Toggles */}
        <div className="flex items-center gap-4 flex-wrap">
          {/* Auto-rate optimization */}
          <label className="flex items-center gap-2 cursor-pointer">
            <div className="relative">
              <input
                type="checkbox"
                checked={settings?.autoRate || false}
                onChange={handleToggleAutoRate}
                disabled={loadingAutoRate || isInitializing}
                className="sr-only"
              />
              <div className={`w-10 h-5 rounded-full transition-colors ${
                loadingAutoRate || isInitializing
                  ? 'bg-neutral-200'
                  : settings?.autoRate
                    ? 'bg-[#4E5840]'
                    : 'bg-neutral-300'
              }`}>
                {loadingAutoRate ? (
                  <div className="w-full h-full flex items-center justify-center">
                    <Loader2 className="w-3 h-3 text-neutral-500 animate-spin" />
                  </div>
                ) : (
                  <div className={`w-4 h-4 bg-white rounded-full shadow transform transition-transform mt-0.5 ${
                    settings?.autoRate ? 'translate-x-5 ml-0.5' : 'translate-x-0.5'
                  }`} />
                )}
              </div>
            </div>
            <span className="text-xs font-medium text-neutral-700">Auto-rate</span>
          </label>

          {/* Competitor scan */}
          <label className="flex items-center gap-2 cursor-pointer">
            <div className="relative">
              <input
                type="checkbox"
                checked={settings?.competitorScan || false}
                onChange={handleToggleCompetitorScan}
                disabled={loadingCompetitorScan || isInitializing}
                className="sr-only"
              />
              <div className={`w-10 h-5 rounded-full transition-colors ${
                loadingCompetitorScan || isInitializing
                  ? 'bg-neutral-200'
                  : settings?.competitorScan
                    ? 'bg-[#4E5840]'
                    : 'bg-neutral-300'
              }`}>
                {loadingCompetitorScan ? (
                  <div className="w-full h-full flex items-center justify-center">
                    <Loader2 className="w-3 h-3 text-neutral-500 animate-spin" />
                  </div>
                ) : (
                  <div className={`w-4 h-4 bg-white rounded-full shadow transform transition-transform mt-0.5 ${
                    settings?.competitorScan ? 'translate-x-5 ml-0.5' : 'translate-x-0.5'
                  }`} />
                )}
              </div>
            </div>
            <span className="text-xs font-medium text-neutral-700">Competitor Scan</span>
          </label>

          {/* Demand-based pricing */}
          <label className="flex items-center gap-2 cursor-pointer">
            <div className="relative">
              <input
                type="checkbox"
                checked={settings?.demandPricing || false}
                onChange={handleToggleDemandPricing}
                disabled={loadingDemandPricing || isInitializing}
                className="sr-only"
              />
              <div className={`w-10 h-5 rounded-full transition-colors ${
                loadingDemandPricing || isInitializing
                  ? 'bg-neutral-200'
                  : settings?.demandPricing
                    ? 'bg-[#4E5840]'
                    : 'bg-neutral-300'
              }`}>
                {loadingDemandPricing ? (
                  <div className="w-full h-full flex items-center justify-center">
                    <Loader2 className="w-3 h-3 text-neutral-500 animate-spin" />
                  </div>
                ) : (
                  <div className={`w-4 h-4 bg-white rounded-full shadow transform transition-transform mt-0.5 ${
                    settings?.demandPricing ? 'translate-x-5 ml-0.5' : 'translate-x-0.5'
                  }`} />
                )}
              </div>
            </div>
            <span className="text-xs font-medium text-neutral-700">Demand Pricing</span>
          </label>

          {/* Settings Button */}
          <button className="p-2 bg-neutral-100 text-neutral-600 rounded-lg hover:bg-neutral-200 transition-colors">
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Active Settings Summary */}
      <div className="mt-3 pt-3 border-t border-neutral-100 flex items-center gap-2 flex-wrap">
        <span className="text-xs text-neutral-500">Active:</span>
        {isInitializing ? (
          <span className="flex items-center gap-1 text-xs text-neutral-400">
            <Loader2 className="w-3 h-3 animate-spin" />
            Loading settings...
          </span>
        ) : (
          <>
            {settings?.autoRate && (
              <span className="px-2 py-0.5 bg-[#4E5840]/10 text-[#4E5840] text-xs font-medium rounded-full">
                Auto-rate ON
              </span>
            )}
            {settings?.competitorScan && (
              <span className="px-2 py-0.5 bg-[#5C9BA4]/10 text-[#5C9BA4] text-xs font-medium rounded-full">
                Competitor Scan ON
              </span>
            )}
            {settings?.demandPricing && (
              <span className="px-2 py-0.5 bg-[#A57865]/10 text-[#A57865] text-xs font-medium rounded-full">
                Demand Pricing ON
              </span>
            )}
            {!settings?.autoRate && !settings?.competitorScan && !settings?.demandPricing && (
              <span className="text-xs text-neutral-400">No AI features enabled</span>
            )}
          </>
        )}
      </div>
    </div>
  );
}
