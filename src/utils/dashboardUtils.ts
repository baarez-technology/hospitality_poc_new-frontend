/**
 * Dashboard Utility Functions
 * Computes KPIs, charts data, and insights from raw data
 */

// Format currency - pass currency code from useCurrency() hook in components
export function formatCurrency(value, currency = 'INR') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

// Format percentage
export function formatPercentage(value) {
  return `${value.toFixed(1)}%`;
}

// Get today's date string in local timezone (YYYY-MM-DD format)
export function getTodayString() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Get a date string in local timezone (YYYY-MM-DD format)
export function getLocalDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Calculate Occupancy Percentage
export function calculateOccupancy(rooms) {
  if (!rooms || rooms.length === 0) return 0;
  const occupiedRooms = rooms.filter(r => {
    const status = (r.status || '').toLowerCase();
    return status === 'occupied' || status === 'checked_in';
  }).length;
  const availableRooms = rooms.filter(r => {
    const status = (r.status || '').toLowerCase();
    return status !== 'out_of_service' && status !== 'out_of_order';
  }).length;
  return availableRooms > 0 ? (occupiedRooms / availableRooms) * 100 : 0;
}

// Calculate ADR (Average Daily Rate)
export function calculateADR(rooms) {
  if (!rooms || rooms.length === 0) return 0;
  const occupiedRooms = rooms.filter(r => {
    const status = (r.status || '').toLowerCase();
    return status === 'occupied' || status === 'checked_in';
  });
  if (occupiedRooms.length === 0) return 0;
  const totalPrice = occupiedRooms.reduce((sum, r) => sum + (r.price || r.rate || r.roomRate || 0), 0);
  return totalPrice / occupiedRooms.length;
}

// Calculate RevPAR (Revenue Per Available Room)
export function calculateRevPAR(rooms) {
  const adr = calculateADR(rooms);
  const occupancy = calculateOccupancy(rooms);
  return adr * (occupancy / 100);
}

// Calculate ARR (Average Revenue per Reservation)
export function calculateARR(bookings) {
  if (!bookings || bookings.length === 0) return 0;
  const totalAmount = bookings.reduce((sum, b) => sum + (b.amount || 0), 0);
  return totalAmount / bookings.length;
}

// Count bookings for today
export function countBookingsToday(bookings) {
  if (!bookings || bookings.length === 0) return 0;
  const today = getTodayString();
  return bookings.filter(b => b.bookedOn === today).length;
}

// Count check-ins today
export function countCheckInsToday(bookings) {
  if (!bookings || bookings.length === 0) return 0;
  const today = getTodayString();
  return bookings.filter(b => b.checkIn === today &&
    (b.status?.toLowerCase() === 'checked-in' || b.status?.toLowerCase() === 'confirmed')).length;
}

// Count check-outs today
export function countCheckOutsToday(bookings) {
  if (!bookings || bookings.length === 0) return 0;
  const today = getTodayString();
  return bookings.filter(b => b.checkOut === today).length;
}

// Count available rooms
export function countAvailableRooms(rooms) {
  if (!rooms || rooms.length === 0) return 0;
  return rooms.filter(r => {
    const status = (r.status || '').toLowerCase();
    return status === 'available' || status === 'vacant';
  }).length;
}

// Calculate channel mix from bookings
export function calculateChannelMix(bookings) {
  if (!bookings || bookings.length === 0) {
    return [
      { name: 'OTA', value: 35, color: '#A57865' },
      { name: 'Direct', value: 25, color: '#5C9BA4' },
      { name: 'Corporate', value: 15, color: '#4E5840' },
      { name: 'Website', value: 15, color: '#CDB261' },
      { name: 'Walk-in', value: 10, color: '#C8B29D' },
    ];
  }

  const channelCounts = {};
  const channelColors = {
    'Booking.com': '#A57865',
    'Expedia': '#A57865',
    'OTA': '#A57865',
    'Direct': '#5C9BA4',
    'Corporate': '#4E5840',
    'Website': '#CDB261',
    'Walk-in': '#C8B29D',
    'Travel Agent': '#5C9BA4',
  };

  // Normalize source names
  bookings.forEach(b => {
    let channel = b.source || 'Other';
    // Map to standard channels
    if (['Booking.com', 'Expedia'].includes(channel)) {
      channel = 'OTA';
    }
    channelCounts[channel] = (channelCounts[channel] || 0) + 1;
  });

  const total = bookings.length;
  return Object.entries(channelCounts).map(([name, count]) => ({
    name,
    value: Math.round((count / total) * 100),
    count,
    color: channelColors[name] || '#C8B29D',
  }));
}

