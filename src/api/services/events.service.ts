/**
 * Events & Banquet Service
 */
import { apiClient } from '../client';

const BASE = '/api/v1/events';

export interface EventInquiry {
  id: number;
  inquiry_number: string;
  event_name: string;
  event_type: string;
  contact_name: string;
  contact_phone: string;
  contact_email: string;
  start_date: string;
  end_date: string;
  expected_guests: number;
  status: string;
  notes?: string;
  created_at: string;
  total_amount?: number;
}

export interface Hall {
  id: number;
  name: string;
  capacity_theatre: number;
  capacity_banquet: number;
  capacity_classroom: number;
  capacity_cocktail: number;
  rate_per_day: number;
  image_url?: string;
  status: 'available' | 'booked' | 'maintenance';
}

export interface HallBooking {
  hall_id: number;
  date: string;
  status: 'booked' | 'available';
  event_name?: string;
}

export interface EventPackage {
  id: number;
  event_id: number;
  rooms: any[];
  meals: any[];
  venue: any;
  services: any[];
  pricing: any;
  status: 'draft' | 'confirmed';
}

export const eventsService = {
  // Inquiries
  getInquiries: async (params?: { status?: string; event_type?: string }): Promise<EventInquiry[]> => {
    const res = await apiClient.get(`${BASE}/inquiries`, { params });
    return res.data?.data || res.data || [];
  },
  getInquiry: async (id: number): Promise<EventInquiry> => {
    const res = await apiClient.get(`${BASE}/inquiries/${id}`);
    return res.data?.data || res.data;
  },
  createInquiry: async (data: Partial<EventInquiry>): Promise<EventInquiry> => {
    const res = await apiClient.post(`${BASE}/inquiries`, data);
    return res.data?.data || res.data;
  },
  updateInquiry: async (id: number, data: Partial<EventInquiry>): Promise<EventInquiry> => {
    const res = await apiClient.patch(`${BASE}/inquiries/${id}`, data);
    return res.data?.data || res.data;
  },

  // Halls
  getHalls: async (): Promise<Hall[]> => {
    const res = await apiClient.get(`${BASE}/halls`);
    return res.data?.data || res.data || [];
  },
  getHallAvailability: async (startDate: string, endDate: string): Promise<HallBooking[]> => {
    const res = await apiClient.get(`${BASE}/halls/availability`, { params: { start_date: startDate, end_date: endDate } });
    return res.data?.data || res.data || [];
  },

  // Packages
  getPackage: async (eventId: number): Promise<EventPackage | null> => {
    try {
      const res = await apiClient.get(`${BASE}/inquiries/${eventId}/package`);
      return res.data?.data || res.data;
    } catch { return null; }
  },
  savePackage: async (eventId: number, data: Partial<EventPackage>): Promise<EventPackage> => {
    const res = await apiClient.post(`${BASE}/inquiries/${eventId}/package`, data);
    return res.data?.data || res.data;
  },
  confirmPackage: async (eventId: number): Promise<EventPackage> => {
    const res = await apiClient.post(`${BASE}/inquiries/${eventId}/confirm`);
    return res.data?.data || res.data;
  },

  // Reports
  getReportSummary: async (params?: { start_date?: string; end_date?: string }): Promise<any> => {
    const res = await apiClient.get(`${BASE}/reports/summary`, { params });
    return res.data?.data || res.data;
  },
};
