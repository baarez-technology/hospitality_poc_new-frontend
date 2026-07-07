// CRM & Loyalty Intelligence Utilities

// Loyalty Tier Configuration
export const DEFAULT_LOYALTY_TIERS = [
  {
    id: 'bronze',
    name: 'Bronze',
    color: '#CD7F32',
    minNights: 0,
    minRevenue: 0,
    benefits: ['Welcome drink', '5% room discount on next stay'],
    icon: '🥉'
  },
  {
    id: 'silver',
    name: 'Silver',
    color: '#C0C0C0',
    minNights: 5,
    minRevenue: 1000,
    benefits: ['10% room discount', 'Early check-in', 'Late checkout'],
    icon: '🥈'
  },
  {
    id: 'gold',
    name: 'Gold',
    color: '#CDB261',
    minNights: 15,
    minRevenue: 5000,
    benefits: ['15% room discount', 'Room upgrade', 'Free breakfast', 'Airport transfer'],
    icon: '🥇'
  },
  {
    id: 'platinum',
    name: 'Platinum',
    color: '#E5E4E2',
    minNights: 30,
    minRevenue: 15000,
    benefits: ['20% room discount', 'Suite upgrade', 'All-inclusive breakfast', 'Personal concierge', 'Spa credit'],
    icon: '💎'
  }
];

// Booking Sources
export const BOOKING_SOURCES = [
  { id: 'direct', name: 'Direct', color: '#4E5840' },
  { id: 'booking', name: 'Booking.com', color: '#003580' },
  { id: 'expedia', name: 'Expedia', color: '#00355F' },
  { id: 'agoda', name: 'Agoda', color: '#5542F6' },
  { id: 'airbnb', name: 'Airbnb', color: '#FF5A5F' },
  { id: 'corporate', name: 'Corporate', color: '#A57865' }
];

// Room Types
export const ROOM_TYPES = [
  { id: 'minimalist-studio', name: 'Minimalist Studio' },
  { id: 'coastal-retreat', name: 'Coastal Retreat' },
  { id: 'urban-oasis', name: 'Urban Oasis' },
  { id: 'sunset-vista', name: 'Sunset Vista' },
  { id: 'pacific-suite', name: 'Pacific Suite' },
  { id: 'wellness-suite', name: 'Wellness Suite' },
  { id: 'family-sanctuary', name: 'Family Sanctuary' },
  { id: 'oceanfront-penthouse', name: 'Oceanfront Penthouse' }
];

// Campaign Types
export const CAMPAIGN_TYPES = [
  { id: 'email', name: 'Email', icon: '📧' },
  { id: 'sms', name: 'SMS', icon: '📱' },
  { id: 'push', name: 'Push Notification', icon: '🔔' }
];

// Campaign Status
export const CAMPAIGN_STATUS = {
  draft: { label: 'Draft', color: '#6B7280', bgColor: 'bg-gray-100', textColor: 'text-gray-700' },
  scheduled: { label: 'Scheduled', color: '#5C9BA4', bgColor: 'bg-[#5C9BA4]/10', textColor: 'text-[#5C9BA4]' },
  active: { label: 'Active', color: '#4E5840', bgColor: 'bg-[#4E5840]/10', textColor: 'text-[#4E5840]' },
  completed: { label: 'Completed', color: '#A57865', bgColor: 'bg-[#A57865]/10', textColor: 'text-[#A57865]' },
  paused: { label: 'Paused', color: '#CDB261', bgColor: 'bg-[#CDB261]/10', textColor: 'text-[#CDB261]' }
};

