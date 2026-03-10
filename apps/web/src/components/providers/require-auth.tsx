'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import { Loader2 } from 'lucide-react';

interface Props {
  children: React.ReactNode;
  requiredRole?: 'ADMIN';
  redirectTo?: string;
}

export function RequireAuth({ children, requiredRole, redirectTo = '/login' }: Props) {
  const { isAuthenticated, user, _hasHydrated } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!_hasHydrated) return;
    if (!isAuthenticated) {
      router.push(redirectTo);
      return;
    }
    if (requiredRole && user?.role !== requiredRole) {
      router.push('/dashboard');
    }
  }, [_hasHydrated, isAuthenticated, user, requiredRole, redirectTo, router]);

  // Still rehydrating — show nothing to avoid flash of redirect
  if (!_hasHydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Not authenticated or wrong role — render nothing (redirect in effect)
  if (!isAuthenticated) return null;
  if (requiredRole && user?.role !== requiredRole) return null;

  return <>{children}</>;
}
