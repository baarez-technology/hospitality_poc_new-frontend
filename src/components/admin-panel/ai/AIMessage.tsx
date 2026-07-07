import React, { useMemo } from 'react';
import { Sparkles, User, CheckCircle, Database, Lightbulb } from 'lucide-react';
import AIQueryResults from './AIQueryResults';
import AIActionConfirmation from './AIActionConfirmation';

/**
 * Markdown renderer for AI messages
 * Supports: **bold**, *italic*, - lists, numbered lists, tables, line breaks
 */
function renderMarkdown(text: string): React.ReactNode {
  if (!text) return null;

  const lines = text.split('\n');
  const elements: React.ReactNode[] = [];
  let listItems: React.ReactNode[] = [];
  let listType: 'ul' | 'ol' | null = null;
  let tableRows: string[][] = [];
  let inTable = false;

  const processInlineMarkdown = (line: string): React.ReactNode => {
    const parts: React.ReactNode[] = [];
    let remaining = line;
    let key = 0;

    while (remaining.length > 0) {
      const boldMatch = remaining.match(/\*\*([^*]+)\*\*/);
      let italicMatch = null;
      if (!boldMatch || (boldMatch.index !== undefined && boldMatch.index > 0)) {
        const italicRegex = /(?:^|[^*])\*([^*]+)\*(?:[^*]|$)/;
        const italicTest = remaining.match(italicRegex);
        if (italicTest && (!boldMatch || (italicTest.index !== undefined && boldMatch.index !== undefined && italicTest.index < boldMatch.index))) {
          italicMatch = italicTest;
        }
      }

      if (boldMatch && boldMatch.index !== undefined) {
        if (boldMatch.index > 0) {
          parts.push(<span key={key++}>{remaining.substring(0, boldMatch.index)}</span>);
        }
        parts.push(<strong key={key++} className="font-bold text-neutral-900">{boldMatch[1]}</strong>);
        remaining = remaining.substring(boldMatch.index + boldMatch[0].length);
      } else if (italicMatch && italicMatch.index !== undefined) {
        const startOffset = italicMatch[0].startsWith('*') ? 0 : 1;
        if (italicMatch.index + startOffset > 0) {
          parts.push(<span key={key++}>{remaining.substring(0, italicMatch.index + startOffset)}</span>);
        }
        parts.push(<em key={key++} className="italic">{italicMatch[1]}</em>);
        const endOffset = italicMatch[0].endsWith('*') ? 0 : 1;
        remaining = remaining.substring(italicMatch.index + italicMatch[0].length - endOffset);
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

  const flushTable = () => {
    if (tableRows.length > 0) {
      const headerRow = tableRows[0];
      const dataRows = tableRows.slice(1);

      elements.push(
        <div key={elements.length} className="my-3 overflow-x-auto rounded-lg border border-neutral-200">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-neutral-100">
                {headerRow.map((cell, i) => (
                  <th key={i} className="px-3 py-2 text-left font-semibold text-neutral-700 whitespace-nowrap border-b border-neutral-200">
                    {processInlineMarkdown(cell.trim())}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {dataRows.map((row, ri) => (
                <tr key={ri} className={ri % 2 === 0 ? 'bg-white' : 'bg-neutral-50'}>
                  {row.map((cell, ci) => (
                    <td key={ci} className="px-3 py-2 text-neutral-600 whitespace-nowrap border-b border-neutral-100">
                      {processInlineMarkdown(cell.trim())}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
      tableRows = [];
      inTable = false;
    }
  };

  lines.forEach((line) => {
    const trimmedLine = line.trim();

    // Skip fake image markdown links like ![Chart](chart_url) — charts render via chartData
    if (/^!\[.*\]\(.*\)$/.test(trimmedLine)) {
      return;
    }

    // ── Table detection: lines starting and ending with |
    if (trimmedLine.startsWith('|') && trimmedLine.endsWith('|')) {
      // Skip separator rows (| --- | --- |)
      if (/^\|[\s\-:|]+\|$/.test(trimmedLine)) {
        inTable = true;
        return;
      }
      // Parse cells
      const cells = trimmedLine.slice(1, -1).split('|').map(c => c.trim());
      tableRows.push(cells);
      inTable = true;
      return;
    }

    // If we were in a table and this line isn't a table row, flush
    if (inTable) {
      flushTable();
    }

    // Check for unordered list item
    if (/^[-•]\s+/.test(trimmedLine)) {
      if (listType !== 'ul') { flushList(); listType = 'ul'; }
      const content = trimmedLine.replace(/^[-•]\s+/, '');
      listItems.push(
        <li key={listItems.length} className="text-neutral-700">{processInlineMarkdown(content)}</li>
      );
      return;
    }

    // Check for ordered list item
    if (/^\d+\.\s+/.test(trimmedLine)) {
      if (listType !== 'ol') { flushList(); listType = 'ol'; }
      const content = trimmedLine.replace(/^\d+\.\s+/, '');
      listItems.push(
        <li key={listItems.length} className="text-neutral-700">{processInlineMarkdown(content)}</li>
      );
      return;
    }

    flushList();

    if (trimmedLine === '') {
      elements.push(<div key={elements.length} className="h-2" />);
      return;
    }

    // Headers
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

    if (boldHeaderMatch) {
      elements.push(
        <h3 key={elements.length} className="text-base font-bold text-neutral-900 mt-3 mb-2">
          {boldHeaderMatch[1]}:
        </h3>
      );
      return;
    }

    if (/^---+$/.test(trimmedLine)) {
      elements.push(<hr key={elements.length} className="my-3 border-neutral-200" />);
      return;
    }

    // Italic footnotes
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

  flushList();
  flushTable();

  return <div className="space-y-1">{elements}</div>;
}


// ─── Interfaces ───

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
  chartData?: ChartData;
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
 * Supports: markdown, tables, charts, query results, action confirmations, suggestions
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

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    if (isNaN(date.getTime())) return timestamp;
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  return (
    <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'} mb-4`}>
      {/* Avatar */}
      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
        isAI ? 'bg-[#A57865]' : 'bg-neutral-200'
      }`}>
        {isAI ? (
          <Sparkles className="w-4 h-4 text-white" />
        ) : (
          <User className="w-4 h-4 text-neutral-600" />
        )}
      </div>

      {/* Message bubble */}
      <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} max-w-[85%]`}>
        {/* Sender name and time */}
        <div className="flex items-center gap-2 mb-1 px-1">
          <span className={`text-xs font-medium ${
            isAI ? 'text-[#A57865]' : 'text-neutral-600'
          }`}>
            {isAI ? 'Glimmora AI' : 'You'}
          </span>
          <span className="text-xs text-neutral-400">
            {formatTime(message.timestamp)}
          </span>
        </div>

        {/* Message content */}
        <div className={`px-4 py-3 rounded-xl ${
          isAI
            ? 'bg-white border border-neutral-200 shadow-sm w-full'
            : 'bg-gradient-to-br from-primary-500 to-primary-600 text-white'
        }`}>
          <div className={`text-sm leading-relaxed ${
            isAI ? 'text-neutral-700' : 'text-white'
          }`}>
            {isAI ? renderMarkdown(message.text) : message.text}
          </div>

          {/* Optional structured data display */}
          {message.data && (
            <div className="mt-3 pt-3 border-t border-neutral-200">
              <div className="flex items-center gap-4">
                {message.data.type === 'revenue' && (
                  <>
                    <div className="text-center">
                      <div className="text-xs text-neutral-500 mb-1">Revenue</div>
                      <div className="text-lg font-bold text-[#A57865]">
                        {'\u20B9'}{message.data.value?.toLocaleString('en-IN')}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-xs text-neutral-500 mb-1">Occupancy</div>
                      <div className="text-lg font-bold text-[#5C9BA4]">
                        {message.data.occupancy}%
                      </div>
                    </div>
                  </>
                )}

                {message.data.type === 'occupancy' && (
                  <>
                    <div className="text-center">
                      <div className="text-xs text-neutral-500 mb-1">Current</div>
                      <div className="text-lg font-bold text-[#A57865]">
                        {message.data.current}%
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-xs text-neutral-500 mb-1">Available</div>
                      <div className="text-lg font-bold text-[#4E5840]">
                        {message.data.available}
                      </div>
                    </div>
                  </>
                )}

                {message.data.type === 'reviews' && (
                  <>
                    <div className="text-center">
                      <div className="text-xs text-neutral-500 mb-1">New Reviews</div>
                      <div className="text-lg font-bold text-[#A57865]">
                        {message.data.count}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-xs text-neutral-500 mb-1">Avg Rating</div>
                      <div className="text-lg font-bold text-[#5C9BA4]">
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
          <div className="mt-3 flex flex-wrap gap-2">
            {message.suggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => onSuggestionClick(suggestion)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#A57865] bg-[#A57865]/10 rounded-full hover:bg-[#A57865]/20 transition-colors"
              >
                <Lightbulb className="w-3 h-3" />
                <span>{suggestion}</span>
              </button>
            ))}
          </div>
        )}

        {/* Action Result */}
        {isAI && message.actionResult && (
          <div className="mt-3 flex items-center gap-2 px-3 py-2 bg-green-50 border border-green-200 rounded-lg">
            <CheckCircle className="w-4 h-4 text-green-600" />
            <span className="text-sm text-green-700">Action completed successfully</span>
          </div>
        )}

        {/* Intent & Confidence (debug info) */}
        {isAI && message.intent && message.confidence !== undefined && (
          <div className="mt-2 flex items-center gap-2 text-xs text-neutral-400">
            <Database className="w-3 h-3" />
            <span className="capitalize">{message.intent.replace(/_/g, ' ')}</span>
            <span>&bull;</span>
            <span>{Math.round(message.confidence * 100)}% confidence</span>
          </div>
        )}
      </div>
    </div>
  );
}
