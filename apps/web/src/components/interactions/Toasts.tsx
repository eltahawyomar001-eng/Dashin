/**
 * Toast Notification System
 * Contextual feedback with icons and animations
 */

'use client';

import { ReactNode, createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';

// Toast types
export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
  id: string;
  type: ToastType;
  title: string;
  description?: string;
  duration?: number;
}

interface ToastContextValue {
  toasts: Toast[];
  showToast: (toast: Omit<Toast, 'id'>) => void;
  hideToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

// Toast provider
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast = { ...toast, id };
    setToasts((prev) => [...prev, newToast]);

    // Auto-remove after duration
    const duration = toast.duration || 5000;
    setTimeout(() => {
      hideToast(id);
    }, duration);
  }, []);

  const hideToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, showToast, hideToast }}>
      {children}
      <ToastContainer toasts={toasts} onClose={hideToast} />
    </ToastContext.Provider>
  );
}

// Use toast hook
export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
}

// Toast container
interface ToastContainerProps {
  toasts: Toast[];
  onClose: (id: string) => void;
}

function ToastContainer({ toasts, onClose }: ToastContainerProps) {
  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-md">
      <AnimatePresence>
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onClose={onClose} />
        ))}
      </AnimatePresence>
    </div>
  );
}

// Individual toast item
interface ToastItemProps {
  toast: Toast;
  onClose: (id: string) => void;
}

function ToastItem({ toast, onClose }: ToastItemProps) {
  const icons = {
    success: <CheckCircle className="h-5 w-5 text-green-500" />,
    error: <XCircle className="h-5 w-5 text-red-500" />,
    warning: <AlertCircle className="h-5 w-5 text-yellow-500" />,
    info: <Info className="h-5 w-5 text-blue-500" />,
  };

  const colors = {
    success: 'bg-green-50 border-green-200',
    error: 'bg-red-50 border-red-200',
    warning: 'bg-yellow-50 border-yellow-200',
    info: 'bg-blue-50 border-blue-200',
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 100, scale: 0.9 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 100, scale: 0.9 }}
      transition={{ type: 'spring', stiffness: 500, damping: 40 }}
      className={`flex items-start gap-3 p-4 rounded-lg border shadow-lg ${colors[toast.type]}`}
    >
      <div className="flex-shrink-0 mt-0.5">{icons[toast.type]}</div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm">{toast.title}</p>
        {toast.description && (
          <p className="text-sm text-muted-foreground mt-1">{toast.description}</p>
        )}
      </div>
      <button
        onClick={() => onClose(toast.id)}
        className="flex-shrink-0 p-1 hover:bg-black/5 rounded transition-colors"
      >
        <X className="h-4 w-4" />
      </button>
    </motion.div>
  );
}

// Convenience toast functions
export function useToastHelpers() {
  const { showToast } = useToast();

  return {
    success: (title: string, description?: string) =>
      showToast({ type: 'success', title, description }),
    error: (title: string, description?: string) =>
      showToast({ type: 'error', title, description }),
    warning: (title: string, description?: string) =>
      showToast({ type: 'warning', title, description }),
    info: (title: string, description?: string) =>
      showToast({ type: 'info', title, description }),
  };
}

// Simple toast component (without provider)
interface SimpleToastProps {
  show: boolean;
  type: ToastType;
  title: string;
  description?: string;
  onClose: () => void;
}

export function SimpleToast({ show, type, title, description, onClose }: SimpleToastProps) {
  const icons = {
    success: <CheckCircle className="h-5 w-5 text-green-500" />,
    error: <XCircle className="h-5 w-5 text-red-500" />,
    warning: <AlertCircle className="h-5 w-5 text-yellow-500" />,
    info: <Info className="h-5 w-5 text-blue-500" />,
  };

  const colors = {
    success: 'bg-green-50 border-green-200',
    error: 'bg-red-50 border-red-200',
    warning: 'bg-yellow-50 border-yellow-200',
    info: 'bg-blue-50 border-blue-200',
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className={`flex items-start gap-3 p-4 rounded-lg border shadow-lg ${colors[type]}`}
        >
          <div className="flex-shrink-0 mt-0.5">{icons[type]}</div>
          <div className="flex-1">
            <p className="font-semibold text-sm">{title}</p>
            {description && <p className="text-sm text-muted-foreground mt-1">{description}</p>}
          </div>
          <button onClick={onClose} className="flex-shrink-0 p-1 hover:bg-black/5 rounded">
            <X className="h-4 w-4" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Compact toast (single line)
interface CompactToastProps {
  show: boolean;
  message: string;
  type?: ToastType;
}

export function CompactToast({ show, message, type = 'info' }: CompactToastProps) {
  const colors = {
    success: 'bg-green-500 text-white',
    error: 'bg-red-500 text-white',
    warning: 'bg-yellow-500 text-gray-900',
    info: 'bg-blue-500 text-white',
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className={`px-4 py-2 rounded-full shadow-lg text-sm font-medium ${colors[type]}`}
        >
          {message}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