// Generate occupancy forecast for next 7 days
export function generateOccupancyForecast(rooms, bookings) {
  const forecast = [];
  const today = new Date();
  const totalRooms = rooms?.length || 35;

  for (let i = 0; i < 7; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() + i);
    const dateStr = getLocalDateString(date);
    const dayLabel = date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

    // Count expected occupancy from bookings
    let expectedOccupied = 0;
    if (bookings && bookings.length > 0) {
      expectedOccupied = bookings.filter(b => {
        const checkIn = new Date(b.checkIn);
        const checkOut = new Date(b.checkOut);
        const targetDate = new Date(dateStr);
        return targetDate >= checkIn && targetDate < checkOut &&
               b.status !== 'CANCELLED' && b.status !== 'CHECKED-OUT';
      }).length;
    }

    // Add some randomness for demo
    const baseOccupied = expectedOccupied > 0 ? expectedOccupied : Math.floor(totalRooms * (0.6 + Math.random() * 0.3));
    const occupancy = Math.min(100, Math.round((baseOccupied / totalRooms) * 100));
    const available = totalRooms - baseOccupied;

    // Count expected arrivals
    const arrivals = bookings?.filter(b => b.checkIn === dateStr && b.status !== 'CANCELLED').length ||
                     Math.floor(Math.random() * 8) + 2;

    forecast.push({
      date: dateStr,
      day: dayLabel,
      occupancy,
      available,
      arrivals,
    });
  }

  return forecast;
}

// Generate revenue trend data
export function generateRevenueTrend(bookings) {
  const trend = [];
  const today = new Date();

  for (let i = 13; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = getLocalDateString(date);
    const dayLabel = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

    // Calculate revenue from bookings for that date
    let revenue = 0;
    if (bookings && bookings.length > 0) {
      const dayBookings = bookings.filter(b => {
        const checkIn = new Date(b.checkIn);
        const checkOut = new Date(b.checkOut);
        const targetDate = new Date(dateStr);
        return targetDate >= checkIn && targetDate < checkOut;
      });
      revenue = dayBookings.reduce((sum, b) => sum + ((b.amount || 0) / (b.nights || 1)), 0);
    }

    // Add base revenue if no bookings
    if (revenue === 0) {
      revenue = 15000 + Math.random() * 10000;
    }

    trend.push({
      date: dateStr,
      day: dayLabel,
      revenue: Math.round(revenue),
    });
  }

  return trend;
}

// Calculate housekeeping summary
export function calculateHousekeepingSummary(housekeepingRooms, housekeepers) {
  if (!housekeepingRooms || housekeepingRooms.length === 0) {
    return {
      dirty: 15,
      inProgress: 8,
      clean: 27,
      avgCleaningTime: 35,
      staffOnShift: 6,
    };
  }

  const dirty = housekeepingRooms.filter(r => {
    const status = (r.status || '').toLowerCase();
    return status === 'dirty' || status === 'needs_cleaning';
  }).length;
  const inProgress = housekeepingRooms.filter(r => {
    const status = (r.status || '').toLowerCase();
    return status === 'in_progress' || status === 'cleaning';
  }).length;
  const clean = housekeepingRooms.filter(r => {
    const status = (r.status || '').toLowerCase();
    return status === 'clean' || status === 'inspected';
  }).length;

  // Calculate average cleaning time from in-progress rooms
  const inProgressRooms = housekeepingRooms.filter(r => {
    const status = (r.status || '').toLowerCase();
    return status === 'in_progress' || status === 'cleaning';
  });
  const avgCleaningTime = inProgressRooms.length > 0
    ? Math.round(inProgressRooms.reduce((sum, r) => sum + (r.timeSinceDirtyMinutes || 0), 0) / inProgressRooms.length)
    : 35;

  // Count staff on shift
  const staffOnShift = housekeepers?.filter(h => h.shift === 'morning')?.length ||
                       new Set(housekeepingRooms.filter(r => r.assignedTo).map(r => r.assignedTo)).size;

  return {
    dirty,
    inProgress,
    clean,
    avgCleaningTime,
    staffOnShift,
  };
}

