// Glimmora PMS Staff Portal - Demo Data Seeding
// These profiles match the sampleUsers.ts for consistency

export const generateId = () => Math.random().toString(36).substr(2, 9);

export const staffProfiles: Record<string, any> = {
  housekeeping: {
    id: 'stf-001',
    name: 'Maria Chen',
    role: 'housekeeping',
    avatar: null,
    department: 'Housekeeping',
    email: 'maria@glimmora.com',
    phone: '(555) 123-4567',
    employeeId: 'HK-2024-001',
    clockedIn: false,
    clockInTime: null,
    shiftStart: '07:00',
    shiftEnd: '15:00',
    hireDate: '2023-03-15',
    supervisor: 'Sarah Johnson'
  },
  maintenance: {
    id: 'stf-002',
    name: 'John Williams',
    role: 'maintenance',
    avatar: null,
    department: 'Maintenance',
    email: 'john@glimmora.com',
    phone: '(555) 234-5678',
    employeeId: 'MT-2024-002',
    clockedIn: false,
    clockInTime: null,
    shiftStart: '08:00',
    shiftEnd: '16:00',
    hireDate: '2022-08-20',
    supervisor: 'Mike Thompson'
  },
  runner: {
    id: 'stf-003',
    name: 'Alex Thompson',
    role: 'runner',
    avatar: null,
    department: 'Runner Services',
    email: 'alex@glimmora.com',
    phone: '(555) 345-6789',
    employeeId: 'RN-2024-003',
    clockedIn: false,
    clockInTime: null,
    shiftStart: '14:00',
    shiftEnd: '22:00',
    hireDate: '2023-11-01',
    supervisor: 'David Kim'
  }
};

