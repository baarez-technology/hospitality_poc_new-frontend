/**
 * SSE Service
 * Utility functions for managing Server-Side Events connections
 */

import { getAccessToken } from '../client';
import { ENV } from '../../config/env';

export interface SSEEvent {
  type: string;
  data: any;
  timestamp: string;
}

/**
 * Connect to SSE endpoint using Fetch API (supports custom headers)
 * This is an alternative to EventSource when you need to send Authorization header
 */
export async function connectSSEWithAuth(
  onMessage: (event: SSEEvent) => void,
  onError?: (error: Error) => void
): Promise<() => void> {
  const token = getAccessToken();
  if (!token) {
    throw new Error('No access token available for SSE connection');
  }

  const url = `${ENV.API_URL}/api/v1/webhooks/channel-manager/sse`;
  let abortController: AbortController | null = null;
  let isClosed = false;

  const connect = async () => {
    if (isClosed) return;

    abortController = new AbortController();

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'text/event-stream',
          'Cache-Control': 'no-cache',
        },
        signal: abortController.signal,
      });

      if (!response.ok) {
        throw new Error(`SSE connection failed: ${response.status} ${response.statusText}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error('Response body is not readable');
      }

      let buffer = '';

      while (!isClosed) {
        const { done, value } = await reader.read();
        
        if (done) {
          // Connection closed, attempt to reconnect
          if (!isClosed) {
            setTimeout(connect, 5000);
          }
          break;
        }

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || ''; // Keep incomplete line in buffer

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data: SSEEvent = JSON.parse(line.slice(6));
              onMessage(data);
            } catch (error) {
              console.error('Error parsing SSE data:', error);
            }
          } else if (line.startsWith('event: ')) {
            // Handle custom event types if needed
            const eventType = line.slice(7).trim();
            // You can handle specific event types here
          }
        }
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        // Connection was intentionally closed
        return;
      }
      
      console.error('SSE connection error:', error);
      onError?.(error as Error);
      
      // Attempt to reconnect after delay
      if (!isClosed) {
        setTimeout(connect, 5000);
      }
    }
  };

  connect();

  // Return cleanup function
  return () => {
    isClosed = true;
    if (abortController) {
      abortController.abort();
    }
  };
}

/**
 * Event type handlers mapping
 */
export const SSE_EVENT_TYPES = {
  BOOKING_CREATED: 'booking.created',
  BOOKING_MODIFIED: 'booking.modified',
  BOOKING_CANCELLED: 'booking.cancelled',
  AVAILABILITY_UPDATED: 'availability.updated',
  RATES_UPDATED: 'rates.updated',
  RESTRICTIONS_UPDATED: 'restrictions.updated',
  SYNC_STATUS: 'sync.status',
} as const;

export type SSEEventType = typeof SSE_EVENT_TYPES[keyof typeof SSE_EVENT_TYPES];
