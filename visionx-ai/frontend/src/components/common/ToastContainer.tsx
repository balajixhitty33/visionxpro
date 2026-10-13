import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';
import { ToastMessage } from '../../types';

interface Props {
  toasts: ToastMessage[];
  onRemove: (id: string) => void;
}

const icons = {
  success: <CheckCircle2 className="w-5 h-5 text-status-success shrink-0" />,
  error: <AlertCircle className="w-5 h-5 text-status-danger shrink-0" />,
  warning: <AlertTriangle className="w-5 h-5 text-status-warning shrink-0" />,
  info: <Info className="w-5 h-5 text-brand-cyan shrink-0" />,
};

export const ToastContainer: React.FC<Props> = ({ toasts, onRemove }) => {
  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="pointer-events-auto flex items-start gap-3 p-4 rounded-xl bg-background-panel/95 backdrop-blur-md border border-white/10 shadow-card text-content-primary"
          >
            {icons[toast.type]}
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-semibold text-white leading-tight">{toast.title}</h4>
              {toast.message && (
                <p className="text-xs text-content-secondary mt-1 leading-relaxed">{toast.message}</p>
              )}
            </div>
            <button
              onClick={() => onRemove(toast.id)}
              className="text-content-secondary hover:text-white p-0.5 rounded transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
