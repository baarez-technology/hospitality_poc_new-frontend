/**
 * NLP Hook
 * Combines intent detection and entity extraction for natural language processing
 */

import { useCallback } from 'react';
import { detectIntent } from '../utils/nlpIntentDetection';
import { extractEntities } from '../utils/nlpEntityExtraction';
import { getAIMemory } from '../utils/aiMemory';

/**
 * useNLP Hook
 * Provides natural language processing capabilities
 */
export function useNLP() {
  const memory = getAIMemory();

  /**
   * Process user input - detect intent and extract entities
   */
  const processInput = useCallback((text) => {
    // Detect intent
    const intentResult = detectIntent(text);

    // Extract entities
    const entities = extractEntities(text);

    // Check if this is a follow-up question
    const isFollowUp = memory.isFollowUpQuestion(text, entities);

    // If follow-up, merge with last entities
    let finalEntities = entities;
    if (isFollowUp) {
      finalEntities = memory.resolveFollowUp(text, entities);
    }

    // Extract additional context from follow-ups
    const sortCriteria = memory.extractSortCriteria(text);
    const filterCriteria = memory.extractFilterCriteria(text);

    return {
      intent: intentResult.intent,
      confidence: intentResult.confidence,
      entities: finalEntities,
      isFollowUp,
      sortCriteria,
      filterCriteria,
      rawText: text
    };
  }, [memory]);

  /**
   * Validate if input has sufficient information for action
   */
  const validate = useCallback((nlpResult) => {
    const { intent, entities, confidence } = nlpResult;

    // Check confidence threshold
    if (confidence < 0.3) {
      return {
        valid: false,
        reason: 'Low confidence - please rephrase'
      };
    }

    // Validate required entities for specific intents
    if (intent === 'clean_room' || intent === 'block_room') {
      if (!entities.roomNumbers || entities.roomNumbers.length === 0) {
        return {
          valid: false,
          reason: 'Please specify a room number'
        };
      }
    }

    if (intent === 'assign_staff') {
      if (!entities.roomNumbers || entities.roomNumbers.length === 0) {
        return {
          valid: false,
          reason: 'Please specify a room number'
        };
      }
      if (!entities.staffNames || entities.staffNames.length === 0) {
        return {
          valid: false,
          reason: 'Please specify a staff member name'
        };
      }
    }

    return {
      valid: true
    };
  }, []);

  /**
   * Get suggested follow-up questions based on intent
   */
  const getSuggestedFollowUps = useCallback((intent) => {
    const followUps = {
      list_dirty_rooms: [
        "Assign staff to these rooms",
        "Sort by room type",
        "Show only suites"
      ],
      list_vip_guests: [
        "Sort them by LTV",
        "Show their upcoming bookings",
        "Filter by last visit date"
      ],
      show_revenue: [
        "Compare with last month",
        "Break down by source",
        "Show forecast"
      ],
      negative_reviews: [
        "Group by platform",
        "Show common issues",
        "Draft response emails"
      ]
    };

    return followUps[intent] || [];
  }, []);

  return {
    processInput,
    validate,
    getSuggestedFollowUps
  };
}
