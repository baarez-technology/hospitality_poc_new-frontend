import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Calendar, ClipboardCheck, Settings, LogOut, ChevronDown, LayoutDashboard, Heart } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useWishlist } from '@/contexts/WishlistContext';

export function UserDropdown() {
  const { user, logout } = useAuth();
  const { wishlistCount } = useWishlist();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  if (!user) return null;

  const menuItems = [
    { icon: LayoutDashboard, label: 'My Dashboard', path: '/dashboard' },
    { icon: Heart, label: 'My Wishlist', path: '/wishlist', badge: true },
    { icon: Calendar, label: 'My Bookings', path: '/dashboard?tab=bookings' },
    { icon: ClipboardCheck, label: 'Pre-Check-In', path: '/pre-checkin', highlight: true },
    { icon: Settings, label: 'Account Settings', path: '/dashboard?tab=security' },
  ];

  const handleNavigate = (path: string) => {
    navigate(path);
    setIsOpen(false);
  };

  const handleLogout = () => {
    logout();
    setIsOpen(false);
  };

  return (
    <div ref={dropdownRef} className="relative">
      {/* Avatar Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-full hover:bg-neutral-100 transition-all"
      >
        <img
          src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.fullName)}`}
          alt={user.fullName}
          className="w-8 h-8 rounded-full"
        />
        <span className="hidden md:inline text-sm font-medium text-neutral-900">
          {user.fullName.split(' ')[0]}
        </span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="w-4 h-4 text-neutral-600" strokeWidth={2} />
        </motion.div>
      </button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-neutral-200 overflow-hidden z-[200]"
          >
            {/* User Info */}
            <div className="p-4 border-b border-neutral-200 bg-neutral-50">
              <div className="flex items-center gap-3">
                <img
                  src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.fullName)}`}
                  alt={user.fullName}
                  className="w-12 h-12 rounded-full"
                />
                <div>
                  <div className="font-semibold text-neutral-900">{user.fullName}</div>
                  <div className="text-sm text-neutral-600">{user.email}</div>
                </div>
              </div>
            </div>

            {/* Menu Items */}
            <div className="py-2">
              {menuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.label}
                    onClick={() => handleNavigate(item.path)}
                    className={`w-full flex items-center gap-3 px-4 py-3 transition-all ${
                      item.highlight
                        ? 'text-primary-600 hover:bg-primary-50 font-medium'
                        : 'text-neutral-700 hover:bg-neutral-50'
                    }`}
                  >
                    <Icon className={`w-5 h-5 ${item.highlight ? 'text-primary-600' : 'text-neutral-500'}`} />
                    <span>{item.label}</span>
                    {item.highlight && (
                      <span className="ml-auto px-2 py-0.5 bg-primary-100 text-primary-700 text-xs font-bold rounded-full">
                        NEW
                      </span>
                    )}
                    {item.badge && wishlistCount > 0 && (
                      <span className="ml-auto px-2 py-0.5 bg-red-500 text-white text-xs font-bold rounded-full min-w-[20px] text-center">
                        {wishlistCount}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Logout */}
            <div className="border-t border-neutral-200 p-2">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 transition-all rounded-lg"
              >
                <LogOut className="w-5 h-5" />
                <span className="font-medium">Logout</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
