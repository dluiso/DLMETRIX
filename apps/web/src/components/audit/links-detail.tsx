'use client';

import { useState } from 'react';
import type { LinksData } from '@dlmetrix/shared';
import { AlertTriangle, ExternalLink, Link2, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Props {
  links: LinksData;
  userRole?: string;
}

const PAGE_SIZE = 20;

export function LinksDetailPanel({ links, userRole }: Props) {
  if (!links) return null;

  const [tab, setTab]   = useState<'all' | 'internal' | 'external' | 'broken'>('all');
  const [page, setPage] = useState(1);

  const totalLinks  = (links.internalLinks || 0) + (links.externalLinks || 0);
  const brokenCount = links.brokenLinks?.length || 0;
  const allLinks    = links.allLinks || [];

  const filteredLinks = allLinks.filter(l => {
    if (tab === 'internal') return l.type === 'internal';
    if (tab === 'external') return l.type === 'external';
    if (tab === 'broken')   return l.broken;
    return true;
  });

  const totalPages  = Math.ceil(filteredLinks.length / PAGE_SIZE);
  const pagedLinks  = filteredLinks.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleTab = (t: typeof tab) => { setTab(t); setPage(1); };

  const tabs = [
    { key: 'all' as const,      label: 'All',      count: allLinks.length     },
    { key: 'internal' as const, label: 'Internal',  count: links.internalLinks || 0 },
    { key: 'external' as const, label: 'External',  count: links.externalLinks || 0 },
    { key: 'broken' as const,   label: 'Broken',    count: brokenCount         },
  ];

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border p-6">
      <h3 className="font-semibold mb-1">Links Analysis</h3>
      <p className="text-xs text-muted-foreground mb-5">Internal and external link structure</p>

      {/* Summary counters */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-gray-900 dark:text-white">{links.internalLinks || 0}</div>
          <div className="text-xs font-medium text-muted-foreground mt-1">Internal Links</div>
        </div>
        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-gray-900 dark:text-white">{links.externalLinks || 0}</div>
          <div className="text-xs font-medium text-muted-foreground mt-1">External Links</div>
        </div>
        <div className={cn('rounded-xl p-4 text-center', brokenCount > 0 ? 'bg-red-50 dark:bg-red-950/30' : 'bg-gray-50 dark:bg-gray-800/50')}>
          <div className={cn('text-2xl font-bold', brokenCount > 0 ? 'text-red-600' : 'text-gray-900 dark:text-white')}>{brokenCount}</div>
          <div className="text-xs font-medium text-muted-foreground mt-1">Broken Links</div>
        </div>
        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-gray-900 dark:text-white">{links.nofollow || 0}</div>
          <div className="text-xs font-medium text-muted-foreground mt-1">Nofollow</div>
        </div>
      </div>

      {/* Link distribution bar */}
      {totalLinks > 0 && (
        <div className="mb-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Link Distribution</p>
          <div className="flex h-3 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-800">
            <div
              className="bg-blue-500"
              style={{ width: `${(links.internalLinks || 0) / totalLinks * 100}%` }}
              title={`Internal: ${links.internalLinks}`}
            />
            <div
              className="bg-violet-400"
              style={{ width: `${(links.externalLinks || 0) / totalLinks * 100}%` }}
              title={`External: ${links.externalLinks}`}
            />
          </div>
          <div className="flex gap-4 mt-1.5 text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-blue-500 inline-block" /> Internal</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-violet-400 inline-block" /> External</span>
          </div>
        </div>
      )}

      {/* Full links list (only if allLinks populated) */}
      {allLinks.length > 0 && (
        <div>
          {/* Tabs */}
          <div className="flex gap-1 mb-3 border-b">
            {tabs.map(t => (
              <button
                key={t.key}
                onClick={() => handleTab(t.key)}
                className={cn(
                  'px-3 py-1.5 text-xs font-medium rounded-t-lg -mb-px border-b-2 transition-colors',
                  tab === t.key
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-muted-foreground hover:text-gray-700 dark:hover:text-gray-300',
                  t.key === 'broken' && t.count > 0 && tab !== 'broken' ? 'text-red-500' : '',
                )}
              >
                {t.label}
                <span className={cn(
                  'ml-1.5 px-1.5 py-0.5 rounded-full text-xs',
                  tab === t.key ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' : 'bg-gray-100 dark:bg-gray-800',
                  t.key === 'broken' && t.count > 0 ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300' : '',
                )}>
                  {t.count}
                </span>
              </button>
            ))}
          </div>

          {/* Links table */}
          {pagedLinks.length === 0 ? (
            <p className="text-xs text-muted-foreground py-4 text-center">No links in this category</p>
          ) : (
            <div className="space-y-1">
              {pagedLinks.map((link, i) => (
                <div
                  key={i}
                  className={cn(
                    'flex items-center gap-2 px-3 py-2 rounded-lg text-xs',
                    link.broken
                      ? 'bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800'
                      : 'bg-gray-50 dark:bg-gray-800/40',
                  )}
                >
                  {link.broken ? (
                    <AlertTriangle className="h-3 w-3 text-red-500 flex-shrink-0" />
                  ) : link.type === 'external' ? (
                    <ExternalLink className="h-3 w-3 text-violet-400 flex-shrink-0" />
                  ) : (
                    <Link2 className="h-3 w-3 text-blue-400 flex-shrink-0" />
                  )}
                  <span className={cn(
                    'flex-1 truncate font-mono',
                    link.broken ? 'text-red-700 dark:text-red-300' : 'text-gray-700 dark:text-gray-300',
                  )}>
                    {link.url}
                  </span>
                  {link.text && link.text !== link.url && (
                    <span className="text-muted-foreground truncate max-w-[140px] flex-shrink-0 hidden sm:block">
                      {link.text}
                    </span>
                  )}
                  <div className="flex items-center gap-1 flex-shrink-0">
                    {link.nofollow && (
                      <span className="px-1 py-0.5 bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded text-[10px]">nofollow</span>
                    )}
                    {link.broken && (
                      <span className="font-bold text-red-600">
                        {link.status ? `HTTP ${link.status}` : 'Error'}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-3">
              <span className="text-xs text-muted-foreground">
                {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filteredLinks.length)} of {filteredLinks.length}
              </span>
              <div className="flex gap-1">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-30"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <span className="px-2 py-1 text-xs font-medium">{page} / {totalPages}</span>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-30"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {(userRole === 'PRO' || userRole === 'PREMIUM' || userRole === 'ADMIN') && brokenCount > 0 && (
            <p className="mt-3 text-xs text-amber-600 dark:text-amber-400">
              Broken links hurt user experience and can negatively impact SEO. Fix or remove these URLs, or set up proper 301 redirects.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
