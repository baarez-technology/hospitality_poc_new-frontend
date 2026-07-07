/**
 * F&B Mock Data — Used as fallback when API is unavailable
 */
import type { Outlet, MenuCategory, MenuItem, Table, Order } from '../api/services/fnb.service';

export const MOCK_OUTLETS: Outlet[] = [
  { id: 1, name: 'The Grand Restaurant', type: 'restaurant', location: 'Ground Floor', capacity: 80, operating_hours: '7:00 AM – 11:00 PM', status: 'active' },
  { id: 2, name: 'Skyline Bar', type: 'bar', location: 'Rooftop', capacity: 40, operating_hours: '5:00 PM – 1:00 AM', status: 'active' },
  { id: 3, name: 'Poolside Cafe', type: 'pool_cafe', location: 'Pool Deck', capacity: 30, operating_hours: '8:00 AM – 8:00 PM', status: 'active' },
  { id: 4, name: 'Room Service', type: 'room_service', location: 'Kitchen', capacity: 0, operating_hours: '24 Hours', status: 'active' },
];

export const MOCK_CATEGORIES: MenuCategory[] = [
  { id: 1, name: 'Starters', sort_order: 1, outlet_id: 1, item_count: 8 },
  { id: 2, name: 'Main Course', sort_order: 2, outlet_id: 1, item_count: 12 },
  { id: 3, name: 'Breads', sort_order: 3, outlet_id: 1, item_count: 6 },
  { id: 4, name: 'Desserts', sort_order: 4, outlet_id: 1, item_count: 5 },
  { id: 5, name: 'Beverages', sort_order: 5, outlet_id: 1, item_count: 10 },
  { id: 6, name: 'Soups & Salads', sort_order: 6, outlet_id: 1, item_count: 4 },
];

