// Sorting utilities for Glimmora Admin Dashboard

/**
 * Sort data by a specific field and direction
 * @param {Array} data - Array of objects to sort
 * @param {string} field - Field name to sort by
 * @param {string} direction - 'asc' or 'desc'
 * @returns {Array} Sorted array
 */
export function sortData(data, field, direction = 'asc') {
  if (!data || data.length === 0) return data;
  if (!field) return data;

  const sorted = [...data].sort((a, b) => {
    let aValue = getNestedValue(a, field);
    let bValue = getNestedValue(b, field);

    // Handle null/undefined
    if (aValue == null && bValue == null) return 0;
    if (aValue == null) return 1;
    if (bValue == null) return -1;

    // Handle dates
    if (field === 'checkIn' || field === 'checkOut' || field === 'bookedOn') {
      aValue = new Date(aValue).getTime();
      bValue = new Date(bValue).getTime();
    }

    // Handle numbers
    if (field === 'nights' || field === 'amount' || field === 'guests') {
      aValue = Number(aValue);
      bValue = Number(bValue);
    }

    // Handle strings (case insensitive)
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      aValue = aValue.toLowerCase();
      bValue = bValue.toLowerCase();
    }

    // Compare values
    if (aValue < bValue) return direction === 'asc' ? -1 : 1;
    if (aValue > bValue) return direction === 'asc' ? 1 : -1;
    return 0;
  });

  return sorted;
}

/**
 * Get nested value from object by dot notation
 * @param {Object} obj - Object to extract value from
 * @param {string} path - Dot notation path (e.g., 'user.name')
 * @returns {any} Value at path
 */
function getNestedValue(obj, path) {
  return path.split('.').reduce((current, prop) => current?.[prop], obj);
}

/**
 * Toggle sort direction
 * @param {string} currentDirection - Current direction ('asc' or 'desc')
 * @returns {string} Toggled direction
 */
export function toggleSortDirection(currentDirection) {
  return currentDirection === 'asc' ? 'desc' : 'asc';
}

/**
 * Check if a field is sortable
 * @param {string} field - Field name
 * @param {Array} sortableFields - Array of sortable field names
 * @returns {boolean} True if sortable
 */
export function isSortable(field, sortableFields) {
  return sortableFields.includes(field);
}
