import { ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  className?: string;
}

/**
 * Page Header for Staff Portal
 * Used for page-specific titles and actions
 * Note: Notifications are handled in StaffHeader (layout level)
 */
export default function PageHeader({
  title,
  subtitle,
  actions,
  className = ''
}: PageHeaderProps) {
  return (
    <header className={`mb-4 sm:mb-6 ${className}`}>
      <div className="flex items-start justify-between gap-3 sm:gap-4">
        <div className="flex-1 min-w-0">
          <h1 className="text-lg sm:text-xl font-semibold text-neutral-900 tracking-tight">
            {title}
          </h1>
          {subtitle && (
            <p className="text-[13px] sm:text-sm text-neutral-500 mt-0.5">{subtitle}</p>
          )}
        </div>

        {actions && (
          <div className="flex items-center gap-2 flex-shrink-0">
            {actions}
          </div>
        )}
      </div>
    </header>
  );
}

/**
 * Dashboard Header with greeting
 * Shows personalized greeting and current date
 */
export function DashboardHeader({ name }: { name?: string }) {
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric'
  });

  return (
    <PageHeader
      title={`${getGreeting()}, ${name?.split(' ')[0] || 'Team'}!`}
      subtitle={today}
    />
  );
}
