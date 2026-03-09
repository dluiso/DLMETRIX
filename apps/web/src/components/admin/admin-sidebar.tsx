'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, Users, BarChart3, FileText,
  CreditCard, Settings, Activity, Package,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const ITEMS = [
  { href: '/admin',          icon: LayoutDashboard, label: 'Overview'       },
  { href: '/admin/users',    icon: Users,           label: 'Users'          },
  { href: '/admin/audits',   icon: BarChart3,       label: 'Audits'         },
  { href: '/admin/plans',    icon: Package,         label: 'Plans'          },
  { href: '/admin/payments', icon: CreditCard,      label: 'Payments'       },
  { href: '/admin/logs',     icon: Activity,        label: 'Activity Logs'  },
  { href: '/admin/config',   icon: Settings,        label: 'Configuration'  },
];

export function AdminSidebar() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === '/admin') return pathname === '/admin' || pathname === '/es/admin';
    return pathname.includes(href);
  };

  return (
    <aside className="w-56 min-h-[calc(100vh-4rem)] border-r bg-white dark:bg-gray-900 flex-shrink-0 hidden md:block">
      <div className="p-3">
        <div className="px-3 py-2 mb-2">
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Admin Panel
          </span>
        </div>
        <nav className="space-y-1">
          {ITEMS.map(({ href, icon: Icon, label }) => (
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
              {label}
            </Link>
          ))}
        </nav>
      </div>
    </aside>
  );
}
