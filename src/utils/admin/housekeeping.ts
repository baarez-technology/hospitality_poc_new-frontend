/**
 * Housekeeping Utility Functions
 * Auto-assign algorithm, cleaning time calculations, KPI calculations, CSV export
 */

// Cleaning time estimates by room type (in minutes)
export const CLEANING_TIME_ESTIMATES = {
  Standard: 20,
  Premium: 25,
  Deluxe: 30,
  Suite: 45
};

// Priority modifiers (additional minutes)
export const PRIORITY_TIME_MODIFIER = {
  high: 10,
  medium: 5,
  low: 0
};

// Status configurations
export const HK_STATUS_CONFIG = {
  dirty: {
    label: 'Dirty',
    bgColor: 'bg-red-100',
    textColor: 'text-red-700',
    borderColor: 'border-red-200'
  },
  in_progress: {
    label: 'In Progress',
    bgColor: 'bg-[#CDB261]/20',
    textColor: 'text-[#CDB261]',
    borderColor: 'border-[#CDB261]/30'
  },
  clean: {
    label: 'Clean',
    bgColor: 'bg-[#5C9BA4]/15',
    textColor: 'text-[#5C9BA4]',
    borderColor: 'border-[#5C9BA4]/30'
  },
  inspected: {
    label: 'Inspected',
    bgColor: 'bg-[#4E5840]/15',
    textColor: 'text-[#4E5840]',
    borderColor: 'border-[#4E5840]/30'
  },
  out_of_service: {
    label: 'Out of Service',
    bgColor: 'bg-neutral-200',
    textColor: 'text-neutral-700',
    borderColor: 'border-neutral-300'
  },
  out_of_order: {
    label: 'Out of Order',
    bgColor: 'bg-rose-100',
    textColor: 'text-rose-700',
    borderColor: 'border-rose-200'
  },
  maintenance: {
    label: 'Maintenance',
    bgColor: 'bg-orange-100',
    textColor: 'text-orange-700',
    borderColor: 'border-orange-200'
  }
};

export const PRIORITY_CONFIG = {
  high: {
    label: 'High',
    bgColor: 'bg-red-600',
    textColor: 'text-white'
  },
  medium: {
    label: 'Medium',
    bgColor: 'bg-[#CDB261]',
    textColor: 'text-neutral-900'
  },
  low: {
    label: 'Low',
    bgColor: 'bg-neutral-200',
    textColor: 'text-neutral-900'
  }
};

/**
 * Calculate estimated cleaning time for a room
 */
export function calculateCleaningTime(room, staffEfficiency = 100) {
  const baseTime = CLEANING_TIME_ESTIMATES[room.type] || 25;
  const priorityModifier = PRIORITY_TIME_MODIFIER[room.priority] || 0;

  // Apply staff efficiency modifier (±10%)
  const efficiencyModifier = 1 - ((staffEfficiency - 100) / 1000);

  const totalTime = Math.round((baseTime + priorityModifier) * efficiencyModifier);
  return totalTime;
}

/**
 * Calculate estimated finish time
 */
export function calculateEstimatedFinish(startTime, roomType, priority, staffEfficiency = 100) {
  if (!startTime) return null;
  const cleaningTime = calculateCleaningTime({ type: roomType, priority }, staffEfficiency);
  const safe = typeof startTime === 'string' && !startTime.includes('T') ? startTime + 'T12:00:00' : startTime;
  const start = new Date(safe);
  if (isNaN(start.getTime())) return null;
  return new Date(start.getTime() + cleaningTime * 60 * 1000);
}

/**
 * Format time duration
 */
export function formatDuration(minutes) {
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}

/**
 * Calculate KPIs from rooms data
 */
