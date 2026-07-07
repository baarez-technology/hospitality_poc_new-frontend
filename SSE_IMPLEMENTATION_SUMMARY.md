# SSE Implementation Summary

This document summarizes the Server-Side Events (SSE) integration implemented in the frontend application for real-time channel manager updates.

## Files Created

### 1. Core SSE Hook
- **`src/hooks/useChannelManagerSSE.ts`**
  - Main hook for managing SSE connections
  - Handles reconnection with exponential backoff
  - Supports custom event handlers and error handling

### 2. SSE Service
- **`src/api/services/sse.service.ts`**
  - Utility functions for SSE connection management
  - Alternative implementation using Fetch API (supports custom headers)
  - Event type constants

### 3. SSE Context Provider
- **`src/contexts/SSEContext.tsx`**
  - Global SSE connection provider
  - Automatic toast notifications for events
  - Event handler registration system

### 4. Booking SSE Hook
- **`src/hooks/useBookingsSSE.ts`**
  - Specialized hook for booking-related SSE events
  - Handles booking.created, booking.modified, booking.cancelled

### 5. Channel Manager SSE Hook
- **`src/hooks/useChannelManagerSSEEvents.ts`**
  - Specialized hook for channel manager events
  - Handles availability, rates, restrictions, and sync status updates

## Integration Points

### 1. App.tsx
- Added `SSEProvider` to the admin routes provider tree
- Wraps admin components to provide SSE context globally

### 2. CMS Bookings Component
- **`src/pages/admin/cms/Bookings.tsx`**
  - Integrated `useBookingsSSE` hook
  - Automatically refetches bookings on SSE events

## Usage Examples

### Basic Usage in a Component

```typescript
import { useBookingsSSE } from '../hooks/useBookingsSSE';

function BookingsPage() {
  const fetchBookings = useCallback(async () => {
    // Your fetch logic
  }, []);

  // SSE integration - automatically handles events
  useBookingsSSE({
    refetchBookings: fetchBookings,
  });

  // ... rest of component
}
```

### Custom Event Handling

```typescript
import { useSSE } from '../contexts/SSEContext';
import { SSE_EVENT_TYPES } from '../api/services/sse.service';

function MyComponent() {
  const { registerEventHandler } = useSSE();

  useEffect(() => {
    return registerEventHandler(SSE_EVENT_TYPES.BOOKING_CREATED, (event) => {
      // Custom handling logic
      console.log('New booking:', event.data);
    });
  }, [registerEventHandler]);
}
```

### Channel Manager Events

```typescript
import { useChannelManagerSSEEvents } from '../hooks/useChannelManagerSSEEvents';

function AvailabilityPage() {
  const refreshAvailability = useCallback(() => {
    // Refresh logic
  }, []);

  useChannelManagerSSEEvents({
    onAvailabilityUpdated: refreshAvailability,
    onRatesUpdated: refreshAvailability,
    onRestrictionsUpdated: refreshAvailability,
  });
}
```

## Event Types

The following SSE event types are supported:

1. **`booking.created`** - New booking received from channel manager
2. **`booking.modified`** - Existing booking was modified
3. **`booking.cancelled`** - Booking was cancelled
4. **`availability.updated`** - Room availability was updated
5. **`rates.updated`** - Room rates were updated
6. **`restrictions.updated`** - Booking restrictions were updated
7. **`sync.status`** - Channel manager sync status update

## Features

### Automatic Notifications
- Toast notifications are automatically shown for all SSE events
- Success toasts for positive events (new bookings, successful syncs)
- Info toasts for updates (modifications, availability changes)
- Warning toasts for cancellations
- Error toasts for sync failures

### Reconnection Logic
- Automatic reconnection with exponential backoff
- Starts at 1 second, doubles up to 60 seconds max
- Resets delay on successful connection

### Event Handler System
- Components can register custom event handlers
- Multiple handlers can be registered for the same event type
- Handlers are automatically cleaned up on component unmount

## Configuration

The SSE connection uses:
- **Endpoint:** `/api/v1/webhooks/channel-manager/sse`
- **Authentication:** Bearer token (passed as query parameter for EventSource compatibility)
- **Base URL:** From `ENV.API_URL` configuration

## Next Steps

To integrate SSE into additional components:

1. **For Booking Components:**
   ```typescript
   import { useBookingsSSE } from '../hooks/useBookingsSSE';
   
   useBookingsSSE({ refetchBookings: yourFetchFunction });
   ```

2. **For Availability/Rates Components:**
   ```typescript
   import { useChannelManagerSSEEvents } from '../hooks/useChannelManagerSSEEvents';
   
   useChannelManagerSSEEvents({ refetchData: yourRefreshFunction });
   ```

3. **For Custom Event Handling:**
   ```typescript
   import { useSSE } from '../contexts/SSEContext';
   
   const { registerEventHandler } = useSSE();
   // Register your custom handlers
   ```

## Testing

To test the SSE integration:

1. Ensure the backend SSE endpoint is running
2. Trigger a webhook event (booking creation, modification, etc.)
3. Verify that:
   - Toast notification appears
   - UI updates automatically (if integrated)
   - Connection reconnects if it drops

## Troubleshooting

### Connection Issues
- Check browser console for SSE connection errors
- Verify authentication token is valid
- Check network tab to see if SSE connection is established
- Ensure backend CORS allows SSE connections

### Events Not Received
- Verify SSE connection is established (check Network tab)
- Check backend logs for SSE broadcast
- Verify event type matches expected format
- Check browser console for parsing errors

### Performance
- SSE connection is shared globally (one connection for all components)
- Event handlers are lightweight and cleaned up automatically
- Reconnection logic prevents connection spam
