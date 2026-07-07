// Settings utility functions for Glimmora PMS

const STORAGE_KEY = 'glimmora_settings';

// Default settings structure
export const defaultSettings = {
  hotelInfo: {
    name: 'J Park Inn',
    address: '503 Orchid Sadashivpuram, Moriwali Pada, Ambernath, Kalyan, Thane - 421501, Maharashtra',
    timezone: 'Asia/Kolkata',
    currency: 'INR',
    defaultRoomType: 'deluxe',
    checkInTime: '14:00',
    checkOutTime: '11:00',
    email: 'info@glimmora.ai',
    phone: '+971 501371105',
    logo: null
  },
  roomTypes: [
    {
      id: 'rt-001',
      name: 'Standard Room',
      description: 'Comfortable room with essential amenities',
      price: 5500,
      maxOccupancy: 2,
      amenities: ['wifi', 'tv', 'ac', 'minibar'],
      inclusions: ['Breakfast', 'Wi-Fi', 'Newspaper']
    },
    {
      id: 'rt-002',
      name: 'Deluxe Room',
      description: 'Spacious room with city views',
      price: 8500,
      maxOccupancy: 3,
      amenities: ['wifi', 'tv', 'ac', 'minibar', 'safe', 'bathtub'],
      inclusions: ['Breakfast', 'Wi-Fi', 'Newspaper', 'Welcome Drink']
    },
    {
      id: 'rt-003',
      name: 'Premium Suite',
      description: 'Luxury suite with separate living area',
      price: 15000,
      maxOccupancy: 4,
      amenities: ['wifi', 'tv', 'ac', 'minibar', 'safe', 'bathtub', 'jacuzzi', 'balcony'],
      inclusions: ['Breakfast', 'Wi-Fi', 'Newspaper', 'Welcome Drink', 'Airport Transfer', 'Butler Service']
    },
    {
      id: 'rt-004',
      name: 'Presidential Suite',
      description: 'Ultimate luxury with panoramic views',
      price: 35000,
      maxOccupancy: 6,
      amenities: ['wifi', 'tv', 'ac', 'minibar', 'safe', 'bathtub', 'jacuzzi', 'balcony', 'kitchen', 'dining'],
      inclusions: ['All meals', 'Wi-Fi', 'Newspaper', 'Welcome Drink', 'Airport Transfer', 'Butler Service', 'Spa Access']
    }
  ],
  fees: [
    { id: 'fee-001', name: 'Room Tax', type: 'percentage', value: 12, description: 'GST on room charges' },
    { id: 'fee-002', name: 'Service Charge', type: 'percentage', value: 10, description: 'Service charge on total bill' },
    { id: 'fee-003', name: 'City Tax', type: 'percentage', value: 5, description: 'Municipal tax' },
    { id: 'fee-004', name: 'Extra Guest Fee', type: 'fixed', value: 1500, description: 'Per extra guest per night' },
    { id: 'fee-005', name: 'Cleaning Fee', type: 'fixed', value: 500, description: 'Deep cleaning charge' },
    { id: 'fee-006', name: 'Resort Fee', type: 'fixed', value: 2000, description: 'Access to resort amenities' }
  ],
  roles: [
    {
      id: 'role-admin',
      name: 'Administrator',
      description: 'Full system access with all permissions',
      permissions: {
        dashboard: { view: true, edit: true, delete: true },
        bookings: { view: true, edit: true, delete: true },
        guests: { view: true, edit: true, delete: true },
        rooms: { view: true, edit: true, delete: true },
        staff: { view: true, edit: true, delete: true },
        housekeeping: { view: true, edit: true, delete: true },
        maintenance: { view: true, edit: true, delete: true },
        aiAssistant: { view: true, edit: true, delete: true },
        revenueAI: { view: true, edit: true, delete: true },
        reputationAI: { view: true, edit: true, delete: true },
        crmAI: { view: true, edit: true, delete: true },
        reports: { view: true, edit: true, delete: true },
        settings: { view: true, edit: true, delete: true }
      }
    },
    {
      id: 'role-general_manager',
      name: 'General Manager',
      description: 'Senior management with broad operational access',
      permissions: {
        dashboard: { view: true, edit: true, delete: false },
        bookings: { view: true, edit: true, delete: true },
        guests: { view: true, edit: true, delete: true },
        rooms: { view: true, edit: true, delete: true },
        staff: { view: true, edit: true, delete: false },
        housekeeping: { view: true, edit: true, delete: false },
        maintenance: { view: true, edit: true, delete: false },
        aiAssistant: { view: true, edit: true, delete: false },
        revenueAI: { view: true, edit: true, delete: true },
        reputationAI: { view: true, edit: true, delete: false },
        crmAI: { view: true, edit: true, delete: false },
        reports: { view: true, edit: true, delete: true },
        settings: { view: true, edit: false, delete: false }
      }
    },
    {
      id: 'role-front_office_manager',
      name: 'Front Office Manager',
      description: 'Manages front desk operations and guest services',
      permissions: {
        dashboard: { view: true, edit: false, delete: false },
        bookings: { view: true, edit: true, delete: true },
        guests: { view: true, edit: true, delete: true },
        rooms: { view: true, edit: true, delete: false },
        staff: { view: true, edit: false, delete: false },
        housekeeping: { view: false, edit: false, delete: false },
        maintenance: { view: false, edit: false, delete: false },
        aiAssistant: { view: true, edit: false, delete: false },
        revenueAI: { view: true, edit: false, delete: false },
        reputationAI: { view: true, edit: false, delete: false },
        crmAI: { view: true, edit: true, delete: false },
        reports: { view: true, edit: false, delete: false },
        settings: { view: false, edit: false, delete: false }
      }
    },
    {
      id: 'role-duty_manager',
      name: 'Duty Manager',
      description: 'On-duty operational oversight and incident handling',
      permissions: {
        dashboard: { view: true, edit: false, delete: false },
        bookings: { view: true, edit: true, delete: false },
        guests: { view: true, edit: true, delete: false },
        rooms: { view: true, edit: true, delete: false },
        staff: { view: true, edit: false, delete: false },
        housekeeping: { view: false, edit: false, delete: false },
        maintenance: { view: true, edit: true, delete: false },
        aiAssistant: { view: true, edit: false, delete: false },
        revenueAI: { view: false, edit: false, delete: false },
        reputationAI: { view: true, edit: false, delete: false },
        crmAI: { view: false, edit: false, delete: false },
        reports: { view: true, edit: false, delete: false },
        settings: { view: false, edit: false, delete: false }
      }
    },
    {
      id: 'role-receptionist',
      name: 'Receptionist',
      description: 'Handles check-ins, check-outs and guest queries',
      permissions: {
        dashboard: { view: true, edit: false, delete: false },
        bookings: { view: true, edit: true, delete: false },
        guests: { view: true, edit: true, delete: false },
        rooms: { view: true, edit: false, delete: false },
        staff: { view: false, edit: false, delete: false },
        housekeeping: { view: false, edit: false, delete: false },
        maintenance: { view: false, edit: false, delete: false },
        aiAssistant: { view: true, edit: false, delete: false },
        revenueAI: { view: false, edit: false, delete: false },
        reputationAI: { view: false, edit: false, delete: false },
        crmAI: { view: false, edit: false, delete: false },
        reports: { view: false, edit: false, delete: false },
        settings: { view: false, edit: false, delete: false }
      }
    },
    {
      id: 'role-reservation_manager',
      name: 'Reservation Manager',
      description: 'Manages bookings, availability and channel distribution',
      permissions: {
        dashboard: { view: true, edit: false, delete: false },
        bookings: { view: true, edit: true, delete: true },
        guests: { view: true, edit: true, delete: false },
        rooms: { view: true, edit: true, delete: false },
        staff: { view: false, edit: false, delete: false },
        housekeeping: { view: false, edit: false, delete: false },
        maintenance: { view: false, edit: false, delete: false },
        aiAssistant: { view: true, edit: false, delete: false },
        revenueAI: { view: true, edit: false, delete: false },
        reputationAI: { view: false, edit: false, delete: false },
        crmAI: { view: true, edit: true, delete: false },
        reports: { view: true, edit: false, delete: false },
        settings: { view: false, edit: false, delete: false }
      }
    },
    {
      id: 'role-housekeeping_manager',
      name: 'Housekeeping Manager',
      description: 'Oversees room cleaning and housekeeping staff',
      permissions: {
        dashboard: { view: true, edit: false, delete: false },
        bookings: { view: true, edit: false, delete: false },
        guests: { view: true, edit: false, delete: false },
        rooms: { view: true, edit: true, delete: false },
        staff: { view: true, edit: false, delete: false },
        housekeeping: { view: true, edit: true, delete: true },
        maintenance: { view: true, edit: true, delete: false },
        aiAssistant: { view: true, edit: false, delete: false },
        revenueAI: { view: false, edit: false, delete: false },
        reputationAI: { view: false, edit: false, delete: false },
        crmAI: { view: false, edit: false, delete: false },
        reports: { view: true, edit: false, delete: false },
        settings: { view: false, edit: false, delete: false }
      }
    },
    {
      id: 'role-housekeeper',
      name: 'Housekeeper',
      description: 'Performs room cleaning and maintenance tasks',
      permissions: {
        dashboard: { view: false, edit: false, delete: false },
        bookings: { view: false, edit: false, delete: false },
        guests: { view: false, edit: false, delete: false },
        rooms: { view: true, edit: false, delete: false },
        staff: { view: false, edit: false, delete: false },
        housekeeping: { view: true, edit: true, delete: false },
        maintenance: { view: true, edit: true, delete: false },
        aiAssistant: { view: true, edit: false, delete: false },
        revenueAI: { view: false, edit: false, delete: false },
        reputationAI: { view: false, edit: false, delete: false },
        crmAI: { view: false, edit: false, delete: false },
        reports: { view: false, edit: false, delete: false },
        settings: { view: false, edit: false, delete: false }
      }
    },
    {
      id: 'role-revenue_manager',
      name: 'Revenue Manager',
      description: 'Manages pricing, revenue optimization and analytics',
      permissions: {
        dashboard: { view: true, edit: false, delete: false },
        bookings: { view: true, edit: true, delete: false },
        guests: { view: false, edit: false, delete: false },
        rooms: { view: true, edit: false, delete: false },
        staff: { view: false, edit: false, delete: false },
        housekeeping: { view: false, edit: false, delete: false },
        maintenance: { view: false, edit: false, delete: false },
        aiAssistant: { view: true, edit: false, delete: false },
        revenueAI: { view: true, edit: true, delete: true },
        reputationAI: { view: true, edit: false, delete: false },
        crmAI: { view: true, edit: false, delete: false },
        reports: { view: true, edit: true, delete: true },
        settings: { view: false, edit: false, delete: false }
      }
    },
    {
      id: 'role-accounts_manager',
      name: 'Accounts Manager',
      description: 'Handles financial reporting and billing operations',
      permissions: {
        dashboard: { view: true, edit: false, delete: false },
        bookings: { view: true, edit: true, delete: false },
        guests: { view: true, edit: true, delete: false },
        rooms: { view: false, edit: false, delete: false },
        staff: { view: false, edit: false, delete: false },
        housekeeping: { view: false, edit: false, delete: false },
        maintenance: { view: false, edit: false, delete: false },
        aiAssistant: { view: false, edit: false, delete: false },
        revenueAI: { view: true, edit: false, delete: false },
        reputationAI: { view: false, edit: false, delete: false },
        crmAI: { view: false, edit: false, delete: false },
        reports: { view: true, edit: true, delete: true },
        settings: { view: false, edit: false, delete: false }
      }
    }
  ],
  integrations: {
    channelManager: {
      enabled: true,
      provider: 'SiteMinder',
      apiKey: '',
      syncInterval: 15
    },
    paymentGateway: {
      enabled: true,
      provider: 'Razorpay',
      apiKey: '',
      secretKey: '',
      testMode: true
    },
    emailProvider: {
      enabled: true,
      provider: 'SendGrid',
      apiKey: '',
      fromEmail: 'noreply@glimmora.com',
      fromName: 'Glimmora Hotel'
    },
    smsProvider: {
      enabled: true,
      provider: 'Twilio',
      accountSid: '',
      authToken: '',
      fromNumber: ''
    },
    otaSync: {
      bookingCom: { enabled: true, syncInterval: 30 },
      expedia: { enabled: true, syncInterval: 30 },
      agoda: { enabled: false, syncInterval: 60 },
      mmt: { enabled: true, syncInterval: 30 }
    },
    webhooks: {
      bookingCreated: '',
      bookingCancelled: '',
      guestCheckIn: '',
      guestCheckOut: ''
    },
    encryption: true
  },
  notifications: {
    triggers: {
      newBooking: { enabled: true, channels: ['email', 'push'] },
      cancellation: { enabled: true, channels: ['email', 'sms'] },
      hkDelay: { enabled: true, channels: ['push'] },
      maintenanceIssue: { enabled: true, channels: ['push', 'sms'] },
      vipArrival: { enabled: true, channels: ['email', 'push', 'sms'] },
      revenueAlert: { enabled: true, channels: ['email'] },
      badReview: { enabled: true, channels: ['email', 'push'] },
      autoCreateWorkOrder: { enabled: true, channels: ['push'] },
      autoAssignHousekeeping: { enabled: true, channels: ['push'] }
    },
    channels: {
      email: { enabled: true },
      sms: { enabled: true },
      push: { enabled: true }
    }
  },
  branding: {
    primaryColor: '#A57865',
    accentColor: '#4E5840',
    buttonStyle: 'rounded',
    sidebarBg: '#FAF7F4',
    fontFamily: 'Inter',
    logo: null,
    favicon: null
  },
  staffPortal: {
    shiftPolicies: {
      defaultShiftDuration: 8,
      maxShiftDuration: 12,
      breakDuration: 60,
      breakAfterHours: 4,
      lateThresholdMinutes: 15,
      autoEndShiftAfterHours: 10,
      overtimeAlertThreshold: 2
    },
    housekeeping: {
      autoAssignRooms: true,
      maxRoomsPerShift: 15,
      priorityVIP: true,
      priorityCheckout: true,
      turnoverTargetMinutes: 45
    },
    maintenance: {
      autoCreateWorkOrder: true,
      urgentResponseMinutes: 30,
      normalResponseMinutes: 120,
      escalationAfterMinutes: 60
    },
    runner: {
      slaWarningMinutes: 10,
      slaBreachMinutes: 20,
      maxConcurrentTasks: 5,
      priorityVIP: true
    },
    roleMapping: {
      housekeeping: 'hk-dashboard',
      maintenance: 'work-orders',
      runner: 'runner-dashboard',
      frontDesk: 'front-desk',
      manager: 'manager-dashboard'
    }
  },
  ai: {
    revenueAI: {
      forecastInterval: 'daily',
      aggressivenessLevel: 'moderate',
      rateUpdatePolicy: 'manual',
      minRateChange: 5,
      maxRateChange: 30,
      competitorTracking: true
    },
    reputationAI: {
      autoResponse: true,
      autoResponseDelay: 24,
      sentimentThreshold: 40,
      alertOnNegative: true,
      escalateThreshold: 20,
      responseTemplates: true
    },
    crmAI: {
      churnThreshold: 30,
      upgradeLikelihoodCutoff: 70,
      returnProbabilityWindow: 365,
      segmentationEnabled: true,
      autoTagging: true
    },
    baarezAssistant: {
      enabled: true,
      wakeWord: true,
      micAutoStart: false,
      commandSensitivity: 'medium',
      voiceResponse: true,
      language: 'en-IN'
    }
  }
};

