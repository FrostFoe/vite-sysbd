import { X } from "lucide-react";
import type React from "react";
import type { ReactNode } from "react";
import { useEffect } from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
  closeButton?: boolean;
  backdrop?: boolean;
}

const sizeClasses = {
  sm: "w-full max-w-sm",
  md: "w-full max-w-md",
  lg: "w-full max-w-lg",
  xl: "w-full max-w-2xl",
};

/**
 * Reusable Modal Component
 * Provides a consistent modal dialog across the application
 */
export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = "md",
  closeButton = true,
  backdrop = true,
}) => {
  useEffect(() => {
    if (isOpen) {
      // Prevent body scroll when modal is open
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? "modal-title" : undefined}
      className={`fixed inset-0 z-50 flex items-center justify-center ${
        backdrop ? "bg-black/50" : ""
      }`}
      onClick={backdrop ? onClose : undefined}
      onKeyDown={(e) => {
        if (e.key === "Escape" && backdrop) {
          onClose();
        }
      }}
      tabIndex={-1}
    >
      <div
        role="document"
        className={`${sizeClasses[size]} bg-card rounded-lg shadow-lg overflow-hidden transform transition-all`}
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => e.stopPropagation()}
      >
        {/* Header */}
        {title && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-border">
            <h2
              id="modal-title"
              className="text-lg font-semibold text-card-text"
            >
              {title}
            </h2>
            {closeButton && (
              <button
                type="button"
                onClick={onClose}
                className="p-1 hover:bg-muted-bg rounded transition-colors"
                aria-label="Close modal"
              >
                <X className="w-5 h-5 text-muted-text" />
              </button>
            )}
          </div>
        )}

        {/* Content */}
        <div className="px-6 py-4">{children}</div>
      </div>
    </div>
  );
};

interface DialogProps extends ModalProps {
  onConfirm?: () => void;
  onCancel?: () => void;
  confirmText?: string;
  cancelText?: string;
  isLoading?: boolean;
}

/**
 * Confirmation Dialog Component
 * Extends Modal with confirmation/cancellation buttons
 */
export const Dialog: React.FC<DialogProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = "md",
  onConfirm,
  onCancel,
  confirmText = "Confirm",
  cancelText = "Cancel",
  isLoading = false,
  backdrop = true,
}) => {
  const handleConfirm = () => {
    onConfirm?.();
  };

  const handleCancel = () => {
    onCancel?.();
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size={size}
      backdrop={backdrop}
    >
      <div className="space-y-6">
        <div>{children}</div>

        <div className="flex gap-3 justify-end pt-4 border-t border-border">
          <button
            type="button"
            onClick={handleCancel}
            disabled={isLoading}
            className="px-4 py-2 text-muted-text hover:bg-muted-bg rounded transition-colors disabled:opacity-50"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={isLoading}
            className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {isLoading && <span className="animate-spin">⊙</span>}
            {confirmText}
          </button>
        </div>
      </div>
    </Modal>
  );
};

interface AlertDialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  type?: "info" | "warning" | "error" | "success";
  onConfirm?: () => void;
  confirmText?: string;
}

/**
 * Alert Dialog Component
 * Simple alert with single action button
 */
export const AlertDialog: React.FC<AlertDialogProps> = ({
  isOpen,
  onClose,
  title,
  message,
  type = "info",
  onConfirm,
  confirmText = "OK",
}) => {
  const bgColors = {
    info: "bg-blue-50 dark:bg-blue-900/20",
    warning: "bg-yellow-50 dark:bg-yellow-900/20",
    error: "bg-red-50 dark:bg-red-900/20",
    success: "bg-green-50 dark:bg-green-900/20",
  };

  const textColors = {
    info: "text-blue-600",
    warning: "text-yellow-600",
    error: "text-red-600",
    success: "text-green-600",
  };

  const borderColors = {
    info: "border-blue-200 dark:border-blue-800",
    warning: "border-yellow-200 dark:border-yellow-800",
    error: "border-red-200 dark:border-red-800",
    success: "border-green-200 dark:border-green-800",
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md" backdrop>
      <div
        className={`${bgColors[type]} ${borderColors[type]} border rounded-lg p-4`}
      >
        <h3 className={`font-semibold ${textColors[type]} mb-2`}>{title}</h3>
        <p className="text-card-text mb-4">{message}</p>

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={() => {
              onConfirm?.();
              onClose();
            }}
            className={`px-4 py-2 ${textColors[type]} hover:${bgColors[type]} rounded transition-colors`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </Modal>
  );
};
