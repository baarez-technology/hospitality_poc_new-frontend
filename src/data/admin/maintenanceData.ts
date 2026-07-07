/**
 * Maintenance Data - Work Orders, Preventive Maintenance, Technicians, Inventory
 */

// Technicians Data
export const techniciansData = [
  {
    id: 'TECH-001',
    name: 'Robert Martinez',
    avatar: 'RM',
    specialty: 'electrical',
    status: 'active',
    phone: '+1 555-0101',
    email: 'r.martinez@glimmora.com',
    assignedTasks: 3
  },
  {
    id: 'TECH-002',
    name: 'David Chen',
    avatar: 'DC',
    specialty: 'plumbing',
    status: 'active',
    phone: '+1 555-0102',
    email: 'd.chen@glimmora.com',
    assignedTasks: 2
  },
  {
    id: 'TECH-003',
    name: 'Michael Johnson',
    avatar: 'MJ',
    specialty: 'hvac',
    status: 'active',
    phone: '+1 555-0103',
    email: 'm.johnson@glimmora.com',
    assignedTasks: 4
  },
  {
    id: 'TECH-004',
    name: 'James Wilson',
    avatar: 'JW',
    specialty: 'carpentry',
    status: 'on_duty',
    phone: '+1 555-0104',
    email: 'j.wilson@glimmora.com',
    assignedTasks: 2
  },
  {
    id: 'TECH-005',
    name: 'Carlos Rodriguez',
    avatar: 'CR',
    specialty: 'general',
    status: 'active',
    phone: '+1 555-0105',
    email: 'c.rodriguez@glimmora.com',
    assignedTasks: 1
  }
];

