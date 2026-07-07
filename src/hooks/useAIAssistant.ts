import { useState, useCallback, useRef, useEffect } from 'react';
import { adminAIService, PendingAction } from '@/api/services/admin-ai.service';

interface AIMessage {
  id: string;
  type: 'user' | 'ai';
  text: string;
  timestamp: string;
  data?: Record<string, unknown> | null;
  intent?: string;
  confidence?: number;
  queryResults?: Array<Record<string, unknown>>;
  queryMetadata?: Record<string, unknown>;
  pendingAction?: PendingAction;
  actionResult?: Record<string, unknown>;
  suggestions?: string[];
}

export function useAIAssistant() {
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [voiceModalOpen, setVoiceModalOpen] = useState(false);
  const [sessionId] = useState<string>(() => adminAIService.generateSessionId());
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null);
  const [queryResults, setQueryResults] = useState<Array<Record<string, unknown>> | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const conversationEndRef = useRef<HTMLDivElement | null>(null);

  const getConversationContext = useCallback(() => {
    return messages.slice(-10).map(m => ({
      role: m.type === 'user' ? 'user' : 'assistant',
      content: m.text
    }));
  }, [messages]);

  const addUserMessage = useCallback(async (text: string) => {
    if (!text || text.trim().length === 0) return;
    const userMessage: AIMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: 'user',
      text: text.trim(),
      timestamp: new Date().toISOString()
    };
    setMessages(prev => [...prev, userMessage]);
    setPendingAction(null);
    setIsTyping(true);

    try {
      const response = await adminAIService.chat({
        message: text.trim(),
        session_id: sessionId,
        context: { previousMessages: getConversationContext() }
      });

      const aiMessage: AIMessage = {
        id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type: 'ai',
        text: response.message,
        intent: response.intent,
        confidence: response.confidence,
        timestamp: new Date().toISOString(),
        queryResults: response.query_results || undefined,
        queryMetadata: response.query_metadata || undefined,
        pendingAction: response.pending_action || undefined,
        actionResult: response.action_result || undefined,
        suggestions: response.suggestions || undefined
      };
      setMessages(prev => [...prev, aiMessage]);

      if (response.intent !== 'error') {
        if (response.query_results) setQueryResults(response.query_results);
        if (response.pending_action) setPendingAction(response.pending_action);
        if (response.suggestions) setSuggestions(response.suggestions);
      }
    } catch (error) {
      console.error('Error generating AI response:', error);
      const errorMessage: AIMessage = {
        id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type: 'ai',
        text: 'I am having trouble connecting to the AI service. Please ensure the backend is running.',
        intent: 'error',
        confidence: 0,
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMessage]);
    }
    setIsTyping(false);
  }, [sessionId, getConversationContext]);

  const confirmAction = useCallback(async () => {
    if (!pendingAction) return;
    setIsTyping(true);
    try {
      const response = await adminAIService.executeAction(pendingAction.action_id);
      setMessages(prev => [...prev, { id: `msg-${Date.now()}`, type: 'ai', text: response.message, timestamp: new Date().toISOString(), actionResult: response.action_result }]);
      setPendingAction(null);
    } catch (error) {
      setMessages(prev => [...prev, { id: `msg-${Date.now()}`, type: 'ai', text: 'Failed to execute action.', timestamp: new Date().toISOString() }]);
    }
    setIsTyping(false);
  }, [pendingAction]);

  const cancelAction = useCallback(() => {
    setPendingAction(null);
    setMessages(prev => [...prev, { id: `msg-${Date.now()}`, type: 'ai', text: 'Action cancelled.', timestamp: new Date().toISOString() }]);
  }, []);

  const addAIMessage = useCallback((text: string, data: Record<string, unknown> | null = null) => {
    if (!text) return;
    setMessages(prev => [...prev, { id: `msg-${Date.now()}`, type: 'ai', text: text.trim(), data, timestamp: new Date().toISOString() }]);
    setIsTyping(false);
  }, []);

  const togglePanel = useCallback(() => setIsPanelOpen(prev => !prev), []);
  const openPanel = useCallback(() => setIsPanelOpen(true), []);
  const closePanel = useCallback(() => setIsPanelOpen(false), []);
  const toggleListening = useCallback(() => {
    if (isListening) { setIsListening(false); setVoiceModalOpen(false); }
    else { setIsListening(true); setVoiceModalOpen(true); setIsPanelOpen(true); }
  }, [isListening]);
  const startListening = useCallback(() => { setIsListening(true); setVoiceModalOpen(true); setIsPanelOpen(true); }, []);
  const stopListening = useCallback(() => { setIsListening(false); setVoiceModalOpen(false); }, []);
  const handleVoiceInput = useCallback((transcript: string) => { if (transcript) { addUserMessage(transcript); stopListening(); } }, [addUserMessage, stopListening]);
  const clearConversation = useCallback(() => { setMessages([]); setIsTyping(false); setPendingAction(null); setQueryResults(null); setSuggestions([]); }, []);

  const sendQuickAction = useCallback((actionLabel: string) => {
    const prompts: Record<string, string> = {
      'Generate Report': 'Generate a comprehensive daily operations report',
      'Analyze Data': 'Analyze today revenue and occupancy data',
    };
    addUserMessage(prompts[actionLabel] || actionLabel);
  }, [addUserMessage]);
  const sendSuggestion = useCallback((p: string) => addUserMessage(p), [addUserMessage]);

  useEffect(() => { if (conversationEndRef.current) conversationEndRef.current.scrollIntoView({ behavior: 'smooth' }); }, [messages, isTyping]);

  return {
    messages, isPanelOpen, isListening, isTyping, voiceModalOpen, conversationEndRef,
    sessionId, pendingAction, queryResults, suggestions,
    addUserMessage, addAIMessage, clearConversation,
    togglePanel, openPanel, closePanel,
    toggleListening, startListening, stopListening, handleVoiceInput,
    sendQuickAction, sendSuggestion, confirmAction, cancelAction,
    hasMessages: messages.length > 0,
    hasPendingAction: pendingAction !== null,
    hasQueryResults: queryResults !== null && queryResults.length > 0,
    voiceTranscript: '',
    voiceSupported: typeof window !== 'undefined' && 'webkitSpeechRecognition' in window
  };
}
