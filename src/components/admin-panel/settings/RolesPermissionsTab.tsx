import { useState, useEffect } from 'react';
import { Shield, Check, X, ChevronDown, ChevronUp, Users } from 'lucide-react';
import { PERMISSION_MODULES, defaultSettings } from '@/utils/admin/settings';

const STORAGE_KEY = 'glimmora_roles';

export default function RolesPermissionsTab() {
  const [roles, setRoles] = useState([]);
  const [expandedRole, setExpandedRole] = useState(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      setRoles(JSON.parse(stored));
    } else {
      setRoles(defaultSettings.roles);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultSettings.roles));
    }
  }, []);

  const saveRoles = (newRoles) => {
    setRoles(newRoles);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newRoles));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const togglePermission = (roleId, module, permission) => {
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

  const toggleAllPermissions = (roleId, module, value) => {
    const newRoles = roles.map((role) => {
      if (role.id !== roleId) return role;
      const permissions = role.permissions[module] || {};
      const updated = {};
      Object.keys(permissions).forEach((key) => {
        updated[key] = value;
      });
      return {
        ...role,
        permissions: {
          ...role.permissions,
          [module]: updated
        }
      };
    });
    saveRoles(newRoles);
  };

  const getPermissionTypes = (module) => {
    if (module === 'reports') return ['view', 'edit', 'export'];
    if (module === 'dashboard' || module === 'revenueAI' || module === 'reputationAI' || module === 'crm' || module === 'settings' || module === 'aiAssistant') {
      return ['view', 'edit'];
    }
    return ['view', 'edit', 'delete'];
  };

  const countPermissions = (role) => {
    let total = 0;
    let enabled = 0;
    PERMISSION_MODULES.forEach((mod) => {
      const perms = role.permissions[mod.id] || {};
      Object.values(perms).forEach((val) => {
        total++;
        if (val) enabled++;
      });
    });
    return { total, enabled };
  };

  return (
    <div className="max-w-5xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Roles & Permissions</h1>
          <p className="text-sm text-neutral-500 mt-1">
            Configure access levels for each role
          </p>
        </div>
        {saved && (
          <div className="flex items-center gap-2 px-4 py-2 bg-[#4E5840]/10 text-[#4E5840] rounded-lg">
            <Check className="w-4 h-4" />
            <span className="text-sm font-medium">Changes saved</span>
          </div>
        )}
      </div>

      {/* Roles List */}
      <div className="space-y-4">
        {roles.map((role) => {
          const permCount = countPermissions(role);
          const isExpanded = expandedRole === role.id;

          return (
            <div
              key={role.id}
              className="bg-white border border-[#E5E5E5] rounded-xl overflow-hidden"
            >
              {/* Role Header */}
              <button
                onClick={() => setExpandedRole(isExpanded ? null : role.id)}
                className="w-full px-6 py-4 flex items-center justify-between hover:bg-[#FAF7F4] transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-[#A57865]/10 flex items-center justify-center">
                    <Users className="w-5 h-5 text-[#A57865]" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-semibold text-neutral-900">{role.name}</h3>
                    <p className="text-sm text-neutral-500">{role.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-sm font-medium text-neutral-900">
                      {permCount.enabled} / {permCount.total}
                    </p>
                    <p className="text-xs text-neutral-500">permissions</p>
                  </div>
                  {isExpanded ? (
                    <ChevronUp className="w-5 h-5 text-neutral-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-neutral-400" />
                  )}
                </div>
              </button>

              {/* Permissions Matrix */}
              {isExpanded && (
                <div className="border-t border-[#E5E5E5] p-6">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-[#E5E5E5]">
                          <th className="text-left py-3 px-4 text-xs font-semibold text-neutral-500 uppercase">
                            Module
                          </th>
                          <th className="text-center py-3 px-4 text-xs font-semibold text-neutral-500 uppercase">
                            View
                          </th>
                          <th className="text-center py-3 px-4 text-xs font-semibold text-neutral-500 uppercase">
                            Edit
                          </th>
                          <th className="text-center py-3 px-4 text-xs font-semibold text-neutral-500 uppercase">
                            Delete / Export
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {PERMISSION_MODULES.map((mod) => {
                          const perms = role.permissions[mod.id] || {};
                          const permTypes = getPermissionTypes(mod.id);

                          return (
                            <tr
                              key={mod.id}
                              className="border-b border-[#E5E5E5] last:border-b-0"
                            >
                              <td className="py-3 px-4">
                                <span className="font-medium text-neutral-700">
                                  {mod.label}
                                </span>
                              </td>
                              {permTypes.map((perm) => (
                                <td key={perm} className="py-3 px-4 text-center">
                                  <button
                                    onClick={() => togglePermission(role.id, mod.id, perm)}
                                    className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                                      perms[perm]
                                        ? 'bg-[#4E5840] text-white'
                                        : 'bg-neutral-100 text-neutral-400 hover:bg-neutral-200'
                                    }`}
                                  >
                                    {perms[perm] ? (
                                      <Check className="w-4 h-4" />
                                    ) : (
                                      <X className="w-4 h-4" />
                                    )}
                                  </button>
                                </td>
                              ))}
                              {permTypes.length < 3 && (
                                <td className="py-3 px-4 text-center">
                                  <span className="text-neutral-300">—</span>
                                </td>
                              )}
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Quick Actions */}
                  <div className="flex items-center gap-4 mt-4 pt-4 border-t border-[#E5E5E5]">
                    <span className="text-sm text-neutral-500">Quick actions:</span>
                    <button
                      onClick={() => {
                        PERMISSION_MODULES.forEach((mod) => {
                          toggleAllPermissions(role.id, mod.id, true);
                        });
                      }}
                      className="text-sm text-[#4E5840] hover:underline"
                    >
                      Grant all
                    </button>
                    <button
                      onClick={() => {
                        PERMISSION_MODULES.forEach((mod) => {
                          toggleAllPermissions(role.id, mod.id, false);
                        });
                      }}
                      className="text-sm text-red-500 hover:underline"
                    >
                      Revoke all
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-8 p-4 bg-[#FAF7F4] rounded-xl">
        <h4 className="text-sm font-medium text-neutral-700 mb-3">Permission Legend</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-[#4E5840] flex items-center justify-center">
              <Check className="w-3 h-3 text-white" />
            </div>
            <span className="text-neutral-600">Permission granted</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-neutral-100 flex items-center justify-center">
              <X className="w-3 h-3 text-neutral-400" />
            </div>
            <span className="text-neutral-600">Permission denied</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-neutral-300">—</span>
            <span className="text-neutral-600">Not applicable</span>
          </div>
        </div>
      </div>
    </div>
  );
}