export const MOCK_MENU_ITEMS: MenuItem[] = [
  // Starters
  { id: 1, name: 'Paneer Tikka', description: 'Marinated cottage cheese grilled in tandoor', price: 320, category_id: 1, category_name: 'Starters', is_veg: true, is_available: true, prep_time_minutes: 15, outlet_id: 1 },
  { id: 2, name: 'Chicken Tikka', description: 'Boneless chicken marinated with spices', price: 380, category_id: 1, category_name: 'Starters', is_veg: false, is_available: true, prep_time_minutes: 18, outlet_id: 1 },
  { id: 3, name: 'Crispy Corn', description: 'Golden fried corn kernels with masala', price: 250, category_id: 1, category_name: 'Starters', is_veg: true, is_available: true, prep_time_minutes: 10, outlet_id: 1 },
  { id: 4, name: 'Fish Amritsari', description: 'Batter fried fish with ajwain', price: 420, category_id: 1, category_name: 'Starters', is_veg: false, is_available: true, prep_time_minutes: 20, outlet_id: 1 },
  { id: 5, name: 'Hara Bhara Kebab', description: 'Spinach and green pea patties', price: 280, category_id: 1, category_name: 'Starters', is_veg: true, is_available: false, prep_time_minutes: 12, outlet_id: 1 },
  // Main Course
  { id: 6, name: 'Butter Chicken', description: 'Creamy tomato-based chicken curry', price: 420, category_id: 2, category_name: 'Main Course', is_veg: false, is_available: true, prep_time_minutes: 25, outlet_id: 1 },
  { id: 7, name: 'Dal Makhani', description: 'Slow-cooked black lentils in cream', price: 280, category_id: 2, category_name: 'Main Course', is_veg: true, is_available: true, prep_time_minutes: 20, outlet_id: 1 },
  { id: 8, name: 'Paneer Butter Masala', description: 'Cottage cheese in rich tomato gravy', price: 340, category_id: 2, category_name: 'Main Course', is_veg: true, is_available: true, prep_time_minutes: 20, outlet_id: 1 },
  { id: 9, name: 'Mutton Rogan Josh', description: 'Kashmiri-style slow-cooked lamb', price: 520, category_id: 2, category_name: 'Main Course', is_veg: false, is_available: true, prep_time_minutes: 30, outlet_id: 1 },
  { id: 10, name: 'Hyderabadi Biryani', description: 'Fragrant basmati rice with spiced chicken', price: 380, category_id: 2, category_name: 'Main Course', is_veg: false, is_available: true, prep_time_minutes: 25, outlet_id: 1 },
  { id: 11, name: 'Veg Biryani', description: 'Aromatic rice with seasonal vegetables', price: 300, category_id: 2, category_name: 'Main Course', is_veg: true, is_available: true, prep_time_minutes: 22, outlet_id: 1 },
  { id: 12, name: 'Palak Paneer', description: 'Spinach curry with cottage cheese', price: 300, category_id: 2, category_name: 'Main Course', is_veg: true, is_available: true, prep_time_minutes: 18, outlet_id: 1 },
  // Breads
  { id: 13, name: 'Butter Naan', description: 'Soft leavened bread with butter', price: 60, category_id: 3, category_name: 'Breads', is_veg: true, is_available: true, prep_time_minutes: 5, outlet_id: 1 },
  { id: 14, name: 'Garlic Naan', description: 'Naan topped with garlic and coriander', price: 80, category_id: 3, category_name: 'Breads', is_veg: true, is_available: true, prep_time_minutes: 5, outlet_id: 1 },
  { id: 15, name: 'Tandoori Roti', description: 'Whole wheat bread from tandoor', price: 40, category_id: 3, category_name: 'Breads', is_veg: true, is_available: true, prep_time_minutes: 4, outlet_id: 1 },
  { id: 16, name: 'Laccha Paratha', description: 'Layered flaky flatbread', price: 70, category_id: 3, category_name: 'Breads', is_veg: true, is_available: true, prep_time_minutes: 6, outlet_id: 1 },
  // Desserts
  { id: 17, name: 'Gulab Jamun', description: 'Deep-fried milk dumplings in sugar syrup', price: 150, category_id: 4, category_name: 'Desserts', is_veg: true, is_available: true, prep_time_minutes: 5, outlet_id: 1 },
  { id: 18, name: 'Rasmalai', description: 'Soft cottage cheese patties in saffron milk', price: 180, category_id: 4, category_name: 'Desserts', is_veg: true, is_available: true, prep_time_minutes: 5, outlet_id: 1 },
  { id: 19, name: 'Chocolate Brownie', description: 'Warm brownie with vanilla ice cream', price: 220, category_id: 4, category_name: 'Desserts', is_veg: true, is_available: true, prep_time_minutes: 8, outlet_id: 1 },
  // Beverages
  { id: 20, name: 'Masala Chai', description: 'Indian spiced tea', price: 80, category_id: 5, category_name: 'Beverages', is_veg: true, is_available: true, prep_time_minutes: 5, outlet_id: 1 },
  { id: 21, name: 'Fresh Lime Soda', description: 'Sweet or salted lime soda', price: 100, category_id: 5, category_name: 'Beverages', is_veg: true, is_available: true, prep_time_minutes: 3, outlet_id: 1 },
  { id: 22, name: 'Mango Lassi', description: 'Thick yogurt shake with mango', price: 150, category_id: 5, category_name: 'Beverages', is_veg: true, is_available: true, prep_time_minutes: 4, outlet_id: 1 },
  { id: 23, name: 'Cold Coffee', description: 'Iced coffee with cream', price: 180, category_id: 5, category_name: 'Beverages', is_veg: true, is_available: true, prep_time_minutes: 5, outlet_id: 1 },
  // Soups
  { id: 24, name: 'Tomato Shorba', description: 'Indian spiced tomato soup', price: 180, category_id: 6, category_name: 'Soups & Salads', is_veg: true, is_available: true, prep_time_minutes: 10, outlet_id: 1 },
  { id: 25, name: 'Chicken Hot & Sour', description: 'Spicy and tangy chicken soup', price: 220, category_id: 6, category_name: 'Soups & Salads', is_veg: false, is_available: true, prep_time_minutes: 12, outlet_id: 1 },
];

