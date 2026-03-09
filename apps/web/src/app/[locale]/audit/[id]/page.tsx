'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { AuditProgress } from '@/components/audit/audit-progress';
import { AuditResults } from '@/components/audit/audit-results';
import { Navbar } from '@/components/layout/navbar';
import { useAuditSocket } from '@/hooks/use-audit-socket';
import { api } from '@/lib/api';
import type { AuditResult, AuditProgressEvent } from '@dlmetrix/shared';

export default function AuditPage() {
  const { id } = useParams<{ id: string }>();
  const t = useTranslations('audit');

  const [audit, setAudit] = useState<AuditResult | null>(null);
  const [status, setStatus] = useState<'pending' | 'running' | 'completed' | 'failed'>('pending');
  const [progress, setProgress] = useState<AuditProgressEvent | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Subscribe to WebSocket for real-time progress
  useAuditSocket(id, {
    onProgress: (event) => {
      setProgress(event);
      setStatus('running');
    },
    onCompleted: (result) => {
      setAudit(result);
      setStatus('completed');
    },
    onFailed: (err) => {
      setError(err);
      setStatus('failed');
    },
  });

  // Also poll the API for initial state (in case ws connects after completion)
  useEffect(() => {
    const fetchAudit = async () => {
      try {
        const data = await api.get<any>(`/audits/${id}`);
        if (data.status === 'COMPLETED' && data.result) {
          setAudit(data.result);
          setStatus('completed');
        } else if (data.status === 'FAILED') {
          setError(data.error || 'Analysis failed');
          setStatus('failed');
        } else {
          setStatus(data.status?.toLowerCase() || 'pending');
        }
      } catch {}
    };

    fetchAudit();
    // Poll every 3s while pending/running
    const interval = setInterval(() => {
      if (status === 'completed' || status === 'failed') {
        clearInterval(interval);
        return;
      }
      fetchAudit();
    }, 3000);

    return () => clearInterval(interval);
  }, [id]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Navbar />
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        {status !== 'completed' && status !== 'failed' && (
          <AuditProgress auditId={id} progress={progress} status={status} />
        )}

        {status === 'completed' && audit && (
          <AuditResults audit={audit} />
        )}

        {status === 'failed' && (
          <div className="text-center py-20">
            <div className="text-red-500 text-6xl mb-4">✕</div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              {t('phases.failed')}
            </h2>
            <p className="text-gray-500">{error}</p>
          </div>
        )}
      </main>
    </div>
  );
}
