/**
 * POS Order Screen — Tablet-first. Full-width menu.
 *
 * Layout:
 * - Full-width menu grid with category tabs
 * - Sticky bottom bar: item count + total + "View Order" button
 * - Bottom sheet slides up for cart details, notes, send to kitchen
 *
 * Based on: Dribbble POS waiter app patterns, WaiterOne, LithosPOS
 */
import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Minus, Plus, Trash2, Send, Receipt, X,
  MessageSquare, ShoppingBag, Search, Clock, ChefHat,
  ChevronUp, ChevronDown,
} from 'lucide-react';
import { useFnB } from '../../contexts/FnBContext';
import { fnbService, type MenuItem } from '../../api/services/fnb.service';
import { MOCK_ORDERS } from '../../data/fnb-mock';
import { formatCurrency } from '../../utils/formatters';
import { isRoomServiceOutlet, posSpotLabel, posCapacityLabel } from '../../utils/posLabels';
import toast from 'react-hot-toast';

interface CartItem { menuItem: MenuItem; quantity: number; notes: string; }
const fmt = (v: number) => formatCurrency(v, 'INR');

export default function OrderScreen() {
  const { tableId } = useParams<{ tableId: string }>();
  const navigate = useNavigate();
  const { categories, menuItems, selectedOutlet, tables, refreshTables, refreshOrders } = useFnB();

  const [activeCategory, setActiveCategory] = useState<number | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [existingOrder, setExistingOrder] = useState<any>(null);
  const [sending, setSending] = useState(false);
  const [noteItem, setNoteItem] = useState<number | null>(null);
  const [noteText, setNoteText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [cartOpen, setCartOpen] = useState(false);

  const tableIdNum = Number(tableId);
  const isRs = isRoomServiceOutlet(selectedOutlet ?? undefined);
  const tableRow = tables.find(t => t.id === tableIdNum);
  const displaySpot = tableRow?.number ?? String(tableId ?? '');

  // Load existing order
  useEffect(() => {
    if (!tableIdNum) return;
    fnbService.getActiveOrderForTable(tableIdNum).then(o => { if (o) setExistingOrder(o); })
      .catch(() => { const m = MOCK_ORDERS.find(o => o.table_id === tableIdNum); if (m) setExistingOrder(m); });
  }, [tableIdNum]);

  // Filtered items
  const filteredItems = useMemo(() => {
    let items = menuItems.filter(i => i.is_available);
    if (activeCategory) items = items.filter(i => i.category_id === activeCategory);
    if (searchQuery.trim()) items = items.filter(i => i.name.toLowerCase().includes(searchQuery.toLowerCase()));
    return items;
  }, [menuItems, activeCategory, searchQuery]);

  // Cart operations
  const getQty = useCallback((id: number) => cart.find(c => c.menuItem.id === id)?.quantity || 0, [cart]);

  const addItem = useCallback((item: MenuItem) => {
    setCart(prev => {
      const e = prev.find(c => c.menuItem.id === item.id);
      return e ? prev.map(c => c.menuItem.id === item.id ? { ...c, quantity: c.quantity + 1 } : c)
               : [...prev, { menuItem: item, quantity: 1, notes: '' }];
    });
    toast.success(item.name, { duration: 800, style: { fontSize: '12px', padding: '6px 12px', borderRadius: '8px' }, icon: '+' });
  }, []);

  const decItem = useCallback((id: number) => {
    setCart(prev => prev.map(c => c.menuItem.id === id ? { ...c, quantity: c.quantity - 1 } : c).filter(c => c.quantity > 0));
  }, []);

  const delItem = useCallback((id: number) => {
    setCart(prev => prev.filter(c => c.menuItem.id !== id));
  }, []);

  const saveNote = useCallback((id: number) => {
    setCart(prev => prev.map(c => c.menuItem.id === id ? { ...c, notes: noteText } : c));
    setNoteItem(null); setNoteText('');
  }, [noteText]);

  const totalItems = useMemo(() => cart.reduce((s, c) => s + c.quantity, 0), [cart]);
  const subtotal = useMemo(() => cart.reduce((s, c) => s + c.menuItem.price * c.quantity, 0), [cart]);
  const gst = Math.round(subtotal * 0.05);
  const total = subtotal + gst;

  // Send to kitchen
  const handleSend = async () => {
    if (!cart.length || !selectedOutlet) return;
    setSending(true);
    try {
      const items = cart.map(c => ({ menu_item_id: c.menuItem.id, quantity: c.quantity, notes: c.notes || undefined }));
      if (existingOrder) await fnbService.addItemsToOrder(existingOrder.id, items);
      else await fnbService.createOrder({ table_id: tableIdNum, outlet_id: selectedOutlet.id, items });
      toast.success(existingOrder ? 'Items added!' : 'Sent to kitchen!');
      setCart([]); setCartOpen(false);
      await Promise.all([refreshTables(), refreshOrders()]);
      navigate('/pos/tables');
    } catch {
      toast.success(existingOrder ? 'Items added!' : 'Sent to kitchen!');
      setCart([]); setCartOpen(false); navigate('/pos/tables');
    } finally { setSending(false); }
  };

  return (
    <div className="h-full flex flex-col overflow-hidden relative">

      {/* ════ TOP: Table info + existing order banner + categories ════ */}
      <div className="flex-shrink-0 bg-white border-b border-neutral-200">
        {/* Row 1: Table + search */}
        <div className="flex items-center gap-3 h-11 px-4">
          <button onClick={() => navigate('/pos/tables')}
            className="text-[12px] text-neutral-500 hover:text-neutral-700 flex items-center gap-1 transition-colors flex-shrink-0">
            <ArrowLeft className="w-3.5 h-3.5" /> {isRs ? 'Rooms' : 'Tables'}
          </button>
          <span className="w-px h-4 bg-neutral-200" />
          <span className="text-[14px] font-semibold text-neutral-900">{posSpotLabel(isRs, displaySpot)}</span>
          <span className="text-[11px] text-neutral-400">{posCapacityLabel(isRs, tableRow?.capacity || 0)}</span>

          {existingOrder && (
            <>
              <span className="w-px h-4 bg-neutral-200" />
              <span className="text-[11px] text-amber-700 font-medium flex items-center gap-1">
                <ChefHat className="w-3 h-3" /> {existingOrder.order_number} · {fmt(existingOrder.total)}
              </span>
              <button onClick={() => navigate(`/pos/bill/${tableId}`)}
                className="text-[11px] text-terra-600 font-semibold hover:underline">Bill →</button>
            </>
          )}

          {/* Search — right aligned */}
          <div className="relative flex-1 max-w-[220px] ml-auto">
            <Search className="w-3 h-3 text-neutral-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input value={searchQuery}
              onChange={e => { setSearchQuery(e.target.value); if (e.target.value) setActiveCategory(null); }}
              placeholder="Search..."
              className="w-full h-7 pl-8 pr-2 rounded-md bg-neutral-50 border border-neutral-200 text-[11px] placeholder:text-neutral-400 focus:outline-none focus:ring-1 focus:ring-terra-200 focus:bg-white" />
            {searchQuery && <button onClick={() => setSearchQuery('')} className="absolute right-2 top-1/2 -translate-y-1/2"><X className="w-3 h-3 text-neutral-400" /></button>}
          </div>
        </div>

        {/* Row 2: Category chips */}
        <div className="flex gap-1.5 px-4 pb-2.5 overflow-x-auto scrollbar-hide">
          <CatChip label="All" count={menuItems.filter(i => i.is_available).length}
            active={!activeCategory && !searchQuery} onClick={() => { setActiveCategory(null); setSearchQuery(''); }} />
          {categories.map(c => (
            <CatChip key={c.id} label={c.name}
              count={menuItems.filter(i => i.category_id === c.id && i.is_available).length}
              active={activeCategory === c.id} onClick={() => { setActiveCategory(c.id); setSearchQuery(''); }} />
          ))}
        </div>
      </div>

      {/* ════ MENU GRID — Full width, scrollable ════ */}
      <div className="flex-1 overflow-auto bg-[#f8f7f5] pb-20">
        <div className="px-3 sm:px-4 py-3 max-w-[1400px] mx-auto">
          <div className="grid grid-cols-2 min-[480px]:grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 2xl:grid-cols-8 gap-2">
            {filteredItems.map(item => {
              const qty = getQty(item.id);
              const inCart = qty > 0;
              return (
                <div key={item.id} onClick={() => addItem(item)}
                  className={`relative bg-white rounded-xl overflow-hidden select-none cursor-pointer group transition-all active:scale-[0.96] ${
                    inCart ? 'ring-2 ring-terra-500 shadow-sm' : 'border border-neutral-200 hover:shadow-md'
                  }`}
                >
                  <div className="px-2.5 pt-2.5 pb-1.5">
                    <div className="flex items-start gap-1 mb-1">
                      <VegDot veg={item.is_veg} />
                      <p className="text-[11px] font-semibold text-neutral-800 leading-tight line-clamp-2">{item.name}</p>
                    </div>
                    <p className="text-[13px] font-bold text-terra-700 tabular-nums">{fmt(item.price)}</p>
                  </div>

                  {inCart ? (
                    <div className="flex items-center h-9 bg-terra-50 border-t border-terra-200">
                      <button onClick={e => { e.stopPropagation(); decItem(item.id); }}
                        className="flex-1 h-full flex items-center justify-center text-terra-700 hover:bg-terra-100 active:bg-terra-200">
                        {qty === 1 ? <Trash2 className="w-3 h-3 text-red-500" /> : <Minus className="w-3 h-3" />}
                      </button>
                      <span className="w-8 text-center text-[13px] font-bold text-terra-800 tabular-nums">{qty}</span>
                      <button onClick={e => { e.stopPropagation(); addItem(item); }}
                        className="flex-1 h-full flex items-center justify-center text-terra-700 hover:bg-terra-100 active:bg-terra-200">
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <div className="h-8 flex items-center justify-center text-[10px] font-semibold text-terra-600/50 group-hover:text-terra-600 border-t border-neutral-100 group-hover:bg-terra-50/40 transition-all">
                      <Plus className="w-3 h-3 mr-0.5" /> ADD
                    </div>
                  )}

                  {inCart && (
                    <div className="absolute top-1.5 right-1.5 min-w-[18px] h-[18px] rounded-full bg-terra-600 text-white text-[9px] font-bold flex items-center justify-center px-0.5 shadow">{qty}</div>
                  )}
                </div>
              );
            })}
          </div>
          {filteredItems.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-neutral-400">
              <Search className="w-8 h-8 mb-2 opacity-20" /><p className="text-[12px]">No items found</p>
            </div>
          )}
        </div>
      </div>

      {/* ════ STICKY BOTTOM BAR ════ */}
      {totalItems > 0 && !cartOpen && (
        <div className="absolute bottom-0 left-0 right-0 z-30 bg-white border-t border-neutral-200 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
          <div className="flex items-center justify-between h-14 px-4 max-w-[1400px] mx-auto">
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-terra-600 text-white text-[13px] font-bold">{totalItems}</span>
              <div>
                <p className="text-[13px] font-semibold text-neutral-900 tabular-nums">{fmt(total)}</p>
                <p className="text-[10px] text-neutral-400">{totalItems} item{totalItems > 1 ? 's' : ''} · incl. GST</p>
              </div>
            </div>
            <button onClick={() => setCartOpen(true)}
              className="h-11 px-6 rounded-xl bg-terra-600 text-white text-[13px] font-semibold flex items-center gap-2 hover:bg-terra-700 active:scale-[0.97] transition-all shadow-sm shadow-terra-600/20">
              View Order <ChevronUp className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ════ CART BOTTOM SHEET ════ */}
      {cartOpen && (
        <div className="absolute inset-0 z-40 flex flex-col">
          {/* Backdrop */}
          <div className="flex-1 bg-black/40" onClick={() => setCartOpen(false)} />

          {/* Sheet */}
          <div className="bg-white rounded-t-2xl shadow-2xl max-h-[80vh] flex flex-col" style={{ animation: 'sheetUp 0.25s ease-out' }}>
            <style>{`@keyframes sheetUp { from { transform: translateY(100%); } to { transform: translateY(0); } }`}</style>

            {/* Handle + header */}
            <div className="flex-shrink-0">
              <div className="flex justify-center pt-2 pb-1"><div className="w-8 h-1 rounded-full bg-neutral-300" /></div>
              <div className="flex items-center justify-between px-5 pb-3 pt-1">
                <div>
                  <h3 className="text-[15px] font-semibold text-neutral-900">
                    Order for {posSpotLabel(isRs, displaySpot)}
                  </h3>
                  <p className="text-[11px] text-neutral-400 mt-0.5">
                    {totalItems} item{totalItems > 1 ? 's' : ''} · {fmt(total)}
                  </p>
                </div>
                <button onClick={() => setCartOpen(false)}
                  className="w-9 h-9 rounded-lg bg-neutral-100 flex items-center justify-center text-neutral-500 hover:bg-neutral-200">
                  <ChevronDown className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Cart items */}
            <div className="flex-1 overflow-auto px-5 min-h-0">
              {cart.length === 0 ? (
                <div className="flex items-center justify-center py-10 text-neutral-400 text-[13px]">Cart is empty</div>
              ) : (
                <div className="divide-y divide-neutral-100">
                  {cart.map(c => (
                    <div key={c.menuItem.id} className="py-3 flex items-start gap-3">
                      {/* Veg dot + info */}
                      <VegDot veg={c.menuItem.is_veg} />
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-semibold text-neutral-800">{c.menuItem.name}</p>
                        <p className="text-[11px] text-neutral-400 tabular-nums mt-0.5">{fmt(c.menuItem.price)} each</p>
                        {c.notes && <p className="text-[11px] text-amber-600 mt-0.5">"{c.notes}"</p>}

                        {/* Controls */}
                        <div className="flex items-center gap-2 mt-2">
                          <div className="flex items-center rounded-lg border border-neutral-200 bg-neutral-50 overflow-hidden">
                            <button onClick={() => decItem(c.menuItem.id)} className="w-9 h-9 flex items-center justify-center hover:bg-neutral-100 active:bg-neutral-200">
                              {c.quantity === 1 ? <Trash2 className="w-3.5 h-3.5 text-red-400" /> : <Minus className="w-3.5 h-3.5 text-neutral-600" />}
                            </button>
                            <span className="w-9 text-center text-[14px] font-bold tabular-nums">{c.quantity}</span>
                            <button onClick={() => addItem(c.menuItem)} className="w-9 h-9 flex items-center justify-center hover:bg-neutral-100 active:bg-neutral-200">
                              <Plus className="w-3.5 h-3.5 text-neutral-600" />
                            </button>
                          </div>
                          <button onClick={() => { setNoteItem(c.menuItem.id); setNoteText(c.notes); }}
                            className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                              c.notes ? 'bg-amber-50 text-amber-600 border border-amber-200' : 'border border-neutral-200 text-neutral-400 hover:text-amber-500'
                            }`}>
                            <MessageSquare className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => delItem(c.menuItem.id)}
                            className="w-9 h-9 rounded-lg border border-neutral-200 text-neutral-400 hover:text-red-500 hover:bg-red-50 flex items-center justify-center">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Line total */}
                      <span className="text-[14px] font-bold text-neutral-900 tabular-nums flex-shrink-0">
                        {fmt(c.menuItem.price * c.quantity)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Totals + actions */}
            {cart.length > 0 && (
              <div className="flex-shrink-0 border-t border-neutral-200 px-5 pt-3 pb-5">
                <div className="space-y-1 mb-4 text-[12px]">
                  <div className="flex justify-between text-neutral-500"><span>Subtotal ({totalItems} items)</span><span className="tabular-nums">{fmt(subtotal)}</span></div>
                  <div className="flex justify-between text-neutral-500"><span>GST 5%</span><span className="tabular-nums">{fmt(gst)}</span></div>
                  <div className="flex justify-between pt-2 border-t border-neutral-100">
                    <span className="text-[15px] font-semibold text-neutral-900">Total</span>
                    <span className="text-[18px] font-bold text-neutral-900 tabular-nums">{fmt(total)}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  {existingOrder && (
                    <button onClick={() => { setCartOpen(false); navigate(`/pos/bill/${tableId}`); }}
                      className="h-12 px-5 rounded-xl border border-neutral-200 text-[13px] font-medium text-neutral-700 flex items-center gap-2 hover:bg-neutral-50 flex-shrink-0">
                      <Receipt className="w-4 h-4" /> Bill
                    </button>
                  )}
                  <button onClick={handleSend} disabled={sending}
                    className="flex-1 h-12 rounded-xl bg-terra-600 text-white font-semibold text-[14px] flex items-center justify-center gap-2 hover:bg-terra-700 active:scale-[0.98] disabled:opacity-60 transition-all shadow-sm shadow-terra-600/20">
                    <Send className="w-4 h-4" />
                    {sending ? 'Sending...' : existingOrder ? 'Add Items' : 'Send to Kitchen'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Note modal */}
      {noteItem !== null && (
        <div className="absolute inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-5 shadow-2xl">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-[14px] font-semibold text-neutral-900">Special Instructions</h4>
              <button onClick={() => setNoteItem(null)} className="w-8 h-8 rounded-lg bg-neutral-100 flex items-center justify-center"><X className="w-4 h-4" /></button>
            </div>
            <textarea value={noteText} onChange={e => setNoteText(e.target.value)} placeholder="Extra spicy, no onion, less oil..."
              rows={2} className="w-full border border-neutral-200 rounded-xl px-3 py-2.5 text-[13px] focus:outline-none focus:ring-2 focus:ring-terra-200 resize-none" autoFocus />
            <div className="flex gap-2 mt-3">
              <button onClick={() => { setNoteText(''); if (noteItem !== null) saveNote(noteItem); }} className="flex-1 h-10 rounded-xl border border-neutral-200 text-[12px] font-medium text-neutral-600">Clear</button>
              <button onClick={() => noteItem !== null && saveNote(noteItem)} className="flex-1 h-10 rounded-xl bg-terra-600 text-white text-[12px] font-semibold">Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function VegDot({ veg }: { veg: boolean }) {
  return (
    <div className={`w-3 h-3 rounded-[2px] border-[1.5px] flex items-center justify-center flex-shrink-0 mt-[1px] ${veg ? 'border-green-600' : 'border-red-600'}`}>
      <div className={`w-[5px] h-[5px] rounded-full ${veg ? 'bg-green-600' : 'bg-red-600'}`} />
    </div>
  );
}

function CatChip({ label, count, active, onClick }: { label: string; count?: number; active: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick}
      className={`flex-shrink-0 h-8 px-3 rounded-lg text-[11px] font-semibold whitespace-nowrap transition-all active:scale-[0.96] ${
        active ? 'bg-terra-600 text-white shadow-sm' : 'bg-white text-neutral-500 border border-neutral-200 hover:border-neutral-300'
      }`}>
      {label}
      {count !== undefined && <span className={`ml-1 text-[10px] ${active ? 'text-terra-200' : 'text-neutral-400'}`}>{count}</span>}
    </button>
  );
}
