import { ReactNode, useMemo } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { getAccessToken } from '@/api/client';
import { DEFAULT_PERMISSIONS, getModuleForRoute, canViewModule, resolveRolePermissions, getFirstAccessibleRoute } from '@/config/rolePermissions';
import type { PermissionMap, StaffRole } from '@/config/rolePermissions';


// Roles that should go to the staff portal instead of admin panel
const STAFF_PORTAL_REDIRECT: Record<string, string> = {
  housekeeper: '/staff/housekeeping',
  housekeeping: '/staff/housekeeping',
  room_attendant: '/staff/housekeeping',
  laundry_attendant: '/staff/housekeeping',
  maintenance: '/staff/maintenance',
  technician: '/staff/maintenance',
  electrician: '/staff/maintenance',
  plumber: '/staff/maintenance',
  hvac_technician: '/staff/maintenance',
  runner: '/staff/runner',
  bellhop: '/staff/runner',
  valet: '/staff/runner',
};

// Roles that access admin panel (RBAC roles minus staff-portal-only roles)
const ADMIN_PANEL_ROLES = new Set<string>(
  Object.keys(DEFAULT_PERMISSIONS).filter(r => !(r in STAFF_PORTAL_REDIRECT))
);

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: string[];
  requireAdmin?: boolean;
}

export function ProtectedRoute({ children, allowedRoles, requireAdmin }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();

  // Double-check: ensure we have both a user AND a valid token
  const hasToken = !!getAccessToken();
  const isReallyAuthenticated = isAuthenticated && user && hasToken;

  // Resolve RBAC permissions (checks Settings customizations via localStorage)
  const userPermissions: PermissionMap | undefined = useMemo(() => {
    if (!user) return undefined;
    if (user.permissions) return user.permissions as PermissionMap;
    if (user.isSuperuser) return DEFAULT_PERMISSIONS.admin;
    if (user.role && user.role in DEFAULT_PERMISSIONS) {
      return resolveRolePermissions(user.role as StaffRole);
    }
    return undefined;
  }, [user]);

  // Show loading spinner while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-neutral-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated (check both user and token)
  if (!isReallyAuthenticated) {
    // Clear any stale localStorage data
    localStorage.removeItem('glimmora_user');
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check admin routes
  const isAdminRoute = location.pathname.startsWith('/admin');
  const userRole = user?.role?.toLowerCase() || '';
  const isSuperuser = user?.isSuperuser || false;

  if (isAdminRoute || requireAdmin) {
    // Allow superuser, admin, or any of the 10 RBAC roles into the admin panel
    const hasAdminAccess = isSuperuser || ADMIN_PANEL_ROLES.has(userRole);

    if (!hasAdminAccess) {
      // Staff portal roles → redirect to staff portal
      if (userRole in STAFF_PORTAL_REDIRECT) {
        return <Navigate to={STAFF_PORTAL_REDIRECT[userRole]} replace />;
      }
      if (['front_desk', 'frontdesk'].includes(userRole)) {
        return <Navigate to="/dashboard/frontdesk" replace />;
      }
      // Guest or unknown role → redirect to home
      return <Navigate to="/" replace />;
    }

    // RBAC: check module-level permission for the specific admin route
    // Skip for access-denied page to prevent infinite redirect loops
    if (location.pathname !== '/admin/access-denied') {
      const module = getModuleForRoute(location.pathname);
      if (module && userPermissions && !canViewModule(userPermissions, module)) {
        // If dashboard is blocked, redirect to the first accessible page instead of access-denied
        if (module === 'dashboard') {
          const fallback = getFirstAccessibleRoute(userPermissions);
          if (fallback) {
            return <Navigate to={fallback} replace />;
          }
        }
        return <Navigate to="/admin/access-denied" replace />;
      }
    }
  }

  // Check role-based access if allowedRoles is specified
  if (allowedRoles && allowedRoles.length > 0) {
    const hasAllowedRole = allowedRoles.some(
      role => role.toLowerCase() === userRole || (role === 'admin' && isSuperuser)
    );
    if (!hasAllowedRole) {
      return <Navigate to="/" replace />;
    }
  }

  // Render children if authenticated and authorized
  return <>{children}</>;
}
