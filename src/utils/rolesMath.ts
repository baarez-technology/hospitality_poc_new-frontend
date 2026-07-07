/**
 * Roles Math Utility
 * Role manipulation and management utilities
 */

import { defaultRoles } from '../data/rolesData';
import { allPermissions } from '../data/permissionsData';

/**
 * Create a new custom role
 * @param {object} roleData - { name, description, permissions, color }
 * @returns {object} - New role object with generated ID
 */
export function createRole(roleData) {
  const { name, description = '', permissions = [], color = '#6B7280' } = roleData;

  const id = name.toLowerCase().replace(/\s+/g, '_');

  return {
    id,
    name,
    description,
    permissions,
    color,
    custom: true, // Mark as custom role
    createdAt: new Date().toISOString()
  };
}

/**
 * Update role permissions
 * @param {string} roleId - Role ID
 * @param {string[]} newPermissions - Updated permissions array
 * @param {object[]} customRoles - Array of custom roles
 * @returns {object[]|null} - Updated roles array or null if role not found
 */
export function updateRolePermissions(roleId, newPermissions, customRoles = []) {
  // Don't allow modifying default roles
  const isDefault = defaultRoles.some(r => r.id === roleId);
  if (isDefault) {
    console.warn('Cannot modify default role permissions');
    return null;
  }

  return customRoles.map(role =>
    role.id === roleId
      ? { ...role, permissions: newPermissions, updatedAt: new Date().toISOString() }
      : role
  );
}

/**
 * Add permission to a role
 * @param {string} roleId - Role ID
 * @param {string} permission - Permission ID to add
 * @param {object[]} customRoles - Array of custom roles
 * @returns {object[]|null} - Updated roles array
 */
export function addPermissionToRole(roleId, permission, customRoles = []) {
  const role = customRoles.find(r => r.id === roleId);
  if (!role) return null;

  const currentPermissions = role.permissions || [];
  if (currentPermissions.includes(permission)) return customRoles; // Already has permission

  const newPermissions = [...currentPermissions, permission];
  return updateRolePermissions(roleId, newPermissions, customRoles);
}

/**
 * Remove permission from a role
 * @param {string} roleId - Role ID
 * @param {string} permission - Permission ID to remove
 * @param {object[]} customRoles - Array of custom roles
 * @returns {object[]|null} - Updated roles array
 */
export function removePermissionFromRole(roleId, permission, customRoles = []) {
  const role = customRoles.find(r => r.id === roleId);
  if (!role) return null;

  const newPermissions = (role.permissions || []).filter(p => p !== permission);
  return updateRolePermissions(roleId, newPermissions, customRoles);
}

/**
 * Toggle permission for a role
 * @param {string} roleId - Role ID
 * @param {string} permission - Permission ID
 * @param {object[]} customRoles - Array of custom roles
 * @returns {object[]|null} - Updated roles array
 */
export function toggleRolePermission(roleId, permission, customRoles = []) {
  const role = customRoles.find(r => r.id === roleId);
  if (!role) return null;

  const hasPermission = (role.permissions || []).includes(permission);

  if (hasPermission) {
    return removePermissionFromRole(roleId, permission, customRoles);
  } else {
    return addPermissionToRole(roleId, permission, customRoles);
  }
}

/**
 * Delete a custom role
 * @param {string} roleId - Role ID to delete
 * @param {object[]} customRoles - Array of custom roles
 * @returns {object[]|null} - Updated roles array or null if default role
 */
export function deleteRole(roleId, customRoles = []) {
  // Don't allow deleting default roles
  const isDefault = defaultRoles.some(r => r.id === roleId);
  if (isDefault) {
    console.warn('Cannot delete default role');
    return null;
  }

  return customRoles.filter(role => role.id !== roleId);
}

/**
 * Get all roles (default + custom)
 * @param {object[]} customRoles - Array of custom roles
 * @returns {object[]} - Combined array of all roles
 */
export function getAllRoles(customRoles = []) {
  return [...defaultRoles, ...customRoles];
}

/**
 * Get role by ID from combined roles
 * @param {string} roleId - Role ID
 * @param {object[]} customRoles - Array of custom roles
 * @returns {object|null} - Role object or null
 */
export function getRoleById(roleId, customRoles = []) {
  const allRoles = getAllRoles(customRoles);
  return allRoles.find(r => r.id === roleId) || null;
}

/**
 * Check if role is default (built-in)
 * @param {string} roleId - Role ID
 * @returns {boolean}
 */
export function isDefaultRole(roleId) {
  return defaultRoles.some(r => r.id === roleId);
}

/**
 * Get permissions count for a role
 * @param {string} roleId - Role ID
 * @param {object[]} customRoles - Array of custom roles
 * @returns {number}
 */
export function getRolePermissionsCount(roleId, customRoles = []) {
  const role = getRoleById(roleId, customRoles);
  if (!role) return 0;

  if (role.permissions.includes('*')) return allPermissions.length;
  return role.permissions.length;
}

/**
 * Validate role data
 * @param {object} roleData - Role data to validate
 * @returns {object} - { valid: boolean, errors: string[] }
 */
export function validateRoleData(roleData) {
  const errors = [];

  if (!roleData.name || roleData.name.trim().length === 0) {
    errors.push('Role name is required');
  }

  if (roleData.name && roleData.name.trim().length < 2) {
    errors.push('Role name must be at least 2 characters');
  }

  if (!roleData.permissions || !Array.isArray(roleData.permissions)) {
    errors.push('Permissions must be an array');
  }

  if (roleData.permissions && roleData.permissions.length === 0) {
    errors.push('Role must have at least one permission');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Clone a role with a new name
 * @param {string} sourceRoleId - Role ID to clone
 * @param {string} newName - Name for the cloned role
 * @param {object[]} customRoles - Array of custom roles
 * @returns {object|null} - New role object or null
 */
export function cloneRole(sourceRoleId, newName, customRoles = []) {
  const sourceRole = getRoleById(sourceRoleId, customRoles);
  if (!sourceRole) return null;

  return createRole({
    name: newName,
    description: `Cloned from ${sourceRole.name}`,
    permissions: [...sourceRole.permissions],
    color: sourceRole.color
  });
}

/**
 * Get roles by permission
 * @param {string} permission - Permission ID
 * @param {object[]} customRoles - Array of custom roles
 * @returns {object[]} - Array of roles that have this permission
 */
export function getRolesByPermission(permission, customRoles = []) {
  const allRoles = getAllRoles(customRoles);
  return allRoles.filter(role =>
    role.permissions.includes('*') || role.permissions.includes(permission)
  );
}

/**
 * Compare two roles
 * @param {string} roleId1 - First role ID
 * @param {string} roleId2 - Second role ID
 * @param {object[]} customRoles - Array of custom roles
 * @returns {object} - { common: [], only1: [], only2: [] }
 */
export function compareRoles(roleId1, roleId2, customRoles = []) {
  const role1 = getRoleById(roleId1, customRoles);
  const role2 = getRoleById(roleId2, customRoles);

  if (!role1 || !role2) return { common: [], only1: [], only2: [] };

  const perms1 = new Set(role1.permissions);
  const perms2 = new Set(role2.permissions);

  const common = [...perms1].filter(p => perms2.has(p));
  const only1 = [...perms1].filter(p => !perms2.has(p));
  const only2 = [...perms2].filter(p => !perms1.has(p));

  return { common, only1, only2 };
}
