'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import {
  CheckCircle,
  Database,
  Server,
  UserCog,
  Rocket,
  Loader2,
  XCircle,
  Eye,
  EyeOff,
  ArrowRight,
  ArrowLeft,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ─── Types ─────────────────────────────────────────────────────────────────

type StepStatus = 'idle' | 'loading' | 'ok' | 'error';

const STEPS = [
  { id: 1, label: 'Database',   icon: Database  },
  { id: 2, label: 'Cache',      icon: Server    },
  { id: 3, label: 'Admin User', icon: UserCog   },
  { id: 4, label: 'Complete',   icon: Rocket    },
];

// ─── Main Component ─────────────────────────────────────────────────────────

export default function SetupPage() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [step, setStep] = useState(1);

  // Step states
  const [dbStatus, setDbStatus]   = useState<StepStatus>('idle');
  const [dbMsg, setDbMsg]         = useState('');
  const [redisStatus, setRedisStatus] = useState<StepStatus>('idle');
  const [redisMsg, setRedisMsg]       = useState('');
  const [redisHost, setRedisHost]     = useState('localhost');
  const [redisPort, setRedisPort]     = useState('6379');
  const [redisPass, setRedisPass]     = useState('');

  // Admin form
  const [adminName, setAdminName]   = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPass, setAdminPass]   = useState('');
  const [showPass, setShowPass]     = useState(false);
  const [adminMsg, setAdminMsg]     = useState('');
  const [adminOk, setAdminOk]       = useState(false);
  const [adminLoading, setAdminLoading] = useState(false);

  // On mount: redirect if already complete
  useEffect(() => {
    api.get<{ complete: boolean }>('/setup/status')
      .then((res) => {
        if (res.complete) router.replace('/');
        else setChecking(false);
      })
      .catch(() => setChecking(false));
  }, [router]);

  // ── Step 1: Database ──────────────────────────────────────────────────────

  const testDb = async () => {
    setDbStatus('loading');
    setDbMsg('');
    try {
      const res = await api.post<{ ok: boolean; message: string }>('/setup/check-db', {});
      setDbStatus(res.ok ? 'ok' : 'error');
      setDbMsg(res.message);
    } catch (err: any) {
      setDbStatus('error');
      setDbMsg(err.data?.message || 'Connection failed');
    }
  };

  // ── Step 2: Redis ─────────────────────────────────────────────────────────

  const testRedis = async () => {
    setRedisStatus('loading');
    setRedisMsg('');
    try {
      const res = await api.post<{ ok: boolean; message: string }>('/setup/check-redis', {
        host: redisHost,
        port: parseInt(redisPort) || 6379,
        password: redisPass || undefined,
      });
      setRedisStatus(res.ok ? 'ok' : 'error');
      setRedisMsg(res.message);
    } catch (err: any) {
      setRedisStatus('error');
      setRedisMsg(err.data?.message || 'Connection failed');
    }
  };

  // ── Step 3: Admin user ────────────────────────────────────────────────────

  const createAdmin = async () => {
    if (!adminName || !adminEmail || !adminPass) {
      setAdminMsg('All fields are required');
      return;
    }
    if (adminPass.length < 8) {
      setAdminMsg('Password must be at least 8 characters');
      return;
    }
    setAdminLoading(true);
    setAdminMsg('');
    try {
      const res = await api.post<{ ok: boolean; message: string }>('/setup/complete', {
        adminName,
        adminEmail,
        adminPassword: adminPass,
      });
      if (res.ok) {
        setAdminOk(true);
        setStep(4);
      } else {
        setAdminMsg(res.message || 'Setup failed');
      }
    } catch (err: any) {
      setAdminMsg(err.data?.message || 'Setup failed');
    } finally {
      setAdminLoading(false);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <Loader2 className="h-8 w-8 animate-spin text-brand-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col items-center justify-center px-4 py-12">
      {/* Logo */}
      <Link href="/" className="text-3xl font-black text-brand-600 mb-10">DLMETRIX</Link>

      <div className="w-full max-w-lg">
        {/* Step indicators */}
        <div className="flex items-center justify-between mb-8">
          {STEPS.map((s, idx) => {
            const Icon = s.icon;
            const done = step > s.id;
            const active = step === s.id;
            return (
              <div key={s.id} className="flex items-center flex-1">
                <div className="flex flex-col items-center gap-1">
                  <div className={cn(
                    'w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all',
                    done   ? 'bg-brand-600 border-brand-600 text-white' :
                    active ? 'border-brand-600 text-brand-600 bg-white dark:bg-gray-900' :
                             'border-gray-300 text-gray-400 bg-white dark:bg-gray-900',
                  )}>
                    {done ? <CheckCircle className="h-5 w-5" /> : <Icon className="h-4 w-4" />}
                  </div>
                  <span className={cn(
                    'text-xs font-medium',
                    active ? 'text-brand-600' : done ? 'text-brand-600' : 'text-gray-400',
                  )}>{s.label}</span>
                </div>
                {idx < STEPS.length - 1 && (
                  <div className={cn(
                    'flex-1 h-0.5 mx-2 mt-[-14px]',
                    done ? 'bg-brand-600' : 'bg-gray-200 dark:bg-gray-700',
                  )} />
                )}
              </div>
            );
          })}
        </div>

        {/* Card */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border p-8 shadow-sm">

          {/* ── STEP 1: Database ── */}
          {step === 1 && (
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950 flex items-center justify-center">
                  <Database className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h2 className="font-bold text-lg">Database Connection</h2>
                  <p className="text-sm text-muted-foreground">Verify PostgreSQL is accessible</p>
                </div>
              </div>

              <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 mb-6 text-sm font-mono text-muted-foreground break-all">
                {process.env.NEXT_PUBLIC_DB_HINT || 'Using DATABASE_URL from .env'}
              </div>

              <StatusBadge status={dbStatus} message={dbMsg} />

              <div className="flex gap-3 mt-6">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={testDb}
                  disabled={dbStatus === 'loading'}
                >
                  {dbStatus === 'loading'
                    ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />Testing…</>
                    : 'Test Connection'}
                </Button>
                <Button
                  className="flex-1"
                  onClick={() => setStep(2)}
                  disabled={dbStatus !== 'ok'}
                >
                  Next <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </div>
          )}

          {/* ── STEP 2: Redis ── */}
          {step === 2 && (
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-950 flex items-center justify-center">
                  <Server className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <h2 className="font-bold text-lg">Redis / Cache</h2>
                  <p className="text-sm text-muted-foreground">Required for audit queues and rate limiting</p>
                </div>
              </div>

              <div className="space-y-4 mb-6">
                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-2">
                    <label className="block text-xs font-medium mb-1 text-muted-foreground">Host</label>
                    <input
                      className="w-full border rounded-lg px-3 py-2 text-sm bg-transparent focus:outline-none focus:ring-2 focus:ring-brand-600"
                      value={redisHost}
                      onChange={(e) => setRedisHost(e.target.value)}
                      placeholder="localhost"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1 text-muted-foreground">Port</label>
                    <input
                      className="w-full border rounded-lg px-3 py-2 text-sm bg-transparent focus:outline-none focus:ring-2 focus:ring-brand-600"
                      value={redisPort}
                      onChange={(e) => setRedisPort(e.target.value)}
                      placeholder="6379"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1 text-muted-foreground">Password (optional)</label>
                  <input
                    type="password"
                    className="w-full border rounded-lg px-3 py-2 text-sm bg-transparent focus:outline-none focus:ring-2 focus:ring-brand-600"
                    value={redisPass}
                    onChange={(e) => setRedisPass(e.target.value)}
                    placeholder="Leave empty if no auth"
                  />
                </div>
              </div>

              <StatusBadge status={redisStatus} message={redisMsg} />

              <div className="flex gap-3 mt-6">
                <Button variant="outline" onClick={() => setStep(1)}>
                  <ArrowLeft className="h-4 w-4 mr-2" /> Back
                </Button>
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={testRedis}
                  disabled={redisStatus === 'loading'}
                >
                  {redisStatus === 'loading'
                    ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />Testing…</>
                    : 'Test Connection'}
                </Button>
                <Button
                  onClick={() => setStep(3)}
                  disabled={redisStatus !== 'ok'}
                >
                  Next <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </div>
          )}

          {/* ── STEP 3: Admin User ── */}
          {step === 3 && (
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950 flex items-center justify-center">
                  <UserCog className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <h2 className="font-bold text-lg">Admin Account</h2>
                  <p className="text-sm text-muted-foreground">Create the first administrator</p>
                </div>
              </div>

              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-xs font-medium mb-1 text-muted-foreground">Full Name</label>
                  <input
                    className="w-full border rounded-lg px-3 py-2 text-sm bg-transparent focus:outline-none focus:ring-2 focus:ring-brand-600"
                    value={adminName}
                    onChange={(e) => setAdminName(e.target.value)}
                    placeholder="Admin Name"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1 text-muted-foreground">Email</label>
                  <input
                    type="email"
                    className="w-full border rounded-lg px-3 py-2 text-sm bg-transparent focus:outline-none focus:ring-2 focus:ring-brand-600"
                    value={adminEmail}
                    onChange={(e) => setAdminEmail(e.target.value)}
                    placeholder="admin@yourdomain.com"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1 text-muted-foreground">Password</label>
                  <div className="relative">
                    <input
                      type={showPass ? 'text' : 'password'}
                      className="w-full border rounded-lg px-3 py-2 pr-10 text-sm bg-transparent focus:outline-none focus:ring-2 focus:ring-brand-600"
                      value={adminPass}
                      onChange={(e) => setAdminPass(e.target.value)}
                      placeholder="Min 8 characters"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass((p) => !p)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  <PasswordStrength password={adminPass} />
                </div>
              </div>

              {adminMsg && (
                <div className="flex items-center gap-2 text-red-600 text-sm mb-4">
                  <XCircle className="h-4 w-4 flex-shrink-0" />
                  {adminMsg}
                </div>
              )}

              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep(2)}>
                  <ArrowLeft className="h-4 w-4 mr-2" /> Back
                </Button>
                <Button
                  className="flex-1"
                  onClick={createAdmin}
                  disabled={adminLoading}
                >
                  {adminLoading
                    ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />Creating…</>
                    : 'Complete Setup'}
                </Button>
              </div>
            </div>
          )}

          {/* ── STEP 4: Done ── */}
          {step === 4 && (
            <div className="text-center">
              <div className="w-20 h-20 rounded-2xl bg-green-50 dark:bg-green-950 flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="h-10 w-10 text-green-500" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Setup Complete!</h2>
              <p className="text-muted-foreground text-sm mb-2">
                DLMETRIX is ready to use.
              </p>
              <p className="text-muted-foreground text-xs mb-8">
                This setup wizard is now permanently disabled for security.
              </p>
              <div className="space-y-3">
                <Button asChild className="w-full">
                  <Link href="/login">Go to Login</Link>
                </Button>
                <p className="text-xs text-muted-foreground">
                  Sign in with the admin account you just created.
                </p>
              </div>
            </div>
          )}
        </div>

        <p className="text-center text-xs text-muted-foreground mt-6">
          DLMETRIX · Installation Wizard · v1.0
        </p>
      </div>
    </div>
  );
}

