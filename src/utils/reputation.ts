/**
 * Reputation AI Utility Functions
 * Sentiment analysis, review management, AI response generation, exports
 */

// Platform configurations
export const PLATFORMS = [
  { id: 'booking', name: 'Booking.com', color: '#003580', icon: 'B' },
  { id: 'expedia', name: 'Expedia', color: '#FFCC00', icon: 'E' },
  { id: 'agoda', name: 'Agoda', color: '#5392F9', icon: 'A' },
  { id: 'google', name: 'Google', color: '#4285F4', icon: 'G' },
  { id: 'tripadvisor', name: 'TripAdvisor', color: '#00AF87', icon: 'T' }
];

// Issue categories
export const ISSUE_CATEGORIES = [
  { value: 'cleanliness', label: 'Cleanliness', color: '#5C9BA4' },
  { value: 'staff', label: 'Staff Behavior', color: '#A57865' },
  { value: 'food', label: 'Food Quality', color: '#CDB261' },
  { value: 'checkin', label: 'Check-in / Checkout', color: '#4E5840' },
  { value: 'amenities', label: 'Amenities', color: '#8E6554' },
  { value: 'room', label: 'Room Condition', color: '#7A9E9F' },
  { value: 'pricing', label: 'Pricing', color: '#B8860B' },
  { value: 'other', label: 'Other', color: '#6B7280' }
];

// Sentiment configurations
export const SENTIMENT_CONFIG = {
  positive: {
    label: 'Positive',
    bgColor: 'bg-[#4E5840]/15',
    textColor: 'text-[#4E5840]',
    min: 70
  },
  neutral: {
    label: 'Neutral',
    bgColor: 'bg-[#CDB261]/20',
    textColor: 'text-[#CDB261]',
    min: 40
  },
  negative: {
    label: 'Negative',
    bgColor: 'bg-red-100',
    textColor: 'text-red-700',
    min: 0
  }
};

/**
 * Calculate sentiment label from score
 */
export function getSentimentLabel(score) {
  if (score >= SENTIMENT_CONFIG.positive.min) return 'positive';
  if (score >= SENTIMENT_CONFIG.neutral.min) return 'neutral';
  return 'negative';
}

/**
 * Calculate global sentiment score from reviews
 */
export function calculateGlobalSentiment(reviews) {
  if (!reviews || reviews.length === 0) return 0;
  const total = reviews.reduce((sum, r) => sum + (r.sentimentScore || 50), 0);
  return Math.round(total / reviews.length);
}

/**
 * Calculate average rating from reviews
 */
export function calculateAverageRating(reviews) {
  if (!reviews || reviews.length === 0) return 0;
  const total = reviews.reduce((sum, r) => sum + (r.rating || 0), 0);
  return Math.round((total / reviews.length) * 10) / 10;
}

/**
 * Calculate response rate
 */
export function calculateResponseRate(reviews) {
  if (!reviews || reviews.length === 0) return 0;
  const responded = reviews.filter(r => r.responded).length;
  return Math.round((responded / reviews.length) * 100);
}

/**
 * Count reviews by sentiment
 */
export function countBySentiment(reviews) {
  const counts = { positive: 0, neutral: 0, negative: 0 };
  reviews.forEach(r => {
    const sentiment = getSentimentLabel(r.sentimentScore || 50);
    counts[sentiment]++;
  });
  return counts;
}

/**
 * Count reviews by category
 */
export function countByCategory(reviews) {
  const counts = {};
  ISSUE_CATEGORIES.forEach(cat => {
    counts[cat.value] = 0;
  });

  reviews.forEach(r => {
    if (r.category && counts[r.category] !== undefined) {
      counts[r.category]++;
    }
  });

  return ISSUE_CATEGORIES.map(cat => ({
    ...cat,
    count: counts[cat.value],
    percentage: reviews.length > 0 ? Math.round((counts[cat.value] / reviews.length) * 100) : 0
  }));
}

