'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { CreditCard, ChevronLeft, ChevronRight, Loader2, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from 'recharts';
import { cn } from '@/lib/utils';

const STATUS_COLOR: Record<string, string> = {
  COMPLETED: 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400',
  FAILED:    'bg-red-100 text-red-700',
  PENDING:   'bg-amber-100 text-amber-700',
  REFUNDED:  'bg-blue-100 text-blue-700',
  CANCELLED: 'bg-gray-100 text-gray-600',
};

// Generate mock revenue chart data
const mockRevenueData = () =>
  Array.from({ length: 8 }, (_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() - (7 - i));
    return {
      month: d.toLocaleDateString('en', { month: 'short', year: '2-digit' }),
      revenue: Math.floor(Math.random() * 1500) + 300,
    };
  });

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<any[]>([]);
  const [total, setTotal]       = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [page, setPage]         = useState(1);
  const [loading, setLoading]   = useState(true);
  const [chartData]             = useState(mockRevenueData);
  const limit = 20;

  const load = async () => {
    setLoading(true);
    try {
      // Fetch admin stats for total revenue
      const stats = await api.get<any>('/admin/stats');
      setTotalRevenue(Number(stats.totalRevenue) || 0);

      // For payments we'd need a dedicated admin endpoint
      // Using the user's own as fallback for now
      const data = await api.get<any[]>('/payments/history');
      const list = Array.isArray(data) ? data : [];
      setPayments(list.slice((page - 1) * limit, page * limit));
      setTotal(list.length);
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [page]);

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="max-w-5xl space-y-6">
      <div className="flex items-center gap-3">
        <CreditCard className="h-6 w-6 text-brand-600" />
        <div>
          <h1 className="text-2xl font-bold">Payments</h1>
          <p className="text-sm text-muted-foreground">Revenue overview and transaction history</p>
        </div>
      </div>

      {/* Revenue summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-900 rounded-2xl border p-5">
          <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Total Revenue</div>
          <div className="text-3xl font-bold text-green-600">${totalRevenue.toFixed(2)}</div>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-2xl border p-5">
          <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Transactions</div>
          <div className="text-3xl font-bold">{total}</div>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-2xl border p-5">
          <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Avg. Transaction</div>
          <div className="text-3xl font-bold">
            ${total > 0 ? (totalRevenue / total).toFixed(2) : '0.00'}
          </div>
        </div>
      </div>

      {/* Revenue chart */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border p-6">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="h-4 w-4 text-brand-600" />
          <h3 className="font-semibold text-sm">Monthly Revenue (8 months)</h3>
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis dataKey="month" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `$${v}`} />
            <Tooltip formatter={(v: any) => [`$${v}`, 'Revenue']} />
            <Bar dataKey="revenue" fill="#2563eb" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Transactions table */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border overflow-hidden">
        <div className="grid grid-cols-[1fr_100px_80px_100px_120px] gap-3 px-4 py-3 border-b bg-gray-50 dark:bg-gray-800/50">
          {['Description', 'Amount', 'Status', 'Gateway', 'Date'].map(h => (
            <span key={h} className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{h}</span>
          ))}
        </div>

        {loading ? (
          <div className="p-12 text-center">
            <Loader2 className="h-5 w-5 animate-spin mx-auto text-muted-foreground" />
          </div>
        ) : payments.length === 0 ? (
          <div className="p-8 text-center text-sm text-muted-foreground">No payments recorded yet</div>
        ) : (
          <div className="divide-y">
            {payments.map(pay => (
              <div key={pay.id} className="grid grid-cols-[1fr_100px_80px_100px_120px] gap-3 px-4 py-3.5 items-center hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                <div>
                  <p className="font-medium text-sm">{pay.description || 'Subscription'}</p>
                  <p className="text-xs text-muted-foreground font-mono">{pay.gatewayPaymentId?.slice(0, 16)}...</p>
                </div>
                <div className="font-bold text-sm">
                  ${Number(pay.amount).toFixed(2)} <span className="text-xs text-muted-foreground font-normal">{pay.currency}</span>
                </div>
                <div>
                  <span className={cn('px-2 py-0.5 rounded-full text-xs font-bold', STATUS_COLOR[pay.status] || '')}>
                    {pay.status}
                  </span>
                </div>
                <div className="text-sm capitalize">{pay.gateway}</div>
                <div className="text-xs text-muted-foreground whitespace-nowrap">
                  {new Date(pay.createdAt).toLocaleDateString(undefined, {
                    month: 'short', day: 'numeric', year: 'numeric',
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t">
            <p className="text-xs text-muted-foreground">Page {page} of {totalPages}</p>
            <div className="flex gap-1">
              <Button variant="ghost" size="icon" className="h-8 w-8" disabled={page === 1} onClick={() => setPage(p => p - 1)}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
