/**
 * Staff Utility Functions
 * Handles filtering, sorting, performance calculations, and staff management
 */

// Staff roles
export const STAFF_ROLES = [
  { value: 'front_desk', label: 'Front Desk' },
  { value: 'housekeeping', label: 'Housekeeping' },
  { value: 'maintenance', label: 'Maintenance' },
  { value: 'concierge', label: 'Concierge' },
  { value: 'security', label: 'Security' },
  { value: 'fnb', label: 'F&B' },
  { value: 'manager', label: 'Manager' },
];

// Departments
export const DEPARTMENTS = [
  { value: 'operations', label: 'Operations' },
  { value: 'housekeeping', label: 'Housekeeping' },
  { value: 'maintenance', label: 'Maintenance' },
  { value: 'guest_services', label: 'Guest Services' },
  { value: 'security', label: 'Security' },
  { value: 'food_beverage', label: 'Food & Beverage' },
  { value: 'management', label: 'Management' },
];

// Shifts
export const SHIFTS = [
  { value: 'morning', label: 'Morning', time: '6:00 AM - 2:00 PM' },
  { value: 'afternoon', label: 'Afternoon', time: '2:00 PM - 10:00 PM' },
  { value: 'night', label: 'Night', time: '10:00 PM - 6:00 AM' },
];

// Staff status configurations
export const STAFF_STATUS_CONFIG = {
  'on_duty': {
    label: 'On Duty',
    bgColor: 'bg-[#4E5840]/15',
    textColor: 'text-[#4E5840]',
  },
  'break': {
    label: 'Break',
    bgColor: 'bg-[#CDB261]/20',
    textColor: 'text-[#CDB261]',
  },
  'off': {
    label: 'Off',
    bgColor: 'bg-neutral-200',
    textColor: 'text-neutral-600',
  },
  'disabled': {
    label: 'Disabled',
    bgColor: 'bg-red-100',
    textColor: 'text-red-700',
  },
};

// Permissions list
export const PERMISSIONS = [
  { key: 'bookings', label: 'Bookings' },
  { key: 'guests', label: 'Guests' },
  { key: 'rooms', label: 'Rooms' },
  { key: 'staff', label: 'Staff' },
  { key: 'housekeeping', label: 'Housekeeping' },
  { key: 'maintenance', label: 'Maintenance' },
  { key: 'revenue_ai', label: 'Revenue AI' },
  { key: 'reputation_ai', label: 'Reputation AI' },
  { key: 'crm', label: 'CRM' },
  { key: 'settings', label: 'Settings' },
];

