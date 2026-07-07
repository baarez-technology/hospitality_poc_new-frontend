/**
 * Settings Data
 * Dummy data for all settings sections
 */

// General Settings
export const generalSettings = {
  hotelName: "J Park Inn Hotel",
  logo: "/logo.png",
  timezone: "Asia/Kolkata",
  currency: "INR",
  primaryContact: {
    name: "J Park Inn Support",
    email: "info@jparkinn.com",
    phone: "+91-6300275340"
  },
  address: {
    street: "BCM Road",
    city: "Palvancha",
    state: "Telangana",
    zipCode: "507115",
    country: "India"
  },
  brandColors: {
    primary: "#8B5CF6",
    secondary: "#EC4899",
    accent: "#F59E0B"
  }
};

// Users Data
export const usersData = [
  {
    id: 1,
    name: "Sarah Johnson",
    email: "sarah@glimmora.com",
    role: "Admin",
    active: true,
    avatar: null,
    lastLogin: "2024-01-15T10:30:00Z",
    createdAt: "2023-06-01T08:00:00Z"
  },
  {
    id: 2,
    name: "Michael Chen",
    email: "michael@glimmora.com",
    role: "Manager",
    active: true,
    avatar: null,
    lastLogin: "2024-01-15T09:15:00Z",
    createdAt: "2023-07-15T10:00:00Z"
  },
  {
    id: 3,
    name: "Emma Davis",
    email: "emma@glimmora.com",
    role: "Front Desk",
    active: true,
    avatar: null,
    lastLogin: "2024-01-14T16:45:00Z",
    createdAt: "2023-08-20T12:00:00Z"
  },
  {
    id: 4,
    name: "James Wilson",
    email: "james@glimmora.com",
    role: "Housekeeping Manager",
    active: true,
    avatar: null,
    lastLogin: "2024-01-15T07:20:00Z",
    createdAt: "2023-09-10T09:00:00Z"
  },
  {
    id: 5,
    name: "Lisa Anderson",
    email: "lisa@glimmora.com",
    role: "Revenue Manager",
    active: true,
    avatar: null,
    lastLogin: "2024-01-14T18:30:00Z",
    createdAt: "2023-10-05T11:00:00Z"
  },
  {
    id: 6,
    name: "David Martinez",
    email: "david@glimmora.com",
    role: "Front Desk",
    active: false,
    avatar: null,
    lastLogin: "2023-12-20T14:00:00Z",
    createdAt: "2023-05-15T08:30:00Z"
  },
  {
    id: 7,
    name: "Sophie Taylor",
    email: "sophie@glimmora.com",
    role: "Manager",
    active: true,
    avatar: null,
    lastLogin: "2024-01-15T08:00:00Z",
    createdAt: "2023-11-01T10:00:00Z"
  },
  {
    id: 8,
    name: "Robert Brown",
    email: "robert@glimmora.com",
    role: "Maintenance",
    active: true,
    avatar: null,
    lastLogin: "2024-01-15T06:30:00Z",
    createdAt: "2023-07-01T09:00:00Z"
  },
  {
    id: 9,
    name: "Maria Garcia",
    email: "maria@glimmora.com",
    role: "Housekeeping",
    active: true,
    avatar: null,
    lastLogin: "2024-01-15T07:00:00Z",
    createdAt: "2023-08-15T08:00:00Z"
  },
  {
    id: 10,
    name: "Tom Harris",
    email: "tom@glimmora.com",
    role: "Guest Services",
    active: true,
    avatar: null,
    lastLogin: "2024-01-14T20:00:00Z",
    createdAt: "2023-09-20T10:30:00Z"
  }
];

// Roles Data
export const rolesData = [
  {
    id: 1,
    name: "Admin",
    description: "Full system access",
    userCount: 1,
    color: "#8B5CF6"
  },
  {
    id: 2,
    name: "Manager",
    description: "Manage operations and staff",
    userCount: 2,
    color: "#EC4899"
  },
  {
    id: 3,
    name: "Front Desk",
    description: "Guest check-in/out and bookings",
    userCount: 2,
    color: "#3B82F6"
  },
  {
    id: 4,
    name: "Housekeeping Manager",
    description: "Manage housekeeping operations",
    userCount: 1,
    color: "#10B981"
  },
  {
    id: 5,
    name: "Housekeeping",
    description: "Room cleaning and maintenance",
    userCount: 1,
    color: "#6EE7B7"
  },
  {
    id: 6,
    name: "Revenue Manager",
    description: "Pricing and revenue optimization",
    userCount: 1,
    color: "#F59E0B"
  },
  {
    id: 7,
    name: "Maintenance",
    description: "Building and equipment maintenance",
    userCount: 1,
    color: "#EF4444"
  },
  {
    id: 8,
    name: "Guest Services",
    description: "Guest assistance and concierge",
    userCount: 1,
    color: "#8B5CF6"
  }
];

