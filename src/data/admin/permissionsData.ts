/**
 * Permissions Data
 * All available permissions and modules
 */

export const allPermissions = [
  {
    id: 'dashboard',
    name: 'Dashboard',
    description: 'View main dashboard and key metrics',
    category: 'core'
  },
  {
    id: 'bookings',
    name: 'Bookings',
    description: 'Manage reservations and bookings',
    category: 'core'
  },
  {
    id: 'guests',
    name: 'Guests (CRM)',
    description: 'Access guest profiles and CRM',
    category: 'core'
  },
  {
    id: 'rooms',
    name: 'Rooms',
    description: 'View and manage room inventory',
    category: 'core'
  },
  {
    id: 'housekeeping',
    name: 'Housekeeping',
    description: 'Manage cleaning and maintenance',
    category: 'operations'
  },
  {
    id: 'staff',
    name: 'Staff Management',
    description: 'Manage team and schedules',
    category: 'operations'
  },
  {
    id: 'revenue',
    name: 'Revenue & Analytics',
    description: 'View revenue reports and analytics',
    category: 'analytics'
  },
  {
    id: 'reputation',
    name: 'Reputation & Reviews',
    description: 'Manage reviews and reputation',
    category: 'analytics'
  },
  {
    id: 'crm',
    name: 'CRM',
    description: 'Advanced guest relationship management',
    category: 'analytics'
  },
  {
    id: 'ai',
    name: 'AI Assistant',
    description: 'Access Glimmora AI features',
    category: 'advanced'
  },
  {
    id: 'settings',
    name: 'Settings',
    description: 'Access system settings',
    category: 'admin'
  },
  {
    id: 'integrations',
    name: 'Integrations',
    description: 'Manage third-party integrations',
    category: 'admin'
  }
];

export const permissionCategories = {
  core: 'Core Features',
  operations: 'Operations',
  analytics: 'Analytics & Reports',
  advanced: 'Advanced Features',
  admin: 'Administration'
};
