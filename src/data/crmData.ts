// CRM & Loyalty Sample Data

import { DEFAULT_LOYALTY_TIERS } from '../utils/crm';

// Sample guests data
export const sampleGuests = [
  {
    id: 'G001',
    name: 'James Wilson',
    email: 'james.wilson@email.com',
    phone: '+1 555-0101',
    country: 'United States',
    totalStays: 12,
    totalNights: 45,
    totalRevenue: 1536000,
    loyaltyTier: 'gold',
    lastStay: '2024-11-15',
    bookingSource: 'direct',
    preferredRoomType: 'suite',
    tags: ['vip', 'corporate'],
    createdAt: '2022-03-15'
  },
  {
    id: 'G002',
    name: 'Emma Thompson',
    email: 'emma.t@email.com',
    phone: '+44 7700-900123',
    country: 'United Kingdom',
    totalStays: 8,
    totalNights: 24,
    totalRevenue: 764000,
    loyaltyTier: 'silver',
    lastStay: '2024-11-20',
    bookingSource: 'booking',
    preferredRoomType: 'deluxe',
    tags: ['leisure'],
    createdAt: '2023-01-10'
  },
  {
    id: 'G003',
    name: 'Michael Chen',
    email: 'mchen@corporate.com',
    phone: '+65 9123-4567',
    country: 'Singapore',
    totalStays: 25,
    totalNights: 75,
    totalRevenue: 2656000,
    loyaltyTier: 'platinum',
    lastStay: '2024-11-22',
    bookingSource: 'corporate',
    preferredRoomType: 'suite',
    tags: ['vip', 'corporate', 'long-stay'],
    createdAt: '2021-06-20'
  },
  {
    id: 'G004',
    name: 'Sophie Martin',
    email: 'sophie.m@gmail.com',
    phone: '+33 6 12 34 56 78',
    country: 'France',
    totalStays: 3,
    totalNights: 9,
    totalRevenue: 290500,
    loyaltyTier: 'bronze',
    lastStay: '2024-10-05',
    bookingSource: 'expedia',
    preferredRoomType: 'standard',
    tags: ['leisure'],
    createdAt: '2024-02-14'
  },
  {
    id: 'G005',
    name: 'David Kim',
    email: 'david.kim@business.com',
    phone: '+82 10-1234-5678',
    country: 'South Korea',
    totalStays: 15,
    totalNights: 60,
    totalRevenue: 1826000,
    loyaltyTier: 'gold',
    lastStay: '2024-11-18',
    bookingSource: 'direct',
    preferredRoomType: 'deluxe',
    tags: ['corporate', 'frequent'],
    createdAt: '2022-08-30'
  },
  {
    id: 'G006',
    name: 'Anna Kowalski',
    email: 'anna.k@email.pl',
    phone: '+48 501-234-567',
    country: 'Poland',
    totalStays: 2,
    totalNights: 4,
    totalRevenue: 99600,
    loyaltyTier: 'bronze',
    lastStay: '2024-09-20',
    bookingSource: 'agoda',
    preferredRoomType: 'standard',
    tags: ['leisure'],
    createdAt: '2024-05-10'
  },
  {
    id: 'G007',
    name: 'Robert Johnson',
    email: 'rjohnson@company.com',
    phone: '+1 555-0202',
    country: 'United States',
    totalStays: 20,
    totalNights: 80,
    totalRevenue: 2324000,
    loyaltyTier: 'platinum',
    lastStay: '2024-11-25',
    bookingSource: 'corporate',
    preferredRoomType: 'villa',
    tags: ['vip', 'corporate'],
    createdAt: '2021-01-05'
  },
  {
    id: 'G008',
    name: 'Lisa Anderson',
    email: 'lisa.a@email.com',
    phone: '+1 555-0303',
    country: 'Canada',
    totalStays: 6,
    totalNights: 18,
    totalRevenue: 564500,
    loyaltyTier: 'silver',
    lastStay: '2024-11-10',
    bookingSource: 'booking',
    preferredRoomType: 'deluxe',
    tags: ['leisure', 'family'],
    createdAt: '2023-04-22'
  },
  {
    id: 'G009',
    name: 'Hiroshi Tanaka',
    email: 'htanaka@email.jp',
    phone: '+81 90-1234-5678',
    country: 'Japan',
    totalStays: 10,
    totalNights: 30,
    totalRevenue: 1245000,
    loyaltyTier: 'gold',
    lastStay: '2024-11-12',
    bookingSource: 'direct',
    preferredRoomType: 'suite',
    tags: ['vip', 'frequent'],
    createdAt: '2022-11-15'
  },
  {
    id: 'G010',
    name: 'Maria Garcia',
    email: 'maria.g@email.es',
    phone: '+34 612-345-678',
    country: 'Spain',
    totalStays: 4,
    totalNights: 12,
    totalRevenue: 373500,
    loyaltyTier: 'bronze',
    lastStay: '2024-10-28',
    bookingSource: 'airbnb',
    preferredRoomType: 'deluxe',
    tags: ['leisure'],
    createdAt: '2024-01-20'
  },
  {
    id: 'G011',
    name: 'Thomas Mueller',
    email: 'tmueller@business.de',
    phone: '+49 151-1234-5678',
    country: 'Germany',
    totalStays: 18,
    totalNights: 54,
    totalRevenue: 2034000,
    loyaltyTier: 'platinum',
    lastStay: '2024-11-21',
    bookingSource: 'corporate',
    preferredRoomType: 'penthouse',
    tags: ['vip', 'corporate', 'long-stay'],
    createdAt: '2021-09-10'
  },
  {
    id: 'G012',
    name: 'Sarah Brown',
    email: 'sarah.b@email.com',
    phone: '+61 412-345-678',
    country: 'Australia',
    totalStays: 5,
    totalNights: 20,
    totalRevenue: 705500,
    loyaltyTier: 'silver',
    lastStay: '2024-11-08',
    bookingSource: 'direct',
    preferredRoomType: 'suite',
    tags: ['leisure', 'anniversary'],
    createdAt: '2023-07-14'
  },
  {
    id: 'G013',
    name: 'Ahmed Hassan',
    email: 'ahmed.h@email.ae',
    phone: '+971 50-123-4567',
    country: 'UAE',
    totalStays: 7,
    totalNights: 28,
    totalRevenue: 1494000,
    loyaltyTier: 'gold',
    lastStay: '2024-11-19',
    bookingSource: 'direct',
    preferredRoomType: 'villa',
    tags: ['vip', 'luxury'],
    createdAt: '2023-02-28'
  },
  {
    id: 'G014',
    name: 'Jennifer White',
    email: 'jwhite@email.com',
    phone: '+1 555-0404',
    country: 'United States',
    totalStays: 1,
    totalNights: 2,
    totalRevenue: 54000,
    loyaltyTier: 'bronze',
    lastStay: '2024-11-24',
    bookingSource: 'expedia',
    preferredRoomType: 'standard',
    tags: ['first-time'],
    createdAt: '2024-11-22'
  },
  {
    id: 'G015',
    name: 'Carlos Rodriguez',
    email: 'carlos.r@email.mx',
    phone: '+52 55-1234-5678',
    country: 'Mexico',
    totalStays: 9,
    totalNights: 27,
    totalRevenue: 913000,
    loyaltyTier: 'silver',
    lastStay: '2024-11-05',
    bookingSource: 'booking',
    preferredRoomType: 'deluxe',
    tags: ['leisure', 'frequent'],
    createdAt: '2023-03-18'
  },
  {
    id: 'G016',
    name: 'Olivia Taylor',
    email: 'olivia.t@company.uk',
    phone: '+44 7700-900456',
    country: 'United Kingdom',
    totalStays: 14,
    totalNights: 42,
    totalRevenue: 1619000,
    loyaltyTier: 'gold',
    lastStay: '2024-11-23',
    bookingSource: 'corporate',
    preferredRoomType: 'suite',
    tags: ['corporate', 'frequent'],
    createdAt: '2022-05-12'
  },
  {
    id: 'G017',
    name: 'Pierre Dubois',
    email: 'pdubois@email.fr',
    phone: '+33 6 98 76 54 32',
    country: 'France',
    totalStays: 3,
    totalNights: 6,
    totalRevenue: 232500,
    loyaltyTier: 'bronze',
    lastStay: '2024-08-15',
    bookingSource: 'agoda',
    preferredRoomType: 'standard',
    tags: ['leisure'],
    createdAt: '2024-03-20'
  },
  {
    id: 'G018',
    name: 'Yuki Yamamoto',
    email: 'yuki.y@email.jp',
    phone: '+81 80-5678-1234',
    country: 'Japan',
    totalStays: 22,
    totalNights: 88,
    totalRevenue: 2905000,
    loyaltyTier: 'platinum',
    lastStay: '2024-11-26',
    bookingSource: 'direct',
    preferredRoomType: 'penthouse',
    tags: ['vip', 'long-stay', 'luxury'],
    createdAt: '2020-12-01'
  },
  {
    id: 'G019',
    name: 'Isabella Rossi',
    email: 'isabella.r@email.it',
    phone: '+39 333-123-4567',
    country: 'Italy',
    totalStays: 6,
    totalNights: 24,
    totalRevenue: 813500,
    loyaltyTier: 'silver',
    lastStay: '2024-10-30',
    bookingSource: 'direct',
    preferredRoomType: 'deluxe',
    tags: ['leisure', 'honeymoon'],
    createdAt: '2023-06-08'
  },
  {
    id: 'G020',
    name: 'William Scott',
    email: 'w.scott@business.com',
    phone: '+1 555-0505',
    country: 'United States',
    totalStays: 11,
    totalNights: 44,
    totalRevenue: 1453000,
    loyaltyTier: 'gold',
    lastStay: '2024-11-17',
    bookingSource: 'corporate',
    preferredRoomType: 'suite',
    tags: ['corporate', 'vip'],
    createdAt: '2022-07-25'
  }
];

