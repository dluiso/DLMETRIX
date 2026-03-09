'use client';

import { useEffect, useState, useCallback } from 'react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import {
  Search, ChevronLeft, ChevronRight, Shield,
  UserCheck, UserX, Trash2, Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const ROLES = ['PRO', 'PREMIUM', 'ADMIN'];
const STATUSES = ['ACTIVE', 'SUSPENDED', 'INACTIVE'];

const ROLE_COLORS: Record<string, string> = {
  ADMIN:   'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400',
  PREMIUM: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400',
  PRO:     'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400',
  PUBLIC:  'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
};

export default function AdminUsersPage() {
  const [users, setUsers]     = useState<any[]>([]);
  const [total, setTotal]     = useState(0);
  const [page, setPage]       = useState(1);
  const [search, setSearch]   = useState('');
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<string | null>(null);
  const limit = 20;

  const loadUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: String(limit), ...(search && { search }) });
      const data = await api.get<any>(`/admin/users?${params}`);
      setUsers(data.data || []);
      setTotal(data.meta?.total || 0);
    } finally { setLoading(false); }
  }, [page, search]);

  useEffect(() => { loadUsers(); }, [loadUsers]);

  useEffect(() => {
    const t = setTimeout(() => { setPage(1); loadUsers(); }, 400);
    return () => clearTimeout(t);
  }, [search]);

  const updateUser = async (id: string, data: any) => {
    setEditing(id);
    try {
      await api.patch(`/admin/users/${id}`, data);
      loadUsers();
    } finally { setEditing(null); }
  };

  const deleteUser = async (id: string, email: string) => {
    if (!confirm(`Delete user ${email}? This is irreversible.`)) return;
    await api.delete(`/admin/users/${id}`);
    loadUsers();
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="max-w-6xl space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Users</h1>
          <p className="text-sm text-muted-foreground">{total} total users</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by email or name..."
          className="w-full pl-9 pr-4 py-2 rounded-lg border bg-white dark:bg-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
        />
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border overflow-hidden">
        <div className="grid grid-cols-[2fr_1fr_1fr_1fr_auto] gap-4 px-4 py-3 border-b bg-gray-50 dark:bg-gray-800/50">
          {['User', 'Role', 'Status', 'Plan / Audits', 'Actions'].map(h => (
            <span key={h} className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{h}</span>
          ))}
        </div>

        {loading ? (
          <div className="p-12 text-center">
            <Loader2 className="h-5 w-5 animate-spin mx-auto text-muted-foreground" />
          </div>
        ) : (
          <div className="divide-y">
            {users.map(user => (
              <div key={user.id} className="grid grid-cols-[2fr_1fr_1fr_1fr_auto] gap-4 px-4 py-3.5 items-center hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                {/* User info */}
                <div>
                  <p className="font-medium text-sm">{user.name}</p>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Joined {new Date(user.createdAt).toLocaleDateString()}
                    {user.lastLoginAt && ` · Last login ${new Date(user.lastLoginAt).toLocaleDateString()}`}
                  </p>
                </div>

                {/* Role */}
                <div>
                  <select
                    value={user.role}
                    onChange={e => updateUser(user.id, { role: e.target.value })}
                    disabled={editing === user.id}
                    className={cn(
                      'text-xs font-semibold px-2 py-1 rounded-full border-0 cursor-pointer',
                      ROLE_COLORS[user.role] || ROLE_COLORS.PUBLIC,
                    )}
                  >
                    {['PUBLIC', ...ROLES].map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>

                {/* Status */}
                <div>
                  <select
                    value={user.status}
                    onChange={e => updateUser(user.id, { status: e.target.value })}
                    disabled={editing === user.id}
                    className="text-xs rounded-lg border px-2 py-1 bg-white dark:bg-gray-800 cursor-pointer"
                  >
                    {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>

                {/* Plan / audits */}
                <div className="text-sm">
                  <span className="font-medium">{user.subscription?.plan?.name || '—'}</span>
                  <p className="text-xs text-muted-foreground">{user._count?.audits || 0} audits</p>
                </div>

                {/* Actions */}
                <div className="flex gap-1">
                  {editing === user.id && (
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  )}
                  <Button
                    variant="ghost" size="icon" className="h-8 w-8 text-red-400 hover:text-red-600"
                    onClick={() => deleteUser(user.id, user.email)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t">
            <p className="text-xs text-muted-foreground">
              {(page - 1) * limit + 1}–{Math.min(page * limit, total)} of {total}
            </p>
            <div className="flex gap-1">
              <Button variant="ghost" size="icon" className="h-8 w-8" disabled={page === 1} onClick={() => setPage(p => p - 1)}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
