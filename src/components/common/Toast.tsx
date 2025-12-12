import { AlertCircle, AlertTriangle, CheckCircle, Info, X } from "lucide-react";
import type { FC, ReactNode } from "react";
import { createContext, useCallback, useContext, useState } from "react";

export type ToastType = "success" | "error" | "warning" | "info";

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
  timer?: NodeJS.Timeout | number;
}

interface NotificationContextType {
  toasts: Toast[];
  addToast: (message: string, type: ToastType, duration?: number) => string;
  removeToast: (id: string) => void;
  success: (message: string, duration?: number) => void;
  error: (message: string, duration?: number) => void;
  warning: (message: string, duration?: number) => void;
  info: (message: string, duration?: number) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined,
);

/**
 * Toast Provider Component
 * Manages all toasts in the application
 */
export const ToastProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback(
    (message: string, type: ToastType, duration = 5000) => {
      const id = Date.now().toString();
      const toast: Toast = { id, message, type, duration };

      setToasts((prev) => [...prev, toast]);

      if (duration > 0) {
        const timer = setTimeout(() => {
          setToasts((prev) => prev.filter((t) => t.id !== id));
        }, duration);

        // Store timer for cleanup
        toast.timer = timer;
      }

      return id;
    },
    [],
  );

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const success = useCallback(
    (message: string, duration?: number) => {
      addToast(message, "success", duration);
    },
    [addToast],
  );

  const error = useCallback(
    (message: string, duration?: number) => {
      addToast(message, "error", duration);
    },
    [addToast],
  );

  const warning = useCallback(
    (message: string, duration?: number) => {
      addToast(message, "warning", duration);
    },
    [addToast],
  );

  const info = useCallback(
    (message: string, duration?: number) => {
      addToast(message, "info", duration);
    },
    [addToast],
  );

  return (
    <NotificationContext.Provider
      value={{
        toasts,
        addToast,
        removeToast,
        success,
        error,
        warning,
        info,
      }}
    >
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </NotificationContext.Provider>
  );
};

/**
 * Hook to use toast notifications
 */
// eslint-disable-next-line react-refresh/only-export-components
export const useToast = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return context;
};

/**
 * Toast Container Component
 */
const ToastContainer: FC<{
  toasts: Toast[];
  onRemove: (id: string) => void;
}> = ({ toasts, onRemove }) => {
  return (
    <div className="fixed bottom-4 right-4 z-40 space-y-3 pointer-events-none">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onRemove={onRemove} />
      ))}
    </div>
  );
};

/**
 * Individual Toast Component
 */
const ToastItem: FC<{
  toast: Toast;
  onRemove: (id: string) => void;
}> = ({ toast, onRemove }) => {
  const bgColors = {
    success: "bg-success/10 dark:bg-success/20",
    error: "bg-danger/10 dark:bg-danger/20",
    warning: "bg-warning/10 dark:bg-warning/20",
    info: "bg-muted-bg",
  };

  const textColors = {
    success: "text-success",
    error: "text-danger",
    warning: "text-warning",
    info: "text-card-text",
  };

  const borderColors = {
    success: "border-success/30 dark:border-success/50",
    error: "border-danger/30 dark:border-danger/50",
    warning: "border-warning/30 dark:border-warning/50",
    info: "border-border-color",
  };

  const icons = {
    success: <CheckCircle className="w-5 h-5" />,
    error: <AlertCircle className="w-5 h-5" />,
    warning: <AlertTriangle className="w-5 h-5" />,
    info: <Info className="w-5 h-5" />,
  };

  return (
    <div
      className={`
        ${bgColors[toast.type]} ${borderColors[toast.type]}
        border rounded-lg shadow-lg p-4 flex items-start gap-3
        animate-in fade-in slide-in-from-bottom-4 pointer-events-auto
        max-w-md
      `}
    >
      <div className={`${textColors[toast.type]} flex-shrink-0`}>
        {icons[toast.type]}
      </div>

      <div className="flex-1">
        <p className={`${textColors[toast.type]} font-medium text-sm`}>
          {toast.message}
        </p>
        {toast.action && (
          <button
            type="button"
            onClick={() => {
              toast.action?.onClick();
              onRemove(toast.id);
            }}
            className={`${textColors[toast.type]} underline text-xs mt-1 hover:opacity-80`}
          >
            {toast.action.label}
          </button>
        )}
      </div>

      <button
        type="button"
        onClick={() => onRemove(toast.id)}
        className={`${textColors[toast.type]} flex-shrink-0 hover:opacity-80`}
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};
