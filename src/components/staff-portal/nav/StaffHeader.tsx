import { Bell, Home, ChevronRight } from 'lucide-react';
import { useLocation, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useUI, useNotifications as usePortalNotifications } from '@/hooks/staff-portal/useStaffPortal';

export default function StaffHeader() {
  const location = useLocation();
  const { user } = useAuth();
  const { unreadCount } = usePortalNotifications();
  const { toggleNotificationDrawer } = useUI();

  // Get department from role or URL
  const getDepartment = (): string => {
    if (user?.role) {
      const role = user.role.toLowerCase();
      if (['housekeeping', 'housekeeper', 'room_attendant', 'laundry_attendant'].includes(role)) return 'housekeeping';
      if (['maintenance', 'technician', 'electrician', 'plumber', 'hvac_technician'].includes(role)) return 'maintenance';
      if (['runner', 'bellhop', 'valet'].includes(role)) return 'runner';
    }
    if (location.pathname.includes('/staff/housekeeping')) return 'housekeeping';
    if (location.pathname.includes('/staff/maintenance')) return 'maintenance';
    if (location.pathname.includes('/staff/runner')) return 'runner';
    return 'housekeeping';
  };

  const department = getDepartment();

  // Generate breadcrumb items from current path
  const getBreadcrumbItems = () => {
    const segments = location.pathname.split('/').filter(Boolean);
    const items: { label: string; path: string | null }[] = [];

    // Label mapping
    const labelMap: Record<string, string> = {
      'staff': 'Staff Portal',
      'housekeeping': 'Housekeeping',
      'maintenance': 'Maintenance',
      'runner': 'Runner',
      'dashboard': 'Dashboard',
      'tasks': 'My Tasks',
      'rooms': 'My Rooms',
      'work-orders': 'Work Orders',
      'equipment': 'Equipment Issues',
      'pickups': 'Pickup Requests',
      'deliveries': 'Deliveries',
      'notifications': 'Notifications',
      'profile': 'My Profile'
    };

    const formatLabel = (segment: string) => {
      return labelMap[segment] || segment
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
    };

    // Skip 'staff' and department, start from the actual page
    // For non-department pages like /staff/profile, startIndex is 1
    const isDepartmentPage = ['housekeeping', 'maintenance', 'runner'].includes(segments[1]);
    const startIndex = isDepartmentPage ? 2 : 1;

    for (let i = startIndex; i < segments.length; i++) {
      const segment = segments[i];
      // Skip numeric segments (IDs)
      if (!isNaN(Number(segment))) continue;

      items.push({
        label: formatLabel(segment),
        path: i === segments.length - 1 ? null : '/' + segments.slice(0, i + 1).join('/')
      });
    }

    return items;
  };

  const breadcrumbItems = getBreadcrumbItems();
  const basePath = `/staff/${department}`;

  // Check if on main dashboard
  const isMainDashboard = location.pathname === basePath ||
                          location.pathname === `${basePath}/` ||
                          location.pathname === `${basePath}/dashboard`;

  return (
    <header className="h-14 bg-white border-b border-neutral-100 flex items-center justify-between px-6">
      {/* Left Section: Breadcrumb Navigation */}
      <nav className="flex items-center gap-2" aria-label="Breadcrumb">
        {isMainDashboard ? (
          <h1 className="text-lg font-semibold tracking-tight text-neutral-900">
            Dashboard
          </h1>
        ) : (
          <>
            {/* Home Icon */}
            <Link
              to={`${basePath}/dashboard`}
              className="flex items-center justify-center w-8 h-8 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-all duration-200"
            >
              <Home className="w-[18px] h-[18px]" strokeWidth={1.75} />
            </Link>

            {breadcrumbItems.length > 0 && (
              <ChevronRight className="w-4 h-4 text-neutral-300" />
            )}

            {breadcrumbItems.map((item, index) => {
              const isLastItem = index === breadcrumbItems.length - 1;
              const isClickable = !isLastItem && item.path;

              return (
                <div key={index} className="flex items-center gap-2">
                  {index > 0 && (
                    <ChevronRight className="w-4 h-4 text-neutral-300" />
                  )}
                  {isClickable ? (
                    <Link
                      to={item.path!}
                      className="text-sm font-medium px-2 py-1 rounded-lg text-neutral-500 hover:text-neutral-800 hover:bg-neutral-100 transition-all duration-200"
                    >
                      {item.label}
                    </Link>
                  ) : (
                    <span className={`px-1 ${
                      isLastItem
                        ? 'text-base font-semibold text-neutral-900'
                        : 'text-sm font-medium text-neutral-400'
                    }`}>
                      {item.label}
                    </span>
                  )}
                </div>
              );
            })}
          </>
        )}
      </nav>

      {/* Right Section: Actions */}
      <div className="flex items-center gap-2">
        {/* Notifications */}
        <button
          onClick={toggleNotificationDrawer}
          className="relative flex items-center justify-center w-10 h-10 rounded-xl text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-all duration-200"
          title="Notifications"
        >
          <Bell className="w-5 h-5" strokeWidth={1.75} />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 w-4 h-4 flex items-center justify-center text-[10px] font-bold rounded-full bg-terra-500 text-white">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>
      </div>
    </header>
  );
}
