import { apiClient, extractData } from '../client';

export interface RoomRequest {
  room_type_id: number;
  adults?: number;
  children?: number;
  special_requests?: string;
}

export interface MultiRoomBooking {
  group_booking_id: number;
  parent_booking_id: number;
  guest_name: string | null;
  arrival_date: string;
  departure_date: string;
  nights?: number;
  payment_method?: string;
  booking_source?: string;
  number_of_rooms: number;
  total_price: number;
  bookings: {
    id: number;
    booking_number: string;
    is_parent: boolean;
    room_type: string | null;
    room_number: string | null;
    status: string;
    adults: number;
    children: number;
    total_price: number;
  }[];
}

export const multiRoomService = {
  create: (data: {
    guest_id: number;
    arrival_date: string;
    departure_date: string;
    rooms: RoomRequest[];
    payment_method?: string;
    booking_source?: string;
    corporate_account_id?: number;
  }) =>
    apiClient.post('/api/v1/multi-room/create', data).then(extractData),

  getLinkedBookings: (parentBookingId: number) =>
    apiClient.get(`/api/v1/multi-room/${parentBookingId}`).then(extractData),

  addRoom: (parentBookingId: number, data: RoomRequest) =>
    apiClient.post(`/api/v1/multi-room/${parentBookingId}/add-room`, data).then(extractData),

  cancelRoom: (bookingId: number) =>
    apiClient.post(`/api/v1/multi-room/${bookingId}/cancel-room`).then(extractData),
};
