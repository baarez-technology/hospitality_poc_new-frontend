import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Brain,
  Users,
  MessageSquare,
  TrendingUp,
  Heart,
  Gift,
  Target,
  Sparkles,
  Mic,
  Send,
  X,
  Trash2,
  ChevronRight,
  UserCheck,
  Award,
  DollarSign,
  Mail,
  RefreshCw
} from 'lucide-react';
import { adminAIService, AdminAIChatResponse } from '../../../api/services/admin-ai.service';
import crmAIService, { SidebarStats } from '../../../api/services/crm-ai.service';
import VoiceRecorderModal from '../../../components/admin-panel/ai/VoiceRecorderModal';

/**
 * Simple Markdown renderer for AI messages
 */
function renderMarkdown(text: string): React.ReactNode {
  if (!text) return null;

  const lines = text.split('\n');
  const elements: React.ReactNode[] = [];
  let listItems: React.ReactNode[] = [];
  let listType: 'ul' | 'ol' | null = null;

  const processInlineMarkdown = (line: string): React.ReactNode => {
    const parts: React.ReactNode[] = [];
    let remaining = line;
    let key = 0;

    while (remaining.length > 0) {
      const boldMatch = remaining.match(/\*\*([^*]+)\*\*/);

      if (boldMatch && boldMatch.index !== undefined) {
        if (boldMatch.index > 0) {
          parts.push(<span key={key++}>{remaining.substring(0, boldMatch.index)}</span>);
        }
        parts.push(<strong key={key++} className="font-bold text-neutral-900">{boldMatch[1]}</strong>);
        remaining = remaining.substring(boldMatch.index + boldMatch[0].length);
      } else {
        parts.push(<span key={key++}>{remaining}</span>);
        break;
      }
    }

    return parts.length === 1 ? parts[0] : <>{parts}</>;
  };

  const flushList = () => {
    if (listItems.length > 0) {
      if (listType === 'ul') {
        elements.push(
          <ul key={elements.length} className="list-disc list-inside space-y-1 my-2 ml-2">
            {listItems}
          </ul>
        );
      } else {
        elements.push(
          <ol key={elements.length} className="list-decimal list-inside space-y-1 my-2 ml-2">
            {listItems}
          </ol>
        );
      }
      listItems = [];
      listType = null;
    }
  };

  lines.forEach((line) => {
    const trimmedLine = line.trim();

    if (/^[-•]\s+/.test(trimmedLine)) {
      if (listType !== 'ul') {
        flushList();
        listType = 'ul';
      }
      const content = trimmedLine.replace(/^[-•]\s+/, '');
      listItems.push(
        <li key={listItems.length} className="text-neutral-700">
          {processInlineMarkdown(content)}
        </li>
      );
      return;
    }

    if (/^\d+\.\s+/.test(trimmedLine)) {
      if (listType !== 'ol') {
        flushList();
        listType = 'ol';
      }
      const content = trimmedLine.replace(/^\d+\.\s+/, '');
      listItems.push(
        <li key={listItems.length} className="text-neutral-700">
          {processInlineMarkdown(content)}
        </li>
      );
      return;
    }

    flushList();

    if (trimmedLine === '') {
      elements.push(<div key={elements.length} className="h-2" />);
      return;
    }

    elements.push(
      <p key={elements.length} className="text-neutral-700">
        {processInlineMarkdown(trimmedLine)}
      </p>
    );
  });

  flushList();

  return <div className="space-y-1">{elements}</div>;
}

interface Message {
  id: string;
  type: 'user' | 'ai';
  text: string;
  timestamp: string;
  intent?: string;
  confidence?: number;
  queryResults?: Array<Record<string, unknown>>;
  suggestions?: string[];
  pendingAction?: {
    action_id: string;
    action_type: string;
    description: string;
    params: Record<string, unknown>;
  };
}

