'use client';

import { useState, useCallback } from 'react';

interface Toast {
  id: string;
  title?: string;
  description?: string;
  variant?: 'default' | 'destructive';
}

let toastListeners: ((toasts: Toast[]) => void)[] = [];
let currentToasts: Toast[] = [];

const notifyListeners = () => {
  toastListeners.forEach((listener) => listener([...currentToasts]));
};

export function toast(options: Omit<Toast, 'id'>) {
  const id = Math.random().toString(36).slice(2);
  const newToast: Toast = { id, ...options };
  currentToasts = [...currentToasts, newToast];
  notifyListeners();

  setTimeout(() => {
    currentToasts = currentToasts.filter((t) => t.id !== id);
    notifyListeners();
  }, 4000);
}

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>(currentToasts);

  const listener = useCallback((updated: Toast[]) => setToasts(updated), []);

  if (!toastListeners.includes(listener)) {
    toastListeners.push(listener);
  }

  return { toasts, toast };
}
