'use client';

import { useEffect, useState, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/auth.store';
import { Navbar } from '@/components/layout/navbar';
import { DashboardSidebar } from '@/components/dashboard/sidebar';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';
import { getScoreLabel } from '@dlmetrix/shared';
import {
  Search, Filter, Trash2, ExternalLink,
  ChevronLeft, ChevronRight, ArrowUpDown,
  CheckCircle, XCircle, Clock, Loader2, Download,
} from 'lucide-react';
import { cn } from '@/lib/utils';

type SortField = 'createdAt' | 'overallScore' | 'domain';
type SortDir = 'asc' | 'desc';
type StatusFilter = 'all' | 'COMPLETED' | 'FAILED' | 'RUNNING' | 'PENDING';

const STATUS_CONFIG: Record<string, { icon: any; color: string; label: string }> = {
  COMPLETED: { icon: CheckCircle, color: 'text-green-500',  label: 'Completed' },
  FAILED:    { icon: XCircle,     color: 'text-red-500',    label: 'Failed'    },
  RUNNING:   { icon: Loader2,     color: 'text-blue-500',   label: 'Running'   },
  PENDING:   { icon: Clock,       color: 'text-amber-500',  label: 'Pending'   },
};

export default function HistoryPage() {
  const t = useTranslations('dashboard');
  const { isAuthenticated } = useAuthStore();
  const router = useRouter();

  const [audits, setAudits]         = useState<any[]>([]);
  const [total, setTotal]           = useState(0);
  const [page, setPage]             = useState(1);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState('');
  const [statusFilter, setStatus]   = useState<StatusFilter>('all');
  const [sortField, setSortField]   = useState<SortField>('createdAt');
  const [sortDir, setSortDir]       = useState<SortDir>('desc');
  const [selected, setSelected]     = useState<Set<string>>(new Set());
  const [deleting, setDeleting]     = useState(false);
  const [exporting, setExporting]   = useState(false);

  const limit = 15;
  const totalPages = Math.ceil(total / limit);

  useEffect(() => {
    if (!isAuthenticated) { router.push('/login'); return; }
  }, [isAuthenticated]);

  useEffect(() => {
    loadAudits();
  }, [page, statusFilter, sortField, sortDir]);

  // Debounce search
  useEffect(() => {
    const timeout = setTimeout(() => { setPage(1); loadAudits(); }, 400);
    return () => clearTimeout(timeout);
  }, [search]);

  const loadAudits = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(limit),
        sortField,
        sortDir,
        ...(statusFilter !== 'all' && { status: statusFilter }),
        ...(search && { search }),
      });
      const data = await api.get<any>(`/audits/history?${params}`);
      setAudits(data.data || []);
      setTotal(data.meta?.total || 0);
    } catch {}
    finally { setLoading(false); }
  }, [page, statusFilter, sortField, sortDir, search]);

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir('desc');
    }
    setPage(1);
  };

  const toggleSelect = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const selectAll = () => {
    if (selected.size === audits.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(audits.map(a => a.id)));
    }
  };

  const exportCsv = async () => {
    setExporting(true);
    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/audits/history/export`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Export failed');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `dlmetrix-audits-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setExporting(false);
    }
  };

  const deleteSelected = async () => {
    if (!selected.size) return;
    setDeleting(true);
    try {
      await Promise.all(Array.from(selected).map(id => api.delete(`/audits/${id}`)));
      setSelected(new Set());
      loadAudits();
    } finally {
      setDeleting(false);
    }
  };

  const SortButton = ({ field, label }: { field: SortField; label: string }) => (
    <button
      onClick={() => toggleSort(field)}
      className="flex items-center gap-1 hover:text-foreground text-muted-foreground text-xs font-semibold uppercase tracking-wider"
    >
      {label}
      <ArrowUpDown className={cn('h-3 w-3', sortField === field && 'text-brand-600')} />
    </button>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Navbar />
      <div className="flex">
        <DashboardSidebar />
        <main className="flex-1 p-6 max-w-6xl">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold">{t('history')}</h1>
              <p className="text-sm text-muted-foreground mt-1">{total} audits total</p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={exportCsv}
                disabled={exporting || total === 0}
              >
                {exporting
                  ? <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  : <Download className="h-4 w-4 mr-2" />
                }
                Export CSV
              </Button>
              {selected.size > 0 && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={deleteSelected}
                  disabled={deleting}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete {selected.size} selected
                </Button>
              )}
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search by domain or URL..."
                className="w-full pl-9 pr-4 py-2 rounded-lg border bg-white dark:bg-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            {/* Status filter */}
            <div className="flex items-center gap-1 bg-white dark:bg-gray-900 border rounded-lg p-1">
              {(['all', 'COMPLETED', 'FAILED'] as StatusFilter[]).map(s => (
                <button
                  key={s}
                  onClick={() => { setStatus(s); setPage(1); }}
                  className={cn(
                    'px-3 py-1.5 rounded-md text-xs font-medium transition-colors',
                    statusFilter === s
                      ? 'bg-brand-600 text-white'
                      : 'text-muted-foreground hover:text-foreground',
                  )}
                >
                  {s === 'all' ? 'All' : STATUS_CONFIG[s].label}
                </button>
              ))}
            </div>
          </div>

          {/* Table */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl border overflow-hidden">
            {/* Table header */}
            <div className="grid grid-cols-[auto_1fr_auto_auto_auto_auto] gap-4 px-4 py-3 border-b bg-gray-50 dark:bg-gray-800/50 items-center">
              <input
                type="checkbox"
                checked={selected.size === audits.length && audits.length > 0}
                onChange={selectAll}
                className="rounded"
              />
              <SortButton field="domain" label="Domain / URL" />
              <SortButton field="overallScore" label="Score" />
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Status</span>
              <SortButton field="createdAt" label="Date" />
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Actions</span>
            </div>

            {/* Rows */}
            {loading ? (
              <div className="p-12 text-center text-muted-foreground">
                <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                Loading audits...
              </div>
            ) : audits.length === 0 ? (
              <div className="p-12 text-center text-muted-foreground">
                No audits found. <Link href="/" className="text-brand-600 hover:underline">Run your first audit</Link>
              </div>
            ) : (
              <div className="divide-y">
                {audits.map((audit) => {
                  const scoreInfo = audit.overallScore != null ? getScoreLabel(audit.overallScore) : null;
                  const statusCfg = STATUS_CONFIG[audit.status] || STATUS_CONFIG.PENDING;
                  const StatusIcon = statusCfg.icon;

                  return (
                    <div
                      key={audit.id}
                      className={cn(
                        'grid grid-cols-[auto_1fr_auto_auto_auto_auto] gap-4 px-4 py-3.5 items-center',
                        'hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors',
                        selected.has(audit.id) && 'bg-brand-50 dark:bg-brand-950/20',
                      )}
                    >
                      <input
                        type="checkbox"
                        checked={selected.has(audit.id)}
                        onChange={() => toggleSelect(audit.id)}
                        className="rounded"
                      />

                      <div className="min-w-0">
                        <p className="font-medium text-sm truncate">{audit.domain}</p>
                        <p className="text-xs text-muted-foreground truncate">{audit.url}</p>
                      </div>

                      {/* Score */}
                      <div className="text-center w-14">
                        {scoreInfo ? (
                          <span className="text-lg font-bold" style={{ color: scoreInfo.color }}>
                            {audit.overallScore}
                          </span>
                        ) : (
                          <span className="text-muted-foreground text-sm">—</span>
                        )}
                      </div>

                      {/* Status */}
                      <div className={cn('flex items-center gap-1.5 text-xs font-medium', statusCfg.color)}>
                        <StatusIcon className={cn('h-3.5 w-3.5', audit.status === 'RUNNING' && 'animate-spin')} />
                        {statusCfg.label}
                      </div>

                      {/* Date */}
                      <div className="text-xs text-muted-foreground whitespace-nowrap">
                        {new Date(audit.createdAt).toLocaleDateString(undefined, {
                          day: '2-digit', month: 'short', year: 'numeric',
                        })}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1">
                        <Link href={`/audit/${audit.id}`}>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <ExternalLink className="h-3.5 w-3.5" />
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-red-400 hover:text-red-600"
                          onClick={async () => {
                            await api.delete(`/audits/${audit.id}`);
                            loadAudits();
                          }}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t">
                <p className="text-xs text-muted-foreground">
                  Showing {(page - 1) * limit + 1}–{Math.min(page * limit, total)} of {total}
                </p>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost" size="icon" className="h-8 w-8"
                    disabled={page === 1} onClick={() => setPage(p => p - 1)}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>

                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const p = page <= 3 ? i + 1 : page - 2 + i;
                    if (p > totalPages) return null;
                    return (
                      <Button
                        key={p} variant={p === page ? 'default' : 'ghost'}
                        size="icon" className="h-8 w-8 text-xs"
                        onClick={() => setPage(p)}
                      >
                        {p}
                      </Button>
                    );
                  })}

                  <Button
                    variant="ghost" size="icon" className="h-8 w-8"
                    disabled={page === totalPages} onClick={() => setPage(p => p + 1)}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
