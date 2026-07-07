// Filter utilities for Glimmora Admin Dashboard

/**
 * Filter data by multiple criteria
 * @param {Array} data - Array of objects to filter
 * @param {Object} filters - Filter criteria object
 * @returns {Array} Filtered array
 */
export function applyFilters(data, filters) {
  if (!data || data.length === 0) return data;
  if (!filters) return data;

  let result = [...data];

  // Filter by status
  if (filters.status && filters.status !== 'all') {
    result = result.filter((item) => item.status === filters.status);
  }

  // Filter by source
  if (filters.source && filters.source !== 'all') {
    result = result.filter((item) => item.source === filters.source);
  }

  // Filter by date range
  if (filters.dateFrom || filters.dateTo) {
    result = filterByDateRange(result, filters.dateFrom, filters.dateTo);
  }

  return result;
}

/**
 * Filter data by date range
 * @param {Array} data - Array of objects to filter
 * @param {string} startDate - Start date (YYYY-MM-DD)
 * @param {string} endDate - End date (YYYY-MM-DD)
 * @param {string} dateField - Field name to filter by (default: 'checkIn')
 * @returns {Array} Filtered array
 */
export function filterByDateRange(data, startDate, endDate, dateField = 'checkIn') {
  if (!startDate && !endDate) return data;

  const start = startDate ? new Date(startDate) : new Date('1900-01-01');
  const end = endDate ? new Date(endDate) : new Date('2100-12-31');

  return data.filter((item) => {
    const itemDate = new Date(item[dateField]);
    return itemDate >= start && itemDate <= end;
  });
}

/**
 * Filter data by single field value
 * @param {Array} data - Array of objects to filter
 * @param {string} field - Field name
 * @param {any} value - Value to filter by
 * @returns {Array} Filtered array
 */
export function filterByField(data, field, value) {
  if (!value || value === 'all') return data;
  return data.filter((item) => item[field] === value);
}

/**
 * Get unique values for a field (for filter options)
 * @param {Array} data - Array of objects
 * @param {string} field - Field name
 * @returns {Array} Array of unique values
 */
export function getUniqueValues(data, field) {
  const values = data.map((item) => item[field]).filter(Boolean);
  return [...new Set(values)].sort();
}
