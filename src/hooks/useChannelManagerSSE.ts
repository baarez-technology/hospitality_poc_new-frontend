/**
 * Channel Manager SSE Hook
 * Provides real-time updates from channel manager webhooks via Server-Side Events
 * Uses Fetch API to support Authorization header (EventSource doesn't support custom headers)
 */

import { useEffect, useRef, useCallback } from 'react';
import { getAccessToken } from '../api/client';
import { ENV } from '../config/env';

// Debug logger - only logs in development
const sseLog = ENV.IS_DEV ? console.log.bind(console) : () => {};
const sseWarn = ENV.IS_DEV ? console.warn.bind(console) : () => {};
const sseError = console.error.bind(console); // Always log errors

export interface SSEEvent {
  type: string;
  data: any;
  timestamp: string;
}

export interface UseChannelManagerSSEOptions {
  enabled?: boolean;
  onEvent?: (event: SSEEvent) => void;
  onError?: (error: Error) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
  reconnectDelay?: number;
  maxReconnectDelay?: number;
}

/**
 * Hook for managing Channel Manager SSE connection using Fetch API
 * This is required because the backend requires Authorization header,
 * which EventSource doesn't support
 * 
 * @param options - Configuration options for SSE connection
 * @returns Connection status and control functions
 */
export function useChannelManagerSSE(options: UseChannelManagerSSEOptions = {}) {
  const {
    enabled = true,
    onEvent,
    onError,
    onConnect,
    onDisconnect,
    reconnectDelay = 1000,
    maxReconnectDelay = 60000,
  } = options;

  const abortControllerRef = useRef<AbortController | null>(null);
  const readerRef = useRef<ReadableStreamDefaultReader<Uint8Array> | null>(null);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reconnectDelayRef = useRef<number>(reconnectDelay);
  const isConnectingRef = useRef<boolean>(false);
  const isConnectedRef = useRef<boolean>(false);
  const retriesRef = useRef<number>(0);
  const MAX_RETRIES = 5;

  const connect = useCallback(async () => {
    if (!enabled || isConnectingRef.current) return;

    const token = getAccessToken();
    if (!token) return;

    const baseUrl = ENV.API_URL.replace(/\/+$/, ''); // strip trailing slashes
    const url = `${baseUrl}/api/v1/webhooks/channel-manager/sse`;
    sseLog('[SSE] Connecting to:', url);

    // Clean up previous connection
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    if (readerRef.current) {
      try {
        await readerRef.current.cancel();
      } catch (e) {
        // Ignore cancel errors
      }
    }

    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    abortControllerRef.current = new AbortController();
    isConnectingRef.current = true;

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'text/event-stream',
          'Cache-Control': 'no-cache',
        },
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        if (response.status === 401) {
          sseWarn('[SSE] Authentication failed (401)');
          isConnectingRef.current = false;
          isConnectedRef.current = false;
          onError?.(new Error('Authentication failed'));
          return;
        }
        throw new Error(`SSE connection failed: ${response.status} ${response.statusText}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('Response body is not readable');
      }
      readerRef.current = reader;
      const decoder = new TextDecoder();

      let buffer = '';
      reconnectDelayRef.current = reconnectDelay; // Reset delay on successful connection
      retriesRef.current = 0; // Reset retries on successful connection
      isConnectingRef.current = false;

      while (true) {
        const { done, value } = await readerRef.current.read();

        if (done) {
          sseLog('[SSE] Connection closed by server');
          isConnectedRef.current = false;
          if (enabled) {
            reconnectDelayRef.current = Math.min(reconnectDelayRef.current * 2, maxReconnectDelay);
            reconnectTimeoutRef.current = setTimeout(connect, reconnectDelayRef.current);
          }
          break;
        }

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || ''; // Keep incomplete line in buffer

        for (const line of lines) {
          // Skip empty lines
          if (!line.trim()) {
            continue;
          }

          // Handle keepalive pings
          if (line.trim() === ': keepalive' || line.startsWith(': keepalive')) {
            continue;
          }

          // Handle data lines
          if (line.startsWith('data: ')) {
            try {
              const data: SSEEvent = JSON.parse(line.slice(6));

              // Handle initial connection message
              if (data.type === 'connected') {
                sseLog('[SSE] Connected successfully');
                isConnectedRef.current = true;
                onConnect?.();
                continue;
              }

              // Handle regular events
              onEvent?.(data);
            } catch (error) {
              sseWarn('[SSE] Failed to parse SSE data:', line.substring(0, 80));
            }
          }
        }
      }
    } catch (error: any) {
      isConnectingRef.current = false;
      isConnectedRef.current = false;

      if (error.name === 'AbortError') {
        return;
      }

      retriesRef.current += 1;
      sseWarn(`[SSE] Connection failed (attempt ${retriesRef.current}/${MAX_RETRIES}):`, error.message);
      onError?.(error);

      // Reconnect with exponential backoff, but stop after MAX_RETRIES
      if (enabled && retriesRef.current < MAX_RETRIES) {
        reconnectDelayRef.current = Math.min(reconnectDelayRef.current * 2, maxReconnectDelay);
        reconnectTimeoutRef.current = setTimeout(connect, reconnectDelayRef.current);
      } else if (retriesRef.current >= MAX_RETRIES) {
        console.warn('[SSE] Max retries reached. SSE connection disabled until page reload.');
      }
    }
  }, [enabled, onEvent, onError, onConnect, reconnectDelay, maxReconnectDelay]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }

    if (readerRef.current) {
      readerRef.current.cancel().catch(() => {
        // Ignore cancel errors
      });
      readerRef.current = null;
    }

    isConnectingRef.current = false;
    isConnectedRef.current = false;
    onDisconnect?.();
  }, [onDisconnect]);

  // Setup connection on mount or when enabled changes
  useEffect(() => {
    if (enabled) {
      connect();
    } else {
      disconnect();
    }
    return () => disconnect();
  }, [enabled, connect, disconnect]);

  return {
    isConnected: isConnectedRef.current,
    connect,
    disconnect,
  };
}
