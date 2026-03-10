'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Check, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';

interface Plan {
  id: string;
  name: string;
  tier: string;
  description: string;
  priceMonthly: number;
  priceYearly: number;
  auditsPerDay: number;
  historyDays: number;
  hasExport: boolean;
  hasComparisons: boolean;
  hasApi: boolean;
  hasWhiteLabel: boolean;
  features: string[];
}

const TIER_STYLES: Record<string, { border: string; badge?: string; highlight: boolean }> = {
  FREE:    { border: 'border-gray-100 dark:border-gray-700',   highlight: false },
  PRO:     { border: 'border-brand-500 dark:border-brand-600', highlight: true,  badge: 'Most Popular' },
  PREMIUM: { border: 'border-amber-400 dark:border-amber-600', highlight: false, badge: 'Best Value' },
};

function buildFeatures(plan: Plan): string[] {
  const list: string[] = [];
  list.push(plan.auditsPerDay === -1 ? 'Unlimited audits/day' : `${plan.auditsPerDay} audits/day`);
  list.push(plan.historyDays === -1 ? 'Unlimited history' : plan.historyDays === 0 ? 'No history' : `${plan.historyDays}-day history`);
  if (plan.hasExport)      list.push('PDF & CSV export');
  if (plan.hasComparisons) list.push('Domain comparisons');
  if (plan.hasApi)         list.push('API access');
  if (plan.hasWhiteLabel)  list.push('White-label reports');
  if (plan.features?.length) list.push(...plan.features);
  return list;
}

export function PricingSection() {
  const t = useTranslations('plans');
  const [yearly, setYearly]   = useState(false);
  const [plans, setPlans]     = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<Plan[]>('/plans')
      .then(setPlans)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="py-20 bg-gray-50 dark:bg-gray-900" id="pricing">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">{t('title')}</h2>
          <p className="text-muted-foreground mb-8">{t('subtitle')}</p>

          <div className="inline-flex items-center gap-3 bg-white dark:bg-gray-800 rounded-full p-1 border">
            <button
              onClick={() => setYearly(false)}
              className={cn(
                'px-4 py-1.5 rounded-full text-sm font-medium transition-colors',
                !yearly ? 'bg-brand-600 text-white' : 'text-muted-foreground',
              )}
            >
              {t('monthly')}
            </button>
            <button
              onClick={() => setYearly(true)}
              className={cn(
                'px-4 py-1.5 rounded-full text-sm font-medium transition-colors',
                yearly ? 'bg-brand-600 text-white' : 'text-muted-foreground',
              )}
            >
              {t('yearly')} <span className="text-xs text-green-500 ml-1">{t('save', { percent: 17 })}</span>
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-brand-600" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map((plan) => {
              const style    = TIER_STYLES[plan.tier] || TIER_STYLES.FREE;
              const price    = yearly ? plan.priceYearly : plan.priceMonthly;
              const features = buildFeatures(plan);

              return (
                <div
                  key={plan.id}
                  className={cn(
                    'rounded-2xl p-6 border-2 bg-white dark:bg-gray-800 flex flex-col relative',
                    style.border,
                    style.highlight && 'shadow-lg shadow-brand-100 dark:shadow-brand-900/20 scale-105',
                  )}
                >
                  {style.badge && (
                    <div className={cn(
                      'absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-bold text-white',
                      plan.tier === 'PRO' ? 'bg-brand-600' : 'bg-amber-500',
                    )}>
                      {style.badge}
                    </div>
                  )}

                  <div className="mb-2">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">{plan.name}</h3>
                    {plan.description && (
                      <p className="text-xs text-muted-foreground mt-1">{plan.description}</p>
                    )}
                  </div>

                  <div className="mb-6 mt-3">
                    {price === 0 ? (
                      <span className="text-4xl font-bold">$0</span>
                    ) : (
                      <>
                        <span className="text-4xl font-bold">${price}</span>
                        <span className="text-muted-foreground text-sm ml-1">
                          {yearly ? t('perYear') : t('perMonth')}
                        </span>
                        {yearly && (
                          <p className="text-xs text-green-600 mt-1">
                            ${(price / 12).toFixed(2)}/month billed annually
                          </p>
                        )}
                      </>
                    )}
                  </div>

                  <ul className="space-y-3 mb-8 flex-1">
                    {features.map((f) => (
                      <li key={f} className="flex items-center gap-2 text-sm">
                        <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    className={cn(
                      'w-full',
                      plan.tier === 'PRO'     && 'bg-brand-600 hover:bg-brand-700',
                      plan.tier === 'PREMIUM' && 'bg-amber-500 hover:bg-amber-600',
                    )}
                    variant={plan.tier === 'FREE' ? 'outline' : 'default'}
                    asChild
                  >
                    <Link href={plan.tier === 'FREE' ? '/register' : '/pricing'}>
                      {plan.tier === 'FREE' ? 'Get Started Free' : t('upgrade')}
                    </Link>
                  </Button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