// Load settings from localStorage
export const loadSettings = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return deepMerge(defaultSettings, parsed);
    }
    return defaultSettings;
  } catch (error) {
    console.error('Error loading settings:', error);
    return defaultSettings;
  }
};

// Save settings to localStorage
export const saveSettings = (settings) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    return true;
  } catch (error) {
    console.error('Error saving settings:', error);
    return false;
  }
};

// Deep merge utility
export const deepMerge = (target, source) => {
  const result = { ...target };
  for (const key in source) {
    // Don't deep merge arrays - just use the source array directly
    if (Array.isArray(source[key])) {
      result[key] = source[key];
    } else if (source[key] instanceof Object && key in target && !Array.isArray(target[key])) {
      result[key] = deepMerge(target[key], source[key]);
    } else {
      result[key] = source[key];
    }
  }
  return result;
};

// Generate unique ID
export const generateId = (prefix = 'id') => {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

// Validate settings
export const validateSettings = (settings, section) => {
  const errors = {};

  switch (section) {
    case 'hotelInfo':
      if (!settings.name?.trim()) errors.name = 'Hotel name is required';
      if (!settings.email?.trim()) errors.email = 'Email is required';
      if (settings.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(settings.email)) {
        errors.email = 'Invalid email format';
      }
      if (!settings.phone?.trim()) errors.phone = 'Phone is required';
      break;

    case 'roomType':
      if (!settings.name?.trim()) errors.name = 'Room type name is required';
      if (!settings.price || settings.price <= 0) errors.price = 'Valid price is required';
      if (!settings.maxOccupancy || settings.maxOccupancy <= 0) {
        errors.maxOccupancy = 'Valid occupancy is required';
      }
      break;

    case 'fee':
      if (!settings.name?.trim()) errors.name = 'Fee name is required';
      if (settings.value === undefined || settings.value < 0) {
        errors.value = 'Valid value is required';
      }
      if (!settings.type) errors.type = 'Fee type is required';
      break;

    default:
      break;
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// Available amenities
export const AMENITIES = [
  { id: 'wifi', label: 'Wi-Fi', icon: 'Wifi' },
  { id: 'tv', label: 'Smart TV', icon: 'Tv' },
  { id: 'ac', label: 'Air Conditioning', icon: 'Snowflake' },
  { id: 'minibar', label: 'Mini Bar', icon: 'Wine' },
  { id: 'safe', label: 'In-room Safe', icon: 'Lock' },
  { id: 'bathtub', label: 'Bathtub', icon: 'Bath' },
  { id: 'jacuzzi', label: 'Jacuzzi', icon: 'Waves' },
  { id: 'balcony', label: 'Balcony', icon: 'Sun' },
  { id: 'kitchen', label: 'Kitchenette', icon: 'UtensilsCrossed' },
  { id: 'dining', label: 'Dining Area', icon: 'Utensils' },
  { id: 'workspace', label: 'Work Desk', icon: 'Laptop' },
  { id: 'coffee', label: 'Coffee Maker', icon: 'Coffee' }
];

// Available timezones
export const TIMEZONES = [
  { value: 'Asia/Kolkata', label: 'India (IST)' },
  { value: 'Asia/Dubai', label: 'Dubai (GST)' },
  { value: 'Asia/Singapore', label: 'Singapore (SGT)' },
  { value: 'Europe/London', label: 'London (GMT/BST)' },
  { value: 'America/New_York', label: 'New York (EST/EDT)' },
  { value: 'America/Los_Angeles', label: 'Los Angeles (PST/PDT)' }
];

// Available currencies
export const CURRENCIES = [
  { value: 'INR', label: 'Indian Rupee (₹)', symbol: '₹' },
  { value: 'USD', label: 'US Dollar ($)', symbol: '$' },
  { value: 'EUR', label: 'Euro (€)', symbol: '€' },
  { value: 'GBP', label: 'British Pound (£)', symbol: '£' },
  { value: 'AED', label: 'UAE Dirham (د.إ)', symbol: 'د.إ' },
  { value: 'SGD', label: 'Singapore Dollar (S$)', symbol: 'S$' }
];

// Permission modules
export const PERMISSION_MODULES = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'bookings', label: 'Bookings' },
  { id: 'guests', label: 'Guests' },
  { id: 'rooms', label: 'Rooms' },
  { id: 'staff', label: 'Staff' },
  { id: 'housekeeping', label: 'Housekeeping' },
  { id: 'maintenance', label: 'Maintenance' },
  { id: 'aiAssistant', label: 'AI Assistant' },
  { id: 'revenueAI', label: 'Revenue AI' },
  { id: 'reputationAI', label: 'Reputation AI' },
  { id: 'crmAI', label: 'CRM AI' },
  { id: 'reports', label: 'Reports' },
  { id: 'settings', label: 'Settings' },
];

// Font families
export const FONT_FAMILIES = [
  { value: 'Inter', label: 'Inter' },
  { value: 'Poppins', label: 'Poppins' },
  { value: 'Roboto', label: 'Roboto' },
  { value: 'Open Sans', label: 'Open Sans' },
  { value: 'Lato', label: 'Lato' },
  { value: 'Playfair Display', label: 'Playfair Display' }
];

// Integration providers
export const INTEGRATION_PROVIDERS = {
  channelManager: ['SiteMinder', 'RateGain', 'D-EDGE', 'TravelClick'],
  paymentGateway: ['Razorpay', 'Stripe', 'PayU', 'CCAvenue'],
  emailProvider: ['SendGrid', 'Mailgun', 'Amazon SES', 'Postmark'],
  smsProvider: ['Twilio', 'MSG91', 'Kaleyra', 'Gupshup']
};
