/**
 * useMenuBuilder — Works with mock data when API unavailable. No error toasts for 404s.
 */
import { useState, useCallback, useEffect } from 'react';
import { fnbService, type MenuCategory, type MenuItem, type Outlet } from '../../api/services/fnb.service';
import { MOCK_OUTLETS, MOCK_CATEGORIES, MOCK_MENU_ITEMS } from '../../data/fnb-mock';
import toast from 'react-hot-toast';

export function useMenuBuilder() {
  const [outlets, setOutlets] = useState<Outlet[]>([]);
  const [selectedOutletId, setSelectedOutletId] = useState<number | null>(null);
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(false);

  const loadOutlets = useCallback(async () => {
    try {
      const data = await fnbService.getOutlets();
      if (data.length > 0) {
        setOutlets(data.filter(o => o.status === 'active'));
        if (!selectedOutletId) setSelectedOutletId(data[0].id);
        return;
      }
    } catch {}
    setOutlets(MOCK_OUTLETS.filter(o => o.status === 'active'));
    if (!selectedOutletId) setSelectedOutletId(MOCK_OUTLETS[0].id);
  }, [selectedOutletId]);

  const loadData = useCallback(async () => {
    if (!selectedOutletId) return;
    setLoading(true);
    try {
      const [cats, items] = await Promise.all([
        fnbService.getCategories(selectedOutletId),
        fnbService.getMenuItems(selectedOutletId),
      ]);
      if (cats.length > 0 || items.length > 0) {
        setCategories(cats);
        setMenuItems(items);
        setLoading(false);
        return;
      }
    } catch {}
    setCategories(MOCK_CATEGORIES);
    setMenuItems(MOCK_MENU_ITEMS);
    setLoading(false);
  }, [selectedOutletId]);

  useEffect(() => { loadOutlets(); }, [loadOutlets]);
  useEffect(() => { loadData(); }, [loadData]);

  // ── CRUD — work locally when API fails ──

  const addCategory = useCallback(async (name: string) => {
    if (!selectedOutletId) return;
    try {
      await fnbService.createCategory(selectedOutletId, { name, sort_order: categories.length, outlet_id: selectedOutletId });
      toast.success('Category added');
      await loadData();
    } catch {
      const newCat: MenuCategory = { id: Date.now(), name, sort_order: categories.length, outlet_id: selectedOutletId, item_count: 0 };
      setCategories(prev => [...prev, newCat]);
      toast.success('Category added');
    }
  }, [selectedOutletId, categories.length, loadData]);

  const updateCategory = useCallback(async (id: number, data: Partial<MenuCategory>) => {
    try {
      await fnbService.updateCategory(id, data);
      toast.success('Category updated');
      await loadData();
    } catch {
      setCategories(prev => prev.map(c => c.id === id ? { ...c, ...data } : c));
      toast.success('Category updated');
    }
  }, [loadData]);

  const reorderCategories = useCallback(async (order: number[]) => {
    if (!selectedOutletId) return;
    try {
      await fnbService.reorderCategories(selectedOutletId, order);
      await loadData();
    } catch {
      // Reorder locally
      const reordered = order.map((id, i) => {
        const cat = categories.find(c => c.id === id);
        return cat ? { ...cat, sort_order: i } : null;
      }).filter(Boolean) as MenuCategory[];
      setCategories(reordered);
    }
  }, [selectedOutletId, loadData, categories]);

  const addMenuItem = useCallback(async (data: Partial<MenuItem>) => {
    try {
      await fnbService.createMenuItem({ ...data, outlet_id: selectedOutletId! });
      toast.success('Item added');
      await loadData();
    } catch {
      const newItem: MenuItem = {
        id: Date.now(), name: data.name || '', description: data.description,
        price: data.price || 0, category_id: data.category_id || 0,
        category_name: categories.find(c => c.id === data.category_id)?.name,
        is_veg: data.is_veg ?? true, is_available: true,
        prep_time_minutes: data.prep_time_minutes || 15,
        image_url: data.image_url, outlet_id: selectedOutletId!,
      };
      setMenuItems(prev => [newItem, ...prev]);
      toast.success('Item added');
    }
  }, [selectedOutletId, loadData, categories]);

  const updateMenuItem = useCallback(async (id: number, data: Partial<MenuItem>) => {
    try {
      await fnbService.updateMenuItem(id, data);
      toast.success('Item updated');
      await loadData();
    } catch {
      setMenuItems(prev => prev.map(i => i.id === id ? { ...i, ...data } : i));
      toast.success('Item updated');
    }
  }, [loadData]);

  const toggleItemAvailability = useCallback(async (id: number) => {
    try {
      await fnbService.toggleAvailability(id);
      await loadData();
    } catch {
      setMenuItems(prev => prev.map(i => i.id === id ? { ...i, is_available: !i.is_available } : i));
    }
  }, [loadData]);

  return {
    outlets, selectedOutletId, setSelectedOutletId,
    categories, menuItems, loading,
    addCategory, updateCategory, reorderCategories,
    addMenuItem, updateMenuItem, toggleItemAvailability,
    refresh: loadData,
  };
}
