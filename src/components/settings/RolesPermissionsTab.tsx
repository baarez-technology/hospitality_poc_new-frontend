import { useState, useEffect, useMemo, useRef } from 'react';
import { Check, ChevronDown, ChevronUp, Shield, Users, RotateCcw, Minus, AlertTriangle, Save, Info, RefreshCw } from 'lucide-react';
import { Button } from '../ui2/Button';
import toast from 'react-hot-toast';
import { apiClient } from '../../api/client';
import {
  STAFF_ROLES,
  PERMISSION_MODULES,
  DEFAULT_PERMISSIONS,
  getDefaultPermissions,
  isOverridden,
} from '../../config/rolePermissions';
import type { StaffRole, PermissionModule, ModulePermission, PermissionMap } from '../../config/rolePermissions';

const STORAGE_KEY = 'glimmora_roles';

interface StoredRole {
  id: string;
  name: string;
  description: string;
  staffCount?: number;
  permissions: PermissionMap;
}

function buildStoredRoles(): StoredRole[] {
  return STAFF_ROLES.map(r => ({
    id: r.value,
    name: r.label,
    description: r.description,
    staffCount: 0,
    permissions: getDefaultPermissions(r.value),
  }));
}

export default function RolesPermissionsTab() {
  const [roles, setRoles] = useState<StoredRole[]>([]);
  const [expandedRole, setExpandedRole] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [changeCount, setChangeCount] = useState(0);
  const [pushConfirm, setPushConfirm] = useState<string | null>(null);
  const savedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Fetch staff counts from the backend API
  const fetchStaffCounts = async () => {
    try {
      const resp = await apiClient.get('/api/v1/rbac/roles');
      const apiRoles = resp.data?.data || resp.data || [];
      return new Map(apiRoles.map((r: any) => [r.role_code, r.staff_count || 0]));
    } catch {
      return new Map();
    }
  };

  useEffect(() => {
    const init = async () => {
      const countMap = await fetchStaffCounts();

      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          const roleMap = new Map(parsed.map((r: StoredRole) => [r.id, r]));
          const merged = STAFF_ROLES.map(r => {
            const existing = roleMap.get(r.value) as StoredRole | undefined;
            if (existing && existing.permissions) {
              const fullPerms = { ...getDefaultPermissions(r.value) };
              for (const mod of PERMISSION_MODULES) {
                if (existing.permissions[mod.id]) {
                  fullPerms[mod.id] = existing.permissions[mod.id];
                }
              }
              return { ...existing, id: r.value, name: r.label, description: r.description, staffCount: countMap.get(r.value) || existing.staffCount || 0, permissions: fullPerms };
            }
            return {
              id: r.value,
              name: r.label,
              description: r.description,
              staffCount: countMap.get(r.value) || 0,
              permissions: getDefaultPermissions(r.value),
            };
          });
          setRoles(merged);
        } catch {
          const defaults = buildStoredRoles().map(r => ({ ...r, staffCount: countMap.get(r.id) || 0 }));
          setRoles(defaults);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(defaults));
        }
      } else {
        const defaults = buildStoredRoles().map(r => ({ ...r, staffCount: countMap.get(r.id) || 0 }));
        setRoles(defaults);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(defaults));
      }
    };
    init();
  }, []);

  const saveRoles = (newRoles: StoredRole[]) => {
    setRoles(newRoles);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newRoles));
    setChangeCount(c => c + 1);
    setSaved(true);
    if (savedTimerRef.current) clearTimeout(savedTimerRef.current);
    savedTimerRef.current = setTimeout(() => setSaved(false), 3000);
  };

  const togglePermission = (roleId: string, module: PermissionModule, permission: keyof ModulePermission) => {
    const newRoles = roles.map((role) => {
      if (role.id !== roleId) return role;
      return {
        ...role,
        permissions: {
          ...role.permissions,
          [module]: {
            ...role.permissions[module],
            [permission]: !role.permissions[module]?.[permission]
          }
        }
      };
    });
    saveRoles(newRoles);
  };

  const resetRoleToDefaults = (roleId: string) => {
    const newRoles = roles.map((role) => {
      if (role.id !== roleId) return role;
      return {
        ...role,
        permissions: getDefaultPermissions(roleId as StaffRole),
      };
    });
    saveRoles(newRoles);
  };

  const [pushing, setPushing] = useState<string | null>(null);

  const pushDefaultsToAll = async (roleId: string) => {
    setPushing(roleId);
    try {
      // First, save the current permissions to the backend
      const role = roles.find(r => r.id === roleId);
      if (role) {
        await apiClient.put(`/api/v1/rbac/roles/${roleId}/permissions`, {
          permissions: role.permissions,
        });
      }
      // Then push to all staff with this role
      const resp = await apiClient.post(`/api/v1/rbac/roles/${roleId}/push`);
      const msg = resp.data?.message || resp.data?.data?.message || `Pushed to all ${roleId} staff`;
      toast.success(msg);
      setPushConfirm(roleId);
      setTimeout(() => setPushConfirm(null), 3000);
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Failed to push permissions');
    } finally {
      setPushing(null);
    }
  };

  const countPermissions = (role: StoredRole) => {
    let total = 0;
    let enabled = 0;
    PERMISSION_MODULES.forEach((mod) => {
      const perms = role.permissions[mod.id];
      if (!perms) return;
      (['view', 'edit', 'delete'] as const).forEach((action) => {
        total++;
        if (perms[action]) enabled++;
      });
    });
    return { total, enabled };
  };

  const hasOverrides = (role: StoredRole) => {
    const defaults = DEFAULT_PERMISSIONS[role.id as StaffRole];
    if (!defaults) return false;
    return PERMISSION_MODULES.some(mod =>
      (['view', 'edit', 'delete'] as const).some(action =>
        role.permissions[mod.id]?.[action] !== defaults[mod.id]?.[action]
      )
    );
  };

  return (
    <div className="max-w-5xl space-y-4 sm:space-y-6">
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-[#5C9BA4]" />
            <h1 className="text-base sm:text-lg font-semibold text-neutral-900">
              Roles & Permissions
            </h1>
          </div>
          <p className="text-[12px] sm:text-sm text-neutral-500 mt-1">
            Configure access levels for each of the {STAFF_ROLES.length} staff roles across {PERMISSION_MODULES.length} modules
          </p>
        </div>
        <div className="flex items-center gap-2 self-start">
          {saved ? (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-600 rounded-lg border border-emerald-200 animate-in fade-in">
              <Check className="w-3.5 h-3.5" />
              <span className="text-xs font-medium">Changes saved</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-[#FAF8F6] text-neutral-500 rounded-lg border border-neutral-200">
              <Save className="w-3.5 h-3.5" />
              <span className="text-xs font-medium">Auto-save enabled</span>
            </div>
          )}
        </div>
      </header>

      {/* Info Banner */}
      <div className="flex items-start gap-3 px-4 py-3 bg-blue-50/60 border border-blue-100 rounded-xl">
        <Info className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
        <p className="text-xs text-blue-700 leading-relaxed">
          Permission changes are <strong>saved automatically</strong> and take effect immediately.
          Toggle any checkbox to grant or revoke access — the sidebar and page access will update on the next page load for users with that role.
        </p>
      </div>

      {/* Roles List */}
      <div className="space-y-3">
        {roles.map((role) => {
          const permCount = countPermissions(role);
          const isExpanded = expandedRole === role.id;
          const overridden = hasOverrides(role);

          return (
            <div
              key={role.id}
              className="bg-white rounded-xl border border-neutral-200/80 overflow-hidden shadow-sm"
            >
              {/* Role Header */}
              <button
                onClick={() => setExpandedRole(isExpanded ? null : role.id)}
                className="w-full px-4 sm:px-6 py-3.5 sm:py-4 flex items-center justify-between hover:bg-[#FAF8F6]/50 transition-colors"
              >
                <div className="text-left min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-[13px] sm:text-sm font-semibold text-neutral-900">{role.name}</h3>
                    {overridden && (
                      <span className="px-1.5 py-0.5 text-[9px] font-medium bg-amber-50 text-amber-600 rounded border border-amber-200">
                        Customised
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] sm:text-xs text-neutral-500 mt-0.5 truncate">{role.description}</p>
                </div>
                <div className="flex items-center gap-3 sm:gap-5 flex-shrink-0">
                  {/* Staff count */}
                  <div className="flex items-center gap-1.5 text-neutral-400">
                    <Users className="w-3.5 h-3.5" />
                    <span className="text-xs font-medium">{role.staffCount || 0}</span>
                  </div>
                  {/* Permission count */}
                  <div className="text-right">
                    <p className="text-[13px] sm:text-sm font-semibold text-neutral-900">
                      {permCount.enabled}<span className="text-neutral-400 font-normal">/{permCount.total}</span>
                    </p>
                    <p className="text-[10px] text-neutral-400 mt-0.5 hidden sm:block">permissions</p>
                  </div>
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4 text-neutral-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-neutral-400" />
                  )}
                </div>
              </button>

              {/* Permissions Matrix */}
              {isExpanded && (
                <div className="border-t border-neutral-100">
                  <div className="p-4 sm:p-6">
                    <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
                      <table className="w-full min-w-[480px]">
                        <thead>
                          <tr className="border-b border-neutral-200/60">
                            <th className="text-left py-2 sm:py-2.5 px-2 sm:px-3 text-[10px] sm:text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                              Module
                            </th>
                            <th className="text-center py-2 sm:py-2.5 px-2 sm:px-3 text-[10px] sm:text-xs font-semibold text-neutral-500 uppercase tracking-wider w-16 sm:w-20">
                              View
                            </th>
                            <th className="text-center py-2 sm:py-2.5 px-2 sm:px-3 text-[10px] sm:text-xs font-semibold text-neutral-500 uppercase tracking-wider w-16 sm:w-20">
                              Edit
                            </th>
                            <th className="text-center py-2 sm:py-2.5 px-2 sm:px-3 text-[10px] sm:text-xs font-semibold text-neutral-500 uppercase tracking-wider w-16 sm:w-20">
                              Delete
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {PERMISSION_MODULES.map((mod, index) => {
                            const perms = role.permissions[mod.id] || { view: false, edit: false, delete: false };

                            return (
                              <tr
                                key={mod.id}
                                className={index !== PERMISSION_MODULES.length - 1 ? 'border-b border-neutral-100' : ''}
                              >
                                <td className="py-2.5 sm:py-3 px-2 sm:px-3">
                                  <span className="text-[11px] sm:text-sm text-neutral-700">
                                    {mod.label}
                                  </span>
                                </td>
                                {(['view', 'edit', 'delete'] as const).map((action) => {
                                  const isOn = perms[action] || false;
                                  const overriddenCell = isOverridden(role.id as StaffRole, mod.id, action, isOn);
                                  return (
                                    <td key={action} className="py-2.5 sm:py-3 px-2 sm:px-3 text-center">
                                      <button
                                        type="button"
                                        onClick={() => togglePermission(role.id, mod.id, action)}
                                        className={`w-7 h-7 rounded-lg inline-flex items-center justify-center transition-all duration-200 ${
                                          isOn
                                            ? overriddenCell
                                              ? 'bg-amber-100 border-2 border-amber-400 text-amber-600'
                                              : 'bg-emerald-100 border-2 border-emerald-400 text-emerald-600'
                                            : overriddenCell
                                              ? 'bg-amber-50 border-2 border-amber-300 text-amber-400'
                                              : 'bg-white border-2 border-neutral-200 text-neutral-300 hover:border-neutral-300'
                                        }`}
                                      >
                                        {isOn ? <Check className="w-3.5 h-3.5" /> : <Minus className="w-3.5 h-3.5" />}
                                      </button>
                                    </td>
                                  );
                                })}
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap items-center justify-between gap-3 mt-4 sm:mt-5 pt-3 sm:pt-4 border-t border-neutral-100">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => resetRoleToDefaults(role.id)}
                          className="text-xs"
                        >
                          <RotateCcw className="w-3 h-3 mr-1" />
                          Reset to Defaults
                        </Button>
                      </div>
                      <div className="flex items-center gap-2">
                        {pushConfirm === role.id ? (
                          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-600 rounded-lg border border-emerald-200">
                            <Check className="w-3 h-3" />
                            <span className="text-xs font-medium">Pushed to all {role.name} staff</span>
                          </div>
                        ) : pushing === role.id ? (
                          <div className="flex items-center gap-1.5 px-3 py-1.5 text-neutral-500">
                            <RefreshCw className="w-3 h-3 animate-spin" />
                            <span className="text-xs font-medium">Pushing...</span>
                          </div>
                        ) : (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => pushDefaultsToAll(role.id)}
                            className="text-xs text-[#5C9BA4]"
                          >
                            <Users className="w-3 h-3 mr-1" />
                            Push to All {role.name} Staff
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Legend Card */}
      <div className="bg-white rounded-xl border border-neutral-200/80 overflow-hidden shadow-sm">
        <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-neutral-100">
          <h4 className="text-[13px] sm:text-sm font-medium text-neutral-900">Legend</h4>
          <p className="text-[10px] sm:text-xs text-neutral-500 mt-0.5">Understanding permission indicators</p>
        </div>
        <div className="p-4 sm:p-6">
          <div className="flex flex-wrap gap-4 sm:gap-6">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-emerald-100 border-2 border-emerald-400 flex items-center justify-center">
                <Check className="w-3 h-3 text-emerald-600" />
              </div>
              <span className="text-[10px] sm:text-xs text-neutral-600">Default granted</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-white border-2 border-neutral-200 flex items-center justify-center">
                <Minus className="w-3 h-3 text-neutral-300" />
              </div>
              <span className="text-[10px] sm:text-xs text-neutral-600">Default denied</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-amber-100 border-2 border-amber-400 flex items-center justify-center">
                <Check className="w-3 h-3 text-amber-600" />
              </div>
              <span className="text-[10px] sm:text-xs text-neutral-600">Custom override (granted)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-amber-50 border-2 border-amber-300 flex items-center justify-center">
                <Minus className="w-3 h-3 text-amber-400" />
              </div>
              <span className="text-[10px] sm:text-xs text-neutral-600">Custom override (denied)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
