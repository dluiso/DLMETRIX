import { useTranslations } from 'next-intl';

const stats = [
  { value: '50K+',  key: 'audits' },
  { value: '12K+',  key: 'sites'  },
  { value: '500K+', key: 'issues' },
];

export function StatsSection() {
  const t = useTranslations('home.stats');

  return (
    <section className="py-16 bg-brand-600 dark:bg-brand-800">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
          {stats.map(({ value, key }) => (
            <div key={key}>
              <div className="text-4xl font-bold text-white mb-2">{value}</div>
              <div className="text-brand-100 text-sm">{t(key as any)}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
