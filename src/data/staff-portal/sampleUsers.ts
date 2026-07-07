// Sample users for demo login (Phase 1 - Local authentication)
// In production, this will be replaced with API authentication

export interface SampleUser {
  id: string;
  name: string;
  email: string;
  password: string;
  role: 'housekeeping' | 'maintenance' | 'runner';
  department: string;
  employeeId: string;
  phone: string;
  shift: string;
  shiftStart: string;
  shiftEnd: string;
  hireDate: string;
  supervisor: string;
}

export const sampleUsers: SampleUser[] = [
  {
    id: 'stf-001',
    name: 'Maria Chen',
    email: 'maria@glimmora.com',
    password: '123456',
    role: 'housekeeping',
    department: 'Housekeeping',
    employeeId: 'HK-2024-001',
    phone: '(555) 123-4567',
    shift: 'Morning Shift',
    shiftStart: '07:00',
    shiftEnd: '15:00',
    hireDate: '2023-03-15',
    supervisor: 'Sarah Johnson'
  },
  {
    id: 'stf-002',
    name: 'John Williams',
    email: 'john@glimmora.com',
    password: '123456',
    role: 'maintenance',
    department: 'Maintenance',
    employeeId: 'MT-2024-002',
    phone: '(555) 234-5678',
    shift: 'Day Shift',
    shiftStart: '08:00',
    shiftEnd: '16:00',
    hireDate: '2022-08-20',
    supervisor: 'Mike Thompson'
  },
  {
    id: 'stf-003',
    name: 'Alex Thompson',
    email: 'alex@glimmora.com',
    password: '123456',
    role: 'runner',
    department: 'Runner Services',
    employeeId: 'RN-2024-003',
    phone: '(555) 345-6789',
    shift: 'Swing Shift',
    shiftStart: '14:00',
    shiftEnd: '22:00',
    hireDate: '2023-11-01',
    supervisor: 'David Kim'
  }
];

// Function to authenticate user (will be replaced with API call in production)
export const authenticateUser = (email: string, password: string) => {
  const user = sampleUsers.find(
    (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
  );

  if (user) {
    // Return user without password
    const { password: _, ...userWithoutPassword } = user;
    return { success: true, user: userWithoutPassword };
  }

  return { success: false, error: 'Invalid email or password' };
};

export default sampleUsers;




