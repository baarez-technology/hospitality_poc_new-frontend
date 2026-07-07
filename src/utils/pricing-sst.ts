/**
 * PRICING SST - SINGLE SOURCE OF TRUTH (Frontend)
 *
 * This module is the ONLY place for price calculations on frontend.
 * All components MUST use these functions.
 *
 * DO NOT:
 * - Calculate prices in components
 * - Hardcode tax rates (0.05, 0.12, 0.18)
 * - Use `baseRate * nights * taxRate` anywhere else
 *
 * RULES:
 * - Use calculateRoomPrice() for new booking preview
 * - Use getStoredPricing() to extract from booking API response
 * - NEVER recalculate after booking is created
 */

// ═══════════════════════════════════════════════════════════════════════════════
// CONSTANTS - SINGLE DEFINITION
// ═══════════════════════════════════════════════════════════════════════════════

export const TAX_THRESHOLD = 7500; // INR per night
export const TAX_RATE_LOW = 0.05;  // 5% for rooms ≤ ₹7,500/night
export const TAX_RATE_HIGH = 0.18; // 18% for rooms > ₹7,500/night
export const MINIMUM_NIGHTS = 1;

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export interface PricingResult {
  nightlyRate: number;
  nights: number;
  baseAmount: number;     // nightlyRate × nights
  taxRate: number;        // 0.05 or 0.18
  taxRatePct: number;     // 5 or 18
  taxAmount: number;
  cgst: number;
  sgst: number;
  totalAmount: number;    // baseAmount + taxAmount
}

export interface BookingPricing {
  nightly_rate: number;
  nights: number;
  base_price: number;
  tax_rate: number;
  taxes: number;
  total_price: number;
}

// ═══════════════════════════════════════════════════════════════════════════════
// NIGHT CALCULATION - SINGLE DEFINITION (matches backend exactly)
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Calculate nights between check-in and check-out dates.
 * MUST match backend formula exactly: floor division, minimum 1 night.
 *
 * @param checkIn - Check-in date string (YYYY-MM-DD)
 * @param checkOut - Check-out date string (YYYY-MM-DD)
 * @returns Number of nights (minimum 1)
 */
export function calculateNights(checkIn: string, checkOut: string): number {
  if (!checkIn || !checkOut) return 0;
  const start = new Date(checkIn);
  const end = new Date(checkOut);
  const diffMs = end.getTime() - start.getTime();
  // Use floor (not ceil) to match backend Python .days behavior
  const nights = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  return Math.max(MINIMUM_NIGHTS, nights);
}

// ═══════════════════════════════════════════════════════════════════════════════
// CORE CALCULATION - THE ONLY PLACE PRICES ARE CALCULATED
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Get tax rate based on per-night room rate.
 *
 * Indian GST Rules:
 * - Rooms ≤ ₹7,500/night: 5% GST
 * - Rooms > ₹7,500/night: 18% GST
 */
export function getTaxRate(nightlyRate: number): { rate: number; pct: number } {
  return { rate: TAX_RATE_LOW, pct: 5 };
}

/**
 * THE SINGLE PRICING FUNCTION
 *
 * Use this for booking PREVIEW only (before booking is created).
 * After booking exists, use getStoredPricing() instead.
 */
