import { apiClient } from '../client';
import { API_ENDPOINTS } from '@/config/constants';

export interface AddressSchema {
  street?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
}

export interface BrandingSchema {
  logo?: string | null;
  primaryColor?: string;
  secondaryColor?: string;
  favicon?: string | null;
}

export interface SocialMediaSchema {
  facebook?: string;
  instagram?: string;
  twitter?: string;
  linkedin?: string;
}

export interface PaymentSettingsSchema {
  upi_enabled?: boolean;
  upi_id?: string;
  upi_qr_image?: string | null;
  upi_display_name?: string;
  bank_name?: string;
  bank_account_number?: string;
  bank_ifsc?: string;
  bank_account_holder?: string;
}

export interface PrintSettingsSchema {
  paper_size?: string; // A4 | Letter | Legal | A5 | 80mm | 58mm
  orientation?: string; // portrait | landscape
  margin?: string; // normal | narrow | wide | none
}

export interface HotelSettingsResponse {
  id: number;
  hotel_name: string;
  hotel_code?: string;
  address: AddressSchema;
  phone?: string;
  phone2?: string;
  email?: string;
  website?: string;
  timezone: string;
  currency: string;
  tax_rate: number;
  service_charge_rate: number;
  check_in_time?: string;
  check_out_time?: string;
  cancellation_policy?: string;
  branding: BrandingSchema;
  social_media: SocialMediaSchema;
  payment_settings: PaymentSettingsSchema;
  print_settings?: PrintSettingsSchema;
  tagline?: string;
  gstin?: string | null;
  created_at: string;
  updated_at: string;
}

export interface HotelSettingsUpdate {
  hotel_name?: string;
  hotel_code?: string;
  address?: AddressSchema;
  phone?: string;
  phone2?: string;
  email?: string;
  website?: string;
  timezone?: string;
  currency?: string;
  tax_rate?: number;
  service_charge_rate?: number;
  check_in_time?: string;
  check_out_time?: string;
  cancellation_policy?: string;
  branding?: BrandingSchema;
  social_media?: SocialMediaSchema;
  payment_settings?: PaymentSettingsSchema;
  print_settings?: PrintSettingsSchema;
  tagline?: string;
  gstin?: string | null;
}

export const hotelSettingsService = {
  /**
   * Get hotel settings from backend
   */
  getSettings: async (): Promise<HotelSettingsResponse | null> => {
    try {
      const response = await apiClient.get<HotelSettingsResponse>(
        API_ENDPOINTS.HOTEL_SETTINGS.GET
      );

      // Handle various response formats
      const data = response.data;
      if ((data as any)?.data) {
        return (data as any).data;
      }
      return data;
    } catch (error) {
      console.error('[hotelSettingsService.getSettings] Error:', error);
      return null;
    }
  },

  /**
   * Update hotel settings
   */
  updateSettings: async (update: HotelSettingsUpdate): Promise<HotelSettingsResponse | null> => {
    try {
      const response = await apiClient.put<HotelSettingsResponse>(
        API_ENDPOINTS.HOTEL_SETTINGS.UPDATE,
        update
      );

      // Handle various response formats
      const data = response.data;
      if ((data as any)?.data) {
        return (data as any).data;
      }
      return data;
    } catch (error) {
      console.error('[hotelSettingsService.updateSettings] Error:', error);
      throw error;
    }
  },
};

export default hotelSettingsService;
