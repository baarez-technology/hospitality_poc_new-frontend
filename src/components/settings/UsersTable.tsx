import React, { useState } from 'react';
import { Edit2, ToggleLeft, ToggleRight, User, Mail, Calendar } from 'lucide-react';

/**
 * Users Table Component
 * Table for managing users
 */
export default function UsersTable({ users, onEdit, onToggleActive }) {
  const [selectedUser, setSelectedUser] = useState(null);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getRoleBadgeColor = (role) => {
    const colors = {
      'Admin': 'bg-purple-100 text-purple-700',
      'Manager': 'bg-pink-100 text-pink-700',
      'Front Desk': 'bg-blue-100 text-blue-700',
      'Housekeeping Manager': 'bg-green-100 text-[#4E5840]',
      'Housekeeping': 'bg-emerald-100 text-emerald-700',
      'Revenue Manager': 'bg-amber-100 text-amber-700',
      'Maintenance': 'bg-rose-100 text-rose-700',
      'Guest Services': 'bg-indigo-100 text-indigo-700'
    };
    return colors[role] || 'bg-neutral-100 text-neutral-700';
  };

  return (
    <div className="bg-white border border-neutral-200 rounded-xl shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-[#FAF8F6] border-b border-neutral-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-neutral-700 uppercase tracking-wider">
                User
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-neutral-700 uppercase tracking-wider">
                Role
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-neutral-700 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-neutral-700 uppercase tracking-wider">
                Last Login
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-neutral-700 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-right text-xs font-semibold text-neutral-700 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-200">
            {users.map((user) => (
              <tr
                key={user.id}
                className="hover:bg-[#FAF8F6] transition-colors"
              >
                {/* User */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#A57865]/10 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-[#A57865]" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-neutral-900">
                        {user.name}
                      </p>
                    </div>
                  </div>
                </td>

                {/* Role */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(user.role)}`}>
                    {user.role}
                  </span>
                </td>

                {/* Email */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2 text-sm text-neutral-600">
                    <Mail className="w-4 h-4" />
                    {user.email}
                  </div>
                </td>

                {/* Last Login */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2 text-sm text-neutral-600">
                    <Calendar className="w-4 h-4" />
                    {formatDate(user.lastLogin)}
                  </div>
                </td>

                {/* Status */}
                <td className="px-6 py-4 whitespace-nowrap">
                  {user.active ? (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-[#4E5840]">
                      Active
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-rose-100 text-rose-700">
                      Inactive
                    </span>
                  )}
                </td>

                {/* Actions */}
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => onEdit(user)}
                      className="p-2 rounded-lg text-neutral-600 hover:bg-neutral-100 hover:text-[#A57865] transition-colors"
                      title="Edit user"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onToggleActive(user)}
                      className="p-2 rounded-lg text-neutral-600 hover:bg-neutral-100 hover:text-[#A57865] transition-colors"
                      title={user.active ? 'Deactivate' : 'Activate'}
                    >
                      {user.active ? (
                        <ToggleRight className="w-4 h-4" />
                      ) : (
                        <ToggleLeft className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
