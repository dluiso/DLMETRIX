'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { BarChart3, Plus, TrendingUp, Clock, CheckCircle, Mail, X } from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';
import { Button } from '@/components/ui/button';
import { Navbar } from '@/components/layout/navbar';
import { api } from '@/lib/api';
import Link from 'next/link';
import { getScoreLabel } from '@dlmetrix/shared';
import { cn } from '@/lib/utils';

export default function DashboardPage() {
  const t = useTranslations('dashboard');
  const { user, isAuthenticated } = useAuthStore();
  const router = useRouter();

  const [stats, setStats] = useState({ total: 0, todayCount: 0, completed: 0, failed: 0, dailyLimit: 10 });
  const [audits, setAudits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [verifyBanner, setVerifyBanner] = useState(false);
  const [resendSent, setResendSent] = useState(false);

  useEffect(() => {
    if (user && user.emailVerified === false) setVerifyBanner(true);
  }, [user]);

  const handleResendVerification = async () => {
    try {
      await api.post('/auth/resend-verification', {});
      setResendSent(true);
    } catch {}
  };

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    loadDashboard();
  }, [isAuthenticated]);

  const loadDashboard = async () => {
    try {
      const [statsData, auditsData] = await Promise.all([
        api.get<any>('/users/me/stats'),
        api.get<any>('/audits/history?page=1&limit=5'),
      ]);
      setStats(statsData);
      setAudits(auditsData.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Navbar />
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Welcome */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {t('welcome')}, {user?.name?.split(' ')[0]}
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              <span className="capitalize">{user?.role?.toLowerCase()}</span> plan
              {user?.subscription?.plan?.name && ` · ${user.subscription.plan.name}`}
            </p>
          </div>
          <Button asChild>
            <Link href="/">
              <Plus className="h-4 w-4 mr-2" />
              {t('newAudit')}
            </Link>
          </Button>
        </div>

        {/* Email verification banner */}
        {verifyBanner && (
          <div className="flex items-center gap-3 bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-xl px-4 py-3 mb-6 text-sm">
            <Mail className="h-4 w-4 text-amber-600 flex-shrink-0" />
            <span className="text-amber-800 dark:text-amber-200 flex-1">
              {resendSent
                ? 'Verification email sent! Check your inbox.'
                : 'Please verify your email address to unlock all features.'}
            </span>
            {!resendSent && (
              <button
                onClick={handleResendVerification}
                className="text-xs font-medium text-amber-700 dark:text-amber-300 underline hover:no-underline"
              >
                Resend link
              </button>
            )}
            <button onClick={() => setVerifyBanner(false)} className="text-amber-500 hover:text-amber-700">
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard icon={BarChart3} label={t('totalAudits')} value={stats.total} color="blue" />
          <StatCard icon={Clock}     label={t('todayAudits')} value={stats.todayCount} color="purple" />
          <StatCard icon={CheckCircle} label="Completed" value={stats.completed} color="green" />
          <StatCard icon={TrendingUp} label="Success rate" value={
            stats.total > 0 ? `${Math.round((stats.completed / stats.total) * 100)}%` : '—'
          } color="amber" />
        </div>

        {/* Daily audit usage bar */}
        {stats.dailyLimit !== -1 && (
          <div className="bg-white dark:bg-gray-900 rounded-2xl border p-5 mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Daily audit usage</span>
              <span className="text-sm text-muted-foreground">
                {stats.todayCount} / {stats.dailyLimit}
              </span>
            </div>
            <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2.5 overflow-hidden">
              <div
                className={cn(
                  'h-2.5 rounded-full transition-all',
                  stats.todayCount / stats.dailyLimit >= 1
                    ? 'bg-red-500'
                    : stats.todayCount / stats.dailyLimit >= 0.8
                    ? 'bg-amber-500'
                    : 'bg-brand-600',
                )}
                style={{ width: `${Math.min((stats.todayCount / stats.dailyLimit) * 100, 100)}%` }}
              />
            </div>
            {stats.todayCount >= stats.dailyLimit && (
              <p className="text-xs text-red-500 mt-2">
                Daily limit reached.{' '}
                <a href="/pricing" className="underline font-medium">Upgrade your plan</a>
                {' '}for more audits.
              </p>
            )}
          </div>
        )}

        {/* Recent audits */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border">
          <div className="px-6 py-4 border-b flex items-center justify-between">
            <h2 className="font-semibold">{t('recentAudits')}</h2>
            <Link href="/dashboard/history" className="text-sm text-brand-600 hover:underline">
              View all →
            </Link>
          </div>

          {loading ? (
            <div className="p-8 text-center text-muted-foreground">Loading...</div>
          ) : audits.length === 0 ? (
            <div className="p-12 text-center">
              <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground mb-4 opacity-30" />
              <p className="text-muted-foreground">{t('noAudits')}</p>
              <Button className="mt-4" asChild>
                <Link href="/">{t('newAudit')}</Link>
              </Button>
            </div>
          ) : (
            <div className="divide-y">
              {audits.map((audit) => {
                const scoreInfo = audit.overallScore ? getScoreLabel(audit.overallScore) : null;
                return (
                  <Link
                    key={audit.id}
                    href={`/audit/${audit.id}`}
                    className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{audit.domain}</p>
                      <p className="text-xs text-muted-foreground truncate">{audit.url}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      {audit.overallScore !== null ? (
                        <div className="font-bold text-lg" style={{ color: scoreInfo?.color }}>
                          {audit.overallScore}
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground capitalize">{audit.status?.toLowerCase()}</span>
                      )}
                      <div className="text-xs text-muted-foreground">
                        {new Date(audit.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }: any) {
  const colorMap: Record<string, string> = {
    blue:   'bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400',
    purple: 'bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-400',
    green:  'bg-green-50 dark:bg-green-950 text-green-600 dark:text-green-400',
    amber:  'bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400',
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border p-5">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${colorMap[color]}`}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="text-2xl font-bold text-gray-900 dark:text-white">{value}</div>
      <div className="text-xs text-muted-foreground mt-1">{label}</div>
    </div>
  );
}
