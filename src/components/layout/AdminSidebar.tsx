import { NavLink, useLocation } from 'react-router-dom';
import { useEffect, useMemo, useState, useRef, useCallback } from 'react';
import { ChevronDown, Command, Search, X } from 'lucide-react';
import { cn } from '../../lib/utils';
import { adminNavCategories } from '../navigation/adminNav';
import GlimmoraLogo from '../../Assets/G white logo.svg';
import { Input } from '../ui2/Input';
import { IconButton } from '../ui2/IconButton';

export function AdminSidebar({ collapsed, onToggleCollapsed, mobileOpen, onCloseMobile }) {
  const location = useLocation();
  const [expanded, setExpanded] = useState({});
  const [q, setQ] = useState('');
  const [focused, setFocused] = useState(false);
  const activeCategoryRef = useRef(null);
  const navContainerRef = useRef(null);

  // Find the active category based on current path
  const activeCategory = useMemo(() => {
    return adminNavCategories.find((cat) =>
      cat.items.some((item) => location.pathname === item.to || location.pathname.startsWith(item.to + '/'))
    );
  }, [location.pathname]);

  // Scroll to active category
  const scrollToActiveCategory = useCallback(() => {
    if (activeCategoryRef.current && navContainerRef.current) {
      // Use setTimeout to ensure the DOM has updated after expansion
      setTimeout(() => {
        activeCategoryRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        });
      }, 100);
    }
  }, []);

  // Auto-expand active category and scroll to it
  useEffect(() => {
    if (activeCategory) {
      setExpanded((prev) => ({ ...prev, [activeCategory.id]: true }));
      scrollToActiveCategory();
    }
  }, [location.pathname, activeCategory, scrollToActiveCategory]);

  // Scroll to active category when mobile menu opens
  useEffect(() => {
    if (mobileOpen && activeCategory) {
      scrollToActiveCategory();
    }
  }, [mobileOpen, activeCategory, scrollToActiveCategory]);

  const categories = useMemo(() => {
    if (!q.trim()) return adminNavCategories;
    const qq = q.toLowerCase();
    return adminNavCategories
      .map((cat) => ({
        ...cat,
        items: cat.items.filter((item) => item.name.toLowerCase().includes(qq) || cat.name.toLowerCase().includes(qq)),
      }))
      .filter((cat) => cat.items.length > 0);
  }, [q]);

  const aside = (
    <aside
      className={cn(
        'h-full flex flex-col',
        'bg-white',
        'border-r border-neutral-200/60',
        'transition-[width] duration-300 ease-out',
        collapsed ? 'w-[84px]' : 'w-[280px]'
      )}
    >
      {/* Brand */}
      <div className="h-16 px-4 flex items-center justify-between border-b border-neutral-100">
        <div className={cn('flex items-center gap-3 min-w-0', collapsed && 'justify-center w-full')}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary via-primary-600 to-primary-700 flex items-center justify-center flex-shrink-0 shadow-sm">
            <img src={GlimmoraLogo} alt="Glimmora" className="w-5 h-5 object-contain" />
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <div className="text-base font-semibold text-neutral-900 leading-tight truncate tracking-tight">Glimmora</div>
              <div className="text-[10px] font-medium uppercase tracking-widest text-neutral-400 mt-0.5">
                Hotel Ops
              </div>
            </div>
          )}
        </div>
        {!collapsed && (
          <IconButton
            aria-label="Collapse sidebar"
            variant="subtle"
            size="sm"
            onClick={onToggleCollapsed}
            title="Collapse"
            className="hover:bg-neutral-100"
          >
            <ChevronDown className="w-4 h-4 rotate-90 text-neutral-400" />
          </IconButton>
        )}
        {collapsed && (
          <IconButton
            aria-label="Expand sidebar"
            variant="subtle"
            size="sm"
            onClick={onToggleCollapsed}
            title="Expand"
            className="hover:bg-neutral-100"
          >
            <ChevronDown className="w-4 h-4 -rotate-90 text-neutral-400" />
          </IconButton>
        )}
      </div>

      {/* Search */}
      {!collapsed && (
        <div className="px-4 py-3">
          <div
            className={cn(
              'relative rounded-lg border transition-all duration-200',
              focused ? 'border-primary/40 ring-2 ring-primary/8 bg-white shadow-sm' : 'border-neutral-200 bg-neutral-50 hover:bg-neutral-100/80'
            )}
          >
            <Search className={cn('absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors', focused ? 'text-primary' : 'text-neutral-400')} />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              placeholder="Search..."
              className="h-9 border-0 bg-transparent pl-9 pr-14 text-sm focus-visible:ring-0 focus-visible:ring-offset-0"
            />
            {q ? (
              <IconButton
                aria-label="Clear search"
                size="sm"
                className="absolute right-2 top-1/2 -translate-y-1/2"
                onClick={() => setQ('')}
              >
                <X className="w-4 h-4 text-neutral-500" />
              </IconButton>
            ) : (
              <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-0.5 px-1.5 py-0.5 rounded border border-neutral-200 bg-white text-[10px] font-medium text-neutral-400">
                <Command className="w-3 h-3" />
                <span>K</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Nav */}
      <nav ref={navContainerRef} className={cn('flex-1 overflow-y-auto sidebar-scrollbar', collapsed ? 'px-2 py-4' : 'px-4 py-3')}>
        <div className={cn('space-y-5', collapsed && 'space-y-4')}>
          {categories.map((cat, catIndex) => {
            const isSingle = cat.items.length === 1;
            const isOpen = expanded[cat.id] !== false;
            const CatIcon = cat.icon;
            const hasActive = cat.items.some(
              (item) => location.pathname === item.to || location.pathname.startsWith(item.to + '/')
            );

            // Check if this is the active category
            const isActiveCategory = activeCategory?.id === cat.id;

            return (
              <div key={cat.id} ref={isActiveCategory ? activeCategoryRef : null}>
                {/* Category header */}
                {!collapsed && !isSingle && (
                  <button
                    onClick={() => setExpanded((p) => ({ ...p, [cat.id]: !isOpen }))}
                    className={cn(
                      'w-full flex items-center gap-2.5 px-2 py-1.5 mb-1.5',
                      'transition-colors duration-200',
                      'hover:bg-neutral-50 rounded-lg',
                      hasActive ? 'text-neutral-800' : 'text-neutral-500'
                    )}
                  >
                    <div
                      className={cn(
                        'w-6 h-6 rounded-md flex items-center justify-center',
                        hasActive ? 'bg-primary/10 text-primary' : 'bg-neutral-100 text-neutral-400'
                      )}
                    >
                      <CatIcon className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-[10px] font-semibold uppercase tracking-[0.1em] flex-1 text-left text-neutral-400">
                      {cat.shortName || cat.name}
                    </span>
                    <ChevronDown className={cn('w-3.5 h-3.5 text-neutral-300 transition-transform duration-200', isOpen ? 'rotate-0' : '-rotate-90')} />
                  </button>
                )}

                {/* Nav items */}
                <div className={cn(!collapsed && !isSingle && 'ml-1', (!isOpen && !collapsed && !isSingle) && 'hidden')}>
                  <ul className={cn('space-y-0.5', collapsed && 'space-y-1.5')}>
                    {cat.items.map((item) => {
                      const Icon = item.icon;
                      return (
                        <li key={item.to} className="relative group">
                          <NavLink
                            to={item.to}
                            end={item.to === '/admin/dashboard'}
                            onClick={() => {
                              if (mobileOpen) onCloseMobile?.();
                            }}
                            className={({ isActive }) =>
                              cn(
                                'flex items-center rounded-lg',
                                'transition-all duration-200',
                                collapsed ? 'justify-center h-10' : 'gap-2.5 h-9 px-2.5',
                                isActive
                                  ? 'bg-primary/8 text-primary font-medium'
                                  : 'bg-transparent text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900'
                              )
                            }
                          >
                            {({ isActive }) => (
                              <>
                                <div
                                  className={cn(
                                    'flex items-center justify-center flex-shrink-0',
                                    collapsed ? 'w-8 h-8 rounded-lg' : 'w-6 h-6 rounded-md',
                                    isActive
                                      ? 'bg-primary/10 text-primary'
                                      : collapsed
                                        ? 'bg-neutral-100 text-neutral-500 group-hover:bg-neutral-200 group-hover:text-neutral-700'
                                        : 'text-neutral-400 group-hover:text-neutral-600'
                                  )}
                                >
                                  <Icon className={cn(collapsed ? 'w-4 h-4' : 'w-4 h-4')} />
                                </div>
                                {!collapsed && (
                                  <span className={cn('text-[13px] flex-1', isActive ? 'font-medium' : 'font-normal')}>
                                    {item.name}
                                  </span>
                                )}
                                {/* Active indicator */}
                                {isActive && !collapsed && (
                                  <div className="w-1 h-4 bg-primary rounded-full" />
                                )}
                              </>
                            )}
                          </NavLink>

                          {/* Tooltip (collapsed mode) */}
                          {collapsed && (
                            <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-2.5 py-1.5 rounded-lg bg-neutral-900 text-white text-xs font-medium shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150 whitespace-nowrap z-50">
                              {item.name}
                              <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-neutral-900" />
                            </div>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                </div>

                {/* Section divider */}
                {!collapsed && catIndex < categories.length - 1 && (
                  <div className="mt-4 border-b border-neutral-100" />
                )}
              </div>
            );
          })}
        </div>
      </nav>
    </aside>
  );

  // Mobile overlay wrapper (only shown below tablet breakpoint: < 744px)
  if (!mobileOpen) return aside;

  return (
    <div className="fixed inset-0 z-50 tablet:hidden">
      <div className="absolute inset-0 bg-neutral-900/30 backdrop-blur-sm" onClick={onCloseMobile} />
      <div className="absolute left-0 top-0 bottom-0 shadow-xl animate-fade-slide-down">{aside}</div>
    </div>
  );
}



