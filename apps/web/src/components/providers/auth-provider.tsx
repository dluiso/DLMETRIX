'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/store/auth.store';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { fetchMe, isAuthenticated } = useAuthStore();

  useEffect(() => {
    // Re-hydrate user on app load if we have tokens
    const token = localStorage.getItem('access_token');
    if (token && !isAuthenticated) {
      fetchMe();
    }
  }, []);

  return <>{children}</>;
}
