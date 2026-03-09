'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { api } from '@/lib/api';
import {
  Users, BarChart3, CreditCard, TrendingUp,
  AlertCircle, Activity,
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from 'recharts';

interface DashStats {
  totalUsers: number;
  activeSubscriptions: number;
  totalAudits: number;
  todayAudits: number;
  failedAudits: number;
  totalRevenue: number;
}

export default function AdminOverviewPage() {
  const t = useTranslations('admin');
  const [stats, setStats]         = useState<DashStats | null>(null);
  const [chartData, setChartData] = useState<any[]>([]);

  useEffect(() => {
    Promise.all([
      api.get<DashStats>('/admin/stats'),
      api.get<any[]>('/admin/charts?days=14'),
    ]).then(([s, c]) => {
      setStats(s);
      setChartData(c);
    }).catch(() => {});
  }, []);

  const statCards = stats ? [
    { label: t('totalUsers'),          value: stats.totalUsers,          icon: Users,      color: 'blue'   },
    { label: t('activeSubscriptions'), value: stats.activeSubscriptions, icon: CreditCard, color: 'green'  },
    { label: t('totalAudits'),         value: stats.totalAudits,         icon: BarChart3,  color: 'purple' },
    { label: 'Today\'s Audits',        value: stats.todayAudits,         icon: TrendingUp, color: 'amber'  },
    { label: 'Failed Audits',          value: stats.failedAudits,        icon: AlertCircle,color: 'red'    },
    { label: t('revenue'),             value: `$${Number(stats.totalRevenue).toFixed(2)}`, icon: CreditCard, color: 'emerald' },
  ] : [];

  const colorMap: Record<string, string> = {
    blue:    'bg-blue-50 dark:bg-blue-950 text-blue-600',
    green:   'bg-green-50 dark:bg-green-950 text-green-600',
    purple:  'bg-purple-50 dark:bg-purple-950 text-purple-600',
    amber:   'bg-amber-50 dark:bg-amber-950 text-amber-600',
    red:     'bg-red-50 dark:bg-red-950 text-red-600',
    emerald: 'bg-emerald-50 dark:bg-emerald-950 text-emerald-600',
  };

  return (
    <div className="max-w-6xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{t('title')}</h1>
        <p className="text-muted-foreground text-sm mt-1">Platform-wide overview</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {statCards.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white dark:bg-gray-900 rounded-2xl border p-5">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${colorMap[color]}`}>
              <Icon className="h-5 w-5" />
            </div>
            <div className="text-2xl font-bold">{value}</div>
            <div className="text-xs text-muted-foreground mt-1">{label}</div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-900 rounded-2xl border p-6">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="h-4 w-4 text-brand-600" />
            <h3 className="font-semibold text-sm">Audits (last 14 days)</h3>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip />
              <Area type="monotone" dataKey="audits" stroke="#2563eb" fill="#dbeafe" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-2xl border p-6">
          <div className="flex items-center gap-2 mb-4">
            <Users className="h-4 w-4 text-brand-600" />
            <h3 className="font-semibold text-sm">New users (last 14 days)</h3>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip />
              <Area type="monotone" dataKey="users" stroke="#16a34a" fill="#dcfce7" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
