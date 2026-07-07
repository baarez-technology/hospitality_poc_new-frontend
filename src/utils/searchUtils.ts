// Search utilities for Glimmora Admin Dashboard

/**
 * Perform fuzzy search across multiple fields
 * @param {Array} data - Array of objects to search
 * @param {string} query - Search query string
 * @param {Array} fields - Array of field names to search in
 * @returns {Array} Filtered array
 */
export function fuzzySearch(data, query, fields) {
  if (!query || query.trim() === '') return data;
  if (!data || data.length === 0) return data;
  if (!fields || fields.length === 0) return data;

  const searchTerm = query.toLowerCase().trim();

  return data.filter((item) => {
    return fields.some((field) => {
      const value = getFieldValue(item, field);
      if (value == null) return false;

      const stringValue = String(value).toLowerCase();
      return stringValue.includes(searchTerm);
    });
  });
}

/**
 * Get field value from object (supports nested fields)
 * @param {Object} obj - Object to extract value from
 * @param {string} field - Field name (supports dot notation)
 * @returns {any} Field value
 */
function getFieldValue(obj, field) {
  return field.split('.').reduce((current, prop) => current?.[prop], obj);
}

/**
 * Highlight matching text in search results
 * @param {string} text - Original text
 * @param {string} query - Search query
 * @returns {Object} Object with parts array for highlighting
 */
export function highlightMatch(text, query) {
  if (!query || query.trim() === '') {
    return { parts: [{ text, highlight: false }] };
  }

  const lowerText = text.toLowerCase();
  const lowerQuery = query.toLowerCase().trim();
  const index = lowerText.indexOf(lowerQuery);

  if (index === -1) {
    return { parts: [{ text, highlight: false }] };
  }

  return {
    parts: [
      { text: text.slice(0, index), highlight: false },
      { text: text.slice(index, index + query.length), highlight: true },
      { text: text.slice(index + query.length), highlight: false },
    ],
  };
}

/**
 * Search with debounce support (returns the query, actual debouncing done in hook)
 * @param {string} query - Search query
 * @returns {string} Processed query
 */
export function processSearchQuery(query) {
  return query?.trim() || '';
}