export const housekeepingRooms = [
  {
    id: 'room-101',
    roomNumber: '101',
    floor: 1,
    type: 'Deluxe King',
    status: 'dirty',
    priority: 'high',
    guestCheckout: '10:00 AM',
    nextCheckin: '3:00 PM',
    guestName: 'Johnson Family',
    specialRequests: 'Extra towels, hypoallergenic pillows',
    lastCleaned: '2024-01-14',
    checklist: [
      { id: 'c1', task: 'Strip and remake bed', completed: false },
      { id: 'c2', task: 'Clean bathroom thoroughly', completed: false },
      { id: 'c3', task: 'Vacuum carpets', completed: false },
      { id: 'c4', task: 'Dust all surfaces', completed: false },
      { id: 'c5', task: 'Restock minibar', completed: false },
      { id: 'c6', task: 'Replace toiletries', completed: false },
      { id: 'c7', task: 'Clean windows', completed: false },
      { id: 'c8', task: 'Empty trash bins', completed: false }
    ],
    notes: 'VIP guest arriving - ensure premium amenities'
  },
  {
    id: 'room-205',
    roomNumber: '205',
    floor: 2,
    type: 'Executive Suite',
    status: 'in_progress',
    priority: 'urgent',
    guestCheckout: '11:00 AM',
    nextCheckin: '2:00 PM',
    guestName: 'Chen, Michael',
    specialRequests: 'Deep cleaning requested',
    lastCleaned: '2024-01-13',
    checklist: [
      { id: 'c1', task: 'Strip and remake bed', completed: true },
      { id: 'c2', task: 'Clean bathroom thoroughly', completed: true },
      { id: 'c3', task: 'Vacuum carpets', completed: false },
      { id: 'c4', task: 'Dust all surfaces', completed: false },
      { id: 'c5', task: 'Restock minibar', completed: false },
      { id: 'c6', task: 'Replace toiletries', completed: true },
      { id: 'c7', task: 'Clean windows', completed: false },
      { id: 'c8', task: 'Empty trash bins', completed: true },
      { id: 'c9', task: 'Steam clean carpets', completed: false },
      { id: 'c10', task: 'Deep clean air vents', completed: false }
    ],
    notes: 'Guest complained about dust - extra attention needed'
  },
  {
    id: 'room-312',
    roomNumber: '312',
    floor: 3,
    type: 'Standard Double',
    status: 'clean',
    priority: 'normal',
    guestCheckout: null,
    nextCheckin: '4:00 PM',
    guestName: 'Williams, Sarah',
    specialRequests: null,
    lastCleaned: '2024-01-15',
    checklist: [
      { id: 'c1', task: 'Strip and remake bed', completed: true },
      { id: 'c2', task: 'Clean bathroom thoroughly', completed: true },
      { id: 'c3', task: 'Vacuum carpets', completed: true },
      { id: 'c4', task: 'Dust all surfaces', completed: true },
      { id: 'c5', task: 'Restock minibar', completed: true },
      { id: 'c6', task: 'Replace toiletries', completed: true },
      { id: 'c7', task: 'Clean windows', completed: true },
      { id: 'c8', task: 'Empty trash bins', completed: true }
    ],
    notes: ''
  },
  {
    id: 'room-418',
    roomNumber: '418',
    floor: 4,
    type: 'Penthouse Suite',
    status: 'dirty',
    priority: 'urgent',
    guestCheckout: '12:00 PM',
    nextCheckin: '5:00 PM',
    guestName: 'Anderson, Robert',
    specialRequests: 'Rose petals on bed, champagne setup',
    lastCleaned: '2024-01-14',
    checklist: [
      { id: 'c1', task: 'Strip and remake bed', completed: false },
      { id: 'c2', task: 'Clean bathroom thoroughly', completed: false },
      { id: 'c3', task: 'Vacuum carpets', completed: false },
      { id: 'c4', task: 'Dust all surfaces', completed: false },
      { id: 'c5', task: 'Restock minibar', completed: false },
      { id: 'c6', task: 'Replace toiletries', completed: false },
      { id: 'c7', task: 'Clean windows', completed: false },
      { id: 'c8', task: 'Empty trash bins', completed: false },
      { id: 'c9', task: 'Prepare romantic setup', completed: false },
      { id: 'c10', task: 'Arrange flowers', completed: false }
    ],
    notes: 'Anniversary celebration - coordinate with concierge'
  },
  {
    id: 'room-502',
    roomNumber: '502',
    floor: 5,
    type: 'Deluxe Twin',
    status: 'dirty',
    priority: 'normal',
    guestCheckout: '10:30 AM',
    nextCheckin: '3:30 PM',
    guestName: 'Martinez Family',
    specialRequests: 'Crib needed',
    lastCleaned: '2024-01-14',
    checklist: [
      { id: 'c1', task: 'Strip and remake beds', completed: false },
      { id: 'c2', task: 'Clean bathroom thoroughly', completed: false },
      { id: 'c3', task: 'Vacuum carpets', completed: false },
      { id: 'c4', task: 'Dust all surfaces', completed: false },
      { id: 'c5', task: 'Restock minibar', completed: false },
      { id: 'c6', task: 'Replace toiletries', completed: false },
      { id: 'c7', task: 'Clean windows', completed: false },
      { id: 'c8', task: 'Empty trash bins', completed: false },
      { id: 'c9', task: 'Set up baby crib', completed: false }
    ],
    notes: 'Family with infant - ensure child safety features'
  },
  {
    id: 'room-608',
    roomNumber: '608',
    floor: 6,
    type: 'Business Suite',
    status: 'inspected',
    priority: 'low',
    guestCheckout: null,
    nextCheckin: '6:00 PM',
    guestName: 'Corporate Booking',
    specialRequests: 'Extra desk supplies',
    lastCleaned: '2024-01-15',
    checklist: [
      { id: 'c1', task: 'Strip and remake bed', completed: true },
      { id: 'c2', task: 'Clean bathroom thoroughly', completed: true },
      { id: 'c3', task: 'Vacuum carpets', completed: true },
      { id: 'c4', task: 'Dust all surfaces', completed: true },
      { id: 'c5', task: 'Restock minibar', completed: true },
      { id: 'c6', task: 'Replace toiletries', completed: true },
      { id: 'c7', task: 'Clean windows', completed: true },
      { id: 'c8', task: 'Empty trash bins', completed: true },
      { id: 'c9', task: 'Stock office supplies', completed: true }
    ],
    notes: 'Inspection completed - ready for guest'
  }
];

