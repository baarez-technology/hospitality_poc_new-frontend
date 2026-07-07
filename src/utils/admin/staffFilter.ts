/**
 * Filter utilities for staff data
 */

/**
 * Filter staff by department (from tab selection)
 */
export function filterByDepartment(staff, department) {
  if (department === 'all') {
    return staff;
  }
  return staff.filter((member) => member.department === department);
}

/**
 * Apply multiple filters to staff data
 */
export function filterStaff(staff, filters) {
  let result = staff;

  // Role filter
  if (filters.role && filters.role !== 'all') {
    result = result.filter((member) => member.role === filters.role);
  }

  // Status filter
  if (filters.status && filters.status !== 'all') {
    result = result.filter((member) => member.status === filters.status);
  }

  // Shift filter
  if (filters.shift && filters.shift !== 'all') {
    result = result.filter((member) => member.shift === filters.shift);
  }

  return result;
}