/**
 * Count reviews by platform
 */
export function countByPlatform(reviews) {
  const counts = {};
  PLATFORMS.forEach(p => {
    counts[p.id] = { count: 0, totalRating: 0 };
  });

  reviews.forEach(r => {
    if (r.platform && counts[r.platform]) {
      counts[r.platform].count++;
      counts[r.platform].totalRating += r.rating || 0;
    }
  });

  return PLATFORMS.map(p => ({
    ...p,
    count: counts[p.id].count,
    rating: counts[p.id].count > 0
      ? Math.round((counts[p.id].totalRating / counts[p.id].count) * 10) / 10
      : 0
  }));
}

/**
 * Calculate KPIs from reviews
 */
export function calculateReputationKPIs(reviews) {
  const sentimentCounts = countBySentiment(reviews);

  return {
    globalSentiment: calculateGlobalSentiment(reviews),
    averageRating: calculateAverageRating(reviews),
    totalReviews: reviews.length,
    positiveReviews: sentimentCounts.positive,
    negativeReviews: sentimentCounts.negative,
    responseRate: calculateResponseRate(reviews)
  };
}

/**
 * Filter reviews
 */
export function filterReviews(reviews, filters) {
  let result = [...reviews];

  if (filters.platform && filters.platform !== 'all') {
    result = result.filter(r => r.platform === filters.platform);
  }

  if (filters.sentiment && filters.sentiment !== 'all') {
    result = result.filter(r => getSentimentLabel(r.sentimentScore) === filters.sentiment);
  }

  if (filters.category && filters.category !== 'all') {
    result = result.filter(r => r.category === filters.category);
  }

  if (filters.ratingMin !== undefined) {
    result = result.filter(r => r.rating >= filters.ratingMin);
  }

  if (filters.ratingMax !== undefined) {
    result = result.filter(r => r.rating <= filters.ratingMax);
  }

  if (filters.responded !== undefined && filters.responded !== 'all') {
    const responded = filters.responded === 'true';
    result = result.filter(r => r.responded === responded);
  }

  if (filters.dateFrom) {
    const fromDate = new Date(filters.dateFrom);
    result = result.filter(r => new Date(r.date) >= fromDate);
  }

  if (filters.dateTo) {
    const toDate = new Date(filters.dateTo);
    result = result.filter(r => new Date(r.date) <= toDate);
  }

  return result;
}

/**
 * Search reviews
 */
export function searchReviews(reviews, query) {
  if (!query || query.trim() === '') return reviews;

  const searchTerm = query.toLowerCase().trim();
  return reviews.filter(r => {
    const guestName = (r.guestName || '').toLowerCase();
    const comment = (r.comment || '').toLowerCase();
    const category = (r.category || '').toLowerCase();

    return guestName.includes(searchTerm) ||
           comment.includes(searchTerm) ||
           category.includes(searchTerm);
  });
}

/**
 * Sort reviews
 */
export function sortReviews(reviews, sortField, sortDirection = 'desc') {
  return [...reviews].sort((a, b) => {
    let aVal, bVal;

    switch (sortField) {
      case 'date':
        aVal = new Date(a.date || 0).getTime();
        bVal = new Date(b.date || 0).getTime();
        break;
      case 'rating':
        aVal = a.rating || 0;
        bVal = b.rating || 0;
        break;
      case 'sentiment':
        aVal = a.sentimentScore || 0;
        bVal = b.sentimentScore || 0;
        break;
      case 'guestName':
        aVal = (a.guestName || '').toLowerCase();
        bVal = (b.guestName || '').toLowerCase();
        break;
      default:
        aVal = a[sortField] || '';
        bVal = b[sortField] || '';
    }

    if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });
}

/**
 * Generate AI response versions
 */