export const housekeepingTasks = [
  {
    id: 'hk-task-001',
    title: 'Deep Clean Room 205',
    description: 'Guest requested deep cleaning due to allergies. Focus on air vents and carpets.',
    room: '205',
    priority: 'high',
    status: 'in_progress',
    assignedBy: 'Elena Rodriguez',
    assignedAt: '2024-01-15T08:00:00',
    dueTime: '2024-01-15T11:00:00',
    category: 'deep_clean',
    estimatedMinutes: 60
  },
  {
    id: 'hk-task-002',
    title: 'Restock Amenities Floor 3',
    description: 'Weekly restock of all guest amenities on floor 3.',
    room: 'Floor 3',
    priority: 'normal',
    status: 'todo',
    assignedBy: 'Elena Rodriguez',
    assignedAt: '2024-01-15T07:30:00',
    dueTime: '2024-01-15T14:00:00',
    category: 'restock',
    estimatedMinutes: 45
  },
  {
    id: 'hk-task-003',
    title: 'Urgent: Prepare VIP Suite 418',
    description: 'Anniversary setup required. Coordinate with concierge for special arrangements.',
    room: '418',
    priority: 'urgent',
    status: 'todo',
    assignedBy: 'Sarah Mitchell',
    assignedAt: '2024-01-15T09:00:00',
    dueTime: '2024-01-15T16:00:00',
    category: 'special_setup',
    estimatedMinutes: 90
  },
  {
    id: 'hk-task-004',
    title: 'Replace Linens Room 101',
    description: 'Guest requested fresh linens mid-stay.',
    room: '101',
    priority: 'normal',
    status: 'completed',
    assignedBy: 'Elena Rodriguez',
    assignedAt: '2024-01-15T06:00:00',
    dueTime: '2024-01-15T10:00:00',
    completedAt: '2024-01-15T09:30:00',
    category: 'turndown',
    estimatedMinutes: 20
  }
];

export const maintenanceWorkOrders = [
  {
    id: 'wo-001',
    title: 'AC Unit Not Cooling - Room 305',
    description: 'Guest reported AC is running but not producing cold air. Temperature stuck at 78F.',
    room: '305',
    location: 'Room 305',
    issueType: 'HVAC',
    severity: 'high',
    status: 'in_progress',
    reportedBy: 'Front Desk - Amy',
    assignedTo: 'James Wilson',
    createdAt: '2024-01-15T08:30:00',
    updatedAt: '2024-01-15T10:15:00',
    dueDate: '2024-01-15T14:00:00',
    estimatedHours: 2,
    parts: ['Refrigerant', 'Filter'],
    comments: [
      {
        id: 'c1',
        author: 'James Wilson',
        text: 'Inspected unit. Appears to be low on refrigerant. Ordering parts.',
        timestamp: '2024-01-15T10:15:00'
      }
    ],
    photos: []
  },
  {
    id: 'wo-002',
    title: 'Leaking Faucet - Room 412',
    description: 'Bathroom sink faucet has persistent drip. Guest has complained twice.',
    room: '412',
    location: 'Room 412 - Bathroom',
    issueType: 'Plumbing',
    severity: 'medium',
    status: 'pending',
    reportedBy: 'Housekeeping - Maria',
    assignedTo: 'James Wilson',
    createdAt: '2024-01-14T16:00:00',
    updatedAt: '2024-01-14T16:00:00',
    dueDate: '2024-01-16T12:00:00',
    estimatedHours: 1,
    parts: ['Washer set', 'Cartridge'],
    comments: [],
    photos: []
  },
  {
    id: 'wo-003',
    title: 'Elevator 2 Making Noise',
    description: 'Service elevator producing grinding noise during descent. Still operational but concerning.',
    room: null,
    location: 'Service Elevator 2',
    issueType: 'Elevator',
    severity: 'critical',
    status: 'pending',
    reportedBy: 'Security - Tom',
    assignedTo: 'External Vendor',
    createdAt: '2024-01-15T07:00:00',
    updatedAt: '2024-01-15T07:00:00',
    dueDate: '2024-01-15T18:00:00',
    estimatedHours: 4,
    parts: [],
    comments: [
      {
        id: 'c1',
        author: 'Robert Chen',
        text: 'Contacted elevator service company. Tech arriving by 2 PM.',
        timestamp: '2024-01-15T09:00:00'
      }
    ],
    photos: []
  }
];

