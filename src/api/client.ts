import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';
import { ENV } from '@/config/env';

// ==================== REQUEST DEDUPLICATION & CACHING ====================

// In-flight request cache to prevent duplicate concurrent requests
const inflightRequests = new Map<string, Promise<AxiosResponse>>();

// Response cache with TTL
interface CacheEntry {
  response: AxiosResponse;
  timestamp: number;
  ttl: number;
}
const responseCache = new Map<string, CacheEntry>();

// Cache TTL configurations (in milliseconds) - reduced for better freshness
const CACHE_TTL = {
  default: 2000,        // 2 seconds for most endpoints
  static: 30000,        // 30 seconds for static data (room types, etc.)
  dashboard: 5000,      // 5 seconds for dashboard data
  ai: 10000,            // 10 seconds for AI insights
  crm: 5000,            // 5 seconds for CRM data
};

// Stable JSON stringify that sorts object keys for consistent cache keys
const stableStringify = (obj: any): string => {
  if (obj === null || obj === undefined) return '';
  if (typeof obj !== 'object') return String(obj);
  if (Array.isArray(obj)) return JSON.stringify(obj.map(stableStringify));
  const sortedKeys = Object.keys(obj).sort();
  const pairs = sortedKeys.map(key => `"${key}":${JSON.stringify(obj[key])}`);
  return `{${pairs.join(',')}}`;
};

// Generate cache key from request config
const getCacheKey = (config: AxiosRequestConfig): string => {
  const method = config.method?.toUpperCase() || 'GET';
  // Normalize URL - remove baseURL if present
  let url = config.url || '';
  if (config.baseURL && url.startsWith(config.baseURL)) {
    url = url.slice(config.baseURL.length);
  }
  const params = config.params ? stableStringify(config.params) : '';
  const data = config.data ? stableStringify(config.data) : '';
  return `${method}:${url}:${params}:${data}`;
};

// Determine cache TTL based on endpoint
const getCacheTTL = (url: string | undefined): number => {
  if (!url) return CACHE_TTL.default;

  // AI endpoints - longer cache
  if (url.includes('/ai-') || url.includes('/intelligence') || url.includes('/insights')) {
    return CACHE_TTL.ai;
  }

  // CRM endpoints
  if (url.includes('/crm-ai') || url.includes('/crm/')) {
    return CACHE_TTL.crm;
  }

  // Dashboard data
  if (url.includes('/dashboard') || url.includes('/stats')) {
    return CACHE_TTL.dashboard;
  }

  // Room types - short cache so price/availability updates propagate quickly
  if (url.includes('/room-types')) {
    return CACHE_TTL.default; // 2s
  }

  // Static data
  if (url.includes('/amenities') || url.includes('/sources')) {
    return CACHE_TTL.static;
  }

  return CACHE_TTL.default;
};

// Check if response is cacheable
const isCacheableRequest = (config: AxiosRequestConfig): boolean => {
  const method = config.method?.toUpperCase();
  // Only cache GET requests
  if (method !== 'GET') return false;

  // Don't cache auth endpoints
  const url = config.url || '';
  if (url.includes('/auth/')) return false;

  // Don't cache if explicitly disabled
  if ((config as any).noCache) return false;

  return true;
};

// Clean expired cache entries periodically
const cleanupCache = () => {
  const now = Date.now();
  for (const [key, entry] of responseCache.entries()) {
    if (now - entry.timestamp > entry.ttl) {
      responseCache.delete(key);
    }
  }
};

// Run cleanup every 30 seconds (prevent duplicates in HMR)
if (!(window as any).__glimmora_cache_cleanup__) {
  (window as any).__glimmora_cache_cleanup__ = setInterval(cleanupCache, 30000);
}

// Create axios instance
export const apiClient = axios.create({
  baseURL: ENV.API_URL,
  timeout: ENV.API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: false, // Using Bearer tokens, not cookies
});

