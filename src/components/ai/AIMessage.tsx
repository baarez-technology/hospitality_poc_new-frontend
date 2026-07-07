import React, { useMemo } from 'react';
import { Zap, User, CheckCircle, Database, Lightbulb } from 'lucide-react';
import AIQueryResults from './AIQueryResults';
import AIActionConfirmation from './AIActionConfirmation';

/**
 * Simple Markdown renderer for AI messages
 * Supports: **bold**, *italic*, - lists, numbered lists, line breaks
 */
function renderMarkdown(text: string): React.ReactNode {
  if (!text) return null;

  // Split by lines and process
  const lines = text.split('\n');
  const elements: React.ReactNode[] = [];
  let listItems: React.ReactNode[] = [];
  let listType: 'ul' | 'ol' | null = null;

  const processInlineMarkdown = (line: string): React.ReactNode => {
    // Process bold (**text**) and italic (*text*)
    const parts: React.ReactNode[] = [];
    let remaining = line;
    let key = 0;

    while (remaining.length > 0) {
      // Check for bold first - **text**
      const boldMatch = remaining.match(/\*\*([^*]+)\*\*/);

      // Check for italic - single asterisk that's not part of bold
      // Use simpler regex without lookbehind for browser compatibility
      let italicMatch = null;
      if (!boldMatch || (boldMatch.index !== undefined && boldMatch.index > 0)) {
        // Only look for italic if no bold at start
        const italicRegex = /(?:^|[^*])\*([^*]+)\*(?:[^*]|$)/;
        const italicTest = remaining.match(italicRegex);
        if (italicTest && (!boldMatch || (italicTest.index !== undefined && boldMatch.index !== undefined && italicTest.index < boldMatch.index))) {
          italicMatch = italicTest;
        }
      }

      if (boldMatch && boldMatch.index !== undefined) {
        // Add text before bold
        if (boldMatch.index > 0) {
          parts.push(<span key={key++}>{remaining.substring(0, boldMatch.index)}</span>);
        }
        // Add bold text
        parts.push(<strong key={key++} className="font-bold text-neutral-900">{boldMatch[1]}</strong>);
        remaining = remaining.substring(boldMatch.index + boldMatch[0].length);
      } else if (italicMatch && italicMatch.index !== undefined) {
        // Add text before italic
        const startOffset = italicMatch[0].startsWith('*') ? 0 : 1;
        if (italicMatch.index + startOffset > 0) {
          parts.push(<span key={key++}>{remaining.substring(0, italicMatch.index + startOffset)}</span>);
        }
        // Add italic text
        parts.push(<em key={key++} className="italic">{italicMatch[1]}</em>);
        const endOffset = italicMatch[0].endsWith('*') ? 0 : 1;
        remaining = remaining.substring(italicMatch.index + italicMatch[0].length - endOffset);
      } else {
        // No more markdown, add remaining text
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

  lines.forEach((line, index) => {
    const trimmedLine = line.trim();

    // Check for unordered list item (- or •)
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

    // Check for ordered list item (1. 2. etc)
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

    // Not a list item, flush any pending list
    flushList();

    // Empty line
    if (trimmedLine === '') {
      elements.push(<div key={elements.length} className="h-2" />);
      return;
    }

    // Check for headers (##, ###, or **Header:** style)
    const h2Match = trimmedLine.match(/^##\s+(.+)$/);
    const h3Match = trimmedLine.match(/^###\s+(.+)$/);
    const boldHeaderMatch = trimmedLine.match(/^\*\*([^*]+):\*\*$/);

    if (h3Match) {
      elements.push(
        <h4 key={elements.length} className="text-sm font-semibold text-neutral-800 mt-3 mb-1">
          {processInlineMarkdown(h3Match[1])}
        </h4>
      );
      return;
    }

    if (h2Match) {
      elements.push(
        <h3 key={elements.length} className="text-base font-bold text-neutral-900 mt-4 mb-2 pb-1 border-b border-neutral-200">
          {processInlineMarkdown(h2Match[1])}
        </h3>
      );
      return;
    }

    // Bold header style like **Room Status Overview:**
    if (boldHeaderMatch) {
      elements.push(
        <h3 key={elements.length} className="text-base font-bold text-neutral-900 mt-3 mb-2">
          {boldHeaderMatch[1]}:
        </h3>
      );
      return;
    }

    // Check for horizontal rule
    if (/^---+$/.test(trimmedLine)) {
      elements.push(<hr key={elements.length} className="my-3 border-neutral-200" />);
      return;
    }

    // Check for italic text starting the line (for footnotes like *Report generated...*)
    if (trimmedLine.startsWith('*') && trimmedLine.endsWith('*') && !trimmedLine.startsWith('**')) {
      elements.push(
        <p key={elements.length} className="text-xs text-neutral-400 italic mt-2">
          {trimmedLine.slice(1, -1)}
        </p>
      );
      return;
    }

    // Regular paragraph
    elements.push(
      <p key={elements.length} className="text-neutral-700">
        {processInlineMarkdown(trimmedLine)}
      </p>
    );
  });

  // Flush any remaining list
  flushList();

  return <div className="space-y-1">{elements}</div>;
}

interface PendingAction {
  action_id: string;
  action_type: string;
  description: string;
  params: Record<string, unknown>;
}

interface MessageData {
  type?: string;
  value?: number;
  occupancy?: number;
  current?: number;
  available?: number;
  count?: number;
  avgRating?: number;
}

interface AIMessageType {
  id: string;
  type: 'user' | 'ai';
  text: string;
  timestamp: string;
  data?: MessageData | null;
  intent?: string;
  confidence?: number;
  queryResults?: Array<Record<string, unknown>>;
  queryMetadata?: Record<string, unknown>;
  pendingAction?: PendingAction;
  actionResult?: Record<string, unknown>;
  suggestions?: string[];
}

interface AIMessageProps {
  message: AIMessageType;
  onConfirmAction?: () => void;
  onCancelAction?: () => void;
  onSuggestionClick?: (suggestion: string) => void;
  isExecutingAction?: boolean;
}

/**
 * AI Message Component
 * Displays individual messages in the conversation (user or AI)
 * Enhanced to support query results, action confirmations, and suggestions
 */
export default function AIMessage({
  message,
  onConfirmAction,
  onCancelAction,
  onSuggestionClick,
  isExecutingAction = false
}: AIMessageProps) {
  const isUser = message.type === 'user';
  const isAI = message.type === 'ai';

  // Format timestamp
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  return (
    <div className={`flex gap-2 sm:gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'} mb-3 sm:mb-4`}>
      {/* Avatar */}
      <div className={`flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center ${
        isAI ? 'bg-terra-500' : 'bg-neutral-200'
      }`}>
        {isAI ? (
          <Zap className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
        ) : (
          <User className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-neutral-600" />
        )}
      </div>

      {/* Message bubble */}
      <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} max-w-[85%] sm:max-w-[80%]`}>
        {/* Sender name and time */}
        <div className="flex items-center gap-1.5 sm:gap-2 mb-1 px-1">
          <span className={`text-[10px] sm:text-[11px] font-semibold ${
            isAI ? 'text-terra-600' : 'text-neutral-600'
          }`}>
            {isAI ? 'Glimmora AI' : 'You'}
          </span>
          <span className="text-[10px] sm:text-xs text-neutral-400">
            {formatTime(message.timestamp)}
          </span>
        </div>

        {/* Message content */}
        <div className={`px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl ${
          isAI
            ? 'bg-white border border-neutral-200'
            : 'bg-terra-500 text-white'
        }`}>
          <div className={`text-[12px] sm:text-sm leading-relaxed ${
            isAI ? 'text-neutral-700' : 'text-white'
          }`}>
            {isAI ? renderMarkdown(message.text) : message.text}
          </div>

          {/* Optional structured data display */}
          {message.data && (
            <div className="mt-2 sm:mt-3 pt-2 sm:pt-3 border-t border-neutral-200">
              <div className="flex items-center gap-3 sm:gap-4">
                {message.data.type === 'revenue' && (
                  <>
                    <div className="text-center">
                      <div className="text-[10px] sm:text-xs text-neutral-500 mb-0.5 sm:mb-1">Revenue</div>
                      <div className="text-base sm:text-lg font-bold text-terra-600">
                        ${message.data.value?.toLocaleString()}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-[10px] sm:text-xs text-neutral-500 mb-0.5 sm:mb-1">Occupancy</div>
                      <div className="text-base sm:text-lg font-bold text-ocean-600">
                        {message.data.occupancy}%
                      </div>
                    </div>
                  </>
                )}

                {message.data.type === 'occupancy' && (
                  <>
                    <div className="text-center">
                      <div className="text-[10px] sm:text-xs text-neutral-500 mb-0.5 sm:mb-1">Current</div>
                      <div className="text-base sm:text-lg font-bold text-terra-600">
                        {message.data.current}%
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-[10px] sm:text-xs text-neutral-500 mb-0.5 sm:mb-1">Available</div>
                      <div className="text-base sm:text-lg font-bold text-sage-600">
                        {message.data.available}
                      </div>
                    </div>
                  </>
                )}

                {message.data.type === 'reviews' && (
                  <>
                    <div className="text-center">
                      <div className="text-[10px] sm:text-xs text-neutral-500 mb-0.5 sm:mb-1">New Reviews</div>
                      <div className="text-base sm:text-lg font-bold text-terra-600">
                        {message.data.count}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-[10px] sm:text-xs text-neutral-500 mb-0.5 sm:mb-1">Avg Rating</div>
                      <div className="text-base sm:text-lg font-bold text-ocean-600">
                        {message.data.avgRating}/5
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Query Results */}
        {isAI && message.queryResults && message.queryResults.length > 0 && (
          <AIQueryResults
            results={message.queryResults}
            metadata={message.queryMetadata as { total_count?: number; truncated?: boolean; query?: string } | undefined}
          />
        )}

        {/* Pending Action Confirmation */}
        {isAI && message.pendingAction && onConfirmAction && onCancelAction && (
          <AIActionConfirmation
            pendingAction={message.pendingAction}
            onConfirm={onConfirmAction}
            onCancel={onCancelAction}
            isExecuting={isExecutingAction}
          />
        )}

        {/* Suggestions */}
        {isAI && message.suggestions && message.suggestions.length > 0 && onSuggestionClick && (
          <div className="mt-2 sm:mt-3 flex flex-wrap gap-1.5 sm:gap-2">
            {message.suggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => onSuggestionClick(suggestion)}
                className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 text-[10px] sm:text-[11px] font-medium text-terra-600 bg-terra-50 rounded-lg hover:bg-terra-100 transition-colors border border-terra-100"
              >
                <Lightbulb className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                <span>{suggestion}</span>
              </button>
            ))}
          </div>
        )}

        {/* Action Result */}
        {isAI && message.actionResult && (
          <div className="mt-2 sm:mt-3 flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 bg-green-50 border border-green-200 rounded-lg">
            <CheckCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-600" />
            <span className="text-[11px] sm:text-sm text-green-700">Action completed successfully</span>
          </div>
        )}

        {/* Intent & Confidence (debug info - shown subtly) */}
        {isAI && message.intent && message.confidence !== undefined && (
          <div className="mt-1.5 sm:mt-2 flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs text-neutral-400">
            <Database className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
            <span className="capitalize">{message.intent.replace(/_/g, ' ')}</span>
            <span>•</span>
            <span>{Math.round(message.confidence * 100)}% confidence</span>
          </div>
        )}
      </div>
    </div>
  );
}
