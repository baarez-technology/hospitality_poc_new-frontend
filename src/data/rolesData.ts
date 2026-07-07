/**
 * Roles Data
 * Default roles with descriptions and permissions
 */

export const defaultRoles = [
  {
    id: 'owner',
    name: 'Owner',
    description: 'Full system access with all permissions',
    color: '#8B5CF6',
    permissions: ['*'] // All permissions
  },
  {
    id: 'manager',
    name: 'Manager',
    description: 'Manage operations, staff, and reports',
    color: '#EC4899',
    permissions: [
      'dashboard',
      'bookings',
      'guests',
      'rooms',
      'housekeeping',
      'staff',
      'revenue',
      'reputation',
      'crm',
      'ai'
    ]
  },
  {
    id: 'front_desk',
    name: 'Front Desk',
    description: 'Handle check-ins, bookings, and guest services',
    color: '#3B82F6',
    permissions: [
      'dashboard',
      'bookings',
      'guests',
      'rooms',
      'ai'
    ]
  },
  {
    id: 'housekeeping',
    name: 'Housekeeping',
    description: 'Manage room cleaning and maintenance',
    color: '#10B981',
    permissions: [
      'rooms',
      'housekeeping'
    ]
  },
  {
    id: 'finance',
    name: 'Finance',
    description: 'Access to revenue and billing',
    color: '#F59E0B',
    permissions: [
      'dashboard',
      'revenue',
      'bookings'
    ]
  },
  {
    id: 'staff',
    name: 'Staff',
    description: 'Basic staff access',
    color: '#6B7280',
    permissions: [
      'dashboard'
    ]
  }
];

export const rolePermissions = {
  owner: ['*'],
  manager: ['dashboard', 'bookings', 'guests', 'rooms', 'housekeeping', 'staff', 'revenue', 'reputation', 'crm', 'ai'],
  front_desk: ['dashboard', 'bookings', 'guests', 'rooms', 'ai'],
  housekeeping: ['rooms', 'housekeeping'],
  finance: ['dashboard', 'revenue', 'bookings'],
  staff: ['dashboard']
};
