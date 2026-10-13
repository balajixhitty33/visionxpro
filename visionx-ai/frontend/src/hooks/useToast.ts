import { useState, useCallback } from 'react';
import { ToastMessage } from '../types';

let globalAddToast: ((toast: Omit<ToastMessage, 'id'>) => void) | null = null;

export function useToastState() {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = useCallback((toast: Omit<ToastMessage, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 9);
    const duration = toast.duration ?? 4000;
    const newToast: ToastMessage = { ...toast, id };

    setToasts((prev) => [...prev, newToast]);

    if (duration > 0) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, duration);
    }
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  globalAddToast = addToast;

  return { toasts, addToast, removeToast };
}

export function toast(type: ToastMessage['type'], title: string, message?: string, duration?: number) {
  if (globalAddToast) {
    globalAddToast({ type, title, message, duration });
  } else {
    console.log(`[Toast ${type}] ${title} ${message || ''}`);
  }
}