export function calculateHKKPIs(rooms, staff) {
  const dirty = rooms.filter(r => r.status === 'dirty').length;
  const inProgress = rooms.filter(r => r.status === 'in_progress').length;
  const clean = rooms.filter(r => r.status === 'clean').length;
  const inspected = rooms.filter(r => r.status === 'inspected').length;
  const urgent = rooms.filter(r => r.priority === 'high' && r.status !== 'clean' && r.status !== 'inspected').length;
  const pendingInspection = rooms.filter(r => r.status === 'clean').length;

  // Calculate avg cleaning time from completed rooms
  const completedRooms = rooms.filter(r => r.cleaningStartedAt && r.cleaningCompletedAt);
  let avgCleaningTime = 0;
  if (completedRooms.length > 0) {
    let totalTime = 0;
    let validCount = 0;
    for (const room of completedRooms) {
      const start = new Date(room.cleaningStartedAt);
      const end = new Date(room.cleaningCompletedAt);
      if (isNaN(start.getTime()) || isNaN(end.getTime())) continue;
      const duration = (end - start) / (1000 * 60);
      if (duration <= 0 || duration > 480) continue;
      totalTime += duration;
      validCount++;
    }
    avgCleaningTime = validCount > 0 ? Math.round(totalTime / validCount) : 25;
  } else {
    avgCleaningTime = 25; // Default estimate
  }

  // Staff on shift
  const staffOnShift = staff ? staff.filter(s => s.shift === 'morning' || s.shift === 'evening').length : 0;

  return {
    dirty,
    inProgress,
    clean,
    inspected,
    avgCleaningTime,
    staffOnShift,
    urgent,
    pendingInspection
  };
}

/**
 * Auto-assign algorithm
 * Rules:
 * 1. Sort staff by availability + lowest workload
 * 2. Assign urgent → medium → low priority
 * 3. Cap max 10 rooms per staff
 * 4. Balance load evenly
 */
export function autoAssignRooms(rooms, staff) {
  const assignments = [];
  const MAX_ROOMS_PER_STAFF = 10;

  // Get unassigned dirty rooms sorted by priority
  const unassignedRooms = rooms
    .filter(r => !r.assignedTo && (r.status === 'dirty' || r.status === 'in_progress'))
    .sort((a, b) => {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      return (priorityOrder[a.priority] || 2) - (priorityOrder[b.priority] || 2);
    });

  if (unassignedRooms.length === 0) {
    return { assignments: [], summary: 'No unassigned rooms to assign.' };
  }

  // Create a map of staff with current workload
  const staffWorkload = staff.map(s => ({
    ...s,
    currentLoad: s.tasksAssigned || 0,
    newAssignments: []
  })).sort((a, b) => a.currentLoad - b.currentLoad);

  // Assign rooms
  for (const room of unassignedRooms) {
    // Find available staff with lowest workload and capacity
    const availableStaff = staffWorkload
      .filter(s => (s.currentLoad + s.newAssignments.length) < MAX_ROOMS_PER_STAFF)
      .sort((a, b) => (a.currentLoad + a.newAssignments.length) - (b.currentLoad + b.newAssignments.length));

    if (availableStaff.length === 0) {
      break; // No more capacity
    }

    // Prefer staff assigned to same floor if possible
    let selectedStaff = availableStaff.find(s => s.floors && s.floors.includes(room.floor));
    if (!selectedStaff) {
      selectedStaff = availableStaff[0];
    }

    selectedStaff.newAssignments.push(room.id);
    assignments.push({
      roomId: room.id,
      roomNumber: room.roomNumber,
      staffId: selectedStaff.id,
      staffName: selectedStaff.name,
      priority: room.priority
    });
  }

  // Generate summary
  const assignedCount = assignments.length;
  const staffUsed = new Set(assignments.map(a => a.staffId)).size;
  const urgentAssigned = assignments.filter(a => a.priority === 'high').length;

  const summary = `Assigned ${assignedCount} rooms to ${staffUsed} staff members. ${urgentAssigned} urgent rooms prioritized.`;

  return { assignments, summary };
}

/**
 * Export housekeeping data to CSV
 */
