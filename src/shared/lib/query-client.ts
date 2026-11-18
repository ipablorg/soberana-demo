import { QueryClient } from '@tanstack/react-query';

/**
 * Global TanStack Query Client
 *
 * Configured with optimized defaults for the Soberana platform:
 * - 5-minute stale time for most data
 * - 10-minute cache time
 * - 1 retry on failure
 * - Error and success callbacks for debugging
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 10, // 10 minutes (formerly cacheTime)
      retry: 1,
      refetchOnWindowFocus: false,
    },
    mutations: {
      // Mutations (POST/PUT/DELETE) must NEVER auto-retry.
      // They produce side effects — a "failed" request may have succeeded server-side
      // (e.g. timeout after the server committed). Retrying causes duplicates
      // (e.g. duplicate customer creation). Retry logic for mutations belongs
      // in the UI layer with explicit user confirmation, not here.
      retry: false,
    },
  },
});
