# SSE UI Update - Issue Diagnostic Report

## Summary

**Symptom:** UI does not update when bookings/availability/rates change. SSE connection is active (keepalives received) but no actual events (`booking.created`, `availability.updated`, etc.) appear to reach the frontend.

**Conclusion:** Based on code analysis, the issue is most likely on the **backend** — either `broadcast_sse_event` is not being called, or events are being sent when `sse_connections` is empty.

---

## Architecture Flow

```
[Dummy CM] POST /api/v2/reservations (port 8001)
    │
    ├─► Creates booking in Glimmora via API
    └─► asyncio.create_task(trigger_webhook_v2(...))
            │
            └─► POST {WEBHOOK_URL}/api/v1/webhooks/channel-manager  (main backend port 8000)
                    │
                    └─► handle_booking_created()
                            │
                            └─► background_tasks.add_task(broadcast_sse_event, "booking.created", data)
                                    │
                                    └─► Puts event into sse_connections (in-memory queues)

[Frontend] GET /api/v1/webhooks/channel-manager/sse (main backend port 8000)
    │
    ├─► event_generator() adds event_queue to sse_connections
    ├─► Sends "connected" message
    └─► Loop: event_queue.get() → yields "data: {json}\n\n"
        │   OR timeout 30s → yields ": keepalive\n\n"
        │
        └─► Frontend receives keepalives ✅  |  Events ??? (not seen in logs)
```

---

## Frontend Analysis ✅ (No obvious bugs)

| Component | Status | Notes |
|-----------|--------|-------|
| **useChannelManagerSSE** | OK | Connects to SSE endpoint, parses `data:` lines, calls `onEvent(data)` |
| **SSEContext** | OK | Passes `handleSSEEvent` as `onEvent`, dispatches to registered handlers |
| **useBookingsSSE** | OK | Registers handlers for `booking.created`, `booking.modified`, `booking.cancelled` |
| **Handler flow** | OK | When event received → `handleSSEEvent` → `handlers.forEach(h => h(event))` → `refetchBookings()` |

**Evidence from your logs:**
- ✅ Keepalives received → SSE connection works
- ✅ Handlers registered for `booking.created`, etc.
- ❌ No `[SSE] 📨 Raw SSE data line received` for event payloads (only keepalives)
- ❌ No `[useBookingsSSE] 🎉 BOOKING.CREATED EVENT RECEIVED`

**Interpretation:** The frontend is connected and would process events if they arrived. Events are not arriving.

---

## Backend Analysis 🔍 (Likely source)

### 1. `broadcast_sse_event` must be called

**Location:** `app/api/v1/webhooks.py` lines 1235–1276

**Triggered by:**
- `handle_booking_created` → `background_tasks.add_task(broadcast_sse_event, "booking.created", ...)` (line 621)
- `handle_booking_modified` → same pattern (line 708)
- `handle_booking_cancelled` → same pattern (line 770)
- `handle_availability_updated` → same pattern (line 853)
- `handle_rates_updated` → same pattern (line 930)
- etc.

### 2. `sse_connections` must contain active connections

**In-memory list:** `sse_connections: List[Any] = []` (line 30)

- SSE endpoint adds `event_queue` to `sse_connections` when a client connects.
- `broadcast_sse_event` iterates `sse_connections` and does `connection.put(event)`.

**If `sse_connections` is empty when broadcast runs:**
- Backend logs: `WARNING: No active connections! Event booking.created will not be delivered`
- Events never reach any client.

### 3. Multiple workers break in-memory SSE

**Current CMD:** `uvicorn app.main:app --host 0.0.0.0 --port 8000` (no `--workers`)

- Single worker → one process, one `sse_connections` → expected to work.
- If RunPod or another runner uses `--workers 2` (or more):
  - Worker A: SSE connection, `sse_connections = [queue_A]`
  - Worker B: webhook handled here, `sse_connections = []`
  - Broadcast runs in Worker B → no connections → no delivery.

---

## Verification Steps

### Backend (run while creating a booking)

1. **Confirm broadcast is called**
   ```bash
   # In backend logs, look for:
   [SSE] broadcast_sse_event CALLED: event_type=booking.created
   [SSE] Broadcasting event: booking.created to X connection(s)
   ```

2. **Confirm connections exist**
   ```bash
   # If you see:
   WARNING: No active connections! Event booking.created will not be delivered
   # → SSE connections are empty when broadcast runs (e.g. multi-worker or routing mismatch)
   ```

3. **Confirm events are sent**
   ```bash
   # If you see:
   Successfully sent booking.created event to 1 connection(s)
   # → Backend is sending; problem is network/proxy or frontend
   ```

4. **Check worker count**
   ```bash
   # How are you starting the backend?
   # Single:  uvicorn app.main:app --port 8000
   # Multi:   uvicorn app.main:app --port 8000 --workers 2  ← BAD for in-memory SSE
   ```

### Frontend (create a booking, watch console)

1. **Confirm SSE events**
   - If backend sends successfully but you never see:
     - `[SSE] 📨 Raw SSE data line received: {"type":"booking.created",...}`
     - `[SSE] 🎯 DISPATCHING EVENT: booking.created`
   - Then the problem is between backend and browser (proxy, load balancer, or network).

2. **Proxy / RunPod**
   - `VITE_API_URL=https://mk7xivcv2jfyjc-8000.proxy.runpod.net`
   - Some proxies buffer responses and can delay or drop SSE streams.
   - Keepalives work → basic stream is alive, but event delivery may still be affected.

---

## Most Likely Causes (ordered)

| # | Cause | How to verify |
|---|-------|----------------|
| 1 | **Multiple workers** – webhook and SSE on different workers | Check startup args; ensure `--workers 1` or omit `--workers` |
| 2 | **No SSE connections when broadcast runs** – timing or routing | Check backend logs for "No active connections!" |
| 3 | **`broadcast_sse_event` not called** – webhook fails before broadcast | Check backend logs for "[SSE] broadcast_sse_event CALLED" |
| 4 | **Proxy/buffering** – RunPod or reverse proxy alters SSE stream | Compare backend "Successfully sent" logs with frontend event logs |

---

## Recommended Fixes

### Backend

1. **Guarantee single worker for SSE**
   ```bash
   uvicorn app.main:app --host 0.0.0.0 --port 8000  # Default 1 worker
   # Do NOT use: --workers 2 or more
   ```

2. **Add logging around broadcast**
   - Existing logs are sufficient; ensure they are visible in your deployment.

3. **(Future) Use Redis Pub/Sub**  
   If you need multiple workers, replace in-memory `sse_connections` with a Redis Pub/Sub (or similar) so all workers can deliver events to all SSE clients.

### Frontend (fallback)

1. **Polling fallback**  
   Periodically refetch bookings (e.g. every 30–60s) on the bookings page so the UI updates even if SSE fails.

---

## Quick Test

1. Open frontend → Bookings page (SSE connected, keepalives in console).
2. Create a booking via Dummy CM (POST /api/v2/reservations).
3. Watch backend logs for `[SSE] broadcast_sse_event CALLED` and connection count.
4. Watch frontend console for `[SSE] 📨 Raw SSE data line received` and `[SSE] 🎯 DISPATCHING EVENT`.

- Backend never logs broadcast → problem before broadcast (webhook path).
- Backend logs "No active connections" → problem with SSE connection tracking or workers.
- Backend logs "Successfully sent" but frontend sees nothing → network/proxy issue.
