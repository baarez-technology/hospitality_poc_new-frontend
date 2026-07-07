import { apiClient } from '../client';
import { API_ENDPOINTS } from '@/config/constants';
import type { User } from '../types/auth.types';
import type { UpdateUserData, ChangePasswordData } from '../types/user.types';
import type { ApiResponse } from '../types/common.types';

export const userService = {
  getProfile: async () => {
    const response = await apiClient.get<ApiResponse<any>>(API_ENDPOINTS.USERS.PROFILE);
    const user = response.data.data || response.data;
    return {
      id: String(user.id),
      email: user.email,
      fullName: user.full_name || '',
      phone: user.phone || '',
      address: user.address || '',
      city: user.city || '',
      zipCode: user.zip_code || '',
      country: user.country || '',
      emailVerified: true,
      createdAt: new Date().toISOString(),
    };
  },

  updateProfile: async (userData: UpdateUserData) => {
    const response = await apiClient.patch<ApiResponse<any>>(
      API_ENDPOINTS.USERS.UPDATE_PROFILE,
      {
        full_name: userData.fullName,
        phone: userData.phone,
        address: userData.address,
        city: userData.city,
        zip_code: userData.zipCode,
        country: userData.country,
      }
    );
    const user = response.data.data || response.data;
    return {
      id: String(user.id),
      email: user.email,
      fullName: user.full_name || '',
      phone: user.phone || '',
      address: user.address || '',
      city: user.city || '',
      zipCode: user.zip_code || '',
      country: user.country || '',
      emailVerified: true,
      createdAt: new Date().toISOString(),
    };
  },

  changePassword: async (passwordData: ChangePasswordData) => {
    const response = await apiClient.post<ApiResponse<void>>(
      API_ENDPOINTS.USERS.CHANGE_PASSWORD,
      {
        current_password: passwordData.currentPassword,
        new_password: passwordData.newPassword,
      }
    );
    return response.data;
  },

  getPreferences: async () => {
    const response = await apiClient.get<ApiResponse<any>>(API_ENDPOINTS.USERS.PREFERENCES);
    return response.data.data || response.data || {};
  },

  savePreferences: async (preferences: any) => {
    const response = await apiClient.post<ApiResponse<any>>(
      API_ENDPOINTS.USERS.PREFERENCES,
      preferences
    );
    return response.data.data || response.data;
  },

  syncToGuest: async () => {
    const response = await apiClient.post<ApiResponse<any>>('/api/v1/users/sync-guest');
    return response.data.data || response.data;
  },
};
