/**
 * Permission Math Utility
 * Core access control and permission checking logic
 */

import { defaultRoles } from '../data/rolesData';

/**
 * Check if a user role has access to a specific module
 * @param {string} userRole - Role ID (e.g., 'owner', 'manager', 'front_desk')
 * @param {string} moduleName - Module/permission ID (e.g., 'dashboard', 'bookings')
 * @returns {boolean} - True if role has access, false otherwise
 */
export function canAccess(userRole, moduleName) {
  if (!userRole || !moduleName) return false;

  const role = defaultRoles.find(r => r.id === userRole);
  if (!role) return false;

  // Owner has access to everything
  if (role.permissions.includes('*')) return true;

  // Check if role has specific permission
  return role.permissions.includes(moduleName);
}

/**
 * Check if a role has a specific permission
 * @param {string} roleId - Role ID
 * @param {string} permission - Permission ID
 * @returns {boolean}
 */
export function hasPermission(roleId, permission) {
  return canAccess(roleId, permission);
}

/**
 * Get all permissions for a role
 * @param {string} roleId - Role ID
 * @returns {string[]} - Array of permission IDs
 */
export function getRolePermissions(roleId) {
  const role = defaultRoles.find(r => r.id === roleId);
  if (!role) return [];

  // If role has wildcard, return all permissions
  if (role.permissions.includes('*')) {
    return ['*'];
  }

  return role.permissions;
}

/**
 * Check if a role has access to multiple modules
 * @param {string} userRole - Role ID
 * @param {string[]} moduleNames - Array of module/permission IDs
 * @returns {boolean} - True if role has access to ALL modules
 */
export function canAccessMultiple(userRole, moduleNames) {
  if (!userRole || !moduleNames || moduleNames.length === 0) return false;

  return moduleNames.every(module => canAccess(userRole, module));
}

/**
 * Check if a role has access to ANY of the modules
 * @param {string} userRole - Role ID
 * @param {string[]} moduleNames - Array of module/permission IDs
 * @returns {boolean} - True if role has access to at least one module
 */
export function canAccessAny(userRole, moduleNames) {
  if (!userRole || !moduleNames || moduleNames.length === 0) return false;

  return moduleNames.some(module => canAccess(userRole, module));
}

/**
 * Get role object by ID
 * @param {string} roleId - Role ID
 * @returns {object|null} - Role object or null if not found
 */
export function getRoleById(roleId) {
  return defaultRoles.find(r => r.id === roleId) || null;
}

/**
 * Get role name by ID
 * @param {string} roleId - Role ID
 * @returns {string} - Role name or 'Unknown'
 */
export function getRoleName(roleId) {
  const role = getRoleById(roleId);
  return role ? role.name : 'Unknown';
}

/**
 * Check if a role is admin level (Owner or Manager)
 * @param {string} roleId - Role ID
 * @returns {boolean}
 */
export function isAdminRole(roleId) {
  return roleId === 'owner' || roleId === 'manager';
}

/**
 * Check if a role can manage users
 * @param {string} roleId - Role ID
 * @returns {boolean}
 */
export function canManageUsers(roleId) {
  return isAdminRole(roleId) || canAccess(roleId, 'settings');
}

/**
 * Check if a role can modify settings
 * @param {string} roleId - Role ID
 * @returns {boolean}
 */
export function canModifySettings(roleId) {
  return isAdminRole(roleId);
}

/**
 * Get all available roles
 * @returns {object[]} - Array of all role objects
 */
export function getAllRoles() {
  return defaultRoles;
}

/**
 * Count permissions for a role
 * @param {string} roleId - Role ID
 * @returns {number} - Number of permissions (returns Infinity for wildcard)
 */
export function countPermissions(roleId) {
  const permissions = getRolePermissions(roleId);
  if (permissions.includes('*')) return Infinity;
  return permissions.length;
}