// Generate unique staff ID
export function generateStaffId() {
  return `STF-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
}

// Format date
export function formatDate(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

// Format time
export function formatTime(timeString) {
  if (!timeString) return '';
  const date = new Date(timeString);
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

// Calculate hours between two times
export function calculateHours(checkIn, checkOut) {
  if (!checkIn || !checkOut) return 0;
  const start = new Date(checkIn);
  const end = new Date(checkOut);
  const diff = (end - start) / (1000 * 60 * 60);
  return Math.max(0, Math.round(diff * 10) / 10);
}

// Calculate performance score
export function calculatePerformanceScore(staff) {
  const tasksCompletedToday = staff.tasksCompletedToday || 0;
  const punctualityScore = staff.punctualityScore || 80;
  const shiftCompletionRate = staff.shiftCompletionRate || 90;

  const score = Math.min(100, Math.round(
    (tasksCompletedToday * 8) +
    (punctualityScore * 0.5) +
    (shiftCompletionRate * 0.1)
  ));

  return Math.max(0, score);
}

// Filter staff by role
export function filterByRole(staff, role) {
  if (!role || role === 'all') return staff;
  return staff.filter(s => s.role === role);
}

// Filter staff by status
export function filterByStatus(staff, status) {
  if (!status || status === 'all') return staff;
  return staff.filter(s => s.status === status);
}

// Filter staff by department
export function filterByDepartment(staff, department) {
  if (!department || department === 'all') return staff;
  return staff.filter(s => s.department === department);
}

// Filter staff by shift
export function filterByShift(staff, shift) {
  if (!shift || shift === 'all') return staff;
  return staff.filter(s => s.shift === shift);
}

// Filter staff by performance range
export function filterByPerformance(staff, minScore, maxScore) {
  return staff.filter(s => {
    const score = s.performanceScore || 0;
    const min = minScore || 0;
    const max = maxScore || 100;
    return score >= min && score <= max;
  });
}

// Search staff
export function searchStaff(staff, query) {
  if (!query || query.trim() === '') return staff;
  const searchTerm = query.toLowerCase().trim();
  return staff.filter(s => {
    // Support both name formats (single 'name' field or firstName/lastName)
    const name = s.name
      ? s.name.toLowerCase()
      : `${s.firstName || ''} ${s.lastName || ''}`.toLowerCase();
    const phone = (s.phone || '').toLowerCase();
    const email = (s.email || '').toLowerCase();
    return name.includes(searchTerm) || phone.includes(searchTerm) || email.includes(searchTerm);
  });
}

// Sort staff
export function sortStaff(staff, sortKey, sortDirection = 'asc') {
  return [...staff].sort((a, b) => {
    let aVal, bVal;

    if (sortKey === 'name') {
      // Support both name formats (single 'name' field or firstName/lastName)
      aVal = a.name
        ? a.name.toLowerCase()
        : `${a.firstName || ''} ${a.lastName || ''}`.toLowerCase();
      bVal = b.name
        ? b.name.toLowerCase()
        : `${b.firstName || ''} ${b.lastName || ''}`.toLowerCase();
    } else if (sortKey === 'performanceScore') {
      aVal = a.performanceScore || 0;
      bVal = b.performanceScore || 0;
    } else {
      aVal = a[sortKey] || '';
      bVal = b[sortKey] || '';
    }

    if (typeof aVal === 'string') {
      aVal = (aVal || '').toLowerCase();
      bVal = (bVal || '').toLowerCase();
    }

    if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });
}

// Export staff to CSV
export function exportStaffToCSV(staff, filename = 'staff_export.csv') {
  if (!staff || staff.length === 0) {
    alert('No staff to export');
    return;
  }

  const headers = [
    'Name',
    'Role',
    'Department',
    'Phone',
    'Email',
    'Performance Score',
    'Total Tasks',
    'Status',
    'Shift',
  ];

  const rows = staff.map(s => [
    `${s.firstName} ${s.lastName}`,
    STAFF_ROLES.find(r => r.value === s.role)?.label || s.role,
    DEPARTMENTS.find(d => d.value === s.department)?.label || s.department,
    s.phone || '',
    s.email || '',
    s.performanceScore || 0,
    s.totalTasksCompleted || 0,
    STAFF_STATUS_CONFIG[s.status]?.label || s.status,
    SHIFTS.find(sh => sh.value === s.shift)?.label || s.shift,
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')),
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// Create new staff object
export function createStaffObject(formData) {
  return {
    id: generateStaffId(),
    firstName: formData.firstName,
    lastName: formData.lastName,
    email: formData.email,
    phone: formData.phone,
    role: formData.role || 'front_desk',
    department: formData.department || 'operations',
    joiningDate: formData.joiningDate || new Date().toISOString(),
    shift: formData.shift || 'morning',
    status: 'off',
    permissions: formData.permissions || ['bookings', 'guests'],
    notes: formData.notes || '',
    avatar: formData.avatar || null,
    performanceScore: 75,
    punctualityScore: 85,
    shiftCompletionRate: 90,
    tasksCompletedToday: 0,
    totalTasksCompleted: 0,
    currentTasks: [],
    attendance: [],
    taskHistory: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

// Update staff object
export function updateStaffObject(existingStaff, updates) {
  return {
    ...existingStaff,
    ...updates,
    updatedAt: new Date().toISOString(),
  };
}

// Record attendance check-in
export function recordCheckIn(staff) {
  const today = new Date().toISOString().split('T')[0];
  const checkInTime = new Date().toISOString();

  const existingAttendance = staff.attendance || [];
  const todayRecord = existingAttendance.find(a => a.date === today);

  if (todayRecord) {
    return {
      ...staff,
      attendance: existingAttendance.map(a =>
        a.date === today ? { ...a, checkIn: checkInTime } : a
      ),
      status: 'on_duty',
      updatedAt: new Date().toISOString(),
    };
  }

  return {
    ...staff,
    attendance: [
      ...existingAttendance,
      {
        date: today,
        checkIn: checkInTime,
        checkOut: null,
        totalHours: 0,
        notes: '',
      },
    ],
    status: 'on_duty',
    updatedAt: new Date().toISOString(),
  };
}

// Record attendance check-out
export function recordCheckOut(staff) {
  const today = new Date().toISOString().split('T')[0];
  const checkOutTime = new Date().toISOString();

  const existingAttendance = staff.attendance || [];

  return {
    ...staff,
    attendance: existingAttendance.map(a => {
      if (a.date === today && a.checkIn) {
        const hours = calculateHours(a.checkIn, checkOutTime);
        return { ...a, checkOut: checkOutTime, totalHours: hours };
      }
      return a;
    }),
    status: 'off',
    updatedAt: new Date().toISOString(),
  };
}

// Calculate punctuality score
export function calculatePunctualityScore(attendance) {
  if (!attendance || attendance.length === 0) return 85;

  let onTimeCount = 0;
  const scheduledStartHour = 6; // 6 AM for morning shift

  attendance.slice(-30).forEach(record => {
    if (record.checkIn) {
      const checkInHour = new Date(record.checkIn).getHours();
      if (checkInHour <= scheduledStartHour) {
        onTimeCount++;
      }
    }
  });

  const totalDays = Math.min(attendance.length, 30);
  return Math.round((onTimeCount / totalDays) * 100);
}

// Get staff statistics
export function getStaffStats(staff) {
  const total = staff.length;
  const onDuty = staff.filter(s => s.status === 'on_duty').length;
  const onBreak = staff.filter(s => s.status === 'break').length;
  const off = staff.filter(s => s.status === 'off').length;
  const disabled = staff.filter(s => s.status === 'disabled').length;

  const avgPerformance = staff.length > 0
    ? Math.round(staff.reduce((sum, s) => sum + (s.performanceScore || 0), 0) / staff.length)
    : 0;

  return {
    total,
    onDuty,
    onBreak,
    off,
    disabled,
    avgPerformance,
  };
}

// Get role label
export function getRoleLabel(roleValue) {
  return STAFF_ROLES.find(r => r.value === roleValue)?.label || roleValue;
}

// Get department label
export function getDepartmentLabel(deptValue) {
  return DEPARTMENTS.find(d => d.value === deptValue)?.label || deptValue;
}

// Get shift info
export function getShiftInfo(shiftValue) {
  return SHIFTS.find(s => s.value === shiftValue) || { label: shiftValue, time: '' };
}

// Validate staff data
export function validateStaff(formData) {
  const errors = {};

  if (!formData.firstName || formData.firstName.trim() === '') {
    errors.firstName = 'First name is required';
  }

  if (!formData.lastName || formData.lastName.trim() === '') {
    errors.lastName = 'Last name is required';
  }

  if (!formData.email || formData.email.trim() === '') {
    errors.email = 'Email is required';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
    errors.email = 'Invalid email format';
  }

  if (!formData.phone || formData.phone.trim() === '') {
    errors.phone = 'Phone is required';
  }

  if (!formData.role) {
    errors.role = 'Role is required';
  }

  if (!formData.department) {
    errors.department = 'Department is required';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

// Get last N attendance records
export function getLastAttendance(staff, count = 5) {
  const attendance = staff.attendance || [];
  return attendance.slice(-count).reverse();
}

// Get initials from name
export function getInitials(firstName, lastName) {
  const first = firstName?.[0] || '';
  const last = lastName?.[0] || '';
  return `${first}${last}`.toUpperCase();
}

// Generate performance trend data
export function getPerformanceTrend(staff) {
  const baseScore = staff.performanceScore || 75;
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  return days.map((day, i) => ({
    day,
    score: Math.max(50, Math.min(100, baseScore + Math.floor(Math.random() * 20) - 10)),
  }));
}

// Generate task completion trend data
export function getTaskCompletionTrend(staff) {
  const baseTasks = staff.totalTasksCompleted || 50;
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  return days.map((day, i) => ({
    day,
    completed: Math.max(0, Math.floor(baseTasks / 7) + Math.floor(Math.random() * 5) - 2),
  }));
}

// Generate punctuality data
export function getPunctualityData(staff) {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
  const baseScore = staff.punctualityScore || 85;

  return months.map(month => ({
    month,
    onTime: Math.max(70, Math.min(100, baseScore + Math.floor(Math.random() * 15) - 7)),
  }));
}