export const MOCK_TABLES: Table[] = [
  { id: 1, number: '1', capacity: 2, shape: 'round', x: 60, y: 60, status: 'available', outlet_id: 1 },
  { id: 2, number: '2', capacity: 2, shape: 'round', x: 200, y: 60, status: 'available', outlet_id: 1 },
  { id: 3, number: '3', capacity: 4, shape: 'square', x: 340, y: 60, status: 'occupied', outlet_id: 1, current_order_id: 1 },
  { id: 4, number: '4', capacity: 4, shape: 'square', x: 480, y: 60, status: 'available', outlet_id: 1 },
  { id: 5, number: '5', capacity: 6, shape: 'rectangle', x: 60, y: 200, status: 'reserved', outlet_id: 1 },
  { id: 6, number: '6', capacity: 6, shape: 'rectangle', x: 240, y: 200, status: 'available', outlet_id: 1 },
  { id: 7, number: '7', capacity: 4, shape: 'square', x: 420, y: 200, status: 'cleaning', outlet_id: 1 },
  { id: 8, number: '8', capacity: 8, shape: 'rectangle', x: 60, y: 340, status: 'occupied', outlet_id: 1, current_order_id: 2 },
  { id: 9, number: '9', capacity: 2, shape: 'round', x: 280, y: 340, status: 'available', outlet_id: 1 },
  { id: 10, number: '10', capacity: 4, shape: 'square', x: 420, y: 340, status: 'available', outlet_id: 1 },
  { id: 11, number: '11', capacity: 2, shape: 'round', x: 560, y: 200, status: 'available', outlet_id: 1 },
  { id: 12, number: '12', capacity: 10, shape: 'rectangle', x: 140, y: 460, status: 'reserved', outlet_id: 1 },
];

/** Room service: same Table type in API — UI labels as rooms (guest room numbers) */
export const MOCK_ROOM_SERVICE_TABLES: Table[] = [
  { id: 201, number: '101', capacity: 3, shape: 'square', x: 0, y: 0, status: 'available', outlet_id: 4 },
  { id: 202, number: '102', capacity: 2, shape: 'square', x: 0, y: 0, status: 'occupied', outlet_id: 4, current_order_id: 5 },
  { id: 203, number: '305', capacity: 4, shape: 'rectangle', x: 0, y: 0, status: 'available', outlet_id: 4 },
  { id: 204, number: '412', capacity: 2, shape: 'round', x: 0, y: 0, status: 'reserved', outlet_id: 4 },
  { id: 205, number: '508', capacity: 3, shape: 'square', x: 0, y: 0, status: 'cleaning', outlet_id: 4 },
  { id: 206, number: '602', capacity: 4, shape: 'rectangle', x: 0, y: 0, status: 'available', outlet_id: 4 },
];

/** Mock tables list for fallback API — room service uses guest room numbers */
export function mockTablesForOutlet(outlet: { id: number; type: string }): Table[] {
  if (outlet.type === 'room_service') return MOCK_ROOM_SERVICE_TABLES;
  return MOCK_TABLES;
}

export function mockOrdersForOutlet(outletId: number): Order[] {
  return MOCK_ORDERS.filter(
    o => o.outlet_id === outletId && !['billed', 'cancelled'].includes(o.status)
  );
}

const now = new Date();
const fiveMinAgo = new Date(now.getTime() - 5 * 60000).toISOString();
const tenMinAgo = new Date(now.getTime() - 10 * 60000).toISOString();
const twentyMinAgo = new Date(now.getTime() - 20 * 60000).toISOString();
const thirtyMinAgo = new Date(now.getTime() - 30 * 60000).toISOString();

