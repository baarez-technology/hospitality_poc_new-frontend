/**
 * Hook for integrating SSE with Channel Manager components
 * Handles availability, rates, and restrictions SSE events
 *
 * Uses refs for callbacks to ensure handlers are stable (registered once) and
 * always invoke the latest refetchData/callbacks - prevents handler churn
 * that could cause events to be missed during unregister/re-register cycles.
 */

import { useEffect, useRef } from 'react';
import { useSSE } from '../contexts/SSEContext';
import { SSEEvent, SSE_EVENT_TYPES } from '../api/services/sse.service';

interface UseChannelManagerSSEEventsOptions {
  onAvailabilityUpdated?: () => void;
  onRatesUpdated?: () => void;
  onRestrictionsUpdated?: () => void;
  onSyncStatus?: (status: any) => void;
  refetchData?: () => void | Promise<void>;
}

/**
 * Hook for handling channel manager-related SSE events
 */
export function useChannelManagerSSEEvents(options: UseChannelManagerSSEEventsOptions = {}) {
  const { registerEventHandler } = useSSE();
  const {
    onAvailabilityUpdated,
    onRatesUpdated,
    onRestrictionsUpdated,
    onSyncStatus,
    refetchData,
  } = options;

  // Refs ensure handlers stay stable (no re-register when callbacks change)
  const refs = useRef({
    onAvailabilityUpdated,
    onRatesUpdated,
    onRestrictionsUpdated,
    onSyncStatus,
    refetchData,
  });
  refs.current = {
    onAvailabilityUpdated,
    onRatesUpdated,
    onRestrictionsUpdated,
    onSyncStatus,
    refetchData,
  };

  // Coalesce bursts of availability/rate/restriction events into a single
  // refetch to avoid a refetch storm (each event otherwise reloads data).
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Register handlers once - they read latest callbacks via refs
  useEffect(() => {
    const debouncedRefetch = () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
      debounceTimer.current = setTimeout(() => {
        const { refetchData: refetch } = refs.current;
        if (!refetch) return;
        const result = refetch();
        if (result instanceof Promise) {
          result.catch((err) => console.error('[useChannelManagerSSEEvents] Refetch failed:', err));
        }
      }, 400);
    };

    const handleAvailabilityUpdated = () => {
      const { onAvailabilityUpdated: cb } = refs.current;
      if (cb) cb();
      else debouncedRefetch();
    };

    const handleRatesUpdated = () => {
      const { onRatesUpdated: cb } = refs.current;
      if (cb) cb();
      else debouncedRefetch();
    };

    const handleRestrictionsUpdated = () => {
      const { onRestrictionsUpdated: cb } = refs.current;
      if (cb) cb();
      else debouncedRefetch();
    };

    const handleSyncStatus = (event: SSEEvent) => {
      const { onSyncStatus: cb } = refs.current;
      if (cb) {
        cb(event.data?.status);
      }
    };

    const unregisterAvailability = registerEventHandler(
      SSE_EVENT_TYPES.AVAILABILITY_UPDATED,
      handleAvailabilityUpdated
    );
    const unregisterRates = registerEventHandler(
      SSE_EVENT_TYPES.RATES_UPDATED,
      handleRatesUpdated
    );
    const unregisterRestrictions = registerEventHandler(
      SSE_EVENT_TYPES.RESTRICTIONS_UPDATED,
      handleRestrictionsUpdated
    );
    const unregisterSync = registerEventHandler(
      SSE_EVENT_TYPES.SYNC_STATUS,
      handleSyncStatus
    );

    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
      unregisterAvailability();
      unregisterRates();
      unregisterRestrictions();
      unregisterSync();
    };
  }, [registerEventHandler]);
}
