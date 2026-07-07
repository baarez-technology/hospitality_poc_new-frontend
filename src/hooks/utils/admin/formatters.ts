/**
 * Format currency values
 * @param {number} value - The numeric value to format
 * @param {string} currency - Currency code (default: INR)
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (value, currency = 'INR') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

/**
 * Format date to readable string
 * @param {Date|string} date - Date to format
 * @param {string} format - Format type: 'short', 'long', 'time'
 * @returns {string} Formatted date string
 */
export const formatDate = (date, format = 'short') => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;

  if (format === 'short') {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
    }).format(dateObj);
  }

  if (format === 'long') {
    return new Intl.DateTimeFormat('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    }).format(dateObj);
  }

  if (format === 'time') {
    return new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    }).format(dateObj);
  }

  return dateObj.toLocaleDateString();
};

/**
 * Format percentage values
 * @param {number} value - The numeric value to format
 * @param {number} decimals - Number of decimal places
 * @returns {string} Formatted percentage string
 */
export const formatPercentage = (value, decimals = 1) => {
  return `${value.toFixed(decimals)}%`;
};

/**
 * Format large numbers with abbreviations (K, M, B)
 * @param {number} value - The numeric value to format
 * @returns {string} Formatted number string
 */
export const formatCompactNumber = (value) => {
  if (value >= 1000000000) {
    return (value / 1000000000).toFixed(1) + 'B';
  }
  if (value >= 1000000) {
    return (value / 1000000).toFixed(1) + 'M';
  }
  if (value >= 1000) {
    return (value / 1000).toFixed(1) + 'K';
  }
  return value.toString();
};

/**
 * Get relative time string (e.g., "2 hours ago")
 * @param {Date|string} date - Date to format
 * @returns {string} Relative time string
 */
export const getRelativeTime = (date) => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffInSeconds = Math.floor((now - dateObj) / 1000);

  if (diffInSeconds < 60) return 'just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;

  return formatDate(dateObj, 'short');
};

/**
 * Get sentiment color class based on sentiment value
 * @param {string} sentiment - Sentiment value: 'positive', 'neutral', 'negative'
 * @returns {string} Tailwind color class
 */
export const getSentimentColor = (sentiment) => {
  const colors = {
    positive: 'text-green-600 bg-green-50',
    neutral: 'text-aurora-600 bg-aurora-50',
    negative: 'text-sunset-600 bg-sunset-50',
  };
  return colors[sentiment] || colors.neutral;
};

/**
 * Get sentiment icon emoji
 * @param {string} sentiment - Sentiment value
 * @returns {string} Emoji
 */
export const getSentimentEmoji = (sentiment) => {
  const emojis = {
    positive: '😊',
    neutral: '😐',
    negative: '😟',
  };
  return emojis[sentiment] || emojis.neutral;
};
