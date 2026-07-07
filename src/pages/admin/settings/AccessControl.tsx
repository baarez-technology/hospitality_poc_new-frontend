import React, { useState } from 'react';
import { useToast } from '../../../contexts/ToastContext';
import FormSection from '../../../components/settings/FormSection';
import RolePermissions from '../../../components/settings/RolePermissions';
import { permissionsData, rolesData } from '../../../data/settingsData';
import { Save } from 'lucide-react';
import { Button } from '@/components/ui2/Button';

/**
 * Access Control Page
 * Module and feature permissions by role
 */
export default function AccessControl() {
  const [permissions, setPermissions] = useState(permissionsData);
  const { success } = useToast();

  const handleTogglePermission = (moduleId, roleName) => {
    setPermissions({
      ...permissions,
      modules: permissions.modules.map(module =>
        module.id === moduleId
          ? {
              ...module,
              roles: {
                ...module.roles,
                [roleName]: !module.roles[roleName]
              }
            }
          : module
      )
    });
  };

  const handleSave = () => {
    success('Access control settings saved successfully');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-neutral-800">
            Access Control
          </h2>
          <p className="text-sm text-neutral-600 mt-1">
            Manage module access and permissions by role
          </p>
        </div>
        <Button variant="primary" icon={Save} onClick={handleSave}>
          Save Changes
        </Button>
      </div>

      {/* Permissions Table */}
      <FormSection
        title="Module Permissions"
        description="Control which roles can access each module"
      >
        <RolePermissions
          permissions={permissions}
          roles={rolesData}
          onTogglePermission={handleTogglePermission}
        />
      </FormSection>

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          <strong>Note:</strong> Admin role always has full access to all modules. Changes take effect immediately for all users with the selected roles.
        </p>
      </div>
    </div>
  );
}