// Permissions Data
export const permissionsData = {
  modules: [
    {
      id: "dashboard",
      name: "Dashboard",
      description: "View main dashboard and analytics",
      roles: {
        Admin: true,
        Manager: true,
        "Front Desk": true,
        "Housekeeping Manager": true,
        Housekeeping: false,
        "Revenue Manager": true,
        Maintenance: false,
        "Guest Services": true
      }
    },
    {
      id: "bookings",
      name: "Bookings",
      description: "Manage reservations and bookings",
      roles: {
        Admin: true,
        Manager: true,
        "Front Desk": true,
        "Housekeeping Manager": false,
        Housekeeping: false,
        "Revenue Manager": true,
        Maintenance: false,
        "Guest Services": true
      }
    },
    {
      id: "guests",
      name: "Guests (CRM)",
      description: "Manage guest profiles and history",
      roles: {
        Admin: true,
        Manager: true,
        "Front Desk": true,
        "Housekeeping Manager": false,
        Housekeeping: false,
        "Revenue Manager": true,
        Maintenance: false,
        "Guest Services": true
      }
    },
    {
      id: "rooms",
      name: "Rooms",
      description: "View and manage room inventory",
      roles: {
        Admin: true,
        Manager: true,
        "Front Desk": true,
        "Housekeeping Manager": true,
        Housekeeping: true,
        "Revenue Manager": true,
        Maintenance: true,
        "Guest Services": false
      }
    },
    {
      id: "housekeeping",
      name: "Housekeeping",
      description: "Manage cleaning and maintenance tasks",
      roles: {
        Admin: true,
        Manager: true,
        "Front Desk": false,
        "Housekeeping Manager": true,
        Housekeeping: true,
        "Revenue Manager": false,
        Maintenance: true,
        "Guest Services": false
      }
    },
    {
      id: "revenue",
      name: "Revenue & Analytics",
      description: "View revenue reports and analytics",
      roles: {
        Admin: true,
        Manager: true,
        "Front Desk": false,
        "Housekeeping Manager": false,
        Housekeeping: false,
        "Revenue Manager": true,
        Maintenance: false,
        "Guest Services": false
      }
    },
    {
      id: "reputation",
      name: "Reputation & Reviews",
      description: "Manage reviews and reputation",
      roles: {
        Admin: true,
        Manager: true,
        "Front Desk": true,
        "Housekeeping Manager": false,
        Housekeeping: false,
        "Revenue Manager": false,
        Maintenance: false,
        "Guest Services": true
      }
    },
    {
      id: "staff",
      name: "Staff Management",
      description: "Manage staff and schedules",
      roles: {
        Admin: true,
        Manager: true,
        "Front Desk": false,
        "Housekeeping Manager": true,
        Housekeeping: false,
        "Revenue Manager": false,
        Maintenance: false,
        "Guest Services": false
      }
    },
    {
      id: "ai",
      name: "AI Assistant",
      description: "Access Glimmora AI assistant",
      roles: {
        Admin: true,
        Manager: true,
        "Front Desk": true,
        "Housekeeping Manager": true,
        Housekeeping: false,
        "Revenue Manager": true,
        Maintenance: false,
        "Guest Services": true
      }
    },
    {
      id: "settings",
      name: "Settings",
      description: "Access system settings",
      roles: {
        Admin: true,
        Manager: false,
        "Front Desk": false,
        "Housekeeping Manager": false,
        Housekeeping: false,
        "Revenue Manager": false,
        Maintenance: false,
        "Guest Services": false
      }
    }
  ]
};

