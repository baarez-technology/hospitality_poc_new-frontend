import type { User } from '@/api/types/auth.types';

export const mockUser: User = {
  id: '1',
  email: 'test@example.com',
  fullName: 'Test User',
  phone: '+1234567890',
  emailVerified: true,
  createdAt: new Date().toISOString(),
};

export const mockUnverifiedUser: User = {
  id: '2',
  email: 'unverified@example.com',
  fullName: 'Unverified User',
  emailVerified: false,
  createdAt: new Date().toISOString(),
};
