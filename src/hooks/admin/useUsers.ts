/**
 * useUsers Hook
 * User management CRUD operations with localStorage persistence
 */

import { useState, useEffect, useCallback } from 'react';
import { loadUsers, saveUsers } from '@/utils/admin/settingsStorage';
import { defaultUsers } from '@/data/defaultUsers';
import {
  validateUserCreate,
  validateUserUpdate,
  sanitizeUserData,
  canDeleteUser,
  canDisableUser
} from '@/utils/admin/userValidation';

export function useUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load users from localStorage on mount
  useEffect(() => {
    const storedUsers = loadUsers();
    if (storedUsers && storedUsers.length > 0) {
      setUsers(storedUsers);
    } else {
      // Initialize with default users
      setUsers(defaultUsers);
      saveUsers(defaultUsers);
    }
    setLoading(false);
  }, []);

  // Save users to localStorage whenever they change
  useEffect(() => {
    if (!loading) {
      saveUsers(users);
    }
  }, [users, loading]);

  /**
   * Add a new user
   * @param {object} userData - { name, email, role }
   * @returns {object} - { success: boolean, user: object|null, errors: object }
   */
  const addUser = useCallback((userData) => {
    // Sanitize input
    const sanitized = sanitizeUserData(userData);

    // Validate
    const validation = validateUserCreate(sanitized, users);
    if (!validation.valid) {
      return {
        success: false,
        user: null,
        errors: validation.errors
      };
    }

    // Generate new user
    const newUser = {
      id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: sanitized.name,
      email: sanitized.email,
      role: sanitized.role,
      active: true,
      createdAt: new Date().toISOString(),
      lastLogin: null
    };

    setUsers(prevUsers => [...prevUsers, newUser]);

    return {
      success: true,
      user: newUser,
      errors: {}
    };
  }, [users]);

  /**
   * Update an existing user
   * @param {string} userId - User ID to update
   * @param {object} updates - Fields to update
   * @returns {object} - { success: boolean, user: object|null, errors: object }
   */
  const updateUser = useCallback((userId, updates) => {
    const existingUser = users.find(u => u.id === userId);
    if (!existingUser) {
      return {
        success: false,
        user: null,
        errors: { general: 'User not found' }
      };
    }

    // Merge with existing data
    const updatedData = {
      name: updates.name ?? existingUser.name,
      email: updates.email ?? existingUser.email,
      role: updates.role ?? existingUser.role,
      active: updates.active ?? existingUser.active
    };

    // Sanitize
    const sanitized = sanitizeUserData(updatedData);

    // Validate
    const validation = validateUserUpdate(sanitized, users, userId);
    if (!validation.valid) {
      return {
        success: false,
        user: null,
        errors: validation.errors
      };
    }

    // Update user
    const updatedUser = {
      ...existingUser,
      ...sanitized,
      updatedAt: new Date().toISOString()
    };

    setUsers(prevUsers =>
      prevUsers.map(user => user.id === userId ? updatedUser : user)
    );

    return {
      success: true,
      user: updatedUser,
      errors: {}
    };
  }, [users]);

  /**
   * Disable a user (soft delete)
   * @param {string} userId - User ID to disable
   * @returns {object} - { success: boolean, reason: string|null }
   */
  const disableUser = useCallback((userId) => {
    const check = canDisableUser(userId, users);
    if (!check.canDisable) {
      return {
        success: false,
        reason: check.reason
      };
    }

    setUsers(prevUsers =>
      prevUsers.map(user =>
        user.id === userId
          ? { ...user, active: false, disabledAt: new Date().toISOString() }
          : user
      )
    );

    return {
      success: true,
      reason: null
    };
  }, [users]);

  /**
   * Enable a disabled user
   * @param {string} userId - User ID to enable
   * @returns {object} - { success: boolean }
   */
  const enableUser = useCallback((userId) => {
    setUsers(prevUsers =>
      prevUsers.map(user =>
        user.id === userId
          ? { ...user, active: true, enabledAt: new Date().toISOString() }
          : user
      )
    );

    return { success: true };
  }, []);

  /**
   * Delete a user (hard delete)
   * @param {string} userId - User ID to delete
   * @returns {object} - { success: boolean, reason: string|null }
   */
  const deleteUser = useCallback((userId) => {
    const check = canDeleteUser(userId, users);
    if (!check.canDelete) {
      return {
        success: false,
        reason: check.reason
      };
    }

    setUsers(prevUsers => prevUsers.filter(user => user.id !== userId));

    return {
      success: true,
      reason: null
    };
  }, [users]);

  /**
   * Change user role
   * @param {string} userId - User ID
   * @param {string} newRole - New role ID
   * @returns {object} - { success: boolean }
   */
  const changeUserRole = useCallback((userId, newRole) => {
    return updateUser(userId, { role: newRole });
  }, [updateUser]);

  /**
   * Reset user password (dummy implementation)
   * @param {string} userId - User ID
   * @param {string} newPassword - New password
   * @returns {object} - { success: boolean }
   */
  const resetPassword = useCallback((userId) => {
    // This is a dummy implementation for frontend-only
    // In a real app, this would call an API endpoint
    const user = users.find(u => u.id === userId);
    if (!user) {
      return { success: false, reason: 'User not found' };
    }

    setUsers(prevUsers =>
      prevUsers.map(u =>
        u.id === userId
          ? { ...u, passwordResetAt: new Date().toISOString() }
          : u
      )
    );

    return {
      success: true,
      message: 'Password reset email sent (dummy)'
    };
  }, [users]);

  /**
   * Get user by ID
   * @param {string} userId - User ID
   * @returns {object|null} - User object or null
   */
  const getUserById = useCallback((userId) => {
    return users.find(u => u.id === userId) || null;
  }, [users]);

  /**
   * Get users by role
   * @param {string} roleId - Role ID
   * @returns {object[]} - Array of users with this role
   */
  const getUsersByRole = useCallback((roleId) => {
    return users.filter(u => u.role === roleId);
  }, [users]);

  /**
   * Get active users
   * @returns {object[]} - Array of active users
   */
  const getActiveUsers = useCallback(() => {
    return users.filter(u => u.active);
  }, [users]);

  /**
   * Search users by name or email
   * @param {string} query - Search query
   * @returns {object[]} - Matching users
   */
  const searchUsers = useCallback((query) => {
    if (!query || query.trim().length === 0) return users;

    const lowerQuery = query.toLowerCase();
    return users.filter(u =>
      u.name.toLowerCase().includes(lowerQuery) ||
      u.email.toLowerCase().includes(lowerQuery)
    );
  }, [users]);

  return {
    users,
    loading,
    addUser,
    updateUser,
    disableUser,
    enableUser,
    deleteUser,
    changeUserRole,
    resetPassword,
    getUserById,
    getUsersByRole,
    getActiveUsers,
    searchUsers
  };
}
