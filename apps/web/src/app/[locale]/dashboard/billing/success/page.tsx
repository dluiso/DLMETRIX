'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { api } from '@/lib/api';
import { CheckCircle, Loader2, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

function BillingSuccessContent() {
  const params   = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');

  useEffect(() => {
    const token        = params.get('token');
    const planId       = params.get('plan');
    const billingCycle = params.get('billing') || 'monthly';

    if (!token || !planId) { setStatus('error'); return; }

    api.post('/payments/capture', { orderId: token, planId, billingCycle })
      .then(() => setStatus('success'))
      .catch(() => setStatus('error'));
  }, []);

  if (status === 'loading') return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="h-12 w-12 animate-spin text-brand-600 mx-auto mb-4" />
        <p className="text-muted-foreground">Activating your subscription...</p>
      </div>
    </div>
  );

  if (status === 'error') return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 rounded-2xl bg-red-50 dark:bg-red-950 flex items-center justify-center mx-auto mb-6">
          <AlertTriangle className="h-10 w-10 text-red-500" />
        </div>
        <h1 className="text-2xl font-bold mb-2">Something went wrong</h1>
        <p className="text-muted-foreground mb-6">
          We couldn't activate your subscription. Please contact support if you were charged.
        </p>
        <Button asChild><Link href="/pricing">Back to Pricing</Link></Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="w-24 h-24 rounded-full bg-green-50 dark:bg-green-950 flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="h-12 w-12 text-green-500" />
        </div>
        <h1 className="text-3xl font-bold mb-3">You're all set!</h1>
        <p className="text-muted-foreground mb-8">
          Your subscription is now active. Enjoy all your upgraded plan features.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button asChild size="lg">
            <Link href="/dashboard">Go to Dashboard</Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="/dashboard/billing">View Billing</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function BillingSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-brand-600" />
      </div>
    }>
      <BillingSuccessContent />
    </Suspense>
  );
}
