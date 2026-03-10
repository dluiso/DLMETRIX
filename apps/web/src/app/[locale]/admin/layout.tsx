'use client';

import { RequireAuth } from '@/components/providers/require-auth';
import { Navbar } from '@/components/layout/navbar';
import { AdminSidebar } from '@/components/admin/admin-sidebar';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <RequireAuth requiredRole="ADMIN">
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        <Navbar />
        <div className="flex">
          <AdminSidebar />
          <main className="flex-1 p-6">{children}</main>
        </div>
      </div>
    </RequireAuth>
  );
}
