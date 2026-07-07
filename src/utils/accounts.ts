/**
 * Accounts Constants and Mock Data
 */

export const PERIOD_STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  open:   { label: 'Open',   color: 'bg-green-100 text-green-700' },
  closed: { label: 'Closed', color: 'bg-neutral-200 text-neutral-600' },
  locked: { label: 'Locked', color: 'bg-red-100 text-red-700' },
};

export interface Transaction {
  id: number;
  date: string;
  description: string;
  module: 'POS' | 'Front Office' | 'Banquet' | 'Housekeeping' | 'Purchase';
  debit: number;
  credit: number;
  balance: number;
  reference?: string;
}

export interface PartyAccount {
  id: number;
  company_name: string;
  credit_limit: number;
  outstanding: number;
  last_payment_date: string;
  status: 'active' | 'overdue' | 'suspended';
  contact_person: string;
  phone: string;
  charges: { date: string; description: string; amount: number; type: 'charge' | 'payment' | 'credit_note' }[];
}

export interface BankEntry {
  id: number;
  date: string;
  description: string;
  amount: number;
  type: 'credit' | 'debit';
  matched: boolean;
  matched_txn_id?: number;
}

export interface FiscalPeriod {
  id: number;
  period: string;
  start_date: string;
  end_date: string;
  status: 'open' | 'closed' | 'locked';
  closed_at?: string;
  closed_by?: string;
}

// Mock transactions
export const MOCK_TRANSACTIONS: Transaction[] = [
  { id: 1, date: '2026-04-02', description: 'Room charge - Suite 301', module: 'Front Office', debit: 12500, credit: 0, balance: 12500, reference: 'FO-4521' },
  { id: 2, date: '2026-04-02', description: 'Restaurant bill - Table 5', module: 'POS', debit: 4850, credit: 0, balance: 17350, reference: 'POS-891' },
  { id: 3, date: '2026-04-02', description: 'Card payment received', module: 'Front Office', debit: 0, credit: 12500, balance: 4850, reference: 'PAY-332' },
  { id: 4, date: '2026-04-01', description: 'Wedding reception - Grand Hall', module: 'Banquet', debit: 285000, credit: 0, balance: 289850, reference: 'EVT-45' },
  { id: 5, date: '2026-04-01', description: 'Advance payment - Sharma Wedding', module: 'Banquet', debit: 0, credit: 150000, balance: 139850, reference: 'PAY-330' },
  { id: 6, date: '2026-04-01', description: 'Housekeeping supplies', module: 'Purchase', debit: 8500, credit: 0, balance: 148350, reference: 'PO-2026-002' },
  { id: 7, date: '2026-03-31', description: 'Room service - Room 205', module: 'POS', debit: 2200, credit: 0, balance: 150550, reference: 'POS-888' },
  { id: 8, date: '2026-03-31', description: 'UPI payment received', module: 'Front Office', debit: 0, credit: 8000, balance: 142550, reference: 'PAY-328' },
  { id: 9, date: '2026-03-30', description: 'Conference room - Board Room', module: 'Banquet', debit: 45000, credit: 0, balance: 187550, reference: 'EVT-44' },
  { id: 10, date: '2026-03-30', description: 'Kitchen inventory purchase', module: 'Purchase', debit: 22000, credit: 0, balance: 209550, reference: 'PO-2026-001' },
];

