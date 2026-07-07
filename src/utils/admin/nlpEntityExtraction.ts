/**
 * NLP Entity Extraction
 * Extracts entities from user input (room numbers, names, dates, amounts, etc.)
 */

import { ENTITY_TYPES, STATUS_KEYWORDS, SEGMENT_KEYWORDS, TIME_PERIOD_KEYWORDS } from '@/data/aiIntents';
import { fuzzyMatch, findBestMatch, extractPattern } from './fuzzySearch';

/**
 * Extract room numbers from text
 * Patterns: "room 204", "204", "rm 204", "r204"
 */
export function extractRoomNumbers(text) {
  const patterns = [
    /\broom\s+(\d{3})/gi,           // "room 204"
    /\br\.?\s*(\d{3})/gi,           // "r. 204" or "r204"
    /\brm\.?\s*(\d{3})/gi,          // "rm. 204"
    /\b(\d{3})\b/g                  // standalone "204"
  ];

  const roomNumbers = new Set();

  patterns.forEach(pattern => {
    const matches = text.matchAll(pattern);
    for (const match of matches) {
      const roomNum = match[1] || match[0];
      // Only accept 3-digit numbers as rooms (100-999)
      if (roomNum.length === 3 && parseInt(roomNum) >= 100 && parseInt(roomNum) <= 999) {
        roomNumbers.add(roomNum);
      }
    }
  });

  return Array.from(roomNumbers);
}

/**
 * Extract guest names from text
 * Patterns: capitalized words, common name patterns
 */
export function extractGuestNames(text) {
  // Look for capitalized names (2-3 words)
  const namePattern = /\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,2})\b/g;
  const matches = text.matchAll(namePattern);
  const names = [];

  for (const match of matches) {
    const name = match[1];
    // Filter out common non-name words
    if (!['Show', 'List', 'Tell', 'Give', 'What', 'Who', 'When', 'Where', 'How'].includes(name.split(' ')[0])) {
      names.push(name);
    }
  }

  return names;
}

/**
 * Extract staff names from text
 * Similar to guest names but in context of assignment
 */
export function extractStaffNames(text) {
  // Look for names after "assign", "give to", staff-related keywords
  const patterns = [
    /assign\s+([A-Z][a-z]+)/i,
    /give\s+(?:it\s+)?to\s+([A-Z][a-z]+)/i,
    /([A-Z][a-z]+)\s+should/i,
    /staff\s+([A-Z][a-z]+)/i
  ];

  const staffNames = [];

  patterns.forEach(pattern => {
    const match = text.match(pattern);
    if (match && match[1]) {
      staffNames.push(match[1]);
    }
  });

  return staffNames;
}

/**
 * Extract dates from text
 * Patterns: "Dec 12", "December 12", "12/15", "2024-12-15", relative dates
 */
