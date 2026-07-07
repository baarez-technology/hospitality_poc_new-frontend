import { useState, useEffect } from 'react';
import { Check } from 'lucide-react';
import { defaultSettings, deepMerge } from '../../utils/settings';
import { Button } from '../ui2/Button';
import { SelectDropdown } from '../ui2/Input';

const STORAGE_KEY = 'glimmora_staff_portal';

export default function StaffPortalSettingsTab() {
  const [staffPortal, setStaffPortal] = useState(defaultSettings.staffPortal);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setStaffPortal(deepMerge(defaultSettings.staffPortal, parsed));
      } catch (e) {
        console.error('Error parsing staff portal settings from localStorage:', e);
      }
    }
  }, []);

  const saveStaffPortal = (newStaffPortal: typeof staffPortal) => {
    setStaffPortal(newStaffPortal);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newStaffPortal));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const updateSection = (section: string, updates: Record<string, unknown>) => {
    saveStaffPortal({
      ...staffPortal,
      [section]: { ...staffPortal[section as keyof typeof staffPortal], ...updates }
    });
  };

  const Toggle = ({ enabled, onChange }: { enabled: boolean; onChange: (value: boolean) => void }) => (
    <button
      type="button"
      onClick={() => onChange(!enabled)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${enabled ? 'bg-terra-500' : 'bg-neutral-200'}`}
    >
      <span className={`h-5 w-5 rounded-full bg-white transition-transform ${enabled ? 'translate-x-5' : 'translate-x-0.5'}`} />
    </button>
  );

  const inputClasses = "w-full h-10 px-3 rounded-lg border border-neutral-200 text-sm text-neutral-900 placeholder:text-neutral-400 hover:border-neutral-300 focus:border-terra-500 focus:ring-2 focus:ring-terra-500/20 focus:outline-none transition-colors";
  const labelClasses = "block text-[13px] font-medium text-neutral-600 mb-1.5";

  const portalOptions = [
    { value: 'hk-dashboard', label: 'HK Dashboard' },
    { value: 'work-orders', label: 'Work Orders' },
    { value: 'runner-dashboard', label: 'Runner Dashboard' },
    { value: 'front-desk', label: 'Front Desk' },
    { value: 'manager-dashboard', label: 'Manager Dashboard' },
  ];

  return (
    <div className="max-w-4xl space-y-6 sm:space-y-8">
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-base sm:text-lg font-semibold text-neutral-900">Staff Portal</h1>
          <p className="text-[12px] sm:text-sm text-neutral-500 mt-1">
            Configure shift policies, automation rules, and role permissions
          </p>
        </div>
        <div className="flex items-center gap-3">
          {saved && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-sage-50 text-sage-600 rounded-lg">
              <Check className="w-4 h-4" />
              <span className="text-[12px] sm:text-sm font-medium">Saved</span>
            </div>
          )}
          <Button variant="primary" onClick={() => saveStaffPortal(staffPortal)}>
            Save Changes
          </Button>
        </div>
      </header>

      {/* Shift Policies */}
      <section className="bg-neutral-50/50 rounded-[10px] overflow-hidden">
        <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-neutral-100">
          <h2 className="text-[13px] sm:text-sm font-medium text-neutral-900">Shift Policies</h2>
          <p className="text-[10px] sm:text-xs text-neutral-500 mt-0.5">Working hours and break rules</p>
        </div>

        <div className="p-4 sm:p-6 grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          <div>
            <label className={labelClasses}>Default Shift Duration (hours)</label>
            <input
              type="number"
              value={staffPortal.shiftPolicies.defaultShiftDuration}
              onChange={(e) => updateSection('shiftPolicies', { defaultShiftDuration: parseInt(e.target.value) })}
              min="4"
              max="12"
              className={inputClasses}
            />
          </div>

          <div>
            <label className={labelClasses}>Maximum Shift Duration (hours)</label>
            <input
              type="number"
              value={staffPortal.shiftPolicies.maxShiftDuration}
              onChange={(e) => updateSection('shiftPolicies', { maxShiftDuration: parseInt(e.target.value) })}
              min="6"
              max="16"
              className={inputClasses}
            />
          </div>

          <div>
            <label className={labelClasses}>Break Duration (minutes)</label>
            <input
              type="number"
              value={staffPortal.shiftPolicies.breakDuration}
              onChange={(e) => updateSection('shiftPolicies', { breakDuration: parseInt(e.target.value) })}
              min="15"
              max="120"
              step="15"
              className={inputClasses}
            />
          </div>

          <div>
            <label className={labelClasses}>Break After Hours</label>
            <input
              type="number"
              value={staffPortal.shiftPolicies.breakAfterHours}
              onChange={(e) => updateSection('shiftPolicies', { breakAfterHours: parseInt(e.target.value) })}
              min="2"
              max="6"
              className={inputClasses}
            />
          </div>

          <div>
            <label className={labelClasses}>Late Threshold (minutes)</label>
            <input
              type="number"
              value={staffPortal.shiftPolicies.lateThresholdMinutes}
              onChange={(e) => updateSection('shiftPolicies', { lateThresholdMinutes: parseInt(e.target.value) })}
              min="5"
              max="30"
              className={inputClasses}
            />
            <p className="text-xs text-neutral-500 mt-1.5">Mark as late after this many minutes</p>
          </div>

          <div>
            <label className={labelClasses}>Auto-End Shift After (hours)</label>
            <input
              type="number"
              value={staffPortal.shiftPolicies.autoEndShiftAfterHours}
              onChange={(e) => updateSection('shiftPolicies', { autoEndShiftAfterHours: parseInt(e.target.value) })}
              min="8"
              max="14"
              className={inputClasses}
            />
            <p className="text-xs text-neutral-500 mt-1.5">Automatically clock out if forgotten</p>
          </div>

          <div>
            <label className={labelClasses}>Overtime Alert Threshold (hours)</label>
            <input
              type="number"
              value={staffPortal.shiftPolicies.overtimeAlertThreshold}
              onChange={(e) => updateSection('shiftPolicies', { overtimeAlertThreshold: parseInt(e.target.value) })}
              min="1"
              max="4"
              className={inputClasses}
            />
          </div>
        </div>
      </section>

      {/* Housekeeping Automation */}
      <section className="bg-neutral-50/50 rounded-[10px] overflow-hidden">
        <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-neutral-100">
          <h2 className="text-[13px] sm:text-sm font-medium text-neutral-900">Housekeeping Automation</h2>
          <p className="text-[10px] sm:text-xs text-neutral-500 mt-0.5">Room assignment and efficiency rules</p>
        </div>

        <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
          {/* Toggle Items */}
          <div className="space-y-3 sm:space-y-4">
            <div className="flex items-center justify-between py-2 sm:py-3 border-b border-neutral-100 last:border-0 gap-3">
              <div className="min-w-0 flex-1">
                <p className="text-[12px] sm:text-sm font-medium text-neutral-900">Auto-Assign Rooms</p>
                <p className="text-[10px] sm:text-xs text-neutral-500 mt-0.5">Automatically assign rooms to housekeepers based on workload</p>
              </div>
              <Toggle
                enabled={staffPortal.housekeeping.autoAssignRooms}
                onChange={(value) => updateSection('housekeeping', { autoAssignRooms: value })}
              />
            </div>

            <div className="flex items-center justify-between py-2 sm:py-3 border-b border-neutral-100 last:border-0 gap-3">
              <div className="min-w-0 flex-1">
                <p className="text-[12px] sm:text-sm font-medium text-neutral-900">Prioritize VIP Rooms</p>
                <p className="text-[10px] sm:text-xs text-neutral-500 mt-0.5">Clean VIP guest rooms before standard rooms</p>
              </div>
              <Toggle
                enabled={staffPortal.housekeeping.priorityVIP}
                onChange={(value) => updateSection('housekeeping', { priorityVIP: value })}
              />
            </div>

            <div className="flex items-center justify-between py-2 sm:py-3 border-b border-neutral-100 last:border-0 gap-3">
              <div className="min-w-0 flex-1">
                <p className="text-[12px] sm:text-sm font-medium text-neutral-900">Prioritize Checkout Rooms</p>
                <p className="text-[10px] sm:text-xs text-neutral-500 mt-0.5">Process checkout rooms first for faster turnover</p>
              </div>
              <Toggle
                enabled={staffPortal.housekeeping.priorityCheckout}
                onChange={(value) => updateSection('housekeeping', { priorityCheckout: value })}
              />
            </div>
          </div>

          {/* Form Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 pt-3 sm:pt-4">
            <div>
              <label className={labelClasses}>Max Rooms per Shift</label>
              <input
                type="number"
                value={staffPortal.housekeeping.maxRoomsPerShift}
                onChange={(e) => updateSection('housekeeping', { maxRoomsPerShift: parseInt(e.target.value) })}
                min="5"
                max="30"
                className={inputClasses}
              />
            </div>

            <div>
              <label className={labelClasses}>Turnover Target (minutes)</label>
              <input
                type="number"
                value={staffPortal.housekeeping.turnoverTargetMinutes}
                onChange={(e) => updateSection('housekeeping', { turnoverTargetMinutes: parseInt(e.target.value) })}
                min="20"
                max="90"
                className={inputClasses}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Maintenance Automation */}
      <section className="bg-neutral-50/50 rounded-[10px] overflow-hidden">
        <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-neutral-100">
          <h2 className="text-[13px] sm:text-sm font-medium text-neutral-900">Maintenance Automation</h2>
          <p className="text-[10px] sm:text-xs text-neutral-500 mt-0.5">Work order and response time rules</p>
        </div>

        <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
          {/* Toggle Item */}
          <div className="flex items-center justify-between py-2 sm:py-3 border-b border-neutral-100 gap-3">
            <div className="min-w-0 flex-1">
              <p className="text-[12px] sm:text-sm font-medium text-neutral-900">Auto-Create Work Orders</p>
              <p className="text-[10px] sm:text-xs text-neutral-500 mt-0.5">Automatically create work orders from housekeeping issue reports</p>
            </div>
            <Toggle
              enabled={staffPortal.maintenance.autoCreateWorkOrder}
              onChange={(value) => updateSection('maintenance', { autoCreateWorkOrder: value })}
            />
          </div>

          {/* Form Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 pt-2">
            <div>
              <label className={labelClasses}>Urgent Response (min)</label>
              <input
                type="number"
                value={staffPortal.maintenance.urgentResponseMinutes}
                onChange={(e) => updateSection('maintenance', { urgentResponseMinutes: parseInt(e.target.value) })}
                min="10"
                max="60"
                className={inputClasses}
              />
            </div>

            <div>
              <label className={labelClasses}>Normal Response (min)</label>
              <input
                type="number"
                value={staffPortal.maintenance.normalResponseMinutes}
                onChange={(e) => updateSection('maintenance', { normalResponseMinutes: parseInt(e.target.value) })}
                min="30"
                max="240"
                className={inputClasses}
              />
            </div>

            <div>
              <label className={labelClasses}>Escalation After (min)</label>
              <input
                type="number"
                value={staffPortal.maintenance.escalationAfterMinutes}
                onChange={(e) => updateSection('maintenance', { escalationAfterMinutes: parseInt(e.target.value) })}
                min="30"
                max="180"
                className={inputClasses}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Runner Operations */}
      <section className="bg-neutral-50/50 rounded-[10px] overflow-hidden">
        <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-neutral-100">
          <h2 className="text-[13px] sm:text-sm font-medium text-neutral-900">Runner Operations</h2>
          <p className="text-[10px] sm:text-xs text-neutral-500 mt-0.5">Delivery SLA and task limits</p>
        </div>

        <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
          {/* Toggle Item */}
          <div className="flex items-center justify-between py-2 sm:py-3 border-b border-neutral-100 gap-3">
            <div className="min-w-0 flex-1">
              <p className="text-[12px] sm:text-sm font-medium text-neutral-900">Prioritize VIP Requests</p>
              <p className="text-[10px] sm:text-xs text-neutral-500 mt-0.5">VIP guest requests are handled before standard requests</p>
            </div>
            <Toggle
              enabled={staffPortal.runner.priorityVIP}
              onChange={(value) => updateSection('runner', { priorityVIP: value })}
            />
          </div>

          {/* Form Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 pt-2">
            <div>
              <label className={labelClasses}>SLA Warning (minutes)</label>
              <input
                type="number"
                value={staffPortal.runner.slaWarningMinutes}
                onChange={(e) => updateSection('runner', { slaWarningMinutes: parseInt(e.target.value) })}
                min="5"
                max="30"
                className={inputClasses}
              />
              <p className="text-xs text-neutral-500 mt-1.5">Show warning when delivery time approaches</p>
            </div>

            <div>
              <label className={labelClasses}>SLA Breach (minutes)</label>
              <input
                type="number"
                value={staffPortal.runner.slaBreachMinutes}
                onChange={(e) => updateSection('runner', { slaBreachMinutes: parseInt(e.target.value) })}
                min="10"
                max="60"
                className={inputClasses}
              />
              <p className="text-xs text-neutral-500 mt-1.5">Mark as breach after this time</p>
            </div>

            <div>
              <label className={labelClasses}>Max Concurrent Tasks</label>
              <input
                type="number"
                value={staffPortal.runner.maxConcurrentTasks}
                onChange={(e) => updateSection('runner', { maxConcurrentTasks: parseInt(e.target.value) })}
                min="1"
                max="10"
                className={inputClasses}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Role Portal Mapping */}
      <section className="bg-neutral-50/50 rounded-[10px] overflow-hidden">
        <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-neutral-100">
          <h2 className="text-[13px] sm:text-sm font-medium text-neutral-900">Role Portal Mapping</h2>
          <p className="text-[10px] sm:text-xs text-neutral-500 mt-0.5">Default dashboards for each staff role</p>
        </div>

        <div className="p-4 sm:p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
            {Object.entries(staffPortal.roleMapping).map(([role, portal]) => (
              <div key={role} className="flex flex-col sm:flex-row sm:items-center justify-between py-2 sm:py-3 gap-2">
                <span className="text-[12px] sm:text-sm font-medium text-neutral-900 capitalize">
                  {role.replace(/([A-Z])/g, ' $1').trim()}
                </span>
                <div className="w-full sm:w-[180px]">
                  <SelectDropdown
                    value={portal as string}
                    onChange={(value) => {
                      saveStaffPortal({
                        ...staffPortal,
                        roleMapping: { ...staffPortal.roleMapping, [role]: value }
                      });
                    }}
                    options={portalOptions}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