export const MOCK_PARTY_ACCOUNTS: PartyAccount[] = [
  { id: 1, company_name: 'Tata Consultancy Services', credit_limit: 500000, outstanding: 125000, last_payment_date: '2026-03-25', status: 'active', contact_person: 'Anil Mehta', phone: '+91 98765 10001',
    charges: [
      { date: '2026-04-01', description: 'Room charges - 5 rooms x 3 nights', amount: 75000, type: 'charge' },
      { date: '2026-03-28', description: 'Conference room rental', amount: 25000, type: 'charge' },
      { date: '2026-03-25', description: 'Payment received - NEFT', amount: -50000, type: 'payment' },
      { date: '2026-03-20', description: 'Restaurant - Team dinner', amount: 18000, type: 'charge' },
      { date: '2026-03-15', description: 'Credit note - Room upgrade comp', amount: -3000, type: 'credit_note' },
    ]},
  { id: 2, company_name: 'Infosys Limited', credit_limit: 300000, outstanding: 48000, last_payment_date: '2026-03-30', status: 'active', contact_person: 'Priya Nair', phone: '+91 98765 20002',
    charges: [
      { date: '2026-03-30', description: 'Room charges - 2 rooms x 2 nights', amount: 24000, type: 'charge' },
      { date: '2026-03-28', description: 'F&B charges', amount: 12000, type: 'charge' },
      { date: '2026-03-25', description: 'Room charges - 3 rooms', amount: 36000, type: 'charge' },
      { date: '2026-03-20', description: 'NEFT payment', amount: -24000, type: 'payment' },
    ]},
  { id: 3, company_name: 'Reliance Industries', credit_limit: 1000000, outstanding: 340000, last_payment_date: '2026-02-28', status: 'overdue', contact_person: 'Vikram Shah', phone: '+91 98765 30003',
    charges: [
      { date: '2026-03-15', description: 'Annual gala event', amount: 450000, type: 'charge' },
      { date: '2026-02-28', description: 'Partial payment', amount: -110000, type: 'payment' },
    ]},
  { id: 4, company_name: 'Wipro Technologies', credit_limit: 200000, outstanding: 0, last_payment_date: '2026-03-31', status: 'active', contact_person: 'Deepa Rao', phone: '+91 98765 40004',
    charges: [
      { date: '2026-03-31', description: 'Payment received', amount: -15000, type: 'payment' },
      { date: '2026-03-20', description: 'Room charges', amount: 15000, type: 'charge' },
    ]},
];

export const MOCK_BANK_ENTRIES: BankEntry[] = [
  { id: 1, date: '2026-04-02', description: 'NEFT-TCS-REF4521', amount: 12500, type: 'credit', matched: false },
  { id: 2, date: '2026-04-02', description: 'POS SETTLEMENT BATCH 891', amount: 4850, type: 'credit', matched: false },
  { id: 3, date: '2026-04-01', description: 'NEFT-SHARMA WEDDING ADV', amount: 150000, type: 'credit', matched: true, matched_txn_id: 5 },
  { id: 4, date: '2026-04-01', description: 'CHQ DEP 445521', amount: 8500, type: 'debit', matched: false },
  { id: 5, date: '2026-03-31', description: 'UPI-GUEST-PAY328', amount: 8000, type: 'credit', matched: true, matched_txn_id: 8 },
  { id: 6, date: '2026-03-31', description: 'VENDOR PAY-CLEANPRO', amount: 13500, type: 'debit', matched: false },
  { id: 7, date: '2026-03-30', description: 'NEFT-CONF-EVT44', amount: 45000, type: 'credit', matched: false },
];

export const MOCK_PERIODS: FiscalPeriod[] = [
  { id: 1, period: 'April 2026', start_date: '2026-04-01', end_date: '2026-04-30', status: 'open' },
  { id: 2, period: 'March 2026', start_date: '2026-03-01', end_date: '2026-03-31', status: 'closed', closed_at: '2026-04-01T09:00:00', closed_by: 'Accounts Manager' },
  { id: 3, period: 'February 2026', start_date: '2026-02-01', end_date: '2026-02-28', status: 'locked', closed_at: '2026-03-02T10:30:00', closed_by: 'Accounts Manager' },
  { id: 4, period: 'January 2026', start_date: '2026-01-01', end_date: '2026-01-31', status: 'locked', closed_at: '2026-02-01T08:45:00', closed_by: 'General Manager' },
];

export const PRE_CLOSE_CHECKS = [
  { id: 'folios', label: 'All guest folios settled', autoCheck: true },
  { id: 'night_audit', label: 'Night audit completed for all dates', autoCheck: true },
  { id: 'bank_recon', label: 'Bank reconciliation completed', autoCheck: false },
  { id: 'ar_aging', label: 'AR aging report reviewed', autoCheck: false },
  { id: 'pos_closure', label: 'All POS outlets closed', autoCheck: true },
  { id: 'pending_po', label: 'No pending purchase orders', autoCheck: false },
  { id: 'variance', label: 'Cash variance within threshold', autoCheck: true },
];
