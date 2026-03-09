'use client';

import { useToast } from '@/hooks/use-toast';

export function Toaster() {
  const { toasts } = useToast();

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto max-w-sm rounded-xl border px-4 py-3 shadow-lg text-sm transition-all
            ${toast.variant === 'destructive'
              ? 'bg-red-50 border-red-200 text-red-800 dark:bg-red-950 dark:border-red-800 dark:text-red-200'
              : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700'
            }`}
        >
          {toast.title && <div className="font-semibold">{toast.title}</div>}
          {toast.description && <div className="opacity-80">{toast.description}</div>}
        </div>
      ))}
    </div>
  );
}
