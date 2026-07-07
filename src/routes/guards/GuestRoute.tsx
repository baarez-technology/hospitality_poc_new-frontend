import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/hooks';
import { ROUTES } from '@/config/constants';

export const GuestRoute = () => {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Navigate to={ROUTES.DASHBOARD} replace />;
  }

  return <Outlet />;
};