// Segment Filter Types
export const SEGMENT_FILTERS = [
  { id: 'loyaltyTier', name: 'Loyalty Tier', type: 'select' },
  { id: 'minStays', name: 'Minimum Stays', type: 'number' },
  { id: 'maxStays', name: 'Maximum Stays', type: 'number' },
  { id: 'bookingSource', name: 'Booking Source', type: 'select' },
  { id: 'minSpend', name: 'Minimum Spend', type: 'number' },
  { id: 'maxSpend', name: 'Maximum Spend', type: 'number' },
  { id: 'lastStayDays', name: 'Last Stay (within days)', type: 'number' },
  { id: 'country', name: 'Country', type: 'text' },
  { id: 'roomType', name: 'Room Type Preference', type: 'select' },
  { id: 'tags', name: 'Tags', type: 'tags' }
];

// Calculate guest LTV
export function calculateGuestLTV(guest) {
  if (!guest) return 0;
  const totalRevenue = guest.totalRevenue || guest.totalSpend || 0;
  const stays = guest.totalStays || guest.stays || 1;
  return totalRevenue;
}

// Calculate average LTV
export function calculateAverageLTV(guests) {
  if (!guests || guests.length === 0) return 0;
  const totalLTV = guests.reduce((sum, guest) => sum + calculateGuestLTV(guest), 0);
  return Math.round(totalLTV / guests.length);
}

// Get loyalty tier for guest
export function getGuestLoyaltyTier(guest, tiers = DEFAULT_LOYALTY_TIERS) {
  const nights = guest.totalNights || guest.totalStays || 0;
  const revenue = guest.totalRevenue || guest.totalSpend || 0;

  const sortedTiers = [...tiers].sort((a, b) => b.minNights - a.minNights);

  for (const tier of sortedTiers) {
    if (nights >= tier.minNights && revenue >= tier.minRevenue) {
      return tier;
    }
  }

  return tiers[0] || DEFAULT_LOYALTY_TIERS[0];
}

// Count guests by loyalty tier
export function countByLoyaltyTier(guests, tiers = DEFAULT_LOYALTY_TIERS) {
  const counts = {};
  tiers.forEach(tier => {
    counts[tier.id] = 0;
  });

  guests.forEach(guest => {
    const tier = getGuestLoyaltyTier(guest, tiers);
    if (tier && counts[tier.id] !== undefined) {
      counts[tier.id]++;
    }
  });

  return counts;
}

// Filter guests by segment criteria
export function filterGuestsBySegment(guests, filters) {
  if (!filters || Object.keys(filters).length === 0) return guests;

  return guests.filter(guest => {
    // Loyalty Tier filter
    if (filters.loyaltyTier && filters.loyaltyTier !== 'all') {
      const guestTier = guest.loyaltyTier || getGuestLoyaltyTier(guest).id;
      if (guestTier !== filters.loyaltyTier) return false;
    }

    // Minimum stays filter
    if (filters.minStays) {
      const stays = guest.totalStays || guest.stays || 0;
      if (stays < parseInt(filters.minStays)) return false;
    }

    // Maximum stays filter
    if (filters.maxStays) {
      const stays = guest.totalStays || guest.stays || 0;
      if (stays > parseInt(filters.maxStays)) return false;
    }

    // Booking source filter
    if (filters.bookingSource && filters.bookingSource !== 'all') {
      const source = guest.bookingSource || guest.source || 'direct';
      if (source !== filters.bookingSource) return false;
    }

    // Minimum spend filter
    if (filters.minSpend) {
      const spend = guest.totalRevenue || guest.totalSpend || 0;
      if (spend < parseInt(filters.minSpend)) return false;
    }

    // Maximum spend filter
    if (filters.maxSpend) {
      const spend = guest.totalRevenue || guest.totalSpend || 0;
      if (spend > parseInt(filters.maxSpend)) return false;
    }

    // Last stay within X days
    if (filters.lastStayDays) {
      const lastStay = guest.lastStay || guest.lastVisit;
      if (lastStay) {
        const daysDiff = Math.floor((new Date() - new Date(lastStay)) / (1000 * 60 * 60 * 24));
        if (daysDiff > parseInt(filters.lastStayDays)) return false;
      } else {
        return false;
      }
    }

    // Country filter
    if (filters.country) {
      const country = (guest.country || '').toLowerCase();
      if (!country.includes(filters.country.toLowerCase())) return false;
    }

    // Room type preference
    if (filters.roomType && filters.roomType !== 'all') {
      const roomPref = guest.preferredRoomType || guest.roomType || '';
      if (roomPref !== filters.roomType) return false;
    }

    // Tags filter
    if (filters.tags && filters.tags.length > 0) {
      const guestTags = guest.tags || [];
      const hasAllTags = filters.tags.every(tag => guestTags.includes(tag));
      if (!hasAllTags) return false;
    }

    return true;
  });
}

