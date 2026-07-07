/**
 * Fuzzy Search Utility
 * Provides fuzzy matching for entity extraction and NLP
 */

/**
 * Calculate Levenshtein distance between two strings
 */
export function levenshteinDistance(str1, str2) {
  const m = str1.length;
  const n = str2.length;
  const dp = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0));

  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (str1[i - 1] === str2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = Math.min(
          dp[i - 1][j] + 1,    // deletion
          dp[i][j - 1] + 1,    // insertion
          dp[i - 1][j - 1] + 1 // substitution
        );
      }
    }
  }

  return dp[m][n];
}

/**
 * Calculate similarity score between two strings (0-1)
 */
export function similarityScore(str1, str2) {
  const s1 = str1.toLowerCase().trim();
  const s2 = str2.toLowerCase().trim();

  if (s1 === s2) return 1.0;

  const maxLen = Math.max(s1.length, s2.length);
  if (maxLen === 0) return 1.0;

  const distance = levenshteinDistance(s1, s2);
  return 1 - (distance / maxLen);
}

/**
 * Fuzzy match a query against a target string
 * Returns score from 0-1
 */
export function fuzzyMatch(query, target, threshold = 0.6) {
  const q = query.toLowerCase().trim();
  const t = target.toLowerCase().trim();

  // Exact match
  if (t === q) return 1.0;

  // Contains match
  if (t.includes(q)) return 0.9;

  // Word boundary match
  const words = t.split(/\s+/);
  for (const word of words) {
    if (word === q) return 0.85;
    if (word.startsWith(q)) return 0.8;
  }

  // Fuzzy similarity
  const score = similarityScore(q, t);
  return score >= threshold ? score : 0;
}

/**
 * Find best fuzzy match from a list of candidates
 * Returns { match, score, index }
 */
export function findBestMatch(query, candidates, threshold = 0.6) {
  let bestMatch = null;
  let bestScore = 0;
  let bestIndex = -1;

  candidates.forEach((candidate, index) => {
    const score = fuzzyMatch(query, candidate, threshold);
    if (score > bestScore) {
      bestScore = score;
      bestMatch = candidate;
      bestIndex = index;
    }
  });

  if (bestScore >= threshold) {
    return { match: bestMatch, score: bestScore, index: bestIndex };
  }

  return null;
}

/**
 * Find all matches above threshold
 * Returns array of { match, score, index }
 */
export function findAllMatches(query, candidates, threshold = 0.6) {
  const matches = [];

  candidates.forEach((candidate, index) => {
    const score = fuzzyMatch(query, candidate, threshold);
    if (score >= threshold) {
      matches.push({ match: candidate, score, index });
    }
  });

  return matches.sort((a, b) => b.score - a.score);
}

/**
 * Extract words that match a pattern
 */
export function extractMatchingWords(text, pattern) {
  const words = text.toLowerCase().split(/\s+/);
  const matches = [];

  words.forEach((word) => {
    if (pattern.test(word)) {
      matches.push(word);
    }
  });

  return matches;
}

/**
 * Check if text contains any of the keywords (fuzzy)
 */
export function containsKeywords(text, keywords, threshold = 0.7) {
  const lowerText = text.toLowerCase();

  for (const keyword of keywords) {
    const lowerKeyword = keyword.toLowerCase();

    // Exact match
    if (lowerText.includes(lowerKeyword)) {
      return { found: true, keyword, score: 1.0 };
    }

    // Fuzzy match
    const score = fuzzyMatch(lowerKeyword, lowerText, threshold);
    if (score >= threshold) {
      return { found: true, keyword, score };
    }
  }

  return { found: false, keyword: null, score: 0 };
}

/**
 * Extract substrings matching a regex pattern
 */
export function extractPattern(text, pattern) {
  const matches = text.match(pattern);
  return matches ? matches : [];
}

/**
 * Normalize text for comparison
 */
export function normalizeText(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s]/g, '') // Remove punctuation
    .replace(/\s+/g, ' ');   // Normalize whitespace
}
