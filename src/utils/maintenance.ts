/**
 * Maintenance Utility Functions
 * Work orders, preventive maintenance, technician assignment, inventory
 */

// Work Order Categories
export const WO_CATEGORIES = [
  { value: 'electrical', label: 'Electrical' },
  { value: 'plumbing', label: 'Plumbing' },
  { value: 'hvac', label: 'HVAC' },
  { value: 'carpentry', label: 'Carpentry' },
  { value: 'appliance', label: 'Appliance' },
  { value: 'general', label: 'General' },
  { value: 'other', label: 'Other' }
];

// Priority configurations
export const PRIORITY_CONFIG = {
  high: {
    label: 'High',
    bgColor: 'bg-red-600',
    textColor: 'text-white'
  },
  medium: {
    label: 'Medium',
    bgColor: 'bg-[#CDB261]/20',
    textColor: 'text-[#CDB261]'
  },
  low: {
    label: 'Low',
    bgColor: 'bg-neutral-200',
    textColor: 'text-neutral-700'
  }
};

// Status configurations
export const STATUS_CONFIG = {
  open: {
    label: 'Open',
    bgColor: 'bg-[#CDB261]/20',
    textColor: 'text-[#CDB261]'
  },
  in_progress: {
    label: 'In Progress',
    bgColor: 'bg-[#5C9BA4]/15',
    textColor: 'text-[#5C9BA4]'
  },
  completed: {
    label: 'Completed',
    bgColor: 'bg-[#4E5840]/15',
    textColor: 'text-[#4E5840]'
  },
  on_hold: {
    label: 'On Hold',
    bgColor: 'bg-neutral-200',
    textColor: 'text-neutral-700'
  }
};

// PM Frequency options
export const PM_FREQUENCY = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'quarterly', label: 'Quarterly' },
  { value: 'yearly', label: 'Yearly' }
];

// Inventory categories
export const INVENTORY_CATEGORIES = [
  { value: 'electrical', label: 'Electrical' },
  { value: 'plumbing', label: 'Plumbing' },
  { value: 'hvac', label: 'HVAC' },
  { value: 'hardware', label: 'Hardware' },
  { value: 'cleaning', label: 'Cleaning' },
  { value: 'other', label: 'Other' }
];

/**
 * Generate unique Work Order ID
 */
export function generateWOId() {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substr(2, 4).toUpperCase();
  return `WO-${timestamp}-${random}`;
}

/**
 * Generate unique PM ID
 */
export function generatePMId() {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substr(2, 4).toUpperCase();
  return `PM-${timestamp}-${random}`;
}

/**
 * Generate unique Inventory ID
 */
export function generateInventoryId() {
  const timestamp = Date.now().toString(36).toUpperCase();
  return `INV-${timestamp}`;
}

/**
 * Add activity log entry
 */
export function addActivityLog(existingLog = [], action, user = 'System') {
  const timestamp = new Date().toISOString();
  const newEntry = {
    id: Date.now(),
    timestamp,
    action,
    user
  };
  return [...existingLog, newEntry];
}

/**
 * Format date for display
 * Ensures date-only strings are not shifted by timezone conversion
 */
export function formatDate(dateString) {
  if (!dateString) return '-';
  try {
    // For date-only strings (YYYY-MM-DD), parse as UTC to avoid timezone shift
    let normalized = dateString;
    if (typeof normalized === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(normalized)) {
      normalized = normalized + 'T00:00:00Z';
    }
    return new Date(normalized).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      timeZone: 'UTC'
    });
  } catch {
    return '-';
  }
}

/**
 * Normalize a UTC datetime string from the backend so JS treats it as UTC.
 * Backend sends UTC datetimes without timezone suffix (e.g. "2025-02-15T14:30:00"
 * or "2025-02-15 14:30:00"). Without 'Z', JS Date() treats these as local time.
 */
export function normalizeUTCDate(dateString: string): Date | null {
  if (!dateString) return null;
  let s = String(dateString).trim();
  // Already has timezone info → parse as-is
  if (s.endsWith('Z') || /[+-]\d{2}:\d{2}$/.test(s)) {
    return new Date(s);
  }
  // Replace space separator with 'T' for ISO compliance (Python's default format)
  if (!s.includes('T') && /\d{4}-\d{2}-\d{2} \d{2}:\d{2}/.test(s)) {
    s = s.replace(' ', 'T');
  }
  // Datetime with 'T' but no timezone → append 'Z' to mark as UTC
  if (s.includes('T')) {
    return new Date(s + 'Z');
  }
  // Date-only string → treat as UTC midnight
  return new Date(s + 'T00:00:00Z');
}

/**
 * Format datetime for display
 * Ensures UTC timestamps from backend are correctly interpreted
 */
export function formatDateTime(dateString) {
  if (!dateString) return '-';
  try {
    const date = normalizeUTCDate(dateString);
    if (!date || isNaN(date.getTime())) return '-';
    // Date-only strings (no time component) → show date only
    const s = String(dateString).trim();
    const isDateOnly = !s.includes('T') && !/\d{4}-\d{2}-\d{2} \d{2}:\d{2}/.test(s);
    if (isDateOnly) {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    }
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return '-';
  }
}

