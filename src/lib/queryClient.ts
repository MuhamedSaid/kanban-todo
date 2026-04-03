'use client';

import { QueryClient } from '@tanstack/react-query';

// ============================================================
// React Query Client — shared configuration
// ============================================================

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Keep data fresh for 5 minutes before refetching
        staleTime: 5 * 60 * 1000,
        // Don't refetch when user switches tabs (less noise for demo)
        refetchOnWindowFocus: false,
        // Retry once on failure
        retry: 1,
      },
    },
  });
}

// Singleton pattern — avoids recreating client on re-renders
let browserQueryClient: QueryClient | undefined = undefined;

export function getQueryClient() {
  // Server: always make a new client (no shared state)
  if (typeof window === 'undefined') {
    return makeQueryClient();
  }
  // Browser: reuse the same client
  if (!browserQueryClient) {
    browserQueryClient = makeQueryClient();
  }
  return browserQueryClient;
}
