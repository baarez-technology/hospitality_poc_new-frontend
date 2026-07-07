/**
 * Room Utility Functions
 * Handles filtering, sorting, CSV export, and room management
 */

// Room status configurations
export const ROOM_STATUS_CONFIG = {
  'available': {
    label: 'Available',
    bgColor: 'bg-green-100',
    textColor: 'text-green-700',
    borderColor: 'border-green-200',
  },
  'occupied': {
    label: 'Occupied',
    bgColor: 'bg-[#A57865]/15',
    textColor: 'text-[#A57865]',
    borderColor: 'border-[#A57865]/30',
  },
  'dirty': {
    label: 'Dirty',
    bgColor: 'bg-red-100',
    textColor: 'text-red-700',
    borderColor: 'border-red-200',
  },
  'in_progress': {
    label: 'In Progress',
    bgColor: 'bg-[#CDB261]/20',
    textColor: 'text-[#CDB261]',
    borderColor: 'border-[#CDB261]/30',
  },
  'clean': {
    label: 'Clean',
    bgColor: 'bg-[#5C9BA4]/15',
    textColor: 'text-[#5C9BA4]',
    borderColor: 'border-[#5C9BA4]/30',
  },
  'out_of_service': {
    label: 'Out of Service',
    bgColor: 'bg-rose-100',
    textColor: 'text-rose-700',
    borderColor: 'border-rose-200',
  },
  'out_of_order': {
    label: 'Out of Order',
    bgColor: 'bg-gray-200',
    textColor: 'text-gray-700',
    borderColor: 'border-gray-300',
  },
};

// Housekeeping status configurations
export const HK_STATUS_CONFIG = {
  'clean': {
    label: 'Clean',
    bgColor: 'bg-[#4E5840]/15',
    textColor: 'text-[#4E5840]',
  },
  'dirty': {
    label: 'Dirty',
    bgColor: 'bg-red-100',
    textColor: 'text-red-700',
  },
  'in_progress': {
    label: 'In Progress',
    bgColor: 'bg-[#CDB261]/20',
    textColor: 'text-[#CDB261]',
  },
  'inspected': {
    label: 'Inspected',
    bgColor: 'bg-[#5C9BA4]/15',
    textColor: 'text-[#5C9BA4]',
  },
};

// Maintenance status configurations
export const MAINTENANCE_STATUS_CONFIG = {
  'none': {
    label: 'No Issues',
    bgColor: 'bg-green-100',
    textColor: 'text-green-700',
  },
  'pending': {
    label: 'Pending',
    bgColor: 'bg-[#CDB261]/20',
    textColor: 'text-[#CDB261]',
  },
  'in_progress': {
    label: 'In Progress',
    bgColor: 'bg-[#5C9BA4]/15',
    textColor: 'text-[#5C9BA4]',
  },
  'completed': {
    label: 'Completed',
    bgColor: 'bg-[#4E5840]/15',
    textColor: 'text-[#4E5840]',
  },
};

// Room types
export const ROOM_TYPES = [
  { value: 'Standard', label: 'Standard Room', basePrice: 120 },
  { value: 'Deluxe', label: 'Deluxe Room', basePrice: 180 },
  { value: 'Suite', label: 'Suite', basePrice: 280 },
  { value: 'Family', label: 'Family Room', basePrice: 220 },
  { value: 'Premium', label: 'Premium Suite', basePrice: 350 },
];

// Room features
export const ROOM_FEATURES = [
  'Sea View',
  'Balcony',
  'Bathtub',
  'King Bed',
  'Twin Beds',
  'Mini Bar',
  'Work Desk',
  'Sofa',
  'Kitchenette',
  'Jacuzzi',
  'City View',
  'Garden View',
];

// OOO Priority levels
export const OOO_PRIORITIES = [
  { value: 'high', label: 'High', color: 'text-red-600' },
  { value: 'medium', label: 'Medium', color: 'text-[#CDB261]' },
  { value: 'low', label: 'Low', color: 'text-[#4E5840]' },
];

