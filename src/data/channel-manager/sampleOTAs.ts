/**
 * Sample OTA Connections Data
 * Pre-configured OTA integrations
 */

export const sampleOTAs = [
  {
    id: 'ota-001',
    name: 'Booking.com',
    code: 'BOOKING',
    logo: 'https://cf.bstatic.com/static/img/favicon/9ca83ba2a5a3293ff07452cb24949a5843af4592.svg',
    status: 'connected',
    lastSync: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    nextSync: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
    credentials: {
      username: 'glimmora_hotel',
      apiKey: 'bk_live_xxxxx',
      hotelId: 'BK-12345678'
    },
    syncSettings: {
      autoSync: true,
      syncInterval: 5,
      syncRates: true,
      syncAvailability: true,
      syncRestrictions: true
    },
    stats: {
      totalBookings: 156,
      revenue: 45600,
      avgRating: 8.7,
      commission: 15
    },
    color: '#003580'
  },
  {
    id: 'ota-002',
    name: 'Expedia',
    code: 'EXPEDIA',
    logo: 'https://www.expedia.com/favicon.ico',
    status: 'connected',
    lastSync: new Date(Date.now() - 8 * 60 * 1000).toISOString(),
    nextSync: new Date(Date.now() + 2 * 60 * 1000).toISOString(),
    credentials: {
      username: 'glimmora_exp',
      apiKey: 'exp_api_xxxxx',
      hotelId: 'EXP-987654'
    },
    syncSettings: {
      autoSync: true,
      syncInterval: 5,
      syncRates: true,
      syncAvailability: true,
      syncRestrictions: true
    },
    stats: {
      totalBookings: 89,
      revenue: 28900,
      avgRating: 4.2,
      commission: 18
    },
    color: '#FFD700'
  },
  {
    id: 'ota-003',
    name: 'Agoda',
    code: 'AGODA',
    logo: 'https://www.agoda.com/favicon.ico',
    status: 'connected',
    lastSync: new Date(Date.now() - 3 * 60 * 1000).toISOString(),
    nextSync: new Date(Date.now() + 7 * 60 * 1000).toISOString(),
    credentials: {
      username: 'glimmora_agoda',
      apiKey: 'ag_key_xxxxx',
      hotelId: 'AG-456789'
    },
    syncSettings: {
      autoSync: true,
      syncInterval: 5,
      syncRates: true,
      syncAvailability: true,
      syncRestrictions: false
    },
    stats: {
      totalBookings: 67,
      revenue: 19800,
      avgRating: 8.4,
      commission: 17
    },
    color: '#E51937'
  },
  {
    id: 'ota-004',
    name: 'Airbnb',
    code: 'AIRBNB',
    logo: 'https://www.airbnb.com/favicon.ico',
    status: 'disconnected',
    lastSync: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    nextSync: null,
    credentials: {
      username: '',
      apiKey: '',
      hotelId: ''
    },
    syncSettings: {
      autoSync: false,
      syncInterval: 10,
      syncRates: true,
      syncAvailability: true,
      syncRestrictions: false
    },
    stats: {
      totalBookings: 23,
      revenue: 8900,
      avgRating: 4.8,
      commission: 3
    },
    color: '#FF5A5F'
  },
  {
    id: 'ota-005',
    name: 'MakeMyTrip',
    code: 'MMT',
    logo: 'https://www.makemytrip.com/favicon.ico',
    status: 'connected',
    lastSync: new Date(Date.now() - 12 * 60 * 1000).toISOString(),
    nextSync: new Date(Date.now() + 3 * 60 * 1000).toISOString(),
    credentials: {
      username: 'glimmora_mmt',
      apiKey: 'mmt_live_xxxxx',
      hotelId: 'MMT-789012'
    },
    syncSettings: {
      autoSync: true,
      syncInterval: 5,
      syncRates: true,
      syncAvailability: true,
      syncRestrictions: true
    },
    stats: {
      totalBookings: 45,
      revenue: 12300,
      avgRating: 4.1,
      commission: 20
    },
    color: '#F97316'
  },
  {
    id: 'ota-006',
    name: 'Trip.com',
    code: 'TRIP',
    logo: 'https://www.trip.com/favicon.ico',
    status: 'error',
    lastSync: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    nextSync: null,
    errorMessage: 'API authentication failed - please update credentials',
    credentials: {
      username: 'glimmora_trip',
      apiKey: 'trip_expired_xxxxx',
      hotelId: 'TRIP-345678'
    },
    syncSettings: {
      autoSync: true,
      syncInterval: 5,
      syncRates: true,
      syncAvailability: true,
      syncRestrictions: true
    },
    stats: {
      totalBookings: 34,
      revenue: 9800,
      avgRating: 4.3,
      commission: 16
    },
    color: '#06B6D4'
  },
  {
    id: 'ota-007',
    name: 'Google Hotel Ads',
    code: 'GOOGLE',
    logo: 'https://www.google.com/favicon.ico',
    status: 'connected',
    lastSync: new Date(Date.now() - 1 * 60 * 1000).toISOString(),
    nextSync: new Date(Date.now() + 9 * 60 * 1000).toISOString(),
    credentials: {
      username: 'glimmora_google',
      apiKey: 'goog_api_xxxxx',
      hotelId: 'GOOG-567890'
    },
    syncSettings: {
      autoSync: true,
      syncInterval: 10,
      syncRates: true,
      syncAvailability: true,
      syncRestrictions: false
    },
    stats: {
      totalBookings: 78,
      revenue: 32100,
      avgRating: 4.6,
      commission: 10
    },
    color: '#10B981'
  }
];

