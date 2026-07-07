import React from 'react';
import { Check, X } from 'lucide-react';

/**
 * Role Permissions Component
 * Table showing permissions by role
 */
export default function RolePermissions({ permissions, roles, onTogglePermission }) {
  return (
    <div className="bg-white border border-neutral-200 rounded-xl shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-[#FAF8F6] border-b border-neutral-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-neutral-700 uppercase tracking-wider sticky left-0 bg-neutral-50">
                Module
              </th>
              {roles.map((role) => (
                <th
                  key={role.id}
                  className="px-4 py-3 text-center text-xs font-semibold text-neutral-700 uppercase tracking-wider"
                >
                  {role.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-200">
            {permissions.modules.map((module) => (
              <tr key={module.id} className="hover:bg-[#FAF8F6] transition-colors">
                {/* Module Info */}
                <td className="px-6 py-4 sticky left-0 bg-white hover:bg-[#FAF8F6] transition-colors">
                  <div>
                    <p className="text-sm font-medium text-neutral-900">
                      {module.name}
                    </p>
                    <p className="text-xs text-neutral-500 mt-0.5">
                      {module.description}
                    </p>
                  </div>
                </td>

                {/* Permissions Checkboxes */}
                {roles.map((role) => (
                  <td key={role.id} className="px-4 py-4 text-center">
                    <button
                      onClick={() => onTogglePermission(module.id, role.name)}
                      className={`inline-flex items-center justify-center w-8 h-8 rounded-lg transition-all ${
                        module.roles[role.name]
                          ? 'bg-[#A57865]/10 text-[#A57865] hover:bg-[#A57865]/20'
                          : 'bg-neutral-100 text-neutral-400 hover:bg-neutral-200'
                      }`}
                    >
                      {module.roles[role.name] ? (
                        <Check className="w-5 h-5" />
                      ) : (
                        <X className="w-4 h-4" />
                      )}
                    </button>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