// Sample segments
export const sampleSegments = [
  {
    id: 'SEG001',
    name: 'High Value Guests',
    description: 'Guests with lifetime value above \u20B912,45,000',
    filters: { minSpend: 1245000 },
    guestCount: 8,
    avgRevenue: 2023000,
    repeatRate: 85,
    createdAt: '2024-01-15',
    color: '#CDB261'
  },
  {
    id: 'SEG002',
    name: 'OTA Frequent Bookers',
    description: 'Guests who book via OTAs and have 3+ stays',
    filters: { bookingSource: 'booking', minStays: 3 },
    guestCount: 4,
    avgRevenue: 591500,
    repeatRate: 75,
    createdAt: '2024-02-20',
    color: '#003580'
  },
  {
    id: 'SEG003',
    name: 'Corporate Travellers',
    description: 'Corporate account guests',
    filters: { bookingSource: 'corporate' },
    guestCount: 6,
    avgRevenue: 1812000,
    repeatRate: 100,
    createdAt: '2024-01-10',
    color: '#A57865'
  },
  {
    id: 'SEG004',
    name: 'Long-Stay Guests',
    description: 'Guests with average stay > 5 nights',
    filters: { minStays: 5, tags: ['long-stay'] },
    guestCount: 4,
    avgRevenue: 2376000,
    repeatRate: 100,
    createdAt: '2024-03-05',
    color: '#4E5840'
  },
  {
    id: 'SEG005',
    name: 'Weekend Travelers',
    description: 'Leisure guests with 2-4 night stays',
    filters: { minStays: 2, maxStays: 4, tags: ['leisure'] },
    guestCount: 5,
    avgRevenue: 285500,
    repeatRate: 40,
    createdAt: '2024-03-15',
    color: '#5C9BA4'
  },
  {
    id: 'SEG006',
    name: 'Last 30 Days Guests',
    description: 'Recent guests for retention campaigns',
    filters: { lastStayDays: 30 },
    guestCount: 12,
    avgRevenue: 1321000,
    repeatRate: 83,
    createdAt: '2024-04-01',
    color: '#8E6554'
  }
];

