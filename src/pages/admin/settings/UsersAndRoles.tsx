import React, { useState } from 'react';
import { useSettingsContext } from '../../../contexts/SettingsContext';
import { useToast } from '../../../contexts/ToastContext';
import FormSection from '../../../components/settings/FormSection';
import UsersTable from '../../../components/settings/UsersTable';
import { Button } from '../../../components/ui2/Button';
import {
  Modal,
  ModalHeader,
  ModalTitle,
  ModalDescription,
  ModalContent,
  ModalFooter,
} from '../../../components/ui2/Modal';
import { UserPlus, Users as UsersIcon } from 'lucide-react';

/**
 * Users & Roles Page
 * User management and role assignment
 */
export default function UsersAndRoles() {
  const { users, roles, disableUser, enableUser } = useSettingsContext();
  const { success, error } = useToast();
  const [showInviteModal, setShowInviteModal] = useState(false);

  const handleEditUser = (user) => {
    success(`Opening edit form for ${user.name}`);
  };

  const handleToggleActive = (user) => {
    if (user.active) {
      const result = disableUser(user.id);
      if (result.success) {
        success(`${user.name} has been disabled`);
      } else {
        error(result.reason || 'Failed to disable user');
      }
    } else {
      enableUser(user.id);
      success(`${user.name} has been enabled`);
    }
  };

  const handleInviteUser = () => {
    setShowInviteModal(true);
  };

  return (
    <div className="space-y-6">
      {/* Header with Action */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-neutral-800">
            Users & Roles
          </h2>
          <p className="text-sm text-neutral-600 mt-1">
            Manage team members and their roles
          </p>
        </div>
        <Button
          variant="primary"
          icon={UserPlus}
          onClick={handleInviteUser}
        >
          Invite User
        </Button>
      </div>

      {/* Users Table */}
      <FormSection
        title={`Team Members (${users.length})`}
        description="View and manage all users in your organization"
      >
        <UsersTable
          users={users}
          onEdit={handleEditUser}
          onToggleActive={handleToggleActive}
        />
      </FormSection>

      {/* Roles Overview */}
      <FormSection
        title="Roles Overview"
        description="Available roles and their user counts"
      >
        <div className="grid grid-cols-4 gap-4">
          {roles.map((role) => (
            <div
              key={role.id}
              className="p-4 bg-[#FAF8F6] border border-neutral-100 rounded-[10px] hover:border-primary-300 hover:shadow-sm transition-all"
            >
              <div
                className="w-10 h-10 rounded-[10px] flex items-center justify-center mb-3"
                style={{ backgroundColor: role.color + '20' }}
              >
                <UsersIcon className="w-5 h-5" style={{ color: role.color }} />
              </div>
              <h4 className="text-sm font-semibold text-neutral-800 mb-1">
                {role.name}
              </h4>
              <p className="text-xs text-neutral-600 mb-2">
                {role.description}
              </p>
              <p className="text-xs text-neutral-500">
                {users.filter(u => u.role === role.id).length} {users.filter(u => u.role === role.id).length === 1 ? 'user' : 'users'}
              </p>
            </div>
          ))}
        </div>
      </FormSection>

      {/* Invite User Modal */}
      <Modal open={showInviteModal} onClose={() => setShowInviteModal(false)} size="sm">
        <ModalHeader icon={UserPlus}>
          <ModalTitle>Invite New User</ModalTitle>
          <ModalDescription>Send an invitation to join your team</ModalDescription>
        </ModalHeader>

        <ModalContent>
          <div className="space-y-4">
            <div>
              <label className="block text-[12px] font-semibold text-neutral-600 mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                placeholder="user@example.com"
                className="w-full px-4 py-2.5 text-sm bg-white border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-terra-500/30 focus:border-terra-400"
              />
            </div>

            <div>
              <label className="block text-[12px] font-semibold text-neutral-600 mb-1.5">
                Role
              </label>
              <select className="w-full px-4 py-2.5 text-sm bg-white border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-terra-500/30 focus:border-terra-400">
                {roles.map(role => (
                  <option key={role.id} value={role.name}>{role.name}</option>
                ))}
              </select>
            </div>
          </div>
        </ModalContent>

        <ModalFooter>
          <Button
            variant="outline"
            onClick={() => setShowInviteModal(false)}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={() => {
              setShowInviteModal(false);
              success('User invited!');
            }}
          >
            Send Invite
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
