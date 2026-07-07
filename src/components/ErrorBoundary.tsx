/**
 * Error Boundary Component
 * Catches JavaScript errors anywhere in the child component tree
 * and displays a fallback UI instead of crashing the entire app
 */

import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log error details for debugging
    console.error('Error Boundary caught an error:', error, errorInfo);
    this.setState({
      error,
      errorInfo,
    });

    // You can also log the error to an error reporting service here
    // e.g., Sentry, LogRocket, etc.
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    if (this.state.hasError) {
      // Render custom fallback UI
      return (
        <ErrorFallback
          error={this.state.error}
          errorInfo={this.state.errorInfo}
          onReset={this.handleReset}
        />
      );
    }

    return this.props.children;
  }
}

// Helper to get the correct dashboard path based on user role
const getDashboardPath = () => {
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

// Fallback UI Component
function ErrorFallback({ error, errorInfo, onReset }) {
  const { isDark } = useTheme();
  const cardBg = isDark ? 'bg-white/[0.03] border border-white/[0.08] backdrop-blur-sm' : 'luxury-glass';
  const dashboardPath = getDashboardPath();

  return (
    <div className={`min-h-screen flex items-center justify-center p-6 ${isDark ? 'bg-[#0a0a0a]' : 'luxury-bg'}`}>
      <div className={`${cardBg} rounded-2xl p-8 max-w-2xl w-full shadow-xl`}>
        {/* Error Icon */}
        <div className={`w-20 h-20 mx-auto rounded-2xl flex items-center justify-center mb-6 ${
          isDark ? 'bg-rose-500/20' : 'bg-gradient-to-br from-rose-50 to-rose-100'
        }`}>
          <AlertTriangle className="w-10 h-10 text-rose-500" />
        </div>

        {/* Error Title */}
        <h1 className={`text-2xl font-bold text-center mb-3 ${isDark ? 'text-white' : 'text-neutral-900'}`}>
          Oops! Something went wrong
        </h1>

        {/* Error Description */}
        <p className={`text-center mb-6 ${isDark ? 'text-white/60' : 'text-neutral-600'}`}>
          We encountered an unexpected error. Please try refreshing the page or contact support if the problem persists.
        </p>

        {/* Error Details (Development Only) */}
        {process.env.NODE_ENV === 'development' && error && (
          <div className={`mb-6 p-4 rounded-xl font-mono text-xs overflow-auto ${
            isDark ? 'bg-white/5 border border-white/10' : 'bg-neutral-50 border border-neutral-200'
          }`}>
            <div className={`font-semibold mb-2 ${isDark ? 'text-rose-400' : 'text-rose-600'}`}>
              Error: {error.toString()}
            </div>
            {errorInfo && (
              <pre className={`text-xs whitespace-pre-wrap ${isDark ? 'text-white/70' : 'text-neutral-700'}`}>
                {errorInfo.componentStack}
              </pre>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={onReset}
            className="flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-[#A57865] rounded-xl hover:bg-[#8E6554] transition-all luxury-card-hover shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-[#A57865]/50"
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </button>
          <button
            onClick={() => window.location.href = dashboardPath}
            className={`flex items-center gap-2 px-6 py-2.5 text-sm font-semibold rounded-xl transition-all luxury-card-hover border focus:outline-none focus:ring-2 focus:ring-[#A57865]/50 ${
              isDark
                ? 'border-white/20 text-white hover:bg-white/5'
                : 'border-neutral-300 text-neutral-700 hover:bg-neutral-50'
            }`}
          >
            <Home className="w-4 h-4" />
            {dashboardPath === '/admin' ? 'Go to Admin Dashboard' : dashboardPath === '/staff' ? 'Go to Staff Portal' : 'Go Home'}
          </button>
        </div>

        {/* Help Text */}
        <p className={`text-center text-xs mt-6 ${isDark ? 'text-white/40' : 'text-neutral-400'}`}>
          Error ID: {Date.now().toString(36).toUpperCase()}
        </p>
      </div>
    </div>
  );
}

export default ErrorBoundary;
