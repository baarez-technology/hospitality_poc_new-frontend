/**
 * AI Agent Hook
 * Main orchestrator for AI functionality
 * Combines NLP, command routing, response generation, and memory
 */

import { useCallback } from 'react';
import { useNLP } from './useNLP';
import { useVoiceEngine } from './useVoiceEngine';
import { routeCommand } from '../utils/aiCommandRouter';
import { generateResponse } from '../utils/aiResponses';
import { getAIMemory } from '../utils/aiMemory';

/**
 * useAIAgent Hook
 * Full AI agent with NLP, command execution, and voice
 */
export function useAIAgent() {
  const nlp = useNLP();
  const voice = useVoiceEngine();
  const memory = getAIMemory();

  /**
   * Process user message and generate AI response
   * This is the main entry point for AI processing
   */
  const processMessage = useCallback(async (userInput) => {
    try {
      // Step 1: NLP Processing (Intent + Entities)
      const nlpResult = nlp.processInput(userInput);

      // Step 2: Validate input
      const validation = nlp.validate(nlpResult);
      if (!validation.valid) {
        return {
          success: false,
          response: validation.reason,
          intent: nlpResult.intent,
          entities: nlpResult.entities,
          confidence: nlpResult.confidence
        };
      }

      // Step 3: Route command and execute
      const commandResult = routeCommand(nlpResult.intent, nlpResult.entities);

      // Step 4: Generate natural language response
      const aiResponse = generateResponse(nlpResult.intent, commandResult, nlpResult.entities);

      // Step 5: Store in memory for context
      memory.addTurn(
        userInput,
        aiResponse,
        nlpResult.intent,
        nlpResult.entities,
        commandResult.action
      );

      // Step 6: Get suggested follow-ups
      const followUps = nlp.getSuggestedFollowUps(nlpResult.intent);

      return {
        success: true,
        response: aiResponse,
        intent: nlpResult.intent,
        entities: nlpResult.entities,
        confidence: nlpResult.confidence,
        data: commandResult.data,
        followUps: followUps
      };
    } catch (error) {
      console.error('AI Agent error:', error);

      return {
        success: false,
        response: `I encountered an error: ${error.message}. Please try again.`,
        intent: 'error',
        entities: {},
        confidence: 0
      };
    }
  }, [nlp, memory]);

  /**
   * Process voice input
   */
  const processVoiceInput = useCallback(async (transcript) => {
    return await processMessage(transcript);
  }, [processMessage]);

  /**
   * Get conversation context
   */
  const getContext = useCallback(() => {
    return {
      lastIntent: memory.getLastIntent(),
      lastEntities: memory.getLastEntities(),
      currentTopic: memory.getCurrentTopic(),
      recentHistory: memory.getRecentHistory(5)
    };
  }, [memory]);

  /**
   * Clear conversation memory
   */
  const clearMemory = useCallback(() => {
    memory.clearHistory();
  }, [memory]);

  /**
   * Get memory stats
   */
  const getMemoryStats = useCallback(() => {
    const history = memory.getFullHistory();
    return {
      conversationLength: history.length,
      currentTopic: memory.getCurrentTopic(),
      lastIntent: memory.getLastIntent()
    };
  }, [memory]);

  /**
   * Enable/disable voice responses
   */
  const setVoiceResponse = useCallback((enabled) => {
    memory.setPreference('voiceResponse', enabled);
  }, [memory]);

  /**
   * Check if voice responses are enabled
   */
  const isVoiceResponseEnabled = useCallback(() => {
    return memory.getPreference('voiceResponse') === true;
  }, [memory]);

  /**
   * Speak AI response if voice is enabled
   */
  const speakResponse = useCallback((text) => {
    if (isVoiceResponseEnabled() && voice.isSupported) {
      voice.speak(text);
    }
  }, [voice, isVoiceResponseEnabled]);

  return {
    // Main processing
    processMessage,
    processVoiceInput,

    // Context & Memory
    getContext,
    clearMemory,
    getMemoryStats,

    // Voice
    voice,
    setVoiceResponse,
    isVoiceResponseEnabled,
    speakResponse,

    // NLP utilities
    nlp
  };
}
