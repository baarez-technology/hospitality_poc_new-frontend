/**
 * Review Date Filtering
 * Filter reviews by date ranges
 */

/**
 * Filter by date range
 */
export function filterByDateRange(reviews, startDate, endDate) {
  const start = startDate ? new Date(startDate) : null;
  const end = endDate ? new Date(endDate) : null;

  return reviews.filter(review => {
    const reviewDate = new Date(review.date);

    if (start && reviewDate < start) return false;
    if (end && reviewDate > end) return false;

    return true;
  });
}

/**
 * Filter by preset range
 */
export function filterByPreset(reviews, preset) {
  const today = new Date();
  let startDate;

  switch (preset) {
    case '7d':
      startDate = new Date(today);
      startDate.setDate(today.getDate() - 7);
      break;

    case '30d':
      startDate = new Date(today);
      startDate.setDate(today.getDate() - 30);
      break;

    case '90d':
      startDate = new Date(today);
      startDate.setDate(today.getDate() - 90);
      break;

    case '6m':
      startDate = new Date(today);
      startDate.setMonth(today.getMonth() - 6);
      break;

    case '1y':
      startDate = new Date(today);
      startDate.setFullYear(today.getFullYear() - 1);
      break;

    case 'ytd':
      startDate = new Date(today.getFullYear(), 0, 1);
      break;

    case 'all':
    default:
      return reviews;
  }

  return filterByDateRange(reviews, startDate.toISOString().split('T')[0], null);
}

/**
 * Get reviews for a specific month
 */
export function filterByMonth(reviews, year, month) {
  return reviews.filter(review => {
    const date = new Date(review.date);
    return date.getFullYear() === year && date.getMonth() === month;
  });
}

/**
 * Get reviews for a specific week
 */
export function filterByWeek(reviews, weekStart) {
  const start = new Date(weekStart);
  const end = new Date(start);
  end.setDate(start.getDate() + 7);

  return filterByDateRange(
    reviews,
    start.toISOString().split('T')[0],
    end.toISOString().split('T')[0]
  );
}

/**
 * Get reviews for a specific day
 */
export function filterByDay(reviews, date) {
  const dateStr = typeof date === 'string' ? date : date.toISOString().split('T')[0];

  return reviews.filter(review => review.date === dateStr);
}

/**
 * Get reviews from last N days
 */
export function getRecentReviews(reviews, days) {
  const today = new Date();
  const cutoffDate = new Date(today);
  cutoffDate.setDate(today.getDate() - days);

  return reviews.filter(review => new Date(review.date) >= cutoffDate);
}

/**
 * Group reviews by date range
 */
export function groupByDateRange(reviews, rangeType = 'day') {
  const groups = {};

  reviews.forEach(review => {
    const date = new Date(review.date);
    let key;

    switch (rangeType) {
      case 'day':
        key = review.date;
        break;

      case 'week':
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay());
        key = weekStart.toISOString().split('T')[0];
        break;

      case 'month':
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        break;

      case 'year':
        key = date.getFullYear().toString();
        break;

      default:
        key = review.date;
    }

    if (!groups[key]) {
      groups[key] = [];
    }

    groups[key].push(review);
  });

  return groups;
}

/**
 * Get date range info
 */
export function getDateRangeInfo(reviews) {
  if (!reviews || reviews.length === 0) {
    return {
      earliest: null,
      latest: null,
      span: 0
    };
  }

  const dates = reviews.map(r => new Date(r.date)).sort((a, b) => a - b);

  const earliest = dates[0];
  const latest = dates[dates.length - 1];
  const spanDays = Math.ceil((latest - earliest) / (1000 * 60 * 60 * 24));

  return {
    earliest: earliest.toISOString().split('T')[0],
    latest: latest.toISOString().split('T')[0],
    span: spanDays
  };
}

/**
 * Check if review is recent
 */
export function isRecent(review, days = 7) {
  const reviewDate = new Date(review.date);
  const today = new Date();
  const diffDays = (today - reviewDate) / (1000 * 60 * 60 * 24);

  return diffDays <= days;
}
