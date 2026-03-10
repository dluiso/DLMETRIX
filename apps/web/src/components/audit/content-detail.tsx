'use client';

import type { ContentData } from '@dlmetrix/shared';
import { cn } from '@/lib/utils';

interface Props {
  content: ContentData;
  userRole?: string;
}

function Metric({ label, value, sub, status }: {
  label: string;
  value: string | number;
  sub?: string;
  status?: 'good' | 'warn' | 'bad';
}) {
  const color = status === 'good' ? 'text-green-600' : status === 'warn' ? 'text-amber-600' : status === 'bad' ? 'text-red-600' : 'text-gray-900 dark:text-white';
  return (
    <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4">
      <div className={cn('text-2xl font-bold', color)}>{value}</div>
      <div className="text-xs font-medium text-gray-700 dark:text-gray-300 mt-0.5">{label}</div>
      {sub && <div className="text-xs text-muted-foreground mt-0.5">{sub}</div>}
    </div>
  );
}

export function ContentDetailPanel({ content, userRole }: Props) {
  if (!content) return null;

  const readStatus = (content.readabilityScore || 0) >= 60 ? 'good'
    : (content.readabilityScore || 0) >= 30 ? 'warn' : 'bad';

  const wordStatus = (content.wordCount || 0) >= 300 ? 'good'
    : (content.wordCount || 0) >= 100 ? 'warn' : 'bad';

  const ratioStatus = (content.textToHtmlRatio || 0) >= 15 ? 'good'
    : (content.textToHtmlRatio || 0) >= 5 ? 'warn' : 'bad';

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border p-6">
      <h3 className="font-semibold mb-1">Content Analysis</h3>
      <p className="text-xs text-muted-foreground mb-5">Quality and structure of page content</p>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
        <Metric
          label="Word Count"
          value={content.wordCount || 0}
          sub={content.contentLength}
          status={wordStatus}
        />
        <Metric
          label="Readability"
          value={`${content.readabilityScore || 0}/100`}
          sub="Flesch score"
          status={readStatus}
        />
        <Metric
          label="Text/HTML Ratio"
          value={`${content.textToHtmlRatio || 0}%`}
          sub="ideal >15%"
          status={ratioStatus}
        />
        <Metric
          label="Paragraphs"
          value={content.paragraphCount || 0}
        />
        <Metric
          label="Avg Sentence"
          value={`${content.avgSentenceLength || 0} words`}
          sub="ideal 15-20"
        />
        <Metric
          label="Structured Content"
          value={content.hasStructuredContent ? 'Yes' : 'No'}
          sub="lists/tables"
          status={content.hasStructuredContent ? 'good' : 'warn'}
        />
      </div>

      {/* Keyword Density */}
      {content.keywordDensity && content.keywordDensity.length > 0 && (
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
            Top Keywords
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
            {content.keywordDensity.slice(0, 10).map((kw) => (
              <div
                key={kw.keyword}
                className="bg-gray-50 dark:bg-gray-800/50 rounded-lg px-3 py-2 flex items-center justify-between gap-2"
              >
                <span className="text-xs font-medium text-gray-700 dark:text-gray-300 truncate">{kw.keyword}</span>
                <div className="text-right flex-shrink-0">
                  <div className="text-xs font-bold text-brand-600">{kw.density}%</div>
                  <div className="text-xs text-muted-foreground">{kw.count}×</div>
                </div>
              </div>
            ))}
          </div>
          {(userRole === 'PRO' || userRole === 'PREMIUM' || userRole === 'ADMIN') && (
            <p className="text-xs text-muted-foreground mt-3">
              Ideal keyword density is 1-3%. Over-optimization can trigger spam filters.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
