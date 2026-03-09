'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Save, Plus, Loader2, Package, Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';

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
  isActive: boolean;
  sortOrder: number;
  features: string[];
}

type EditState = Partial<Plan>;

export default function AdminPlansPage() {
  const [plans, setPlans]     = useState<Plan[]>([]);
  const [edits, setEdits]     = useState<Record<string, EditState>>({});
  const [saving, setSaving]   = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    api.get<Plan[]>('/plans').then(data => {
      setPlans(data);
      // Init edit state
      const init: Record<string, EditState> = {};
      data.forEach(p => { init[p.id] = { ...p }; });
      setEdits(init);
    }).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const field = (planId: string, key: keyof Plan) => ({
    value: String(edits[planId]?.[key] ?? ''),
    onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
      setEdits(prev => ({
        ...prev,
        [planId]: { ...prev[planId], [key]: e.target.type === 'number' ? Number(e.target.value) : e.target.value },
      })),
  });

  const toggle = (planId: string, key: keyof Plan) =>
    setEdits(prev => ({
      ...prev,
      [planId]: { ...prev[planId], [key]: !prev[planId]?.[key] },
    }));

  const save = async (planId: string) => {
    setSaving(planId);
    try {
      await api.patch(`/admin/plans/${planId}`, edits[planId]);
      load();
    } finally { setSaving(null); }
  };

  if (loading) return (
    <div className="flex items-center gap-2 text-muted-foreground">
      <Loader2 className="h-4 w-4 animate-spin" /> Loading plans...
    </div>
  );

  const TIER_COLORS: Record<string, string> = {
    FREE:    'border-gray-200',
    PRO:     'border-brand-400',
    PREMIUM: 'border-amber-400',
  };

  return (
    <div className="max-w-6xl space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Package className="h-6 w-6 text-brand-600" />
          <div>
            <h1 className="text-2xl font-bold">Subscription Plans</h1>
            <p className="text-sm text-muted-foreground">Manage pricing and feature access</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {plans.map(plan => {
          const e = edits[plan.id] || plan;
          const isSaving = saving === plan.id;
          const isDirty = JSON.stringify(e) !== JSON.stringify(plan);

          return (
            <div key={plan.id} className={cn('bg-white dark:bg-gray-900 rounded-2xl border-2 p-6', TIER_COLORS[plan.tier] || 'border-gray-200')}>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <span className={cn(
                    'text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-full',
                    plan.tier === 'FREE'    && 'bg-gray-100 text-gray-600',
                    plan.tier === 'PRO'     && 'bg-blue-100 text-blue-700',
                    plan.tier === 'PREMIUM' && 'bg-amber-100 text-amber-700',
                  )}>{plan.tier}</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-xs text-muted-foreground">Active</span>
                  <button
                    onClick={() => toggle(plan.id, 'isActive')}
                    className={cn(
                      'relative inline-flex h-5 w-9 items-center rounded-full transition-colors',
                      e.isActive ? 'bg-brand-600' : 'bg-gray-200 dark:bg-gray-700',
                    )}
                  >
                    <span className={cn('inline-block h-3 w-3 rounded-full bg-white transition-transform', e.isActive ? 'translate-x-5' : 'translate-x-1')} />
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                {/* Name */}
                <Field label="Name">
                  <input {...field(plan.id, 'name')}
                    className="w-full px-2.5 py-1.5 rounded-lg border bg-gray-50 dark:bg-gray-800 text-sm focus:outline-none focus:ring-1 focus:ring-brand-500"
                  />
                </Field>

                {/* Prices */}
                <div className="grid grid-cols-2 gap-2">
                  <Field label="Monthly ($)">
                    <input type="number" {...field(plan.id, 'priceMonthly')}
                      className="w-full px-2.5 py-1.5 rounded-lg border bg-gray-50 dark:bg-gray-800 text-sm focus:outline-none focus:ring-1 focus:ring-brand-500"
                    />
                  </Field>
                  <Field label="Yearly ($)">
                    <input type="number" {...field(plan.id, 'priceYearly')}
                      className="w-full px-2.5 py-1.5 rounded-lg border bg-gray-50 dark:bg-gray-800 text-sm focus:outline-none focus:ring-1 focus:ring-brand-500"
                    />
                  </Field>
                </div>

                {/* Limits */}
                <div className="grid grid-cols-2 gap-2">
                  <Field label="Audits/day (-1=∞)">
                    <input type="number" {...field(plan.id, 'auditsPerDay')}
                      className="w-full px-2.5 py-1.5 rounded-lg border bg-gray-50 dark:bg-gray-800 text-sm focus:outline-none focus:ring-1 focus:ring-brand-500"
                    />
                  </Field>
                  <Field label="History days (-1=∞)">
                    <input type="number" {...field(plan.id, 'historyDays')}
                      className="w-full px-2.5 py-1.5 rounded-lg border bg-gray-50 dark:bg-gray-800 text-sm focus:outline-none focus:ring-1 focus:ring-brand-500"
                    />
                  </Field>
                </div>

                {/* Feature toggles */}
                <div className="pt-2 space-y-2">
                  {(
                    [
                      ['hasExport',      'PDF/CSV Export'     ],
                      ['hasComparisons', 'Domain Comparisons' ],
                      ['hasApi',         'API Access'         ],
                      ['hasWhiteLabel',  'White Label'        ],
                    ] as [keyof Plan, string][]
                  ).map(([key, label]) => (
                    <div key={key} className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">{label}</span>
                      <button
                        onClick={() => toggle(plan.id, key)}
                        className={cn(
                          'w-6 h-6 rounded flex items-center justify-center border text-xs transition-colors',
                          e[key] ? 'bg-green-500 border-green-500 text-white' : 'border-gray-200 dark:border-gray-700 text-muted-foreground',
                        )}
                      >
                        {e[key] ? <Check className="h-3.5 w-3.5" /> : <X className="h-3.5 w-3.5" />}
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Save button */}
              <Button
                className="w-full mt-5"
                size="sm"
                onClick={() => save(plan.id)}
                disabled={isSaving || !isDirty}
                variant={isDirty ? 'default' : 'outline'}
              >
                {isSaving
                  ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-2" />
                  : <Save className="h-3.5 w-3.5 mr-2" />
                }
                {isDirty ? 'Save Changes' : 'No changes'}
              </Button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs text-muted-foreground mb-1">{label}</label>
      {children}
    </div>
  );
}
