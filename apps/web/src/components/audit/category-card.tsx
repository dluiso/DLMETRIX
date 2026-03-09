'use client';

import { useTranslations } from 'next-intl';
import type { CategoryScore } from '@dlmetrix/shared';
import { getScoreLabel } from '@dlmetrix/shared';
import { cn } from '@/lib/utils';

interface Props {
  category: CategoryScore;
  active: boolean;
  onClick: () => void;
}

export function CategoryCard({ category, active, onClick }: Props) {
  const t = useTranslations('audit.categories');
  const scoreInfo = getScoreLabel(category.score);

  return (
    <button
      onClick={onClick}
      className={cn(
        'p-4 rounded-xl border text-center cursor-pointer transition-all',
        'hover:shadow-md hover:border-brand-300',
        active
          ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/20 shadow-sm'
          : 'border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900',
      )}
    >
      <div
        className="text-2xl font-bold mb-1"
        style={{ color: scoreInfo.color }}
      >
        {category.score}
      </div>
      <div className="text-xs text-muted-foreground font-medium truncate">
        {t(category.category as any)}
      </div>
      {category.issues.length > 0 && (
        <div className="mt-1 text-xs text-red-500">
          {category.issues.length} issues
        </div>
      )}
    </button>
  );
}
