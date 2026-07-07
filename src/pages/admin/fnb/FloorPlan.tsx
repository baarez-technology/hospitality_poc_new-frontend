/**
 * Floor Plan — Visual table layout editor.
 * Sits inside AdminLayout (header/breadcrumbs provided by layout).
 * Toolbar on left, canvas center, properties right.
 * Add table via side drawer (not modal).
 */
import { useState, useRef, useCallback, useMemo } from 'react';
import { Plus, Circle, Square, RectangleHorizontal, Users, RefreshCw, ChevronDown, Eye, Move, Settings } from 'lucide-react';
import { useFloorPlan } from '../../../hooks/admin/useFloorPlan';
import { TABLE_SHAPES } from '../../../utils/fnb';
import { Drawer } from '../../../components/ui2/Drawer';
import { Input } from '../../../components/ui2/Input';
import { Button } from '../../../components/ui2/Button';
import { Badge } from '../../../components/ui2/Badge';
import type { Table } from '../../../api/services/fnb.service';

const STATUS: Record<string, { label: string; fill: string; stroke: string; badge: 'success' | 'danger' | 'warning' | 'neutral' }> = {
  available: { label: 'Available', fill: '#ecfdf5', stroke: '#86efac', badge: 'success' },
  occupied:  { label: 'Occupied',  fill: '#fef2f2', stroke: '#fca5a5', badge: 'danger' },
  reserved:  { label: 'Reserved',  fill: '#fffbeb', stroke: '#fcd34d', badge: 'warning' },
  cleaning:  { label: 'Cleaning',  fill: '#f5f5f5', stroke: '#d4d4d4', badge: 'neutral' },
};

const SHAPE_ICONS = { round: Circle, square: Square, rectangle: RectangleHorizontal };

// ── Draggable Table ─────────────────────────────────────────────

