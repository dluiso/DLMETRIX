'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { KeyRound, CheckCircle, Loader2, AlertTriangle, Eye, EyeOff } from 'lucide-react';

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';

  const [password, setPassword]     = useState('');
  const [confirm, setConfirm]       = useState('');
  const [showPw, setShowPw]         = useState(false);
  const [loading, setLoading]       = useState(false);
  const [success, setSuccess]       = useState(false);
  const [error, setError]           = useState('');

  useEffect(() => {
    if (!token) setError('Invalid or missing reset token. Please request a new link.');
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      await api.post('/auth/reset-password', { token, newPassword: password });
      setSuccess(true);
      setTimeout(() => router.push('/login'), 3000);
    } catch (err: any) {
      setError(err.data?.message || 'Reset link has expired or already been used. Please request a new one.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="text-2xl font-black text-brand-600">DLMETRIX</Link>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-2xl border p-8">
          {success ? (
            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-green-50 dark:bg-green-950 flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
              <h2 className="text-xl font-bold mb-2">Password reset!</h2>
              <p className="text-muted-foreground text-sm">
                Your password has been updated. Redirecting to login...
              </p>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <div className="w-12 h-12 rounded-xl bg-brand-50 dark:bg-brand-950 flex items-center justify-center mb-4">
                  <KeyRound className="h-6 w-6 text-brand-600" />
                </div>
                <h2 className="text-xl font-bold mb-1">Set new password</h2>
                <p className="text-sm text-muted-foreground">
                  Choose a strong password with at least 8 characters.
                </p>
              </div>

              {!token ? (
                <div className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-950 rounded-lg text-red-600 text-sm">
                  <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                  <div>
                    {error}
                    <Link href="/forgot-password" className="block mt-2 font-medium underline">
                      Request new link →
                    </Link>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1.5">New password</label>
                    <div className="relative">
                      <input
                        type={showPw ? 'text' : 'password'}
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        placeholder="Minimum 8 characters"
                        required
                        className="w-full pr-10 pl-4 py-2.5 rounded-lg border bg-gray-50 dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPw(v => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1.5">Confirm password</label>
                    <input
                      type={showPw ? 'text' : 'password'}
                      value={confirm}
                      onChange={e => setConfirm(e.target.value)}
                      placeholder="Repeat your new password"
                      required
                      className="w-full px-4 py-2.5 rounded-lg border bg-gray-50 dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                  </div>

                  {/* Password strength hints */}
                  {password && (
                    <ul className="text-xs space-y-1">
                      {[
                        { ok: password.length >= 8,                label: 'At least 8 characters' },
                        { ok: /[A-Z]/.test(password),              label: 'One uppercase letter'  },
                        { ok: /[0-9]/.test(password),              label: 'One number'            },
                      ].map(({ ok, label }) => (
                        <li key={label} className={ok ? 'text-green-600' : 'text-muted-foreground'}>
                          {ok ? '✓' : '○'} {label}
                        </li>
                      ))}
                    </ul>
                  )}

                  {error && (
                    <div className="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-950 rounded-lg text-red-600 text-sm">
                      <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                      <span>{error}</span>
                    </div>
                  )}

                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    Reset password
                  </Button>
                </form>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordForm />
    </Suspense>
  );
}
