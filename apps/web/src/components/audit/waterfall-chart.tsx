'use client';

import { useState, useMemo } from 'react';
import type { NetworkRequest } from '@dlmetrix/shared';

interface Props {
  requests: NetworkRequest[];
}

const TYPE_FILTERS = ['All', 'HTML', 'JS', 'CSS', 'Images', 'Fonts', 'XHR', 'Other'] as const;
type TypeFilter = typeof TYPE_FILTERS[number];

const TYPE_MAP: Record<TypeFilter, string[]> = {
  All:    [],
  HTML:   ['Document', 'document'],
  JS:     ['Script', 'script'],
  CSS:    ['Stylesheet', 'stylesheet'],
  Images: ['Image', 'image'],
  Fonts:  ['Font', 'font'],
  XHR:    ['XHR', 'xhr', 'Fetch', 'fetch'],
  Other:  ['Other', 'other', 'Media', 'media'],
};

const TYPE_COLORS: Record<string, string> = {
  Document:   '#10b981',
  document:   '#10b981',
  Script:     '#f59e0b',
  script:     '#f59e0b',
  Stylesheet: '#8b5cf6',
  stylesheet: '#8b5cf6',
  Image:      '#3b82f6',
  image:      '#3b82f6',
  Font:       '#ec4899',
  font:       '#ec4899',
  XHR:        '#06b6d4',
  xhr:        '#06b6d4',
  Fetch:      '#06b6d4',
  fetch:      '#06b6d4',
};

function getColor(type: string): string {
  return TYPE_COLORS[type] || '#94a3b8';
}

function truncateUrl(url: string, maxLen = 55): string {
  try {
    const u = new URL(url);
    const path = u.pathname + u.search;
    if (path.length <= maxLen) return path;
    return '\u2026' + path.slice(-maxLen);
  } catch {
    if (url.length <= maxLen) return url;
    return '\u2026' + url.slice(-maxLen);
  }
}

function formatSize(bytes: number): string {
  if (bytes >= 1024) return `${(bytes / 1024).toFixed(0)}KB`;
  return `${bytes}B`;
}

export function WaterfallChart({ requests }: Props) {
  const [activeFilter, setActiveFilter] = useState<TypeFilter>('All');
  const [showAll, setShowAll] = useState(false);

  const filtered = useMemo(() => {
    if (activeFilter === 'All') return requests;
    const types = TYPE_MAP[activeFilter];
    return requests.filter(r => types.includes(r.type));
  }, [requests, activeFilter]);

  const displayed = showAll ? filtered : filtered.slice(0, 20);

  const maxEnd = useMemo(() => {
    return Math.max(...requests.map(r => r.startTime + r.duration), 1);
  }, [requests]);

  if (!requests || requests.length === 0) return null;

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div>
          <h3 className="font-semibold">Request Waterfall</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            {requests.length} requests &middot; {filtered.length} shown
          </p>
        </div>
        {/* Filter tabs */}
        <div className="flex flex-wrap gap-1">
          {TYPE_FILTERS.map(f => (
            <button
              key={f}
              onClick={() => { setActiveFilter(f); setShowAll(false); }}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                activeFilter === f
                  ? 'bg-brand-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-muted-foreground hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Table header */}
      <div className="grid grid-cols-[1fr_60px_60px_40%] gap-2 px-2 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b mb-1">
        <span>URL</span>
        <span className="text-right">Status</span>
        <span className="text-right">Size</span>
        <span className="pl-2">Timeline</span>
      </div>

      {/* Rows */}
      <div className="space-y-0.5">
        {displayed.map((req, i) => {
          const color = getColor(req.type);
          const startPct = (req.startTime / maxEnd) * 100;
          const widthPct = Math.max((req.duration / maxEnd) * 100, 0.5);
          return (
            <div
              key={i}
              className="grid grid-cols-[1fr_60px_60px_40%] gap-2 px-2 py-1.5 text-xs rounded hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors items-center group"
            >
              <span
                className="truncate font-mono text-gray-700 dark:text-gray-300"
                title={req.url}
              >
                {truncateUrl(req.url)}
              </span>
              <span className={`text-right font-medium ${req.status >= 400 ? 'text-red-500' : req.status >= 300 ? 'text-amber-500' : 'text-gray-500 dark:text-gray-400'}`}>
                {req.status || '\u2014'}
              </span>
              <span className="text-right text-gray-500 dark:text-gray-400">
                {req.transferSize > 0 ? formatSize(req.transferSize) : formatSize(req.size)}
              </span>
              {/* Timeline bar */}
              <div className="relative h-4 bg-gray-100 dark:bg-gray-800 rounded overflow-hidden">
                <div
                  className="absolute top-0 h-full rounded"
                  style={{
                    left:  `${Math.min(startPct, 99)}%`,
                    width: `${Math.min(widthPct, 100 - Math.min(startPct, 99))}%`,
                    backgroundColor: color,
                    opacity: 0.75,
                  }}
                  title={`Start: ${req.startTime}ms · Duration: ${req.duration}ms`}
                />
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length > 20 && (
        <div className="mt-3 text-center">
          <button
            onClick={() => setShowAll(!showAll)}
            className="text-xs text-brand-600 hover:underline font-medium"
          >
            {showAll ? 'Show fewer' : `Show all ${filtered.length} requests`}
          </button>
        </div>
      )}

      {/* Time scale */}
      <div className="mt-3 flex justify-between text-xs text-muted-foreground pl-[60%]">
        <span>0ms</span>
        <span>{Math.round(maxEnd / 2)}ms</span>
        <span>{Math.round(maxEnd)}ms</span>
      </div>
    </div>
  );
}
