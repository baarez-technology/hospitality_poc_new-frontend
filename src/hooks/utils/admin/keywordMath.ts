import { stopwords } from './sentimentMath';

/**
 * Keyword Extraction Engine
 * Frequency-based keyword extraction with scoring
 */

// Common hotel-related stopwords to exclude
const hotelStopwords = [
  'hotel', 'room', 'stay', 'stayed', 'night', 'nights', 'day', 'days',
  'time', 'place', 'thing', 'really', 'just', 'also', 'one', 'two',
  'get', 'got', 'went', 'came', 'back', 'made', 'make', 'said'
];

const allStopwords = [...stopwords, ...hotelStopwords];

/**
 * Tokenize and clean text
 */
function tokenize(text) {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 2) // Remove very short words
    .filter(word => !allStopwords.includes(word));
}

/**
 * Simple lemmatization (basic stemming)
 */
function lemmatize(word) {
  // Remove common suffixes
  const suffixes = ['ing', 'ed', 'es', 's', 'ly', 'er', 'est'];

  for (const suffix of suffixes) {
    if (word.endsWith(suffix) && word.length > suffix.length + 2) {
      return word.slice(0, -suffix.length);
    }
  }

  return word;
}

/**
 * Extract keywords from a single review
 */
export function extractKeywordsFromText(text, maxKeywords = 10) {
  const words = tokenize(text);
  const frequency = {};

  // Count frequency with lemmatization
  words.forEach(word => {
    const lemma = lemmatize(word);
    frequency[lemma] = (frequency[lemma] || 0) + 1;
  });

  // Sort by frequency and return top keywords
  return Object.entries(frequency)
    .sort((a, b) => b[1] - a[1])
    .slice(0, maxKeywords)
    .map(([word, count]) => ({ word, count }));
}

/**
 * Extract keywords from multiple reviews
 */
export function extractKeywordsFromReviews(reviews, minFrequency = 2) {
  const allWords = {};

  reviews.forEach(review => {
    const words = tokenize(review.reviewText);
    const uniqueWords = new Set();

    words.forEach(word => {
      const lemma = lemmatize(word);
      uniqueWords.add(lemma);
    });

    // Count each unique word once per review
    uniqueWords.forEach(word => {
      if (!allWords[word]) {
        allWords[word] = {
          word,
          count: 0,
          reviews: [],
          positive: 0,
          negative: 0,
          neutral: 0
        };
      }
      allWords[word].count++;
      allWords[word].reviews.push(review.id);

      // Track sentiment
      const sentiment = review.computedSentiment?.label || review.sentiment || 'Neutral';
      if (sentiment === 'Positive' || sentiment === 'positive') {
        allWords[word].positive++;
      } else if (sentiment === 'Negative' || sentiment === 'negative') {
        allWords[word].negative++;
      } else {
        allWords[word].neutral++;
      }
    });
  });

  // Filter by minimum frequency and sort
  return Object.values(allWords)
    .filter(kw => kw.count >= minFrequency)
    .map(kw => ({
      ...kw,
      score: kw.count * (1 + (kw.positive - kw.negative) / 10),
      sentiment: kw.positive > kw.negative ? 'positive' : kw.negative > kw.positive ? 'negative' : 'neutral'
    }))
    .sort((a, b) => b.count - a.count);
}

/**
 * Get top keywords by sentiment
 */
export function getKeywordsBySentiment(keywords, sentiment, limit = 10) {
  return keywords
    .filter(kw => kw.sentiment === sentiment)
    .slice(0, limit);
}

/**
 * Get trending keywords (keywords with increasing mentions)
 */
export function getTrendingKeywords(reviews, recentDays = 7) {
  const today = new Date();
  const cutoffDate = new Date(today);
  cutoffDate.setDate(today.getDate() - recentDays);

  const recentReviews = reviews.filter(r => new Date(r.date) >= cutoffDate);
  const olderReviews = reviews.filter(r => new Date(r.date) < cutoffDate);

  const recentKeywords = extractKeywordsFromReviews(recentReviews, 1);
  const olderKeywords = extractKeywordsFromReviews(olderReviews, 1);

  const trending = recentKeywords.map(recent => {
    const older = olderKeywords.find(k => k.word === recent.word);
    const oldCount = older ? older.count : 0;

    let trend = 0;
    if (oldCount > 0) {
      trend = ((recent.count - oldCount) / oldCount) * 100;
    } else if (recent.count > 0) {
      trend = 100;
    }

    return {
      ...recent,
      trend: Math.round(trend),
      trendDirection: trend > 10 ? 'up' : trend < -10 ? 'down' : 'stable'
    };
  });

  return trending
    .filter(kw => kw.trend > 0)
    .sort((a, b) => b.trend - a.trend);
}

/**
 * Extract keyword phrases (bigrams)
 */
export function extractPhrases(text) {
  const words = tokenize(text);
  const phrases = [];

  for (let i = 0; i < words.length - 1; i++) {
    const phrase = `${words[i]} ${words[i + 1]}`;
    phrases.push(phrase);
  }

  return phrases;
}

/**
 * Get common phrases from reviews
 */
export function getCommonPhrases(reviews, minFrequency = 3) {
  const phraseCount = {};

  reviews.forEach(review => {
    const phrases = extractPhrases(review.reviewText);
    phrases.forEach(phrase => {
      phraseCount[phrase] = (phraseCount[phrase] || 0) + 1;
    });
  });

  return Object.entries(phraseCount)
    .filter(([phrase, count]) => count >= minFrequency)
    .map(([phrase, count]) => ({ phrase, count }))
    .sort((a, b) => b.count - a.count);
}

/**
 * Calculate keyword density
 */
export function calculateKeywordDensity(text, keyword) {
  const words = tokenize(text);
  const keywordCount = words.filter(w => w === keyword.toLowerCase()).length;

  return words.length > 0 ? (keywordCount / words.length) * 100 : 0;
}

/**
 * Get keyword context (surrounding words)
 */
export function getKeywordContext(text, keyword, contextSize = 5) {
  const words = tokenize(text);
  const contexts = [];

  words.forEach((word, index) => {
    if (word === keyword.toLowerCase()) {
      const start = Math.max(0, index - contextSize);
      const end = Math.min(words.length, index + contextSize + 1);
      const context = words.slice(start, end).join(' ');
      contexts.push(context);
    }
  });

  return contexts;
}
