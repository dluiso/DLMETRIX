'use client';

import { useEffect, useState, useCallback } from 'react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { getScoreLabel } from '@dlmetrix/shared';
import {
  Search, ChevronLeft, ChevronRight, Loader2,
  ExternalLink, CheckCircle, XCircle, Clock,
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

const STATUS_CFG: Record<string, { color: string; icon: any; label: string }> = {
  COMPLETED: { color: 'text-green-600', icon: CheckCircle, label: 'Completed' },
  FAILED:    { color: 'text-red-500',   icon: XCircle,    label: 'Failed'    },
  RUNNING:   { color: 'text-blue-500',  icon: Loader2,    label: 'Running'   },
  PENDING:   { color: 'text-amber-500', icon: Clock,      label: 'Pending'   },
};

export default function AdminAuditsPage() {
  const [audits, setAudits]   = useState<any[]>([]);
  const [total, setTotal]     = useState(0);
  const [page, setPage]       = useState(1);
  const [search, setSearch]   = useState('');
  const [loading, setLoading] = useState(true);
  const limit = 20;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: String(limit) });
      const data = await api.get<any>(`/admin/audits?${params}`);
      setAudits(data.data || []);
      setTotal(data.meta?.total || 0);
    } finally { setLoading(false); }
  }, [page]);

  useEffect(() => { load(); }, [load]);

  // Client-side search filter (for display)
  const filtered = search
    ? audits.filter(a =>
        a.domain?.includes(search) || a.url?.includes(search) ||
        a.user?.email?.includes(search),
      )
    : audits;

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="max-w-6xl space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">All Audits</h1>
          <p className="text-sm text-muted-foreground">{total} total audits across all users</p>
        </div>
        <Button variant="outline" size="sm" onClick={load}>
          Refresh
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Filter by domain or user..."
          className="w-full pl-9 pr-4 py-2 rounded-lg border bg-white dark:bg-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
        />
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-2xl border overflow-hidden">
        {/* Header */}
        <div className="grid grid-cols-[2fr_1fr_80px_100px_140px_40px] gap-3 px-4 py-3 border-b bg-gray-50 dark:bg-gray-800/50">
          {['Domain / URL', 'User', 'Score', 'Status', 'Date', ''].map(h => (
            <span key={h} className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{h}</span>
          ))}
        </div>

        {loading ? (
          <div className="p-12 text-center">
            <Loader2 className="h-5 w-5 animate-spin mx-auto text-muted-foreground" />
          </div>
        ) : (
          <div className="divide-y max-h-[600px] overflow-y-auto">
            {filtered.map(audit => {
              const scoreInfo = audit.overallScore != null ? getScoreLabel(audit.overallScore) : null;
              const statusCfg = STATUS_CFG[audit.status] || STATUS_CFG.PENDING;
              const StatusIcon = statusCfg.icon;
              return (
                <div key={audit.id}
                  className="grid grid-cols-[2fr_1fr_80px_100px_140px_40px] gap-3 px-4 py-3.5 items-center hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors"
                >
                  <div className="min-w-0">
                    <p className="font-medium text-sm truncate">{audit.domain}</p>
                    <p className="text-xs text-muted-foreground truncate">{audit.url}</p>
                  </div>
                  <div className="text-xs text-muted-foreground truncate">
                    {audit.user?.email || <span className="italic">anonymous</span>}
                  </div>
                  <div>
                    {scoreInfo ? (
                      <span className="font-bold text-base" style={{ color: scoreInfo.color }}>
                        {audit.overallScore}
                      </span>
                    ) : '—'}
                  </div>
                  <div className={cn('flex items-center gap-1.5 text-xs font-medium', statusCfg.color)}>
                    <StatusIcon className={cn('h-3.5 w-3.5', audit.status === 'RUNNING' && 'animate-spin')} />
                    {statusCfg.label}
                  </div>
                  <div className="text-xs text-muted-foreground whitespace-nowrap">
                    {new Date(audit.createdAt).toLocaleString(undefined, {
                      month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit',
                    })}
                  </div>
                  <Link href={`/audit/${audit.id}`} target="_blank">
                    <Button variant="ghost" size="icon" className="h-7 w-7">
                      <ExternalLink className="h-3.5 w-3.5" />
                    </Button>
                  </Link>
                </div>
              );
            })}
            {filtered.length === 0 && !loading && (
              <div className="p-8 text-center text-muted-foreground text-sm">No audits found</div>
            )}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t">
            <p className="text-xs text-muted-foreground">
              Page {page} of {totalPages} · {total} total
            </p>
            <div className="flex gap-1">
              <Button variant="ghost" size="icon" className="h-8 w-8" disabled={page === 1} onClick={() => setPage(p => p - 1)}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const p = Math.max(1, page - 2) + i;
                if (p > totalPages) return null;
                return (
                  <Button key={p} variant={p === page ? 'default' : 'ghost'} size="icon"
                    className="h-8 w-8 text-xs" onClick={() => setPage(p)}>{p}
                  </Button>
                );
              })}
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