// Generate unique room ID
export function generateRoomId() {
  return `room-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Format currency
export function formatCurrency(amount) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
  }).format(amount);
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

// Filter rooms by status
export function filterByStatus(rooms, status) {
  if (!status || status === 'all') return rooms;
  return rooms.filter(r => r.status === status);
}

// Filter rooms by type
export function filterByType(rooms, type) {
  if (!type || type === 'all') return rooms;
  return rooms.filter(r => r.type === type);
}

// Filter rooms by floor
export function filterByFloor(rooms, floor) {
  if (!floor || floor === 'all') return rooms;
  return rooms.filter(r => r.floor === parseInt(floor));
}

// Filter rooms by features
export function filterByFeatures(rooms, features) {
  if (!features || features.length === 0) return rooms;
  return rooms.filter(room => {
    const roomFeatures = room.features || [];
    return features.some(f => roomFeatures.includes(f));
  });
}

// Search rooms by number or type
export function searchRooms(rooms, query) {
  if (!query || query.trim() === '') return rooms;
  const searchTerm = query.toLowerCase().trim();
  return rooms.filter(room => {
    const roomNumber = (room.roomNumber || '').toLowerCase();
    const type = (room.type || '').toLowerCase();
    return roomNumber.includes(searchTerm) || type.includes(searchTerm);
  });
}

// Sort rooms
export function sortRooms(rooms, sortKey, sortDirection = 'asc') {
  return [...rooms].sort((a, b) => {
    let aVal = a[sortKey];
    let bVal = b[sortKey];

    // Handle numeric sorting
    if (sortKey === 'price' || sortKey === 'floor' || sortKey === 'capacity') {
      aVal = Number(aVal) || 0;
      bVal = Number(bVal) || 0;
    }

    // Handle room number sorting (extract numeric part)
    if (sortKey === 'roomNumber') {
      aVal = parseInt(aVal?.replace(/\D/g, '')) || 0;
      bVal = parseInt(bVal?.replace(/\D/g, '')) || 0;
    }

    // Handle string sorting
    if (typeof aVal === 'string') {
      aVal = aVal.toLowerCase();
      bVal = (bVal || '').toLowerCase();
    }

    if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });
}

// Export rooms to CSV
export function exportRoomsToCSV(rooms, filename = 'rooms_export.csv') {
  if (!rooms || rooms.length === 0) {
    alert('No rooms to export');
    return;
  }

  const headers = [
    'Room Number',
    'Type',
    'Status',
    'HK Status',
    'Maintenance Status',
    'Price',
    'Floor',
    'Capacity',
    'Features',
  ];

  const rows = rooms.map(room => [
    room.roomNumber || '',
    room.type || '',
    ROOM_STATUS_CONFIG[room.status]?.label || room.status || '',
    HK_STATUS_CONFIG[room.hkStatus]?.label || room.hkStatus || '',
    MAINTENANCE_STATUS_CONFIG[room.maintenanceStatus]?.label || room.maintenanceStatus || '',
    room.price || '',
    room.floor || '',
    room.capacity || '',
    (room.features || []).join('; '),
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

// Calculate room statistics
export function calculateRoomStats(rooms) {
  const totalRooms = rooms.length;

  const statusCounts = rooms.reduce((acc, r) => {
    acc[r.status] = (acc[r.status] || 0) + 1;
    return acc;
  }, {});

  const typeCounts = rooms.reduce((acc, r) => {
    acc[r.type] = (acc[r.type] || 0) + 1;
    return acc;
  }, {});

  const hkCounts = rooms.reduce((acc, r) => {
    acc[r.hkStatus] = (acc[r.hkStatus] || 0) + 1;
    return acc;
  }, {});

  const occupancyRate = totalRooms > 0
    ? Math.round(((statusCounts['occupied'] || 0) / totalRooms) * 100)
    : 0;

  return {
    totalRooms,
    statusCounts,
    typeCounts,
    hkCounts,
    occupancyRate,
    availableCount: statusCounts['available'] || 0,
    occupiedCount: statusCounts['occupied'] || 0,
    dirtyCount: statusCounts['dirty'] || 0,
    cleanCount: statusCounts['clean'] || 0,
    oooCount: statusCounts['out_of_order'] || 0,
    inProgressCount: statusCounts['in_progress'] || 0,
  };
}

// Create new room object
export function createRoomObject(formData) {
  return {
    id: generateRoomId(),
    roomNumber: formData.roomNumber,
    type: formData.type || 'Standard',
    floor: parseInt(formData.floor) || 1,
    price: parseFloat(formData.price) || 120,
    capacity: parseInt(formData.capacity) || 2,
    features: formData.features || [],
    description: formData.description || '',
    status: 'available',
    hkStatus: 'clean',
    maintenanceStatus: 'none',
    currentBookingId: null,
    currentGuest: null,
    lastCleaned: new Date().toISOString(),
    oooReason: null,
    oooExpectedReturn: null,
    oooNotes: null,
    oooPriority: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

// Update room object
export function updateRoomObject(existingRoom, updates) {
  return {
    ...existingRoom,
    ...updates,
    updatedAt: new Date().toISOString(),
  };
}

// Mark room as out of order
export function markRoomOOO(room, oooData) {
  return {
    ...room,
    status: 'out_of_order',
    oooReason: oooData.reason,
    oooExpectedReturn: oooData.expectedReturn,
    oooNotes: oooData.notes,
    oooPriority: oooData.priority,
    updatedAt: new Date().toISOString(),
  };
}

// Clear room OOO status
export function clearRoomOOO(room) {
  return {
    ...room,
    status: 'available',
    oooReason: null,
    oooExpectedReturn: null,
    oooNotes: null,
    oooPriority: null,
    updatedAt: new Date().toISOString(),
  };
}

// Assign room to booking
export function assignRoomToBooking(room, booking) {
  return {
    ...room,
    status: 'occupied',
    currentBookingId: booking.id,
    currentGuest: booking.guest,
    updatedAt: new Date().toISOString(),
  };
}

// Unassign room from booking
export function unassignRoom(room) {
  return {
    ...room,
    status: 'dirty',
    hkStatus: 'dirty',
    currentBookingId: null,
    currentGuest: null,
    updatedAt: new Date().toISOString(),
  };
}

// Create maintenance work order for OOO
export function createOOOWorkOrder(room, oooData) {
  return {
    id: `wo-${Date.now()}`,
    roomId: room.id,
    roomNumber: room.roomNumber,
    issue: oooData.reason || 'Out of Order',
    priority: oooData.priority || 'medium',
    notes: oooData.notes || '',
    status: 'pending',
    createdAt: new Date().toISOString(),
    expectedCompletion: oooData.expectedReturn,
  };
}

// Get next 14 days for calendar
export function getNext14Days() {
  const days = [];
  const today = new Date();

  for (let i = 0; i < 14; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    days.push({
      date: date.toISOString().split('T')[0],
      dayName: date.toLocaleDateString('en-US', { weekday: 'short' }),
      dayNum: date.getDate(),
      month: date.toLocaleDateString('en-US', { month: 'short' }),
      isToday: i === 0,
      isWeekend: date.getDay() === 0 || date.getDay() === 6,
    });
  }

  return days;
}

// Get room availability for calendar
export function getRoomCalendarData(rooms, bookings, days) {
  return rooms.map(room => {
    const dayStatuses = days.map(day => {
      // Check if room is OOO
      if (room.status === 'out_of_order') {
        return { status: 'ooo', bookingId: null };
      }

      // Check if room has a booking on this day
      const booking = bookings.find(b => {
        if (b.room !== room.roomNumber) return false;
        if (b.status === 'CANCELLED') return false;

        const checkIn = new Date(b.checkIn);
        const checkOut = new Date(b.checkOut);
        const currentDay = new Date(day.date);

        return currentDay >= checkIn && currentDay < checkOut;
      });

      if (booking) {
        return { status: 'booked', bookingId: booking.id, guestName: booking.guest };
      }

      return { status: 'vacant', bookingId: null };
    });

    return {
      room,
      dayStatuses,
    };
  });
}

// Validate room data
export function validateRoom(formData) {
  const errors = {};

  if (!formData.roomNumber || formData.roomNumber.trim() === '') {
    errors.roomNumber = 'Room number is required';
  }

  if (!formData.type) {
    errors.type = 'Room type is required';
  }

  if (!formData.floor || formData.floor < 1 || formData.floor > 10) {
    errors.floor = 'Floor must be between 1 and 10';
  }

  if (!formData.price || formData.price <= 0) {
    errors.price = 'Price must be greater than 0';
  }

  if (!formData.capacity || formData.capacity < 1) {
    errors.capacity = 'Capacity must be at least 1';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

// Get available rooms for assignment
export function getAvailableRoomsForAssignment(rooms, bookings, checkIn, checkOut) {
  return rooms.filter(room => {
    // Room must be available or clean
    if (room.status === 'out_of_order') return false;
    if (room.status === 'occupied') {
      // Check if current booking ends before new booking starts
      const currentBooking = bookings.find(b => b.id === room.currentBookingId);
      if (currentBooking) {
        const currentCheckOut = new Date(currentBooking.checkOut);
        const newCheckIn = new Date(checkIn);
        if (currentCheckOut > newCheckIn) return false;
      }
    }

    // Check for date conflicts with other bookings
    const hasConflict = bookings.some(b => {
      if (b.room !== room.roomNumber) return false;
      if (b.status === 'CANCELLED' || b.status === 'CHECKED-OUT') return false;

      const bCheckIn = new Date(b.checkIn);
      const bCheckOut = new Date(b.checkOut);
      const newCheckIn = new Date(checkIn);
      const newCheckOut = new Date(checkOut);

      return newCheckIn < bCheckOut && newCheckOut > bCheckIn;
    });

    return !hasConflict;
  });
}
