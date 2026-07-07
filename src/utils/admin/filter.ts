export function filterByDateRange(data, days) {
  const now = new Date();
  const cutoffDate = new Date(now);
  cutoffDate.setDate(cutoffDate.getDate() - days);

  return data.filter((item) => {
    const itemDate = new Date(item.date);
    return itemDate >= cutoffDate;
  });
}

export function filterByStatus(items, status) {
  if (!status || status === 'all') return items;
  return items.filter((item) => item.status === status);
}

export function filterByField(items, field, value) {
  if (!value) return items;
  return items.filter((item) => item[field] === value);
}

export function filterByMultipleFields(items, filters) {
  let filtered = items;

  Object.entries(filters).forEach(([field, value]) => {
    if (value) {
      filtered = filterByField(filtered, field, value);
    }
  });

  return filtered;
}

export function fuzzyMatch(str, query) {
  if (!query) return true;

  const lowerStr = str.toLowerCase();
  const lowerQuery = query.toLowerCase();

  let queryIndex = 0;
  for (let i = 0; i < lowerStr.length && queryIndex < lowerQuery.length; i++) {
    if (lowerStr[i] === lowerQuery[queryIndex]) {
      queryIndex++;
    }
  }

  return queryIndex === lowerQuery.length;
}
