import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { X, Home, Bed, Heart, Sparkles, ClipboardCheck, Mail, Calendar, Settings, LogOut, LayoutDashboard } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useWishlist } from '@/contexts/WishlistContext';
import logo from '@/assets/logo.png';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, logout } = useAuth();
  const { wishlistCount } = useWishlist();

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const mainNavLinks = [
    { name: 'Home', path: '/', icon: Home },
    { name: 'Rooms', path: '/rooms', icon: Bed },
    { name: 'Amenities', path: '/amenities', icon: Sparkles },
    { name: 'Pre-Check-In', path: '/pre-checkin', icon: ClipboardCheck, highlight: true },
    { name: 'Contact', path: '/contact', icon: Mail },
  ];

  const accountLinks = [
    { name: 'My Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'My Wishlist', path: '/wishlist', icon: Heart, badge: true },
    { name: 'My Bookings', path: '/dashboard?tab=bookings', icon: Calendar },
    { name: 'Pre-Check-In', path: '/pre-checkin', icon: ClipboardCheck },
    { name: 'Account Settings', path: '/dashboard?tab=security', icon: Settings },
  ];

  const handleNavigate = (path: string) => {
    navigate(path);
    onClose();
  };

  const handleLogout = () => {
    logout();
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        className={`
          fixed inset-0 bg-black/50 z-[100]
          transition-opacity duration-300 ease-out
          ${isOpen ? 'opacity-100 pointer-events-auto backdrop-blur-sm' : 'opacity-0 pointer-events-none'}
        `}
      />

      {/* Sidebar Panel */}
      <div
        className={`
          fixed top-0 right-0 h-full w-full max-w-sm bg-white shadow-2xl z-[101]
          overflow-y-auto
          transition-transform duration-300 ease-out
          ${isOpen ? 'translate-x-0' : 'translate-x-full pointer-events-none'}
        `}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-neutral-200 p-6 flex items-center justify-between z-10">
          <div className="flex items-center gap-2">
            <img src={logo} alt="Glimmora" className="h-6 w-auto" />
            <span className="text-xl font-bold text-neutral-900">Glimmora</span>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center text-neutral-600 hover:bg-neutral-100 rounded-full transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* User Info (if logged in) */}
          {isAuthenticated && user && (
            <div className="mb-6 p-4 bg-neutral-50 rounded-2xl">
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
          )}

          {/* Main Navigation */}
          <div className="mb-6">
            <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-3">
              Navigation
            </h3>
            <div className="space-y-1">
              {mainNavLinks.map((link) => {
                const Icon = link.icon;
                const isActive = location.pathname === link.path;

                return (
                  <button
                    key={link.path}
                    onClick={() => handleNavigate(link.path)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors relative ${
                      link.highlight
                        ? 'bg-primary-50 border-2 border-primary-200 text-primary-600 font-semibold'
                        : isActive
                        ? 'bg-neutral-100 text-neutral-900 font-medium'
                        : 'text-neutral-700 hover:bg-neutral-50'
                    }`}
                  >
                    <Icon className={`w-5 h-5 ${link.highlight ? 'text-primary-600' : 'text-neutral-500'}`} />
                    <span>{link.name}</span>
                    {link.highlight && (
                      <span className="absolute top-2 right-2 px-2 py-0.5 bg-primary-600 text-white text-xs font-bold rounded-full">
                        NEW
                      </span>
                    )}
                    {link.badge && wishlistCount > 0 && (
                      <span className="absolute top-2 right-2 bg-primary-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                        {wishlistCount}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Account Links (if logged in) */}
          {isAuthenticated && (
            <div className="mb-6">
              <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-3">
                My Account
              </h3>
              <div className="space-y-1">
                {accountLinks.map((link) => {
                  const Icon = link.icon;
                  return (
                    <button
                      key={link.path}
                      onClick={() => handleNavigate(link.path)}
                      className="w-full flex items-center gap-3 px-4 py-3 text-neutral-700 hover:bg-neutral-50 rounded-xl transition-colors relative"
                    >
                      <Icon className="w-5 h-5 text-neutral-500" />
                      <span>{link.name}</span>
                      {link.badge && wishlistCount > 0 && (
                        <span className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                          {wishlistCount}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Auth Buttons */}
          {!isAuthenticated ? (
            <div className="space-y-3">
              <button
                onClick={() => handleNavigate('/login')}
                className="w-full py-3 bg-white border-2 border-neutral-300 hover:border-primary-500 text-neutral-900 font-semibold rounded-xl transition-colors"
              >
                Login
              </button>
              <button
                onClick={() => handleNavigate('/signup')}
                className="w-full py-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-xl transition-colors"
              >
                Sign Up
              </button>
            </div>
          ) : (
            <div className="pt-4 border-t border-neutral-200">
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl transition-colors font-medium"
              >
                <LogOut className="w-5 h-5" />
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
