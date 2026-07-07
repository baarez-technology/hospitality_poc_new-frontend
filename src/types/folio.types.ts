/** Folio/Billing TypeScript interfaces */

export interface FolioLineItem {
  id: number;
  folio_id: number;
  item_type: string;
  description: string;
  quantity: number;
  unit_price: number;
  amount: number;
  posted_by: number | null;
  posted_at: string;
  reference_id: number | null;
  is_voided: boolean;
  voided_by: number | null;
  voided_at: string | null;
  original_line_item_id: number | null;
  source_folio_id: number | null;
  created_at: string;
  // Tax breakdown fields (from Sprint 1 backend)
  tax_amount: number | null;
  tax_rate_pct: number | null;
  tax_component_1_name: string | null;
  tax_component_1_pct: number | null;
  tax_component_1_amount: number | null;
  tax_component_2_name: string | null;
  tax_component_2_pct: number | null;
  tax_component_2_amount: number | null;
}

export interface FolioPayment {
  id: number;
  folio_id: number;
  amount: number;
  currency: string;
  method: string;
  payment_type: string;
  transaction_id: string | null;
  authorization_code: string | null;
  card_last4: string | null;
  card_brand: string | null;
  status: string;
  processed_by: number | null;
  processed_at: string | null;
  refund_reason: string | null;
  notes: string | null;
  created_at: string;
}

export interface Folio {
  id: number;
  booking_id: number;
  folio_number: string;
  window_label: string;
  folio_type: string;
  total_charges: number;
  total_payments: number;
  balance: number;
  currency: string;
  status: string;
  invoice_number: string | null;
  is_settled: boolean;
  print_count: number;
  created_at: string;
  closed_at: string | null;
  line_items?: FolioLineItem[];
  payments?: FolioPayment[];
  line_item_count?: number;
  // Group booking fields
  is_parent_booking?: boolean;
  is_group_master?: boolean;
  is_child_booking?: boolean;
  individual_balance?: number;
  display_balance?: number;
  actual_balance?: number;
  parent_info?: {
    parent_booking_id: number;
    parent_booking_number: string;
    balance_note: string;
  };
}

export interface PostChargeData {
  item_type?: string;
  description: string;
  quantity?: number;
  unit_price: number;
  notes?: string;
}

export interface PostPaymentData {
  amount: number;
  method?: string;
  payment_type?: string;
  transaction_id?: string;
  authorization_code?: string;
  card_last4?: string;
  card_brand?: string;
  notes?: string;
}

export interface PostRefundData {
  amount: number;
  reason: string;
  original_payment_id?: number;
  method?: string;
}

export interface AdjustChargeData {
  adjustment_amount: number;  // Amount to DEDUCT (rebate). E.g., 500 means reduce by ₹500
  reason: string;
}

export interface TransferChargeData {
  line_item_ids: number[];
  target_folio_id: number;
  notes?: string;
}

export interface SettleFolioData {
  payment_method?: string;
  corporate_account_id?: number;
  notes?: string;
}

export interface RoutingRule {
  id: number;
  booking_id: number;
  charge_category: string;
  target_folio_id: number;
  payment_method: string | null;
  created_at: string;
}

export interface FolioStatement {
  folio: Folio;
  booking: any;
  guest: { name: string; email?: string; phone?: string };
  line_items: Array<FolioLineItem & { running_balance: number }>;
  payments: FolioPayment[];
}
