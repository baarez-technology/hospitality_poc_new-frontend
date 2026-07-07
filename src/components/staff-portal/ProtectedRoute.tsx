import { Navigate, useLocation } from 'react-router-dom';
import { ReactNode } from 'react';
import { useAuth } from '@/hooks/useAuth';

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: string[];
}

export default function ProtectedRoute({ children, allowedRoles = [] }: ProtectedRouteProps) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  // Show loading spinner while checking auth state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary-500/20 border-t-primary-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-neutral-600">Loading...</p>
        </div>
      </div>
    );
  }

  // If not authenticated, redirect to login
  if (!isAuthenticated || !user) {
    return <Navigate to="/staff/login" state={{ from: location }} replace />;
  }

  // If allowedRoles is specified, check if user's role is allowed
  if (allowedRoles.length > 0 && user.role && !allowedRoles.includes(user.role)) {
    // Map all roles to their correct dashboard path
    const rolePaths: Record<string, string> = {
      // Housekeeping department roles
      housekeeping: '/staff/housekeeping/dashboard',
      housekeeper: '/staff/housekeeping/dashboard',
      room_attendant: '/staff/housekeeping/dashboard',
      laundry_attendant: '/staff/housekeeping/dashboard',
      // Maintenance department roles
      maintenance: '/staff/maintenance/dashboard',
      technician: '/staff/maintenance/dashboard',
      electrician: '/staff/maintenance/dashboard',
      plumber: '/staff/maintenance/dashboard',
      hvac_technician: '/staff/maintenance/dashboard',
      // Runner department roles
      runner: '/staff/runner/dashboard',
      bellhop: '/staff/runner/dashboard',
      valet: '/staff/runner/dashboard',
      // Front desk roles - redirect to main dashboard
      front_desk: '/dashboard',
      receptionist: '/dashboard',
      concierge: '/dashboard',
      night_auditor: '/dashboard',
      // Management roles - redirect to admin
      manager: '/admin',
      supervisor: '/admin',
      general_manager: '/admin',
      admin: '/admin'
    };
    const correctPath = rolePaths[user.role] || '/staff/login';
    return <Navigate to={correctPath} replace />;
  }

  // User is authenticated and authorized
  return <>{children}</>;
}


