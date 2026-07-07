/**
 * Booking Billing Service
 * Handles billing calculations and folio synchronization when bookings change
 *
 * Architecture:
 * - Pure calculation functions for reusability
 * - Folio sync functions for backend integration
 * - Balance calculation considering payments made
 */

import { folioService } from '@/api/services/folio.service';
import { calculateRoomGST, type GSTBreakdown } from '@/hooks/useGSTCalculator';

// ── Types ────────────────────────────────────────────────────────────

export interface BillingCalculation {
  nights: number;
  ratePerNight: number;
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  cgst: number;
  sgst: number;
  serviceFee: number;
  totalPrice: number;
  amountPaid: number;
  balanceDue: number;
}

export interface BookingDates {
  checkIn: string;
  checkOut: string;
}

export interface BookingBillingData {
  checkIn: string;
  checkOut: string;
  ratePerNight: number;
  amountPaid?: number;
}

// ── Pure Calculation Functions ───────────────────────────────────────

/**
 * Calculate number of nights between check-in and check-out
 */
export function calculateNights(checkIn: string, checkOut: string): number {
  if (!checkIn || !checkOut) return 0;
  const start = new Date(checkIn);
  const end = new Date(checkOut);
  const diffMs = end.getTime() - start.getTime();
  // Use floor (not ceil) to match backend calculation
  // Same-day checkout = 0 days, but we enforce minimum 1 night
  const nights = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  return Math.max(1, nights);
}

/**
 * Calculate full billing breakdown for a booking
 * Uses GST calculator for tax computation
 */
export function calculateBillingBreakdown(
  data: BookingBillingData,
  taxSlabs: any[] = []
): BillingCalculation {
  const nights = calculateNights(data.checkIn, data.checkOut);
  const ratePerNight = data.ratePerNight || 0;
  const subtotal = ratePerNight * nights;

  // Use GST calculator for proper tax computation
  const gst: GSTBreakdown = calculateRoomGST(ratePerNight, nights, taxSlabs);

  const amountPaid = data.amountPaid || 0;
  const balanceDue = Math.max(0, gst.total - amountPaid);

  return {
    nights,
    ratePerNight,
    subtotal,
    taxRate: gst.taxRate,
    taxAmount: gst.taxAmount,
    cgst: gst.cgst,
    sgst: gst.sgst,
    serviceFee: gst.serviceFee,
    totalPrice: gst.total,
    amountPaid,
    balanceDue,
  };
}

/**
 * Check if dates have changed between old and new booking data
 */
export function haveDatesChanged(
  oldDates: BookingDates,
  newDates: BookingDates
): { checkInChanged: boolean; checkOutChanged: boolean; anyChanged: boolean } {
  const checkInChanged = oldDates.checkIn !== newDates.checkIn;
  const checkOutChanged = oldDates.checkOut !== newDates.checkOut;
  return {
    checkInChanged,
    checkOutChanged,
    anyChanged: checkInChanged || checkOutChanged,
  };
}

/**
 * Calculate the difference in billing when dates change
 */
export function calculateBillingDifference(
  oldBilling: BillingCalculation,
  newBilling: BillingCalculation
): {
  nightsDiff: number;
  totalDiff: number;
  balanceDiff: number;
  isExtension: boolean;
  isShortening: boolean;
} {
  const nightsDiff = newBilling.nights - oldBilling.nights;
  const totalDiff = newBilling.totalPrice - oldBilling.totalPrice;
  const balanceDiff = newBilling.balanceDue - oldBilling.balanceDue;

  return {
    nightsDiff,
    totalDiff,
    balanceDiff,
    isExtension: nightsDiff > 0,
    isShortening: nightsDiff < 0,
  };
}

// ── Folio Sync Functions ─────────────────────────────────────────────

/**
 * Sync folio charges when booking dates/rates change
 * This should be called after a booking update that affects billing
 */
export async function syncFolioCharges(
  bookingId: string | number,
  newBilling: BillingCalculation
): Promise<{ success: boolean; error?: string }> {
  try {
    // Get existing folios for the booking
    const foliosRes = await folioService.listFolios(bookingId, true);
    const folios = foliosRes.folios || [];

    if (folios.length === 0) {
      // No folio exists - auto-create one
      await folioService.autoCreateFolio(bookingId);
      return { success: true };
    }

    // Find the main guest folio (usually the first one or type 'room')
    const mainFolio = folios.find((f: any) =>
      f.folio_type === 'room' || f.folio_type === 'guest'
    ) || folios[0];

    if (mainFolio) {
      // Post updated room charges - this will recalculate based on new dates
      await folioService.postRoomCharges(bookingId, mainFolio.id);
    }

    return { success: true };
  } catch (error: any) {
    console.error('[syncFolioCharges] Error:', error);
    return {
      success: false,
      error: error?.response?.data?.detail || 'Failed to sync folio charges'
    };
  }
}

/**
 * Get current folio balance for a booking
 */
export async function getFolioBalance(
  bookingId: string | number
): Promise<{ totalCharges: number; totalPayments: number; balance: number }> {
  try {
    const foliosRes = await folioService.listFolios(bookingId, true);
    const folios = foliosRes.folios || [];

    // Sum up all folio balances
    let totalCharges = 0;
    let totalPayments = 0;

    for (const folio of folios) {
      totalCharges += folio.total_charges || 0;
      totalPayments += folio.total_payments || 0;
    }

    return {
      totalCharges,
      totalPayments,
      balance: totalCharges - totalPayments,
    };
  } catch (error) {
    console.error('[getFolioBalance] Error:', error);
    return { totalCharges: 0, totalPayments: 0, balance: 0 };
  }
}

// ── Export default service object ────────────────────────────────────

export const bookingBillingService = {
  calculateNights,
  calculateBillingBreakdown,
  haveDatesChanged,
  calculateBillingDifference,
  syncFolioCharges,
  getFolioBalance,
};

export default bookingBillingService;
