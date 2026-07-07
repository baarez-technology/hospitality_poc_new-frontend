// CRM Search Engine
// Fuzzy search across guest data

/**
 * Fuzzy match scoring
 */
function fuzzyScore(str, pattern) {
  if (!str || !pattern) return 0;

  const strLower = str.toLowerCase();
  const patternLower = pattern.toLowerCase();

  // Exact match
  if (strLower === patternLower) return 1.0;

  // Contains match
  if (strLower.includes(patternLower)) return 0.8;

  // Character-by-character fuzzy matching
  let score = 0;
  let patternIdx = 0;

  for (let i = 0; i < strLower.length && patternIdx < patternLower.length; i++) {
    if (strLower[i] === patternLower[patternIdx]) {
      score += 1;
      patternIdx++;
    }
  }

  if (patternIdx === patternLower.length) {
    return score / strLower.length * 0.6;
  }

  return 0;
}

/**
 * Search guests by query
 */
export function searchGuests(guests, query) {
  if (!query || query.trim().length === 0) {
    return guests;
  }

  const queryLower = query.toLowerCase().trim();

  const results = guests.map(guest => {
    let maxScore = 0;

    // Search in name
    const nameScore = fuzzyScore(guest.name, queryLower);
    maxScore = Math.max(maxScore, nameScore);

    // Search in email
    const emailScore = fuzzyScore(guest.email, queryLower);
    maxScore = Math.max(maxScore, emailScore * 0.9);

    // Search in phone
    const phoneScore = fuzzyScore(guest.phone.replace(/\D/g, ''), queryLower.replace(/\D/g, ''));
    maxScore = Math.max(maxScore, phoneScore * 0.7);

    // Search in tags
    guest.tags.forEach(tag => {
      const tagScore = fuzzyScore(tag, queryLower);
      maxScore = Math.max(maxScore, tagScore * 0.6);
    });

    // Search in notes
    if (guest.notes) {
      const notesScore = fuzzyScore(guest.notes, queryLower);
      maxScore = Math.max(maxScore, notesScore * 0.5);
    }

    // Search in segment/tier
    if (guest.loyaltyTier) {
      const tierScore = fuzzyScore(guest.loyaltyTier, queryLower);
      maxScore = Math.max(maxScore, tierScore * 0.6);
    }

    // Search in source
    const sourceScore = fuzzyScore(guest.source, queryLower);
    maxScore = Math.max(maxScore, sourceScore * 0.5);

    // Search in ID
    const idScore = fuzzyScore(guest.id, queryLower);
    maxScore = Math.max(maxScore, idScore * 0.8);

    return {
      ...guest,
      searchScore: maxScore
    };
  });

  // Filter and sort by relevance
  return results
    .filter(g => g.searchScore > 0.1)
    .sort((a, b) => b.searchScore - a.searchScore);
}

/**
 * Search suggestions/autocomplete
 */
export function getSearchSuggestions(guests, query, limit = 5) {
  if (!query || query.trim().length < 2) {
    return [];
  }

  const queryLower = query.toLowerCase().trim();
  const suggestions = new Set();

  guests.forEach(guest => {
    // Name suggestions
    if (guest.name.toLowerCase().includes(queryLower)) {
      suggestions.add(guest.name);
    }

    // Email suggestions
    if (guest.email.toLowerCase().includes(queryLower)) {
      suggestions.add(guest.email);
    }

    // Tag suggestions
    guest.tags.forEach(tag => {
      if (tag.toLowerCase().includes(queryLower)) {
        suggestions.add(tag);
      }
    });

    // Tier suggestions
    if (guest.loyaltyTier && guest.loyaltyTier.toLowerCase().includes(queryLower)) {
      suggestions.add(guest.loyaltyTier);
    }
  });

  return Array.from(suggestions).slice(0, limit);
}

/**
 * Advanced search with filters
 */
export function advancedSearch(guests, criteria) {
  let results = [...guests];

  // Text query
  if (criteria.query) {
    results = searchGuests(results, criteria.query);
  }

  // LTV range
  if (criteria.minLTV !== undefined) {
    results = results.filter(g => g.totalSpend >= criteria.minLTV);
  }
  if (criteria.maxLTV !== undefined) {
    results = results.filter(g => g.totalSpend <= criteria.maxLTV);
  }

  // Stay count range
  if (criteria.minStays !== undefined) {
    results = results.filter(g => g.totalStays >= criteria.minStays);
  }
  if (criteria.maxStays !== undefined) {
    results = results.filter(g => g.totalStays <= criteria.maxStays);
  }

  // Sentiment range
  if (criteria.minSentiment !== undefined) {
    results = results.filter(g => g.sentimentScore >= criteria.minSentiment);
  }
  if (criteria.maxSentiment !== undefined) {
    results = results.filter(g => g.sentimentScore <= criteria.maxSentiment);
  }

  // Source filter
  if (criteria.sources && criteria.sources.length > 0) {
    results = results.filter(g => criteria.sources.includes(g.source));
  }

  // Tier filter
  if (criteria.tiers && criteria.tiers.length > 0) {
    results = results.filter(g => criteria.tiers.includes(g.loyaltyTier));
  }

  // Tags filter
  if (criteria.tags && criteria.tags.length > 0) {
    results = results.filter(g => {
      return criteria.tags.some(tag => g.tags.includes(tag));
    });
  }

  // Has upcoming booking
  if (criteria.hasUpcomingBooking !== undefined) {
    results = results.filter(g => {
      const hasBooking = g.upcomingBookings && g.upcomingBookings.length > 0;
      return hasBooking === criteria.hasUpcomingBooking;
    });
  }

  // Has complaints
  if (criteria.hasComplaints !== undefined) {
    results = results.filter(g => g.hasComplaints === criteria.hasComplaints);
  }

  // Loyalty member
  if (criteria.loyaltyMember !== undefined) {
    results = results.filter(g => g.loyaltyMember === criteria.loyaltyMember);
  }

  return results;
}

/**
 * Highlight search matches in text
 */
export function highlightMatches(text, query) {
  if (!query || !text) return text;

  const queryLower = query.toLowerCase();
  const textLower = text.toLowerCase();
  const index = textLower.indexOf(queryLower);

  if (index === -1) return text;

  const before = text.substring(0, index);
  const match = text.substring(index, index + query.length);
  const after = text.substring(index + query.length);

  return { before, match, after };
}
