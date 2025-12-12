import { AlertTriangle } from "lucide-react";
import type { ErrorInfo, ReactNode } from "react";
import React from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * Error Boundary component to catch React component errors
 * Prevents the entire app from crashing if a single component fails
 */
export class ErrorBoundary extends React.Component<Props, State> {
  public constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Error caught by boundary:", error, errorInfo);
    this.setState({
      hasError: true,
      error,
      errorInfo,
    });
  }

  public render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="min-h-screen bg-card flex items-center justify-center p-4">
            <div className="max-w-md w-full">
              <div className="bg-danger/10 dark:bg-danger/20 border border-danger/30 dark:border-danger/50 rounded-lg p-6">
                <div className="flex items-center gap-3 mb-4">
                  <AlertTriangle className="w-6 h-6 text-danger" />
                  <h1 className="text-lg font-bold text-danger">
                    Something went wrong
                  </h1>
                </div>

                <p className="text-sm text-card-text mb-4">
                  We're sorry for the inconvenience. The application encountered
                  an unexpected error.
                </p>

                {process.env.NODE_ENV === "development" && this.state.error && (
                  <details className="mt-4 p-3 bg-black/5 rounded text-xs">
                    <summary className="cursor-pointer font-mono text-red-600">
                      Error Details
                    </summary>
                    <pre className="mt-2 overflow-auto text-muted-text">
                      {this.state.error.toString()}
                      {"\n\n"}
                      {this.state.errorInfo?.componentStack}
                    </pre>
                  </details>
                )}

                <button
                  type="button"
                  onClick={() => window.location.reload()}
                  className="mt-4 w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Reload Page
                </button>
              </div>
            </div>
          </div>
        )
      );
    }

    return this.props.children;
  }
}
