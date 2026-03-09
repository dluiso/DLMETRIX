'use client';

import type { ResourceTypeBreakdown } from '@dlmetrix/shared';

interface Props {
  resources: ResourceTypeBreakdown[];
  totalRequests?: number;
  totalSize?: number;
}

const TYPE_CONFIG: Record<string, { label: string; color: string; bgColor: string }> = {
  script:     { label: 'JavaScript', color: '#f59e0b', bgColor: 'bg-amber-400' },
  stylesheet: { label: 'CSS',        color: '#8b5cf6', bgColor: 'bg-violet-400' },
  image:      { label: 'Images',     color: '#3b82f6', bgColor: 'bg-blue-500' },
  font:       { label: 'Fonts',      color: '#ec4899', bgColor: 'bg-pink-400' },
  document:   { label: 'HTML',       color: '#10b981', bgColor: 'bg-emerald-400' },
  media:      { label: 'Media',      color: '#6366f1', bgColor: 'bg-indigo-400' },
  other:      { label: 'Other',      color: '#94a3b8', bgColor: 'bg-slate-400' },
};

function getConfig(type: string) {
  const key = type.toLowerCase();
  return TYPE_CONFIG[key] || TYPE_CONFIG.other;
}

function formatSize(bytes: number): string {
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  if (bytes >= 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${bytes} B`;
}

export function ResourceBreakdown({ resources, totalRequests, totalSize }: Props) {
  if (!resources || resources.length === 0) return null;

  // Sort by size descending, exclude zero-count items
  const sorted = [...resources]
    .filter(r => r.count > 0 || r.size > 0)
    .sort((a, b) => b.transferSize - a.transferSize);

  const totalTransfer = sorted.reduce((sum, r) => sum + r.transferSize, 0);
  const totalCount    = sorted.reduce((sum, r) => sum + r.count, 0);

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border p-6">
      <h3 className="font-semibold mb-1">Resource Breakdown</h3>
      <p className="text-xs text-muted-foreground mb-5">
        Page resources grouped by type — size and request count
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Page Size */}
        <div>
          <div className="flex items-baseline gap-2 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Total Page Size</span>
            <span className="text-sm font-bold text-gray-900 dark:text-white">
              {formatSize(totalTransfer)}
            </span>
          </div>
          {/* Stacked bar */}
          <div className="flex h-5 rounded-full overflow-hidden gap-px mb-4 bg-gray-100 dark:bg-gray-800">
            {sorted.map(r => {
              const pct = totalTransfer > 0 ? (r.transferSize / totalTransfer) * 100 : 0;
              if (pct < 1) return null;
              return (
                <div
                  key={r.type}
                  title={`${getConfig(r.type).label}: ${formatSize(r.transferSize)} (${pct.toFixed(1)}%)`}
                  className={`${getConfig(r.type).bgColor} transition-all`}
                  style={{ width: `${pct}%` }}
                />
              );
            })}
          </div>
          {/* Legend */}
          <div className="space-y-1.5">
            {sorted.map(r => {
              const pct = totalTransfer > 0 ? (r.transferSize / totalTransfer) * 100 : 0;
              if (pct < 0.1 && r.count === 0) return null;
              const cfg = getConfig(r.type);
              return (
                <div key={r.type} className="flex items-center gap-2 text-xs">
                  <div
                    className="w-2.5 h-2.5 rounded-sm flex-shrink-0"
                    style={{ backgroundColor: cfg.color }}
                  />
                  <span className="text-muted-foreground flex-1">{cfg.label}</span>
                  <span className="font-medium text-gray-700 dark:text-gray-300">
                    {formatSize(r.transferSize)}
                  </span>
                  <span className="text-muted-foreground w-12 text-right">
                    {pct.toFixed(1)}%
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Request Count */}
        <div>
          <div className="flex items-baseline gap-2 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Total Requests</span>
            <span className="text-sm font-bold text-gray-900 dark:text-white">
              {totalCount}
            </span>
          </div>
          {/* Stacked bar */}
          <div className="flex h-5 rounded-full overflow-hidden gap-px mb-4 bg-gray-100 dark:bg-gray-800">
            {sorted.map(r => {
              const pct = totalCount > 0 ? (r.count / totalCount) * 100 : 0;
              if (pct < 1) return null;
              return (
                <div
                  key={r.type}
                  title={`${getConfig(r.type).label}: ${r.count} requests (${pct.toFixed(1)}%)`}
                  className={`${getConfig(r.type).bgColor} transition-all`}
                  style={{ width: `${pct}%` }}
                />
              );
            })}
          </div>
          {/* Legend */}
          <div className="space-y-1.5">
            {sorted.map(r => {
              const pct = totalCount > 0 ? (r.count / totalCount) * 100 : 0;
              if (r.count === 0) return null;
              const cfg = getConfig(r.type);
              return (
                <div key={r.type} className="flex items-center gap-2 text-xs">
                  <div
                    className="w-2.5 h-2.5 rounded-sm flex-shrink-0"
                    style={{ backgroundColor: cfg.color }}
                  />
                  <span className="text-muted-foreground flex-1">{cfg.label}</span>
                  <span className="font-medium text-gray-700 dark:text-gray-300">
                    {r.count} {r.count === 1 ? 'request' : 'requests'}
                  </span>
                  <span className="text-muted-foreground w-12 text-right">
                    {pct.toFixed(1)}%
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
