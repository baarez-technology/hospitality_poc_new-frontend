import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { Room } from '@/api/types/booking.types';
import { useGSTCalculator } from '@/hooks/useGSTCalculator';

const BOOKING_DATA_KEY = 'glimmora_booking_data';

interface OriginalBookingData {
  id: string;
  bookingNumber: string;
  checkIn: string;
  checkOut: string;
  totalPrice: number;
  paymentStatus: string;
  nights: number;
}

// Flexible payment data structure supporting multiple payment methods
interface PaymentData {
  // Payment method used
  method?: 'razorpay' | 'stripe' | 'pay_at_hotel' | 'manual';
  // Payment status
  status?: 'pending' | 'paid' | 'failed' | 'refunded';
  // Transaction ID from payment gateway
  transactionId?: string;
}

interface BookingData {
  room: Room | null;
  checkIn: string;
  checkOut: string;
  guests: {
    adults: number;
    children: number;
  };
  guestInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    specialRequests?: string;
    eta?: string;
    etd?: string;
  };
  payment: PaymentData;
  bookingNumber?: string;
  datesFromUrl?: boolean; // Track if dates came from URL parameters
  // Modification mode fields
  isModifyMode?: boolean;
  originalBooking?: OriginalBookingData | null;
}

interface BookingContextType {
  bookingData: BookingData;
  updateBookingData: (data: Partial<BookingData>) => void;
  resetBooking: () => void;
  calculateTotal: () => { subtotal: number; tax: number; serviceFee: number; total: number; nights: number; taxRate: number; cgst: number; sgst: number; cgstRate: number; sgstRate: number };
}

const BookingContext = createContext<BookingContextType | undefined>(undefined);

const initialBookingData: BookingData = {
  room: null,
  checkIn: '',
  checkOut: '',
  guests: {
    adults: 1,
    children: 0,
  },
  guestInfo: {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    specialRequests: '',
    eta: '',
    etd: '',
  },
  payment: {
    method: undefined,
    status: undefined,
    transactionId: undefined,
  },
  datesFromUrl: false,
  isModifyMode: false,
  originalBooking: null,
};

// Load initial data from sessionStorage
const loadPersistedData = (): BookingData => {
  try {
    const saved = sessionStorage.getItem(BOOKING_DATA_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      // Merge with initial data to ensure all fields exist
      return { ...initialBookingData, ...parsed };
    }
  } catch (e) {
    console.error('Failed to load booking data from session:', e);
  }
  return initialBookingData;
};

export function BookingProvider({ children }: { children: ReactNode }) {
  const [bookingData, setBookingData] = useState<BookingData>(loadPersistedData);
  const { calculateGST } = useGSTCalculator();

  // Persist booking data to sessionStorage whenever it changes
  useEffect(() => {
    try {
      // Only persist if there's meaningful data (room selected)
      if (bookingData.room) {
        sessionStorage.setItem(BOOKING_DATA_KEY, JSON.stringify(bookingData));
      }
    } catch (e) {
      console.error('Failed to save booking data to session:', e);
    }
  }, [bookingData]);

  const updateBookingData = useCallback((data: Partial<BookingData>) => {
    setBookingData((prev) => ({ ...prev, ...data }));
  }, []);

  const resetBooking = useCallback(() => {
    setBookingData(initialBookingData);
    // Clear persisted data when resetting
    try {
      sessionStorage.removeItem(BOOKING_DATA_KEY);
    } catch (e) {
      console.error('Failed to clear booking data from session:', e);
    }
  }, []);

  const calculateTotal = useCallback(() => {
    if (!bookingData.room || !bookingData.checkIn || !bookingData.checkOut) {
      return { subtotal: 0, tax: 0, serviceFee: 0, total: 0, nights: 0, taxRate: 0, cgst: 0, sgst: 0, cgstRate: 0, sgstRate: 0 };
    }

    const checkIn = new Date(bookingData.checkIn);
    const checkOut = new Date(bookingData.checkOut);
    const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));

    const subtotal = bookingData.room.price * nights;
    const gst = calculateGST(bookingData.room.price, nights);
    const tax = gst.taxAmount;
    const serviceFee = gst.serviceFee;
    const total = gst.total;

    return { subtotal, tax, serviceFee, total, nights, taxRate: gst.taxRate, cgst: gst.cgst, sgst: gst.sgst, cgstRate: gst.cgstRate, sgstRate: gst.sgstRate };
  }, [bookingData.room, bookingData.checkIn, bookingData.checkOut, calculateGST]);

  return (
    <BookingContext.Provider value={{ bookingData, updateBookingData, resetBooking, calculateTotal }}>
      {children}
    </BookingContext.Provider>
  );
}

export function useBooking() {
  const context = useContext(BookingContext);
  if (!context) {
    throw new Error('useBooking must be used within BookingProvider');
  }
  return context;
}