/**
 * Calculate resolution time in hours
 */
export function calculateResolutionTime(createdAt, completedAt) {
  if (!createdAt || !completedAt) return null;
  const start = normalizeUTCDate(createdAt);
  const end = normalizeUTCDate(completedAt);
  if (!start || !end) return null;
  const diff = (end.getTime() - start.getTime()) / (1000 * 60 * 60); // hours
  // Ensure we don't return negative values (data integrity issue)
  return Math.max(0, Math.round(diff * 10) / 10);
}

/**
 * Calculate KPIs from work orders
 */
export function calculateMaintenanceKPIs(workOrders, technicians) {
  const total = workOrders.length;
  const open = workOrders.filter(wo => wo.status === 'open').length;
  const inProgress = workOrders.filter(wo => wo.status === 'in_progress').length;
  const completed = workOrders.filter(wo => wo.status === 'completed').length;
  const highPriority = workOrders.filter(wo => wo.priority === 'high' && wo.status !== 'completed').length;

  // Calculate average resolution time
  const completedWOs = workOrders.filter(wo => wo.status === 'completed' && wo.completedAt);
  let avgResolutionTime = 0;
  if (completedWOs.length > 0) {
    const totalTime = completedWOs.reduce((sum, wo) => {
      // Use reported_at (when the work order was created/reported) instead of createdAt
      const resTime = calculateResolutionTime(wo.reportedAt || wo.createdAt, wo.completedAt);
      return sum + (resTime || 0);
    }, 0);
    avgResolutionTime = Math.round(totalTime / completedWOs.length);
  }

  // Technicians on duty
  const techsOnDuty = technicians ? technicians.filter(t => t.status === 'active' || t.status === 'on_duty').length : 0;

  return {
    total,
    open,
    inProgress,
    completed,
    highPriority,
    avgResolutionTime,
    techsOnDuty,
  };
}

/**
 * Filter work orders
 */
export function filterWorkOrders(workOrders, filters) {
  let result = [...workOrders];

  if (filters.priority && filters.priority !== 'all') {
    result = result.filter(wo => wo.priority === filters.priority);
  }

  if (filters.status && filters.status !== 'all') {
    result = result.filter(wo => wo.status === filters.status);
  }

  if (filters.category && filters.category !== 'all') {
    result = result.filter(wo => wo.category === filters.category);
  }

  if (filters.technician && filters.technician !== 'all') {
    result = result.filter(wo => wo.assignedTo === filters.technician);
  }

  if (filters.roomType && filters.roomType !== 'all') {
    result = result.filter(wo => wo.roomType === filters.roomType);
  }

  if (filters.oooOnly) {
    result = result.filter(wo => wo.isOOO);
  }

  if (filters.dateFrom) {
    const fromDate = new Date(filters.dateFrom);
    result = result.filter(wo => new Date(wo.createdAt) >= fromDate);
  }

  if (filters.dateTo) {
    const toDate = new Date(filters.dateTo);
    result = result.filter(wo => new Date(wo.createdAt) <= toDate);
  }

  return result;
}

/**
 * Search work orders
 */
export function searchWorkOrders(workOrders, query) {
  if (!query || query.trim() === '') return workOrders;

  const searchTerm = query.toLowerCase().trim();
  return workOrders.filter(wo => {
    const woId = String(wo.id || '').toLowerCase();
    const room = String(wo.roomNumber || '').toLowerCase();
    const issue = String(wo.issue || '').toLowerCase();
    const description = String(wo.description || '').toLowerCase();
    const technician = String(wo.technicianName || '').toLowerCase();

    return woId.includes(searchTerm) ||
           room.includes(searchTerm) ||
           issue.includes(searchTerm) ||
           description.includes(searchTerm) ||
           technician.includes(searchTerm);
  });
}

/**
 * Sort work orders
 */
export function sortWorkOrders(workOrders, sortField, sortDirection = 'asc') {
  return [...workOrders].sort((a, b) => {
    let aVal, bVal;

    switch (sortField) {
      case 'id':
        aVal = a.id || '';
        bVal = b.id || '';
        break;
      case 'priority':
        const priorityOrder = { high: 0, medium: 1, low: 2 };
        aVal = priorityOrder[a.priority] || 2;
        bVal = priorityOrder[b.priority] || 2;
        break;
      case 'status':
        const statusOrder = { open: 0, in_progress: 1, on_hold: 2, completed: 3 };
        aVal = statusOrder[a.status] || 3;
        bVal = statusOrder[b.status] || 3;
        break;
      case 'room':
        aVal = a.roomNumber || '';
        bVal = b.roomNumber || '';
        break;
      case 'createdAt':
        aVal = new Date(a.createdAt || 0).getTime();
        bVal = new Date(b.createdAt || 0).getTime();
        break;
      default:
        aVal = a[sortField] || '';
        bVal = b[sortField] || '';
    }

    if (typeof aVal === 'string') {
      aVal = aVal.toLowerCase();
      bVal = (bVal || '').toLowerCase();
    }

    if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });
}

