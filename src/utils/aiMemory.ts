/**
 * AI Memory System
 * Maintains context and conversation history for follow-up questions
 */

/**
 * AI Memory Store
 */
class AIMemory {
  constructor() {
    this.conversationHistory = [];
    this.context = {
      lastIntent: null,
      lastEntities: null,
      lastAction: null,
      lastResult: null,
      currentTopic: null,
      userPreferences: {}
    };
    this.maxHistorySize = 20;
  }

  /**
   * Add a conversation turn to history
   */
  addTurn(userInput, aiResponse, intent, entities, action = null) {
    const turn = {
      timestamp: new Date().toISOString(),
      userInput: userInput,
      aiResponse: aiResponse,
      intent: intent,
      entities: entities,
      action: action
    };

    this.conversationHistory.push(turn);

    // Trim history if too long
    if (this.conversationHistory.length > this.maxHistorySize) {
      this.conversationHistory.shift();
    }

    // Update context
    this.context.lastIntent = intent;
    this.context.lastEntities = entities;
    this.context.lastAction = action;

    // Update topic
    this.updateCurrentTopic(intent);
  }

  /**
   * Update current conversation topic
   */
  updateCurrentTopic(intent) {
    const topicMap = {
      // Housekeeping topics
      list_dirty_rooms: 'housekeeping',
      list_clean_rooms: 'housekeeping',
      clean_room: 'housekeeping',
      assign_staff: 'housekeeping',
      block_room: 'housekeeping',
      summarize_housekeeping: 'housekeeping',

      // CRM topics
      show_guests: 'crm',
      list_vip_guests: 'crm',
      list_at_risk_guests: 'crm',
      guest_profile: 'crm',
      summarize_crm: 'crm',

      // Revenue topics
      show_revenue: 'revenue',
      revenue_today: 'revenue',
      predict_occupancy: 'revenue',
      predict_revenue: 'revenue',

      // Reputation topics
      show_reviews: 'reputation',
      negative_reviews: 'reputation',
      platform_ratings: 'reputation',
      summarize_reviews: 'reputation'
    };

    this.context.currentTopic = topicMap[intent] || null;
  }

  /**
   * Get last intent
   */
  getLastIntent() {
    return this.context.lastIntent;
  }

  /**
   * Get last entities
   */
  getLastEntities() {
    return this.context.lastEntities;
  }

  /**
   * Get last action result
   */
  getLastAction() {
    return this.context.lastAction;
  }

  /**
   * Get current topic
   */
  getCurrentTopic() {
    return this.context.currentTopic;
  }

  /**
   * Get recent conversation history
   */
  getRecentHistory(count = 5) {
    return this.conversationHistory.slice(-count);
  }

  /**
   * Get full conversation history
   */
  getFullHistory() {
    return this.conversationHistory;
  }

  /**
   * Check if user is asking a follow-up question
   * Returns true if input contains pronouns or references without entities
   */
  isFollowUpQuestion(input, entities) {
    const followUpIndicators = [
      /\b(them|those|these|that|it|they)\b/i,
      /\b(more|again|also|too)\b/i,
      /\b(sort|filter|show|list)\s+(them|those|these|it)\b/i
    ];

    // Check if has follow-up indicators
    const hasIndicators = followUpIndicators.some(pattern => pattern.test(input));

    // Check if missing key entities (suggesting reference to previous context)
    const hasFewEntities = Object.values(entities).every(arr =>
      !arr || (Array.isArray(arr) ? arr.length === 0 : !arr)
    );

    return hasIndicators && hasFewEntities;
  }

  /**
   * Resolve follow-up question using context
   * Example: "Sort them by LTV" → use last entities (VIP guests)
   */
  resolveFollowUp(input, currentEntities) {
    if (!this.context.lastEntities) {
      return currentEntities;
    }

    // Merge current entities with last entities
    const resolved = { ...currentEntities };

    // If current entities are empty, use last entities
    Object.keys(this.context.lastEntities).forEach(key => {
      if (!resolved[key] || (Array.isArray(resolved[key]) && resolved[key].length === 0)) {
        resolved[key] = this.context.lastEntities[key];
      }
    });

    return resolved;
  }

  /**
   * Extract sort criteria from follow-up
   */
  extractSortCriteria(input) {
    const sortPatterns = {
      ltv: /sort.*ltv|ltv.*sort|by.*lifetime.*value/i,
      name: /sort.*name|alphabetically|by.*name/i,
      date: /sort.*date|by.*date|chronologically/i,
      rating: /sort.*rating|by.*rating|by.*score/i,
      revenue: /sort.*revenue|by.*revenue|by.*spend/i
    };

    for (const [criteria, pattern] of Object.entries(sortPatterns)) {
      if (pattern.test(input)) {
        return criteria;
      }
    }

    return null;
  }

  /**
   * Extract filter criteria from follow-up
   */
  extractFilterCriteria(input) {
    const filterPatterns = {
      vip: /vip|premium|high.*value/i,
      active: /active|recent/i,
      new: /new|first.*time/i,
      negative: /negative|bad|poor/i,
      positive: /positive|good|excellent/i
    };

    const filters = [];

    for (const [criteria, pattern] of Object.entries(filterPatterns)) {
      if (pattern.test(input)) {
        filters.push(criteria);
      }
    }

    return filters;
  }

  /**
   * Set user preference
   */
  setPreference(key, value) {
    this.context.userPreferences[key] = value;
  }

  /**
   * Get user preference
   */
  getPreference(key) {
    return this.context.userPreferences[key];
  }

  /**
   * Clear all memory
   */
  clear() {
    this.conversationHistory = [];
    this.context = {
      lastIntent: null,
      lastEntities: null,
      lastAction: null,
      lastResult: null,
      currentTopic: null,
      userPreferences: {}
    };
  }

  /**
   * Clear just conversation history, keep preferences
   */
  clearHistory() {
    this.conversationHistory = [];
    this.context.lastIntent = null;
    this.context.lastEntities = null;
    this.context.lastAction = null;
    this.context.lastResult = null;
    this.context.currentTopic = null;
  }
}

// Singleton instance
let memoryInstance = null;

/**
 * Get AI memory instance (singleton)
 */
export function getAIMemory() {
  if (!memoryInstance) {
    memoryInstance = new AIMemory();
  }
  return memoryInstance;
}

/**
 * Reset AI memory instance
 */
export function resetAIMemory() {
  if (memoryInstance) {
    memoryInstance.clear();
  } else {
    memoryInstance = new AIMemory();
  }
  return memoryInstance;
}
