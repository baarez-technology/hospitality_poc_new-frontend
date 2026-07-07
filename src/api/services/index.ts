/**
 * API Services - Central Export
 *
 * All API service modules for the Glimmora Hotel Management System.
 * Import services from this file for consistency.
 */

// Authentication & User
export * from './auth.service';
export * from './user.service';

// Bookings & Reservations
export * from './booking.service';
export * from './reservation.service';

// Rooms
export * from './rooms.service';

// Pre-Check-In
export * from './precheckin.service';

// Payments
export * from './payment-config.service';
export * from './saved-cards.service';
export * from './razorpay.service';

// OTP Verification
export * from './otp.service';

// Dashboards
export * from './dashboard.service';
export * from './dashboards.service';

// Guest Services
export * from './guest-ai.service';
export * from './guest-chat.service';
export * from './guests.service';

// Staff Management
export * from './staff.service';

// Housekeeping
export * from './housekeeping.service';

// Admin Services (conditional import)
export * from './frontdesk.service';

// Revenue Intelligence
export * from './revenue-intelligence.service';

// Overbooking Management
export * from './overbooking.service';

// Maintenance
export * from './maintenance.service';

// CRM AI Services
export * from './crm-ai.service';
export * from './ab-testing.service';
export * from './ota-conversion.service';
export * from './member-tiers.service';
export * from './ai-segmentation.service';

// Export client for direct use if needed
export { apiClient, setAccessToken } from '../client';
