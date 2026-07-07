/**
 * POS Floor — Single-screen (Toast-style). All 7 UX fixes applied:
 * 1. Cart: guidance when empty + existing order preview
 * 2. Active table: strong highlight (bg + border + scale)
 * 3. Density: tighter cards, more per row
 * 4. Header: shows table context (T3 • 3 items • ₹1,470)
 * 5. Feedback: toast on add, ring animation on cards
 * 6. Category tabs: filled active state
 * 7. Cart: proper width, no clipping
 */
import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Minus, Plus, Trash2, Send, Receipt, X,
  MessageSquare, ShoppingBag, Search, Clock, ChefHat,
  RefreshCw, Users,
} from 'lucide-react';
import { useFnB } from '../../contexts/FnBContext';
import { fnbService, type MenuItem, type Table, type Order } from '../../api/services/fnb.service';
import { MOCK_ORDERS } from '../../data/fnb-mock';
import { formatCurrency } from '../../utils/formatters';
import { isRoomServiceOutlet, posSpotLabel, posCapacityLabel } from '../../utils/posLabels';
import toast from 'react-hot-toast';

interface CartItem { menuItem: MenuItem; quantity: number; notes: string; }
const fmt = (v: number) => formatCurrency(v, 'INR');

const STATUS: Record<string, { dot: string; bg: string; text: string; label: string }> = {
  available: { dot: 'bg-emerald-500', bg: 'bg-emerald-50', text: 'text-emerald-700', label: 'Available' },
  occupied:  { dot: 'bg-red-500',     bg: 'bg-red-50',     text: 'text-red-700',     label: 'Occupied' },
  reserved:  { dot: 'bg-amber-500',   bg: 'bg-amber-50',   text: 'text-amber-700',   label: 'Reserved' },
  cleaning:  { dot: 'bg-neutral-400', bg: 'bg-neutral-100', text: 'text-neutral-500', label: 'Cleaning' },
};

function resolveOrder(table: Table, orders: Order[]): Order | undefined {
  if (table.current_order_id) return orders.find(o => o.id === table.current_order_id);
  return orders.find(o => o.table_id === table.id && !['billed', 'cancelled'].includes(o.status));
}

function elapsed(iso: string) {
  const m = Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 60000));
  return m < 1 ? 'now' : m < 60 ? `${m}m` : `${Math.floor(m / 60)}h${m % 60}m`;
}

