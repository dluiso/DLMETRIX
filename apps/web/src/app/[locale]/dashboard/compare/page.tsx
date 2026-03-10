'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import { Navbar } from '@/components/layout/navbar';
import { DashboardSidebar } from '@/components/dashboard/sidebar';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';
import { getScoreLabel } from '@dlmetrix/shared';
import {
  RadarChart, PolarGrid, PolarAngleAxis, Radar,
  ResponsiveContainer, Tooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from 'recharts';
import { GitCompare, Search, Loader2, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

const CATEGORIES = [
  { key: 'performanceScore', label: 'Performance'   },
  { key: 'seoScore',         label: 'SEO'           },
  { key: 'contentScore',     label: 'Content'       },
  { key: 'metadataScore',    label: 'Metadata'      },
  { key: 'linksScore',       label: 'Links'         },
  { key: 'accessibilityScore', label: 'Accessibility' },
  { key: 'securityScore',    label: 'Security'      },
];

export default function ComparePage() {
  const t = useTranslations('nav');
  const { isAuthenticated, user } = useAuthStore();
  const router = useRouter();

  const [domain1, setDomain1] = useState('');
  const [domain2, setDomain2] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult]   = useState<any>(null);
  const [error, setError]     = useState('');

  if (!isAuthenticated) { router.push('/login'); return null; }

  const compare = async () => {
    if (!domain1 || !domain2) return;
    setError('');
    setLoading(true);
    try {
      const data = await api.get<any>(`/audits/compare?domain1=${encodeURIComponent(domain1)}&domain2=${encodeURIComponent(domain2)}`);
      if (!data.domain1 && !data.domain2) {
        setError('No completed audits found for either domain. Run an audit for each domain first.');
        setResult(null);
      } else if (!data.domain1) {
        setError(`No completed audit found for "${domain1}". Run an audit for this domain first.`);
        setResult(null);
      } else if (!data.domain2) {
        setError(`No completed audit found for "${domain2}". Run an audit for this domain first.`);
        setResult(null);
      } else {
        setResult(data);
      }
    } catch (e: any) {
      setError(e?.message || 'Comparison failed. Please try again.');
    } finally { setLoading(false); }
  };

  // Build radar data
  const radarData = result ? CATEGORIES.map(({ key, label }) => ({
    subject: label,
    [result.domain1.domain]: result.domain1[key] ?? 0,
    [result.domain2.domain]: result.domain2[key] ?? 0,
  })) : [];

  // Build bar data
  const barData = result ? CATEGORIES.map(({ key, label }) => ({
    name: label,
    [result.domain1.domain]: result.domain1[key] ?? 0,
    [result.domain2.domain]: result.domain2[key] ?? 0,
  })) : [];

  const ScoreDiff = ({ a, b }: { a: number; b: number }) => {
    const diff = a - b;
    if (diff === 0) return <Minus className="h-4 w-4 text-muted-foreground" />;
    if (diff > 0) return <span className="flex items-center text-green-600 text-xs font-medium"><TrendingUp className="h-3.5 w-3.5 mr-0.5" />+{diff}</span>;
    return <span className="flex items-center text-red-500 text-xs font-medium"><TrendingDown className="h-3.5 w-3.5 mr-0.5" />{diff}</span>;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Navbar />
      <div className="flex">
        <DashboardSidebar />
        <main className="flex-1 p-6 max-w-6xl">
          <div className="flex items-center gap-3 mb-6">
            <GitCompare className="h-6 w-6 text-brand-600" />
            <div>
              <h1 className="text-2xl font-bold">{t('compare')}</h1>
              <p className="text-sm text-muted-foreground">Compare latest audit scores between two domains</p>
            </div>
          </div>

          {/* Input row */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl border p-6 mb-6">
            <div className="flex flex-col sm:flex-row gap-3 items-end">
              <div className="flex-1">
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Domain A</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    value={domain1}
                    onChange={e => setDomain1(e.target.value)}
                    placeholder="example.com"
                    className="w-full pl-9 pr-4 py-2.5 rounded-lg border bg-gray-50 dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              </div>

              <div className="text-muted-foreground font-bold text-xl pb-2">vs</div>

              <div className="flex-1">
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Domain B</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    value={domain2}
                    onChange={e => setDomain2(e.target.value)}
                    placeholder="competitor.com"
                    className="w-full pl-9 pr-4 py-2.5 rounded-lg border bg-gray-50 dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              </div>

              <Button onClick={compare} disabled={loading || !domain1 || !domain2} className="px-8">
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Compare'}
              </Button>
            </div>

            {error && <p className="mt-3 text-sm text-red-500">{error}</p>}
          </div>

          {/* Results */}
          {result && (
            <div className="space-y-6">
              {/* Overall score cards */}
              <div className="grid grid-cols-2 gap-4">
                {[result.domain1, result.domain2].map((d: any, i: number) => {
                  const scoreInfo = getScoreLabel(d.overallScore ?? 0);
                  return (
                    <div
                      key={d.domain}
                      className={cn(
                        'bg-white dark:bg-gray-900 rounded-2xl border p-6 text-center',
                        i === 0 ? 'border-blue-200 dark:border-blue-900' : 'border-purple-200 dark:border-purple-900',
                      )}
                    >
                      <div className={cn('text-xs font-bold uppercase tracking-wider mb-3', i === 0 ? 'text-blue-600' : 'text-purple-600')}>
                        Domain {i === 0 ? 'A' : 'B'}
                      </div>
                      <p className="font-semibold text-lg truncate">{d.domain}</p>
                      <div className="text-5xl font-bold mt-3 mb-1" style={{ color: scoreInfo.color }}>
                        {d.overallScore ?? '—'}
                      </div>
                      <div className="text-sm font-medium" style={{ color: scoreInfo.color }}>
                        {scoreInfo.label}
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        Last audit: {new Date(d.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  );
                })}
              </div>

              {/* Category comparison table */}
              <div className="bg-white dark:bg-gray-900 rounded-2xl border overflow-hidden">
                <div className="px-6 py-4 border-b">
                  <h3 className="font-semibold">Category Breakdown</h3>
                </div>
                <div className="divide-y">
                  {CATEGORIES.map(({ key, label }) => {
                    const a = result.domain1[key] ?? null;
                    const b = result.domain2[key] ?? null;
                    const aInfo = a !== null ? getScoreLabel(a) : null;
                    const bInfo = b !== null ? getScoreLabel(b) : null;
                    return (
                      <div key={key} className="grid grid-cols-[1fr_auto_1fr] gap-4 px-6 py-3.5 items-center">
                        {/* Domain A score */}
                        <div className="flex items-center gap-3">
                          <div className="w-16 h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                            <div className="h-full rounded-full" style={{ width: `${a ?? 0}%`, backgroundColor: aInfo?.color || '#e5e7eb' }} />
                          </div>
                          <span className="text-sm font-semibold w-8 text-right" style={{ color: aInfo?.color }}>
                            {a ?? '—'}
                          </span>
                        </div>

                        {/* Category name + diff */}
                        <div className="text-center">
                          <p className="text-sm font-medium">{label}</p>
                          {a !== null && b !== null && (
                            <div className="flex justify-center mt-0.5">
                              <ScoreDiff a={a} b={b} />
                            </div>
                          )}
                        </div>

                        {/* Domain B score */}
                        <div className="flex items-center gap-3 justify-end">
                          <span className="text-sm font-semibold w-8" style={{ color: bInfo?.color }}>
                            {b ?? '—'}
                          </span>
                          <div className="w-16 h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                            <div className="h-full rounded-full" style={{ width: `${b ?? 0}%`, backgroundColor: bInfo?.color || '#e5e7eb' }} />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Radar chart */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-gray-900 rounded-2xl border p-6">
                  <h3 className="font-semibold mb-4 text-sm">Radar Comparison</h3>
                  <ResponsiveContainer width="100%" height={280}>
                    <RadarChart data={radarData}>
                      <PolarGrid />
                      <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10 }} />
                      <Radar name={result.domain1.domain} dataKey={result.domain1.domain} stroke="#2563eb" fill="#2563eb" fillOpacity={0.15} />
                      <Radar name={result.domain2.domain} dataKey={result.domain2.domain} stroke="#9333ea" fill="#9333ea" fillOpacity={0.15} />
                      <Legend />
                      <Tooltip />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>

                <div className="bg-white dark:bg-gray-900 rounded-2xl border p-6">
                  <h3 className="font-semibold mb-4 text-sm">Bar Comparison</h3>
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={barData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                      <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 10 }} />
                      <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={80} />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey={result.domain1.domain} fill="#2563eb" radius={[0, 4, 4, 0]} />
                      <Bar dataKey={result.domain2.domain} fill="#9333ea" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
