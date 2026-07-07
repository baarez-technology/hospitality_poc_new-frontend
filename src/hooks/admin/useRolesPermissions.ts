/**
 * useRolesPermissions Hook
 * Role and permission management with localStorage persistence
 */

import { useState, useEffect, useCallback } from 'react';
import { loadRoles, saveRoles, loadPermissions, savePermissions } from '@/utils/admin/settingsStorage';
import { defaultRoles } from '@/data/rolesData';
import { allPermissions } from '@/data/permissionsData';
import { canAccess, getRolePermissions } from '@/utils/admin/permissionsMath';
import {
  createRole,
  updateRolePermissions,
  toggleRolePermission,
  deleteRole,
  isDefaultRole,
  validateRoleData
} from '@/utils/admin/rolesMath';

export function useRolesPermissions() {
  const [customRoles, setCustomRoles] = useState([]);
  const [rolePermissionsMap, setRolePermissionsMap] = useState({});
  const [loading, setLoading] = useState(true);

  // Load roles from localStorage on mount
  useEffect(() => {
    const storedCustomRoles = loadRoles();
    const storedPermissions = loadPermissions();

    if (storedCustomRoles && storedCustomRoles.length > 0) {
      setCustomRoles(storedCustomRoles);
    }

    if (storedPermissions && Object.keys(storedPermissions).length > 0) {
      setRolePermissionsMap(storedPermissions);
    } else {
      // Initialize with default role permissions
      const defaultMap = {};
      defaultRoles.forEach(role => {
        defaultMap[role.id] = role.permissions;
      });
      setRolePermissionsMap(defaultMap);
      savePermissions(defaultMap);
    }

    setLoading(false);
  }, []);

  // Save custom roles to localStorage
  useEffect(() => {
    if (!loading) {
      saveRoles(customRoles);
    }
  }, [customRoles, loading]);

  // Save permissions map to localStorage
  useEffect(() => {
    if (!loading) {
      savePermissions(rolePermissionsMap);
    }
  }, [rolePermissionsMap, loading]);

  /**
   * Get all roles (default + custom)
   */
  const getAllRoles = useCallback(() => {
    return [...defaultRoles, ...customRoles];
  }, [customRoles]);

  /**
   * Get role by ID
   * @param {string} roleId - Role ID
   * @returns {object|null}
   */
  const getRoleById = useCallback((roleId) => {
    const allRoles = getAllRoles();
    return allRoles.find(r => r.id === roleId) || null;
  }, [getAllRoles]);

  /**
   * Add a new custom role
   * @param {object} roleData - { name, description, permissions, color }
   * @returns {object} - { success: boolean, role: object|null, errors: string[] }
   */
  const addRole = useCallback((roleData) => {
    // Validate role data
    const validation = validateRoleData(roleData);
    if (!validation.valid) {
      return {
        success: false,
        role: null,
        errors: validation.errors
      };
    }

    // Create new role
    const newRole = createRole(roleData);

    // Check for duplicate ID
    const allRoles = getAllRoles();
    if (allRoles.some(r => r.id === newRole.id)) {
      return {
        success: false,
        role: null,
        errors: ['A role with this name already exists']
      };
    }

    setCustomRoles(prev => [...prev, newRole]);

    // Add to permissions map
    setRolePermissionsMap(prev => ({
      ...prev,
      [newRole.id]: newRole.permissions
    }));

    return {
      success: true,
      role: newRole,
      errors: []
    };
  }, [getAllRoles]);

  /**
   * Update a custom role
   * @param {string} roleId - Role ID
   * @param {object} updates - Fields to update
   * @returns {object} - { success: boolean }
   */
  const updateRole = useCallback((roleId, updates) => {
    // Don't allow modifying default roles
    if (isDefaultRole(roleId)) {
      return {
        success: false,
        reason: 'Cannot modify default roles'
      };
    }

    setCustomRoles(prev =>
      prev.map(role =>
        role.id === roleId
          ? { ...role, ...updates, updatedAt: new Date().toISOString() }
          : role
      )
    );

    // Update permissions map if permissions changed
    if (updates.permissions) {
      setRolePermissionsMap(prev => ({
        ...prev,
        [roleId]: updates.permissions
      }));
    }

    return { success: true };
  }, []);

  /**
   * Delete a custom role
   * @param {string} roleId - Role ID to delete
   * @returns {object} - { success: boolean, reason: string|null }
   */
  const removeRole = useCallback((roleId) => {
    // Don't allow deleting default roles
    if (isDefaultRole(roleId)) {
      return {
        success: false,
        reason: 'Cannot delete default roles'
      };
    }

    setCustomRoles(prev => prev.filter(role => role.id !== roleId));

    // Remove from permissions map
    setRolePermissionsMap(prev => {
      const newMap = { ...prev };
      delete newMap[roleId];
      return newMap;
    });

    return { success: true, reason: null };
  }, []);

  /**
   * Toggle a permission for a role
   * @param {string} roleId - Role ID
   * @param {string} permissionId - Permission ID
   * @returns {object} - { success: boolean }
   */
  const togglePermission = useCallback((roleId, permissionId) => {
    // Don't allow modifying default roles
    if (isDefaultRole(roleId)) {
      return {
        success: false,
        reason: 'Cannot modify default role permissions'
      };
    }

    const updatedRoles = toggleRolePermission(roleId, permissionId, customRoles);
    if (!updatedRoles) {
      return { success: false, reason: 'Role not found' };
    }

    setCustomRoles(updatedRoles);

    // Update permissions map
    const role = updatedRoles.find(r => r.id === roleId);
    if (role) {
      setRolePermissionsMap(prev => ({
        ...prev,
        [roleId]: role.permissions
      }));
    }

    return { success: true };
  }, [customRoles]);

  /**
   * Set permissions for a role
   * @param {string} roleId - Role ID
   * @param {string[]} permissions - Array of permission IDs
   * @returns {object} - { success: boolean }
   */
  const setPermissions = useCallback((roleId, permissions) => {
    // Don't allow modifying default roles
    if (isDefaultRole(roleId)) {
      return {
        success: false,
        reason: 'Cannot modify default role permissions'
      };
    }

    const updatedRoles = updateRolePermissions(roleId, permissions, customRoles);
    if (!updatedRoles) {
      return { success: false, reason: 'Role not found' };
    }

    setCustomRoles(updatedRoles);

    // Update permissions map
    setRolePermissionsMap(prev => ({
      ...prev,
      [roleId]: permissions
    }));

    return { success: true };
  }, [customRoles]);

  /**
   * Check if a role has access to a module
   * @param {string} roleId - Role ID
   * @param {string} moduleName - Module/permission ID
   * @returns {boolean}
   */
  const checkAccess = useCallback((roleId, moduleName) => {
    return canAccess(roleId, moduleName);
  }, []);

  /**
   * Get permissions for a role
   * @param {string} roleId - Role ID
   * @returns {string[]}
   */
  const getPermissionsForRole = useCallback((roleId) => {
    // Check custom roles first
    const permissions = rolePermissionsMap[roleId];
    if (permissions) return permissions;

    // Fall back to default role permissions
    return getRolePermissions(roleId);
  }, [rolePermissionsMap]);

  /**
   * Get all available permissions
   * @returns {object[]}
   */
  const getAvailablePermissions = useCallback(() => {
    return allPermissions;
  }, []);

  /**
   * Get permissions by category
   * @param {string} category - Category name
   * @returns {object[]}
   */
  const getPermissionsByCategory = useCallback((category) => {
    return allPermissions.filter(p => p.category === category);
  }, []);

  return {
    roles: getAllRoles(),
    customRoles,
    permissions: allPermissions,
    rolePermissionsMap,
    loading,
    addRole,
    updateRole,
    removeRole,
    togglePermission,
    setPermissions,
    checkAccess,
    getRoleById,
    getPermissionsForRole,
    getAvailablePermissions,
    getPermissionsByCategory
  };
}
