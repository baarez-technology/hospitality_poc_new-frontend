import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useMemo } from 'react';
import { useAuth } from '@/hooks';
import { ROUTES } from '@/config/constants';
import { getModuleForRoute, canViewModule, DEFAULT_PERMISSIONS } from '@/config/rolePermissions';
import type { PermissionMap, StaffRole } from '@/config/rolePermissions';

export const ProtectedRoute = () => {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  const userPermissions: PermissionMap | undefined = useMemo(() => {
    if (!user) return undefined;
    if (user.permissions) return user.permissions as PermissionMap;
    if (user.isSuperuser) return DEFAULT_PERMISSIONS.admin;
    if (user.role && user.role in DEFAULT_PERMISSIONS) {
      return DEFAULT_PERMISSIONS[user.role as StaffRole];
    }
    return DEFAULT_PERMISSIONS.admin;
  }, [user]);

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  // Check module-level permission for admin routes
  const module = getModuleForRoute(location.pathname);
  if (module && userPermissions && !canViewModule(userPermissions, module)) {
    return <Navigate to="/admin/access-denied" replace />;
  }

  return <Outlet />;
};
