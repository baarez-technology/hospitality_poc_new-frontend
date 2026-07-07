import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { authService } from '@/api/services/auth.service';
import { setAccessToken } from '@/api/client';
import type {
  User,
  LoginCredentials,
  SignupData,
} from '@/api/types/auth.types';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  login: (credentials: LoginCredentials) => Promise<void>;
  signup: (data: SignupData) => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: User | null) => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      (set) => ({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,

        login: async (credentials) => {
          set({ isLoading: true, error: null });
          try {
            const response = await authService.login(credentials);

            // Store access token in memory
            setAccessToken(response.accessToken);

            // Store user data (non-sensitive)
            set({
              user: response.user,
              isAuthenticated: true,
              isLoading: false,
            });
          } catch (error: any) {
            set({
              error: error.message || error.response?.data?.detail || error.response?.data?.message || 'Login failed',
              isLoading: false,
            });
            throw error;
          }
        },

        signup: async (signupData) => {
          set({ isLoading: true, error: null });
          try {
            const response = await authService.signup(signupData);

            // Store access token in memory
            setAccessToken(response.accessToken);

            // Store user data
            set({
              user: response.user,
              isAuthenticated: true,
              isLoading: false,
            });
          } catch (error: any) {
            set({
              error: error.message || error.response?.data?.detail || error.response?.data?.message || 'Signup failed',
              isLoading: false,
            });
            throw error;
          }
        },

        logout: async () => {
          try {
            await authService.logout();
          } catch (error) {
            console.error('Logout error:', error);
          } finally {
            // Clear token from memory
            setAccessToken(null);

            // Clear user data
            set({
              user: null,
              isAuthenticated: false,
              error: null,
            });
          }
        },

        setUser: (user) => {
          set({ user, isAuthenticated: !!user });
        },

        clearError: () => {
          set({ error: null });
        },
      }),
      {
        name: 'auth-storage',
        // Only persist user data, NOT tokens
        partialize: (state) => ({
          user: state.user,
          isAuthenticated: state.isAuthenticated,
        }),
      }
    ),
    { name: 'AuthStore' }
  )
);
