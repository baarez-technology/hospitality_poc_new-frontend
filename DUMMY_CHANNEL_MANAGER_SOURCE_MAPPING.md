# Dummy Channel Manager Source Mapping

## Overview
The dummy channel manager OTA creates bookings with `source: "CRS"` in the database. This document explains how the frontend maps OTAs to booking sources for filtering and statistics.

## Booking Source Mapping

### Dummy Channel Manager
- **OTA Code**: `DUMMY` or `CRS`
- **OTA Name**: `Dummy Channel Manager` (or variations with "dummy" in name)
- **Booking Source**: `CRS`
- **Reason**: The dummy CM acts as a Central Reservation System (CRS), so bookings are created with `source: "CRS"`

### Other OTAs
Common OTA source mappings:

| OTA Code | OTA Name | Booking Source |
|----------|----------|----------------|
| `BOOKING` | Booking.com | `Booking.com` |
| `EXPEDIA` | Expedia | `Expedia` |
| `AGODA` | Agoda | `Agoda` |
| `MMT` | MakeMyTrip | `MakeMyTrip` |
| `TRIP` | Trip.com | `Trip.com` |
| `GOOGLE` | Google Hotel Ads | `Google Hotel Ads` |

## Implementation

### Utility Function
Created `src/utils/channel-manager/otaSourceMapping.ts` with:
- `getBookingSourceForOTA(ota)`: Maps OTA to booking source
- `getOTAFromBookingSource(source)`: Reverse mapping (source → OTA)

### Usage in Components

#### ChannelDashboard.tsx
When fetching bookings for a specific OTA:
```typescript
import { getBookingSourceForOTA } from '../../../utils/channel-manager/otaSourceMapping';

const bookingSource = getBookingSourceForOTA(ota);
const response = await apiClient.get('/api/v1/bookings', {
  params: { source: bookingSource, limit: 50 }
});
```

#### Backend API
The backend `/api/v1/channel-manager/stats` endpoint should:
1. Map OTA codes to booking sources when calculating stats
2. Filter bookings by the correct source for each OTA
3. Return accurate booking counts and revenue per OTA

## Testing

To verify the mapping works:

1. **Create booking via dummy CM**:
   - Dummy CM creates booking with `source: "Dummy Channel Manager"`
   - Booking should appear in Channel Dashboard for "Dummy Channel Manager" OTA

2. **Check OTA Performance**:
   - Click on "Dummy Channel Manager" row in OTA Performance table
   - Should show bookings created by dummy CM

3. **Verify Stats**:
   - Channel stats should include bookings from dummy CM
   - Revenue and booking counts should be accurate

## Backend Requirements

The backend `/api/v1/channel-manager/stats` endpoint must:

1. **Map OTA codes to booking sources**:
   ```typescript
   const otaSourceMap = {
     'DUMMY': 'Dummy Channel Manager',
     'BOOKING': 'Booking.com',
     'EXPEDIA': 'Expedia',
     // ... etc
   };
   ```

2. **Filter bookings correctly**:
   ```sql
   -- For dummy CM
   WHERE booking_source = 'Dummy Channel Manager'
   -- OR for backward compatibility
   WHERE booking_source IN ('Dummy Channel Manager', 'CRS')
   
   -- For other OTAs
   WHERE booking_source = 'Booking.com' -- etc
   ```

3. **Calculate stats per OTA**:
   - Total bookings per OTA (filtered by source)
   - Revenue per OTA (sum of booking amounts filtered by source)
   - Average rating per OTA (if available)

## Notes

- The dummy CM uses `source: "Dummy Channel Manager"` to clearly identify bookings from the dummy channel manager
- For backward compatibility, the system also accepts `source: "CRS"` and maps it to "Dummy Channel Manager"
- This allows the system to track which bookings came from the dummy channel manager
- The frontend utility function ensures consistent mapping across all components
- Backend should implement the same mapping logic for accurate statistics
- **IMPORTANT**: When the dummy channel manager creates a booking via `/api/v2/reservation` or `/api/v1/bookings`, it should set `source: "Dummy Channel Manager"` in the booking payload