// Helper to extract data from wrapped API responses
// Handles { data: { data: ... } } or { data: ... } patterns from axios responses
export const extractData = (res: any) => {
  const d = res?.data;
  if (d && typeof d === 'object' && 'data' in d) return d.data;
  return d;
};

// Helper to clear cache for specific patterns (useful after mutations)
export const clearApiCache = (urlPattern?: string) => {
  if (!urlPattern) {
    responseCache.clear();
    return;
  }
  for (const key of responseCache.keys()) {
    if (key.includes(urlPattern)) {
      responseCache.delete(key);
    }
  }
};

// Token storage - persist in localStorage for refresh persistence
const TOKEN_KEY = 'glimmora_access_token';
let accessToken: string | null = null;

// Initialize token from localStorage on module load
const initializeToken = () => {
  try {
    const storedToken = localStorage.getItem(TOKEN_KEY);
    if (storedToken) {
      accessToken = storedToken;
    }
  } catch (error) {
    console.error('Error loading token from localStorage:', error);
  }
};

// Initialize on module load
initializeToken();

export const setAccessToken = (token: string | null) => {
  accessToken = token;
  try {
    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
    } else {
      localStorage.removeItem(TOKEN_KEY);
    }
  } catch (error) {
    console.error('Error saving token to localStorage:', error);
  }
};

