import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type {
  BookingDraft,
  GuestInformation,
  Room,
} from '@/api/types/booking.types';
import { differenceInDays } from 'date-fns';

interface BookingState {
  // Current booking draft
  draft: BookingDraft | null;
  guestInfo: GuestInformation | null;

  // Actions
  startBooking: (
    room: Room,
    checkIn: Date,
    checkOut: Date,
    guests: { adults: number; children: number; infants: number }
  ) => void;
  updateDates: (checkIn: Date, checkOut: Date) => void;
  updateGuests: (guests: {
    adults: number;
    children: number;
    infants: number;
  }) => void;
  setGuestInfo: (info: GuestInformation) => void;
  clearBooking: () => void;

  // Helper
  calculatePricing: (
    basePrice: number,
    nights: number
  ) => { basePrice: number; taxes: number; serviceFee: number; totalPrice: number };
}

export const useBookingStore = create<BookingState>()(
  devtools(
    persist(
      (set, get) => ({
        draft: null,
        guestInfo: null,

        startBooking: (room, checkIn, checkOut, guests) => {
          const nights = differenceInDays(checkOut, checkIn);
          const pricing = get().calculatePricing(room.price, nights);

          set({
            draft: {
              roomId: room.id,
              room,
              checkIn,
              checkOut,
              guests,
              nights,
              ...pricing,
            },
          });
        },

        updateDates: (checkIn, checkOut) => {
          const { draft } = get();
          if (!draft || !draft.room) return;

          const nights = differenceInDays(checkOut, checkIn);
          const pricing = get().calculatePricing(draft.room.price, nights);

          set({
            draft: {
              ...draft,
              checkIn,
              checkOut,
              nights,
              ...pricing,
            },
          });
        },

        updateGuests: (guests) => {
          const { draft } = get();
          if (!draft) return;

          set({
            draft: {
              ...draft,
              guests,
            },
          });
        },

        setGuestInfo: (info) => {
          set({ guestInfo: info });
        },

        clearBooking: () => {
          set({ draft: null, guestInfo: null });
        },

        calculatePricing: (basePrice, nights) => {
          // SST: Use centralized pricing function
          const { calculateRoomPrice } = require('@/utils/pricing-sst');
          const pricing = calculateRoomPrice(basePrice, nights);

          return {
            basePrice: pricing.baseAmount,
            taxes: pricing.taxAmount,
            serviceFee: 0,
            totalPrice: pricing.totalAmount,
          };
        },
      }),
      {
        name: 'booking-storage',
        partialize: (state) => ({
          draft: state.draft,
          guestInfo: state.guestInfo,
        }),
      }
    ),
    { name: 'BookingStore' }
  )
);
