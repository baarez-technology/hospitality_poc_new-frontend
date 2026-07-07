export const APP_NAME = 'J Park Inn Hotel';
export const APP_VERSION = '2.0.0';
export const APP_TAGLINE = 'Your Comfort, Our Priority';

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  SIGNUP: '/signup',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
  DASHBOARD: '/dashboard',
  ROOMS: '/rooms',
  BOOKING: '/booking',
  PROFILE: '/profile',
} as const;

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/api/v1/auth/login',
    SIGNUP: '/api/v1/auth/signup',
    LOGOUT: '/api/v1/auth/logout',
    REFRESH: '/api/v1/auth/refresh',
    VERIFY_EMAIL: '/api/v1/auth/verify-email',
    ME: '/api/v1/auth/me',
    TOKEN: '/api/v1/auth/token',
    FORGOT_PASSWORD: '/api/v1/auth/forgot-password',
    RESET_PASSWORD: '/api/v1/auth/reset-password',
    VERIFY_RESET_TOKEN: '/api/v1/auth/verify-reset-token',
  },
  OTP: {
    SEND: '/api/v1/otp/send',
    VERIFY: '/api/v1/otp/verify',
  },
  ROOMS: {
    LIST: '/api/v1/rooms',
    DETAIL: (id: string) => `/api/v1/rooms/${id}`,
    AVAILABILITY: '/api/v1/rooms/availability',
  },
  BOOKINGS: {
    CREATE: '/api/v1/bookings',
    LIST: '/api/v1/bookings',
    DETAIL: (id: string) => `/api/v1/bookings/${id}`,
    UPDATE: (id: string) => `/api/v1/bookings/${id}`,
    CANCEL: (id: string) => `/api/v1/bookings/${id}/cancel`,
  },
  USERS: {
    PROFILE: '/api/v1/users/profile',
    UPDATE_PROFILE: '/api/v1/users/profile',
    CHANGE_PASSWORD: '/api/v1/users/change-password',
    PREFERENCES: '/api/v1/users/preferences',
  },
  PAYMENT_METHODS: {
    LIST: '/api/v1/payment-methods',
    CREATE: '/api/v1/payment-methods',
    UPDATE: (id: string) => `/api/v1/payment-methods/${id}`,
    DELETE: (id: string) => `/api/v1/payment-methods/${id}`,
  },
  ADMIN: {
    PAYMENT_METHODS: '/api/v1/admin/payment-methods',
    USER_PREFERENCES: '/api/v1/admin/user-preferences',
    PRECHECKINS: '/api/v1/admin/precheckins',
    BOOKINGS: '/api/v1/admin/bookings',
    DASHBOARD: '/api/v1/dashboards/admin',
    FRONTDESK_DASHBOARD: '/api/v1/dashboards/frontdesk',
    OPERATIONS_DASHBOARD: '/api/v1/dashboards/operations',
    FINANCE_DASHBOARD: '/api/v1/dashboards/finance',
  },
  GUESTS: {
    LIST: '/api/v1/guests',
    DETAIL: (id: string) => `/api/v1/guests/${id}`,
    CREATE: '/api/v1/guests',
    UPDATE: (id: string) => `/api/v1/guests/${id}`,
  },
  RESERVATIONS: {
    LIST: '/api/v1/bookings',
    DETAIL: (id: string) => `/api/v1/bookings/${id}`,
    CREATE: '/api/v1/bookings',
    UPDATE: (id: string) => `/api/v1/bookings/${id}`,
    CANCEL: (id: string) => `/api/v1/bookings/${id}/cancel`,
  },
  ROOM_TYPES: {
    LIST: '/api/v1/room-types',
    CREATE: '/api/v1/room-types',
    DETAIL: (slug: string) => `/api/v1/room-types/${slug}`,
    UPDATE: (slug: string) => `/api/v1/room-types/${slug}`,
    DELETE: (slug: string) => `/api/v1/room-types/${slug}`,
  },
  DASHBOARDS: {
    GUEST: '/api/v1/dashboards/guest',
  },
  HOTEL_SETTINGS: {
    GET: '/api/v1/hotel-settings',
    UPDATE: '/api/v1/hotel-settings',
  },
  GUEST_AI: {
    CHAT: '/api/v1/guest-ai/chat',
    CREATE_BOOKING: '/api/v1/guest-ai/create-booking',
  },
  CHANNEL_MANAGER: {
    BASE: '/api/v1/channel-manager',
    OTAS: {
      LIST: '/api/v1/channel-manager/otas',
      DETAIL: (id: string) => `/api/v1/channel-manager/otas/${id}`,
      CREATE: '/api/v1/channel-manager/otas',
      UPDATE: (id: string) => `/api/v1/channel-manager/otas/${id}`,
      DELETE: (id: string) => `/api/v1/channel-manager/otas/${id}`,
      TEST: (id: string) => `/api/v1/channel-manager/otas/${id}/test`,
      SYNC: (id: string) => `/api/v1/channel-manager/otas/${id}/sync`,
      SYNC_ALL: '/api/v1/channel-manager/otas/sync/all',
    },
    ROOM_MAPPINGS: {
      LIST: '/api/v1/channel-manager/room-mappings',
      DETAIL: (id: string) => `/api/v1/channel-manager/room-mappings/${id}`,
      CREATE: '/api/v1/channel-manager/room-mappings',
      UPDATE: (id: string) => `/api/v1/channel-manager/room-mappings/${id}`,
      DELETE: (id: string) => `/api/v1/channel-manager/room-mappings/${id}`,
      AUTO_MAP: '/api/v1/channel-manager/room-mappings/auto-map',
      VALIDATE: '/api/v1/channel-manager/room-mappings/validate',
    },
    RATES: {
      CALENDAR: '/api/v1/channel-manager/rates/calendar',
      UPDATE: (date: string, roomType: string) => `/api/v1/channel-manager/rates/calendar/${date}/${roomType}`,
      PUSH: '/api/v1/channel-manager/rates/push',
      PULL: '/api/v1/channel-manager/rates/pull',
      PARITY: '/api/v1/channel-manager/rates/parity',
    },
    RESTRICTIONS: {
      LIST: '/api/v1/channel-manager/restrictions',
      DETAIL: (id: string) => `/api/v1/channel-manager/restrictions/${id}`,
      CREATE: '/api/v1/channel-manager/restrictions',
      UPDATE: (id: string) => `/api/v1/channel-manager/restrictions/${id}`,
      DELETE: (id: string) => `/api/v1/channel-manager/restrictions/${id}`,
      TOGGLE: (id: string) => `/api/v1/channel-manager/restrictions/${id}/toggle`,
    },
    PROMOTIONS: {
      LIST: '/api/v1/channel-manager/promotions',
      DETAIL: (id: string) => `/api/v1/channel-manager/promotions/${id}`,
      CREATE: '/api/v1/channel-manager/promotions',
      UPDATE: (id: string) => `/api/v1/channel-manager/promotions/${id}`,
      DELETE: (id: string) => `/api/v1/channel-manager/promotions/${id}`,
      TOGGLE: (id: string) => `/api/v1/channel-manager/promotions/${id}/toggle`,
      APPLY: (id: string) => `/api/v1/channel-manager/promotions/${id}/apply`,
    },
    SYNC_LOGS: {
      LIST: '/api/v1/channel-manager/sync-logs',
      DETAIL: (id: string) => `/api/v1/channel-manager/sync-logs/${id}`,
      CLEAR: '/api/v1/channel-manager/sync-logs',
      EXPORT: '/api/v1/channel-manager/sync-logs/export',
    },
    STATS: {
      BASE: '/api/v1/channel-manager/stats',
      INSIGHTS: '/api/v1/channel-manager/stats/insights',
    },
  },
} as const;

export const QUERY_KEYS = {
  ROOMS: 'rooms',
  ROOM_DETAIL: 'room-detail',
  BOOKINGS: 'bookings',
  BOOKING_DETAIL: 'booking-detail',
  USER: 'user',
} as const;

// Fallback defaults — dynamic values come from useHotelInfo() hook via SettingsContext
export const CONTACT_INFO = {
  address: {
    street: 'BCM Road',
    city: 'Palvancha',
    state: 'Telangana',
    zip: '507115',
    country: 'India',
  },
  phone: '+91-6300275340',
  phone2: '+91-6300275340',
  email: 'info@jparkinn.com',
  website: 'https://jparkinn.com',
  hours: {
    frontDesk: '24/7',
    checkIn: '12:00 PM',
    checkOut: '11:00 AM',
  },
  social: {
    instagram: '',
    facebook: '',
    twitter: '',
    linkedin: '',
  },
} as const;

export const ABOUT_TEXT = 'J Park Inn Hotel offers comfortable accommodation and warm hospitality in the heart of Palvancha. Our property provides well-appointed rooms and personalized service to ensure a pleasant stay for all our guests.';