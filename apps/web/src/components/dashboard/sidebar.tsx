'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useAuthStore } from '@/store/auth.store';
import {
  LayoutDashboard, History, GitCompare, CreditCard,
  User, Settings, Shield, BarChart3,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  { href: '/dashboard',          icon: LayoutDashboard, labelKey: 'dashboard'  },
  { href: '/dashboard/history',  icon: History,         labelKey: 'history'    },
  { href: '/dashboard/compare',  icon: GitCompare,      labelKey: 'compare'    },
  { href: '/dashboard/billing',  icon: CreditCard,      labelKey: 'billing'    },
  { href: '/dashboard/profile',  icon: User,            labelKey: 'profile'    },
  { href: '/dashboard/settings', icon: Settings,        labelKey: 'settings'   },
];

const ADMIN_ITEMS = [
  { href: '/admin',              icon: Shield,          labelKey: 'admin'      },
];

export function DashboardSidebar() {
  const t = useTranslations('nav');
  const pathname = usePathname();
  const { user } = useAuthStore();

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard' || pathname === '/es/dashboard';
    return pathname.includes(href);
  };

  return (
    <aside className="w-56 min-h-[calc(100vh-4rem)] border-r bg-white dark:bg-gray-900 flex-shrink-0 hidden md:block">
      <nav className="p-3 space-y-1">
        {NAV_ITEMS.map(({ href, icon: Icon, labelKey }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
              isActive(href)
                ? 'bg-brand-50 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300'
                : 'text-muted-foreground hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-foreground',
            )}
          >
            <Icon className="h-4 w-4 flex-shrink-0" />
            {t(labelKey as any)}
          </Link>
        ))}

        {user?.role === 'ADMIN' && (
          <>
            <div className="pt-3 pb-1 px-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/60">
                Admin
              </span>
            </div>
            {ADMIN_ITEMS.map(({ href, icon: Icon, labelKey }) => (
              <Link
                key={href}
                href={href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                  isActive(href)
                    ? 'bg-brand-50 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300'
                    : 'text-muted-foreground hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-foreground',
                )}
              >
                <Icon className="h-4 w-4 flex-shrink-0" />
                {t(labelKey as any)}
              </Link>
            ))}
          </>
        )}
      </nav>

      {/* Plan badge at bottom */}
      {user && (
        <div className="p-3 mt-auto border-t">
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <BarChart3 className="h-4 w-4 text-brand-600" />
              <span className="text-xs font-semibold capitalize">{user.role?.toLowerCase()} Plan</span>
            </div>
            {user.role !== 'PREMIUM' && user.role !== 'ADMIN' && (
              <Link
                href="/pricing"
                className="text-xs text-brand-600 hover:underline font-medium"
              >
                Upgrade →
              </Link>
            )}
          </div>
        </div>
      )}
    </aside>
  );
}