// Calculate repeat guest count
export function calculateRepeatGuests(guests) {
  return guests.filter(g => (g.totalStays || g.stays || 0) > 1).length;
}

// Calculate repeat guest percentage
export function calculateRepeatRate(guests) {
  if (!guests || guests.length === 0) return 0;
  const repeatCount = calculateRepeatGuests(guests);
  return Math.round((repeatCount / guests.length) * 100);
}

// Calculate campaign engagement rate
export function calculateEngagementRate(campaigns) {
  if (!campaigns || campaigns.length === 0) return 0;

  const completedCampaigns = campaigns.filter(c => c.status === 'completed' || c.metrics);
  if (completedCampaigns.length === 0) return 0;

  const totalEngagement = completedCampaigns.reduce((sum, campaign) => {
    const metrics = campaign.metrics || {};
    const sent = metrics.sent || 0;
    const opened = metrics.opened || 0;
    return sum + (sent > 0 ? (opened / sent) * 100 : 0);
  }, 0);

  return Math.round(totalEngagement / completedCampaigns.length);
}

// Generate CRM insights
export function generateCRMInsights(guests, segments, campaigns, tiers, currency = 'INR') {
  const insights = [];

  // LTV insight
  const avgLTV = calculateAverageLTV(guests);
  const highValueGuests = guests.filter(g => calculateGuestLTV(g) > avgLTV * 1.5);
  if (highValueGuests.length > 0) {
    insights.push({
      type: 'success',
      message: `${highValueGuests.length} high-value guests (LTV > ${formatCurrency(Math.round(avgLTV * 1.5), currency)}) represent your top tier segment.`
    });
  }

  // Repeat guest insight
  const repeatRate = calculateRepeatRate(guests);
  if (repeatRate > 30) {
    insights.push({
      type: 'success',
      message: `Strong repeat rate of ${repeatRate}% indicates excellent guest loyalty.`
    });
  } else if (repeatRate < 20) {
    insights.push({
      type: 'warning',
      message: `Repeat rate of ${repeatRate}% suggests opportunity to improve retention programs.`
    });
  }

  // Tier distribution insight
  const tierCounts = countByLoyaltyTier(guests, tiers);
  const goldPlatinum = (tierCounts.gold || 0) + (tierCounts.platinum || 0);
  const tierPercentage = guests.length > 0 ? Math.round((goldPlatinum / guests.length) * 100) : 0;
  insights.push({
    type: 'info',
    message: `${tierPercentage}% of guests have achieved Gold or Platinum tier status.`
  });

  // Booking source insight
  const directBookings = guests.filter(g => (g.bookingSource || g.source) === 'direct');
  const otaBookings = guests.filter(g => ['booking', 'expedia', 'agoda'].includes(g.bookingSource || g.source));
  if (directBookings.length > 0 && otaBookings.length > 0) {
    const directLTV = calculateAverageLTV(directBookings);
    const otaLTV = calculateAverageLTV(otaBookings);
    if (directLTV > otaLTV) {
      const diff = Math.round(((directLTV - otaLTV) / otaLTV) * 100);
      insights.push({
        type: 'success',
        message: `Direct bookings have ${diff}% higher LTV than OTA bookings.`
      });
    }
  }

  // Segment opportunity
  if (segments && segments.length > 0) {
    const largestSegment = [...segments].sort((a, b) => (b.guestCount || 0) - (a.guestCount || 0))[0];
    if (largestSegment) {
      insights.push({
        type: 'info',
        message: `"${largestSegment.name}" is your largest segment with ${largestSegment.guestCount || 0} guests.`
      });
    }
  }

  // Campaign performance
  if (campaigns && campaigns.length > 0) {
    const engagementRate = calculateEngagementRate(campaigns);
    if (engagementRate > 25) {
      insights.push({
        type: 'success',
        message: `Campaign engagement rate of ${engagementRate}% exceeds industry average.`
      });
    } else {
      insights.push({
        type: 'warning',
        message: `Consider A/B testing to improve ${engagementRate}% campaign engagement.`
      });
    }
  }

  // Recent activity
  const recentGuests = guests.filter(g => {
    const lastStay = g.lastStay || g.lastVisit;
    if (!lastStay) return false;
    const daysDiff = Math.floor((new Date() - new Date(lastStay)) / (1000 * 60 * 60 * 24));
    return daysDiff <= 30;
  });
  insights.push({
    type: 'info',
    message: `${recentGuests.length} guests have stayed in the last 30 days.`
  });

  return insights;
}

