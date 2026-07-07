/**
 * Guest Utility Functions
 * Handles filtering, sorting, CSV export, and guest calculations
 */

// Import comprehensive country list from shared utils
import { COUNTRY_NAMES } from '@/utils/countries';

// Loyalty tier configurations
export const LOYALTY_TIERS = {
  'Bronze': {
    label: 'Bronze',
    minStays: 0,
    minSpent: 0,
    bgColor: 'bg-amber-100',
    textColor: 'text-amber-700',
    borderColor: 'border-amber-200',
    icon: '🥉',
  },
  'Silver': {
    label: 'Silver',
    minStays: 3,
    minSpent: 1000,
    bgColor: 'bg-gray-100',
    textColor: 'text-gray-600',
    borderColor: 'border-gray-200',
    icon: '🥈',
  },
  'Gold': {
    label: 'Gold',
    minStays: 5,
    minSpent: 3000,
    bgColor: 'bg-[#CDB261]/20',
    textColor: 'text-[#CDB261]',
    borderColor: 'border-[#CDB261]/30',
    icon: '🥇',
  },
  'Platinum': {
    label: 'Platinum',
    minStays: 10,
    minSpent: 10000,
    bgColor: 'bg-[#A57865]/15',
    textColor: 'text-[#A57865]',
    borderColor: 'border-[#A57865]/30',
    icon: '💎',
  },
};

// Status configurations - handle both capitalized and lowercase variants
export const GUEST_STATUS_CONFIG = {
  'Active': {
    label: 'Active',
    bgColor: 'bg-[#4E5840]/15',
    textColor: 'text-[#4E5840]',
    borderColor: 'border-[#4E5840]/30',
  },
  'active': {
    label: 'Active',
    bgColor: 'bg-[#4E5840]/15',
    textColor: 'text-[#4E5840]',
    borderColor: 'border-[#4E5840]/30',
  },
  'normal': {
    label: 'Active',
    bgColor: 'bg-[#4E5840]/15',
    textColor: 'text-[#4E5840]',
    borderColor: 'border-[#4E5840]/30',
  },
  'Inactive': {
    label: 'Inactive',
    bgColor: 'bg-neutral-100',
    textColor: 'text-neutral-500',
    borderColor: 'border-neutral-200',
  },
  'inactive': {
    label: 'Inactive',
    bgColor: 'bg-neutral-100',
    textColor: 'text-neutral-500',
    borderColor: 'border-neutral-200',
  },
  'VIP': {
    label: 'VIP',
    bgColor: 'bg-[#CDB261]/20',
    textColor: 'text-[#CDB261]',
    borderColor: 'border-[#CDB261]/30',
  },
  'vip': {
    label: 'VIP',
    bgColor: 'bg-[#CDB261]/20',
    textColor: 'text-[#CDB261]',
    borderColor: 'border-[#CDB261]/30',
  },
  'Blacklisted': {
    label: 'Blacklisted',
    bgColor: 'bg-red-100',
    textColor: 'text-red-600',
    borderColor: 'border-red-200',
  },
  'blacklisted': {
    label: 'Blacklisted',
    bgColor: 'bg-red-100',
    textColor: 'text-red-600',
    borderColor: 'border-red-200',
  },
  'review': {
    label: 'Under Review',
    bgColor: 'bg-amber-100',
    textColor: 'text-amber-700',
    borderColor: 'border-amber-200',
  },
};

// Emotion/Satisfaction configurations - handle both naming conventions
export const EMOTION_CONFIG = {
  'happy': {
    label: 'Happy',
    emoji: '😊',
    color: 'text-green-600',
    bgColor: 'bg-green-50',
  },
  'positive': {
    label: 'Happy',
    emoji: '😊',
    color: 'text-green-600',
    bgColor: 'bg-green-50',
  },
  'neutral': {
    label: 'Neutral',
    emoji: '😐',
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50',
  },
  'unhappy': {
    label: 'Unhappy',
    emoji: '😞',
    color: 'text-red-600',
    bgColor: 'bg-red-50',
  },
  'negative': {
    label: 'Unhappy',
    emoji: '😞',
    color: 'text-red-600',
    bgColor: 'bg-red-50',
  },
};

// Predefined tags
export const GUEST_TAGS = [
  'Business',
  'Leisure',
  'Family',
  'Honeymoon',
  'Anniversary',
  'Birthday',
  'Corporate',
  'Long Stay',
  'Repeat Guest',
  'Referral',
  'Early Check-in',
  'Late Check-out',
  'Room Upgrade',
  'Dietary Restrictions',
  'Accessibility',
  'Quiet Room',
  'High Floor',
  'Pet Friendly',
];

// Re-export comprehensive country list for backwards compatibility
// (uses all 200+ countries from shared utils instead of limited list)
export const COUNTRIES = COUNTRY_NAMES;

