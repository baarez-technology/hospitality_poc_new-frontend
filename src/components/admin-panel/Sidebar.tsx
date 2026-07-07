import { useMemo } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  CalendarCheck,
  Users,
  BedDouble,
  UserCheck,
  ClipboardCheck,
  Wrench,
  Package,
  BarChart3,
  MessageSquare,
  Contact,
  Settings,
  Sparkles,
  FileText,
  Brain,
} from 'lucide-react';
import GlimmoraLogo from '../../assets/G white logo.svg';
import { useSettingsContext } from '../../contexts/SettingsContext';
import { useAuth } from '../../hooks';
import { ROUTE_MODULE_MAP, canViewModule, DEFAULT_PERMISSIONS } from '../../config/rolePermissions';
import type { PermissionMap, StaffRole } from '../../config/rolePermissions';

const navCategories = [
  {
    name: 'Overview',
    items: [
      { name: 'Dashboard', icon: LayoutDashboard, to: '/admin' },
    ]
  },
  {
    name: 'Operations',
    items: [
      { name: 'Bookings', icon: CalendarCheck, to: '/admin/bookings' },
      { name: 'Guests', icon: Users, to: '/admin/guests' },
      { name: 'Rooms', icon: BedDouble, to: '/admin/rooms' },
      { name: 'Staff', icon: UserCheck, to: '/admin/staff' },
      { name: 'Housekeeping', icon: ClipboardCheck, to: '/admin/housekeeping' },
      { name: 'Maintenance', icon: Wrench, to: '/admin/maintenance' },
      { name: 'Runner', icon: Package, to: '/admin/runner' },
    ]
  },
  {
    name: 'AI Intelligence',
    items: [
      { name: 'Revenue AI', icon: BarChart3, to: '/admin/revenue' },
      { name: 'Reputation AI', icon: MessageSquare, to: '/admin/ai/reputation' },
      { name: 'CRM AI', icon: Contact, to: '/admin/ai/crm' },
      { name: 'ReConnect AI', icon: Brain, to: '/admin/ai/crm-dashboard' },
    ]
  },
  {
    name: 'Analytics',
    items: [
      { name: 'Reports', icon: FileText, to: '/admin/reports' },
    ]
  },
  {
    name: 'System',
    items: [
      { name: 'Settings', icon: Settings, to: '/admin/settings' },
    ]
  }
];

const Sidebar = () => {
  const { generalSettings } = useSettingsContext();
  const hotelName = generalSettings?.hotelName || 'Hotel Management';
  const customLogo = generalSettings?.branding?.logo;
  const { user } = useAuth();

  // Get user permissions - from user object, or derive from role defaults
  const userPermissions: PermissionMap | undefined = useMemo(() => {
    if (user?.permissions) return user.permissions as PermissionMap;
    if (user?.isSuperuser) return DEFAULT_PERMISSIONS.admin;
    if (user?.role && user.role in DEFAULT_PERMISSIONS) {
      return DEFAULT_PERMISSIONS[user.role as StaffRole];
    }
    // If no role match, show everything (admin access)
    return DEFAULT_PERMISSIONS.admin;
  }, [user]);

  return (
    <div className="h-full bg-gradient-to-b from-white via-[#FAF8F6]/30 to-white border-r border-[#A57865]/20 flex flex-col shadow-sm">
      {/* Brand */}
      <div className="p-6 border-b border-[#A57865]/20 flex-shrink-0">
        <div className="flex items-center gap-3 group cursor-pointer">
          {customLogo ? (
            <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-105 group-hover:rotate-3 transition-all duration-300 overflow-hidden bg-white border border-neutral-200 shadow-md">
              <img src={customLogo} alt={hotelName} className="w-full h-full object-contain" />
            </div>
          ) : (
            <div className="w-12 h-12 bg-gradient-to-br from-[#A57865] via-[#8E6554] to-[#A57865] rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-105 group-hover:rotate-3 transition-all duration-300 p-2 shadow-md">
              <img src={GlimmoraLogo} alt="Hotel Management Logo" className="w-full h-full object-contain" />
            </div>
          )}
          <div>
            <h1 className="text-2xl font-serif font-bold bg-gradient-to-r from-neutral-800 to-[#A57865] bg-clip-text text-transparent group-hover:from-[#A57865] group-hover:to-[#8E6554] transition-all duration-300">
              {hotelName}
            </h1>
            <p className="text-xs text-neutral-500 font-medium">Admin Portal</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-6 overflow-y-auto custom-scrollbar">
        {navCategories.map((category) => {
          // Filter items by user permissions
          const visibleItems = category.items.filter(item => {
            const module = ROUTE_MODULE_MAP[item.to];
            if (!module) return true; // No mapping = always show
            return canViewModule(userPermissions, module);
          });

          // Don't render empty categories
          if (visibleItems.length === 0) return null;

          return (
            <div key={category.name}>
              {/* Category Header */}
              <div className="px-3 mb-2">
                <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-wider">
                  {category.name}
                </h3>
              </div>

              {/* Category Items */}
              <ul className="space-y-1">
                {visibleItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <li key={item.to}>
                      <NavLink
                        to={item.to}
                        end={item.to === '/admin'}
                        className={({ isActive }) =>
                          `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ease-out group relative overflow-hidden ${
                            isActive
                              ? 'bg-gradient-to-r from-[#A57865]/10 to-[#A57865]/5 text-[#A57865] font-semibold shadow-sm'
                              : 'text-neutral-600 hover:bg-gradient-to-r hover:from-[#A57865]/5 hover:to-transparent hover:text-[#A57865] hover:shadow-sm'
                          }`
                        }
                      >
                        {({ isActive }) => (
                          <>
                            {/* Active indicator */}
                            {isActive && (
                              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-[#A57865] to-[#8E6554] rounded-r-full"></div>
                            )}

                            <Icon className={`w-5 h-5 flex-shrink-0 transition-all duration-300 ${
                              isActive ? 'scale-110' : 'group-hover:scale-110 group-hover:rotate-6'
                            }`} />
                            <span className="text-sm transition-all duration-300">{item.name}</span>

                            {/* Hover effect */}
                            {!isActive && (
                              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-[#A57865]/5 to-transparent"></div>
                              </div>
                            )}
                          </>
                        )}
                      </NavLink>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-[#A57865]/20 flex-shrink-0 bg-gradient-to-b from-transparent to-[#FAF8F6]/50">
        <div className="relative p-4 bg-gradient-to-br from-white to-[#FAF8F6] rounded-xl shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer group border border-[#A57865]/20 hover:border-[#A57865]/40 overflow-hidden">
          {/* Animated background */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#A57865]/5 via-[#CDB261]/5 to-[#5C9BA4]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

          <div className="relative flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-[#4E5840] via-[#5C9BA4] to-[#4E5840] rounded-xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-12 transition-all duration-300 shadow-sm">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-neutral-800 group-hover:text-[#4E5840] transition-colors">AI Systems</p>
              <div className="flex items-center gap-2">
                <div className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </div>
                <p className="text-xs text-neutral-600 font-medium">All Online</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
