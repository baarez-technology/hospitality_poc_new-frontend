/**
 * Review Search Functionality
 * Fuzzy search across review fields
 */

/**
 * Simple fuzzy match score
 */
function fuzzyScore(str, pattern) {
  const strLower = str.toLowerCase();
  const patternLower = pattern.toLowerCase();

  // Exact match
  if (strLower === patternLower) return 1.0;

  // Contains match
  if (strLower.includes(patternLower)) return 0.8;

  // Fuzzy character matching
  let patternIdx = 0;
  let matches = 0;

  for (let i = 0; i < strLower.length && patternIdx < patternLower.length; i++) {
    if (strLower[i] === patternLower[patternIdx]) {
      matches++;
      patternIdx++;
    }
  }

  const score = patternIdx === patternLower.length ? matches / strLower.length : 0;
  return score;
}

/**
 * Search reviews by query
 */
export function searchReviews(reviews, query) {
  if (!query || query.trim() === '') return reviews;

  const searchTerm = query.trim().toLowerCase();
  const results = [];

  reviews.forEach(review => {
    let score = 0;

    // Search in guest name
    const nameScore = fuzzyScore(review.guestName, searchTerm);
    score += nameScore * 0.3;

    // Search in review text
    const textScore = fuzzyScore(review.reviewText, searchTerm);
    score += textScore * 0.5;

    // Search in platform
    const platformScore = fuzzyScore(review.platform, searchTerm);
    score += platformScore * 0.1;

    // Search in keywords
    if (review.keywords && review.keywords.length > 0) {
      const keywordScores = review.keywords.map(kw => fuzzyScore(kw, searchTerm));
      const maxKeywordScore = Math.max(...keywordScores, 0);
      score += maxKeywordScore * 0.1;
    }

    // Include if score is above threshold
    if (score > 0.1) {
      results.push({
        ...review,
        searchScore: score
      });
    }
  });

  // Sort by search score
  return results.sort((a, b) => b.searchScore - a.searchScore);
}

/**
 * Search by multiple fields
 */
export function advancedSearch(reviews, criteria) {
  let filtered = [...reviews];

  // Text search
  if (criteria.text && criteria.text.trim()) {
    filtered = searchReviews(filtered, criteria.text);
  }

  // Guest name
  if (criteria.guestName && criteria.guestName.trim()) {
    const name = criteria.guestName.toLowerCase();
    filtered = filtered.filter(r => r.guestName.toLowerCase().includes(name));
  }

  // Platform
  if (criteria.platform && criteria.platform.trim()) {
    const platform = criteria.platform.toLowerCase();
    filtered = filtered.filter(r => r.platform.toLowerCase().includes(platform));
  }

  // Rating range
  if (criteria.minRating !== undefined) {
    filtered = filtered.filter(r => r.rating >= criteria.minRating);
  }

  if (criteria.maxRating !== undefined) {
    filtered = filtered.filter(r => r.rating <= criteria.maxRating);
  }

  // Has reply
  if (criteria.hasReply !== undefined) {
    filtered = filtered.filter(r => (r.hasReply || !!r.reply) === criteria.hasReply);
  }

  // Verified
  if (criteria.verified !== undefined) {
    filtered = filtered.filter(r => r.verified === criteria.verified);
  }

  return filtered;
}

/**
 * Search for keyword mentions
 */
export function searchByKeyword(reviews, keyword) {
  const keywordLower = keyword.toLowerCase();

  return reviews.filter(review => {
    // Check in text
    if (review.reviewText.toLowerCase().includes(keywordLower)) {
      return true;
    }

    // Check in keywords array
    if (review.keywords && review.keywords.length > 0) {
      return review.keywords.some(kw => kw.toLowerCase().includes(keywordLower));
    }

    return false;
  });
}

/**
 * Get search suggestions
 */
export function getSearchSuggestions(reviews, query) {
  if (!query || query.length < 2) return [];

  const queryLower = query.toLowerCase();
  const suggestions = new Set();

  reviews.forEach(review => {
    // Guest names
    if (review.guestName.toLowerCase().includes(queryLower)) {
      suggestions.add(review.guestName);
    }

    // Platforms
    if (review.platform.toLowerCase().includes(queryLower)) {
      suggestions.add(review.platform);
    }

    // Keywords
    if (review.keywords) {
      review.keywords.forEach(kw => {
        if (kw.toLowerCase().includes(queryLower)) {
          suggestions.add(kw);
        }
      });
    }
  });

  return Array.from(suggestions).slice(0, 10);
}
