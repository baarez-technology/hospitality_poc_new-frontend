import { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from '@/components/ui/Button';
// Helper to get the correct dashboard path based on user role
const getDashboardPath = (): string => {
  try {
    const userStr = localStorage.getItem('glimmora_user');
    if (userStr) {
      const user = JSON.parse(userStr);
      const role = user?.role?.toLowerCase();
      // Admin roles go to admin dashboard
      if (role === 'admin' || role === 'owner' || role === 'manager') {
        return '/admin';
      }
      // Staff roles go to staff portal
      if (role === 'staff' || role === 'receptionist' || role === 'housekeeping' || role === 'maintenance') {
        return '/staff';
      }
    }
  } catch (e) {
    console.error('Error reading user from localStorage:', e);
  }
  // Default to home for guests/unknown
  return '/';
};

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-neutral-50">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="mb-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-red-600"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-neutral-900 mb-2">
                Oops! Something went wrong
              </h1>
              <p className="text-neutral-600 mb-4">
                We're sorry for the inconvenience. An unexpected error has occurred.
              </p>
              {this.state.error && (
                <details className="text-left mt-4 p-4 bg-neutral-100 rounded-lg">
                  <summary className="cursor-pointer font-medium text-neutral-700">
                    Error details
                  </summary>
                  <pre className="mt-2 text-xs text-neutral-600 overflow-auto">
                    {this.state.error.toString()}
                  </pre>
                </details>
              )}
            </div>
            <div className="space-y-3">
              <Button onClick={this.handleReset} fullWidth>
                Try again
              </Button>
              <Button
                variant="ghost"
                onClick={() => {
                  const path = getDashboardPath();
                  window.location.href = path;
                }}
                fullWidth
              >
                {(() => {
                  const path = getDashboardPath();
                  return path === '/admin' ? 'Go to Admin Dashboard' : path === '/staff' ? 'Go to Staff Portal' : 'Go to Home';
                })()}
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
