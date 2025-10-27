import React, { Component, ReactNode } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onReset?: () => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

/**
 * Error Boundary Component
 *
 * Catches JavaScript errors anywhere in the child component tree,
 * logs those errors, and displays a fallback UI instead of crashing
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    // Log error details for debugging
    console.error('ErrorBoundary caught an error:', error, errorInfo);

    this.setState({
      error,
      errorInfo,
    });

    // You could also log the error to an error reporting service here
    // Example: logErrorToService(error, errorInfo);
  }

  handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });

    // Call custom reset handler if provided
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  render(): ReactNode {
    if (this.state.hasError) {
      // Custom fallback UI if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default fallback UI
      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-beer-foam via-white to-beer-light/30">
          <Card className="max-w-2xl w-full border-2 border-red-200 shadow-xl">
            <CardHeader className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-red-100 rounded-full">
                  <AlertCircle className="h-8 w-8 text-red-600" />
                </div>
                <div className="flex-1">
                  <CardTitle className="text-2xl text-red-700 font-['Bungee']">
                    Oops! Something Went Wrong
                  </CardTitle>
                  <CardDescription className="text-base mt-2">
                    The beer tracker encountered an unexpected error. Don't worry, your data is safe!
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Error details (only show in development) */}
              {import.meta.env.DEV && this.state.error && (
                <div className="space-y-3">
                  <div className="font-semibold text-sm text-gray-700">Error Details:</div>
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 overflow-auto">
                    <pre className="text-xs text-red-800 font-mono whitespace-pre-wrap break-words">
                      {this.state.error.toString()}
                    </pre>
                  </div>

                  {this.state.errorInfo && (
                    <>
                      <div className="font-semibold text-sm text-gray-700 mt-4">Component Stack:</div>
                      <div className="bg-red-50 border border-red-200 rounded-lg p-4 overflow-auto max-h-48">
                        <pre className="text-xs text-red-800 font-mono whitespace-pre-wrap break-words">
                          {this.state.errorInfo.componentStack}
                        </pre>
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* Action buttons */}
              <div className="flex flex-wrap gap-3">
                <Button
                  onClick={this.handleReset}
                  variant="default"
                  className="bg-beer-dark hover:bg-beer-amber text-white font-semibold"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Try Again
                </Button>

                <Button
                  onClick={() => window.location.href = '/'}
                  variant="outline"
                  className="border-beer-dark text-beer-dark hover:bg-beer-foam"
                >
                  Return Home
                </Button>

                <Button
                  onClick={() => window.location.reload()}
                  variant="outline"
                  className="border-beer-dark text-beer-dark hover:bg-beer-foam"
                >
                  Reload Page
                </Button>
              </div>

              {/* Help text */}
              <div className="text-sm text-gray-600 bg-gray-50 p-4 rounded-lg border border-gray-200">
                <p className="font-semibold mb-2">What you can do:</p>
                <ul className="list-disc list-inside space-y-1 text-xs">
                  <li>Click "Try Again" to attempt to recover from the error</li>
                  <li>Reload the page to start fresh</li>
                  <li>Return to the home page</li>
                  <li>If the problem persists, try clearing your browser cache</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    // No error, render children normally
    return this.props.children;
  }
}

/**
 * Higher-order component to wrap any component with error boundary
 */
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  fallback?: ReactNode,
  onReset?: () => void
) {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary fallback={fallback} onReset={onReset}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name || 'Component'})`;

  return WrappedComponent;
}

export default ErrorBoundary;