export const maintenanceTasks = [
  {
    id: 'mt-task-001',
    title: 'Monthly Fire Extinguisher Check',
    description: 'Inspect all fire extinguishers on floors 1-3. Check pressure gauges and expiration dates.',
    location: 'Floors 1-3',
    category: 'safety',
    priority: 'high',
    status: 'todo',
    assignedTo: 'James Wilson',
    createdAt: '2024-01-15T06:00:00',
    dueDate: '2024-01-15T17:00:00',
    recurring: true,
    recurringSchedule: 'monthly',
    checklist: [
      { id: 'ck1', item: 'Check pressure gauge', completed: false },
      { id: 'ck2', item: 'Verify seal intact', completed: false },
      { id: 'ck3', item: 'Check expiration date', completed: false },
      { id: 'ck4', item: 'Ensure accessibility', completed: false },
      { id: 'ck5', item: 'Document findings', completed: false }
    ]
  },
  {
    id: 'mt-task-002',
    title: 'Pool Equipment Maintenance',
    description: 'Weekly maintenance of pool filtration system and chemical balance check.',
    location: 'Pool Area',
    category: 'equipment',
    priority: 'normal',
    status: 'in_progress',
    assignedTo: 'James Wilson',
    createdAt: '2024-01-15T08:00:00',
    dueDate: '2024-01-15T12:00:00',
    recurring: true,
    recurringSchedule: 'weekly',
    checklist: [
      { id: 'ck1', item: 'Check filter pressure', completed: true },
      { id: 'ck2', item: 'Test water chemistry', completed: true },
      { id: 'ck3', item: 'Add chemicals if needed', completed: false },
      { id: 'ck4', item: 'Clean skimmer baskets', completed: false },
      { id: 'ck5', item: 'Inspect pump operation', completed: false }
    ]
  },
  {
    id: 'mt-task-003',
    title: 'Replace Lobby Light Fixtures',
    description: 'Install new LED fixtures in main lobby. Coordinate with front desk for timing.',
    location: 'Main Lobby',
    category: 'electrical',
    priority: 'low',
    status: 'todo',
    assignedTo: 'James Wilson',
    createdAt: '2024-01-14T10:00:00',
    dueDate: '2024-01-17T18:00:00',
    recurring: false,
    checklist: [
      { id: 'ck1', item: 'Verify fixture delivery', completed: true },
      { id: 'ck2', item: 'Coordinate timing with front desk', completed: false },
      { id: 'ck3', item: 'Remove old fixtures', completed: false },
      { id: 'ck4', item: 'Install new LED fixtures', completed: false },
      { id: 'ck5', item: 'Test all connections', completed: false },
      { id: 'ck6', item: 'Dispose of old fixtures properly', completed: false }
    ]
  }
];

export const equipmentIssues = [
  {
    id: 'eq-001',
    equipment: 'Ice Machine - Floor 2',
    location: 'Floor 2 Utility Room',
    issue: 'Not producing ice',
    description: 'Ice machine has stopped producing ice. Water supply appears normal.',
    severity: 'high',
    status: 'pending',
    reportedBy: 'Night Audit - Kevin',
    reportedAt: '2024-01-15T06:00:00',
    assignedTo: 'James Wilson',
    lastServiceDate: '2023-12-01',
    warrantyStatus: 'Active until 2025-06'
  },
  {
    id: 'eq-002',
    equipment: 'Laundry Dryer Unit 3',
    location: 'Basement Laundry',
    issue: 'Overheating',
    description: 'Dryer shutting off due to overheating. Lint trap and vent have been cleaned.',
    severity: 'critical',
    status: 'in_progress',
    reportedBy: 'Laundry Staff - Rosa',
    reportedAt: '2024-01-14T14:00:00',
    assignedTo: 'James Wilson',
    lastServiceDate: '2023-11-15',
    warrantyStatus: 'Expired'
  },
  {
    id: 'eq-003',
    equipment: 'Kitchen Exhaust Fan',
    location: 'Main Kitchen',
    issue: 'Excessive vibration',
    description: 'Kitchen exhaust fan vibrating excessively. May need belt replacement or bearing service.',
    severity: 'medium',
    status: 'pending',
    reportedBy: 'Chef - Marco',
    reportedAt: '2024-01-15T09:30:00',
    assignedTo: null,
    lastServiceDate: '2023-10-20',
    warrantyStatus: 'Active until 2024-10'
  }
];

