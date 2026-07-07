import { createContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { User } from '@/api/types/auth.types';
import { authService } from '@/api/services/auth.service';
import { getAccessToken, setAccessToken } from '@/api/client';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string, remember?: boolean) => Promise<void>;
  signup: (data: SignupData) => Promise<void>;
  logout: () => void;
  updateUser: (data: Partial<User>) => void;
}

export interface SignupData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone?: string;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Check for existing session on mount
  useEffect(() => {
    let isMounted = true;

    const checkAuth = async () => {
      const token = getAccessToken();
      if (token) {
        try {
          // Validate token by fetching current user
          const currentUser = await authService.getCurrentUser();
          if (!isMounted) return;

          // DEV: allow role override for RBAC testing
          // Set localStorage key "glimmora_dev_role" to test, e.g. "receptionist"
          if (import.meta.env.DEV) {
            const devRole = localStorage.getItem('glimmora_dev_role');
            if (devRole) {
              currentUser.role = devRole;
              currentUser.isSuperuser = false;
              console.log(`[DEV] RBAC override: role="${devRole}"`);
            }
          }

          setUser(currentUser);
          // Store user in localStorage for quick access
          localStorage.setItem('glimmora_user', JSON.stringify(currentUser));
        } catch (error) {
          if (!isMounted) return;
          // Token invalid or expired, clear everything
          setAccessToken(null);
          setUser(null);
          localStorage.removeItem('glimmora_user');
          localStorage.removeItem('glimmora_token');
          localStorage.removeItem('glimmora_access_token');
        }
      } else {
        if (!isMounted) return;
        // No token found, clear any stale user data
        setUser(null);
        localStorage.removeItem('glimmora_user');
      }
      if (isMounted) setIsLoading(false);
    };

    checkAuth();

    return () => { isMounted = false; };
  }, []);

  const login = async (email: string, password: string, remember = false) => {
    setIsLoading(true);
    try {
      const response = await authService.login({ email, password });
      
      if (!response || !response.user) {
        throw new Error('Invalid response from server');
      }
      
      setUser(response.user);

      // Store user in localStorage for persistence
      localStorage.setItem('glimmora_user', JSON.stringify(response.user));

      if (remember) {
        localStorage.setItem('glimmora_remember', 'true');
      }

      setIsLoading(false);

      // If user must reset their temp password, redirect to set-password page
      if (response.mustResetPassword || response.user.mustResetPassword) {
        toast.success('Welcome! Please set your new password to continue.');
        navigate('/set-password');
        return;
      }

      toast.success('Welcome back!');

      // Redirect based on user role
      const role = response.user.role?.toLowerCase();
      const currentPath = window.location.pathname;
      const fromStaffLogin = currentPath.includes('/staff/login');

      // Define role groups for proper routing
      const maintenanceRoles = ['maintenance', 'technician', 'electrician', 'plumber', 'hvac_technician'];
      const housekeepingRoles = ['housekeeping', 'housekeeper', 'room_attendant', 'laundry_attendant'];
      const runnerRoles = ['runner', 'bellhop', 'valet'];
      const fnbServerRoles = ['fnb_server', 'waiter', 'server'];
      const kitchenRoles = ['kitchen_staff', 'chef', 'cook'];
      const frontDeskRoles = ['front_desk', 'frontdesk', 'receptionist', 'concierge', 'night_auditor', 'front_office_manager', 'duty_manager'];
      const managementRoles = ['admin', 'manager', 'supervisor', 'general_manager', 'reservation_manager', 'revenue_manager', 'accounts_manager', 'devmaster'];
      const housekeepingMgmtRoles = ['housekeeping_manager'];

      if (role === 'admin' || response.user.isSuperuser || managementRoles.includes(role)) {
        navigate('/admin');
      } else if (frontDeskRoles.includes(role)) {
        navigate('/admin');
      } else if (housekeepingMgmtRoles.includes(role)) {
        navigate('/admin');
      } else if (housekeepingRoles.includes(role)) {
        navigate(fromStaffLogin ? '/staff/housekeeping' : '/dashboard/housekeeping');
      } else if (maintenanceRoles.includes(role)) {
        navigate('/staff/maintenance');
      } else if (runnerRoles.includes(role)) {
        navigate('/staff/runner');
      } else if (fnbServerRoles.includes(role)) {
        navigate('/pos');
      } else if (kitchenRoles.includes(role)) {
        navigate('/kitchen');
      } else if (role === 'finance') {
        navigate('/dashboard/finance');
      } else if (role === 'operations') {
        navigate('/dashboard/operations');
      } else {
        navigate('/dashboard');
      }
    } catch (error: any) {
      setIsLoading(false);
      // Extract error message
      let errorMessage = 'Login failed';
      
      if (error.message) {
        errorMessage = error.message;
      } else if (error.response?.data?.detail) {
        errorMessage = error.response.data.detail;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }
      
      toast.error(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const signup = async (data: SignupData) => {
    setIsLoading(true);
    try {
      const response = await authService.signup({
        email: data.email,
        password: data.password,
        fullName: `${data.firstName} ${data.lastName}`,
        phone: data.phone,
      });
      setUser(response.user);
      // Store user in localStorage for persistence
      localStorage.setItem('glimmora_user', JSON.stringify(response.user));
      setIsLoading(false);
      toast.success('Account created successfully!');
      navigate('/');
    } catch (error: any) {
      setIsLoading(false);
      const errorMessage = error.response?.data?.detail || error.message || 'Signup failed';
      toast.error(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      // Ignore logout errors
    }
    setUser(null);
    setAccessToken(null); // This will also clear from localStorage
    localStorage.removeItem('glimmora_user');
    localStorage.removeItem('glimmora_token');
    localStorage.removeItem('glimmora_remember');
    localStorage.removeItem('glimmora_access_token'); // Ensure token is cleared
    toast.success('Logged out successfully');
    navigate('/');
  };

  const updateUser = (data: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...data };
      setUser(updatedUser);
      localStorage.setItem('glimmora_user', JSON.stringify(updatedUser));
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      isLoading,
      login,
      signup,
      logout,
      updateUser
    }}>
      {children}
    </AuthContext.Provider>
  );
}
