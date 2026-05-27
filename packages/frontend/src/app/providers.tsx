'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/stores/auth.store';

const PUBLIC_ROUTES = ['/login', '/register'];

function AuthInitializer({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { fetchProfile, isAuthenticated, isInitialized } = useAuthStore();
  const isPublic = PUBLIC_ROUTES.includes(pathname);

  useEffect(() => {
    // Skip profile fetch on public pages (avoids 401 → redirect loop)
    // and when already authenticated + initialized (e.g. after hydration)
    if (isPublic || isAuthenticated || isInitialized) return;
    fetchProfile();
  }, [isPublic, isAuthenticated, isInitialized]);

  return <>{children}</>;
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30 * 1000,
            retry: 1,
            refetchOnWindowFocus: false,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <AuthInitializer>{children}</AuthInitializer>
    </QueryClientProvider>
  );
}