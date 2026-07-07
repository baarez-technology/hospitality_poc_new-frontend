/**
 * SSE Context
 * Provides global Server-Side Events connection for Channel Manager updates
 */

import React, { createContext, useContext, useCallback, useRef } from 'react';
import { useChannelManagerSSE, SSEEvent } from '../hooks/useChannelManagerSSE';
import { useToast } from './ToastContext';
import { SSE_EVENT_TYPES } from '../api/services/sse.service';

interface SSEContextType {
  isConnected: boolean;
  connect: () => void;
  disconnect: () => void;
  registerEventHandler: (eventType: string, handler: (event: SSEEvent) => void) => () => void;
}

const SSEContext = createContext<SSEContextType | null>(null);

export function SSEProvider({ children }: { children: React.ReactNode }) {
  const { success, info, warning, error: showError } = useToast();
  const eventHandlersRef = useRef<Map<string, Set<(event: SSEEvent) => void>>>(new Map());

  // Handle SSE events
  const handleSSEEvent = useCallback((event: SSEEvent) => {
    console.log('[SSE] Received event:', event.type, event.data);
    
    // Call registered handlers for this event type
    const handlers = eventHandlersRef.current.get(event.type);
    if (handlers && handlers.size > 0) {
      console.log(`[SSE] Calling ${handlers.size} handler(s) for event type: ${event.type}`);
      handlers.forEach(handler => {
        try {
          handler(event);
        } catch (error) {
          console.error(`[SSE] Error in event handler for ${event.type}:`, error);
        }
      });
    } else {
      console.log(`[SSE] No handlers registered for event type: ${event.type}`);
    }

    // Show notifications based on event type
    switch (event.type) {
      case SSE_EVENT_TYPES.BOOKING_CREATED:
        success(
          `New booking from ${event.data.channel || 'channel manager'}: ${event.data.booking_number || event.data.booking_id}`,
          { duration: 5000 }
        );
        break;

      case SSE_EVENT_TYPES.BOOKING_MODIFIED:
        info(`Booking ${event.data.booking_number || event.data.booking_id} has been modified`, {
          duration: 4000
        });
        break;

      case SSE_EVENT_TYPES.BOOKING_CANCELLED:
        warning(`Booking ${event.data.booking_number || event.data.booking_id} has been cancelled`, {
          duration: 5000
        });
        break;

      case SSE_EVENT_TYPES.AVAILABILITY_UPDATED:
        info('Availability has been updated from channel manager', {
          duration: 3000
        });
        break;

      case SSE_EVENT_TYPES.RATES_UPDATED:
        info('Rates have been updated from channel manager', {
          duration: 3000
        });
        break;

      case SSE_EVENT_TYPES.RESTRICTIONS_UPDATED:
        // Don't show global toast - Restrictions page and context already show feedback on user actions.
        // Registered handlers (e.g. refetchData) still run to refresh data.
        break;

      case SSE_EVENT_TYPES.SYNC_STATUS:
        if (event.data?.status?.error_message) {
          showError(`Sync failed: ${event.data.status.error_message}`, {
            duration: 6000
          });
        } else if (event.data?.status?.records_processed) {
          success(
            `Sync completed: ${event.data.status.records_processed} records processed`,
            { duration: 4000 }
          );
        }
        break;

      default:
        // Unknown event type - log but don't show notification
        console.log('Unknown SSE event type:', event.type);
    }
  }, [success, info, warning, showError]);

  const handleSSEError = useCallback((error: Error) => {
    console.error('SSE connection error:', error);
    // Don't show error toast on every reconnection attempt
    // Only show if connection fails after multiple attempts
    // Show error only for authentication failures
    if (error.message.includes('401') || error.message.includes('Authentication')) {
      showError('SSE connection failed: Authentication required', { duration: 5000 });
    }
  }, [showError]);

  const handleSSEConnect = useCallback(() => {
    console.log('[SSE] Connection established successfully');
    success('Real-time updates connected', { duration: 3000 });
  }, [success]);

  const { isConnected, connect, disconnect } = useChannelManagerSSE({
    enabled: true,
    onEvent: handleSSEEvent,
    onError: handleSSEError,
    onConnect: handleSSEConnect,
  });

  // Register event handler
  const registerEventHandler = useCallback((eventType: string, handler: (event: SSEEvent) => void) => {
    console.log(`[SSE Context] 📋 Registering event handler for: ${eventType}`);
    if (!eventHandlersRef.current.has(eventType)) {
      eventHandlersRef.current.set(eventType, new Set());
      console.log(`[SSE Context]   Created new handler set for ${eventType}`);
    }
    eventHandlersRef.current.get(eventType)!.add(handler);
    const handlerCount = eventHandlersRef.current.get(eventType)!.size;
    console.log(`[SSE Context]   Total handlers for ${eventType}: ${handlerCount}`);

    // Return cleanup function
    return () => {
      console.log(`[SSE Context] 🧹 Unregistering event handler for: ${eventType}`);
      const handlers = eventHandlersRef.current.get(eventType);
      if (handlers) {
        handlers.delete(handler);
        const remaining = handlers.size;
        console.log(`[SSE Context]   Remaining handlers for ${eventType}: ${remaining}`);
        if (remaining === 0) {
          eventHandlersRef.current.delete(eventType);
          console.log(`[SSE Context]   Removed handler set for ${eventType}`);
        }
      }
    };
  }, []);

  const value: SSEContextType = {
    isConnected,
    connect,
    disconnect,
    registerEventHandler,
  };

  return (
    <SSEContext.Provider value={value}>
      {children}
    </SSEContext.Provider>
  );
}

export function useSSE() {
  const context = useContext(SSEContext);
  if (!context) {
    throw new Error('useSSE must be used within an SSEProvider');
  }
  return context;
}
