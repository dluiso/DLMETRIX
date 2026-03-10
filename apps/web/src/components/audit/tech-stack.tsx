'use client';

import type { TechStack, TechCategory } from '@dlmetrix/shared';
import { cn } from '@/lib/utils';

interface Props {
  techStack: TechStack[];
}

// ── Category display config ───────────────────────────────────────────────────
const CATEGORY_CONFIG: Record<TechCategory, { label: string; color: string; bg: string }> = {
  CMS:       { label: 'CMS',           color: 'text-purple-700 dark:text-purple-300',  bg: 'bg-purple-50 dark:bg-purple-950/40 border-purple-200 dark:border-purple-800' },
  Framework: { label: 'Framework',     color: 'text-blue-700 dark:text-blue-300',      bg: 'bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800' },
  UI:        { label: 'UI Library',    color: 'text-cyan-700 dark:text-cyan-300',      bg: 'bg-cyan-50 dark:bg-cyan-950/40 border-cyan-200 dark:border-cyan-800' },
  Analytics: { label: 'Analytics',     color: 'text-amber-700 dark:text-amber-300',    bg: 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800' },
  CDN:       { label: 'CDN',           color: 'text-green-700 dark:text-green-300',    bg: 'bg-green-50 dark:bg-green-950/40 border-green-200 dark:border-green-800' },
  Hosting:   { label: 'Hosting',       color: 'text-teal-700 dark:text-teal-300',      bg: 'bg-teal-50 dark:bg-teal-950/40 border-teal-200 dark:border-teal-800' },
  Server:    { label: 'Web Server',    color: 'text-slate-700 dark:text-slate-300',    bg: 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700' },
  Ecommerce: { label: 'E-commerce',    color: 'text-rose-700 dark:text-rose-300',      bg: 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800' },
  Library:   { label: 'Library',       color: 'text-indigo-700 dark:text-indigo-300',  bg: 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-800' },
  Payment:   { label: 'Payment',       color: 'text-emerald-700 dark:text-emerald-300', bg: 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800' },
  Auth:      { label: 'Auth',          color: 'text-orange-700 dark:text-orange-300',  bg: 'bg-orange-50 dark:bg-orange-950/40 border-orange-200 dark:border-orange-800' },
  Backend:   { label: 'Backend',       color: 'text-violet-700 dark:text-violet-300',  bg: 'bg-violet-50 dark:bg-violet-950/40 border-violet-200 dark:border-violet-800' },
  Marketing: { label: 'Marketing',     color: 'text-pink-700 dark:text-pink-300',      bg: 'bg-pink-50 dark:bg-pink-950/40 border-pink-200 dark:border-pink-800' },
};

// ── Tech icons (simple emoji/letter fallback + known SVG logos via CDN) ───────
// We use Simple Icons CDN which is free and open source
function TechIcon({ name }: { name: string }) {
  // Normalize name to simple-icons slug
  const slug = name
    .toLowerCase()
    .replace(/\./g, 'dot')
    .replace(/\s+/g, '')
    .replace(/[^a-z0-9]/g, '');

  return (
    <img
      src={`https://cdn.simpleicons.org/${slug}`}
      alt={name}
      className="w-4 h-4 object-contain"
      onError={(e) => {
        // Fallback: show first letter
        const target = e.currentTarget;
        target.style.display = 'none';
        const span = target.nextElementSibling as HTMLElement;
        if (span) span.style.display = 'flex';
      }}
    />
  );
}

function TechBadge({ tech }: { tech: TechStack }) {
  const cfg = CATEGORY_CONFIG[tech.category] || CATEGORY_CONFIG.Library;
  const initial = tech.name.charAt(0).toUpperCase();

  return (
    <div
      className={cn(
        'flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-medium',
        cfg.bg,
      )}
    >
      <span className="flex items-center justify-center w-4 h-4 relative flex-shrink-0">
        <TechIcon name={tech.name} />
        <span
          className={cn(
            'hidden items-center justify-center w-4 h-4 rounded-full text-[10px] font-bold',
            cfg.color,
          )}
          style={{ display: 'none' }}
        >
          {initial}
        </span>
      </span>
      <span className={cn('truncate', cfg.color)}>{tech.name}</span>
    </div>
  );
}

export function TechStackPanel({ techStack }: Props) {
  if (!techStack || techStack.length === 0) return null;

  // Group by category
  const grouped = techStack.reduce<Partial<Record<TechCategory, TechStack[]>>>((acc, t) => {
    if (!acc[t.category]) acc[t.category] = [];
    acc[t.category]!.push(t);
    return acc;
  }, {});

  const categoryOrder: TechCategory[] = [
    'Framework', 'CMS', 'UI', 'Library', 'Backend', 'Ecommerce',
    'Analytics', 'Marketing', 'Payment', 'Auth', 'CDN', 'Hosting', 'Server',
  ];

  const sortedCategories = categoryOrder.filter(c => grouped[c]?.length);

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border p-6">
      <h3 className="font-semibold mb-1">Tech Stack</h3>
      <p className="text-xs text-muted-foreground mb-5">
        Technologies detected on this website ({techStack.length} found)
      </p>

      <div className="space-y-4">
        {sortedCategories.map(category => {
          const cfg   = CATEGORY_CONFIG[category];
          const techs = grouped[category]!;
          return (
            <div key={category}>
              <p className={cn('text-[10px] font-bold uppercase tracking-wider mb-2', cfg.color)}>
                {cfg.label}
              </p>
              <div className="flex flex-wrap gap-2">
                {techs.map(t => <TechBadge key={t.name} tech={t} />)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