// ─── Helper Components ───────────────────────────────────────────────────────

function StatusBadge({ status, message }: { status: StepStatus; message: string }) {
  if (status === 'idle') return null;
  if (status === 'loading') return null;

  return (
    <div className={cn(
      'flex items-start gap-2 rounded-xl px-4 py-3 text-sm',
      status === 'ok'
        ? 'bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-300'
        : 'bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-300',
    )}>
      {status === 'ok'
        ? <CheckCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
        : <XCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
      }
      <span>{message}</span>
    </div>
  );
}

function PasswordStrength({ password }: { password: string }) {
  if (!password) return null;
  const len = password.length;
  const hasUpper = /[A-Z]/.test(password);
  const hasNum   = /[0-9]/.test(password);
  const hasSpec  = /[^A-Za-z0-9]/.test(password);
  const score = (len >= 8 ? 1 : 0) + (len >= 12 ? 1 : 0) + (hasUpper ? 1 : 0) + (hasNum ? 1 : 0) + (hasSpec ? 1 : 0);

  const labels = ['', 'Very weak', 'Weak', 'Fair', 'Strong', 'Very strong'];
  const colors = ['', 'bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-green-500', 'bg-green-600'];

  return (
    <div className="mt-2">
      <div className="flex gap-1 mb-1">
        {[1, 2, 3, 4, 5].map((n) => (
          <div
            key={n}
            className={cn(
              'h-1 flex-1 rounded-full transition-all',
              n <= score ? colors[score] : 'bg-gray-200 dark:bg-gray-700',
            )}
          />
        ))}
      </div>
      <p className="text-xs text-muted-foreground">{labels[score]}</p>
    </div>
  );
}
