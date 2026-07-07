/**
 * Booking Notifications Service
 * Handles email notifications for booking changes
 *
 * Architecture:
 * - Template-based email generation
 * - Uses existing guestsService.sendMessage() API
 * - Professional email formatting
 */

import { guestsService } from '@/api/services/guests.service';

// ── Types ────────────────────────────────────────────────────────────

export interface BookingInfo {
  id: string | number;
  bookingNumber?: string;
  guestId?: string | number;
  guestName: string;
  guestEmail?: string;
  checkIn: string;
  checkOut: string;
  roomType?: string;
  room?: string;
  nights?: number;
  totalPrice?: number;
}

export interface DateChangeInfo {
  oldCheckIn: string;
  oldCheckOut: string;
  newCheckIn: string;
  newCheckOut: string;
  oldNights: number;
  newNights: number;
}

export interface NotificationResult {
  success: boolean;
  emailSent: boolean;
  error?: string;
}

// ── Helper Functions ─────────────────────────────────────────────────

/**
 * Format date for display in emails
 */
function formatDate(dateStr: string): string {
  if (!dateStr) return 'N/A';
  try {
    const date = new Date(dateStr + 'T12:00:00');
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } catch {
    return dateStr;
  }
}

/**
 * Format currency for display
 */
function formatCurrency(amount: number, currency = 'INR'): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

// ── Email Template Generators ────────────────────────────────────────

/**
 * Generate professional email for booking date changes
 */
function generateDateChangeEmail(
  booking: BookingInfo,
  dateChange: DateChangeInfo
): { subject: string; message: string } {
  const isExtension = dateChange.newNights > dateChange.oldNights;
  const isShortening = dateChange.newNights < dateChange.oldNights;
  const checkInChanged = dateChange.oldCheckIn !== dateChange.newCheckIn;
  const checkOutChanged = dateChange.oldCheckOut !== dateChange.newCheckOut;

  let changeDescription = '';
  if (checkInChanged && checkOutChanged) {
    changeDescription = 'Your check-in and check-out dates have been updated';
  } else if (checkInChanged) {
    changeDescription = 'Your check-in date has been updated';
  } else if (checkOutChanged) {
    if (isExtension) {
      changeDescription = 'Your stay has been extended';
    } else if (isShortening) {
      changeDescription = 'Your check-out date has been updated to an earlier date';
    } else {
      changeDescription = 'Your check-out date has been updated';
    }
  }

  const subject = `Booking Update - ${changeDescription} | Ref: ${booking.bookingNumber || booking.id}`;

  const message = `
Dear ${booking.guestName},

We hope this message finds you well.

${changeDescription} for your upcoming reservation at our hotel. Please find the updated details below:

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
UPDATED RESERVATION DETAILS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Booking Reference: ${booking.bookingNumber || booking.id}
${booking.roomType ? `Room Type: ${booking.roomType}` : ''}
${booking.room ? `Room Number: ${booking.room}` : ''}

PREVIOUS DATES:
  Check-in:  ${formatDate(dateChange.oldCheckIn)}
  Check-out: ${formatDate(dateChange.oldCheckOut)}
  Duration:  ${dateChange.oldNights} night${dateChange.oldNights !== 1 ? 's' : ''}

NEW DATES:
  Check-in:  ${formatDate(dateChange.newCheckIn)}
  Check-out: ${formatDate(dateChange.newCheckOut)}
  Duration:  ${dateChange.newNights} night${dateChange.newNights !== 1 ? 's' : ''}

${booking.totalPrice ? `\nUpdated Total: ${formatCurrency(booking.totalPrice)}` : ''}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${isExtension ? `
We're delighted that you've chosen to extend your stay with us. We look forward to providing you with an exceptional experience during your additional time.
` : ''}
${isShortening ? `
We understand that plans can change. If there's anything we can do to make your shortened stay more comfortable, please don't hesitate to let us know.
` : ''}

If you have any questions or need further assistance regarding this change, please feel free to contact us at any time.

We look forward to welcoming you!

Warm regards,
The Hotel Team

---
This is an automated notification. Please do not reply directly to this email.
For assistance, please contact our front desk.
`.trim();

  return { subject, message };
}

/**
 * Generate email for booking confirmation
 */
function generateBookingConfirmationEmail(booking: BookingInfo): { subject: string; message: string } {
  const subject = `Booking Confirmed | Ref: ${booking.bookingNumber || booking.id}`;

  const message = `
Dear ${booking.guestName},

Thank you for choosing our hotel. Your booking has been confirmed.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
RESERVATION DETAILS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Booking Reference: ${booking.bookingNumber || booking.id}
${booking.roomType ? `Room Type: ${booking.roomType}` : ''}

Check-in:  ${formatDate(booking.checkIn)}
Check-out: ${formatDate(booking.checkOut)}
Duration:  ${booking.nights || 1} night${(booking.nights || 1) !== 1 ? 's' : ''}

${booking.totalPrice ? `Total Amount: ${formatCurrency(booking.totalPrice)}` : ''}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

We look forward to welcoming you!

Warm regards,
The Hotel Team
`.trim();

  return { subject, message };
}

// ── Notification Sending Functions ───────────────────────────────────

/**
 * Send email notification when booking dates change
 */
export async function sendDateChangeNotification(
  booking: BookingInfo,
  dateChange: DateChangeInfo
): Promise<NotificationResult> {
  // Need guest ID to send email
  if (!booking.guestId) {
    console.warn('[sendDateChangeNotification] No guestId provided, skipping email');
    return { success: false, emailSent: false, error: 'No guest ID available' };
  }

  try {
    const { subject, message } = generateDateChangeEmail(booking, dateChange);

    const result = await guestsService.sendMessage(booking.guestId, {
      subject,
      message,
      template: 'booking_date_change',
    });

    console.log('[sendDateChangeNotification] Email sent:', result);

    return {
      success: result.success,
      emailSent: result.email_sent,
    };
  } catch (error: any) {
    console.error('[sendDateChangeNotification] Error:', error);
    return {
      success: false,
      emailSent: false,
      error: error?.response?.data?.detail || error?.message || 'Failed to send notification',
    };
  }
}

/**
 * Send booking confirmation email
 */
export async function sendBookingConfirmationNotification(
  booking: BookingInfo
): Promise<NotificationResult> {
  if (!booking.guestId) {
    console.warn('[sendBookingConfirmationNotification] No guestId provided, skipping email');
    return { success: false, emailSent: false, error: 'No guest ID available' };
  }

  try {
    const { subject, message } = generateBookingConfirmationEmail(booking);

    const result = await guestsService.sendMessage(booking.guestId, {
      subject,
      message,
      template: 'booking_confirmation',
    });

    return {
      success: result.success,
      emailSent: result.email_sent,
    };
  } catch (error: any) {
    console.error('[sendBookingConfirmationNotification] Error:', error);
    return {
      success: false,
      emailSent: false,
      error: error?.response?.data?.detail || error?.message || 'Failed to send notification',
    };
  }
}

// ── Export service object ────────────────────────────────────────────

export const bookingNotificationsService = {
  sendDateChangeNotification,
  sendBookingConfirmationNotification,
  // Expose generators for testing/preview
  generateDateChangeEmail,
  generateBookingConfirmationEmail,
};

export default bookingNotificationsService;
