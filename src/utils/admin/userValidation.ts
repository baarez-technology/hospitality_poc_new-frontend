/**
 * User Validation Utility
 * Validation logic for user management
 */

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} - True if valid email format
 */
export function isValidEmail(email: string): boolean {
  if (!email) return false;

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
}

/**
 * Check if email is unique in users array
 * @param {string} email - Email to check
 * @param {object[]} users - Array of existing users
 * @param {string} excludeUserId - User ID to exclude from check (for updates)
 * @returns {boolean} - True if email is unique
 */
export function isEmailUnique(email, users, excludeUserId = null) {
  if (!email) return false;

  const normalizedEmail = email.trim().toLowerCase();

  return !users.some(user => {
    // Skip the user being updated
    if (excludeUserId && user.id === excludeUserId) return false;

    return user.email.toLowerCase() === normalizedEmail;
  });
}

/**
 * Validate user data for creation
 * @param {object} userData - User data to validate
 * @param {object[]} existingUsers - Array of existing users
 * @returns {object} - { valid: boolean, errors: object }
 */
export function validateUserCreate(userData, existingUsers = []) {
  const errors = {};

  // Name validation
  if (!userData.name || userData.name.trim().length === 0) {
    errors.name = 'Name is required';
  } else if (userData.name.trim().length < 2) {
    errors.name = 'Name must be at least 2 characters';
  }

  // Email validation
  if (!userData.email || userData.email.trim().length === 0) {
    errors.email = 'Email is required';
  } else if (!isValidEmail(userData.email)) {
    errors.email = 'Invalid email format';
  } else if (!isEmailUnique(userData.email, existingUsers)) {
    errors.email = 'Email already exists';
  }

  // Role validation
  if (!userData.role || userData.role.trim().length === 0) {
    errors.role = 'Role is required';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors
  };
}

/**
 * Validate user data for update
 * @param {object} userData - User data to validate
 * @param {object[]} existingUsers - Array of existing users
 * @param {string} userId - ID of user being updated
 * @returns {object} - { valid: boolean, errors: object }
 */
export function validateUserUpdate(userData, existingUsers = [], userId = null) {
  const errors = {};

  // Name validation
  if (!userData.name || userData.name.trim().length === 0) {
    errors.name = 'Name is required';
  } else if (userData.name.trim().length < 2) {
    errors.name = 'Name must be at least 2 characters';
  }

  // Email validation
  if (!userData.email || userData.email.trim().length === 0) {
    errors.email = 'Email is required';
  } else if (!isValidEmail(userData.email)) {
    errors.email = 'Invalid email format';
  } else if (!isEmailUnique(userData.email, existingUsers, userId)) {
    errors.email = 'Email already exists';
  }

  // Role validation
  if (!userData.role || userData.role.trim().length === 0) {
    errors.role = 'Role is required';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors
  };
}

/**
 * Sanitize user input
 * @param {object} userData - Raw user data
 * @returns {object} - Sanitized user data
 */
export function sanitizeUserData(userData) {
  return {
    name: userData.name?.trim() || '',
    email: userData.email?.trim().toLowerCase() || '',
    role: userData.role?.trim() || '',
    active: typeof userData.active === 'boolean' ? userData.active : true
  };
}

/**
 * Validate name format
 * @param {string} name - Name to validate
 * @returns {object} - { valid: boolean, error: string|null }
 */
export function validateName(name) {
  if (!name || name.trim().length === 0) {
    return { valid: false, error: 'Name is required' };
  }

  if (name.trim().length < 2) {
    return { valid: false, error: 'Name must be at least 2 characters' };
  }

  if (name.trim().length > 100) {
    return { valid: false, error: 'Name must be less than 100 characters' };
  }

  return { valid: true, error: null };
}

/**
 * Validate email in real-time
 * @param {string} email - Email to validate
 * @returns {object} - { valid: boolean, error: string|null }
 */
export function validateEmail(email) {
  if (!email || email.trim().length === 0) {
    return { valid: false, error: 'Email is required' };
  }

  if (!isValidEmail(email)) {
    return { valid: false, error: 'Invalid email format' };
  }

  return { valid: true, error: null };
}

/**
 * Validate role selection
 * @param {string} role - Role to validate
 * @param {string[]} availableRoles - Array of valid role IDs
 * @returns {object} - { valid: boolean, error: string|null }
 */
export function validateRole(role, availableRoles = []) {
  if (!role || role.trim().length === 0) {
    return { valid: false, error: 'Role is required' };
  }

  if (availableRoles.length > 0 && !availableRoles.includes(role)) {
    return { valid: false, error: 'Invalid role selected' };
  }

  return { valid: true, error: null };
}

/**
 * Check if user can be deleted
 * @param {string} userId - User ID to check
 * @param {object[]} users - Array of all users
 * @returns {object} - { canDelete: boolean, reason: string|null }
 */
export function canDeleteUser(userId, users) {
  const user = users.find(u => u.id === userId);

  if (!user) {
    return { canDelete: false, reason: 'User not found' };
  }

  // Don't allow deleting the only owner
  if (user.role === 'owner') {
    const ownerCount = users.filter(u => u.role === 'owner' && u.active).length;
    if (ownerCount <= 1) {
      return { canDelete: false, reason: 'Cannot delete the only active owner' };
    }
  }

  return { canDelete: true, reason: null };
}

/**
 * Check if user can be disabled
 * @param {string} userId - User ID to check
 * @param {object[]} users - Array of all users
 * @returns {object} - { canDisable: boolean, reason: string|null }
 */
export function canDisableUser(userId, users) {
  const user = users.find(u => u.id === userId);

  if (!user) {
    return { canDisable: false, reason: 'User not found' };
  }

  if (!user.active) {
    return { canDisable: false, reason: 'User is already disabled' };
  }

  // Don't allow disabling the only active owner
  if (user.role === 'owner') {
    const activeOwnerCount = users.filter(u => u.role === 'owner' && u.active).length;
    if (activeOwnerCount <= 1) {
      return { canDisable: false, reason: 'Cannot disable the only active owner' };
    }
  }

  return { canDisable: true, reason: null };
}

/**
 * Validate password (for password reset feature)
 * @param {string} password - Password to validate
 * @returns {object} - { valid: boolean, errors: string[] }
 */
export function validatePassword(password) {
  const errors = [];

  if (!password || password.length === 0) {
    errors.push('Password is required');
    return { valid: false, errors };
  }

  if (password.length < 8) {
    errors.push('Password must be at least 8 characters');
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }

  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Generate validation summary
 * @param {object} errors - Errors object from validation
 * @returns {string} - Human-readable error message
 */
export function getValidationSummary(errors) {
  const errorMessages = Object.values(errors).filter(Boolean);

  if (errorMessages.length === 0) return '';
  if (errorMessages.length === 1) return errorMessages[0];

  return `${errorMessages.length} validation errors: ${errorMessages.join(', ')}`;
}

/**
 * Check if email domain is allowed (optional feature)
 * @param {string} email - Email to check
 * @param {string[]} allowedDomains - Array of allowed domains
 * @returns {boolean} - True if domain is allowed
 */
export function isEmailDomainAllowed(email, allowedDomains = []) {
  if (!email || allowedDomains.length === 0) return true;

  const domain = email.split('@')[1]?.toLowerCase();
  return allowedDomains.includes(domain);
}
