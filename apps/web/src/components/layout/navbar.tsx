'use client';

import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/auth.store';
import { LanguageSwitcher } from '@/components/ui/language-switcher';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { Button } from '@/components/ui/button';
import { BarChart3, Menu, X } from 'lucide-react';
import { useState } from 'react';

export function Navbar() {
  const t = useTranslations('nav');
  const { user, isAuthenticated, logout } = useAuthStore();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between max-w-7xl">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-bold text-xl">
          <BarChart3 className="h-6 w-6 text-brand-600" />
          <span className="text-brand-700 dark:text-brand-400">DLMETRIX</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          <Link href="/" className="text-muted-foreground hover:text-foreground transition-colors">
            {t('home')}
          </Link>
          {isAuthenticated && (
            <>
              <Link href="/dashboard" className="text-muted-foreground hover:text-foreground transition-colors">
                {t('dashboard')}
              </Link>
              <Link href="/dashboard/history" className="text-muted-foreground hover:text-foreground transition-colors">
                {t('history')}
              </Link>
              {user?.role === 'ADMIN' && (
                <Link href="/admin" className="text-muted-foreground hover:text-foreground transition-colors">
                  {t('admin')}
                </Link>
              )}
            </>
          )}
          <Link href="/pricing" className="text-muted-foreground hover:text-foreground transition-colors">
            {t('pricing')}
          </Link>
        </nav>

        {/* Right actions */}
        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          <ThemeToggle />

          {isAuthenticated ? (
            <div className="hidden md:flex items-center gap-2">
              <span className="text-sm text-muted-foreground">{user?.name}</span>
              <Button variant="outline" size="sm" onClick={handleLogout}>{t('logout')}</Button>
            </div>
          ) : (
            <div className="hidden md:flex items-center gap-2">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/login">{t('login')}</Link>
              </Button>
              <Button size="sm" asChild>
                <Link href="/register">{t('register')}</Link>
              </Button>
            </div>
          )}

          <button
            className="md:hidden p-2 rounded-md"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t px-4 py-4 space-y-3 bg-background">
          <Link href="/" className="block text-sm py-2" onClick={() => setMobileOpen(false)}>
            {t('home')}
          </Link>
          {isAuthenticated ? (
            <>
              <Link href="/dashboard" className="block text-sm py-2" onClick={() => setMobileOpen(false)}>
                {t('dashboard')}
              </Link>
              <button className="block text-sm py-2 text-left w-full" onClick={handleLogout}>
                {t('logout')}
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="block text-sm py-2" onClick={() => setMobileOpen(false)}>
                {t('login')}
              </Link>
              <Link href="/register" className="block text-sm py-2" onClick={() => setMobileOpen(false)}>
                {t('register')}
              </Link>
            </>
          )}
        </div>
      )}
    </header>
  );
}