// Generate LTV trend data
export function generateLTVTrendData(guests) {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const currentMonth = new Date().getMonth();

  return months.slice(0, currentMonth + 1).map((month, index) => {
    // Simulate monthly LTV with some variation
    const baseLTV = calculateAverageLTV(guests) || 1500;
    const variation = (Math.random() - 0.5) * 0.3;
    const trend = index * 50; // Upward trend

    return {
      month,
      ltv: Math.round(baseLTV + (baseLTV * variation) + trend),
      guests: Math.round(guests.length / 12 * (index + 1))
    };
  });
}

// Generate stay frequency data
export function generateStayFrequencyData(guests) {
  const frequency = {
    '1 stay': 0,
    '2-3 stays': 0,
    '4-6 stays': 0,
    '7-10 stays': 0,
    '10+ stays': 0
  };

  guests.forEach(guest => {
    const stays = guest.totalStays || guest.stays || 1;
    if (stays === 1) frequency['1 stay']++;
    else if (stays <= 3) frequency['2-3 stays']++;
    else if (stays <= 6) frequency['4-6 stays']++;
    else if (stays <= 10) frequency['7-10 stays']++;
    else frequency['10+ stays']++;
  });

  return Object.entries(frequency).map(([range, count]) => ({
    range,
    count,
    percentage: guests.length > 0 ? Math.round((count / guests.length) * 100) : 0
  }));
}

// Export segments to CSV
export function exportSegmentsToCSV(segments) {
  if (!segments || segments.length === 0) {
    return { success: false, message: 'No segments to export' };
  }

  const headers = ['Segment Name', 'Guest Count', 'Average Revenue', 'Repeat Rate %', 'Filters', 'Created Date'];
  const rows = segments.map(seg => [
    seg.name,
    seg.guestCount || 0,
    seg.avgRevenue || 0,
    seg.repeatRate || 0,
    JSON.stringify(seg.filters || {}),
    seg.createdAt || ''
  ]);

  const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
  downloadCSV(csv, 'crm_segments.csv');

  return { success: true, message: `Exported ${segments.length} segments` };
}

