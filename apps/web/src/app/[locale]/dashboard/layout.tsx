'use client';

import { RequireAuth } from '@/components/providers/require-auth';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <RequireAuth>{children}</RequireAuth>;
}