// Sample campaigns
export const sampleCampaigns = [
  {
    id: 'CAMP001',
    name: 'Holiday Season Welcome Back',
    type: 'email',
    status: 'completed',
    segmentId: 'SEG001',
    segmentName: 'High Value Guests',
    templateId: 'special-offer',
    subject: 'Exclusive Holiday Offer for Our VIP Guests',
    scheduleDate: '2024-11-01',
    metrics: {
      sent: 8,
      delivered: 8,
      opened: 6,
      clicked: 4
    },
    createdAt: '2024-10-25'
  },
  {
    id: 'CAMP002',
    name: 'OTA Guest Direct Booking Incentive',
    type: 'email',
    status: 'active',
    segmentId: 'SEG002',
    segmentName: 'OTA Frequent Bookers',
    templateId: 'special-offer',
    subject: 'Book Direct & Save 15%',
    scheduleDate: '2024-11-15',
    metrics: {
      sent: 4,
      delivered: 4,
      opened: 2,
      clicked: 1
    },
    createdAt: '2024-11-10'
  },
  {
    id: 'CAMP003',
    name: 'Corporate Partner Appreciation',
    type: 'email',
    status: 'scheduled',
    segmentId: 'SEG003',
    segmentName: 'Corporate Travellers',
    templateId: 'tier-upgrade',
    subject: 'Thank You for Your Partnership',
    scheduleDate: '2024-12-01',
    metrics: {
      sent: 0,
      delivered: 0,
      opened: 0,
      clicked: 0
    },
    createdAt: '2024-11-20'
  },
  {
    id: 'CAMP004',
    name: 'Long-Stay Exclusive Rates',
    type: 'sms',
    status: 'completed',
    segmentId: 'SEG004',
    segmentName: 'Long-Stay Guests',
    templateId: 'sms-welcome',
    scheduleDate: '2024-10-15',
    metrics: {
      sent: 4,
      delivered: 4,
      opened: 3,
      clicked: 2
    },
    createdAt: '2024-10-10'
  },
  {
    id: 'CAMP005',
    name: 'Weekend Getaway Package',
    type: 'email',
    status: 'draft',
    segmentId: 'SEG005',
    segmentName: 'Weekend Travelers',
    templateId: 'special-offer',
    subject: 'Your Perfect Weekend Awaits',
    scheduleDate: null,
    metrics: {
      sent: 0,
      delivered: 0,
      opened: 0,
      clicked: 0
    },
    createdAt: '2024-11-22'
  },
  {
    id: 'CAMP006',
    name: 'Recent Guest Feedback',
    type: 'sms',
    status: 'active',
    segmentId: 'SEG006',
    segmentName: 'Last 30 Days Guests',
    templateId: 'sms-feedback',
    scheduleDate: '2024-11-20',
    metrics: {
      sent: 12,
      delivered: 11,
      opened: 8,
      clicked: 5
    },
    createdAt: '2024-11-18'
  }
];