export const runnerPickupRequests = [
  {
    id: 'pickup-001',
    type: 'luggage',
    room: '507',
    guestName: 'Thompson, David',
    items: '2 large suitcases, 1 carry-on',
    pickupLocation: 'Room 507',
    destination: 'Front Lobby - Valet',
    requestedAt: '2024-01-15T10:00:00',
    scheduledTime: '2024-01-15T10:30:00',
    status: 'pending',
    priority: 'normal',
    notes: 'Guest checking out. Airport shuttle at 11 AM.',
    assignedTo: null
  },
  {
    id: 'pickup-002',
    type: 'laundry',
    room: '312',
    guestName: 'Williams, Sarah',
    items: 'Express laundry bag',
    pickupLocation: 'Room 312',
    destination: 'Laundry Room',
    requestedAt: '2024-01-15T08:00:00',
    scheduledTime: '2024-01-15T08:30:00',
    status: 'in_progress',
    priority: 'high',
    notes: 'Express service - 3 hour turnaround requested.',
    assignedTo: 'Alex Thompson'
  },
  {
    id: 'pickup-003',
    type: 'amenity_request',
    room: '418',
    guestName: 'Anderson, Robert',
    items: 'Champagne and flowers from concierge',
    pickupLocation: 'Concierge Desk',
    destination: 'Room 418',
    requestedAt: '2024-01-15T14:00:00',
    scheduledTime: '2024-01-15T16:30:00',
    status: 'pending',
    priority: 'urgent',
    notes: 'Anniversary surprise. Must coordinate with housekeeping for room setup.',
    assignedTo: null
  }
];

export const runnerDeliveries = [
  {
    id: 'delivery-001',
    type: 'room_service',
    room: '205',
    guestName: 'Chen, Michael',
    items: 'Breakfast tray: Continental breakfast, coffee, orange juice',
    origin: 'Kitchen',
    destination: 'Room 205',
    orderedAt: '2024-01-15T07:30:00',
    estimatedDelivery: '2024-01-15T08:00:00',
    status: 'delivered',
    deliveredAt: '2024-01-15T07:55:00',
    priority: 'normal',
    specialInstructions: 'Gluten-free bread requested',
    assignedTo: 'Alex Thompson'
  },
  {
    id: 'delivery-002',
    type: 'package',
    room: '608',
    guestName: 'Corporate Guest',
    items: 'FedEx package - Business documents',
    origin: 'Front Desk',
    destination: 'Room 608',
    orderedAt: '2024-01-15T09:00:00',
    estimatedDelivery: '2024-01-15T09:30:00',
    status: 'in_transit',
    priority: 'high',
    specialInstructions: 'Guest requested immediate delivery upon arrival',
    assignedTo: 'Alex Thompson'
  }
];