function DraggableTable({ table, isSelected, onClick, onDragEnd }: {
  table: Table; isSelected: boolean; onClick: () => void; onDragEnd: (x: number, y: number) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState(false);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const cfg = STATUS[table.status] || STATUS.available;

  const w = table.shape === 'rectangle' ? (table.capacity >= 8 ? 120 : 100) : (table.capacity >= 6 ? 76 : 64);
  const h = table.shape === 'rectangle' ? 60 : w;
  const radius = table.shape === 'round' ? '50%' : '10px';

  const handleDown = (e: React.PointerEvent) => {
    if (!ref.current) return;
    const r = ref.current.getBoundingClientRect();
    setOffset({ x: e.clientX - r.left, y: e.clientY - r.top });
    setDragging(true);
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };
  const handleMove = (e: React.PointerEvent) => {
    if (!dragging || !ref.current?.parentElement) return;
    const p = ref.current.parentElement.getBoundingClientRect();
    ref.current.style.left = `${Math.max(0, Math.min(e.clientX - p.left - offset.x, p.width - w))}px`;
    ref.current.style.top = `${Math.max(0, Math.min(e.clientY - p.top - offset.y, p.height - h))}px`;
  };
  const handleUp = () => {
    if (!dragging || !ref.current) return;
    setDragging(false);
    onDragEnd(parseInt(ref.current.style.left) || table.x, parseInt(ref.current.style.top) || table.y);
  };

  return (
    <div ref={ref} onPointerDown={handleDown} onPointerMove={handleMove} onPointerUp={handleUp}
      onClick={e => { e.stopPropagation(); onClick(); }}
      className={`absolute cursor-grab active:cursor-grabbing select-none flex flex-col items-center justify-center ${
        isSelected ? 'z-20' : 'z-10'
      } ${dragging ? 'z-30 opacity-90' : ''}`}
      style={{
        left: table.x, top: table.y, width: w, height: h, borderRadius: radius,
        backgroundColor: cfg.fill, border: `2px solid ${cfg.stroke}`,
        boxShadow: isSelected ? '0 0 0 3px #A5786540, 0 4px 12px rgba(0,0,0,0.08)' : dragging ? '0 8px 20px rgba(0,0,0,0.12)' : '0 1px 2px rgba(0,0,0,0.04)',
        touchAction: 'none', transition: dragging ? 'none' : 'box-shadow 0.15s',
      }}>
      <span className="text-[11px] font-bold text-neutral-800 leading-none">T{table.number}</span>
      <span className="text-[8px] text-neutral-500 mt-0.5">{table.capacity}s</span>
    </div>
  );
}

// ── Main ─────────────────────────────────────────────────────────

export default function FloorPlan() {
  const { outlets, selectedOutletId, setSelectedOutletId, tables, loading, addTable, moveTable, refresh } = useFloorPlan();
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [mode, setMode] = useState<'edit' | 'live'>('edit');
  const [addDrawerOpen, setAddDrawerOpen] = useState(false);
  const [outletDd, setOutletDd] = useState(false);
  const [newTable, setNewTable] = useState({ number: '', capacity: '4', shape: 'round' as Table['shape'] });

  const selectedTable = tables.find(t => t.id === selectedId) || null;
  const currentOutlet = outlets.find(o => o.id === selectedOutletId);
  const handleDragEnd = useCallback((id: number, x: number, y: number) => moveTable(id, x, y), [moveTable]);

  const handleAdd = async () => {
    if (!newTable.number.trim()) return;
    await addTable({ number: newTable.number, capacity: parseInt(newTable.capacity) || 4, shape: newTable.shape, x: 60 + Math.random() * 300, y: 40 + Math.random() * 200, status: 'available' });
    setNewTable({ number: '', capacity: '4', shape: 'round' });
    setAddDrawerOpen(false);
  };

  const counts = useMemo(() => {
    const c = { available: 0, occupied: 0, reserved: 0, cleaning: 0 };
    tables.forEach(t => { if (c[t.status as keyof typeof c] !== undefined) c[t.status as keyof typeof c]++; });
    return c;
  }, [tables]);

  return (
    <div className="min-h-screen bg-[#F9F7F7]">
      <div className="px-4 sm:px-6 lg:px-10 py-4 sm:py-6 space-y-4">

        {/* ── Top bar (no page title — admin breadcrumbs handle that) ── */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3">
            {/* Outlet */}
            <div className="relative z-30">
              <button onClick={() => setOutletDd(!outletDd)}
                className="h-9 pl-3 pr-8 rounded-lg border border-neutral-200 bg-white text-[13px] font-medium text-neutral-700 hover:bg-neutral-50 flex items-center whitespace-nowrap relative">
                {currentOutlet?.name || 'Outlet'}
                <ChevronDown className={`w-3.5 h-3.5 text-neutral-400 absolute right-2.5 top-1/2 -translate-y-1/2 transition-transform ${outletDd ? 'rotate-180' : ''}`} />
              </button>
              {outletDd && (
                <>
                  <div className="fixed inset-0 z-20" onClick={() => setOutletDd(false)} />
                  <div className="absolute left-0 top-full mt-1 w-52 bg-white rounded-[10px] border border-neutral-200 shadow-lg z-30 py-1">
                    {outlets.map(o => (
                      <button key={o.id} onClick={() => { setSelectedOutletId(o.id); setOutletDd(false); }}
                        className={`w-full text-left px-4 py-2 text-[13px] ${selectedOutletId === o.id ? 'bg-terra-50 text-terra-700 font-semibold' : 'text-neutral-700 hover:bg-neutral-50'}`}>
                        {o.name}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Mode toggle */}
            <div className="flex items-center gap-1">
              <button onClick={() => setMode('edit')}
                className={`h-9 px-3 rounded-lg text-[12px] font-medium flex items-center gap-1.5 transition-colors ${
                  mode === 'edit' ? 'bg-terra-50 text-terra-700 border border-terra-200' : 'text-neutral-500 hover:bg-neutral-100 border border-transparent'
                }`}>
                <Move className="w-3.5 h-3.5" /> Edit
              </button>
              <button onClick={() => setMode('live')}
                className={`h-9 px-3 rounded-lg text-[12px] font-medium flex items-center gap-1.5 transition-colors ${
                  mode === 'live' ? 'bg-terra-50 text-terra-700 border border-terra-200' : 'text-neutral-500 hover:bg-neutral-100 border border-transparent'
                }`}>
                <Eye className="w-3.5 h-3.5" /> Live
              </button>
            </div>

            {/* Status dots */}
            <div className="hidden md:flex items-center gap-3 text-[11px]">
              {Object.entries(STATUS).map(([key, cfg]) => (
                <span key={key} className="flex items-center gap-1 text-neutral-500">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: cfg.stroke }} />
                  <span className="font-medium text-neutral-700">{counts[key as keyof typeof counts]}</span>
                </span>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button onClick={refresh} disabled={loading}
              className="h-9 w-9 rounded-lg border border-neutral-200 bg-white flex items-center justify-center text-neutral-500 hover:bg-neutral-50 disabled:opacity-50">
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button onClick={() => setAddDrawerOpen(true)}
              className="h-9 px-4 rounded-lg bg-terra-600 text-white text-[13px] font-semibold flex items-center gap-1.5 hover:bg-terra-700">
              <Plus className="w-4 h-4" /> Add Table
            </button>
          </div>
        </div>

        {/* ── Canvas Card ── */}
        <div className="bg-white rounded-[10px] border border-neutral-200 overflow-hidden">
          <div className="relative h-[calc(100vh-220px)] min-h-[400px]"
            style={{ background: 'repeating-conic-gradient(#fafaf9 0% 25%, #f5f5f4 0% 50%) 0 0 / 20px 20px' }}
            onClick={() => setSelectedId(null)}>

            {tables.map(table => (
              <DraggableTable key={table.id} table={table} isSelected={selectedId === table.id}
                onClick={() => setSelectedId(table.id)}
                onDragEnd={(x, y) => handleDragEnd(table.id, x, y)} />
            ))}

            {tables.length === 0 && !loading && (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-neutral-400">
                <Square className="w-10 h-10 mb-3 opacity-20" />
                <p className="text-[13px] font-medium text-neutral-500">No tables yet</p>
                <p className="text-[11px] text-neutral-400">Click "Add Table" to start</p>
              </div>
            )}

            {/* Selected table info — floating card at bottom of canvas */}
            {selectedTable && (
              <div className="absolute bottom-4 left-4 bg-white rounded-[10px] border border-neutral-200 shadow-lg p-4 w-[260px] z-20">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-[14px] font-semibold text-neutral-900">T{selectedTable.number}</p>
                    <p className="text-[11px] text-neutral-400">{selectedTable.capacity} seats · {selectedTable.shape}</p>
                  </div>
                  <Badge variant={STATUS[selectedTable.status]?.badge || 'neutral'} size="sm" dot
                    dotColor={selectedTable.status === 'available' ? 'emerald' : selectedTable.status === 'occupied' ? 'red' : selectedTable.status === 'reserved' ? 'amber' : 'gray'}>
                    {STATUS[selectedTable.status]?.label}
                  </Badge>
                </div>
                {selectedTable.current_order_id && (
                  <div className="p-2 bg-amber-50 border border-amber-200 rounded-lg text-[11px] text-amber-700">
                    Active order #{selectedTable.current_order_id}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Add Table Drawer (not modal) ── */}
      <Drawer
        isOpen={addDrawerOpen}
        onClose={() => setAddDrawerOpen(false)}
        title="Add Table"
        subtitle="Add a new table to the floor plan"
        maxWidth="max-w-sm"
        footer={
          <div className="flex gap-3">
            <Button variant="outline-neutral" onClick={() => setAddDrawerOpen(false)} className="flex-1">Cancel</Button>
            <Button variant="primary" onClick={handleAdd} disabled={!newTable.number.trim()} className="flex-1">Add Table</Button>
          </div>
        }
      >
        <div className="space-y-5">
          <div>
            <label className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider block mb-1.5">Table Number <span className="text-red-500">*</span></label>
            <Input value={newTable.number} onChange={e => setNewTable(f => ({ ...f, number: e.target.value }))} placeholder="e.g. 1, A1, VIP1" size="md" />
          </div>
          <div>
            <label className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider block mb-1.5">Capacity</label>
            <Input type="number" value={newTable.capacity} onChange={e => setNewTable(f => ({ ...f, capacity: e.target.value }))} placeholder="4" size="md" />
          </div>
          <div>
            <label className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider block mb-1.5">Shape</label>
            <div className="flex gap-2">
              {TABLE_SHAPES.map(s => {
                const Icon = SHAPE_ICONS[s.value as keyof typeof SHAPE_ICONS] || Square;
                return (
                  <button key={s.value} onClick={() => setNewTable(f => ({ ...f, shape: s.value as Table['shape'] }))}
                    className={`flex-1 h-10 rounded-lg text-[12px] font-medium border flex items-center justify-center gap-1.5 transition-colors ${
                      newTable.shape === s.value ? 'border-terra-300 bg-terra-50 text-terra-700' : 'border-neutral-200 text-neutral-500 hover:bg-neutral-50'
                    }`}>
                    <Icon className="w-4 h-4" /> {s.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </Drawer>
    </div>
  );
}
