import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes - data considered fresh (was 30s, which made
                                // focus/mount refetches fire almost constantly)
      gcTime: 30 * 60 * 1000, // 30 minutes - keep cache around so revisits are instant
      retry: 2,
      refetchOnWindowFocus: true, // Refetch on focus — but only STALE queries (see staleTime)
      refetchOnReconnect: true, // Refetch on network reconnect
      refetchOnMount: true, // Check for fresh data on mount — skipped while data is still fresh
    },
    mutations: {
      retry: 1,
    },
  },
});

// Helper to invalidate all queries (useful for forcing fresh data)
export const invalidateAllQueries = () => {
  queryClient.invalidateQueries();
};

// Helper to clear all cache
export const clearQueryCache = () => {
  queryClient.clear();
};