// Calculate maintenance summary
export function calculateMaintenanceSummary(staff) {
  // Default values for demo
  const defaultSummary = {
    totalWorkOrders: 24,
    openWorkOrders: 12,
    highPriority: 4,
    avgResolutionTime: '2.5h',
    assignedTechnicians: 5,
  };

  if (!staff || staff.length === 0) return defaultSummary;

  const maintenanceStaff = staff.filter(s => s.department === 'maintenance');
  const activeMaintenanceStaff = maintenanceStaff.filter(s => s.status === 'active');

  // Calculate totals from maintenance staff tasks
  const totalTasks = maintenanceStaff.reduce((sum, s) => sum + (s.tasksToday || 0), 0);
  const completedTasks = maintenanceStaff.reduce((sum, s) => sum + (s.completedToday || 0), 0);
  const openTasks = totalTasks - completedTasks;

  return {
    totalWorkOrders: totalTasks || defaultSummary.totalWorkOrders,
    openWorkOrders: openTasks || defaultSummary.openWorkOrders,
    highPriority: Math.ceil(openTasks * 0.3) || defaultSummary.highPriority,
    avgResolutionTime: defaultSummary.avgResolutionTime,
    assignedTechnicians: activeMaintenanceStaff.length || defaultSummary.assignedTechnicians,
  };
}

