import { useState } from 'react';
import { cn } from '../../lib/utils';
import { AdminSidebar } from './AdminSidebar';
import { AdminTopbar } from './AdminTopbar';
import { useIsTablet } from '../../hooks/useMediaQuery';

export function AdminShell({ children, onToggleAI }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const isTablet = useIsTablet();

  // On tablet (iPad Mini/Air/Pro 11"), auto-collapse the sidebar to icon-only
  const effectiveCollapsed = isTablet ? true : collapsed;

  return (
    <div className="w-screen h-screen overflow-hidden bg-[hsl(var(--background))]">
      <div className="h-full flex">
        {/* Sidebar — hidden on mobile (< 744px), visible as collapsed icon-bar on tablet, full on desktop */}
        <div className="hidden tablet:block h-full flex-shrink-0">
          <AdminSidebar
            collapsed={effectiveCollapsed}
            onToggleCollapsed={isTablet ? undefined : () => setCollapsed((v) => !v)}
          />
        </div>

        {/* Mobile slide-over sidebar */}
        {mobileOpen ? (
          <AdminSidebar
            collapsed={false}
            mobileOpen={mobileOpen}
            onCloseMobile={() => setMobileOpen(false)}
            onToggleCollapsed={() => {}}
          />
        ) : null}

        {/* Main */}
        <div className="flex-1 min-w-0 h-full flex flex-col">
          <AdminTopbar
            onToggleMobileSidebar={() => setMobileOpen(true)}
            onToggleAI={onToggleAI}
          />

          <main className={cn('flex-1 min-h-0 overflow-y-auto overflow-x-hidden custom-scrollbar')}>
            <div className="max-w-[1600px] mx-auto px-4 tablet:px-5 lg:px-6 py-4 tablet:py-5 lg:py-6">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
