/**
 * FnB Context — Shared state for POS, Kitchen, and admin F&B pages
 */
import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import { fnbService, type Outlet, type MenuCategory, type MenuItem, type Table, type Order } from '../api/services/fnb.service';
import {
  MOCK_OUTLETS,
  MOCK_CATEGORIES,
  MOCK_MENU_ITEMS,
  mockTablesForOutlet,
  mockOrdersForOutlet,
} from '../data/fnb-mock';

interface FnBState {
  outlets: Outlet[];
  selectedOutlet: Outlet | null;
  categories: MenuCategory[];
  menuItems: MenuItem[];
  tables: Table[];
  activeOrders: Order[];
  isLoading: boolean;
}

interface FnBContextType extends FnBState {
  selectOutlet: (outlet: Outlet) => Promise<void>;
  refreshTables: () => Promise<void>;
  refreshOrders: () => Promise<void>;
  refreshMenu: (categoryId?: number) => Promise<void>;
  loadOutlets: () => Promise<void>;
}

const FnBContext = createContext<FnBContextType | null>(null);

export function FnBProvider({ children }: { children: ReactNode }) {
  const [outlets, setOutlets] = useState<Outlet[]>([]);
  const [selectedOutlet, setSelectedOutlet] = useState<Outlet | null>(null);
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [tables, setTables] = useState<Table[]>([]);
  const [activeOrders, setActiveOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadOutlets = useCallback(async () => {
    try {
      const data = await fnbService.getOutlets();
      setOutlets(data.length > 0 ? data : MOCK_OUTLETS);
    } catch (err) {
      console.error('[FnB] Using mock outlets');
      setOutlets(MOCK_OUTLETS);
    }
  }, []);

  const selectOutlet = useCallback(async (outlet: Outlet) => {
    setSelectedOutlet(outlet);
    setIsLoading(true);
    try {
      const [cats, tbls, orders] = await Promise.all([
        fnbService.getCategories(outlet.id),
        fnbService.getTables(outlet.id),
        fnbService.getOrders(outlet.id),
      ]);
      setCategories(cats);
      setTables(tbls);
      setActiveOrders(orders.filter(o => !['billed', 'cancelled'].includes(o.status)));
      // Load items for first category
      if (cats.length > 0) {
        const items = await fnbService.getMenuItems(outlet.id);
        setMenuItems(items);
      }
    } catch (err) {
      console.error('[FnB] Using mock outlet data');
      setCategories(MOCK_CATEGORIES);
      setTables(mockTablesForOutlet(outlet));
      setActiveOrders(mockOrdersForOutlet(outlet.id));
      setMenuItems(MOCK_MENU_ITEMS);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refreshTables = useCallback(async () => {
    if (!selectedOutlet) return;
    try {
      const tbls = await fnbService.getTables(selectedOutlet.id);
      setTables(tbls);
    } catch (err) {
      if (selectedOutlet) setTables(mockTablesForOutlet(selectedOutlet));
    }
  }, [selectedOutlet]);

  const refreshOrders = useCallback(async () => {
    if (!selectedOutlet) return;
    try {
      const orders = await fnbService.getOrders(selectedOutlet.id);
      setActiveOrders(orders.filter(o => !['billed', 'cancelled'].includes(o.status)));
    } catch (err) {
      if (selectedOutlet) setActiveOrders(mockOrdersForOutlet(selectedOutlet.id));
    }
  }, [selectedOutlet]);

  const refreshMenu = useCallback(async (categoryId?: number) => {
    if (!selectedOutlet) return;
    try {
      const items = await fnbService.getMenuItems(selectedOutlet.id, categoryId);
      setMenuItems(items);
    } catch (err) {
      setMenuItems(categoryId ? MOCK_MENU_ITEMS.filter(i => i.category_id === categoryId) : MOCK_MENU_ITEMS);
    }
  }, [selectedOutlet]);

  useEffect(() => {
    loadOutlets();
  }, [loadOutlets]);

  return (
    <FnBContext.Provider value={{
      outlets, selectedOutlet, categories, menuItems, tables, activeOrders, isLoading,
      selectOutlet, refreshTables, refreshOrders, refreshMenu, loadOutlets,
    }}>
      {children}
    </FnBContext.Provider>
  );
}

export function useFnB() {
  const ctx = useContext(FnBContext);
  if (!ctx) throw new Error('useFnB must be used within FnBProvider');
  return ctx;
}
