import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Navigation } from '../navigation/Navigation';

export const PublicLayout = () => {
  const location = useLocation();
  const isPreCheckIn = location.pathname === '/pre-checkin';
  const isBookingFlow = location.pathname.startsWith('/booking');

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col">
      {!isPreCheckIn && !isBookingFlow && <Navigation />}
      <main className="flex-grow">
        <Outlet />
      </main>
    </div>
  );
};
