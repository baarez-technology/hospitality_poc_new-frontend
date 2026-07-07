/**
 * OverbookingSettingsTab Component
 * Settings tab for managing overbooking controls - Glimmora Design System v5.0
 */

import { useState, useEffect } from 'react';
import {
  AlertTriangle,
  Settings,
  TrendingUp,
  Bell,
  Save,
  RefreshCw,
  Info,
  ChevronDown,
  ChevronUp,
  ToggleLeft,
  ToggleRight,
  Percent,
} from 'lucide-react';
import { Button } from '../ui2/Button';
import { Badge } from '../ui2/Badge';
import { overbookingService, type OverbookingConfig, type RoomTypeOverbookingSettings } from '../../api/services/overbooking.service';
import { useToast } from '../../contexts/ToastContext';

interface FieldGroupProps {
  label: string;
  description?: string;
  children: React.ReactNode;
}

function FieldGroup({ label, description, children }: FieldGroupProps) {
  return (
    <div className="space-y-2">
      <label className="block text-[13px] font-medium text-neutral-900">{label}</label>
      {description && (
        <p className="text-[11px] text-neutral-500">{description}</p>
      )}
      {children}
    </div>
  );
}

interface ToggleSwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  description?: string;
}

function ToggleSwitch({ checked, onChange, label, description }: ToggleSwitchProps) {
  return (
    <div className="flex items-center justify-between py-3">
      <div className="flex-1">
        <p className="text-[13px] font-medium text-neutral-900">{label}</p>
        {description && (
          <p className="text-[11px] text-neutral-500 mt-0.5">{description}</p>
        )}
      </div>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
          checked ? 'bg-terra-500' : 'bg-neutral-200'
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            checked ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  );
}