export function generateAIResponses(review) {
  const guestName = review.guestName?.split(' ')[0] || 'Guest';
  const isPositive = review.sentimentScore >= 70;
  const isNegative = review.sentimentScore < 40;

  const professional = isPositive
    ? `Dear ${guestName},

Thank you for taking the time to share your feedback. We are delighted to hear that you had a positive experience at Glimmora. Your kind words about our ${review.category === 'staff' ? 'team' : 'services'} are greatly appreciated and will be shared with our staff.

We look forward to welcoming you back in the future.

Best regards,
The Glimmora Team`
    : isNegative
    ? `Dear ${guestName},

Thank you for bringing this matter to our attention. We sincerely apologize for any inconvenience you experienced during your stay. Your feedback regarding ${ISSUE_CATEGORIES.find(c => c.value === review.category)?.label || 'our services'} has been noted and shared with the relevant department for immediate action.

We would appreciate the opportunity to discuss this further. Please contact our Guest Relations team at your earliest convenience.

Best regards,
The Glimmora Team`
    : `Dear ${guestName},

Thank you for your feedback regarding your recent stay. We appreciate you taking the time to share your experience with us.

We are continuously working to improve our services and your comments will help us in this endeavor. We hope to have the opportunity to serve you again soon.

Best regards,
The Glimmora Team`;

  const warm = isPositive
    ? `Hi ${guestName}!

What wonderful feedback - thank you so much! It truly warms our hearts to know you enjoyed your stay with us. Our team works incredibly hard to create memorable experiences, and reviews like yours make it all worthwhile.

We can't wait to see you again! Until then, take care and safe travels.

With gratitude,
Your Glimmora Family`
    : isNegative
    ? `Dear ${guestName},

We're so sorry to hear about your experience - this isn't the standard we set for ourselves, and we genuinely feel terrible that we let you down.

Please know that we take your feedback to heart. We'd love the chance to make things right. Would you be open to speaking with our Guest Relations Manager? We truly value you as a guest.

With sincere apologies,
Your Glimmora Family`
    : `Hi ${guestName}!

Thank you for sharing your thoughts with us! We really appreciate honest feedback as it helps us grow and improve.

We hope your next visit exceeds all expectations. Looking forward to welcoming you back!

Warmly,
Your Glimmora Family`;

  const short = isPositive
    ? `Thank you, ${guestName}! We're thrilled you enjoyed your stay. Hope to see you again soon!`
    : isNegative
    ? `We apologize for falling short of expectations, ${guestName}. Your feedback has been escalated and we'd like to make this right. Please contact us directly.`
    : `Thanks for the feedback, ${guestName}! We appreciate your insights and hope to welcome you back soon.`;

  return {
    professional,
    warm,
    short
  };
}

/**
 * Generate AI insights from reviews
 */
