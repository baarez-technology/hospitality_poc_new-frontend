/**
 * Extract hotel code from subdomain in production
 * e.g., crownplaza.glimmora.com → crownplaza
 *       marriott.glimmora.com → marriott
 *
 * In development, falls back to VITE_HOTEL_CODE from .env.local
 */
function getHotelCodeFromSubdomain(): string {
  if (typeof window === 'undefined') return '';

  const hostname = window.location.hostname;

  // Local development: use .env.local value
  // Check for localhost, 127.0.0.1, or any IP address (192.168.x.x, 10.x.x.x, etc.)
  const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1';
  const isIPAddress = /^(\d{1,3}\.){3}\d{1,3}$/.test(hostname);

  if (isLocalhost || isIPAddress) {
    return import.meta.env.VITE_HOTEL_CODE || '';
  }

  // Production: extract from subdomain
  // Expected format: {hotel_code}.glimmora.com or {hotel_code}.yourdomain.com
  const parts = hostname.split('.');

  // Vercel preview/deployment URLs (e.g., project.vercel.app) — use env fallback
  if (hostname.endsWith('.vercel.app')) {
    return import.meta.env.VITE_HOTEL_CODE || '';
  }

  // If we have at least 3 parts (subdomain.domain.tld), first part is hotel code
  // e.g., crownplaza.glimmora.com → ['crownplaza', 'glimmora', 'com']
  if (parts.length >= 3) {
    const subdomain = parts[0];
    // Skip common non-hotel subdomains
    if (!['www', 'app', 'api', 'admin'].includes(subdomain)) {
      return subdomain;
    }
  }

  // Fallback to env variable if subdomain extraction fails
  return import.meta.env.VITE_HOTEL_CODE || '';
}

export const ENV = {
  API_URL: import.meta.env.VITE_API_URL || '',
  API_TIMEOUT: Number(import.meta.env.VITE_API_TIMEOUT) || 30000,
  ENV: import.meta.env.VITE_ENV || 'development',
  IS_DEV: import.meta.env.DEV,
  IS_PROD: import.meta.env.PROD,
  HOTEL_CODE: getHotelCodeFromSubdomain(),

  // Razorpay Configuration
  RAZORPAY_ENABLED: import.meta.env.VITE_RAZORPAY_ENABLED === 'true',
  RAZORPAY_KEY_ID: import.meta.env.VITE_RAZORPAY_KEY_ID || '',
} as const;

// Debug: Log configuration on startup (only in browser)
if (typeof window !== 'undefined') {
  console.log('🔧 ENV Configuration:', {
    API_URL: ENV.API_URL,
    API_TIMEOUT: ENV.API_TIMEOUT,
    ENV: ENV.ENV,
    IS_DEV: ENV.IS_DEV,
    IS_PROD: ENV.IS_PROD,
    HOTEL_CODE: ENV.HOTEL_CODE,
    RAZORPAY_ENABLED: ENV.RAZORPAY_ENABLED,
    RAZORPAY_KEY_ID: ENV.RAZORPAY_KEY_ID ? '***' + ENV.RAZORPAY_KEY_ID.slice(-4) : 'NOT SET',
    hostname: window.location.hostname,
  });
}