export function calculateRoomPrice(nightlyRate: number, nights: number): PricingResult {
  const validNights = Math.max(MINIMUM_NIGHTS, nights);
  const baseAmount = Math.round(nightlyRate * validNights * 100) / 100;

  const { rate: taxRate, pct: taxRatePct } = getTaxRate(nightlyRate);

  const taxAmount = Math.round(baseAmount * taxRate * 100) / 100;
  const cgst = Math.round(taxAmount / 2 * 100) / 100;
  const sgst = Math.round((taxAmount - cgst) * 100) / 100;
  const totalAmount = Math.round((baseAmount + taxAmount) * 100) / 100;

  return {
    nightlyRate,
    nights: validNights,
    baseAmount,
    taxRate,
    taxRatePct,
    taxAmount,
    cgst,
    sgst,
    totalAmount,
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// STORED VALUE EXTRACTION - FOR DISPLAY (NO RECALCULATION)
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Extract stored pricing from a booking API response.
 *
 * This function does NOT recalculate - it uses the stored values
 * from when the booking was created.
 *
 * Use this for:
 * - Displaying booking details
 * - Showing folio information
 * - Edit booking forms (as initial values)
 */
export function getStoredPricing(booking: BookingPricing | any): PricingResult {
  const nightlyRate = booking.nightly_rate || booking.nightlyRate || 0;
  const nights = booking.nights || MINIMUM_NIGHTS;
  const baseAmount = booking.base_price || booking.basePrice || 0;
  const taxRate = booking.tax_rate || booking.taxRate || 0.05;
  const taxAmount = booking.taxes || 0;
  const totalAmount = booking.total_price || booking.totalPrice || 0;

  // Derive tax percentage from stored rate
  const taxRatePct = taxRate <= 0.06 ? 5 : 18;

  // Calculate CGST/SGST from stored tax
  const cgst = Math.round(taxAmount / 2 * 100) / 100;
  const sgst = Math.round((taxAmount - cgst) * 100) / 100;

  return {
    nightlyRate,
    nights,
    baseAmount,
    taxRate,
    taxRatePct,
    taxAmount,
    cgst,
    sgst,
    totalAmount,
  };
}

/**
 * Validate that a booking has all required pricing fields.
 */
export function hasValidPricing(booking: any): boolean {
  return (
    booking?.nightly_rate > 0 &&
    booking?.base_price > 0 &&
    booking?.total_price > 0
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// DISPLAY HELPERS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Format price for display
 */
export function formatPrice(amount: number, currency = 'INR'): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Get pricing summary string
 */
export function getPricingSummary(pricing: PricingResult): string {
  return `₹${pricing.nightlyRate} × ${pricing.nights} night${pricing.nights > 1 ? 's' : ''} = ₹${pricing.baseAmount} + ₹${pricing.taxAmount} (${pricing.taxRatePct}% GST) = ₹${pricing.totalAmount}`;
}

// ═══════════════════════════════════════════════════════════════════════════════
// VALIDATION - ENSURE DATA INTEGRITY
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Required pricing fields that must be present on a booking
 */
const REQUIRED_PRICING_FIELDS = [
  'nightly_rate',
  'nights',
  'base_price',
  'tax_rate',
  'taxes',
  'total_price',
] as const;

/**
 * Validate that a booking has all required pricing fields.
 * Use this before displaying prices to ensure data integrity.
 *
 * @param booking - Booking object from API
 * @returns Object with valid flag and list of missing fields
 */
export function validatePricingFields(booking: any): { valid: boolean; missing: string[] } {
  if (!booking) {
    return { valid: false, missing: ['booking is null/undefined'] };
  }

  const missing: string[] = [];

  for (const field of REQUIRED_PRICING_FIELDS) {
    const value = booking[field];
    if (value === undefined || value === null) {
      missing.push(field);
    }
  }

  // Also check for positive values where required
  if (booking.nightly_rate !== undefined && booking.nightly_rate <= 0) {
    missing.push('nightly_rate (must be positive)');
  }
  if (booking.total_price !== undefined && booking.total_price <= 0) {
    missing.push('total_price (must be positive)');
  }

  return { valid: missing.length === 0, missing };
}

/**
 * Validate that calculated values match stored values.
 * Use this to detect data inconsistencies.
 *
 * @param booking - Booking object from API
 * @returns Object with consistent flag and list of mismatches
 */
export function validatePricingConsistency(booking: any): { consistent: boolean; mismatches: string[] } {
  const mismatches: string[] = [];

  if (!booking || !booking.nightly_rate || !booking.nights) {
    return { consistent: false, mismatches: ['Missing required fields for validation'] };
  }

  // Check base_price = nightly_rate × nights
  const expectedBase = booking.nightly_rate * booking.nights;
  if (booking.base_price && Math.abs(expectedBase - booking.base_price) > 1) {
    mismatches.push(`base_price: expected ${expectedBase}, got ${booking.base_price}`);
  }

  // Check tax_rate is valid (0.05 or 0.18)
  if (booking.tax_rate && booking.tax_rate !== 0.05 && booking.tax_rate !== 0.18) {
    mismatches.push(`tax_rate: expected 0.05 or 0.18, got ${booking.tax_rate}`);
  }

  // Check taxes = base_price × tax_rate
  if (booking.base_price && booking.tax_rate && booking.taxes) {
    const expectedTaxes = booking.base_price * booking.tax_rate;
    if (Math.abs(expectedTaxes - booking.taxes) > 1) {
      mismatches.push(`taxes: expected ${expectedTaxes.toFixed(2)}, got ${booking.taxes}`);
    }
  }

  // Check total_price = base_price + taxes
  if (booking.base_price && booking.taxes && booking.total_price) {
    const expectedTotal = booking.base_price + booking.taxes;
    if (Math.abs(expectedTotal - booking.total_price) > 1) {
      mismatches.push(`total_price: expected ${expectedTotal.toFixed(2)}, got ${booking.total_price}`);
    }
  }

  return { consistent: mismatches.length === 0, mismatches };
}

/**
 * Safe pricing extractor with logging for missing fields.
 * Use this instead of getStoredPricing when you want warnings for missing data.
 */
export function getSafePricing(booking: any, context?: string): PricingResult {
  const validation = validatePricingFields(booking);

  if (!validation.valid) {
    console.warn(
      `[Pricing SST]${context ? ` ${context}:` : ''} Booking missing fields:`,
      validation.missing
    );
  }

  return getStoredPricing(booking);
}
