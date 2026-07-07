/**
 * Inventory Constants and Mock Data
 */

export const ITEM_CATEGORIES = [
  { value: 'food', label: 'Food' },
  { value: 'beverages', label: 'Beverages' },
  { value: 'housekeeping', label: 'Housekeeping' },
  { value: 'maintenance', label: 'Maintenance' },
  { value: 'kitchen', label: 'Kitchen Supplies' },
  { value: 'office', label: 'Office Supplies' },
  { value: 'linen', label: 'Linen & Laundry' },
] as const;

export const UNITS = [
  { value: 'kg', label: 'Kg' },
  { value: 'litre', label: 'Litre' },
  { value: 'piece', label: 'Piece' },
  { value: 'box', label: 'Box' },
  { value: 'pack', label: 'Pack' },
  { value: 'dozen', label: 'Dozen' },
  { value: 'bottle', label: 'Bottle' },
] as const;

export const PO_STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  draft:          { label: 'Draft',          color: 'bg-neutral-100 text-neutral-600' },
  pending:        { label: 'Pending Approval', color: 'bg-amber-100 text-amber-700' },
  approved:       { label: 'Approved',       color: 'bg-blue-100 text-blue-700' },
  ordered:        { label: 'Ordered',        color: 'bg-purple-100 text-purple-700' },
  received:       { label: 'Goods Received', color: 'bg-green-100 text-green-700' },
  cancelled:      { label: 'Cancelled',      color: 'bg-red-100 text-red-700' },
};

export interface InventoryItem {
  id: number;
  name: string;
  category: string;
  sku: string;
  unit: string;
  current_stock: number;
  min_level: number;
  max_level: number;
  last_price: number;
}

export interface PurchaseOrder {
  id: number;
  po_number: string;
  vendor_id: number;
  vendor_name: string;
  status: string;
  items: { item_id: number; item_name: string; quantity: number; unit_price: number }[];
  total: number;
  expected_date: string;
  created_at: string;
  notes?: string;
}

export interface Vendor {
  id: number;
  name: string;
  contact_person: string;
  phone: string;
  email: string;
  items_supplied: string[];
  payment_terms: string;
  total_orders: number;
  last_order_date: string;
}

// Mock data
export const MOCK_ITEMS: InventoryItem[] = [
  { id: 1, name: 'Basmati Rice', category: 'food', sku: 'FD-001', unit: 'kg', current_stock: 120, min_level: 50, max_level: 200, last_price: 85 },
  { id: 2, name: 'Cooking Oil', category: 'food', sku: 'FD-002', unit: 'litre', current_stock: 45, min_level: 30, max_level: 100, last_price: 160 },
  { id: 3, name: 'Chicken', category: 'food', sku: 'FD-003', unit: 'kg', current_stock: 25, min_level: 20, max_level: 80, last_price: 220 },
  { id: 4, name: 'Toilet Paper', category: 'housekeeping', sku: 'HK-001', unit: 'pack', current_stock: 8, min_level: 20, max_level: 60, last_price: 450 },
  { id: 5, name: 'Hand Soap', category: 'housekeeping', sku: 'HK-002', unit: 'bottle', current_stock: 35, min_level: 15, max_level: 50, last_price: 120 },
  { id: 6, name: 'Bath Towels', category: 'linen', sku: 'LN-001', unit: 'piece', current_stock: 90, min_level: 40, max_level: 150, last_price: 350 },
  { id: 7, name: 'Mineral Water', category: 'beverages', sku: 'BV-001', unit: 'bottle', current_stock: 200, min_level: 100, max_level: 500, last_price: 15 },
  { id: 8, name: 'Coffee Beans', category: 'beverages', sku: 'BV-002', unit: 'kg', current_stock: 12, min_level: 10, max_level: 30, last_price: 800 },
  { id: 9, name: 'Light Bulbs', category: 'maintenance', sku: 'MT-001', unit: 'piece', current_stock: 5, min_level: 10, max_level: 50, last_price: 60 },
  { id: 10, name: 'Printer Paper', category: 'office', sku: 'OF-001', unit: 'pack', current_stock: 15, min_level: 5, max_level: 30, last_price: 380 },
  { id: 11, name: 'Onions', category: 'food', sku: 'FD-004', unit: 'kg', current_stock: 40, min_level: 25, max_level: 100, last_price: 35 },
  { id: 12, name: 'Bed Sheets', category: 'linen', sku: 'LN-002', unit: 'piece', current_stock: 60, min_level: 30, max_level: 120, last_price: 650 },
];

