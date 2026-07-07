/**
 * NLP Intent Detection
 * Detects user intent from natural language input
 */

import { AI_INTENTS, INTENT_PATTERNS } from '../data/aiIntents';
import { containsKeywords, normalizeText } from './fuzzySearch';

/**
 * Calculate confidence score for an intent match
 */
function calculateConfidence(patternMatches, keywordMatches, textLength) {
  let confidence = 0;

  // Pattern match contributes 60%
  if (patternMatches > 0) {
    confidence += 0.6;
  }

  // Keyword matches contribute 40%
  const keywordScore = Math.min(keywordMatches / 3, 1.0); // Cap at 3 keywords
  confidence += keywordScore * 0.4;

  // Bonus for shorter, more precise text
  if (textLength < 50) {
    confidence += 0.1;
  }

  // Cap at 1.0
  return Math.min(confidence, 1.0);
}

/**
 * Match text against intent patterns
 */
function matchPatterns(text, patterns) {
  let matches = 0;

  for (const pattern of patterns) {
    if (pattern.test(text)) {
      matches++;
    }
  }

  return matches;
}

/**
 * Count keyword matches in text
 */
function matchKeywords(text, keywords) {
  const lowerText = text.toLowerCase();
  let matches = 0;

  for (const keyword of keywords) {
    if (lowerText.includes(keyword.toLowerCase())) {
      matches++;
    }
  }

  return matches;
}

/**
 * Detect intent from user input
 * Returns { intent, confidence, matches }
 */
export function detectIntent(text) {
  const normalizedText = normalizeText(text);
  const candidates = [];

  // Check each intent pattern
  INTENT_PATTERNS.forEach(intentDef => {
    const patternMatches = matchPatterns(text, intentDef.patterns);
    const keywordMatches = matchKeywords(text, intentDef.keywords);

    if (patternMatches > 0 || keywordMatches > 0) {
      const confidence = calculateConfidence(patternMatches, keywordMatches, text.length);

      candidates.push({
        intent: intentDef.intent,
        confidence: confidence,
        patternMatches: patternMatches,
        keywordMatches: keywordMatches
      });
    }
  });

  // Sort by confidence
  candidates.sort((a, b) => b.confidence - a.confidence);

  // Return best match or UNKNOWN
  if (candidates.length > 0 && candidates[0].confidence >= 0.3) {
    return candidates[0];
  }

  return {
    intent: AI_INTENTS.UNKNOWN,
    confidence: 0,
    patternMatches: 0,
    keywordMatches: 0
  };
}

/**
 * Detect multiple possible intents (when ambiguous)
 */
export function detectMultipleIntents(text, threshold = 0.4) {
  const normalizedText = normalizeText(text);
  const candidates = [];

  INTENT_PATTERNS.forEach(intentDef => {
    const patternMatches = matchPatterns(text, intentDef.patterns);
    const keywordMatches = matchKeywords(text, intentDef.keywords);

    if (patternMatches > 0 || keywordMatches > 0) {
      const confidence = calculateConfidence(patternMatches, keywordMatches, text.length);

      if (confidence >= threshold) {
        candidates.push({
          intent: intentDef.intent,
          confidence: confidence
        });
      }
    }
  });

  // Sort by confidence
  candidates.sort((a, b) => b.confidence - a.confidence);

  return candidates;
}

/**
 * Check if text is a greeting
 */
export function isGreeting(text) {
  const greetings = ['hi', 'hello', 'hey', 'good morning', 'good afternoon', 'good evening', 'greetings'];
  const lowerText = text.toLowerCase().trim();

  for (const greeting of greetings) {
    if (lowerText.startsWith(greeting)) {
      return true;
    }
  }

  return false;
}

/**
 * Check if text is asking for help
 */
export function isHelpRequest(text) {
  const helpKeywords = ['help', 'how do i', 'what can you', 'commands', 'capabilities', 'instructions'];
  const lowerText = text.toLowerCase();

  for (const keyword of helpKeywords) {
    if (lowerText.includes(keyword)) {
      return true;
    }
  }

  return false;
}

/**
 * Determine if intent is an action vs query
 */
export function isActionIntent(intent) {
  const actionIntents = [
    AI_INTENTS.CLEAN_ROOM,
    AI_INTENTS.ASSIGN_STAFF,
    AI_INTENTS.BLOCK_ROOM,
    AI_INTENTS.UNBLOCK_ROOM,
    AI_INTENTS.CREATE_BOOKING,
    AI_INTENTS.CANCEL_BOOKING
  ];

  return actionIntents.includes(intent);
}

/**
 * Determine if intent is a summary request
 */
export function isSummaryIntent(intent) {
  const summaryIntents = [
    AI_INTENTS.SUMMARIZE_HOUSEKEEPING,
    AI_INTENTS.SUMMARIZE_REVENUE,
    AI_INTENTS.SUMMARIZE_REVIEWS,
    AI_INTENTS.SUMMARIZE_CRM,
    AI_INTENTS.SUMMARIZE_DAILY
  ];

  return summaryIntents.includes(intent);
}

/**
 * Get intent category
 */
export function getIntentCategory(intent) {
  const categories = {
    housekeeping: [
      AI_INTENTS.LIST_DIRTY_ROOMS,
      AI_INTENTS.LIST_CLEAN_ROOMS,
      AI_INTENTS.LIST_BLOCKED_ROOMS,
      AI_INTENTS.LIST_IN_PROGRESS_ROOMS,
      AI_INTENTS.CLEAN_ROOM,
      AI_INTENTS.ASSIGN_STAFF,
      AI_INTENTS.BLOCK_ROOM,
      AI_INTENTS.SUMMARIZE_HOUSEKEEPING
    ],
    crm: [
      AI_INTENTS.SHOW_GUESTS,
      AI_INTENTS.LIST_VIP_GUESTS,
      AI_INTENTS.LIST_AT_RISK_GUESTS,
      AI_INTENTS.GUEST_PROFILE,
      AI_INTENTS.GUEST_HISTORY,
      AI_INTENTS.SUMMARIZE_CRM
    ],
    revenue: [
      AI_INTENTS.SHOW_REVENUE,
      AI_INTENTS.REVENUE_TODAY,
      AI_INTENTS.REVENUE_WEEK,
      AI_INTENTS.REVENUE_MONTH,
      AI_INTENTS.PREDICT_OCCUPANCY,
      AI_INTENTS.PREDICT_REVENUE,
      AI_INTENTS.SHOW_OCCUPANCY
    ],
    reputation: [
      AI_INTENTS.SHOW_REVIEWS,
      AI_INTENTS.NEGATIVE_REVIEWS,
      AI_INTENTS.POSITIVE_REVIEWS,
      AI_INTENTS.PLATFORM_RATINGS,
      AI_INTENTS.SENTIMENT_ANALYSIS,
      AI_INTENTS.SUMMARIZE_REVIEWS
    ],
    bookings: [
      AI_INTENTS.SHOW_BOOKINGS,
      AI_INTENTS.CREATE_BOOKING,
      AI_INTENTS.CANCEL_BOOKING
    ],
    general: [
      AI_INTENTS.HELP,
      AI_INTENTS.GREETING,
      AI_INTENTS.UNKNOWN
    ]
  };

  for (const [category, intents] of Object.entries(categories)) {
    if (intents.includes(intent)) {
      return category;
    }
  }

  return 'general';
}
