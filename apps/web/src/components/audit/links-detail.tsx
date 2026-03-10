'use client';

import type { LinksData } from '@dlmetrix/shared';
import { AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Props {
  links: LinksData;
  userRole?: string;
}

export function LinksDetailPanel({ links, userRole }: Props) {
  if (!links) return null;

  const totalLinks = (links.internalLinks || 0) + (links.externalLinks || 0);
  const brokenCount = links.brokenLinks?.length || 0;

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border p-6">
      <h3 className="font-semibold mb-1">Links Analysis</h3>
      <p className="text-xs text-muted-foreground mb-5">Internal and external link structure</p>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
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

      {/* Broken links list */}
      {brokenCount > 0 && (
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
            Broken Links ({brokenCount})
          </p>
          <div className="space-y-2">
            {links.brokenLinks!.slice(0, 10).map((bl, i) => (
              <div key={i} className="flex items-center gap-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg px-3 py-2">
                <AlertTriangle className="h-3.5 w-3.5 text-red-500 flex-shrink-0" />
                <span className="text-xs font-mono text-red-700 dark:text-red-300 truncate flex-1">{bl.url}</span>
                <span className="text-xs font-bold text-red-600 flex-shrink-0">HTTP {bl.status}</span>
              </div>
            ))}
            {brokenCount > 10 && (
              <p className="text-xs text-muted-foreground">+{brokenCount - 10} more broken links</p>
            )}
          </div>
          {(userRole === 'PRO' || userRole === 'PREMIUM' || userRole === 'ADMIN') && (
            <p className="mt-3 text-xs text-amber-600 dark:text-amber-400">
              Broken links hurt user experience and can negatively impact SEO. Fix or remove these URLs, or set up proper 301 redirects.
            </p>
          )}
        </div>
      )}

      {/* Internal ratio */}
      {totalLinks > 0 && (
        <div className="mt-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Link Distribution</p>
          <div className="flex h-3 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-800">
            <div
              className="bg-brand-500"
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
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-brand-500 inline-block" /> Internal</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-violet-400 inline-block" /> External</span>
          </div>
        </div>
      )}
    </div>
  );
}