// Work Orders Data
export const workOrdersData = [
  {
    id: 'WO-001',
    roomNumber: '102',
    roomId: 'R-102',
    roomType: 'Standard',
    category: 'electrical',
    priority: 'high',
    issue: 'Power outlet not working',
    description: 'Guest reported that the outlet near the bed is not functioning. Multiple devices tested.',
    status: 'in_progress',
    assignedTo: 'TECH-001',
    technicianName: 'Robert Martinez',
    isOOO: false,
    attachments: [],
    activityLog: [
      { id: 1, timestamp: '2025-11-27T08:00:00Z', action: 'Work order created', user: 'Front Desk' },
      { id: 2, timestamp: '2025-11-27T08:30:00Z', action: 'Assigned to Robert Martinez', user: 'Manager' },
      { id: 3, timestamp: '2025-11-27T09:00:00Z', action: 'Status changed to In Progress', user: 'Robert Martinez' }
    ],
    createdAt: '2025-11-27T08:00:00Z',
    updatedAt: '2025-11-27T09:00:00Z',
    completedAt: null,
    estimatedCompletion: '2025-11-27T12:00:00Z',
    notes: 'Suspected circuit breaker issue'
  },
  {
    id: 'WO-002',
    roomNumber: '205',
    roomId: 'R-205',
    roomType: 'Premium',
    category: 'plumbing',
    priority: 'high',
    issue: 'Bathroom leak',
    description: 'Water leaking from under the bathroom sink. Causing water damage to floor.',
    status: 'open',
    assignedTo: 'TECH-002',
    technicianName: 'David Chen',
    isOOO: true,
    attachments: [],
    activityLog: [
      { id: 1, timestamp: '2025-11-27T07:00:00Z', action: 'Work order created', user: 'Housekeeping' },
      { id: 2, timestamp: '2025-11-27T07:15:00Z', action: 'Room marked as Out of Order', user: 'Manager' },
      { id: 3, timestamp: '2025-11-27T07:30:00Z', action: 'Assigned to David Chen', user: 'Manager' }
    ],
    createdAt: '2025-11-27T07:00:00Z',
    updatedAt: '2025-11-27T07:30:00Z',
    completedAt: null,
    estimatedCompletion: '2025-11-27T14:00:00Z',
    notes: 'Urgent - potential water damage'
  },
  {
    id: 'WO-003',
    roomNumber: '301',
    roomId: 'R-301',
    roomType: 'Deluxe',
    category: 'hvac',
    priority: 'medium',
    issue: 'AC not cooling properly',
    description: 'Air conditioning unit running but room temperature not dropping below 76F.',
    status: 'in_progress',
    assignedTo: 'TECH-003',
    technicianName: 'Michael Johnson',
    isOOO: false,
    attachments: [],
    activityLog: [
      { id: 1, timestamp: '2025-11-26T14:00:00Z', action: 'Work order created', user: 'Guest Request' },
      { id: 2, timestamp: '2025-11-26T14:30:00Z', action: 'Assigned to Michael Johnson', user: 'Manager' },
      { id: 3, timestamp: '2025-11-26T15:00:00Z', action: 'Status changed to In Progress', user: 'Michael Johnson' }
    ],
    createdAt: '2025-11-26T14:00:00Z',
    updatedAt: '2025-11-26T15:00:00Z',
    completedAt: null,
    estimatedCompletion: '2025-11-27T16:00:00Z',
    notes: 'Filter replacement may be needed'
  },
  {
    id: 'WO-004',
    roomNumber: '108',
    roomId: 'R-108',
    roomType: 'Standard',
    category: 'carpentry',
    priority: 'low',
    issue: 'Closet door not closing',
    description: 'Closet door hinge is loose, door does not close properly.',
    status: 'completed',
    assignedTo: 'TECH-004',
    technicianName: 'James Wilson',
    isOOO: false,
    attachments: [],
    activityLog: [
      { id: 1, timestamp: '2025-11-25T10:00:00Z', action: 'Work order created', user: 'Housekeeping' },
      { id: 2, timestamp: '2025-11-25T11:00:00Z', action: 'Assigned to James Wilson', user: 'Manager' },
      { id: 3, timestamp: '2025-11-25T14:00:00Z', action: 'Status changed to In Progress', user: 'James Wilson' },
      { id: 4, timestamp: '2025-11-25T15:30:00Z', action: 'Work order completed', user: 'James Wilson' }
    ],
    createdAt: '2025-11-25T10:00:00Z',
    updatedAt: '2025-11-25T15:30:00Z',
    completedAt: '2025-11-25T15:30:00Z',
    estimatedCompletion: null,
    notes: 'Replaced hinge screws and realigned door'
  },
  {
    id: 'WO-005',
    roomNumber: '402',
    roomId: 'R-402',
    roomType: 'Suite',
    category: 'appliance',
    priority: 'medium',
    issue: 'Mini-bar refrigerator not cooling',
    description: 'Mini-bar fridge running but not maintaining temperature.',
    status: 'on_hold',
    assignedTo: 'TECH-003',
    technicianName: 'Michael Johnson',
    isOOO: false,
    attachments: [],
    activityLog: [
      { id: 1, timestamp: '2025-11-26T09:00:00Z', action: 'Work order created', user: 'Front Desk' },
      { id: 2, timestamp: '2025-11-26T10:00:00Z', action: 'Assigned to Michael Johnson', user: 'Manager' },
      { id: 3, timestamp: '2025-11-26T16:00:00Z', action: 'Status changed to On Hold - awaiting parts', user: 'Michael Johnson' }
    ],
    createdAt: '2025-11-26T09:00:00Z',
    updatedAt: '2025-11-26T16:00:00Z',
    completedAt: null,
    estimatedCompletion: null,
    notes: 'Compressor may need replacement. Waiting for parts.'
  },
  {
    id: 'WO-006',
    roomNumber: null,
    roomId: null,
    roomType: null,
    category: 'electrical',
    priority: 'high',
    issue: 'Lobby lighting flickering',
    description: 'Main lobby chandelier lights flickering intermittently. Safety concern.',
    status: 'in_progress',
    assignedTo: 'TECH-001',
    technicianName: 'Robert Martinez',
    isOOO: false,
    attachments: [],
    activityLog: [
      { id: 1, timestamp: '2025-11-27T06:00:00Z', action: 'Work order created', user: 'Night Manager' },
      { id: 2, timestamp: '2025-11-27T07:00:00Z', action: 'Assigned to Robert Martinez', user: 'Manager' },
      { id: 3, timestamp: '2025-11-27T08:00:00Z', action: 'Status changed to In Progress', user: 'Robert Martinez' }
    ],
    createdAt: '2025-11-27T06:00:00Z',
    updatedAt: '2025-11-27T08:00:00Z',
    completedAt: null,
    estimatedCompletion: '2025-11-27T11:00:00Z',
    notes: 'Checking electrical connections and transformer'
  },
  {
    id: 'WO-007',
    roomNumber: '503',
    roomId: 'R-503',
    roomType: 'Suite',
    category: 'plumbing',
    priority: 'low',
    issue: 'Slow drain in bathtub',
    description: 'Bathtub draining slowly, likely clogged.',
    status: 'open',
    assignedTo: null,
    technicianName: null,
    isOOO: false,
    attachments: [],
    activityLog: [
      { id: 1, timestamp: '2025-11-27T10:00:00Z', action: 'Work order created', user: 'Housekeeping' }
    ],
    createdAt: '2025-11-27T10:00:00Z',
    updatedAt: '2025-11-27T10:00:00Z',
    completedAt: null,
    estimatedCompletion: null,
    notes: ''
  },
  {
    id: 'WO-008',
    roomNumber: '306',
    roomId: 'R-306',
    roomType: 'Deluxe',
    category: 'hvac',
    priority: 'high',
    issue: 'AC unit completely stopped',
    description: 'HVAC unit not turning on at all. Room is very warm.',
    status: 'open',
    assignedTo: 'TECH-003',
    technicianName: 'Michael Johnson',
    isOOO: true,
    attachments: [],
    activityLog: [
      { id: 1, timestamp: '2025-11-27T09:30:00Z', action: 'Work order created', user: 'Guest Request' },
      { id: 2, timestamp: '2025-11-27T09:45:00Z', action: 'Room marked as Out of Order', user: 'Front Desk' },
      { id: 3, timestamp: '2025-11-27T10:00:00Z', action: 'Assigned to Michael Johnson', user: 'Manager' }
    ],
    createdAt: '2025-11-27T09:30:00Z',
    updatedAt: '2025-11-27T10:00:00Z',
    completedAt: null,
    estimatedCompletion: '2025-11-27T15:00:00Z',
    notes: 'Guest relocated to room 308'
  },
  {
    id: 'WO-009',
    roomNumber: '201',
    roomId: 'R-201',
    roomType: 'Premium',
    category: 'general',
    priority: 'low',
    issue: 'TV remote not working',
    description: 'TV remote batteries may be dead or remote malfunctioning.',
    status: 'completed',
    assignedTo: 'TECH-005',
    technicianName: 'Carlos Rodriguez',
    isOOO: false,
    attachments: [],
    activityLog: [
      { id: 1, timestamp: '2025-11-26T16:00:00Z', action: 'Work order created', user: 'Front Desk' },
      { id: 2, timestamp: '2025-11-26T16:30:00Z', action: 'Assigned to Carlos Rodriguez', user: 'Manager' },
      { id: 3, timestamp: '2025-11-26T17:00:00Z', action: 'Work order completed - replaced batteries', user: 'Carlos Rodriguez' }
    ],
    createdAt: '2025-11-26T16:00:00Z',
    updatedAt: '2025-11-26T17:00:00Z',
    completedAt: '2025-11-26T17:00:00Z',
    estimatedCompletion: null,
    notes: 'Replaced batteries, remote working'
  },
  {
    id: 'WO-010',
    roomNumber: '410',
    roomId: 'R-410',
    roomType: 'Suite',
    category: 'electrical',
    priority: 'medium',
    issue: 'Safe not opening',
    description: 'In-room safe electronic lock not responding to code.',
    status: 'in_progress',
    assignedTo: 'TECH-001',
    technicianName: 'Robert Martinez',
    isOOO: false,
    attachments: [],
    activityLog: [
      { id: 1, timestamp: '2025-11-27T11:00:00Z', action: 'Work order created', user: 'Front Desk' },
      { id: 2, timestamp: '2025-11-27T11:15:00Z', action: 'Assigned to Robert Martinez', user: 'Manager' },
      { id: 3, timestamp: '2025-11-27T11:30:00Z', action: 'Status changed to In Progress', user: 'Robert Martinez' }
    ],
    createdAt: '2025-11-27T11:00:00Z',
    updatedAt: '2025-11-27T11:30:00Z',
    completedAt: null,
    estimatedCompletion: '2025-11-27T13:00:00Z',
    notes: 'Guest belongings inside - urgent'
  }
];

