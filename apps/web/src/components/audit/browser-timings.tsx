'use client';

import type { BrowserTimings } from '@dlmetrix/shared';

interface Props {
  timings: BrowserTimings;
}

interface TimingRow {
  key: keyof BrowserTimings;
  label: string;
  description: string;
  color: string;      // Tailwind border-left color class
  bgColor: string;    // subtle background
  group: 'connection' | 'browser';
}

const TIMING_ROWS: TimingRow[] = [
  { key: 'redirect',         label: 'Redirect Duration',       description: 'Time spent on HTTP redirects',                  color: 'border-l-gray-400',    bgColor: 'bg-gray-50 dark:bg-gray-800/40',    group: 'connection' },
  { key: 'dns',              label: 'DNS Lookup',               description: 'Domain name resolution time',                   color: 'border-l-violet-500',  bgColor: 'bg-violet-50 dark:bg-violet-950/30', group: 'connection' },
  { key: 'connection',       label: 'Connection Duration',      description: 'TCP connection establishment time',             color: 'border-l-blue-500',    bgColor: 'bg-blue-50 dark:bg-blue-950/30',    group: 'connection' },
  { key: 'ssl',              label: 'SSL/TLS Handshake',        description: 'Secure connection negotiation time',            color: 'border-l-cyan-500',    bgColor: 'bg-cyan-50 dark:bg-cyan-950/30',    group: 'connection' },
  { key: 'backend',          label: 'Backend Duration',         description: 'Server processing time (TTFB)',                 color: 'border-l-emerald-500', bgColor: 'bg-emerald-50 dark:bg-emerald-950/30', group: 'connection' },
  { key: 'domInteractive',   label: 'DOM Interactive Time',     description: 'Time until DOM is ready for interaction',       color: 'border-l-amber-500',   bgColor: 'bg-amber-50 dark:bg-amber-950/30',  group: 'browser' },
  { key: 'domContentLoaded', label: 'DOM Content Loaded',       description: 'HTML parsed and deferred scripts executed',     color: 'border-l-orange-500',  bgColor: 'bg-orange-50 dark:bg-orange-950/30', group: 'browser' },
  { key: 'onload',           label: 'Onload Time',              description: 'Page and all resources fully loaded',           color: 'border-l-rose-500',    bgColor: 'bg-rose-50 dark:bg-rose-950/30',    group: 'browser' },
  { key: 'fullyLoaded',      label: 'Fully Loaded Time',        description: 'All activity (including lazy loads) complete',  color: 'border-l-pink-500',    bgColor: 'bg-pink-50 dark:bg-pink-950/30',    group: 'browser' },
];

function formatMs(ms: number): string {
  if (ms >= 1000) return `${(ms / 1000).toFixed(2)}s`;
  return `${Math.round(ms)}ms`;
}

export function BrowserTimings({ timings }: Props) {
  const connectionRows = TIMING_ROWS.filter(r => r.group === 'connection');
  const browserRows    = TIMING_ROWS.filter(r => r.group === 'browser');

  const hasAnyData = TIMING_ROWS.some(r => timings[r.key] != null && (timings[r.key] as number) >= 0);
  if (!hasAnyData) return null;

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border p-6">
      <h3 className="font-semibold mb-1">Browser Timings</h3>
      <p className="text-xs text-muted-foreground mb-5">
        Navigation milestones reported by the browser during page load
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Connection Phase */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
            Connection Phase
          </p>
          <div className="space-y-2">
            {connectionRows.map(row => {
              const value = timings[row.key];
              if (value == null) return null;
              return (
                <div
                  key={row.key}
                  className={`flex items-center justify-between rounded-lg border-l-4 px-4 py-3 ${row.color} ${row.bgColor}`}
                >
                  <div>
                    <div className="text-sm font-medium text-gray-800 dark:text-gray-200">{row.label}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{row.description}</div>
                  </div>
                  <div className="text-sm font-bold text-gray-900 dark:text-white ml-4 flex-shrink-0">
                    {formatMs(value as number)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Browser Events */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
            Browser Events
          </p>
          <div className="space-y-2">
            {browserRows.map(row => {
              const value = timings[row.key];
              if (value == null) return null;
              return (
                <div
                  key={row.key}
                  className={`flex items-center justify-between rounded-lg border-l-4 px-4 py-3 ${row.color} ${row.bgColor}`}
                >
                  <div>
                    <div className="text-sm font-medium text-gray-800 dark:text-gray-200">{row.label}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{row.description}</div>
                  </div>
                  <div className="text-sm font-bold text-gray-900 dark:text-white ml-4 flex-shrink-0">
                    {formatMs(value as number)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
