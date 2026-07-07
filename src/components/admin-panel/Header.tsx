import { Search, Bell, User, Sparkles, ChevronDown, LogOut, UserCircle } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

interface HeaderProps {
  onAIPanelToggle: () => void;
  onAIVoiceClick?: () => void;
}

const Header = ({ onAIPanelToggle, onAIVoiceClick }: HeaderProps) => {
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setIsProfileMenuOpen(false);
    logout();
  };

  return (
    <header className="bg-gradient-to-r from-white via-[#FAF8F6]/30 to-white border-b border-[#A57865]/20 z-40 shadow-sm backdrop-blur-sm">
      <div className="px-8 py-4">
        <div className="flex items-center justify-between gap-6">
          {/* Search Bar */}
          <div className="flex-1 max-w-2xl">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400 group-focus-within:text-[#A57865] transition-all duration-200 group-focus-within:scale-110" />
              <input
                type="text"
                placeholder="Search guests, rooms, bookings..."
                className="w-full pl-12 pr-4 py-3.5 bg-gradient-to-r from-white to-[#FAF8F6] border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#A57865]/50 focus:border-[#A57865] hover:border-[#A57865]/30 hover:shadow-sm transition-all duration-300 text-sm placeholder:text-neutral-400"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            {/* AI Assistant Button */}
            <button
              onClick={onAIPanelToggle}
              className="relative group p-3.5 bg-gradient-to-br from-[#A57865] via-[#8E6554] to-[#A57865] rounded-xl shadow-md hover:shadow-lg active:scale-95 transition-all duration-300 ease-out overflow-hidden"
              title="Open Glimmora AI Assistant"
            >
              <Sparkles className="w-5 h-5 text-white relative z-10 group-hover:scale-110 group-hover:rotate-12 transition-all duration-300" />

              {/* Shine effect */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="absolute top-0 left-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 translate-x-[-200%] group-hover:translate-x-[400%] transition-transform duration-700"></div>
              </div>

              {/* Tooltip */}
              <div className="absolute hidden group-hover:block bottom-full mb-2 left-1/2 -translate-x-1/2 whitespace-nowrap z-50">
                <div className="bg-neutral-900 text-white text-xs px-3 py-1.5 rounded-lg shadow-xl animate-in fade-in slide-in-from-bottom-2 duration-200">
                  Glimmora AI Assistant
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 rotate-45 w-2 h-2 bg-neutral-900"></div>
                </div>
              </div>
            </button>

            {/* Notifications */}
            <button className="relative group p-3.5 bg-white rounded-xl border border-neutral-200 hover:border-[#CDB261]/40 hover:bg-gradient-to-br hover:from-[#CDB261]/5 hover:to-transparent hover:shadow-md active:scale-95 transition-all duration-300 ease-out">
              <Bell className="w-5 h-5 text-neutral-600 group-hover:text-[#CDB261] group-hover:scale-110 transition-all duration-200" />

              {/* Notification badge */}
              <span className="absolute top-2 right-2 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#CDB261] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-[#CDB261] ring-2 ring-white"></span>
              </span>

              {/* Tooltip */}
              <div className="absolute hidden group-hover:block bottom-full mb-2 left-1/2 -translate-x-1/2 whitespace-nowrap z-50">
                <div className="bg-neutral-900 text-white text-xs px-3 py-1.5 rounded-lg shadow-xl animate-in fade-in slide-in-from-bottom-2 duration-200">
                  Notifications (3)
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 rotate-45 w-2 h-2 bg-neutral-900"></div>
                </div>
              </div>
            </button>

            {/* Profile */}
            <div className="relative">
              <button
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                className="group flex items-center gap-3 pl-2 pr-4 py-2 bg-white rounded-xl border border-neutral-200 hover:border-[#A57865]/40 hover:shadow-md hover:bg-gradient-to-br hover:from-[#A57865]/5 hover:to-transparent transition-all duration-300 ease-out"
              >
                <div className="w-10 h-10 bg-gradient-to-br from-[#A57865] via-[#8E6554] to-[#A57865] rounded-xl flex items-center justify-center group-hover:scale-105 transition-all duration-300 shadow-sm">
                  <User className="w-5 h-5 text-white" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-semibold text-neutral-800 group-hover:text-[#A57865] transition-colors duration-200">Sarah Admin</p>
                  <p className="text-xs text-neutral-500 font-medium">Manager</p>
                </div>
                <ChevronDown className={`w-4 h-4 text-neutral-400 group-hover:text-[#A57865] transition-all duration-200 ${
                  isProfileMenuOpen ? 'rotate-180' : ''
                }`} />
              </button>

              {/* Dropdown Menu */}
              {isProfileMenuOpen && (
                <>
                  {/* Backdrop to close menu */}
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setIsProfileMenuOpen(false)}
                  />

                  {/* Menu */}
                  <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl border border-neutral-200 shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                    {/* User Info Header */}
                    <div className="px-4 py-3 border-b border-neutral-200 bg-gradient-to-br from-[#A57865]/5 to-transparent">
                      <p className="text-sm font-semibold text-neutral-800">
                        {user?.first_name} {user?.last_name}
                      </p>
                      <p className="text-xs text-neutral-500">{user?.email}</p>
                    </div>

                    {/* Menu Items */}
                    <div className="py-2">
                      <button className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-[#A57865]/5 transition-colors duration-200 group">
                        <UserCircle className="w-4 h-4 text-neutral-600 group-hover:text-[#A57865] transition-colors" />
                        <span className="text-sm text-neutral-700 group-hover:text-neutral-900 font-medium">View Profile</span>
                      </button>
                    </div>

                    {/* Logout */}
                    <div className="border-t border-neutral-200 py-2">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-red-50 transition-colors duration-200 group"
                      >
                        <LogOut className="w-4 h-4 text-neutral-600 group-hover:text-red-600 transition-colors" />
                        <span className="text-sm text-neutral-700 group-hover:text-red-600 font-medium">Log Out</span>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