export default function OverbookingSettingsTab() {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [expandedRoomTypes, setExpandedRoomTypes] = useState<Set<number>>(new Set());

  // Global config state
  const [globalConfig, setGlobalConfig] = useState<OverbookingConfig | null>(null);

  // Room type settings state
  const [roomTypeSettings, setRoomTypeSettings] = useState<RoomTypeOverbookingSettings[]>([]);

  // Modified tracking
  const [hasChanges, setHasChanges] = useState(false);

  // Load settings
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    try {
      // In a real implementation, we'd call the API
      // For now, use mock data
      const mockConfig: OverbookingConfig = {
        id: 1,
        overbooking_enabled: true,
        default_limit_percent: 5.0,
        max_limit_percent: 15.0,
        dynamic_overbooking_enabled: false,
        historical_lookback_days: 90,
        warning_threshold_percent: 80.0,
        critical_threshold_percent: 100.0,
        auto_decline_above_critical: false,
        notification_emails: '',
        notify_on_warning: true,
        notify_on_critical: true,
        auto_waitlist_when_overbooked: true,
        compensation_policy: '',
        updated_at: new Date().toISOString(),
      };

      const mockRoomTypes: RoomTypeOverbookingSettings[] = [
        {
          id: 1,
          name: 'Standard Room',
          total_rooms: 20,
          overbooking_enabled: true,
          overbooking_limit_percent: 5.0,
          overbooking_limit_absolute: 1,
          dynamic_overbooking: false,
          no_show_rate: 0.05,
          cancellation_rate: 0.10,
        },
        {
          id: 2,
          name: 'Deluxe Room',
          total_rooms: 15,
          overbooking_enabled: true,
          overbooking_limit_percent: 5.0,
          overbooking_limit_absolute: 1,
          dynamic_overbooking: false,
          no_show_rate: 0.03,
          cancellation_rate: 0.08,
        },
        {
          id: 3,
          name: 'Premium Suite',
          total_rooms: 8,
          overbooking_enabled: false,
          overbooking_limit_percent: 0.0,
          overbooking_limit_absolute: 0,
          dynamic_overbooking: false,
          no_show_rate: 0.02,
          cancellation_rate: 0.05,
        },
        {
          id: 4,
          name: 'Presidential Suite',
          total_rooms: 2,
          overbooking_enabled: false,
          overbooking_limit_percent: 0.0,
          overbooking_limit_absolute: 0,
          dynamic_overbooking: false,
          no_show_rate: 0.01,
          cancellation_rate: 0.02,
        },
      ];

      setGlobalConfig(mockConfig);
      setRoomTypeSettings(mockRoomTypes);
    } catch (error) {
      console.error('Failed to load overbooking settings:', error);
      showToast('Failed to load settings', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleGlobalConfigChange = (field: keyof OverbookingConfig, value: any) => {
    if (!globalConfig) return;
    setGlobalConfig({ ...globalConfig, [field]: value });
    setHasChanges(true);
  };

  const handleRoomTypeChange = (roomTypeId: number, field: keyof RoomTypeOverbookingSettings, value: any) => {
    setRoomTypeSettings(prev =>
      prev.map(rt =>
        rt.id === roomTypeId ? { ...rt, [field]: value } : rt
      )
    );
    setHasChanges(true);
  };

  const toggleRoomTypeExpanded = (roomTypeId: number) => {
    setExpandedRoomTypes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(roomTypeId)) {
        newSet.delete(roomTypeId);
      } else {
        newSet.add(roomTypeId);
      }
      return newSet;
    });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // In real implementation, call API to save
      // await overbookingService.updateGlobalConfig(globalConfig);
      // for (const rt of roomTypeSettings) {
      //   await overbookingService.updateRoomTypeSettings(rt.id, rt);
      // }

      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      showToast('Overbooking settings saved successfully', 'success');
      setHasChanges(false);
    } catch (error) {
      console.error('Failed to save settings:', error);
      showToast('Failed to save settings', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    loadSettings();
    setHasChanges(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-6 h-6 animate-spin text-terra-500" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-base sm:text-lg font-semibold text-neutral-900">Overbooking Controls</h1>
          <p className="text-[12px] sm:text-sm text-neutral-500 mt-1">
            Configure overbooking limits and behavior for your property
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            icon={RefreshCw}
            onClick={handleReset}
            disabled={saving}
          >
            <span className="hidden sm:inline">Reset</span>
          </Button>
          <Button
            variant="primary"
            icon={Save}
            onClick={handleSave}
            disabled={saving || !hasChanges}
          >
            {saving ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </div>

      {/* Info Banner */}
      <div className="bg-amber-50 border border-amber-100 rounded-[10px] p-3 sm:p-4">
        <div className="flex items-start gap-2 sm:gap-3">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0">
            <Info className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-600" />
          </div>
          <div>
            <h3 className="text-[12px] sm:text-[13px] font-semibold text-amber-900">About Overbooking</h3>
            <p className="text-[10px] sm:text-[12px] text-amber-700 mt-1">
              Overbooking allows accepting more reservations than physical rooms available,
              accounting for expected no-shows and cancellations.
            </p>
          </div>
        </div>
      </div>

      {/* Global Settings Section */}
      <div className="bg-neutral-50/50 rounded-[10px] overflow-hidden">
        <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-neutral-100">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-terra-100 flex items-center justify-center flex-shrink-0">
              <Settings className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-terra-600" />
            </div>
            <div>
              <h2 className="text-[13px] sm:text-[14px] font-semibold text-neutral-900">Global Settings</h2>
              <p className="text-[10px] sm:text-[11px] text-neutral-500">Property-wide overbooking configuration</p>
            </div>
          </div>
        </div>

        <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
          {/* Master Toggle */}
          <div className="bg-white rounded-lg border border-neutral-200 p-3 sm:p-4">
            <ToggleSwitch
              checked={globalConfig?.overbooking_enabled ?? false}
              onChange={(v) => handleGlobalConfigChange('overbooking_enabled', v)}
              label="Enable Overbooking"
              description="Allow accepting more reservations than physical room count"
            />
          </div>

          {globalConfig?.overbooking_enabled && (
            <>
              {/* Limit Settings */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                <FieldGroup
                  label="Default Overbooking Limit (%)"
                  description="Default percentage for room types without custom settings"
                >
                  <div className="relative">
                    <input
                      type="number"
                      min="0"
                      max="30"
                      step="0.5"
                      value={globalConfig?.default_limit_percent ?? 5}
                      onChange={(e) => handleGlobalConfigChange('default_limit_percent', parseFloat(e.target.value))}
                      className="w-full h-10 pl-4 pr-10 rounded-lg border border-neutral-200 text-[13px] focus:border-terra-400 focus:ring-2 focus:ring-terra-500/10 outline-none"
                    />
                    <Percent className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                  </div>
                </FieldGroup>

                <FieldGroup
                  label="Maximum Allowed Limit (%)"
                  description="Cap on overbooking percentage across all room types"
                >
                  <div className="relative">
                    <input
                      type="number"
                      min="0"
                      max="30"
                      step="0.5"
                      value={globalConfig?.max_limit_percent ?? 15}
                      onChange={(e) => handleGlobalConfigChange('max_limit_percent', parseFloat(e.target.value))}
                      className="w-full h-10 pl-4 pr-10 rounded-lg border border-neutral-200 text-[13px] focus:border-terra-400 focus:ring-2 focus:ring-terra-500/10 outline-none"
                    />
                    <Percent className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                  </div>
                </FieldGroup>
              </div>

              {/* Dynamic Overbooking */}
              <div className="bg-white rounded-lg border border-neutral-200 p-3 sm:p-4">
                <ToggleSwitch
                  checked={globalConfig?.dynamic_overbooking_enabled ?? false}
                  onChange={(v) => handleGlobalConfigChange('dynamic_overbooking_enabled', v)}
                  label="Dynamic Overbooking"
                  description="Automatically adjust limits based on historical no-show and cancellation rates"
                />

                {globalConfig?.dynamic_overbooking_enabled && (
                  <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-neutral-100">
                    <FieldGroup
                      label="Historical Lookback Period (days)"
                      description="Number of days of historical data to analyze"
                    >
                      <input
                        type="number"
                        min="30"
                        max="365"
                        value={globalConfig?.historical_lookback_days ?? 90}
                        onChange={(e) => handleGlobalConfigChange('historical_lookback_days', parseInt(e.target.value))}
                        className="w-full h-10 px-4 rounded-lg border border-neutral-200 text-[13px] focus:border-terra-400 focus:ring-2 focus:ring-terra-500/10 outline-none"
                      />
                    </FieldGroup>
                  </div>
                )}
              </div>

              {/* Alert Thresholds */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                <FieldGroup
                  label="Warning Threshold (%)"
                  description="Generate warning alert when overbooking reaches this % of limit"
                >
                  <div className="relative">
                    <input
                      type="number"
                      min="50"
                      max="100"
                      step="5"
                      value={globalConfig?.warning_threshold_percent ?? 80}
                      onChange={(e) => handleGlobalConfigChange('warning_threshold_percent', parseFloat(e.target.value))}
                      className="w-full h-10 pl-4 pr-10 rounded-lg border border-neutral-200 text-[13px] focus:border-terra-400 focus:ring-2 focus:ring-terra-500/10 outline-none"
                    />
                    <Percent className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                  </div>
                </FieldGroup>

                <FieldGroup
                  label="Critical Threshold (%)"
                  description="Generate critical alert when overbooking reaches this % of limit"
                >
                  <div className="relative">
                    <input
                      type="number"
                      min="80"
                      max="150"
                      step="5"
                      value={globalConfig?.critical_threshold_percent ?? 100}
                      onChange={(e) => handleGlobalConfigChange('critical_threshold_percent', parseFloat(e.target.value))}
                      className="w-full h-10 pl-4 pr-10 rounded-lg border border-neutral-200 text-[13px] focus:border-terra-400 focus:ring-2 focus:ring-terra-500/10 outline-none"
                    />
                    <Percent className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                  </div>
                </FieldGroup>
              </div>

              {/* Behavior Settings */}
              <div className="bg-white rounded-lg border border-neutral-200 divide-y divide-neutral-100">
                <div className="p-3 sm:p-4">
                  <ToggleSwitch
                    checked={globalConfig?.auto_decline_above_critical ?? false}
                    onChange={(v) => handleGlobalConfigChange('auto_decline_above_critical', v)}
                    label="Auto-Decline Above Critical"
                    description="Automatically decline bookings that would exceed critical threshold"
                  />
                </div>
                <div className="p-3 sm:p-4">
                  <ToggleSwitch
                    checked={globalConfig?.auto_waitlist_when_overbooked ?? false}
                    onChange={(v) => handleGlobalConfigChange('auto_waitlist_when_overbooked', v)}
                    label="Auto-Waitlist When Overbooked"
                    description="Add guests to waitlist instead of declining when at capacity"
                  />
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Notifications Section */}
      {globalConfig?.overbooking_enabled && (
        <div className="bg-neutral-50/50 rounded-[10px] overflow-hidden">
          <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-neutral-100">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                <Bell className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-600" />
              </div>
              <div>
                <h2 className="text-[13px] sm:text-[14px] font-semibold text-neutral-900">Notifications</h2>
                <p className="text-[10px] sm:text-[11px] text-neutral-500">Configure overbooking alert notifications</p>
              </div>
            </div>
          </div>

          <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
            <FieldGroup
              label="Notification Emails"
              description="Comma-separated email addresses to receive overbooking alerts"
            >
              <input
                type="text"
                value={globalConfig?.notification_emails ?? ''}
                onChange={(e) => handleGlobalConfigChange('notification_emails', e.target.value)}
                placeholder="manager@hotel.com, revenue@hotel.com"
                className="w-full h-10 px-4 rounded-lg border border-neutral-200 text-[13px] focus:border-terra-400 focus:ring-2 focus:ring-terra-500/10 outline-none"
              />
            </FieldGroup>

            <div className="bg-white rounded-lg border border-neutral-200 divide-y divide-neutral-100">
              <div className="p-3 sm:p-4">
                <ToggleSwitch
                  checked={globalConfig?.notify_on_warning ?? true}
                  onChange={(v) => handleGlobalConfigChange('notify_on_warning', v)}
                  label="Notify on Warning Alerts"
                  description="Send email notifications when warning threshold is reached"
                />
              </div>
              <div className="p-3 sm:p-4">
                <ToggleSwitch
                  checked={globalConfig?.notify_on_critical ?? true}
                  onChange={(v) => handleGlobalConfigChange('notify_on_critical', v)}
                  label="Notify on Critical Alerts"
                  description="Send email notifications when critical threshold is reached"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Room Type Settings */}
      {globalConfig?.overbooking_enabled && (
        <div className="bg-neutral-50/50 rounded-[10px] overflow-hidden">
          <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-neutral-100">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-emerald-100 flex items-center justify-center flex-shrink-0">
                <TrendingUp className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-600" />
              </div>
              <div>
                <h2 className="text-[13px] sm:text-[14px] font-semibold text-neutral-900">Room Type Settings</h2>
                <p className="text-[10px] sm:text-[11px] text-neutral-500">Configure overbooking per room category</p>
              </div>
            </div>
          </div>

          <div className="divide-y divide-neutral-100">
            {roomTypeSettings.map((rt) => {
              const isExpanded = expandedRoomTypes.has(rt.id);
              const maxOverbook = Math.ceil(rt.total_rooms * (rt.overbooking_limit_percent / 100));

              return (
                <div key={rt.id} className="bg-white">
                  {/* Room Type Header */}
                  <button
                    type="button"
                    onClick={() => toggleRoomTypeExpanded(rt.id)}
                    className="w-full px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between hover:bg-neutral-50 transition-colors gap-3"
                  >
                    <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                      <div className="min-w-0">
                        <p className="text-[12px] sm:text-[13px] font-semibold text-neutral-900 text-left truncate">{rt.name}</p>
                        <p className="text-[10px] sm:text-[11px] text-neutral-500 text-left">
                          {rt.total_rooms} rooms
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
                      {rt.overbooking_enabled ? (
                        <Badge variant="success" size="sm">
                          <span className="hidden sm:inline">{rt.overbooking_limit_percent}% ({maxOverbook} extra)</span>
                          <span className="sm:hidden">{rt.overbooking_limit_percent}%</span>
                        </Badge>
                      ) : (
                        <Badge variant="neutral" size="sm">Off</Badge>
                      )}
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4 text-neutral-400" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-neutral-400" />
                      )}
                    </div>
                  </button>

                  {/* Expanded Settings */}
                  {isExpanded && (
                    <div className="px-4 sm:px-6 pb-4 sm:pb-6 pt-2 border-t border-neutral-100 space-y-3 sm:space-y-4">
                      {/* Enable Toggle */}
                      <div className="bg-neutral-50 rounded-lg p-3 sm:p-4">
                        <ToggleSwitch
                          checked={rt.overbooking_enabled}
                          onChange={(v) => handleRoomTypeChange(rt.id, 'overbooking_enabled', v)}
                          label="Enable Overbooking"
                          description={`Allow overbooking for ${rt.name}`}
                        />
                      </div>

                      {rt.overbooking_enabled && (
                        <>
                          {/* Limit Settings */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                            <FieldGroup
                              label="Overbooking Limit (%)"
                            >
                              <div className="relative">
                                <input
                                  type="number"
                                  min="0"
                                  max={globalConfig?.max_limit_percent ?? 15}
                                  step="0.5"
                                  value={rt.overbooking_limit_percent}
                                  onChange={(e) => handleRoomTypeChange(rt.id, 'overbooking_limit_percent', parseFloat(e.target.value))}
                                  className="w-full h-10 pl-4 pr-10 rounded-lg border border-neutral-200 text-[13px] focus:border-terra-400 focus:ring-2 focus:ring-terra-500/10 outline-none"
                                />
                                <Percent className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                              </div>
                            </FieldGroup>

                            <FieldGroup
                              label="Absolute Limit (rooms)"
                            >
                              <input
                                type="number"
                                min="0"
                                max="10"
                                value={rt.overbooking_limit_absolute ?? 0}
                                onChange={(e) => handleRoomTypeChange(rt.id, 'overbooking_limit_absolute', parseInt(e.target.value))}
                                className="w-full h-10 px-4 rounded-lg border border-neutral-200 text-[13px] focus:border-terra-400 focus:ring-2 focus:ring-terra-500/10 outline-none"
                              />
                            </FieldGroup>
                          </div>

                          {/* Dynamic Settings */}
                          <div className="bg-neutral-50 rounded-lg p-3 sm:p-4">
                            <ToggleSwitch
                              checked={rt.dynamic_overbooking}
                              onChange={(v) => handleRoomTypeChange(rt.id, 'dynamic_overbooking', v)}
                              label="Use Dynamic Calculation"
                              description="Adjust limit based on historical no-show and cancellation rates"
                            />
                          </div>

                          {rt.dynamic_overbooking && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                              <FieldGroup label="No-Show Rate (%)">
                                <div className="relative">
                                  <input
                                    type="number"
                                    min="0"
                                    max="50"
                                    step="0.5"
                                    value={(rt.no_show_rate * 100).toFixed(1)}
                                    onChange={(e) => handleRoomTypeChange(rt.id, 'no_show_rate', parseFloat(e.target.value) / 100)}
                                    className="w-full h-10 pl-4 pr-10 rounded-lg border border-neutral-200 text-[13px] focus:border-terra-400 focus:ring-2 focus:ring-terra-500/10 outline-none"
                                  />
                                  <Percent className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                                </div>
                              </FieldGroup>

                              <FieldGroup label="Cancellation Rate (%)">
                                <div className="relative">
                                  <input
                                    type="number"
                                    min="0"
                                    max="50"
                                    step="0.5"
                                    value={(rt.cancellation_rate * 100).toFixed(1)}
                                    onChange={(e) => handleRoomTypeChange(rt.id, 'cancellation_rate', parseFloat(e.target.value) / 100)}
                                    className="w-full h-10 pl-4 pr-10 rounded-lg border border-neutral-200 text-[13px] focus:border-terra-400 focus:ring-2 focus:ring-terra-500/10 outline-none"
                                  />
                                  <Percent className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                                </div>
                              </FieldGroup>
                            </div>
                          )}

                          {/* Calculated Info */}
                          <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 sm:p-4">
                            <div className="flex items-start gap-2 sm:gap-3">
                              <Info className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                              <div className="text-[10px] sm:text-[12px] text-blue-700">
                                <p className="font-medium">Effective Capacity</p>
                                <p className="mt-1">
                                  With {rt.overbooking_limit_percent}% overbooking on {rt.total_rooms} rooms,
                                  you can accept up to <strong>{rt.total_rooms + maxOverbook}</strong> reservations
                                  ({maxOverbook} extra).
                                </p>
                              </div>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Unsaved Changes Warning */}
      {hasChanges && (
        <div className="fixed bottom-4 sm:bottom-6 right-4 sm:right-6 left-4 sm:left-auto bg-amber-100 border border-amber-200 rounded-lg px-3 sm:px-4 py-2 sm:py-3 shadow-lg flex items-center gap-2 sm:gap-3">
          <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600 flex-shrink-0" />
          <span className="text-[11px] sm:text-[13px] font-medium text-amber-800 flex-1">Unsaved changes</span>
          <Button variant="primary" size="sm" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : 'Save'}
          </Button>
        </div>
      )}
    </div>
  );
}
