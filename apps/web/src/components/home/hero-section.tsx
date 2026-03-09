'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, ArrowRight, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';

export function HeroSection() {
  const t = useTranslations('home.hero');
  const tErr = useTranslations('errors');
  const router = useRouter();
  const searchParams = useSearchParams();

  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const prefill = searchParams.get('url');
    if (prefill) setUrl(prefill);
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;

    setError('');
    setLoading(true);

    try {
      const data = await api.post<{ auditId: string }>('/audits', { url: url.trim() });
      router.push(`/audit/${data.auditId}`);
    } catch (err: any) {
      if (err.status === 429) {
        setError(tErr('rateLimit', { limit: err.data?.limit || 10, resetAt: 'tomorrow' }));
      } else if (err.status === 400) {
        setError(tErr('invalidUrl'));
      } else {
        setError(tErr('networkError'));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-brand-50 via-white to-white dark:from-gray-900 dark:via-gray-950 dark:to-gray-950 pt-20 pb-24">
      {/* Background decoration */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-brand-100/50 dark:bg-brand-900/10 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 max-w-4xl text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 bg-brand-50 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300 border border-brand-200 dark:border-brand-800 rounded-full px-4 py-1.5 text-sm font-medium mb-8">
          <Zap className="h-3.5 w-3.5" />
          {t('badge')}
        </div>

        {/* Title */}
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-gray-900 dark:text-white mb-6 leading-tight">
          {t('title')}
        </h1>

        {/* Subtitle */}
        <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
          {t('subtitle')}
        </p>

        {/* URL Input Form */}
        <form onSubmit={handleSubmit} className="max-w-2xl mx-auto">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder={t('placeholder')}
                className={cn(
                  'w-full pl-10 pr-4 py-3.5 rounded-xl border bg-white dark:bg-gray-900',
                  'text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent',
                  'placeholder:text-muted-foreground',
                  error ? 'border-red-400' : 'border-gray-200 dark:border-gray-700',
                )}
                disabled={loading}
              />
            </div>
            <Button
              type="submit"
              size="lg"
              disabled={loading || !url.trim()}
              className="rounded-xl px-8 py-3.5 text-sm font-semibold bg-brand-600 hover:bg-brand-700"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                  {t('analyzing')}
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  {t('analyze')}
                  <ArrowRight className="h-4 w-4" />
                </span>
              )}
            </Button>
          </div>

          {error && (
            <p className="mt-3 text-sm text-red-500 text-left">{error}</p>
          )}
        </form>

        {/* Trust indicators */}
        <p className="mt-6 text-xs text-muted-foreground">
          No login required · Free for 10 audits/day · No data stored
        </p>
      </div>
    </section>
  );
}
