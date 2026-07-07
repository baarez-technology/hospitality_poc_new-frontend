import { Bell } from 'lucide-react';
import { useAdmin } from '@/contexts/AdminContext';

export default function NotificationBell({ onClick }) {
  const { notifications } = useAdmin();
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <button
      onClick={onClick}
      className="relative group p-3.5 bg-white rounded-xl border border-neutral-200 hover:border-[#CDB261]/40 hover:bg-gradient-to-br hover:from-[#CDB261]/5 hover:to-transparent hover:shadow-md active:scale-95 transition-all duration-300 ease-out"
    >
      <Bell className="w-5 h-5 text-neutral-600 group-hover:text-[#CDB261] group-hover:scale-110 transition-all duration-200" />

      {unreadCount > 0 && (
        <span className="absolute top-2 right-2 flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#CDB261] opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-[#CDB261] ring-2 ring-white"></span>
        </span>
      )}

      <div className="absolute hidden group-hover:block bottom-full mb-2 left-1/2 -translate-x-1/2 whitespace-nowrap z-50">
        <div className="bg-neutral-900 text-white text-xs px-3 py-1.5 rounded-lg shadow-xl">
          Notifications {unreadCount > 0 ? `(${unreadCount})` : ''}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 rotate-45 w-2 h-2 bg-neutral-900"></div>
        </div>
      </div>
    </button>
  );
}
