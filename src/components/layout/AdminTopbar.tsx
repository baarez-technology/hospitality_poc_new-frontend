/**
 * AdminTopbar — Wrapper around the existing Header component
 * Maps AdminShell props to Header's prop interface.
 * The Header component handles hamburger menu, notifications, AI toggle, breadcrumbs, etc.
 */
import Header from '../Header';

interface AdminTopbarProps {
  onToggleMobileSidebar?: () => void;
  onToggleAI?: () => void;
}

export function AdminTopbar({ onToggleMobileSidebar, onToggleAI }: AdminTopbarProps) {
  return (
    <Header
      onMobileMenuToggle={onToggleMobileSidebar}
      onAIPanelToggle={onToggleAI}
      onSidebarToggle={undefined}
      isSidebarCollapsed={false}
    />
  );
}
