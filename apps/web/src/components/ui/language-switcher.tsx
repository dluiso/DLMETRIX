'use client';

import { useLocale } from 'next-intl';
import { usePathname, useRouter } from 'next/navigation';
import { locales } from '@/i18n/config';
import { Globe } from 'lucide-react';

const LOCALE_LABELS: Record<string, string> = {
  en: 'EN',
  es: 'ES',
};

export function LanguageSwitcher() {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  const switchLocale = (newLocale: string) => {
    // Remove current locale prefix and add new one
    const segments = pathname.split('/');
    if (locales.includes(segments[1] as any)) {
      segments[1] = newLocale === 'en' ? '' : newLocale;
    } else {
      segments.splice(1, 0, newLocale === 'en' ? '' : newLocale);
    }
    const newPath = segments.filter(Boolean).join('/') || '/';
    router.push(`/${newPath}`);
  };

  return (
    <div className="flex items-center gap-1 border rounded-lg p-1 text-xs">
      <Globe className="h-3.5 w-3.5 text-muted-foreground ml-1" />
      {locales.map((l) => (
        <button
          key={l}
          onClick={() => switchLocale(l)}
          className={`px-2 py-0.5 rounded transition-colors ${
            locale === l
              ? 'bg-primary text-primary-foreground font-medium'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          {LOCALE_LABELS[l]}
        </button>
      ))}
    </div>
  );
}
