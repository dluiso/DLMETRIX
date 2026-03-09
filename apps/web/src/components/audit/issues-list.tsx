'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import type { AuditIssue } from '@dlmetrix/shared';
import { ChevronDown, ChevronUp, AlertTriangle, AlertCircle, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Props {
  criticalIssues: AuditIssue[];
  highIssues: AuditIssue[];
  otherIssues: AuditIssue[];
}

const severityConfig = {
  critical: { label: 'Critical', color: 'text-red-600 bg-red-50 border-red-200 dark:bg-red-950 dark:border-red-900', icon: AlertCircle },
  high:     { label: 'High',     color: 'text-orange-600 bg-orange-50 border-orange-200 dark:bg-orange-950 dark:border-orange-900', icon: AlertTriangle },
  medium:   { label: 'Medium',   color: 'text-amber-600 bg-amber-50 border-amber-200', icon: AlertTriangle },
  low:      { label: 'Low',      color: 'text-blue-600 bg-blue-50 border-blue-200', icon: Info },
  info:     { label: 'Info',     color: 'text-gray-600 bg-gray-50 border-gray-200', icon: Info },
};

function IssueItem({ issue }: { issue: AuditIssue }) {
  const [expanded, setExpanded] = useState(false);
  const t = useTranslations('audit');
  const config = severityConfig[issue.severity] || severityConfig.info;
  const Icon = config.icon;

  return (
    <div className={cn('rounded-xl border p-4 transition-all', config.color)}>
      <button
        className="w-full flex items-start gap-3 text-left"
        onClick={() => setExpanded(!expanded)}
      >
        <Icon className="h-5 w-5 mt-0.5 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="font-medium text-sm">{issue.title}</div>
          {!expanded && (
            <div className="text-xs opacity-70 mt-0.5 truncate">{issue.description}</div>
          )}
        </div>
        <span className="flex-shrink-0 px-2 py-0.5 rounded-full text-xs font-medium border opacity-70 self-start">
          {config.label}
        </span>
        {expanded ? <ChevronUp className="h-4 w-4 flex-shrink-0 mt-0.5" /> : <ChevronDown className="h-4 w-4 flex-shrink-0 mt-0.5" />}
      </button>

      {expanded && (
        <div className="mt-3 ml-8 space-y-2">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider opacity-60">
              {t('technicalDetail')}
            </span>
            <p className="text-sm mt-1">{issue.technicalDetail}</p>
          </div>
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider opacity-60">
              {t('recommendation')}
            </span>
            <p className="text-sm mt-1 font-medium">{issue.recommendation}</p>
          </div>
          {issue.affectedElement && (
            <div className="font-mono text-xs bg-black/10 dark:bg-white/10 rounded p-2 mt-2 break-all">
              {issue.affectedElement}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function IssuesList({ criticalIssues, highIssues, otherIssues }: Props) {
  const allIssues = [...criticalIssues, ...highIssues, ...otherIssues];

  if (allIssues.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <div className="text-4xl mb-3">✓</div>
        <p>No issues found in this category</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {allIssues.map((issue) => (
        <IssueItem key={issue.id} issue={issue} />
      ))}
    </div>
  );
}