// Sample templates
export const sampleTemplates = [
  {
    id: 'TPL001',
    name: 'Welcome Email',
    type: 'email',
    subject: 'Welcome to Glimmora, {{guest.firstName}}!',
    body: `Dear {{guest.name}},

Welcome to Glimmora! We're thrilled to have you as our guest.

As a valued member of our {{guest.tier}} tier, you enjoy exclusive benefits designed to make your stay exceptional.

We look forward to hosting you soon.

Warm regards,
The Glimmora Team`,
    createdAt: '2024-01-01',
    updatedAt: '2024-06-15'
  },
  {
    id: 'TPL002',
    name: 'Tier Upgrade Notification',
    type: 'email',
    subject: 'Congratulations! You\'ve been upgraded to {{guest.tier}}',
    body: `Dear {{guest.firstName}},

Great news! Your loyalty has been rewarded.

You've been upgraded to our {{guest.tier}} tier, unlocking new exclusive benefits including:
- Premium room upgrades
- Complimentary breakfast
- Late checkout privileges

Thank you for choosing Glimmora.

Best regards,
The Glimmora Team`,
    createdAt: '2024-01-15',
    updatedAt: '2024-08-20'
  },
  {
    id: 'TPL003',
    name: 'Special Offer',
    type: 'email',
    subject: 'Exclusive Offer Just for You, {{guest.firstName}}',
    body: `Dear {{guest.name}},

As a valued {{guest.tier}} member, we have an exclusive offer just for you.

Book your next stay within the next 30 days and enjoy:
- 20% off your room rate
- Complimentary spa treatment
- Welcome amenity

Use code: GLIMMORA20

We can't wait to welcome you back!

The Glimmora Team`,
    createdAt: '2024-02-01',
    updatedAt: '2024-10-10'
  },
  {
    id: 'TPL004',
    name: 'Check-in Reminder',
    type: 'sms',
    subject: null,
    body: 'Hi {{guest.firstName}}, your check-in at Glimmora is tomorrow at {{booking.checkIn}}. See you soon!',
    createdAt: '2024-01-20',
    updatedAt: '2024-05-05'
  },
  {
    id: 'TPL005',
    name: 'Feedback Request',
    type: 'sms',
    subject: null,
    body: 'Thank you for staying with us, {{guest.firstName}}! We\'d love your feedback. Reply with 1-5 stars.',
    createdAt: '2024-02-15',
    updatedAt: '2024-07-30'
  },
  {
    id: 'TPL006',
    name: 'Birthday Greeting',
    type: 'email',
    subject: 'Happy Birthday, {{guest.firstName}}! 🎂',
    body: `Dear {{guest.firstName}},

Wishing you a wonderful birthday from all of us at Glimmora!

As a special gift, enjoy 25% off your next stay when you book within 30 days.

Use code: BIRTHDAY25

May your year ahead be filled with amazing travels!

Warm wishes,
The Glimmora Team`,
    createdAt: '2024-03-01',
    updatedAt: '2024-09-15'
  }
];

// Initial CRM state for context
export const initialCRMState = {
  guests: sampleGuests,
  segments: sampleSegments,
  campaigns: sampleCampaigns,
  templates: sampleTemplates,
  loyaltyTiers: DEFAULT_LOYALTY_TIERS
};
