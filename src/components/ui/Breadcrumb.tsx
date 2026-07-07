/**
 * Breadcrumb Component
 * Luxury breadcrumb navigation for CMS pages
 */

import { ChevronRight, Home } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';

export default function Breadcrumb({ items = [], className = '' }) {
  const { isDark } = useTheme();
  const location = useLocation();

  // If no items provided, generate from current path
  const breadcrumbItems = items.length > 0 ? items : generateFromPath(location.pathname);

  return (
    <nav
      className={`flex items-center gap-2 ${className}`}
      aria-label="Breadcrumb"
    >
      <ol className="flex items-center gap-2">
        {/* Home Link */}
        <li>
          <Link
            to="/admin"
            className={`flex items-center gap-1.5 px-2 py-1 rounded-lg text-sm font-medium transition-all duration-200 ${
              isDark
                ? 'text-white/50 hover:text-white hover:bg-white/[0.05]'
                : 'text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100'
            }`}
          >
            <Home className="w-4 h-4" />
          </Link>
        </li>

        {/* Breadcrumb Items */}
        {breadcrumbItems.map((item, index) => {
          const isLast = index === breadcrumbItems.length - 1;

          return (
            <li key={index} className="flex items-center gap-2">
              {/* Separator */}
              <ChevronRight
                className={`w-4 h-4 ${
                  isDark ? 'text-white/20' : 'text-neutral-300'
                }`}
              />

              {/* Breadcrumb Link or Text */}
              {!item.href ? (
                <span
                  className={`px-2 py-1 text-sm ${isLast ? 'font-semibold' : 'font-medium'} rounded-lg ${
                    isLast
                      ? isDark
                        ? 'text-[#CDB261]'
                        : 'text-[#A57865]'
                      : isDark
                        ? 'text-white/50'
                        : 'text-neutral-500'
                  }`}
                  aria-current={isLast ? 'page' : undefined}
                >
                  {item.label}
                </span>
              ) : (
                <Link
                  to={item.href}
                  className={`px-2 py-1 text-sm font-medium rounded-lg transition-all duration-200 ${
                    isDark
                      ? 'text-white/50 hover:text-white hover:bg-white/[0.05]'
                      : 'text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100'
                  }`}
                >
                  {item.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

/**
 * Generate breadcrumb items from URL path
 */
function generateFromPath(pathname) {
  const segments = pathname.split('/').filter(Boolean);
  const items = [];

  // Map of URL segments to readable labels
  const labelMap = {
    admin: 'Admin',
    cms: 'CMS',
    cbs: 'Central Management',
    bookings: 'Bookings',
    calendar: 'Calendar',
    'rate-plans': 'Rate Plans',
    rateplans: 'Rate Plans',
    promotions: 'Promotions',
    revenue: 'Revenue',
    inventory: 'Inventory',
    'channel-manager': 'Channel Manager',
    reports: 'Reports',
    settings: 'Settings',
  };

  let currentPath = '';

  // Skip 'admin' in the breadcrumb trail as it's represented by the home icon
  const startIndex = segments[0] === 'admin' ? 1 : 0;

  for (let i = startIndex; i < segments.length; i++) {
    const segment = segments[i];
    currentPath += `/${segment}`;

    // Skip dynamic segments (e.g., IDs)
    if (!isNaN(segment)) continue;

    items.push({
      label: labelMap[segment] || formatLabel(segment),
      href: `/admin${currentPath}`,
    });
  }

  return items;
}

/**
 * Format a URL segment into a readable label
 */
function formatLabel(segment) {
  return segment
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}
