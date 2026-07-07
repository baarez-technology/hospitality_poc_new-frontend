import { useState, useEffect } from 'react';
import { Users, Clock, Sparkles, Wrench, Zap, Check, Settings } from 'lucide-react';
import { defaultSettings } from '@/utils/admin/settings';

const STORAGE_KEY = 'glimmora_staff_portal';

export default function StaffPortalSettingsTab() {
  const [staffPortal, setStaffPortal] = useState(defaultSettings.staffPortal);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      setStaffPortal(JSON.parse(stored));
    }
  }, []);

  const saveStaffPortal = (newStaffPortal) => {
    setStaffPortal(newStaffPortal);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newStaffPortal));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const updateSection = (section, updates) => {
    saveStaffPortal({
      ...staffPortal,
      [section]: { ...staffPortal[section], ...updates }
    });
  };

  return (
    <div className="max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Staff Portal Settings</h1>
          <p className="text-sm text-neutral-500 mt-1">
            Configure shift policies and automation rules
          </p>
        </div>
        {saved && (
          <div className="flex items-center gap-2 px-4 py-2 bg-[#4E5840]/10 text-[#4E5840] rounded-lg">
            <Check className="w-4 h-4" />
            <span className="text-sm font-medium">Saved</span>
          </div>
        )}
      </div>

      <div className="space-y-6">
        {/* Shift Policies */}
        <section className="bg-white border border-[#E5E5E5] rounded-xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-[#A57865]/10 flex items-center justify-center">
              <Clock className="w-5 h-5 text-[#A57865]" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-neutral-900">Shift Policies</h2>
              <p className="text-sm text-neutral-500">Working hours and break rules</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Default Shift Duration (hours)
              </label>
              <input
                type="number"
                value={staffPortal.shiftPolicies.defaultShiftDuration}
                onChange={(e) => updateSection('shiftPolicies', { defaultShiftDuration: parseInt(e.target.value) })}
                min="4"
                max="12"
                className="w-full px-4 py-3 rounded-lg border border-[#E5E5E5] focus:outline-none focus:ring-2 focus:ring-[#A57865]/20 focus:border-[#A57865]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Maximum Shift Duration (hours)
              </label>
              <input
                type="number"
                value={staffPortal.shiftPolicies.maxShiftDuration}
                onChange={(e) => updateSection('shiftPolicies', { maxShiftDuration: parseInt(e.target.value) })}
                min="6"
                max="16"
                className="w-full px-4 py-3 rounded-lg border border-[#E5E5E5] focus:outline-none focus:ring-2 focus:ring-[#A57865]/20 focus:border-[#A57865]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Break Duration (minutes)
              </label>
              <input
                type="number"
                value={staffPortal.shiftPolicies.breakDuration}
                onChange={(e) => updateSection('shiftPolicies', { breakDuration: parseInt(e.target.value) })}
                min="15"
                max="120"
                step="15"
                className="w-full px-4 py-3 rounded-lg border border-[#E5E5E5] focus:outline-none focus:ring-2 focus:ring-[#A57865]/20 focus:border-[#A57865]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Break After Hours
              </label>
              <input
                type="number"
                value={staffPortal.shiftPolicies.breakAfterHours}
                onChange={(e) => updateSection('shiftPolicies', { breakAfterHours: parseInt(e.target.value) })}
                min="2"
                max="6"
                className="w-full px-4 py-3 rounded-lg border border-[#E5E5E5] focus:outline-none focus:ring-2 focus:ring-[#A57865]/20 focus:border-[#A57865]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Late Threshold (minutes)
              </label>
              <input
                type="number"
                value={staffPortal.shiftPolicies.lateThresholdMinutes}
                onChange={(e) => updateSection('shiftPolicies', { lateThresholdMinutes: parseInt(e.target.value) })}
                min="5"
                max="30"
                className="w-full px-4 py-3 rounded-lg border border-[#E5E5E5] focus:outline-none focus:ring-2 focus:ring-[#A57865]/20 focus:border-[#A57865]"
              />
              <p className="text-xs text-neutral-400 mt-1">Mark as late after this many minutes</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Auto-End Shift After (hours)
              </label>
              <input
                type="number"
                value={staffPortal.shiftPolicies.autoEndShiftAfterHours}
                onChange={(e) => updateSection('shiftPolicies', { autoEndShiftAfterHours: parseInt(e.target.value) })}
                min="8"
                max="14"
                className="w-full px-4 py-3 rounded-lg border border-[#E5E5E5] focus:outline-none focus:ring-2 focus:ring-[#A57865]/20 focus:border-[#A57865]"
              />
              <p className="text-xs text-neutral-400 mt-1">Automatically clock out if forgotten</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Overtime Alert Threshold (hours)
              </label>
              <input
                type="number"
                value={staffPortal.shiftPolicies.overtimeAlertThreshold}
                onChange={(e) => updateSection('shiftPolicies', { overtimeAlertThreshold: parseInt(e.target.value) })}
                min="1"
                max="4"
                className="w-full px-4 py-3 rounded-lg border border-[#E5E5E5] focus:outline-none focus:ring-2 focus:ring-[#A57865]/20 focus:border-[#A57865]"
              />
            </div>
          </div>
        </section>

        {/* Housekeeping Rules */}
        <section className="bg-white border border-[#E5E5E5] rounded-xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-[#5C9BA4]/10 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-[#5C9BA4]" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-neutral-900">Housekeeping Automation</h2>
              <p className="text-sm text-neutral-500">Room assignment and efficiency rules</p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex items-center justify-between p-4 bg-[#FAF7F4] rounded-lg">
              <div>
                <p className="font-medium text-neutral-900">Auto-Assign Rooms</p>
                <p className="text-sm text-neutral-500">Automatically assign rooms to housekeepers</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={staffPortal.housekeeping.autoAssignRooms}
                  onChange={(e) => updateSection('housekeeping', { autoAssignRooms: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#4E5840]"></div>
              </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Max Rooms per Shift
                </label>
                <input
                  type="number"
                  value={staffPortal.housekeeping.maxRoomsPerShift}
                  onChange={(e) => updateSection('housekeeping', { maxRoomsPerShift: parseInt(e.target.value) })}
                  min="5"
                  max="30"
                  className="w-full px-4 py-3 rounded-lg border border-[#E5E5E5] focus:outline-none focus:ring-2 focus:ring-[#A57865]/20 focus:border-[#A57865]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Turnover Target (minutes)
                </label>
                <input
                  type="number"
                  value={staffPortal.housekeeping.turnoverTargetMinutes}
                  onChange={(e) => updateSection('housekeeping', { turnoverTargetMinutes: parseInt(e.target.value) })}
                  min="20"
                  max="90"
                  className="w-full px-4 py-3 rounded-lg border border-[#E5E5E5] focus:outline-none focus:ring-2 focus:ring-[#A57865]/20 focus:border-[#A57865]"
                />
              </div>
            </div>

            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={staffPortal.housekeeping.priorityVIP}
                  onChange={(e) => updateSection('housekeeping', { priorityVIP: e.target.checked })}
                  className="w-4 h-4 rounded border-neutral-300 text-[#A57865] focus:ring-[#A57865]"
                />
                <span className="text-sm text-neutral-700">Prioritize VIP rooms</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={staffPortal.housekeeping.priorityCheckout}
                  onChange={(e) => updateSection('housekeeping', { priorityCheckout: e.target.checked })}
                  className="w-4 h-4 rounded border-neutral-300 text-[#A57865] focus:ring-[#A57865]"
                />
                <span className="text-sm text-neutral-700">Prioritize checkout rooms</span>
              </label>
            </div>
          </div>
        </section>

        {/* Maintenance Rules */}
        <section className="bg-white border border-[#E5E5E5] rounded-xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-[#CDB261]/10 flex items-center justify-center">
              <Wrench className="w-5 h-5 text-[#CDB261]" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-neutral-900">Maintenance Automation</h2>
              <p className="text-sm text-neutral-500">Work order and response time rules</p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex items-center justify-between p-4 bg-[#FAF7F4] rounded-lg">
              <div>
                <p className="font-medium text-neutral-900">Auto-Create Work Orders</p>
                <p className="text-sm text-neutral-500">Create work orders from HK issue reports</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={staffPortal.maintenance.autoCreateWorkOrder}
                  onChange={(e) => updateSection('maintenance', { autoCreateWorkOrder: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#4E5840]"></div>
              </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Urgent Response (min)
                </label>
                <input
                  type="number"
                  value={staffPortal.maintenance.urgentResponseMinutes}
                  onChange={(e) => updateSection('maintenance', { urgentResponseMinutes: parseInt(e.target.value) })}
                  min="10"
                  max="60"
                  className="w-full px-4 py-3 rounded-lg border border-[#E5E5E5] focus:outline-none focus:ring-2 focus:ring-[#A57865]/20 focus:border-[#A57865]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Normal Response (min)
                </label>
                <input
                  type="number"
                  value={staffPortal.maintenance.normalResponseMinutes}
                  onChange={(e) => updateSection('maintenance', { normalResponseMinutes: parseInt(e.target.value) })}
                  min="30"
                  max="240"
                  className="w-full px-4 py-3 rounded-lg border border-[#E5E5E5] focus:outline-none focus:ring-2 focus:ring-[#A57865]/20 focus:border-[#A57865]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Escalation After (min)
                </label>
                <input
                  type="number"
                  value={staffPortal.maintenance.escalationAfterMinutes}
                  onChange={(e) => updateSection('maintenance', { escalationAfterMinutes: parseInt(e.target.value) })}
                  min="30"
                  max="180"
                  className="w-full px-4 py-3 rounded-lg border border-[#E5E5E5] focus:outline-none focus:ring-2 focus:ring-[#A57865]/20 focus:border-[#A57865]"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Runner Rules */}
        <section className="bg-white border border-[#E5E5E5] rounded-xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-[#4E5840]/10 flex items-center justify-center">
              <Zap className="w-5 h-5 text-[#4E5840]" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-neutral-900">Runner Operations</h2>
              <p className="text-sm text-neutral-500">Delivery SLA and task limits</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                SLA Warning (minutes)
              </label>
              <input
                type="number"
                value={staffPortal.runner.slaWarningMinutes}
                onChange={(e) => updateSection('runner', { slaWarningMinutes: parseInt(e.target.value) })}
                min="5"
                max="30"
                className="w-full px-4 py-3 rounded-lg border border-[#E5E5E5] focus:outline-none focus:ring-2 focus:ring-[#A57865]/20 focus:border-[#A57865]"
              />
              <p className="text-xs text-neutral-400 mt-1">Show warning when delivery time approaches</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                SLA Breach (minutes)
              </label>
              <input
                type="number"
                value={staffPortal.runner.slaBreachMinutes}
                onChange={(e) => updateSection('runner', { slaBreachMinutes: parseInt(e.target.value) })}
                min="10"
                max="60"
                className="w-full px-4 py-3 rounded-lg border border-[#E5E5E5] focus:outline-none focus:ring-2 focus:ring-[#A57865]/20 focus:border-[#A57865]"
              />
              <p className="text-xs text-neutral-400 mt-1">Mark as breach after this time</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Max Concurrent Tasks
              </label>
              <input
                type="number"
                value={staffPortal.runner.maxConcurrentTasks}
                onChange={(e) => updateSection('runner', { maxConcurrentTasks: parseInt(e.target.value) })}
                min="1"
                max="10"
                className="w-full px-4 py-3 rounded-lg border border-[#E5E5E5] focus:outline-none focus:ring-2 focus:ring-[#A57865]/20 focus:border-[#A57865]"
              />
            </div>

            <div className="flex items-center pt-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={staffPortal.runner.priorityVIP}
                  onChange={(e) => updateSection('runner', { priorityVIP: e.target.checked })}
                  className="w-4 h-4 rounded border-neutral-300 text-[#A57865] focus:ring-[#A57865]"
                />
                <span className="text-sm text-neutral-700">Prioritize VIP guest requests</span>
              </label>
            </div>
          </div>
        </section>

        {/* Role Mapping */}
        <section className="bg-white border border-[#E5E5E5] rounded-xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-[#A57865]/10 flex items-center justify-center">
              <Settings className="w-5 h-5 text-[#A57865]" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-neutral-900">Role Portal Mapping</h2>
              <p className="text-sm text-neutral-500">Default dashboards for each role</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(staffPortal.roleMapping).map(([role, portal]) => (
              <div key={role} className="flex items-center justify-between p-4 bg-[#FAF7F4] rounded-lg">
                <span className="font-medium text-neutral-700 capitalize">{role.replace(/([A-Z])/g, ' $1')}</span>
                <select
                  value={portal}
                  onChange={(e) => {
                    saveStaffPortal({
                      ...staffPortal,
                      roleMapping: { ...staffPortal.roleMapping, [role]: e.target.value }
                    });
                  }}
                  className="px-3 py-2 rounded-lg border border-[#E5E5E5] bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#A57865]/20"
                >
                  <option value="hk-dashboard">HK Dashboard</option>
                  <option value="work-orders">Work Orders</option>
                  <option value="runner-dashboard">Runner Dashboard</option>
                  <option value="front-desk">Front Desk</option>
                  <option value="manager-dashboard">Manager Dashboard</option>
                </select>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