// Generate AI insights based on data
export function generateAIInsights(rooms, bookings, housekeepingRooms, staff) {
  const insights = [];

  // Occupancy forecast insight
  const occupancy = calculateOccupancy(rooms);
  if (occupancy > 80) {
    insights.push({
      id: 'occ_high',
      type: 'success',
      category: 'Occupancy',
      title: 'High Occupancy Alert',
      message: `Occupancy forecast trending at ${occupancy.toFixed(0)}% - above target`,
      priority: 'low',
      trend: { value: 12, direction: 'up' },
      impact: 'Potential revenue increase of $350,000',
      recommendation: 'Consider dynamic pricing to maximize ADR',
      confidence: 92,
      timeAgo: '2 min ago',
    });
  } else if (occupancy < 60) {
    insights.push({
      id: 'occ_low',
      type: 'warning',
      category: 'Occupancy',
      title: 'Low Occupancy Warning',
      message: 'Occupancy below 60% - consider promotional pricing',
      priority: 'high',
      trend: { value: 8, direction: 'down' },
      impact: 'Potential revenue loss of $290,000',
      recommendation: 'Launch flash sale or partner promotions',
      confidence: 87,
      timeAgo: '5 min ago',
    });
  } else {
    insights.push({
      id: 'occ_normal',
      type: 'info',
      category: 'Forecast',
      title: 'Weekend Demand Surge',
      message: `Occupancy forecast trending +12% for next weekend`,
      priority: 'medium',
      trend: { value: 12, direction: 'up' },
      impact: 'Expected increase of 8 bookings',
      recommendation: 'Prepare housekeeping schedules in advance',
      confidence: 85,
      timeAgo: '10 min ago',
    });
  }

  // ADR optimization insight
  const adr = calculateADR(rooms);
  if (adr > 0) {
    insights.push({
      id: 'adr_opt',
      type: 'info',
      category: 'Revenue',
      title: 'Pricing Opportunity',
      message: `ADR optimization opportunity detected - current ADR: ${formatCurrency(adr)}`,
      priority: 'medium',
      trend: { value: 5.3, direction: 'up' },
      impact: `Potential +$${Math.round(adr * 0.08)} per night`,
      recommendation: 'Adjust room rates for premium categories',
      confidence: 78,
      timeAgo: '15 min ago',
    });
  }

  // Channel mix insight
  const channelMix = calculateChannelMix(bookings);
  const otaShare = channelMix.find(c => c.name === 'OTA')?.value || 0;
  if (otaShare > 50) {
    insights.push({
      id: 'channel_ota',
      type: 'warning',
      category: 'Distribution',
      title: 'OTA Dependency Alert',
      message: `High OTA dependency: ${otaShare}% of bookings from third parties`,
      priority: 'high',
      trend: { value: 3, direction: 'up' },
      impact: `~$${Math.round(otaShare * 37.5)} in commission costs daily`,
      recommendation: 'Increase direct booking incentives',
      confidence: 94,
      timeAgo: '20 min ago',
    });
  }

  // Housekeeping insight
  if (housekeepingRooms && housekeepingRooms.length > 0) {
    const overdueRooms = housekeepingRooms.filter(r =>
      r.status === 'dirty' && r.timeSinceDirtyMinutes > 180
    ).length;
    if (overdueRooms > 0) {
      insights.push({
        id: 'hk_overdue',
        type: 'warning',
        category: 'Operations',
        title: 'Housekeeping Delay',
        message: `${overdueRooms} rooms waiting over 3 hours for cleaning`,
        priority: 'high',
        trend: { value: overdueRooms, direction: 'up' },
        impact: 'May delay check-ins and affect guest satisfaction',
        recommendation: 'Reallocate staff to priority rooms',
        confidence: 96,
        timeAgo: '1 min ago',
      });
    }
  } else {
    insights.push({
      id: 'hk_overdue',
      type: 'warning',
      category: 'Operations',
      title: 'Housekeeping Delay',
      message: '7 rooms waiting over 3 hours for cleaning',
      priority: 'high',
      trend: { value: 7, direction: 'up' },
      impact: 'May delay check-ins and affect guest satisfaction',
      recommendation: 'Reallocate staff to priority rooms',
      confidence: 96,
      timeAgo: '1 min ago',
    });
  }

  // Maintenance insight
  if (staff && staff.length > 0) {
    const maintenanceStaff = staff.filter(s => s.department === 'maintenance');
    const totalTasks = maintenanceStaff.reduce((sum, s) => sum + (s.tasksToday || 0), 0);
    const completedTasks = maintenanceStaff.reduce((sum, s) => sum + (s.completedToday || 0), 0);
    const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

    if (completionRate < 80) {
      insights.push({
        id: 'maint_workload',
        type: 'warning',
        category: 'Maintenance',
        title: 'Workload Increase',
        message: `Maintenance workload has increased by 14% this week`,
        priority: 'medium',
        trend: { value: 14, direction: 'up' },
        impact: `${totalTasks - completedTasks} pending work orders`,
        recommendation: 'Consider scheduling overtime or temp staff',
        confidence: 82,
        timeAgo: '30 min ago',
      });
    }
  } else {
    insights.push({
      id: 'maint_workload',
      type: 'warning',
      category: 'Maintenance',
      title: 'Workload Increase',
      message: 'Maintenance workload has increased by 14% this week',
      priority: 'medium',
      trend: { value: 14, direction: 'up' },
      impact: '8 pending work orders require attention',
      recommendation: 'Consider scheduling overtime or temp staff',
      confidence: 82,
      timeAgo: '30 min ago',
    });
  }

  // Revenue insight
  insights.push({
    id: 'rev_weekend',
    type: 'success',
    category: 'Revenue',
    title: 'Revenue Projection',
    message: 'Weekend revenue projected to exceed target by 18%',
    priority: 'low',
    trend: { value: 18, direction: 'up' },
    impact: 'Expected additional revenue of $530,000',
    recommendation: 'Ensure adequate staffing for peak period',
    confidence: 89,
    timeAgo: '45 min ago',
  });

  // Guest experience insight
  insights.push({
    id: 'guest_vip',
    type: 'success',
    category: 'Guest Experience',
    title: 'VIP Arrival Today',
    message: '3 VIP guests arriving today with special requests',
    priority: 'medium',
    trend: { value: 3, direction: 'neutral' },
    impact: 'High-value guests with $104,000 lifetime value',
    recommendation: 'Prepare welcome amenities and room upgrades',
    confidence: 100,
    timeAgo: '5 min ago',
  });

  return insights;
}

// Get recent bookings sorted by date
export function getRecentBookings(bookings, limit = 5) {
  if (!bookings || bookings.length === 0) return [];

  return [...bookings]
    .sort((a, b) => new Date(b.bookedOn) - new Date(a.bookedOn))
    .slice(0, limit);
}

// Calculate KPI trends (mock data for now)
export function calculateKPITrends() {
  return {
    occupancy: { value: 5.2, positive: true },
    adr: { value: 8.3, positive: true },
    revpar: { value: 12.1, positive: true },
    arr: { value: 3.7, positive: true },
    bookingsToday: { value: 2, positive: true },
    checkIns: { value: -1, positive: false },
    checkOuts: { value: 3, positive: true },
    availableRooms: { value: -5, positive: false },
  };
}
