'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/auth.store';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';
import { Check, Loader2, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Plan {
  id: string;
  name: string;
  tier: string;
  description: string;
  priceMonthly: number;
  priceYearly: number;
  currency: string;
  auditsPerDay: number;
  historyDays: number;
  hasExport: boolean;
  hasComparisons: boolean;
  hasApi: boolean;
  hasWhiteLabel: boolean;
  features: string[];
}

const TIER_STYLES: Record<string, { border: string; badge?: string; highlight: boolean }> = {
  FREE:    { border: 'border-gray-200 dark:border-gray-800',   highlight: false },
  PRO:     { border: 'border-brand-400 dark:border-brand-600', highlight: true,  badge: 'Most Popular' },
  PREMIUM: { border: 'border-amber-400 dark:border-amber-600', highlight: false, badge: 'Best Value' },
};

export default function PricingPage() {
  const t = useTranslations('plans');
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();

  const [plans, setPlans]         = useState<Plan[]>([]);
  const [yearly, setYearly]       = useState(false);
  const [loading, setLoading]     = useState(true);
  const [subscribing, setSubscribing] = useState<string | null>(null);

  useEffect(() => {
    api.get<Plan[]>('/plans').then(setPlans).finally(() => setLoading(false));
  }, []);

  const handleSubscribe = async (plan: Plan) => {
    if (!isAuthenticated) { router.push('/register'); return; }
    if (plan.tier === 'FREE') { router.push('/dashboard'); return; }

    setSubscribing(plan.id);
    try {
      const data = await api.post<{ approvalUrl: string }>('/payments/subscribe', {
        planId: plan.id,
        billingCycle: yearly ? 'yearly' : 'monthly',
        gateway: 'paypal',
      });
      // Redirect to PayPal approval page
      window.location.href = data.approvalUrl;
    } catch (err: any) {
      alert(err.message || 'Payment initiation failed');
    } finally { setSubscribing(null); }
  };

  const getPrice = (plan: Plan) =>
    yearly ? plan.priceYearly : plan.priceMonthly;

  const getUserCurrentPlan = () =>
    user?.subscription?.plan?.name?.toUpperCase();

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-brand-600" />
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 py-20 px-4">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-brand-50 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300 border border-brand-200 dark:border-brand-800 rounded-full px-4 py-1.5 text-sm font-medium mb-6">
              <Zap className="h-3.5 w-3.5" />
              Simple, transparent pricing
            </div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">{t('title')}</h1>
            <p className="text-muted-foreground text-lg">{t('subtitle')}</p>

            {/* Billing toggle */}
            <div className="mt-8 inline-flex items-center gap-3 bg-white dark:bg-gray-800 rounded-full p-1 border shadow-sm">
              <button
                onClick={() => setYearly(false)}
                className={cn('px-5 py-2 rounded-full text-sm font-medium transition-all', !yearly ? 'bg-brand-600 text-white shadow' : 'text-muted-foreground')}
              >
                {t('monthly')}
              </button>
              <button
                onClick={() => setYearly(true)}
                className={cn('px-5 py-2 rounded-full text-sm font-medium transition-all', yearly ? 'bg-brand-600 text-white shadow' : 'text-muted-foreground')}
              >
                {t('yearly')}
                <span className="ml-2 text-xs text-green-500 font-semibold">{t('save', { percent: 17 })}</span>
              </button>
            </div>
          </div>

          {/* Plan cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map((plan) => {
              const style   = TIER_STYLES[plan.tier] || TIER_STYLES.FREE;
              const price   = getPrice(plan);
              const current = getUserCurrentPlan() === plan.tier;
              const isBusy  = subscribing === plan.id;

              return (
                <div
                  key={plan.id}
                  className={cn(
                    'rounded-2xl border-2 p-7 bg-white dark:bg-gray-900 flex flex-col relative',
                    style.border,
                    style.highlight && 'shadow-xl shadow-brand-100 dark:shadow-brand-900/30 scale-[1.02]',
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

                  <div className="mb-6">
                    <h3 className="text-xl font-bold mb-1">{plan.name}</h3>
                    <p className="text-sm text-muted-foreground">{plan.description}</p>
                  </div>

                  <div className="mb-6">
                    {price === 0 ? (
                      <div className="text-4xl font-bold">Free</div>
                    ) : (
                      <div>
                        <span className="text-4xl font-bold">${price}</span>
                        <span className="text-muted-foreground text-sm ml-1">
                          {yearly ? t('perYear') : t('perMonth')}
                        </span>
                        {yearly && (
                          <p className="text-xs text-green-600 mt-1">
                            ${(price / 12).toFixed(2)}/month billed annually
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Features */}
                  <ul className="space-y-2.5 mb-8 flex-1">
                    {/* Core limits */}
                    <li className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                      {plan.auditsPerDay === -1 ? 'Unlimited audits/day' : `${plan.auditsPerDay} audits/day`}
                    </li>
                    <li className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                      {plan.historyDays === -1 ? 'Unlimited history' : plan.historyDays === 0 ? 'No history' : `${plan.historyDays}-day history`}
                    </li>
                    {plan.hasExport && (
                      <li className="flex items-center gap-2 text-sm">
                        <Check className="h-4 w-4 text-green-500 flex-shrink-0" />PDF & CSV export
                      </li>
                    )}
                    {plan.hasComparisons && (
                      <li className="flex items-center gap-2 text-sm">
                        <Check className="h-4 w-4 text-green-500 flex-shrink-0" />Domain comparisons
                      </li>
                    )}
                    {plan.hasApi && (
                      <li className="flex items-center gap-2 text-sm">
                        <Check className="h-4 w-4 text-green-500 flex-shrink-0" />API access
                      </li>
                    )}
                    {plan.hasWhiteLabel && (
                      <li className="flex items-center gap-2 text-sm">
                        <Check className="h-4 w-4 text-green-500 flex-shrink-0" />White-label reports
                      </li>
                    )}
                    {/* Additional features from DB */}
                    {plan.features?.filter(f =>
                      !['audits', 'history', 'export', 'comparisons', 'api', 'white'].some(k => f.toLowerCase().includes(k))
                    ).map(f => (
                      <li key={f} className="flex items-center gap-2 text-sm">
                        <Check className="h-4 w-4 text-green-500 flex-shrink-0" />{f}
                      </li>
                    ))}
                  </ul>

                  {/* CTA */}
                  {current ? (
                    <div className="text-center py-2.5 rounded-xl border-2 border-brand-200 text-brand-700 text-sm font-semibold bg-brand-50">
                      {t('current')}
                    </div>
                  ) : (
                    <Button
                      onClick={() => handleSubscribe(plan)}
                      disabled={isBusy}
                      className={cn(
                        'w-full py-2.5',
                        plan.tier === 'FREE' && 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300',
                        plan.tier === 'PRO' && 'bg-brand-600 hover:bg-brand-700',
                        plan.tier === 'PREMIUM' && 'bg-amber-500 hover:bg-amber-600',
                      )}
                    >
                      {isBusy ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : plan.tier === 'FREE' ? (
                        isAuthenticated ? 'Go to Dashboard' : 'Get Started Free'
                      ) : (
                        `Upgrade to ${plan.name}`
                      )}
                    </Button>
                  )}
                </div>
              );
            })}
          </div>

          {/* FAQ / guarantee */}
          <div className="mt-16 text-center text-sm text-muted-foreground space-y-2">
            <p>All plans include a 7-day money-back guarantee.</p>
            <p>Questions? <a href="mailto:support@dlmetrix.com" className="text-brand-600 hover:underline">Contact support</a></p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