export const MOCK_ORDERS: Order[] = [
  {
    id: 1, order_number: 'ORD-001', table_id: 3, table_number: '3', outlet_id: 1, outlet_name: 'The Grand Restaurant',
    items: [
      { id: 1, menu_item_id: 6, name: 'Butter Chicken', quantity: 2, price: 420, status: 'preparing' },
      { id: 2, menu_item_id: 13, name: 'Butter Naan', quantity: 4, price: 60, status: 'preparing' },
      { id: 3, menu_item_id: 7, name: 'Dal Makhani', quantity: 1, price: 280, status: 'pending', notes: 'Extra butter' },
    ],
    status: 'preparing', subtotal: 1400, gst: 70, total: 1470,
    server_name: 'Rahul', created_at: tenMinAgo,
  },
  {
    id: 2, order_number: 'ORD-002', table_id: 8, table_number: '8', outlet_id: 1, outlet_name: 'The Grand Restaurant',
    items: [
      { id: 4, menu_item_id: 10, name: 'Hyderabadi Biryani', quantity: 3, price: 380, status: 'ready' },
      { id: 5, menu_item_id: 1, name: 'Paneer Tikka', quantity: 2, price: 320, status: 'ready' },
      { id: 6, menu_item_id: 22, name: 'Mango Lassi', quantity: 4, price: 150, status: 'served' },
    ],
    status: 'ready', subtotal: 2380, gst: 119, total: 2499,
    server_name: 'Priya', created_at: twentyMinAgo,
  },
  {
    id: 3, order_number: 'ORD-003', table_id: 5, table_number: '5', outlet_id: 1, outlet_name: 'The Grand Restaurant',
    items: [
      { id: 7, menu_item_id: 2, name: 'Chicken Tikka', quantity: 2, price: 380, status: 'pending' },
      { id: 8, menu_item_id: 9, name: 'Mutton Rogan Josh', quantity: 1, price: 520, status: 'pending' },
      { id: 9, menu_item_id: 14, name: 'Garlic Naan', quantity: 3, price: 80, status: 'pending' },
      { id: 10, menu_item_id: 21, name: 'Fresh Lime Soda', quantity: 2, price: 100, status: 'pending', notes: 'Sweet' },
    ],
    status: 'new', subtotal: 1920, gst: 96, total: 2016,
    server_name: 'Amit', created_at: fiveMinAgo,
  },
  {
    id: 5, order_number: 'ORD-RS-01', table_id: 202, table_number: '102', outlet_id: 4, outlet_name: 'Room Service',
    items: [
      { id: 20, menu_item_id: 6, name: 'Butter Chicken', quantity: 1, price: 420, status: 'preparing' },
      { id: 21, menu_item_id: 13, name: 'Butter Naan', quantity: 2, price: 60, status: 'pending' },
    ],
    status: 'preparing', subtotal: 540, gst: 27, total: 567,
    server_name: 'Rahul', created_at: tenMinAgo,
  },
  {
    id: 4, order_number: 'ORD-004', table_id: 12, table_number: '12', outlet_id: 1, outlet_name: 'The Grand Restaurant',
    items: [
      { id: 11, menu_item_id: 8, name: 'Paneer Butter Masala', quantity: 2, price: 340, status: 'preparing' },
      { id: 12, menu_item_id: 11, name: 'Veg Biryani', quantity: 3, price: 300, status: 'preparing' },
      { id: 13, menu_item_id: 17, name: 'Gulab Jamun', quantity: 4, price: 150, status: 'pending' },
      { id: 14, menu_item_id: 20, name: 'Masala Chai', quantity: 5, price: 80, status: 'pending' },
    ],
    status: 'preparing', subtotal: 2180, gst: 109, total: 2289,
    server_name: 'Rahul', created_at: thirtyMinAgo, notes: 'Birthday celebration - comp dessert',
  },
];
