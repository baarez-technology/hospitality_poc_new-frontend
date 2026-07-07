import React from 'react';
import { cn } from '../../lib/utils';
import { ChevronRight, ArrowLeft } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

/**
 * Glimmora Design System v4.0 - Page Header
 * Consistent page headers with breadcrumbs, titles, and actions
 */

// Breadcrumb Component
export function Breadcrumbs({ items, className }) {
  return (
    <nav aria-label="Breadcrumb" className={cn('flex items-center gap-1.5', className)}>
      {items.map((item, index) => (
        <React.Fragment key={index}>
          {index > 0 && <ChevronRight className="w-3.5 h-3.5 text-neutral-400" />}
          {item.href ? (
            <Link
              to={item.href}
              className="text-xs font-medium text-neutral-500 hover:text-terra-600 transition-colors"
            >
              {item.label}
            </Link>
          ) : (
            <span className="text-xs font-medium text-neutral-900">
              {item.label}
            </span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
}

// Main Page Header
export function PageHeader({
  className,
  title,
  description,
  actions,
  meta,
  breadcrumbs,
  backHref,
  icon: Icon,
  size = 'md', // sm, md, lg
  ...props
}) {
  const navigate = useNavigate();

  const sizes = {
    sm: {
      title: 'text-lg',
      description: 'text-xs',
      icon: 'w-8 h-8',
      iconInner: 'w-4 h-4',
    },
    md: {
      title: 'text-xl',
      description: 'text-sm',
      icon: 'w-10 h-10',
      iconInner: 'w-5 h-5',
    },
    lg: {
      title: 'text-2xl',
      description: 'text-sm',
      icon: 'w-12 h-12',
      iconInner: 'w-6 h-6',
    },
  };

  const s = sizes[size];

  return (
    <div className={cn('', className)} {...props}>
      {/* Breadcrumbs */}
      {breadcrumbs && (
        <Breadcrumbs items={breadcrumbs} className="mb-3" />
      )}

      {/* Main Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4 min-w-0">
          {/* Back Button */}
          {backHref && (
            <button
              onClick={() => navigate(backHref)}
              className="flex-shrink-0 w-9 h-9 rounded-lg bg-neutral-100 hover:bg-neutral-200 flex items-center justify-center transition-colors mt-0.5"
            >
              <ArrowLeft className="w-4 h-4 text-neutral-600" />
            </button>
          )}

          {/* Icon */}
          {Icon && (
            <div className={cn('flex-shrink-0 rounded-xl bg-terra-100 flex items-center justify-center', s.icon)}>
              <Icon className={cn('text-terra-600', s.iconInner)} />
            </div>
          )}

          {/* Text */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-3">
              <h1 className={cn('font-semibold text-neutral-900 tracking-tight truncate', s.title)}>
                {title}
              </h1>
              {meta}
            </div>
            {description && (
              <p className={cn('text-neutral-500 mt-0.5', s.description)}>
                {description}
              </p>
            )}
          </div>
        </div>

        {/* Actions */}
        {actions && (
          <div className="flex items-center gap-2 flex-shrink-0">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}

// Page Container - Consistent page wrapper
export function PageContainer({ children, className }) {
  return (
    <div className={cn('p-6', className)}>
      {children}
    </div>
  );
}

// Section Header - For content sections
export function SectionHeader({
  title,
  description,
  actions,
  className,
  size = 'md',
}) {
  const sizes = {
    sm: { title: 'text-sm', description: 'text-xs' },
    md: { title: 'text-base', description: 'text-sm' },
    lg: { title: 'text-lg', description: 'text-sm' },
  };

  const s = sizes[size];

  return (
    <div className={cn('flex items-start justify-between gap-4 mb-4', className)}>
      <div>
        <h2 className={cn('font-semibold text-neutral-900', s.title)}>{title}</h2>
        {description && (
          <p className={cn('text-neutral-500 mt-0.5', s.description)}>{description}</p>
        )}
      </div>
      {actions && (
        <div className="flex items-center gap-2 flex-shrink-0">
          {actions}
        </div>
      )}
    </div>
  );
}

// Divider
export function Divider({ className, label }) {
  if (label) {
    return (
      <div className={cn('flex items-center gap-4 my-6', className)}>
        <div className="flex-1 h-px bg-neutral-200" />
        <span className="text-xs font-medium text-neutral-400 uppercase tracking-wider">{label}</span>
        <div className="flex-1 h-px bg-neutral-200" />
      </div>
    );
  }

  return <div className={cn('h-px bg-neutral-200 my-6', className)} />;
}

// Quick Stats Row - For page header stats
export function QuickStats({ stats, className }) {
  return (
    <div className={cn('flex items-center gap-6 py-3 px-4 bg-neutral-50 rounded-xl', className)}>
      {stats.map((stat, index) => (
        <React.Fragment key={index}>
          {index > 0 && <div className="w-px h-8 bg-neutral-200" />}
          <div>
            <p className="text-xs font-medium text-neutral-500">{stat.label}</p>
            <p className="text-lg font-semibold text-neutral-900">{stat.value}</p>
          </div>
        </React.Fragment>
      ))}
    </div>
  );
}

// Page Toolbar - For filters and actions
export function PageToolbar({ children, className }) {
  return (
    <div className={cn(
      'flex items-center justify-between gap-4 py-3 px-4',
      'bg-white border border-neutral-200 rounded-xl',
      className
    )}>
      {children}
    </div>
  );
}

// Toolbar Group
export function ToolbarGroup({ children, className }) {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      {children}
    </div>
  );
}

