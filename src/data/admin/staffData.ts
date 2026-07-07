/**
 * Staff Data - 30 complete staff members with comprehensive details
 * Includes schedule, leave history, performance metrics, and AI insights
 */

export const staffData = [
  {
    id: 'S-001',
    name: 'Sarah Johnson',
    role: 'Front Desk Manager',
    status: 'active',
    department: 'frontdesk',
    phone: '+1 (555) 123-4567',
    email: 'sarah.johnson@glimmora.com',
    avatar: 'SJ',
    tasksToday: 12,
    completedToday: 10,
    efficiency: 95,
    rating: 4.8,
    shift: 'morning',
    floorAssignment: null,
    joinDate: '2023-01-15',
    performance: {
      tasksCompleted: 245,
      avgResponseTime: '2.5 min',
      customerRating: 4.8,
      punctuality: 98
    },
    schedule: [
      { date: '2025-11-20', shift: 'morning' },
      { date: '2025-11-21', shift: 'morning' },
      { date: '2025-11-22', shift: 'morning' },
      { date: '2025-11-23', shift: 'morning' },
      { date: '2025-11-24', shift: 'morning' }
    ],
    leaveHistory: [],
    aiInsights: [
      'Top performer this month',
      'Excellent customer service ratings',
      'Recommended for team lead position'
    ]
  },
  {
    id: 'S-002',
    name: 'Michael Chen',
    role: 'Receptionist',
    status: 'active',
    department: 'frontdesk',
    phone: '+1 (555) 234-5678',
    email: 'michael.chen@glimmora.com',
    avatar: 'MC',
    tasksToday: 8,
    completedToday: 7,
    efficiency: 88,
    rating: 4.5,
    shift: 'evening',
    floorAssignment: null,
    joinDate: '2023-03-22',
    performance: {
      tasksCompleted: 189,
      avgResponseTime: '3.1 min',
      customerRating: 4.5,
      punctuality: 94
    },
    schedule: [
      { date: '2025-11-20', shift: 'evening' },
      { date: '2025-11-21', shift: 'evening' },
      { date: '2025-11-22', shift: 'evening' }
    ],
    leaveHistory: [
      { startDate: '2025-10-15', endDate: '2025-10-17', type: 'paid', notes: 'Family vacation' }
    ],
    aiInsights: [
      'Consistent performance',
      'Good with guest interactions',
      'Punctual and reliable'
    ]
  },
  {
    id: 'S-003',
    name: 'Emily Rodriguez',
    role: 'Housekeeping Supervisor',
    status: 'active',
    department: 'housekeeping',
    phone: '+1 (555) 345-6789',
    email: 'emily.rodriguez@glimmora.com',
    avatar: 'ER',
    tasksToday: 15,
    completedToday: 15,
    efficiency: 100,
    rating: 4.9,
    shift: 'morning',
    floorAssignment: [2, 3],
    joinDate: '2022-11-08',
    performance: {
      tasksCompleted: 312,
      avgResponseTime: '1.8 min',
      customerRating: 4.9,
      punctuality: 99
    },
    schedule: [
      { date: '2025-11-20', shift: 'morning' },
      { date: '2025-11-21', shift: 'morning' },
      { date: '2025-11-22', shift: 'morning' },
      { date: '2025-11-23', shift: 'morning' }
    ],
    leaveHistory: [],
    aiInsights: [
      'Outstanding efficiency',
      'Perfect attendance record',
      'Excellent team leadership'
    ]
  },
  {
    id: 'S-004',
    name: 'James Wilson',
    role: 'Room Attendant',
    status: 'sick',
    department: 'housekeeping',
    phone: '+1 (555) 456-7890',
    email: 'james.wilson@glimmora.com',
    avatar: 'JW',
    tasksToday: 10,
    completedToday: 0,
    efficiency: 85,
    rating: 4.3,
    shift: 'morning',
    floorAssignment: [1],
    joinDate: '2023-05-12',
    performance: {
      tasksCompleted: 178,
      avgResponseTime: '3.5 min',
      customerRating: 4.3,
      punctuality: 92
    },
    schedule: [],
    leaveHistory: [
      { startDate: '2025-11-19', endDate: '2025-11-21', type: 'sick', notes: 'Flu symptoms' }
    ],
    aiInsights: [
      'Reliable worker',
      'Good attention to detail',
      'Currently on sick leave'
    ]
  },
  {
    id: 'S-005',
    name: 'Priya Patel',
    role: 'Room Attendant',
    status: 'active',
    department: 'housekeeping',
    phone: '+1 (555) 567-8901',
    email: 'priya.patel@glimmora.com',
    avatar: 'PP',
    tasksToday: 12,
    completedToday: 10,
    efficiency: 90,
    rating: 4.6,
    shift: 'morning',
    floorAssignment: [4, 5],
    joinDate: '2023-02-14',
    performance: {
      tasksCompleted: 225,
      avgResponseTime: '2.8 min',
      customerRating: 4.6,
      punctuality: 96
    },
    schedule: [
      { date: '2025-11-20', shift: 'morning' },
      { date: '2025-11-21', shift: 'morning' },
      { date: '2025-11-22', shift: 'morning' },
      { date: '2025-11-23', shift: 'morning' },
      { date: '2025-11-24', shift: 'morning' }
    ],
    leaveHistory: [],
    aiInsights: [
      'High efficiency rating',
      'Positive guest feedback',
      'Thorough cleaning standards'
    ]
  },
  {
    id: 'S-006',
    name: 'David Martinez',
    role: 'General Manager',
    status: 'active',
    department: 'management',
    phone: '+1 (555) 678-9012',
    email: 'david.martinez@glimmora.com',
    avatar: 'DM',
    tasksToday: 6,
    completedToday: 5,
    efficiency: 92,
    rating: 4.7,
    shift: 'morning',
    floorAssignment: null,
    joinDate: '2021-06-01',
    performance: {
      tasksCompleted: 425,
      avgResponseTime: '4.2 min',
      customerRating: 4.7,
      punctuality: 97
    },
    schedule: [
      { date: '2025-11-20', shift: 'morning' },
      { date: '2025-11-21', shift: 'morning' },
      { date: '2025-11-22', shift: 'morning' },
      { date: '2025-11-23', shift: 'morning' }
    ],
    leaveHistory: [],
    aiInsights: [
      'Strategic leader',
      'Strong operational oversight',
      'Excellent staff management'
    ]
  },
  {
    id: 'S-007',
    name: 'Lisa Thompson',
    role: 'Assistant Manager',
    status: 'leave',
    department: 'management',
    phone: '+1 (555) 789-0123',
    email: 'lisa.thompson@glimmora.com',
    avatar: 'LT',
    tasksToday: 5,
    completedToday: 0,
    efficiency: 89,
    rating: 4.5,
    shift: 'morning',
    floorAssignment: null,
    joinDate: '2022-04-10',
    performance: {
      tasksCompleted: 298,
      avgResponseTime: '3.8 min',
      customerRating: 4.5,
      punctuality: 95
    },
    schedule: [],
    leaveHistory: [
      { startDate: '2025-11-18', endDate: '2025-11-25', type: 'paid', notes: 'Annual vacation' }
    ],
    aiInsights: [
      'Strong problem solver',
      'Good at conflict resolution',
      'Currently on vacation'
    ]
  },
  {
    id: 'S-008',
    name: 'Robert Kim',
    role: 'Maintenance Technician',
    status: 'active',
    department: 'maintenance',
    phone: '+1 (555) 890-1234',
    email: 'robert.kim@glimmora.com',
    avatar: 'RK',
    tasksToday: 9,
    completedToday: 7,
    efficiency: 87,
    rating: 4.4,
    shift: 'morning',
    floorAssignment: [1, 2, 3, 4, 5],
    joinDate: '2022-09-20',
    performance: {
      tasksCompleted: 267,
      avgResponseTime: '5.2 min',
      customerRating: 4.4,
      punctuality: 93
    },
    schedule: [
      { date: '2025-11-20', shift: 'morning' },
      { date: '2025-11-21', shift: 'morning' },
      { date: '2025-11-22', shift: 'morning' }
    ],
    leaveHistory: [],
    aiInsights: [
      'Skilled technician',
      'Quick response times',
      'Handles complex repairs well'
    ]
  },
  {
    id: 'S-009',
    name: 'Amanda White',
    role: 'Maintenance Assistant',
    status: 'active',
    department: 'maintenance',
    phone: '+1 (555) 901-2345',
    email: 'amanda.white@glimmora.com',
    avatar: 'AW',
    tasksToday: 7,
    completedToday: 6,
    efficiency: 84,
    rating: 4.2,
    shift: 'evening',
    floorAssignment: [1, 2],
    joinDate: '2023-07-05',
    performance: {
      tasksCompleted: 145,
      avgResponseTime: '6.1 min',
      customerRating: 4.2,
      punctuality: 91
    },
    schedule: [
      { date: '2025-11-20', shift: 'evening' },
      { date: '2025-11-21', shift: 'evening' },
      { date: '2025-11-22', shift: 'evening' },
      { date: '2025-11-23', shift: 'evening' }
    ],
    leaveHistory: [],
    aiInsights: [
      'Learning quickly',
      'Good team player',
      'Improving efficiency'
    ]
  },
  {
    id: 'S-010',
    name: 'Carlos Ramirez',
    role: 'Night Auditor',
    status: 'active',
    department: 'frontdesk',
    phone: '+1 (555) 012-3456',
    email: 'carlos.ramirez@glimmora.com',
    avatar: 'CR',
    tasksToday: 6,
    completedToday: 6,
    efficiency: 93,
    rating: 4.6,
    shift: 'night',
    floorAssignment: null,
    joinDate: '2023-01-30',
    performance: {
      tasksCompleted: 198,
      avgResponseTime: '2.9 min',
      customerRating: 4.6,
      punctuality: 98
    },
    schedule: [
      { date: '2025-11-20', shift: 'night' },
      { date: '2025-11-21', shift: 'night' },
      { date: '2025-11-22', shift: 'night' },
      { date: '2025-11-23', shift: 'night' }
    ],
    leaveHistory: [],
    aiInsights: [
      'Excellent night shift performance',
      'Detail-oriented auditing',
      'Reliable overnight coverage'
    ]
  },
  {
    id: 'S-011',
    name: 'Jessica Brown',
    role: 'Concierge',
    status: 'active',
    department: 'frontdesk',
    phone: '+1 (555) 123-4568',
    email: 'jessica.brown@glimmora.com',
    avatar: 'JB',
    tasksToday: 11,
    completedToday: 9,
    efficiency: 91,
    rating: 4.7,
    shift: 'morning',
    floorAssignment: null,
    joinDate: '2022-12-01',
    performance: {
      tasksCompleted: 276,
      avgResponseTime: '2.4 min',
      customerRating: 4.7,
      punctuality: 96
    },
    schedule: [
      { date: '2025-11-20', shift: 'morning' },
      { date: '2025-11-21', shift: 'morning' },
      { date: '2025-11-22', shift: 'morning' },
      { date: '2025-11-23', shift: 'morning' },
      { date: '2025-11-24', shift: 'morning' }
    ],
    leaveHistory: [],
    aiInsights: [
      'Outstanding guest service',
      'Multilingual skills',
      'High guest satisfaction'
    ]
  },
  {
    id: 'S-012',
    name: 'Thomas Anderson',
    role: 'Room Attendant',
    status: 'off-duty',
    department: 'housekeeping',
    phone: '+1 (555) 234-5679',
    email: 'thomas.anderson@glimmora.com',
    avatar: 'TA',
    tasksToday: 0,
    completedToday: 0,
    efficiency: 82,
    rating: 4.1,
    shift: 'morning',
    floorAssignment: [3],
    joinDate: '2023-08-15',
    performance: {
      tasksCompleted: 134,
      avgResponseTime: '4.2 min',
      customerRating: 4.1,
      punctuality: 89
    },
    schedule: [],
    leaveHistory: [],
    aiInsights: [
      'Steady performer',
      'Needs punctuality improvement',
      'Day off today'
    ]
  },
  {
    id: 'S-013',
    name: 'Maria Garcia',
    role: 'Laundry Attendant',
    status: 'active',
    department: 'housekeeping',
    phone: '+1 (555) 345-6780',
    email: 'maria.garcia@glimmora.com',
    avatar: 'MG',
    tasksToday: 14,
    completedToday: 12,
    efficiency: 88,
    rating: 4.4,
    shift: 'morning',
    floorAssignment: null,
    joinDate: '2023-04-18',
    performance: {
      tasksCompleted: 203,
      avgResponseTime: '3.0 min',
      customerRating: 4.4,
      punctuality: 94
    },
    schedule: [
      { date: '2025-11-20', shift: 'morning' },
      { date: '2025-11-21', shift: 'morning' },
      { date: '2025-11-22', shift: 'morning' },
      { date: '2025-11-23', shift: 'morning' },
      { date: '2025-11-24', shift: 'morning' }
    ],
    leaveHistory: [],
    aiInsights: [
      'Efficient laundry processing',
      'Maintains quality standards',
      'Good time management'
    ]
  },
  {
    id: 'S-014',
    name: 'Kevin Lee',
    role: 'Bellhop',
    status: 'active',
    department: 'frontdesk',
    phone: '+1 (555) 456-7891',
    email: 'kevin.lee@glimmora.com',
    avatar: 'KL',
    tasksToday: 9,
    completedToday: 8,
    efficiency: 86,
    rating: 4.3,
    shift: 'evening',
    floorAssignment: null,
    joinDate: '2023-06-25',
    performance: {
      tasksCompleted: 162,
      avgResponseTime: '3.3 min',
      customerRating: 4.3,
      punctuality: 92
    },
    schedule: [
      { date: '2025-11-20', shift: 'evening' },
      { date: '2025-11-21', shift: 'evening' },
      { date: '2025-11-22', shift: 'evening' }
    ],
    leaveHistory: [],
    aiInsights: [
      'Friendly demeanor',
      'Good guest interactions',
      'Reliable evening shift'
    ]
  },
  {
    id: 'S-015',
    name: 'Rachel Green',
    role: 'Events Coordinator',
    status: 'active',
    department: 'management',
    phone: '+1 (555) 567-8902',
    email: 'rachel.green@glimmora.com',
    avatar: 'RG',
    tasksToday: 7,
    completedToday: 6,
    efficiency: 90,
    rating: 4.6,
    shift: 'morning',
    floorAssignment: null,
    joinDate: '2022-08-12',
    performance: {
      tasksCompleted: 287,
      avgResponseTime: '3.7 min',
      customerRating: 4.6,
      punctuality: 95
    },
    schedule: [
      { date: '2025-11-20', shift: 'morning' },
      { date: '2025-11-21', shift: 'morning' },
      { date: '2025-11-22', shift: 'morning' },
      { date: '2025-11-23', shift: 'morning' }
    ],
    leaveHistory: [],
    aiInsights: [
      'Creative event planning',
      'Strong client relationships',
      'Detail-oriented execution'
    ]
  },
  {
    id: 'S-016',
    name: 'Daniel Park',
    role: 'Valet Attendant',
    status: 'active',
    department: 'frontdesk',
    phone: '+1 (555) 678-9013',
    email: 'daniel.park@glimmora.com',
    avatar: 'DP',
    tasksToday: 8,
    completedToday: 7,
    efficiency: 83,
    rating: 4.2,
    shift: 'evening',
    floorAssignment: null,
    joinDate: '2023-09-03',
    performance: {
      tasksCompleted: 129,
      avgResponseTime: '4.5 min',
      customerRating: 4.2,
      punctuality: 90
    },
    schedule: [
      { date: '2025-11-20', shift: 'evening' },
      { date: '2025-11-21', shift: 'evening' },
      { date: '2025-11-22', shift: 'evening' },
      { date: '2025-11-23', shift: 'evening' }
    ],
    leaveHistory: [],
    aiInsights: [
      'Careful with vehicles',
      'Professional service',
      'Good guest rapport'
    ]
  },
  {
    id: 'S-017',
    name: 'Sophie Turner',
    role: 'Room Attendant',
    status: 'active',
    department: 'housekeeping',
    phone: '+1 (555) 789-0124',
    email: 'sophie.turner@glimmora.com',
    avatar: 'ST',
    tasksToday: 11,
    completedToday: 11,
    efficiency: 94,
    rating: 4.7,
    shift: 'morning',
    floorAssignment: [2],
    joinDate: '2023-02-28',
    performance: {
      tasksCompleted: 241,
      avgResponseTime: '2.6 min',
      customerRating: 4.7,
      punctuality: 97
    },
    schedule: [
      { date: '2025-11-20', shift: 'morning' },
      { date: '2025-11-21', shift: 'morning' },
      { date: '2025-11-22', shift: 'morning' },
      { date: '2025-11-23', shift: 'morning' },
      { date: '2025-11-24', shift: 'morning' }
    ],
    leaveHistory: [],
    aiInsights: [
      'Exceptional cleanliness',
      'Efficient worker',
      'Positive attitude'
    ]
  },
  {
    id: 'S-018',
    name: 'Marcus Johnson',
    role: 'Security Officer',
    status: 'active',
    department: 'management',
    phone: '+1 (555) 890-1235',
    email: 'marcus.johnson@glimmora.com',
    avatar: 'MJ',
    tasksToday: 5,
    completedToday: 5,
    efficiency: 91,
    rating: 4.5,
    shift: 'night',
    floorAssignment: [1, 2, 3, 4, 5],
    joinDate: '2022-10-15',
    performance: {
      tasksCompleted: 301,
      avgResponseTime: '2.1 min',
      customerRating: 4.5,
      punctuality: 99
    },
    schedule: [
      { date: '2025-11-20', shift: 'night' },
      { date: '2025-11-21', shift: 'night' },
      { date: '2025-11-22', shift: 'night' },
      { date: '2025-11-23', shift: 'night' },
      { date: '2025-11-24', shift: 'night' }
    ],
    leaveHistory: [],
    aiInsights: [
      'Vigilant security monitoring',
      'Quick incident response',
      'Professional demeanor'
    ]
  },
  {
    id: 'S-019',
    name: 'Nina Patel',
    role: 'Chef',
    status: 'active',
    department: 'management',
    phone: '+1 (555) 901-2346',
    email: 'nina.patel@glimmora.com',
    avatar: 'NP',
    tasksToday: 10,
    completedToday: 8,
    efficiency: 89,
    rating: 4.8,
    shift: 'morning',
    floorAssignment: null,
    joinDate: '2021-11-20',
    performance: {
      tasksCompleted: 398,
      avgResponseTime: '4.8 min',
      customerRating: 4.8,
      punctuality: 96
    },
    schedule: [
      { date: '2025-11-20', shift: 'morning' },
      { date: '2025-11-21', shift: 'morning' },
      { date: '2025-11-22', shift: 'morning' },
      { date: '2025-11-23', shift: 'morning' }
    ],
    leaveHistory: [],
    aiInsights: [
      'Exceptional culinary skills',
      'Creative menu design',
      'High guest satisfaction'
    ]
  },
  {
    id: 'S-020',
    name: 'Oliver Harris',
    role: 'Electrician',
    status: 'active',
    department: 'maintenance',
    phone: '+1 (555) 012-3457',
    email: 'oliver.harris@glimmora.com',
    avatar: 'OH',
    tasksToday: 6,
    completedToday: 5,
    efficiency: 85,
    rating: 4.4,
    shift: 'morning',
    floorAssignment: [1, 2, 3, 4, 5],
    joinDate: '2022-07-08',
    performance: {
      tasksCompleted: 278,
      avgResponseTime: '5.5 min',
      customerRating: 4.4,
      punctuality: 93
    },
    schedule: [
      { date: '2025-11-20', shift: 'morning' },
      { date: '2025-11-21', shift: 'morning' },
      { date: '2025-11-22', shift: 'morning' }
    ],
    leaveHistory: [],
    aiInsights: [
      'Expert electrical work',
      'Safety-conscious',
      'Reliable maintenance'
    ]
  },
  {
    id: 'S-021',
    name: 'Isabella Martinez',
    role: 'Room Attendant',
    status: 'active',
    department: 'housekeeping',
    phone: '+1 (555) 123-4569',
    email: 'isabella.martinez@glimmora.com',
    avatar: 'IM',
    tasksToday: 13,
    completedToday: 11,
    efficiency: 87,
    rating: 4.5,
    shift: 'morning',
    floorAssignment: [4],
    joinDate: '2023-03-15',
    performance: {
      tasksCompleted: 219,
      avgResponseTime: '3.2 min',
      customerRating: 4.5,
      punctuality: 95
    },
    schedule: [
      { date: '2025-11-20', shift: 'morning' },
      { date: '2025-11-21', shift: 'morning' },
      { date: '2025-11-22', shift: 'morning' },
      { date: '2025-11-23', shift: 'morning' },
      { date: '2025-11-24', shift: 'morning' }
    ],
    leaveHistory: [],
    aiInsights: [
      'Consistent quality',
      'Thorough cleaning',
      'Guest compliments'
    ]
  },
  {
    id: 'S-022',
    name: 'William Davis',
    role: 'Plumber',
    status: 'active',
    department: 'maintenance',
    phone: '+1 (555) 234-5680',
    email: 'william.davis@glimmora.com',
    avatar: 'WD',
    tasksToday: 7,
    completedToday: 6,
    efficiency: 84,
    rating: 4.3,
    shift: 'morning',
    floorAssignment: [1, 2, 3, 4, 5],
    joinDate: '2023-05-20',
    performance: {
      tasksCompleted: 171,
      avgResponseTime: '6.3 min',
      customerRating: 4.3,
      punctuality: 91
    },
    schedule: [
      { date: '2025-11-20', shift: 'morning' },
      { date: '2025-11-21', shift: 'morning' },
      { date: '2025-11-22', shift: 'morning' },
      { date: '2025-11-23', shift: 'morning' }
    ],
    leaveHistory: [],
    aiInsights: [
      'Skilled plumbing work',
      'Problem solver',
      'Timely repairs'
    ]
  },
  {
    id: 'S-023',
    name: 'Emma Wilson',
    role: 'Guest Services Agent',
    status: 'active',
    department: 'frontdesk',
    phone: '+1 (555) 345-6781',
    email: 'emma.wilson@glimmora.com',
    avatar: 'EW',
    tasksToday: 10,
    completedToday: 9,
    efficiency: 92,
    rating: 4.6,
    shift: 'evening',
    floorAssignment: null,
    joinDate: '2023-01-10',
    performance: {
      tasksCompleted: 234,
      avgResponseTime: '2.7 min',
      customerRating: 4.6,
      punctuality: 96
    },
    schedule: [
      { date: '2025-11-20', shift: 'evening' },
      { date: '2025-11-21', shift: 'evening' },
      { date: '2025-11-22', shift: 'evening' },
      { date: '2025-11-23', shift: 'evening' }
    ],
    leaveHistory: [],
    aiInsights: [
      'Excellent guest relations',
      'Problem resolution skills',
      'High efficiency'
    ]
  },
  {
    id: 'S-024',
    name: 'Lucas Brown',
    role: 'Room Attendant',
    status: 'active',
    department: 'housekeeping',
    phone: '+1 (555) 456-7892',
    email: 'lucas.brown@glimmora.com',
    avatar: 'LB',
    tasksToday: 12,
    completedToday: 10,
    efficiency: 86,
    rating: 4.4,
    shift: 'morning',
    floorAssignment: [5],
    joinDate: '2023-04-22',
    performance: {
      tasksCompleted: 197,
      avgResponseTime: '3.4 min',
      customerRating: 4.4,
      punctuality: 94
    },
    schedule: [
      { date: '2025-11-20', shift: 'morning' },
      { date: '2025-11-21', shift: 'morning' },
      { date: '2025-11-22', shift: 'morning' },
      { date: '2025-11-23', shift: 'morning' }
    ],
    leaveHistory: [],
    aiInsights: [
      'Reliable performance',
      'Detail-focused',
      'Good team member'
    ]
  },
  {
    id: 'S-025',
    name: 'Ava Thompson',
    role: 'Receptionist',
    status: 'active',
    department: 'frontdesk',
    phone: '+1 (555) 567-8903',
    email: 'ava.thompson@glimmora.com',
    avatar: 'AT',
    tasksToday: 9,
    completedToday: 8,
    efficiency: 90,
    rating: 4.5,
    shift: 'morning',
    floorAssignment: null,
    joinDate: '2023-02-05',
    performance: {
      tasksCompleted: 221,
      avgResponseTime: '2.9 min',
      customerRating: 4.5,
      punctuality: 95
    },
    schedule: [
      { date: '2025-11-20', shift: 'morning' },
      { date: '2025-11-21', shift: 'morning' },
      { date: '2025-11-22', shift: 'morning' },
      { date: '2025-11-23', shift: 'morning' },
      { date: '2025-11-24', shift: 'morning' }
    ],
    leaveHistory: [],
    aiInsights: [
      'Friendly service',
      'Organized desk management',
      'Good communication'
    ]
  },
  {
    id: 'S-026',
    name: 'Ethan Moore',
    role: 'HVAC Technician',
    status: 'active',
    department: 'maintenance',
    phone: '+1 (555) 678-9014',
    email: 'ethan.moore@glimmora.com',
    avatar: 'EM',
    tasksToday: 8,
    completedToday: 7,
    efficiency: 88,
    rating: 4.5,
    shift: 'morning',
    floorAssignment: [1, 2, 3, 4, 5],
    joinDate: '2022-11-30',
    performance: {
      tasksCompleted: 289,
      avgResponseTime: '5.0 min',
      customerRating: 4.5,
      punctuality: 94
    },
    schedule: [
      { date: '2025-11-20', shift: 'morning' },
      { date: '2025-11-21', shift: 'morning' },
      { date: '2025-11-22', shift: 'morning' }
    ],
    leaveHistory: [],
    aiInsights: [
      'HVAC expertise',
      'Preventive maintenance',
      'Energy efficiency focus'
    ]
  },
  {
    id: 'S-027',
    name: 'Mia Jackson',
    role: 'Room Service Coordinator',
    status: 'active',
    department: 'frontdesk',
    phone: '+1 (555) 789-0125',
    email: 'mia.jackson@glimmora.com',
    avatar: 'MJa',
    tasksToday: 11,
    completedToday: 10,
    efficiency: 93,
    rating: 4.7,
    shift: 'evening',
    floorAssignment: null,
    joinDate: '2023-01-25',
    performance: {
      tasksCompleted: 237,
      avgResponseTime: '3.1 min',
      customerRating: 4.7,
      punctuality: 96
    },
    schedule: [
      { date: '2025-11-20', shift: 'evening' },
      { date: '2025-11-21', shift: 'evening' },
      { date: '2025-11-22', shift: 'evening' },
      { date: '2025-11-23', shift: 'evening' }
    ],
    leaveHistory: [],
    aiInsights: [
      'Fast service delivery',
      'High accuracy',
      'Guest satisfaction focus'
    ]
  },
  {
    id: 'S-028',
    name: 'Noah Rodriguez',
    role: 'Painter',
    status: 'active',
    department: 'maintenance',
    phone: '+1 (555) 890-1236',
    email: 'noah.rodriguez@glimmora.com',
    avatar: 'NR',
    tasksToday: 6,
    completedToday: 5,
    efficiency: 81,
    rating: 4.2,
    shift: 'morning',
    floorAssignment: [3, 4],
    joinDate: '2023-06-12',
    performance: {
      tasksCompleted: 156,
      avgResponseTime: '7.2 min',
      customerRating: 4.2,
      punctuality: 89
    },
    schedule: [
      { date: '2025-11-20', shift: 'morning' },
      { date: '2025-11-21', shift: 'morning' }
    ],
    leaveHistory: [],
    aiInsights: [
      'Quality paint work',
      'Attention to aesthetics',
      'Improving speed'
    ]
  },
  {
    id: 'S-029',
    name: 'Charlotte Lee',
    role: 'HR Coordinator',
    status: 'active',
    department: 'management',
    phone: '+1 (555) 901-2347',
    email: 'charlotte.lee@glimmora.com',
    avatar: 'CL',
    tasksToday: 8,
    completedToday: 7,
    efficiency: 91,
    rating: 4.6,
    shift: 'morning',
    floorAssignment: null,
    joinDate: '2022-09-05',
    performance: {
      tasksCompleted: 295,
      avgResponseTime: '3.5 min',
      customerRating: 4.6,
      punctuality: 97
    },
    schedule: [
      { date: '2025-11-20', shift: 'morning' },
      { date: '2025-11-21', shift: 'morning' },
      { date: '2025-11-22', shift: 'morning' },
      { date: '2025-11-23', shift: 'morning' }
    ],
    leaveHistory: [],
    aiInsights: [
      'Effective staff coordination',
      'Strong communication',
      'Policy implementation'
    ]
  },
  {
    id: 'S-030',
    name: 'Benjamin Clark',
    role: 'Groundskeeper',
    status: 'active',
    department: 'maintenance',
    phone: '+1 (555) 012-3458',
    email: 'benjamin.clark@glimmora.com',
    avatar: 'BC',
    tasksToday: 9,
    completedToday: 8,
    efficiency: 87,
    rating: 4.4,
    shift: 'morning',
    floorAssignment: null,
    joinDate: '2023-03-30',
    performance: {
      tasksCompleted: 209,
      avgResponseTime: '4.7 min',
      customerRating: 4.4,
      punctuality: 93
    },
    schedule: [
      { date: '2025-11-20', shift: 'morning' },
      { date: '2025-11-21', shift: 'morning' },
      { date: '2025-11-22', shift: 'morning' },
      { date: '2025-11-23', shift: 'morning' },
      { date: '2025-11-24', shift: 'morning' }
    ],
    leaveHistory: [],
    aiInsights: [
      'Beautiful grounds maintenance',
      'Seasonal expertise',
      'Pride in work'
    ]
  }
];

// Utility functions
export function getDepartments() {
  const departments = new Set(staffData.map(s => s.department));
  return Array.from(departments).sort();
}

export function getRoles() {
  const roles = new Set(staffData.map(s => s.role));
  return Array.from(roles).sort();
}

export function getShifts() {
  return ['morning', 'evening', 'night'];
}

export function getStatuses() {
  return ['active', 'off-duty', 'sick', 'leave'];
}