// Export guests to CSV
export function exportGuestsToCSV(guests) {
  if (!guests || guests.length === 0) {
    return { success: false, message: 'No guests to export' };
  }

  const headers = ['Name', 'Email', 'Phone', 'Country', 'Total Stays', 'Total Revenue', 'Loyalty Tier', 'Last Stay', 'Booking Source'];
  const rows = guests.map(guest => [
    guest.name || '',
    guest.email || '',
    guest.phone || '',
    guest.country || '',
    guest.totalStays || guest.stays || 0,
    guest.totalRevenue || guest.totalSpend || 0,
    guest.loyaltyTier || getGuestLoyaltyTier(guest).name,
    guest.lastStay || guest.lastVisit || '',
    guest.bookingSource || guest.source || ''
  ]);

  const csv = [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
  downloadCSV(csv, 'crm_guests.csv');

  return { success: true, message: `Exported ${guests.length} guests` };
}

// Export campaigns to CSV
export function exportCampaignsToCSV(campaigns) {
  if (!campaigns || campaigns.length === 0) {
    return { success: false, message: 'No campaigns to export' };
  }

  const headers = ['Campaign Name', 'Type', 'Status', 'Segment', 'Sent', 'Delivered', 'Opened', 'Clicked', 'Schedule Date'];
  const rows = campaigns.map(campaign => [
    campaign.name || '',
    campaign.type || '',
    campaign.status || '',
    campaign.segmentName || '',
    campaign.metrics?.sent || 0,
    campaign.metrics?.delivered || 0,
    campaign.metrics?.opened || 0,
    campaign.metrics?.clicked || 0,
    campaign.scheduleDate || ''
  ]);

  const csv = [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
  downloadCSV(csv, 'crm_campaigns.csv');

  return { success: true, message: `Exported ${campaigns.length} campaigns` };
}

// Helper to download CSV
function downloadCSV(csv, filename) {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Format date
export function formatDate(dateStr) {
  if (!dateStr) return 'N/A';
  try {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  } catch {
    return 'N/A';
  }
}

// Format currency - pass currency code from useCurrency() hook in components
export function formatCurrency(amount, currency = 'INR') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount || 0);
}

// Generate unique ID
export function generateId() {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Personalization tags for templates
export const PERSONALIZATION_TAGS = [
  { tag: '{{guest.name}}', description: 'Guest full name' },
  { tag: '{{guest.firstName}}', description: 'Guest first name' },
  { tag: '{{guest.email}}', description: 'Guest email' },
  { tag: '{{guest.tier}}', description: 'Loyalty tier' },
  { tag: '{{guest.points}}', description: 'Loyalty points' },
  { tag: '{{hotel.name}}', description: 'Hotel name' },
  { tag: '{{booking.checkIn}}', description: 'Check-in date' },
  { tag: '{{booking.checkOut}}', description: 'Check-out date' },
  { tag: '{{booking.roomType}}', description: 'Room type' }
];

// Default email templates
export const DEFAULT_EMAIL_TEMPLATES = [
  {
    id: 'welcome',
    name: 'Welcome Email',
    subject: 'Welcome to Glimmora, {{guest.firstName}}!',
    body: `Dear {{guest.name}},

Welcome to Glimmora! We're thrilled to have you as our guest.

As a valued member of our {{guest.tier}} tier, you enjoy exclusive benefits designed to make your stay exceptional.

We look forward to hosting you soon.

Warm regards,
The Glimmora Team`,
    type: 'email'
  },
  {
    id: 'tier-upgrade',
    name: 'Tier Upgrade',
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
    type: 'email'
  },
  {
    id: 'special-offer',
    name: 'Special Offer',
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
    type: 'email'
  }
];

// Default SMS templates
export const DEFAULT_SMS_TEMPLATES = [
  {
    id: 'sms-welcome',
    name: 'Welcome SMS',
    body: 'Welcome to Glimmora, {{guest.firstName}}! We\'re excited to host you. Text HELP for assistance.',
    type: 'sms'
  },
  {
    id: 'sms-checkin',
    name: 'Check-in Reminder',
    body: 'Hi {{guest.firstName}}, your check-in at Glimmora is tomorrow at {{booking.checkIn}}. See you soon!',
    type: 'sms'
  },
  {
    id: 'sms-feedback',
    name: 'Feedback Request',
    body: 'Thank you for staying with us, {{guest.firstName}}! We\'d love your feedback. Reply with 1-5 stars.',
    type: 'sms'
  }
];
