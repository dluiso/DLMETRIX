'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/auth.store';
import { Navbar } from '@/components/layout/navbar';
import { DashboardSidebar } from '@/components/dashboard/sidebar';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';
import { CreditCard, Package, Receipt, ArrowUpRight, Loader2, AlertTriangle } from 'lucide-react';
import Link from 'next/link';

export default function BillingPage() {
  const { user, fetchMe } = useAuthStore();
  const [subscription, setSubscription] = useState<any>(null);
  const [payments, setPayments]         = useState<any[]>([]);
  const [loading, setLoading]           = useState(true);
  const [cancelling, setCancelling]     = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [cancelMsg, setCancelMsg]       = useState('');

  useEffect(() => {
    Promise.all([
      api.get('/plans/my-subscription'),
      api.get('/payments/history'),
    ]).then(([sub, pays]) => {
      setSubscription(sub);
      setPayments(pays as any[]);
    }).finally(() => setLoading(false));
  }, []);

  const handleCancel = async () => {
    setCancelling(true);
    try {
      await api.post('/payments/cancel', {});
      await fetchMe();
      setSubscription((s: any) => s ? { ...s, status: 'CANCELLED', cancelAtPeriodEnd: true } : s);
      setCancelMsg('Your subscription has been cancelled. Access continues until end of billing period.');
    } catch (err: any) {
      setCancelMsg(err.data?.message || 'Failed to cancel subscription.');
    } finally {
      setCancelling(false);
      setShowCancelConfirm(false);
    }
  };

  const STATUS_COLOR: Record<string, string> = {
    ACTIVE:    'text-green-600 bg-green-50 dark:bg-green-950',
    CANCELLED: 'text-red-600 bg-red-50',
    EXPIRED:   'text-gray-500 bg-gray-50',
    TRIALING:  'text-blue-600 bg-blue-50',
    PAST_DUE:  'text-amber-600 bg-amber-50',
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Navbar />
      <div className="flex">
        <DashboardSidebar />
        <main className="flex-1 p-6 max-w-3xl">
          <h1 className="text-2xl font-bold mb-6">Billing & Subscription</h1>

          {loading ? (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" /> Loading...
            </div>
          ) : (
            <>
              {/* Current plan */}
              <div className="bg-white dark:bg-gray-900 rounded-2xl border p-6 mb-6">
                <div className="flex items-center gap-3 mb-5">
                  <Package className="h-5 w-5 text-brand-600" />
                  <h2 className="font-semibold">Current Plan</h2>
                </div>

                {subscription ? (
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xl font-bold">{subscription.plan?.name}</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {subscription.billingCycle === 'MONTHLY' ? 'Monthly' : 'Yearly'} billing
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Renews: {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${STATUS_COLOR[subscription.status] || ''}`}>
                        {subscription.status}
                      </span>
                      <p className="text-2xl font-bold mt-2">
                        ${subscription.billingCycle === 'MONTHLY'
                          ? subscription.plan?.priceMonthly
                          : subscription.plan?.priceYearly}
                        <span className="text-sm font-normal text-muted-foreground">
                          /{subscription.billingCycle === 'MONTHLY' ? 'mo' : 'yr'}
                        </span>
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-lg font-bold capitalize">{user?.role?.toLowerCase()} Plan</p>
                      <p className="text-sm text-muted-foreground">No active subscription</p>
                    </div>
                    <Button asChild>
                      <Link href="/pricing">
                        <ArrowUpRight className="h-4 w-4 mr-2" /> Upgrade
                      </Link>
                    </Button>
                  </div>
                )}

                {cancelMsg && (
                  <p className={`mt-3 text-sm ${cancelMsg.includes('cancelled') ? 'text-green-600' : 'text-red-500'}`}>
                    {cancelMsg}
                  </p>
                )}

                {subscription && subscription.status !== 'CANCELLED' && (
                  <div className="mt-4 pt-4 border-t flex gap-3">
                    <Button variant="outline" size="sm" asChild>
                      <Link href="/pricing">Change Plan</Link>
                    </Button>
                    {!showCancelConfirm ? (
                      <Button
                        variant="ghost" size="sm"
                        className="text-red-500 hover:text-red-600"
                        onClick={() => setShowCancelConfirm(true)}
                      >
                        Cancel Subscription
                      </Button>
                    ) : (
                      <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-950 rounded-lg text-sm">
                        <AlertTriangle className="h-4 w-4 text-red-500 flex-shrink-0" />
                        <span className="text-red-600 text-xs">Are you sure? This cannot be undone.</span>
                        <Button
                          size="sm" variant="destructive"
                          className="ml-1 h-7 text-xs"
                          onClick={handleCancel}
                          disabled={cancelling}
                        >
                          {cancelling ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Yes, cancel'}
                        </Button>
                        <Button
                          size="sm" variant="ghost"
                          className="h-7 text-xs"
                          onClick={() => setShowCancelConfirm(false)}
                        >
                          No
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Payment history */}
              <div className="bg-white dark:bg-gray-900 rounded-2xl border overflow-hidden">
                <div className="flex items-center gap-3 px-6 py-4 border-b">
                  <Receipt className="h-5 w-5 text-brand-600" />
                  <h2 className="font-semibold">Payment History</h2>
                </div>

                {payments.length === 0 ? (
                  <div className="p-8 text-center text-muted-foreground text-sm">
                    No payments yet
                  </div>
                ) : (
                  <div className="divide-y">
                    {payments.map(payment => (
                      <div key={payment.id} className="flex items-center justify-between px-6 py-4">
                        <div>
                          <p className="font-medium text-sm">{payment.description || 'Subscription payment'}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(payment.createdAt).toLocaleDateString()} · via {payment.gateway}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold">${Number(payment.amount).toFixed(2)} {payment.currency}</p>
                          <span className={`text-xs font-medium ${payment.status === 'COMPLETED' ? 'text-green-600' : 'text-red-500'}`}>
                            {payment.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