export const otaStatusConfig = {
  connected: { label: 'Connected', color: 'text-emerald-600', bg: 'bg-emerald-100', dot: 'bg-emerald-500' },
  disconnected: { label: 'Disconnected', color: 'text-neutral-500', bg: 'bg-neutral-100', dot: 'bg-neutral-400' },
  error: { label: 'Error', color: 'text-rose-600', bg: 'bg-rose-100', dot: 'bg-rose-500' },
  syncing: { label: 'Syncing', color: 'text-blue-600', bg: 'bg-blue-100', dot: 'bg-blue-500' }
};

export const availableOTAs = [
  { name: 'Dummy Channel Manager', code: 'DUMMY', color: '#7B68EE', description: 'Test channel for development' },
  { name: 'Booking.com', code: 'BOOKING', color: '#003580', description: 'World\'s largest online travel agency' },
  { name: 'Expedia', code: 'EXPEDIA', color: '#FFD700', description: 'Global travel platform with wide reach' },
  { name: 'Agoda', code: 'AGODA', color: '#E51937', description: 'Asia-focused travel platform' },
  { name: 'Airbnb', code: 'AIRBNB', color: '#FF5A5F', description: 'Vacation rental & hotel marketplace' },
  { name: 'MakeMyTrip', code: 'MMT', color: '#F97316', description: 'India\'s leading travel company' },
  { name: 'Trip.com', code: 'TRIP', color: '#06B6D4', description: 'Global travel service provider' },
  { name: 'Google Hotel Ads', code: 'GOOGLE', color: '#10B981', description: 'Google\'s hotel metasearch' },
  { name: 'Hotels.com', code: 'HOTELS', color: '#8B5CF6', description: 'Hotel booking with rewards program' },
  { name: 'Trivago', code: 'TRIVAGO', color: '#EC4899', description: 'Hotel price comparison platform' },
  { name: 'Kayak', code: 'KAYAK', color: '#F59E0B', description: 'Travel search engine & comparator' },
  { name: 'Vrbo', code: 'VRBO', color: '#3B82F6', description: 'Vacation rental marketplace by Expedia' },
  { name: 'TripAdvisor', code: 'TRIPADVISOR', color: '#34D399', description: 'Travel reviews & booking platform' },
  { name: 'OYO', code: 'OYO', color: '#EF4444', description: 'Hospitality chain & booking platform' },
  { name: 'HRS', code: 'HRS', color: '#6366F1', description: 'Corporate hotel solutions provider' },
  { name: 'Hostelworld', code: 'HOSTELWORLD', color: '#F472B6', description: 'Hostel & budget accommodation platform' },
  { name: 'Despegar', code: 'DESPEGAR', color: '#A855F7', description: 'Latin America\'s travel agency' },
  { name: 'Goibibo', code: 'GOIBIBO', color: '#F97316', description: 'Indian online travel booking' },
  { name: 'Cleartrip', code: 'CLEARTRIP', color: '#0EA5E9', description: 'Travel booking for India & Middle East' },
  { name: 'Traveloka', code: 'TRAVELOKA', color: '#2563EB', description: 'Southeast Asia travel platform' },
];

export default sampleOTAs;