// Preventive Maintenance Tasks
export const preventiveMaintenanceData = [
  {
    id: 'PM-001',
    equipment: 'HVAC System - Building A',
    roomNumber: null,
    roomId: null,
    category: 'hvac',
    frequency: 'monthly',
    nextDueDate: '2025-12-01',
    lastCompleted: '2025-11-01',
    assignedTo: 'TECH-003',
    technicianName: 'Michael Johnson',
    notes: 'Check filters, coils, and refrigerant levels',
    isActive: true,
    createdAt: '2025-01-15T00:00:00Z',
    updatedAt: '2025-11-01T00:00:00Z'
  },
  {
    id: 'PM-002',
    equipment: 'Elevator 1',
    roomNumber: null,
    roomId: null,
    category: 'electrical',
    frequency: 'weekly',
    nextDueDate: '2025-12-02',
    lastCompleted: '2025-11-25',
    assignedTo: 'TECH-001',
    technicianName: 'Robert Martinez',
    notes: 'Safety inspection and lubrication',
    isActive: true,
    createdAt: '2025-01-10T00:00:00Z',
    updatedAt: '2025-11-25T00:00:00Z'
  },
  {
    id: 'PM-003',
    equipment: 'Fire Sprinkler System',
    roomNumber: null,
    roomId: null,
    category: 'plumbing',
    frequency: 'quarterly',
    nextDueDate: '2026-02-01',
    lastCompleted: '2025-11-01',
    assignedTo: 'TECH-002',
    technicianName: 'David Chen',
    notes: 'Flow test and visual inspection',
    isActive: true,
    createdAt: '2025-01-20T00:00:00Z',
    updatedAt: '2025-11-01T00:00:00Z'
  },
  {
    id: 'PM-004',
    equipment: 'Pool Pump System',
    roomNumber: null,
    roomId: null,
    category: 'plumbing',
    frequency: 'daily',
    nextDueDate: '2025-11-28',
    lastCompleted: '2025-11-27',
    assignedTo: 'TECH-002',
    technicianName: 'David Chen',
    notes: 'Check chemical levels and pump operation',
    isActive: true,
    createdAt: '2025-03-01T00:00:00Z',
    updatedAt: '2025-11-27T00:00:00Z'
  },
  {
    id: 'PM-005',
    equipment: 'Emergency Generator',
    roomNumber: null,
    roomId: null,
    category: 'electrical',
    frequency: 'monthly',
    nextDueDate: '2025-12-15',
    lastCompleted: '2025-11-15',
    assignedTo: 'TECH-001',
    technicianName: 'Robert Martinez',
    notes: 'Run test and fuel level check',
    isActive: true,
    createdAt: '2025-02-01T00:00:00Z',
    updatedAt: '2025-11-15T00:00:00Z'
  }
];

