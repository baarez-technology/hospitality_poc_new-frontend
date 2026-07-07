/**
 * Notification Options
 * Default notification settings
 */

export const defaultNotificationSettings = {
  email: {
    enabled: true,
    newBooking: true,
    cancellation: true,
    checkIn: true,
    checkOut: true,
    payment: true,
    review: true,
    lowInventory: false
  },
  sms: {
    enabled: false,
    urgentOnly: true,
    checkIn: false,
    checkOut: false,
    payment: false
  },
  staff: {
    housekeepingAlerts: true,
    maintenanceAlerts: true,
    guestRequests: true,
    lowInventory: true
  },
  revenue: {
    dailyReports: true,
    weeklyReports: true,
    priceAlerts: true,
    occupancyAlerts: true
  }
};

export const notificationCategories = {
  email: {
    label: 'Email Notifications',
    description: 'Configure email alerts for booking and guest events',
    icon: 'Mail',
    color: 'blue'
  },
  sms: {
    label: 'SMS Notifications',
    description: 'Text message alerts for urgent events',
    icon: 'MessageSquare',
    color: 'green'
  },
  staff: {
    label: 'Staff Notifications',
    description: 'Alerts for housekeeping and maintenance teams',
    icon: 'Users',
    color: 'purple'
  },
  revenue: {
    label: 'Revenue Alerts',
    description: 'Reports and revenue-related notifications',
    icon: 'DollarSign',
    color: 'amber'
  }
};
