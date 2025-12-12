import type React from "react";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  message?: string;
  fullScreen?: boolean;
}

const sizeClasses = {
  sm: "w-6 h-6",
  md: "w-10 h-10",
  lg: "w-16 h-16",
};

/**
 * Standard Loading Spinner Component
 * Shows rotating spinner with optional message
 */
export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = "md",
  message,
  fullScreen = false,
}) => {
  const content = (
    <div className="flex flex-col items-center justify-center gap-4 animate-in fade-in duration-300">
      <div className={`${sizeClasses[size]} animate-spin text-bbcRed`}>
        <svg
          className="w-full h-full text-primary"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          role="img"
          aria-label="Loading spinner"
        >
          <title>Loading spinner</title>
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      </div>
      {message && <p className="text-muted-text">{message}</p>}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
        {content}
      </div>
    );
  }

  return content;
};

/**
 * Pulse Loading Component
 * Shows pulsing animation, good for skeleton screens
 */
export const PulseLoader: React.FC<{ message?: string }> = ({ message }) => (
  <div className="flex flex-col items-center justify-center gap-4">
    <div className="flex gap-2">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="w-3 h-3 bg-primary rounded-full animate-pulse"
          style={{ animationDelay: `${i * 0.2}s` }}
        />
      ))}
    </div>
    {message && <p className="text-muted-text">{message}</p>}
  </div>
);

/**
 * Skeleton Component
 * Placeholder for content that's loading
 */
export const Skeleton: React.FC<{
  width?: string;
  height?: string;
  count?: number;
  circle?: boolean;
}> = ({ width = "w-full", height = "h-4", count = 1, circle = false }) => {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={`skeleton-${i}-${width}-${height}`}
          className={`${width} ${height} bg-muted-bg rounded animate-pulse ${
            circle ? "rounded-full" : ""
          }`}
        />
      ))}
    </div>
  );
};

/**
 * Text Skeleton
 * Multiple lines of skeleton text
 */
export const TextSkeleton: React.FC<{ lines?: number }> = ({ lines = 3 }) => (
  <div className="space-y-3">
    {Array.from({ length: lines }).map((_, i) => (
      <div
        key={`text-skeleton-${i}-${lines}`}
        className={`h-4 bg-muted-bg rounded animate-pulse ${i === lines - 1 ? "w-3/4" : ""}`}
      />
    ))}
  </div>
);

/**
 * Card Skeleton
 * Complete card placeholder
 */
export const CardSkeleton: React.FC = () => (
  <div className="bg-card rounded-lg p-4 space-y-4">
    <Skeleton width="w-1/2" height="h-6" />
    <Skeleton height="h-40" />
    <div className="space-y-2">
      <Skeleton />
      <Skeleton width="w-5/6" />
    </div>
  </div>
);

/**
 * Image Skeleton
 * Placeholder for loading images
 */
export const ImageSkeleton: React.FC<{
  width?: string;
  height?: string;
  aspectRatio?: string;
}> = ({ width = "w-full", height = "h-64", aspectRatio = "16/9" }) => (
  <div
    className={`${width} ${height} bg-muted-bg rounded-lg animate-pulse`}
    style={{ aspectRatio }}
  />
);

/**
 * List Skeleton
 * Placeholder for loading lists
 */
export const ListSkeleton: React.FC<{ count?: number }> = ({ count = 5 }) => (
  <div className="space-y-3">
    {Array.from({ length: count }).map((_, i) => (
      <div
        key={`list-skeleton-${i}-${count}`}
        className="flex gap-4 p-4 bg-card rounded-lg"
      >
        <Skeleton width="w-16" height="h-16" circle />
        <div className="flex-1 space-y-2">
          <Skeleton width="w-3/4" height="h-4" />
          <Skeleton width="w-1/2" height="h-3" />
        </div>
      </div>
    ))}
  </div>
);

/**
 * Progress Bar Component
 * Shows progress with percentage
 */
export const ProgressBar: React.FC<{
  progress: number;
  showLabel?: boolean;
  size?: "sm" | "md" | "lg";
}> = ({ progress, showLabel = true, size = "md" }) => {
  const sizeClass = {
    sm: "h-1",
    md: "h-2",
    lg: "h-3",
  };

  return (
    <div className="flex flex-col gap-2">
      <div
        className={`w-full ${sizeClass[size]} bg-muted-bg rounded-full overflow-hidden`}
      >
        <div
          className="bg-primary h-full transition-all duration-300 rounded-full"
          style={{ width: `${Math.min(progress, 100)}%` }}
        />
      </div>
      {showLabel && (
        <span className="text-xs text-muted-text">{Math.round(progress)}%</span>
      )}
    </div>
  );
};