// Inventory Data
export const inventoryData = [
  {
    id: 'INV-001',
    name: 'Light Bulbs (LED 60W)',
    category: 'electrical',
    stockLevel: 150,
    minStock: 50,
    unitCost: 5.99,
    location: 'Storage Room A',
    lastRestocked: '2025-11-20'
  },
  {
    id: 'INV-002',
    name: 'HVAC Filters (Standard)',
    category: 'hvac',
    stockLevel: 24,
    minStock: 10,
    unitCost: 15.99,
    location: 'Storage Room B',
    lastRestocked: '2025-11-15'
  },
  {
    id: 'INV-003',
    name: 'Pipe Fittings (Assorted)',
    category: 'plumbing',
    stockLevel: 45,
    minStock: 20,
    unitCost: 3.50,
    location: 'Storage Room A',
    lastRestocked: '2025-11-10'
  },
  {
    id: 'INV-004',
    name: 'Door Hinges',
    category: 'hardware',
    stockLevel: 30,
    minStock: 15,
    unitCost: 8.99,
    location: 'Storage Room C',
    lastRestocked: '2025-11-18'
  },
  {
    id: 'INV-005',
    name: 'Electrical Wire (14 AWG)',
    category: 'electrical',
    stockLevel: 500,
    minStock: 200,
    unitCost: 0.45,
    location: 'Storage Room B',
    lastRestocked: '2025-11-05'
  },
  {
    id: 'INV-006',
    name: 'Refrigerant R-410A',
    category: 'hvac',
    stockLevel: 8,
    minStock: 5,
    unitCost: 89.99,
    location: 'Secure Storage',
    lastRestocked: '2025-10-30'
  },
  {
    id: 'INV-007',
    name: 'PVC Pipes (2 inch)',
    category: 'plumbing',
    stockLevel: 12,
    minStock: 10,
    unitCost: 12.99,
    location: 'Storage Room A',
    lastRestocked: '2025-11-22'
  },
  {
    id: 'INV-008',
    name: 'Circuit Breakers (20A)',
    category: 'electrical',
    stockLevel: 18,
    minStock: 10,
    unitCost: 24.99,
    location: 'Storage Room B',
    lastRestocked: '2025-11-12'
  }
];

// Helper functions
export function getWorkOrderById(id) {
  return workOrdersData.find(wo => wo.id === id);
}

export function getTechnicianById(id) {
  return techniciansData.find(t => t.id === id);
}

export function getWorkOrdersByTechnician(techId) {
  return workOrdersData.filter(wo => wo.assignedTo === techId);
}

export function getWorkOrdersByRoom(roomNumber) {
  return workOrdersData.filter(wo => wo.roomNumber === roomNumber);
}