export const generateNotifications = (role: string) => {
  const baseNotifications = [
    {
      id: 'notif-001',
      type: 'system',
      title: 'Shift Reminder',
      message: 'Your shift starts in 30 minutes. Please clock in on time.',
      timestamp: new Date(Date.now() - 1800000).toISOString(),
      read: false,
      priority: 'normal',
      actionUrl: '/staff/profile'
    },
    {
      id: 'notif-002',
      type: 'alert',
      title: 'Schedule Update',
      message: 'Your schedule for tomorrow has been updated. Please review.',
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      read: true,
      priority: 'normal',
      actionUrl: '/staff/schedule'
    }
  ];

  const roleSpecificNotifications: Record<string, any[]> = {
    housekeeping: [
      {
        id: 'notif-hk-001',
        type: 'task',
        title: 'Urgent: VIP Room Preparation',
        message: 'Room 418 needs immediate attention for VIP guest arrival.',
        timestamp: new Date(Date.now() - 900000).toISOString(),
        read: false,
        priority: 'urgent',
        actionUrl: '/staff/housekeeping/rooms/418'
      },
      {
        id: 'notif-hk-002',
        type: 'task',
        title: 'New Task Assigned',
        message: 'Deep cleaning task assigned for Room 205.',
        timestamp: new Date(Date.now() - 7200000).toISOString(),
        read: false,
        priority: 'high',
        actionUrl: '/staff/housekeeping/tasks'
      },
      {
        id: 'notif-hk-003',
        type: 'info',
        title: 'Supply Request Approved',
        message: 'Your request for additional cleaning supplies has been approved.',
        timestamp: new Date(Date.now() - 14400000).toISOString(),
        read: true,
        priority: 'normal',
        actionUrl: null
      },
      {
        id: 'notif-hk-004',
        type: 'alert',
        title: 'Guest Complaint',
        message: 'Guest in Room 205 reported dust issues. Please prioritize.',
        timestamp: new Date(Date.now() - 5400000).toISOString(),
        read: false,
        priority: 'high',
        actionUrl: '/staff/housekeeping/rooms/205'
      }
    ],
    maintenance: [
      {
        id: 'notif-mt-001',
        type: 'task',
        title: 'Critical: Elevator Issue',
        message: 'Service elevator 2 requires immediate inspection.',
        timestamp: new Date(Date.now() - 600000).toISOString(),
        read: false,
        priority: 'urgent',
        actionUrl: '/staff/maintenance/work-orders/wo-003'
      },
      {
        id: 'notif-mt-002',
        type: 'task',
        title: 'New Work Order',
        message: 'AC repair needed in Room 305. Guest complaint.',
        timestamp: new Date(Date.now() - 5400000).toISOString(),
        read: false,
        priority: 'high',
        actionUrl: '/staff/maintenance/work-orders/wo-001'
      },
      {
        id: 'notif-mt-003',
        type: 'info',
        title: 'Parts Arrived',
        message: 'Ordered HVAC parts have arrived at receiving.',
        timestamp: new Date(Date.now() - 10800000).toISOString(),
        read: true,
        priority: 'normal',
        actionUrl: null
      },
      {
        id: 'notif-mt-004',
        type: 'reminder',
        title: 'Monthly Safety Inspection',
        message: 'Fire extinguisher inspection due today.',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        read: false,
        priority: 'high',
        actionUrl: '/staff/maintenance/tasks'
      }
    ],
    runner: [
      {
        id: 'notif-rn-001',
        type: 'task',
        title: 'Urgent Pickup Request',
        message: 'VIP amenity pickup from concierge for Room 418.',
        timestamp: new Date(Date.now() - 300000).toISOString(),
        read: false,
        priority: 'urgent',
        actionUrl: '/staff/runner/pickups'
      },
      {
        id: 'notif-rn-002',
        type: 'task',
        title: 'New Delivery Assignment',
        message: 'Package delivery to Room 608. Guest requests ASAP.',
        timestamp: new Date(Date.now() - 1800000).toISOString(),
        read: false,
        priority: 'high',
        actionUrl: '/staff/runner/deliveries'
      },
      {
        id: 'notif-rn-003',
        type: 'info',
        title: 'Delivery Confirmed',
        message: 'Room 205 breakfast delivery confirmed by guest.',
        timestamp: new Date(Date.now() - 7200000).toISOString(),
        read: true,
        priority: 'normal',
        actionUrl: null
      },
      {
        id: 'notif-rn-004',
        type: 'alert',
        title: 'Express Laundry',
        message: 'Express laundry pickup for Room 312 needs completion.',
        timestamp: new Date(Date.now() - 2700000).toISOString(),
        read: false,
        priority: 'high',
        actionUrl: '/staff/runner/pickups'
      }
    ]
  };

  return [...baseNotifications, ...(roleSpecificNotifications[role] || [])];
};

export const seedDemoData = (role: string = 'housekeeping') => {
  return {
    profile: staffProfiles[role],
    notifications: generateNotifications(role),
    housekeeping: {
      rooms: housekeepingRooms,
      tasks: housekeepingTasks
    },
    maintenance: {
      workOrders: maintenanceWorkOrders,
      tasks: maintenanceTasks,
      equipmentIssues: equipmentIssues
    },
    runner: {
      pickupRequests: runnerPickupRequests,
      deliveries: runnerDeliveries
    }
  };
};

export default seedDemoData;





