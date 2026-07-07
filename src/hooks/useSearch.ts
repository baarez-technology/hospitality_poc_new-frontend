import { useState, useEffect, useMemo } from 'react';

export function useSearch(initialQuery = '') {
  const [query, setQuery] = useState(initialQuery);
  const [debouncedQuery, setDebouncedQuery] = useState(initialQuery);

  // Debounce search input (300ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  const searchResults = useMemo(() => {
    return {
      query: debouncedQuery,
      hasQuery: debouncedQuery.trim().length > 0,
    };
  }, [debouncedQuery]);

  const clearSearch = () => {
    setQuery('');
    setDebouncedQuery('');
  };

  return {
    query,
    debouncedQuery,
    setQuery,
    clearSearch,
    searchResults,
  };
}

// Filter function for search
export function filterBySearch(items, query, fields) {
  if (!query || query.trim().length === 0) {
    return items;
  }

  const lowerQuery = query.toLowerCase().trim();

  return items.filter((item) => {
    return fields.some((field) => {
      const value = getNestedValue(item, field);
      if (value === null || value === undefined) return false;
      return String(value).toLowerCase().includes(lowerQuery);
    });
  });
}

// Helper to get nested object values
function getNestedValue(obj, path) {
  return path.split('.').reduce((current, key) => current?.[key], obj);
}
