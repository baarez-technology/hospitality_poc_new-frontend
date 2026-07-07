/**
 * Hook for integrating SSE with Bookings components
 * Handles booking-related SSE events and updates the UI accordingly
 *
 * Uses refs for callbacks to ensure handlers are stable (registered once) and
 * always invoke the latest refetchBookings/callbacks - prevents handler churn
 * that could cause events to be missed during unregister/re-register cycles.
 *
 * SSE merge: When adding bookings from SSE optimistically, merge by booking.id
 * to avoid duplicates (e.g. upsert: replace existing by id, append if new).
 */

import { useEffect, useRef } from 'react';

/** Merge a new/updated booking into a list by id to avoid duplicates */
export function mergeBookingById<T extends { id?: string | number }>(
  list: T[],
  incoming: T
): T[] {
  const id = incoming.id;
  if (id == null) return [...list, incoming];
  const idx = list.findIndex((b) => String(b.id) === String(id));
  if (idx >= 0) {
    const next = [...list];
    next[idx] = incoming;
    return next;
  }
  return [...list, incoming];
}
import { useSSE } from '../contexts/SSEContext';
import { SSEEvent, SSE_EVENT_TYPES } from '../api/services/sse.service';

interface UseBookingsSSEOptions {
  onBookingCreated?: (booking: any) => void;
  onBookingModified?: (bookingId: number, changes: any) => void;
  onBookingCancelled?: (bookingId: number) => void;
  refetchBookings?: () => void | Promise<void>;
}

/**
 * Hook for handling booking-related SSE events
 */
export function useBookingsSSE(options: UseBookingsSSEOptions = {}) {
  const { registerEventHandler } = useSSE();
  const { onBookingCreated, onBookingModified, onBookingCancelled, refetchBookings } = options;

  // Refs ensure handlers stay stable (no re-register when callbacks change)
  const refs = useRef({
    onBookingCreated,
    onBookingModified,
    onBookingCancelled,
    refetchBookings,
  });
  refs.current = {
    onBookingCreated,
    onBookingModified,
    onBookingCancelled,
    refetchBookings,
  };

  // Coalesce bursts of SSE events into a single refetch. Without this, a rapid
  // sequence of booking/availability events each triggers a full refetch in
  // parallel ("refetch storm"), reloading the large bookings payload repeatedly.
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Register handlers once - they read latest callbacks via refs
  useEffect(() => {
    const debouncedRefetch = () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
      debounceTimer.current = setTimeout(() => {
        const { refetchBookings: refetch } = refs.current;
        if (!refetch) return;
        const result = refetch();
        if (result instanceof Promise) {
          result.catch((err) => console.error('[useBookingsSSE] Refetch failed:', err));
        }
      }, 400);
    };

    const handleCreated = (event: SSEEvent) => {
      const { onBookingCreated: cb } = refs.current;
      if (cb) cb(event.data);
      else debouncedRefetch();
    };

    const handleModified = (event: SSEEvent) => {
      const { onBookingModified: cb } = refs.current;
      if (cb) cb(event.data?.booking_id, event.data?.changes);
      else debouncedRefetch();
    };

    const handleCancelled = (event: SSEEvent) => {
      const { onBookingCancelled: cb } = refs.current;
      if (cb) cb(event.data?.booking_id);
      else debouncedRefetch();
    };

    const unregisterCreated = registerEventHandler(SSE_EVENT_TYPES.BOOKING_CREATED, handleCreated);
    const unregisterModified = registerEventHandler(SSE_EVENT_TYPES.BOOKING_MODIFIED, handleModified);
    const unregisterCancelled = registerEventHandler(SSE_EVENT_TYPES.BOOKING_CANCELLED, handleCancelled);

    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
      unregisterCreated();
      unregisterModified();
      unregisterCancelled();
    };
  }, [registerEventHandler]);
}
