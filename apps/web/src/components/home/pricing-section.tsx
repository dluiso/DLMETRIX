'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { cn } from '@/lib/utils';

const plans = [
  {
    key: 'free',
    price: { monthly: 0, yearly: 0 },
    highlight: false,
    features: ['10 audits/day', '7-day history', 'Basic reports'],
  },
  {
    key: 'pro',
    price: { monthly: 29, yearly: 290 },
    highlight: true,
    features: ['50 audits/day', '90-day history', 'PDF & CSV export', 'Domain comparisons', 'Priority support'],
  },
  {
    key: 'premium',
    price: { monthly: 79, yearly: 790 },
    highlight: false,
    features: ['Unlimited audits', 'Unlimited history', 'Full export suite', 'API access', 'White-label reports', 'Dedicated support'],
  },
];

export function PricingSection() {
  const t = useTranslations('plans');
  const [yearly, setYearly] = useState(false);

  return (
    <section className="py-20 bg-gray-50 dark:bg-gray-900" id="pricing">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">{t('title')}</h2>
          <p className="text-muted-foreground mb-8">{t('subtitle')}</p>

          {/* Billing toggle */}
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <div
              key={plan.key}
              className={cn(
                'rounded-2xl p-6 border bg-white dark:bg-gray-800',
                plan.highlight
                  ? 'border-brand-500 shadow-lg shadow-brand-100 dark:shadow-brand-900/20 scale-105'
                  : 'border-gray-100 dark:border-gray-700',
              )}
            >
              {plan.highlight && (
                <div className="text-xs font-bold text-brand-600 uppercase tracking-wider mb-3">
                  Most Popular
                </div>
              )}
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 capitalize">
                {plan.key}
              </h3>
              <div className="mb-6">
                <span className="text-4xl font-bold">
                  ${yearly ? plan.price.yearly : plan.price.monthly}
                </span>
                <span className="text-muted-foreground text-sm ml-1">
                  {yearly ? t('perYear') : t('perMonth')}
                </span>
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>

              <Button
                className={cn('w-full', plan.highlight ? 'bg-brand-600 hover:bg-brand-700' : '')}
                variant={plan.highlight ? 'default' : 'outline'}
                asChild
              >
                <Link href={plan.key === 'free' ? '/register' : `/pricing/${plan.key}`}>
                  {plan.key === 'free' ? 'Get Started Free' : t('upgrade')}
                </Link>
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
