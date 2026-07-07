/**
 * Sentiment Analysis Engine
 * Rule-based NLP sentiment scoring
 */

// Positive lexicon
const positiveWords = [
  'excellent', 'amazing', 'wonderful', 'fantastic', 'great', 'perfect', 'outstanding',
  'exceptional', 'beautiful', 'lovely', 'superb', 'brilliant', 'incredible', 'awesome',
  'stunning', 'fabulous', 'magnificent', 'marvelous', 'impressive', 'delightful',
  'friendly', 'helpful', 'clean', 'comfortable', 'spacious', 'modern', 'luxurious',
  'recommend', 'love', 'enjoyed', 'pleased', 'satisfied', 'happy', 'best',
  'good', 'nice', 'pleasant', 'charming', 'cozy', 'elegant', 'immaculate'
];

// Negative lexicon
const negativeWords = [
  'terrible', 'horrible', 'awful', 'bad', 'poor', 'worst', 'disappointing',
  'disappointed', 'disgusting', 'dirty', 'filthy', 'nasty', 'rude', 'unprofessional',
  'overpriced', 'expensive', 'small', 'tiny', 'cramped', 'noisy', 'loud',
  'broken', 'damaged', 'old', 'outdated', 'uncomfortable', 'unpleasant',
  'never', 'not', 'waste', 'avoid', 'regret', 'complaint', 'problem', 'issue',
  'slow', 'late', 'waited', 'cold', 'hot', 'smell', 'smelly', 'stain', 'stained'
];

// Intensifiers
const intensifiers = ['very', 'extremely', 'incredibly', 'absolutely', 'completely', 'totally'];

// Negations
const negations = ['not', 'no', 'never', 'neither', 'nobody', 'nothing', 'nowhere'];

// Stopwords
export const stopwords = [
  'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
  'of', 'with', 'by', 'from', 'as', 'is', 'was', 'are', 'were', 'been',
  'be', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
  'should', 'may', 'might', 'must', 'can', 'this', 'that', 'these', 'those',
  'i', 'you', 'he', 'she', 'it', 'we', 'they', 'me', 'him', 'her', 'us', 'them',
  'my', 'your', 'his', 'its', 'our', 'their', 'what', 'which', 'who', 'when',
  'where', 'why', 'how', 'all', 'each', 'every', 'both', 'few', 'more', 'most',
  'some', 'such', 'only', 'own', 'same', 'so', 'than', 'too', 'very'
];

/**
 * Tokenize text into words
 */
function tokenize(text) {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 0);
}

/**
 * Calculate sentiment score from text
 */
export function calculateSentimentScore(text) {
  const words = tokenize(text);
  let positiveCount = 0;
  let negativeCount = 0;
  let intensifierMultiplier = 1;
  let negationActive = false;

  for (let i = 0; i < words.length; i++) {
    const word = words[i];

    // Check for intensifiers
    if (intensifiers.includes(word)) {
      intensifierMultiplier = 1.5;
      continue;
    }

    // Check for negations
    if (negations.includes(word)) {
      negationActive = true;
      continue;
    }

    // Check sentiment
    if (positiveWords.includes(word)) {
      if (negationActive) {
        negativeCount += intensifierMultiplier;
      } else {
        positiveCount += intensifierMultiplier;
      }
      intensifierMultiplier = 1;
      negationActive = false;
    } else if (negativeWords.includes(word)) {
      if (negationActive) {
        positiveCount += intensifierMultiplier;
      } else {
        negativeCount += intensifierMultiplier;
      }
      intensifierMultiplier = 1;
      negationActive = false;
    }
  }

  // Calculate base sentiment score (-1 to 1)
  const totalSentiment = positiveCount - negativeCount;
  const maxSentiment = positiveCount + negativeCount;

  if (maxSentiment === 0) return 0;

  return totalSentiment / maxSentiment;
}

/**
 * Analyze sentiment with rating bias
 */
export function analyzeSentiment(text, rating = null) {
  const textScore = calculateSentimentScore(text);

  // Rating-based bias (5★ = positive bias, 1★ = negative bias)
  let ratingBias = 0;
  if (rating !== null) {
    if (rating >= 4) ratingBias = 0.3;
    else if (rating <= 2) ratingBias = -0.3;
  }

  // Combined score with bias
  const combinedScore = (textScore * 0.7) + (ratingBias);

  // Normalize to 0-1 scale
  const normalizedScore = (combinedScore + 1) / 2;

  // Determine label
  let label = 'neutral';
  if (normalizedScore > 0.6) label = 'positive';
  else if (normalizedScore < 0.4) label = 'negative';

  return {
    label,
    score: Math.max(0, Math.min(1, normalizedScore)),
    confidence: Math.abs(textScore) > 0.3 ? 'high' : Math.abs(textScore) > 0.1 ? 'medium' : 'low'
  };
}

/**
 * Analyze sentiment for multiple reviews
 */
export function analyzeBatchSentiment(reviews) {
  return reviews.map(review => ({
    ...review,
    computedSentiment: analyzeSentiment(review.reviewText, review.rating)
  }));
}

/**
 * Calculate sentiment trends over time
 */
export function calculateSentimentTrend(reviews, periodDays = 7) {
  const trends = [];
  const today = new Date();

  for (let i = periodDays - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];

    const dayReviews = reviews.filter(r => r.date === dateStr);

    if (dayReviews.length > 0) {
      const avgSentiment = dayReviews.reduce((sum, r) => {
        const sentiment = r.computedSentiment || analyzeSentiment(r.reviewText, r.rating);
        return sum + sentiment.score;
      }, 0) / dayReviews.length;

      trends.push({
        date: dateStr,
        score: avgSentiment,
        count: dayReviews.length,
        positive: dayReviews.filter(r => (r.computedSentiment?.label || r.sentiment) === 'Positive').length,
        negative: dayReviews.filter(r => (r.computedSentiment?.label || r.sentiment) === 'Negative').length
      });
    }
  }

  return trends;
}

/**
 * Get sentiment distribution
 */
export function getSentimentDistribution(reviews) {
  const positive = reviews.filter(r => {
    const sentiment = r.computedSentiment?.label || r.sentiment;
    return sentiment === 'Positive' || sentiment === 'positive';
  }).length;

  const negative = reviews.filter(r => {
    const sentiment = r.computedSentiment?.label || r.sentiment;
    return sentiment === 'Negative' || sentiment === 'negative';
  }).length;

  const neutral = reviews.length - positive - negative;

  return {
    positive,
    negative,
    neutral,
    positivePercent: reviews.length > 0 ? (positive / reviews.length) * 100 : 0,
    negativePercent: reviews.length > 0 ? (negative / reviews.length) * 100 : 0,
    neutralPercent: reviews.length > 0 ? (neutral / reviews.length) * 100 : 0
  };
}
