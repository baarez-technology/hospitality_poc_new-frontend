import { apiClient, setAccessToken } from '../client';
import { API_ENDPOINTS } from '@/config/constants';
import { ENV } from '@/config/env';
import type {
  LoginCredentials,
  SignupData,
} from '../types/auth.types';
import type { ApiResponse } from '../types/common.types';

export const authService = {
  login: async (credentials: LoginCredentials) => {
    try {
      // Make login request - ensure payload matches backend LoginRequest schema
      const payload: { email: string; password: string; hotel_code?: string } = {
        email: credentials.email.trim(),
        password: credentials.password,
      };

      // Include hotel_code for multi-tenant support
      if (ENV.HOTEL_CODE) {
        payload.hotel_code = ENV.HOTEL_CODE;
      }
      
      const response = await apiClient.post<{ access_token: string; token_type: string; must_reset_password?: boolean; first_login?: boolean }>(
        API_ENDPOINTS.AUTH.LOGIN,
        payload,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      
      // Extract token from response
      // Backend returns: { access_token: "...", token_type: "bearer" } directly
      const responseData = response.data;
      let token: string | undefined;
      
      // Handle different response structures
      if (typeof responseData === 'object') {
        token = responseData?.access_token || 
                (responseData as any)?.data?.access_token ||
                (responseData as any)?.accessToken;
      }
      
      if (!token) {
        console.error('Login response structure:', responseData);
        console.error('Full response:', response);
        throw new Error('No access token received from server');
      }
      
      // Set token immediately
      setAccessToken(token);
      
      // Get user info - use explicit header to ensure token is sent
      let user;
      try {
        const userResponse = await apiClient.get(API_ENDPOINTS.AUTH.ME, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        // Extract user data
        user = userResponse.data?.data || userResponse.data;
      } catch (meError: any) {
        console.error('Failed to fetch user info after login:', meError);
        // If /me fails, we still have a valid token, so create a minimal user object
        // The user can still use the app, and we'll fetch full user info later
        user = {
          id: 0,
          email: credentials.email,
          full_name: '',
          role: 'staff',
          is_superuser: false,
        };
      }
      
      // Extract onboarding flags from login response and /me response
      const mustResetPassword = responseData?.must_reset_password || user.must_reset_password || false;
      const firstLogin = responseData?.first_login || user.first_login || false;

      return {
        user: {
          id: String(user.id || 0),
          email: user.email || credentials.email,
          fullName: user.full_name || user.fullName || '',
          phone: user.phone || '',
          emailVerified: true,
          createdAt: new Date().toISOString(),
          role: user.role || 'staff',
          isSuperuser: user.is_superuser || user.isSuperuser || false,
          mustResetPassword,
          firstLogin,
          permissions: user.permissions || null,
        },
        accessToken: token,
        mustResetPassword,
        firstLogin,
      };
    } catch (error: any) {
      // Clear token on error
      setAccessToken(null);
      
      // Log detailed error for debugging
      console.error('Login error details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message,
        config: {
          url: error.config?.url,
          method: error.config?.method,
          data: error.config?.data,
        },
      });
      
      // Re-throw with better error message
      if (error.response?.status === 400) {
        const detail = error.response?.data?.detail || error.response?.data?.message;
        if (detail) {
          throw new Error(detail);
        }
        throw new Error('Invalid request format. Please check your email and password.');
      }
      if (error.response?.status === 401) {
        throw new Error('Invalid email or password');
      }
      if (error.response?.status === 422) {
        const detail = error.response?.data?.detail || 'Validation error';
        if (Array.isArray(detail)) {
          throw new Error(detail.map((e: any) => (typeof e === 'string' ? e : e?.msg || e?.message || String(e))).join('. '));
        }
        throw new Error(typeof detail === 'string' ? detail : 'Validation error');
      }
      if (error.response?.data?.detail) {
        throw new Error(error.response.data.detail);
      }
      if (error.message) {
        throw error;
      }
      if (error.code === 'ERR_NETWORK' || error.message?.includes('Network')) {
        throw new Error('Network error. Please check your connection and ensure the backend server is running.');
      }
      throw new Error('Login failed. Please try again.');
    }
  },

  signup: async (signupData: SignupData) => {
    // Combine firstName and lastName into full_name for backend
    const fullName = signupData.fullName ||
                     `${signupData.firstName || ''} ${signupData.lastName || ''}`.trim();

    const payload: { email: string; password: string; full_name: string; phone: string; hotel_code?: string } = {
      email: signupData.email,
      password: signupData.password,
      full_name: fullName || signupData.email.split('@')[0],
      phone: signupData.phone || '',
    };

    // Include hotel_code for multi-tenant support
    if (ENV.HOTEL_CODE) {
      payload.hotel_code = ENV.HOTEL_CODE;
    }

    await apiClient.post(API_ENDPOINTS.AUTH.SIGNUP, payload);

    // Auto-login after signup
    const loginResponse = await authService.login({
      email: signupData.email,
      password: signupData.password,
    });

    return loginResponse;
  },

  logout: async () => {
    setAccessToken(null);
    // Backend doesn't have logout endpoint, just clear token
    return { success: true };
  },

  refreshToken: async () => {
    const response = await apiClient.post<{ access_token: string; token_type?: string }>(
      API_ENDPOINTS.AUTH.REFRESH
    );
    const responseData = response.data;
    const token = (responseData as any)?.data?.access_token || responseData.access_token;
    if (token) {
      setAccessToken(token);
    }
    return { accessToken: token || '' };
  },

  verifyEmail: async (token: string) => {
    const { data } = await apiClient.post(
      API_ENDPOINTS.AUTH.VERIFY_EMAIL,
      { token, hotel_code: ENV.HOTEL_CODE }
    );
    return data;
  },

  getCurrentUser: async () => {
    const response = await apiClient.get(API_ENDPOINTS.AUTH.ME);
    const user = response.data.data || response.data;
    return {
      id: String(user.id),
      email: user.email,
      fullName: user.full_name || '',
      phone: user.phone || '',
      emailVerified: true,
      createdAt: new Date().toISOString(),
      role: user.role,
      isSuperuser: user.is_superuser || false,
    };
  },

  forgotPassword: async (email: string) => {
    const response = await apiClient.post<ApiResponse<{ message: string }>>(
      API_ENDPOINTS.AUTH.FORGOT_PASSWORD,
      { email, hotel_code: ENV.HOTEL_CODE }
    );
    return response.data.data || response.data;
  },

  resetPassword: async (token: string, newPassword: string) => {
    const response = await apiClient.post<ApiResponse<{ message: string }>>(
      API_ENDPOINTS.AUTH.RESET_PASSWORD,
      { token, new_password: newPassword, hotel_code: ENV.HOTEL_CODE }
    );
    return response.data.data || response.data;
  },

  verifyResetToken: async (token: string) => {
    try {
      const response = await apiClient.get<ApiResponse<{ valid: boolean; message: string }>>(
        API_ENDPOINTS.AUTH.VERIFY_RESET_TOKEN,
        {
          params: { token, hotel_code: ENV.HOTEL_CODE },
        }
      );
      return response.data.data || response.data;
    } catch (error: any) {
      if (error.response?.status === 400) {
        return { valid: false, message: 'Invalid or expired token' };
      }
      throw error;
    }
  },
};