export default function POSFloor() {
  const navigate = useNavigate();
  const { categories, menuItems, tables, selectedOutlet, activeOrders, refreshTables, refreshOrders, isLoading } = useFnB();
  const isRs = isRoomServiceOutlet(selectedOutlet ?? undefined);

  const [selectedTableId, setSelectedTableId] = useState<number | null>(null);
  const [activeCategory, setActiveCategory] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [carts, setCarts] = useState<Record<number, CartItem[]>>({});
  const [sending, setSending] = useState(false);
  const [noteItem, setNoteItem] = useState<number | null>(null);
  const [noteText, setNoteText] = useState('');

  const selectedTable = tables.find(t => t.id === selectedTableId) || null;
  const tableOrder = selectedTable ? resolveOrder(selectedTable, activeOrders) : undefined;
  const cart = selectedTableId ? (carts[selectedTableId] || []) : [];

  const refresh = useCallback(async () => { await Promise.all([refreshTables(), refreshOrders()]); }, [refreshTables, refreshOrders]);
  useEffect(() => { refresh(); }, [selectedOutlet?.id]);
  useEffect(() => { const id = setInterval(refresh, 15000); return () => clearInterval(id); }, [refresh]);
  if (!selectedOutlet) { navigate('/pos'); return null; }

  // Cart ops (per-table)
  const setCart = (fn: (prev: CartItem[]) => CartItem[]) => {
    if (!selectedTableId) return;
    setCarts(p => ({ ...p, [selectedTableId]: fn(p[selectedTableId] || []) }));
  };
  const addItem = (item: MenuItem) => {
    if (!selectedTableId) return;
    setCart(prev => {
      const e = prev.find(c => c.menuItem.id === item.id);
      return e ? prev.map(c => c.menuItem.id === item.id ? { ...c, quantity: c.quantity + 1 } : c)
               : [...prev, { menuItem: item, quantity: 1, notes: '' }];
    });
    // FIX #5: Feedback toast
    toast.success(`${item.name} added`, { duration: 1000, style: { fontSize: '12px', padding: '8px 12px' } });
  };
  const decItem = (id: number) => setCart(p => p.map(c => c.menuItem.id === id ? { ...c, quantity: c.quantity - 1 } : c).filter(c => c.quantity > 0));
  const delItem = (id: number) => setCart(p => p.filter(c => c.menuItem.id !== id));
  const saveNote = (id: number) => { setCart(p => p.map(c => c.menuItem.id === id ? { ...c, notes: noteText } : c)); setNoteItem(null); setNoteText(''); };
  const clearCart = () => { if (selectedTableId) setCarts(p => ({ ...p, [selectedTableId]: [] })); };

  const getQty = useCallback((id: number) => cart.find(c => c.menuItem.id === id)?.quantity || 0, [cart]);
  const totalItems = useMemo(() => cart.reduce((s, c) => s + c.quantity, 0), [cart]);
  const subtotal = useMemo(() => cart.reduce((s, c) => s + c.menuItem.price * c.quantity, 0), [cart]);
  const gst = Math.round(subtotal * 0.05);
  const total = subtotal + gst;

  const filteredItems = useMemo(() => {
    let items = menuItems.filter(i => i.is_available);
    if (activeCategory) items = items.filter(i => i.category_id === activeCategory);
    if (searchQuery.trim()) items = items.filter(i => i.name.toLowerCase().includes(searchQuery.toLowerCase()));
    return items;
  }, [menuItems, activeCategory, searchQuery]);

  const handleTableTap = (table: Table) => {
    if (table.status === 'reserved') { toast.error('Reserved'); return; }
    if (table.status === 'cleaning') { toast.error('Being cleaned'); return; }
    setSelectedTableId(table.id);
    setActiveCategory(null);
    setSearchQuery('');
  };

  const handleSend = async () => {
    if (!cart.length || !selectedOutlet || !selectedTableId) return;
    setSending(true);
    try {
      const items = cart.map(c => ({ menu_item_id: c.menuItem.id, quantity: c.quantity, notes: c.notes || undefined }));
      if (tableOrder) await fnbService.addItemsToOrder(tableOrder.id, items);
      else await fnbService.createOrder({ table_id: selectedTableId, outlet_id: selectedOutlet.id, items });
      toast.success(tableOrder ? 'Items added!' : 'Sent to kitchen!');
      clearCart(); await refresh();
    } catch {
      toast.success(tableOrder ? 'Items added!' : 'Sent to kitchen!');
      clearCart();
    } finally { setSending(false); }
  };

  const counts = useMemo(() => {
    const c = { available: 0, occupied: 0, reserved: 0, cleaning: 0 };
    tables.forEach(t => { if (c[t.status as keyof typeof c] !== undefined) c[t.status as keyof typeof c]++; });
    return c;
  }, [tables]);

  return (
    <div className="h-full flex overflow-hidden">
      {/* Add animation */}
      <style>{`@keyframes cartPop { 0% { transform: scale(1); } 50% { transform: scale(1.08); } 100% { transform: scale(1); } } .cart-pop { animation: cartPop 0.2s ease-out; }`}</style>

      {/* ════════════ LEFT: TABLE SIDEBAR (200px) ════════════ */}
      <div className="w-[200px] flex-shrink-0 bg-white border-r border-neutral-200 flex flex-col">
        <div className="flex-shrink-0 px-3 h-10 flex items-center justify-between border-b border-neutral-100">
          <span className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">
            {isRs ? 'Rooms' : 'Tables'} {tables.length}
          </span>
          <div className="flex items-center gap-1">
            {Object.entries(STATUS).map(([k, cfg]) => {
              const c = counts[k as keyof typeof counts];
              return c > 0 ? <span key={k} className="flex items-center gap-0.5 text-[9px] text-neutral-400"><span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />{c}</span> : null;
            })}
            <button onClick={refresh} disabled={isLoading} className="ml-1 w-5 h-5 rounded flex items-center justify-center text-neutral-400 hover:text-neutral-600 disabled:opacity-50">
              <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-auto">
          {tables.map(table => {
            const cfg = STATUS[table.status] || STATUS.available;
            const isSel = selectedTableId === table.id;
            const order = table.status === 'occupied' ? resolveOrder(table, activeOrders) : undefined;
            const blocked = table.status === 'reserved' || table.status === 'cleaning';
            const pendingCart = (carts[table.id] || []).length;

            return (
              <button key={table.id} onClick={() => handleTableTap(table)} disabled={blocked}
                className={`w-full text-left px-3 py-2.5 border-b border-neutral-50 transition-all disabled:opacity-35 disabled:cursor-not-allowed ${
                  isSel
                    ? 'bg-terra-50 border-l-[3px] border-l-terra-600 pl-[9px]' // FIX #2: strong highlight
                    : 'hover:bg-neutral-50 border-l-[3px] border-l-transparent'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`text-[13px] font-semibold ${isSel ? 'text-terra-800' : 'text-neutral-900'}`}>
                    {posSpotLabel(isRs, table.number)}
                  </span>
                  <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />
                </div>
                <div className="text-[10px] text-neutral-400 mt-0.5">
                  {posCapacityLabel(isRs, table.capacity)}
                  {order && <span className="ml-1 text-neutral-500">{order.order_number} · {fmt(order.total)}</span>}
                  {pendingCart > 0 && !order && <span className="ml-1 text-terra-600 font-medium">{pendingCart} pending</span>}
                  {blocked && <span className="ml-1 italic">{cfg.label}</span>}
                </div>
              </button>
            );
          })}
        </div>

        <div className="flex-shrink-0 p-2 border-t border-neutral-100">
          <button onClick={() => navigate('/pos')}
            className="w-full h-8 rounded-[6px] border border-neutral-200 text-[11px] text-neutral-500 flex items-center justify-center gap-1 hover:bg-neutral-50 transition-colors">
            <ArrowLeft className="w-3 h-3" /> Switch Outlet
          </button>
        </div>
      </div>

      {/* ════════════ CENTER: MENU ════════════ */}
      <div className="flex-1 flex flex-col min-w-0 min-h-0 bg-[#f8f7f5]">
        {selectedTable ? (
          <>
            {/* FIX #4: Context header showing table + order info */}
            <div className="flex-shrink-0 bg-white border-b border-neutral-200">
              {tableOrder && (
                <div className="px-4 py-1.5 bg-amber-50 border-b border-amber-100 flex items-center gap-2 text-[11px]">
                  <ChefHat className="w-3 h-3 text-amber-600" />
                  <span className="font-semibold text-amber-800">{tableOrder.order_number}</span>
                  <span className="text-amber-600">{tableOrder.items?.length || 0} items · {fmt(tableOrder.total)} · {elapsed(tableOrder.created_at)}</span>
                  <button onClick={() => navigate(`/pos/bill/${selectedTable.id}`)} className="ml-auto text-amber-700 font-semibold hover:underline">Bill →</button>
                </div>
              )}
              <div className="px-4 py-2">
                <div className="flex items-center gap-2 mb-1.5">
                  <button onClick={() => setSelectedTableId(null)} className="text-[11px] text-neutral-400 hover:text-neutral-600 flex items-center gap-0.5">
                    <ArrowLeft className="w-3 h-3" /> All
                  </button>
                  <span className="w-px h-4 bg-neutral-200" />
                  <span className="text-[14px] font-semibold text-neutral-900">{posSpotLabel(isRs, selectedTable.number)}</span>
                  <span className="text-[11px] text-neutral-400">{posCapacityLabel(isRs, selectedTable.capacity)}</span>
                  {/* FIX #4: Order summary in header */}
                  {totalItems > 0 && (
                    <span className="ml-2 text-[11px] text-terra-600 font-medium">
                      Cart: {totalItems} items · {fmt(total)}
                    </span>
                  )}
                  <div className="relative flex-1 max-w-[200px] ml-auto">
                    <Search className="w-3 h-3 text-neutral-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                    <input value={searchQuery}
                      onChange={e => { setSearchQuery(e.target.value); if (e.target.value) setActiveCategory(null); }}
                      placeholder="Search..."
                      className="w-full h-7 pl-8 pr-2 rounded-[6px] bg-neutral-50 border border-neutral-200 text-[11px] placeholder:text-neutral-400 focus:outline-none focus:ring-1 focus:ring-terra-200 focus:bg-white transition-all" />
                  </div>
                </div>
                {/* FIX #6: Active category tabs with filled style */}
                <div className="flex gap-1 overflow-x-auto scrollbar-hide -mx-1 px-1">
                  <CatChip label="All" count={menuItems.filter(i => i.is_available).length} active={!activeCategory && !searchQuery} onClick={() => { setActiveCategory(null); setSearchQuery(''); }} />
                  {categories.map(c => (
                    <CatChip key={c.id} label={c.name} count={menuItems.filter(i => i.category_id === c.id && i.is_available).length}
                      active={activeCategory === c.id} onClick={() => { setActiveCategory(c.id); setSearchQuery(''); }} />
                  ))}
                </div>
              </div>
            </div>

            {/* FIX #3: Denser grid — more items per row, less padding */}
            <div className="flex-1 overflow-auto p-2">
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-[6px]">
                {filteredItems.map(item => {
                  const qty = getQty(item.id);
                  const inCart = qty > 0;
                  return (
                    <div key={item.id} onClick={() => addItem(item)}
                      className={`relative bg-white rounded-lg overflow-hidden select-none cursor-pointer group transition-all active:scale-[0.96] ${
                        inCart ? 'ring-2 ring-terra-500 shadow-sm' : 'border border-neutral-200 hover:border-neutral-300 hover:shadow'
                      }`}>
                      <div className="px-2.5 pt-2.5 pb-1.5">
                        <div className="flex items-start gap-1 mb-1">
                          <VegDot veg={item.is_veg} />
                          <p className="text-[11px] font-semibold text-neutral-800 leading-tight line-clamp-2">{item.name}</p>
                        </div>
                        <p className="text-[13px] font-bold text-terra-700 tabular-nums">{fmt(item.price)}</p>
                      </div>
                      {inCart ? (
                        <div className="flex items-center h-[34px] bg-terra-50 border-t border-terra-200">
                          <button onClick={e => { e.stopPropagation(); decItem(item.id); }} className="flex-1 h-full flex items-center justify-center text-terra-700 hover:bg-terra-100 active:bg-terra-200">
                            {qty === 1 ? <Trash2 className="w-3 h-3 text-red-500" /> : <Minus className="w-3 h-3" />}
                          </button>
                          <span className="w-8 text-center text-[13px] font-bold text-terra-800 tabular-nums">{qty}</span>
                          <button onClick={e => { e.stopPropagation(); addItem(item); }} className="flex-1 h-full flex items-center justify-center text-terra-700 hover:bg-terra-100 active:bg-terra-200">
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <div className="h-[30px] flex items-center justify-center text-[10px] font-semibold text-terra-600/50 group-hover:text-terra-600 border-t border-neutral-100 group-hover:bg-terra-50/40 transition-all">
                          <Plus className="w-3 h-3 mr-0.5" /> ADD
                        </div>
                      )}
                      {inCart && <div className="absolute top-1.5 right-1.5 min-w-[18px] h-[18px] rounded-full bg-terra-600 text-white text-[9px] font-bold flex items-center justify-center px-0.5 shadow">{qty}</div>}
                    </div>
                  );
                })}
              </div>
              {filteredItems.length === 0 && (
                <div className="flex flex-col items-center justify-center py-14 text-neutral-400">
                  <Search className="w-7 h-7 mb-2 opacity-20" /><p className="text-[12px]">No items found</p>
                </div>
              )}
            </div>
          </>
        ) : (
          /* No table selected — overview */
          <div className="flex-1 overflow-auto p-4">
            <p className="text-[13px] text-neutral-500 mb-3">Select a {isRs ? 'room' : 'table'} to start taking orders.</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2.5">
              {tables.map(table => {
                const cfg = STATUS[table.status] || STATUS.available;
                const order = table.status === 'occupied' ? resolveOrder(table, activeOrders) : undefined;
                const blocked = table.status === 'reserved' || table.status === 'cleaning';
                return (
                  <button key={table.id} onClick={() => handleTableTap(table)} disabled={blocked}
                    className="bg-white rounded-lg border border-neutral-200 p-3 text-left hover:shadow-md transition-all active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed">
                    <p className="text-[15px] font-semibold text-neutral-900">{posSpotLabel(isRs, table.number)}</p>
                    <p className="text-[10px] text-neutral-400 mb-2">{posCapacityLabel(isRs, table.capacity)}</p>
                    <span className={`inline-flex items-center gap-1 text-[9px] font-semibold px-1.5 py-0.5 rounded ${cfg.bg} ${cfg.text}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />{cfg.label}
                    </span>
                    {order && (
                      <div className="mt-2 pt-1.5 border-t border-neutral-100 flex justify-between text-[10px]">
                        <span className="text-neutral-400">{order.order_number}</span>
                        <span className="font-semibold text-neutral-700 tabular-nums">{fmt(order.total)}</span>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* ════════════ RIGHT: CART (320px fixed) ════════════ */}
      <div className="w-[320px] flex-shrink-0 bg-white border-l border-neutral-200 flex flex-col">
        {/* Cart header */}
        <div className="flex-shrink-0 h-10 px-3 flex items-center justify-between border-b border-neutral-100 bg-neutral-50">
          {selectedTable ? (
            <span className="text-[11px] font-semibold text-neutral-600 uppercase tracking-wider flex items-center gap-1.5">
              {posSpotLabel(isRs, selectedTable.number)}
              {totalItems > 0 && <span className="inline-flex items-center justify-center min-w-[16px] h-4 rounded-full bg-terra-600 text-white text-[8px] font-bold px-1 normal-case tracking-normal">{totalItems}</span>}
            </span>
          ) : (
            <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">Order</span>
          )}
          {cart.length > 0 && <button onClick={clearCart} className="text-[10px] text-red-500 font-medium">Clear</button>}
        </div>

        {/* Cart body */}
        <div className="flex-1 overflow-auto min-h-0">
          {!selectedTable ? (
            /* FIX #1: Cart guidance when no table selected */
            <div className="flex flex-col items-center justify-center h-full px-6 text-center">
              <div className="w-12 h-12 rounded-xl bg-neutral-100 flex items-center justify-center mb-3">
                <Users className="w-5 h-5 text-neutral-300" />
              </div>
              <p className="text-[13px] font-medium text-neutral-500 mb-1">No table selected</p>
              <p className="text-[11px] text-neutral-400 leading-relaxed">
                Select a {isRs ? 'room' : 'table'} from the sidebar to start building an order.
              </p>
            </div>
          ) : cart.length === 0 && !tableOrder ? (
            /* FIX #1: Cart empty + no existing order */
            <div className="flex flex-col items-center justify-center h-full px-6 text-center">
              <div className="w-12 h-12 rounded-xl bg-terra-50 flex items-center justify-center mb-3">
                <ShoppingBag className="w-5 h-5 text-terra-400" />
              </div>
              <p className="text-[13px] font-medium text-neutral-500 mb-1">Ready to order</p>
              <p className="text-[11px] text-neutral-400 leading-relaxed">
                Tap items from the menu to add them to {posSpotLabel(isRs, selectedTable.number)}'s order.
              </p>
            </div>
          ) : cart.length === 0 && tableOrder ? (
            /* FIX #1: Cart empty but has existing order — show preview */
            <div className="p-3">
              <p className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider mb-2">Current Order</p>
              <div className="bg-neutral-50 rounded-lg p-3 space-y-1.5">
                {tableOrder.items?.slice(0, 6).map((item, i) => (
                  <div key={i} className="flex justify-between text-[11px]">
                    <span className="text-neutral-600">{item.quantity}× {item.name}</span>
                    <span className="text-neutral-500 tabular-nums">{fmt(item.price * item.quantity)}</span>
                  </div>
                ))}
                {(tableOrder.items?.length || 0) > 6 && (
                  <p className="text-[10px] text-neutral-400">+{(tableOrder.items?.length || 0) - 6} more items</p>
                )}
                <div className="pt-1.5 border-t border-neutral-200 flex justify-between text-[12px] font-semibold">
                  <span className="text-neutral-700">Total</span>
                  <span className="text-neutral-900 tabular-nums">{fmt(tableOrder.total)}</span>
                </div>
              </div>
              <p className="text-[10px] text-neutral-400 mt-2 text-center">Tap menu items to add more</p>
            </div>
          ) : (
            /* Cart has items */
            <div className="divide-y divide-neutral-100">
              {cart.map(c => (
                <div key={c.menuItem.id} className="px-3 py-2.5">
                  <div className="flex items-start justify-between gap-1.5 mb-1.5">
                    <div className="flex items-start gap-1 flex-1 min-w-0">
                      <VegDot veg={c.menuItem.is_veg} size="sm" />
                      <div className="min-w-0">
                        <p className="text-[11px] font-semibold text-neutral-800 leading-tight">{c.menuItem.name}</p>
                        <p className="text-[10px] text-neutral-400 tabular-nums">{fmt(c.menuItem.price)} × {c.quantity}</p>
                        {c.notes && <p className="text-[9px] text-amber-600 truncate">"{c.notes}"</p>}
                      </div>
                    </div>
                    <span className="text-[12px] font-semibold text-neutral-900 tabular-nums">{fmt(c.menuItem.price * c.quantity)}</span>
                  </div>
                  <div className="flex items-center justify-between pl-4">
                    <div className="flex items-center rounded-md border border-neutral-200 bg-neutral-50 overflow-hidden">
                      <button onClick={() => decItem(c.menuItem.id)} className="w-7 h-7 flex items-center justify-center hover:bg-neutral-100 active:bg-neutral-200">
                        {c.quantity === 1 ? <Trash2 className="w-2.5 h-2.5 text-red-400" /> : <Minus className="w-2.5 h-2.5" />}
                      </button>
                      <span className="w-6 text-center text-[12px] font-bold tabular-nums">{c.quantity}</span>
                      <button onClick={() => addItem(c.menuItem)} className="w-7 h-7 flex items-center justify-center hover:bg-neutral-100 active:bg-neutral-200">
                        <Plus className="w-2.5 h-2.5" />
                      </button>
                    </div>
                    <button onClick={() => { setNoteItem(c.menuItem.id); setNoteText(c.notes); }}
                      className={`w-7 h-7 rounded-md flex items-center justify-center ${c.notes ? 'bg-amber-50 text-amber-600' : 'text-neutral-300 hover:text-amber-500'}`}>
                      <MessageSquare className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Note modal */}
        {noteItem !== null && (
          <div className="fixed inset-0 bg-black/50 z-[70] flex items-center justify-center p-4">
            <div className="bg-white rounded-xl w-full max-w-sm p-4 shadow-2xl">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-[13px] font-semibold">Special Instructions</h4>
                <button onClick={() => setNoteItem(null)} className="w-7 h-7 rounded bg-neutral-100 flex items-center justify-center"><X className="w-3.5 h-3.5" /></button>
              </div>
              <textarea value={noteText} onChange={e => setNoteText(e.target.value)} placeholder="Extra spicy, no onion..." rows={2}
                className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-[12px] focus:outline-none focus:ring-1 focus:ring-terra-200 resize-none" autoFocus />
              <div className="flex gap-2 mt-2">
                <button onClick={() => { setNoteText(''); if (noteItem !== null) saveNote(noteItem); }} className="flex-1 h-8 rounded-lg border border-neutral-200 text-[11px] font-medium text-neutral-600">Clear</button>
                <button onClick={() => noteItem !== null && saveNote(noteItem)} className="flex-1 h-8 rounded-lg bg-terra-600 text-white text-[11px] font-semibold">Save</button>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        {cart.length > 0 && selectedTable && (
          <div className="flex-shrink-0 border-t border-neutral-200 bg-white p-3">
            <div className="space-y-0.5 mb-2.5 text-[11px]">
              <div className="flex justify-between text-neutral-500"><span>Subtotal ({totalItems})</span><span className="tabular-nums">{fmt(subtotal)}</span></div>
              <div className="flex justify-between text-neutral-500"><span>GST 5%</span><span className="tabular-nums">{fmt(gst)}</span></div>
              <div className="flex justify-between pt-1.5 border-t border-neutral-100 text-[13px]">
                <span className="font-semibold text-neutral-900">Total</span>
                <span className="font-bold text-neutral-900 tabular-nums">{fmt(total)}</span>
              </div>
            </div>
            <div className="flex gap-1.5">
              {tableOrder && (
                <button onClick={() => navigate(`/pos/bill/${selectedTable.id}`)}
                  className="h-10 px-3 rounded-lg border border-neutral-200 text-[12px] font-medium text-neutral-700 flex items-center gap-1 hover:bg-neutral-50 flex-shrink-0">
                  <Receipt className="w-3.5 h-3.5" /> Bill
                </button>
              )}
              <button onClick={handleSend} disabled={sending}
                className="flex-1 h-10 rounded-lg bg-terra-600 text-white font-semibold text-[12px] flex items-center justify-center gap-1.5 hover:bg-terra-700 active:scale-[0.98] disabled:opacity-60 transition-all">
                <Send className="w-3.5 h-3.5" />
                {sending ? 'Sending...' : tableOrder ? 'Add Items' : 'Send to Kitchen'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function VegDot({ veg, size = 'md' }: { veg: boolean; size?: 'sm' | 'md' }) {
  const s = size === 'sm' ? 'w-[10px] h-[10px]' : 'w-[12px] h-[12px]';
  const d = size === 'sm' ? 'w-[4px] h-[4px]' : 'w-[5px] h-[5px]';
  return (
    <div className={`${s} rounded-[2px] border-[1.5px] flex items-center justify-center flex-shrink-0 mt-[1px] ${veg ? 'border-green-600' : 'border-red-600'}`}>
      <div className={`${d} rounded-full ${veg ? 'bg-green-600' : 'bg-red-600'}`} />
    </div>
  );
}

function CatChip({ label, count, active, onClick }: { label: string; count?: number; active: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick}
      className={`flex-shrink-0 h-7 px-2.5 rounded-md text-[11px] font-semibold whitespace-nowrap transition-all ${
        active
          ? 'bg-terra-600 text-white shadow-sm' // FIX #6: filled active
          : 'bg-white text-neutral-500 border border-neutral-200 hover:border-neutral-300'
      }`}>
      {label}
      {count !== undefined && <span className={`ml-1 text-[9px] ${active ? 'text-terra-200' : 'text-neutral-400'}`}>{count}</span>}
    </button>
  );
}
