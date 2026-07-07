/**
 * useFloorPlan — Works with mock data when API unavailable. No error toasts for 404s.
 */
import { useState, useCallback, useEffect } from 'react';
import { fnbService, type Table, type Outlet } from '../../api/services/fnb.service';
import { MOCK_OUTLETS, MOCK_TABLES } from '../../data/fnb-mock';
import toast from 'react-hot-toast';

export function useFloorPlan() {
  const [outlets, setOutlets] = useState<Outlet[]>([]);
  const [selectedOutletId, setSelectedOutletId] = useState<number | null>(null);
  const [tables, setTables] = useState<Table[]>([]);
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
    // Fallback to mock
    setOutlets(MOCK_OUTLETS.filter(o => o.status === 'active'));
    if (!selectedOutletId) setSelectedOutletId(MOCK_OUTLETS[0].id);
  }, [selectedOutletId]);

  const loadTables = useCallback(async () => {
    if (!selectedOutletId) return;
    setLoading(true);
    try {
      const data = await fnbService.getTables(selectedOutletId);
      if (data.length > 0) { setTables(data); setLoading(false); return; }
    } catch {}
    setTables(MOCK_TABLES);
    setLoading(false);
  }, [selectedOutletId]);

  useEffect(() => { loadOutlets(); }, [loadOutlets]);
  useEffect(() => { loadTables(); }, [loadTables]);

  // ── CRUD — work locally when API fails (no error toasts) ──

  const addTable = useCallback(async (data: Partial<Table>) => {
    if (!selectedOutletId) return;
    try {
      await fnbService.createTable({ ...data, outlet_id: selectedOutletId });
      toast.success('Table added');
      await loadTables();
    } catch {
      // API unavailable — add locally
      const newTable: Table = {
        id: Date.now(),
        number: data.number || String(tables.length + 1),
        capacity: data.capacity || 4,
        shape: data.shape || 'round',
        x: data.x || 100,
        y: data.y || 100,
        status: 'available',
        outlet_id: selectedOutletId,
      };
      setTables(prev => [...prev, newTable]);
      toast.success('Table added');
    }
  }, [selectedOutletId, loadTables, tables.length]);

  const updateTable = useCallback(async (id: number, data: Partial<Table>) => {
    try {
      await fnbService.updateTable(id, data);
      await loadTables();
    } catch {
      // Update locally
      setTables(prev => prev.map(t => t.id === id ? { ...t, ...data } : t));
    }
  }, [loadTables]);

  const moveTable = useCallback(async (id: number, x: number, y: number) => {
    // Always update locally first (optimistic) — no toast on failure
    setTables(prev => prev.map(t => t.id === id ? { ...t, x, y } : t));
    try {
      await fnbService.updateTablePosition(id, x, y);
    } catch {
      // Already updated locally — no error toast needed
    }
  }, []);

  return {
    outlets, selectedOutletId, setSelectedOutletId,
    tables, loading,
    addTable, updateTable, moveTable,
    refresh: loadTables,
  };
}