export const getAccessToken = () => {
  // If token is null in memory, try to load from localStorage
  if (!accessToken) {
    try {
      const storedToken = localStorage.getItem(TOKEN_KEY);
      if (storedToken) {
        accessToken = storedToken;
      }
    } catch (error) {
      console.error('Error loading token from localStorage:', error);
    }
  }
  return accessToken;
};

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    // Always add X-Hotel-Code header for multi-tenant support
    // This allows both authenticated and unauthenticated requests to work
    if (ENV.HOTEL_CODE) {
      config.headers['X-Hotel-Code'] = ENV.HOTEL_CODE;
    }

    // Don't add Authorization header for public endpoints
    const isPublicEndpoint = config.url?.includes('/api/v1/auth/login') ||
                          config.url?.includes('/api/v1/auth/signup') ||
                          config.url?.includes('/api/v1/auth/token') ||
                          config.url?.includes('/api/v1/auth/forgot-password') ||
                          config.url?.includes('/api/v1/auth/reset-password') ||
                          config.url?.includes('/api/v1/otp/') ||
                          config.url?.includes('/api/v1/precheckin/verify-booking');

    // Add access token if available and not a public endpoint
    if (accessToken && !isPublicEndpoint) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    // Ensure Content-Type is set for POST/PUT requests
    if ((config.method === 'post' || config.method === 'put' || config.method === 'patch') &&
        config.data &&
        !config.headers['Content-Type']) {
      config.headers['Content-Type'] = 'application/json';
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Helper to cache and return response
const cacheAndReturn = (response: AxiosResponse, processedResponse: AxiosResponse): AxiosResponse => {
  if (isCacheableRequest(response.config)) {
    const cacheKey = getCacheKey(response.config);
    const ttl = getCacheTTL(response.config.url);
    responseCache.set(cacheKey, {
      response: { ...processedResponse },
      timestamp: Date.now(),
      ttl
    });
    inflightRequests.delete(cacheKey);
  }
  return processedResponse;
};

// Response interceptor
apiClient.interceptors.response.use(
  (response) => {
    // For blob responses (file downloads), return as-is without processing
    if (response.config.responseType === 'blob') {
      return response;
    }

    // Backend returns data directly, not wrapped in { data: ... }
    // For auth endpoints, return data as-is (they return { access_token: "..." } directly)
    if (response.config.url?.includes('/api/v1/auth/login') ||
        response.config.url?.includes('/api/v1/auth/token')) {
      // Auth endpoints return { access_token: "...", token_type: "bearer" } directly
      return cacheAndReturn(response, response);
    }

    // For guest-assistant endpoints, return data as-is (they return structured responses directly)
    if (response.config.url?.includes('/api/v1/guest-assistant/')) {
      return cacheAndReturn(response, response);
    }

    // For AGI assistant endpoints, return data as-is
    if (response.config.url?.includes('/api/v1/agi/')) {
      return cacheAndReturn(response, response);
    }

    // For Admin AI endpoints, return data as-is
    if (response.config.url?.includes('/api/v1/admin-ai/')) {
      return cacheAndReturn(response, response);
    }

    // For Guest Chat endpoints, return data as-is
    if (response.config.url?.includes('/api/v1/guest-chat/')) {
      return cacheAndReturn(response, response);
    }

    // For Revenue Intelligence endpoints, return data as-is
    if (response.config.url?.includes('/api/v1/revenue-intelligence/')) {
      return cacheAndReturn(response, response);
    }

    // For Reports endpoints, return data as-is
    if (response.config.url?.includes('/api/v1/reports/')) {
      return cacheAndReturn(response, response);
    }

    // For Availability endpoints, return data as-is
    if (response.config.url?.includes('/api/v1/availability/')) {
      return cacheAndReturn(response, response);
    }

    // For Frontdesk endpoints (guest-bill, folio, etc.), return data as-is
    if (response.config.url?.includes('/api/v1/frontdesk/')) {
      return cacheAndReturn(response, response);
    }

    // For other endpoints, check if data is wrapped
    if (response.data && typeof response.data === 'object' && 'data' in response.data) {
      const processedResponse = { ...response, data: response.data };
      return cacheAndReturn(response, processedResponse);
    }
    // Wrap in ApiResponse format if not already
    if (response.data && !response.data.success && !response.data.access_token) {
      const processedResponse = { ...response, data: { success: true, data: response.data } };
      return cacheAndReturn(response, processedResponse);
    }
    return cacheAndReturn(response, response);
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & {
      _retry?: boolean;
    };

    // Don't retry auth endpoints - let them handle their own errors
    const isAuthEndpoint = originalRequest.url?.includes('/api/v1/auth/login') ||
                           originalRequest.url?.includes('/api/v1/auth/token') ||
                           originalRequest.url?.includes('/api/v1/auth/signup') ||
                           originalRequest.url?.includes('/api/v1/auth/forgot-password') ||
                           originalRequest.url?.includes('/api/v1/auth/reset-password');

    // Handle 401 - Unauthorized (but not for auth endpoints)
    if (error.response?.status === 401 && !originalRequest._retry && !isAuthEndpoint) {
      originalRequest._retry = true;

      // Only try refresh if we have a token
      const currentToken = getAccessToken();
      if (!currentToken) {
        // No token to refresh, redirect to login
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }

      try {
        // Try to refresh token - must include current token and hotel code
        const response = await axios.post(
          `${ENV.API_URL}/api/v1/auth/refresh`,
          {},
          {
            withCredentials: false,
            headers: {
              'Authorization': `Bearer ${currentToken}`,
              'X-Hotel-Code': ENV.HOTEL_CODE || '',
            }
          }
        );

        const newAccessToken = response.data.access_token || response.data.accessToken;
        setAccessToken(newAccessToken);

        // Don't retry non-idempotent requests (POST) — they may have already
        // been processed by the backend, retrying would create duplicates
        const method = (originalRequest.method || '').toLowerCase();
        if (method === 'post') {
          console.warn('[API Client] Skipping retry for POST request after token refresh to prevent duplicates:', originalRequest.url);
          return Promise.reject(error);
        }

        // Retry original request with new token (GET, PATCH, PUT, DELETE are safe to retry)
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        }

        return apiClient(originalRequest);
      } catch (refreshError) {
        // Refresh failed, logout user
        setAccessToken(null);
        // Only redirect to login if not already on login page (prevent infinite loop)
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      }
    }

    // Handle network errors (no response: connection refused, timeout, CORS, etc.)
    if (!error.response) {
      const code = (error as any).code;
      const msg = (error as any).message || '';
      let userMessage = 'Network error. Please check your connection.';
      if (code === 'ECONNABORTED' || msg.toLowerCase().includes('timeout')) {
        userMessage = 'Request timed out. The server may be slow or unavailable.';
      } else if (code === 'ECONNREFUSED') {
        userMessage = 'Cannot reach the server. Ensure the API is running (e.g. backend at ' + (ENV.API_URL || 'API_URL') + ').';
      } else if (code === 'ERR_NETWORK' && msg) {
        userMessage = msg.includes('CORS') ? 'Network error: request blocked (CORS or server unreachable).' : msg;
      }
      const networkError = new Error(userMessage);
      (networkError as any).cause = error;
      (networkError as any).isNetworkError = true;
      return Promise.reject(networkError);
    }

    // Clean up inflight request on error
    if (originalRequest) {
      const cacheKey = getCacheKey(originalRequest);
      inflightRequests.delete(cacheKey);
    }

    // Normalize FastAPI validation error detail so it's always a string.
    // FastAPI 422 responses return detail as [{type, loc, msg, input}, ...] which
    // crashes React if rendered directly ("Objects are not valid as a React child").
    if (error.response?.data?.detail) {
      const detail = error.response.data.detail;
      if (Array.isArray(detail)) {
        error.response.data.detail = detail
          .map((e: any) => (typeof e === 'string' ? e : e?.msg || e?.message || JSON.stringify(e)))
          .join('. ');
      } else if (typeof detail === 'object' && detail !== null) {
        error.response.data.detail = detail.msg || detail.message || JSON.stringify(detail);
      }
    }

    return Promise.reject(error);
  }
);

