import { z } from 'zod';

export const bookingWidgetSchema = z
  .object({
    checkIn: z.date({
      message: 'Check-in date is required',
    }),
    checkOut: z.date({
      message: 'Check-out date is required',
    }),
    adults: z
      .number()
      .min(1, 'At least 1 adult is required')
      .max(10, 'Maximum 10 adults'),
    children: z.number().min(0).max(5, 'Maximum 5 children'),
    infants: z.number().min(0).max(2, 'Maximum 2 infants'),
    specialRequests: z.string().max(500, 'Maximum 500 characters').optional(),
  })
  .refine((data) => data.checkOut >= data.checkIn, {
    message: 'Check-out cannot be before check-in',
    path: ['checkOut'],
  })
  .refine(
    (data) => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return data.checkIn >= today;
    },
    {
      message: 'Check-in date must be today or in the future',
      path: ['checkIn'],
    }
  );

export const createBookingSchema = z.object({
  roomId: z.string().min(1, 'Room is required'),
  checkIn: z.string().min(1, 'Check-in date is required'),
  checkOut: z.string().min(1, 'Check-out date is required'),
  guests: z.number().min(1, 'At least 1 guest is required'),
  specialRequests: z.string().max(500).optional(),
});

export const guestInfoSchema = z.object({
  firstName: z
    .string()
    .min(2, 'First name must be at least 2 characters')
    .max(50, 'First name must be less than 50 characters'),
  lastName: z
    .string()
    .min(2, 'Last name must be at least 2 characters')
    .max(50, 'Last name must be less than 50 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number'),
  country: z.string().min(2, 'Please select a country'),
  specialRequests: z
    .string()
    .max(500, 'Special requests must be less than 500 characters')
    .optional(),
});

export const paymentInfoSchema = z.object({
  cardNumber: z
    .string()
    .regex(/^\d{16}$/, 'Card number must be 16 digits')
    .transform((val) => val.replace(/\s/g, '')),
  cardHolder: z
    .string()
    .min(3, 'Card holder name is required')
    .max(50, 'Card holder name must be less than 50 characters'),
  expiryDate: z
    .string()
    .regex(/^(0[1-9]|1[0-2])\/\d{2}$/, 'Expiry date must be in MM/YY format'),
  cvv: z.string().regex(/^\d{3,4}$/, 'CVV must be 3 or 4 digits'),
  saveCard: z.boolean().optional().default(false),
});

// Type exports
export type BookingWidgetFormData = z.infer<typeof bookingWidgetSchema>;
export type CreateBookingFormData = z.infer<typeof createBookingSchema>;
export type GuestInfoFormData = z.infer<typeof guestInfoSchema>;
export type PaymentInfoFormData = z.infer<typeof paymentInfoSchema>;