export function extractDates(text) {
  const dates = [];

  // Relative dates
  const relativeDates = {
    'today': new Date(),
    'tomorrow': new Date(Date.now() + 86400000),
    'yesterday': new Date(Date.now() - 86400000)
  };

  Object.keys(relativeDates).forEach(keyword => {
    if (text.toLowerCase().includes(keyword)) {
      dates.push({
        type: 'relative',
        value: keyword,
        date: relativeDates[keyword]
      });
    }
  });

  // Absolute dates: "Dec 12", "December 15"
  const monthNames = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
  const monthPattern = /(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s+(\d{1,2})/gi;
  const monthMatches = text.matchAll(monthPattern);

  for (const match of monthMatches) {
    const monthAbbr = match[1].toLowerCase().slice(0, 3);
    const day = parseInt(match[2]);
    const monthIndex = monthNames.indexOf(monthAbbr);

    if (monthIndex !== -1) {
      const currentYear = new Date().getFullYear();
      const date = new Date(currentYear, monthIndex, day);
      dates.push({
        type: 'absolute',
        value: `${match[1]} ${match[2]}`,
        date: date
      });
    }
  }

  // Numeric dates: "12/15", "12-15"
  const numericPattern = /(\d{1,2})[\/\-](\d{1,2})/g;
  const numericMatches = text.matchAll(numericPattern);

  for (const match of numericMatches) {
    const month = parseInt(match[1]) - 1;
    const day = parseInt(match[2]);
    const currentYear = new Date().getFullYear();

    if (month >= 0 && month <= 11 && day >= 1 && day <= 31) {
      const date = new Date(currentYear, month, day);
      dates.push({
        type: 'numeric',
        value: match[0],
        date: date
      });
    }
  }

  return dates;
}

/**
 * Extract time periods from text
 * "this week", "last month", "this weekend", etc.
 */
export function extractTimePeriods(text) {
  const timePeriods = [];
  const lowerText = text.toLowerCase();

  Object.entries(TIME_PERIOD_KEYWORDS).forEach(([period, keywords]) => {
    keywords.forEach(keyword => {
      if (lowerText.includes(keyword)) {
        timePeriods.push({
          type: period,
          value: keyword
        });
      }
    });
  });

  return timePeriods;
}

/**
 * Extract amounts from text
 * "$500", "500 dollars", "five hundred"
 */
export function extractAmounts(text) {
  const amounts = [];

  // Currency with symbol: "$500", "€500"
  const currencyPattern = /[\$€£¥](\d+(?:,\d{3})*(?:\.\d{2})?)/g;
  const currencyMatches = text.matchAll(currencyPattern);

  for (const match of currencyMatches) {
    const amount = parseFloat(match[1].replace(/,/g, ''));
    amounts.push({
      type: 'currency',
      value: match[0],
      amount: amount
    });
  }

  // Numeric amounts with "dollars", "euros", etc.
  const wordCurrencyPattern = /(\d+(?:,\d{3})*(?:\.\d{2})?)\s*(dollars?|euros?|pounds?|usd|eur|gbp)/gi;
  const wordMatches = text.matchAll(wordCurrencyPattern);

  for (const match of wordMatches) {
    const amount = parseFloat(match[1].replace(/,/g, ''));
    amounts.push({
      type: 'word_currency',
      value: match[0],
      amount: amount,
      currency: match[2]
    });
  }

  return amounts;
}

/**
 * Extract status keywords from text
 * "dirty", "clean", "blocked", "in progress"
 */
export function extractStatus(text) {
  const statuses = [];
  const lowerText = text.toLowerCase();

  Object.entries(STATUS_KEYWORDS).forEach(([status, keywords]) => {
    keywords.forEach(keyword => {
      if (lowerText.includes(keyword)) {
        statuses.push({
          type: status,
          value: keyword
        });
      }
    });
  });

  return statuses;
}

/**
 * Extract segment keywords from text
 * "VIP", "at-risk", "new", "returning", "corporate"
 */
export function extractSegments(text) {
  const segments = [];
  const lowerText = text.toLowerCase();

  Object.entries(SEGMENT_KEYWORDS).forEach(([segment, keywords]) => {
    keywords.forEach(keyword => {
      if (lowerText.includes(keyword)) {
        segments.push({
          type: segment,
          value: keyword
        });
      }
    });
  });

  return segments;
}

/**
 * Extract platform names from text
 * "Booking.com", "Expedia", "Airbnb", etc.
 */
export function extractPlatforms(text) {
  const platforms = [
    'Booking.com', 'Expedia', 'Airbnb', 'Agoda', 'Hotels.com',
    'TripAdvisor', 'Google', 'Yelp'
  ];

  const found = [];
  const lowerText = text.toLowerCase();

  platforms.forEach(platform => {
    if (lowerText.includes(platform.toLowerCase())) {
      found.push(platform);
    }
  });

  return found;
}

/**
 * Main entity extraction function
 * Extracts all entities from text
 */
export function extractEntities(text) {
  return {
    roomNumbers: extractRoomNumbers(text),
    guestNames: extractGuestNames(text),
    staffNames: extractStaffNames(text),
    dates: extractDates(text),
    timePeriods: extractTimePeriods(text),
    amounts: extractAmounts(text),
    statuses: extractStatus(text),
    segments: extractSegments(text),
    platforms: extractPlatforms(text)
  };
}
