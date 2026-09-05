import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastItem {
  id: string;
  message: string;
  description?: string;
  type: ToastType;
  duration: number;
}

interface ToastContextValue {
  showToast: (message: string, type?: ToastType, description?: string, duration?: number) => void;
  success: (message: string, description?: string, duration?: number) => void;
  error: (message: string, description?: string, duration?: number) => void;
  info: (message: string, description?: string, duration?: number) => void;
  warning: (message: string, description?: string, duration?: number) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (message: string, type: ToastType = 'success', description?: string, duration = 3500) => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
      const newToast: ToastItem = {
        id,
        message,
        description,
        type,
        duration,
      };

      setToasts((prev) => [...prev, newToast]);

      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }
    },
    [removeToast]
  );

  const success = useCallback(
    (message: string, description?: string, duration?: number) => {
      showToast(message, 'success', description, duration);
    },
    [showToast]
  );

  const error = useCallback(
    (message: string, description?: string, duration?: number) => {
      showToast(message, 'error', description, duration || 4500);
    },
    [showToast]
  );

  const info = useCallback(
    (message: string, description?: string, duration?: number) => {
      showToast(message, 'info', description, duration);
    },
    [showToast]
  );

  const warning = useCallback(
    (message: string, description?: string, duration?: number) => {
      showToast(message, 'warning', description, duration || 4000);
    },
    [showToast]
  );

  return (
    <ToastContext.Provider value={{ showToast, success, error, info, warning, removeToast }}>
      {children}

      {/* Floating Toast Portal Container */}
      <div
        id="toast-notification-portal"
        className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-3 sm:px-0"
        aria-live="polite"
      >
        {toasts.map((toast) => {
          const typeStyles = {
            success: {
              border: 'border-[#10B981]/50 bg-[#121815]',
              iconBg: 'bg-[#10B981]/20 text-[#10B981]',
              bar: 'bg-[#10B981]',
              Icon: CheckCircle2,
            },
            error: {
              border: 'border-red-500/50 bg-[#1f1313]',
              iconBg: 'bg-red-500/20 text-red-400',
              bar: 'bg-red-500',
              Icon: AlertCircle,
            },
            info: {
              border: 'border-[#D4AF37]/50 bg-[#171510]',
              iconBg: 'bg-[#D4AF37]/20 text-[#D4AF37]',
              bar: 'bg-[#D4AF37]',
              Icon: Info,
            },
            warning: {
              border: 'border-amber-500/50 bg-[#1a1710]',
              iconBg: 'bg-amber-500/20 text-amber-400',
              bar: 'bg-amber-500',
              Icon: AlertTriangle,
            },
          }[toast.type];

          const { Icon } = typeStyles;

          return (
            <div
              key={toast.id}
              id={`toast-item-${toast.id}`}
              className={`pointer-events-auto relative flex items-start gap-3 p-3.5 shadow-2xl backdrop-blur-md border ${typeStyles.border} text-white rounded-none transform transition-all duration-300 translate-y-0 animate-fadeIn overflow-hidden`}
              style={{
                boxShadow: '0 10px 30px -5px rgba(0, 0, 0, 0.8), 0 0 15px rgba(212, 175, 55, 0.1)',
              }}
            >
              {/* Left Accent Indicator Bar */}
              <div className={`absolute left-0 top-0 bottom-0 w-1 ${typeStyles.bar}`} />

              {/* Icon */}
              <div className={`p-1.5 rounded-sm flex-shrink-0 mt-0.5 ${typeStyles.iconBg}`}>
                <Icon className="w-4 h-4" />
              </div>

              {/* Text content */}
              <div className="flex-1 min-w-0 pr-2">
                <p className="text-xs sm:text-sm font-medium leading-snug font-sans text-gray-100">
                  {toast.message}
                </p>
                {toast.description && (
                  <p className="text-[11px] text-gray-400 mt-0.5 leading-tight">
                    {toast.description}
                  </p>
                )}
              </div>

              {/* Dismiss Button */}
              <button
                id={`close-${toast.id}`}
                onClick={() => removeToast(toast.id)}
                className="p-1 text-gray-400 hover:text-white hover:bg-white/10 rounded transition-colors flex-shrink-0 cursor-pointer"
                title="Tutup notifikasi"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};
