import { NavLink } from 'react-router-dom';
import { ReactNode } from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MenuItemProps {
  to?: string;
  icon?: LucideIcon;
  label: string;
  badge?: string | number | null;
  onClick?: () => void;
  isActive?: boolean;
  className?: string;
  collapsed?: boolean;
}

export default function MenuItem({
  to,
  icon: Icon,
  label,
  badge,
  onClick,
  isActive: isActiveProp,
  className = '',
  collapsed = false
}: MenuItemProps) {
  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={cn(
          'flex items-center rounded-xl border',
          'transition-all duration-200',
          collapsed ? 'justify-center h-11' : 'gap-3 h-11 px-3 w-full',
          'bg-transparent border-transparent text-neutral-600',
          'hover:bg-neutral-100/70 hover:border-neutral-200/60 hover:text-neutral-950',
          className
        )}
      >
        {Icon && (
          <div className={cn(
            'flex items-center justify-center rounded-lg border flex-shrink-0',
            collapsed ? 'w-9 h-9' : 'w-8 h-8',
            'bg-white/30 border-neutral-200/40 text-neutral-500'
          )}>
            <Icon className={cn(collapsed ? 'w-[18px] h-[18px]' : 'w-4 h-4')} />
          </div>
        )}
        {!collapsed && (
          <>
            <span className="text-[13px] font-medium flex-1 text-left">{label}</span>
            {badge && (
              <span className="bg-primary text-white text-xs font-semibold px-2 py-0.5 rounded-full">
                {badge}
              </span>
            )}
          </>
        )}
      </button>
    );
  }

  if (!to) return null;

  return (
    <NavLink
      to={to}
      end={to.endsWith('/dashboard')}
      className={({ isActive }) =>
        cn(
          'relative flex items-center rounded-xl border',
          'transition-all duration-200',
          collapsed ? 'justify-center h-11' : 'gap-3 h-11 px-3',
          (isActiveProp ?? isActive)
            ? 'bg-gradient-to-r from-primary/15 via-primary/8 to-transparent border-primary/20 text-neutral-950'
            : 'bg-transparent border-transparent text-neutral-600 hover:bg-neutral-100/70 hover:border-neutral-200/60 hover:text-neutral-950',
          className
        )
      }
    >
      {({ isActive }) => (
        <>
          {/* Active indicator bar */}
          {(isActiveProp ?? isActive) && !collapsed && (
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-gradient-to-b from-primary to-primary-600 rounded-r-full" />
          )}

          {Icon && (
            <div className={cn(
              'flex items-center justify-center rounded-lg border flex-shrink-0',
              collapsed ? 'w-9 h-9' : 'w-8 h-8',
              (isActiveProp ?? isActive)
                ? 'bg-white/50 border-primary/20 text-primary'
                : 'bg-white/30 border-neutral-200/40 text-neutral-500'
            )}>
              <Icon className={cn(collapsed ? 'w-[18px] h-[18px]' : 'w-4 h-4')} />
            </div>
          )}

          {!collapsed && (
            <>
              <span className={cn(
                'text-[13px] flex-1',
                (isActiveProp ?? isActive) ? 'font-semibold' : 'font-medium'
              )}>
                {label}
              </span>
              {badge && (
                <span className={cn(
                  'text-xs font-semibold px-2 py-0.5 rounded-full',
                  (isActiveProp ?? isActive) ? 'bg-primary/20 text-primary' : 'bg-primary text-white'
                )}>
                  {badge}
                </span>
              )}
            </>
          )}
        </>
      )}
    </NavLink>
  );
}

interface MenuSectionProps {
  title?: string;
  children: ReactNode;
  className?: string;
  collapsed?: boolean;
  icon?: LucideIcon;
  isActive?: boolean;
  defaultOpen?: boolean;
  onToggle?: () => void;
}

export function MenuSection({
  title,
  children,
  className = '',
  collapsed = false,
  icon: Icon,
  isActive = false,
  defaultOpen = true,
  onToggle
}: MenuSectionProps) {
  if (collapsed) {
    return (
      <div className={cn('space-y-2', className)}>
        {children}
      </div>
    );
  }

  return (
    <div className={className}>
      {title && (
        <div className="px-2 mb-2">
          <div className={cn(
            'flex items-center gap-2',
            isActive ? 'text-neutral-900' : 'text-neutral-500'
          )}>
            {Icon && (
              <div className={cn(
                'w-7 h-7 rounded-lg flex items-center justify-center border',
                isActive ? 'bg-primary/10 border-primary/20 text-primary' : 'bg-white/50 border-neutral-200/40 text-neutral-500'
              )}>
                <Icon className="w-4 h-4" />
              </div>
            )}
            <span className="text-[11px] font-bold uppercase tracking-[0.16em]">
              {title}
            </span>
          </div>
        </div>
      )}
      <ul className="space-y-1 pl-2">
        {children}
      </ul>
    </div>
  );
}

export function MenuDivider() {
  return <div className="h-px bg-neutral-200/40 my-3 mx-2" />;
}
