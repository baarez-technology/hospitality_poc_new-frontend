import { apiClient, extractData } from '../client';

export interface RoomMove {
  id: number;
  booking_id: number;
  from_room_id: number;
  to_room_id: number;
  scheduled_date: string;
  move_reason: string | null;
  status: string;
  moved_at: string | null;
  moved_by: number | null;
  notes: string | null;
  created_at: string;
  from_room_number?: string;
  to_room_number?: string;
}

export const roomMovesService = {
  list: async (params?: {
    booking_id?: number;
    status?: string;
    scheduled_date?: string;
    limit?: number;
  }) => {
    const res = await apiClient.get('/api/v1/room-moves', { params });
    return extractData(res)?.items || [];
  },

  create: async (data: {
    booking_id: number;
    to_room_id: number;
    scheduled_date: string;
    move_reason?: string;
    notes?: string;
  }): Promise<RoomMove> => {
    const res = await apiClient.post('/api/v1/room-moves', data);
    return extractData(res);
  },

  execute: async (id: number, notes?: string): Promise<any> => {
    const res = await apiClient.post(`/api/v1/room-moves/${id}/execute`, { notes });
    return extractData(res);
  },

  cancel: async (id: number) => {
    const res = await apiClient.post(`/api/v1/room-moves/${id}/cancel`);
    return extractData(res);
  },

  checkPending: async () => {
    const res = await apiClient.get('/api/v1/room-moves/pending/check');
    return extractData(res);
  },
};