// ==================== DEDUPLICATED API WRAPPER ====================

/**
 * Makes a deduplicated, cached GET request.
 * If the same request is already in-flight, returns the same promise.
 * If a cached response exists and is fresh, returns it immediately.
 */
export const cachedGet = async <T = any>(
  url: string,
  config?: AxiosRequestConfig
): Promise<AxiosResponse<T>> => {
  const fullConfig: AxiosRequestConfig = { ...config, method: 'GET', url };
  const cacheKey = getCacheKey(fullConfig);

  // Check cache first
  const cached = responseCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < cached.ttl) {
    return Promise.resolve({ ...cached.response } as AxiosResponse<T>);
  }

  // Check if request is already in-flight
  const inflight = inflightRequests.get(cacheKey);
  if (inflight) {
    return inflight as Promise<AxiosResponse<T>>;
  }

  // Make new request
  const requestPromise = apiClient.get<T>(url, config);
  inflightRequests.set(cacheKey, requestPromise);

  try {
    const response = await requestPromise;
    return response;
  } finally {
    inflightRequests.delete(cacheKey);
  }
};

/**
 * Force refresh a cached endpoint (bypass cache, update cache with new data)
 */
export const refreshGet = async <T = any>(
  url: string,
  config?: AxiosRequestConfig
): Promise<AxiosResponse<T>> => {
  const fullConfig: AxiosRequestConfig = { ...config, method: 'GET', url };
  const cacheKey = getCacheKey(fullConfig);

  // Clear existing cache for this endpoint
  responseCache.delete(cacheKey);

  // Make fresh request
  return apiClient.get<T>(url, config);
};

// ==================== AUTO CACHE CLEARING ====================

/**
 * Clear all caches - useful when data might be stale
 */
export const clearAllCaches = () => {
  responseCache.clear();
  inflightRequests.clear();
  console.log('[API Client] All caches cleared');
};

// Clear caches when page becomes visible (user returns to tab)
if (typeof document !== 'undefined') {
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      // Clear caches when user returns to tab after being away
      clearAllCaches();
    }
  });

  // Also clear on page show (back/forward navigation)
  window.addEventListener('pageshow', (event) => {
    if (event.persisted) {
      // Page was restored from bfcache
      clearAllCaches();
    }
  });
}
