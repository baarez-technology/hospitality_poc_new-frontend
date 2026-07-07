import { useState, ReactNode } from 'react';
import Sidebar from '../../components/staff-portal/nav/Sidebar';
import StaffHeader from '../../components/staff-portal/nav/StaffHeader';
import NotificationDrawer from '../../components/staff-portal/notifications/NotificationDrawer';
import { Menu, Bell } from 'lucide-react';
import { useUI } from '../../hooks/staff-portal/useStaffPortal';
import { useUnreadNotificationCount } from '../../hooks/staff-portal/useStaffApi';

interface StaffLayoutProps {
  children: ReactNode;
}

export default function StaffLayout({ children }: StaffLayoutProps) {
  // Sidebar collapse state
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const { sidebarOpen, toggleSidebar, toggleNotificationDrawer } = useUI();
  const { count: unreadCount } = useUnreadNotificationCount();

  // Handle sidebar toggle
  const handleSidebarToggle = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  return (
    <>
      {/* Desktop Layout - visible on lg+ (iPad Pro and up) */}
      <div className="hidden lg:flex w-screen h-screen items-center justify-center bg-gradient-to-br from-terra-50 via-terra-50/80 to-terra-100 overflow-hidden">
        {/* Fixed Frame Container - max constraints only on xl+ for iPad Pro full-screen */}
        <div className="relative w-full xl:max-w-[1440px] h-full xl:max-h-[1024px] bg-gradient-to-br from-terra-50 via-terra-50/80 to-terra-100 overflow-hidden flex flex-col xl:rounded-xl">
          {/* Top Row: Sidebar Brand + Header */}
          <div className="flex flex-shrink-0">
            {/* Sidebar Brand Section - Dynamic Width */}
            <div className={`transition-all duration-300 ${
              isSidebarCollapsed ? 'w-20' : 'w-64'
            }`}>
              <Sidebar
                isCollapsed={isSidebarCollapsed}
                onToggle={handleSidebarToggle}
                renderBrandOnly={true}
              />
            </div>

            {/* Header - Takes remaining width */}
            <div className="flex-1">
              <StaffHeader />
            </div>
          </div>

          {/* Bottom Row: Sidebar Navigation + Main Content */}
          <div className="flex flex-1 min-h-0">
            {/* Sidebar Navigation - Dynamic Width */}
            <aside className={`h-full flex-shrink-0 transition-all duration-300 ${
              isSidebarCollapsed ? 'w-20' : 'w-64'
            }`}>
              <Sidebar
                isCollapsed={isSidebarCollapsed}
                onToggle={handleSidebarToggle}
                renderNavigationOnly={true}
              />
            </aside>

            {/* Main Content - Scrollable */}
            <main className="flex-1 overflow-y-auto overflow-x-hidden min-h-0 custom-scrollbar bg-gradient-to-br from-terra-50 via-terra-50/80 to-terra-100">
              <div className="max-w-[1200px] mx-auto px-6 py-6">
                {children}
              </div>
            </main>
          </div>

          {/* Notification Drawer */}
          <NotificationDrawer />
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="lg:hidden w-screen h-screen bg-gradient-to-br from-terra-50 via-terra-50/80 to-terra-100 overflow-hidden flex flex-col">
        {/* Mobile Header */}
        <div className="h-14 bg-white border-b border-neutral-100 flex items-center justify-between px-4 flex-shrink-0">
          <div className="flex items-center">
            <button
              onClick={toggleSidebar}
              className="p-2 rounded-lg text-neutral-600 hover:bg-neutral-100 transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="ml-3">
              <h1 className="text-sm font-semibold text-neutral-800">J Park Inn</h1>
              <p className="text-[10px] text-neutral-400">Staff Portal</p>
            </div>
          </div>
          <button
            onClick={toggleNotificationDrawer}
            className="relative p-2 rounded-lg text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100 transition-colors"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 flex items-center justify-center text-[10px] font-bold rounded-full bg-terra-500 text-white">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>
        </div>

        {/* Mobile Content */}
        <main className="flex-1 overflow-y-auto custom-scrollbar">
          <div className="px-4 py-4">
            {children}
          </div>
        </main>

        {/* Mobile Sidebar Overlay */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-50">
            <div
              className="absolute inset-0 bg-neutral-900/40 backdrop-blur-[2px]"
              onClick={toggleSidebar}
            />
            <div className="absolute left-0 top-0 bottom-0 w-[280px] shadow-2xl">
              <Sidebar
                isCollapsed={false}
                onToggle={toggleSidebar}
                renderBrandOnly={false}
                renderNavigationOnly={false}
              />
            </div>
          </div>
        )}

        {/* Notification Drawer */}
        <NotificationDrawer />
      </div>
    </>
  );
}