/**
 * Export work orders to CSV
 */
export function exportMaintenanceToCSV(workOrders, filename = 'maintenance_export.csv') {
  if (!workOrders || workOrders.length === 0) {
    return { success: false, message: 'No data to export' };
  }

  const headers = [
    'WO ID',
    'Room',
    'Issue',
    'Priority',
    'Category',
    'Status',
    'Technician',
    'Created On',
    'Updated On',
    'Completed On'
  ];

  const rows = workOrders.map(wo => [
    wo.id || '',
    wo.roomNumber || 'N/A',
    wo.issue || '',
    wo.priority ? wo.priority.charAt(0).toUpperCase() + wo.priority.slice(1) : '',
    WO_CATEGORIES.find(c => c.value === wo.category)?.label || wo.category || '',
    STATUS_CONFIG[wo.status]?.label || wo.status || '',
    wo.technicianName || 'Unassigned',
    formatDateTime(wo.createdAt),
    formatDateTime(wo.updatedAt),
    wo.completedAt ? formatDateTime(wo.completedAt) : '-'
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  const timestamp = new Date().toISOString().split('T')[0];

  link.setAttribute('href', url);
  link.setAttribute('download', `${filename.replace('.csv', '')}_${timestamp}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  return { success: true, message: `Exported ${workOrders.length} work orders to CSV` };
}

/**
 * Create new work order object
 */
export function createWorkOrder(data) {
  const now = new Date().toISOString();
  return {
    id: generateWOId(),
    roomNumber: data.roomNumber || null,
    roomId: data.roomId || null,
    roomType: data.roomType || null,
    category: data.category || 'general',
    priority: data.priority || 'medium',
    issue: data.issue || '',
    description: data.description || '',
    status: 'open',
    assignedTo: data.assignedTo || null,
    technicianName: data.technicianName || null,
    isOOO: data.isOOO || false,
    attachments: data.attachments || [],
    activityLog: addActivityLog([], 'Work order created'),
    createdAt: now,
    updatedAt: now,
    completedAt: null,
    estimatedCompletion: data.estimatedCompletion || null,
    notes: data.notes || ''
  };
}

/**
 * Create preventive maintenance task
 */
export function createPreventiveTask(data) {
  const now = new Date().toISOString();
  return {
    id: generatePMId(),
    equipment: data.equipment || '',
    roomNumber: data.roomNumber || null,
    roomId: data.roomId || null,
    category: data.category || 'general',
    frequency: data.frequency || 'monthly',
    nextDueDate: data.nextDueDate || null,
    lastCompleted: null,
    assignedTo: data.assignedTo || null,
    technicianName: data.technicianName || null,
    notes: data.notes || '',
    isActive: true,
    createdAt: now,
    updatedAt: now
  };
}

/**
 * Calculate next due date based on frequency
 * Uses local date arithmetic to avoid timezone-induced day shifts
 */
export function calculateNextDueDate(lastDate, frequency) {
  // Parse date string as local date components to avoid UTC conversion shift
  let date;
  if (lastDate && typeof lastDate === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(lastDate)) {
    const [y, m, d] = lastDate.split('-').map(Number);
    date = new Date(y, m - 1, d);
  } else {
    date = lastDate ? new Date(lastDate) : new Date();
  }

  switch (frequency) {
    case 'daily':
      date.setDate(date.getDate() + 1);
      break;
    case 'weekly':
      date.setDate(date.getDate() + 7);
      break;
    case 'monthly':
      date.setMonth(date.getMonth() + 1);
      break;
    case 'quarterly':
      date.setMonth(date.getMonth() + 3);
      break;
    case 'yearly':
      date.setFullYear(date.getFullYear() + 1);
      break;
    default:
      date.setMonth(date.getMonth() + 1);
  }

  // Return local date string without UTC conversion
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

/**
 * Get calendar events from work orders and PM tasks
 */
export function getCalendarEvents(workOrders, pmTasks, startDate, endDate) {
  const events = [];

  // Add work orders
  // Use local date formatting to avoid timezone shift
  const toLocalDateStr = (ds) => {
    if (!ds) return null;
    if (typeof ds === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(ds)) return ds;
    let normalized = ds;
    if (typeof normalized === 'string' && normalized.includes('T') && !normalized.endsWith('Z') && !normalized.match(/[+-]\d{2}:\d{2}$/)) {
      normalized = normalized + 'Z';
    }
    const d = new Date(normalized);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };

  workOrders.forEach(wo => {
    const createdDate = toLocalDateStr(wo.createdAt);
    events.push({
      id: wo.id,
      date: createdDate,
      type: 'workorder',
      status: wo.status,
      title: wo.issue,
      room: wo.roomNumber,
      priority: wo.priority
    });
  });

  // Add PM tasks
  pmTasks.forEach(pm => {
    if (pm.nextDueDate) {
      events.push({
        id: pm.id,
        date: pm.nextDueDate,
        type: 'preventive',
        title: pm.equipment,
        room: pm.roomNumber,
        frequency: pm.frequency
      });
    }
  });

  return events;
}
