import { useTranslations } from 'next-intl';
import { Gauge, Search, Shield, Accessibility, FileText, Tags } from 'lucide-react';

const features = [
  { icon: Gauge,         key: 'performance'   },
  { icon: Search,        key: 'seo'           },
  { icon: Shield,        key: 'security'      },
  { icon: Accessibility, key: 'accessibility' },
  { icon: FileText,      key: 'content'       },
  { icon: Tags,          key: 'metadata'      },
] as const;

export function FeaturesSection() {
  const t = useTranslations('home.features');

  return (
    <section className="py-20 bg-white dark:bg-gray-950">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            {t('title')}
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map(({ icon: Icon, key }) => (
            <div
              key={key}
              className="p-6 rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 hover:shadow-md transition-shadow group"
            >
              <div className="w-12 h-12 rounded-xl bg-brand-50 dark:bg-brand-900/30 flex items-center justify-center mb-4 group-hover:bg-brand-100 transition-colors">
                <Icon className="h-6 w-6 text-brand-600 dark:text-brand-400" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                {t(key as any)}
              </h3>
              <p className="text-sm text-muted-foreground">
                {t(`${key}Desc` as any)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