export function exportHKToCSV(rooms, staff, filename = 'housekeeping_export.csv') {
  if (!rooms || rooms.length === 0) {
    return { success: false, message: 'No data to export' };
  }

  const headers = [
    'Room',
    'Type',
    'Floor',
    'HK Status',
    'Assigned Staff',
    'Priority',
    'Start Time',
    'Estimated Finish',
    'Total Time (min)',
    'Notes'
  ];

  const getStaffName = (staffId) => {
    const staffMember = staff?.find(s => s.id === staffId);
    return staffMember ? staffMember.name : 'Unassigned';
  };

  const rows = rooms.map(room => {
    const estimatedTime = calculateCleaningTime(room);
    const startTime = room.cleaningStartedAt
      ? new Date(room.cleaningStartedAt).toLocaleString()
      : '-';
    const estimatedFinish = room.cleaningStartedAt
      ? calculateEstimatedFinish(room.cleaningStartedAt, room.type, room.priority).toLocaleString()
      : '-';

    return [
      room.roomNumber,
      room.type,
      room.floor,
      HK_STATUS_CONFIG[room.status]?.label || room.status,
      getStaffName(room.assignedTo),
      room.priority ? room.priority.charAt(0).toUpperCase() + room.priority.slice(1) : 'Low',
      startTime,
      estimatedFinish,
      estimatedTime,
      room.notes || ''
    ];
  });

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

  return { success: true, message: `Exported ${rooms.length} rooms to CSV` };
}

/**
 * Add note with timestamp
 */
export function addNoteWithTimestamp(existingNotes, newNote) {
  const timestamp = new Date().toLocaleString();
  const formattedNote = `[${timestamp}] ${newNote}`;

  if (existingNotes) {
    return `${existingNotes}\n${formattedNote}`;
  }
  return formattedNote;
}

/**
 * Parse notes into array of objects
 */
export function parseNotes(notesString) {
  if (!notesString) return [];

  return notesString.split('\n').map(note => {
    const match = note.match(/^\[(.+?)\] (.+)$/);
    if (match) {
      return { timestamp: match[1], content: match[2] };
    }
    return { timestamp: null, content: note };
  });
}

/**
 * Get staff performance metrics
 */
export function getStaffPerformanceMetrics(staff, rooms) {
  return staff.map(s => {
    const assignedRooms = rooms.filter(r => r.assignedTo === s.id);
    const completedRooms = assignedRooms.filter(r => r.status === 'clean' || r.status === 'inspected');

    // Calculate average cleaning time
    let avgTime = 0;
    const roomsWithTime = assignedRooms.filter(r => r.cleaningStartedAt && r.cleaningCompletedAt);
    if (roomsWithTime.length > 0) {
      const totalTime = roomsWithTime.reduce((sum, room) => {
        const start = new Date(room.cleaningStartedAt);
        const end = new Date(room.cleaningCompletedAt);
        return sum + (end - start) / (1000 * 60);
      }, 0);
      avgTime = Math.round(totalTime / roomsWithTime.length);
    }

    // Calculate delays (rooms taking longer than estimate)
    const delays = roomsWithTime.filter(room => {
      const estimate = calculateCleaningTime(room);
      const start = new Date(room.cleaningStartedAt);
      const end = new Date(room.cleaningCompletedAt);
      const actual = (end - start) / (1000 * 60);
      return actual > estimate * 1.2; // 20% buffer
    }).length;

    return {
      ...s,
      tasksToday: assignedRooms.length,
      roomsCleaned: completedRooms.length,
      avgCleaningTime: avgTime || 25,
      delays,
      rating: s.efficiency >= 90 ? 5 : s.efficiency >= 80 ? 4 : s.efficiency >= 70 ? 3 : 2
    };
  });
}

/**
 * Generate sparkline data for staff performance
 */
export function generateSparklineData(baseValue, days = 7) {
  const data = [];
  for (let i = 0; i < days; i++) {
    const variance = (Math.random() - 0.5) * 20;
    data.push(Math.max(0, Math.min(100, baseValue + variance)));
  }
  return data;
}
