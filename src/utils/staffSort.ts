/**
 * Sorting utility for staff data
 * Supported fields: name, role, department, efficiency, tasksCompleted, rating
 */

export function sortStaff(staff, sortField, sortDirection) {
  if (!sortField) {
    return staff;
  }

  const sorted = [...staff].sort((a, b) => {
    let aVal, bVal;

    switch (sortField) {
      case 'name':
      case 'role':
      case 'department':
        aVal = (a[sortField] || '').toLowerCase();
        bVal = (b[sortField] || '').toLowerCase();
        return sortDirection === 'asc'
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);

      case 'efficiency':
      case 'rating':
        aVal = a[sortField] || 0;
        bVal = b[sortField] || 0;
        return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;

      case 'tasksCompleted':
        aVal = a.completedToday || 0;
        bVal = b.completedToday || 0;
        return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;

      default:
        return 0;
    }
  });

  return sorted;
}
