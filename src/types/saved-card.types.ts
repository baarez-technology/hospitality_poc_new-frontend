/**
 * Saved Card Types
 * Types for managing saved payment cards.
 */

export interface SavedCard {
  id: number;
  card_last4: string;
  card_brand: string;
  card_type: string;
  card_issuer: string | null;
  expiry_month: number;
  expiry_year: number;
  cardholder_name: string | null;
  is_default: boolean;
  is_expired: boolean;
  has_token: boolean; // Whether card has valid Razorpay token for recurring payments
  created_at: string;
  last_used_at: string | null;
}

export interface SavedCardList {
  cards: SavedCard[];
  count: number;
}

export interface SaveCardFromPaymentRequest {
  razorpay_payment_id: string;
  save_card: boolean;
  is_default: boolean;
  auto_refund?: boolean; // Auto-refund if this was a verification payment
}

export interface SaveCardDirectRequest {
  card_last4: string;
  card_brand: string;
  card_type?: string;
  expiry_month: number;
  expiry_year: number;
  cardholder_name?: string;
  is_default?: boolean;
}

// Get card brand display name
export function getCardBrandName(brand: string): string {
  const brandNames: Record<string, string> = {
    visa: 'Visa',
    mastercard: 'Mastercard',
    rupay: 'RuPay',
    amex: 'American Express',
    maestro: 'Maestro',
    diners: 'Diners Club',
  };
  return brandNames[brand.toLowerCase()] || brand;
}
