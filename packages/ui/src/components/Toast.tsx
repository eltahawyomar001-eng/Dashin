import React, { createContext, useContext, useState, useCallback } from 'react';
import { cn } from '../lib/utils';
import { X, CheckCircle2, AlertCircle, Info, AlertTriangle } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

interface ToastContextValue {
  toasts: Toast[];
  showToast: (toast: Omit<Toast, 'id'>) => void;
  hideToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 9);
    const newToast: Toast = { ...toast, id };
    
    setToasts((prev) => [...prev, newToast]);

    const duration = toast.duration ?? 5000;
    if (duration > 0) {
      setTimeout(() => {
        hideToast(id);
      }, duration);
    }
  }, []);

  const hideToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, showToast, hideToast }}>
      {children}
      <ToastContainer toasts={toasts} onClose={hideToast} />
    </ToastContext.Provider>
  );
};

interface ToastContainerProps {
  toasts: Toast[];
  onClose: (id: string) => void;
}

const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onClose }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-3 max-w-md">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onClose={onClose} />
      ))}
    </div>
  );
};

interface ToastItemProps {
  toast: Toast;
  onClose: (id: string) => void;
}

const ToastItem: React.FC<ToastItemProps> = ({ toast, onClose }) => {
  const [isExiting, setIsExiting] = useState(false);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      onClose(toast.id);
    }, 200);
  };

  const icons = {
    success: <CheckCircle2 className="h-5 w-5 text-green-400" />,
    error: <AlertCircle className="h-5 w-5 text-red-400" />,
    warning: <AlertTriangle className="h-5 w-5 text-amber-400" />,
    info: <Info className="h-5 w-5 text-blue-400" />,
  };

  const borderColors = {
    success: 'border-l-green-400',
    error: 'border-l-red-400',
    warning: 'border-l-amber-400',
    info: 'border-l-blue-400',
  };

  return (
    <div
      className={cn(
        'glass-strong rounded-xl shadow-glass-xl border-l-4 p-4 animate-slideInRight',
        borderColors[toast.type],
        isExiting && 'animate-slideOutRight'
      )}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">{icons[toast.type]}</div>
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-semibold text-white">{toast.title}</h4>
          {toast.message && (
            <p className="mt-1 text-sm text-slate-300">{toast.message}</p>
          )}
        </div>
        <button
          onClick={handleClose}
          className="flex-shrink-0 text-slate-400 hover:text-white transition-colors focus-ring rounded p-0.5"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      {toast.duration && toast.duration > 0 && (
        <div className="mt-2 h-1 bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-white/30 rounded-full animate-shrink"
            style={{ animationDuration: `${toast.duration}ms` }}
          />
        </div>
      )}
    </div>
  );
};
