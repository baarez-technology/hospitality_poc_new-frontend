/**
 * Default Users
 * Initial user data for the system
 */

export const defaultUsers = [
  {
    id: '1',
    name: 'Sarah Johnson',
    email: 'sarah@glimmora.com',
    role: 'owner',
    active: true,
    avatar: null,
    createdAt: '2023-06-01T08:00:00Z',
    lastLogin: new Date().toISOString()
  },
  {
    id: '2',
    name: 'Michael Chen',
    email: 'michael@glimmora.com',
    role: 'manager',
    active: true,
    avatar: null,
    createdAt: '2023-07-15T10:00:00Z',
    lastLogin: new Date(Date.now() - 3600000).toISOString()
  },
  {
    id: '3',
    name: 'Emma Davis',
    email: 'emma@glimmora.com',
    role: 'front_desk',
    active: true,
    avatar: null,
    createdAt: '2023-08-20T12:00:00Z',
    lastLogin: new Date(Date.now() - 7200000).toISOString()
  },
  {
    id: '4',
    name: 'James Wilson',
    email: 'james@glimmora.com',
    role: 'housekeeping',
    active: true,
    avatar: null,
    createdAt: '2023-09-10T09:00:00Z',
    lastLogin: new Date(Date.now() - 10800000).toISOString()
  },
  {
    id: '5',
    name: 'Lisa Anderson',
    email: 'lisa@glimmora.com',
    role: 'finance',
    active: true,
    avatar: null,
    createdAt: '2023-10-05T11:00:00Z',
    lastLogin: new Date(Date.now() - 14400000).toISOString()
  }
];
