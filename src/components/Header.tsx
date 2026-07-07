import {
  Bell,
  Sparkles,
  LogOut,
  UserCircle,
  Sun,
  Moon,
  ChevronRight,
  Home,
  Menu
} from 'lucide-react';
import { useState, useRef, useEffect, useCallback } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useLocation, Link } from 'react-router-dom';
import { cn } from '../lib/utils';
import { NotificationsDrawer } from './notifications/NotificationsDrawer';
import { useAuth } from '@/hooks/useAuth';
import { notificationsService } from '@/api/services/notifications.service';

/**
 * Glimmora Design System v4.0 - Header
 * Top navigation bar with breadcrumbs and actions
 * "Warm Enterprise" aesthetic - clean borders, no shadows
 */

const Header = ({ onAIPanelToggle, onSidebarToggle, isSidebarCollapsed, onMobileMenuToggle }) => {
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const { theme, toggleTheme, isDark } = useTheme();
  const location = useLocation();
  const profileMenuRef = useRef(null);
  const { user, logout } = useAuth();

  // Dynamic user info
  const userName = user?.fullName || 'User';
  const userFirstName = userName.split(' ')[0];
  const userEmail = user?.email || '';
  const userRole = user?.role ? user.role.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) : 'Admin';
  const userInitials = userName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  const handleLogout = () => {
    setIsProfileMenuOpen(false);
    logout();
  };

  // Fetch initial unread count
  const fetchUnreadCount = useCallback(async () => {
    try {
      const result = await notificationsService.getUnreadCount();
      setUnreadCount(result.unread_count);
    } catch (err) {
      console.error('Failed to fetch unread count:', err);
    }
  }, []);

  // Fetch unread count on mount
  useEffect(() => {
    fetchUnreadCount();
  }, [fetchUnreadCount]);

  // Handle unread count updates from drawer
  const handleUnreadCountChange = useCallback((count: number) => {
    setUnreadCount(count);
  }, []);

  // Listen for custom event to open notifications from other components (e.g. Dashboard quick action)
  useEffect(() => {
    const openNotifications = () => setIsNotificationsOpen(true);
    window.addEventListener('glimmora:open-notifications', openNotifications);
    return () => window.removeEventListener('glimmora:open-notifications', openNotifications);
  }, []);

  // Close menus on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target)) {
        setIsProfileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Generate breadcrumb items from current path
  const getBreadcrumbItems = () => {
    const segments = location.pathname.split('/').filter(Boolean);
    const items = [];

    // Section headings (these are parent categories in sidebar)
    // When these are the last segment, "Dashboard" is added as current page
    const sectionMap = {
      'channel-manager': 'Channels',
      'revenue': 'Revenue',
      'cms': 'CMS',
      'cbs': 'Central Booking',
      'ai': 'AI Tools',
    };

    // Pages that should show a parent section (for direct routes under /admin)
    // { label, path } - path is clickable if provided
    const parentSectionMap = {
      'bookings': { label: 'Operations', path: null },
      'guests': { label: 'Operations', path: null },
      'rooms': { label: 'Operations', path: null },
      'staff': { label: 'Operations', path: null },
      'housekeeping': { label: 'Operations', path: null },
      'maintenance': { label: 'Operations', path: null },
      'analytics': { label: 'Reports', path: '/admin/reports' },
    };

    // Label mapping for individual pages/sub-menus
    const labelMap = {
      // CMS sub-pages
      'bookings': 'Bookings',
      'availability': 'Availability',
      'rate-plans': 'Rate Plans',
      'promotions': 'Promotions',

      // Channel Manager sub-pages
      'ota': 'OTA Connections',
      'mapping': 'Room Mapping',
      'rate-sync': 'Rate Sync',
      'restrictions': 'Restrictions',
      'logs': 'Sync Logs',

      // Revenue sub-pages
      'calendar': 'Rate Calendar',
      'pickup': 'Pickup Analysis',
      'forecast': 'Demand Forecast',
      'competitors': 'Competitors',
      'segments': 'Segmentation',
      'pricing': 'Pricing Rules',
      'ai': 'Revenue AI',

      // AI Tools sub-pages
      'reputation': 'Reputation AI',
      'crm': 'CRM AI',

      // Operations (direct pages under /admin)
      'rooms': 'Rooms',
      'guests': 'Guests',
      'staff': 'Staff',
      'housekeeping': 'Housekeeping',
      'maintenance': 'Maintenance',

      // Other standalone pages
      'dashboard': 'Dashboard',
      'reports': 'Reports',
      'settings': 'Settings',
    };

    const formatLabel = (segment) => {
      return labelMap[segment] || segment
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
    };

    // Skip 'admin' as it's represented by Home
    const startIndex = segments[0] === 'admin' ? 1 : 0;

    for (let i = startIndex; i < segments.length; i++) {
      const segment = segments[i];
      // Skip numeric segments (IDs)
      if (!isNaN(segment)) continue;

      // Check if this segment is a section (parent category)
      if (sectionMap[segment]) {
        // Add the section heading (NOT clickable - just a label)
        items.push({
          label: sectionMap[segment],
          path: null
        });

        // If this is the last segment, add "Dashboard" as the current page
        if (i === segments.length - 1) {
          items.push({
            label: 'Dashboard',
            path: null
          });
        }
      } else {
        // Check if this page needs a parent section added first
        // Only apply for direct routes under /admin (i.e., first segment after admin)
        if (parentSectionMap[segment] && i === startIndex) {
          items.push({
            label: parentSectionMap[segment].label,
            path: parentSectionMap[segment].path // Can be null or a clickable path
          });
        }

        items.push({
          label: formatLabel(segment),
          path: '/' + segments.slice(0, i + 1).join('/')
        });
      }
    }

    return items;
  };

  const breadcrumbItems = getBreadcrumbItems();

  // Action button component for consistency
  const ActionButton = ({ icon: Icon, label, onClick, active, badge, className }) => (
    <button
      onClick={onClick}
      title={label}
      className={cn(
        'relative flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-200',
        isDark
          ? 'text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800/80'
          : 'text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100/80',
        active && (isDark
          ? 'text-terra-400 bg-terra-500/10'
          : 'text-terra-600 bg-terra-50'),
        className
      )}
    >
      <Icon className="w-5 h-5" strokeWidth={1.75} />
      {badge && (
        <span className={cn(
          'absolute top-1 right-1 w-4 h-4 flex items-center justify-center text-[10px] font-bold rounded-full',
          isDark
            ? 'bg-rose-500 text-white'
            : 'bg-rose-500 text-white'
        )}>
          {badge}
        </span>
      )}
    </button>
  );

  return (
    <header className={cn(
      'relative z-40 transition-all duration-300',
      isDark
        ? 'bg-neutral-950 border-b border-neutral-800'
        : 'bg-white border-b border-neutral-100'
    )}>
      <div className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4">
        <div className="flex items-center justify-between">
          {/* Left Section: Mobile Menu + Breadcrumb Navigation */}
          <div className="flex items-center gap-1 sm:gap-2 min-w-0 flex-1">
            {/* Mobile Menu Toggle */}
            <button
              onClick={onMobileMenuToggle}
              className={cn(
                'lg:hidden flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-xl transition-all duration-200 flex-shrink-0',
                isDark
                  ? 'text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800/80'
                  : 'text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100/80'
              )}
              aria-label="Toggle mobile menu"
            >
              <Menu className="w-5 h-5" strokeWidth={1.75} />
            </button>

            <nav className="flex items-center gap-1 sm:gap-2 min-w-0" aria-label="Breadcrumb">
              {/* Check if on main dashboard - only show heading, no Home icon */}
              {(location.pathname === '/admin' || location.pathname === '/admin/dashboard') ? (
              <h1 className={cn(
                'text-base sm:text-lg font-semibold tracking-tight truncate',
                isDark ? 'text-neutral-100' : 'text-neutral-900'
              )}>
                Dashboard
              </h1>
            ) : (
              <>
                {/* Home Icon - hidden on mobile */}
                <Link
                  to="/admin"
                  className={cn(
                    'hidden sm:flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-200',
                    isDark
                      ? 'text-neutral-500 hover:text-neutral-100 hover:bg-neutral-800'
                      : 'text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100'
                  )}
                >
                  <Home className="w-[18px] h-[18px]" strokeWidth={1.75} />
                </Link>

                {breadcrumbItems.length > 0 && (
                  <ChevronRight className={cn(
                    'hidden sm:block w-4 h-4',
                    isDark ? 'text-neutral-600' : 'text-neutral-300'
                  )} />
                )}

                {/* On mobile, show only the last breadcrumb item as page title */}
                <span className={cn(
                  'sm:hidden text-base font-semibold truncate',
                  isDark ? 'text-neutral-100' : 'text-neutral-900'
                )}>
                  {breadcrumbItems.length > 0 ? breadcrumbItems[breadcrumbItems.length - 1].label : 'Dashboard'}
                </span>

                {/* On desktop, show full breadcrumb */}
                {breadcrumbItems.map((item, index) => {
                  const isLastItem = index === breadcrumbItems.length - 1;
                  const isClickable = !isLastItem && item.path;

                  return (
                    <div key={index} className="hidden sm:flex items-center gap-2">
                      {index > 0 && (
                        <ChevronRight className={cn(
                          'w-4 h-4',
                          isDark ? 'text-neutral-600' : 'text-neutral-300'
                        )} />
                      )}
                      {isClickable ? (
                        <Link
                          to={item.path}
                          className={cn(
                            'text-sm font-medium px-2 py-1 rounded-lg transition-all duration-200',
                            isDark
                              ? 'text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800'
                              : 'text-neutral-500 hover:text-neutral-800 hover:bg-neutral-100'
                          )}
                        >
                          {item.label}
                        </Link>
                      ) : (
                        <span className={cn(
                          'px-1',
                          isLastItem
                            ? (isDark ? 'text-base font-semibold text-neutral-100' : 'text-base font-semibold text-neutral-900')
                            : (isDark ? 'text-sm font-medium text-neutral-500' : 'text-sm font-medium text-neutral-400')
                        )}>
                          {item.label}
                        </span>
                      )}
                    </div>
                  );
                })}
              </>
            )}
            </nav>
          </div>

          {/* Right Section: Actions */}
          <div className="flex items-center gap-1 flex-shrink-0">
            {/* Action Buttons Group */}
            <div className={cn(
              'flex items-center gap-0.5 sm:gap-1 p-0.5 sm:p-1 rounded-xl',
              isDark ? 'bg-neutral-900/50' : 'bg-neutral-50/80'
            )}>
              {/* AI Assistant */}
              <ActionButton
                icon={Sparkles}
                label="AI Assistant"
                onClick={onAIPanelToggle}
                className={isDark
                  ? 'text-amber-400 hover:text-amber-300 hover:bg-amber-500/15'
                  : 'text-terra-500 hover:text-terra-600 hover:bg-terra-50'}
              />

              {/* Notifications */}
              <ActionButton
                icon={Bell}
                label="Notifications"
                onClick={() => setIsNotificationsOpen(true)}
                badge={unreadCount > 0 ? String(unreadCount) : undefined}
              />
            </div>

            {/* Divider - hidden on mobile */}
            <div className={cn(
              'hidden sm:block w-px h-8 mx-1 sm:mx-2',
              isDark ? 'bg-neutral-800' : 'bg-neutral-200'
            )} />

            {/* Profile */}
            <div className="relative" ref={profileMenuRef}>
              <button
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                className={cn(
                  'flex items-center gap-2 sm:gap-3 p-0.5 sm:pl-1 sm:pr-3 sm:py-1 rounded-xl transition-all duration-200',
                  isDark
                    ? 'hover:bg-neutral-800/80'
                    : 'hover:bg-neutral-100/80',
                  isProfileMenuOpen && (isDark
                    ? 'bg-neutral-800'
                    : 'bg-neutral-100')
                )}
              >
                <div className={cn(
                  'w-8 h-8 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl overflow-hidden ring-2 ring-offset-1 sm:ring-offset-2 transition-all',
                  isDark
                    ? 'ring-neutral-700 ring-offset-neutral-950'
                    : 'ring-neutral-200 ring-offset-white',
                  isProfileMenuOpen && (isDark
                    ? 'ring-terra-500/50'
                    : 'ring-terra-300')
                )}>
                  {user?.avatar ? (
                    <img src={user.avatar} alt={userName} className="w-full h-full object-cover" />
                  ) : (
                    <div className={cn(
                      'w-full h-full flex items-center justify-center',
                      isDark ? 'bg-terra-800' : 'bg-terra-100'
                    )}>
                      <span className={cn(
                        'text-xs font-bold',
                        isDark ? 'text-terra-300' : 'text-terra-700'
                      )}>{userInitials}</span>
                    </div>
                  )}
                </div>
                <div className="hidden md:block text-left">
                  <p className={cn(
                    'text-sm font-semibold leading-tight',
                    isDark ? 'text-neutral-100' : 'text-neutral-900'
                  )}>
                    {userFirstName}
                  </p>
                  <p className={cn(
                    'text-xs leading-tight',
                    isDark ? 'text-neutral-500' : 'text-neutral-500'
                  )}>
                    {userRole}
                  </p>
                </div>
              </button>

              {/* Profile Dropdown Menu */}
              {isProfileMenuOpen && (
                <div className={cn(
                  'absolute right-0 top-full mt-3 w-72 rounded-2xl border overflow-hidden shadow-xl shadow-neutral-900/10 animate-scaleIn origin-top-right z-[200]',
                  isDark
                    ? 'bg-neutral-900 border-neutral-800'
                    : 'bg-white border-neutral-200'
                )}>
                  {/* User Info Header */}
                  <div className={cn(
                    'px-5 py-5 border-b',
                    isDark ? 'border-neutral-800' : 'border-neutral-100'
                  )}>
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        'w-14 h-14 rounded-2xl overflow-hidden ring-2 ring-offset-2',
                        isDark
                          ? 'ring-neutral-700 ring-offset-neutral-900'
                          : 'ring-neutral-200 ring-offset-white'
                      )}>
                        {user?.avatar ? (
                          <img src={user.avatar} alt={userName} className="w-full h-full object-cover" />
                        ) : (
                          <div className={cn(
                            'w-full h-full flex items-center justify-center',
                            isDark ? 'bg-terra-800' : 'bg-terra-100'
                          )}>
                            <span className={cn(
                              'text-lg font-bold',
                              isDark ? 'text-terra-300' : 'text-terra-700'
                            )}>{userInitials}</span>
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={cn(
                          'text-base font-semibold truncate',
                          isDark ? 'text-neutral-100' : 'text-neutral-900'
                        )}>
                          {userName}
                        </p>
                        <p className={cn(
                          'text-sm truncate',
                          isDark ? 'text-neutral-500' : 'text-neutral-500'
                        )}>
                          {userEmail}
                        </p>
                        <span className={cn(
                          'inline-flex items-center mt-2 px-2.5 py-1 text-xs font-medium rounded-lg',
                          isDark
                            ? 'bg-terra-500/15 text-terra-400'
                            : 'bg-terra-50 text-terra-600'
                        )}>
                          {userRole}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Menu Items */}
                  <div className="p-2">
                    <Link
                      to="/admin/profile"
                      onClick={() => setIsProfileMenuOpen(false)}
                      className={cn(
                        'w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all duration-200',
                        isDark
                          ? 'text-neutral-300 hover:bg-neutral-800 hover:text-neutral-100'
                          : 'text-neutral-700 hover:bg-neutral-50 hover:text-neutral-900'
                      )}
                    >
                      <UserCircle className="w-5 h-5" strokeWidth={1.75} />
                      <span className="text-sm font-medium">View Profile</span>
                    </Link>
                  </div>

                  {/* Logout Section */}
                  <div className={cn(
                    'border-t p-2',
                    isDark ? 'border-neutral-800' : 'border-neutral-100'
                  )}>
                    <button
                      onClick={handleLogout}
                      className={cn(
                        'w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all duration-200',
                        isDark
                          ? 'text-neutral-400 hover:bg-rose-500/10 hover:text-rose-400'
                          : 'text-neutral-500 hover:bg-rose-50 hover:text-rose-600'
                      )}
                    >
                      <LogOut className="w-5 h-5" strokeWidth={1.75} />
                      <span className="text-sm font-medium">Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Notifications Drawer */}
      <NotificationsDrawer
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        onUnreadCountChange={handleUnreadCountChange}
      />
    </header>
  );
};

export default Header;