// Notifications Settings
export const notificationsSettings = {
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

// AI Assistant Settings
export const aiSettings = {
  voiceEnabled: true,
  autoSuggestionsEnabled: true,
  executeActions: false,
  replyStyle: "professional", // professional, friendly, short, detailed
  modules: {
    housekeeping: true,
    crm: true,
    revenue: true,
    reputation: true,
    bookings: true
  },
  permissions: {
    viewData: true,
    executeCommands: false,
    modifySettings: false
  }
};

// Billing Data
export const billingData = {
  currentPlan: {
    name: "Pro",
    price: 49,
    currency: "INR",
    billingCycle: "month",
    roomsLimit: 100,
    features: [
      "Unlimited bookings",
      "CRM & Guest profiles",
      "Revenue analytics",
      "AI Assistant",
      "Multi-user access",
      "Email support",
      "API access"
    ]
  },
  usage: {
    rooms: 85,
    roomsLimit: 100,
    users: 10,
    usersLimit: 20,
    bookingsThisMonth: 342,
    storageUsed: "2.4 GB",
    storageLimit: "10 GB"
  },
  paymentMethod: {
    type: "Visa",
    last4: "4242",
    expiryMonth: 12,
    expiryYear: 2025
  },
  billingHistory: [
    { date: "2024-01-01", amount: 49, status: "paid", invoice: "INV-2024-001" },
    { date: "2023-12-01", amount: 49, status: "paid", invoice: "INV-2023-012" },
    { date: "2023-11-01", amount: 49, status: "paid", invoice: "INV-2023-011" }
  ],
  availablePlans: [
    {
      name: "Starter",
      price: 19,
      roomsLimit: 25,
      usersLimit: 5,
      features: ["Basic bookings", "Email support"]
    },
    {
      name: "Pro",
      price: 49,
      roomsLimit: 100,
      usersLimit: 20,
      features: ["Everything in Starter", "CRM", "Revenue analytics", "AI Assistant"],
      current: true
    },
    {
      name: "Enterprise",
      price: 199,
      roomsLimit: 500,
      usersLimit: 100,
      features: ["Everything in Pro", "Custom integrations", "Priority support", "Dedicated account manager"]
    }
  ]
};

// Integrations Data
export const integrationsData = [
  {
    id: "booking-com",
    name: "Booking.com",
    description: "Connect to Booking.com for seamless reservation management",
    logo: "🏨",
    category: "OTA",
    connected: true,
    status: "active",
    lastSync: "2024-01-15T10:00:00Z",
    config: {
      apiKey: "bdc_*********************",
      propertyId: "12345678"
    }
  },
  {
    id: "expedia",
    name: "Expedia",
    description: "Integrate with Expedia to expand your reach",
    logo: "✈️",
    category: "OTA",
    connected: true,
    status: "active",
    lastSync: "2024-01-15T09:30:00Z",
    config: {
      hotelId: "87654321"
    }
  },
  {
    id: "airbnb",
    name: "Airbnb",
    description: "List your property on Airbnb",
    logo: "🏠",
    category: "OTA",
    connected: false,
    status: "available",
    lastSync: null,
    config: null
  },
  {
    id: "stripe",
    name: "Stripe",
    description: "Accept payments with Stripe",
    logo: "💳",
    category: "Payment",
    connected: true,
    status: "active",
    lastSync: "2024-01-15T10:15:00Z",
    config: {
      publishableKey: "pk_*********************"
    }
  },
  {
    id: "channel-manager",
    name: "Channel Manager",
    description: "Centralized distribution management",
    logo: "📊",
    category: "Distribution",
    connected: false,
    status: "available",
    lastSync: null,
    config: null
  },
  {
    id: "mailchimp",
    name: "Mailchimp",
    description: "Email marketing automation",
    logo: "📧",
    category: "Marketing",
    connected: false,
    status: "available",
    lastSync: null,
    config: null
  },
  {
    id: "google-analytics",
    name: "Google Analytics",
    description: "Website analytics and tracking",
    logo: "📈",
    category: "Analytics",
    connected: true,
    status: "active",
    lastSync: "2024-01-15T10:30:00Z",
    config: {
      trackingId: "UA-***********"
    }
  },
  {
    id: "tripadvisor",
    name: "TripAdvisor",
    description: "Reputation management",
    logo: "🦉",
    category: "Reputation",
    connected: false,
    status: "available",
    lastSync: null,
    config: null
  }
];