// Generate unique guest ID
export function generateGuestId() {
  const randomNum = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `G-${randomNum}`;
}

// Calculate loyalty tier based on stays and spending
export function calculateLoyaltyTier(totalStays, totalSpent) {
  if (totalStays >= 10 || totalSpent >= 10000) return 'Platinum';
  if (totalStays >= 5 || totalSpent >= 3000) return 'Gold';
  if (totalStays >= 3 || totalSpent >= 1000) return 'Silver';
  return 'Bronze';
}

// Format currency - pass currency code from useCurrency() hook in components
export function formatCurrency(amount, currency = 'INR') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
  }).format(amount);
}

// Format date for display
export function formatDate(dateString) {
  if (!dateString) return 'Never';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

// Format date with time
export function formatDateTime(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

// Filter guests by status
export function filterByStatus(guests, status) {
  if (!status || status === 'all') return guests;
  return guests.filter(g => g.status === status);
}

// Filter guests by loyalty tier
export function filterByLoyaltyTier(guests, tier) {
  if (!tier || tier === 'all') return guests;
  return guests.filter(g => {
    const guestTier = calculateLoyaltyTier(g.totalStays, g.totalSpent);
    return guestTier === tier;
  });
}

// Filter guests by country
export function filterByCountry(guests, country) {
  if (!country || country === 'all') return guests;
  return guests.filter(g => g.country === country);
}

// Filter guests by emotion
export function filterByEmotion(guests, emotion) {
  if (!emotion || emotion === 'all') return guests;
  return guests.filter(g => g.emotion === emotion);
}

// Filter guests by tags
export function filterByTags(guests, tags) {
  if (!tags || tags.length === 0) return guests;
  return guests.filter(g => {
    const guestTags = g.tags || [];
    return tags.some(tag => guestTags.includes(tag));
  });
}

// Search guests by name, email, or phone
export function searchGuests(guests, query) {
  if (!query || query.trim() === '') return guests;

  const searchTerm = query.toLowerCase().trim();
  return guests.filter(guest => {
    const name = (guest.name || '').toLowerCase();
    const email = (guest.email || '').toLowerCase();
    const phone = (guest.phone || '').toLowerCase();
    const id = (guest.id || '').toLowerCase();

    return (
      name.includes(searchTerm) ||
      email.includes(searchTerm) ||
      phone.includes(searchTerm) ||
      id.includes(searchTerm)
    );
  });
}

// Sort guests
export function sortGuests(guests, sortKey, sortDirection = 'asc') {
  return [...guests].sort((a, b) => {
    let aVal = a[sortKey];
    let bVal = b[sortKey];

    // Handle date sorting
    if (sortKey === 'lastStay' || sortKey === 'createdAt') {
      aVal = new Date(aVal || 0).getTime();
      bVal = new Date(bVal || 0).getTime();
    }

    // Handle numeric sorting
    if (sortKey === 'totalStays' || sortKey === 'totalSpent') {
      aVal = Number(aVal) || 0;
      bVal = Number(bVal) || 0;
    }

    // Handle loyalty tier sorting
    if (sortKey === 'loyaltyTier') {
      const tierOrder = { 'Platinum': 4, 'Gold': 3, 'Silver': 2, 'Bronze': 1 };
      aVal = tierOrder[calculateLoyaltyTier(a.totalStays, a.totalSpent)] || 0;
      bVal = tierOrder[calculateLoyaltyTier(b.totalStays, b.totalSpent)] || 0;
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

// Export guests to CSV
export function exportGuestsToCSV(guests, filename = 'guests_export.csv') {
  if (!guests || guests.length === 0) {
    alert('No guests to export');
    return;
  }

  // CSV headers
  const headers = [
    'Guest ID',
    'Name',
    'Email',
    'Phone',
    'Country',
    'Status',
    'Loyalty Tier',
    'Total Stays',
    'Total Spent',
    'Last Stay',
    'Tags',
    'Preferences',
    'Notes',
  ];

  // Convert guests to CSV rows
  const rows = guests.map(guest => [
    guest.id || '',
    guest.name || '',
    guest.email || '',
    guest.phone || '',
    guest.country || '',
    guest.status || '',
    calculateLoyaltyTier(guest.totalStays, guest.totalSpent),
    guest.totalStays || 0,
    guest.totalSpent || 0,
    guest.lastStay || '',
    (guest.tags || []).join('; '),
    (guest.preferences || []).join('; '),
    (guest.notes || []).map(n => `${n.date}: ${n.text}`).join(' | '),
  ]);

  // Combine headers and rows
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')),
  ].join('\n');

  // Create and trigger download
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

// Calculate guest statistics
export function calculateGuestStats(guests) {
  const totalGuests = guests.length;
  const totalSpent = guests.reduce((sum, g) => sum + (g.totalSpent || 0), 0);
  const totalStays = guests.reduce((sum, g) => sum + (g.totalStays || 0), 0);
  const avgSpent = totalGuests > 0 ? totalSpent / totalGuests : 0;
  const avgStays = totalGuests > 0 ? totalStays / totalGuests : 0;

  const statusCounts = guests.reduce((acc, g) => {
    acc[g.status] = (acc[g.status] || 0) + 1;
    return acc;
  }, {});

  const tierCounts = guests.reduce((acc, g) => {
    const tier = calculateLoyaltyTier(g.totalStays, g.totalSpent);
    acc[tier] = (acc[tier] || 0) + 1;
    return acc;
  }, {});

  const emotionCounts = guests.reduce((acc, g) => {
    acc[g.emotion] = (acc[g.emotion] || 0) + 1;
    return acc;
  }, {});

  const countryCounts = guests.reduce((acc, g) => {
    acc[g.country] = (acc[g.country] || 0) + 1;
    return acc;
  }, {});

  return {
    totalGuests,
    totalSpent,
    totalStays,
    avgSpent,
    avgStays,
    statusCounts,
    tierCounts,
    emotionCounts,
    countryCounts,
    activeCount: statusCounts['Active'] || 0,
    vipCount: statusCounts['VIP'] || 0,
    inactiveCount: statusCounts['Inactive'] || 0,
    platinumCount: tierCounts['Platinum'] || 0,
    goldCount: tierCounts['Gold'] || 0,
    silverCount: tierCounts['Silver'] || 0,
    bronzeCount: tierCounts['Bronze'] || 0,
    happyCount: emotionCounts['happy'] || 0,
    neutralCount: emotionCounts['neutral'] || 0,
    unhappyCount: emotionCounts['unhappy'] || 0,
  };
}

// Create new guest object
export function createGuestObject(formData) {
  const now = new Date().toISOString();
  return {
    id: generateGuestId(),
    name: formData.name,
    email: formData.email,
    phone: formData.phone || '',
    country: formData.country || 'United States',
    status: formData.status || 'Active',
    emotion: formData.emotion || 'neutral',
    totalStays: formData.totalStays || 0,
    totalSpent: formData.totalSpent || 0,
    lastStay: formData.lastStay || null,
    tags: formData.tags || [],
    preferences: formData.preferences || [],
    notes: formData.notes || [],
    history: formData.history || [],
    createdAt: now,
    updatedAt: now,
  };
}

// Update guest object
export function updateGuestObject(existingGuest, formData) {
  return {
    ...existingGuest,
    ...formData,
    updatedAt: new Date().toISOString(),
  };
}

// Add note to guest
export function addNoteToGuest(guest, noteText, author = 'Staff') {
  const newNote = {
    id: `note-${Date.now()}`,
    text: noteText,
    author,
    date: new Date().toISOString(),
  };
  return {
    ...guest,
    notes: [newNote, ...(guest.notes || [])],
    updatedAt: new Date().toISOString(),
  };
}

// Remove note from guest
export function removeNoteFromGuest(guest, noteId) {
  return {
    ...guest,
    notes: (guest.notes || []).filter(n => n.id !== noteId),
    updatedAt: new Date().toISOString(),
  };
}

// Add tag to guest
export function addTagToGuest(guest, tag) {
  const existingTags = guest.tags || [];
  if (existingTags.includes(tag)) return guest;
  return {
    ...guest,
    tags: [...existingTags, tag],
    updatedAt: new Date().toISOString(),
  };
}

// Remove tag from guest
export function removeTagFromGuest(guest, tag) {
  return {
    ...guest,
    tags: (guest.tags || []).filter(t => t !== tag),
    updatedAt: new Date().toISOString(),
  };
}

// Get recent guests (last 30 days)
export function getRecentGuests(guests, days = 30) {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  return guests.filter(g => {
    if (!g.lastStay) return false;
    return new Date(g.lastStay) >= cutoff;
  });
}

// Get top spenders
export function getTopSpenders(guests, limit = 10) {
  return [...guests]
    .sort((a, b) => (b.totalSpent || 0) - (a.totalSpent || 0))
    .slice(0, limit);
}

// Get frequent guests
export function getFrequentGuests(guests, limit = 10) {
  return [...guests]
    .sort((a, b) => (b.totalStays || 0) - (a.totalStays || 0))
    .slice(0, limit);
}

// Validate guest data
export function validateGuest(formData) {
  const errors = {};

  if (!formData.name || formData.name.trim() === '') {
    errors.name = 'Guest name is required';
  }

  if (!formData.email || formData.email.trim() === '') {
    errors.email = 'Email is required';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
    errors.email = 'Invalid email format';
  }

  if (formData.phone && !/^[\d\s\-+()]+$/.test(formData.phone)) {
    errors.phone = 'Invalid phone format';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}