export const MOCK_VENDORS: Vendor[] = [
  { id: 1, name: 'Fresh Farm Supplies', contact_person: 'Ramesh Kumar', phone: '+91 98765 11111', email: 'ramesh@freshfarm.in', items_supplied: ['Basmati Rice', 'Onions', 'Chicken'], payment_terms: 'Net 30', total_orders: 48, last_order_date: '2026-03-28' },
  { id: 2, name: 'CleanPro Industries', contact_person: 'Anita Sharma', phone: '+91 98765 22222', email: 'anita@cleanpro.in', items_supplied: ['Toilet Paper', 'Hand Soap', 'Floor Cleaner'], payment_terms: 'Net 15', total_orders: 24, last_order_date: '2026-03-25' },
  { id: 3, name: 'Premium Linens Co', contact_person: 'Suresh Patel', phone: '+91 98765 33333', email: 'suresh@premiumlinens.in', items_supplied: ['Bath Towels', 'Bed Sheets', 'Pillow Covers'], payment_terms: 'Net 45', total_orders: 12, last_order_date: '2026-03-15' },
  { id: 4, name: 'Metro Beverages', contact_person: 'Priya Singh', phone: '+91 98765 44444', email: 'priya@metrobev.in', items_supplied: ['Mineral Water', 'Coffee Beans', 'Tea Leaves'], payment_terms: 'COD', total_orders: 36, last_order_date: '2026-03-30' },
  { id: 5, name: 'BuildMart Hardware', contact_person: 'Vijay Reddy', phone: '+91 98765 55555', email: 'vijay@buildmart.in', items_supplied: ['Light Bulbs', 'Batteries', 'Electrical Tape'], payment_terms: 'Net 30', total_orders: 8, last_order_date: '2026-02-20' },
];

export const MOCK_POS: PurchaseOrder[] = [
  { id: 1, po_number: 'PO-2026-001', vendor_id: 1, vendor_name: 'Fresh Farm Supplies', status: 'received', items: [{ item_id: 1, item_name: 'Basmati Rice', quantity: 50, unit_price: 85 }, { item_id: 3, item_name: 'Chicken', quantity: 30, unit_price: 220 }], total: 10850, expected_date: '2026-03-28', created_at: '2026-03-25', notes: 'Weekly restock' },
  { id: 2, po_number: 'PO-2026-002', vendor_id: 2, vendor_name: 'CleanPro Industries', status: 'ordered', items: [{ item_id: 4, item_name: 'Toilet Paper', quantity: 30, unit_price: 450 }], total: 13500, expected_date: '2026-04-05', created_at: '2026-03-30' },
  { id: 3, po_number: 'PO-2026-003', vendor_id: 4, vendor_name: 'Metro Beverages', status: 'pending', items: [{ item_id: 7, item_name: 'Mineral Water', quantity: 200, unit_price: 15 }, { item_id: 8, item_name: 'Coffee Beans', quantity: 10, unit_price: 800 }], total: 11000, expected_date: '2026-04-08', created_at: '2026-04-01' },
  { id: 4, po_number: 'PO-2026-004', vendor_id: 5, vendor_name: 'BuildMart Hardware', status: 'draft', items: [{ item_id: 9, item_name: 'Light Bulbs', quantity: 50, unit_price: 60 }], total: 3000, expected_date: '', created_at: '2026-04-02' },
  { id: 5, po_number: 'PO-2026-005', vendor_id: 3, vendor_name: 'Premium Linens Co', status: 'approved', items: [{ item_id: 6, item_name: 'Bath Towels', quantity: 40, unit_price: 350 }, { item_id: 12, item_name: 'Bed Sheets', quantity: 20, unit_price: 650 }], total: 27000, expected_date: '2026-04-10', created_at: '2026-03-31' },
];