export function generateAIInsights(reviews, previousPeriodReviews = []) {
  const insights = [];
  const categoryStats = countByCategory(reviews);
  const prevCategoryStats = countByCategory(previousPeriodReviews);
  const platformStats = countByPlatform(reviews);
  const prevPlatformStats = countByPlatform(previousPeriodReviews);
  const sentimentCounts = countBySentiment(reviews);

  // Category trend insights
  categoryStats.forEach(cat => {
    const prevCat = prevCategoryStats.find(p => p.value === cat.value);
    if (cat.count > 0 && prevCat) {
      const change = cat.count - prevCat.count;
      const changePercent = prevCat.count > 0 ? Math.round((change / prevCat.count) * 100) : 0;

      if (changePercent > 10) {
        insights.push({
          type: 'warning',
          message: `${cat.label} mentions increased by ${changePercent}% this period.`,
          category: cat.value
        });
      } else if (changePercent < -10) {
        insights.push({
          type: 'success',
          message: `${cat.label} complaints decreased by ${Math.abs(changePercent)}% this period.`,
          category: cat.value
        });
      }
    }
  });

  // Platform rating insights
  platformStats.forEach(plat => {
    const prevPlat = prevPlatformStats.find(p => p.id === plat.id);
    if (plat.rating > 0 && prevPlat && prevPlat.rating > 0) {
      const change = plat.rating - prevPlat.rating;
      if (Math.abs(change) >= 0.2) {
        insights.push({
          type: change > 0 ? 'success' : 'warning',
          message: `${plat.name} rating ${change > 0 ? 'improved' : 'dropped'} by ${Math.abs(change).toFixed(1)} points.`,
          platform: plat.id
        });
      }
    }
  });

  // Positive sentiment insight
  const positivePercent = reviews.length > 0
    ? Math.round((sentimentCounts.positive / reviews.length) * 100)
    : 0;
  if (positivePercent > 70) {
    insights.push({
      type: 'success',
      message: `${positivePercent}% of reviews are positive - excellent guest satisfaction!`
    });
  }

  // Staff mentions
  const staffReviews = reviews.filter(r => r.category === 'staff');
  const positiveStaff = staffReviews.filter(r => r.sentimentScore >= 70).length;
  if (staffReviews.length > 0) {
    const staffPositivePercent = Math.round((positiveStaff / staffReviews.length) * 100);
    if (staffPositivePercent > 80) {
      insights.push({
        type: 'success',
        message: `Guests praise staff friendliness consistently (+${staffPositivePercent}% positivity).`
      });
    }
  }

  // Check-in delays
  const checkinReviews = reviews.filter(r => r.category === 'checkin');
  const negativeCheckin = checkinReviews.filter(r => r.sentimentScore < 40).length;
  if (negativeCheckin > 3) {
    insights.push({
      type: 'warning',
      message: `Negative sentiment highest for check-in delays (${negativeCheckin} complaints).`
    });
  }

  // Food mentions
  const foodReviews = reviews.filter(r => r.category === 'food');
  const positiveFood = foodReviews.filter(r => r.sentimentScore >= 70).length;
  if (foodReviews.length > 5) {
    const foodPercent = Math.round((positiveFood / foodReviews.length) * 100);
    insights.push({
      type: foodPercent > 60 ? 'success' : 'info',
      message: `Breakfast mentioned positively in ${foodPercent}% of food reviews.`
    });
  }

  // Response rate insight
  const responseRate = calculateResponseRate(reviews);
  if (responseRate < 50) {
    insights.push({
      type: 'warning',
      message: `Response rate is ${responseRate}% - aim for at least 80% to improve engagement.`
    });
  } else if (responseRate > 90) {
    insights.push({
      type: 'success',
      message: `Excellent response rate of ${responseRate}%! Keep it up.`
    });
  }

  return insights.slice(0, 8); // Return max 8 insights
}

/**
 * Format date for display
 */
export function formatDate(dateString) {
  if (!dateString) return '-';
  try {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  } catch {
    return '-';
  }
}

/**
 * Export reviews to CSV
 */
export function exportReviewsToCSV(reviews, filename = 'reviews_export.csv') {
  if (!reviews || reviews.length === 0) {
    return { success: false, message: 'No data to export' };
  }

  const headers = [
    'Guest Name',
    'Platform',
    'Rating',
    'Date',
    'Sentiment',
    'Category',
    'Comment',
    'Response Status'
  ];

  const rows = reviews.map(r => [
    r.guestName || '',
    PLATFORMS.find(p => p.id === r.platform)?.name || r.platform || '',
    r.rating || '',
    formatDate(r.date),
    getSentimentLabel(r.sentimentScore),
    ISSUE_CATEGORIES.find(c => c.value === r.category)?.label || r.category || '',
    r.comment || '',
    r.responded ? 'Responded' : 'Pending'
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  const timestamp = new Date().toISOString().split('T')[0];

  link.setAttribute('href', url);
  link.setAttribute('download', `${filename.replace('.csv', '')}_${timestamp}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  return { success: true, message: `Exported ${reviews.length} reviews to CSV` };
}

/**
 * Generate unique review ID
 */
export function generateReviewId() {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substr(2, 4).toUpperCase();
  return `REV-${timestamp}-${random}`;
}
