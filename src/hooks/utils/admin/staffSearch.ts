/**
 * Multi-field fuzzy search utility for staff
 * Searches across: name, role, department, phone, email
 */

export function searchStaff(staff, query) {
  if (!query || query.trim() === '') {
    return staff;
  }

  const searchTerm = query.toLowerCase().trim();

  return staff.filter((member) => {
    const name = member.name?.toLowerCase() || '';
    const role = member.role?.toLowerCase() || '';
    const department = member.department?.toLowerCase() || '';
    const phone = member.phone?.toLowerCase() || '';
    const email = member.email?.toLowerCase() || '';

    return (
      name.includes(searchTerm) ||
      role.includes(searchTerm) ||
      department.includes(searchTerm) ||
      phone.includes(searchTerm) ||
      email.includes(searchTerm)
    );
  });
}
