'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';

  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'no-token'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) { setStatus('no-token'); return; }

    api.post('/auth/verify-email', { token })
      .then((res: any) => {
        setMessage(res.message || 'Email verified successfully');
        setStatus('success');
      })
      .catch((err: any) => {
        setMessage(err.data?.message || 'Verification link has expired or is invalid.');
        setStatus('error');
      });
  }, [token]);

  if (status === 'loading') return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="h-10 w-10 text-brand-600 animate-spin mx-auto mb-3" />
        <p className="text-muted-foreground text-sm">Verifying your email...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center px-4">
      <div className="w-full max-w-md text-center">
        <div className="text-center mb-8">
          <Link href="/" className="text-2xl font-black text-brand-600">DLMETRIX</Link>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-2xl border p-8">
          {status === 'success' ? (
            <>
              <div className="w-16 h-16 rounded-2xl bg-green-50 dark:bg-green-950 flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
              <h2 className="text-xl font-bold mb-2">Email verified!</h2>
              <p className="text-muted-foreground text-sm mb-6">{message}</p>
              <Button asChild className="w-full">
                <Link href="/dashboard">Go to Dashboard</Link>
              </Button>
            </>
          ) : (
            <>
              <div className="w-16 h-16 rounded-2xl bg-red-50 dark:bg-red-950 flex items-center justify-center mx-auto mb-4">
                <XCircle className="h-8 w-8 text-red-500" />
              </div>
              <h2 className="text-xl font-bold mb-2">Verification failed</h2>
              <p className="text-muted-foreground text-sm mb-6">{message}</p>
              <div className="flex flex-col gap-2">
                <Button asChild className="w-full">
                  <Link href="/dashboard">Go to Dashboard</Link>
                </Button>
                <p className="text-xs text-muted-foreground">
                  You can request a new link from your dashboard.
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-brand-600" />
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  );
}
