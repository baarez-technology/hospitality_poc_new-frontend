/**
 * OTA to Booking Source Mapping
 * Maps OTA codes/names to booking source values used in the database
 * 
 * IMPORTANT: The dummy channel manager creates bookings with source="Dummy Channel Manager"
 * This mapping ensures we can correctly fetch and filter bookings by OTA
 */

export interface OTA {
  code: string;
  name: string;
}

/**
 * Maps OTA to booking source
 * @param ota - OTA object with code and name
 * @returns Booking source string used in the database
 */
export function getBookingSourceForOTA(ota: OTA | { code?: string; name?: string }): string {
  if (!ota) return 'OTA';

  const code = ota.code?.toUpperCase() || '';
  const name = ota.name?.toLowerCase() || '';

  // Dummy Channel Manager uses "Dummy Channel Manager" as source
  if (
    code === 'DUMMY' ||
    code === 'CRS' ||
    name.includes('dummy channel manager') ||
    name.includes('dummy')
  ) {
    return 'Dummy Channel Manager';
  }

  // Common OTA source mappings
  const otaSourceMap: Record<string, string> = {
    // By code
    'BOOKING': 'Booking.com',
    'BOOKING_COM': 'Booking.com',
    'EXPEDIA': 'Expedia',
    'AGODA': 'Agoda',
    'MMT': 'MakeMyTrip',
    'MAKEMYTRIP': 'MakeMyTrip',
    'TRIP': 'Trip.com',
    'TRIP_COM': 'Trip.com',
    'GOOGLE': 'Google Hotel Ads',
    'GOOGLE_HOTEL_ADS': 'Google Hotel Ads',
    'AIRBNB': 'Airbnb',
    'HOTELS': 'Hotels.com',
    'HOTELS_COM': 'Hotels.com',
    'TRIVAGO': 'Trivago',
    'KAYAK': 'Kayak',
    
    // By name (case-insensitive)
    'booking.com': 'Booking.com',
    'expedia': 'Expedia',
    'agoda': 'Agoda',
    'makemytrip': 'MakeMyTrip',
    'trip.com': 'Trip.com',
    'google hotel ads': 'Google Hotel Ads',
    'airbnb': 'Airbnb',
    'hotels.com': 'Hotels.com',
    'trivago': 'Trivago',
    'kayak': 'Kayak',
  };

  // Try code first, then name
  const mappedSource = otaSourceMap[code] || otaSourceMap[name];
  if (mappedSource) {
    return mappedSource;
  }

  // Fallback: use OTA name if it matches a known source, otherwise use "OTA"
  const knownSources = [
    'Booking.com',
    'Expedia',
    'Agoda',
    'MakeMyTrip',
    'Trip.com',
    'Google Hotel Ads',
    'Airbnb',
    'Hotels.com',
    'Trivago',
    'Kayak',
    'Dummy Channel Manager',
    'CRS', // Legacy support
  ];

  if (ota.name && knownSources.includes(ota.name)) {
    return ota.name;
  }

  return 'OTA'; // Default fallback
}

/**
 * Reverse mapping: Get OTA code/name from booking source
 * Useful for finding which OTA a booking belongs to
 */
export function getOTAFromBookingSource(source: string): { code: string; name: string } | null {
  const sourceMap: Record<string, { code: string; name: string }> = {
    'Dummy Channel Manager': { code: 'DUMMY', name: 'Dummy Channel Manager' },
    'dummy channel manager': { code: 'DUMMY', name: 'Dummy Channel Manager' },
    'CRS': { code: 'DUMMY', name: 'Dummy Channel Manager' }, // Legacy support
    'crs': { code: 'DUMMY', name: 'Dummy Channel Manager' }, // Legacy support
    'Booking.com': { code: 'BOOKING', name: 'Booking.com' },
    'booking.com': { code: 'BOOKING', name: 'Booking.com' },
    'Expedia': { code: 'EXPEDIA', name: 'Expedia' },
    'expedia': { code: 'EXPEDIA', name: 'Expedia' },
    'Agoda': { code: 'AGODA', name: 'Agoda' },
    'agoda': { code: 'AGODA', name: 'Agoda' },
    'MakeMyTrip': { code: 'MMT', name: 'MakeMyTrip' },
    'makemytrip': { code: 'MMT', name: 'MakeMyTrip' },
    'Trip.com': { code: 'TRIP', name: 'Trip.com' },
    'trip.com': { code: 'TRIP', name: 'Trip.com' },
    'Google Hotel Ads': { code: 'GOOGLE', name: 'Google Hotel Ads' },
    'google hotel ads': { code: 'GOOGLE', name: 'Google Hotel Ads' },
  };

  return sourceMap[source] || null;
}
