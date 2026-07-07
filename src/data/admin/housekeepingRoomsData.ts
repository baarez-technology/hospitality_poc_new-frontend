import { getChecklistByRoomType } from './checklistTemplates';

/**
 * Housekeeping Rooms Data - 50 rooms across 5 floors
 */

const roomTypes = ['Standard', 'Premium', 'Deluxe', 'Suite'];
const statuses = ['clean', 'dirty', 'in_progress', 'out_of_service'];
const cleaningStatuses = ['not_started', 'in_progress', 'done'];
const priorities = ['low', 'medium', 'high'];

// Helper to generate realistic time since dirty
function getTimeSinceDirty(status) {
  if (status === 'clean') return 0;
  if (status === 'in_progress') return Math.floor(Math.random() * 120) + 30; // 30-150 min
  if (status === 'dirty') return Math.floor(Math.random() * 480) + 60; // 60-540 min
  return 0;
}

// Helper to determine priority based on time
function getPriority(timeSinceDirty) {
  if (timeSinceDirty > 240) return 'high';
  if (timeSinceDirty > 120) return 'medium';
  return 'low';
}

// Generate 50 rooms
export const housekeepingRoomsData = [
  // Floor 1 - Rooms 101-110
  {
    id: 'R-101',
    roomNumber: '101',
    type: 'Standard',
    floor: 1,
    status: 'clean',
    cleaningStatus: 'done',
    assignedTo: null,
    timeSinceDirtyMinutes: 0,
    priority: 'low',
    notes: '',
    checklist: getChecklistByRoomType('Standard').map(item => ({ ...item, completed: true })),
    lastCleaned: '2025-11-19 10:30 AM'
  },
  {
    id: 'R-102',
    roomNumber: '102',
    type: 'Standard',
    floor: 1,
    status: 'dirty',
    cleaningStatus: 'not_started',
    assignedTo: 'HK-003',
    timeSinceDirtyMinutes: 145,
    priority: 'medium',
    notes: 'Guest checked out at 11:00 AM',
    checklist: getChecklistByRoomType('Standard'),
    lastCleaned: '2025-11-18 02:00 PM'
  },
  {
    id: 'R-103',
    roomNumber: '103',
    type: 'Premium',
    floor: 1,
    status: 'in_progress',
    cleaningStatus: 'in_progress',
    assignedTo: 'HK-003',
    timeSinceDirtyMinutes: 85,
    priority: 'low',
    notes: 'VIP guest arriving at 3 PM',
    checklist: getChecklistByRoomType('Premium').map((item, idx) => ({ ...item, completed: idx < 5 })),
    lastCleaned: '2025-11-18 11:00 AM'
  },
  {
    id: 'R-104',
    roomNumber: '104',
    type: 'Standard',
    floor: 1,
    status: 'clean',
    cleaningStatus: 'done',
    assignedTo: null,
    timeSinceDirtyMinutes: 0,
    priority: 'low',
    notes: '',
    checklist: getChecklistByRoomType('Standard').map(item => ({ ...item, completed: true })),
    lastCleaned: '2025-11-19 09:15 AM'
  },
  {
    id: 'R-105',
    roomNumber: '105',
    type: 'Standard',
    floor: 1,
    status: 'dirty',
    cleaningStatus: 'not_started',
    assignedTo: 'HK-007',
    timeSinceDirtyMinutes: 320,
    priority: 'high',
    notes: 'High priority - late checkout',
    checklist: getChecklistByRoomType('Standard'),
    lastCleaned: '2025-11-18 08:00 AM'
  },
  {
    id: 'R-106',
    roomNumber: '106',
    type: 'Premium',
    floor: 1,
    status: 'clean',
    cleaningStatus: 'done',
    assignedTo: null,
    timeSinceDirtyMinutes: 0,
    priority: 'low',
    notes: '',
    checklist: getChecklistByRoomType('Premium').map(item => ({ ...item, completed: true })),
    lastCleaned: '2025-11-19 11:00 AM'
  },
  {
    id: 'R-107',
    roomNumber: '107',
    type: 'Standard',
    floor: 1,
    status: 'dirty',
    cleaningStatus: 'not_started',
    assignedTo: null,
    timeSinceDirtyMinutes: 95,
    priority: 'low',
    notes: '',
    checklist: getChecklistByRoomType('Standard'),
    lastCleaned: '2025-11-18 03:00 PM'
  },
  {
    id: 'R-108',
    roomNumber: '108',
    type: 'Standard',
    floor: 1,
    status: 'clean',
    cleaningStatus: 'done',
    assignedTo: null,
    timeSinceDirtyMinutes: 0,
    priority: 'low',
    notes: '',
    checklist: getChecklistByRoomType('Standard').map(item => ({ ...item, completed: true })),
    lastCleaned: '2025-11-19 10:00 AM'
  },
  {
    id: 'R-109',
    roomNumber: '109',
    type: 'Deluxe',
    floor: 1,
    status: 'dirty',
    cleaningStatus: 'not_started',
    assignedTo: 'HK-010',
    timeSinceDirtyMinutes: 210,
    priority: 'medium',
    notes: 'Deep cleaning requested',
    checklist: getChecklistByRoomType('Deluxe'),
    lastCleaned: '2025-11-18 01:00 PM'
  },
  {
    id: 'R-110',
    roomNumber: '110',
    type: 'Standard',
    floor: 1,
    status: 'clean',
    cleaningStatus: 'done',
    assignedTo: null,
    timeSinceDirtyMinutes: 0,
    priority: 'low',
    notes: '',
    checklist: getChecklistByRoomType('Standard').map(item => ({ ...item, completed: true })),
    lastCleaned: '2025-11-19 08:30 AM'
  },

  // Floor 2 - Rooms 201-210
  {
    id: 'R-201',
    roomNumber: '201',
    type: 'Premium',
    floor: 2,
    status: 'dirty',
    cleaningStatus: 'not_started',
    assignedTo: 'HK-001',
    timeSinceDirtyMinutes: 180,
    priority: 'medium',
    notes: '',
    checklist: getChecklistByRoomType('Premium'),
    lastCleaned: '2025-11-18 12:00 PM'
  },
  {
    id: 'R-202',
    roomNumber: '202',
    type: 'Premium',
    floor: 2,
    status: 'in_progress',
    cleaningStatus: 'in_progress',
    assignedTo: 'HK-001',
    timeSinceDirtyMinutes: 110,
    priority: 'medium',
    notes: '',
    checklist: getChecklistByRoomType('Premium').map((item, idx) => ({ ...item, completed: idx < 7 })),
    lastCleaned: '2025-11-18 02:00 PM'
  },
  {
    id: 'R-203',
    roomNumber: '203',
    type: 'Premium',
    floor: 2,
    status: 'clean',
    cleaningStatus: 'done',
    assignedTo: null,
    timeSinceDirtyMinutes: 0,
    priority: 'low',
    notes: '',
    checklist: getChecklistByRoomType('Premium').map(item => ({ ...item, completed: true })),
    lastCleaned: '2025-11-19 09:30 AM'
  },
  {
    id: 'R-204',
    roomNumber: '204',
    type: 'Deluxe',
    floor: 2,
    status: 'dirty',
    cleaningStatus: 'not_started',
    assignedTo: 'HK-004',
    timeSinceDirtyMinutes: 265,
    priority: 'high',
    notes: 'Stains on carpet reported',
    checklist: getChecklistByRoomType('Deluxe'),
    lastCleaned: '2025-11-18 10:00 AM'
  },
  {
    id: 'R-205',
    roomNumber: '205',
    type: 'Premium',
    floor: 2,
    status: 'clean',
    cleaningStatus: 'done',
    assignedTo: null,
    timeSinceDirtyMinutes: 0,
    priority: 'low',
    notes: '',
    checklist: getChecklistByRoomType('Premium').map(item => ({ ...item, completed: true })),
    lastCleaned: '2025-11-19 11:15 AM'
  },
  {
    id: 'R-206',
    roomNumber: '206',
    type: 'Premium',
    floor: 2,
    status: 'dirty',
    cleaningStatus: 'not_started',
    assignedTo: 'HK-007',
    timeSinceDirtyMinutes: 155,
    priority: 'medium',
    notes: '',
    checklist: getChecklistByRoomType('Premium'),
    lastCleaned: '2025-11-18 01:30 PM'
  },
  {
    id: 'R-207',
    roomNumber: '207',
    type: 'Premium',
    floor: 2,
    status: 'clean',
    cleaningStatus: 'done',
    assignedTo: null,
    timeSinceDirtyMinutes: 0,
    priority: 'low',
    notes: '',
    checklist: getChecklistByRoomType('Premium').map(item => ({ ...item, completed: true })),
    lastCleaned: '2025-11-19 10:45 AM'
  },
  {
    id: 'R-208',
    roomNumber: '208',
    type: 'Deluxe',
    floor: 2,
    status: 'in_progress',
    cleaningStatus: 'in_progress',
    assignedTo: 'HK-004',
    timeSinceDirtyMinutes: 95,
    priority: 'low',
    notes: '',
    checklist: getChecklistByRoomType('Deluxe').map((item, idx) => ({ ...item, completed: idx < 8 })),
    lastCleaned: '2025-11-18 03:30 PM'
  },
  {
    id: 'R-209',
    roomNumber: '209',
    type: 'Premium',
    floor: 2,
    status: 'dirty',
    cleaningStatus: 'not_started',
    assignedTo: null,
    timeSinceDirtyMinutes: 125,
    priority: 'medium',
    notes: '',
    checklist: getChecklistByRoomType('Premium'),
    lastCleaned: '2025-11-18 02:15 PM'
  },
  {
    id: 'R-210',
    roomNumber: '210',
    type: 'Premium',
    floor: 2,
    status: 'clean',
    cleaningStatus: 'done',
    assignedTo: null,
    timeSinceDirtyMinutes: 0,
    priority: 'low',
    notes: '',
    checklist: getChecklistByRoomType('Premium').map(item => ({ ...item, completed: true })),
    lastCleaned: '2025-11-19 09:00 AM'
  },

  // Floor 3 - Rooms 301-310
  {
    id: 'R-301',
    roomNumber: '301',
    type: 'Deluxe',
    floor: 3,
    status: 'clean',
    cleaningStatus: 'done',
    assignedTo: null,
    timeSinceDirtyMinutes: 0,
    priority: 'low',
    notes: '',
    checklist: getChecklistByRoomType('Deluxe').map(item => ({ ...item, completed: true })),
    lastCleaned: '2025-11-19 11:30 AM'
  },
  {
    id: 'R-302',
    roomNumber: '302',
    type: 'Deluxe',
    floor: 3,
    status: 'dirty',
    cleaningStatus: 'not_started',
    assignedTo: 'HK-001',
    timeSinceDirtyMinutes: 195,
    priority: 'medium',
    notes: '',
    checklist: getChecklistByRoomType('Deluxe'),
    lastCleaned: '2025-11-18 01:00 PM'
  },
  {
    id: 'R-303',
    roomNumber: '303',
    type: 'Deluxe',
    floor: 3,
    status: 'in_progress',
    cleaningStatus: 'in_progress',
    assignedTo: 'HK-007',
    timeSinceDirtyMinutes: 140,
    priority: 'medium',
    notes: '',
    checklist: getChecklistByRoomType('Deluxe').map((item, idx) => ({ ...item, completed: idx < 6 })),
    lastCleaned: '2025-11-18 01:45 PM'
  },
  {
    id: 'R-304',
    roomNumber: '304',
    type: 'Suite',
    floor: 3,
    status: 'dirty',
    cleaningStatus: 'not_started',
    assignedTo: 'HK-008',
    timeSinceDirtyMinutes: 310,
    priority: 'high',
    notes: 'Suite - priority cleaning',
    checklist: getChecklistByRoomType('Suite'),
    lastCleaned: '2025-11-18 09:00 AM'
  },
  {
    id: 'R-305',
    roomNumber: '305',
    type: 'Deluxe',
    floor: 3,
    status: 'clean',
    cleaningStatus: 'done',
    assignedTo: null,
    timeSinceDirtyMinutes: 0,
    priority: 'low',
    notes: '',
    checklist: getChecklistByRoomType('Deluxe').map(item => ({ ...item, completed: true })),
    lastCleaned: '2025-11-19 10:15 AM'
  },
  {
    id: 'R-306',
    roomNumber: '306',
    type: 'Deluxe',
    floor: 3,
    status: 'out_of_service',
    cleaningStatus: 'not_started',
    assignedTo: null,
    timeSinceDirtyMinutes: 0,
    priority: 'low',
    notes: 'Maintenance - AC repair in progress',
    checklist: getChecklistByRoomType('Deluxe'),
    lastCleaned: '2025-11-17 03:00 PM'
  },
  {
    id: 'R-307',
    roomNumber: '307',
    type: 'Deluxe',
    floor: 3,
    status: 'clean',
    cleaningStatus: 'done',
    assignedTo: null,
    timeSinceDirtyMinutes: 0,
    priority: 'low',
    notes: '',
    checklist: getChecklistByRoomType('Deluxe').map(item => ({ ...item, completed: true })),
    lastCleaned: '2025-11-19 08:45 AM'
  },
  {
    id: 'R-308',
    roomNumber: '308',
    type: 'Deluxe',
    floor: 3,
    status: 'dirty',
    cleaningStatus: 'not_started',
    assignedTo: null,
    timeSinceDirtyMinutes: 175,
    priority: 'medium',
    notes: '',
    checklist: getChecklistByRoomType('Deluxe'),
    lastCleaned: '2025-11-18 12:30 PM'
  },
  {
    id: 'R-309',
    roomNumber: '309',
    type: 'Suite',
    floor: 3,
    status: 'clean',
    cleaningStatus: 'done',
    assignedTo: null,
    timeSinceDirtyMinutes: 0,
    priority: 'low',
    notes: '',
    checklist: getChecklistByRoomType('Suite').map(item => ({ ...item, completed: true })),
    lastCleaned: '2025-11-19 11:45 AM'
  },
  {
    id: 'R-310',
    roomNumber: '310',
    type: 'Deluxe',
    floor: 3,
    status: 'in_progress',
    cleaningStatus: 'in_progress',
    assignedTo: 'HK-008',
    timeSinceDirtyMinutes: 105,
    priority: 'medium',
    notes: '',
    checklist: getChecklistByRoomType('Deluxe').map((item, idx) => ({ ...item, completed: idx < 9 })),
    lastCleaned: '2025-11-18 02:45 PM'
  },

  // Floor 4 - Rooms 401-410
  {
    id: 'R-401',
    roomNumber: '401',
    type: 'Suite',
    floor: 4,
    status: 'clean',
    cleaningStatus: 'done',
    assignedTo: null,
    timeSinceDirtyMinutes: 0,
    priority: 'low',
    notes: '',
    checklist: getChecklistByRoomType('Suite').map(item => ({ ...item, completed: true })),
    lastCleaned: '2025-11-19 10:00 AM'
  },
  {
    id: 'R-402',
    roomNumber: '402',
    type: 'Suite',
    floor: 4,
    status: 'dirty',
    cleaningStatus: 'not_started',
    assignedTo: 'HK-002',
    timeSinceDirtyMinutes: 285,
    priority: 'high',
    notes: 'Presidential suite - high priority',
    checklist: getChecklistByRoomType('Suite'),
    lastCleaned: '2025-11-18 10:30 AM'
  },
  {
    id: 'R-403',
    roomNumber: '403',
    type: 'Deluxe',
    floor: 4,
    status: 'in_progress',
    cleaningStatus: 'in_progress',
    assignedTo: 'HK-002',
    timeSinceDirtyMinutes: 130,
    priority: 'medium',
    notes: '',
    checklist: getChecklistByRoomType('Deluxe').map((item, idx) => ({ ...item, completed: idx < 10 })),
    lastCleaned: '2025-11-18 02:00 PM'
  },
  {
    id: 'R-404',
    roomNumber: '404',
    type: 'Deluxe',
    floor: 4,
    status: 'clean',
    cleaningStatus: 'done',
    assignedTo: null,
    timeSinceDirtyMinutes: 0,
    priority: 'low',
    notes: '',
    checklist: getChecklistByRoomType('Deluxe').map(item => ({ ...item, completed: true })),
    lastCleaned: '2025-11-19 09:30 AM'
  },
  {
    id: 'R-405',
    roomNumber: '405',
    type: 'Deluxe',
    floor: 4,
    status: 'dirty',
    cleaningStatus: 'not_started',
    assignedTo: 'HK-005',
    timeSinceDirtyMinutes: 220,
    priority: 'high',
    notes: 'Extra towels needed',
    checklist: getChecklistByRoomType('Deluxe'),
    lastCleaned: '2025-11-18 11:30 AM'
  },
  {
    id: 'R-406',
    roomNumber: '406',
    type: 'Deluxe',
    floor: 4,
    status: 'clean',
    cleaningStatus: 'done',
    assignedTo: null,
    timeSinceDirtyMinutes: 0,
    priority: 'low',
    notes: '',
    checklist: getChecklistByRoomType('Deluxe').map(item => ({ ...item, completed: true })),
    lastCleaned: '2025-11-19 11:00 AM'
  },
  {
    id: 'R-407',
    roomNumber: '407',
    type: 'Suite',
    floor: 4,
    status: 'dirty',
    cleaningStatus: 'not_started',
    assignedTo: 'HK-009',
    timeSinceDirtyMinutes: 165,
    priority: 'medium',
    notes: '',
    checklist: getChecklistByRoomType('Suite'),
    lastCleaned: '2025-11-18 01:15 PM'
  },
  {
    id: 'R-408',
    roomNumber: '408',
    type: 'Deluxe',
    floor: 4,
    status: 'clean',
    cleaningStatus: 'done',
    assignedTo: null,
    timeSinceDirtyMinutes: 0,
    priority: 'low',
    notes: '',
    checklist: getChecklistByRoomType('Deluxe').map(item => ({ ...item, completed: true })),
    lastCleaned: '2025-11-19 08:15 AM'
  },
  {
    id: 'R-409',
    roomNumber: '409',
    type: 'Deluxe',
    floor: 4,
    status: 'in_progress',
    cleaningStatus: 'in_progress',
    assignedTo: 'HK-005',
    timeSinceDirtyMinutes: 115,
    priority: 'medium',
    notes: '',
    checklist: getChecklistByRoomType('Deluxe').map((item, idx) => ({ ...item, completed: idx < 7 })),
    lastCleaned: '2025-11-18 02:30 PM'
  },
  {
    id: 'R-410',
    roomNumber: '410',
    type: 'Suite',
    floor: 4,
    status: 'clean',
    cleaningStatus: 'done',
    assignedTo: null,
    timeSinceDirtyMinutes: 0,
    priority: 'low',
    notes: '',
    checklist: getChecklistByRoomType('Suite').map(item => ({ ...item, completed: true })),
    lastCleaned: '2025-11-19 10:30 AM'
  },

  // Floor 5 - Rooms 501-510
  {
    id: 'R-501',
    roomNumber: '501',
    type: 'Suite',
    floor: 5,
    status: 'clean',
    cleaningStatus: 'done',
    assignedTo: null,
    timeSinceDirtyMinutes: 0,
    priority: 'low',
    notes: '',
    checklist: getChecklistByRoomType('Suite').map(item => ({ ...item, completed: true })),
    lastCleaned: '2025-11-19 11:15 AM'
  },
  {
    id: 'R-502',
    roomNumber: '502',
    type: 'Suite',
    floor: 5,
    status: 'dirty',
    cleaningStatus: 'not_started',
    assignedTo: 'HK-002',
    timeSinceDirtyMinutes: 245,
    priority: 'high',
    notes: 'Penthouse - VIP guest arriving',
    checklist: getChecklistByRoomType('Suite'),
    lastCleaned: '2025-11-18 11:00 AM'
  },
  {
    id: 'R-503',
    roomNumber: '503',
    type: 'Suite',
    floor: 5,
    status: 'in_progress',
    cleaningStatus: 'in_progress',
    assignedTo: 'HK-006',
    timeSinceDirtyMinutes: 160,
    priority: 'medium',
    notes: '',
    checklist: getChecklistByRoomType('Suite').map((item, idx) => ({ ...item, completed: idx < 11 })),
    lastCleaned: '2025-11-18 01:00 PM'
  },
  {
    id: 'R-504',
    roomNumber: '504',
    type: 'Suite',
    floor: 5,
    status: 'clean',
    cleaningStatus: 'done',
    assignedTo: null,
    timeSinceDirtyMinutes: 0,
    priority: 'low',
    notes: '',
    checklist: getChecklistByRoomType('Suite').map(item => ({ ...item, completed: true })),
    lastCleaned: '2025-11-19 09:45 AM'
  },
  {
    id: 'R-505',
    roomNumber: '505',
    type: 'Suite',
    floor: 5,
    status: 'out_of_service',
    cleaningStatus: 'not_started',
    assignedTo: null,
    timeSinceDirtyMinutes: 0,
    priority: 'low',
    notes: 'Deep cleaning and renovation',
    checklist: getChecklistByRoomType('Suite'),
    lastCleaned: '2025-11-16 02:00 PM'
  },
  {
    id: 'R-506',
    roomNumber: '506',
    type: 'Suite',
    floor: 5,
    status: 'dirty',
    cleaningStatus: 'not_started',
    assignedTo: 'HK-009',
    timeSinceDirtyMinutes: 190,
    priority: 'medium',
    notes: '',
    checklist: getChecklistByRoomType('Suite'),
    lastCleaned: '2025-11-18 12:15 PM'
  },
  {
    id: 'R-507',
    roomNumber: '507',
    type: 'Suite',
    floor: 5,
    status: 'clean',
    cleaningStatus: 'done',
    assignedTo: null,
    timeSinceDirtyMinutes: 0,
    priority: 'low',
    notes: '',
    checklist: getChecklistByRoomType('Suite').map(item => ({ ...item, completed: true })),
    lastCleaned: '2025-11-19 10:45 AM'
  },
  {
    id: 'R-508',
    roomNumber: '508',
    type: 'Suite',
    floor: 5,
    status: 'dirty',
    cleaningStatus: 'not_started',
    assignedTo: 'HK-006',
    timeSinceDirtyMinutes: 205,
    priority: 'medium',
    notes: '',
    checklist: getChecklistByRoomType('Suite'),
    lastCleaned: '2025-11-18 12:00 PM'
  },
  {
    id: 'R-509',
    roomNumber: '509',
    type: 'Suite',
    floor: 5,
    status: 'clean',
    cleaningStatus: 'done',
    assignedTo: null,
    timeSinceDirtyMinutes: 0,
    priority: 'low',
    notes: '',
    checklist: getChecklistByRoomType('Suite').map(item => ({ ...item, completed: true })),
    lastCleaned: '2025-11-19 09:00 AM'
  },
  {
    id: 'R-510',
    roomNumber: '510',
    type: 'Suite',
    floor: 5,
    status: 'in_progress',
    cleaningStatus: 'in_progress',
    assignedTo: 'HK-009',
    timeSinceDirtyMinutes: 145,
    priority: 'medium',
    notes: '',
    checklist: getChecklistByRoomType('Suite').map((item, idx) => ({ ...item, completed: idx < 12 })),
    lastCleaned: '2025-11-18 01:30 PM'
  }
];

// Utility functions
export function getRoomsByStatus(status) {
  return housekeepingRoomsData.filter(room => room.status === status);
}

export function getRoomsByFloor(floor) {
  return housekeepingRoomsData.filter(room => room.floor === floor);
}

export function getRoomsByStaff(staffId) {
  return housekeepingRoomsData.filter(room => room.assignedTo === staffId);
}

export function getUnassignedRooms() {
  return housekeepingRoomsData.filter(room => room.assignedTo === null && room.status === 'dirty');
}

export function getRoomCounts() {
  return {
    total: housekeepingRoomsData.length,
    clean: housekeepingRoomsData.filter(r => r.status === 'clean').length,
    dirty: housekeepingRoomsData.filter(r => r.status === 'dirty').length,
    in_progress: housekeepingRoomsData.filter(r => r.status === 'in_progress').length,
    out_of_service: housekeepingRoomsData.filter(r => r.status === 'out_of_service').length
  };
}
