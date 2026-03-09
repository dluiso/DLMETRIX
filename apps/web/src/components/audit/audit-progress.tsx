'use client';

import { useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import { BarChart3 } from 'lucide-react';
import type { AuditProgressEvent } from '@dlmetrix/shared';
import { AUDIT_PHASES } from '@dlmetrix/shared';

interface Props {
  auditId: string;
  progress: AuditProgressEvent | null;
  status: string;
}

export function AuditProgress({ auditId, progress, status }: Props) {
  const t = useTranslations('audit');
  const currentProgress = progress?.progress ?? (status === 'pending' ? 2 : 10);
  const currentPhase = progress?.phase ?? 'initializing';

  const phaseLabel = t(`phases.${currentPhase}` as any);

  return (
    <div className="max-w-2xl mx-auto py-20 text-center">
      {/* Animated logo */}
      <div className="flex justify-center mb-8">
        <div className="relative">
          <div className="w-24 h-24 rounded-full border-4 border-brand-100 dark:border-brand-900 flex items-center justify-center">
            <BarChart3 className="h-10 w-10 text-brand-600 animate-pulse" />
          </div>
          {/* Spinning ring */}
          <svg
            className="absolute inset-0 -rotate-90"
            width="96" height="96" viewBox="0 0 96 96"
          >
            <circle cx="48" cy="48" r="44" fill="none" stroke="#e0e7ff" strokeWidth="4" />
            <circle
              cx="48" cy="48" r="44"
              fill="none" stroke="#2563eb" strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 44}`}
              strokeDashoffset={`${2 * Math.PI * 44 * (1 - currentProgress / 100)}`}
              style={{ transition: 'stroke-dashoffset 0.8s ease' }}
            />
          </svg>
        </div>
      </div>

      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
        {t('analyzing')}
      </h2>

      <p className="text-muted-foreground mb-8 h-6">
        {phaseLabel}
      </p>

      {/* Progress bar */}
      <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2 mb-4 overflow-hidden">
        <div
          className="h-2 bg-brand-600 rounded-full transition-all duration-700 ease-out"
          style={{ width: `${currentProgress}%` }}
        />
      </div>

      <p className="text-xs text-muted-foreground">{currentProgress}% complete</p>

      {/* Phase list */}
      <div className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-3">
        {AUDIT_PHASES.filter(p => p.phase !== 'initializing' && p.phase !== 'completed' && p.phase !== 'failed').map((p) => {
          const isActive = p.phase === currentPhase;
          const isDone = (progress?.progress ?? 0) > p.progress;

          return (
            <div
              key={p.phase}
              className={`p-2 rounded-lg border text-xs transition-all ${
                isDone
                  ? 'border-green-200 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400'
                  : isActive
                  ? 'border-brand-300 bg-brand-50 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300 font-medium'
                  : 'border-gray-100 dark:border-gray-800 text-muted-foreground'
              }`}
            >
              {isDone ? '✓ ' : ''}{p.label}
            </div>
          );
        })}
      </div>
    </div>
  );
}
