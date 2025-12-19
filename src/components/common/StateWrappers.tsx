import type React from "react";
import type { ReactNode } from "react";
import { LoadingSpinner } from "./LoadingSpinner";

interface LoadingStateProps {
  isLoading: boolean;
  children: ReactNode;
  message?: string;
  size?: "sm" | "md" | "lg";
  fullScreen?: boolean;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  isLoading,
  children,
  message,
  size = "md",
  fullScreen = false,
}) => {
  if (isLoading) {
    return (
      <LoadingSpinner size={size} message={message} fullScreen={fullScreen} />
    );
  }

  return <>{children}</>;
};

interface EmptyStateProps {
  isEmpty: boolean;
  children: ReactNode;
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  isEmpty,
  children,
  icon,
  title,
  description,
  action,
}) => {
  if (isEmpty) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
        {icon && <div className="mb-4 text-muted-text">{icon}</div>}
        <h3 className="text-lg font-semibold text-card-text mb-2">{title}</h3>
        {description && (
          <p className="text-muted-text text-sm mb-4">{description}</p>
        )}
        {action && <div className="mt-4">{action}</div>}
      </div>
    );
  }

  return <>{children}</>;
};

interface ErrorStateProps {
  error: string | null;
  onRetry?: () => void;
  children: ReactNode;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  error,
  onRetry,
  children,
}) => {
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
        <div className="mb-4 text-danger">
          <svg
            className="w-16 h-16 mx-auto"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-label="Error"
            role="img"
          >
            <title>Error</title>
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-danger mb-2">Error</h3>
        <p className="text-muted-text text-sm mb-4 max-w-md">{error}</p>
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="px-4 py-2 bg-bbcRed text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        )}
      </div>
    );
  }

  return <>{children}</>;
};