// CRM-specific quick actions
const CRM_QUICK_ACTIONS = [
  { label: 'VIP Guests', action: 'Show me all VIP guests', icon: Award },
  { label: 'Loyalty Stats', action: 'What are our loyalty program statistics?', icon: Heart },
  { label: 'High LTV Guests', action: 'List guests with highest lifetime value', icon: DollarSign },
  { label: 'Repeat Visitors', action: 'How many repeat guests do we have?', icon: RefreshCw },
  { label: 'Guest Segments', action: 'Show guest segments breakdown', icon: Target },
  { label: 'Recent Feedback', action: 'Show recent guest feedback', icon: MessageSquare },
];

// Suggested prompts for CRM
const CRM_SUGGESTIONS = [
  "Which guests have the highest lifetime value?",
  "Show me guests who haven't visited in 6 months",
  "What's our guest retention rate?",
  "List all corporate guests",
  "Which loyalty tier has the most members?",
  "Show me guest birthday celebrations this month",
  "Analyze guest spending patterns",
  "Which guests should we send a re-engagement campaign?",
];

export default function CRMAI() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  const [sessionId, setSessionId] = useState(() => adminAIService.generateSessionId());
  const [isExecutingAction, setIsExecutingAction] = useState(false);
  const [sidebarStats, setSidebarStats] = useState<SidebarStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Fetch sidebar stats on mount
  const fetchSidebarStats = useCallback(async () => {
    setStatsLoading(true);
    setStatsError(false);
    try {
      const stats = await crmAIService.getSidebarStats();
      setSidebarStats(stats);
    } catch (error) {
      console.error('Failed to fetch sidebar stats:', error);
      setStatsError(true);
      // Set default fallback values
      setSidebarStats({
        total_guests: 0,
        loyalty_members: 0,
        vip_guests: 0,
        avg_ltv: 0,
        at_risk_count: 0,
        recovery_pending: 0,
        open_alerts: 0,
        campaigns_active: 0
      });
    } finally {
      setStatsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSidebarStats();
  }, [fetchSidebarStats]);

  // Send message to AI
  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim()) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      type: 'user',
      text: text.trim(),
      timestamp: new Date().toLocaleTimeString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    try {
      const response = await adminAIService.chat({
        message: text.trim(),
        session_id: sessionId,
        context: {
          currentPage: 'CRM AI',
          previousMessages: messages.slice(-5).map(m => ({
            role: m.type === 'user' ? 'user' : 'assistant',
            content: m.text
          }))
        }
      });

      const aiMessage: Message = {
        id: `ai-${Date.now()}`,
        type: 'ai',
        text: response.message,
        timestamp: new Date().toLocaleTimeString(),
        intent: response.intent,
        confidence: response.confidence,
        queryResults: response.query_results,
        suggestions: response.suggestions,
        pendingAction: response.pending_action
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('AI chat error:', error);
      const errorMessage: Message = {
        id: `ai-${Date.now()}`,
        type: 'ai',
        text: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date().toLocaleTimeString()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  }, [sessionId, messages]);

  // Handle action confirmation
  const handleConfirmAction = useCallback(async () => {
    const lastMessage = messages[messages.length - 1];
    if (!lastMessage?.pendingAction) return;

    setIsExecutingAction(true);

    try {
      const response = await adminAIService.executeAction(lastMessage.pendingAction.action_id);

      const resultMessage: Message = {
        id: `ai-${Date.now()}`,
        type: 'ai',
        text: response.message,
        timestamp: new Date().toLocaleTimeString(),
        queryResults: response.query_results
      };

      setMessages(prev => [...prev, resultMessage]);
    } catch (error) {
      console.error('Action execution error:', error);
    } finally {
      setIsExecutingAction(false);
    }
  }, [messages]);

  // Handle voice transcript
  const handleVoiceTranscript = useCallback((transcript: string) => {
    setIsVoiceModalOpen(false);
    if (transcript) {
      sendMessage(transcript);
    }
  }, [sendMessage]);

  // Clear conversation
  const clearConversation = useCallback(() => {
    setMessages([]);
    setSessionId(adminAIService.generateSessionId());
  }, []);

  // Handle form submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(inputValue);
  };

  // Handle keyboard shortcuts
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(inputValue);
    }
  };

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="h-full flex flex-col">
        {/* Header */}
        <div className="flex-shrink-0 px-4 sm:px-6 lg:px-10 py-4 sm:py-6 border-b border-neutral-100 bg-white/80 backdrop-blur-sm">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="lg:hidden flex-shrink-0 w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-neutral-100 flex items-center justify-center hover:bg-neutral-200 transition-colors"
              >
                <Users className="w-4 h-4 text-neutral-600" />
              </button>
              <div className="min-w-0">
                <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-neutral-900 truncate">CRM AI Assistant</h1>
                <p className="text-[12px] sm:text-[13px] text-neutral-500 mt-0.5 sm:mt-1 hidden sm:block">
                  Intelligent guest relationship insights powered by AI
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
              {messages.length > 0 && (
                <button
                  onClick={clearConversation}
                  className="inline-flex items-center justify-center h-8 sm:h-9 px-2.5 sm:px-4 text-[12px] sm:text-[13px] gap-1.5 sm:gap-2 rounded-lg font-semibold text-terra-600 bg-white border border-terra-200 hover:bg-terra-50 hover:border-terra-300 active:bg-terra-100 transition-all duration-150 ease-out active:scale-[0.98]"
                >
                  <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">Clear Chat</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex overflow-hidden relative">
          {/* Mobile Sidebar Overlay */}
          {isSidebarOpen && (
            <div
              className="lg:hidden fixed inset-0 bg-black/50 z-40"
              onClick={() => setIsSidebarOpen(false)}
            />
          )}

          {/* Left Sidebar - Quick Actions & Stats */}
          <div className={`
            fixed lg:relative inset-y-0 left-0 z-50 lg:z-auto
            w-[280px] sm:w-72 flex-shrink-0 border-r border-neutral-100 bg-white lg:bg-white/50
            p-4 sm:p-6 overflow-y-auto
            transform transition-transform duration-300 ease-in-out
            ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          `}>
            {/* Mobile Close Button */}
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="lg:hidden absolute top-4 right-4 w-8 h-8 rounded-lg bg-neutral-100 flex items-center justify-center hover:bg-neutral-200 transition-colors"
            >
              <X className="w-4 h-4 text-neutral-600" />
            </button>

            {/* Quick Actions */}
            <div className="mb-5 sm:mb-6">
              <h3 className="text-[9px] sm:text-[10px] font-semibold text-neutral-500 uppercase tracking-widest mb-2 sm:mb-3">
                Quick Actions
              </h3>
              <div className="space-y-1.5 sm:space-y-2">
                {CRM_QUICK_ACTIONS.map((action, idx) => {
                  const Icon = action.icon;
                  return (
                    <button
                      key={idx}
                      onClick={() => {
                        sendMessage(action.action);
                        setIsSidebarOpen(false);
                      }}
                      className="w-full flex items-center gap-2 sm:gap-3 px-2.5 sm:px-3 py-2 sm:py-2.5 bg-white border border-neutral-100 rounded-lg text-[12px] sm:text-[13px] font-medium text-neutral-700 hover:bg-terra-50 hover:border-terra-300 transition-all group active:scale-[0.98]"
                    >
                      <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-terra-50 flex items-center justify-center group-hover:bg-terra-100 transition-colors flex-shrink-0">
                        <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-terra-600" />
                      </div>
                      <span className="flex-1 text-left truncate">{action.label}</span>
                      <ChevronRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-neutral-300 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* CRM Stats Summary */}
            <div className="mb-5 sm:mb-6">
              <div className="flex items-center justify-between mb-2 sm:mb-3">
                <h3 className="text-[9px] sm:text-[10px] font-semibold text-neutral-500 uppercase tracking-widest">
                  CRM Overview
                </h3>
                {statsError && (
                  <button
                    onClick={fetchSidebarStats}
                    className="text-[9px] sm:text-[10px] text-terra-600 hover:text-terra-700 flex items-center gap-1"
                  >
                    <RefreshCw className="w-3 h-3" />
                    Retry
                  </button>
                )}
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-1 gap-2 sm:gap-3">
                <div className="p-3 sm:p-4 bg-white rounded-[10px]">
                  <div className="flex items-center gap-1.5 sm:gap-2 mb-1">
                    <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-terra-600" />
                    <span className="text-[9px] sm:text-[10px] font-medium uppercase tracking-widest text-neutral-400">Guests</span>
                  </div>
                  <p className="text-lg sm:text-xl font-bold text-neutral-900">
                    {statsLoading ? (
                      <span className="inline-block w-12 sm:w-16 h-5 sm:h-6 bg-neutral-200 rounded animate-pulse" />
                    ) : (
                      sidebarStats?.total_guests?.toLocaleString() ?? '-'
                    )}
                  </p>
                </div>
                <div className="p-3 sm:p-4 bg-white rounded-[10px]">
                  <div className="flex items-center gap-1.5 sm:gap-2 mb-1">
                    <Heart className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-rose-500" />
                    <span className="text-[9px] sm:text-[10px] font-medium uppercase tracking-widest text-neutral-400">Loyalty</span>
                  </div>
                  <p className="text-lg sm:text-xl font-bold text-neutral-900">
                    {statsLoading ? (
                      <span className="inline-block w-12 sm:w-16 h-5 sm:h-6 bg-neutral-200 rounded animate-pulse" />
                    ) : (
                      sidebarStats?.loyalty_members?.toLocaleString() ?? '-'
                    )}
                  </p>
                </div>
                <div className="p-3 sm:p-4 bg-white rounded-[10px]">
                  <div className="flex items-center gap-1.5 sm:gap-2 mb-1">
                    <Award className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gold-500" />
                    <span className="text-[9px] sm:text-[10px] font-medium uppercase tracking-widest text-neutral-400">VIP</span>
                  </div>
                  <p className="text-lg sm:text-xl font-bold text-neutral-900">
                    {statsLoading ? (
                      <span className="inline-block w-12 sm:w-16 h-5 sm:h-6 bg-neutral-200 rounded animate-pulse" />
                    ) : (
                      sidebarStats?.vip_guests?.toLocaleString() ?? '-'
                    )}
                  </p>
                </div>
                <div className="p-3 sm:p-4 bg-white rounded-[10px]">
                  <div className="flex items-center gap-1.5 sm:gap-2 mb-1">
                    <TrendingUp className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-sage-600" />
                    <span className="text-[9px] sm:text-[10px] font-medium uppercase tracking-widest text-neutral-400">Avg LTV</span>
                  </div>
                  <p className="text-lg sm:text-xl font-bold text-sage-600">
                    {statsLoading ? (
                      <span className="inline-block w-12 sm:w-16 h-5 sm:h-6 bg-neutral-200 rounded animate-pulse" />
                    ) : (
                      sidebarStats?.avg_ltv ? `₹${sidebarStats.avg_ltv.toLocaleString()}` : '-'
                    )}
                  </p>
                </div>
              </div>
            </div>

            {/* Capabilities - Hidden on very small screens */}
            <div className="hidden sm:block">
              <h3 className="text-[9px] sm:text-[10px] font-semibold text-neutral-500 uppercase tracking-widest mb-2 sm:mb-3">
                AI Capabilities
              </h3>
              <div className="space-y-1.5 sm:space-y-2 text-[11px] sm:text-xs text-neutral-600">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-sage-500" />
                  <span>Guest segmentation analysis</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-sage-500" />
                  <span>Loyalty program insights</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-sage-500" />
                  <span>LTV predictions</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-sage-500" />
                  <span>Churn risk detection</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-sage-500" />
                  <span>Campaign recommendations</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-sage-500" />
                  <span>Voice commands (Whisper)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Chat Area */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6">
              {messages.length === 0 ? (
                // Welcome state
                <div className="h-full flex flex-col items-center justify-center px-4">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-[12px] sm:rounded-[16px] bg-gradient-to-br from-ocean-500 via-sage-600 to-terra-600 flex items-center justify-center mb-4 sm:mb-6">
                    <Sparkles className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-neutral-900 mb-2 text-center">
                    CRM AI Assistant
                  </h2>
                  <p className="text-[12px] sm:text-[13px] text-neutral-500 text-center max-w-md mb-6 sm:mb-8">
                    Ask me anything about your guests, loyalty program, or customer relationships.
                  </p>

                  {/* Suggested prompts */}
                  <div className="w-full max-w-2xl">
                    <p className="text-[9px] sm:text-[10px] font-semibold text-neutral-500 uppercase tracking-widest mb-2 sm:mb-3 text-center">
                      Try asking...
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                      {CRM_SUGGESTIONS.slice(0, 6).map((suggestion, idx) => (
                        <button
                          key={idx}
                          onClick={() => sendMessage(suggestion)}
                          className="px-3 sm:px-4 py-2.5 sm:py-3 bg-white border border-neutral-100 rounded-lg text-[12px] sm:text-[13px] text-neutral-700 hover:bg-terra-50 hover:border-terra-300 transition-all text-left active:scale-[0.98]"
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                // Messages list
                <div className="space-y-3 sm:space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[90%] sm:max-w-[80%] rounded-[12px] sm:rounded-[16px] px-3 sm:px-4 py-2.5 sm:py-3 ${
                          message.type === 'user'
                            ? 'bg-terra-600 text-white'
                            : 'bg-white border border-neutral-100 text-neutral-800'
                        }`}
                      >
                        <div className="text-[12px] sm:text-[13px]">
                          {message.type === 'ai' ? renderMarkdown(message.text) : message.text}
                        </div>

                        {/* Query Results */}
                        {message.queryResults && message.queryResults.length > 0 && (
                          <div className="mt-2 sm:mt-3 p-2 sm:p-3 bg-neutral-50 rounded-lg border border-neutral-100">
                            <p className="text-[9px] sm:text-[10px] font-semibold uppercase tracking-widest text-neutral-500 mb-1.5 sm:mb-2">
                              Results ({message.queryResults.length})
                            </p>
                            <div className="space-y-1.5 sm:space-y-2 max-h-36 sm:max-h-48 overflow-y-auto">
                              {message.queryResults.slice(0, 5).map((result, idx) => (
                                <div
                                  key={idx}
                                  className="text-[10px] sm:text-xs bg-white p-1.5 sm:p-2 rounded-lg border border-neutral-100"
                                >
                                  {Object.entries(result).slice(0, 4).map(([key, value]) => (
                                    <div key={key} className="flex gap-1.5 sm:gap-2">
                                      <span className="text-neutral-500">{key}:</span>
                                      <span className="text-neutral-700 font-medium truncate">
                                        {String(value)}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Pending Action */}
                        {message.pendingAction && (
                          <div className="mt-2 sm:mt-3 p-2 sm:p-3 bg-gold-50 rounded-lg border border-gold-200">
                            <p className="text-[9px] sm:text-[10px] font-semibold uppercase tracking-widest text-gold-700 mb-1.5 sm:mb-2">
                              Confirm Action
                            </p>
                            <p className="text-[10px] sm:text-xs text-gold-700 mb-2 sm:mb-3">
                              {message.pendingAction.description}
                            </p>
                            <div className="flex gap-2">
                              <button
                                onClick={handleConfirmAction}
                                disabled={isExecutingAction}
                                className="inline-flex items-center justify-center h-6 sm:h-7 px-2.5 sm:px-3 text-[10px] sm:text-xs gap-1 sm:gap-1.5 rounded-lg font-semibold text-white bg-sage-600 hover:bg-sage-700 active:bg-sage-800 transition-all duration-150 ease-out disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98]"
                              >
                                {isExecutingAction ? 'Executing...' : 'Confirm'}
                              </button>
                              <button
                                className="inline-flex items-center justify-center h-6 sm:h-7 px-2.5 sm:px-3 text-[10px] sm:text-xs gap-1 sm:gap-1.5 rounded-lg font-semibold text-neutral-700 bg-white border border-neutral-100 hover:bg-neutral-50 active:bg-neutral-100 transition-all duration-150 ease-out active:scale-[0.98]"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        )}

                        {/* Suggestions */}
                        {message.suggestions && message.suggestions.length > 0 && (
                          <div className="mt-2 sm:mt-3 flex flex-wrap gap-1.5 sm:gap-2">
                            {message.suggestions.map((suggestion, idx) => (
                              <button
                                key={idx}
                                onClick={() => sendMessage(suggestion)}
                                className="inline-flex items-center justify-center h-6 sm:h-7 px-2 sm:px-3 text-[10px] sm:text-xs gap-1 sm:gap-1.5 rounded-lg font-medium text-neutral-700 bg-neutral-100 hover:bg-neutral-200 active:bg-neutral-300 transition-all duration-150 ease-out active:scale-[0.98]"
                              >
                                {suggestion}
                              </button>
                            ))}
                          </div>
                        )}

                        {/* Timestamp */}
                        <p className={`text-[10px] sm:text-xs mt-1.5 sm:mt-2 ${
                          message.type === 'user' ? 'text-white/70' : 'text-neutral-400'
                        }`}>
                          {message.timestamp}
                        </p>
                      </div>
                    </div>
                  ))}

                  {/* Typing indicator */}
                  {isTyping && (
                    <div className="flex justify-start">
                      <div className="bg-white border border-neutral-100 rounded-[12px] sm:rounded-[16px] px-3 sm:px-4 py-2.5 sm:py-3">
                        <div className="flex items-center gap-2">
                          <div className="flex gap-1">
                            <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-terra-600 animate-bounce" style={{ animationDelay: '0ms' }} />
                            <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-terra-600 animate-bounce" style={{ animationDelay: '150ms' }} />
                            <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-terra-600 animate-bounce" style={{ animationDelay: '300ms' }} />
                          </div>
                          <span className="text-[10px] sm:text-xs text-neutral-500">AI is thinking...</span>
                        </div>
                      </div>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>

            {/* Input Area */}
            <div className="flex-shrink-0 p-4 sm:p-6 border-t border-neutral-100 bg-white">
              <form onSubmit={handleSubmit} className="flex items-end gap-2 sm:gap-3">
                <div className="flex-1 relative">
                  <textarea
                    ref={inputRef}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask about guests, loyalty, segments..."
                    rows={1}
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-[#FAF8F6] border border-neutral-200 rounded-xl text-[12px] sm:text-sm text-neutral-800 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-terra-500/20 focus:border-terra-500 resize-none transition-all duration-150"
                    style={{ minHeight: '40px', maxHeight: '100px' }}
                  />
                </div>

                {/* Voice button */}
                <button
                  type="button"
                  onClick={() => setIsVoiceModalOpen(true)}
                  className="inline-flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-neutral-100 hover:bg-neutral-200 active:bg-neutral-300 text-neutral-700 transition-all duration-150 ease-out active:scale-[0.95] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terra-500/40 focus-visible:ring-offset-2 flex-shrink-0"
                  title="Voice input (Whisper AI)"
                >
                  <Mic className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>

                {/* Send button */}
                <button
                  type="submit"
                  disabled={!inputValue.trim() || isTyping}
                  className="inline-flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-terra-500 hover:bg-terra-600 active:bg-terra-700 text-white transition-all duration-150 ease-out disabled:opacity-50 disabled:pointer-events-none active:scale-[0.95] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terra-500/40 focus-visible:ring-offset-2 flex-shrink-0"
                >
                  <Send className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              </form>

              <p className="text-[9px] sm:text-[10px] text-neutral-400 text-center mt-2 sm:mt-3">
                Powered by Glimmora AI with Whisper voice transcription
              </p>
            </div>
          </div>
        </div>


      {/* Voice Recorder Modal */}
      <VoiceRecorderModal
        isOpen={isVoiceModalOpen}
        onClose={() => setIsVoiceModalOpen(false)}
        onTranscriptReady={handleVoiceTranscript}
      />
    </div>
  );
}
