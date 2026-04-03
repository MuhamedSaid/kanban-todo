'use client';

import { ThemeProvider, CssBaseline } from '@mui/material';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v16-appRouter';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import theme from '@/lib/theme';
import { getQueryClient } from '@/lib/queryClient';

// ============================================================
// Providers — wraps the app with:
//   1. AppRouterCacheProvider (MUI + Next.js SSR compatibility)
//   2. ThemeProvider (MUI theme)
//   3. QueryClientProvider (React Query)
// ============================================================

export default function Providers({ children }: { children: React.ReactNode }) {
  const queryClient = getQueryClient();

  return (
    <AppRouterCacheProvider options={{ enableCssLayer: true }}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          {children}
        </ThemeProvider>
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </AppRouterCacheProvider>
  );
}
