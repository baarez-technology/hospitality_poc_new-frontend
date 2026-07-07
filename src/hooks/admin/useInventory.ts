/**
 * useInventory — Mock data state + CRUD for all inventory pages
 */
import { useState, useMemo, useCallback } from 'react';
import {
  MOCK_ITEMS, MOCK_VENDORS, MOCK_POS,
  type InventoryItem, type PurchaseOrder, type Vendor,
} from '../../utils/inventory';
import toast from 'react-hot-toast';

export function useInventory() {
  const [items, setItems] = useState<InventoryItem[]>(MOCK_ITEMS);
  const [vendors, setVendors] = useState<Vendor[]>(MOCK_VENDORS);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>(MOCK_POS);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [poStatusFilter, setPoStatusFilter] = useState('');

  // Items
  const filteredItems = useMemo(() => {
    let filtered = items;
    if (categoryFilter) filtered = filtered.filter(i => i.category === categoryFilter);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(i => i.name.toLowerCase().includes(q) || i.sku.toLowerCase().includes(q));
    }
    return filtered;
  }, [items, categoryFilter, searchQuery]);

  const lowStockItems = useMemo(() => items.filter(i => i.current_stock <= i.min_level), [items]);
  const outOfStockItems = useMemo(() => items.filter(i => i.current_stock === 0), [items]);
  const totalStockValue = useMemo(() => items.reduce((s, i) => s + i.current_stock * i.last_price, 0), [items]);

  const addItem = useCallback((data: Partial<InventoryItem>) => {
    const newItem: InventoryItem = {
      id: Date.now(), name: data.name || '', category: data.category || 'food',
      sku: data.sku || `SKU-${Date.now()}`, unit: data.unit || 'piece',
      current_stock: data.current_stock || 0, min_level: data.min_level || 10,
      max_level: data.max_level || 100, last_price: data.last_price || 0,
    };
    setItems(prev => [newItem, ...prev]);
    toast.success('Item added');
  }, []);

  const updateItem = useCallback((id: number, data: Partial<InventoryItem>) => {
    setItems(prev => prev.map(i => i.id === id ? { ...i, ...data } : i));
    toast.success('Item updated');
  }, []);

  // Purchase Orders
  const filteredPOs = useMemo(() => {
    if (!poStatusFilter) return purchaseOrders;
    return purchaseOrders.filter(po => po.status === poStatusFilter);
  }, [purchaseOrders, poStatusFilter]);

  const addPO = useCallback((data: Partial<PurchaseOrder>) => {
    const newPO: PurchaseOrder = {
      id: Date.now(), po_number: `PO-2026-${String(purchaseOrders.length + 1).padStart(3, '0')}`,
      vendor_id: data.vendor_id || 0, vendor_name: data.vendor_name || '',
      status: 'draft', items: data.items || [], total: data.total || 0,
      expected_date: data.expected_date || '', created_at: new Date().toISOString().split('T')[0],
      notes: data.notes,
    };
    setPurchaseOrders(prev => [newPO, ...prev]);
    toast.success('Purchase order created');
  }, [purchaseOrders.length]);

  const updatePOStatus = useCallback((id: number, status: string) => {
    setPurchaseOrders(prev => prev.map(po => po.id === id ? { ...po, status } : po));
    toast.success(`PO status updated to ${status}`);
  }, []);

  // Vendors
  const addVendor = useCallback((data: Partial<Vendor>) => {
    const newVendor: Vendor = {
      id: Date.now(), name: data.name || '', contact_person: data.contact_person || '',
      phone: data.phone || '', email: data.email || '',
      items_supplied: data.items_supplied || [], payment_terms: data.payment_terms || 'Net 30',
      total_orders: 0, last_order_date: '',
    };
    setVendors(prev => [newVendor, ...prev]);
    toast.success('Vendor added');
  }, []);

  const updateVendor = useCallback((id: number, data: Partial<Vendor>) => {
    setVendors(prev => prev.map(v => v.id === id ? { ...v, ...data } : v));
    toast.success('Vendor updated');
  }, []);

  return {
    items: filteredItems, allItems: items, lowStockItems, outOfStockItems, totalStockValue,
    vendors, purchaseOrders: filteredPOs, allPOs: purchaseOrders,
    searchQuery, setSearchQuery, categoryFilter, setCategoryFilter,
    poStatusFilter, setPoStatusFilter,
    addItem, updateItem, addPO, updatePOStatus, addVendor, updateVendor,
  };
}
