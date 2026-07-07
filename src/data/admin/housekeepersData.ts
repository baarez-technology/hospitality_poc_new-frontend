/**
 * Housekeepers Data - 10 housekeeping staff members
 */

export const housekeepersData = [
  {
    id: 'HK-001',
    name: 'Emily Rodriguez',
    avatar: 'ER',
    tasksAssigned: 8,
    tasksCompleted: 6,
    efficiency: 95,
    shift: 'morning',
    floors: [2, 3]
  },
  {
    id: 'HK-002',
    name: 'Priya Patel',
    avatar: 'PP',
    tasksAssigned: 10,
    tasksCompleted: 8,
    efficiency: 92,
    shift: 'morning',
    floors: [4, 5]
  },
  {
    id: 'HK-003',
    name: 'James Wilson',
    avatar: 'JW',
    tasksAssigned: 6,
    tasksCompleted: 5,
    efficiency: 88,
    shift: 'morning',
    floors: [1]
  },
  {
    id: 'HK-004',
    name: 'Sophie Turner',
    avatar: 'ST',
    tasksAssigned: 9,
    tasksCompleted: 9,
    efficiency: 96,
    shift: 'morning',
    floors: [2]
  },
  {
    id: 'HK-005',
    name: 'Isabella Martinez',
    avatar: 'IM',
    tasksAssigned: 7,
    tasksCompleted: 6,
    efficiency: 90,
    shift: 'morning',
    floors: [4]
  },
  {
    id: 'HK-006',
    name: 'Lucas Brown',
    avatar: 'LB',
    tasksAssigned: 8,
    tasksCompleted: 7,
    efficiency: 87,
    shift: 'morning',
    floors: [5]
  },
  {
    id: 'HK-007',
    name: 'Maria Garcia',
    avatar: 'MG',
    tasksAssigned: 10,
    tasksCompleted: 9,
    efficiency: 93,
    shift: 'morning',
    floors: [1, 2, 3]
  },
  {
    id: 'HK-008',
    name: 'Thomas Anderson',
    avatar: 'TA',
    tasksAssigned: 5,
    tasksCompleted: 4,
    efficiency: 84,
    shift: 'evening',
    floors: [3]
  },
  {
    id: 'HK-009',
    name: 'Olivia Chen',
    avatar: 'OC',
    tasksAssigned: 7,
    tasksCompleted: 7,
    efficiency: 94,
    shift: 'evening',
    floors: [4, 5]
  },
  {
    id: 'HK-010',
    name: 'Daniel Park',
    avatar: 'DP',
    tasksAssigned: 6,
    tasksCompleted: 5,
    efficiency: 89,
    shift: 'evening',
    floors: [1, 2]
  }
];

export function getHousekeeperById(id) {
  return housekeepersData.find(hk => hk.id === id);
}

export function getHousekeepersByFloor(floor) {
  return housekeepersData.filter(hk => hk.floors.includes(floor));
}
