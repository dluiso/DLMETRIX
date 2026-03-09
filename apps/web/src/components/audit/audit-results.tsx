'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';
import {
  RadarChart, PolarGrid, PolarAngleAxis, Radar,
  ResponsiveContainer, Tooltip,
} from 'recharts';
import type { AuditResult, CategoryScore } from '@dlmetrix/shared';
import { getScoreLabel } from '@dlmetrix/shared';
import { ScoreGauge } from './score-gauge';
import { CategoryCard } from './category-card';
import { IssuesList } from './issues-list';
import { CoreWebVitals } from './core-web-vitals';
import { BrowserTimings } from './browser-timings';
import { ResourceBreakdown } from './resource-breakdown';
import { WaterfallChart } from './waterfall-chart';
import { Button } from '@/components/ui/button';
import { Download, RefreshCw, Share2, Check, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';

interface Props {
  audit: AuditResult;
}

function getLetterGrade(score: number): { grade: string; color: string } {
  if (score >= 90) return { grade: 'A', color: '#22c55e' };
  if (score >= 80) return { grade: 'B', color: '#84cc16' };
  if (score >= 70) return { grade: 'C', color: '#f59e0b' };
  if (score >= 60) return { grade: 'D', color: '#f97316' };
  return { grade: 'F', color: '#ef4444' };
}

export function AuditResults({ audit }: Props) {
  const t = useTranslations('audit');
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [copied, setCopied]       = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);

  const handleShare = async () => {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      // Fallback for browsers without clipboard API
      const el = document.createElement('textarea');
      el.value = url;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExportPdf = async () => {
    setPdfLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/reports/${audit.id}/pdf`,
        { headers: token ? { Authorization: `Bearer ${token}` } : {} },
      );
      if (!res.ok) throw new Error('PDF export failed');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `dlmetrix-audit-${audit.domain}-${audit.id.slice(0, 8)}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
    } finally {
      setPdfLoading(false);
    }
  };

  const handleReanalyze = () => {
    router.push(`/?url=${encodeURIComponent(audit.url)}`);
  };

  const scoreInfo = getScoreLabel(audit.overallScore);
  const letterGrade = getLetterGrade(audit.overallScore);

  const radarData = audit.categories.map((c) => ({
    subject: t(`categories.${c.category}` as any),
    score: c.score,
    fullMark: 100,
  }));

  const filteredIssues = activeCategory
    ? audit.categories.find((c) => c.category === activeCategory)?.issues || []
    : audit.categories.flatMap((c) => c.issues);

  const criticalIssues = filteredIssues.filter((i) => i.severity === 'critical');
  const highIssues = filteredIssues.filter((i) => i.severity === 'high');
  const otherIssues = filteredIssues.filter((i) => i.severity !== 'critical' && i.severity !== 'high');

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('title')}</h1>
          <p className="text-muted-foreground text-sm mt-1 break-all">{audit.url}</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Button variant="outline" size="sm" onClick={handleShare}>
            {copied
              ? <><Check className="h-4 w-4 mr-2 text-green-500" /> Copied!</>
              : <><Share2 className="h-4 w-4 mr-2" /> Share</>
            }
          </Button>
          <Button variant="outline" size="sm" onClick={handleExportPdf} disabled={pdfLoading}>
            {pdfLoading
              ? <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              : <Download className="h-4 w-4 mr-2" />
            }
            Export PDF
          </Button>
          <Button size="sm" onClick={handleReanalyze}>
            <RefreshCw className="h-4 w-4 mr-2" /> Re-analyze
          </Button>
        </div>
      </div>

      {/* Overall score + radar */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Overall Score */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border p-8 flex flex-col items-center justify-center">
          <p className="text-sm font-medium text-muted-foreground mb-4">{t('score')}</p>
          <ScoreGauge score={audit.overallScore} />
          <div
            className="mt-4 text-lg font-bold"
            style={{ color: scoreInfo.color }}
          >
            {scoreInfo.label}
          </div>
          <div className="mt-3 flex items-center justify-center gap-2">
            <div
              className="text-4xl font-black leading-none"
              style={{ color: letterGrade.color }}
            >
              {letterGrade.grade}
            </div>
            <div className="text-xs text-muted-foreground leading-tight">
              <div>Grade</div>
              <div className="font-medium" style={{ color: letterGrade.color }}>
                {audit.overallScore}/100
              </div>
            </div>
          </div>
          {audit.metadata?.title && (
            <p className="mt-2 text-sm text-muted-foreground text-center truncate max-w-xs">
              {audit.metadata.title}
            </p>
          )}
        </div>

        {/* Radar chart */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border p-6">
          <h3 className="text-sm font-semibold text-muted-foreground mb-4 uppercase tracking-wider">
            Score Breakdown
          </h3>
          <ResponsiveContainer width="100%" height={260}>
            <RadarChart data={radarData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11 }} />
              <Radar
                name="Score"
                dataKey="score"
                stroke="#2563eb"
                fill="#2563eb"
                fillOpacity={0.2}
              />
              <Tooltip formatter={(v: any) => [`${v}/100`]} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Category cards */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Category Scores</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
          {audit.categories.map((cat) => (
            <CategoryCard
              key={cat.category}
              category={cat}
              active={activeCategory === cat.category}
              onClick={() =>
                setActiveCategory(activeCategory === cat.category ? null : cat.category)
              }
            />
          ))}
        </div>
      </div>

      {/* Core Web Vitals */}
      {audit.performance && <CoreWebVitals performance={audit.performance} />}

      {/* Browser Timings */}
      {audit.performance?.browserTimings && (
        <BrowserTimings timings={audit.performance.browserTimings} />
      )}

      {/* Resource Breakdown */}
      {audit.performance?.resourceBreakdown && audit.performance.resourceBreakdown.length > 0 && (
        <ResourceBreakdown
          resources={audit.performance.resourceBreakdown}
          totalRequests={audit.performance.requests}
          totalSize={audit.performance.pageSize}
        />
      )}

      {/* Waterfall Chart */}
      {audit.performance?.networkRequests && audit.performance.networkRequests.length > 0 && (
        <WaterfallChart requests={audit.performance.networkRequests} />
      )}

      {/* Issues list */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border">
        <div className="px-6 py-4 border-b flex items-center justify-between">
          <h3 className="font-semibold">
            {activeCategory
              ? `${t(`categories.${activeCategory}` as any)} Issues`
              : 'All Issues'}
          </h3>
          <span className="text-sm text-muted-foreground">
            {filteredIssues.length} issues
          </span>
        </div>
        <div className="p-6">
          <IssuesList
            criticalIssues={criticalIssues}
            highIssues={highIssues}
            otherIssues={otherIssues}
          />
        </div>
      </div>

      {/* Metadata summary */}
      {audit.metadata && (
        <div className="bg-white dark:bg-gray-900 rounded-2xl border p-6">
          <h3 className="font-semibold mb-4">Page Details</h3>
          <dl className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {audit.metadata.loadTime && (
              <div>
                <dt className="text-xs text-muted-foreground">Load Time</dt>
                <dd className="font-semibold">{(audit.metadata.loadTime / 1000).toFixed(2)}s</dd>
              </div>
            )}
            {audit.metadata.pageSize && (
              <div>
                <dt className="text-xs text-muted-foreground">Page Size</dt>
                <dd className="font-semibold">{(audit.metadata.pageSize / 1024).toFixed(0)} KB</dd>
              </div>
            )}
            {audit.metadata.httpStatus && (
              <div>
                <dt className="text-xs text-muted-foreground">HTTP Status</dt>
                <dd className="font-semibold">{audit.metadata.httpStatus}</dd>
              </div>
            )}
            {audit.metadata.redirectChain && audit.metadata.redirectChain.length > 0 && (
              <div>
                <dt className="text-xs text-muted-foreground">Redirects</dt>
                <dd className="font-semibold">{audit.metadata.redirectChain.length}</dd>
              </div>
            )}
          </dl>
        </div>
      )}
    </div>
  );
}
