import { NavLink, useLocation } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
import { ChevronDown, ChevronLeft, ChevronRight, Command, Search, X } from 'lucide-react';
import { cn } from '../../lib/utils';
import { adminNavCategories } from './adminNav';
import GlimmoraLogo from '../../assets/G white logo.svg';
import { Input } from '../ui2/Input';
import { IconButton } from '../ui2/Button';

export function AdminSidebar({ collapsed, onToggleCollapsed, mobileOpen, onCloseMobile }) {
  const location = useLocation();
  const [expanded, setExpanded] = useState({});
  const [q, setQ] = useState('');
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    const activeCategory = adminNavCategories.find((cat) =>
      cat.items.some((item) => location.pathname === item.to || location.pathname.startsWith(item.to + '/'))
    );
    if (activeCategory) setExpanded((prev) => ({ ...prev, [activeCategory.id]: true }));
  }, [location.pathname]);

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
        'bg-transparent',
        'border-r border-neutral-200/40',
        'transition-[width] duration-300 ease-out',
        collapsed ? 'w-[84px]' : 'w-[280px]'
      )}
    >
      {/* Brand */}
      <div className="h-14 px-3 flex items-center justify-between border-b border-neutral-200/40">
        <div className={cn('flex items-center gap-3 min-w-0', collapsed && 'justify-center w-full')}>
          <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden">
            <img src={GlimmoraLogo} alt="Glimmora" className="w-full h-full object-contain" />
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <div className="text-[15px] font-sans font-semibold text-neutral-950 leading-none truncate">Glimmora</div>
              <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-primary/70 mt-1">
                Hotel Ops
              </div>
            </div>
          )}
        </div>
        {!collapsed && (
          <IconButton
            aria-label="Collapse sidebar" icon={ChevronLeft}
            variant="subtle"
            size="sm"
            onClick={onToggleCollapsed}
            title="Collapse"
          >
          </IconButton>
        )}
        {collapsed && (
          <IconButton
            aria-label="Expand sidebar" icon={ChevronRight}
            variant="subtle"
            size="sm"
            onClick={onToggleCollapsed}
            title="Expand"
          >
          </IconButton>
        )}
      </div>

      {/* Search */}
      {!collapsed && (
        <div className="px-3 py-3">
          <div
            className={cn(
              'relative rounded-xl border transition-colors',
              focused ? 'border-primary/35 ring-2 ring-primary/10 bg-white' : 'border-neutral-200/80 bg-white/70'
            )}
          >
            <Search className={cn('absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4', focused ? 'text-primary' : 'text-neutral-400')} />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              placeholder="Search..."
              className="h-10 border-0 bg-transparent pl-9 pr-14 focus-visible:ring-0 focus-visible:ring-offset-0"
            />
            {q ? (
              <IconButton
                aria-label="Clear search" icon={X}
                size="sm"
                className="absolute right-2 top-1/2 -translate-y-1/2"
                onClick={() => setQ('')}
              >
                <X className="w-4 h-4 text-neutral-500" />
              </IconButton>
            ) : (
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 px-1.5 py-0.5 rounded-md border border-neutral-200 bg-white text-[10px] font-semibold text-neutral-400">
                <Command className="w-3 h-3" />
                <span>K</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Nav */}
      <nav className={cn('flex-1 overflow-y-auto sidebar-scrollbar', collapsed ? 'px-2 py-3' : 'px-3 py-2')}>
        <div className={cn('space-y-2', collapsed && 'space-y-3')}>
          {categories.map((cat) => {
            const isSingle = cat.items.length === 1;
            const isOpen = expanded[cat.id] !== false;
            const CatIcon = cat.icon;
            const hasActive = cat.items.some(
              (item) => location.pathname === item.to || location.pathname.startsWith(item.to + '/')
            );

            return (
              <div key={cat.id}>
                {!collapsed && !isSingle && (
                  <button
                    onClick={() => setExpanded((p) => ({ ...p, [cat.id]: !isOpen }))}
                    className={cn(
                      'w-full flex items-center gap-2 px-2 py-2 rounded-xl',
                      'transition-colors duration-200',
                      'hover:bg-neutral-100/70',
                      hasActive ? 'text-neutral-900' : 'text-neutral-500'
                    )}
                  >
                    <div
                      className={cn(
                        'w-7 h-7 rounded-lg flex items-center justify-center border',
                        hasActive ? 'bg-primary/10 border-primary/20 text-primary' : 'bg-white/50 border-neutral-200/40 text-neutral-500'
                      )}
                    >
                      <CatIcon className="w-4 h-4" />
                    </div>
                    <span className="text-[11px] font-bold uppercase tracking-[0.16em] flex-1 text-left">
                      {cat.shortName || cat.name}
                    </span>
                    <ChevronDown className={cn('w-4 h-4 transition-transform', isOpen ? 'rotate-0' : '-rotate-90')} />
                  </button>
                )}

                <div className={cn('mt-1', !collapsed && !isSingle && 'pl-2', (!isOpen && !collapsed && !isSingle) && 'hidden')}>
                  <ul className={cn('space-y-1', collapsed && 'space-y-2')}>
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
                                'flex items-center rounded-xl border',
                                'transition-colors duration-200',
                                collapsed ? 'justify-center h-11' : 'gap-3 h-11 px-3',
                                isActive
                                  ? 'bg-gradient-to-r from-primary/15 via-primary/8 to-transparent border-primary/20 text-neutral-950'
                                  : 'bg-transparent border-transparent text-neutral-600 hover:bg-neutral-100/70 hover:border-neutral-200/60 hover:text-neutral-950'
                              )
                            }
                          >
                            {({ isActive }) => (
                              <>
                                <div
                                  className={cn(
                                    'flex items-center justify-center rounded-lg border flex-shrink-0',
                                    collapsed ? 'w-9 h-9' : 'w-8 h-8',
                                    isActive ? 'bg-white/50 border-primary/20 text-primary' : 'bg-white/30 border-neutral-200/40 text-neutral-500'
                                  )}
                                >
                                  <Icon className={cn(collapsed ? 'w-[18px] h-[18px]' : 'w-4 h-4')} />
                                </div>
                                {!collapsed && (
                                  <span className={cn('text-[13px] flex-1', isActive ? 'font-semibold' : 'font-medium')}>
                                    {item.name}
                                  </span>
                                )}
                              </>
                            )}
                          </NavLink>

                          {/* Tooltip (collapsed mode) */}
                          {collapsed && (
                            <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 px-3 py-2 rounded-xl border border-neutral-200 bg-white text-neutral-900 text-xs font-semibold shadow-none opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50">
                              {item.name}
                            </div>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>
      </nav>
    </aside>
  );

  // Mobile overlay wrapper
  if (!mobileOpen) return aside;

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      <div className="absolute inset-0 bg-neutral-900/40 backdrop-blur-[2px]" onClick={onCloseMobile} />
      <div className="absolute left-0 top-0 bottom-0 animate-fade-slide-down">{aside}</div>
    </div>
  );
}



