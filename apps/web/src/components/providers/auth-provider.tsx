'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/store/auth.store';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { fetchMe, isAuthenticated, _hasHydrated } = useAuthStore();

  useEffect(() => {
    if (!_hasHydrated) return;
    // After hydration: if token exists but store is not authenticated, re-validate with API
    const token = localStorage.getItem('access_token');
    if (token && !isAuthenticated) {
      fetchMe();
    }
  }, [_hasHydrated]);

  return <>{children}</>;
}
