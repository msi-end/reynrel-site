import { QueryClient, keepPreviousData } from '@tanstack/react-query';

// Cached data is shown instantly on revisit and refreshed in the background,
// so navigating between pages never blanks the screen.
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      gcTime: 10 * 60_000,
      refetchOnWindowFocus: true,
      placeholderData: keepPreviousData,
      retry: (count, err) => (err?.status >= 400 && err?.status < 500 ? false : count < 2)
    }
  }
});
