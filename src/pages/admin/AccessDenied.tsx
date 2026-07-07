import { ShieldX, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useMemo } from 'react';
import { Button } from '@/components/ui2/Button';
import { useAuth } from '@/hooks/useAuth';
import { DEFAULT_PERMISSIONS, resolveRolePermissions, canViewModule, getFirstAccessibleRoute } from '@/config/rolePermissions';
import type { PermissionMap, StaffRole } from '@/config/rolePermissions';

export default function AccessDenied() {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Find the best page to navigate back to
  const backRoute = useMemo(() => {
    if (!user) return '/admin/dashboard';
    let permissions: PermissionMap | undefined;
    if (user.permissions) permissions = user.permissions as PermissionMap;
    else if (user.isSuperuser) permissions = DEFAULT_PERMISSIONS.admin;
    else if (user.role && user.role in DEFAULT_PERMISSIONS) {
      permissions = resolveRolePermissions(user.role as StaffRole);
    }
    if (permissions) {
      if (canViewModule(permissions, 'dashboard')) return '/admin/dashboard';
      return getFirstAccessibleRoute(permissions) || '/admin/dashboard';
    }
    return '/admin/dashboard';
  }, [user]);

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center max-w-md mx-auto px-6">
        {/* Icon */}
        <div className="w-20 h-20 mx-auto mb-6 bg-red-50 rounded-2xl flex items-center justify-center">
          <ShieldX className="w-10 h-10 text-red-400" />
        </div>

        {/* Title */}
        <h1 className="text-2xl font-serif font-bold text-neutral-900 mb-2">
          Access Denied
        </h1>

        {/* Description */}
        <p className="text-sm text-neutral-500 mb-8 leading-relaxed">
          You don't have permission to access this page. Contact your administrator if you believe this is an error.
        </p>

        {/* Action */}
        <Button
          variant="primary"
          onClick={() => navigate(backRoute)}
          className="inline-flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Go Back
        </Button>
      </div>
    </div>
  );
}
