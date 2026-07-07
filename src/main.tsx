import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './config/queryClient';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { FnBProvider } from './contexts/FnBContext';
import App from './App';
import './styles/globals.css';

// NOTE: We intentionally do NOT invalidate ALL queries on tab focus / bfcache restore.
// Doing so marked every cached query stale on every tab switch, triggering an app-wide
// refetch storm. React Query already refetches *stale* queries on window focus
// (refetchOnWindowFocus), governed by staleTime in config/queryClient.ts — that scoped
// behavior is sufficient and far cheaper.

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <FnBProvider>
          <App />
        </FnBProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  </React.StrictMode>
);
