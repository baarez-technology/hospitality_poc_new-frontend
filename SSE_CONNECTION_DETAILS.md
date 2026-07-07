# SSE Connection Details

## Connection Information

### Endpoint
- **URL:** `${ENV.API_URL}/api/v1/webhooks/channel-manager/sse`
- **Method:** `GET`
- **Full URL Example:** `http://localhost:8000/api/v1/webhooks/channel-manager/sse`

### Headers
```
Authorization: Bearer <access_token>
Accept: text/event-stream
Cache-Control: no-cache
```

### Implementation
- **Technology:** Fetch API with ReadableStream (NOT EventSource)
- **Reason:** EventSource doesn't support custom headers, backend requires Authorization header
- **File:** `src/hooks/useChannelManagerSSE.ts`

## Console Logs to Look For

### Connection Phase

1. **Initialization:**
   ```
   [SSE] 🚀 useChannelManagerSSE effect triggered, enabled: true
   [SSE] 🔌 Initiating SSE connection...
   ```

2. **Connection Attempt:**
   ```
   [SSE] 🔌 Attempting to connect to SSE endpoint:
   [SSE]   URL: http://localhost:8000/api/v1/webhooks/channel-manager/sse
   [SSE]   Method: GET
   [SSE]   Headers: Authorization: Bearer <token>
   [SSE]   Accept: text/event-stream
   ```

3. **Request Sent:**
   ```
   [SSE] 📡 Sending fetch request...
   ```

4. **Response Received:**
   ```
   [SSE] 📥 Response received: { status: 200, statusText: "OK", ... }
   ```

5. **Stream Ready:**
   ```
   [SSE] ✅ Response body is readable, starting to read stream...
   ```

6. **Connection Confirmed:**
   ```
   [SSE] ✅✅✅ SSE CONNECTION SUCCESSFULLY ESTABLISHED ✅✅✅
   [SSE]   Message: SSE connection established
   [SSE]   Timestamp: 2024-01-15T10:30:00Z
   [SSE] Connection established successfully
   ```

### Event Reception

1. **Raw Data Received:**
   ```
   [SSE] 📨 Raw SSE data line received: data: {"type":"booking.created",...}
   ```

2. **Event Parsed:**
   ```
   [SSE] 📦 Parsed SSE event: {
     type: "booking.created",
     timestamp: "2024-01-15T10:30:00Z",
     dataKeys: ["booking_id", "booking_number", ...],
     fullData: { ... }
   }
   ```

3. **Event Dispatched:**
   ```
   [SSE] 🎯 DISPATCHING EVENT: booking.created
   [SSE]   Event data: { ... }
   [SSE]   Event timestamp: 2024-01-15T10:30:00Z
   ```

4. **Handler Called:**
   ```
   [SSE] Received event: booking.created { ... }
   [SSE] Calling 1 handler(s) for event type: booking.created
   ```

5. **Booking Hook Triggered:**
   ```
   [useBookingsSSE] 🎉🎉🎉 BOOKING.CREATED EVENT RECEIVED 🎉🎉🎉
   [useBookingsSSE]   Full event: { ... }
   [useBookingsSSE]   Booking data: { ... }
   [useBookingsSSE]   ⚡ Triggering refetchBookings...
   [useBookingsSSE]   ✅ Refetch completed successfully
   ```

### Keepalive Pings
```
[SSE] 💓 Keepalive ping received
```

### Errors
```
[SSE] ❌ Connection error: Error: ...
[SSE]   Error name: ...
[SSE]   Error message: ...
```

### Reconnection
```
[SSE] 🔄 Will reconnect in 5000ms
[SSE] 🔄 Will attempt reconnection in 10000ms
```

## Testing Checklist

1. **Check Browser Console:**
   - Look for `[SSE] ✅✅✅ SSE CONNECTION SUCCESSFULLY ESTABLISHED ✅✅✅`
   - Verify no authentication errors

2. **Check Network Tab:**
   - Find request to `/api/v1/webhooks/channel-manager/sse`
   - Status should be `200 OK`
   - Type should be `eventsource` or show as streaming
   - Check `Authorization` header is present

3. **Trigger a Booking Event:**
   - Create a booking via webhook or API
   - Watch console for event logs
   - Verify bookings list refreshes

4. **Verify Event Flow:**
   - `[SSE] 📨 Raw SSE data line received`
   - `[SSE] 📦 Parsed SSE event`
   - `[SSE] 🎯 DISPATCHING EVENT`
   - `[useBookingsSSE] 🎉🎉🎉 BOOKING.CREATED EVENT RECEIVED`
   - `[useBookingsSSE] ⚡ Triggering refetchBookings...`

## Troubleshooting

### No Connection Logs
- Check if `SSEProvider` is in the component tree
- Verify `enabled` is `true`
- Check if token is available

### Connection Fails with 401
- Token might be expired
- Check `Authorization` header in Network tab
- Verify token format

### Events Received but Not Processed
- Check for `[SSE] No handlers registered for event type: ...`
- Verify `useBookingsSSE` is called in the component
- Check if `refetchBookings` function is provided

### Events Not Updating UI
- Check if `refetchBookings` is actually fetching data
- Verify the fetch function updates state correctly
- Check for errors in refetch
