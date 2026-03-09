'use client';

import { cn } from '@/lib/utils';
import type { PerformanceData } from '@dlmetrix/shared';
import { Gauge, Clock, LayoutDashboard, Zap, MousePointer } from 'lucide-react';

interface Props {
  performance: PerformanceData;
}

interface VitalMetric {
  key: keyof PerformanceData;
  label: string;
  unit: string;
  good: number;   // threshold for "good"
  poor: number;   // threshold for "poor"
  description: string;
  icon: any;
}

const VITALS: VitalMetric[] = [
  {
    key: 'lcp',
    label: 'LCP',
    unit: 'ms',
    good: 2500,
    poor: 4000,
    description: 'Largest Contentful Paint',
    icon: LayoutDashboard,
  },
  {
    key: 'fid',
    label: 'FID',
    unit: 'ms',
    good: 100,
    poor: 300,
    description: 'First Input Delay',
    icon: MousePointer,
  },
  {
    key: 'cls',
    label: 'CLS',
    unit: '',
    good: 0.1,
    poor: 0.25,
    description: 'Cumulative Layout Shift',
    icon: Gauge,
  },
  {
    key: 'fcp',
    label: 'FCP',
    unit: 'ms',
    good: 1800,
    poor: 3000,
    description: 'First Contentful Paint',
    icon: Zap,
  },
  {
    key: 'ttfb',
    label: 'TTFB',
    unit: 'ms',
    good: 800,
    poor: 1800,
    description: 'Time to First Byte',
    icon: Clock,
  },
  {
    key: 'tti',
    label: 'TTI',
    unit: 'ms',
    good: 3800,
    poor: 7300,
    description: 'Time to Interactive',
    icon: Clock,
  },
];

function getRating(value: number, good: number, poor: number): 'good' | 'needs-improvement' | 'poor' {
  if (value <= good) return 'good';
  if (value <= poor) return 'needs-improvement';
  return 'poor';
}

const RATING_STYLES = {
  'good':              'text-green-600  bg-green-50  dark:bg-green-950  border-green-200  dark:border-green-800',
  'needs-improvement': 'text-amber-600  bg-amber-50  dark:bg-amber-950  border-amber-200  dark:border-amber-800',
  'poor':              'text-red-600    bg-red-50    dark:bg-red-950    border-red-200    dark:border-red-800',
};

const RATING_LABEL = {
  'good': 'Good',
  'needs-improvement': 'Needs Work',
  'poor': 'Poor',
};

function formatValue(value: number, unit: string): string {
  if (unit === 'ms') {
    return value >= 1000 ? `${(value / 1000).toFixed(2)}s` : `${Math.round(value)}ms`;
  }
  return value.toFixed(3);
}

export function CoreWebVitals({ performance }: Props) {
  const vitalsWithData = VITALS.filter(v => performance[v.key] != null);

  if (vitalsWithData.length === 0) return null;

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border p-6">
      <h3 className="font-semibold mb-1">Core Web Vitals</h3>
      <p className="text-xs text-muted-foreground mb-5">
        Real-world performance metrics based on page load analysis
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {vitalsWithData.map(({ key, label, unit, good, poor, description, icon: Icon }) => {
          const raw = performance[key] as number;
          const rating = getRating(raw, good, poor);

          return (
            <div
              key={key}
              className={cn(
                'rounded-xl border p-4 flex flex-col gap-2',
                RATING_STYLES[rating],
              )}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Icon className="h-3.5 w-3.5 opacity-70" />
                  <span className="text-xs font-bold tracking-wide">{label}</span>
                </div>
                <span className="text-xs font-medium opacity-70">{RATING_LABEL[rating]}</span>
              </div>

              <div className="text-2xl font-bold">
                {formatValue(raw, unit)}
              </div>

              <div className="text-xs opacity-60">{description}</div>

              {/* Mini threshold bar */}
              <div className="w-full h-1.5 bg-black/10 rounded-full overflow-hidden mt-1">
                <div
                  className={cn(
                    'h-full rounded-full transition-all',
                    rating === 'good' ? 'bg-green-500' :
                    rating === 'needs-improvement' ? 'bg-amber-500' : 'bg-red-500',
                  )}
                  style={{
                    width: `${Math.min((raw / poor) * 100, 100)}%`,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mt-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-green-500 inline-block" /> Good
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" /> Needs Improvement
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block" /> Poor
        </span>
      </div>
    </div>
  );
}
