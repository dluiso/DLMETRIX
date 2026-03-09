'use client';

import { useState } from 'react';
import { useTheme } from 'next-themes';
import { useTranslations } from 'next-intl';
import { useAuthStore } from '@/store/auth.store';
import { Navbar } from '@/components/layout/navbar';
import { DashboardSidebar } from '@/components/dashboard/sidebar';
import { Button } from '@/components/ui/button';
import { Settings, Moon, Sun, Monitor, Bell, Globe } from 'lucide-react';
import { cn } from '@/lib/utils';

type ThemeOption = 'light' | 'dark' | 'system';

const THEME_OPTIONS: { value: ThemeOption; label: string; icon: any }[] = [
  { value: 'light',  label: 'Light',  icon: Sun     },
  { value: 'dark',   label: 'Dark',   icon: Moon    },
  { value: 'system', label: 'System', icon: Monitor },
];

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const { user }            = useAuthStore();

  const [emailNotifs, setEmailNotifs] = useState(true);
  const [weeklyReport, setWeeklyReport] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Navbar />
      <div className="flex">
        <DashboardSidebar />
        <main className="flex-1 p-6 max-w-2xl">
          <div className="flex items-center gap-3 mb-6">
            <Settings className="h-6 w-6 text-brand-600" />
            <h1 className="text-2xl font-bold">Settings</h1>
          </div>

          {/* Theme */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl border p-6 mb-6">
            <h2 className="font-semibold mb-4">Appearance</h2>
            <div className="grid grid-cols-3 gap-3">
              {THEME_OPTIONS.map(({ value, label, icon: Icon }) => (
                <button
                  key={value}
                  onClick={() => setTheme(value)}
                  className={cn(
                    'flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all text-sm font-medium',
                    theme === value
                      ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/20 text-brand-700 dark:text-brand-300'
                      : 'border-gray-100 dark:border-gray-800 hover:border-gray-200 text-muted-foreground',
                  )}
                >
                  <Icon className="h-5 w-5" />
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Notifications */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl border p-6 mb-6">
            <div className="flex items-center gap-3 mb-5">
              <Bell className="h-5 w-5 text-brand-600" />
              <h2 className="font-semibold">Notifications</h2>
            </div>

            <div className="space-y-4">
              <ToggleRow
                label="Email notifications"
                description="Receive email when audit completes"
                value={emailNotifs}
                onChange={setEmailNotifs}
              />
              <ToggleRow
                label="Weekly digest"
                description="Weekly summary of your website performance"
                value={weeklyReport}
                onChange={setWeeklyReport}
              />
            </div>
          </div>

          {/* Account info */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl border p-6">
            <div className="flex items-center gap-3 mb-4">
              <Globe className="h-5 w-5 text-brand-600" />
              <h2 className="font-semibold">Account</h2>
            </div>
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Account ID</dt>
                <dd className="font-mono text-xs">{user?.id?.slice(0, 12)}...</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Plan</dt>
                <dd className="font-semibold capitalize">{user?.role?.toLowerCase()}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Member since</dt>
                <dd>—</dd>
              </div>
            </dl>

            <div className="mt-5 pt-5 border-t">
              <Button variant="destructive" size="sm">
                Delete Account
              </Button>
              <p className="text-xs text-muted-foreground mt-2">
                This will permanently delete your account and all audit data.
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

function ToggleRow({ label, description, value, onChange }: {
  label: string; description: string; value: boolean; onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium">{label}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <button
        onClick={() => onChange(!value)}
        className={cn(
          'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
          value ? 'bg-brand-600' : 'bg-gray-200 dark:bg-gray-700',
        )}
        role="switch"
        aria-checked={value}
      >
        <span className={cn(
          'inline-block h-4 w-4 rounded-full bg-white shadow-sm transition-transform',
          value ? 'translate-x-6' : 'translate-x-1',
        )} />
      </button>
    </div>
  );
}
